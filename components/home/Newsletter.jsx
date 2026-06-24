'use client';

import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { trackNewsletterSignup } from '@/lib/analytics';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    // Simulate API call — integrate with Mailchimp/Resend/etc.
    await new Promise((r) => setTimeout(r, 1000));
    trackNewsletterSignup(email);
    setStatus('success');
    setEmail('');
  };

  return (
    <section className="section bg-gradient-to-r from-brand-600 to-purple-600">
      <div className="container text-center text-white">
        <div className="max-w-2xl mx-auto">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="w-7 h-7" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Stay in the Loop</h2>
          <p className="text-brand-100 mb-8 text-lg">
            Get notified when we launch new tools, write tutorials, and share tips to boost your productivity.
          </p>

          {status === 'success' ? (
            <div className="flex items-center justify-center gap-3 bg-white/20 rounded-2xl px-6 py-4">
              <CheckCircle className="w-6 h-6 text-green-300" />
              <p className="font-semibold">You&apos;re subscribed! 🎉 We&apos;ll be in touch soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 h-12 px-4 rounded-xl bg-white/20 border border-white/30 text-white placeholder:text-white/60 outline-none focus:bg-white/30 transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="flex items-center justify-center gap-2 h-12 px-6 bg-white text-brand-600 font-semibold rounded-xl hover:bg-brand-50 transition-colors flex-shrink-0 disabled:opacity-70"
              >
                {status === 'loading' ? (
                  <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Subscribe <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}

          <p className="text-white/50 text-sm mt-4">No spam, ever. Unsubscribe any time.</p>
        </div>
      </div>
    </section>
  );
}
