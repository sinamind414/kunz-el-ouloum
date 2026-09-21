// integriteCopie.test.ts — CONTRE-PROBES du correcteur (Pierres 1+2).
//
// Pierre 1 (audit C2) : plafonds d'intégrité sur la note (non-prose 30 %,
// négations 50 %, perroquet 25 %) — Meftah en contrôle positif.
// Pierre 2 (R6) : les attendus sont OBLIGATOIRES (registre) — le hors-sujet
// intrinsèque fait 0 sans aucun paramètre, la banque d'unité ne paie plus.
//
// Mesures du 2026-09-19 (sorties réelles, S1-Ex3 /8) :
//   AVANT Pierres 1+2 : salade 8/8 · hors-sujet 8/8 · négations 8/8 · perroquet 8/8
//   APRÈS             : 1/8 · 0/8 · 1/8 · 0.5/8 — et les réponses modèle ≥ 93 %.

import { describe, expect, it } from 'vitest';
import { MEFTA_BAC_EXERCISES } from '../meftahManhajia';
import { noterExerciceCalibre, uniteDeGroupe } from './calibrationBac2025';
import { evaluateStudentProduction } from '../../utils/methodologyScorer';
import {
  analyserSignaux,
  calculerPlafonds,
  appliquerPlafonds,
  PLAFONDS,
  SEUIL_ECHO,
  SEUIL_NEGATIONS,
} from './integriteCopie';

// ── Fabrique : réponse modèle = toutes les writeAr d'un exercice Meftah ──────
function reponseModeleMeftah(exId: string): string {
  const ex = MEFTA_BAC_EXERCISES.find((e) => e.id === exId);
  if (!ex) throw new Error(`exercice Meftah introuvable : ${exId}`);
  return ex.questions.flatMap((q) => q.writeAr).join('\n');
}

const MAX = { ex1: 5, ex2: 7, ex3: 8 } as const;

// ─────────────────── C1 : contrôles positifs Meftah (non-régression) ─────────

describe('C1 — les réponses modèles de Meftah : couvertes, non plafonnées', () => {
  const cas: { exId: string; exercice: 1 | 2 | 3 }[] = [
    { exId: 'bac2025-ex1', exercice: 1 },
    { exId: 'bac2025-ex2', exercice: 2 },
    { exId: 'bac2025-ex3', exercice: 3 },
  ];

  for (const { exId, exercice } of cas) {
    it(`${exId} : couverture ≥ 85 %, note ≥ 90 % du max, AUCUN plafond`, () => {
      const texte = reponseModeleMeftah(exId);
      const n = noterExerciceCalibre(texte, 1, exercice);

      expect(n.signaux.estProse, 'la réponse modèle est de la prose').toBe(true);
      expect(n.signaux.negations.length, 'pas de négations d\'assertion').toBeLessThan(SEUIL_NEGATIONS);
      expect(n.signaux.ratioEcho ?? 0, 'pas un perroquet de l\'énoncé').toBeLessThanOrEqual(SEUIL_ECHO);
      expect(n.plafonds, 'AUCUN plafond sur une copie légitime').toEqual([]);
      expect(n.couverture, `${exId} couverture registre`).toBeGreaterThanOrEqual(0.85);
      expect(n.points).toBeGreaterThanOrEqual(0.9 * MAX[`ex${exercice}` as 'ex1' | 'ex2' | 'ex3']);
    });
  }

  it('une hypothèse concise conforme à Meftah reste une prose honnête', () => {
    // مفتاح++ enseigne l'« إيجاز لا شرح كامل » — la concision n'est pas une salade.
    const hypothese =
      'نقترح أن المادة Mtb ترتبط بمستقبل الأدينوزين A1R، ومنه يرتفع النشاط العصبي وتظهر اليقظة.';
    const s = analyserSignaux(hypothese);
    expect(s.estProse).toBe(true);
  });
});

// ─────────────────── C2 : les pièges (avant : 8/8 partout) ───────────────────

describe('C2 — contre-probes : les pièges ne paient plus', () => {
  it('PIÈGE 1 — salade de mots-clés : ≤ 30 % du max (non_prose + quasi-nulle en attendus)', () => {
    const salade = 'مضخة الغلوتامات. المورفين ATS؟ PPSE — المشبك الكيميائي الحويصلات';
    const n = noterExerciceCalibre(salade, 1, 3);
    expect(n.signaux.estProse).toBe(false);
    expect(n.plafonds.map((p) => p.type)).toContain('non_prose');
    expect(n.points).toBeLessThanOrEqual(PLAFONDS.non_prose * MAX.ex3 + 1e-9);
    expect(n.points).toBeLessThanOrEqual(2); // mesuré : 1/8 (cov ≈ 13 %)
  });

  it('PIÈGE 2 — perroquet (énoncé recopié) : ≤ 25 % (echo_question)', () => {
    // Depuis Pierre 2, l'énoncé vient du REGISTRE par défaut.
    const question = noterExerciceCalibre('réponse', 1, 3).registre.questionAr;
    const perroquet = question + ' وهذه هي الإجابة عن هذا السؤال المطروح.';
    const n = noterExerciceCalibre(perroquet, 1, 3);
    expect(n.signaux.ratioEcho!).toBeGreaterThan(SEUIL_ECHO);
    expect(n.plafonds.map((p) => p.type)).toContain('echo_question');
    expect(n.points).toBeLessThanOrEqual(PLAFONDS.echo_question * MAX.ex3 + 1e-9);
  });

  it('PIÈGE 3 — négations (tout est faux) : ≤ 50 % (negation) et quasi-nulle en attendus', () => {
    const negations =
      'لا يوجد أستيل كولين في المشبك الكيميائي، والناقل العصبي لا يتحرر من الحويصلات المشبكية، ' +
      'والمستقبلات لا تلتقطه، وزوال الاستقطاب مستحيل، والأستيل كولين استراز غير موجود.';
    const n = noterExerciceCalibre(negations, 1, 3);
    expect(n.signaux.negations.length).toBeGreaterThanOrEqual(SEUIL_NEGATIONS);
    expect(n.plafonds.map((p) => p.type)).toContain('negation');
    expect(n.points).toBeLessThanOrEqual(PLAFONDS.negation * MAX.ex3 + 1e-9);
    expect(n.couverture).toBeLessThan(0.25); // les bons mots, le sens faux : quasi rien
  });

  it('PIÈGE 3bis — une négation légitime dans une vraie explication ne plafonne PAS', () => {
    // Causalité officielle (le corrigé dit « عدم إفراز NE ») — c'est du contenu.
    const legitime =
      'تمثل الوثيقة تأثير Mtb على المشبك. نلاحظ أن Mtb يمنع ارتباط الأدينوزين بمستقبله، ' +
      'ومنه تعود قنوات الكالسيوم ويُفرز النورأدرينالين من الحويصلات فيزداد النشاط العصبي.';
    const n = noterExerciceCalibre(legitime, 1, 3);
    expect(n.plafonds.map((p) => p.type)).not.toContain('negation');
  });

  it('PIÈGE 4 — hors-sujet intrinsèque : 0 pt SANS aucun paramètre (Pierre 2)', () => {
    // La question porte sur les drogues au synapse ; l'élève récite le réflexe.
    // Avant Pierre 2 il fallait fournire les attendus à la main — ils sont
    // maintenant OBLIGATOIRES via le registre : la dette est PAYÉE.
    const reflexe =
      'المنعكس العضلي ثنائي المشبك يمر عبر النخاع الشوكي، واللوحة المحركة هي البنية النهائية، ' +
      'وآلية الإدماج الزمني والفضائي تحدد شدة الاستجابة، وقانون الكل أو لا شيء يحكم المحور الأسطواني.';
    const n = noterExerciceCalibre(reflexe, 1, 3);
    expect(n.couverture).toBe(0);
    expect(n.points).toBe(0);
  });

  it('PIÈGE 4bis (dette PAYÉE) — la banque d’unité entière ne paie plus sur un autre groupe', () => {
    // Toute la banque U4 (immunité) déversée sur S2-Ex3 (transfusion) : avant
    // Pierre 2 → 8/8. La note vient du registre : quasi rien.
    const immunité =
      'المستضد أجسام مضادة خلايا بلازمية معقد مناعي بلعمة المتمم الانتقاء النسيلي خلايا ذاكرة ' +
      'الاستجابة الأولية الاستجابة الثانوية اللقاح LTc البرفورين الغرانزيمات TCR LT4 الإنترلوكين GP120 CD4';
    const n = noterExerciceCalibre(immunité, 2, 3);
    expect(n.points).toBeLessThanOrEqual(0.25 * 8);
  });

  it('copie vide → 0 (inchangé)', () => {
    expect(noterExerciceCalibre('', 1, 3).points).toBe(0);
  });
});

// ─────────────────── C3 : unités du blindage ─────────────────────────────────

describe('C3 — analyserSignaux / plafonds (unités)', () => {
  it('prose : ≥2 phrases OU 1 phrase + marqueur de relation', () => {
    expect(analyserSignaux('تمثل الوثيقة منحنى تغيرات. نلاحظ تزايد القيم مع الزمن.').estProse).toBe(true);
    expect(analyserSignaux('فكلما زاد تركيز المادة نقص النشاط.').estProse).toBe(true);
    expect(analyserSignaux('أ B C D').estProse).toBe(false);
  });

  it('echo : question verbatim → ~1.0 ; réponse originale → faible', () => {
    const q = 'كيف يقوي استهلاك Mtb اليقظة ويقلل الشعور بالنعاس؟';
    const perroquet = analyserSignaux(q + ' وهذه هي الإجابة.', q);
    expect(perroquet.ratioEcho!).toBeGreaterThan(SEUIL_ECHO);

    const originale = analyserSignaux(
      'تمثل الوثيقة نتائج قياس النشاط العصبي. نلاحظ أن المجموعة الثانية تحتفظ بنشاط مرتفع ومنه تؤكد الفرضية.',
      q
    );
    expect(originale.ratioEcho!).toBeLessThan(SEUIL_ECHO);
  });

  it('appliquerPlafonds : le plus petit plafond gagne, jamais au-delà de maxPts', () => {
    const signaux: Parameters<typeof calculerPlafonds>[0] = {
      nbMots: 10,
      estProse: false,
      negations: Array(SEUIL_NEGATIONS).fill('لا يوجد'),
      ratioEcho: null,
    };
    const plafonds = calculerPlafonds(signaux);
    expect(plafonds.map((p) => p.type)).toEqual(expect.arrayContaining(['non_prose', 'negation']));
    expect(appliquerPlafonds(8, 8, plafonds)).toBeCloseTo(PLAFONDS.non_prose * 8, 2);
    expect(appliquerPlafonds(1, 8, plafonds)).toBe(1); // note inférieure : intacte
    expect(appliquerPlafonds(8, 8, [])).toBe(8);
  });
});

// ─────────────────── C4 : scorer méthodo ─────────────────────────────────────

describe('C4 — scorer : verbId inconnu → throw (fin de la note silencieuse)', () => {
  it('« hypothesize » (espace reflexes.ts) ne note plus contre la carte analyse', () => {
    expect(() =>
      evaluateStudentProduction('hypothesize', 'نقترح أن المادة ترتبط بالمستقبل.')
    ).toThrow(/verbId inconnu/);
  });
});

// ─────────────────── C5 : compat arité historique ────────────────────────────

describe('C5 — compat arité historique', () => {
  it('noterExerciceCalibre(reponse, sujet, exercice) sans options : compile et note', () => {
    const n = noterExerciceCalibre(
      'تمثل الوثيقة تأثير المخدرات. نلاحظ أن المورفين يقلل تحرر الناقل ومنه ينخفض النشاط.',
      1,
      3
    );
    expect(n.maxPts).toBe(8);
    expect(n.plafonds).toEqual([]);
  });

  it('uniteDeGroupe : mapping verrouillé', () => {
    expect(uniteDeGroupe(1, 3)!.uniteId).toBe(5);
    expect(uniteDeGroupe(2, 3)!.uniteId).toBe(4);
  });
});
