import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Imposter - Social Deduction Game',
  description: 'Party game for 3–20 players. Find the imposter, protect your secret word, and outsmart your friends.',
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
  themeColor: '#2563EB',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className={`${plusJakartaSans.className} antialiased bg-slate-50 text-slate-900 min-h-screen min-h-dvh flex flex-col justify-between selection:bg-blue-600 selection:text-white`}>
        <div className="w-full flex-1 flex flex-col relative overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
