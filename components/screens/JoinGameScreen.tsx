'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogIn, Sparkles, ChevronRight } from 'lucide-react';
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
    <div className="relative min-h-screen p-4 sm:p-6 md:p-8 z-10 max-w-lg mx-auto flex flex-col justify-between">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
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

      <form onSubmit={handleJoin} className="space-y-6 my-auto">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 mb-3">
            <LogIn size={28} />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            Join Game Room
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Enter your room code & player name</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm text-center font-medium animate-in fade-in">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Room Code */}
          <div className="glass-panel p-5 rounded-3xl space-y-2">
            <label className="block text-xs uppercase font-extrabold text-zinc-400 tracking-wider">
              Room Code (5 Characters)
            </label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="e.g. AB7KQ"
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
              className="w-full text-center tracking-[0.25em] px-4 py-3 rounded-2xl bg-black/40 border border-white/15 focus:border-cyan-400 text-cyan-400 font-mono font-black text-2xl uppercase focus:outline-none transition-all placeholder-zinc-700"
            />
          </div>

          {/* Player Name */}
          <div className="glass-panel p-5 rounded-3xl space-y-2">
            <label className="block text-xs uppercase font-extrabold text-zinc-400 tracking-wider">
              Your Player Name
            </label>
            <input
              type="text"
              required
              maxLength={20}
              placeholder="e.g. Sam"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-black/40 border border-white/15 focus:border-cyan-400 text-white font-bold text-lg focus:outline-none transition-all placeholder-zinc-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-black font-black text-lg shadow-xl shadow-cyan-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          {loading ? (
            <div className="flex items-center gap-2 text-white">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Joining Room...</span>
            </div>
          ) : (
            <>
              <span className="text-white">Enter Game</span>
              <ChevronRight size={20} className="text-white" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
