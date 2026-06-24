import { Inter } from 'next/font/google';
import Script from 'next/script';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'ToolifHub';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;

export const metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} — One Hub. Unlimited Tools.`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    'Free online tools for YouTube, SEO, developers, text, images, calculators and more. 500+ tools — no sign-up required.',
  keywords: ['free online tools', 'youtube tools', 'seo tools', 'developer tools', 'text tools', 'image tools'],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} — One Hub. Unlimited Tools.`,
    description: 'Free online tools for everyone. 500+ tools, no sign-up required.',
    images: [{ url: `/og-image.png`, width: 1200, height: 630, alt: APP_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} — One Hub. Unlimited Tools.`,
    description: 'Free online tools for everyone. 500+ tools, no sign-up required.',
    images: [`/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: { canonical: APP_URL },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* AdSense */}
        {ADSENSE_CLIENT && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <GoogleAnalytics />
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
