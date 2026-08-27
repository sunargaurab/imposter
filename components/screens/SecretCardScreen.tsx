'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ShieldAlert, Sparkles, Lock, MessageSquare, ArrowRight } from 'lucide-react';
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
  const isImposter = secretView?.role === 'IMPOSTER';

  const toggleReveal = () => {
    if (!isRevealed) {
      sounds.cardReveal();
    } else {
      sounds.cardHide();
    }
    setIsRevealed(!isRevealed);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 my-auto animate-in zoom-in-95 duration-300">
      {/* Title & Privacy Warning */}
      <div className="text-center space-y-1">
        <span className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">
          Secret Card • Round {secretView?.roundNumber || 1}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Keep Screen Hidden
        </h2>
        <p className="text-xs text-zinc-400">
          Make sure no one is looking at your device before revealing.
        </p>
      </div>

      {/* 3D Interactive Card Container */}
      <div className="perspective-1000 w-full min-h-[380px] sm:min-h-[420px] flex items-center justify-center">
        <motion.div
          animate={{ rotateY: isRevealed ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full h-full transform-style-3d cursor-pointer"
          onClick={toggleReveal}
        >
          {/* ================= FRONT SIDE (CONCEALED) ================= */}
          <div className="absolute inset-0 backface-hidden glass-panel bg-[#121828]/90 p-8 rounded-3xl border-2 border-white/15 shadow-2xl flex flex-col items-center justify-between text-center overflow-hidden">
            <div className="absolute -top-16 -left-16 w-40 h-40 bg-purple-600/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-cyan-600/20 rounded-full blur-2xl" />

            <div className="relative z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-zinc-400">
              <Lock size={12} className="text-purple-400" />
              <span>Category: {secretView?.categoryName || 'General'}</span>
            </div>

            <div className="relative z-10 flex flex-col items-center my-auto">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5 shadow-xl shadow-purple-950/50 mb-4 animate-pulse">
                <div className="w-full h-full rounded-[22px] bg-[#0c0f17] flex items-center justify-center text-purple-400">
                  <EyeOff size={32} />
                </div>
              </div>

              <h3 className="text-xl font-black text-white uppercase tracking-wide">
                Your Secret is Hidden
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-[240px]">
                Tap anywhere on this card to reveal your confidential identity.
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleReveal();
              }}
              className="relative z-10 w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-extrabold text-sm shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Eye size={18} />
              <span>REVEAL MY CARD</span>
            </button>
          </div>

          {/* ================= BACK SIDE (REVEALED) ================= */}
          <div
            className={`absolute inset-0 backface-hidden rotate-y-180 p-8 rounded-3xl border-2 shadow-2xl flex flex-col items-center justify-between text-center overflow-hidden ${
              isImposter
                ? 'bg-gradient-to-b from-rose-950/95 via-[#1a0c14] to-[#0d070b] border-rose-500/50 glow-box-rose'
                : 'bg-gradient-to-b from-purple-950/95 via-[#130f24] to-[#090b14] border-purple-500/50 glow-box-purple'
            }`}
          >
            {/* Top Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-xs font-bold text-zinc-300">
              <span>{secretView?.categoryName}</span>
            </div>

            {/* Secret Content */}
            <div className="my-auto flex flex-col items-center">
              {isImposter ? (
                <>
                  <div className="p-3 rounded-2xl bg-rose-600/20 text-rose-400 mb-3 animate-bounce">
                    <ShieldAlert size={36} />
                  </div>
                  <span className="text-xs uppercase font-extrabold tracking-[0.25em] text-rose-400 block mb-1">
                    Confidential Role
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-black text-rose-500 uppercase tracking-tight glow-text-rose leading-tight mb-3">
                    YOU ARE THE IMPOSTER
                  </h3>
                  <p className="text-xs text-rose-200/80 max-w-[260px] font-medium leading-relaxed">
                    You do not know the secret word. Blend into the discussion, give vague clues, and avoid getting voted!
                  </p>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 mb-3">
                    <Sparkles size={36} />
                  </div>
                  <span className="text-xs uppercase font-extrabold tracking-[0.25em] text-cyan-400 block mb-1">
                    Secret Word
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight glow-text-cyan leading-tight mb-3">
                    {secretView?.secretWord}
                  </h3>
                  <p className="text-xs text-purple-200/80 max-w-[260px] font-medium leading-relaxed">
                    Give clues during discussion to prove you know the word without revealing it to the imposter.
                  </p>
                </>
              )}
            </div>

            {/* Hide button on back */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleReveal();
              }}
              className="w-full py-3 rounded-2xl bg-black/50 hover:bg-black/70 border border-white/20 text-zinc-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <EyeOff size={16} />
              <span>Hide Card Again</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Action to proceed to discussion */}
      <div className="text-center pt-2">
        <button
          onClick={() => {
            sounds.click();
            onProceedToDiscussion();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-base shadow-xl shadow-cyan-950/50 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
        >
          <MessageSquare size={18} />
          <span>I'm Ready for Discussion</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
