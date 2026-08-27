import { NextRequest, NextResponse } from 'next/server';
import { createGame } from '@/lib/store/gameStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hostName, config } = body;

    const result = createGame(hostName, config || {});
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const response = NextResponse.json({
      game: result.game,
      hostPlayer: result.hostPlayer,
      sessionToken: result.sessionToken,
    });

    // Set HTTP-only cookie for session persistence across page refreshes
    response.cookies.set('imposter_session', JSON.stringify({
      playerId: result.hostPlayer.id,
      roomCode: result.game.roomCode,
      gameId: result.game.id,
      sessionToken: result.sessionToken
    }), {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
