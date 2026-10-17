import { existsSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const DIST = resolve(process.cwd(), 'dist');
const DIST_ASSETS = resolve(DIST, 'assets');
const PUBLIC_LESSONS = resolve(process.cwd(), 'public', 'lessons');

// M1 (2026-10-17, audit 8 axes) — ARCHITECTURE SOURCE UNIQUE :
// chaque leçon existe UNE SEULE FOIS, en `dist/lessons/<fichier>.html`
// (copie fidèle de public/lessons, précachée par le SW et consultée par
// fetch — see lessonHtmlGetters.ts). AVANT M1, chaque fichier était AUSSI
// embarqué en chunk JS `?raw` (25 chunks phaseN = 2 143 991 octets) —
// supprimé. Ce smoke verrouille la réalité du master :
//  - le bundle principal (index-*.js) existe
//  - AUCUN chunk JS de leçon phaseN_chapitres_* (regression guard : si un
//    octet de leçon revient dans le bundle, c'est le double embarquement
//    qui repart, et ce test doit casser)
//  - les bases tutor lourdes restent isolées (perf, connexions 3G)
//  - dist/lessons contient TOUTES les leçons HTML de public/lessons
//  - aucune leçon n'est servie en HTML depuis dist/assets
const LESSON_CHUNK_PREFIX = 'phase';
const TUTOR_BASES = ['tutor-knowledge-base', 'tutor-qa-base'];

describe('Build smoke — source unique des leçons (M1)', () => {
  it('produit un bundle principal index-*.js', () => {
    const files = readdirSync(DIST_ASSETS);
    const main = files.find((f) => /^index-.*\.js$/.test(f));
    expect(main, 'bundle principal index-*.js manquant').toBeDefined();
  });

  it('n embarque AUCUNE leçon en chunk JS phaseN_chapitres_* (source unique, fetch + SW)', () => {
    const files = readdirSync(DIST_ASSETS);
    const lessonChunks = files.filter(
      (f) => f.startsWith(LESSON_CHUNK_PREFIX) && f.endsWith('.js'),
    );

    // M1 : 0 court. Tant que ce test est vert, aucune leçon n'est dupliquée
    // entre le bundle et dist/lessons — ~2,1 Mo d'économie pour un mobile 3G.
    expect(lessonChunks, `chunks de leçons réapparus : ${lessonChunks.join(', ')}`).toEqual([]);
  });

  it('publie toutes les leçons HTML de public/lessons dans dist/lessons (source servie)', () => {
    const sources = readdirSync(PUBLIC_LESSONS).filter((f) => f.endsWith('.html'));
    expect(sources.length, 'aucune leçon dans public/lessons ?').toBeGreaterThan(0);

    const distLessonsDir = resolve(DIST, 'lessons');
    expect(existsSync(distLessonsDir), 'dist/lessons/ manquant — le fetch des leçons cassera hors ligne').toBe(true);

    for (const f of sources) {
      const cible = resolve(distLessonsDir, f);
      expect(existsSync(cible), `leçon absente de dist/lessons : ${f}`).toBe(true);
      // Copie FIDÈLE (source unique) : même poids, pas de transformation à la main.
      expect(statSync(cible).size, `leçon altérée au build : ${f}`).toBe(
        statSync(resolve(PUBLIC_LESSONS, f)).size,
      );
    }
  });

  it('isole les bases de connaissances tutor en chunks séparés', () => {
    const files = readdirSync(DIST_ASSETS);
    for (const base of TUTOR_BASES) {
      const chunk = files.find((f) => f.startsWith(`${base}-`) && f.endsWith('.js'));
      expect(chunk, `chunk ${base}-*.js manquant`).toBeDefined();
    }
  });

  it('ne sert aucune leçon en HTML depuis dist/assets', () => {
    const files = readdirSync(DIST_ASSETS);
    const htmlFiles = files.filter((f) => f.endsWith('.html'));

    expect(htmlFiles, `chunks HTML inattendus : ${htmlFiles.join(', ')}`).toEqual([]);
  });
});
