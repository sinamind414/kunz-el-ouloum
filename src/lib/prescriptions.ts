// src/lib/prescriptions.ts — LA BOUCLE DU COACH : ce qui a été prescrit, et ce qui en est advenu.
//
// ══════════════════════════════════════════════════════════════════════════
// POURQUOI CE MODULE EXISTE (mesuré le 15/10/2026)
// ══════════════════════════════════════════════════════════════════════════
// Morchid savait QUOI dire (`nbaEngine`), OÙ en est l'élève (`coach/diagnostic`)
// et QUAND parler (`invitationCapitaine`). Il ne savait pas si ce qu'il avait dit
// avait servi.
//
// La preuve, en une ligne de code : la SEULE trace de réaction de l'élève était
// `derniereInvitationIgnoreeMs`, écrite quand il ferme la bulle — et utilisée
// uniquement pour se taire six heures (`SILENCE_APRES_IGNORANCE_MS`).
// Un seul bit de retour, servant à se taire. C'est un émetteur, pas un coach.
//
// Ce module ajoute la mémoire manquante. Chaque parole du coach devient une
// PRESCRIPTION TRACABLE, avec une identité stable (le MOTIF), et une issue :
//
//   en_attente ──► suivie     (l'élève a produit du travail mesuré)
//              ──► ignoree    (il a fermé la bulle sans agir)
//              ──► expiree    (48 h sans rien — le silence a été plus long que
//                             la demande)
//
// DEUX CONSÉQUENCES RÉELLES, et pas seulement un journal :
//
//   1. LE RETRAIT DU MOTIF APRÈS TROIS ÉCHECS. Un conseil répété qui n'a pas
//      marché n'est plus un conseil, c'est du bruit — et c'est ainsi qu'un tuteur
//      perd son autorité. Après trois échecs, `motifRetire()` le dit, et
//      `invitationDuMoment` se tait sur ce motif au lieu de le répéter une
//      quatrième fois.
//
//   2. LA CRÉDITATION HONNÊTE. Quand une erreur prescrite disparaît réellement
//      des productions de l'élève, on peut le lui DIRE — mais seulement parce
//      que c'est mesuré (voir `cloreErreursAbsentes` dans profilErreurs.ts).
//      C'est la seule félicitation qui vaut quelque chose.
//
// POURQUOI LE MOTIF EST UNE CLÉ STABLE ET PAS LE TEXTE DU MESSAGE. Le message
// varie (« سلسلتك: 5 أيام », « سلسلتك: 6 أيام ») alors que la prescription, elle,
// est la même. Compter par texte ne compterait jamais trois fois la même phrase.
// Le motif est donc `situation:cible` — stable, court, testable.
//
// MODULE LOCAL uniquement : localStorage, aucune requête, aucun identifiant.
// Cohérent avec la promesse publiée (politique §3-§4) et avec profilErreurs.ts.

import { motifDeInvitation, type EchecsMotif, type Invitation } from './invitationCapitaine';

const CLE = 'boussole_prescriptions_v1';

/**
 * Délai au-delà duquel une prescription non honorée est tenue pour expirée.
 * 48 h : une journée entière laisse le temps d'agir ; deux jours sans rien
 * signifient que la demande, telle qu'elle était formulée, n'a pas été reçue.
 */
export const EXPIRATION_MS = 48 * 60 * 60 * 1000;

/**
 * Nombre d'échecs (ignorée OU expirée) après lequel un motif est retiré.
 * Trois : au-delà, répéter la même chose n'est plus du coaching.
 */
export const ECHECS_AVANT_RETRAIT = 3;

/** Borne du journal — un téléphone d'entrée de gamme, pas un entrepôt. */
export const MAX_PRESCRIPTIONS = 60;

export type IssuePrescription = 'en_attente' | 'suivie' | 'ignoree' | 'expiree';

export interface Prescription {
  /** Identité STABLE de la prescription (`situation:cible`) — jamais le texte. */
  motif: string;
  /** Destination proposée (onglet réel d'App.tsx). */
  cible: string;
  /** Code d'erreur visé, quand la prescription portait sur une erreur précise. */
  erreurCode?: string;
  /** Thème du travail visé, quand il est connu. */
  theme?: string;
  /** Horodatage d'émission. */
  emisMs: number;
  /** Horodatage du clic sur « agir » — trace d'intention, pas de travail. */
  accepteMs?: number;
  issue: IssuePrescription;
  /** Horodatage de la résolution (suivie / ignorée / expirée). */
  resoluMs?: number;
}

export interface CompteurMotif {
  /** Nombre de fois où ce motif a été proposé. */
  dits: number;
  suivis: number;
  ignores: number;
  expires: number;
}

export interface Registre {
  prescriptions: Prescription[];
  motifs: Record<string, CompteurMotif>;
}

export function registreVide(): Registre {
  return { prescriptions: [], motifs: {} };
}

// ══════════════════════════════════════════════════════════════════════════
// Identité du motif
// ══════════════════════════════════════════════════════════════════════════
// `motifDeInvitation` est DÉFINI dans `invitationCapitaine.ts`, à côté du type
// qu'il empreinte, et IMPORTÉ ici. Recopier la fonction créerait exactement le
// défaut que ce dépôt a payé cinq fois : la même logique en plusieurs copies qui
// divergent en silence.

export { motifDeInvitation };

// ══════════════════════════════════════════════════════════════════════════
// Persistance
// ══════════════════════════════════════════════════════════════════════════

function stockage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

function lireBrut(): Registre {
  const s = stockage();
  if (!s) return registreVide();
  try {
    const brut = s.getItem(CLE);
    if (!brut) return registreVide();
    const j = JSON.parse(brut) as unknown;
    if (!j || typeof j !== 'object') return registreVide();
    const o = j as { prescriptions?: unknown; motifs?: unknown };

    const prescriptions: Prescription[] = Array.isArray(o.prescriptions)
      ? o.prescriptions
          .filter((p): p is Prescription => {
            const x = p as Partial<Prescription> | null;
            return Boolean(
              x &&
                typeof x.motif === 'string' &&
                x.motif.length > 0 &&
                typeof x.emisMs === 'number' &&
                Number.isFinite(x.emisMs) &&
                typeof x.issue === 'string',
            );
          })
          .slice(0, MAX_PRESCRIPTIONS)
      : [];

    const motifs: Record<string, CompteurMotif> = {};
    if (o.motifs && typeof o.motifs === 'object') {
      for (const [motif, v] of Object.entries(o.motifs as Record<string, Partial<CompteurMotif>>)) {
        if (!motif || motif.length > 80) continue;
        const n = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) && x >= 0 ? Math.floor(x) : 0);
        motifs[motif] = {
          dits: n(v?.dits),
          suivis: n(v?.suivis),
          ignores: n(v?.ignores),
          expires: n(v?.expires),
        };
      }
    }
    return { prescriptions, motifs };
  } catch {
    return registreVide();
  }
}

function ecrire(registre: Registre): void {
  const s = stockage();
  if (!s) return;
  try {
    s.setItem(
      CLE,
      JSON.stringify({
        prescriptions: registre.prescriptions.slice(0, MAX_PRESCRIPTIONS),
        motifs: registre.motifs,
      }),
    );
  } catch {
    /* stockage plein : on perd l'historique de la boucle, jamais le travail de l'élève */
  }
}

// ══════════════════════════════════════════════════════════════════════════
// Expiration paresseuse
// ══════════════════════════════════════════════════════════════════════════

/**
 * Toute prescription `en_attente` plus vieille que 48 h devient `expiree`.
 *
 * APPLIQUÉE À LA LECTURE, et non par un minuteur : l'application vise des
 * téléphones d'entrée de gamme, et un `setInterval` qui tourne en fond pour
 * marquer un état qu'on ne lit que sur action serait du gaspillage pur. L'effet
 * est identique puisque personne ne lit le registre en dehors de ces fonctions.
 *
 * Une prescription ACCEPTÉE (clic) n'est pas mieux traitée qu'une autre : le clic
 * n'est pas du travail. Il est mémorisé (`accepteMs`) parce qu'il distingue « il
 * n'a pas vu » de « il a vu et n'a pas pu », ce qui n'est pas la même leçon.
 */
export function expirerParesseux(registre: Registre, maintenantMs: number): Registre {
  const motifs = { ...registre.motifs };
  let change = false;
  const prescriptions = registre.prescriptions.map((p) => {
    // Le compteur n'est incrémenté QUE sur la transition : une prescription déjà
    // expirée n'est pas recomptée à la relecture (sinon trois lectures vaudraient
    // trois échecs, et le motif serait retiré au bout d'une seule relance).
    if (p.issue !== 'en_attente' || maintenantMs - p.emisMs < EXPIRATION_MS) return p;
    change = true;
    const c = motifs[p.motif] ?? { dits: 0, suivis: 0, ignores: 0, expires: 0 };
    motifs[p.motif] = { ...c, expires: c.expires + 1 };
    return { ...p, issue: 'expiree' as const, resoluMs: p.emisMs + EXPIRATION_MS };
  });
  return change ? { prescriptions, motifs } : registre;
}

/** Registre courant, expiration appliquée. */
export function lireRegistre(maintenantMs: number = Date.now()): Registre {
  const brut = lireBrut();
  const expire = expirerParesseux(brut, maintenantMs);
  if (expire !== brut) ecrire(expire);
  return expire;
}

// ══════════════════════════════════════════════════════════════════════════
// Émission et issues
// ══════════════════════════════════════════════════════════════════════════

export interface ContextePrescription {
  erreurCode?: string;
  theme?: string;
}

/**
 * Émet une prescription. Renvoie `false` si le motif a déjà été RETIRÉ : le coach
 * ne redit pas une phrase qui a échoué trois fois.
 *
 * Une seule prescription `en_attente` à la fois pour un même motif : réafficher
 * la bulle ne doit pas gonfler le journal de la même demande.
 */
export function emettrePrescription(
  // `motif` est inclus : une invitation ESCALADÉE (§5.D) porte l'identité de sa
  // forme d'origine, sans quoi chaque changement de forme créerait un nouveau
  // motif et l'escalade ne progresserait jamais.
  invitation: Pick<Invitation, 'situation' | 'cible' | 'motif'>,
  contexte: ContextePrescription = {},
  maintenantMs: number = Date.now(),
): boolean {
  const motif = motifDeInvitation(invitation);
  const registre = lireRegistre(maintenantMs);
  if (motifRetire(motif, registre)) return false;

  if (registre.prescriptions.some((p) => p.motif === motif && p.issue === 'en_attente')) {
    return true; // déjà en attente : rien à ajouter
  }

  const c = registre.motifs[motif] ?? { dits: 0, suivis: 0, ignores: 0, expires: 0 };
  const prescription: Prescription = {
    motif,
    cible: invitation.cible,
    erreurCode: contexte.erreurCode,
    theme: contexte.theme,
    emisMs: maintenantMs,
    issue: 'en_attente',
  };
  ecrire({
    prescriptions: [prescription, ...registre.prescriptions].slice(0, MAX_PRESCRIPTIONS),
    motifs: { ...registre.motifs, [motif]: { ...c, dits: c.dits + 1 } },
  });
  return true;
}

/** Le clic sur « agir » : une INTENTION, pas du travail. Mémorisé comme tel. */
export function marquerAcceptee(maintenantMs: number = Date.now()): boolean {
  const registre = lireRegistre(maintenantMs);
  const index = registre.prescriptions.findIndex((p) => p.issue === 'en_attente');
  if (index < 0) return false;
  const prescriptions = [...registre.prescriptions];
  prescriptions[index] = { ...prescriptions[index]!, accepteMs: maintenantMs };
  ecrire({ ...registre, prescriptions });
  return true;
}

/**
 * Le travail a été MESURÉ : la prescription en attente est honorée.
 *
 * Appelée par `appliquerActiviteQuotidienne`, c'est-à-dire au seul endroit qui
 * atteste qu'un travail réel a eu lieu (le compteur de minutes/questions monte).
 * Pas un clic, pas un changement d'onglet : du travail.
 */
export function marquerSuivie(maintenantMs: number = Date.now()): Prescription | null {
  const registre = lireRegistre(maintenantMs);
  const index = registre.prescriptions.findIndex((p) => p.issue === 'en_attente');
  if (index < 0) return null;
  const honoree: Prescription = { ...registre.prescriptions[index]!, issue: 'suivie', resoluMs: maintenantMs };
  const prescriptions = [...registre.prescriptions];
  prescriptions[index] = honoree;
  const c = registre.motifs[honoree.motif] ?? { dits: 0, suivis: 0, ignores: 0, expires: 0 };
  ecrire({
    prescriptions,
    motifs: { ...registre.motifs, [honoree.motif]: { ...c, suivis: c.suivis + 1 } },
  });
  return honoree;
}

/** L'élève a fermé la bulle sans agir. C'est un échec de la demande, pas de l'élève. */
export function marquerIgnoree(maintenantMs: number = Date.now()): boolean {
  const registre = lireRegistre(maintenantMs);
  const index = registre.prescriptions.findIndex((p) => p.issue === 'en_attente');
  if (index < 0) return false;
  const ignoree: Prescription = { ...registre.prescriptions[index]!, issue: 'ignoree', resoluMs: maintenantMs };
  const prescriptions = [...registre.prescriptions];
  prescriptions[index] = ignoree;
  const c = registre.motifs[ignoree.motif] ?? { dits: 0, suivis: 0, ignores: 0, expires: 0 };
  ecrire({
    prescriptions,
    motifs: { ...registre.motifs, [ignoree.motif]: { ...c, ignores: c.ignores + 1 } },
  });
  return true;
}

// ══════════════════════════════════════════════════════════════════════════
// Ce que la boucle apprend
// ══════════════════════════════════════════════════════════════════════════

/**
 * Nombre d'échecs d'un motif, et s'il doit être retiré.
 *
 * Une prescription SUIVIE n'est pas un échec : un motif qui marche reste
 * disponible indéfiniment. Seuls `ignoree` et `expiree` comptent, et ils
 * comptent ENSEMBLE : fermer la bulle ou la laisser expirer, du point de vue de
 * la demande, c'est la même chose — elle n'a pas passé.
 */
export function echecsDuMotif(motif: string, registre?: Registre): number {
  const r = registre ?? lireRegistre();
  const c = r.motifs[motif];
  if (!c) return 0;
  return c.ignores + c.expires;
}

/** Le motif a-t-il échoué assez de fois pour qu'on cesse de le répéter ? */
export function motifRetire(motif: string, registre?: Registre): boolean {
  return echecsDuMotif(motif, registre) >= ECHECS_AVANT_RETRAIT;
}

/**
 * Les motifs retirés — ce que le coach ne redira plus.
 *
 * Exposé pour que la suite (l'escalade, puis le relais vers un humain) puisse
 * agir sur ces cas au lieu de les subir : un motif retiré est un signal, pas un
 * oubli.
 */
export function motifsRetires(registre?: Registre): string[] {
  const r = registre ?? lireRegistre();
  return Object.keys(r.motifs).filter((m) => motifRetire(m, r));
}

export interface BilanBoucle {
  emises: number;
  suivies: number;
  ignorees: number;
  expirees: number;
  enAttente: number;
  /** suivies / (suivies + ignorées + expirées) — null tant qu'aucune issue. */
  tauxSuivi: number | null;
  /** Prescriptions émises mais jamais résolues, motif le plus en échec en tête. */
  motifsEchoues: string[];
}

/**
 * Les échecs par motif, prêts pour l'escalade (§5.D).
 *
 * Un échec = une invitation IGNORÉE ou EXPIRÉE. `suivie` n'est pas un échec, et
 * `acceptée` encore moins : une intention non tenue n'est pas un refus, et la
 * traiter comme tel punirait l'élève d'avoir essayé.
 *
 * Registre injectable, comme ses voisines : l'état de l'élève s'assemble en un
 * seul passage, sans relire le stockage.
 */
export function echecsParMotif(
  registre: Registre = lireRegistre(),
): Record<string, EchecsMotif> {
  const out: Record<string, EchecsMotif> = {};
  for (const [motif, c] of Object.entries(registre.motifs)) {
    out[motif] = { ignores: c.ignores, expires: c.expires };
  }
  return out;
}

/**
 * Bilan de la boucle.
 *
 * Le registre peut être FOURNI (`r`), comme pour `echecsDuMotif` et
 * `motifRetire` : c'est ce qui permet à `lib/etatEleve.ts` d'assembler l'état de
 * l'élève sans relire le stockage une seconde fois — et sans que l'assembleur
 * cesse d'être une fonction pure. Omis, il est lu (comportement historique).
 */
export function bilanBoucle(maintenantMs: number = Date.now(), r: Registre = lireRegistre(maintenantMs)): BilanBoucle {
  const par = (issue: IssuePrescription) => r.prescriptions.filter((p) => p.issue === issue).length;
  const suivies = par('suivie');
  const ignorees = par('ignoree');
  const expirees = par('expiree');
  const resolues = suivies + ignorees + expirees;
  return {
    emises: r.prescriptions.length,
    suivies,
    ignorees,
    expirees,
    enAttente: par('en_attente'),
    tauxSuivi: resolues > 0 ? suivies / resolues : null,
    motifsEchoues: Object.entries(r.motifs)
      .filter(([m]) => motifRetire(m, r))
      .map(([m]) => m),
  };
}

/** Remise à zéro (bouton « repartir de zéro », et tests). */
export function effacerRegistre(): void {
  const s = stockage();
  if (!s) return;
  try {
    s.removeItem(CLE);
  } catch {
    /* ignore */
  }
}

// ══════════════════════════════════════════════════════════════════════════
// Le pont vers les erreurs — ce que le coach a prescrit et qui n'est pas résolu
// ══════════════════════════════════════════════════════════════════════════

/**
 * Fenêtre pendant laquelle on relie encore une disparition d'erreur à une
 * prescription. Au-delà, le lien de causalité est trop faible pour être affirmé :
 * fermer une erreur trois semaines après avoir été relancé sur elle serait une
 * coïncidence présentée comme un résultat.
 */
export const FENETRE_FERMETURE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Les erreurs PRESCRITES qu'on peut encore FERMER : code + thème + date d'émission.
 *
 * DEUX FILTRES, et il faut expliquer le second parce qu'il n'est pas évident :
 *
 *   · `ignoree` est EXCLUE. L'élève a explicitement déclaré ne pas vouloir
 *     travailler cette erreur ; si elle disparaît quand même d'une production
 *     ultérieure, on ne s'en attribue pas le mérite et on ne le félicite pas
 *     pour un travail qu'il a refusé de faire.
 *
 *   · `suivie` est INCLUSE — et c'est le cas NORMAL. « Suivie » veut dire
 *     qu'un travail a eu lieu, pas que l'erreur a été réglée : la fermeture,
 *     elle, dépend de ce que contient la production. Les exclure rendrait la
 *     fermeture quasi impossible, puisque travailler est précisément ce qu'on
 *     avait demandé. (Défaut trouvé par un test, pas à la relecture.)
 *
 *   · `en_attente` et `expiree` sont incluses : un travail peut venir après
 *     coup, et une erreur qui disparaît reste une erreur qui a disparu.
 *
 * Volontairement défini ici SANS importer `profilErreurs` (qui traîne la
 * taxonomie complète, ~7 % du bundle d'entrée mesuré le 14/10). Ce module est lu
 * par le hook de la bulle, donc par le bundle d'entrée : il ne doit rien peser.
 * La fermeture elle-même est faite par l'appelant, dans l'écran de correction,
 * qui importe déjà `profilErreurs`.
 */
export function erreursPrescritesEnAttente(
  maintenantMs: number = Date.now(),
): Array<{ code: string; theme?: string; emisMs: number }> {
  const r = lireRegistre(maintenantMs);
  const vues = new Set<string>();
  const out: Array<{ code: string; theme?: string; emisMs: number }> = [];
  for (const p of r.prescriptions) {
    if (!p.erreurCode) continue;
    if (p.issue === 'ignoree') continue;
    if (maintenantMs - p.emisMs > FENETRE_FERMETURE_MS) continue;
    if (vues.has(p.erreurCode)) continue;
    vues.add(p.erreurCode);
    out.push({ code: p.erreurCode, theme: p.theme, emisMs: p.emisMs });
  }
  return out;
}
