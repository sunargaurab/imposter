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
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel hover:bg-white/10 transition-all text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer active:scale-95"
    >
      {muted ? (
        <>
          <VolumeX size={15} className="text-zinc-400" />
          <span className="hidden sm:inline text-zinc-400">Muted</span>
        </>
      ) : (
        <>
          <Volume2 size={15} className="text-cyan-400 animate-pulse" />
          <span className="hidden sm:inline text-cyan-300">Sound ON</span>
        </>
      )}
    </button>
  );
};
