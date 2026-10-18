// src/lib/__tests__/rappelAdaptatif.test.ts — verrouille l'ordonnanceur de rappel.
//
// Deux défauts réparés, et ces tests les fixent séparément :
//   1. l'échéance ne dépendait pas de la qualité de la réponse (échelle fixe) ;
//   2. le corpus de 15 concepts × 4 questions n'était lu que par des tests.
import { afterEach, describe, expect, it } from 'vitest';
import {
  CLE_RAPPEL_ADAPTATIF,
  chargeBanque,
  dansCombienDeJours,
  elementsDus,
  etatRappel,
  noterRappel,
  noterReponseLibre,
  phraseEcheance,
  planifierRappel,
  sauveBanque,
} from '../rappelAdaptatif';
// Le pont vers le corpus est un module distinct : le moteur du tuteur importe
// l'ordonnanceur sans embarquer les 60 questions.
import { conceptsSuivis, prochainRappelDu, promptPour } from '../rappelConcepts';
import { SPACED_RECALL_PROMPTS } from '../../data/spacedRecallPrompts';
import { JOUR_MS } from '../sm2';

const T = 1_700_000_000_000;

afterEach(() => {
  localStorage.clear();
});

describe('mémoire — un contenu corrompu ne casse jamais la séance', () => {
  it('banque vide au départ', () => {
    expect(chargeBanque()).toEqual({});
    expect(elementsDus(T)).toEqual([]);
    expect(prochainRappelDu(T)).toBeNull();
  });

  it('JSON illisible → banque vide, pas d’exception', () => {
    localStorage.setItem(CLE_RAPPEL_ADAPTATIF, '{pas du json');
    expect(chargeBanque()).toEqual({});
    expect(() => noterRappel('transcription', 4, T)).not.toThrow();
  });

  it('entrée partielle ignorée, entrée valide conservée', () => {
    localStorage.setItem(
      CLE_RAPPEL_ADAPTATIF,
      JSON.stringify({ bon: { ease: 2.5, intervalDays: 6, dueAt: T, reps: 2, lapses: 0 }, mauvais: { ease: 'oui' } }),
    );
    expect(Object.keys(chargeBanque())).toEqual(['bon']);
  });
});

describe('l’échéance dépend de la réponse — le correctif central', () => {
  it('deux réponses inégales donnent deux passés différents', () => {
    // ATTENTION AU PIÈGE (je m'y suis pris en écrivant ce test) : un identifiant
    // porte UN historique. Enchaîner deux notes sur la même clé les fait
    // s'additionner au lieu de les comparer. Il faut donc repartir d'une mémoire
    // vierge pour chaque scénario.
    localStorage.clear();
    const faible = noterRappel('photosynthese', 2, T); // sous le seuil de preuves
    localStorage.clear();
    const solide = noterRappel('photosynthese', 4, T); // bonne réponse

    // Vérité de SM-2 qu'il faut dire plutôt que de la contourner : au TOUT
    // premier passage, l'intervalle vaut 1 jour quelle que soit la note — c'est
    // la définition (rép. 1 → 1 jour). Ce qui diverge tout de suite, c'est la
    // trace laissée : l'échec compte et abaisse le facteur de facilité.
    expect(faible.intervalDays).toBe(solide.intervalDays);
    expect(faible.lapses).toBe(1);
    expect(solide.lapses).toBe(0);
    expect(solide.ease).toBeGreaterThan(faible.ease);
    // L'état persisté est bien celui du dernier appel.
    expect(etatRappel('photosynthese')?.ease).toBe(solide.ease);
  });

  it('deux passés différents, même suite de réussites → deux échéances différentes', () => {
    // Une clé ne porte qu'UN historique : pour confronter deux passés, il faut
    // deux concepts. Les deux reçoivent ensuite EXACTEMENT la même suite de
    // réponses — c'est ce qui rend la comparaison honnête.
    localStorage.clear();
    const cleFragile = 'photosynthese';
    const cleSolide = 'enzymes';

    // Premier passage : l'un échoue, l'autre réussit.
    noterRappel(cleFragile, 2, T);
    noterRappel(cleSolide, 4, T);

    // Deuxième passage, une journée plus tard : les DEUX réussissent.
    const fragile = noterRappel(cleFragile, 4, T + JOUR_MS);
    const solide = noterRappel(cleSolide, 4, T + JOUR_MS);
    // Même réussite des deux côtés, échéances opposées : l'élève qui a échoué au
    // premier passage revient le LENDEMAIN, l'autre dans SIX JOURS. L'échelle
    // fixe, elle, aurait fait redémarrer le premier à J+1 puis avancé les deux
    // de la même façon — c'est ici que les courbes se séparent pour de bon.
    expect(fragile.intervalDays).toBe(1);
    expect(solide.intervalDays).toBe(6);
    expect(fragile.ease).toBeLessThan(solide.ease);
  });

  it('À ÉTAT IDENTIQUE, la qualité de la réussite change l’échéance — c’est le défaut réparé', () => {
    // Le défaut, mot pour mot : « réussite minimale et réponse parfaite
    // produisaient rigoureusement la même échéance ». Ce test le prend de face.
    // Deux éléments au passé STRICTEMENT identique (3 réussites, J+6, EF 2,5),
    // une seule chose change : la qualité de la réponse d'aujourd'hui.
    localStorage.clear();
    const memePasse = { ease: 2.5, intervalDays: 6, dueAt: T, reps: 2, lapses: 0 };
    sauveBanque({ minimal: { ...memePasse }, parfait: { ...memePasse } });

    const minimal = noterRappel('minimal', 3, T); // « ça passe », sans plus
    const parfait = noterRappel('parfait', 5, T); // réponse complète

    // L'échelle fixe aurait annoncé la MÊME date aux deux. Ici : 14 contre 16.
    //   minimal (q=3) : EF 2,5 − 0,14 = 2,36 → 6 × 2,36 = 14,16 → 14
    //   parfait (q=5) : EF 2,5 + 0,10 = 2,60 → 6 × 2,60 = 15,60 → 16
    expect(minimal.intervalDays).toBe(14);
    expect(parfait.intervalDays).toBe(16);
    expect(parfait.intervalDays).toBeGreaterThan(minimal.intervalDays);
    // Et l'écart ne cesse de croître ensuite, parce que le facteur de facilité
    // garde la mémoire de la qualité : c'est un intérêt composé, pas un compteur.
    const minimal2 = noterRappel('minimal', 4, T + JOUR_MS);
    const parfait2 = noterRappel('parfait', 4, T + JOUR_MS);
    expect(parfait2.intervalDays).toBeGreaterThan(minimal2.intervalDays);
  });

  it('l’écart se creuse à la deuxième révision, et ne se referme plus', () => {
    let faible = noterRappel('a', 2, T);
    let solide = noterRappel('b', 4, T);
    faible = noterRappel('a', 4, T + JOUR_MS);
    solide = noterRappel('b', 4, T + JOUR_MS);
    expect(solide.intervalDays).toBeGreaterThan(faible.intervalDays);
    expect(dansCombienDeJours('b', T + JOUR_MS)).toBeGreaterThan(
      dansCombienDeJours('a', T + JOUR_MS),
    );
  });

  it('une réponse libre est notée sur son TEXTE, via les preuves du corpus', () => {
    const p = SPACED_RECALL_PROMPTS['photosynthese']![0];
    // La question du corpus : « ما مقر التفاعلات الضوئية؟ »
    // preuves attendues : التيلاكويد · أغشية · الصانعة الخضراء (minimum 2)
    // Chaque scénario repart d'une mémoire vierge (voir le piège ci-dessus).
    localStorage.clear();
    const vide = noterReponseLibre('photosynthese', 'لا أعرف', p, T);
    localStorage.clear();
    const partiel = noterReponseLibre('photosynthese', 'في التيلاكويد', p, T);
    localStorage.clear();
    const complet = noterReponseLibre('photosynthese', 'في أغشية التيلاكويد داخل الصانعة الخضراء', p, T);
    expect(vide.qualite).toBe(0);
    expect(partiel.qualite).toBe(2);
    expect(complet.qualite).toBe(5);
    // La note se traduit immédiatement en trace mémorisée : c'est elle qui,
    // aux révisions suivantes, décidera de l'échéance.
    expect(complet.etat.ease).toBeGreaterThan(partiel.etat.ease);
    expect(partiel.etat.ease).toBeGreaterThan(vide.etat.ease);
    expect(vide.etat.lapses).toBe(1);
    expect(partiel.etat.lapses).toBe(1); // sous le seuil = échec, sans indulgence
    expect(complet.etat.lapses).toBe(0);
  });

  it('les chiffres du corpus ne se confondent pas entre eux', () => {
    // Stage 0 de « transcription » attend les preuves ['5', '3', 'ARNm'].
    const p = SPACED_RECALL_PROMPTS['transcription']![0];
    expect(noterReponseLibre('transcription', 'من 5 إلى 3', p, T).qualite).toBe(2);
    expect(noterReponseLibre('transcription', 'من 5 إلى 3 عبر ARNm', p, T).qualite).toBe(5);
    // « 15 » ne contient pas la preuve « 5 ».
    expect(noterReponseLibre('transcription', '15 و 30', p, T).qualite).toBe(0);
  });
});

describe('planifierRappel — l’intention « schedule_recall » devient un effet', () => {
  it('programme un élément jamais vu comme dû immédiatement', () => {
    const etat = planifierRappel('enzymes', T);
    expect(etat.dueAt).toBe(T);
    expect(elementsDus(T)).toContain('enzymes');
  });

  it('n’écrase PAS une programmation déjà construite', () => {
    noterRappel('enzymes', 5, T);
    const avant = etatRappel('enzymes')!;
    noterRappel('enzymes', 5, T);
    const apres = etatRappel('enzymes')!;
    planifierRappel('enzymes', T); // une erreur aujourd'hui ne doit rien annuler
    expect(etatRappel('enzymes')!.dueAt).toBe(apres.dueAt);
    expect(apres.intervalDays).toBeGreaterThanOrEqual(avant.intervalDays);
  });
});

describe('le corpus de concepts — enfin lu à l’exécution', () => {
  it('la question posée suit ce que le concept a déjà enduré', () => {
    const zero = promptPour('transcription', null);
    const apresUne = promptPour('transcription', { ease: 2.5, intervalDays: 1, dueAt: T, reps: 1, lapses: 0 });
    const apresTrois = promptPour('transcription', { ease: 2.5, intervalDays: 15, dueAt: T, reps: 3, lapses: 0 });
    const apresDix = promptPour('transcription', { ease: 2.5, intervalDays: 200, dueAt: T, reps: 10, lapses: 0 });
    expect(zero?.stage).toBe(0);
    expect(apresUne?.stage).toBe(1);
    expect(apresTrois?.stage).toBe(3);
    // Au-delà du corpus : on reste sur la question la plus intégrative.
    expect(apresDix?.stage).toBe(3);
  });

  it('après un échec, l’élève retrouve la première question — pas la synthèse', () => {
    const etat = noterRappel('transcription', 0, T); // échec : reps retombe à 0
    expect(etat.reps).toBe(0);
    expect(promptPour('transcription', etat)?.stage).toBe(0);
  });

  it('un concept absent du corpus ne reçoit pas de question inventée', () => {
    expect(promptPour('concept_inexistant', null)).toBeNull();
  });

  it('le rappel le plus en retard passe d’abord', () => {
    noterRappel('transcription', 2, T); // dû le lendemain
    noterRappel('enzymes', 2, T);
    sauveBanque({
      transcription: { ease: 2.5, intervalDays: 1, dueAt: T - 3 * JOUR_MS, reps: 0, lapses: 1 },
      enzymes: { ease: 2.5, intervalDays: 1, dueAt: T - JOUR_MS, reps: 0, lapses: 1 },
    });
    const du = prochainRappelDu(T);
    expect(du?.itemId).toBe('transcription');
    expect(du?.retardJours).toBe(3);
  });

  it('rien n’est dû tant que l’échéance n’est pas atteinte', () => {
    noterRappel('transcription', 4, T); // J+1
    expect(conceptsSuivis()).toBe(1);
    expect(elementsDus(T)).toEqual([]);
    expect(elementsDus(T + JOUR_MS + 1)).toEqual(['transcription']);
  });
});

describe('la phrase affichée à l’élève', () => {
  it('chiffres latins, jamais de darija', () => {
    expect(phraseEcheance(0)).toBe('أعيدها عليك في هذه الجلسة.');
    expect(phraseEcheance(1)).toBe('أعيدها عليك غدًا.');
    expect(phraseEcheance(2)).toBe('أعيدها عليك بعد يومين.');
    expect(phraseEcheance(6)).toBe('أعيدها عليك بعد 6 أيام.');
    expect(phraseEcheance(60)).toBe('أعيدها عليك بعد 2 شهر.');
  });
});
