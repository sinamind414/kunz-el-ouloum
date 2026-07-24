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
  'protein_structure_function': {
    nextLessonId: undefined,
    recommendedReflexId: 'interpret',
    completionMessageAr: 'أحسنت! فهمت كيف يحدد تتابع الأحماض الأمينية بنية البروتين ووظيفته.',
  },
  'immunity_self_nonself': {
    nextLessonId: 'immunity_humoral_response',
    recommendedReflexId: 'interpret',
    completionMessageAr: 'أكملت التمييز بين الذات واللاذات. الآن انتقل إلى الاستجابة الخلطية.',
  },
  'immunity_humoral_response': {
    nextLessonId: 'immunity_cellular_response',
    recommendedReflexId: 'explain',
    completionMessageAr: 'أكملت الاستجابة الخلطية. الآن انتقل إلى الاستجابة الخلوية.',
  },
  'immunity_cellular_response': {
    nextLessonId: 'immunity_memory_response',
    recommendedReflexId: 'explain',
    completionMessageAr: 'أكملت الاستجابة الخلوية. الآن انتقل إلى الذاكرة المناعية.',
  },
  'immunity_memory_response': {
    nextLessonId: undefined,
    recommendedReflexId: 'interpret',
    completionMessageAr: 'أحسنت! أكملت سلسلة المناعة: الذات واللاذات → خلطية → خلوية → ذاكرة.',
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
  protein_structure_function: {
    id: 'protein_structure_function',
    title: 'الدرس 8 : بنية ووظيفة البروتين (Protein structure–function)',
    blocks: [
      {
        type: 'HOTSPOT_AND_METHODOLOGY',
        objective: 'localiser structure 3D du protéine puis analyser relation structure–fonction.',
        introText:
          'لاحظ مخطط البروتين. حدد الموقع النشط ثم حلل كيف يحدد تتابع الأحماض الأمينية البنية الثالثية والوظيفة.',
        schemaSrc: '/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg',
        hotspot: {
          prompt: 'انقر على الموقع النشط (منطقة الارتباط بالركيزة).',
          correctZone: { x: 50, y: 50, radius: 20 },
          successFeedback: 'صحيح! الموقع النشط يتشكّل من البنية الثالثية للبروتين.',
        },
        methodology: {
          prompt: 'حلل كيف يحدد تتابع الأحماض الأمينية بنية البروتين ووظيفته (تحليل محض).',
          steps: [
            {
              label: 'الملاحظة',
              placeholder: 'صف ما يحدد البنية الأولية للبروتين...',
              requiredKeywords: ['تتابع الأحماض الأمينية', 'البنية الأولية', 'الجين'],
            },
            {
              label: 'الآلية',
              placeholder: 'اشرح كيف تنطوي البنية الأولية إلى بنية ثالثية...',
              requiredKeywords: ['بنية ثالثية', 'طية', 'موقع نشط'],
            },
            {
              label: 'الاستنتاج',
              placeholder: 'استنتج كيف يحدد الموقع النشط الوظيفة البيولوجية...',
              requiredKeywords: ['وظيفة', 'تفاعل', 'ركيزة', 'مرض'],
            },
          ],
        },
      },
    ],
  },
  immunity_self_nonself: {
    id: 'immunity_self_nonself',
    title: 'الدرس 12 : الذات واللاذات (Immunité 1)',
    blocks: [
      {
        type: 'HOTSPOT_AND_METHODOLOGY',
        objective: 'comprendre comment le système immunitaire distingue le soi du non-soi via le CMH.',
        introText:
          'لاحظ مخطط CMH. حدد marker de reconnaissance puis explique pourquoi un greffe peut être rejeté.',
        schemaSrc: '/assets/images/schemas/domaine1_proteines/schema_19_immunite_cmh.svg',
        hotspot: {
          prompt: 'انقر على molécules de CMH (marqueurs du soi).',
          correctZone: { x: 50, y: 50, radius: 20 },
          successFeedback: 'صحيح! Le CMH porte l\'identité immunitaire de chaque cellule.',
        },
        methodology: {
          prompt: 'حلل كيف ي Distingue le système immunitaire le soi du non-soi (analyse pure).',
          steps: [
            {
              label: 'الملاحظة',
              placeholder: 'صف ما تحمله خلايا الجسم على سطحها...',
              requiredKeywords: ['CMH', 'ذات', 'خلايا'],
            },
            {
              label: 'الآلية',
              placeholder: 'اشرح كيف تتعرف اللمفاويات T على الخلايا الذاتية...',
              requiredKeywords: ['تعرف مناعي', 'CMH', 'لاذات'],
            },
            {
              label: 'الاستنتاج',
              placeholder: 'استنتج لماذا يرفض الطعم غير المتوافق...',
              requiredKeywords: ['رفض', 'طعم', 'CMH', 'تعرف'],
            },
          ],
        },
      },
    ],
  },
  immunity_humoral_response: {
    id: 'immunity_humoral_response',
    title: 'الدرس 13 : الاستجابة الخلطية (Immunité 2)',
    blocks: [
      {
        type: 'HOTSPOT_AND_METHODOLOGY',
        objective: 'expliquer comment les lymphocytes B produisent des anticorps spécifiques.',
        introText:
          'لاحظ مخطط الاستجابة الخلطية. حدد LB puis suit son activation jusqu\'à la cellule plasmatique.',
        schemaSrc: '/assets/images/schemas/domaine1_proteines/schema_20_immunite_humorale.svg',
        hotspot: {
          prompt: 'انقر sur lymphocyte B (cellule qui reconnaît l\'antigène).',
          correctZone: { x: 50, y: 50, radius: 20 },
          successFeedback: 'صحيح! Le lymphocyte B reconnaît l\'antigène spécifiquement.',
        },
        methodology: {
          prompt: 'حلل كيف تؤدي اللمفاوية B إلى إنتاج أجسام مضادة نوعية (تحليل محض).',
          steps: [
            {
              label: 'الملاحظة',
              placeholder: 'صف ما يحدث عند تعرف اللمفاوية B على المستضد...',
              requiredKeywords: ['لمفاوية B', 'مستضد', 'تعرف'],
            },
            {
              label: 'الآلية',
              placeholder: 'اشرح كيف تتكاثر وتتمايز اللمفاوية B...',
              requiredKeywords: ['تكاثر نسيلي', 'تمايز', 'خلية بلازمية'],
            },
            {
              label: 'الاستنتاج',
              placeholder: 'استنتج كيف تفرز الخلايا البلازمية أجساماً مضادة...',
              requiredKeywords: ['جسم مضاد', 'إفراز', 'بلازمية'],
            },
          ],
        },
      },
    ],
  },
   immunity_cellular_response: {
    id: 'immunity_cellular_response',
    title: 'الدرس 14 : الاستجابة الخلوية (Immunité 3)',
    blocks: [
      {
        type: 'HOTSPOT_AND_METHODOLOGY',
        objective: 'expliquer comment les lymphocytes T éliminent les cellules infectées.',
        introText:
          'لاحظ مخطط الاستجابة الخلوية. حدد LT puis explique comment elle reconnaît la cellule cible.',
        schemaSrc: '/assets/images/schemas/domaine1_proteines/schema_21_immunite_cellulaire.svg',
        hotspot: {
          prompt: 'انقر sur lymphocyte T (cellule qui tue la cible).',
          correctZone: { x: 50, y: 50, radius: 20 },
          successFeedback: 'صحيح! Le lymphocyte T tue la cellule cible par contact.',
        },
        methodology: {
          prompt: 'حلل كيف تقصي اللمفاويات T الخلايا المصابة (تحليل محض).',
          steps: [
            {
              label: 'الملاحظة',
              placeholder: 'صف ما تفعله اللمفاوية T تجاه الخلية الهدف...',
              requiredKeywords: ['لمفاوية T', 'خلية هدف', 'تعرف'],
            },
            {
              label: 'الآلية',
              placeholder: 'اشرح كيف تتعرف اللمفاوية T على الخلية المصابة...',
              requiredKeywords: ['محدد مستضدي', 'CMH', 'تعرف نوعي'],
            },
            {
              label: 'الاستنتاج',
              placeholder: 'استنتج كيف يتم إقصاء الخلية الهدف...',
              requiredKeywords: ['إقصاء خلوي', 'استجابة خلوية', 'قتل'],
            },
          ],
        },
      },
    ],
  },
  immunity_memory_response: {
    id: 'immunity_memory_response',
    title: 'الدرس 15 : الذاكرة المناعية (Immunité 4)',
    blocks: [
      {
        type: 'HOTSPOT_AND_METHODOLOGY',
        objective: 'expliquer pourquoi la réponse secondaire est plus rapide et plus forte que la réponse primaire.',
        introText:
          'لاحظ منحنى كمية الأجسام المضادة بدلالة الزمن بعد تعرض أول وثانٍ للمستضد. حدد الاستجابة الأولية والثانوية ثم فسّر الفرق بينهما.',
        schemaSrc: '/assets/images/schemas/domaine1_proteines/schema_22_immunite_memoire.svg',
        hotspot: {
          prompt: 'انقر على الاستجابة الثانية (الاستجابة الثانوية الأقوى).',
          correctZone: { x: 70, y: 40, radius: 20 },
          successFeedback: 'صحيح! الاستجابة الثانية أسرع وأقوى بسبب خلايا الذاكرة.',
        },
        methodology: {
          prompt: 'حلل الفرق بين الاستجابة الأولية والثانوية من حيث زمن الكمون وكمية الأجسام المضادة (تحليل محض).',
          steps: [
            {
              label: 'الملاحظة',
              placeholder: 'صف ما تلاحظه في منحنى الاستجابة الأولية...',
              requiredKeywords: ['استجابة أولية', 'زمن كمون', 'أجسام مضادة'],
            },
            {
              label: 'الآلية',
              placeholder: 'اشرح كيف تعمل خلايا الذاكرة...',
              requiredKeywords: ['خلايا ذاكرة', 'تكاثر نسيلي', 'تمايز'],
            },
            {
              label: 'الاستنتاج',
              placeholder: 'استنتج لماذا الاستجابة الثانية أسرع وأقوى...',
              requiredKeywords: ['استجابة ثانوية', 'أسرع', 'أقوى', 'ذاكرة'],
            },
          ],
        },
      },
    ],
  },
  seismic_waves: {
    id: 'seismic_waves',
    title: 'الدرس 20 : الأمواج الزلزالية (Séismes & structure terrestre)',
    blocks: [
      {
        type: 'HOTSPOT_AND_METHODOLOGY',
        objective: 'expliquer comment les ondes P et S révèlent la structure de la Terre.',
        introText:
          'لاحظ مخطط انتشار الأمواج الزلزالية. حدد onde P puis onde S puis explique comportement à la discontinuité de Gutenberg.',
        schemaSrc: '/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg',
        hotspot: {
          prompt: 'انقر sur onde P (onde de compression).',
          correctZone: { x: 50, y: 50, radius: 20 },
          successFeedback: 'صحيح! Les ondes P sont des ondes de compression qui se propagent dans tous les milieux.',
        },
        methodology: {
          prompt: 'حلل كيف تكشف الأمواج الزلزالية عن بنية باطن الأرض (تحليل محض).',
          steps: [
            {
              label: 'الملاحظة',
              placeholder: 'صف سلوك الموجات P و S في القشرة والوشاح...',
              requiredKeywords: ['موجات P', 'موجات S', 'سرعة', 'وسط'],
            },
            {
              label: 'الآلية',
              placeholder: 'اشرح ماذا يحدث عند انقطاع غوتنبرغ...',
              requiredKeywords: ['اختفاء S', 'نواة خارجية', 'سائلة', 'موجات P'],
            },
            {
              label: 'الاستنتاج',
              placeholder: 'استنتج لماذا تدل هذه الظواهر على سيولة النواة الخارجية...',
              requiredKeywords: ['سائلة', 'قوى قص', 'نواة خارجية', 'استنتاج'],
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
