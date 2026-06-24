'use client';

import { useEffect, useState } from 'react';
import { Wrench, FolderOpen, FileText, Users, Eye, TrendingUp, BarChart3, Zap } from 'lucide-react';
import Link from 'next/link';

function StatCard({ label, value, icon: Icon, href, color = 'brand' }) {
  const colorMap = {
    brand: 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    orange: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  };
  return (
    <Link href={href} className="group flex items-start gap-4 p-6 bg-card border border-border rounded-2xl hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value ?? '—'}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [topTools, setTopTools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(data => {
        setStats(data.stats);
        setTopTools(data.topTools || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tools" value={stats?.totalTools} icon={Wrench} href="/admin/tools" color="brand" />
        <StatCard label="Categories" value={stats?.totalCategories} icon={FolderOpen} href="/admin/categories" color="purple" />
        <StatCard label="Blog Posts" value={stats?.totalBlogs} icon={FileText} href="/admin/blogs" color="green" />
        <StatCard label="Total Users" value={stats?.totalUsers} icon={Users} href="/admin/users" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top tools */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-brand-500" /> Top Tools</h2>
            <Link href="/admin/tools" className="text-xs text-brand-500 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {topTools.slice(0, 8).map((tool, i) => (
              <div key={tool._id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-4">#{i + 1}</span>
                <span className="text-lg">{tool.icon}</span>
                <span className="flex-1 text-sm font-medium truncate">{tool.title}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye className="w-3 h-3" />{tool.views?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-bold mb-6 flex items-center gap-2"><Zap className="w-4 h-4 text-brand-500" /> Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Add Tool', href: '/admin/tools', icon: '🔧' },
              { label: 'Add Category', href: '/admin/categories', icon: '📁' },
              { label: 'Write Blog Post', href: '/admin/blogs', icon: '📝' },
              { label: 'View Analytics', href: '/admin/analytics', icon: '📊' },
              { label: 'View Site', href: '/', icon: '🌐' },
              { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                target={action.href === '/' ? '_blank' : undefined}
                className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-brand-300 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-all group"
              >
                <span className="text-xl">{action.icon}</span>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
