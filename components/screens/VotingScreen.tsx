'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Vote, CheckCircle2, Lock, Users } from 'lucide-react';
import { Player, Game } from '@/types/game';
import { PlayerAvatar } from '@/components/common/PlayerAvatar';
import { sounds } from '@/lib/audio/soundEffects';

interface VotingScreenProps {
  game: Game;
  players: Player[];
  currentPlayer?: Player;
  totalVotedCount?: number;
  onSubmitVote: (targetPlayerId: string) => Promise<void>;
  onForceConclude?: () => void;
  isHost?: boolean;
}

export const VotingScreen: React.FC<VotingScreenProps> = ({
  game,
  players,
  currentPlayer,
  totalVotedCount = 0,
  onSubmitVote,
  onForceConclude,
  isHost = false
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (playerId: string) => {
    if (isSubmitted || playerId === currentPlayer?.id) return;
    sounds.click();
    setSelectedTargetId(playerId);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedTargetId) {
      setError('Please tap a player to cast your vote.');
      return;
    }
    setSubmitting(true);
    setError(null);
    sounds.voteSubmitted();

    try {
      await onSubmitVote(selectedTargetId);
      setIsSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit vote.';
      setError(message);
      setSubmitting(false);
    }
  };

  const progressPercent = Math.min(100, Math.round((totalVotedCount / players.length) * 100));

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5 my-auto animate-in zoom-in-95 duration-200">
      {/* Title */}
      <div className="text-center space-y-1">
        <span className="text-[11px] uppercase font-bold tracking-widest text-slate-400">
          Secret Ballot • Round {game.currentRoundNum}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
          Who is the Imposter?
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          {isSubmitted
            ? 'Vote submitted! Waiting for other players...'
            : 'Select the player you suspect and cast your secret vote.'}
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold text-center">
          {error}
        </div>
      )}

      {/* Players Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {players.map((player) => {
          const isSelf = currentPlayer?.id === player.id;
          const isSelected = selectedTargetId === player.id;

          return (
            <div
              key={player.id}
              onClick={() => handleSelect(player.id)}
              className={`relative p-4 sm:p-5 rounded-3xl flex flex-col items-center text-center transition-all ${
                isSelf
                  ? 'opacity-40 bg-slate-100 border border-slate-200 cursor-not-allowed'
                  : isSubmitted
                  ? isSelected
                    ? 'bg-blue-600 text-white border-2 border-blue-600 shadow-sm'
                    : 'bg-white border border-slate-200 opacity-50 cursor-default'
                  : isSelected
                  ? 'bg-blue-50 border-2 border-blue-600 shadow-xs cursor-pointer'
                  : 'bg-white hover:bg-slate-50 border border-slate-200 shadow-xs cursor-pointer active:scale-98'
              }`}
            >
              {isSelected && (
                <div className={`absolute top-3 right-3 p-0.5 rounded-full ${isSubmitted ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
                  <CheckCircle2 size={16} />
                </div>
              )}

              <PlayerAvatar
                name={player.name}
                seed={player.avatarSeed}
                size="lg"
                isHost={player.isHost}
                connected={player.connected}
                className="mb-2.5"
              />

              <span className={`font-bold text-sm sm:text-base truncate max-w-full ${isSelected && isSubmitted ? 'text-white' : 'text-slate-900'}`}>
                {player.name}
              </span>

              <span className={`text-[11px] font-semibold mt-0.5 ${isSelected && isSubmitted ? 'text-blue-100' : 'text-slate-500'}`}>
                {isSelf ? '(You)' : `${player.totalScore} pts`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress & Submit Box */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl space-y-3.5 border border-slate-200 shadow-xs max-w-xl mx-auto">
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600 flex items-center gap-1.5">
              <Users size={14} className="text-blue-600" />
              <span>Players Voted</span>
            </span>
            <span className="text-blue-700 font-mono">
              {totalVotedCount} / {players.length} Submitted
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <motion.div
              className="h-full bg-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Submit or Locked state */}
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedTargetId || submitting}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-base shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Locking Vote...</span>
              </div>
            ) : (
              <>
                <Vote size={18} />
                <span>Confirm Secret Vote</span>
              </>
            )}
          </button>
        ) : (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center font-bold text-xs flex items-center justify-center gap-2">
            <Lock size={15} className="text-emerald-600" />
            <span>Vote Locked • Waiting for remaining players...</span>
          </div>
        )}

        {/* Host Force Conclude fallback */}
        {isHost && isSubmitted && onForceConclude && (
          <div className="pt-1 text-center">
            <button
              onClick={() => {
                sounds.click();
                onForceConclude();
              }}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 underline cursor-pointer"
            >
              Host Override: Conclude Voting Early
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
