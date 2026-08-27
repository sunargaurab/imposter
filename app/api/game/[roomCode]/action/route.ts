import { NextRequest, NextResponse } from 'next/server';
import {
  findGame,
  advancePhase,
  submitVote,
  forceConcludeVoting,
  handlePlayerReconnect,
  getPlayerBySession,
  createGame,
  startRound
} from '@/lib/store/gameStore';
import { GamePhase } from '@/types/game';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await params;
    const body = await req.json();
    const { action, playerId, targetPlayerId, targetPhase } = body;
    const sessionToken = req.headers.get('x-session-token') || body.sessionToken;

    const state = findGame(roomCode);
    if (!state) {
      return NextResponse.json({ error: 'Game not found.' }, { status: 404 });
    }

    // Verify session
    const { isHost } = getPlayerBySession(roomCode, sessionToken);

    switch (action) {
      case 'HEARTBEAT': {
        if (playerId) {
          handlePlayerReconnect(state.game.id, playerId);
        }
        return NextResponse.json({ success: true });
      }

      case 'START_GAME': {
        if (!isHost) {
          return NextResponse.json({ error: 'Only the host can start the game.' }, { status: 403 });
        }
        if (state.players.length < 3) {
          return NextResponse.json({ error: 'At least 3 players are required to start.' }, { status: 400 });
        }
        startRound(state.game.id, 1);
        return NextResponse.json({ success: true, game: state.game });
      }

      case 'ADVANCE_PHASE': {
        // Only host or automated server call can advance general phases
        if (!isHost && targetPhase !== 'DISCUSSION') {
          return NextResponse.json({ error: 'Only the host can advance game phases.' }, { status: 403 });
        }
        const res = advancePhase(state.game.id, targetPhase as GamePhase);
        if (res.error) {
          return NextResponse.json({ error: res.error }, { status: 400 });
        }
        return NextResponse.json({ success: true, game: state.game });
      }

      case 'START_VOTING': {
        if (!isHost) {
          return NextResponse.json({ error: 'Only the host can initiate voting early.' }, { status: 403 });
        }
        const res = advancePhase(state.game.id, 'VOTING');
        return NextResponse.json({ success: true, game: state.game });
      }

      case 'SUBMIT_VOTE': {
        if (!playerId || !targetPlayerId) {
          return NextResponse.json({ error: 'Voter and target player IDs required.' }, { status: 400 });
        }
        const voteRes = submitVote(state.game.id, playerId, targetPlayerId, sessionToken);
        if (!voteRes.success) {
          return NextResponse.json({ error: voteRes.error }, { status: 400 });
        }
        return NextResponse.json({ success: true, allVoted: voteRes.allVoted });
      }

      case 'FORCE_CONCLUDE_VOTING': {
        if (!isHost) {
          return NextResponse.json({ error: 'Only the host can force conclude voting.' }, { status: 403 });
        }
        forceConcludeVoting(state.game.id);
        return NextResponse.json({ success: true, game: state.game });
      }

      case 'RESTART_GAME': {
        if (!isHost) {
          return NextResponse.json({ error: 'Only the host can restart the game.' }, { status: 403 });
        }
        state.players.forEach(p => {
          p.totalScore = 0;
        });
        state.rounds = [];
        state.roundPlayers.clear();
        state.votes.clear();
        state.roundSummaries.clear();
        state.usedWords = [];
        state.game.currentRoundNum = 1;
        state.game.status = 'LOBBY';
        state.game.updatedAt = new Date().toISOString();
        return NextResponse.json({ success: true, game: state.game });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
