// smartTutorEngine.positionnement.test.ts — CHAÎNE COMPORTEMENTALE P0-3 :
// lancer « اختبار تحديد المستوى », répondre aux 18 questions, vérifier la
// synthèse (score, note estimée, unités ratées) ET l'objectif de note.
//
// Sans ce test, la banque verrouillée ne prouverait rien : la donnée pourrait
// être servie et jamais notée. Ici on traverse processStudentInput — le vrai
// chemin de l'élève (bouton → moteur → notation → store → objectif).

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getDefaultSession, loadSession, type BotSession } from './utils/sessionManager';
import { processStudentInput, shuffledView } from './smartTutorEngine';
import { POSITIONNEMENT_QUESTIONS, TAILLE_TEST_POSITIONNEMENT } from './data/positionnementBanque';
import { chargerPositionnement } from './utils/positionnement';

const LETTRES = ['A', 'B', 'C', 'D'];

/** La bonne lettre affichée — même graine de session que le moteur (stable). */
function lettreCorrecte(id: string): string {
  const q = POSITIONNEMENT_QUESTIONS.find((x) => x.id === id)!;
  const view = shuffledView(q);
  return LETTRES[view.correctIndex];
}

function repondreTout(session: BotSession, strategie: 'juste' | 'A'): BotSession {
  let s = session;
  let tours = 0;
  while (s.mode === 'positionnement' && s.currentQuiz && tours < 30) {
    const lettre = strategie === 'juste' ? lettreCorrecte(s.currentQuiz.questionId) : 'A';
    s = processStudentInput(s, lettre).session;
    tours += 1;
  }
  return s;
}

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe(`test de positionnement — chaîne complète`, () => {
  it(`le déclencheur démarre un test de 18 questions, cross-domaine`, () => {
    const r = processStudentInput(getDefaultSession(), `اختبار تحديد المستوى`);
    expect(r.session.mode).toBe(`positionnement`);
    expect(r.session.currentQuiz?.totalQuestions).toBe(TAILLE_TEST_POSITIONNEMENT);
    expect(r.session.currentQuiz?.questionIndex).toBe(0);
    expect(r.action.quiz?.options.length).toBeGreaterThan(1);
  });

  it(`toutes justes → mode idle, résultat 18/18, note estimée 20/20`, () => {
    const depart = processStudentInput(getDefaultSession(), `اختبار تحديد المستوى`);
    const session = repondreTout(depart.session, 'juste');
    expect(session.mode).toBe(`idle`);
    expect(session.currentQuiz).toBeNull();
    const etat = chargerPositionnement();
    expect(etat.resultat?.correct).toBe(TAILLE_TEST_POSITIONNEMENT);
    expect(etat.resultat?.percent).toBe(100);
    expect(etat.resultat?.noteEstimee).toBe(20);
  });

  it(`'A' systématique → résultat cohérent avec la graine (quelques justes)`, () => {
    const depart = processStudentInput(getDefaultSession(), `اختبار تحديد المستوى`);
    const session = repondreTout(depart.session, 'A');
    expect(session.mode).toBe(`idle`);
    const etat = chargerPositionnement();
    // Le nombre de justes = nombre de questions dont la bonne position affichée est A.
    const correctsAttendus = POSITIONNEMENT_QUESTIONS.filter(
      (q) => shuffledView(q).correctIndex === 0,
    ).length;
    expect(etat.resultat?.correct).toBe(correctsAttendus);
    expect(etat.resultat?.total).toBe(TAILLE_TEST_POSITIONNEMENT);
  });

  it(`reprise : un test en cours n'est jamais recommencé à zéro`, () => {
    const depart = processStudentInput(getDefaultSession(), `اختبار تحديد المستوى`);
    const apresUne = processStudentInput(depart.session, `B`);
    expect(apresUne.session.currentQuiz?.questionIndex).toBe(1);
    const reprise = processStudentInput(apresUne.session, `اختبار تحديد المستوى`);
    expect(reprise.session.currentQuiz?.questionIndex).toBe(1);
    expect(reprise.action.text).toContain(`السؤال 2 من`);
  });

  it(`objectif de note : « هدف 16 » → confirmé et persisté`, () => {
    const depart = processStudentInput(getDefaultSession(), `اختبار تحديد المستوى`);
    const session = repondreTout(depart.session, 'juste');
    const apres = processStudentInput(session, `هدف 16`);
    expect(apres.action.text).toContain(`16/20`);
    expect(chargerPositionnement().objectifNote).toBe(16);
  });

  it(`objectif hors bornes (25) → refus honnête, rien de persisté`, () => {
    processStudentInput(getDefaultSession(), `هدف 25`);
    expect(chargerPositionnement().objectifNote).toBeNull();
  });

  it(`la session survit à un load (persistance du quiz en cours)`, () => {
    const depart = processStudentInput(getDefaultSession(), `اختبار تحديد المستوى`);
    const apresUne = processStudentInput(depart.session, `B`);
    const rechargee = loadSession();
    expect(rechargee.mode).toBe(`positionnement`);
    expect(rechargee.currentQuiz?.questionIndex).toBe(1);
    void apresUne;
  });
});
