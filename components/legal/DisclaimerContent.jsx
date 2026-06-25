import Link from 'next/link';
import {
  AlertTriangle,
  Banknote,
  ExternalLink,
  Gavel,
  Mail,
  Scale,
  ShieldAlert,
  Wrench,
} from 'lucide-react';
import LegalSection from '@/components/legal/LegalSection';
import LegalHighlight from '@/components/legal/LegalHighlight';
import { SITE_NAME, SITE_URL } from '@/lib/seo/constants';

export const disclaimerSections = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'no-professional-advice', title: 'No Professional Advice' },
  { id: 'accuracy-of-tools', title: 'Accuracy of Tools' },
  { id: 'third-party-links', title: 'Third-Party Links' },
  { id: 'affiliate-advertising', title: 'Affiliate & Advertising' },
  { id: 'limitation-of-liability', title: 'Limitation of Liability' },
  { id: 'contact-information', title: 'Contact Information' },
];

export default function DisclaimerContent() {
  return (
    <>
      <LegalSection
        id="introduction"
        title="Introduction"
        icon={AlertTriangle}
        description="General terms governing the information and tools provided on this site."
      >
        <p>
          The information and tools provided on <LegalHighlight>{SITE_NAME}</LegalHighlight>{' '}
          (<LegalHighlight>{SITE_URL}</LegalHighlight>) are made available for general
          informational and utility purposes only. By using our website, you acknowledge
          and agree to the terms of this Disclaimer in full.
        </p>
        <p>
          Nothing on this site constitutes professional advice, and your use of any tool or
          content is entirely at your own risk.
        </p>
      </LegalSection>

      <LegalSection
        id="no-professional-advice"
        title="No Professional Advice"
        icon={Scale}
        description="Our content is not a substitute for qualified professional guidance."
      >
        <p>
          Content published on {SITE_NAME}, including blog articles, tool descriptions, and
          guides, is provided for general informational purposes and does{' '}
          <LegalHighlight>not</LegalHighlight> constitute legal, financial, medical, tax, or
          other professional advice. You should consult a qualified professional before
          making decisions based on information found on this website.
        </p>
      </LegalSection>

      <LegalSection
        id="accuracy-of-tools"
        title="Accuracy of Tools"
        icon={Wrench}
        description="Our tools are provided 'as is' without warranties of accuracy or fitness."
      >
        <p>
          We make reasonable efforts to ensure our free online tools function correctly and
          produce accurate results. However, we do <LegalHighlight>not</LegalHighlight>{' '}
          guarantee that any tool is error-free, complete, or suitable for every use case.
        </p>
        <ul className="legal-list">
          <li>Calculations, conversions, and generated output should be independently verified before relying on them for important decisions.</li>
          <li>Tools are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without warranties of any kind, express or implied.</li>
          <li>We are not liable for any loss or damage arising from reliance on tool output.</li>
        </ul>
      </LegalSection>

      <LegalSection
        id="third-party-links"
        title="Third-Party Links"
        icon={ExternalLink}
        description="We are not responsible for the content of external websites."
      >
        <p>
          Our website may contain links to third-party websites or services that are not
          owned or controlled by {SITE_NAME}. We have no control over, and assume no
          responsibility for, the content, privacy policies, or practices of any third-party
          websites. Visiting linked sites is at your own risk.
        </p>
      </LegalSection>

      <LegalSection
        id="affiliate-advertising"
        title="Affiliate & Advertising Disclosure"
        icon={Banknote}
        description="How advertising supports our free tools."
      >
        <p>
          {SITE_NAME} displays advertisements served by Google AdSense and may participate in
          affiliate programs to keep our tools free to use. We may earn a commission or
          advertising revenue from clicks or purchases made through links or ads on our
          site, at no extra cost to you. Advertisements are clearly distinguished from
          editorial content where possible.
        </p>
      </LegalSection>

      <LegalSection
        id="limitation-of-liability"
        title="Limitation of Liability"
        icon={ShieldAlert}
        description="The extent of our liability for use of this website."
      >
        <p>
          Under no circumstances shall {SITE_NAME}, its owners, or contributors be liable for
          any direct, indirect, incidental, consequential, or special damages arising out of
          or in connection with your use of this website or any tool, content, or service
          provided on it, even if advised of the possibility of such damages.
        </p>
      </LegalSection>

      <LegalSection
        id="contact-information"
        title="Contact Information"
        icon={Mail}
        description="How to reach us with questions about this Disclaimer."
      >
        <p>
          If you have questions about this Disclaimer, please reach out through our contact
          page:
        </p>
        <div className="rounded-xl border border-brand-100 dark:border-brand-900/50 bg-brand-50/50 dark:bg-brand-900/10 p-5 sm:p-6">
          <p className="flex items-center gap-2 text-foreground font-medium mb-2">
            <Gavel className="w-4 h-4 text-brand-500" aria-hidden="true" />
            General inquiries
          </p>
          <p className="mb-4">
            Submit a message through our contact form and include &ldquo;Disclaimer&rdquo;
            in the subject line for faster routing.
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
