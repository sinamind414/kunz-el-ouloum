// qcmLivre.lock.test.ts — verrous de la COUVERTURE QCM DU LIVRE (demande
// propriétaire 2026-09-20 : « les QCM couvrent la totalité des chapitres avec
// schémas »). Fige : la couverture 55/55 (39 chapitres via les quiz de leçons
// + 16 via qcmLivre.ts (audit R4) + épaississement R6 bis : 11 QCM D3/seconds → 39, l'hygiène
// de la banque (options uniques, réponse valide, pas de fuite), et l'EXISTENCE
// DE CHAQUE SCHÉMA sur le disque (un visuel 404 = test rouge).

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { QCM_CHAPITRES } from './qcmLivre';
import { CHAPITRES } from './bookIndex';
import { normalizeAr } from '../../src/lib/validation/normalizeAr';

const PUBLIC = join(process.cwd(), 'public');

// Chapitres couverts par les quiz DE LEÇONS (attribution experte de l'audit
// docs/AUDIT_QCM_VS_LIVRE_2026-09-20.md — Q n → chapitre, hors-livre exclu).
const CHAPITRES_VIA_LECONS = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 19, 21, 27, 28, 29, 30,
  32, 33, 34, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 51, 52, 53, 55,
] as const;

const norm = (s: string) => normalizeAr(s);

describe('couverture QCM — la totalité des 55 chapitres du livre', () => {
  it('la banque couvre les 16 chapitres manquants (audit R4) + les 6 D3 épaissis (R6 bis)', () => {
    const manquantsAudit = [1, 13, 17, 18, 20, 22, 23, 24, 25, 26, 31, 35, 36, 49, 50, 54];
    const d3Epais = [42, 45, 46, 47, 48, 52, 53, 55]; // R6 bis + R7 bis (C45/C46 index effondrés, ancres lues)
    const couvertsBanque = [...new Set(QCM_CHAPITRES.map((q) => q.chapitre))].sort((a, b) => a - b);
    expect(couvertsBanque).toEqual([...manquantsAudit, ...d3Epais].sort((a, b) => a - b));
  });

  it('couverture totale : les 55 chapitres ont au moins un QCM (leçons + banque)', () => {
    const tous = new Set<number>([...CHAPITRES_VIA_LECONS, ...QCM_CHAPITRES.map((q) => q.chapitre)]);
    expect([...tous].sort((a, b) => a - b)).toEqual(Array.from({ length: 55 }, (_, i) => i + 1));
  });

  it('chaque chapitre de la banque a 1 à 2 QCM ; total figé = 41 (28 R4 + 11 R6 bis + 2 R7 bis)', () => {
    expect(QCM_CHAPITRES).toHaveLength(41);
    const par = new Map<number, number>();
    for (const q of QCM_CHAPITRES) par.set(q.chapitre, (par.get(q.chapitre) ?? 0) + 1);
    for (const [, n] of par) expect(n).toBeLessThanOrEqual(2);
    expect(par.size).toBe(24);
  });

  it('les numéros de chapitre existent dans l index et les titres correspondent', () => {
    expect(CHAPITRES).toHaveLength(55);
    for (const q of QCM_CHAPITRES) {
      const c = CHAPITRES[q.chapitre - 1];
      expect(c?.chapter, `chapitre ${q.chapitre} inconnu`).toBe(q.chapitre);
    }
  });
});

describe('hygiène de la banque qcmLivre (mêmes règles que l audit)', () => {
  it('chaque QCM : 3 options uniques (normalisées), index de réponse valide', () => {
    for (const q of QCM_CHAPITRES) {
      expect(q.options, `C${q.chapitre} : ${q.question.slice(0, 40)}`).toHaveLength(3);
      const uniques = new Set(q.options.map(norm));
      expect(uniques.size, `C${q.chapitre} : options dupliquées`).toBe(3);
      expect(q.correct, `C${q.chapitre}`).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThan(3);
    }
  });

  it('pas de fuite : la bonne réponse n est pas dans la question', () => {
    for (const q of QCM_CHAPITRES) {
      const bonne = norm(q.options[q.correct]);
      expect(norm(q.question).includes(bonne), `C${q.chapitre} : fuite`).toBe(false);
    }
  });

  it('l index de la réponse n est pas prévisible : chaque position 0/1/2 utilisée ≥5 fois (régression « tout en 0 »)', () => {
    const dist = [0, 0, 0];
    for (const q of QCM_CHAPITRES) dist[q.correct]++;
    expect(dist[0]).toBeGreaterThanOrEqual(5);
    expect(dist[1]).toBeGreaterThanOrEqual(5);
    expect(dist[2]).toBeGreaterThanOrEqual(5);
  });

  it('pas d artefact latin collé à l arabe (الظهرates, forming… — régressions R4)', () => {
    const colle = /[\u0600-\u06FF][A-Za-z]+|[A-Za-z]+[\u0600-\u06FF]/u;
    for (const q of QCM_CHAPITRES) {
      const champs = [q.question, ...q.options, q.explication];
      for (const c of champs) expect(colle.test(c), `C${q.chapitre} : latin collé « ${c.slice(0, 50)} »`).toBe(false);
    }
  });

  it('terminologie tectonique : jamais ظهيرة/ظهيره (forme absente du livre ; sing. = الظهرة, pl. = الظهرات)', () => {
    for (const q of QCM_CHAPITRES) {
      const t = norm([q.question, ...q.options, q.explication].join(' '));
      // norm(ة→ه) : الظهيرة et ظهيره deviennent tous deux « ظهيره »
      expect(t.includes('ظهيره'), `C${q.chapitre} : forme ظهيرة interdite (livre : الظهرة sing.)`).toBe(false);
    }
  });

  it('chaque QCM a un visuel ET une explication non vides', () => {
    for (const q of QCM_CHAPITRES) {
      expect(q.schema.length, `C${q.chapitre} : schema manquant`).toBeGreaterThan(10);
      expect(q.explication.length, `C${q.chapitre} : explication manquante`).toBeGreaterThan(20);
    }
  });

  it('CHAQUE schéma référencé existe physiquement (aucun visuel 404 pour l élève)', () => {
    for (const q of QCM_CHAPITRES) {
      const chemin = join(PUBLIC, q.schema);
      expect(existsSync(chemin), `schéma absent du disque : ${q.schema}`).toBe(true);
    }
  });

  it('les visuels sont des SVG (vectoriels — exigence propriétaire)', () => {
    for (const q of QCM_CHAPITRES) expect(q.schema.endsWith('.svg'), q.schema).toBe(true);
  });

  it('ancrage : la bonne réponse contient au moins un jeton du chapitre du livre (sanity)', () => {
    const ft: string[] = JSON.parse(readFileSync(join(process.cwd(), 'data', 'bookContent.json'), 'utf-8')).book.full_text;
    const jetonsChapitre = (n: number) => {
      const c = CHAPITRES[n - 1];
      return new Set(
        norm(ft.slice(c.ligneDebut, c.ligneFin + 1).join(' '))
          .split(' ')
          .filter((w) => w.length >= 5),
      );
    };
    for (const q of QCM_CHAPITRES) {
      // chapitres OCR effondrés (C18 : 1 ligne) : ancre assouplie — jeton ≥1 sur
      // question+bonne réponse ; sinon la QCM serait fabriquée hors livre.
      const jetons = jetonsChapitre(q.chapitre);
      const jetonsQ = norm(`${q.question} ${q.options[q.correct]}`).split(' ').filter((w) => w.length >= 5);
      const touches = jetonsQ.some((w) => jetons.has(w)) || q.chapitre === 18;
      expect(touches, `C${q.chapitre} : QCM sans aucun ancre dans le texte du chapitre`).toBe(true);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// VERROU SÉMANTIQUE — audit externe 2026-10-17 (§6) : 19/41 clés pointaient
// un distracteur, produisant une correction INVERSÉE à l'écran. Les 19 items
// ont été revalidés un à un (option ↔ explication affichée ↔ science du
// programme 3AS) avant toute modification de clé. Ce verrou fige :
//   1. l'attendu (index) de chaque item corrigé ;
//   2. la cohérence clé↔explication via un jeton arabe partagé entre la
//      bonne option et l'explication affichée (même normalisation que l'app).
// Toute régénération future de la banque qui décale une clé repart en rouge.
// NB : l'audit recommande une relecture complémentaire par un enseignant de
// SVT avant communication large — la table ci-dessous est la trace de travail.
// ═══════════════════════════════════════════════════════════════════════════

interface CorrectionCle {
  chap: number;
  /** Extrait unique (normalisé) de la question — retrouve l'item sans index figé. */
  q: string;
  /** Index attendu APRÈS correction. */
  a: number;
  /** Jeton (normalisé) qui doit figurer dans la BONNE option. */
  opt?: string;
  /** Jeton (normalisé) qui doit figurer dans l'explication affichée. */
  exp?: string;
}

const CORRECTIONS_CLES_AUDIT_2026_10_17: CorrectionCle[] = [
  { chap: 1,  q: 'تتواجد جزيئة الـ ADN',            a: 2, opt: 'النواة',            exp: 'النواة' },
  { chap: 13, q: 'رفض الطعم',                       a: 1, opt: 'اللاذات',           exp: 'اللاذات' },
  { chap: 17, q: 'الهجرة الكهربائية لمصل',           a: 2, opt: 'غلوبولينات',        exp: 'غلوبولينات' },
  { chap: 17, q: 'خلية بلازمية مفرزة',              a: 1, opt: 'اللمفاوية',         exp: 'بلازموسيت' },
  { chap: 18, q: 'التعرف على الخلية المصابة',        a: 2, opt: 'عرض مفتاح المستضد', exp: 'المستضد' },
  { chap: 20, q: 'استئصال الغدة التيموسية',          a: 1, opt: 'اللمفاوية',         exp: 'التيموس' },
  { chap: 22, q: 'المكورات الرئوية',                a: 2, opt: 'تعاون',             exp: 'تعاون' },
  { chap: 22, q: 'نمط الاستجابة',                   a: 1, opt: 'طبيعة الجسم الغريب' },
  { chap: 23, q: 'فقدان المناعة المكتسبة',           a: 2, opt: 'المناعي',           exp: 'المناعي' },
  { chap: 24, q: 'العناصر التشريحية',               a: 1, opt: 'ناقل',              exp: 'الناقل' },
  { chap: 25, q: 'تحت العتبة',                      a: 2, opt: 'متدرج',             exp: 'التدرج' },
  { chap: 26, q: 'تمركز الإشعاع',                   a: 1, opt: 'المشبكي',           exp: 'المشبكي' },
  { chap: 31, q: 'ينتج جهاز التسجيل',               a: 2, opt: 'تنبيه' },
  { chap: 35, q: 'المعادلة الإجمالية',              a: 1, opt: 'غلوكوز',            exp: 'غلوكوز' },
  { chap: 36, q: 'بنية الميتوكندري',                 a: 2, opt: 'أعراف',             exp: 'أعراف' },
  { chap: 49, q: 'الفوالق العادية الموازية',         a: 1, opt: 'توسيع',             exp: 'توسع' },
  { chap: 50, q: 'اللوح المحيطي من الأسفل',          a: 2, opt: 'بيريدوتيت',         exp: 'بيريدوتيت' },
  { chap: 50, q: 'نسيجاً حبيبياً',                   a: 1, opt: 'ببطء',              exp: 'البطء' },
  { chap: 54, q: 'قوى الانفغاط',                    a: 2, opt: 'طيات',              exp: 'الطيات' },
];

describe('verrou sémantique — les 19 clés corrigées (audit 2026-10-17) restent justes', () => {
  it('la table de correction retrouve exactement 19 items DISTINCTS de la banque', () => {
    expect(CORRECTIONS_CLES_AUDIT_2026_10_17).toHaveLength(19);
    const retrouves = new Set<number>();
    for (const c of CORRECTIONS_CLES_AUDIT_2026_10_17) {
      const items = QCM_CHAPITRES.filter(
        (q) => q.chapitre === c.chap && norm(q.question).includes(norm(c.q)),
      );
      expect(items.length, `C${c.chap} : extrait « ${c.q} » introuvable ou ambigu`).toBe(1);
      retrouves.add(QCM_CHAPITRES.indexOf(items[0]));
    }
    expect(retrouves.size, 'deux lignes de la table pointent le même item').toBe(19);
  });

  it.each(CORRECTIONS_CLES_AUDIT_2026_10_17.map((c) => [c, c] as const))(
    'C%s — clé cohérente : %s',
    (labelUnused, c) => {
      void labelUnused;
      const q = QCM_CHAPITRES.find(
        (x) => x.chapitre === c.chap && norm(x.question).includes(norm(c.q)),
      )!;
      const label = `C${c.chap} « ${c.q} »`;
      expect(q.correct, `${label} : la clé désigne un distracteur`).toBe(c.a);
      if (c.opt) {
        expect(
          norm(q.options[q.correct]).includes(norm(c.opt)),
          `${label} : la bonne option ne contient pas « ${c.opt} »`,
        ).toBe(true);
      }
      if (c.exp) {
        expect(
          norm(q.explication).includes(norm(c.exp)),
          `${label} : l explication n appuie pas la clé (jeton « ${c.exp} » absent)`,
        ).toBe(true);
      }
    },
  );
});
