'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Copy, Check, Wifi } from 'lucide-react';
import { sounds } from '@/lib/audio/soundEffects';

interface QRCodeModalProps {
  roomCode: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ roomCode, isOpen, onClose }) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [joinUrl, setJoinUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isLan, setIsLan] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const computeJoinUrl = async () => {
      let baseUrl = window.location.origin;

      // If running on localhost or 127.0.0.1, try to discover LAN IP for mobile scan compatibility
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        try {
          const res = await fetch('/api/info');
          if (res.ok) {
            const data = await res.json();
            if (data.localIp && data.localIp !== 'localhost') {
              const port = window.location.port ? `:${window.location.port}` : '';
              baseUrl = `http://${data.localIp}${port}`;
              setIsLan(true);
            }
          }
        } catch {
          // Fallback to origin
        }
      }

      const finalUrl = `${baseUrl}/join/${roomCode}`;
      setJoinUrl(finalUrl);

      try {
        const url = await QRCode.toDataURL(finalUrl, {
          width: 320,
          margin: 2,
          color: {
            dark: '#0F172A',
            light: '#FFFFFF'
          }
        });
        setQrUrl(url);
      } catch {
        // QR catch
      }
    };

    computeJoinUrl();
  }, [isOpen, roomCode]);

  if (!isOpen) return null;

  const handleCopy = () => {
    sounds.click();
    navigator.clipboard.writeText(joinUrl || `${window.location.origin}/join/${roomCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-white p-6 rounded-3xl border border-slate-200 shadow-xl flex flex-col items-center text-center">
        <button
          onClick={onClose}
          aria-label="Close QR Code"
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 mb-2">
          <QrCode size={24} />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-0.5">Scan to Join</h3>
        <p className="text-xs text-slate-500 mb-4">Point any phone camera to join instantly</p>

        {/* QR Image Box */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl mb-3">
          {qrUrl ? (
            <img src={qrUrl} alt={`QR code to join room ${roomCode}`} className="w-52 h-52 rounded-xl" />
          ) : (
            <div className="w-52 h-52 flex items-center justify-center text-slate-400 text-xs animate-pulse">
              Generating QR...
            </div>
          )}
        </div>

        {isLan && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold mb-3">
            <Wifi size={12} />
            <span>Wi-Fi Network Join Ready</span>
          </div>
        )}

        <div className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Room Code</span>
            <span className="text-base font-black tracking-wider text-slate-900 font-mono">{roomCode}</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
