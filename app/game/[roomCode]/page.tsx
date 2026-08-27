import { GameShell } from '@/components/game/GameShell';

export async function generateMetadata({ params }: { params: Promise<{ roomCode: string }> }) {
  const { roomCode } = await params;
  return {
    title: `Room ${roomCode} - Imposter Multiplayer Game`,
    description: `Active Imposter multiplayer party game room ${roomCode}`
  };
}

export default async function GameRoomPage({
  params
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = await params;
  return <GameShell roomCode={roomCode.toUpperCase()} />;
}
