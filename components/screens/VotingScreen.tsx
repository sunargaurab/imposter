'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Vote, CheckCircle2, Lock, Users, ShieldAlert } from 'lucide-react';
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
    <div className="w-full max-w-3xl mx-auto space-y-6 my-auto animate-in zoom-in-95 duration-300">
      {/* Title */}
      <div className="text-center space-y-1">
        <span className="text-xs uppercase font-extrabold tracking-widest text-rose-400">
          Secret Ballot • Round {game.currentRoundNum}
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          Who is the Imposter?
        </h2>
        <p className="text-xs sm:text-sm text-zinc-300">
          {isSubmitted
            ? 'Your vote is locked. Waiting for other players to finish voting...'
            : 'Select the player you believe is hiding the truth and vote.'}
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold text-center">
          {error}
        </div>
      )}

      {/* Players Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {players.map((player) => {
          const isSelf = currentPlayer?.id === player.id;
          const isSelected = selectedTargetId === player.id;

          return (
            <motion.div
              key={player.id}
              whileHover={!isSubmitted && !isSelf ? { scale: 1.02 } : {}}
              whileTap={!isSubmitted && !isSelf ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(player.id)}
              className={`relative p-5 rounded-3xl flex flex-col items-center text-center transition-all ${
                isSelf
                  ? 'opacity-40 bg-white/5 border border-white/5 cursor-not-allowed'
                  : isSubmitted
                  ? isSelected
                    ? 'bg-rose-950/60 border-2 border-rose-500 shadow-xl shadow-rose-950/50 glow-box-rose'
                    : 'glass-panel border-white/5 opacity-50 cursor-default'
                  : isSelected
                  ? 'bg-rose-950/70 border-2 border-rose-500 shadow-xl shadow-rose-950/50 glow-box-rose cursor-pointer'
                  : 'glass-panel-interactive border-white/10 cursor-pointer'
              }`}
            >
              {/* Selected check badge */}
              {isSelected && (
                <div className="absolute top-3 right-3 p-1 rounded-full bg-rose-500 text-white shadow-md">
                  <CheckCircle2 size={16} />
                </div>
              )}

              <PlayerAvatar
                name={player.name}
                seed={player.avatarSeed}
                size="lg"
                isHost={player.isHost}
                connected={player.connected}
                className="mb-3"
              />

              <span className="font-extrabold text-base text-white truncate max-w-full">
                {player.name}
              </span>

              <span className="text-[11px] font-semibold text-zinc-400 mt-0.5">
                {isSelf ? '(You - Cannot vote)' : `${player.totalScore} pts`}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Progress & Submit Box */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl space-y-4 border border-white/10">
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Users size={14} className="text-cyan-400" />
              <span>Players Voted</span>
            </span>
            <span className="text-cyan-300 font-mono">
              {totalVotedCount} / {players.length} Submitted
            </span>
          </div>

          <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Submit or Locked state */}
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedTargetId || submitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 disabled:opacity-40 text-white font-black text-lg shadow-xl shadow-rose-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Locking Vote...</span>
              </div>
            ) : (
              <>
                <Vote size={20} />
                <span>Submit Secret Vote</span>
              </>
            )}
          </button>
        ) : (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center font-bold text-sm flex items-center justify-center gap-2">
            <Lock size={16} />
            <span>Vote Locked & Encrypted • Awaiting remaining players...</span>
          </div>
        )}

        {/* Host Force Conclude fallback if player disconnected */}
        {isHost && isSubmitted && onForceConclude && (
          <div className="pt-2 text-center">
            <button
              onClick={() => {
                sounds.click();
                onForceConclude();
              }}
              className="text-xs font-semibold text-zinc-400 hover:text-rose-400 transition-colors underline cursor-pointer"
            >
              Host Override: Conclude Voting Early
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
