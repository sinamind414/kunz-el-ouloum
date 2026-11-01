#!/usr/bin/env tsx
// scripts/build_lesson_index.ts — génère src/data/lessonIndex.ts (GÉNÉRÉ).
//
// ENTRÉE : public/lessons/*.html (25 fichiers, 47 leçons après split) +
//          src/data/activeLessons.ts (20 leçons actives — via le builder).
// SORTIE : src/data/lessonIndex.ts — index plat de chunks ≤ 520 car. pour le
//          moteur tuteur (smartTutorEngine) + statistiques.
//
// NE PAS ÉDITER src/data/lessonIndex.ts à la main : relancer ce script.
// Verrou : src/data/lessonIndex.lock.test.ts (couverture + parité + ids).

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildLessonIndex, LESSON_INDEX_MAX } from '../src/data/lessonIndexBuilder';

const LESSONS_DIR = resolve(process.cwd(), 'public/lessons');
const OUT = resolve(process.cwd(), 'src/data/lessonIndex.ts');

function main(): void {
  const files = readdirSync(LESSONS_DIR)
    .filter((f) => f.endsWith('.html'))
    .sort();
  const htmlFiles: Record<string, string> = {};
  for (const f of files) {
    htmlFiles[f.replace(/\.html$/, '')] = readFileSync(resolve(LESSONS_DIR, f), 'utf-8');
  }

  const { chunks, stats } = buildLessonIndex(htmlFiles);

  const header = `// src/data/lessonIndex.ts — GÉNÉRÉ par scripts/build_lesson_index.ts — NE PAS ÉDITER À LA MAIN.
// Index des leçons (47 HTML passives + 20 actives TS) pour le moteur tuteur.
// Chunks ≤ ${LESSON_INDEX_MAX} caractères — verrou : src/data/lessonIndex.lock.test.ts.
// Régénérer : npx tsx scripts/build_lesson_index.ts

import type { LessonIndexChunk, LessonIndexStats } from './lessonIndexBuilder';

export type { LessonIndexChunk, LessonIndexStats };

export const LESSON_INDEX_STATS: LessonIndexStats = ${JSON.stringify(stats, null, 2)};

export const LESSON_INDEX: LessonIndexChunk[] = [
${chunks.map((c) => `  ${JSON.stringify(c)}`).join(',\n')},
];
`;

  writeFileSync(OUT, header, 'utf-8');
  const kb = (Buffer.byteLength(header, 'utf-8') / 1024).toFixed(1);
  process.stdout.write(
    `✓ lessonIndex.ts régénéré — ${stats.chunksTotal} chunks ` +
      `(html ${stats.chunksHtml} / active ${stats.chunksActive}), ` +
      `${stats.textCharsHtml + stats.textCharsActive} car., ${kb} Ko\n`,
  );
}

main();
