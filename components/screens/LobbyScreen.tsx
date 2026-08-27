'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Play, Sparkles, QrCode, ShieldAlert, RotateCcw, Clock } from 'lucide-react';
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
  const categoryCount = game.config.categoryIds?.length || 1;
  const categoryLabel = categoryCount > 1 ? `${categoryCount} Categories` : category.name;

  const canStart = players.length >= 3;
  const missingPlayers = Math.max(0, 3 - players.length);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 animate-in fade-in duration-200">
      {/* Lobby Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs text-center">
        <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
          Lobby
        </span>

        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight mb-4">
          Room <span className="font-mono text-blue-600 tracking-wider">{game.roomCode}</span>
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-5">
          <RoomCodeBadge roomCode={game.roomCode} />
          <button
            onClick={() => {
              sounds.click();
              setIsQrOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-blue-50 hover:bg-blue-100/80 text-xs font-bold text-blue-700 transition-all cursor-pointer border border-blue-100"
          >
            <QrCode size={15} className="text-blue-600" />
            <span>QR Code</span>
          </button>
        </div>

        {/* Config Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-600">
          <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 flex items-center gap-1.5">
            <Sparkles size={13} className="text-blue-600" />
            <span>{categoryLabel}</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 flex items-center gap-1.5">
            <ShieldAlert size={13} className="text-blue-600" />
            <span>{game.config.imposterCount} {game.config.imposterCount === 1 ? 'Imposter' : 'Imposters'}</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 flex items-center gap-1.5">
            <RotateCcw size={13} className="text-blue-600" />
            <span>{game.config.totalRounds} Rounds</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 flex items-center gap-1.5">
            <Clock size={13} className="text-blue-600" />
            <span>{game.config.discussionTimeSeconds >= 60 ? `${Math.floor(game.config.discussionTimeSeconds / 60)} min` : `${game.config.discussionTimeSeconds}s`}</span>
          </span>
        </div>
      </div>

      {/* Players List Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              Players Joined
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono font-bold text-xs">
            {players.length} / {game.config.maxPlayers}
          </span>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {players.map((player, idx) => {
            const isCurrent = currentPlayer?.id === player.id;

            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.04 }}
                className={`p-4 rounded-2xl flex flex-col items-center text-center transition-all ${
                  isCurrent
                    ? 'bg-blue-50/70 border-2 border-blue-500 shadow-xs'
                    : 'bg-slate-50 border border-slate-200'
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

                <div className="w-full truncate font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-center gap-1">
                  <span className="truncate">{player.name}</span>
                  {isCurrent && <span className="text-[10px] text-blue-600 shrink-0">(You)</span>}
                </div>

                <span className="text-[10px] text-slate-500 mt-0.5">
                  {player.isHost ? '👑 Host' : 'Player'}
                </span>
              </motion.div>
            );
          })}

          {/* Empty placeholders */}
          {Array.from({ length: Math.max(0, Math.min(5, game.config.maxPlayers - players.length)) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="p-4 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center opacity-50 min-h-[100px]"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-1.5">
                <Users size={15} className="text-slate-400" />
              </div>
              <span className="text-[11px] font-medium text-slate-400">Waiting...</span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-3 max-w-md mx-auto">
          {isHost ? (
            <div className="space-y-2">
              <button
                onClick={() => {
                  sounds.click();
                  onStartGame();
                }}
                disabled={!canStart || isStarting}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-base shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {isStarting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Starting...</span>
                  </div>
                ) : (
                  <>
                    <Play size={18} className="fill-white" />
                    <span>{canStart ? 'Start Game' : `Need ${missingPlayers} More Player${missingPlayers > 1 ? 's' : ''}`}</span>
                  </>
                )}
              </button>
              {!canStart && (
                <p className="text-xs text-center text-slate-500">
                  Share code with at least {missingPlayers} more friend{missingPlayers > 1 ? 's' : ''} to start.
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-center flex flex-col items-center">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-0.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                <span>Waiting for Host to start...</span>
              </div>
              <p className="text-xs text-slate-500">Game will start automatically</p>
            </div>
          )}
        </div>
      </div>

      <QRCodeModal roomCode={game.roomCode} isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} />
    </div>
  );
};
