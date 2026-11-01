// bibliothequeOfficielle.lock.test.ts — LA BIBLIOTHÈQUE OFFICIELLE (L5/L6),
// verrou « التدرج = bibliothèque » (file 2026-09-20, fermé le même jour).
//
// ÉTAT RÉEL établi par mesure (fin du mythe « mot à mot ») :
//   · L5 (التدرج-السنوي-للتعلمات-2017.txt) et L6 (دليل-الأستاذ-2017.txt) sont
//     COMMITÉS (documents officiels — voir docs/sources/README.md) ;
//   · L5 est un OCR BRUITÉ (« مهناج », « لالنزيمات », « الس نة »…) ;
//   · les `ressourcesCiblees` de curriculumOfficial.ts ne sont PAS mot à mot :
//     15/42 en sous-chaîne exacte (normalisée), 22/42 à couverture lexicale
//     100 %, 13 sous 85 % → liste a-revoir FIGÉE ci-dessous.
// Ce verrou remplace la promesse non tenue par un ÉTAT MESURÉ et VERSIONNÉ :
// toute évolution (re-OCR de L5, correction d'une citation) passe par une
// modification consciente de ce fichier — jamais par un glissement.

import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { normalizeAr } from '../../src/lib/validation/normalizeAr';
import { PROGRESSION_OFFICIELLE } from './curriculumOfficial';

const SRC_DIR = join(process.cwd(), 'docs', 'sources');
const L5 = join(SRC_DIR, 'التدرج-السنوي-للتعلمات-2017.txt');
const L6 = join(SRC_DIR, 'دليل-الأستاذ-2017.txt');

const fixSubscripts = (s: string): string =>
  s.replace(/[\u2080-\u2089]/g, (c) => String(c.codePointAt(0)! - 0x2080));
const norm = (s: string): string => normalizeAr(fixSubscripts(s));

/** Couverture lexicale : part des jetons (≥3 car. normalisés) présents dans L5. */
function couvertureLexicale(ressource: string, texteNorm: string): number {
  const jetons = norm(ressource).split(/\s+/).filter((w) => w.length >= 3);
  if (jetons.length === 0) return 1;
  const presents = jetons.filter((w) => texteNorm.includes(w)).length;
  return presents / jetons.length;
}

describe('bibliothèque officielle — L5/L6 committés et inchangés', () => {
  it('les deux documents officiels existent sur le disque (donc dans git)', () => {
    expect(existsSync(L5), 'التدرج السنوي absent — la bibliothèque est vide').toBe(true);
    expect(existsSync(L6), 'دليل الأستاذ absent — la bibliothèque est vide').toBe(true);
  });

  it('empreintes figées : toute retouche silencieuse des sources casse ce test', () => {
    const l5 = readFileSync(L5);
    const l6 = readFileSync(L6);
    expect(l5.length).toBe(155_969);
    expect(l6.length).toBe(653_551);
    expect(createHash('sha256').update(l5).digest('hex')).toBe(
      '88de761de4f1470b2f30ea7143a76fe7f055e1ce09231a0bf6ad91bfe2d85f3c',
    );
    expect(createHash('sha256').update(l6).digest('hex')).toBe(
      'd6ba521c91c8921a7348e5066c51f1ea13fb33d1715a967d1ece152a8d60240e',
    );
  });

  it('sondes d identité officielle (survivent au bruit OCR mesuré)', () => {
    const t = norm(readFileSync(L5, 'utf-8'));
    // « جوان 2017 » existe SANS espace dans l OCR (« جوان2017 ») — jetons séparés.
    for (const sonde of ['وزاره', 'جوان', '2017', 'التعلامت', 'علوم']) {
      expect(t.includes(sonde), `sonde « ${sonde} »`).toBe(true);
    }
  });
});

describe('bibliothèque officielle — ancrage mesuré du registre pédagogique (L5)', () => {
  const texteL5 = norm(readFileSync(L5, 'utf-8'));
  const mesures = PROGRESSION_OFFICIELLE.flatMap((p) =>
    p.ressourcesCiblees.map((r) => ({ uniteId: p.uniteId, ressource: r, taux: couvertureLexicale(r, texteL5) })),
  );

  it('le registre couvre les 11 unités — 42 ressources (mesure figée)', () => {
    expect(PROGRESSION_OFFICIELLE).toHaveLength(11);
    expect(mesures).toHaveLength(42);
  });

  it('répartition d ancrage lexical figée : 22 à 100 %, 29 à ≥85 %, 13 à réviser', () => {
    const plein = mesures.filter((m) => m.taux === 1).length;
    const q85 = mesures.filter((m) => m.taux >= 0.85).length;
    expect(plein).toBe(22);
    expect(q85).toBe(29);
    expect(mesures.length - q85).toBe(13);
  });

  it('LISTE a-revoir FIGÉE (taux < 85 %) — la file de réparation, pas un détour', () => {
    const aRevoir = mesures
      .filter((m) => m.taux < 0.85)
      .map((m) => ({ u: m.uniteId, t: Number((m.taux * 100).toFixed(0)), r: m.ressource }));
    // Chaque entrée = citation à re-vérifier contre L5 (re-OCR / paraphrase).
    expect(aRevoir).toEqual([
      {"u": 2, "t": 64, "r": "تدخل الأحماض الأمينية في تشكيل البروتين وفي تحديد بنيته الفراغية ثلاثية الأبعاد"},
      {"u": 3, "t": 60, "r": "التخصص الوظيفي للأنزيمات وعلاقته بالبنية"},
      {"u": 3, "t": 80, "r": "شروط الوسط المثلى لعمل الأنزيم"},
      {"u": 4, "t": 75, "r": "التمييز بين الذات واللاذات"},
      {"u": 4, "t": 75, "r": "مظاهر التعرف على اللاذات"},
      {"u": 4, "t": 67, "r": "مصدر الأجسام المضادة"},
      {"u": 4, "t": 80, "r": "طريقة تأثير الخلايا اللمفاوية التائية"},
      {"u": 4, "t": 80, "r": "مصدر الخلايا اللمفوية التائية السامة"},
      {"u": 4, "t": 80, "r": "آلية تحفيز الخلايا البائية والتائية"},
      {"u": 4, "t": 80, "r": "اختيار نمط الاستجابة المناعية المناسبة"},
      {"u": 5, "t": 67, "r": "آلية الإدماج العصبي"},
      {"u": 9, "t": 75, "r": "مظاهر حركة التباعد وعواقبها على مستوى الكرة الأرضية"},
      {"u": 10, "t": 57, "r": "نموذج لبنية الكرة الأرضية يتضمن الأغلفة والانقطاعات"},
    ]);
  });

  it('garantie dure : aucune ressource sous 50 % (une citation hors-L5 serait une invention)', () => {
    for (const m of mesures) {
      expect(m.taux, `U${m.uniteId} : ${m.ressource.slice(0, 50)}`).toBeGreaterThanOrEqual(0.5);
    }
  });
});
