/**
 * tronquer-sources.ts — Génère les extraits TRONQUÉS des sources L1–L4 du correcteur.
 *
 * Contexte (audit 2026-09-16) : les livres L1–L4 sont protégés par le droit
 * d'auteur → jamais commités. Résultat : le garde-fou de traçabilité de
 * `src/correcteurV1.test.ts` restait muet en CI sur ces sources.
 *
 * Cet outil extrait, pour chaque source disponible localement, une fenêtre de
 * contexte autour de chaque mot-clé de la banque (`src/correcteurV1.ts`) et
 * l'écrit dans `docs/sources/tronque/<même nom de fichier>`. Seul CE dossier
 * part en CI — le test y lit la preuve de traçabilité.
 *
 * Usage (machine possédant les livres complets dans docs/sources/) :
 *   npm run sources:tronquer
 *   git add docs/sources/tronque/
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { normalizeAr } from '../src/lib/validation/normalizeAr';
import { CORRECTEUR_V1_UNITES, SOURCES_LABELS } from '../src/correcteurV1';

const SRC_DIR = path.resolve(import.meta.dirname, '..', 'docs', 'sources');
const OUT_DIR = path.join(SRC_DIR, 'tronque');
/** Caractères de contexte conservés de chaque côté d'une occurrence. */
const CONTEXTE = 80;
/** Fusion de deux fenêtres séparées de moins de GAP caractères. */
const GAP = 20;
/** Sources livres (droits d'auteur) — L5/L6 sont déjà commitées en entier. */
const LABELS_A_TRONQUER = ['L1', 'L2', 'L3', 'L4'] as const;

/** Ramène les indices Unicode (CO₂, O₂…) à leur chiffre ASCII — identique test. */
function fixSubscripts(s: string): string {
  return s.replace(/[\u2080-\u2089]/g, (c) => String(c.codePointAt(0)! - 0x2080));
}
/** Normalisation commune de recherche de sous-chaîne — identique test. */
const norm = (s: string): string => normalizeAr(fixSubscripts(s));

// Mots-clés à prouver par source (uniquement les unités déclarant cette source).
const motsParSource: Record<string, string[]> = {};
for (const u of CORRECTEUR_V1_UNITES) {
  for (const label of u.sources) {
    if (!(LABELS_A_TRONQUER as readonly string[]).includes(label)) continue;
    (motsParSource[label] ??= []).push(...u.motsCles);
  }
}

let fragmentsTotal = 0;
let sourcesTraitees = 0;

for (const label of LABELS_A_TRONQUER) {
  const filename = SOURCES_LABELS[label];
  const srcPath = path.join(SRC_DIR, filename);
  if (!existsSync(srcPath)) {
    console.warn(
      `⚠️  ${label} — « ${filename} » absent de docs/sources/ : ignoré. ` +
        'Dépose le livre complet localement (jamais commité, voir .gitignore) puis relance.',
    );
    continue;
  }
  const mots = motsParSource[label] ?? [];
  if (mots.length === 0) {
    console.warn(`⚠️  ${label} — aucune unité ne déclare cette source : ignoré.`);
    continue;
  }

  const nrm = norm(readFileSync(srcPath, 'utf-8'));
  const ranges: Array<{ start: number; end: number }> = [];
  let nonLocalises = 0;

  for (const kw of new Set(mots)) {
    const nk = norm(kw);
    if (!nk) continue;
    let needle = nk;
    let idx = nrm.indexOf(needle);
    if (idx < 0) {
      // Tolérance « الـ » — identique test : la source peut omettre l'article.
      const relaxed = nk.startsWith('ال') && nk.length > 4 ? nk.slice(2) : '';
      if (relaxed) {
        needle = relaxed;
        idx = nrm.indexOf(needle);
      }
    }
    if (idx < 0) {
      nonLocalises += 1;
      console.warn(`   • ${label} : mot-clé NON localisé → « ${kw} »`);
      continue;
    }
    ranges.push({
      start: Math.max(0, idx - CONTEXTE),
      end: Math.min(nrm.length, idx + needle.length + CONTEXTE),
    });
  }

  if (ranges.length === 0) {
    console.warn(`⚠️  ${label} — aucun mot-clé localisé : extrait non généré.`);
    continue;
  }

  // Fusion des fenêtres qui se chevauchent ou sont quasi adjacentes.
  ranges.sort((a, b) => a.start - b.start);
  const fusionnees: Array<{ start: number; end: number }> = [];
  for (const r of ranges) {
    const last = fusionnees[fusionnees.length - 1];
    if (last && r.start <= last.end + GAP) last.end = Math.max(last.end, r.end);
    else fusionnees.push({ ...r });
  }

  const extrait = fusionnees.map((r) => nrm.slice(r.start, r.end)).join('\n[…]\n');
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(path.join(OUT_DIR, filename), extrait, 'utf-8');
  fragmentsTotal += fusionnees.length;
  sourcesTraitees += 1;
  console.log(
    `✅ ${label} → docs/sources/tronque/${filename} ` +
      `(${extrait.length} car., ${fusionnees.length} fragments, ` +
      `${ranges.length} mots-clés prouvés${nonLocalises ? `, ${nonLocalises} NON localisés` : ''})`,
  );
}

if (sourcesTraitees === 0) {
  console.log('\nAucune source L1–L4 trouvée localement — rien à générer.');
  console.log('En CI, le gate de traçabilité reste granulaire : L5/L6 prouvées, L1–L4 hors périmètre.');
} else {
  console.log(
    `\nTerminé : ${sourcesTraitees} source(s), ${fragmentsTotal} fragments dans docs/sources/tronque/.`,
  );
  console.log('Commit CE DOSSIER uniquement : git add docs/sources/tronque/');
}
