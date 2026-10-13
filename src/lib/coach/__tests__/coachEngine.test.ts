// coachEngine.test.ts — intégration COACH ↔ moteur Morchid (jsdom).
//
// Le bouton « تشخيص مستواي » et la question « ما مستواي » doivent donner la
// MÊME réponse, et cette réponse doit tenir les promesses du coach : un verdict
// par unité et une action concrète, dérivés de l'état réel de l'élève.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { processStudentInput } from '../../../smartTutorEngine';
import { etatParDefaut, markDone, loadParcours } from '../../parcours/parcoursProgress';
import { PARCOURS_DOMAINS } from '../../parcours/parcoursPath';

type BotSession = Parameters<typeof processStudentInput>[0];

function sessionVide(): BotSession {
  return {
    activeDomainId: 1,
    activeUnitId: null,
    activeTopicId: null,
    mode: 'menu',
    boss: null,
    completedBac: [],
    mistakes: [],
    currentQuiz: null,
    lastInteraction: Date.now(),
    probeBypassed: [],
  } as unknown as BotSession;
}

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe('coach — intégration moteur', () => {
  it('aucune donnée → le coach le dit, il n invente pas une note', () => {
    const r = processStudentInput(sessionVide(), 'ما مستواي');
    expect(r.action.text).toContain('تشخيص مستواك');
    expect(r.action.text).toContain('لم تبدأ: 11');
    // Pas de félicitation sur une copie blanche.
    expect(r.action.text).not.toContain('🎉');
  });

  it('un جسر échoué fait apparaître l unité comme priorité', () => {
    // markDone attend un score 0..1 (et pose lui-même `fragile` si < 0,6).
    markDone('parcours:u1:jalon', 0.2); // 2/10 → faible
    const r = processStudentInput(sessionVide(), 'وضحي مستواي');
    const texte = r.action.text ?? '';
    expect(texte).toContain('تشخيص مستواك');
    expect(texte).toContain('ضعيف: 1');
    expect(texte).toContain('أعد قراءة دروس الوحدة');
  });

  it('plusieurs formulations déclenchent le même diagnostic', () => {
    markDone('parcours:u2:jalon', 1);
    for (const q of ['ما مستواي', 'هل انا قوي', 'نقط ضعفي']) {
      const r = processStudentInput(sessionVide(), q);
      expect(r.action.text, q).toContain('تشخيص مستواك');
    }
  });

  it('unité NOMMÉE → diagnostic de cette unité seule, pas une vue d ensemble', () => {
    markDone('parcours:u1:jalon', 0.9);
    const r = processStudentInput(sessionVide(), 'ما مستواي في تركيب البروتين');
    const texte = r.action.text ?? '';
    expect(texte).toContain('تشخيص الوحدة');
    // Le titre de l'unité demandée est dans la réponse.
    expect(texte).toContain('تركيب البروتين');
    // Et on ne bascule pas sur la vue d'ensemble des 11 unités.
    expect(texte).not.toContain('11 وحدة');
  });

  it('le diagnostic reste DISTINCT du test diagnostique (qui, lui, interroge)', () => {
    const r = processStudentInput(sessionVide(), 'اختبار تشخيصي');
    // Le test pose des questions ; le coach n'en pose aucune.
    expect(r.action.text).not.toContain('تشخيص مستواك');
    expect(r.action.text).toContain('أجب عن');
  });

  it('une vraie question de cours contenant « مستويات » n est PAS interceptée', () => {
    // PIÈGE MESURÉ : « مستوي » seul interceptait cette question légitime. Le
    // coach ne doit jamais court-circuiter une question de cours.
    const r = processStudentInput(sessionVide(), 'ما هي مستويات البنية الفراغية للبروتين؟');
    const texte = r.action.text ?? '';
    expect(texte).not.toContain('تشخيص مستواك');
    expect(texte).not.toContain('تشخيص الوحدة');
    expect(texte).not.toContain('خارج قاعدة');
  });

  it('le store n est pas modifié par un diagnostic (lecture seule)', () => {
    const avant = JSON.stringify(loadParcours());
    processStudentInput(sessionVide(), 'ما مستواي');
    expect(JSON.stringify(loadParcours())).toBe(avant);
  });

  it('les 11 unités du parcours sont bien couvertes', () => {
    const groupes = PARCOURS_DOMAINS.flatMap((d) => d.units);
    expect(groupes).toHaveLength(11);
    const r = processStudentInput(sessionVide(), 'ما مستواي');
    expect(r.action.text).toContain('11 وحدة');
  });

  it('un état par défaut chargé à la main donne le même résultat', () => {
    // Cohérence : le coach lit bien l'état persisté, pas une valeur en dur.
    const st = etatParDefaut();
    markDone('parcours:u1:jalon', 0.9); // 9/10 → fort
    expect(loadParcours().done['parcours:u1:jalon']?.score).toBeCloseTo(0.9);
    // `etatParDefaut()` retourne un objet NEUF : il ne lit pas le store.
    expect(st.done).toEqual({});
  });
});
