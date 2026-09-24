// build_chapter_index.ts — INDEX DE LOCALISATION des 55 chapitres du livre
// officiel dans l'OCR (data/bookContent.json → data/bookContent.index.json).
//
// Méthode (audit 2026-09-20) : les titres arabes FIABLES viennent de
// book_tdm_clean.md (le JSON de grille a la TDM mojibake). La TDM DU LIVRE lui-même
// (premières pages OCR) contient tous les titres en cluster → détectée et exclue.
// Affectation MONOTONE : chaque chapitre doit démarrer APRÈS le précédent.
// Passes décroissantes : ligne-titre autonome → ligne contenant le titre →
// bi-ligne (titre coupé) → tiges distinctives (cas OCR dégradés, mode documenté).
// Aucun chapitre n'est « placé » à la main : tout est recalculable par ce script.

import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

// ── normalisation (alignée sur normalizeAr + tolérance OCR) ──────────────────
function norm(s: string): string {
  return s
    .normalize('NFKC')
    .toLowerCase() // AVANT le filtre — sinon LB/LT/ADN (majuscules) sont détruits
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[إأآٱا]/g, 'ا')
    .replace(/ء/g, '')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^\u0600-\u06FF a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const livre = JSON.parse(readFileSync(join(process.cwd(), 'data', 'bookContent.json'), 'utf-8'));
const tdmBrut = readFileSync(join(process.cwd(), 'book_tdm_clean.md'), 'utf-8');
const lignes: string[] = livre.book.full_text;
const nLignes = lignes.map(norm);
const nTexte = nLignes.join('\n');

// ── les 55 titres propres depuis la TDM du dépôt ────────────────────────────
const lignesTdm = (tdmBrut.match(/^\d+\.\s*(.+)$/gm) ?? []).map((l) =>
  l.replace(/^\d+\.\s*/, '').trim()
);
if (lignesTdm.length !== 55) throw new Error(`TDM: ${lignesTdm.length} titres ≠ 55`);
const titres = lignesTdm.map((t) => {
  const [ar] = t.split(/\s*-\s*/);
  return { brut: t, ar: ar.trim(), norm: norm(ar.trim()) };
});

// ── grille : (domaine, unité) dans l'ordre du livre — numéro GLOBAL = position
// aplatie (le champ n de la grille numérote PAR UNITÉ : U1→1..5, U2→1..3, …) ──
const grille: { domain: number; unit: number; n: number }[] = [];
for (const dom of livre.control_grid.structure) {
  for (const u of dom.units) {
    const ns = u.chapters.map((c: { n: number }) => c.n);
    ns.forEach((n: number, k: number) => {
      if (n !== k + 1) throw new Error(`grille : n=${n} hors séquence dans D${dom.domain}U${u.unit}`);
      grille.push({ domain: dom.domain, unit: u.unit, n: n });
    });
  }
}
if (grille.length !== 55) throw new Error(`grille: ${grille.length} chapitres ≠ 55`);

// ── occurrences de chaque titre (ligne / bi-ligne) ──────────────────────────
function occurrences(t: string): { ligne: number; mode: 'ligne' | 'biline' }[] {
  const out: { ligne: number; mode: 'ligne' | 'biline' }[] = [];
  for (let i = 0; i < nLignes.length; i++) {
    if (t.length > 2 && nLignes[i].includes(t)) out.push({ ligne: i, mode: 'ligne' });
    else if (i + 1 < nLignes.length && (nLignes[i] + ' ' + nLignes[i + 1]).includes(t))
      out.push({ ligne: i, mode: 'biline' });
  }
  return out.sort((a, b) => a.ligne - b.ligne);
}
const occ = titres.map((t) => occurrences(t.norm));

// ── détection du cluster TDM du livre (tous les titres tôt dans le texte) ──
const fenetreTdm = 300;
const titresDansFenetre = new Set<number>();
for (let i = 0; i < occ.length; i++)
  for (const o of occ[i]) if (o.ligne < fenetreTdm) titresDansFenetre.add(i);
let finTdm = -1;
if (titresDansFenetre.size >= 20) {
  for (const i of titresDansFenetre)
    for (const o of occ[i]) if (o.ligne < fenetreTdm) finTdm = Math.max(finTdm, o.ligne);
}
console.log(`TDM du livre : ${titresDansFenetre.size}/55 titres dans les ${fenetreTdm} premières lignes → recherche dès la ligne ${finTdm + 1}`);

// ── ANCRES DOCUMENTÉES (posées AVANT la boucle) : chapitres dont l'en-tête est
// mangé par l'OCR — chaque ancre est VÉRIFIÉE contre la ligne OCR au build ────
const ANCRES: Record<number, { ligne: number; tiges: string[]; note: string }> = {
  // p.97 du livre (TDM interne l.66) — AUCUN en-tête OCR : la bannière du chapitre
  // n'a pas été reconstruite par l'OCR. Le seul autre « العناصر الدفاعية » du texte
  // (l.2179) est le RÉCAP de fin d'unité (cluster النشاط N: juste avant الحصيلة
  // المعرفية l.2193) — rejeté comme en-tête. Borne = la ligne précédant طرق (p.98).
  18: { ligne: 1796, tiges: [], note: 'bannière p.97 absente de l OCR — borné par طرق تأثير (l.1797) ; récap l.2179 écarté' },
  // p.98 du livre (TDM interne l.71) — en-tête réel l.1797 « طرق تأثير اللمفاويات،LT »
  19: { ligne: 1797, tiges: ['اللمفاويات', 'تاثير'], note: 'en-tête OCR l.1797 (LTc tronqué en LT) ; p.98' },
  // p.100 du livre (TDM interne l.72) — en-tête réel l.1850 « مصدر اللمفاويات LTc »
  20: { ligne: 1850, tiges: ['مصدر', 'اللمفاويات'], note: 'en-tête OCR l.1850 ; p.100' },
};
const ancreDe = new Map<number, (typeof ANCRES)[number]>();
for (const [numStr, a] of Object.entries(ANCRES)) {
  const num = parseInt(numStr, 10);
  const ok =
    a.tiges.length === 0
      ? lignes[a.ligne].trim().length > 0
      : a.tiges.every((t) => nLignes[a.ligne].includes(t));
  if (!ok) throw new Error(`ancre du chapitre ${num} invalidée : l.${a.ligne} ne contient plus ${a.tiges.join('+') || '(ligne)'} — re-vérification manuelle requise`);
  ancreDe.set(num, a);
}

// ── affectation monotone, passes décroissantes ──────────────────────────────
interface Entree {
  domain: number;
  unit: number;
  chapter: number;
  titreAr: string;
  ligneDebut: number;
  /** Borne supérieure de la plage du chapitre (calculée après l'affectation). */
  ligneFin?: number;
  mode: 'verbatim-ligne' | 'verbatim-contient' | 'biline' | 'tiges' | 'ancre-documentee' | 'inferred-borne';
  evidence: string;
  tiges?: string[];
  /** true = borne déduite (en-tête OCR absent) — signalé, jamais masqué. */
  ambigu?: boolean;
}
const chapitres: Entree[] = [];
let precedent = finTdm;
let echecs = 0;
for (let i = 0; i < 55; i++) {
  const t = titres[i];
  const g = grille[i];
  const ancre = ancreDe.get(i + 1);
  if (ancre) {
    if (ancre.ligne <= precedent) throw new Error(`ancre ch.${i + 1} (${ancre.ligne}) ≤ curseur (${precedent})`);
    precedent = ancre.ligne;
    chapitres.push({
      domain: g.domain,
      unit: g.unit,
      chapter: i + 1,
      titreAr: t.ar,
      ligneDebut: ancre.ligne,
      mode: ancre.tiges.length === 0 ? 'inferred-borne' : 'ancre-documentee',
      evidence: ancre.note,
      ambigu: true,
    });
    console.log(`  C${String(g.n).padStart(2, '0')} D${g.domain}U${g.unit} → l.${String(ancre.ligne).padStart(4)} [${ancre.tiges.length === 0 ? 'inferred-borne' : 'ancre-documentee'}] ${t.ar.slice(0, 44)}`);
    continue;
  }
  const cands = occ[i].filter((o) => o.ligne > precedent);
  let choisi: { ligne: number; mode: Entree['mode']; evidence: string; tiges?: string[] } | null = null;

  // passes 1-2 anti-drift : la ligne qui contient un titre d'en-tête est courte
  // (une mention en corps de texte est une longue ligne) — plafond relatif.
  const plafond = Math.max(t.norm.length * 2.2, t.norm.length + 25);
  for (const passe of ['verbatim-ligne', 'verbatim-contient', 'biline'] as const) {
    const c =
      passe === 'verbatim-ligne'
        ? cands.find((o) => o.mode === 'ligne' && nLignes[o.ligne].length <= plafond)
        : passe === 'verbatim-contient'
          ? cands.find((o) => o.mode === 'ligne' && nLignes[o.ligne].length <= plafond * 1.6)
          : cands.find((o) => o.mode === 'biline');
    if (c) {
      choisi = {
        ligne: c.ligne,
        mode: passe,
        evidence: (lignes[c.ligne] + (passe === 'biline' ? ' ⏎ ' + lignes[c.ligne + 1] : '')).trim().slice(0, 160),
      };
      break;
    }
  }

  // passe 4 : paires de tiges (OCR dégradé) — toutes les paires parmi les 4 jetons
  // les plus longs, essayées dans l'ordre (les plus longs d'abord).
  if (!choisi) {
    const jetons = [...new Set(t.norm.split(' '))].filter((x) => x.length >= 4);
    jetons.sort((a, b) => b.length - a.length);
    const top = jetons.slice(0, 4);
    const plafondTiges = Math.max(t.norm.length * 2.2, t.norm.length + 25);
    exterieur: for (let a = 0; a < top.length; a++) {
      for (let b = a + 1; b < top.length; b++) {
        const l = nLignes.findIndex(
          (nl, idx) =>
            idx > precedent && nl.length <= plafondTiges && nl.includes(top[a]) && nl.includes(top[b])
        );
        if (l >= 0) {
          choisi = { ligne: l, mode: 'tiges', evidence: lignes[l].trim().slice(0, 160), tiges: [top[a], top[b]] };
          break exterieur;
        }
      }
    }
  }

  if (!choisi) {
    echecs++;
    const candsProches = cands.slice(0, 4).map((o) => `${o.ligne}:${lignes[o.ligne].trim().slice(0, 40)}`);
    console.error(`✗ chapitre global ${i + 1} non localisé : ${t.ar} | candidats bruts: ${candsProches.join(' · ') || 'aucun'}`);
    continue;
  }
  precedent = choisi.ligne;
  console.log(`  C${String(g.n).padStart(2, '0')} D${g.domain}U${g.unit} → l.${String(choisi.ligne).padStart(4)} [${choisi.mode}] ${t.ar.slice(0, 44)}`);
  const entree: Entree = {
    domain: g.domain,
    unit: g.unit,
    chapter: i + 1,
    titreAr: t.ar,
    ligneDebut: choisi.ligne,
    mode: choisi.mode,
    evidence: choisi.evidence,
  };
  if (choisi.mode === 'tiges' && choisi.tiges) entree.tiges = choisi.tiges;
  chapitres.push(entree);
}
if (chapitres.length !== 55) throw new Error(`${chapitres.length}/55 — index partiel refusé`);

// ── bornes de plages + contrôle de monotonie stricte ────────────────────────
for (let i = 0; i < chapitres.length; i++) {
  const cur = chapitres[i];
  const suivant = i + 1 < chapitres.length ? chapitres[i + 1] : null;
  cur.ligneFin = (suivant ? suivant.ligneDebut : lignes.length) - 1;
  if (cur.ligneFin < cur.ligneDebut)
    throw new Error(`plage inversée au chapitre ${cur.chapter}`);
}

const modes = chapitres.reduce<Record<string, number>>((a, c) => ({ ...a, [c.mode]: (a[c.mode] ?? 0) + 1 }), {});
const ambigus = chapitres.filter((c) => c.ambigu).length;
console.log('modes :', JSON.stringify(modes), '| ambigus :', ambigus);

const jsonBrut = readFileSync(join(process.cwd(), 'data', 'bookContent.json'));
const index = {
  schema_version: '1.0',
  generated_utc: new Date().toISOString(),
  source: {
    fichier: 'data/bookContent.json',
    octets: jsonBrut.length,
    sha256: createHash('sha256').update(jsonBrut).digest('hex'),
    lignes_ocr: lignes.length,
  },
  methode: 'scripts/build_chapter_index.ts — affectation monotone après exclusion du cluster TDM du livre ; passes : ligne-titre → ligne → bi-ligne → tiges',
  grille: { domains: 3, units: 11, chapters: 55 },
  tdm_du_livre: { fin: finTdm },
  stats: modes,
  preamble: { debut: 0, fin: chapitres[0].ligneDebut - 1 },
  chapitres,
};
writeFileSync(
  join(process.cwd(), 'data', 'bookContent.index.json'),
  JSON.stringify(index, null, 2) + '\n',
  'utf-8'
);
console.log(`✓ data/bookContent.index.json écrit (${chapitres.length} chapitres, préambule 0-${chapitres[0].ligneDebut - 1})`);
