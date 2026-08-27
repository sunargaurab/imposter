import type { Metadata, Viewport } from 'next';
import './globals.css';
import { BackgroundParticles } from '@/components/common/BackgroundParticles';

export const metadata: Metadata = {
  title: 'Imposter - Multiplayer Social Deduction Party Game',
  description: 'A modern party game for 3–20 players. Find the imposter, protect your secret word, and outsmart your friends.',
  keywords: ['imposter', 'party game', 'multiplayer', 'social deduction', 'secret word', 'board game', 'friends', 'mobile game'],
  authors: [{ name: 'Imposter Team' }],
  openGraph: {
    title: 'Imposter - Who is the Imposter?',
    description: 'Find the liar. Protect your secret. Outsmart everyone.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#090B10',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#090B10] text-zinc-100 min-h-screen relative flex flex-col justify-between overflow-x-hidden selection:bg-rose-500 selection:text-white">
        <BackgroundParticles />
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
