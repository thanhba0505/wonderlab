import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  weight: ['500', '600', '700'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-heading',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Wonderlab — Khám phá Khoa học, Xác suất & Nghịch lý Trực quan',
  description:
    'Nền tảng thí nghiệm trực quan, mô phỏng xác suất Monte Carlo, các nghịch lý tư duy và trò chơi trí tuệ phản trực giác.',
  keywords: [
    'khoa học',
    'xác suất',
    'nghịch lý',
    'monty hall',
    'thí nghiệm trực quan',
    'lý thuyết trò chơi',
    'toán học',
  ],
  authors: [{ name: 'Wonderlab Engineering Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f8fafc',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen flex flex-col font-sans bg-[#f8fafc] text-slate-800 antialiased selection:bg-blue-500/20 selection:text-blue-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
