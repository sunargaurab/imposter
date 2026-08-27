'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface GameLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const GameLogo: React.FC<GameLogoProps> = ({ size = 'md', showSubtitle = false }) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <Link href="/" className="inline-flex flex-col items-center group cursor-pointer">
      <div className="flex items-center gap-2.5">
        <motion.div
          whileHover={{ rotate: [-5, 5, -5, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 via-purple-600 to-cyan-400 p-0.5 shadow-lg shadow-rose-950/40`}
        >
          <div className={`rounded-[14px] bg-[#0c0f17] flex items-center justify-center ${isSm ? 'p-1.5' : isLg ? 'p-3' : 'p-2'}`}>
            <span className="text-xl">🎭</span>
          </div>
        </motion.div>

        <div className="flex flex-col">
          <span className={`font-black tracking-wider uppercase bg-gradient-to-r from-rose-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent ${
            isSm ? 'text-xl' : isLg ? 'text-4xl md:text-5xl' : 'text-2xl md:text-3xl'
          }`}>
            IMPOSTER
          </span>
        </div>
      </div>

      {showSubtitle && (
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 mt-1">
          Social Deduction Party Game
        </span>
      )}
    </Link>
  );
};
