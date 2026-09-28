// c7.hardening.test.ts — C7 (fin du fallback silencieux) + C4b (pénalités fortes).
//
// Mesures du 2026-09-19 : calcul Chargaff 100 % (verifAr) · pedigree 100 % (verifAr) ·
// hypothèse concise ancrée 100 % (fin de la porte « 60 caractères ») · hyp vague 0 % ·
// Meftah Ex3 7,5/8 → 7/8 si inversion AChE ajoutée (−0,5 n / sanction forte).

import { describe, expect, it } from 'vitest';
import { evaluateStudentProduction } from '../../utils/methodologyScorer';
import { noterExerciceCalibre } from '../../data/dictionaries/calibrationBac2025';
import { MEFTA_BAC_EXERCISES } from '../../data/meftahManhajia';

describe('C7 — verifAr : le contenu appartient à la carte', () => {
  it('calc_c1 (Chargaff) : la loi au propre passe, sinon échoue', () => {
    const bon = evaluateStudentProduction(
      'verb_calcul_v1',
      'حسب قانون Chargaff : %A = %T و %G = %C و %A + %G = 50%. بالتعويض: %G = 50% - 30% = 20%. ومنه %G = 20%.'
    );
    expect(bon.criteriaResults.find((c) => c.criterionId === 'calc_c1')!.passed).toBe(true);

    const sansLoi = evaluateStudentProduction(
      'verb_calcul_v1',
      'بالتعويض المباشر في المعطيات: %G = 50% - 30% = 20%. ومنه النتيجة النهائية هي 20%.'
    );
    expect(sansLoi.criteriaResults.find((c) => c.criterionId === 'calc_c1')!.passed).toBe(false);
  });

  it('ped_c3 : الحكمان + الأنماط بالترميز — pas un « length > 40 »', () => {
    const bon = evaluateStudentProduction(
      'verb_pedigree_v1',
      'أبوان سليمان I1 و I2 أنجبا بنتا مصابة، ومنه المرض متنح. بنت مصابة من أب سليم يعني الموقع جسمي، والأنماط: I1 Aa و I2 Aa و II3 aa.'
    );
    expect(bon.criteriaResults.find((c) => c.criterionId === 'ped_c3')!.passed).toBe(true);

    const sansCodage = evaluateStudentProduction(
      'verb_pedigree_v1',
      'أبوان سليمان I1 و I2 أنجبا بنتا مصابة، ومنه المرض متنح وهو غير مرتبط بالجنس بل ينتقل بشكل جسمي في العائلة المذكورة.'
    );
    expect(sansCodage.criteriaResults.find((c) => c.criterionId === 'ped_c3')!.passed).toBe(false);
  });
});

describe('C7 — la concision n est plus punie, le verbiage ne paie plus', () => {
  it('hyp_c2 : mécanisme sémantique requis (marqueur), pas « 60 caractères »', () => {
    const ancree = evaluateStudentProduction(
      'verb_hypothesis_v1',
      'نقترح أن المادة Mtb ترتبط بمستقبل الأدينوزين A1R ومنه يعود إفراز النورأدرينالين ويزداد النشاط العصبي.'
    );
    expect(ancree.criteriaResults.find((c) => c.criterionId === 'hyp_c2')!.passed).toBe(true);
    expect(ancree.icm).toBe(100);

    const vague = evaluateStudentProduction(
      'verb_hypothesis_v1',
      'ربما المادة تفعل شيئا ما في الجسم فتصبح الحالة مختلفة عن السابق تماما في كل شيء وربما لا تفعل شيئا.'
    );
    expect(vague.criteriaResults.find((c) => c.criterionId === 'hyp_c2')!.passed).toBe(false);
    expect(vague.icm).toBeLessThan(50);
  });

  it('an_c4 : une conclusion concise passe (fin du seuil « 50 caractères »)', () => {
    const rep = evaluateStudentProduction(
      'verb_analyse_v1',
      'تمثل الوثيقة منحنى تغيرات التركيز مع الزمن. نلاحظ تزايد التركيز من 2 إلى 5 غ/ل. نستنتج أن التركيز يتزايد مع الزمن.'
    );
    expect(rep.criteriaResults.find((c) => c.criterionId === 'an_c4')!.passed).toBe(true);
  });

  it('verbId inconnu → throw (non-régression, Pierre 1)', () => {
    expect(() => evaluateStudentProduction('verb_inexistant_xyz', 'نص طويل بما يكفي هنا للتجربة.')).toThrow(/verbId inconnu/);
  });
});

describe('C4b — les inversions factuelles coûtent 0,5 n ; les vigilances rien', () => {
  const MEFTAH_EX3 = MEFTA_BAC_EXERCISES.find((e) => e.id === 'bac2025-ex3')!
    .questions.flatMap((q) => q.writeAr).join('\n');

  // Ventilation par partie (E, 2026-09-27) : la note modèle Ex3 = 1,5 (P1) +
  // 3,0×(4,5/3,5) (P2, item NE non crédité — voir plus bas) + 2,0 (P3) = 7,36.
  // L'item NE (corr-2025-19) exige « النورادرينالين » mais le corrigé officiel
  // écrit « NE » : la copie modèle elle-même ne le crédite pas (bug de formes
  // ouvert pour F2 — docs/DIAGNOSTIC_EX3.md §3).
  //
  // F3 (2026-09-28) : l'item schéma (corr-2025-25) est devenu MANUEL — un
  // schéma est une structure (flèches, deux branches), aucune signature keyword
  // ne le distingue d'un récit (preuve : eleve_28, schéma absent noté 0/2 par
  // le prof, créditait 0,5 via le prose de الربط). Sa part (0,5 registre → 1,0
  // officiel) passe en réserve humaine : note auto max = 6,36, fourchette
  // [6,36 ; 7,36] (+1,0 arbitré, et l'item NE non crédité plafonne à 7,36 sur
  // l'échelle officielle complète).
  const NOTE_MODELE_EX3 = 6.36;

  it('copie saine : aucune sanction forte, note intacte', () => {
    const n = noterExerciceCalibre(MEFTAH_EX3, 1, 3);
    expect(n.sanctionsForte).toHaveLength(0);
    expect(n.points).toBe(NOTE_MODELE_EX3);
  });

  it('inversion AChE greffée → −0,5 n affichée avec sa raison', () => {
    const n = noterExerciceCalibre(MEFTAH_EX3 + '\nيتحرر الأستيل كولين استراز من الحويصلة المشبكية.', 1, 3);
    expect(n.sanctionsForte.map((s) => s.id)).toContain('acetylcholinesterase_liberee');
    expect(n.points).toBe(NOTE_MODELE_EX3 - 0.5);
  });

  it('vigilance seule (مصفوفة + قالبية) → aucune pénalité', () => {
    const n = noterExerciceCalibre(MEFTAH_EX3 + '\nالمصفوفة تختلف عن السلسلة القالبية في التركيب.', 1, 3);
    expect(n.sanctionsForte).toHaveLength(0);
    expect(n.points).toBe(NOTE_MODELE_EX3);
  });

  it('la pénalité ne descend jamais sous 0 (plancher)', () => {
    const n = noterExerciceCalibre(
      'يتحرر الأستيل كولين استراز من الحويصلة. الرامزة المضادة موجودة على ARNm.',
      1,
      3
    );
    expect(n.points).toBeGreaterThanOrEqual(0);
    expect(n.points).toBeLessThan(0.5);
  });
});
