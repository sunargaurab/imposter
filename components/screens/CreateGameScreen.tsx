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
  const [discussionTime, setDiscussionTime] = useState(300); // 5 min default
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(['celebrities']);

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

  const handleToggleCategory = (id: string) => {
    sounds.click();
    setSelectedCategoryIds(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter(cId => cId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAllCategories = () => {
    sounds.click();
    if (selectedCategoryIds.length === CATEGORIES.length) {
      setSelectedCategoryIds([CATEGORIES[0].id]);
    } else {
      setSelectedCategoryIds(CATEGORIES.map(c => c.id));
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
    if (selectedCategoryIds.length === 0) {
      setError('Please select at least one category.');
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
            categoryId: selectedCategoryIds[0],
            categoryIds: selectedCategoryIds,
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

  const isAllSelected = selectedCategoryIds.length === CATEGORIES.length;

  return (
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 md:p-8 z-10 w-full max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 w-full">
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

      <form onSubmit={handleCreateGame} className="space-y-5 my-auto pb-6 w-full">
        {/* Title */}
        <div className="text-center mb-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
            Create Room
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Customize settings and pick categories</p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs text-center font-bold animate-in fade-in max-w-md mx-auto">
            {error}
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column: Host Name & Settings */}
          <div className="lg:col-span-6 space-y-4">
            {/* Host Name */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                Your Name (Host)
              </label>
              <input
                type="text"
                required
                maxLength={20}
                placeholder="e.g. Alex"
                value={hostName}
                onChange={e => setHostName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-900 font-bold text-base focus:outline-none transition-all"
              />
            </div>

            {/* Settings Group */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              {/* Max Players */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                    <Users size={14} className="text-blue-600" />
                    <span>Max Players</span>
                  </span>
                  <span className="text-xs font-bold text-blue-700 font-mono">{maxPlayers}</span>
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {[4, 5, 6, 8, 10, 12, 16].map(num => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => handlePlayerCountChange(num)}
                      className={`flex-1 min-w-[38px] py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        maxPlayers === num
                          ? 'bg-blue-600 text-white shadow-xs'
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
                    <ShieldAlert size={14} className="text-blue-600" />
                    <span>Imposters</span>
                  </span>
                  <span className="text-xs font-bold text-blue-700 font-mono">
                    {imposterCount} {imposterCount === 1 ? 'Imposter' : 'Imposters'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
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
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rounds */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                    <RotateCcw size={14} className="text-blue-600" />
                    <span>Rounds</span>
                  </span>
                  <span className="text-xs font-bold text-blue-700 font-mono">{totalRounds}</span>
                </div>

                <div className="flex items-center gap-1.5">
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
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discussion Timer (Default 5 min / 300s) */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                    <Clock size={14} className="text-blue-600" />
                    <span>Discussion Timer</span>
                  </span>
                  <span className="text-xs font-bold text-blue-700 font-mono">
                    {discussionTime >= 60 ? `${Math.floor(discussionTime / 60)} min` : `${discussionTime}s`}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {[
                    { label: '1m', sec: 60 },
                    { label: '2m', sec: 120 },
                    { label: '3m', sec: 180 },
                    { label: '5m', sec: 300 }
                  ].map(opt => (
                    <button
                      type="button"
                      key={opt.sec}
                      onClick={() => {
                        sounds.click();
                        setDiscussionTime(opt.sec);
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        discussionTime === opt.sec
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Multiple Category Selection */}
          <div className="lg:col-span-6 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                <Layers size={14} className="text-blue-600" />
                <span>Categories</span>
              </span>

              <button
                type="button"
                onClick={handleSelectAllCategories}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer px-2 py-0.5 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {isAllSelected ? 'Deselect All' : 'Select All'} ({selectedCategoryIds.length}/{CATEGORIES.length})
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CATEGORIES.map(cat => {
                const IconComp = ICON_MAP[cat.icon] || Sparkles;
                const isSelected = selectedCategoryIds.includes(cat.id);

                return (
                  <div
                    key={cat.id}
                    onClick={() => handleToggleCategory(cat.id)}
                    className={`p-3 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-xl shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-blue-600 border border-slate-200'}`}>
                        <IconComp size={14} />
                      </div>
                      <div className="min-w-0 truncate">
                        <h4 className="text-xs font-bold truncate leading-tight">
                          {cat.name}
                        </h4>
                      </div>
                    </div>

                    {isSelected && (
                      <Check size={14} className="text-white shrink-0 ml-1.5" />
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
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-base shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] max-w-md mx-auto"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Creating...</span>
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
