// Generates the static SVG assets used by README.md.
// Edit the data below, then run:  node scripts/build-assets.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { C, esc, textWidth, wrap, svgDoc, chip, iconTile } from "./lib/theme.mjs";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "assets");

const TECH = {
  Flutter: "#54c5f8",
  Express: "#e2e8f0",
  Pusher: "#a78bfa",
  React: "#61dafb",
  Vite: "#bd34fe",
  Prisma: "#5a67d8",
  TypeScript: "#3178c6",
  SSE: "#0ea5e9",
  "Next.js": "#f8fafc",
  PostgreSQL: "#4169e1",
  Tailwind: "#38bdf8",
  MySQL: "#f29111",
};

const PROJECTS = [
  {
    slug: "love-tracking",
    icon: "heart",
    name: "Love Tracking",
    tag: "MOBILE · REAL-TIME",
    accent: "#ec4899",
    desc: "Couple app for real-time location sharing, battery & network status — private, fast, and battery-friendly.",
    highlight: "📍 Live location  ·  🔋 Battery-aware",
    tech: ["Flutter", "Express", "Pusher"],
  },
  {
    slug: "cerdas-transaksi",
    icon: "card",
    name: "Cerdas Transaksi",
    tag: "EDU-TECH · FINTECH",
    accent: "#22d3ee",
    desc: "QRIS & Rupiah (CBP) education platform for MSMEs — interactive learning plus transaction literacy.",
    highlight: "🏆 Bank Indonesia Innovation 2026",
    tech: ["React", "Vite", "Prisma"],
  },
  {
    slug: "animal-selfcare",
    icon: "paw",
    name: "Animal SelfCare",
    tag: "CIVIC-TECH · REPORTING",
    accent: "#f59e0b",
    desc: "Report & rescue platform for stray animals — live reports, status tracking, and a responder workflow.",
    highlight: "⚡ REST + Server-Sent Events",
    tech: ["TypeScript", "React", "SSE"],
  },
  {
    slug: "pangkaskaka",
    icon: "scissors",
    name: "PangkasKAKA",
    tag: "BOOKING · DASHBOARD",
    accent: "#818cf8",
    desc: "Online barbershop booking with an admin dashboard — slots, queue, services & revenue overview.",
    highlight: "📅 End-to-end booking system",
    tech: ["Next.js", "Express", "PostgreSQL"],
  },
  {
    slug: "petra-portfolio",
    icon: "globe",
    name: "Petra Portfolio",
    tag: "PORTFOLIO · CMS",
    accent: "#10b981",
    desc: "Personal portfolio with an admin panel to manage projects & tech — blazing fast and SEO-ready.",
    highlight: "🚀 Live in production",
    tech: ["Next.js", "Tailwind", "Express"],
  },
  {
    slug: "gmmi",
    icon: "church",
    name: "GMMI Web System",
    tag: "ORGANIZATION SYSTEM",
    accent: "#a78bfa",
    desc: "Church management information system — members, services, activities & announcements in one place.",
    highlight: "👥 Member management",
    tech: ["React", "Express", "MySQL"],
  },
];

const SERVICES = [
  { icon: "globe", title: "Full-Stack Web", accent: C.indigo2, lines: ["Next.js · React · Express", "SEO-ready sites, dashboards,", "auth & payment-ready flows"] },
  { icon: "phone", title: "Mobile Apps", accent: "#ec4899", lines: ["Flutter · REST · Push", "Location, battery & network", "aware real-time features"] },
  { icon: "zap", title: "Real-time Backend", accent: C.cyan, lines: ["Express · Prisma · Postgres", "Pusher / SSE, clean REST,", "scalable architecture"] },
  { icon: "chart", title: "Data & Observability", accent: "#f59e0b", lines: ["MLOps · PostGIS", "Prometheus + Grafana,", "maps & monitoring"] },
];

const SECTIONS = [
  ["about", "01", "About Me"],
  ["services", "02", "What I Do"],
  ["stack", "03", "Tech Stack"],
  ["projects", "04", "Featured Projects"],
  ["activity", "05", "GitHub Activity"],
  ["connect", "06", "Let's Connect"],
];

// ---------------------------------------------------------------- header
function header() {
  const W = 1200, H = 420;
  const code = [
    [["kw", "const "], ["var", "petra"], ["p", " = {"]],
    [["p", "  role: "], ["str", '"Full-Stack Developer"'], ["p", ","]],
    [["p", "  stack: ["], ["str", '"React"'], ["p", ", "], ["str", '"Next.js"'], ["p", ", "], ["str", '"Flutter"'], ["p", "],"]],
    [["p", "  backend: ["], ["str", '"Express"'], ["p", ", "], ["str", '"Prisma"'], ["p", "],"]],
    [["p", "  exploring: ["], ["str", '"MLOps"'], ["p", ", "], ["str", '"PostGIS"'], ["p", "],"]],
    [["p", "  openToWork: "], ["kw", "true"], ["p", ","]],
    [["p", "};"]],
    [],
    [["cm", "// Ship fast, keep it clean,"]],
    [["cm", "// build what people actually use."]],
  ];
  const cx = 668, cy = 78, cw = 476, ch = 270;
  const codeLines = code
    .map((tokens, i) => {
      const spans = tokens.map(([cls, t]) => `<tspan class="${cls}">${esc(t)}</tspan>`).join("");
      return `<text x="${cx + 26}" y="${cy + 78 + i * 20}" class="mono ln" xml:space="preserve" font-size="13.5" style="animation-delay:${(0.9 + i * 0.12).toFixed(2)}s">${spans}</text>`;
    })
    .join("\n    ");
  const lastY = cy + 78 + (code.length - 1) * 20;
  const lastW = textWidth(code.at(-1)[0][1], 13.5, true);

  const tags = [["Web", C.indigo2], ["Mobile", "#ec4899"], ["Real-time", C.cyan], ["MLOps", "#f59e0b"]];
  let tx = 64;
  const tagSvg = tags
    .map(([t, c]) => {
      const { svg, width } = chip(tx, 0, t, c, { size: 13, h: 30 });
      tx += width + 10;
      return svg;
    })
    .join("");

  return svgDoc(W, H, {
    title: "Petra Miracle — Full-Stack Developer, Web & Mobile",
    style: `
      .ln { opacity: 0; animation: up .5s ease-out forwards; }
      .in { opacity: 0; animation: up .8s cubic-bezier(.2,.7,.2,1) forwards; }
      .kw { fill: #c084fc; } .var { fill: #7dd3fc; } .p { fill: #cbd5e1; } .str { fill: #86efac; } .cm { fill: #64748b; font-style: italic; }
      .orb1 { animation: drift1 14s ease-in-out infinite; }
      .orb2 { animation: drift2 18s ease-in-out infinite; }
      .orb3 { animation: drift1 22s ease-in-out infinite reverse; }
      .pulse { transform-box: fill-box; transform-origin: center; animation: pulse 2s ease-out infinite; }
      .caret { animation: blink 1s steps(1) infinite; }
      .shine { animation: shine 6s ease-in-out infinite; }
      .win { animation: float 7s ease-in-out infinite; }
      @keyframes up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
      @keyframes drift1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(60px,30px); } }
      @keyframes drift2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-70px,-25px); } }
      @keyframes pulse { 0% { transform: scale(1); opacity: .8; } 100% { transform: scale(3); opacity: 0; } }
      @keyframes blink { 50% { opacity: 0; } }
      @keyframes shine { 0%,100% { opacity: .35; } 50% { opacity: .9; } }
      @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
    `,
    defs: `
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${C.bg0}"/><stop offset=".55" stop-color="${C.bg1}"/><stop offset="1" stop-color="#071526"/>
      </linearGradient>
      <linearGradient id="name" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#c7d2fe"/><stop offset="1" stop-color="#67e8f9"/>
      </linearGradient>
      <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${C.indigo}" stop-opacity=".9"/><stop offset=".5" stop-color="${C.indigo}" stop-opacity=".1"/><stop offset="1" stop-color="${C.cyan}" stop-opacity=".8"/>
      </linearGradient>
      <linearGradient id="winEdge" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffffff" stop-opacity=".22"/><stop offset="1" stop-color="#ffffff" stop-opacity=".04"/>
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M40 0H0V40" stroke="#94a3b8" stroke-opacity=".08"/>
      </pattern>
      <radialGradient id="gridFade" cx=".5" cy=".4" r=".7">
        <stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
      <mask id="gridMask"><rect width="${W}" height="${H}" fill="url(#gridFade)"/></mask>
      <filter id="blur" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="70"/></filter>
      <clipPath id="clip"><rect width="${W}" height="${H}" rx="28"/></clipPath>
    `,
    body: `
  <g clip-path="url(#clip)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <g filter="url(#blur)">
      <circle class="orb1" cx="220" cy="80" r="170" fill="${C.indigo}" fill-opacity=".45"/>
      <circle class="orb2" cx="1020" cy="360" r="190" fill="${C.cyan2}" fill-opacity=".32"/>
      <circle class="orb3" cx="700" cy="40" r="120" fill="#a855f7" fill-opacity=".25"/>
    </g>
    <rect width="${W}" height="${H}" fill="url(#grid)" mask="url(#gridMask)"/>
  </g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="27.5" stroke="url(#edge)" class="shine"/>

  <g class="in" style="animation-delay:.1s">
    <rect x="64" y="70" width="268" height="34" rx="17" fill="#10b981" fill-opacity=".1" stroke="#10b981" stroke-opacity=".45"/>
    <circle class="pulse" cx="84" cy="87" r="5" fill="#34d399"/>
    <circle cx="84" cy="87" r="5" fill="#34d399"/>
    <text x="98" y="92" class="sans" font-size="14" font-weight="600" fill="#a7f3d0">Available for freelance &amp; collab</text>
  </g>
  <text x="64" y="156" class="sans in" font-size="24" fill="${C.muted}" style="animation-delay:.25s">Hi there 👋, I'm</text>
  <text x="60" y="230" class="sans in" font-size="72" font-weight="800" letter-spacing="-2" fill="url(#name)" style="animation-delay:.4s">Petra Miracle</text>
  <text x="64" y="276" class="sans in" font-size="24" fill="#cbd5e1" style="animation-delay:.55s">Full-Stack Developer <tspan fill="${C.indigo2}">·</tspan> Web &amp; Mobile</text>
  <g class="in" style="animation-delay:.7s"><g transform="translate(0 312)">${tagSvg}</g></g>

  <g class="in" style="animation-delay:.5s"><g class="win">
    <rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="18" fill="#0b1124" fill-opacity=".78" stroke="url(#winEdge)"/>
    <path d="M${cx} ${cy + 46}H${cx + cw}" stroke="#ffffff" stroke-opacity=".07"/>
    <circle cx="${cx + 24}" cy="${cy + 23}" r="6" fill="#ff5f57"/>
    <circle cx="${cx + 44}" cy="${cy + 23}" r="6" fill="#febc2e"/>
    <circle cx="${cx + 64}" cy="${cy + 23}" r="6" fill="#28c840"/>
    <text x="${cx + cw / 2}" y="${cy + 28}" text-anchor="middle" class="mono" font-size="12" fill="${C.dim}">petra.ts</text>
    ${codeLines}
    <rect class="caret" x="${cx + 28 + lastW}" y="${lastY - 13}" width="8" height="16" rx="1.5" fill="${C.cyan}"/>
  </g></g>
`,
  });
}

// ---------------------------------------------------------------- section titles
function sectionTitle(num, title) {
  const W = 1200, H = 72;
  const tw = textWidth(title, 34) + 4;
  const lineX = 64 + 58 + tw + 24;
  return svgDoc(W, H, {
    title,
    style: `.ln { stroke-dasharray: 1200; stroke-dashoffset: 1200; animation: draw 1.6s ease-out .2s forwards; }
      @keyframes draw { to { stroke-dashoffset: 0; } }`,
    defs: `
      <linearGradient id="t" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.indigo}"/><stop offset="1" stop-color="#0891b2"/></linearGradient>
      <linearGradient id="l" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0891b2" stop-opacity=".7"/><stop offset="1" stop-color="${C.indigo}" stop-opacity="0"/></linearGradient>`,
    body: `
  <rect x="0" y="16" width="48" height="40" rx="12" fill="${C.indigo}" fill-opacity=".12" stroke="${C.indigo}" stroke-opacity=".5"/>
  <text x="24" y="42" text-anchor="middle" class="mono" font-size="16" font-weight="700" fill="${C.indigo}">${num}</text>
  <text x="64" y="48" class="sans" font-size="34" font-weight="800" letter-spacing="-.5" fill="url(#t)">${esc(title)}</text>
  <path class="ln" d="M${lineX - 58} 37H${W}" stroke="url(#l)" stroke-width="2" stroke-linecap="round"/>
`,
  });
}

// ---------------------------------------------------------------- services
function services() {
  const W = 1200, H = 236, gap = 16, cw = (W - gap * 3) / 4;
  const cards = SERVICES.map((s, i) => {
    const x = i * (cw + gap);
    const lines = s.lines
      .map((l, j) => `<text x="24" y="${128 + j * 22}" class="${j === 0 ? "mono" : "sans"}" font-size="${j === 0 ? 12.5 : 14.5}" fill="${j === 0 ? s.accent : "#a5b4c8"}">${esc(l)}</text>`)
      .join("\n      ");
    return `<g class="card" style="animation-delay:${(i * 0.12).toFixed(2)}s"><g transform="translate(${x} 0)">
      <rect x=".5" y=".5" width="${cw - 1}" height="${H - 1}" rx="20" fill="url(#cardBg)" stroke="${C.border}"/>
      <clipPath id="cc${i}"><rect width="${cw}" height="${H}" rx="20"/></clipPath>
      <g clip-path="url(#cc${i})"><circle cx="${cw - 20}" cy="10" r="70" fill="${s.accent}" fill-opacity=".22" filter="url(#glow)"/></g>
      ${iconTile(24, 24, s.icon, s.accent)}
      <text x="24" y="104" class="sans" font-size="20" font-weight="700" fill="#f1f5f9">${esc(s.title)}</text>
      ${lines}
      <rect x="24" y="${H - 6}" width="${cw - 48}" height="3" rx="1.5" fill="${s.accent}" fill-opacity=".7"/>
    </g></g>`;
  }).join("\n  ");
  return svgDoc(W, H, {
    title: "What I do: full-stack web, mobile apps, real-time backend, data & observability",
    style: `.card { opacity: 0; animation: up .7s cubic-bezier(.2,.7,.2,1) forwards; }
      @keyframes up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }`,
    defs: `
      <linearGradient id="cardBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.card0}"/><stop offset="1" stop-color="${C.card1}"/></linearGradient>
      <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="30"/></filter>
      <clipPath id="c"><rect width="${W}" height="${H}"/></clipPath>`,
    body: `  <g clip-path="url(#c)">\n  ${cards}\n  </g>`,
  });
}

// ---------------------------------------------------------------- project cards
function projectCard(p) {
  const W = 540, H = 250;
  const desc = wrap(p.desc, W - 52, 15).slice(0, 3);
  let x = 26;
  const chips = p.tech
    .map((t) => {
      const { svg, width } = chip(x, H - 50, t, TECH[t] ?? C.muted);
      x += width + 8;
      return svg;
    })
    .join("");
  return svgDoc(W, H, {
    title: `${p.name} — ${p.desc}`,
    style: `.glow { animation: breathe 5s ease-in-out infinite; }
      .arrow { animation: nudge 2.4s ease-in-out infinite; }
      @keyframes breathe { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
      @keyframes nudge { 0%,100% { transform: translate(0,0); } 50% { transform: translate(2px,-2px); } }`,
    defs: `
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.card0}"/><stop offset="1" stop-color="${C.card1}"/></linearGradient>
      <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.accent}" stop-opacity=".75"/><stop offset=".45" stop-color="${C.border}"/><stop offset="1" stop-color="${C.border}"/></linearGradient>
      <filter id="blur" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="40"/></filter>
      <clipPath id="clip"><rect width="${W}" height="${H}" rx="20"/></clipPath>`,
    body: `
  <g clip-path="url(#clip)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <circle class="glow" cx="${W - 40}" cy="0" r="110" fill="${p.accent}" fill-opacity=".28" filter="url(#blur)"/>
  </g>
  <rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="19.25" stroke="url(#edge)" stroke-width="1.5"/>
  ${iconTile(26, 26, p.icon, p.accent)}
  <text x="94" y="50" class="sans" font-size="22" font-weight="700" fill="#f8fafc">${esc(p.name)}</text>
  <text x="94" y="72" class="mono" font-size="12" letter-spacing=".8" fill="${p.accent}">${esc(p.tag)}</text>
  <g class="arrow"><path d="M${W - 46} 54 L${W - 32} 40 M${W - 43} 40 H${W - 32} V51" stroke="${C.muted}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g>
  ${desc.map((l, i) => `<text x="26" y="${114 + i * 22}" class="sans" font-size="15" fill="#a5b4c8">${esc(l)}</text>`).join("\n  ")}
  <text x="26" y="${H - 66}" class="sans" font-size="13" font-weight="600" fill="#e2e8f0" fill-opacity=".85">${esc(p.highlight)}</text>
  ${chips}
`,
  });
}

// ---------------------------------------------------------------- connect banner + footer
function connect() {
  const W = 1200, H = 210;
  return svgDoc(W, H, {
    title: "Let's build something great together",
    style: `.orb1 { animation: drift 12s ease-in-out infinite; } .orb2 { animation: drift 15s ease-in-out infinite reverse; }
      @keyframes drift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(80px,10px); } }`,
    defs: `
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.bg1}"/><stop offset="1" stop-color="${C.bg0}"/></linearGradient>
      <linearGradient id="t" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#a5f3fc"/></linearGradient>
      <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.indigo}"/><stop offset="1" stop-color="${C.cyan}"/></linearGradient>
      <filter id="blur" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="60"/></filter>
      <clipPath id="clip"><rect width="${W}" height="${H}" rx="24"/></clipPath>`,
    body: `
  <g clip-path="url(#clip)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <g filter="url(#blur)">
      <circle class="orb1" cx="200" cy="200" r="150" fill="${C.indigo}" fill-opacity=".5"/>
      <circle class="orb2" cx="1000" cy="0" r="150" fill="${C.cyan2}" fill-opacity=".4"/>
    </g>
  </g>
  <rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="23.25" stroke="url(#edge)" stroke-opacity=".6" stroke-width="1.5"/>
  <text x="${W / 2}" y="92" text-anchor="middle" class="sans" font-size="40" font-weight="800" letter-spacing="-1" fill="url(#t)">Have an idea? Let's build it together.</text>
  <text x="${W / 2}" y="134" text-anchor="middle" class="sans" font-size="19" fill="#cbd5e1">Open for freelance projects, collaborations &amp; full-time opportunities.</text>
  <text x="${W / 2}" y="172" text-anchor="middle" class="mono" font-size="14" fill="${C.cyan}">→ reach out through any of the links below</text>
`,
  });
}

function footer() {
  const W = 1200, H = 120;
  const wave = (amp, y0, phase) => {
    let d = `M-80 ${H}V${y0}`;
    for (let x = -80; x <= W + 80; x += 20) d += `L${x} ${(y0 + Math.sin((x / W) * Math.PI * 2 + phase) * amp).toFixed(1)}`;
    return `${d}V${H}Z`;
  };
  return svgDoc(W, H, {
    title: "Footer",
    style: `.w1 { animation: sway 8s ease-in-out infinite; } .w2 { animation: sway 11s ease-in-out infinite reverse; }
      @keyframes sway { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-40px); } }`,
    defs: `<linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.cyan2}"/><stop offset=".5" stop-color="${C.indigo}"/><stop offset="1" stop-color="#0f172a"/></linearGradient>`,
    body: `
  <g>
    <path class="w2" d="${wave(16, 56, 1.2)}" fill="url(#g)" fill-opacity=".35"/>
    <path class="w1" d="${wave(12, 72, 0)}" fill="url(#g)" fill-opacity=".85"/>
  </g>
`,
  });
}

// ---------------------------------------------------------------- write
function write(name, content) {
  const file = join(OUT, name);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
  console.log("wrote", name);
}

write("header.svg", header());
for (const [slug, num, title] of SECTIONS) write(`titles/${slug}.svg`, sectionTitle(num, title));
write("services.svg", services());
for (const p of PROJECTS) write(`projects/${p.slug}.svg`, projectCard(p));
write("connect.svg", connect());
write("footer.svg", footer());
