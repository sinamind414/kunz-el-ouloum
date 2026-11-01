import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { YEAR_CATALOG, loadYear } from "../data/subjects.js";
import { OFFICIAL_TASK_INVENTORIES, officialTaskInventoryFor } from "../data/official-tasks.js";
import {
  buildOfficialCoverageReport,
  examOpenable,
  isFreeAnswerSubject
} from "../js/domain/subjects/official-coverage.js";

/* ============================================================
   Intégrité des inventaires de tâches officielles.
   ------------------------------------------------------------
   Les inventaires sont générés (scripts/generate-official-inventories.mjs) :
   ce test garantit qu'ils ne racontent pas autre chose que les données
   d'année, et que les pages annoncées restent utilisables par l'élève.
   ============================================================ */

const years = await Promise.all(
  YEAR_CATALOG.map(async (entry) => ({ entry, year: await loadYear(entry.id) }))
);
const loaded = years.filter((item) => item.year);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/* Les armatures « copie libre » (années dont les consignes ne sont pas
   encodées) n'ont, par construction, aucun inventaire : elles sont vérifiées
   par leur propre test, plus bas. */
function eachSubject() {
  const rows = [];
  for (const { year } of loaded) {
    if (year.answerMode === "free") continue;
    for (const subject of year.sujets || []) {
      rows.push({ yearId: year.id, subject, inventory: officialTaskInventoryFor(year.id, subject.id) });
    }
  }
  return rows;
}

test("plus aucune armature « copie libre » : chaque année est structurée et inventoriée", () => {
  /* Depuis la structuration 4D de SE 2021 (2026-09-20, OCR du sujet
     officiel), aucune année n'est plus en copie libre. Le garde-fou
     historique reste : une année « copie libre » ne doit avoir ni pôle,
     ni inventaire, ni note — vérifié sur un sujet synthétique. */
  const freeYears = loaded.filter(({ year }) => year.answerMode === "free");
  assert.equal(freeYears.length, 0, "aucune année ne doit rester en copie libre");
  const synthetic = {
    id: 1,
    answerMode: "free",
    pdfLocalUrl: "/subjects/X/2099/sujet-1.pdf",
    exercises: [
      { number: 1, max: 5, poles: {} },
      { number: 2, max: 7, poles: {} },
      { number: 3, max: 8, poles: {} }
    ]
  };
  assert.equal(isFreeAnswerSubject(synthetic), true);
  assert.equal(officialTaskInventoryFor("2099", synthetic.id), null, "aucun inventaire inventé");
  const report = buildOfficialCoverageReport({ yearId: "2099", subject: synthetic, inventory: null });
  assert.equal(report.freeAnswerEligible, true);
  assert.equal(report.simulationEligible, false, "aucune note ne peut être calculée");
  assert.equal(examOpenable(report), true, "l'épreuve reste ouverte");
});

test("chaque sujet chargé possède un inventaire, et inversement", () => {
  const rows = eachSubject();
  // 48 sujets jusqu'au 2026-09-19 ; 56 depuis la structuration OCR de Maths
  // 2013–2015 + 2017 استثنائية ; 58 depuis celle de SE 2021 (2026-09-20) —
  // soit TOUS les sujets du catalogue.
  assert.equal(rows.length, 58);
  for (const { yearId, subject, inventory } of rows) {
    assert.ok(inventory, `${yearId}/S${subject.id} sans inventaire`);
    assert.equal(inventory.schemaVersion, 1);
    assert.notEqual(inventory.status, "complete", `${yearId}/S${subject.id} se déclare complet`);
    assert.equal(inventory.source.humanVerified, false);
    assert.equal(inventory.source.verifiedAt, null);
    assert.ok(inventory.source.locator, `${yearId}/S${subject.id} sans source`);
  }
  const expected = new Set(rows.map(({ yearId, subject }) => `${yearId}/S${subject.id}`));
  assert.deepEqual(Object.keys(OFFICIAL_TASK_INVENTORIES).sort(), [...expected].sort());
});

test("chaque tâche recopie fidèlement le pôle dont elle vient", () => {
  for (const { yearId, subject, inventory } of eachSubject()) {
    for (const exercise of subject.exercises) {
      const tasks = inventory.tasks
        .filter((task) => task.exerciseNumber === exercise.number)
        .sort((a, b) => a.order - b.order);
      const poles = Object.entries(exercise.poles || {});
      assert.equal(tasks.length, poles.length, `${yearId}/S${subject.id} ت${exercise.number}`);
      let sum = 0;
      for (const [index, [letter, pole]] of poles.entries()) {
        const task = tasks[index];
        assert.equal(task.order, index + 1, `${yearId} ت${exercise.number} ordre`);
        assert.equal(task.pole, letter, `${yearId} ت${exercise.number} pôle`);
        assert.equal(task.prompt, pole.bacPrompt, `${yearId} ت${exercise.number}${letter} consigne`);
        assert.equal(task.maxPoints, pole.points, `${yearId} ت${exercise.number}${letter} points`);
        assert.equal(
          task.promptSource,
          pole.bacPromptSource === "official" ? "official" : "reconstructed",
          `${yearId} ت${exercise.number}${letter} provenance`
        );
        assert.equal(
          task.page ?? null,
          pole.bacPromptPage ?? null,
          `${yearId} ت${exercise.number}${letter} page`
        );
        assert.deepEqual(task.trainingMappings, [
          { exerciseNumber: exercise.number, pole: letter, kind: "direct" }
        ]);
        sum += task.maxPoints;
      }
      assert.ok(
        Math.abs(sum - exercise.max) < 1e-9,
        `${yearId} ت${exercise.number}: ${sum} ≠ ${exercise.max}`
      );
    }
  }
});

test("les identifiants de tâches sont uniques et dérivés de l'ordre réel", () => {
  const seen = new Set();
  for (const { yearId, subject, inventory } of eachSubject()) {
    for (const task of inventory.tasks) {
      assert.equal(task.id, `${yearId}-S${subject.id}-E${task.exerciseNumber}-Q${task.order}`);
      assert.equal(seen.has(task.id), false, `identifiant dupliqué: ${task.id}`);
      seen.add(task.id);
    }
  }
  // 488 tâches jusqu'au 2026-09-19 ; 552 avec les 8 sujets OCR Maths (64 pôles)
  // ; 576 avec les 2 sujets OCR de SE 2021 (48 pôles).
  assert.equal(seen.size, 576);
});

test("aucune provenance n'est survendue : official ⇒ page connue, barème toujours provisoire", () => {
  for (const { yearId, subject, inventory } of eachSubject()) {
    for (const task of inventory.tasks) {
      assert.equal(task.scoringReviewStatus, "provisional", `${task.id} barème non provisoire`);
      if (task.promptSource === "official") {
        assert.ok(Number.isInteger(task.page), `${task.id}: consigne officielle sans page`);
      } else {
        assert.equal(task.page, null, `${task.id}: étape reconstruite avec une page inventée`);
        assert.equal(task.pageInPdf ?? null, null, `${task.id}: page de fichier sur une étape reconstruite`);
      }
    }
  }
});

test("les pages annoncées restent utilisables dans le PDF livré", () => {
  let located = 0;
  let declared = 0;
  for (const { yearId, subject, inventory } of eachSubject()) {
    const { localPath, pages, pageOffset } = inventory.document;
    assert.equal(localPath, subject.pdfLocalUrl ?? null, `${yearId}/S${subject.id} chemin de fichier`);
    for (const task of inventory.tasks) {
      if (!Number.isInteger(task.page)) continue;
      declared += 1;
      if (!Number.isInteger(task.pageInPdf)) continue;
      located += 1;
      assert.ok(task.pageInPdf >= 1, `${task.id}: page de fichier ${task.pageInPdf}`);
      assert.ok(task.pageInPdf <= pages, `${task.id}: page ${task.pageInPdf} > ${pages} pages`);
      assert.equal(task.pageInPdf, task.page - pageOffset, `${task.id}: décalage incohérent`);
    }
  }
  // Le générateur rattache la très grande majorité des consignes à une page du
  // fichier ; les autres restent annotées « (الأصل) » plutôt que d'être devinées.
  // 213 consignes officielles jusqu'au 2026-09-19 ; 261 avec les 48 consignes
  // OCR Maths ; 277 avec les 16 consignes OCR de SE 2021 ; 294 avec les 17
  // consignes de SE 2019 recopiées sur l'image (Phase 3 du 2026-09-23) ;
  // 312 avec les 18 consignes de SE 2016 recopiées sur l'image (Phase 3 du
  // 2026-09-24).
  assert.equal(declared, 312);
  // Depuis la correction des offsets (2026-09-23), toute consigne officielle
  // est rattachée à son fichier : une page « non locable » est un bug, pas
  // une tolérance du générateur.
  assert.equal(located, declared, `pages non locables: ${declared - located}`);
});

test("la pagination déclarée n'est jamais silencieusement fausse", () => {
  // Quand le fichier suit la numérotation du document, aucune tâche ne doit
  // pointer au-delà de sa dernière page.
  for (const { yearId, subject, inventory } of eachSubject()) {
    if (inventory.document.pageOffset !== 0) continue;
    for (const task of inventory.tasks) {
      if (!Number.isInteger(task.page)) continue;
      assert.ok(
        task.page <= inventory.document.pages,
        `${yearId}/S${subject.id} ${task.id}: page ${task.page} au-delà des ${inventory.document.pages} pages du fichier`
      );
    }
  }
});

test("les références documentaires restent dans le fichier livré", () => {
  // documentRefs[] désigne des pages du PDF livré (numérotation fichier,
  // comme pageInPdf) : toute référence au-delà de la dernière page est un
  // reste de numérotation livret non converti (2025/S2, 2026/S1, 2024-m/S2…).
  for (const { yearId, subject, inventory } of eachSubject()) {
    const pages = inventory.document.pages;
    for (const task of inventory.tasks) {
      for (const reference of task.documentRefs || []) {
        for (const page of reference.pages || []) {
          assert.ok(
            Number.isInteger(page) && page >= 1 && page <= pages,
            `${yearId}/S${subject.id} ${task.id}: référence page ${page} hors du fichier (${pages} pages)`
          );
        }
      }
    }
  }
});

test("sans convention de pagination, aucune tâche n'est localisée", () => {
  // pageOffset null = inventaire sans consigne officielle (SE 2013-2018) :
  // le générateur n'affirme alors aucune correspondance de pages, et aucune
  // édition manuelle ne doit en ajouter une sans fixer l'offset.
  for (const { yearId, subject, inventory } of eachSubject()) {
    if (inventory.document.pageOffset !== null) continue;
    for (const task of inventory.tasks) {
      assert.equal(task.page ?? null, null, `${yearId}/S${subject.id} ${task.id}: page sans offset`);
      assert.equal(
        task.pageInPdf ?? null,
        null,
        `${yearId}/S${subject.id} ${task.id}: pageInPdf sans offset`
      );
      assert.deepEqual(task.documentRefs ?? [], [], `${yearId}/S${subject.id} ${task.id}: refs sans offset`);
    }
  }
});

test("2025/S2 : le faisceau sujet+corrigé ne renvoie jamais au corrigé", () => {
  // Le fichier livré contient le sujet (p1-5) puis le corrigé (p6-11) :
  // toute navigation élève doit rester sur le span du sujet.
  const inventory = officialTaskInventoryFor("2025", 2);
  assert.equal(inventory.document.pages, 11);
  assert.equal(inventory.document.pageOffset, 5);
  for (const task of inventory.tasks) {
    if (!Number.isInteger(task.pageInPdf)) continue;
    assert.ok(task.pageInPdf <= 5, `${task.id}: renvoie au corrigé (p${task.pageInPdf})`);
  }
});

test("la pagination déclarée suit le manifest et le PDF réel", async () => {
  // document.pages est relu sur le PDF à chaque génération : ce test garde
  // la chaîne manifest → inventaire → fichier réelle après une recoupe.
  const { createRequire } = await import("node:module");
  const pdfjs = createRequire(import.meta.url)("pdfjs-dist/legacy/build/pdf.js");
  const manifest = JSON.parse(readFileSync(join(root, "subjects", "manifest.json"), "utf8"));
  const manifestPages = new Map(
    manifest.map((entry) => [entry.file.replace(/^subjects\//, "/subjects/"), entry.pages])
  );
  for (const { yearId, subject, inventory } of eachSubject()) {
    const localPath = inventory.document.localPath;
    assert.ok(manifestPages.has(localPath), `${yearId}/S${subject.id} absent du manifest`);
    assert.equal(
      inventory.document.pages,
      manifestPages.get(localPath),
      `${yearId}/S${subject.id} inventaire hors manifest`
    );
    const doc = await pdfjs.getDocument({
      data: new Uint8Array(readFileSync(join(root, localPath.replace(/^\//, "")))),
      isEvalSupported: false
    }).promise;
    assert.equal(
      doc.numPages,
      manifestPages.get(localPath),
      `${yearId}/S${subject.id} manifest hors PDF réel`
    );
  }
});

test("l'inventaire versionné est exactement la sortie du générateur", () => {
  // Verrou maître : data/official-tasks.js ne s'édite jamais à la main, sinon
  // la preuve de provenance (official/reconstructed) ne vaut plus rien.
  execFileSync(process.execPath, [join(root, "scripts", "generate-official-inventories.mjs"), "--check"], {
    cwd: root,
    stdio: "pipe"
  });
});

test("les 58 sujets restent éligibles à l'épreuve sans inventaire invalide", () => {
  let invalid = 0;
  for (const { yearId, subject, inventory } of eachSubject()) {
    const report = buildOfficialCoverageReport({ yearId, subject, inventory });
    if (report.errors.length) invalid += 1;
    assert.equal(report.simulationEligible, true, `${yearId}/S${subject.id} fermé à l'épreuve`);
  }
  assert.equal(invalid, 0, "inventaires invalides détectés par la garde");
});
