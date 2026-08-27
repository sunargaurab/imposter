import { describe, it, expect } from 'vitest';
import {
  isValidTransition,
  getNextGamePhase,
  assignRoundRoles
} from '../lib/services/stateMachine';
import { Player } from '../types/game';

describe('Game State Machine Flow', () => {
  it('validates allowed transitions correctly', () => {
    expect(isValidTransition('LOBBY', 'ROUND_START')).toBe(true);
    expect(isValidTransition('ROUND_START', 'SECRET_REVEAL')).toBe(true);
    expect(isValidTransition('SECRET_REVEAL', 'DISCUSSION')).toBe(true);
    expect(isValidTransition('DISCUSSION', 'VOTING')).toBe(true);
    expect(isValidTransition('VOTING', 'VOTE_RESULTS')).toBe(true);
    expect(isValidTransition('VOTE_RESULTS', 'SCORING')).toBe(true);
    expect(isValidTransition('SCORING', 'NEXT_ROUND')).toBe(true);
    expect(isValidTransition('SCORING', 'FINAL_RESULTS')).toBe(true);
    expect(isValidTransition('NEXT_ROUND', 'ROUND_START')).toBe(true);

    // Invalid jumps
    expect(isValidTransition('LOBBY', 'VOTING')).toBe(false);
    expect(isValidTransition('SECRET_REVEAL', 'FINAL_RESULTS')).toBe(false);
    expect(isValidTransition('DISCUSSION', 'SCORING')).toBe(false);
  });

  it('progresses through a 5-round game correctly to FINAL_RESULTS on Round 5', () => {
    // Round 1 to Round 4 after SCORING should transition to NEXT_ROUND
    for (let r = 1; r < 5; r++) {
      expect(getNextGamePhase('SCORING', r, 5)).toBe('NEXT_ROUND');
    }

    // Round 5 (final round) after SCORING must transition to FINAL_RESULTS
    expect(getNextGamePhase('SCORING', 5, 5)).toBe('FINAL_RESULTS');
  });

  it('assigns the exact number of imposters requested for 6 players', () => {
    const players: Player[] = [
      { id: 'p1', gameId: 'g1', name: 'Alex', avatarSeed: 'a1', isHost: true, connected: true, totalScore: 0, joinedAt: '' },
      { id: 'p2', gameId: 'g1', name: 'Sam', avatarSeed: 'a2', isHost: false, connected: true, totalScore: 0, joinedAt: '' },
      { id: 'p3', gameId: 'g1', name: 'Jordan', avatarSeed: 'a3', isHost: false, connected: true, totalScore: 0, joinedAt: '' },
      { id: 'p4', gameId: 'g1', name: 'Maya', avatarSeed: 'a4', isHost: false, connected: true, totalScore: 0, joinedAt: '' },
      { id: 'p5', gameId: 'g1', name: 'Chris', avatarSeed: 'a5', isHost: false, connected: true, totalScore: 0, joinedAt: '' },
      { id: 'p6', gameId: 'g1', name: 'Taylor', avatarSeed: 'a6', isHost: false, connected: true, totalScore: 0, joinedAt: '' },
    ];

    const roles = assignRoundRoles(players, 2);
    const imposters = roles.filter(r => r.role === 'IMPOSTER');
    const normals = roles.filter(r => r.role === 'NORMAL');

    expect(imposters.length).toBe(2);
    expect(normals.length).toBe(4);
    expect(roles.length).toBe(6);
  });
});
