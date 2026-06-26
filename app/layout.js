import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import GoogleTagManager from '@/components/analytics/GoogleTagManager';
import GoogleTagManagerNoScript from '@/components/analytics/GoogleTagManagerNoScript';
import GTMPageTracker from '@/components/analytics/GTMPageTracker';
import { Toaster } from 'react-hot-toast';
import { buildRootMetadata } from '@/lib/seo/metadata';
import config from '@/config';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const ADSENSE_CLIENT = config.ads.adsenseClient;

export const metadata = buildRootMetadata();

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <GoogleTagManager />
        {ADSENSE_CLIENT && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <GoogleTagManagerNoScript />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <GTMPageTracker />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
