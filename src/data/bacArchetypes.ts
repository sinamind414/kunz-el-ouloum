// bacArchetypes.ts — les FORMES qui reviennent d'une session à l'autre
// (sprint 19).
//
// Pourquoi ce fichier existe
// --------------------------
// `bacSessionIndex.ts` répond à « qu'est-ce qui est tombé ? ». Mais un élève
// qui révise 47 exercices un par un révise 47 fois. Or l'ONEC ne réinvente pas
// l'épreuve chaque année : il rejoue un petit nombre de MONTAGES, en changeant
// la molécule, l'organisme et la maladie.
//
// Exemple : « 3-NOP » (2022), « quercétine » (2023), « CA1P » (2024),
// « célécoxib » (2020) et « méthylthéobromine » (2025) sont cinq habillages
// d'un seul et même montage — une molécule qui ressemble à la substrat et
// occupe le site actif. L'élève qui a compris le montage traite les cinq ;
// celui qui a appris les cinq molécules n'en traite aucune de plus.
//
// Ce module ne contient AUCUN contenu d'examen nouveau : chaque archétype est
// une lecture transversale d'exercices réellement tombés, dont les
// identifiants sont cités et vérifiés par `bacArchetypes.lock.test.ts`.
//
// Les champs répondent à trois questions, dans l'ordre où l'élève se les pose :
//   1. `signalsAr` — à quoi je le reconnais dans l'énoncé ?
//   2. `methodAr`  — qu'est-ce que je fais, dans quel ordre ?
//   3. `trapAr`    — où perd-on les points chaque année ?

import { BAC_IDEAS, IDEA_BY_ID, type BacExerciseIdea } from './bacSessionIndex';

export interface BacArchetype {
  id: string;
  /** Nom du montage, tel qu'un professeur le nommerait au tableau. */
  titleAr: string;
  /** Ce que le montage demande, en une phrase. */
  definitionAr: string;
  /** Indices qui permettent de le reconnaître dès la lecture de l'énoncé. */
  signalsAr: string[];
  /** La marche à suivre, dans l'ordre. */
  methodAr: string[];
  /** L'erreur qui coûte des points, année après année. */
  trapAr: string;
  /** Exercices réels de `bacSessionIndex.ts` relevant de ce montage. */
  ideaIds: string[];
}

export const BAC_ARCHETYPES: BacArchetype[] = [
  {
    id: 'arch_inhibiteur_sosie',
    titleAr: 'الجزيئة الشبيهة بالركيزة',
    definitionAr:
      'مادة تشبه الركيزة في بنيتها الفراغية فتحتل الموقع الفعال مكانها، فينخفض النشاط الأنزيمي دون أن يُخرَّب الأنزيم.',
    signalsAr: [
      'الوثيقة تعطي نمذجة للموقع الفعال مع الركيزة ثم مع المادة المدروسة',
      'منحنى النشاط بدلالة تركيز المادة ينخفض تدريجياً و لا ينعدم فجأة',
      'تُذكر جذور أحماض أمينية بأرقامها (His215، Ser264، Tyr333…)',
    ],
    methodAr: [
      'قارن البنية الفراغية للمادة بالركيزة: أي مجموعة وظيفية مشتركة؟',
      'حدّد هل الارتباط على الموقع الفعال (تنافسي) أم على موقع آخر (غير تنافسي)',
      'استغل المنحنى: إذا عاد النشاط إلى Vmax برفع تركيز الركيزة فالتثبيط تنافسي',
      'اربط النتيجة بالأثر البيولوجي المطلوب (علاج، مبيد، تقليل انبعاث…)',
    ],
    trapAr:
      'الخلط بين « يشبه الركيزة » و « يخرّب الأنزيم »: المثبّط التنافسي لا يغيّر بنية الأنزيم، و رفع تركيز الركيزة يلغي أثره.',
    ideaIds: ['bac2018_s2_e2', 
      'bac2020_s1_e2',
      'bac2022_s2_e3',
      'bac2023_s1_e2',
      'bac2023_s1_e3',
      'bac2024_s2_e2',
      'bac2025_s1_e3',
      'bac2025_s2_e2',
    ],
  },
  {
    id: 'arch_niveau_intervention',
    titleAr: 'على أي مستوى تتدخّل هذه المادة؟',
    definitionAr:
      'دواء أو سمّ يوقف تركيب البروتين، و السؤال الحقيقي ليس « هل يوقفه » بل « أين بالضبط »: الاستنساخ أم الترجمة؟',
    signalsAr: [
      'أوساط تجريبية تختلف بعنصر واحد: مع ARNm جاهز أو دونه، مع ريبوزومات أو دونها',
      'عناصر مشعة مختلفة: يوريدين/تيميدين يقيس النسخ، لوسين/فينيل ألانين يقيس الترجمة',
      'ARNm اصطناعي (متعدد اليوراسيل) يُستعمل شاهداً',
    ],
    methodAr: [
      'صنّف كل وسط: ما العنصر الوحيد الذي يفرّقه عن الشاهد؟',
      'اربط كل جزيء مشع بالمرحلة التي يقيسها',
      'الوسط الذي يحتوي ARNm جاهزاً و يبقى فعالاً رغم المادة ⇒ التثبيط قبل الترجمة',
      'اقترح المستوى ثم صادق عليه بنتيجة تجريبية، لا بالمنطق وحده',
    ],
    trapAr:
      'الإجابة « يثبّط تركيب البروتين » دون تحديد المرحلة: التصحيح لا يمنح النقطة إلا على المستوى المحدَّد بدليل تجريبي.',
    ideaIds: ['bac2017_s1_e1', 
      'bac2019_s2_e3',
      'bac2020_s2_e2',
      'bac2022_s1_e3',
      'bac2022_s2_e2',
      'bac2023_s1_e2',
      'bac2024_s2_e1',
      'bac2025_s1_e1',
    ],
  },
  {
    id: 'arch_canal_detourne',
    titleAr: 'سمّ أو مادة تعطّل قناة أيونية',
    definitionAr:
      'مادة خارجية تفتح قناة أو تبقيها مفتوحة أو تغلقها، فيختلّ الكمون الغشائي و معه الرسالة العصبية.',
    signalsAr: [
      'تسجيل الكمون الغشائي في وجود و غياب المادة',
      'تقنية Patch clamp على جزء من الغشاء تحت كمون مفروض',
      'ذكر قناة باسمها: قناة Na⁺ فولطية، قناة Cl⁻، مستقبل GABA، ASIC1a',
    ],
    methodAr: [
      'حدّد الكمون المسجَّل: راحة، عمل، PPSE أم PPSI؟',
      'استخرج من المنحنى المرحلة المتأثرة (إزالة الاستقطاب، عودة الاستقطاب، السعة، التواتر)',
      'استنتج الشاردة المعنية ثم القناة المسؤولة عنها',
      'اربط بالأثر الفيزيولوجي: تقلص دائم، ارتخاء، ألم، موت الخلية',
    ],
    trapAr:
      'نسيان أن اتجاه دخول الشاردة يتوقّف على تدرّج التركيز لا على القناة وحدها — خطأ سنة 2020 مع شوارد الكلور عند المولود.',
    ideaIds: ['bac2017_s2_e2', 'bac2018_s1_e1', 
      'bac2019_s2_e2',
      'bac2020_s2_e3',
      'bac2021_s2_e3',
      'bac2022_s1_e2',
      'bac2022_s2_e1',
      'bac2023_s1_e1',
      'bac2024_s1_e2',
      'bac2026_s2_e2',
    ],
  },
  {
    id: 'arch_echappement_immunitaire',
    titleAr: 'كيف يفلت العامل الممرض أو الورم من المناعة؟',
    definitionAr:
      'الجهاز المناعي سليم، و مع ذلك يفشل: الخلل في العرض المستضدي أو في تعطيل وسيط أو في منع تشكّل المعقد المناعي.',
    signalsAr: [
      'مقارنة بين حالة « حديثة » تُقاوَم و حالة « متقدمة » تفلت',
      'أجسام مضادة مفلورة لتتبّع HLA I أو الببتيد المستضدي',
      'ذكر بروتين يحمل اسماً غريباً يرتبط بالجسم المضاد أو بالمستقبل (SPA، gp120)',
    ],
    methodAr: [
      'حدّد أولاً الاستجابة المتوقّعة في الحالة السليمة (خلطية أم خلوية؟)',
      'ابحث عن الحلقة المفقودة: عرض؟ تعرّف؟ تعاون؟ تنفيذ؟',
      'صغ فرضيتين متمايزتين ثم ارجع إلى الوثيقة التي تفصل بينهما',
      'اختم بمخطط للاستجابة يُظهر مكان القطع',
    ],
    trapAr:
      'سرد مراحل الاستجابة المناعية كاملة بدل الإجابة عن السؤال: أين انقطعت السلسلة؟',
    ideaIds: [
      'bac2019_s1_e3',
      'bac2021_s1_e3',
      'bac2024_s1_e1',
      'bac2024_s2_e3',
      'bac2026_s2_e3',
    ],
  },
  {
    id: 'arch_anticorps_outil',
    titleAr: 'الجسم المضاد كأداة علاجية',
    definitionAr:
      'استغلال نوعية الارتباط جسم مضاد/مستضد لتوجيه علاج نحو خلية هدف — أو فهم لماذا فشل هذا التوجيه.',
    signalsAr: [
      'جسم مضاد مصنَّع مخبرياً باسم تجاري (Trastuzumab، ATAC، ATV-Aβ)',
      'مقارنة حجم الورم أو عدد الخلايا قبل و بعد المعالجة بتراكيز متزايدة',
      'نمذجة لبنية الجسم المضاد مع إشارة إلى الجزء المتغيّر و الجزء الثابت',
    ],
    methodAr: [
      'حدّد المستضد المستهدف و أين يوجد بالضبط (غشاء، وسط، نسيج غير متاح)',
      'اقرأ منحنى الجرعة/الأثر: هل الأثر متناسب مع التركيز؟',
      'ميّز بين « يتعرّف » و « يصل » و « يُفعّل البلعمة »: الفشل قد يكون في أي منها',
      'برّر الاختيار العلاجي بنتيجة رقمية لا بعبارة عامة',
    ],
    trapAr:
      'افتراض أن الارتباط النوعي يكفي: سنة 2026 كان الجسم المضاد يتعرّف جيداً و يعجز عن العبور إلى المخ.',
    ideaIds: ['bac2020_s1_e3', 'bac2022_s2_e2', 'bac2024_s2_e3', 'bac2026_s2_e3'],
  },
  {
    id: 'arch_mutation_phenotype',
    titleAr: 'من الطفرة إلى الظاهرة',
    definitionAr:
      'تغيّر في تتابع النيكليوتيدات ⟶ تغيّر في حمض أميني ⟶ تغيّر في البنية الفراغية ⟶ فقدان الوظيفة، أو العكس.',
    signalsAr: [
      'نافذة Anagène أو تتابع ثلاثيات مع جدول الشفرة الوراثية',
      'سلالات طافرة مقارَنة بسلالة طبيعية، مع قياس Vmax أو نشاط أو نسبة تعبير',
      'ذكر مورثة باسمها (Scn1a، Lam3، P53، SOD)',
    ],
    methodAr: [
      'اقرأ التتابع في الاتجاه الصحيح و استعمل جدول الشفرة بدقّة',
      'سمِّ نوع الطفرة: استبدال، إضافة، حذف — و بيّن أثرها على الإطار',
      'اربط الحمض الأميني المتغيّر بموقعه: هل هو من أحماض الموقع الفعال؟',
      'اختم بالظاهرة المرضية، لا بالطفرة وحدها',
    ],
    trapAr:
      'اعتبار كل طفرة ضارة: طفرات 2019 على أحماض خارج الموقع الفعال أبقت النشاط شبه كامل، و طفرة 2022 كانت مفيدة علاجياً.',
    ideaIds: ['bac2017_s2_e3', 'bac2018_s1_e2', 
      'bac2019_s1_e2',
      'bac2021_s2_e2',
      'bac2022_s1_e3',
      'bac2023_s2_e1',
      'bac2024_s1_e2',
      'bac2024_s1_e3',
      'bac2025_s2_e2',
    ],
  },
  {
    id: 'arch_mibide_photosynthese',
    titleAr: 'مبيد يقطع سلسلة التركيب الضوئي',
    definitionAr:
      'مادة توقف نقل الإلكترونات أو تثبيت CO₂، و الوثائق تطلب تحديد النقطة المقطوعة بالضبط.',
    signalsAr: [
      'مؤشرات غير مباشرة: DCPIP، شدة الفلورة، امتصاص CO₂، طرح O₂، pH داخل/خارج التيلاكوئيد',
      'تناوب فترات ضوء و ظلام',
      'سند مرفق يذكّر بمخطط انتقال الإلكترونات (PSII، Q_B، PSI)',
    ],
    methodAr: [
      'ميّز أولاً المرحلة: كيموضوئية (ضوء، ماء، O₂) أم كيميائية (CO₂، Rudip)',
      'اربط كل مؤشر بما يقيسه فعلاً: الفلورة = طاقة لم تُحوَّل، DCPIP = مستقبل إلكترونات اصطناعي',
      'حدّد الناقل المتأثر ثم موقعه في السلسلة',
      'أنجز المخطط الوظيفي مع سهم التوقّف في مكانه الصحيح',
    ],
    trapAr:
      'الخلط بين توقف المرحلة الكيموضوئية و توقف حلقة كالفن: نقص NADPH و ATP يوقف الثانية بشكل غير مباشر.',
    ideaIds: ['bac2017_s1_e3', 
      'bac2023_s2_e3',
      'bac2024_s2_e2',
      'bac2025_s1_e2',
      'bac2026_s1_e3',
      'bac2026_s2_e1',
    ],
  },
  {
    id: 'arch_structure_fonction',
    titleAr: 'البنية الفراغية شرط الوظيفة',
    definitionAr:
      'عامل من الوسط (pH، حرارة، يوريا، جذر حر) يخرّب الروابط الضعيفة أو الجسور، فتضيع الوظيفة دون تغيّر التتابع.',
    signalsAr: [
      'تغيير عامل من الوسط و قياس النشاط أو قدرة الارتباط',
      'ذكر الجسور ثنائية الكبريت، الروابط الهيدروجينية، الشاردية، الكارهة للماء',
      'مواد مخرّبة للبنية: اليوريا، β-mercaptoéthanol، جذر الهيدروكسيل',
    ],
    methodAr: [
      'حدّد المستوى البنيوي المستهدف و الرابطة المسؤولة عنه',
      'ميّز بين تغيّر عكوس (pH) و تخريب نهائي (كسر الجسور)',
      'اربط ضياع البنية بضياع التكامل مع الركيزة أو الجزيء الهدف',
      'اختم بالعلاقة العامة: التتابع ⟶ البنية الفراغية ⟶ الوظيفة',
    ],
    trapAr:
      'القول إن الأنزيم « مات »: البنية الأولية تبقى سليمة، و التخريب يصيب البنية الفراغية وحدها.',
    ideaIds: ['bac2018_s1_e2', 
      'bac2019_s1_e2',
      'bac2021_s1_e1',
      'bac2021_s1_e2',
      'bac2023_s2_e2',
      'bac2026_s1_e1',
      'bac2026_s1_e2',
    ],
  },
  {
    id: 'arch_bilan_energetique',
    titleAr: 'تتبّع الحصيلة الطاقوية',
    definitionAr:
      'متابعة مسار الهدم خطوة بخطوة: أين يُنتَج الـ ATP، بأي كمية، و ما الذي يتوقف إذا انقطعت حلقة واحدة.',
    signalsAr: [
      'قياس استهلاك O₂ أو إنتاج ATP بدلالة الزمن في معلق ميتوكوندريات',
      'مراحل مرقّمة لمسار الهدم يُطلب تحديد مقر كل منها',
      'مادة تعطّل ناقلاً أو مضخة (سيانور، 2-DG، نقص المرافق Q10)',
    ],
    methodAr: [
      'حدّد المرحلة و مقرّها: الهيولى أم المادة الأساسية أم الغشاء الداخلي؟',
      'اربط كل مرحلة بحصيلتها: ATP مباشر، نواقل مرجعة، CO₂ مطروح',
      'تتبّع أثر التعطيل في اتجاه واحد: ناقل ⟶ تدرّج البروتونات ⟶ ATP ⟶ الوظيفة',
      'اختم بالحصيلة الإجمالية بالأرقام الرسمية',
    ],
    trapAr:
      'الخلط بين الـ ATP المنتَج مباشرة (الفسفرة على مستوى الركيزة) و الـ ATP الناتج عن أكسدة النواقل: السؤال يميّز بينهما دائماً.',
    ideaIds: ['bac2017_s2_e1', 'bac2018_s1_e3', 'bac2022_s2_e1', 'bac2025_s2_e1'],
  },
  {
    id: 'arch_tracage_isotopique',
    titleAr: 'التتبّع بالنظائر المشعّة',
    definitionAr:
      'استعمال ذرة أو جزيء موسوم لتحديد مصدر منتوج أو المرحلة التي تستهلكه — الإشعاع يتكلّم مكان الملاحظة.',
    signalsAr: [
      'نسبة ¹⁸O/¹⁶O، أو تيميدين/لوسين مشع، أو ¹⁴CO₂',
      'وسطان متماثلان لا يختلفان إلا في الجزيء الموسوم',
      'قياس « نسبة الإدماج » أو « شدة الإشعاع » بدلالة الزمن أو التركيز',
    ],
    methodAr: [
      'اسأل أولاً: ما الجزيء الموسوم، و أين نبحث عن الوسم بعد التجربة؟',
      'قارن الوسطين المتماثلين: الفرق الوحيد هو مصدر الاستنتاج',
      'اربط كل واسم بالعملية التي يقيسها (تيميدين = تضاعف/نسخ، لوسين = ترجمة)',
      'اكتب الاستنتاج بمعادلة كيميائية عند الإمكان',
    ],
    trapAr:
      'نسب الوسم إلى المنتوج النهائي دون التأكد من مساره: في تجربة 2018، الأكسجين المطروح يحمل وسم الماء لا وسم HCO₃⁻.',
    ideaIds: ['bac2017_s1_e3', 'bac2018_s2_e3', 'bac2020_s2_e2', 'bac2025_s1_e2'],
  },
  {
    id: 'arch_marqueurs_du_soi',
    titleAr: 'محدّدات الذات: من الغشاء إلى الزمرة الدموية',
    definitionAr:
      'تحديد الذات يقوم على جزيئات غشائية دقيقة (CMH، سكريات الزمر) — و السؤال يدور حول ما يقبله الجسم و ما يرفضه.',
    signalsAr: [
      'رسم تخطيطي لجزء من الغشاء الهيولي مع بروتينات و مجموعات سكرية',
      'خلايا عارضة و لمفاويات مرقّمة يُطلب التعرّف عليها',
      'نقل دم، زرع عضو، أو معالجة مستضد بأنزيم يحذف سكراً طرفياً',
    ],
    methodAr: [
      'سمِّ الجزيئة الحاملة للمحدّد: بروتين CMH؟ سكر طرفي؟ ببتيد مستضدي معروض؟',
      'ميّز CMH I (كل الخلايا ذات النواة، اللمفاويات T8) عن CMH II (الخلايا العارضة، اللمفاويات T4)',
      'اربط المحدّد بنمط الاستجابة أو بالتوافق/الرفض',
      'برّر بالنتيجة التجريبية (تراص، انحلال، معقدات) لا بالقاعدة وحدها',
    ],
    trapAr:
      'الخلط بين محدّدات الزمر ABO (سكريات، أجسام مضادة طبيعية) و محدّدات CMH (بروتينات، تعرّف خلوي).',
    ideaIds: ['bac2017_s1_e2', 'bac2020_s2_e1', 'bac2022_s1_e1', 'bac2025_s2_e3', 'bac2019_s1_e3', 'bac2018_s2_e1'],
  },
  {
    id: 'arch_lecture_geologique',
    titleAr: 'قراءة وثيقة جيولوجية',
    definitionAr:
      'وثيقة بنيوية (مقطع، نموذج، معطيات زلزالية) يُطلب تسمية بياناتها ثم استثمارها في نص علمي.',
    signalsAr: [
      'بيانات مرقمة على مقطع أو نموذج',
      'معطيات زلزالية أو حرارة/ضغط مع ملاحظة عن شروط الانصهار',
      'التمرين الأول من 5 نقاط، بصيغة « تعرّف ثم اشرح »',
    ],
    methodAr: [
      'سمِّ كل بيان بمصطلحه الدقيق قبل أي شرح',
      'استخرج الشرط الفيزيائي المحدِّد (ضغط، حرارة، تميّه)',
      'اربط الظاهرة بموقعها التكتوني: تباعد أم تقارب',
      'اكتب النص العلمي بمقدمة و عرض و خاتمة كما يطلب السلّم',
    ],
    trapAr:
      'نسب انصهار البيريدوتيت في الظهرة إلى ارتفاع الحرارة: السبب هو انخفاض الضغط عند الصعود.',
    ideaIds: ['bac2019_s1_e1', 'bac2019_s2_e1', 'bac2020_s1_e1'],
  },
];

export const ARCHETYPE_BY_ID: Record<string, BacArchetype> = Object.fromEntries(
  BAC_ARCHETYPES.map((a) => [a.id, a]),
);

/** Les exercices réels d'un archétype, du plus récent au plus ancien. */
export function ideasOfArchetype(archetypeId: string): BacExerciseIdea[] {
  const arch = ARCHETYPE_BY_ID[archetypeId];
  if (!arch) return [];
  return arch.ideaIds
    .map((id) => IDEA_BY_ID[id])
    .filter((i): i is BacExerciseIdea => Boolean(i))
    .sort((a, b) => b.year - a.year || a.sujet - b.sujet || a.exercice - b.exercice);
}

/** Les montages auxquels appartient un exercice (souvent plus d'un). */
export function archetypesForIdea(ideaId: string): BacArchetype[] {
  return BAC_ARCHETYPES.filter((a) => a.ideaIds.includes(ideaId));
}

/** Sessions couvertes par un archétype, décroissant. */
export function yearsOfArchetype(archetypeId: string): number[] {
  return Array.from(new Set(ideasOfArchetype(archetypeId).map((i) => i.year))).sort(
    (a, b) => b - a,
  );
}

/**
 * Récurrence des montages : combien d'exercices, sur combien de sessions, et
 * quel total de points. C'est le classement qui dit par quoi commencer.
 */
export function archetypeRecurrence(): {
  archetypeId: string;
  titleAr: string;
  exercices: number;
  sessions: number;
  points: number;
}[] {
  return BAC_ARCHETYPES.map((a) => {
    const ideas = ideasOfArchetype(a.id);
    return {
      archetypeId: a.id,
      titleAr: a.titleAr,
      exercices: ideas.length,
      sessions: yearsOfArchetype(a.id).length,
      points: ideas.reduce((s, i) => s + i.points, 0),
    };
  }).sort(
    (a, b) =>
      b.points - a.points || b.exercices - a.exercices || a.archetypeId.localeCompare(b.archetypeId),
  );
}

/** Exercices du corpus qui n'entrent dans aucun montage (à surveiller). */
export function unclassifiedIdeaIds(): string[] {
  return BAC_IDEAS.filter((i) => archetypesForIdea(i.id).length === 0).map((i) => i.id);
}

export const ARCHETYPE_COUNT = BAC_ARCHETYPES.length;
