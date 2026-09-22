// Test du fix « 🗺 المخطط ne s'affiche pas sur l'application » (2026-09-22).
//
// CAUSE RACINE : la zone de synthèse (🏛 حصيلة + 🗺 مخطط) vivait À L'INTÉRIEUR du
// dernier <div class="chapter-view"> (la leçon 2 du fichier). sliceLessonHtml
// isole UNE leçon par rendu → la leçon 1 (clé de base) perdait 🏛/🗺 ET leurs
// liens de nav (strippés comme sections du bloc supprimé). L'élève ne voyait
// jamais les cartes s'il ouvrait la leçon 1.
//
// CORRECTIF : les cartes sont déplacées dans une <div id="zone-synthese"> HORS
// chapter-view — sliceLessonHtml conserve le contenu hors blocs → la zone est
// rendue dans LES DEUX leçons, avec ses liens de nav.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { sliceLessonHtml, countLessonChapters } from './lessonChapterSplit';

const DIR = resolve(__dirname, '../../public/lessons');

/** Les 11 fichiers portant une carte 🏛 (toutes unités à حصيلة). */
const FILES_HOSILA = [
  'phase2_chapitres_3_4',
  'phase3_chapitres_5_6',
  'phase4_chapitres_7_8',
  'phase7_chapitres_13_14',
  'phase10_chapitres_19_20',
  'phase12_chapitres_23_24',
  'phase14_chapitres_27_28',
  'phase15_chapitres_29_30',
  'phase18_chapitres_35_36',
  'phase20_chapitres_39_40',
  'phase22_chapitres_43_44',
];

/** Les 5 fichiers portant en plus une carte 🗺 (schémas originaux user). */
const FILES_SCHEMA = [
  'phase2_chapitres_3_4',
  'phase7_chapitres_13_14',
  'phase10_chapitres_19_20',
  'phase20_chapitres_39_40',
  'phase22_chapitres_43_44',
];

describe('zone de synthèse commune — visible dans LES DEUX leçons (fix bug app)', () => {
  for (const key of FILES_HOSILA) {
    it(`${key} : 🏛 حصيلة + nav présentes dans la leçon 1 ET la leçon 2`, () => {
      const html = readFileSync(resolve(DIR, `${key}.html`), 'utf-8');
      expect(countLessonChapters(html)).toBe(2);
      for (const k of [key, `${key}_2`]) {
        const slice = sliceLessonHtml(html, k);
        expect(slice.includes('id="zone-synthese"'), `zone absente (${k})`).toBe(true);
        expect(slice.includes('id="hosila"'), `hosila absente (${k})`).toBe(true);
        expect(slice.includes('id="link-hosila"'), `lien nav hosila absent (${k})`).toBe(true);
      }
    });
  }

  for (const key of FILES_SCHEMA) {
    it(`${key} : 🗺 مخطط + nav présents dans la leçon 1 ET la leçon 2`, () => {
      const html = readFileSync(resolve(DIR, `${key}.html`), 'utf-8');
      for (const k of [key, `${key}_2`]) {
        const slice = sliceLessonHtml(html, k);
        expect(slice.includes('id="schema-synthese"'), `schéma absent (${k})`).toBe(true);
        expect(slice.includes('id="link-schema"'), `lien nav schéma absent (${k})`).toBe(true);
        expect(slice.includes('/assets/images/schemas/'), `image schéma absente (${k})`).toBe(true);
      }
    });
  }

  it('sanity : le slicing isole toujours les leçons (phase7)', () => {
    const html = readFileSync(resolve(DIR, 'phase7_chapitres_13_14.html'), 'utf-8');
    const l1 = sliceLessonHtml(html, 'phase7_chapitres_13_14');
    expect(l1.includes('id="ch13"')).toBe(true);
    // le 📝 resume de phase7 appartient à la leçon 2 (ch14) : pas de fuite dans la leçon 1
    expect(l1.includes('id="resume"')).toBe(false);
    expect(l1.includes('id="ch14"')).toBe(false);
    const l2 = sliceLessonHtml(html, 'phase7_chapitres_13_14_2');
    expect(l2.includes('id="ch14"')).toBe(true);
    expect(l2.includes('id="resume"')).toBe(true);
    expect(l2.includes('id="ch13"')).toBe(false);
  });
});
