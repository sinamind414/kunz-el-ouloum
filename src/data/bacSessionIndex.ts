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
//   · 2021, sujet 2, exercice 1 : non lisible dans la source → absent. Le
//     total de ce sujet vaut donc 15 points et non 20 (`INCOMPLETE_SUJETS`).
//   · sprint 36 : la session 2017 rejoint la banque (série 2017→2026).
//   · sprint 34 : la session 2018 rejoint la banque — la série va de 2018 à
//     2026 sans interruption.
//   · sprint 17 : la session 2020 (session de septembre, COVID) manquait au
//     sprint 16 ; elle a été récupérée et ajoutée, et la session 2026 avec
//     elle. `MISSING_YEARS` est donc vide — mais reste en place pour qu'un
//     trou futur soit déclaré et non caché.
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

/**
 * Sujets officiels lus pour construire cette banque, avec le CORRIGÉ officiel
 * correspondant (sprint 42).
 *
 * Pourquoi le corrigé compte : l'app décrit l'idée de chaque exercice et
 * contrôle la forme des réponses, mais elle ne publie aucun corrigé — ce
 * serait reproduire un contenu qui ne lui appartient pas, et donner une
 * réponse là où il faut un raisonnement. Le lien envoie l'élève à la source
 * officielle, qui reste l'autorité.
 *
 * Chaque URL de corrigé a été vérifiée : soit ouverte directement, soit lue
 * dans le lien « تصحيح الموضوع » de la page du sujet. Pour 2026, le PDF de
 * DzExams contient le sujet ET l'« الإجابة النموذجية » — même adresse.
 */
export const BAC_SESSION_SOURCES: { year: number; url: string; correctionUrl: string }[] = [
  {
    year: 2017,
    url: 'https://eddirasa.com/bac-science-2017-se/',
    correctionUrl: 'https://eddirasa.com/correction-bac-se-science-2017/',
  },
  {
    year: 2018,
    url: 'https://eddirasa.com/bac-science-2018-se/',
    correctionUrl: 'https://eddirasa.com/correction-bac-science-2018-se/',
  },
  {
    year: 2019,
    url: 'https://eddirasa.com/bac-science-2019-se/',
    correctionUrl: 'https://eddirasa.com/correction-bac-science-2019-se/',
  },
  {
    year: 2020,
    url: 'https://eddirasa.com/bac-science-2020-se/',
    correctionUrl: 'https://eddirasa.com/correction-bac-science-2020-se/',
  },
  {
    year: 2021,
    url: 'https://eddirasa.com/bac-science-2021-se/',
    correctionUrl: 'https://eddirasa.com/correction-bac-science-2021-se/',
  },
  {
    year: 2022,
    url: 'https://eddirasa.com/bac-science-2022-se/',
    correctionUrl: 'https://eddirasa.com/correction-bac-science-2022-se/',
  },
  {
    year: 2023,
    url: 'https://eddirasa.com/bac-science-2023-se/',
    correctionUrl: 'https://eddirasa.com/correction-bac-science-2023-se/',
  },
  {
    year: 2024,
    url: 'https://eddirasa.com/bac-science-2024-se/',
    correctionUrl: 'https://eddirasa.com/correction-bac-science-2024-se/',
  },
  {
    year: 2025,
    url: 'https://eddirasa.com/bac-science-2025-se/',
    correctionUrl: 'https://eddirasa.com/correction-bac-science-2025-se/',
  },
  {
    year: 2026,
    url: 'https://www.dzexams.com/ar/annales/L0tWNjNjZ1pNQ1RmU3JUOUFUbFpTdz09',
    correctionUrl: 'https://www.dzexams.com/ar/annales/L0tWNjNjZ1pNQ1RmU3JUOUFUbFpTdz09',
  },
];

/** Sources officielles d'une session : sujet et corrigé. */
export function sourcesForYear(year: number) {
  return BAC_SESSION_SOURCES.find((s) => s.year === year) ?? null;
}

/**
 * Sessions non couvertes faute de source lisible.
 * Vide depuis le sprint 17 : la session 2020 (dorée de septembre, COVID) a
 * fini par être récupérée, et la session 2026 a été ajoutée dans la foulée.
 * Le tableau reste dans le code : c'est lui qui rend un trou futur visible
 * plutôt que silencieux.
 */
export const MISSING_YEARS: number[] = [];

/** Sujets dont un exercice manque dans la source (total < 20 points). */
export const INCOMPLETE_SUJETS: { year: number; sujet: BacSujet; raison: string }[] = [
  { year: 2021, sujet: 2, raison: "exercice 1 non lisible dans la source consultée" },
];

export const BAC_IDEAS: BacExerciseIdea[] = [
  // ───────────────────────────── 2017 ─────────────────────────────
  // Ajoutée au sprint 36 : la série couvre 2017→2026 sans trou.
  {
    id: 'bac2017_s1_e1',
    year: 2017,
    sujet: 1,
    exercice: 1,
    points: 5,
    titleAr: 'مراحل تركيب البروتين عند حقيقيات النواة',
    ideaAr:
      'من المورثة إلى البروتين الوظيفي: تسمية العناصر، شروط كل مرحلة، و حساب عدد الأحماض الأمينية.',
    supportsAr: [
      'وثيقة تمثّل مراحل تركيب البروتين مع عناصر مرقّمة و مرحلتين (أ) و (ب)',
      'معطى عددي: 327 نيكليوتيدة في العنصر 3',
    ],
    notionAr:
      'الاستنساخ و الترجمة: العناصر الضرورية لكل مرحلة، و علاقة عدد النيكليوتيدات بعدد الأحماض الأمينية (÷3).',
    verbsAr: ['اكتب البيانات', 'سمّ', 'حدّد في جدول', 'احسب', 'بيّن في نص علمي'],
    unitIds: [1, 2],
    situationIds: ['lecture_shifra', 'uracile_radioactif'],
    capsuleIds: ['cap_u1_transcription_vs_traduction', 'cap_u1_lecture_code'],
    drillIds: ['drill_transcription', 'drill_traduction'],
  },
  {
    id: 'bac2017_s1_e2',
    year: 2017,
    sujet: 1,
    exercice: 2,
    points: 7,
    titleAr: 'التعاون بين اللمفاويات: تجربة الأوساط الجيلاتينية',
    ideaAr:
      'خمسة أوساط تختلف بلمفاوية واحدة: ما الذي يفصل حقاً بين الاستجابة الخلطية و الاستجابة الخلوية؟',
    supportsAr: [
      'وثيقة لبعض مظاهر الرد المناعي (خليتان a و b، شكلان)',
      'جدول خمسة أوساط زرع جيلاتينية: المستضد أو الخلايا السرطانية المثبّتة، اللمفاويات المضافة، ثم لمفاويات أخرى، و النتيجة',
    ],
    notionAr:
      'الانتقاء النسيلي و التعاون: لا أجسام مضادة بلا LT4، و لا انحلال خلوي بلا LT4 محسّسة.',
    verbsAr: [
      'تعرّف',
      'حدّد المرحلة',
      'أنجز رسماً تخطيطياً',
      'اشرح',
      'قدّم تحليلاً مقارناً',
      'استنتج',
      'علّل',
      'برّر',
      'لخّص في نص علمي',
    ],
    unitIds: [4],
    situationIds: ['cellules_cibles_lt', 'labo_ouchterlony', 'vaccination_rappel'],
    capsuleIds: ['cap_u4_lt4_pivot', 'cap_u4_humorale_cellulaire'],
    drillIds: ['drill_anticorps', 'drill_cmh'],
  },
  {
    id: 'bac2017_s1_e3',
    year: 2017,
    sujet: 1,
    exercice: 3,
    points: 8,
    titleAr: 'الصانعة الخضراء: من الضوء إلى المادة العضوية',
    ideaAr:
      'كيف تنتقل الطاقة الضوئية إلى جزيئات عضوية؟ الإضاءة تغيّر ATP و ADP و المستقبل المؤكسد و O₂ معاً.',
    supportsAr: [
      'تركيب تجريبي مع معلّق صانعات خضراء و إشعاع، و نتائجه',
      'كمية CO₂ المثبَّتة عند الكلوريلا خلال إضاءة قوية ثم ظلام',
      'تراكيز ATP و ADP و المركب R المؤكسد و O₂ حسب شدة الإضاءة',
      'حشوة في الظلام مع كيسات في الضوء، أو مع ATP و ناقل مرجع، و CO₂ مشع',
    ],
    notionAr:
      'المرحلتان الكيموضوئية و الكيميائية: الحشوة تحتاج ATP و النواقل المرجعة، لا الضوء مباشرة.',
    verbsAr: ['استخرج', 'سمّ الظاهرة', 'اكتب المعادلة', 'حلّل', 'استنتج', 'أنجز رسماً تخطيطياً وظيفياً'],
    unitIds: [6, 8],
    situationIds: ['jagendorf_chloroplaste', 'feuille_jour_nuit', 'serre_agricole'],
    capsuleIds: ['cap_u6_calvin', 'cap_u6_jagendorf', 'cap_u6_oxygene_eau'],
    drillIds: ['drill_chaine_photochimique', 'drill_coupe_feuille'],
  },
  {
    id: 'bac2017_s2_e1',
    year: 2017,
    sujet: 2,
    exercice: 1,
    points: 5,
    titleAr: 'خلية ذاتية التغذية و خلية غير ذاتية التغذية',
    ideaAr:
      'ما الذي يربط ما يحدث في الصانعة الخضراء بما يحدث في الميتوكوندري؟ دورة مادة و دورة طاقة.',
    supportsAr: ['وثيقة تقارن خليتين (أ) و (ب) مع العضيتين (س) و (ص) و التبادلات الغازية و ATP'],
    notionAr:
      'الترافق بين تحولات المادة و الطاقة: التركيب الضوئي و التنفس، و استعمالات ATP في الخلية.',
    verbsAr: ['سمّ', 'صنّف', 'استخرج', 'اكتب نصاً علمياً'],
    unitIds: [8, 7],
    situationIds: ['feuille_jour_nuit', 'coureur_crampe'],
    capsuleIds: ['cap_u8_chloroplaste_mitochondrie', 'cap_u7_ou_est_atp'],
    drillIds: ['drill_respiration', 'drill_coupe_feuille'],
  },
  {
    id: 'bac2017_s2_e2',
    year: 2017,
    sujet: 2,
    exercice: 2,
    points: 7,
    titleAr: 'القنوات الأيونية خلف كمون العمل',
    ideaAr:
      'تسجيلان و جدول عدد القنوات المفتوحة: كل مرحلة من كمون العمل تقابلها قناة تفتح ثم تُغلق.',
    supportsAr: [
      'تركيب تجريبي بجهازين ج1 و ج2 و تسجيلان (أ) و (ب) إثر تنبيه فعال',
      'جدول عدد القنوات المفتوحة من النمط 1 و النمط 2 لكل ميلي ثانية',
      'تنبيهات متزايدة الشدة أو حقن كميات متزايدة من الأستيل كولين',
    ],
    notionAr:
      'قناة Na⁺ ثم قناة K⁺ الفولطيتان؛ قانون الكل أو لا شيء على الليف، و التدرّج على المشبك.',
    verbsAr: ['سمّ', 'حلّل', 'استنتج', 'ترجم إلى منحنيات', 'حدّد', 'مثّل بالرسم', 'برّر', 'وضّح'],
    unitIds: [5],
    situationIds: ['seuil_integration', 'curare_chirurgie'],
    capsuleIds: ['cap_u5_quatre_potentiels', 'cap_u5_double_codage'],
    drillIds: ['drill_potentiel_action', 'drill_synapse'],
  },
  {
    id: 'bac2017_s2_e3',
    year: 2017,
    sujet: 2,
    exercice: 3,
    points: 8,
    titleAr: 'جفاف الجلد المصطبغ و أنزيم الإصلاح XPA',
    ideaAr:
      'لماذا تتحوّل الشمس إلى خطر عند بعض الأشخاص؟ حذف نيكليوتيدة يعطّل الأنزيم الذي يصلح أخطاء الـ ADN.',
    supportsAr: [
      'جدول Anagène: تتابع الـ ADN و الأحماض الأمينية لـ XPA عند شخص سليم و شخص مريض',
      'نص يذكّر بأخطاء التضاعف و بدور أنزيمات الإصلاح (XPA من 215 حمضاً أمينياً)',
      'نسبة ثنائيات التايمين بعد التعرّض للـ UV عند خلايا سليمة و مريضة',
      'آلية عمل أنزيم XPA',
    ],
    notionAr:
      'الطفرة بالحذف تزيح إطار القراءة و تولّد رامزة توقف مبكرة: بروتين مبتور، إصلاح معطّل، سرطان جلدي.',
    verbsAr: ['تعرّف على البرنامج', 'أعطِ التتابع', 'حلّل', 'استخرج الآلية', 'اقترح فرضية', 'تحقّق', 'بيّن في نص علمي'],
    unitIds: [1, 3],
    situationIds: ['anemie_falciforme', 'lecture_shifra'],
    capsuleIds: ['cap_u1_types_mutations', 'cap_u1_lecture_code'],
    drillIds: ['drill_transcription', 'drill_traduction'],
  },

  // ───────────────────────────── 2018 ─────────────────────────────
  // Ajoutée au sprint 34 : la série remonte à 2018 sans trou.
  {
    id: 'bac2018_s1_e1',
    year: 2018,
    sujet: 1,
    exercice: 1,
    points: 5,
    titleAr: 'البروتينات الغشائية و دمج الرسائل العصبية',
    ideaAr:
      'ما الذي يحوّل عدة رسائل واردة إلى قرار واحد عند العصبون المحرك؟ بروتينات غشائية عالية التخصص.',
    supportsAr: ['رسم تخطيطي وظيفي لانتقال الرسالة من خلية قبل مشبكية إلى خلية بعد مشبكية'],
    notionAr:
      'القنوات الفولطية، المضخات، المستقبلات القنوية؛ التكامل الزمني و المكاني على مستوى العصبون المحرك.',
    verbsAr: ['اذكر', 'حدّد الدور', 'اكتب نصاً علمياً'],
    unitIds: [5],
    situationIds: ['seuil_integration', 'sarin_attaque'],
    capsuleIds: ['cap_u5_quatre_potentiels', 'cap_u5_double_codage'],
    drillIds: ['drill_synapse', 'drill_potentiel_action'],
  },
  {
    id: 'bac2018_s1_e2',
    year: 2018,
    sujet: 1,
    exercice: 2,
    points: 7,
    titleAr: 'مستقبل الـ LDL و تصلب الشرايين',
    ideaAr:
      'كيف تُفقد طفرة واحدة المستقبلَ الغشائي بنيته، فيتراكم الكولسترول في الدم و تتصلب الشرايين؟',
    supportsAr: [
      'آلية دخول الـ LDL إلى الخلية مع تكبير للمستقبل R',
      'جدول جذور أحماض أمينية مع رقم تسلسلها و pHi الخاص بكل واحد (Cys 5، Asp 2,77، Lys 9,74)',
      'جزء من الأليل R1 (سليم) و R2 (مصاب) مع جدول الشفرة الوراثية',
    ],
    notionAr:
      'الصيغة الشاردية للحمض الأميني حسب pH الوسط، و دور الجذور في ثبات البنية الفراغية؛ من الطفرة إلى المرض.',
    verbsAr: ['مثّل الصيغة الشاردية', 'حدّد الدور', 'استخرج المتتالية', 'ناقش العلاقة'],
    unitIds: [2, 1],
    situationIds: ['mixture_acides_amines', 'anemie_falciforme'],
    capsuleIds: ['cap_u2_formule_aa', 'cap_u2_anode_cathode', 'cap_u1_types_mutations'],
    drillIds: ['drill_niveaux_structure'],
  },
  {
    id: 'bac2018_s1_e3',
    year: 2018,
    sujet: 1,
    exercice: 3,
    points: 8,
    titleAr: 'عقم الرجل، النطاف و المرافق Q10',
    ideaAr:
      'لماذا تفقد النطاف حركتها؟ لأن سلسلة التنفس تتوقف عند ناقل واحد — و إعادته تعيد الحركة.',
    supportsAr: [
      'معلقان من الميتوكوندريات (شخص مصاب بالعقم و شخص سليم) و تغيّر نسبة O₂ بعد إضافة الناقل TH₂',
      'تفاعلات تحلل الفراكتوز بمراحلها المرقمة',
      'آلية أكسدة النواقل المرجعة على الغشاء الداخلي (NADH,H⁺، FADH₂، Coenzyme Q10)',
    ],
    notionAr:
      'الهدم: التحلل السكري، حلقة كريبس، الفسفرة التأكسدية؛ حصيلة الـ ATP و مقر كل مرحلة.',
    verbsAr: ['حلّل', 'قدّم فرضيات', 'استخرج', 'اشرح الآلية', 'استنتج الحصيلة', 'فسّر'],
    unitIds: [7, 8],
    situationIds: ['coureur_crampe'],
    capsuleIds: ['cap_u7_ou_est_atp', 'cap_u7_fermentation', 'cap_u8_chloroplaste_mitochondrie'],
    drillIds: ['drill_respiration'],
  },
  {
    id: 'bac2018_s2_e1',
    year: 2018,
    sujet: 2,
    exercice: 1,
    points: 5,
    titleAr: 'نظام ABO و الجزيئات المميزة للذات',
    ideaAr: 'ما الذي يميّز زمرة دموية عن أخرى على مستوى الجزيئة الغشائية نفسها؟',
    supportsAr: [
      'وثيقة المؤشرات الغشائية في نظام ABO (سلسلة سكرية قاعدية، غلاكتوز، N-أستيل غلاكتوزامين)',
      'معطيات حول الأليلات الثلاثة و علاقات السيادة',
    ],
    notionAr: 'الذات و اللاذات؛ النمط الظاهري الخلوي و علاقته بالنمط الوراثي في نظام ABO.',
    verbsAr: ['قدّم تعريفاً', 'قارن', 'اكتب نصاً علمياً'],
    unitIds: [4],
    situationIds: ['greffe_rein', 'labo_ouchterlony'],
    capsuleIds: ['cap_u4_cmh_vs_abo'],
    drillIds: ['drill_cmh'],
  },
  {
    id: 'bac2018_s2_e2',
    year: 2018,
    sujet: 2,
    exercice: 2,
    points: 7,
    titleAr: 'اللاكتاز و عدم تحمّل اللاكتوز',
    ideaAr:
      'لماذا يعاني شخص من انتفاخ و إسهال بعد شرب الحليب، بينما يهضم شخص آخر نفس السكر دون أعراض؟',
    supportsAr: [
      'السرعة الابتدائية لنشاط اللاكتاز بدلالة pH و بدلالة درجة الحرارة',
      'خمسة أوساط تجريبية مع/دون أنزيم و مع مادة شبيهة بالركيزة، و مدة التفاعل في كل وسط',
      'وثيقة مقارنة بين هضم اللاكتوز عند شخص سليم و شخص مصاب',
    ],
    notionAr:
      'التحفيز الأنزيمي: خفض طاقة التنشيط، النوعية، و أثر pH و الحرارة على البنية الفراغية.',
    verbsAr: ['أنجز منحنى', 'فسّر', 'استنتج', 'نمذج العلاقة', 'اشرح'],
    unitIds: [3],
    situationIds: ['digestion_pepsine', 'detergent_enzymatique'],
    capsuleIds: ['cap_u3_plateau_michaelis', 'cap_u3_inhibition_type'],
    drillIds: ['drill_enzyme_site_actif', 'drill_courbes_inhibition'],
  },
  {
    id: 'bac2018_s2_e3',
    year: 2018,
    sujet: 2,
    exercice: 3,
    points: 8,
    titleAr: 'من أين يأتي الأكسجين المطروح؟ تجربة النظائر',
    ideaAr:
      'هل ينشأ O₂ المطروح من الماء أم من ثاني أكسيد الكربون؟ النظير ¹⁸O يحسم السؤال.',
    supportsAr: [
      'معايرة نسبة ¹⁸O/¹⁶O في O₂ المنطلق، مرة مع ماء مشع و مرة مع HCO₃⁻ مشع',
      'تيلاكوئيدات في وسط خالٍ من HCO₃⁻ مع DCPIP: تطور تركيز O₂ و لون الوسط',
      'مستخلص سيتوبلازمي بكتيري في الظلام مع ATP و RH₂، و مع تيلاكوئيدات معرّضة للضوء',
    ],
    notionAr:
      'التحليل الضوئي للماء مصدر O₂ و الإلكترونات؛ استقلال المرحلة الكيميائية عن الضوء المباشر.',
    verbsAr: ['اقترح فرضية', 'استدل', 'بيّن الآلية', 'استخرج', 'حلّل', 'وضّح في رسم تخطيطي وظيفي'],
    unitIds: [6],
    situationIds: ['jagendorf_chloroplaste', 'serre_agricole'],
    capsuleIds: ['cap_u6_oxygene_eau', 'cap_u6_calvin'],
    drillIds: ['drill_chaine_photochimique'],
  },

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

  // ───────────────────────────── 2020 ─────────────────────────────
  // Session de septembre (COVID). Récupérée au sprint 17.
  {
    id: 'bac2020_s1_e1',
    year: 2020,
    sujet: 1,
    exercice: 1,
    points: 5,
    titleAr: 'كيف عرفنا بنية الكرة الأرضية دون أن نحفرها؟',
    ideaAr:
      'أعمق حفرة لا تتعدى 13 كلم، ومع ذلك نعرف بنية الأرض إلى المركز: الموجات الزلزالية هي المجهر.',
    supportsAr: [
      'مقطع للبنية الداخلية للكرة الأرضية ببيانات مرقمة من 1 إلى 10',
      'جدول يُملأ: اسم كل بيان، و الصخر المميز لكل غلاف',
    ],
    notionAr:
      'انكسار و انعكاس الموجات P و S، مناطق الظل، انقطاعات موهو و غوتنبرغ و ليهمان.',
    verbsAr: ['انقل الجدول و املأ الخانات', 'بيّن في نص علمي'],
    unitIds: [10],
    situationIds: ['seisme_boumerdes'],
    capsuleIds: ['cap_u10_zone_ombre'],
    drillIds: ['drill_structure_terre'],
  },
  {
    id: 'bac2020_s1_e2',
    year: 2020,
    sujet: 1,
    exercice: 2,
    points: 7,
    titleAr: 'إيبوبروفان و سيليكوكسيب: لماذا يوجع الدواء المعدة؟',
    ideaAr:
      'لماذا يسبّب مضاد الالتهاب ألماً في المعدة، و كيف صنع الباحثون دواءً انتقائياً بلا هذا العرض؟',
    supportsAr: [
      'مخطط نشاط الأنزيمين Cox-1 و Cox-2 انطلاقاً من حمض الأراشيدونيك',
      'جدول تركيز الإيبوبروفان اللازم لخفض نشاط كل أنزيم إلى 50٪ (CI₅₀)',
      'رسوم تخطيطية للموقع الفعال لكل أنزيم في وجود الركيزة و الدوائين',
      'نشاط الأنزيمين بدلالة تركيز السيليكوكسيب',
    ],
    notionAr:
      'التثبيط التنافسي و انتقائية الموقع الفعال: دواء واحد على أنزيمين متشابهين لا متطابقين.',
    verbsAr: ['حلّل المخطط', 'وضّح', 'قارن'],
    unitIds: [3],
    situationIds: ['digestion_pepsine', 'diabete_januvia'],
    capsuleIds: ['cap_u3_inhibition_type'],
    drillIds: ['drill_courbes_inhibition', 'drill_enzyme_site_actif'],
  },
  {
    id: 'bac2020_s1_e3',
    year: 2020,
    sujet: 1,
    exercice: 3,
    points: 8,
    titleAr: 'العلاج المناعي لسرطان الثدي: بروتين Her2',
    ideaAr: 'كيف يقضي جسم مضاد مصنَّع على خلايا سرطانية تفرط في بروتين غشائي؟',
    supportsAr: [
      'كمية البروتين الغشائي Her2 عند نوعين من الخلايا السرطانية A و B',
      'عدد الخلايا بعد سبعة أيام من الحضن',
      'جدول أوساط: خلايا A و B مع تراكيز مختلفة من Trastuzumab',
      'نمذجة ارتباط Trastuzumab بـ Her2، و تطور عدد الخلايا بإضافة البالعات',
    ],
    notionAr:
      'نوعية الارتباط جسم مضاد/مستضد، و الاختطاف المناعي: الجسم المضاد يعلّم الخلية للبلعمة.',
    verbsAr: ['استخرج العلاقة', 'اقترح فرضية', 'حلّل', 'فسّر', 'بيّن في نص علمي'],
    unitIds: [4, 2],
    situationIds: ['labo_ouchterlony', 'cellules_cibles_lt'],
    capsuleIds: ['cap_u4_humorale_cellulaire'],
    drillIds: ['drill_anticorps'],
  },
  {
    id: 'bac2020_s2_e1',
    year: 2020,
    sujet: 2,
    exercice: 1,
    points: 5,
    titleAr: 'الانتقاء اللمفاوي و نمط الاستجابة',
    ideaAr:
      'ما الذي يحدّد نمط الاستجابة المناعية: مصدر الببتيد المستضدي المعروض على الخلية العارضة.',
    supportsAr: ['وثيقة بعناصر مرقمة من 1 إلى 10 و خليتين (ع) و (س) و نمطي استجابة (أ) و (ب)'],
    notionAr: 'العرض المستضدي بواسطة CMH I أو CMH II، و الانتقاء النسيلي للمفاويات.',
    verbsAr: ['سمّ', 'تعرّف', 'اكتب نصاً علمياً'],
    unitIds: [4],
    situationIds: ['cellules_cibles_lt', 'greffe_rein'],
    capsuleIds: ['cap_u4_cmh_vs_abo', 'cap_u4_humorale_cellulaire'],
    drillIds: ['drill_cmh'],
  },
  {
    id: 'bac2020_s2_e2',
    year: 2020,
    sujet: 2,
    exercice: 2,
    points: 7,
    titleAr: 'الريسين: سمّ يوقف الترجمة عند الريبوزوم',
    ideaAr:
      'مادة مستخلصة من بذور الخروع توقف تكاثر الخلايا السرطانية — لكن على أي مستوى بالضبط؟',
    supportsAr: [
      'تكاثر الخلايا السرطانية مع و دون الريسين',
      'نسبة إدماج التيميدين المشع و اللوسين المشع في تراكيز متزايدة',
      'وسطان: مستخلص خلوي خالٍ من ARNm + متعدد اليوريدين + فينيل ألانين مشع، مع و دون الريسين',
      'نمذجة الريبوزوم الوظيفي و غير الوظيفي (ARNr 28S)',
    ],
    notionAr:
      'الترجمة: دور ARNr 28S في الريبوزوم — التيميدين يقيس النسخ، اللوسين يقيس الترجمة.',
    verbsAr: ['حلّل', 'أبرز العلاقة', 'أعطِ حلاً للمشكلة'],
    unitIds: [1],
    situationIds: ['antibiotique_rifamycine', 'uracile_radioactif'],
    capsuleIds: ['cap_u1_transcription_vs_traduction'],
    drillIds: ['drill_traduction'],
  },
  {
    id: 'bac2020_s2_e3',
    year: 2020,
    sujet: 2,
    exercice: 3,
    points: 8,
    titleAr: 'نضج المشابك المثبّطة عند المولود الجديد',
    ideaAr:
      'لماذا لا يتحكّم المولود في حركاته؟ لأن مشبكه « المثبّط » يعمل بالمقلوب في أوّل أيامه.',
    supportsAr: [
      'التيار الأيوني و الكمون الغشائي بعد مشبكي عند يومين و عند شهرين من الولادة',
      'توضع مضختي شوارد الكلور NKCC1 و KCC2 و المستقبلات القنوية للـ GABA',
      'التركيز الداخلي لشوارد Cl⁻ خلال 60 يوماً بعد الولادة',
      'تطور كمية ARNm لكل من NKCC1 و KCC2',
    ],
    notionAr:
      'المشبك المثبّط: اتجاه دخول Cl⁻ يتوقف على تدرّج التركيز، الذي تبنيه المضخات — لا القناة.',
    verbsAr: ['حلّل', 'اقترح فرضية', 'استخرج', 'تأكّد من صحة الفرضية', 'لخّص في نص علمي'],
    unitIds: [5, 1],
    situationIds: ['seuil_integration', 'sarin_attaque'],
    capsuleIds: ['cap_u5_double_codage', 'cap_u5_quatre_potentiels'],
    drillIds: ['drill_synapse'],
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

  // ───────────────────────────── 2026 ─────────────────────────────
  {
    id: 'bac2026_s1_e1',
    year: 2026,
    sujet: 1,
    exercice: 1,
    points: 5,
    titleAr: 'جذر الهيدروكسيل، الألبومين و الوذمة',
    ideaAr:
      'كيف يكفي جذر حرّ واحد لتكسير جسور ثنائية الكبريت فيفقد الألبومين وظيفته و تتورّم القدمان؟',
    supportsAr: [
      'نمذجة أثر جذر الهيدروكسيل الحر على بروتين الألبومين',
      'تذكير: للألبومين 17 جسراً ثنائي الكبريت و السيستين Cys34 حر',
    ],
    notionAr:
      'الصيغة العامة للحمض الأميني، و الروابط المميّزة لكل مستوى بنيوي؛ البنية الفراغية شرط الوظيفة.',
    verbsAr: ['مثّل الصيغة العامة', 'اذكر الروابط', 'بيّن في نص علمي'],
    unitIds: [2],
    situationIds: ['anemie_falciforme', 'mixture_acides_amines'],
    capsuleIds: ['cap_u2_formule_aa', 'cap_u2_quatre_niveaux'],
    drillIds: ['drill_niveaux_structure'],
  },
  {
    id: 'bac2026_s1_e2',
    year: 2026,
    sujet: 1,
    exercice: 2,
    points: 7,
    titleAr: 'أنزيم السيرتوين SIRT1 و الريسفيراترول',
    ideaAr:
      'لماذا يحمي النشاط البدني الـ ADN؟ لأنه يرفع NAD⁺، و NAD⁺ يشغّل أنزيماً ينزع الأستيل عن P53.',
    supportsAr: [
      'كمية الركيزة P53A بدلالة الزمن في تراكيز مختلفة من NAD⁺',
      'العلاقة بين أنزيم SIRT1 و حيوية الخلايا',
      'نشاط SIRT1 و حيوية الخلايا في تراكيز متزايدة من الريسفيراترول RSV',
      'نمذجة لجزيئة SIRT1 و آلية عمل RSV',
    ],
    notionAr:
      'المرافق الأنزيمي و المنشّط: ليست كل الجزيئات المتدخلة مثبّطة — بعضها يرفع النشاط.',
    verbsAr: ['حلّل', 'وضّح الوظيفة', 'بيّن الأهمية', 'برّر'],
    unitIds: [3, 1],
    situationIds: ['detergent_enzymatique', 'diabete_januvia'],
    capsuleIds: ['cap_u3_plateau_michaelis', 'cap_u3_inhibition_type'],
    drillIds: ['drill_enzyme_site_actif'],
  },
  {
    id: 'bac2026_s1_e3',
    year: 2026,
    sujet: 1,
    exercice: 3,
    points: 8,
    titleAr: 'الأترازين: مبيد يقتل العشب و يترك الذرة',
    ideaAr:
      'كيف يقضي مبيد على النبتة الضارة دون المحصول، رغم أن كليهما نبات أخضر يقوم بالتركيب الضوئي؟',
    supportsAr: [
      'شدة امتصاص CO₂ و شدة الفلورة عند نبتة شاهدة و أخرى معالجة بالأترازين',
      'متابعة امتصاص CO₂ خلال 50 ساعة عند الذرة و الشوفان و نباتات ضارة',
      'نمذجة موقع ارتباط Q_B في وجود الأترازين (His215، Ser264، Phe255، Phe265)',
      'دور أنزيم GST و الغلوتاثيون GSH عند الذرة',
    ],
    notionAr:
      'المرحلة الكيموضوئية: PSII و ناقل الإلكترونات Q_B؛ الفلورة = طاقة ضوئية لم تُحوَّل.',
    verbsAr: ['بيّن', 'اقترح فرضية', 'صادق على صحة الفرضية', 'برّر', 'أنجز مخططاً وظيفياً'],
    unitIds: [6, 3],
    situationIds: ['jagendorf_chloroplaste', 'serre_agricole'],
    capsuleIds: ['cap_u6_oxygene_eau', 'cap_u6_jagendorf'],
    drillIds: ['drill_chaine_photochimique'],
  },
  {
    id: 'bac2026_s2_e1',
    year: 2026,
    sujet: 2,
    exercice: 1,
    points: 5,
    titleAr: 'غشاء التيلاكوئيد و مبيد الـ Oxyfluorfen',
    ideaAr: 'ما الذي يحدث لتركيب الـ ATP إذا خُرّبت بنية غشاء التيلاكوئيد نفسها؟',
    supportsAr: ['نمذجة لجزء من غشاء التيلاكوئيد بعد إضافة المبيد، مع الوسطين (أ) و (ب)'],
    notionAr:
      'مكوّنات غشاء التيلاكوئيد: الأنظمة الضوئية، النواقل، و ATP سنتاز؛ تدرّج البروتونات (Mitchell).',
    verbsAr: ['اذكر المكونات', 'اشرح في نص علمي'],
    unitIds: [6, 8],
    situationIds: ['jagendorf_chloroplaste', 'feuille_jour_nuit'],
    capsuleIds: ['cap_u6_jagendorf', 'cap_u8_chloroplaste_mitochondrie'],
    drillIds: ['drill_chaine_photochimique'],
  },
  {
    id: 'bac2026_s2_e2',
    year: 2026,
    sujet: 2,
    exercice: 2,
    points: 7,
    titleAr: 'الجلطة الدماغية، القناة ASIC1a و سمّ العنكبوت',
    ideaAr:
      'لماذا تقتل الجلطة الخلايا العصبية؟ لأن حموضة الوسط تفتح قناة تُغرق الهيولى بالكالسيوم.',
    supportsAr: [
      'تركيز Ca²⁺ في الهيولى عند خلايا طبيعية Kwt و أخرى معدّلة وراثياً KO',
      'التيارات الداخلة عبر القناة ASIC1a عند pH 7,4 و pH 6 بتقنية Patch clamp',
      'قوة ارتباط السمّ الطبيعي PcTx1 و الطافر PcTx2 بالجيب الحمضي (Asp، Glu)',
      'نتائج الهجرة الكهربائية للسمّين في وسط حامضي',
    ],
    notionAr:
      'قناة مرتبطة بالـ pH؛ و سلوك الببتيد في الهجرة الكهربائية يكشف شحنته — نفس منطق الـ pHi.',
    verbsAr: ['حلّل', 'وضّح العلاقة', 'اشرح الآلية', 'برّر'],
    unitIds: [5, 2],
    situationIds: ['mixture_acides_amines', 'sarin_attaque'],
    capsuleIds: ['cap_u2_anode_cathode', 'cap_u5_quatre_potentiels'],
    drillIds: ['drill_potentiel_action', 'drill_synapse'],
  },
  {
    id: 'bac2026_s2_e3',
    year: 2026,
    sujet: 2,
    exercice: 3,
    points: 8,
    titleAr: 'الزهايمر: لماذا فشل الجسم المضاد الأول؟',
    ideaAr:
      'جسم مضاد فعّال في الدم و عاجز في المخ: المشكلة ليست في التعرّف بل في العبور إلى المخ.',
    supportsAr: [
      'رسم لوعاء دموي و منطقة من المخ عند مصاب بالزهايمر معالج بـ Anti-Aβ',
      'نسبة صفائح Aβ في المخ و نسبة VLDL في الدم بدلالة تركيز Anti-Aβ',
      'نسبة تشكّل المعقدات المناعية و بلعمتها مع Anti-Aβ و مع ATV-Aβ',
      'نمذجة بنية الجسمين المضادين و آلية عملهما على مستوى المخ',
    ],
    notionAr:
      'بنية الجسم المضاد: الموقع المتغيّر يحدّد النوعية، و باقي الجزيئة يحدّد المصير (عبور، بلعمة).',
    verbsAr: ['اقترح فرضية', 'صادق على صحة الفرضية', 'قارن', 'حلّل'],
    unitIds: [4, 2],
    situationIds: ['labo_ouchterlony', 'vaccination_rappel'],
    capsuleIds: ['cap_u4_humorale_cellulaire', 'cap_u4_primaire_secondaire'],
    drillIds: ['drill_anticorps'],
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

// ───────────────────────── Index inverse et pression mesurée ─────────────────
// Ajouts du sprint 18 : la banque ne sert plus seulement à être lue de l'année
// vers l'exercice, mais aussi de la RESSOURCE vers les sessions. Une situation
// de l'app qui est réellement tombée trois fois au BAC ne doit pas avoir l'air
// d'un exercice inventé pour l'occasion.

export interface BacEcho {
  /** Sessions où la ressource a un écho, décroissant. */
  years: number[];
  /** Identifiants des idées concernées. */
  ideaIds: string[];
}

function echoFor(selector: (idea: BacExerciseIdea) => string[], id: string): BacEcho {
  const touchees = BAC_IDEAS.filter((idea) => selector(idea).includes(id)).sort(
    (a, b) => b.year - a.year || a.sujet - b.sujet || a.exercice - b.exercice,
  );
  return {
    years: Array.from(new Set(touchees.map((i) => i.year))).sort((a, b) => b - a),
    ideaIds: touchees.map((i) => i.id),
  };
}

/** Sessions où une situation de `situationIndex.ts` a un écho réel. */
export function bacEchoForSituation(situationId: string): BacEcho {
  return echoFor((i) => i.situationIds, situationId);
}

/** Sessions où une micro-capsule a un écho réel. */
export function bacEchoForCapsule(capsuleId: string): BacEcho {
  return echoFor((i) => i.capsuleIds, capsuleId);
}

/** Sessions où un schéma à reproduire a un écho réel. */
export function bacEchoForDrill(drillId: string): BacEcho {
  return echoFor((i) => i.drillIds, drillId);
}

/**
 * Pression mesurée d'une unité, en POURCENTAGE des points de l'examen, calculée
 * sur les sessions couvertes (points obtenus comme unité principale).
 *
 * À lire à côté de `unitOpenings.bacWeightPercent`, qui donne le poids ANNONCÉ
 * par la répartition du programme. Les deux ne disent pas la même chose, et
 * c'est l'information la plus utile de toute la banque : voir le sprint 18 de
 * docs/analyse/AUDIT_APP_5_LECONS_PRIORITAIRES.md.
 */
export function observedUnitSharePercent(): Record<number, number> {
  const pression = unitPressure();
  const total = pression.reduce((s, p) => s + p.pointsPrincipaux, 0);
  const out: Record<number, number> = {};
  for (const p of pression) {
    out[p.unitId] = total === 0 ? 0 : Math.round((p.pointsPrincipaux / total) * 1000) / 10;
  }
  return out;
}
