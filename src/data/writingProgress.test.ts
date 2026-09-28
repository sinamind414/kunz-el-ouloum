// writingProgress.test.ts — lecture des brouillons de l'atelier (sprint 26).
//
// Ce module ne fait que LIRE le localStorage. Les tests vérifient qu'il ne se
// laisse pas piéger par les clés étrangères, par les brouillons vides, ni par
// un stockage indisponible.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  TRAINER_PREFIX,
  draftedFamilies,
  draftsByIdea,
  hasDraft,
  parseDraftKey,
  writingStats,
  writtenIdeaIds,
} from './writingProgress';

beforeEach(() => localStorage.clear());

const ecrire = (ideaId: string, familyId: string, texte: string) =>
  localStorage.setItem(`${TRAINER_PREFIX}${ideaId}.${familyId}`, texte);

describe('progression d’écriture — lecture des clés', () => {
  it('décode une clé de brouillon', () => {
    expect(parseDraftKey(`${TRAINER_PREFIX}bac2023_s2_e3.verb_hypothese`)).toEqual({
      ideaId: 'bac2023_s2_e3',
      familyId: 'verb_hypothese',
    });
  });

  it('ignore les clés étrangères et les clés incomplètes', () => {
    expect(parseDraftKey('kunz.revisionPlan.14x90')).toBeNull();
    expect(parseDraftKey(`${TRAINER_PREFIX}sansfamille`)).toBeNull();
    expect(parseDraftKey(`${TRAINER_PREFIX}.verb_analyser`)).toBeNull();
  });

  it('ne compte pas les brouillons vides ou blancs', () => {
    ecrire('bac2024_s1_e3', 'verb_analyser', '   ');
    expect(hasDraft('bac2024_s1_e3')).toBe(false);
    expect(writingStats()).toEqual({ exercices: 0, reponses: 0 });
  });
});

describe('progression d’écriture — agrégation', () => {
  it('regroupe les consignes rédigées par exercice', () => {
    ecrire('bac2023_s2_e3', 'verb_hypothese', 'قد يعود ذلك إلى …');
    ecrire('bac2023_s2_e3', 'verb_valider', 'الفرضية غير مدعومة …');
    ecrire('bac2026_s1_e1', 'verb_texte_scientifique', 'كيف …؟');
    expect(draftedFamilies('bac2023_s2_e3')).toEqual(['verb_hypothese', 'verb_valider']);
    expect(writtenIdeaIds()).toEqual(['bac2023_s2_e3', 'bac2026_s1_e1']);
    expect(writingStats()).toEqual({ exercices: 2, reponses: 3 });
  });

  it('ne mélange pas les exercices dont l’identifiant partage un préfixe', () => {
    ecrire('bac2019_s1_e1', 'verb_restituer', 'الغلاف …');
    expect(draftsByIdea()['bac2019_s1_e1']).toHaveLength(1);
    expect(hasDraft('bac2019_s1_e')).toBe(false);
  });

  it('n’écrit jamais dans le stockage', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem');
    draftsByIdea();
    writingStats();
    hasDraft('bac2020_s2_e2');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('survit à un stockage indisponible', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('stockage refusé');
    });
    ecrire('bac2021_s1_e3', 'verb_analyser', 'نص');
    expect(() => writingStats()).not.toThrow();
    spy.mockRestore();
  });
});
