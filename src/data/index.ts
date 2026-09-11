import { QuizQuestion, Unit, Flashcard } from '../types';
import { INITIAL_UNITS as CATALOG_UNITS } from '../unitCatalog';
import { SVT_QUIZ_QUESTIONS as CORPUS_QUIZ_QUESTIONS, SVT_FLASHCARDS as CORPUS_FLASHCARDS } from '../quizCorpus';

export const DIAGRAM_QUIZ_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuBHewZo48wjNdNC_EGWYGRzduDxicgGztWMu2vdFW48avFtjF3GBVCPyR-uin214yMvhTNb6UmG6v704clB_WDvWy3qs1DW86A791f9S_NllwZaq-vEomxojQaTchhv-OaMqVl7TAhckwtSOZ-3QhLq-uJfeKCMgwXlpWGV_MQKtqAV_7yFaoQmu3T9zDPHw7v7JgNCRoSj6JqlIbElWTLoqTnvMOu3A0w0kaaqrWvJ8ruHNc57yr2v9EDgjTKJOew1yrlmDWDe2A";
export const DIAGRAM_FLASHCARD_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuBm2eS7wegmPkIFmjuqd-3EAxmECqfZvrjse-TYR8LjmIMIWMm3CICN7WobYQumt8a3OCLBjP6S_2-FCQ5q86oM0SVUfFql3evu1K0IUv1_Ex6axew-StCgYxHfUBwYWd8RDn-sVOlCLCXb5qwEjgeJLBioKizAOkweCqP816LrJHRXD_U-nPmGX09AlUHYYnaJV2eG4J5vbNnKavSTcb_ChNrXPtdLMmok63LgMDRpJokSTgwLOCx4v8D2JXq19F7Ri3T_TCMu4Q";
export const MASCOT_URL = "/assets/images/mascot-512.png";

export const INITIAL_UNITS: Unit[] = CATALOG_UNITS;
export const SVT_QUIZ_QUESTIONS: QuizQuestion[] = CORPUS_QUIZ_QUESTIONS;

// Flashcards réelles : dérivées du corpus QCM (508) + les 3 cartes « college » historiques.
// Avant, seules les 3 cartes ci-dessous étaient montées — le mapping de quizCorpus
// était du code mort (audit D3).
export const SVT_FLASHCARDS: Flashcard[] = [
  ...CORPUS_FLASHCARDS,
  {
    id: "fc_1",
    unitId: 1,
    question: "اشرح باختصار آلية الاستنساخ (Transcription) ومقر حدوثها في الخلية حقيقية النواة.",
    answerBullets: [
      "**المقر:** تحدث عملية الاستنساخ في **النواة** عند حقيقيات النوى، حيث يتم نسخ المعلومات الوراثية من سلسلة الـ DNA إلى جزيء الـ ARNm.",
      "**الانطلاق:** يرتبط إنزيم **ARN بوليميراز** بمنطقة البداية للمورثة، ويقوم بفك التفاف سلسلتي الـ DNA وتكسير الروابط الهيدروجينية بين القواعد المتكاملة لفتح السلسلتين.",
      "**الاستطالة:** يتحرك الإنزيم على طول السلسلة المستنسخة (في الاتجاه 3' إلى 5')، ويقرأ النيوكليوتيدات ويجمع النيوكليوتيدات الريبية الحرة بالتكامل (A مع U، و T مع A، و C مع G، و G مع C) لتشكيل سلسلة ARNm النامية.",
      "**النهاية:** عند وصول الإنزيم إلى نهاية المورثة، ينفصل الـ ARN بوليميراز، ويتحرر جزيء الـ ARNm المصنع، وتلتحم سلسلتا الـ DNA مجدداً."
    ],
    diagramUrl: DIAGRAM_FLASHCARD_URL
  },
  {
    id: "fc_2",
    unitId: 2,
    question: "كيف تصنف مستويات البنية الفراغية للبروتين، وما هي الروابط الكيميائية التي تضمن استقرارها؟",
    answerBullets: [
      "**البنية الأولية:** تتابع خطي للأحماض الأمينية المكونة للسلسلة الببتيدية، ترتبط بروابط تساهمية ببتيدية قوية.",
      "**البنية الثانوية:** انطواء محلي خطي للسلسلة الأولية نتيجة نشوء روابط هيدروجينية بين المجموعات الكيميائية للروابط الببتيدية (C=O و N-H)، وتأخذ شكلاً حلزونياً (Alpha) أو مطوياً (Beta).",
      "**البنية الثالثية:** انطواء السلسلة ذات البنية الثانوية لتأخذ شكلاً ثلاثي الأبعاد متراصاً يحتوي على مناطق انعطاف. تستقر هذه البنية بأربعة أنواع من الروابط بين جذور الأحماض الأمينية: روابط كارهة للماء، هيدروجينية، شاردية (ملحية)، وجسور ثنائية الكبريت تساهمية قوية.",
      "**البنية الرابعة:** تجمع سلسلتين ببتيديتين (أو أكثر) لكل منهما بنية ثالثية، وتسمى كل سلسلة 'تحت وحدة'. ترتبط تحت الوحدات بروابط ضعيفة غير تساهمية."
    ]
  },
  {
    id: "fc_3",
    unitId: 3,
    question: "لخص دور الخلايا اللمفاوية LT4 في توجيه وتنشيط الاستجابة المناعية النوعية.",
    answerBullets: [
      "**التعرف:** تتعرف الخلايا اللمفاوية التائية المساعدة **LT4** على محدد المستضد المعروض بالتكامل مع جزيئة الـ **MHC II** على سطح الخلايا العارضة للمستضد (Macrophage / CPA).",
      "**التنشيط الذاتي:** بعد هذا التعرف المزدوج، تفرز خلايا LT4 الـ **الانترلوكين-2 (IL-2)** الذي يرتبط بمستقبلاته النوعية المتواجدة على غشائها الخاص، مما يثير انقسامها وتمايزها.",
      "**التمايز:** تتمايز الخلايا المنقسمة إلى خلايا **LTh** (تائية مساعدة مفرزة للمبلغات الكيميائية) وخلايا **LT4m** ذات ذاكرة مناعية.",
      "**تنشيط اللمفاويات الأخرى:** تفرز الخلايا المساعدة LTh كميات هائلة من **IL-2** و **IL-4** لتنشيط الخلايا اللمفاوية **LB** (للتحفيز على تمايزها لخلايا بلازمية منتجة للأجسام المضادة) والخلايا **LT8** (لتنشيطها وتمايزها إلى خلايا قاتلة LTc)."
    ]
  }
];
