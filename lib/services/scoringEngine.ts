import { Player, RoundPlayer, Vote, PlayerVoteResult, RoundResultSummary, FinalPlayerRanking, GameConfig } from '@/types/game';

/**
 * Calculates score for an imposter based on votes received:
 * Formula: max(0, totalPlayers - votesReceived)
 */
export function calculateImposterScore(totalPlayers: number, votesReceived: number): number {
  return Math.max(0, totalPlayers - votesReceived);
}

/**
 * Calculates score for a normal player based on whether they voted for an actual imposter.
 */
export function calculateNormalPlayerScore(
  targetPlayerId: string | undefined,
  imposterIds: string[],
  config?: Partial<GameConfig>
): number {
  const correctScore = config?.normalCorrectVoteScore ?? 2;
  const wrongScore = config?.normalWrongVoteScore ?? 0;

  if (!targetPlayerId) return wrongScore;
  return imposterIds.includes(targetPlayerId) ? correctScore : wrongScore;
}

/**
 * Computes the complete round outcome given the players, roles, and submitted votes.
 */
export function computeRoundResults(
  players: Player[],
  roundPlayers: RoundPlayer[],
  votes: Vote[],
  secretWord: string,
  categoryName: string,
  roundNumber: number,
  config?: Partial<GameConfig>
): RoundResultSummary {
  const totalPlayers = players.length;
  const imposterIds = roundPlayers
    .filter(rp => rp.role === 'IMPOSTER')
    .map(rp => rp.playerId);

  // Map of playerId -> votes received
  const voteCountMap = new Map<string, number>();
  // Map of voterId -> targetPlayerId
  const voteTargetMap = new Map<string, string>();
  // Map of targetPlayerId -> list of { voterId, voterName }
  const votedByMap = new Map<string, { voterId: string; voterName: string }[]>();

  players.forEach(p => {
    voteCountMap.set(p.id, 0);
    votedByMap.set(p.id, []);
  });

  votes.forEach(v => {
    const current = voteCountMap.get(v.targetPlayerId) || 0;
    voteCountMap.set(v.targetPlayerId, current + 1);
    voteTargetMap.set(v.voterId, v.targetPlayerId);

    const voter = players.find(p => p.id === v.voterId);
    const voterName = voter ? voter.name : 'Unknown';
    const currentVotedBy = votedByMap.get(v.targetPlayerId) || [];
    currentVotedBy.push({ voterId: v.voterId, voterName });
    votedByMap.set(v.targetPlayerId, currentVotedBy);
  });

  // Determine highest vote count
  let maxVotes = 0;
  voteCountMap.forEach((count) => {
    if (count > maxVotes) maxVotes = count;
  });

  const topVotedPlayers = Array.from(voteCountMap.entries())
    .filter(([_, count]) => count === maxVotes && maxVotes > 0)
    .map(([playerId]) => playerId);

  const isTie = topVotedPlayers.length > 1;

  // Build player results
  const playerResults: PlayerVoteResult[] = players.map(player => {
    const rp = roundPlayers.find(r => r.playerId === player.id);
    const role = rp ? rp.role : 'NORMAL';
    const votesReceived = voteCountMap.get(player.id) || 0;
    const targetPlayerId = voteTargetMap.get(player.id);
    const targetPlayer = players.find(p => p.id === targetPlayerId);
    const votedBy = votedByMap.get(player.id) || [];

    let roundScore = 0;
    let scoreExplanation = '';
    let caught = false;

    if (role === 'IMPOSTER') {
      roundScore = calculateImposterScore(totalPlayers, votesReceived);
      // Imposter is caught if they are in the top-voted list and received >= 1 vote
      caught = maxVotes > 0 && topVotedPlayers.includes(player.id);
      scoreExplanation = caught
        ? `Caught! Received ${votesReceived} vote${votesReceived === 1 ? '' : 's'} (${totalPlayers} - ${votesReceived} = +${roundScore} pts)`
        : `Escaped! Received only ${votesReceived} vote${votesReceived === 1 ? '' : 's'} (${totalPlayers} - ${votesReceived} = +${roundScore} pts)`;
    } else {
      const isCorrect = targetPlayerId ? imposterIds.includes(targetPlayerId) : false;
      roundScore = calculateNormalPlayerScore(targetPlayerId, imposterIds, config);
      if (isCorrect) {
        scoreExplanation = `Correctly voted for imposter ${targetPlayer?.name} (+${roundScore} pts)`;
      } else if (targetPlayer) {
        scoreExplanation = `Voted for innocent ${targetPlayer.name} (+0 pts)`;
      } else {
        scoreExplanation = `No vote submitted (+0 pts)`;
      }
    }

    return {
      playerId: player.id,
      playerName: player.name,
      avatarSeed: player.avatarSeed,
      role,
      votesReceived,
      votedBy,
      targetPlayerId,
      targetPlayerName: targetPlayer?.name,
      roundScore,
      totalScore: player.totalScore + roundScore,
      caught,
      scoreExplanation
    };
  });

  // Imposters list for reveal
  const imposters = roundPlayers
    .filter(rp => rp.role === 'IMPOSTER')
    .map(rp => {
      const p = players.find(player => player.id === rp.playerId)!;
      const votesReceived = voteCountMap.get(rp.playerId) || 0;
      const caught = maxVotes > 0 && topVotedPlayers.includes(rp.playerId);
      return {
        id: rp.playerId,
        name: p?.name || 'Unknown',
        avatarSeed: p?.avatarSeed || 'seed',
        caught,
        votesReceived
      };
    });

  // Vote distribution sorted descending by votes
  const voteDistribution = players
    .map(p => ({
      playerId: p.id,
      playerName: p.name,
      avatarSeed: p.avatarSeed,
      voteCount: voteCountMap.get(p.id) || 0,
      isImposter: imposterIds.includes(p.id)
    }))
    .sort((a, b) => b.voteCount - a.voteCount);

  return {
    roundNumber,
    secretWord,
    categoryName,
    imposters,
    voteDistribution,
    playerResults,
    isTie
  };
}

/**
 * Computes final leaderboard rankings and fun award statistics.
 */
export function computeFinalLeaderboard(
  players: Player[],
  roundHistory: { roundNumber: number; summary: RoundResultSummary }[]
): FinalPlayerRanking[] {
  // Aggregate stats
  const statsMap = new Map<string, {
    roundsPlayed: number;
    timesImposter: number;
    timesCaught: number;
    timesEscaped: number;
    correctVotes: number;
    incorrectVotes: number;
    totalVotesReceived: number;
    imposterPointsEarned: number;
    innocentPointsEarned: number;
  }>();

  players.forEach(p => {
    statsMap.set(p.id, {
      roundsPlayed: 0,
      timesImposter: 0,
      timesCaught: 0,
      timesEscaped: 0,
      correctVotes: 0,
      incorrectVotes: 0,
      totalVotesReceived: 0,
      imposterPointsEarned: 0,
      innocentPointsEarned: 0,
    });
  });

  roundHistory.forEach(round => {
    round.summary.playerResults.forEach(res => {
      const current = statsMap.get(res.playerId);
      if (!current) return;

      current.roundsPlayed += 1;
      current.totalVotesReceived += res.votesReceived;

      if (res.role === 'IMPOSTER') {
        current.timesImposter += 1;
        current.imposterPointsEarned += res.roundScore;
        if (res.caught) {
          current.timesCaught += 1;
        } else {
          current.timesEscaped += 1;
        }
      } else {
        current.innocentPointsEarned += res.roundScore;
        if (res.roundScore > 0) {
          current.correctVotes += 1;
        } else {
          current.incorrectVotes += 1;
        }
      }
    });
  });

  // Sort players by total score descending, then by escapes
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    const statsA = statsMap.get(a.id);
    const statsB = statsMap.get(b.id);
    if ((statsB?.timesEscaped ?? 0) !== (statsA?.timesEscaped ?? 0)) {
      return (statsB?.timesEscaped ?? 0) - (statsA?.timesEscaped ?? 0);
    }
    return (statsB?.correctVotes ?? 0) - (statsA?.correctVotes ?? 0);
  });

  // Calculate ranks with proper tie handling (e.g. 1, 1, 3)
  let currentRank = 1;
  const rankings: FinalPlayerRanking[] = [];

  for (let i = 0; i < sortedPlayers.length; i++) {
    const player = sortedPlayers[i];
    const stats = statsMap.get(player.id)!;

    if (i > 0) {
      const prevPlayer = sortedPlayers[i - 1];
      if (player.totalScore < prevPlayer.totalScore) {
        currentRank = i + 1;
      }
    }

    // Award a title based on outstanding performance
    let title = 'Master Player';
    if (stats.timesImposter > 0 && stats.timesEscaped === stats.timesImposter) {
      title = 'Shadow Chameleon';
    } else if (stats.correctVotes >= Math.ceil(stats.roundsPlayed * 0.7)) {
      title = 'Master Detective';
    } else if (stats.totalVotesReceived >= Math.ceil(stats.roundsPlayed * 2.5)) {
      title = 'Vote Magnet';
    } else if (stats.timesImposter > 0 && stats.timesCaught === 0) {
      title = 'Uncatchable Imposter';
    } else if (stats.totalVotesReceived === 0) {
      title = 'Never Suspected';
    } else if (currentRank === 1) {
      title = 'Tactical Champion';
    }

    rankings.push({
      rank: currentRank,
      player,
      totalScore: player.totalScore,
      stats: {
        roundsPlayed: stats.roundsPlayed,
        timesImposter: stats.timesImposter,
        timesCaught: stats.timesCaught,
        timesEscaped: stats.timesEscaped,
        correctVotes: stats.correctVotes,
        incorrectVotes: stats.incorrectVotes,
        totalVotesReceived: stats.totalVotesReceived,
        title
      }
    });
  }

  return rankings;
}
