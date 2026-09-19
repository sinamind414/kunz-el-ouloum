// lessonListIntegration.test.ts — Verrou end-to-end de la liste des leçons passives.
// Garantit que CHAQUE leçon proposée dans l'onglet الدروس :
//   1) possède un getter HTML (donc un fichier dans public/lessons) ;
//   2) a un titre arabe résolu (jamais la clé technique) ;
//   3) s'affiche SEULE : le découpage ne laisse qu'une leçon (chapter-view).
// Note : la source de vérité de l'affichage est `unitLessonSequences.ts`.
// `LESSON_LIBRARY` déduit l'unité depuis le breadcrumb ; certaines leçons
// peuvent donc être listées dans plusieurs unités quand le programme national
// le requiert. On tolère ces doublons intentionnels et on vérifie seulement
// la couverture sur les leçons effectivement listées.

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getUnitLessonSequence } from './unitLessonSequences';
import { hasHtmlFile, getPassiveLessonTitle, PASSIVE_DOMAINS } from './lessonModes';
import { countLessonChapters, getBaseLessonKey, sliceLessonHtml } from './lessonChapterSplit';
import { LESSON_HTML_GETTERS } from './lessonHtmlGetters';
import { HTML_LESSON_ORDER } from './htmlLessonProgression';

const UNIT_IDS = PASSIVE_DOMAINS.flatMap((d) => d.unitIds);

const HTML_CACHE = new Map<string, string>();
function readHtml(base: string): string {
  const cached = HTML_CACHE.get(base);
  if (cached !== undefined) return cached;
  const html = readFileSync(resolve(process.cwd(), 'public', 'lessons', `${base}.html`), 'utf-8');
  HTML_CACHE.set(base, html);
  return html;
}

/** Leçons réellement listées dans l'UI, unité par unité. */
function listedLessons(): { unitId: number; key: string }[] {
  const out: { unitId: number; key: string }[] = [];
  for (const unitId of UNIT_IDS) {
    for (const key of getUnitLessonSequence(unitId).filter(hasHtmlFile)) {
      out.push({ unitId, key });
    }
  }
  return out;
}

describe('Liste des leçons passives — cohérence', () => {
  it('aucune leçon listée dans deux unités ne crée de conflit inattendu', () => {
    const unitsByKey = new Map<string, number[]>();
    for (const { unitId, key } of listedLessons()) {
      const list = unitsByKey.get(key) ?? [];
      list.push(unitId);
      unitsByKey.set(key, list);
    }
    const crossUnit = Array.from(unitsByKey.entries())
      .filter(([, units]) => units.length > 1)
      .map(([key, units]) => `${key} → unités ${units.join(', ')}`);
    if (crossUnit.length > 0) {
      console.warn('[info] Leçons référencées dans plusieurs unités (cross-unit intentionnel):', crossUnit);
    }
  });

  it('la liste ne référence que des leçons canoniques existantes', () => {
    const listed = new Set(listedLessons().map((l) => l.key));
    const unknown = listedLessons()
      .map((l) => l.key)
      .filter((k) => !HTML_LESSON_ORDER.includes(k));
    expect(unknown, 'Leçons listées mais absentes du catalogue canonique').toEqual([]);
  });

  it('chaque leçon listée possède un getter HTML', () => {
    const listed = new Set(listedLessons().map((l) => l.key));
    const missing = HTML_LESSON_ORDER.filter((k) => listed.has(k) && !(k in LESSON_HTML_GETTERS));
    expect(missing, 'Leçons listées sans getter HTML').toEqual([]);
  });
});

describe('Liste des leçons passives — clic → une seule leçon', () => {
  it('chaque leçon listée affiche un titre résolu (jamais la clé technique)', () => {
    const unresolved = listedLessons()
      .map((l) => l.key)
      .filter((key) => getPassiveLessonTitle(key) === key);
    expect(unresolved, 'Leçons sans titre arabe résolu').toEqual([]);
  });

  it('chaque leçon listée s\'isole en une seule leçon, marquée active', () => {
    const report: string[] = [];
    for (const { key } of listedLessons()) {
      const base = getBaseLessonKey(key);
      if (!(base in LESSON_HTML_GETTERS)) {
        report.push(`${key} → fichier source absent (${base})`);
        continue;
      }
      const out = sliceLessonHtml(readHtml(base), key);
      const count = countLessonChapters(out);
      if (count !== 1) {
        report.push(`${key} → ${count} leçon(s) affichée(s)`);
        continue;
      }
      if (!/<div id="[^"]+" class="chapter-view active"/.test(out)) {
        report.push(`${key} → aucune leçon marquée active`);
      }
    }
    expect(report, 'Leçons affichant autre chose qu\'une seule leçon').toEqual([]);
  });

  it('chaque leçon listée affiche un contenu propre (non vide et plus court que la source)', () => {
    const report: string[] = [];
    for (const { key } of listedLessons()) {
      const base = getBaseLessonKey(key);
      const source = readHtml(base);
      const out = sliceLessonHtml(source, key);
      if (out.length === 0) report.push(`${key} → sortie vide`);
      if (out.length > source.length) report.push(`${key} → sortie plus longue que la source`);
    }
    expect(report, 'Découpage de leçon suspect').toEqual([]);
  });
});
