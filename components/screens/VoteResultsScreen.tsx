'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Skull, CheckCircle2, ShieldAlert, Sparkles, ArrowRight, BarChart3 } from 'lucide-react';
import { RoundResultSummary } from '@/types/game';
import { PlayerAvatar } from '@/components/common/PlayerAvatar';
import { sounds } from '@/lib/audio/soundEffects';

interface VoteResultsScreenProps {
  roundResult: RoundResultSummary;
  onProceedToScoring: () => void;
}

export const VoteResultsScreen: React.FC<VoteResultsScreenProps> = ({
  roundResult,
  onProceedToScoring
}) => {
  const [revealStep, setRevealStep] = useState(0);

  useEffect(() => {
    // Dramatic step-by-step reveal timeline
    sounds.imposterReveal();

    const t1 = setTimeout(() => {
      setRevealStep(1); // Reveal Imposters
      sounds.cardReveal();
    }, 1200);

    const t2 = setTimeout(() => {
      setRevealStep(2); // Reveal Secret Word
      sounds.scoreDing();
    }, 2800);

    const t3 = setTimeout(() => {
      setRevealStep(3); // Reveal Vote Distribution
      sounds.tick();
    }, 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const maxVotes = Math.max(1, ...roundResult.voteDistribution.map(v => v.voteCount));

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 my-auto animate-in zoom-in-95 duration-300">
      {/* Title */}
      <div className="text-center space-y-1">
        <span className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">
          Round {roundResult.roundNumber} Reveal
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          The Truth Revealed
        </h2>
      </div>

      {/* 1. Imposter Identities Reveal Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-rose-500/30 bg-gradient-to-b from-rose-950/40 via-[#140b12] to-[#090a10] shadow-2xl relative overflow-hidden">
        <div className="text-center mb-6">
          <span className="text-xs uppercase font-black tracking-[0.25em] text-rose-400 block mb-1">
            Suspense
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white uppercase">
            The Imposter{roundResult.imposters.length > 1 ? 's Were' : ' Was'}...
          </h3>
        </div>

        {revealStep >= 1 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roundResult.imposters.map((imp) => (
              <motion.div
                key={imp.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className={`p-5 rounded-2xl border-2 flex items-center gap-4 ${
                  imp.caught
                    ? 'bg-rose-950/70 border-rose-500 shadow-xl shadow-rose-950/60'
                    : 'bg-emerald-950/60 border-emerald-500 shadow-xl shadow-emerald-950/60'
                }`}
              >
                <PlayerAvatar
                  name={imp.name}
                  seed={imp.avatarSeed}
                  size="lg"
                  showStatusBadge
                  statusType={imp.caught ? 'caught' : 'escaped'}
                />

                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-white">{imp.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] uppercase tracking-wider">
                      IMPOSTER
                    </span>
                  </div>

                  <span
                    className={`text-xs font-black mt-1 ${
                      imp.caught ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {imp.caught
                      ? `Caught! Received ${imp.votesReceived} vote${imp.votesReceived === 1 ? '' : 's'}`
                      : `Escaped! Received only ${imp.votesReceived} vote${imp.votesReceived === 1 ? '' : 's'}`}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* 2. Secret Word Reveal Card */}
      {revealStep >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel p-5 sm:p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-purple-950/30 to-indigo-950/30 text-center flex flex-col items-center"
        >
          <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400 mb-1">
            Category: {roundResult.categoryName}
          </span>
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
            Secret Word Was:
          </span>
          <h4 className="text-3xl sm:text-4xl font-black text-white glow-text-cyan mt-1">
            {roundResult.secretWord}
          </h4>
        </motion.div>
      )}

      {/* 3. Vote Distribution Bar Chart */}
      {revealStep >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel p-6 rounded-3xl space-y-4 border border-white/10"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 size={16} className="text-purple-400" />
              <span>Vote Distribution</span>
            </h4>
            {roundResult.isTie && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px] uppercase">
                TIE VOTE
              </span>
            )}
          </div>

          <div className="space-y-3">
            {roundResult.voteDistribution.map((item, idx) => {
              const widthPct = Math.max(8, Math.round((item.voteCount / maxVotes) * 100));

              return (
                <div key={item.playerId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <PlayerAvatar name={item.playerName} seed={item.avatarSeed} size="sm" />
                      <span className="text-white">{item.playerName}</span>
                      {item.isImposter && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white font-extrabold text-[9px] uppercase">
                          Imposter
                        </span>
                      )}
                    </div>
                    <span className="text-zinc-300 font-mono">
                      {item.voteCount} vote{item.voteCount === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.08 }}
                      className={`h-full rounded-full ${
                        item.isImposter
                          ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                          : 'bg-gradient-to-r from-purple-500 to-cyan-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Continue CTA */}
      <div className="pt-2">
        <button
          onClick={() => {
            sounds.click();
            onProceedToScoring();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-lg shadow-xl shadow-cyan-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <span>View Round Scoring</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
