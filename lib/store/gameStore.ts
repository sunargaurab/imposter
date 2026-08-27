import { EventEmitter } from 'events';
import {
  Game,
  Player,
  Round,
  RoundPlayer,
  Vote,
  GameConfig,
  GamePhase,
  PublicGameState,
  PlayerSecretView,
  RoundResultSummary,
  FinalPlayerRanking
} from '@/types/game';
import { getCategoryById, getRandomCategory, getRandomWord } from '@/data/categories';
import {
  generateRoomCode,
  generatePlayerId,
  generateGameId,
  generateRoundId,
  generateSessionToken,
  generateAvatarSeed,
  validatePlayerName,
  validateGameConfig,
  sanitizePlayerName,
  getMaxImpostersAllowed
} from '@/lib/services/gameService';
import { assignRoundRoles, getNextGamePhase } from '@/lib/services/stateMachine';
import { computeRoundResults, computeFinalLeaderboard } from '@/lib/services/scoringEngine';

// Server-side authoritative state store
interface InternalGameState {
  game: Game;
  players: Player[];
  playerTokens: Map<string, string>; // playerId -> sessionToken
  rounds: Round[];
  roundPlayers: Map<string, RoundPlayer[]>; // roundId -> RoundPlayer[]
  votes: Map<string, Vote[]>; // roundId -> Vote[]
  roundSummaries: Map<number, RoundResultSummary>; // roundNumber -> RoundResultSummary
  usedWords: string[];
}

// Global Singleton persistence across all Next.js server workers & Fast Refresh
declare global {
  // eslint-disable-next-line no-var
  var __IMPOSTER_GAME_STORE__: Map<string, InternalGameState> | undefined;
  // eslint-disable-next-line no-var
  var __IMPOSTER_EVENT_BUS__: EventEmitter | undefined;
}

function getStore(): Map<string, InternalGameState> {
  if (!globalThis.__IMPOSTER_GAME_STORE__) {
    globalThis.__IMPOSTER_GAME_STORE__ = new Map<string, InternalGameState>();
  }
  return globalThis.__IMPOSTER_GAME_STORE__;
}

function getEventBus(): EventEmitter {
  if (!globalThis.__IMPOSTER_EVENT_BUS__) {
    globalThis.__IMPOSTER_EVENT_BUS__ = new EventEmitter();
    globalThis.__IMPOSTER_EVENT_BUS__.setMaxListeners(1000);
  }
  return globalThis.__IMPOSTER_EVENT_BUS__;
}

export const gameEvents: EventEmitter = getEventBus();

export function broadcastGameUpdate(gameIdOrCode: string) {
  try {
    const publicState = getPublicGameState(gameIdOrCode);
    if (publicState) {
      const roomUpper = publicState.game.roomCode.trim().toUpperCase();
      const bus = getEventBus();
      bus.emit(`room:${roomUpper}`, publicState);
      bus.emit(`game:${publicState.game.id}`, publicState);
    }
  } catch {
    // Ignore broadcast errors
  }
}

// Seed initial DEMO game if not existing
export function seedDemoGame(): InternalGameState {
  const store = getStore();
  const existing = Array.from(store.values()).find(g => g.game.roomCode === 'DEMO1');
  if (existing) return existing;

  const gameId = 'gm_demo_1';
  const hostId = 'p_alex';

  const secretWord = 'Taylor Swift';

  const game: Game = {
    id: gameId,
    roomCode: 'DEMO1',
    hostPlayerId: hostId,
    status: 'LOBBY',
    config: {
      maxPlayers: 6,
      imposterCount: 2,
      totalRounds: 5,
      categoryId: 'celebrities',
      categoryIds: ['celebrities'],
      discussionTimeSeconds: 300,
      normalCorrectVoteScore: 2,
      normalWrongVoteScore: 0
    },
    currentRoundNum: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const players: Player[] = [
    { id: 'p_alex', gameId, name: 'Alex', avatarSeed: 'alex-demo', isHost: true, connected: true, totalScore: 0, joinedAt: new Date().toISOString() },
    { id: 'p_sam', gameId, name: 'Sam', avatarSeed: 'sam-demo', isHost: false, connected: true, totalScore: 0, joinedAt: new Date().toISOString() },
    { id: 'p_jordan', gameId, name: 'Jordan', avatarSeed: 'jordan-demo', isHost: false, connected: true, totalScore: 0, joinedAt: new Date().toISOString() },
    { id: 'p_maya', gameId, name: 'Maya', avatarSeed: 'maya-demo', isHost: false, connected: true, totalScore: 0, joinedAt: new Date().toISOString() },
    { id: 'p_chris', gameId, name: 'Chris', avatarSeed: 'chris-demo', isHost: false, connected: true, totalScore: 0, joinedAt: new Date().toISOString() },
    { id: 'p_taylor', gameId, name: 'Taylor', avatarSeed: 'taylor-demo', isHost: false, connected: true, totalScore: 0, joinedAt: new Date().toISOString() },
  ];

  const playerTokens = new Map<string, string>();
  players.forEach(p => {
    playerTokens.set(p.id, `tok_demo_${p.name.toLowerCase()}`);
  });

  const state: InternalGameState = {
    game,
    players,
    playerTokens,
    rounds: [],
    roundPlayers: new Map(),
    votes: new Map(),
    roundSummaries: new Map(),
    usedWords: [secretWord]
  };

  store.set(gameId, state);
  store.set('DEMO1', state);
  return state;
}

// Initialize demo game immediately
seedDemoGame();

export function findGame(codeOrId: string): InternalGameState | undefined {
  if (!codeOrId) return undefined;
  const store = getStore();
  const clean = codeOrId.trim().replace(/^[#/]+/, '');
  const upper = clean.toUpperCase();

  let state = store.get(upper) || store.get(clean);
  if (!state) {
    // Fallback: search all games in store by roomCode or game id
    for (const s of store.values()) {
      if (s.game.roomCode.trim().toUpperCase() === upper || s.game.id === clean) {
        state = s;
        store.set(upper, s);
        store.set(s.game.id, s);
        break;
      }
    }
  }

  if (!state && upper === 'DEMO1') {
    state = seedDemoGame();
  }
  return state;
}

// -------------------------------------------------------------
// GAME ACTIONS
// -------------------------------------------------------------

export function createGame(
  hostName: string,
  config: Partial<GameConfig>
): { game: Game; hostPlayer: Player; sessionToken: string; error?: string } {
  const store = getStore();
  const cleanName = sanitizePlayerName(hostName);
  const nameVal = validatePlayerName(cleanName);
  if (!nameVal.valid) {
    return { game: {} as Game, hostPlayer: {} as Player, sessionToken: '', error: nameVal.error };
  }

  const maxPlayers = config.maxPlayers ?? 6;
  const maxImpostersAllowed = getMaxImpostersAllowed(maxPlayers);
  const requestedImposters = config.imposterCount ?? 1;
  const clampedImposters = Math.max(1, Math.min(requestedImposters, maxImpostersAllowed));

  const configVal = validateGameConfig({ ...config, maxPlayers, imposterCount: clampedImposters });
  if (!configVal.valid) {
    return { game: {} as Game, hostPlayer: {} as Player, sessionToken: '', error: configVal.error };
  }

  const gameId = generateGameId();
  const hostPlayerId = generatePlayerId();
  const sessionToken = generateSessionToken();

  // Find unused room code
  let roomCode = generateRoomCode();
  let attempts = 0;
  while (store.has(roomCode) && attempts < 50) {
    roomCode = generateRoomCode();
    attempts++;
  }

  const selectedCategories = (config.categoryIds && config.categoryIds.length > 0)
    ? config.categoryIds
    : [config.categoryId || 'celebrities'];

  const fullConfig: GameConfig = {
    maxPlayers,
    imposterCount: clampedImposters,
    totalRounds: config.totalRounds ?? 5,
    categoryId: selectedCategories[0],
    categoryIds: selectedCategories,
    discussionTimeSeconds: config.discussionTimeSeconds ?? 300,
    normalCorrectVoteScore: 2,
    normalWrongVoteScore: 0,
  };

  const game: Game = {
    id: gameId,
    roomCode,
    hostPlayerId,
    status: 'LOBBY',
    config: fullConfig,
    currentRoundNum: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const hostPlayer: Player = {
    id: hostPlayerId,
    gameId,
    name: cleanName,
    avatarSeed: generateAvatarSeed(cleanName),
    isHost: true,
    connected: true,
    totalScore: 0,
    joinedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString()
  };

  const playerTokens = new Map<string, string>();
  playerTokens.set(hostPlayerId, sessionToken);

  const state: InternalGameState = {
    game,
    players: [hostPlayer],
    playerTokens,
    rounds: [],
    roundPlayers: new Map(),
    votes: new Map(),
    roundSummaries: new Map(),
    usedWords: []
  };

  store.set(gameId, state);
  store.set(roomCode, state);
  store.set(roomCode.toUpperCase(), state);

  broadcastGameUpdate(roomCode);
  return { game, hostPlayer, sessionToken };
}

export function joinGame(
  roomCode: string,
  playerName: string
): { game: Game; player: Player; sessionToken: string; error?: string } {
  const state = findGame(roomCode);
  if (!state) {
    return { game: {} as Game, player: {} as Player, sessionToken: '', error: 'Game room not found. Check code or create a new game.' };
  }

  if (state.game.status !== 'LOBBY') {
    return { game: {} as Game, player: {} as Player, sessionToken: '', error: 'Game is already in progress.' };
  }

  const cleanName = sanitizePlayerName(playerName);

  // Check if player with same name already joined in lobby (allows seamless reconnect)
  const existingPlayer = state.players.find(p => p.name.toLowerCase().trim() === cleanName.toLowerCase());
  if (existingPlayer) {
    const existingToken = state.playerTokens.get(existingPlayer.id) || generateSessionToken();
    existingPlayer.connected = true;
    existingPlayer.lastActiveAt = new Date().toISOString();
    state.playerTokens.set(existingPlayer.id, existingToken);
    state.game.updatedAt = new Date().toISOString();
    broadcastGameUpdate(state.game.roomCode);
    return { game: state.game, player: existingPlayer, sessionToken: existingToken };
  }

  if (state.players.length >= state.game.config.maxPlayers) {
    return { game: {} as Game, player: {} as Player, sessionToken: '', error: 'Game lobby is full.' };
  }

  const nameVal = validatePlayerName(cleanName, state.players);
  if (!nameVal.valid) {
    return { game: {} as Game, player: {} as Player, sessionToken: '', error: nameVal.error };
  }

  const playerId = generatePlayerId();
  const sessionToken = generateSessionToken();

  const player: Player = {
    id: playerId,
    gameId: state.game.id,
    name: cleanName,
    avatarSeed: generateAvatarSeed(cleanName),
    isHost: false,
    connected: true,
    totalScore: 0,
    joinedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString()
  };

  state.players.push(player);
  state.playerTokens.set(playerId, sessionToken);
  state.game.updatedAt = new Date().toISOString();

  broadcastGameUpdate(state.game.roomCode);
  return { game: state.game, player, sessionToken };
}

export function getPlayerBySession(
  codeOrId: string,
  sessionToken: string
): { player?: Player; isHost: boolean } {
  const state = findGame(codeOrId);
  if (!state) return { isHost: false };

  for (const [pId, token] of state.playerTokens.entries()) {
    if (token === sessionToken) {
      const player = state.players.find(p => p.id === pId);
      return { player, isHost: player?.isHost ?? false };
    }
  }

  return { isHost: false };
}

// -------------------------------------------------------------
// ROUND & SECRET MANAGEMENT
// -------------------------------------------------------------

export function startRound(gameId: string, roundNumber = 1): { round: Round; error?: string } {
  const state = findGame(gameId);
  if (!state) return { round: {} as Round, error: 'Game not found.' };

  if (state.players.length < 3) {
    return { round: {} as Round, error: 'At least 3 players are required to start.' };
  }

  const categoryIds = (state.game.config.categoryIds && state.game.config.categoryIds.length > 0)
    ? state.game.config.categoryIds
    : [state.game.config.categoryId || 'celebrities'];

  const category = getRandomCategory(categoryIds);
  let secretWord = getRandomWord(category, state.usedWords);
  state.usedWords.push(secretWord);

  // For Demo 1, ensure Round 1 secret word is Taylor Swift if celebrities is chosen
  if (state.game.roomCode === 'DEMO1' && roundNumber === 1 && category.id === 'celebrities') {
    secretWord = 'Taylor Swift';
  }

  const roundId = generateRoundId();
  const round: Round = {
    id: roundId,
    gameId: state.game.id,
    roundNumber,
    categoryId: category.id,
    secretWord,
    status: 'ACTIVE',
    startedAt: new Date().toISOString()
  };

  state.rounds.push(round);
  state.game.currentRoundNum = roundNumber;
  state.game.status = 'ROUND_START';
  state.game.updatedAt = new Date().toISOString();

  // Assign roles
  let roleAssignments: { playerId: string; role: 'NORMAL' | 'IMPOSTER' }[];

  // For DEMO1 Round 1, pin Jordan and Chris as imposters for the demo scenario
  if (state.game.roomCode === 'DEMO1' && roundNumber === 1) {
    roleAssignments = state.players.map(p => ({
      playerId: p.id,
      role: (p.name === 'Jordan' || p.name === 'Chris') ? 'IMPOSTER' : 'NORMAL'
    }));
  } else {
    roleAssignments = assignRoundRoles(state.players, state.game.config.imposterCount);
  }

  const roundPlayers: RoundPlayer[] = roleAssignments.map(ra => ({
    id: 'rp_' + Math.random().toString(36).substring(2, 9),
    roundId,
    playerId: ra.playerId,
    role: ra.role,
    votesReceived: 0,
    roundScore: 0,
    caught: false
  }));

  state.roundPlayers.set(roundId, roundPlayers);
  state.votes.set(roundId, []);

  broadcastGameUpdate(state.game.roomCode);
  return { round };
}

export function getPlayerSecret(
  gameId: string,
  playerId: string,
  sessionToken: string
): PlayerSecretView | null {
  const state = findGame(gameId);
  if (!state) return null;

  // Verify session
  const storedToken = state.playerTokens.get(playerId);
  if (!storedToken || storedToken !== sessionToken) {
    return null;
  }

  const currentRound = state.rounds.find(r => r.roundNumber === state.game.currentRoundNum);
  if (!currentRound) return null;

  const roundPlayers = state.roundPlayers.get(currentRound.id);
  if (!roundPlayers) return null;

  const rp = roundPlayers.find(r => r.playerId === playerId);
  if (!rp) return null;

  const category = getCategoryById(currentRound.categoryId);

  if (rp.role === 'IMPOSTER') {
    return {
      role: 'IMPOSTER',
      imposterMessage: 'YOU ARE THE IMPOSTER',
      categoryName: category.name,
      roundNumber: currentRound.roundNumber
    };
  }

  return {
    role: 'NORMAL',
    secretWord: currentRound.secretWord,
    categoryName: category.name,
    roundNumber: currentRound.roundNumber
  };
}

// -------------------------------------------------------------
// VOTING & SCORING
// -------------------------------------------------------------

export function submitVote(
  gameId: string,
  voterId: string,
  targetPlayerId: string,
  sessionToken: string
): { success: boolean; allVoted: boolean; error?: string } {
  const state = findGame(gameId);
  if (!state) return { success: false, allVoted: false, error: 'Game not found.' };

  const storedToken = state.playerTokens.get(voterId);
  if (!storedToken || storedToken !== sessionToken) {
    return { success: false, allVoted: false, error: 'Unauthorized vote attempt.' };
  }

  if (state.game.status !== 'VOTING') {
    return { success: false, allVoted: false, error: 'Voting is not active.' };
  }

  if (voterId === targetPlayerId) {
    return { success: false, allVoted: false, error: 'You cannot vote for yourself.' };
  }

  const currentRound = state.rounds.find(r => r.roundNumber === state.game.currentRoundNum);
  if (!currentRound) return { success: false, allVoted: false, error: 'Round not found.' };

  const votesList = state.votes.get(currentRound.id) || [];
  if (votesList.some(v => v.voterId === voterId)) {
    return { success: false, allVoted: false, error: 'You have already submitted your vote.' };
  }

  const targetExists = state.players.some(p => p.id === targetPlayerId);
  if (!targetExists) {
    return { success: false, allVoted: false, error: 'Invalid vote target.' };
  }

  const vote: Vote = {
    id: 'vt_' + Math.random().toString(36).substring(2, 9),
    roundId: currentRound.id,
    voterId,
    targetPlayerId,
    createdAt: new Date().toISOString()
  };

  votesList.push(vote);
  state.votes.set(currentRound.id, votesList);
  state.game.updatedAt = new Date().toISOString();

  const allVoted = votesList.length >= state.players.length;
  if (allVoted) {
    resolveRoundResults(state, currentRound);
  }

  broadcastGameUpdate(state.game.roomCode);
  return { success: true, allVoted };
}

export function forceConcludeVoting(gameId: string): boolean {
  const state = findGame(gameId);
  if (!state || state.game.status !== 'VOTING') return false;

  const currentRound = state.rounds.find(r => r.roundNumber === state.game.currentRoundNum);
  if (!currentRound) return false;

  resolveRoundResults(state, currentRound);
  broadcastGameUpdate(state.game.roomCode);
  return true;
}

function resolveRoundResults(state: InternalGameState, currentRound: Round) {
  const roundPlayers = state.roundPlayers.get(currentRound.id) || [];
  const votesList = state.votes.get(currentRound.id) || [];
  const category = getCategoryById(currentRound.categoryId);

  const summary = computeRoundResults(
    state.players,
    roundPlayers,
    votesList,
    currentRound.secretWord,
    category.name,
    currentRound.roundNumber,
    state.game.config
  );

  summary.playerResults.forEach(pr => {
    const player = state.players.find(p => p.id === pr.playerId);
    if (player) {
      player.totalScore += pr.roundScore;
    }
    const rp = roundPlayers.find(r => r.playerId === pr.playerId);
    if (rp) {
      rp.votesReceived = pr.votesReceived;
      rp.roundScore = pr.roundScore;
      rp.caught = pr.caught;
    }
  });

  currentRound.status = 'RESOLVED';
  currentRound.endedAt = new Date().toISOString();
  state.roundSummaries.set(currentRound.roundNumber, summary);
  state.game.status = 'VOTE_RESULTS';
  state.game.updatedAt = new Date().toISOString();
}

// -------------------------------------------------------------
// PHASE ADVANCEMENT
// -------------------------------------------------------------

export function advancePhase(
  gameId: string,
  targetPhase?: GamePhase
): { game: Game; error?: string } {
  const state = findGame(gameId);
  if (!state) return { game: {} as Game, error: 'Game not found.' };

  const currentPhase = state.game.status;
  const nextPhase = targetPhase || getNextGamePhase(
    currentPhase,
    state.game.currentRoundNum,
    state.game.config.totalRounds
  );

  if (nextPhase === 'ROUND_START') {
    const nextRoundNum = currentPhase === 'LOBBY' ? 1 : state.game.currentRoundNum + 1;
    startRound(state.game.id, nextRoundNum);
    return { game: state.game };
  }

  if (nextPhase === 'VOTING') {
    const currentRound = state.rounds.find(r => r.roundNumber === state.game.currentRoundNum);
    if (currentRound) {
      currentRound.votingStartedAt = new Date().toISOString();
    }
  }

  state.game.status = nextPhase;
  state.game.updatedAt = new Date().toISOString();

  broadcastGameUpdate(state.game.roomCode);
  return { game: state.game };
}

// -------------------------------------------------------------
// RECONNECTION & HOST TRANSFER
// -------------------------------------------------------------

export function handlePlayerDisconnect(gameId: string, playerId: string) {
  const state = findGame(gameId);
  if (!state) return;

  const player = state.players.find(p => p.id === playerId);
  if (!player) return;

  player.connected = false;

  if (player.isHost) {
    const nextHost = state.players.find(p => p.id !== playerId && p.connected);
    if (nextHost) {
      player.isHost = false;
      nextHost.isHost = true;
      state.game.hostPlayerId = nextHost.id;
    }
  }
  state.game.updatedAt = new Date().toISOString();
  broadcastGameUpdate(state.game.roomCode);
}

export function handlePlayerReconnect(gameId: string, playerId: string) {
  const state = findGame(gameId);
  if (!state) return;

  const player = state.players.find(p => p.id === playerId);
  if (player) {
    const wasDisconnected = !player.connected;
    player.connected = true;
    player.lastActiveAt = new Date().toISOString();
    if (wasDisconnected) {
      state.game.updatedAt = new Date().toISOString();
      broadcastGameUpdate(state.game.roomCode);
    }
  }
}

// -------------------------------------------------------------
// PUBLIC SANITIZED GAME STATE
// -------------------------------------------------------------

export function getPublicGameState(gameIdOrCode: string): PublicGameState | null {
  const state = findGame(gameIdOrCode);
  if (!state) return null;

  const currentRound = state.rounds.find(r => r.roundNumber === state.game.currentRoundNum);
  const isRevealPhase = ['VOTE_RESULTS', 'SCORING', 'NEXT_ROUND', 'FINAL_RESULTS', 'GAME_FINISHED'].includes(state.game.status);

  const votesList = currentRound ? (state.votes.get(currentRound.id) || []) : [];
  const roundSummary = currentRound ? state.roundSummaries.get(currentRound.roundNumber) : undefined;

  let finalLeaderboard: FinalPlayerRanking[] | undefined;
  if (['FINAL_RESULTS', 'GAME_FINISHED'].includes(state.game.status)) {
    const roundHistory = Array.from(state.roundSummaries.entries()).map(([roundNum, summary]) => ({
      roundNumber: roundNum,
      summary
    }));
    finalLeaderboard = computeFinalLeaderboard(state.players, roundHistory);
  }

  return {
    game: state.game,
    players: state.players,
    currentRound: currentRound ? {
      roundNumber: currentRound.roundNumber,
      categoryId: currentRound.categoryId,
      status: currentRound.status,
      startedAt: currentRound.startedAt,
      votingStartedAt: currentRound.votingStartedAt,
      totalVotedCount: votesList.length,
      allVoted: votesList.length >= state.players.length,
      secretWord: isRevealPhase ? currentRound.secretWord : undefined,
      imposters: isRevealPhase ? roundSummary?.imposters.map(i => i.id) : undefined
    } : undefined,
    roundResult: isRevealPhase ? roundSummary : undefined,
    finalLeaderboard
  };
}
