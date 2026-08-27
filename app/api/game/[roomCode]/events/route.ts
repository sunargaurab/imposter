import { NextRequest } from 'next/server';
import { getPublicGameState, gameEvents } from '@/lib/store/gameStore';
import { PublicGameState } from '@/types/game';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  const { roomCode } = await params;
  const upperCode = roomCode.trim().toUpperCase();

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  let isClosed = false;

  const sendState = (state: PublicGameState | null) => {
    if (isClosed || !state) return;
    try {
      writer.write(encoder.encode(`data: ${JSON.stringify(state)}\n\n`));
    } catch {
      isClosed = true;
    }
  };

  // 1. Immediate first emit
  const initialState = getPublicGameState(upperCode);
  if (initialState) {
    sendState(initialState);
  }

  // 2. Real-time PubSub Event Listener (Instant Socket-like update)
  const onGameUpdate = (newState: PublicGameState) => {
    sendState(newState);
  };

  gameEvents.on(`room:${upperCode}`, onGameUpdate);

  // 3. Heartbeat / fallback pulse every 2s
  const heartbeatId = setInterval(() => {
    if (isClosed) return;
    const currentState = getPublicGameState(upperCode);
    if (currentState) {
      sendState(currentState);
    }
  }, 2000);

  req.signal.addEventListener('abort', () => {
    isClosed = true;
    clearInterval(heartbeatId);
    gameEvents.off(`room:${upperCode}`, onGameUpdate);
    try {
      writer.close();
    } catch {}
  });

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
