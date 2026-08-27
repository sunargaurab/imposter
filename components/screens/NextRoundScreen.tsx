'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, ArrowRight } from 'lucide-react';
import { Game } from '@/types/game';
import { sounds } from '@/lib/audio/soundEffects';

interface NextRoundScreenProps {
  game: Game;
  onProceed: () => void;
}

export const NextRoundScreen: React.FC<NextRoundScreenProps> = ({ game, onProceed }) => {
  const [countdown, setCountdown] = useState(3);

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
    <div className="w-full max-w-lg mx-auto text-center space-y-6 my-auto animate-in zoom-in-95 duration-300">
      <div className="glass-panel p-8 sm:p-12 rounded-3xl relative overflow-hidden border border-white/15 shadow-2xl">
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-cyan-600/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <span className="text-xs uppercase font-black tracking-[0.25em] text-cyan-400 block mb-2">
            Next Round Starting
          </span>

          <h2 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight mb-2">
            Round {game.currentRoundNum} of {game.config.totalRounds}
          </h2>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-xs mx-auto mb-8 font-medium">
            New imposters and a new secret word are being randomized.
          </p>

          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-black text-4xl text-white shadow-xl shadow-cyan-950/50 mb-6 border-2 border-white/30 animate-pulse">
            {countdown}
          </div>

          <button
            onClick={() => {
              sounds.click();
              onProceed();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>Start Now</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
