/* Text scoring orchestration. It composes analysis, methodology and quality rules. */
import { normalizeArabic } from "../../../data/subjects.js";
import { evaluateMethodCoach, METHOD_SCRIPTS } from "../../method-scripts.js";
import {
  computeReferenceOverlap,
  inferTaskSignals,
  deriveTaskProfile,
  matchConcept,
  analyzeSentenceStructure
} from "./text-analysis.js";
import { evaluateMethodology, getPoleWeights } from "./methodology.js";
import {
  evaluateScience,
  evaluateDocument,
  evaluateArtifact,
  evaluateHypotheses,
  evaluateClosingCover,
  evaluateTechnique,
  evaluateAnalysisRubric,
  buildProfessorVerdict
} from "./quality-checks.js";

export { METHOD_SCRIPTS };
export { matchConcept, analyzeSentenceStructure } from "./text-analysis.js";
export {
  evaluateScience,
  evaluateDocument,
  evaluateArtifact,
  evaluateHypotheses,
  evaluateClosingCover,
  evaluateTechnique,
  evaluateAnalysisRubric
} from "./quality-checks.js";

export function evaluateText(text, rule = {}, poleType = "") {
  const norm = normalizeArabic(text);
  const keywords = rule.keywords || [];
  const forbidden = rule.forbidden || [];
  const req = rule.minHits || (keywords.length ? Math.min(2, keywords.length) : 0);
  const minLen = rule.minLength || 0;

  if (!norm || norm.length === 0) {
    return {
      fraction: 0,
      hits: 0,
      req,
      matched: [],
      missing: keywords.map((k) => (Array.isArray(k) ? k[0] : k)),
      forbiddenFound: [],
      length: 0,
      minLen,
      isKeywordDump: false,
      wordCount: 0,
      empty: true,
      methodology: { score: 0, strengths: [], missing: [], summary: "" },
      overlap: { ratio: 0, matchedTokens: [], missingTokens: [], referenceTokens: [], answerTokens: [] },
      richnessScore: 0,
      verdict: "",
      taskProfile: null,
      science: { errors: [], score: 1 },
      document: { applicable: false, score: 1, gaps: [] },
      artifact: { applicable: false, score: 1, gaps: [] },
      coach: { tips: [], flags: [], script: null },
      rubric: { applicable: false, steps: [], display: "" },
      hypotheses: { applicable: false, score: 1, gaps: [] },
      closing: { applicable: false, score: 1, overlap: 0 },
      technique: { applicable: false, score: 1, gaps: [] }
    };
  }

  const signals = inferTaskSignals(rule, poleType);
  const taskProfile = deriveTaskProfile(signals, poleType);
  const structure = analyzeSentenceStructure(norm, poleType);
  const matched = [];
  const missing = [];

  keywords.forEach((concept) => {
    if (matchConcept(norm, concept)) matched.push(Array.isArray(concept) ? concept[0] : concept);
    else missing.push(Array.isArray(concept) ? concept[0] : concept);
  });

  const hits = matched.length;
  const forbiddenFound = [];
  forbidden.forEach((term) => {
    if (matchConcept(norm, term)) forbiddenFound.push(Array.isArray(term) ? term[0] : term);
  });

  const lengthRatio = minLen ? Math.min(1, norm.length / minLen) : 1;
  const contentRatio = req ? Math.min(1, hits / req) : hits > 0 ? 1 : 0;
  const overlap = computeReferenceOverlap(text, rule);
  const methodology = evaluateMethodology(
    text,
    norm,
    poleType,
    structure,
    hits,
    req,
    rule,
    taskProfile,
    signals
  );
  const science = evaluateScience(text, rule);
  const documentEval = evaluateDocument(text, rule);
  const artifact = evaluateArtifact(text, rule);
  const hypotheses = evaluateHypotheses(text, rule);
  const closing = evaluateClosingCover(text, rule.relatedProblem);
  const technique = evaluateTechnique(text, rule);
  const rubric = evaluateAnalysisRubric(text, rule, poleType);
  const richnessScore = Math.min(
    1,
    ((structure.informativeWords >= 5 ? 1 : structure.informativeWords / 5) +
      (structure.hasConnectors ? 1 : Math.min(1, structure.connectorHits / 2))) /
      2
  );
  const weights = getPoleWeights(poleType, taskProfile);
  const toleratesShortAnswer = !!taskProfile.toleratesShortAnswer;
  const perfectMethodologyThreshold =
    taskProfile?.id === "analysis-explanation" ? 0.95 : toleratesShortAnswer ? 0.6 : 0.55;
  const perfectOverlapThreshold = taskProfile?.id === "analysis-explanation" ? 0.55 : 0.4;
  const perfectLengthThreshold =
    taskProfile?.id === "analysis-explanation" ? 0.65 : toleratesShortAnswer ? 0.2 : 0.55;

  let fraction = 0;
  if (hits > 0 && (!structure.isKeywordDump || toleratesShortAnswer)) {
    const conceptualScore = Math.min(
      1,
      contentRatio * (toleratesShortAnswer ? 0.9 : 0.75) + overlap.ratio * (toleratesShortAnswer ? 0.1 : 0.25)
    );
    fraction =
      conceptualScore * weights.content +
      methodology.score * weights.methodology +
      richnessScore * weights.richness;
    fraction *= toleratesShortAnswer ? 0.8 + 0.2 * lengthRatio : 0.55 + 0.45 * lengthRatio;
    if (!toleratesShortAnswer && methodology.score < 0.25 && poleType) fraction *= 0.55;
    if (
      !poleType &&
      contentRatio >= 1 &&
      ((toleratesShortAnswer && methodology.score >= 0.6) ||
        (!toleratesShortAnswer && overlap.ratio >= 0.45 && structure.wordCount >= 6))
    ) {
      fraction = 1;
    }
    fraction = Math.min(1, fraction);
  } else if (req === 0 && hits === 0 && !structure.isKeywordDump) {
    // Bug #B9 : règle sans keywords + réponse longue bien structurée →
    // on note par méthodologie + richesse + overlap, sinon fraction=0
    // même pour un texte de 100 mots correctement structuré.
    const lengthFactor = minLen ? Math.min(1, norm.length / minLen) : norm.length >= 80 ? 1 : 0.3;
    fraction =
      methodology.score * weights.methodology +
      richnessScore * weights.richness +
      overlap.ratio * weights.content;
    fraction *= lengthFactor;
    if (!toleratesShortAnswer && methodology.score < 0.25 && poleType) fraction *= 0.55;
    fraction = Math.min(1, fraction);
  }

  const thinContent = !toleratesShortAnswer && keywords.length >= 4 && hits <= 2 && overlap.ratio < 0.45;
  if (thinContent && fraction > 0) fraction = Math.min(fraction, 0.72);

  if (documentEval.applicable) fraction *= 0.6 + 0.4 * documentEval.score;
  if (artifact.applicable) fraction *= 0.75 + 0.25 * artifact.score;
  if (hypotheses.applicable) fraction *= 0.7 + 0.3 * hypotheses.score;
  if (technique.applicable) fraction *= 0.8 + 0.2 * technique.score;
  if (closing.applicable && taskProfile.id === "scientific-text" && closing.score < 0.5) fraction *= 0.85;
  if (!signals.allowsCausalTerms && /هذا يدل/.test(norm) && !/مما يدل/.test(norm)) fraction *= 0.85;
  if (science.errors.length) {
    fraction = Math.min(fraction * science.score, 0.45);
  }

  const coach = evaluateMethodCoach({
    text,
    norm,
    poleType,
    taskId: taskProfile.id,
    wordCount: structure.wordCount
  });
  if (coach.flags.includes("maybe-word") && fraction > 0) {
    fraction = Math.min(fraction, fraction * 0.75);
  }

  if (structure.isKeywordDump && !toleratesShortAnswer) fraction = 0;
  if (forbiddenFound.length > 0) {
    // Instead of destroying score down to 0.30, apply a moderate 15% penalty on methodology/form
    // while keeping the scientific content score intact.
    fraction = Math.min(fraction, fraction * 0.85);
  }
  const allowPerfect =
    science.errors.length === 0 &&
    (!documentEval.applicable || documentEval.score >= 0.99) &&
    (!artifact.applicable || artifact.score >= 0.99) &&
    (!hypotheses.applicable || hypotheses.score >= 0.99) &&
    (!technique.applicable || technique.score >= 0.99) &&
    (!(closing.applicable && taskProfile.id === "scientific-text") || closing.score >= 0.5) &&
    !thinContent &&
    !coach.flags.includes("maybe-word");
  if (
    allowPerfect &&
    (!structure.isKeywordDump || toleratesShortAnswer) &&
    forbiddenFound.length === 0 &&
    // A rule without keywords has req === 0 and would satisfy `hits >= req`
    // with zero matched concepts: a perfect score must always require at
    // least one real concept hit.
    hits > 0 &&
    hits >= req &&
    (poleType === "E" || methodology.score >= perfectMethodologyThreshold) &&
    (toleratesShortAnswer || poleType === "E" || overlap.ratio >= perfectOverlapThreshold) &&
    (poleType === "E" || lengthRatio >= perfectLengthThreshold)
  ) {
    fraction = 1;
  }

  return {
    fraction,
    hits,
    req,
    matched,
    missing,
    forbiddenFound,
    length: norm.length,
    minLen,
    isKeywordDump: structure.isKeywordDump,
    wordCount: structure.wordCount,
    empty: false,
    methodology,
    overlap,
    richnessScore,
    structure,
    lengthRatio,
    verdict: buildProfessorVerdict(fraction, methodology.score, overlap.ratio),
    taskProfile,
    science,
    document: documentEval,
    artifact,
    coach,
    rubric,
    hypotheses,
    closing,
    technique
  };
}

export function scoreFromFraction(points, fraction, options = {}) {
  // Bug #B11 + #B22 : avant le fix :
  //   - scoreFromFraction(5, 0.49) → Math.round(2.45 * 4) / 4 = Math.round(9.8) / 4 = 10/4 = 2.5
  //     alors que la troncature officielle au quart inférieur attend 2.25.
  //   - scoreFromFraction(5, undefined) → NaN (Number(undefined) === NaN ; NaN * 5 = NaN).
  // On nettoie points/fraction et on applique Math.floor(x * 1/step) * step
  // pour respecter la troncature au quart inférieur.
  const safePoints = Number.isFinite(Number(points)) && Number(points) > 0 ? Number(points) : 0;
  let safeFraction = Number(fraction);
  if (!Number.isFinite(safeFraction)) safeFraction = 0;
  if (safeFraction < 0) safeFraction = 0;
  if (safeFraction > 1) safeFraction = 1;
  const step = options.step ?? 0.01;
  if (!Number.isFinite(step) || step <= 0) return Math.round(safePoints * safeFraction * 100) / 100;
  const raw = safePoints * safeFraction;
  if (step === 0.25) return Math.floor(raw * 4) / 4;
  return Math.floor(raw / step) * step;
}

export function scoreBac(points, fraction) {
  return scoreFromFraction(points, fraction, { step: 0.25 });
}
