import { NextRequest } from 'next/server';
import { getPublicGameState } from '@/lib/store/gameStore';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  const { roomCode } = await params;

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  let isClosed = false;
  let lastUpdatedAt = '';

  const sendState = () => {
    if (isClosed) return;
    try {
      const state = getPublicGameState(roomCode);
      if (state) {
        if (state.game.updatedAt !== lastUpdatedAt) {
          lastUpdatedAt = state.game.updatedAt;
          writer.write(encoder.encode(`data: ${JSON.stringify(state)}\n\n`));
        }
      }
    } catch {
      isClosed = true;
    }
  };

  // Immediate first emit
  sendState();

  // Pulse interval for changes (1 sec interval is gentle and fast)
  const intervalId = setInterval(() => {
    sendState();
  }, 800);

  req.signal.addEventListener('abort', () => {
    isClosed = true;
    clearInterval(intervalId);
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
