import { JoinGameScreen } from '@/components/screens/JoinGameScreen';

export const metadata = {
  title: 'Join Room - Imposter Party Game',
  description: 'Enter a 5-character room code to join your friends in an Imposter game.'
};

export default function JoinPage() {
  return <JoinGameScreen />;
}
