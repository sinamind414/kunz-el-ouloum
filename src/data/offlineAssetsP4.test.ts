// ============================================================
// offlineAssetsP4.test.ts — verrous P4 (audit arch F1/F5/F7) :
//   · F5 : plus d'URL googleusercontent dans src/ (hors-ligne)
//   · F1 : package.json identité réelle (react-example banni)
//   · F7 : Dockerfile aligné sur Node 22 (ci.yml immuable)
//   · orphelin : fiche v6 source dans docs/propositions/
// ============================================================
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf-8');

function walkSrc(dir: string, out: string[] = []): string[] {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkSrc(p, out);
    else if (/\.(ts|tsx|js|jsx|css)$/.test(ent.name)) out.push(p);
  }
  return out;
}

describe('P4 — F5 : zéro URL googleusercontent dans src/', () => {
  it('aucun fichier src/ ne contient googleusercontent', () => {
    // Ce fichier contient le littéral dans ses assertions → on l'exclut du scan.
    const self = path.join(root, 'src/data/offlineAssetsP4.test.ts');
    const files = walkSrc(path.join(root, 'src')).filter((f) => path.resolve(f) !== self);
    const bad = files.filter((f) => fs.readFileSync(f, 'utf-8').includes('googleusercontent'));
    expect(bad).toEqual([]);
  });

  it('DIAGRAM_* pointent vers /assets/images/schemas (local)', () => {
    const idx = read('src/data/index.ts');
    expect(idx).toContain('DIAGRAM_QUIZ_URL = "/assets/images/schemas/');
    expect(idx).toContain('DIAGRAM_FLASHCARD_URL = "/assets/images/schemas/');
    expect(idx).not.toContain('googleusercontent');
  });
});

describe('P4 — F1 : identité paquet', () => {
  it('package.json : kunz-el-ouloum 1.0.0, pas react-example', () => {
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.name).toBe('kunz-el-ouloum');
    expect(pkg.version).toBe('1.0.0');
    expect(pkg.dependencies.vite).toBeUndefined();
    expect(pkg.devDependencies.vite).toBeDefined();
  });

  it('README n’est plus le template AI Studio', () => {
    const rd = read('README.md');
    expect(rd).not.toContain('Run and deploy your AI Studio app');
    expect(rd).not.toContain('GEMINI_API_KEY');
    expect(rd).toContain('Kunz El Ouloum');
  });
});

describe('P4 — F7 : Dockerfile Node 22 (ci.yml immuable)', () => {
  it('aucun FROM node:20 dans le Dockerfile', () => {
    const df = read('Dockerfile');
    expect(df).not.toContain('node:20');
    expect(df).toContain('node:22-slim');
  });
});

describe('P4 — orphelin fiche v6', () => {
  it('al_miftah_final_v6.html vit dans docs/propositions/', () => {
    expect(fs.existsSync(path.join(root, 'docs/propositions/al_miftah_final_v6.html'))).toBe(true);
    expect(fs.existsSync(path.join(root, 'al_miftah_final_v6.html'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'public/miftah.html'))).toBe(true);
  });
});
