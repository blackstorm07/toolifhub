import Link from 'next/link';
import {
  Baby,
  Clock,
  Cookie,
  Database,
  FileText,
  Globe,
  Lock,
  Mail,
  RefreshCw,
  Scale,
  Server,
  Shield,
  UserCheck,
} from 'lucide-react';
import LegalSection from '@/components/legal/LegalSection';
import LegalHighlight from '@/components/legal/LegalHighlight';
import { SITE_NAME, SITE_URL } from '@/lib/seo/constants';

export const privacyPolicySections = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'information-we-collect', title: 'Information We Collect' },
  { id: 'how-we-use-information', title: 'How We Use Information' },
  { id: 'cookies-tracking', title: 'Cookies & Tracking' },
  { id: 'third-party-services', title: 'Third-Party Services' },
  { id: 'data-retention', title: 'Data Retention' },
  { id: 'data-security', title: 'Data Security' },
  { id: 'user-rights', title: 'User Rights' },
  { id: 'childrens-privacy', title: "Children's Privacy" },
  { id: 'international-transfers', title: 'International Transfers' },
  { id: 'policy-changes', title: 'Changes to This Policy' },
  { id: 'contact-information', title: 'Contact Information' },
];

export default function PrivacyPolicyContent() {
  return (
    <>
      <LegalSection
        id="introduction"
        title="Introduction"
        icon={Shield}
        description="Your privacy matters to us. This policy explains what we collect and why."
      >
        <p>
          Welcome to <LegalHighlight>{SITE_NAME}</LegalHighlight> (&ldquo;we,&rdquo;
          &ldquo;us,&rdquo; or &ldquo;our&rdquo;). We are committed to protecting your
          personal information and respecting your right to privacy. This Privacy Policy
          describes how we collect, use, disclose, and safeguard information when you
          visit <LegalHighlight>{SITE_URL}</LegalHighlight> and use our free online tools.
        </p>
        <p>
          By accessing or using our website, you agree to the practices described in this
          policy. If you do not agree, please discontinue use of our services. We encourage
          you to read this document carefully and contact us if you have any questions.
        </p>
      </LegalSection>

      <LegalSection
        id="information-we-collect"
        title="Information We Collect"
        icon={Database}
        description="We collect only the information needed to operate and improve our platform."
      >
        <p>
          We believe in collecting the minimum data necessary. Depending on how you
          interact with {SITE_NAME}, we may collect the following categories of
          information:
        </p>
        <ul className="legal-list">
          <li>
            <LegalHighlight>Usage &amp; log data:</LegalHighlight> IP address, browser
            type, device information, referring URLs, pages visited, and timestamps
            collected automatically through server logs.
          </li>
          <li>
            <LegalHighlight>Analytics data:</LegalHighlight> Aggregated, anonymized usage
            statistics via Google Analytics 4 to understand how visitors use our tools
            and improve performance.
          </li>
          <li>
            <LegalHighlight>Contact information:</LegalHighlight> Name, email address,
            and message content when you submit our contact form or reach out for
            support.
          </li>
          <li>
            <LegalHighlight>Tool input data:</LegalHighlight> Data you enter into our
            tools is processed locally in your browser or discarded immediately after
            processing. We do <LegalHighlight>not</LegalHighlight> store tool inputs on
            our servers.
          </li>
          <li>
            <LegalHighlight>Preferences:</LegalHighlight> Theme settings (light/dark
            mode) stored locally in your browser via cookies or local storage.
          </li>
        </ul>
        <p>
          We do not require account registration to use our tools, and we do not
          knowingly collect sensitive personal information such as financial data,
          government IDs, or health records.
        </p>
      </LegalSection>

      <LegalSection
        id="how-we-use-information"
        title="How We Use Information"
        icon={FileText}
        description="We use collected data solely to deliver and improve our services."
      >
        <p>We use the information we collect for the following purposes:</p>
        <ul className="legal-list">
          <li>Operating, maintaining, and improving our website and online tools</li>
          <li>Responding to your inquiries, feedback, and support requests</li>
          <li>Analyzing usage patterns to optimize performance and user experience</li>
          <li>Detecting, preventing, and addressing abuse, fraud, or security issues</li>
          <li>Complying with applicable legal obligations and enforcing our terms</li>
          <li>Displaying relevant advertisements through our advertising partners</li>
        </ul>
        <p>
          We do <LegalHighlight>not</LegalHighlight> sell your personal information to
          third parties. We do not use your data for automated decision-making or
          profiling that produces legal or similarly significant effects.
        </p>
      </LegalSection>

      <LegalSection
        id="cookies-tracking"
        title="Cookies & Tracking Technologies"
        icon={Cookie}
        description="How we use cookies and similar technologies on our website."
      >
        <p>
          Cookies are small text files stored on your device that help websites function
          and provide analytics. We use cookies and similar technologies for:
        </p>
        <ul className="legal-list">
          <li>
            <LegalHighlight>Analytics:</LegalHighlight> Google Analytics uses cookies to
            measure traffic and usage patterns. You can opt out via the{' '}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="legal-link"
            >
              Google Analytics Opt-out Browser Add-on
            </a>
            .
          </li>
          <li>
            <LegalHighlight>Advertising:</LegalHighlight> Google AdSense may use cookies
            to serve and personalize ads based on your browsing activity. You can manage
            ad preferences through{' '}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="legal-link"
            >
              Google Ads Settings
            </a>
            .
          </li>
          <li>
            <LegalHighlight>Preferences:</LegalHighlight> Storing your dark/light mode
            theme preference for a consistent experience across visits.
          </li>
        </ul>
        <p>
          Most browsers allow you to refuse or delete cookies through their settings.
          Disabling cookies may affect certain features of our website.
        </p>
      </LegalSection>

      <LegalSection
        id="third-party-services"
        title="Third-Party Services"
        icon={Server}
        description="External services we rely on to operate our platform."
      >
        <p>
          We use trusted third-party providers to help deliver our services. These
          providers may process data on our behalf and are subject to their own privacy
          policies:
        </p>
        <ul className="legal-list">
          <li>
            <LegalHighlight>Google Analytics</LegalHighlight> — website usage analytics.{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="legal-link"
            >
              Google Privacy Policy
            </a>
          </li>
          <li>
            <LegalHighlight>Google AdSense</LegalHighlight> — display advertising.{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="legal-link"
            >
              Google Privacy Policy
            </a>
          </li>
          <li>
            <LegalHighlight>MongoDB Atlas</LegalHighlight> — secure cloud database
            hosting for site content.{' '}
            <a
              href="https://www.mongodb.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="legal-link"
            >
              MongoDB Privacy Policy
            </a>
          </li>
        </ul>
        <p>
          We are not responsible for the privacy practices of third-party websites linked
          from {SITE_NAME}. We encourage you to review their policies before providing
          any personal information.
        </p>
      </LegalSection>

      <LegalSection
        id="data-retention"
        title="Data Retention"
        icon={Clock}
        description="How long we keep your information and when we delete it."
      >
        <p>
          We retain personal information only for as long as necessary to fulfill the
          purposes described in this policy, unless a longer retention period is
          required by law.
        </p>
        <ul className="legal-list">
          <li>
            <LegalHighlight>Server logs:</LegalHighlight> Retained for a limited period
            (typically up to 90 days) for security and troubleshooting, then automatically
            deleted.
          </li>
          <li>
            <LegalHighlight>Analytics data:</LegalHighlight> Stored in aggregated form per
            Google Analytics retention settings (default 14 months).
          </li>
          <li>
            <LegalHighlight>Contact form submissions:</LegalHighlight> Retained as long
            as needed to respond to your inquiry and for reasonable follow-up, unless you
            request deletion.
          </li>
          <li>
            <LegalHighlight>Tool input data:</LegalHighlight> Not retained — processed
            in-browser or discarded immediately after use.
          </li>
        </ul>
        <p>
          When data is no longer needed, we securely delete or anonymize it in accordance
          with our data management practices.
        </p>
      </LegalSection>

      <LegalSection
        id="data-security"
        title="Data Security"
        icon={Lock}
        description="Measures we take to protect your information."
      >
        <p>
          We implement industry-standard technical and organizational safeguards to
          protect your information, including:
        </p>
        <ul className="legal-list">
          <li>HTTPS/TLS encryption for all data transmitted between your browser and our servers</li>
          <li>Secure database connections and access controls for stored data</li>
          <li>Regular monitoring for vulnerabilities and unauthorized access</li>
          <li>Limited internal access to personal data on a need-to-know basis</li>
        </ul>
        <p>
          While we strive to protect your information, no method of transmission over the
          internet or electronic storage is <LegalHighlight>100% secure</LegalHighlight>.
          We cannot guarantee absolute security, but we continuously work to improve our
          protections.
        </p>
      </LegalSection>

      <LegalSection
        id="user-rights"
        title="User Rights"
        icon={UserCheck}
        description="Your rights regarding the personal data we hold about you."
      >
        <p>
          Depending on your location, you may have certain rights regarding your personal
          information. These may include:
        </p>
        <ul className="legal-list">
          <li>
            <LegalHighlight>Access:</LegalHighlight> Request a copy of the personal data we
            hold about you
          </li>
          <li>
            <LegalHighlight>Correction:</LegalHighlight> Request correction of inaccurate
            or incomplete data
          </li>
          <li>
            <LegalHighlight>Deletion:</LegalHighlight> Request deletion of your personal
            data, subject to legal exceptions
          </li>
          <li>
            <LegalHighlight>Restriction:</LegalHighlight> Request that we limit how we use
            your data
          </li>
          <li>
            <LegalHighlight>Objection:</LegalHighlight> Object to certain processing
            activities, including direct marketing
          </li>
          <li>
            <LegalHighlight>Portability:</LegalHighlight> Request your data in a
            structured, machine-readable format where applicable
          </li>
        </ul>
        <p>
          To exercise any of these rights, please contact us using the details in the{' '}
          <a href="#contact-information" className="legal-link">
            Contact Information
          </a>{' '}
          section below. We will respond within a reasonable timeframe and in accordance
          with applicable law.
        </p>
      </LegalSection>

      <LegalSection
        id="childrens-privacy"
        title="Children's Privacy"
        icon={Baby}
        description="How we handle information from users under 13."
      >
        <p>
          {SITE_NAME} is not directed at children under the age of{' '}
          <LegalHighlight>13</LegalHighlight> (or the applicable age of digital consent in
          your jurisdiction). We do not knowingly collect personal information from
          children.
        </p>
        <p>
          If you are a parent or guardian and believe your child has provided us with
          personal information, please contact us immediately. We will take steps to
          delete such information from our records promptly.
        </p>
      </LegalSection>

      <LegalSection
        id="international-transfers"
        title="International Data Transfers"
        icon={Globe}
        description="How your data may be processed across borders."
      >
        <p>
          {SITE_NAME} is operated from servers that may be located in different countries.
          If you access our website from outside the country where our servers are hosted,
          your information may be transferred to, stored, and processed in jurisdictions
          that may have different data protection laws than your own.
        </p>
        <p>
          When we transfer data internationally, we take appropriate safeguards to ensure
          your information remains protected in accordance with this Privacy Policy and
          applicable legal requirements, including standard contractual clauses where
          required.
        </p>
      </LegalSection>

      <LegalSection
        id="policy-changes"
        title="Changes to This Policy"
        icon={RefreshCw}
        description="How we notify you of updates to this Privacy Policy."
      >
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our
          practices, technology, legal requirements, or other factors. When we make
          material changes, we will update the &ldquo;Last updated&rdquo; date at the top
          of this page.
        </p>
        <p>
          We encourage you to review this policy periodically. Your continued use of{' '}
          {SITE_NAME} after changes are posted constitutes your acceptance of the revised
          policy. If you disagree with any changes, please discontinue use of our
          services.
        </p>
      </LegalSection>

      <LegalSection
        id="contact-information"
        title="Contact Information"
        icon={Mail}
        description="How to reach us with privacy-related questions or requests."
      >
        <p>
          If you have questions, concerns, or requests regarding this Privacy Policy or
          our data practices, we&apos;re here to help. You can reach us through our
          contact page:
        </p>
        <div className="rounded-xl border border-brand-100 dark:border-brand-900/50 bg-brand-50/50 dark:bg-brand-900/10 p-5 sm:p-6">
          <p className="flex items-center gap-2 text-foreground font-medium mb-2">
            <Scale className="w-4 h-4 text-brand-500" aria-hidden="true" />
            Privacy inquiries
          </p>
          <p className="mb-4">
            Submit a message through our contact form and include &ldquo;Privacy
            Request&rdquo; in the subject line for faster routing.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 transition-colors"
          >
            <Mail className="w-4 h-4" aria-hidden="true" />
            Contact Us
          </Link>
        </div>
        {/* <p className="text-sm">
          Website: <LegalHighlight>{SITE_URL}</LegalHighlight>
        </p> */}
      </LegalSection>
    </>
  );
}
