import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import GoogleAdsTag from '@/components/analytics/GoogleAdsTag';
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

// Secondary font used only for code blocks (lib/seo content, JSON/HTML
// formatter outputs) — not above-the-fold, so it isn't preloaded.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: false,
});

export const metadata = buildRootMetadata();

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <GoogleAdsTag />
        <GoogleTagManager />
        <AdSenseScript />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
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
