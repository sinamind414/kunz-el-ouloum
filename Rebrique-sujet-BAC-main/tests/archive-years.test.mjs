import { test } from "node:test";
import assert from "node:assert/strict";
import { APP_CONFIG } from "./helpers/full-app-config.mjs";
import { officialTaskInventoryFor } from "../data/official-tasks.js";

const ARCHIVE_IDS = ["2020", "2019", "2018", "2017", "2016", "2015", "2014", "2013"];
/* Trois années ont été relues page par page sur l'image et certifiées pôle par
   pôle : 2020 (Phase 3 du 2026-09-23, docs/RELECTURE_SE_2020_CHECKLIST.md),
   2019 (Phase 3 du 2026-09-23, docs/RELECTURE_SE_2019_CHECKLIST.md) et 2016
   (Phase 3 du 2026-09-24, docs/RELECTURE_SE_2016_CHECKLIST.md). Elles quittent
   la liste « tout reconstruit », qui ne couvre plus que 2013–2015 et
   2017–2018. Le garde-fou n'est pas retiré, il est déplacé : le test suivant
   exige pour ces années une page de livret, une date ISO et une note citant la
   checklist par pôle officiel, et interdit tout pôle officiel sans texte
   recopié. */
const YEARS_CERTIFIEES_PAR_IMAGE = ["2020", "2019", "2016"];
const ENABLED_RECON_SE = ["2018", "2017", "2015", "2014", "2013"];
const ARCHIVE_YEARS = APP_CONFIG.years.filter((year) => ENABLED_RECON_SE.includes(year.id));

test("l'archive 2013-2019 SE est branchée dans APP_CONFIG ; les années certifiées restent structurées", () => {
  const ids = APP_CONFIG.years.map((y) => y.id);
  assert.deepEqual(ids.slice(0, 4), ["2025", "2024", "2023", "2022"]);
  assert.equal(APP_CONFIG.years[0].id, "2025");
  const se2020 = APP_CONFIG.years.find((y) => y.id === "2020");
  assert.ok(se2020 && se2020.enabled && (se2020.stream || "se") === "se");
  assert.equal(
    APP_CONFIG.years.filter((y) => y.id === "2020").length,
    1,
    "2020 SE ne doit pas être dupliqué (officiel + reconstruit)"
  );
  for (const id of ENABLED_RECON_SE) {
    const year = APP_CONFIG.years.find((y) => y.id === id);
    assert.ok(year && year.enabled && (year.stream || "se") === "se", `${id} SE 4D manquant`);
  }
  /* 2021 est structurée 4D depuis le 2026-09-20 (OCR du sujet officiel —
     scripts/extracted/SE/2021) : plus d'armature « copie libre ». */
  const se2021 = APP_CONFIG.years.find((y) => y.id === "2021");
  assert.ok(se2021 && se2021.enabled, "2021 ouvre une épreuve");
  assert.notEqual(se2021.answerMode, "free", "2021 n'est plus une armature");
  for (const sujet of se2021.sujets) {
    for (const exercise of sujet.exercises) {
      assert.deepEqual(
        Object.keys(exercise.poles),
        ["N", "S", "E", "W"],
        `2021/S${sujet.id}/E${exercise.number} doit être structuré`
      );
    }
  }
});

test("chaque année reconstruite 2013–2015 et 2017–2018 est activée avec 2 sujets × 3 exercices 5/7/8", () => {
  // Ces cinq années seulement : 2019, 2020 et 2016 sont certifiées pôle par
  // pôle et sont contrôlées par les tests dédiés (voir
  // YEARS_CERTIFIEES_PAR_IMAGE) ; 2016 y porte d'ailleurs le barème imprimé
  // 6/7/7 et non 5/7/8.
  assert.equal(ARCHIVE_YEARS.length, 5);
  for (const year of ARCHIVE_YEARS) {
    assert.equal(year.enabled, true, `${year.id} doit être enabled`);
    assert.equal(year.sujets.length, 2, `${year.id} doit avoir 2 sujets`);
    for (const sujet of year.sujets) {
      assert.equal(sujet.exercises.length, 3, `${year.id}/S${sujet.id}`);
      assert.deepEqual(
        sujet.exercises.map((ex) => ex.max),
        [5, 7, 8],
        `${year.id}/S${sujet.id} barème 5/7/8`
      );
      assert.equal(sujet.pdf, null, `${year.id}/S${sujet.id} : PDF chargé à part, jamais inline`);
      assert.ok(sujet.pdfExternalUrl.startsWith("https://"));
      assert.ok(sujet.pdfNote && sujet.pdfNote.length > 20);
    }
  }
});

test("les consignes des années non relues (2013–2015, 2017–2018) restent reconstructed", () => {
  // L'indice de confiance par pôle appartenait à l'écran d'entraînement supprimé :
  // la provenance est désormais portée par les inventaires (tests/official-coverage.test.mjs).
  for (const id of ENABLED_RECON_SE) {
    for (const sujet of [1, 2]) {
      const inventory = officialTaskInventoryFor(id, sujet);
      assert.ok(inventory, `${id}/S${sujet} sans inventaire`);
      assert.ok(
        inventory.tasks.every((task) => task.promptSource === "reconstructed"),
        `${id}/S${sujet} déclare une consigne officielle`
      );
    }
  }
});

test("2020, 2019 et 2016 : chaque consigne officielle porte sa page de livret, sa date et sa note", () => {
  // Ces trois années sont sorties de « tout reconstruit » (2020 et 2019 le
  // 2026-09-23, 2016 le 2026-09-24) : le garde-fou devient plus précis, il ne
  // disparaît pas. Une consigne `official` sans page de livret, sans date ISO
  // ou sans note citant la checklist est une certification non traçable.
  const CHECKLISTS = {
    2020: { note: /RELECTURE_SE_2020_CHECKLIST/, date: "2026-09-23", maxPage: 9 },
    2019: { note: /RELECTURE_SE_2019_CHECKLIST/, date: "2026-09-23", maxPage: 9 },
    // 2016 : livret de 10 pages (sujet 1 = 1-5, sujet 2 = 6-10).
    2016: { note: /RELECTURE_SE_2016_CHECKLIST/, date: "2026-09-24", maxPage: 10 }
  };
  for (const id of YEARS_CERTIFIEES_PAR_IMAGE) {
    const year = APP_CONFIG.years.find((y) => y.id === id);
    assert.ok(year, `année ${id} absente de APP_CONFIG`);
    let officielles = 0;
    for (const sujet of year.sujets) {
      for (const ex of sujet.exercises) {
        for (const [letter, pole] of Object.entries(ex.poles)) {
          assert.ok(
            ["official", "reconstructed"].includes(pole.bacPromptSource),
            `${id}/S${sujet.id}/E${ex.number}/${letter} : provenance inconnue`
          );
          assert.ok(pole.bacPrompt && pole.bacPrompt.trim().length > 8);
          if (pole.bacPromptSource !== "official") continue;
          officielles += 1;
          assert.equal(
            pole.bacPromptVerifiedAt,
            CHECKLISTS[id].date,
            `${id}/S${sujet.id}/E${ex.number}/${letter} : date de relecture`
          );
          assert.ok(
            Number.isInteger(pole.bacPromptPage) &&
              pole.bacPromptPage >= 1 &&
              pole.bacPromptPage <= CHECKLISTS[id].maxPage,
            `${id}/S${sujet.id}/E${ex.number}/${letter} : page de livret 1-${CHECKLISTS[id].maxPage} attendue`
          );
          assert.match(
            pole.bacPromptNotes || "",
            CHECKLISTS[id].note,
            `${id}/S${sujet.id}/E${ex.number}/${letter} : note sans renvoi à la checklist`
          );
        }
      }
    }
    assert.ok(officielles > 0, `${id} : aucune consigne officielle après certification`);
  }
});

test("aucune consigne des années non relues n'est marquée official", () => {
  for (const year of ARCHIVE_YEARS) {
    assert.equal(
      YEARS_CERTIFIEES_PAR_IMAGE.includes(year.id),
      false,
      `${year.id} est certifiée par image : ce test ne doit plus la couvrir`
    );
    for (const sujet of year.sujets) {
      for (const ex of sujet.exercises) {
        for (const [letter, pole] of Object.entries(ex.poles)) {
          assert.equal(
            pole.bacPromptSource,
            "reconstructed",
            `${year.id}/S${sujet.id}/E${ex.number}/${letter}`
          );
          assert.ok(pole.bacPrompt && pole.bacPrompt.trim().length > 8);
        }
      }
    }
  }
});
