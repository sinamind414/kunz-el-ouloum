/**
 * scripts/tools/applyFigureZoom.ts
 *
 * Injecte (de façon idempotente) le RUNTIME DE ZOOM dans tous les documents HTML
 * servis hors React — principalement les 25 leçons de public/lessons/*.html
 * (affichées dans une iframe `srcdoc` isolée : le runtime doit voyager DANS le
 * fichier) — puis valide que la structure des documents n'a pas bougé.
 *
 * Le runtime lui-même vit dans src/utils/figureZoomRuntime.ts (source unique
 * partagée avec l'application React via src/components/FigureZoomLayer.tsx).
 *
 * Exécution : npx tsx scripts/tools/applyFigureZoom.ts [--check]
 *   --check = valide sans écrire (CI / avant commit).
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  FIGURE_ZOOM_BLOCK,
  FIGURE_ZOOM_MARKER_END,
  FIGURE_ZOOM_MARKER_START,
  FIGURE_ZOOM_SCRIPT_ID,
  FIGURE_ZOOM_STYLE_ID,
  hasFigureZoom,
  injectFigureZoom,
} from '../../src/utils/figureZoomRuntime';

/** Répertoires de HTML statiques servis par l'application (leçons + miftah). */
const TARGET_DIRS = ['public/lessons', 'public'];

/** Un document est ciblé s'il contient au moins une figure (SVG ou image). */
function hasFigure(html: string): boolean {
  return html.includes('<svg') || /<img\b/i.test(html);
}

/** Corps du script injecté (entre la balise ouvrante et sa fermeture). */
const ZOOM_JS_BODY = (() => {
  const open = FIGURE_ZOOM_BLOCK.indexOf('<script');
  const start = FIGURE_ZOOM_BLOCK.indexOf('>', open) + 1;
  const closeTag = '</scr' + 'ipt>';
  const end = FIGURE_ZOOM_BLOCK.lastIndexOf(closeTag);
  return end > start ? FIGURE_ZOOM_BLOCK.slice(start, end) : '';
})();

/** Nombre d'occurrences de la séquence d'ouverture d'attribut d'id. */
function countIds(html: string): number {
  return (html.match(/\bid="[^"]*"/g) || []).length;
}

/**
 * Contrôles structurels post-injection.
 * Les doublons d'ids PRÉ-EXISTANTS (fichiers de phase = 2 chapitres, chacun avec
 * sa copie de figures) sont normaux : le viewer ne rend qu'un chapitre à la fois
 * (sliceLessonHtml). On vérifie donc seulement que l'injection n'introduit aucun
 * doublon : exactement +2 ids, présents une seule fois chacun.
 */
function validate(html: string, label: string, before: string, problems: string[]): void {
  if (!html.includes('<!DOCTYPE html')) problems.push(`${label}: doctype absent`);
  if (!html.trimEnd().endsWith('</html>')) problems.push(`${label}: document non clos (</html> manquant)`);

  const openDivs = (html.match(/<div\b/g) || []).length;
  const closeDivs = (html.match(/<\/div>/g) || []).length;
  if (openDivs !== closeDivs) problems.push(`${label}: <div> déséquilibrés (${openDivs} vs ${closeDivs})`);

  const idsBefore = countIds(before);
  const idsAfter = countIds(html);
  const expectedIds = hasFigureZoom(before) ? idsBefore : idsBefore + 2;
  if (idsAfter !== expectedIds) {
    problems.push(`${label}: ids ${idsAfter} (attendu ${expectedIds} : +2 style/script en 1re injection)`);
  }
  for (const id of [FIGURE_ZOOM_STYLE_ID, FIGURE_ZOOM_SCRIPT_ID]) {
    const hits = (html.match(new RegExp(`\\bid="${id}"`, 'g')) || []).length;
    if (hits !== 1) problems.push(`${label}: id de zoom « ${id} » présent ${hits} fois (attendu 1)`);
  }

  const markerStart = html.indexOf(FIGURE_ZOOM_MARKER_START);
  const markerEnd = html.indexOf(FIGURE_ZOOM_MARKER_END, markerStart + 1);
  if (markerStart < 0) problems.push(`${label}: bloc de zoom absent`);
  else if (markerEnd < 0) problems.push(`${label}: marqueur de fin de zoom absent`);

  // Séquences interdites dans le CORPS du JS injecté
  // (cf. src/data/lessonRenderParcours.test.ts : ids uniques + divs équilibrés).
  if (ZOOM_JS_BODY.includes('id="')) problems.push(`${label}: JS de zoom avec séquence id=" (faux doublons d'ids)`);
  if (ZOOM_JS_BODY.includes('<div')) problems.push(`${label}: JS de zoom avec <div littéral (divs déséquilibrés)`);
  if (ZOOM_JS_BODY.includes('</scr' + 'ipt>')) problems.push(`${label}: JS de zoom avec séquence de fin de script`);

}


/** Fichiers HTML ciblés : dédupliqués (public + public/lessons), triés. */
function targetFiles(): string[] {
  const files = new Set<string>();
  for (const dir of TARGET_DIRS) {
    for (const entry of readdirSync(resolve(process.cwd(), dir))) {
      if (entry.endsWith('.html')) files.add(`${dir}/${entry}`);
    }
  }
  return [...files].sort();
}

function main(): void {
  const checkOnly = process.argv.includes('--check');
  const problems: string[] = [];
  let touched = 0;
  let scanned = 0;

  for (const file of targetFiles()) {
    const path = resolve(process.cwd(), file);
    const original = readFileSync(path, 'utf8');
    if (!hasFigure(original)) continue;
    scanned += 1;

    try {
      const { html, changed } = injectFigureZoom(original);
      const local: string[] = [];
      validate(html, file, original, local);
      if (local.length) {
        problems.push(...local);
        console.error(`x ${file} — ${local.length} problème(s) de structure (non écrit)`);
        continue;
      }
      if (changed && !checkOnly) writeFileSync(path, html, 'utf8');
      if (changed) touched += 1;
      const state = changed ? (checkOnly ? 'à écrire' : 'mis à jour') : 'inchangé';
      console.log(`ok ${file} — zoom ${state}`);
    } catch (err) {
      problems.push(`${file}: ${(err as Error).message}`);
    }
  }

  if (problems.length) {
    console.error(`\n${problems.length} problème(s) :`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  if (checkOnly && touched) {
    console.error(`\n${touched} document(s) au zoom obsolète — lancer : npm run figures:zoom`);
    process.exit(1);
  }
  console.log(`\n${scanned} document(s) HTML · ${touched} modifié(s) · zoom actif sur toutes les figures`);
}

main();


