// bacExam.lock.test.ts — verrous du module « اختبار نمط بكالوريا » (source :
// PROGRAMME NATIONAL upload master 5548459, injection mécanique par
// scripts/build_bac_exam.py, analyse docs/ANALYSE_PROGRAMME_NATIONAL_2026-09-20.md).
// Fige : structure (3 tests × 4 exercices × 20 pts), Σ barèmes = Σ questions,
// les 2 transformations documentées (T1 contradiction logique corrigée, T2
// alignement 38 ATP sur le référentiel livre l.4155/4173), l'étiquetage des
// données simulées, les ancrages livre, et la terminologie.

import { describe, expect, it } from 'vitest';
import { BAC_TESTS } from './bacExam';

const norm = (s: string) =>
  s
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[إأآٱا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');

describe('structure des tests bac (source : 3 اختبارات تجريبية)', () => {
  it('3 tests, un par domaine, ids uniques, 180 min chacun', () => {
    expect(BAC_TESTS).toHaveLength(3);
    expect(new Set(BAC_TESTS.map((t) => t.id)).size).toBe(3);
    expect(BAC_TESTS.map((t) => t.domaine)).toEqual([1, 2, 3]);
    for (const t of BAC_TESTS) expect(t.dureeMin).toBe(180);
  });

  it('4 exercices par test, Σ points = 20 par test, 5 par exercice', () => {
    for (const t of BAC_TESTS) {
      expect(t.exercices, t.id).toHaveLength(4);
      const total = t.exercices.reduce((a, e) => a + e.points, 0);
      expect(total, t.id).toBe(20);
      for (const e of t.exercices) expect(e.points).toBe(5);
    }
  });

  it('Σ points des questions = points de l exercice (barème complet, partout)', () => {
    for (const t of BAC_TESTS) {
      for (const e of t.exercices) {
        expect(e.questions.length, `${t.id} / ${e.titre}`).toBeGreaterThanOrEqual(4);
        const s = e.questions.reduce((a, q) => a + q.points, 0);
        expect(Math.round(s * 100) / 100, `${t.id} / ${e.titre}`).toBe(e.points);
        for (const q of e.questions) expect(q.points, q.text.slice(0, 40)).toBeGreaterThan(0);
      }
    }
  });

  it('énoncés et corrigés présents partout (pas d exercice fantôme)', () => {
    for (const t of BAC_TESTS) {
      expect(t.enTete.length).toBeGreaterThan(30);
      for (const e of t.exercices) {
        expect(e.enonce.length, `${t.id}/${e.titre} : énoncé`).toBeGreaterThan(80);
        expect(e.corrige.length, `${t.id}/${e.titre} : corrigé`).toBeGreaterThan(80);
      }
    }
  });
});

describe('transformations documentées du générateur (T1/T2/T3)', () => {
  it('T1 : la contradiction logique D1-ex3-Q3 est corrigée (protection, pas infection)', () => {
    const d1 = JSON.stringify(BAC_TESTS[0]);
    expect(d1.includes('لا، لم يكن ليُصاب')).toBe(true);
    expect(d1.includes('نعم، لو لُقِّح')).toBe(false);
  });

  it('T2 : alignement 38 ATP — aucune trace de 36-38, note moderne présente', () => {
    const d2 = JSON.stringify(BAC_TESTS[1]);
    expect(d2.includes('36-38')).toBe(false);
    expect(d2.includes('38 ATP')).toBe(true);
    expect(d2.includes('30-32 ATP')).toBe(true); // note de référence, pas la réponse
  });

  it('T3 : chaque test porte la notice « données simulées »', () => {
    for (const t of BAC_TESTS) {
      expect(norm(t.notice).includes(norm('مُحاكاة')), t.id).toBe(true);
      expect(norm(t.notice).includes(norm('الكتاب المدرسي الرسمي')), t.id).toBe(true);
    }
  });
});

describe('ancrages au référentiel (livre officiel) et hygiène', () => {
  it('ancrages livres présents : 2900 km + موهو (D3, livre l.4852/5278), AUG/UAG (D1)', () => {
    const d3 = JSON.stringify(BAC_TESTS[2]);
    const d1 = JSON.stringify(BAC_TESTS[0]);
    expect(d3.includes('2900')).toBe(true);
    expect(norm(d3).includes(norm('موهو'))).toBe(true);
    expect(d1.includes('AUG')).toBe(true);
    expect(d1.includes('UAG')).toBe(true);
  });

  it('terminologie : jamais الظهيرة (forme absente du livre — sing. الظهرة, pl. الظهرات)', () => {
    for (const t of BAC_TESTS) {
      const tout = norm(JSON.stringify(t));
      expect(tout.includes('ظهيره'), t.id).toBe(false);
    }
  });

  it('les notices (textes rédigés par nous) sont propres : pas d artefact latin collé', () => {
    const colle = /[\u0600-\u06FF][A-Za-z]+|[A-Za-z]+[\u0600-\u06FF]/u;
    for (const t of BAC_TESTS) {
      expect(colle.test(t.notice), t.id).toBe(false);
    }
  });
});
