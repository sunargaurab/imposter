'use client';

import React from 'react';
import { GameLogo } from './GameLogo';
import { RoomCodeBadge } from './RoomCodeBadge';
import { SoundController } from './SoundController';
import { PlayerAvatar } from './PlayerAvatar';
import { Player, Game } from '@/types/game';
import { getCategoryById } from '@/data/categories';
import { Layers } from 'lucide-react';

interface HeaderNavProps {
  game?: Game;
  currentPlayer?: Player;
  totalPlayers?: number;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ game, currentPlayer }) => {
  const category = game ? getCategoryById(game.config.categoryId) : null;
  const isIngame = game && game.status !== 'LOBBY';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-2.5 transition-all">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Logo & Category */}
        <div className="flex items-center gap-2.5">
          <GameLogo size="sm" />

          {isIngame && category && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
              <Layers size={12} className="text-slate-500" />
              <span>{category.name}</span>
            </div>
          )}
        </div>

        {/* Center: Round Tracker if in-game */}
        {isIngame && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span>
              Round {game.currentRoundNum} of {game.config.totalRounds}
            </span>
          </div>
        )}

        {/* Right: Room badge, Player, Sound */}
        <div className="flex items-center gap-2">
          {game && <RoomCodeBadge roomCode={game.roomCode} />}
          <SoundController />

          {currentPlayer && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <PlayerAvatar name={currentPlayer.name} seed={currentPlayer.avatarSeed} size="sm" isHost={currentPlayer.isHost} />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight">{currentPlayer.name}</span>
                <span className="text-[10px] font-semibold text-slate-500 leading-tight">{currentPlayer.totalScore} pts</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
