import type { QuizQuestion } from '../types';

/*
 * M16 volet 2 (audit externe v2, 2026-10-18) — segment 5/6 : 10 QCM (domaine 'التحولات الطاقوية', unités 6,7,
 * ids 540..549).
 * Déplacement LITTÉRAL depuis src/quizCorpus.ts : octet pour octet,
 * aucun contenu modifié, ordre relatif = celui du fichier d)origine.
 * La concaténation des segments dans l)ordre (index.ts) restitue
 * exactement l)ordre global du corpus d)origine.
 */
export const QUESTIONS_D2B: QuizQuestion[] = [{
    "id": 540,
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_93_photochemical_chain_z_scheme_ar.svg",
    "unitId": 6,
    "questionText": "يستعيد النظام الضوئي PSII الإلكترونات التي فقدها من:",
    "options": [
      "التحلل الضوئي للماء داخل تجويف الكييس: كل جزيء ماء يعطي نصف جزيء أكسجين (½O₂) مع تحرر بروتونين (2H⁺) وإلكترونين (2e⁻).",
      "ثاني أكسيد الكربون الممتص من الوسط.",
      "جزيئات ATP المتشكلة على الكرة المذنبة.",
      "النظام الضوئي PSI الذي يعيد إليه الإلكترونات."
    ],
    "correctAnswerIndex": 0,
    "explanation": "أثبتت تجربة روبن بالوسم المشع أن الأكسجين المنطلق يأتي من الماء لا من CO₂. الماء يُحلَّل أساساً من أجل إلكتروناته، والأكسجين ناتج جانبي."
  },{
    "id": 541,
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_93_photochemical_chain_z_scheme_ar.svg",
    "unitId": 6,
    "questionText": "المستقبل النهائي للإلكترونات في المرحلة الكيموضوئية هو:",
    "options": [
      "NADP⁺ الذي يُرجَع حسب NADP⁺ + 2e⁻ + 2H⁺ ← NADPH + H⁺.",
      "الأكسجين الذي يتحول إلى ماء.",
      "النظام الضوئي PSII الذي يستعيد إلكتروناته.",
      "جزيئة ADP التي تتحول إلى ATP."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الفرق الجوهري مع التنفس: في الصانعة المستقبل النهائي هو NADP⁺، وفي الميتوكوندري هو الأكسجين. الأكسجين في التركيب الضوئي منتَج لا مستقبِل."
  },{
    "id": 542,
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_93_photochemical_chain_z_scheme_ar.svg",
    "unitId": 6,
    "questionText": "ترتيب مرور الإلكترون الصحيح هو:",
    "options": [
      "الماء ← PSII ← سلسلة النواقل ← PSI ← NADP⁺.",
      "الماء ← PSI ← سلسلة النواقل ← PSII ← NADP⁺.",
      "NADP⁺ ← PSII ← PSI ← الماء.",
      "PSI ← الماء ← PSII ← سلسلة النواقل."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الترقيم تاريخي لا زمني: PSII يعمل أولاً. الإلكترون لا يعود أبداً إلى نقطة انطلاقه، بل ينتقل في اتجاه واحد نحو NADP⁺."
  },{
    "id": 543,
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_93_photochemical_chain_z_scheme_ar.svg",
    "unitId": 6,
    "questionText": "تُضخ البروتونات H⁺ أثناء المرحلة الكيموضوئية:",
    "options": [
      "من الحشوة نحو تجويف الكييس، بفضل الطاقة المحررة من انتقال الإلكترونات.",
      "من التجويف نحو الحشوة بفضل الطاقة الضوئية مباشرة.",
      "من الصانعة نحو الهيولى عبر الغشاء الخارجي.",
      "لا تُضخ أصلاً، بل تنتشر بحرية في الاتجاهين."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الضخ نقل فعال ضد تدرج التركيز، يستمد طاقته من انتقال الإلكترونات في سلسلة النواقل. النتيجة: تراكم H⁺ في التجويف وانخفاض pH فيه."
  },{
    "id": 544,
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_94_photophosphorylation_vs_oxydative_ar.svg",
    "unitId": 6,
    "questionText": "يتركب ATP في الصانعة الخضراء بفعل:",
    "options": [
      "عودة البروتونات H⁺ من التجويف نحو الحشوة عبر الكرة المذنبة (ATP synthase).",
      "الضوء الذي يركب ATP مباشرة من ADP و Pi.",
      "تثبيت CO₂ في حلقة كالفن.",
      "أكسدة NADPH داخل التجويف."
    ],
    "correctAnswerIndex": 0,
    "explanation": "هذا هو مبدأ النظرية الكيميواسموزية لميتشل: التدرج هو مصدر الطاقة المباشر. لهذا ركّب جاغندورف ATP في الظلام بمجرد إنشاء تدرج اصطناعي."
  },{
    "id": 545,
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_90_jagendorf_acid_bath_modern_ar.svg",
    "unitId": 6,
    "questionText": "تجربة جاغندورف (تركيب ATP في الظلام) تُثبت أن:",
    "options": [
      "الشرط المباشر لتركيب ATP هو وجود تدرج البروتونات، والضوء ليس إلا وسيلة إنشائه.",
      "الضوء غير ضروري نهائياً للتركيب الضوئي.",
      "ATP يتركب في المرحلة الكيميوحيوية فقط.",
      "البروتونات لا دور لها في تركيب ATP."
    ],
    "correctAnswerIndex": 0,
    "explanation": "يجب الفصل بين السبب المباشر (عودة H⁺ عبر الكرة المذنبة) والسبب البعيد (الضوء الذي يحرك الإلكترونات فينشأ التدرج)."
  },{
    "id": 546,
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg",
    "unitId": 6,
    "questionText": "نواتج المرحلة الكيموضوئية المستعملة في المرحلة الكيميوحيوية هي:",
    "options": [
      "ATP و NADPH فقط، أما الأكسجين فيُطرح كفضلة.",
      "ATP و الأكسجين.",
      "NADPH و CO₂.",
      "الغلوكوز و الأكسجين."
    ],
    "correctAnswerIndex": 0,
    "explanation": "حلقة كالفن تحتاج إلى الطاقة (ATP) وإلى القوة المرجعة (NADPH). الأكسجين لا تستعمله الصانعة في المرحلة الموالية."
  },{
    "id": 547,
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg",
    "unitId": 7,
    "questionText": "المستقبل النهائي للإلكترونات في الفسفرة التأكسدية داخل الميتوكوندري هو:",
    "options": [
      "الأكسجين الذي يتحول إلى ماء.",
      "NADP⁺ الذي يتحول إلى NADPH.",
      "حمض البيروفيك.",
      "ثاني أكسيد الكربون."
    ],
    "correctAnswerIndex": 0,
    "explanation": "نقطة المقارنة المحورية بين الوحدتين 6 و7: نفس الآلية الكيميواسموزية، لكن المانح والمستقبل مختلفان. في التنفس الأكسجين مستقبِل نهائي، وفي التركيب الضوئي هو منتَج."
  },{
    "id": 548,
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_94_photophosphorylation_vs_oxydative_ar.svg",
    "unitId": 7,
    "questionText": "المبدأ المشترك بين الفسفرة الضوئية والفسفرة التأكسدية هو:",
    "options": [
      "تشكل تدرج في تركيز H⁺ عبر غشاء، وتركيب ATP عند عودة البروتونات عبر الكرة المذنبة.",
      "استعمال الطاقة الضوئية في الحالتين.",
      "تحلل الماء في الحالتين.",
      "إنتاج NADPH في الحالتين."
    ],
    "correctAnswerIndex": 0,
    "explanation": "نظرية ميتشل واحدة في العضيتين. المختلف: الغشاء (التيلاكويد مقابل الغشاء الداخلي)، والحيز الذي تتراكم فيه H⁺، ومصدر الإلكترونات ومستقبلها."
  },{
    "id": 549,
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_93_photochemical_chain_z_scheme_ar.svg",
    "unitId": 6,
    "questionText": "يتراكم البروتون H⁺ في الصانعة الخضراء داخل:",
    "options": [
      "تجويف الكييس (الثيلاكويد)، فينخفض pH فيه مقارنة بالحشوة.",
      "الحشوة، فينخفض pH فيها مقارنة بالتجويف.",
      "الحيز بين الغشاءين للميتوكوندري.",
      "الهيولى المحيطة بالصانعة."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الخطأ الشائع هو عكس الاتجاه. الضخ: الحشوة ← التجويف. العودة المركبة لـ ATP: التجويف ← الحشوة. وهذا ما يفسر انخفاض pH التجويف في تجربة جاغندورف."
  }
];
