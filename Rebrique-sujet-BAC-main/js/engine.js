/* ============================================================
   ENGINE FACADE
   ------------------------------------------------------------
   Public compatibility boundary for the application. Domain scoring,
   application timers, and browser audio now live in dedicated modules.
   Import this file when a stable application-level API is preferable.

   STATUT — actif d'audit et de calibration, PAS code de production.
   Ce graphe (engine.js + domain/evaluation/**, 2 342 lignes mesurées) n'est
   importé par aucun module d'interface ni par js/main.js : il est hors du
   graphe de démarrage, absent du précachage du service worker (sw.js:23 le
   documente) et absent du monofichier. Seuls les tests et le banc de
   calibration l'exercent.
   C'est volontaire : BAC_MODE_POLICY n'affiche aucune note à l'élève, donc
   aucune note n'est calculée dans l'application livrée. À ne pas confondre
   avec de la dette morte — c'est ici que vit l'analyse sémantique et que la
   calibration devrait s'appuyer le jour où des copies doublement annotées
   existeront. Toute modification doit être couverte par tests/engine*.
   ============================================================ */

export {
  METHOD_SCRIPTS,
  matchConcept,
  analyzeSentenceStructure,
  evaluateScience,
  evaluateDocument,
  evaluateArtifact,
  evaluateHypotheses,
  evaluateClosingCover,
  evaluateTechnique,
  evaluateAnalysisRubric,
  evaluateText,
  scoreFromFraction,
  scoreBac
} from "./domain/evaluation/text-evaluator.js";

export { evaluatePipeline } from "./domain/evaluation/pipeline-evaluator.js";
export { timers } from "./application/timers.js";
export { soundEngine } from "./services/sound-engine.js";
