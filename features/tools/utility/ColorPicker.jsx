'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Copy, Check, Pipette, Shuffle, Star, Download, Sun, Moon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { copyToClipboard } from '@/lib/utils';
import { trackToolUsage } from '@/lib/analytics';
import {
  buildColorFromHex,
  buildColorFromRgba,
  hexToRgba,
  isValidHex,
  normalizeHex,
  hslToRgb,
  hsvToRgb,
  cmykToRgb,
  hwbToRgb,
  relativeLuminance,
  contrastRatio,
  brightness,
  wcagLevel,
  randomColor,
} from '@/lib/color/converter';
import {
  getComplementary, getAnalogous, getTriadic, getSplitComplementary,
  getTetradic, getMonochromatic, getShadesAndTints, POPULAR_COLORS,
} from '@/lib/color/palette';
import { buildGradientCss } from '@/lib/color/gradient';
import { buildTailwindClasses } from '@/lib/color/tailwindColors';

const TABS = [
  { id: 'converter', label: 'Picker & Converter' },
  { id: 'palette', label: 'Palettes' },
  { id: 'shades', label: 'Shades & Tints' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'css', label: 'CSS & Tailwind' },
  { id: 'a11y', label: 'Accessibility' },
];

const RECENTS_KEY = 'toolifhub:color-picker:recents';
const FAVORITES_KEY = 'toolifhub:color-picker:favorites';

function readStorage(key) {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable (private mode, quota) — fail silently
  }
}

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await copyToClipboard(value);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      aria-label={`Copy ${label || value}`}
      className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function FormatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl border border-border bg-background">
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground font-medium">{label}</div>
        <div className="text-sm font-mono truncate">{value}</div>
      </div>
      <CopyButton value={value} label={label} />
    </div>
  );
}

function Swatch({ color, onClick, size = 'md' }) {
  const dims = size === 'sm' ? 'w-9 h-9' : 'w-12 h-12';
  return (
    <button
      onClick={() => onClick?.(color)}
      title={color.hex}
      className={`${dims} rounded-lg border border-border flex-shrink-0 hover:scale-105 hover:ring-2 hover:ring-brand-500/40 transition-transform`}
      style={{ backgroundColor: color.strings.rgba }}
    />
  );
}

function PaletteGroup({ title, colors, onPick }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="flex flex-wrap gap-3">
        {colors.map((c, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <Swatch color={c} onClick={onPick} />
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-muted-foreground">{c.hex}</span>
              <CopyButton value={c.hex} label={c.hex} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ColorPicker() {
  const [color, setColor] = useState(() => buildColorFromHex('#3b82f6'));
  const [hexInput, setHexInput] = useState('#3b82f6');
  const [opacity, setOpacity] = useState(100);
  const [tab, setTab] = useState('converter');
  const [recents, setRecents] = useState(() => readStorage(RECENTS_KEY));
  const [favorites, setFavorites] = useState(() => readStorage(FAVORITES_KEY));
  const [eyeDropperSupported] = useState(() => typeof window !== 'undefined' && 'EyeDropper' in window);
  const trackedRef = useRef(false);

  const trackUsageOnce = useCallback(() => {
    if (!trackedRef.current) {
      trackedRef.current = true;
      trackToolUsage('color-picker', 'Color Picker & Converter');
    }
  }, []);

  const applyColor = useCallback((next, { remember = true } = {}) => {
    if (!next) return;
    setColor(next);
    setHexInput(next.hex);
    setOpacity(Math.round((next.a ?? 1) * 100));
    trackUsageOnce();
    if (remember) {
      setRecents((prev) => {
        const filtered = prev.filter((c) => c.toLowerCase() !== next.hex.toLowerCase());
        const updated = [next.hex, ...filtered].slice(0, 20);
        writeStorage(RECENTS_KEY, updated);
        return updated;
      });
    }
  }, [trackUsageOnce]);

  const updateFromRgba = useCallback((rgba) => {
    applyColor(buildColorFromRgba(rgba));
  }, [applyColor]);

  // ---- Input handlers for each format ----

  const handleHexChange = (value) => {
    setHexInput(value);
    const v = value.startsWith('#') ? value : `#${value}`;
    if (isValidHex(v)) {
      const rgba = hexToRgba(normalizeHex(v));
      if (rgba) updateFromRgba({ ...rgba, a: opacity / 100 });
    }
  };

  const handleNativePicker = (value) => {
    const rgba = hexToRgba(value);
    if (rgba) updateFromRgba({ ...rgba, a: opacity / 100 });
  };

  const handleRgbChange = (key, value) => {
    const n = clampNum(value, 0, 255);
    updateFromRgba({ ...color.rgb, [key]: n, a: opacity / 100 });
  };

  const handleHslChange = (key, value) => {
    const max = key === 'h' ? 360 : 100;
    const n = clampNum(value, 0, max);
    const rgb = hslToRgb({ ...color.hsl, [key]: n });
    updateFromRgba({ ...rgb, a: opacity / 100 });
  };

  const handleHsvChange = (key, value) => {
    const max = key === 'h' ? 360 : 100;
    const n = clampNum(value, 0, max);
    const rgb = hsvToRgb({ ...color.hsv, [key]: n });
    updateFromRgba({ ...rgb, a: opacity / 100 });
  };

  const handleCmykChange = (key, value) => {
    const n = clampNum(value, 0, 100);
    const rgb = cmykToRgb({ ...color.cmyk, [key]: n });
    updateFromRgba({ ...rgb, a: opacity / 100 });
  };

  const handleHwbChange = (key, value) => {
    const max = key === 'h' ? 360 : 100;
    const n = clampNum(value, 0, max);
    const rgb = hwbToRgb({ ...color.hwb, [key]: n });
    updateFromRgba({ ...rgb, a: opacity / 100 });
  };

  const handleOpacityChange = (value) => {
    const n = clampNum(value, 0, 100);
    setOpacity(n);
    updateFromRgba({ ...color.rgb, a: n / 100 });
  };

  const handleEyeDropper = async () => {
    if (!eyeDropperSupported) return;
    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      const rgba = hexToRgba(result.sRGBHex);
      if (rgba) updateFromRgba({ ...rgba, a: 1 });
    } catch {
      // user cancelled the picker — no-op
    }
  };

  const handleRandom = () => {
    applyColor(randomColor());
  };

  const toggleFavorite = () => {
    setFavorites((prev) => {
      const exists = prev.some((c) => c.toLowerCase() === color.hex.toLowerCase());
      const updated = exists
        ? prev.filter((c) => c.toLowerCase() !== color.hex.toLowerCase())
        : [color.hex, ...prev].slice(0, 50);
      writeStorage(FAVORITES_KEY, updated);
      return updated;
    });
  };

  const isFavorite = favorites.some((c) => c.toLowerCase() === color.hex.toLowerCase());

  // ---- Derived data ----

  const palettes = useMemo(() => ({
    complementary: getComplementary(color.rgb),
    analogous: getAnalogous(color.rgb),
    triadic: getTriadic(color.rgb),
    splitComplementary: getSplitComplementary(color.rgb),
    tetradic: getTetradic(color.rgb),
    monochromatic: getMonochromatic(color.rgb),
  }), [color.rgb]);

  const shadesTints = useMemo(() => getShadesAndTints(color.rgb), [color.rgb]);

  const tailwindMatch = useMemo(() => buildTailwindClasses(color.hex), [color.hex]);

  const exportData = () => ({
    hex: color.hex,
    hexa: color.hexa,
    rgb: color.strings.rgb,
    rgba: color.strings.rgba,
    hsl: color.strings.hsl,
    hsla: color.strings.hsla,
    hsv: color.strings.hsv,
    cmyk: color.strings.cmyk,
    hwb: color.strings.hwb,
  });

  const downloadFile = (filename, content, type = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    trackUsageOnce();
  };

  const exportJson = () => downloadFile('color.json', JSON.stringify(exportData(), null, 2), 'application/json');
  const exportTxt = () => downloadFile('color.txt', Object.entries(exportData()).map(([k, v]) => `${k.toUpperCase()}: ${v}`).join('\n'));
  const exportCss = () => downloadFile('color.css', `:root {\n  --color: ${color.hex};\n  --color-rgb: ${color.strings.rgb};\n}\n`, 'text/css');

  const exportPalettePng = () => {
    const swatches = [...shadesTints.shades, shadesTints.original, ...shadesTints.tints];
    const size = 60;
    const canvas = document.createElement('canvas');
    canvas.width = size * swatches.length;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    swatches.forEach((c, i) => {
      ctx.fillStyle = c.hex;
      ctx.fillRect(i * size, 0, size, size);
    });
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'palette.png';
      a.click();
      URL.revokeObjectURL(url);
    });
    trackUsageOnce();
  };

  return (
    <div className="space-y-6">
      {/* Preview & main picker */}
      <div className="flex flex-col lg:flex-row gap-5">
        <div
          className="w-full lg:w-56 h-40 lg:h-auto rounded-2xl border border-border flex-shrink-0 relative overflow-hidden"
          style={{
            backgroundImage:
              'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
          }}
        >
          <div className="absolute inset-0" style={{ backgroundColor: color.strings.rgba }} />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="color"
              value={color.hex}
              onChange={(e) => handleNativePicker(e.target.value)}
              className="w-12 h-12 rounded-xl border border-border cursor-pointer bg-transparent"
              aria-label="Native color picker"
            />
            <input
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              className="flex-1 min-w-[140px] px-4 h-12 rounded-xl border border-border bg-background font-mono text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              placeholder="#3B82F6"
              aria-label="HEX input"
            />
            <button
              onClick={toggleFavorite}
              title={isFavorite ? 'Remove favorite' : 'Save favorite'}
              className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-colors ${
                isFavorite ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-500' : 'border-border hover:bg-muted text-muted-foreground'
              }`}
            >
              <Star className={`w-5 h-5 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={handleRandom}
              title="Random Color"
              className="w-12 h-12 flex items-center justify-center rounded-xl border border-border hover:bg-muted text-muted-foreground transition-colors"
            >
              <Shuffle className="w-5 h-5" />
            </button>
          </div>

          {eyeDropperSupported ? (
            <button
              onClick={handleEyeDropper}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border hover:bg-muted text-sm font-medium transition-colors"
            >
              <Pipette className="w-4 h-4" /> Pick Color From Screen
            </button>
          ) : (
            <p className="text-xs text-muted-foreground">
              EyeDropper not supported in this browser — try Chrome or Edge.
            </p>
          )}

          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Opacity</span>
              <span>{opacity}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={opacity}
              onChange={(e) => handleOpacityChange(e.target.value)}
              className="w-full accent-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border pb-px">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${
              tab === t.id
                ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-500'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'converter' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">All Formats</h3>
            <FormatRow label="HEX" value={color.strings.hex} />
            <FormatRow label="HEXA" value={color.strings.hexa} />
            <FormatRow label="RGB" value={color.strings.rgb} />
            <FormatRow label="RGBA" value={color.strings.rgba} />
            <FormatRow label="HSL" value={color.strings.hsl} />
            <FormatRow label="HSLA" value={color.strings.hsla} />
            <FormatRow label="HSV" value={color.strings.hsv} />
            <FormatRow label="CMYK" value={color.strings.cmyk} />
            <FormatRow label="HWB" value={color.strings.hwb} />
          </div>

          <div className="space-y-4">
            <NumericGroup title="RGB" fields={['r', 'g', 'b']} max={255} values={color.rgb} onChange={handleRgbChange} />
            <NumericGroup title="HSL" fields={['h', 's', 'l']} max={[360, 100, 100]} values={color.hsl} onChange={handleHslChange} suffixes={['°', '%', '%']} />
            <NumericGroup title="HSV" fields={['h', 's', 'v']} max={[360, 100, 100]} values={color.hsv} onChange={handleHsvChange} suffixes={['°', '%', '%']} />
            <NumericGroup title="CMYK" fields={['c', 'm', 'y', 'k']} max={100} values={color.cmyk} onChange={handleCmykChange} suffixes="%" />
            <NumericGroup title="HWB" fields={['h', 'w', 'b']} max={[360, 100, 100]} values={color.hwb} onChange={handleHwbChange} suffixes={['°', '%', '%']} />
          </div>
        </div>
      )}

      {tab === 'palette' && (
        <div className="space-y-6">
          <PaletteGroup title="Complementary" colors={palettes.complementary} onPick={applyColor} />
          <PaletteGroup title="Analogous" colors={palettes.analogous} onPick={applyColor} />
          <PaletteGroup title="Triadic" colors={palettes.triadic} onPick={applyColor} />
          <PaletteGroup title="Split Complementary" colors={palettes.splitComplementary} onPick={applyColor} />
          <PaletteGroup title="Tetradic" colors={palettes.tetradic} onPick={applyColor} />
          <PaletteGroup title="Monochromatic" colors={palettes.monochromatic} onPick={applyColor} />
        </div>
      )}

      {tab === 'shades' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Shades & Tints</h3>
            <button onClick={exportPalettePng} className="inline-flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 hover:underline">
              <Download className="w-3.5 h-3.5" /> Export PNG
            </button>
          </div>
          <div className="flex items-center gap-1.5 mb-1">
            <Moon className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Darker shades</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {shadesTints.shades.map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <Swatch color={c} onClick={applyColor} size="sm" />
                <CopyButton value={c.hex} label={c.hex} />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-3 mb-1">
            <span className="text-xs font-semibold">Original</span>
          </div>
          <Swatch color={shadesTints.original} onClick={applyColor} />
          <div className="flex items-center gap-1.5 mt-3 mb-1">
            <Sun className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Lighter tints</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {shadesTints.tints.map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <Swatch color={c} onClick={applyColor} size="sm" />
                <CopyButton value={c.hex} label={c.hex} />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'gradient' && <GradientPanel baseHex={color.hex} onTrack={trackUsageOnce} />}

      {tab === 'css' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">CSS Snippets</h3>
            <CssBlock label="Background" code={`background-color: ${color.hex};`} />
            <CssBlock label="Border" code={`border: 1px solid ${color.hex};`} />
            <CssBlock label="Text Color" code={`color: ${color.hex};`} />
            <CssBlock label="Box Shadow" code={`box-shadow: 0 4px 14px ${color.strings.rgba};`} />
            <CssBlock label="CSS Variable" code={`:root {\n  --primary: ${color.hex};\n}`} />
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Tailwind</h3>
            {tailwindMatch ? (
              <>
                <CssBlock label={`Background (${tailwindMatch.confidence}% match)`} code={tailwindMatch.classes.bg} />
                <CssBlock label={`Text (${tailwindMatch.confidence}% match)`} code={tailwindMatch.classes.text} />
                <CssBlock label={`Border (${tailwindMatch.confidence}% match)`} code={tailwindMatch.classes.border} />
                {!tailwindMatch.exact && (
                  <p className="text-xs text-muted-foreground">
                    No exact Tailwind match — nearest color is <span className="font-mono">{tailwindMatch.name}-{tailwindMatch.shade}</span> ({tailwindMatch.hex}).
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Unable to compute a Tailwind match.</p>
            )}

            <h3 className="text-sm font-semibold pt-2">Export</h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={exportJson} className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted">JSON</button>
              <button onClick={exportCss} className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted">CSS</button>
              <button onClick={exportTxt} className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted">TXT</button>
              <button onClick={exportPalettePng} className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted">PNG Palette</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'a11y' && <AccessibilityPanel color={color} />}

      {/* Popular / Recent / Favorites */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <SwatchStrip title="Popular Colors" colors={POPULAR_COLORS.map((c) => buildColorFromHex(c.hex))} onPick={applyColor} empty="No popular colors." />
        <SwatchStrip title="Recent Colors" colors={recents.map((h) => buildColorFromHex(h)).filter(Boolean)} onPick={applyColor} empty="No recent colors yet." />
        <SwatchStrip title="Favorites" colors={favorites.map((h) => buildColorFromHex(h)).filter(Boolean)} onPick={applyColor} empty="No favorites saved yet." />
      </div>
    </div>
  );
}

function clampNum(value, min, max) {
  const n = Number(value);
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function NumericGroup({ title, fields, max, values, onChange, suffixes }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {fields.map((f, i) => (
          <div key={f}>
            <label className="text-[10px] text-muted-foreground uppercase">{f}{typeof suffixes === 'string' ? suffixes : suffixes?.[i] || ''}</label>
            <input
              type="number"
              value={Math.round(values[f])}
              max={Array.isArray(max) ? max[i] : max}
              min={0}
              onChange={(e) => onChange(f, e.target.value)}
              className="w-full px-2 h-9 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:border-brand-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function CssBlock({ label, code }) {
  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/30 border-b border-border">
        <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
        <CopyButton value={code} label={label} />
      </div>
      <pre className="px-3 py-2 text-xs font-mono whitespace-pre-wrap break-all">{code}</pre>
    </div>
  );
}

function SwatchStrip({ title, colors, onPick, empty }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      {colors.length ? (
        <div className="flex flex-wrap gap-2">
          {colors.map((c, i) => <Swatch key={i} color={c} onClick={onPick} size="sm" />)}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}

function GradientPanel({ baseHex, onTrack }) {
  const [type, setType] = useState('linear');
  const [angle, setAngle] = useState(90);
  const [shape, setShape] = useState('circle');
  const [extraColors, setExtraColors] = useState(['#a855f7', '#ec4899']);
  const [count, setCount] = useState(2);

  const colors = useMemo(() => [baseHex, ...extraColors], [baseHex, extraColors]);

  const stops = useMemo(() => {
    const active = colors.slice(0, count);
    return active.map((color, i) => ({
      color,
      position: active.length === 1 ? 0 : Math.round((i / (active.length - 1)) * 100),
    }));
  }, [colors, count]);

  const css = useMemo(() => `background: ${buildGradientCss({ type, angle, shape, stops })};`, [type, angle, shape, stops]);

  const copyCss = async () => {
    await copyToClipboard(css);
    toast.success('Copied!');
    onTrack?.();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex gap-2">
          {['linear', 'radial', 'conic'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1.5 text-xs rounded-lg border capitalize ${type === t ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:bg-muted'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {type !== 'radial' && (
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Angle</span><span>{angle}°</span>
            </div>
            <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full accent-brand-500" />
          </div>
        )}

        {type === 'radial' && (
          <div className="flex gap-2">
            {['circle', 'ellipse'].map((s) => (
              <button key={s} onClick={() => setShape(s)} className={`px-3 py-1.5 text-xs rounded-lg border capitalize ${shape === s ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:bg-muted'}`}>{s}</button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          {[2, 3].map((n) => (
            <button key={n} onClick={() => setCount(n)} className={`px-3 py-1.5 text-xs rounded-lg border ${count === n ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:bg-muted'}`}>{n} colors</button>
          ))}
        </div>

        <div className="space-y-2">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="color"
                value={colors[i] || '#000000'}
                disabled={i === 0}
                onChange={(e) => setExtraColors((prev) => {
                  const next = [...prev];
                  next[i - 1] = e.target.value;
                  return next;
                })}
                className="w-9 h-9 rounded-lg border border-border bg-transparent cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
              />
              <span className="text-xs font-mono text-muted-foreground">{colors[i]}{i === 0 ? ' (base color)' : ''}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="h-40 rounded-2xl border border-border" style={{ background: buildGradientCss({ type, angle, shape, stops }) }} />
        <CssBlock label="Generated CSS" code={css} />
        <button onClick={copyCss} className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium">
          <Copy className="w-3.5 h-3.5" /> Copy CSS
        </button>
      </div>
    </div>
  );
}

function AccessibilityPanel({ color }) {
  const whiteRatio = contrastRatio(color.rgb, { r: 255, g: 255, b: 255 });
  const blackRatio = contrastRatio(color.rgb, { r: 0, g: 0, b: 0 });
  const lum = relativeLuminance(color.rgb);
  const bright = brightness(color.rgb);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Contrast Checks</h3>
        <ContrastCard label="White text on this color" textColor="#ffffff" bg={color.hex} ratio={whiteRatio} />
        <ContrastCard label="Black text on this color" textColor="#000000" bg={color.hex} ratio={blackRatio} />
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Color Information</h3>
        <FormatRow label="HEX" value={color.hex} />
        <FormatRow label="RGB" value={color.strings.rgb} />
        <FormatRow label="HSL" value={color.strings.hsl} />
        <FormatRow label="HSV" value={color.strings.hsv} />
        <FormatRow label="CMYK" value={color.strings.cmyk} />
        <FormatRow label="Brightness" value={`${bright} / 255`} />
        <FormatRow label="Relative Luminance" value={lum.toFixed(3)} />
        <FormatRow label="Contrast vs White" value={`${whiteRatio}:1`} />
        <FormatRow label="Contrast vs Black" value={`${blackRatio}:1`} />
      </div>
    </div>
  );
}

function ContrastCard({ label, textColor, bg, ratio }) {
  const level = wcagLevel(ratio);
  const levelLarge = wcagLevel(ratio, true);
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="p-4 flex items-center justify-center text-lg font-semibold" style={{ backgroundColor: bg, color: textColor }}>
        Aa Sample Text
      </div>
      <div className="p-3 text-sm space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-mono font-semibold">{ratio}:1</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className={level.aa ? 'text-green-600' : 'text-red-500'}>{level.aa ? '✅' : '❌'} AA</span>
          <span className={level.aaa ? 'text-green-600' : 'text-red-500'}>{level.aaa ? '✅' : '❌'} AAA</span>
          <span className={levelLarge.aa ? 'text-green-600' : 'text-red-500'}>{levelLarge.aa ? '✅' : '❌'} AA Large</span>
        </div>
      </div>
    </div>
  );
}
