/**
 * scripts/tools/ProFigureTemplates.ts
 *
 * Gabarits (templates) réutilisables branchés sur le socle de ProFigureEngine.
 * Chaque gabarit accepte un jeu de données bilingue (arabe/français) et produit
 * un SVG publication-grade respectant les gardes-fous de applyProFigures :
 *   - panneau de fond obligatoire (w > 0.75·vw, h > 0.75·vh) ;
 *   - aucun rect / circle / ellipse / text hors du panneau ;
 *   - ids uniques + références url(#id) résolues ;
 *   - ratio viewBox ≥ 1.2 (800×500 → 1.6) ;
 *   - labels ≥ 11px (lisibilité dans l'iframe HtmlLessonViewer).
 *
 * 4 familles, couvrant les 45 schémas primitifs des 24 leçons :
 *   1. generateCurveChart    — courbes (pH, T°, potentiel, sismique…)
 *   2. generateFlowDiagram   — mécanismes / cycles (glycolyse, Calvin, Anfinsen…)
 *   3. generateLayerStack    — coupes / couches (sphère terrestre, membrane…)
 *   4. generatePanelCompare  — comparaisons 2..4 panneaux (ABO, roches, plis…)
 */

import { ProFigureEngine } from './ProFigureEngine.ts';

export type Anchor = 'start' | 'middle' | 'end';

const VB = { w: 800, h: 500 };
const PANEL = { x: 10, y: 10, w: 780, h: 480 };

/* ------------------------------------------------------------- primitives */

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const r = (n: number): string => String(Math.round(n * 10) / 10);
const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

interface TextOpts {
  size?: number;
  fill?: string;
  anchor?: Anchor;
  bold?: boolean;
  family?: string;
}

const FONT = "'Cairo', 'Segoe UI', Tahoma, sans-serif";

const txt = (x: number, y: number, str: string, o: TextOpts = {}): string =>
  `<text x="${r(x)}" y="${r(y)}" text-anchor="${o.anchor ?? 'middle'}" font-size="${o.size ?? 13}"` +
  `${o.bold ? ' font-weight="700"' : ''} fill="${o.fill ?? '#cbd5e1'}" font-family="${o.family ?? FONT}">` +
  `${esc(str)}</text>`;


const rect = (
  x: number,
  y: number,
  w: number,
  h: number,
  o: { fill?: string; stroke?: string; sw?: number; rx?: number; opacity?: number; dash?: string } = {},
): string =>
  `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" rx="${o.rx ?? 0}"` +
  ` fill="${o.fill ?? 'none'}"${o.opacity !== undefined ? ` fill-opacity="${o.opacity}"` : ''}` +
  ` stroke="${o.stroke ?? 'none'}" stroke-width="${o.sw ?? 1}"` +
  `${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`;

const seg = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  o: { stroke?: string; sw?: number; dash?: string } = {},
): string =>
  `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" stroke="${o.stroke ?? '#475569'}"` +
  ` stroke-width="${o.sw ?? 1.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''} stroke-linecap="round"/>`;

/** Pointe de flèche dirigée selon `deg` (0° = vers la droite, −90° = vers le haut). */
const head = (x: number, y: number, deg: number, color: string, s = 7): string =>
  `<path d="M ${r(x)},${r(y)} L ${r(x - 0.8 * s)},${r(y - 0.55 * s)} L ${r(x - 0.8 * s)},${r(y + 0.55 * s)} z"` +
  ` fill="${color}" transform="rotate(${deg} ${r(x)} ${r(y)})"/>`;

/** Flèche (segment + tête) selon deux points. */
const arrow = (x1: number, y1: number, x2: number, y2: number, color: string, sw = 2.5, dash?: string): string =>
  `${seg(x1, y1, x2, y2, { stroke: color, sw, dash })}` +
  `${head(x2, y2, Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI), color)}`;

/** Découpe un libellé en lignes d'au plus `maxChars` caractères. */
function wrap(str: string, maxChars: number): string[] {
  const words = str.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const word of words) {
    if (!cur) cur = word;
    else if (`${cur} ${word}`.length <= maxChars) cur = `${cur} ${word}`;
    else {
      lines.push(cur);
      cur = word;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Titre + sous-titre communs (haut du panneau). */
function header(spec: { title: string; subtitle?: string }): string {
  const out = [
    rect(PANEL.x, PANEL.y, PANEL.w, PANEL.h, { fill: '#0c1322', stroke: '#1e293b', sw: 2, rx: 22 }),
    txt(400, 40, spec.title, { size: 16, fill: '#f8fafc', bold: true }),
  ];
  if (spec.subtitle) out.push(txt(400, 62, spec.subtitle, { size: 11.5, fill: '#94a3b8' }));
  return out.join('\n  ');
}

/** Cartouche de conclusion en bas du panneau (2 lignes max, sans débordement). */
function footnote(lines: string[] | undefined): string {
  if (!lines || !lines.length) return '';
  const list = lines.slice(0, 2);
  const h = 16 + list.length * 20;
  const y = 480 - h;
  const out = [
    rect(30, y, 740, h, { fill: '#0f172a', stroke: '#1e293b', sw: 1, rx: 10 }),
    txt(400, y + (list.length === 1 ? 24 : 22), list[0], { size: 12.5, fill: '#cbd5e1' }),
  ];
  if (list[1]) out.push(txt(400, y + h - 8, list[1], { size: 12.5, fill: '#94a3b8' }));
  return out.join('\n  ');
}

/** Pastilles de légende (bandeau horizontal, centré au-dessus du tracé). */
function legend(items: { name: string; color: string; dashed?: boolean }[]): string {
  if (!items.length) return '';
  const widths = items.map((i) => i.name.length * 6.4 + 44);
  const total = widths.reduce((a, b) => a + b, 0) + (items.length - 1) * 14;
  let x = 400 - total / 2;
  const out: string[] = [];
  items.forEach((item, i) => {
    out.push(rect(x, 70, widths[i], 22, { fill: '#0f172a', stroke: '#1e293b', sw: 1, rx: 11, opacity: 0.96 }));
    out.push(seg(x + 10, 81, x + 28, 81, { stroke: item.color, sw: 3, dash: item.dashed ? '4 3' : undefined }));
    out.push(txt(x + 36, 85, item.name, { size: 11, fill: '#e2e8f0', anchor: 'start' }));
    x += widths[i] + 14;
  });
  return out.join('\n  ');
}

/** Splines Catmull-Rom → courbes Bézier passant exactement par chaque point. */
function smoothPath(pts: [number, number][]): string {
  if (pts.length < 3) return `M ${pts.map(([x, y]) => `${r(x)},${r(y)}`).join(' L ')}`;
  let d = `M ${r(pts[0][0])},${r(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${r(c1x)},${r(c1y)} ${r(c2x)},${r(c2y)} ${r(p2[0])},${r(p2[1])}`;
  }
  return d;
}

/** Gabarit partagé : <svg> + <defs> + corps + </svg>. */
function wrapSvg(titleAr: string, defs: string, body: string[]): string {
  const { header: h, footer } = ProFigureEngine.createSvgHeader(
    { viewBox: `0 0 ${VB.w} ${VB.h}`, titleAr },
    defs,
  );
  return `${h}\n  ${body.filter(Boolean).join('\n  ')}\n${footer}`;
}

/* ------------------------------------------------- 1. gabarit « courbes » */

export interface ChartSpec {
  title: string;
  subtitle?: string;
  xLabel: string;
  yLabel: string;
  xTicks?: { x: number; label: string }[];
  yTicks?: { y: number; label: string }[];
  /** Bandes verticales (axe X normalisé 0..1). */
  zones?: { x0: number; x1: number; label: string; fill: string }[];
  /** Bandes horizontales : y0 = bord supérieur (valeur haute), y1 = bord inférieur (valeur basse). */
  yZones?: { y0: number; y1: number; label: string; fill: string }[];
  /** Lignes horizontales de repère (ex. −70 mV, seuil −50 mV). */
  guides?: { y: number; label: string; color: string }[];
  series: { name: string; color: string; points: [number, number][]; dashed?: boolean }[];
  marks?: { x: number; y: number; text: string; dx?: number; dy?: number; color?: string; anchor?: Anchor }[];
  note?: string[];
}

const PLOT = { x: 118, w: 624, top: 104, h: 264 }; // droite 742 · bas 368

export function generateCurveChart(spec: ChartSpec): string {
  const X = (n: number) => PLOT.x + clamp01(n) * PLOT.w;
  const Y = (n: number) => PLOT.top + (1 - clamp01(n)) * PLOT.h;
  const body: string[] = [header(spec)];

  for (const z of spec.zones ?? []) {
    const x0 = X(z.x0);
    const x1 = X(z.x1);
    body.push(rect(x0, PLOT.top, x1 - x0, PLOT.h, { fill: z.fill, opacity: 0.14 }));
    body.push(txt((x0 + x1) / 2, PLOT.top + 16, z.label, { size: 11.5, fill: z.fill, bold: true }));
  }

  for (const z of spec.yZones ?? []) {
    const top = Y(z.y0);
    const bottom = Y(z.y1);
    body.push(rect(PLOT.x, top, PLOT.w, bottom - top, { fill: z.fill, opacity: 0.10 }));
    body.push(txt(PLOT.x + PLOT.w - 10, top + 16, z.label, { size: 11.5, fill: z.fill, bold: true, anchor: 'end' }));
  }

  for (const g of spec.guides ?? []) {
    const y = Y(g.y);
    body.push(seg(PLOT.x, y, PLOT.x + PLOT.w, y, { stroke: g.color, sw: 1.5, dash: '6 5' }));
    body.push(txt(PLOT.x + PLOT.w - 6, y - 6, g.label, { size: 11, fill: g.color, anchor: 'end' }));
  }

  body.push(seg(PLOT.x, PLOT.top + PLOT.h, PLOT.x + PLOT.w + 6, PLOT.top + PLOT.h, { stroke: '#475569', sw: 2 }));
  body.push(head(PLOT.x + PLOT.w + 8, PLOT.top + PLOT.h, 0, '#475569'));
  body.push(seg(PLOT.x, PLOT.top + PLOT.h, PLOT.x, PLOT.top - 8, { stroke: '#475569', sw: 2 }));
  body.push(head(PLOT.x, PLOT.top - 10, -90, '#475569'));
  body.push(txt(PLOT.x - 46, PLOT.top - 30, spec.yLabel, { size: 12.5, fill: '#e2e8f0', bold: true, anchor: 'start' }));
  body.push(txt(PLOT.x + PLOT.w / 2, 406, spec.xLabel, { size: 12.5, fill: '#e2e8f0', bold: true }));

  for (const t of spec.xTicks ?? []) {
    const x = X(t.x);
    body.push(seg(x, PLOT.top + PLOT.h, x, PLOT.top + PLOT.h + 6, { stroke: '#64748b', sw: 1.5 }));
    body.push(txt(x, PLOT.top + PLOT.h + 20, t.label, { size: 11, fill: '#94a3b8', family: "'Consolas', monospace" }));
  }
  for (const t of spec.yTicks ?? []) {
    const y = Y(t.y);
    body.push(seg(PLOT.x, y, PLOT.x - 6, y, { stroke: '#64748b', sw: 1.5 }));
    body.push(txt(PLOT.x - 10, y + 4, t.label, { size: 11, fill: '#94a3b8', anchor: 'end', family: "'Consolas', monospace" }));
  }

  for (const s of spec.series) {
    const pts = s.points.map(([x, y]): [number, number] => [X(x), Y(y)]);
    const d = smoothPath(pts);
    if (pts.length > 2) {
      const base = r(PLOT.top + PLOT.h);
      body.push(`<path d="${d} L ${r(pts[pts.length - 1][0])},${base} L ${r(pts[0][0])},${base} Z" fill="${s.color}" fill-opacity="0.10"/>`);
    }
    body.push(`<path d="${d}" fill="none" stroke="${s.color}" stroke-width="3" stroke-linecap="round"${s.dashed ? ' stroke-dasharray="8 5"' : ''}/>`);
    if (s.dashed) {
      const last = pts[pts.length - 1];
      body.push(head(last[0], last[1], 0, s.color, 6));
    }
  }

  for (const m of spec.marks ?? []) {
    const x = X(m.x);
    const y = Y(m.y);
    const color = m.color ?? '#fbbf24';
    const lx = x + (m.dx ?? 14);
    const ly = y + (m.dy ?? -14);
    body.push(seg(x, y, lx, ly, { stroke: color, sw: 1.5 }));
    body.push(`<circle cx="${r(x)}" cy="${r(y)}" r="5" fill="${color}" stroke="#0c1322" stroke-width="2"/>`);
    body.push(txt(lx + (m.anchor === 'start' ? 6 : m.anchor === 'end' ? -6 : 0), ly - 5, m.text, { size: 11.5, fill: color, bold: true, anchor: m.anchor ?? 'middle' }));
  }

  body.push(legend(spec.series.map((s) => ({ name: s.name, color: s.color, dashed: s.dashed }))));
  body.push(footnote(spec.note));
  return wrapSvg(spec.title, '', body);
}

/* ---------------------------------------- 2. gabarit « mécanisme / cycle » */

export interface FlowStep {
  badge: string;
  title: string;
  lines?: string[];
  chip?: string;
  color: string;
}

export interface FlowSpec {
  title: string;
  subtitle?: string;
  /** 2..4 étapes disposées en ligne. */
  steps: FlowStep[];
  /** Libellés d'échange affichés au-dessus de chaque flèche (steps.length − 1). */
  lanes?: string[];
  /** Libellé du retour cyclique (dernière étape → première, flèche pointillée). */
  loop?: string;
  note?: string[];
}

export function generateFlowDiagram(spec: FlowSpec): string {
  const n = spec.steps.length;
  if (n < 2 || n > 4) throw new Error(`FlowDiagram : 2..4 étapes attendues, ${n} fournies`);
  const x0 = 30;
  const gap = 46;
  const bw = (740 - (n - 1) * gap) / n;
  const by = 150;
  const bh = 148;
  const arrowY = by + bh / 2;
  const body: string[] = [header(spec)];

  spec.steps.forEach((s, i) => {
    const bx = x0 + i * (bw + gap);
    const titles = wrap(s.title, 18).slice(0, 2);
    const slots = s.chip ? 2 : 3;
    const lines = wrap((s.lines ?? []).join(' / '), 26).slice(0, slots);
    body.push(`<g transform="translate(${r(bx)}, ${by})">`);
    body.push(rect(0, 0, bw, bh, { fill: '#111c31', stroke: s.color, sw: 2, rx: 14 }));
    body.push(`<circle cx="24" cy="26" r="14" fill="${s.color}" fill-opacity="0.22" stroke="${s.color}" stroke-width="1.5"/>`);
    body.push(txt(24, 31, s.badge, { size: 13, fill: s.color, bold: true, family: "'Consolas', monospace" }));
    titles.forEach((line, li) => body.push(txt(bw / 2, 64 + li * 18, line, { size: 13.5, fill: '#f8fafc', bold: true })));
    lines.forEach((line, li) => body.push(txt(bw / 2, 104 + li * 18, line, { size: 11.5, fill: '#cbd5e1' })));
    if (s.chip) {
      body.push(rect(bw / 2 - 58, 126, 116, 20, { fill: s.color, opacity: 0.16, stroke: s.color, sw: 1, rx: 10 }));
      body.push(txt(bw / 2, 141, s.chip, { size: 11, fill: s.color, bold: true }));
    }
    body.push('</g>');

    if (i < n - 1) {
      const gx = bx + bw;
      body.push(arrow(gx + 6, arrowY, gx + gap - 6, arrowY, '#38bdf8'));
      const lane = spec.lanes?.[i];
      if (lane) {
        wrap(lane, 24)
          .slice(0, 2)
          .forEach((line, li) => body.push(txt(gx + gap / 2, 118 + li * 15, line, { size: 11, fill: '#fbbf24', bold: true })));
      }
    }
  });

  if (spec.loop) {
    const firstCx = x0 + bw / 2;
    const lastCx = x0 + (n - 1) * (bw + gap) + bw / 2;
    const ly = by + bh + 46;
    body.push(seg(lastCx, by + bh + 8, lastCx, ly, { stroke: '#94a3b8', sw: 2.5, dash: '7 5' }));
    body.push(seg(lastCx, ly, firstCx, ly, { stroke: '#94a3b8', sw: 2.5, dash: '7 5' }));
    body.push(arrow(firstCx, ly, firstCx, by + bh + 8, '#94a3b8', 2.5, '7 5'));
    body.push(rect(250, ly - 24, 300, 20, { fill: '#0c1322', opacity: 0.95, rx: 10 }));
    body.push(txt(400, ly - 10, spec.loop, { size: 11.5, fill: '#cbd5e1', bold: true }));
  }

  body.push(footnote(spec.note));
  return wrapSvg(spec.title, '', body);
}

/* ------------------------------------ 3. gabarit « couches / coupe » */

export interface LayerBand {
  name: string;
  detail?: string;
  /** Étiquette de la colonne gauche (ex. profondeur : « 0 – 30 كم »). */
  left?: string;
  /** Étiquette de la colonne droite (ex. état physique / densité). */
  right?: string;
  color: string;
  weight?: number;
}

export interface LayerSpec {
  title: string;
  subtitle?: string;
  bands: LayerBand[];
  leftHead?: string;
  rightHead?: string;
  note?: string[];
}

export function generateLayerStack(spec: LayerSpec): string {
  const n = spec.bands.length;
  if (n < 2 || n > 6) throw new Error(`LayerStack : 2..6 couches attendues, ${n} fournies`);
  const area = { x: 175, y: 106, w: 385, h: 290 };
  const total = spec.bands.reduce((sum, b) => sum + (b.weight ?? 1), 0);
  const body: string[] = [header(spec)];

  if (spec.leftHead) body.push(txt(165, 96, spec.leftHead, { size: 11, fill: '#94a3b8', bold: true, anchor: 'end' }));
  if (spec.rightHead) body.push(txt(575, 96, spec.rightHead, { size: 11, fill: '#94a3b8', bold: true, anchor: 'start' }));

  let y = area.y;
  spec.bands.forEach((b, i) => {
    const h = area.h * (b.weight ?? 1) / total;
    body.push(rect(area.x, y, area.w, h, { fill: b.color, opacity: 0.16, stroke: b.color, sw: 1.8, rx: 6 }));
    body.push(txt(area.x + 15, y + 24, b.name, { size: 13.5, fill: '#f8fafc', bold: true, anchor: 'start' }));
    if (b.detail) {
      wrap(b.detail, 52)
        .slice(0, h >= 66 ? 2 : 1)
        .forEach((line, li) => body.push(txt(area.x + 15, y + 44 + li * 16, line, { size: 11.5, fill: '#cbd5e1', anchor: 'start' })));
    }
    if (b.left) body.push(txt(165, y + 24, b.left, { size: 11.5, fill: b.color, bold: true, anchor: 'end' }));
    if (b.right) body.push(txt(575, y + 24, b.right, { size: 11.5, fill: '#e2e8f0', anchor: 'start' }));
    if (i > 0) body.push(seg(area.x, y, area.x + area.w, y, { stroke: '#0c1322', sw: 2 }));
    y += h;
  });

  body.push(footnote(spec.note));
  return wrapSvg(spec.title, '', body);
}

/* --------------------------------- 4. gabarit « comparaison 2..4 » */

export interface PanelCard {
  title: string;
  color: string;
  /** Glyphe court affiché dans l'emblème circulaire (ex. « A », « Si »). */
  glyph: string;
  lines?: string[];
}

export interface PanelCompareSpec {
  title: string;
  subtitle?: string;
  panels: PanelCard[];
  /** Échanges entre les 2 panneaux (flèches + libellés) — 2 panneaux seulement. */
  exchanges?: { label: string; color: string; rtl?: boolean }[];
  note?: string[];
}

export function generatePanelCompare(spec: PanelCompareSpec): string {
  const n = spec.panels.length;
  if (n < 1 || n > 4) throw new Error(`PanelCompare : 1..4 panneaux attendus, ${n} fournis`);
  const withExchanges = Boolean(spec.exchanges?.length) && n === 2;
  const gap = withExchanges ? 150 : 20;
  // 1 panneau = « fiche » centrée (560 px) plutôt qu'un bandeau plein cadre.
  const bw = n === 1 ? 560 : (740 - gap * (n - 1)) / n;
  const x0 = n === 1 ? 120 : 30;
  const body: string[] = [header(spec)];

  spec.panels.forEach((p, i) => {
    const x = x0 + i * (bw + gap);
    const cx = x + bw / 2;
    const titles = wrap(p.title, Math.floor((bw - 24) / 6.5)).slice(0, 2);
    body.push(rect(x, 104, bw, 44, { fill: p.color, opacity: 0.18, stroke: p.color, sw: 1.8, rx: 12 }));
    titles.forEach((line, li) => body.push(txt(cx, titles.length === 1 ? 131 : 124 + li * 17, line, { size: 13, fill: '#f8fafc', bold: true })));
    body.push(`<circle cx="${r(cx)}" cy="186" r="24" fill="${p.color}" fill-opacity="0.14" stroke="${p.color}" stroke-width="2"/>`);
    body.push(txt(cx, 193, p.glyph, { size: 15, fill: p.color, bold: true, family: "'Consolas', monospace" }));
    (p.lines ?? [])
      .slice(0, 6)
      .forEach((line, li) =>
        wrap(line, Math.floor((bw - 20) / 5.75))
          .slice(0, 2)
          .forEach((sub, si) => body.push(txt(cx, 226 + li * 21 + si * 14, sub, { size: 11.5, fill: '#cbd5e1' }))),
      );
  });

  if (withExchanges) {
    const left = x0 + bw;
    const right = x0 + bw + gap;
    (spec.exchanges ?? []).forEach((e, i) => {
      const y = 230 + i * 70;
      body.push(e.rtl ? arrow(right - 8, y, left + 8, y, e.color, 2.5) : arrow(left + 8, y, right - 8, y, e.color, 2.5));
      body.push(txt((left + right) / 2, y - 10, e.label, { size: 11, fill: e.color, bold: true }));
    });
  }

  body.push(footnote(spec.note));
  return wrapSvg(spec.title, '', body);
}





