// ============================================================
// marque.ts — MARQUAGE DU CONTENU QUI SORT DE L'APPLICATION (A3, 14/10/2026).
//
// PROBLÈME. Un élève exporte sa fiche de résultats en PNG, sa copie imprimée en
// PDF, ou le sujet d'examen en papier. Ces documents circulent par WhatsApp et
// finissent en circulation générale. Aujourd'hui, un document qui fuit est
// ANONYME : rien ne dit d'où il vient, donc rien ne dissuade et rien ne permet
// de remonter à la source.
//
// RÉPONSE. Une marque courte, déterministe et NON identifiante apposée dans le
// document : elle ne porte ni nom, ni e-mail, ni code de connexion — un
// document qui fuit ne doit jamais livrer un identifiant utilisable. Le
// professeur, lui, retrouve la correspondance marque → élève dans son export
// CSV (colonne `marque`).
//
// LIMITES, DITES FRANCHEMENT (ne pas se raconter d'histoires) :
//   · un marqueur se SUPPRIME : une capture d'écran recadrée l'élimine. Il
//     dissuade le partage paresseux, il n'arrête pas un élève déterminé ;
//   · le mode INVITÉ reste intraceable, par construction : sans compte, il n'y a
//     aucune identité à marquer. C'est la contrepartie assumée de la promesse
//     « rien ne quitte ton téléphone » ;
//   · la marque est calculable par n'importe qui connaissant l'identifiant de
//     l'élève. Elle sert à ATTRIBUER un document, pas à prouver une identité.
//
// Ce module est PUR : aucun accès à `localStorage`, aucun DOM. Il peut donc
// être importé par le serveur (colonne CSV) sans traîner du code navigateur.
// ============================================================

import { IDENTITE_INVITE } from './activityLog';

/** Préfixe des marques : reconnaissable, et impossible à confondre avec un code. */
export const PREFIXE_MARQUE = 'KZ';

/**
 * Sel de la marque. Il n'est PAS un secret (le code est livré au navigateur) :
 * il sert seulement à ce que la marque ne soit pas l'identifiant lui-même, ni un
 * identifiant d'une autre application. Un « secret » ici serait un mensonge —
 * il est visible dans le paquet livré.
 */
const SEL = 'kunz-el-ouloum/traçabilité/2026';

/**
 * Identités qui NE SONT PAS un élève identifié : le mode invité, et le cas
 * « compte sans studentId » (jeton d'enseignant). Aucune ne reçoit de marque
 * nominative — un document d'invité est intraceable, et on l'écrit.
 */
export function estTraceable(identite: string | null | undefined): boolean {
  if (!identite) return false;
  if (identite === IDENTITE_INVITE) return false;
  if (identite === 'compte') return false;
  return true;
}

/** FNV-1a 32 bits → 8 caractères hexadécimaux. */
function hache(texte: string): number {
  let h = 2166136261;
  for (let i = 0; i < texte.length; i += 1) {
    h ^= texte.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Marque d'une identité d'élève : `KZ-` + 6 caractères. **Déterministe** — le
 * même élève obtient la même marque sur son téléphone et dans l'export du
 * professeur, sinon la correspondance serait impossible.
 */
export function marqueDepuisIdentite(identite: string): string | null {
  if (!estTraceable(identite)) return null;
  const n = hache(`${SEL}|${identite}`);
  // 6 caractères = 16 777 216 combinaisons : assez pour distinguer une classe,
  // assez court pour être lu au téléphone ou écrit à la main.
  return `${PREFIXE_MARQUE}-${n.toString(16).toUpperCase().padStart(8, '0').slice(0, 6)}`;
}

/**
 * Ligne apposée sur un document. Deux textes : traçable, ou invité — dans ce
 * dernier cas on ne ment pas en laissant croire à un marquage qui n'existe pas.
 */
export function ligneMarque(identite: string | null | undefined): string {
  const marque = identite ? marqueDepuisIdentite(identite) : null;
  if (!marque) {
    return 'نسخة للزائر — غير قابلة للتتبع · copie invité, non traçable · كنز العلوم';
  }
  return `رمز التتبع: ${marque} · marque de traçabilité : ${marque} · كنز العلوم — نسخة شخصية`;
}

/** Version courte, pour les pieds de page imprimés et les bandeaux étroits. */
export function ligneMarqueCourte(identite: string | null | undefined): string {
  const marque = identite ? marqueDepuisIdentite(identite) : null;
  // Invité : la ligne DIT qu'il n'y a pas de traçabilité. Afficher seulement
  // « زائر » laisserait croire que la copie a été marquée — un lecteur qui
  // chercherait une origine ne la trouverait pas, et chercherait ailleurs.
  return marque ? `${marque} · كنز العلوم` : 'زائر · غير قابلة للتتبع · كنز العلوم';
}

// ─────────────────────────────────────────────────────────────────────────────
// Apposition dans une image (carte de résultats, bilan hebdomadaire partagé).
//
// Interface STRUCTURELLE minimale : le module ne dépend pas du type CanvasRenderingContext2D,
// donc il est testable sans DOM, et n'oblige pas le serveur à connaître le canvas.
// ─────────────────────────────────────────────────────────────────────────────

export interface ContexteDessin {
  /**
   * Typé large VOLONTAIREMENT : `CanvasRenderingContext2D.fillStyle` accepte
   * aussi un dégradé ou un motif, donc un type `string` strict refuserait le
   * vrai contexte du navigateur. On n'écrit jamais que des chaînes ici.
   */
  fillStyle: unknown;
  font: string;
  textAlign: string;
  textBaseline?: string;
  fillText: (texte: string, x: number, y: number) => void;
  save?: () => void;
  restore?: () => void;
}

export interface OptionsMarqueCanvas {
  /** Largeur du canvas, en pixels. */
  largeur: number;
  /** Hauteur du canvas, en pixels. */
  hauteur: number;
  /** Taille de police de base (le marqueur est plus petit). */
  taillePolice?: number;
  /** Couleur du texte de marque. */
  couleur?: string;
}

/**
 * Appose la marque en bas à droite d'un canvas déjà dessiné.
 *
 * Le marqueur est volontairement DISCRET (petit, coin inférieur) : il doit être
 * présent sans abîmer le document que l'élève veut partager. Un marqueur
 * envahissant pousserait l'élève à recadrer la capture — donc à l'effacer.
 *
 * Rend `true` si une marque a été apposée, `false` sinon (invité).
 */
export function apposerMarqueCanvas(
  ctx: ContexteDessin,
  identite: string | null | undefined,
  options: OptionsMarqueCanvas,
): boolean {
  const texte = ligneMarqueCourte(identite);
  const taille = Math.max(9, Math.round((options.taillePolice ?? 16) * 0.62));
  ctx.save?.();
  ctx.font = `600 ${taille}px system-ui, sans-serif`;
  ctx.fillStyle = options.couleur ?? 'rgba(0,0,0,0.45)';
  ctx.textAlign = 'right';
  if ('textBaseline' in ctx) ctx.textBaseline = 'alphabetic';
  // 10 px de marge : la marque ne touche pas le bord, donc une capture brute la
  // conserve entière.
  ctx.fillText(texte, options.largeur - 10, options.hauteur - 8);
  ctx.restore?.();
  return marqueDepuisIdentite(identite ?? '') !== null;
}
