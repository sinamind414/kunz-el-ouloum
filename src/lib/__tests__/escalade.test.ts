// escalade.test.ts — CHANGER DE MÉTHODE PLUTÔT QUE RÉPÉTER (§5.D, étape 4).
//
// Le document est sans ambiguïté sur le défaut à réparer :
//
//   « Un coach qui ne modifie pas son approche après trois échecs n'est pas un
//     coach têtu, c'est un distributeur en panne. »
//
// Avant ce fichier, le capitaine avait deux comportements : dire la même chose,
// ou se taire après trois échecs. Il n'avait pas celui du milieu — le seul qui
// aide vraiment : DIRE AUTREMENT.
//
// Trois propriétés sont verrouillées ici, et la troisième est celle qu'on casse
// par inadvertance :
//
//   1. l'OBJECTIF ne change jamais — même message, même gain. On ne récompense
//      pas l'élève de n'avoir pas répondu en lui demandant moins de chose
//      importante : on lui rend la porte plus étroite ;
//   2. la FORME se réduit — une question au lieu d'une séance, puis une seule
//      question ;
//   3. L'IDENTITÉ de la prescription survit au changement de forme. Sans cela,
//      changer la cible créerait un nouveau motif, le compteur d'échecs
//      repartirait de zéro, et l'escalade serait un puits sans fond.
import { describe, expect, it } from 'vitest';
import {
  ACTION_UNE_QUESTION_AR,
  ACTION_UNE_SEULE_QUESTION_AR,
  invitationDuMoment,
  motifDeInvitation,
  niveauEscalade,
  varianteEscaladee,
  type ContexteCapitaine,
  type Invitation,
} from '../invitationCapitaine';

const MAINTENANT = Date.parse('2026-10-14T18:00:00.000Z');

function ctx(over: Partial<ContexteCapitaine> = {}): ContexteCapitaine {
  return {
    heure: 18,
    joursSansTravail: 5, // série morte + erreurs en mémoire : le motif « erreur »
    serie: 0,
    erreursAReprendre: 3,
    derniereUnite: 'المناعة',
    joursAccumules: 20,
    derniereInvitationIgnoreeMs: null,
    maintenantMs: MAINTENANT,
    epreuveEnCours: false,
    ...over,
  };
}

const MOTIF_ERREUR = 'erreur:methodology';

describe('niveauEscalade — la règle du §5.D, chiffre par chiffre', () => {
  it('aucun échec : la parole normale', () => {
    expect(niveauEscalade(undefined)).toBe(1);
    expect(niveauEscalade({ ignores: 0, expires: 0 })).toBe(1);
  });

  it('une invitation IGNORÉE → forme différente (niveau 2)', () => {
    expect(niveauEscalade({ ignores: 1, expires: 0 })).toBe(2);
  });

  it('DEUX échecs → action minuscule (niveau 3), quel que soit leur genre', () => {
    // « Quatre tentatives » qui progressent, dit le §5.D — pas quatre fois la
    // même. Ce test existe à cause d'un défaut trouvé par la boucle complète :
    // une règle qui ne regardait que « au moins un échec » bloquait l'escalade au
    // niveau 2 pour toujours, et le retrait après trois échecs n'arrivait jamais.
    expect(niveauEscalade({ ignores: 2, expires: 0 })).toBe(3);
    expect(niveauEscalade({ ignores: 5, expires: 0 })).toBe(3);
    expect(niveauEscalade({ ignores: 1, expires: 1 })).toBe(3);
  });

  it('une invitation EXPIRÉE → minimum absolu (niveau 3)', () => {
    // Le document traite l'expiration plus durement que l'ignorance, et la
    // raison est solide : ignorer est un refus (on change d'angle), laisser
    // expirer est une absence (on réduit la demande). « (rien pendant 48 h) →
    // il RÉDUIT la demande au minimum absolu : une seule question, pas une séance. »
    expect(niveauEscalade({ ignores: 0, expires: 1 })).toBe(3);
    expect(niveauEscalade({ ignores: 2, expires: 1 })).toBe(3);
  });

  it('un compteur abîmé ne fait pas dérailler l’escalade', () => {
    const mauvais = [Number.NaN, Number.POSITIVE_INFINITY, -5, 1.7];
    for (const m of mauvais) {
      const niveau = niveauEscalade({ ignores: m, expires: 0 });
      expect([1, 2, 3], String(m)).toContain(niveau);
    }
  });
});

describe('la forme se réduit, l’objectif ne bouge pas', () => {
  it('niveau 1 : la parole normale, mot pour mot', () => {
    const inv = invitationDuMoment(ctx())!;
    expect(inv.actionAr).toBe('راجع خطأً واحدًا من دفترك.');
    expect(inv.cible).toBe('methodology');
    expect(inv.motif, 'au niveau 1, pas de motif forcé').toBeUndefined();
  });

  it('niveau 2 : une QUESTION au lieu d’une séance — même message, même gain', () => {
    const base = invitationDuMoment(ctx())!;
    const esca = invitationDuMoment(ctx({ echecsParMotif: { [MOTIF_ERREUR]: { ignores: 1, expires: 0 } } }))!;

    expect(esca.actionAr).toBe(ACTION_UNE_QUESTION_AR);
    expect(esca.cible, 'la forme change de canal : methodology → training').toBe('training');
    // L'OBJECTIF est intact : c'est la propriété qui empêche l'escalade de devenir
    // un abandon déguisé.
    expect(esca.messageAr).toBe(base.messageAr);
    expect(esca.gainImmediatAr).toBe(base.gainImmediatAr);
    expect(esca.loi).toBe(base.loi);
    expect(esca.situation).toBe(base.situation);
  });

  it('niveau 3 : UNE SEULE question, puis tu fermes', () => {
    const esca = invitationDuMoment(
      ctx({ echecsParMotif: { [MOTIF_ERREUR]: { ignores: 1, expires: 1 } } }),
    )!;
    expect(esca.actionAr).toBe(ACTION_UNE_SEULE_QUESTION_AR);
    expect(esca.cible).toBe('training');
  });

  it('les deux formes réduites sont des phrases LIVRÉES, pas des inventions', () => {
    // Contrôle d'identité : ces chaînes existaient déjà dans le module avant
    // l'escalade (porte des 2 minutes, règle « ne jamais rater deux fois »).
    expect(ACTION_UNE_QUESTION_AR).toBe('اختبار قصير: سؤال واحد.');
    expect(ACTION_UNE_SEULE_QUESTION_AR).toBe('سؤال واحد فقط، الآن.');
  });

  const accueilCtx = { joursSansTravail: null, serie: 0, erreursAReprendre: 0 } as const;

  it('niveau 2 : la forme visée est DÉJÀ celle de l’invitation → rien ne change', () => {
    // La porte des deux minutes propose déjà « une question ». À ce niveau, il
    // n'existe pas de version plus petite d'un premier pas — et on préfère rendre
    // l'invitation telle quelle plutôt qu'une copie qui prétendrait avoir changé
    // quelque chose.
    const accueil = invitationDuMoment(ctx({ ...accueilCtx }))!;
    const avecEchecs = invitationDuMoment(
      ctx({ ...accueilCtx, echecsParMotif: { [motifDeInvitation(accueil)]: { ignores: 1, expires: 0 } } }),
    )!;
    expect(avecEchecs.actionAr).toBe(accueil.actionAr);
    expect(avecEchecs.cible).toBe(accueil.cible);
  });

  it('niveau 3 : même la porte des deux minutes se resserre — une seule question', () => {
    // Après une expiration, le §5.D ne demande pas « la même chose » : il demande
    // le minimum absolu. La demande passe de « un petit test : une question » à
    // « une seule question, maintenant » — plus petite, et l'objectif est intact.
    const accueil = invitationDuMoment(ctx({ ...accueilCtx }))!;
    const resserre = invitationDuMoment(
      ctx({ ...accueilCtx, echecsParMotif: { [motifDeInvitation(accueil)]: { ignores: 0, expires: 1 } } }),
    )!;
    expect(resserre.actionAr).toBe(ACTION_UNE_SEULE_QUESTION_AR);
    expect(resserre.messageAr).toBe(accueil.messageAr);
  });
});

describe('l’identité survit au changement de forme — sinon l’escalade ne progresse jamais', () => {
  const base: Invitation = {
    situation: 'erreur',
    messageAr: 'M',
    actionAr: 'راجع خطأً واحدًا من دفترك.',
    gainImmediatAr: 'G',
    cible: 'methodology',
    loi: 3,
  };

  it('la variante porte le motif d’ORIGINE, pas celui de sa nouvelle cible', () => {
    const v2 = varianteEscaladee(base, 2);
    const v3 = varianteEscaladee(base, 3);
    expect(motifDeInvitation(v2)).toBe(MOTIF_ERREUR);
    expect(motifDeInvitation(v3)).toBe(MOTIF_ERREUR);
    // Et sans le champ `motif`, la cible aurait produit un AUTRE motif :
    expect(`${v2.situation}:${v2.cible}`).toBe('erreur:training');
    expect(motifDeInvitation(v2)).not.toBe('erreur:training');
  });

  it('escalader deux fois de suite reste le même motif', () => {
    const v3 = varianteEscaladee(varianteEscaladee(base, 2), 3);
    expect(motifDeInvitation(v3)).toBe(MOTIF_ERREUR);
    expect(v3.actionAr).toBe(ACTION_UNE_SEULE_QUESTION_AR);
  });

  it('la suite complète 1 → 2 → 3 → SILENCE, sur le même motif', () => {
    // C'est le parcours du §5.D : trois tentatives, puis la phrase est retirée
    // (le relais humain, lui, est l'étape 5 et n'existe pas encore).
    const motif = MOTIF_ERREUR;
    const etapes: Array<ReturnType<typeof invitationDuMoment>> = [
      invitationDuMoment(ctx()),
      invitationDuMoment(ctx({ echecsParMotif: { [motif]: { ignores: 1, expires: 0 } } })),
      invitationDuMoment(ctx({ echecsParMotif: { [motif]: { ignores: 1, expires: 1 } } })),
      invitationDuMoment(ctx({ echecsParMotif: { [motif]: { ignores: 2, expires: 1 } }, motifsRetires: [motif] })),
    ];

    expect(etapes[0]!.actionAr).toBe('راجع خطأً واحدًا من دفترك.');
    expect(etapes[1]!.actionAr).toBe(ACTION_UNE_QUESTION_AR);
    expect(etapes[2]!.actionAr).toBe(ACTION_UNE_SEULE_QUESTION_AR);
    expect(etapes[3], 'trois échecs : le capitaine se tait sur ce motif').toBeNull();

    // Et jamais deux fois la même forme.
    const actions = etapes.slice(0, 3).map((i) => i!.actionAr);
    expect(new Set(actions).size, 'deux tentatives identiques ?').toBe(3);
  });

  it('le retrait l’emporte sur l’escalade : un motif retiré reste silencieux', () => {
    expect(
      invitationDuMoment(ctx({ echecsParMotif: { [MOTIF_ERREUR]: { ignores: 0, expires: 1 } }, motifsRetires: [MOTIF_ERREUR] })),
    ).toBeNull();
  });

  it('l’escalade ne contourne AUCUN silence', () => {
    // Une forme réduite ne doit pas devenir un prétexte pour reparler plus tôt :
    // les quatre portes du silence restent fermées.
    const echecs = { [MOTIF_ERREUR]: { ignores: 1, expires: 1 } };
    expect(invitationDuMoment(ctx({ echecsParMotif: echecs, epreuveEnCours: true }))).toBeNull();
    expect(invitationDuMoment(ctx({ echecsParMotif: echecs, heure: 23 }))).toBeNull();
    expect(invitationDuMoment(ctx({ echecsParMotif: echecs, joursSansTravail: 0 }))).toBeNull();
    expect(
      invitationDuMoment(ctx({ echecsParMotif: echecs, derniereInvitationIgnoreeMs: MAINTENANT - 1000 })),
    ).toBeNull();
  });

  it('un échec sur un AUTRE motif n’escalade pas celui-ci', () => {
    const autre = invitationDuMoment(
      ctx({ echecsParMotif: { 'reprise:training': { ignores: 3, expires: 2 } } }),
    )!;
    expect(autre.actionAr).toBe('راجع خطأً واحدًا من دفترك.');
    expect(autre.cible).toBe('methodology');
  });
});
