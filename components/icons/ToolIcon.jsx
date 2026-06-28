import { getToolIcon } from '@/lib/icons/toolIcons';

/** Renders a tool's Lucide icon by slug, replacing the legacy emoji field. */
export default function ToolIcon({ slug, className = 'w-5 h-5' }) {
  const Icon = getToolIcon(slug);
  return <Icon className={className} aria-hidden="true" />;
}
