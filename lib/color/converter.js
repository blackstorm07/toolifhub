/**
 * Pure color-space conversion utilities. All functions accept/return plain
 * numbers or strings — no external dependencies, fully client-side safe.
 */

export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function round(n, d = 0) {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}

// ---------- HEX ----------

export function isValidHex(hex) {
  return /^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(hex);
}

export function normalizeHex(hex) {
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length === 4) h = h.split('').map((c) => c + c).join('');
  return `#${h.toLowerCase()}`;
}

export function hexToRgba(hex) {
  if (!isValidHex(hex)) return null;
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length === 4) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = h.length === 8 ? round(parseInt(h.slice(6, 8), 16) / 255, 2) : 1;
  return { r, g, b, a };
}

export function rgbaToHex({ r, g, b, a = 1 }, includeAlpha = false) {
  const toHex = (n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  const base = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  if (includeAlpha) {
    const alphaHex = clamp(Math.round(a * 255), 0, 255).toString(16).padStart(2, '0');
    return `${base}${alphaHex}`;
  }
  return base;
}

// ---------- RGB <-> HSL ----------

export function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h: round(h), s: round(s * 100), l: round(l * 100) };
}

export function hslToRgb({ h, s, l }) {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r1 = 0, g1 = 0, b1 = 0;
  if (h < 60) [r1, g1, b1] = [c, x, 0];
  else if (h < 120) [r1, g1, b1] = [x, c, 0];
  else if (h < 180) [r1, g1, b1] = [0, c, x];
  else if (h < 240) [r1, g1, b1] = [0, x, c];
  else if (h < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  return {
    r: round((r1 + m) * 255),
    g: round((g1 + m) * 255),
    b: round((b1 + m) * 255),
  };
}

// ---------- RGB <-> HSV ----------

export function rgbToHsv({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return { h: round(h), s: round(s * 100), v: round(v * 100) };
}

export function hsvToRgb({ h, s, v }) {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 100) / 100;
  v = clamp(v, 0, 100) / 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r1 = 0, g1 = 0, b1 = 0;
  if (h < 60) [r1, g1, b1] = [c, x, 0];
  else if (h < 120) [r1, g1, b1] = [x, c, 0];
  else if (h < 180) [r1, g1, b1] = [0, c, x];
  else if (h < 240) [r1, g1, b1] = [0, x, c];
  else if (h < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  return {
    r: round((r1 + m) * 255),
    g: round((g1 + m) * 255),
    b: round((b1 + m) * 255),
  };
}

// ---------- RGB <-> CMYK ----------

export function rgbToCmyk({ r, g, b }) {
  const r1 = r / 255, g1 = g / 255, b1 = b / 255;
  const k = 1 - Math.max(r1, g1, b1);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = (1 - r1 - k) / (1 - k);
  const m = (1 - g1 - k) / (1 - k);
  const y = (1 - b1 - k) / (1 - k);
  return { c: round(c * 100), m: round(m * 100), y: round(y * 100), k: round(k * 100) };
}

export function cmykToRgb({ c, m, y, k }) {
  c = clamp(c, 0, 100) / 100;
  m = clamp(m, 0, 100) / 100;
  y = clamp(y, 0, 100) / 100;
  k = clamp(k, 0, 100) / 100;
  const r = 255 * (1 - c) * (1 - k);
  const g = 255 * (1 - m) * (1 - k);
  const b = 255 * (1 - y) * (1 - k);
  return { r: round(r), g: round(g), b: round(b) };
}

// ---------- RGB <-> HWB ----------

export function rgbToHwb(rgb) {
  const { h } = rgbToHsv(rgb);
  const { r, g, b } = rgb;
  const w = Math.min(r, g, b) / 255;
  const blk = 1 - Math.max(r, g, b) / 255;
  return { h: round(h), w: round(w * 100), b: round(blk * 100) };
}

export function hwbToRgb({ h, w, b }) {
  w = clamp(w, 0, 100) / 100;
  b = clamp(b, 0, 100) / 100;
  if (w + b >= 1) {
    const gray = Math.round((w / (w + b)) * 255);
    return { r: gray, g: gray, b: gray };
  }
  const rgb = hsvToRgb({ h, s: 100, v: 100 });
  const factor = 1 - w - b;
  return {
    r: round(rgb.r * factor + w * 255),
    g: round(rgb.g * factor + w * 255),
    b: round(rgb.b * factor + w * 255),
  };
}

// ---------- Formatting helpers ----------

export function formatRgb({ r, g, b }) {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

export function formatRgba({ r, g, b, a = 1 }) {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${round(a, 2)})`;
}

export function formatHsl({ h, s, l }) {
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

export function formatHsla({ h, s, l }, a = 1) {
  return `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${round(a, 2)})`;
}

export function formatHsv({ h, s, v }) {
  return `${Math.round(h)}°, ${Math.round(s)}%, ${Math.round(v)}%`;
}

export function formatCmyk({ c, m, y, k }) {
  return `${Math.round(c)}%, ${Math.round(m)}%, ${Math.round(y)}%, ${Math.round(k)}%`;
}

export function formatHwb({ h, w, b }) {
  return `${Math.round(h)}°, ${Math.round(w)}%, ${Math.round(b)}%`;
}

/**
 * Build a complete set of synchronized color formats from an RGBA source.
 * This is the single source of truth all UI state derives from.
 */
export function buildColorFromRgba(rgba) {
  const rgb = { r: rgba.r, g: rgba.g, b: rgba.b };
  const a = rgba.a ?? 1;
  const hsl = rgbToHsl(rgb);
  const hsv = rgbToHsv(rgb);
  const cmyk = rgbToCmyk(rgb);
  const hwb = rgbToHwb(rgb);
  const hex = rgbaToHex(rgb, false);
  const hexa = rgbaToHex({ ...rgb, a }, true);
  return {
    rgb,
    rgba: { ...rgb, a },
    hsl,
    hsv,
    cmyk,
    hwb,
    hex,
    hexa,
    a,
    strings: {
      hex,
      hexa,
      rgb: formatRgb(rgb),
      rgba: formatRgba({ ...rgb, a }),
      hsl: formatHsl(hsl),
      hsla: formatHsla(hsl, a),
      hsv: formatHsv(hsv),
      cmyk: formatCmyk(cmyk),
      hwb: formatHwb(hwb),
    },
  };
}

export function buildColorFromHex(hex) {
  const rgba = hexToRgba(hex);
  if (!rgba) return null;
  return buildColorFromRgba(rgba);
}

// ---------- Luminance / Contrast / Brightness ----------

export function relativeLuminance({ r, g, b }) {
  const srgb = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

export function contrastRatio(rgb1, rgb2) {
  const l1 = relativeLuminance(rgb1);
  const l2 = relativeLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return round((lighter + 0.05) / (darker + 0.05), 2);
}

export function brightness({ r, g, b }) {
  return round((r * 299 + g * 587 + b * 114) / 1000);
}

export function wcagLevel(ratio, isLargeText = false) {
  const aa = isLargeText ? 3 : 4.5;
  const aaa = isLargeText ? 4.5 : 7;
  return { aa: ratio >= aa, aaa: ratio >= aaa };
}

export function randomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return buildColorFromRgba({ r, g, b, a: 1 });
}
