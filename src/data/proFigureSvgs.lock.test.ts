// proFigureSvgs.lock.test.ts — Phase 2 ProFigure : verrous des 112 SVG standalone.
//
// Risque n°1 : une normalisation ratée (référence #… orpheline, id non préfixé,
// aria absent) casserait un schéma au moment exact où l'élève le consulte.
// Chaque invariant ci-dessous est un garde-fou du contrat normalizeStandaloneSvgs :
//   classe pfe-figure · role=img · viewBox · aria-label · ids pf- · refs résolues.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const RACINE = resolve(__dirname, '../..');
const DOSSIERS = ['public/assets/images/schemas', 'public/assets/svt'];

function listSvg(): string[] {
  const out: string[] = [];
  for (const d of DOSSIERS) {
    const walk = (dir: string): void => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.name.endsWith('.svg')) out.push(p);
      }
    };
    walk(join(RACINE, d));
  }
  return out.sort();
}

const FILES = listSvg();

const idsOf = (svg: string): Set<string> => {
  const ids = new Set<string>();
  const re = /(?<![-\w:])id="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(svg)) !== null) ids.add(m[1]);
  return ids;
};

describe('ProFigure SVG standalone — périmètre', () => {
  it('les 112 fichiers sont présents (110 schémas + 2 cibles svt)', () => {
    expect(FILES).toHaveLength(112);
  });

  it('le manifeste ne cite que des fichiers existants', () => {
    const manifeste = JSON.parse(
      readFileSync(resolve(RACINE, 'public/assets/images/schemas/manifest.json'), 'utf8'),
    ) as { assets: string[] };
    for (const a of manifeste.assets) {
      expect(existsSync(join(RACINE, 'public', a)), `manifeste → ${a}`).toBe(true);
    }
  });
});

describe('ProFigure SVG standalone — contrat de normalisation', () => {
  it('chaque svg porte class pfe-figure, role=img et un viewBox', () => {
    for (const f of FILES) {
      const svg = readFileSync(f, 'utf8');
      const root = svg.match(/<svg\b[^>]*>/)?.[0] ?? '';
      expect(/\bpfe-figure\b/.test(root), `${f} : classe pfe-figure`).toBe(true);
      expect(/\srole="img"/.test(root), `${f} : role img`).toBe(true);
      expect(/\sviewBox="/.test(root), `${f} : viewBox`).toBe(true);
    }
  });

  it("chaque svg porte un aria-label (repris d'un contenu existant)", () => {
    for (const f of FILES) {
      const root = readFileSync(f, 'utf8').match(/<svg\b[^>]*>/)?.[0] ?? '';
      const label = root.match(/\saria-label="([^"]+)"/)?.[1] ?? '';
      expect(label.trim().length, `${f} : aria-label vide`).toBeGreaterThanOrEqual(1);
    }
  });

  it('tous les ids sont préfixés pf-', () => {
    for (const f of FILES) {
      for (const id of idsOf(readFileSync(f, 'utf8'))) {
        expect(id.startsWith('pf-'), `${f} : id "${id}" sans préfixe pf-`).toBe(true);
      }
    }
  });

  it('toutes les références internes url(#…) et href="#…" résolvent', () => {
    for (const f of FILES) {
      const svg = readFileSync(f, 'utf8');
      const ids = idsOf(svg);
      for (const m of svg.matchAll(/url\((["']?)#([^)"']+)\1\)/g)) {
        expect(ids.has(m[2]), `${f} : url(#${m[2]}) orphelin`).toBe(true);
      }
      for (const m of svg.matchAll(/(?:xlink:)?href=(["'])#([^"']+)\1/g)) {
        expect(ids.has(m[2]), `${f} : href="#${m[2]}" orphelin`).toBe(true);
      }
    }
  });

  it('le marqueur arrow existe dans chaque fichier qui le référence', () => {
    for (const f of FILES) {
      const svg = readFileSync(f, 'utf8');
      if (svg.includes('url(#arrow)') || svg.includes('url(#pf-arrow)')) {
        expect(idsOf(svg).has('pf-arrow'), `${f} : marker pf-arrow manquant`).toBe(true);
      }
    }
  });
});
