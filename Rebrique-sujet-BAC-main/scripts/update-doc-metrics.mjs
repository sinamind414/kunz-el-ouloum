import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { CALIBRATION_STATUS } from "../data/calibration-status.js";
import { CALIBRATION_THRESHOLDS } from "../data/calibration-policy.js";
import { loadFullAppConfig } from "../data/subjects.js";
import { officialTaskInventoryFor } from "../data/official-tasks.js";
import { buildOfficialCoverageReport } from "../js/domain/subjects/official-coverage.js";
import { buildP1Status } from "./report-p1-status.mjs";
import { buildP2Status } from "./report-p2-status.mjs";
import { buildP3Status } from "./report-p3-status.mjs";

const APP_CONFIG = await loadFullAppConfig();

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");

// Mêmes fichiers que `npm test` (`node --test tests/*.test.mjs`) :
// uniquement les *.test.mjs de premier niveau de tests/ (pas tests/e2e/).
const testFiles = readdirSync(join(root, "tests"))
  .filter((name) => name.endsWith(".test.mjs"))
  .sort();

const countDeclarations = (file) => [...file.matchAll(/^\s*test\s*\(/gm)].length;
let declared = 0;
for (const name of testFiles) declared += countDeclarations(read(`tests/${name}`));

// tests/bac-benchmark.test.mjs déclare un test() dans une boucle qui s'exécute
// une fois par entrée de BENCHMARK_CASES : le comptage statique sous-déclare le
// nombre de tests réellement exécutés (1 déclaration → N exécutions).
const benchmark = read("tests/bac-benchmark.test.mjs");
const loopDeclarations = countDeclarations(benchmark);
const benchmarkCases = [...benchmark.matchAll(/^\s{4}label: /gm)].length;
const executed = declared - loopDeclarations + benchmarkCases;

const benchmarkCorpus = JSON.parse(read("tests/hard-benchmark/cases.json")).cases.length;
const uiLines = read("js/ui.js").trimEnd().split("\n").length;
const coverageReports = APP_CONFIG.years.flatMap((year) =>
  (year.sujets || []).map((subject) =>
    buildOfficialCoverageReport({
      yearId: year.id,
      subject,
      inventory: officialTaskInventoryFor(year.id, subject.id)
    })
  )
);
const inventoriedSubjects = coverageReports.filter((report) => report.inventoryStatus !== "missing").length;
const knownOfficialTasks = coverageReports.reduce((sum, report) => sum + report.knownTaskCount, 0);
const simulationEligibleSubjects = coverageReports.filter((report) => report.simulationEligible).length;
const requiredCalibrationCopies =
  CALIBRATION_STATUS.activePoles * CALIBRATION_THRESHOLDS.minimumCopiesPerPole;
const p1Status = buildP1Status();
const p2Status = buildP2Status();
const p3Status = buildP3Status();
const generated = `<!-- AUTO-METRICS:START -->

- Tests exécutés par \`npm test\` : **${executed}** (comptage statique des \`test()\` déclarés dans \`tests/*.test.mjs\`, boucle \`BENCHMARK_CASES\` comprise)
- Copies vérifiées dans le hard benchmark : **${benchmarkCorpus}/${requiredCalibrationCopies} minimum** avant toute promotion numérique
- Inventaires de tâches officielles commencés : **${inventoriedSubjects}/${coverageReports.length} sujets** (**${knownOfficialTasks} tâches connues**)
- Sujets éligibles à la simulation : **${simulationEligibleSubjects}**
- Critères P1 fermés : **${p1Status.completedGates}/${p1Status.totalGates}** — statut global : **${p1Status.complete ? "terminé" : "incomplet"}**
- Critères P2 fermés : **${p2Status.completedGates}/${p2Status.totalGates}** — élèves distincts testés : **${p2Status.usability.uniqueParticipants}/${p2Status.usability.requiredParticipants}**
- Critères P3 fermés : **${p3Status.completedGates}/${p3Status.totalGates}** — statut global : **${p3Status.complete ? "terminé" : "incomplet"}**
- Taille de la façade UI (js/ui.js) : **${uiLines} lignes**

<!-- AUTO-METRICS:END -->`;
const path = join(root, "README.md");
const current = read("README.md");
const next = current.replace(/<!-- AUTO-METRICS:START -->[\s\S]*?<!-- AUTO-METRICS:END -->/, generated);
if (next === current && !current.includes("<!-- AUTO-METRICS:START -->"))
  throw new Error("README auto-metrics markers missing");
if (process.argv.includes("--check")) {
  if (next !== current) {
    console.error("README metrics are stale. Run: npm run docs:update");
    process.exit(1);
  }
  console.log("README metrics are current.");
} else {
  writeFileSync(path, next);
  console.log(`README metrics updated. (${testFiles.length} fichiers, ${executed} tests)`);
}
