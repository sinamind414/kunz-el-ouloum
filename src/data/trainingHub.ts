// trainingHub.ts — regroupement des espaces d'entraînement (dette UI du sprint 12).
//
// Après les sprints 10 (تمارين بالوضعيات) et 12 (ارسم من الذاكرة), la navigation
// secondaire comptait 9 entrées : au-delà de 7, un menu cesse d'être lu et
// devient un mur. Plutôt que d'ajouter un dixième onglet à l'item 19, les cinq
// espaces qui servent tous le même geste — S'ENTRAÎNER — sont réunis derrière
// une porte unique « التمارين والتدريب ».
//
// Ce fichier est la source de vérité de ce regroupement : l'onglet réel visé
// (`tab`) y est déclaré à côté du libellé, ce qui permet de vérifier par test
// qu'aucune entrée ne pointe vers un onglet inexistant.

/** Onglets de l'application atteignables depuis le hub. */
export type TrainingTab = 'bacideas' | 'situations' | 'animations' | 'bootcamp' | 'workshop' | 'tadwin' | 'methodology' | 'examens';

export interface TrainingEntry {
  tab: TrainingTab;
  titleAr: string;
  /** Ce que l'élève y fait, en une phrase — pas un slogan. */
  descriptionAr: string;
  /** Le geste travaillé, affiché en pastille. */
  gestureAr: string;
  /** Icône lucide (nom), résolue par la vue. */
  icon: 'search' | 'penTool' | 'sparkles' | 'swords' | 'playCircle' | 'calendar' | 'fileText' | 'key';
  /** Phase 2 (GO 2026-10-16) — progression verrouillée : nombre d'UNITÉS
   *  COMPLÈTES (leçons + جسر) requises avant que la carte s'ouvre. Absent =
   *  outil transversal, libre dès le premier jour (مفتاح, ورشة, examens…).
   *  Lu depuis la progression RÉELLE du parcours (unitesCompletes), jamais
   *  estimée. Verrou : cadenasHubs.test.tsx. */
  deverrouApresUnites?: number;
}

export const TRAINING_ENTRIES: TrainingEntry[] = [
  {
    // 2026-10-11 — « خطة المراجعة النهائية » a quitté CE hub pour le hub
    // « المراجعة » (revisionHub.ts) : programmer sa révision est un geste de
    // consolidation, pas d'entraînement. Une seule porte par objectif.
    // Sprint 16 (item 12) : la porte « qu'est-ce qui est tombé ? », en tête
    // — c'est ce que l'élève cherche avant de s'entraîner.
    tab: 'bacideas',
    titleAr: 'أفكار التمارين حسب الدورة',
    descriptionAr: 'ما الذي سقط في بكالوريا 2019 إلى 2025: فكرة كل تمرين، سنداته، الفعل الإدائي، و الوحدة المستهدفة.',
    gestureAr: 'أقرأ الامتحان',
    icon: 'fileText',
  },
  {
    tab: 'situations',
    titleAr: 'تمارين بالوضعيات',
    descriptionAr: 'ابحث عن التمرين بالحالة الملموسة — المضاد الحيوي، مريض السكري، زرع الكلية — ثم عالج سنده.',
    gestureAr: 'أحلّل سنداً',
    icon: 'search',
  },
  {
    // 2026-10-11 — « ارسم من الذاكرة » a quitté CE hub pour le hub « المراجعة »
    // (revisionHub.ts) : récupérer un schéma en mémoire est une consolidation.
    tab: 'bootcamp',
    titleAr: 'تحدي البكالوريا',
    descriptionAr: 'اختبارات في نمط الامتحان لقياس الأداء تحت ضغط الوقت.',
    gestureAr: 'أختبر نفسي',
    icon: 'swords',
    // Phase 2 (GO 2026-10-16) : simulation d'examen → méritée par la
    // progression réelle. Seuil éditorial : 2 unités complètes.
    deverrouApresUnites: 2,
  },
  {
    tab: 'workshop',
    titleAr: 'الورشة التفاعلية',
    descriptionAr: 'درس مبني على الإنتاج: تملأ الفراغات وتبني الجواب خطوة بخطوة.',
    gestureAr: 'أنتج جواباً',
    icon: 'playCircle',
  },
  {
    tab: 'animations',
    titleAr: 'الأنميشن العلمي',
    descriptionAr: 'محاكاة متحركة وتفاعلية للآليات، منها محاكي الترحيل الكهربائي.',
    gestureAr: 'أشاهد آلية',
    icon: 'sparkles',
  },
  {
    tab: 'tadwin',
    titleAr: 'التدوين الشامل',
    descriptionAr: 'استخرج زبدة الدرس في مفاتيح قليلة بأسلوبك، ثم ثبّتها بالاسترجاع المتباعد.',
    gestureAr: 'أدوّن الزبدة',
    icon: 'penTool',
  },
  {
    // 2026-10-11 — « مفتاح المنهجية » rejoint CE hub : corriger sa copie et
    // travailler la méthode (ICM + 4 مراحل) sont des gestes de production,
    // pas de consolidation. Sa porte principale est ici, plus dans « المزيد ».
    tab: 'methodology',
    titleAr: 'مفتاح المنهجية',
    descriptionAr: 'المنهجية الكاملة: ICM + 4 مراحل، سند وحكم وتركيب، وقوالب النص العلمي المقبولة في التصحيح.',
    gestureAr: 'أتقن منهجية الإجابة',
    icon: 'key',
  },
  {
    // 2026-10-12 — les examens quittent l'écran 1 de « الدروس » (ils mélangeaient
    // apprentissage et entraînement). Porte unique : QCM du livre officiel +
    // tests bac complets, ouverts ensuite par deep-link dans LessonsView.
    tab: 'examens',
    titleAr: 'الاختبارات',
    descriptionAr: 'اختبار الفصول حسب كل فصل، وثلاثة اختبارات بكالوريا كاملة بتصحيح ذاتي على سلّم التنقيط.',
    gestureAr: 'أختبر نفسي على سلم التنقيط',
    icon: 'fileText',
  },
];

export const TRAINING_ENTRY_COUNT = TRAINING_ENTRIES.length;
