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
    conceptId: 'unit:1',
    unitId: 1,
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
    altAr: 'مخطط يظهر محصلة الكمونات بعد مشبكية متعددة عند القطعة الابتدائية.',
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
    documentTypeAr: 'تجربة طفرة الهيموغلوبين — بنية → fonction',
    goalAr: 'تفسير كيف يؤدي تغير حمض أميني واحد إلى تغير وظيفة البروتين.',
    vocabulary: ['تتابع الأحماض الأمينية', 'البنية الأولية', 'البنية الثالثية', 'الموقع النشط', 'الطفرات', 'الوظيفة'],
    expectedEvidence: [
      'تغير حمض أميني واحد',
      'البنية الثالثية',
      'الموقع النشط',
      'الوظيفة أو المرض',
    ],
    trapAr: 'لا تعتقد أن كل طفرة تغير الوظيفة؛ بعض الطفرات محايدة.',
    altAr: 'مخطط يظهر سلسلة الأحماض الأمينية، الطفرة النقطية، وتأثيرها على الموقع النشط.',
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
    documentTypeAr: 'مخطط CMH ورفض الطعم',
    goalAr: 'ربط اختلاف جزيئات التوافق النسيجي بتعرف الجهاز المناعي على خلايا الطعم كلاذات.',
    vocabulary: ['الذات', 'اللاذات', 'CMH', 'مستضد', 'طعم', 'رفض'],
    expectedEvidence: [
      'اختلاف CMH بين المعطي والمستقبل',
      'تعرف الجهاز المناعي على الخلايا الغريبة',
      'رفض الطعم غير المتوافق',
    ],
    trapAr: 'لا تعتقد أن رفض الطعم يعتمد فقط على فصيلة الدم.',
    altAr: 'مخطط يظهر خلايا طعم تحمل CMH مختلف عن المستقبل.',
    observationAr: 'يحمل الطعم غير المتوافق جزيئات CMH تختلف عن جزيئات المستقبل ويحدث رفض للطعم.',
    promptObserveAr: 'قارن بين حالة طعم متوافق وحالة طعم غير متوافق: ما الذي يختلف؟',
    promptProduceAr: 'فسّر لماذا يؤدي اختلاف جزيئات CMH بين المعطي والمستقبل إلى رفض الطعم.',
    hintsAr: [
      'انظر إلى جزيئات CMH على سطح الخلايا.',
      'كيف تتعرف اللمفاويات T على الخلايا الذاتية؟',
    ],
    correctionAr:
      'جزيئات CMH تحمل علامة التعرف على الخلايا الذاتية. عند اختلافها بين المعطي والمستقبل، تتعرف الجهاز المناعي على خلايا الطعم كلاذات وترفضها.',
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
    documentTypeAr: 'مخطط الاستجابة الخلطية — LB → بلازمية → أجسام مضادة',
    goalAr: 'تفسير كيف تؤدي اللمفاويات B إلى إنتاج أجسام مضادة نوعية.',
    vocabulary: ['لمفاوية B', 'انتقاء نسيلي', 'تكاثر نسيلي', 'خلية بلازمية', 'جسم مضاد', 'معقد مناعي'],
    expectedEvidence: [
      'تعرف اللمفاوية B على المستضد',
      'تكاثر وتمايز',
      'إفراز أجسام مضادة نوعية',
    ],
    trapAr: 'لا تعتقد أن الأجسام المضادة تفرزها الخلايا اللمفاوية B مباشرة.',
    altAr: 'مخطط يظهر تمايز اللمفاوية B إلى خلايا بلازمية مفرزة للأجسام المضادة.',
    observationAr: 'تتعرف اللمفاوية B على المستضد ثم تتكاثر وتتمايز إلى خلايا بلازمية تفرز أجساماً مضادة.',
    promptObserveAr: 'رتب مراحل الاستجابة الخلطية من تعرف اللمفاوية B إلى ظهور الأجسام المضادة.',
    promptProduceAr: 'اشرح كيف يؤدي التعرف النوعي للمستضد إلى إنتاج أجسام مضادة نوعية.',
    hintsAr: [
      'ما هو دور الانتقاء النسيلي في الاستجابة المناعية؟',
      'ما هي الخلية التي تفرز الأجسام المضادة؟',
    ],
    correctionAr:
      'تتعرف اللمفاوية B على المستضد، تتكاثر تكاثراً نسيلياً، تتمايز إلى خلايا بلازمية تفرز أجساماً مضادة نوعية.',
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
    documentTypeAr: 'مخطط الاستجابة الخلوية — LT → إقصاء خلوي',
    goalAr: 'تفسير كيف تقصي اللمفاويات T الخلايا المصابة أو غير الذاتية.',
    vocabulary: ['لمفاوية T', 'خلية هدف', 'CMH', 'محدد مستضدي', 'تعرف نوعي', 'إقصاء خلوي'],
    expectedEvidence: [
      'لمفاويات T نوعية',
      'تعرف على المحدد المستضدي',
      'إقصاء الخلية الهدف',
    ],
    trapAr: 'لا تعتقد أن الاستجابة الخلوية تعتمد على الأجسام المضادة.',
    altAr: 'مخطط يظهر اللمفاوية T تتعرف على خلية هدف وتقضي عليها.',
    observationAr: 'تنخفض الخلايا الهدف الحية عند وجود لمفاويات T نوعية تتعرف على محددها المستضدي.',
    promptObserveAr: 'قارن عدد الخلايا الهدف الحية بوجود اللمفاويات T النوعية وغيابها.',
    promptProduceAr: 'اشرح كيف يؤدي التعرف النوعي لللمفاويات T إلى إقصاء الخلايا المصابة.',
    hintsAr: [
      'ما هو دور المستقبلات على سطح اللمفاوية T؟',
      'كيف تتعرف اللمفاوية T على الخلية المستهدفة؟',
    ],
    correctionAr:
      'تتعرف اللمفاوية T على المحدد المستضدي المعروض على CMH، تنشط وتفرز مواد سامة تقتل الخلية الهدف.',
    criteria: {
      evidence: ['لمفاويات T نوعية', 'انخفاض الخلايا الهدف'],
      mechanism: ['تعرف نوعي على المحدد المستضدي'],
      conclusion: ['إقصاء الخلية الهدف', 'استجابة مناعية خلوية'],
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
