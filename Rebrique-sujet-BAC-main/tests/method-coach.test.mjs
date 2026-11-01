import { test } from "node:test";
import assert from "node:assert/strict";
import {
  evaluateText,
  evaluateDocument,
  evaluateArtifact,
  METHOD_SCRIPTS,
  matchConcept
} from "../js/engine.js";
import { evaluateMethodCoach } from "../js/method-scripts.js";

test("method-scripts — chaque tâche majeure a un canevas", () => {
  for (const id of ["analysis", "explanation", "hypothesis", "scientific-text", "commentary", "comparison"]) {
    assert.ok(METHOD_SCRIPTS[id]?.steps?.length >= 2, `canevas manquant: ${id}`);
  }
});

test("coach — «يرتفع المنحنى» est signalé sans changer le score méthodologique d'une analyse propre", () => {
  const rule = {
    prompt: "حلل نتائج الوثيقة 1",
    modelAnswer:
      "تمثل الوثيقة تغير عدد الخلايا بدلالة الزمن، حيث نلاحظ تزايداً ثم ثباتاً، ومنه نستنتج أن النمو يرتفع ثم يستقر.",
    keywords: ["عدد الخلايا", "الزمن", "تزايد", "ثبات"],
    minHits: 2
  };
  const cleanAnswer =
    "تمثل الوثيقة تغير عدد الخلايا بدلالة الزمن، حيث نلاحظ تزايداً تدريجياً ثم ثباتاً، ومنه نستنتج أن النمو يرتفع ثم يستقر.";
  const clean = evaluateText(cleanAnswer, rule, "S");
  const again = evaluateText(cleanAnswer, rule, "S");
  const badCurve = evaluateText(
    "تمثل الوثيقة منحنى عدد الخلايا، حيث نلاحظ أن المنحنى يرتفع ثم ينخفض المنحنى، ومنه نستنتج أن النمو يتغير.",
    rule,
    "S"
  );
  assert.equal(clean.taskProfile.id, "analysis");
  assert.ok(!clean.coach.flags.includes("curve-motion"));
  assert.ok(badCurve.coach.flags.includes("curve-motion"));
  assert.ok(badCurve.coach.tips.some((t) => t.includes("المنحنى")));
  assert.equal(clean.methodology.score, again.methodology.score);
});

test("document — mauvaise formulation du منحنى ajoute un écart", () => {
  const rule = {
    document: {
      comparisons: [["طبيعي", "طافر"]],
      trends: [{ about: "طافر", expect: ["ينخفض"] }]
    }
  };
  const ok = evaluateDocument("نلاحظ نمو النمط الطبيعي مرتفعا مقارنة بالطافر الذي ينخفض نموه", rule);
  const bad = evaluateDocument("نلاحظ أن المنحنى يرتفع عند الطبيعي وينخفض المنحنى عند الطافر", rule);
  assert.ok(ok.gaps.every((g) => !g.includes("حركة المنحنى")));
  assert.ok(bad.gaps.some((g) => g.includes("حركة المنحنى")));
  assert.ok(bad.score < ok.score);
});

test("hypothèse — كتفي 2023 : ربما empêche le 100% et produit un conseil", () => {
  const rule = {
    prompt: "اقترح فرضية تفسيرية",
    keywords: ["موقع", "فعال"],
    minHits: 1,
    modelAnswer: "يعود السبب إلى تغير الموقع الفعال."
  };
  const good = evaluateText("يعود السبب إلى تغير الموقع الفعال للإنزيم مما يعيق ارتباط الركيزة.", rule, "E");
  const maybe = evaluateText(
    "ربما يعود السبب إلى تغير الموقع الفعال للإنزيم مما يعيق ارتباط الركيزة.",
    rule,
    "E"
  );
  assert.equal(good.taskProfile.id, "hypothesis");
  assert.ok(!good.coach.flags.includes("maybe-word"));
  assert.ok(maybe.coach.flags.includes("maybe-word"));
  assert.ok(maybe.fraction < good.fraction);
  assert.ok(maybe.fraction < 1);
});

test("نص علمي — l'absence de ؟ est un conseil, pas une baisse de methodology.score", () => {
  const rule = {
    prompt: "اكتب نصا علميا حول أهمية مرحلة التنشيط",
    keywords: ["تنشيط", "ARNt", "بروتين"],
    minHits: 2,
    modelAnswer: "مقدمة. عرض. خاتمة."
  };
  const text =
    "تمثل مرحلة التنشيط خطوة نوعية أساسية لأنها تسمح بربط الحمض الأميني بـ ARNt الموافق، وتعطيلها يوقف تركيب البروتين.";
  const res = evaluateText(text, rule, "W");
  assert.equal(res.taskProfile.id, "scientific-text");
  assert.ok(res.coach.flags.includes("missing-question"));
  const same = evaluateText(text, rule, "W");
  assert.equal(res.methodology.score, same.methodology.score);
});

test("artifact — titre demandé seulement si schema.title est présent", () => {
  const without = evaluateArtifact("Ado → A1R ثم نعاس", {
    schema: { arrows: true, ordered: ["Ado", "A1R", "نعاس"] }
  });
  const missingTitle = evaluateArtifact("Ado → A1R ثم نعاس", {
    schema: { arrows: true, title: "مسار النعاس", ordered: ["Ado", "A1R", "نعاس"] }
  });
  const withTitle = evaluateArtifact("عنوان مسار النعاس: Ado → A1R ثم نعاس", {
    schema: { arrows: true, title: "مسار النعاس", ordered: ["Ado", "A1R", "نعاس"] }
  });
  assert.ok(!without.gaps.some((g) => g.includes("العنوان")));
  assert.ok(missingTitle.gaps.some((g) => g.includes("العنوان")));
  assert.ok(!withTitle.gaps.some((g) => g.includes("العنوان")));
});

test("alias pédagogique — كودون ≈ رامزة", () => {
  assert.equal(matchConcept("يتعرف الريبوزوم على الكودون", "رامزة"), true);
});

test("evaluateMethodCoach — comparaison unilatérale", () => {
  const coach = evaluateMethodCoach({
    text: "يختلف النمط الطافر عن الطبيعي بينما ينخفض نموه",
    taskId: "comparison",
    poleType: "S",
    wordCount: 8
  });
  assert.ok(coach.flags.includes("comparison-one-sided"));
});
