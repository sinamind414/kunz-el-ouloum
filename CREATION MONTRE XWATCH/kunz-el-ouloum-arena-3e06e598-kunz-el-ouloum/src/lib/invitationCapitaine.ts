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
        messageAr: conseilExamens.conseilAr,
        actionAr: conseilExamens.gesteAr,
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
