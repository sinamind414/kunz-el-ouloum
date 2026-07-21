// activeLessons.ts
// Modèle de données du Pilier 1 : Leçon Active "Mot par Mot".
// Les leçons sont indexées par le même `lessonId` que celui utilisé dans l'app
// (ex: "lecon_transcription"), pour que le tunnel se déclenche sur une leçon réelle.

// Source de vérité officielle (lexique DZ strict) — voir kunzDatabase.ts.
import { CoreReflexId } from '../data/reflexes';
import { ActiveLesson_D1_U1_L2_Transcription, ActiveLesson_D1_U1_L3_Traduction, ActiveLesson_D1_U3_L1_Enzyme } from './kunzDatabase';
export interface MicroTest {
  prompt: string;
  acceptedAnswers: string[];
  errorHint: string;
}

export interface TextAndProduceBlock {
  type: 'TEXT_AND_PRODUCE';
  objective: string;
  content: string; // Contient des [____] pour les trous
  popups: Record<string, string>; // Définitions des termes cliquables
  microTest: MicroTest;
}

export interface HotspotAndMethodologyBlock {
  type: 'HOTSPOT_AND_METHODOLOGY';
  objective: string;
  introText: string;
  schemaSrc: string; // Chemin local vers le SVG/WebP
  hotspot: {
    prompt: string;
    correctZone: { x: number; y: number; radius: number }; // Pourcentage sur l'image
    successFeedback: string;
  };
  methodology: {
    prompt: string;
    steps: { label: string; placeholder: string; requiredKeywords: string[] }[];
  };
}

export type Block = TextAndProduceBlock | HotspotAndMethodologyBlock;

export interface ActiveLesson {
  id: string;
  title: string;
  blocks: Block[];
}

// Correction A — orientation de fin de leçon (Speckit FINAL §3).
export interface LessonProgression {
  nextLessonId?: string;
  recommendedReflexId?: CoreReflexId;
  completionMessageAr: string;
}

export const LESSON_PROGRESSION: Record<string, LessonProgression> = {
  'lecon_transcription': {
    nextLessonId: 'lecon_traduction',
    recommendedReflexId: 'explain',
    completionMessageAr: 'أكملت الاستنساخ. الخطوة الطبيعية الآن هي فهم الترجمة.',
  },
  'lecon_traduction': {
    nextLessonId: 'lecon_enzyme',
    recommendedReflexId: 'interpret',
    completionMessageAr: 'أكملت الترجمة. الآن حان دور فهم المنحنى الإنزيمي.',
  },
  'lecon_enzyme': {
    nextLessonId: undefined,
    recommendedReflexId: 'hypothesize',
    completionMessageAr: 'أحسنت! أكملت سلسلة الإنزيمات. можете الآن خوض تحدي BAC.',
  },
  'phase11_chapitres_21_22': {
    nextLessonId: undefined,
    recommendedReflexId: 'interpret',
    completionMessageAr: 'أكملت التفاعلات الضوئية. جرّب تحدي BAC للصورانعة الخضراء.',
  },
  'synapse': {
    nextLessonId: undefined,
    recommendedReflexId: 'interpret',
    completionMessageAr: 'أحسنت! فهمت تحوّل التنبيه الكهربائي إلى رسالة كيميائية ثم كهربائية.',
  },
  'subduction': {
    nextLessonId: undefined,
    recommendedReflexId: 'interpret',
    completionMessageAr: 'أحسنت! فهمت كيف يؤدي الغوص إلى انصهار الوشاح ونشاط بركاني.',
  },
  'd1-u1-l2-transcription': {
    nextLessonId: 'd1-u1-l3-traduction',
    recommendedReflexId: 'explain',
    completionMessageAr: 'أكملت الاستنساخ. الخطوة الطبيعية الآن هي فهم الترجمة.',
  },
  'd1-u1-l3-traduction': {
    nextLessonId: 'd1-u3-l1-enzyme',
    recommendedReflexId: 'interpret',
    completionMessageAr: 'أكملت الترجمة. الآن حان دور فهم المنحنى الإنزيمي.',
  },
  'd1-u3-l1-enzyme': {
    recommendedReflexId: 'hypothesize',
    completionMessageAr: 'أحسنت! أكملت سلسلة الإنزيمات.',
  },
};

export function getLessonProgression(lessonId: string): LessonProgression | undefined {
  return LESSON_PROGRESSION[lessonId];
}

export const ACTIVE_LESSONS: Record<string, ActiveLesson> = {
  lecon_transcription: {
    id: 'lecon_transcription',
    title: 'الدرس 3 : الاستنساخ (La Transcription)',
    blocks: [
      {
        type: 'TEXT_AND_PRODUCE',
        objective: 'اكتشاف مقر وآلية تركيب جزيئة ARNm انطلاقا من ADN.',
        content:
          'تتم عملية [____] داخل [____] حيث يركب إنزيم [____] سلسلة ARNm انطلاقا من السلسلة القالبية.',
        popups: {
          'الاستنساخ': 'نقل المعلومة الوراثية من ADN إلى ARNm داخل النواة.',
          'النواة': 'المقر الذي يتم فيه الاستنساخ عند حقيقيات النوى.',
          'ARN بوليميراز': 'الإنزيم الذي يركب ARN في اتجاه 5←3 ويقرأ القالب 3←5.',
        },
        microTest: {
          prompt: 'ما هو الإنزيم الذي يركب ARNm انطلاقا من السلسلة القالبية؟',
          acceptedAnswers: ['ARN بوليميراز'],
          errorHint: 'التعريف الصحيح: ARN بوليميراز',
        },
      },
      {
        type: 'TEXT_AND_PRODUCE',
        objective: 'ربط السلسلة القالبية باتجاه القراءة.',
        content:
          'يقرأ الريبوزوم السلسلة الرسولية من [____] نحو [____]، بينما يُستعمل مرجع تكامل القواعد ما يسمى بـ [____].',
        popups: {
          'السلسلة القالبية': 'السلسلة التي تُستعمل مرجعا لتكامل قواعد ARNm.',
          '5 نحو 3': 'اتجاه قراءة ARNm وتركيب البروتين.',
        },
        microTest: {
          prompt: 'أكمل: السلسلة التي تُستعمل مرجعا لتكامل قواعد ARNm تسمى _______',
          acceptedAnswers: ['السلسلة القالبية'],
          errorHint: 'التعريف الصحيح: السلسلة القالبية',
        },
      },
      {
        type: 'HOTSPOT_AND_METHODOLOGY',
        objective: 'localiser مقر الاستنساخ puis analyser le transfert du signal.',
        introText:
          'لاحظ مخطط خلية حقيقية النوى. حدد مقر حدوث الاستنساخ ثم حلل ظاهرة انتقال الإشعاع من النواة نحو الهيولى دون تفسير (تحليل محض).',
        schemaSrc: '/assets/images/schemas/domaine1_proteines/schema_02_transcription.svg',
        hotspot: {
          prompt: 'انقر على مقر حدوث الاستنساخ (داخل النواة).',
          correctZone: { x: 50, y: 45, radius: 28 },
          successFeedback: 'صحيح! الاستنساخ يتم داخل النواة حيث يوجد ADN.',
        },
        methodology: {
          prompt: 'حلل ظاهرة انتقال الإشعاع من النواة إلى الهيولى (تحليل محض، بدون تفسير).',
          steps: [
            {
              label: 'التحليل (ملاحظة محضة)',
              placeholder: 'ماذا تلاحظ بعد 15 ثم 90 دقيقة؟ تجنب لأن/راجع إلى...',
              requiredKeywords: ['النواة', 'الهيولى', 'الإشعاع'],
            },
            {
              label: 'الاستنتاج',
              placeholder: 'استنتج مقر وآلية تركيب ARNm...',
              requiredKeywords: ['يتم تركيب', 'ARNm'],
            },
          ],
        },
      },
    ],
  },

  phase11_chapitres_21_22: {
    id: 'phase11_chapitres_21_22',
    title: 'الدرس 21 : التفاعلات الضوئية (Photosynthèse)',
    blocks: [
      {
        type: 'HOTSPOT_AND_METHODOLOGY',
        objective: 'localiser مقر التفاعلات الضوئية ثم تحليلها منهجيا.',
        introText:
          'لاحظ مخطط الصانعة الخضراء. حدد مقر التفاعلات الضوئية (التيلاكويد) ثم حلل دور الأنظمة الضوئية في التقاط الفوتونات.',
        schemaSrc: '/assets/images/schemas/domaine2_energie/schema_09_photosynthese.svg',
        hotspot: {
          prompt: 'انقر على التيلاكويد (مقر التفاعلات الضوئية).',
          correctZone: { x: 50, y: 55, radius: 30 },
          successFeedback: 'صحيح! التفاعلات الضوئية تتم على غشاء التيلاكويد.',
        },
        methodology: {
          prompt: 'حلل دور الأنظمة الضوئية PSII و PSI في التقاط الفوتونات (تحليل محض).',
          steps: [
            {
              label: 'التحليل',
              placeholder: 'صف ما يحدث للإلكترونات دون تفسير...',
              requiredKeywords: ['الفوتون', 'الأنظمة الضوئية', 'الإلكترونات'],
            },
            {
              label: 'الاستنتاج',
              placeholder: 'استنتج مصدر الأكسجين المنطلق...',
              requiredKeywords: ['الماء', 'الأكسجين'],
            },
          ],
        },
      },
    ],
  },
  synapse: {
    id: 'synapse',
    title: 'الدرس 5 : المشبك العصبي (Synapse)',
    blocks: [
      {
        type: 'HOTSPOT_AND_METHODOLOGY',
        objective: 'localiser نهاية المشبك قبل المشبكي ثم تحليل تحوّل التنبيه.',
        introText:
          'لاحظ مخطط المشبك الكيميائي. حدد النهاية قبل المشبكية ثم حلل تحوّل التنبيه الكهربائي إلى رسالة كيميائية ثم كهربائية.',
        schemaSrc: '/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg',
        hotspot: {
          prompt: 'انقر على النهاية قبل المشبكية (مقر تحرير الناقل العصبي).',
          correctZone: { x: 50, y: 30, radius: 25 },
          successFeedback: 'صحيح! عند الوصول الكمون العمل تنفتح قنوات Ca²⁺ وتتحرر الحويصلات المشبكية.',
        },
        methodology: {
          prompt: 'حلل تحوّل التنبيه الكهربائي إلى رسالة كيميائية ثم كهربائية (تحليل محض).',
          steps: [
            {
              label: 'الملاحظة',
              placeholder: 'صف ما يحدث عند وصول كمون العمل إلى النهاية قبل المشبكية...',
              requiredKeywords: ['كمون العمل', 'Ca²⁺', 'حويصلات'],
            },
            {
              label: 'الآلية',
              placeholder: 'اشرح كيف يتحوّل التنبيه الكهربائي إلى رسالة كيميائية...',
              requiredKeywords: ['ناقل عصبي', 'شق مشبكي', 'مستقبل'],
            },
            {
              label: 'الاستنتاج',
              placeholder: 'استنتج كيف تعود الإشارة إلى شكل كهربائي بعد المشبكي...',
              requiredKeywords: ['PPSE', 'PPSI', 'كمون بعد مشبكي'],
            },
          ],
        },
      },
    ],
  },
  subduction: {
    id: 'subduction',
    title: 'الدرس 11 : الغوص (Subduction)',
    blocks: [
      {
        type: 'HOTSPOT_AND_METHODOLOGY',
        objective: 'localiser zone de subduction puis analyser rôle de l\'eau libérée.',
        introText:
          'لاحظ مخطط الغوص. حدد اللوح الغائص ومصدر الماء ثم حلل كيف يخفض الماء درجة انصهار الوشاح.',
        schemaSrc: '/assets/images/schemas/domaine3_tectonique/schema_16_subduction.svg',
        hotspot: {
          prompt: 'انقر على اللوح الغائص (الصفيحة المحيطية الكثيفة).',
          correctZone: { x: 35, y: 60, radius: 25 },
          successFeedback: 'صحيح! الصفيحة المحيطية الباردة الكثيفة تنغمس تحت الصفيحة الطافية.',
        },
        methodology: {
          prompt: 'حلل كيف يخفض الماء المحرر درجة انصهار الوشاح فوق اللوح الغائص (تحليل محض).',
          steps: [
            {
              label: 'الملاحظة',
              placeholder: 'صف ما يحدث للصفيحة المحيطية عند الغوص...',
              requiredKeywords: ['اندساس', 'صفيحة محيطية', 'كثيفة', 'باردة'],
            },
            {
              label: 'الآلية',
              placeholder: 'اشرح كيف يتحرر الماء من اللوح الغائص...',
              requiredKeywords: ['ماء', 'معادن', 'الوشاح', 'انصهار جزئي'],
            },
            {
              label: 'الاستنتاج',
              placeholder: 'استنتج كيف تتولد الصهارة والبركانية...',
              requiredKeywords: ['صهارة', 'بركانية', 'قوس', 'أنديزيت'],
            },
          ],
        },
      },
    ],
  },

  // Leçons officielles câblées depuis la Source de Vérité (kunzDatabase.ts).
  'd1-u1-l2-transcription': ActiveLesson_D1_U1_L2_Transcription as ActiveLesson,
  'd1-u1-l3-traduction': ActiveLesson_D1_U1_L3_Traduction as ActiveLesson,
  'd1-u3-l1-enzyme': ActiveLesson_D1_U3_L1_Enzyme as ActiveLesson,
};
