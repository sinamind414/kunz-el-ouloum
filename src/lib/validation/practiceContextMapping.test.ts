import { describe, expect, it } from 'vitest';
import { DOCUMENT_PRACTICE_CONTEXTS } from '../../data/documentPracticeContexts';
import { validateAnswer } from './ValidationEngine';
import {
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
