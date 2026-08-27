'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Copy, Check } from 'lucide-react';
import { sounds } from '@/lib/audio/soundEffects';

interface QRCodeModalProps {
  roomCode: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ roomCode, isOpen, onClose }) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/join/${roomCode}` : '';

  useEffect(() => {
    if (isOpen && joinUrl) {
      QRCode.toDataURL(joinUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#080a10',
          light: '#ffffff'
        }
      }).then(url => {
        setQrUrl(url);
      }).catch(() => {});
    }
  }, [isOpen, joinUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    sounds.click();
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm glass-panel bg-[#101524]/95 p-6 rounded-3xl border border-white/15 shadow-2xl flex flex-col items-center text-center">
        <button
          onClick={onClose}
          aria-label="Close QR Code"
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 mb-3">
          <QrCode size={28} />
        </div>

        <h3 className="text-xl font-bold text-white mb-1">Scan to Join Room</h3>
        <p className="text-xs text-zinc-400 mb-5">Point any phone camera to join instantly</p>

        {/* QR Image Box */}
        <div className="p-4 bg-white rounded-2xl shadow-inner mb-5">
          {qrUrl ? (
            <img src={qrUrl} alt={`QR code to join room ${roomCode}`} className="w-56 h-56 rounded-lg" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-zinc-800 text-sm animate-pulse">
              Generating QR...
            </div>
          )}
        </div>

        <div className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Room Code</span>
            <span className="text-lg font-black tracking-wider text-cyan-400 font-mono">{roomCode}</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all active:scale-95 cursor-pointer"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
