// schemaDrills.ts — « ارسم من الذاكرة » (audit item 17, sprint 12).
//
// Pourquoi ce module
// ------------------
// @MostafaBdd consacre une vidéo entière — « جميع الرسومات التخطيطية التي يجب
// حفظها » (58:58, 76 K vues) — à la liste des schémas que le candidat doit
// savoir REPRODUIRE. Le sujet de BAC demande explicitement « ارسم مخططاً » ou
// « أنجز رسماً تخطيطياً » presque chaque année, et ces points se perdent par
// oubli d'éléments, pas par incompréhension.
//
// L'app savait MONTRER 134 schémas ; elle ne savait pas vérifier que l'élève
// sait les REFAIRE. Ce module inverse le sens : d'abord la feuille blanche,
// ensuite seulement l'image.
//
// Chaque exercice donne :
//   • la consigne telle qu'elle tombe au BAC ;
//   • l'ordre de tracé (on ne dessine pas au hasard) ;
//   • la GRILLE d'éléments attendus, chacun coté, que l'élève coche lui-même ;
//   • les erreurs qui coûtent les points ;
//   • l'asset officiel, révélé UNIQUEMENT après l'auto-évaluation.

/** Un élément que le dessin doit contenir. */
export interface SchemaElement {
  id: string;
  labelAr: string;
  /** Points accordés (2 = indispensable, 1 = valorisant). */
  points: 1 | 2;
}

export interface SchemaDrill {
  id: string;
  unitId: number;
  titleAr: string;
  /** La consigne, formulée comme au BAC. */
  consigneAr: string;
  /** Pourquoi ce schéma est réclamé à l'examen. */
  whyAr: string;
  /** Minutes conseillées pour le tracé. */
  minutes: number;
  /** Ordre de tracé, 3 à 5 étapes. */
  orderAr: string[];
  /** Grille d'auto-évaluation (5 à 9 éléments). */
  elements: SchemaElement[];
  /** Erreurs classiques qui coûtent les points. */
  trapsAr: string[];
  /** Chemin de l'asset officiel (doit exister au manifeste). */
  assetSrc: string;
  altAr: string;
  lessonId?: string;
}

export const SCHEMA_DRILLS: SchemaDrill[] = [
  {
    id: 'drill_transcription',
    unitId: 1,
    titleAr: 'مخطط الاستنساخ',
    consigneAr: 'أنجز رسماً تخطيطياً معنوناً يوضّح آلية الاستنساخ داخل النواة.',
    whyAr: 'يُطلب كسؤال استرجاع (التمرين الأول، 05 نقاط) في كل دورة تقريباً، ويُصحَّح بالعناصر لا بالجمال.',
    minutes: 8,
    orderAr: [
      'ابدأ بالعنوان فوق الرسم.',
      'ارسم سلسلتي ADN مع فقاعة الاستنساخ في الوسط.',
      'ضع ARN بوليميراز على السلسلة الناسخة وحدها.',
      'اسحب ARNm الناشئ وحدّد اتجاه 5ʹ→3ʹ بسهم.',
    ],
    elements: [
      { id: 'titre', labelAr: 'عنوان الرسم', points: 1 },
      { id: 'adn_double', labelAr: 'سلسلتا ADN مع فتح موضعي (فقاعة)', points: 2 },
      { id: 'brin_transcrit', labelAr: 'تحديد السلسلة الناسخة وحدها', points: 2 },
      { id: 'polymerase', labelAr: 'إنزيم ARN بوليميراز في موضعه', points: 2 },
      { id: 'arnm', labelAr: 'جزيء ARNm الناشئ', points: 2 },
      { id: 'sens', labelAr: 'سهم يبيّن اتجاه التركيب 5ʹ→3ʹ', points: 1 },
      { id: 'noyau', labelAr: 'الإشارة إلى أن المقرّ هو النواة', points: 1 },
    ],
    trapsAr: [
      'رسم السلسلتين تُستنسخان معاً: واحدة فقط ناسخة.',
      'كتابة T في ARNm بدل U.',
      'نسيان العنوان — وهو نقطة كاملة في أغلب السلالم.',
    ],
    assetSrc: '/assets/images/schemas/domaine1_proteines/schema_02_transcription.svg',
    altAr: 'مخطط الاستنساخ: فقاعة الاستنساخ و ARN بوليميراز و ARNm الناشئ.',
    lessonId: 'lecon_transcription',
  },
  {
    id: 'drill_traduction',
    unitId: 1,
    titleAr: 'مخطط الترجمة على الريبوزوم',
    consigneAr: 'ارسم مخططاً يوضّح مرحلة الاستطالة في الترجمة على مستوى الريبوزوم.',
    whyAr: 'يختبر فهم العلاقة رامزة/مضاد رامزة، وهي العقدة التي تفصل بين التلميذ الذي حفظ والذي فهم.',
    minutes: 8,
    orderAr: [
      'ضع العنوان ثم ارسم ARNm أفقياً مع بعض الرامزات.',
      'ارسم الريبوزوم بوحدتيه الصغرى والكبرى فوق ARNm.',
      'ضع ARNt في الموقعين مع مضاد الرامزة والحمض الأميني.',
      'اربط الأحماض الأمينية برابطة ببتيدية واتجاه التقدّم.',
    ],
    elements: [
      { id: 'titre', labelAr: 'عنوان الرسم', points: 1 },
      { id: 'arnm', labelAr: 'ARNm مع رامزات مكتوبة بثلاث قواعد', points: 2 },
      { id: 'ribosome', labelAr: 'الريبوزوم بوحدتيه', points: 2 },
      { id: 'arnt', labelAr: 'ARNt مع مضاد الرامزة المتمّم', points: 2 },
      { id: 'aa', labelAr: 'الحمض الأميني المحمول على ARNt', points: 2 },
      { id: 'peptide', labelAr: 'السلسلة الببتيدية والرابطة الببتيدية', points: 1 },
      { id: 'sens', labelAr: 'سهم تقدّم الريبوزوم على ARNm', points: 1 },
    ],
    trapsAr: [
      'كتابة مضاد رامزة غير متمّم للرامزة المقابلة.',
      'رسم ARNt يحمل ثلاثة أحماض أمينية: واحد فقط.',
      'وضع العملية في النواة.',
    ],
    assetSrc: '/assets/images/schemas/domaine1_proteines/schema_03_traduction.svg',
    altAr: 'مخطط الترجمة: ARNm، الريبوزوم، ARNt، السلسلة الببتيدية.',
  },
  {
    id: 'drill_niveaux_structure',
    unitId: 2,
    titleAr: 'المستويات الأربعة لبنية البروتين',
    consigneAr: 'أنجز مخططاً يمثّل المستويات البنيوية الأربعة للبروتين مع الرابطة المميّزة لكل مستوى.',
    whyAr: 'سؤال استرجاع متكرّر؛ يُنقَّط عنصراً بعنصر: مستوى + شكل + رابطة.',
    minutes: 10,
    orderAr: [
      'قسّم الورقة إلى أربع خانات معنونة.',
      'في كل خانة ارسم الشكل المميّز للمستوى.',
      'اكتب تحت كل شكل نوع الرابطة المثبّتة.',
    ],
    elements: [
      { id: 'primaire', labelAr: 'البنية الأولية: تسلسل خطي + رابطة ببتيدية', points: 2 },
      { id: 'secondaire', labelAr: 'البنية الثانوية: لولب α وصفيحة β + روابط هيدروجينية', points: 2 },
      { id: 'tertiaire', labelAr: 'البنية الثالثية: شكل فراغي + جسر ثنائي الكبريت', points: 2 },
      { id: 'quaternaire', labelAr: 'البنية الرباعية: عدة سلاسل (مثال الهيموغلوبين)', points: 2 },
      { id: 'titre', labelAr: 'عنوان عام للمخطط', points: 1 },
      { id: 'ordre', labelAr: 'ترتيب تصاعدي واضح من الأولية إلى الرباعية', points: 1 },
    ],
    trapsAr: [
      'نسبة الروابط الهيدروجينية إلى البنية الأولية.',
      'الخلط بين لولب α وصفيحة β في الرسم.',
      'إعطاء مثال رباعي بسلسلة واحدة.',
    ],
    assetSrc: '/assets/images/schemas/domaine1_proteines/schema_45_four_levels_structure_modern.svg',
    altAr: 'المستويات الأربعة لبنية البروتين.',
    lessonId: 'protein_structure_function',
  },
  {
    id: 'drill_enzyme_site_actif',
    unitId: 3,
    titleAr: 'الموقع الفعّال والتكامل البنيوي',
    consigneAr: 'ارسم مخططاً يوضّح تشكّل المعقّد إنزيم-ركيزة ثم تحرير النواتج.',
    whyAr: 'يربط البنية بالوظيفة، وهو الأساس الذي تُبنى عليه كل أسئلة التثبيط.',
    minutes: 8,
    orderAr: [
      'ارسم الإنزيم مع تجويف الموقع الفعّال.',
      'ارسم الركيزة المتكاملة شكلياً مع التجويف.',
      'ارسم المعقّد ثم النواتج والإنزيم حرّاً من جديد.',
    ],
    elements: [
      { id: 'enzyme', labelAr: 'الإنزيم مع موقع فعّال محدّد بوضوح', points: 2 },
      { id: 'substrat', labelAr: 'الركيزة متكاملة شكلياً مع الموقع', points: 2 },
      { id: 'complexe', labelAr: 'المعقّد إنزيم-ركيزة', points: 2 },
      { id: 'produits', labelAr: 'النواتج المحرَّرة', points: 2 },
      { id: 'recyclage', labelAr: 'عودة الإنزيم حرّاً (سهم إعادة الاستعمال)', points: 1 },
      { id: 'titre', labelAr: 'عنوان الرسم', points: 1 },
    ],
    trapsAr: [
      'رسم الإنزيم يُستهلك في التفاعل: الإنزيم يُسترجع سليماً.',
      'ركيزة أكبر من الموقع الفعّال أو غير متكاملة معه.',
      'نسيان النواتج.',
    ],
    assetSrc: '/assets/images/schemas/domaine1_proteines/schema_07_enzyme.svg',
    altAr: 'مخطط الموقع الفعّال والمعقّد إنزيم-ركيزة.',
    lessonId: 'enzyme_inhibitors',
  },
  {
    id: 'drill_courbes_inhibition',
    unitId: 3,
    titleAr: 'منحنيات التثبيط التنافسي وغير التنافسي',
    consigneAr: 'ارسم على معلم واحد منحنى التفاعل دون مثبّط، مع مثبّط تنافسي، ومع مثبّط غير تنافسي.',
    whyAr: 'الرسم هنا هو الجواب: شكل المنحنيات وحده يُثبت نوع التثبيط.',
    minutes: 10,
    orderAr: [
      'ارسم المعلم: [S] على الأفقي، V على العمودي، مع الوحدات.',
      'ارسم المنحنى المرجعي حتى Vmax.',
      'أضف منحنى التنافسي: نفس Vmax، بلوغ أبطأ.',
      'أضف منحنى غير التنافسي: Vmax أخفض.',
    ],
    elements: [
      { id: 'axes', labelAr: 'معلم معنون بالوحدات ([S] و V)', points: 2 },
      { id: 'temoin', labelAr: 'المنحنى المرجعي الزائدي حتى Vmax', points: 2 },
      { id: 'competitif', labelAr: 'منحنى تنافسي يبلغ نفس Vmax', points: 2 },
      { id: 'non_competitif', labelAr: 'منحنى غير تنافسي بـ Vmax أخفض', points: 2 },
      { id: 'legende', labelAr: 'مفتاح يميّز المنحنيات الثلاثة', points: 1 },
      { id: 'vmax', labelAr: 'تحديد Vmax بخط متقطّع', points: 1 },
    ],
    trapsAr: [
      'خفض Vmax في التثبيط التنافسي.',
      'رسم منحنيات خطية بدل منحنيات زائدية.',
      'معلم بلا وحدات: تُخصم النقطة آلياً.',
    ],
    assetSrc: '/assets/images/schemas/domaine1_enzymes/schema_87_enzyme_inhibition_curves_ar.svg',
    altAr: 'منحنيات النشاط الإنزيمي مع وبدون مثبّطات.',
    lessonId: 'enzyme_inhibitors',
  },
  {
    id: 'drill_anticorps',
    unitId: 4,
    titleAr: 'بنية الجسم المضاد',
    consigneAr: 'أنجز رسماً تخطيطياً معنوناً لبنية جسم مضاد من نوع IgG.',
    whyAr: 'من أكثر الرسومات طلباً؛ ثلاث نقاط تُفقد عادة في المناطق الثابتة/المتغيّرة.',
    minutes: 7,
    orderAr: [
      'ارسم شكل Y مع أربع سلاسل.',
      'ميّز السلسلتين الثقيلتين عن الخفيفتين.',
      'لوّن أو ظلّل المناطق المتغيّرة في الأطراف.',
      'ضع جسور ثنائي الكبريت ومواقع تثبيت المستضد.',
    ],
    elements: [
      { id: 'y', labelAr: 'الشكل العام على هيئة Y', points: 1 },
      { id: 'chaines', labelAr: 'سلسلتان ثقيلتان وسلسلتان خفيفتان', points: 2 },
      { id: 'variable', labelAr: 'المناطق المتغيّرة في الأطراف', points: 2 },
      { id: 'constante', labelAr: 'المناطق الثابتة', points: 1 },
      { id: 'sites', labelAr: 'موقعا تثبيت المستضد', points: 2 },
      { id: 'ponts', labelAr: 'جسور ثنائي الكبريت', points: 1 },
      { id: 'titre', labelAr: 'عنوان الرسم', points: 1 },
    ],
    trapsAr: [
      'موقع تثبيت واحد بدل موقعين.',
      'وضع المنطقة المتغيّرة في القاعدة بدل الأطراف.',
      'الخلط بين السلاسل الثقيلة والخفيفة في الطول.',
    ],
    assetSrc: '/assets/images/schemas/domaine1_proteines/schema_65_antibody_structure_hl_modern.svg',
    altAr: 'بنية الجسم المضاد: سلاسل ثقيلة وخفيفة ومواقع التثبيت.',
    lessonId: 'immunity_humoral_response',
  },
  {
    id: 'drill_cmh',
    unitId: 4,
    titleAr: 'معقّد التوافق النسيجي CMH I و II',
    consigneAr: 'ارسم مخططاً مقارناً بين CMH I و CMH II مبيّناً الخلية الحاملة والخلية المتعرّفة.',
    whyAr: 'الخلط بين الصنفين يُسقط كل تفسير لعرض المستضد.',
    minutes: 8,
    orderAr: [
      'ارسم غشاءين متقابلين، واحد لكل صنف.',
      'ضع CMH I على كل خلية ذات نواة، وCMH II على الخلية العارضة.',
      'ضع المستضد في التجويف، ثم الخلية المتعرّفة LT8 أو LT4.',
    ],
    elements: [
      { id: 'membrane', labelAr: 'الغشاء الهيولي مرسوم بوضوح', points: 1 },
      { id: 'cmh1', labelAr: 'CMH I على خلية ذات نواة', points: 2 },
      { id: 'cmh2', labelAr: 'CMH II على خلية عارضة (بلعمية أو LB)', points: 2 },
      { id: 'antigene', labelAr: 'الببتيد المستضدي داخل التجويف', points: 2 },
      { id: 'lt8', labelAr: 'LT8 تتعرّف على CMH I', points: 2 },
      { id: 'lt4', labelAr: 'LT4 تتعرّف على CMH II', points: 2 },
      { id: 'titre', labelAr: 'عنوان ومفتاح', points: 1 },
    ],
    trapsAr: [
      'عكس الأزواج: LT4 مع CMH I.',
      'وضع CMH II على كل الخلايا.',
      'نسيان الببتيد المعروض: بدونه لا يوجد تعرّف.',
    ],
    assetSrc: '/assets/images/schemas/domaine1_proteines/schema_58_hla_I_II_structure_modern.svg',
    altAr: 'بنية CMH I و CMH II والخلايا المتعرّفة.',
    lessonId: 'immunity_self_nonself',
  },
  {
    id: 'drill_reponse_primaire_secondaire',
    unitId: 4,
    titleAr: 'منحنى الاستجابة الأولية والثانوية',
    consigneAr: 'ارسم منحنى تطوّر نسبة الأجسام المضادة بعد حقنتين متتاليتين لنفس المستضد.',
    whyAr: 'الرسم يُطلب مباشرة في تمارين التلقيح، ويجب أن يُظهر ثلاثة فروق قابلة للقياس.',
    minutes: 8,
    orderAr: [
      'ارسم المعلم: الزمن بالأيام، وتركيز الأجسام المضادة.',
      'ضع سهمي الحقن الأول والثاني.',
      'ارسم الاستجابة الأولية: كمون طويل وذروة منخفضة.',
      'ارسم الثانوية: كمون قصير، ذروة أعلى، مدة أطول.',
    ],
    elements: [
      { id: 'axes', labelAr: 'معلم معنون بالوحدات', points: 2 },
      { id: 'injections', labelAr: 'سهما الحقن الأول والثاني', points: 2 },
      { id: 'latence', labelAr: 'زمن كمون أطول في الأولية', points: 2 },
      { id: 'amplitude', labelAr: 'ذروة أعلى في الثانوية', points: 2 },
      { id: 'duree', labelAr: 'استمرار أطول في الثانوية', points: 1 },
      { id: 'titre', labelAr: 'عنوان ومفتاح', points: 1 },
    ],
    trapsAr: [
      'رسم ذروتين متساويتين.',
      'نسيان زمن الكمون: هو أول فرق يُقرأ.',
      'حقن ثانٍ بمستضد مختلف: عندئذٍ لا استجابة ثانوية.',
    ],
    assetSrc: '/assets/images/schemas/domaine1_proteines/schema_75_primary_secondary_response_curve_modern.svg',
    altAr: 'منحنى الاستجابة المناعية الأولية والثانوية.',
    lessonId: 'immunity_memory_response',
  },
  {
    id: 'drill_vih_cycle',
    unitId: 4,
    titleAr: 'دورة فيروس VIH داخل LT4',
    consigneAr: 'أنجز مخططاً يلخّص مراحل تكاثر فيروس VIH داخل اللمفاوية LT4.',
    whyAr: 'يجمع بين المناعة والبيولوجيا الجزيئية، ويُطلب غالباً في التمرين الثاني.',
    minutes: 10,
    orderAr: [
      'ارسم LT4 مع مستقبل CD4 على غشائها.',
      'ثبّت الفيروس ثم أدخل محتواه.',
      'ارسم النسخ العكسي ثم الإدماج في ADN الخلية.',
      'انهِ بالتضاعف وتبرعم فيروسات جديدة.',
    ],
    elements: [
      { id: 'lt4', labelAr: 'اللمفاوية LT4 ومستقبل CD4', points: 2 },
      { id: 'fixation', labelAr: 'تثبيت الفيروس على المستقبل', points: 2 },
      { id: 'transcriptase', labelAr: 'النسخ العكسي: ARN فيروسي إلى ADN', points: 2 },
      { id: 'integration', labelAr: 'إدماج ADN الفيروسي في مورثات الخلية', points: 2 },
      { id: 'production', labelAr: 'إنتاج فيروسات جديدة وتبرعمها', points: 2 },
      { id: 'lyse', labelAr: 'موت اللمفاوية LT4', points: 1 },
    ],
    trapsAr: [
      'نسيان الإنزيم الناسخ العكسي: هو خصوصية الفيروسات القهقرية.',
      'إصابة أي خلية: الفيروس نوعي لحاملات CD4.',
      'الخلط بين مرحلة الكمون السريرية وغياب التكاثر الفيروسي.',
    ],
    assetSrc: '/assets/images/schemas/domaine1_immunite/schema_90_vih_cycle_lt4_ar.svg',
    altAr: 'دورة تكاثر فيروس VIH داخل اللمفاوية LT4.',
    lessonId: 'immunity_hiv_aids',
  },
  {
    id: 'drill_synapse',
    unitId: 5,
    titleAr: 'مخطط المشبك العصبي',
    consigneAr: 'ارسم مخططاً معنوناً لمشبك عصبي عصبي مبيّناً مسار الرسالة العصبية.',
    whyAr: 'أكثر رسم يُطلب في الوحدة 5؛ ستة عناصر تُنقَّط بشكل مستقل.',
    minutes: 10,
    orderAr: [
      'ارسم النهاية قبل المشبكية والعنصر بعد المشبكي والشقّ بينهما.',
      'ضع الحويصلات المشبكية والميتوكوندريات.',
      'ارسم تحرّر المبلّغ في الشقّ وتثبيته على المستقبلات.',
      'بيّن اتجاه الرسالة بسهم واحد لا رجعة فيه.',
    ],
    elements: [
      { id: 'pre', labelAr: 'النهاية قبل المشبكية', points: 2 },
      { id: 'fente', labelAr: 'الشقّ المشبكي', points: 2 },
      { id: 'post', labelAr: 'الغشاء بعد المشبكي', points: 2 },
      { id: 'vesicules', labelAr: 'الحويصلات المشبكية المحتوية على المبلّغ', points: 2 },
      { id: 'recepteurs', labelAr: 'المستقبلات النوعية على الغشاء بعد المشبكي', points: 2 },
      { id: 'mitochondries', labelAr: 'الميتوكوندريات في النهاية قبل المشبكية', points: 1 },
      { id: 'sens', labelAr: 'سهم اتجاه الرسالة (أحادي الاتجاه)', points: 1 },
    ],
    trapsAr: [
      'رسم الحويصلات في الجانب بعد المشبكي.',
      'سهم في الاتجاهين: النقل المشبكي أحادي الاتجاه.',
      'نسيان المستقبلات: بدونها لا يوجد تأثير بعد مشبكي.',
    ],
    assetSrc: '/assets/images/schemas/domaine1_regulations/schema_82_synapse_modern_ar.svg',
    altAr: 'مخطط مشبك عصبي مع الحويصلات والمستقبلات.',
    lessonId: 'synapse',
  },
  {
    id: 'drill_potentiel_action',
    unitId: 5,
    titleAr: 'منحنى كمون العمل',
    consigneAr: 'ارسم منحنى كمون العمل مع تسمية مراحله وقيمه المميّزة.',
    whyAr: 'يجب أن يُرسم بالقيم: −70 mV و +30 mV، وإلا فُقدت نقطة القراءة.',
    minutes: 8,
    orderAr: [
      'ارسم المعلم: الزمن (ms) والفرق في الكمون (mV).',
      'ابدأ من كمون الراحة −70 mV.',
      'ارسم زوال الاستقطاب حتى +30 mV ثم إعادة الاستقطاب.',
      'أضف فرط الاستقطاب والعودة إلى الراحة.',
    ],
    elements: [
      { id: 'axes', labelAr: 'معلم بالوحدات: ms و mV', points: 2 },
      { id: 'repos', labelAr: 'كمون الراحة عند −70 mV', points: 2 },
      { id: 'depolarisation', labelAr: 'طور زوال الاستقطاب', points: 2 },
      { id: 'pic', labelAr: 'الذروة عند +30 mV تقريباً', points: 2 },
      { id: 'repolarisation', labelAr: 'طور إعادة الاستقطاب', points: 2 },
      { id: 'hyperpolarisation', labelAr: 'فرط الاستقطاب العابر', points: 1 },
      { id: 'seuil', labelAr: 'تحديد العتبة', points: 1 },
    ],
    trapsAr: [
      'رسم كمون عمل بسعة متغيّرة حسب شدّة المنبّه.',
      'نسيان الإشارة السالبة في كمون الراحة.',
      'قلب محوري المعلم.',
    ],
    assetSrc: '/assets/images/schemas/domaine1_regulations/schema_83_potentiel_action_modern_ar.svg',
    altAr: 'منحنى كمون العمل بمراحله الأربع.',
    lessonId: 'synapse',
  },
  {
    id: 'drill_chaine_photochimique',
    unitId: 6,
    titleAr: 'المرحلة الكيموضوئية على غشاء التيلاكويد',
    consigneAr: 'أنجز مخططاً يبيّن مسار الإلكترون من الماء إلى NADP⁺ على غشاء التيلاكويد.',
    whyAr: 'الوحدة الأثقل في الامتحان (المجال 2 يمثّل 39 %)، والرسم يجمع كل عناصر التنقيط.',
    minutes: 12,
    orderAr: [
      'ارسم غشاء التيلاكويد بين التجويف والحشوة.',
      'ضع PSII ثم السلسلة الناقلة ثم PSI من اليسار إلى اليمين.',
      'ابدأ بالتحلّل الضوئي للماء في التجويف.',
      'انتهِ بـ NADPH في الحشوة وATP سنتاز مع تدفّق H⁺.',
    ],
    elements: [
      { id: 'membrane', labelAr: 'غشاء التيلاكويد مع تمييز التجويف والحشوة', points: 2 },
      { id: 'photolyse', labelAr: 'التحلّل الضوئي للماء: H₂O → 2H⁺ + 2e⁻ + ½O₂', points: 2 },
      { id: 'psii', labelAr: 'النظام الضوئي II في موقعه', points: 2 },
      { id: 'chaine', labelAr: 'سلسلة نقل الإلكترونات', points: 2 },
      { id: 'psi', labelAr: 'النظام الضوئي I', points: 2 },
      { id: 'nadph', labelAr: 'إرجاع ⁺NADP إلى NADPH في الحشوة', points: 2 },
      { id: 'atpsynthase', labelAr: 'ATP سنتاز وتدفّق البروتونات', points: 2 },
    ],
    trapsAr: [
      'ترتيب PSI قبل PSII: الترقيم تاريخي، والمسار يبدأ من PSII.',
      'وضع الأكسجين ناتجاً عن CO₂.',
      'نسيان تدرّج البروتونات: بدونه لا يوجد ATP.',
    ],
    assetSrc: '/assets/images/schemas/domaine2_energie/schema_93_photochemical_chain_z_scheme_ar.svg',
    altAr: 'مخطط Z للمرحلة الكيموضوئية على غشاء التيلاكويد.',
    lessonId: 'photochemical_chain',
  },
  {
    id: 'drill_respiration',
    unitId: 7,
    titleAr: 'مراحل التنفس الخلوي ومقارّها',
    consigneAr: 'ارسم مخططاً يلخّص مراحل الهدم التنفسي محدّداً مقرّ كل مرحلة وحصيلتها.',
    whyAr: 'سؤال استرجاع مباشر؛ يكفي أن تكون المقارّ الثلاثة صحيحة لاقتناص أغلب النقاط.',
    minutes: 10,
    orderAr: [
      'ارسم خلية بها ميتوكوندري، وميّز الهيولى والمطرس والغشاء الداخلي.',
      'ضع التحلّل السكري في الهيولى.',
      'ضع حلقة كريبس في المطرس.',
      'ضع السلسلة التنفسية والفسفرة على الغشاء الداخلي.',
    ],
    elements: [
      { id: 'glycolyse', labelAr: 'التحلّل السكري في الهيولى (غلوكوز → حمض بيروفيك)', points: 2 },
      { id: 'krebs', labelAr: 'حلقة كريبس في المطرس', points: 2 },
      { id: 'chaine', labelAr: 'السلسلة التنفسية على الغشاء الداخلي (الأعراف)', points: 2 },
      { id: 'transporteurs', labelAr: 'المرجعات NADH و FADH₂ بين المراحل', points: 2 },
      { id: 'o2', labelAr: 'الأكسجين مستقبلاً نهائياً للإلكترونات', points: 2 },
      { id: 'bilan', labelAr: 'الحصيلة الإجمالية (حوالي 36 ATP)', points: 1 },
    ],
    trapsAr: [
      'وضع التحلّل السكري داخل الميتوكوندري.',
      'نسبة معظم ATP إلى كريبس.',
      'نسيان الماء كناتج نهائي.',
    ],
    assetSrc: '/assets/images/schemas/domaine2_energie/schema_10_respiration.svg',
    altAr: 'مخطط مراحل التنفس الخلوي ومقارّها.',
  },
  {
    id: 'drill_coupe_feuille',
    unitId: 8,
    titleAr: 'مقطع عرضي في ورقة نبات',
    consigneAr: 'أنجز رسماً تخطيطياً لمقطع عرضي في ورقة نبات مع تسمية الأنسجة.',
    whyAr: 'يربط البنية التشريحية بالوظيفة الضوئية، ويُطلب في تمارين المبادلات الغازية.',
    minutes: 8,
    orderAr: [
      'ارسم البشرتين العليا والسفلى.',
      'ضع النسيج العمادي تحت البشرة العليا والإسفنجي تحته.',
      'أضف الثغر في البشرة السفلى والحزمة الوعائية.',
    ],
    elements: [
      { id: 'epiderme', labelAr: 'البشرة العليا والبشرة السفلى', points: 2 },
      { id: 'palissadique', labelAr: 'النسيج العمادي الغني باليخضور', points: 2 },
      { id: 'lacuneux', labelAr: 'النسيج الإسفنجي وفراغاته', points: 2 },
      { id: 'stomate', labelAr: 'ثغر مع خليتيه الحارستين', points: 2 },
      { id: 'vaisseaux', labelAr: 'الحزمة الوعائية (خشب ولحاء)', points: 1 },
      { id: 'titre', labelAr: 'عنوان ومفتاح', points: 1 },
    ],
    trapsAr: [
      'وضع الثغور في البشرة العليا أساساً.',
      'نسيان الفراغات في النسيج الإسفنجي: هي مسار الغازات.',
      'رسم اليخضورات في البشرة.',
    ],
    assetSrc: '/assets/images/schemas/domaine2_energie/schema_87_coupe_feuille_modern_ar.svg',
    altAr: 'مقطع عرضي في ورقة نبات مع الأنسجة والثغر.',
  },
  {
    id: 'drill_subduction',
    unitId: 9,
    titleAr: 'مخطط منطقة الغوص',
    consigneAr: 'ارسم مخططاً لمنطقة غوص مبيّناً الخندق والبراكين ومستوي بنيوف.',
    whyAr: 'رسم تركيبي يُطلب في نهاية الوحدة، وكل عنصر فيه يُنقَّط.',
    minutes: 10,
    orderAr: [
      'ارسم لوحاً محيطياً ولوحاً قارياً.',
      'ضع الخندق عند نقطة الغوص.',
      'ارسم اللوح الغائص مع بؤر الزلازل المتعمّقة.',
      'أضف الانصهار الجزئي والبراكين على الحافة القارية.',
    ],
    elements: [
      { id: 'plaques', labelAr: 'لوح محيطي كثيف ولوح قاري', points: 2 },
      { id: 'fosse', labelAr: 'الخندق المحيطي', points: 2 },
      { id: 'benioff', labelAr: 'بؤر الزلازل المتعمّقة (مستوي بنيوف)', points: 2 },
      { id: 'fusion', labelAr: 'منطقة الانصهار الجزئي فوق اللوح الغائص', points: 2 },
      { id: 'volcans', labelAr: 'البراكين على الحافة القارية', points: 2 },
      { id: 'eau', labelAr: 'تحرّر الماء من اللوح المتميّه', points: 1 },
    ],
    trapsAr: [
      'غوص اللوح القاري تحت المحيطي: الأكثف هو الذي يغوص.',
      'بؤر زلازل سطحية فقط.',
      'وضع البراكين فوق الخندق مباشرة.',
    ],
    assetSrc: '/assets/images/schemas/domaine3_tectonique/schema_16_subduction.svg',
    altAr: 'مخطط منطقة غوص مع الخندق ومستوي بنيوف والبراكين.',
    lessonId: 'subduction',
  },
  {
    id: 'drill_structure_terre',
    unitId: 10,
    titleAr: 'البنية الداخلية للكرة الأرضية',
    consigneAr: 'ارسم مقطعاً في الكرة الأرضية مبيّناً الطبقات والانقطاعات الكبرى.',
    whyAr: 'الرسم يُطلب مع أسئلة الأمواج الزلزالية؛ الانقطاعات هي مفتاح التنقيط.',
    minutes: 8,
    orderAr: [
      'ارسم دوائر متمركزة: قشرة، وشاح، نواة خارجية، نواة داخلية.',
      'سمِّ الانقطاعات: موهو ثم غوتنبرغ ثم ليمان.',
      'حدّد الحالة الفيزيائية لكل طبقة.',
    ],
    elements: [
      { id: 'croute', labelAr: 'القشرة (قارية ومحيطية)', points: 2 },
      { id: 'manteau', labelAr: 'الوشاح', points: 2 },
      { id: 'noyau_ext', labelAr: 'النواة الخارجية سائلة', points: 2 },
      { id: 'noyau_int', labelAr: 'النواة الداخلية صلبة', points: 2 },
      { id: 'moho', labelAr: 'انقطاع موهو', points: 1 },
      { id: 'gutenberg', labelAr: 'انقطاع غوتنبرغ', points: 1 },
      { id: 'lehmann', labelAr: 'انقطاع ليمان', points: 1 },
    ],
    trapsAr: [
      'نواة خارجية صلبة: غياب الأمواج S يُثبت سيولتها.',
      'خلط موهو بغوتنبرغ.',
      'رسم طبقات بسماكات عشوائية دون سلّم تقريبي.',
    ],
    assetSrc: '/assets/images/schemas/domaine3_tectonique/schema_13_terre.svg',
    altAr: 'مقطع في الكرة الأرضية مع الطبقات والانقطاعات.',
    lessonId: 'seismic_waves',
  },
  {
    id: 'drill_dorsale',
    unitId: 11,
    titleAr: 'مخطط الظهرة المحيطية',
    consigneAr: 'ارسم مخططاً لظهرة محيطية يوضّح تشكّل قشرة محيطية جديدة.',
    whyAr: 'يقابل رسم الغوص في المقارنة بناء/هدم، ويُطلب معه غالباً في نفس التمرين.',
    minutes: 8,
    orderAr: [
      'ارسم المحور مع الوادي الأخدودي.',
      'ضع حجرة الصهارة تحت المحور.',
      'أضف البازلت الوسادي والغابرو ثم تيارات الحمل.',
      'بيّن ابتعاد اللوحين بسهمين متعاكسين.',
    ],
    elements: [
      { id: 'axe', labelAr: 'محور الظهرة والوادي الأخدودي', points: 2 },
      { id: 'chambre', labelAr: 'حجرة الصهارة', points: 2 },
      { id: 'basalte', labelAr: 'البازلت الوسادي في السطح', points: 2 },
      { id: 'gabbro', labelAr: 'الغابرو في العمق', points: 2 },
      { id: 'divergence', labelAr: 'سهما ابتعاد اللوحين', points: 2 },
      { id: 'age', labelAr: 'تزايد عمر الصخور بالابتعاد عن المحور', points: 1 },
    ],
    trapsAr: [
      'سهام متقاربة: الظهرة منطقة تباعد لا تقارب.',
      'وضع الغرانيت في القشرة المحيطية.',
      'نسيان تدرّج الأعمار، وهو البرهان على التوسّع.',
    ],
    assetSrc: '/assets/images/schemas/domaine3_tectonique/schema_15_dorsale.svg',
    altAr: 'مخطط ظهرة محيطية مع حجرة الصهارة والبازلت الوسادي.',
  },
  {
    // Sprint 53 : U6 pèse 12,9 % des points et n'avait qu'un seul schéma
    // (la chaîne photochimique). Or les sujets réclament aussi le BILAN des
    // deux phases — 2017, 2018 et 2026 demandent explicitement « رسم تخطيطي
    // وظيفي » de l'ensemble.
    id: 'drill_bilan_photosynthese',
    unitId: 6,
    titleAr: 'مخطط حصيلة التركيب الضوئي',
    consigneAr:
      'أنجز رسماً تخطيطياً وظيفياً معنوناً يوضّح مرحلتَي التركيب الضوئي و ما تتبادلانه داخل الصانعة الخضراء.',
    whyAr:
      'الجزء الثالث من تمرين 08 نقاط يطلب غالباً هذا المخطط: النقاط تُمنح على الأسهم و التبادلات، لا على جمال الرسم.',
    minutes: 10,
    orderAr: [
      'ارسم الصانعة الخضراء بغشاء التيلاكوئيد و الحشوة، و سمِّ كلاً منهما.',
      'ضع المرحلة الكيموضوئية على التيلاكوئيد: الضوء، الماء، O₂ المطروح.',
      'ضع المرحلة الكيميائية في الحشوة: CO₂ الداخل، المادة العضوية الناتجة.',
      'اربط المرحلتين بسهمَي ATP و NADPH,H⁺ في اتجاه واحد، و بسهم ADP + Pi في الاتجاه المعاكس.',
    ],
    elements: [
      { id: 'el_thylakoide', labelAr: 'غشاء التيلاكوئيد مسمّى', points: 2 },
      { id: 'el_stroma', labelAr: 'الحشوة مسمّاة', points: 2 },
      { id: 'el_h2o_o2', labelAr: 'دخول H₂O و طرح O₂ على مستوى التيلاكوئيد', points: 2 },
      { id: 'el_co2_organique', labelAr: 'دخول CO₂ و إنتاج المادة العضوية في الحشوة', points: 2 },
      { id: 'el_atp_nadph', labelAr: 'سهم ATP و NADPH,H⁺ من التيلاكوئيد نحو الحشوة', points: 2 },
      { id: 'el_retour_adp', labelAr: 'سهم ADP + Pi و NADP⁺ في الاتجاه المعاكس', points: 1 },
      { id: 'el_lumiere', labelAr: 'سهم الطاقة الضوئية الداخل', points: 1 },
      { id: 'el_titre', labelAr: 'عنوان المخطط', points: 1 },
    ],
    trapsAr: [
      'رسم سهم ATP في الاتجاهين: الـ ATP يُنتج في التيلاكوئيد و يُستهلك في الحشوة.',
      'نسيان عودة ADP + Pi و NADP⁺: بدونها المخطط ليس وظيفياً بل قائمة عناصر.',
      'وضع تثبيت CO₂ على التيلاكوئيد: الخلط بين مقرّي المرحلتين يُفقد نقطتين.',
    ],
    assetSrc: '/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg',
    altAr: 'مخطط حصيلة التركيب الضوئي: المرحلة الكيموضوئية على التيلاكوئيد و المرحلة الكيميائية في الحشوة، مع تبادل ATP و NADPH.',
    lessonId: 'd2-u6-l3-calvin',
  },
];

export const SCHEMA_DRILL_BY_ID: Record<string, SchemaDrill> = Object.fromEntries(
  SCHEMA_DRILLS.map((d) => [d.id, d]),
);

/** Total de points d'un exercice. */
export function totalPoints(drill: SchemaDrill): number {
  return drill.elements.reduce((s, e) => s + e.points, 0);
}

/** Score obtenu à partir des identifiants d'éléments cochés. */
export function scoreFromChecked(drill: SchemaDrill, checked: string[]): number {
  const set = new Set(checked);
  return drill.elements.filter((e) => set.has(e.id)).reduce((s, e) => s + e.points, 0);
}

export type DrillVerdict = 'maitrise' | 'a_consolider' | 'a_refaire';

/** Verdict : ≥ 80 % maîtrisé, ≥ 55 % à consolider, sinon à refaire. */
export function verdictFor(drill: SchemaDrill, checked: string[]): DrillVerdict {
  const ratio = scoreFromChecked(drill, checked) / totalPoints(drill);
  if (ratio >= 0.8) return 'maitrise';
  if (ratio >= 0.55) return 'a_consolider';
  return 'a_refaire';
}

/** Les éléments indispensables oubliés (2 points), à revoir en priorité. */
export function missingEssentials(drill: SchemaDrill, checked: string[]): SchemaElement[] {
  const set = new Set(checked);
  return drill.elements.filter((e) => e.points === 2 && !set.has(e.id));
}

export function drillsForUnit(unitId: number): SchemaDrill[] {
  return SCHEMA_DRILLS.filter((d) => d.unitId === unitId);
}

export function drillUnitIds(): number[] {
  return [...new Set(SCHEMA_DRILLS.map((d) => d.unitId))].sort((a, b) => a - b);
}

export const SCHEMA_DRILL_COUNT = SCHEMA_DRILLS.length;
