// invitationCapitaine.test.ts — LES QUATRE LOIS VÉRIFIÉES, PAS AFFIRMÉES.
//
// Chaque test correspond à une loi d'Atomic Habits et à une façon concrète de la
// trahir. Si quelqu'un transforme la bulle en bandeau publicitaire permanent,
// c'est ici que ça casse.
//
// L'unité est le JOUR, comme dans le livre (« ne jamais rater DEUX FOIS ») et
// comme dans la donnée réelle (`serieDernierJour`).
import { describe, expect, it } from 'vitest';
import {
  HEURE_DEBUT,
  motifDeInvitation,
  HEURE_PROTECTION_SERIE,
  HEURE_SILENCE_NOCTURNE,
  invitationDuMoment,
  relaisDuMoment,
  SILENCE_APRES_IGNORANCE_MS,
  type ContexteCapitaine,
} from '../invitationCapitaine';
import { QUESTION_RELAIS_AR, RELAIS_VIDE } from '../relais';
import { conseilDeRubrique } from '../../data/conseilsRubrique';

const MAINTENANT = Date.parse('2026-10-14T18:00:00.000Z');

/** Contexte neutre : élève au travail aujourd'hui, rien à signaler. */
function ctx(over: Partial<ContexteCapitaine> = {}): ContexteCapitaine {
  return {
    heure: 18,
    joursSansTravail: 0,
    serie: 0,
    erreursAReprendre: 0,
    derniereUnite: 'التركيب الضوئي',
    joursAccumules: 0,
    derniereInvitationIgnoreeMs: null,
    maintenantMs: MAINTENANT,
    epreuveEnCours: false,
    ...over,
  };
}

describe('Loi 1 — ÉVIDENT : la bulle parle au bon MOMENT (pas tout le temps)', () => {
  it('elle SE TAIT quand tout va bien — le silence est une réponse, pas un échec', () => {
    // Un signal présent en permanence n'est plus un signal : c'est le mur du
    // fond qui disparaît. Ici l'élève a travaillé aujourd'hui : rien à dire.
    expect(invitationDuMoment(ctx())).toBeNull();
  });

  it('elle se TAIT la nuit (relancer à 23 h fabrique du rejet, pas du travail)', () => {
    expect(invitationDuMoment(ctx({ heure: 23, joursSansTravail: 2, serie: 5 }))).toBeNull();
  });

  it('elle se TAIT avant 7 h', () => {
    expect(invitationDuMoment(ctx({ heure: 5, joursSansTravail: 2, serie: 5 }))).toBeNull();
  });

  it('les bornes d’heures sont ouvertes sur les heures de travail', () => {
    for (const h of [HEURE_DEBUT, 12, HEURE_SILENCE_NOCTURNE - 1]) {
      expect(invitationDuMoment(ctx({ heure: h, joursSansTravail: 2 })), `à ${h} h`).not.toBeNull();
    }
  });

  it('Loi 1 inversée : un message IGNORÉ disparaît vraiment (pas de relance)', () => {
    const ignore = ctx({
      joursSansTravail: 2,
      serie: 4,
      derniereInvitationIgnoreeMs: MAINTENANT - 60_000,
    });
    expect(invitationDuMoment(ignore)).toBeNull();
  });

  it('…mais reprend la parole après le délai de silence', () => {
    const plusTard = ctx({
      joursSansTravail: 2,
      serie: 4,
      derniereInvitationIgnoreeMs: MAINTENANT - SILENCE_APRES_IGNORANCE_MS - 1000,
    });
    expect(invitationDuMoment(plusTard)).not.toBeNull();
  });
});

describe('Loi 2 — ATTRAYANT : elle parle de ce que l’élève a DÉJÀ construit', () => {
  it('elle nomme la série, pas une obligation générale', () => {
    const inv = invitationDuMoment(ctx({ joursSansTravail: 1, serie: 6 }))!;
    expect(inv.messageAr).toContain('6');
    expect(inv.messageAr).toContain('سلسلتك');
    expect(inv.loi).toBe(2);
  });

  it('elle accorde correctement le singulier (سلسلتك: 1 يوم)', () => {
    const inv = invitationDuMoment(ctx({ joursSansTravail: 1, serie: 1 }))!;
    expect(inv.messageAr).toContain('يوم');
    expect(inv.messageAr).not.toContain('أيام');
  });

  it('elle ne parle pas d’obligation', () => {
    const inv = invitationDuMoment(ctx({ joursSansTravail: 1, serie: 3 }))!;
    for (const mot of ['يجب', 'واجب', 'عليك']) {
      expect(inv.messageAr, `mot d'obligation : ${mot}`).not.toContain(mot);
    }
  });

  it('avant 17 h, elle ne protège pas encore la série (la journée est devant lui)', () => {
    // Relancer à 9 h du matin un élève qui a travaillé hier, c'est du bruit.
    expect(invitationDuMoment(ctx({ heure: 9, joursSansTravail: 1, serie: 6 }))).toBeNull();
    expect(invitationDuMoment(ctx({ heure: HEURE_PROTECTION_SERIE, joursSansTravail: 1, serie: 6 }))).not.toBeNull();
  });
});

describe('Loi 3 — FACILE : règle des 2 minutes, une action, un clic', () => {
  it('CHAQUE invitation propose une action courte et UNE destination', () => {
    const contextes: ContexteCapitaine[] = [
      ctx({ joursSansTravail: 2, serie: 4 }),
      ctx({ joursSansTravail: 1, serie: 4 }),
      ctx({ joursSansTravail: 5, erreursAReprendre: 3 }),
      ctx({ joursSansTravail: null, serie: 0 }),
    ];
    for (const c of contextes) {
      const inv = invitationDuMoment(c);
      expect(inv, JSON.stringify(c).slice(0, 70)).not.toBeNull();
      expect(inv!.actionAr.trim().length).toBeGreaterThan(3);
      // L'action tient en peu de mots : « révise la deuxième partie du chapitre
      // sur l'immunité » n'est PAS une action de deux minutes.
      expect(inv!.actionAr.length, inv!.actionAr).toBeLessThan(60);
      expect(['methodology', 'training', 'reviser', 'examens', 'chat']).toContain(inv!.cible);
    }
  });

  it('la première invitation d’un élève qui n’a JAMAIS rien fait = 2 minutes', () => {
    const inv = invitationDuMoment(ctx({ joursSansTravail: null, serie: 0 }))!;
    expect(inv.actionAr).toContain('سؤال');
    expect(inv.loi).toBe(3);
  });

  it('elle ne demande jamais de « réviser le chapitre » (trop gros pour démarrer)', () => {
    const inv = invitationDuMoment(ctx({ joursSansTravail: null, serie: 0 }))!;
    for (const gros of ['الفصل', 'المجال', 'الوحدة']) {
      expect(inv.actionAr, `action trop large : ${gros}`).not.toContain(gros);
    }
  });
});

describe('Loi 4 — SATISFAISANT : la récompense immédiate est NOMMÉE', () => {
  it('chaque invitation annonce un résultat visible tout de suite', () => {
    const contextes: ContexteCapitaine[] = [
      ctx({ joursSansTravail: 2, serie: 4 }),
      ctx({ joursSansTravail: 1, serie: 4 }),
      ctx({ joursSansTravail: 5, erreursAReprendre: 3 }),
      ctx({ joursSansTravail: null, serie: 0 }),
    ];
    for (const c of contextes) {
      const inv = invitationDuMoment(c)!;
      expect(inv.gainImmediatAr.trim().length, inv.gainImmediatAr).toBeGreaterThan(5);
      // La récompense de la révision est DIFFÉRÉE (le Bac est loin) : le livre
      // dit de coller une récompense immédiate dessus. Donc pas de « tu auras
      // une bonne note » — un résultat constatable maintenant.
      expect(inv.gainImmediatAr).not.toContain('البكالوريا');
    }
  });

  it('la série annoncée progresse d’un jour (le gain est concret)', () => {
    const inv = invitationDuMoment(ctx({ joursSansTravail: 1, serie: 6 }))!;
    expect(inv.gainImmediatAr).toContain('7');
  });
});

describe('« NE JAMAIS RATER DEUX FOIS » — la règle la plus utile du livre', () => {
  it('un jour manqué (2 jours sans travail) déclenche la reprise EN PRIORITÉ', () => {
    const inv = invitationDuMoment(ctx({ joursSansTravail: 2, serie: 9, erreursAReprendre: 5 }))!;
    expect(inv.situation).toBe('reprise');
    expect(inv.messageAr).toContain('يومين');
  });

  it('elle passe DEVANT le message de série', () => {
    const inv = invitationDuMoment(ctx({ joursSansTravail: 2, serie: 6 }))!;
    expect(inv.messageAr).toContain('يومين');
    expect(inv.messageAr).not.toContain('سلسلتك');
  });

  it('hier n’est PAS un jour manqué : la journée d’aujourd’hui est encore ouverte', () => {
    // Défaut évité : à 18 h, dire « tu as manqué un jour » à un élève qui a
    // travaillé hier soir serait FAUX. Ce cas relève de la loi 2 (protéger la
    // série), pas de la reprise.
    const inv = invitationDuMoment(ctx({ joursSansTravail: 1, serie: 4 }))!;
    expect(inv.messageAr).not.toContain('فُتت');
    expect(inv.messageAr).toContain('سلسلتك');
  });

  it('le message dit la règle, pas la faute', () => {
    const inv = invitationDuMoment(ctx({ joursSansTravail: 2 }))!;
    expect(inv.messageAr).toContain('لا تُفَوّت');
    expect(inv.messageAr).not.toContain('لم تعمل');
    expect(inv.messageAr).not.toContain('فشل');
  });

  it('au-delà de 3 jours, la série est morte : l’erreur en mémoire prend la main', () => {
    const inv = invitationDuMoment(ctx({ joursSansTravail: 4, erreursAReprendre: 3, serie: 0 }))!;
    expect(inv.situation).toBe('erreur');
    expect(inv.cible).toBe('methodology');
  });
});

describe('l’épreuve prime sur tout, y compris ici', () => {
  it('aucune invitation pendant une épreuve, quelles que soient les circonstances', () => {
    const pire = ctx({
      epreuveEnCours: true,
      joursSansTravail: 2,
      serie: 30,
      erreursAReprendre: 10,
      heure: 18,
    });
    expect(invitationDuMoment(pire)).toBeNull();
  });
});

describe('robustesse : aucune entrée ne doit produire un message faux', () => {
  it('un compteur inexploitable produit le silence, pas une affirmation fausse', () => {
    // Défaut trouvé par ce test en version « heures » : sous une valeur non
    // exploitable, le module tombait dans la branche « jamais rien produit » et
    // annonçait à l'élève « tu n'as jamais rien fait » — un mensonge.
    for (const mauvais of [Number.NaN, Number.POSITIVE_INFINITY, 1.5, -2]) {
      expect(invitationDuMoment(ctx({ joursSansTravail: mauvais })), String(mauvais)).toBeNull();
    }
  });

  it('un élève au travail aujourd’hui n’est PAS relancé', () => {
    expect(
      invitationDuMoment(ctx({ joursSansTravail: 0, serie: 5, erreursAReprendre: 4 })),
    ).toBeNull();
  });

  it('une seule erreur en mémoire ne déclenche RIEN (une fois, c’est le hasard)', () => {
    const une = ctx({ joursSansTravail: 4, erreursAReprendre: 1 });
    expect(invitationDuMoment(une)).toBeNull();
  });

  it('une série morte sans erreur connue et sans historique produit le silence', () => {
    expect(invitationDuMoment(ctx({ joursSansTravail: 9, serie: 0, erreursAReprendre: 0 }))).toBeNull();
  });

  it('le résultat est DÉTERMINISTE (mêmes entrées → même invitation)', () => {
    const c = ctx({ joursSansTravail: 1, serie: 4 });
    expect(invitationDuMoment(c)).toEqual(invitationDuMoment(c));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// L'EFFET CUMULÉ (Darren Hardy, 14/10/2026) — LE CAPITAINE DIT CE QUI RESTE.
//
// Défaut réel corrigé : la seule réponse possible au décrochage était une
// obligation (« ne rate pas deux fois »). Or un élève qui a déjà travaillé
// 40 jours n'a pas besoin d'un rappel à l'ordre, il a besoin de savoir que ses
// 40 jours sont toujours là. Le message nomme donc l'acquis, pas la faute.
// ─────────────────────────────────────────────────────────────────────────────
describe('effet cumulé — le capitaine nomme l’acquis, pas la faute', () => {
  it('un élève avec 40 jours de travail apprend qu’il n’a rien perdu', () => {
    const inv = invitationDuMoment(ctx({ joursSansTravail: 2, serie: 1, joursAccumules: 40 }))!;
    expect(inv.gainImmediatAr).toContain('40');
    expect(inv.gainImmediatAr).toContain('رصيدك');
    expect(inv.gainImmediatAr).toContain('لم يضِع');
  });

  it('sans cumul connu, elle ne prétend RIEN avoir été accumulé', () => {
    // Ne jamais fabriquer un chiffre : sans donnée, on revient à la formulation
    // sobre — c'est la seule honnête.
    const inv = invitationDuMoment(ctx({ joursSansTravail: 2, serie: 1, joursAccumules: 0 }))!;
    expect(inv.gainImmediatAr).not.toContain('رصيدك');
    expect(inv.gainImmediatAr).not.toContain('0');
  });

  it('un cumul d’un seul jour s’accorde au singulier', () => {
    const inv = invitationDuMoment(ctx({ joursSansTravail: 2, serie: 1, joursAccumules: 1 }))!;
    expect(inv.gainImmediatAr).toContain('يوم في رصيدك');
    expect(inv.gainImmediatAr).not.toContain('أيام');
  });

  it('après une série morte, le cumul est rappelé avec la reprise des erreurs', () => {
    const inv = invitationDuMoment(
      ctx({ joursSansTravail: 6, serie: 0, erreursAReprendre: 4, joursAccumules: 25 }),
    )!;
    expect(inv.situation).toBe('erreur');
    expect(inv.gainImmediatAr).toContain('25');
    expect(inv.gainImmediatAr).toContain('محفوظة');
  });

  it('un cumul abîmé ne produit jamais un message chiffré', () => {
    for (const mauvais of [Number.NaN, Number.POSITIVE_INFINITY, 1.5, -3]) {
      const inv = invitationDuMoment(ctx({ joursSansTravail: 2, serie: 1, joursAccumules: mauvais }))!;
      expect(inv.gainImmediatAr, String(mauvais)).not.toContain('رصيدك');
    }
  });

  it('le cumul ne rend JAMAIS le capitaine bavard : le silence reste majoritaire', () => {
    // Le risque d'un chiffre qui ne casse jamais : en faire un prétexte pour
    // reparler. Un élève au travail aujourd'hui n'est pas relancé, même avec
    // 300 jours au compteur.
    expect(invitationDuMoment(ctx({ joursSansTravail: 0, serie: 12, joursAccumules: 300 }))).toBeNull();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ÉTAPE 3 — LA DATE DU BAC DÉCIDE (15/10/2026, soir).
//
// Avant ce bloc, la date du BAC était AFFICHÉE dans l'application depuis
// toujours et ne décidait de RIEN : `CibleInvitation` acceptait `examens`, aucune
// branche ne l'utilisait. C'est ce trou que ces tests ferment — et ils le
// ferment en vérifiant aussi ce qui NE change PAS, parce que l'ordre du §5.C est
// absolu : un jour manqué garde la priorité sur l'épreuve chronométrée.
// ════════════════════════════════════════════════════════════════════════════
describe('Le sprint (phase 5) — la date du BAC entre dans la décision', () => {
  const EN_SPRINT = 21;

  function ctxSprint(over: Partial<ContexteCapitaine> = {}): ContexteCapitaine {
    return {
      heure: 10,
      joursSansTravail: 1,
      serie: 6,
      erreursAReprendre: 0,
      derniereUnite: 'المناعة',
      joursAccumules: 30,
      derniereInvitationIgnoreeMs: null,
      maintenantMs: MAINTENANT,
      epreuveEnCours: false,
      sprint: true,
      joursAvantBac: EN_SPRINT,
      ...over,
    };
  }

  it('la proposition devient une PRODUCTION CHRONOMÉTRÉE, vers `examens`', () => {
    const inv = invitationDuMoment(ctxSprint())!;
    expect(inv.cible).toBe('examens');
  });

  it('les textes sont ceux du DÉPÔT, repris verbatim — rien n’est inventé', () => {
    // Le contrôle porte sur l'identité des chaînes, pas sur leur allure : si
    // quelqu'un réécrit le conseil de la rubrique « examens » sans toucher à la
    // bulle, ce test tombe et dit où regarder.
    const livre = conseilDeRubrique('examens')!;
    const inv = invitationDuMoment(ctxSprint())!;
    expect(inv.messageAr).toBe(livre.conseilAr);
    expect(inv.actionAr).toBe(livre.gesteAr);
  });

  it('le gain nomme le décompte RÉEL, et rien d’autre', () => {
    const inv = invitationDuMoment(ctxSprint({ joursAvantBac: 21 }))!;
    expect(inv.gainImmediatAr).toContain('21');
  });

  it('un décompte inexploitable ne produit jamais un chiffre faux', () => {
    for (const mauvais of [null, undefined, Number.NaN, Number.POSITIVE_INFINITY]) {
      const inv = invitationDuMoment(ctxSprint({ joursAvantBac: mauvais }))!;
      expect(inv.gainImmediatAr, String(mauvais)).not.toContain('NaN');
      expect(inv.gainImmediatAr).not.toContain('بقي');
    }
  });

  it('la fenêtre horaire s’élargit : un sprint se commence le matin', () => {
    // La protection de série n'a de sens qu'en soirée ; une simulation, non.
    expect(invitationDuMoment(ctxSprint({ heure: 9 }))).not.toBeNull();
    // Sans sprint, la même situation reste silencieuse avant 17 h : c'est le
    // comportement historique, et il ne doit pas bouger.
    expect(invitationDuMoment(ctxSprint({ heure: 9, sprint: false }))).toBeNull();
  });

  it('le motif est DISTINCT de celui de la protection de série', () => {
    // Sinon trois échecs sur « protéger ta série » retireraient aussi la
    // proposition d'épreuve chronométrée : deux demandes différentes doivent
    // échouer séparément pour être retirées séparément.
    const sprint = motifDeInvitation(invitationDuMoment(ctxSprint())!);
    const ordinaire = motifDeInvitation(
      invitationDuMoment(ctxSprint({ sprint: false, heure: 18 }))!,
    );
    expect(sprint).toBe('reprise:examens');
    expect(ordinaire).toBe('reprise:training');
  });

  it('UN JOUR MANQUÉ GARDE LA PRIORITÉ — l’ordre du §5.C est absolu', () => {
    // Deux jours sans rien : la plus petite action possible, pas une épreuve.
    const inv = invitationDuMoment(ctxSprint({ joursSansTravail: 2 }))!;
    expect(inv.cible).toBe('reviser');
    expect(inv.cible).not.toBe('examens');
  });

  it('et les silences restent des silences, en sprint comme ailleurs', () => {
    expect(invitationDuMoment(ctxSprint({ joursSansTravail: 0 })), 'travail déjà fait').toBeNull();
    expect(invitationDuMoment(ctxSprint({ epreuveEnCours: true })), 'pendant l’épreuve').toBeNull();
    expect(invitationDuMoment(ctxSprint({ heure: 23 })), 'la nuit').toBeNull();
    expect(
      invitationDuMoment(ctxSprint({ derniereInvitationIgnoreeMs: MAINTENANT - 60_000 })),
      'message ignoré il y a une minute',
    ).toBeNull();
    expect(
      invitationDuMoment(ctxSprint({ serie: 0, joursSansTravail: 5, erreursAReprendre: 0 })),
      'rien à proposer',
    ).toBeNull();
  });

  it('un sprint non déclaré ne change RIEN au comportement historique', () => {
    // Le verrou de non-régression : sans `sprint`, la même situation produit
    // exactement ce qu'elle produisait avant l'étape 3.
    const avant = invitationDuMoment(ctxSprint({ sprint: undefined, heure: 18 }));
    expect(avant!.cible).toBe('training');
    expect(avant!.actionAr).toContain('دقيقتان');
  });
});

describe('Étape 5 — LE RELAIS HUMAIN PARLE SEUL (une voix à la fois, jamais deux)', () => {
  /**
   * La situation : série morte, erreurs en mémoire — le capitaine a quelque
   * chose à dire (`راجع خطأً واحدًا من دفترك`, motif `erreur:methodology`).
   *
   * LE MOTIF RETIRÉ EST DÉLIBÉRÉMENT UN AUTRE (`reprise:reviser`). S'il était
   * celui de la situation, le silence viendrait du retrait lui-même et le test ne
   * prouverait rien : vérifié en retirant l'arbitrage, le test restait vert. Ici,
   * le silence ne peut venir que de l'arbitrage — la mutation le fait tomber.
   */
  const situation = { joursSansTravail: 5, serie: 0, erreursAReprendre: 3 };
  const motifRetire: Partial<ContexteCapitaine> = { ...situation, motifsRetires: ['reprise:reviser'] };

  it('sans motif retiré, il n’existe pas : la quatrième tentative ne vient qu’après trois', () => {
    expect(
      relaisDuMoment(ctx(situation)),
      'le relais s’est invité avant que le capitaine ait renoncé',
    ).toBeNull();
  });

  it('un motif retiré : la nomination est posée, exactement telle qu’elle a été arrêtée', () => {
    expect(relaisDuMoment(ctx(motifRetire))).toEqual({ genre: 'nomination', questionAr: QUESTION_RELAIS_AR });
  });

  it('et alors LA BULLE SE TAIT — le relais n’est pas une deuxième voix', () => {
    // Le même contexte, SANS le relais : le capitaine parle de l'erreur à reprendre.
    expect(invitationDuMoment(ctx(situation))).not.toBeNull();
    // Avec : plus un mot. Une seule voix s'adresse à l'élève.
    expect(invitationDuMoment(ctx(motifRetire))).toBeNull();
  });

  it('les portes du silence sont les MÊMES pour lui — une seule définition', () => {
    const base = ctx(motifRetire);
    expect(relaisDuMoment({ ...base, epreuveEnCours: true }), 'épreuve').toBeNull();
    expect(relaisDuMoment({ ...base, heure: 23 }), 'nuit').toBeNull();
    expect(relaisDuMoment({ ...base, heure: 5 }), 'petit matin').toBeNull();
    expect(relaisDuMoment({ ...base, joursSansTravail: 0 }), 'a travaillé aujourd’hui').toBeNull();
    expect(
      relaisDuMoment({ ...base, derniereInvitationIgnoreeMs: MAINTENANT - 60_000 }),
      'vient de fermer la bulle',
    ).toBeNull();
    // Et la même chose vaut pour sa présence : aucune question n'est « consommée »
    // dans un moment où rien ne s'affiche.
    expect(invitationDuMoment({ ...base, epreuveEnCours: true })).toBeNull();
  });

  it('une nomination qui attend sa réponse laisse la bulle silencieuse', () => {
    const enAttente = ctx({ ...motifRetire, relais: { ...RELAIS_VIDE, demandeMs: MAINTENANT - 86_400_000 } });
    expect(relaisDuMoment(enAttente)).not.toBeNull();
    expect(invitationDuMoment(enAttente)).toBeNull();
  });

  it('après un refus : la question ne revient pas, et le guide continue de parler', () => {
    const refuse = ctx({ ...motifRetire, relais: { ...RELAIS_VIDE, demandeMs: MAINTENANT - 86_400_000, refusMs: MAINTENANT } });
    expect(relaisDuMoment(refuse), 'la question est revenue après un refus').toBeNull();
    // Refuser le relais ne coupe PAS le guide : le motif retiré reste muet (c'est
    // la porte de l'étape 1), mais la situation garde son conseil. Un refus qui
    // ferait taire le capitaine serait une punition — et personne ne confierait
    // un nom s'il y avait une punition.
    expect(invitationDuMoment(refuse), 'refuser le relais a fait taire le guide').not.toBeNull();
    // Sur un motif réellement retiré, la parole reste coupée : le refus du relais
    // n'a rien changé à la porte des trois échecs.
    const surLeMotifRetire = ctx({
      joursSansTravail: 2,
      serie: 3,
      motifsRetires: ['reprise:reviser'],
      relais: { ...RELAIS_VIDE, refusMs: MAINTENANT },
    });
    expect(invitationDuMoment(surLeMotifRetire)).toBeNull();
  });
});
