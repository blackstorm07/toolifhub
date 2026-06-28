import {
  Bot,
  Calculator,
  Palette,
  RotateCw,
  Code2,
  Landmark,
  Image,
  FileText,
  Zap,
  Dices,
  ShieldCheck,
  Search,
  Instagram,
  Type,
  Wrench,
  Youtube,
  LayoutGrid,
} from 'lucide-react';

// Maps a category slug to a Lucide icon component, replacing the emoji
// previously stored in Category.icon for on-screen rendering.
export const CATEGORY_ICON_MAP = {
  'ai-tools': Bot,
  calculators: Calculator,
  'color-tools': Palette,
  converters: RotateCw,
  'developer-tools': Code2,
  'government-tools': Landmark,
  'image-tools': Image,
  'pdf-tools': FileText,
  'productivity-tools': Zap,
  'random-generators': Dices,
  'security-tools': ShieldCheck,
  'seo-tools': Search,
  'social-media-tools': Instagram,
  'text-tools': Type,
  'utility-tools': Wrench,
  'youtube-tools': Youtube,
};

export function getCategoryIcon(slug) {
  return CATEGORY_ICON_MAP[slug] || LayoutGrid;
}
