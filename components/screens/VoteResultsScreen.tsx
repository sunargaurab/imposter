'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3 } from 'lucide-react';
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
    sounds.imposterReveal();

    const t1 = setTimeout(() => {
      setRevealStep(1);
      sounds.cardReveal();
    }, 900);

    const t2 = setTimeout(() => {
      setRevealStep(2);
      sounds.scoreDing();
    }, 2000);

    const t3 = setTimeout(() => {
      setRevealStep(3);
      sounds.tick();
    }, 3100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const maxVotes = Math.max(1, ...roundResult.voteDistribution.map(v => v.voteCount));

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5 my-auto animate-in zoom-in-95 duration-200 pb-6">
      {/* Title */}
      <div className="text-center space-y-1">
        <span className="text-[11px] uppercase font-bold tracking-widest text-slate-400">
          Round {roundResult.roundNumber} Results
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
          The Reveal
        </h2>
      </div>

      {/* 1. Imposter Identities Reveal Card */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs">
        <div className="text-center mb-3">
          <span className="text-[11px] uppercase font-bold tracking-widest text-slate-400 block mb-0.5">
            Identity Reveal
          </span>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase">
            The Imposter{roundResult.imposters.length > 1 ? 's Were' : ' Was'}
          </h3>
        </div>

        {revealStep >= 1 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roundResult.imposters.map((imp) => (
              <motion.div
                key={imp.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
                  imp.caught
                    ? 'bg-red-50/80 border-red-200'
                    : 'bg-emerald-50/80 border-emerald-200'
                }`}
              >
                <PlayerAvatar
                  name={imp.name}
                  seed={imp.avatarSeed}
                  size="lg"
                  showStatusBadge
                  statusType={imp.caught ? 'caught' : 'escaped'}
                />

                <div className="flex flex-col text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900 truncate">{imp.name}</span>
                    <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px] uppercase tracking-wider">
                      Imposter
                    </span>
                  </div>

                  <span
                    className={`text-xs font-bold mt-0.5 ${
                      imp.caught ? 'text-red-700' : 'text-emerald-700'
                    }`}
                  >
                    {imp.caught
                      ? `Caught! (${imp.votesReceived} vote${imp.votesReceived === 1 ? '' : 's'})`
                      : `Escaped! (${imp.votesReceived} vote${imp.votesReceived === 1 ? '' : 's'})`}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="h-16 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* 2. Secret Word Reveal Card */}
      {revealStep >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs text-center flex flex-col items-center max-w-xl mx-auto"
        >
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Category: {roundResult.categoryName}
          </span>
          <span className="text-xs font-bold text-slate-500 mt-0.5">
            Secret Word:
          </span>
          <h4 className="text-2xl sm:text-3xl font-black text-blue-600 mt-0.5">
            {roundResult.secretWord}
          </h4>
        </motion.div>
      )}

      {/* 3. Vote Distribution Bar Chart */}
      {revealStep >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl space-y-3.5 border border-slate-200 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 size={15} className="text-blue-600" />
              <span>Vote Breakdown</span>
            </h4>
            {roundResult.isTie && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[10px] uppercase">
                Tie Vote
              </span>
            )}
          </div>

          <div className="space-y-3">
            {roundResult.voteDistribution.map((item, idx) => {
              const widthPct = Math.max(10, Math.round((item.voteCount / maxVotes) * 100));

              return (
                <div key={item.playerId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <PlayerAvatar name={item.playerName} seed={item.avatarSeed} size="sm" />
                      <span className="text-slate-900">{item.playerName}</span>
                      {item.isImposter && (
                        <span className="px-1.5 py-0.2 rounded bg-red-600 text-white font-bold text-[9px] uppercase">
                          Imposter
                        </span>
                      )}
                    </div>
                    <span className="text-slate-600 font-mono">
                      {item.voteCount} vote{item.voteCount === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      className={`h-full rounded-full ${
                        item.isImposter ? 'bg-red-600' : 'bg-blue-600'
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
      <div className="pt-2 max-w-md mx-auto">
        <button
          onClick={() => {
            sounds.click();
            onProceedToScoring();
          }}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <span>View Scoring</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
