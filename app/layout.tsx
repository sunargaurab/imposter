import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Imposter - Social Deduction Game',
  description: 'A party game for 3–20 players. Find the imposter, protect your secret word, and outsmart your friends.',
  keywords: ['imposter', 'party game', 'multiplayer', 'social deduction', 'secret word', 'mobile game'],
  authors: [{ name: 'Imposter Team' }],
  openGraph: {
    title: 'Imposter - Party Game',
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
  themeColor: '#FFFFFF',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen min-h-dvh flex flex-col justify-between selection:bg-slate-900 selection:text-white">
        <div className="w-full flex-1 flex flex-col relative overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
