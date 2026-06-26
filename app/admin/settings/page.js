'use client';

import { CheckCircle, AlertTriangle } from 'lucide-react';

function EnvRow({ label, envKey, value, required = false }) {
  const isSet = value && value !== '';
  const isPlaceholder = value?.includes('XXXXXXXXXX') || value?.includes('YOUR_') || value?.includes('CHANGE_');
  const status = !isSet || isPlaceholder ? (required ? 'error' : 'warning') : 'ok';

  return (
    <div className="flex items-start gap-4 py-4 border-b border-border last:border-0">
      <div className="flex-shrink-0 mt-0.5">
        {status === 'ok' ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <AlertTriangle className={`w-5 h-5 ${status === 'error' ? 'text-red-500' : 'text-yellow-500'}`} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">{envKey}</p>
      </div>
      <div className="text-right">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          status === 'ok' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
          status === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
          'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
        }`}>
          {status === 'ok' ? 'Configured' : status === 'error' ? 'Required' : 'Not Set'}
        </span>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const config = {
    appName: process.env.NEXT_PUBLIC_APP_NAME,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    gtmId: process.env.NEXT_PUBLIC_GTM_ID,
    gaId: process.env.NEXT_PUBLIC_GA_ID,
    adsenseClient: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT,
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Environment configuration status</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-bold mb-1">Environment Variables</h2>
        <p className="text-sm text-muted-foreground mb-6">Configure these in your <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">.env.local</code> file.</p>

        <EnvRow label="MongoDB URI" envKey="MONGODB_URI" value="[server-side only]" required />
        <EnvRow label="App Name" envKey="NEXT_PUBLIC_APP_NAME" value={config.appName} required />
        <EnvRow label="App URL" envKey="NEXT_PUBLIC_APP_URL" value={config.appUrl} required />
        <EnvRow label="JWT Secret" envKey="JWT_SECRET" value="[server-side only]" required />
        <EnvRow label="Google Tag Manager ID" envKey="NEXT_PUBLIC_GTM_ID" value={config.gtmId} />
        <EnvRow label="Google Analytics 4 ID (GTM reference)" envKey="NEXT_PUBLIC_GA_ID" value={config.gaId} />
        <EnvRow label="Google AdSense Client ID" envKey="NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT" value={config.adsenseClient} />
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-bold mb-4">Site Information</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Site Name</span><span className="font-medium">{config.appName || '—'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Site URL</span><span className="font-medium">{config.appUrl || '—'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Analytics (GTM)</span><span className="font-medium">{config.gtmId && !config.gtmId.includes('XXXX') ? 'Connected' : 'Not configured'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">AdSense</span><span className="font-medium">{config.adsenseClient && !config.adsenseClient.includes('XXXX') ? 'Connected' : 'Not configured'}</span></div>
        </div>
      </div>
    </div>
  );
}
