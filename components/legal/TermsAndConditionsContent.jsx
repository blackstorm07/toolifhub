import Link from 'next/link';
import {
  AlertTriangle,
  Ban,
  CheckCircle,
  Copyright,
  ExternalLink,
  FileCheck,
  Gavel,
  Landmark,
  Mail,
  MessageSquareText,
  RefreshCw,
  Scale,
  Server,
  ShieldAlert,
  UserX,
  Users,
} from 'lucide-react';
import LegalSection from '@/components/legal/LegalSection';
import LegalHighlight from '@/components/legal/LegalHighlight';
import { SITE_NAME, SITE_URL } from '@/lib/seo/constants';

export const termsSections = [
  { id: 'acceptance-of-terms', title: 'Acceptance of Terms' },
  { id: 'eligibility-responsibilities', title: 'Eligibility & Responsibilities' },
  { id: 'permitted-use', title: 'Permitted Use' },
  { id: 'prohibited-activities', title: 'Prohibited Activities' },
  { id: 'intellectual-property', title: 'Intellectual Property' },
  { id: 'user-content', title: 'User Content & Submissions' },
  { id: 'third-party-services', title: 'Third-Party Services' },
  { id: 'disclaimer-warranties', title: 'Disclaimer of Warranties' },
  { id: 'limitation-liability', title: 'Limitation of Liability' },
  { id: 'indemnification', title: 'Indemnification' },
  { id: 'service-availability', title: 'Service Availability' },
  { id: 'suspension-termination', title: 'Suspension & Termination' },
  { id: 'changes-to-terms', title: 'Changes to Terms' },
  { id: 'governing-law', title: 'Governing Law' },
  { id: 'contact-information', title: 'Contact Information' },
];

export default function TermsAndConditionsContent() {
  return (
    <>
      <LegalSection
        id="acceptance-of-terms"
        title="Acceptance of Terms"
        icon={FileCheck}
        description="Please read these terms carefully before using our services."
      >
        <p>
          These Terms &amp; Conditions (&ldquo;Terms&rdquo;) constitute a legally binding
          agreement between you and <LegalHighlight>{SITE_NAME}</LegalHighlight>{' '}
          (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) governing your
          access to and use of <LegalHighlight>{SITE_URL}</LegalHighlight> and all
          associated online tools, content, and services (collectively, the
          &ldquo;Service&rdquo;).
        </p>
        <p>
          By accessing or using the Service, you acknowledge that you have read,
          understood, and agree to be bound by these Terms and our{' '}
          <Link href="/privacy-policy" className="legal-link">
            Privacy Policy
          </Link>
          . If you do not agree, you must not access or use the Service.
        </p>
        <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-900/10 p-4 sm:p-5">
          <p className="flex items-center gap-2 text-foreground font-medium text-sm sm:text-base mb-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
            Important notice
          </p>
          <p className="text-sm sm:text-[15px]">
            These Terms may be updated from time to time. Your continued use of the
            Service after changes are posted constitutes acceptance of the revised Terms.
          </p>
        </div>
      </LegalSection>

      <LegalSection
        id="eligibility-responsibilities"
        title="Eligibility & User Responsibilities"
        icon={Users}
        description="Who may use our Service and what we expect from you."
      >
        <p>
          The Service is intended for individuals who are at least{' '}
          <LegalHighlight>13 years of age</LegalHighlight> (or the minimum age required in
          your jurisdiction). By using {SITE_NAME}, you represent and warrant that you meet
          this eligibility requirement.
        </p>
        <p>As a user of the Service, you agree to:</p>
        <ul className="legal-list">
          <li>Provide accurate information when contacting us or submitting forms</li>
          <li>Use the Service only for lawful purposes and in compliance with these Terms</li>
          <li>Maintain the security of any devices or networks you use to access the Service</li>
          <li>Accept responsibility for all activity that occurs under your access to the Service</li>
          <li>Notify us promptly if you become aware of any unauthorized use or security breach</li>
        </ul>
        <p>
          If you are using the Service on behalf of an organization, you represent that you
          have authority to bind that organization to these Terms.
        </p>
      </LegalSection>

      <LegalSection
        id="permitted-use"
        title="Permitted Use"
        icon={CheckCircle}
        description="How you are authorized to use our tools and website."
      >
        <p>
          Subject to these Terms, we grant you a limited, non-exclusive, non-transferable,
          revocable license to access and use the Service for personal, educational, or
          professional purposes.
        </p>
        <p>You may use {SITE_NAME} to:</p>
        <ul className="legal-list">
          <li>Access and use our free online tools for legitimate tasks</li>
          <li>Share links to tools and pages on our website with others</li>
          <li>Reference our content with proper attribution where applicable</li>
          <li>Contact us with questions, feedback, or tool suggestions</li>
        </ul>
        <p>
          This license does not permit you to resell, sublicense, or commercially exploit
          the Service or its underlying technology without our prior written consent.
        </p>
      </LegalSection>

      <LegalSection
        id="prohibited-activities"
        title="Prohibited Activities"
        icon={Ban}
        description="Activities that are not allowed when using our Service."
      >
        <p>
          You agree <LegalHighlight>not</LegalHighlight> to engage in any of the following
          when using the Service:
        </p>
        <ul className="legal-list">
          <li>Violating any applicable local, national, or international law or regulation</li>
          <li>Attempting to gain unauthorized access to our systems, servers, or databases</li>
          <li>Interfering with or disrupting the integrity or performance of the Service</li>
          <li>Using automated scripts, bots, or scrapers to extract data at scale without permission</li>
          <li>Reverse-engineering, decompiling, or attempting to derive source code from our software</li>
          <li>Uploading or transmitting malware, viruses, or other harmful code</li>
          <li>Engaging in spamming, phishing, harassment, or abusive behavior</li>
          <li>Impersonating {SITE_NAME}, our team, or any other person or entity</li>
          <li>Circumventing rate limits, security measures, or access controls</li>
          <li>Using the Service to process illegal, infringing, or harmful content</li>
        </ul>
        <p>
          We reserve the right to investigate and take appropriate action against anyone
          who violates these prohibitions, including reporting to law enforcement.
        </p>
      </LegalSection>

      <LegalSection
        id="intellectual-property"
        title="Intellectual Property Rights"
        icon={Copyright}
        description="Ownership of content, trademarks, and technology on our platform."
      >
        <p>
          All content, features, functionality, design elements, logos, trademarks, and
          software comprising the Service are the exclusive property of{' '}
          <LegalHighlight>{SITE_NAME}</LegalHighlight> or its licensors and are protected
          by copyright, trademark, and other intellectual property laws.
        </p>
        <p>Unless expressly permitted in these Terms, you may not:</p>
        <ul className="legal-list">
          <li>Copy, modify, distribute, or create derivative works from our content or code</li>
          <li>Remove or alter any copyright, trademark, or proprietary notices</li>
          <li>Use our branding, logos, or name without prior written authorization</li>
          <li>Frame or mirror any portion of the Service without our consent</li>
        </ul>
        <p>
          Nothing in these Terms transfers any ownership rights to you. All rights not
          expressly granted are reserved by {SITE_NAME}.
        </p>
      </LegalSection>

      <LegalSection
        id="user-content"
        title="User Content & Submissions"
        icon={MessageSquareText}
        description="How we handle information and content you provide to us."
      >
        <p>
          When you submit content through our contact form, suggest tools, or otherwise
          communicate with us (&ldquo;User Content&rdquo;), you retain ownership of your
          content. However, you grant us a non-exclusive, worldwide, royalty-free license
          to use, reproduce, and process your submissions solely to operate and improve the
          Service and respond to your requests.
        </p>
        <p>
          Data entered into our online tools is generally processed{' '}
          <LegalHighlight>in your browser</LegalHighlight> or discarded immediately after
          use. We do not claim ownership over tool inputs and do not store them on our
          servers unless explicitly stated for a specific tool.
        </p>
        <p>You represent that any User Content you submit:</p>
        <ul className="legal-list">
          <li>Is accurate and does not violate any third-party rights</li>
          <li>Does not contain unlawful, defamatory, or harmful material</li>
          <li>Does not include confidential information you are not authorized to share</li>
        </ul>
      </LegalSection>

      <LegalSection
        id="third-party-services"
        title="Third-Party Services & Links"
        icon={ExternalLink}
        description="External websites, tools, and integrations referenced on our platform."
      >
        <p>
          The Service may contain links to third-party websites, services, or resources
          (including advertising partners such as Google AdSense) that are not owned or
          controlled by {SITE_NAME}.
        </p>
        <p>
          We have no control over and assume no responsibility for the content, privacy
          policies, terms of use, or practices of any third-party sites or services. Your
          interactions with third parties are solely between you and the third party.
        </p>
        <p>
          We encourage you to review the terms and privacy policies of any third-party
          services before providing them with your personal information or engaging with
          their offerings.
        </p>
      </LegalSection>

      <LegalSection
        id="disclaimer-warranties"
        title="Disclaimer of Warranties"
        icon={AlertTriangle}
        description="Understanding the limitations of our Service guarantees."
      >
        <p>
          The Service and all tools, content, and information are provided on an{' '}
          <LegalHighlight>&ldquo;as is&rdquo;</LegalHighlight> and{' '}
          <LegalHighlight>&ldquo;as available&rdquo;</LegalHighlight> basis without
          warranties of any kind, whether express or implied.
        </p>
        <p>To the fullest extent permitted by law, we disclaim all warranties, including:</p>
        <ul className="legal-list">
          <li>Merchantability, fitness for a particular purpose, and non-infringement</li>
          <li>Accuracy, reliability, or completeness of tool outputs or information</li>
          <li>Uninterrupted, timely, secure, or error-free operation of the Service</li>
          <li>That defects will be corrected or that the Service is free of harmful components</li>
        </ul>
        <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-900/10 p-4 sm:p-5">
          <p className="text-sm sm:text-[15px]">
            <LegalHighlight>No professional advice:</LegalHighlight> Tools and content on{' '}
            {SITE_NAME} are for informational and utility purposes only. They do not
            constitute legal, financial, medical, or other professional advice. Always
            verify critical results independently before relying on them.
          </p>
        </div>
      </LegalSection>

      <LegalSection
        id="limitation-liability"
        title="Limitation of Liability"
        icon={Scale}
        description="Limits on our liability for damages arising from use of the Service."
      >
        <p>
          To the maximum extent permitted by applicable law,{' '}
          <LegalHighlight>{SITE_NAME}</LegalHighlight>, its owners, affiliates, officers,
          employees, and suppliers shall not be liable for any indirect, incidental,
          special, consequential, or punitive damages, including but not limited to:
        </p>
        <ul className="legal-list">
          <li>Loss of profits, revenue, data, or business opportunities</li>
          <li>Service interruption or unavailability</li>
          <li>Errors or inaccuracies in tool outputs</li>
          <li>Unauthorized access to or alteration of your data</li>
          <li>Any conduct or content of third parties on or through the Service</li>
        </ul>
        <p>
          In jurisdictions that do not allow the exclusion of certain warranties or
          limitation of liability, our liability shall be limited to the greatest extent
          permitted by law. In no event shall our total liability exceed the amount you
          paid to us for use of the Service in the twelve (12) months preceding the claim
          — which, given our tools are free, may be <LegalHighlight>zero</LegalHighlight>.
        </p>
      </LegalSection>

      <LegalSection
        id="indemnification"
        title="Indemnification"
        icon={ShieldAlert}
        description="Your responsibility to defend us against certain claims."
      >
        <p>
          You agree to defend, indemnify, and hold harmless {SITE_NAME}, its affiliates,
          licensors, and service providers, and their respective officers, directors,
          employees, and agents from and against any claims, liabilities, damages,
          judgments, awards, losses, costs, or expenses (including reasonable attorneys&apos;
          fees) arising out of or relating to:
        </p>
        <ul className="legal-list">
          <li>Your violation of these Terms or applicable law</li>
          <li>Your use or misuse of the Service</li>
          <li>Your User Content or any content you submit through the Service</li>
          <li>Your infringement of any third-party intellectual property or other rights</li>
        </ul>
        <p>
          We reserve the right to assume exclusive defense and control of any matter
          subject to indemnification by you, at your expense.
        </p>
      </LegalSection>

      <LegalSection
        id="service-availability"
        title="Service Availability"
        icon={Server}
        description="What to expect regarding uptime, maintenance, and feature changes."
      >
        <p>
          We strive to keep {SITE_NAME} available and performant, but we do not guarantee
          uninterrupted access. The Service may be temporarily unavailable due to:
        </p>
        <ul className="legal-list">
          <li>Scheduled maintenance, updates, or infrastructure improvements</li>
          <li>Unexpected technical issues, outages, or force majeure events</li>
          <li>Changes, removal, or discontinuation of specific tools or features</li>
        </ul>
        <p>
          We may modify, suspend, or discontinue any part of the Service at any time
          without prior notice. We are not liable for any modification, suspension, or
          discontinuation of the Service or any part thereof.
        </p>
      </LegalSection>

      <LegalSection
        id="suspension-termination"
        title="Account Suspension & Termination"
        icon={UserX}
        description="When and how access to the Service may be restricted or ended."
      >
        <p>
          While {SITE_NAME} does not require user accounts for most tools, we reserve the
          right to suspend or terminate your access to the Service at any time, with or
          without notice, for conduct that we believe:
        </p>
        <ul className="legal-list">
          <li>Violates these Terms or our policies</li>
          <li>Poses a security risk to the Service or other users</li>
          <li>May create liability or harm to {SITE_NAME} or third parties</li>
          <li>Is fraudulent, abusive, or unlawful</li>
        </ul>
        <p>
          You may stop using the Service at any time. Upon termination, all licenses and
          rights granted to you under these Terms will immediately cease. Provisions that
          by their nature should survive termination — including intellectual property,
          disclaimers, limitation of liability, and indemnification — will remain in effect.
        </p>
      </LegalSection>

      <LegalSection
        id="changes-to-terms"
        title="Changes to Terms"
        icon={RefreshCw}
        description="How we update these Terms and notify users of changes."
      >
        <p>
          We may revise these Terms at any time to reflect changes in our practices, the
          Service, or legal requirements. When we make material changes, we will update
          the &ldquo;Last updated&rdquo; date at the top of this page.
        </p>
        <p>
          Your continued use of the Service after revised Terms are posted constitutes your
          acceptance of the changes. If you do not agree to the updated Terms, you must
          discontinue use of the Service.
        </p>
        <p>
          We encourage you to review these Terms periodically to stay informed of your
          rights and obligations.
        </p>
      </LegalSection>

      <LegalSection
        id="governing-law"
        title="Governing Law"
        icon={Landmark}
        description="Legal jurisdiction and dispute resolution framework."
      >
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the
          jurisdiction in which <LegalHighlight>{SITE_NAME}</LegalHighlight> operates,
          without regard to conflict of law principles.
        </p>
        <p>
          Any dispute, claim, or controversy arising out of or relating to these Terms or
          the Service shall be resolved in the competent courts of the applicable
          jurisdiction, unless otherwise required by mandatory consumer protection laws in
          your country of residence.
        </p>
        <p>
          If any provision of these Terms is found to be unenforceable, the remaining
          provisions will continue in full force and effect.
        </p>
      </LegalSection>

      <LegalSection
        id="contact-information"
        title="Contact Information"
        icon={Mail}
        description="How to reach us with questions about these Terms."
      >
        <p>
          If you have questions, concerns, or feedback regarding these Terms &amp;
          Conditions, please contact us through our contact page:
        </p>
        <div className="rounded-xl border border-brand-100 dark:border-brand-900/50 bg-brand-50/50 dark:bg-brand-900/10 p-5 sm:p-6">
          <p className="flex items-center gap-2 text-foreground font-medium mb-2">
            <Gavel className="w-4 h-4 text-brand-500" aria-hidden="true" />
            Terms inquiries
          </p>
          <p className="mb-4">
            Submit a message through our contact form and include &ldquo;Terms
            Inquiry&rdquo; in your message for faster routing.
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
