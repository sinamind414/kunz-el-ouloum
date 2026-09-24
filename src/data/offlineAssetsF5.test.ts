// offlineAssetsF5.test.ts — verrou F5 final (audit ARCHITECTURE §F5) :
//   · toute URL de contenu image dans src/ est same-origin (chemin /…)
//   · zéro hôte tiers image (unsplash, googleusercontent, transparenttextures…)
//   · DIAGRAM_* + tous les diagramUrl du corpus pointent vers des fichiers EXISTANTS
//   · decor/ local présent pour les vues qui illustraient hors-ligne
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf-8');
const exists = (rel: string) => fs.existsSync(path.join(root, rel));

function walkSrc(dir: string, out: string[] = []): string[] {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkSrc(p, out);
    else if (/\.(ts|tsx|js|jsx|css)$/.test(ent.name)) out.push(p);
  }
  return out;
}

/** Hôtes image tiers interdits dans le code applicatif (hors tests). */
const FORBIDDEN_IMAGE_HOSTS = [
  'googleusercontent.com',
  'images.unsplash.com',
  'transparenttextures.com',
  'lh3.googleusercontent.com',
];

describe('F5 — contenu image same-origin (hors-ligne)', () => {
  it('aucun hôte image tiers dans src/ (hors tests)', () => {
    const self = path.join(root, 'src/data/offlineAssetsF5.test.ts');
    const files = walkSrc(path.join(root, 'src')).filter((f) => {
      const r = path.resolve(f);
      if (r === self) return false;
      // les verrous P4/P5 citent les littéraux dans leurs assertions
      if (r.endsWith('offlineAssetsP4.test.ts')) return false;
      return true;
    });
    const violations: string[] = [];
    for (const f of files) {
      const body = fs.readFileSync(f, 'utf-8');
      for (const host of FORBIDDEN_IMAGE_HOSTS) {
        if (body.includes(host)) violations.push(`${path.relative(root, f)} → ${host}`);
      }
    }
    expect(violations).toEqual([]);
  });

  it('DIAGRAM_* local + fichier présent sur disque', () => {
    const idx = read('src/data/index.ts');
    const diagrams = Array.from(idx.matchAll(/DIAGRAM_\w+_URL = "([^"]+)"/g)).map((m) => m[1]);
    expect(diagrams.length).toBeGreaterThanOrEqual(2);
    for (const u of diagrams) {
      expect(u.startsWith('/'), `DIAGRAM absolu non local: ${u}`).toBe(true);
      expect(u).not.toMatch(/^https?:/);
      expect(exists(path.join('public', u)), `fichier manquant: ${u}`).toBe(true);
    }
  });

  it('tous les diagramUrl de quizCorpus sont same-origin et existent', () => {
    const corpus = read('src/quizCorpus.ts');
    const urls = Array.from(new Set(
      Array.from(corpus.matchAll(/"(\/assets\/[^"]+)"/g)).map((m) => m[1]),
    ));
    expect(urls.length).toBeGreaterThanOrEqual(20);
    const missing: string[] = [];
    for (const u of urls) {
      expect(u.startsWith('/assets/'), `hors /assets/: ${u}`).toBe(true);
      if (!exists(path.join('public', u))) missing.push(u);
    }
    expect(missing, `diagrammes absents du disque: ${missing.join(', ')}`).toEqual([]);
  });

  it('decor local pour UnitIntroPortal / CombatChallengePortal', () => {
    const decor = [
      'public/assets/images/decor/unit_intro_spider_silk.svg',
      'public/assets/images/decor/unit_intro_cell.svg',
      'public/assets/images/decor/unit_intro_dna_rna.svg',
    ];
    for (const f of decor) {
      expect(exists(f), `decor manquant: ${f}`).toBe(true);
    }
    const portal = read('src/components/UnitIntroPortal.tsx');
    expect(portal).toContain('/assets/images/decor/unit_intro_spider_silk.svg');
    expect(portal).not.toContain('images.unsplash.com');
    const combat = read('src/components/CombatChallengePortal.tsx');
    expect(combat).not.toContain('images.unsplash.com');
    expect(combat).toContain('/assets/images/decor/unit_intro_cell.svg');
    const badges = read('src/components/BadgesView.tsx');
    expect(badges).not.toContain('transparenttextures.com');
  });

  it('src/index.css ne pointe que des polices (pas d’image tiers) — images zéro https', () => {
    // Les @import Google Fonts restent un choix typo (hors périmètre image F5) ;
    // on verrouille qu'aucune url(https://…png/jpg/svg) n'apparaît dans le CSS.
    const css = read('src/index.css');
    expect(css).not.toMatch(/url\(\s*['"]?https?:\/\/[^)'"]+\.(png|jpe?g|svg|webp|gif)/i);
  });
});
