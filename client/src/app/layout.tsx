import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

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
  themeColor: '#080c14',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className="min-h-screen flex flex-col font-sans bg-[#080c14] text-slate-100">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
