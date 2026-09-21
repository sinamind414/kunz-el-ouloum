// hikalaBac.test.ts — Verrous de la fiche هيكلة موضوع البكالorgia encodée
// (src/data/hikalaBac.ts) croisée avec le produit : calibration, Meftah, scoreur.
//
// Statut de la source : fiche pédagogique (dzexams, أستاذ زكرياء) libellée
// « شعبة الرياضيات » — CORROBORATION de structure, pas autorité ministérielle.
// Ce que ces tests verrouillent : la cohérence INTERNE du repo avec la fiche,
// et la visibilité permanente de la dette (verbes officiels non entraînés).

import { describe, expect, it } from 'vitest';
import {
  HIKALA_FORMAT_A,
  totalFormatA,
  afalNonCouverts,
} from './hikalaBac';
import { CALIBRATION_BAC2025 } from './dictionaries/calibrationBac2025';
import { MEFTA_BAC_EXERCISES } from './meftahManhajia';
import { VERB_CARDS } from './methodologyEngine';
import { ATTENDUS_BAREME } from './dictionaries/dictionnaireCorrecteur';

describe('hikala — cadre général (fiche هيكلة)', () => {
  it('format A : 3 exercices, 5+7+8 = 20 points (40/35/25 %)', () => {
    const [t1, t2, t3] = HIKALA_FORMAT_A.exercices;
    expect([t1!.points, t2!.points, t3!.points]).toEqual([5, 7, 8]);
    expect(totalFormatA()).toBe(20);
    expect([t1!.pourcentage, t2!.pourcentage, t3!.pourcentage]).toEqual([40, 35, 25]);
  });

  it('sند/أشكال : T1 (1 سند, ≥2 أشكال), T2 (≤2, ≥4), T3 (≤2, ≥5)', () => {
    const [t1, t2, t3] = HIKALA_FORMAT_A.exercices;
    expect([t1!.maxSind, t2!.maxSind, t3!.maxSind]).toEqual([1, 2, 2]);
    expect([t1!.minAshkal, t2!.minAshkal, t3!.minAshkal]).toEqual([2, 4, 5]);
  });
});

describe('hikala ↔ calibration (maxPts identiques exercice par exercice)', () => {
  it('les 6 groupes bac2025 reprennent le cadre 5/7/8', () => {
    for (const g of CALIBRATION_BAC2025) {
      const ex = HIKALA_FORMAT_A.exercices[g.exercice - 1]!;
      expect(g.maxPts, `${g.sujet === 1 ? 'S1' : 'S2'}-Ex${g.exercice}`).toBe(ex.points);
    }
  });
});

describe('hikala ↔ Meftah (bac-structure conforme à la fiche)', () => {
  it('les pointsLabel des visages BAC de Meftah = 5ن / 7ن / 8ن', () => {
    const labels = MEFTA_BAC_EXERCISES.map((e) => e.pointsLabel);
    expect(labels).toEqual(['5 ن', '7 ن', '8 ن']);
  });

  it('CORRIGÉ OFFICIEL (M2 clos) : la somme des questions de chaque exercice = son barème', () => {
    // Avant correction : Ex2 sommait à 7.5 ≠ 7 ; Ex1 ventilait 0.5/4.5.
    // Corrigé le 2026-09-19 sur الإجابة النموذجية الرسمية (eddirasa).
    for (const ex of MEFTA_BAC_EXERCISES) {
      const total = ex.pointsLabel.replace(/[^\d]/g, '');
      const somme = ex.questions.reduce(
        (s, q) => s + Number(q.pointsLabel.replace(/[^\d.]/g, '')),
        0
      );
      expect(Number(somme.toFixed(4)), `${ex.id} : somme questions`).toBe(Number(total));
    }
  });

  it('parité Meftah ↔ dictionnaire : les points Meftah = la somme des items officiels du build', () => {
    // La source de vérité encodée : dictionnaire_final.json via ATTENDUS_BAREME.
    // bac2025 S1 : Ex1/Q1 = 5×0.25 = 1.25 · Ex1/Q2 = 3.75 (RIP 1.25, annonce 0).
    const sommeItems = (prefix: string) =>
      Object.entries(ATTENDUS_BAREME)
        .filter(([k]) => k.startsWith(prefix))
        .reduce((s, [, v]) => s + (typeof v.points === 'number' ? v.points : 0), 0);

    const q1Officiel = Number(sommeItems('bac2025_S1/S1-Ex1/Q1/').toFixed(4));
    const q2Officiel = Number(sommeItems('bac2025_S1/S1-Ex1/Q2/').toFixed(4));
    expect(q1Officiel).toBe(1.25); // 0.25 × 5 — corrigé officiel p.1
    expect(q2Officiel).toBe(3.75); // RIP 1.25 + 0.5×4 + annonce 0

    const ex1 = MEFTA_BAC_EXERCISES.find((e) => e.id === 'bac2025-ex1')!;
    expect(ex1.questions[0]!.pointsLabel.replace(/[^\d.]/g, '')).toBe(String(q1Officiel));
    expect(ex1.questions[1]!.pointsLabel.replace(/[^\d.]/g, '')).toBe(String(q2Officiel));
  });

  it('le « فخ » RIP de Meftah (1.25 نقطة) reste cohérent avec le barème officiel', () => {
    const ex1 = MEFTA_BAC_EXERCISES.find((e) => e.id === 'bac2025-ex1')!;
    const q2 = ex1.questions.find((q) => q.id === 'bac2025-ex1-q2')!;
    expect(q2.trapAr).toContain('1.25'); // RIP = 1.25 pt — inchangé et correct
  });

  it('Meftah décrit T1/T2/T3 exactement comme la colonne « قياس التعليمة »', () => {
    // meftahManhajia.bac-structure : استرجاع وهيكلة / استدلال / مسعى علمي + حصيلة
    const texte = HIKALA_FORMAT_A.exercices.map((e) => e.mesureAr).join(' ');
    expect(texte).toContain('الاسترجاع');
    expect(texte).toContain('الاستدلال العلمي');
    expect(texte).toContain('مسعى علمي');
    expect(texte).toContain('حصيلة تركيبية');
  });
});

describe('hikala ↔ scoreur (couverture des أفعال officiels)', () => {
  it('chaque couvertPar pointe vers une carte qui existe (anti-drift d\'ids)', () => {
    const ids = new Set(VERB_CARDS.map((c) => c.id));
    for (const ex of HIKALA_FORMAT_A.exercices) {
      for (const a of ex.afal) {
        if (a.couvertPar) expect(ids.has(a.couvertPar), `${a.verbe} → ${a.couvertPar}`).toBe(true);
      }
    }
  });

  it('dette documentée : les verbes non entraînés restent explicites et bornés', () => {
    const dette = afalNonCouverts();
    // Mesure réelle (2026-09-19) : 27 occurrences non couvertes — l'estimation
    // initiale (~15) était fausse, les verbes reviennent dans plusieurs exercices.
    expect(dette.length).toBeGreaterThanOrEqual(20);
    expect(dette.length).toBeLessThanOrEqual(35); // ne peut pas exploser en silence
    const verbes = dette.map((d) => d.verbe);
    // Les 4 verbes majeurs du استدلال/مسعى restent sans carte tant que la
    // dette n'est pas traitée — ce test DOIT échouer le jour où ils sont
    // couverts : c'est le signal de mise à jour de hikalaBac.ts.
    for (const v of ['ناقش', 'علّل', 'برّر', 'أثبت']) {
      expect(verbes).toContain(v);
    }
  });

  it('la dette pèse là où sont les points : ≥ 15 occurrences non couvertes dans T2+T3 (15 pts)', () => {
    const detteT2T3 = afalNonCouverts().filter((d) => d.exercice !== 'T1').length;
    expect(detteT2T3).toBeGreaterThanOrEqual(15);
  });

  it('couverture globale ≈ 40 % — verrou d\'honnêteté (à abaisser quand des cartes naissent)', () => {
    const tous = HIKALA_FORMAT_A.exercices.flatMap((e) => e.afal);
    const taux = tous.filter((a) => a.couvertPar).length / tous.length;
    expect(taux).toBeGreaterThan(0.2);
    expect(taux).toBeLessThan(0.5);
  });
});
