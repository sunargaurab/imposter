'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, MessageSquare, ShieldAlert, Vote, Play, Sparkles, AlertCircle } from 'lucide-react';
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
    <div className="w-full max-w-xl mx-auto space-y-6 my-auto animate-in zoom-in-95 duration-300">
      {/* Discussion Main Card */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl text-center relative overflow-hidden border border-white/10 shadow-2xl">
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Category Chip */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-950/50 border border-purple-500/30 text-purple-300 text-xs font-bold mb-4">
            <Sparkles size={13} className="text-purple-400" />
            <span>Category: {category.name}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mb-2">
            Discussion Phase
          </h2>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-sm mx-auto mb-8 font-medium">
            Speak aloud! Give clues, ask questions, and figure out who looks suspicious.
          </p>

          {/* Circular Countdown Display */}
          <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center mb-8">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-white/10"
                strokeWidth="6"
                fill="transparent"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="44"
                className={`${isUrgent ? 'stroke-rose-500' : 'stroke-cyan-400'}`}
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
                className={`font-mono font-black text-4xl sm:text-5xl tracking-wider ${
                  isUrgent ? 'text-rose-500 animate-pulse glow-text-rose' : 'text-white'
                }`}
              >
                {formattedTime}
              </span>
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest mt-1">
                {isUrgent ? 'Hurry Up!' : 'Time Left'}
              </span>
            </div>
          </div>

          {/* Guidelines Tips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left mb-6">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-zinc-300 flex items-start gap-2">
              <span className="text-cyan-400 font-bold">💡</span>
              <span>If you know the word, give a subtle clue without giving it away!</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-zinc-300 flex items-start gap-2">
              <span className="text-rose-400 font-bold">🕵️</span>
              <span>Listen closely for anyone hesitating or giving vague answers!</span>
            </div>
          </div>

          {/* Action Button */}
          {isHost ? (
            <button
              onClick={() => {
                sounds.click();
                onStartVoting();
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black text-base shadow-xl shadow-rose-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <Vote size={18} />
              <span>Start Voting Now</span>
            </button>
          ) : (
            <div className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold text-zinc-400 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Voting starts automatically when timer runs out</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
