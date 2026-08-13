export type DocumentAsset =
  | {
      kind: 'table';
      columns: string[];
      rows: string[][];
      captionAr: string;
    }
  | {
      kind: 'curve';
      captionAr: string;
      altAr: string;
      xAxisAr: string;
      yAxisAr: string;
      xScaleAr: [string, string];
      yScaleAr: [string, string];
      points: Array<{ x: number; y: number }>;
    }
  | {
      kind: 'schema';
      src: string;
      altAr: string;
      captionAr?: string;
    }
  | {
      kind: 'micrograph';
      src: string;
      altAr: string;
      captionAr?: string;
    }
  | {
      kind: 'mixed';
      captionAr: string;
      assets: DocumentAsset[];
    };

export type DocumentAssetEntry =
  | { status: 'ready'; asset: DocumentAsset }
  | { status: 'unavailable' };

const curareTable: DocumentAsset = {
  kind: 'table',
  columns: ['الشرط التجريبي', 'تركيز الكورار', 'حالة المستقبل النيكوتيني', 'الاستجابة العضلية'],
  rows: [
    ['شاهد', 'منعدم', 'متاح للأستيل كولين', 'انقباض عادي'],
    ['وجود الكورار', 'منخفض', 'محجوب جزئياً', 'انقباض ضعيف'],
    ['وجود الكورار', 'مرتفع', 'محجوب بدرجة أكبر', 'انقباض ضعيف جداً أو غائب'],
  ],
  captionAr: 'تمثيل نوعي لنتائج تأثير تركيز الكورار في الانقباض العضلي، دون قيم عددية غير موثقة.',
};

const michaelisCurve: DocumentAsset = {
  kind: 'curve',
  captionAr: 'تمثيل نوعي لمنحنى ميكاييلس-منتان: تزداد السرعة ثم تستقر عند Vmax.',
  altAr: 'منحنى نوعي يصعد مع تركيز الركيزة ثم يستوي أفقياً عند السرعة القصوى Vmax.',
  xAxisAr: 'تركيز الركيزة',
  yAxisAr: 'سرعة التفاعل',
  xScaleAr: ['منخفض', 'مرتفع'],
  yScaleAr: ['منخفضة', 'Vmax'],
  points: [
    { x: 0, y: 0 },
    { x: 15, y: 38 },
    { x: 32, y: 64 },
    { x: 52, y: 80 },
    { x: 74, y: 89 },
    { x: 100, y: 93 },
  ],
};

const nmjPpmCurve: DocumentAsset = {
  kind: 'curve',
  captionAr: 'تمثيل نوعي: يقصر زمن كمون اللوحة المحركة كلما ارتفع تركيز الناقل العصبي.',
  altAr: 'منحنى نوعي تنازلي يربط زيادة تركيز الناقل بقصر زمن كمون اللوحة المحركة.',
  xAxisAr: 'تركيز الناقل العصبي',
  yAxisAr: 'زمن كمون اللوحة المحركة',
  xScaleAr: ['منخفض', 'مرتفع'],
  yScaleAr: ['قصير', 'طويل'],
  points: [
    { x: 0, y: 92 },
    { x: 18, y: 75 },
    { x: 38, y: 55 },
    { x: 62, y: 36 },
    { x: 82, y: 24 },
    { x: 100, y: 17 },
  ],
};

const sarinDocument: DocumentAsset = {
  kind: 'mixed',
  captionAr: 'وثيقتان نوعيتان حول تأثير السارين في نشاط AChE ومصير الأستيل كولين.',
  assets: [
    {
      kind: 'curve',
      captionAr: 'الوثيقة 1: ينخفض نشاط AChE عند وجود السارين.',
      altAr: 'منحنى نوعي يبين انخفاض نشاط إنزيم AChE كلما ازداد وجود السارين.',
      xAxisAr: 'وجود السارين',
      yAxisAr: 'نشاط AChE',
      xScaleAr: ['منعدم', 'مرتفع'],
      yScaleAr: ['منخفض', 'مرتفع'],
      points: [
        { x: 0, y: 94 },
        { x: 25, y: 72 },
        { x: 50, y: 47 },
        { x: 75, y: 25 },
        { x: 100, y: 10 },
      ],
    },
    {
      kind: 'table',
      columns: ['الشرط', 'الأستيل كولين في الشق', 'نواتج التفكيك'],
      rows: [
        ['دون سارين', 'مؤقت', 'موجودة'],
        ['مع السارين', 'يبقى في الشق', 'غائبة'],
      ],
      captionAr: 'الوثيقة 2: ملاحظات نوعية موثقة عن مصير الأستيل كولين.',
    },
  ],
};

const rifamycineDocument: DocumentAsset = {
  kind: 'mixed',
  captionAr: 'وثيقتان نوعيتان حول تأثير الريفاميسين في الاستنساخ.',
  assets: [
    {
      kind: 'table',
      columns: ['الشرط', 'الاستنساخ', 'تشكل ARNm'],
      rows: [
        ['دون ريفاميسين', 'يحدث', 'موجود'],
        ['مع الريفاميسين', 'مثبط', 'غائب'],
      ],
      captionAr: 'الوثيقة 1: أثر الريفاميسين في الاستنساخ وتشكّل ARNm.',
    },
    {
      kind: 'table',
      columns: ['الشرط', 'ADN', 'ARNm'],
      rows: [
        ['مع الريفاميسين', 'موجود', 'غائب'],
      ],
      captionAr: 'الوثيقة 2: يبقى ADN موجوداً رغم غياب ARNm.',
    },
  ],
};

// --- Lot 3 du Sprint 2 : documents reconstruits en DONNEES (aucune image requise).
// Le renderer sait deja dessiner 'table' et 'curve' ; ces trois documents etaient
// declares 'unavailable' alors que leurs questions, correction et grille existaient
// deja en entier. Echelles qualitatives : le programme n'en fixe aucune valeur
// numerique, et inventer des chiffres serait une donnee non sourcee.

const enzymePhTempTable: DocumentAsset = {
  kind: 'table',
  columns: ['الشرط التجريبي', 'pH الوسط', 'درجة الحرارة', 'نشاط الإنزيم'],
  rows: [
    ['وسط حمضي بارد', 'منخفض', 'منخفضة', 'ضعيف جداً'],
    ['وسط حمضي معتدل الحرارة', 'منخفض', 'مثلى', 'ضعيف'],
    ['الوسط الأمثل', 'مثالي', 'مثلى', 'أعظمي'],
    ['وسط قاعدي معتدل الحرارة', 'مرتفع', 'مثلى', 'ضعيف'],
    ['وسط أمثل حار', 'مثالي', 'مرتفعة جداً', 'منعدم'],
  ],
  captionAr: 'تمثيل نوعي لنشاط الإنزيم حسب pH ودرجة الحرارة: قمة عند الشروط المثلى وانعدام النشاط عند الحرارة المرتفعة جداً.',
};

const photosynthCurve: DocumentAsset = {
  kind: 'curve',
  captionAr: 'تمثيل نوعي: يرتفع معدل التركيب الضوئي مع شدة الضوء ثم يستقر عند التشبع.',
  altAr: 'منحنى نوعي يصعد مع شدة الإضاءة ثم يستوي أفقياً عند مستوى التشبع.',
  xAxisAr: 'شدة الإضاءة',
  yAxisAr: 'معدل التركيب الضوئي',
  xScaleAr: ['منعدمة', 'مرتفعة'],
  yScaleAr: ['منعدم', 'التشبع'],
  points: [
    { x: 0, y: 2 },
    { x: 18, y: 34 },
    { x: 36, y: 61 },
    { x: 56, y: 80 },
    { x: 78, y: 89 },
    { x: 100, y: 91 },
  ],
};

// q3 demande explicitement de « صادق بربط منحنى السكر والهرمون » : il faut donc
// DEUX courbes, pas une. Le document est monte en 'mixed'.
const glycemieJanuviaDocument: DocumentAsset = {
  kind: 'mixed',
  captionAr: 'وثيقتان نوعيتان لمتابعة نسبة السكر ومستوى الهرمون بعد تناول الجانوفيا.',
  assets: [
    {
      kind: 'curve',
      captionAr: 'الوثيقة 1: تنخفض نسبة السكر في الدم بعد تناول الجانوفيا ثم تستقر.',
      altAr: 'منحنى نوعي تنازلي يبين انخفاض نسبة السكر في الدم مع مرور الزمن بعد الجرعة.',
      xAxisAr: 'الزمن بعد الجرعة',
      yAxisAr: 'نسبة السكر في الدم',
      xScaleAr: ['الجرعة', 'بعد ساعات'],
      yScaleAr: ['منخفضة', 'مرتفعة'],
      points: [
        { x: 0, y: 88 },
        { x: 20, y: 78 },
        { x: 42, y: 60 },
        { x: 64, y: 45 },
        { x: 82, y: 38 },
        { x: 100, y: 35 },
      ],
    },
    {
      kind: 'curve',
      captionAr: 'الوثيقة 2: يرتفع مستوى الهرمون المعزز لإفراز الأنسولين في نفس الفترة.',
      altAr: 'منحنى نوعي تصاعدي يبين ارتفاع مستوى الهرمون المعزز لإفراز الأنسولين مع مرور الزمن.',
      xAxisAr: 'الزمن بعد الجرعة',
      yAxisAr: 'مستوى الهرمون',
      xScaleAr: ['الجرعة', 'بعد ساعات'],
      yScaleAr: ['منخفض', 'مرتفع'],
      points: [
        { x: 0, y: 20 },
        { x: 20, y: 38 },
        { x: 42, y: 58 },
        { x: 64, y: 74 },
        { x: 82, y: 82 },
        { x: 100, y: 85 },
      ],
    },
  ],
};


// --- Lot 4 du Sprint 2 : les quatre unites sans aucun document (U7, U8, U10, U11).
// Toutes les valeurs proviennent des tableaux de synthese du livre officiel corrige
// (`الكتاب_المصحح_v1.0.md`), pages citees dans chaque captionAr. Aucune valeur inventee.
const respirationBilanTable: DocumentAsset = {
  kind: 'table',
  columns: ['المرحلة', 'المقر', 'الشرط', 'الوحدات المختزلة', 'ATP المباشر'],
  rows: [
    ['التحلل السكري', 'الهيولى', 'مادة عضوية', '2 NADH,H⁺', '2'],
    ['أكسدة البيروفات', 'المصفوفة', 'نزع الهيدروجين', '2 NADH,H⁺', '0'],
    ['حلقة كريبس (×2)', 'المصفوفة', 'أستيل-CoA', '6 NADH,H⁺ + 2 FADH₂', '2'],
    ['الفسفرة التأكسدية', 'الغشاء الداخلي (الأعراف)', 'O₂ وغشاء سليم', 'استهلاك الكل', '≈34'],
    ['المجموع (تنفس)', '—', 'وسط هوائي', '—', '38'],
    ['التخمر', 'الهيولى', 'غياب O₂', 'إعادة NAD⁺ موضعياً', '2'],
  ],
  captionAr: 'جدول مراحل الهدم التنفسي ومردودها من ATP — الكتاب المدرسي الرسمي ص 206.',
};

const bilanEnergetiqueTable: DocumentAsset = {
  kind: 'table',
  columns: ['المعيار', 'خلية يخضورية + نهار', 'خلية يخضورية + ليل', 'خلية غير يخضورية'],
  rows: [
    ['العمليات', 'تركيب ضوئي + تنفس', 'تنفس فقط', 'تنفس أو تخمر'],
    ['O₂', 'تصدير', 'استهلاك', 'استهلاك (تنفس فقط)'],
    ['CO₂', 'استهلاك (تثبيت)', 'تصدير', 'تصدير'],
    ['المادة العضوية', 'إنتاج صافٍ', 'استهلاك من المخزون', 'استهلاك كامل'],
    ['حصيلة الطاقة', 'تخزين كامن + ATP', 'صرف المخزون فقط', 'تدبير ATP'],
  ],
  captionAr: 'الحالات الطاقوية الخلوية الثلاث — الكتاب المدرسي الرسمي ص 228.',
};

const structureTerreDocument: DocumentAsset = {
  kind: 'mixed',
  captionAr: 'وثيقتان حول الموجات الزلزالية وانقطاعات البنية الداخلية للأرض — الكتاب الرسمي ص 259–286.',
  assets: [
    {
      kind: 'table',
      columns: ['الموجة', 'الطبيعة', 'السرعة', 'الأوساط المجتازة', 'الترتيب في التسجيل'],
      rows: [
        ['P (أولية)', 'طولية ضغط–تمدد', '6–13 كم/ث', 'صلب + سائل + غاز', '①'],
        ['S (ثانوية)', 'عرضية قصّ', '3.5–7 كم/ث', 'صلب فقط', '②'],
        ['L و R (سطحية)', 'سطحية', '2–4 كم/ث', 'سطح الأرض', '③'],
      ],
      captionAr: 'الوثيقة 1: خصائص الموجات الزلزالية.',
    },
    {
      kind: 'table',
      columns: ['الانقطاع', 'العمق', 'سلوك الموجات', 'الاستنتاج'],
      rows: [
        ['موهو', '5–70 كم', 'ارتفاع مفاجئ في سرعة P', 'حدّ القشرة/البرنس'],
        ['غوتنبرغ', '2900 كم', 'توقف S وهبوط حادّ لـ P', 'اللب الخارجي سائل'],
        ['ليمان', '≈5100 كم', 'ارتفاع سرعة P', 'اللب الداخلي صلب'],
      ],
      captionAr: 'الوثيقة 2: الانقطاعات الزلزالية الكبرى وأعماقها.',
    },
  ],
};

const structuresGeologiquesTable: DocumentAsset = {
  kind: 'table',
  columns: ['المنطقة', 'العملية', 'الصخور الناتجة', 'الشواهد المميزة'],
  rows: [
    ['الظهرة وسط محيطية', 'بناء قشرة محيطية', 'بازلت وسائدي + دوليريت + غابرو', 'ريفت، زلازل ضحلة فقط'],
    ['منطقة الغوص', 'هدم اللوح المحيطي', 'أنديزيت + غرانوديوريت؛ شست أزرق وإكلوجيت', 'خندق، مستوى بينيوف، براكين انفجارية'],
    ['منطقة التصادم', 'تسمّك قشري دون ماغما', 'لا صخور ماغمائية جديدة', 'طيات، فوالق عكسية، أوفيوليت'],
  ],
  captionAr: 'البنيات الجيولوجية الكبرى وشواهدها — الكتاب المدرسي الرسمي ص 287–330.',
};

export const DOCUMENT_ASSETS: Record<string, DocumentAssetEntry> = {
  nmj_ppm: { status: 'ready', asset: nmjPpmCurve },
  ach_jnm: {
    status: 'ready',
    asset: {
      kind: 'schema',
      src: '/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg',
      altAr: 'مخطط للمشبك العصبي العضلي يبين النهاية قبل المشبكية والشق والمستقبلات بعد المشبكية.',
      captionAr: 'مخطط المشبك العصبي العضلي واللوحة المحركة.',
    },
  },
  ppse_ppsi: { status: 'unavailable' },
  curare_table: { status: 'ready', asset: curareTable },
  sarin_gb: { status: 'ready', asset: sarinDocument },
  michaelis: { status: 'ready', asset: michaelisCurve },
  enzyme_ph_temp: { status: 'ready', asset: enzymePhTempTable },
  rifamycine: { status: 'ready', asset: rifamycineDocument },
  translation: { status: 'unavailable' },
  ouchterlony: { status: 'unavailable' },
  electro_hb: { status: 'unavailable' },
  glycemie_januvia: { status: 'ready', asset: glycemieJanuviaDocument },
  membrane_hla: { status: 'unavailable' },
  photosynth: { status: 'ready', asset: photosynthCurve },
  h1_h2_generic: { status: 'unavailable' },
  respiration_bilan: { status: 'ready', asset: respirationBilanTable },
  bilan_energetique: { status: 'ready', asset: bilanEnergetiqueTable },
  structure_terre: { status: 'ready', asset: structureTerreDocument },
  structures_geologiques: { status: 'ready', asset: structuresGeologiquesTable },
};

export function getDocumentAsset(assetKey: string): DocumentAsset | null {
  const entry = DOCUMENT_ASSETS[assetKey];
  return entry?.status === 'ready' ? entry.asset : null;
}

export function isDocumentAssetAvailable(assetKey: string): boolean {
  return getDocumentAsset(assetKey) !== null;
}
