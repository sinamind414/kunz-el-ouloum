// V3 — Source de vérité : séquence officielle des leçons par unité.
// Déplacée depuis LessonsView afin que le Focus Engine puisse téléporter
// l'élève directement dans la bonne leçon (« أكمل من حيث توقفت ») sans
// importer le composant LessonsView (chargé paresseusement).
//
// B5 (2026-10-17) : le littéral OFFICIAL_PROGRAM_SEQUENCE est déplacé dans
// ./programSequence (module-feuille, aucun import) pour casser le cycle
// lessonData → unitLessonSequences → lessonData — lessonData en a besoin
// pour corriger les 5 unitId de LESSON_LIBRARY. Re-export à l'identique :
// l'API pour tous les consommateurs est inchangée.

import { LESSON_LIBRARY } from '../lessonData';

import { OFFICIAL_PROGRAM_SEQUENCE } from './programSequence';

export { OFFICIAL_PROGRAM_SEQUENCE };

/** Clé d'un fichier HTML de phase contenant exactement 2 leçons. */
const TWO_CHAPTER_KEY_RE = /^phase\d+_chapitres_\d+_\d+$/;

/**
 * Développe les clés de phase en leurs 2 leçons : chaque fichier
 * `phaseN_chapitres_X_Y.html` porte deux leçons isolées à l'affichage
 * (clé de base = 1re leçon, clé `_2` = 2e leçon).
 * Si la 2e moitié est explicitement affectée à une AUTRE unité
 * (fichier à cheval U1/U2, U2/U3, D1/D2...), on ne la duplique pas ici.
 */
function withSplitChapters(keys: string[], unitId?: number): string[] {
  const allExplicit = new Set<string>(Object.values(OFFICIAL_PROGRAM_SEQUENCE).flat());
  const ownerOf = new Map<string, number>();
  for (const [uidStr, list] of Object.entries(OFFICIAL_PROGRAM_SEQUENCE)) {
    for (const k of list as string[]) {
      if (!ownerOf.has(k)) ownerOf.set(k, Number(uidStr));
    }
  }
  const out: string[] = [];
  for (const key of keys) {
    if (!out.includes(key)) out.push(key);
    if (TWO_CHAPTER_KEY_RE.test(key)) {
      const splitKey = `${key}_2`;
      if (out.includes(splitKey)) continue;
      // Clé `_2` déjà placée explicitement plus loin dans cette unité : ne pas
      // l'insérer ici (sinon l'ordre TDM serait forcé immédiatement après la base).
      if (keys.includes(splitKey)) continue;
      const owner = ownerOf.get(splitKey);
      // Ajout auto sauf si la 2e moitié vit explicitement dans une autre unité
      if (owner !== undefined && unitId !== undefined && owner !== unitId) continue;
      if (!allExplicit.has(splitKey) || owner === unitId) {
        if (!out.includes(splitKey)) out.push(splitKey);
      } else if (!owner) {
        if (!out.includes(splitKey)) out.push(splitKey);
      }
    }
  }
  return out;
}

/** Retourne la séquence des leçons d'une unité (séquence officielle, sinon leçons du catalogue). */
export function getUnitLessonSequence(unitId: number): string[] {
  const official = OFFICIAL_PROGRAM_SEQUENCE[unitId];
  const base =
    official && official.length > 0
      ? official
      : LESSON_LIBRARY.filter((lesson) => lesson.unitId === unitId).map((lesson) => lesson.key);
  return withSplitChapters(base, unitId);
}

/** Première leçon d'une unité (cible par défaut du Focus Engine pour la découverte). */
export function getFirstLessonId(unitId: number): string | undefined {
  return getUnitLessonSequence(unitId)[0];
}
