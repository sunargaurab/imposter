import { NextRequest, NextResponse } from 'next/server';
import { joinGame } from '@/lib/store/gameStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomCode, playerName } = body;

    if (!roomCode || !playerName) {
      return NextResponse.json({ error: 'Room code and player name are required.' }, { status: 400 });
    }

    const result = joinGame(roomCode, playerName);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const response = NextResponse.json({
      game: result.game,
      player: result.player,
      sessionToken: result.sessionToken,
    });

    response.cookies.set('imposter_session', JSON.stringify({
      playerId: result.player.id,
      roomCode: result.game.roomCode,
      gameId: result.game.id,
      sessionToken: result.sessionToken
    }), {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
