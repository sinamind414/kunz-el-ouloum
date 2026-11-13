import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { APP_CONFIG } from "./helpers/full-app-config.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CASES_PATH = join(__dirname, "hard-benchmark", "cases.json");
const SCHEMA_PATH = join(__dirname, "hard-benchmark", "schema.json");
const AUDIT_ID = "AUD-TEST-0001";
const stamp = "2026-08-24T10:00:00.000Z";
const annotation = (annotator, score, note) => ({
  annotator,
  score,
  note,
  completedAt: stamp,
  blindedToPeer: true,
  blindedToEngine: true
});
const auditRecord = {
  auditId: AUDIT_ID,
  consentRef: "CONSENT-TEST",
  copySha256: "a".repeat(64),
  transcriptionSha256: "b".repeat(64),
  annotationForms: [
    { annotator: "correcteur-A", sha256: "c".repeat(64), completedAt: stamp },
    { annotator: "correcteur-B", sha256: "d".repeat(64), completedAt: stamp }
  ],
  verifiedBy: "auditeur-C",
  verifiedAt: stamp
};

function loadCases() {
  try {
    return JSON.parse(readFileSync(CASES_PATH, "utf8"));
  } catch {
    return { cases: [] };
  }
}

function loadSchema() {
  try {
    return JSON.parse(readFileSync(SCHEMA_PATH, "utf8"));
  } catch {
    return null;
  }
}

test("cases.json existe et est un objet JSON valide", () => {
  const data = loadCases();
  assert.ok(typeof data === "object", "cases.json doit être un objet");
  assert.ok(Array.isArray(data.cases), "cases.json.cases doit être un tableau");
});

test("cases.json peut rester vide — aucune copie n'est inventée", () => {
  const data = loadCases();
  assert.ok(Array.isArray(data.cases));
  if (data.cases.length === 0) {
    console.log("⚠️  0 copie réelle dans cases.json — pipeline prêt mais vide.");
  } else {
    console.log(`✅ ${data.cases.length} copie(s) réelle(s) déjà importée(s).`);
  }
});

test("schéma JSON présent et lisible", () => {
  const schema = loadSchema();
  assert.ok(schema, "schema.json doit être présent");
  assert.equal(schema.title, "HardBenchmarkCase");
});

test("validation manuelle d'une casse valide", () => {
  const schema = loadSchema();
  const valid = {
    id: "2025-S1-E1-N-001",
    year: "2025",
    sujet: 1,
    exercise: 1,
    pole: "N",
    category: "weak",
    auditId: AUDIT_ID,
    answer: "réponse suffisamment longue pour passer validation",
    source: "test",
    collector: "test",
    annotations: [annotation("correcteur-A", 1, "note 1"), annotation("correcteur-B", 1, "note 2")],
    date: "2025-08-23"
  };
  const required = schema.properties.cases.items.required;
  const missing = required.filter((f) => !(f in valid));
  assert.equal(missing.length, 0, `champs requis manquants: ${missing.join(", ")}`);
});

test("import-copy.mjs existe et est exécutable", () => {
  const importPath = join(__dirname, "hard-benchmark", "import-copy.mjs");
  const src = readFileSync(importPath, "utf8");
  assert.ok(src.includes("generateId"), "import-copy.mjs doit exporter generateId");
  assert.ok(src.includes("detectLLM"), "import-copy.mjs doit détecter les marqueurs LLM");
  assert.ok(src.includes("--dry-run"), "import-copy.mjs doit exposer --dry-run");
});

test("validateCase / generateId / detectLLM fonctionnent hors cases.json", async () => {
  const { validateCase, generateId, detectLLM } = await import("./hard-benchmark/import-copy.mjs");
  const valid = {
    id: "2025-S1-E1-N-001",
    year: "2025",
    sujet: 1,
    exercise: 1,
    pole: "N",
    category: "weak",
    auditId: AUDIT_ID,
    answer: "المشكل العلمي غير مكتمل في هذه النسخة.",
    source: "centre-X / copie anonymisée",
    collector: "collecteur-A",
    annotations: [
      annotation("correcteur-A", 0.5, "forme partielle"),
      annotation("correcteur-B", 0.5, "forme partielle")
    ],
    date: "2026-08-24"
  };
  assert.deepEqual(validateCase(valid), []);
  assert.ok(validateCase({ ...valid, answer: "ab" }).includes("answer trop courte"));
  assert.ok(validateCase({ ...valid, pole: "Z" }).includes("pole invalide"));
  assert.ok(
    validateCase({ ...valid, annotations: [valid.annotations[0]] }).includes(
      "deux annotations humaines indépendantes sont requises"
    )
  );
  assert.ok(
    validateCase({
      ...valid,
      annotations: [valid.annotations[0], { ...valid.annotations[0], note: "avis répété" }]
    }).includes("les deux annotations doivent venir de correcteurs distincts")
  );
  assert.equal(generateId([], "2025", 1, 1, "N"), "2025-S1-E1-N-001");
  assert.equal(generateId([valid], "2025", 1, 1, "N"), "2025-S1-E1-N-002");
  const maths = {
    ...valid,
    id: "2025-m-S1-E1-N-001",
    year: "2025-m"
  };
  assert.deepEqual(validateCase(maths, 1), []);
  assert.equal(generateId([], "2025-m", 1, 1, "N"), "2025-m-S1-E1-N-001");
  assert.ok(validateCase(maths, 0.25).includes("score annotateur 1 invalide"));
  assert.ok(detectLLM("En conclusion, le mécanisme est clair.").includes("En conclusion"));
  assert.equal(detectLLM("نستنتج أن التدرج البروتوني شرط أساسي.").length, 0);
});

test("chaque copie importée possède deux annotations indépendantes et un audit vérifiable", async () => {
  const { validateCase, validateAuditRecord, loadAuditManifest } =
    await import("./hard-benchmark/import-copy.mjs");
  const manifest = loadAuditManifest();
  for (const caseObj of loadCases().cases) {
    assert.deepEqual(validateCase(caseObj), [], `copie invalide: ${caseObj.id}`);
    assert.deepEqual(validateAuditRecord(caseObj, manifest), [], `audit invalide: ${caseObj.id}`);
  }
});

test("un pseudonyme double ne suffit pas sans manifeste d'audit", async () => {
  const { validateAuditRecord } = await import("./hard-benchmark/import-copy.mjs");
  const fake = {
    auditId: "AUD-ABSENT-0001",
    collector: "collecteur-A",
    annotations: [annotation("correcteur-A", 1, "a"), annotation("correcteur-B", 1, "b")]
  };
  assert.deepEqual(validateAuditRecord(fake, { version: 1, records: [] }), [
    "auditId absent du manifeste d'audit"
  ]);
});

test("l'audit rejette les empreintes invalides, les correcteurs incohérents et un vérificateur impliqué", async () => {
  const { validateAuditRecord } = await import("./hard-benchmark/import-copy.mjs");
  const fake = {
    auditId: AUDIT_ID,
    collector: "collecteur-A",
    annotations: [annotation("correcteur-A", 1, "a"), annotation("correcteur-B", 1, "b")]
  };
  const broken = {
    ...auditRecord,
    copySha256: "invalide",
    annotationForms: [
      auditRecord.annotationForms[0],
      { ...auditRecord.annotationForms[1], annotator: "correcteur-X", completedAt: "jamais" }
    ],
    verifiedBy: "collecteur-A"
  };
  const errors = validateAuditRecord(fake, { version: 1, records: [broken] });
  assert.ok(errors.includes("empreinte de copie invalide"));
  assert.ok(errors.includes("formulaire d'annotation 2 invalide"));
  assert.ok(errors.includes("les correcteurs du cas ne correspondent pas au manifeste"));
  assert.ok(errors.includes("le vérificateur doit être distinct du collecteur et des correcteurs"));
});

test("dry-run valide une copie sans écrire dans cases.json", async () => {
  const { execFileSync } = await import("node:child_process");
  const { writeFileSync, unlinkSync } = await import("node:fs");
  const tmp = join(__dirname, "hard-benchmark", ".tmp-dry-run.json");
  const auditTmp = join(__dirname, "hard-benchmark", ".tmp-audit.json");
  writeFileSync(auditTmp, JSON.stringify({ version: 1, records: [auditRecord] }));
  const before = loadCases().cases.length;
  writeFileSync(
    tmp,
    JSON.stringify({
      year: "2025",
      sujet: 1,
      exercise: 1,
      pole: "N",
      category: "weak",
      auditId: AUDIT_ID,
      answer: "كيف يتدخل ARN في تركيب البروتين؟",
      source: "centre-X / copie anonymisée",
      collector: "collecteur-A",
      annotations: [annotation("correcteur-A", 0.25, "ébauche"), annotation("correcteur-B", 0.25, "ébauche")],
      date: "2026-08-24"
    })
  );
  try {
    const out = execFileSync(
      process.execPath,
      [
        join(__dirname, "hard-benchmark", "import-copy.mjs"),
        tmp,
        "--dry-run",
        `--audit-manifest=${auditTmp}`
      ],
      { encoding: "utf8" }
    );
    assert.match(out, /Dry-run/);
    assert.equal(loadCases().cases.length, before);
  } finally {
    try {
      unlinkSync(tmp);
      unlinkSync(auditTmp);
    } catch {
      /* ignore */
    }
  }
});

test("findPole résout un pôle existant", async () => {
  const { findPole } = await import("./hard-benchmark/_find-pole.mjs");
  const result = findPole("2025", 1, 1, "N");
  assert.ok(result, "findPole doit retourner un pôle existant");
  assert.equal(result.pole.points, 1);
});

test("findPole retourne null pour un pôle inexistant", async () => {
  const { findPole } = await import("./hard-benchmark/_find-pole.mjs");
  const result = findPole("2025", 1, 1, "Z");
  assert.equal(result, null);
});

test("findPole retourne null pour une année inexistante", async () => {
  const { findPole } = await import("./hard-benchmark/_find-pole.mjs");
  const result = findPole("1999", 1, 1, "N");
  assert.equal(result, null);
});

test("le statut de calibration public correspond exactement au corpus audité", async () => {
  const { CALIBRATION_STATUS } = await import("../data/calibration-status.js");
  const { buildCalibrationReport } = await import("./hard-benchmark/calibration-report.mjs");
  const report = buildCalibrationReport(loadCases().cases);
  assert.equal(CALIBRATION_STATUS.copiesCompared, report.copiesCompared);
  assert.equal(CALIBRATION_STATUS.activePoles, report.activePoles);
  assert.equal(CALIBRATION_STATUS.coveredPoles, report.coveredPoles);
  assert.equal(CALIBRATION_STATUS.scorePromotionAllowed, report.scorePromotionAllowed);
  assert.deepEqual(CALIBRATION_STATUS.promotionBlockers, report.promotionBlockers);
});

test("rapport de calibration : l'absence de copies reste explicitement non calibrée", async () => {
  const { buildCalibrationReport } = await import("./hard-benchmark/calibration-report.mjs");
  const report = buildCalibrationReport(loadCases().cases);
  assert.equal(report.calibrated, loadCases().cases.length > 0);
  assert.ok(report.activePoles > 0);
  if (!report.calibrated) {
    assert.equal(report.meanAbsoluteError, null);
    assert.equal(report.scorePromotionAllowed, false);
    assert.equal(report.falsePositives, 0);
    assert.equal(report.falseNegatives, 0);
  }
});

test("rapport de calibration : la couverture seule ne franchit pas les seuils de qualité", async () => {
  const { buildCalibrationReport } = await import("./hard-benchmark/calibration-report.mjs");
  const categories = ["strong", "weak", "scientifically-wrong", "off-topic"];
  const synthetic = [];
  let index = 0;
  for (const year of APP_CONFIG.years.filter((item) => item.enabled && item.answerMode !== "free")) {
    for (const sujet of year.sujets) {
      for (const exercise of sujet.exercises) {
        for (const pole of ["N", "S", "E", "W"]) {
          const max = exercise.poles[pole].points;
          for (let n = 0; n < 15; n += 1) {
            synthetic.push({
              id: `SYNTHETIC-${index++}`,
              year: String(year.id),
              sujet: sujet.id,
              exercise: exercise.number,
              pole,
              category: categories[n % categories.length],
              answer: "réponse synthétique réservée au test du rapport",
              annotations: [annotation("correcteur-A", max, "test"), annotation("correcteur-B", max, "test")]
            });
          }
        }
      }
    }
  }
  const report = buildCalibrationReport(synthetic);
  assert.equal(report.scorePromotionAllowed, false);
  assert.ok(report.promotionBlockers.includes("mae-threshold-not-met"));
  assert.ok(Object.values(report.categoryCoverage).every((count) => count > 0));
  assert.ok(
    Object.values(report.categoryCoverageByPole).every((counts) =>
      Object.values(counts).every((count) => count > 0)
    )
  );
  assert.equal(report.falsePositives, report.rows.filter((row) => row.enginePass && !row.humanPass).length);
  assert.equal(report.falseNegatives, report.rows.filter((row) => !row.enginePass && row.humanPass).length);
  assert.equal(buildCalibrationReport(synthetic.slice(1)).scorePromotionAllowed, false);
});

test("la politique de promotion exige couverture, catégories et six seuils quantitatifs", async () => {
  const { assessCalibrationPromotion, CALIBRATION_THRESHOLDS } =
    await import("../data/calibration-policy.js");
  const categoryCounts = { strong: 4, weak: 4, "scientifically-wrong": 4, "off-topic": 3 };
  const report = {
    copiesCompared: 15,
    coverage: { "2025/S1/E1/N": 15 },
    categoryCoverageByPole: { "2025/S1/E1/N": categoryCounts },
    normalizedMeanAbsoluteError: CALIBRATION_THRESHOLDS.maximumNormalizedMeanAbsoluteError,
    normalizedMeanBias: CALIBRATION_THRESHOLDS.maximumAbsoluteNormalizedBias,
    falsePositiveRate: CALIBRATION_THRESHOLDS.maximumFalsePositiveRate,
    falseNegativeRate: CALIBRATION_THRESHOLDS.maximumFalseNegativeRate,
    normalizedMeanInterRaterDifference: CALIBRATION_THRESHOLDS.maximumNormalizedInterRaterDifference
  };
  assert.deepEqual(assessCalibrationPromotion(report), { allowed: true, reasons: [] });
  assert.equal(assessCalibrationPromotion({ ...report, normalizedMeanBias: 0.051 }).allowed, false);
  assert.equal(assessCalibrationPromotion({ ...report, coverage: { "2025/S1/E1/N": 14 } }).allowed, false);
});

test("rapport de couverture : copies réelles par pôle APP_CONFIG", () => {
  const data = loadCases();
  const counts = new Map();
  for (const year of APP_CONFIG.years) {
    for (const sujet of year.sujets || []) {
      for (const ex of sujet.exercises || []) {
        for (const pole of ["N", "S", "E", "W"]) {
          if (!ex.poles?.[pole]) continue;
          const key = `${year.id}/S${sujet.id}/E${ex.number}/${pole}`;
          counts.set(key, 0);
        }
      }
    }
  }
  for (const c of data.cases) {
    const key = `${c.year}/S${c.sujet}/E${c.exercise}/${c.pole}`;
    if (counts.has(key)) counts.set(key, counts.get(key) + 1);
  }
  const empty = [...counts.entries()].filter(([, n]) => n === 0).map(([k]) => k);
  console.log(
    `📊 Couverture hard-benchmark : ${data.cases.length} copie(s) réelle(s) / ${counts.size} pôle(s).`
  );
  if (empty.length) {
    console.log(`⚠️  Pôles sans aucune copie réelle (${empty.length}) :`);
    empty.forEach((k) => console.log(`   - ${k}`));
  }
  assert.ok(counts.size > 0, "APP_CONFIG doit exposer au moins un pôle");
});
