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
    <div className="w-full max-w-sm mx-auto space-y-4 my-auto animate-in zoom-in-95 duration-200">
      {/* Title & Privacy Warning */}
      <div className="text-center space-y-0.5">
        <span className="text-[11px] uppercase font-bold tracking-widest text-slate-400">
          Secret Card • Round {secretView?.roundNumber || 1}
        </span>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
          Keep Screen Hidden
        </h2>
        <p className="text-xs text-slate-500">
          Make sure no one is looking at your device.
        </p>
      </div>

      {/* 3D Interactive Card Container */}
      <div className="perspective-1000 w-full min-h-[360px] flex items-center justify-center">
        <motion.div
          animate={{ rotateY: isRevealed ? 180 : 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full h-[360px] transform-style-3d cursor-pointer"
          onClick={toggleReveal}
        >
          {/* ================= FRONT SIDE (CONCEALED) ================= */}
          <div className="absolute inset-0 backface-hidden bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col items-center justify-between text-center overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
              <Lock size={12} className="text-slate-500" />
              <span>Category: {secretView?.categoryName || 'General'}</span>
            </div>

            <div className="flex flex-col items-center my-auto">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 mb-3">
                <EyeOff size={28} />
              </div>

              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                Card Hidden
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
                Tap anywhere on this card to reveal your confidential identity.
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleReveal();
              }}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Eye size={15} />
              <span>Tap to Reveal Card</span>
            </button>
          </div>

          {/* ================= BACK SIDE (REVEALED) ================= */}
          <div
            className={`absolute inset-0 backface-hidden rotate-y-180 p-6 rounded-3xl border-2 shadow-md flex flex-col items-center justify-between text-center overflow-hidden ${
              isImposter
                ? 'bg-red-50/90 border-red-300'
                : 'bg-slate-50 border-slate-300'
            }`}
          >
            {/* Top Category Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700">
              <span>{secretView?.categoryName}</span>
            </div>

            {/* Secret Content */}
            <div className="my-auto flex flex-col items-center">
              {isImposter ? (
                <>
                  <div className="p-3 rounded-2xl bg-red-100 text-red-600 mb-2">
                    <ShieldAlert size={32} />
                  </div>
                  <span className="text-[11px] uppercase font-black tracking-widest text-red-600 block mb-1">
                    Your Role
                  </span>
                  <h3 className="text-2xl font-black text-red-700 uppercase tracking-tight leading-tight mb-2">
                    YOU ARE THE IMPOSTER
                  </h3>
                  <p className="text-xs text-red-800/80 max-w-[240px] font-medium leading-relaxed">
                    You do not know the word. Blend into discussion, give vague clues, and avoid votes!
                  </p>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 mb-2">
                    <Sparkles size={32} />
                  </div>
                  <span className="text-[11px] uppercase font-bold tracking-widest text-slate-500 block mb-1">
                    Secret Word
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight leading-tight mb-2">
                    {secretView?.secretWord}
                  </h3>
                  <p className="text-xs text-slate-600 max-w-[240px] font-medium leading-relaxed">
                    Give subtle clues during discussion to prove you know the word without revealing it.
                  </p>
                </>
              )}
            </div>

            {/* Hide button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleReveal();
              }}
              className="w-full py-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <EyeOff size={14} />
              <span>Hide Card Again</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Action to proceed to discussion */}
      <div className="pt-2">
        <button
          onClick={() => {
            sounds.click();
            onProceedToDiscussion();
          }}
          className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
        >
          <MessageSquare size={16} />
          <span>Ready for Discussion</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
