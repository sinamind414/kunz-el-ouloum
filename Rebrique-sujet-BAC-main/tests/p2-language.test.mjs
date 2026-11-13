import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { simulationBlockersArabic } from "../js/ui/coverage-messages.js";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const visibleUi = [
  "js/ui/screens/workspace.js",
  "js/ui/screens/strategy.js",
  "js/ui/screens/guide.js",
  "js/ui/screens/hub.js",
  "js/ui/screens/simulation.js",
  "js/ui/pdf-viewer.js",
  "data/bac-mode-policy.js"
]
  .map(source)
  .join("\n");

test("la présentation visible n’emploie plus les anciennes métaphores concurrentes", () => {
  for (const term of [
    "السنّ",
    "الأسنان",
    "بوصلة",
    "🧭",
    "♞",
    "ورقة أم رأس",
    "صورة أم فيلم",
    "شريط فيديو",
    "فكّ القفل"
  ]) {
    assert.doesNotMatch(visibleUi, new RegExp(term), `ancienne métaphore encore visible: ${term}`);
  }
  /* Le rappel des « quatre étapes » a été retiré de l'écran de préparation à
     la demande du propriétaire : il distrait l'élève au lieu de le préparer.
     La méthode reste enseignée dans l'épreuve, consigne par consigne. */
  assert.doesNotMatch(visibleUi, /الخطوات الأربع/);
});

test("les anciens avertissements français du parcours élève ont une version arabe", () => {
  for (const term of [
    "Objectif méthodologique",
    "consigne brute BAC",
    "consigne reconstruite",
    "Contrôle brouillon",
    "tu n’as pas mis de comparaison",
    "tu as expliqué sans observer",
    "ta conclusion ne répond pas au problème",
    "PDF non disponible localement",
    "PDF du sujet"
  ]) {
    assert.doesNotMatch(visibleUi, new RegExp(term), `texte français encore visible: ${term}`);
  }
  /* Le rappel des « quatre étapes » a été retiré de l'écran de préparation à
     la demande du propriétaire : il distrait l'élève au lieu de le préparer.
     La méthode reste enseignée dans l'épreuve, consigne par consigne. */
  assert.doesNotMatch(visibleUi, /الخطوات الأربع/);
  assert.match(visibleUi, /لا يوجد ملف موضوع متاح لهذه الدورة في التطبيق/);
  // La provenance des consignes reste en arabe. L'avis de barème n'est plus
  // affiché sur la page de réponses.
  assert.match(visibleUi, /مُعاد بناؤها/);
  assert.doesNotMatch(
    visibleUi,
    /اختبار صامت: لا تلميح، لا إجابة نموذجية، لا تشخيص ولا نقطة أثناء الاختبار|التنقيط غير معاير: لا تُعرض أي علامة رقمية، لا قبل التسليم ولا بعده|الأسئلة كلها في ملف الموضوع الرسمي المعروض أدناه: اقرأ كل تمرين من الملف، ثم اكتب إجابتك الكاملة في حقله/
  );
  assert.doesNotMatch(
    visibleUi,
    /subject\?\.pdfNote/,
    "une note d’audit française ne doit pas fuiter dans l’UI"
  );
});

test("les bloqueurs techniques de simulation sont annoncés en arabe", () => {
  const message = simulationBlockersArabic([
    "inventory-partial",
    "task-mapping-incomplete",
    "documents-unreviewed"
  ]);
  assert.match(message, /جرد المهام الرسمية غير مكتمل/);
  assert.match(message, /ربط المهام/);
  assert.match(message, /الوثائق/);
  assert.doesNotMatch(message, /inventory|mapping|unreviewed/);
});
