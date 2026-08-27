'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Zap } from 'lucide-react';
import { HeaderNav } from '@/components/common/HeaderNav';
import { LobbyScreen } from './LobbyScreen';
import { RoundStartScreen } from './RoundStartScreen';
import { SecretCardScreen } from './SecretCardScreen';
import { DiscussionScreen } from './DiscussionScreen';
import { VotingScreen } from './VotingScreen';
import { VoteResultsScreen } from './VoteResultsScreen';
import { ScoringScreen } from './ScoringScreen';
import { NextRoundScreen } from './NextRoundScreen';
import { FinalResultsScreen } from './FinalResultsScreen';
import { PublicGameState, PlayerSecretView } from '@/types/game';
import { sounds } from '@/lib/audio/soundEffects';

export const DemoPlaygroundScreen: React.FC = () => {
  const [gameState, setGameState] = useState<PublicGameState | null>(null);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [playerSecret, setPlayerSecret] = useState<PlayerSecretView | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGameState = useCallback(async () => {
    try {
      const res = await fetch('/api/game/DEMO1/state');
      if (res.ok) {
        const data: PublicGameState = await res.json();
        setGameState(data);
      }
    } catch {
      // Catch fetch errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGameState();
    const interval = setInterval(fetchGameState, 1000);
    return () => clearInterval(interval);
  }, [fetchGameState]);

  const activePlayer = gameState?.players[activePlayerIndex];

  const fetchSecret = useCallback(async () => {
    if (!activePlayer || !gameState) return;
    try {
      const token = `tok_demo_${activePlayer.name.toLowerCase()}`;
      const res = await fetch(`/api/game/DEMO1/secret?playerId=${activePlayer.id}`, {
        headers: { 'x-session-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        setPlayerSecret(data);
      } else {
        setPlayerSecret(null);
      }
    } catch {
      setPlayerSecret(null);
    }
  }, [activePlayer, gameState]);

  useEffect(() => {
    fetchSecret();
  }, [fetchSecret, gameState?.game.status, gameState?.game.currentRoundNum]);

  const handleAction = async (action: string, extraBody: Record<string, unknown> = {}) => {
    if (!activePlayer) return;
    sounds.click();
    const token = `tok_demo_${activePlayer.name.toLowerCase()}`;

    try {
      await fetch('/api/game/DEMO1/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-token': token
        },
        body: JSON.stringify({
          action,
          playerId: activePlayer.id,
          sessionToken: token,
          ...extraBody
        })
      });
      await fetchGameState();
    } catch {
      // Catch action errors
    }
  };

  const handleSimulatePromptScenario = async () => {
    if (!gameState) return;
    sounds.voteSubmitted();

    if (gameState.game.status === 'LOBBY') {
      await handleAction('START_GAME');
    }

    await handleAction('ADVANCE_PHASE', { targetPhase: 'VOTING' });

    const alex = gameState.players.find(p => p.name === 'Alex');
    const sam = gameState.players.find(p => p.name === 'Sam');
    const jordan = gameState.players.find(p => p.name === 'Jordan');
    const maya = gameState.players.find(p => p.name === 'Maya');
    const chris = gameState.players.find(p => p.name === 'Chris');
    const taylor = gameState.players.find(p => p.name === 'Taylor');

    if (alex && sam && jordan && maya && chris && taylor) {
      await fetch('/api/game/DEMO1/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-token': 'tok_demo_alex' },
        body: JSON.stringify({ action: 'SUBMIT_VOTE', playerId: alex.id, targetPlayerId: jordan.id })
      });
      await fetch('/api/game/DEMO1/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-token': 'tok_demo_sam' },
        body: JSON.stringify({ action: 'SUBMIT_VOTE', playerId: sam.id, targetPlayerId: jordan.id })
      });
      await fetch('/api/game/DEMO1/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-token': 'tok_demo_taylor' },
        body: JSON.stringify({ action: 'SUBMIT_VOTE', playerId: taylor.id, targetPlayerId: jordan.id })
      });
      await fetch('/api/game/DEMO1/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-token': 'tok_demo_jordan' },
        body: JSON.stringify({ action: 'SUBMIT_VOTE', playerId: jordan.id, targetPlayerId: maya.id })
      });
      await fetch('/api/game/DEMO1/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-token': 'tok_demo_chris' },
        body: JSON.stringify({ action: 'SUBMIT_VOTE', playerId: chris.id, targetPlayerId: maya.id })
      });
      await fetch('/api/game/DEMO1/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-token': 'tok_demo_maya' },
        body: JSON.stringify({ action: 'SUBMIT_VOTE', playerId: maya.id, targetPlayerId: alex.id })
      });
    }

    await fetchGameState();
  };

  if (loading || !gameState) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-3" />
        <span className="text-slate-500 font-bold text-xs">Loading Sandbox...</span>
      </div>
    );
  }

  const { game, players, currentRound, roundResult, finalLeaderboard } = gameState;
  const isHost = activePlayer?.isHost ?? false;

  return (
    <div className="flex-1 flex flex-col justify-between w-full">
      {/* SIMULATOR TOOLBAR */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Active Perspective Switcher */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 hidden sm:inline">
              VIEW AS:
            </span>
            {players.map((p, idx) => {
              const isSelected = activePlayerIndex === idx;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    sounds.click();
                    setActivePlayerIndex(idx);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{p.name}</span>
                  {p.isHost && <span>👑</span>}
                </button>
              );
            })}
          </div>

          {/* Quick Automation Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulatePromptScenario}
              title="Auto-cast Section 59 votes"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Zap size={13} className="fill-white" />
              <span>Auto-Vote</span>
            </button>

            <button
              onClick={() => handleAction('RESTART_GAME')}
              title="Reset game to Lobby"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main In-Game View */}
      <HeaderNav game={game} currentPlayer={activePlayer} totalPlayers={players.length} />

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-center">
        {game.status === 'LOBBY' && (
          <LobbyScreen
            game={game}
            players={players}
            currentPlayer={activePlayer}
            onStartGame={() => handleAction('START_GAME')}
          />
        )}

        {game.status === 'ROUND_START' && (
          <RoundStartScreen
            game={game}
            onProceed={() => handleAction('ADVANCE_PHASE', { targetPhase: 'SECRET_REVEAL' })}
          />
        )}

        {game.status === 'SECRET_REVEAL' && (
          <SecretCardScreen
            secretView={playerSecret}
            onProceedToDiscussion={() => handleAction('ADVANCE_PHASE', { targetPhase: 'DISCUSSION' })}
            isHost={isHost}
          />
        )}

        {game.status === 'DISCUSSION' && (
          <DiscussionScreen
            game={game}
            onStartVoting={() => handleAction('START_VOTING')}
            isHost={isHost}
          />
        )}

        {game.status === 'VOTING' && (
          <VotingScreen
            game={game}
            players={players}
            currentPlayer={activePlayer}
            totalVotedCount={currentRound?.totalVotedCount || 0}
            onSubmitVote={async (targetId) => {
              await handleAction('SUBMIT_VOTE', { targetPlayerId: targetId });
            }}
            onForceConclude={() => handleAction('FORCE_CONCLUDE_VOTING')}
            isHost={isHost}
          />
        )}

        {game.status === 'VOTE_RESULTS' && roundResult && (
          <VoteResultsScreen
            roundResult={roundResult}
            onProceedToScoring={() => handleAction('ADVANCE_PHASE', { targetPhase: 'SCORING' })}
          />
        )}

        {game.status === 'SCORING' && roundResult && (
          <ScoringScreen
            game={game}
            players={players}
            roundResult={roundResult}
            currentPlayer={activePlayer}
            onNextRound={() => handleAction('ADVANCE_PHASE')}
            isHost={isHost}
          />
        )}

        {game.status === 'NEXT_ROUND' && (
          <NextRoundScreen
            game={game}
            onProceed={() => handleAction('ADVANCE_PHASE', { targetPhase: 'ROUND_START' })}
          />
        )}

        {game.status === 'FINAL_RESULTS' && finalLeaderboard && (
          <FinalResultsScreen
            game={game}
            rankings={finalLeaderboard}
            currentPlayer={activePlayer}
            onRestartGame={() => handleAction('RESTART_GAME')}
            isHost={isHost}
          />
        )}
      </main>

      <footer className="text-center text-xs text-slate-400 py-3">
        <span>Sandbox • Simulating {activePlayer?.name} • Room DEMO1</span>
      </footer>
    </div>
  );
};
