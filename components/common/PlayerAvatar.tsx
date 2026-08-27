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

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-indigo-100 text-indigo-800 border-indigo-200',
  'bg-slate-200 text-slate-800 border-slate-300',
  'bg-emerald-100 text-emerald-800 border-emerald-200',
  'bg-amber-100 text-amber-800 border-amber-200',
  'bg-rose-100 text-rose-800 border-rose-200',
  'bg-violet-100 text-violet-800 border-violet-200',
  'bg-teal-100 text-teal-800 border-teal-200',
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
  const hash = (seed || name || 'P').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorClass = AVATAR_COLORS[hash % AVATAR_COLORS.length];

  const initials = (name || 'P')
    .split(' ')
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base font-bold',
    xl: 'w-20 h-20 text-xl font-bold'
  }[size];

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* Host Crown */}
      {isHost && (
        <div className="absolute -top-2.5 z-10 p-0.5 rounded-full bg-amber-400 text-amber-950 shadow-sm">
          <Crown size={size === 'sm' ? 10 : size === 'lg' || size === 'xl' ? 14 : 11} className="stroke-[2.5]" />
        </div>
      )}

      {/* Avatar Container */}
      <div
        className={`${sizeClasses} rounded-2xl ${colorClass} flex items-center justify-center font-bold shadow-xs border`}
      >
        <span>{initials}</span>
      </div>

      {/* Connection Indicator */}
      <div
        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
          connected ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'
        }`}
        title={connected ? 'Connected' : 'Reconnecting...'}
      />

      {/* Result Status Badge (Caught / Escaped) */}
      {showStatusBadge && statusType && (
        <div
          className={`absolute -top-1.5 -right-1.5 p-0.5 rounded-full text-white shadow-sm ${
            statusType === 'caught' ? 'bg-red-600' : 'bg-emerald-600'
          }`}
        >
          {statusType === 'caught' ? <Skull size={13} /> : <CheckCircle2 size={13} />}
        </div>
      )}
    </div>
  );
};
