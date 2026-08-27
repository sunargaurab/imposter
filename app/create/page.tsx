import { CreateGameScreen } from '@/components/screens/CreateGameScreen';

export const metadata = {
  title: 'Create Game - Imposter Party Game',
  description: 'Configure game settings and pick a category for your Imposter party room.'
};

export default function CreatePage() {
  return <CreateGameScreen />;
}
