/* Methodology scoring for task profiles and N/S/E/W poles. */
import {
  POLE_MARKERS,
  countMarkerHits,
  inferTaskSignals,
  deriveTaskProfile,
  matchConcept
} from "./text-analysis.js";

export function evaluateMethodology(
  text,
  normText,
  poleType,
  structure,
  hits,
  req,
  rule = {},
  taskProfile = null,
  signals = null
) {
  const meta = POLE_MARKERS[poleType] || null;
  const resolvedSignals = signals || inferTaskSignals(rule, poleType);
  const resolvedTaskProfile = taskProfile || deriveTaskProfile(resolvedSignals, poleType);
  const rawHasQuestion = /[؟?]/.test(text) || matchConcept(normText, ["كيف", "ما", "هل"]);
  const hasNumbers = /[0-9٠-٩]/.test(text);
  const usesObservationVerb = matchConcept(normText, [
    "نلاحظ",
    "نسجل",
    "يبين",
    "يوضح",
    "يظهر",
    "نشاهد",
    "نعاين",
    "يمثل",
    "يتبين"
  ]);
  const hasDocumentIntro = matchConcept(normText, [
    "يمثل",
    "تتمثل",
    "الوثيقه",
    "الوثيقة",
    "المنحني",
    "المنحنى",
    "الجدول",
    "الشكل",
    "الصوره",
    "الصورة"
  ]);
  const usesComparison =
    hasNumbers ||
    matchConcept(normText, [
      "بينما",
      "في حين",
      "مقارنه",
      "مقارنة",
      "اكثر",
      "أكثر",
      "اقل",
      "أقل",
      "مقابل",
      "بالتوازي",
      "بالمقابل",
      "يقابله"
    ]);
  const usesConclusion = matchConcept(normText, [
    "استنتاج",
    "نستنتج",
    "مما يدل",
    "يدل",
    "خلاصه",
    "خلاصة",
    "وعليه",
    "اذن",
    "بالتالي",
    "في الختام",
    "يتضح",
    "ومنه"
  ]);
  const usesCausal = matchConcept(normText, [
    "بسبب",
    "يعود",
    "نتيجه",
    "نتيجة",
    "مما يؤدي",
    "يفسر",
    "لذلك",
    "لان",
    "لأن",
    "بما ان",
    "بما أن",
    "راجع الى",
    "راجع إلى"
  ]);
  const usesMechanism = matchConcept(normText, [
    "يرتبط",
    "ترتبط",
    "يتثبت",
    "ينشط",
    "يفعل",
    "يثبط",
    "يمنع",
    "يسمح",
    "يفتح",
    "يغلق",
    "يحرر",
    "ينتج",
    "يتحول",
    "يفرز",
    "ينقسم",
    "يحفز",
    "تحفز",
    "يسد",
    "تسهل",
    "تعطل",
    "تتشكل",
    "تشكل",
    "فسفره",
    "فسفرة",
    "تدفق"
  ]);
  const usesHypothesisRegister = matchConcept(normText, ["فرضيه", "فرضية", "نفترض", "قد", "ربما"]);
  const hasOpening = matchConcept(normText, [
    "يعد",
    "تعد",
    "تعتبر",
    "يتمثل",
    "تتمثل",
    "تلعب",
    "يحدث",
    "تحدث",
    "في البدايه",
    "في البداية"
  ]);
  const hasParagraphBreak = /\r?\n/.test(text);
  const hasListMarkers =
    /[،,؛;:\n]/.test(text) || matchConcept(normText, ["ثم", "تليها", "اخيرا", "أخيرا", "اولا", "أولا"]);
  const hasCategory = matchConcept(normText, [
    "جزيئه",
    "جزيئة",
    "ظاهره",
    "ظاهرة",
    "عضيه",
    "عضية",
    "حمض",
    "بروتين",
    "انزيم",
    "إنزيم",
    "خليه",
    "خلية",
    "بنيه",
    "بنية",
    "مورثه",
    "مورثة",
    "مستقبل",
    "معقد",
    "ريبوزوم"
  ]);
  const hasDescriptor = matchConcept(normText, [
    "يتكون",
    "يتالف",
    "يتألف",
    "يحدث",
    "يتوضع",
    "يوجد",
    "يحمل",
    "يتمثل",
    "يتميز",
    "عباره",
    "عبارة",
    "يحتوي"
  ]);
  const hasRole = matchConcept(normText, [
    "دور",
    "وظيفه",
    "وظيفة",
    "يسمح",
    "ينقل",
    "يثبت",
    "يحفز",
    "مسؤول",
    "يساهم",
    "اهميه",
    "أهمية",
    "ضروري",
    "ضرورية",
    "يفيد"
  ]);
  const hasDifference = matchConcept(normText, [
    "بينما",
    "في حين",
    "اما",
    "أمّا",
    "يختلف",
    "على عكس",
    "بالمقابل",
    "يقابله"
  ]);
  const hasCriterion = matchConcept(normText, ["حسب", "معيار", "فئات", "مجموعات", "انواع", "أنواع"]);
  const hasEvidenceRegister =
    usesObservationVerb ||
    hasDocumentIntro ||
    matchConcept(normText, ["من الوثيقة", "يتبين", "تظهر", "تبين", "نلاحظ"]);
  const hasKnowledgeRegister = matchConcept(normText, [
    "نعلم",
    "بما ان",
    "بما أن",
    "لان",
    "لأن",
    "بحكم",
    "ذلك أن"
  ]);
  const hasValidationJudgement = matchConcept(normText, [
    "صحه",
    "صحة",
    "تثبت",
    "يثبت",
    "تؤكد",
    "يؤكد",
    "تنفي",
    "يفند",
    "مصادقه",
    "مصادقة",
    "مرفوضه",
    "مرفوضة"
  ]);
  const hasPros = matchConcept(normText, ["ايجابيات", "إيجابيات", "محاسن", "فوائد", "مزايا", "يسمح", "يفيد"]);
  const hasCons = matchConcept(normText, [
    "سلبيات",
    "مساوئ",
    "مخاطر",
    "عيوب",
    "لكن",
    "رغم ذلك",
    "غير ان",
    "غير أن"
  ]);
  const hasBalancedJudgement = matchConcept(normText, [
    "لذلك",
    "من الافضل",
    "من الأفضل",
    "ينبغي",
    "يفضل",
    "ولهذا"
  ]);
  const hasRelationPhrase = matchConcept(normText, [
    "العلاقه",
    "العلاقة",
    "كلما",
    "علاقه طرديه",
    "علاقة طردية",
    "علاقه عكسيه",
    "علاقة عكسية",
    "يتناسب",
    "تتناسب",
    "ترتبط"
  ]);
  const mentionsIndependent = matchConcept(normText, ["مستقل", "المستقل"]);
  const mentionsDependent = matchConcept(normText, ["تابع", "التابع"]);
  const strengths = [];
  const missing = [];
  // Chaque branche ne fait que fixer ces deux valeurs : le retour est unique (voir fin de fonction).
  let scoreFallback = 0;
  let summarySource = resolvedTaskProfile.summary;
  let passed = 0;
  let total = 0;

  const check = (ok, okMsg, failMsg) => {
    total += 1;
    if (ok) {
      passed += 1;
      if (okMsg) strengths.push(okMsg);
    } else if (failMsg) {
      missing.push(failMsg);
    }
  };

  if (resolvedTaskProfile.id === "scientific-text") {
    check(
      hasOpening || structure.wordCount >= 12,
      "هناك مدخل أو تمهيد مقبول",
      "مقدمة النص تطرح المشكل بـ ؟ دون الإجابة عنه."
    );
    check(
      !resolvedSignals.requiresQuestion || rawHasQuestion || structure.wordCount >= 15,
      "المشكل أو الفكرة المحورية واضحان",
      "في النص العلمي الأفضل إبراز الإشكالية أو السؤال المحوري بوضوح."
    );
    check(
      structure.connectorHits >= 2 && structure.wordCount >= 12,
      "العرض مترابط وغني بالروابط",
      "العرض ضعيف أو مفكك؛ النص العلمي يحتاج عرضاً مترابطاً لا أفكاراً مبعثرة."
    );
    check(
      usesConclusion || (hasParagraphBreak && structure.wordCount >= 16),
      "الخاتمة أو الحوصلة النهائية حاضرة",
      "الخاتمة تجيب بإيجاز عن المشكل المطروح في المقدمة."
    );
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary;
  } else if (resolvedTaskProfile.id === "naming") {
    check(
      hits > 0 || structure.informativeWords >= 1,
      "تمت تسمية العنصر بمصطلح علمي",
      "المطلوب هنا تسمية العنصر بالاسم العلمي الدقيق، لا شرح عام أو كلام مرسل."
    );
    check(
      structure.wordCount <= 8 || !hasParagraphBreak,
      "الجواب موجز كما يقتضي فعل التسمية",
      "فعل التسمية يتطلب جواباً قصيراً ودقيقاً، لا فقرة مطولة."
    );
    check(
      !usesCausal || structure.wordCount <= 10,
      "لم تُثقِل الجواب بشرح خارج المطلوب",
      "أضفت شرحاً خارج المطلوب؛ في فعل التسمية يكفي الاسم العلمي."
    );
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary;
  } else if (resolvedTaskProfile.id === "definition") {
    check(
      hasCategory,
      "ذكرت ماهية العنصر أو تصنيفه العلمي",
      "في التعريف يجب أن تبدأ بذكر ماهية العنصر: جزيئة، ظاهرة، إنزيم، عضية..."
    );
    check(
      hasDescriptor,
      "أضفت وصفاً علمياً يوضح التعريف",
      "التعريف ما زال ناقصاً: يجب إضافة وصف أو خصائص أساسية للعنصر."
    );
    check(
      hasRole || structure.wordCount >= 10,
      "تم توضيح الدور أو الخاصية الأساسية",
      "التعريف لا يبين الدور أو الفائدة العلمية للعنصر بما يكفي."
    );
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary;
  } else if (resolvedTaskProfile.id === "description") {
    check(
      structure.wordCount >= 8,
      "الجواب أخذ شكل وصف لا مجرد تسمية",
      "الوصف ناقص أو مختزل أكثر من اللازم؛ يجب تفصيل الخصائص أو البنية."
    );
    check(
      hasDescriptor,
      "ذُكرت خصائص أو مميزات واضحة",
      "في الوصف يجب ذكر الخصائص أو المميزات الأساسية لا الاكتفاء بالاسم."
    );
    check(
      hasRole ||
        matchConcept(normText, ["داخل", "خارج", "في", "على", "منطقة", "مقر", "يتوضع", "يوجد"]) ||
        structure.wordCount >= 12,
      "تمت الإشارة إلى المقر أو الدور أو الهيئة",
      "الوصف ما زال سطحياً: أضف المقر أو الدور أو الشكل أو العلاقات البنيوية المهمة."
    );
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary;
  } else if (resolvedTaskProfile.id === "listing") {
    check(
      hits > 0 || structure.wordCount >= 2,
      "تم ذكر عناصر مطلوبة بشكل مباشر",
      "في أفعال الذكر/العدد يجب سرد العناصر المطلوبة مباشرة."
    );
    check(
      hasListMarkers || structure.wordCount <= 12,
      "العناصر معروضة بصيغة سرد أو تعداد",
      "الأفضل في فعل الذكر/العدد أن تعرض العناصر كسرد واضح أو تعداد مرتب."
    );
    check(
      !usesCausal || structure.wordCount >= 10,
      "لم يتحول الجواب إلى تفسير زائد",
      "المطلوب هنا تعداد العناصر، لا فقرة تفسيرية طويلة تشتت الجواب."
    );
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary;
  } else if (resolvedTaskProfile.id === "classification") {
    check(
      hasCriterion || structure.wordCount >= 6,
      "ظهر معيار أو منطق للتصنيف",
      "التصنيف يجب أن يكون وفق معيار واضح: حسب البنية، الوظيفة، المصدر..."
    );
    check(
      hasListMarkers || structure.wordCount >= 6,
      "العناصر وُزعت في مجموعات أو فئات",
      "المطلوب ليس مجرد تعداد؛ بل توزيع العناصر في مجموعات أو أقسام واضحة."
    );
    check(
      structure.wordCount >= 5,
      "التصنيف ليس مبتوراً",
      "التصنيف ناقص جداً ولا يبين الأقسام أو الفئات كما يجب."
    );
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary;
  } else if (resolvedTaskProfile.id === "distinction") {
    // Détecter deux côtés par la présence d'un marqueur de contraste (بينما/
    // في حين/على عكس/مقابل/أما) OU d'au moins deux "et" (و) de coordination
    // séparant des blocs lexicaux distincts ET une longueur minimale. Le
    // simple "و" ou un nombre de mots suffisant n'est pas une preuve fiable
    // (la conjonction و est la plus fréquente en arabe).
    const hasContrastMarker = /(بينما|في حين|على عكس|مقابل|أما|بعكس)/.test(normText);
    const multipleCoordination = (normText.match(/\sو\s/g) || []).length >= 2;
    const hasTwoSides = hasContrastMarker || (multipleCoordination && structure.wordCount >= 12);
    check(
      hasDifference || usesComparison,
      "استُعملت عبارات تمييز أو مقابلة",
      "التمييز يتطلب عبارات صريحة: بينما، في حين، على عكس، بالمقابل..."
    );
    check(
      hasTwoSides,
      "الجواب يتناول العنصرين معاً",
      "الجواب يوحي بطرف واحد فقط؛ فعل التمييز يفرض ذكر العنصرين."
    );
    check(
      structure.wordCount >= 6,
      "تم إبراز الفروق الأساسية",
      "التمييز مختصر جداً ولا يوضح أوجه الاختلاف الكافية."
    );
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary;
  } else if (resolvedTaskProfile.id === "variables") {
    check(
      (mentionsIndependent && mentionsDependent) || hits >= 2 || structure.wordCount >= 4,
      "تم تحديد طرفي الدراسة أو المتغيرين بوضوح",
      "في تحديد المتغيرات يجب تمييز المستقل عن التابع أو ذكر كلا الطرفين بدقة."
    );
    check(
      structure.wordCount <= 18 || hasListMarkers,
      "الجواب مباشر ومركز",
      "سؤال تحديد المتغيرات يحتاج جواباً مباشرًا لا فقرة طويلة مشتتة."
    );
    check(
      !usesCausal || structure.wordCount >= 6,
      "لم ينزلق الجواب إلى تفسير مبكر",
      "بدأت بالتفسير قبل حسم المتغيرات المطلوبة."
    );
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary;
  } else if (resolvedTaskProfile.id === "relation") {
    check(
      hasRelationPhrase || usesComparison || usesCausal,
      "العلاقة صيغت بشكل صريح",
      "عند طلب تحديد العلاقة يجب استعمال صيغة واضحة مثل: كلما...، علاقة طردية/عكسية..."
    );
    check(structure.wordCount >= 5, "العلاقة ليست مبتورة", "العلاقة المقترحة قصيرة أو غامضة أكثر من اللازم.");
    check(
      hasNumbers || hits >= 2 || usesComparison || usesCausal,
      "رُبطت العلاقة بمعطيات أو عنصرين على الأقل",
      "الجواب لا يبرز طرفي العلاقة أو معطياتها بما يكفي."
    );
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary;
  } else if (resolvedTaskProfile.id === "importance") {
    check(hasRole, "ذُكر الدور أو الفائدة العلمية", "تحديد الأهمية يعني ذكر الفائدة أو الدور العلمي صراحة.");
    check(
      usesCausal || matchConcept(normText, ["مما يسمح", "مما يؤدي", "لذلك", "ولهذا"]),
      "رُبطت الأهمية بأثر أو نتيجة",
      "اذكر لماذا تُعد هذه البنية أو الظاهرة مهمة، لا تكتف بالاسم."
    );
    check(
      structure.wordCount >= 4,
      "الجواب كافٍ لتحديد الأهمية",
      "الجواب قصير جداً ولا يحدد الأهمية علمياً."
    );
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary;
  } else if (resolvedTaskProfile.id === "comparison") {
    const hasContrast = matchConcept(normText, [
      "بينما",
      "في حين",
      "يشترك",
      "يتشابه",
      "يختلف",
      "اكبر",
      "أكبر",
      "اقل",
      "أقل",
      "مقابل",
      "بالمقابل",
      "يقابله"
    ]);
    const hasContrastMarker = /(بينما|في حين|على عكس|مقابل|أما|بعكس|كذلك|مثل|يشبه|يتشابه)/.test(normText);
    const multipleCoordination = (normText.match(/\sو\s/g) || []).length >= 2;
    const hasTwoSides = hasContrastMarker || (multipleCoordination && structure.wordCount >= 14);
    check(
      hasContrast || usesComparison,
      "استُعملت عبارات مقارنة صريحة",
      "المقارنة يجب أن تُكتب بألفاظ واضحة: بينما، في حين، يتشابه، يختلف..."
    );
    check(
      hasTwoSides,
      "الجواب يتناول طرفي المقارنة",
      "الجواب يوحي بطرف واحد فقط؛ المقارنة تتطلب عرض الجانبين."
    );
    check(
      structure.wordCount >= 8,
      "المقارنة ليست مبتورة",
      "المقارنة مختصرة زيادة عن اللازم ولا تبرز أوجه الشبه والاختلاف كفاية."
    );
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary;
  } else if (resolvedTaskProfile.id === "justification") {
    check(
      hasEvidenceRegister || hits > 0,
      "استندت إلى معطيات أو ملاحظات من السند",
      "التبرير العلمي يجب أن يستند إلى معطيات أو ملاحظات لا إلى رأي عام فقط."
    );
    check(
      usesCausal || hasKnowledgeRegister,
      "ظهرت رابطة سببية أو معرفة داعمة",
      "في التبرير يجب أن تقول لماذا باستعمال: لأن، بما أن، يعود ذلك إلى..."
    );
    check(structure.wordCount >= 6, "التبرير ليس مبتوراً", "التبرير قصير جداً ولا يبني حجة علمية كافية.");
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary;
  } else if (resolvedTaskProfile.id === "critique") {
    check(
      hasPros,
      "ذكرت جانباً إيجابياً أو منفعة",
      "النقد العلمي لا يكتفي بالرفض؛ اذكر الإيجابيات أو الفوائد أولاً."
    );
    check(hasCons, "ذكرت حدوداً أو سلبيات", "النقد ناقص لأنه لا يبين المخاطر أو السلبيات أو الحدود.");
    check(
      hasBalancedJudgement,
      "أنهيت بموقف معلل أو اقتراح",
      "اختم النقد بموقف علمي معلل: من الأفضل/ينبغي/لذلك..."
    );
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary;
  } else if (resolvedTaskProfile.id === "hypothesis") {
    check(
      (usesHypothesisRegister && !matchConcept(normText, ["ربما"])) || rawHasQuestion || usesCausal,
      "هناك محاولة واضحة لصياغة فرضية",
      "صغ الفرضية بـ «يعود السبب إلى…» دون «ربما» (كتفي 2023)، لا كإجابة مبهمة."
    );
    check(
      usesCausal || usesMechanism,
      "الفرضية ذات طابع تفسيري",
      "الفرضية يجب أن تحمل تفسيراً أولياً للنتيجة أو المشكل، لا مجرد إعادة صياغة السؤال."
    );
    check(structure.wordCount >= 6, "الفرضية مفهومة ومكتملة", "الفرضية قصيرة جداً أو غير مكتملة.");
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary;
  } else if (resolvedTaskProfile.id === "validation") {
    check(
      hasEvidenceRegister || hits > 0,
      "استُعملت معطيات السند في المناقشة",
      "المصادقة على الفرضية لا تكون رأياً عاماً؛ يجب ربطها بمعطيات السند."
    );
    check(
      usesCausal || usesMechanism,
      "ربطت النتائج بسبب أو آلية",
      "المصادقة تتطلب تفسيراً يربط النتائج بالآلية أو السبب."
    );
    check(
      hasValidationJudgement,
      "صدر حكم صريح على الفرضية",
      "اختم المناقشة بحكم صريح: الفرضية صحيحة/مرفوضة/تتأكد."
    );
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary;
  } else if (resolvedTaskProfile.id === "discussion") {
    check(
      hasDocumentIntro || hasEvidenceRegister || hits > 0,
      "انطلقت المناقشة من معطيات السند",
      "المناقشة العلمية يجب أن تُبنى على معطيات السند لا على رأي عام."
    );
    check(
      usesObservationVerb || usesComparison || hits > 0,
      "المناقشة تضمنت تفكيكاً للمعطيات",
      "ينقص الجواب استغلال فعلي للوثيقة: ملاحظة/مقارنة/استخراج."
    );
    check(
      usesCausal || hasPros || hasCons || hasValidationJudgement,
      "المناقشة لم تبق وصفية فقط",
      "المناقشة الجيدة تحتاج تفسيراً أو مفاضلة أو حكماً على الفرضية/الفكرة."
    );
    check(
      usesConclusion || hasBalancedJudgement || hasValidationJudgement,
      "أنهيت المناقشة بحكم أو خلاصة",
      "اختم المناقشة بحكم واضح أو نتيجة نهائية مرتبطة بالسؤال."
    );
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary;
  } else if (resolvedTaskProfile.id === "commentary") {
    check(hasDocumentIntro, "بدأت بتحديد السند أو الوثيقة", "التعليق المنهجي يبدأ بتعريف الوثيقة أو السند.");
    check(
      usesObservationVerb,
      "قدمت ملاحظات واضحة من السند",
      "في التعليق يجب أولاً تسجيل الملاحظات والمعطيات الظاهرة."
    );
    check(
      usesCausal || usesMechanism || usesComparison || hits > 0,
      "أرفقت الملاحظة بشرح أو تفسير",
      "التعليق لا يكتفي بالملاحظة؛ يجب إضافة شرح علمي مدعوم بالمكتسبات."
    );
    check(
      hasRelationPhrase || usesConclusion || structure.wordCount >= 8,
      "ربطت المعطيات بخلاصة مفهومة",
      "التعليق ما زال تجميع ملاحظات فقط؛ اربطها باستنتاج أو خلاصة واضحة."
    );
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary;
  } else if (resolvedTaskProfile.id === "extraction") {
    const openExtraction =
      resolvedSignals.requiresOpenExtraction || resolvedSignals.openInstruction || resolvedSignals.docDriven;
    if (openExtraction) {
      check(
        hasDocumentIntro || usesObservationVerb || hasEvidenceRegister,
        "استندت إلى الوثيقة أو السند",
        "في الاستخراج المفتوح يجب أولاً استغلال السند أو الإحالة عليه."
      );
      check(
        hits > 0 || usesConclusion || hasRelationPhrase,
        "المعلومة المستخرجة ظاهرة في الجواب",
        "الجواب عام جداً ولا يبرز المعلومة المستخرجة بوضوح."
      );
      check(
        usesConclusion || structure.wordCount >= 6,
        "الجواب انتهى بنتيجة مستخلصة",
        "ينقص الجواب تصريح نهائي بالمعلومة المستخلصة: نستنتج أن..."
      );
      check(
        !resolvedSignals.requiresCausalChain || usesCausal || usesMechanism || structure.wordCount >= 8,
        "تم تجاوز مجرد النسخ إلى بناء معنى",
        "في هذا النوع من الاستخراج لا يكفي نسخ ألفاظ من السند؛ يجب بناء معنى علمي واضح."
      );
    } else {
      check(
        hits > 0 || structure.wordCount >= 2,
        "تم استخراج المعلومة المطلوبة",
        "ينقص الجواب المعلومة الأساسية المستخرجة من السند."
      );
      check(structure.wordCount >= 2, "الجواب ليس مبتوراً", "الاستخراج مباشر لكنه ناقص أو مبهم جداً.");
    }
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary;
  } else if (resolvedTaskProfile.id === "extra-info") {
    check(
      hits > 0 || usesComparison || usesConclusion,
      "ظهرت المعلومة الجديدة",
      "حدّد ما تضيفه الوثيقة الثانية ولم يكن في الأولى."
    );
    check(
      hasDocumentIntro || usesObservationVerb || hasEvidenceRegister,
      "أحلت على السند",
      "اربط المعلومة الإضافية بالوثيقة التي جاءت منها."
    );
    check(structure.wordCount >= 5, "الجواب ليس مبتوراً", "المعلومة الإضافية قصيرة أو عامة جداً.");
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary;
  } else if (resolvedTaskProfile.id === "graph-build") {
    check(
      matchConcept(normText, ["بدلاله", "بدلالة"]) || hasDocumentIntro,
      "ذُكرت المحاور أو صيغة بدلالة",
      "المنحنى يحتاج محورين بصيغة: تغيرات … بدلالة …"
    );
    check(
      matchConcept(normText, ["عنوان", "سلم", "وحده", "وحدة"]) || structure.wordCount >= 8,
      "ذُكر العنوان أو السلم",
      "أضف عنواناً يعبّر عن العلاقة وسلّماً ووحدات."
    );
    check(
      !usesCausal || structure.wordCount >= 10,
      "لم يتحول الرسم إلى تفسير",
      "إنجاز المنحنى وصف إحداثيات، لا تفسير سببي."
    );
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary;
  } else if (resolvedTaskProfile.id === "translation") {
    check(
      /→|->|=>|⟶/.test(text) || matchConcept(normText, ["ثم", "يليها"]),
      "نُقلت المعلومة إلى أسهم أو تسلسل",
      "الترجمة إلى مخطط تحتاج أسهماً أو «ثم»."
    );
    check(hits > 0, "العناصر العلمية حاضرة", "المخطط يجب أن يحمل نفس عناصر السند لا درساً جديداً.");
    check(structure.wordCount <= 40 || hasListMarkers, "المخطط موجز", "لا تحوّل المخطط إلى فقرة درس إضافية.");
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary;
  } else if (resolvedTaskProfile.id === "technique-why") {
    check(
      hasRole || usesCausal || hasKnowledgeRegister,
      "ظهر تعليل استعمال التقنية",
      "علّل لماذا هذه التقنية/النظير: لأنها تسمح بـ …"
    );
    check(hits > 0 || hasEvidenceRegister, "رُبطت التقنية بالنتيجة", "اربط التقنية بما تقيسه أو ما تثبته.");
    check(structure.wordCount >= 6, "التعليل كافٍ", "تعليل التقنية قصير جداً.");
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary;
  } else if (resolvedTaskProfile.id === "analysis-explanation") {
    check(
      hasDocumentIntro || hasEvidenceRegister,
      "بدأت باستغلال الوثيقة أو السند",
      "عند وضح/بين/اشرح في تعليمة مفتوحة، لا تبدأ بالتفسير مباشرة؛ ابدأ بتقديم السند أو الوثيقة."
    );
    check(
      usesObservationVerb || usesComparison || hits > 0,
      "مررت أولاً عبر الملاحظة أو التحليل",
      "الجواب قفز إلى الشرح دون المرور بتحليل أولي للمعطيات أو الملاحظات."
    );
    check(
      usesCausal,
      "التفسير السببي حاضر",
      "بعد التحليل يجب الانتقال إلى تفسير سببي صريح: لأن، يعود ذلك إلى، مما يؤدي إلى..."
    );
    check(
      usesMechanism || countMarkerHits(normText, meta?.secondary || []) > 0,
      "تمت الإشارة إلى عناصر الآلية",
      "الشرح ما زال عاماً؛ اذكر عناصر الآلية أو الوسائط البيولوجية المتدخلة."
    );
    check(
      usesConclusion || hasRelationPhrase || structure.wordCount >= 10,
      "انتهى الجواب بخلاصة أو ربط واضح",
      "أنهِ الجواب بربط النتيجة أو الآلية المستخلصة بدل تركه مجرد شرح مبتور."
    );
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary;
  } else if (!meta) {
    check(
      structure.hasConnectors || resolvedTaskProfile.toleratesShortAnswer,
      "الصياغة مناسبة لنوع المهمة",
      "الصياغة ما زالت جافة وتحتاج قدراً أوضح من التنظيم أو الربط العلمي."
    );
    check(
      structure.wordCount >= (resolvedTaskProfile.toleratesShortAnswer ? 1 : 7),
      "الجواب ليس مبتوراً",
      resolvedTaskProfile.toleratesShortAnswer
        ? "الجواب قصير جداً حتى بالنسبة لمهمة مختصرة."
        : "الجواب قصير أكثر من اللازم"
    );
    scoreFallback = 0.35;
    summarySource = resolvedTaskProfile.summary;
  } else if (poleType === "N") {
    check(
      !resolvedSignals.requiresQuestion || rawHasQuestion,
      "تمت صياغة المشكل في هيئة سؤال أو تساؤل واضح",
      "يجب صياغة الإشكالية أو المشكل العلمي بصيغة سؤال واضح."
    );
    check(
      hits >= 2 || countMarkerHits(normText, meta.secondary) > 0,
      "ذُكرت عناصر المشكلة أو المتغيرات الأساسية",
      "المشكل مطروح بطريقة عامة جداً وينقصه تحديد العناصر أو المتغيرات."
    );
    if (resolvedSignals.requiresVariables) {
      check(
        (mentionsIndependent && mentionsDependent) || structure.wordCount >= 4,
        "تم التمييز بين عناصر الدراسة أو متغيراتها",
        "بما أن المطلوب شمل المتغيرات، يجب تمييز طرفي الدراسة أو عناصرها بدقة."
      );
    }
    check(structure.wordCount >= 8, "الصياغة ليست مبتورة", "المشكل قصير ومشوّش؛ يجب أن يكون أوضح وأدق.");
    if (resolvedSignals.requiresHypothesis) {
      check(
        (usesHypothesisRegister && !matchConcept(normText, ["ربما"])) || usesCausal,
        "هناك محاولة لصياغة فرضية تفسيرية",
        "إذا طُلبت فرضية، فيجب أن تظهر كاقتراح تفسيري قابل للفحص لا كعبارة عامة فارغة."
      );
    }
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary || meta.summary;
  } else if (poleType === "S") {
    check(
      !resolvedSignals.requiresDocumentIntro || hasDocumentIntro,
      "بدأت الجواب بتقديم ما تمثله الوثيقة أو السند",
      "ابدأ بـ: تمثل الوثيقة منحنى/جدولاً لتغيرات … بدلالة …"
    );
    check(
      !resolvedSignals.requiresObservationVerb || usesObservationVerb,
      "استُعملت أفعال الملاحظة والتحليل",
      "التحليل يجب أن يستعمل لغة الملاحظة: نلاحظ، نسجل، يبين، يوضح..."
    );
    check(
      !resolvedSignals.requiresComparison || usesComparison || countMarkerHits(normText, meta.secondary) > 0,
      "الجواب يتضمن مقارنة أو اتجاهاً أو قيمة",
      "صف المجالات (تزايد/تناقص/ثبات) والقيم أو المقارنة بالتوازي."
    );
    check(usesConclusion, "الاستنتاج الصريح حاضر", "أنهِ التحليل باستنتاج صريح: مما يدل / نستنتج أن...");
    if (!resolvedSignals.allowsCausalTerms) {
      check(
        !usesCausal,
        "حافظت على التحليل دون القفز إلى التفسير",
        "التفسير السببي (لأن / يعود إلى) يُؤجَّل إلى قطب الربط؛ التحليل يصف ثم يستنتج فقط."
      );
    }
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary || meta.summary;
  } else if (poleType === "E") {
    const mechanismHits = countMarkerHits(normText, meta.secondary);
    check(
      !resolvedSignals.requiresCausalChain ||
        usesCausal ||
        mechanismHits >= 1 ||
        (usesMechanism && structure.connectorHits >= 2),
      "الربط السببي حاضر",
      "التفسير يحتاج سببية واضحة أو تتبعاً آلياً صريحاً: يعود ذلك إلى / نتيجة / مما يؤدي إلى... أو سلسلة آلية واضحة."
    );
    check(
      mechanismHits >= 2 || (usesMechanism && hits >= 2),
      "ذُكرت عناصر الآلية البيولوجية",
      "الجواب يذكر نتيجة عامة دون آلية دقيقة أو وسائط بيولوجية كافية."
    );
    check(
      structure.connectorHits >= 2 && structure.wordCount >= 12,
      "السلسلة التفسيرية مترابطة",
      "التفسير يحتاج تسلسلاً أوضح للأحداث، لا جملة واحدة مبهمة أو مختصرة جداً."
    );
    if (resolvedSignals.requiresHypothesis || resolvedSignals.requiresValidation) {
      check(
        hasValidationJudgement || matchConcept(normText, ["الفرضيه", "الفرضية"]),
        "تم ربط التفسير بالفرضية أو الحكم عليها",
        "إذا كان السؤال مرتبطاً بفرضية، فيجب أن تربط تفسيرك بصحتها أو رفضها."
      );
    }
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary || meta.summary;
  } else {
    check(
      countMarkerHits(normText, meta.primary) > 0,
      "الخلاصة أو الحكم النهائي حاضر",
      "الخلاصة النهائية غير واضحة أو غير صريحة."
    );
    check(
      countMarkerHits(normText, meta.secondary) > 0 || hits >= Math.max(2, req),
      "تم تجميع النتائج في حكم نهائي",
      "التركيب ما زال ناقصاً ولا يجمع الفكرة النهائية."
    );
    check(
      structure.wordCount >= 8 && structure.hasConnectors,
      "الصياغة النهائية متماسكة",
      "الخلاصة تحتاج جملة علمية أشد تماسكاً."
    );
    scoreFallback = 0;
    summarySource = resolvedTaskProfile.summary || meta.summary;
  }

  return {
    score: total ? passed / total : scoreFallback,
    strengths,
    missing,
    summary: summarySource,
    taskType: resolvedTaskProfile.id,
    taskLabel: resolvedTaskProfile.label,
    taskMode: resolvedTaskProfile.mode
  };
}

export function getPoleWeights(poleType, taskProfile = null) {
  if (["naming", "variables"].includes(taskProfile?.id))
    return { content: 0.88, methodology: 0.08, richness: 0.04 };
  if (taskProfile?.id === "listing") return { content: 0.82, methodology: 0.12, richness: 0.06 };
  if (
    ["classification", "distinction", "definition", "description", "relation", "importance"].includes(
      taskProfile?.id
    )
  ) {
    return { content: 0.72, methodology: 0.18, richness: 0.1 };
  }
  if (taskProfile?.id === "scientific-text") return { content: 0.4, methodology: 0.4, richness: 0.2 };
  if (
    [
      "validation",
      "commentary",
      "justification",
      "critique",
      "discussion",
      "extraction",
      "analysis-explanation"
    ].includes(taskProfile?.id)
  ) {
    return { content: 0.45, methodology: 0.4, richness: 0.15 };
  }

  switch (poleType) {
    case "S":
      return { content: 0.55, methodology: 0.3, richness: 0.15 };
    case "E":
      return { content: 0.6, methodology: 0.3, richness: 0.1 };
    case "W":
      return { content: 0.55, methodology: 0.3, richness: 0.15 };
    case "N":
      return { content: 0.6, methodology: 0.25, richness: 0.15 };
    default:
      return { content: 0.65, methodology: 0.2, richness: 0.15 };
  }
}
