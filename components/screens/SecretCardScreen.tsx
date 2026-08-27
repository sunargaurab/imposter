'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import { PlayerSecretView } from '@/types/game';
import { sounds } from '@/lib/audio/soundEffects';

interface SecretCardScreenProps {
  secretView: PlayerSecretView | null;
  onProceedToDiscussion: () => void;
  isHost?: boolean;
}

export const SecretCardScreen: React.FC<SecretCardScreenProps> = ({
  secretView,
  onProceedToDiscussion,
  isHost = false
}) => {
  const [isRevealed, setIsRevealed] = useState(false);

  const toggleReveal = () => {
    if (!isRevealed) {
      sounds.cardReveal();
    } else {
      sounds.click();
    }
    setIsRevealed(prev => !prev);
  };

  const isImposter = secretView?.role === 'IMPOSTER';

  return (
    <div className="w-full max-w-md mx-auto space-y-5 my-auto animate-in zoom-in-95 duration-200">
      {/* Title */}
      <div className="text-center space-y-1">
        <span className="text-[11px] uppercase font-bold tracking-widest text-slate-400">
          Round {secretView?.roundNumber || 1} • Private Card
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
          Your Secret Role
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Tap the card to reveal. Keep your screen hidden!
        </p>
      </div>

      {/* 3D Flipping Card */}
      <div className="perspective-1000 w-full">
        <motion.div
          onClick={toggleReveal}
          whileTap={{ scale: 0.98 }}
          className={`w-full min-h-[300px] sm:min-h-[340px] rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-300 border ${
            !isRevealed
              ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20 border-blue-500'
              : isImposter
              ? 'bg-white border-2 border-red-500 shadow-md'
              : 'bg-white border-2 border-blue-500 shadow-md'
          }`}
        >
          {/* Card Top Pill */}
          <div className="w-full flex items-center justify-between">
            <span
              className={`text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-full ${
                !isRevealed
                  ? 'bg-white/20 text-white'
                  : isImposter
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {secretView?.categoryName || 'Secret Topic'}
            </span>

            <div className={`p-1.5 rounded-full ${!isRevealed ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
            </div>
          </div>

          {/* Card Center Content */}
          <AnimatePresence mode="wait">
            {!isRevealed ? (
              <motion.div
                key="hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="my-auto space-y-3"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto text-3xl">
                  🔒
                </div>
                <h3 className="text-xl font-black uppercase tracking-wider text-white">
                  Tap to Reveal
                </h3>
                <span className="text-xs text-blue-100 font-medium block">
                  Keep hidden from other players
                </span>
              </motion.div>
            ) : isImposter ? (
              <motion.div
                key="imposter"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="my-auto space-y-3"
              >
                <div className="inline-flex p-3 rounded-2xl bg-red-100 text-red-600">
                  <ShieldAlert size={32} />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold tracking-widest text-red-600 block">
                    You Are The
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-black text-red-600 uppercase tracking-tight mt-0.5">
                    Imposter
                  </h3>
                </div>
                <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
                  Bluff your way through discussion. Pretend you know the secret word!
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="normal"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="my-auto space-y-3"
              >
                <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-600">
                  <Sparkles size={32} />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold tracking-widest text-blue-600 block">
                    Secret Word
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight mt-0.5">
                    {secretView?.secretWord || 'Loading...'}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
                  Give subtle clues. Don&apos;t make it too obvious for the imposter!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card Bottom Hint */}
          <span className={`text-[11px] font-semibold ${!isRevealed ? 'text-blue-100' : 'text-slate-400'}`}>
            {isRevealed ? 'Tap to hide card again' : 'Tap card to flip'}
          </span>
        </motion.div>
      </div>

      {/* Ready Button */}
      <div className="pt-2">
        <button
          onClick={() => {
            sounds.click();
            onProceedToDiscussion();
          }}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <span>{isHost ? 'Start Discussion Phase' : 'I am Ready'}</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
