/* Independent quality checks used by the text scoring orchestrator. */
import { normalizeArabic } from "../../../data/subjects.js";
import {
  aliasesFor,
  computeReferenceOverlap,
  extractInformativeTokens,
  matchConcept
} from "./text-analysis.js";

export function evaluateScience(text, rule = {}) {
  const errors = [];
  (rule.wrongConcepts || []).forEach((concept) => {
    if (matchConcept(text, concept)) {
      errors.push({
        type: "wrong-concept",
        label: Array.isArray(concept) ? concept[0] : concept,
        message: `مفهوم علمي غير مناسب هنا: ${Array.isArray(concept) ? concept[0] : concept}`
      });
    }
  });

  const order = rule.causalOrder || [];
  if (order.length >= 2) {
    const norm = normalizeArabic(text);
    const positions = order.map((concept) => {
      const syns = (Array.isArray(concept) ? concept : [concept]).flatMap(aliasesFor).map(normalizeArabic);
      let idx = -1;
      syns.forEach((s) => {
        const at = s ? norm.indexOf(s) : -1;
        if (at >= 0 && (idx < 0 || at < idx)) idx = at;
      });
      return idx;
    });
    const known = positions.filter((p) => p >= 0);
    const causal = matchConcept(norm, [
      "مما يؤدي",
      "يعود",
      "بسبب",
      "لذلك",
      "فتتوقف",
      "فيمنع",
      "تؤدي",
      "يؤدي"
    ]);
    if (causal && known.length >= 2) {
      const firstKnown = positions.findIndex((p) => p >= 0);
      const lastKnown = positions.length - 1 - [...positions].reverse().findIndex((p) => p >= 0);
      if (firstKnown >= 0 && lastKnown > firstKnown && positions[firstKnown] > positions[lastKnown]) {
        errors.push({
          type: "inverted-causal",
          label: "سلسلة سببية مقلوبة",
          message: "الاتجاه السببي مقلوب بالنسبة للآلية المطلوبة."
        });
      }
    }
  }
  // Pénalité douce : une erreur coûte 0,25 (barème BAC classique), deux 0,50
  // etc. avec plancher à 0,10 (contre 0,5 * n → zéro pour 2 erreurs qui
  // annulait tout le pôle même quand l'étudiant avait raison sur l'essentiel).
  return {
    errors,
    score: errors.length ? Math.max(0.1, 1 - 0.25 * errors.length) : 1
  };
}

export function evaluateDocument(text, rule = {}) {
  const doc = rule.document;
  if (!doc) return { applicable: false, score: 1, gaps: [] };
  const gaps = [];
  let passed = 0;
  let total = 0;

  (doc.comparisons || []).forEach((pair) => {
    const [a, b] = pair;
    total += 1;
    if (matchConcept(text, a) && matchConcept(text, b)) passed += 1;
    else gaps.push(`المقارنة الوثائقية ناقصة: ${a} / ${b}`);
  });

  (doc.trends || []).forEach((trend) => {
    total += 1;
    const aboutOk = matchConcept(text, trend.about);
    const expectOk = (trend.expect || []).some((item) => matchConcept(text, item));
    if (aboutOk && expectOk) passed += 1;
    else gaps.push(`اتجاه الوثيقة غير مقروء: ${Array.isArray(trend.about) ? trend.about[0] : trend.about}`);
  });

  if (Array.isArray(doc.values) && doc.values.length) {
    total += 1;
    const norm = normalizeArabic(text);
    const cited = doc.values.some((v) => norm.includes(normalizeArabic(String(v))));
    const anyDigit = /[0-9٠-٩]/.test(text);
    const hasValue = doc.strictValues ? cited : cited || anyDigit;
    if (hasValue) passed += 1;
    else
      gaps.push(
        doc.strictValues
          ? "القيم المذكورة ليست قيم السند المطلوبة"
          : "لا توجد قيمة أو اتجاه رقمي مستخرج من السند"
      );
  }

  (doc.domains || []).forEach((domain) => {
    total += 1;
    const aboutOk = matchConcept(text, domain.about);
    const expectOk = (domain.expect || []).some((item) => matchConcept(text, item));
    if (aboutOk && expectOk) passed += 1;
    else gaps.push(`مجال المنحنى غير موصوف: ${Array.isArray(domain.about) ? domain.about[0] : domain.about}`);
  });

  if (Array.isArray(doc.axes) && doc.axes.length) {
    total += 1;
    const axisHits = doc.axes.filter((axis) => matchConcept(text, axis)).length;
    if (axisHits >= Math.min(2, doc.axes.length) || matchConcept(text, "بدلالة")) passed += 1;
    else gaps.push("لم تُذكر محاور المنحنى أو صيغة «بدلالة»");
  }

  (doc.relations || []).forEach((rel) => {
    total += 1;
    const both = matchConcept(text, rel.a) && matchConcept(text, rel.b);
    const typed =
      rel.type === "inverse"
        ? matchConcept(text, ["عكسي", "تناسب عكسي", "بينما", "في حين"])
        : rel.type === "sync"
          ? matchConcept(text, ["تزامن", "معا", "في نفس", "تطابق"])
          : matchConcept(text, ["بينما", "في حين", "مقابل", "بالمقابل", "كلما"]);
    if (both && typed) passed += 1;
    else gaps.push(`العلاقة المقارنة ناقصة (${rel.type || "parallel"}): ${rel.a} / ${rel.b}`);
  });

  (doc.cells || []).forEach((cell) => {
    const tokens = Array.isArray(cell) ? cell : [cell.row, cell.col, cell.expect].filter(Boolean);
    total += 1;
    if (tokens.filter((tok) => matchConcept(text, tok)).length >= Math.min(2, tokens.length)) passed += 1;
    else gaps.push(`خانة الجدول غير مقروءة: ${tokens[0]}`);
  });

  if (/يرتفع المنحني|ينخفض المنحني|ينزل المنحني|المنحني يرتفع|المنحني ينخفض/.test(normalizeArabic(text))) {
    total += 1;
    gaps.push("صف تغيّر الظاهرة لا حركة المنحنى");
  }

  if (/هذا يدل/.test(normalizeArabic(text)) && !/مما يدل/.test(normalizeArabic(text))) {
    total += 1;
    gaps.push("«هذا يدل» في قراءة السند تقترب من التفسير؛ اترك كلما… ثم نستنتج");
  }

  return { applicable: total > 0, score: total ? passed / total : 1, gaps };
}

export function evaluateArtifact(text, rule = {}) {
  const gaps = [];
  let passed = 0;
  let total = 0;
  const schema = rule.schema;
  const equation = rule.equation;

  if (schema?.ordered?.length) {
    total += 1;
    const norm = normalizeArabic(text);
    const idxs = schema.ordered.map((step) => {
      const syns = (Array.isArray(step) ? step : [step]).flatMap(aliasesFor).map(normalizeArabic);
      let at = -1;
      syns.forEach((s) => {
        const i = s ? norm.indexOf(s) : -1;
        if (i >= 0 && (at < 0 || i < at)) at = i;
      });
      return at;
    });
    const found = idxs.filter((i) => i >= 0);
    const ordered =
      found.length >= Math.min(3, schema.ordered.length) &&
      found.every((v, i, arr) => i === 0 || v >= arr[i - 1]);
    if (ordered) passed += 1;
    else gaps.push("ترتيب المخطط أو السلسلة غير مطابق");
  }

  if (schema?.arrows) {
    total += 1;
    if (/→|->|=>|⟶/.test(text) || matchConcept(text, ["ثم", "يليها"])) passed += 1;
    else gaps.push("المخطط يفتقد الأسهم أو التسلسل الصريح");
  }

  if (schema?.title) {
    total += 1;
    if (matchConcept(text, ["عنوان"]) || matchConcept(text, schema.title)) passed += 1;
    else gaps.push("المخطط يفتقد العنوان");
  }

  if (equation?.tokens?.length) {
    total += 1;
    const hits = equation.tokens.filter((tok) => matchConcept(text, tok)).length;
    const need = equation.minTokens || Math.min(2, equation.tokens.length);
    if (hits >= need) passed += 1;
    else gaps.push("المعادلة الكيميائية ناقصة أو غير مكتملة");
  }

  return { applicable: total > 0, score: total ? passed / total : 1, gaps };
}

export function evaluateHypotheses(text, rule = {}) {
  const spec = rule.hypotheses;
  if (!spec) return { applicable: false, score: 1, gaps: [], count: 0, distinct: true };
  const min = spec.min || 2;
  const norm = normalizeArabic(text);
  const numbered = /فرضيه\s*1|الفرضيه\s*1|اولا/.test(norm) && /فرضيه\s*2|الفرضيه\s*2|ثانيا/.test(norm);
  const causalBits = (text || "")
    .split(/[.\n؛;]/)
    .filter((s) => matchConcept(s, ["يعود", "يتنافس", "يثبط", "يفرز", "نفترض", "بسبب"]));
  const count = numbered ? 2 : Math.max((norm.match(/فرضيه/g) || []).length, causalBits.length);
  const parts = (text || "").split(/فرضيه\s*2|الفرضيه\s*2|ثانيا|2\s*:/i);
  let distinct = true;
  if (parts.length >= 2) {
    const t1 = new Set(extractInformativeTokens(parts[0]));
    const t2 = new Set(extractInformativeTokens(parts[1]));
    const inter = [...t1].filter((tok) => t2.has(tok)).length;
    const union = new Set([...t1, ...t2]).size;
    distinct = union ? inter / union < 0.75 : false;
  }
  const gaps = [];
  if (count < min) gaps.push(`المطلوب ${min} فرضيتان مميزتان، لا فرضية واحدة.`);
  if (spec.distinct !== false && parts.length >= 2 && !distinct)
    gaps.push("الفرضيتان متطابقتان تقريباً؛ غيّر الآلية المقترحة في كل واحدة.");
  if (matchConcept(norm, ["ربما", "لعل", "احتمال"]))
    gaps.push("تجنّب ربما/لعل/احتمال في الفرضية (كتفي 2023).");
  const score = gaps.length ? Math.max(0, 1 - 0.4 * gaps.length) : 1;
  return { applicable: true, score, gaps, count, distinct };
}

export function evaluateClosingCover(text, relatedProblem) {
  if (!relatedProblem) return { applicable: false, score: 1, overlap: 0 };
  const answer = new Set(extractInformativeTokens(text));
  const problem = extractInformativeTokens(relatedProblem).slice(0, 8);
  if (!problem.length) return { applicable: false, score: 1, overlap: 0 };
  const hit = problem.filter((tok) => answer.has(tok)).length;
  const ratio = hit / Math.min(4, problem.length);
  return { applicable: true, score: Math.min(1, ratio), overlap: ratio };
}

export function evaluateTechnique(text, rule = {}) {
  const spec = rule.technique;
  if (!spec) return { applicable: false, score: 1, gaps: [] };
  const names = spec.names || [];
  const roles = spec.role || [];
  const gaps = [];
  let passed = 0;
  let total = 0;
  if (names.length) {
    total += 1;
    if (names.some((n) => matchConcept(text, n))) passed += 1;
    else gaps.push(`التقنية غير مذكورة: ${names[0]}`);
  }
  if (roles.length) {
    total += 1;
    if (roles.some((r) => matchConcept(text, r))) passed += 1;
    else gaps.push("لم يُعلَّل دور التقنية أو ما تسمح بقياسه");
  }
  return { applicable: total > 0, score: total ? passed / total : 1, gaps };
}

export function evaluateAnalysisRubric(text, rule = {}, poleType = "") {
  const doc = rule.document;
  const analysisLike = poleType === "S" || /حلل|تحليل|استغل/.test(normalizeArabic(rule.prompt || ""));
  if (!analysisLike && !doc) return { applicable: false, steps: [], display: "" };
  const intro =
    matchConcept(text, ["يمثل", "تتمثل", "الوثيقه", "الوثيقة", "المنحني", "المنحنى", "الجدول", "الشكل"]) ||
    matchConcept(text, "بدلالة");
  const domains = matchConcept(text, [
    "تزايد",
    "تناقص",
    "ثبات",
    "ينخفض",
    "يرتفع",
    "منخفض",
    "مرتفع",
    "انعدام",
    "قيمة قصوى",
    "قيمة دنيا"
  ]);
  const values = /[0-9٠-٩]/.test(text) || (doc?.values || []).some((v) => matchConcept(text, String(v)));
  const conclusion = matchConcept(text, ["نستنتج", "استنتاج", "مما يدل", "ومنه"]);
  const steps = [
    { id: "intro", label: "التقديم", weight: 0.25, passed: intro },
    { id: "domains", label: "المجالات", weight: 0.25, passed: domains },
    { id: "values", label: "القيم", weight: 0.25, passed: values },
    { id: "conclusion", label: "الاستنتاج", weight: 0.25, passed: conclusion }
  ];
  const display = steps
    .map((s) => `${s.label} ${s.passed ? s.weight.toFixed(2) : "0.00"}/${s.weight.toFixed(2)}`)
    .join(" — ");
  return { applicable: true, steps, display, score: steps.filter((s) => s.passed).length / steps.length };
}

export function buildProfessorVerdict(fraction, methodologyScore, overlapRatio) {
  if (fraction >= 0.9)
    return "الجواب يطابق بدرجة عالية شبكة التقييم الآلية والكلمات المفتاحية (تقدير تدريبي تلقائي).";
  if (fraction >= 0.75)
    return methodologyScore < 0.55
      ? "المفاهيم العلمية حاضرة، لكن الهيكلة المنهجية يحسن تدقيقها."
      : "جواب تدريبي متماسك ينبغي تدعيمه بالمصطلحات المفتاحية.";
  if (fraction >= 0.5)
    return overlapRatio < 0.4
      ? "استيعاب جزئي للمسألة، مع الحاجة لإبراز المفاهيم الدقيقة."
      : "الجواب مقبول تدريبياً، لكنه يحتاج صياغة أكثر دقة وموضوعية.";
  return "الجواب ناقص وفق شبكة التقييم الآلية: راجع الكلمات المفتاحية والهيكلة المنهجية.";
}
