/* ============================================================
   ENGINE — évaluation sémantique réelle + minuteurs fiables
   ------------------------------------------------------------
   Améliorations P1 :
     - Tolérance aux variantes de mots-clés et clitiques arabes.
     - Évaluation pondérée : zéro concept biologique = zéro point.
     - Feedback précis (notions acquises vs manquantes vs interdits).
   ============================================================ */

import { normalizeArabic, stripArabicClitics } from "../../../data/subjects.js";
import { METHOD_SCRIPTS, evaluateMethodCoach } from "../../method-scripts.js";

export { METHOD_SCRIPTS };

/* ---------- Lexique méthodologique & outils de profilage ---------- */
const CONNECTORS = [
  "في",
  "من",
  "علي",
  "الي",
  "عن",
  "مع",
  "خلال",
  "عبر",
  "داخل",
  "خارج",
  "ان",
  "انها",
  "حيث",
  "اذ",
  "عند",
  "عندما",
  "بينما",
  "حين",
  "اما",
  "بواسطه",
  "عن طريق",
  "مما",
  "ادي",
  "يؤدي",
  "يعمل",
  "يقوم",
  "يلعب",
  "يتم",
  "نلاحظ",
  "يبين",
  "يوضح",
  "يمثل",
  "يعود",
  "يرتبط",
  "يثبت",
  "يتثبت",
  "ينتج",
  "بالتالي",
  "نستنتج",
  "ومنه",
  "اذن",
  "خلاصه",
  "مقارنه",
  "تفسير",
  "دورا",
  "اساسيا",
  "نتيجه",
  "تاثير",
  "بسبب",
  "العلاقه",
  "رغم"
];

/* D5 — la détection se faisait par `normText.includes(connecteur)`. Sur un
   connecteur de deux lettres comme « ان », cela compte n'importe quel mot qui
   le contient : ان ⊂ انزيم، من ⊂ مناعه، في ⊂ فيزيائيه. Un simple empilement de
   mots-clés de SVT accumulait donc assez de faux connecteurs pour être lu
   comme une réponse structurée (mesuré : un « keyword dump » obtenait 1.000
   alors qu'une vraie réponse rédigée obtenait 0.000 — l'anti-récitation était
   inversé). On ne compte plus que des tokens entiers. */
const CONNECTOR_FORMS = CONNECTORS.map((connector) => normalizeArabic(connector)).filter(Boolean);
const CONNECTOR_TOKENS = new Set(CONNECTOR_FORMS.filter((form) => !form.includes(" ")));
const MULTIWORD_CONNECTORS = CONNECTOR_FORMS.filter((form) => form.includes(" "));

/**
 * Nombre de connecteurs distincts réellement présents.
 * @param {string} normText texte déjà normalisé
 * @param {string[]} words tokens du texte normalisé
 */
function countConnectorHits(normText, words) {
  const hits = new Set();
  for (const word of words) {
    if (CONNECTOR_TOKENS.has(word)) hits.add(word);
  }
  // Les locutions (« عن طريق ») ne sont pas des tokens : bornées par des
  // espaces, elles ne peuvent plus mordre sur un mot voisin.
  const padded = ` ${normText} `;
  for (const connector of MULTIWORD_CONNECTORS) {
    if (padded.includes(` ${connector} `)) hits.add(connector);
  }
  return hits.size;
}

const ARABIC_STOPWORDS = new Set([
  "من",
  "في",
  "على",
  "علي",
  "الى",
  "الي",
  "عن",
  "مع",
  "هذا",
  "هذه",
  "ذلك",
  "تلك",
  "ثم",
  "كما",
  "بعد",
  "قبل",
  "عند",
  "بين",
  "حيث",
  "اذا",
  "اذ",
  "او",
  "ام",
  "بل",
  "فان",
  "فانه",
  "لان",
  "لانها",
  "لانهم",
  "قد",
  "لقد",
  "تم",
  "يتم",
  "هو",
  "هي",
  "هم",
  "هن",
  "كان",
  "كانت",
  "يكون",
  "تكون",
  "الى",
  "حتي",
  "حتى",
  "كل",
  "جدا",
  "جداً",
  "اي",
  "ايضا",
  "ايضاً",
  "ما",
  "ماذا",
  "هل",
  "كيف",
  "لماذا",
  "التي",
  "الذي",
  "الذين",
  "اللاتي",
  "ذلك",
  "هنا",
  "هناك",
  "دون",
  "ضمن",
  "حسب",
  "عبر",
  "فقط",
  "تمثل",
  "يوضح",
  "تبين",
  "نلاحظ",
  "نستنتج",
  "خلاصه",
  "خلاصة",
  "اذن",
  "ومنه"
]);

const POLE_MARKERS = {
  N: {
    title: "تأطير المشكلة",
    primary: ["مشكل", "اشكالي", "اشكاليه", "تساؤل", "تحديد", "علاقه", "دور", "تاثير", "كيف"],
    secondary: ["متغير", "مستقل", "تابع", "فرضيه", "فرضيات", "يدرس", "تدخل", "يتدخل"],
    summary: "كان يجب صياغة المشكل العلمي أو المتغيرات بوضوح، لا مجرد تكرار كلمات الدرس."
  },
  S: {
    title: "استغلال السندات",
    primary: ["نلاحظ", "نسجل", "يبين", "يوضح", "يظهر", "يمثل", "مقارنه", "في حين", "بينما"],
    secondary: [
      "قيمه",
      "قيم",
      "نسبه",
      "تركيز",
      "تركيزات",
      "تزايد",
      "تناقص",
      "يرتفع",
      "ينخفض",
      "استنتاج",
      "مما يدل"
    ],
    summary:
      "في هذه الخطوة يجب قراءة الوثيقة ومقارنتها واستخراج الاستنتاج، لا القفز مباشرة إلى التفسير السببي."
  },
  E: {
    title: "الربط والتفسير",
    primary: ["يعود", "نتيجه", "بسبب", "مما يؤدي", "يفسر", "لذلك", "بالتالي", "اذن"],
    secondary: ["يرتبط", "يفعل", "ينشط", "يثبط", "يمنع", "يسمح", "يفتح", "يغلق", "يحرر", "ينتج", "يتثبت"],
    summary: "المطلوب هنا سلسلة سببية وآلية دقيقة، لا ملاحظات وصفية عامة."
  },
  W: {
    title: "التركيب والمصادقة",
    primary: ["خلاصه", "خلاصة", "نستنتج", "اذن", "في الختام", "بالتالي", "وعليه", "يتضح"],
    secondary: ["يثبت", "يصادق", "مصادقه", "نهائيا", "بناء", "اجمالا", "اجمالاً"],
    summary: "كان يجب جمع النتائج في خلاصة نهائية أو مصادقة صريحة، لا إعادة شرح جزئي غير مكتمل."
  }
};

function stemArabicToken(token) {
  if (!token) return "";
  let t = stripArabicClitics(normalizeArabic(token));
  if (t.length >= 6 && /(كما|هما|يات)$/.test(t)) t = t.slice(0, -3);
  else if (t.length >= 5 && /(كم|كن|نا|ها|هم|هن|ات|ون|ين|ان)$/.test(t)) t = t.slice(0, -2);
  if (t.length >= 5 && /(ه|ي)$/.test(t)) t = t.slice(0, -1);
  // Hamza final : استرخاء/استرخائها convergent. Seuil ≥5 délibéré — ماء (eau)
  // ne doit jamais devenir ما (particule).
  if (t.length >= 5 && /ء$/.test(t)) t = t.slice(0, -1);
  return t.trim();
}

function flattenKeywords(keywords = []) {
  return keywords.flatMap((concept) => (Array.isArray(concept) ? concept : [concept]));
}

function tokenizeArabic(text) {
  return normalizeArabic(text).split(/\s+/).map(stemArabicToken).filter(Boolean);
}

function extractInformativeTokens(text) {
  const uniq = [];
  const seen = new Set();
  tokenizeArabic(text).forEach((token) => {
    if (token.length < 3) return;
    if (ARABIC_STOPWORDS.has(token)) return;
    if (seen.has(token)) return;
    seen.add(token);
    uniq.push(token);
  });
  return uniq;
}

function countMarkerHits(normText, markers = []) {
  return markers.filter((marker) => matchConcept(normText, marker)).length;
}

function computeReferenceOverlap(text, rule = {}) {
  const answerTokens = extractInformativeTokens(text);
  const answerSet = new Set(answerTokens);
  const keywordTokens = extractInformativeTokens(flattenKeywords(rule.keywords || []).join(" "));
  const modelTokens = extractInformativeTokens([rule.modelAnswer, rule.prompt].filter(Boolean).join(" "));
  const referenceTokens = [...new Set([...keywordTokens, ...modelTokens])].slice(0, 12);
  const matchedTokens = referenceTokens.filter((token) => answerSet.has(token));
  const missingTokens = referenceTokens.filter((token) => !answerSet.has(token));
  const target = Math.max(1, Math.min(6, referenceTokens.length || keywordTokens.length || 1));
  return {
    matchedTokens,
    missingTokens,
    referenceTokens,
    ratio: Math.min(1, matchedTokens.length / target),
    answerTokens
  };
}

const CONCEPT_ALIASES = {
  تركيب: ["اصطناع", "تخليق"],
  اصطناع: ["تركيب", "تخليق"],
  بروتين: [
    "بروتينات",
    "عديدات الببتيد",
    "سلسلة ببتيدية",
    "ببتيد",
    "جزيئة بروتينية",
    "هيكلة فراغية",
    "بنية فراغية"
  ],
  رسول: ["مرنا", "mrna", "arnm", "arn رسول"],
  ناقل: ["ارنت", "arnt", "trna", "arn ناقل", "نواقل", "محمول", "حامل", "الحامل"],
  ارنت: ["arnt", "trna", "arn ناقل", "محمول", "حامل", "الحامل"],
  arnt: ["ناقل", "محمول"],
  ترجمه: ["ترجمة", "البروتين", "الاستطالة", "الببتيد", "بيبتيديه"],
  ريبوزوم: ["ريبوزومي", "ريبوزومات", "تحت وحدة"],
  طبيعي: ["الشاهد", "سليم"],
  طافر: ["طفرة", "الطافر"],
  نمو: ["تكاثر"],
  انقسام: ["انقسامات", "تضاعف خلوي", "تكاثر خلوي", "تكاثر الخلايا", "تكاثر"],
  انزيم: ["إنزيم", "انزيمات", "موقع فعال", "معقد إنزيمي"],
  تدرج: ["تدرج بروتوني", "التدرج البروتوني", "تدرج تركيز"],
  كريه: ["كرية", "الكرية المذنبة", "atp سينتاز", "atp synthase"],
  مستضد: ["مولد الضد", "مستضدات", "مولدات الضد", "antigene"],
  مضاده: ["مضاد", "جسم مضاد", "أجسام مضادة", "إميونوجلوبولين", "igg", "igm"],
  بلعمه: ["البلعمة", "بلعمية", "خلايا بلعمية", "بلعميات", "مكروفاج", "phagocytose"],
  sod: ["سوبر اكسيد", "ديسموتاز", "سوبروكسيد"],
  rubisco: ["روبيسكو", "ريبولوز"],
  رامزه: ["كودون", "شفرة"],
  كودون: ["رامزة"],
  // Pluriels brisés (non atteignables par stemming suffixal) — chaque entrée est
  // rattachée à un keyword réellement présent dans data/subjects.js :
  مشبك: ["مشابك", "مشبكي"], // 2023/S1/E1 (N,S,W)
  غشاء: ["اغشية", "غشائي"], // 2023/S2/E2 (S)
  // نسخ : manuel scolaire dit aussi الاستنساخ (2024/S1/E1 : النسخ العكسي)
  نسخ: ["استنساخ"],
  // تسجيل : les élèves écrivent souvent تخطيط (كهربائي) — 2023/S1/E1 (S)
  تسجيل: ["تخطيط"],
  لاذات: ["غير ذات", "اللاذات", "عنصر غريب"],
  كمون: ["جهد عمل", "كمون عمل", "كمون راحة", "زوال استقطاب"],
  طفره: ["طفرة جينية", "طفرة نقطية", "استبدال", "حذف", "إدراج", "طافرة", "تبدل جيني", "تغير نوكليوتيدي"],
  طفرة: ["طفرة جينية", "طفرة نقطية", "استبدال", "حذف", "إدراج", "طافرة", "تبدل جيني", "تغير نوكليوتيدي"],
  استجابة: ["استجابة مناعية", "مناعة خلطية", "مناعة خلوية"],
  مستقبل: ["مستقبل غشائي", "مستقبلات غشائية", "tcr", "bcr"],
  مؤشر: ["مؤشر غشائي", "سمح", "cmh1", "cmh2", "hla"],
  سمية: ["سمية خلوية", "إنزيمات حالّة", "بيرفورين", "غرانزيم"],
  فسفرة: ["فسفرة تأكسدية", "فسفرة ضوئية", "فسفرة adp"],
  حلقة: ["حلقة كالفن", "تثبيت co2", "إرجاع co2"]
};

function aliasesFor(term) {
  const key = normalizeArabic(term);
  const extra = CONCEPT_ALIASES[key] || CONCEPT_ALIASES[key.replace(/^ال/, "")] || [];
  return [term, ...extra];
}

/* ---------- Vérification d'un concept sémantique ---------- */
export function matchConcept(text, conceptDef) {
  if (!text) return false;
  const normText = normalizeArabic(text);
  if (!normText) return false;

  const synonyms = (Array.isArray(conceptDef) ? conceptDef : [conceptDef]).flatMap(aliasesFor);
  const words = normText.split(/\s+/).filter(Boolean);
  const strippedWords = words.map(stripArabicClitics).map(stemArabicToken);

  for (const syn of synonyms) {
    const normSyn = normalizeArabic(syn);
    if (!normSyn) continue;

    if (normText.includes(normSyn)) return true;

    const strippedSyn = stemArabicToken(normSyn);
    // Stems trop courts (لأن → ان) collent à أنه / أن — faux positifs méthodologiques.
    // On autorise un préfixe sur le mot candidat SEULEMENT si celui-ci prolonge le
    // stem de 1 ou 2 caractères (typiquement flexion féminine ة, plural ون/ات,
    // suffixe possessif ي). Un préfixe de 4+ caractères qui match n'importe quel
    // mot commençant par le radical fait des faux positifs (بروت ي attrape
    // بروتوكول, بروتون au lieu de seulement بروتين/بروتينات).
    if (
      strippedSyn.length >= 3 &&
      strippedWords.some((w) => {
        if (w === strippedSyn) return true;
        if (!w.startsWith(strippedSyn)) return false;
        const extra = w.length - strippedSyn.length;
        return extra >= 1 && extra <= 3;
      })
    ) {
      return true;
    }
  }
  return false;
}

/* ---------- Analyse de la structure syntaxique et méthodologique ---------- */
export function analyzeSentenceStructure(normText, poleType) {
  if (!normText) {
    return {
      wordCount: 0,
      connectorHits: 0,
      sentenceSignals: 0,
      informativeWords: 0,
      isKeywordDump: true,
      hasConnectors: false,
      lexicalDensity: 0
    };
  }

  const words = normText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const informativeWords = extractInformativeTokens(normText).length;
  const connectorHits = countConnectorHits(normText, words);
  // Heuristique verbe arabe : mot qui commence par une marque du présent
  // (أ/ي/ت/ن) ET dont la fin n'est PAS une marque nominale typique (ة/ى/ا
  // final de nom : نواة، تركيب، سنة، تلميذ، سائل، سطح). Les suffixes verbaux
  // (ون/ان/ات/وا/ين/تم/تن/نا/تما) renforcent le signal. On accepte les verbes
  // 3-radicaux nus (يقوم، تدرس، نكتب : 4 lettres) en excluant les noms 3-lettres
  // (qui finissent quasi tous par ة/ى/ا dans le lexique SVT).
  const VERB_PREFIX_RE = /^[أيتن]/;
  const VERB_SUFFIX_RE = /(ون|ان|ات|وا|ين|تم|تن|نا|تما)$/;
  const NOMINAL_ENDING_RE = /[ةىا]$/;
  const sentenceSignals = words.filter((w) => {
    if (!VERB_PREFIX_RE.test(w) || w.length < 4) return false;
    if (VERB_SUFFIX_RE.test(w)) return true;
    // 4 lettres : radical 3 consonnes après la marque. Les noms 3-radicaux
    // débutant par ces lettres sont quasi tous féminins en ة (نواة، سنة)
    // ou emprunts/adverbes qui finissent par ا/ى (سما، تلا).
    return w.length >= 4 && !NOMINAL_ENDING_RE.test(w);
  }).length;
  const hasConnectors = connectorHits > 0;
  const lexicalDensity = wordCount ? informativeWords / wordCount : 0;
  const isKeywordDump =
    wordCount < 5 ||
    (wordCount <= 8 && connectorHits === 0) ||
    (informativeWords >= 2 && sentenceSignals === 0 && connectorHits === 0);

  return {
    wordCount,
    connectorHits,
    sentenceSignals,
    informativeWords,
    isKeywordDump,
    hasConnectors,
    lexicalDensity,
    poleType
  };
}

function inferTaskSignals(rule = {}, poleType = "") {
  const promptRef = normalizeArabic(rule.prompt || "");
  const answerRef = normalizeArabic(rule.modelAnswer || "");
  const mergedRef = normalizeArabic([rule.prompt, rule.modelAnswer].filter(Boolean).join(" "));
  const wrap = (txt) => ` ${txt} `;
  const containsToken = (txt, term) => wrap(txt).includes(` ${normalizeArabic(term)} `);
  const hasTokenIn = (txt, ...terms) => terms.some((term) => containsToken(txt, term));
  const hasTextIn = (txt, ...terms) => terms.some((term) => txt.includes(normalizeArabic(term)));
  const promptHasToken = (...terms) => hasTokenIn(promptRef, ...terms);
  const promptHasText = (...terms) => hasTextIn(promptRef, ...terms);
  const anyHasToken = (...terms) => hasTokenIn(mergedRef, ...terms);
  const anyHasText = (...terms) => hasTextIn(mergedRef, ...terms);

  const usesPreciserVerb = promptHasToken("حدد");
  const docDriven =
    poleType === "S" ||
    anyHasText("وثيقه", "وثيقة", "منحني", "منحنى", "جدول", "شكل", "سند", "السند") ||
    promptHasText("باستغلال", "اعتمادا", "انطلاقا");
  const openVerbTerms = [
    "اشرح",
    "وضح",
    "بين",
    "فسر",
    "علق",
    "استخرج",
    "استنتج",
    "استدل",
    "ناقش",
    "برهن",
    "اثبت",
    "أثبت",
    "صادق"
  ];
  const openVerbCount = openVerbTerms.filter((term) => promptHasToken(term) || promptHasText(term)).length;
  const requiresRelation =
    promptHasText("حدد العلاقة", "العلاقة بين") || (usesPreciserVerb && promptHasToken("العلاقة"));
  const requiresVariables =
    promptHasText("المتغير", "المتغيرات") ||
    (usesPreciserVerb && (promptHasToken("المستقل", "التابع") || promptHasText("المتغير")));
  const requiresImportance =
    promptHasText("الاهمية", "الأهمية") || (usesPreciserVerb && promptHasText("اهمية", "أهمية"));
  const requiresMechanismPrecision =
    promptHasText("حدد كيف", "حدد آلية", "حدد الية", "حدد طريقة") ||
    (usesPreciserVerb && (promptHasToken("كيف") || promptHasText("آليه", "آلية", "طريقة")));
  const requiresDirectPrecision =
    usesPreciserVerb &&
    (promptHasText("مكونات", "مراحل", "عناصر", "خطوات", "شروط", "بيانات") ||
      promptHasToken("المكونات", "المراحل", "العناصر", "الخطوات", "الشروط", "البيانات"));
  const requiresDiscussion = promptHasToken("ناقش") || promptHasText("مناقشة");
  const requiresCommentary = promptHasToken("علق") || promptHasText("تعليق");
  const requiresExtraction = promptHasToken("استخرج", "استنتج") || promptHasText("استخلص", "الاستخلاص");
  const explanationVerbRequested = promptHasToken("اشرح", "وضح", "بين");
  const openInstruction =
    docDriven && (openVerbCount === 1 || promptHasText("باستغلال", "اعتمادا", "انطلاقا"));
  const requiresOpenExplanation =
    explanationVerbRequested && openInstruction && !requiresCommentary && !requiresDiscussion;
  const requiresTechniqueWhy =
    promptHasText("علل استعمال", "علل استخدام", "لماذا تستعمل") ||
    (promptHasToken("علل") && promptHasText("تقنيه", "تقنية", "نظير", "وسم"));
  const requiresExtraInfo = promptHasText(
    "معلومه اضافيه",
    "المعلومة الإضافية",
    "ما تضيفه",
    "المعلومه الجديده"
  );
  const requiresGraphBuild = promptHasText(
    "انجز منحنى",
    "أنجز منحنى",
    "ارسم منحنى",
    "انشئ منحنى",
    "أنشئ منحنى"
  );
  const requiresTranslation = promptHasText("ترجم الى مخطط", "ترجم إلى مخطط");

  return {
    usesPreciserVerb,
    docDriven,
    openInstruction,
    requiresQuestion:
      poleType === "N" ||
      promptHasText("اشكاليه", "اشكالية", "مشكل", "تساؤل") ||
      promptHasToken("سؤال") ||
      anyHasText("المشكل العلمي", "الإشكالية"),
    requiresObservationVerb:
      poleType === "S" ||
      promptHasToken("تحليل", "حلل", "استغلال", "علق") ||
      anyHasText("وثيقه", "وثيقة", "بالارقام", "بالأرقام", "منحني", "منحنى", "جدول", "شكل"),
    requiresComparison:
      promptHasToken("قارن", "مقارنه", "مقارنة") || promptHasText("تحليل مقارن", "بالتوازي"),
    requiresDefinition:
      promptHasToken("عرف", "تعريف") || promptHasText("قدم تعريفا", "ما هو", "ما هي", "ماهي"),
    requiresDescription: promptHasToken("صف", "وصف") || promptHasText("قدم وصفا"),
    requiresNaming:
      promptHasToken("تعرف", "سم", "سمي") || promptHasText("تعرف على", "سم البيانات", "اكتب البيانات"),
    requiresListing: promptHasToken("اذكر", "عدد") || requiresDirectPrecision,
    requiresClassification: promptHasToken("صنف", "تصنيف"),
    requiresDistinction: promptHasToken("ميز", "التمييز"),
    requiresRelation,
    requiresVariables,
    requiresImportance,
    requiresMechanismPrecision,
    requiresDocumentIntro: docDriven,
    requiresConclusion:
      poleType === "W" ||
      promptHasToken("استنتج") ||
      anyHasText("استنتاج", "استخلاص", "خلاصه", "خلاصة", "خاتمه", "خاتمة", "مصادقه", "مصادقة"),
    requiresCausalChain:
      poleType === "E" ||
      promptHasToken("تفسير", "فسر", "علل", "اشرح", "وضح", "بين") ||
      anyHasText("الربط", "اليه", "آليه", "آلية", "استدلال") ||
      requiresMechanismPrecision ||
      requiresImportance,
    requiresScientificText:
      poleType === "W" ||
      promptHasText("نص علمي", "حرر نصا علميا", "اكتب نصا علميا", "مهيكل", "منظم") ||
      answerRef.includes(normalizeArabic("مقدمة")) ||
      answerRef.includes(normalizeArabic("خاتمة")),
    requiresHypothesis:
      promptHasText("اقترح فرضية", "اقترح فرضيتين", "فرضية تفسيرية") ||
      anyHasText("فرضيه", "فرضية", "فرضيات"),
    requiresProblemFormulation:
      poleType === "N" || promptHasText("حدد المشكل", "صغ المشكل", "المشكل العلمي", "الاشكالية", "الإشكالية"),
    requiresExtraction,
    requiresOpenExtraction: requiresExtraction && openInstruction,
    requiresJustification: promptHasToken("علل", "برر") || requiresImportance,
    requiresCritique: promptHasToken("انقد", "نقد"),
    requiresCommentary,
    requiresOpenCommentary: requiresCommentary && openInstruction,
    requiresDiscussion,
    requiresOpenDiscussion: requiresDiscussion && openInstruction,
    requiresOpenExplanation,
    requiresTechniqueWhy,
    requiresExtraInfo,
    requiresGraphBuild,
    requiresTranslation,
    requiresValidation:
      promptHasText("صادق على", "تحقق من صحة", "تأكد من صحة", "ناقش مدى صحة") ||
      promptHasToken("اثبت", "أثبت", "برهن"),
    requiresOpenReasoning:
      promptHasToken("اشرح", "وضح", "بين", "استدل", "ناقش", "برهن", "اثبت", "أثبت", "علق", "استخرج", "فسر") ||
      requiresRelation ||
      requiresMechanismPrecision,
    allowsCausalTerms: !(
      poleType === "S" ||
      promptHasToken("تحليل", "حلل", "استغلال") ||
      promptHasText("بالارقام", "بالأرقام")
    )
  };
}

function buildTaskProfile(id, label, summary, options = {}) {
  return {
    id,
    label,
    summary,
    mode: options.mode || "open",
    toleratesShortAnswer: !!options.toleratesShortAnswer
  };
}

function deriveTaskProfile(signals, poleType) {
  if (signals.requiresScientificText) {
    return buildTaskProfile("scientific-text", "نص علمي", "المطلوب نص علمي منظم: مقدمة، عرض، خاتمة.", {
      mode: "open"
    });
  }
  if (signals.requiresProblemFormulation) {
    return buildTaskProfile(
      "problem",
      "طرح مشكل علمي",
      signals.requiresVariables
        ? "المطلوب صياغة الإشكالية مع تحديد المتغيرات أو عناصر الدراسة بدقة."
        : "المطلوب صياغة الإشكالية أو تحديد المتغيرات بدقة.",
      { mode: "open" }
    );
  }
  if (signals.requiresVariables) {
    return buildTaskProfile(
      "variables",
      "تحديد متغيرات",
      "المطلوب تعيين المتغير المستقل والتابع أو عناصر الضبط بعبارة دقيقة ومباشرة.",
      { mode: "closed", toleratesShortAnswer: true }
    );
  }
  if (signals.requiresRelation) {
    return buildTaskProfile(
      "relation",
      "تحديد علاقة",
      "المطلوب بيان العلاقة بين عنصرين أو أكثر بصياغة علمية واضحة مثل: كلما... أو علاقة طردية/عكسية.",
      { mode: signals.openInstruction ? "open" : "closed" }
    );
  }
  if (signals.requiresNaming) {
    return buildTaskProfile(
      "naming",
      "تسمية / تعرف",
      "المطلوب تعيين العنصر بالاسم العلمي الدقيق دون شرح مطول.",
      { mode: "closed", toleratesShortAnswer: true }
    );
  }
  if (signals.requiresDefinition) {
    return buildTaskProfile(
      "definition",
      "تعريف علمي",
      "في التعريف يجب ذكر ماهية العنصر ثم وصفه ودوره أو مقره عند الحاجة.",
      { mode: "closed" }
    );
  }
  if (signals.requiresDescription) {
    return buildTaskProfile(
      "description",
      "وصف علمي",
      "الوصف يتطلب إبراز الخصائص أو البنية أو المقر بتفصيل أوضح من مجرد التعريف.",
      { mode: "closed" }
    );
  }
  if (signals.requiresClassification) {
    return buildTaskProfile(
      "classification",
      "تصنيف",
      "التصنيف يقتضي ترتيب العناصر في مجموعات واضحة وفق معيار محدد.",
      { mode: "closed" }
    );
  }
  if (signals.requiresListing) {
    return buildTaskProfile("listing", "ذكر / تعداد", "المطلوب سرد العناصر مباشرة وباختصار دون تفسير زائد.", {
      mode: "closed",
      toleratesShortAnswer: true
    });
  }
  if (signals.requiresDistinction) {
    return buildTaskProfile(
      "distinction",
      "تمييز",
      "المطلوب إبراز أوجه الاختلاف بين العنصرين بعبارات مقابلة واضحة.",
      { mode: "closed" }
    );
  }
  if (signals.requiresComparison) {
    return buildTaskProfile(
      "comparison",
      "مقارنة",
      "المطلوب إبراز أوجه الشبه والاختلاف باستعمال عبارات مقارنة واضحة.",
      { mode: "open" }
    );
  }
  if (signals.requiresCritique) {
    return buildTaskProfile(
      "critique",
      "نقد علمي",
      "النقد الجيد يذكر الإيجابيات والسلبيات ثم ينتهي بموقف معلل.",
      { mode: "open" }
    );
  }
  if (signals.requiresValidation) {
    return buildTaskProfile(
      "validation",
      "مصادقة / تحقق",
      "المطلوب استغلال المعطيات ثم تأكيد الفرضية الصحيحة أو نفي الخاطئة صراحة.",
      { mode: "open" }
    );
  }
  if (signals.requiresDiscussion) {
    return buildTaskProfile(
      "discussion",
      "مناقشة علمية",
      "المطلوب تفكيك المعطيات ثم مناقشتها بحجج أو تفسير أو حكم نهائي واضح.",
      { mode: "open" }
    );
  }
  if (signals.requiresCommentary) {
    return buildTaskProfile(
      "commentary",
      "تعليق علمي",
      "التعليق يجمع بين الملاحظة والشرح والوصول إلى نتيجة مرتبطة بالهدف.",
      { mode: "open" }
    );
  }
  if (signals.requiresExtraction) {
    return buildTaskProfile(
      "extraction",
      "استخراج / استنتاج",
      "المطلوب استخراج المعلومة العلمية الصحيحة من السند لا إعادة نسخه حرفياً فقط.",
      { mode: signals.requiresOpenExtraction ? "open" : "closed" }
    );
  }
  if (signals.requiresOpenExplanation) {
    return buildTaskProfile(
      "analysis-explanation",
      "تحليل ثم تفسير",
      "في هذا النوع لا يكفي الشرح المباشر؛ يجب أولاً استغلال الوثيقة أو السند ثم تفسير النتائج والربط بينها.",
      { mode: "open" }
    );
  }
  if (signals.requiresTechniqueWhy) {
    return buildTaskProfile(
      "technique-why",
      "تعليل تقنية",
      "علّل استعمال التقنية أو النظير: لماذا تسمح بقياس أو إثبات المطلوب.",
      { mode: "closed" }
    );
  }
  if (signals.requiresExtraInfo) {
    return buildTaskProfile(
      "extra-info",
      "معلومة إضافية",
      "حدّد ما تضيفه الوثيقة الجديدة دون إعادة الوثيقة الأولى.",
      { mode: "closed" }
    );
  }
  if (signals.requiresGraphBuild) {
    return buildTaskProfile(
      "graph-build",
      "إنجاز منحنى",
      "المنحنى يحتاج محورين بصيغة بدلالة، وعنواناً وسلّماً.",
      { mode: "closed" }
    );
  }
  if (signals.requiresTranslation) {
    return buildTaskProfile(
      "translation",
      "ترجمة إلى مخطط",
      "انقل معطيات السند إلى أسهم أو تسلسل دون درس إضافي.",
      { mode: "closed" }
    );
  }
  if (signals.requiresJustification || signals.requiresImportance) {
    return buildTaskProfile(
      signals.requiresImportance ? "importance" : "justification",
      signals.requiresImportance ? "تحديد أهمية" : "تعليل / تبرير",
      signals.requiresImportance
        ? "المطلوب بيان الأهمية أو الفائدة أو الدور العلمي صراحة لا مجرد تسمية العنصر."
        : "التبرير العلمي يحتاج حججاً من السند ومكتسبات قبلية مع رابطة سببية صريحة.",
      { mode: signals.openInstruction ? "open" : "closed" }
    );
  }
  if (signals.requiresHypothesis) {
    return buildTaskProfile(
      "hypothesis",
      "فرضية علمية",
      "الفرضية يجب أن تكون تفسيرية، معقولة، وقابلة للفحص.",
      { mode: "open" }
    );
  }
  if (poleType === "S") {
    return buildTaskProfile(
      "analysis",
      "تحليل وثيقة",
      "المطلوب تقديم الوثيقة، الملاحظة، المقارنة، ثم الاستنتاج دون تفسير سببي.",
      { mode: "open" }
    );
  }
  if (
    poleType === "E" ||
    signals.requiresCausalChain ||
    signals.requiresMechanismPrecision ||
    signals.requiresOpenReasoning
  ) {
    return buildTaskProfile("explanation", "تفسير / استدلال", "المطلوب شرح سببي وآلية بيولوجية مترابطة.", {
      mode: "open"
    });
  }
  return buildTaskProfile("synthesis", "تركيب / خلاصة", "المطلوب جمع النتائج في خلاصة نهائية واضحة.", {
    mode: "open"
  });
}

export {
  POLE_MARKERS,
  countMarkerHits,
  computeReferenceOverlap,
  extractInformativeTokens,
  aliasesFor,
  inferTaskSignals,
  deriveTaskProfile
};
