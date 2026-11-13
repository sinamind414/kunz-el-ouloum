import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { CALIBRATION_STATUS } from "../data/calibration-status.js";
import { CALIBRATION_THRESHOLDS } from "../data/calibration-policy.js";
import { loadFullAppConfig } from "../data/subjects.js";
import { officialTaskInventoryFor } from "../data/official-tasks.js";
import { buildOfficialCoverageReport } from "../js/domain/subjects/official-coverage.js";
import { securityHeaders } from "../server.mjs";

const APP_CONFIG = await loadFullAppConfig();

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");
const lines = (path) => read(path).trimEnd().split("\n").length;

function publicJavaScriptSources() {
  const walk = (directory) =>
    readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? walk(path) : path.endsWith(".js") ? [path] : [];
    });
  return [join(root, "index.html"), ...walk(join(root, "js")), ...walk(join(root, "data"))].map((path) =>
    readFileSync(path, "utf8")
  );
}

export function buildP1Status() {
  const reports = APP_CONFIG.years.flatMap((year) =>
    year.sujets.map((subject) =>
      buildOfficialCoverageReport({
        yearId: year.id,
        subject,
        inventory: officialTaskInventoryFor(year.id, subject.id)
      })
    )
  );
  const sources = publicJavaScriptSources();
  const inventoryComplete = reports.filter(
    (report) => report.inventoryStatus === "complete" && report.errors.length === 0
  ).length;
  const coverageComplete = reports.filter(
    (report) => report.overallTaskCoveragePercent === 100 && report.errors.length === 0
  ).length;
  const eligible = reports.filter((report) => report.simulationEligible).length;
  const knownTasks = reports.reduce((sum, report) => sum + report.knownTaskCount, 0);
  const strictCsp =
    /style-src 'self'(?:;|$)/.test(securityHeaders["Content-Security-Policy"]) &&
    !/style-src[^;]*unsafe-inline/.test(securityHeaders["Content-Security-Policy"]);
  const noInlineStyles = sources.every(
    (source) => !/\bstyle\s*=/i.test(source) && !/\.style\.[a-z-]+\s*=/i.test(source)
  );
  // P1.4 — le mode épreuve est le seul mode : la copie ne porte aucun outil
  // d'entraînement (rapport, réinitialisation, indices, brouillon), et la
  // relecture n'existe qu'après remise.
  const sessionModeSource = read("js/store.js") + read("js/ui/screens/simulation.js");
  const separateModes =
    sessionModeSource.includes('SESSION_MODES = Object.freeze(["bac"])') &&
    sessionModeSource.includes("simulation-review-notice") &&
    !sessionModeSource.includes("simulation-active-notice");
  const coverageGuard =
    read("js/ui/screens/strategy.js").includes("assertSimulationEligible") &&
    read("js/ui/screens/simulation.js").includes("assertSimulationEligible");
  const uiLines = lines("js/ui.js");
  const workspaceLines = lines("js/ui/screens/workspace.js");
  // The privacy consent copy is intentionally part of the UI budget; keep a small
  // allowance for mandatory publication notices without hiding responsibility creep.
  const responsibilitiesReduced = uiLines <= 470 && workspaceLines <= 700;
  const requiredVerifiedCopies = CALIBRATION_STATUS.activePoles * CALIBRATION_THRESHOLDS.minimumCopiesPerPole;

  const gates = [
    {
      id: "P1.1",
      complete: inventoryComplete === reports.length,
      evidence: `${inventoryComplete}/${reports.length} inventaires complets; ${knownTasks} tâches connues`
    },
    {
      id: "P1.2",
      complete: coverageComplete === reports.length,
      evidence: `${coverageComplete}/${reports.length} sujets à 100 % de couverture explicite`
    },
    {
      id: "P1.3",
      complete: coverageGuard,
      evidence: `garde aux deux entrées; ${eligible} sujet(s) actuellement éligible(s)`
    },
    {
      id: "P1.4",
      complete: separateModes,
      evidence: "épreuve unique : entraînement retiré de la copie, relecture seulement après remise"
    },
    {
      id: "P1.5",
      complete: CALIBRATION_STATUS.scorePromotionAllowed,
      evidence: `${CALIBRATION_STATUS.copiesCompared}/${requiredVerifiedCopies} copies vérifiées minimales; promotion numérique ${CALIBRATION_STATUS.scorePromotionAllowed ? "autorisée" : "interdite"}`
    },
    {
      id: "P1.6",
      complete: strictCsp && noInlineStyles && responsibilitiesReduced,
      evidence: `CSP stricte=${strictCsp}; styles inline=${noInlineStyles ? 0 : "présents"}; ui.js=${uiLines} lignes; workspace.js=${workspaceLines} lignes`
    }
  ];
  return {
    complete: gates.every((gate) => gate.complete),
    completedGates: gates.filter((gate) => gate.complete).length,
    totalGates: gates.length,
    gates
  };
}

function print(status) {
  console.log("lot\tétat\tpreuve");
  for (const gate of status.gates) {
    console.log(`${gate.id}\t${gate.complete ? "terminé" : "bloqué"}\t${gate.evidence}`);
  }
  console.log(
    `\nP1: ${status.complete ? "TERMINÉ" : "INCOMPLET"} (${status.completedGates}/${status.totalGates} critères d'acceptation fermés).`
  );
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const status = buildP1Status();
  print(status);
  if (process.argv.includes("--check-complete") && !status.complete) process.exitCode = 1;
}
