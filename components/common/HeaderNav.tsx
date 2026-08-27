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

export const HeaderNav: React.FC<HeaderNavProps> = ({ game, currentPlayer, totalPlayers }) => {
  const category = game ? getCategoryById(game.config.categoryId) : null;
  const isIngame = game && game.status !== 'LOBBY';

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#090b10]/80 border-b border-white/5 px-4 py-2.5 transition-all">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Logo & Category */}
        <div className="flex items-center gap-3">
          <GameLogo size="sm" />

          {isIngame && category && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300">
              <Layers size={13} className="text-purple-400" />
              <span>{category.name}</span>
            </div>
          )}
        </div>

        {/* Center: Round Tracker if in-game */}
        {isIngame && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs font-bold shadow-sm shadow-purple-950/50">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
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
            <div className="flex items-center gap-2 pl-1 border-l border-white/10">
              <PlayerAvatar name={currentPlayer.name} seed={currentPlayer.avatarSeed} size="sm" isHost={currentPlayer.isHost} />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight">{currentPlayer.name}</span>
                <span className="text-[10px] font-semibold text-cyan-400 leading-tight">{currentPlayer.totalScore} pts</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
