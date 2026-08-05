import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { PWAProvider } from '@/providers/PWAProvider';
import { AppInit } from '@/components/layout/AppInit';

export const metadata: Metadata = {
  title: 'PM SOP - 产品经理工作台',
  description: '贯穿产品经理业务SOP的本地优先工作台',
  manifest: '/manifest.json',
  applicationName: 'PM SOP',
  icons: {
    icon: '/icon.svg',
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PM SOP',
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#3B82F6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <PWAProvider>
            <AppInit />
            <AppShell>{children}</AppShell>
          </PWAProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
