import { QuizQuestion, Unit, Flashcard } from './types';

// Auto-generated from GitHub Flutter project data on 2026-07-06.
// Source files:
// - assets/data/domains_content.json
// - lib/features/quiz/data/unite1_questions.dart ... unite11_questions.dart
// Conversion policy:
// - imported 500 valid numeric QCM questions;
// - skipped 120 unsupported or placeholder Flutter questions (fillBlank/string-answer placeholders),
//   because the current React quiz component supports QCM only.

export const MASCOT_URL = "/assets/images/mascot.png";

export const INITIAL_UNITS: Unit[] = [
  {
    "id": 1,
    "title": "تركيب البروتين",
    "lessonsCount": 6,
    "description": "التخصص الوظيفي للبروتينات — Synthèse des protéines",
    "progress": 0,
    "isLocked": false,
    "domain": "التخصص الوظيفي للبروتينات"
  },
  {
    "id": 2,
    "title": "العلاقة بين بنية ووظيفة البروتين",
    "lessonsCount": 4,
    "description": "التخصص الوظيفي للبروتينات — Relation structure-fonction",
    "progress": 0,
    "isLocked": true,
    "domain": "التخصص الوظيفي للبروتينات"
  },
  {
    "id": 3,
    "title": "النشاط الإنزيمي",
    "lessonsCount": 5,
    "description": "التخصص الوظيفي للبروتينات — Activité enzymatique",
    "progress": 0,
    "isLocked": true,
    "domain": "التخصص الوظيفي للبروتينات"
  },
  {
    "id": 4,
    "title": "المناعة",
    "lessonsCount": 6,
    "description": "التخصص الوظيفي للبروتينات — Immunité",
    "progress": 0,
    "isLocked": true,
    "domain": "التخصص الوظيفي للبروتينات"
  },
  {
    "id": 5,
    "title": "الاتصال العصبي",
    "lessonsCount": 5,
    "description": "التخصص الوظيفي للبروتينات — Communication nerveuse",
    "progress": 0,
    "isLocked": true,
    "domain": "التخصص الوظيفي للبروتينات"
  },
  {
    "id": 6,
    "title": "التركيب الضوئي",
    "lessonsCount": 3,
    "description": "التحولات الطاقوية — Photosynthèse",
    "progress": 0,
    "isLocked": true,
    "domain": "التحولات الطاقوية"
  },
  {
    "id": 7,
    "title": "التنفس الخلوي والتخمر",
    "lessonsCount": 3,
    "description": "التحولات الطاقوية — Respiration cellulaire",
    "progress": 0,
    "isLocked": true,
    "domain": "التحولات الطاقوية"
  },
  {
    "id": 8,
    "title": "الحصيلة الطاقوية",
    "lessonsCount": 3,
    "description": "التحولات الطاقوية — Bilan énergétique",
    "progress": 0,
    "isLocked": true,
    "domain": "التحولات الطاقوية"
  },
  {
    "id": 9,
    "title": "النشاط التكتوني للصفائح",
    "lessonsCount": 3,
    "description": "التكتونية العامة — Activité tectonique",
    "progress": 0,
    "isLocked": true,
    "domain": "التكتونية العامة"
  },
  {
    "id": 10,
    "title": "بنية الكرة الأرضية",
    "lessonsCount": 3,
    "description": "التكتونية العامة — Structure de la Terre",
    "progress": 0,
    "isLocked": true,
    "domain": "التكتونية العامة"
  },
  {
    "id": 11,
    "title": "البنيات الجيولوجية",
    "lessonsCount": 3,
    "description": "التكتونية العامة — Structures géologiques",
    "progress": 0,
    "isLocked": true,
    "domain": "التكتونية العامة"
  }
];

export const SVT_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    "id": 1,
    "unitId": 1,
    "questionText": "في محور 1.1 — ADN، الجين والشفرة الوراثية، أي وصف دقيق لـ«الجين»؟",
    "options": [
      "قطعة من ADN تحمل معلومة تركيب سلسلة ببتيدية أو بروتين معين",
      "عدة ريبوزومات تترجم ARNm واحداً في الوقت نفسه",
      "تعطي في ARNm الرامزة AUG إذا قرئت 3 نحو 5",
      "ينتج مباشرة أجساماً مضادة في كل الحالات."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الجين يرتبط هنا بـ: قطعة من ADN تحمل معلومة تركيب سلسلة ببتيدية أو بروتين معين.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_01_adn.svg"
  },
  {
    "id": 2,
    "unitId": 1,
    "questionText": "في موضوع 1.1 — ADN، الجين والشفرة الوراثية، أي عبارة صحيحة حول «النيوكليوتيد»؟",
    "options": [
      "ينقل نسخة الرسالة الوراثية من النواة نحو الريبوزوم",
      "يحمل السلسلة الببتيدية المتنامية",
      "الوحدة البنائية لـADN ويتكوّن من سكر وفوسفات وقاعدة آزوتية",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "النيوكليوتيد يرتبط هنا بـ: الوحدة البنائية لـADN ويتكوّن من سكر وفوسفات وقاعدة آزوتية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_01_adn.svg"
  },
  {
    "id": 3,
    "unitId": 1,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «قاعدة التكامل» ضمن 1.1 — ADN، الجين والشفرة الوراثية.",
    "options": [
      "ينقل نسخة الرسالة الوراثية من النواة نحو الريبوزوم",
      "انفصال ARNm عند بلوغ تسلسل نهاية الاستنساخ",
      "A تقابل T وG تقابل C في ADN",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 2,
    "explanation": "قاعدة التكامل يرتبط هنا بـ: A تقابل T وG تقابل C في ADN.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_01_adn.svg"
  },
  {
    "id": 4,
    "unitId": 1,
    "questionText": "في محور 1.1 — ADN، الجين والشفرة الوراثية، أي إكمال صحيح: «الشفرة الوراثية» ← ________؟",
    "options": [
      "مرحلة إضافة ريبونوكليوتيدات مكملة للقالب",
      "جزء مشفر يبقى في ARNm الناضج",
      "يستعمل T بدل U في ARNm الناضج.",
      "كل رامزة من ثلاث قواعد في ARNm تحدد حمضاً أمينياً"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الشفرة الوراثية يرتبط هنا بـ: كل رامزة من ثلاث قواعد في ARNm تحدد حمضاً أمينياً.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_01_adn.svg"
  },
  {
    "id": 5,
    "unitId": 1,
    "questionText": "عند مراجعة 1.1 — ADN، الجين والشفرة الوراثية، ما المعلومة التي لا يجب الخلط فيها حول «AUG»؟",
    "options": [
      "ترتبط بها ريبوزومات تصنع بروتينات موجهة للإفراز أو الغشاء",
      "عدة ريبوزومات تترجم ARNm واحداً في الوقت نفسه",
      "رامزة بدء الترجمة وتشفر غالباً للميتيونين",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة."
    ],
    "correctAnswerIndex": 2,
    "explanation": "AUG يرتبط هنا بـ: رامزة بدء الترجمة وتشفر غالباً للميتيونين.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_01_adn.svg"
  },
  {
    "id": 6,
    "unitId": 1,
    "questionText": "ضمن 1.1 — ADN، الجين والشفرة الوراثية، ما الخيار الموافق للبرنامج عندما نذكر «UAA/UAG/UGA»؟",
    "options": [
      "يعدل بعض البروتينات ويوجهها نحو وجهتها",
      "رامزات توقف لا يوافقها ARNt حامل لحمض أميني",
      "الوحدة البنائية لـADN ويتكوّن من سكر وفوسفات وقاعدة آزوتية",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور."
    ],
    "correctAnswerIndex": 1,
    "explanation": "UAA/UAG/UGA يرتبط هنا بـ: رامزات توقف لا يوافقها ARNt حامل لحمض أميني.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_01_adn.svg"
  },
  {
    "id": 7,
    "unitId": 1,
    "questionText": "في 1.1 — ADN، الجين والشفرة الوراثية، أي علاقة صحيحة يبيّنها مصطلح «الشفرة المترادفة»؟",
    "options": [
      "تجلب عامل تحرير ولا تجلب ARNt عادياً",
      "الحمض الأميني الواحد قد توافقه عدة رامزات",
      "يدخل في تركيب الريبوزوم ويساهم في نشاطه",
      "تُقرأ الرامزات دائماً من 3 نحو 5 أثناء الترجمة."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الشفرة المترادفة يرتبط هنا بـ: الحمض الأميني الواحد قد توافقه عدة رامزات.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_01_adn.svg"
  },
  {
    "id": 8,
    "unitId": 1,
    "questionText": "في سؤال بكالوريا قصير حول 1.2 — أنواع ARN: ARNm و ARNt و ARNr، بماذا نربط «ARNm»؟",
    "options": [
      "ينقل نسخة الرسالة الوراثية من النواة نحو الريبوزوم",
      "قطعة من ADN تحمل معلومة تركيب سلسلة ببتيدية أو بروتين معين",
      "تتشكل بين حمضين أمينيين خلال الاستطالة",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 0,
    "explanation": "ARNm يرتبط هنا بـ: ينقل نسخة الرسالة الوراثية من النواة نحو الريبوزوم.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_04_arnt.svg"
  },
  {
    "id": 9,
    "unitId": 1,
    "questionText": "في محور 1.2 — أنواع ARN: ARNm و ARNt و ARNr، أي عبارة تساعد على تمييز «ARNt» عن المفاهيم القريبة؟",
    "options": [
      "رامزة بدء الترجمة وتشفر غالباً للميتيونين",
      "تركيب ARNm انطلاقاً من سلسلة ADN قالبية داخل النواة",
      "ينتج مباشرة أجساماً مضادة في كل الحالات.",
      "يحمل حمضاً أمينياً ومضاد رامزة مكمل لرامزة ARNm"
    ],
    "correctAnswerIndex": 3,
    "explanation": "ARNt يرتبط هنا بـ: يحمل حمضاً أمينياً ومضاد رامزة مكمل لرامزة ARNm.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_04_arnt.svg"
  },
  {
    "id": 10,
    "unitId": 1,
    "questionText": "إذا طُلب تفسير «ARNr» ضمن 1.2 — أنواع ARN: ARNm و ARNt و ARNr، فأي جواب هو الأدق؟",
    "options": [
      "يحمل السلسلة الببتيدية المتنامية",
      "رامزة بدء الترجمة وتشفر غالباً للميتيونين",
      "يدخل في تركيب الريبوزوم ويساهم في نشاطه",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 2,
    "explanation": "ARNr يرتبط هنا بـ: يدخل في تركيب الريبوزوم ويساهم في نشاطه.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_04_arnt.svg"
  },
  {
    "id": 11,
    "unitId": 1,
    "questionText": "في محور 1.2 — أنواع ARN: ARNm و ARNt و ARNr، أي وصف دقيق لـ«اليوراسيل U»؟",
    "options": [
      "يعوض الثيمين T في جزيئات ARN",
      "رامزات توقف لا يوافقها ARNt حامل لحمض أميني",
      "رامزة بدء الترجمة وتشفر غالباً للميتيونين",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 0,
    "explanation": "اليوراسيل U يرتبط هنا بـ: يعوض الثيمين T في جزيئات ARN.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_04_arnt.svg"
  },
  {
    "id": 12,
    "unitId": 1,
    "questionText": "في موضوع 1.2 — أنواع ARN: ARNm و ARNt و ARNr، أي عبارة صحيحة حول «ARN»؟",
    "options": [
      "إزالة الإنترونات وربط الإكسونات لإنتاج ARNm ناضج",
      "منطقة ADN يرتبط بها ARN بوليميراز لبدء الاستنساخ",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس.",
      "غالباً أحادي السلسلة وأقل استقراراً من ADN"
    ],
    "correctAnswerIndex": 3,
    "explanation": "ARN يرتبط هنا بـ: غالباً أحادي السلسلة وأقل استقراراً من ADN.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_04_arnt.svg"
  },
  {
    "id": 13,
    "unitId": 1,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «مضاد الرامزة» ضمن 1.2 — أنواع ARN: ARNm و ARNt و ARNr.",
    "options": [
      "تركيب ARNm انطلاقاً من سلسلة ADN قالبية داخل النواة",
      "يعوض الثيمين T في جزيئات ARN",
      "يعني توقف كل التحولات الطاقوية في الخلية.",
      "ثلاث قواعد في ARNt تتكامل مع رامزة ARNm"
    ],
    "correctAnswerIndex": 3,
    "explanation": "مضاد الرامزة يرتبط هنا بـ: ثلاث قواعد في ARNt تتكامل مع رامزة ARNm.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_04_arnt.svg"
  },
  {
    "id": 14,
    "unitId": 1,
    "questionText": "في محور 1.2 — أنواع ARN: ARNm و ARNt و ARNr، أي إكمال صحيح: «ARNm الناضج» ← ________؟",
    "options": [
      "رامزات توقف لا يوافقها ARNt حامل لحمض أميني",
      "ناتج إزالة الإنترونات وربط الإكسونات عند حقيقيات النوى",
      "تتشكل بين حمضين أمينيين خلال الاستطالة",
      "يعني توقف كل التحولات الطاقوية في الخلية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "ARNm الناضج يرتبط هنا بـ: ناتج إزالة الإنترونات وربط الإكسونات عند حقيقيات النوى.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_04_arnt.svg"
  },
  {
    "id": 15,
    "unitId": 1,
    "questionText": "عند مراجعة 1.3 — الاستنساخ Transcription، ما المعلومة التي لا يجب الخلط فيها حول «الاستنساخ»؟",
    "options": [
      "رامزات توقف لا يوافقها ARNt حامل لحمض أميني",
      "جزء غير مشفر يزال أثناء النضج",
      "تركيب ARNm انطلاقاً من سلسلة ADN قالبية داخل النواة",
      "ينتج مباشرة أجساماً مضادة في كل الحالات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الاستنساخ يرتبط هنا بـ: تركيب ARNm انطلاقاً من سلسلة ADN قالبية داخل النواة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_02_transcription.svg"
  },
  {
    "id": 16,
    "unitId": 1,
    "questionText": "ضمن 1.3 — الاستنساخ Transcription، ما الخيار الموافق للبرنامج عندما نذكر «ARN بوليميراز»؟",
    "options": [
      "مرحلة إضافة ريبونوكليوتيدات مكملة للقالب",
      "يركب ARN في اتجاه 5 نحو 3 ويقرأ القالب 3 نحو 5",
      "تركيب ARNm انطلاقاً من سلسلة ADN قالبية داخل النواة",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة."
    ],
    "correctAnswerIndex": 1,
    "explanation": "ARN بوليميراز يرتبط هنا بـ: يركب ARN في اتجاه 5 نحو 3 ويقرأ القالب 3 نحو 5.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_02_transcription.svg"
  },
  {
    "id": 17,
    "unitId": 1,
    "questionText": "في 1.3 — الاستنساخ Transcription، أي علاقة صحيحة يبيّنها مصطلح «السلسلة القالبية»؟",
    "options": [
      "قطعة من ADN تحمل معلومة تركيب سلسلة ببتيدية أو بروتين معين",
      "انفصال ARNm عند بلوغ تسلسل نهاية الاستنساخ",
      "يدل على زيادة غير محدودة في السرعة دون إشباع.",
      "السلسلة التي تُستعمل مرجعاً لتكامل قواعد ARNm"
    ],
    "correctAnswerIndex": 3,
    "explanation": "السلسلة القالبية يرتبط هنا بـ: السلسلة التي تُستعمل مرجعاً لتكامل قواعد ARNm.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_02_transcription.svg"
  },
  {
    "id": 18,
    "unitId": 1,
    "questionText": "في سؤال بكالوريا قصير حول 1.3 — الاستنساخ Transcription، بماذا نربط «المحرّض»؟",
    "options": [
      "يدخل في تركيب الريبوزوم ويساهم في نشاطه",
      "منطقة ADN يرتبط بها ARN بوليميراز لبدء الاستنساخ",
      "إزالة الإنترونات وربط الإكسونات لإنتاج ARNm ناضج",
      "يُترجم مباشرة داخل النواة دون المرور بـARNm."
    ],
    "correctAnswerIndex": 1,
    "explanation": "المحرّض يرتبط هنا بـ: منطقة ADN يرتبط بها ARN بوليميراز لبدء الاستنساخ.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_02_transcription.svg"
  },
  {
    "id": 19,
    "unitId": 1,
    "questionText": "في محور 1.3 — الاستنساخ Transcription، أي عبارة تساعد على تمييز «الاستطالة» عن المفاهيم القريبة؟",
    "options": [
      "تجلب عامل تحرير ولا تجلب ARNt عادياً",
      "يركب ARN في اتجاه 5 نحو 3 ويقرأ القالب 3 نحو 5",
      "مرحلة إضافة ريبونوكليوتيدات مكملة للقالب",
      "ينتج مباشرة أجساماً مضادة في كل الحالات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الاستطالة يرتبط هنا بـ: مرحلة إضافة ريبونوكليوتيدات مكملة للقالب.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_02_transcription.svg"
  },
  {
    "id": 20,
    "unitId": 1,
    "questionText": "إذا طُلب تفسير «الإنهاء» ضمن 1.3 — الاستنساخ Transcription، فأي جواب هو الأدق؟",
    "options": [
      "غالباً أحادي السلسلة وأقل استقراراً من ADN",
      "يعدل بعض البروتينات ويوجهها نحو وجهتها",
      "يتم فقط في غياب الماء والأيونات.",
      "انفصال ARNm عند بلوغ تسلسل نهاية الاستنساخ"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الإنهاء يرتبط هنا بـ: انفصال ARNm عند بلوغ تسلسل نهاية الاستنساخ.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_02_transcription.svg"
  },
  {
    "id": 21,
    "unitId": 1,
    "questionText": "في محور 1.3 — الاستنساخ Transcription، أي وصف دقيق لـ«TAC قالبية»؟",
    "options": [
      "يركب ARN في اتجاه 5 نحو 3 ويقرأ القالب 3 نحو 5",
      "تعطي في ARNm الرامزة AUG إذا قرئت 3 نحو 5",
      "قطعة من ADN تحمل معلومة تركيب سلسلة ببتيدية أو بروتين معين",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 1,
    "explanation": "TAC قالبية يرتبط هنا بـ: تعطي في ARNm الرامزة AUG إذا قرئت 3 نحو 5.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_02_transcription.svg"
  },
  {
    "id": 22,
    "unitId": 1,
    "questionText": "في موضوع 1.4 — الترجمة Translation، أي عبارة صحيحة حول «الترجمة»؟",
    "options": [
      "يستقبل ARNt الحامل للحمض الأميني الجديد",
      "قراءة رامزات ARNm لتركيب سلسلة ببتيدية على الريبوزوم",
      "كل رامزة من ثلاث قواعد في ARNm تحدد حمضاً أمينياً",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الترجمة يرتبط هنا بـ: قراءة رامزات ARNm لتركيب سلسلة ببتيدية على الريبوزوم.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_03_traduction.svg"
  },
  {
    "id": 23,
    "unitId": 1,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «اتجاه القراءة» ضمن 1.4 — الترجمة Translation.",
    "options": [
      "عدة ريبوزومات تترجم ARNm واحداً في الوقت نفسه",
      "ترتبط بها ريبوزومات تصنع بروتينات موجهة للإفراز أو الغشاء",
      "يقرأ الريبوزوم ARNm من 5 نحو 3",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "اتجاه القراءة يرتبط هنا بـ: يقرأ الريبوزوم ARNm من 5 نحو 3.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_03_traduction.svg"
  },
  {
    "id": 24,
    "unitId": 1,
    "questionText": "في محور 1.4 — الترجمة Translation، أي إكمال صحيح: «مرحلة البدء» ← ________؟",
    "options": [
      "منطقة ADN يرتبط بها ARN بوليميراز لبدء الاستنساخ",
      "مرحلة ضرورية ليكتسب البروتين بنيته الوظيفية",
      "يعني توقف كل التحولات الطاقوية في الخلية.",
      "تتعرف الوحدة الريبوزومية على AUG ويرتبط ARNt-Met"
    ],
    "correctAnswerIndex": 3,
    "explanation": "مرحلة البدء يرتبط هنا بـ: تتعرف الوحدة الريبوزومية على AUG ويرتبط ARNt-Met.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_03_traduction.svg"
  },
  {
    "id": 25,
    "unitId": 1,
    "questionText": "عند مراجعة 1.4 — الترجمة Translation، ما المعلومة التي لا يجب الخلط فيها حول «الرابطة الببتيدية»؟",
    "options": [
      "تتشكل بين حمضين أمينيين خلال الاستطالة",
      "انفصال ARNm عند بلوغ تسلسل نهاية الاستنساخ",
      "مرحلة إضافة ريبونوكليوتيدات مكملة للقالب",
      "يتم فقط في غياب الماء والأيونات."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الرابطة الببتيدية يرتبط هنا بـ: تتشكل بين حمضين أمينيين خلال الاستطالة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_03_traduction.svg"
  },
  {
    "id": 26,
    "unitId": 1,
    "questionText": "ضمن 1.4 — الترجمة Translation، ما الخيار الموافق للبرنامج عندما نذكر «الموقع A»؟",
    "options": [
      "تتعرف الوحدة الريبوزومية على AUG ويرتبط ARNt-Met",
      "عدة ريبوزومات تترجم ARNm واحداً في الوقت نفسه",
      "يستقبل ARNt الحامل للحمض الأميني الجديد",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الموقع A يرتبط هنا بـ: يستقبل ARNt الحامل للحمض الأميني الجديد.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_03_traduction.svg"
  },
  {
    "id": 27,
    "unitId": 1,
    "questionText": "في 1.4 — الترجمة Translation، أي علاقة صحيحة يبيّنها مصطلح «الموقع P»؟",
    "options": [
      "عدة ريبوزومات تترجم ARNm واحداً في الوقت نفسه",
      "يحمل السلسلة الببتيدية المتنامية",
      "A تقابل T وG تقابل C في ADN",
      "ينتج مباشرة أجساماً مضادة في كل الحالات."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الموقع P يرتبط هنا بـ: يحمل السلسلة الببتيدية المتنامية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_03_traduction.svg"
  },
  {
    "id": 28,
    "unitId": 1,
    "questionText": "في سؤال بكالوريا قصير حول 1.4 — الترجمة Translation، بماذا نربط «رامزة التوقف»؟",
    "options": [
      "تجلب عامل تحرير ولا تجلب ARNt عادياً",
      "الوحدة البنائية لـADN ويتكوّن من سكر وفوسفات وقاعدة آزوتية",
      "A تقابل T وG تقابل C في ADN",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "رامزة التوقف يرتبط هنا بـ: تجلب عامل تحرير ولا تجلب ARNt عادياً.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_03_traduction.svg"
  },
  {
    "id": 29,
    "unitId": 1,
    "questionText": "في محور 1.5 — البولي ريبوزوم ومصير البروتين، أي عبارة تساعد على تمييز «البولي ريبوزوم» عن المفاهيم القريبة؟",
    "options": [
      "يركب ARN في اتجاه 5 نحو 3 ويقرأ القالب 3 نحو 5",
      "عدة ريبوزومات تترجم ARNm واحداً في الوقت نفسه",
      "ثلاث قواعد في ARNt تتكامل مع رامزة ARNm",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 1,
    "explanation": "البولي ريبوزوم يرتبط هنا بـ: عدة ريبوزومات تترجم ARNm واحداً في الوقت نفسه.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 30,
    "unitId": 1,
    "questionText": "إذا طُلب تفسير «نضج ARNm» ضمن 1.5 — البولي ريبوزوم ومصير البروتين، فأي جواب هو الأدق؟",
    "options": [
      "كل رامزة من ثلاث قواعد في ARNm تحدد حمضاً أمينياً",
      "A تقابل T وG تقابل C في ADN",
      "إزالة الإنترونات وربط الإكسونات لإنتاج ARNm ناضج",
      "تُقرأ الرامزات دائماً من 3 نحو 5 أثناء الترجمة."
    ],
    "correctAnswerIndex": 2,
    "explanation": "نضج ARNm يرتبط هنا بـ: إزالة الإنترونات وربط الإكسونات لإنتاج ARNm ناضج.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 31,
    "unitId": 1,
    "questionText": "في محور 1.5 — البولي ريبوزوم ومصير البروتين، أي وصف دقيق لـ«الإكسون»؟",
    "options": [
      "جزء مشفر يبقى في ARNm الناضج",
      "ناتج إزالة الإنترونات وربط الإكسونات عند حقيقيات النوى",
      "ثلاث قواعد في ARNt تتكامل مع رامزة ARNm",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الإكسون يرتبط هنا بـ: جزء مشفر يبقى في ARNm الناضج.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 32,
    "unitId": 1,
    "questionText": "في موضوع 1.5 — البولي ريبوزوم ومصير البروتين، أي عبارة صحيحة حول «الإنترون»؟",
    "options": [
      "جزء غير مشفر يزال أثناء النضج",
      "تجلب عامل تحرير ولا تجلب ARNt عادياً",
      "ترتبط بها ريبوزومات تصنع بروتينات موجهة للإفراز أو الغشاء",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الإنترون يرتبط هنا بـ: جزء غير مشفر يزال أثناء النضج.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 33,
    "unitId": 1,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «الطي الفراغي» ضمن 1.5 — البولي ريبوزوم ومصير البروتين.",
    "options": [
      "يعوض الثيمين T في جزيئات ARN",
      "رامزة بدء الترجمة وتشفر غالباً للميتيونين",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور.",
      "مرحلة ضرورية ليكتسب البروتين بنيته الوظيفية"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الطي الفراغي يرتبط هنا بـ: مرحلة ضرورية ليكتسب البروتين بنيته الوظيفية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 34,
    "unitId": 1,
    "questionText": "في محور 1.5 — البولي ريبوزوم ومصير البروتين، أي إكمال صحيح: «جهاز غولجي» ← ________؟",
    "options": [
      "يعدل بعض البروتينات ويوجهها نحو وجهتها",
      "قطعة من ADN تحمل معلومة تركيب سلسلة ببتيدية أو بروتين معين",
      "تركيب ARNm انطلاقاً من سلسلة ADN قالبية داخل النواة",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "جهاز غولجي يرتبط هنا بـ: يعدل بعض البروتينات ويوجهها نحو وجهتها.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 35,
    "unitId": 1,
    "questionText": "عند مراجعة 1.5 — البولي ريبوزوم ومصير البروتين، ما المعلومة التي لا يجب الخلط فيها حول «الشبكة الإندوبلازمية الخشنة»؟",
    "options": [
      "ترتبط بها ريبوزومات تصنع بروتينات موجهة للإفراز أو الغشاء",
      "مرحلة إضافة ريبونوكليوتيدات مكملة للقالب",
      "جزء غير مشفر يزال أثناء النضج",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الشبكة الإندوبلازمية الخشنة يرتبط هنا بـ: ترتبط بها ريبوزومات تصنع بروتينات موجهة للإفراز أو الغشاء.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 36,
    "unitId": 2,
    "questionText": "ضمن 2.1 — الأحماض الأمينية والرابطة الببتيدية، ما الخيار الموافق للبرنامج عندما نذكر «الحمض الأميني»؟",
    "options": [
      "بنية ثانوية ممتدة تثبتها روابط هيدروجينية بين أجزاء السلسلة",
      "وحدة بناء البروتينات وله NH2 وCOOH وجذر R",
      "لا يستطيع الجسم تركيبها بكمية كافية",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الحمض الأميني يرتبط هنا بـ: وحدة بناء البروتينات وله NH2 وCOOH وجذر R.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 37,
    "unitId": 2,
    "questionText": "في 2.1 — الأحماض الأمينية والرابطة الببتيدية، أي علاقة صحيحة يبيّنها مصطلح «الجذر R»؟",
    "options": [
      "ينتج عن استبدال Glu بـVal في سلسلة بيتا",
      "تدفع جذوراً غير قطبية نحو داخل البروتين",
      "اختلافه يحدد خصائص الحمض الأميني",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الجذر R يرتبط هنا بـ: اختلافه يحدد خصائص الحمض الأميني.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 38,
    "unitId": 2,
    "questionText": "في سؤال بكالوريا قصير حول 2.1 — الأحماض الأمينية والرابطة الببتيدية، بماذا نربط «الرابطة الببتيدية»؟",
    "options": [
      "غالباً يؤدي وظيفة بنيوية مثل الكولاجين",
      "يتكون من أحماض أمينية متقاربة فراغياً لا خطياً بالضرورة",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً.",
      "رابطة تساهمية بين COOH لحمض وNH2 لآخر مع طرح ماء"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الرابطة الببتيدية يرتبط هنا بـ: رابطة تساهمية بين COOH لحمض وNH2 لآخر مع طرح ماء.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 39,
    "unitId": 2,
    "questionText": "في محور 2.1 — الأحماض الأمينية والرابطة الببتيدية، أي عبارة تساعد على تمييز «عديد الببتيد» عن المفاهيم القريبة؟",
    "options": [
      "وظيفة البروتين مرتبطة بشكله الفراغي",
      "سلسلة طويلة من أحماض أمينية مترابطة بروابط ببتيدية",
      "ينتج عن استبدال Glu بـVal في سلسلة بيتا",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 1,
    "explanation": "عديد الببتيد يرتبط هنا بـ: سلسلة طويلة من أحماض أمينية مترابطة بروابط ببتيدية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 40,
    "unitId": 2,
    "questionText": "إذا طُلب تفسير «الطرف N» ضمن 2.1 — الأحماض الأمينية والرابطة الببتيدية، فأي جواب هو الأدق؟",
    "options": [
      "بنية ثانوية ممتدة تثبتها روابط هيدروجينية بين أجزاء السلسلة",
      "تدفع جذوراً غير قطبية نحو داخل البروتين",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور.",
      "نهاية السلسلة الحاملة للمجموعة الأمينية الحرة"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الطرف N يرتبط هنا بـ: نهاية السلسلة الحاملة للمجموعة الأمينية الحرة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 41,
    "unitId": 2,
    "questionText": "في محور 2.1 — الأحماض الأمينية والرابطة الببتيدية، أي وصف دقيق لـ«الطرف C»؟",
    "options": [
      "بنية ثانوية ممتدة تثبتها روابط هيدروجينية بين أجزاء السلسلة",
      "مثال على أثر طفرة واحدة في البنية والوظيفة",
      "نهاية السلسلة الحاملة للمجموعة الكربوكسيلية الحرة",
      "الرابطة الببتيدية هي رابطة هيدروجينية ضعيفة."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الطرف C يرتبط هنا بـ: نهاية السلسلة الحاملة للمجموعة الكربوكسيلية الحرة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 42,
    "unitId": 2,
    "questionText": "في موضوع 2.1 — الأحماض الأمينية والرابطة الببتيدية، أي عبارة صحيحة حول «الأحماض الأمينية الأساسية»؟",
    "options": [
      "فقدان البنية الفراغية مع بقاء البنية الأولية غالباً",
      "رابطة تساهمية بين COOH لحمض وNH2 لآخر مع طرح ماء",
      "كل البروتينات لها بنية رباعية مهما كان عدد السلاسل.",
      "لا يستطيع الجسم تركيبها بكمية كافية"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الأحماض الأمينية الأساسية يرتبط هنا بـ: لا يستطيع الجسم تركيبها بكمية كافية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 43,
    "unitId": 2,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «تفاعل التكاثف» ضمن 2.1 — الأحماض الأمينية والرابطة الببتيدية.",
    "options": [
      "وظيفة البروتين مرتبطة بشكله الفراغي",
      "تجمع عدة سلاسل ببتيدية في بروتين وظيفي",
      "ينتج الرابطة الببتيدية مع تحرير H2O",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 2,
    "explanation": "تفاعل التكاثف يرتبط هنا بـ: ينتج الرابطة الببتيدية مع تحرير H2O.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 44,
    "unitId": 2,
    "questionText": "في محور 2.1 — الأحماض الأمينية والرابطة الببتيدية، أي إكمال صحيح: «التحلل المائي» ← ________؟",
    "options": [
      "جزء من الجسم المضاد يتكامل مع الحاتمة",
      "يكسر الرابطة الببتيدية بإضافة الماء",
      "الشكل الفراغي العام لسلسلة ببتيدية واحدة",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور."
    ],
    "correctAnswerIndex": 1,
    "explanation": "التحلل المائي يرتبط هنا بـ: يكسر الرابطة الببتيدية بإضافة الماء.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 45,
    "unitId": 2,
    "questionText": "عند مراجعة 2.2 — البنيات: أولية، ثانوية، ثالثية، رباعية، ما المعلومة التي لا يجب الخلط فيها حول «البنية الأولية»؟",
    "options": [
      "بنية ثانوية ممتدة تثبتها روابط هيدروجينية بين أجزاء السلسلة",
      "تسلسل خطي للأحماض الأمينية في السلسلة",
      "نهاية السلسلة الحاملة للمجموعة الكربوكسيلية الحرة",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 1,
    "explanation": "البنية الأولية يرتبط هنا بـ: تسلسل خطي للأحماض الأمينية في السلسلة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 46,
    "unitId": 2,
    "questionText": "ضمن 2.2 — البنيات: أولية، ثانوية، ثالثية، رباعية، ما الخيار الموافق للبرنامج عندما نذكر «البنية الثانوية»؟",
    "options": [
      "جزء من الجسم المضاد يتكامل مع الحاتمة",
      "لولب ألفا أو صفيحة بيتا تثبتهما روابط هيدروجينية",
      "وحدة بناء البروتينات وله NH2 وCOOH وجذر R",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 1,
    "explanation": "البنية الثانوية يرتبط هنا بـ: لولب ألفا أو صفيحة بيتا تثبتهما روابط هيدروجينية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 47,
    "unitId": 2,
    "questionText": "في 2.2 — البنيات: أولية، ثانوية، ثالثية، رباعية، أي علاقة صحيحة يبيّنها مصطلح «البنية الثالثية»؟",
    "options": [
      "الشكل الفراغي العام لسلسلة ببتيدية واحدة",
      "تسلسل خطي للأحماض الأمينية في السلسلة",
      "بنية ثانوية ممتدة تثبتها روابط هيدروجينية بين أجزاء السلسلة",
      "كل البروتينات لها بنية رباعية مهما كان عدد السلاسل."
    ],
    "correctAnswerIndex": 0,
    "explanation": "البنية الثالثية يرتبط هنا بـ: الشكل الفراغي العام لسلسلة ببتيدية واحدة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 48,
    "unitId": 2,
    "questionText": "في سؤال بكالوريا قصير حول 2.2 — البنيات: أولية، ثانوية، ثالثية، رباعية، بماذا نربط «البنية الرباعية»؟",
    "options": [
      "نهاية السلسلة الحاملة للمجموعة الأمينية الحرة",
      "جزء من الجسم المضاد يتكامل مع الحاتمة",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً.",
      "تجمع عدة سلاسل ببتيدية في بروتين وظيفي"
    ],
    "correctAnswerIndex": 3,
    "explanation": "البنية الرباعية يرتبط هنا بـ: تجمع عدة سلاسل ببتيدية في بروتين وظيفي.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 49,
    "unitId": 2,
    "questionText": "في محور 2.2 — البنيات: أولية، ثانوية، ثالثية، رباعية، أي عبارة تساعد على تمييز «جسور S-S» عن المفاهيم القريبة؟",
    "options": [
      "شرط لظهور النشاط البيولوجي للبروتين",
      "غالباً يؤدي وظيفة نقل أو تحفيز أو مناعة",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً.",
      "روابط تساهمية بين بقايا السيستئين تثبت البنية الثالثية"
    ],
    "correctAnswerIndex": 3,
    "explanation": "جسور S-S يرتبط هنا بـ: روابط تساهمية بين بقايا السيستئين تثبت البنية الثالثية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 50,
    "unitId": 2,
    "questionText": "إذا طُلب تفسير «التفاعلات الكارهة للماء» ضمن 2.2 — البنيات: أولية، ثانوية، ثالثية، رباعية، فأي جواب هو الأدق؟",
    "options": [
      "تجمع عدة سلاسل ببتيدية في بروتين وظيفي",
      "تدفع جذوراً غير قطبية نحو داخل البروتين",
      "بروتين نوعي يرتبط بالمستضد عبر الباراتوب",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 1,
    "explanation": "التفاعلات الكارهة للماء يرتبط هنا بـ: تدفع جذوراً غير قطبية نحو داخل البروتين.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 51,
    "unitId": 2,
    "questionText": "في محور 2.2 — البنيات: أولية، ثانوية، ثالثية، رباعية، أي وصف دقيق لـ«بروتين سلسلة واحدة»؟",
    "options": [
      "لا يستطيع الجسم تركيبها بكمية كافية",
      "لولب ألفا أو صفيحة بيتا تثبتهما روابط هيدروجينية",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس.",
      "لا يملك بنية رباعية حقيقية"
    ],
    "correctAnswerIndex": 3,
    "explanation": "بروتين سلسلة واحدة يرتبط هنا بـ: لا يملك بنية رباعية حقيقية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 52,
    "unitId": 2,
    "questionText": "في موضوع 2.2 — البنيات: أولية، ثانوية، ثالثية، رباعية، أي عبارة صحيحة حول «الصفيحة بيتا»؟",
    "options": [
      "بنية ثانوية ممتدة تثبتها روابط هيدروجينية بين أجزاء السلسلة",
      "بروتين ليفي ثلاثي السلاسل يعطي مقاومة للأنسجة",
      "غالباً يؤدي وظيفة بنيوية مثل الكولاجين",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الصفيحة بيتا يرتبط هنا بـ: بنية ثانوية ممتدة تثبتها روابط هيدروجينية بين أجزاء السلسلة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 53,
    "unitId": 2,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «المبدأ بنية/وظيفة» ضمن 2.3 — العلاقة بنية/وظيفة.",
    "options": [
      "وظيفة البروتين مرتبطة بشكله الفراغي",
      "بروتين رباعي ينقل O2 بفضل مجموعات الهيم",
      "رابطة تساهمية بين COOH لحمض وNH2 لآخر مع طرح ماء",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "المبدأ بنية/وظيفة يرتبط هنا بـ: وظيفة البروتين مرتبطة بشكله الفراغي.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 54,
    "unitId": 2,
    "questionText": "في محور 2.3 — العلاقة بنية/وظيفة، أي إكمال صحيح: «الطفرة» ← ________؟",
    "options": [
      "قد تغير البنية الأولية فتغير الشكل والوظيفة",
      "لا يملك بنية رباعية حقيقية",
      "غالباً يؤدي وظيفة بنيوية مثل الكولاجين",
      "يتم فقط في غياب الماء والأيونات."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الطفرة يرتبط هنا بـ: قد تغير البنية الأولية فتغير الشكل والوظيفة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 55,
    "unitId": 2,
    "questionText": "عند مراجعة 2.3 — العلاقة بنية/وظيفة، ما المعلومة التي لا يجب الخلط فيها حول «التمسخ»؟",
    "options": [
      "يكسر الرابطة الببتيدية بإضافة الماء",
      "قد تغير البنية الأولية فتغير الشكل والوظيفة",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات.",
      "فقدان البنية الفراغية مع بقاء البنية الأولية غالباً"
    ],
    "correctAnswerIndex": 3,
    "explanation": "التمسخ يرتبط هنا بـ: فقدان البنية الفراغية مع بقاء البنية الأولية غالباً.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 56,
    "unitId": 2,
    "questionText": "ضمن 2.3 — العلاقة بنية/وظيفة، ما الخيار الموافق للبرنامج عندما نذكر «الموقع الفعال»؟",
    "options": [
      "الشكل الفراغي العام لسلسلة ببتيدية واحدة",
      "يتكون من أحماض أمينية متقاربة فراغياً لا خطياً بالضرورة",
      "قد تغير البنية الأولية فتغير الشكل والوظيفة",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الموقع الفعال يرتبط هنا بـ: يتكون من أحماض أمينية متقاربة فراغياً لا خطياً بالضرورة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 57,
    "unitId": 2,
    "questionText": "في 2.3 — العلاقة بنية/وظيفة، أي علاقة صحيحة يبيّنها مصطلح «الطي الصحيح»؟",
    "options": [
      "غالباً يؤدي وظيفة نقل أو تحفيز أو مناعة",
      "رابطة تساهمية بين COOH لحمض وNH2 لآخر مع طرح ماء",
      "شرط لظهور النشاط البيولوجي للبروتين",
      "يعني توقف كل التحولات الطاقوية في الخلية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الطي الصحيح يرتبط هنا بـ: شرط لظهور النشاط البيولوجي للبروتين.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 58,
    "unitId": 2,
    "questionText": "في سؤال بكالوريا قصير حول 2.3 — العلاقة بنية/وظيفة، بماذا نربط «البروتين الليفي»؟",
    "options": [
      "غالباً يؤدي وظيفة نقل أو تحفيز أو مناعة",
      "غالباً يؤدي وظيفة بنيوية مثل الكولاجين",
      "سلسلة طويلة من أحماض أمينية مترابطة بروابط ببتيدية",
      "يعني توقف كل التحولات الطاقوية في الخلية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "البروتين الليفي يرتبط هنا بـ: غالباً يؤدي وظيفة بنيوية مثل الكولاجين.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 59,
    "unitId": 2,
    "questionText": "في محور 2.3 — العلاقة بنية/وظيفة، أي عبارة تساعد على تمييز «البروتين الكروي» عن المفاهيم القريبة؟",
    "options": [
      "غالباً يؤدي وظيفة نقل أو تحفيز أو مناعة",
      "تسلسل خطي للأحماض الأمينية في السلسلة",
      "نهاية السلسلة الحاملة للمجموعة الكربوكسيلية الحرة",
      "يعني توقف كل التحولات الطاقوية في الخلية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "البروتين الكروي يرتبط هنا بـ: غالباً يؤدي وظيفة نقل أو تحفيز أو مناعة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 60,
    "unitId": 2,
    "questionText": "إذا طُلب تفسير «تغيير pH أو الحرارة» ضمن 2.3 — العلاقة بنية/وظيفة، فأي جواب هو الأدق؟",
    "options": [
      "ينتج الرابطة الببتيدية مع تحرير H2O",
      "جزء من المستضد يتعرف عليه الجسم المضاد",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية.",
      "قد يغير الروابط المثبتة للبنية الفراغية"
    ],
    "correctAnswerIndex": 3,
    "explanation": "تغيير pH أو الحرارة يرتبط هنا بـ: قد يغير الروابط المثبتة للبنية الفراغية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 61,
    "unitId": 2,
    "questionText": "في محور 2.4 — الهيموغلوبين، الكولاجين، الأجسام المضادة، أي وصف دقيق لـ«الهيموغلوبين»؟",
    "options": [
      "مثال على أثر طفرة واحدة في البنية والوظيفة",
      "لا يملك بنية رباعية حقيقية",
      "يتم فقط في غياب الماء والأيونات.",
      "بروتين رباعي ينقل O2 بفضل مجموعات الهيم"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الهيموغلوبين يرتبط هنا بـ: بروتين رباعي ينقل O2 بفضل مجموعات الهيم.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 62,
    "unitId": 2,
    "questionText": "في موضوع 2.4 — الهيموغلوبين، الكولاجين، الأجسام المضادة، أي عبارة صحيحة حول «مجموعة الهيم»؟",
    "options": [
      "الشكل الفراغي العام لسلسلة ببتيدية واحدة",
      "قد تغير البنية الأولية فتغير الشكل والوظيفة",
      "تحتوي Fe2+ الذي يرتبط بالأكسجين",
      "كل البروتينات لها بنية رباعية مهما كان عدد السلاسل."
    ],
    "correctAnswerIndex": 2,
    "explanation": "مجموعة الهيم يرتبط هنا بـ: تحتوي Fe2+ الذي يرتبط بالأكسجين.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 63,
    "unitId": 2,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «HbS» ضمن 2.4 — الهيموغلوبين، الكولاجين، الأجسام المضادة.",
    "options": [
      "ينتج عن استبدال Glu بـVal في سلسلة بيتا",
      "رابطة تساهمية بين COOH لحمض وNH2 لآخر مع طرح ماء",
      "ينتج الرابطة الببتيدية مع تحرير H2O",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 0,
    "explanation": "HbS يرتبط هنا بـ: ينتج عن استبدال Glu بـVal في سلسلة بيتا.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 64,
    "unitId": 2,
    "questionText": "في محور 2.4 — الهيموغلوبين، الكولاجين، الأجسام المضادة، أي إكمال صحيح: «فقر الدم المنجلي» ← ________؟",
    "options": [
      "مثال على أثر طفرة واحدة في البنية والوظيفة",
      "روابط تساهمية بين بقايا السيستئين تثبت البنية الثالثية",
      "فقدان البنية الفراغية مع بقاء البنية الأولية غالباً",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 0,
    "explanation": "فقر الدم المنجلي يرتبط هنا بـ: مثال على أثر طفرة واحدة في البنية والوظيفة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 65,
    "unitId": 2,
    "questionText": "عند مراجعة 2.4 — الهيموغلوبين، الكولاجين، الأجسام المضادة، ما المعلومة التي لا يجب الخلط فيها حول «الكولاجين»؟",
    "options": [
      "بروتين ليفي ثلاثي السلاسل يعطي مقاومة للأنسجة",
      "لا يملك بنية رباعية حقيقية",
      "تحتوي Fe2+ الذي يرتبط بالأكسجين",
      "يعني توقف كل التحولات الطاقوية في الخلية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الكولاجين يرتبط هنا بـ: بروتين ليفي ثلاثي السلاسل يعطي مقاومة للأنسجة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 66,
    "unitId": 2,
    "questionText": "ضمن 2.4 — الهيموغلوبين، الكولاجين، الأجسام المضادة، ما الخيار الموافق للبرنامج عندما نذكر «الجسم المضاد»؟",
    "options": [
      "قد يغير الروابط المثبتة للبنية الفراغية",
      "لا يستطيع الجسم تركيبها بكمية كافية",
      "بروتين نوعي يرتبط بالمستضد عبر الباراتوب",
      "ينتج مباشرة أجساماً مضادة في كل الحالات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الجسم المضاد يرتبط هنا بـ: بروتين نوعي يرتبط بالمستضد عبر الباراتوب.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 67,
    "unitId": 2,
    "questionText": "في 2.4 — الهيموغلوبين، الكولاجين، الأجسام المضادة، أي علاقة صحيحة يبيّنها مصطلح «الباراتوب»؟",
    "options": [
      "ينتج عن استبدال Glu بـVal في سلسلة بيتا",
      "روابط تساهمية بين بقايا السيستئين تثبت البنية الثالثية",
      "جزء من الجسم المضاد يتكامل مع الحاتمة",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الباراتوب يرتبط هنا بـ: جزء من الجسم المضاد يتكامل مع الحاتمة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 68,
    "unitId": 2,
    "questionText": "في سؤال بكالوريا قصير حول 2.4 — الهيموغلوبين، الكولاجين، الأجسام المضادة، بماذا نربط «الحاتمة»؟",
    "options": [
      "وظيفة البروتين مرتبطة بشكله الفراغي",
      "لا يملك بنية رباعية حقيقية",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً.",
      "جزء من المستضد يتعرف عليه الجسم المضاد"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الحاتمة يرتبط هنا بـ: جزء من المستضد يتعرف عليه الجسم المضاد.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 69,
    "unitId": 3,
    "questionText": "في محور 3.1 — الإنزيم، الركيزة، الناتج، الموقع الفعال، أي عبارة تساعد على تمييز «الإنزيم» عن المفاهيم القريبة؟",
    "options": [
      "غالباً جرسي لأن لكل إنزيم pH أمثل",
      "مثال لمثبط يؤثر في السلسلة التنفسية",
      "محفز حيوي غالباً بروتيني يسرع التفاعل دون أن يستهلك",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الإنزيم يرتبط هنا بـ: محفز حيوي غالباً بروتيني يسرع التفاعل دون أن يستهلك.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 70,
    "unitId": 3,
    "questionText": "إذا طُلب تفسير «الركيزة» ضمن 3.1 — الإنزيم، الركيزة، الناتج، الموقع الفعال، فأي جواب هو الأدق؟",
    "options": [
      "سرعة قصوى عندما تكون كل المواقع الفعالة مشغولة تقريباً",
      "الجزيء الذي يعمل عليه الإنزيم",
      "يثبت غالباً خارج الموقع الفعال ويغير النشاط",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الركيزة يرتبط هنا بـ: الجزيء الذي يعمل عليه الإنزيم.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 71,
    "unitId": 3,
    "questionText": "في محور 3.1 — الإنزيم، الركيزة، الناتج، الموقع الفعال، أي وصف دقيق لـ«الناتج»؟",
    "options": [
      "غالباً جرسي لأن لكل إنزيم pH أمثل",
      "يخفض طاقة التنشيط ولا يغير حصيلة التفاعل",
      "يتم فقط في غياب الماء والأيونات.",
      "الجزيء المتحصل عليه بعد التحول الإنزيمي"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الناتج يرتبط هنا بـ: الجزيء المتحصل عليه بعد التحول الإنزيمي.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 72,
    "unitId": 3,
    "questionText": "في موضوع 3.1 — الإنزيم، الركيزة، الناتج، الموقع الفعال، أي عبارة صحيحة حول «الموقع الفعال»؟",
    "options": [
      "الجزيء المتحصل عليه بعد التحول الإنزيمي",
      "منطقة تثبيت الركيزة والتحفيز في الإنزيم",
      "تكسر روابط البنية الفراغية فتسبب تمسخاً",
      "النشاط الإنزيمي لا يتأثر بـpH أو الحرارة."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الموقع الفعال يرتبط هنا بـ: منطقة تثبيت الركيزة والتحفيز في الإنزيم.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 73,
    "unitId": 3,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «النوعية الإنزيمية» ضمن 3.1 — الإنزيم، الركيزة، الناتج، الموقع الفعال.",
    "options": [
      "مرتبطة بتكامل شكل وشحنات الموقع الفعال مع الركيزة",
      "جزء ينجز التحول الكيميائي للركيزة",
      "قيمة يكون عندها النشاط الإنزيمي أعظمياً",
      "النشاط الإنزيمي لا يتأثر بـpH أو الحرارة."
    ],
    "correctAnswerIndex": 0,
    "explanation": "النوعية الإنزيمية يرتبط هنا بـ: مرتبطة بتكامل شكل وشحنات الموقع الفعال مع الركيزة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 74,
    "unitId": 3,
    "questionText": "في محور 3.1 — الإنزيم، الركيزة، الناتج، الموقع الفعال، أي إكمال صحيح: «المحفز» ← ________؟",
    "options": [
      "يخفض طاقة التنشيط ولا يغير حصيلة التفاعل",
      "تفسر قبول ركائز متشابهة في بعض الحالات",
      "قيمة يكون عندها النشاط الإنزيمي أعظمياً",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 0,
    "explanation": "المحفز يرتبط هنا بـ: يخفض طاقة التنشيط ولا يغير حصيلة التفاعل.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 75,
    "unitId": 3,
    "questionText": "عند مراجعة 3.1 — الإنزيم، الركيزة، الناتج، الموقع الفعال، ما المعلومة التي لا يجب الخلط فيها حول «E+S»؟",
    "options": [
      "يتحول مؤقتاً إلى معقد ES قبل تحرير الناتج",
      "ينشط قرب pH متعادل",
      "ينفصل الناتج ويبقى الإنزيم دون استهلاك",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 0,
    "explanation": "E+S يرتبط هنا بـ: يتحول مؤقتاً إلى معقد ES قبل تحرير الناتج.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 76,
    "unitId": 3,
    "questionText": "ضمن 3.1 — الإنزيم، الركيزة، الناتج، الموقع الفعال، ما الخيار الموافق للبرنامج عندما نذكر «الإنزيم بعد التفاعل»؟",
    "options": [
      "ترفع السرعة حتى إشباع المواقع الفعالة",
      "ينافس الركيزة على الموقع الفعال",
      "ينتج مباشرة أجساماً مضادة في كل الحالات.",
      "يبقى قابلاً لإعادة الاستعمال"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الإنزيم بعد التفاعل يرتبط هنا بـ: يبقى قابلاً لإعادة الاستعمال.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 77,
    "unitId": 3,
    "questionText": "في 3.1 — الإنزيم، الركيزة، الناتج، الموقع الفعال، أي علاقة صحيحة يبيّنها مصطلح «بنية الإنزيم»؟",
    "options": [
      "يرتبط اسمه بنموذج القفل والمفتاح",
      "يبقى قابلاً لإعادة الاستعمال",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية.",
      "تحدد نشاطه لأنها تحدد شكل الموقع الفعال"
    ],
    "correctAnswerIndex": 3,
    "explanation": "بنية الإنزيم يرتبط هنا بـ: تحدد نشاطه لأنها تحدد شكل الموقع الفعال.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 78,
    "unitId": 3,
    "questionText": "في سؤال بكالوريا قصير حول 3.1 — الإنزيم، الركيزة، الناتج، الموقع الفعال، بماذا نربط «النوعية المطلقة»؟",
    "options": [
      "غالباً جرسي لأن لكل إنزيم pH أمثل",
      "إنزيم لا يقبل إلا ركيزة محددة جداً",
      "يفسر قدرة كمية قليلة من الإنزيم على تحويل ركائز كثيرة",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "النوعية المطلقة يرتبط هنا بـ: إنزيم لا يقبل إلا ركيزة محددة جداً.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 79,
    "unitId": 3,
    "questionText": "في محور 3.1 — الإنزيم، الركيزة، الناتج، الموقع الفعال، أي عبارة تساعد على تمييز «نوعية التفاعل» عن المفاهيم القريبة؟",
    "options": [
      "مرتبطة بتكامل شكل وشحنات الموقع الفعال مع الركيزة",
      "مثال لمثبط يؤثر في السلسلة التنفسية",
      "إنزيم يحفز نمط تفاعل معيناً",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 2,
    "explanation": "نوعية التفاعل يرتبط هنا بـ: إنزيم يحفز نمط تفاعل معيناً.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 80,
    "unitId": 3,
    "questionText": "إذا طُلب تفسير «تسمية -ase» ضمن 3.1 — الإنزيم، الركيزة، الناتج، الموقع الفعال، فأي جواب هو الأدق؟",
    "options": [
      "يفسر قدرة كمية قليلة من الإنزيم على تحويل ركائز كثيرة",
      "حالة انشغال معظم المواقع الفعالة بالركيزة",
      "كثير من الإنزيمات تنتهي بهذه اللاحقة",
      "زيادة الركيزة تلغي دائماً أثر كل المثبطات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "تسمية -ase يرتبط هنا بـ: كثير من الإنزيمات تنتهي بهذه اللاحقة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 81,
    "unitId": 3,
    "questionText": "في محور 3.2 — المعقد ES ونماذج عمل الإنزيم، أي وصف دقيق لـ«معقد ES»؟",
    "options": [
      "يرتبط اسمه بنموذج القفل والمفتاح",
      "جزء من الموقع الفعال يثبت الركيزة",
      "ارتباط مؤقت بين الإنزيم والركيزة",
      "زيادة الركيزة تلغي دائماً أثر كل المثبطات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "معقد ES يرتبط هنا بـ: ارتباط مؤقت بين الإنزيم والركيزة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 82,
    "unitId": 3,
    "questionText": "في موضوع 3.2 — المعقد ES ونماذج عمل الإنزيم، أي عبارة صحيحة حول «نموذج القفل والمفتاح»؟",
    "options": [
      "ترتبط عادة بقيمة Km منخفضة",
      "يتغير فيه شكل الموقع الفعال عند اقتراب الركيزة",
      "يفترض موقعاً فعالاً ثابتاً مكملاً للركيزة",
      "يعني توقف كل التحولات الطاقوية في الخلية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "نموذج القفل والمفتاح يرتبط هنا بـ: يفترض موقعاً فعالاً ثابتاً مكملاً للركيزة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 83,
    "unitId": 3,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «التلاؤم المحفز» ضمن 3.2 — المعقد ES ونماذج عمل الإنزيم.",
    "options": [
      "تركيز الركيزة عند نصف Vmax ويدل على الألفة",
      "غالباً غير عكوسي عند درجات مرتفعة جداً",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً.",
      "يتغير فيه شكل الموقع الفعال عند اقتراب الركيزة"
    ],
    "correctAnswerIndex": 3,
    "explanation": "التلاؤم المحفز يرتبط هنا بـ: يتغير فيه شكل الموقع الفعال عند اقتراب الركيزة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 84,
    "unitId": 3,
    "questionText": "في محور 3.2 — المعقد ES ونماذج عمل الإنزيم، أي إكمال صحيح: «مرحلة التحرير» ← ________؟",
    "options": [
      "تقلل أثر المثبط التنافسي نسبياً",
      "ينفصل الناتج ويبقى الإنزيم دون استهلاك",
      "كثير من الإنزيمات تنتهي بهذه اللاحقة",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 1,
    "explanation": "مرحلة التحرير يرتبط هنا بـ: ينفصل الناتج ويبقى الإنزيم دون استهلاك.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 85,
    "unitId": 3,
    "questionText": "عند مراجعة 3.2 — المعقد ES ونماذج عمل الإنزيم، ما المعلومة التي لا يجب الخلط فيها حول «موقع الارتباط»؟",
    "options": [
      "جزء من الموقع الفعال يثبت الركيزة",
      "تحدد نشاطه لأنها تحدد شكل الموقع الفعال",
      "إنزيم يحفز نمط تفاعل معيناً",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 0,
    "explanation": "موقع الارتباط يرتبط هنا بـ: جزء من الموقع الفعال يثبت الركيزة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 86,
    "unitId": 3,
    "questionText": "ضمن 3.2 — المعقد ES ونماذج عمل الإنزيم، ما الخيار الموافق للبرنامج عندما نذكر «موقع التحفيز»؟",
    "options": [
      "تكسر روابط البنية الفراغية فتسبب تمسخاً",
      "يبقى قابلاً لإعادة الاستعمال",
      "جزء ينجز التحول الكيميائي للركيزة",
      "يتم فقط في غياب الماء والأيونات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "موقع التحفيز يرتبط هنا بـ: جزء ينجز التحول الكيميائي للركيزة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 87,
    "unitId": 3,
    "questionText": "في 3.2 — المعقد ES ونماذج عمل الإنزيم، أي علاقة صحيحة يبيّنها مصطلح «Koshland»؟",
    "options": [
      "تقلل أثر المثبط التنافسي نسبياً",
      "يرتبط اسمه بنموذج التلاؤم المحفز",
      "الجزيء الذي يعمل عليه الإنزيم",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "Koshland يرتبط هنا بـ: يرتبط اسمه بنموذج التلاؤم المحفز.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 88,
    "unitId": 3,
    "questionText": "في سؤال بكالوريا قصير حول 3.2 — المعقد ES ونماذج عمل الإنزيم، بماذا نربط «Fischer»؟",
    "options": [
      "يغير شحنات الأحماض الأمينية في الموقع الفعال",
      "تحدد نشاطه لأنها تحدد شكل الموقع الفعال",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات.",
      "يرتبط اسمه بنموذج القفل والمفتاح"
    ],
    "correctAnswerIndex": 3,
    "explanation": "Fischer يرتبط هنا بـ: يرتبط اسمه بنموذج القفل والمفتاح.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 89,
    "unitId": 3,
    "questionText": "في محور 3.2 — المعقد ES ونماذج عمل الإنزيم، أي عبارة تساعد على تمييز «مرونة الإنزيم» عن المفاهيم القريبة؟",
    "options": [
      "تفسر قبول ركائز متشابهة في بعض الحالات",
      "غالباً غير عكوسي عند درجات مرتفعة جداً",
      "يرتبط اسمه بنموذج التلاؤم المحفز",
      "يتم فقط في غياب الماء والأيونات."
    ],
    "correctAnswerIndex": 0,
    "explanation": "مرونة الإنزيم يرتبط هنا بـ: تفسر قبول ركائز متشابهة في بعض الحالات.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 90,
    "unitId": 3,
    "questionText": "إذا طُلب تفسير «المعقد EP» ضمن 3.2 — المعقد ES ونماذج عمل الإنزيم، فأي جواب هو الأدق؟",
    "options": [
      "حالة انشغال معظم المواقع الفعالة بالركيزة",
      "يزول غالباً بزوال المثبط",
      "النشاط الإنزيمي لا يتأثر بـpH أو الحرارة.",
      "حالة انتقالية قبل تحرير الناتج"
    ],
    "correctAnswerIndex": 3,
    "explanation": "المعقد EP يرتبط هنا بـ: حالة انتقالية قبل تحرير الناتج.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 91,
    "unitId": 3,
    "questionText": "في محور 3.2 — المعقد ES ونماذج عمل الإنزيم، أي وصف دقيق لـ«تكرار الدورة»؟",
    "options": [
      "يرتبط اسمه بنموذج القفل والمفتاح",
      "يفسر قدرة كمية قليلة من الإنزيم على تحويل ركائز كثيرة",
      "يثبت غالباً خارج الموقع الفعال ويغير النشاط",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "تكرار الدورة يرتبط هنا بـ: يفسر قدرة كمية قليلة من الإنزيم على تحويل ركائز كثيرة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 92,
    "unitId": 3,
    "questionText": "في موضوع 3.3 — تأثير pH ودرجة الحرارة، أي عبارة صحيحة حول «pH الأمثل»؟",
    "options": [
      "ترتبط عادة بقيمة Km منخفضة",
      "قيمة يكون عندها النشاط الإنزيمي أعظمياً",
      "إنزيم معدي يعمل جيداً في وسط حمضي قوي",
      "يُستهلك الإنزيم كلياً في نهاية التفاعل."
    ],
    "correctAnswerIndex": 1,
    "explanation": "pH الأمثل يرتبط هنا بـ: قيمة يكون عندها النشاط الإنزيمي أعظمياً.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 93,
    "unitId": 3,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «البيبسين» ضمن 3.3 — تأثير pH ودرجة الحرارة.",
    "options": [
      "الجزيء المتحصل عليه بعد التحول الإنزيمي",
      "يبقى قابلاً لإعادة الاستعمال",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور.",
      "إنزيم معدي يعمل جيداً في وسط حمضي قوي"
    ],
    "correctAnswerIndex": 3,
    "explanation": "البيبسين يرتبط هنا بـ: إنزيم معدي يعمل جيداً في وسط حمضي قوي.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 94,
    "unitId": 3,
    "questionText": "في محور 3.3 — تأثير pH ودرجة الحرارة، أي إكمال صحيح: «الأميلاز اللعابي» ← ________؟",
    "options": [
      "جزء من الموقع الفعال يثبت الركيزة",
      "يتغير فيه شكل الموقع الفعال عند اقتراب الركيزة",
      "ينشط قرب pH متعادل",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الأميلاز اللعابي يرتبط هنا بـ: ينشط قرب pH متعادل.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 95,
    "unitId": 3,
    "questionText": "عند مراجعة 3.3 — تأثير pH ودرجة الحرارة، ما المعلومة التي لا يجب الخلط فيها حول «الحرارة المثلى»؟",
    "options": [
      "يرتبط اسمه بنموذج القفل والمفتاح",
      "مرتبطة بتكامل شكل وشحنات الموقع الفعال مع الركيزة",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة.",
      "درجة تحقق أكبر نشاط قبل بداية التمسخ"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الحرارة المثلى يرتبط هنا بـ: درجة تحقق أكبر نشاط قبل بداية التمسخ.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 96,
    "unitId": 3,
    "questionText": "ضمن 3.3 — تأثير pH ودرجة الحرارة، ما الخيار الموافق للبرنامج عندما نذكر «الحرارة المرتفعة»؟",
    "options": [
      "تكسر روابط البنية الفراغية فتسبب تمسخاً",
      "الجزيء المتحصل عليه بعد التحول الإنزيمي",
      "الجزيء الذي يعمل عليه الإنزيم",
      "ينتج مباشرة أجساماً مضادة في كل الحالات."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الحرارة المرتفعة يرتبط هنا بـ: تكسر روابط البنية الفراغية فتسبب تمسخاً.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 97,
    "unitId": 3,
    "questionText": "في 3.3 — تأثير pH ودرجة الحرارة، أي علاقة صحيحة يبيّنها مصطلح «البرودة»؟",
    "options": [
      "ينفصل الناتج ويبقى الإنزيم دون استهلاك",
      "غالباً غير عكوسي عند درجات مرتفعة جداً",
      "تبطئ النشاط غالباً دون تمسخ دائم",
      "ينتج مباشرة أجساماً مضادة في كل الحالات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "البرودة يرتبط هنا بـ: تبطئ النشاط غالباً دون تمسخ دائم.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 98,
    "unitId": 3,
    "questionText": "في سؤال بكالوريا قصير حول 3.3 — تأثير pH ودرجة الحرارة، بماذا نربط «تغير pH»؟",
    "options": [
      "يرتبط اسمه بنموذج القفل والمفتاح",
      "يغير شحنات الأحماض الأمينية في الموقع الفعال",
      "منطقة تثبيت الركيزة والتحفيز في الإنزيم",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور."
    ],
    "correctAnswerIndex": 1,
    "explanation": "تغير pH يرتبط هنا بـ: يغير شحنات الأحماض الأمينية في الموقع الفعال.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 99,
    "unitId": 3,
    "questionText": "في محور 3.3 — تأثير pH ودرجة الحرارة، أي عبارة تساعد على تمييز «منحنى pH» عن المفاهيم القريبة؟",
    "options": [
      "جزء من الموقع الفعال يثبت الركيزة",
      "غالباً جرسي لأن لكل إنزيم pH أمثل",
      "إنزيم لا يقبل إلا ركيزة محددة جداً",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور."
    ],
    "correctAnswerIndex": 1,
    "explanation": "منحنى pH يرتبط هنا بـ: غالباً جرسي لأن لكل إنزيم pH أمثل.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 100,
    "unitId": 3,
    "questionText": "إذا طُلب تفسير «إنزيمات الإنسان» ضمن 3.3 — تأثير pH ودرجة الحرارة، فأي جواب هو الأدق؟",
    "options": [
      "يرتبط اسمه بنموذج القفل والمفتاح",
      "محفز حيوي غالباً بروتيني يسرع التفاعل دون أن يستهلك",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس.",
      "غالباً تعمل قرب 37°C باستثناءات حسب النسيج"
    ],
    "correctAnswerIndex": 3,
    "explanation": "إنزيمات الإنسان يرتبط هنا بـ: غالباً تعمل قرب 37°C باستثناءات حسب النسيج.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 101,
    "unitId": 3,
    "questionText": "في محور 3.3 — تأثير pH ودرجة الحرارة، أي وصف دقيق لـ«تمسخ حراري»؟",
    "options": [
      "مثال لمثبط يؤثر في السلسلة التنفسية",
      "غالباً غير عكوسي عند درجات مرتفعة جداً",
      "تكسر روابط البنية الفراغية فتسبب تمسخاً",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 1,
    "explanation": "تمسخ حراري يرتبط هنا بـ: غالباً غير عكوسي عند درجات مرتفعة جداً.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 102,
    "unitId": 3,
    "questionText": "في موضوع 3.3 — تأثير pH ودرجة الحرارة، أي عبارة صحيحة حول «ابتعاد متوسط عن pH الأمثل»؟",
    "options": [
      "جزء ينجز التحول الكيميائي للركيزة",
      "تبطئ النشاط غالباً دون تمسخ دائم",
      "يعني توقف كل التحولات الطاقوية في الخلية.",
      "قد يخفض النشاط دون فقدان نهائي"
    ],
    "correctAnswerIndex": 3,
    "explanation": "ابتعاد متوسط عن pH الأمثل يرتبط هنا بـ: قد يخفض النشاط دون فقدان نهائي.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 103,
    "unitId": 3,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «زيادة تركيز الركيزة» ضمن 3.4 — تركيز الركيزة، الإشباع والمثبطات.",
    "options": [
      "ترفع السرعة حتى إشباع المواقع الفعالة",
      "ترفع السرعة إذا كانت الركيزة متوفرة",
      "تبطئ النشاط غالباً دون تمسخ دائم",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 0,
    "explanation": "زيادة تركيز الركيزة يرتبط هنا بـ: ترفع السرعة حتى إشباع المواقع الفعالة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 104,
    "unitId": 3,
    "questionText": "في محور 3.4 — تركيز الركيزة، الإشباع والمثبطات، أي إكمال صحيح: «Vmax» ← ________؟",
    "options": [
      "سرعة قصوى عندما تكون كل المواقع الفعالة مشغولة تقريباً",
      "درجة تحقق أكبر نشاط قبل بداية التمسخ",
      "تكسر روابط البنية الفراغية فتسبب تمسخاً",
      "يتم فقط في غياب الماء والأيونات."
    ],
    "correctAnswerIndex": 0,
    "explanation": "Vmax يرتبط هنا بـ: سرعة قصوى عندما تكون كل المواقع الفعالة مشغولة تقريباً.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 105,
    "unitId": 3,
    "questionText": "عند مراجعة 3.4 — تركيز الركيزة، الإشباع والمثبطات، ما المعلومة التي لا يجب الخلط فيها حول «Km»؟",
    "options": [
      "كثير من الإنزيمات تنتهي بهذه اللاحقة",
      "تركيز الركيزة عند نصف Vmax ويدل على الألفة",
      "يفترض موقعاً فعالاً ثابتاً مكملاً للركيزة",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "Km يرتبط هنا بـ: تركيز الركيزة عند نصف Vmax ويدل على الألفة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 106,
    "unitId": 3,
    "questionText": "ضمن 3.4 — تركيز الركيزة، الإشباع والمثبطات، ما الخيار الموافق للبرنامج عندما نذكر «الإشباع الإنزيمي»؟",
    "options": [
      "يفسر قدرة كمية قليلة من الإنزيم على تحويل ركائز كثيرة",
      "قد يخفض النشاط دون فقدان نهائي",
      "حالة انشغال معظم المواقع الفعالة بالركيزة",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الإشباع الإنزيمي يرتبط هنا بـ: حالة انشغال معظم المواقع الفعالة بالركيزة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 107,
    "unitId": 3,
    "questionText": "في 3.4 — تركيز الركيزة، الإشباع والمثبطات، أي علاقة صحيحة يبيّنها مصطلح «المثبط التنافسي»؟",
    "options": [
      "ينافس الركيزة على الموقع الفعال",
      "يرتبط اسمه بنموذج التلاؤم المحفز",
      "يرتبط اسمه بنموذج القفل والمفتاح",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة."
    ],
    "correctAnswerIndex": 0,
    "explanation": "المثبط التنافسي يرتبط هنا بـ: ينافس الركيزة على الموقع الفعال.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 108,
    "unitId": 3,
    "questionText": "في سؤال بكالوريا قصير حول 3.4 — تركيز الركيزة، الإشباع والمثبطات، بماذا نربط «زيادة الركيزة»؟",
    "options": [
      "سرعة قصوى عندما تكون كل المواقع الفعالة مشغولة تقريباً",
      "تقلل أثر المثبط التنافسي نسبياً",
      "يتحول مؤقتاً إلى معقد ES قبل تحرير الناتج",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة."
    ],
    "correctAnswerIndex": 1,
    "explanation": "زيادة الركيزة يرتبط هنا بـ: تقلل أثر المثبط التنافسي نسبياً.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 109,
    "unitId": 3,
    "questionText": "في محور 3.4 — تركيز الركيزة، الإشباع والمثبطات، أي عبارة تساعد على تمييز «المثبط غير التنافسي» عن المفاهيم القريبة؟",
    "options": [
      "قيمة يكون عندها النشاط الإنزيمي أعظمياً",
      "مثال لمثبط يؤثر في السلسلة التنفسية",
      "يثبت غالباً خارج الموقع الفعال ويغير النشاط",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 2,
    "explanation": "المثبط غير التنافسي يرتبط هنا بـ: يثبت غالباً خارج الموقع الفعال ويغير النشاط.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 110,
    "unitId": 3,
    "questionText": "إذا طُلب تفسير «زيادة الإنزيم» ضمن 3.4 — تركيز الركيزة، الإشباع والمثبطات، فأي جواب هو الأدق؟",
    "options": [
      "قيمة يكون عندها النشاط الإنزيمي أعظمياً",
      "يتغير فيه شكل الموقع الفعال عند اقتراب الركيزة",
      "يُستهلك الإنزيم كلياً في نهاية التفاعل.",
      "ترفع السرعة إذا كانت الركيزة متوفرة"
    ],
    "correctAnswerIndex": 3,
    "explanation": "زيادة الإنزيم يرتبط هنا بـ: ترفع السرعة إذا كانت الركيزة متوفرة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 111,
    "unitId": 3,
    "questionText": "في محور 3.4 — تركيز الركيزة، الإشباع والمثبطات، أي وصف دقيق لـ«الألفة العالية»؟",
    "options": [
      "حالة انتقالية قبل تحرير الناتج",
      "قد يخفض النشاط دون فقدان نهائي",
      "النشاط الإنزيمي لا يتأثر بـpH أو الحرارة.",
      "ترتبط عادة بقيمة Km منخفضة"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الألفة العالية يرتبط هنا بـ: ترتبط عادة بقيمة Km منخفضة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 112,
    "unitId": 3,
    "questionText": "في موضوع 3.4 — تركيز الركيزة، الإشباع والمثبطات، أي عبارة صحيحة حول «السيانيد»؟",
    "options": [
      "مثال لمثبط يؤثر في السلسلة التنفسية",
      "إنزيم يحفز نمط تفاعل معيناً",
      "تقلل أثر المثبط التنافسي نسبياً",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 0,
    "explanation": "السيانيد يرتبط هنا بـ: مثال لمثبط يؤثر في السلسلة التنفسية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 113,
    "unitId": 3,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «التثبيط العكوسي» ضمن 3.4 — تركيز الركيزة، الإشباع والمثبطات.",
    "options": [
      "درجة تحقق أكبر نشاط قبل بداية التمسخ",
      "الجزيء المتحصل عليه بعد التحول الإنزيمي",
      "يزول غالباً بزوال المثبط",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 2,
    "explanation": "التثبيط العكوسي يرتبط هنا بـ: يزول غالباً بزوال المثبط.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg"
  },
  {
    "id": 114,
    "unitId": 4,
    "questionText": "في محور 4.1 — الذات واللاذات، CMH، المستضد، أي إكمال صحيح: «الذات» ← ________؟",
    "options": [
      "تفاعل CPA وLT4 وLB أو LT8 لإنجاز استجابة فعالة",
      "لمفاوية تتمايز إلى بلازمية منتجة للأجسام المضادة",
      "VIH يزيد عدد LT4 في الدم تدريجياً.",
      "جزيئات يتعرف عليها الجهاز المناعي كمنتمية للجسم"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الذات يرتبط هنا بـ: جزيئات يتعرف عليها الجهاز المناعي كمنتمية للجسم.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_19_immunite_cmh.svg"
  },
  {
    "id": 115,
    "unitId": 4,
    "questionText": "عند مراجعة 4.1 — الذات واللاذات، CMH، المستضد، ما المعلومة التي لا يجب الخلط فيها حول «اللاذات»؟",
    "options": [
      "عناصر غريبة قادرة على إثارة رد مناعي",
      "هدف رئيسي للمناعة الخلطية",
      "خلية تفرز كمية كبيرة من الأجسام المضادة",
      "ينتج مباشرة أجساماً مضادة في كل الحالات."
    ],
    "correctAnswerIndex": 0,
    "explanation": "اللاذات يرتبط هنا بـ: عناصر غريبة قادرة على إثارة رد مناعي.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_19_immunite_cmh.svg"
  },
  {
    "id": 116,
    "unitId": 4,
    "questionText": "ضمن 4.1 — الذات واللاذات، CMH، المستضد، ما الخيار الموافق للبرنامج عندما نذكر «CMH»؟",
    "options": [
      "تساهم في سرعة الاستجابة اللاحقة",
      "بروتينات بلازمية تساعد على تحطيم الممرضات",
      "ينتج مباشرة أجساماً مضادة في كل الحالات.",
      "واسمات غشائية تساعد على تمييز الذات"
    ],
    "correctAnswerIndex": 3,
    "explanation": "CMH يرتبط هنا بـ: واسمات غشائية تساعد على تمييز الذات.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_19_immunite_cmh.svg"
  },
  {
    "id": 117,
    "unitId": 4,
    "questionText": "في 4.1 — الذات واللاذات، CMH، المستضد، أي علاقة صحيحة يبيّنها مصطلح «CMH I»؟",
    "options": [
      "يوجد على معظم الخلايا المنواة ويعرض ببتيدات داخلية",
      "من آثار ارتباط الأجسام المضادة بالسموم أو الفيروسات",
      "تقديم ببتيد مستضدي مرتبط بـCMH",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 0,
    "explanation": "CMH I يرتبط هنا بـ: يوجد على معظم الخلايا المنواة ويعرض ببتيدات داخلية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_19_immunite_cmh.svg"
  },
  {
    "id": 118,
    "unitId": 4,
    "questionText": "في سؤال بكالوريا قصير حول 4.1 — الذات واللاذات، CMH، المستضد، بماذا نربط «CMH II»؟",
    "options": [
      "يوجد على خلايا تقديم المستضد وينشط LT4",
      "لمفاوية تتمايز إلى بلازمية منتجة للأجسام المضادة",
      "حواجز أولى تمنع دخول العوامل الممرضة",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "CMH II يرتبط هنا بـ: يوجد على خلايا تقديم المستضد وينشط LT4.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_19_immunite_cmh.svg"
  },
  {
    "id": 119,
    "unitId": 4,
    "questionText": "في محور 4.1 — الذات واللاذات، CMH، المستضد، أي عبارة تساعد على تمييز «المستضد» عن المفاهيم القريبة؟",
    "options": [
      "عنصر غريب يملك حاتمات نوعية",
      "يساعد VIH على دخول LT4",
      "ابتلاع وهضم عنصر غريب بواسطة خلية بالعة",
      "المناعة النوعية لا تحتاج أي مستقبلات أو واسمات."
    ],
    "correctAnswerIndex": 0,
    "explanation": "المستضد يرتبط هنا بـ: عنصر غريب يملك حاتمات نوعية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_19_immunite_cmh.svg"
  },
  {
    "id": 120,
    "unitId": 4,
    "questionText": "إذا طُلب تفسير «الحاتمة» ضمن 4.1 — الذات واللاذات، CMH، المستضد، فأي جواب هو الأدق؟",
    "options": [
      "تعرض ببتيدات فيروسية على CMH I",
      "خلية تقدم المستضد مثل البالعة الكبيرة",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية.",
      "جزء محدد من المستضد يتعرف عليه مستقبل أو جسم مضاد"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الحاتمة يرتبط هنا بـ: جزء محدد من المستضد يتعرف عليه مستقبل أو جسم مضاد.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_19_immunite_cmh.svg"
  },
  {
    "id": 121,
    "unitId": 4,
    "questionText": "في محور 4.1 — الذات واللاذات، CMH، المستضد، أي وصف دقيق لـ«CPA»؟",
    "options": [
      "يدمر الخلايا المصابة بإحداث ثقوب أو تحريض موتها",
      "استجابة نوعية تعتمد على LB والبلازميات والأجسام المضادة",
      "خلية تقدم المستضد مثل البالعة الكبيرة",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 2,
    "explanation": "CPA يرتبط هنا بـ: خلية تقدم المستضد مثل البالعة الكبيرة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_19_immunite_cmh.svg"
  },
  {
    "id": 122,
    "unitId": 4,
    "questionText": "في موضوع 4.1 — الذات واللاذات، CMH، المستضد، أي عبارة صحيحة حول «رفض الطعم»؟",
    "options": [
      "من آثار ارتباط الأجسام المضادة بالسموم أو الفيروسات",
      "استجابة نوعية تعتمد على LB والبلازميات والأجسام المضادة",
      "المناعة النوعية لا تحتاج أي مستقبلات أو واسمات.",
      "ينتج عن اختلاف واسمات CMH بين المعطي والمتلقي"
    ],
    "correctAnswerIndex": 3,
    "explanation": "رفض الطعم يرتبط هنا بـ: ينتج عن اختلاف واسمات CMH بين المعطي والمتلقي.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_19_immunite_cmh.svg"
  },
  {
    "id": 123,
    "unitId": 4,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «الباراتوب» ضمن 4.1 — الذات واللاذات، CMH، المستضد.",
    "options": [
      "تعتمد على تجنب انتقال الدم أو العلاقات غير المحمية",
      "يوجد على معظم الخلايا المنواة ويعرض ببتيدات داخلية",
      "موقع ارتباط على الجسم المضاد أو مستقبل LB",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الباراتوب يرتبط هنا بـ: موقع ارتباط على الجسم المضاد أو مستقبل LB.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_19_immunite_cmh.svg"
  },
  {
    "id": 124,
    "unitId": 4,
    "questionText": "في محور 4.2 — المناعة غير النوعية والالتهاب، أي إكمال صحيح: «المناعة غير النوعية» ← ________؟",
    "options": [
      "هدف رئيسي للمناعة الخلطية",
      "تحد من تضاعف VIH ولا تلغي كل الخزانات",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات.",
      "استجابة فطرية سريعة لا تستهدف مستضداً محدداً"
    ],
    "correctAnswerIndex": 3,
    "explanation": "المناعة غير النوعية يرتبط هنا بـ: استجابة فطرية سريعة لا تستهدف مستضداً محدداً.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_20_immunite_humorale.svg"
  },
  {
    "id": 125,
    "unitId": 4,
    "questionText": "عند مراجعة 4.2 — المناعة غير النوعية والالتهاب، ما المعلومة التي لا يجب الخلط فيها حول «الجلد والمخاطيات»؟",
    "options": [
      "موقع ارتباط على الجسم المضاد أو مستقبل LB",
      "تفسر سرعة وقوة الاستجابة الثانية",
      "VIH يزيد عدد LT4 في الدم تدريجياً.",
      "حواجز أولى تمنع دخول العوامل الممرضة"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الجلد والمخاطيات يرتبط هنا بـ: حواجز أولى تمنع دخول العوامل الممرضة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_20_immunite_humorale.svg"
  },
  {
    "id": 126,
    "unitId": 4,
    "questionText": "ضمن 4.2 — المناعة غير النوعية والالتهاب، ما الخيار الموافق للبرنامج عندما نذكر «الالتهاب»؟",
    "options": [
      "استجابة تستهدف الخلايا المصابة عبر LTc",
      "تفاعل CPA وLT4 وLB أو LT8 لإنجاز استجابة فعالة",
      "استجابة محلية تتميز باحمرار وحرارة وألم وانتفاخ",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الالتهاب يرتبط هنا بـ: استجابة محلية تتميز باحمرار وحرارة وألم وانتفاخ.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_20_immunite_humorale.svg"
  },
  {
    "id": 127,
    "unitId": 4,
    "questionText": "في 4.2 — المناعة غير النوعية والالتهاب، أي علاقة صحيحة يبيّنها مصطلح «الهيستامين»؟",
    "options": [
      "يوجد على خلايا تقديم المستضد وينشط LT4",
      "بروتين نوعي يرتبط بحاتمة المستضد",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور.",
      "يساهم في توسع الأوعية وزيادة نفاذيتها"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الهيستامين يرتبط هنا بـ: يساهم في توسع الأوعية وزيادة نفاذيتها.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_20_immunite_humorale.svg"
  },
  {
    "id": 128,
    "unitId": 4,
    "questionText": "في سؤال بكالوريا قصير حول 4.2 — المناعة غير النوعية والالتهاب، بماذا نربط «البلعمة»؟",
    "options": [
      "من آثار ارتباط الأجسام المضادة بالسموم أو الفيروسات",
      "حواجز أولى تمنع دخول العوامل الممرضة",
      "يدل على زيادة غير محدودة في السرعة دون إشباع.",
      "ابتلاع وهضم عنصر غريب بواسطة خلية بالعة"
    ],
    "correctAnswerIndex": 3,
    "explanation": "البلعمة يرتبط هنا بـ: ابتلاع وهضم عنصر غريب بواسطة خلية بالعة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_20_immunite_humorale.svg"
  },
  {
    "id": 129,
    "unitId": 4,
    "questionText": "في محور 4.2 — المناعة غير النوعية والالتهاب، أي عبارة تساعد على تمييز «العدلات» عن المفاهيم القريبة؟",
    "options": [
      "تحويل ARN الفيروسي إلى ADN داخل الخلية",
      "خلية تفرز كمية كبيرة من الأجسام المضادة",
      "بالعات سريعة الوصول إلى موضع الالتهاب",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "العدلات يرتبط هنا بـ: بالعات سريعة الوصول إلى موضع الالتهاب.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_20_immunite_humorale.svg"
  },
  {
    "id": 130,
    "unitId": 4,
    "questionText": "إذا طُلب تفسير «الحمى» ضمن 4.2 — المناعة غير النوعية والالتهاب، فأي جواب هو الأدق؟",
    "options": [
      "استجابة تستهدف الخلايا المصابة عبر LTc",
      "جزيئات يتعرف عليها الجهاز المناعي كمنتمية للجسم",
      "VIH يزيد عدد LT4 في الدم تدريجياً.",
      "ترفع حرارة الجسم وتحد من تكاثر بعض الممرضات"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الحمى يرتبط هنا بـ: ترفع حرارة الجسم وتحد من تكاثر بعض الممرضات.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_20_immunite_humorale.svg"
  },
  {
    "id": 131,
    "unitId": 4,
    "questionText": "في محور 4.2 — المناعة غير النوعية والالتهاب، أي وصف دقيق لـ«المتممة»؟",
    "options": [
      "بروتينات بلازمية تساعد على تحطيم الممرضات",
      "تساهم في سرعة الاستجابة اللاحقة",
      "يتمايز إلى LTc قاتلة بعد التنشيط",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 0,
    "explanation": "المتممة يرتبط هنا بـ: بروتينات بلازمية تساعد على تحطيم الممرضات.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_20_immunite_humorale.svg"
  },
  {
    "id": 132,
    "unitId": 4,
    "questionText": "في موضوع 4.2 — المناعة غير النوعية والالتهاب، أي عبارة صحيحة حول «الاستجابة السريعة»؟",
    "options": [
      "من آثار ارتباط الأجسام المضادة بالسموم أو الفيروسات",
      "خاصية أساسية للمناعة الفطرية",
      "عنصر غريب يملك حاتمات نوعية",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الاستجابة السريعة يرتبط هنا بـ: خاصية أساسية للمناعة الفطرية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_20_immunite_humorale.svg"
  },
  {
    "id": 133,
    "unitId": 4,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «عدم الذاكرة النوعية» ضمن 4.2 — المناعة غير النوعية والالتهاب.",
    "options": [
      "يوجد على معظم الخلايا المنواة ويعرض ببتيدات داخلية",
      "يدمر الخلايا المصابة بإحداث ثقوب أو تحريض موتها",
      "يميز المناعة غير النوعية عن المناعة المكتسبة",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 2,
    "explanation": "عدم الذاكرة النوعية يرتبط هنا بـ: يميز المناعة غير النوعية عن المناعة المكتسبة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_20_immunite_humorale.svg"
  },
  {
    "id": 134,
    "unitId": 4,
    "questionText": "في محور 4.3 — المناعة الخلطية، أي إكمال صحيح: «المناعة الخلطية» ← ________؟",
    "options": [
      "عنصر غريب يملك حاتمات نوعية",
      "استجابة نوعية تعتمد على LB والبلازميات والأجسام المضادة",
      "بالعات سريعة الوصول إلى موضع الالتهاب",
      "المناعة النوعية لا تحتاج أي مستقبلات أو واسمات."
    ],
    "correctAnswerIndex": 1,
    "explanation": "المناعة الخلطية يرتبط هنا بـ: استجابة نوعية تعتمد على LB والبلازميات والأجسام المضادة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_20_immunite_humorale.svg"
  },
  {
    "id": 135,
    "unitId": 4,
    "questionText": "عند مراجعة 4.3 — المناعة الخلطية، ما المعلومة التي لا يجب الخلط فيها حول «LB»؟",
    "options": [
      "مرحلة متقدمة من عدوى VIH مع عوز مناعي وأمراض انتهازية",
      "خاصية أساسية للمناعة الفطرية",
      "يدل على زيادة غير محدودة في السرعة دون إشباع.",
      "لمفاوية تتمايز إلى بلازمية منتجة للأجسام المضادة"
    ],
    "correctAnswerIndex": 3,
    "explanation": "LB يرتبط هنا بـ: لمفاوية تتمايز إلى بلازمية منتجة للأجسام المضادة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_20_immunite_humorale.svg"
  },
  {
    "id": 136,
    "unitId": 4,
    "questionText": "ضمن 4.3 — المناعة الخلطية، ما الخيار الموافق للبرنامج عندما نذكر «البلازمية»؟",
    "options": [
      "جزء محدد من المستضد يتعرف عليه مستقبل أو جسم مضاد",
      "خلية تفرز كمية كبيرة من الأجسام المضادة",
      "واسمات غشائية تساعد على تمييز الذات",
      "ينتج مباشرة أجساماً مضادة في كل الحالات."
    ],
    "correctAnswerIndex": 1,
    "explanation": "البلازمية يرتبط هنا بـ: خلية تفرز كمية كبيرة من الأجسام المضادة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_20_immunite_humorale.svg"
  },
  {
    "id": 137,
    "unitId": 4,
    "questionText": "في 4.3 — المناعة الخلطية، أي علاقة صحيحة يبيّنها مصطلح «الجسم المضاد»؟",
    "options": [
      "فيروس يستهدف خاصة LT4 ويضعف المناعة المكتسبة",
      "واسمات غشائية تساعد على تمييز الذات",
      "المناعة النوعية لا تحتاج أي مستقبلات أو واسمات.",
      "بروتين نوعي يرتبط بحاتمة المستضد"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الجسم المضاد يرتبط هنا بـ: بروتين نوعي يرتبط بحاتمة المستضد.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_20_immunite_humorale.svg"
  },
  {
    "id": 138,
    "unitId": 4,
    "questionText": "في سؤال بكالوريا قصير حول 4.3 — المناعة الخلطية، بماذا نربط «المعقد المناعي»؟",
    "options": [
      "اتحاد نوعي بين جسم مضاد ومستضد",
      "تعرض ببتيدات فيروسية على CMH I",
      "عناصر غريبة قادرة على إثارة رد مناعي",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 0,
    "explanation": "المعقد المناعي يرتبط هنا بـ: اتحاد نوعي بين جسم مضاد ومستضد.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_20_immunite_humorale.svg"
  },
  {
    "id": 139,
    "unitId": 4,
    "questionText": "في محور 4.3 — المناعة الخلطية، أي عبارة تساعد على تمييز «الانتقاء النسيلي» عن المفاهيم القريبة؟",
    "options": [
      "تعرض ببتيدات فيروسية على CMH I",
      "تكاثر اللمفاوية التي تحمل المستقبل الموافق للمستضد",
      "يفسر تراجع المناعتين الخلطية والخلوية",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الانتقاء النسيلي يرتبط هنا بـ: تكاثر اللمفاوية التي تحمل المستقبل الموافق للمستضد.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_20_immunite_humorale.svg"
  },
  {
    "id": 140,
    "unitId": 4,
    "questionText": "إذا طُلب تفسير «الذاكرة المناعية» ضمن 4.3 — المناعة الخلطية، فأي جواب هو الأدق؟",
    "options": [
      "تفسر سرعة وقوة الاستجابة الثانية",
      "تكاثر اللمفاوية التي تحمل المستقبل الموافق للمستضد",
      "يوجد على معظم الخلايا المنواة ويعرض ببتيدات داخلية",
      "يعني توقف كل التحولات الطاقوية في الخلية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الذاكرة المناعية يرتبط هنا بـ: تفسر سرعة وقوة الاستجابة الثانية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_20_immunite_humorale.svg"
  },
  {
    "id": 141,
    "unitId": 4,
    "questionText": "في محور 4.3 — المناعة الخلطية، أي وصف دقيق لـ«IgG»؟",
    "options": [
      "لمفاوية تتمايز إلى بلازمية منتجة للأجسام المضادة",
      "يدمر الخلايا المصابة بإحداث ثقوب أو تحريض موتها",
      "أجسام مضادة مهمة في الدم والاستجابة الثانوية",
      "يتم فقط في غياب الماء والأيونات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "IgG يرتبط هنا بـ: أجسام مضادة مهمة في الدم والاستجابة الثانوية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_20_immunite_humorale.svg"
  },
  {
    "id": 142,
    "unitId": 4,
    "questionText": "في موضوع 4.3 — المناعة الخلطية، أي عبارة صحيحة حول «المستضد الحر»؟",
    "options": [
      "تعتمد على تجنب انتقال الدم أو العلاقات غير المحمية",
      "يفسر تراجع المناعتين الخلطية والخلوية",
      "هدف رئيسي للمناعة الخلطية",
      "ينتج مباشرة أجساماً مضادة في كل الحالات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "المستضد الحر يرتبط هنا بـ: هدف رئيسي للمناعة الخلطية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_20_immunite_humorale.svg"
  },
  {
    "id": 143,
    "unitId": 4,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «التحييد» ضمن 4.3 — المناعة الخلطية.",
    "options": [
      "من آثار ارتباط الأجسام المضادة بالسموم أو الفيروسات",
      "تعرض ببتيدات فيروسية على CMH I",
      "لمفاوية تتمايز إلى بلازمية منتجة للأجسام المضادة",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 0,
    "explanation": "التحييد يرتبط هنا بـ: من آثار ارتباط الأجسام المضادة بالسموم أو الفيروسات.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_20_immunite_humorale.svg"
  },
  {
    "id": 144,
    "unitId": 4,
    "questionText": "في محور 4.4 — المناعة الخلوية والتعاون الخلوي، أي إكمال صحيح: «المناعة الخلوية» ← ________؟",
    "options": [
      "عنصر غريب يملك حاتمات نوعية",
      "هدف رئيسي للمناعة الخلطية",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس.",
      "استجابة تستهدف الخلايا المصابة عبر LTc"
    ],
    "correctAnswerIndex": 3,
    "explanation": "المناعة الخلوية يرتبط هنا بـ: استجابة تستهدف الخلايا المصابة عبر LTc.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_21_immunite_cellulaire.svg"
  },
  {
    "id": 145,
    "unitId": 4,
    "questionText": "عند مراجعة 4.4 — المناعة الخلوية والتعاون الخلوي، ما المعلومة التي لا يجب الخلط فيها حول «LT4»؟",
    "options": [
      "استجابة تستهدف الخلايا المصابة عبر LTc",
      "بروتينات بلازمية تساعد على تحطيم الممرضات",
      "لمفاوية مساعدة تفرز إنترلوكينات لتنشيط LB وLT8",
      "يعني توقف كل التحولات الطاقوية في الخلية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "LT4 يرتبط هنا بـ: لمفاوية مساعدة تفرز إنترلوكينات لتنشيط LB وLT8.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_21_immunite_cellulaire.svg"
  },
  {
    "id": 146,
    "unitId": 4,
    "questionText": "ضمن 4.4 — المناعة الخلوية والتعاون الخلوي، ما الخيار الموافق للبرنامج عندما نذكر «LT8»؟",
    "options": [
      "بالعات سريعة الوصول إلى موضع الالتهاب",
      "يتمايز إلى LTc قاتلة بعد التنشيط",
      "تكاثر اللمفاوية التي تحمل المستقبل الموافق للمستضد",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 1,
    "explanation": "LT8 يرتبط هنا بـ: يتمايز إلى LTc قاتلة بعد التنشيط.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_21_immunite_cellulaire.svg"
  },
  {
    "id": 147,
    "unitId": 4,
    "questionText": "في 4.4 — المناعة الخلوية والتعاون الخلوي، أي علاقة صحيحة يبيّنها مصطلح «LTc»؟",
    "options": [
      "يدمر الخلايا المصابة بإحداث ثقوب أو تحريض موتها",
      "يساهم في توسع الأوعية وزيادة نفاذيتها",
      "استجابة نوعية تعتمد على LB والبلازميات والأجسام المضادة",
      "يتم فقط في غياب الماء والأيونات."
    ],
    "correctAnswerIndex": 0,
    "explanation": "LTc يرتبط هنا بـ: يدمر الخلايا المصابة بإحداث ثقوب أو تحريض موتها.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_21_immunite_cellulaire.svg"
  },
  {
    "id": 148,
    "unitId": 4,
    "questionText": "في سؤال بكالوريا قصير حول 4.4 — المناعة الخلوية والتعاون الخلوي، بماذا نربط «الإنترلوكينات»؟",
    "options": [
      "تفاعل CPA وLT4 وLB أو LT8 لإنجاز استجابة فعالة",
      "وسائط بروتينية تنسق التعاون الخلوي",
      "هدف رئيسي للمناعة الخلطية",
      "يعني توقف كل التحولات الطاقوية في الخلية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الإنترلوكينات يرتبط هنا بـ: وسائط بروتينية تنسق التعاون الخلوي.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_21_immunite_cellulaire.svg"
  },
  {
    "id": 149,
    "unitId": 4,
    "questionText": "في محور 4.4 — المناعة الخلوية والتعاون الخلوي، أي عبارة تساعد على تمييز «التعاون الخلوي» عن المفاهيم القريبة؟",
    "options": [
      "يساعد VIH على دخول LT4",
      "تفاعل CPA وLT4 وLB أو LT8 لإنجاز استجابة فعالة",
      "يتمايز إلى LTc قاتلة بعد التنشيط",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 1,
    "explanation": "التعاون الخلوي يرتبط هنا بـ: تفاعل CPA وLT4 وLB أو LT8 لإنجاز استجابة فعالة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_21_immunite_cellulaire.svg"
  },
  {
    "id": 150,
    "unitId": 4,
    "questionText": "إذا طُلب تفسير «عرض المستضد» ضمن 4.4 — المناعة الخلوية والتعاون الخلوي، فأي جواب هو الأدق؟",
    "options": [
      "اتحاد نوعي بين جسم مضاد ومستضد",
      "تقديم ببتيد مستضدي مرتبط بـCMH",
      "بروتين نوعي يرتبط بحاتمة المستضد",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 1,
    "explanation": "عرض المستضد يرتبط هنا بـ: تقديم ببتيد مستضدي مرتبط بـCMH.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_21_immunite_cellulaire.svg"
  },
  {
    "id": 151,
    "unitId": 4,
    "questionText": "في محور 4.4 — المناعة الخلوية والتعاون الخلوي، أي وصف دقيق لـ«خلية مصابة بفيروس»؟",
    "options": [
      "يتمايز إلى LTc قاتلة بعد التنشيط",
      "تظهر عندما يضعف الدفاع المناعي بشدة",
      "تعرض ببتيدات فيروسية على CMH I",
      "يعني توقف كل التحولات الطاقوية في الخلية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "خلية مصابة بفيروس يرتبط هنا بـ: تعرض ببتيدات فيروسية على CMH I.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_21_immunite_cellulaire.svg"
  },
  {
    "id": 152,
    "unitId": 4,
    "questionText": "في موضوع 4.4 — المناعة الخلوية والتعاون الخلوي، أي عبارة صحيحة حول «الذاكرة T»؟",
    "options": [
      "اتحاد نوعي بين جسم مضاد ومستضد",
      "تساهم في سرعة الاستجابة اللاحقة",
      "واسمات غشائية تساعد على تمييز الذات",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الذاكرة T يرتبط هنا بـ: تساهم في سرعة الاستجابة اللاحقة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_21_immunite_cellulaire.svg"
  },
  {
    "id": 153,
    "unitId": 4,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «VIH» ضمن 4.5 — فيروس VIH ومرض SIDA.",
    "options": [
      "تعتمد على تجنب انتقال الدم أو العلاقات غير المحمية",
      "تحويل ARN الفيروسي إلى ADN داخل الخلية",
      "فيروس يستهدف خاصة LT4 ويضعف المناعة المكتسبة",
      "يتم فقط في غياب الماء والأيونات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "VIH يرتبط هنا بـ: فيروس يستهدف خاصة LT4 ويضعف المناعة المكتسبة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_22_immunite_vih.svg"
  },
  {
    "id": 154,
    "unitId": 4,
    "questionText": "في محور 4.5 — فيروس VIH ومرض SIDA، أي إكمال صحيح: «SIDA» ← ________؟",
    "options": [
      "يتمايز إلى LTc قاتلة بعد التنشيط",
      "يساهم في توسع الأوعية وزيادة نفاذيتها",
      "مرحلة متقدمة من عدوى VIH مع عوز مناعي وأمراض انتهازية",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 2,
    "explanation": "SIDA يرتبط هنا بـ: مرحلة متقدمة من عدوى VIH مع عوز مناعي وأمراض انتهازية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_22_immunite_vih.svg"
  },
  {
    "id": 155,
    "unitId": 4,
    "questionText": "عند مراجعة 4.5 — فيروس VIH ومرض SIDA، ما المعلومة التي لا يجب الخلط فيها حول «النسخ العكسي»؟",
    "options": [
      "تعرض ببتيدات فيروسية على CMH I",
      "تحويل ARN الفيروسي إلى ADN داخل الخلية",
      "وسائط بروتينية تنسق التعاون الخلوي",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "النسخ العكسي يرتبط هنا بـ: تحويل ARN الفيروسي إلى ADN داخل الخلية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_22_immunite_vih.svg"
  },
  {
    "id": 156,
    "unitId": 4,
    "questionText": "ضمن 4.5 — فيروس VIH ومرض SIDA، ما الخيار الموافق للبرنامج عندما نذكر «المستقبل CD4»؟",
    "options": [
      "يساعد VIH على دخول LT4",
      "حواجز أولى تمنع دخول العوامل الممرضة",
      "استجابة فطرية سريعة لا تستهدف مستضداً محدداً",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور."
    ],
    "correctAnswerIndex": 0,
    "explanation": "المستقبل CD4 يرتبط هنا بـ: يساعد VIH على دخول LT4.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_22_immunite_vih.svg"
  },
  {
    "id": 157,
    "unitId": 4,
    "questionText": "في 4.5 — فيروس VIH ومرض SIDA، أي علاقة صحيحة يبيّنها مصطلح «انخفاض LT4»؟",
    "options": [
      "بروتينات بلازمية تساعد على تحطيم الممرضات",
      "يفسر تراجع المناعتين الخلطية والخلوية",
      "استجابة فطرية سريعة لا تستهدف مستضداً محدداً",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 1,
    "explanation": "انخفاض LT4 يرتبط هنا بـ: يفسر تراجع المناعتين الخلطية والخلوية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_22_immunite_vih.svg"
  },
  {
    "id": 158,
    "unitId": 4,
    "questionText": "في سؤال بكالوريا قصير حول 4.5 — فيروس VIH ومرض SIDA، بماذا نربط «الأمراض الانتهازية»؟",
    "options": [
      "تظهر عندما يضعف الدفاع المناعي بشدة",
      "تفسر سرعة وقوة الاستجابة الثانية",
      "من آثار ارتباط الأجسام المضادة بالسموم أو الفيروسات",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الأمراض الانتهازية يرتبط هنا بـ: تظهر عندما يضعف الدفاع المناعي بشدة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_22_immunite_vih.svg"
  },
  {
    "id": 159,
    "unitId": 4,
    "questionText": "في محور 4.5 — فيروس VIH ومرض SIDA، أي عبارة تساعد على تمييز «المعالجة المضادة للفيروسات» عن المفاهيم القريبة؟",
    "options": [
      "وسائط بروتينية تنسق التعاون الخلوي",
      "يميز المناعة غير النوعية عن المناعة المكتسبة",
      "يعني توقف كل التحولات الطاقوية في الخلية.",
      "تحد من تضاعف VIH ولا تلغي كل الخزانات"
    ],
    "correctAnswerIndex": 3,
    "explanation": "المعالجة المضادة للفيروسات يرتبط هنا بـ: تحد من تضاعف VIH ولا تلغي كل الخزانات.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_22_immunite_vih.svg"
  },
  {
    "id": 160,
    "unitId": 4,
    "questionText": "إذا طُلب تفسير «الاندماج الفيروسي» ضمن 4.5 — فيروس VIH ومرض SIDA، فأي جواب هو الأدق؟",
    "options": [
      "أجسام مضادة مهمة في الدم والاستجابة الثانوية",
      "إدماج ADN الفيروسي في ADN الخلية",
      "تعتمد على تجنب انتقال الدم أو العلاقات غير المحمية",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الاندماج الفيروسي يرتبط هنا بـ: إدماج ADN الفيروسي في ADN الخلية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_22_immunite_vih.svg"
  },
  {
    "id": 161,
    "unitId": 4,
    "questionText": "في محور 4.5 — فيروس VIH ومرض SIDA، أي وصف دقيق لـ«الوقاية»؟",
    "options": [
      "استجابة تستهدف الخلايا المصابة عبر LTc",
      "يساعد VIH على دخول LT4",
      "تعتمد على تجنب انتقال الدم أو العلاقات غير المحمية",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الوقاية يرتبط هنا بـ: تعتمد على تجنب انتقال الدم أو العلاقات غير المحمية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_22_immunite_vih.svg"
  },
  {
    "id": 162,
    "unitId": 5,
    "questionText": "في موضوع 5.1 — العصبون، الغشاء والبروتينات القنوية، أي عبارة صحيحة حول «العصبون»؟",
    "options": [
      "تراكم كمونات متتالية من نفس المشبك",
      "خلية متخصصة في استقبال ودمج ونقل الرسالة العصبية",
      "ينتج أساساً عن دخول Na+ عبر قنواته",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 1,
    "explanation": "العصبون يرتبط هنا بـ: خلية متخصصة في استقبال ودمج ونقل الرسالة العصبية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 163,
    "unitId": 5,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «التغصنات» ضمن 5.1 — العصبون، الغشاء والبروتينات القنوية.",
    "options": [
      "كمون مثبط يبعد الغشاء عن العتبة",
      "تستقبل رسائل من عصبونات أخرى",
      "تساهم في سلبية داخل الغشاء",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور."
    ],
    "correctAnswerIndex": 1,
    "explanation": "التغصنات يرتبط هنا بـ: تستقبل رسائل من عصبونات أخرى.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 164,
    "unitId": 5,
    "questionText": "في محور 5.1 — العصبون، الغشاء والبروتينات القنوية، أي إكمال صحيح: «المحور» ← ________؟",
    "options": [
      "تراكم كمونات واردة من مشابك مختلفة",
      "تشفّر غالباً شدة التنبيه",
      "ينقل كمون العمل بعيداً عن الجسم الخلوي",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "المحور يرتبط هنا بـ: ينقل كمون العمل بعيداً عن الجسم الخلوي.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 165,
    "unitId": 5,
    "questionText": "عند مراجعة 5.1 — العصبون، الغشاء والبروتينات القنوية، ما المعلومة التي لا يجب الخلط فيها حول «الغشاء العصبي»؟",
    "options": [
      "يحافظ على فروق تراكيز أيونية بين الداخل والخارج",
      "تركيز البوتاسيوم أعلى داخل الخلية",
      "ينقل كمون العمل بعيداً عن الجسم الخلوي",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الغشاء العصبي يرتبط هنا بـ: يحافظ على فروق تراكيز أيونية بين الداخل والخارج.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 166,
    "unitId": 5,
    "questionText": "ضمن 5.1 — العصبون، الغشاء والبروتينات القنوية، ما الخيار الموافق للبرنامج عندما نذكر «القنوات الأيونية»؟",
    "options": [
      "قد تعطل مراكز حيوية مثل التنفس",
      "تركيز الصوديوم أعلى خارج الخلية",
      "بروتينات تسمح بمرور نوعي للأيونات",
      "PPSI يقرب الغشاء دائماً من العتبة."
    ],
    "correctAnswerIndex": 2,
    "explanation": "القنوات الأيونية يرتبط هنا بـ: بروتينات تسمح بمرور نوعي للأيونات.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 167,
    "unitId": 5,
    "questionText": "في 5.1 — العصبون، الغشاء والبروتينات القنوية، أي علاقة صحيحة يبيّنها مصطلح «قنوات فولطية»؟",
    "options": [
      "تراكم كمونات متتالية من نفس المشبك",
      "تنفتح أو تنغلق حسب فرق الكمون",
      "مناطق غير مغمدة يتم بينها الانتشار القفزي",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 1,
    "explanation": "قنوات فولطية يرتبط هنا بـ: تنفتح أو تنغلق حسب فرق الكمون.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 168,
    "unitId": 5,
    "questionText": "في سؤال بكالوريا قصير حول 5.1 — العصبون، الغشاء والبروتينات القنوية، بماذا نربط «الغمد النخاعيني»؟",
    "options": [
      "يحرض اندماج الحويصلات بالغشاء قبل المشبكي",
      "انعكاس عابر لكمون الغشاء بعد بلوغ العتبة",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا.",
      "يزيد سرعة انتشار السيالة في الألياف المغمدة"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الغمد النخاعيني يرتبط هنا بـ: يزيد سرعة انتشار السيالة في الألياف المغمدة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 169,
    "unitId": 5,
    "questionText": "في محور 5.1 — العصبون، الغشاء والبروتينات القنوية، أي عبارة تساعد على تمييز «عقد رانفييه» عن المفاهيم القريبة؟",
    "options": [
      "انعكاس عابر لكمون الغشاء بعد بلوغ العتبة",
      "كمون مثبط يبعد الغشاء عن العتبة",
      "مناطق غير مغمدة يتم بينها الانتشار القفزي",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "عقد رانفييه يرتبط هنا بـ: مناطق غير مغمدة يتم بينها الانتشار القفزي.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 170,
    "unitId": 5,
    "questionText": "إذا طُلب تفسير «المضخة Na+/K+» ضمن 5.1 — العصبون، الغشاء والبروتينات القنوية، فأي جواب هو الأدق؟",
    "options": [
      "حالة اختلاف الشحنات بين وجهي الغشاء",
      "تستقبل رسائل من عصبونات أخرى",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا.",
      "بروتين غشائي يستعمل ATP للحفاظ على التدرجات"
    ],
    "correctAnswerIndex": 3,
    "explanation": "المضخة Na+/K+ يرتبط هنا بـ: بروتين غشائي يستعمل ATP للحفاظ على التدرجات.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 171,
    "unitId": 5,
    "questionText": "في محور 5.1 — العصبون، الغشاء والبروتينات القنوية، أي وصف دقيق لـ«الرسالة العصبية»؟",
    "options": [
      "تشفّر غالباً بتواتر كمونات العمل",
      "يرتبط بمستقبلات أفيونية ويغير الإحساس بالألم",
      "جمع PPSE وPPSI لاتخاذ قرار توليد كمون عمل",
      "المشبك الكيميائي يعمل بلا ناقل عصبي ولا مستقبلات."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الرسالة العصبية يرتبط هنا بـ: تشفّر غالباً بتواتر كمونات العمل.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 172,
    "unitId": 5,
    "questionText": "في موضوع 5.1 — العصبون، الغشاء والبروتينات القنوية، أي عبارة صحيحة حول «المستقبلات الغشائية»؟",
    "options": [
      "يزيد سرعة انتشار السيالة في الألياف المغمدة",
      "خلية متخصصة في استقبال ودمج ونقل الرسالة العصبية",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة.",
      "تتعرف على النواقل العصبية في المشبك"
    ],
    "correctAnswerIndex": 3,
    "explanation": "المستقبلات الغشائية يرتبط هنا بـ: تتعرف على النواقل العصبية في المشبك.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 173,
    "unitId": 5,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «كمون الراحة» ضمن 5.2 — كمون الراحة.",
    "options": [
      "آلية تحرير الناقل العصبي من الحويصلات",
      "انعكاس عابر لكمون الغشاء بعد بلوغ العتبة",
      "فرق كمون يقارب -70mV داخل الليف غير المنبه",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 2,
    "explanation": "كمون الراحة يرتبط هنا بـ: فرق كمون يقارب -70mV داخل الليف غير المنبه.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 174,
    "unitId": 5,
    "questionText": "في محور 5.2 — كمون الراحة، أي إكمال صحيح: «داخل العصبون» ← ________؟",
    "options": [
      "ناتج عن خطوات كيميائية متعددة",
      "مكان حسم بلوغ العتبة غالباً عند بداية المحور",
      "سالب نسبياً مقارنة بالخارج في الراحة",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 2,
    "explanation": "داخل العصبون يرتبط هنا بـ: سالب نسبياً مقارنة بالخارج في الراحة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 175,
    "unitId": 5,
    "questionText": "عند مراجعة 5.2 — كمون الراحة، ما المعلومة التي لا يجب الخلط فيها حول «تدرج Na+»؟",
    "options": [
      "حاجة قهرية للمادة رغم آثارها الضارة",
      "تركيز الصوديوم أعلى خارج الخلية",
      "خلية متخصصة في استقبال ودمج ونقل الرسالة العصبية",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 1,
    "explanation": "تدرج Na+ يرتبط هنا بـ: تركيز الصوديوم أعلى خارج الخلية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 176,
    "unitId": 5,
    "questionText": "ضمن 5.2 — كمون الراحة، ما الخيار الموافق للبرنامج عندما نذكر «تدرج K+»؟",
    "options": [
      "يمكنه منع توليد كمون عمل رغم وجود PPSE",
      "ينتقل من عقدة رانفييه إلى أخرى",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات.",
      "تركيز البوتاسيوم أعلى داخل الخلية"
    ],
    "correctAnswerIndex": 3,
    "explanation": "تدرج K+ يرتبط هنا بـ: تركيز البوتاسيوم أعلى داخل الخلية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 177,
    "unitId": 5,
    "questionText": "في 5.2 — كمون الراحة، أي علاقة صحيحة يبيّنها مصطلح «قنوات التسرب K+»؟",
    "options": [
      "بروتينات تسمح بمرور نوعي للأيونات",
      "كمون العمل لا يتدرج بسعة التنبيه بعد العتبة",
      "تساهم في سلبية داخل الغشاء",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 2,
    "explanation": "قنوات التسرب K+ يرتبط هنا بـ: تساهم في سلبية داخل الغشاء.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 178,
    "unitId": 5,
    "questionText": "في سؤال بكالوريا قصير حول 5.2 — كمون الراحة، بماذا نربط «مضخة Na+/K+»؟",
    "options": [
      "يرتبط بالناقل ويفتح قنوات أيونية",
      "تخرج 3 Na+ وتدخل 2 K+ مستهلكة ATP",
      "يفكك الأستيل كولين في بعض المشابك",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 1,
    "explanation": "مضخة Na+/K+ يرتبط هنا بـ: تخرج 3 Na+ وتدخل 2 K+ مستهلكة ATP.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 179,
    "unitId": 5,
    "questionText": "في محور 5.2 — كمون الراحة، أي عبارة تساعد على تمييز «الاستقطاب» عن المفاهيم القريبة؟",
    "options": [
      "يؤدي تدريجياً إلى انهيار التدرجات الأيونية",
      "انعكاس عابر لكمون الغشاء بعد بلوغ العتبة",
      "حالة اختلاف الشحنات بين وجهي الغشاء",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الاستقطاب يرتبط هنا بـ: حالة اختلاف الشحنات بين وجهي الغشاء.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 180,
    "unitId": 5,
    "questionText": "إذا طُلب تفسير «تثبيط المضخة» ضمن 5.2 — كمون الراحة، فأي جواب هو الأدق؟",
    "options": [
      "يؤدي تدريجياً إلى انهيار التدرجات الأيونية",
      "خلية متخصصة في استقبال ودمج ونقل الرسالة العصبية",
      "آلية تحرير الناقل العصبي من الحويصلات",
      "المشبك الكيميائي يعمل بلا ناقل عصبي ولا مستقبلات."
    ],
    "correctAnswerIndex": 0,
    "explanation": "تثبيط المضخة يرتبط هنا بـ: يؤدي تدريجياً إلى انهيار التدرجات الأيونية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 181,
    "unitId": 5,
    "questionText": "في محور 5.2 — كمون الراحة، أي وصف دقيق لـ«عتبة التنبيه»؟",
    "options": [
      "يمكنه منع توليد كمون عمل رغم وجود PPSE",
      "يؤدي تدريجياً إلى انهيار التدرجات الأيونية",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية.",
      "قيمة يجب بلوغها لتوليد كمون عمل"
    ],
    "correctAnswerIndex": 3,
    "explanation": "عتبة التنبيه يرتبط هنا بـ: قيمة يجب بلوغها لتوليد كمون عمل.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 182,
    "unitId": 5,
    "questionText": "في موضوع 5.2 — كمون الراحة، أي عبارة صحيحة حول «الليف غير المنبه»؟",
    "options": [
      "ينقل كمون العمل بعيداً عن الجسم الخلوي",
      "نقص تأثير نفس الجرعة مع الزمن",
      "يحافظ على كمون راحة ثابت تقريباً",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الليف غير المنبه يرتبط هنا بـ: يحافظ على كمون راحة ثابت تقريباً.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 183,
    "unitId": 5,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «النفاذية الانتقائية» ضمن 5.2 — كمون الراحة.",
    "options": [
      "سبب أساسي في نشأة كمون الراحة",
      "ينقل كمون العمل بعيداً عن الجسم الخلوي",
      "سالب نسبياً مقارنة بالخارج في الراحة",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "النفاذية الانتقائية يرتبط هنا بـ: سبب أساسي في نشأة كمون الراحة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 184,
    "unitId": 5,
    "questionText": "في محور 5.3 — كمون العمل وانتشار السيالة، أي إكمال صحيح: «كمون العمل» ← ________؟",
    "options": [
      "سبب أساسي في نشأة كمون الراحة",
      "تركيز البوتاسيوم أعلى داخل الخلية",
      "انعكاس عابر لكمون الغشاء بعد بلوغ العتبة",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة."
    ],
    "correctAnswerIndex": 2,
    "explanation": "كمون العمل يرتبط هنا بـ: انعكاس عابر لكمون الغشاء بعد بلوغ العتبة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 185,
    "unitId": 5,
    "questionText": "عند مراجعة 5.3 — كمون العمل وانتشار السيالة، ما المعلومة التي لا يجب الخلط فيها حول «الكل أو لا شيء»؟",
    "options": [
      "انعكاس عابر لكمون الغشاء بعد بلوغ العتبة",
      "كمون العمل لا يتدرج بسعة التنبيه بعد العتبة",
      "يفكك الأستيل كولين في بعض المشابك",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الكل أو لا شيء يرتبط هنا بـ: كمون العمل لا يتدرج بسعة التنبيه بعد العتبة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 186,
    "unitId": 5,
    "questionText": "ضمن 5.3 — كمون العمل وانتشار السيالة، ما الخيار الموافق للبرنامج عندما نذكر «زوال الاستقطاب»؟",
    "options": [
      "ينتج أساساً عن دخول Na+ عبر قنواته",
      "تراكم كمونات متتالية من نفس المشبك",
      "بروتين غشائي يستعمل ATP للحفاظ على التدرجات",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 0,
    "explanation": "زوال الاستقطاب يرتبط هنا بـ: ينتج أساساً عن دخول Na+ عبر قنواته.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 187,
    "unitId": 5,
    "questionText": "في 5.3 — كمون العمل وانتشار السيالة، أي علاقة صحيحة يبيّنها مصطلح «إعادة الاستقطاب»؟",
    "options": [
      "تنتج أساساً عن خروج K+",
      "تشفّر غالباً شدة التنبيه",
      "غالباً من قبل مشبكي إلى بعد مشبكي",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "إعادة الاستقطاب يرتبط هنا بـ: تنتج أساساً عن خروج K+.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 188,
    "unitId": 5,
    "questionText": "في سؤال بكالوريا قصير حول 5.3 — كمون العمل وانتشار السيالة، بماذا نربط «فرط الاستقطاب»؟",
    "options": [
      "تخزن الناقل العصبي قبل التحرير",
      "قد يحدث بسبب استمرار خروج K+ قليلاً",
      "تتعرف على النواقل العصبية في المشبك",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 1,
    "explanation": "فرط الاستقطاب يرتبط هنا بـ: قد يحدث بسبب استمرار خروج K+ قليلاً.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 189,
    "unitId": 5,
    "questionText": "في محور 5.3 — كمون العمل وانتشار السيالة، أي عبارة تساعد على تمييز «فترة الجموح» عن المفاهيم القريبة؟",
    "options": [
      "تراكم كمونات متتالية من نفس المشبك",
      "تزداد بوجود الغمد النخاعيني وكبر قطر الليف",
      "تمنع رجوع السيالة للخلف مباشرة",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "فترة الجموح يرتبط هنا بـ: تمنع رجوع السيالة للخلف مباشرة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 190,
    "unitId": 5,
    "questionText": "إذا طُلب تفسير «الانتشار المتواصل» ضمن 5.3 — كمون العمل وانتشار السيالة، فأي جواب هو الأدق؟",
    "options": [
      "قيمة يجب بلوغها لتوليد كمون عمل",
      "سالب نسبياً مقارنة بالخارج في الراحة",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً.",
      "يحدث في الألياف غير المغمدة"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الانتشار المتواصل يرتبط هنا بـ: يحدث في الألياف غير المغمدة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 191,
    "unitId": 5,
    "questionText": "في محور 5.3 — كمون العمل وانتشار السيالة، أي وصف دقيق لـ«الانتشار القفزي»؟",
    "options": [
      "ينتقل من عقدة رانفييه إلى أخرى",
      "قد تعطل مراكز حيوية مثل التنفس",
      "خلية متخصصة في استقبال ودمج ونقل الرسالة العصبية",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الانتشار القفزي يرتبط هنا بـ: ينتقل من عقدة رانفييه إلى أخرى.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 192,
    "unitId": 5,
    "questionText": "في موضوع 5.3 — كمون العمل وانتشار السيالة، أي عبارة صحيحة حول «زيادة التواتر»؟",
    "options": [
      "آلية تحرير الناقل العصبي من الحويصلات",
      "تشفّر غالباً شدة التنبيه",
      "حالة اختلاف الشحنات بين وجهي الغشاء",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 1,
    "explanation": "زيادة التواتر يرتبط هنا بـ: تشفّر غالباً شدة التنبيه.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 193,
    "unitId": 5,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «القنوات Na+ الفولطية» ضمن 5.3 — كمون العمل وانتشار السيالة.",
    "options": [
      "كمون العمل لا يتدرج بسعة التنبيه بعد العتبة",
      "انعكاس عابر لكمون الغشاء بعد بلوغ العتبة",
      "يدل على زيادة غير محدودة في السرعة دون إشباع.",
      "تنفتح بسرعة عند بلوغ العتبة"
    ],
    "correctAnswerIndex": 3,
    "explanation": "القنوات Na+ الفولطية يرتبط هنا بـ: تنفتح بسرعة عند بلوغ العتبة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 194,
    "unitId": 5,
    "questionText": "في محور 5.3 — كمون العمل وانتشار السيالة، أي إكمال صحيح: «سرعة السيالة» ← ________؟",
    "options": [
      "حاجة قهرية للمادة رغم آثارها الضارة",
      "حالة اختلاف الشحنات بين وجهي الغشاء",
      "تزداد بوجود الغمد النخاعيني وكبر قطر الليف",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "سرعة السيالة يرتبط هنا بـ: تزداد بوجود الغمد النخاعيني وكبر قطر الليف.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 195,
    "unitId": 5,
    "questionText": "عند مراجعة 5.4 — المشبك الكيميائي، ما المعلومة التي لا يجب الخلط فيها حول «المشبك الكيميائي»؟",
    "options": [
      "تخرج 3 Na+ وتدخل 2 K+ مستهلكة ATP",
      "اتصال يستعمل ناقلاً عصبياً بين خليتين",
      "يمكنه منع توليد كمون عمل رغم وجود PPSE",
      "يتم فقط في غياب الماء والأيونات."
    ],
    "correctAnswerIndex": 1,
    "explanation": "المشبك الكيميائي يرتبط هنا بـ: اتصال يستعمل ناقلاً عصبياً بين خليتين.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 196,
    "unitId": 5,
    "questionText": "ضمن 5.4 — المشبك الكيميائي، ما الخيار الموافق للبرنامج عندما نذكر «الحويصلات المشبكية»؟",
    "options": [
      "فرق كمون يقارب -70mV داخل الليف غير المنبه",
      "يرتبط بالناقل ويفتح قنوات أيونية",
      "تخزن الناقل العصبي قبل التحرير",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الحويصلات المشبكية يرتبط هنا بـ: تخزن الناقل العصبي قبل التحرير.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 197,
    "unitId": 5,
    "questionText": "في 5.4 — المشبك الكيميائي، أي علاقة صحيحة يبيّنها مصطلح «دخول Ca2+»؟",
    "options": [
      "يحرض اندماج الحويصلات بالغشاء قبل المشبكي",
      "سبب أساسي في نشأة كمون الراحة",
      "تمنع رجوع السيالة للخلف مباشرة",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 0,
    "explanation": "دخول Ca2+ يرتبط هنا بـ: يحرض اندماج الحويصلات بالغشاء قبل المشبكي.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 198,
    "unitId": 5,
    "questionText": "في سؤال بكالوريا قصير حول 5.4 — المشبك الكيميائي، بماذا نربط «الشق المشبكي»؟",
    "options": [
      "اتصال يستعمل ناقلاً عصبياً بين خليتين",
      "فرق كمون يقارب -70mV داخل الليف غير المنبه",
      "فراغ ينتشر فيه الناقل العصبي",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الشق المشبكي يرتبط هنا بـ: فراغ ينتشر فيه الناقل العصبي.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 199,
    "unitId": 5,
    "questionText": "في محور 5.4 — المشبك الكيميائي، أي عبارة تساعد على تمييز «المستقبل بعد المشبكي» عن المفاهيم القريبة؟",
    "options": [
      "نقص تأثير نفس الجرعة مع الزمن",
      "يرتبط بالناقل ويفتح قنوات أيونية",
      "مناطق غير مغمدة يتم بينها الانتشار القفزي",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور."
    ],
    "correctAnswerIndex": 1,
    "explanation": "المستقبل بعد المشبكي يرتبط هنا بـ: يرتبط بالناقل ويفتح قنوات أيونية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 200,
    "unitId": 5,
    "questionText": "إذا طُلب تفسير «PPSE» ضمن 5.4 — المشبك الكيميائي، فأي جواب هو الأدق؟",
    "options": [
      "كمون منشط يقرب الغشاء من العتبة",
      "تركيز الصوديوم أعلى خارج الخلية",
      "فراغ ينتشر فيه الناقل العصبي",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 0,
    "explanation": "PPSE يرتبط هنا بـ: كمون منشط يقرب الغشاء من العتبة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 201,
    "unitId": 5,
    "questionText": "في محور 5.4 — المشبك الكيميائي، أي وصف دقيق لـ«PPSI»؟",
    "options": [
      "ينتج أساساً عن دخول Na+ عبر قنواته",
      "يرتبط بالناقل ويفتح قنوات أيونية",
      "يعني توقف كل التحولات الطاقوية في الخلية.",
      "كمون مثبط يبعد الغشاء عن العتبة"
    ],
    "correctAnswerIndex": 3,
    "explanation": "PPSI يرتبط هنا بـ: كمون مثبط يبعد الغشاء عن العتبة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 202,
    "unitId": 5,
    "questionText": "في موضوع 5.4 — المشبك الكيميائي، أي عبارة صحيحة حول «الأستيل كولين إستيراز»؟",
    "options": [
      "بروتينات تسمح بمرور نوعي للأيونات",
      "تغير النقل المشبكي بزيادة أو خفض تأثير النواقل",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس.",
      "يفكك الأستيل كولين في بعض المشابك"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الأستيل كولين إستيراز يرتبط هنا بـ: يفكك الأستيل كولين في بعض المشابك.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 203,
    "unitId": 5,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «الإخراج الخلوي» ضمن 5.4 — المشبك الكيميائي.",
    "options": [
      "ينتج أساساً عن دخول Na+ عبر قنواته",
      "تخزن الناقل العصبي قبل التحرير",
      "يتم فقط في غياب الماء والأيونات.",
      "آلية تحرير الناقل العصبي من الحويصلات"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الإخراج الخلوي يرتبط هنا بـ: آلية تحرير الناقل العصبي من الحويصلات.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 204,
    "unitId": 5,
    "questionText": "في محور 5.4 — المشبك الكيميائي، أي إكمال صحيح: «اتجاه المشبك» ← ________؟",
    "options": [
      "غالباً من قبل مشبكي إلى بعد مشبكي",
      "فرق كمون يقارب -70mV داخل الليف غير المنبه",
      "بروتينات تسمح بمرور نوعي للأيونات",
      "كمون العمل يتدرج في السعة حسب شدة المنبه."
    ],
    "correctAnswerIndex": 0,
    "explanation": "اتجاه المشبك يرتبط هنا بـ: غالباً من قبل مشبكي إلى بعد مشبكي.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 205,
    "unitId": 5,
    "questionText": "عند مراجعة 5.4 — المشبك الكيميائي، ما المعلومة التي لا يجب الخلط فيها حول «زمن التأخر المشبكي»؟",
    "options": [
      "يحافظ على فروق تراكيز أيونية بين الداخل والخارج",
      "ناتج عن خطوات كيميائية متعددة",
      "يحدث في الألياف غير المغمدة",
      "يعني توقف كل التحولات الطاقوية في الخلية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "زمن التأخر المشبكي يرتبط هنا بـ: ناتج عن خطوات كيميائية متعددة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 206,
    "unitId": 5,
    "questionText": "ضمن 5.5 — الإدماج العصبي وتأثير المخدرات، ما الخيار الموافق للبرنامج عندما نذكر «الإدماج العصبي»؟",
    "options": [
      "جمع PPSE وPPSI لاتخاذ قرار توليد كمون عمل",
      "قيمة يجب بلوغها لتوليد كمون عمل",
      "نقص تأثير نفس الجرعة مع الزمن",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الإدماج العصبي يرتبط هنا بـ: جمع PPSE وPPSI لاتخاذ قرار توليد كمون عمل.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 207,
    "unitId": 5,
    "questionText": "في 5.5 — الإدماج العصبي وتأثير المخدرات، أي علاقة صحيحة يبيّنها مصطلح «الجمع الزمني»؟",
    "options": [
      "انعكاس عابر لكمون الغشاء بعد بلوغ العتبة",
      "تراكم كمونات متتالية من نفس المشبك",
      "يحدث في الألياف غير المغمدة",
      "يتم فقط في غياب الماء والأيونات."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الجمع الزمني يرتبط هنا بـ: تراكم كمونات متتالية من نفس المشبك.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 208,
    "unitId": 5,
    "questionText": "في سؤال بكالوريا قصير حول 5.5 — الإدماج العصبي وتأثير المخدرات، بماذا نربط «الجمع المكاني»؟",
    "options": [
      "فراغ ينتشر فيه الناقل العصبي",
      "تراكم كمونات واردة من مشابك مختلفة",
      "يرتبط بمستقبلات أفيونية ويغير الإحساس بالألم",
      "المشبك الكيميائي يعمل بلا ناقل عصبي ولا مستقبلات."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الجمع المكاني يرتبط هنا بـ: تراكم كمونات واردة من مشابك مختلفة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 209,
    "unitId": 5,
    "questionText": "في محور 5.5 — الإدماج العصبي وتأثير المخدرات، أي عبارة تساعد على تمييز «المنطقة المولدة» عن المفاهيم القريبة؟",
    "options": [
      "ينتقل من عقدة رانفييه إلى أخرى",
      "يزيد بقاء بعض النواقل في الشق بمنع إعادة التقاطها",
      "مكان حسم بلوغ العتبة غالباً عند بداية المحور",
      "المشبك الكيميائي يعمل بلا ناقل عصبي ولا مستقبلات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "المنطقة المولدة يرتبط هنا بـ: مكان حسم بلوغ العتبة غالباً عند بداية المحور.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 210,
    "unitId": 5,
    "questionText": "إذا طُلب تفسير «PPSI قوي» ضمن 5.5 — الإدماج العصبي وتأثير المخدرات، فأي جواب هو الأدق؟",
    "options": [
      "ينقل كمون العمل بعيداً عن الجسم الخلوي",
      "كمون مثبط يبعد الغشاء عن العتبة",
      "يمكنه منع توليد كمون عمل رغم وجود PPSE",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة."
    ],
    "correctAnswerIndex": 2,
    "explanation": "PPSI قوي يرتبط هنا بـ: يمكنه منع توليد كمون عمل رغم وجود PPSE.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 211,
    "unitId": 5,
    "questionText": "في محور 5.5 — الإدماج العصبي وتأثير المخدرات، أي وصف دقيق لـ«المخدرات»؟",
    "options": [
      "يحافظ على فروق تراكيز أيونية بين الداخل والخارج",
      "تغير النقل المشبكي بزيادة أو خفض تأثير النواقل",
      "يحرض اندماج الحويصلات بالغشاء قبل المشبكي",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "المخدرات يرتبط هنا بـ: تغير النقل المشبكي بزيادة أو خفض تأثير النواقل.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 212,
    "unitId": 5,
    "questionText": "في موضوع 5.5 — الإدماج العصبي وتأثير المخدرات، أي عبارة صحيحة حول «الكوكايين»؟",
    "options": [
      "تزداد بوجود الغمد النخاعيني وكبر قطر الليف",
      "يزيد بقاء بعض النواقل في الشق بمنع إعادة التقاطها",
      "يحافظ على فروق تراكيز أيونية بين الداخل والخارج",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الكوكايين يرتبط هنا بـ: يزيد بقاء بعض النواقل في الشق بمنع إعادة التقاطها.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 213,
    "unitId": 5,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «المورفين» ضمن 5.5 — الإدماج العصبي وتأثير المخدرات.",
    "options": [
      "مكان حسم بلوغ العتبة غالباً عند بداية المحور",
      "يرتبط بالناقل ويفتح قنوات أيونية",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية.",
      "يرتبط بمستقبلات أفيونية ويغير الإحساس بالألم"
    ],
    "correctAnswerIndex": 3,
    "explanation": "المورفين يرتبط هنا بـ: يرتبط بمستقبلات أفيونية ويغير الإحساس بالألم.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 214,
    "unitId": 5,
    "questionText": "في محور 5.5 — الإدماج العصبي وتأثير المخدرات، أي إكمال صحيح: «التعود» ← ________؟",
    "options": [
      "نقص تأثير نفس الجرعة مع الزمن",
      "يمكنه منع توليد كمون عمل رغم وجود PPSE",
      "كمون العمل لا يتدرج بسعة التنبيه بعد العتبة",
      "كمون العمل يتدرج في السعة حسب شدة المنبه."
    ],
    "correctAnswerIndex": 0,
    "explanation": "التعود يرتبط هنا بـ: نقص تأثير نفس الجرعة مع الزمن.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 215,
    "unitId": 5,
    "questionText": "عند مراجعة 5.5 — الإدماج العصبي وتأثير المخدرات، ما المعلومة التي لا يجب الخلط فيها حول «الإدمان»؟",
    "options": [
      "حاجة قهرية للمادة رغم آثارها الضارة",
      "مكان حسم بلوغ العتبة غالباً عند بداية المحور",
      "قد تعطل مراكز حيوية مثل التنفس",
      "يعني توقف كل التحولات الطاقوية في الخلية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الإدمان يرتبط هنا بـ: حاجة قهرية للمادة رغم آثارها الضارة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 216,
    "unitId": 5,
    "questionText": "ضمن 5.5 — الإدماج العصبي وتأثير المخدرات، ما الخيار الموافق للبرنامج عندما نذكر «الجرعة الزائدة»؟",
    "options": [
      "يحرض اندماج الحويصلات بالغشاء قبل المشبكي",
      "فراغ ينتشر فيه الناقل العصبي",
      "قد تعطل مراكز حيوية مثل التنفس",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الجرعة الزائدة يرتبط هنا بـ: قد تعطل مراكز حيوية مثل التنفس.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg"
  },
  {
    "id": 217,
    "unitId": 6,
    "questionText": "في 6.1 — الصانعة الخضراء والأصباغ، أي علاقة صحيحة يبيّنها مصطلح «الصانعة الخضراء»؟",
    "options": [
      "ناتج مختزل يمكن أن يساهم في تركيب السكريات",
      "تحويل طاقة ضوئية إلى طاقة كيميائية في المادة العضوية",
      "عضية يتم فيها التركيب الضوئي في الخلايا اليخضورية",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الصانعة الخضراء يرتبط هنا بـ: عضية يتم فيها التركيب الضوئي في الخلايا اليخضورية.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 218,
    "unitId": 6,
    "questionText": "في سؤال بكالوريا قصير حول 6.1 — الصانعة الخضراء والأصباغ، بماذا نربط «الثيلاكويدات»؟",
    "options": [
      "لا تحتاج الضوء مباشرة لكنها تعتمد على نواتج المرحلة الضوئية",
      "سائل داخلي تتم فيه حلقة كالفن",
      "أكياس غشائية تحمل أصباغاً ومكونات المرحلة الضوئية",
      "ينتج مباشرة أجساماً مضادة في كل الحالات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الثيلاكويدات يرتبط هنا بـ: أكياس غشائية تحمل أصباغاً ومكونات المرحلة الضوئية.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 219,
    "unitId": 6,
    "questionText": "في محور 6.1 — الصانعة الخضراء والأصباغ، أي عبارة تساعد على تمييز «الغرانا» عن المفاهيم القريبة؟",
    "options": [
      "تراص عدة ثيلاكويدات داخل الصانعة",
      "مقر سلاسل نقل الإلكترونات الضوئية",
      "لا تحتاج الضوء مباشرة لكنها تعتمد على نواتج المرحلة الضوئية",
      "مصدر O2 المطروح في التركيب الضوئي هو CO2 مباشرة."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الغرانا يرتبط هنا بـ: تراص عدة ثيلاكويدات داخل الصانعة.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 220,
    "unitId": 6,
    "questionText": "إذا طُلب تفسير «الستروما» ضمن 6.1 — الصانعة الخضراء والأصباغ، فأي جواب هو الأدق؟",
    "options": [
      "سائل داخلي تتم فيه حلقة كالفن",
      "ناتج مختزل يمكن أن يساهم في تركيب السكريات",
      "شدة إضاءة يتساوى عندها التركيب الضوئي والتنفس",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الستروما يرتبط هنا بـ: سائل داخلي تتم فيه حلقة كالفن.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 221,
    "unitId": 6,
    "questionText": "في محور 6.1 — الصانعة الخضراء والأصباغ، أي وصف دقيق لـ«اليخضور a»؟",
    "options": [
      "صبغة أساسية تمتص الضوء وتطلق إلكترونات مثارة",
      "تثبت CO2 في الستروما باستعمال ATP وNADPH",
      "أول مركب ثلاثي الكربون بعد تثبيت CO2",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور."
    ],
    "correctAnswerIndex": 0,
    "explanation": "اليخضور a يرتبط هنا بـ: صبغة أساسية تمتص الضوء وتطلق إلكترونات مثارة.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 222,
    "unitId": 6,
    "questionText": "في موضوع 6.1 — الصانعة الخضراء والأصباغ، أي عبارة صحيحة حول «اليخضور b»؟",
    "options": [
      "مرحلة تستهلك ATP لاستمرار الحلقة",
      "أصباغ مساعدة وتحمي من فائض الضوء",
      "حلقة كالفن تتم داخل جوف الثيلاكويد لا في الستروما.",
      "صبغة مساعدة توسع مجال امتصاص الضوء"
    ],
    "correctAnswerIndex": 3,
    "explanation": "اليخضور b يرتبط هنا بـ: صبغة مساعدة توسع مجال امتصاص الضوء.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 223,
    "unitId": 6,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «الكاروتينات» ضمن 6.1 — الصانعة الخضراء والأصباغ.",
    "options": [
      "أصباغ مساعدة وتحمي من فائض الضوء",
      "يقلل دخول CO2 ويخفض التركيب الضوئي",
      "مرحلة تستهلك ATP لاستمرار الحلقة",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الكاروتينات يرتبط هنا بـ: أصباغ مساعدة وتحمي من فائض الضوء.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 224,
    "unitId": 6,
    "questionText": "في محور 6.1 — الصانعة الخضراء والأصباغ، أي إكمال صحيح: «طيف الامتصاص» ← ________؟",
    "options": [
      "يبين الأطوال الموجية التي تمتصها الصبغة",
      "ناقل إلكترونات مختزل يستعمل في حلقة كالفن",
      "يبين فعالية الأطوال الموجية في التركيب الضوئي",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 0,
    "explanation": "طيف الامتصاص يرتبط هنا بـ: يبين الأطوال الموجية التي تمتصها الصبغة.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 225,
    "unitId": 6,
    "questionText": "عند مراجعة 6.1 — الصانعة الخضراء والأصباغ، ما المعلومة التي لا يجب الخلط فيها حول «طيف العمل»؟",
    "options": [
      "يبين فعالية الأطوال الموجية في التركيب الضوئي",
      "ناتج مختزل يمكن أن يساهم في تركيب السكريات",
      "مقر سلاسل نقل الإلكترونات الضوئية",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 0,
    "explanation": "طيف العمل يرتبط هنا بـ: يبين فعالية الأطوال الموجية في التركيب الضوئي.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 226,
    "unitId": 6,
    "questionText": "ضمن 6.1 — الصانعة الخضراء والأصباغ، ما الخيار الموافق للبرنامج عندما نذكر «الضوء الأحمر والأزرق»؟",
    "options": [
      "صبغة مساعدة توسع مجال امتصاص الضوء",
      "سائل داخلي تتم فيه حلقة كالفن",
      "يمتصهما اليخضور بفعالية عالية",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الضوء الأحمر والأزرق يرتبط هنا بـ: يمتصهما اليخضور بفعالية عالية.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 227,
    "unitId": 6,
    "questionText": "في 6.1 — الصانعة الخضراء والأصباغ، أي علاقة صحيحة يبيّنها مصطلح «الضوء الأخضر»؟",
    "options": [
      "تراص عدة ثيلاكويدات داخل الصانعة",
      "ينعكس جزئياً لذلك تبدو الأوراق خضراء",
      "ناقل إلكترونات مختزل يستعمل في حلقة كالفن",
      "حلقة كالفن تتم داخل جوف الثيلاكويد لا في الستروما."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الضوء الأخضر يرتبط هنا بـ: ينعكس جزئياً لذلك تبدو الأوراق خضراء.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 228,
    "unitId": 6,
    "questionText": "في سؤال بكالوريا قصير حول 6.1 — الصانعة الخضراء والأصباغ، بماذا نربط «الغشاء الداخلي للثيلاكويد»؟",
    "options": [
      "يعوض إلكتروناته من تفكك الماء",
      "مقر سلاسل نقل الإلكترونات الضوئية",
      "نقصه يخفض قدرة امتصاص الضوء",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الغشاء الداخلي للثيلاكويد يرتبط هنا بـ: مقر سلاسل نقل الإلكترونات الضوئية.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 229,
    "unitId": 6,
    "questionText": "في محور 6.2 — المرحلة الكيموضوئية، أي عبارة تساعد على تمييز «المرحلة الكيموضوئية» عن المفاهيم القريبة؟",
    "options": [
      "لا تحتاج الضوء مباشرة لكنها تعتمد على نواتج المرحلة الضوئية",
      "6CO2 و6H2O يعطيان مادة عضوية وO2 بوجود الضوء",
      "تتم في الثيلاكويدات وتنتج ATP وNADPH وO2",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 2,
    "explanation": "المرحلة الكيموضوئية يرتبط هنا بـ: تتم في الثيلاكويدات وتنتج ATP وNADPH وO2.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 230,
    "unitId": 6,
    "questionText": "إذا طُلب تفسير «التحلل الضوئي للماء» ضمن 6.2 — المرحلة الكيموضوئية، فأي جواب هو الأدق؟",
    "options": [
      "أول مركب ثلاثي الكربون بعد تثبيت CO2",
      "يعطي O2 وإلكترونات وبروتونات",
      "تؤثر خاصة في التفاعلات الإنزيمية لحلقة كالفن",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 1,
    "explanation": "التحلل الضوئي للماء يرتبط هنا بـ: يعطي O2 وإلكترونات وبروتونات.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 231,
    "unitId": 6,
    "questionText": "في محور 6.2 — المرحلة الكيموضوئية، أي وصف دقيق لـ«النظام الضوئي II»؟",
    "options": [
      "مقر إنتاج الطاقة الكيميائية المؤقتة",
      "يعوض إلكتروناته من تفكك الماء",
      "العامل الأقل ملاءمة الذي يضبط سرعة العملية",
      "اليخضور لا يمتص أي طول موجي من الضوء."
    ],
    "correctAnswerIndex": 1,
    "explanation": "النظام الضوئي II يرتبط هنا بـ: يعوض إلكتروناته من تفكك الماء.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 232,
    "unitId": 6,
    "questionText": "في موضوع 6.2 — المرحلة الكيموضوئية، أي عبارة صحيحة حول «النظام الضوئي I»؟",
    "options": [
      "6CO2 و6H2O يعطيان مادة عضوية وO2 بوجود الضوء",
      "صبغة أساسية تمتص الضوء وتطلق إلكترونات مثارة",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة.",
      "يساهم في اختزال +NADP إلى NADPH"
    ],
    "correctAnswerIndex": 3,
    "explanation": "النظام الضوئي I يرتبط هنا بـ: يساهم في اختزال +NADP إلى NADPH.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 233,
    "unitId": 6,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «سلسلة الإلكترونات» ضمن 6.2 — المرحلة الكيموضوئية.",
    "options": [
      "تنقل الإلكترونات وتساهم في ضخ البروتونات",
      "تركيب ATP اعتماداً على الطاقة الضوئية",
      "مرحلة تستهلك ATP لاستمرار الحلقة",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة."
    ],
    "correctAnswerIndex": 0,
    "explanation": "سلسلة الإلكترونات يرتبط هنا بـ: تنقل الإلكترونات وتساهم في ضخ البروتونات.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 234,
    "unitId": 6,
    "questionText": "في محور 6.2 — المرحلة الكيموضوئية، أي إكمال صحيح: «تدرج البروتونات» ← ________؟",
    "options": [
      "ترفع التركيب الضوئي حتى حد الإشباع الضوئي",
      "يستعمله ATP synthase لتركيب ATP",
      "مقر سلاسل نقل الإلكترونات الضوئية",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "تدرج البروتونات يرتبط هنا بـ: يستعمله ATP synthase لتركيب ATP.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 235,
    "unitId": 6,
    "questionText": "عند مراجعة 6.2 — المرحلة الكيموضوئية، ما المعلومة التي لا يجب الخلط فيها حول «الفسفرة الضوئية»؟",
    "options": [
      "تركيب ATP اعتماداً على الطاقة الضوئية",
      "صبغة مساعدة توسع مجال امتصاص الضوء",
      "إنزيم يثبت CO2 على RuBP",
      "اليخضور لا يمتص أي طول موجي من الضوء."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الفسفرة الضوئية يرتبط هنا بـ: تركيب ATP اعتماداً على الطاقة الضوئية.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 236,
    "unitId": 6,
    "questionText": "ضمن 6.2 — المرحلة الكيموضوئية، ما الخيار الموافق للبرنامج عندما نذكر «NADPH»؟",
    "options": [
      "مصدر الكربون في المادة العضوية المصنعة",
      "ناقل إلكترونات مختزل يستعمل في حلقة كالفن",
      "صبغة مساعدة توسع مجال امتصاص الضوء",
      "حلقة كالفن تتم داخل جوف الثيلاكويد لا في الستروما."
    ],
    "correctAnswerIndex": 1,
    "explanation": "NADPH يرتبط هنا بـ: ناقل إلكترونات مختزل يستعمل في حلقة كالفن.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 237,
    "unitId": 6,
    "questionText": "في 6.2 — المرحلة الكيموضوئية، أي علاقة صحيحة يبيّنها مصطلح «O2 المطروح»؟",
    "options": [
      "تركيب ATP اعتماداً على الطاقة الضوئية",
      "مصدره الماء لا CO2",
      "مقر سلاسل نقل الإلكترونات الضوئية",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 1,
    "explanation": "O2 المطروح يرتبط هنا بـ: مصدره الماء لا CO2.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 238,
    "unitId": 6,
    "questionText": "في سؤال بكالوريا قصير حول 6.2 — المرحلة الكيموضوئية، بماذا نربط «الضوء»؟",
    "options": [
      "يستعملان للاختزال والبناء في حلقة كالفن",
      "لا تحتاج الضوء مباشرة لكنها تعتمد على نواتج المرحلة الضوئية",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية.",
      "ضروري لإثارة إلكترونات الأصباغ"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الضوء يرتبط هنا بـ: ضروري لإثارة إلكترونات الأصباغ.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 239,
    "unitId": 6,
    "questionText": "في محور 6.2 — المرحلة الكيموضوئية، أي عبارة تساعد على تمييز «الثيلاكويد» عن المفاهيم القريبة؟",
    "options": [
      "أول مركب ثلاثي الكربون بعد تثبيت CO2",
      "مرحلة تستهلك ATP لاستمرار الحلقة",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات.",
      "مقر إنتاج الطاقة الكيميائية المؤقتة"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الثيلاكويد يرتبط هنا بـ: مقر إنتاج الطاقة الكيميائية المؤقتة.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 240,
    "unitId": 6,
    "questionText": "إذا طُلب تفسير «حلقة كالفن» ضمن 6.3 — حلقة كالفن، فأي جواب هو الأدق؟",
    "options": [
      "مقر إنتاج الطاقة الكيميائية المؤقتة",
      "عضية يتم فيها التركيب الضوئي في الخلايا اليخضورية",
      "تثبت CO2 في الستروما باستعمال ATP وNADPH",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "حلقة كالفن يرتبط هنا بـ: تثبت CO2 في الستروما باستعمال ATP وNADPH.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 241,
    "unitId": 6,
    "questionText": "في محور 6.3 — حلقة كالفن، أي وصف دقيق لـ«RuBisCO»؟",
    "options": [
      "يعوض إلكتروناته من تفكك الماء",
      "أكياس غشائية تحمل أصباغاً ومكونات المرحلة الضوئية",
      "إنزيم يثبت CO2 على RuBP",
      "مصدر O2 المطروح في التركيب الضوئي هو CO2 مباشرة."
    ],
    "correctAnswerIndex": 2,
    "explanation": "RuBisCO يرتبط هنا بـ: إنزيم يثبت CO2 على RuBP.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 242,
    "unitId": 6,
    "questionText": "في موضوع 6.3 — حلقة كالفن، أي عبارة صحيحة حول «RuBP»؟",
    "options": [
      "يحد من سرعة تركيب المادة العضوية",
      "تركيب ATP اعتماداً على الطاقة الضوئية",
      "مركب خماسي الكربون يستقبل CO2",
      "اليخضور لا يمتص أي طول موجي من الضوء."
    ],
    "correctAnswerIndex": 2,
    "explanation": "RuBP يرتبط هنا بـ: مركب خماسي الكربون يستقبل CO2.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 243,
    "unitId": 6,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «APG» ضمن 6.3 — حلقة كالفن.",
    "options": [
      "أول مركب ثلاثي الكربون بعد تثبيت CO2",
      "ينعكس جزئياً لذلك تبدو الأوراق خضراء",
      "أصباغ مساعدة وتحمي من فائض الضوء",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "APG يرتبط هنا بـ: أول مركب ثلاثي الكربون بعد تثبيت CO2.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 244,
    "unitId": 6,
    "questionText": "في محور 6.3 — حلقة كالفن، أي إكمال صحيح: «G3P» ← ________؟",
    "options": [
      "تثبت CO2 في الستروما باستعمال ATP وNADPH",
      "تنقل الإلكترونات وتساهم في ضخ البروتونات",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس.",
      "ناتج مختزل يمكن أن يساهم في تركيب السكريات"
    ],
    "correctAnswerIndex": 3,
    "explanation": "G3P يرتبط هنا بـ: ناتج مختزل يمكن أن يساهم في تركيب السكريات.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 245,
    "unitId": 6,
    "questionText": "عند مراجعة 6.3 — حلقة كالفن، ما المعلومة التي لا يجب الخلط فيها حول «تجديد RuBP»؟",
    "options": [
      "يبين فعالية الأطوال الموجية في التركيب الضوئي",
      "مرحلة تستهلك ATP لاستمرار الحلقة",
      "لا تحتاج الضوء مباشرة لكنها تعتمد على نواتج المرحلة الضوئية",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 1,
    "explanation": "تجديد RuBP يرتبط هنا بـ: مرحلة تستهلك ATP لاستمرار الحلقة.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 246,
    "unitId": 6,
    "questionText": "ضمن 6.3 — حلقة كالفن، ما الخيار الموافق للبرنامج عندما نذكر «المرحلة اللاضوئية»؟",
    "options": [
      "مرحلة تستهلك ATP لاستمرار الحلقة",
      "نقصه يخفض قدرة امتصاص الضوء",
      "يدل على زيادة غير محدودة في السرعة دون إشباع.",
      "لا تحتاج الضوء مباشرة لكنها تعتمد على نواتج المرحلة الضوئية"
    ],
    "correctAnswerIndex": 3,
    "explanation": "المرحلة اللاضوئية يرتبط هنا بـ: لا تحتاج الضوء مباشرة لكنها تعتمد على نواتج المرحلة الضوئية.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 247,
    "unitId": 6,
    "questionText": "في 6.3 — حلقة كالفن، أي علاقة صحيحة يبيّنها مصطلح «CO2»؟",
    "options": [
      "مصدر الكربون في المادة العضوية المصنعة",
      "تحويل طاقة ضوئية إلى طاقة كيميائية في المادة العضوية",
      "يستعملان للاختزال والبناء في حلقة كالفن",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "CO2 يرتبط هنا بـ: مصدر الكربون في المادة العضوية المصنعة.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 248,
    "unitId": 6,
    "questionText": "في سؤال بكالوريا قصير حول 6.3 — حلقة كالفن، بماذا نربط «ATP وNADPH»؟",
    "options": [
      "صبغة أساسية تمتص الضوء وتطلق إلكترونات مثارة",
      "لا تحتاج الضوء مباشرة لكنها تعتمد على نواتج المرحلة الضوئية",
      "يستعملان للاختزال والبناء في حلقة كالفن",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة."
    ],
    "correctAnswerIndex": 2,
    "explanation": "ATP وNADPH يرتبط هنا بـ: يستعملان للاختزال والبناء في حلقة كالفن.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 249,
    "unitId": 6,
    "questionText": "في محور 6.3 — حلقة كالفن، أي عبارة تساعد على تمييز «الستروما» عن المفاهيم القريبة؟",
    "options": [
      "شدة إضاءة يتساوى عندها التركيب الضوئي والتنفس",
      "ضروري لإثارة إلكترونات الأصباغ",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة.",
      "المقر السائل لحلقة كالفن"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الستروما يرتبط هنا بـ: المقر السائل لحلقة كالفن.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 250,
    "unitId": 6,
    "questionText": "إذا طُلب تفسير «نقص CO2» ضمن 6.3 — حلقة كالفن، فأي جواب هو الأدق؟",
    "options": [
      "مقر سلاسل نقل الإلكترونات الضوئية",
      "يحد من سرعة تركيب المادة العضوية",
      "تراص عدة ثيلاكويدات داخل الصانعة",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "نقص CO2 يرتبط هنا بـ: يحد من سرعة تركيب المادة العضوية.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 251,
    "unitId": 6,
    "questionText": "في محور 6.4 — الحصيلة والعوامل المؤثرة في التركيب الضوئي، أي وصف دقيق لـ«المعادلة الإجمالية»؟",
    "options": [
      "إنزيم يثبت CO2 على RuBP",
      "شدة إضاءة يتساوى عندها التركيب الضوئي والتنفس",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات.",
      "6CO2 و6H2O يعطيان مادة عضوية وO2 بوجود الضوء"
    ],
    "correctAnswerIndex": 3,
    "explanation": "المعادلة الإجمالية يرتبط هنا بـ: 6CO2 و6H2O يعطيان مادة عضوية وO2 بوجود الضوء.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 252,
    "unitId": 6,
    "questionText": "في موضوع 6.4 — الحصيلة والعوامل المؤثرة في التركيب الضوئي، أي عبارة صحيحة حول «الحصيلة الطاقوية»؟",
    "options": [
      "تحويل طاقة ضوئية إلى طاقة كيميائية في المادة العضوية",
      "6CO2 و6H2O يعطيان مادة عضوية وO2 بوجود الضوء",
      "ترفع التركيب الضوئي حتى حد الإشباع الضوئي",
      "اليخضور لا يمتص أي طول موجي من الضوء."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الحصيلة الطاقوية يرتبط هنا بـ: تحويل طاقة ضوئية إلى طاقة كيميائية في المادة العضوية.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 253,
    "unitId": 6,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «شدة الإضاءة» ضمن 6.4 — الحصيلة والعوامل المؤثرة في التركيب الضوئي.",
    "options": [
      "العامل الأقل ملاءمة الذي يضبط سرعة العملية",
      "مقر سلاسل نقل الإلكترونات الضوئية",
      "ترفع التركيب الضوئي حتى حد الإشباع الضوئي",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 2,
    "explanation": "شدة الإضاءة يرتبط هنا بـ: ترفع التركيب الضوئي حتى حد الإشباع الضوئي.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 254,
    "unitId": 6,
    "questionText": "في محور 6.4 — الحصيلة والعوامل المؤثرة في التركيب الضوئي، أي إكمال صحيح: «تركيز CO2» ← ________؟",
    "options": [
      "يقلل دخول CO2 ويخفض التركيب الضوئي",
      "مصدر إلكترونات وبروتونات في المرحلة الضوئية",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا.",
      "عامل محدد إذا كان منخفضاً"
    ],
    "correctAnswerIndex": 3,
    "explanation": "تركيز CO2 يرتبط هنا بـ: عامل محدد إذا كان منخفضاً.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 255,
    "unitId": 6,
    "questionText": "عند مراجعة 6.4 — الحصيلة والعوامل المؤثرة في التركيب الضوئي، ما المعلومة التي لا يجب الخلط فيها حول «درجة الحرارة»؟",
    "options": [
      "يستمر في النبات في غياب الضوء",
      "تؤثر خاصة في التفاعلات الإنزيمية لحلقة كالفن",
      "مقر إنتاج الطاقة الكيميائية المؤقتة",
      "اليخضور لا يمتص أي طول موجي من الضوء."
    ],
    "correctAnswerIndex": 1,
    "explanation": "درجة الحرارة يرتبط هنا بـ: تؤثر خاصة في التفاعلات الإنزيمية لحلقة كالفن.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 256,
    "unitId": 6,
    "questionText": "ضمن 6.4 — الحصيلة والعوامل المؤثرة في التركيب الضوئي، ما الخيار الموافق للبرنامج عندما نذكر «نقطة التعويض الضوئي»؟",
    "options": [
      "يحد من سرعة تركيب المادة العضوية",
      "ناتج مختزل يمكن أن يساهم في تركيب السكريات",
      "يدل على زيادة غير محدودة في السرعة دون إشباع.",
      "شدة إضاءة يتساوى عندها التركيب الضوئي والتنفس"
    ],
    "correctAnswerIndex": 3,
    "explanation": "نقطة التعويض الضوئي يرتبط هنا بـ: شدة إضاءة يتساوى عندها التركيب الضوئي والتنفس.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 257,
    "unitId": 6,
    "questionText": "في 6.4 — الحصيلة والعوامل المؤثرة في التركيب الضوئي، أي علاقة صحيحة يبيّنها مصطلح «العامل المحدد»؟",
    "options": [
      "العامل الأقل ملاءمة الذي يضبط سرعة العملية",
      "تنقل الإلكترونات وتساهم في ضخ البروتونات",
      "تؤثر خاصة في التفاعلات الإنزيمية لحلقة كالفن",
      "يتم فقط في غياب الماء والأيونات."
    ],
    "correctAnswerIndex": 0,
    "explanation": "العامل المحدد يرتبط هنا بـ: العامل الأقل ملاءمة الذي يضبط سرعة العملية.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 258,
    "unitId": 6,
    "questionText": "في سؤال بكالوريا قصير حول 6.4 — الحصيلة والعوامل المؤثرة في التركيب الضوئي، بماذا نربط «إغلاق الثغور»؟",
    "options": [
      "أكياس غشائية تحمل أصباغاً ومكونات المرحلة الضوئية",
      "مصدر إلكترونات وبروتونات في المرحلة الضوئية",
      "يقلل دخول CO2 ويخفض التركيب الضوئي",
      "اليخضور لا يمتص أي طول موجي من الضوء."
    ],
    "correctAnswerIndex": 2,
    "explanation": "إغلاق الثغور يرتبط هنا بـ: يقلل دخول CO2 ويخفض التركيب الضوئي.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 259,
    "unitId": 6,
    "questionText": "في محور 6.4 — الحصيلة والعوامل المؤثرة في التركيب الضوئي، أي عبارة تساعد على تمييز «الماء» عن المفاهيم القريبة؟",
    "options": [
      "تؤثر خاصة في التفاعلات الإنزيمية لحلقة كالفن",
      "ينعكس جزئياً لذلك تبدو الأوراق خضراء",
      "مصدر إلكترونات وبروتونات في المرحلة الضوئية",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الماء يرتبط هنا بـ: مصدر إلكترونات وبروتونات في المرحلة الضوئية.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 260,
    "unitId": 6,
    "questionText": "إذا طُلب تفسير «اليخضور» ضمن 6.4 — الحصيلة والعوامل المؤثرة في التركيب الضوئي، فأي جواب هو الأدق؟",
    "options": [
      "إنزيم يثبت CO2 على RuBP",
      "تثبت CO2 في الستروما باستعمال ATP وNADPH",
      "حلقة كالفن تتم داخل جوف الثيلاكويد لا في الستروما.",
      "نقصه يخفض قدرة امتصاص الضوء"
    ],
    "correctAnswerIndex": 3,
    "explanation": "اليخضور يرتبط هنا بـ: نقصه يخفض قدرة امتصاص الضوء.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 261,
    "unitId": 6,
    "questionText": "في محور 6.4 — الحصيلة والعوامل المؤثرة في التركيب الضوئي، أي وصف دقيق لـ«التنفس الليلي»؟",
    "options": [
      "يستمر في النبات في غياب الضوء",
      "شدة إضاءة يتساوى عندها التركيب الضوئي والتنفس",
      "مركب خماسي الكربون يستقبل CO2",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور."
    ],
    "correctAnswerIndex": 0,
    "explanation": "التنفس الليلي يرتبط هنا بـ: يستمر في النبات في غياب الضوء.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 262,
    "unitId": 7,
    "questionText": "في موضوع 7.1 — الميتوكندري، أي عبارة صحيحة حول «الميتوكندري»؟",
    "options": [
      "يتحد مع Acétyl-CoA في بداية الحلقة",
      "عضية التنفس الخلوي الهوائي وإنتاج ATP",
      "ينتج مقدار قليل مباشرة في الحلقة",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الميتوكندري يرتبط هنا بـ: عضية التنفس الخلوي الهوائي وإنتاج ATP.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 263,
    "unitId": 7,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «الغشاء الداخلي» ضمن 7.1 — الميتوكندري.",
    "options": [
      "ينتج مقدار قليل مباشرة في الحلقة",
      "تتجدد في نهايتها ولا تستهلك نهائياً",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية.",
      "يحمل السلسلة التنفسية وATP synthase"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الغشاء الداخلي يرتبط هنا بـ: يحمل السلسلة التنفسية وATP synthase.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 264,
    "unitId": 7,
    "questionText": "في محور 7.1 — الميتوكندري، أي إكمال صحيح: «الأعراف» ← ________؟",
    "options": [
      "قد تنتج حمضاً لبنياً عند نقص O2",
      "تنجز تخمراً كحولياً في غياب O2",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس.",
      "طيات تزيد مساحة الغشاء الداخلي"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الأعراف يرتبط هنا بـ: طيات تزيد مساحة الغشاء الداخلي.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 265,
    "unitId": 7,
    "questionText": "عند مراجعة 7.1 — الميتوكندري، ما المعلومة التي لا يجب الخلط فيها حول «المصفوفة»؟",
    "options": [
      "يوقف السلسلة ويمنع تجديد NAD+ بكفاءة",
      "أكسدة Acétyl-CoA في المصفوفة مع تحرير CO2",
      "O2 هو ناتج نهائي للتخمر الكحولي.",
      "مقر أكسدة البيروفات وحلقة كريبس"
    ],
    "correctAnswerIndex": 3,
    "explanation": "المصفوفة يرتبط هنا بـ: مقر أكسدة البيروفات وحلقة كريبس.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 266,
    "unitId": 7,
    "questionText": "ضمن 7.1 — الميتوكندري، ما الخيار الموافق للبرنامج عندما نذكر «الغشاء الخارجي»؟",
    "options": [
      "يفصل الميتوكندري عن الهيولى",
      "لا يستهلك مباشرة في التحلل السكري",
      "عضية التنفس الخلوي الهوائي وإنتاج ATP",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الغشاء الخارجي يرتبط هنا بـ: يفصل الميتوكندري عن الهيولى.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 267,
    "unitId": 7,
    "questionText": "في 7.1 — الميتوكندري، أي علاقة صحيحة يبيّنها مصطلح «الحشوة الميتوكندرية»؟",
    "options": [
      "تحتوي إنزيمات ودنا ميتوكندري",
      "نواقل مختزلة تحمل إلكترونات للسلسلة التنفسية",
      "المستقبل النهائي للإلكترونات ويتحول إلى ماء",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الحشوة الميتوكندرية يرتبط هنا بـ: تحتوي إنزيمات ودنا ميتوكندري.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 268,
    "unitId": 7,
    "questionText": "في سؤال بكالوريا قصير حول 7.1 — الميتوكندري، بماذا نربط «وجود O2»؟",
    "options": [
      "يتحد مع Acétyl-CoA في بداية الحلقة",
      "يحول البيروفات إلى حمض لبني",
      "ينتج مباشرة أجساماً مضادة في كل الحالات.",
      "يسمح باستمرار السلسلة التنفسية"
    ],
    "correctAnswerIndex": 3,
    "explanation": "وجود O2 يرتبط هنا بـ: يسمح باستمرار السلسلة التنفسية.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 269,
    "unitId": 7,
    "questionText": "في محور 7.1 — الميتوكندري، أي عبارة تساعد على تمييز «ATP الميتوكندري» عن المفاهيم القريبة؟",
    "options": [
      "يوجه البيروفات نحو التخمر لتجديد NAD+",
      "يوقف السلسلة ويمنع تجديد NAD+ بكفاءة",
      "ينتج بكثرة في الفسفرة التأكسدية",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "ATP الميتوكندري يرتبط هنا بـ: ينتج بكثرة في الفسفرة التأكسدية.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 270,
    "unitId": 7,
    "questionText": "إذا طُلب تفسير «تدرج H+» ضمن 7.1 — الميتوكندري، فأي جواب هو الأدق؟",
    "options": [
      "تنتج ATP وNADH",
      "يتشكل عبر الغشاء الداخلي",
      "الناتج النهائي للتحلل السكري",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "تدرج H+ يرتبط هنا بـ: يتشكل عبر الغشاء الداخلي.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 271,
    "unitId": 7,
    "questionText": "في محور 7.2 — التحلل السكري، أي وصف دقيق لـ«التحلل السكري»؟",
    "options": [
      "المستقبل النهائي للإلكترونات ويتحول إلى ماء",
      "تحتوي إنزيمات ودنا ميتوكندري",
      "تفكيك الغلوكوز إلى بيروفات في الهيولى",
      "التحلل السكري يتم داخل المصفوفة الميتوكندرية فقط."
    ],
    "correctAnswerIndex": 2,
    "explanation": "التحلل السكري يرتبط هنا بـ: تفكيك الغلوكوز إلى بيروفات في الهيولى.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 272,
    "unitId": 7,
    "questionText": "في موضوع 7.2 — التحلل السكري، أي عبارة صحيحة حول «المقر»؟",
    "options": [
      "ينتج بكثرة في الفسفرة التأكسدية",
      "الهيولى وليس الميتوكندري",
      "مدخل حلقة كريبس بعد أكسدة البيروفات",
      "ينتج مباشرة أجساماً مضادة في كل الحالات."
    ],
    "correctAnswerIndex": 1,
    "explanation": "المقر يرتبط هنا بـ: الهيولى وليس الميتوكندري.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 273,
    "unitId": 7,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «الأكسجين» ضمن 7.2 — التحلل السكري.",
    "options": [
      "مقر أكسدة البيروفات وحلقة كريبس",
      "تتجدد في نهايتها ولا تستهلك نهائياً",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية.",
      "لا يستهلك مباشرة في التحلل السكري"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الأكسجين يرتبط هنا بـ: لا يستهلك مباشرة في التحلل السكري.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 274,
    "unitId": 7,
    "questionText": "في محور 7.2 — التحلل السكري، أي إكمال صحيح: «الحصيلة الصافية» ← ________؟",
    "options": [
      "يجعل الخلية تعتمد أكثر على التخمر",
      "2 ATP و2 NADH لكل غلوكوز تقريباً",
      "يفسر انتفاخ العجين",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الحصيلة الصافية يرتبط هنا بـ: 2 ATP و2 NADH لكل غلوكوز تقريباً.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 275,
    "unitId": 7,
    "questionText": "عند مراجعة 7.2 — التحلل السكري، ما المعلومة التي لا يجب الخلط فيها حول «البيروفات»؟",
    "options": [
      "مقر أكسدة البيروفات وحلقة كريبس",
      "تحتوي إنزيمات ودنا ميتوكندري",
      "الناتج النهائي للتحلل السكري",
      "O2 هو ناتج نهائي للتخمر الكحولي."
    ],
    "correctAnswerIndex": 2,
    "explanation": "البيروفات يرتبط هنا بـ: الناتج النهائي للتحلل السكري.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 276,
    "unitId": 7,
    "questionText": "ضمن 7.2 — التحلل السكري، ما الخيار الموافق للبرنامج عندما نذكر «NAD+»؟",
    "options": [
      "يختزل إلى NADH أثناء التحلل السكري",
      "تربط التحلل السكري بحلقة كريبس",
      "المستقبل النهائي للإلكترونات ويتحول إلى ماء",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "NAD+ يرتبط هنا بـ: يختزل إلى NADH أثناء التحلل السكري.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 277,
    "unitId": 7,
    "questionText": "في 7.2 — التحلل السكري، أي علاقة صحيحة يبيّنها مصطلح «المرحلة الاستثمارية»؟",
    "options": [
      "يدخل إلكتروناته في مستوى لاحق من السلسلة",
      "مسار لاهوائي يجدد NAD+ ليستمر التحلل السكري",
      "تستهلك ATP في بداية المسار",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "المرحلة الاستثمارية يرتبط هنا بـ: تستهلك ATP في بداية المسار.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 278,
    "unitId": 7,
    "questionText": "في سؤال بكالوريا قصير حول 7.2 — التحلل السكري، بماذا نربط «المرحلة المردودية»؟",
    "options": [
      "يتحد مع Acétyl-CoA في بداية الحلقة",
      "الهيولى وليس الميتوكندري",
      "ATP Synthase يثبت CO2 في حلقة كالفن.",
      "تنتج ATP وNADH"
    ],
    "correctAnswerIndex": 3,
    "explanation": "المرحلة المردودية يرتبط هنا بـ: تنتج ATP وNADH.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 279,
    "unitId": 7,
    "questionText": "في محور 7.2 — التحلل السكري، أي عبارة تساعد على تمييز «غياب O2» عن المفاهيم القريبة؟",
    "options": [
      "يوجه البيروفات نحو التخمر لتجديد NAD+",
      "طيات تزيد مساحة الغشاء الداخلي",
      "مقر حلقة كريبس",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 0,
    "explanation": "غياب O2 يرتبط هنا بـ: يوجه البيروفات نحو التخمر لتجديد NAD+.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 280,
    "unitId": 7,
    "questionText": "إذا طُلب تفسير «حلقة كريبس» ضمن 7.3 — حلقة كريبس، فأي جواب هو الأدق؟",
    "options": [
      "يفصل الميتوكندري عن الهيولى",
      "مسار لاهوائي يجدد NAD+ ليستمر التحلل السكري",
      "أكسدة Acétyl-CoA في المصفوفة مع تحرير CO2",
      "التحلل السكري يتم داخل المصفوفة الميتوكندرية فقط."
    ],
    "correctAnswerIndex": 2,
    "explanation": "حلقة كريبس يرتبط هنا بـ: أكسدة Acétyl-CoA في المصفوفة مع تحرير CO2.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 281,
    "unitId": 7,
    "questionText": "في محور 7.3 — حلقة كريبس، أي وصف دقيق لـ«Acétyl-CoA»؟",
    "options": [
      "إنتاج ATP مرتبط بأكسدة النواقل المختزلة",
      "مدخل حلقة كريبس بعد أكسدة البيروفات",
      "تستهلك ATP في بداية المسار",
      "يعني توقف كل التحولات الطاقوية في الخلية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "Acétyl-CoA يرتبط هنا بـ: مدخل حلقة كريبس بعد أكسدة البيروفات.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 282,
    "unitId": 7,
    "questionText": "في موضوع 7.3 — حلقة كريبس، أي عبارة صحيحة حول «CO2»؟",
    "options": [
      "ينشئ تدرج H+ عبر الغشاء الداخلي",
      "ينتج خلال أكسدة المركبات الكربونية في كريبس",
      "آلية استعمال تدرج البروتونات لإنتاج ATP",
      "O2 هو ناتج نهائي للتخمر الكحولي."
    ],
    "correctAnswerIndex": 1,
    "explanation": "CO2 يرتبط هنا بـ: ينتج خلال أكسدة المركبات الكربونية في كريبس.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 283,
    "unitId": 7,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «NADH وFADH2» ضمن 7.3 — حلقة كريبس.",
    "options": [
      "نواقل مختزلة تحمل إلكترونات للسلسلة التنفسية",
      "يتجدد خلال اختزال البيروفات أو مشتقاته",
      "يتحد مع Acétyl-CoA في بداية الحلقة",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة."
    ],
    "correctAnswerIndex": 0,
    "explanation": "NADH وFADH2 يرتبط هنا بـ: نواقل مختزلة تحمل إلكترونات للسلسلة التنفسية.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 284,
    "unitId": 7,
    "questionText": "في محور 7.3 — حلقة كريبس، أي إكمال صحيح: «المصفوفة» ← ________؟",
    "options": [
      "مقر حلقة كريبس",
      "المستقبل النهائي للإلكترونات ويتحول إلى ماء",
      "يختزل إلى NADH أثناء التحلل السكري",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "المصفوفة يرتبط هنا بـ: مقر حلقة كريبس.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 285,
    "unitId": 7,
    "questionText": "عند مراجعة 7.3 — حلقة كريبس، ما المعلومة التي لا يجب الخلط فيها حول «الأوكسالوأسيتات»؟",
    "options": [
      "يجعل الخلية تعتمد أكثر على التخمر",
      "المستقبل النهائي للإلكترونات ويتحول إلى ماء",
      "يتحد مع Acétyl-CoA في بداية الحلقة",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الأوكسالوأسيتات يرتبط هنا بـ: يتحد مع Acétyl-CoA في بداية الحلقة.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 286,
    "unitId": 7,
    "questionText": "ضمن 7.3 — حلقة كريبس، ما الخيار الموافق للبرنامج عندما نذكر «ATP/GTP»؟",
    "options": [
      "تستهلك ATP في بداية المسار",
      "ينتج مقدار قليل مباشرة في الحلقة",
      "يوجه البيروفات نحو التخمر لتجديد NAD+",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 1,
    "explanation": "ATP/GTP يرتبط هنا بـ: ينتج مقدار قليل مباشرة في الحلقة.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 287,
    "unitId": 7,
    "questionText": "في 7.3 — حلقة كريبس، أي علاقة صحيحة يبيّنها مصطلح «الحلقة»؟",
    "options": [
      "إنتاج ATP مرتبط بأكسدة النواقل المختزلة",
      "يفصل الميتوكندري عن الهيولى",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا.",
      "تتجدد في نهايتها ولا تستهلك نهائياً"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الحلقة يرتبط هنا بـ: تتجدد في نهايتها ولا تستهلك نهائياً.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 288,
    "unitId": 7,
    "questionText": "في سؤال بكالوريا قصير حول 7.3 — حلقة كريبس، بماذا نربط «أكسدة البيروفات»؟",
    "options": [
      "تحتوي إنزيمات ودنا ميتوكندري",
      "يفسر انتفاخ العجين",
      "يدل على زيادة غير محدودة في السرعة دون إشباع.",
      "تربط التحلل السكري بحلقة كريبس"
    ],
    "correctAnswerIndex": 3,
    "explanation": "أكسدة البيروفات يرتبط هنا بـ: تربط التحلل السكري بحلقة كريبس.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 289,
    "unitId": 7,
    "questionText": "في محور 7.4 — السلسلة التنفسية وATP Synthase، أي عبارة تساعد على تمييز «السلسلة التنفسية» عن المفاهيم القريبة؟",
    "options": [
      "نواقل مختزلة تحمل إلكترونات للسلسلة التنفسية",
      "الهيولى وليس الميتوكندري",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً.",
      "نواقل إلكترونات في الغشاء الداخلي للميتوكندري"
    ],
    "correctAnswerIndex": 3,
    "explanation": "السلسلة التنفسية يرتبط هنا بـ: نواقل إلكترونات في الغشاء الداخلي للميتوكندري.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 290,
    "unitId": 7,
    "questionText": "إذا طُلب تفسير «O2» ضمن 7.4 — السلسلة التنفسية وATP Synthase، فأي جواب هو الأدق؟",
    "options": [
      "المستقبل النهائي للإلكترونات ويتحول إلى ماء",
      "قد تنتج حمضاً لبنياً عند نقص O2",
      "يحمل السلسلة التنفسية وATP synthase",
      "O2 هو ناتج نهائي للتخمر الكحولي."
    ],
    "correctAnswerIndex": 0,
    "explanation": "O2 يرتبط هنا بـ: المستقبل النهائي للإلكترونات ويتحول إلى ماء.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 291,
    "unitId": 7,
    "questionText": "في محور 7.4 — السلسلة التنفسية وATP Synthase، أي وصف دقيق لـ«NADH»؟",
    "options": [
      "لا يستهلك مباشرة في التحلل السكري",
      "يعطي إلكترونات للسلسلة التنفسية",
      "الهيولى وليس الميتوكندري",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 1,
    "explanation": "NADH يرتبط هنا بـ: يعطي إلكترونات للسلسلة التنفسية.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 292,
    "unitId": 7,
    "questionText": "في موضوع 7.4 — السلسلة التنفسية وATP Synthase، أي عبارة صحيحة حول «FADH2»؟",
    "options": [
      "يوقف السلسلة ويمنع تجديد NAD+ بكفاءة",
      "يدخل إلكتروناته في مستوى لاحق من السلسلة",
      "قد تنتج حمضاً لبنياً عند نقص O2",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "FADH2 يرتبط هنا بـ: يدخل إلكتروناته في مستوى لاحق من السلسلة.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 293,
    "unitId": 7,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «ضخ البروتونات» ضمن 7.4 — السلسلة التنفسية وATP Synthase.",
    "options": [
      "ينشئ تدرج H+ عبر الغشاء الداخلي",
      "نواقل إلكترونات في الغشاء الداخلي للميتوكندري",
      "يوقف السلسلة ويمنع تجديد NAD+ بكفاءة",
      "التحلل السكري يتم داخل المصفوفة الميتوكندرية فقط."
    ],
    "correctAnswerIndex": 0,
    "explanation": "ضخ البروتونات يرتبط هنا بـ: ينشئ تدرج H+ عبر الغشاء الداخلي.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 294,
    "unitId": 7,
    "questionText": "في محور 7.4 — السلسلة التنفسية وATP Synthase، أي إكمال صحيح: «ATP Synthase» ← ________؟",
    "options": [
      "قد تنتج حمضاً لبنياً عند نقص O2",
      "تربط التحلل السكري بحلقة كريبس",
      "يستعمل عودة H+ لتركيب ATP",
      "O2 هو ناتج نهائي للتخمر الكحولي."
    ],
    "correctAnswerIndex": 2,
    "explanation": "ATP Synthase يرتبط هنا بـ: يستعمل عودة H+ لتركيب ATP.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 295,
    "unitId": 7,
    "questionText": "عند مراجعة 7.4 — السلسلة التنفسية وATP Synthase، ما المعلومة التي لا يجب الخلط فيها حول «الفسفرة التأكسدية»؟",
    "options": [
      "ينتج إيثانول وCO2 من البيروفات",
      "الهيولى وليس الميتوكندري",
      "إنتاج ATP مرتبط بأكسدة النواقل المختزلة",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الفسفرة التأكسدية يرتبط هنا بـ: إنتاج ATP مرتبط بأكسدة النواقل المختزلة.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 296,
    "unitId": 7,
    "questionText": "ضمن 7.4 — السلسلة التنفسية وATP Synthase، ما الخيار الموافق للبرنامج عندما نذكر «غياب O2»؟",
    "options": [
      "يجعل الخلية تعتمد أكثر على التخمر",
      "لا يستهلك مباشرة في التحلل السكري",
      "ATP Synthase يثبت CO2 في حلقة كالفن.",
      "يوقف السلسلة ويمنع تجديد NAD+ بكفاءة"
    ],
    "correctAnswerIndex": 3,
    "explanation": "غياب O2 يرتبط هنا بـ: يوقف السلسلة ويمنع تجديد NAD+ بكفاءة.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 297,
    "unitId": 7,
    "questionText": "في 7.4 — السلسلة التنفسية وATP Synthase، أي علاقة صحيحة يبيّنها مصطلح «الكيميواسموز»؟",
    "options": [
      "ينتج مقدار قليل مباشرة في الحلقة",
      "يستعمل عودة H+ لتركيب ATP",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية.",
      "آلية استعمال تدرج البروتونات لإنتاج ATP"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الكيميواسموز يرتبط هنا بـ: آلية استعمال تدرج البروتونات لإنتاج ATP.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_10_respiration.svg"
  },
  {
    "id": 298,
    "unitId": 7,
    "questionText": "في سؤال بكالوريا قصير حول 7.5 — التخمر اللبني والكحولي، بماذا نربط «التخمر»؟",
    "options": [
      "مسار لاهوائي يجدد NAD+ ليستمر التحلل السكري",
      "تربط التحلل السكري بحلقة كريبس",
      "ينتج خلال أكسدة المركبات الكربونية في كريبس",
      "التحلل السكري يتم داخل المصفوفة الميتوكندرية فقط."
    ],
    "correctAnswerIndex": 0,
    "explanation": "التخمر يرتبط هنا بـ: مسار لاهوائي يجدد NAD+ ليستمر التحلل السكري.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_11_fermentation.svg"
  },
  {
    "id": 299,
    "unitId": 7,
    "questionText": "في محور 7.5 — التخمر اللبني والكحولي، أي عبارة تساعد على تمييز «التخمر اللبني» عن المفاهيم القريبة؟",
    "options": [
      "يفسر انتفاخ العجين",
      "إنتاج ATP مرتبط بأكسدة النواقل المختزلة",
      "يحول البيروفات إلى حمض لبني",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 2,
    "explanation": "التخمر اللبني يرتبط هنا بـ: يحول البيروفات إلى حمض لبني.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_11_fermentation.svg"
  },
  {
    "id": 300,
    "unitId": 7,
    "questionText": "إذا طُلب تفسير «التخمر الكحولي» ضمن 7.5 — التخمر اللبني والكحولي، فأي جواب هو الأدق؟",
    "options": [
      "ينتج مقدار قليل مباشرة في الحلقة",
      "مدخل حلقة كريبس بعد أكسدة البيروفات",
      "ينتج إيثانول وCO2 من البيروفات",
      "يتم فقط في غياب الماء والأيونات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "التخمر الكحولي يرتبط هنا بـ: ينتج إيثانول وCO2 من البيروفات.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_11_fermentation.svg"
  },
  {
    "id": 301,
    "unitId": 7,
    "questionText": "في محور 7.5 — التخمر اللبني والكحولي، أي وصف دقيق لـ«الخميرة»؟",
    "options": [
      "ينتج إيثانول وCO2 من البيروفات",
      "التخمر يعطي 2 ATP فقط لكل غلوكوز",
      "تنجز تخمراً كحولياً في غياب O2",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الخميرة يرتبط هنا بـ: تنجز تخمراً كحولياً في غياب O2.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_11_fermentation.svg"
  },
  {
    "id": 302,
    "unitId": 7,
    "questionText": "في موضوع 7.5 — التخمر اللبني والكحولي، أي عبارة صحيحة حول «العضلة المجهدة»؟",
    "options": [
      "قد تنتج حمضاً لبنياً عند نقص O2",
      "عضية التنفس الخلوي الهوائي وإنتاج ATP",
      "تفكيك الغلوكوز إلى بيروفات في الهيولى",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور."
    ],
    "correctAnswerIndex": 0,
    "explanation": "العضلة المجهدة يرتبط هنا بـ: قد تنتج حمضاً لبنياً عند نقص O2.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_11_fermentation.svg"
  },
  {
    "id": 303,
    "unitId": 7,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «الحصيلة الطاقوية» ضمن 7.5 — التخمر اللبني والكحولي.",
    "options": [
      "قد تنتج حمضاً لبنياً عند نقص O2",
      "التخمر يعطي 2 ATP فقط لكل غلوكوز",
      "إنتاج ATP مرتبط بأكسدة النواقل المختزلة",
      "ATP Synthase يثبت CO2 في حلقة كالفن."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الحصيلة الطاقوية يرتبط هنا بـ: التخمر يعطي 2 ATP فقط لكل غلوكوز.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_11_fermentation.svg"
  },
  {
    "id": 304,
    "unitId": 7,
    "questionText": "في محور 7.5 — التخمر اللبني والكحولي، أي إكمال صحيح: «CO2 في التخمر الكحولي» ← ________؟",
    "options": [
      "2 ATP و2 NADH لكل غلوكوز تقريباً",
      "يفسر انتفاخ العجين",
      "مقر حلقة كريبس",
      "O2 هو ناتج نهائي للتخمر الكحولي."
    ],
    "correctAnswerIndex": 1,
    "explanation": "CO2 في التخمر الكحولي يرتبط هنا بـ: يفسر انتفاخ العجين.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_11_fermentation.svg"
  },
  {
    "id": 305,
    "unitId": 7,
    "questionText": "عند مراجعة 7.5 — التخمر اللبني والكحولي، ما المعلومة التي لا يجب الخلط فيها حول «NAD+»؟",
    "options": [
      "ينشئ تدرج H+ عبر الغشاء الداخلي",
      "تنجز تخمراً كحولياً في غياب O2",
      "O2 هو ناتج نهائي للتخمر الكحولي.",
      "يتجدد خلال اختزال البيروفات أو مشتقاته"
    ],
    "correctAnswerIndex": 3,
    "explanation": "NAD+ يرتبط هنا بـ: يتجدد خلال اختزال البيروفات أو مشتقاته.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_11_fermentation.svg"
  },
  {
    "id": 306,
    "unitId": 7,
    "questionText": "ضمن 7.5 — التخمر اللبني والكحولي، ما الخيار الموافق للبرنامج عندما نذكر «غياب الميتوكندري الفعال»؟",
    "options": [
      "تفكيك الغلوكوز إلى بيروفات في الهيولى",
      "يجعل الخلية تعتمد أكثر على التخمر",
      "يتحد مع Acétyl-CoA في بداية الحلقة",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "غياب الميتوكندري الفعال يرتبط هنا بـ: يجعل الخلية تعتمد أكثر على التخمر.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_11_fermentation.svg"
  },
  {
    "id": 307,
    "unitId": 8,
    "questionText": "في 8.1 — ATP والاقتران الطاقوي، أي علاقة صحيحة يبيّنها مصطلح «ATP»؟",
    "options": [
      "جزيء طاقوي مباشر الاستعمال في الخلية",
      "ترتبط بكمية المادة العضوية في مستوى غذائي",
      "يعطي صافي 2 ATP",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 0,
    "explanation": "ATP يرتبط هنا بـ: جزيء طاقوي مباشر الاستعمال في الخلية.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 308,
    "unitId": 8,
    "questionText": "في سؤال بكالوريا قصير حول 8.1 — ATP والاقتران الطاقوي، بماذا نربط «ADP + Pi»؟",
    "options": [
      "ينتجان عن حلمهة ATP",
      "تحدث في التخمر وتبقي طاقة في النواتج",
      "ينجز التركيب الضوئي والتنفس معاً",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "ADP + Pi يرتبط هنا بـ: ينتجان عن حلمهة ATP.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 309,
    "unitId": 8,
    "questionText": "في محور 8.1 — ATP والاقتران الطاقوي، أي عبارة تساعد على تمييز «الحلمهة» عن المفاهيم القريبة؟",
    "options": [
      "ربط تفاعل محرر للطاقة بتفاعل مستهلك لها",
      "نقل فوسفات من ATP لتفعيل تفاعل",
      "تحرر طاقة قابلة للاستعمال الخلوي",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الحلمهة يرتبط هنا بـ: تحرر طاقة قابلة للاستعمال الخلوي.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 310,
    "unitId": 8,
    "questionText": "إذا طُلب تفسير «الاقتران الطاقوي» ضمن 8.1 — ATP والاقتران الطاقوي، فأي جواب هو الأدق؟",
    "options": [
      "يدخلون الطاقة إلى النظام عبر التركيب الضوئي",
      "جزيء طاقوي مباشر الاستعمال في الخلية",
      "ربط تفاعل محرر للطاقة بتفاعل مستهلك لها",
      "ATP يخزن الطاقة لسنوات ولا يتجدد بسرعة."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الاقتران الطاقوي يرتبط هنا بـ: ربط تفاعل محرر للطاقة بتفاعل مستهلك لها.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 311,
    "unitId": 8,
    "questionText": "في محور 8.1 — ATP والاقتران الطاقوي، أي وصف دقيق لـ«فسفرة الجزيئات»؟",
    "options": [
      "جزيء طاقوي مباشر الاستعمال في الخلية",
      "تدور بين الكائنات والوسط خلاف الطاقة التي تتدفق",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا.",
      "نقل فوسفات من ATP لتفعيل تفاعل"
    ],
    "correctAnswerIndex": 3,
    "explanation": "فسفرة الجزيئات يرتبط هنا بـ: نقل فوسفات من ATP لتفعيل تفاعل.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 312,
    "unitId": 8,
    "questionText": "في موضوع 8.1 — ATP والاقتران الطاقوي، أي عبارة صحيحة حول «دورة ATP/ADP»؟",
    "options": [
      "تضمن تداول الطاقة داخل الخلية",
      "تذكر في بعض البرامج كمردودية قصوى تقريبية",
      "غالباً تستهلك ATP",
      "يتم فقط في غياب الماء والأيونات."
    ],
    "correctAnswerIndex": 0,
    "explanation": "دورة ATP/ADP يرتبط هنا بـ: تضمن تداول الطاقة داخل الخلية.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 313,
    "unitId": 8,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «ATP ليس مخزناً بعيد المدى» ضمن 8.1 — ATP والاقتران الطاقوي.",
    "options": [
      "بل وسيط سريع التجدد",
      "تحدث في التخمر وتبقي طاقة في النواتج",
      "ترتبط بكمية المادة العضوية في مستوى غذائي",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "ATP ليس مخزناً بعيد المدى يرتبط هنا بـ: بل وسيط سريع التجدد.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 314,
    "unitId": 8,
    "questionText": "في محور 8.1 — ATP والاقتران الطاقوي، أي إكمال صحيح: «التفاعلات البنائية» ← ________؟",
    "options": [
      "غالباً تستهلك ATP",
      "المقارنة الشاملة",
      "يجعل الطاقة المتاحة تنقص بين المستويات",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "التفاعلات البنائية يرتبط هنا بـ: غالباً تستهلك ATP.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 315,
    "unitId": 8,
    "questionText": "عند مراجعة 8.1 — ATP والاقتران الطاقوي، ما المعلومة التي لا يجب الخلط فيها حول «النقل الفعال»؟",
    "options": [
      "المقارنة الشاملة",
      "مثال لعملية تستهلك ATP",
      "تدور بين الكائنات والوسط خلاف الطاقة التي تتدفق",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور."
    ],
    "correctAnswerIndex": 1,
    "explanation": "النقل الفعال يرتبط هنا بـ: مثال لعملية تستهلك ATP.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 316,
    "unitId": 8,
    "questionText": "ضمن 8.1 — ATP والاقتران الطاقوي، ما الخيار الموافق للبرنامج عندما نذكر «العمل العضلي»؟",
    "options": [
      "يعتمد مباشرة على حلمهة ATP",
      "مردوديته 2 ATP لكل غلوكوز تقريباً",
      "ترتبط بكمية المادة العضوية في مستوى غذائي",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 0,
    "explanation": "العمل العضلي يرتبط هنا بـ: يعتمد مباشرة على حلمهة ATP.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 317,
    "unitId": 8,
    "questionText": "في 8.2 — العلاقة بين التركيب الضوئي والتنفس، أي علاقة صحيحة يبيّنها مصطلح «التركيب الضوئي»؟",
    "options": [
      "التركيب الضوئي والتنفس الخلوي",
      "ينتج مادة عضوية وO2",
      "ينجز التركيب الضوئي والتنفس معاً",
      "تدفق الطاقة يزداد عند كل مستوى غذائي."
    ],
    "correctAnswerIndex": 1,
    "explanation": "التركيب الضوئي يرتبط هنا بـ: ينتج مادة عضوية وO2.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 318,
    "unitId": 8,
    "questionText": "في سؤال بكالوريا قصير حول 8.2 — العلاقة بين التركيب الضوئي والتنفس، بماذا نربط «التنفس الخلوي»؟",
    "options": [
      "غالباً تستهلك ATP",
      "يعتمد مباشرة على حلمهة ATP",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس.",
      "يستهلك المادة العضوية وO2 لإنتاج ATP"
    ],
    "correctAnswerIndex": 3,
    "explanation": "التنفس الخلوي يرتبط هنا بـ: يستهلك المادة العضوية وO2 لإنتاج ATP.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 319,
    "unitId": 8,
    "questionText": "في محور 8.2 — العلاقة بين التركيب الضوئي والتنفس، أي عبارة تساعد على تمييز «CO2 والماء» عن المفاهيم القريبة؟",
    "options": [
      "يستهلك المادة العضوية وO2 لإنتاج ATP",
      "تمثل انتقال المادة والطاقة بين كائنات",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور.",
      "ناتجان عن التنفس ومواد أولية للتركيب الضوئي"
    ],
    "correctAnswerIndex": 3,
    "explanation": "CO2 والماء يرتبط هنا بـ: ناتجان عن التنفس ومواد أولية للتركيب الضوئي.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 320,
    "unitId": 8,
    "questionText": "إذا طُلب تفسير «التكامل الحيوي» ضمن 8.2 — العلاقة بين التركيب الضوئي والتنفس، فأي جواب هو الأدق؟",
    "options": [
      "ينجز التنفس فقط غالباً",
      "تحرر طاقة قابلة للاستعمال الخلوي",
      "يربط المنتجين والمستهلكين في المحيط الحيوي",
      "تدفق الطاقة يزداد عند كل مستوى غذائي."
    ],
    "correctAnswerIndex": 2,
    "explanation": "التكامل الحيوي يرتبط هنا بـ: يربط المنتجين والمستهلكين في المحيط الحيوي.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 321,
    "unitId": 8,
    "questionText": "في محور 8.2 — العلاقة بين التركيب الضوئي والتنفس، أي وصف دقيق لـ«النبات نهاراً»؟",
    "options": [
      "ينجز التركيب الضوئي والتنفس معاً",
      "بل وسيط سريع التجدد",
      "مخزن طاقة كيميائية ينتقل عبر السلاسل الغذائية",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 0,
    "explanation": "النبات نهاراً يرتبط هنا بـ: ينجز التركيب الضوئي والتنفس معاً.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 322,
    "unitId": 8,
    "questionText": "في موضوع 8.2 — العلاقة بين التركيب الضوئي والتنفس، أي عبارة صحيحة حول «النبات ليلاً»؟",
    "options": [
      "يتجدد أساساً بفضل التركيب الضوئي",
      "وجوده يسمح بإعادة أكسدة NADH عبر السلسلة",
      "ينجز التنفس فقط غالباً",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 2,
    "explanation": "النبات ليلاً يرتبط هنا بـ: ينجز التنفس فقط غالباً.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 323,
    "unitId": 8,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «المادة العضوية» ضمن 8.2 — العلاقة بين التركيب الضوئي والتنفس.",
    "options": [
      "انتقال الطاقة من مستوى غذائي إلى آخر",
      "يحصلون على الطاقة بأكل المادة العضوية",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات.",
      "مخزن طاقة كيميائية ينتقل عبر السلاسل الغذائية"
    ],
    "correctAnswerIndex": 3,
    "explanation": "المادة العضوية يرتبط هنا بـ: مخزن طاقة كيميائية ينتقل عبر السلاسل الغذائية.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 324,
    "unitId": 8,
    "questionText": "في محور 8.2 — العلاقة بين التركيب الضوئي والتنفس، أي إكمال صحيح: «O2 الجوي» ← ________؟",
    "options": [
      "يتجدد أساساً بفضل التركيب الضوئي",
      "غالباً منخفضة بين مستوى وآخر",
      "يعتمد مباشرة على حلمهة ATP",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "O2 الجوي يرتبط هنا بـ: يتجدد أساساً بفضل التركيب الضوئي.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 325,
    "unitId": 8,
    "questionText": "عند مراجعة 8.2 — العلاقة بين التركيب الضوئي والتنفس، ما المعلومة التي لا يجب الخلط فيها حول «التنفس»؟",
    "options": [
      "مخزن طاقة كيميائية ينتقل عبر السلاسل الغذائية",
      "يحرر الطاقة المخزنة في الروابط الكيميائية",
      "ينجز التنفس فقط غالباً",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "التنفس يرتبط هنا بـ: يحرر الطاقة المخزنة في الروابط الكيميائية.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 326,
    "unitId": 8,
    "questionText": "ضمن 8.2 — العلاقة بين التركيب الضوئي والتنفس، ما الخيار الموافق للبرنامج عندما نذكر «3 | العلاقة بين»؟",
    "options": [
      "تعيد تدوير المادة وتستعمل الطاقة المتبقية",
      "التركيب الضوئي والتنفس الخلوي",
      "وجوده يسمح بإعادة أكسدة NADH عبر السلسلة",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 1,
    "explanation": "3 | العلاقة بين يرتبط هنا بـ: التركيب الضوئي والتنفس الخلوي.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 327,
    "unitId": 8,
    "questionText": "في 8.3 — الحصائل الطاقوية المقارنة، أي علاقة صحيحة يبيّنها مصطلح «التنفس الهوائي»؟",
    "options": [
      "تحدث في التخمر وتبقي طاقة في النواتج",
      "يضيق نحو المستويات العليا",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية.",
      "أكثر مردودية من التخمر من حيث ATP"
    ],
    "correctAnswerIndex": 3,
    "explanation": "التنفس الهوائي يرتبط هنا بـ: أكثر مردودية من التخمر من حيث ATP.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 328,
    "unitId": 8,
    "questionText": "في سؤال بكالوريا قصير حول 8.3 — الحصائل الطاقوية المقارنة، بماذا نربط «التخمر»؟",
    "options": [
      "غالباً تستهلك ATP",
      "تحدث في التخمر وتبقي طاقة في النواتج",
      "مردوديته 2 ATP لكل غلوكوز تقريباً",
      "يعني توقف كل التحولات الطاقوية في الخلية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "التخمر يرتبط هنا بـ: مردوديته 2 ATP لكل غلوكوز تقريباً.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 329,
    "unitId": 8,
    "questionText": "في محور 8.3 — الحصائل الطاقوية المقارنة، أي عبارة تساعد على تمييز «التحلل السكري» عن المفاهيم القريبة؟",
    "options": [
      "يعطي صافي 2 ATP",
      "ينتج مادة عضوية وO2",
      "بل وسيط سريع التجدد",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 0,
    "explanation": "التحلل السكري يرتبط هنا بـ: يعطي صافي 2 ATP.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 330,
    "unitId": 8,
    "questionText": "إذا طُلب تفسير «كريبس والسلسلة» ضمن 8.3 — الحصائل الطاقوية المقارنة، فأي جواب هو الأدق؟",
    "options": [
      "يرفعان مردودية الأكسدة الهوائية",
      "تذكر في بعض البرامج كمردودية قصوى تقريبية",
      "يعتمد مباشرة على حلمهة ATP",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 0,
    "explanation": "كريبس والسلسلة يرتبط هنا بـ: يرفعان مردودية الأكسدة الهوائية.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 331,
    "unitId": 8,
    "questionText": "في محور 8.3 — الحصائل الطاقوية المقارنة، أي وصف دقيق لـ«الأكسدة الكاملة»؟",
    "options": [
      "تحول الغلوكوز إلى CO2 وH2O",
      "بل وسيط سريع التجدد",
      "تحرر طاقة قابلة للاستعمال الخلوي",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الأكسدة الكاملة يرتبط هنا بـ: تحول الغلوكوز إلى CO2 وH2O.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 332,
    "unitId": 8,
    "questionText": "في موضوع 8.3 — الحصائل الطاقوية المقارنة، أي عبارة صحيحة حول «الأكسدة الجزئية»؟",
    "options": [
      "ترتبط بكمية المادة العضوية في مستوى غذائي",
      "تضمن تداول الطاقة داخل الخلية",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات.",
      "تحدث في التخمر وتبقي طاقة في النواتج"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الأكسدة الجزئية يرتبط هنا بـ: تحدث في التخمر وتبقي طاقة في النواتج.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 333,
    "unitId": 8,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «O2» ضمن 8.3 — الحصائل الطاقوية المقارنة.",
    "options": [
      "تدور بين الكائنات والوسط خلاف الطاقة التي تتدفق",
      "وجوده يسمح بإعادة أكسدة NADH عبر السلسلة",
      "يتجدد أساساً بفضل التركيب الضوئي",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور."
    ],
    "correctAnswerIndex": 1,
    "explanation": "O2 يرتبط هنا بـ: وجوده يسمح بإعادة أكسدة NADH عبر السلسلة.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 334,
    "unitId": 8,
    "questionText": "في محور 8.3 — الحصائل الطاقوية المقارنة، أي إكمال صحيح: «الحصيلة القديمة 36-38» ← ________؟",
    "options": [
      "يعطي صافي 2 ATP",
      "تحدث في التخمر وتبقي طاقة في النواتج",
      "يدل على زيادة غير محدودة في السرعة دون إشباع.",
      "تذكر في بعض البرامج كمردودية قصوى تقريبية"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الحصيلة القديمة 36-38 يرتبط هنا بـ: تذكر في بعض البرامج كمردودية قصوى تقريبية.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg"
  },
  {
    "id": 335,
    "unitId": 8,
    "questionText": "عند مراجعة 8.3 — الحصائل الطاقوية المقارنة، ما المعلومة التي لا يجب الخلط فيها حول «الحصيلة العملية»؟",
    "options": [
      "قد تختلف حسب نوع الخلية والمسار",
      "مثال لعملية تستهلك ATP",
      "ينجز التنفس فقط غالباً",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الحصيلة العملية يرتبط هنا بـ: قد تختلف حسب نوع الخلية والمسار.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 336,
    "unitId": 8,
    "questionText": "ضمن 8.3 — الحصائل الطاقوية المقارنة، ما الخيار الموافق للبرنامج عندما نذكر «4 | الحصيلة الطاقوية»؟",
    "options": [
      "المقارنة الشاملة",
      "يدخلون الطاقة إلى النظام عبر التركيب الضوئي",
      "التركيب الضوئي والتنفس الخلوي",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 0,
    "explanation": "4 | الحصيلة الطاقوية يرتبط هنا بـ: المقارنة الشاملة.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 337,
    "unitId": 8,
    "questionText": "في 8.4 — تدفق الطاقة في النظام البيئي، أي علاقة صحيحة يبيّنها مصطلح «تدفق الطاقة»؟",
    "options": [
      "يرفعان مردودية الأكسدة الهوائية",
      "تضمن تداول الطاقة داخل الخلية",
      "انتقال الطاقة من مستوى غذائي إلى آخر",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 2,
    "explanation": "تدفق الطاقة يرتبط هنا بـ: انتقال الطاقة من مستوى غذائي إلى آخر.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 338,
    "unitId": 8,
    "questionText": "في سؤال بكالوريا قصير حول 8.4 — تدفق الطاقة في النظام البيئي، بماذا نربط «المنتجون»؟",
    "options": [
      "ينتج مادة عضوية وO2",
      "ربط تفاعل محرر للطاقة بتفاعل مستهلك لها",
      "يدخلون الطاقة إلى النظام عبر التركيب الضوئي",
      "ينتج مباشرة أجساماً مضادة في كل الحالات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "المنتجون يرتبط هنا بـ: يدخلون الطاقة إلى النظام عبر التركيب الضوئي.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 339,
    "unitId": 8,
    "questionText": "في محور 8.4 — تدفق الطاقة في النظام البيئي، أي عبارة تساعد على تمييز «المستهلكون» عن المفاهيم القريبة؟",
    "options": [
      "ينجز التركيب الضوئي والتنفس معاً",
      "قد تختلف حسب نوع الخلية والمسار",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا.",
      "يحصلون على الطاقة بأكل المادة العضوية"
    ],
    "correctAnswerIndex": 3,
    "explanation": "المستهلكون يرتبط هنا بـ: يحصلون على الطاقة بأكل المادة العضوية.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 340,
    "unitId": 8,
    "questionText": "إذا طُلب تفسير «المحللات» ضمن 8.4 — تدفق الطاقة في النظام البيئي، فأي جواب هو الأدق؟",
    "options": [
      "تعيد تدوير المادة وتستعمل الطاقة المتبقية",
      "التركيب الضوئي والتنفس الخلوي",
      "تضمن تداول الطاقة داخل الخلية",
      "ATP يخزن الطاقة لسنوات ولا يتجدد بسرعة."
    ],
    "correctAnswerIndex": 0,
    "explanation": "المحللات يرتبط هنا بـ: تعيد تدوير المادة وتستعمل الطاقة المتبقية.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 341,
    "unitId": 8,
    "questionText": "في محور 8.4 — تدفق الطاقة في النظام البيئي، أي وصف دقيق لـ«ضياع الحرارة»؟",
    "options": [
      "المقارنة الشاملة",
      "أكثر مردودية من التخمر من حيث ATP",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة.",
      "يجعل الطاقة المتاحة تنقص بين المستويات"
    ],
    "correctAnswerIndex": 3,
    "explanation": "ضياع الحرارة يرتبط هنا بـ: يجعل الطاقة المتاحة تنقص بين المستويات.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 342,
    "unitId": 8,
    "questionText": "في موضوع 8.4 — تدفق الطاقة في النظام البيئي، أي عبارة صحيحة حول «المردودية البيئية»؟",
    "options": [
      "تعيد تدوير المادة وتستعمل الطاقة المتبقية",
      "يضيق نحو المستويات العليا",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية.",
      "غالباً منخفضة بين مستوى وآخر"
    ],
    "correctAnswerIndex": 3,
    "explanation": "المردودية البيئية يرتبط هنا بـ: غالباً منخفضة بين مستوى وآخر.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 343,
    "unitId": 8,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «هرم الطاقة» ضمن 8.4 — تدفق الطاقة في النظام البيئي.",
    "options": [
      "تحول الغلوكوز إلى CO2 وH2O",
      "تدور بين الكائنات والوسط خلاف الطاقة التي تتدفق",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية.",
      "يضيق نحو المستويات العليا"
    ],
    "correctAnswerIndex": 3,
    "explanation": "هرم الطاقة يرتبط هنا بـ: يضيق نحو المستويات العليا.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 344,
    "unitId": 8,
    "questionText": "في محور 8.4 — تدفق الطاقة في النظام البيئي، أي إكمال صحيح: «المادة» ← ________؟",
    "options": [
      "تمثل انتقال المادة والطاقة بين كائنات",
      "مثال لعملية تستهلك ATP",
      "تدور بين الكائنات والوسط خلاف الطاقة التي تتدفق",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة."
    ],
    "correctAnswerIndex": 2,
    "explanation": "المادة يرتبط هنا بـ: تدور بين الكائنات والوسط خلاف الطاقة التي تتدفق.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 345,
    "unitId": 8,
    "questionText": "عند مراجعة 8.4 — تدفق الطاقة في النظام البيئي، ما المعلومة التي لا يجب الخلط فيها حول «السلسلة الغذائية»؟",
    "options": [
      "ربط تفاعل محرر للطاقة بتفاعل مستهلك لها",
      "جزيء طاقوي مباشر الاستعمال في الخلية",
      "يعني توقف كل التحولات الطاقوية في الخلية.",
      "تمثل انتقال المادة والطاقة بين كائنات"
    ],
    "correctAnswerIndex": 3,
    "explanation": "السلسلة الغذائية يرتبط هنا بـ: تمثل انتقال المادة والطاقة بين كائنات.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 346,
    "unitId": 8,
    "questionText": "ضمن 8.4 — تدفق الطاقة في النظام البيئي، ما الخيار الموافق للبرنامج عندما نذكر «الكتلة الحيوية»؟",
    "options": [
      "ترتبط بكمية المادة العضوية في مستوى غذائي",
      "جزيء طاقوي مباشر الاستعمال في الخلية",
      "وجوده يسمح بإعادة أكسدة NADH عبر السلسلة",
      "ATP يخزن الطاقة لسنوات ولا يتجدد بسرعة."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الكتلة الحيوية يرتبط هنا بـ: ترتبط بكمية المادة العضوية في مستوى غذائي.",
    "diagramUrl": "/assets/images/schemas/domaine2_energie/schema_12_bilan_energetique.svg"
  },
  {
    "id": 347,
    "unitId": 9,
    "questionText": "في 9.1 — الغلاف الصخري، الأستينوسفير والصفائح، أي علاقة صحيحة يبيّنها مصطلح «الغلاف الصخري»؟",
    "options": [
      "تسجل اتجاه الحقل المغناطيسي وقت تبرد الصخور",
      "تكشف اتجاه حركة الصفيحة فوق مصدر ثابت نسبياً",
      "غلاف صلب من القشرة والبرنس العلوي ومجزأ إلى صفائح",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الغلاف الصخري يرتبط هنا بـ: غلاف صلب من القشرة والبرنس العلوي ومجزأ إلى صفائح.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 348,
    "unitId": 9,
    "questionText": "في سؤال بكالوريا قصير حول 9.1 — الغلاف الصخري، الأستينوسفير والصفائح، بماذا نربط «الأستينوسفير»؟",
    "options": [
      "جزء لدن من البرنس العلوي يسمح بحركة الصفائح",
      "مثال حد انزلاقي",
      "مرتبطة غالباً بالغوص",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الأستينوسفير يرتبط هنا بـ: جزء لدن من البرنس العلوي يسمح بحركة الصفائح.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 349,
    "unitId": 9,
    "questionText": "في محور 9.1 — الغلاف الصخري، الأستينوسفير والصفائح، أي عبارة تساعد على تمييز «الصفيحة التكتونية» عن المفاهيم القريبة؟",
    "options": [
      "قطعة صلبة من الغلاف الصخري تتحرك ببطء",
      "يزداد سمكاً وكثافة بابتعاده عن الظهرة",
      "من أدلة الانجراف القاري القديمة",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الصفيحة التكتونية يرتبط هنا بـ: قطعة صلبة من الغلاف الصخري تتحرك ببطء.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 350,
    "unitId": 9,
    "questionText": "إذا طُلب تفسير «القشرة المحيطية» ضمن 9.1 — الغلاف الصخري، الأستينوسفير والصفائح، فأي جواب هو الأدق؟",
    "options": [
      "تتركز عندها الزلازل والبراكين والتشوهات",
      "أكثف وأرق من القشرة القارية",
      "مصدرها حرارة بدئية ونشاط إشعاعي داخلي",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 1,
    "explanation": "القشرة المحيطية يرتبط هنا بـ: أكثف وأرق من القشرة القارية.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 351,
    "unitId": 9,
    "questionText": "في محور 9.1 — الغلاف الصخري، الأستينوسفير والصفائح، أي وصف دقيق لـ«القشرة القارية»؟",
    "options": [
      "حركات بطيئة في البرنس بسبب فروق الحرارة والكثافة",
      "تكشف حدود الصفائح",
      "حدود الانزلاق تبني دائماً ليثوسفير محيطية جديدة.",
      "أقل كثافة وأكثر سماكة غالباً"
    ],
    "correctAnswerIndex": 3,
    "explanation": "القشرة القارية يرتبط هنا بـ: أقل كثافة وأكثر سماكة غالباً.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 352,
    "unitId": 9,
    "questionText": "في موضوع 9.1 — الغلاف الصخري، الأستينوسفير والصفائح، أي عبارة صحيحة حول «حدود الصفائح»؟",
    "options": [
      "تتركز عندها الزلازل والبراكين والتشوهات",
      "أكثف وأرق من القشرة القارية",
      "من أدلة الانجراف القاري القديمة",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 0,
    "explanation": "حدود الصفائح يرتبط هنا بـ: تتركز عندها الزلازل والبراكين والتشوهات.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 353,
    "unitId": 9,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «الحركة السنوية» ضمن 9.1 — الغلاف الصخري، الأستينوسفير والصفائح.",
    "options": [
      "ينقل حرارة ومادة في البرنس ببطء شديد",
      "تقاس غالباً بالسنتيمترات في السنة",
      "مثال حد انزلاقي",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الحركة السنوية يرتبط هنا بـ: تقاس غالباً بالسنتيمترات في السنة.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 354,
    "unitId": 9,
    "questionText": "في محور 9.1 — الغلاف الصخري، الأستينوسفير والصفائح، أي إكمال صحيح: «الغلاف الصخري المحيطي» ← ________؟",
    "options": [
      "تكشف اتجاه حركة الصفيحة فوق مصدر ثابت نسبياً",
      "مرتبطة غالباً بالغوص",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات.",
      "يزداد سمكاً وكثافة بابتعاده عن الظهرة"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الغلاف الصخري المحيطي يرتبط هنا بـ: يزداد سمكاً وكثافة بابتعاده عن الظهرة.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 355,
    "unitId": 9,
    "questionText": "عند مراجعة 9.1 — الغلاف الصخري، الأستينوسفير والصفائح، ما المعلومة التي لا يجب الخلط فيها حول «البرنس العلوي»؟",
    "options": [
      "تقاس غالباً بالسنتيمترات في السنة",
      "تسجل اتجاه الحقل المغناطيسي وقت تبرد الصخور",
      "يشمل جزءاً صلباً وآخر لدناً",
      "يتم فقط في غياب الماء والأيونات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "البرنس العلوي يرتبط هنا بـ: يشمل جزءاً صلباً وآخر لدناً.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 356,
    "unitId": 9,
    "questionText": "ضمن 9.1 — الغلاف الصخري، الأستينوسفير والصفائح، ما الخيار الموافق للبرنامج عندما نذكر «الصفائح الكبرى»؟",
    "options": [
      "مرتفع عند الظهرات ومنخفض نسبياً عند الخنادق",
      "ينتج حرارة من تفكك عناصر مثل اليورانيوم",
      "مثل الإفريقية والأوراسية والهادئة",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الصفائح الكبرى يرتبط هنا بـ: مثل الإفريقية والأوراسية والهادئة.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 357,
    "unitId": 9,
    "questionText": "في 9.1 — الغلاف الصخري، الأستينوسفير والصفائح، أي علاقة صحيحة يبيّنها مصطلح «خريطة الزلازل»؟",
    "options": [
      "تكشف حدود الصفائح",
      "يشمل جزءاً صلباً وآخر لدناً",
      "يزداد بالابتعاد عن محور الظهرة",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة."
    ],
    "correctAnswerIndex": 0,
    "explanation": "خريطة الزلازل يرتبط هنا بـ: تكشف حدود الصفائح.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 358,
    "unitId": 9,
    "questionText": "في سؤال بكالوريا قصير حول 9.2 — حدود الصفائح: تباعد، تقارب، انزلاق، بماذا نربط «حد التباعد»؟",
    "options": [
      "تبتعد فيه صفيحتان وتتكون ليثوسفير جديدة",
      "يزداد سمكاً وكثافة بابتعاده عن الظهرة",
      "أكدت سرعات واتجاهات الصفائح الحالية",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 0,
    "explanation": "حد التباعد يرتبط هنا بـ: تبتعد فيه صفيحتان وتتكون ليثوسفير جديدة.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_16_subduction.svg"
  },
  {
    "id": 359,
    "unitId": 9,
    "questionText": "في محور 9.2 — حدود الصفائح: تباعد، تقارب، انزلاق، أي عبارة تساعد على تمييز «الظهرة» عن المفاهيم القريبة؟",
    "options": [
      "أكدت سرعات واتجاهات الصفائح الحالية",
      "تقارب قارتين بعد غلق محيط",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور.",
      "مثال حد تباعدي محيطي"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الظهرة يرتبط هنا بـ: مثال حد تباعدي محيطي.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_16_subduction.svg"
  },
  {
    "id": 360,
    "unitId": 9,
    "questionText": "إذا طُلب تفسير «الصدع القاري» ضمن 9.2 — حدود الصفائح: تباعد، تقارب، انزلاق، فأي جواب هو الأدق؟",
    "options": [
      "بداية تباعد داخل قارة",
      "تهبط لأنها أكثر كثافة نسبياً",
      "مصدرها حرارة بدئية ونشاط إشعاعي داخلي",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الصدع القاري يرتبط هنا بـ: بداية تباعد داخل قارة.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_16_subduction.svg"
  },
  {
    "id": 361,
    "unitId": 9,
    "questionText": "في محور 9.2 — حدود الصفائح: تباعد، تقارب، انزلاق، أي وصف دقيق لـ«حد التقارب»؟",
    "options": [
      "مثال حد تباعدي محيطي",
      "تتقارب فيه صفائح وقد يحدث غوص أو تصادم",
      "أكدت سرعات واتجاهات الصفائح الحالية",
      "GPS لا يقيس حركة الصفائح الحالية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "حد التقارب يرتبط هنا بـ: تتقارب فيه صفائح وقد يحدث غوص أو تصادم.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_16_subduction.svg"
  },
  {
    "id": 362,
    "unitId": 9,
    "questionText": "في موضوع 9.2 — حدود الصفائح: تباعد، تقارب، انزلاق، أي عبارة صحيحة حول «الغوص»؟",
    "options": [
      "مثال حد انزلاقي",
      "تكشف اتجاه حركة الصفيحة فوق مصدر ثابت نسبياً",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات.",
      "انغراز صفيحة محيطية كثيفة تحت أخرى"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الغوص يرتبط هنا بـ: انغراز صفيحة محيطية كثيفة تحت أخرى.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_16_subduction.svg"
  },
  {
    "id": 363,
    "unitId": 9,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «التصادم» ضمن 9.2 — حدود الصفائح: تباعد، تقارب، انزلاق.",
    "options": [
      "تقارب قارتين بعد غلق محيط",
      "تكشف اتجاه حركة الصفيحة فوق مصدر ثابت نسبياً",
      "تكشف حدود الصفائح",
      "يعني توقف كل التحولات الطاقوية في الخلية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "التصادم يرتبط هنا بـ: تقارب قارتين بعد غلق محيط.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_16_subduction.svg"
  },
  {
    "id": 364,
    "unitId": 9,
    "questionText": "في محور 9.2 — حدود الصفائح: تباعد، تقارب، انزلاق، أي إكمال صحيح: «حد الانزلاق» ← ________؟",
    "options": [
      "تقاس غالباً بالسنتيمترات في السنة",
      "ينتج حرارة من تفكك عناصر مثل اليورانيوم",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية.",
      "تنزلق فيه صفيحتان أفقياً دون بناء أو هدم كبير"
    ],
    "correctAnswerIndex": 3,
    "explanation": "حد الانزلاق يرتبط هنا بـ: تنزلق فيه صفيحتان أفقياً دون بناء أو هدم كبير.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_16_subduction.svg"
  },
  {
    "id": 365,
    "unitId": 9,
    "questionText": "عند مراجعة 9.2 — حدود الصفائح: تباعد، تقارب، انزلاق، ما المعلومة التي لا يجب الخلط فيها حول «فالق سان أندرياس»؟",
    "options": [
      "أقل كثافة وأكثر سماكة غالباً",
      "تصعد لأنها أقل كثافة نسبياً",
      "الأستينوسفير قشرة محيطية صلبة تماماً.",
      "مثال حد انزلاقي"
    ],
    "correctAnswerIndex": 3,
    "explanation": "فالق سان أندرياس يرتبط هنا بـ: مثال حد انزلاقي.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_16_subduction.svg"
  },
  {
    "id": 366,
    "unitId": 9,
    "questionText": "ضمن 9.2 — حدود الصفائح: تباعد، تقارب، انزلاق، ما الخيار الموافق للبرنامج عندما نذكر «البراكين الانفجارية»؟",
    "options": [
      "توجد عند كل أنواع الحدود",
      "مرتبطة غالباً بالغوص",
      "قطعة صلبة من الغلاف الصخري تتحرك ببطء",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "البراكين الانفجارية يرتبط هنا بـ: مرتبطة غالباً بالغوص.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_16_subduction.svg"
  },
  {
    "id": 367,
    "unitId": 9,
    "questionText": "في 9.2 — حدود الصفائح: تباعد، تقارب، انزلاق، أي علاقة صحيحة يبيّنها مصطلح «الزلازل الضحلة»؟",
    "options": [
      "تسجل اتجاه الحقل المغناطيسي وقت تبرد الصخور",
      "جزء لدن من البرنس العلوي يسمح بحركة الصفائح",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية.",
      "توجد عند كل أنواع الحدود"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الزلازل الضحلة يرتبط هنا بـ: توجد عند كل أنواع الحدود.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_16_subduction.svg"
  },
  {
    "id": 368,
    "unitId": 9,
    "questionText": "في سؤال بكالوريا قصير حول 9.2 — حدود الصفائح: تباعد، تقارب، انزلاق، بماذا نربط «الخنادق»؟",
    "options": [
      "قوة مهمة تجر الصفيحة عند الغوص",
      "غلاف صلب من القشرة والبرنس العلوي ومجزأ إلى صفائح",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة.",
      "مرتبطة بمناطق الغوص"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الخنادق يرتبط هنا بـ: مرتبطة بمناطق الغوص.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_16_subduction.svg"
  },
  {
    "id": 369,
    "unitId": 9,
    "questionText": "في محور 9.3 — أدلة حركة الصفائح، أي عبارة تساعد على تمييز «الأشرطة المغناطيسية» عن المفاهيم القريبة؟",
    "options": [
      "حركات بطيئة في البرنس بسبب فروق الحرارة والكثافة",
      "انغراز صفيحة محيطية كثيفة تحت أخرى",
      "دليل على توسع قاع المحيط حول الظهرات",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الأشرطة المغناطيسية يرتبط هنا بـ: دليل على توسع قاع المحيط حول الظهرات.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 370,
    "unitId": 9,
    "questionText": "إذا طُلب تفسير «عمر الصخور المحيطية» ضمن 9.3 — أدلة حركة الصفائح، فأي جواب هو الأدق؟",
    "options": [
      "انغراز صفيحة محيطية كثيفة تحت أخرى",
      "يزداد بالابتعاد عن محور الظهرة",
      "أقل كثافة وأكثر سماكة غالباً",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "عمر الصخور المحيطية يرتبط هنا بـ: يزداد بالابتعاد عن محور الظهرة.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 371,
    "unitId": 9,
    "questionText": "في محور 9.3 — أدلة حركة الصفائح، أي وصف دقيق لـ«GPS»؟",
    "options": [
      "يقيس الحركة الحالية للصفائح مباشرة",
      "قوة مهمة تجر الصفيحة عند الغوص",
      "تتقارب فيه صفائح وقد يحدث غوص أو تصادم",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 0,
    "explanation": "GPS يرتبط هنا بـ: يقيس الحركة الحالية للصفائح مباشرة.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 372,
    "unitId": 9,
    "questionText": "في موضوع 9.3 — أدلة حركة الصفائح، أي عبارة صحيحة حول «توزيع الزلازل»؟",
    "options": [
      "تسجل اتجاه الحقل المغناطيسي وقت تبرد الصخور",
      "يرسم حدود الصفائح النشطة",
      "مرتفع عند الظهرات ومنخفض نسبياً عند الخنادق",
      "حدود الانزلاق تبني دائماً ليثوسفير محيطية جديدة."
    ],
    "correctAnswerIndex": 1,
    "explanation": "توزيع الزلازل يرتبط هنا بـ: يرسم حدود الصفائح النشطة.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 373,
    "unitId": 9,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «تدفق الحرارة» ضمن 9.3 — أدلة حركة الصفائح.",
    "options": [
      "دليل على توسع قاع المحيط حول الظهرات",
      "قوة مهمة تجر الصفيحة عند الغوص",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا.",
      "مرتفع عند الظهرات ومنخفض نسبياً عند الخنادق"
    ],
    "correctAnswerIndex": 3,
    "explanation": "تدفق الحرارة يرتبط هنا بـ: مرتفع عند الظهرات ومنخفض نسبياً عند الخنادق.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 374,
    "unitId": 9,
    "questionText": "في محور 9.3 — أدلة حركة الصفائح، أي إكمال صحيح: «تشابه السواحل» ← ________؟",
    "options": [
      "يشمل جزءاً صلباً وآخر لدناً",
      "تدعم اتصال قارات في الماضي",
      "حدود الانزلاق تبني دائماً ليثوسفير محيطية جديدة.",
      "من أدلة الانجراف القاري القديمة"
    ],
    "correctAnswerIndex": 3,
    "explanation": "تشابه السواحل يرتبط هنا بـ: من أدلة الانجراف القاري القديمة.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 375,
    "unitId": 9,
    "questionText": "عند مراجعة 9.3 — أدلة حركة الصفائح، ما المعلومة التي لا يجب الخلط فيها حول «الأحافير المتشابهة»؟",
    "options": [
      "مثال حد تباعدي محيطي",
      "انغراز صفيحة محيطية كثيفة تحت أخرى",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس.",
      "تدعم اتصال قارات في الماضي"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الأحافير المتشابهة يرتبط هنا بـ: تدعم اتصال قارات في الماضي.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 376,
    "unitId": 9,
    "questionText": "ضمن 9.3 — أدلة حركة الصفائح، ما الخيار الموافق للبرنامج عندما نذكر «مسارات النقاط الساخنة»؟",
    "options": [
      "يقيس الحركة الحالية للصفائح مباشرة",
      "تكشف اتجاه حركة الصفيحة فوق مصدر ثابت نسبياً",
      "نتيجة تفاعل قوى عديدة وليس تياراً واحداً فقط",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 1,
    "explanation": "مسارات النقاط الساخنة يرتبط هنا بـ: تكشف اتجاه حركة الصفيحة فوق مصدر ثابت نسبياً.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 377,
    "unitId": 9,
    "questionText": "في 9.3 — أدلة حركة الصفائح، أي علاقة صحيحة يبيّنها مصطلح «تماثل الأشرطة»؟",
    "options": [
      "على جانبي الظهرة يدل على إنتاج قشرة جديدة",
      "قوة ناتجة عن ارتفاع محور الظهرة وانزلاق الصفائح",
      "تصعد لأنها أقل كثافة نسبياً",
      "يعني توقف كل التحولات الطاقوية في الخلية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "تماثل الأشرطة يرتبط هنا بـ: على جانبي الظهرة يدل على إنتاج قشرة جديدة.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 378,
    "unitId": 9,
    "questionText": "في سؤال بكالوريا قصير حول 9.3 — أدلة حركة الصفائح، بماذا نربط «المغناطيسية القديمة»؟",
    "options": [
      "جزء لدن من البرنس العلوي يسمح بحركة الصفائح",
      "تسجل اتجاه الحقل المغناطيسي وقت تبرد الصخور",
      "ينتج حرارة من تفكك عناصر مثل اليورانيوم",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 1,
    "explanation": "المغناطيسية القديمة يرتبط هنا بـ: تسجل اتجاه الحقل المغناطيسي وقت تبرد الصخور.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 379,
    "unitId": 9,
    "questionText": "في محور 9.3 — أدلة حركة الصفائح، أي عبارة تساعد على تمييز «القياسات الفضائية» عن المفاهيم القريبة؟",
    "options": [
      "أقل كثافة وأكثر سماكة غالباً",
      "مرتفع عند الظهرات ومنخفض نسبياً عند الخنادق",
      "أكدت سرعات واتجاهات الصفائح الحالية",
      "ينتج مباشرة أجساماً مضادة في كل الحالات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "القياسات الفضائية يرتبط هنا بـ: أكدت سرعات واتجاهات الصفائح الحالية.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 380,
    "unitId": 9,
    "questionText": "إذا طُلب تفسير «الطاقة الداخلية» ضمن 9.4 — الطاقة الداخلية والتيارات الحملية، فأي جواب هو الأدق؟",
    "options": [
      "حركات بطيئة في البرنس بسبب فروق الحرارة والكثافة",
      "مرتفع عند الظهرات ومنخفض نسبياً عند الخنادق",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً.",
      "مصدرها حرارة بدئية ونشاط إشعاعي داخلي"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الطاقة الداخلية يرتبط هنا بـ: مصدرها حرارة بدئية ونشاط إشعاعي داخلي.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 381,
    "unitId": 9,
    "questionText": "في محور 9.4 — الطاقة الداخلية والتيارات الحملية، أي وصف دقيق لـ«التيارات الحملية»؟",
    "options": [
      "على جانبي الظهرة يدل على إنتاج قشرة جديدة",
      "يقيس الحركة الحالية للصفائح مباشرة",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا.",
      "حركات بطيئة في البرنس بسبب فروق الحرارة والكثافة"
    ],
    "correctAnswerIndex": 3,
    "explanation": "التيارات الحملية يرتبط هنا بـ: حركات بطيئة في البرنس بسبب فروق الحرارة والكثافة.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 382,
    "unitId": 9,
    "questionText": "في موضوع 9.4 — الطاقة الداخلية والتيارات الحملية، أي عبارة صحيحة حول «المادة الساخنة»؟",
    "options": [
      "تصعد لأنها أقل كثافة نسبياً",
      "يعكس انتقال الحرارة من باطن الأرض إلى السطح",
      "تدعم اتصال قارات في الماضي",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 0,
    "explanation": "المادة الساخنة يرتبط هنا بـ: تصعد لأنها أقل كثافة نسبياً.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 383,
    "unitId": 9,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «المادة الباردة» ضمن 9.4 — الطاقة الداخلية والتيارات الحملية.",
    "options": [
      "تكشف اتجاه حركة الصفيحة فوق مصدر ثابت نسبياً",
      "تبتعد فيه صفيحتان وتتكون ليثوسفير جديدة",
      "GPS لا يقيس حركة الصفائح الحالية.",
      "تهبط لأنها أكثر كثافة نسبياً"
    ],
    "correctAnswerIndex": 3,
    "explanation": "المادة الباردة يرتبط هنا بـ: تهبط لأنها أكثر كثافة نسبياً.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 384,
    "unitId": 9,
    "questionText": "في محور 9.4 — الطاقة الداخلية والتيارات الحملية، أي إكمال صحيح: «سحب اللوح الغائص» ← ________؟",
    "options": [
      "قوة مهمة تجر الصفيحة عند الغوص",
      "يزداد بالابتعاد عن محور الظهرة",
      "مثل الإفريقية والأوراسية والهادئة",
      "GPS لا يقيس حركة الصفائح الحالية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "سحب اللوح الغائص يرتبط هنا بـ: قوة مهمة تجر الصفيحة عند الغوص.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 385,
    "unitId": 9,
    "questionText": "عند مراجعة 9.4 — الطاقة الداخلية والتيارات الحملية، ما المعلومة التي لا يجب الخلط فيها حول «دفع الظهرة»؟",
    "options": [
      "يزداد سمكاً وكثافة بابتعاده عن الظهرة",
      "قوة ناتجة عن ارتفاع محور الظهرة وانزلاق الصفائح",
      "تتقارب فيه صفائح وقد يحدث غوص أو تصادم",
      "يتم فقط في غياب الماء والأيونات."
    ],
    "correctAnswerIndex": 1,
    "explanation": "دفع الظهرة يرتبط هنا بـ: قوة ناتجة عن ارتفاع محور الظهرة وانزلاق الصفائح.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 386,
    "unitId": 9,
    "questionText": "ضمن 9.4 — الطاقة الداخلية والتيارات الحملية، ما الخيار الموافق للبرنامج عندما نذكر «التدفق الحراري»؟",
    "options": [
      "يعكس انتقال الحرارة من باطن الأرض إلى السطح",
      "أكثف وأرق من القشرة القارية",
      "تنزلق فيه صفيحتان أفقياً دون بناء أو هدم كبير",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 0,
    "explanation": "التدفق الحراري يرتبط هنا بـ: يعكس انتقال الحرارة من باطن الأرض إلى السطح.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 387,
    "unitId": 9,
    "questionText": "في 9.4 — الطاقة الداخلية والتيارات الحملية، أي علاقة صحيحة يبيّنها مصطلح «الحمل الحراري»؟",
    "options": [
      "قوة ناتجة عن ارتفاع محور الظهرة وانزلاق الصفائح",
      "نتيجة تفاعل قوى عديدة وليس تياراً واحداً فقط",
      "ينقل حرارة ومادة في البرنس ببطء شديد",
      "حدود الانزلاق تبني دائماً ليثوسفير محيطية جديدة."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الحمل الحراري يرتبط هنا بـ: ينقل حرارة ومادة في البرنس ببطء شديد.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 388,
    "unitId": 9,
    "questionText": "في سؤال بكالوريا قصير حول 9.4 — الطاقة الداخلية والتيارات الحملية، بماذا نربط «حركة الصفائح»؟",
    "options": [
      "نتيجة تفاعل قوى عديدة وليس تياراً واحداً فقط",
      "انغراز صفيحة محيطية كثيفة تحت أخرى",
      "يشمل جزءاً صلباً وآخر لدناً",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 0,
    "explanation": "حركة الصفائح يرتبط هنا بـ: نتيجة تفاعل قوى عديدة وليس تياراً واحداً فقط.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 389,
    "unitId": 9,
    "questionText": "في محور 9.4 — الطاقة الداخلية والتيارات الحملية، أي عبارة تساعد على تمييز «النشاط الإشعاعي» عن المفاهيم القريبة؟",
    "options": [
      "تكشف حدود الصفائح",
      "تسجل اتجاه الحقل المغناطيسي وقت تبرد الصخور",
      "ينتج حرارة من تفكك عناصر مثل اليورانيوم",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور."
    ],
    "correctAnswerIndex": 2,
    "explanation": "النشاط الإشعاعي يرتبط هنا بـ: ينتج حرارة من تفكك عناصر مثل اليورانيوم.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 390,
    "unitId": 10,
    "questionText": "إذا طُلب تفسير «الزلزال» ضمن 10.1 — الزلازل والموجات P وS وL، فأي جواب هو الأدق؟",
    "options": [
      "ينتج عن حركات اللب الخارجي المعدني السائل",
      "اهتزاز مفاجئ ناتج عن تحرير طاقة على فالق",
      "سائل غني بالحديد والنيكل",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الزلزال يرتبط هنا بـ: اهتزاز مفاجئ ناتج عن تحرير طاقة على فالق.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 391,
    "unitId": 10,
    "questionText": "في محور 10.1 — الزلازل والموجات P وS وL، أي وصف دقيق لـ«البؤرة»؟",
    "options": [
      "ترتبط بشدة الاهتزاز المسجل",
      "موجة عرضية لا تنتشر في السوائل",
      "الموجات S تنتشر في السوائل أسرع من P.",
      "نقطة انطلاق الموجات في العمق"
    ],
    "correctAnswerIndex": 3,
    "explanation": "البؤرة يرتبط هنا بـ: نقطة انطلاق الموجات في العمق.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 392,
    "unitId": 10,
    "questionText": "في موضوع 10.1 — الزلازل والموجات P وS وL، أي عبارة صحيحة حول «المركز السطحي»؟",
    "options": [
      "صلب غني بالحديد والنيكل",
      "إسقاط البؤرة على سطح الأرض",
      "يفصل اللب الخارجي عن الداخلي عند نحو 5100 كم",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 1,
    "explanation": "المركز السطحي يرتبط هنا بـ: إسقاط البؤرة على سطح الأرض.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 393,
    "unitId": 10,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «الموجة P» ضمن 10.1 — الزلازل والموجات P وS وL.",
    "options": [
      "تغير اتجاه وسرعة الموجة عند تغير الوسط",
      "لدن جزئياً وليس سائلاً كلياً",
      "سطح موهو يفصل اللب الخارجي عن الداخلي.",
      "موجة طولية سريعة تنتشر في الصلب والسائل"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الموجة P يرتبط هنا بـ: موجة طولية سريعة تنتشر في الصلب والسائل.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 394,
    "unitId": 10,
    "questionText": "في محور 10.1 — الزلازل والموجات P وS وL، أي إكمال صحيح: «الموجة S» ← ________؟",
    "options": [
      "تزداد مع العمق لكنها لا تحدد الحالة وحدها",
      "تصل أخيراً غالباً وتسبب أضراراً كبيرة",
      "موجة عرضية لا تنتشر في السوائل",
      "ينتج مباشرة أجساماً مضادة في كل الحالات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الموجة S يرتبط هنا بـ: موجة عرضية لا تنتشر في السوائل.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 395,
    "unitId": 10,
    "questionText": "عند مراجعة 10.1 — الزلازل والموجات P وS وL، ما المعلومة التي لا يجب الخلط فيها حول «الموجات L»؟",
    "options": [
      "يفصل البرنس عن اللب الخارجي عند نحو 2900 كم",
      "تصل أخيراً غالباً وتسبب أضراراً كبيرة",
      "سطحية وبطيئة وكبيرة السعة ومدمرة",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الموجات L يرتبط هنا بـ: سطحية وبطيئة وكبيرة السعة ومدمرة.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 396,
    "unitId": 10,
    "questionText": "ضمن 10.1 — الزلازل والموجات P وS وL، ما الخيار الموافق للبرنامج عندما نذكر «السيزموغرام»؟",
    "options": [
      "غيابها دليل قوي على وسط سائل",
      "غني بالبيريدوتيت والأوليفين والبيروكسين",
      "يعني توقف كل التحولات الطاقوية في الخلية.",
      "تسجيل وصول الموجات الزلزالية"
    ],
    "correctAnswerIndex": 3,
    "explanation": "السيزموغرام يرتبط هنا بـ: تسجيل وصول الموجات الزلزالية.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 397,
    "unitId": 10,
    "questionText": "في 10.1 — الزلازل والموجات P وS وL، أي علاقة صحيحة يبيّنها مصطلح «فرق وصول P وS»؟",
    "options": [
      "يساعد على حساب بعد المحطة عن البؤرة",
      "نقطة انطلاق الموجات في العمق",
      "تسمح باستنتاج بنية الأرض الداخلية",
      "الموجات S تنتشر في السوائل أسرع من P."
    ],
    "correctAnswerIndex": 0,
    "explanation": "فرق وصول P وS يرتبط هنا بـ: يساعد على حساب بعد المحطة عن البؤرة.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 398,
    "unitId": 10,
    "questionText": "في سؤال بكالوريا قصير حول 10.1 — الزلازل والموجات P وS وL، بماذا نربط «سرعة P»؟",
    "options": [
      "أكبر من سرعة S لذلك تصل أولاً",
      "انتقال إلى وسط غني بالحديد والنيكل",
      "يدل على تغير الكثافة أو الصلابة أو التركيب",
      "سطح موهو يفصل اللب الخارجي عن الداخلي."
    ],
    "correctAnswerIndex": 0,
    "explanation": "سرعة P يرتبط هنا بـ: أكبر من سرعة S لذلك تصل أولاً.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 399,
    "unitId": 10,
    "questionText": "في محور 10.1 — الزلازل والموجات P وS وL، أي عبارة تساعد على تمييز «الموجات السطحية» عن المفاهيم القريبة؟",
    "options": [
      "تصل أخيراً غالباً وتسبب أضراراً كبيرة",
      "حد يحدث عنده تغير مفاجئ في خصائص الموجات",
      "أكبر من سرعة S لذلك تصل أولاً",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الموجات السطحية يرتبط هنا بـ: تصل أخيراً غالباً وتسبب أضراراً كبيرة.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 400,
    "unitId": 10,
    "questionText": "إذا طُلب تفسير «السعة» ضمن 10.1 — الزلازل والموجات P وS وL، فأي جواب هو الأدق؟",
    "options": [
      "غلاف صلب فوق الأستينوسفير",
      "ترتبط بشدة الاهتزاز المسجل",
      "يبقي اللب الداخلي صلباً رغم الحرارة العالية",
      "الكثافة تنقص دائماً كلما تعمقنا نحو المركز."
    ],
    "correctAnswerIndex": 1,
    "explanation": "السعة يرتبط هنا بـ: ترتبط بشدة الاهتزاز المسجل.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 401,
    "unitId": 10,
    "questionText": "في محور 10.1 — الزلازل والموجات P وS وL، أي وصف دقيق لـ«ثلاث محطات»؟",
    "options": [
      "تصل أخيراً غالباً وتسبب أضراراً كبيرة",
      "تكفي تقريباً لتحديد المركز السطحي بالتثليث",
      "تزداد عموماً نحو مركز الأرض",
      "يحدث دائماً داخل النواة ولا يرتبط بباقي العضيات."
    ],
    "correctAnswerIndex": 1,
    "explanation": "ثلاث محطات يرتبط هنا بـ: تكفي تقريباً لتحديد المركز السطحي بالتثليث.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 402,
    "unitId": 10,
    "questionText": "في موضوع 10.1 — الزلازل والموجات P وS وL، أي عبارة صحيحة حول «الفالق»؟",
    "options": [
      "كسر تتحرك على جانبيه الكتل الصخرية",
      "تنحرف عند عبور أوساط مختلفة",
      "يفصل اللب الخارجي عن الداخلي عند نحو 5100 كم",
      "يتم فقط في غياب الماء والأيونات."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الفالق يرتبط هنا بـ: كسر تتحرك على جانبيه الكتل الصخرية.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 403,
    "unitId": 10,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «الانكسار الزلزالي» ضمن 10.2 — انتشار الموجات ومناطق الظل.",
    "options": [
      "بازلتية وغابروية وأكثر كثافة",
      "يدل على تغير الكثافة أو الصلابة أو التركيب",
      "تغير اتجاه وسرعة الموجة عند تغير الوسط",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الانكسار الزلزالي يرتبط هنا بـ: تغير اتجاه وسرعة الموجة عند تغير الوسط.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 404,
    "unitId": 10,
    "questionText": "في محور 10.2 — انتشار الموجات ومناطق الظل، أي إكمال صحيح: «الانعكاس الزلزالي» ← ________؟",
    "options": [
      "تزداد مع العمق لكنها لا تحدد الحالة وحدها",
      "رجوع جزء من الموجة عند سطح فاصل",
      "منطقة لا تسجل فيها موجات معينة",
      "ينتج مباشرة أجساماً مضادة في كل الحالات."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الانعكاس الزلزالي يرتبط هنا بـ: رجوع جزء من الموجة عند سطح فاصل.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 405,
    "unitId": 10,
    "questionText": "عند مراجعة 10.2 — انتشار الموجات ومناطق الظل، ما المعلومة التي لا يجب الخلط فيها حول «منطقة الظل»؟",
    "options": [
      "عنده تتوقف S وتنخفض سرعة P فجأة",
      "منطقة لا تسجل فيها موجات معينة",
      "تكفي تقريباً لتحديد المركز السطحي بالتثليث",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور."
    ],
    "correctAnswerIndex": 1,
    "explanation": "منطقة الظل يرتبط هنا بـ: منطقة لا تسجل فيها موجات معينة.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 406,
    "unitId": 10,
    "questionText": "ضمن 10.2 — انتشار الموجات ومناطق الظل، ما الخيار الموافق للبرنامج عندما نذكر «ظل S»؟",
    "options": [
      "تزداد مع العمق لكنها لا تحدد الحالة وحدها",
      "لدن جزئياً وليس سائلاً كلياً",
      "ينتج عن توقف S عند اللب الخارجي السائل",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 2,
    "explanation": "ظل S يرتبط هنا بـ: ينتج عن توقف S عند اللب الخارجي السائل.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 407,
    "unitId": 10,
    "questionText": "في 10.2 — انتشار الموجات ومناطق الظل، أي علاقة صحيحة يبيّنها مصطلح «ظل P»؟",
    "options": [
      "ينتج عن توقف S عند اللب الخارجي السائل",
      "ينتج عن انكسار P عند حدود اللب",
      "أكبر من سرعة S لذلك تصل أولاً",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "ظل P يرتبط هنا بـ: ينتج عن انكسار P عند حدود اللب.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 408,
    "unitId": 10,
    "questionText": "في سؤال بكالوريا قصير حول 10.2 — انتشار الموجات ومناطق الظل، بماذا نربط «تغير السرعة»؟",
    "options": [
      "بازلتية وغابروية وأكثر كثافة",
      "لدن جزئياً وليس سائلاً كلياً",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية.",
      "يدل على تغير الكثافة أو الصلابة أو التركيب"
    ],
    "correctAnswerIndex": 3,
    "explanation": "تغير السرعة يرتبط هنا بـ: يدل على تغير الكثافة أو الصلابة أو التركيب.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 409,
    "unitId": 10,
    "questionText": "في محور 10.2 — انتشار الموجات ومناطق الظل، أي عبارة تساعد على تمييز «الموجات P» عن المفاهيم القريبة؟",
    "options": [
      "تنحرف عند عبور أوساط مختلفة",
      "موجة طولية سريعة تنتشر في الصلب والسائل",
      "اعتمد على تحليل أزمنة وسرعات الموجات",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الموجات P يرتبط هنا بـ: تنحرف عند عبور أوساط مختلفة.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 410,
    "unitId": 10,
    "questionText": "إذا طُلب تفسير «الموجات S» ضمن 10.2 — انتشار الموجات ومناطق الظل، فأي جواب هو الأدق؟",
    "options": [
      "يفصل البرنس عن اللب الخارجي عند نحو 2900 كم",
      "ينتج عن توقف S عند اللب الخارجي السائل",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور.",
      "غيابها دليل قوي على وسط سائل"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الموجات S يرتبط هنا بـ: غيابها دليل قوي على وسط سائل.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 411,
    "unitId": 10,
    "questionText": "في محور 10.2 — انتشار الموجات ومناطق الظل، أي وصف دقيق لـ«المسارات المنحنية»؟",
    "options": [
      "انتقال إلى وسط غني بالحديد والنيكل",
      "إسقاط البؤرة على سطح الأرض",
      "تنتج عن تغير تدريجي في خواص الطبقات",
      "ينتج مباشرة أجساماً مضادة في كل الحالات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "المسارات المنحنية يرتبط هنا بـ: تنتج عن تغير تدريجي في خواص الطبقات.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 412,
    "unitId": 10,
    "questionText": "في موضوع 10.2 — انتشار الموجات ومناطق الظل، أي عبارة صحيحة حول «بيانات عالمية»؟",
    "options": [
      "تزداد عموماً نحو مركز الأرض",
      "تسمح باستنتاج بنية الأرض الداخلية",
      "منطقة لا تسجل فيها موجات معينة",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "بيانات عالمية يرتبط هنا بـ: تسمح باستنتاج بنية الأرض الداخلية.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 413,
    "unitId": 10,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «اللب الخارجي» ضمن 10.2 — انتشار الموجات ومناطق الظل.",
    "options": [
      "ينتج عن انكسار P عند حدود اللب",
      "نقطة انطلاق الموجات في العمق",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية.",
      "يفسر منطقة ظل S الواسعة"
    ],
    "correctAnswerIndex": 3,
    "explanation": "اللب الخارجي يرتبط هنا بـ: يفسر منطقة ظل S الواسعة.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 414,
    "unitId": 10,
    "questionText": "في محور 10.2 — انتشار الموجات ومناطق الظل، أي إكمال صحيح: «المحطات الزلزالية» ← ________؟",
    "options": [
      "يفصل القشرة عن البرنس",
      "تصل أخيراً غالباً وتسبب أضراراً كبيرة",
      "سطح موهو يفصل اللب الخارجي عن الداخلي.",
      "تسجل أزمنة الوصول لاستنتاج المسارات"
    ],
    "correctAnswerIndex": 3,
    "explanation": "المحطات الزلزالية يرتبط هنا بـ: تسجل أزمنة الوصول لاستنتاج المسارات.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 415,
    "unitId": 10,
    "questionText": "عند مراجعة 10.2 — انتشار الموجات ومناطق الظل، ما المعلومة التي لا يجب الخلط فيها حول «الموجات العميقة»؟",
    "options": [
      "تكشف الطبقات التي لا يمكن أخذ عينات منها مباشرة",
      "يفصل القشرة عن البرنس",
      "تسمح باستنتاج بنية الأرض الداخلية",
      "سطح موهو يفصل اللب الخارجي عن الداخلي."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الموجات العميقة يرتبط هنا بـ: تكشف الطبقات التي لا يمكن أخذ عينات منها مباشرة.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg"
  },
  {
    "id": 416,
    "unitId": 10,
    "questionText": "ضمن 10.3 — السطوح الفاصلة: موهو، غوتنبرغ، ليمان، ما الخيار الموافق للبرنامج عندما نذكر «سطح موهو»؟",
    "options": [
      "يفصل القشرة عن البرنس",
      "ترتبط بشدة الاهتزاز المسجل",
      "غرانيتية تقريباً وغنية بالسيليسيوم والألمنيوم",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 0,
    "explanation": "سطح موهو يرتبط هنا بـ: يفصل القشرة عن البرنس.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 417,
    "unitId": 10,
    "questionText": "في 10.3 — السطوح الفاصلة: موهو، غوتنبرغ، ليمان، أي علاقة صحيحة يبيّنها مصطلح «عمق موهو تحت القارات»؟",
    "options": [
      "لدن جزئياً وليس سائلاً كلياً",
      "صلب غني بالحديد والنيكل",
      "الموجات S تنتشر في السوائل أسرع من P.",
      "يقارب 30 إلى 70 كم"
    ],
    "correctAnswerIndex": 3,
    "explanation": "عمق موهو تحت القارات يرتبط هنا بـ: يقارب 30 إلى 70 كم.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 418,
    "unitId": 10,
    "questionText": "في سؤال بكالوريا قصير حول 10.3 — السطوح الفاصلة: موهو، غوتنبرغ، ليمان، بماذا نربط «موهو تحت المحيطات»؟",
    "options": [
      "يساعد على حساب بعد المحطة عن البؤرة",
      "انتقال إلى وسط غني بالحديد والنيكل",
      "يتم فقط في غياب الماء والأيونات.",
      "أقل عمقاً غالباً من القارات"
    ],
    "correctAnswerIndex": 3,
    "explanation": "موهو تحت المحيطات يرتبط هنا بـ: أقل عمقاً غالباً من القارات.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 419,
    "unitId": 10,
    "questionText": "في محور 10.3 — السطوح الفاصلة: موهو، غوتنبرغ، ليمان، أي عبارة تساعد على تمييز «سطح غوتنبرغ» عن المفاهيم القريبة؟",
    "options": [
      "يفصل البرنس عن اللب الخارجي عند نحو 2900 كم",
      "يبقي اللب الداخلي صلباً رغم الحرارة العالية",
      "غيابها دليل قوي على وسط سائل",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 0,
    "explanation": "سطح غوتنبرغ يرتبط هنا بـ: يفصل البرنس عن اللب الخارجي عند نحو 2900 كم.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 420,
    "unitId": 10,
    "questionText": "إذا طُلب تفسير «غوتنبرغ» ضمن 10.3 — السطوح الفاصلة: موهو، غوتنبرغ، ليمان، فأي جواب هو الأدق؟",
    "options": [
      "سائل غني بالحديد والنيكل",
      "بازلتية وغابروية وأكثر كثافة",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور.",
      "عنده تتوقف S وتنخفض سرعة P فجأة"
    ],
    "correctAnswerIndex": 3,
    "explanation": "غوتنبرغ يرتبط هنا بـ: عنده تتوقف S وتنخفض سرعة P فجأة.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 421,
    "unitId": 10,
    "questionText": "في محور 10.3 — السطوح الفاصلة: موهو، غوتنبرغ، ليمان، أي وصف دقيق لـ«سطح ليمان»؟",
    "options": [
      "يفصل اللب الخارجي عن الداخلي عند نحو 5100 كم",
      "انتقال إلى وسط غني بالحديد والنيكل",
      "يدل على تغير الكثافة أو الصلابة أو التركيب",
      "ينتج مباشرة أجساماً مضادة في كل الحالات."
    ],
    "correctAnswerIndex": 0,
    "explanation": "سطح ليمان يرتبط هنا بـ: يفصل اللب الخارجي عن الداخلي عند نحو 5100 كم.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 422,
    "unitId": 10,
    "questionText": "في موضوع 10.3 — السطوح الفاصلة: موهو، غوتنبرغ، ليمان، أي عبارة صحيحة حول «ليمان»؟",
    "options": [
      "تكشف الطبقات التي لا يمكن أخذ عينات منها مباشرة",
      "يفصل البرنس عن اللب الخارجي عند نحو 2900 كم",
      "ينتج مباشرة أجساماً مضادة في كل الحالات.",
      "عنده ترتفع سرعة P بسبب صلابة اللب الداخلي"
    ],
    "correctAnswerIndex": 3,
    "explanation": "ليمان يرتبط هنا بـ: عنده ترتفع سرعة P بسبب صلابة اللب الداخلي.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 423,
    "unitId": 10,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «السطح الفاصل» ضمن 10.3 — السطوح الفاصلة: موهو، غوتنبرغ، ليمان.",
    "options": [
      "تنتج عن تغير تدريجي في خواص الطبقات",
      "حد يحدث عنده تغير مفاجئ في خصائص الموجات",
      "تكفي تقريباً لتحديد المركز السطحي بالتثليث",
      "يتم فقط في غياب الماء والأيونات."
    ],
    "correctAnswerIndex": 1,
    "explanation": "السطح الفاصل يرتبط هنا بـ: حد يحدث عنده تغير مفاجئ في خصائص الموجات.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 424,
    "unitId": 10,
    "questionText": "في محور 10.3 — السطوح الفاصلة: موهو، غوتنبرغ، ليمان، أي إكمال صحيح: «القشرة/البرنس» ← ________؟",
    "options": [
      "ينتج عن انكسار P عند حدود اللب",
      "انتقال من صخور خفيفة إلى بيريدوتيت أكثف",
      "أقل عمقاً غالباً من القارات",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 1,
    "explanation": "القشرة/البرنس يرتبط هنا بـ: انتقال من صخور خفيفة إلى بيريدوتيت أكثف.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 425,
    "unitId": 10,
    "questionText": "عند مراجعة 10.3 — السطوح الفاصلة: موهو، غوتنبرغ، ليمان، ما المعلومة التي لا يجب الخلط فيها حول «البرنس/اللب»؟",
    "options": [
      "تنتج عن تغير تدريجي في خواص الطبقات",
      "موجة طولية سريعة تنتشر في الصلب والسائل",
      "انتقال إلى وسط غني بالحديد والنيكل",
      "الموجات S تنتشر في السوائل أسرع من P."
    ],
    "correctAnswerIndex": 2,
    "explanation": "البرنس/اللب يرتبط هنا بـ: انتقال إلى وسط غني بالحديد والنيكل.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 426,
    "unitId": 10,
    "questionText": "ضمن 10.3 — السطوح الفاصلة: موهو، غوتنبرغ، ليمان، ما الخيار الموافق للبرنامج عندما نذكر «اللب الخارجي/الداخلي»؟",
    "options": [
      "غرانيتية تقريباً وغنية بالسيليسيوم والألمنيوم",
      "ينتج عن انكسار P عند حدود اللب",
      "انتقال من سائل إلى صلب",
      "يعني توقف كل التحولات الطاقوية في الخلية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "اللب الخارجي/الداخلي يرتبط هنا بـ: انتقال من سائل إلى صلب.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 427,
    "unitId": 10,
    "questionText": "في 10.3 — السطوح الفاصلة: موهو، غوتنبرغ، ليمان، أي علاقة صحيحة يبيّنها مصطلح «اكتشاف السطوح»؟",
    "options": [
      "انتقال إلى وسط غني بالحديد والنيكل",
      "سطحية وبطيئة وكبيرة السعة ومدمرة",
      "اعتمد على تحليل أزمنة وسرعات الموجات",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 2,
    "explanation": "اكتشاف السطوح يرتبط هنا بـ: اعتمد على تحليل أزمنة وسرعات الموجات.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 428,
    "unitId": 10,
    "questionText": "في سؤال بكالوريا قصير حول 10.4 — النموذج الداخلي، الكثافة، الحرارة والتركيب، بماذا نربط «القشرة القارية»؟",
    "options": [
      "ترتبط بشدة الاهتزاز المسجل",
      "يفصل القشرة عن البرنس",
      "غرانيتية تقريباً وغنية بالسيليسيوم والألمنيوم",
      "يعني توقف كل التحولات الطاقوية في الخلية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "القشرة القارية يرتبط هنا بـ: غرانيتية تقريباً وغنية بالسيليسيوم والألمنيوم.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 429,
    "unitId": 10,
    "questionText": "في محور 10.4 — النموذج الداخلي، الكثافة، الحرارة والتركيب، أي عبارة تساعد على تمييز «القشرة المحيطية» عن المفاهيم القريبة؟",
    "options": [
      "ترتبط بشدة الاهتزاز المسجل",
      "تزداد عموماً نحو مركز الأرض",
      "بازلتية وغابروية وأكثر كثافة",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "القشرة المحيطية يرتبط هنا بـ: بازلتية وغابروية وأكثر كثافة.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 430,
    "unitId": 10,
    "questionText": "إذا طُلب تفسير «البرنس» ضمن 10.4 — النموذج الداخلي، الكثافة، الحرارة والتركيب، فأي جواب هو الأدق؟",
    "options": [
      "غني بالبيريدوتيت والأوليفين والبيروكسين",
      "تصل أخيراً غالباً وتسبب أضراراً كبيرة",
      "سائل غني بالحديد والنيكل",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "البرنس يرتبط هنا بـ: غني بالبيريدوتيت والأوليفين والبيروكسين.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 431,
    "unitId": 10,
    "questionText": "في محور 10.4 — النموذج الداخلي، الكثافة، الحرارة والتركيب، أي وصف دقيق لـ«اللب الخارجي»؟",
    "options": [
      "تصل أخيراً غالباً وتسبب أضراراً كبيرة",
      "سائل غني بالحديد والنيكل",
      "انتقال من صخور خفيفة إلى بيريدوتيت أكثف",
      "سطح موهو يفصل اللب الخارجي عن الداخلي."
    ],
    "correctAnswerIndex": 1,
    "explanation": "اللب الخارجي يرتبط هنا بـ: سائل غني بالحديد والنيكل.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 432,
    "unitId": 10,
    "questionText": "في موضوع 10.4 — النموذج الداخلي، الكثافة، الحرارة والتركيب، أي عبارة صحيحة حول «اللب الداخلي»؟",
    "options": [
      "صلب غني بالحديد والنيكل",
      "يبقي اللب الداخلي صلباً رغم الحرارة العالية",
      "بازلتية وغابروية وأكثر كثافة",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 0,
    "explanation": "اللب الداخلي يرتبط هنا بـ: صلب غني بالحديد والنيكل.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 433,
    "unitId": 10,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «الكثافة» ضمن 10.4 — النموذج الداخلي، الكثافة، الحرارة والتركيب.",
    "options": [
      "انتقال من صخور خفيفة إلى بيريدوتيت أكثف",
      "سطحية وبطيئة وكبيرة السعة ومدمرة",
      "تزداد عموماً نحو مركز الأرض",
      "يعني توقف كل التحولات الطاقوية في الخلية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الكثافة يرتبط هنا بـ: تزداد عموماً نحو مركز الأرض.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 434,
    "unitId": 10,
    "questionText": "في محور 10.4 — النموذج الداخلي، الكثافة، الحرارة والتركيب، أي إكمال صحيح: «الحرارة» ← ________؟",
    "options": [
      "منطقة لا تسجل فيها موجات معينة",
      "تزداد مع العمق لكنها لا تحدد الحالة وحدها",
      "أكبر من سرعة S لذلك تصل أولاً",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الحرارة يرتبط هنا بـ: تزداد مع العمق لكنها لا تحدد الحالة وحدها.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 435,
    "unitId": 10,
    "questionText": "عند مراجعة 10.4 — النموذج الداخلي، الكثافة، الحرارة والتركيب، ما المعلومة التي لا يجب الخلط فيها حول «الضغط»؟",
    "options": [
      "يفصل اللب الخارجي عن الداخلي عند نحو 5100 كم",
      "يفصل القشرة عن البرنس",
      "يبقي اللب الداخلي صلباً رغم الحرارة العالية",
      "الموجات S تنتشر في السوائل أسرع من P."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الضغط يرتبط هنا بـ: يبقي اللب الداخلي صلباً رغم الحرارة العالية.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 436,
    "unitId": 10,
    "questionText": "ضمن 10.4 — النموذج الداخلي، الكثافة، الحرارة والتركيب، ما الخيار الموافق للبرنامج عندما نذكر «الحقل المغناطيسي»؟",
    "options": [
      "ينتج عن حركات اللب الخارجي المعدني السائل",
      "غني بالبيريدوتيت والأوليفين والبيروكسين",
      "يفصل اللب الخارجي عن الداخلي عند نحو 5100 كم",
      "الموجات S تنتشر في السوائل أسرع من P."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الحقل المغناطيسي يرتبط هنا بـ: ينتج عن حركات اللب الخارجي المعدني السائل.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 437,
    "unitId": 10,
    "questionText": "في 10.4 — النموذج الداخلي، الكثافة، الحرارة والتركيب، أي علاقة صحيحة يبيّنها مصطلح «النموذج الداخلي»؟",
    "options": [
      "غلاف صلب فوق الأستينوسفير",
      "غرانيتية تقريباً وغنية بالسيليسيوم والألمنيوم",
      "مبني أساساً من معطيات زلزالية غير مباشرة",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "النموذج الداخلي يرتبط هنا بـ: مبني أساساً من معطيات زلزالية غير مباشرة.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 438,
    "unitId": 10,
    "questionText": "في سؤال بكالوريا قصير حول 10.4 — النموذج الداخلي، الكثافة، الحرارة والتركيب، بماذا نربط «الأستينوسفير»؟",
    "options": [
      "يساعد على حساب بعد المحطة عن البؤرة",
      "سطحية وبطيئة وكبيرة السعة ومدمرة",
      "لدن جزئياً وليس سائلاً كلياً",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الأستينوسفير يرتبط هنا بـ: لدن جزئياً وليس سائلاً كلياً.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 439,
    "unitId": 10,
    "questionText": "في محور 10.4 — النموذج الداخلي، الكثافة، الحرارة والتركيب، أي عبارة تساعد على تمييز «الليثوسفير» عن المفاهيم القريبة؟",
    "options": [
      "عنده ترتفع سرعة P بسبب صلابة اللب الداخلي",
      "منطقة لا تسجل فيها موجات معينة",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة.",
      "غلاف صلب فوق الأستينوسفير"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الليثوسفير يرتبط هنا بـ: غلاف صلب فوق الأستينوسفير.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg"
  },
  {
    "id": 440,
    "unitId": 11,
    "questionText": "إذا طُلب تفسير «الظهرة» ضمن 11.1 — الظهرات وبناء اللوح المحيطي، فأي جواب هو الأدق؟",
    "options": [
      "بل ليثوسفير محيطية وبرنس علوي",
      "بيريدوتيت متحول بالماء شائع في الأوفيوليت",
      "حد تباعدي محيطي تتشكل عنده قشرة جديدة",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الظهرة يرتبط هنا بـ: حد تباعدي محيطي تتشكل عنده قشرة جديدة.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 441,
    "unitId": 11,
    "questionText": "في محور 11.1 — الظهرات وبناء اللوح المحيطي، أي وصف دقيق لـ«الصهير البازلتي»؟",
    "options": [
      "تزداد سماكتها بالابتعاد عن الظهرة",
      "صخر البرنس أسفل موهو المحيطي",
      "يصعد عند الظهرة نتيجة انخفاض الضغط",
      "يعني توقف كل التحولات الطاقوية في الخلية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الصهير البازلتي يرتبط هنا بـ: يصعد عند الظهرة نتيجة انخفاض الضغط.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 442,
    "unitId": 11,
    "questionText": "في موضوع 11.1 — الظهرات وبناء اللوح المحيطي، أي عبارة صحيحة حول «البازلت الوسائدي»؟",
    "options": [
      "تغوص الصفيحة المحيطية تحت القارية",
      "انغراز ليثوسفير محيطية كثيفة تحت صفيحة أخرى",
      "ينتج من تبرد اللافا سريعاً في ماء البحر",
      "الفوالق العكسية دليل على التباعد لا الضغط."
    ],
    "correctAnswerIndex": 2,
    "explanation": "البازلت الوسائدي يرتبط هنا بـ: ينتج من تبرد اللافا سريعاً في ماء البحر.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 443,
    "unitId": 11,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «الدوليريت» ضمن 11.1 — الظهرات وبناء اللوح المحيطي.",
    "options": [
      "ركوب واسع لكتل صخرية فوق أخرى",
      "اصطفاف بؤر زلزالية يحدد مستوى الصفيحة الغائصة",
      "عروق تغذي البازلت على شكل قواطع",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الدوليريت يرتبط هنا بـ: عروق تغذي البازلت على شكل قواطع.",
    "diagramUrl": "/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg"
  },
  {
    "id": 444,
    "unitId": 11,
    "questionText": "في محور 11.1 — الظهرات وبناء اللوح المحيطي، أي إكمال صحيح: «الغابرو» ← ________؟",
    "options": [
      "دليل على بركانية تحت مائية",
      "يقطع الظهرات ويزيح قطاعاتها",
      "الفوالق العكسية دليل على التباعد لا الضغط.",
      "صخر ماغماتي عميق بطيء التبلور في القشرة المحيطية"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الغابرو يرتبط هنا بـ: صخر ماغماتي عميق بطيء التبلور في القشرة المحيطية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_01_adn.svg"
  },
  {
    "id": 445,
    "unitId": 11,
    "questionText": "عند مراجعة 11.1 — الظهرات وبناء اللوح المحيطي، ما المعلومة التي لا يجب الخلط فيها حول «البيريدوتيت»؟",
    "options": [
      "مثال تصادم الهند وآسيا",
      "تغوص الصفيحة المحيطية تحت القارية",
      "صخر البرنس أسفل موهو المحيطي",
      "الأوفيوليت قطعة من اللب الداخلي صعدت إلى السطح."
    ],
    "correctAnswerIndex": 2,
    "explanation": "البيريدوتيت يرتبط هنا بـ: صخر البرنس أسفل موهو المحيطي.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_01_adn.svg"
  },
  {
    "id": 446,
    "unitId": 11,
    "questionText": "ضمن 11.1 — الظهرات وبناء اللوح المحيطي، ما الخيار الموافق للبرنامج عندما نذكر «الرواسب البحرية»؟",
    "options": [
      "فالق انضغاطي تركب فيه كتلة فوق أخرى",
      "تزداد سماكتها بالابتعاد عن الظهرة",
      "ينتج سلسلة جبلية بعد غلق المحيط",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الرواسب البحرية يرتبط هنا بـ: تزداد سماكتها بالابتعاد عن الظهرة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_01_adn.svg"
  },
  {
    "id": 447,
    "unitId": 11,
    "questionText": "في 11.1 — الظهرات وبناء اللوح المحيطي، أي علاقة صحيحة يبيّنها مصطلح «العمر المحيطي»؟",
    "options": [
      "تصادم قارتين بعد غلق محيط كان بينهما",
      "تدل على استمرار اللوح الغائص في العمق",
      "صغير عند الظهرة ويزداد بعيداً عنها",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "العمر المحيطي يرتبط هنا بـ: صغير عند الظهرة ويزداد بعيداً عنها.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_01_adn.svg"
  },
  {
    "id": 448,
    "unitId": 11,
    "questionText": "في سؤال بكالوريا قصير حول 11.1 — الظهرات وبناء اللوح المحيطي، بماذا نربط «التدفق الحراري»؟",
    "options": [
      "مثال تصادم الهند وآسيا",
      "رواسب ثم بازلت وسائدي ثم دوليريت ثم غابرو ثم بيريدوتيت",
      "مرتفع قرب محور الظهرة",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة."
    ],
    "correctAnswerIndex": 2,
    "explanation": "التدفق الحراري يرتبط هنا بـ: مرتفع قرب محور الظهرة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_01_adn.svg"
  },
  {
    "id": 449,
    "unitId": 11,
    "questionText": "في محور 11.1 — الظهرات وبناء اللوح المحيطي، أي عبارة تساعد على تمييز «الثقوب الحرارية» عن المفاهيم القريبة؟",
    "options": [
      "غني نسبياً بالماء والسيليكا وقد يكون انفجارياً",
      "مثال محيط تتغلب عليه مناطق الغوص",
      "مياه ساخنة غنية بالمعادن قرب الظهرات",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الثقوب الحرارية يرتبط هنا بـ: مياه ساخنة غنية بالمعادن قرب الظهرات.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_01_adn.svg"
  },
  {
    "id": 450,
    "unitId": 11,
    "questionText": "إذا طُلب تفسير «البناء المحيطي» ضمن 11.1 — الظهرات وبناء اللوح المحيطي، فأي جواب هو الأدق؟",
    "options": [
      "يعوض هدم الليثوسفير عند الغوص",
      "شاهد على محيط قديم أغلق",
      "ركوب واسع لكتل صخرية فوق أخرى",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 0,
    "explanation": "البناء المحيطي يرتبط هنا بـ: يعوض هدم الليثوسفير عند الغوص.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_01_adn.svg"
  },
  {
    "id": 451,
    "unitId": 11,
    "questionText": "في محور 11.1 — الظهرات وبناء اللوح المحيطي، أي وصف دقيق لـ«الفالق التحويلي»؟",
    "options": [
      "يقطع الظهرات ويزيح قطاعاتها",
      "ينتج سلسلة جبلية بعد غلق المحيط",
      "سلسلة مرتبطة بغلق محيط تيتس",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الفالق التحويلي يرتبط هنا بـ: يقطع الظهرات ويزيح قطاعاتها.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_01_adn.svg"
  },
  {
    "id": 452,
    "unitId": 11,
    "questionText": "في موضوع 11.1 — الظهرات وبناء اللوح المحيطي، أي عبارة صحيحة حول «الانتشار المحيطي»؟",
    "options": [
      "حركة جانبية لقاع المحيط من محور الظهرة",
      "بداية تفكك قارة بفعل تباعد",
      "يزيد ارتفاع السلاسل الجبلية في التصادم",
      "يصف ظاهرة مناعية نوعية فقط ولا علاقة له بهذا المحور."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الانتشار المحيطي يرتبط هنا بـ: حركة جانبية لقاع المحيط من محور الظهرة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_01_adn.svg"
  },
  {
    "id": 453,
    "unitId": 11,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «الغوص» ضمن 11.2 — الغوص Subduction.",
    "options": [
      "انغراز ليثوسفير محيطية كثيفة تحت صفيحة أخرى",
      "عروق تغذي البازلت على شكل قواطع",
      "صخر ماغماتي عميق بطيء التبلور في القشرة المحيطية",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الغوص يرتبط هنا بـ: انغراز ليثوسفير محيطية كثيفة تحت صفيحة أخرى.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_04_arnt.svg"
  },
  {
    "id": 454,
    "unitId": 11,
    "questionText": "في محور 11.2 — الغوص Subduction، أي إكمال صحيح: «الخندق المحيطي» ← ________؟",
    "options": [
      "انخفاض عميق عند بداية الغوص",
      "انغراز ليثوسفير محيطية كثيفة تحت صفيحة أخرى",
      "مثال تصادم الهند وآسيا",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الخندق المحيطي يرتبط هنا بـ: انخفاض عميق عند بداية الغوص.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_04_arnt.svg"
  },
  {
    "id": 455,
    "unitId": 11,
    "questionText": "عند مراجعة 11.2 — الغوص Subduction، ما المعلومة التي لا يجب الخلط فيها حول «مستوى واداتي-بينيوف»؟",
    "options": [
      "اصطفاف بؤر زلزالية يحدد مستوى الصفيحة الغائصة",
      "رواسب ثم بازلت وسائدي ثم دوليريت ثم غابرو ثم بيريدوتيت",
      "ركوب واسع لكتل صخرية فوق أخرى",
      "الأوفيوليت قطعة من اللب الداخلي صعدت إلى السطح."
    ],
    "correctAnswerIndex": 0,
    "explanation": "مستوى واداتي-بينيوف يرتبط هنا بـ: اصطفاف بؤر زلزالية يحدد مستوى الصفيحة الغائصة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_04_arnt.svg"
  },
  {
    "id": 456,
    "unitId": 11,
    "questionText": "ضمن 11.2 — الغوص Subduction، ما الخيار الموافق للبرنامج عندما نذكر «قوس بركاني»؟",
    "options": [
      "مثال محيط ناضج يتسع",
      "صخر تحول إقليمي في السلاسل التصادمية",
      "يتشكل فوق منطقة الغوص بسبب صعود الصهير",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "قوس بركاني يرتبط هنا بـ: يتشكل فوق منطقة الغوص بسبب صعود الصهير.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_04_arnt.svg"
  },
  {
    "id": 457,
    "unitId": 11,
    "questionText": "في 11.2 — الغوص Subduction، أي علاقة صحيحة يبيّنها مصطلح «الماء في اللوح الغائص»؟",
    "options": [
      "يخفض درجة انصهار البرنس فوقه",
      "بيريدوتيت متحول بالماء شائع في الأوفيوليت",
      "شاهد على محيط قديم أغلق",
      "الغوص يحدث عادة بصعود صفيحة محيطية فوق البرنس."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الماء في اللوح الغائص يرتبط هنا بـ: يخفض درجة انصهار البرنس فوقه.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_04_arnt.svg"
  },
  {
    "id": 458,
    "unitId": 11,
    "questionText": "في سؤال بكالوريا قصير حول 11.2 — الغوص Subduction، بماذا نربط «الصهير الأنديزيتي»؟",
    "options": [
      "شاهد على محيط قديم أغلق",
      "صخر البرنس أسفل موهو المحيطي",
      "يتم فقط في غياب الماء والأيونات.",
      "غني نسبياً بالماء والسيليكا وقد يكون انفجارياً"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الصهير الأنديزيتي يرتبط هنا بـ: غني نسبياً بالماء والسيليكا وقد يكون انفجارياً.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_04_arnt.svg"
  },
  {
    "id": 459,
    "unitId": 11,
    "questionText": "في محور 11.2 — الغوص Subduction، أي عبارة تساعد على تمييز «الزلازل العميقة» عن المفاهيم القريبة؟",
    "options": [
      "تدل على استمرار اللوح الغائص في العمق",
      "فتح محيط ثم توسعه ثم غوصه ثم غلقه وتصادم القارات",
      "يزيد ارتفاع السلاسل الجبلية في التصادم",
      "الفوالق العكسية دليل على التباعد لا الضغط."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الزلازل العميقة يرتبط هنا بـ: تدل على استمرار اللوح الغائص في العمق.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_04_arnt.svg"
  },
  {
    "id": 460,
    "unitId": 11,
    "questionText": "إذا طُلب تفسير «الشيست الأزرق» ضمن 11.2 — الغوص Subduction، فأي جواب هو الأدق؟",
    "options": [
      "قارة عظمى تفككت ضمن دورات قديمة",
      "دليل تحول ضغط عال وحرارة منخفضة في الغوص",
      "تغوص الصفيحة المحيطية تحت القارية",
      "ينتج مباشرة أجساماً مضادة في كل الحالات."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الشيست الأزرق يرتبط هنا بـ: دليل تحول ضغط عال وحرارة منخفضة في الغوص.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_04_arnt.svg"
  },
  {
    "id": 461,
    "unitId": 11,
    "questionText": "في محور 11.2 — الغوص Subduction، أي وصف دقيق لـ«الإكلوجيت»؟",
    "options": [
      "صخر تحول أعمق في مسار الغوص",
      "مياه ساخنة غنية بالمعادن قرب الظهرات",
      "تدل على استمرار اللوح الغائص في العمق",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الإكلوجيت يرتبط هنا بـ: صخر تحول أعمق في مسار الغوص.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_04_arnt.svg"
  },
  {
    "id": 462,
    "unitId": 11,
    "questionText": "في موضوع 11.2 — الغوص Subduction، أي عبارة صحيحة حول «الغوص المحيطي القاري»؟",
    "options": [
      "صخر تحول إقليمي في السلاسل التصادمية",
      "يصعد عند الظهرة نتيجة انخفاض الضغط",
      "تغوص الصفيحة المحيطية تحت القارية",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الغوص المحيطي القاري يرتبط هنا بـ: تغوص الصفيحة المحيطية تحت القارية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_04_arnt.svg"
  },
  {
    "id": 463,
    "unitId": 11,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «اللوح القديم» ضمن 11.2 — الغوص Subduction.",
    "options": [
      "فتح محيط ثم توسعه ثم غوصه ثم غلقه وتصادم القارات",
      "أبرد وأكثف وأكثر قابلية للغوص",
      "مرتفع قرب محور الظهرة",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "اللوح القديم يرتبط هنا بـ: أبرد وأكثف وأكثر قابلية للغوص.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_04_arnt.svg"
  },
  {
    "id": 464,
    "unitId": 11,
    "questionText": "في محور 11.2 — الغوص Subduction، أي إكمال صحيح: «بركانية الغوص» ← ________؟",
    "options": [
      "ينتج من تبرد اللافا سريعاً في ماء البحر",
      "أعنف عادة من بركانية الظهرة",
      "بقايا محيط تيتس في طور الانغلاق",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 1,
    "explanation": "بركانية الغوص يرتبط هنا بـ: أعنف عادة من بركانية الظهرة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_04_arnt.svg"
  },
  {
    "id": 465,
    "unitId": 11,
    "questionText": "عند مراجعة 11.3 — التصادم القاري، ما المعلومة التي لا يجب الخلط فيها حول «التصادم القاري»؟",
    "options": [
      "مثال محيط ناضج يتسع",
      "تصادم قارتين بعد غلق محيط كان بينهما",
      "بقايا محيط تيتس في طور الانغلاق",
      "الفوالق العكسية دليل على التباعد لا الضغط."
    ],
    "correctAnswerIndex": 1,
    "explanation": "التصادم القاري يرتبط هنا بـ: تصادم قارتين بعد غلق محيط كان بينهما.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_02_transcription.svg"
  },
  {
    "id": 466,
    "unitId": 11,
    "questionText": "ضمن 11.3 — التصادم القاري، ما الخيار الموافق للبرنامج عندما نذكر «الطيّات»؟",
    "options": [
      "صخر البرنس أسفل موهو المحيطي",
      "تشوهات تدل على ضغط أفقي وتقلص",
      "تصادم قارتين بعد غلق محيط كان بينهما",
      "الفوالق العكسية دليل على التباعد لا الضغط."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الطيّات يرتبط هنا بـ: تشوهات تدل على ضغط أفقي وتقلص.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_02_transcription.svg"
  },
  {
    "id": 467,
    "unitId": 11,
    "questionText": "في 11.3 — التصادم القاري، أي علاقة صحيحة يبيّنها مصطلح «الفالق العكسي»؟",
    "options": [
      "تدل على بيئة محيطية قبل التصادم",
      "صخر البرنس أسفل موهو المحيطي",
      "فالق انضغاطي تركب فيه كتلة فوق أخرى",
      "الأوفيوليت قطعة من اللب الداخلي صعدت إلى السطح."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الفالق العكسي يرتبط هنا بـ: فالق انضغاطي تركب فيه كتلة فوق أخرى.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_02_transcription.svg"
  },
  {
    "id": 468,
    "unitId": 11,
    "questionText": "في سؤال بكالوريا قصير حول 11.3 — التصادم القاري، بماذا نربط «الدسر»؟",
    "options": [
      "أبرد وأكثف وأكثر قابلية للغوص",
      "ركوب واسع لكتل صخرية فوق أخرى",
      "دليل على بركانية تحت مائية",
      "الأوفيوليت قطعة من اللب الداخلي صعدت إلى السطح."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الدسر يرتبط هنا بـ: ركوب واسع لكتل صخرية فوق أخرى.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_02_transcription.svg"
  },
  {
    "id": 469,
    "unitId": 11,
    "questionText": "في محور 11.3 — التصادم القاري، أي عبارة تساعد على تمييز «تثخن القشرة» عن المفاهيم القريبة؟",
    "options": [
      "محيط قديم أغلقت بقاياه لتكوين سلاسل ألبية",
      "انخفاض عميق عند بداية الغوص",
      "يزيد ارتفاع السلاسل الجبلية في التصادم",
      "يحدث في كل البروتينات بالطريقة نفسها دون نوعية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "تثخن القشرة يرتبط هنا بـ: يزيد ارتفاع السلاسل الجبلية في التصادم.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_02_transcription.svg"
  },
  {
    "id": 470,
    "unitId": 11,
    "questionText": "إذا طُلب تفسير «الجذر القاري» ضمن 11.3 — التصادم القاري، فأي جواب هو الأدق؟",
    "options": [
      "يعوض هدم الليثوسفير عند الغوص",
      "بل ليثوسفير محيطية وبرنس علوي",
      "امتداد عميق لقشرة سميكة تحت الجبال",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الجذر القاري يرتبط هنا بـ: امتداد عميق لقشرة سميكة تحت الجبال.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_02_transcription.svg"
  },
  {
    "id": 471,
    "unitId": 11,
    "questionText": "في محور 11.3 — التصادم القاري، أي وصف دقيق لـ«الميكاشيست»؟",
    "options": [
      "تزداد سماكتها بالابتعاد عن الظهرة",
      "فالق انضغاطي تركب فيه كتلة فوق أخرى",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس.",
      "صخر تحول إقليمي في السلاسل التصادمية"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الميكاشيست يرتبط هنا بـ: صخر تحول إقليمي في السلاسل التصادمية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_02_transcription.svg"
  },
  {
    "id": 472,
    "unitId": 11,
    "questionText": "في موضوع 11.3 — التصادم القاري، أي عبارة صحيحة حول «الغرانيت التصادمي»؟",
    "options": [
      "انغراز ليثوسفير محيطية كثيفة تحت صفيحة أخرى",
      "ينتج من انصهار جزئي للقشرة أثناء التصادم",
      "دليل تحول ضغط عال وحرارة منخفضة في الغوص",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الغرانيت التصادمي يرتبط هنا بـ: ينتج من انصهار جزئي للقشرة أثناء التصادم.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_02_transcription.svg"
  },
  {
    "id": 473,
    "unitId": 11,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «الهيمالايا» ضمن 11.3 — التصادم القاري.",
    "options": [
      "يخفض درجة انصهار البرنس فوقه",
      "مثال تصادم الهند وآسيا",
      "مرتفع قرب محور الظهرة",
      "يتم فقط في غياب الماء والأيونات."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الهيمالايا يرتبط هنا بـ: مثال تصادم الهند وآسيا.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_02_transcription.svg"
  },
  {
    "id": 474,
    "unitId": 11,
    "questionText": "في محور 11.3 — التصادم القاري، أي إكمال صحيح: «الألب» ← ________؟",
    "options": [
      "يزيد ارتفاع السلاسل الجبلية في التصادم",
      "صخر ماغماتي عميق بطيء التبلور في القشرة المحيطية",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس.",
      "سلسلة مرتبطة بغلق محيط تيتس"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الألب يرتبط هنا بـ: سلسلة مرتبطة بغلق محيط تيتس.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_02_transcription.svg"
  },
  {
    "id": 475,
    "unitId": 11,
    "questionText": "عند مراجعة 11.3 — التصادم القاري، ما المعلومة التي لا يجب الخلط فيها حول «انعدام الغوص القاري العميق»؟",
    "options": [
      "مثال محيط ناضج يتسع",
      "مرتفع قرب محور الظهرة",
      "يتم فقط في غياب الماء والأيونات.",
      "يرجع إلى انخفاض كثافة القشرة القارية"
    ],
    "correctAnswerIndex": 3,
    "explanation": "انعدام الغوص القاري العميق يرتبط هنا بـ: يرجع إلى انخفاض كثافة القشرة القارية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_02_transcription.svg"
  },
  {
    "id": 476,
    "unitId": 11,
    "questionText": "ضمن 11.3 — التصادم القاري، ما الخيار الموافق للبرنامج عندما نذكر «الرفع والتعرية»؟",
    "options": [
      "قارة عظمى تفككت ضمن دورات قديمة",
      "شاهد على مرحلة الغوص في دورة ويلسون",
      "يكشفان صخوراً عميقة بعد بناء الجبال",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الرفع والتعرية يرتبط هنا بـ: يكشفان صخوراً عميقة بعد بناء الجبال.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_02_transcription.svg"
  },
  {
    "id": 477,
    "unitId": 11,
    "questionText": "في 11.4 — الأوفيوليت، أي علاقة صحيحة يبيّنها مصطلح «الأوفيوليت»؟",
    "options": [
      "ينتج من انصهار جزئي للقشرة أثناء التصادم",
      "قطعة من ليثوسفير محيطية قديمة فوق قارة",
      "يقطع الظهرات ويزيح قطاعاتها",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الأوفيوليت يرتبط هنا بـ: قطعة من ليثوسفير محيطية قديمة فوق قارة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_03_traduction.svg"
  },
  {
    "id": 478,
    "unitId": 11,
    "questionText": "في سؤال بكالوريا قصير حول 11.4 — الأوفيوليت، بماذا نربط «تسلسل الأوفيوليت»؟",
    "options": [
      "اصطفاف بؤر زلزالية يحدد مستوى الصفيحة الغائصة",
      "مثال محيط تتغلب عليه مناطق الغوص",
      "رواسب ثم بازلت وسائدي ثم دوليريت ثم غابرو ثم بيريدوتيت",
      "الغوص يحدث عادة بصعود صفيحة محيطية فوق البرنس."
    ],
    "correctAnswerIndex": 2,
    "explanation": "تسلسل الأوفيوليت يرتبط هنا بـ: رواسب ثم بازلت وسائدي ثم دوليريت ثم غابرو ثم بيريدوتيت.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_03_traduction.svg"
  },
  {
    "id": 479,
    "unitId": 11,
    "questionText": "في محور 11.4 — الأوفيوليت، أي عبارة تساعد على تمييز «البازلت الوسائدي» عن المفاهيم القريبة؟",
    "options": [
      "تصادم قارتين بعد غلق محيط كان بينهما",
      "دليل على بركانية تحت مائية",
      "يدعم سيناريو غلق محيط وتصادم",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 1,
    "explanation": "البازلت الوسائدي يرتبط هنا بـ: دليل على بركانية تحت مائية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_03_traduction.svg"
  },
  {
    "id": 480,
    "unitId": 11,
    "questionText": "إذا طُلب تفسير «الغابرو في الأوفيوليت» ضمن 11.4 — الأوفيوليت، فأي جواب هو الأدق؟",
    "options": [
      "ركوب واسع لكتل صخرية فوق أخرى",
      "يمثل الجزء العميق من القشرة المحيطية",
      "انخفاض عميق عند بداية الغوص",
      "يتم فقط في غياب الماء والأيونات."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الغابرو في الأوفيوليت يرتبط هنا بـ: يمثل الجزء العميق من القشرة المحيطية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_03_traduction.svg"
  },
  {
    "id": 481,
    "unitId": 11,
    "questionText": "في محور 11.4 — الأوفيوليت، أي وصف دقيق لـ«البيريدوتيت»؟",
    "options": [
      "مرتفع قرب محور الظهرة",
      "مثال تصادم الهند وآسيا",
      "يمثل البرنس العلوي في التسلسل الأوفيوليتي",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 2,
    "explanation": "البيريدوتيت يرتبط هنا بـ: يمثل البرنس العلوي في التسلسل الأوفيوليتي.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_03_traduction.svg"
  },
  {
    "id": 482,
    "unitId": 11,
    "questionText": "في موضوع 11.4 — الأوفيوليت، أي عبارة صحيحة حول «الاندفاع Obduction»؟",
    "options": [
      "انتقال جزء محيطي فوق هامش قاري",
      "ينتج سلسلة جبلية بعد غلق المحيط",
      "بقايا محيط تيتس في طور الانغلاق",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس."
    ],
    "correctAnswerIndex": 0,
    "explanation": "الاندفاع Obduction يرتبط هنا بـ: انتقال جزء محيطي فوق هامش قاري.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_03_traduction.svg"
  },
  {
    "id": 483,
    "unitId": 11,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «الأوفيوليت في الجبال» ضمن 11.4 — الأوفيوليت.",
    "options": [
      "يمثل البرنس العلوي في التسلسل الأوفيوليتي",
      "شاهد على محيط قديم أغلق",
      "محيط قديم أغلقت بقاياه لتكوين سلاسل ألبية",
      "الفوالق العكسية دليل على التباعد لا الضغط."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الأوفيوليت في الجبال يرتبط هنا بـ: شاهد على محيط قديم أغلق.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_03_traduction.svg"
  },
  {
    "id": 484,
    "unitId": 11,
    "questionText": "في محور 11.4 — الأوفيوليت، أي إكمال صحيح: «أوفيوليت عمان» ← ________؟",
    "options": [
      "رواسب ثم بازلت وسائدي ثم دوليريت ثم غابرو ثم بيريدوتيت",
      "مثال مشهور لتسلسل محيطي محفوظ",
      "يمثل البرنس العلوي في التسلسل الأوفيوليتي",
      "يتم فقط في غياب الماء والأيونات."
    ],
    "correctAnswerIndex": 1,
    "explanation": "أوفيوليت عمان يرتبط هنا بـ: مثال مشهور لتسلسل محيطي محفوظ.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_03_traduction.svg"
  },
  {
    "id": 485,
    "unitId": 11,
    "questionText": "عند مراجعة 11.4 — الأوفيوليت، ما المعلومة التي لا يجب الخلط فيها حول «الرواسب العميقة»؟",
    "options": [
      "بيريدوتيت متحول بالماء شائع في الأوفيوليت",
      "ينتج من تبرد اللافا سريعاً في ماء البحر",
      "تدل على بيئة محيطية قبل التصادم",
      "ينتج مباشرة أجساماً مضادة في كل الحالات."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الرواسب العميقة يرتبط هنا بـ: تدل على بيئة محيطية قبل التصادم.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_03_traduction.svg"
  },
  {
    "id": 486,
    "unitId": 11,
    "questionText": "ضمن 11.4 — الأوفيوليت، ما الخيار الموافق للبرنامج عندما نذكر «وجوده بين قارتين»؟",
    "options": [
      "دليل تحول ضغط عال وحرارة منخفضة في الغوص",
      "عروق تغذي البازلت على شكل قواطع",
      "يدعم سيناريو غلق محيط وتصادم",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 2,
    "explanation": "وجوده بين قارتين يرتبط هنا بـ: يدعم سيناريو غلق محيط وتصادم.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_03_traduction.svg"
  },
  {
    "id": 487,
    "unitId": 11,
    "questionText": "في 11.4 — الأوفيوليت، أي علاقة صحيحة يبيّنها مصطلح «السربنتينيت»؟",
    "options": [
      "بيريدوتيت متحول بالماء شائع في الأوفيوليت",
      "انغراز ليثوسفير محيطية كثيفة تحت صفيحة أخرى",
      "صخر البرنس أسفل موهو المحيطي",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 0,
    "explanation": "السربنتينيت يرتبط هنا بـ: بيريدوتيت متحول بالماء شائع في الأوفيوليت.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_03_traduction.svg"
  },
  {
    "id": 488,
    "unitId": 11,
    "questionText": "في سؤال بكالوريا قصير حول 11.4 — الأوفيوليت، بماذا نربط «الأوفيوليت ليس لباً أرضياً»؟",
    "options": [
      "يمثل البرنس العلوي في التسلسل الأوفيوليتي",
      "شاهد صخري على مرحلة محيطية سابقة",
      "بل ليثوسفير محيطية وبرنس علوي",
      "هو بنية ثابتة لا تتأثر بالشروط الفيزيائية أبداً."
    ],
    "correctAnswerIndex": 2,
    "explanation": "الأوفيوليت ليس لباً أرضياً يرتبط هنا بـ: بل ليثوسفير محيطية وبرنس علوي.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_03_traduction.svg"
  },
  {
    "id": 489,
    "unitId": 11,
    "questionText": "في محور 11.5 — دورة ويلسون، أي عبارة تساعد على تمييز «دورة ويلسون» عن المفاهيم القريبة؟",
    "options": [
      "تشوهات تدل على ضغط أفقي وتقلص",
      "صخر تحول أعمق في مسار الغوص",
      "فتح محيط ثم توسعه ثم غوصه ثم غلقه وتصادم القارات",
      "الأوفيوليت قطعة من اللب الداخلي صعدت إلى السطح."
    ],
    "correctAnswerIndex": 2,
    "explanation": "دورة ويلسون يرتبط هنا بـ: فتح محيط ثم توسعه ثم غوصه ثم غلقه وتصادم القارات.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 490,
    "unitId": 11,
    "questionText": "إذا طُلب تفسير «التشقق القاري» ضمن 11.5 — دورة ويلسون، فأي جواب هو الأدق؟",
    "options": [
      "صخر تحول أعمق في مسار الغوص",
      "يصعد عند الظهرة نتيجة انخفاض الضغط",
      "يمثل تباعد قارتين بعد اكتمال التصادم مباشرة.",
      "بداية تفكك قارة بفعل تباعد"
    ],
    "correctAnswerIndex": 3,
    "explanation": "التشقق القاري يرتبط هنا بـ: بداية تفكك قارة بفعل تباعد.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 491,
    "unitId": 11,
    "questionText": "في محور 11.5 — دورة ويلسون، أي وصف دقيق لـ«البحر الأحمر»؟",
    "options": [
      "يدعم سيناريو غلق محيط وتصادم",
      "مثال محيط جنيني في طور الانفتاح",
      "انغراز ليثوسفير محيطية كثيفة تحت صفيحة أخرى",
      "الغوص يحدث عادة بصعود صفيحة محيطية فوق البرنس."
    ],
    "correctAnswerIndex": 1,
    "explanation": "البحر الأحمر يرتبط هنا بـ: مثال محيط جنيني في طور الانفتاح.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 492,
    "unitId": 11,
    "questionText": "في موضوع 11.5 — دورة ويلسون، أي عبارة صحيحة حول «الأطلسي»؟",
    "options": [
      "امتداد عميق لقشرة سميكة تحت الجبال",
      "تشوهات تدل على ضغط أفقي وتقلص",
      "الأوفيوليت قطعة من اللب الداخلي صعدت إلى السطح.",
      "مثال محيط ناضج يتسع"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الأطلسي يرتبط هنا بـ: مثال محيط ناضج يتسع.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 493,
    "unitId": 11,
    "questionText": "اختر العبارة العلمية الصحيحة بخصوص «الهادئ» ضمن 11.5 — دورة ويلسون.",
    "options": [
      "تغوص الصفيحة المحيطية تحت القارية",
      "مثال محيط تتغلب عليه مناطق الغوص",
      "يمثل البرنس العلوي في التسلسل الأوفيوليتي",
      "الغوص يحدث عادة بصعود صفيحة محيطية فوق البرنس."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الهادئ يرتبط هنا بـ: مثال محيط تتغلب عليه مناطق الغوص.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 494,
    "unitId": 11,
    "questionText": "في محور 11.5 — دورة ويلسون، أي إكمال صحيح: «المتوسط» ← ________؟",
    "options": [
      "يقطع الظهرات ويزيح قطاعاتها",
      "بقايا محيط تيتس في طور الانغلاق",
      "يرجع إلى انخفاض كثافة القشرة القارية",
      "يعني توقف كل التحولات الطاقوية في الخلية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "المتوسط يرتبط هنا بـ: بقايا محيط تيتس في طور الانغلاق.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 495,
    "unitId": 11,
    "questionText": "عند مراجعة 11.5 — دورة ويلسون، ما المعلومة التي لا يجب الخلط فيها حول «تيتس»؟",
    "options": [
      "سلسلة مرتبطة بغلق محيط تيتس",
      "محيط قديم أغلقت بقاياه لتكوين سلاسل ألبية",
      "بل ليثوسفير محيطية وبرنس علوي",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 1,
    "explanation": "تيتس يرتبط هنا بـ: محيط قديم أغلقت بقاياه لتكوين سلاسل ألبية.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 496,
    "unitId": 11,
    "questionText": "ضمن 11.5 — دورة ويلسون، ما الخيار الموافق للبرنامج عندما نذكر «التصادم النهائي»؟",
    "options": [
      "يقاس بعشرات إلى مئات ملايين السنين",
      "يزيد ارتفاع السلاسل الجبلية في التصادم",
      "يستعمل CO2 كمستقبل نهائي للإلكترونات في التنفس.",
      "ينتج سلسلة جبلية بعد غلق المحيط"
    ],
    "correctAnswerIndex": 3,
    "explanation": "التصادم النهائي يرتبط هنا بـ: ينتج سلسلة جبلية بعد غلق المحيط.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 497,
    "unitId": 11,
    "questionText": "في 11.5 — دورة ويلسون، أي علاقة صحيحة يبيّنها مصطلح «الأوفيوليت»؟",
    "options": [
      "بل ليثوسفير محيطية وبرنس علوي",
      "شاهد صخري على مرحلة محيطية سابقة",
      "تدل على بيئة محيطية قبل التصادم",
      "يدل على وسط صلب دائماً مهما كانت المعطيات الزلزالية."
    ],
    "correctAnswerIndex": 1,
    "explanation": "الأوفيوليت يرتبط هنا بـ: شاهد صخري على مرحلة محيطية سابقة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 498,
    "unitId": 11,
    "questionText": "في سؤال بكالوريا قصير حول 11.5 — دورة ويلسون، بماذا نربط «الشيست الأزرق»؟",
    "options": [
      "شاهد على محيط قديم أغلق",
      "محيط قديم أغلقت بقاياه لتكوين سلاسل ألبية",
      "الأوفيوليت قطعة من اللب الداخلي صعدت إلى السطح.",
      "شاهد على مرحلة الغوص في دورة ويلسون"
    ],
    "correctAnswerIndex": 3,
    "explanation": "الشيست الأزرق يرتبط هنا بـ: شاهد على مرحلة الغوص في دورة ويلسون.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 499,
    "unitId": 11,
    "questionText": "في محور 11.5 — دورة ويلسون، أي عبارة تساعد على تمييز «بانجيا» عن المفاهيم القريبة؟",
    "options": [
      "عروق تغذي البازلت على شكل قواطع",
      "اصطفاف بؤر زلزالية يحدد مستوى الصفيحة الغائصة",
      "يمثل مرحلة جيولوجية عميقة لا علاقة لها بالخلايا.",
      "قارة عظمى تفككت ضمن دورات قديمة"
    ],
    "correctAnswerIndex": 3,
    "explanation": "بانجيا يرتبط هنا بـ: قارة عظمى تفككت ضمن دورات قديمة.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  },
  {
    "id": 500,
    "unitId": 11,
    "questionText": "إذا طُلب تفسير «زمن الدورة» ضمن 11.5 — دورة ويلسون، فأي جواب هو الأدق؟",
    "options": [
      "تغوص الصفيحة المحيطية تحت القارية",
      "محيط قديم أغلقت بقاياه لتكوين سلاسل ألبية",
      "يقاس بعشرات إلى مئات ملايين السنين",
      "يدل على زيادة غير محدودة في السرعة دون إشباع."
    ],
    "correctAnswerIndex": 2,
    "explanation": "زمن الدورة يرتبط هنا بـ: يقاس بعشرات إلى مئات ملايين السنين.",
    "diagramUrl": "/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg"
  }
];

export const SVT_FLASHCARDS: Flashcard[] = SVT_QUIZ_QUESTIONS.map((question) => ({
  id: `fc_q_${question.id}`,
  unitId: question.unitId,
  question: question.questionText,
  answerBullets: [
    `**الإجابة الصحيحة:** ${question.options[question.correctAnswerIndex]}`,
    question.explanation
  ].filter(Boolean),
  ...(question.diagramUrl ? { diagramUrl: question.diagramUrl } : {})
}));
