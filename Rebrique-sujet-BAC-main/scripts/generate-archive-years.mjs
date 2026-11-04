/* One-shot generator for the lazy data/years/se/year-2013..2019.js payloads. */
import { mkdirSync, writeFileSync } from "node:fs";

const DANGER = /[<>&`"]/;
function check(s, path) {
  if (typeof s !== "string") return;
  if (DANGER.test(s)) throw new Error(`caractère interdit dans ${path}: ${s.slice(0, 80)}`);
}

function P({
  points,
  prompt,
  bacPrompt,
  notes,
  placeholder,
  minLength,
  modelAnswer,
  keywords,
  minHits,
  forbidden = [],
  extra = {}
}) {
  for (const [k, v] of Object.entries({ prompt, bacPrompt, notes, placeholder, modelAnswer })) {
    check(v, k);
  }
  for (const k of keywords.flat()) check(String(k), "keyword");
  return {
    points,
    prompt,
    bacPrompt,
    notes,
    placeholder,
    minLength,
    modelAnswer,
    keywords,
    minHits,
    forbidden,
    extra
  };
}

function poles5(n, s, e, w) {
  return {
    N: {
      ...n,
      points: 1,
      minLength: n.minLength ?? 40,
      minHits: n.minHits ?? 2,
      forbidden: n.forbidden ?? []
    },
    S: {
      ...s,
      points: 1,
      minLength: s.minLength ?? 40,
      minHits: s.minHits ?? 2,
      forbidden: s.forbidden ?? ["بسبب"]
    },
    E: {
      ...e,
      points: 2,
      minLength: e.minLength ?? 120,
      minHits: e.minHits ?? 3,
      forbidden: e.forbidden ?? []
    },
    W: {
      ...w,
      points: 1,
      minLength: w.minLength ?? 40,
      minHits: w.minHits ?? 2,
      forbidden: w.forbidden ?? []
    }
  };
}
function poles7(n, s, e, w) {
  return {
    N: {
      ...n,
      points: 1,
      minLength: n.minLength ?? 40,
      minHits: n.minHits ?? 2,
      forbidden: n.forbidden ?? []
    },
    S: {
      ...s,
      points: 2.5,
      minLength: s.minLength ?? 90,
      minHits: s.minHits ?? 2,
      forbidden: s.forbidden ?? ["بسبب"]
    },
    E: {
      ...e,
      points: 2.5,
      minLength: e.minLength ?? 110,
      minHits: e.minHits ?? 3,
      forbidden: e.forbidden ?? []
    },
    W: {
      ...w,
      points: 1,
      minLength: w.minLength ?? 40,
      minHits: w.minHits ?? 2,
      forbidden: w.forbidden ?? []
    }
  };
}
function poles8(n, s, e, w) {
  return {
    N: {
      ...n,
      points: 0.5,
      minLength: n.minLength ?? 30,
      minHits: n.minHits ?? 2,
      forbidden: n.forbidden ?? []
    },
    S: {
      ...s,
      points: 2,
      minLength: s.minLength ?? 60,
      minHits: s.minHits ?? 2,
      forbidden: s.forbidden ?? ["بسبب"]
    },
    E: {
      ...e,
      points: 4,
      minLength: e.minLength ?? 110,
      minHits: e.minHits ?? 3,
      forbidden: e.forbidden ?? []
    },
    W: {
      ...w,
      points: 1.5,
      minLength: w.minLength ?? 40,
      minHits: w.minHits ?? 2,
      forbidden: w.forbidden ?? []
    }
  };
}

const NOTE_OCR =
  "Couche texte dzexams bruitée ou inversée, relue le 2026-08-30. Wording reconstructed, non certifiable official. Pas de question autonome de cadrage pour N/W quand la consigne officielle est unique.";
const NOTE_SEC =
  "Thème recoupé sur des sources secondaires et le programme 3AS, sans relecture visuelle d un PDF ministériel dans cette session. Wording reconstructed, non certifiable official. À confronter au PDF dzexams avant toute utilisation comme énoncé.";

function ex(number, label, max, desc, poles) {
  check(label, "label");
  check(desc, "desc");
  return { number, ui: "text", label, max, desc, poles };
}

const PAGES = {
  2020: {
    page: "https://www.dzexams.com/ar/annales/SUFqL0VzRjNzdmd6ek1EekpsOTFMdz09",
    pdf: "https://www.dzexams.com/uploads/sujets/officiels/bac/2020/dzexams-bac-sciences-2356016.pdf"
  },
  2019: {
    page: "https://www.dzexams.com/ar/annales/OHlmRldmdmdDVUNVRHBadTE5em0vdz09",
    pdf: "https://www.dzexams.com/uploads/sujets/officiels/bac/2019/dzexams-bac-sciences-3051478.pdf"
  },
  2018: {
    page: "https://www.dzexams.com/ar/annales/RGZmd0lTRW0xNmZTRUFjR0F5QzMwZz09",
    pdf: "https://www.dzexams.com/ar/annales/RGZmd0lTRW0xNmZTRUFjR0F5QzMwZz09"
  },
  2017: {
    page: "https://www.dzexams.com/ar/annales/dFRNWk1JWkt2aC8vdFZtZVNMWGRwZz09",
    pdf: "https://www.dzexams.com/uploads/sujets/officiels/bac/2017/dzexams-bac-sciences-2581269.pdf"
  },
  2016: {
    page: "https://www.dzexams.com/ar/annales/M09NK2ZYVHFzQXg3KzZHazBaTk5IUT09",
    pdf: "https://www.dzexams.com/ar/annales/M09NK2ZYVHFzQXg3KzZHazBaTk5IUT09"
  },
  2015: {
    page: "https://www.dzexams.com/ar/annales/aTlRWGREbDN3Qit2cVdRaHNmK0FYQT09",
    pdf: "https://www.dzexams.com/uploads/sujets/officiels/bac/2015/dzexams-bac-sciences-5906014.pdf"
  },
  2014: {
    page: "https://www.dzexams.com/ar/annales/SzdNaHlPbThvaEhSSUJjWDRsdUljdz09",
    pdf: "https://www.dzexams.com/uploads/sujets/officiels/bac/2014/dzexams-bac-sciences-4380238.pdf"
  },
  2013: {
    page: "https://www.dzexams.com/ar/annales/bjdJbVBZMHFKeUZTcExKSEw4REVNQT09",
    pdf: "https://www.dzexams.com/uploads/sujets/officiels/bac/2013/dzexams-bac-sciences-4463279.pdf"
  }
};

function yearMeta(id, theme, extraNote) {
  const src = PAGES[id];
  const pdfNote = `PDF non redistribué dans le dépôt. Page dzexams : ${src.page}. ${extraNote}`;
  check(pdfNote, "pdfNote");
  return { id, theme, pdfUrl: src.pdf, pdfNote };
}

const YEARS = [];

function pushYear(id, theme, extraNote, s1, s2) {
  YEARS.push({ meta: yearMeta(id, theme, extraNote), s1, s2 });
}

/* -------------------- 2020 (S1 OCR, S2 incomplet) -------------------- */
pushYear(
  "2020",
  "indigo",
  "Sujet 1 : thèmes relus sur la couche texte dzexams (OCR bruité, 2026-08-30). Sujet 2 : couche texte incomplète ; thèmes pédagogiques du programme, non certifiables.",
  [
    ex(
      1,
      "البنية الداخلية للكرة الأرضية",
      5,
      "استغلال المعطيات الزلزالية لمعرفة بنية وخصائص الكرة الأرضية رغم أن أعمق نقطة لا تتعدى 12 كيلومترا",
      poles5(
        {
          prompt: "تأطير الإشكالية: كيف كشفت المعطيات الزلزالية البنية الداخلية للكرة الأرضية؟",
          bacPrompt: "كيف تم استغلال المعطيات الزلزالية لمعرفة البنية الداخلية للكرة الأرضية؟",
          notes: NOTE_OCR,
          placeholder: "صياغة المشكل العلمي...",
          modelAnswer:
            "المشكل العلمي: كيف تسمح المعطيات الزلزالية بمعرفة البنية الداخلية للكرة الأرضية وحالة الأوساط والصخور المميزة رغم استحالة الوصول المباشر؟",
          keywords: ["زلزاليه", "بنيه", "ارض"]
        },
        {
          prompt: "ملء الجدول: الحالة الفيزيائية والصخر الاندساسي واسم الانقطاع",
          bacPrompt: "انقل الجدول على ورقة إجابتك ثم املأ الخانات وفق التعليمات المطلوبة.",
          notes: NOTE_OCR,
          placeholder: "صلب، لدن، سائل، غرانيت، بازلت، انقطاع موهو...",
          modelAnswer:
            "نحدد الحالة الفيزيائية للأوساط: القشرة صلبة، الرداء العلوي لدن في جزء منه، النواة الخارجية سائلة. الصخور الاندساسية المميزة: غرانيت في القشرة القارية وبازلت في القشرة المحيطية. الانقطاعات: موهو بين القشرة والرداء، وغوتنبرغ بين الرداء والنواة.",
          keywords: ["صلب", "سائل", "انقطاع", "موهو"]
        },
        {
          prompt: "نص علمي: كيف كشفت المعطيات الزلزالية البنية الداخلية",
          bacPrompt:
            "بيّن في نص علمي كيف تم استغلال المعطيات الزلزالية لمعرفة البنية الداخلية للكرة الأرضية اعتمادا على معلوماتك.",
          notes: NOTE_OCR,
          placeholder: "مقدمة، عرض، خاتمة...",
          modelAnswer:
            "تنتشر الموجات الزلزالية بسرعات مختلفة حسب طبيعة الأوساط. يتغير مسارها عند الانقطاعات فيظهر انعكاس وانكسار، ويختفي بعض الموجات في منطقة الظل، مما يدل على وسط سائل في النواة الخارجية. ومن تغير السرعة والحالة الفيزيائية والصخور المميزة تُبنى صورة طبقية للكرة الأرضية.",
          keywords: ["موجات", "انقطاع", "نواه", "سرعه", "ظل"]
        },
        {
          prompt: "الخاتمة: حدود الاستغلال المباشر وضرورة الزلازل",
          bacPrompt: "لماذا تبقى المعطيات الزلزالية ضرورية لمعرفة باطن الأرض؟",
          notes: NOTE_OCR,
          placeholder: "في الختام...",
          modelAnswer:
            "في الختام، يتعذر الحفر المباشر إلى الأعماق، فتبقى الموجات الزلزالية الوسيلة الأساسية لكشف تتابع الأوساط والانقطاعات داخل الكرة الأرضية.",
          keywords: ["زلزاليه", "اعماق", "انقطاع"]
        }
      )
    ),
    ex(
      2,
      "أنزيما Cox وإيبوبروفان وسلكوكزيب",
      7,
      "التأثير النوعي للأنزيم عبر الموقع الفعال، وأنزيما Cox-1 وCox-2، ودور إيبوبروفان وسلكوكزيب والأعراض الجانبية",
      poles7(
        {
          prompt: "تأطير الإشكالية: كيف يُستغل الموقع الفعال لإنتاج دواء أقل أعراضا جانبية؟",
          bacPrompt: "كيف استغل الخبراء خاصية الموقع الفعال لإنتاج دواء ناجع بأعراض جانبية محدودة؟",
          notes: NOTE_OCR,
          placeholder: "صياغة المشكل العلمي...",
          modelAnswer:
            "المشكل العلمي: كيف يرتبط إيبوبروفان وأنزيما Cox-1 وCox-2 بالموقع الفعال، وكيف يقلل سلكوكزيب الأعراض الجانبية؟",
          keywords: ["cox", "موقع", "فعال", "دواء"]
        },
        {
          prompt: "تحليل مخطط نشاط Cox-1 وCox-2 وجدول IC50 لإيبوبروفان",
          bacPrompt: "حلّل مخطط الشكل أ من الوثيقة 1 ثم وضّح دور دواء إيبوبروفان مبرزا أعراضه الجانبية.",
          notes: NOTE_OCR,
          placeholder: "قارن نشاط الأنزيمين وتركيز إيبوبروفان...",
          modelAnswer:
            "تمثل الوثيقة مخطط نشاط أنزيمي Cox-1 وCox-2 وتركيز إيبوبروفان اللازم لخفض النشاط إلى النصف. نلاحظ أن إيبوبروفان يخفض نشاط الأنزيمين معا، وأن تركيزه اللازم لـ Cox-1 أقل مما هو لـ Cox-2، ومنه نستنتج تثبيطا غير انتقائي يفسر الأعراض الجانبية.",
          keywords: ["cox", "ايبوبروفان", "نشاط", "تركيز"],
          extra: {
            document: {
              kind: "table",
              axes: ["نشاط", "تركيز"],
              comparisons: [["Cox-1", "Cox-2"]],
              cells: [["ايبوبروفان", "نشاط"]],
              values: [],
              strictValues: false
            }
          }
        },
        {
          prompt: "تفسير تأثير إيبوبروفان وسلكوكزيب على الموقع الفعال",
          bacPrompt:
            "علل تأثير الأنزيمين على نفس الركيزة وتأثير إيبوبروفان عليهما، ثم فسّر منحنى نشاط سلكوكزيب.",
          notes: NOTE_OCR,
          placeholder: "حمض أراشيدونيك، موقع فعال، سلكوكزيب...",
          modelAnswer:
            "يعود تأثير الأنزيمين على حمض الأراشيدونيك إلى تشابه جزء من الموقع الفعال. يثبت إيبوبروفان على الموقعين فيثبط Cox-1 وCox-2 معا. أما سلكوكزيب فيرتبط تفضيليا بـ Cox-2 فينخفض نشاطه بينما يبقى Cox-1 تقريبا وظيفيا، فتقل الأعراض الجانبية.",
          keywords: ["موقع", "فعال", "ايبوبروفان", "سلكوكزيب", "cox"]
        },
        {
          prompt: "اقتراح حل لتخفيف الأعراض الجانبية",
          bacPrompt: "اقترح حلا يبيّن كيفية تخفيف الأعراض الجانبية للأدوية التي تستهدف النشاط الأنزيمي.",
          notes: NOTE_OCR,
          placeholder: "في الختام...",
          modelAnswer:
            "في الختام، يُختار دواء انتقائي اتجاه Cox-2 مثل سلكوكزيب حتى يُحفظ نشاط Cox-1 المسؤول عن حماية الغشاء المخاطي فتخف الأعراض الجانبية.",
          keywords: ["انتقائي", "cox", "اعراض"]
        }
      )
    ),
    ex(
      3,
      "الأجسام المضادة وHer2 وسرطان الثدي",
      8,
      "تدخل الأجسام المضادة في القضاء على سرطان الثدي عبر البروتين الغشائي Her2 كعلاج مناعي",
      poles8(
        {
          prompt: "اقتراح فرضية حول آلية القضاء على خلايا سرطان الثدي",
          bacPrompt: "كيف تتدخل الأجسام المضادة في القضاء على سرطان الثدي؟",
          notes: NOTE_OCR,
          placeholder: "الفرضية...",
          modelAnswer:
            "الفرضية: ترتبط أجسام مضادة نوعية بالبروتين الغشائي Her2 على الخلايا السرطانية فتوقف تكاثرها وتسهّل تخريبها.",
          keywords: ["فرضيه", "her2", "مضاده"]
        },
        {
          prompt: "استغلال كمية Her2 وعدد الخلايا السرطانية بعد الحضن",
          bacPrompt:
            "استغل الشكل أ من الوثيقة: كمية البروتين الغشائي Her2 عند خليتين سرطانيتين وعدد الخلايا بعد سبعة أيام من الحضن.",
          notes: NOTE_OCR,
          placeholder: "قارن الخلايا A وB...",
          modelAnswer:
            "تمثل الوثيقة كمية البروتين Her2 وعدد الخلايا السرطانية بعد الحضن. نلاحظ عند الخلايا A المأخوذة من ثدي مصاب كمية Her2 أعلى وعددا أكبر بعد سبعة أيام مقارنة بالخلايا B، ومنه نستنتج ارتباط التكاثر بارتفاع Her2.",
          keywords: ["her2", "خلايا", "سرطانيه", "كميه"],
          extra: {
            document: {
              kind: "table",
              axes: ["كميه", "عدد"],
              comparisons: [["A", "B"]],
              cells: [["her2", "خلايا"]],
              values: [],
              strictValues: false
            }
          }
        },
        {
          prompt: "تفسير آلية العلاج المناعي ضد Her2",
          bacPrompt: "فسّر كيف تسمح الأجسام المضادة النوعية بالقضاء على خلايا سرطان الثدي الحاملة لـ Her2.",
          notes: NOTE_OCR,
          placeholder: "ارتباط، تكاثر، تخريب...",
          modelAnswer:
            "يعود ذلك إلى تثبيت الجسم المضاد النوعي على Her2 فيُحجب مستقبل النمو ويتوقف التكاثر، كما يُعلَّم الغشاء فتتدخل خلايا مناعية تخرب الخلية السرطانية. العلاج المناعي يستغل هذه النوعية.",
          keywords: ["مضاد", "her2", "تكاثر", "سرطانيه", "مناعي"]
        },
        {
          prompt: "مخطط مسار العلاج المناعي",
          bacPrompt: "لخّص في مخطط كيف يقضي الجسم المضاد على الخلية السرطانية الحاملة لـ Her2.",
          notes: NOTE_OCR,
          placeholder: "Her2 → جسم مضاد → توقف التكاثر...",
          modelAnswer:
            "عنوان المخطط: علاج مناعي ضد Her2. Her2 على الغشاء → جسم مضاد نوعي → حجب مستقبل النمو → توقف التكاثر → تخريب الخلية السرطانية.",
          keywords: ["مخطط", "her2", "مضاد"],
          extra: { schema: { arrows: true, title: "Her2", ordered: ["her2", "مضاد", "تكاثر"] } }
        }
      )
    )
  ],
  [
    ex(
      1,
      "الشفرة الوراثية وتركيب البروتين",
      5,
      "علاقة تتابع النوكليوتيدات في ARNm بترتيب الأحماض الأمينية أثناء الترجمة — موضوع 2 غير مكتمل في طبقة النص",
      poles5(
        {
          prompt: "تأطير الإشكالية: كيف تُترجم معلومة ARNm إلى بروتين؟",
          bacPrompt: "كيف تُترجم المعلومة الوراثية المحمولة على ARNm إلى متتالية أحماض أمينية؟",
          notes: NOTE_SEC,
          placeholder: "صياغة المشكل العلمي...",
          modelAnswer:
            "المشكل العلمي: كيف يفرض تتابع نوكليوتيدات ARNm ترتيب الأحماض الأمينية أثناء الترجمة في الهيولى؟",
          keywords: ["ARNm", "ترجمه", "احماض"]
        },
        {
          prompt: "ذكر العناصر المتدخلة في الترجمة",
          bacPrompt: "اذكر العناصر المتدخلة في حدوث الترجمة.",
          notes: NOTE_SEC,
          placeholder: "ريبوزوم، ARNt...",
          modelAnswer: "العناصر المتدخلة: ARNm، الريبوزوم، ARNt، الأحماض الأمينية المنشطة، طاقة ATP.",
          keywords: ["ريبوزوم", "ARNt", "ARNm"]
        },
        {
          prompt: "نص علمي حول خطوات الترجمة",
          bacPrompt: "اشرح في نص علمي خطوات الترجمة من البداية إلى النهاية.",
          notes: NOTE_SEC,
          placeholder: "بداية، استطالة، نهاية...",
          modelAnswer:
            "ترتبط تحت الوحدة الصغرى بـ ARNm ثم يثبت ARNt الحامل للميثيونين على رامزة الانطلاق، فتستطيل السلسلة بروابط بيبتيدية وفق الرامزات حتى رامزة التوقف فينفصل متعدد الببتيد.",
          keywords: ["رامزه", "استطاله", "توقف", "ريبوزوم", "ARNt"]
        },
        {
          prompt: "الخاتمة: نتيجة توقف الترجمة",
          bacPrompt: "ما نتيجة غياب أحد عناصر الترجمة على تركيب البروتين؟",
          notes: NOTE_SEC,
          placeholder: "في الختام...",
          modelAnswer: "في الختام، بغياب ريبوزوم أو ARNt أو طاقة يتوقف تركيب البروتين الوظيفي.",
          keywords: ["ترجمه", "بروتين", "يتوقف"]
        }
      )
    ),
    ex(
      2,
      "النقل المشبكي والمبلغ العصبي",
      7,
      "آلية النقل المشبكي الكيميائي ودور المبلغ العصبي — موضوع 2 غير مكتمل في طبقة النص",
      poles7(
        {
          prompt: "تأطير الإشكالية: كيف تنتقل الرسالة عبر المشبك الكيميائي؟",
          bacPrompt: "كيف تنتقل الرسالة العصبية من خلية قبل مشبكية إلى خلية بعد مشبكية؟",
          notes: NOTE_SEC,
          placeholder: "صياغة المشكل العلمي...",
          modelAnswer:
            "المشكل العلمي: كيف يحرَّر المبلغ العصبي في الشق المشبكي فيولّد جهدا بعد مشبكي على الغشاء التالي؟",
          keywords: ["مشبك", "مبلغ", "عصبي"]
        },
        {
          prompt: "تحليل تسجيلات قبل وبعد المشبك",
          bacPrompt: "حلّل التسجيلات المحصل عليها قبل المشبك وبعده.",
          notes: NOTE_SEC,
          placeholder: "كمون عمل، PPSE...",
          modelAnswer:
            "تمثل الوثيقة تسجيلات الكمون بدلالة الزمن قبل المشبك وبعده. نلاحظ كمون عمل في الغشاء قبل المشبكي وجهدا بعد مشبكي تنبيهيا على الغشاء التالي بعد تأخير مشبكي، ومنه نستنتج انتقالا كيميائيا عبر المبلغ.",
          keywords: ["كمون", "مشبكي", "تسجيل"],
          extra: {
            document: {
              kind: "curve",
              axes: ["كمون", "زمن"],
              comparisons: [["قبل", "بعد"]],
              trends: [{ about: "بعد", expect: ["كمون", "مشبكي"] }],
              values: [],
              strictValues: false
            }
          }
        },
        {
          prompt: "شرح آلية تحرير المبلغ العصبي",
          bacPrompt: "اشرح آلية تحرير المبلغ العصبي وتوليد الجهد بعد المشبكي.",
          notes: NOTE_SEC,
          placeholder: "كالسيوم، حويصلات، مستقبل...",
          modelAnswer:
            "يدخل Ca²⁺ إلى النهاية قبل المشبكية فتهاجر الحويصلات ويتحرر المبلغ في الشق، فيثبت على مستقبل بعد مشبكي فتنفتح قنوات شاردية ويتولد جهد بعد مشبكي.",
          keywords: ["كالسيوم", "حويصلات", "مستقبل", "مبلغ", "قناه"]
        },
        {
          prompt: "الخاتمة: طبيعة المشبك",
          bacPrompt: "ما طبيعة هذا المشبك انطلاقا من وجود تأخير ومبلغ كيميائي؟",
          notes: NOTE_SEC,
          placeholder: "في الختام...",
          modelAnswer: "في الختام، وجود تأخير مشبكي ومبلغ كيميائي يدل على مشبك كيميائي لا كهربائي.",
          keywords: ["مشبك", "كيميائي", "مبلغ"]
        }
      )
    ),
    ex(
      3,
      "الفسفرة التأكسدية وATP",
      8,
      "آلية تشكل ATP على مستوى الغشاء الداخلي للميتوكوندري — موضوع 2 غير مكتمل في طبقة النص",
      poles8(
        {
          prompt: "اقتراح فرضية حول مصدر ATP في الميتوكوندري",
          bacPrompt: "اقترح فرضية حول آلية تشكل ATP في الميتوكوندري.",
          notes: NOTE_SEC,
          placeholder: "الفرضية...",
          modelAnswer: "الفرضية: ينشأ تدرج بروتونات عبر الغشاء الداخلي فتمر H⁺ عبر ATP سنتاز فيتشكل ATP.",
          keywords: ["فرضيه", "ATP", "بروتون"]
        },
        {
          prompt: "استغلال استهلاك O2 وإنتاج ATP",
          bacPrompt: "استغل تغيرات استهلاك O2 وإنتاج ATP في وجود نواقل مرجعة.",
          notes: NOTE_SEC,
          placeholder: "O2، NADH، ATP...",
          modelAnswer:
            "تمثل الوثيقة استهلاك O2 وإنتاج ATP بدلالة الزمن. نلاحظ انخفاض O2 وارتفاع ATP بعد إضافة نواقل مرجعة، ومنه نستنتج اقتران أكسدة النواقل بفسفرة ADP.",
          keywords: ["اكسجين", "ATP", "نواقل"],
          extra: {
            document: {
              kind: "curve",
              axes: ["ATP", "زمن"],
              comparisons: [["O2", "ATP"]],
              trends: [{ about: "ATP", expect: ["ارتفاع", "ATP"] }],
              values: [],
              strictValues: false
            }
          }
        },
        {
          prompt: "شرح السلسلة التنفسية وتشكل ATP",
          bacPrompt: "اشرح كيف تؤدي أكسدة النواقل إلى تشكل ATP عبر السلسلة التنفسية.",
          notes: NOTE_SEC,
          placeholder: "إلكترونات، بروتونات، ATP سنتاز...",
          modelAnswer:
            "تتأكسد النواقل فتنتقل الإلكترونات في السلسلة التنفسية نحو O2، وتُضخ البروتونات إلى الفراغ بين الغشاءين، ثم تعود عبر ATP سنتاز فيتشكل ATP.",
          keywords: ["سلسله", "الكترون", "بروتون", "ATP", "اكسجين"]
        },
        {
          prompt: "مخطط تحويل الطاقة",
          bacPrompt: "لخّص في مخطط تحويل الطاقة الكيميائية الكامنة إلى ATP.",
          notes: NOTE_SEC,
          placeholder: "نواقل → سلسلة → تدرج H⁺ → ATP...",
          modelAnswer:
            "عنوان المخطط: فسفرة تأكسدية. نواقل مرجعة → سلسلة تنفسية → تدرج بروتونات → ATP سنتاز → ATP.",
          keywords: ["مخطط", "ATP", "بروتون"],
          extra: { schema: { arrows: true, title: "ATP", ordered: ["نواقل", "بروتون", "ATP"] } }
        }
      )
    )
  ]
);

/* -------------------- 2019 -------------------- */
pushYear(
  "2019",
  "amber",
  "PDF dzexams محمي بكلمة مرور في العارض. Thèmes reconstruits pédagogiquement, non certifiables.",
  [
    ex(
      1,
      "الاستنساخ وتركيب ARNm",
      5,
      "آلية الاستنساخ ودور إنزيم ARN بوليميراز في تركيب ARNm",
      poles5(
        {
          prompt: "تأطير الإشكالية: كيف يُستنسخ ARNm من ADN؟",
          bacPrompt: "كيف يتم استنساخ المعلومة الوراثية من ADN إلى ARNm؟",
          notes: NOTE_SEC,
          placeholder: "صياغة المشكل العلمي...",
          modelAnswer: "المشكل العلمي: كيف يقرأ ARN بوليميراز السلسلة الناسخة فيركب ARNm مكملا؟",
          keywords: ["استنساخ", "ARNm", "بوليميراز"]
        },
        {
          prompt: "تعرف على مراحل الاستنساخ",
          bacPrompt: "تعرّف على مراحل الاستنساخ: بداية واستطالة ونهاية.",
          notes: NOTE_SEC,
          placeholder: "بداية، استطالة، نهاية...",
          modelAnswer:
            "البداية: يرتبط ARN بوليميراز ببداية المورثة ويفتح السلسلتين. الاستطالة: يقرأ السلسلة الناسخة ويربط نوكليوتيدات مكملة. النهاية: يصل إلى نهاية المورثة فينفصل ARNm.",
          keywords: ["بدايه", "استطاله", "نهايه"]
        },
        {
          prompt: "نص علمي حول الاستنساخ",
          bacPrompt: "اشرح في نص علمي آلية الاستنساخ داخل النواة.",
          notes: NOTE_SEC,
          placeholder: "مقدمة، عرض، خاتمة...",
          modelAnswer:
            "في النواة يرتبط ARN بوليميراز بالمورثة ويكسر الروابط الهيدروجينية، ثم يركب ARNm وفق تتابع السلسلة الناسخة حتى نهاية المورثة فينفصل الجزيء حاملا المعلومة إلى الهيولى.",
          keywords: ["نواه", "بوليميراز", "ARNm", "ناسخه", "هيولي"]
        },
        {
          prompt: "الخاتمة: مصير ARNm",
          bacPrompt: "ما مصير ARNm بعد نهاية الاستنساخ؟",
          notes: NOTE_SEC,
          placeholder: "في الختام...",
          modelAnswer: "في الختام، ينتقل ARNm إلى الهيولى ليُترجم إلى بروتين ثم يُهدم بعد استعماله.",
          keywords: ["ARNm", "هيولي", "ترجمه"]
        }
      )
    ),
    ex(
      2,
      "الموقع الفعال والتخصص الإنزيمي",
      7,
      "العلاقة بين بنية الموقع الفعال ومادة التفاعل وتأثير درجة الحرارة وpH",
      poles7(
        {
          prompt: "تأطير الإشكالية: ما أصل التخصص الإنزيمي؟",
          bacPrompt: "كيف تضمن البنية الفراغية للإنزيم تخصصه الوظيفي؟",
          notes: NOTE_SEC,
          placeholder: "صياغة المشكل العلمي...",
          modelAnswer:
            "المشكل العلمي: كيف يتكامل الموقع الفعال مع مادة التفاعل فيحدد التخصص، وكيف تؤثر الحرارة وpH؟",
          keywords: ["موقع", "فعال", "تخصص"]
        },
        {
          prompt: "تحليل تغيرات السرعة بدلالة pH والحرارة",
          bacPrompt: "حلّل تغيرات السرعة الابتدائية بدلالة pH ودرجة الحرارة.",
          notes: NOTE_SEC,
          placeholder: "درجة مثلى، انخفاض على الطرفين...",
          modelAnswer:
            "نلاحظ سرعة أعظمية عند درجة pH وحرارة مثلى، بينما تنخفض السرعة في الطرفين، ومنه نستنتج وجود ظروف مثلى للنشاط الإنزيمي.",
          keywords: ["سرعه", "حراره", "نشاط"],
          extra: {
            document: {
              kind: "curve",
              axes: ["سرعه", "PH"],
              comparisons: [["مثلى", "طرف"]],
              trends: [{ about: "مثلى", expect: ["اعظميه", "سرعه"] }],
              values: [],
              strictValues: false
            }
          }
        },
        {
          prompt: "تفسير تأثير pH والحرارة على الموقع الفعال",
          bacPrompt: "فسّر تأثير تغير pH وارتفاع الحرارة على الموقع الفعال.",
          notes: NOTE_SEC,
          placeholder: "شحنات، تشوه، تخريب...",
          modelAnswer:
            "يغيّر pH شحنات الأحماض الأمينية في الموقع الفعال فيضعف التكامل مع الركيزة. وارتفاع الحرارة يخرب البنية الفراغية فيفقد الإنزيم تخصصه.",
          keywords: ["موقع", "فعال", "شحنات", "بنيه", "تخريب"]
        },
        {
          prompt: "الخاتمة: شروط النشاط",
          bacPrompt: "ما الشروط التي تحفظ النشاط الإنزيمي؟",
          notes: NOTE_SEC,
          placeholder: "في الختام...",
          modelAnswer:
            "في الختام، يحفظ النشاط عند pH وحرارة قريبين من الوسط الخلوي حتى يبقى الموقع الفعال متكاملا.",
          keywords: ["نشاط", "موقع", "خلوي"]
        }
      )
    ),
    ex(
      3,
      "الاستجابة المناعية النوعية",
      8,
      "تعرف نوعي على المستضد وتدخل LB وLT في الاستجابة الفاعلة",
      poles8(
        {
          prompt: "اقتراح فرضيتين حول آلية القضاء على المستضد",
          bacPrompt: "اقترح فرضيتين حول آلية الاستجابة المناعية النوعية ضد مستضد.",
          notes: NOTE_SEC,
          placeholder: "فرضية 1، فرضية 2...",
          modelAnswer:
            "الفرضية 1: تستجيب LB بإنتاج أجسام مضادة نوعية. الفرضية 2: تستجيب LTc بتخريب الخلايا المصابة.",
          keywords: ["فرضيه", "مستضد", "مضاده"],
          extra: { hypotheses: { min: 2, distinct: true } }
        },
        {
          prompt: "استغلال نتائج حقن المستضد",
          bacPrompt: "استغل تطور كمية الأجسام المضادة وعدد LTc بعد حقن المستضد.",
          notes: NOTE_SEC,
          placeholder: "طور كموني ثم ارتفاع...",
          modelAnswer:
            "تمثل الوثيقة كمية الأجسام المضادة وعدد LTc بدلالة الزمن. نلاحظ بعد الحقن طورا كمونيا ثم ارتفاع كمية الأجسام المضادة وعدد LTc، ومنه نستنتج استجابة نوعية خلطية وخلوية.",
          keywords: ["اجسام", "مضاده", "LTc"],
          extra: {
            document: {
              kind: "curve",
              axes: ["كميه", "زمن"],
              comparisons: [["مضاده", "LTc"]],
              trends: [{ about: "مضاده", expect: ["ارتفاع", "كميه"] }],
              values: [],
              strictValues: false
            }
          }
        },
        {
          prompt: "تفسير التعاون المناعي",
          bacPrompt: "فسّر دور LT4 في التعاون بين الاستجابة الخلطية والخلوية.",
          notes: NOTE_SEC,
          placeholder: "إنترلوكينات، تكاثر، تمايز...",
          modelAnswer:
            "تتعرف LT4 على الببتيد المعروض مع CMH II فتفرز إنترلوكينات تحفّز تكاثر LB وتمايزها إلى بلاسموسيت وتكاثر LTc، فتتأكد الفرضيتان بالتعاون المناعي.",
          keywords: ["LT4", "انترلوكين", "LB", "LTc", "تعاون"]
        },
        {
          prompt: "مخطط الاستجابة النوعية",
          bacPrompt: "لخّص في مخطط مسار الاستجابة المناعية النوعية.",
          notes: NOTE_SEC,
          placeholder: "مستضد → LT4 → LB/LTc...",
          modelAnswer:
            "عنوان المخطط: استجابة نوعية. مستضد → عرض على CMH → LT4 → إنترلوكينات → أجسام مضادة وتخريب خلوي.",
          keywords: ["مخطط", "مستضد", "LT4"],
          extra: { schema: { arrows: true, title: "استجابة نوعية", ordered: ["مستضد", "LT4", "مضاده"] } }
        }
      )
    )
  ],
  [
    ex(
      1,
      "كمون العمل والقنوات الفولطية",
      5,
      "دور قنوات Na⁺ وK⁺ الفولطية في توليد كمون العمل",
      poles5(
        {
          prompt: "تأطير الإشكالية: كيف يتولد كمون العمل؟",
          bacPrompt: "كيف تتدخل القنوات الفولطية في توليد كمون العمل؟",
          notes: NOTE_SEC,
          placeholder: "صياغة المشكل العلمي...",
          modelAnswer: "المشكل العلمي: كيف يؤدي تتابع انفتاح قنوات Na⁺ ثم K⁺ الفولطية إلى كمون العمل؟",
          keywords: ["كمون", "عمل", "قنوات"]
        },
        {
          prompt: "تعرف على أطوار كمون العمل",
          bacPrompt: "سمّ أطوار كمون العمل والشوارد المتدخلة في كل طور.",
          notes: NOTE_SEC,
          placeholder: "زوال استقطاب، عودة استقطاب...",
          modelAnswer:
            "زوال الاستقطاب بدخول Na⁺ عبر قنوات فولطية، ثم عودة الاستقطاب بخروج K⁺، يليه فرط استقطاب عابر قبل العودة إلى كمون الراحة.",
          keywords: ["استقطاب", "صوديوم", "بوتاسيوم"]
        },
        {
          prompt: "نص علمي حول آلية كمون العمل",
          bacPrompt: "اشرح في نص علمي آلية توليد كمون العمل على غشاء العصبون.",
          notes: NOTE_SEC,
          placeholder: "عتبة، قنوات فولطية...",
          modelAnswer:
            "عند بلوغ العتبة تنفتح قنوات Na⁺ الفولطية فيدخل الصوديوم ويزول الاستقطاب، ثم تنفتح قنوات K⁺ فيخرج البوتاسيوم وتعود القطبية، فينتشر كمون العمل على طول الليف.",
          keywords: ["عتبه", "قنوات", "صوديوم", "بوتاسيوم", "ليف"]
        },
        {
          prompt: "الخاتمة: قابلية التنبيه",
          bacPrompt: "ما شرط قابلية تنبيه الليف العصبي؟",
          notes: NOTE_SEC,
          placeholder: "في الختام...",
          modelAnswer: "في الختام، تبقى قابلية التنبيه مرتبطة بوجود كمون راحة وقنوات فولطية وظيفية.",
          keywords: ["تنبيه", "كمون", "قنوات"]
        }
      )
    ),
    ex(
      2,
      "التنفس الخلوي والحصيلة الطاقوية",
      7,
      "مراحل هدم الغلوكوز في وجود O2 وحصيلة ATP",
      poles7(
        {
          prompt: "تأطير الإشكالية: كيف تُحوَّل طاقة الغلوكوز إلى ATP؟",
          bacPrompt: "كيف تُحوَّل الطاقة الكيميائية الكامنة في الغلوكوز إلى ATP في وجود O2؟",
          notes: NOTE_SEC,
          placeholder: "صياغة المشكل العلمي...",
          modelAnswer: "المشكل العلمي: كيف تتكامل التحلل السكري وحلقة كريبس والفسفرة التأكسدية لإنتاج ATP؟",
          keywords: ["غلوكوز", "ATP", "تنفس"]
        },
        {
          prompt: "تحليل استهلاك O2 وإنتاج CO2 وATP",
          bacPrompt: "حلّل تغيرات O2 وCO2 وATP خلال التنفس.",
          notes: NOTE_SEC,
          placeholder: "انخفاض O2، ارتفاع CO2 وATP...",
          modelAnswer:
            "تمثل الوثيقة تغيرات الأكسجين وATP بدلالة الزمن. نلاحظ انخفاض O2 وارتفاع CO2 وATP في وجود الغلوكوز، ومنه نستنتج أكسدة الغلوكوز المقترنة بإنتاج طاقة قابلة للاستعمال.",
          keywords: ["اكسجين", "ATP", "غلوكوز"],
          extra: {
            document: {
              kind: "curve",
              axes: ["اكسجين", "زمن"],
              comparisons: [["O2", "ATP"]],
              trends: [{ about: "ATP", expect: ["ارتفاع", "ATP"] }],
              values: [],
              strictValues: false
            }
          }
        },
        {
          prompt: "شرح مراحل التنفس",
          bacPrompt: "اشرح مراحل هدم الغلوكوز في وجود الأكسجين.",
          notes: NOTE_SEC,
          placeholder: "تحلل سكري، كريبس، سلسلة تنفسية...",
          modelAnswer:
            "يتحلل الغلوكوز في الهيولى إلى حمض بيروفيك، ثم تتأكسد في المادة الأساسية للميتوكوندري داخل حلقة كريبس، وتُؤكسَد النواقل في السلسلة التنفسية فينتج ATP وماء.",
          keywords: ["تحلل", "كريبس", "سلسله", "بيروفيك", "ATP"]
        },
        {
          prompt: "الخاتمة: أهمية O2",
          bacPrompt: "ما دور O2 في استمرار إنتاج ATP؟",
          notes: NOTE_SEC,
          placeholder: "في الختام...",
          modelAnswer: "في الختام، يستقبل O2 الإلكترونات في نهاية السلسلة فيستمر تدرج البروتونات وتشكل ATP.",
          keywords: ["اكسجين", "ATP", "الكترون"]
        }
      )
    ),
    ex(
      3,
      "التكتونية العامة للصفائح",
      8,
      "حركة الصفائح وعلاقتها بالظهرة المحيطية وآلية الحمل الحراري",
      poles8(
        {
          prompt: "اقتراح فرضية حول محرك الصفائح",
          bacPrompt: "اقترح فرضية حول الآلية المحركة للصفائح التكتونية.",
          notes: NOTE_SEC,
          placeholder: "الفرضية...",
          modelAnswer: "الفرضية: تيارات الحمل الحراري في الرداء تحرك الصفائح عند الظهرة والمناطق الهابطة.",
          keywords: ["فرضيه", "صفائح", "حمل"]
        },
        {
          prompt: "استغلال أعمار البازلت وتدفق الحرارة",
          bacPrompt: "استغل توزع أعمار البازلت وتدفق الحرارة على جانبي الظهرة.",
          notes: NOTE_SEC,
          placeholder: "العمر يزداد بالابتعاد عن الظهرة...",
          modelAnswer:
            "تمثل الوثيقة عمر البازلت وتدفق الحرارة بدلالة المسافة. نلاحظ عند الظهرة حرارة أعلى وعمرا أصغر، بينما عند الطرف يزداد العمر وتنخفض الحرارة، ومنه نستنتج توسعا محيطيا.",
          keywords: ["ظهره", "بازلت", "حراره"],
          extra: {
            document: {
              kind: "table",
              axes: ["عمر", "مسافه"],
              comparisons: [["ظهره", "طرف"]],
              cells: [["بازلت", "حراره"]],
              values: [],
              strictValues: false
            }
          }
        },
        {
          prompt: "تفسير محرك الصفائح",
          bacPrompt: "فسّر كيف تحرك تيارات الحمل الصفائح التكتونية.",
          notes: NOTE_SEC,
          placeholder: "صعود مادة ساخنة، غوص...",
          modelAnswer:
            "تصعد مادة ساخنة قليلة الكثافة عند الظهرة فتتكون قشرة جديدة، وتهبط الصفيحة الباردة في مناطق الغوص، فتتأكد فرضية الحمل الحراري كمحرك.",
          keywords: ["حمل", "ظهره", "غوص", "صفائح", "رداء"]
        },
        {
          prompt: "مخطط دورة الصفيحة",
          bacPrompt: "لخّص في مخطط دورة المادة من الظهرة إلى منطقة الغوص.",
          notes: NOTE_SEC,
          placeholder: "ظهرة → صفيحة → غوص...",
          modelAnswer: "عنوان المخطط: دورة تكتونية. ظهرة → صفائح → غوص.",
          keywords: ["مخطط", "ظهره", "غوص"],
          extra: { schema: { arrows: true, title: "تكتونية", ordered: ["ظهره", "صفائح", "غوص"] } }
        }
      )
    )
  ]
);

/* -------------------- 2018 OCR -------------------- */
pushYear(
  "2018",
  "emerald",
  "Thèmes relus sur la couche texte dzexams (OCR inversé, 2026-08-30). Wording reconstructed.",
  [
    ex(
      1,
      "البروتينات الغشائية والرسالة العصبية",
      5,
      "بروتينات أغشية الخلايا العصبية المتدخلة في توليد وانتشار الرسالة العصبية وآلية دمجها على العصبون المحرك",
      poles5(
        {
          prompt: "تأطير الإشكالية: كيف تؤمن البروتينات الغشائية نقل الرسالة العصبية ودمجها؟",
          bacPrompt: "كيف تتدخل البروتينات الغشائية في توليد وانتشار الرسالة العصبية ودمجها؟",
          notes: NOTE_OCR,
          placeholder: "صياغة المشكل العلمي...",
          modelAnswer:
            "المشكل العلمي: كيف تتدخل مختلف البروتينات الغشائية في توليد وانتشار الرسالة العصبية ودمجها على مستوى العصبون المحرك؟",
          keywords: ["غشائي", "رساله", "عصبيه"]
        },
        {
          prompt: "ذكر البروتينات الغشائية ودور كل منها",
          bacPrompt:
            "اذكر مختلف البروتينات الغشائية المتدخلة في توليد وانتشار الرسالة العصبية عبر سلسلة عصبونية محددا دور كل منها.",
          notes: NOTE_OCR,
          placeholder: "قنوات فولطية، مضخة، مستقبلات...",
          modelAnswer:
            "القنوات الفولطية لـ Na⁺ وK⁺ تولد كمون العمل. مضخة Na⁺/K⁺ تحفظ كمون الراحة. قنوات الكالسيوم الفولطية تسمح بالتحرير. مستقبلات بعد مشبكية تولد PPSE أو PPSI.",
          keywords: ["قنوات", "مضخه", "مستقبل"]
        },
        {
          prompt: "نص علمي حول دمج الرسائل على العصبون المحرك",
          bacPrompt: "اكتب نصا علميا تبيّن فيه آلية دمج الرسائل العصبية على مستوى العصبون المحرك.",
          notes: NOTE_OCR,
          placeholder: "تجميع فضائي وزماني...",
          modelAnswer:
            "تصل إلى العصبون المحرك جهود بعد مشبكية تنبيهية وتثبيطية. يُدمج المحصّل تجميعا فضائيا وزمانيا على مستوى القطعة الابتدائية، فإذا بلغ العتبة تولد كمون عمل وانتشر نحو العضلة.",
          keywords: ["دمج", "تنبيهي", "تثبيطي", "عتبه", "محرك"]
        },
        {
          prompt: "الخاتمة: شرط صدور الرسالة الحركية",
          bacPrompt: "ما شرط صدور رسالة عصبية حركية بعد الدمج؟",
          notes: NOTE_OCR,
          placeholder: "في الختام...",
          modelAnswer: "في الختام، لا تصدر رسالة حركية إلا إذا بلغ محصّل الدمج عتبة توليد كمون العمل.",
          keywords: ["دمج", "عتبه", "حركيه"]
        }
      )
    ),
    ex(
      2,
      "مستقبل LDL وتصلب الشرايين",
      7,
      "دخول LDL عبر المستقبل الغشائي R، ودور الأحماض الأمينية في ثبات بنيته، وأثر طفرة الأليل على تصلب الشرايين",
      poles7(
        {
          prompt: "تأطير الإشكالية: كيف تؤدي طفرة مستقبل LDL إلى تصلب الشرايين؟",
          bacPrompt: "كيف ترتبط بنية المستقبل الغشائي لـ LDL بالحالة الصحية وتصلب الشرايين؟",
          notes: NOTE_OCR,
          placeholder: "صياغة المشكل العلمي...",
          modelAnswer:
            "المشكل العلمي: كيف تضمن أحماض أمينية محددة ثبات مستقبل LDL، وكيف تفقد الطفرة هذا التخصص فيرتفع الكولسترول؟",
          keywords: ["LDL", "مستقبل", "طفره"]
        },
        {
          prompt: "تحديد دور الأحماض الأمينية في ثبات المستقبل",
          bacPrompt:
            "حدد بدقة دور الأحماض الأمينية في كشف وثبات البنية الفراغية للمستقبل R باستغلال الشكلين أ و ب.",
          notes: NOTE_OCR,
          placeholder: "جسور، شحنات، تموضع...",
          modelAnswer:
            "تمثل الوثيقة تتابع الأحماض الأمينية في المستقبل LDL بدلالة الموضع عند السليم والمصاب. نلاحظ تموضعا دقيقا لأحماض مشحونة وكبريتية عند السليم، بينما يختل التموضع عند المصاب، ومنه نستنتج أن الروابط تثبّت البنية الفراغية اللازمة للتعرف على LDL.",
          keywords: ["احماض", "بنيه", "مستقبل", "LDL"],
          extra: {
            document: {
              kind: "table",
              axes: ["حمض", "موضع"],
              comparisons: [["سليم", "مصاب"]],
              cells: [["LDL", "مستقبل"]],
              values: [],
              strictValues: false
            }
          }
        },
        {
          prompt: "مناقشة العلاقة بين الطفرة وتصلب الشرايين",
          bacPrompt:
            "ناقش العلاقة بين بنية المستقبل الغشائي لـ LDL والحالة الصحية للشخص السليم مقارنة بالمصاب.",
          notes: NOTE_OCR,
          placeholder: "أليل R1 وR2، كولسترول...",
          modelAnswer:
            "عند السليم يثبت LDL على مستقبل وظيفي فيُقتنص. عند المصاب تغيّر الطفرة حمضا أمينيا فيفقد المستقبل شكله فلا يدخل LDL، فيرتفع الكولسترول في الدم ويتصلب الشريان.",
          keywords: ["طفره", "كولسترول", "مستقبل", "شرايين", "LDL"]
        },
        {
          prompt: "الخاتمة: أصل المرض",
          bacPrompt: "ما أصل تصلب الشرايين في هذه الدراسة؟",
          notes: NOTE_OCR,
          placeholder: "في الختام...",
          modelAnswer: "في الختام، أصل المرض طفرة في مورثة المستقبل تمنع اقتناص LDL فيتراكم الكولسترول.",
          keywords: ["طفره", "LDL", "كولسترول"]
        }
      )
    ),
    ex(
      3,
      "العقم والنطاف وCoenzyme Q10",
      8,
      "علاقة نقص حركة النطاف بتحول الطاقة، ودور Coenzyme Q10 في السلسلة التنفسية",
      poles8(
        {
          prompt: "اقتراح فرضية حول سبب قلة حركة النطاف",
          bacPrompt: "اقترح فرضية تفسر قلة حركة النطاف عند الشخص س.",
          notes: NOTE_OCR,
          placeholder: "الفرضية...",
          modelAnswer:
            "الفرضية: يعود نقص الحركة إلى خلل في أكسدة النواقل المرجعة فلا يتشكل ATP الكافي لحركة النطفة.",
          keywords: ["فرضيه", "نطاف", "ATP"]
        },
        {
          prompt: "تحليل استهلاك O2 في معلق النطاف",
          bacPrompt: "حلّل نتائج تغيرات نسبة O2 في المعلقين بعد إضافة الناقل TH2.",
          notes: NOTE_OCR,
          placeholder: "معلق سليم ومعلق الشخص س...",
          modelAnswer:
            "تمثل الوثيقة نسبة الأكسجين بدلالة الزمن في المعلق السليم والمصاب. نلاحظ عند السليم انخفاضا واضحا في O2 بعد إضافة TH2، بينما يبقى الانخفاض ضعيفا عند المصاب، ومنه نستنتج ضعفا في أكسدة النواقل عند المصاب.",
          keywords: ["اكسجين", "نطاف", "ناقل"],
          extra: {
            document: {
              kind: "curve",
              axes: ["اكسجين", "زمن"],
              comparisons: [["سليم", "مصاب"]],
              trends: [{ about: "سليم", expect: ["انخفاض", "اكسجين"] }],
              values: [],
              strictValues: false
            }
          }
        },
        {
          prompt: "تفسير تأثير Coenzyme Q10",
          bacPrompt: "فسّر آلية تأثير الدواء المكون من Coenzyme Q10 على حركة النطاف مع المصادقة على الفرضية.",
          notes: NOTE_OCR,
          placeholder: "سلسلة تنفسية، ATP، حركة...",
          modelAnswer:
            "يعيد Coenzyme Q10 نقل الإلكترونات في السلسلة التنفسية فيستأنف تدرج البروتونات ويتشكل ATP فتعود حركة النطاف، فتتأكد فرضية الخلل الطاقوي.",
          keywords: ["Q10", "سلسله", "ATP", "نطاف", "الكترون"]
        },
        {
          prompt: "مخطط العلاقة أيض-O2-وظائف حيوية",
          bacPrompt: "اشرح العلاقة بين هدم مادة الأيض واستهلاك O2 والقيام بالوظائف الحيوية.",
          notes: NOTE_OCR,
          placeholder: "فركتوز → نواقل → O2 → ATP → حركة...",
          modelAnswer:
            "عنوان المخطط: طاقة النطفة. فركتوز → نواقل مرجعة → سلسلة تنفسية تستهلك O2 → ATP → نطاف. في وجود Q10 تُستأنف السلسلة.",
          keywords: ["مخطط", "ATP", "نطاف"],
          extra: { schema: { arrows: true, title: "ATP", ordered: ["فركتوز", "ATP", "نطاف"] } }
        }
      )
    )
  ],
  [
    ex(
      1,
      "نظام الزمر الدموية ABO",
      5,
      "المؤشرات الغشائية لنظام ABO على كريات الدم الحمراء ودور الأليلات IA وIB وi",
      poles5(
        {
          prompt: "تأطير الإشكالية: كيف يظهر النمط الظاهري للزمرة؟",
          bacPrompt: "كيف تفسر اختلاف المؤشرات الغشائية لنظام ABO بين الزمر؟",
          notes: NOTE_OCR,
          placeholder: "صياغة المشكل العلمي...",
          modelAnswer:
            "المشكل العلمي: كيف تحدد الأليلات IA وIB وi نوع المستضد الغشائي على كرية الدم الحمراء؟",
          keywords: ["زمره", "مستضد", "اليل"]
        },
        {
          prompt: "المقارنة بين الزمر والمؤشرات",
          bacPrompt: "قارن بين المؤشرات الغشائية المميزة لكل زمرة دموية.",
          notes: NOTE_OCR,
          placeholder: "مستضد H، A، B...",
          modelAnswer:
            "الزمرة O تحمل مستضد H فقط، والزمرة A تضيف غالاكتوز أمين على H، والزمرة B تضيف غالاكتوز، والزمرة AB تحمل المستضدين A وB.",
          keywords: ["مستضد", "زمره", "غشاء"]
        },
        {
          prompt: "نص علمي حول وراثة الزمر",
          bacPrompt: "اكتب نصا علميا تشرح فيه كيف يتحكم النمط الوراثي في النمط الظاهري لنظام ABO.",
          notes: NOTE_OCR,
          placeholder: "سيادة، غياب سيادة...",
          modelAnswer:
            "يشرف الصبغي 9 على أليلات IA وIB السائدتين بالنسبة إلى i المتنحي، وبين IA وIB غياب سيادة. يركّب كل أليل سائد إنزيما يضيف سكرا نوعيا على المستضد H فيظهر النمط الظاهري للزمرة.",
          keywords: ["اليل", "سياده", "مستضد", "زمره", "نمط"]
        },
        {
          prompt: "الخاتمة: أهمية معرفة الزمرة",
          bacPrompt: "ما أهمية معرفة مؤشرات الزمرة عند نقل الدم؟",
          notes: NOTE_OCR,
          placeholder: "في الختام...",
          modelAnswer:
            "في الختام، تحدد المؤشرات الغشائية التوافق عند النقل، فكل مستضد غريب يُرفض بالأجسام المضادة.",
          keywords: ["زمره", "مستضد", "نقل"]
        }
      )
    ),
    ex(
      2,
      "اللاكتاز وعدم تحمل اللاكتوز",
      7,
      "نشاط إنزيم اللاكتاز وتأثير pH والحرارة والثيولاكتوز، وعلاقة نقصه بأعراض عدم التحمل",
      poles7(
        {
          prompt: "تأطير الإشكالية: ما أصل عدم تحمل اللاكتوز؟",
          bacPrompt: "كيف يرتبط نشاط اللاكتاز بأعراض عدم تحمل اللاكتوز؟",
          notes: NOTE_OCR,
          placeholder: "صياغة المشكل العلمي...",
          modelAnswer: "المشكل العلمي: كيف يؤثر نقص اللاكتاز على هضم اللاكتوز فتظهر أعراض عدم التحمل؟",
          keywords: ["لاكتاز", "لاكتوز", "تحمل"]
        },
        {
          prompt: "تحليل أثر pH والحرارة على السرعة الابتدائية",
          bacPrompt:
            "أنشئ منحنى تغير السرعة الابتدائية بدلالة pH الوسط مفسرا تأثيرها، ثم استنتج أثر الحرارة.",
          notes: NOTE_OCR,
          placeholder: "pH أمثل، حرارة منخفضة أو مرتفعة...",
          modelAnswer:
            "تمثل الوثيقة تغير السرعة بدلالة pH. نلاحظ سرعة أعظمية عند pH قريب من المعتدل وحرارة متوسطة، بينما تنعدم عند الطرف، ومنه نستنتج أن اللاكتاز يعمل في ظروف المعي الدقيق.",
          keywords: ["سرعه", "لاكتاز", "حراره"],
          extra: {
            document: {
              kind: "curve",
              axes: ["سرعه", "PH"],
              comparisons: [["معتدل", "طرف"]],
              trends: [{ about: "معتدل", expect: ["اعظميه", "سرعه"] }],
              values: [],
              strictValues: false
            }
          }
        },
        {
          prompt: "تفسير أعراض عدم التحمل",
          bacPrompt: "اشرح سبب ظهور أعراض عدم تحمل اللاكتوز عند المصاب وعدم ظهورها عند السليم.",
          notes: NOTE_OCR,
          placeholder: "تخمرات في المعي الغليظ...",
          modelAnswer:
            "عند السليم يهضم اللاكتاز اللاكتوز في المعي الدقيق فلا يصل إلى الغليظ. عند المصاب ينقص اللاكتاز فيصل اللاكتوز إلى المعي الغليظ حيث تخمره البكتيريا فتتكون غازات وأحماض مسببة الانتفاخ والآلام.",
          keywords: ["لاكتاز", "تخمر", "معي", "غازات", "مصاب"]
        },
        {
          prompt: "الخاتمة: مفهوم الإنزيم",
          bacPrompt: "ما المفهوم الدقيق للإنزيم انطلاقا من هذه الدراسة؟",
          notes: NOTE_SEC,
          placeholder: "في الختام...",
          modelAnswer:
            "في الختام، الإنزيم وسيط حيوي نوعي يسرّع التفاعل في ظروف ملائمة دون أن يُستهلك، ونقصه يعطل الهضم.",
          keywords: ["انزيم", "نوعي", "تفاعل"]
        }
      )
    ),
    ex(
      3,
      "Cyanobacter وتحويل الطاقة الضوئية",
      8,
      "قدرة بكتيريا Cyanobacter على تحويل الطاقة الضوئية إلى طاقة كيميائية كامنة مع طرح O2",
      poles8(
        {
          prompt: "اقتراح فرضية حول مصدر O2 المطروح",
          bacPrompt: "اقترح فرضية فيما يخص مصدر وآلية طرح ثنائي الأكسجين عند Cyanobacter.",
          notes: NOTE_OCR,
          placeholder: "الفرضية...",
          modelAnswer: "الفرضية: ينتج O2 من أكسدة الماء خلال المرحلة الكيميائية الضوئية بوجود الضوء.",
          keywords: ["فرضيه", "اكسجين", "ضوء"]
        },
        {
          prompt: "استغلال ارتفاع O2 في الضوء",
          bacPrompt: "استغل ارتفاع نسبة O2 عند تعريض Cyanobacter للضوء.",
          notes: NOTE_OCR,
          placeholder: "في الضوء يرتفع O2...",
          modelAnswer:
            "تمثل الوثيقة نسبة الأكسجين بدلالة الزمن في الضوء والظلام. نلاحظ ارتفاع O2 في الضوء وعدم ارتفاعه في الظلام، ومنه نستنتج أن الضوء ضروري لطرح الأكسجين.",
          keywords: ["اكسجين", "ضوء", "ظلام"],
          extra: {
            document: {
              kind: "curve",
              axes: ["اكسجين", "زمن"],
              comparisons: [["ضوء", "ظلام"]],
              trends: [{ about: "ضوء", expect: ["ارتفاع", "اكسجين"] }],
              values: [],
              strictValues: false
            }
          }
        },
        {
          prompt: "تفسير آلية طرح O2",
          bacPrompt: "فسّر الآلية التي تسمح لـ Cyanobacter بطرح O2 وتحويل الطاقة الضوئية.",
          notes: NOTE_OCR,
          placeholder: "فوتونات، أكسدة الماء، نواقل...",
          modelAnswer:
            "تمتص الأنظمة الضوئية الفوتونات فتتأكسد جزيئة الماء وينطلق O2 وتتحرر إلكترونات تختزل النواقل، فتتحول الطاقة الضوئية إلى طاقة كيميائية كامنة. تتأكد الفرضية.",
          keywords: ["ضوء", "ماء", "اكسجين", "الكترون", "طاقه"]
        },
        {
          prompt: "مخطط تحويل الطاقة الضوئية",
          bacPrompt: "لخّص في مخطط تحويل الطاقة الضوئية إلى طاقة كيميائية كامنة مع طرح O2.",
          notes: NOTE_OCR,
          placeholder: "ضوء → ماء → اكسجين",
          modelAnswer: "عنوان المخطط: ضوء. ضوء → ماء → اكسجين.",
          keywords: ["مخطط", "ضوء", "اكسجين"],
          extra: { schema: { arrows: true, title: "ضوء", ordered: ["ضوء", "ماء", "اكسجين"] } }
        }
      )
    )
  ]
);

/* Remaining years 2017-2013: pedagogical reconstructions */
const REST = [
  {
    id: "2017",
    theme: "rose",
    extra: "Session normale 2017. PDF dzexams محمي في العارض. Thèmes pédagogiques reconstruits.",
    s1: [
      [
        "الشفرة الوراثية والترجمة",
        5,
        "علاقة الرامزة بتتابع الأحماض الأمينية أثناء الترجمة",
        "رامزه",
        "ترجمه",
        "ARNm"
      ],
      [
        "البنية الفراغية للبروتين",
        7,
        "الروابط المسؤولة عن ثبات البنية الفراغية وأثر الطفرة",
        "بنيه",
        "روابط",
        "طفره"
      ],
      [
        "المرحلة الكيميائية الضوئية",
        8,
        "تحويل الطاقة الضوئية على مستوى التيلاكوئيد وطرح O2",
        "تيلاكوئيد",
        "ضوء",
        "اكسجين"
      ]
    ],
    s2: [
      ["الذات واللاذات", 5, "دور CMH والمستضدات الغشائية في تمييز الذات", "CMH", "ذات", "لاذات"],
      ["تأثير pH على النشاط الإنزيمي", 7, "تغير شحنات الموقع الفعال بدلالة pH الوسط", "PH", "موقع", "نشاط"],
      ["فيروس VIH والمناعة", 8, "استهداف الخلايا LT4 وتعطيل التعاون المناعي", "VIH", "LT4", "مناعه"]
    ]
  },
  {
    id: "2016",
    theme: "purple",
    extra: "2016 : session de remplacement retenue. Thèmes pédagogiques reconstruits.",
    s1: [
      ["الاستنساخ داخل النواة", 5, "دور ARN بوليميراز في تركيب ARNm", "استنساخ", "بوليميراز", "نواه"],
      ["التخصص الوظيفي للإنزيم", 7, "تكامل الموقع الفعال مع مادة التفاعل", "انزيم", "ركيزه", "تخصص"],
      ["المناعة الخلطية", 8, "إنتاج الأجسام المضادة من البلاسموسيت", "مضاده", "بلاسموسيت", "مستضد"]
    ],
    s2: [
      ["المشبك الكيميائي", 5, "تحرير المبلغ العصبي وتوليد الجهد بعد المشبكي", "مشبك", "مبلغ", "كالسيوم"],
      ["التخمر والتنفس", 7, "مقارنة الحصيلة الطاقوية في وجود O2 وفي غيابه", "تخمر", "تنفس", "ATP"],
      ["بنية الكرة الأرضية", 8, "الانقطاعات والحالة الفيزيائية للأوساط الداخلية", "انقطاع", "رداء", "نواه"]
    ]
  },
  {
    id: "2015",
    theme: "indigo",
    extra: "2015 : PDF dzexams دون طبقة نص قابلة للشهادة هنا. Thèmes pédagogiques reconstruits.",
    s1: [
      ["الترجمة في الهيولى", 5, "العناصر المتدخلة في تركيب السلسلة البيبتيدية", "هيولي", "ريبوزوم", "ARNt"],
      [
        "الكربوكسي بيبتيداز والموقع الفعال",
        7,
        "علاقة البنية الفراغية للإنزيم بمادة التفاعل",
        "بيبتيداز",
        "موقع",
        "فعال"
      ],
      ["الاستجابة ضد VIH", 8, "حدود المراقبة المناعية بعد إصابة LT4", "VIH", "LT4", "مراقبه"]
    ],
    s2: [
      ["النقل المشبكي", 5, "تأخير مشبكي ودور المبلغ الكيميائي", "مشبك", "تاخير", "مبلغ"],
      ["أنزيم RUBISCO وتثبيت CO2", 7, "تثبيت CO2 على RudIP في الحشوة", "RUBISCO", "تثبيت", "CO2"],
      ["الصفائح التكتونية", 8, "التوسع المحيطي ومناطق الغوص", "صفائح", "ظهره", "غوص"]
    ]
  },
  {
    id: "2014",
    theme: "amber",
    extra: "2014 : PDF dzexams دون طبقة نص قابلة للشهادة هنا. Thèmes pédagogiques reconstruits.",
    s1: [
      ["مراحل تركيب البروتين", 5, "تكامل الاستنساخ والترجمة", "استنساخ", "ترجمه", "بروتين"],
      ["التثبيط الإنزيمي", 7, "تثبيط تنافسي وغير تنافسي على الموقع الفعال", "تثبيط", "موقع", "ركيزه"],
      ["الدفاع عن الذات", 8, "آليات التعرف النوعي على اللاذات", "ذات", "لاذات", "تعرف"]
    ],
    s2: [
      ["كمون الراحة", 5, "توزيع Na⁺ وK⁺ ودور مضخة الصوديوم-بوتاسيوم", "راحه", "مضخه", "شوارد"],
      ["تحويل الطاقة في الميتوكوندري", 7, "أكسدة النواقل وتشكل ATP", "ميتوكوندري", "نواقل", "ATP"],
      ["النشاط التكتوني", 8, "العلاقة بين الزلازل والحدود بين الصفائح", "زلزال", "حدود", "صفائح"]
    ]
  },
  {
    id: "2013",
    theme: "emerald",
    extra: "2013 : PDF dzexams محمي في العارض. Thèmes pédagogiques reconstruits.",
    s1: [
      ["النسخ والترجمة", 5, "من المورثة إلى البروتين الوظيفي", "مورثه", "نسخ", "ترجمه"],
      ["الموقع الفعال للإنزيم", 7, "الأحماض الأمينية المحددة للتخصص", "امينيه", "موقع", "تخصص"],
      ["الأجسام المضادة", 8, "التعرف النوعي على مولد الضد في المرحلة الفاعلة", "مضاده", "مولد", "ضد"]
    ],
    s2: [
      ["كمون العمل", 5, "دور القنوات الفولطية في زوال وعودة الاستقطاب", "عمل", "قنوات", "فولطيه"],
      ["ATP في الميتوكوندري", 7, "دور تدرج البروتونات وATP سنتاز", "بروتون", "سنتاز", "ATP"],
      ["الحمل الحراري والصفائح", 8, "تيارات الرداء كمحرك لحركة الصفائح", "حمل", "حراري", "رداء"]
    ]
  }
];

function genericPoles(max, k1, k2, k3, label) {
  const n = {
    prompt: `تأطير الإشكالية حول: ${label}`,
    bacPrompt: `ما المشكل العلمي المرتبط بـ ${label}؟`,
    notes: NOTE_SEC,
    placeholder: "صياغة المشكل العلمي...",
    modelAnswer: `المشكل العلمي: كيف تتدخل الآليات المرتبطة بـ ${label} في الظاهرة المدروسة؟`,
    keywords: [k1, k2]
  };
  const s = {
    prompt: `استغلال الوثيقة المتعلقة بـ ${label}`,
    bacPrompt: `حلّل أو استخرج من الوثيقة المعطيات المرتبطة بـ ${label}.`,
    notes: NOTE_SEC,
    placeholder: "نلاحظ... بينما... ومنه نستنتج...",
    modelAnswer: `تمثل الوثيقة تغيرات ${k1} بدلالة الزمن مقارنة بـ ${k2}. نلاحظ تغيرا واضحا في ${k1} مقارنة بالشاهد، ومنه نستنتج علاقة مباشرة مع ${k2}.`,
    keywords: [k1, k2, "نلاحظ"],
    extra: {
      document: {
        kind: "curve",
        axes: [k1, "زمن"],
        comparisons: [[k1, k2]],
        trends: [{ about: k1, expect: [k1, k2] }],
        values: [],
        strictValues: false
      }
    }
  };
  const e = {
    prompt: `تفسير الآلية المرتبطة بـ ${label}`,
    bacPrompt: `اشرح الآلية التي تفسر ${label} انطلاقا من الوثيقة ومعلوماتك.`,
    notes: NOTE_SEC,
    placeholder: "يعود ذلك إلى...",
    modelAnswer: `يعود ذلك إلى تدخل ${k1} و${k2} عبر آلية دقيقة تؤدي إلى ${k3}، فتتغير الوظيفة النهائية للظاهرة المدروسة.`,
    keywords: [k1, k2, k3]
  };
  const w = {
    prompt: `الخاتمة التركيبية حول ${label}`,
    bacPrompt: `لخّص النتيجة النهائية المرتبطة بـ ${label}.`,
    notes: NOTE_SEC,
    placeholder: "في الختام...",
    modelAnswer: `في الختام، ترتبط النتيجة النهائية بـ ${k1} و${k2} فتُغلق الظاهرة على ${k3}.`,
    keywords: [k1, k3, "ختام"]
  };
  if (max === 5) return poles5(n, s, e, w);
  if (max === 7) return poles7(n, s, e, w);
  const w8 = {
    ...w,
    extra: { schema: { arrows: true, title: k1, ordered: [k1, k2, k3] } },
    modelAnswer: `عنوان المخطط: ${k1}. ${k1} → ${k2} → ${k3}.`,
    keywords: ["مخطط", k1, k3],
    placeholder: `${k1} → ${k2} → ${k3}`
  };
  return poles8(n, s, e, w8);
}

for (const y of REST) {
  const s1 = y.s1.map((row, i) => {
    const [label, max, desc, k1, k2, k3] = row;
    return ex(i + 1, label, max, desc, genericPoles(max, k1, k2, k3, label));
  });
  const s2 = y.s2.map((row, i) => {
    const [label, max, desc, k1, k2, k3] = row;
    return ex(i + 1, label, max, desc, genericPoles(max, k1, k2, k3, label));
  });
  pushYear(y.id, y.theme, y.extra, s1, s2);
}

function jsString(s) {
  return JSON.stringify(s);
}

function emitPole(letter, pole) {
  const extra = pole.extra || {};
  const extraJs = Object.keys(extra).length
    ? ",\n          " +
      Object.entries(extra)
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
        .join(",\n          ")
    : "";
  return `        ${letter}: {
          points: ${pole.points},
          prompt: ${jsString(pole.prompt)},
          bacPrompt: ${jsString(pole.bacPrompt)},
          ...RECON(${jsString(pole.notes)}),
          placeholder: ${jsString(pole.placeholder)},
          minLength: ${pole.minLength},
          modelAnswer: ${jsString(pole.modelAnswer)},
          rule: {
            prompt: ${jsString(pole.prompt)},
            keywords: ${JSON.stringify(pole.keywords)},
            minHits: ${pole.minHits},
            forbidden: ${JSON.stringify(pole.forbidden)}${extraJs}
          }
        }`;
}

function emitEx(exercise) {
  const poles = ["N", "S", "E", "W"].map((L) => emitPole(L, exercise.poles[L])).join(",\n");
  return `          {
            number: ${exercise.number},
            ui: "text",
            label: ${jsString(exercise.label)},
            max: ${exercise.max},
            desc: ${jsString(exercise.desc)},
            poles: {
${poles}
            }
          }`;
}

function emitSujet(id, title, meta, exercises) {
  // `pdfAvailable` a été supprimé : le champ était mort (aucun module d'interface
  // ne le lisait) et contredisait `pdfLocalUrl`, qui pointe vers un PDF local
  // réellement affiché. L'invariant utile est porté par `pdf: null` (chargement
  // paresseux) et vérifié par tests/data-integrity.test.mjs.
  return `        {
        id: ${id},
        pdf: null,
        pdfExternalUrl: ${jsString(meta.pdfUrl)},
          pdfNote: ${jsString(meta.pdfNote)},
          title: ${jsString(title)},
          exercises: [
${exercises.map(emitEx).join(",\n")}
          ]
        }`;
}

function emitYear(entry) {
  const { meta, s1, s2 } = entry;
  const label = `بكالوريا الجزائر دورة ${meta.id}`;
  return `    {
      id: ${jsString(meta.id)},
      stream: "se",
      calendarYear: ${jsString(meta.id)},
      label: ${jsString(label)},
      badge: ${jsString("أرشيف مُعاد بناؤه")},
      theme: ${jsString(meta.theme)},
      enabled: true,
      sujets: [
${emitSujet(1, "الموضوع الأول", meta, s1)},
${emitSujet(2, "الموضوع الثاني", meta, s2)}
      ]
    }`;
}

const outputDirectory = new URL("../data/years/se/", import.meta.url);
mkdirSync(outputDirectory, { recursive: true });

const generated = YEARS.filter(({ meta }) => meta.id !== "2020");
for (const entry of generated) {
  const { id } = entry.meta;
  const exportName = `YEAR_${id}_SE`;
  const objectSource = emitYear(entry).replace(/^ {4}/gm, "");
  const out = `/* ============================================================
   BAC SVT Algérie ${id} — archive pédagogique reconstruite
   ------------------------------------------------------------
   Aucune consigne n'est marquée official. Les champs de provenance
   restent attachés à chaque pôle. Chargé à la demande par le shell.
   ============================================================ */

const RECON = (notes) => ({
  bacPromptSource: "reconstructed",
  bacPromptNotes: notes
});

const ${exportName} = ${objectSource};

export { ${exportName} };
export default ${exportName};
`;
  writeFileSync(new URL(`year-${id}.js`, outputDirectory), out);
  console.log(`wrote data/years/se/year-${id}.js`, out.length, "chars");
}
console.log("skipped reconstructed 2020: the runtime uses the verified official 2020 payload");
