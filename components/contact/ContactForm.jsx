'use client';

import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        toast.success('Message sent successfully!');
      } else {
        toast.error(data.error || 'Failed to send message');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  if (sent) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
        <p className="text-muted-foreground">We&apos;ll get back to you within 24-48 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium mb-2">Your Name *</label>
          <input
            type="text" value={form.name} onChange={set('name')} required
            className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email Address *</label>
          <input
            type="email" value={form.email} onChange={set('email')} required
            className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            placeholder="john@example.com"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Subject</label>
        <input
          type="text" value={form.subject} onChange={set('subject')}
          className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
          placeholder="Tool suggestion, bug report, general inquiry..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Message *</label>
        <textarea
          value={form.message} onChange={set('message')} required rows={6}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors resize-none"
          placeholder="Tell us more..."
        />
      </div>
      <button
        type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 h-12 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-70"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <><Send className="w-4 h-4" /> Send Message</>
        )}
      </button>
    </form>
  );
}
