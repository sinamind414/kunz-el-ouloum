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

/** Où mène l'invitation — une destination, en un clic. */
/**
 * Destination de l'action : ce sont des IDENTIFIANTS D'ONGLET RÉELS d'App.tsx,
 * pas des noms de rubriques. Un nom « propre » qui ne correspond à aucun onglet
 * transforme le bouton en impasse — l'élève clique et rien ne se passe. Le test
 * `cablageCapitaine.test.ts` vérifie cette correspondance en lisant App.tsx.
 *   - `methodology` : « مفتاح » — c'est là que vit le دفتر الأخطاء (les erreurs)
 *   - `training`    : التمارين والتدريب — l'exercice de deux minutes
 *   - `reviser`     : المراجعة — reprendre un contenu déjà vu
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
 * L'invitation du moment, ou `null`.
 *
 * `null` est une RÉPONSE, pas un échec : c'est le silence du capitaine. Il est
 * rendu dans cinq cas — épreuve en cours, heure nocturne, message récemment
 * ignoré, travail déjà fait aujourd'hui, et « tout va bien ».
 */
export function invitationDuMoment(ctx: ContexteCapitaine): Invitation | null {
  // ── L'épreuve prime sur tout : aucune parole, y compris ici. ──────────────
  if (ctx.epreuveEnCours) return null;

  // ── Loi 1 (version inverse) : un message ignoré disparaît vraiment. ───────
  const ignoreDepuisMs =
    ctx.derniereInvitationIgnoreeMs === null || ctx.derniereInvitationIgnoreeMs === undefined
      ? null
      : ctx.maintenantMs - ctx.derniereInvitationIgnoreeMs;
  if (ignoreDepuisMs !== null && Number.isFinite(ignoreDepuisMs) && ignoreDepuisMs < SILENCE_APRES_IGNORANCE_MS) {
    return null;
  }

  // ── Loi 1 : le bon MOMENT. La nuit, on ne relance pas. ───────────────────
  if (ctx.heure >= HEURE_SILENCE_NOCTURNE || ctx.heure < HEURE_DEBUT) return null;

  const j = ctx.joursSansTravail;
  const jour = ctx.derniereUnite ? ` (${ctx.derniereUnite})` : '';
  // Cumul honnête : une valeur inexploitable vaut 0 (on n'annonce jamais un
  // chiffre qu'on n'a pas mesuré).
  const cumul =
    typeof ctx.joursAccumules === 'number' && Number.isInteger(ctx.joursAccumules) && ctx.joursAccumules > 0
      ? ctx.joursAccumules
      : 0;

  // ── Un compteur de jours inexploitable : on se tait. ─────────────────────
  // `null` veut dire « jamais rien produit » — c'est un fait, et le capitaine
  // peut en parler. Toute AUTRE valeur non entière veut dire « on ne sait pas » :
  // affirmer quoi que ce soit sur l'élève serait un mensonge. Entre un message
  // faux et le silence, on choisit le silence.
  if (j !== null && (!Number.isInteger(j) || j < 0)) return null;

  // ── Travail déjà fait aujourd'hui : rien à dire. ─────────────────────────
  if (j === 0) return null;

  // ── « NE JAMAIS RATER DEUX FOIS » — priorité absolue. ────────────────────
  // Hier a été manqué. Si aujourd'hui l'est aussi, l'habitude bascule. C'est la
  // règle la plus utile du livre pour un élève, donc elle passe avant les
  // erreurs et avant la série.
  if (j === 2) {
    return {
      situation: 'reprise',
      messageAr: 'فُتت يومًا واحدًا. لا تُفَوّت يومين.',
      actionAr: 'سؤال واحد فقط، الآن.',
      // Loi 4 : on nomme la récompense immédiate (rien de différé).
      // Et si un cumul existe, on dit ce qui est DÉJÀ acquis : c'est le moment
      // où l'élève en a le plus besoin (l'effet cumulé — rien n'est perdu).
      gainImmediatAr:
        cumul > 0
          ? `${cumul} ${cumul > 1 ? 'أيام' : 'يوم'} في رصيدك. لم يضِع منها شيء.`
          : 'لا تُكسر السلسلة، وتبقى في المسار.',
      cible: 'reviser',
      loi: 4,
    };
  }

  // ── Loi 2 : la série est ENCORE VIVANTE → protéger ce qui est construit. ──
  // `j === 1` : l'élève a travaillé hier, la journée d'aujourd'hui est encore
  // ouverte. On ne dit donc PAS qu'il a manqué un jour (ce serait faux avant
  // minuit) — on parle de ce qu'il a déjà gagné.
  if (j === 1 && ctx.serie > 0 && ctx.heure >= HEURE_PROTECTION_SERIE) {
    return {
      situation: 'reprise',
      messageAr: `سلسلتك: ${ctx.serie} ${ctx.serie > 1 ? 'أيام' : 'يوم'}. لا تكسرها اليوم.`,
      actionAr: `تمرين قصير${jour}، دقيقتان.`,
      gainImmediatAr: `تصل سلسلتك إلى ${ctx.serie + 1}.`,
      cible: 'training',
      loi: 2,
    };
  }

  // ── Loi 3 : erreurs en mémoire → une seule, tout de suite. ───────────────
  // S'applique quand la série est morte (≥ 3 jours) : reprendre la série n'a plus
  // de sens, mais ce que l'élève ne sait pas est toujours vrai.
  if (j !== null && j >= 3 && ctx.erreursAReprendre >= 2) {
    return {
      situation: 'erreur',
      messageAr: 'نعرف بالضبط أين تتعثّر. لنبدأ من هناك.',
      actionAr: 'راجع خطأً واحدًا من دفترك.',
      gainImmediatAr:
        cumul > 0
          ? `خطأ واحد يخرج من دفترك اليوم — و${cumul} ${cumul > 1 ? 'أيام' : 'يوم'} محفوظة لك.`
          : 'خطأ واحد يخرج من دفترك اليوم.',
      cible: 'methodology',
      loi: 3,
    };
  }

  // ── Loi 3 : jamais rien fait → la règle des 2 minutes, littéralement. ────
  if (j === null && ctx.serie === 0) {
    return {
      situation: 'accueil',
      messageAr: 'لا نبدأ بالمنهج كله. نبدأ بدقيقتين.',
      actionAr: 'اختبار قصير: سؤال واحد.',
      gainImmediatAr: 'يومك الأول في السلسلة.',
      cible: 'training',
      loi: 3,
    };
  }

  // ── Tout va bien, ou rien d'utile à dire : le capitaine se tait. ─────────
  // Le silence est un choix, pas un oubli. Une erreur unique ne déclenche rien
  // (une fois, c'est le hasard) ; un élève revenu il y a une heure n'est pas
  // relancé.
  return null;
}

/** Texte de la bulle quand elle n'a rien à dire : une porte, pas un slogan. */
export const LIBELLE_BULLE_SILENCIEUX_AR = 'اسأل القبطان';
