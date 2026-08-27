import { GamePhase, Game, Player, Round, RoundPlayer, Vote } from '@/types/game';

// Allowed state transitions to ensure deterministic, server-authoritative flow
export const STATE_TRANSITIONS: Record<GamePhase, GamePhase[]> = {
  LOBBY: ['ROUND_START'],
  ROUND_START: ['SECRET_REVEAL'],
  SECRET_REVEAL: ['DISCUSSION'],
  DISCUSSION: ['VOTING'],
  VOTING: ['VOTE_RESULTS'],
  VOTE_RESULTS: ['SCORING'],
  SCORING: ['NEXT_ROUND', 'FINAL_RESULTS'],
  NEXT_ROUND: ['ROUND_START'],
  FINAL_RESULTS: ['LOBBY', 'ROUND_START', 'GAME_FINISHED'],
  GAME_FINISHED: ['LOBBY', 'ROUND_START']
};

export function isValidTransition(from: GamePhase, to: GamePhase): boolean {
  const allowed = STATE_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

export function getNextGamePhase(
  currentPhase: GamePhase,
  currentRoundNum: number,
  totalRounds: number
): GamePhase {
  switch (currentPhase) {
    case 'LOBBY':
      return 'ROUND_START';
    case 'ROUND_START':
      return 'SECRET_REVEAL';
    case 'SECRET_REVEAL':
      return 'DISCUSSION';
    case 'DISCUSSION':
      return 'VOTING';
    case 'VOTING':
      return 'VOTE_RESULTS';
    case 'VOTE_RESULTS':
      return 'SCORING';
    case 'SCORING':
      return currentRoundNum >= totalRounds ? 'FINAL_RESULTS' : 'NEXT_ROUND';
    case 'NEXT_ROUND':
      return 'ROUND_START';
    case 'FINAL_RESULTS':
      return 'GAME_FINISHED';
    case 'GAME_FINISHED':
      return 'LOBBY';
    default:
      return 'LOBBY';
  }
}

/**
 * Randomly chooses `count` distinct player IDs from player pool to be IMPOSTERS.
 */
export function assignRoundRoles(players: Player[], imposterCount: number): { playerId: string; role: 'NORMAL' | 'IMPOSTER' }[] {
  if (players.length < 3) {
    throw new Error('At least 3 players are required to assign roles.');
  }

  const effectiveImposters = Math.min(imposterCount, Math.max(1, players.length - 2));
  const shuffled = [...players].sort(() => Math.random() - 0.5);

  const imposterIds = new Set(shuffled.slice(0, effectiveImposters).map(p => p.id));

  return players.map(p => ({
    playerId: p.id,
    role: imposterIds.has(p.id) ? 'IMPOSTER' : 'NORMAL'
  }));
}
