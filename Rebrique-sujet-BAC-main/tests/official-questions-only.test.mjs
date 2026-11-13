import { test } from "node:test";
import assert from "node:assert/strict";
import { loadAllYears } from "../data/subjects.js";
import { APP_CONFIG as FULL_APP_CONFIG } from "./helpers/full-app-config.mjs";
import { officialTaskInventoryFor } from "../data/official-tasks.js";
import { examPaperHTML } from "../js/ui/screens/simulation.js";

/* ============================================================================
   Règle du propriétaire (2026-09-20) : l'écran d'épreuve n'affiche PLUS
   AUCUNE question — ni officielle ni reconstruite. L'élève lit les questions
   dans le sujet officiel (PDF rendu lisible par l'application) et rédige une
   réponse par exercice. Les questions officielles restent encodées dans les
   inventaires (جرد المهام, calibration) — jamais à l'écran d'épreuve.
   Ce test verrouille les deux faces de la règle :
     1. l'épreuve rend un champ par exercice, avec le barème, sans question ;
     2. aucun texte de consigne de l'inventaire ne fuite dans l'épreuve.
   ========================================================================== */

await loadAllYears();

const sessions = [];
for (const year of FULL_APP_CONFIG.years) {
  for (const sujet of year.sujets || []) {
    if (officialTaskInventoryFor(year.id, sujet.id)) sessions.push({ year, sujet });
  }
}

test("aucune épreuve n'affiche de question : un champ par exercice, avec le barème", () => {
  let checked = 0;
  for (const { year, sujet } of sessions) {
    const inventory = officialTaskInventoryFor(year.id, sujet.id);
    const html = examPaperHTML({ subject: sujet, inventory });
    // Aucune structure de tâche ni de question affichée.
    assert.doesNotMatch(html, /data-task-answer|data-official-task|bac-consigne/, `${year.id}/S${sujet.id}`);
    // Plus d'avis : le sujet officiel est rendu, pas annoncé par un bandeau.
    assert.doesNotMatch(html, /exam-paper-notice|اختبار صامت|التنقيط غير معاير/, `${year.id}/S${sujet.id}`);
    assert.match(html, /data-pdf-canvas|لا يوجد ملف موضوع/, `${year.id}/S${sujet.id} doit rendre le sujet`);
    // Un champ par exercice, avec le barème officiel (année + filière).
    for (const exercise of sujet.exercises) {
      assert.match(
        html,
        new RegExp(`data-free-exercise="${exercise.number}"`),
        `${year.id}/S${sujet.id}/E${exercise.number} doit avoir un champ de rédaction`
      );
      if (Number.isFinite(Number(exercise.max))) {
        assert.match(
          html,
          new RegExp(`${Number(exercise.max)} نقطة`),
          `${year.id}/S${sujet.id}/E${exercise.number} barème`
        );
      }
      checked++;
    }
    // Le total du sujet est affiché quand tout est mesuré : 20 pts partout.
    const allMeasured = sujet.exercises.every((exercise) => Number.isFinite(Number(exercise.max)));
    if (allMeasured) {
      assert.match(html, /data-exam-total="20"/, `${year.id}/S${sujet.id} total /20`);
    }
  }
  assert.ok(checked >= 100, `${checked} exercices vérifiés`);
});

test("aucun texte de consigne de l'inventaire ne fuite dans l'écran d'épreuve", () => {
  let verified = 0;
  for (const { year, sujet } of sessions) {
    const inventory = officialTaskInventoryFor(year.id, sujet.id);
    const html = examPaperHTML({ subject: sujet, inventory });
    for (const task of inventory.tasks) {
      const prompt = String(task.prompt || "").trim();
      if (prompt.length < 12) continue; // trop court pour être discriminant
      assert.ok(
        !html.includes(prompt),
        `${year.id}/S${sujet.id}: la consigne « ${prompt.slice(0, 30)}… » ne doit pas être affichée`
      );
      verified++;
    }
  }
  assert.ok(verified >= 250, `${verified} consignes vérifiées absentes de l'écran`);
});
