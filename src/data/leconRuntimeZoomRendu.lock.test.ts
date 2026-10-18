// leconRuntimeZoomRendu.lock.test.ts — M8 (audit externe v2, 2026-10-18).
//
// MESURE DE L'AUDIT PÉRIMÉE : l'item « 802 Ko de JS dupliqué dans les leçons,
// à extraire vers un fichier partagé » décrit l'ancienne architecture ?raw.
// Depuis M1 (2026-10-14), les leçons sont chargées par fetch(/lessons/*.html)
// avec cache service-worker (lessonHtmlGetters.ts — « plus aucun octet de
// leçon dans le JS ») : le runtime de zoom FIGURE_ZOOM_BLOCK (~23 000
// caractères) voyage UNE fois par leçon téléchargée et n'existe qu'en un seul
// exemplaire dans le bundle applicatif (vérifié sur dist/ : 1 occurrence).
// L'extraction vers un fichier externe est en outre TECHNIQUEMENT INTERDITE :
// srcdoc = origine opaque, un <script src> relatif ne résout pas ; et hors
// ligne on ne veut aucune requête supplémentaire (contrat documenté dans
// src/utils/figureZoomRuntime.ts, module protégé).
//
// Deux risques réels restent verrouillés ici :
//   1. quiconque ré-importe les leçons en ?raw ramènerait ~1,9 Mo de HTML
//      dupliqué dans le bundle → interdiction absolue ;
//   2. HtmlLessonViewer doit ré-injecter le bloc CANONIQUE au rendu via
//      injectFigureZoom() (idempotent, met à niveau un bloc obsolète si un
//      fichier a dérivé) — sémantique identique à `npm run figures:zoom`.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FIGURE_ZOOM_BLOCK } from '../utils/figureZoomRuntime';

const RACINE = resolve(__dirname, '../..');
const DIR_LECONS = resolve(RACINE, 'public/lessons');
const fiches = readdirSync(DIR_LECONS).filter(
  (f) => f.endsWith('.html') && statSync(resolve(DIR_LECONS, f)).isFile(),
);

describe('M8 — le runtime de zoom voyage une seule fois, et le rendu reste canonique', () => {
  it('les 25 leçons sur disque restent autonomes (contrat figures:zoom intact)', () => {
    expect(fiches.length).toBe(25);
    for (const f of fiches) {
      const t = readFileSync(resolve(DIR_LECONS, f), 'utf8');
      expect(t.includes(FIGURE_ZOOM_BLOCK), `${f} : bloc absent du disque`).toBe(true);
    }
  });

  it('AUCUN module source ne ré-importe les leçons en ?raw (re-duplication interdite)', () => {
    const coupables: string[] = [];
    const parcourir = (dir: string): void => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const chemin = resolve(dir, e.name);
        if (e.isDirectory()) {
          parcourir(chemin);
          continue;
        }
        if (!/\.(ts|tsx)$/.test(e.name) || e.name === 'leconRuntimeZoomRendu.lock.test.ts') continue;
        const t = readFileSync(chemin, 'utf8');
      for (const ligne of t.split('\n')) {
        // ciblage strict : une LIGNE qui importe effectivement un .html de
        // leçon en ?raw (les commentaires historiques sont tolérés) ;
        // ce fichier verrou lui-même est exclu (il CONTIENT le motif par définition)
        if (ligne.includes('lessons/') && ligne.includes('.html?raw')) {
          coupables.push(chemin.slice(RACINE.length + 1));
          break;
        }
      }
      }
    };
    parcourir(resolve(RACINE, 'src'));
    expect(
      coupables,
      `imports ?raw de leçons (re-duplication du bundle) : ${coupables.join(', ')}`,
    ).toEqual([]);
  });

  it('lessonHtmlGetters charge par fetch (leçons jamais embarquées en JS)', () => {
    const source = readFileSync(resolve(RACINE, 'src/data/lessonHtmlGetters.ts'), 'utf8');
    expect(source).toMatch(/fetch\(`\/lessons\/\$\{fichier\}`\)/);
  });

  it('HtmlLessonViewer ré-injecte le bloc canonique au rendu (injectFigureZoom)', () => {
    const source = readFileSync(resolve(RACINE, 'src/components/HtmlLessonViewer.tsx'), 'utf8');
    expect(source).toContain("from '../utils/figureZoomRuntime'");
    expect(source).toMatch(/compileLecon\(sliceLessonHtml\(/);
    expect(source).toMatch(/injectFigureZoom\(/);
  });
});
