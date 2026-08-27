'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, ArrowRight, Play, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Player, Game, RoundResultSummary } from '@/types/game';
import { PlayerAvatar } from '@/components/common/PlayerAvatar';
import { sounds } from '@/lib/audio/soundEffects';

interface ScoringScreenProps {
  game: Game;
  players: Player[];
  roundResult: RoundResultSummary;
  currentPlayer?: Player;
  onNextRound: () => void;
  isHost?: boolean;
}

export const ScoringScreen: React.FC<ScoringScreenProps> = ({
  game,
  players,
  roundResult,
  currentPlayer,
  onNextRound,
  isHost = false
}) => {
  useEffect(() => {
    sounds.scoreDing();
  }, []);

  const isFinalRound = game.currentRoundNum >= game.config.totalRounds;

  // Sorted leaderboard
  const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 my-auto animate-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="text-center space-y-1">
        <span className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">
          Round {roundResult.roundNumber} Points
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          Score Breakdown
        </h2>
      </div>

      {/* 1. Round Points Earned Cards */}
      <div className="glass-panel p-6 rounded-3xl space-y-3 border border-white/10">
        <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 mb-2 flex items-center gap-1.5">
          <TrendingUp size={14} />
          <span>Points Earned This Round</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {roundResult.playerResults.map((pr) => {
            const isCurrent = currentPlayer?.id === pr.playerId;

            return (
              <motion.div
                key={pr.playerId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl flex items-center justify-between border ${
                  isCurrent
                    ? 'bg-purple-950/40 border-purple-500/50 shadow-md shadow-purple-950/40'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <PlayerAvatar name={pr.playerName} seed={pr.avatarSeed} size="md" />
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-sm text-white flex items-center gap-1">
                      <span>{pr.playerName}</span>
                      {isCurrent && <span className="text-[10px] text-purple-300">(You)</span>}
                    </span>
                    <span className="text-[11px] text-zinc-400 max-w-[180px] truncate">
                      {pr.scoreExplanation}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <motion.span
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className={`text-xl font-black font-mono ${
                      pr.roundScore > 0 ? 'text-emerald-400' : 'text-zinc-500'
                    }`}
                  >
                    +{pr.roundScore}
                  </motion.span>
                  <span className="text-[10px] font-semibold text-zinc-400">
                    Total: {pr.totalScore}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 2. Cumulative Standings Table */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 border border-white/10">
        <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
          <Trophy size={14} />
          <span>Current Standings</span>
        </h3>

        <div className="space-y-2">
          {sortedPlayers.map((player, index) => {
            const isCurrent = currentPlayer?.id === player.id;
            const rank = index + 1;

            return (
              <div
                key={player.id}
                className={`p-3 rounded-2xl flex items-center justify-between transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/40 border border-cyan-500/40 shadow-sm'
                    : 'bg-black/30 border border-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                      rank === 1
                        ? 'bg-amber-400 text-amber-950 font-bold'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-900 font-bold'
                        : rank === 3
                        ? 'bg-amber-700 text-white font-bold'
                        : 'bg-white/10 text-zinc-400'
                    }`}
                  >
                    {rank}
                  </span>

                  <PlayerAvatar name={player.name} seed={player.avatarSeed} size="sm" isHost={player.isHost} />

                  <span className="font-bold text-sm text-white">
                    {player.name} {isCurrent && <span className="text-[10px] text-cyan-300">(You)</span>}
                  </span>
                </div>

                <span className="font-black text-base text-cyan-400 font-mono">
                  {player.totalScore} pts
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Round CTA */}
      <div className="pt-2">
        <button
          onClick={() => {
            sounds.click();
            onNextRound();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black text-lg shadow-xl shadow-rose-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          {isFinalRound ? (
            <>
              <Trophy size={20} />
              <span>View Final Winner & Podium</span>
            </>
          ) : (
            <>
              <span>Ready for Round {game.currentRoundNum + 1}</span>
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
