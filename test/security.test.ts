import { describe, it, expect } from 'vitest';
import {
  findGame,
  startRound,
  getPlayerSecret,
  getPublicGameState,
  submitVote,
  advancePhase
} from '../lib/store/gameStore';

describe('Security & Secret Isolation', () => {
  it('prevents secret word leakage in public game state before reveal', () => {
    const state = findGame('DEMO1');
    expect(state).toBeDefined();

    // Start Round 1
    startRound('gm_demo_1', 1);
    expect(state!.game.status).toBe('ROUND_START');

    // Advance to SECRET_REVEAL
    advancePhase('gm_demo_1', 'SECRET_REVEAL');
    let publicState = getPublicGameState('DEMO1');
    expect(publicState?.currentRound?.secretWord).toBeUndefined();
    expect(publicState?.currentRound?.imposters).toBeUndefined();

    // Advance to DISCUSSION
    advancePhase('gm_demo_1', 'DISCUSSION');
    publicState = getPublicGameState('DEMO1');
    expect(publicState?.currentRound?.secretWord).toBeUndefined();

    // Advance to VOTING
    advancePhase('gm_demo_1', 'VOTING');
    publicState = getPublicGameState('DEMO1');
    expect(publicState?.currentRound?.secretWord).toBeUndefined();
    expect(publicState?.roundResult).toBeUndefined();
  });

  it('provides secret word to normal player and alert to imposter', () => {
    // Normal player (Alex)
    const alexSecret = getPlayerSecret('gm_demo_1', 'p_alex', 'tok_demo_alex');
    expect(alexSecret).not.toBeNull();
    expect(alexSecret?.role).toBe('NORMAL');
    expect(alexSecret?.secretWord).toBe('Taylor Swift');

    // Imposter player (Jordan)
    const jordanSecret = getPlayerSecret('gm_demo_1', 'p_jordan', 'tok_demo_jordan');
    expect(jordanSecret).not.toBeNull();
    expect(jordanSecret?.role).toBe('IMPOSTER');
    expect(jordanSecret?.secretWord).toBeUndefined();
    expect(jordanSecret?.imposterMessage).toBe('YOU ARE THE IMPOSTER');
  });

  it('rejects secret retrieval with invalid session token', () => {
    const hackAttempt = getPlayerSecret('gm_demo_1', 'p_alex', 'invalid_token_123');
    expect(hackAttempt).toBeNull();
  });

  it('reveals secret and imposters ONLY after round is resolved into VOTE_RESULTS', () => {
    // Cast all votes in demo
    submitVote('gm_demo_1', 'p_alex', 'p_jordan', 'tok_demo_alex');
    submitVote('gm_demo_1', 'p_sam', 'p_jordan', 'tok_demo_sam');
    submitVote('gm_demo_1', 'p_taylor', 'p_jordan', 'tok_demo_taylor');
    submitVote('gm_demo_1', 'p_jordan', 'p_maya', 'tok_demo_jordan');
    submitVote('gm_demo_1', 'p_chris', 'p_maya', 'tok_demo_chris');
    submitVote('gm_demo_1', 'p_maya', 'p_alex', 'tok_demo_maya');

    const publicState = getPublicGameState('DEMO1');
    expect(publicState?.game.status).toBe('VOTE_RESULTS');
    expect(publicState?.currentRound?.secretWord).toBe('Taylor Swift');
    expect(publicState?.roundResult?.imposters.some(i => i.name === 'Jordan')).toBe(true);
    expect(publicState?.roundResult?.imposters.some(i => i.name === 'Chris')).toBe(true);
  });
});
