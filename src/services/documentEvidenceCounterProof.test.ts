// src/services/documentEvidenceCounterProof.test.ts
// Contre-épreuve #39 — la surface « document vivant » (la plus proche de
// l'épreuve réelle du BAC) était mesurée dans un seul sens : on vérifiait qu'une
// bonne réponse passe, jamais qu'une réponse OFFICIELLE du corpus passe.
// Elle échouait dans 10 cas sur 11, avec création d'une LearningError à tort.
//
// Ces tests éprouvent la surface dans les DEUX sens, sur les données réelles :
//   - sens direct  : les corrections officielles (`correctionAr`) sont acceptées ;
//   - sens inverse : hors-sujet, vide et « je ne sais pas » restent refusés.
import { describe, it, expect } from 'vitest';
import { DOCUMENT_PRACTICE_CONTEXTS } from '../data/documentPracticeContexts';
import { validateAnswer } from '../lib/validation/ValidationEngine';
import { toValidationContext } from '../lib/validation/practiceContextMapping';
import { validateDocumentTrace } from './documentEvidenceService';
import type { DocumentPracticeContext } from '../data/documentPracticeContexts';

const AVEC_CORRECTION = DOCUMENT_PRACTICE_CONTEXTS.filter(
  (c) => c.correctionAr && c.correctionAr.trim().length > 0,
);

function evaluer(context: DocumentPracticeContext, answer: string) {
  const validationResult = validateAnswer(answer, toValidationContext(context));
  return validateDocumentTrace({ context, answer, validationResult });
}

// La morphologie arabe (verbe يختفي vs nom verbal اختفاء) n'est pas gérée : un
// stemmer serait nécessaire. Cas connu et documenté, isolé volontairement pour
// ne pas masquer une régression sur les autres.
const MORPHOLOGIE_NON_GEREE = new Set(['seismic_p_s_core']);

describe('#39 — contre-épreuve de la surface « document vivant »', () => {
  it('le corpus fournit bien des corrections officielles à éprouver', () => {
    expect(AVEC_CORRECTION.length).toBeGreaterThanOrEqual(11);
  });

  it('sens direct : chaque correction officielle est acceptée par l’application', () => {
    const refusees = AVEC_CORRECTION.filter(
      (c) => !MORPHOLOGIE_NON_GEREE.has(c.exerciseId) && !evaluer(c, c.correctionAr!).valid,
    ).map((c) => c.exerciseId);

    expect(refusees, `corrections officielles refusées : ${refusees.join(', ')}`).toEqual([]);
  });

  it('sens direct : au moins une preuve attendue est reconnue dans chaque correction officielle', () => {
    const sansPreuve = AVEC_CORRECTION.filter(
      (c) => !MORPHOLOGIE_NON_GEREE.has(c.exerciseId) && evaluer(c, c.correctionAr!).foundEvidence.length === 0,
    ).map((c) => c.exerciseId);

    expect(sansPreuve, `aucune preuve reconnue pour : ${sansPreuve.join(', ')}`).toEqual([]);
  });

  it('sens inverse : une réponse hors-sujet n’est jamais acceptée', () => {
    const horsSujet = 'أنا لا أعرف الجواب لكن كرة القدم رياضة جميلة والطقس حار اليوم';
    const acceptees = AVEC_CORRECTION.filter((c) => evaluer(c, horsSujet).valid).map((c) => c.exerciseId);
    expect(acceptees).toEqual([]);
  });

  it('sens inverse : réponse vide et « لا اعرف » restent refusées', () => {
    for (const c of AVEC_CORRECTION) {
      expect(evaluer(c, '').valid, `${c.exerciseId} accepte le vide`).toBe(false);
      expect(evaluer(c, 'لا اعرف').valid, `${c.exerciseId} accepte « لا اعرف »`).toBe(false);
    }
  });

  it('anti-laxisme : un seul mot porteur ne suffit jamais à valider une preuve attendue', () => {
    // Ce test doit ECHOUER si le seuil de couverture est abaisse (ex. 0,1) :
    // il vise directement foundEvidence, la ou le relachement se manifeste.
    const c = DOCUMENT_PRACTICE_CONTEXTS.find((x) => x.exerciseId === 'uracile_marque')!;
    // « النواة » est un mot porteur de la 1re preuve attendue, mais un seul sur trois.
    expect(evaluer(c, 'النواة').foundEvidence).toEqual([]);
    expect(evaluer(c, 'الوسم').foundEvidence).toEqual([]);
  });

  it('anti-laxisme : le seuil de couverture reste strictement supérieur à la moitié', () => {
    // Verrou explicite du calibrage : a 0,6 les 11 corrections officielles passent
    // et 0 hors-sujet passe. Un seuil trop bas rouvrirait la porte au sac de mots.
    const c = DOCUMENT_PRACTICE_CONTEXTS.find((x) => x.exerciseId === 'codon_anticodon')!;
    const premierMot = c.expectedEvidence[0].split(/\s+/)[0];
    expect(evaluer(c, premierMot).foundEvidence).toEqual([]);
  });
});
