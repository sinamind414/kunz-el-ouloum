// lessonSourceF4.test.ts — verrou F4 (audit ARCHITECTURE §F4) :
//   UN seul chemin de distribution pour le HTML des leçons.
//   Choix actuel (P5) : content/lessons/*.html → import('…?raw') → iframe srcdoc.
//   Interdits : public/lessons, dist/lessons, fetch('/lessons/…'), double copie.
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf-8');
const exists = (rel: string) => fs.existsSync(path.join(root, rel));

const LESSONS_DIR = path.join(root, 'content', 'lessons');
const GETTERS = read('src/data/lessonHtmlGetters.ts');

function walkSrc(dir: string, out: string[] = []): string[] {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkSrc(p, out);
    else if (/\.(ts|tsx|js|jsx)$/.test(ent.name)) out.push(p);
  }
  return out;
}

describe('F4 — source unique des leçons HTML', () => {
  it('content/lessons : exactement 25 fichiers HTML', () => {
    expect(exists('content/lessons')).toBe(true);
    const files = fs.readdirSync(LESSONS_DIR).filter((f) => f.endsWith('.html'));
    expect(files.length).toBe(25);
  });

  it('zéro copie dans public/lessons et dist/lessons (dual-path interdit)', () => {
    expect(exists(path.join(root, 'public', 'lessons'))).toBe(false);
    expect(exists(path.join(root, 'dist', 'lessons'))).toBe(false);
  });

  it('getters : bijection stricte disque ↔ imports ?raw (25 ↔ 25, tout content/)', () => {
    const disk = new Set(
      fs.readdirSync(LESSONS_DIR)
        .filter((f) => f.endsWith('.html'))
        .map((f) => f.replace(/\.html$/, '')),
    );
    const refs = Array.from(
      GETTERS.matchAll(/import\(['"]\.\.\/\.\.\/(content|public)\/lessons\/([A-Za-z0-9_]+)\.html\?raw['"]\)/g),
    );
    // aucune référence ne doit pointer ailleurs que content/
    const wrongRoot = refs.filter((m) => m[1] !== 'content').map((m) => m[0]);
    expect(wrongRoot, `imports hors content/lessons: ${wrongRoot.join(', ')}`).toEqual([]);

    const refNames = new Set(refs.map((m) => m[2]));
    const diskNotRef = [...disk].filter((n) => !refNames.has(n)).sort();
    const refNotDisk = [...refNames].filter((n) => !disk.has(n)).sort();
    expect(diskNotRef, 'fichiers disque jamais importés').toEqual([]);
    expect(refNotDisk, 'imports vers fichier absent').toEqual([]);
    expect(refNames.size).toBe(25);
    // pas de littéral public/lessons dans les getters
    expect(GETTERS).not.toContain('public/lessons');
  });

  it('aucun fetch/XHR vers /lessons/ dans le code applicatif', () => {
    const self = path.join(root, 'src/data/lessonSourceF4.test.ts');
    const files = walkSrc(path.join(root, 'src')).filter((f) => path.resolve(f) !== self);
    const violations: string[] = [];
    for (const f of files) {
      const body = fs.readFileSync(f, 'utf-8');
      // chemin réseau vers des HTML de leçons (pas les clés de séquence)
      if (/fetch\s*\(\s*[`'"]\/lessons\//.test(body) || /['"`]\/lessons\/[^'"`]+\.html['"`]/.test(body)) {
        violations.push(path.relative(root, f));
      }
    }
    expect(violations).toEqual([]);
  });

  it('HtmlLessonViewer ne charge QUE via LESSON_HTML_GETTERS (pas de fetch parallèle)', () => {
    const viewer = read('src/components/HtmlLessonViewer.tsx');
    expect(viewer).toContain('LESSON_HTML_GETTERS');
    expect(viewer).toContain('srcDoc');
    expect(viewer).not.toMatch(/fetch\s*\(/);
    expect(viewer).not.toMatch(/XMLHttpRequest/);
  });

  it('SW ne référence aucune URL /lessons/*.html hors commentaires', () => {
    const code = read('public/sw.js').replace(/^\s*\/\/.*$/gm, '');
    expect(code).not.toMatch(/['"`]\/lessons\//);
    expect(code).not.toMatch(/lessons\/.*\.html/);
  });

  it('chaque getter runtime résout un fichier disque (smoke import catalogue)', async () => {
    const { LESSON_HTML_GETTERS } = await import('./lessonHtmlGetters');
    const keys = Object.keys(LESSON_HTML_GETTERS);
    expect(keys.length).toBeGreaterThanOrEqual(47); // 25 bases + clés _2
    // Spot-check : le premier getter charge du HTML non vide
    const mod = await LESSON_HTML_GETTERS[keys[0]]();
    expect(typeof mod.default).toBe('string');
    expect(mod.default.length).toBeGreaterThan(100);
    expect(mod.default).toContain('<');
  });
});

// Après build local : dist/ ne doit pas recréer un second arbre /lessons.
const HAS_DIST = exists('dist');
describe.skipIf(!HAS_DIST)('F4 — dist après build', () => {
  it('aucun dist/lessons/*.html (leçons seulement en chunks ?raw)', () => {
    const lessonsOut = path.join(root, 'dist', 'lessons');
    if (!fs.existsSync(lessonsOut)) return; // absent = conforme
    const html = fs.readdirSync(lessonsOut).filter((f) => f.endsWith('.html'));
    expect(html, `HTML servis depuis dist/lessons: ${html.join(', ')}`).toEqual([]);
  });
});
