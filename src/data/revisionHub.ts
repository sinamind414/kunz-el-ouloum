// revisionHub.ts — hub « المراجعة » (réviser / consolider).
//
// Objectif de CETTE rubrique : mémoriser et consolider ce qui a DÉJÀ été
// compris. Rien qui serve à découvrir une notion (→ « الدروس ») ni à
// produire une réponse sous contrainte (→ « التمارين والتدريب »).
//
// Décision du 2026-10-11 (restructuration en 5 rubriques) :
//   - « خطة المراجعة النهائية » (plan) et « ارسم من الذاكرة » (schemas)
//     QUITTENT le hub d'entraînement pour rejoindre celui-ci : programmer sa
//     révision et récupérer un schéma en mémoire sont deux gestes de
//     consolidation, pas deux gestes d'entraînement.
//   - « المراجعة الذكية » (review, SM-2) reste la carte principale.
//
// Même discipline que trainingHub.ts : ce fichier est la SOURCE UNIQUE de ce
// regroupement — l'onglet réel visé (`tab`) y est déclaré à côté du libellé,
// ce qui permet de vérifier par test qu'aucune entrée ne pointe vers un onglet
// inexistant et qu'aucun espace n'est en double dans deux hubs.

/** Onglets de l'application atteignables depuis le hub Réviser. */
export type RevisionTab = 'review' | 'plan' | 'schemas';

export interface RevisionEntry {
  tab: RevisionTab;
  titleAr: string;
  /** Ce que l'élève y fait, en une phrase — pas un slogan. */
  descriptionAr: string;
  /** Le geste travaillé, affiché en pastille. */
  gestureAr: string;
  /** Icône lucide (nom), résolue par la vue. */
  icon: 'layers' | 'calendar' | 'penTool';
}

export const REVISION_ENTRIES: RevisionEntry[] = [
  {
    // Le SM-2 réel (src/utils/flashcardsSrs.ts) : cartes dues d'abord.
    tab: 'review',
    titleAr: 'المراجعة الذكية',
    descriptionAr: 'البطاقات المستحقة اليوم حسب الذاكرة: راجع ثم قيّم نفسك، وسأعيد جدولة كل بطاقة.',
    gestureAr: 'أثبّت بالتكرار المتباعد',
    icon: 'layers',
  },
  {
    // Déplacé depuis le hub d'entraînement le 2026-10-11.
    tab: 'plan',
    titleAr: 'خطة المراجعة النهائية',
    descriptionAr: 'قل لي كم بقي من الوقت، وسأعطيك برنامج اليوم: كبسولة، رسم، وضعية، خريطة.',
    gestureAr: 'أنظّم وقتي',
    icon: 'calendar',
  },
  {
    // Déplacé depuis le hub d'entraînement le 2026-10-11 : la récupération en
    // mémoire est un geste de consolidation, pas d'entraînement.
    tab: 'schemas',
    titleAr: 'ارسم من الذاكرة',
    descriptionAr: 'الرسومات التي يجب حفظها: ورقة بيضاء أولاً، ثم شبكة تقييم، ثم الرسم الرسمي.',
    gestureAr: 'أسترجع وأقيّم',
    icon: 'penTool',
  },
];

export const REVISION_ENTRY_COUNT = REVISION_ENTRIES.length;
