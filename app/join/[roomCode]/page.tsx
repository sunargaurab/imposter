import { JoinGameScreen } from '@/components/screens/JoinGameScreen';

export async function generateMetadata({ params }: { params: Promise<{ roomCode: string }> }) {
  const { roomCode } = await params;
  return {
    title: `Join Room ${roomCode} - Imposter Party Game`,
    description: `Join room ${roomCode} with your friends!`
  };
}

export default async function JoinRoomDirectPage({
  params
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = await params;
  return <JoinGameScreen initialRoomCode={roomCode} />;
}
