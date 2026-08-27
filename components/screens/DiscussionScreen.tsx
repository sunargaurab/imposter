'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Vote, Sparkles } from 'lucide-react';
import { Game } from '@/types/game';
import { getCategoryById } from '@/data/categories';
import { sounds } from '@/lib/audio/soundEffects';

interface DiscussionScreenProps {
  game: Game;
  onStartVoting: () => void;
  isHost?: boolean;
}

export const DiscussionScreen: React.FC<DiscussionScreenProps> = ({
  game,
  onStartVoting,
  isHost = false
}) => {
  const duration = game.config.discussionTimeSeconds || 60;
  const [timeLeft, setTimeLeft] = useState(duration);
  const category = getCategoryById(game.config.categoryId);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onStartVoting();
          return 0;
        }

        if (prev <= 10) {
          sounds.urgentTick();
        } else if (prev % 10 === 0 || prev <= 15) {
          sounds.tick();
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onStartVoting]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const progressPercent = ((duration - timeLeft) / duration) * 100;
  const isUrgent = timeLeft <= 10;

  return (
    <div className="w-full max-w-sm mx-auto space-y-4 my-auto animate-in zoom-in-95 duration-200">
      {/* Discussion Main Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl text-center border border-slate-200 shadow-xs flex flex-col items-center">
        {/* Category Chip */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold mb-3">
          <Sparkles size={13} className="text-slate-500" />
          <span>Category: {category.name}</span>
        </div>

        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-1">
          Discussion
        </h2>

        <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6 font-medium">
          Speak aloud! Give clues, listen carefully, and look for suspicious hesitation.
        </p>

        {/* Circular Countdown Display */}
        <div className="relative w-40 h-40 flex items-center justify-center mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-slate-100"
              strokeWidth="6"
              fill="transparent"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="44"
              className={`${isUrgent ? 'stroke-red-600' : 'stroke-slate-900'}`}
              strokeWidth="6"
              strokeDasharray="276.46"
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
              transition={{ duration: 1, ease: 'linear' }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`font-mono font-black text-4xl tracking-wider ${
                isUrgent ? 'text-red-600 animate-pulse' : 'text-slate-900'
              }`}
            >
              {formattedTime}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">
              {isUrgent ? 'Time almost up!' : 'Remaining'}
            </span>
          </div>
        </div>

        {/* Tips Box */}
        <div className="space-y-2 w-full text-left mb-6">
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <span className="text-blue-600 font-bold shrink-0">💡</span>
            <span>If you know the word, give a clue only real players understand.</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <span className="text-red-600 font-bold shrink-0">🕵️</span>
            <span>Imposters will give generic, vague, or safe answers.</span>
          </div>
        </div>

        {/* Action Button */}
        {isHost ? (
          <button
            onClick={() => {
              sounds.click();
              onStartVoting();
            }}
            className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <Vote size={16} />
            <span>Start Voting Now</span>
          </button>
        ) : (
          <div className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-500 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Voting starts when timer finishes</span>
          </div>
        )}
      </div>
    </div>
  );
};
