'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Eye, Activity } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const topTools = data?.topTools || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform performance overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tool Views', value: stats.totalUsage?.toLocaleString(), icon: Eye },
          { label: 'Active Tools', value: stats.activeTools, icon: Activity },
          { label: 'Categories', value: stats.totalCategories, icon: BarChart3 },
          { label: 'Blog Posts', value: stats.totalBlogs, icon: TrendingUp },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <s.icon className="w-4 h-4 text-brand-500" />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-2xl font-bold">{loading ? '—' : (s.value ?? 0)}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-bold mb-6 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-brand-500" /> Top Performing Tools</h2>
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-8 bg-muted animate-pulse rounded-lg" />)}</div>
        ) : (
          <div className="space-y-3">
            {topTools.map((tool, i) => (
              <div key={tool._id} className="flex items-center gap-4">
                <span className="text-sm font-bold text-muted-foreground w-6 flex-shrink-0">#{i + 1}</span>
                <span className="text-lg flex-shrink-0">{tool.icon}</span>
                <span className="flex-1 text-sm font-medium truncate">{tool.title}</span>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:block w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full"
                      style={{ width: `${topTools[0]?.views ? Math.min((tool.views / topTools[0].views) * 100, 100) : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye className="w-3 h-3" />{tool.views?.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-bold mb-4">Google Analytics Integration</h2>
        <p className="text-sm text-muted-foreground">
          {process.env.NEXT_PUBLIC_GA_ID
            ? `✅ Google Analytics 4 is connected (ID: ${process.env.NEXT_PUBLIC_GA_ID}). Visit your `
            : '⚠️ Google Analytics is not configured. Add your GA4 Measurement ID to .env.local to enable tracking.'}
          {process.env.NEXT_PUBLIC_GA_ID && (
            <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">Google Analytics dashboard</a>
          )}
          {process.env.NEXT_PUBLIC_GA_ID && ' for detailed reports.'}
        </p>
      </div>
    </div>
  );
}
