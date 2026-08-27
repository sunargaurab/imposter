import { NextRequest, NextResponse } from 'next/server';
import { getPlayerSecret, findGame } from '@/lib/store/gameStore';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await params;
    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get('playerId');
    const sessionToken = req.headers.get('x-session-token') || searchParams.get('token');

    if (!playerId || !sessionToken) {
      return NextResponse.json({ error: 'Player ID and session token are required.' }, { status: 401 });
    }

    const state = findGame(roomCode);
    if (!state) {
      return NextResponse.json({ error: 'Game not found.' }, { status: 404 });
    }

    const secretView = getPlayerSecret(state.game.id, playerId, sessionToken);
    if (!secretView) {
      return NextResponse.json({ error: 'Unauthorized secret request or no active round.' }, { status: 403 });
    }

    return NextResponse.json(secretView);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
