// calibrationBac2025.test.ts — Verrous de la notation R6 (Pierre 2 : attendus
// obligatoires) + garde du LEGACY (fit linéaire, déprécié hors recherche).
//
// R6 : la note = min(couverture_attendus × maxPts, plafonds d'intégrité).
// Le dénominateur est le REGISTRE (attendusBac2025.ts) — la banque d'unité
// n'est plus jamais un dénominateur (audit C1/C2 : elle payait les salades 8/8).

import { describe, expect, it } from 'vitest';
import {
  CALIBRATION_BAC2025,
  noterDepuisCouverture,
  noterCopieCalibree,
  noterExerciceCalibre,
  uniteDeGroupe,
} from './calibrationBac2025';
import { attendusDeGroupe } from './attendusBac2025';
import { normalizeAr } from '../../lib/validation/normalizeAr';
import { MEFTA_BAC_EXERCISES } from '../meftahManhajia';
import { PLAFONDS } from './integriteCopie';

// Réponse qui contient TOUS les textes officiels d'un groupe → toutes les
// formes matchent → couverture 1 → note max (cohérence registre ↔ scoreur).
function reponseExhaustive(sujet: 1 | 2, exercice: 1 | 2 | 3): string {
  return attendusDeGroupe(sujet, exercice).items.map((i) => i.texteAr).join(' ');
}

describe('R6 — invariants de la notation par attendus obligatoires', () => {
  it('copie vide → 0 pt sur les 6 groupes', () => {
    for (const sujet of [1, 2] as const) {
      for (const exercice of [1, 2, 3] as const) {
        expect(noterExerciceCalibre('', sujet, exercice).points).toBe(0);
      }
    }
  });

  it('texte couvrant TOUS les attendus → note max (plafond auto = barème)', () => {
    for (const sujet of [1, 2] as const) {
      for (const exercice of [1, 2, 3] as const) {
        const n = noterExerciceCalibre(reponseExhaustive(sujet, exercice), sujet, exercice);
        expect(n.couverture, `S${sujet}-Ex${exercice}`).toBe(1);
        expect(n.points).toBe(n.maxPts);
        expect(n.plafonds).toEqual([]); // c'est de la prose officielle
      }
    }
  });

  it('points = couverture × maxPts, sauf plafond d’intégrité (formule R6)', () => {
    for (const sujet of [1, 2] as const) {
      for (const exercice of [1, 2, 3] as const) {
        const n = noterExerciceCalibre(reponseExhaustive(sujet, exercice).slice(0, 400), sujet, exercice);
        const borne = Math.min(...(n.plafonds.length ? n.plafonds.map((p) => p.plafondPct) : [1])) * n.maxPts;
        expect(n.points).toBeLessThanOrEqual(Math.round(borne * 100) / 100 + 1e-9);
        expect(n.points).toBe(Math.round(Math.min(n.couverture * n.maxPts, borne) * 100) / 100);
      }
    }
  });

  it('le déversement de la banque d’unité NE PAIE PLUS (fin du détecteur de déversement)', () => {
    // Texte « immunité » (banque U4) sur S2-Ex3 (transfusion) : avant R6 il
    // saturait 8/8 ; il ne touche presque aucun attendu officiel du groupe.
    const immunité =
      'المستضد أجسام مضادة خلايا بلازمية معقد مناعي بلعمة المتمم الانتقاء النسيلي خلايا ذاكرة ' +
      'الاستجابة الأولية الاستجابة الثانوية اللقاح LTc البرفورين الغرانزيمات TCR LT4 الإنترلوكين GP120 CD4';
    const n = noterExerciceCalibre(immunité, 2, 3);
    expect(n.points).toBeLessThanOrEqual(0.25 * 8); // ≤ 2/8 — quasi rien
    expect(n.couverture).toBeLessThan(0.3);
  });

  it('hors-sujet intrinsèque → 0 (sans aucun paramètre : les attendus sont OBLIGATOIRES)', () => {
    const reflexe =
      'المنعكس العضلي ثنائي المشبك يمر عبر النخاع الشوكي، واللوحة المحركة هي البنية النهائية، ' +
      'وآلية الإدماج الزمني والفضائي تحدد شدة الاستجابة، وقانون الكل أو لا شيء يحكم المحور الأسطواني.';
    const n = noterExerciceCalibre(reflexe, 1, 3);
    expect(n.couverture).toBe(0);
    expect(n.points).toBe(0);
  });

  it('groupe inconnu → throw du registre (jamais de dénominateur de substitution)', () => {
    // attendusDeGroupe lève ; noterExerciceCalibre ne peut pas être appelé hors 2025.
    expect(() => attendusDeGroupe(3 as 1 | 2, 3)).toThrow(/attendu/);
  });

  it('mapping unités (diagnostic) inchangé : S1 [1,6,5] · S2 [7,3,4]', () => {
    const copie = noterCopieCalibree(['', '', ''], 1);
    expect(copie.exercices.map((e) => e.uniteId)).toEqual([1, 6, 5]);
    const copie2 = noterCopieCalibree(['', '', ''], 2);
    expect(copie2.exercices.map((e) => e.uniteId)).toEqual([7, 3, 4]);
  });

  it('total copie = somme des exercices ≤ 20', () => {
    const copie = noterCopieCalibree([reponseExhaustive(1, 1), reponseExhaustive(1, 2), reponseExhaustive(1, 3)], 1);
    expect(copie.total).toBe(20);
    expect(copie.total).toBeLessThanOrEqual(20);
  });
});

describe('R6 — contrôles positifs : les réponses modèle de Meftah', () => {
  // Les visages BAC sont écrits depuis les عناصر الإجابة officiels → ils
  // doivent couvrir ~tout le registre. Avant R6 : 16,05/20 (Ex3 à 5,18/8).
  const MODELES = MEFTA_BAC_EXERCISES.map((ex) => ({
    id: ex.id,
    texte: ex.questions.flatMap((q) => q.writeAr).join('\n'),
    exercice: (ex.id.endsWith('1') ? 1 : ex.id.endsWith('2') ? 2 : 3) as 1 | 2 | 3,
  }));

  it('couverture ≥ 85 % et note ≥ 90 % du max pour chaque réponse modèle', () => {
    for (const m of MODELES) {
      const n = noterExerciceCalibre(m.texte, 1, m.exercice);
      expect(n.couverture, `${m.id} couverture`).toBeGreaterThanOrEqual(0.85);
      expect(n.points, `${m.id} points`).toBeGreaterThanOrEqual(0.9 * n.maxPts);
      expect(n.plafonds, `${m.id} — aucun plafond sur une copie légitime`).toEqual([]);
    }
  });

  it('copie modèle complète ≈ 19-20/20 (avant R6 : 16,05)', () => {
    const copie = noterCopieCalibree(
      MODELES.map((m) => m.texte) as [string, string, string],
      1
    );
    expect(copie.total).toBeGreaterThanOrEqual(18);
    expect(copie.total).toBeLessThanOrEqual(20);
  });
});

describe('LEGACY — noterDepuisCouverture (déprécié, gelé pour recherche)', () => {
  it('ancres de régression (fit 80 copies, pleine précision) — inchangées', () => {
    expect(noterDepuisCouverture(0, 1, 1).points).toBe(0);
    const g = CALIBRATION_BAC2025[0]!;
    const brut = g.a * 0.2 + g.b;
    expect(noterDepuisCouverture(0.2, 1, 1).points).toBe(Math.min(g.maxPts, Math.max(0, brut)));
  });
});

describe('compat — uniteDeGroupe (mapping diagnostic verrouillé)', () => {
  it('S1-Ex3 → U5 · S2-Ex3 → U4', () => {
    expect(uniteDeGroupe(1, 3)!.uniteId).toBe(5);
    expect(uniteDeGroupe(2, 3)!.uniteId).toBe(4);
  });
});

// Garde anti-fuite : la couverture exposée vient du registre, pas de la banque.
describe('R6 — traçabilité', () => {
  it('la note expose son registre et ses verdicts (transparence prof)', () => {
    const n = noterExerciceCalibre('تمثل الوثيقة تأثير Mtb. نلاحظ ارتباطه بالمستقبل ومنه يعيق الأدينوزين.', 1, 3);
    expect(n.registre.items.length).toBeGreaterThan(0);
    expect(n.verdicts.length).toBe(n.registre.items.length);
    expect(normalizeAr(n.registre.questionAr).length).toBeGreaterThan(10);
  });
});
