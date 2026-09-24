// src/data/lessonIndex.lock.test.ts — verrou de l'index des leçons (généré par
// scripts/build_lesson_index.ts).
// Fige : parité exacte avec la reconstruction depuis les sources (public/lessons
// + activeLessons), couverture intégrale du texte de chaque groupe (card /
// leçon active), chunks ≤ 520 car., ids uniques, 47 clés HTML + 20 actives,
// stats cohérentes.
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LESSON_INDEX, LESSON_INDEX_STATS, LESSON_INDEX_MAX } from './lessonIndex';
import {
  buildLessonIndex,
  groupCovered,
  LESSON_INDEX_MAX as BUILDER_MAX,
} from './lessonIndexBuilder';
import { HTML_LESSON_ORDER } from './htmlLessonProgression';
import { ACTIVE_LESSONS } from './activeLessons';

const LESSONS_DIR = resolve(process.cwd(), 'public/lessons');

function readHtmlFiles(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of readdirSync(LESSONS_DIR).filter((x) => x.endsWith('.html')).sort()) {
    out[f.replace(/\.html$/, '')] = readFileSync(resolve(LESSONS_DIR, f), 'utf-8');
  }
  return out;
}

const rebuilt = buildLessonIndex(readHtmlFiles());

describe('lessonIndex — parité avec la reconstruction depuis les sources', () => {
  it('le fichier généré est IDENTIQUE à la régénération (ids, ordre, textes, keywords)', () => {
    expect(LESSON_INDEX).toEqual(rebuilt.chunks);
  });

  it('LESSON_INDEX_MAX === 520 (granularité okacha)', () => {
    expect(LESSON_INDEX_MAX).toBe(520);
    expect(BUILDER_MAX).toBe(520);
  });

  it('stats du fichier == stats reconstruites', () => {
    expect(LESSON_INDEX_STATS).toEqual(rebuilt.stats);
  });
});

describe('lessonIndex — couverture intégrale des sources', () => {
  it('chaque groupe (card HTML / leçon active) est couvert par ses parties', () => {
    expect(rebuilt.coverage.length).toBeGreaterThan(0);
    const misses = rebuilt.coverage.filter((g) => !groupCovered(g.source, g.parts));
    expect(
      misses.map((m) => m.key),
      `groupes non couverts: ${misses.map((m) => m.key).join(', ')}`,
    ).toEqual([]);
  });

  it('47 clés HTML et 20 leçons actives représentées', () => {
    const htmlKeys = new Set(LESSON_INDEX.filter((c) => c.kind === 'html').map((c) => c.lessonKey));
    const activeKeys = new Set(
      LESSON_INDEX.filter((c) => c.kind === 'active').map((c) => c.lessonKey),
    );
    expect(htmlKeys.size).toBe(HTML_LESSON_ORDER.length);
    expect(htmlKeys).toEqual(new Set(HTML_LESSON_ORDER));
    expect(activeKeys.size).toBe(Object.keys(ACTIVE_LESSONS).length);
    expect(activeKeys).toEqual(new Set(Object.keys(ACTIVE_LESSONS)));
  });
});

describe('lessonIndex — forme des chunks', () => {
  it('tous les chunks font ≤ 520 caractères et ≥ 20 caractères (seuil builder)', () => {
    for (const c of LESSON_INDEX) {
      expect(c.text.length, `${c.id} trop long`).toBeLessThanOrEqual(520);
      expect(c.text.length, `${c.id} trop court`).toBeGreaterThanOrEqual(20);
    }
  });

  it('ids uniques et préfixes corrects (lhx_ / lha_)', () => {
    const ids = LESSON_INDEX.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of LESSON_INDEX) {
      expect(c.id.startsWith(c.kind === 'html' ? 'lhx_' : 'lha_'), c.id).toBe(true);
      expect(c.part).toBeGreaterThanOrEqual(1);
      expect(c.total).toBeGreaterThanOrEqual(c.part);
    }
  });

  it('pas de residue HTML ni de chemin asset dans les textes', () => {
    for (const c of LESSON_INDEX) {
      expect(c.text, c.id).not.toMatch(/<\/?[a-z][^>]*>/i);
      expect(c.text, c.id).not.toMatch(/\/assets\//);
      expect(c.text, c.id).not.toMatch(/scrollToStep|onclick=/);
    }
  });

  it('keywords : ≤ 18, longueur ≥ 3, non vides ; unitId ≥ 0', () => {
    for (const c of LESSON_INDEX) {
      expect(c.keywords.length, c.id).toBeLessThanOrEqual(18);
      for (const kw of c.keywords) expect(kw.length, `${c.id}/${kw}`).toBeGreaterThanOrEqual(3);
      expect(c.unitId).toBeGreaterThanOrEqual(0);
      expect(c.title.length).toBeGreaterThan(0);
    }
  });
});
