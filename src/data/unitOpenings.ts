// unitOpenings.ts — « ماذا سندرس في هذه الوحدة ؟ » (audit item 19, sprint 13).
//
// Pourquoi
// --------
// @MostafaBdd ouvre son unité d'immunologie par une vidéo qui ne contient
// aucun cours : « ماذا سندرس في المناعة ؟ » (15:44 — 79 K vues). Elle répond à
// trois questions que l'élève se pose avant de commencer : de quoi ça parle,
// où ça va, et combien ça pèse. Sans cette carte d'ouverture, l'élève entre
// dans une unité sans savoir ce qu'il cherche.
//
// Ce module corrige AUSSI un défaut réel : `UnitIntroPortal` affichait le
// contenu de l'unité 1 (ARN) quelle que soit l'unité ouverte, et chargeait
// des photos Unsplash distantes — donc rien du tout hors connexion.
//
// Les poids d'examen proviennent du dépouillement mené aux sprints précédents
// (docs/analyse/BILAN_DETAILLE_BAC_SVT.md). Ils ne sont renseignés que là où
// ils ont été mesurés : U1-U7. Pour les unités 8 à 11, le champ reste absent
// plutôt qu'inventé.

export interface UnitOpening {
  unitId: number;
  /** Titre court de l'unité. */
  titleAr: string;
  /** La question centrale à laquelle l'unité entière répond. */
  questionAr: string;
  /** Ce que l'élève saura FAIRE à la fin — un savoir-faire, pas un savoir. */
  promiseAr: string;
  /** L'itinéraire, 3 à 5 étapes dans l'ordre d'étude. */
  roadmapAr: string[];
  /** Acquis nécessaires avant d'entrer (souvent 2AS). */
  prerequisAr: string[];
  /** Les pièges connus de l'unité. */
  trapsAr: string[];
  /** Poids mesuré au BAC, en pourcentage — absent si non mesuré. */
  bacWeightPercent?: number;
  /** Première action concrète à faire maintenant. */
  firstActionAr: string;
  /** Capsule « فكرة في دقيقة » recommandée pour démarrer. */
  capsuleId?: string;
  /** Schéma à savoir reproduire dans cette unité. */
  drillId?: string;
}

export const UNIT_OPENINGS: UnitOpening[] = [
  {
    unitId: 1,
    titleAr: 'آليات تركيب البروتين',
    questionAr: 'كيف تتحوّل معلومة مكتوبة في ADN إلى بروتين يعمل داخل الخلية؟',
    promiseAr: 'ستصبح قادراً على تتبّع المعلومة الوراثية من المورثة إلى البروتين، وتحديد المرحلة التي يتدخّل فيها أي عامل خارجي.',
    roadmapAr: [
      'مقرّ تركيب البروتين: تجارب التتبّع الإشعاعي.',
      'الاستنساخ في النواة: من ADN إلى ARNm.',
      'الترجمة على الريبوزوم: الرامزة ومضاد الرامزة.',
      'الطفرات وأثرها على البروتين الناتج.',
    ],
    prerequisAr: ['بنية ADN والقواعد الآزوتية (2AS)', 'مكوّنات الخلية وعضياتها', 'مبدأ التكامل بين القواعد'],
    trapsAr: [
      'الخلط بين الاستنساخ والترجمة عند تحديد مستوى تدخّل دواء أو سمّ.',
      'كتابة الثيمين T في ARNm بدل اليوراسيل U.',
    ],
    bacWeightPercent: 10,
    firstActionAr: 'ابدأ بكبسولة « كيف أميّز الاستنساخ عن الترجمة؟ » ثم ارسم مخطط الاستنساخ من الذاكرة.',
    capsuleId: 'cap_u1_transcription_vs_traduction',
    drillId: 'drill_transcription',
  },
  {
    unitId: 2,
    titleAr: 'بنية ووظيفة البروتين',
    questionAr: 'لماذا يفقد بروتين وظيفته لمجرّد تغيّر حمض أميني واحد أو تغيّر pH الوسط؟',
    promiseAr: 'ستصبح قادراً على الربط بين تسلسل البروتين وشكله الفراغي ووظيفته، وعلى التنبّؤ بسلوك حمض أميني في الترحيل الكهربائي.',
    roadmapAr: [
      'الحمض الأميني: بنيته وطبيعته الأمفوتيرية.',
      'الشحنة و pHi: السلوك في حقل كهربائي.',
      'المستويات البنيوية الأربعة وروابطها.',
      'العلاقة بنية/وظيفة وحالات التمسّخ.',
    ],
    prerequisAr: ['مفهوم الرابطة الكيميائية', 'الأس الهيدروجيني pH (فيزياء/كيمياء)', 'تركيب البروتين (الوحدة 1)'],
    trapsAr: [
      'حفظ اتجاه الهجرة بدل مقارنة pH الوسط بـ pHi.',
      'نسبة الروابط الهيدروجينية إلى البنية الأولية.',
    ],
    bacWeightPercent: 9,
    firstActionAr: 'جرّب محاكي الترحيل الكهربائي في « الأنميشن العلمي »، ثم راجع كبسولة « المصعد أم المهبط؟ ».',
    capsuleId: 'cap_u2_anode_cathode',
    drillId: 'drill_niveaux_structure',
  },
  {
    unitId: 3,
    titleAr: 'النشاط الإنزيمي للبروتينات',
    questionAr: 'كيف يسرّع الإنزيم تفاعلاً بعينه دون غيره، وكيف يمكن إيقافه؟',
    promiseAr: 'ستصبح قادراً على قراءة أي منحنى نشاط إنزيمي وتحديد نوع التثبيط من شكل المنحنى وحده.',
    roadmapAr: [
      'النوعية والتكامل البنيوي مع الركيزة.',
      'عوامل النشاط: pH ودرجة الحرارة وتركيز الركيزة.',
      'التثبيط التنافسي وغير التنافسي.',
      'تطبيقات طبية: الأدوية المثبّطة للإنزيمات.',
    ],
    prerequisAr: ['البنية الفراغية للبروتين (الوحدة 2)', 'قراءة منحنى بمحورين', 'مفهوم سرعة التفاعل'],
    trapsAr: [
      'تفسير انبساط المنحنى بالتمسّخ بينما الشروط ثابتة.',
      'خفض Vmax في حالة التثبيط التنافسي بدل رفع Km الظاهري.',
    ],
    bacWeightPercent: 13,
    firstActionAr: 'ارسم منحنيات التثبيط الثلاثة من الذاكرة، ثم صحّح نفسك بالشبكة.',
    capsuleId: 'cap_u3_inhibition_type',
    drillId: 'drill_courbes_inhibition',
  },
  {
    unitId: 4,
    titleAr: 'دور البروتينات في الدفاع عن الذات',
    questionAr: 'كيف يميّز الجسم بين ما هو منه وما هو غريب عنه، ثم يقصي الغريب؟',
    promiseAr: 'ستصبح قادراً على وصف استجابة مناعية كاملة، وتحديد نوعها من الوثيقة، وتفسير انهيارها عند الإصابة بـ VIH.',
    roadmapAr: [
      'الذات واللاذات: محدّدات CMH و الزمر الدموية.',
      'المناعة الخلطية: الجسم المضاد والبلازموسيت.',
      'المناعة الخلوية: LTc والإقصاء بالبرفورين.',
      'التعاون الخلوي: دور LT4 والإنترلوكين 2.',
      'اختلال الجهاز المناعي: فيروس VIH والسيدا.',
    ],
    prerequisAr: ['الخلايا الدموية وأنواعها (2AS)', 'مفهوم المستضد والتلقيح', 'بنية البروتين (الوحدة 2)'],
    trapsAr: [
      'الخلط بين نظام ABO ومحدّدات HLA في سؤال الزرع.',
      'وصف LT4 كخلية قاتلة بدل منسّق.',
      'الخلط بين « موجب المصل » و« مريض بالسيدا ».',
    ],
    bacWeightPercent: 13,
    firstActionAr: 'افتح الخريطة الذهنية للوحدة لرؤية الصورة الكاملة قبل أي درس.',
    capsuleId: 'cap_u4_humorale_cellulaire',
    drillId: 'drill_cmh',
  },
  {
    unitId: 5,
    titleAr: 'الاتصال العصبي',
    questionAr: 'كيف تنتقل رسالة من عصبون إلى آخر، وكيف تُشفَّر شدّة المنبّه؟',
    promiseAr: 'ستصبح قادراً على قراءة أي تسجيل كهربائي وتسميته بدقّة، وتحديد مستوى تأثير أي سمّ على المسار العصبي.',
    roadmapAr: [
      'كمون الراحة وكمون العمل: القيم والقوانين.',
      'الترميز التواتري لشدّة المنبّه.',
      'المشبك: تحرّر المبلّغ الكيميائي والترميز الكمي.',
      'الإدماج العصبي: PPSE و PPSI والعتبة.',
      'تأثير السموم: الكورار والسارين.',
    ],
    prerequisAr: ['بنية العصبون والليف العصبي (2AS)', 'قراءة تسجيل بالميلي فولت', 'مفهوم النفوذية الغشائية'],
    trapsAr: [
      'الخلط بين PPSE و PPM و كمون العمل.',
      'قول إن سعة كمون العمل تزداد مع شدّة المنبّه.',
      'الخلط بين آلية الكورار وآلية السارين.',
    ],
    bacWeightPercent: 16,
    firstActionAr: 'ارسم مخطط المشبك من الذاكرة: سبعة عناصر تُنقَّط كل واحد على حدة.',
    capsuleId: 'cap_u5_quatre_potentiels',
    drillId: 'drill_synapse',
  },
  {
    unitId: 6,
    titleAr: 'التركيب الضوئي',
    questionAr: 'كيف يحوّل النبات طاقة الضوء إلى مادة عضوية؟',
    promiseAr: 'ستصبح قادراً على تتبّع الإلكترون من الماء إلى NADPH، وتفسير أي تجربة على العوامل المحدّدة.',
    roadmapAr: [
      'الصانعة الخضراء والأصبغة اليخضورية.',
      'المرحلة الكيموضوئية: التحلّل الضوئي للماء وسلسلة النقل.',
      'تدرّج البروتونات و ATP سنتاز (ميتشل وجاغندورف).',
      'المرحلة الكيمياحيوية: حلقة كالفن.',
      'العوامل المحدّدة والمردود.',
    ],
    prerequisAr: ['المبادلات الغازية عند النبات (2AS)', 'مفهوم الأكسدة والإرجاع', 'بنية الغشاء الخلوي'],
    trapsAr: [
      'وضع حلقة كالفن داخل التيلاكويد.',
      'اعتبار الأكسجين المنطلق آتياً من CO₂.',
      'قول إن الضوء يُنتج ATP مباشرة.',
    ],
    bacWeightPercent: 20,
    firstActionAr: 'راجع كبسولة « كيف يُصنع ATP في الظلام؟ » — هي مفتاح نصف أسئلة الوحدة.',
    capsuleId: 'cap_u6_jagendorf',
    drillId: 'drill_chaine_photochimique',
  },
  {
    unitId: 7,
    titleAr: 'تحويل الطاقة الكامنة إلى ATP',
    questionAr: 'كيف تستخرج الخلية الطاقة المخزّنة في الغلوكوز، وبأي مردود؟',
    promiseAr: 'ستصبح قادراً على تحديد مقرّ كل مرحلة وحصيلتها، وتفسير سلوك العضلة عند نقص الأكسجين.',
    roadmapAr: [
      'ATP: بنيته ودوره كعملة طاقوية.',
      'التحلّل السكري في الهيولى.',
      'حلقة كريبس في مطرس الميتوكوندري.',
      'السلسلة التنفسية والفسفرة التأكسدية.',
      'التخمّر: بديل بمردود ضعيف.',
    ],
    prerequisAr: ['بنية الميتوكوندري', 'التركيب الضوئي (الوحدة 6)', 'مفهوم المردود الطاقوي'],
    trapsAr: [
      'نسبة معظم ATP إلى حلقة كريبس بدل الفسفرة التأكسدية.',
      'وضع التحلّل السكري داخل الميتوكوندري بدل الهيولى.',
      'نسيان أن التخمّر ينتج ATP (جزيئتين) لا صفراً.',
    ],
    bacWeightPercent: 19,
    firstActionAr: 'ارسم مخطط مراحل التنفس ومقارّها، ثم قارن بالشبكة.',
    capsuleId: 'cap_u7_ou_est_atp',
    drillId: 'drill_respiration',
  },
  {
    unitId: 8,
    titleAr: 'ما فوق البنية الخلوية والوظائف',
    questionAr: 'كيف تتكامل العضيات داخل خلية واحدة لتأمين حصيلة طاقوية متوازنة؟',
    promiseAr: 'ستصبح قادراً على قراءة صورة مجهرية إلكترونية وربط كل بنية بوظيفتها الطاقوية.',
    roadmapAr: [
      'الصانعة والميتوكوندري: التنظيم الداخلي.',
      'العلاقة بين البنية والوظيفة الطاقوية.',
      'المبادلات الغازية ونقطة التعويض.',
    ],
    prerequisAr: ['التركيب الضوئي (الوحدة 6)', 'التنفس الخلوي (الوحدة 7)', 'قراءة صورة مجهرية'],
    trapsAr: [
      'الخلط بين أعراف الميتوكوندري وتيلاكويدات الصانعة.',
      'اعتبار المبادلات المعدومة عند نقطة التعويض توقّفاً للوظيفتين.',
    ],
    firstActionAr: 'راجع كبسولة « كيف أميّز الصانعة عن الميتوكوندري؟ » قبل أي صورة مجهرية.',
    capsuleId: 'cap_u8_chloroplaste_mitochondrie',
    drillId: 'drill_coupe_feuille',
  },
  {
    unitId: 9,
    titleAr: 'النشاط التكتوني للكرة الأرضية',
    questionAr: 'ما الذي يحرّك الألواح، وماذا يحدث عند حدودها؟',
    promiseAr: 'ستصبح قادراً على تفسير الظواهر البركانية والزلزالية انطلاقاً من نوع الحدّ بين لوحين.',
    roadmapAr: [
      'حدود الألواح: تباعد، تقارب، انزلاق.',
      'الغوص: التميّه والانصهار الجزئي.',
      'الصهارة والبراكين وتوزّع الزلازل.',
    ],
    prerequisAr: ['الصخور الثلاث الكبرى', 'قراءة خريطة جيولوجية بسيطة', 'مفهوم الكثافة'],
    trapsAr: [
      'تفسير الانصهار بارتفاع الحرارة وحده بدل دور الماء.',
      'جعل اللوح القاري يغوص تحت المحيطي.',
    ],
    firstActionAr: 'ارسم مخطط منطقة الغوص من الذاكرة مع مستوي بنيوف.',
    capsuleId: 'cap_u9_fusion_subduction',
    drillId: 'drill_subduction',
  },
  {
    unitId: 10,
    titleAr: 'بنية الكرة الأرضية',
    questionAr: 'كيف نعرف ما بداخل الأرض ونحن لم ندخلها قط؟',
    promiseAr: 'ستصبح قادراً على استنتاج بنية الأرض وحالة كل طبقة من سلوك الأمواج الزلزالية.',
    roadmapAr: [
      'الأمواج الزلزالية P و S: خصائصها.',
      'الانقطاعات: موهو، غوتنبرغ، ليمان.',
      'منطقة الظلّ والاستدلال على النواة السائلة.',
    ],
    prerequisAr: ['انتشار الموجات (فيزياء)', 'مفهوم الكثافة وسرعة الانتشار', 'قراءة منحنى سرعة/عمق'],
    trapsAr: [
      'الاستدلال بتباطؤ الأمواج P وحده على سيولة النواة.',
      'الخلط بين انقطاع موهو وانقطاع غوتنبرغ.',
    ],
    firstActionAr: 'ارسم مقطع الكرة الأرضية بانقطاعاته الثلاثة، ثم صحّح.',
    capsuleId: 'cap_u10_zone_ombre',
    drillId: 'drill_structure_terre',
  },
  {
    unitId: 11,
    titleAr: 'البنيات الجيولوجية الكبرى',
    questionAr: 'كيف نقرأ في الصخور تاريخ بناء قشرة وهدمها؟',
    promiseAr: 'ستصبح قادراً على تصنيف أي منطقة جيولوجية بناءً على شواهدها الصخرية والزلزالية.',
    roadmapAr: [
      'الظهرة المحيطية: البناء وتوسّع القاع.',
      'مناطق الغوص والتصادم: الهدم وبناء السلاسل.',
      'دورة ويلسون: الربط بين المراحل.',
    ],
    prerequisAr: ['النشاط التكتوني (الوحدة 9)', 'تمييز البازلت والغرانيت والغابرو', 'قراءة مقطع جيولوجي'],
    trapsAr: [
      'التصنيف من وجود البراكين وحده.',
      'وضع الغرانيت في القشرة المحيطية.',
    ],
    firstActionAr: 'ارسم مخطط الظهرة المحيطية، ثم قارنه بمخطط الغوص: البناء مقابل الهدم.',
    capsuleId: 'cap_u11_construction_destruction',
    drillId: 'drill_dorsale',
  },
];

export const OPENING_BY_UNIT: Record<number, UnitOpening> = Object.fromEntries(
  UNIT_OPENINGS.map((o) => [o.unitId, o]),
);

export function openingForUnit(unitId: number): UnitOpening | undefined {
  return OPENING_BY_UNIT[unitId];
}

export const UNIT_OPENING_COUNT = UNIT_OPENINGS.length;
