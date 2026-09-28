import { QuizQuestion, Unit, Flashcard } from '../types';
import { INITIAL_UNITS as CATALOG_UNITS } from '../unitCatalog';
import { SVT_QUIZ_QUESTIONS as CORPUS_QUIZ_QUESTIONS, SVT_FLASHCARDS as CORPUS_FLASHCARDS } from '../quizCorpus';
// Les URLs de marque vivent dans un module sans dépendance (sprint 31) : les
// importer d'ici entraînait tout le corpus QCM dans le bundle d'entrée.
import {
  DIAGRAM_FLASHCARD_URL,
  DIAGRAM_QUIZ_URL,
  LOGO_URL,
  MASCOT_URL,
  MORCHID_LOGO_URL,
} from './brandAssets';

export { DIAGRAM_FLASHCARD_URL, DIAGRAM_QUIZ_URL, LOGO_URL, MASCOT_URL, MORCHID_LOGO_URL };


/** Logo officiel de la plateforme كنز العلوم (page d'accueil / splash / favicon). */

/** Logo dédié au المرشد الذكي (en-tête + avatars de la conversation). */

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
