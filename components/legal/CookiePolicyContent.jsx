import Link from 'next/link';
import { Cookie, Mail, Settings, ShieldCheck, SlidersHorizontal, Target } from 'lucide-react';
import LegalSection from '@/components/legal/LegalSection';
import LegalHighlight from '@/components/legal/LegalHighlight';
import { SITE_NAME } from '@/lib/seo/constants';

export const cookiePolicySections = [
  { id: 'what-are-cookies', title: 'What Are Cookies' },
  { id: 'types-of-cookies', title: 'Types of Cookies We Use' },
  { id: 'how-we-use-cookies', title: 'How We Use Cookies' },
  { id: 'managing-cookies', title: 'Managing Cookies' },
  { id: 'contact-information', title: 'Contact Information' },
];

export default function CookiePolicyContent() {
  return (
    <>
      <LegalSection
        id="what-are-cookies"
        title="What Are Cookies"
        icon={Cookie}
        description="A brief explanation of cookies and similar tracking technologies."
      >
        <p>
          Cookies are small text files placed on your device when you visit a website. They
          help websites remember information about your visit, such as your preferred
          language and other settings, which can make your next visit easier and the site
          more useful to you.
        </p>
        <p>
          {SITE_NAME} uses cookies and similar technologies (such as local storage) to
          operate our website, remember your preferences, and understand how our tools are
          used.
        </p>
      </LegalSection>

      <LegalSection
        id="types-of-cookies"
        title="Types of Cookies We Use"
        icon={SlidersHorizontal}
        description="The categories of cookies set on this website."
      >
        <ul className="legal-list">
          <li>
            <LegalHighlight>Essential cookies:</LegalHighlight> Required for core site
            functionality, such as remembering your theme preference (light/dark mode).
            These cannot be disabled without affecting basic functionality.
          </li>
          <li>
            <LegalHighlight>Analytics cookies:</LegalHighlight> Set by Google Analytics to
            help us understand how visitors interact with our tools and pages, so we can
            improve the experience.
          </li>
          <li>
            <LegalHighlight>Advertising cookies:</LegalHighlight> Set by Google AdSense and
            its partners to display relevant ads and measure ad performance.
          </li>
        </ul>
      </LegalSection>

      <LegalSection
        id="how-we-use-cookies"
        title="How We Use Cookies"
        icon={Target}
        description="Purposes for which cookie data is collected on our website."
      >
        <p>We use cookies and similar technologies to:</p>
        <ul className="legal-list">
          <li>Remember your display preferences across visits</li>
          <li>Measure and analyze site traffic and tool usage with Google Analytics</li>
          <li>Serve and personalize advertisements through Google AdSense</li>
          <li>Maintain the security and proper functioning of our website</li>
        </ul>
        <p>
          We do not use cookies to collect personally identifiable information beyond what
          is described in our{' '}
          <Link href="/privacy-policy" className="legal-link">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection
        id="managing-cookies"
        title="Managing Cookies"
        icon={Settings}
        description="How to control or disable cookies in your browser."
      >
        <p>
          Most web browsers let you control cookies through their settings. You can usually
          find these settings in the &ldquo;Options&rdquo;, &ldquo;Preferences&rdquo;, or
          &ldquo;Privacy&rdquo; menu of your browser. You can:
        </p>
        <ul className="legal-list">
          <li>Block all cookies, or only third-party cookies</li>
          <li>Delete existing cookies from your device</li>
          <li>
            Opt out of Google Analytics tracking via the{' '}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="legal-link"
            >
              Google Analytics Opt-out Browser Add-on
            </a>
          </li>
          <li>
            Manage personalized advertising through{' '}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="legal-link"
            >
              Google Ads Settings
            </a>
          </li>
        </ul>
        <p>
          Please note that disabling cookies may affect the functionality of some features
          on our website, such as remembering your theme preference.
        </p>
      </LegalSection>

      <LegalSection
        id="contact-information"
        title="Contact Information"
        icon={Mail}
        description="How to reach us with questions about this Cookie Policy."
      >
        <p>
          If you have questions about how we use cookies, please reach out through our
          contact page:
        </p>
        <div className="rounded-xl border border-brand-100 dark:border-brand-900/50 bg-brand-50/50 dark:bg-brand-900/10 p-5 sm:p-6">
          <p className="flex items-center gap-2 text-foreground font-medium mb-2">
            <ShieldCheck className="w-4 h-4 text-brand-500" aria-hidden="true" />
            Cookie inquiries
          </p>
          <p className="mb-4">
            Submit a message through our contact form and include &ldquo;Cookie
            Policy&rdquo; in the subject line for faster routing.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 transition-colors"
          >
            <Mail className="w-4 h-4" aria-hidden="true" />
            Contact Us
          </Link>
        </div>
      </LegalSection>
    </>
  );
}
