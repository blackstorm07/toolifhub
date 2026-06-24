export const metadata = {
  title: 'Privacy Policy',
  description: 'ToolifHub Privacy Policy — how we collect, use, and protect your information.',
};

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'ToolifHub';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-12 lg:py-16 max-w-3xl">
      <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <section>
          <h2>1. Introduction</h2>
          <p>Welcome to {APP_NAME} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit {APP_URL}.</p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <p>We collect minimal information necessary to operate our service:</p>
          <ul>
            <li><strong>Log Data:</strong> Server logs including IP address, browser type, pages visited, and timestamps.</li>
            <li><strong>Analytics Data:</strong> Aggregated, anonymized usage data via Google Analytics 4 to understand how our tools are used.</li>
            <li><strong>Contact Information:</strong> Name and email address if you contact us via our contact form.</li>
            <li><strong>Tool Input Data:</strong> Data you enter into tools is processed in your browser or discarded after processing. We do not store tool inputs.</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>To operate and improve our tools and website</li>
            <li>To respond to your inquiries and support requests</li>
            <li>To analyze usage patterns and optimize performance</li>
            <li>To detect and prevent abuse or fraud</li>
          </ul>
        </section>

        <section>
          <h2>4. Cookies</h2>
          <p>We use cookies for:</p>
          <ul>
            <li><strong>Analytics:</strong> Google Analytics uses cookies to track usage patterns (can be opted out)</li>
            <li><strong>Advertising:</strong> Google AdSense may use cookies to serve personalized ads</li>
            <li><strong>Preferences:</strong> Dark/light mode preference</li>
          </ul>
        </section>

        <section>
          <h2>5. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li><strong>Google Analytics:</strong> Usage analytics — <a href="https://policies.google.com/privacy">Google Privacy Policy</a></li>
            <li><strong>Google AdSense:</strong> Advertising — <a href="https://policies.google.com/privacy">Google Privacy Policy</a></li>
            <li><strong>MongoDB Atlas:</strong> Database hosting — <a href="https://www.mongodb.com/legal/privacy-policy">MongoDB Privacy Policy</a></li>
          </ul>
        </section>

        <section>
          <h2>6. Data Security</h2>
          <p>We implement industry-standard security measures including HTTPS encryption, secure database connections, and regular security audits. However, no method of transmission over the internet is 100% secure.</p>
        </section>

        <section>
          <h2>7. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information. Contact us at the email on our Contact page to exercise these rights.</p>
        </section>

        <section>
          <h2>8. Children&apos;s Privacy</h2>
          <p>Our service is not directed at children under 13. We do not knowingly collect information from children under 13.</p>
        </section>

        <section>
          <h2>9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the date at the top of this page.</p>
        </section>

        <section>
          <h2>10. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please <a href="/contact">contact us</a>.</p>
        </section>
      </div>
    </div>
  );
}
