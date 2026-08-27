'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PlusCircle, LogIn, Sparkles, Users, ShieldCheck, HelpCircle, Flame, ArrowRight, Play } from 'lucide-react';
import { GameLogo } from '@/components/common/GameLogo';
import { SoundController } from '@/components/common/SoundController';
import { sounds } from '@/lib/audio/soundEffects';

export const HomeScreen: React.FC = () => {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col justify-between p-4 md:p-8 z-10">
      {/* Top Header */}
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full">
        <GameLogo size="sm" />
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.click();
              setShowRules(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel hover:bg-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <HelpCircle size={14} className="text-purple-400" />
            <span>How to Play</span>
          </button>
          <SoundController />
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-3xl mx-auto w-full text-center my-auto py-8 flex flex-col items-center">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-cyan-500/10 border border-purple-500/20 text-xs font-bold text-purple-300 mb-6 backdrop-blur-md"
        >
          <Sparkles size={14} className="text-rose-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>The Ultimate Social Deduction Party Game</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase leading-[1.08] mb-4 text-white"
        >
          Who is the <br />
          <span className="bg-gradient-to-r from-rose-500 via-purple-400 to-cyan-400 bg-clip-text text-transparent glow-text-rose">
            Imposter?
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-base sm:text-xl text-zinc-300 font-medium max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Find the liar. Protect your secret word. Outsmart your friends.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto mb-8"
        >
          <Link
            href="/create"
            onClick={() => sounds.click()}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-extrabold text-base shadow-xl shadow-rose-950/50 hover:shadow-rose-900/60 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <PlusCircle size={20} />
            <span>Create Game</span>
          </Link>

          <Link
            href="/join"
            onClick={() => sounds.click()}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl glass-panel-interactive text-white font-extrabold text-base border border-white/20 hover:border-cyan-400/50 hover:text-cyan-300 shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <LogIn size={20} className="text-cyan-400" />
            <span>Join Room</span>
          </Link>
        </motion.div>

        {/* Demo Simulator Quick Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link
            href="/demo"
            onClick={() => sounds.click()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/30 text-purple-300 hover:text-purple-200 text-xs font-semibold transition-all group"
          >
            <Play size={13} className="text-purple-400 fill-purple-400 group-hover:scale-110 transition-transform" />
            <span>Try 6-Player Interactive Simulator Mode</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Party Highlights Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mt-12 w-full">
          <div className="p-3 rounded-2xl glass-panel flex flex-col items-center">
            <Users size={18} className="text-rose-400 mb-1" />
            <span className="text-xs font-bold text-white">3 – 20 Players</span>
            <span className="text-[10px] text-zinc-400">Play together</span>
          </div>

          <div className="p-3 rounded-2xl glass-panel flex flex-col items-center">
            <Flame size={18} className="text-amber-400 mb-1" />
            <span className="text-xs font-bold text-white">10 Categories</span>
            <span className="text-[10px] text-zinc-400">300+ secret cards</span>
          </div>

          <div className="p-3 rounded-2xl glass-panel flex flex-col items-center">
            <ShieldCheck size={18} className="text-cyan-400 mb-1" />
            <span className="text-xs font-bold text-white">No Account</span>
            <span className="text-[10px] text-zinc-400">Instant QR join</span>
          </div>

          <div className="p-3 rounded-2xl glass-panel flex flex-col items-center">
            <Sparkles size={18} className="text-purple-400 mb-1" />
            <span className="text-xs font-bold text-white">Multi-Round</span>
            <span className="text-[10px] text-zinc-400">Podium & trophies</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-zinc-500 py-2">
        <span>© {new Date().getFullYear()} Imposter Party Game • Mobile First & Realtime</span>
      </footer>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg glass-panel bg-[#101524]/95 p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <span>🎭</span> How to Play Imposter
              </h2>
              <button
                onClick={() => setShowRules(false)}
                className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20">
                <span className="font-bold text-purple-300 block mb-1">1. Secret Roles & Cards</span>
                <span>
                  Everyone joins the room on their own phone. Normal players receive the <strong>Secret Word</strong> (e.g. <em>Taylor Swift</em>). Imposters receive <strong>YOU ARE THE IMPOSTER</strong> and have no idea what the word is!
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20">
                <span className="font-bold text-cyan-300 block mb-1">2. Verbal Discussion</span>
                <span>
                  Players talk aloud in real life for 60 seconds. Give clever hints that prove you know the secret word without giving it away to the imposters!
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/20">
                <span className="font-bold text-rose-300 block mb-1">3. Secret Voting</span>
                <span>
                  Vote for who you suspect is an imposter. You cannot vote for yourself. Votes are kept strictly secret until everyone submits!
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/20">
                <span className="font-bold text-amber-300 block mb-1">4. Scoring & Leaderboard</span>
                <span>
                  • <strong>Normal Players:</strong> +2 points for correctly identifying an imposter.<br />
                  • <strong>Imposters:</strong> Points = <code>Total Players - Votes Received</code>. The fewer votes you get, the more points you score!
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowRules(false)}
              className="mt-6 w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all cursor-pointer"
            >
              Got It, Let's Play!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
