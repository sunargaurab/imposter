'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, ArrowRight } from 'lucide-react';
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
    <div className="w-full max-w-sm mx-auto text-center space-y-6 my-auto animate-in zoom-in-95 duration-200">
      {/* Category Pill */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-bold text-slate-700">
        <Layers size={13} className="text-slate-500" />
        <span>Category: {category.name}</span>
      </div>

      {/* Main Announcement Box */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <span className="text-[11px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
          Get Ready
        </span>

        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-2">
          Round {game.currentRoundNum}
        </h2>

        <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6 font-medium">
          Secret cards are being distributed. Keep your screen hidden from others!
        </p>

        {/* Big Countdown Number */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 flex items-center justify-center font-black text-3xl text-white shadow-sm mb-6 animate-pulse">
          {countdown > 0 ? countdown : 'GO!'}
        </div>

        <button
          onClick={() => {
            sounds.click();
            onProceed();
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <span>Skip Countdown</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
