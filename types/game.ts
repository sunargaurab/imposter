export type GamePhase =
  | 'LOBBY'
  | 'ROUND_START'
  | 'SECRET_REVEAL'
  | 'DISCUSSION'
  | 'VOTING'
  | 'VOTE_RESULTS'
  | 'SCORING'
  | 'NEXT_ROUND'
  | 'FINAL_RESULTS'
  | 'GAME_FINISHED';

export type PlayerRole = 'NORMAL' | 'IMPOSTER';

export interface GameConfig {
  maxPlayers: number;             // 3 - 20
  imposterCount: number;          // dynamic, based on players (e.g. 1 or 2 for 6 players)
  totalRounds: number;            // 3, 5, 7, 10
  categoryId: string;             // e.g. 'celebrities'
  discussionTimeSeconds: number;  // default 60
  normalCorrectVoteScore: number; // default 2
  normalWrongVoteScore: number;   // default 0
}

export interface Player {
  id: string;
  gameId: string;
  name: string;
  avatarSeed: string;
  isHost: boolean;
  connected: boolean;
  totalScore: number;
  joinedAt: string;
  lastActiveAt?: string;
}

export interface Game {
  id: string;
  roomCode: string;
  hostPlayerId: string;
  status: GamePhase;
  config: GameConfig;
  currentRoundNum: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoundPlayer {
  id: string;
  roundId: string;
  playerId: string;
  role: PlayerRole;
  votesReceived: number;
  roundScore: number;
  caught: boolean;
}

export interface Round {
  id: string;
  gameId: string;
  roundNumber: number;
  categoryId: string;
  secretWord: string; // ONLY visible on server or after VOTE_RESULTS
  status: 'ACTIVE' | 'VOTING' | 'RESOLVED';
  startedAt: string;
  votingStartedAt?: string;
  endedAt?: string;
}

export interface Vote {
  id: string;
  roundId: string;
  voterId: string;
  targetPlayerId: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  accentGradient: string;
  description: string;
  words: string[];
}

// Client-safe public game state (no secrets leaked)
export interface PublicGameState {
  game: Game;
  players: Player[];
  currentRound?: {
    roundNumber: number;
    categoryId: string;
    status: string;
    startedAt: string;
    votingStartedAt?: string;
    totalVotedCount?: number;
    allVoted?: boolean;
    // Revealed ONLY during VOTE_RESULTS, SCORING, FINAL_RESULTS
    secretWord?: string;
    imposters?: string[]; // Player IDs who were imposters
  };
  roundResult?: RoundResultSummary;
  finalLeaderboard?: FinalPlayerRanking[];
}

// Authenticated private secret view for a specific player
export interface PlayerSecretView {
  role: PlayerRole;
  secretWord?: string;       // defined if role === 'NORMAL'
  imposterMessage?: string;  // defined if role === 'IMPOSTER' (e.g. "YOU ARE THE IMPOSTER")
  categoryName: string;
  roundNumber: number;
}

// Vote breakdown per player after reveal
export interface PlayerVoteResult {
  playerId: string;
  playerName: string;
  avatarSeed: string;
  role: PlayerRole;
  votesReceived: number;
  votedBy: { voterId: string; voterName: string }[];
  targetPlayerId?: string;
  targetPlayerName?: string;
  roundScore: number;
  totalScore: number;
  caught: boolean;
  scoreExplanation: string;
}

export interface RoundResultSummary {
  roundNumber: number;
  secretWord: string;
  categoryName: string;
  imposters: { id: string; name: string; avatarSeed: string; caught: boolean; votesReceived: number }[];
  voteDistribution: { playerId: string; playerName: string; avatarSeed: string; voteCount: number; isImposter: boolean }[];
  playerResults: PlayerVoteResult[];
  isTie: boolean;
}

export interface FinalPlayerRanking {
  rank: number;
  player: Player;
  totalScore: number;
  stats: {
    roundsPlayed: number;
    timesImposter: number;
    timesCaught: number;
    timesEscaped: number;
    correctVotes: number;
    incorrectVotes: number;
    totalVotesReceived: number;
    title: string; // e.g. "Master Detective", "Phantom Infiltrator", "Most Sus"
  };
}

export interface SessionInfo {
  playerId: string;
  gameId: string;
  roomCode: string;
  sessionToken: string;
}
