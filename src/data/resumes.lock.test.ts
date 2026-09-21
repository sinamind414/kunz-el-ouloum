// resumes.lock.test.ts — verrou « chaque leçon a un résumé simple ancré au livre
// officiel » (GO user 2026-09-21). Le fichier maître est resumesLecons.ts :
// 1 phrase-objectif + 4-6 points ≤ 24 mots + terme-clé bac ; CHAQUE point doit
// partager ≥ 1 jeton (≥ 5 car. normalisé) avec le texte du/des chapitre(s) du
// livre officiel déclaré(s) dans CHAPITRES_ANCRAGE — zéro invention possible
// sans faire tomber le verrou. Injection vérifiée : 19 passives (HTML) + carte
// en bas des 20 leçons actives (ActiveLessonView, hors machine d'états).

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ACTIVE_LESSONS } from './activeLessons';
import { CHAPITRES } from './bookIndex';
import { RESUMES_LECONS, CHAPITRES_ANCRAGE, CLES_PASSIVES, resumePourActif } from './resumesLecons';

const ft: string[] = (JSON.parse(
  readFileSync(resolve(__dirname, '../../data/bookContent.json'), 'utf-8'),
) as { book: { full_text: string[] } }).book.full_text;

const norm = (s: string) => s.normalize('NFKC')
  .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
  .replace(/[إأآٱا]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
  .replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
  .replace(/[^\u0600-\u06FF0-9a-zA-Z\s]/g, ' ').replace(/\s+/g, ' ').trim();

const texteChapitre = (ch: number) => {
  const c = CHAPITRES[ch - 1];
  return norm(ft.slice(c.ligneDebut, c.ligneFin + 1).join(' '));
};

describe('couverture : toute leçon rendue a un résumé', () => {
  it('les 20 leçons actives (ACTIVE_LESSONS) ont un résumé résolvable', () => {
    const cles = Object.keys(ACTIVE_LESSONS);
    expect(cles.length).toBeGreaterThanOrEqual(20);
    for (const k of cles) {
      expect(resumePourActif(k), `résumé actif manquant : ${k}`).toBeDefined();
    }
  });

  it('les 25 leçons passives ont une entrée (19 injectées + 6 héritées restructurées É2)', () => {
    expect(CLES_PASSIVES.length).toBe(25);
    for (const k of CLES_PASSIVES) expect(RESUMES_LECONS[k], k).toBeDefined();
  });

  it('le viewer actif consomme bien resumePourActif (câblage figé)', () => {
    const src = readFileSync(resolve(__dirname, '../components/ActiveLessonView.tsx'), 'utf-8');
    expect(src.includes('resumePourActif')).toBe(true);
  });
});

describe('standard du résumé : simple, borné, structuré', () => {
  it('44 entrées : objectif ≥ 15 car., 4-6 points ≤ 24 mots, terme bac', () => {
    const cles = Object.keys(RESUMES_LECONS);
    expect(cles.length).toBe(44);
    for (const [k, r] of Object.entries(RESUMES_LECONS)) {
      expect(r.objectif.trim().length, `objectif ${k}`).toBeGreaterThanOrEqual(15);
      expect(r.points.length, `nb points ${k}`).toBeGreaterThanOrEqual(4);
      expect(r.points.length, `nb points ${k}`).toBeLessThanOrEqual(6);
      for (const [i, p] of r.points.entries()) {
        const mots = p.trim().split(/\s+/).length;
        expect(mots, `point ${i + 1} de ${k} = ${mots} mots`).toBeLessThanOrEqual(24);
      }
      expect(r.termeBac.trim().length, `termeBac ${k}`).toBeGreaterThanOrEqual(3);
    }
  });

  it('ANCRAGE LIVRE OFFICIEL : chaque point partage ≥ 1 jeton (≥ 5 car.) avec ses chapitres', () => {
    for (const [k, r] of Object.entries(RESUMES_LECONS)) {
      const chapitres = CHAPITRES_ANCRAGE[k];
      expect(chapitres?.length ?? 0, `ancrage déclaré pour ${k}`).toBeGreaterThan(0);
      const txt = (chapitres ?? []).map(texteChapitre).join(' ');
      for (const [i, p] of r.points.entries()) {
        const jetons = [...new Set(norm(p).split(' ').filter((w) => w.length >= 5))];
        expect(jetons.length > 0, `${k} point${i + 1} sans jeton`).toBe(true);
        expect(
          jetons.some((j) => txt.includes(j)),
          `${k} point${i + 1} hors livre : « ${p.slice(0, 50)} »`,
        ).toBe(true);
      }
    }
  });
});

describe('الحصيلة المعرفية الرسمية du livre — injectée dans les 7 leçons de clôture', () => {
  // leçon de clôture de chaque unité qui possède une حصيلة imprimée (docs/RESUMES_MAARIFI_LIVRE_2026-09-21.md)
  const HOSILA: [string, string[]][] = [
    ['phase2_chapitres_3_4', ['المخطط التحصيلي لعملية تركيب البروتين', 'الشبكة الهيولية']],       // D1-U1, ص 34
    ['phase3_chapitres_5_6', ['الروابط الببتيدية', 'الطرف الأميني']],                            // D1-U2, ص 152
    ['phase7_chapitres_13_14', ['وحدة بيولوجية مستقلة بذاتها', 'الذات واللاذات']],               // D1-U4
    ['phase12_chapitres_23_24', ['التيلاكويد', 'كيميوحيوية']],                                   // D2-U6
    ['phase14_chapitres_27_28', ['حصيلة التحلل السكري', '38 ATP']],                              // D2-U7, ص 222
    ['phase15_chapitres_29_30', ['الإمداد المستمر من الطاقة', 'التنفس الخلوي']],                // D2-U8 (texte complet, doc corrigé user)
    ['phase22_chapitres_43_44', ['أوفيوليت', 'التقلص القشري']],                                  // D3-U11, ص 330
    // les 4 حصيلة révélées par le texte corrigé fourni par l'utilisateur (2026-09-21) :
    // absentes de l'OCR ingéré (ch9-11 quasi vides) mais présentes dans le PDF
    ['phase4_chapitres_7_8', ['التكامل المحف', 'الموقع الفعال', '37°C']],                        // U3, ص 68
    ['phase10_chapitres_19_20', ['كمون الراحة', 'PPSE', 'الإدماج العصبي']],                      // U5, ص 156-164
    ['phase18_chapitres_35_36', ['جلد الحمار الوحشي', 'مستوى بينيوف', 'تيارات حمل']],            // U9
    ['phase20_chapitres_39_40', ['السيسمومتر', 'سيما', 'الأستينوسفير']],                         // U10, ص 280-281
  ];

  it('les 7 cartes officielles (id="hosila") sont présentes avec leurs marqueurs', () => {
    for (const [f, marqueurs] of HOSILA) {
      const brut = readFileSync(resolve(__dirname, `../../public/lessons/${f}.html`), 'utf-8');
      expect(brut.includes('id="hosila"'), `carte حصيلة absente de ${f}`).toBe(true);
      expect(brut.includes('link-hosila'), `lien nav حصيلة absent de ${f}`).toBe(true);
      const texte = brut.replace(/<[^>]+>/g, ' ');
      for (const m of marqueurs) {
        expect(texte.includes(m), `marqueur « ${m} » absent de ${f}`).toBe(true);
      }
    }
  });

  it('chaque carte partage du lexique avec le livre (ancrage officiel)', () => {
    const book = norm((JSON.parse(
      readFileSync(resolve(__dirname, '../../data/bookContent.json'), 'utf-8'),
    ) as { book: { full_text: string[] } }).book.full_text.join(' '));
    const jetons: [string, string[]][] = [
      ['phase3_chapitres_5_6', ['الببتيدية', 'تكافؤية']],
      ['phase12_chapitres_23_24', ['التيلاكويد', 'الحشوة']],
      ['phase14_chapitres_27_28', ['الميتوكندري', 'التنفسية']],
      ['phase22_chapitres_43_44', ['التكتونية', 'الليتوسفير']],
    ];
    for (const [f, mots] of jetons) {
      const brut = readFileSync(resolve(__dirname, `../../public/lessons/${f}.html`), 'utf-8');
      const texte = norm(brut.replace(/<[^>]+>/g, ' '));
      for (const w of mots) {
        const wn = norm(w);
        expect(texte.includes(wn), `${f} : « ${w} » hors carte`).toBe(true);
        expect(book.includes(wn), `« ${w} » introuvable dans le livre (test incohérent)`).toBe(true);
      }
    }
  });

  it('la leçon D2-U7 cite le bilan officiel 38 ATP du livre', () => {
    const book = (JSON.parse(
      readFileSync(resolve(__dirname, '../../data/bookContent.json'), 'utf-8'),
    ) as { book: { full_text: string[] } }).book.full_text.join(' ');
    expect(book).toContain('38ATP'); // l.4154 : la source du chiffre cité
  });
});

describe('injection dans les surfaces', () => {
  it('les 25 fichiers passifs contiennent la section + le lien nav + l\'objectif', () => {
    for (const k of CLES_PASSIVES) {
      const html = readFileSync(resolve(__dirname, `../../public/lessons/${k}.html`), 'utf-8');
      expect(html.includes('id="resume"'), `section خلاصة absente de ${k}`).toBe(true);
      expect(html.includes('link-resume'), `lien nav absent de ${k}`).toBe(true);
      expect(html.includes(RESUMES_LECONS[k].objectif.slice(0, 40)), `objectif absent de ${k}`).toBe(true);
    }
  });

  it('la leçon active phase11 (مقر) a un résumé ≠ de la passive (كيموضوئية)', () => {
    const active = resumePourActif('phase11_chapitres_21_22');
    expect(active).toBeDefined();
    expect(active).not.toBe(RESUMES_LECONS['phase11_chapitres_21_22']);
    expect(active!.points.join(' ')).toContain('الصانعات الخضراء');
  });

  it('la leçon hybride phase10 couvre les deux moitiés (مخدرات + صانعة خضراء)', () => {
    const points = RESUMES_LECONS['phase10_chapitres_19_20'].points.join(' ');
    expect(points).toContain('المورفين');
    expect(points).toContain('الصانعة الخضراء');
  });
});
