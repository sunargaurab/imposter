'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Layers,
  Check
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
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 md:p-8 z-10 w-full max-w-5xl mx-auto">
      {/* Top App Bar */}
      <div className="flex items-center justify-between pb-6 w-full">
        <button
          onClick={() => {
            sounds.click();
            router.push('/');
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        <GameLogo size="sm" />
      </div>

      <form onSubmit={handleCreateGame} className="space-y-6 my-auto pb-8 w-full">
        {/* Title */}
        <div className="text-center mb-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
            Create Game Room
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Configure your room settings & select a category</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs text-center font-bold animate-in fade-in max-w-xl mx-auto">
            {error}
          </div>
        )}

        {/* 2-Column Responsive Layout on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Player Name & Game Rules */}
          <div className="lg:col-span-6 space-y-4">
            {/* Host Name Input */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                Your Player Name (Host)
              </label>
              <input
                type="text"
                required
                maxLength={20}
                placeholder="e.g. Alex"
                value={hostName}
                onChange={e => setHostName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-slate-800 text-slate-900 placeholder-slate-400 font-bold text-base focus:outline-none transition-all"
              />
            </div>

            {/* Settings Group */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              {/* Players count */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                    <Users size={14} className="text-slate-600" />
                    <span>Max Players</span>
                  </span>
                  <span className="text-xs font-bold text-slate-900 font-mono">{maxPlayers} Players</span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[4, 5, 6, 8, 10, 12, 16].map(num => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => handlePlayerCountChange(num)}
                      className={`flex-1 min-w-[38px] py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        maxPlayers === num
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Imposter count */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-slate-600" />
                    <span>Number of Imposters</span>
                  </span>
                  <span className="text-xs font-bold text-slate-900 font-mono">
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
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        imposterCount === num
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {num} {num === 1 ? 'Imposter' : 'Imposters'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rounds */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                    <RotateCcw size={14} className="text-slate-600" />
                    <span>Total Rounds</span>
                  </span>
                  <span className="text-xs font-bold text-slate-900 font-mono">{totalRounds} Rounds</span>
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
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        totalRounds === num
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discussion timer */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                    <Clock size={14} className="text-slate-600" />
                    <span>Discussion Timer</span>
                  </span>
                  <span className="text-xs font-bold text-slate-900 font-mono">{discussionTime}s</span>
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
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        discussionTime === sec
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Category Grid */}
          <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                <Layers size={14} className="text-slate-600" />
                <span>Select Category</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">10 Available</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CATEGORIES.map(cat => {
                const IconComp = ICON_MAP[cat.icon] || Sparkles;
                const isSelected = selectedCategoryId === cat.id;

                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      sounds.click();
                      setSelectedCategoryId(cat.id);
                    }}
                    className={`p-3.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}>
                        <IconComp size={16} />
                      </div>
                      <div className="min-w-0 truncate">
                        <h4 className="text-xs font-bold truncate leading-tight">
                          {cat.name}
                        </h4>
                        <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {cat.tagline}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <Check size={16} className="text-white shrink-0 ml-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-base shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] max-w-lg mx-auto"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Creating Room...</span>
            </div>
          ) : (
            <>
              <span>Create Game Room</span>
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
