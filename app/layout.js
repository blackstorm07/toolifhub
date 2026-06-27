import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import GoogleTagManager from '@/components/analytics/GoogleTagManager';
import GoogleTagManagerNoScript from '@/components/analytics/GoogleTagManagerNoScript';
import GTMPageTracker from '@/components/analytics/GTMPageTracker';
import AdSenseScript from '@/components/ads/AdSenseScript';
import HeaderAd from '@/components/ads/HeaderAd';
import FooterAd from '@/components/ads/FooterAd';
import PublicAdGate from '@/components/ads/PublicAdGate';
import { Toaster } from 'react-hot-toast';
import { buildRootMetadata } from '@/lib/seo/metadata';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

export const metadata = buildRootMetadata();

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <GoogleTagManager />
        <AdSenseScript />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <GoogleTagManagerNoScript />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <GTMPageTracker />
          <div className="flex flex-col min-h-screen">
            <Header />
            <PublicAdGate>
              <HeaderAd />
            </PublicAdGate>
            <main className="flex-1">{children}</main>
            <PublicAdGate>
              <FooterAd />
            </PublicAdGate>
            <Footer />
          </div>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
