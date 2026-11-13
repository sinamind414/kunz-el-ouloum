/* ============================================================
   Tests unitaires — moteur d'évaluation + normalisation
   Lancer : npm test   (ou : node --test tests/engine.test.mjs)
   ============================================================ */
import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeArabic, stripArabicClitics } from "../data/subjects.js";
import { APP_CONFIG } from "./helpers/full-app-config.mjs";
import { evaluateText, evaluatePipeline, scoreFromFraction, scoreBac, matchConcept } from "../js/engine.js";

const ex1 = APP_CONFIG.years[0].sujets[0].exercises[0];
const ex3 = APP_CONFIG.years[0].sujets[0].exercises.find((e) => e.ui === "pipeline");

test("normalizeArabic harmonise les variantes de lettres, tatweel et ponctuation", () => {
  // أ/ا interchangeables
  assert.equal(normalizeArabic("الأدينوزين"), normalizeArabic("الادينوزين"));
  // ة/ه interchangeables
  assert.equal(normalizeArabic("اليقظة"), normalizeArabic("اليقظه"));
  // diacritiques retirés
  assert.equal(normalizeArabic("يقظةٍ"), normalizeArabic("يقظة"));
  // Tatweel / Kashida retiré
  assert.equal(normalizeArabic("البروتــــــين"), "البروتين");
  // Ponctuation arabe et occidentale nettoyée
  assert.equal(normalizeArabic("هل الأدينوزين يثبط، أم ينشط؟"), "هل الادينوزين يثبط ام ينشط");
  // Yeh persan ی (U+06CC) → ي arabe (résidu OCR fréquent dans les sujets scannés)
  assert.equal(normalizeArabic("الخلایا"), normalizeArabic("الخلايا"));
  assert.equal(normalizeArabic("الهیولي"), normalizeArabic("الهيولي"));
  // Kaf persan ک (U+06A9) → ك arabe
  assert.equal(normalizeArabic("کمون"), normalizeArabic("كمون"));
});

test("normalizeArabic tolère les variantes de saisie réelles (hamza, chiffres, espaces spéciaux)", () => {
  // Hamza sur support : les élèves omettent souvent le support correct
  assert.equal(normalizeArabic("مسؤول"), normalizeArabic("مسوول"));
  assert.equal(normalizeArabic("رئيسي"), normalizeArabic("رييسي"));
  assert.equal(normalizeArabic("جزيئة"), normalizeArabic("جزييه"));
  // Alef wasla ٱ (copie depuis certains PDF/sites)
  assert.equal(normalizeArabic("ٱلبروتين"), normalizeArabic("البروتين"));
  // Chiffres arabes-orientaux → occidentaux (claviers mobiles arabes)
  assert.equal(normalizeArabic("٦٠"), "60");
  assert.equal(normalizeArabic("القيمة ٢٥"), normalizeArabic("القيمة 25"));
  // Séparateur décimal arabe ٫ : converge vers la même forme que le point occidental
  // (la ponctuation étant ensuite neutralisée en espace, comme pour "0.5")
  assert.equal(normalizeArabic("0٫5"), normalizeArabic("0.5"));
  // Espaces insécables / invisibles (copier-coller, claviers mobiles)
  assert.equal(normalizeArabic("البروتين\u00A0الغشائي"), normalizeArabic("البروتين الغشائي"));
  assert.equal(normalizeArabic("البروتين\u200Bالغشائي"), normalizeArabic("البروتين الغشائي"));
  // GARDE-FOU : le hamza isolé ء est conservé — ماء (eau) ≠ ما (particule)
  assert.notEqual(normalizeArabic("ماء"), normalizeArabic("ما"));
});

test("le stemming tolère les suffixes possessifs réels (matchConcept)", () => {
  // Un élève écrit naturellement le mot fléchi ; le concept est encodé à la forme nue.
  assert.equal(matchConcept("يتم تركيبها في الريبوزوم", "تركيب"), true);
  assert.equal(matchConcept("اذكر مكوناته الاساسية", "مكونات"), true);
  assert.equal(matchConcept("يؤمن استرخائها", "استرخاء"), true);
  assert.equal(matchConcept("تحمل بروتيناتها الغشائية", "بروتينات"), true);
  // GARDE-FOUS anti-faux-positifs : mots courts jamais tronqués abusivement
  assert.equal(matchConcept("شرب ماء", "ما الدور"), false);
  assert.equal(matchConcept("بناء الجزيئة", "بنات"), false);
});

test("stripArabicClitics nettoie les préfixes arabes", () => {
  assert.equal(stripArabicClitics("كالبروتين"), "بروتين");
  assert.equal(stripArabicClitics("بالاحماض"), "احماض");
  assert.equal(stripArabicClitics("الادينوزين"), "ادينوزين");
});

test("alias sourcés du programme : pluriels brisés et synonymes du manuel scolaire", () => {
  // Chaque alias est rattaché à un keyword réellement présent dans data/subjects.js
  // (règle RULE_REVIEW.md : pas d'alias sans ancrage dans les données).
  assert.equal(matchConcept("تتواجد المشابك في النخاع الشوكي", "مشبك"), true); // 2023/S1/E1
  assert.equal(matchConcept("تلعب الاغشية دورا في النقل", "غشاء"), true); // 2023/S2/E2
  assert.equal(matchConcept("تنقل النواقل الالكترونات", "ناقل"), true); // 2023/S2/E3
  assert.equal(matchConcept("يتم الاستنساخ العكسي داخل الخلية", "نسخ"), true); // 2024/S1/E1
  assert.equal(matchConcept("التخطيط الكهربائي للعضلة", "تسجيل"), true); // 2023/S1/E1
  // GARDE-FOUS : les alias ne créent pas de ponts entre concepts distincts
  assert.equal(matchConcept("التخطيط الكهربائي", "نسخ"), false);
  assert.equal(matchConcept("المشابك المثبطة", "غشاء"), false);
  assert.equal(matchConcept("الاستنساخ العكسي", "تسجيل"), false);
});

test("matchConcept valide les synonymes et les formes préfixées", () => {
  const concept = ["حمض", "احماض"];
  assert.equal(matchConcept("تتكون الخلية من احماض امينية", concept), true);
  assert.equal(matchConcept("بالأحماض النووية", concept), true);
  assert.equal(matchConcept("لا توجد مادة هنا", concept), false);
});

test("évaluation texte — réponse riche = score plein", () => {
  const poleN = ex1.poles.N; // ex1 = ARN / synthèse protéique
  const res = evaluateText("يلعب الحمض الريبوزي النووي دورا في تركيب البروتين داخل الهيولى", poleN.rule);
  assert.ok(res.fraction >= 0.75);
  assert.equal(scoreFromFraction(poleN.points, res.fraction), 1);
  assert.ok(res.matched.length >= 2);
});

test("évaluation texte — texte de remplissage sans concept biologique = zéro point", () => {
  const poleN = ex1.poles.N;
  // 100 caractères de texte sans rapport avec la biologie
  const res = evaluateText(
    "هذا نص عشوائي طويل جدا لا يحتوي على اي فكرة علمية او منهجية مفيدة للحل ابدا بتاتا",
    poleN.rule
  );
  assert.equal(res.hits, 0);
  assert.equal(res.fraction, 0);
  assert.equal(scoreFromFraction(poleN.points, res.fraction), 0);
});

test("évaluation texte — mot interdit plafonne la note", () => {
  // Pôle S de l'exercice 2 du sujet 1 : interdit "بسبب"
  const poleS = APP_CONFIG.years[0].sujets[0].exercises[1].poles.S;
  const res = evaluateText(
    "نلاحظ نمو وتطور النمط الطبيعي بتركيز متزايد مقارنة بالطافر بسبب الحرارة",
    poleS.rule
  );
  assert.ok(res.forbiddenFound.includes("بسبب"));
});

test("évaluation texte — liste de mots-clés sans phrase structurée = zéro point", () => {
  const poleN = ex1.poles.N;
  // L'élève tape une simple liste de mots-clés sans structure ni verbe
  const res = evaluateText("حمض ريبوزي بروتين تركيب", poleN.rule, "N");
  assert.equal(res.isKeywordDump, true);
  assert.equal(res.fraction, 0);
  assert.equal(scoreFromFraction(poleN.points, res.fraction), 0);
});

test("évaluation texte — paraphrase avec synonymes et connecteurs = score plein", () => {
  const poleN = ex1.poles.N;
  // Formulation différente avec synonymes (ARN / اصطناع / خلايا / مما يؤدي)
  const res = evaluateText(
    "يقوم الـ ARN باصطناع البروتين في الهيولى مما يؤدي إلى استمرار نشاط الخلية",
    poleN.rule,
    "N"
  );
  assert.equal(res.isKeywordDump, false);
  assert.ok(res.fraction >= 0.75);
  assert.equal(scoreFromFraction(poleN.points, res.fraction), 1);
});

test("évaluation texte — réponse vide = zéro", () => {
  const res = evaluateText("", ex1.poles.N.rule);
  assert.equal(res.empty, true);
  assert.equal(res.fraction, 0);
});

test("évaluation texte — فعل التسمية يقبل جوابا قصيرا ودقيقا", () => {
  const rule = {
    prompt: "سم العضية المسؤولة عن تركيب البروتين",
    modelAnswer: "الريبوزوم",
    keywords: [["الريبوزوم", "ريبوزوم"]],
    minHits: 1
  };
  const res = evaluateText("الريبوزوم", rule);
  assert.equal(res.taskProfile?.id, "naming");
  assert.equal(res.isKeywordDump, true);
  assert.equal(res.fraction, 1);
});

test("évaluation texte — فعل الذكر لا ينهار لمجرد أنه تعداد قصير", () => {
  const rule = {
    prompt: "اذكر مراحل الانقسام الخيطي المتساوي",
    modelAnswer: "التمهيدية، الاستوائية، الانفصالية، النهائية",
    keywords: ["التمهيدية", "الاستوائية", "الانفصالية", "النهائية"],
    minHits: 2
  };
  const res = evaluateText("التمهيدية، الاستوائية، الانفصالية، النهائية", rule);
  assert.equal(res.taskProfile?.id, "listing");
  assert.equal(res.fraction, 1);
});

test("évaluation texte — حدد المتغيرات selon le contexte", () => {
  const rule = {
    prompt: "حدد المتغير المستقل والتابع في تجربة نمو الخميرة",
    modelAnswer: "المتغير المستقل هو تركيز الغلوكوز، والمتغير التابع هو عدد خلايا الخميرة.",
    keywords: ["تركيز الغلوكوز", "عدد خلايا الخميرة"],
    minHits: 2
  };
  const res = evaluateText("المتغير المستقل: تركيز الغلوكوز، والمتغير التابع: عدد خلايا الخميرة.", rule);
  assert.equal(res.taskProfile?.id, "variables");
  assert.equal(res.fraction, 1);
});

test("évaluation texte — حدد العلاقة devient une vraie relation et non une liste", () => {
  const rule = {
    prompt: "حدد العلاقة بين وجود الغلوكوز وعدد خلايا الخميرة",
    modelAnswer: "كلما تواجد الغلوكوز في الوسط ازداد عدد خلايا الخميرة، فهي علاقة طردية.",
    keywords: ["الغلوكوز", "عدد خلايا الخميرة", "علاقة طردية"],
    minHits: 2
  };
  const res = evaluateText("كلما تواجد الغلوكوز في الوسط ازداد عدد خلايا الخميرة، فهي علاقة طردية.", rule);
  assert.equal(res.taskProfile?.id, "relation");
  assert.ok(res.fraction >= 0.75);
});

test("évaluation texte — استخرج المفتوحة exige un vrai passage par le document", () => {
  const rule = {
    prompt: "استخرج من الوثيقة شروط تركيب ATP انطلاقاً من معطيات التجربة",
    modelAnswer:
      "تمثل الوثيقة شروط تركيب ATP، حيث يركب فقط بوجود ADP و Pi وتدرج بروتوني، ومنه نستنتج أن التدرج البروتوني شرط أساسي.",
    keywords: ["ADP", "Pi", ["تدرج بروتوني", "التدرج البروتوني"], "ATP"],
    minHits: 2
  };
  const res = evaluateText(
    "تمثل الوثيقة شروط التركيب، حيث نلاحظ أن ATP لا يركب إلا بوجود ADP و Pi وتدرج بروتوني، ومنه نستنتج أن التدرج البروتوني شرط أساسي.",
    rule,
    "S"
  );
  assert.equal(res.taskProfile?.id, "extraction");
  assert.ok(res.methodology.score >= 0.75);
});

test("évaluation texte — علق المفتوحة exige observation, explication et conclusion", () => {
  const rule = {
    prompt: "علق على نتائج الوثيقة المتعلقة بنشاط الإنزيم",
    modelAnswer:
      "تمثل الوثيقة تغير نشاط الإنزيم بدلالة تركيز الركيزة؛ نلاحظ تزايد النشاط ثم ثباته، وهذا راجع إلى تشبع المواقع الفعالة، ومنه نستنتج أن السرعة ترتبط بتركيز الركيزة إلى غاية التشبع.",
    keywords: ["نشاط الإنزيم", "تركيز الركيزة", "تشبع"],
    minHits: 2
  };
  const res = evaluateText(
    "تمثل الوثيقة تغير نشاط الإنزيم بدلالة تركيز الركيزة، حيث نلاحظ تزايد النشاط ثم ثباته، وهذا راجع إلى تشبع المواقع الفعالة، ومنه نستنتج أن السرعة ترتبط بتركيز الركيزة إلى غاية التشبع.",
    rule,
    "S"
  );
  assert.equal(res.taskProfile?.id, "commentary");
  assert.ok(res.methodology.score >= 0.75);
});

test("évaluation texte — وضح المفتوحة تتطلب تحليلا قبل التفسير", () => {
  const rule = {
    prompt: "باستغلال الوثيقة وضح آلية تأثير الدواء على نشاط الإنزيم",
    modelAnswer:
      "تمثل الوثيقة تغير نشاط الإنزيم في وجود وغياب الدواء، حيث نلاحظ انخفاض النشاط في وجوده، وهذا راجع إلى ارتباط الدواء بالموقع الفعال ومنع تشكل المعقد إنزيم-ركيزة، ومنه نستنتج أن الدواء مثبط تنافسي.",
    keywords: ["الدواء", "نشاط الإنزيم", "الموقع الفعال", "مثبط تنافسي"],
    minHits: 2
  };
  const res = evaluateText(
    "تمثل الوثيقة تغير نشاط الإنزيم في وجود وغياب الدواء، حيث نلاحظ انخفاض النشاط في وجوده، وهذا راجع إلى ارتباط الدواء بالموقع الفعال ومنع تشكل المعقد إنزيم-ركيزة، ومنه نستنتج أن الدواء مثبط تنافسي.",
    rule,
    "E"
  );
  assert.equal(res.taskProfile?.id, "analysis-explanation");
  assert.ok(res.methodology.score >= 0.8);
});

test("évaluation texte — وضح المفتوحة تعاقب القفز المباشر إلى السبب", () => {
  const rule = {
    prompt: "باستغلال الوثيقة وضح آلية تأثير الدواء على نشاط الإنزيم",
    modelAnswer:
      "تمثل الوثيقة تغير نشاط الإنزيم في وجود وغياب الدواء، حيث نلاحظ انخفاض النشاط في وجوده، وهذا راجع إلى ارتباط الدواء بالموقع الفعال ومنع تشكل المعقد إنزيم-ركيزة، ومنه نستنتج أن الدواء مثبط تنافسي.",
    keywords: ["الدواء", "نشاط الإنزيم", "الموقع الفعال", "مثبط تنافسي"],
    minHits: 2
  };
  const res = evaluateText("يعود تأثير الدواء إلى ارتباطه بالموقع الفعال ومنع نشاط الإنزيم.", rule, "E");
  assert.equal(res.taskProfile?.id, "analysis-explanation");
  assert.ok(res.methodology.score < 0.75);
});

test("évaluation texte — وضح المفتوحة غير المكتملة لا تنال 100%", () => {
  const rule = {
    prompt: "باستغلال الوثيقة وضح آلية تأثير الدواء على نشاط الإنزيم",
    modelAnswer:
      "تمثل الوثيقة تغير نشاط الإنزيم في وجود وغياب الدواء، حيث نلاحظ انخفاض النشاط في وجوده، وهذا راجع إلى ارتباط الدواء بالموقع الفعال ومنع تشكل المعقد إنزيم-ركيزة، ومنه نستنتج أن الدواء مثبط تنافسي.",
    keywords: ["الدواء", "نشاط الإنزيم", "الموقع الفعال", "مثبط تنافسي"],
    minHits: 4
  };
  const res = evaluateText("تمثل الوثيقة تغير نشاط الإنزيم، حيث نلاحظ انخفاضه بوجود الدواء.", rule, "E");
  assert.equal(res.taskProfile?.id, "analysis-explanation");
  assert.ok(res.methodology.score >= 0.75);
  assert.ok(res.fraction < 1);
});

test("évaluation texte — analyse pure reste distincte de analyse plus تفسير", () => {
  const rule = {
    prompt: "حلل نتائج الوثيقة 1",
    modelAnswer:
      "تمثل الوثيقة تغير عدد الخلايا بدلالة الزمن، حيث نلاحظ تزايداً تدريجياً ثم ثباتاً، ومنه نستنتج أن النمو يرتفع ثم يستقر.",
    keywords: ["عدد الخلايا", "الزمن", "تزايد", "ثبات"],
    minHits: 2
  };
  const pure = evaluateText(
    "تمثل الوثيقة تغير عدد الخلايا بدلالة الزمن، حيث نلاحظ تزايداً تدريجياً ثم ثباتاً، ومنه نستنتج أن النمو يرتفع ثم يستقر.",
    rule,
    "S"
  );
  const contaminated = evaluateText(
    "تمثل الوثيقة تغير عدد الخلايا بدلالة الزمن، حيث نلاحظ تزايداً تدريجياً ثم ثباتاً بسبب تنشيط الإنزيم، ومنه نستنتج أن النمو يرتفع ثم يستقر.",
    rule,
    "S"
  );
  assert.ok(pure.methodology.score > contaminated.methodology.score);
});

test("évaluation pipeline — arrangement parfait = 100%", () => {
  const perfect = { stream1: ["b1", "b2", "b3", "b4"], stream2: ["b5", "b6", "b7", "b8"] };
  const res = evaluatePipeline(ex3.blocksBank, perfect);
  assert.equal(res.correct, 8);
  assert.equal(res.fraction, 1);
});

test("correcteur — phrase fluide avec mauvais enzyme est plafonnée", () => {
  const poleE = APP_CONFIG.years[0].sujets[0].exercises[1].poles.E;
  const fluentWrong =
    "يعود انخفاض النمو إلى نشاط أنزيم SOD في البيرينويد والتيلاكوئيد مما يمنع تثبيت الطاقة الضوئية.";
  const res = evaluateText(fluentWrong, poleE.rule, "E");
  assert.ok(res.science.errors.some((e) => e.type === "wrong-concept"));
  assert.ok(res.fraction <= 0.45);
});

test("correcteur — lecture de document exige la comparaison الطبيعي/الطافر", () => {
  const poleS = APP_CONFIG.years[0].sujets[0].exercises[1].poles.S;
  const noCompare = "نلاحظ نموا مرتفعا في التركيز المنخفض ومنه نستنتج كفاءة الاستغلال.";
  const res = evaluateText(noCompare, poleS.rule, "S");
  assert.ok(res.document.applicable);
  assert.ok(res.document.gaps.length > 0);
  assert.ok(res.fraction < 1);
});

test("correcteur — المخطط بدون أسهم لا ينال العلامة الكاملة", () => {
  const rule = {
    prompt: "وضح في مخطط مسار Ado",
    keywords: ["Ado", "نعاس"],
    minHits: 1,
    schema: { arrows: true, ordered: ["Ado", "A1R", "نعاس"] }
  };
  const res = evaluateText("Ado على A1R يسبب نعاس", rule, "W");
  assert.ok(res.artifact.applicable);
  assert.ok(res.artifact.gaps.length > 0);
});

test("correcteur — السلسلة السببية المقلوبة تُرصد", () => {
  const rule = {
    prompt: "فسر الآلية",
    keywords: ["موقع", "نحاس"],
    minHits: 1,
    causalOrder: ["موقع", "نحاس"],
    modelAnswer: "يتغير الموقع ثم يفقد النحاس."
  };
  const res = evaluateText("بسبب فقدان النحاس يتغير الموقع الفعال", rule, "E");
  assert.ok(res.science.errors.some((e) => e.type === "inverted-causal"));
  assert.ok(res.fraction <= 0.45);
});

test("barème BAC — scoreBac arrondit au quart de point", () => {
  assert.equal(scoreBac(4, 1), 4);
  assert.equal(scoreBac(4, 0.5), 2);
  assert.equal(scoreBac(1, 0.8), 0.75);
  assert.equal(scoreBac(1.5, 1), 1.5);
  assert.equal(scoreFromFraction(1, 0.8), 0.8);
});

test("matchConcept reconnaît un synonyme pédagogique (اصطناع ≈ تركيب)", () => {
  assert.equal(matchConcept("يتم اصطناع البروتين في الهيولى", "تركيب"), true);
});
