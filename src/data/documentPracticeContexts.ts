// src/data/documentPracticeContexts.ts
// P1.4 / V3 §3.2 — Contextes de pratique documentaire.
// Chaque document expose objectif, verbe, vocabulaire, preuve attendue, alt text.
// Ordre immuable (V3 §4.4) : type → objectif → verbe → donnée → observation → production.

import type { CoreReflexId } from './reflexes';
import type { ValidationContext } from '../lib/validation/ValidationEngine';

export type DocumentAssetType = 'curve' | 'table' | 'experiment' | 'schema' | 'mixed';

export interface DocumentPracticeContext {
  exerciseId: string;
  questionId: string;
  conceptId: string;
  unitId: number;
  lessonId?: string;
  documentType: DocumentAssetType;
  reflexId?: CoreReflexId;
  goalAr: string;
  vocabulary: string[];
  expectedEvidence: string[];
  trapAr?: string;
  assetSrc?: string;
  altAr: string;
  gallery?: {
    assetSrc?: string;
    altAr: string;
    captionAr?: string;
  }[];
  // V3 §3.2 — étendu pour document vivant complet.
  sourceStatus?: 'manuel_officiel_verifie' | 'adaptation_pedagogique' | 'exercice_kunz' | 'a_valider_enseignant';
  documentTypeAr?: string;
  observationAr: string; // donnée scientifique visible avant production
  promptObserveAr?: string; // demande d'observer, pas de conclure
  promptProduceAr?: string; // production BAC
  hintsAr?: [string, string]; // [où regarder, quel lien]
  correctionAr?: string; // masquée avant tentative
  domain?: ValidationContext['domain'];
  criteria?: {
    evidence: string[];
    mechanism?: string[];
    conclusion?: string[];
  };
}

export const DOCUMENT_PRACTICE_CONTEXTS: DocumentPracticeContext[] = [
  {
    exerciseId: 'michaelis_courbe',
    questionId: 'michaelis_courbe_q1',
    conceptId: 'unit:3',
    unitId: 3,
    documentType: 'curve',
    reflexId: 'analyse',
    goalAr: 'فهم تغير سرعة التفاعل الإنزيمي حسب تركيز الركيزة إلى غاية التشبع.',
    vocabulary: ['الركيزة', 'السرعة', 'التشبع', 'الموقع النشط', 'Vmax'],
    expectedEvidence: [
      'تزداد السرعة مع التركيز',
      'تبلغ السرعة قيمة قصوى',
      'تستقر السرعة عند التشبع',
    ],
    trapAr: 'لا تقل إن الإنزيم يختفي عند بلوغ Vmax.',
    altAr: 'منحنى يصعد مع تركيز الركيزة ثم يستوي أفقياً عند سرعة قصوى.',
    observationAr: 'تزداد سرعة التفاعل مع تركيز الركيزة ثم تستقر عند بلوغ السرعة القصوى Vmax.',
  },
  {
    exerciseId: 'curare_table',
    questionId: 'curare_table_q1',
    conceptId: 'unit:5',
    unitId: 5,
    documentType: 'table',
    reflexId: 'analyse',
    goalAr: 'ربط تغير الانقباض العضلي بتأثير الكورار على المستقبلات النيكوتينية.',
    vocabulary: ['الكورار', 'أستيل كولين', 'مستقبل نيكوتيني', 'قناة مرتبطة بالربيطة', 'انقباض'],
    expectedEvidence: [
      'زيادة تركيز الكورار',
      'انخفاض الانقباض',
      'بقاء/تغير الاستجابة حسب الشروط',
    ],
    trapAr: 'الكورار يمنع الارتباط ولا يدمر الناقل.',
    altAr: 'جدول يوضح انخفاض قوة الانقباض كلما زاد تركيز الكورار.',
    observationAr: 'تنخفض قوة الانقباض كلما ارتفع تركيز الكورار في الوسط.',
  },
  {
    exerciseId: 'nmj_ppm_courbe',
    questionId: 'nmj_ppm_courbe_q1',
    conceptId: 'unit:5',
    unitId: 5,
    documentType: 'curve',
    reflexId: 'analyse',
    goalAr: 'فهم علاقة تركيز الناقل بزمن كمون اللوحة المحركة.',
    vocabulary: ['PPM', 'ناقل عصبي', 'أستيل كولين', 'مستقبل', 'قناة كيميائية'],
    expectedEvidence: [
      'علاقة تركيز الناقل بزمن الكمون',
      'قصر الكمون مع زيادة التركيز',
    ],
    trapAr: 'لا تخلط PPM مع PPSE أو PPSI.',
    altAr: 'منحنى يربط تركيز الناقل بزمن كمون اللوحة المحركة.',
    observationAr: 'يتغير زمن كمون اللوحة المحركة حسب تركيز الناقل العصبي.',
  },
  {
    exerciseId: 'sarin_gb_double',
    questionId: 'sarin_gb_double_q1',
    conceptId: 'unit:5',
    unitId: 5,
    documentType: 'experiment',
    reflexId: 'hypothesize',
    goalAr: 'تحديد آلية تأثير السارين على النقل المشبكي.',
    vocabulary: ['AChE', 'أستيل كولين', 'تثبيط إنزيمي', 'شق مشبكي', 'كمون عمل'],
    expectedEvidence: [
      'بقاء الأستيل كولين',
      'غياب نواتج التفكيك',
      'وجود الإنزيم مع غياب نشاطه',
    ],
    trapAr: 'السارين يثبّط AChE ولا يدمر الناقل مباشرة.',
    altAr: 'وثيقة تجريبية تظهر استمرار الأستيل كولين في الشق المشبكي عند التسمم بالسارين.',
    observationAr: 'يبقى الأستيل كولين في الشق المشبكي وتغيب نواتج تفكيكه عند وجود السارين.',
  },
  {
    exerciseId: 'rifamycine_h1h2',
    questionId: 'rifamycine_h1h2_q1',
    conceptId: 'unit:1',
    unitId: 1,
    documentType: 'table',
    reflexId: 'hypothesize',
    goalAr: 'ربط تأثير الريفاميسين بتثبيط الاستنساخ وتشكيل ARNm.',
    vocabulary: ['ARN بوليميراز', 'ADN', 'ARNm', 'الاستنساخ', 'تثبيط'],
    expectedEvidence: [
      'تثبيط الاستنساخ',
      'غياب تشكل ARNm',
      'ارتباط الريفاميسين بالبوليميراز',
    ],
    trapAr: 'الريفاميسين يمنع الاستنساخ ولا يمنع الترجمة مباشرة.',
    altAr: 'جدول يوضح غياب حلقات H1 وH2 (ARNm) عند إضافة الريفاميسين.',
    observationAr: 'تغيب جزيئات ARNm عند إضافة الريفاميسين رغم وجود ADN.',
  },
  // V3 US-V3-02 — Document vivant uracile marqué (pilote transcription).
  {
    exerciseId: 'uracile_marque',
    questionId: 'uracile_marque_q1',
    conceptId: 'transcription',
    unitId: 1,
    documentType: 'experiment',
    reflexId: 'interpret',
    domain: 'genetique',
    sourceStatus: 'adaptation_pedagogique',
    documentTypeAr: 'تجربة تتبّع اليوراسيل المشع',
    goalAr: 'تفسير مسار ظهور اليوراسيل المشع من النواة إلى الهيولى.',
    vocabulary: ['اليوراسيل', 'النواة', 'الهيولى', 'ARNm', 'الاستنساخ'],
    expectedEvidence: [
      'ظهور الوسم أولاً في النواة',
      'ظهور الوسم لاحقاً في الهيولى',
      'انتقال المعلومة عبر ARNm',
    ],
    trapAr: 'لا تقل إن ADN يخرج من النواة.',
    altAr: 'تجربة: خلية بنواة مشعة، وسّم يظهر في النواة ثم في الهيولى بعد مدة أطول.',
    observationAr: 'بعد مدة قصيرة يظهر الوسم في النواة. بعد مدة أطول يظهر في الهيولى.',
    promptObserveAr: 'أين يظهر الوسم أولاً؟ ثم أين يظهر لاحقاً؟',
    promptProduceAr: 'فسّر ماذا يدل انتقال الوسم من النواة إلى الهيولى.',
    hintsAr: [
      'ركّز على كلمتي: أولاً / لاحقاً.',
      'ما الجزيء الذي يحتوي اليوراسيل ولا يحتوي التايمين؟',
    ],
    correctionAr:
      'يظهر الوسم أولاً في النواة حيث يُركّب ARNm (يحتوي اليوراسيل). ثم يظهر في الهيولى لأن ARNm يحمل نسخة المعلومة. هذا يدل على نسخ المعلومة في النواة ثم نقلها.',
    criteria: {
      evidence: ['أولاً في النواة', 'اولا في النواة', 'لاحقاً في الهيولى', 'لاحقا في الهيولى'],
      mechanism: ['يُركّب ARNm', 'يركب ARNm', 'استنساخ ARNm', 'ينتقل ARNm', 'انتقال ARNm'],
      conclusion: ['المعلومة تُنسخ ثم تُنقل', 'المعلومة تنسخ ثم تنقل', 'يحمل نسخة المعلومة', 'ينقل نسخة المعلومة'],
    },
  },
  // V3 — Document vivant traduction : code génétique, codon / anticodon / ARNt.
  {
    exerciseId: 'codon_anticodon',
    questionId: 'codon_anticodon_q1',
    conceptId: 'traduction',
    unitId: 1,
    documentType: 'schema',
    reflexId: 'interpret',
    domain: 'genetique',
    sourceStatus: 'adaptation_pedagogique',
    documentTypeAr: 'مخطط الترجمة — ارتباط الكودون بمضاد الكودون',
    goalAr: 'ربط الكودون (على ARNm) بمضاد الكودون (على ARNt) وتحديد الحمض الأميني الناقل.',
    vocabulary: ['الكودون', 'مضاد الكودون', 'ARNm', 'ARNt', 'الريبوزوم', 'حمض أميني', 'سلسلة ببتيدية'],
    expectedEvidence: [
      'ارتباط مضاد الكودون بالكودون',
      'حمل كل ARNt حمضاً أمينياً محدداً',
      'الريبوزوم يقرأ الكودونات بالتتابع',
    ],
    trapAr: 'لا تعتقد أن ARNt يحمل الكودون مباشرة.',
    assetSrc: '/assets/images/schemas/domaine1_proteines/schema_32_filter_binding_experiment_modern_ar.svg',
    altAr: 'وثيقة حديثة تبين أن الارتباط النوعي يحتفظ فقط بالزوج الصحيح بين الرامزة و ARNt الموافق.',
    observationAr: 'يرتبط مضاد الكودون على ARNt بالكودون على ARNm في موقع الريبوزوم، ويحمل كل ARNt حمضاً أمينياً محدداً.',
    promptObserveAr: 'حدد موقع الكودون على ARNm ومضاد الكودون على ARNt في الرسم.',
    promptProduceAr: 'فسّر كيف يضمن الاقتران كودون-مضاد كودون ترتيب الأحماض الأمينية حسب رسالة ARNm.',
    hintsAr: [
      'ركّز على طرفي ARNt: مضاد الكودون من جهة والحمض الأميني من الجهة الأخرى.',
      'كيف يعرف ARNt أي حمض أميني يحمل؟',
    ],
    correctionAr:
      'الكودون هو ثلاثية نوكليوتيدات على ARNm. مضاد الكودون هو تسلسل مكمل على ARNt يرتبط بالكودون بالتكامل. يحمل كل ARNt حمضاً أمينياً خاصاً به. يقرأ الريبوزوم الكودونات بالتتابع فيبني السلسلة الببتيدية حسب رسالة ARNm.',
    criteria: {
      evidence: ['الكودون', 'مضاد الكودون', 'ARNm', 'ARNt'],
      mechanism: ['اقتران', 'تكامل', 'الريبوزوم'],
      conclusion: ['ترتيب الأحماض الأمينية', 'سلسلة ببتيدية', 'رسالة ARNm'],
    },
  },
  {
    exerciseId: 'photosynthese_cycle',
    questionId: 'photosynthese_cycle_q1',
    conceptId: 'photosynthese',
    unitId: 6,
    documentType: 'schema',
    reflexId: 'analyse',
    domain: 'metabo',
    sourceStatus: 'adaptation_pedagogique',
    documentTypeAr: 'مخطط الصانعة الخضراء ودور التيلاكويد',
    goalAr: 'تحديد موقع التفاعلات الضوئية وربطها بإنتاج ATP و NADPH.',
    vocabulary: ['التيلاكويد', 'الحشوة', 'الضوء', 'CO2', 'ATP', 'NADPH', 'الغلوكوز'],
    expectedEvidence: [
      'التفاعلات الضوئية على التيلاكويد',
      'إنتاج ATP و NADPH',
      'تثبيت CO2 في الحشوة',
    ],
    trapAr: 'لا تخلط بين التيلاكويد (ضوء) والحشوة (تثبيت CO2).',
    altAr: 'مخطط يظهر التيلاكويد (أغشية مكدّسة) والحشوة (فضاء داخلي) داخل الصانعة الخضراء.',
    observationAr: 'تلتقط أغشية التيلاكويد الضوء وتنتج ATP وNADPH، بينما يثبت CO2 في الحشوة.',
    promptObserveAr: 'أين يحدث التقاط الفوتونات وتحليل الماء؟',
    promptProduceAr: 'حلّل دور التيلاكويد في تحويل الطاقة الضوئية.',
    hintsAr: [
      'انظر إلى الأغشية المكدّسة داخل الصانعة الخضراء.',
      'ما هو المنتج الأولي للطاقة الضوئية؟',
    ],
    correctionAr:
      'التفاعلات الضوئية تتم على أغشية التيلاكويد حيث يُنتج ATP و NADPH ويُنشر O2. أما تثبيت CO2 فيتم في الحشوة/السدى لإنتاج الغلوكوز.',
    criteria: {
      evidence: ['التيلاكويد', 'أغشية التيلاكويد', 'الضوء', 'الفوتونات'],
      mechanism: ['ATP', 'NADPH', 'تحليل الماء', 'ينتج O2'],
      conclusion: ['طاقة ضوئية → طاقة كيميائية', 'تثبيت CO2 في الحشوة'],
    },
  },
  {
    exerciseId: 'synapse_integration',
    questionId: 'synapse_integration_q1',
    conceptId: 'synapse',
    unitId: 5,
    documentType: 'experiment',
    reflexId: 'interpret',
    sourceStatus: 'adaptation_pedagogique',
    documentTypeAr: 'تسجيلات لكمونات بعد مشبكية',
    goalAr: 'تفسير كيف يسمح الإدماج الزماني أو المكاني ببلوغ العتبة وتوليد كمون عمل.',
    vocabulary: ['PPSE', 'PPSI', 'العتبة', 'القطعة الابتدائية', 'إدماج زماني', 'إدماج مكاني'],
    expectedEvidence: [
      'PPSE واحد دون العتبة',
      'تجمع الكمونات بعد المشبكية',
      'بلوغ العتبة وتولد كمون عمل'
    ],
    trapAr: 'لا تقل إن PPSE واحد يولد دائماً كمون عمل.',
    assetSrc: '/assets/images/schemas/domaine1_proteines/schema_30_ligand_gated_channel_modern_ar.svg',
    altAr: 'وثيقة حديثة تبين مستقبلات وقنوات مرتبطة بالربيطة تفتح بعد ارتباط الناقل العصبي على الغشاء بعد المشبكي.',
    observationAr: 'يبقى PPSE واحد دون العتبة، بينما قد يبلغ مجموع كمونات متقاربة العتبة.',
    promptObserveAr: 'قارن بين تنبيه واحد وتنبيهات متقاربة: متى تبلغ المحصلة العتبة؟',
    promptProduceAr: 'فسّر لماذا لا يولد PPSE واحد كمون عمل دائماً، وكيف يؤدي الإدماج إلى بلوغ العتبة.',
    hintsAr: [
      'ابدأ بمقارنة محصلة الكمونات مع قيمة العتبة.',
      'اربط تزامن أو تقارب التنبيهات بتجمع PPSE عند القطعة الابتدائية.'
    ],
    correctionAr:
      'لا يولد PPSE واحد كمون عمل إذا بقي دون العتبة. عند تزامن أو تقارب عدة PPSE يحدث إدماج زماني أو مكاني، فتبلغ المحصلة العتبة على مستوى القطعة الابتدائية ويتولد كمون عمل.',
    criteria: {
      evidence: ['PPSE واحد دون العتبة', 'تجمع الكمونات', 'بلوغ العتبة'],
      mechanism: ['إدماج زماني', 'إدماج مكاني', 'القطعة الابتدائية'],
      conclusion: ['يتولد كمون عمل', 'بلوغ العتبة'],
    },
  },
  {
    exerciseId: 'subduction_water_melting',
    questionId: 'subduction_water_melting_q1',
    conceptId: 'subduction',
    unitId: 9,
    documentType: 'schema',
    reflexId: 'interpret',
    domain: 'tectonique',
    sourceStatus: 'adaptation_pedagogique',
    documentTypeAr: 'مخطط الغوص — تحرير الماء وانصهار الوشاح',
    goalAr: 'تفسير كيف يؤدي غوص اللوح المحيطي إلى تحرير الماء ثم انصهار جزئي للوشاح فوق اللوح الغائص.',
    vocabulary: ['اندساس', 'ماء', 'انصهار جزئي', 'وشاح', 'صهارة', 'بركانية'],
    expectedEvidence: [
      'اندساس الصفيحة المحيطية',
      'تحرير الماء من اللوح الغائص',
      'انصهار جزئي للوشاح',
      'تولد صهارة وبركانية',
    ],
    trapAr: 'لا تنصهر الصفيحة المحيطية الغائصة بالكامل مباشرة لتولد الصهارة.',
    altAr: 'مخطط يظهر اللوح المحيطي الغائص، الماء المتحرر، وانصهار الوشاح فوقه.',
    observationAr: 'يحرر اللوح الغائص الماء، ويظهر الانصهار الجزئي في الوشاح فوقه.',
    promptObserveAr: 'ما الذي يتحرر من اللوح الغائص عند الغوص العميق؟',
    promptProduceAr: 'فسّر كيف يساهم الماء المحرر من اللوح الغائص في تولد الصهارة والبركانية فوق الصفيحة الطافية.',
    hintsAr: [
      'انظر إلى معادن ماء محررة من اللوح الغائص.',
      'ما هي نقطة انصهار الوشاح في وجود الماء؟',
    ],
    correctionAr:
      'عند اندساس الصفيحة المحيطية الباردة الكثيفة تتحرر معادن ماء من الصخور الغائصة. هذا الماء يخفض درجة انصهار الوشاح فوق اللوح الغائص فيحدث انصهار جزئي يولد صهارة أنديزيتية تصعد وتغذي بركانية القوس.',
    criteria: {
      evidence: ['اندساس', 'ماء محرر', 'انصهار جزئي', 'صهارة'],
      mechanism: ['الماء يخفض درجة الانصهار', 'الوشاح فوق اللوح الغائص', 'صهارة أنديزيتية'],
      conclusion: ['بركانية القوس', 'تولد صهارة بسبب الماء'],
    },
  },
  {
    exerciseId: 'mutation_protein_function',
    questionId: 'mutation_protein_function_q1',
    conceptId: 'protein_structure_function',
    unitId: 2,
    documentType: 'experiment',
    reflexId: 'interpret',
    domain: 'genetique',
    sourceStatus: 'adaptation_pedagogique',
    documentTypeAr: 'تجربة طفرة الهيموغلوبين — بنية → وظيفة',
    goalAr: 'تفسير كيف يؤدي تغير حمض أميني واحد إلى تغير وظيفة البروتين.',
    vocabulary: ['تتابع الأحماض الأمينية', 'البنية الأولية', 'البنية الثالثية', 'الموقع النشط', 'الطفرات', 'الوظيفة'],
    expectedEvidence: [
      'تغير حمض أميني واحد',
      'البنية الثالثية',
      'الموقع النشط',
      'الوظيفة أو المرض',
    ],
    trapAr: 'لا تعتقد أن كل طفرة تغير الوظيفة؛ بعض الطفرات محايدة.',
    assetSrc: '/assets/images/schemas/domaine1_proteines/schema_40_hemoglobin_structure_function_modern.svg',
    altAr: 'وثيقة حديثة تبين كيف يؤدي استبدال حمض أميني واحد إلى تغير بنية الهيموغلوبين ثم تغير وظيفة الخلية.',
    gallery: [
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_41_alanine_representations_modern.svg',
        altAr: 'وثيقة حديثة تبين أن الحمض الأميني وحدة بناء لها مجموعة جانبية مميزة.',
        captionAr: 'الحمض الأميني ليس رمزاً مجرداً: طبيعته الكيميائية تؤثر في الطي.',
      },
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_42_secondary_alpha_beta_modern.svg',
        altAr: 'وثيقة حديثة تبين المستويات الثانوية للبروتينات.',
        captionAr: 'البنى الثانوية هي أول نتيجة منظمة لتآثرات السلسلة.',
      },
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_43_secondary_stabilization_modern.svg',
        altAr: 'وثيقة حديثة تبين تآثرات تثبيت البنية الفراغية.',
        captionAr: 'الوظيفة ترتبط بالشكل، والشكل يرتبط بالتثبيت الداخلي.',
      },
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_44_quaternary_hemoglobin_tim_modern.svg',
        altAr: 'وثيقة حديثة تبين أن بعض البروتينات تعتمد أيضاً على بنية رباعية.',
        captionAr: 'أي تغير في وحدة واحدة قد يؤثر في المعقد الكامل.',
      },
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_45_four_levels_structure_modern.svg',
        altAr: 'وثيقة حديثة تلخص المستويات الأربعة لبنية البروتين.',
        captionAr: 'خريطة شاملة للمستويات البنيوية الأربع.',
      },
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_46_folding_pathway_modern.svg',
        altAr: 'وثيقة حديثة تبين أن تغير السلسلة قد يغير مسار الطي نفسه.',
        captionAr: 'تغير مبكر في السلسلة قد ينحرف بالطي نحو شكل مختلف وظيفياً.',
      },
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_28_anagene_mutation_compare_modern_ar.svg',
        altAr: 'وثيقة حديثة شبيهة بمقارنة Anagène تبين اختلافاً موضعياً بين تسلسلين مرتبطين بطفرة.',
        captionAr: 'مقارنة تسلسلية مباشرة: طفرة موضعية تكفي أحياناً لتبديل حمض أميني واحد.',
      },
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_29_anagene_multiple_alignment_modern_ar.svg',
        altAr: 'وثيقة حديثة شبيهة بصف متعدد للتسلسلات تبين الموضع المختلف بين عدة سلاسل.',
        captionAr: 'الاصطفاف المتعدد يساعد على تحديد الموضع الحاسم في التغير البنيوي.',
      },
    ],
    observationAr: 'يتغير حمض أميني في السلسلة، فتتغير طية البروتين وشكل موقعه الوظيفي.',
    promptObserveAr: 'ما الذي يتغير عندما يتغير حمض أميني واحد في سلسلة البروتين؟',
    promptProduceAr: 'فسّر كيف يؤدي تغير حمض أميني واحد إلى تغير وظيفة البروتين.',
    hintsAr: [
      'انظر إلى الحمض الأميني المستبدل وتأثيره على الطية الثالثية.',
      'ما هو دور الموقع النشط في الوظيفة البيولوجية؟',
    ],
    correctionAr:
      'تغير حمض أميني واحد في السلسلة الأولية يمكن أن يغير الطية الثالثية للبروتين، وبالتالي يغير شكل الموقع النشط، مما يعدل الوظيفة البيولوجية أو يسبب مرضاً مثل فقر الدم المنجلي.',
    criteria: {
      evidence: ['تغير حمض أميني واحد', 'البنية الثالثية', 'الموقع النشط'],
      mechanism: ['طية البروتين', 'شكل الموقع النشط', 'تفاعل مع الركيزة'],
      conclusion: ['الوظيفة أو المرض'],
    },
  },
  {
    exerciseId: 'cmh_transplant_compatibility',
    questionId: 'cmh_transplant_compatibility_q1',
    conceptId: 'immunity_self_nonself',
    unitId: 4,
    documentType: 'schema',
    reflexId: 'interpret',
    domain: 'immuno',
    sourceStatus: 'adaptation_pedagogique',
    documentTypeAr: 'مخطط التوافق السطحي — CMH / زمر دموية / رفض الطعم',
    goalAr: 'ربط اختلاف محددات التوافق السطحي بتعرف الجهاز المناعي على خلايا الطعم كلاذات.',
    vocabulary: ['الذات', 'اللاذات', 'CMH', 'مستضد', 'طعم', 'رفض'],
    expectedEvidence: [
      'اختلاف CMH بين المعطي والمستقبل',
      'تعرف الجهاز المناعي على الخلايا الغريبة',
      'رفض الطعم غير المتوافق',
    ],
    trapAr: 'لا تعتقد أن رفض الطعم يعتمد فقط على فصيلة الدم؛ ففكرة المحددات السطحية أوسع من ذلك.',
    assetSrc: '/assets/images/schemas/domaine1_proteines/schema_59b_blood_group_analysis_modern.svg',
    altAr: 'لوحة حديثة تبين أن اختلاف أنماط التراص يعكس اختلاف المحددات السطحية بين الأفراد.',
    gallery: [
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_58_hla_I_II_structure_modern.svg',
        altAr: 'وثيقة حديثة تبين HLA-I و HLA-II كهوية مناعية للخلية.',
        captionAr: 'ربط مباشر بين مثال الزمرة الدموية ومفهوم HLA / CMH.',
      },
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_69_rh_factor_genotype_phenotype_modern.svg',
        altAr: 'وثيقة حديثة تبين أن عامل Rh مثال إضافي على اختلاف العلامات السطحية.',
        captionAr: 'عامل Rh يعمق فكرة أن الخلايا تحمل بطاقات تعرف سطحية متعددة.',
      },
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_55_membrane_proteins_em_modern_ar.svg',
        altAr: 'وثيقة حديثة شبيهة بالمجهر الإلكتروني تبين بروتينات مدمجة داخل الغشاء البلازمي.',
        captionAr: 'الهوية المناعية مرتبطة فعلياً ببروتينات غشائية قابلة للرصد.',
      },
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_56_fluid_mosaic_model_modern_ar.svg',
        altAr: 'وثيقة حديثة تلخص النموذج الفسيفسائي المائع للغشاء مع مواقع البروتينات السطحية.',
        captionAr: 'النموذج الغشائي يفسر تموضع CMH وغيره من العلامات على السطح.',
      },
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_57_membrane_fluidity_fusion_modern_ar.svg',
        altAr: 'وثيقة حديثة تبين سيولة الغشاء وإمكانية تحرك مكوناته البروتينية ضمن الطبقة الدهنية.',
        captionAr: 'سيولة الغشاء تساعد على فهم توزع العلامات السطحية وتبدل تجمعها.',
      },
    ],
    observationAr: 'تُظهر الوثيقة أن اختلاف المحددات السطحية يؤدي إلى عدم توافق خلوي، بينما يدل التشابه على قبول الخلايا كذات.',
    promptObserveAr: 'قارن بين حالتي التوافق وعدم التوافق: ماذا تستنتج حول المحددات السطحية؟',
    promptProduceAr: 'فسّر لماذا يقود اختلاف جزيئات CMH بين المعطي والمستقبل إلى رفض الطعم.',
    hintsAr: [
      'ركّز على المحددات السطحية لا على لون الخلية وحده.',
      'كيف تنتقل من مثال الزمرة الدموية إلى مفهوم CMH؟',
    ],
    correctionAr:
      'اختلاف المحددات السطحية بين الأفراد يبين أن لكل خلية بطاقة تعرف مناعية. جزيئات CMH هي أهم هذه العلامات في الطعوم؛ وعند اختلافها يتعرف الجهاز المناعي على خلايا الطعم كلاذات ويحدث الرفض.',
    criteria: {
      evidence: ['اختلاف CMH', 'رفض الطعم'],
      mechanism: ['تعرف الجهاز المناعي', 'خلايا الطعم كلاذات'],
      conclusion: ['استجابة مناعية ضد الطعم', 'رفض الطعم غير المتوافق'],
    },
  },
  {
    exerciseId: 'lb_antibody_response',
    questionId: 'lb_antibody_response_q1',
    conceptId: 'immunity_humoral_response',
    unitId: 4,
    documentType: 'schema',
    reflexId: 'explain',
    domain: 'immuno',
    sourceStatus: 'adaptation_pedagogique',
    documentTypeAr: 'وثيقة مصلية — ارتفاع γ-غلوبولين أثناء الاستجابة الخلطية',
    goalAr: 'تفسير كيف يؤدي تنشيط اللمفاويات B إلى زيادة الأجسام المضادة في المصل.',
    vocabulary: ['لمفاوية B', 'انتقاء نسيلي', 'تكاثر نسيلي', 'خلية بلازمية', 'جسم مضاد', 'معقد مناعي'],
    expectedEvidence: [
      'تعرف اللمفاوية B على المستضد',
      'تكاثر وتمايز',
      'إفراز أجسام مضادة نوعية',
    ],
    trapAr: 'لا تعتقد أن الأجسام المضادة تفرزها الخلايا اللمفاوية B مباشرة دون تمايز.',
    assetSrc: '/assets/images/schemas/domaine1_proteines/schema_66_gamma_globulin_electrophoresis_modern.svg',
    altAr: 'وثيقة حديثة تبين ازدياد منطقة γ-غلوبولين بعد تنشيط الاستجابة الخلطية.',
    gallery: [
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_62_agglutination_precipitation_modern.svg',
        altAr: 'وثيقة حديثة تبين أن الأجسام المضادة تسبب تراصاً أو ترسباً للمستضدات.',
        captionAr: 'أثر مباشر للاستجابة الخلطية: تراص أو ترسب بفضل الارتباط النوعي.',
      },
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_61_immune_complex_phagocytosis_modern.svg',
        altAr: 'وثيقة حديثة تبين بلعمة المعقدات المناعية بعد تغليفها بالأجسام المضادة.',
        captionAr: 'بعد تشكل المعقد المناعي تسهل البلعمة والإقصاء.',
      },
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_68_affinity_purification_antitoxin_modern.svg',
        altAr: 'وثيقة حديثة تبين استخلاص أجسام مضادة نوعية بفضل ارتباطها الحصري بالمستضد.',
        captionAr: 'برهان مخبري على النوعية: يمكن عزل الأجسام المضادة الموافقة للمستضد فقط.',
      },
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_64_tem_immune_aggregates_modern.svg',
        altAr: 'وثيقة حديثة شبيهة بالمجهر الإلكتروني تبين تجمعات مناعية ناتجة عن ارتباط مستضدات بأجسام مضادة.',
        captionAr: 'ملاحظة مجهرية: تجمعات مناعية بعد الارتباط النوعي.',
      },
    ],
    observationAr: 'بعد تنشيط اللمفاويات B ترتفع منطقة γ-غلوبولين في المصل، ما يدل على زيادة الأجسام المضادة المفرزة من الخلايا البلازمية.',
    promptObserveAr: 'ماذا يحدث لمنطقة γ-غلوبولين بعد التعرض للمستضد؟ وبماذا يرتبط ذلك؟',
    promptProduceAr: 'اشرح كيف يؤدي التعرف النوعي للمستضد إلى تكاثر اللمفاوية B وتمايزها ثم زيادة الأجسام المضادة في المصل.',
    hintsAr: [
      'اربط بين اللمفاوية B والخلية البلازمية.',
      'أي جزء من المصل يمثل الأجسام المضادة؟',
    ],
    correctionAr:
      'تتعرف اللمفاوية B النوعية على المستضد، ثم تتكاثر تكاثراً نسيلياً وتتمايز إلى خلايا بلازمية. هذه الخلايا تفرز أجساماً مضادة نوعية، لذلك ترتفع منطقة γ-غلوبولين في المصل.',
    criteria: {
      evidence: ['لمفاوية B نوعية', 'خلايا بلازمية', 'أجسام مضادة'],
      mechanism: ['انتقاء نسيلي', 'تكاثر', 'تمايز'],
      conclusion: ['إفراز أجسام مضادة نوعية', 'استجابة مناعية خلطية'],
    },
  },
  {
    exerciseId: 'lt_target_cell_response',
    questionId: 'lt_target_cell_response_q1',
    conceptId: 'immunity_cellular_response',
    unitId: 4,
    documentType: 'schema',
    reflexId: 'explain',
    domain: 'immuno',
    sourceStatus: 'adaptation_pedagogique',
    documentTypeAr: 'وثيقة خلوية — انخفاض الخلايا الهدف بوجود LT نوعية',
    goalAr: 'تفسير كيف يثبت انخفاض الخلايا الهدف أن اللمفاويات T تمارس إقصاءً خلوياً نوعياً.',
    vocabulary: ['لمفاوية T', 'خلية هدف', 'CMH', 'محدد مستضدي', 'تعرف نوعي', 'إقصاء خلوي'],
    expectedEvidence: [
      'لمفاويات T نوعية',
      'تعرف على المحدد المستضدي',
      'إقصاء الخلية الهدف',
    ],
    trapAr: 'لا تعتقد أن الاستجابة الخلوية تعتمد على الأجسام المضادة أو أن أي تماس خلوي يكفي للقتل.',
    assetSrc: '/assets/images/schemas/domaine1_proteines/schema_73_target_cell_survival_modern.svg',
    altAr: 'وثيقة حديثة تبين أن عدد الخلايا الهدف ينخفض فقط بوجود لمفاويات T نوعية.',
    gallery: [
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_70_tcr_cmh_target_modern.svg',
        altAr: 'وثيقة حديثة تبين التعرف النوعي بين LT والخلية الهدف عبر CMH-I.',
        captionAr: 'التماس المؤثر يبدأ أولاً بتطابق نوعي بين المستقبل والمحدد المعروض.',
      },
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_72_perforin_granzyme_lysis_modern.svg',
        altAr: 'وثيقة حديثة تبين أن LT تطلق perforines و granzymes بعد التعرف.',
        captionAr: 'بعد التعرف تأتي آلية القتل الموجه.',
      },
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_74_immunological_synapse_specificity_modern.svg',
        altAr: 'وثيقة حديثة تقارن بين تماس نوعي ينجح في الإقصاء وتماس غير نوعي لا يفعل القتل.',
        captionAr: 'التعرف النوعي شرط أساسي قبل الإقصاء الخلوي.',
      },
    ],
    observationAr: 'ينخفض عدد الخلايا الهدف الحية فقط عند وجود لمفاويات T نوعية، بينما يبقى مرتفعاً في غيابها أو عند غياب التطابق النوعي.',
    promptObserveAr: 'قارن منحنى بقاء الخلايا الهدف في حالتي وجود LT نوعية وغيابها: ما الفرق الأساسي؟',
    promptProduceAr: 'اشرح كيف يثبت هذا الاختلاف أن اللمفاويات T تتعرف نوعياً على الخلايا المصابة ثم تقصيها.',
    hintsAr: [
      'ابدأ من الملاحظة: متى ينخفض عدد الخلايا الهدف فعلاً؟',
      'اربط الانخفاض بالتعرف على المحدد المستضدي المعروض على CMH.',
    ],
    correctionAr:
      'عندما تنخفض الخلايا الهدف فقط بوجود لمفاويات T نوعية فهذا يدل على أن الإقصاء ليس عشوائياً، بل يسبقه تعرف نوعي على المحدد المستضدي المعروض على CMH. بعد هذا التعرف تتفعل اللمفاوية T وتقصي الخلية الهدف.',
    criteria: {
      evidence: ['لمفاويات T نوعية', 'انخفاض الخلايا الهدف'],
      mechanism: ['تعرف نوعي على المحدد المستضدي', 'CMH'],
      conclusion: ['إقصاء الخلية الهدف', 'استجابة مناعية خلوية'],
    },
  },
  {
    exerciseId: 'primary_secondary_response',
    questionId: 'primary_secondary_response_q1',
    conceptId: 'immunity_memory',
    unitId: 4,
    documentType: 'curve',
    reflexId: 'interpret',
    domain: 'immuno',
    sourceStatus: 'adaptation_pedagogique',
    documentTypeAr: 'وثيقة تلقيح — مقارنة الاستجابة الأولية بالاستجابة بعد الجرعة التذكيرية',
    goalAr: 'تفسير لماذا تكون الاستجابة بعد الجرعة التذكيرية أسرع وأقوى من الاستجابة الأولى.',
    vocabulary: ['ذاكرة مناعية', 'خلايا ذاكرة', 'استجابة أولية', 'استجابة ثانوية', 'زمن كمون', 'أجسام مضادة'],
    expectedEvidence: [
      'زمن كمون أقصر في الاستجابة الثانية',
      'كمية أجسام مضادة أكبر في الاستجابة الثانية',
      'وجود خلايا ذاكرة من التعرض الأول',
    ],
    trapAr: 'لا تخلط بين الاستجابة الأولية والثانوية من حيث السرعة والشدة، ولا تقل إن الجرعة الثانية تبدأ من الصفر.',
    assetSrc: '/assets/images/schemas/domaine1_proteines/schema_79_vaccine_antibody_followup_modern.svg',
    altAr: 'وثيقة حديثة تبين أن الجرعة التذكيرية ترفع عيار الأجسام المضادة بسرعة أكبر من الجرعة الأولى.',
    gallery: [
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_75_primary_secondary_response_curve_modern.svg',
        altAr: 'وثيقة حديثة تقارن مباشرة بين الاستجابة الأولية والثانوية على منحنى واحد.',
        captionAr: 'منحنى مرجعي: الثانية أسرع وأعلى من الأولى.',
      },
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_76_memory_cell_fate_modern.svg',
        altAr: 'وثيقة حديثة تبين أن التعرض الأول يترك خلايا ذاكرة طويلة البقاء.',
        captionAr: 'الذاكرة المناعية لا تعني بقاء الأجسام المضادة فقط، بل بقاء خلايا متخصصة أيضاً.',
      },
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_77_vaccination_booster_timeline_modern.svg',
        altAr: 'وثيقة حديثة تبين أثر اللقاح الأول والجرعة التذكيرية على شدة الاستجابة.',
        captionAr: 'الجرعة التذكيرية تعطي استجابة أعلى بفضل الذاكرة المناعية.',
      },
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_78_memory_cell_reactivation_modern.svg',
        altAr: 'وثيقة حديثة تبين إعادة تنشيط خلايا الذاكرة بسرعة عند التعرض الثاني.',
        captionAr: 'إعادة التنشيط السريع تفسر قصر زمن الكمون في الاستجابة الثانوية.',
      },
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_80_immunity_big_picture_modern.svg',
        altAr: 'وثيقة تركيبية حديثة تلخص مكان الذاكرة ضمن المسار الكامل للمناعة.',
        captionAr: 'الذاكرة ليست مرحلة منفصلة عن الباقي؛ بل ثمرة للمسار المناعي كله.',
      },
      {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_35_unit1_big_picture_modern.jpg',
        altAr: 'وثيقة حديثة تركيبية تربط من المورثة إلى ARNm ثم الترجمة والتوجيه البروتيني داخل الوحدة 1.',
        captionAr: 'خريطة نهاية الوحدة 1: من المعلومة الوراثية إلى البروتين الوظيفي.',
      },
    ],
    observationAr: 'بعد الجرعة التذكيرية ترتفع الأجسام المضادة بسرعة أكبر وتبلغ مستوى أعلى مقارنة بالجرعة الأولى، مع زمن كمون أقصر.',
    promptObserveAr: 'قارن بين الاستجابة بعد الجرعة الأولى والاستجابة بعد الجرعة التذكيرية: ما الفرق في السرعة والذروة؟',
    promptProduceAr: 'فسّر لماذا تكون الاستجابة بعد الجرعة التذكيرية أسرع وأقوى مع ربط ذلك بخلايا الذاكرة المناعية.',
    hintsAr: [
      'ابدأ بالملاحظة: أي منحنى يرتفع أسرع ويبلغ ذروة أعلى؟',
      'ما الذي بقي من التعرض الأول وجعل الجرعة الثانية لا تبدأ من الصفر؟',
    ],
    correctionAr:
      'تكون الاستجابة بعد الجرعة التذكيرية أسرع وأقوى لأن التعرض الأول كوّن خلايا ذاكرة مناعية. عند التعرض الثاني تتنشط هذه الخلايا بسرعة، وتتكاثر وتتمايز سريعاً إلى خلايا فعالة منتجة لكمية أكبر من الأجسام المضادة.',
    criteria: {
      evidence: ['زمن كمون أقصر', 'كمية أجسام مضادة أكبر', 'خلايا ذاكرة'],
      mechanism: ['تعرض ثاني', 'تكاثر نسيلي سريع', 'تمايز إلى خلايا منتجة'],
      conclusion: ['استجابة ثانوية أقوى وأسرع', 'ذاكرة مناعية'],
    },
  },
  {
    exerciseId: 'seismic_p_s_core',
    questionId: 'seismic_p_s_core_q1',
    conceptId: 'seismic_waves',
    unitId: 9,
    documentType: 'schema',
    reflexId: 'interpret',
    domain: 'tectonique',
    sourceStatus: 'adaptation_pedagogique',
    documentTypeAr: 'مخطط الأمواج P و S عبر طبقات الأرض',
    goalAr: 'ربط تغير سلوك الأمواج الزلزالية بانقطاعات باطن الأرض.',
    vocabulary: [
      'موجات P',
      'موجات S',
      'انقطاع غوتنبرغ',
      'نواة خارجية',
      'وسط سائل',
      'سرعة الانتشار',
    ],
    expectedEvidence: [
      'اختفاء موجات S',
      'تغير سرعة موجات P',
      'النواة الخارجية سائلة',
    ],
    trapAr: 'لا تعتقد أن الموجات S تنتشر في جميع الوسائط.',
    altAr: 'مخطط يظهر انتشار الأمواج الزلزالية واختفاء S عند النواة الخارجية.',
    observationAr: 'تختفي موجات S عند النواة الخارجية وتتغير سرعة موجات P عند الانقطاعات.',
    promptObserveAr: 'ما الذي يحدث لسرعة الموجات P و S عند الانقطاعات المختلفة؟',
    promptProduceAr: 'فسّر لماذا يدل اختفاء الموجات S على سيولة النواة الخارجية.',
    hintsAr: [
      'انظر إلى سلوك الموجات S عند النواة الخارجية.',
      'ما هي الخاصية الفيزيائية للنواة الخارجية التي تمنع انتشار الموجات S؟',
    ],
    correctionAr:
      'الموجات S لا تنتشر في السوائل؛ لذلك يختفي جزء S عند النواة الخارجية السائلة، بينما تنكسر الموجات P.',
    criteria: {
      evidence: ['اختفاء موجات S', 'تغير سرعة P'],
      mechanism: ['موجات S لا تنتشر في السوائل', 'قوى القص'],
      conclusion: ['النواة الخارجية سائلة'],
    },
  },
  // --- Contextes ajoutés : sans eux, `handleValidate` déréférençait `practice!`
  // et le bouton « صحّح إجابتي » lançait un TypeError (bouton mort, aucune trace).
  {
    exerciseId: 'nmj_ppm_courbe',
    questionId: 'nmj_ppm_courbe_q2',
    conceptId: 'unit:5',
    unitId: 5,
    documentType: 'curve',
    reflexId: 'interpret',
    goalAr: 'تفسير قصر زمن كمون اللوحة المحركة جزيئياً وخلوياً.',
    vocabulary: ['أستيل كولين', 'مستقبل نيكوتيني', 'قناة مرتبطة بالربيطة', 'الصوديوم', 'إزالة الاستقطاب'],
    expectedEvidence: [
      'تحرر كمية أكبر من الناقل',
      'فتح قنوات مرتبطة بالربيطة',
      'دخول الصوديوم وإزالة الاستقطاب',
    ],
    trapAr: 'القنوات هنا مرتبطة بالربيطة وليست فولطية.',
    altAr: 'منحنى يربط تركيز الناقل بزمن كمون اللوحة المحركة.',
    observationAr: 'يقصر زمن كمون اللوحة المحركة كلما ارتفع تركيز الناقل العصبي.',
  },
  {
    exerciseId: 'ach_jnm_schema',
    questionId: 'ach_jnm_schema_q1',
    conceptId: 'unit:5',
    unitId: 5,
    documentType: 'schema',
    // حدد/صف sont des « supporting skills » ; leur réflexe fondamental reste
    // `analyse` : « وصف ما تلاحظه في الوثيقة دون تفسير ».
    reflexId: 'analyse',
    goalAr: 'تحديد نوع القناة التي يفتحها الأستيل كولين على مستوى اللوحة المحركة.',
    vocabulary: ['أستيل كولين', 'مستقبل نيكوتيني', 'قناة مرتبطة بالربيطة', 'اللوحة المحركة'],
    expectedEvidence: [
      'قناة مرتبطة بالربيطة',
      'مستقبل نيكوتيني',
    ],
    trapAr: 'ليست قناة فولطية: فتحها يتم بارتباط الناقل لا بتغير الكمون.',
    altAr: 'مخطط للمشبك العصبي العضلي يبين المستقبلات بعد المشبكية.',
    observationAr: 'يبين المخطط ارتباط الأستيل كولين بمستقبلات الغشاء بعد المشبكي على مستوى اللوحة المحركة.',
  },
  {
    exerciseId: 'ach_jnm_schema',
    questionId: 'ach_jnm_schema_q2',
    conceptId: 'unit:5',
    unitId: 5,
    documentType: 'schema',
    // حدد/صف sont des « supporting skills » ; leur réflexe fondamental reste
    // `analyse` : « وصف ما تلاحظه في الوثيقة دون تفسير ».
    reflexId: 'analyse',
    goalAr: 'وصف ما يحدث عند ارتباط الأستيل كولين بمستقبله.',
    vocabulary: ['أستيل كولين', 'مستقبل', 'قناة', 'الصوديوم', 'إزالة الاستقطاب'],
    expectedEvidence: [
      'ارتباط الناقل بالمستقبل',
      'فتح القناة',
      'عبور الصوديوم',
    ],
    trapAr: 'الوصف يقتصر على ما يُرى: لا تُدرج الاستنتاج قبل أوانه.',
    altAr: 'مخطط للمشبك العصبي العضلي يبين النهاية قبل المشبكية والشق والمستقبلات.',
    observationAr: 'يرتبط الأستيل كولين بالمستقبل النيكوتيني فتُفتح القناة ويعبر الصوديوم نحو الداخل.',
  },
  {
    exerciseId: 'curare_table',
    questionId: 'curare_table_q2',
    conceptId: 'unit:5',
    unitId: 5,
    documentType: 'table',
    reflexId: 'interpret',
    goalAr: 'تفسير ضعف الانقباض بالتنافس الجزيئي بين الكورار والأستيل كولين.',
    vocabulary: ['الكورار', 'أستيل كولين', 'مستقبل نيكوتيني', 'تنافس', 'انقباض'],
    expectedEvidence: [
      'تنافس الكورار مع الأستيل كولين',
      'احتلال المستقبل النيكوتيني',
      'منع فتح القناة',
    ],
    trapAr: 'الكورار يمنع الارتباط ولا يدمر الناقل ولا المستقبل.',
    altAr: 'جدول يوضح انخفاض قوة الانقباض كلما زاد تركيز الكورار.',
    observationAr: 'تنخفض قوة الانقباض كلما ارتفع تركيز الكورار في الوسط.',
  },
  {
    exerciseId: 'sarin_gb_double',
    questionId: 'sarin_gb_double_q2',
    conceptId: 'unit:5',
    unitId: 5,
    documentType: 'mixed',
    reflexId: 'hypothesize',
    goalAr: 'اقتراح فرضية جزيئية لتأثير السارين انطلاقاً من الوثيقتين.',
    vocabulary: ['السارين', 'AChE', 'تثبيط إنزيمي', 'أستيل كولين', 'الشق المشبكي'],
    expectedEvidence: [
      'نفترض أن السارين يثبط',
      'إنزيم AChE',
      'بقاء الأستيل كولين',
    ],
    trapAr: 'الفرضية تُصاغ بـ«نفترض أن…» ولا تُقدَّم كنتيجة مؤكدة.',
    altAr: 'وثيقتان: منحنى نشاط AChE وجدول الاستجابة العضلية.',
    observationAr: 'تبين الوثيقة 1 انخفاض نشاط إنزيم AChE والوثيقة 2 تغير الاستجابة العضلية.',
  },
  {
    exerciseId: 'sarin_gb_double',
    questionId: 'sarin_gb_double_q3',
    conceptId: 'unit:5',
    unitId: 5,
    documentType: 'mixed',
    reflexId: 'validate',
    goalAr: 'المصادقة على الفرضية بتركيب معطيات الوثيقتين.',
    vocabulary: ['AChE', 'أستيل كولين', 'الشق المشبكي', 'تقلص دائم', 'تثبيط'],
    expectedEvidence: [
      'تبين الوثيقة 1 انخفاض النشاط',
      'تبين الوثيقة 2 تغير الاستجابة',
      'بربطهما نستنتج',
    ],
    trapAr: 'المصادقة تتطلب ذكر الوثيقتين معاً ثم الرابط بينهما.',
    altAr: 'وثيقتان: منحنى نشاط AChE وجدول الاستجابة العضلية.',
    observationAr: 'تبين الوثيقة 1 انخفاض نشاط AChE والوثيقة 2 استمرار الاستجابة العضلية.',
  },
  {
    exerciseId: 'michaelis_courbe',
    questionId: 'michaelis_courbe_q2',
    conceptId: 'unit:3',
    unitId: 3,
    documentType: 'curve',
    reflexId: 'interpret',
    goalAr: 'تفسير بلوغ السرعة القصوى بتشبع المواقع النشطة للإنزيم.',
    vocabulary: ['الموقع النشط', 'التشبع', 'الركيزة', 'Vmax', 'معقد إنزيم-ركيزة'],
    expectedEvidence: [
      'تشبع المواقع النشطة',
      'كل الإنزيم مرتبط بالركيزة',
      'ثبات السرعة عند Vmax',
    ],
    trapAr: 'لا تقل إن الإنزيم يختفي أو يُستهلك عند بلوغ Vmax.',
    altAr: 'منحنى يصعد مع تركيز الركيزة ثم يستوي أفقياً عند سرعة قصوى.',
    observationAr: 'تستقر سرعة التفاعل عند قيمة قصوى Vmax رغم زيادة تركيز الركيزة.',
  },
  {
    exerciseId: 'rifamycine_h1h2',
    questionId: 'rifamycine_h1h2_q2',
    conceptId: 'unit:1',
    unitId: 1,
    documentType: 'mixed',
    reflexId: 'hypothesize',
    goalAr: 'اقتراح فرضية جزيئية لتأثير الريفاميسين على النسخ.',
    vocabulary: ['الريفاميسين', 'ARN بوليميراز', 'النسخ', 'ARNm', 'تثبيط'],
    expectedEvidence: [
      'نفترض أن الريفاميسين يثبط',
      'إنزيم ARN بوليميراز',
      'توقف النسخ',
    ],
    trapAr: 'الفرضية تُصاغ بـ«نفترض أن…» ولا تُقدَّم كنتيجة مؤكدة.',
    altAr: 'وثيقتان حول تأثير الريفاميسين على النسخ وعلى الحمض النووي.',
    observationAr: 'تبين الوثيقة 1 انخفاض النسخ والوثيقة 2 بقاء الحمض النووي سليماً.',
  },
  {
    exerciseId: 'rifamycine_h1h2',
    questionId: 'rifamycine_h1h2_q3',
    conceptId: 'unit:1',
    unitId: 1,
    documentType: 'mixed',
    reflexId: 'validate',
    goalAr: 'المصادقة على H1 مع معالجة H2 بحذر دون نفي قاطع.',
    vocabulary: ['الريفاميسين', 'ARN بوليميراز', 'النسخ', 'الحمض النووي', 'فرضية'],
    expectedEvidence: [
      'تبين الوثيقة 1 انخفاض النسخ',
      'تبين الوثيقة 2 بقاء الحمض النووي',
      'بربطهما نستنتج',
    ],
    trapAr: 'الفرضية غير المدعومة بالمعطيات تُعامل كغير مؤكدة، ولا تُنفى نفياً قاطعاً.',
    altAr: 'وثيقتان حول تأثير الريفاميسين على النسخ وعلى الحمض النووي.',
    observationAr: 'تبين الوثيقة 1 انخفاض النسخ والوثيقة 2 بقاء الحمض النووي سليماً.',
  },
  // --- Lot 3 du Sprint 2 : contextes des 3 documents reconstruits en donnees.
  // Rediges AVANT de rendre les documents visibles : sans eux, `handleValidate`
  // n'aurait pas plante (la garde defensive est en place) mais le bouton
  // « corriger » serait reste inerte -- soit le meme mur pour l'eleve.
  // Le reflexId suit le verbe reel de chaque question (حلل=analyse,
  // فسر=interpret, اقترح فرضية=hypothesize, صادق=validate).
  {
    exerciseId: 'enzyme_ph_temp',
    questionId: 'enzyme_ph_temp_q1',
    conceptId: 'unit:3',
    unitId: 3,
    documentType: 'table',
    reflexId: 'analyse',
    goalAr: 'قراءة جدول مزدوج المدخل وربط نشاط الإنزيم بشرطي pH ودرجة الحرارة.',
    vocabulary: ['الإنزيم', 'pH', 'درجة الحرارة', 'الشروط المثلى', 'النشاط الأعظمي'],
    expectedEvidence: [
      'يبلغ النشاط قيمته العظمى عند الشروط المثلى',
      'ينخفض النشاط كلما ابتعد pH عن قيمته المثلى',
      'ينعدم النشاط عند درجة الحرارة المرتفعة جداً',
    ],
    trapAr: 'الجدول يوصف ولا يفسَّر في هذه المرحلة: اكتفِ بقراءة القيم دون ذكر سبب جزيئي.',
    altAr: 'جدول يبين نشاط الإنزيم حسب pH ودرجة الحرارة مع قمة عند الشروط المثلى.',
    observationAr: 'يبلغ نشاط الإنزيم قيمته العظمى عند pH مثالي ودرجة حرارة مثلى، وينخفض كلما ابتعدنا عن هذه الشروط حتى ينعدم عند الحرارة المرتفعة جداً.',
  },
  {
    exerciseId: 'enzyme_ph_temp',
    questionId: 'enzyme_ph_temp_q2',
    conceptId: 'unit:3',
    unitId: 3,
    documentType: 'table',
    reflexId: 'interpret',
    goalAr: 'تفسير فقدان النشاط الإنزيمي عند الحرارة المرتفعة بتشوه البنية الفراغية.',
    vocabulary: ['تَشَوّه البروتين', 'البنية الفراغية', 'الموقع النشط', 'التكامل البنيوي', 'الإنزيم'],
    expectedEvidence: [
      'ترتفع درجة الحرارة فوق القيمة المثلى',
      'تتشوه البنية الفراغية للإنزيم',
      'يفقد الموقع النشط تكامله مع الركيزة',
    ],
    trapAr: 'الإنزيم لا « يموت » ولا يُستهلك: بنيته الفراغية هي التي تتشوه.',
    altAr: 'جدول يبين انعدام النشاط الإنزيمي عند درجات الحرارة المرتفعة جداً.',
    observationAr: 'يفقد الإنزيم نشاطه عند الحرارة المرتفعة لأن بنيته الفراغية تتشوه فيفقد موقعه النشط تكامله مع الركيزة.',
  },
  {
    exerciseId: 'glycemie_januvia',
    questionId: 'glycemie_januvia_q1',
    conceptId: 'unit:3',
    unitId: 3,
    documentType: 'curve',
    reflexId: 'analyse',
    goalAr: 'تحليل تطور نسبة السكر في الدم بعد تناول الجانوفيا باستعمال صيغة « كلما ».',
    vocabulary: ['نسبة السكر في الدم', 'الجرعة', 'الزمن', 'الانخفاض', 'الاستقرار'],
    expectedEvidence: [
      'تنخفض نسبة السكر بعد تناول الجرعة',
      'كلما مر الزمن كلما انخفضت النسبة',
      'تستقر النسبة عند مستوى منخفض',
    ],
    trapAr: 'لا تقفز إلى آلية الدواء: هذا السؤال تحليل للمنحنى فقط.',
    altAr: 'منحنى تنازلي يبين انخفاض نسبة السكر في الدم مع مرور الزمن بعد الجرعة.',
    observationAr: 'كلما مر الزمن بعد تناول الجانوفيا كلما انخفضت نسبة السكر في الدم حتى تستقر عند مستوى منخفض.',
  },
  {
    exerciseId: 'glycemie_januvia',
    questionId: 'glycemie_januvia_q2',
    conceptId: 'unit:3',
    unitId: 3,
    documentType: 'mixed',
    reflexId: 'hypothesize',
    goalAr: 'اقتراح فرضية جزيئية لعمل الجانوفيا انطلاقاً من الوثيقتين.',
    vocabulary: ['فرضية', 'إنزيم DPP-4', 'تثبيط', 'هرمون', 'الأنسولين'],
    expectedEvidence: [
      'نفترض أن الجانوفيا يثبط إنزيماً',
      'يرتفع مستوى الهرمون المعزز لإفراز الأنسولين',
      'تنخفض نسبة السكر في الدم نتيجة لذلك',
    ],
    trapAr: 'الفرضية تُصاغ بـ « نفترض أن » ولا تُقدَّم كحقيقة مثبتة.',
    altAr: 'وثيقتان: منحنى انخفاض السكر ومنحنى ارتفاع الهرمون بعد الجرعة.',
    observationAr: 'نفترض أن الجانوفيا يثبط إنزيم DPP-4 فيرتفع مستوى الهرمون المعزز لإفراز الأنسولين وتنخفض نسبة السكر في الدم.',
  },
  {
    exerciseId: 'glycemie_januvia',
    questionId: 'glycemie_januvia_q3',
    conceptId: 'unit:3',
    unitId: 3,
    documentType: 'mixed',
    reflexId: 'validate',
    goalAr: 'المصادقة على الفرضية بالربط بين منحنى السكر ومنحنى الهرمون.',
    vocabulary: ['المصادقة', 'الوثيقة 1', 'الوثيقة 2', 'الربط', 'التوافق الزمني'],
    expectedEvidence: [
      'تبين الوثيقة 1 انخفاض نسبة السكر',
      'تبين الوثيقة 2 ارتفاع مستوى الهرمون',
      'يؤكد الربط بين الوثيقتين صحة الفرضية',
    ],
    trapAr: 'المصادقة تقتضي استغلال الوثيقتين معاً: الاكتفاء بواحدة لا يصادق على الفرضية.',
    altAr: 'وثيقتان متزامنتان: انخفاض السكر مقابل ارتفاع الهرمون.',
    observationAr: 'تبين الوثيقة 1 انخفاض نسبة السكر وتبين الوثيقة 2 ارتفاع مستوى الهرمون في نفس الفترة، وبربطهما نصادق على الفرضية المقترحة.',
  },
  {
    exerciseId: 'photosynth_courbe',
    questionId: 'photosynth_courbe_q1',
    conceptId: 'unit:6',
    unitId: 6,
    documentType: 'curve',
    reflexId: 'analyse',
    goalAr: 'تحليل تطور معدل التركيب الضوئي حسب شدة الإضاءة إلى غاية التشبع.',
    vocabulary: ['شدة الإضاءة', 'معدل التركيب الضوئي', 'التشبع', 'كلما', 'الاستقرار'],
    expectedEvidence: [
      'كلما زادت شدة الإضاءة كلما زاد المعدل',
      'يبلغ المعدل مستوى التشبع',
      'يستقر المعدل رغم زيادة الإضاءة',
    ],
    trapAr: 'المنحنى يُحلَّل قبل أن يُفسَّر: لا تذكر العامل المحدد في هذا السؤال.',
    altAr: 'منحنى يصعد مع شدة الإضاءة ثم يستوي أفقياً عند التشبع.',
    observationAr: 'كلما زادت شدة الإضاءة كلما زاد معدل التركيب الضوئي حتى يبلغ مستوى التشبع فيستقر.',
  },
  {
    exerciseId: 'photosynth_courbe',
    questionId: 'photosynth_courbe_q2',
    conceptId: 'unit:6',
    unitId: 6,
    documentType: 'curve',
    reflexId: 'interpret',
    goalAr: 'تفسير ثبات معدل التركيب الضوئي عند الشدات المرتفعة بمفهوم العامل المحدد.',
    vocabulary: ['العامل المحدد', 'التشبع', 'CO2', 'نشاط إنزيمي', 'المرحلة القاتمة'],
    expectedEvidence: [
      'يستقر المعدل رغم ارتفاع شدة الإضاءة',
      'يصبح الضوء غير محدد للتفاعل',
      'يحد عامل آخر (CO2 أو نشاط إنزيمي) من المعدل',
    ],
    trapAr: 'التشبع لا يعني توقف التركيب الضوئي بل ثبات معدله.',
    altAr: 'منحنى يستوي أفقياً عند الشدات المرتفعة للإضاءة.',
    observationAr: 'يثبت المعدل عند الشدات المرتفعة لأن الضوء لم يعد العامل المحدد، فيحد عامل آخر مثل توفر CO2 أو النشاط الإنزيمي من التفاعل.',
  },
];

export function getDocumentPracticeContext(
  exerciseId: string,
  questionId: string
): DocumentPracticeContext | undefined {
  return DOCUMENT_PRACTICE_CONTEXTS.find(
    (c) => c.exerciseId === exerciseId && c.questionId === questionId
  );
}

// V3 US-V3-02 — récupère un contexte documentaire par exerciseId (pilote transcription).
export function getDocumentPracticeContextByExercise(exerciseId: string): DocumentPracticeContext | undefined {
  return DOCUMENT_PRACTICE_CONTEXTS.find((c) => c.exerciseId === exerciseId);
}
