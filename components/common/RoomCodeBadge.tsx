'use client';

import React, { useState } from 'react';
import { Copy, Check, QrCode, Share2 } from 'lucide-react';
import { QRCodeModal } from './QRCodeModal';
import { sounds } from '@/lib/audio/soundEffects';

interface RoomCodeBadgeProps {
  roomCode: string;
  className?: string;
  showQrButton?: boolean;
}

export const RoomCodeBadge: React.FC<RoomCodeBadgeProps> = ({
  roomCode,
  className = '',
  showQrButton = true
}) => {
  const [copied, setCopied] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.click();
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.click();
    const joinUrl = `${window.location.origin}/join/${roomCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Imposter Game!',
          text: `Join my Imposter game room: ${roomCode}`,
          url: joinUrl,
        });
        return;
      } catch {
        // Fallback to copy
      }
    }
    handleCopy(e);
  };

  return (
    <>
      <div className={`inline-flex items-center gap-1.5 p-1.5 rounded-2xl glass-panel bg-white/5 border border-white/10 ${className}`}>
        {/* Room Code Clickable Tag */}
        <div
          onClick={handleCopy}
          role="button"
          tabIndex={0}
          title="Click to copy room code"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 transition-all cursor-pointer group select-all"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">ROOM</span>
          <span className="text-sm font-black font-mono tracking-widest text-cyan-400 group-hover:text-cyan-300">
            {roomCode}
          </span>
          {copied ? (
            <Check size={14} className="text-emerald-400 animate-in zoom-in" />
          ) : (
            <Copy size={13} className="text-zinc-500 group-hover:text-zinc-300" />
          )}
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          aria-label="Share room link"
          title="Share room link"
          className="p-2 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer active:scale-95"
        >
          <Share2 size={15} />
        </button>

        {/* QR Button */}
        {showQrButton && (
          <button
            onClick={() => {
              sounds.click();
              setIsQrOpen(true);
            }}
            aria-label="Show QR Code"
            title="Scan QR Code to join"
            className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer active:scale-95"
          >
            <QrCode size={15} />
          </button>
        )}
      </div>

      <QRCodeModal roomCode={roomCode} isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} />
    </>
  );
};
