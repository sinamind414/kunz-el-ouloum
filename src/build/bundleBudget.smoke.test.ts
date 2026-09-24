// bundleBudget.smoke.test.ts — verrou F2 (audit ARCHITECTURE §F2) :
//  1) toujours : l'entrée source ne tire plus quizCorpus ni les vues en statique ;
//  2) si dist/ existe (build local) : gzip(index-*.js) ≤ budget.
// CI (test:vitest) ne build pas — le smoke dist est skipIf, le lock source tourne partout.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const DIST_ASSETS = resolve(ROOT, 'dist', 'assets');
const HAS_DIST = existsSync(DIST_ASSETS);

// Budget : l'audit visait ≤ 250 kB gzip. Mesuré après F2 (lazy + quizCorpus sorti),
// on fige une marge de régression stricte. Serré volontairement.
const BUDGET_INDEX_GZIP_BYTES = 300 * 1024; // 300 kB gzip

describe('F2 — budget bundle & découpage source', () => {
  it("data/index.ts n'importe plus quizCorpus (corpus hors d'entrée)", () => {
    const src = readFileSync(resolve(ROOT, 'src', 'data', 'index.ts'), 'utf-8');
    // import/export réels uniquement — le commentaire F2 peut citer les symboles
    expect(src).not.toMatch(/from\s+['"]\.\.\/quizCorpus['"]/);
    expect(src).not.toMatch(/export\s+(const|let|var|\{)[^\n]*SVT_QUIZ_QUESTIONS/);
    expect(src).not.toMatch(/export\s+(const|let|var|\{)[^\n]*SVT_FLASHCARDS/);
    expect(src).not.toMatch(/import\s*\{[^}]*SVT_/);
  });

  it('App.tsx charge le corpus via import() dynamique uniquement', () => {
    const src = readFileSync(resolve(ROOT, 'src', 'App.tsx'), 'utf-8');
    // pas d'import statique du corpus
    expect(src).not.toMatch(/import\s*\{[^}]*SVT_QUIZ_QUESTIONS[^}]*\}\s*from/);
    expect(src).not.toMatch(/import\s*\{[^}]*SVT_FLASHCARDS[^}]*\}\s*from/);
    expect(src).toMatch(/import\(['"]\.\/data\/quizBank['"]\)/);
  });

  it('App.tsx lazy-load au moins 15 vues (zero import statique des vues métier)', () => {
    const src = readFileSync(resolve(ROOT, 'src', 'App.tsx'), 'utf-8');
    const lazyCount = (src.match(/lazy\(\(\)\s*=>\s*import\(/g) ?? []).length;
    expect(lazyCount, `${lazyCount} lazy() trouvés`).toBeGreaterThanOrEqual(15);
    // les vues lourdes ne doivent plus être importées statiquement
    for (const heavy of [
      'MethodologyCompilerView',
      'StatsView',
      'AITutorView',
      'MindMapView',
      'LessonsView',
      'LessonTwoView',
      'CombatTrainerView',
    ]) {
      expect(
        src,
        `${heavy} encore importé statiquement`,
      ).not.toMatch(new RegExp(`import\\s+${heavy}\\s+from`));
    }
  });

  it.skipIf(!HAS_DIST)("gzip(index-*.js) ≤ budget d'entrée", () => {
    const files = readdirSync(DIST_ASSETS);
    const main = files.find((f) => /^index-.*\.js$/.test(f));
    expect(main, 'bundle principal index-*.js manquant').toBeDefined();
    const raw = readFileSync(resolve(DIST_ASSETS, main!));
    const gz = gzipSync(raw, { level: 9 }).length;
    const msg = `index-*.js = ${(raw.length / 1024).toFixed(0)} kB raw / ${(gz / 1024).toFixed(0)} kB gzip (budget ${(BUDGET_INDEX_GZIP_BYTES / 1024).toFixed(0)} kB)`;
    expect(gz, msg).toBeLessThanOrEqual(BUDGET_INDEX_GZIP_BYTES);
  });

  it.skipIf(!HAS_DIST)('quizCorpus est hors du chunk principal', () => {
    const files = readdirSync(DIST_ASSETS);
    const main = files.find((f) => /^index-.*\.js$/.test(f));
    expect(main).toBeDefined();
    const src = readFileSync(resolve(DIST_ASSETS, main!), 'utf-8');
    // marqueur distinctive d'une carte flashcard collège déplacée vers quizBank
    // (texte long et stable dans l'ancien data/index.ts)
    expect(src, 'marqueur quizBank encore dans index-*.js').not.toContain(
      'اشرح باختصار آلية الاستنساخ',
    );
    // le corpus QCM doit exister dans un chunk séparé (lazy route ou quiz-corpus)
    const hasCorpusChunk = files.some((f) => {
      if (!f.endsWith('.js')) return false;
      if (f.startsWith('index-')) return false;
      const body = readFileSync(resolve(DIST_ASSETS, f), 'utf-8');
      return body.includes('اشرح باختصار آلية الاستنساخ');
    });
    expect(hasCorpusChunk, 'aucun chunk ne porte le corpus flashcards').toBe(true);
  });
});
