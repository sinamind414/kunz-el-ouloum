// src/data/kunzDatabase.ts

// ==========================================
// INTERFACES (Structure des données)
// ==========================================
export interface ActiveLesson {
  id: string;
  title: string;
  blocks: Block[];
}

export type Block = TextAndProduceBlock | HotspotAndMethodologyBlock;

export interface TextAndProduceBlock {
  type: 'TEXT_AND_PRODUCE';
  objective: string;
  content: string;
  popups: Record<string, string>;
  microTest: {
    prompt: string;
    acceptedAnswers: string[];
    errorHint: string;
  };
}

export interface HotspotAndMethodologyBlock {
  type: 'HOTSPOT_AND_METHODOLOGY';
  objective: string;
  introText: string;
  schemaSrc: string;
  hotspot: {
    prompt: string;
    correctZone: { x: number; y: number; radius: number };
    successFeedback: string;
  };
  methodology: {
    prompt: string;
    steps: { label: string; placeholder: string; requiredKeywords: string[] }[];
  };
}

// ==========================================
// PILIER 1 & 4 : LEÇONS ACTIVES & SAVOIR PARTAGÉ
// Données extraites du Programme Officiel 2017 et purgées du hors-programme
// ==========================================

export const ActiveLesson_D1_U1_L2_Transcription: ActiveLesson = {
  id: 'd1-u1-l2-transcription',
  title: 'الاستنساخ وتدخل الإنزيم',
  blocks: [
    {
      type: 'TEXT_AND_PRODUCE',
      objective: 'إظهار دور إنزيم ARN بوليميراز',
      content: 'تتم عملية الاستنساخ في النواة بتدخل إنزيم نوعي يسمى [____] يرتبط بمنطقة بداية المورثة ليفك التفاف الجزء المعني من ADN.',
      popups: {
        'ARN بوليميراز': 'إنزيم نوعي يفك لولب ADN ويجمع النيكليوتيدات الريبية الحرة لتشكيل ARNm بالتكامل مع السلسلة الناسخة.'
      },
      microTest: {
        prompt: 'ما هو الإنزيم المسؤول عن عملية الاستنساخ؟',
        acceptedAnswers: ['ARN بوليميراز', 'ARN polymérase'],
        errorHint: 'إنزيم ARN بوليميراز هو المسؤول عن فك ADN وتركيب ARNm.'
      }
    },
    {
      type: 'HOTSPOT_AND_METHODOLOGY',
      objective: 'تحديد السلسلة الناسخة وتطبيق منهجية التحليل',
      introText: 'ينفك لولب الـ ADN بتدخل الإنزيم، وتنسخ المعلومة الوراثية انطلاقا من إحدى سلسلتي الـ ADN وتسمى السلسلة الناسخة، حسب مبدأ التكامل بين القواعد الآزوتية (A مع U، T مع A، C مع G، G مع C).',
      schemaSrc: '/assets/svt/d1_u1_l2_transcription_met.svg',
      hotspot: {
        prompt: 'انقر على الإنزيم المسؤول عن تركيب الـ ARNm في هذه الصورة (المجهر الإلكتروني).',
        correctZone: { x: 50, y: 50, radius: 15 },
        successFeedback: 'أحسنت! هذا هو إنزيم ARN بوليميراز، يلاحظ أنه يقرأ السلسلة الناسخة وتتفرع منه خيوط ARNm تزداد طولا كلما اتجهنا نحو نهاية المورثة.'
      },
      methodology: {
        prompt: 'بناءً على الوثيقة، حلل آلية الاستنساخ.',
        steps: [
          { 
            label: 'الملاحظة', 
            placeholder: 'تمثل الوثيقة... نلاحظ أن...', 
            requiredKeywords: ['تمركز', 'ARN بوليميراز', 'ADN'] 
          },
          { 
            label: 'الاستنتاج', 
            placeholder: 'ومنه نستنتج أن...', 
            requiredKeywords: ['السلسلة الناسخة', 'ARNm', 'التكامل'] 
          }
        ]
      }
    },
    {
      type: 'TEXT_AND_PRODUCE',
      objective: 'تحديد اتجاه الاستنساخ وقاعدة التكامل',
      content: 'يقرأ إنزيم ARN بوليميراز السلسلة الناسخة في الاتجاه 3′ ← 5′ ويركب خيط ARNm في الاتجاه 5′ ← 3′. تختلف القواعد الآزوتية في ARNm عن ADN باستبدال التايمين (T) باليوراسيل (U).',
      popups: {
        '3′ ← 5′': 'الاتجاه الذي يقرأ فيه الإنزيم السلسلة القالبية.',
        '5′ ← 3′': 'الاتجاه الذي يُبنى فيه خيط ARNm الجديد.'
      },
      microTest: {
        prompt: 'إذا كان تتابع قطعة من السلسلة الناسخة للـ ADN هو: 3′- T A C G A T -5′\nما هو تتابع قطعة ARNm الموافقة لها؟ (اكتب الحروف فقط مفصولة بمسافات)',
        acceptedAnswers: ['A U G C U A', 'AUG CUA', 'A U G C U A'],
        errorHint: 'القاعدة التكاملية: T تصبح A، A تصبح U، C تصبح G، G تصبح C. الإجابة: A U G C U A'
      }
    },
    {
      type: 'TEXT_AND_PRODUCE',
      objective: 'صياغة المشكل العلمي والتركيب',
      content: 'تتم عملية الاستنساخ في النواة وتنتج عنها جزيئة ARNm تحمل نسخة من المعلومة الوراثية، ثم تهاجر هذه الجزيئة نحو الهيولى.',
      popups: {},
      microTest: {
        prompt: 'صغ المشكل العلمي الذي يفسر انتقال المعلومة الوراثية من النواة إلى الهيولى (جملة استفهامية تبدأ بـ كيف وتنتهي بـ ؟).',
        acceptedAnswers: ['كيف', '؟'], 
        errorHint: 'يجب أن تبدأ بـ "كيف" وتنتهي بعلامة استفهام "؟". مثال: كيف تنتقل المعلومة الوراثية من النواة إلى مقر تركيب البروتين؟'
      }
    }
  ]
};

export const ActiveLesson_D1_U3_L1_Enzyme: ActiveLesson = {
  id: 'd1-u3-l1-enzyme',
  title: 'الإنزيمات والحفز (Enzymes et catalyse)',
  blocks: [
    {
      type: 'TEXT_AND_PRODUCE',
      objective: 'إظهار دور الإنزيم كحفاز بيولوجي نوعي',
      content: 'الإنزيم عبارة عن [____] نوعي يعمل كحفاز بيولوجي يخفض [____] اللازمة لانطلاق التفاعل دون أن يُستهلك، ويرتبط مع [____] وفق خاصية التكامل البنيوي على مستوى الموقع الفعال.',
      popups: {
        'بروتين': 'الإنزيمات في الغالب عبارة عن بروتينات (أحيانا بروتين-حمض نووي) تعطيها بنيتها الفراغية تخصصا وظيفيا.',
        'طاقة التنشيط': 'الطاقة الدنيا التي يجب توفيرها لانطلاق التفاعل الكيميائي.',
        'مادة التفاعل': 'الجزيئة التي يرتبط بها الإنزيم وتتحول إلى نواتج.',
      },
      microTest: {
        prompt: 'ما هو المصطلح الذي يدل على الطاقة الدنيا اللازمة لانطلاق التفاعل والتي يخفضها الإنزيم؟',
        acceptedAnswers: ['طاقة التنشيط', 'طاقة التفعيل'],
        errorHint: 'الإنزيم يخفض "طاقة التنشيط" (أو طاقة التفعيل) دون أن يُستهلك.'
      }
    },
    {
      type: 'TEXT_AND_PRODUCE',
      objective: 'فهم الموقع الفعال وخاصية التكامل البنيوي',
      content: 'يرتبط الإنزيم مع مادة التفاعل على مستوى [____] الذي يمتلك شكلا جيبيا يتكامل بنيويا مع مادة التفاعل. هذه الخاصية تفسر [____] الإنزيم (عمله على مادة تفاعل واحدة أو مجموعة قليلة).',
      popups: {
        'الموقع الفعال': 'جزء من الإنزيم ذو شكل جيبي يتكون من عدد محدود من الأحماض الأمينية، يرتبط مع مادة التفاعل وفق خاصية التكامل البنيوي.',
        'نوعية': 'خاصية الإنزيم في العمل على مادة تفاعل محددة فقط بفضل التكامل البنيوي.',
      },
      microTest: {
        prompt: 'أكمل: الإنزيم يعمل على مادة تفاعل واحدة بفضل خاصية تسمى _______',
        acceptedAnswers: ['نوعية', 'النوعية', 'التكامل البنيوي'],
        errorHint: 'الإجابة الصحيحة: النوعية (عبر التكامل البنيوي على الموقع الفعال).'
      }
    },
    {
      type: 'TEXT_AND_PRODUCE',
      objective: 'ربط العامل الأنزيمي بالوسط (pH و الحرارة)',
      content: 'لكل إنزيم [____] مثلى تسمح بتكامل بنيوي أمثل، وتتغير هذه القيمة حسب الوسط (pH و الحرارة). تجاوز الحرارة المثلى يؤدي إلى [____] البنية الفراغية وفقدان النشاط.',
      popups: {
        'درجة حرارة': 'لكل إنزيم درجة حرارة مثلى تتغير عندها سرعة التفاعل بشكل أقصى.',
        'تبديل': 'فقدان البنية الفراغية للبروتين عند الحرارة العالية فيفقد الإنزيم نشاطه.',
      },
      microTest: {
        prompt: 'ماذا يحدث لبنية الإنزيم عند تجاوز درجة الحرارة المثلى؟',
        acceptedAnswers: ['تبديل', 'تشوه', 'فقدان النشاط', 'ينفقد النشاط'],
        errorHint: 'الحرارة المفرطة تؤدي إلى "تبديل" (dénaturation) البنية الفراغية وفقدان النشاط.'
      }
    },
    {
      type: 'TEXT_AND_PRODUCE',
      objective: 'صياغة المشكل العلمي وإعادة الاستثمار',
      content: 'يظل الإنزيم حفازا دون أن يُستهلك، فيسرّع التفاعل ويحافظ على توازن الوسط الخلوي.',
      popups: {},
      microTest: {
        prompt: 'صغ المشكل العلمي الذي يفسر كيف يسرّع الإنزيم التفاعل دون أن يُستهلك (جملة استفهامية تبدأ بـ كيف وتنتهي بـ ؟).',
        acceptedAnswers: ['كيف', '؟'],
        errorHint: 'يجب أن تبدأ بـ "كيف" وتنتهي بعلامة استفهام "؟". مثال: كيف يخفض الإنزيم طاقة التنشيط دون أن يُستهلك؟'
      }
    }
  ]
};

export const ActiveLesson_D1_U1_L3_Traduction: ActiveLesson = {
  id: 'd1-u1-l3-traduction',
  title: 'الترجمة والشفرة الوراثية',
  blocks: [
    {
      type: 'TEXT_AND_PRODUCE',
      objective: 'فهم الشفرة الوراثية والرامزة',
      content: 'لترجمة اللغة النووية (4 قواعد) إلى لغة بروتينية (20 حمض أميني)، تعتمد الخلية على وحدة رمزية تسمى [____] وهي ثلاثية من القواعد الآزوتية المتتالية على ARNm تشفر لحمض أميني واحد.',
      popups: {
        'الرامزة': 'ثلاثية من القواعد الآزوتية على ARNm (مثل AUG, UUU) تشفر لحمض أميني محدد. توجد 64 رامزة.'
      },
      microTest: {
        prompt: 'إذا علمت أن جزيء ARNm يحتوي على 300 نيكليوتيدة تشفر لبروتين وظيفي، احسب عدد الأحماض الأمينية في هذا البروتين (مع خصم رامزة التوقف).',
        acceptedAnswers: ['99', '100'], 
        errorHint: 'كل 3 نيكليوتيدات = رامزة = حمض أميني. 300 ÷ 3 = 100 رامزة. نطرح رامزة التوقف التي لا تشفر لحمض أميني = 99 حمض أميني.'
      }
    },
    {
      type: 'HOTSPOT_AND_METHODOLOGY',
      objective: 'إظهار دور الريبوزوم وتطبيق منهجية التحليل',
      introText: 'تتم الترجمة على مستوى عضيات خلوية تسمى الريبوزومات. يتكون الريبوزوم من تحت وحدتين وتحتضن ARNm لتركيب السلسلة الببتيدية. تتطلب هذه العملية تدخل ARNt الناقل للأحماض الأمينية.',
      schemaSrc: '/assets/svt/d1_u1_l3_traduction_ribosome.svg',
      hotspot: {
        prompt: 'انقر على الموقع الذي يحمل الحمض الأميني الجديد القادم مع ARNt (الموقع A).',
        correctZone: { x: 35, y: 40, radius: 12 },
        successFeedback: 'أحسنت! الموقع A هو موقع دخول الحمض الأميني الجديد محمولا على ARNt الذي يحمل الرامزة المضادة.'
      },
      methodology: {
        prompt: 'حلل وثيقة آلية الترجمة.',
        steps: [
          { 
            label: 'الملاحظة', 
            placeholder: 'تمثل الوثيقة... نلاحظ أن...', 
            requiredKeywords: ['ريبوزوم', 'ARNm', 'ARNt'] 
          },
          { 
            label: 'الاستنتاج', 
            placeholder: 'ومنه نستنتج أن...', 
            requiredKeywords: ['رابطة ببتيدية', 'الشفرة الوراثية', 'تتالي'] 
          }
        ]
      }
    },
    {
      type: 'TEXT_AND_PRODUCE',
      objective: 'فهم دور ARNt والرامزات المحددة',
      content: 'يتعرف كل ARNt على الرامزة الموافقة له على ARNm بواسطة ثلاثية تسمى الرامزة المضادة. تبدأ الترجمة دائما عند الرامزة AUG التي تشفر للميثيونين، وتنتهي عند إحدى رامزات التوقف (UAA, UAG, UGA) التي لا تشفر لأي حمض أميني.',
      popups: {
        'الرامزة المضادة': 'ثلاثية القواعد الآزوتية المتواجدة على ARNt، وهي مكملة للرامزة المتواجدة على ARNm.'
      },
      microTest: {
        prompt: 'إذا كانت الرامزة على ARNm هي UUU، وما نعرفه أن UUU تشفر لحمض الفينيل ألانين. ما هي الرامزة المضادة على ARNt الموافقة؟',
        acceptedAnswers: ['AAA'],
        errorHint: 'الرامزة المضادة تتكامل مع رامزة ARNm. U يرتبط بـ A. إذن UUU توافقها AAA على ARNt.'
      }
    },
    {
      type: 'TEXT_AND_PRODUCE',
      objective: 'إعادة استثمار المكتسبات في نص علمي',
      content: 'بعد انتهاء الترجمة، تنفصل السلسلة الببتيدية وتكتسب بنية فراغية لتصبح بروتينا وظيفيا.',
      popups: {},
      microTest: {
        prompt: 'اكتب جملة واحدة تلخص فيها الفرق بين الاستنساخ والترجمة من حيث المقر والنتيجة. (استعمل الكلمات: النواة، الهيولى، ARNm، بروتين).',
        acceptedAnswers: ['النواة', 'ARNm', 'الهيولى', 'بروتين'], 
        errorHint: 'الاستنساخ يحدث في النواة وينتج ARNm، بينما الترجمة تحدث في الهيولى وتنتج بروتينا.'
      }
    }
  ]
};

// ==========================================
// PILIER 2 : RÈGLES DU CORRECTEUR MINISTÉRIEL
// Basées sur le livre de méthodologie de la major de promo (18.62 BAC)
// ==========================================

export const MethodologyRules = {
  // Mots interdits pendant la phase "تحليل" (Analyse pure)
  analysisForbiddenWords: ['لأن', 'بسبب', 'راجع إلى', 'وذلك راجع', 'نظرا ل'],
  
  // Vocabulaire actif exigé pendant la phase "تحليل" au lieu de passif
  analysisActiveVocabulary: ['تزايد', 'تناقص', 'انعدام', 'ثبات', 'قيمة أعظمية', 'قيمة دنيا'],
  analysisPassiveVocabularyBanned: ['يرتفع', 'ينخفض', 'يصعد', 'ينزل'],

  // Mots interdits pour صياغة الفرضية (Hypothèse)
  hypothesisForbiddenWords: ['ربما'],
  hypothesisRequiredLinks: ['يعود السبب إلى', 'بسبب', 'نتيجة ل', 'يرجع إلى'],

  // Règles du Texte Scientifique (نص علمي)
  scientificTextRules: {
    introMustEndWith: '؟',
    introMustStartWith: ['كيف', 'لماذا', 'أين', 'متى', 'ما هو', 'ما هي'],
    conclusionMaxLength: 150, // La conclusion doit être brève
  },

  // Erreurs méthodologiques fréquentes à pénaliser
  commonErrors: {
    analysisContainsInterpretation: '⚠️ خطأ منهجي: التحليل ملاحظة محضة. احذف التفسير (لأن/راجع إلى) واكتف بوصف ما تلاحظ.',
    hypothesisNotScientific: '⚠️ خطأ منهجي: تجنب استعمال "ربما". استعمل لغة علمية أكيدة مثل "يعود السبب إلى".',
    introProblemNotFormatted: '⚠️ خطأ منهجي: المشكل العلمي يجب أن يبدأ بأداة استفهام (كيف/لماذا) وينتهي بعلامة استفهام (؟).',
  }
};

// ==========================================
// PILIER 3 : LE COACH OFFLINE & TEASER PRO
// ==========================================

export const CoachConfig = {
  // État initial de l'élève au premier lancement de l'app
  initialUserProgress: {
    xp: 0,
    streak: 0,
    weakPoints: [],
    masteredConcepts: [],
    methodologyScore: 0,
  },

  // Messages d'orientation du Coach
  coachMessages: {
    weakPointDetected: '🔴 نقطة ضعفك: {concept}. ارتكبت {count} أخطاء في الإنتاج. اضغط هنا لمراجعة الدرس.',
    masteredConcept: '🟢 أنت جاهز في: {concept}. استمر!',
    diagnosticTest: 'إجراء اختبار تشخيصي شامل لمعرفة مستواك في المجالات الثلاثة.',
  },

  // Le Teaser Pro (Déclenché si methodologyScore >= 70)
  proTeaser: {
    triggerScore: 70,
    title: 'أحسنت! لقد أتقنت المنطق العلمي محلياً',
    message: 'التطبيق يوفر لك 90% من الزاد المعرفي والمنهجي. لكن في البكالوريا، ستحل نصا كاملا مع سلم تنقيط وزاري. جرّب Kunz Pro لمحاكاة حقيقية.',
    ctaText: 'اكتشف Kunz Pro — 3 مواضيع BAC مصححة بالذكاء الاصطناعي'
  }
};

// ==========================================
// PILIER 4 : BASE DE CONNAISSANCES "MOTS SACRÉS"
// Termes extraits du programme DZ (Lexique officiel strict)
// ==========================================

export const KnowledgeCards = [
  // Domaine 1 - Unité 1
  { id: 'kc_1', term: 'الاستنساخ', definition: 'ظاهرة حيوية تحدث على مستوى النواة، يتم فيها تركيب جزيئة ARNm انطلاقا من إحدى سلسلتي ADN (السلسلة الناسخة) حسب مبدأ تكامل القواعد الآزوتية.', unitId: 1 },
  { id: 'kc_2', term: 'ARN بوليميراز', definition: 'إنزيم نوعي يفك لولب ADN ويجمع النيكليوتيدات الريبية الحرة لتشكيل ARNm.', unitId: 1 },
  { id: 'kc_3', term: 'السلسلة الناسخة', definition: 'إحدى سلسلتي ADN التي يقرأها إنزيم ARN بوليميراز لصنع ARNm بالتكامل.', unitId: 1 },
  { id: 'kc_4', term: 'الترجمة', definition: 'آلية حيوية تحدث على مستوى الريبوزومات في الهيولى، يتم فيها ترجمة الرسالة الوراثية المشفرة في ARNm إلى متتالية أحماض أمينية.', unitId: 1 },
  { id: 'kc_5', term: 'الرامزة', definition: 'ثلاثية من القواعد الآزوتية المتتالية على ARNm تشفر لحمض أميني واحد.', unitId: 1 },
  { id: 'kc_6', term: 'الشفرة الوراثية', definition: 'قاموس يترجم اللغة النووية (4 قواعد) إلى لغة بروتينية (20 حمض أميني). تتكون من 64 رامزة.', unitId: 1 },
  
  // Domaine 1 - Unité 2
  { id: 'kc_7', term: 'البنية الفراغية', definition: 'شكل ثلاثي الأبعاد ثابت ومستقر يكسب البروتين تخصصا وظيفيا، ينتج عن ارتباط الأحماض الأمينية بروابط محددة.', unitId: 2 },
  { id: 'kc_8', term: 'الموقع الفعال', definition: 'جزء من الإنزيم ذو شكل جيبي يتكون من عدد محدود من الأحماض الأمينية، يرتبط مع مادة التفاعل وفق خاصية التكامل البنيوي.', unitId: 2 },
  { id: 'kc_9', term: 'الخاصية الحمقلية', definition: 'خاصية فيزيوكيميائية للأحماض الأمينية، تسلك سلوك حمض في وسط قاعدي وسلوك قاعدة في وسط حامضي.', unitId: 2 },
  
  // Domaine 1 - Unité 4
  { id: 'kc_10', term: 'معقد التوافق النسيجي CMH', definition: 'مجموعة من المورثات تشرف على إنتاج بروتينات غشائية محددة للذات (HLA عند الإنسان)، تمثل الهوية البيولوجية للفرد.', unitId: 4 },
  { id: 'kc_11', term: 'الانتقاء النسيلي', definition: 'عملية تختار فيها الخلايا اللمفاوية (LB أو LT) التي تحمل مستقبلات غشائية متكاملة بنيويا مع محددات المستضد لتتكاثر وتتمايز.', unitId: 4 },
  
  // Domaine 1 - Unité 5
  { id: 'kc_12', term: 'كمون الراحة', definition: 'الحالة الفيزيولوجية لليف العصبي في غياب التنبيه، وهو حالة استقطاب ناتج عن التوزع غير المتساوي لشوارد الصوديوم والبوتاسيوم.', unitId: 5 },
  { id: 'kc_13', term: 'المشبك', definition: 'منطقة تمفصل تعمل على نقل الإشارات الكهربائية بين النهايات التفرعية لعصبون والجسم الخلوي لعصبون آخر أو ليف عضلي.', unitId: 5 },
];
