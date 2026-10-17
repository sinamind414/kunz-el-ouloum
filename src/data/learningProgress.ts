// learningProgress.ts — répondre honnêtement à « est-ce que je progresse ? »
// (sprint 62).
//
// Trois niveaux de preuve, et il faut les distinguer sous peine de mentir à
// l'élève :
//
//   1. ACTIVITÉ — du temps passé, des tâches cochées. Ne prouve rien.
//   2. COUVERTURE — les unités et les consignes touchées, pondérées par leur
//      poids réel à l'examen. Prouve que le travail porte au bon endroit.
//   3. PROGRESSION — la même famille de consigne, rédigée plus tard, est-elle
//      mieux structurée ? C'est la seule dérivée qui distingue l'apprentissage
//      de l'occupation.
//
// Ce module calcule les niveaux 2 et 3 à partir du journal de rédaction, et
// refuse de conclure quand les données sont trop maigres — un verdict rendu
// sur deux réponses serait pire que pas de verdict.

import { readLearningLog, type LearningEntry } from './learningLog';
import { VERB_FAMILY_BY_ID } from './verbDemands';
import { IDEA_BY_ID, observedUnitSharePercent } from './bacSessionIndex';
import { INITIAL_UNITS } from '../unitCatalog';

/** Nombre de rédactions en dessous duquel on ne conclut pas. */
export const SEUIL_VERDICT = 6;
/** Rédactions minimales dans une famille pour comparer début et fin. */
export const SEUIL_FAMILLE = 4;

export interface ProgressionFamille {
  familyId: string;
  titreAr: string;
  redactions: number;
  /** Taux de forme de la première moitié (0-1). */
  tauxDebut: number;
  /** Taux de forme de la seconde moitié (0-1). */
  tauxFin: number;
  /** Différence en points de pourcentage, arrondie. */
  deltaPourcent: number;
  /** Tendance lisible. */
  tendance: 'progres' | 'stable' | 'recul' | 'insuffisant';
}

function taux(entrees: LearningEntry[]): number {
  const total = entrees.reduce((s, e) => s + e.total, 0);
  if (total === 0) return 0;
  return entrees.reduce((s, e) => s + e.satisfaits, 0) / total;
}

/**
 * Progression par famille de consigne : on coupe les rédactions en deux
 * moitiés chronologiques et on compare. Pas de régression linéaire — avec
 * cinq points, une droite donnerait une fausse impression de rigueur.
 */
export function progressionParFamille(
  journal: LearningEntry[] = readLearningLog(),
): ProgressionFamille[] {
  const parFamille = new Map<string, LearningEntry[]>();
  for (const e of journal) {
    (parFamille.get(e.familyId) ?? parFamille.set(e.familyId, []).get(e.familyId)!).push(e);
  }

  const out: ProgressionFamille[] = [];
  for (const [familyId, entrees] of parFamille) {
    const triees = [...entrees].sort((a, b) => a.date.localeCompare(b.date));
    const titreAr = VERB_FAMILY_BY_ID[familyId]?.titleAr ?? familyId;

    if (triees.length < SEUIL_FAMILLE) {
      out.push({
        familyId,
        titreAr,
        redactions: triees.length,
        tauxDebut: taux(triees),
        tauxFin: taux(triees),
        deltaPourcent: 0,
        tendance: 'insuffisant',
      });
      continue;
    }

    const milieu = Math.floor(triees.length / 2);
    const debut = taux(triees.slice(0, milieu));
    const fin = taux(triees.slice(milieu));
    const delta = Math.round((fin - debut) * 100);
    out.push({
      familyId,
      titreAr,
      redactions: triees.length,
      tauxDebut: debut,
      tauxFin: fin,
      deltaPourcent: delta,
      // ±5 points : en deçà, c'est du bruit, pas une tendance.
      tendance: delta >= 5 ? 'progres' : delta <= -5 ? 'recul' : 'stable',
    });
  }

  return out.sort(
    (a, b) => b.redactions - a.redactions || a.familyId.localeCompare(b.familyId),
  );
}

export interface CouvertureUnite {
  unitId: number;
  titre: string;
  /** Part des points de l'examen (mesurée sur le corpus). */
  partExamen: number;
  redactions: number;
}

/**
 * Couverture : où le travail écrit a réellement porté, confronté au poids de
 * chaque unité à l'examen. C'est ce qui révèle un travail intense mais mal
 * placé.
 */
export function couvertureParUnite(
  journal: LearningEntry[] = readLearningLog(),
): CouvertureUnite[] {
  const parts = observedUnitSharePercent();
  const compte = new Map<number, number>();
  for (const e of journal) {
    const unitId = IDEA_BY_ID[e.ideaId]?.unitIds[0];
    if (unitId != null) compte.set(unitId, (compte.get(unitId) ?? 0) + 1);
  }
  return INITIAL_UNITS.map((u) => ({
    unitId: u.id,
    titre: u.title,
    partExamen: parts[u.id] ?? 0,
    redactions: compte.get(u.id) ?? 0,
  })).sort((a, b) => b.partExamen - a.partExamen || a.unitId - b.unitId);
}

export interface Verdict {
  /** Assez de matière pour conclure ? */
  concluant: boolean;
  redactions: number;
  joursActifs: number;
  /** Taux de forme global sur les rédactions récentes (0-1). */
  tauxRecent: number;
  /** Variation globale en points de pourcentage. */
  deltaGlobal: number;
  /** Phrase destinée à l'élève, en arabe. */
  messageAr: string;
  /** Unité lourde la plus délaissée, le cas échéant. */
  angleMort: CouvertureUnite | null;
}

/**
 * Verdict global. Trois refus explicites plutôt qu'un chiffre creux :
 *   · moins de 6 rédactions ⇒ on ne conclut pas ;
 *   · une variation sous 5 points ⇒ « stable », pas « progrès » ;
 *   · un travail bien orienté mais sans amélioration de forme est dit tel quel.
 */
export function verdictProgression(journal: LearningEntry[] = readLearningLog()): Verdict {
  const triees = [...journal].sort((a, b) => a.date.localeCompare(b.date));
  const joursActifs = new Set(triees.map((e) => e.date)).size;

  const couverture = couvertureParUnite(triees);
  const angleMort =
    couverture.find((c) => c.partExamen >= 10 && c.redactions === 0) ?? null;

  if (triees.length < SEUIL_VERDICT) {
    return {
      concluant: false,
      redactions: triees.length,
      joursActifs,
      tauxRecent: taux(triees),
      deltaGlobal: 0,
      messageAr: `اكتب ${SEUIL_VERDICT - triees.length} أجوبة أخرى حتى نتمكّن من قياس تقدّمك بصدق. ما دون ذلك، أي حكم يكون تخميناً.`,
      angleMort,
    };
  }

  const milieu = Math.floor(triees.length / 2);
  const debut = taux(triees.slice(0, milieu));
  const fin = taux(triees.slice(milieu));
  const delta = Math.round((fin - debut) * 100);
  const pourcentRecent = Math.round(fin * 100);

  let messageAr: string;
  if (delta >= 5) {
    messageAr = `تقدّم واضح: بنية أجوبتك تحسّنت بـ ${delta} نقطة مئوية (${pourcentRecent}٪ في أجوبتك الأخيرة).`;
  } else if (delta <= -5) {
    messageAr = `تراجع بـ ${Math.abs(delta)} نقطة مئوية. غالباً لأنك انتقلت إلى تعليمات أصعب — راجع « ما تنساه غالباً » قبل أن تواصل.`;
  } else {
    messageAr = `مستواك مستقرّ عند ${pourcentRecent}٪ من متطلبات الشكل. الاستقرار ليس تقدّماً: اختر تعليمة واحدة تنقصك و اشتغل عليها وحدها.`;
  }

  return {
    concluant: true,
    redactions: triees.length,
    joursActifs,
    tauxRecent: fin,
    deltaGlobal: delta,
    messageAr,
    angleMort,
  };
}
