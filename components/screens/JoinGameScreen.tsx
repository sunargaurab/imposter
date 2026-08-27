'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';
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

  const isPreFilled = Boolean(initialRoomCode);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Extract 5-letter code even if a full URL or hash was pasted
    let cleanCode = roomCode.trim().toUpperCase();
    if (cleanCode.includes('/JOIN/')) {
      cleanCode = cleanCode.split('/JOIN/').pop()?.trim() || cleanCode;
    }
    cleanCode = cleanCode.replace(/[^A-Z0-9]/g, '').substring(0, 6);
    const cleanName = playerName.trim();

    if (!cleanCode) {
      setError('Please enter a valid room code.');
      return;
    }
    if (!cleanName) {
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
          roomCode: cleanCode,
          playerName: cleanName
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Room not found. Check code and try again.');
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
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 md:p-8 z-10 w-full max-w-md mx-auto">
      {/* Top Bar */}
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

      <form onSubmit={handleJoin} className="space-y-4 my-auto w-full pb-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
            {isPreFilled ? 'Join Game' : 'Join Room'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isPreFilled ? `Enter your name to join room ${roomCode}` : 'Enter 5-letter code & name'}
          </p>
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
              Room Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="e.g. AB7KQ"
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
              className="w-full text-center tracking-[0.25em] px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-900 font-mono font-black text-2xl uppercase focus:outline-none transition-all placeholder-slate-300"
            />
          </div>

          {/* Player Name */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              Your Name
            </label>
            <input
              type="text"
              required
              autoFocus
              maxLength={20}
              placeholder="Enter your name"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-900 font-bold text-base focus:outline-none transition-all placeholder-slate-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-base shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Joining...</span>
            </div>
          ) : (
            <>
              <span>Join Game</span>
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
