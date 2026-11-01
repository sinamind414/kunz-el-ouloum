// volumeCorpus.lock.test.ts — L'ÉTALON DES COMPTAGES (audit croisé 16/10/2026).
//
// ══════════════════════════════════════════════════════════════════════════
// POURQUOI CE FICHIER EXISTE — une controverse mesurée entre deux audits.
// ══════════════════════════════════════════════════════════════════════════
// Deux audits du même dépôt, le même jour, ont publié des chiffres
// incompatibles sur le même corpus : « 121 textes à trous » (Édition 2)
// contre « 161 » (audit externe v4b). Mesure croisées du 16/10 :
//
//   · le FICHIER SOURCE `fillBlanks.ts` contient 162 occurrences de `prompt:` ;
//   · l'EXPORT servant l'application filtre (`RAW.filter(...)` l.1814) :
//     `FILL_BLANK_QUESTIONS.length === 121`.
//
// Conclusion : l'« Édition 2 » comptait le corpus SERVI (121 ✓) ; l'externe
// comptait le brut (161/162 ✗ comme étalon de ce que mange l'élève). Ce fichier
// fige les comptages SERVIS — ce que l'élève reçoit — pour qu'aucun audit
// futur n'ait à deviner quelle convention tient, et qu'un changement de volume
// soit un événement DÉLIBÉRÉ (le test échoue, on met le chiffre à jour dans le
// message de commit avec la raison), jamais une dérive silencieuse.
//
// Tout chiffre publié à propos de ces corpus doit pouvoir être rapproché de ce
// fichier. Convention : on compte l'export servi, JAMAIS le brut.

import { describe, expect, it } from 'vitest';
import { MICRO_REMEDIATIONS } from './microRemediations';
import { ERROR_TAXONOMY } from './errorTaxonomy';
import { FILL_BLANK_QUESTIONS } from './fillBlanks';
import { DRILL_BANK } from './drillBank';
import { SPACED_RECALL_PROMPTS } from './spacedRecallPrompts';
import { QCM_CHAPITRES } from './qcmLivre';

describe('l’étalon des comptages servis (16/10/2026)', () => {
  it('micro-remédiations : 31 entrées, dont 11 déclarent « schedule_recall »', () => {
    expect(Object.keys(MICRO_REMEDIATIONS)).toHaveLength(31);
    expect(
      Object.values(MICRO_REMEDIATIONS).filter((r) => r.nextAction === 'schedule_recall'),
    ).toHaveLength(11);
  });

  it('textes à trous : 121 items SERVIS (le brut en contient 162 — c’est le filtre qui fait foi)', () => {
    expect(FILL_BLANK_QUESTIONS).toHaveLength(121);
  });

  it('drills de schéma : 69 consignes servies', () => {
    expect(DRILL_BANK).toHaveLength(69);
  });

  it('taxonomie des erreurs : 10 codes — le seul espace de codes réellement produit', () => {
    expect(Object.keys(ERROR_TAXONOMY)).toHaveLength(10);
  });

  it('rappel espacé : 16 concepts couverts par le corpus de questions', () => {
    expect(Object.keys(SPACED_RECALL_PROMPTS)).toHaveLength(16);
  });

  it('banque QCM du livre : 41 items (les quiz de leçons les complètent)', () => {
    expect(QCM_CHAPITRES).toHaveLength(41);
  });
});
