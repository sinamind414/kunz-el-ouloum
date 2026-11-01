import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  countLessonChapters,
  findChapterBlocks,
  getBaseLessonKey,
  getChapterIndexFromKey,
  isSplitLessonKey,
  sliceLessonHtml,
} from './lessonChapterSplit';
import { LESSON_HTML_GETTERS } from './lessonHtmlGetters';

const PHASE_BASE_KEYS = Object.keys(LESSON_HTML_GETTERS).filter(
  (key) => key.startsWith('phase') && getBaseLessonKey(key) === key
);

function readLessonHtml(baseKey: string): string {
  return readFileSync(resolve(process.cwd(), 'public', 'lessons', `${baseKey}.html`), 'utf-8');
}

describe('lessonChapterSplit — clés', () => {
  it('distingue une clé de base d\'une clé suffixée', () => {
    expect(isSplitLessonKey('phase1_chapitres_1_2')).toBe(false);
    expect(isSplitLessonKey('phase1_chapitres_1_2_2')).toBe(true);
  });

  it('retrouve la clé de base (fichier HTML source)', () => {
    expect(getBaseLessonKey('phase1_chapitres_1_2_2')).toBe('phase1_chapitres_1_2');
    expect(getBaseLessonKey('phase1_chapitres_1_2')).toBe('phase1_chapitres_1_2');
  });

  it('mappe la clé sur le numéro de leçon (1-based)', () => {
    expect(getChapterIndexFromKey('phase1_chapitres_1_2')).toBe(1);
    expect(getChapterIndexFromKey('phase1_chapitres_1_2_2')).toBe(2);
  });
});

describe('lessonChapterSplit — découpage', () => {
  it('retourne le HTML inchangé sans bloc chapter-view (leçon legacy)', () => {
    const legacy = '<html><body><div id="step1">x</div></body></html>';
    expect(sliceLessonHtml(legacy, 'lecon_transcription')).toBe(legacy);
    expect(countLessonChapters(legacy)).toBe(0);
  });

  it('retourne le HTML inchangé si un seul chapter-view', () => {
    const single = '<body><div id="ch1" class="chapter-view active"><p>a</p></div></body>';
    expect(sliceLessonHtml(single, 'phase1_chapitres_1_2')).toBe(single);
  });

  it('ne conserve que la 1re leçon pour la clé de base', () => {
    const html = [
      '<body>',
      '<div class="sommaire">',
      '<a href="#ch1-step1" id="link-ch1-step1">1-1</a>',
      '<span class="sep"></span>',
      '<a href="#ch2-step1" id="link-ch2-step1">2-1</a>',
      '</div>',
      '<div id="ch1" class="chapter-view active"><h1>Lecon 1</h1></div>',
      '<div id="ch2" class="chapter-view"><h1>Lecon 2</h1></div>',
      '</body>',
    ].join('');
    const out = sliceLessonHtml(html, 'phase1_chapitres_1_2');
    expect(countLessonChapters(out)).toBe(1);
    expect(out).toContain('Lecon 1');
    expect(out).not.toContain('Lecon 2');
    expect(out).not.toContain('link-ch2-step1');
    expect(out).not.toContain('<span class="sep">');
    expect(out).toContain('link-ch1-step1');
  });

  it('ne conserve que la 2e leçon pour la clé suffixée, et la marque active', () => {
    const html = [
      '<body>',
      '<div id="ch3" class="chapter-view active"><h1>Lecon 1</h1></div>',
      '<div id="ch4" class="chapter-view"><h1>Lecon 2</h1></div>',
      '</body>',
    ].join('');
    const out = sliceLessonHtml(html, 'phase2_chapitres_3_4_2');
    expect(countLessonChapters(out)).toBe(1);
    expect(out).not.toContain('Lecon 1');
    expect(out).toContain('Lecon 2');
    expect(out).toContain('<div id="ch4" class="chapter-view active">');
  });

  it('ignore un div imbriqué lors de la recherche de fin de chapitre', () => {
    const html = [
      '<body>',
      '<div id="ch1" class="chapter-view active"><div><p>a</p></div></div>',
      '<div id="ch2" class="chapter-view"><div><p>b</p></div></div>',
      '</body>',
    ].join('');
    expect(findChapterBlocks(html).map((b) => b.id)).toEqual(['ch1', 'ch2']);
    const out = sliceLessonHtml(html, 'phase1_chapitres_1_2_2');
    expect(out).not.toContain('<p>a</p>');
    expect(out).toContain('<p>b</p>');
  });

  it('nettoie le sommaire même quand les ids de blocs (ch19/ch20) diffèrent des sections (ch1/ch2)', () => {
    const html = [
      '<body>',
      '<div class="sommaire">',
      '<a href="#ch1-step1" id="link-ch1-step1">1-1</a>',
      '<a href="#ch1-step2" id="link-ch1-step2">1-2</a>',
      '<span class="sep"></span>',
      '<a href="#ch2-step1" id="link-ch2-step1">2-1</a>',
      '<a href="#ch2-step2" id="link-ch2-step2">2-2</a>',
      '</div>',
      '<div id="ch19" class="chapter-view active"><section class="card" id="ch1-step1">a1</section><section class="card" id="ch1-step2">a2</section></div>',
      '<div id="ch20" class="chapter-view"><section class="card" id="ch2-step1">b1</section><section class="card" id="ch2-step2">b2</section></div>',
      '</body>',
    ].join('');
    const first = sliceLessonHtml(html, 'phase10_chapitres_19_20');
    expect(first).toContain('link-ch1-step1');
    expect(first).toContain('link-ch1-step2');
    expect(first).not.toContain('link-ch2-step1');
    expect(first).not.toContain('link-ch2-step2');
    expect(first).not.toContain('<span class="sep">');
    const second = sliceLessonHtml(html, 'phase10_chapitres_19_20_2');
    expect(second).not.toContain('link-ch1-step1');
    expect(second).toContain('link-ch2-step1');
    expect(second).toContain('link-ch2-step2');
  });

  it('neutralise le script de navigation multi-chapitres', () => {
    const html = [
      '<body>',
      '<div id="ch1" class="chapter-view active"><p>a</p></div>',
      '<div id="ch2" class="chapter-view"><p>b</p></div>',
      '</body>',
    ].join('');
    const out = sliceLessonHtml(html, 'phase1_chapitres_1_2');
    expect(out).toContain('window.scrollToStep = function');
    expect(out.indexOf('window.scrollToStep = function')).toBeLessThan(out.lastIndexOf('</body>'));
  });
});

describe('lessonChapterSplit — fichiers réels (23 HTML)', () => {
  it('expose une clé de base ET une clé _2 pour chacune des 22 phases', () => {
    expect(PHASE_BASE_KEYS).toHaveLength(22);
    for (const base of PHASE_BASE_KEYS) {
      expect(LESSON_HTML_GETTERS, `${base}_2 sans getter`).toHaveProperty(`${base}_2`);
    }
  });

  it('chaque fichier de phase contient exactement 2 leçons', () => {
    const report: string[] = [];
    for (const base of PHASE_BASE_KEYS) {
      const count = countLessonChapters(readLessonHtml(base));
      if (count !== 2) report.push(`${base} → ${count} chapitre(s)`);
    }
    expect(report, 'Fichiers de phase sans 2 chapitres').toEqual([]);
  });

  it('isole une seule leçon par clé, sans fuite du sommaire', () => {
    const report: string[] = [];
    for (const base of PHASE_BASE_KEYS) {
      const html = readLessonHtml(base);
      const blocks = findChapterBlocks(html);
      for (const [index, key] of [
        [1, base],
        [2, `${base}_2`],
      ] as const) {
        const out = sliceLessonHtml(html, key);
        if (countLessonChapters(out) !== 1) {
          report.push(`${key} → ${countLessonChapters(out)} chapitre(s)`);
          continue;
        }
        if (!new RegExp(`<div id="${blocks[index - 1].id}" class="chapter-view active"`).test(out)) {
          report.push(`${key} → chapitre ${index} non actif`);
        }
        const droppedId = blocks[index === 1 ? 1 : 0].id;
        if (new RegExp(`id="link-${droppedId}-step\\d+"`).test(out)) {
          report.push(`${key} → lien de sommaire de ${droppedId} encore présent`);
        }
        // Les sections réelles sont en `ch1-step*`/`ch2-step*` quel que soit
        // l'id du bloc (`ch19`/`ch20`…) : après découpe il ne doit rester que
        // les 4 pastilles de la leçon affichée, toutes avec une icône.
        const keptPrefix = index === 1 ? 'ch1' : 'ch2';
        const droppedPrefix = index === 1 ? 'ch2' : 'ch1';
        if (new RegExp(`id="link-${droppedPrefix}-step\\d+"`).test(out)) {
          report.push(`${key} → pastilles ${droppedPrefix} encore présentes (8 au lieu de 4)`);
        }
        const keptLinks = out.match(new RegExp(`id="link-${keptPrefix}-step\\d+"`, 'g')) ?? [];
        if (keptLinks.length !== 4) {
          report.push(`${key} → ${keptLinks.length} pastille(s) ${keptPrefix} au lieu de 4`);
        }
        if (out.includes('<span class="sep"></span>')) {
          report.push(`${key} → séparateur de sommaire encore présent`);
        }
        if (out.length > html.length) {
          report.push(`${key} → sortie plus longue que la source`);
        }
      }
    }
    expect(report, 'Découpage de leçon incomplet').toEqual([]);
  });
});