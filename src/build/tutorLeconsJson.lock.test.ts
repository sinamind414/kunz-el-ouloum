// tutorLeconsJson.lock.test.ts — verrou « Phase A découpage bundle » (2026-10-16).
//
// L'index des leçons du tuteur (src/data/lessonIndex.ts, 786 Ko sur disque,
// 547 chunks) n'a plus le droit de voyager en JavaScript. Il est émis par le
// build en `dist/tutor/lesson-index.json` et récupéré par fetch au premier
// montage d'une vue du tuteur (AITutorView, SearchView).
//
// Ce contrôle vit avec les autres contrôles post-build (`npm run test:build`)
// car il lit `dist/`, pas le code source :
//   (a) le JSON émis existe, est le contenu EXACT de l'index généré
//       (547 chunks — verrou : src/data/lessonIndex.lock.test.ts) ;
//   (b) aucun chunk JS de dist/assets ne contient plus l'index en dur
//       (marqueur : préfixe d'identifiant « lhx_ », uniquement présent dans
//       l'index des leçons).
//
// Avant le correctif : (a) rouge (JSON inexistant) et (b) rouge (le chunk
// tutor-lesson-index-*.js ≈ 771 Ko embarque tout l'index).

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const DIST = resolve(process.cwd(), 'dist');

describe('lesson-index du tuteur : émis en JSON, hors des chunks JS', () => {
  const cheminJson = resolve(DIST, 'tutor', 'lesson-index.json');

  it('(a) dist/tutor/lesson-index.json existe et contient les 547 chunks', () => {
    expect(existsSync(cheminJson)).toBe(true);
    const donnees = JSON.parse(readFileSync(cheminJson, 'utf8')) as Array<{ id: string }>;
    expect(Array.isArray(donnees)).toBe(true);
    expect(donnees).toHaveLength(547);
    expect(typeof donnees[0]?.id).toBe('string');
  });

  it('(b) aucun chunk JS de dist/assets ne contient plus l’index en dur', () => {
    const assets = resolve(DIST, 'assets');
    expect(existsSync(assets)).toBe(true);
    const coupables: string[] = [];
    for (const f of readdirSync(assets)) {
      if (!f.endsWith('.js')) continue;
      const contenu = readFileSync(resolve(assets, f), 'utf8');
      if (contenu.includes('lhx_')) coupables.push(f);
    }
    expect(coupables).toEqual([]);
  });

  it('(c) le JSON est annoncé dans assets-manifest.json (précachage hors-ligne)', () => {
    const manifestPath = resolve(DIST, 'assets-manifest.json');
    expect(existsSync(manifestPath)).toBe(true);
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { assets: string[] };
    expect(manifest.assets).toContain('/tutor/lesson-index.json');
  });
});
