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
export type TrainingTab = 'situations' | 'schemas' | 'animations' | 'bootcamp' | 'workshop';

export interface TrainingEntry {
  tab: TrainingTab;
  titleAr: string;
  /** Ce que l'élève y fait, en une phrase — pas un slogan. */
  descriptionAr: string;
  /** Le geste travaillé, affiché en pastille. */
  gestureAr: string;
  /** Icône lucide (nom), résolue par la vue. */
  icon: 'search' | 'penTool' | 'sparkles' | 'swords' | 'playCircle';
}

export const TRAINING_ENTRIES: TrainingEntry[] = [
  {
    tab: 'situations',
    titleAr: 'تمارين بالوضعيات',
    descriptionAr: 'ابحث عن التمرين بالحالة الملموسة — المضاد الحيوي، مريض السكري، زرع الكلية — ثم عالج سنده.',
    gestureAr: 'أحلّل سنداً',
    icon: 'search',
  },
  {
    tab: 'schemas',
    titleAr: 'ارسم من الذاكرة',
    descriptionAr: 'الرسومات التي يجب حفظها: ورقة بيضاء أولاً، ثم شبكة تقييم، ثم الرسم الرسمي.',
    gestureAr: 'أرسم وأقيّم',
    icon: 'penTool',
  },
  {
    tab: 'bootcamp',
    titleAr: 'تحدي البكالوريا',
    descriptionAr: 'اختبارات في نمط الامتحان لقياس الأداء تحت ضغط الوقت.',
    gestureAr: 'أختبر نفسي',
    icon: 'swords',
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
];

export const TRAINING_ENTRY_COUNT = TRAINING_ENTRIES.length;
