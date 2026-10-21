// tutorLeconsJson.lock.test.ts — verrou « Phase A découpage bundle » (2026-10-16).
//
// L'index des leçons du tuteur (src/data/lessonIndex.ts, ≈ 833 Ko sur disque,
// 578 chunks) n'a plus le droit de voyager en JavaScript. Il est émis par le
// build en `dist/tutor/lesson-index.json` et récupéré par fetch au premier
// montage d'une vue du tuteur (AITutorView, SearchView).
//
// Ce contrôle vit avec les autres contrôles post-build (`npm run test:build`)
// car il lit `dist/`, pas le code source :
//   (a) le JSON émis existe, est le contenu EXACT de l'index généré
//       (578 chunks — H2 2026-10-21 : +16 chunks pour les 2 leçons actives U11
//       dédiées d3-u11-l2-wilson et d3-u11-l3-ophiolites ; l'ancien verrou 562
//       datait d'avant H2 — l'ancien verrou 547 datait d'avant l'ajout des 11
//       leçons — audit 2026-10-17) ;
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

  it('(a) dist/tutor/lesson-index.json existe et contient les 578 chunks', () => {
    expect(existsSync(cheminJson)).toBe(true);
    const donnees = JSON.parse(readFileSync(cheminJson, 'utf8')) as Array<{ id: string }>;
    expect(Array.isArray(donnees)).toBe(true);
    expect(donnees).toHaveLength(578);
    expect(typeof donnees[0]?.id).toBe('string');
  });

  it('(a2) dist/tutor/knowledge.json existe et contient les 428 chunks opuscules', () => {
    // Phase B découpage bundle (2026-10-16) : tutorKnowledge.ts (472 Ko,
    // 428 chunks — comptés à HEAD) subit le même traitement que l'index.
    const cheminOpus = resolve(DIST, 'tutor', 'knowledge.json');
    expect(existsSync(cheminOpus)).toBe(true);
    const donnees = JSON.parse(readFileSync(cheminOpus, 'utf8')) as Array<{ id: string }>;
    expect(Array.isArray(donnees)).toBe(true);
    expect(donnees).toHaveLength(428);
  });

  it('(b) aucun chunk JS de dist/assets ne contient plus l’index en dur', () => {
    const assets = resolve(DIST, 'assets');
    expect(existsSync(assets)).toBe(true);
    const coupables: string[] = [];
    for (const f of readdirSync(assets)) {
      if (!f.endsWith('.js')) continue;
      const contenu = readFileSync(resolve(assets, f), 'utf8');
      if (contenu.includes('lhx_') || contenu.includes('"chunk_1"')) coupables.push(f);
    }
    expect(coupables).toEqual([]);
  });

  it('(c) les deux JSON sont annoncés dans assets-manifest.json (précachage hors-ligne)', () => {
    const manifestPath = resolve(DIST, 'assets-manifest.json');
    expect(existsSync(manifestPath)).toBe(true);
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { assets: string[] };
    expect(manifest.assets).toContain('/tutor/lesson-index.json');
    expect(manifest.assets).toContain('/tutor/knowledge.json');
  });
});
