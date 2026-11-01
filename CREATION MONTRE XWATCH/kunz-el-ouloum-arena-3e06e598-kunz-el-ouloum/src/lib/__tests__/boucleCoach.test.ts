// boucleCoach.test.ts — LA BOUCLE FERMÉE, DE BOUT EN BOUT.
//
// Ce fichier ne teste pas un module : il teste un COMPORTEMENT qui n'existait
// pas. Avant le 15/10/2026, le capitaine pouvait redire exactement la même chose
// indéfiniment ; trois échecs de la même demande ne changeaient rien pour lui.
// Et rien ne créditait jamais un travail réel : le verdict était calculé, puis
// jeté.
//
// Les trois comportements verrouillés ici :
//   1. la même demande, répétée sans effet trois fois, est RETIRÉE ;
//   2. du travail MESURÉ honore la prescription en cours ;
//   3. une erreur prescrite qui disparaît devient un CRÉDIT mesuré.
import { afterEach, describe, expect, it } from 'vitest';
import { invitationDuMoment, type ContexteCapitaine } from '../invitationCapitaine';
import { ACTION_UNE_QUESTION_AR } from '../invitationCapitaine';
import { contexteCapitaine, lireEtatEleve } from '../etatEleve';
import {
  bilanBoucle,
  emettrePrescription,
  lireRegistre,
  marquerIgnoree,
  marquerSuivie,
  motifDeInvitation,
  motifsRetires,
} from '../prescriptions';
import {
  capitalErreurs,
  cloreErreursAbsentes,
  enregistrerErreurs,
  phraseErreurFermeeAr,
  profilErreurs,
} from '../../utils/profilErreurs';

const JOUR = 24 * 60 * 60 * 1000;
const T = Date.parse('2026-10-14T18:00:00.000Z');

/** Le même contexte, jour après jour : un élève qui a manqué un jour. */
function ctx(jour: number, over: Partial<ContexteCapitaine> = {}): ContexteCapitaine {
  return {
    heure: 18,
    joursSansTravail: 2, // « ne rate pas le deuxième » — la demande prioritaire
    serie: 0,
    erreursAReprendre: 0,
    derniereUnite: 'التركيب الضوئي',
    joursAccumules: 12,
    derniereInvitationIgnoreeMs: null,
    maintenantMs: T + jour * JOUR,
    epreuveEnCours: false,
    ...over,
  };
}

/**
 * UNE JOURNÉE DU CAPITAINE, avec la mémoire branchée — exactement ce que fait
 * le hook : lire les motifs retirés, demander l'invitation du moment, émettre.
 */
function journee(jour: number, reaction: 'ignorer' | 'travailler' | 'rien', over: Partial<ContexteCapitaine> = {}) {
  const c = ctx(jour, over);
  const registre = lireRegistre(c.maintenantMs);
  const invitation = invitationDuMoment({ ...c, motifsRetires: motifsRetires(registre) });
  if (invitation) emettrePrescription(invitation, {}, c.maintenantMs);
  if (reaction === 'ignorer') marquerIgnoree(c.maintenantMs + 60_000);
  if (reaction === 'travailler') marquerSuivie(c.maintenantMs + 3_600_000);
  return invitation;
}

afterEach(() => {
  localStorage.clear();
});

describe('LA BOUCLE CHANGE LE COMPORTEMENT DU CAPITAINE', () => {
  it('la même demande est faite trois fois… puis RETIRÉE', () => {
    const motifs: Array<string | null> = [];
    for (let j = 0; j < 4; j++) {
      const inv = journee(j, 'ignorer');
      motifs.push(inv ? motifDeInvitation(inv) : null);
    }
    // Les trois premières journées : la même demande, parce qu'elle n'a pas
    // encore échoué trois fois.
    expect(motifs[0]).toBe('reprise:reviser');
    expect(motifs[1]).toBe('reprise:reviser');
    expect(motifs[2]).toBe('reprise:reviser');
    // La quatrième : SILENCE. C'est le changement de comportement — le capitaine
    // ne redit pas une quatrième fois ce qui n'a pas passé trois fois.
    expect(motifs[3]).toBeNull();
    expect(motifsRetires()).toEqual(['reprise:reviser']);
  });

  it('un seul jour de travail remet le compteur d’échecs à zéro — la demande MARCHE', () => {
    // Deux échecs, puis l'élève travaille : le motif survit et continue d'être
    // proposé. Un coach ne retire pas une phrase qui fonctionne.
    journee(0, 'ignorer');
    journee(1, 'ignorer');
    expect(journee(2, 'travailler')).not.toBeNull();
    const bilan = bilanBoucle(T + 2 * JOUR);
    expect(bilan.suivies).toBe(1);
    // Les échecs restent comptés, mais le motif n'est pas retiré.
    expect(bilan.motifsEchoues).toEqual([]);
  });

  it('le taux de suivi est mesurable — c’est ce qui dira si le coach sert', () => {
    journee(0, 'travailler');
    journee(1, 'ignorer');
    journee(2, 'rien'); // expirera
    marquerSuivie(T + 2 * JOUR + 3 * JOUR); // une issue de plus, plus tard
    const bilan = bilanBoucle(T + 6 * JOUR);
    expect(bilan.emises).toBeGreaterThanOrEqual(2);
    expect(bilan.tauxSuivi).not.toBeNull();
  });
});

describe('LE TRAVAIL MESURÉ HONORE LA PRESCRIPTION', () => {
  it('une prescription émise puis suivie porte sa trace complète', () => {
    const inv = journee(0, 'rien');
    expect(inv).not.toBeNull();
    const honoree = marquerSuivie(T + 3_600_000);
    expect(honoree).not.toBeNull();
    expect(honoree!.motif).toBe(motifDeInvitation(inv!));
    expect(honoree!.issue).toBe('suivie');
    expect(honoree!.resoluMs).toBe(T + 3_600_000);
  });

  it('sans travail, la prescription reste en attente — on ne crédite pas un clic', () => {
    journee(0, 'rien');
    expect(lireRegistre(T + 60_000).prescriptions[0]!.issue).toBe('en_attente');
  });
});

describe('L’ERREUR PRESCRITE QUI DISPARAÎT DEVIENT UN CRÉDIT', () => {
  const CODE = 'missing_unit';

  it('le cycle complet : prescrire → travailler → la production ne contient plus l’erreur → crédit', () => {
    // 1. L'élève a cette erreur en mémoire.
    enregistrerErreurs([CODE], { theme: 'المناعة' });
    // 2. Le capitaine le relance dessus (le motif « erreur » de la cascade).
    const inv = journee(0, 'rien', { joursSansTravail: 4, erreursAReprendre: 3 });
    expect(inv?.situation).toBe('erreur');

    emettrePrescription(inv!, { erreurCode: CODE, theme: 'المناعة' }, T + 1000);
    // 3. Il travaille (travail mesuré).
    marquerSuivie(T + 2 * 3_600_000);
    // 4. Sa production est corrigée sur le MÊME thème, et l'erreur n'y est plus.
    const fermees = cloreErreursAbsentes([], {
      theme: 'المناعة',
      prescrites: [{ code: CODE, theme: 'المناعة' }],
    });
    expect(fermees).toHaveLength(1);

    // 5. Le crédit est MESURÉ, nommé, et le capital monte.
    const phrase = phraseErreurFermeeAr(fermees[0]!.code, fermees[0]!.theme);
    expect(phrase).toContain('خرج من دفترك');
    expect(capitalErreurs().fermees).toBe(1);
    expect(profilErreurs()[CODE]).toBeUndefined();
  });

  it('et si l’erreur REVIENT, le capital le dit au lieu de le cacher', () => {
    enregistrerErreurs([CODE]);
    cloreErreursAbsentes([], { prescrites: [{ code: CODE }] });
    expect(capitalErreurs()).toEqual({ fermees: 1, rouvertes: 0, total: 1 });

    // L'élève se trompe à nouveau sur le même type : la fermeture ne valait rien.
    enregistrerErreurs([CODE]);
    const c = capitalErreurs();
    expect(c.rouvertes).toBe(1);
    expect(c.fermees).toBe(0);
  });
});

describe('L’ESCALADE EST BRANCHÉE — de la mémoire jusqu’à la bulle', () => {
  // Ce test traverse la chaîne RÉELLE, sans construire le contexte à la main :
  // stockage → `lireEtatEleve` → `contexteCapitaine` → décision. C'est la seule
  // façon de savoir que `echecsParMotif` arrive vraiment jusqu'au capitaine —
  // trois fois déjà dans ce dépôt, un module correct n'était branché nulle part.
  const MOTIF = 'erreur:methodology';

  it('une invitation ignorée change la FORME de la suivante, à travers l’état', () => {
    // 1. Le capitaine parle (motif « erreur » : série morte, erreurs en mémoire).
    const entrees = {
      daily: { serieDernierJour: '2026-10-10', streakDays: 0, joursActifsTotal: 20 } as never,
      maintenant: new Date(T + 4 * JOUR),
      erreurs: { total: 3, dominante: null, capital: { fermees: 0, rouvertes: 0, total: 0 } },
    };
    const premiere = invitationDuMoment(
      contexteCapitaine(lireEtatEleve(entrees), 'المناعة'),
    )!;
    expect(motifDeInvitation(premiere)).toBe(MOTIF);
    expect(premiere.actionAr).toBe('راجع خطأً واحدًا من دفترك.');

    // 2. L'élève la ferme : l'issue est consignée, le motif compte un échec.
    emettrePrescription(premiere, {}, T + 4 * JOUR);
    marquerIgnoree(T + 4 * JOUR + 60_000);

    // 3. Le capitaine reparle — et ne redit pas la même chose.
    const seconde = invitationDuMoment(
      contexteCapitaine(lireEtatEleve(entrees), 'المناعة'),
    )!;
    expect(motifDeInvitation(seconde), 'l’identité du motif est intacte').toBe(MOTIF);
    expect(seconde.actionAr, 'la forme, elle, a changé').toBe(ACTION_UNE_QUESTION_AR);
    expect(seconde.messageAr, 'l’objectif, lui, ne bouge pas').toBe(premiere.messageAr);

    // 4. Et le niveau vient bien du STOCKAGE, pas d'un défaut de l'assembleur.
    const etat = lireEtatEleve(entrees);
    expect(etat.relation.echecsParMotif[MOTIF]).toEqual({ ignores: 1, expires: 0 });
  });
});

describe('LA BOUCLE COMPLÈTE, avec de VRAIES émissions', () => {
  // Le piège que ce test attrape, et il est vicieux : si la forme escaladée ne
  // conservait pas le motif d'origine, la prescription émise porterait un NOUVEAU
  // motif (la cible a changé). Le compteur d'échecs de l'ancien resterait bloqué à
  // un, l'escalade redirait le niveau 2 indéfiniment, et le retrait après trois
  // échecs n'arriverait JAMAIS. Trois itérations suffisent à le voir ; une seule
  // ne suffit pas.
  const MOTIF = 'erreur:methodology';

  function parler(jour: number) {
    const entrees = {
      daily: { serieDernierJour: '2026-10-10', streakDays: 0, joursActifsTotal: 20 } as never,
      maintenant: new Date(T + jour * JOUR),
      erreurs: { total: 3, dominante: null, capital: { fermees: 0, rouvertes: 0, total: 0 } },
    };
    return invitationDuMoment(contexteCapitaine(lireEtatEleve(entrees), 'المناعة'));
  }

  it('trois tentatives, trois formes, puis le SILENCE — sans se bloquer', () => {
    const formes: string[] = [];
    for (let i = 0; i < 3; i++) {
      const inv = parler(i);
      if (!inv) break;
      formes.push(inv.actionAr);
      expect(motifDeInvitation(inv), `itération ${i} : le motif a changé de nom`).toBe(MOTIF);
      emettrePrescription(inv, {}, T + i * JOUR);
      marquerIgnoree(T + i * JOUR + 60_000);
    }

    expect(formes, 'trois formes distinctes attendues').toHaveLength(3);
    expect(new Set(formes).size, 'deux tentatives identiques : l’escalade est bloquée').toBe(3);

    // Trois échecs sur le MÊME motif : le capitaine n’en parle plus.
    const apres = parler(4);
    expect(apres, 'après trois échecs, le motif doit être retiré').toBeNull();
    expect(motifsRetires()).toContain(MOTIF);
  });
});
