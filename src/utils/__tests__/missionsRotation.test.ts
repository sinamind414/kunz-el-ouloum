// missionsRotation.test.ts — audit Capitaine 2026-10-17 (§5.1/§5.2, P1) :
//
// « getDailyMission choisit la première carte et ne lit jamais
// lastMissionTopic ; rankMistakes fonde la fréquence sur des doublons
// impossibles (recordQuizAnswer n'ajoute pas les doublons) et ignore
// lastSeenAt. »
//
// Deux moitiés du défaut :
//   · la mission répétait à l'infini son premier sujet (mistakes[0], ou
//     cards[0] du domaine) — lastMissionTopic était écrit (completeDailyMission)
//     mais jamais lu par le sélecteur ;
//   · la "fréquence" des erreurs comptait des doublons que recordQuizAnswer
//     exclut (includes → push), donc toutes les erreurs valaient exactement 1,
//     et l'oubli était deviné d'après le RANG dans le tableau, pas d'après une
//     date. Fix : session.mistakeStats (occurrences + dernière date, maintenues
//     par recordQuizAnswer) + sélection anti-répétition lastMissionTopic.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { choisirSujetMission, getDailyMission } from '../../smartTutorEngine';
import { getDefaultSession, recordQuizAnswer, type BotSession } from '../../utils/sessionManager';
import { KNOWLEDGE_CARDS } from '../../data/smartBotData';

const JOUR = 86_400_000;

function sessionBase(): BotSession {
  return { ...getDefaultSession(), lastMissionDate: null, lastMissionTopic: null };
}

/** Deux cartes du MÊME domaine : poids BAC quasi identiques, comparaisons sûres. */
const domain1 = KNOWLEDGE_CARDS.filter((c) => c.domainId === 1);
const CARTE_A = domain1[0].id;
const CARTE_B = domain1[1].id;

describe('la mission ne répète pas hier (lastMissionTopic enfin lu)', () => {
  it('/domaine : jour 1 = première carte du domaine, jour 2 = la SUIVANTE', () => {
    const s1 = { ...sessionBase(), activeDomainId: 1 };
    const j1 = choisirSujetMission(s1);
    expect(j1.topicId).toBe(domain1[0].id);

    const s2 = { ...s1, lastMissionTopic: j1.topicId };
    const j2 = choisirSujetMission(s2);
    expect(j2.topicId).not.toBe(j1.topicId);
    expect(j2.topicId).toBe(domain1[1].id);
  });

  it('global (aucun domaine) : la mission avance le long du catalogue', () => {
    const j1 = choisirSujetMission(sessionBase());
    expect(j1.topicId).not.toBeNull();

    const j2 = choisirSujetMission({ ...sessionBase(), lastMissionTopic: j1.topicId });
    expect(j2.topicId).not.toBe(j1.topicId);
  });

  it('rotation circulaire : la dernière carte reboucle sur la première', () => {
    const s = { ...sessionBase(), activeDomainId: 1, lastMissionTopic: domain1[domain1.length - 1].id };
    expect(choisirSujetMission(s).topicId).toBe(domain1[0].id);
  });

  it('lacunes : la mission d hier laisse sa place à la lacune suivante classée', () => {
    // B puis A dans la liste ; sans stats, l'ordre départage à l'insertion (B
    // d'abord). La mission d'hier portait sur B → aujourd'hui : A.
    const s: BotSession = {
      ...sessionBase(),
      activeDomainId: 1,
      mistakes: [CARTE_B, CARTE_A],
      lastMissionTopic: CARTE_B,
    };
    const r = choisirSujetMission(s);
    expect(r.topicId).toBe(CARTE_A);
    expect(r.domainId).toBe(1);
  });
});

describe('mistakeStats : occurrences réelles + dates (plus de fréquence morte)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('recordQuizAnswer compte chaque échec et date le dernier', () => {
    let s: BotSession = {
      ...getDefaultSession(),
      currentQuiz: {
        questionId: 'q1',
        questionIndex: 0,
        totalQuestions: 10,
        correctAnswers: 0,
      },
    };
    s = recordQuizAnswer(s, false, CARTE_A, 'q2');
    s = recordQuizAnswer(s, true, CARTE_A, 'q3'); // juste → retire des lacunes
    s = recordQuizAnswer(s, false, CARTE_A, 'q4'); // retombe → count continue

    const stat = s.mistakeStats?.[CARTE_A];
    expect(stat?.count).toBe(2);
    expect(stat?.lastSeenAt).toBeGreaterThan(0);
  });

  it('la fréquence réelle fait monter un sujet raté 3 fois devant un sujet raté 1 fois', () => {
    const maintenant = Date.now();
    const s: BotSession = {
      ...sessionBase(),
      activeDomainId: 1,
      mistakes: [CARTE_B, CARTE_A],
      mistakeStats: {
        [CARTE_A]: { count: 3, lastSeenAt: maintenant - JOUR },
        [CARTE_B]: { count: 1, lastSeenAt: maintenant - JOUR },
      },
    };
    expect(choisirSujetMission(s).topicId).toBe(CARTE_A);
  });

  it('l oubli date maintenant : un vieux sujet oublié reprend la priorité', () => {
    const maintenant = Date.now();
    const s: BotSession = {
      ...sessionBase(),
      activeDomainId: 1,
      mistakes: [CARTE_B, CARTE_A],
      mistakeStats: {
        [CARTE_A]: { count: 2, lastSeenAt: maintenant - 14 * JOUR },
        [CARTE_B]: { count: 1, lastSeenAt: maintenant - JOUR },
      },
      lastMissionTopic: CARTE_B,
    };
    // A : fréquent ET oublié (14 j) ; B : récent et déjà proposé hier.
    expect(choisirSujetMission(s).topicId).toBe(CARTE_A);
  });

  it('le protocole d étude R7 se déclenche sur la fréquence RÉELLE (≥ 3 échecs)', () => {
    // Le vieux compteur comptait les doublons d'une liste dédoublonnée : ≤ 1
    // toujours → la ligne d'aide du protocole (90 secondes) était inatteignable.
    const maintenant = Date.now();
    const mission = (count: number): string => {
      const r = getDailyMission({
        ...sessionBase(),
        activeDomainId: 1,
        mistakes: [CARTE_A],
        mistakeStats: { [CARTE_A]: { count, lastSeenAt: maintenant - JOUR } },
      });
      return r.action.text;
    };
    const t1 = mission(1);
    const t3 = mission(3);
    expect(t3).not.toBe(t1);
    // Le texte du protocole porte le minuteur (90 secondes) — absent à 1 échec.
    expect(t3).toContain('90');
    expect(t1).not.toContain('90');
  });

  it('sans stats (vieille session persistée) : le classement historique reste debout', () => {
    const s: BotSession = {
      ...sessionBase(),
      activeDomainId: 1,
      mistakes: [CARTE_B, CARTE_A],
    };
    // Pas d'horodateur : repli sur l'heuristique d'ordre (comportement
    // historique conservé), la mission ne plante pas.
    expect(choisirSujetMission(s).topicId).not.toBeNull();
  });
});
