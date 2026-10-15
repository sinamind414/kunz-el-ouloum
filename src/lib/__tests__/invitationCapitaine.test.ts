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
  HEURE_PROTECTION_SERIE,
  HEURE_SILENCE_NOCTURNE,
  invitationDuMoment,
  SILENCE_APRES_IGNORANCE_MS,
  type ContexteCapitaine,
} from '../invitationCapitaine';

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
