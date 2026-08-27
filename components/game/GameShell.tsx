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
  const normalizedRoomCode = roomCode.trim().toUpperCase();

  const [gameState, setGameState] = useState<PublicGameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | undefined>(undefined);
  const [sessionToken, setSessionToken] = useState<string>('');
  const [playerSecret, setPlayerSecret] = useState<PlayerSecretView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Restore player session credentials
  useEffect(() => {
    const storedToken = localStorage.getItem('imposter_session_token');
    const storedRoom = localStorage.getItem('imposter_room_code');

    if (storedToken && storedRoom === normalizedRoomCode) {
      setSessionToken(storedToken);
    }
  }, [normalizedRoomCode]);

  // Fetch authoritative game state & auto-redirect unjoined users
  const fetchGameState = useCallback(async () => {
    try {
      const res = await fetch(`/api/game/${normalizedRoomCode}/state`, { cache: 'no-store' });
      if (res.ok) {
        const data: PublicGameState = await res.json();
        setGameState(data);
        setError(null);

        const storedPlayerId = localStorage.getItem('imposter_player_id');
        const storedRoom = localStorage.getItem('imposter_room_code');

        let match: Player | undefined = undefined;
        if (storedPlayerId && storedRoom === normalizedRoomCode) {
          match = data.players.find(p => p.id === storedPlayerId);
        }

        if (match) {
          setCurrentPlayer(match);
        } else {
          // If user has not joined this room yet and it is in LOBBY, auto redirect to join page
          if (data.game.status === 'LOBBY') {
            router.replace(`/join/${normalizedRoomCode}`);
            return;
          }
        }
      } else if (res.status === 404) {
        setError('Room not found. Check code or create a new game.');
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [normalizedRoomCode, router]);

  // Set up live real-time connection with SSE & Auto-Reconnect
  useEffect(() => {
    fetchGameState();

    let retryTimeout: NodeJS.Timeout | null = null;
    let sseActive = true;

    const connectSSE = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const sse = new EventSource(`/api/game/${normalizedRoomCode}/events`);
      eventSourceRef.current = sse;

      sse.onopen = () => {
        sseActive = true;
      };

      sse.onmessage = (event) => {
        try {
          const data: PublicGameState = JSON.parse(event.data);
          setGameState(data);
          setError(null);

          const storedPlayerId = localStorage.getItem('imposter_player_id');
          const storedRoom = localStorage.getItem('imposter_room_code');

          let match: Player | undefined = undefined;
          if (storedPlayerId && storedRoom === normalizedRoomCode) {
            match = data.players.find(p => p.id === storedPlayerId);
          }

          if (match) {
            setCurrentPlayer(match);
          } else if (data.game.status === 'LOBBY') {
            router.replace(`/join/${normalizedRoomCode}`);
          }
        } catch {
          // parse catch
        }
      };

      sse.onerror = () => {
        sseActive = false;
        sse.close();
        if (retryTimeout) clearTimeout(retryTimeout);
        retryTimeout = setTimeout(connectSSE, 3000);
      };
    };

    connectSSE();

    // Gentle fallback polling (every 15s) only if SSE gets disconnected
    const fallbackPoll = setInterval(() => {
      if (!sseActive) {
        fetchGameState();
      }
    }, 15000);

    // Instant refresh on window focus / visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchGameState();
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', fetchGameState);

    // Low-frequency heartbeat (every 45s) to maintain active player status without spamming
    const heartbeat = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      const storedPlayerId = localStorage.getItem('imposter_player_id');
      const token = localStorage.getItem('imposter_session_token');
      if (storedPlayerId && token) {
        fetch(`/api/game/${normalizedRoomCode}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-session-token': token },
          body: JSON.stringify({ action: 'HEARTBEAT', playerId: storedPlayerId })
        }).catch(() => {});
      }
    }, 45000);

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (retryTimeout) clearTimeout(retryTimeout);
      clearInterval(fallbackPoll);
      clearInterval(heartbeat);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', fetchGameState);
    };
  }, [normalizedRoomCode, fetchGameState, router]);

  // Fetch secret card when round or session updates
  const currentRoundNum = gameState?.game.currentRoundNum;
  const gameStatus = gameState?.game.status;

  const fetchSecret = useCallback(async () => {
    const storedPlayerId = localStorage.getItem('imposter_player_id');
    const token = localStorage.getItem('imposter_session_token') || sessionToken;

    if (!storedPlayerId || !token || !currentRoundNum || gameStatus === 'LOBBY' || gameStatus === 'FINAL_RESULTS') {
      setPlayerSecret(null);
      return;
    }

    try {
      const res = await fetch(`/api/game/${normalizedRoomCode}/secret?playerId=${storedPlayerId}`, {
        headers: { 'x-session-token': token },
        cache: 'no-store'
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
  }, [normalizedRoomCode, currentRoundNum, gameStatus, sessionToken]);

  useEffect(() => {
    fetchSecret();
  }, [fetchSecret]);

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
      const res = await fetch(`/api/game/${normalizedRoomCode}/action`, {
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
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-slate-500 font-bold text-xs">Connecting to Room {normalizedRoomCode}...</span>
      </div>
    );
  }

  if (error || !gameState) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center max-w-sm mx-auto space-y-3 my-auto">
        <div className="p-5 rounded-3xl bg-red-50 border border-red-200 text-red-800 w-full">
          <h2 className="text-base font-bold mb-1">Room Not Found</h2>
          <p className="text-xs text-red-600">{error || 'This room does not exist or has expired.'}</p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-blue-600/25"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const { game, players, currentRound, roundResult, finalLeaderboard } = gameState;
  const isHost = currentPlayer?.isHost ?? false;

  // If user is not joined and game already started
  if (!currentPlayer && game.status !== 'LOBBY') {
    return (
      <div className="flex-1 flex flex-col justify-between w-full">
        <HeaderNav game={game} totalPlayers={players.length} />
        <main className="flex-1 flex flex-col items-center justify-center p-4 text-center max-w-sm mx-auto space-y-4 my-auto">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs w-full space-y-2">
            <h2 className="text-lg font-black text-slate-900 uppercase">Game in Progress</h2>
            <p className="text-xs text-slate-500">
              Room {normalizedRoomCode} is currently in round {game.currentRoundNum}.
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/25"
          >
            Return to Home
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between w-full">
      <HeaderNav game={game} currentPlayer={currentPlayer} totalPlayers={players.length} />

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-center">
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
            isHost={isHost}
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
            isHost={isHost}
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

      <footer className="text-center text-xs text-slate-400 py-3">
        <span>Room {game.roomCode} • {players.length} Players</span>
      </footer>
    </div>
  );
};
