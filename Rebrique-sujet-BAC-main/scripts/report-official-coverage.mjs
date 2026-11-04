import { loadFullAppConfig } from "../data/subjects.js";
import { officialTaskInventoryFor } from "../data/official-tasks.js";
import { buildOfficialCoverageReport } from "../js/domain/subjects/official-coverage.js";

const APP_CONFIG = await loadFullAppConfig();

const reports = APP_CONFIG.years.flatMap((year) =>
  (year.sujets || []).map((subject) =>
    buildOfficialCoverageReport({
      yearId: year.id,
      subject,
      inventory: officialTaskInventoryFor(year.id, subject.id)
    })
  )
);

console.log("year\tsubject\tinventory\tknown mapped\toverall coverage\tsimulation");
for (const report of reports) {
  const mapped = report.knownTaskCount ? `${report.mappedTaskCount}/${report.knownTaskCount}` : "—";
  const coverage =
    report.overallTaskCoveragePercent === null
      ? "unknown"
      : `${report.overallTaskCoveragePercent.toFixed(1)}%`;
  console.log(
    `${report.yearId}\tS${report.subjectId}\t${report.inventoryStatus}\t${mapped}\t${coverage}\t${report.simulationEligible ? "eligible" : "blocked"}`
  );
}

const invalid = reports.filter((report) => report.errors.length);
const eligible = reports.filter((report) => report.simulationEligible);
console.log(
  `\n${reports.length} sujets audités; ${eligible.length} éligible(s) à la simulation; ${invalid.length} inventaire(s) invalide(s).`
);
if (invalid.length) {
  for (const report of invalid) {
    console.error(`${report.yearId}/S${report.subjectId}: ${report.errors.join("; ")}`);
  }
  process.exitCode = 1;
}
