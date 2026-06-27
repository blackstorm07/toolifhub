import { buildColorFromRgba, hslToRgb, rgbToHsl } from './converter';

function rotate(rgb, degrees) {
  const hsl = rgbToHsl(rgb);
  return hslToRgb({ ...hsl, h: (hsl.h + degrees + 360) % 360 });
}

function withLightness(rgb, l) {
  const hsl = rgbToHsl(rgb);
  return hslToRgb({ ...hsl, l: Math.min(100, Math.max(0, l)) });
}

export function getComplementary(rgb) {
  return [buildColorFromRgba({ ...rgb, a: 1 }), buildColorFromRgba({ ...rotate(rgb, 180), a: 1 })];
}

export function getAnalogous(rgb) {
  return [-30, 0, 30].map((d) => buildColorFromRgba({ ...rotate(rgb, d), a: 1 }));
}

export function getTriadic(rgb) {
  return [0, 120, 240].map((d) => buildColorFromRgba({ ...rotate(rgb, d), a: 1 }));
}

export function getSplitComplementary(rgb) {
  return [0, 150, 210].map((d) => buildColorFromRgba({ ...rotate(rgb, d), a: 1 }));
}

export function getTetradic(rgb) {
  return [0, 90, 180, 270].map((d) => buildColorFromRgba({ ...rotate(rgb, d), a: 1 }));
}

export function getMonochromatic(rgb) {
  const hsl = rgbToHsl(rgb);
  return [20, 35, 50, 65, 80, 95].map((l) =>
    buildColorFromRgba({ ...hslToRgb({ ...hsl, l }), a: 1 })
  );
}

/** 10 darker shades, original, 10 lighter tints — 21 swatches total. */
export function getShadesAndTints(rgb) {
  const hsl = rgbToHsl(rgb);
  const shades = [];
  for (let i = 10; i >= 1; i--) {
    const l = Math.max(0, hsl.l - i * (hsl.l / 11));
    shades.push(buildColorFromRgba({ ...withLightness(rgb, l), a: 1 }));
  }
  const original = buildColorFromRgba({ ...rgb, a: 1 });
  const tints = [];
  for (let i = 1; i <= 10; i++) {
    const l = Math.min(100, hsl.l + i * ((100 - hsl.l) / 11));
    tints.push(buildColorFromRgba({ ...withLightness(rgb, l), a: 1 }));
  }
  return { shades, original, tints };
}

export const POPULAR_COLORS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Teal', hex: '#14b8a6' },
  { name: 'Slate', hex: '#64748b' },
  { name: 'Gray', hex: '#6b7280' },
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#ffffff' },
];
