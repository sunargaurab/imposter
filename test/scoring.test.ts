import { describe, it, expect } from 'vitest';
import {
  calculateImposterScore,
  calculateNormalPlayerScore,
  computeRoundResults,
  computeFinalLeaderboard
} from '../lib/services/scoringEngine';
import { Player, RoundPlayer, Vote } from '../types/game';

describe('Scoring Engine', () => {
  describe('Imposter Scoring Formula: max(0, totalPlayers - votesReceived)', () => {
    it('calculates 6 players with 0 votes => 6 points', () => {
      expect(calculateImposterScore(6, 0)).toBe(6);
    });

    it('calculates 6 players with 1 vote => 5 points', () => {
      expect(calculateImposterScore(6, 1)).toBe(5);
    });

    it('calculates 6 players with 2 votes => 4 points', () => {
      expect(calculateImposterScore(6, 2)).toBe(4);
    });

    it('calculates 6 players with 3 votes => 3 points', () => {
      expect(calculateImposterScore(6, 3)).toBe(3);
    });

    it('calculates 6 players with 4 votes => 2 points', () => {
      expect(calculateImposterScore(6, 4)).toBe(2);
    });

    it('calculates 6 players with 5 votes => 1 point', () => {
      expect(calculateImposterScore(6, 5)).toBe(1);
    });

    it('calculates 6 players with 6 votes => 0 points', () => {
      expect(calculateImposterScore(6, 6)).toBe(0);
    });

    it('never produces negative points if votes exceed players', () => {
      expect(calculateImposterScore(6, 7)).toBe(0);
    });
  });

  describe('Normal Player Scoring', () => {
    const imposters = ['player-jordan', 'player-chris'];

    it('awards +2 points for voting for an imposter', () => {
      expect(calculateNormalPlayerScore('player-jordan', imposters)).toBe(2);
      expect(calculateNormalPlayerScore('player-chris', imposters)).toBe(2);
    });

    it('awards 0 points for voting for an innocent normal player', () => {
      expect(calculateNormalPlayerScore('player-alex', imposters)).toBe(0);
      expect(calculateNormalPlayerScore('player-maya', imposters)).toBe(0);
    });

    it('awards 0 points when no vote target provided', () => {
      expect(calculateNormalPlayerScore(undefined, imposters)).toBe(0);
    });
  });

  describe('Full 6-Player Scenario from Prompt Section 59', () => {
    /*
      Configuration:
      Players = 6 (Alex, Sam, Jordan, Maya, Chris, Taylor)
      Imposters = 2 (Jordan, Chris)
      Rounds = 5
      Category = Celebrities
      Secret word = "Taylor Swift"

      Votes:
      Jordan -> 3 votes (from Alex, Sam, Taylor)
      Chris -> 0 votes
      Maya -> 2 votes (from Jordan, Chris)
      Alex -> 1 vote (from Maya)

      Expected Round 1 Outcome:
      Jordan (Imposter): 6 - 3 = +3
      Chris (Imposter): 6 - 0 = +6
      Alex (Normal, voted Jordan): +2
      Sam (Normal, voted Jordan): +2
      Taylor (Normal, voted Jordan): +2
      Maya (Normal, voted Alex): 0
    */

    const players: Player[] = [
      { id: 'p-alex', gameId: 'g-1', name: 'Alex', avatarSeed: 'a1', isHost: true, connected: true, totalScore: 0, joinedAt: '2026-01-01' },
      { id: 'p-sam', gameId: 'g-1', name: 'Sam', avatarSeed: 'a2', isHost: false, connected: true, totalScore: 0, joinedAt: '2026-01-01' },
      { id: 'p-jordan', gameId: 'g-1', name: 'Jordan', avatarSeed: 'a3', isHost: false, connected: true, totalScore: 0, joinedAt: '2026-01-01' },
      { id: 'p-maya', gameId: 'g-1', name: 'Maya', avatarSeed: 'a4', isHost: false, connected: true, totalScore: 0, joinedAt: '2026-01-01' },
      { id: 'p-chris', gameId: 'g-1', name: 'Chris', avatarSeed: 'a5', isHost: false, connected: true, totalScore: 0, joinedAt: '2026-01-01' },
      { id: 'p-taylor', gameId: 'g-1', name: 'Taylor', avatarSeed: 'a6', isHost: false, connected: true, totalScore: 0, joinedAt: '2026-01-01' },
    ];

    const roundPlayers: RoundPlayer[] = [
      { id: 'rp-1', roundId: 'r-1', playerId: 'p-alex', role: 'NORMAL', votesReceived: 0, roundScore: 0, caught: false },
      { id: 'rp-2', roundId: 'r-1', playerId: 'p-sam', role: 'NORMAL', votesReceived: 0, roundScore: 0, caught: false },
      { id: 'rp-3', roundId: 'r-1', playerId: 'p-jordan', role: 'IMPOSTER', votesReceived: 0, roundScore: 0, caught: false },
      { id: 'rp-4', roundId: 'r-1', playerId: 'p-maya', role: 'NORMAL', votesReceived: 0, roundScore: 0, caught: false },
      { id: 'rp-5', roundId: 'r-1', playerId: 'p-chris', role: 'IMPOSTER', votesReceived: 0, roundScore: 0, caught: false },
      { id: 'rp-6', roundId: 'r-1', playerId: 'p-taylor', role: 'NORMAL', votesReceived: 0, roundScore: 0, caught: false },
    ];

    const votes: Vote[] = [
      { id: 'v-1', roundId: 'r-1', voterId: 'p-alex', targetPlayerId: 'p-jordan', createdAt: '2026-01-01' },
      { id: 'v-2', roundId: 'r-1', voterId: 'p-sam', targetPlayerId: 'p-jordan', createdAt: '2026-01-01' },
      { id: 'v-3', roundId: 'r-1', voterId: 'p-taylor', targetPlayerId: 'p-jordan', createdAt: '2026-01-01' },
      { id: 'v-4', roundId: 'r-1', voterId: 'p-jordan', targetPlayerId: 'p-maya', createdAt: '2026-01-01' },
      { id: 'v-5', roundId: 'r-1', voterId: 'p-chris', targetPlayerId: 'p-maya', createdAt: '2026-01-01' },
      { id: 'v-6', roundId: 'r-1', voterId: 'p-maya', targetPlayerId: 'p-alex', createdAt: '2026-01-01' },
    ];

    it('computes exact scores from the scenario', () => {
      const summary = computeRoundResults(
        players,
        roundPlayers,
        votes,
        'Taylor Swift',
        'Celebrities',
        1
      );

      const jordanResult = summary.playerResults.find(p => p.playerId === 'p-jordan');
      const chrisResult = summary.playerResults.find(p => p.playerId === 'p-chris');
      const alexResult = summary.playerResults.find(p => p.playerId === 'p-alex');
      const samResult = summary.playerResults.find(p => p.playerId === 'p-sam');
      const taylorResult = summary.playerResults.find(p => p.playerId === 'p-taylor');
      const mayaResult = summary.playerResults.find(p => p.playerId === 'p-maya');

      expect(jordanResult?.roundScore).toBe(3); // 6 - 3 = 3
      expect(jordanResult?.caught).toBe(true);  // Highest votes (3)

      expect(chrisResult?.roundScore).toBe(6);  // 6 - 0 = 6
      expect(chrisResult?.caught).toBe(false); // 0 votes -> escaped

      expect(alexResult?.roundScore).toBe(2);   // Voted for Jordan
      expect(samResult?.roundScore).toBe(2);    // Voted for Jordan
      expect(taylorResult?.roundScore).toBe(2); // Voted for Jordan
      expect(mayaResult?.roundScore).toBe(0);   // Voted for Alex (innocent)
    });

    it('correctly handles ties in podium calculation', () => {
      const tiedPlayers: Player[] = [
        { id: 'p-1', gameId: 'g-1', name: 'Alex', avatarSeed: 'a1', isHost: true, connected: true, totalScore: 32, joinedAt: '2026-01-01' },
        { id: 'p-2', gameId: 'g-1', name: 'Jordan', avatarSeed: 'a2', isHost: false, connected: true, totalScore: 32, joinedAt: '2026-01-01' },
        { id: 'p-3', gameId: 'g-1', name: 'Maya', avatarSeed: 'a3', isHost: false, connected: true, totalScore: 25, joinedAt: '2026-01-01' },
      ];

      const rankings = computeFinalLeaderboard(tiedPlayers, []);
      expect(rankings[0].rank).toBe(1);
      expect(rankings[1].rank).toBe(1); // Tied for 1st
      expect(rankings[2].rank).toBe(3); // 3rd place
    });
  });
});
