import { describe, it, expect } from 'vitest';
import { Player, Vote } from '../types/game';

function validateVoteSubmission(
  voterId: string,
  targetPlayerId: string,
  existingVotes: Vote[],
  players: Player[],
  gamePhase: string
): { valid: boolean; error?: string } {
  if (gamePhase !== 'VOTING') {
    return { valid: false, error: 'Voting is not active.' };
  }

  if (voterId === targetPlayerId) {
    return { valid: false, error: 'You cannot vote for yourself.' };
  }

  const voterExists = players.some(p => p.id === voterId);
  const targetExists = players.some(p => p.id === targetPlayerId);

  if (!voterExists || !targetExists) {
    return { valid: false, error: 'Invalid voter or target player.' };
  }

  const alreadyVoted = existingVotes.some(v => v.voterId === voterId);
  if (alreadyVoted) {
    return { valid: false, error: 'You have already submitted your vote for this round.' };
  }

  return { valid: true };
}

describe('Voting Validation Rules', () => {
  const players: Player[] = [
    { id: 'p1', gameId: 'g1', name: 'Alex', avatarSeed: 'a1', isHost: true, connected: true, totalScore: 0, joinedAt: '2026-01-01' },
    { id: 'p2', gameId: 'g1', name: 'Sam', avatarSeed: 'a2', isHost: false, connected: true, totalScore: 0, joinedAt: '2026-01-01' },
    { id: 'p3', gameId: 'g1', name: 'Jordan', avatarSeed: 'a3', isHost: false, connected: true, totalScore: 0, joinedAt: '2026-01-01' },
  ];

  it('rejects self-voting', () => {
    const result = validateVoteSubmission('p1', 'p1', [], players, 'VOTING');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('cannot vote for yourself');
  });

  it('allows voting for a valid opponent', () => {
    const result = validateVoteSubmission('p1', 'p2', [], players, 'VOTING');
    expect(result.valid).toBe(true);
  });

  it('rejects duplicate voting by the same player', () => {
    const existingVotes: Vote[] = [
      { id: 'v1', roundId: 'r1', voterId: 'p1', targetPlayerId: 'p2', createdAt: '2026-01-01' }
    ];

    const result = validateVoteSubmission('p1', 'p3', existingVotes, players, 'VOTING');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('already submitted');
  });

  it('rejects voting outside of the VOTING phase', () => {
    const result = validateVoteSubmission('p1', 'p2', [], players, 'DISCUSSION');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Voting is not active');
  });
});
