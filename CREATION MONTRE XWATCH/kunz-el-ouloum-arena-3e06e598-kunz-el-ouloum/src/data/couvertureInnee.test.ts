// couvertureInnee.test.ts — verrou B4 (audit « ligne par ligne », 2026-10-17).
//
// DÉFAUT : le bloc « المناعة الفطرية / المناعة غير النوعية » de l'unité 4 était
// ABSENT des 25 leçons — mesure du 2026-10-17 (scripts jetables b4-*):
//   الالتهاب · البلعمة · العدلات · الهيستامين · المتممة · الحمى ·
//   الخلايا القاتلة الطبيعية · الإنترفيرون · المناعة الفطرية / غير النوعية
// = 0 occurrence dans public/lessons/*.html, alors que 19 QCM U4 du corpus
// portent sur ces mécanismes (Q114-Q159 : question/option/explication).
// Un élève rév prepares l'unité مناعة dans l'app ne pouvait donc PAS répondre
// à une part entière du QCM — trou de couverture déjà signalé par l'audit
// externe (AUDIT_EXTERNE_8_AXES H5, « le risque pédagogique principal »).
//
// FIX : carte d'ouverture « دفاعات غير نوعية » ajoutée à la leçon U4
// phase5_chapitres_9_10.html (chapitre 9, avant l'étude du CMH) + index du
// tuteur régénéré. Ce verrou garantit que les 10 termes restent SERVICE, dans
// le HTML ET dans l'index du tuteur (rapport dans les chunkages).
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LESSON_INDEX } from './lessonIndex';

const LESSONS_DIR = resolve(__dirname, '../../public/lessons');

const norm = (s: string) =>
  s
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآا]/g, 'ا')
    .replace(/ى/g, 'ي');

const CORPUS = norm(
  readdirSync(LESSONS_DIR)
    .filter((f) => f.endsWith('.html'))
    .map((f) => readFileSync(resolve(LESSONS_DIR, f), 'utf8'))
    .join(''),
);

// Les 10 mécanismes/termes exigibles de U4 (bloc innée + interféron/NK).
const TERMES_EXIGIBLES_U4 = [
  'المناعة الفطرية',
  'المناعة غير النوعية',
  'الالتهاب',
  'البلعمة',
  'العدلات',
  'الهيستامين',
  'المتممة',
  'الحمى',
  'الخلايا القاتلة الطبيعية',
  'الإنترفيرون',
];

describe('B4 — couverture du bloc المناعة الفطرية (U4)', () => {
  it('les 10 termes non-type-specifiques existent dans les leçons HTML', () => {
    for (const t of TERMES_EXIGIBLES_U4) {
      expect(CORPUS.includes(norm(t)), `terme absent des leçons : ${t}`).toBe(true);
    }
  });

  it('l index du tuteur (lessonIndex) contient aussi ces termes', () => {
    const texteIndex = norm(LESSON_INDEX.map((c) => c.text).join(' '));
    for (const t of TERMES_EXIGIBLES_U4) {
      expect(texteIndex.includes(norm(t)), `terme absent de lessonIndex : ${t}`).toBe(true);
    }
  });

  it('la carte ajoutée est bien dans la leçon U4 (phase5_chapitres_9_10)', () => {
    const lecon = readFileSync(
      resolve(LESSONS_DIR, 'phase5_chapitres_9_10.html'),
      'utf8',
    );
    expect(lecon.includes('ch1-step0')).toBe(true);
    const chunksLecon = LESSON_INDEX.filter((c) => c.lessonKey === 'phase5_chapitres_9_10');
    expect(chunksLecon.length).toBeGreaterThan(0);
    const texteLecon = norm(chunksLecon.map((c) => c.text).join(' '));
    expect(texteLecon.includes(norm('الالتهاب'))).toBe(true);
    expect(texteLecon.includes(norm('البلعمة'))).toBe(true);
  });
});
