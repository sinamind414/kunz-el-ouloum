/* ============================================================
   METHOD SCRIPTS — canevas issus des guides BAC (إكرام / كتفي)
   ------------------------------------------------------------
   Diagnostic pédagogique uniquement : n'altère pas les checks
   de evaluateMethodology (barèmes existants inchangés).
   En cas de conflit sur la hypothèse : on suit كتفي 2023
   (تجنّب «ربما» — صياغة «يعود السبب إلى»).
   ============================================================ */

import { normalizeArabic } from "../data/subjects.js";

export const METHOD_SCRIPTS = {
  analysis: {
    title: "تحليل وثيقة",
    steps: [
      "عرّف السند: تمثل الوثيقة منحنى/جدولاً لتغيرات … بدلالة …",
      "صف المجالات: تزايد / تناقص / ثبات مع القيم الحدية",
      "أبرز علاقة سطحية (كلما…) دون تفسير سببي",
      "اختتم: ومنه نستنتج أن…"
    ]
  },
  extraction: {
    title: "استخراج / استنتاج",
    steps: [
      "أحِل على الوثيقة أو المعطى",
      "استخرج: رقم + وحدة + اتجاه التغيّر («يرتفع من 2 إلى 8 mg/L بين 0 و 10 min»)",
      "استخرج المعلومة العلمية لا تنسخ السند حرفياً",
      "صرّح بالنتيجة: نستنتج أن…"
    ]
  },
  commentary: {
    title: "تعليق علمي",
    steps: [
      "قدّم الوثيقة",
      "سجّل الملاحظات الظاهرة",
      "أرفق شرحاً بمكتسباتك (علق = لاحظ + فسّر)",
      "اربط باستنتاج يخدم هدف التمرين"
    ]
  },
  comparison: {
    title: "مقارنة",
    steps: ["حدّد طرفي المقارنة", "أوجه الشبه", "أوجه الاختلاف بعبارات: بينما / في حين", "خلاصة قصيرة"]
  },
  explanation: {
    title: "تفسير / استدلال",
    steps: [
      "انطلق من الملاحظة المستخرجة",
      "رتّب السلسلة السببية: ملاحظة → آلية دقيقة → نتيجة",
      "تحقّق من كل رابط سببي قبل كتابة الخاتمة"
    ]
  },
  "analysis-explanation": {
    title: "تحليل ثم تفسير",
    steps: ["قدّم السند ولاحظ", "ثم فسّر بسلسلة سببية", "اختم بربط النتيجة بالسؤال"]
  },
  hypothesis: {
    title: "فرضية علمية",
    steps: [
      "صغها تفسيرية موجزة: يعود السبب إلى…",
      "تجنّب ربما / لعل / قد (كتفي 2023)",
      "قابلة للفحص وليست شرحاً كاملاً"
    ]
  },
  problem: {
    title: "طرح مشكل علمي",
    steps: ["حدّد الظاهرة والمتغيرات", "صغ سؤالاً واضحاً بعلامة ؟", "لا تُجِب عن المشكل في هذه المرحلة"]
  },
  "scientific-text": {
    title: "نص علمي",
    steps: [
      "مقدمة: اطرح المشكل بـ ؟ دون الإجابة",
      "عرض منظم (عناصر أو عناوين)",
      "خاتمة تجيب بإيجاز عن المشكل"
    ]
  },
  justification: {
    title: "تعليل / تبرير",
    steps: ["حجة من السند", "مكتسب قبلي", "رابطة سببية: لأن / بما أن / يعود إلى"]
  },
  critique: {
    title: "نقد علمي",
    steps: ["الإيجابيات أو الفوائد", "الحدود أو السلبيات", "موقف معلل: لذلك / من الأفضل"]
  },
  validation: {
    title: "مصادقة / تحقق",
    steps: ["استغل معطيات السند", "اربط بالآلية", "حكم صريح: الفرضية صحيحة / مرفوضة"]
  },
  discussion: {
    title: "مناقشة علمية",
    steps: ["فكّك المعطيات", "حجج أو تفسير", "حكم أو خلاصة نهائية"]
  },
  relation: {
    title: "تحديد علاقة",
    steps: ["صيغة صريحة: كلما… / علاقة طردية أو عكسية", "اربط بطرفي العلاقة أو بالقيم"]
  },
  naming: {
    title: "تسمية / تعرّف",
    steps: ["الاسم العلمي الدقيق فقط، دون شرح زائد"]
  },
  listing: {
    title: "ذكر / تعداد",
    steps: [
      "قائمة مرقمة، عنصر في كل سطر، بلا جُمَل",
      "العدد المطلوب في السؤال هو فحصك الأخير: «اذكر ثلاث…» = 3 أسطر لا أكثر"
    ]
  },
  variables: {
    title: "تحديد متغيرات",
    steps: ["المستقل = ما يغيّره المجرّب", "التابع = ما يُقاس"]
  },
  definition: {
    title: "تعريف علمي",
    steps: [
      "الانتماء: ما هو؟ (بروتين، هرمون، ظاهرة…)",
      "الخاصية المميزة + الدور إن وُجد — كلمة علمية واحدة على الأقل",
      "لا خاتمة هنا: التعريف الكامل = الانتماء + الخاصية (+ الدور)"
    ]
  },
  description: {
    title: "وصف علمي",
    steps: ["الخصائص أو البنية أو المقر بتفصيل أوضح من التعريف"]
  },
  classification: {
    title: "تصنيف",
    steps: ["معيار واضح", "توزيع العناصر في مجموعات"]
  },
  distinction: {
    title: "تمييز",
    steps: ["أبرز الفروق بعبارات مقابلة: بينما / على عكس"]
  },
  importance: {
    title: "تحديد أهمية",
    steps: ["الدور أو الفائدة صراحة", "اربطها بأثر أو نتيجة"]
  },
  synthesis: {
    title: "تركيب / خلاصة",
    steps: ["اجمع النتائج", "أجِب عن المشكل المطروح في N"]
  },
  "extra-info": {
    title: "معلومة إضافية",
    steps: ["ما لم يكن في الوثيقة الأولى", "صرّح بالإضافة دون إعادة السند السابق"]
  },
  "graph-build": {
    title: "إنجاز منحنى",
    steps: ["محوران بصيغة بدلالة", "عنوان + سلم + وحدات"]
  },
  translation: {
    title: "ترجمة إلى مخطط",
    steps: ["أسهم أو «ثم»", "نفس عناصر السند فقط"]
  },
  "technique-why": {
    title: "تعليل تقنية",
    steps: ["سمّ التقنية", "لماذا تسمح بالقياس أو الإثبات"]
  }
};

const POLE_FALLBACK = {
  N: "problem",
  S: "analysis",
  E: "explanation",
  W: "synthesis"
};

export function scriptFor(taskId, poleType) {
  return METHOD_SCRIPTS[taskId] || METHOD_SCRIPTS[POLE_FALLBACK[poleType]] || null;
}

function hasAny(norm, terms) {
  return terms.some((term) => norm.includes(normalizeArabic(term)));
}

export function evaluateMethodCoach({
  text = "",
  norm = "",
  poleType = "",
  taskId = "",
  wordCount = 0
} = {}) {
  const resolvedNorm = norm || normalizeArabic(text);
  const tips = [];
  const flags = [];
  const script = scriptFor(taskId, poleType);

  const analysisLike =
    taskId === "analysis" ||
    (poleType === "S" && !["commentary", "discussion", "extraction"].includes(taskId));
  if (analysisLike) {
    if (/يرتفع المنحني|ينخفض المنحني|ينزل المنحني|المنحني يرتفع|المنحني ينخفض/.test(resolvedNorm)) {
      tips.push("صف تغيّر الظاهرة لا حركة المنحنى: قل «تزايد عدد…» لا «يرتفع المنحنى».");
      flags.push("curve-motion");
    }
    if (hasAny(resolvedNorm, ["هذا يدل"]) && !hasAny(resolvedNorm, ["مما يدل"])) {
      tips.push("«هذا يدل» في التحليل تقترب من التفسير؛ اترك الدلالة السطحية (كلما…) ثم استنتج فقط.");
      flags.push("early-interpretation");
    }
    if (
      hasAny(resolvedNorm, ["منحنى", "منحني"]) &&
      !hasAny(resolvedNorm, ["تزايد", "تناقص", "ثبات", "انعدام", "قيمة قصوى", "قيمة دنيا", "بدلالة"])
    ) {
      tips.push("حلّل المنحنى بمجالات (تزايد / تناقص / ثبات) واذكر القيم الحدية وصيغة «بدلالة».");
      flags.push("curve-domains");
    }
    if (hasAny(resolvedNorm, ["كلما"])) flags.push("surface-relation");
    if (
      hasAny(resolvedNorm, [
        "تزايد سريع",
        "تزايد تدريجي",
        "تزايد بطيء",
        "تناقص حاد",
        "تناقص بطيء",
        "حتى تنعدم"
      ])
    ) {
      flags.push("intensity-vocab");
    }
  }

  if (taskId === "hypothesis" || (poleType === "N" && hasAny(normalizeArabic(text), ["فرضية", "فرضيه"]))) {
    if (hasAny(resolvedNorm, ["ربما", "لعل"])) {
      tips.push("حسب كتفي 2023: تجنّب «ربما / لعل»؛ صغ الفرضية بـ «يعود السبب إلى…» دون شرح كامل.");
      flags.push("maybe-word");
    }
    if (wordCount > 42) {
      tips.push("الفرضية موجزة وقابلة للفحص، وليست تفسيراً كاملاً للآلية.");
      flags.push("hypothesis-too-long");
    }
  }

  if (taskId === "scientific-text") {
    if (!/[؟?]/.test(text)) {
      tips.push("مقدمة النص العلمي تطرح المشكل بعلامة استفهام ولا تجيب عنه.");
      flags.push("missing-question");
    }
    if (!hasAny(resolvedNorm, ["خاتمه", "خاتمة", "نستنتج", "خلاصه", "خلاصة", "وعليه", "اذن"])) {
      tips.push("اختم النص بجواب موجز عن المشكل المطروح في المقدمة.");
      flags.push("missing-closing");
    }
  }

  if (taskId === "comparison") {
    const sim = hasAny(resolvedNorm, ["يشترك", "يتشابه", "كلاهما", "نفس"]);
    const diff = hasAny(resolvedNorm, ["يختلف", "بينما", "في حين", "على عكس"]);
    if (diff && !sim) {
      tips.push("المقارنة الكاملة تجمع أوجه الشبه ثم أوجه الاختلاف.");
      flags.push("comparison-one-sided");
    }
  }

  if (
    taskId === "explanation" &&
    wordCount > 0 &&
    !hasAny(resolvedNorm, [
      "بسبب",
      "يعود",
      "نتيجه",
      "نتيجة",
      "مما يؤدي",
      "لذلك",
      "لان",
      "لأن",
      "يرتبط",
      "يثبط",
      "ينشط",
      "يحفز",
      "يتثبت"
    ])
  ) {
    tips.push("التفسير يبدأ من الملاحظة ثم السلسلة: يعود ذلك إلى → آلية → نتيجة.");
    flags.push("no-causal");
  }

  if (taskId === "explanation" || taskId === "analysis-explanation") {
    if (
      hasAny(resolvedNorm, ["نوعي", "مكمل", "موقع فعال"]) &&
      !hasAny(resolvedNorm, ["يعود", "مما يؤدي", "يرتبط", "يثبط", "ينشط"])
    ) {
      tips.push("المصطلح النوعي وحده لا يكفي؛ اربطه بموقع الارتباط أو التكامل البنيوي.");
      flags.push("specificity-without-fit");
    }
    if (
      wordCount > 8 &&
      !hasAny(resolvedNorm, ["موقع", "مستقبل", "انزيم", "قناه", "قناة", "رامزه", "كودون", "رسول"])
    ) {
      tips.push("انزل إلى المستوى الجزيئي: موقع، مستقبل، إنزيم… لا تبقَ عند الظاهرة العامة.");
      flags.push("shallow-level");
    }
  }

  if (
    taskId === "commentary" &&
    hasAny(resolvedNorm, ["نلاحظ", "يبين"]) &&
    !hasAny(resolvedNorm, ["بسبب", "يعود", "راجع", "لان", "لأن"])
  ) {
    tips.push("التعليق يجمع الملاحظة والشرح بمكتسباتك ثم الاستنتاج المرتبط بالهدف.");
    flags.push("commentary-no-explain");
  }

  if (taskId === "justification" && !hasAny(resolvedNorm, ["لان", "لأن", "بما ان", "بما أن", "يعود"])) {
    tips.push("برّر بحجة من السند ومكتسب قبلي مرتبطين بـ لأن / بما أن.");
    flags.push("justification-no-link");
  }

  return { tips, flags, script };
}
