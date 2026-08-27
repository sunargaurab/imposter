'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  ShieldAlert,
  RotateCcw,
  Clock,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Flame,
  Utensils,
  Clapperboard,
  Trophy,
  PawPrint,
  Globe2,
  Cpu,
  MapPin,
  Landmark,
  Layers
} from 'lucide-react';
import { GameLogo } from '@/components/common/GameLogo';
import { CATEGORIES } from '@/data/categories';
import { getMaxImpostersAllowed } from '@/lib/services/gameService';
import { sounds } from '@/lib/audio/soundEffects';

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Landmark,
  Utensils,
  Clapperboard,
  Trophy,
  PawPrint,
  Globe2,
  Flame,
  Cpu,
  MapPin
};

export const CreateGameScreen: React.FC = () => {
  const router = useRouter();

  const [hostName, setHostName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [imposterCount, setImposterCount] = useState(2);
  const [totalRounds, setTotalRounds] = useState(5);
  const [discussionTime, setDiscussionTime] = useState(60);
  const [selectedCategoryId, setSelectedCategoryId] = useState('celebrities');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxImpostersAllowed = getMaxImpostersAllowed(maxPlayers);

  // Auto-adjust imposter count if player count reduces
  const handlePlayerCountChange = (count: number) => {
    sounds.click();
    setMaxPlayers(count);
    const maxImp = getMaxImpostersAllowed(count);
    if (imposterCount > maxImp) {
      setImposterCount(maxImp);
    }
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostName.trim()) {
      setError('Please enter your player name.');
      return;
    }
    if (hostName.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    sounds.click();

    try {
      const res = await fetch('/api/game/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: hostName.trim(),
          config: {
            maxPlayers,
            imposterCount,
            totalRounds,
            categoryId: selectedCategoryId,
            discussionTimeSeconds: discussionTime,
            normalCorrectVoteScore: 2,
            normalWrongVoteScore: 0
          }
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Failed to create game.');
        setLoading(false);
        return;
      }

      // Store player session in localStorage as backup
      localStorage.setItem('imposter_player_id', data.hostPlayer.id);
      localStorage.setItem('imposter_session_token', data.sessionToken);
      localStorage.setItem('imposter_room_code', data.game.roomCode);

      router.push(`/game/${data.game.roomCode}`);
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen p-4 sm:p-6 md:p-8 z-10 max-w-4xl mx-auto flex flex-col justify-between">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            sounds.click();
            router.push('/');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel hover:bg-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        <GameLogo size="sm" />
      </div>

      <form onSubmit={handleCreateGame} className="space-y-8 my-auto">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            Create New Game
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Configure your room settings & pick a category</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm text-center font-medium animate-in fade-in">
            {error}
          </div>
        )}

        {/* 1. Host Name */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl space-y-3">
          <label className="block text-xs uppercase font-extrabold text-zinc-400 tracking-wider">
            Your Name (Host)
          </label>
          <input
            type="text"
            required
            maxLength={20}
            placeholder="e.g. Alex"
            value={hostName}
            onChange={e => setHostName(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl bg-black/40 border border-white/15 focus:border-rose-500 text-white placeholder-zinc-600 font-bold text-lg focus:outline-none transition-all"
          />
        </div>

        {/* 2. Game Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Players count */}
          <div className="glass-panel p-5 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider flex items-center gap-1.5">
                <Users size={14} className="text-rose-400" />
                <span>Max Players</span>
              </span>
              <span className="text-lg font-black text-rose-400 font-mono">{maxPlayers} Players</span>
            </div>

            <div className="flex items-center justify-between gap-1">
              {[4, 5, 6, 8, 10, 12, 16].map(num => (
                <button
                  type="button"
                  key={num}
                  onClick={() => handlePlayerCountChange(num)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    maxPlayers === num
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-400'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Imposter count */}
          <div className="glass-panel p-5 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-purple-400" />
                <span>Number of Imposters</span>
              </span>
              <span className="text-lg font-black text-purple-400 font-mono">
                {imposterCount} {imposterCount === 1 ? 'Imposter' : 'Imposters'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {Array.from({ length: maxImpostersAllowed }, (_, i) => i + 1).map(num => (
                <button
                  type="button"
                  key={num}
                  onClick={() => {
                    sounds.click();
                    setImposterCount(num);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    imposterCount === num
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-400'
                  }`}
                >
                  {num} {num === 1 ? 'Imposter' : 'Imposters'}
                </button>
              ))}
            </div>
          </div>

          {/* Rounds */}
          <div className="glass-panel p-5 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider flex items-center gap-1.5">
                <RotateCcw size={14} className="text-cyan-400" />
                <span>Rounds</span>
              </span>
              <span className="text-lg font-black text-cyan-400 font-mono">{totalRounds} Rounds</span>
            </div>

            <div className="flex items-center gap-2">
              {[3, 5, 7, 10].map(num => (
                <button
                  type="button"
                  key={num}
                  onClick={() => {
                    sounds.click();
                    setTotalRounds(num);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    totalRounds === num
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-950/50 font-black'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-400'
                  }`}
                >
                  {num} Rounds
                </button>
              ))}
            </div>
          </div>

          {/* Discussion timer */}
          <div className="glass-panel p-5 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider flex items-center gap-1.5">
                <Clock size={14} className="text-amber-400" />
                <span>Discussion Time</span>
              </span>
              <span className="text-lg font-black text-amber-400 font-mono">{discussionTime}s</span>
            </div>

            <div className="flex items-center gap-2">
              {[45, 60, 90, 120].map(sec => (
                <button
                  type="button"
                  key={sec}
                  onClick={() => {
                    sounds.click();
                    setDiscussionTime(sec);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    discussionTime === sec
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-950/50 font-black'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-400'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Category Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider flex items-center gap-1.5">
              <Layers size={14} className="text-purple-400" />
              <span>Select Category (10 Available)</span>
            </span>
            <span className="text-xs text-zinc-400 font-medium">Click to select</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {CATEGORIES.map(cat => {
              const IconComp = ICON_MAP[cat.icon] || Sparkles;
              const isSelected = selectedCategoryId === cat.id;

              return (
                <motion.div
                  key={cat.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    sounds.click();
                    setSelectedCategoryId(cat.id);
                  }}
                  className={`relative p-3.5 rounded-2xl flex flex-col justify-between text-left transition-all cursor-pointer border ${
                    isSelected
                      ? `bg-gradient-to-br ${cat.accentGradient} border-white/50 text-white shadow-xl shadow-purple-950/50 scale-[1.02]`
                      : 'glass-panel hover:bg-white/10 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-black/30 text-white' : 'bg-white/5 text-zinc-300'}`}>
                      <IconComp size={16} />
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-white shadow-sm shadow-white" />
                    )}
                  </div>

                  <div>
                    <h4 className={`text-xs font-black tracking-wide leading-tight ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                      {cat.name}
                    </h4>
                    <p className={`text-[10px] line-clamp-1 mt-0.5 ${isSelected ? 'text-white/80' : 'text-zinc-500'}`}>
                      {cat.tagline}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-lg shadow-xl shadow-rose-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Creating Room...</span>
            </div>
          ) : (
            <>
              <span>Create Game Room</span>
              <ChevronRight size={20} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
