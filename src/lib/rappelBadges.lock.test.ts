// rappelBadges.lock.test.ts — VERROU DES BADGES 🔴🟡🟢 (tranche P1-2, restant).
//
// Les trois règles d'honnêteté sont verrouillées ici :
//   1. jamais de badge sans mémoire SM-2 réelle (au corpus mais non planifié
//      → null ; hors corpus → null) ;
//   2. échu → rouge, AVANT tout autre critère (un rappel riche d'intervalle
//      long mais ÉCHU reste rouge — l'échéance prime) ;
//   3. programmé → jaune < 21 jours, vert ≥ 21 jours.
// La banque est injectée (paramètre) : aucun état résiduel ne peut faire
// passer le test, et l'écriture localStorage n'est pas nécessaire.

import { describe, expect, it } from 'vitest';
import { SEUIL_ANCRAGE_JOURS, infoBadgeRappel } from './rappelBadges';
import { estConceptRappel } from './rappelConcepts';
import type { BanqueRappels } from './rappelAdaptatif';

const NOW = new Date('2026-10-29T12:00:00').getTime();
const JOUR = 86_400_000;

/** Une clé réelle du corpus (projetée depuis LESSON_GOLD_SUMMARIES). */
const CLE_CORPUS = 'phase1_chapitres_1_2';
/** Une clé de leçon hors corpus ( jamais générée pour le rappel). */
const CLE_HORS_CORPUS = 'lecon-inexistante-xyz';

expect(estConceptRappel(CLE_CORPUS)).toBe(true);

function etat(dueAt: number, intervalDays: number) {
  return { ease: 2.5, intervalDays, dueAt, reps: 2, lapses: 0 };
}

describe(`badges rappel — règles d'honnêteté`, () => {
  it(`hors corpus → null (aucun badge inventé)`, () => {
    expect(infoBadgeRappel(CLE_HORS_CORPUS, NOW, {})).toBeNull();
  });

  it(`au corpus mais jamais planifié → null (pas d info inventée)`, () => {
    expect(infoBadgeRappel(CLE_CORPUS, NOW, {})).toBeNull();
  });

  it(`échu → rouge, même avec un intervalle long préexistant`, () => {
    const banque: BanqueRappels = { [CLE_CORPUS]: etat(NOW - 3 * JOUR, 30) };
    const info = infoBadgeRappel(CLE_CORPUS, NOW, banque);
    expect(info?.couleur).toBe('rouge');
    expect(info?.libelle).toContain('مستحقة');
  });

  it(`échu aujourd hui même (dueAt = now) → rouge`, () => {
    const banque: BanqueRappels = { [CLE_CORPUS]: etat(NOW, 1) };
    expect(infoBadgeRappel(CLE_CORPUS, NOW, banque)?.couleur).toBe('rouge');
  });

  it(`programmé 1 jour → jaune (مراجعة قادمة)`, () => {
    const banque: BanqueRappels = { [CLE_CORPUS]: etat(NOW + JOUR, 1) };
    const info = infoBadgeRappel(CLE_CORPUS, NOW, banque);
    expect(info?.couleur).toBe('jaune');
    expect(info?.libelle).toContain('قادمة');
  });

  it(`programmé 6 jours (palier SM-2 n°2) → jaune`, () => {
    const banque: BanqueRappels = { [CLE_CORPUS]: etat(NOW + 6 * JOUR, 6) };
    expect(infoBadgeRappel(CLE_CORPUS, NOW, banque)?.couleur).toBe('jaune');
  });

  it(`programmé ${SEUIL_ANCRAGE_JOURS} jours → vert (مراجعة راسخة)`, () => {
    const banque: BanqueRappels = { [CLE_CORPUS]: etat(NOW + SEUIL_ANCRAGE_JOURS * JOUR, SEUIL_ANCRAGE_JOURS) };
    const info = infoBadgeRappel(CLE_CORPUS, NOW, banque);
    expect(info?.couleur).toBe('vert');
    expect(info?.libelle).toContain('راسخة');
  });

  it(`seuil exact : 20 jours → jaune, 21 jours → vert`, () => {
    const long20: BanqueRappels = { [CLE_CORPUS]: etat(NOW + 20 * JOUR, 20) };
    const long21: BanqueRappels = { [CLE_CORPUS]: etat(NOW + 21 * JOUR, 21) };
    expect(infoBadgeRappel(CLE_CORPUS, NOW, long20)?.couleur).toBe('jaune');
    expect(infoBadgeRappel(CLE_CORPUS, NOW, long21)?.couleur).toBe('vert');
  });
});
