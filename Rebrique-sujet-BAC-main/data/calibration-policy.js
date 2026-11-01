/* Release gates for exposing numeric heuristic scores in the student UI.
   These are internal safety thresholds, not official BAC tolerances. */

export const REQUIRED_CALIBRATION_CATEGORIES = Object.freeze([
  "strong",
  "weak",
  "scientifically-wrong",
  "off-topic"
]);

export const CALIBRATION_THRESHOLDS = Object.freeze({
  minimumCopiesPerPole: 15,
  maximumNormalizedMeanAbsoluteError: 0.15,
  maximumAbsoluteNormalizedBias: 0.05,
  maximumFalsePositiveRate: 0.1,
  maximumFalseNegativeRate: 0.1,
  maximumNormalizedInterRaterDifference: 0.15
});

const finiteAtMost = (value, maximum) => Number.isFinite(value) && value <= maximum;

/**
 * Decide whether numeric score presentation may be promoted.
 * Missing evidence always fails closed and returns machine-readable reasons.
 */
export function assessCalibrationPromotion(report) {
  const reasons = [];
  const thresholds = CALIBRATION_THRESHOLDS;
  const coverage = Object.values(report?.coverage || {});
  const categoryCoverageByPole = report?.categoryCoverageByPole || {};

  if (!report?.copiesCompared) reasons.push("no-verified-copies");
  if (!coverage.length) reasons.push("no-active-poles");
  if (coverage.some((count) => count < thresholds.minimumCopiesPerPole)) {
    reasons.push("copies-per-pole-insufficient");
  }
  if (
    Object.keys(report?.coverage || {}).some((pole) =>
      REQUIRED_CALIBRATION_CATEGORIES.some(
        (category) =>
          !Number.isFinite(categoryCoverageByPole[pole]?.[category]) ||
          categoryCoverageByPole[pole][category] < 1
      )
    )
  ) {
    reasons.push("category-coverage-incomplete");
  }
  if (!finiteAtMost(report?.normalizedMeanAbsoluteError, thresholds.maximumNormalizedMeanAbsoluteError)) {
    reasons.push("mae-threshold-not-met");
  }
  if (
    !Number.isFinite(report?.normalizedMeanBias) ||
    Math.abs(report.normalizedMeanBias) > thresholds.maximumAbsoluteNormalizedBias
  ) {
    reasons.push("bias-threshold-not-met");
  }
  if (!finiteAtMost(report?.falsePositiveRate, thresholds.maximumFalsePositiveRate)) {
    reasons.push("false-positive-threshold-not-met");
  }
  if (!finiteAtMost(report?.falseNegativeRate, thresholds.maximumFalseNegativeRate)) {
    reasons.push("false-negative-threshold-not-met");
  }
  if (
    !finiteAtMost(
      report?.normalizedMeanInterRaterDifference,
      thresholds.maximumNormalizedInterRaterDifference
    )
  ) {
    reasons.push("inter-rater-threshold-not-met");
  }

  return Object.freeze({ allowed: reasons.length === 0, reasons: Object.freeze(reasons) });
}
