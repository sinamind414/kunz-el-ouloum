// bacSessionIndex.ts — Banque « أفكار التمارين » INDEXÉE PAR SESSION DU BAC
// (audit item 12, sprint 16)
//
// Pourquoi ce fichier existe
// --------------------------
// L'application savait déjà entraîner par unité (11), par situation concrète
// (23 cartes de `situationIndex.ts`), par geste (17 schémas), par notion
// (24 micro-capsules). Il manquait l'entrée que TOUS les élèves utilisent en
// avril : « qu'est-ce qui est tombé au BAC, et sous quelle forme ? ».
//
// Preuve de la demande (audit YouTube, sprints 1-8) :
//   · @ikramscience8424 : 4 vidéos « أفكار التمارين » 2019→2025 = 214 K vues
//     pour une chaîne qui ne publie presque rien d'autre ;
//   · @MostafaBdd : playlist d'exercices 121 vidéos / 350 075 vues, dont des
//     items nommés par session (« تمرين 11 بكالوريا 2022 »).
// Un grep des sessions dans `src/` donnait 0 fichier avant ce sprint.
//
// Statut de vérité
// ----------------
// Chaque entrée décrit UN exercice réellement tombé, lu dans le sujet officiel
// (ONEC) republié par eddirasa.com / dzexams.com — l'URL exacte est dans
// `BAC_SESSION_SOURCES`. Ce fichier ne reproduit PAS les énoncés : il en donne
// l'IDÉE, les supports fournis, la notion évaluée et les verbes de consigne,
// c'est-à-dire ce qui sert à réviser. Les valeurs numériques des documents ne
// sont pas recopiées.
//
// Trous assumés et documentés :
//   · session 2020 (session de septembre, COVID) : sujet non récupérable en
//     texte au moment de la collecte → `MISSING_YEARS`. Ne pas inventer.
//   · 2021, sujet 2, exercice 1 : non lisible dans la source → absent. Le
//     total de ce sujet vaut donc 15 points et non 20 (`INCOMPLETE_SUJETS`).
//
// Ce fichier n'invente aucun exercice de l'application : les `situationIds`,
// `capsuleIds` et `drillIds` pointent vers du contenu existant, et le verrou
// `bacSessionIndex.lock.test.ts` casse si une référence devient morte.

import { SITUATION_BY_ID, normalizeArabic } from './situationIndex';
import { CAPSULE_BY_ID } from './microCapsules';
import { SCHEMA_DRILL_BY_ID } from './schemaDrills';

export type BacSujet = 1 | 2;
export type BacExerciceRang = 1 | 2 | 3;

export interface BacExerciseIdea {
  /** Identifiant stable : `bac2019_s1_e3`. */
  id: string;
  year: number;
  /** Le candidat choisit un sujet sur deux : 1 ou 2. */
  sujet: BacSujet;
  /** Rang dans le sujet : 1 (restitution), 2, 3 (le plus lourd). */
  exercice: BacExerciceRang;
  /** Barème officiel : 5, 7 ou 8 points. */
  points: number;
  /** Nom court, tel qu'on cherche l'exercice : « الجينتاميسين و اللامينين ». */
  titleAr: string;
  /** L'idée de l'exercice en une phrase : la question scientifique posée. */
  ideaAr: string;
  /** Les supports fournis au candidat (documents, figures, techniques). */
  supportsAr: string[];
  /** La notion du programme réellement évaluée derrière l'habillage. */
  notionAr: string;
  /** Les verbes de consigne rencontrés (الأفعال الإدائية). */
  verbsAr: string[];
  /** Unités mobilisées, la principale d'abord. */
  unitIds: number[];
  /** Cartes de situation de l'app à ouvrir (références vérifiées). */
  situationIds: string[];
  /** Micro-capsules à réviser avant (références vérifiées). */
  capsuleIds: string[];
  /** Schémas à savoir refaire (références vérifiées). */
  drillIds: string[];
}

/** Sujets officiels lus pour construire cette banque. */
export const BAC_SESSION_SOURCES: { year: number; url: string }[] = [
  { year: 2019, url: 'https://eddirasa.com/bac-science-2019-se/' },
  { year: 2021, url: 'https://eddirasa.com/bac-science-2021-se/' },
  { year: 2022, url: 'https://eddirasa.com/bac-science-2022-se/' },
  { year: 2023, url: 'https://eddirasa.com/bac-science-2023-se/' },
  { year: 2024, url: 'https://eddirasa.com/bac-science-2024-se/' },
  { year: 2025, url: 'https://eddirasa.com/bac-science-2025-se/' },
];

/** Sessions du programme non couvertes faute de source lisible. */
export const MISSING_YEARS: number[] = [2020];

/** Sujets dont un exercice manque dans la source (total < 20 points). */
export const INCOMPLETE_SUJETS: { year: number; sujet: BacSujet; raison: string }[] = [
  { year: 2021, sujet: 2, raison: "exercice 1 non lisible dans la source consultée" },
];

export const BAC_IDEAS: BacExerciseIdea[] = [
  // ───────────────────────────── 2019 ─────────────────────────────
  {
    id: 'bac2019_s1_e1',
    year: 2019,
    sujet: 1,
    exercice: 1,
    points: 5,
    titleAr: 'الظهرة وسط المحيطية و انصهار البيريدوتيت',
    ideaAr:
      'لماذا ترتبط مناطق التباعد بمغماتية نشطة، رغم أن الانصهار يتطلب حرارة عالية؟ الإجابة في انخفاض الضغط لا في ارتفاع الحرارة.',
    supportsAr: ['نموذج للمغماتية المرتبطة بظهرة وسط محيطية مع بيانات مرقمة من 1 إلى 8'],
    notionAr: 'تجديد القشرة المحيطية: صعود المعطف، انصهار جزئي بانخفاض الضغط، لابة، غابرو و بازلت.',
    verbsAr: ['تعرّف على البيانات', 'قدّم في نص علمي'],
    unitIds: [11, 9],
    situationIds: [],
    capsuleIds: ['cap_u11_construction_destruction'],
    drillIds: ['drill_dorsale'],
  },
  {
    id: 'bac2019_s1_e2',
    year: 2019,
    sujet: 1,
    exercice: 2,
    points: 7,
    titleAr: 'أنزيم الغلوكوز أكسيداز عند فطرين',
    ideaAr:
      'هل كل اختلاف في بنية الأنزيم يؤدي حتماً إلى اختلاف في وظيفته؟ مقارنة GO عند Aspergillus و Penicillium.',
    supportsAr: [
      'جدول الخصائص البنيوية (عدد الأحماض الأمينية، البنيات الثانوية، الجسر ثنائي الكبريت، أحماض الموقع الفعال)',
      'نافذة Anagène لمقارنة التسلسلين',
      'جدول طفرات موجّهة على أحماض الموقع الفعال مع Vmax الموافقة',
    ],
    notionAr:
      'العلاقة بنية/وظيفة: ليست كل الأحماض الأمينية متساوية — أحماض الموقع الفعال هي وحدها الحاسمة.',
    verbsAr: ['استخرج الخطوات', 'قارن', 'فسّر', 'قدّم إجابة'],
    unitIds: [3, 2],
    situationIds: ['detergent_enzymatique'],
    capsuleIds: ['cap_u3_plateau_michaelis', 'cap_u2_quatre_niveaux'],
    drillIds: ['drill_enzyme_site_actif', 'drill_niveaux_structure'],
  },
  {
    id: 'bac2019_s1_e3',
    year: 2019,
    sujet: 1,
    exercice: 3,
    points: 8,
    titleAr: 'إفلات الخلايا السرطانية من الجهاز المناعي',
    ideaAr:
      'لماذا يعجز الجهاز المناعي عن تخريب أورام في مرحلة متقدمة بينما ينجح ضد أورام حديثة؟',
    supportsAr: [
      'مخطط الاستجابة المناعية ضد الخلايا السرطانية',
      'طريقتان علاجيتان',
      'أجسام مضادة مفلورة ضد HLA I و ضد الببتيد المستضدي في وسطين X و Y',
      'زرع LTc مع الخليتين الورميتين و ملاحظة مجهرية',
    ],
    notionAr:
      'العرض المستضدي: الببتيد المستضدي مرتبط بـ HLA I شرط لازم لتعرّف LTc — فقدان العرض = إفلات.',
    verbsAr: ['حدّد', 'اقترح فرضيتين', 'فسّر', 'استنتج', 'لخّص في مخطط'],
    unitIds: [4],
    situationIds: ['cellules_cibles_lt', 'greffe_rein'],
    capsuleIds: ['cap_u4_cmh_vs_abo', 'cap_u4_humorale_cellulaire'],
    drillIds: ['drill_cmh'],
  },
  {
    id: 'bac2019_s2_e1',
    year: 2019,
    sujet: 2,
    exercice: 1,
    points: 5,
    titleAr: 'سلسلة جبال الأنديز و البركان الانفجاري',
    ideaAr: 'كيف يتشكّل بركان انفجاري على حافة نشطة؟ من الغوص إلى الصهارة اللزجة.',
    supportsAr: ['معطيات حول النشاط التكتوني على الساحل الغربي لأمريكا اللاتينية'],
    notionAr: 'الغوص: تميّه البيريدوتيت، انصهار جزئي، صهارة أنديزيتية لزجة غنية بالغازات.',
    verbsAr: ['سمّ', 'تعرّف', 'اشرح في نص علمي'],
    unitIds: [9],
    situationIds: ['volcans_subduction'],
    capsuleIds: ['cap_u9_fusion_subduction'],
    drillIds: ['drill_subduction'],
  },
  {
    id: 'bac2019_s2_e2',
    year: 2019,
    sujet: 2,
    exercice: 2,
    points: 7,
    titleAr: 'مبيد الـ DDT و الكمون الغشائي',
    ideaAr: 'كيف يُحدث مبيد حشري اختلالاً في الجهاز العصبي عند الإنسان؟',
    supportsAr: [
      'جدول قيم الكمون الغشائي بدلالة الزمن في وجود و غياب DDT (مع سلّم رسم مفروض)',
      'تقنية Patch Clamp على جزأين من الغشاء: قناة Na⁺ فولطية و قناة K⁺ فولطية',
      'تسجيل التيارات الأيونية تحت كمون مفروض',
    ],
    notionAr: 'كمون العمل: دور القنوات الفولطية، و إبقاء قناة الصوديوم مفتوحة = عدم عودة الاستقطاب.',
    verbsAr: ['مثّل بيانياً', 'حلّل', 'اقترح فرضيتين', 'حدّد', 'علّل', 'فسّر', 'ناقش'],
    unitIds: [5],
    situationIds: ['sarin_attaque', 'curare_chirurgie'],
    capsuleIds: ['cap_u5_quatre_potentiels'],
    drillIds: ['drill_potentiel_action'],
  },
  {
    id: 'bac2019_s2_e3',
    year: 2019,
    sujet: 2,
    exercice: 3,
    points: 8,
    titleAr: 'الريفاميسين: مستوى تأثير المضاد الحيوي',
    ideaAr:
      'على أي مستوى بالضبط من تركيب البروتين يتدخّل المضاد الحيوي؟ الاستنساخ أم الترجمة؟',
    supportsAr: [
      'نسبة تركيب البروتين بدلالة الزمن في تراكيز متزايدة من Rifamycine',
      'رسم تخطيطي لعملية تركيب البروتين',
      'جدول ثلاثة أوساط تجريبية (مع/دون ARNm، مع/دون المضاد) و شدة الإشعاع',
      'منحنى السرعة الابتدائية لنشاط أنزيم ARN بوليميراز',
    ],
    notionAr:
      'تدفق المعلومة الوراثية: الوسط الذي يحتوي ARNm جاهزاً يبقى فعالاً رغم المضاد ⇒ التثبيط في الاستنساخ.',
    verbsAr: ['حلّل', 'اقترح ثلاث فرضيات', 'لخّص في نص علمي'],
    unitIds: [1],
    situationIds: ['antibiotique_rifamycine'],
    capsuleIds: ['cap_u1_transcription_vs_traduction'],
    drillIds: ['drill_transcription', 'drill_traduction'],
  },

  // ───────────────────────────── 2021 ─────────────────────────────
  {
    id: 'bac2021_s1_e1',
    year: 2021,
    sujet: 1,
    exercice: 1,
    points: 5,
    titleAr: 'المستوى البنيوي للريبونكلياز A',
    ideaAr: 'كيف نحدّد المستوى البنيوي لجزيئة بروتينية انطلاقاً من معطيات بنيوية؟',
    supportsAr: ['معطيات بنيوية حول جزيئة الريبونكلياز A', 'ارتباط الـ ARN بالموقع الفعال'],
    notionAr: 'المستويات الأربعة لبنية البروتين، و السلسلة الجانبية للأحماض الأمينية.',
    verbsAr: ['بيّن'],
    unitIds: [2],
    situationIds: [],
    capsuleIds: ['cap_u2_quatre_niveaux', 'cap_u2_formule_aa'],
    drillIds: ['drill_niveaux_structure'],
  },
  {
    id: 'bac2021_s1_e2',
    year: 2021,
    sujet: 1,
    exercice: 2,
    points: 7,
    titleAr: 'الريبونكلياز A في العصارة المعدية و المعوية',
    ideaAr:
      'لماذا ينشط الأنزيم في عصارة معوية (pH بين 3,7 و 5,8) و لا ينشط في عصارة معدية (pH=2)؟',
    supportsAr: [
      'منحنى السرعة الابتدائية Vi بدلالة الـ pH',
      'تجربة التخلص التدريجي من اليوريا و من الـ β-mercaptoéthanol',
      'الصيغة الكيميائية لليوريا',
    ],
    notionAr:
      'بنية الموقع الفعال: الشحنة و الروابط الضعيفة تتعلق بالـ pH؛ تخريب البنية الفراغية = فقدان الوظيفة.',
    verbsAr: ['حلّل', 'بيّن'],
    unitIds: [3, 2],
    situationIds: ['digestion_pepsine'],
    capsuleIds: ['cap_u3_plateau_michaelis', 'cap_u2_anode_cathode'],
    drillIds: ['drill_enzyme_site_actif'],
  },
  {
    id: 'bac2021_s1_e3',
    year: 2021,
    sujet: 1,
    exercice: 3,
    points: 8,
    titleAr: 'الـ VIH و تعطيل التعاون المناعي',
    ideaAr:
      'لماذا تكون الاستجابة ضد الـ VIH قوية في البداية ثم تصبح غير مجدية على المدى البعيد؟',
    supportsAr: [
      'تطور عدد خلايا LT4 إثر الإصابة',
      'رسم تخطيطي لدور LT4 في الاستجابات المناعية',
      'متابعة أنترلوكين أساسي قبل و بعد الإصابة (زرع، سائل طاف)',
      'عدد LT8 في طحال فئران طافرة عاجزة عن إنتاج IL2',
    ],
    notionAr: 'التعاون المناعي: LT4 محور الاستجابتين، و IL2 هو الوسيط الذي يفسّر الانهيار.',
    verbsAr: ['اقترح فرضية', 'تحقّق من صحة الفرضية', 'حلّل'],
    unitIds: [4],
    situationIds: ['sida_vih', 'cellules_cibles_lt'],
    capsuleIds: ['cap_u4_lt4_pivot', 'cap_u4_humorale_cellulaire'],
    drillIds: ['drill_vih_cycle'],
  },
  {
    id: 'bac2021_s2_e2',
    year: 2021,
    sujet: 2,
    exercice: 2,
    points: 7,
    titleAr: 'الشفرة الوراثية عند الـ Tetrahymena',
    ideaAr:
      'لماذا يعطي نفس الـ ARNm بروتيناً كاملاً عند الـ Tetrahymena و متعددات ببتيدية قصيرة في مستخلص أرنب؟',
    supportsAr: [
      'مراحل التجربة على كائن وحيد الخلية يركّب بروتيناً من 171 حمضاً أمينياً',
      'مستخلص خلوي منزوع الـ ARNm من كريات دم حمراء إنشائية للأرنب',
      'جزء من جدول الشفرة الوراثية حيث UAA و UAG تعنيان Gln عند Tetrahymena و STOP عند غيره',
    ],
    notionAr: 'عالمية الشفرة الوراثية و استثناءاتها؛ رامزات التوقف و إنهاء الترجمة.',
    verbsAr: ['حلّل', 'فسّر', 'استنتج'],
    unitIds: [1],
    situationIds: ['lecture_shifra'],
    capsuleIds: ['cap_u1_lecture_code'],
    drillIds: ['drill_traduction'],
  },
  {
    id: 'bac2021_s2_e3',
    year: 2021,
    sujet: 2,
    exercice: 3,
    points: 8,
    titleAr: 'سمّ العنكبوت بديلاً للمورفين',
    ideaAr: 'هل يمكن أن يكون سمّ العنكبوت مسكّناً أكثر فعالية و أقل ضرراً من المورفين؟',
    supportsAr: [
      'قطع معزولة من أغشية عصبونات القرن الخلفي للنخاع الشوكي',
      'تقنية Patch-clamp تحت كمون مفروض و تسجيل التيارات الأيونية',
    ],
    notionAr: 'المشبك و نقل الرسالة العصبية المتدخلة في الإحساس بالألم؛ دور القنوات الأيونية.',
    verbsAr: ['اقترح فرضيات', 'تحقّق', 'استخلص', 'لخّص في مخطط'],
    unitIds: [5],
    situationIds: ['sarin_attaque', 'seuil_integration'],
    capsuleIds: ['cap_u5_double_codage', 'cap_u5_quatre_potentiels'],
    drillIds: ['drill_synapse'],
  },

  // ───────────────────────────── 2022 ─────────────────────────────
  {
    id: 'bac2022_s1_e1',
    year: 2022,
    sujet: 1,
    exercice: 1,
    points: 5,
    titleAr: 'الغشاء الهيولي و تحديد الذات',
    ideaAr: 'ما الذي يمنح الغشاء الهيولي قدرة التمييز بين الذات و اللاذات؟',
    supportsAr: ['رسم تخطيطي لجزء من الغشاء الهيولي لخلية حيوانية'],
    notionAr: 'مكونات الغشاء: البروتينات الغشائية، CMH، مجموعات سكرية — محدّدات الذات.',
    verbsAr: ['صف', 'اذكر', 'وضّح في نص علمي'],
    unitIds: [4],
    situationIds: ['greffe_rein'],
    capsuleIds: ['cap_u4_cmh_vs_abo'],
    drillIds: ['drill_cmh'],
  },
  {
    id: 'bac2022_s1_e2',
    year: 2022,
    sujet: 1,
    exercice: 2,
    points: 7,
    titleAr: 'مشابك النخاع الشوكي: الغلوتامات و الـ GABA',
    ideaAr: 'كيف تكبح البروتينات الغشائية وصول الرسالة العصبية إلى العضلة و تؤمّن استرخاءها؟',
    supportsAr: [
      'منطقة تشابك في المادة الرمادية بثلاثة عصبونات (حسي، وارد من الدماغ، محرك)',
      'جدول تغيرات الكمون الغشائي في ثلاثة أجهزة تسجيل حسب الشروط (تنبيه، حقن غلوتامات، حقن GABA)',
      'نوعان من مستقبلات الـ GABA: ‏GABAa و GABAb',
    ],
    notionAr: 'المشابك المنبّهة و المثبّطة، و التكامل العصبي على مستوى العصبون المحرك.',
    verbsAr: ['بيّن', 'أبرز', 'اشرح'],
    unitIds: [5],
    situationIds: ['seuil_integration'],
    capsuleIds: ['cap_u5_double_codage'],
    drillIds: ['drill_synapse'],
  },
  {
    id: 'bac2022_s1_e3',
    year: 2022,
    sujet: 1,
    exercice: 3,
    points: 8,
    titleAr: 'الجينتاميسين و مرض انحلال البشرة الفقاعي',
    ideaAr:
      'كيف يقتل مضاد حيوي البكتيريا و يعالج في الوقت نفسه مرضاً وراثياً ناتجاً عن طفرة؟',
    supportsAr: [
      'عدد مستعمرات E.coli في تراكيز مختلفة من الجينتاميسين',
      'ARNm اصطناعي متعدد اليوراسيل و قياس نسبة دمج اللوسين',
      'نسبة التعبير عن بروتين اللامينين الوظيفي عند مريض معالج',
      'جزء من السلسلة المستنسخة للمورثة الطافرة Lam3 و جدول الشفرة',
    ],
    notionAr:
      'الترجمة و دقة التزاوج رامزة/رامزة مضادة؛ تجاوز رامزة توقف ناتجة عن طفرة (خطأ محفّز مفيد).',
    verbsAr: ['بيّن', 'اقترح فرضية وجيهة', 'وضّح', 'صادق', 'برّر'],
    unitIds: [1],
    situationIds: ['antibiotique_rifamycine', 'lecture_shifra'],
    capsuleIds: ['cap_u1_types_mutations', 'cap_u1_lecture_code'],
    drillIds: ['drill_traduction'],
  },
  {
    id: 'bac2022_s2_e1',
    year: 2022,
    sujet: 2,
    exercice: 1,
    points: 5,
    titleAr: 'السيانور و كمون الراحة',
    ideaAr: 'كيف يفقد غشاء الليف العصبي قابليته للتنبيه إذا مُنع تركيب الـ ATP؟',
    supportsAr: ['رسم تخطيطي لجزء من غشاء الليف العصبي أثناء الراحة مع توزع Na⁺ و K⁺'],
    notionAr: 'أصل كمون الراحة: النفوذية الانتقائية و مضخة Na⁺/K⁺ المستهلكة للـ ATP.',
    verbsAr: ['حدّد', 'اشرح في نص علمي'],
    unitIds: [5, 7],
    situationIds: ['coureur_crampe'],
    capsuleIds: ['cap_u5_quatre_potentiels', 'cap_u7_ou_est_atp'],
    drillIds: ['drill_potentiel_action', 'drill_respiration'],
  },
  {
    id: 'bac2022_s2_e2',
    year: 2022,
    sujet: 2,
    exercice: 2,
    points: 7,
    titleAr: 'الأمانيتين و علاج موجّه للأورام',
    ideaAr:
      'كيف استغل الباحثون سمّاً فطرياً مثبّطاً للاستنساخ في علاج موجّه للخلايا السرطانية؟',
    supportsAr: [
      'نشاط أنزيم ARN بوليميراز في تراكيز متزايدة من α-amanitine',
      'نمذجة جزيئية لعمل الأنزيم في الحالة الطبيعية و في وجود المادة',
      'حجم الأورام عند فئران عولجت بجرعات مختلفة من علاج ATAC',
    ],
    notionAr: 'التثبيط الأنزيمي و نوعية الأجسام المضادة: توجيه السمّ نحو الخلية الهدف.',
    verbsAr: ['وضّح', 'اشرح', 'أبرز'],
    unitIds: [1, 3, 4],
    situationIds: ['detergent_enzymatique'],
    capsuleIds: ['cap_u3_inhibition_type', 'cap_u1_transcription_vs_traduction'],
    drillIds: ['drill_courbes_inhibition', 'drill_transcription'],
  },
  {
    id: 'bac2022_s2_e3',
    year: 2022,
    sujet: 2,
    exercice: 3,
    points: 8,
    titleAr: 'أنزيمات كرش الأبقار و غاز الميثان',
    ideaAr: 'كيف نستغل خصائص الأنزيمات للتقليل من انبعاث الميثان عند الحيوانات المجترة؟',
    supportsAr: [
      'طريقة تفكيك السليلوز',
      'كمية الميثان المنبعثة مع و دون المكمل الغذائي 3-NOP',
      'تفاصيل تفاعل إنتاج الميثان انطلاقاً من CO₂',
      'بنية ثلاثية الأبعاد للمرافق الأنزيمي CoEM و للمكمل 3-NOP، و آلية عمل الأنزيم M',
    ],
    notionAr: 'التثبيط التنافسي: تشابه البنية الفراغية بين المثبّط و الركيزة/المرافق.',
    verbsAr: ['اقترح فرضية', 'وضّح', 'صادق'],
    unitIds: [3],
    situationIds: ['detergent_enzymatique', 'diabete_januvia'],
    capsuleIds: ['cap_u3_inhibition_type'],
    drillIds: ['drill_courbes_inhibition', 'drill_enzyme_site_actif'],
  },

  // ───────────────────────────── 2023 ─────────────────────────────
  {
    id: 'bac2023_s1_e1',
    year: 2023,
    sujet: 1,
    exercice: 1,
    points: 5,
    titleAr: 'توكسين الكزاز و عمل المشابك',
    ideaAr: 'كيف يقلب توكسين بكتيري التوازن بين التنبيه و التثبيط فيسبّب تقلصاً عضلياً دائماً؟',
    supportsAr: ['وثيقة تقارن عمل المشابك في وجود و غياب توكسين الكزاز', 'جهازا راسم اهتزاز مهبطي'],
    notionAr: 'البروتينات الغشائية بعد المشبكية: مستقبلات مرتبطة بقنوات، PPSE و PPSI.',
    verbsAr: ['سمّ', 'بيّن في نص علمي'],
    unitIds: [5],
    situationIds: ['sarin_attaque', 'seuil_integration'],
    capsuleIds: ['cap_u5_double_codage'],
    drillIds: ['drill_synapse'],
  },
  {
    id: 'bac2023_s1_e2',
    year: 2023,
    sujet: 1,
    exercice: 2,
    points: 7,
    titleAr: 'دواء الملاريا ML901',
    ideaAr: 'لماذا يوقف الدواء تركيب البروتين عند الطفيلي دون أن يمسّ الإنسان؟',
    supportsAr: [
      'معدل الطفيليات في الدم دون علاج و مع ML901',
      'نسبة حدوث الاستنساخ و الترجمة في تراكيز متزايدة من الدواء',
      'نسبة تشكّل معقد ARNt-Tyr عند الطفيلي و عند الإنسان',
      'نمذجة عمل أنزيم التنشيط (تيروزين أمينوأسيل ARNt سنتاز)',
    ],
    notionAr: 'تنشيط الأحماض الأمينية قبل الترجمة؛ نوعية الأنزيم تجاه الركيزة = نوعية الدواء.',
    verbsAr: ['قارن', 'حلّل', 'برّر'],
    unitIds: [1, 3],
    situationIds: ['antibiotique_rifamycine'],
    capsuleIds: ['cap_u1_transcription_vs_traduction', 'cap_u3_inhibition_type'],
    drillIds: ['drill_traduction'],
  },
  {
    id: 'bac2023_s1_e3',
    year: 2023,
    sujet: 1,
    exercice: 3,
    points: 8,
    titleAr: 'سرطان الثدي و مادة الكيرستين',
    ideaAr: 'كيف تحدّ مادة طبيعية من تطوّر ورم يتغذى على هرمون؟ مساران للتثبيط لا مسار واحد.',
    supportsAr: [
      'معدل تكاثر خلايا سرطان الثدي في تراكيز متزايدة من الأستراديول',
      'رسم تفسيري لدور بعض البروتينات في تكاثر هذه الخلايا',
      'البنية الفراغية للموقع الفعال لأنزيم الأروماتاز مع الكيرستين، و مستقبل الأستراديول مع نفس المادة',
      'نشاط الأروماتاز في تراكيز متزايدة من الكيرستين، و حجم الورم مع/دون المادة',
    ],
    notionAr:
      'التكامل البنيوي: نفس الجزيئة تثبّط أنزيماً و تنافس هرموناً على مستقبله (تثبيط تنافسي مزدوج).',
    verbsAr: ['اقترح فرضيتين', 'ناقش', 'قدّم نصيحة', 'لخّص في مخطط'],
    unitIds: [3, 2],
    situationIds: ['detergent_enzymatique', 'diabete_januvia'],
    capsuleIds: ['cap_u3_inhibition_type', 'cap_u2_quatre_niveaux'],
    drillIds: ['drill_courbes_inhibition', 'drill_enzyme_site_actif'],
  },
  {
    id: 'bac2023_s2_e1',
    year: 2023,
    sujet: 2,
    exercice: 1,
    points: 5,
    titleAr: 'من التتابع النيكليوتيدي إلى وظيفة البروتين',
    ideaAr: 'كيف يحافظ استقرار المورثة على وظيفة البروتين، و ما دور الطفرات في فقدان التخصص؟',
    supportsAr: ['أسئلة اختيار من متعدد حول الروابط، البنية الفراغية، الرامزات و أصل الطفرة'],
    notionAr: 'الروابط التكافئية (الجسور ثنائية الكبريت) و الروابط الضعيفة؛ الطفرة تصيب الـ ADN.',
    verbsAr: ['اختر العبارة الصحيحة', 'وضّح في نص علمي'],
    unitIds: [2, 1],
    situationIds: ['anemie_falciforme'],
    capsuleIds: ['cap_u2_quatre_niveaux', 'cap_u1_types_mutations'],
    drillIds: ['drill_niveaux_structure'],
  },
  {
    id: 'bac2023_s2_e2',
    year: 2023,
    sujet: 2,
    exercice: 2,
    points: 7,
    titleAr: 'البرفورين: كيف تحمي الـ LTc نفسها؟',
    ideaAr: 'لماذا يثقب البرفورين غشاء الخلية المصابة و لا يثقب غشاء الخلية التي أفرزته؟',
    supportsAr: [
      'رسم تخطيطي للبنية الجزيئية لغشاءي LTc و الخلية المصابة',
      'نسبة الحلّ الخلوي في تراكيز متزايدة من البرفورين',
      'نسب الكولسترول و السفينغوميلين و الفوسفوليبيدات، و علاقتها بميوعة الأغشية',
      'صور مجهر القوة الماسحة لعدد الثقوب',
    ],
    notionAr: 'مرحلة التنفيذ في الاستجابة الخلوية؛ تركيب الغشاء يحدّد قابليته للثقب.',
    verbsAr: ['قدّم تحليلاً مقارناً', 'برّر', 'اشرح'],
    unitIds: [4],
    situationIds: ['cellules_cibles_lt'],
    capsuleIds: ['cap_u4_humorale_cellulaire'],
    drillIds: ['drill_cmh'],
  },
  {
    id: 'bac2023_s2_e3',
    year: 2023,
    sujet: 2,
    exercice: 3,
    points: 8,
    titleAr: 'المبيد DCMU و المرحلة الكيموضوئية',
    ideaAr: 'أين بالضبط يقطع مبيد الأعشاب سلسلة نقل الإلكترونات الضوئية؟',
    supportsAr: [
      'معلّق تيلاكوئيدات دون CO₂ مع DCPIP: النسبة المئوية لـ O₂ المطروح عبر فترات ضوء/ظلام',
      'نسبة إرجاع DCPIP في تراكيز متزايدة من DCMU',
      'قيمة pH خارج التيلاكوئيد في الظلام و في الضوء',
      'نشاط النظام الضوئي الثاني PSII، و نمذجة العلاقة PSII ⟶ الناقل الأول T1',
    ],
    notionAr:
      'التفاعلات الكيموضوئية: التحليل الضوئي للماء، PSII، سلسلة النواقل، تدرّج البروتونات (Mitchell).',
    verbsAr: ['اقترح فرضيتين', 'ناقش', 'قدّم نصيحة', 'وضّح في رسم تخطيطي وظيفي'],
    unitIds: [6],
    situationIds: ['jagendorf_chloroplaste', 'serre_agricole'],
    capsuleIds: ['cap_u6_oxygene_eau', 'cap_u6_jagendorf'],
    drillIds: ['drill_chaine_photochimique'],
  },

  // ───────────────────────────── 2024 ─────────────────────────────
  {
    id: 'bac2024_s1_e1',
    year: 2024,
    sujet: 1,
    exercice: 1,
    points: 5,
    titleAr: 'الـ VIH و دواء Zalcitabine',
    ideaAr: 'على أي مرحلة من دورة الفيروس يتدخّل الدواء المرخّص؟',
    supportsAr: ['رسم تخطيطي لمراحل تطور الـ VIH داخل خلايا LT4 مع ترقيم المراحل'],
    notionAr: 'دورة الفيروس القهقري: الاستنساخ العكسي مرحلة إجبارية و هدف علاجي.',
    verbsAr: ['بيّن في نص علمي'],
    unitIds: [4, 1],
    situationIds: ['sida_vih'],
    capsuleIds: ['cap_u4_lt4_pivot'],
    drillIds: ['drill_vih_cycle'],
  },
  {
    id: 'bac2024_s1_e2',
    year: 2024,
    sujet: 1,
    exercice: 2,
    points: 7,
    titleAr: 'الصرع: اختلال التوازن تنبيه/تثبيط',
    ideaAr:
      'لماذا يفقد المصاب بالصرع التوازن بين الغلوتامات و الـ GABA؟ الجواب في طفرة قناة صوديوم.',
    supportsAr: [
      'تواتر كمونات العمل عند أفراد طبيعيين و مصابين',
      'مقدار المبلغ العصبي المفرز في الشق المشبكي بدلالة التواتر',
      'مراحل عمل قنوات الصوديوم الفولطية في الحالتين',
      'تتابع الثلاثيات لجزء من المورثة Scn1a و جدول الشفرة',
    ],
    notionAr: 'من المورثة إلى الظاهرة: طفرة ⟶ قناة معيبة ⟶ خلل في التكامل العصبي.',
    verbsAr: ['حلّل', 'برّر', 'بيّن', 'اقترح حلاً علاجياً'],
    unitIds: [5, 1],
    situationIds: ['seuil_integration', 'anemie_falciforme'],
    capsuleIds: ['cap_u5_quatre_potentiels', 'cap_u1_types_mutations'],
    drillIds: ['drill_potentiel_action', 'drill_synapse'],
  },
  {
    id: 'bac2024_s1_e3',
    year: 2024,
    sujet: 1,
    exercice: 3,
    points: 8,
    titleAr: 'التدخين، البنزوبيران و بروتين P53',
    ideaAr: 'كيف يرفع مكوّن من دخان السجائر احتمال الإصابة بسرطان الرئة؟',
    supportsAr: [
      'جدول: عدد السجائر، تركيز Benzopyrène، نسبة احتمال الإصابة',
      'دور بروتين P53 في تنظيم الانقسام الخلوي',
      'عدد القواعد G المتغيرة لكل 10⁶ نيكليوتيدة بدلالة تركيز BZP',
      'نافذة Anagène: مقارنة تتابع المورثة و الأحماض الأمينية بين خلية عادية و سرطانية',
    ],
    notionAr: 'الطفرة الاستبدالية ⟶ بروتين غير وظيفي ⟶ فقدان مراقبة الانقسام.',
    verbsAr: ['اقترح فرضية', 'صادق على صحة الفرضية', 'قدّم إرشادات', 'لخّص في مخطط'],
    unitIds: [1, 2],
    situationIds: ['anemie_falciforme'],
    capsuleIds: ['cap_u1_types_mutations', 'cap_u2_quatre_niveaux'],
    drillIds: ['drill_transcription', 'drill_niveaux_structure'],
  },
  {
    id: 'bac2024_s2_e1',
    year: 2024,
    sujet: 2,
    exercice: 1,
    points: 5,
    titleAr: 'الأوكسازوليدينون و التتراسيكلين على الترجمة',
    ideaAr: 'كيف يثبّط مركّبان مختلفان نفس المرحلة من تركيب البروتين بطريقتين مختلفتين؟',
    supportsAr: ['وثيقة تبيّن تأثير كل من Oxazolidinone و Tetracycline على مراحل الترجمة'],
    notionAr: 'خطوات الترجمة: البدء، الاستطالة، النهاية؛ مواقع A و P على الريبوزوم.',
    verbsAr: ['اذكر', 'اشرح في نص علمي'],
    unitIds: [1],
    situationIds: ['antibiotique_rifamycine'],
    capsuleIds: ['cap_u1_transcription_vs_traduction'],
    drillIds: ['drill_traduction'],
  },
  {
    id: 'bac2024_s2_e2',
    year: 2024,
    sujet: 2,
    exercice: 2,
    points: 7,
    titleAr: 'الروبيسكو و أثر الظلام على تثبيت CO₂',
    ideaAr: 'كيف يعطّل الظلام تثبيت ثاني أكسيد الكربون، و ما دور جزيئة CA1P في ذلك؟',
    supportsAr: [
      'نسبة نشاط Rubisco في الضوء و في الظلام بدلالة الزمن',
      'كمية CA1P في الأوراق عبر فترات ضوء و ظلام',
      'وسطان مع Rudip و CO₂ مشع، مع أو دون CA1P مسبقاً',
      'مقدار المواقع الفعالة المشعة لـ Rubisco بدلالة محتوى الأوراق من CA1P',
    ],
    notionAr:
      'المرحلة الكيميائية (حلقة كالفن): تثبيت CO₂ على Rudip؛ CA1P مثبّط يحتل الموقع الفعال في الظلام.',
    verbsAr: ['حلّل', 'أبرز العلاقة', 'اشرح'],
    unitIds: [6, 3],
    situationIds: ['serre_agricole', 'feuille_jour_nuit'],
    capsuleIds: ['cap_u6_calvin', 'cap_u3_inhibition_type'],
    drillIds: ['drill_chaine_photochimique', 'drill_coupe_feuille'],
  },
  {
    id: 'bac2024_s2_e3',
    year: 2024,
    sujet: 2,
    exercice: 3,
    points: 8,
    titleAr: 'بروتين SPA و إفلات المكوّرات العنقودية',
    ideaAr: 'كيف تفلت بكتيريا Staphylococcus aureus من الاستجابة الخلطية؟',
    supportsAr: [
      'تجارب على Corynebacterium diphteriae و Staphylococcus aureus مع أمصال',
      'كمية المعقدات المناعية المتشكّلة في وجود و غياب بروتين SPA',
      'رسم تخطيطي لآلية تثبيت SPA',
    ],
    notionAr:
      'الاستجابة الخلطية: نوعية الارتباط مستضد/جسم مضاد؛ SPA يرتبط بالجزء Fc فيمنع تشكّل المعقد الفعال.',
    verbsAr: ['حلّل', 'فسّر في نص علمي', 'استنتج'],
    unitIds: [4],
    situationIds: ['labo_ouchterlony', 'vaccination_rappel'],
    capsuleIds: ['cap_u4_humorale_cellulaire', 'cap_u4_primaire_secondaire'],
    drillIds: ['drill_anticorps'],
  },

  // ───────────────────────────── 2025 ─────────────────────────────
  {
    id: 'bac2025_s1_e1',
    year: 2025,
    sujet: 1,
    exercice: 1,
    points: 5,
    titleAr: 'أنواع الـ ARN و مادة RIP',
    ideaAr: 'كيف يُستهدف الـ ARN نفسه لعلاج أورام ناتجة عن تضاعف خلوي عشوائي؟',
    supportsAr: ['وثيقة تبيّن كسر الرابطة بين القاعدة الأزوتية و سكر الريبوز بفعل مادة RIP'],
    notionAr: 'أدوار ARNm و ARNt و ARNr داخل و خارج فترة تركيب البروتين.',
    verbsAr: ['اذكر', 'اشرح في نص علمي'],
    unitIds: [1],
    situationIds: ['uracile_radioactif'],
    capsuleIds: ['cap_u1_transcription_vs_traduction'],
    drillIds: ['drill_transcription', 'drill_traduction'],
  },
  {
    id: 'bac2025_s1_e2',
    year: 2025,
    sujet: 1,
    exercice: 2,
    points: 7,
    titleAr: 'الطحالب البحرية و البيرينويد',
    ideaAr:
      'كيف تنمو طحالب في أوساط فقيرة بـ CO₂؟ بنية الصانعة الخضراء تفسّر آلية تركيز الكربون.',
    supportsAr: [
      'نسبة نمو الطحالب من النمط الطبيعي و الطافر في وسطين مختلفي تركيز HCO₃⁻',
      'بنية الصانعة الخضراء عند النمطين مع بعض الجزيئات بداخلها',
      'نسبة المركبات المشعة قبل و بعد إضافة أنزيم Carbonic anhydrase',
      'كمية CO₂ في أجزاء من الخلية، و رسم تخطيطي للبيرينويد',
    ],
    notionAr: 'المرحلة الكيميائية: مصدر CO₂ المثبَّت، و العلاقة بنية/وظيفة داخل الصانعة الخضراء.',
    verbsAr: ['حلّل', 'أبرز الأثر', 'اشرح الآلية', 'برّر'],
    unitIds: [6, 8],
    situationIds: ['serre_agricole', 'feuille_jour_nuit'],
    capsuleIds: ['cap_u6_calvin', 'cap_u8_chloroplaste_mitochondrie'],
    drillIds: ['drill_coupe_feuille', 'drill_chaine_photochimique'],
  },
  {
    id: 'bac2025_s1_e3',
    year: 2025,
    sujet: 1,
    exercice: 3,
    points: 8,
    titleAr: 'الأدينوزين، الشاي الأخضر و النعاس',
    ideaAr: 'لماذا يطرد منبّه موجود في أوراق الشاي الشعور بالنعاس؟',
    supportsAr: [
      'نسبة النشاط العصبي الدماغي عند قطط محقونة بجرعات متزايدة من Ado مع و دون Mtb (تخطيط EEG)',
      'شدة ارتباط Ado بمستقبلاته A₁R في تراكيز متزايدة من Mtb',
      'تركيز المبلغ العصبي NE المفرز بدلالة نسبة المعقدات Ado-A₁R',
      'رسم تخطيطي لآلية تأثير Ado على إفراز NE',
    ],
    notionAr:
      'المشبك: المستقبل قبل المشبكي، و التثبيط التنافسي على مستوى المستقبل (منافسة جزيئية).',
    verbsAr: ['اقترح فرضيتين', 'تأكّد من صحة إحدى الفرضيتين', 'قدّم نصائح', 'وضّح في مخطط'],
    unitIds: [5, 3],
    situationIds: ['curare_chirurgie', 'sarin_attaque'],
    capsuleIds: ['cap_u5_double_codage', 'cap_u3_inhibition_type'],
    drillIds: ['drill_synapse', 'drill_courbes_inhibition'],
  },
  {
    id: 'bac2025_s2_e1',
    year: 2025,
    sujet: 2,
    exercice: 1,
    points: 5,
    titleAr: 'التحلل السكري و مادة 2-DG',
    ideaAr: 'كيف يعطّل جزيء شبيه بالغلوكوز تكاثر الخلايا السرطانية من الخطوة الأولى؟',
    supportsAr: ['وثيقة تختصر تفاعلات التحلل السكري في خطوتين مع الإشارة إلى الخطوة المثبَّطة'],
    notionAr: 'التحلل السكري في الهيولى: الحصيلة (2 ATP، 2 NADH,H⁺، 2 حمض بيروفيك).',
    verbsAr: ['تعرّف على المركبات', 'اشرح في نص علمي مدعّم بمعادلة'],
    unitIds: [7],
    situationIds: ['coureur_crampe'],
    capsuleIds: ['cap_u7_ou_est_atp', 'cap_u7_fermentation'],
    drillIds: ['drill_respiration'],
  },
  {
    id: 'bac2025_s2_e2',
    year: 2025,
    sujet: 2,
    exercice: 2,
    points: 7,
    titleAr: 'أنزيم SOD و دواء الـ Edaravone',
    ideaAr: 'كيف يُقلَّد نشاط أنزيم معيب بدواء لعلاج مرض التصلب الجانبي الضموري؟',
    supportsAr: [
      'نشاط SOD و تراكيز ROS و نسبة تلف الخلايا العصبية الحركية عند سليم و مصاب',
      'نمذجة الجذور الكيميائية لأحماض الموقع الفعال في وجود الركيزة O₂⁻',
      'تراكيز ROS و O₂ خلال الفترة t₁–t₂ في وجود SOD',
      'معدل O₂⁻ عند فئران طافرة قبل و بعد الحقن بـ EDA، و المعادلات الكيميائية',
    ],
    notionAr: 'التكامل البنيوي أنزيم/ركيزة: تغيّر جذر واحد في الموقع الفعال يلغي التحفيز.',
    verbsAr: ['حلّل', 'بيّن السبب', 'برّر الاستعمال', 'اقترح حلاً آخر'],
    unitIds: [3, 2],
    situationIds: ['detergent_enzymatique'],
    capsuleIds: ['cap_u3_plateau_michaelis', 'cap_u2_formule_aa'],
    drillIds: ['drill_enzyme_site_actif'],
  },
  {
    id: 'bac2025_s2_e3',
    year: 2025,
    sujet: 2,
    exercice: 3,
    points: 8,
    titleAr: 'نظام ABO: تحويل زمرة A إلى زمرة O',
    ideaAr:
      'كيف نحقّق التسامح المناعي في نقل الدم بحذف السكر الطرفي للمستضد A بأنزيم؟',
    supportsAr: [
      'نسبة المعقدات المتشكّلة مع المستضد A و مع المستضد H في تراكيز متزايدة',
      'شدة انحلال الكريات الحمراء (كمية البيليروبين)',
      'كروماتوغرافيا: الجزيئات المكوّنة للمستضدين A و H مع كتلها المولية (Fucose، Galactose، GalNAc)',
      'ثلاث عينات معالجة بأنزيم NAGA و/أو الجسم المضاد anti-A، و نتائج الفحص المجهري',
    ],
    notionAr:
      'الزمر الدموية ABO: محدّدات سكرية على الكريات الحمراء، و الأجسام المضادة الطبيعية.',
    verbsAr: ['اقترح فرضية', 'ناقش صحة الفرضية', 'اقترح طريقة أخرى', 'وضّح في فقرة علمية'],
    unitIds: [4, 3],
    situationIds: ['greffe_rein', 'labo_ouchterlony'],
    capsuleIds: ['cap_u4_cmh_vs_abo'],
    drillIds: ['drill_cmh', 'drill_anticorps'],
  },
];

export const IDEA_BY_ID: Record<string, BacExerciseIdea> = Object.fromEntries(
  BAC_IDEAS.map((idea) => [idea.id, idea]),
);

/** Années couvertes, ordre décroissant (la plus récente d'abord). */
export const YEARS_COVERED: number[] = Array.from(new Set(BAC_IDEAS.map((i) => i.year))).sort(
  (a, b) => b - a,
);

/** Les idées d'une session, triées sujet puis exercice. */
export function ideasForYear(year: number): BacExerciseIdea[] {
  return BAC_IDEAS.filter((i) => i.year === year).sort(
    (a, b) => a.sujet - b.sujet || a.exercice - b.exercice,
  );
}

/** Les idées qui mobilisent une unité (principale ou secondaire), récentes d'abord. */
export function ideasForUnit(unitId: number): BacExerciseIdea[] {
  return BAC_IDEAS.filter((i) => i.unitIds.includes(unitId)).sort(
    (a, b) => b.year - a.year || a.sujet - b.sujet || a.exercice - b.exercice,
  );
}

export interface UnitPressure {
  unitId: number;
  /** Nombre d'exercices où l'unité apparaît. */
  count: number;
  /** Nombre de fois où elle est l'unité PRINCIPALE (première de la liste). */
  principal: number;
  /** Points cumulés des exercices où elle est principale. */
  pointsPrincipaux: number;
  /** Sessions concernées, décroissant. */
  years: number[];
}

/**
 * Pression mesurée de chaque unité sur les sessions couvertes.
 * Tri : points principaux, puis nombre d'apparitions, puis unitId (déterministe).
 */
export function unitPressure(): UnitPressure[] {
  const acc = new Map<number, UnitPressure>();
  for (const idea of BAC_IDEAS) {
    idea.unitIds.forEach((unitId, rang) => {
      const row =
        acc.get(unitId) ??
        { unitId, count: 0, principal: 0, pointsPrincipaux: 0, years: [] as number[] };
      row.count += 1;
      if (rang === 0) {
        row.principal += 1;
        row.pointsPrincipaux += idea.points;
      }
      if (!row.years.includes(idea.year)) row.years.push(idea.year);
      acc.set(unitId, row);
    });
  }
  return Array.from(acc.values())
    .map((row) => ({ ...row, years: [...row.years].sort((a, b) => b - a) }))
    .sort(
      (a, b) =>
        b.pointsPrincipaux - a.pointsPrincipaux || b.count - a.count || a.unitId - b.unitId,
    );
}

/** Fréquence des verbes de consigne, la plus élevée d'abord. */
export function verbFrequency(): { verbe: string; count: number }[] {
  const acc = new Map<string, number>();
  for (const idea of BAC_IDEAS) {
    for (const verbe of idea.verbsAr) acc.set(verbe, (acc.get(verbe) ?? 0) + 1);
  }
  return Array.from(acc.entries())
    .map(([verbe, count]) => ({ verbe, count }))
    .sort((a, b) => b.count - a.count || a.verbe.localeCompare(b.verbe));
}

/** Total des points d'un sujet donné (20 quand le sujet est complet). */
export function pointsOfSujet(year: number, sujet: BacSujet): number {
  return BAC_IDEAS.filter((i) => i.year === year && i.sujet === sujet).reduce(
    (sum, i) => sum + i.points,
    0,
  );
}

/** Recherche plein texte tolérante aux diacritiques et aux hamzas. */
export function searchIdeas(query: string): BacExerciseIdea[] {
  const q = normalizeArabic(query.trim());
  if (!q) return [];
  return BAC_IDEAS.filter((idea) => {
    const haystack = normalizeArabic(
      [
        idea.titleAr,
        idea.ideaAr,
        idea.notionAr,
        String(idea.year),
        ...idea.supportsAr,
        ...idea.verbsAr,
      ].join(' '),
    );
    return haystack.includes(q);
  }).sort((a, b) => b.year - a.year || a.sujet - b.sujet || a.exercice - b.exercice);
}

/** Références de contenu de l'app citées par la banque (pour le verrou). */
export function danglingReferences(): string[] {
  const dangling: string[] = [];
  for (const idea of BAC_IDEAS) {
    for (const id of idea.situationIds) if (!SITUATION_BY_ID[id]) dangling.push(`${idea.id} → situation ${id}`);
    for (const id of idea.capsuleIds) if (!CAPSULE_BY_ID[id]) dangling.push(`${idea.id} → capsule ${id}`);
    for (const id of idea.drillIds) if (!SCHEMA_DRILL_BY_ID[id]) dangling.push(`${idea.id} → drill ${id}`);
  }
  return dangling;
}
