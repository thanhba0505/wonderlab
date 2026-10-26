import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/app-shell';
import { AuthProvider } from '@/lib/auth-context';

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

const defaultSiteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wonderlab.vn';

export const metadata: Metadata = {
  metadataBase: new URL(defaultSiteUrl),
  title: {
    default: 'Wonderlab — Khám phá Khoa học, Xác suất & Nghịch lý Trực quan',
    template: '%s | Wonderlab',
  },
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
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    siteName: 'Wonderlab',
    title: 'Wonderlab — Khám phá Khoa học, Xác suất & Nghịch lý Trực quan',
    description:
      'Nền tảng thí nghiệm trực quan, mô phỏng xác suất Monte Carlo, các nghịch lý tư duy và trò chơi trí tuệ phản trực giác.',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@wonderlab',
    title: 'Wonderlab — Khám phá Khoa học, Xác suất & Nghịch lý Trực quan',
    description:
      'Nền tảng thí nghiệm trực quan, mô phỏng xác suất Monte Carlo, các nghịch lý tư duy và trò chơi trí tuệ phản trực giác.',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f1f5f9',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen flex flex-col font-sans bg-[#f1f5f9] text-slate-800 antialiased selection:bg-blue-500/20 selection:text-blue-900"
        suppressHydrationWarning
      >
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
