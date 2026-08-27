'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PlusCircle, LogIn, Users, ShieldCheck, HelpCircle, Flame, ArrowRight, Play, X } from 'lucide-react';
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
            <HelpCircle size={14} className="text-slate-500" />
            <span>How to Play</span>
          </button>
          <SoundController />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-2xl mx-auto my-auto py-8 sm:py-12 flex flex-col items-center text-center">
        {/* App Icon Banner */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-slate-900 text-white flex items-center justify-center text-4xl sm:text-5xl shadow-md mb-5"
        >
          <span>🎭</span>
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight uppercase text-slate-900 mb-3">
          Imposter
        </h1>

        <p className="text-sm sm:text-base text-slate-600 font-medium max-w-md mx-auto mb-8 leading-relaxed">
          Find the liar. Protect your secret word. Outsmart your friends in real-time.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto mb-6">
          <Link
            href="/create"
            onClick={() => sounds.click()}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs transition-all active:scale-[0.99] cursor-pointer"
          >
            <PlusCircle size={18} />
            <span>Create Game</span>
          </Link>

          <Link
            href="/join"
            onClick={() => sounds.click()}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold text-sm shadow-xs transition-all active:scale-[0.99] cursor-pointer"
          >
            <LogIn size={18} className="text-slate-600" />
            <span>Join Room</span>
          </Link>
        </div>

        {/* Simulator Link */}
        <Link
          href="/demo"
          onClick={() => sounds.click()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-all mb-10"
        >
          <Play size={12} className="text-slate-700 fill-slate-700" />
          <span>Interactive 6-Player Sandbox Mode</span>
          <ArrowRight size={12} />
        </Link>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center text-center">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700 mb-2">
              <Users size={18} />
            </div>
            <span className="text-xs font-bold text-slate-900">3–20 Players</span>
            <span className="text-[11px] text-slate-500 mt-0.5">Real-time party multiplayer</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center text-center">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700 mb-2">
              <Flame size={18} />
            </div>
            <span className="text-xs font-bold text-slate-900">10 Categories</span>
            <span className="text-[11px] text-slate-500 mt-0.5">300+ handpicked secret cards</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center text-center">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700 mb-2">
              <ShieldCheck size={18} />
            </div>
            <span className="text-xs font-bold text-slate-900">Instant QR Join</span>
            <span className="text-[11px] text-slate-500 mt-0.5">No login or app install needed</span>
          </div>
        </div>
      </main>

      {/* App Footer */}
      <footer className="text-center text-xs text-slate-400 py-3">
        <span>© {new Date().getFullYear()} Imposter • Social Deduction Party Game</span>
      </footer>

      {/* How To Play Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl text-left max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>🎭</span> How to Play Imposter
              </h2>
              <button
                onClick={() => setShowRules(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">1. Secret Roles & Cards</span>
                <span>
                  Everyone joins the room on their own phone or laptop. Normal players receive the <strong>Secret Word</strong> (e.g. <em>Taylor Swift</em>). Imposters receive <strong>YOU ARE THE IMPOSTER</strong> and have no idea what the word is!
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">2. Verbal Discussion</span>
                <span>
                  Players talk aloud for 60 seconds. Give clever hints that prove you know the secret word without giving it away to the imposters!
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">3. Secret Voting</span>
                <span>
                  Vote privately for who you suspect is an imposter. You cannot vote for yourself.
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">4. Scoring & Leaderboard</span>
                <span>
                  • <strong>Normal Players:</strong> +2 points for correctly identifying an imposter.<br />
                  • <strong>Imposters:</strong> Points = <code>Total Players - Votes Received</code>.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowRules(false)}
              className="mt-6 w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all cursor-pointer"
            >
              Got It, Let's Play!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
