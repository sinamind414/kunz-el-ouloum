// prescriptions.test.ts — LA MÉMOIRE DE LA RELATION.
//
// Défaut réparé le 15/10/2026 : la seule trace de réaction de l'élève était un
// horodatage écrit quand il ferme la bulle, utilisé uniquement pour se taire six
// heures. Morchid savait quoi dire, quand le dire, et où en est l'élève — il ne
// savait pas si ce qu'il avait dit avait servi.
//
// Ces tests fixent les quatre issues d'une prescription, le retrait d'un motif
// après trois échecs, et l'honnêteté du bilan.
import { afterEach, describe, expect, it } from 'vitest';
import {
  ECHECS_AVANT_RETRAIT,
  EXPIRATION_MS,
  FENETRE_FERMETURE_MS,
  bilanBoucle,
  echecsDuMotif,
  effacerRegistre,
  emettrePrescription,
  erreursPrescritesEnAttente,
  lireRegistre,
  marquerAcceptee,
  marquerIgnoree,
  marquerSuivie,
  motifDeInvitation,
  motifRetire,
  motifsRetires,
  registreVide,
} from '../prescriptions';

const T = 1_700_000_000_000;
const INVITATION = { situation: 'reprise' as const, cible: 'reviser' as const };

afterEach(() => {
  localStorage.clear();
});

describe('le motif identifie la DEMANDE, pas le message', () => {
  it('deux messages qui ne diffèrent que par la série sont la même prescription', () => {
    // Le message varie (« سلسلتك: 5 أيام » puis « سلسلتك: 6 أيام ») alors que la
    // demande est identique. Compter par texte ne compterait jamais trois fois.
    const a = motifDeInvitation({ situation: 'reprise', cible: 'reviser' });
    const b = motifDeInvitation({ situation: 'reprise', cible: 'reviser' });
    expect(a).toBe(b);
    expect(a).toBe('reprise:reviser');
  });

  it('deux demandes différentes ont deux motifs différents', () => {
    expect(motifDeInvitation({ situation: 'reprise', cible: 'reviser' })).not.toBe(
      motifDeInvitation({ situation: 'reprise', cible: 'training' }),
    );
  });
});

describe('les quatre issues', () => {
  it('émettre → en attente, et le motif est compté comme dit', () => {
    expect(emettrePrescription(INVITATION, {}, T)).toBe(true);
    const r = lireRegistre(T);
    expect(r.prescriptions).toHaveLength(1);
    expect(r.prescriptions[0]!.issue).toBe('en_attente');
    expect(r.motifs['reprise:reviser']!.dits).toBe(1);
  });

  it('le travail mesuré honore la prescription', () => {
    emettrePrescription(INVITATION, {}, T);
    const honoree = marquerSuivie(T + 3_600_000);
    expect(honoree?.motif).toBe('reprise:reviser');
    expect(lireRegistre(T + 3_600_000).prescriptions[0]!.issue).toBe('suivie');
    expect(lireRegistre(T).motifs['reprise:reviser']!.suivis).toBe(1);
  });

  it('fermer la bulle est un ÉCHEC de la demande', () => {
    emettrePrescription(INVITATION, {}, T);
    expect(marquerIgnoree(T + 60_000)).toBe(true);
    expect(lireRegistre(T).prescriptions[0]!.issue).toBe('ignoree');
    expect(lireRegistre(T).motifs['reprise:reviser']!.ignores).toBe(1);
  });

  it('48 h sans rien → expirée, et le motif le sait', () => {
    emettrePrescription(INVITATION, {}, T);
    const r = lireRegistre(T + EXPIRATION_MS + 1);
    expect(r.prescriptions[0]!.issue).toBe('expiree');
    expect(r.motifs['reprise:reviser']!.expires).toBe(1);
  });

  it('…mais elle reste en attente AVANT l’échéance', () => {
    emettrePrescription(INVITATION, {}, T);
    const r = lireRegistre(T + EXPIRATION_MS - 1);
    expect(r.prescriptions[0]!.issue).toBe('en_attente');
    expect(r.motifs['reprise:reviser']!.expires).toBe(0);
  });

  it('l’expiration n’est comptée QU’UNE FOIS, même relue dix fois', () => {
    // Le compteur d'échecs décide du retrait d'un motif : le compter deux fois
    // pour un seul échec retirerait une phrase au bout de deux relances.
    emettrePrescription(INVITATION, {}, T);
    for (let i = 0; i < 10; i++) lireRegistre(T + EXPIRATION_MS + i);
    expect(lireRegistre(T + EXPIRATION_MS + 20).motifs['reprise:reviser']!.expires).toBe(1);
  });

  it('le clic sur « agir » est une INTENTION, pas un travail', () => {
    emettrePrescription(INVITATION, {}, T);
    expect(marquerAcceptee(T + 30_000)).toBe(true);
    const p = lireRegistre(T + 30_000).prescriptions[0]!;
    expect(p.accepteMs).toBe(T + 30_000);
    // L'issue, elle, n'a pas bougé : cliquer n'est pas produire.
    expect(p.issue).toBe('en_attente');
    expect(lireRegistre(T).motifs['reprise:reviser']!.suivis).toBe(0);
  });

  it('sans prescription en attente, aucune issue n’est inventée', () => {
    expect(marquerSuivie(T)).toBeNull();
    expect(marquerIgnoree(T)).toBe(false);
    expect(marquerAcceptee(T)).toBe(false);
  });
});

describe('le retrait après trois échecs — la conséquence réelle', () => {
  it('un motif suivi ne se retire jamais', () => {
    for (let i = 0; i < 5; i++) {
      emettrePrescription(INVITATION, {}, T + i * 1000);
      marquerSuivie(T + i * 1000 + 1);
    }
    expect(echecsDuMotif('reprise:reviser')).toBe(0);
    expect(motifRetire('reprise:reviser')).toBe(false);
  });

  it('trois ignorations retirent le motif', () => {
    for (let i = 0; i < ECHECS_AVANT_RETRAIT; i++) {
      emettrePrescription(INVITATION, {}, T + i * 1000);
      marquerIgnoree(T + i * 1000 + 1);
    }
    expect(echecsDuMotif('reprise:reviser')).toBe(ECHECS_AVANT_RETRAIT);
    expect(motifRetire('reprise:reviser')).toBe(true);
    expect(motifsRetires()).toContain('reprise:reviser');
  });

  it('ignorée et expirée comptent ENSEMBLE : la demande n’a pas passé', () => {
    emettrePrescription(INVITATION, {}, T);
    marquerIgnoree(T + 1000);
    emettrePrescription(INVITATION, {}, T + 2000);
    lireRegistre(T + 2000 + EXPIRATION_MS + 1); // expire
    emettrePrescription(INVITATION, {}, T + 3000);
    marquerIgnoree(T + 3001);
    expect(motifRetire('reprise:reviser')).toBe(true);
  });

  it('un motif retiré n’est PLUS émis — le coach cesse de le répéter', () => {
    for (let i = 0; i < ECHECS_AVANT_RETRAIT; i++) {
      emettrePrescription(INVITATION, {}, T + i * 1000);
      marquerIgnoree(T + i * 1000 + 1);
    }
    const avant = lireRegistre(T).prescriptions.length;
    expect(emettrePrescription(INVITATION, {}, T + 10_000)).toBe(false);
    expect(lireRegistre(T).prescriptions).toHaveLength(avant);
  });

  it('le retrait d’un motif ne retire pas les autres', () => {
    for (let i = 0; i < ECHECS_AVANT_RETRAIT; i++) {
      emettrePrescription(INVITATION, {}, T + i * 1000);
      marquerIgnoree(T + i * 1000 + 1);
    }
    expect(motifsRetires()).toEqual(['reprise:reviser']);
    const autre = { situation: 'accueil' as const, cible: 'training' as const };
    expect(emettrePrescription(autre, {}, T + 20_000)).toBe(true);
  });
});

describe('pas de doublon en attente', () => {
  it('réafficher la même demande ne gonfle pas le journal', () => {
    emettrePrescription(INVITATION, {}, T);
    emettrePrescription(INVITATION, {}, T + 1000);
    emettrePrescription(INVITATION, {}, T + 2000);
    const r = lireRegistre(T + 2000);
    expect(r.prescriptions).toHaveLength(1);
    expect(r.motifs['reprise:reviser']!.dits).toBe(1);
  });

  it('après une issue, la même demande peut repartir', () => {
    emettrePrescription(INVITATION, {}, T);
    marquerSuivie(T + 1000);
    expect(emettrePrescription(INVITATION, {}, T + 2000)).toBe(true);
    expect(lireRegistre(T + 2000).prescriptions).toHaveLength(2);
  });
});

describe('le bilan — les chiffres qui disent si le coach sert à quelque chose', () => {
  it('banque vide : taux de suivi null, pas 0 (on ne prétend rien)', () => {
    const b = bilanBoucle(T);
    expect(b.emises).toBe(0);
    expect(b.tauxSuivi).toBeNull();
  });

  it('compte les quatre issues et calcule le taux sur les RÉSOLUES', () => {
    emettrePrescription(INVITATION, {}, T);
    marquerSuivie(T + 1);
    emettrePrescription(INVITATION, {}, T + 2);
    marquerIgnoree(T + 3);
    emettrePrescription({ situation: 'accueil', cible: 'training' }, {}, T + 4);
    const b = bilanBoucle(T + 5);
    expect(b.emises).toBe(3);
    expect(b.suivies).toBe(1);
    expect(b.ignorees).toBe(1);
    expect(b.enAttente).toBe(1);
    // 1 suivie sur 2 résolues — l'en-attente ne compte pas, elle n'a pas d'issue.
    expect(b.tauxSuivi).toBeCloseTo(0.5, 10);
  });

  it('expose les motifs échoués, pour que la suite puisse agir dessus', () => {
    for (let i = 0; i < ECHECS_AVANT_RETRAIT; i++) {
      emettrePrescription(INVITATION, {}, T + i * 1000);
      marquerIgnoree(T + i * 1000 + 1);
    }
    expect(bilanBoucle(T).motifsEchoues).toEqual(['reprise:reviser']);
  });
});

describe('les erreurs prescrites en attente — le pont vers la fermeture', () => {
  it('ne remonte que les prescriptions portant un CODE d’erreur non résolu', () => {
    emettrePrescription({ situation: 'erreur', cible: 'methodology' }, { erreurCode: 'missing_unit', theme: 'المناعة' }, T);
    emettrePrescription({ situation: 'reprise', cible: 'reviser' }, {}, T);
    const enAttente = erreursPrescritesEnAttente(T);
    expect(enAttente).toHaveLength(1);
    expect(enAttente[0]!.code).toBe('missing_unit');
    expect(enAttente[0]!.theme).toBe('المناعة');
  });

  it('une erreur dont la prescription a été IGNORÉE n’est pas fermable', () => {
    // On ne félicite pas quelqu'un pour une erreur qu'il n'a jamais travaillée.
    emettrePrescription({ situation: 'erreur', cible: 'methodology' }, { erreurCode: 'missing_unit' }, T);
    marquerIgnoree(T + 1000);
    expect(erreursPrescritesEnAttente(T + 1000)).toHaveLength(0);
  });

  it('une erreur prescrite puis SUIVIE reste fermable — c’est le cas normal', () => {
    // Suivie = du travail a eu lieu ; la fermeture, elle, dépend de ce que
    // contient la production. Les deux moments sont distincts.
    emettrePrescription({ situation: 'erreur', cible: 'methodology' }, { erreurCode: 'missing_unit' }, T);
    marquerSuivie(T + 1000);
    expect(erreursPrescritesEnAttente(T + 1000).map((e) => e.code)).toEqual(['missing_unit']);
  });

  it('une erreur expirée RESTE fermable : le travail peut venir après coup', () => {
    emettrePrescription({ situation: 'erreur', cible: 'methodology' }, { erreurCode: 'missing_unit' }, T);
    expect(erreursPrescritesEnAttente(T + EXPIRATION_MS + 1).map((e) => e.code)).toEqual(['missing_unit']);
  });

  it('au-delà de la fenêtre, on ne relie plus la disparition à la relance', () => {
    // Trois semaines après, fermer l'erreur serait une coïncidence présentée
    // comme un résultat. On préfère ne rien affirmer.
    emettrePrescription({ situation: 'erreur', cible: 'methodology' }, { erreurCode: 'missing_unit' }, T);
    expect(erreursPrescritesEnAttente(T + FENETRE_FERMETURE_MS + 1)).toHaveLength(0);
    expect(erreursPrescritesEnAttente(T + FENETRE_FERMETURE_MS - 1)).toHaveLength(1);
  });
});

describe('robustesse du stockage', () => {
  it('un registre illisible est traité comme vide', () => {
    localStorage.setItem('boussole_prescriptions_v1', '{pas du json');
    expect(lireRegistre(T)).toEqual(registreVide());
  });

  it('une entrée corrompue est écartée sans emporter les autres', () => {
    localStorage.setItem(
      'boussole_prescriptions_v1',
      JSON.stringify({
        prescriptions: [{ motif: 'bon:reviser', cible: 'reviser', emisMs: T, issue: 'en_attente' }, { motif: 42 }],
        motifs: { 'bon:reviser': { dits: 1, suivis: 0, ignores: 0, expires: 0 }, '': { dits: 5 } },
      }),
    );
    const r = lireRegistre(T);
    expect(r.prescriptions).toHaveLength(1);
    expect(Object.keys(r.motifs)).toEqual(['bon:reviser']);
  });

  it('effacer le registre repart de zéro', () => {
    emettrePrescription(INVITATION, {}, T);
    effacerRegistre();
    expect(lireRegistre(T)).toEqual(registreVide());
  });
});
