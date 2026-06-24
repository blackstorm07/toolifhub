import { MessageSquare } from 'lucide-react';
import ContactForm from '@/components/contact/ContactForm';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
  title: 'Contact Us',
  description: 'Get in touch with the ToolifHub team. Send questions, tool suggestions, bug reports, or partnership inquiries.',
  path: '/contact',
  keywords: ['contact toolifhub', 'tool suggestion', 'bug report', 'support'],
});

export default function ContactPage() {
  return (
    <div className="page max-w-2xl">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-7 h-7 text-brand-500" />
        </div>
        <h1 className="text-4xl font-bold mb-3">Get in Touch</h1>
        <p className="text-muted-foreground text-lg">Have a question, suggestion, or want to report a bug? We&apos;d love to hear from you.</p>
      </div>
      <ContactForm />
    </div>
  );
}
