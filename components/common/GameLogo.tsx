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
          whileTap={{ scale: 0.95 }}
          className={`flex items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm ${
            isSm ? 'w-8 h-8 text-base' : isLg ? 'w-14 h-14 text-2xl' : 'w-10 h-10 text-xl'
          }`}
        >
          <span>🎭</span>
        </motion.div>

        <div className="flex flex-col">
          <span
            className={`font-black tracking-wider uppercase text-slate-900 ${
              isSm ? 'text-lg' : isLg ? 'text-3xl' : 'text-xl'
            }`}
          >
            IMPOSTER
          </span>
        </div>
      </div>

      {showSubtitle && (
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-1">
          Party Game
        </span>
      )}
    </Link>
  );
};
