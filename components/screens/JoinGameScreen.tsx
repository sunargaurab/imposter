'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogIn, ChevronRight } from 'lucide-react';
import { GameLogo } from '@/components/common/GameLogo';
import { sounds } from '@/lib/audio/soundEffects';

interface JoinGameScreenProps {
  initialRoomCode?: string;
}

export const JoinGameScreen: React.FC<JoinGameScreenProps> = ({ initialRoomCode = '' }) => {
  const router = useRouter();

  const [roomCode, setRoomCode] = useState(initialRoomCode.toUpperCase());
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setError('Please enter a 5-character room code.');
      return;
    }
    if (!playerName.trim()) {
      setError('Please enter your player name.');
      return;
    }

    setLoading(true);
    setError(null);
    sounds.click();

    try {
      const res = await fetch('/api/game/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: roomCode.trim().toUpperCase(),
          playerName: playerName.trim()
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Failed to join game.');
        setLoading(false);
        return;
      }

      localStorage.setItem('imposter_player_id', data.player.id);
      localStorage.setItem('imposter_session_token', data.sessionToken);
      localStorage.setItem('imposter_room_code', data.game.roomCode);

      router.push(`/game/${data.game.roomCode}`);
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 z-10">
      {/* Top App Bar */}
      <div className="flex items-center justify-between pb-6">
        <button
          onClick={() => {
            sounds.click();
            router.push('/');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        <GameLogo size="sm" />
      </div>

      <form onSubmit={handleJoin} className="space-y-5 my-auto max-w-sm w-full mx-auto pb-8">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-600 mb-2">
            <LogIn size={24} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            Join Room
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Enter code & choose your nickname</p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs text-center font-bold animate-in fade-in">
            {error}
          </div>
        )}

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          {/* Room Code */}
          <div className="space-y-1.5">
            <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              Room Code (5 Letters)
            </label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="e.g. AB7KQ"
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
              className="w-full text-center tracking-[0.2em] px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-slate-800 text-slate-900 font-mono font-black text-2xl uppercase focus:outline-none transition-all placeholder-slate-300"
            />
          </div>

          {/* Player Name */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              Your Player Name
            </label>
            <input
              type="text"
              required
              maxLength={20}
              placeholder="e.g. Sam"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-slate-800 text-slate-900 font-bold text-base focus:outline-none transition-all placeholder-slate-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-base shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Joining...</span>
            </div>
          ) : (
            <>
              <span>Enter Game</span>
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
