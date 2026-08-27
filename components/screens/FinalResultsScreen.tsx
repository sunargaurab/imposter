'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { Trophy, Medal, Sparkles, RotateCcw, Home, Share2, Award, Skull, CheckCircle2 } from 'lucide-react';
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
  game,
  rankings = [],
  currentPlayer,
  onRestartGame,
  isHost = false
}) => {
  useEffect(() => {
    sounds.victoryFanfare();

    // Trigger celebratory confetti showers
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  const firstPlace = rankings.find(r => r.rank === 1);
  const secondPlace = rankings.find(r => r.rank === 2);
  const thirdPlace = rankings.find(r => r.rank === 3);

  const handleShare = () => {
    sounds.click();
    const text = `🏆 Imposter Game Results!\n1st: ${firstPlace?.player.name} (${firstPlace?.totalScore} pts)\n2nd: ${secondPlace?.player.name || 'None'} (${secondPlace?.totalScore || 0} pts)\n3rd: ${thirdPlace?.player.name || 'None'} (${thirdPlace?.totalScore || 0} pts)\nPlay Imposter with us!`;
    navigator.clipboard.writeText(text);
    alert('Results copied to clipboard!');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 my-auto animate-in zoom-in-95 duration-500 pb-10">
      {/* Title */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs"
        >
          <Trophy size={14} className="text-amber-400" />
          <span>Final Tournament Results</span>
        </motion.div>

        <h1 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tight glow-text-rose">
          Game Over
        </h1>
        <p className="text-sm text-zinc-300">Congratulations to all players! Here is the final winner podium.</p>
      </div>

      {/* 3D WINNER PODIUM */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-amber-500/20 shadow-2xl relative overflow-hidden bg-gradient-to-b from-amber-950/20 via-[#10131f] to-[#090a10]">
        <div className="flex items-end justify-center gap-2 sm:gap-4 pt-8 pb-2">
          {/* 2nd Place Podium */}
          {secondPlace && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1 max-w-[130px] sm:max-w-[160px] flex flex-col items-center"
            >
              <div className="text-2xl mb-1">🥈</div>
              <PlayerAvatar name={secondPlace.player.name} seed={secondPlace.player.avatarSeed} size="md" className="mb-2" />
              <span className="font-extrabold text-xs sm:text-sm text-white truncate max-w-full text-center">
                {secondPlace.player.name}
              </span>
              <span className="text-xs font-black text-slate-300 font-mono mb-2">
                {secondPlace.totalScore} pts
              </span>

              {/* Podium Column */}
              <div className="w-full h-28 sm:h-36 rounded-t-2xl bg-gradient-to-b from-slate-400/30 to-slate-800/40 border-t-2 border-slate-300 flex items-center justify-center font-black text-2xl text-slate-300 shadow-lg">
                2
              </div>
            </motion.div>
          )}

          {/* 1st Place Podium (Highest & Center) */}
          {firstPlace && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex-1 max-w-[150px] sm:max-w-[190px] flex flex-col items-center z-10 -mb-2"
            >
              <div className="text-4xl mb-1 animate-bounce">👑</div>
              <PlayerAvatar name={firstPlace.player.name} seed={firstPlace.player.avatarSeed} size="lg" className="mb-2" />
              <span className="font-black text-sm sm:text-base text-amber-300 truncate max-w-full text-center">
                {firstPlace.player.name}
              </span>
              <span className="text-sm font-black text-amber-400 font-mono mb-2">
                {firstPlace.totalScore} pts
              </span>

              {/* Podium Column */}
              <div className="w-full h-36 sm:h-48 rounded-t-2xl bg-gradient-to-b from-amber-400/40 to-amber-700/30 border-t-4 border-amber-400 flex flex-col items-center justify-center font-black text-4xl text-amber-300 shadow-2xl glow-box-purple">
                <span>1</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-200 mt-1">Champion</span>
              </div>
            </motion.div>
          )}

          {/* 3rd Place Podium */}
          {thirdPlace && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex-1 max-w-[130px] sm:max-w-[160px] flex flex-col items-center"
            >
              <div className="text-2xl mb-1">🥉</div>
              <PlayerAvatar name={thirdPlace.player.name} seed={thirdPlace.player.avatarSeed} size="md" className="mb-2" />
              <span className="font-extrabold text-xs sm:text-sm text-white truncate max-w-full text-center">
                {thirdPlace.player.name}
              </span>
              <span className="text-xs font-black text-amber-600 font-mono mb-2">
                {thirdPlace.totalScore} pts
              </span>

              {/* Podium Column */}
              <div className="w-full h-20 sm:h-28 rounded-t-2xl bg-gradient-to-b from-amber-700/30 to-amber-950/40 border-t-2 border-amber-600 flex items-center justify-center font-black text-2xl text-amber-600 shadow-md">
                3
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* DETAILED STATS & AWARDS LIST */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 border border-white/10">
        <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
          <Award size={16} />
          <span>Player Awards & Detailed Statistics</span>
        </h3>

        <div className="space-y-3">
          {rankings.map((entry) => {
            const isCurrent = currentPlayer?.id === entry.player.id;

            return (
              <motion.div
                key={entry.player.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
                  isCurrent
                    ? 'bg-purple-950/40 border-purple-500/50 shadow-lg shadow-purple-950/40'
                    : 'bg-white/5 border-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                      entry.rank === 1
                        ? 'bg-amber-400 text-amber-950 font-bold'
                        : entry.rank === 2
                        ? 'bg-slate-300 text-slate-900 font-bold'
                        : entry.rank === 3
                        ? 'bg-amber-700 text-white font-bold'
                        : 'bg-white/10 text-zinc-400'
                    }`}
                  >
                    #{entry.rank}
                  </span>

                  <PlayerAvatar name={entry.player.name} seed={entry.player.avatarSeed} size="md" />

                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-white">{entry.player.name}</span>
                      {isCurrent && <span className="text-[10px] text-purple-300 font-bold">(You)</span>}
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold">
                        {entry.stats.title}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-400 mt-1">
                      <span>🕵️ {entry.stats.correctVotes} correct votes</span>
                      <span>🥷 {entry.stats.timesEscaped} escapes</span>
                      <span>🎯 {entry.stats.totalVotesReceived} votes received</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10">
                  <span className="text-2xl font-black text-cyan-400 font-mono">
                    {entry.totalScore} pts
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {isHost ? (
          <button
            onClick={() => {
              sounds.click();
              onRestartGame();
            }}
            className="w-full sm:flex-1 py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black text-base shadow-xl shadow-rose-950/50 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <RotateCcw size={18} />
            <span>Play Again in Same Room</span>
          </button>
        ) : (
          <div className="w-full sm:flex-1 p-4 rounded-2xl bg-white/5 border border-white/10 text-center text-xs font-semibold text-zinc-400">
            Waiting for host to restart game...
          </div>
        )}

        <button
          onClick={handleShare}
          className="w-full sm:w-auto px-6 py-4 rounded-2xl glass-panel hover:bg-white/10 text-white font-bold text-base flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <Share2 size={18} />
          <span>Share Results</span>
        </button>

        <a
          href="/"
          className="w-full sm:w-auto px-6 py-4 rounded-2xl glass-panel hover:bg-white/10 text-zinc-300 hover:text-white font-bold text-base flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <Home size={18} />
          <span>Exit to Home</span>
        </a>
      </div>
    </div>
  );
};
