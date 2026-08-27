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
      <div className={`inline-flex items-center gap-1 p-1 rounded-2xl bg-white border border-slate-200 shadow-xs ${className}`}>
        {/* Room Code Clickable Tag */}
        <div
          onClick={handleCopy}
          role="button"
          tabIndex={0}
          title="Click to copy room code"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200/80 transition-all cursor-pointer group select-all"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">ROOM</span>
          <span className="text-xs font-black font-mono tracking-widest text-slate-900">
            {roomCode}
          </span>
          {copied ? (
            <Check size={12} className="text-emerald-600 animate-in zoom-in" />
          ) : (
            <Copy size={12} className="text-slate-400 group-hover:text-slate-700" />
          )}
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          aria-label="Share room link"
          title="Share room link"
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all cursor-pointer active:scale-95"
        >
          <Share2 size={13} />
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
            className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all cursor-pointer active:scale-95"
          >
            <QrCode size={13} />
          </button>
        )}
      </div>

      <QRCodeModal roomCode={roomCode} isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} />
    </>
  );
};
