'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Vote } from 'lucide-react';
import { Game } from '@/types/game';
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
  const totalDuration = game.config.discussionTimeSeconds || 300; // 5 min default
  const [timeLeft, setTimeLeft] = useState(totalDuration);

  useEffect(() => {
    sounds.timerTick();

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          sounds.alarm();
          if (isHost) {
            onStartVoting();
          }
          return 0;
        }
        if (prev <= 10) {
          sounds.tick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isHost, onStartVoting]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progress = timeLeft / totalDuration;
  const strokeDashoffset = 440 * (1 - progress);

  return (
    <div className="w-full max-w-lg mx-auto space-y-5 my-auto animate-in zoom-in-95 duration-200">
      {/* Title */}
      <div className="text-center space-y-1">
        <span className="text-[11px] uppercase font-bold tracking-widest text-slate-400">
          Round {game.currentRoundNum} • Discussion
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
          Talk & Question
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Take turns giving subtle hints about the secret word.
        </p>
      </div>

      {/* Main Timer Display */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center justify-center">
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center my-2">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="70"
              className="stroke-slate-100"
              strokeWidth="8"
              fill="transparent"
            />
            <motion.circle
              cx="80"
              cy="80"
              r="70"
              className="stroke-blue-600"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={440}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: 'linear' }}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="font-mono text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {formattedTime}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
              Time Left
            </span>
          </div>
        </div>

        {/* Tip Box */}
        <div className="w-full mt-4 p-3 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center gap-2.5 text-xs text-blue-900">
          <MessageSquare size={16} className="text-blue-600 shrink-0" />
          <span className="font-medium">
            Imposters don&apos;t know the secret word. Watch for vague answers!
          </span>
        </div>
      </div>

      {/* Host Action or Waiting Info */}
      <div className="pt-2">
        {isHost ? (
          <button
            onClick={() => {
              sounds.click();
              onStartVoting();
            }}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <Vote size={18} />
            <span>Start Voting Now</span>
          </button>
        ) : (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-center font-bold text-xs">
            Voting starts when the timer ends or when the Host starts voting.
          </div>
        )}
      </div>
    </div>
  );
};
