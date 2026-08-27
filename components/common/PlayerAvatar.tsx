'use client';

import React from 'react';
import { Crown, Skull, CheckCircle2 } from 'lucide-react';

interface PlayerAvatarProps {
  name: string;
  seed?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isHost?: boolean;
  connected?: boolean;
  showStatusBadge?: boolean;
  statusType?: 'caught' | 'escaped';
  className?: string;
}

const GRADIENTS = [
  'from-rose-500 to-orange-500',
  'from-purple-500 to-indigo-600',
  'from-cyan-500 to-blue-600',
  'from-emerald-400 to-teal-600',
  'from-amber-400 to-rose-600',
  'from-fuchsia-500 to-pink-600',
  'from-violet-600 to-purple-800',
  'from-sky-400 to-indigo-500'
];

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  name,
  seed,
  size = 'md',
  isHost = false,
  connected = true,
  showStatusBadge = false,
  statusType,
  className = ''
}) => {
  // Deterministic color from name
  const hash = (seed || name || 'P').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradient = GRADIENTS[hash % GRADIENTS.length];

  const initials = (name || 'P')
    .split(' ')
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl font-bold'
  }[size];

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* Host Crown */}
      {isHost && (
        <div className="absolute -top-3 z-10 p-0.5 rounded-full bg-amber-400 text-amber-950 shadow-md animate-bounce">
          <Crown size={size === 'sm' ? 10 : size === 'lg' || size === 'xl' ? 16 : 12} className="stroke-[2.5]" />
        </div>
      )}

      {/* Avatar Circle */}
      <div
        className={`${sizeClasses} rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center font-black text-white shadow-md border-2 border-white/20`}
      >
        <span>{initials}</span>
      </div>

      {/* Connection Indicator */}
      <div
        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0c0f17] ${
          connected ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-amber-500 animate-pulse'
        }`}
        title={connected ? 'Connected' : 'Reconnecting...'}
      />

      {/* Result Status Badge (Caught / Escaped) */}
      {showStatusBadge && statusType && (
        <div
          className={`absolute -top-2 -right-2 p-1 rounded-full text-white shadow-lg ${
            statusType === 'caught' ? 'bg-rose-600' : 'bg-emerald-500'
          }`}
        >
          {statusType === 'caught' ? <Skull size={14} /> : <CheckCircle2 size={14} />}
        </div>
      )}
    </div>
  );
};
