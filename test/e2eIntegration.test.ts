import { describe, it, expect } from 'vitest';
import {
  createGame,
  joinGame,
  startRound,
  getPlayerSecret,
  submitVote,
  advancePhase,
  getPublicGameState,
  findGame
} from '../lib/store/gameStore';

describe('Full End-to-End Multiplayer Game Flow (6 Players, 2 Imposters, 5 Rounds)', () => {
  it('executes a complete 5-round tournament matching all requirements', () => {
    // 1. Host creates game
    const hostCreation = createGame('Alex', {
      maxPlayers: 6,
      imposterCount: 2,
      totalRounds: 5,
      categoryId: 'celebrities',
      discussionTimeSeconds: 60,
      normalCorrectVoteScore: 2,
      normalWrongVoteScore: 0
    });

    expect(hostCreation.game).toBeDefined();
    expect(hostCreation.hostPlayer.name).toBe('Alex');
    expect(hostCreation.hostPlayer.isHost).toBe(true);

    const roomCode = hostCreation.game.roomCode;
    const gameId = hostCreation.game.id;
    const alex = hostCreation.hostPlayer;
    const alexToken = hostCreation.sessionToken;

    // 2. 5 players join the game
    const joinSam = joinGame(roomCode, 'Sam');
    const joinJordan = joinGame(roomCode, 'Jordan');
    const joinMaya = joinGame(roomCode, 'Maya');
    const joinChris = joinGame(roomCode, 'Chris');
    const joinTaylor = joinGame(roomCode, 'Taylor');

    expect(joinSam.player.name).toBe('Sam');
    expect(joinJordan.player.name).toBe('Jordan');
    expect(joinMaya.player.name).toBe('Maya');
    expect(joinChris.player.name).toBe('Chris');
    expect(joinTaylor.player.name).toBe('Taylor');

    const sam = joinSam.player;
    const jordan = joinJordan.player;
    const maya = joinMaya.player;
    const chris = joinChris.player;
    const taylor = joinTaylor.player;

    const samToken = joinSam.sessionToken;
    const jordanToken = joinJordan.sessionToken;
    const mayaToken = joinMaya.sessionToken;
    const chrisToken = joinChris.sessionToken;
    const taylorToken = joinTaylor.sessionToken;

    const state = findGame(roomCode);
    expect(state?.players.length).toBe(6);

    // ==========================================
    // ROUND 1: Verification of Prompt Scenario
    // ==========================================
    startRound(gameId, 1);
    expect(state?.game.status).toBe('ROUND_START');

    // Transition to SECRET_REVEAL
    advancePhase(gameId, 'SECRET_REVEAL');
    expect(state?.game.status).toBe('SECRET_REVEAL');

    // Retrieve secret views
    const alexSecret = getPlayerSecret(gameId, alex.id, alexToken);
    const samSecret = getPlayerSecret(gameId, sam.id, samToken);
    const jordanSecret = getPlayerSecret(gameId, jordan.id, jordanToken);
    const chrisSecret = getPlayerSecret(gameId, chris.id, chrisToken);

    expect(alexSecret).not.toBeNull();
    expect(samSecret).not.toBeNull();
    expect(jordanSecret).not.toBeNull();
    expect(chrisSecret).not.toBeNull();

    // Advance to DISCUSSION
    advancePhase(gameId, 'DISCUSSION');
    expect(state?.game.status).toBe('DISCUSSION');

    // Advance to VOTING
    advancePhase(gameId, 'VOTING');
    expect(state?.game.status).toBe('VOTING');

    // Public state during voting must conceal secrets and other players' votes
    const publicStateMidVoting = getPublicGameState(roomCode);
    expect(publicStateMidVoting?.currentRound?.secretWord).toBeUndefined();
    expect(publicStateMidVoting?.currentRound?.imposters).toBeUndefined();

    // Cast votes
    const v1 = submitVote(gameId, alex.id, jordan.id, alexToken);
    const v2 = submitVote(gameId, sam.id, jordan.id, samToken);
    const v3 = submitVote(gameId, taylor.id, jordan.id, taylorToken);
    const v4 = submitVote(gameId, jordan.id, maya.id, jordanToken);
    const v5 = submitVote(gameId, chris.id, maya.id, chrisToken);
    const v6 = submitVote(gameId, maya.id, alex.id, mayaToken);

    expect(v1.success).toBe(true);
    expect(v6.allVoted).toBe(true);

    // Auto transition to VOTE_RESULTS
    expect(state?.game.status).toBe('VOTE_RESULTS');
    const publicStateResolved = getPublicGameState(roomCode);
    expect(publicStateResolved?.roundResult).toBeDefined();
    expect(publicStateResolved?.currentRound?.secretWord).toBeDefined();

    // Advance to SCORING
    advancePhase(gameId, 'SCORING');
    expect(state?.game.status).toBe('SCORING');

    // Advance to NEXT_ROUND
    advancePhase(gameId);
    expect(state?.game.status).toBe('NEXT_ROUND');

    // Advance from NEXT_ROUND to ROUND_START
    advancePhase(gameId);
    expect(state?.game.status).toBe('ROUND_START');
    expect(state?.game.currentRoundNum).toBe(2);

    // ==========================================
    // SIMULATE ROUNDS 2, 3, 4, 5
    // ==========================================
    for (let r = 2; r <= 5; r++) {
      advancePhase(gameId, 'VOTING');

      // Each player votes for another player
      submitVote(gameId, alex.id, sam.id, alexToken);
      submitVote(gameId, sam.id, jordan.id, samToken);
      submitVote(gameId, jordan.id, maya.id, jordanToken);
      submitVote(gameId, maya.id, chris.id, mayaToken);
      submitVote(gameId, chris.id, taylor.id, chrisToken);
      submitVote(gameId, taylor.id, alex.id, taylorToken);

      expect(state?.game.status).toBe('VOTE_RESULTS');
      advancePhase(gameId, 'SCORING');

      if (r < 5) {
        advancePhase(gameId); // SCORING -> NEXT_ROUND
        expect(state?.game.status).toBe('NEXT_ROUND');
        advancePhase(gameId); // NEXT_ROUND -> ROUND_START
        expect(state?.game.status).toBe('ROUND_START');
        expect(state?.game.currentRoundNum).toBe(r + 1);
      } else {
        advancePhase(gameId); // Round 5 SCORING -> FINAL_RESULTS
        expect(state?.game.status).toBe('FINAL_RESULTS');
      }
    }

    // Verify Final Results & Podium
    const finalState = getPublicGameState(roomCode);
    expect(finalState?.game.status).toBe('FINAL_RESULTS');
    expect(finalState?.finalLeaderboard).toBeDefined();
    expect(finalState?.finalLeaderboard?.length).toBe(6);
    expect(finalState?.finalLeaderboard?.[0].rank).toBe(1);
  });
});
