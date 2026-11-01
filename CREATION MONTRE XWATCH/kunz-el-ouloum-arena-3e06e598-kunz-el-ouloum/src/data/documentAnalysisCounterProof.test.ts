// src/data/documentAnalysisCounterProof.test.ts
// Contre-épreuve #40 — surface « analyse de document » (DocumentAnalysisView,
// via useSmartValidation) et « Défi BAC » (InteractiveLessonView) : toutes deux
// notent sur `passed && pourcentage >= 70`, sans garde-fou de preuve.
//
// On éprouve la surface dans les DEUX sens sur les données réelles :
//   - sens direct  : la correction officielle et le gabarit suggéré passent ;
//   - sens inverse : les réponses creuses/hors-sujet ne passent pas, et la
//     règle PPM/PPSE reste bien active là où elle doit l'être.
import { describe, it, expect } from 'vitest';
import { DOCUMENT_ANALYSIS_EXERCISES } from './documentAnalysisExercises';
import { validateAnswer, type ValidationContext } from '../lib/validation/ValidationEngine';
import { getDocumentPracticeContext, getEffectiveQuestionContext } from './documentPracticeContexts';
import { isDocumentAssetAvailable } from './documentAssets';
import { answerHasDocumentContent } from '../services/documentEvidenceService';

const QUESTIONS = DOCUMENT_ANALYSIS_EXERCISES.flatMap((ex) =>
  ex.questions.map((q) => ({ ex, q })),
);

// Questions réellement atteignables par un élève : le document doit exister et
// un contexte de pratique doit être défini. C'est le périmètre du verdict.
const QUESTIONS_ATTEIGNABLES = QUESTIONS.flatMap(({ ex, q }) => {
  if (!isDocumentAssetAvailable(ex.doc.assetKey)) return [];
  const practice = getDocumentPracticeContext(ex.id, q.id);
  return practice ? [{ ex, q, practice }] : [];
});

// Note brute du moteur (forme méthodologique uniquement).
function noter(answer: string, ctx: ValidationContext) {
  const r = validateAnswer(answer, ctx);
  const pourcentage = Math.round((r.score / r.maxScore) * 100);
  return { reussi: r.passed && pourcentage >= 70, pourcentage, result: r };
}

// #41 — Verdict RÉELLEMENT affiché à l'élève : le moteur ne juge que la forme,
// le garde-fou de contenu vérifie que la réponse mobilise le document.
function verdictAffiche(
  answer: string,
  { ex, q, practice }: (typeof QUESTIONS_ATTEIGNABLES)[number],
) {
  return (
    validateAnswer(answer, getEffectiveQuestionContext(ex.id, q.id, q.ctx)).passed &&
    answerHasDocumentContent(answer, practice, ex.correctionAr)
  );
}

describe('#40 — contre-épreuve de la surface « analyse de document »', () => {
  it('sens direct : la correction officielle de chaque exercice passe sur toutes ses questions', () => {
    const refusees = QUESTIONS.filter(({ ex, q }) => !noter(ex.correctionAr, getEffectiveQuestionContext(ex.id, q.id, q.ctx)).reussi).map(
      ({ ex, q }) => `${q.id} (${noter(ex.correctionAr, getEffectiveQuestionContext(ex.id, q.id, q.ctx)).pourcentage}%)`,
    );
    expect(refusees, `corrections officielles refusées : ${refusees.join(', ')}`).toEqual([]);
  });

  it('sens direct : le gabarit suggéré ne déclenche jamais d\'erreur absurde ou critique', () => {
    // Depuis le barème positif (audit #01), un gabarit est une AMORCE de
    // structure, pas une réponse : les fragments courts (« كلما … كلما … ») sont
    // plafonnés par la règle anti-réponse-minuscule (≤ 4/20) par conception.
    // Le contrat testable : l'application ne sanctionne JAMAIS son propre
    // gabarit par une erreur critique/absurde, et un gabarit substantiel
    // (≥ 6 mots) atteint le seuil de réussite.
    const ABSURDES = new Set([
      'GIBBERISH', 'COPY_PROMPT', 'FORBIDDEN_RUBBAMA', 'WRONG_PPM_PPSE',
      'FORBIDDEN_VOLTAGE_GATED_ACH', 'FORBIDDEN_H2_REFUTE', 'FIBRILLATION_TETANIE_MIX',
      'FORBIDDEN_KULLAMA',
    ]);
    const critiques: string[] = [];
    const substantielsRefuses: string[] = [];
    for (const { ex, q } of QUESTIONS) {
      if (!q.templateHint) continue;
      const ctx = getEffectiveQuestionContext(ex.id, q.id, q.ctx);
      const r = validateAnswer(q.templateHint, ctx);
      const absurde = r.errors.find((e) => ABSURDES.has(e.code));
      if (absurde) critiques.push(`${q.id} → ${absurde.code}`);
      const mots = q.templateHint.trim().split(/\s+/).filter((t) => t.length >= 2).length;
      if (mots >= 6 && !noter(q.templateHint, ctx).reussi) substantielsRefuses.push(q.id);
    }
    expect(critiques, `gabarits sanctionnés par une erreur absurde : ${critiques.join(', ')}`).toEqual([]);
    expect(substantielsRefuses, `gabarits substantiels refusés : ${substantielsRefuses.join(', ')}`).toEqual([]);
  });

  // #41 — Ce test a d'abord ÉCHOUÉ : les 43 questions affichaient « مقبول »
  // pour une réponse hors-sujet notée 80-95 %. Il est la contre-épreuve du
  // garde-fou de contenu ajouté au verdict affiché.
  it('sens inverse : aucune réponse creuse, hors-sujet ou creuse-mais-bien-formée n’est affichée comme acceptée', () => {
    const rebuts = {
      creuse: 'لا اعرف الجواب',
      horsSujet: 'كرة القدم رياضة جميلة والطقس حار اليوم في المدينة',
      vide: '   ',
      baratin: 'الجواب صحيح لان النتيجه واضحه جدا ومنطقيه تماما',
      copieEnonce: 'قارن بين الوثيقة الاولى والثانية',
    };
    const fuites: string[] = [];
    for (const [nom, texte] of Object.entries(rebuts)) {
      for (const item of QUESTIONS_ATTEIGNABLES) {
        if (verdictAffiche(texte, item)) fuites.push(`${item.q.id} accepte « ${nom} »`);
      }
    }
    expect(fuites, `réponses non valables affichées comme acceptées : ${fuites.join(', ')}`).toEqual(
      [],
    );
  });

  // Contre-partie obligatoire : le garde-fou ne doit pas punir un bon élève.
  it('le garde-fou de contenu laisse passer 100 % des corrections officielles atteignables', () => {
    expect(QUESTIONS_ATTEIGNABLES.length).toBeGreaterThan(25);
    const refusees = QUESTIONS_ATTEIGNABLES.filter(
      (item) => !verdictAffiche(item.ex.correctionAr, item),
    ).map((item) => item.q.id);
    expect(refusees, `corrections officielles bloquées par le garde-fou : ${refusees.join(', ')}`).toEqual(
      [],
    );
  });

  it('#40 — un exercice ne peut pas sanctionner le terme que son énoncé exige', () => {
    // La règle PPM/PPSE est juste, mais elle ne doit s'appliquer qu'à la jonction
    // neuromusculaire. L'exercice de comparaison synaptique la déclenchait sur
    // « PPSE » — le mot même que la question ordonne d'employer — rendant ses
    // deux questions infranchissables quelle que soit la qualité de la réponse.
    const synaptique = DOCUMENT_ANALYSIS_EXERCISES.find((e) => e.id === 'ppse_ppsi_compare')!;
    for (const q of synaptique.questions) {
      expect(q.ctx.isNeuromuscular, `${q.id} ne porte pas sur la jonction neuromusculaire`).toBe(false);
      const r = noter('نلاحظ أن PPSE إزالة استقطاب بينما PPSI فرط استقطاب في الاتجاه.', q.ctx);
      expect(r.result.errors.some((e) => e.code === 'WRONG_PPM_PPSE'), `${q.id}`).toBe(false);
      expect(r.reussi, `${q.id} reste infranchissable`).toBe(true);
    }
  });

  it('anti-laxisme : la règle PPM/PPSE reste critique sur la jonction neuromusculaire', () => {
    // Contrôle négatif du correctif : on a corrigé l'étiquetage des données,
    // pas la règle. Elle doit continuer de sanctionner la vraie confusion.
    const jnm = DOCUMENT_ANALYSIS_EXERCISES.find((e) => e.id === 'nmj_ppm_courbe')!;
    const r = validateAnswer(
      'نلاحظ كمون ما بعد التشابك PPSE يساوي 70 ملي ثانية عند اللوحة المحركة',
      jnm.questions[0].ctx,
    );
    expect(r.errors.some((e) => e.code === 'WRONG_PPM_PPSE' && e.severity === 'critical')).toBe(true);
  });

  it('garde-fou durable : toute question étiquetée neuromusculaire porte bien sur la JNM', () => {
    // Empêche qu'un futur exercice synaptique réintroduise le même piège fermé.
    const suspects = QUESTIONS.filter(
      ({ ex, q }) =>
        q.ctx.isNeuromuscular === true &&
        /PPSE|PPSI/.test(q.promptAr) &&
        !/اللوحة المحركة|PPM/.test(q.promptAr) &&
        ex.id !== '__aucun__',
    ).map(({ q }) => q.id);
    expect(suspects, `questions synaptiques marquées neuromusculaires : ${suspects.join(', ')}`).toEqual([]);
  });
});
