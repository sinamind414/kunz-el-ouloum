// documentAnalysisExercises.ts
// 15 DocumentAnalysisExercise « elite » offline (Speckit §6, G5).
// Branchement exclusif sur ValidationEngine (aucun 2ᵉ correcteur keywords).

import type { ValidationContext } from '../lib/validation/ValidationEngine';

export interface DocAnalysisQuestion {
  id: string;
  verb: string;
  promptAr: string;
  loiFocus: 0 | 1 | 2 | 3 | 4 | 5;
  ctx: ValidationContext;
  templateHint: string;
}

export interface DocAnalysisExercise {
  id: string;
  unitId: number;
  domain: string;
  corpus: 'elite';
  doc: {
    type: 'courbe' | 'tableau' | 'electrophorese' | 'ouchterlony' | 'schema' | 'mixed';
    assetKey: string;
    descriptionAr: string;
  };
  questions: DocAnalysisQuestion[];
  correctionAr: string;
  grilleEntrainement: Array<{ critereAr: string; points: number }>;
  label: string;
}

const LABEL = "Grille d'entraînement Kunz — n'est pas le barème officiel du sujet BAC";

export const DOCUMENT_ANALYSIS_EXERCISES: DocAnalysisExercise[] = [
  {
    id: 'nmj_ppm_courbe',
    unitId: 1,
    domain: 'nerveux',
    corpus: 'elite',
    doc: { type: 'courbe', assetKey: 'nmj_ppm', descriptionAr: 'منحنى زمن الكمون بدلالة تركيز الناقل عند اللوحة المحركة.' },
    questions: [
      {
        id: 'nmj_ppm_courbe_q1', verb: 'حلل', promptAr: 'حلل منحنى تطور كمون اللوحة المحركة بدلالة تركيز الناقل.',
        loiFocus: 2, ctx: { docType: 'quantitative', actionVerb: 'analyse', isNeuromuscular: true },
        templateHint: 'كلما زاد … كلما قصر/طال … (PPM).',
      },
      {
        id: 'nmj_ppm_courbe_q2', verb: 'فسر', promptAr: 'فسّر على المستوى الجزيئي والخلوي سبب انخفاض الكمون.',
        loiFocus: 3, ctx: { docType: 'quantitative', actionVerb: 'interpret', isNeuromuscular: true },
        templateHint: 'يرجع ذلك جزيئياً إلى … وخلوياً إلى …',
      },
    ],
    correctionAr: 'كلما زاد تركيز الناقل كلما قصر زمن كمون اللوحة المحركة (PPM)، لأن تحرراً أكبر للأستيل كولين يفتح قنوات مرتبطة بالربيطة.',
    grilleEntrainement: [
      { critereAr: 'تحديد PPM (لا PPSE)', points: 4 },
      { critereAr: 'علاقة كلما…كلما…', points: 6 },
      { critereAr: 'تفسير جزيئي وخلوي', points: 6 },
      { critereAr: 'وحدات صحيحة', points: 4 },
    ],
    label: LABEL,
  },
  {
    id: 'ach_jnm_schema',
    unitId: 1,
    domain: 'nerveux',
    corpus: 'elite',
    doc: { type: 'schema', assetKey: 'ach_jnm', descriptionAr: 'تخطيط للوحة المحركة يبين المستقبل والقنوات.' },
    questions: [
      {
        id: 'ach_jnm_schema_q1', verb: 'حدد', promptAr: 'حدد نوع القناة التي يفتحها الأستيل كولين عند اللوحة المحركة.',
        loiFocus: 0, ctx: { docType: 'qualitative', actionVerb: 'identify', isNeuromuscular: true },
        templateHint: 'قناة مرتبطة بالربيطة (نيكوتينية)، ليست فولطية.',
      },
      {
        id: 'ach_jnm_schema_q2', verb: 'صف', promptAr: 'صف ما يحدث عند ارتباط الأستيل كولين بالمستقبل.',
        loiFocus: 1, ctx: { docType: 'qualitative', actionVerb: 'describe', isNeuromuscular: true, expectedTargets: ['مستقبل', 'قناة'] },
        templateHint: 'نلاحظ فتح قناة … مما يسمح بعبور …',
      },
    ],
    correctionAr: 'يفتح الأستيل كولين قنوات مرتبطة بالربيطة (نيكوتينية) لا فولطية، مما يسمح بدخول أيونات الصوديوم وتعظيم الكمون.',
    grilleEntrainement: [
      { critereAr: 'تحديد القناة الربيطية', points: 6 },
      { critereAr: 'نفي القناة الفولطية', points: 6 },
      { critereAr: 'وصف بوحدة/مستوى', points: 4 },
      { critereAr: 'مصطلحات دقيقة', points: 4 },
    ],
    label: LABEL,
  },
  {
    id: 'ppse_ppsi_compare',
    unitId: 1,
    domain: 'nerveux',
    corpus: 'elite',
    doc: { type: 'mixed', assetKey: 'ppse_ppsi', descriptionAr: 'مقارنة بين كمون ما بعد التشابك (PPSE) وكمون ما بعد التشابك الاستثاري (PPSI).' },
    questions: [
      {
        id: 'ppse_ppsi_compare_q1', verb: 'قارن', promptAr: 'قارن بين PPSE و PPSI من حيث الاتجاه والآلية.',
        loiFocus: 2, ctx: { docType: 'quantitative', actionVerb: 'compare', isNeuromuscular: true },
        templateHint: 'نلاحظ … بينما … (كلما/بينما).',
      },
      {
        id: 'ppse_ppsi_compare_q2', verb: 'فسر', promptAr: 'فسّر الفرق على المستوى الجزيئي.',
        loiFocus: 3, ctx: { docType: 'mixed', actionVerb: 'interpret', isNeuromuscular: true },
        templateHint: 'يرجع ذلك إلى نوع المستقبل …',
      },
    ],
    correctionAr: 'يختلف PPSE عن PPSI في اتجاه الكمون ونوع المستقبل الأيوني؛ وكلاهما لا يُسمّى PPM الذي يخص اللوحة المحركة فقط.',
    grilleEntrainement: [
      { critereAr: 'تمييز PPSE/PPSI', points: 5 },
      { critereAr: 'علاقة مقارنة صحيحة', points: 5 },
      { critereAr: 'تفسير جزيئي', points: 6 },
      { critereAr: 'احترام المصطلحات', points: 4 },
    ],
    label: LABEL,
  },
  {
    id: 'curare_table',
    unitId: 1,
    domain: 'nerveux',
    corpus: 'elite',
    doc: { type: 'tableau', assetKey: 'curare_table', descriptionAr: 'جدول تجارب تأثير الكورار على الانقباض العضلي.' },
    questions: [
      {
        id: 'curare_table_q1', verb: 'حلل', promptAr: 'حلل نتائج الجدول حسب تركيز الكورار.',
        loiFocus: 2, ctx: { docType: 'quantitative', actionVerb: 'analyse', isNeuromuscular: true },
        templateHint: 'كلما زاد تركيز الكورار كلما …',
      },
      {
        id: 'curare_table_q2', verb: 'فسر', promptAr: 'فسّر آلية عمل الكورار على المستوى الجزيئي.',
        loiFocus: 3, ctx: { docType: 'quantitative', actionVerb: 'interpret', isNeuromuscular: true, expectedTargets: ['مستقبل'] },
        templateHint: 'يرجع ذلك إلى تنافس الكورار مع … على المستقبل.',
      },
    ],
    correctionAr: 'كلما زاد تركيز الكورار كلما ضعف الانقباض، لأنه يتنافس مع الأستيل كولين على المستقبل النيكوتيني ويمنع فتح القناة.',
    grilleEntrainement: [
      { critereAr: 'علاقة كلما…كلما…', points: 6 },
      { critereAr: 'آلية تنافسية', points: 6 },
      { critereAr: 'مستوى جزيئي', points: 4 },
      { critereAr: 'وحدات', points: 4 },
    ],
    label: LABEL,
  },
  {
    id: 'sarin_gb_double',
    unitId: 1,
    domain: 'nerveux',
    corpus: 'elite',
    doc: { type: 'mixed', assetKey: 'sarin_gb', descriptionAr: 'وثيقتان: منحنى نشاط AChE وتخطيط تأثير السارين.' },
    questions: [
      {
        id: 'sarin_gb_double_q1', verb: 'حلل', promptAr: 'حلل منحنى نشاط إنزيم AChE في الوثيقة 1.',
        loiFocus: 2, ctx: { docType: 'quantitative', actionVerb: 'analyse', isNeuromuscular: true, domain: 'enzyme' },
        templateHint: 'كلما … كلما …',
      },
      {
        id: 'sarin_gb_double_q2', verb: 'اقترح فرضية', promptAr: 'اقترح فرضية جزيئية لتأثير السارين على أساس الوثيقتين.',
        loiFocus: 4, ctx: { docType: 'mixed', actionVerb: 'hypothesize', isNeuromuscular: true, expectedTargets: ['إنزيم', 'أستيل كولين'] },
        templateHint: 'نفترض أن السارين يثبط …',
      },
      {
        id: 'sarin_gb_double_q3', verb: 'صادق', promptAr: 'صادق بربط الوثيقتين (وثيقة 1 + وثيقة 2 + رابط).',
        loiFocus: 5, ctx: { docType: 'mixed', actionVerb: 'validate', isNeuromuscular: true },
        templateHint: 'تبين الأولى … والثانية … وبربطهما …',
      },
    ],
    correctionAr: 'نفترض أن السارين يثبط إنزيم AChE، مما يمنع تحلل الأستيل كولين ويزيد بقاءه في الشقّ التشابكي؛ تبين الوثيقة 1 انخفاض النشاط والثانية استمرار الكمون.',
    grilleEntrainement: [
      { critereAr: 'تحليل كمّي (كلما)', points: 5 },
      { critereAr: 'فرضية نفترض أن + هدف', points: 5 },
      { critereAr: 'تركيب وثيقتين + رابط', points: 6 },
      { critereAr: 'احترام PPM/ACh', points: 4 },
    ],
    label: LABEL,
  },
  {
    id: 'michaelis_courbe',
    unitId: 2,
    domain: 'enzyme',
    corpus: 'elite',
    doc: { type: 'courbe', assetKey: 'michaelis', descriptionAr: 'منحنى ميكاييلس-منتان: السرعة بدلالة تركيز الركيزة.' },
    questions: [
      {
        id: 'michaelis_courbe_q1', verb: 'حلل', promptAr: 'حلل منحنى السرعة بدلالة تركيز الركيزة.',
        loiFocus: 2, ctx: { docType: 'quantitative', actionVerb: 'analyse', isNeuromuscular: false, domain: 'enzyme' },
        templateHint: 'كلما زاد التركيز كلما زادت السرعة حتى التشبع.',
      },
      {
        id: 'michaelis_courbe_q2', verb: 'فسر', promptAr: 'فسّر الوصول إلى القيمة العظمية على المستوى الجزيئي.',
        loiFocus: 3, ctx: { docType: 'quantitative', actionVerb: 'interpret', isNeuromuscular: false, domain: 'enzyme', expectedTargets: ['إنزيم'] },
        templateHint: 'يرجع ذلك إلى تشبع مواقع الإنزيم.',
      },
    ],
    correctionAr: 'كلما زاد تركيز الركيزة كلما زادت السرعة حتى الوصول إلى قيمة عظمية ثابتة بسبب تشبع مواقع الإنزيم بالركيزة.',
    grilleEntrainement: [
      { critereAr: 'علاقة كلما…كلما…', points: 6 },
      { critereAr: 'تفسير تشبع جزيئي', points: 6 },
      { critereAr: 'قيمة عظمية + وحدة', points: 4 },
      { critereAr: 'مصطلحات', points: 4 },
    ],
    label: LABEL,
  },
  {
    id: 'enzyme_ph_temp',
    unitId: 2,
    domain: 'enzyme',
    corpus: 'elite',
    doc: { type: 'tableau', assetKey: 'enzyme_ph_temp', descriptionAr: 'جدول نشاط إنزيم حسب pH ودرجة الحرارة.' },
    questions: [
      {
        id: 'enzyme_ph_temp_q1', verb: 'حلل', promptAr: 'حلل تغير النشاط حسب pH ودرجة الحرارة.',
        loiFocus: 2, ctx: { docType: 'quantitative', actionVerb: 'analyse', isNeuromuscular: false, domain: 'enzyme' },
        templateHint: 'نلاحظ قمة عند … بينما تنخفض عند …',
      },
      {
        id: 'enzyme_ph_temp_q2', verb: 'فسر', promptAr: 'فسّر سبب فقدان النشاط عند درجات الحرارة المرتفعة.',
        loiFocus: 3, ctx: { docType: 'quantitative', actionVerb: 'interpret', isNeuromuscular: false, domain: 'enzyme', expectedTargets: ['إنزيم'] },
        templateHint: 'يرجع ذلك إلى تَشَوّه البروتين.',
      },
    ],
    correctionAr: 'يصل النشاط إلى قمته عند pH ودرجة حرارة مثلى، ثم ينخفض بسبب تَشَوّه الإنزيم (تغيّر بنيته) عند الحرارة المرتفعة.',
    grilleEntrainement: [
      { critereAr: 'تحليل جدول (قيمة+وحدة)', points: 5 },
      { critereAr: 'علاقة مقارنة', points: 5 },
      { critereAr: 'سبب تشوه جزيئي', points: 6 },
      { critereAr: 'مصطلحات', points: 4 },
    ],
    label: LABEL,
  },
  {
    id: 'rifamycine_h1h2',
    unitId: 9,
    domain: 'genetique',
    corpus: 'elite',
    doc: { type: 'mixed', assetKey: 'rifamycine', descriptionAr: 'وثيقتان حول تأثير الريفاميسين على النسخ (H1/H2).' },
    questions: [
      {
        id: 'rifamycine_h1h2_q1', verb: 'حلل', promptAr: 'حلل تأثير الريفاميسين في الوثيقة 1.',
        loiFocus: 2, ctx: { docType: 'quantitative', actionVerb: 'analyse', isNeuromuscular: false, domain: 'genetique' },
        templateHint: 'كلما زاد التركيز كلما …',
      },
      {
        id: 'rifamycine_h1h2_q2', verb: 'اقترح فرضية', promptAr: 'اقترح فرضية جزيئية (H1) لتأثيره.',
        loiFocus: 4, ctx: { docType: 'mixed', actionVerb: 'hypothesize', isNeuromuscular: false, domain: 'genetique', expectedTargets: ['إنزيم', 'حمض'] },
        templateHint: 'نفترض أن الريفاميسين يثبط …',
      },
      {
        id: 'rifamycine_h1h2_q3', verb: 'صادق', promptAr: 'صادق بربط الوثيقتين مع معالجة H2 بحذر.',
        loiFocus: 5, ctx: { docType: 'mixed', actionVerb: 'validate', isNeuromuscular: false, domain: 'genetique' },
        templateHint: 'تبين 1 … و2 … وبربطهما … (H2 غير مدعومة لا تُنفى).',
      },
    ],
    correctionAr: 'نفترض أن الريفاميسين يثبط إنزيم ARN بوليميراز (H1)؛ تبين الوثيقة 1 انخفاض النسخ والثانية بقاء الحمض النووي، وبربطهما نستنتج توقف التعبير. أما H2 فغير مدعومة بالمعطيات دون نفي قاطع.',
    grilleEntrainement: [
      { critereAr: 'تحليل كمّي', points: 4 },
      { critereAr: 'فرضية نفترض أن + هدف', points: 5 },
      { critereAr: 'تركيب + حذر H2', points: 7 },
      { critereAr: 'مصطلحات جينية', points: 4 },
    ],
    label: LABEL,
  },
  {
    id: 'translation_schema',
    unitId: 9,
    domain: 'genetique',
    corpus: 'elite',
    doc: { type: 'schema', assetKey: 'translation', descriptionAr: 'تخطيط لآلية الترجمة على مستوى الريبوزوم.' },
    questions: [
      {
        id: 'translation_schema_q1', verb: 'حدد', promptAr: 'حدد مقر التركيب البروتيني ومكوناته من التخطيط.',
        loiFocus: 0, ctx: { docType: 'qualitative', actionVerb: 'identify', isNeuromuscular: false, domain: 'genetique' },
        templateHint: 'على مستوى الريبوزوم في الهيولى انطلاقاً من ARNm.',
      },
      {
        id: 'translation_schema_q2', verb: 'أنجز مخططا', promptAr: 'أنجز مخططاً مُعلّقاً يبيّن خطوات الترجمة.',
        loiFocus: 5, ctx: { docType: 'qualitative', actionVerb: 'schematize', isNeuromuscular: false, domain: 'genetique' },
        templateHint: 'عنوان + بدء → استطالة → إنهاء.',
      },
    ],
    correctionAr: 'يتم تركيب البروتين على مستوى الريبوزوم في الهيولى انطلاقاً من ARNm، عبر بدء ثم استطالة ثم إنهاء.',
    grilleEntrainement: [
      { critereAr: 'تحديد المقر', points: 5 },
      { critereAr: 'مكونات دقيقة', points: 5 },
      { critereAr: 'عنوان المخطط', points: 5 },
      { critereAr: 'خطوات منطقية', points: 5 },
    ],
    label: LABEL,
  },
  {
    id: 'ouchterlony_arcs',
    unitId: 9,
    domain: 'immuno',
    corpus: 'elite',
    doc: { type: 'ouchterlony', assetKey: 'ouchterlony', descriptionAr: 'هالات أوشترلوني لكشف العلاقة بين مستضدات.' },
    questions: [
      {
        id: 'ouchterlony_arcs_q1', verb: 'حلل', promptAr: 'حلل شكل الهالات وما يدل عليه (اندماج/تقاطع).',
        loiFocus: 2, ctx: { docType: 'qualitative', actionVerb: 'analyse', isNeuromuscular: false, domain: 'immuno' },
        templateHint: 'نلاحظ هالة … بينما … (لا كلما!).',
      },
      {
        id: 'ouchterlony_arcs_q2', verb: 'فسر', promptAr: 'فسّر معنى اندماج الهالتين.',
        loiFocus: 3, ctx: { docType: 'qualitative', actionVerb: 'interpret', isNeuromuscular: false, domain: 'immuno' },
        templateHint: 'يرجع ذلك إلى هوية المستضد.',
      },
    ],
    correctionAr: 'نلاحظ اندماج الهالتين مما يدل على هوية المستضدات، بينما يدل تقاطعهما على اختلافها. (وثيقة نوعية: لا كلما).',
    grilleEntrainement: [
      { critereAr: 'تحليل نوعي (بينما لا كلما)', points: 6 },
      { critereAr: 'تفسير هوية المستضد', points: 6 },
      { critereAr: 'مصطلحات مناعية', points: 4 },
      { critereAr: 'لا كلما', points: 4 },
    ],
    label: LABEL,
  },
  {
    id: 'electro_hb',
    unitId: 9,
    domain: 'genetique',
    corpus: 'elite',
    doc: { type: 'electrophorese', assetKey: 'electro_hb', descriptionAr: 'تَرَحُّل كهربائي للهيموغلوبين HbA/HbS.' },
    questions: [
      {
        id: 'electro_hb_q1', verb: 'حلل', promptAr: 'حلل فرق الترحّل بين HbA و HbS.',
        loiFocus: 2, ctx: { docType: 'qualitative', actionVerb: 'analyse', isNeuromuscular: false, domain: 'genetique' },
        templateHint: 'نلاحظ شريط … بينما …',
      },
      {
        id: 'electro_hb_q2', verb: 'فسر', promptAr: 'فسّر الفرق على المستوى الجزيئي (استبدال حمض أميني).',
        loiFocus: 3, ctx: { docType: 'qualitative', actionVerb: 'interpret', isNeuromuscular: false, domain: 'genetique', expectedTargets: ['بروتين', 'حمض'] },
        templateHint: 'يرجع ذلك إلى استبدال حمض أميني في …',
      },
    ],
    correctionAr: 'نلاحظ اختلاف موقع الشريط بين HbA و HbS، ويرجع ذلك جزيئياً إلى استبدال حمض أميني (غلوتامين ← فالين) في سلسلة الهيموغلوبين.',
    grilleEntrainement: [
      { critereAr: 'تحليل نوعي', points: 5 },
      { critereAr: 'سبب جزيئي (حمض أميني)', points: 7 },
      { critereAr: 'مصطلحات', points: 4 },
      { critereAr: 'وحدات/مستويات', points: 4 },
    ],
    label: LABEL,
  },
  {
    id: 'glycemie_januvia',
    unitId: 7,
    domain: 'hormonal',
    corpus: 'elite',
    doc: { type: 'courbe', assetKey: 'glycemie_januvia', descriptionAr: 'منحنى نسبة السكر بعد جرعة جانوفيا.' },
    questions: [
      {
        id: 'glycemie_januvia_q1', verb: 'حلل', promptAr: 'حلل تطور نسبة السكر في الدم.',
        loiFocus: 2, ctx: { docType: 'quantitative', actionVerb: 'analyse', isNeuromuscular: false, domain: 'hormonal' },
        templateHint: 'كلما مرّ الزمن كلما …',
      },
      {
        id: 'glycemie_januvia_q2', verb: 'اقترح فرضية', promptAr: 'اقترح فرضية جزيئية لعمل الجانوفيا.',
        loiFocus: 4, ctx: { docType: 'mixed', actionVerb: 'hypothesize', isNeuromuscular: false, domain: 'hormonal', expectedTargets: ['إنزيم', 'هرمون'] },
        templateHint: 'نفترض أن الجانوفيا يثبط إنزيم …',
      },
      {
        id: 'glycemie_januvia_q3', verb: 'صادق', promptAr: 'صادق بربط منحنى السكر والهرمون.',
        loiFocus: 5, ctx: { docType: 'mixed', actionVerb: 'validate', isNeuromuscular: false, domain: 'hormonal' },
        templateHint: 'تبين 1 … و2 … وبربطهما …',
      },
    ],
    correctionAr: 'نفترض أن الجانوفيا يثبط إنزيم DPP-4 مما يرفع مستوى الهرمون المعزز للأنسولين؛ تبين الوثيقة 1 انخفاض السكر والثانية ارتفاع الهرمون.',
    grilleEntrainement: [
      { critereAr: 'تحليل كمّي (كلما)', points: 4 },
      { critereAr: 'فرضية نفترض أن + هدف', points: 5 },
      { critereAr: 'تركيب وثيقتين', points: 7 },
      { critereAr: 'مصطلحات هرمونية', points: 4 },
    ],
    label: LABEL,
  },
  {
    id: 'membrane_hla_schema',
    unitId: 9,
    domain: 'immuno',
    corpus: 'elite',
    doc: { type: 'schema', assetKey: 'membrane_hla', descriptionAr: 'تخطيط غشاء خلية عارضة مع معقد HLA.' },
    questions: [
      {
        id: 'membrane_hla_schema_q1', verb: 'صف', promptAr: 'صف عناصر الغشاء ودور معقد HLA.',
        loiFocus: 1, ctx: { docType: 'qualitative', actionVerb: 'describe', isNeuromuscular: false, domain: 'immuno', expectedTargets: ['مستقبل', 'قناة'] },
        templateHint: 'نلاحظ … (عنصر … وظيفته …).',
      },
      {
        id: 'membrane_hla_schema_q2', verb: 'أنجز مخططا', promptAr: 'أنجز مخططاً مُعلّقاً للتعرف المناعي.',
        loiFocus: 5, ctx: { docType: 'qualitative', actionVerb: 'schematize', isNeuromuscular: false, domain: 'immuno' },
        templateHint: 'عنوان + مستضد + معقد HLA + خلية T.',
      },
    ],
    correctionAr: 'يظهر الغشاء معقد HLA الذي يعرض المستضد للخلايا التائية؛ الوصف يجب أن يذكر العنصر ووظيفته بدقة.',
    grilleEntrainement: [
      { critereAr: 'وصف بعنصر ووظيفة', points: 6 },
      { critereAr: 'مصطلحات مناعية', points: 4 },
      { critereAr: 'عنوان المخطط', points: 5 },
      { critereAr: 'عناصر منطقية', points: 5 },
    ],
    label: LABEL,
  },
  {
    id: 'photosynth_courbe',
    unitId: 6,
    domain: 'metabo',
    corpus: 'elite',
    doc: { type: 'courbe', assetKey: 'photosynth', descriptionAr: 'منحنى التركيب الضوئي بدلالة شدة الضوء.' },
    questions: [
      {
        id: 'photosynth_courbe_q1', verb: 'حلل', promptAr: 'حلل تطور معدل التركيب الضوئي حسب شدة الضوء.',
        loiFocus: 2, ctx: { docType: 'quantitative', actionVerb: 'analyse', isNeuromuscular: false, domain: 'metabo' },
        templateHint: 'كلما زاد الضوء كلما زاد المعدل حتى التشبع.',
      },
      {
        id: 'photosynth_courbe_q2', verb: 'فسر', promptAr: 'فسّر ثبات المعدل عند الشدة المرتفعة.',
        loiFocus: 3, ctx: { docType: 'quantitative', actionVerb: 'interpret', isNeuromuscular: false, domain: 'metabo', expectedTargets: ['إنزيم'] },
        templateHint: 'يرجع ذلك إلى عامل محدّد (إنزيم/CO2).',
      },
    ],
    correctionAr: 'كلما زادت شدة الضوء كلما زاد معدل التركيب الضوئي حتى التشبع بسبب عامل محدّد (نشاط إنزيم أو توفر CO2).',
    grilleEntrainement: [
      { critereAr: 'علاقة كلما…كلما…', points: 6 },
      { critereAr: 'سبب تشبع', points: 6 },
      { critereAr: 'وحدات', points: 4 },
      { critereAr: 'مصطلحات', points: 4 },
    ],
    label: LABEL,
  },
  {
    id: 'h1_h2_generic_double_doc',
    unitId: 11,
    domain: 'genetique',
    corpus: 'elite',
    doc: { type: 'mixed', assetKey: 'h1_h2_generic', descriptionAr: 'وثيقتان عامتان لتركيب علمي (H1/H2).' },
    questions: [
      {
        id: 'h1_h2_generic_double_doc_q1', verb: 'حلل', promptAr: 'حلل المعطيات في الوثيقتين كل على حدة.',
        loiFocus: 2, ctx: { docType: 'mixed', actionVerb: 'analyse', isNeuromuscular: false, domain: 'genetique' },
        templateHint: 'نلاحظ في 1 … وبينما في 2 …',
      },
      {
        id: 'h1_h2_generic_double_doc_q2', verb: 'صادق', promptAr: 'صادق بتركيب الوثيقتين مع معالجة الفرضية H2 بحذر.',
        loiFocus: 5, ctx: { docType: 'mixed', actionVerb: 'validate', isNeuromuscular: false, domain: 'genetique' },
        templateHint: 'تبين 1 … والثانية … وبربطهما … (H2 غير ضرورية/غير مدعومة لا تُنفى).',
      },
    ],
    correctionAr: 'تبين الوثيقة 1 ظاهرة أولى والثانية ظاهرة ثانية، وبربطهما نستنتج علاقة سببية؛ أما H2 فتُعامل كغير مدعومة بالمعطيات دون نفي قاطع.',
    grilleEntrainement: [
      { critereAr: 'تحليل كل وثيقة', points: 5 },
      { critereAr: 'تركيب + رابط', points: 6 },
      { critereAr: 'حذر H2', points: 5 },
      { critereAr: 'مصطلحات', points: 4 },
    ],
    label: LABEL,
  },
];

export const ELITE_DOC_EXERCISE_COUNT = DOCUMENT_ANALYSIS_EXERCISES.length;
