'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, Play, Sparkles, QrCode, ShieldAlert, RotateCcw, Clock, Share2 } from 'lucide-react';
import { Player, Game } from '@/types/game';
import { PlayerAvatar } from '@/components/common/PlayerAvatar';
import { RoomCodeBadge } from '@/components/common/RoomCodeBadge';
import { QRCodeModal } from '@/components/common/QRCodeModal';
import { getCategoryById } from '@/data/categories';
import { sounds } from '@/lib/audio/soundEffects';

interface LobbyScreenProps {
  game: Game;
  players: Player[];
  currentPlayer?: Player;
  onStartGame: () => void;
  isStarting?: boolean;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  game,
  players,
  currentPlayer,
  onStartGame,
  isStarting = false
}) => {
  const [isQrOpen, setIsQrOpen] = useState(false);
  const isHost = currentPlayer?.isHost ?? false;
  const category = getCategoryById(game.config.categoryId);

  const canStart = players.length >= 3;
  const missingPlayers = Math.max(0, 3 - players.length);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Lobby Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl text-center relative overflow-hidden border border-white/10">
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-rose-600/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          <span className="text-xs uppercase font-extrabold tracking-widest text-zinc-400 mb-2">
            Game Lobby
          </span>

          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mb-4">
            Room Code:{' '}
            <span className="text-cyan-400 font-mono tracking-wider">{game.roomCode}</span>
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <RoomCodeBadge roomCode={game.roomCode} />
            <button
              onClick={() => {
                sounds.click();
                setIsQrOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl glass-panel hover:bg-white/10 text-xs font-bold text-cyan-300 hover:text-white transition-all cursor-pointer"
            >
              <QrCode size={16} />
              <span>Show QR Code</span>
            </button>
          </div>

          {/* Config Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-zinc-300">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
              <Sparkles size={13} className="text-purple-400" />
              <span>{category.name}</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
              <ShieldAlert size={13} className="text-rose-400" />
              <span>{game.config.imposterCount} {game.config.imposterCount === 1 ? 'Imposter' : 'Imposters'}</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
              <RotateCcw size={13} className="text-cyan-400" />
              <span>{game.config.totalRounds} Rounds</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
              <Clock size={13} className="text-amber-400" />
              <span>{game.config.discussionTimeSeconds}s Timer</span>
            </span>
          </div>
        </div>
      </div>

      {/* Players Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-5 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-purple-400" />
            <h3 className="text-lg font-black text-white uppercase tracking-wide">
              Players Joined
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono font-bold text-xs">
            {players.length} / {game.config.maxPlayers}
          </span>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {players.map((player, idx) => {
            const isCurrent = currentPlayer?.id === player.id;

            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-4 rounded-2xl flex flex-col items-center text-center transition-all ${
                  isCurrent
                    ? 'bg-purple-950/40 border-2 border-purple-500/50 shadow-lg shadow-purple-950/50'
                    : 'glass-panel border-white/10'
                }`}
              >
                <PlayerAvatar
                  name={player.name}
                  seed={player.avatarSeed}
                  size="md"
                  isHost={player.isHost}
                  connected={player.connected}
                  className="mb-2"
                />

                <div className="w-full truncate font-bold text-sm text-white flex items-center justify-center gap-1">
                  <span>{player.name}</span>
                  {isCurrent && <span className="text-[10px] text-purple-300">(You)</span>}
                </div>

                <span className="text-[10px] text-zinc-400 mt-0.5">
                  {player.isHost ? '👑 Room Host' : 'Player'}
                </span>
              </motion.div>
            );
          })}

          {/* Empty slot placeholders */}
          {Array.from({ length: Math.max(0, game.config.maxPlayers - players.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="p-4 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center opacity-40 min-h-[110px]"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                <Users size={16} className="text-zinc-500" />
              </div>
              <span className="text-[11px] font-medium text-zinc-500">Waiting for player...</span>
            </div>
          ))}
        </div>

        {/* Action button / Status */}
        <div className="pt-4 border-t border-white/10">
          {isHost ? (
            <div className="space-y-2">
              <button
                onClick={() => {
                  sounds.click();
                  onStartGame();
                }}
                disabled={!canStart || isStarting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 disabled:opacity-40 text-white font-black text-lg shadow-xl shadow-rose-950/50 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
              >
                {isStarting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Starting Game...</span>
                  </div>
                ) : (
                  <>
                    <Play size={20} className="fill-white" />
                    <span>{canStart ? 'Start Game' : `Need ${missingPlayers} More Player${missingPlayers > 1 ? 's' : ''}`}</span>
                  </>
                )}
              </button>
              {!canStart && (
                <p className="text-xs text-center text-zinc-400">
                  Share the room code or QR code with at least {missingPlayers} more friend{missingPlayers > 1 ? 's' : ''} to start.
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center flex flex-col items-center">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm mb-1">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
                <span>Waiting for the Host to start the game...</span>
              </div>
              <p className="text-xs text-zinc-400">Get ready to discuss and find the imposter!</p>
            </div>
          )}
        </div>
      </div>

      <QRCodeModal roomCode={game.roomCode} isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} />
    </div>
  );
};
