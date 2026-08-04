import type { CoreReflexId } from './reflexes';

export type MethodologyEntryDoorId = 'beginner' | 'verb' | 'error';

export interface MethodologyEntryDoor {
  id: MethodologyEntryDoorId;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
}

export interface MethodologyJourneyStep {
  id: string;
  order: number;
  reflexId: CoreReflexId;
  titleAr: string;
  focusAr: string;
  productionAr: string;
  mistakeAr: string;
  estimatedMinutes: number;
}

export const METHODOLOGY_ENTRY_DOORS: MethodologyEntryDoor[] = [
  {
    id: 'beginner',
    title: 'لا أعرف من أين أبدأ',
    subtitle: 'ابدأ من هنا',
    description: 'مسار مقترح خطوة بخطوة: من فهم الفعل إلى أول إنتاج قصير مصحح.',
    cta: 'ابدأ المسار',
  },
  {
    id: 'verb',
    title: 'أريد تعلم فعل BAC',
    subtitle: 'تعلم فعلا واحدا',
    description: 'اختر واحداً من réflexes Kunz الستة وتعلم تعريفه وخطواته ومثاله.',
    cta: 'اختر الفعل',
  },
  {
    id: 'error',
    title: 'لدي خطأ أريد إصلاحه',
    subtitle: 'أصلح خطأ متكررا',
    description: 'ادخل مباشرة إلى أشهر الأخطاء المنهجية وكيف تعيد صياغة الجواب الصحيح.',
    cta: 'أصلح خطئي',
  },
];

// Ordre pédagogique recommandé pour l’élève débutant.
export const BEGINNER_JOURNEY_STEPS: MethodologyJourneyStep[] = [
  {
    id: 'step_analyse',
    order: 1,
    reflexId: 'analyse',
    titleAr: 'حلّل',
    focusAr: 'ابدأ بالملاحظة: ماذا ترى في الوثيقة دون تفسير؟',
    productionAr: 'اكتب سطرين: "تمثل الوثيقة ... حيث نلاحظ ..."',
    mistakeAr: 'لا تستعمل لأن / يعود ذلك إلى داخل التحليل.',
    estimatedMinutes: 5,
  },
  {
    id: 'step_interpret',
    order: 2,
    reflexId: 'interpret',
    titleAr: 'فسّر',
    focusAr: 'اربط الملاحظة بسببها العلمي وآليتها.',
    productionAr: 'اكتب سببا واضحا باستعمال: لأن / يعود ذلك إلى / يفسر ذلك بـ.',
    mistakeAr: 'لا تكرر الملاحظة وحدها؛ التفسير يحتاج سببا علميا.',
    estimatedMinutes: 5,
  },
  {
    id: 'step_compare',
    order: 3,
    reflexId: 'compare',
    titleAr: 'قارن',
    focusAr: 'ثبّت معيار المقارنة ثم اذكر التشابه والاختلاف.',
    productionAr: 'اكتب مقارنة قصيرة باستعمال: بينما / في حين / بالمقابل.',
    mistakeAr: 'لا تقفز مباشرة إلى الخلاصة قبل ذكر المعيار والاختلاف.',
    estimatedMinutes: 4,
  },
  {
    id: 'step_hypothesize',
    order: 4,
    reflexId: 'hypothesize',
    titleAr: 'اقترح فرضية',
    focusAr: 'استند إلى دليل وصغ فرضية قابلة للاختبار.',
    productionAr: 'استعمل: نفترض أن ... مما يؤدي إلى ... ويمكن التحقق من ذلك بـ ...',
    mistakeAr: 'تجنب "ربما" — الفرضية يجب أن تكون محددة.',
    estimatedMinutes: 5,
  },
  {
    id: 'step_validate',
    order: 5,
    reflexId: 'validate',
    titleAr: 'صادق',
    focusAr: 'واجه الفرضية بالدليل ثم احكم عليها.',
    productionAr: 'اكتب: بالاستناد إلى الوثيقة ... يتطابق / لا يتطابق ... لذلك ...',
    mistakeAr: 'لا تقل "صحيحة" أو "خاطئة" دون دليل صريح.',
    estimatedMinutes: 4,
  },
  {
    id: 'step_explain',
    order: 6,
    reflexId: 'explain',
    titleAr: 'اشرح / بيّن',
    focusAr: 'اجمع المعطيات والآلية العلمية في جواب واحد متماسك.',
    productionAr: 'اكتب فقرة قصيرة تربط الوثائق ثم تختم بجواب كامل.',
    mistakeAr: 'لا تجمع جُملا صحيحة بلا روابط منطقية.',
    estimatedMinutes: 6,
  },
];

export const SUPPORTING_SKILLS_OVERVIEW = [
  'استنتج',
  'علل / برر',
  'حدد',
  'صف',
  'اكتب نصا علميا',
  'أنجز مخططا',
];
