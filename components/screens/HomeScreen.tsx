'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, LogIn, HelpCircle, X, Play } from 'lucide-react';
import { GameLogo } from '@/components/common/GameLogo';
import { SoundController } from '@/components/common/SoundController';
import { sounds } from '@/lib/audio/soundEffects';

export const HomeScreen: React.FC = () => {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 md:p-8 z-10 w-full">
      {/* App Header Bar */}
      <header className="flex items-center justify-between w-full max-w-5xl mx-auto pt-1 pb-4">
        <GameLogo size="sm" />
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.click();
              setShowRules(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
          >
            <HelpCircle size={14} className="text-blue-600" />
            <span>Rules</span>
          </button>
          <SoundController />
        </div>
      </header>

      {/* Main Hero */}
      <main className="w-full max-w-xl mx-auto my-auto py-8 flex flex-col items-center text-center">
        {/* App Icon */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-blue-600 text-white flex items-center justify-center text-4xl sm:text-5xl shadow-lg shadow-blue-600/25 mb-4 select-none"
        >
          <span>🎭</span>
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight uppercase text-slate-900 mb-2">
          Imposter
        </h1>

        <p className="text-sm sm:text-base text-slate-500 font-medium max-w-sm mx-auto mb-8">
          Find the liar. Protect the secret word.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto mb-6">
          <Link
            href="/create"
            onClick={() => sounds.click()}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-4 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-all active:scale-[0.99] cursor-pointer"
          >
            <Plus size={18} />
            <span>Create Game</span>
          </Link>

          <Link
            href="/join"
            onClick={() => sounds.click()}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-4 px-5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-bold text-sm shadow-xs transition-all active:scale-[0.99] cursor-pointer"
          >
            <LogIn size={18} className="text-blue-600" />
            <span>Join Room</span>
          </Link>
        </div>

        {/* Demo Sandbox Link */}
        <Link
          href="/demo"
          onClick={() => sounds.click()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-all border border-blue-100"
        >
          <Play size={12} className="fill-blue-600 text-blue-600" />
          <span>Interactive 6-Player Sandbox</span>
        </Link>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-3">
        <span>3–20 Players • 10 Topics</span>
      </footer>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white p-6 rounded-3xl border border-slate-200 shadow-xl text-left max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>🎭</span> How to Play
              </h2>
              <button
                onClick={() => setShowRules(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
                <span className="font-bold text-blue-900 block mb-0.5">1. Roles</span>
                <span>Normal players get the secret word. Imposters have no word and must pretend.</span>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
                <span className="font-bold text-blue-900 block mb-0.5">2. Discussion</span>
                <span>Talk for 5 minutes. Give subtle hints proving you know the secret word.</span>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
                <span className="font-bold text-blue-900 block mb-0.5">3. Secret Vote</span>
                <span>Vote for who you think is the imposter.</span>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
                <span className="font-bold text-blue-900 block mb-0.5">4. Scores</span>
                <span>Points for catching imposters and escaping undetected.</span>
              </div>
            </div>

            <button
              onClick={() => setShowRules(false)}
              className="mt-5 w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-blue-600/25"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
