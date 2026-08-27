'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { getMuted, setMuted, sounds } from '@/lib/audio/soundEffects';

export const SoundController: React.FC = () => {
  const [muted, setMutedState] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMutedState(getMuted());
  }, []);

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) {
      sounds.click();
    }
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleSound}
      aria-label={muted ? 'Unmute game audio' : 'Mute game audio'}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-all text-xs font-semibold text-slate-700 cursor-pointer active:scale-95"
    >
      {muted ? (
        <>
          <VolumeX size={14} className="text-slate-400" />
          <span className="text-slate-500 text-[11px]">Muted</span>
        </>
      ) : (
        <>
          <Volume2 size={14} className="text-blue-600" />
          <span className="text-slate-700 text-[11px]">Sound</span>
        </>
      )}
    </button>
  );
};
