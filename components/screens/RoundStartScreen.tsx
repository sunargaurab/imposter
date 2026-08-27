'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Layers, ShieldAlert, ArrowRight } from 'lucide-react';
import { Game } from '@/types/game';
import { getCategoryById } from '@/data/categories';
import { sounds } from '@/lib/audio/soundEffects';

interface RoundStartScreenProps {
  game: Game;
  onProceed: () => void;
}

export const RoundStartScreen: React.FC<RoundStartScreenProps> = ({ game, onProceed }) => {
  const [countdown, setCountdown] = useState(3);
  const category = getCategoryById(game.config.categoryId);

  useEffect(() => {
    sounds.tick();
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onProceed();
          return 0;
        }
        sounds.tick();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onProceed]);

  return (
    <div className="w-full max-w-xl mx-auto text-center space-y-8 my-auto animate-in zoom-in-95 duration-300">
      {/* Category Pill */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-zinc-300"
      >
        <Layers size={14} className="text-purple-400" />
        <span>Category: {category.name}</span>
      </motion.div>

      {/* Main Announcement Box */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl relative overflow-hidden border border-white/15 shadow-2xl">
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-purple-600/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-rose-600/25 rounded-full blur-3xl" />

        <motion.div
          key={countdown}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.2, opacity: 0 }}
          className="relative z-10"
        >
          <span className="text-xs uppercase font-extrabold tracking-[0.3em] text-zinc-400 block mb-2">
            Get Ready
          </span>

          <h2 className="text-5xl sm:text-6xl font-black text-white uppercase tracking-tight mb-4">
            Round {game.currentRoundNum}
          </h2>

          <p className="text-sm text-zinc-300 max-w-xs mx-auto mb-8 font-medium">
            Secret roles and cards are being distributed. Keep your screen hidden!
          </p>

          {/* Big Countdown Number */}
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-rose-600 to-purple-600 flex items-center justify-center font-black text-4xl text-white shadow-xl shadow-purple-950/50 mb-6 border-2 border-white/30 animate-pulse">
            {countdown > 0 ? countdown : 'GO!'}
          </div>

          <button
            onClick={() => {
              sounds.click();
              onProceed();
            }}
            className="inline-flex items-center gap-2 text-xs font-bold text-purple-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>Skip Countdown</span>
            <ArrowRight size={14} />
          </button>
        </motion.div>
      </div>
    </div>
  );
};
