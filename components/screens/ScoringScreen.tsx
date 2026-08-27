'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, ArrowRight } from 'lucide-react';
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
}) => {
  useEffect(() => {
    sounds.scoreDing();
  }, []);

  const isFinalRound = game.currentRoundNum >= game.config.totalRounds;
  const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5 my-auto animate-in zoom-in-95 duration-200 pb-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <span className="text-[11px] uppercase font-bold tracking-widest text-slate-400">
          Round {roundResult.roundNumber} Scoring
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
          Score Breakdown
        </h2>
      </div>

      {/* 1. Round Points Earned Cards */}
      <div className="bg-white p-6 rounded-3xl space-y-3.5 border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <TrendingUp size={14} className="text-slate-600" />
          <span>Points Earned This Round</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {roundResult.playerResults.map((pr) => {
            const isCurrent = currentPlayer?.id === pr.playerId;

            return (
              <div
                key={pr.playerId}
                className={`p-3.5 rounded-2xl flex items-center justify-between border ${
                  isCurrent
                    ? 'bg-blue-50/70 border-blue-300 shadow-xs'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <PlayerAvatar name={pr.playerName} seed={pr.avatarSeed} size="md" />
                  <div className="flex flex-col text-left min-w-0 truncate">
                    <span className="font-bold text-sm text-slate-900 flex items-center gap-1 truncate">
                      <span className="truncate">{pr.playerName}</span>
                      {isCurrent && <span className="text-[10px] text-blue-600 shrink-0 font-bold">(You)</span>}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate">
                      {pr.scoreExplanation}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span className={`text-lg font-black font-mono ${pr.roundScore > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    +{pr.roundScore}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Total: {pr.totalScore}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Cumulative Standings Table */}
      <div className="bg-white p-6 rounded-3xl space-y-3.5 border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Trophy size={14} className="text-slate-600" />
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
                    ? 'bg-blue-50/60 border border-blue-300'
                    : 'bg-slate-50 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      rank === 1
                        ? 'bg-amber-400 text-amber-950 font-black'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-900 font-black'
                        : rank === 3
                        ? 'bg-amber-700 text-white font-black'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {rank}
                  </span>

                  <PlayerAvatar name={player.name} seed={player.avatarSeed} size="sm" isHost={player.isHost} />

                  <span className="font-bold text-sm text-slate-900 truncate">
                    {player.name} {isCurrent && <span className="text-[10px] text-blue-600 font-semibold">(You)</span>}
                  </span>
                </div>

                <span className="font-black text-base text-slate-900 font-mono shrink-0 pl-2">
                  {player.totalScore} pts
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Round CTA */}
      <div className="pt-2 max-w-md mx-auto">
        <button
          onClick={() => {
            sounds.click();
            onNextRound();
          }}
          className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          {isFinalRound ? (
            <>
              <Trophy size={18} />
              <span>View Final Podium</span>
            </>
          ) : (
            <>
              <span>Ready for Round {game.currentRoundNum + 1}</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
