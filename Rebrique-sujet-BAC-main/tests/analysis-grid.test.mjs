import { test } from "node:test";
import assert from "node:assert/strict";
import { APP_CONFIG } from "./helpers/full-app-config.mjs";
import {
  evaluateText,
  evaluateDocument,
  evaluateHypotheses,
  evaluateAnalysisRubric,
  evaluateClosingCover
} from "../js/engine.js";

function pole(year, sujet, ex, key) {
  return APP_CONFIG.years
    .find((y) => y.id === year)
    .sujets.find((s) => s.id === sujet)
    .exercises.find((e) => e.number === ex).poles[key];
}

test("2025 S1 E2 S — la réponse modèle couvre axes, domaines et بدلالة", () => {
  const p = pole("2025", 1, 2, "S");
  const res = evaluateText(p.modelAnswer, p.rule, "S");
  assert.ok(res.document.applicable);
  assert.equal(res.document.gaps.length, 0, res.document.gaps.join(" | "));
  assert.ok(res.rubric.applicable);
  assert.ok(
    res.rubric.steps.every((s) => s.passed),
    res.rubric.display
  );
});

test("2025 S2 E2 S — la réponse modèle lit السليم/المصاب", () => {
  const p = pole("2025", 2, 2, "S");
  const res = evaluateText(p.modelAnswer, p.rule, "S");
  assert.equal(res.document.gaps.length, 0, res.document.gaps.join(" | "));
});

test("strictValues refuse un chiffre hors barème", () => {
  const rule = {
    document: { values: ["منخفض", "مرتفع"], strictValues: true, comparisons: [["طبيعي", "طافر"]] }
  };
  const random = evaluateDocument("نلاحظ 17 فقط عند الطبيعي والطافر", rule);
  const cited = evaluateDocument("نلاحظ نموا مرتفعا عند الطبيعي ومنخفضا عند الطافر", rule);
  assert.ok(random.gaps.some((g) => g.includes("القيم")));
  assert.ok(!cited.gaps.some((g) => g.includes("القيم")));
});

test("sous-barème d'analyse est affichable sans changer methodology.score", () => {
  const rule = { prompt: "حلل نتائج الوثيقة 1", keywords: ["نمو"], minHits: 1 };
  const text =
    "تمثل الوثيقة تغيرات النمو بدلالة الزمن، حيث نلاحظ تزايدا ثم ثباتا، ومنه نستنتج أن النمو يستقر.";
  const a = evaluateText(text, rule, "S");
  const b = evaluateText(text, rule, "S");
  assert.ok(a.rubric.display.includes("التقديم"));
  assert.equal(a.methodology.score, b.methodology.score);
});

test("فرضيتان متميزتان مقابل نسختين متطابقتين", () => {
  const rule = {
    prompt: "اقترح فرضيتين",
    hypotheses: { min: 2, distinct: true },
    keywords: ["فرضيه"],
    minHits: 1
  };
  const good = evaluateHypotheses(
    "الفرضية 1: يعود السبب إلى تنافس Mtb على A1R. الفرضية 2: يثبط Mtb إفراز Ado نفسه.",
    rule
  );
  const clone = evaluateHypotheses(
    "الفرضية 1: يعود السبب إلى تنافس Mtb على A1R. الفرضية 2: يعود السبب إلى تنافس Mtb على A1R.",
    rule
  );
  assert.ok(good.score > clone.score);
  assert.ok(clone.gaps.length > 0);
});

test("الخاتمة تغطي المشكل N", () => {
  const problem = "كيف يؤثر إندولمايسين في تثبيط تنشيط الأحماض الأمينية وتركيب البروتين؟";
  const cover = evaluateClosingCover(
    "في الختام يثبط إندولمايسين تنشيط الأحماض فيتوقف تركيب البروتين.",
    problem
  );
  const miss = evaluateClosingCover("الخلايا تحتاج طاقة فقط.", problem);
  assert.ok(cover.score > miss.score);
  assert.ok(cover.score >= 0.5);
});

test("2024 S2 E2 S — la grille d'analyse n'est pas cassée par le contenu 2024 rebâti", () => {
  const p = pole("2024", 2, 2, "S");
  const res = evaluateText(p.modelAnswer, p.rule, "S");
  assert.ok(res.fraction >= 0.95);
  assert.ok(res.methodology.score >= 0.95);
});
