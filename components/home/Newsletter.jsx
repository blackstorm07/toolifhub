'use client';

import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle, ShieldCheck, XCircle, Send } from 'lucide-react';
import { trackNewsletterSignup } from '@/lib/analytics';

function SparkleAccent() {
  return (
    <svg
      className="absolute -top-3 -right-7 w-5 h-5 text-brand-400 dark:text-brand-500/70 hidden sm:block"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path d="M14 2 L15.5 5.5 L19 7 L15.5 8.5 L14 12 L12.5 8.5 L9 7 L12.5 5.5 Z" fill="currentColor" opacity="0.7" />
      <path d="M6 0 L6.8 2.2 L9 3 L6.8 3.8 L6 6 L5.2 3.8 L3 3 L5.2 2.2 Z" fill="currentColor" opacity="0.5" />
      <line x1="17" y1="1" x2="19" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="18" y1="0" x2="18" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function LoopDecoration() {
  return (
    <div className="absolute left-4 sm:left-12 lg:left-24 bottom-8 sm:bottom-12 pointer-events-none hidden sm:block" aria-hidden="true">
      <svg viewBox="0 0 100 70" className="w-24 h-16 text-brand-200 dark:text-brand-700/60" fill="none">
        <path
          d="M8 55 C8 30, 35 15, 55 30 C75 45, 70 20, 88 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="5 5"
          strokeLinecap="round"
        />
      </svg>
      <Send className="absolute right-0 top-0 w-4 h-4 text-brand-400 dark:text-brand-500 -rotate-12" />
    </div>
  );
}

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    await new Promise((r) => setTimeout(r, 1000));
    trackNewsletterSignup(email);
    setStatus('success');
    setEmail('');
  };

  return (
    <section className="relative section overflow-hidden bg-gradient-to-b from-brand-50/60 via-white to-brand-50/40 dark:from-[#1a1f35] dark:via-[#111520] dark:to-[#0a0c14]">
      {/* Radial glow — dark mode */}
      <div
        className="absolute inset-0 pointer-events-none hidden dark:block"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(99,102,241,0.12) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* Section-wide background blobs */}
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-100/60 dark:bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-100/50 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <LoopDecoration />

      {/* Large decorative envelope */}
      <div className="absolute right-4 sm:right-12 lg:right-24 bottom-4 pointer-events-none hidden md:block" aria-hidden="true">
        <Mail className="w-40 h-40 lg:w-48 lg:h-48 text-brand-300/35 dark:text-brand-500/15 rotate-12" strokeWidth={1.25} />
      </div>

      <div className="container relative">
        <div className="max-w-2xl mx-auto text-center py-4 sm:py-6">
          {/* Icon badge */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute w-16 h-16 bg-brand-200/50 dark:bg-brand-500/20 rounded-full blur-xl" />
            <div className="relative w-14 h-14 bg-brand-50 dark:bg-brand-900/70 rounded-full flex items-center justify-center ring-1 ring-brand-100 dark:ring-brand-700/50 shadow-sm dark:shadow-brand-900/40">
              <Mail className="w-6 h-6 text-brand-500 dark:text-brand-300" />
            </div>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-foreground dark:text-white mb-4 tracking-tight">
            Stay in the{' '}
            <span className="relative inline-block">
              Loop
              <SparkleAccent />
            </span>
          </h2>

          <p className="text-muted-foreground dark:text-slate-400 text-base sm:text-lg max-w-[520px] mx-auto mb-8 leading-relaxed">
            Get notified when we launch new tools, write tutorials, and share tips to boost your productivity.
          </p>

          {status === 'success' ? (
            <div className="flex items-center justify-center gap-3 bg-white/80 dark:bg-[#161b28]/90 border border-brand-100 dark:border-brand-700/50 rounded-2xl px-6 py-4 w-full max-w-[560px] mx-auto backdrop-blur-sm">
              <CheckCircle className="w-6 h-6 text-brand-500 dark:text-brand-400 flex-shrink-0" />
              <p className="font-semibold text-foreground dark:text-white">You&apos;re subscribed! We&apos;ll be in touch soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex w-full max-w-[560px] mx-auto gap-3">
              <div className="relative flex-1 min-w-0">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400 dark:text-brand-500 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-border dark:border-brand-800/60 bg-white dark:bg-[#161b28] text-foreground dark:text-white placeholder:text-muted-foreground/60 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-brand-500/20 dark:focus:ring-brand-500/30 focus:border-brand-400 dark:focus:border-brand-600 transition-colors shadow-sm dark:shadow-none"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="flex items-center justify-center gap-2 h-12 px-5 sm:px-6 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold rounded-xl shadow-md shadow-brand-500/25 dark:shadow-brand-500/20 transition-all flex-shrink-0 whitespace-nowrap disabled:opacity-70"
              >
                {status === 'loading' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Subscribe <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-5 text-sm text-muted-foreground dark:text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-500 dark:text-brand-400" />
              No spam, ever.
            </span>
            <span className="hidden sm:inline text-border dark:text-brand-800">|</span>
            <span className="flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-brand-500 dark:text-brand-400" />
              Unsubscribe any time.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
