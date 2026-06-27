export function buildGradientCss({ type, angle, shape, stops }) {
  const colorStops = stops.map((s) => `${s.color} ${s.position}%`).join(', ');
  if (type === 'radial') {
    return `radial-gradient(${shape || 'circle'}, ${colorStops})`;
  }
  if (type === 'conic') {
    return `conic-gradient(from ${angle}deg, ${colorStops})`;
  }
  return `linear-gradient(${angle}deg, ${colorStops})`;
}
