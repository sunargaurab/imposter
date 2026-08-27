'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const BackgroundParticles: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Deep gradient background layers */}
      <div className="absolute inset-0 bg-radial from-violet-950/20 via-[#090B10] to-[#050608]" />
      
      {/* Ambient glowing orbs */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -50, 20, 0],
          scale: [1, 1.2, 0.9, 1],
          opacity: [0.25, 0.4, 0.25]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
      />

      <motion.div
        animate={{
          x: [0, -60, 30, 0],
          y: [0, 40, -40, 0],
          scale: [1, 1.15, 0.85, 1],
          opacity: [0.2, 0.35, 0.2]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-1/3 -right-32 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl"
      />

      <motion.div
        animate={{
          x: [0, 50, -40, 0],
          y: [0, -30, 50, 0],
          scale: [0.9, 1.25, 1, 0.9],
          opacity: [0.15, 0.3, 0.15]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute -bottom-32 left-1/4 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl"
      />

      {/* Subtle modern grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />
    </div>
  );
};
