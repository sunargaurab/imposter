'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
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
    <div className="w-full max-w-sm mx-auto text-center space-y-4 my-auto animate-in zoom-in-95 duration-200">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
        <span className="text-[11px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
          Next Round
        </span>

        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">
          Round {game.currentRoundNum} of {game.config.totalRounds}
        </h2>

        <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6 font-medium">
          New secret roles and a new secret word are being selected.
        </p>

        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 flex items-center justify-center font-black text-3xl text-white shadow-xs mb-6 animate-pulse">
          {countdown}
        </div>

        <button
          onClick={() => {
            sounds.click();
            onProceed();
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <span>Start Now</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
