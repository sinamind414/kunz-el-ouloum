// ============================================================
// offlineAssetsP5.test.ts — verrous P5 (F4 dé-duplication leçons) :
//   · sources UNIQUEMENT dans content/lessons/ (pas de public/lessons)
//   · zéro entrée /lessons/* dans le precache SW
//   · getters ?raw pointent content/lessons
// ============================================================
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf-8');

describe('P5 — F4 : sources de leçons hors public/, SW sans /lessons/*', () => {
  it('public/lessons n’existe plus (source unique content/lessons)', () => {
    expect(fs.existsSync(path.join(root, 'public', 'lessons'))).toBe(false);
    const n = fs.readdirSync(path.join(root, 'content', 'lessons')).filter((f) => f.endsWith('.html')).length;
    expect(n).toBe(25);
  });

  it('sw.js ne précache aucune URL /lessons/*', () => {
    const sw = read('public/sw.js');
    // exclut les commentaires explicatifs du correctif
    const code = sw.replace(/^\s*\/\/.*$/gm, '');
    expect(code.includes("'/lessons/")).toBe(false);
  });

  it('lessonHtmlGetters pointe content/lessons (zéro public/lessons)', () => {
    const getters = read('src/data/lessonHtmlGetters.ts');
    expect(getters.includes("public/lessons")).toBe(false);
    expect(getters.includes("content/lessons")).toBe(true);
  });
});
