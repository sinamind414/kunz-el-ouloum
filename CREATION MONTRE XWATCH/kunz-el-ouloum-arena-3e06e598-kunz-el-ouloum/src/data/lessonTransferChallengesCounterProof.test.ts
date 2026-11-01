// src/data/lessonTransferChallengesCounterProof.test.ts
// Contre-épreuve du « Défi BAC » (InteractiveLessonView), surface qui enregistre
// une preuve de TRANSFERT — le signal de maîtrise le plus fort de l'application.
//
// #41 — Avant correctif : les 3 défis étaient validés à 80-95 % par une réponse
// hors-sujet, car ValidationEngine note la FORME méthodologique et non le fond.
import { describe, it, expect } from 'vitest';
import { LESSON_TRANSFER_CHALLENGES, hasTransferContent } from './lessonTransferChallenges';
import { validateAnswer } from '../lib/validation/ValidationEngine';

const DEFIS = Object.values(LESSON_TRANSFER_CHALLENGES);

// Reproduit exactement la règle de InteractiveLessonView.
function verdictAffiche(answer: string, defi: (typeof DEFIS)[number]) {
  const r = validateAnswer(answer, {
    ...defi.validation,
    isNeuromuscular: defi.validation.isNeuromuscular ?? false,
  });
  const pourcentage = Math.round((r.score / r.maxScore) * 100);
  return r.passed && pourcentage >= 70 && hasTransferContent(answer, defi);
}

describe('#41 — contre-épreuve du Défi BAC', () => {
  it('sens direct : la correction officielle de chaque défi est acceptée', () => {
    const refusees = DEFIS.filter((d) => !verdictAffiche(d.correctionAr, d)).map((d) => d.id);
    expect(refusees, `corrections officielles refusées : ${refusees.join(', ')}`).toEqual([]);
  });

  it('sens inverse : aucune réponse hors-sujet ou creuse ne valide un défi', () => {
    const rebuts = {
      horsSujet: 'كرة القدم رياضة جميلة والطقس حار اليوم في المدينة',
      creuse: 'لا اعرف الجواب',
      vide: '   ',
      baratin: 'الجواب صحيح لان النتيجه واضحه جدا ومنطقيه تماما',
    };
    const fuites: string[] = [];
    for (const [nom, texte] of Object.entries(rebuts)) {
      for (const d of DEFIS) if (verdictAffiche(texte, d)) fuites.push(`${d.id} accepte « ${nom} »`);
    }
    expect(fuites, `défis validés à tort : ${fuites.join(', ')}`).toEqual([]);
  });

  it('une réponse d’élève reformulée, sans recopier le corrigé, reste acceptée', () => {
    // Deux notions du corrigé suffisent : le défi évalue une production.
    const defi = LESSON_TRANSFER_CHALLENGES['d1-u1-l2-transcription'];
    expect(defi).toBeDefined();
    expect(hasTransferContent('يبدا الوسم في النواه اين يتم تركيب arnm ثم ينتقل', defi)).toBe(true);
  });

  it('chaque défi possède une correction exploitable comme référence de contenu', () => {
    for (const d of DEFIS) expect(d.correctionAr.trim().length, d.id).toBeGreaterThan(30);
  });
});
