'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw, Home, Share2, Award } from 'lucide-react';
import { FinalPlayerRanking, Player, Game } from '@/types/game';
import { PlayerAvatar } from '@/components/common/PlayerAvatar';
import { sounds } from '@/lib/audio/soundEffects';

interface FinalResultsScreenProps {
  game: Game;
  rankings: FinalPlayerRanking[];
  currentPlayer?: Player;
  onRestartGame: () => void;
  isHost?: boolean;
}

export const FinalResultsScreen: React.FC<FinalResultsScreenProps> = ({
  rankings = [],
  currentPlayer,
  onRestartGame,
  isHost = false
}) => {
  useEffect(() => {
    sounds.victoryFanfare();

    const count = 150;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 45 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 90, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 100, startVelocity: 25, decay: 0.92, scalar: 1.1 });
  }, []);

  const firstPlace = rankings.find(r => r.rank === 1);
  const secondPlace = rankings.find(r => r.rank === 2);
  const thirdPlace = rankings.find(r => r.rank === 3);

  const handleShare = () => {
    sounds.click();
    const text = `🏆 Imposter Game Results!\n1st: ${firstPlace?.player.name} (${firstPlace?.totalScore} pts)\n2nd: ${secondPlace?.player.name || 'None'} (${secondPlace?.totalScore || 0} pts)\n3rd: ${thirdPlace?.player.name || 'None'} (${thirdPlace?.totalScore || 0} pts)`;
    navigator.clipboard.writeText(text);
    alert('Results copied to clipboard!');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 my-auto animate-in zoom-in-95 duration-300 pb-8">
      {/* Title */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs">
          <Trophy size={14} className="text-amber-600" />
          <span>Tournament Complete</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 uppercase tracking-tight">
          Final Results
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">Congratulations to all players!</p>
      </div>

      {/* 3D WINNER PODIUM */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-end justify-center gap-3 sm:gap-6 pt-6 pb-2 max-w-md mx-auto">
          {/* 2nd Place Podium */}
          {secondPlace && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex-1 max-w-[130px] flex flex-col items-center"
            >
              <div className="text-2xl mb-1">🥈</div>
              <PlayerAvatar name={secondPlace.player.name} seed={secondPlace.player.avatarSeed} size="md" className="mb-1.5" />
              <span className="font-bold text-xs sm:text-sm text-slate-900 truncate max-w-full text-center">
                {secondPlace.player.name}
              </span>
              <span className="text-xs font-bold text-slate-500 font-mono mb-2">
                {secondPlace.totalScore} pts
              </span>

              {/* Podium Column */}
              <div className="w-full h-24 sm:h-28 rounded-t-2xl bg-slate-100 border-t-2 border-slate-300 flex items-center justify-center font-black text-2xl text-slate-600">
                2
              </div>
            </motion.div>
          )}

          {/* 1st Place Podium (Center & Highest) */}
          {firstPlace && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex-1 max-w-[150px] flex flex-col items-center z-10 -mb-1"
            >
              <div className="text-4xl mb-1 animate-bounce">👑</div>
              <PlayerAvatar name={firstPlace.player.name} seed={firstPlace.player.avatarSeed} size="lg" className="mb-1.5" />
              <span className="font-black text-sm sm:text-base text-slate-900 truncate max-w-full text-center">
                {firstPlace.player.name}
              </span>
              <span className="text-xs sm:text-sm font-black text-amber-700 font-mono mb-2">
                {firstPlace.totalScore} pts
              </span>

              {/* Podium Column */}
              <div className="w-full h-32 sm:h-40 rounded-t-2xl bg-amber-100 border-t-4 border-amber-400 flex flex-col items-center justify-center font-black text-4xl text-amber-800 shadow-xs">
                <span>1</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 mt-1">Winner</span>
              </div>
            </motion.div>
          )}

          {/* 3rd Place Podium */}
          {thirdPlace && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="flex-1 max-w-[130px] flex flex-col items-center"
            >
              <div className="text-2xl mb-1">🥉</div>
              <PlayerAvatar name={thirdPlace.player.name} seed={thirdPlace.player.avatarSeed} size="md" className="mb-1.5" />
              <span className="font-bold text-xs sm:text-sm text-slate-900 truncate max-w-full text-center">
                {thirdPlace.player.name}
              </span>
              <span className="text-xs font-bold text-slate-500 font-mono mb-2">
                {thirdPlace.totalScore} pts
              </span>

              {/* Podium Column */}
              <div className="w-full h-16 sm:h-20 rounded-t-2xl bg-amber-50 border-t-2 border-amber-300 flex items-center justify-center font-black text-xl text-amber-800">
                3
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* STATS LIST */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl space-y-4 border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Award size={16} className="text-slate-600" />
          <span>Player Rankings & Badges</span>
        </h3>

        <div className="space-y-2.5">
          {rankings.map((entry) => {
            const isCurrent = currentPlayer?.id === entry.player.id;

            return (
              <div
                key={entry.player.id}
                className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
                  isCurrent
                    ? 'bg-blue-50/70 border-blue-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      entry.rank === 1
                        ? 'bg-amber-400 text-amber-950 font-black'
                        : entry.rank === 2
                        ? 'bg-slate-300 text-slate-900 font-black'
                        : entry.rank === 3
                        ? 'bg-amber-700 text-white font-black'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    #{entry.rank}
                  </span>

                  <PlayerAvatar name={entry.player.name} seed={entry.player.avatarSeed} size="md" />

                  <div className="flex flex-col text-left min-w-0 truncate">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold text-sm sm:text-base text-slate-900 truncate">{entry.player.name}</span>
                      {isCurrent && <span className="text-[10px] text-blue-600 font-bold shrink-0">(You)</span>}
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold shrink-0">
                        {entry.stats.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>🕵️ {entry.stats.correctVotes} correct</span>
                      <span>🥷 {entry.stats.timesEscaped} escapes</span>
                      <span>🎯 {entry.stats.totalVotesReceived} votes received</span>
                    </div>
                  </div>
                </div>

                <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono shrink-0 pl-2">
                  {entry.totalScore} pts
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
        {isHost ? (
          <button
            onClick={() => {
              sounds.click();
              onRestartGame();
            }}
            className="w-full sm:flex-1 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <RotateCcw size={16} />
            <span>Play Again in Same Room</span>
          </button>
        ) : (
          <div className="w-full sm:flex-1 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs font-semibold text-slate-500">
            Waiting for host to restart game...
          </div>
        )}

        <button
          onClick={handleShare}
          className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-xs"
        >
          <Share2 size={16} />
          <span>Share Results</span>
        </button>

        <a
          href="/"
          className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-xs"
        >
          <Home size={16} />
          <span>Exit to Home</span>
        </a>
      </div>
    </div>
  );
};
