import Link from 'next/link';
import { Twitter, Github, Mail } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import { getVisibleCategoriesWithCounts } from '@/lib/categories';
import Logo from '@/components/brand/Logo';

const COMPANY_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
  { label: 'All Categories', href: '/categories' },
];

const GUIDE_LINKS = [
  { label: 'Best AI Tools', href: '/best-ai-tools' },
  { label: 'Best SEO Tools', href: '/best-seo-tools' },
  { label: 'Best Developer Tools', href: '/best-developer-tools' },
  { label: 'Best YouTube Tools', href: '/best-youtube-tools' },
  { label: 'Best Productivity Tools', href: '/best-productivity-tools' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms-and-conditions' },
];

async function getFooterCategories() {
  try {
    await connectDB();
    const categories = await getVisibleCategoriesWithCounts({ limit: 5 });
    return categories.map((c) => ({ label: c.name, href: `/category/${c.slug}` }));
  } catch {
    return [];
  }
}

export default async function Footer() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'ToolifHub';
  const toolLinks = await getFooterCategories();

  const footerLinks = {
    ...(toolLinks.length > 0 ? { Tools: toolLinks } : {}),
    // Guides: GUIDE_LINKS,
    Company: COMPANY_LINKS,
    Legal: LEGAL_LINKS,
  };

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 inline-flex">
              <Logo size={32} textClassName="text-lg" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              One Hub. Unlimited Tools. Free online tools for developers, creators, and productivity — all in one place.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {/* <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors">
                <Github className="w-4 h-4" />
              </a> */}
              <Link href="/contact"
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors">
                <Mail className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="font-semibold text-sm mb-4">{section}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {appName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
