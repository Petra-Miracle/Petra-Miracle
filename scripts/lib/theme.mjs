// Shared palette + SVG helpers for the profile README assets.

export const C = {
  bg0: "#070b18",
  bg1: "#0d1330",
  card0: "#111830",
  card1: "#0a0f22",
  border: "#1f2a4d",
  indigo: "#6366f1",
  indigo2: "#818cf8",
  violet: "#a78bfa",
  cyan: "#22d3ee",
  cyan2: "#06b6d4",
  text: "#e2e8f0",
  muted: "#94a3b8",
  dim: "#64748b",
};

export const FONTS = `
  .sans { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Inter, Ubuntu, 'Helvetica Neue', Arial, sans-serif, 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji'; }
  .emoji { font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif; }
  .mono { font-family: 'JetBrains Mono', 'SF Mono', 'Cascadia Code', Consolas, Menlo, 'Liberation Mono', monospace; }
`;

export const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Rough glyph-width estimate (no font metrics available in SVG-as-image).
export function textWidth(str, size, mono = false) {
  if (mono) return [...str].length * size * 0.6;
  let w = 0;
  for (const ch of str) {
    if (/[ilj.,'|!:;]/.test(ch)) w += 0.28;
    else if (ch === " ") w += 0.28;
    else if (/[mwMW]/.test(ch)) w += 0.86;
    else if (/[A-Z]/.test(ch)) w += 0.66;
    else if (/[0-9]/.test(ch)) w += 0.56;
    else if (ch.codePointAt(0) > 0x2000) w += 1.1;
    else w += 0.53;
  }
  return w * size;
}

export function wrap(text, maxWidth, size) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (textWidth(next, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export function svgDoc(w, h, { title, style = "", defs = "", body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img" aria-label="${esc(title)}">
  <title>${esc(title)}</title>
  <style>${FONTS}${style}</style>
  <defs>${defs}</defs>
${body}
</svg>
`;
}

// Pill-shaped tag with a colored dot. Returns { svg, width }.
export function chip(x, y, label, color, { size = 12, h = 26 } = {}) {
  const tw = textWidth(label, size, true);
  const width = Math.round(tw + 34);
  const svg = `<g transform="translate(${x} ${y})">
    <rect width="${width}" height="${h}" rx="${h / 2}" fill="#ffffff" fill-opacity="0.04" stroke="${C.border}"/>
    <circle cx="14" cy="${h / 2}" r="4" fill="${color}"/>
    <text x="24" y="${h / 2 + size * 0.36}" class="mono" font-size="${size}" fill="#cbd5e1">${esc(label)}</text>
  </g>`;
  return { svg, width };
}

// 24x24 line icons (Lucide-style) — emoji are unreliable inside SVG images.
const ICONS = {
  heart: `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>`,
  card: `<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>`,
  paw: `<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>`,
  scissors: `<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/>`,
  globe: `<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>`,
  church: `<path d="M12 2v4M10 4h4M18 22V10l-6-4-6 4v12M4 22h16M14 22v-4a2 2 0 0 0-4 0v4"/>`,
  phone: `<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>`,
  zap: `<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>`,
  chart: `<path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3"/>`,
};

// Rounded icon tile at (x, y), 52px square.
export function iconTile(x, y, name, color) {
  return `<rect x="${x}" y="${y}" width="52" height="52" rx="14" fill="${color}" fill-opacity=".14" stroke="${color}" stroke-opacity=".5"/>
  <g transform="translate(${x + 13} ${y + 13}) scale(1.0833)" stroke="${color}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" fill="none">${ICONS[name]}</g>`;
}
