/* ============================================================
   Tests unitaires — contenu BAC 2024 (sujet réel reconstruit)
   ------------------------------------------------------------
   Le sujet 2024 a été rebâti sur les thèmes réels (VIH, épilepsie,
   P53, traduction, RUBISCO, immunité). Pages 2, 6, 7 et 10 relues
   sur photos du sujet officiel (2026-08-31) ; le reste reconstructed.
   Ces tests remplacent les cas synthétiques (Indolmycine / pipeline)
   retirés de engine.test.mjs.
   ============================================================ */
import { test } from "node:test";
import assert from "node:assert/strict";
import { APP_CONFIG } from "./helpers/full-app-config.mjs";
import { evaluateText, scoreFromFraction } from "../js/engine.js";

const y2024 = APP_CONFIG.years.find((y) => y.id === "2024");
const sujet1 = y2024.sujets[0];
const sujet2 = y2024.sujets[1];

test("BAC 2024 — structure : 2 sujets × 3 exercices texte (aucun pipeline synthétique)", () => {
  assert.equal(y2024.enabled, true);
  assert.equal(y2024.sujets.length, 2);
  for (const s of y2024.sujets) {
    assert.equal(s.exercises.length, 3);
    for (const ex of s.exercises) {
      assert.equal(ex.ui, "text");
    }
  }
});

test("BAC 2024 — S1 E1 E (VIH) : le نص علمي évalue la réponse modèle à 100%", () => {
  const poleE = sujet1.exercises[0].poles.E;
  // Même règle d'évaluation que l'application (le prompt = consigne BAC).
  const rule = {
    ...poleE.rule,
    prompt: poleE.bacPrompt,
    modelAnswer: poleE.modelAnswer,
    minLength: poleE.minLength
  };
  const res = evaluateText(poleE.modelAnswer, rule, "E");
  assert.equal(res.taskProfile.id, "scientific-text");
  assert.ok(res.fraction >= 0.95, `fraction=${res.fraction}`);
  assert.equal(scoreFromFraction(poleE.points, res.fraction), 2);
});

test("BAC 2024 — S2 E1 S (traduction) : فعل اذكر accepte une liste courte", () => {
  const poleS = sujet2.exercises[0].poles.S;
  const res = evaluateText("ARNm، الريبوزوم، ARNt، الأحماض الأمينية المنشطة", poleS.rule, "S");
  assert.equal(res.taskProfile.id, "listing");
  assert.ok(res.fraction >= 0.75, `fraction=${res.fraction}`);
});

test("BAC 2024 — S1 E2 E (الصرع) : l'explication cause-effet est reconnue", () => {
  const poleE = sujet1.exercises[1].poles.E;
  const res = evaluateText(poleE.modelAnswer, poleE.rule, "E");
  assert.ok(res.fraction >= 0.95, `fraction=${res.fraction}`);
});

test("BAC 2024 — S2 E2 S (RUBISCO) : la lecture de document est applicable", () => {
  const poleS = sujet2.exercises[1].poles.S;
  const res = evaluateText(poleS.modelAnswer, poleS.rule, "S");
  assert.ok(res.document.applicable);
  assert.equal(res.document.gaps.length, 0, res.document.gaps.join(" | "));
});
