export const metadata = {
  title: 'Terms & Conditions',
  description: 'ToolifHub Terms and Conditions of Use.',
};

export default function TermsPage() {
  const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'ToolifHub';
  return (
    <div className="container py-12 lg:py-16 max-w-3xl">
      <h1 className="text-4xl font-bold mb-2">Terms & Conditions</h1>
      <p className="text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <section><h2>1. Agreement to Terms</h2><p>By accessing and using {APP_NAME}, you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree, please do not use our service.</p></section>

        <section><h2>2. Use License</h2><p>Permission is granted to temporarily use {APP_NAME} tools for personal, non-commercial transitory purposes. This license does not include: modifying or copying materials for commercial purposes; using materials for commercial benefit; attempting to reverse-engineer any software; transferring materials to another person; or using the website for any illegal purpose.</p></section>

        <section><h2>3. Disclaimer</h2><p>The tools and information on {APP_NAME} are provided on an &ldquo;as is&rdquo; basis. We make no warranties, expressed or implied, and hereby disclaim all warranties including fitness for a particular purpose. We do not warrant that the tools will always be available, error-free, or produce accurate results.</p></section>

        <section><h2>4. Limitations</h2><p>In no event shall {APP_NAME} or its suppliers be liable for any damages arising from the use or inability to use the materials on our website, even if we have been notified of the possibility of such damage.</p></section>

        <section><h2>5. Acceptable Use</h2><p>You agree not to use {APP_NAME} for: illegal activities; spamming or abusive behavior; attempting to breach security; interfering with the operation of the website; or impersonating others.</p></section>

        <section><h2>6. Intellectual Property</h2><p>All content, features, and functionality of {APP_NAME} — including text, graphics, logos, and software — are owned by {APP_NAME} and protected by applicable intellectual property laws.</p></section>

        <section><h2>7. Third-Party Links</h2><p>Our website may contain links to third-party websites. We have no control over and assume no responsibility for their content, privacy policies, or practices.</p></section>

        <section><h2>8. Modifications</h2><p>We reserve the right to revise these Terms at any time without notice. By continuing to use the website, you agree to be bound by the current version of these Terms.</p></section>

        <section><h2>9. Governing Law</h2><p>These Terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved in the competent courts of the applicable jurisdiction.</p></section>

        <section><h2>10. Contact</h2><p>For questions about these Terms, please <a href="/contact">contact us</a>.</p></section>
      </div>
    </div>
  );
}
