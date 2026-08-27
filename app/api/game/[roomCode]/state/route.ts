import { NextRequest, NextResponse } from 'next/server';
import { getPublicGameState } from '@/lib/store/gameStore';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await params;
    const state = getPublicGameState(roomCode);

    if (!state) {
      return NextResponse.json({ error: 'Game not found.' }, { status: 404 });
    }

    return NextResponse.json(state);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
