// correcteurV1.ts
// Banque de mots-clés du correcteur V1 — Sciences de la Nature et de la Vie (3AS, Sciences expérimentales).
//
// CONTRAT : chaque mot-clé est issu exclusivement des sources officielles suivantes :
//   [L1] الكتاب_المصحح_v1.0.md        — livre scolaire officiel algérien corrigé (334 p., 11 unités)
//   [L2] 504601676-كتاب-العلوم-للطالبة-اكرام-بوزار.txt — livre de révision (élève tête de classe)
//   [L3] LIVRE MANHADJIYA.md           — guide de méthodologie BAC (الكلمات المفتاحية، الأفعال الأدائية)
//   [L4] PROGRAMME NATIONAL SCIENCE VIE BAC - Copie.txt — programme national détaillé
//   [L5] التدرج-السنوي-للتعلمات-2017.txt — progression annuelle officielle (Ministère, جوان 2017)
//   [L6] دليل-الأستاذ-2017.txt          — guide officiel de l'enseignant (Ministère, 2017)
// Le test src/correcteurV1.test.ts vérifie la traçabilité : chaque mot-clé doit apparaître
// dans au moins une de ces sources. Aucun terme ajouté "à la main" sans source.
// Mots-clés [L5] = الموارد المستهدفة mot à mot (exigibles BAC : « يمتحن التلميذ على
// ما جاء في المنهاج وليس على المحتوى المعرفي الموجود في الكتاب المدرسي »).
//
// COUCHE DICTIONNAIRE (build 2026-09-14 — src/data/dictionaries/dictionnaire_final.json) :
// en complément de la banque L1..L6 ci-dessous (JAMAIS modifiée), les entités du
// DICTIONNAIRE FINAL (617 entités, build généré — sources = fichiers data/) enrichissent
// le RETOUR PÉDAGOGIQUE (entitesReconnues de evaluerReponseKeywords) ; elles ne
// gonflent PLUS le dénominateur du chemin PAR DÉFAUT (audit 2026-09-16 : un pool de
// 128–280 formes rendait le seuil de couverture mathématiquement inatteignable).
// Règle moteur du build appliquée (voir dictionnaireCorrecteur.ts) :
//   · notation sur fiabilite « officiel » + « verifie » uniquement ;
//   · « a_valider » = piste + flag AMBIGUITE_LEXICALE — tolérée, JAMAIS notée ;
//   · rattachement aux unités via les refs sources (D1U1..D3U3 → ids 1..11).

import { normalizeAr, motPresentDans } from './lib/validation/normalizeAr';
import {
  evaluerEntites,
  formesArUnite,
  type EntiteDetectee,
} from './data/dictionaries/dictionnaireCorrecteur';

export type DomaineCorrecteur = 1 | 2 | 3;

export interface CorrecteurUnite {
  uniteId: number;
  domaine: DomaineCorrecteur;
  titre: string;
  /** Mots-clés scientifiques officiels (arabe + sigles latins techniques). */
  motsCles: string[];
  /** Provenance (étiquettes L1..L6 — voir docs/sources/README.md). */
  sources: string[];
}

export const SOURCES_LABELS: Record<string, string> = {
  L1: 'الكتاب_المصحح_v1.0.md',
  L2: '504601676-كتاب-العلوم-للطالبة-اكرام-بوزار.txt',
  L3: 'LIVRE MANHADJIYA.md',
  L4: 'PROGRAMME NATIONAL SCIENCE VIE BAC - Copie.txt',
  L5: 'التدرج-السنوي-للتعلمات-2017.txt',
  L6: 'دليل-الأستاذ-2017.txt',
};

// ══════════════════════════════════════════════════════════════════════════════
// DOMAINE 1 — التخصص الوظيفي للبروتينات
// ══════════════════════════════════════════════════════════════════════════════

export const CORRECTEUR_V1_UNITES: CorrecteurUnite[] = [
  {
    uniteId: 1,
    domaine: 1,
    titre: 'تركيب البروتين',
    motsCles: [
      'ADN', 'ARN', 'ARNm', 'ARNt', 'ARNr',
      'مورثة', 'نواة', 'الهيولى', 'المعلومة الوراثية', 'التعبير المورثي', 'أحماض أمينية',
      'القواعد الأزوتية', 'روابط هيدروجينية', 'ARN بوليميراز', 'استنساخ',
      'السلسلة المستنسخة', 'تكامل قاعدي', 'التكامل', 'يوراسيل', 'رامزة',
      'الشفرة الوراثية', 'رامزة الانطلاق', 'رامزات التوقف', 'الرامزة المضادة',
      'متعدد الريبوزوم', 'ريبوزوم', 'موقع A', 'موقع P', 'رابطة ببتيدية',
      'تنشيط', 'الأمينو أسيل', 'الترجمة', 'الاستنساخ المتعدد', 'استطالة',
      'الإنترونات', 'الإكزونات', 'القطع الدالة', 'القطع غير الدالة',
      'النيوكليوتيدات', 'التصوير الإشعاعي الذاتي', 'الريبونوكلياز', 'تعدد الرموز',
      // [L5] الموارد المستهدفة (exigibles BAC — التدرج السنوي 2017)
      'مقر تركيب البروتين', 'انتقال المعلومة الوراثية من النواة', 'حل شفرة المعلومة',
      'شروط التركيب',
      // [L6] دليل الأستاذ 2017 (corrigés officiels)
      'الحمض الريبي النووي الرسول', 'رامزة AUG', 'الانتخاب اللمي',
    ],
    sources: ['L1', 'L2', 'L5', 'L6'],
  },
  {
    uniteId: 2,
    domaine: 1,
    titre: 'العلاقة بين بنية ووظيفة البروتين',
    motsCles: [
      'فقر الدم المنجلي', 'البنية الفراغية', 'البنية الأولية', 'البنية الثانوية',
      'البنية الثالثية', 'البنية الرابعية', 'اللولب ألفا', 'الصفيحة بيتا',
      'روابط هيدروجينية', 'روابط شاردية', 'جسور كبريتية', 'كارهة للماء',
      'الهيموغلوبين', 'الميوغلوبين', 'الإنسولين', 'الليزوزيم', 'الموقع الفعال',
      'مجموعة كربوكسيلية', 'مجموعة أمينية', 'الجذر R', '20 حمضاً أمينياً',
      'حمضية', 'قاعدية', 'متعادلة', 'الحمقلية', 'الأمفوتيرية', 'نقطة التعادل',
      'الرابطة الببتيدية', 'طفرة', 'الموقع 6', 'التخريب', 'المنجلي',
      'الطرف الأميني', 'الطرف الكربوكسيلي', 'مناطق الانعطاف', 'الأوراق المطوية',
      'الكيراتين', 'الترحيل الكهربائي',
      // [L5] الموارد المستهدفة (التدرج السنوي 2017)
      'تدخل الأحماض الأمينية في تشكيل البروتين',
      // [L6] دليل الأستاذ 2017 (corrigés officiels)
      'الفبرووين', 'pHi', 'سلوك الأحماض', 'جسور ثنائية الكبريت',
    ],
    sources: ['L1', 'L2', 'L5', 'L6'],
  },
  {
    uniteId: 3,
    domaine: 1,
    titre: 'النشاط الإنزيمي للبروتينات',
    motsCles: [
      'إنزيم', 'محفز بيولوجي', 'ركيزة', 'الموقع الفعال', 'معقد',
      'النشا', 'أميلاز', 'مالتوز', 'غلوكوز', 'سرعة التفاعل', 'Vmax',
      'تشبع', 'المفتاح والقفل', 'تكيف مستحث', 'الحرارة المثلى',
      'pH المثلى', 'تخريب غير عكسي', 'كاتلاز', 'البيبسين', 'التربسين',
      'البيبسينوجين', 'الشروط المثلى', 'نوعية', 'تثبيط',
      'التكامل الحفزي', 'محلول اليود', 'سكر مختزل', 'الراشح',
      // [L5] الموارد المستهدفة (التدرج السنوي 2017)
      'شروط الوسط المثلى', 'معقد أنزيم-مادة تفاعل',
      // [L6] دليل الأستاذ 2017 (corrigés officiels)
      'عدم تحمل اللكتوز', 'إنزيم السكراز', 'إنزيم المالتاز',
    ],
    sources: ['L1', 'L2', 'L5', 'L6'],
  },
  {
    uniteId: 4,
    domaine: 1,
    titre: 'دور البروتينات في الدفاع عن الذات',
    motsCles: [
      // R3 (évaluation 80 copies, 2026-09-16) : الذات/اللاذات (mots vides,
      // jamais productifs en matching) remplacés par les formes pleines du
      // concept ; termes précis du contexte transfusion (sujet bac2025 Ex3)
      // ajoutés — voir docs/copies-bac2025 (harnais scripts/evaluer-copies.ts).
      'مناعة الذات', 'مناعة غير الذات', 'HLA', 'معقد التوافق النسيجي', 'HLA-I', 'HLA-II',
      'المستضد', 'أجسام مضادة', 'خلايا بلازمية', 'معقد مناعي', 'بلعمة',
      'المتمم', 'LB', 'BCR', 'الانتقاء النسيلي', 'خلايا ذاكرة',
      'الاستجابة الأولية', 'الاستجابة الثانوية', 'اللقاح', 'LTc', 'LT8',
      'البرفورين', 'الغرانزيمات', 'نقي العظام', 'التيموسية', 'TCR',
      'LT4', 'الإنترلوكين', 'تقديم المستضد', 'الاستجابة الخلطية', 'الاستجابة الخلوية',
      'المناعة غير النوعية', 'المناعة النوعية', 'VIH', 'CD4', 'الاستنساخ العكسي',
      'معقد الهجوم الغشائي', 'اللمفاويات السامة', 'اللمفاويات المساعدة',
      'التسامح الذاتي', 'الغلوبيولينات المناعية', 'المناعة المكتسبة', 'رفض الطعم',
      'العدوى الانتهازية', 'GP120',
      // [bac2025 S2-Ex3] contexte transfusion (copies réelles) — R3
      'الجلسمة', 'رفض الجلسمة', 'الزمرة الدموية', 'العامل الريزوسي', 'نقل الدم',
      // [L5] الموارد المستهدفة (التدرج السنوي 2017)
      'التمييز بين الذات', 'مظاهر التعرف', 'التخلص من المعقد المناعي',
      'مصدر الأجسام المضادة', 'طريقة تأثير الخلايا اللمفاوية التائية',
      'مصدر الخلايا اللمفوية التائية السامة', 'آلية تحفيز الخلايا البائية والتائية',
      'اختيار نمط الاستجابة المناعية المناسبة', 'سبب العجز الجهاز المناعي',
      // [L6] دليل الأستاذ 2017 (corrigés officiels)
      'الوسم المناعي', 'مستضد D', 'دور البلعميات في القضاء', 'الأنترلوكين 2',
      'التعرف المزدوج', 'صدمة حلولية',
    ],
    sources: ['L1', 'L2', 'L5', 'L6'],
  },
  {
    uniteId: 5,
    domaine: 1,
    titre: 'دور البروتينات في الاتصال العصبي',
    motsCles: [
      'المنعكس العضلي', 'المشبك', 'النخاع الشوكي', 'شق مشبكي', 'اللوحة المحركة',
      'كمون الراحة', 'كمون العمل', 'مضخة', 'نفاذية انتقائية', 'المشبك الكيميائي',
      'الناقل العصبي', 'أستيل كولين', 'حويصلات مشبكية', 'مستقبلات',
      'PPSE', 'PPSI', 'الأستيل كولين استراز', 'زوال الاستقطاب', 'عودة الاستقطاب',
      'فرط الاستقطاب', 'العتبة', 'الإدماج الزمني', 'الإدماج الفضائي',
      'المورفين', 'المادة P', 'الأنكيفالين', 'الإدمان', 'قانون الكل أو لا شيء',
      'المبلغ العصبي', 'الكمون الغشائي', 'النهاية المشبكية', 'مضخة الصوديوم-بوتاسيوم',
      'المحور الأسطواني', 'الدوبامين', 'الغلوتامات', 'الإندورفين',
      // [L5] الموارد المستهدفة (التدرج السنوي 2017)
      'آلية النقل المشبكي بواسطة المبلغات العصبية', 'ترجمة الرسالة العصبية قبل مشبكية',
      'مصدر كمون العمل', 'آلية الإدماج العصبي', 'تأثير المخدرات في مستوى المشابك',
      // [L6] دليل الأستاذ 2017 (corrigés officiels)
      'زوال استقطاب الغشاء بعد مشبكي', 'فرط استقطاب الغشاء بعد مشبكي',
      'مضخة Na+/K+', 'تثبت 3 شوارد الصوديوم', 'Tetrodotoxine', 'Tetraethyl-ammonium',
      'قنوات الكيميائية', 'قنوات الفولطية', 'الكالسيوم في الزر المشبكي',
    ],
    sources: ['L1', 'L2', 'L5', 'L6'],
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // DOMAINE 2 — التحوّلات الطاقوية
  // ══════════════════════════════════════════════════════════════════════════════

  {
    uniteId: 6,
    domaine: 2,
    titre: 'آليات تحويل الطاقة الضوئية إلى طاقة كيميائية كامنة',
    motsCles: [
      'التركيب الضوئي', 'الطاقة الضوئية', 'طاقة كيميائية كامنة', 'يخضور', 'النشا',
      'CO2', 'H2O', 'الصانعة الخضراء', 'التيلاكويد', 'الغرانا', 'الحشوة',
      'PSI', 'PSII', 'نواقل الإلكترونات', 'ATP سنتاز', 'NADPH',
      'حلقة كالفن', 'RuBisCO', 'RuDP', 'المرحلة الكيموضوئية', 'المرحلة الكيموحيوية',
      'أكسدة الماء', 'الفسفرة الضوئية', 'تثبيت الكربون', 'الاختزال', 'تجديد',
      'APG', 'PGal', 'مخطط Z', 'الستروما',
      'تجربة هيل', 'الكيسيات', 'الصفائح الحشوية', 'الأنظمة الضوئية',
      'الورقة المبرقشة', 'حمض فسفوغليسيريك', 'فسفوغليسيرألدهيد',
      // [L5] الموارد المستهدفة (التدرج السنوي 2017)
      'آلية المرحلة الكيموضوئية', 'مصير البروتونات الناتجة عن التحلل الضوئي للماء',
      'آلية إرجاع الـ CO2 على مستوى الحشوة', 'دورة كالفن وبنسون',
      // [L6] دليل الأستاذ 2017 (corrigés officiels)
      'تجربة ياغندورف', 'الناقل T1', 'مركب سداسي الكربون', 'حمض الفوسفو غليسيريك',
      'الريبولوز ثنائي الفوسفات', 'مختلف الصبغات',
    ],
    sources: ['L1', 'L2', 'L5', 'L6'],
  },
  {
    uniteId: 7,
    domaine: 2,
    titre: 'آليات تحويل الطاقة الكيميائية الكامنة في الجزيئات العضوية إلى ATP',
    motsCles: [
      'التنفس', 'الطاقة الكيميائية الكامنة', 'غلوكوز', 'ATP', 'الميتوكوندري',
      'الأعراف', 'المادة الأساسية', 'التحلل السكري', 'حمض البيروفيك', 'NADH',
      'أستيل مرافق الإنزيم', 'حلقة كريبس', 'FADH2', 'الفسفرة التأكسدية',
      'السلسلة التنفسية', 'تدرج بروتوني', 'ATP سنتاز', 'المستقبل الأخير',
      '38 ATP',       'التخمر الكحولي', 'الإيتانول', 'التخمر اللبني', 'اللاكتات',
      'نزع الهيدروجين', 'نزع الكربوكسيل', 'الأكسدة', 'الغشاء الداخلي',
      'المصفوفة', 'الفراغ بين الغشائين', 'البيروفات', 'الدين الأكسجيني',
      'الخميرة', 'الفسفرة على مستوى الركيزة',
      // [L5] الموارد المستهدفة (التدرج السنوي 2017)
      'هدم الركيزة العضوية', 'آلية تحويل الطاقة الكامنة في الجزيئات العضوية',
      'مادة الأيض المستعملة', 'مختلف النشاطات الحيوية المستهلكة',
      // [L6] دليل الأستاذ 2017 (corrigés officiels)
      'دورة كريبس', 'نزع الكربوكسيل التأكسدية', 'الطاقة الكلية 2860 كيلوجول',
      'مردود التنفس', 'أخضر جانوس',
    ],
    sources: ['L1', 'L2', 'L5', 'L6'],
  },
  {
    uniteId: 8,
    domaine: 2,
    titre: 'تحويل الطاقة على المستوى ما فوق البنية الخلوية',
    motsCles: [
      'الحصيلة الطاقوية', 'التركيب الضوئي', 'التنفس', 'التخمر', 'الصانعة الخضراء',
      'الميتوكوندري', 'ATP', 'ADP', 'غلوكوز', 'نشا', 'CO2', 'O2',
      '38 ATP', '2 ATP', 'السلسلة الغذائية', 'المنتج', 'المستهلك', 'المفكك',
      'تدفق الطاقة', 'المادة تدور', 'نهار', 'ليل', 'اليخضورية',
      'خلية يخضورية', 'خلية غير يخضورية', 'مبادلات الغاز',
      // [L5] الموارد المستهدفة (التدرج السنوي 2017)
      'مخطط تحصيلي للتحولات الطاقوية',
    ],
    sources: ['L1', 'L2', 'L5', 'L6'],
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // DOMAINE 3 — التكتونية العامة
  // ══════════════════════════════════════════════════════════════════════════════

  {
    uniteId: 9,
    domaine: 3,
    titre: 'النشاط التكتوني للصفائح',
    motsCles: [
      'الصفائح التكتونية', 'القشرة الأرضية', 'الغلاف الصخري', 'الغلاف الموري',
      'زلازل', 'براكين', 'الظهرة وسط محيطية', 'الخندق', 'فالق تحويلي',
      'سلسلة جبلية', 'حلقة النار', 'التباعد', 'تقارب', 'الغوص', 'تصادم',
      'الانزلاق', 'سان أندرياس', 'المغنطة المتناظرة', 'زحزحة القارات',
      'الطاقة الداخلية', 'تيارات الحمل', 'البرنس', 'القشرة المحيطية', 'القشرة القارية',
      'الأنديزيت', 'مستوى بينيوف', 'توسع قاع المحيط', 'الانتشار',
      'اللوح الغائص', 'قوس بركاني', 'الصهير البازلتي', 'تفكك العناصر المشعة',
      // [L5] الموارد المستهدفة (التدرج السنوي 2017)
      'مظاهر حركة التباعد وعواقبها', 'عواقب التوسع المحيطي',
      'المحرك الدافع لزحزحة الصفائح التكتونية',
      // [L6] دليل الأستاذ 2017 (corrigés officiels)
      'دور تيارات الحمل', 'درجة حرارة الماغما 570', 'نقطة تورى',
      'المحرك الأساسي للصفائح', 'مستوى بنيوف',
    ],
    sources: ['L1', 'L2', 'L5', 'L6'],
  },
  {
    uniteId: 10,
    domaine: 3,
    titre: 'بنية الكرة الأرضية',
    motsCles: [
      'الموجات الزلزالية', 'السيسمومتر', 'البؤرة', 'المركز السطحي', 'الموجة P',
      'موجات S', 'مناطق الظل', 'انقطاع موهو', 'انقطاع غوتنبرغ', 'انقطاع ليمان',
      'القشرة القارية', 'الغرانيت', 'القشرة المحيطية', 'البازلت', 'الغابرو',
      'البرنس', 'البيريدوتيت', 'الأوليفين', 'البيروكسين', 'النواة', 'الحديد',
      'النيكل', 'النواة الخارجية', 'النواة الداخلية', 'الأوفيوليت', 'النيازك',
      'التثليث', 'المجال المغناطيسي',
      'السيسموغراف', 'السيزموغرام', 'العمق البؤري', 'السطوح الفاصلة',
      'السيال', 'السيما',
      // [L5] الموارد المستهدفة (التدرج السنوي 2017)
      'نموذج لبنية الكرة الأرضية يتضمن الأغلفة والانقطاعات',
      'التركيب الكيميائي للمعطف',
    ],
    sources: ['L1', 'L2', 'L5', 'L6'],
  },
  {
    uniteId: 11,
    domaine: 3,
    titre: 'النشاط التكتوني والبنيات الجيولوجية المرتبطة به',
    motsCles: [
      'الظهرات وسط محيطية', 'توسع قاع المحيط', 'الريفت', 'فوالق تحويلية',
      'مداخن', 'الانصهار الجزئي', 'البيريدوتيت', 'ماغما بازلتية',
      'بازلت وسائدي', 'الدوليريت', 'الغابرو', 'الغرفة المغماتية', 'الغوص',
      'الخندق المحيطي', 'منشور تراكم', 'الشست الأزرق', 'الإكلوجيت', 'الأنديزيت',
      'الغرانوديوريت', 'تصادم', 'الطيات', 'فوالق عكسية', 'مغتربة',
      'الأوفيوليت', 'سربنتينيت', 'دورة ويلسون', 'محيط تيثيس', 'الهيمالايا',
      'البرنس', 'ألوشطون', 'مداخن هيدروحرارية',
      'قوس بركاني', 'الانجرافات', 'الغلوكوفان', 'شواهد التقلص',
      'شواهد محيط قديم', 'تسمك قشري', 'النفاثات السوداء',
      // [L5] الموارد المستهدفة (التدرج السنوي 2017)
      'التضاريس والظواهر المرتبطة بالبناء', 'الحوادث التي تعقب الغوص',
      // [L6] دليل الأستاذ 2017 (corrigés officiels)
      'وسائد صخرية', 'مستوى بينيوف', 'المستوى الثاني لسلوك مطاطي',
      'تحلل الغابرو', 'الغلوكونا', 'الجادييت', 'الغرونا',
      'الفالق الجبهي القبائلي', 'ميكرو قارة الألبوران', 'التصادم والطفو',
      'دخول الماء وطرده', 'مصادر السحنات', 'معدن الغلوكوفان',
    ],
    sources: ['L1', 'L2', 'L5', 'L6'],
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// Évaluation par couverture de mots-clés (compatible moteur ValidationEngine)
// ══════════════════════════════════════════════════════════════════════════════

export interface ResultatKeywords {
  uniteId: number;
  /** Mode de scoring : 'attendus' = barème de la question ; 'defaut' = banque L1–L6 de l'unité. */
  mode: 'attendus' | 'defaut';
  /** Nombre de mots-clés de l'unité présents dans la réponse. */
  trouve: number;
  /** Nombre total de mots-clés de l'unité considérés. */
  total: number;
  /** Couverture 0..1. */
  couverture: number;
  /** Mots-clés requis mais absents. */
  manquants: string[];
  /** Vrai si la réponse couvre au moins le seuil du mode courant. */
  passe: boolean;
  /** Liste des mots-clés trouvés (retour pédagogique). */
  trouves: string[];
  /** Entités du DICTIONNAIRE FINAL reconnues (fiabilite officiel+verifie — règle moteur). */
  entitesReconnues: EntiteDetectee[];
}

/** Seuil mode « attendus » : une réponse complète couvre ~2/3 des attendus de la question. */
export const SEUIL_KEYWORDS = 0.6;

/**
 * Seuil mode « defaut » (AUDIT 2026-09-16) : la cible est la banque L1–L6 COMPLÈTE
 * de l'unité (49–60 termes), pas les attendus d'une question précise. Une réponse
 * substantielle couvrant un sous-thème majeur atteint ~1/4 des mots-clés de l'unité ;
 * exiger 60 % d'une unité entière est irréaliste (constat : 10 % pour une réponse
 * modèle riche sur un pool de 128 termes). CE MODE RESTE UN DIAGNOSTIC de couverture
 * d'unité — la notation formelle passe par les attendus explicites ou le barème.
 */
export const SEUIL_KEYWORDS_DEFAUT = 0.25;

/**
 * Pool enrichi : mots-clés L1..L6 (contrat de traçabilité — JAMAIS modifiés) +
 * formes arabes du DICTIONNAIRE FINAL (fiabilite officiel+verifie — règle moteur
 * du build) rattachées à l'unité via ses refs sources (D1U1..D3U3 → ids 1..11).
 * Dédupliqué par forme normalisée, mots-clés L1..L6 prioritaires.
 * AUDIT 2026-09-16 : ce pool ne sert PLUS au scoring du chemin par défaut (le
 * dénominateur gonflé rendait le seuil inatteignable) — il reste exposé pour
 * l'inspection/le rappel lexical ; les variantes dictionnaire remontent dans
 * evaluerReponseKeywords via entitesReconnues. Un appel avec attendus ne
 * consomme que les attendus fournis.
 */
export function motsClesUniteEnrichis(uniteId: number): string[] {
  const unite = CORRECTEUR_V1_UNITES.find((u) => u.uniteId === uniteId);
  if (!unite) return [];
  const pool = [...unite.motsCles];
  const vus = new Set<string>();
  for (const kw of pool) {
    const nk = normalizeAr(kw);
    if (nk) vus.add(nk);
  }
  for (const forme of formesArUnite(uniteId)) {
    const nf = normalizeAr(forme);
    if (!nf || vus.has(nf)) continue;
    vus.add(nf);
    pool.push(forme);
  }
  return pool;
}

/**
 * Évalue une réponse d'élève contre la banque de mots-clés d'une unité.
 * Deux modes (AUDIT 2026-09-16) :
 *   · « attendus » (attendus fournis) → scoring sur CEUX-CI uniquement, seuil
 *     SEUIL_KEYWORDS (0.6) — inchangé, verrouillé par test anti-fuite ;
 *   · « defaut » (sans attendus) → banque L1–L6 curatée de l'unité, seuil
 *     SEUIL_KEYWORDS_DEFAUT (0.25) — diagnostic de couverture d'unité ; les
 *     formes du DICTIONNAIRE FINAL ne gonflent plus le dénominateur, elles
 *     remontent via entitesReconnues.
 * Utilise le normaliseur partagé (normalizeAr) : أ/إ/آ→ا, ة→ه, ى→ي, diacritiques off.
 */
export function evaluerReponseKeywords(
  reponse: string,
  uniteId: number,
  attendus?: string[]
): ResultatKeywords {
  const mode: 'attendus' | 'defaut' =
    attendus && attendus.length > 0 ? 'attendus' : 'defaut';
  const unite = CORRECTEUR_V1_UNITES.find((u) => u.uniteId === uniteId);
  const cibles =
    mode === 'attendus'
      ? attendus!
      : unite
        ? unite.motsCles
        : [];

  const norm = normalizeAr(reponse || '');
  const trouves: string[] = [];
  const manquants: string[] = [];
  for (const mot of cibles) {
    const nMot = normalizeAr(mot);
    // Audit Fable-5 (2026-09-25) : frontières de mot — sinon un mot-clé court
    // était compté « trouvé » à l'intérieur d'un mot plus long (couverture gonflée).
    if (!nMot) continue;
    if (motPresentDans(norm, nMot)) trouves.push(mot);
    else manquants.push(mot);
  }

  const total = cibles.length;
  const trouve = trouves.length;
  const couverture = total === 0 ? 1 : trouve / total;
  return {
    uniteId,
    mode,
    trouve,
    total,
    couverture,
    manquants,
    passe: couverture >= (mode === 'attendus' ? SEUIL_KEYWORDS : SEUIL_KEYWORDS_DEFAUT),
    trouves,
    // COUCHE DICTIONNAIRE : entités officiel+verifie reconnues (retour pédagogique
    // sémantique ; les pistes a_valider restent dans evaluerEntites().pistesAmbigues).
    entitesReconnues: evaluerEntites(reponse, uniteId).trouvees,
  };
}
