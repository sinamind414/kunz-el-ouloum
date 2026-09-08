// calibration.ts — Phase 4 (docs/AUDIT_APPROCHE_APP.md §3.4, ordre §6 ligne 6)
//
// La métrique REINE de la Phase 4 : l'écart auto-évaluation / note réelle.
// L'élève prédit sa note /20 avant d'être noté (stage 4) ; la note réelle rentre
// par la file de correction (l'enseignant du produit) ; l'écart intèrie le regard
// du correcteur. XP/ICM restent une couche d'engagement SOUS la calibration —
// la calibration est la seule métrique de « savoir se noter ».
//
// Fonctions pures + testables ; la persistance vit dans correctionQueue.

import { CorrectionItem } from './correctionQueue';

/** Écart (auto-évaluation − note réelle) — positif = surestimation. null si une note manque. */
export function gapOf(item: Pick<CorrectionItem, 'selfScore' | 'realScore'>): number | null {
  if (item.selfScore == null || item.realScore == null) return null;
  return item.selfScore - item.realScore;
}

export interface CalibrationStats {
  /** Productions notées des deux côtés. */
  n: number;
  /** Moyenne signée de (auto − réel) — > 0 = l'élève se note trop bien. */
  meanGap: number | null;
  /** Moyenne de |écart| — la métrique d'interiorisation. */
  meanAbsGap: number | null;
  overconfident: number;   // écart > 0
  underconfident: number;  // écart < 0
  calibrated: number;      // |écart| ≤ 1/20
  /** Derniers 5 |écart| (chronologique) — sparkline. */
  spark: number[];
}

export function calibrationStats(items: CorrectionItem[]): CalibrationStats {
  const gaps = items.map(gapOf).filter((g): g is number => g !== null);
  if (gaps.length === 0) {
    return { n: 0, meanGap: null, meanAbsGap: null, overconfident: 0, underconfident: 0, calibrated: 0, spark: [] };
  }
  const meanGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const meanAbsGap = gaps.reduce((a, b) => a + Math.abs(b), 0) / gaps.length;
  return {
    n: gaps.length,
    meanGap,
    meanAbsGap,
    overconfident: gaps.filter(g => g > 0).length,
    underconfident: gaps.filter(g => g < 0).length,
    calibrated: gaps.filter(g => Math.abs(g) <= 1).length,
    spark: gaps.slice(-5).map(Math.abs),
  };
}

/** Nudge pédagogique — seulement quand l'échantillon permet de conclure (n ≥ 3). */
export function calibrationMessageAr(stats: CalibrationStats): string | null {
  if (stats.n < 3 || stats.meanGap === null) return null;
  if (stats.meanGap > 2) {
    return 'مرآتك أرحم من المصحح: توقعاتك تتجاوز نقاطك الفعلية بمتوسط +2. راجع معايير المصحح (النقاط المفقودة في الملف) قبل كل إنتاج.';
  }
  if (stats.meanGap < -2) {
    return 'مرآتك أقسى من المصحح: توقعاتك أدنى من نقاطك الفعلية. تثبّت من معياريّتك — أنت أقرب إلى النقطة مما تظن.';
  }
  if ((stats.meanAbsGap ?? 0) <= 1) {
    return 'المرآة مضبوطة: الفارق بين توقعك ونقطتك الفعلية ≤ 1 في المتوسط — هذا هو نظر المصحح داخلك.';
  }
  return 'المرآة قيد الضبط: اتجاهك محايد لكن الدقة ليست هناك بعد — واصل الإنتاج والتصحيح حتى يستقر متوسط |العبر| تحت 1.';
}
