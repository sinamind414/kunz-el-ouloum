import { describe, expect, it } from 'vitest';
import { DOCUMENT_PRACTICE_CONTEXTS } from '../../data/documentPracticeContexts';
import { validateAnswer } from './ValidationEngine';
import { CORE_REFLEX_IDS } from '../../data/reflexes';
import {
  getActionVerbForValidation,
  getDocumentTypeForValidation,
  toValidationContext,
} from './practiceContextMapping';

// Ces tests importent le mapping REELLEMENT execute par LiveDocumentUracile.
// Une copie locale de la regle validerait la copie, pas le produit.
describe('mapping contexte de pratique -> contexte de validation', () => {
  it("ne declare jamais 'quantitative' un document sans valeurs", () => {
    const sansValeurs = ['schema', 'experiment'];
    const fautifs = DOCUMENT_PRACTICE_CONTEXTS.filter(
      (c) =>
        sansValeurs.includes(c.documentType) &&
        getDocumentTypeForValidation(c) === 'quantitative',
    ).map((c) => `${c.exerciseId}/${c.questionId}`);
    expect(fautifs, `documents sans valeurs traites en quantitatif: ${fautifs.join(', ')}`).toEqual([]);
  });

  it("conserve 'quantitative' pour les documents porteurs de valeurs analyses", () => {
    expect(getDocumentTypeForValidation({ documentType: 'curve', reflexId: 'analyse' })).toBe('quantitative');
    expect(getDocumentTypeForValidation({ documentType: 'table', reflexId: 'analyse' })).toBe('quantitative');
  });


  // --- Correspondance reflexe -> verbe d'action (constat #37) ---
  // Un switch partiel renvoyait 'describe' pour hypothesize/validate/compare :
  // la loi #4 ne s'executait alors sur AUCUNE question d'hypothese.

  it('traduit chacun des six reflexes par le verbe de meme nom', () => {
    for (const id of CORE_REFLEX_IDS) {
      expect(getActionVerbForValidation({ reflexId: id }), `reflexe ${id}`).toBe(id);
    }
  });

  it("ne laisse aucun contexte d'hypothese retomber sur 'describe'", () => {
    const hypotheses = DOCUMENT_PRACTICE_CONTEXTS.filter((c) => c.reflexId === 'hypothesize');
    expect(hypotheses.length).toBeGreaterThanOrEqual(6);
    const degrades = hypotheses
      .filter((c) => toValidationContext(c).actionVerb !== 'hypothesize')
      .map((c) => `${c.exerciseId}/${c.questionId}`);
    expect(degrades, `contextes d'hypothese non reconnus: ${degrades.join(', ')}`).toEqual([]);
  });

  it('sanctionne « ربما » sur toutes les questions d\'hypothese', () => {
    // Loi #4 : la formulation dubitative est proscrite dans une hypothese ;
    // le livre officiel n'emploie jamais « ربما ».
    const hypotheses = DOCUMENT_PRACTICE_CONTEXTS.filter((c) => c.reflexId === 'hypothesize');
    const impunis = hypotheses
      .filter((c) => {
        const res = validateAnswer('ربما نفترض أن الإنزيم هو السبب', toValidationContext(c));
        return !res.errors.some((e) => e.code === 'FORBIDDEN_RUBBAMA');
      })
      .map((c) => `${c.exerciseId}/${c.questionId}`);
    expect(impunis, `« ربما » impuni sur: ${impunis.join(', ')}`).toEqual([]);
  });

  it('ne sanctionne pas « ربما » hors hypothese', () => {
    // Controle negatif : le mot peut legitimement apparaitre ailleurs
    // (citation, explication). La loi #4 ne doit pas devenir un filtre global.
    const res = validateAnswer('ربما يزداد التركيز', toValidationContext({ reflexId: 'analyse', documentType: 'curve' }));
    expect(res.errors.some((e) => e.code === 'FORBIDDEN_RUBBAMA')).toBe(false);
  });

  // Invariant : la correction officielle affichee a l'eleve doit passer le
  // correcteur. Mesure a l'ajout : 1 correction sur 11 etait sanctionnee.
  const avecCorrection = DOCUMENT_PRACTICE_CONTEXTS.filter((c) => c.correctionAr).map(
    (c) => [`${c.exerciseId}/${c.questionId}`, c] as const,
  );

  it('couvre les corrections existantes', () => {
    expect(avecCorrection.length).toBeGreaterThanOrEqual(11);
  });

  it.each(avecCorrection)('la correction officielle %s est acceptee', (_id, c) => {
    const res = validateAnswer(c.correctionAr!, toValidationContext(c));
    const bloquants = res.errors
      .filter((e) => e.severity === 'critical' || e.severity === 'major')
      .map((e) => e.code);
    expect(bloquants).toEqual([]);
  });
});
