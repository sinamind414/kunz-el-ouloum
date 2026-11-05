// ============================================================
// invitationCapitaine.ts — LA BULLE DU CAPITAINE, CONSTRUITE SUR LES 4 LOIS
// D'ATOMIC HABITS (James Clear).
//
// LA DEMANDE : « une bulle 24/24 h ». LE PROBLÈME, ET C'EST LE LIVRE QUI LE DIT :
//
//   Loi 1 — « Rendre le comportement ÉVIDENT ».
//   Un signal présent EN PERMANENCE n'est plus un signal : le cerveau cesse de
//   le voir. C'est le mur du fond qui disparaît. Une bulle qui est toujours là
//   n'est vue par personne — et le jour où elle dit quelque chose d'important,
//   elle est déjà devenue du papier peint.
//   Ce que le livre recommande n'est pas « toujours visible », c'est
//   l'INTENTION D'IMPLÉMENTATION : « je ferai X à telle heure dans tel lieu ».
//   Autrement dit : la bulle doit apparaître AU BON MOMENT, pas tout le temps.
//
//   La bulle reste donc ÉVIDENTE (elle est là, elle ne se cache pas) mais elle
//   ne PREND LA PAROLE que quand elle a quelque chose à dire. Quand elle se
//   tait, elle reste un bouton : un clic l'ouvre, sans harceler.
//
// LES QUATRE LOIS, APPLIQUÉES UNE PAR UNE :
//
//   Loi 1 · ÉVIDENT — l'invitation est liée à un MOMENT précis (retour après un
//     jour manqué, fin de session, heure du travail), pas à un minuteur. Et un
//     message IGNORÉ disparaît pour de bon pendant un temps : forcer, c'est
//     fabriquer l'habitude inverse (« je ferme la bulle sans la lire »).
//
//   Loi 2 · ATTRAYANT — le message parle de ce que l'élève a DÉJÀ construit
//     (sa série, son unité en cours), jamais d'une obligation générale.
//     « Ta série de 5 jours » attire plus que « il faut réviser ».
//
//   Loi 3 · FACILE — règle des 2 minutes : chaque invitation propose UNE action
//     de moins de deux minutes, en UN clic. Jamais « révise l'immunité ».
//     « Reprends UNE erreur » est faisable même fatigué — et une fois lancé,
//     l'élève continue (c'est tout le principe).
//
//   Loi 4 · SATISFAISANT — l'invitation annonce le résultat IMMÉDIAT visible
//     (série préservée, erreur retirée du profil). La récompense de la révision
//     est différée (le Bac est loin) : le livre dit de coller une récompense
//     immédiate dessus. C'est exactement ce que cette ligne fait.
//
//   RÈGLE COMPLÉMENTAIRE, la plus utile du livre pour un élève :
//   « NE JAMAIS RATER DEUX FOIS ». Un jour manqué est humain ; deux jours de
//   suite, c'est le début d'une nouvelle habitude — la mauvaise.
//   C'est pourquoi la reprise après un jour manqué a la PRIORITÉ LA PLUS HAUTE :
//   au-dessus des erreurs, au-dessus de tout.
//
// MODULE PUR (aucun DOM, aucun stockage) : il reçoit un contexte, il rend une
// invitation ou `null`. C'est ce qui le rend testable — et c'est ce qui a permis
// de vérifier les quatre lois au lieu de les affirmer.
// ============================================================

import type { SituationCapitaine } from '../data/capitaine';
import { conseilDeRubrique } from '../data/conseilsRubrique';
import type { EtatEleve } from './etatEleve';
// Le relais humain (§5.D, 4ᵉ tentative — étape 5). Le module `relais` ne connaît
// ni les prescriptions ni la taxonomie des erreurs : la flèche va dans ce sens,
// et jamais dans l'autre, pour qu'aucun compteur de la boucle ne puisse bouger à
// cause d'une conversation entre deux personnes.
import { RELAIS_VIDE, questionDuRelais, type QuestionRelais, type Relais } from './relais';

/** Où mène l'invitation — une destination, en un clic. */
/**
 * Destination de l'action : ce sont des IDENTIFIANTS D'ONGLET RÉELS d'App.tsx,
 * pas des noms de rubriques. Un nom « propre » qui ne correspond à aucun onglet
 * transforme le bouton en impasse — l'élève clique et rien ne se passe. Le test
 * `cablageCapitaine.test.ts` vérifie cette correspondance en lisant App.tsx.
 *   - `methodology` : « مفتاح » — c'est là que vit le دفتر الأخطاء (les erreurs)
 *   - `training`    : التمارين والتدريب — l'exercice de deux minutes
 *   - `reviser`     : المراجعة — reprendre un contenu déjà vu
 *   - `examens`     : الاختبارات — production chronométrée (sprint, phase 5)
 */
export type CibleInvitation = 'methodology' | 'training' | 'reviser' | 'examens' | 'chat';

export interface ContexteCapitaine {
  /** Heure locale (0-23) — sert au bon moment, jamais au minutage agressif. */
  heure: number;
  /**
   * Nombre de jours écoulés depuis le dernier jour RÉELLEMENT travaillé.
   *
   *   0     → l'élève a travaillé aujourd'hui          → le capitaine se tait
   *   1     → il a travaillé hier, la série est VIVANTE → il peut encore la tenir
   *   2     → il a manqué UN jour                       → « ne rate pas le 2ᵉ »
   *   ≥ 3   → la série est morte                        → on repart des erreurs
   *   null  → il n'a JAMAIS rien produit                → règle des 2 minutes
   *
   * L'unité est le JOUR, pas l'heure, et c'est délibéré : c'est l'unité du
   * livre (« ne jamais rater DEUX FOIS ») et c'est celle de la donnée réelle
   * (`serieDernierJour`, jour local). Compter en heures donnait un décalage d'un
   * jour entier — à 18 h, dire « tu as manqué un jour » à un élève qui a travaillé
   * hier soir aurait été FAUX : sa journée n'est pas finie.
   */
  joursSansTravail: number | null;
  /** Série de jours consécutifs affichée (0 = série morte). */
  serie: number;
  /**
   * CUMUL des jours travaillés depuis le début — jamais remis à zéro.
   *
   * Sert à un seul usage, mais décisif : quand l'élève vient de manquer un jour,
   * lui dire ce qu'il a DÉJÀ accumulé. Sans ce chiffre, le capitaine ne peut
   * parler que de la règle (« ne rate pas deux fois »), c'est-à-dire d'une
   * obligation ; avec lui, il peut nommer un acquis réel. « L'effet cumulé »
   * (Darren Hardy) : un jour manqué n'efface rien — encore faut-il le montrer,
   * sinon l'élève croit le contraire.
   */
  joursAccumules?: number;
  /** Nombre d'erreurs en mémoire qui attendent une reprise (≥ 2 pour compter). */
  erreursAReprendre: number;
  /** Dernière unité travaillée — pour que le message parle de quelque chose de réel. */
  derniereUnite?: string | null;
  /** Horodatage de la dernière invitation ignorée par l'élève, ou `null`. */
  derniereInvitationIgnoreeMs?: number | null;
  /** Maintenant, en millisecondes epoch (sert au silence après ignorance). */
  maintenantMs: number;
  /** Une épreuve est en cours : le capitaine se tait, sans exception. */
  epreuveEnCours?: boolean;
  /**
   * Motifs DÉJÀ RETIRÉS (trois échecs — voir `prescriptions.ts`).
   *
   * Un motif retiré produit le SILENCE au lieu d'une quatrième répétition. Ce
   * n'est pas un abandon : c'est le constat qu'une demande formulée de cette
   * façon ne passe pas, et que la redire encore userait l'autorité du guide sans
   * rien produire. La suite (l'escalade, puis le relais vers un humain) travaille
   * sur ces cas à partir de `prescriptions.motifsRetires()`.
   */
  motifsRetires?: readonly string[];
  /**
   * SPRINT — moins de trente jours avant le BAC (§5.B, phase 5).
   *
   * POURQUOI CE CHAMP EXISTE. La date du BAC était AFFICHÉE depuis toujours
   * (tuile de l'accueil, `dashboardActions.bacDaysLeft`) sans jamais décider de
   * quoi que ce soit : elle servait de décoration. Le §5.A la liste pourtant comme
   * une famille d'entrée à part entière, et le §5.B dit ce dont un élève a besoin
   * à moins de trente jours : « production chronométrée, plus aucune découverte ».
   * C'est le seul endroit du produit où cette phrase devient un comportement.
   */
  sprint?: boolean;
  /**
   * Jours restants avant le BAC, pour le DIRE. `null` = date non tranchée.
   *
   * Séparé de `sprint` à dessein : on peut vouloir nommer le décompte sans être
   * encore en sprint, et l'inverse (un sprint sans date connue n'existe pas, mais
   * le type ne doit pas l'interdire par accident).
   */
  joursAvantBac?: number | null;
  /**
   * LES ÉCHECS PAR MOTIF — la mémoire de l'escalade (§5.D).
   *
   * Fournie par `prescriptions.ts`, qui compte les issues. Elle sert à choisir la
   * FORME de la prochaine tentative, jamais à décider de se taire : le silence
   * après trois échecs est déjà assuré par `motifsRetires`.
   */
  echecsParMotif?: Readonly<Record<string, EchecsMotif>>;
  /**
   * LE RELAIS HUMAIN — l'état brut, lu sur l'appareil (§5.D, 4ᵉ tentative).
   *
   * Fourni par la famille « relation » (étape 2), comme les motifs retirés. Il
   * sert à DEUX choses, et à deux seulement : savoir s'il faut poser la question
   * (« من هو؟ »), puis poser la relance. Le relais ne devient jamais une
   * prescription, ne compte jamais comme un échec, et ne décide jamais du
   * silence : quand il parle, il n'est pas une voix de plus, il est LA voix —
   * c'est pourquoi `invitationDuMoment` se tait tant qu'il a quelque chose à dire.
   */
  relais?: Relais | null;
}

/**
 * L'IDENTITÉ STABLE D'UNE PRESCRIPTION — `situation:cible`.
 *
 * Défini ICI, à côté du type qu'il empreinte, et non dans `prescriptions.ts` :
 * c'est la direction qui évite un import circulaire (le module de la boucle a
 * besoin de connaître ce motif, l'invitation n'a pas besoin de la boucle).
 *
 * POURQUOI PAS LE TEXTE DU MESSAGE. Le message varie (« سلسلتك: 5 أيام », puis
 * « سلسلتك: 6 أيام ») alors que la prescription est la même. Compter par texte ne
 * compterait jamais trois fois la même demande — et c'est précisément le comptage
 * de trois échecs qui fait retirer une phrase qui ne marche pas.
 */
export function motifDeInvitation(
  invitation: Pick<Invitation, 'situation' | 'cible' | 'motif'>,
): string {
  // `motif` est posé par l'ESCALADE (§5.D), et c'est indispensable : changer la
  // forme change la cible, donc le motif calculé — et l'escalade remettrait son
  // propre compteur à zéro à chaque tentative, ce qui la rendrait impossible.
  // L'identité d'une prescription ne doit pas dépendre de la façon dont elle est
  // formulée. Un test le verrouille.
  return invitation.motif ?? `${invitation.situation}:${invitation.cible}`;
}

export interface Invitation {
  /** Situation de parole (voir `capitaine.ts`). */
  situation: SituationCapitaine;
  /** Ce que le capitaine dit — court, en arabe. */
  messageAr: string;
  /** L'action, en moins de deux minutes (loi 3). */
  actionAr: string;
  /** Le résultat immédiat visible (loi 4). */
  gainImmediatAr: string;
  /** Où aller en un clic. */
  cible: CibleInvitation;
  /** La loi d'Atomic Habits qui justifie CETTE invitation. */
  loi: 1 | 2 | 3 | 4;
  /**
   * L'identité de la prescription, quand la FORME varie.
   *
   * Absent au niveau 1 : le motif se calcule alors de `situation:cible`. Posé par
   * l'escalade, qui change justement la cible — voir `motifDeInvitation`.
   */
  motif?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// L'ESCALADE (§5.D) — changer de méthode plutôt que de répéter.
//
// « Un coach qui ne modifie pas son approche après trois échecs n'est pas un
// coach têtu, c'est un distributeur en panne. »
//
// Le principe : l'OBJECTIF ne change jamais (même message, même gain), seule la
// FORME se réduit. On ne récompense pas l'élève de ne pas répondre en lui
// demandant moins ; on lui rend la porte plus étroite pour qu'il puisse la
// franchir. C'est la logique exacte de la règle des deux minutes.
//
// Les deux formes réduites sont des phrases DÉJÀ LIVRÉES, extraites ici en
// constantes pour être utilisées aux deux endroits (la branche d'origine et
// l'escalade) : une seule source, donc aucune divergence possible.
// ─────────────────────────────────────────────────────────────────────────────

/** « une question au lieu d'une séance » — forme réduite, niveau 2. */
export const ACTION_UNE_QUESTION_AR = 'اختبار قصير: سؤال واحد.';

/** « une seule question, puis tu fermes » — action minuscule, niveau 3. */
export const ACTION_UNE_SEULE_QUESTION_AR = 'سؤال واحد فقط، الآن.';

export type NiveauEscalade = 1 | 2 | 3;

/** Les échecs d'un motif, tels que `prescriptions.ts` les compte. */
export interface EchecsMotif {
  ignores: number;
  expires: number;
}

/**
 * Le niveau d'escalade d'un motif, d'après ses échecs.
 *
 *   0 échec            → 1 : la parole normale (1ʳᵉ tentative).
 *   1 échec            → 2 : même objectif, forme différente (2ᵉ tentative, §5.D).
 *   2 échecs           → 3 : action minuscule (3ᵉ tentative, §5.D).
 *   au moins 1 EXPIRÉE → 3 : réduction au minimum absolu, sans attendre. Le document est
 *                         explicite : « (rien pendant 48 h) → il RÉDUIT la
 *                         demande au minimum absolu : une seule question, pas une
 *                         séance. » L'expiration est donc traitée plus durement
 *                         que l'ignorance : ignorer est un refus (on change
 *                         d'angle), laisser expirer est une absence (on réduit).
 *
 * Ce module ne connaît PAS le retrait (trois échecs → silence) : il vit dans
 * `prescriptions.ts`, qui compte les échecs. Ici on ne fait que choisir la forme
 * de la tentative SUIVANTE.
 */
export function niveauEscalade(echecs: EchecsMotif | undefined): NiveauEscalade {
  if (!echecs) return 1;
  const borne = (n: number) => (Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0);
  const expires = borne(echecs.expires);
  const ignores = borne(echecs.ignores);
  const total = expires + ignores;

  // L'EXPIRATION SAUTE DIRECTEMENT AU MINIMUM — le §5.D le dit pour elle seule.
  if (expires >= 1) return 3;
  // Sinon on monte d'un cran À CHAQUE échec : « quatre tentatives » qui
  // progressent, pas quatre fois la même. (Défaut trouvé par un test : avec une
  // règle qui ne distinguait que « au moins un échec », un élève qui ignorait
  // deux fois recevait la MÊME forme réduite indéfiniment — l'escalade était
  // bloquée au niveau 2, et le retrait après trois échecs n'arrivait jamais.)
  if (total >= 2) return 3;
  if (total >= 1) return 2;
  return 1;
}

/**
 * La forme réduite d'une invitation, ou l'invitation elle-même.
 *
 * UNE GARDE, ET ELLE EST NÉCESSAIRE : si la forme visée est DÉJÀ celle de
 * l'invitation, on rend l'invitation telle quelle plutôt qu'une copie qui
 * prétendrait avoir changé quelque chose. C'est le cas de la porte des deux
 * minutes au niveau 2 — elle propose déjà « une question », et il n'existe pas de
 * version plus petite d'un premier pas à ce niveau.
 *
 * Au niveau 3, en revanche, la demande se resserre d'un cran (« une seule
 * question, puis tu fermes »), y compris pour la porte des deux minutes : c'est
 * exactement ce que le §5.D prescrit après une expiration.
 */
export function varianteEscaladee(invitation: Invitation, niveau: NiveauEscalade): Invitation {
  if (niveau <= 1) return invitation;
  const actionAr = niveau >= 3 ? ACTION_UNE_SEULE_QUESTION_AR : ACTION_UNE_QUESTION_AR;
  if (invitation.actionAr === actionAr && invitation.cible === 'training') return invitation;
  return {
    ...invitation,
    // Même message, même gain, même loi : l'OBJECTIF est intact.
    actionAr,
    cible: 'training',
    motif: motifDeInvitation(invitation),
  };
}

/** Délai de silence après un message ignoré (loi 1, version inverse). */
export const SILENCE_APRES_IGNORANCE_MS = 6 * 60 * 60 * 1000;

/** À partir de 22 h, on se tait : relancer un élève la nuit fabrique du rejet. */
export const HEURE_SILENCE_NOCTURNE = 22;

/** Avant 7 h, on se tait aussi (nuit + petit matin). */
export const HEURE_DEBUT = 7;

/** Heure à partir de laquelle protéger une série encore tenable a du sens. */
export const HEURE_PROTECTION_SERIE = 17;

/**
 * LES PORTES DU SILENCE, EN UN SEUL ENDROIT.
 *
 * Extraites de `invitationDuMoment` le 15/10/2026, quand le relais humain a eu
 * besoin des mêmes portes. Elles étaitent écrites en tête de la fonction ; les
 * recopier pour le relais aurait créé la seule chose que ce dépôt s'interdit
 * depuis le début : deux définitions du même silence, qui divergent un jour sans
 * que personne ne s'en aperçoive.
 *
 * Cinq portes, dans cet ordre :
 *   1. l'épreuve en cours — aucune parole, sans exception ;
 *   2. un message fermé il y a moins de six heures — la loi 1, à l'envers ;
 *   3. la nuit (avant 7 h, après 22 h) — relancer la nuit fabrique du rejet ;
 *   4. un compteur de jours inexploitable — `null` veut dire « jamais rien
 *      produit » : c'est un fait, et le capitaine peut en parler. Toute AUTRE
 *      valeur non entière veut dire « on ne sait pas » : affirmer quoi que ce
 *      soit sur l'élève serait un mensonge. Entre un message faux et le silence,
 *      on choisit le silence ;
 *   5. le travail déjà fait aujourd'hui — un élève qui a travaillé n'est pas
 *      relancé.
 */
export function capitainePeutParler(ctx: ContexteCapitaine): boolean {
  if (ctx.epreuveEnCours) return false; // épreuve : silence absolu

  const ignoreDepuisMs =
    ctx.derniereInvitationIgnoreeMs === null || ctx.derniereInvitationIgnoreeMs === undefined
      ? null
      : ctx.maintenantMs - ctx.derniereInvitationIgnoreeMs;
  if (ignoreDepuisMs !== null && Number.isFinite(ignoreDepuisMs) && ignoreDepuisMs < SILENCE_APRES_IGNORANCE_MS) {
    return false;
  }

  if (ctx.heure >= HEURE_SILENCE_NOCTURNE || ctx.heure < HEURE_DEBUT) return false;

  const j = ctx.joursSansTravail;
  if (j !== null && (!Number.isInteger(j) || j < 0)) return false;
  if (j === 0) return false;

  return true;
}

/**
 * LA QUESTION DU RELAIS HUMAIN, ou `null` (§5.D, 4ᵉ tentative — étape 5 du §9).
 *
 * Le déclencheur est le seul que le §5.D autorise : un motif DÉJÀ RETIRÉ — trois
 * demandes formulées n'ont pas passé, et le capitaine a renoncé à ce motif. À ce
 * moment précis, la suite n'est plus une parole de l'application : c'est une
 * conversation entre l'élève et quelqu'un qui sait.
 *
 * Le moment est jugé par `capitainePeutParler`, une fois pour les deux voix :
 * le relais parle quand le capitaine peut parler, jamais autrement.
 */
export function relaisDuMoment(ctx: ContexteCapitaine): QuestionRelais | null {
  if (!capitainePeutParler(ctx)) return null;
  return questionDuRelais({
    relais: ctx.relais ?? RELAIS_VIDE,
    unMotifEstRetire: (ctx.motifsRetires?.length ?? 0) > 0,
    maintenantMs: ctx.maintenantMs,
  });
}

/**
 * L'invitation du moment, ou `null`.
 *
 * `null` est une RÉPONSE, pas un échec : c'est le silence du capitaine. Il est
 * rendu dans six cas — épreuve en cours, heure nocturne, message récemment
 * ignoré, travail déjà fait aujourd'hui, « tout va bien », et depuis l'étape 5 :
 * un relais humain a quelque chose à demander, et une seule voix parle à la fois.
 */
export function invitationDuMoment(ctx: ContexteCapitaine): Invitation | null {
  // ── LES PORTES DU SILENCE. Une seule définition, partagée avec le relais. ──
  if (!capitainePeutParler(ctx)) return null;

  /**
   * LE RELAIS HUMAIN PARLE SEUL — une seule voix à la fois.
   *
   * Placé ici, avant toutes les règles de moment, parce qu'un motif retiré n'est
   * pas « un moment parmi d'autres » : c'est l'aveu que la parole de
   * l'application, sous cette forme, ne passe pas. Continuer à parler par-dessus
   * la question posée à l'élève diluerait les deux.
   */
  if (relaisDuMoment(ctx) !== null) return null;

  /**
   * LA PORTE DU SILENCE SUR LES MOTIFS RETIRÉS.
   *
   * Placée avant toutes les règles de moment, parce que la question n'est pas
   * « est-ce le bon moment ? » mais « ai-je déjà dit cela trois fois sans être
   * écouté ? ». Si oui, le moment n'a plus d'importance. (Les portes du silence
   * et le relais humain, eux, passent encore avant : voir `capitainePeutParler`
   * et `relaisDuMoment`.)
   */
  const parler = (invitation: Invitation): Invitation | null => {
    const motif = motifDeInvitation(invitation);
    // Trois échecs : la phrase est retirée, le capitaine se tait sur ce motif.
    if (ctx.motifsRetires?.includes(motif)) return null;
    // Sinon, on ne répète pas : on réduit la forme (§5.D).
    return varianteEscaladee(invitation, niveauEscalade(ctx.echecsParMotif?.[motif]));
  };

  // Les portes (épreuve, silence de 6 h, nuit, compteur inexploitable, travail
  // déjà fait) sont désormais dans `capitainePeutParler`, appelée en tête.
  const j = ctx.joursSansTravail;
  const jour = ctx.derniereUnite ? ` (${ctx.derniereUnite})` : '';
  // Cumul honnête : une valeur inexploitable vaut 0 (on n'annonce jamais un
  // chiffre qu'on n'a pas mesuré).
  const cumul =
    typeof ctx.joursAccumules === 'number' && Number.isInteger(ctx.joursAccumules) && ctx.joursAccumules > 0
      ? ctx.joursAccumules
      : 0;

  // ── « NE JAMAIS RATER DEUX FOIS » — priorité absolue. ────────────────────
  // Hier a été manqué. Si aujourd'hui l'est aussi, l'habitude bascule. C'est la
  // règle la plus utile du livre pour un élève, donc elle passe avant les
  // erreurs et avant la série.
  if (j === 2) {
    return parler({
      situation: 'reprise',
      messageAr: 'فُتت يومًا واحدًا. لا تُفَوّت يومين.',
      actionAr: ACTION_UNE_SEULE_QUESTION_AR,
      // Loi 4 : on nomme la récompense immédiate (rien de différé).
      // Et si un cumul existe, on dit ce qui est DÉJÀ acquis : c'est le moment
      // où l'élève en a le plus besoin (l'effet cumulé — rien n'est perdu).
      gainImmediatAr:
        cumul > 0
          ? `${cumul} ${cumul > 1 ? 'أيام' : 'يوم'} في رصيدك. لم يضِع منها شيء.`
          : 'لا تُكسر السلسلة، وتبقى في المسار.',
      cible: 'reviser',
      loi: 4,
    });
  }

  // ── §5.B, phase 5 — LE SPRINT. La date du BAC change la proposition. ────
  //
  // Placée ICI, et pas plus haut, parce que l'ordre du §5.C est absolu : on
  // s'arrête au premier niveau qui s'applique. Un jour manqué (niveau 3) garde la
  // priorité — un élève qui vient de rater une journée a besoin de la plus PETITE
  // action, pas d'une épreuve chronométrée. L'épreuve en cours et la nuit sont
  // déjà sorties plus haut.
  //
  // CE QUI CHANGE, EXACTEMENT :
  //   · ce n'est plus un exercice de deux minutes mais une production chronométrée ;
  //   · la destination devient `examens` — la seule cible du type qui n'était
  //     utilisée par AUCUNE branche, alors que la rubrique existe depuis toujours ;
  //   · la fenêtre horaire s'élargit : la protection de série n'a de sens qu'en
  //     soirée (≥ 17 h), mais une simulation se commence dans la journée. À trois
  //     semaines du BAC, se taire toute la matinée serait un mauvais service.
  //
  // LES TEXTES SONT CEUX DU DÉPÔT, pas des phrases inventées : le conseil et le
  // geste de la rubrique « examens » sont livrés depuis le 14/10 et repris
  // VERBATIM. Seul le gain immédiat est composé ici (loi 4) : aucun texte livré ne
  // joue ce rôle, et le composer ailleurs l'aurait rendu introuvable.
  if (j === 1 && ctx.sprint === true) {
    const conseilExamens = conseilDeRubrique('examens');
    if (conseilExamens) {
      const jours =
        typeof ctx.joursAvantBac === 'number' && Number.isFinite(ctx.joursAvantBac)
          ? ctx.joursAvantBac
          : null;
      return parler({
        situation: 'reprise',
        messageAr: conseilExamens.conseils[0].conseilAr,
        actionAr: conseilExamens.conseils[0].gesteAr,
        gainImmediatAr:
          jours !== null
            ? `بقي ${jours} يومًا. محاكاة واحدة تكشف ثغرتك قبل يوم البكالوريا.`
            : 'محاكاة واحدة تكشف ثغرتك قبل يوم البكالوريا.',
        cible: 'examens',
        loi: 4,
      });
    }
  }

  // ── Loi 2 : la série est ENCORE VIVANTE → protéger ce qui est construit. ──
  // `j === 1` : l'élève a travaillé hier, la journée d'aujourd'hui est encore
  // ouverte. On ne dit donc PAS qu'il a manqué un jour (ce serait faux avant
  // minuit) — on parle de ce qu'il a déjà gagné.
  if (j === 1 && ctx.serie > 0 && ctx.heure >= HEURE_PROTECTION_SERIE) {
    return parler({
      situation: 'reprise',
      messageAr: `سلسلتك: ${ctx.serie} ${ctx.serie > 1 ? 'أيام' : 'يوم'}. لا تكسرها اليوم.`,
      actionAr: `تمرين قصير${jour}، دقيقتان.`,
      gainImmediatAr: `تصل سلسلتك إلى ${ctx.serie + 1}.`,
      cible: 'training',
      loi: 2,
    });
  }

  // ── Loi 3 : erreurs en mémoire → une seule, tout de suite. ───────────────
  // S'applique quand la série est morte (≥ 3 jours) : reprendre la série n'a plus
  // de sens, mais ce que l'élève ne sait pas est toujours vrai.
  if (j !== null && j >= 3 && ctx.erreursAReprendre >= 2) {
    return parler({
      situation: 'erreur',
      messageAr: 'نعرف بالضبط أين تتعثّر. لنبدأ من هناك.',
      actionAr: 'راجع خطأً واحدًا من دفترك.',
      gainImmediatAr:
        cumul > 0
          ? `خطأ واحد يخرج من دفترك اليوم — و${cumul} ${cumul > 1 ? 'أيام' : 'يوم'} محفوظة لك.`
          : 'خطأ واحد يخرج من دفترك اليوم.',
      cible: 'methodology',
      loi: 3,
    });
  }

  // ── H5(a) (audit coach 18/10/2026) : série morte SANS erreurs enregistrées. ──
  // Constat mesuré : un élève absent ≥ 3 jours avec 0 erreur en mémoire ne
  // recevait AUCUNE parole — le capitaine n'avait que le motif « erreurs »,
  // et un QCM réussi laissait l'absence sans réponse. Une absence réelle
  // mérite une reprise réelle : on repart de DERNIÈRE unité touchée (fait),
  // par la plus petite action (loi 3), jamais d'une obligation générale.
  if (j !== null && j >= 3 && ctx.erreursAReprendre < 2) {
    return parler({
      situation: 'reprise',
      messageAr: ctx.derniereUnite
        ? `توقّفت عند «${ctx.derniereUnite}». العودة تبدأ بخطوة واحدة.`
        : 'العودة تبدأ بخطوة واحدة، لا بالمنهج كله.',
      actionAr: ctx.derniereUnite
        ? `اقرأ فقرة واحدة من «${ctx.derniereUnite}»، ثم تفتح تمرينًا.`
        : ACTION_UNE_QUESTION_AR,
      gainImmediatAr:
        cumul > 0
          ? `${cumul} ${cumul > 1 ? 'أيام' : 'يوم'} في رصيدك — اليوم يُضيف واحدًا.`
          : 'يوم اليوم يُضاف إلى رصيدك.',
      cible: ctx.derniereUnite ? 'reviser' : 'training',
      loi: 3,
    });
  }

  // ── Loi 3 : jamais rien fait → la règle des 2 minutes, littéralement. ────
  if (j === null && ctx.serie === 0) {
    return parler({
      situation: 'accueil',
      messageAr: 'لا نبدأ بالمنهج كله. نبدأ بدقيقتين.',
      actionAr: ACTION_UNE_QUESTION_AR,
      gainImmediatAr: 'يومك الأول في السلسلة.',
      cible: 'training',
      loi: 3,
    });
  }

  // ── Tout va bien, ou rien d'utile à dire : le capitaine se tait. ─────────
  // Le silence est un choix, pas un oubli. Une erreur unique ne déclenche rien
  // (une fois, c'est le hasard) ; un élève revenu il y a une heure n'est pas
  // relancé.
  return null;
}

/** Texte de la bulle quand elle n'a rien à dire : une porte, pas un slogan. */
export const LIBELLE_BULLE_SILENCIEUX_AR = 'اسأل القبطان';

// ─────────────────────────────────────────────────────────────────────────────
// LA CONSIGNE D'ENTRÉE DE « التمارين والتدريب » — C'EST LE CAPITAINE QUI DÉCIDE.
//
// Arbitrage propriétaire du 2026-11-04 : « un helper pur, c'est le Capitaine
// Kunz El Ouloum, c'est lui qui guide l'élève, c'est le coach ». La règle vit
// donc ICI, dans le module du coach, à côté de `invitationDuMoment` : ce n'est
// PAS un guide autonome, c'est le CALCUL du guide. Le hub ne décide de rien, il
// projette ce que le Capitaine a tranché. Aucune troisième voix.
//
// POURQUOI UNE FONCTION PURE : mêmes portes de silence que la bulle, aucune
// lecture DOM, aucune écriture de stockage, aucun état caché. La consigne est
// une PROJECTION DÉRIVÉE de l'état unique (`etatEleveRuntime`), jamais stockée —
// exactement le verrou « couleur/état = projection, pas stockage ».
//
// CE QU'ELLE NE FAIT PAS : elle n'ajoute aucune porte (les 7 cartes restent 7),
// ne crée aucune valeur de `CibleInvitation` (la bulle garde `cible:'training'`
// et `App.tsx:1429` reste inchangé), ne touche pas `App.tsx`, et ne désigne
// JAMAIS un module cadenassé : seuls `situations`, `workshop` et `examens` sont
// éligibles, tous libres dès le premier jour.
//
// LE SILENCE EST UNE DÉCISION : état absent, compétence non chargée ou épreuve
// en cours ⇒ `null`. On ne fabrique pas une recommandation avec des données
// qu'on n'a pas.
//
// ET LA 1ʳᵉ VISITE ? Le bandeau d'accueil (`BandeauConseilRubrique`) donne le
// PRINCIPE (« un exercice complet vaut mieux que trois incomplets »). Il ne
// nomme aucun module — c'est précisément le défaut signalé. La prescription
// d'état PRIME donc : elle nomme le point de départ dès la première ouverture.
// Ce ne sont pas deux guides : un seul décideur (`consigneEntreeTraining`), un
// seul personnage EN GRAND (le bandeau, qui garde son visage), et le bloc du
// hub n'affiche NI visage NI image — le guide y SIGNE son nom, sans se
// redessiner une deuxième fois.
// ─────────────────────────────────────────────────────────────────────────────

/** Onglets du hub que le Capitaine peut désigner — jamais un module verrouillé. */
export type GesteEntreeTab = 'situations' | 'workshop' | 'examens';

export interface ConsigneEntreeTraining {
  /** L'UNIQUE carte mise en avant. */
  tab: GesteEntreeTab;
  /** Ce que dit le Capitaine : UN geste, court, en arabe. */
  gesteAr: string;
  /** « لماذا » : une seule ligne, dérivée de l'état, jamais inventée. */
  pourquoiAr: string;
  /** Durée annoncée pour UN exercice, auto-correction comprise. */
  dureeMin: number;
}

/** Un exercice complet, correction incluse — pas une séance, pas un QCM-porte. */
export const DUREE_GESTE_ENTREE_MIN = 10;

/**
 * LE CAPITAINE CHOISIT LE PREMIER GESTE BAC.
 *
 * Ordre enseignant (arbitrage 2026-11-04) : `Rappel → UN geste BAC →
 * auto-correction → SRS à la maison`. Le QCM/flashcard reste un ÉCHAUFFEMENT
 * diagnostique, jamais une porte obligatoire ni une destination : cette
 * consigne désigne donc toujours un geste de production ou d'analyse de sند.
 *
 * Table de décision, toutes dérivées de l'état déjà assemblé une fois :
 *   1. date du BAC officielle, ≤ 30 jours, ≥ 2 unités → `examens` (الورقة والساعة) ;
 *   2. zéro unité complète                          → `workshop` (جواب مُوجَّه) ;
 *   3. unité faible ou ≥ 2 erreurs au دفتر          → `situations` (سند ciblé) ;
 *   4. sinon                                        → `situations` (cœur du BAC).
 *
 * `unitesCompletes` vient de la progression RÉELLE du parcours, pas d'une
 * estimation. `null` en retour = silence honnête, pas un module par défaut.
 */
export function consigneEntreeTraining(
  etat: EtatEleve | null,
  unitesCompletes: number,
): ConsigneEntreeTraining | null {
  // ── Les portes du silence, partagées avec la bulle. ────────────────────────
  if (!etat) return null; // état pas encore déposé : rien à recommander
  if (etat.contexte.epreuveEnCours) return null; // épreuve : silence absolu
  if (!etat.competence.chargee) return null; // verdicts absents ⇒ pas d'invention
  // PAS de porte sur `conseilRubriqueAPrendre` : le bandeau de 1ʳᵉ visite dit le
  // principe sans nommer de module. Le mute ici aurait laissé le défaut entier
  // au moment où l'élève en a le plus besoin. La prescription d'état prime.

  const unites = Number.isInteger(unitesCompletes) && unitesCompletes > 0 ? unitesCompletes : 0;
  const faible = etat.competence.unitePrioritaire ?? etat.competence.faibles[0] ?? null;
  // Une date provisoire ne produit AUCUN décompte : on n'annonce pas un chiffre
  // qu'on n'a pas mesuré (même honnêteté que `cumul` dans `invitationDuMoment`).
  const jours = etat.horizon.dateProvisoire ? null : etat.horizon.joursAvantBac;
  const dureeMin = DUREE_GESTE_ENTREE_MIN;

  if (jours !== null && Number.isFinite(jours) && jours > 0 && jours <= 30 && unites >= 2) {
    return {
      tab: 'examens',
      gesteAr: 'اكتب محاكاة واحدة بورقة وقلم، ثم صحّحها.',
      pourquoiAr: jours === 1
        ? 'بقي يوم واحد: الورقة والساعة تكشفان الثغرة قبل البكالوريا.'
        : `بقي ${jours} يومًا: الورقة والساعة تكشفان الثغرة قبل البكالوريا.`,
      dureeMin,
    };
  }

  if (unites === 0) {
    return {
      tab: 'workshop',
      gesteAr: 'أنتج جوابًا واحدًا خطوة بخطوة، ثم صحّحه.',
      pourquoiAr: 'لم تُكمل وحدة بعد: الجواب المُوجَّه يبني الحركة الأولى قبل سند الامتحان.',
      dureeMin,
    };
  }

  if (faible !== null || etat.erreurs.total >= 2) {
    return {
      tab: 'situations',
      gesteAr: faible !== null
        ? `حلّل سندًا واحدًا من «${faible}»، ثم صحّح جوابك.`
        : 'حلّل سندًا واحدًا من دفتر أخطائك، ثم صحّح جوابك.',
      pourquoiAr: faible !== null
        ? `الوحدة «${faible}» ما زالت ضعيفة: نبدأ منها، لا من المنهج كله.`
        : 'خطآن في الدفتر يكفيان لاختيار السند الذي نبدأ به.',
      dureeMin,
    };
  }

  return {
    tab: 'situations',
    gesteAr: 'حلّل سندًا واحدًا، ثم صحّح جوابك.',
    pourquoiAr: 'تحليل السند هو قلب امتحان البكالوريا: تمرين واحد كامل أنفع من ثلاثة ناقصة.',
    dureeMin,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LE RAPPEL DE 3 MINUTES — LE CAPITAINE CHOISIT AUSSI LES 3 QUESTIONS.
//
// Lot 2 du 2026-11-04, ENCHAÎNÉ sur `consigneEntreeTraining` (lot 1). Même
// règle : la décision pédagogique vit ICI, dans le module du coach. Le panneau
// `RappelTroisQuestions` ne décide de rien, ne parle pas, n'a ni nom ni visage
// — il AFFICHE les 3 questions que le Capitaine a tirées.
//
// POURQUOI LE TIRAGE EST PUR ET « SANS DONNÉES » : ce module est importé
// STATIQUEMENT par le hook du Capitaine, donc par le bundle d'entrée. Lui faire
// importer les 531 QCM (`src/data/index.ts`, ~600 Ko de source) rejouerait très
// exactement le défaut du sprint 31 (« tout élève télécharge 549 questions
// avant de voir son tableau de bord »). Le catalogue est donc REÇU en entrée,
// depuis `peekCorpus()`/`loadCorpus()` — déjà chargés par App.tsx:431/608.
// Mesuré au build : +0 Ko de CORPUS, +0 requête, +0 clé de stockage. Le lot
// lui-même coûte ~1 Ko d'entrée et ~5 Ko au chunk du hub — jamais les 531 QCM.
//
// ORDRE DE PRIORITÉ (diagnostique, pas une évaluation) :
//   1. les QCM dont la carte dérivée est DUE (SM-2, `sortByDue` en lecture
//      seule) ; 2. l'unité faible désignée par le coach ; 3. une rotation
//      STABLE sur la journée pour compléter — jamais de hasard à chaque rendu,
//      jamais de question inventée, jamais de doublon.
//
// Ce rappel n'est NI une porte obligatoire NI une destination : l'élève peut
// l'ignorer, la consigne d'entrée et les 7 cartes restent visibles. Le SRS,
// lui, reste « à la maison » (`RevisionView`) : ici AUCUNE note, AUCUNE
// écriture, AUCUN `rateCard`. Séquence : Rappel → UN geste BAC → auto-correction.
// ─────────────────────────────────────────────────────────────────────────────

/** Une question servie par le rappel — forme structurelle, aucun import de data. */
export interface QuestionRappel {
  id: number;
  uniteId: number;
  questionAr: string;
  optionsAr: readonly string[];
  correctIndex: number;
  explicationAr: string;
  /** Titre FACTUEL de l'unité (lot 3) — thème transmis au دفتر si l'élève
   *  déclare une cause. Absent ⇒ `themeUniteAr(uniteId)`, jamais deviné. */
  themeAr?: string;
}

export interface SignalRappel {
  /** ids des QCM dont la carte `fc_q_<id>` est due, DANS l'ordre SRS. */
  idsDues: readonly number[];
  /** Titre de l'unité prioritaire du coach (ex. « 1. تركيب البروتين »). */
  unitePrioritaire: string | null;
  /** Clé de jour locale `AAAA-MM-JJ` : rotation stable, pas de hasard. */
  jour: string;
}

/** Trois questions, pas quatre : l'échauffement doit tenir en trois minutes. */
export const NOMBRE_QUESTIONS_RAPPEL = 3;

/**
 * L'unité prioritaire est un TITRE, pas un identifiant (`useInvitationCapitaine`
 * pose `ordre[0].titre`). Lire son préfixe numérique est un « best effort » :
 * si le titre n'en porte pas, on renvoie `null` et le tirage se passe de filtre
 * — on ne devine JAMAIS une unité.
 */
export function uniteIdDepuisTitre(titre: string | null): number | null {
  if (typeof titre !== 'string') return null;
  const m = /^\s*(\d{1,2})(?:\s*[.)\-:]|\s)/.exec(titre);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** Décalage déterministe d'une clé de jour — même tirage toute la journée. */
function decalageDuJour(jour: string, taille: number): number {
  if (taille <= 0) return 0;
  let h = 0;
  for (let i = 0; i < jour.length; i++) h = (h * 31 + jour.charCodeAt(i)) % 1000003;
  return h % taille;
}

/**
 * LE CAPITAINE TIRE LES 3 QUESTIONS DE RAPPEL.
 *
 * Renvoie **au plus** `NOMBRE_QUESTIONS_RAPPEL` questions, toutes issues du
 * catalogue réel, sans doublon. Un catalogue vide (corpus hors ligne) donne
 * `[]` : le panneau le dit honnêtement au lieu de fabriquer une question.
 */
export function tirageRappelTrois(
  catalogue: readonly QuestionRappel[],
  signal: SignalRappel,
): QuestionRappel[] {
  const valides = catalogue.filter(
    (q) =>
      Number.isFinite(q.id) &&
      q.optionsAr.length >= 2 &&
      Number.isInteger(q.correctIndex) &&
      q.correctIndex >= 0 &&
      q.correctIndex < q.optionsAr.length &&
      q.questionAr.trim().length > 0,
  );
  if (valides.length === 0) return [];
  if (valides.length <= NOMBRE_QUESTIONS_RAPPEL) return valides.slice();

  const parId = new Map(valides.map((q) => [q.id, q]));
  const pris = new Set<number>();
  const tirees: QuestionRappel[] = [];
  const ajouter = (q: QuestionRappel | undefined): void => {
    if (!q || tirees.length >= NOMBRE_QUESTIONS_RAPPEL || pris.has(q.id)) return;
    pris.add(q.id);
    tirees.push(q);
  };

  // 1. D'abord ce que la mémoire réclame : les cartes DUES (SM-2, lecture seule).
  for (const id of signal.idsDues) {
    if (tirees.length >= NOMBRE_QUESTIONS_RAPPEL) break;
    ajouter(parId.get(id));
  }

  // 2. Puis l'unité que le coach a désignée comme faible.
  const uniteFaible = uniteIdDepuisTitre(signal.unitePrioritaire);
  if (uniteFaible !== null) {
    for (const q of valides) {
      if (tirees.length >= NOMBRE_QUESTIONS_RAPPEL) break;
      if (q.uniteId === uniteFaible) ajouter(q);
    }
  }

  // 3. Compléter par une rotation stable du jour — jamais de `Math.random()`
  //    (sinon les 3 questions changeraient à chaque rendu React).
  const depart = decalageDuJour(signal.jour, valides.length);
  for (let k = 0; k < valides.length && tirees.length < NOMBRE_QUESTIONS_RAPPEL; k++) {
    ajouter(valides[(depart + k) % valides.length]);
  }

  return tirees;
}

// ─────────────────────────────────────────────────────────────────────────────
// LOT 3 — LE RAPPEL NOURRIT LE دفتر الأخطاء (LE CAPITAINE DÉCIDE TOUJOURS).
//
// Changement de contrat, assumé et demandé : les lots 1-2 n'écrivaient RIEN.
// Le lot 3 écrit, mais UNE SEULE fois et SEULEMENT quand l'élève a déclaré
// lui-même la cause de son erreur. Aucune déduction : `diagnosticQuiz.ts` le
// dit déjà — « aucune question du corpus ne porte d'étiquette de notion…
// toute déduction serait une invention ». Le Capitaine ne devine donc pas un
// code d'erreur ; il décide QUAND demander, et l'élève dit LEQUEL.
//
// CE QUE LE CAPITAINE DÉCIDE ICI (pur, aucune donnée, aucun stockage) :
//   · combien de questions ont été RATÉES (une réponse absente n'est PAS une
//     erreur inventée) ;
//   · les THÈMES factuels de ces erreurs (titre d'unité du parcours, sinon
//     « الوحدة N ») ;
//   · s'il faut demander une déclaration (≥ 1 erreur, une fois par session).
//
// Le pont d'écriture (`lib/pontRappelErreurs.ts`) n'est PAS un guide : il
// exécute l'appel canonique `enregistrerErreurs` avec le code déclaré. Le
// panneau ne fait que poser la question du produit (`CAUSES_QCM`).
//
// EFFET MESURÉ SUR LA PAROLE DU CAPITAINE : `contexteCapitaine()` transmet
// `erreursAReprendre = etat.erreurs.total`, et `invitationDuMoment` ne parle
// sur le motif « erreur » qu'à `j >= 3 && total >= 2`. UNE déclaration = UNE
// occurrence ⇒ `resumeProfilAr()` reste `null` : un échauffement isolé ne fait
// PAS croire à un profil. Deux sessions sur la même cause, elles, comptent —
// c'est voulu.
//
// NON INCLUS, MESURÉ : `planifierRappelsPourErreurs()` ne trouve AUCUNE
// micro-reprise pour les trois codes déclarables (`notion_confusion`,
// `unsupported_claim`, `missing_reference`) et renvoie `[]`. L'appeler ici
// chargerait 164 Ko de chunk pour un no-op. Le pont reste là où il est
// (`QuizView`, atelier) — cf. `cablageBoucleCoach.test.ts`. Aucun `rateCard`,
// aucun SRS, aucun `signalTravail` : « Déclic → Focus → Révision, une fois/jour »
// n'est pas touché.
// ─────────────────────────────────────────────────────────────────────────────

/** Une erreur suffit à demander la cause — mais une seule fois par session. */
export const ERREURS_MIN_POUR_DECLARER = 1;

export interface BilanRappel {
  /** Nombre de questions réellement ratées. */
  erreurs: number;
  /** Thèmes des questions ratées, sans doublon, dans l'ordre du tirage. */
  themes: readonly string[];
  /** Faut-il poser la question de déclaration ? */
  aDeclarer: boolean;
}

/** Repli factuel quand le parcours ne fournit pas de titre d'unité. */
export function themeUniteAr(uniteId: number): string {
  return Number.isInteger(uniteId) && uniteId > 0 ? `الوحدة ${uniteId}` : '';
}

/**
 * LE BILAN DU RAPPEL — pure, déterministe, sans lecture de stockage.
 *
 * `reponses[i]` est l'index choisi pour `questions[i]`, ou `null`/absent si
 * l'élève n'a pas répondu. Une absence N'EST PAS une erreur : on ne compte que
 * ce qui a été réellement répondu à côté. Les questions surnuméraires (le
 * tableau de réponses est plus long que le tirage) sont ignorées.
 */
export function bilanDuRappel(
  questions: readonly QuestionRappel[],
  reponses: readonly (number | null | undefined)[],
): BilanRappel {
  const themes: string[] = [];
  let erreurs = 0;
  questions.forEach((q, i) => {
    const r = reponses[i];
    if (typeof r !== 'number' || !Number.isInteger(r)) return;
    if (r === q.correctIndex) return;
    erreurs += 1;
    const theme = (q.themeAr ?? '').trim() || themeUniteAr(q.uniteId);
    if (theme && !themes.includes(theme)) themes.push(theme);
  });
  return {
    erreurs,
    themes,
    aDeclarer: erreurs >= ERREURS_MIN_POUR_DECLARER,
  };
}
