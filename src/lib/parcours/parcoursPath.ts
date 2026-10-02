// src/lib/parcours/parcoursPath.ts
// CHEMIN D'APPRENTISSAGE LINEAIRE (PATH) — portage de la couche "rituel" OPUS 5.5.
//
// Source unique : OFFICIAL_PROGRAM_SEQUENCE (séquence officielle du programme
// national, cf. src/data/unitLessonSequences.ts). AUCUN contenu n'est inventé
// ici : chaque item du chemin est soit une leçon existante (HTML officielle ou
// leçon active TS), soit le جسر de l'unité (son QCM du livre officiel).
//
// Le chemin est DÉRIVÉ à l'import, jamais écrit à la main : toute mise à jour
// de la séquence officielle ou du catalogue des unités se répercute
// automatiquement, et le verrou curriculumIntegrity.test.ts couvre l'arbre.

import { getUnitLessonSequence } from '../../data/unitLessonSequences';
import {
  getActiveLessonTitle,
  getPassiveLessonTitle,
  getUnitTitle,
  hasHtmlFile,
  PASSIVE_DOMAINS,
} from '../../data/lessonModes';

export type ParcoursItemKind = 'lesson' | 'jalon';
export type LessonKind = 'html' | 'active';

export interface ParcoursItem {
  /** Identifiant stable : `parcours:u{unitId}:l{index}` ou `parcours:u{unitId}:jalon`. */
  id: string;
  unitId: number;
  kind: ParcoursItemKind;
  /** Leçons uniquement : clé de leçon comprise par LessonsView. */
  lessonKey?: string;
  lessonKind?: LessonKind;
  title: string;
}

export interface ParcoursUnitGroup {
  unitId: number;
  title: string;
  domainId: number;
  items: ParcoursItem[];
}

export interface ParcoursDomainGroup {
  domainId: number;
  title: string;
  units: ParcoursUnitGroup[];
}

/** Titre du جسر (pont de fin d'unité) — label de navigation, pas du contenu. */
export function jalonTitle(unitId: number): string {
  return `جسر الوحدة ${unitId}`;
}

function buildParcours(): ParcoursDomainGroup[] {
  return PASSIVE_DOMAINS.map((domain) => ({
    domainId: domain.id,
    title: domain.titleAr,
    units: domain.unitIds.map((unitId) => {
      const lessonKeys = getUnitLessonSequence(unitId);
      const items: ParcoursItem[] = lessonKeys.map((key, index) => {
        const lessonKind: LessonKind = hasHtmlFile(key) ? 'html' : 'active';
        const title =
          lessonKind === 'html'
            ? getPassiveLessonTitle(key, unitId)
            : getActiveLessonTitle(key);
        return {
          id: `parcours:u${unitId}:l${index}`,
          unitId,
          kind: 'lesson' as const,
          lessonKey: key,
          lessonKind,
          title,
        };
      });
      items.push({
        id: `parcours:u${unitId}:jalon`,
        unitId,
        kind: 'jalon' as const,
        title: jalonTitle(unitId),
      });
      return {
        unitId,
        title: getUnitTitle(unitId),
        domainId: domain.id,
        items,
      };
    }),
  }));
}

/** Le chemin complet, groupé par domaine (1→5, 6→8, 9→11). */
export const PARCOURS_DOMAINS: ParcoursDomainGroup[] = buildParcours();

/** Le chemin à plat, dans l'ordre linéaire strict. */
export const PARCOURS_FLAT: ParcoursItem[] = PARCOURS_DOMAINS.flatMap((d) =>
  d.units.flatMap((u) => u.items),
);

export const PARCOURS_TOTAL: number = PARCOURS_FLAT.length;

export function parcoursItemById(id: string): ParcoursItem | undefined {
  return PARCOURS_FLAT.find((i) => i.id === id);
}

export function parcoursItemIndex(id: string): number {
  return PARCOURS_FLAT.findIndex((i) => i.id === id);
}

export function parcoursUnitOf(itemId: string): ParcoursUnitGroup | undefined {
  for (const domain of PARCOURS_DOMAINS) {
    const unit = domain.units.find((u) => u.items.some((i) => i.id === itemId));
    if (unit) return unit;
  }
  return undefined;
}

/** Nombre d'items terminés / total sur un sous-ensemble du chemin. */
export function compteurItems(unit: ParcoursUnitGroup): { lessons: number; total: number } {
  const lessons = unit.items.filter((i) => i.kind === 'lesson').length;
  return { lessons, total: unit.items.length };
}
