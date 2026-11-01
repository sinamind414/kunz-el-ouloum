// writingReview.test.ts — relecture de la production écrite (sprint 27).
//
// Deux promesses sont testées : le classement met en tête les réponses les
// plus incomplètes (c'est là qu'il reste du travail), et le profil d'erreurs
// compte les échecs SUR LES OCCASIONS RÉELLES — un contrôle qui ne s'est
// jamais présenté ne doit pas apparaître comme une faiblesse.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { reviewDrafts, weakestChecks, writingReport } from './writingReview';
import { TRAINER_PREFIX } from './writingProgress';

beforeEach(() => localStorage.clear());

const ecrire = (ideaId: string, familyId: string, texte: string) =>
  localStorage.setItem(`${TRAINER_PREFIX}${ideaId}.${familyId}`, texte);

const ANALYSE_COMPLETE =
  'نلاحظ في المجال من 0 إلى 5 دقيقة ارتفاع النشاط من 10% إلى 80% أي كلما زاد التركيز كلما زاد النشاط.';
const ANALYSE_PAUVRE = 'نلاحظ أن النشاط يرتفع ثم يستقر.';

describe('relecture — état de chaque réponse', () => {
  it('ne renvoie rien quand rien n’a été écrit', () => {
    expect(reviewDrafts()).toEqual([]);
    expect(writingReport().reponses).toBe(0);
  });

  it('rattache la réponse à son exercice et à sa consigne', () => {
    ecrire('bac2023_s2_e3', 'verb_analyser', ANALYSE_COMPLETE);
    const [r] = reviewDrafts();
    expect(r.idea?.year).toBe(2023);
    expect(r.familleAr).toBeTruthy();
    expect(r.satisfaits).toBe(r.total);
    expect(r.manquants).toEqual([]);
  });

  it('classe les réponses les plus incomplètes en premier', () => {
    ecrire('bac2023_s2_e3', 'verb_analyser', ANALYSE_COMPLETE);
    ecrire('bac2024_s1_e3', 'verb_analyser', ANALYSE_PAUVRE);
    const ordre = reviewDrafts().map((r) => r.ideaId);
    expect(ordre[0]).toBe('bac2024_s1_e3');
  });

  it('coupe l’extrait sans perdre le texte enregistré', () => {
    const long = 'نلاحظ '.repeat(60);
    ecrire('bac2021_s1_e2', 'verb_analyser', long);
    const [r] = reviewDrafts();
    expect(r.extrait.endsWith('…')).toBe(true);
    expect(r.motsEcrits).toBe(60);
  });

  it('survit à un brouillon dont l’exercice n’existe plus', () => {
    ecrire('bac1999_s1_e1', 'verb_analyser', ANALYSE_COMPLETE);
    const [r] = reviewDrafts();
    expect(r.idea).toBeUndefined();
    expect(r.ideaId).toBe('bac1999_s1_e1');
  });

  it('ignore une famille de consigne inconnue plutôt que de planter', () => {
    ecrire('bac2023_s2_e3', 'famille_inventee', 'نص ما');
    expect(reviewDrafts()).toEqual([]);
  });
});

describe('relecture — profil d’erreurs', () => {
  it('compte les échecs et les occasions de chaque exigence', () => {
    ecrire('bac2024_s1_e3', 'verb_analyser', ANALYSE_PAUVRE);
    ecrire('bac2021_s1_e2', 'verb_analyser', ANALYSE_PAUVRE);
    ecrire('bac2023_s2_e3', 'verb_analyser', ANALYSE_COMPLETE);
    const chiffres = weakestChecks().find((w) => w.checkId === 'chiffres');
    expect(chiffres).toBeDefined();
    expect(chiffres!.echecs).toBe(2);
    expect(chiffres!.occasions).toBe(3);
  });

  it('n’inscrit pas au profil une exigence toujours satisfaite', () => {
    ecrire('bac2023_s2_e3', 'verb_analyser', ANALYSE_COMPLETE);
    expect(weakestChecks().map((w) => w.checkId)).not.toContain('chiffres');
  });

  it('remonte aussi les vigilances déclenchées', () => {
    ecrire(
      'bac2024_s1_e3',
      'verb_analyser',
      'نلاحظ ارتفاع النشاط من 10% إلى 80% لأن الأنزيم يرتبط بالركيزة.',
    );
    expect(weakestChecks().map((w) => w.checkId)).toContain('pas_de_cause');
  });

  it('agrège un bilan cohérent avec les réponses relues', () => {
    ecrire('bac2024_s1_e3', 'verb_analyser', ANALYSE_PAUVRE);
    ecrire('bac2023_s2_e3', 'verb_hypothese', 'قد يعود ذلك إلى ارتباط المادة مما يؤدي إلى التثبيط');
    const rapport = writingReport();
    expect(rapport.reponses).toBe(2);
    expect(rapport.exercices).toBe(2);
    expect(rapport.total).toBe(
      reviewDrafts().reduce((s, r) => s + r.total, 0),
    );
  });

  it('n’écrit jamais dans le stockage', () => {
    ecrire('bac2023_s2_e3', 'verb_analyser', ANALYSE_COMPLETE);
    const spy = vi.spyOn(Storage.prototype, 'setItem');
    reviewDrafts();
    weakestChecks();
    writingReport();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
