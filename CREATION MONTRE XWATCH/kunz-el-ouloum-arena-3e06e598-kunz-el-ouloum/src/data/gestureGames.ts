// src/data/gestureGames.ts
// Audit 03102026, idée 3 — les deux mini-jeux qui installent les gestes.
//
// PROBLÈME VÉRIFIÉ (audit 03102026, BILAN §1.3 points 9 et 10) :
//   Aucun repérage de preuves, aucun réordonnancement de chaîne.
//   L'élève reste en lecture passive. Or extraire une donnée et ordonner une
//   explication sont deux GESTES moteurs, pas deux savoirs.
//
// SOLUTION : deux activités de 3 minutes maximum, corrigées localement, avec
// un seuil de passage. Ce sont les deux manettes manquantes de la boucle
// d'apprentissage répétitif :
//   - mini-jeu 1 « Attrape la preuve » → installe le geste دليل (repérer)
//   - mini-jeu 2 « Construis le pont »  → installe le geste علاقة (ordonner)
// Ils alimentent ensuite gestureRecallEngine (idée 1) : une fois validés, ils
// entrent dans la rotation J+1 → J+3 → J+7 → J+14.
//
// Contraintes AGENTS.md respectées :
//   - contenu réel, rien inventé (chiffres/énoncés du programme BAC DZ)
//   - arabe فصحى uniquement, pas de dialecte

/**
 * Mini-jeu 1 — « Attrape la preuve » (gestureGames.ts)
 *
 * Geste entraîné : دليل (Prouver) — repérer dans une consigne/document les
 * éléments qui sont des PREUVES exploitables (valeur + unité, nom de la
 * source, paramètre mesuré), et écouter les distracteurs (opinion, hors-sujet,
 * conclusion prématurée).
 *
 * Mécanique : l'élève tape les jetons qu'il juge être des preuves. Correction
 * locale exacte (ensemble), seuil de passage 2/3 réussis.
 */
export interface ProofSpotterItem {
  id: string;
  /** La consigne complète telle qu'elle apparaîtrait dans un énoncé BAC. */
  promptAr: string;
  /** Jetons sélectionnables : indices = ce sont des preuves. */
  tokens: string[];
  /** Indices des jetons qui sont des preuves exploitables. */
  proofIndexes: number[];
  /** Feedback affiché après validation. */
  feedbackAr: string;
}

export const PROOF_SPOTTER_ITEMS: ProofSpotterItem[] = [
  {
    id: 'ps_enzymes_1',
    promptAr: 'يقيس الجدول 1 سرعة التحلل وفقًا لتركيز الركيزة. حلل الوثيقة 1 ثم استنتج.',
    tokens: ['١.٨ غ/ل', 'تركيز الركيزة', 'سرعة التحلل', 'الإنزيم يخرب بالحرارة', 'الجدول 1', 'رأيي أن الإنزيم مهم'],
    proofIndexes: [0, 1, 2, 4],
    feedbackAr: 'الإثباتات: القيمة ١.٨ غ/ل (مع وحدتها)، المتغيران المقيسان (التركيز والسرعة)، ومصدرها الجدول 1. أما « الإنزيم يخرب بالحرارة » فاستنتاج، و « رأيي » فحكم شخصي — لا يدخلان في التحليل الوصفي.',
  },
  {
    id: 'ps_immunite_1',
    promptAr: 'يمثل المنحنى 2 تطور كمية الأجسام المضادة في البلازما بعد حقن مستضد X.',
    tokens: ['المنحنى 2', 'كمية الأجسام المضادة', 'البلازما', 'المناعة خلفتني', 'مستضد X', 'الجسم يعرف نفسه'],
    proofIndexes: [0, 1, 2, 4],
    feedbackAr: 'الإثباتات: المصدر (المنحنى 2)، المتغير المقيس (كمية الأجسام المضادة)، مكان القياس (البلازما)، وطبيعة المثير (مستضد X). الباقي ليس دليلًا بل تفسير أو حكم خارج الوثيقة.',
  },
  {
    id: 'ps_genetique_1',
    promptAr: 'يظهر الرسم 3 تتابع الكودونات على ARNm ثم السلسلة الببتيدية الناتجة.',
    tokens: ['تتابع الكودونات', 'ARNm', 'السلسلة الببتيدية', 'الطفرات خطيرة', 'الرسم 3', 'الحمض الأميني رقم 4'],
    proofIndexes: [0, 1, 2, 4, 5],
    feedbackAr: 'الإثباتات: المصدر (الرسم 3)، والبنيتان المعروضتان (الكودونات والسلسلة)، وعنصر ملموس (الحمض الأميني رقم 4). « الطفرات خطيرة » حكم قيمي لا يُستخرج من الرسم.',
  },
];

/**
 * Mini-jeu 2 — « Construis le pont »
 *
 * Geste entraîné : علاقة (Relier) — remettre la chaîne causale dans le bon
 * ordre, du fait observé jusqu'au mécanisme, sans intercaler d'interprétation
 * prématurée. C'est le contre-poison du défaut رقم 2 (خلط بين الوصف والتفسير).
 *
 * Mécanique : drag-and-drop simulé par réordonnancement d'items, correction
 * locale séquentielle exacte, seuil 2/3 réussis.
 */
export interface ChainOrderItem {
  id: string;
  /** Le phénomène à expliquer, posé comme question. */
  situationAr: string;
  /** Les maillons de la chaîne, mélangés à l'affichage. */
  links: string[];
  /** L'ordre attendu, en indices de links. */
  correctOrder: number[];
  /** Feedback affiché après validation. */
  feedbackAr: string;
}

export const CHAIN_ORDER_ITEMS: ChainOrderItem[] = [
  {
    id: 'co_pho_photo_1',
    // Chaîne de la photosynthèse — la plus classique au BAC (U3 conversions énergétiques).
    situationAr: 'فسّر لماذا يطلق الأكسجين في وريقات نبات معرض للضوء.',
    links: [
      'يصل الضوء إلى البلاستيدات الخضراء',
      'تُمتص الطاقة الضوئية بواسطة اليخضور',
      'تنشط مرحلة الإلكترونات في الغشاء التيلاكويدي',
      'يتم انشطار جزيء الماء (التحلل الضوئي للماء)',
      'ينطلق غاز الأكسجين كناتج',
    ],
    correctOrder: [0, 1, 2, 3, 4],
    feedbackAr: 'الترتيب الصحيح: الضوء يصل → اليخضور يمتص → تنشط المرحلة الكيميوضوئية → ينشطر الماء → ينطلق الأكسجين. لا يمكن قفز « انشطار الماء » قبل امتصاص الضوء: هذا سلسلة سببية، لا قائمة.',
  },
  {
    id: 'co_immunite_1',
    situationAr: 'فسّر كيف تتعرف الخلايا على مستضد X.',
    links: [
      'يَدخل المستضد X إلى الجسم',
      'يلتقطه بلعم كبير ويُعالجه',
      'يُعرض المستضد المعالج على سطح الخلية',
      'تتعرف عليه اللمفاويات LB المناسبة',
      'تنشط اللمفاويات LB وتتكاثر',
    ],
    correctOrder: [0, 1, 2, 3, 4],
    feedbackAr: 'الترتيب الصحيح: دخول المستضد → بلع ومعالجة → عرض على السطح → تعرف LB → تنشط وتتكاثر. هذا يطالب « فسّر »: كل خطوة هي سبب التي تليها.',
  },
  {
    id: 'co_enzyme_1',
    situationAr: 'فسّر استقرار سرعة التحلل عند زيادة تركيز الركيزة.',
    links: [
      'يضاف المزيد من الركيزة إلى الوسط',
      'تشغل كل مواقع الإنزيم النشطة',
      'لا تبقى أي موقع نشطة حرة',
      'تثبت السرعة عند قيمة عظمى (Vmax)',
    ],
    correctOrder: [0, 1, 2, 3],
    feedbackAr: 'الترتيب الصحيح: زيادة الركيزة → إشغال المواقع → التشبع → ثبات السرعة. لاحظ: العلاقة سببية (لأنّ)، ليست وصفية (في حين أنّ) — هذا ما يطلبه الفعل « فسّر ».',
  },
];

/** Seuil de passage commun aux deux mini-jeux (audit : « un seuil de passage »). */
export const GESTURE_GAME_PASS_THRESHOLD = 2;

export const GESTURE_GAME_TARGETS: Record<string, string> = {
  ps: 'verb_prouver',
  co: 'verb_relier',
};
