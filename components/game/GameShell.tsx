'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { HeaderNav } from '@/components/common/HeaderNav';
import { LobbyScreen } from '@/components/screens/LobbyScreen';
import { RoundStartScreen } from '@/components/screens/RoundStartScreen';
import { SecretCardScreen } from '@/components/screens/SecretCardScreen';
import { DiscussionScreen } from '@/components/screens/DiscussionScreen';
import { VotingScreen } from '@/components/screens/VotingScreen';
import { VoteResultsScreen } from '@/components/screens/VoteResultsScreen';
import { ScoringScreen } from '@/components/screens/ScoringScreen';
import { NextRoundScreen } from '@/components/screens/NextRoundScreen';
import { FinalResultsScreen } from '@/components/screens/FinalResultsScreen';
import { PublicGameState, Player, PlayerSecretView } from '@/types/game';
import { sounds } from '@/lib/audio/soundEffects';

interface GameShellProps {
  roomCode: string;
}

export const GameShell: React.FC<GameShellProps> = ({ roomCode }) => {
  const router = useRouter();

  const [gameState, setGameState] = useState<PublicGameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | undefined>(undefined);
  const [sessionToken, setSessionToken] = useState<string>('');
  const [playerSecret, setPlayerSecret] = useState<PlayerSecretView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Restore player session credentials from localStorage / cookies
  useEffect(() => {
    const storedPlayerId = localStorage.getItem('imposter_player_id');
    const storedToken = localStorage.getItem('imposter_session_token');
    const storedRoom = localStorage.getItem('imposter_room_code');

    if (storedToken && storedRoom === roomCode) {
      setSessionToken(storedToken);
    }
  }, [roomCode]);

  // Fetch public game state
  const fetchGameState = useCallback(async () => {
    try {
      const res = await fetch(`/api/game/${roomCode}/state`);
      if (res.ok) {
        const data: PublicGameState = await res.json();
        setGameState(data);

        // Match current player
        const storedPlayerId = localStorage.getItem('imposter_player_id');
        if (storedPlayerId) {
          const match = data.players.find(p => p.id === storedPlayerId);
          if (match) {
            setCurrentPlayer(match);
          }
        }
      } else if (res.status === 404) {
        setError('Room not found. It may have expired or does not exist.');
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [roomCode]);

  // Set up live real-time connection (SSE stream)
  useEffect(() => {
    fetchGameState();

    // Connect to SSE stream
    const eventSource = new EventSource(`/api/game/${roomCode}/events`);

    eventSource.onmessage = (event) => {
      try {
        const data: PublicGameState = JSON.parse(event.data);
        setGameState(data);

        const storedPlayerId = localStorage.getItem('imposter_player_id');
        if (storedPlayerId) {
          const match = data.players.find(p => p.id === storedPlayerId);
          if (match) {
            setCurrentPlayer(match);
          }
        }
      } catch {
        // SSE parse catch
      }
    };

    eventSource.onerror = () => {
      // Automatic fallback polling if SSE disconnects
    };

    // Heartbeat pulse every 5s
    const heartbeat = setInterval(() => {
      const storedPlayerId = localStorage.getItem('imposter_player_id');
      const token = localStorage.getItem('imposter_session_token');
      if (storedPlayerId && token) {
        fetch(`/api/game/${roomCode}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-session-token': token },
          body: JSON.stringify({ action: 'HEARTBEAT', playerId: storedPlayerId })
        }).catch(() => {});
      }
    }, 5000);

    return () => {
      eventSource.close();
      clearInterval(heartbeat);
    };
  }, [roomCode, fetchGameState]);

  // Fetch secret card if in round
  const fetchSecret = useCallback(async () => {
    const storedPlayerId = localStorage.getItem('imposter_player_id');
    const token = localStorage.getItem('imposter_session_token');

    if (!storedPlayerId || !token || !gameState?.currentRound) {
      setPlayerSecret(null);
      return;
    }

    try {
      const res = await fetch(`/api/game/${roomCode}/secret?playerId=${storedPlayerId}`, {
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
  }, [roomCode, gameState?.currentRound]);

  useEffect(() => {
    fetchSecret();
  }, [fetchSecret, gameState?.game.status, gameState?.game.currentRoundNum]);

  // Dispatch Action Helper
  const handleAction = async (action: string, extraBody: Record<string, unknown> = {}) => {
    const token = localStorage.getItem('imposter_session_token') || sessionToken;
    const storedPlayerId = localStorage.getItem('imposter_player_id') || currentPlayer?.id;

    if (!token || !storedPlayerId) {
      alert('Session expired. Please re-join the room.');
      return;
    }

    sounds.click();

    try {
      const res = await fetch(`/api/game/${roomCode}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-token': token
        },
        body: JSON.stringify({
          action,
          playerId: storedPlayerId,
          sessionToken: token,
          ...extraBody
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        alert(data.error || 'Action failed.');
      } else {
        await fetchGameState();
      }
    } catch {
      alert('Connection error.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
        <span className="text-zinc-400 font-bold text-sm">Connecting to Room {roomCode}...</span>
      </div>
    );
  }

  if (error || !gameState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center max-w-md mx-auto space-y-4">
        <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
          <h2 className="text-xl font-black mb-1">Game Not Found</h2>
          <p className="text-xs text-rose-200/80">{error || 'This room does not exist or has closed.'}</p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-all cursor-pointer"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const { game, players, currentRound, roundResult, finalLeaderboard } = gameState;
  const isHost = currentPlayer?.isHost ?? false;

  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      <HeaderNav game={game} currentPlayer={currentPlayer} totalPlayers={players.length} />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {game.status === 'LOBBY' && (
          <LobbyScreen
            game={game}
            players={players}
            currentPlayer={currentPlayer}
            onStartGame={async () => {
              setIsStarting(true);
              await handleAction('START_GAME');
              setIsStarting(false);
            }}
            isStarting={isStarting}
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
            currentPlayer={currentPlayer}
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
            currentPlayer={currentPlayer}
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
            currentPlayer={currentPlayer}
            onRestartGame={() => handleAction('RESTART_GAME')}
            isHost={isHost}
          />
        )}
      </main>

      <footer className="text-center text-xs text-zinc-500 py-3">
        <span>Imposter • Room {game.roomCode} • {players.length} Players Connected</span>
      </footer>
    </div>
  );
};
