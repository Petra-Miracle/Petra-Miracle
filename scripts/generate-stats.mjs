// Builds a self-hosted GitHub activity dashboard SVG from the GraphQL API.
// Usage: GITHUB_TOKEN=... node scripts/generate-stats.mjs [outDir] [username]
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { C, esc, svgDoc } from "./lib/theme.mjs";

const OUT = process.argv[2] ?? "dist";
const USER = process.argv[3] ?? process.env.GITHUB_REPOSITORY_OWNER ?? "Petra-Miracle";
const TOKEN = process.env.GITHUB_TOKEN;
const EXCLUDED_LANGS = new Set(["Jupyter Notebook", "Batchfile", "PowerShell", "Procfile", "Hack", "Shell", "Dockerfile"]);

if (!TOKEN) throw new Error("GITHUB_TOKEN is required");

const QUERY = `query($login: String!) {
  user(login: $login) {
    followers { totalCount }
    repositories(ownerAffiliations: OWNER, isFork: false, first: 100, privacy: PUBLIC) {
      totalCount
      nodes {
        stargazerCount
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) { edges { size node { name color } } }
      }
    }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

const res = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: { Authorization: `bearer ${TOKEN}`, "Content-Type": "application/json", "User-Agent": "profile-readme-stats" },
  body: JSON.stringify({ query: QUERY, variables: { login: USER } }),
});
const json = await res.json();
if (!res.ok || json.errors) throw new Error(JSON.stringify(json.errors ?? json));
const u = json.data.user;
const cc = u.contributionsCollection;

// ---- derived numbers
const days = cc.contributionCalendar.weeks.flatMap((w) => w.contributionDays);
let longest = 0, run = 0;
for (const d of days) {
  run = d.contributionCount > 0 ? run + 1 : 0;
  longest = Math.max(longest, run);
}
let current = 0;
for (let i = days.length - 1; i >= 0; i--) {
  if (days[i].contributionCount > 0) current++;
  else if (i === days.length - 1) continue; // today not over yet
  else break;
}
const stars = u.repositories.nodes.reduce((s, r) => s + r.stargazerCount, 0);

const langTotals = new Map();
for (const r of u.repositories.nodes)
  for (const { size, node } of r.languages.edges) {
    if (EXCLUDED_LANGS.has(node.name)) continue;
    const prev = langTotals.get(node.name) ?? { size: 0, color: node.color ?? C.muted };
    langTotals.set(node.name, { size: prev.size + size, color: prev.color });
  }
const langSum = [...langTotals.values()].reduce((s, l) => s + l.size, 0) || 1;
const langs = [...langTotals.entries()]
  .map(([name, l]) => ({ name, color: l.color, pct: (l.size / langSum) * 100 }))
  .sort((a, b) => b.pct - a.pct)
  .slice(0, 6);

const weeks = cc.contributionCalendar.weeks.map((w) => ({
  start: w.contributionDays[0].date,
  total: w.contributionDays.reduce((s, d) => s + d.contributionCount, 0),
}));

// ---- render
const W = 1200, H = 520, PAD = 32;
const fmt = (n) => n.toLocaleString("en-US");

const metrics = [
  ["Contributions", fmt(cc.contributionCalendar.totalContributions), "last 12 months", C.indigo2],
  ["Commits", fmt(cc.totalCommitContributions + cc.restrictedContributionsCount), "incl. private", C.cyan],
  ["Pull Requests", fmt(cc.totalPullRequestContributions), "last 12 months", "#ec4899"],
  ["Public Repos", fmt(u.repositories.totalCount), `${fmt(stars)} ★ earned`, "#f59e0b"],
  ["Current Streak", `${current}d`, "days in a row", "#10b981"],
  ["Longest Streak", `${longest}d`, "last 12 months", C.violet],
];
const gap = 14, tileW = (W - PAD * 2 - gap * (metrics.length - 1)) / metrics.length, tileY = 86, tileH = 108;
const tiles = metrics
  .map(([label, value, sub, color], i) => {
    const x = PAD + i * (tileW + gap);
    return `<g class="in" style="animation-delay:${(0.1 + i * 0.08).toFixed(2)}s"><g transform="translate(${x.toFixed(1)} ${tileY})">
    <rect width="${tileW.toFixed(1)}" height="${tileH}" rx="16" fill="#ffffff" fill-opacity=".03" stroke="${C.border}"/>
    <rect x="18" y="20" width="22" height="4" rx="2" fill="${color}"/>
    <text x="18" y="62" class="sans" font-size="30" font-weight="800" fill="#f8fafc">${esc(value)}</text>
    <text x="18" y="84" class="sans" font-size="13.5" font-weight="600" fill="#cbd5e1">${esc(label)}</text>
    <text x="18" y="100" class="mono" font-size="11" fill="${C.dim}">${esc(sub)}</text>
  </g></g>`;
  })
  .join("\n  ");

// contribution area chart
const cx0 = PAD, cy0 = 238, cw = 740, chH = 220;
const plotTop = cy0 + 54, plotBottom = cy0 + chH - 30, plotL = cx0 + 22, plotR = cx0 + cw - 22;
const max = Math.max(1, ...weeks.map((w) => w.total));
const pts = weeks.map((w, i) => [
  plotL + (i / (weeks.length - 1)) * (plotR - plotL),
  plotBottom - (w.total / max) * (plotBottom - plotTop),
]);
let line = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
for (let i = 0; i < pts.length - 1; i++) {
  const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
  const c1 = [p1[0] + (p2[0] - p0[0]) / 6, Math.min(plotBottom, p1[1] + (p2[1] - p0[1]) / 6)];
  const c2 = [p2[0] - (p3[0] - p1[0]) / 6, Math.min(plotBottom, p2[1] - (p3[1] - p1[1]) / 6)];
  line += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
}
const area = `${line} L${plotR} ${plotBottom} L${plotL} ${plotBottom} Z`;
const peakIdx = weeks.reduce((b, w, i) => (w.total > weeks[b].total ? i : b), 0);
const [px, py] = pts[peakIdx];
const monthLabels = [];
let lastMonth = "";
weeks.forEach((w, i) => {
  const m = new Date(w.start + "T00:00:00Z").toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  if (m !== lastMonth && i > 0 && i < weeks.length - 2 && i % 1 === 0) {
    if (monthLabels.length === 0 || i - monthLabels.at(-1).i >= 3) monthLabels.push({ i, m });
  }
  lastMonth = m;
});
const gridLines = [0.25, 0.5, 0.75, 1]
  .map((f) => `<path d="M${plotL} ${(plotBottom - f * (plotBottom - plotTop)).toFixed(1)}H${plotR}" stroke="#ffffff" stroke-opacity=".05" stroke-dasharray="4 6"/>`)
  .join("");

// languages
const lx = cx0 + cw + 20, lw = W - PAD - lx;
let acc = 0;
const stack = langs
  .map((l) => {
    const x = lx + 24 + (acc / 100) * (lw - 48);
    const w = (l.pct / 100) * (lw - 48);
    acc += l.pct;
    return `<rect x="${x.toFixed(1)}" y="${cy0 + 62}" width="${Math.max(w - 2, 1).toFixed(1)}" height="10" fill="${l.color}"/>`;
  })
  .join("");
const langRows = langs
  .map((l, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = lx + 24 + col * ((lw - 48) / 2), y = cy0 + 106 + row * 34;
    return `<g class="in" style="animation-delay:${(0.5 + i * 0.07).toFixed(2)}s">
      <circle cx="${x + 5}" cy="${y - 4}" r="5" fill="${l.color}"/>
      <text x="${x + 18}" y="${y}" class="sans" font-size="14" fill="#e2e8f0">${esc(l.name)}</text>
      <text x="${x + 18}" y="${y + 16}" class="mono" font-size="11.5" fill="${C.dim}">${l.pct.toFixed(1)}%</text>
    </g>`;
  })
  .join("");

const updated = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

const svg = svgDoc(W, H, {
  title: `GitHub activity for ${USER}`,
  style: `
    .in { opacity: 0; animation: up .7s cubic-bezier(.2,.7,.2,1) forwards; }
    .line { stroke-dasharray: 3000; stroke-dashoffset: 3000; animation: draw 2.2s ease-out .3s forwards; }
    .area { opacity: 0; animation: fade 1.2s ease-out 1s forwards; }
    .bar { transform-box: fill-box; transform-origin: left; transform: scaleX(0); animation: grow 1.2s cubic-bezier(.2,.7,.2,1) .4s forwards; }
    .ping { transform-box: fill-box; transform-origin: center; animation: ping 2s ease-out 2.4s infinite; opacity: 0; }
    @keyframes up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
    @keyframes draw { to { stroke-dashoffset: 0; } }
    @keyframes fade { to { opacity: 1; } }
    @keyframes grow { to { transform: scaleX(1); } }
    @keyframes ping { 0% { transform: scale(1); opacity: .9; } 100% { transform: scale(3.2); opacity: 0; } }
  `,
  defs: `
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.card0}"/><stop offset="1" stop-color="${C.bg0}"/></linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.indigo}" stop-opacity=".7"/><stop offset=".5" stop-color="${C.border}"/><stop offset="1" stop-color="${C.cyan}" stop-opacity=".6"/></linearGradient>
    <linearGradient id="stroke" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.indigo2}"/><stop offset="1" stop-color="${C.cyan}"/></linearGradient>
    <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.indigo}" stop-opacity=".45"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>
    <clipPath id="barClip"><rect x="${lx + 24}" y="${cy0 + 62}" width="${lw - 48}" height="10" rx="5"/></clipPath>
    <filter id="blur" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="60"/></filter>
    <clipPath id="clip"><rect width="${W}" height="${H}" rx="24"/></clipPath>`,
  body: `
  <g clip-path="url(#clip)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <circle cx="80" cy="40" r="140" fill="${C.indigo}" fill-opacity=".25" filter="url(#blur)"/>
    <circle cx="1140" cy="500" r="160" fill="${C.cyan2}" fill-opacity=".18" filter="url(#blur)"/>
  </g>
  <rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="23.25" stroke="url(#edge)" stroke-width="1.5"/>

  <text x="${PAD}" y="54" class="sans" font-size="22" font-weight="800" fill="#f8fafc">GitHub Activity</text>
  <text x="${W - PAD}" y="54" text-anchor="end" class="mono" font-size="12" fill="${C.dim}">@${esc(USER)} · updated ${esc(updated)}</text>

  ${tiles}

  <g class="in" style="animation-delay:.3s">
    <rect x="${cx0}" y="${cy0}" width="${cw}" height="${chH + 30}" rx="16" fill="#ffffff" fill-opacity=".03" stroke="${C.border}"/>
    <text x="${cx0 + 22}" y="${cy0 + 34}" class="sans" font-size="15" font-weight="700" fill="#e2e8f0">Weekly contributions</text>
    <text x="${cx0 + cw - 22}" y="${cy0 + 34}" text-anchor="end" class="mono" font-size="11.5" fill="${C.dim}">peak ${weeks[peakIdx].total} / week</text>
  </g>
  ${gridLines}
  <path class="area" d="${area}" fill="url(#fill)"/>
  <path class="line" d="${line}" stroke="url(#stroke)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle class="ping" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="5" fill="${C.cyan}"/>
  <circle class="area" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="5" fill="${C.cyan}" stroke="#0b1124" stroke-width="2"/>
  ${monthLabels.map(({ i, m }) => `<text x="${pts[i][0].toFixed(1)}" y="${cy0 + chH + 10}" text-anchor="middle" class="mono" font-size="11" fill="${C.dim}">${m}</text>`).join("")}

  <g class="in" style="animation-delay:.4s">
    <rect x="${lx}" y="${cy0}" width="${lw}" height="${chH + 30}" rx="16" fill="#ffffff" fill-opacity=".03" stroke="${C.border}"/>
    <text x="${lx + 24}" y="${cy0 + 34}" class="sans" font-size="15" font-weight="700" fill="#e2e8f0">Top languages</text>
  </g>
  <rect x="${lx + 24}" y="${cy0 + 62}" width="${lw - 48}" height="10" rx="5" fill="#ffffff" fill-opacity=".06"/>
  <g clip-path="url(#barClip)"><g class="bar">${stack}</g></g>
  ${langRows}
`,
});

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "stats.svg"), svg);
console.log(`wrote ${join(OUT, "stats.svg")} (${langs.length} languages, ${weeks.length} weeks)`);
