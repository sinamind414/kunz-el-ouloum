// activeLessons.ts
// Modèle de données du Pilier 1 : Leçon Active "Mot par Mot".
// Les leçons sont indexées par le même `lessonId` que celui utilisé dans l'app
// (ex: "lecon_transcription"), pour que le tunnel se déclenche sur une leçon réelle.

// Source de vérité officielle (lexique DZ strict) — voir kunzDatabase.ts.
import { CoreReflexId } from '../data/reflexes';
import type { ValidationContext } from '../lib/validation/ValidationEngine';
import { ActiveLesson_D1_U3_L1_Enzyme } from './kunzDatabase';
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
  supportAssetSrc?: string;
  supportAltAr?: string;
  supportCaptionAr?: string;
  supportSecondaryAssetSrc?: string;
  supportSecondaryAltAr?: string;
  supportSecondaryCaptionAr?: string;
  supportGallery?: {
    assetSrc?: string;
    altAr: string;
    captionAr?: string;
  }[];
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

export interface MissionChoiceBlock {
  type: 'MISSION_CHOICE';
  objective: string;
  heroTitle: string;
  heroText: string;
  imageSrc?: string;
  supportAssetSrc?: string;
  supportAltAr?: string;
  supportCaptionAr?: string;
  choices: {
    id: string;
    labelAr: string;
    descriptionAr: string;
    nextLessonId?: string;
    completeOnSelect?: boolean;
  }[];
}

export interface GuidedDocQaBlock {
  type: 'GUIDED_DOC_QA';
  objective: string;
  doc: {
    assetSrc?: string;
    altAr: string;
    captionAr?: string;
    secondaryAssetSrc?: string;
    secondaryAltAr?: string;
    secondaryCaptionAr?: string;
  };
  questions: {
    id: string;
    verbAr: string;
    promptAr: string;
    answerType: 'short_text';
    validationMode: 'engine' | 'keywords';
    validationCtx?: ValidationContext;
    requiredKeywords?: string[];
    /** #44 — Sous-ensemble de `requiredKeywords` dont l'ORDRE d'apparition fait la réponse (sens, chronologie). */
    orderedKeywords?: string[];
    forbiddenKeywords?: string[];
    successMessageAr?: string;
    errorHintAr?: string;
  }[];
  summaryAr: string;
}

export interface DualEvidenceBlock {
  type: 'DUAL_EVIDENCE';
  objective: string;
  docA: {
    assetSrc?: string;
    altAr: string;
    captionAr: string;
  };
  docB: {
    assetSrc?: string;
    altAr: string;
    captionAr: string;
  };
  extractionPromptAr: string;
  justificationPromptAr: string;
  extractionKeywords: string[];
  justificationKeywords: string[];
  summaryAr: string;
}

export interface HypothesisExperimentBlock {
  type: 'HYPOTHESIS_EXPERIMENT';
  objective: string;
  problemAr: string;
  experimentAssetSrc?: string;
  experimentAltAr: string;
  hypothesisPromptAr: string;
  resultPromptAr: string;
  validationPromptAr: string;
  namingPromptAr?: string;
  expectedTargets: string[];
  resultKeywords?: string[];
  validationKeywords?: string[];
  namingAccepted?: string[];
  summaryAr: string;
}

export interface ComparisonTableBlock {
  type: 'COMPARISON_TABLE';
  objective: string;
  promptAr: string;
  assetSrc?: string;
  altAr?: string;
  supportGallery?: {
    assetSrc?: string;
    altAr: string;
    captionAr?: string;
  }[];
  criteria: {
    id: string;
    labelAr: string;
    leftExpected: string[];
    rightExpected: string[];
  }[];
  conclusionPromptAr: string;
  conclusionKeywords: string[];
  summaryAr: string;
}

export interface SequenceOrderBlock {
  type: 'SEQUENCE_ORDER';
  objective: string;
  promptAr: string;
  assetSrc?: string;
  altAr?: string;
  secondaryAssetSrc?: string;
  secondaryAltAr?: string;
  secondaryCaptionAr?: string;
  supportGallery?: {
    assetSrc?: string;
    altAr: string;
    captionAr?: string;
  }[];
  steps: {
    id: string;
    labelAr: string;
    expectedOrder: number;
  }[];
  summaryPromptAr: string;
  summaryKeywords: string[];
  summaryAr: string;
}

export interface ReasoningCountBlock {
  type: 'REASONING_COUNT';
  objective: string;
  promptAr: string;
  assetSrc?: string;
  altAr?: string;
  options: {
    symbolCount: 1 | 2 | 3;
    combinations: number;
    isCorrect: boolean;
  }[];
  rationalePromptAr: string;
  rationaleKeywords: string[];
  summaryAr: string;
}

export type Block =
  | TextAndProduceBlock
  | HotspotAndMethodologyBlock
  | MissionChoiceBlock
  | GuidedDocQaBlock
  | DualEvidenceBlock
  | HypothesisExperimentBlock
  | ComparisonTableBlock
  | SequenceOrderBlock
  | ReasoningCountBlock;

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
    nextLessonId: 'd1-u1-l3-traduction',
    recommendedReflexId: 'explain',
    completionMessageAr: 'أكملت الاستنساخ. الخطوة الطبيعية الآن هي فهم الترجمة.',
  },
  'd1-u1-l1-expression-genique': {
    nextLessonId: 'd1-u1-l2-transcription',
    recommendedReflexId: 'hypothesize',
    completionMessageAr: 'أكملت بناء فكرة انتقال المعلومة الوراثية. الآن انتقل إلى آلية الاستنساخ.',
  },
  'phase11_chapitres_21_22': {
    nextLessonId: 'synapse',
    recommendedReflexId: 'interpret',
    completionMessageAr: 'أكملت التفاعلات الضوئية. الآن انتقل إلى الاتصال العصبي.',
  },
  'synapse': {
    nextLessonId: undefined,
    recommendedReflexId: 'interpret',
    completionMessageAr: 'أحسنت! فهمت تحوّل التنبيه الكهربائي إلى رسالة كيميائية ثم كهربائية.',
  },
  'subduction': {
    nextLessonId: 'seismic_waves',
    recommendedReflexId: 'interpret',
    completionMessageAr: 'أحسنت! فهمت كيف يؤدي الغوص إلى انصهار الوشاح ونشاط بركاني.',
  },
  'protein_structure_function': {
    nextLessonId: 'd1-u3-l1-enzyme',
    recommendedReflexId: 'interpret',
    completionMessageAr: 'أحسنت! فهمت كيف يحدد تتابع الأحماض الأمينية بنية البروتين ووظيفته.',
  },
  'seismic_waves': {
    nextLessonId: undefined,
    recommendedReflexId: 'interpret',
    completionMessageAr: 'أحسنت! فهمت كيف تكشف الأمواج P و S عن بنية باطن الأرض.',
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
  'd1-u1-l1-expression-genique': {
    id: 'd1-u1-l1-expression-genique',
    title: 'الوحدة 1 : التعبير المورثي ونقل المعلومة',
    blocks: [
      {
        type: 'MISSION_CHOICE',
        objective: 'الدخول إلى المجال من وضعية مشكلة حقيقية كما في الكتاب.',
        heroTitle: 'كيف يمكن لتغير في بنية بروتين أن يؤدي إلى مرض خطير؟',
        heroText: 'ننطلق من حالة البريون ومرض جنون البقر لنفهم لماذا ليست البروتينات مجرد تعريفات تُحفظ، بل جزيئات يؤدي تغير بنيتها إلى آثار خطيرة.',
        imageSrc: '/assets/images/schemas/domaine1_proteines/schema_09_intro_prion.svg',
        supportAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_09b_spongiform_histology_modern_ar.svg',
        supportAltAr: 'وثيقة دعم حديثة شبيهة بالهستولوجيا الإسفنجية المرتبطة بحالة البريون.',
        supportCaptionAr: 'دعم بصري إضافي: الحقل النسيجي يوضح أن الخلل البنيوي للبروتين قد ينعكس على النسيج العصبي.',
        choices: [
          {
            id: 'start_prion_question',
            labelAr: 'ابدأ من وضعية البريون',
            descriptionAr: 'أفهم أولاً لماذا يهمّنا البروتين قبل الدخول إلى آلية تركيبه.',
            completeOnSelect: true,
          },
        ],
      },
      {
        type: 'MISSION_CHOICE',
        objective: 'الدخول إلى الوحدة من صورة حية قريبة من كتاب المدرسة.',
        heroTitle: 'العنكبوت يصنع خيطاً دقيقاً جداً — كيف تصنع الخلية بروتيناً؟',
        heroText: 'صورة خيط العنكبوت تجعل السؤال مركزاً: كيف تستطيع الخلية تركيب بروتين مضبوط البنية والوظيفة؟',
        imageSrc: '/assets/images/schemas/domaine1_proteines/schema_10_intro_spider.svg',
        supportAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_10b_cell_animal_reference_modern_ar.svg',
        supportAltAr: 'وثيقة دعم حديثة تذكر ببنية الخلية الحيوانية ومسار المعلومة من النواة إلى الهيولى.',
        supportCaptionAr: 'تذكير بنيوي: أين توجد النواة؟ أين تعمل الريبوزومات؟',
        choices: [
          {
            id: 'start_spider_question',
            labelAr: 'ابدأ من سؤال التركيب',
            descriptionAr: 'أنتقل من المثال الحي إلى الوثائق التي تشرح التعبير المورثي.',
            completeOnSelect: true,
          },
        ],
      },
      {
        type: 'GUIDED_DOC_QA',
        objective: 'ربط المورثات بالبروتينات واستنتاج مفهوم التعبير المورثي.',
        doc: {
          assetSrc: '/assets/images/schemas/domaine1_proteines/schema_11_gene_proteins.svg',
          altAr: 'مخطط يبين مورثات على ADN وبروتينات مقابلة لها في السيتوبلازم.',
          captionAr: 'الوثيقة: مورثات مختلفة تقابلها بروتينات مختلفة.',
        },
        questions: [
          {
            id: 'observe_gene_protein',
            verbAr: 'حلل',
            promptAr: 'ماذا تلاحظ بين المورثات والبروتينات؟',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['مورثات مختلفة', 'بروتينات مختلفة'],
            successMessageAr: 'أحسنت، وصفت العلاقة المشاهدة.',
            errorHintAr: 'صف ما تراه: مورثات مختلفة ↔ بروتينات مختلفة.',
          },
          {
            id: 'relate_gene_protein',
            verbAr: 'حلل',
            promptAr: 'ما العلاقة بين المورثة 1 والبروتين 1؟',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['كل مورثة', 'بروتين محدد'],
            successMessageAr: 'ممتاز، ربطت كل مورثة بمنتوجها.',
            errorHintAr: 'حاول أن تذكر أن كل مورثة تحمل معلومات بروتين محدد.',
          },
          {
            id: 'infer_expression',
            verbAr: 'استنتج',
            promptAr: 'استنتج مفهوم التعبير المورثي.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['المعلومات الوراثية', 'تركيب بروتين'],
            successMessageAr: 'أحسنت، هذا هو معنى التعبير المورثي.',
            errorHintAr: 'اربط بين استعمال المعلومة الوراثية وظهور بروتين محدد.',
          },
        ],
        summaryAr: 'التعبير المورثي هو استعمال المعلومة الموجودة في المورثة من أجل تركيب بروتين محدد.',
      },
      {
        type: 'DUAL_EVIDENCE',
        objective: 'استخلاص مقر تركيب البروتين وتبريره انطلاقاً من وثيقتين.',
        docA: {
          assetSrc: '/assets/images/schemas/domaine1_proteines/schema_12_protein_site_photo.svg',
          altAr: 'صورة مجهرية تبين مناطق ظهور البروتينات الموسومة.',
          captionAr: 'الوثيقة 1: صورة قريبة من الوثيقة التجريبية.',
        },
        docB: {
          assetSrc: '/assets/images/schemas/domaine1_proteines/schema_13_protein_site_interpret.svg',
          altAr: 'رسم تفسيري لخلية مع مواقع ظهور البروتينات المشعة.',
          captionAr: 'الوثيقة 2: رسم تفسيري.',
        },
        extractionPromptAr: 'ما مقر تركيب البروتين داخل الخلية؟',
        justificationPromptAr: 'علل جوابك اعتماداً على الوثيقتين.',
        extractionKeywords: ['الريبوزومات'],
        justificationKeywords: ['الإشعاع', 'الوثيقتين'],
        summaryAr: 'يتم تركيب البروتين على مستوى الريبوزومات، ويثبت ذلك ظهور الوسم في هذه المناطق في الوثيقتين.',
      },
      {
        type: 'HYPOTHESIS_EXPERIMENT',
        objective: 'اقتراح فرضية تفسر انتقال المعلومة الوراثية من النواة إلى السيتوبلازم.',
        problemAr: 'كيف تنتقل المعلومة الوراثية من النواة إلى السيتوبلازم من أجل تركيب البروتين؟',
        experimentAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_14_arn_groups.svg',
        experimentAltAr: 'نتائج تجربة ثلاث مجموعات توضح أثر حقن ARN.',
        hypothesisPromptAr: 'اقترح فرضية تفسر هذا الانتقال.',
        resultPromptAr: 'حلل نتائج المجموعات الثلاث بإيجاز.',
        validationPromptAr: 'هل تؤيد النتائج فرضية وجود جزيء وسيط؟ علل.',
        expectedTargets: ['جزيء', 'وسيط', 'النواة', 'السيتوبلازم', 'تركيب البروتين'],
        resultKeywords: ['المجموعة الثالثة', 'ARN', 'هيموغلوبين'],
        validationKeywords: ['جزيء وسيط', 'ARN', 'يوجه تركيب بروتين'],
        summaryAr: 'تؤيد التجربة وجود جزيء وسيط من نوع ARN يوجّه تركيب بروتين محدد.',
      },
      {
        type: 'HYPOTHESIS_EXPERIMENT',
        objective: 'التحقق من دور ARN الرسول باستعمال اليوراسيل المشع.',
        problemAr: 'لماذا يظهر الوسم أولاً في النواة ثم لاحقاً في السيتوبلازم؟',
        experimentAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_15_uracile_tracking.svg',
        experimentAltAr: 'وثيقة تبين تموضع الوسم بعد مدة قصيرة وبعد مدة أطول.',
        hypothesisPromptAr: 'ما الفرضية التي يدعمها هذا التتبع؟',
        resultPromptAr: 'أين يظهر الوسم أولاً؟ وأين يظهر لاحقاً؟',
        validationPromptAr: 'هل تتحقق الفرضية؟ علل.',
        namingPromptAr: 'اقترح تسمية مناسبة لهذا ARN.',
        expectedTargets: ['اليوراسيل', 'النواة', 'السيتوبلازم', 'ARN'],
        resultKeywords: ['النواة', 'السيتوبلازم'],
        validationKeywords: ['ARN', 'ينتقل', 'النواة', 'السيتوبلازم'],
        namingAccepted: ['ARNm', 'ARN رسول'],
        summaryAr: 'يُصنّع ARNm في النواة ثم ينتقل إلى السيتوبلازم حاملاً نسخة من المعلومة الوراثية.',
      },
    ],
  },
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
        objective: 'تحديد مقر الاستنساخ ثم تحليل انتقال الإشعاع منهجياً.',
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
        objective: 'تحديد مقر التفاعلات الضوئية ثم تحليلها منهجياً.',
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
        objective: 'تحديد النهاية قبل المشبكية ثم تحليل تحوّل التنبيه.',
        introText:
          'لاحظ مخطط المشبك الكيميائي. حدد النهاية قبل المشبكية ثم حلل تحوّل التنبيه الكهربائي إلى رسالة كيميائية ثم كهربائية.',
        supportAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_30_ligand_gated_channel_modern_ar.svg',
        supportAltAr: 'وثيقة حديثة تبين مستقبلات وقنوات مرتبطة بالربيطة على الغشاء بعد المشبكي.',
        supportCaptionAr: 'دعم بنيوي: المستقبل بعد المشبكي يفتح قناة مرتبطة بالربيطة عند ارتباط الناقل العصبي.',
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
        objective: 'تحديد منطقة الغوص ثم تحليل دور الماء المحرر.',
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
        type: 'MISSION_CHOICE',
        objective: 'الدخول إلى الدرس من وضعية مرضية تُظهر أن تغير حمض أميني واحد قد يغيّر وظيفة البروتين.',
        heroTitle: 'كيف يمكن لتبديل حمض أميني واحد أن يغيّر شكل الخلية ووظيفتها؟',
        heroText: 'ننطلق من حالة الهيموغلوبين وفقر الدم المنجلي: تغيير صغير في البنية الأولية قد يقود إلى تغير في الطي، ثم في وظيفة البروتين، ثم في حالة الخلية كلها.',
        imageSrc: '/assets/images/schemas/domaine1_proteines/schema_40_hemoglobin_structure_function_modern.svg',
        choices: [
          {
            id: 'start_hemoglobin_case',
            labelAr: 'ابدأ من حالة الهيموغلوبين',
            descriptionAr: 'أفهم أولاً كيف تربط الوثيقة بين الطفرة والبنية والوظيفة.',
            completeOnSelect: true,
          },
        ],
      },
      {
        type: 'GUIDED_DOC_QA',
        objective: 'فهم أن الحمض الأميني هو وحدة البناء وأن تتابعه يحدد البنية الأولية ومسار الطي.',
        doc: {
          assetSrc: '/assets/images/schemas/domaine1_proteines/schema_41_alanine_representations_modern.svg',
          altAr: 'وثيقة تبين الصيغة العامة للحمض الأميني مع مثال الألانين وتمثيله داخل السلسلة.',
          captionAr: 'وحدة البناء: كل كرة في السلسلة تمثل حمضاً أمينياً له مجموعة جانبية.',
          secondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_46_folding_pathway_modern.svg',
          secondaryAltAr: 'وثيقة تبين مسار الانتقال من سلسلة خطية إلى طي محلي ثم شكل وظيفي.',
          secondaryCaptionAr: 'المسار البنيوي: تتابع خطي ⟶ طي محلي ⟶ شكل وظيفي.',
        },
        questions: [
          {
            id: 'amino_acid_unit',
            verbAr: 'حدد',
            promptAr: 'حدد ماذا تمثل الوحدة الأساسية في هذه الوثيقة، وما الذي يختلف من حمض أميني إلى آخر؟',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['حمض أميني', 'مجموعة جانبية'],
            successMessageAr: 'أحسنت، ميزت بين الهيكل العام والمجموعة الجانبية.',
            errorHintAr: 'اذكر أن الوحدة الأساسية هي الحمض الأميني وأن الاختلاف يكون في المجموعة الجانبية.',
          },
          {
            id: 'primary_structure_define',
            verbAr: 'استنتج',
            promptAr: 'استنتج معنى البنية الأولية للبروتين.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['تتابع الأحماض الأمينية', 'رابطة ببتيدية|روابط ببتيدية'],
            successMessageAr: 'ممتاز، ربطت البنية الأولية بالتتابع الخطي.',
            errorHintAr: 'اذكر أن البنية الأولية هي تتابع الأحماض الأمينية المرتبطة بروابط ببتيدية.',
          },
          {
            id: 'why_one_change_matters',
            verbAr: 'فسر',
            promptAr: 'فسّر لماذا يمكن لتغير حمض أميني واحد أن يؤثر لاحقاً في طي البروتين ووظيفته.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['حمض أميني', 'الطي', 'وظيفة'],
            successMessageAr: 'جيد، ربطت بين التغير الأولي ونتيجته الوظيفية.',
            errorHintAr: 'اربط بين تبديل حمض أميني واحد وتغير الطي ثم تغير الوظيفة.',
          },
        ],
        summaryAr: 'البنية الأولية هي تتابع الأحماض الأمينية، وأي تغير نوعي في هذا التتابع قد يغيّر لاحقاً طي البروتين ووظيفته.',
      },
      {
        type: 'COMPARISON_TABLE',
        objective: 'المقارنة بين أهم شكلين من البنى الثانوية قبل الانتقال إلى البنية الثالثية.',
        promptAr: 'قارن بين البنية الحلزونية α والبنية الصفائحية β حسب المعايير الآتية.',
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_42_secondary_alpha_beta_modern.svg',
        altAr: 'وثيقة مقارنة بين الحلزون α والصفائح β مع إبراز الروابط الهيدروجينية.',
        criteria: [
          { id: 'shape', labelAr: 'الشكل العام', leftExpected: ['حلزون', 'لولبي'], rightExpected: ['صفائح', 'مستوية'] },
          { id: 'stabilization', labelAr: 'نوع التثبيت', leftExpected: ['روابط هيدروجينية'], rightExpected: ['روابط هيدروجينية'] },
          { id: 'level', labelAr: 'المستوى البنيوي', leftExpected: ['بنية ثانوية'], rightExpected: ['بنية ثانوية'] },
        ],
        conclusionPromptAr: 'اكتب خلاصة قصيرة تشرح ما تمثله البنى الثانوية في البروتين.',
        conclusionKeywords: ['البنية الثانوية', 'روابط هيدروجينية'],
        summaryAr: 'الحلزون α والصفائح β شكلان من أشكال البنية الثانوية، ويثبتهما أساساً تشكل روابط هيدروجينية داخل السلسلة أو بينها.',
      },
      {
        type: 'GUIDED_DOC_QA',
        objective: 'ربط التآثرات الداخلية بتشكل البنية الثالثية والموقع الوظيفي للبروتين.',
        doc: {
          assetSrc: '/assets/images/schemas/domaine1_proteines/schema_43_secondary_stabilization_modern.svg',
          altAr: 'وثيقة تبين بعض التآثرات التي تثبت البنية الفراغية للبروتين.',
          captionAr: 'تآثرات متعددة تثبت الشكل النهائي للبروتين.',
          secondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg',
          secondaryAltAr: 'رسم يوضح البروتين المطوي مع موقعه النشط.',
          secondaryCaptionAr: 'النتيجة الوظيفية: يتشكل الموقع النشط من البنية الفراغية النهائية.',
        },
        questions: [
          {
            id: 'tertiary_interactions',
            verbAr: 'حدد',
            promptAr: 'حدد مثالين من التآثرات التي تساهم في تثبيت البنية الفراغية للبروتين.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['روابط هيدروجينية', 'روابط شاردية'],
            successMessageAr: 'أحسنت، ذكرت تآثرات تثبيت رئيسية.',
            errorHintAr: 'اذكر مثالين واضحين مثل الروابط الهيدروجينية والروابط الشاردية.',
          },
          {
            id: 'tertiary_stability',
            verbAr: 'فسر',
            promptAr: 'فسر كيف تسمح هذه التآثرات بتثبيت البنية الثالثية.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['تآثرات', 'تثبت', 'البنية الثالثية'],
            successMessageAr: 'جيد، ربطت التآثر بالثبات البنيوي.',
            errorHintAr: 'اذكر أن هذه التآثرات تثبت البنية الثالثية وتحافظ على الشكل الفراغي.',
          },
          {
            id: 'active_site_relation',
            verbAr: 'استنتج',
            promptAr: 'استنتج لماذا يرتبط الموقع النشط مباشرة بالبنية الثالثية ووظيفة البروتين.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['الموقع النشط', 'وظيفة', 'البنية الثالثية'],
            successMessageAr: 'ممتاز، ربطت الشكل الفراغي بالوظيفة.',
            errorHintAr: 'اربط بين تشكل الموقع النشط والبنية الثالثية ثم وظيفة البروتين.',
          },
        ],
        summaryAr: 'البنية الثالثية ليست مجرد شكل؛ فهي التي تسمح بتشكل الموقع النشط، وبالتالي تحدد طبيعة الوظيفة البيولوجية للبروتين.',
      },
      {
        type: 'SEQUENCE_ORDER',
        objective: 'ترتيب المستويات البنيوية الأربعة من الأبسط إلى الأكثر تركيباً.',
        promptAr: 'رتب مستويات بنية البروتين من التتابع الخطي إلى المعقد الكامل.',
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_45_four_levels_structure_modern.svg',
        altAr: 'وثيقة تلخص المستويات الأربعة لبنية البروتين.',
        secondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_44_quaternary_hemoglobin_tim_modern.svg',
        secondaryAltAr: 'وثيقة توضح معنى البنية الرباعية عبر مثال بروتين متعدد الوحدات.',
        secondaryCaptionAr: 'البنية الرباعية تظهر عندما تتجمع عدة سلاسل أو وحدات فرعية.',
        steps: [
          { id: 'primary', labelAr: 'تتابع خطي للأحماض الأمينية = البنية الأولية', expectedOrder: 1 },
          { id: 'secondary', labelAr: 'تشكل حلزون α أو صفائح β = البنية الثانوية', expectedOrder: 2 },
          { id: 'tertiary', labelAr: 'انطواء السلسلة إلى شكل ثلاثي الأبعاد = البنية الثالثية', expectedOrder: 3 },
          { id: 'quaternary', labelAr: 'تجمع عدة سلاسل/وحدات في معقد واحد = البنية الرباعية', expectedOrder: 4 },
        ],
        summaryPromptAr: 'اشرح بإيجاز كيف ينتقل البروتين من تتابع خطي إلى معقد وظيفي كامل.',
        summaryKeywords: ['البنية الأولية', 'البنية الثانوية', 'البنية الثالثية', 'البنية الرباعية'],
        summaryAr: 'يبنى البروتين على مستويات متتالية: أولية ثم ثانوية ثم ثالثية، وقد يصل إلى رباعية عندما تتجمع عدة وحدات في معقد وظيفي واحد.',
      },
      {
        type: 'GUIDED_DOC_QA',
        objective: 'العودة إلى حالة الهيموغلوبين لاستنتاج السلسلة السببية الكاملة: تغير في التتابع ⟶ تغير في البنية ⟶ تغير في الوظيفة.',
        doc: {
          assetSrc: '/assets/images/schemas/domaine1_proteines/schema_40_hemoglobin_structure_function_modern.svg',
          altAr: 'وثيقة تربط بين تغير تتابع الهيموغلوبين وتغير شكل كريات الدم الحمراء.',
          captionAr: 'حالة مدرسية نموذجية: تغير حمض أميني واحد قد يقود إلى مرض.',
          secondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_44_quaternary_hemoglobin_tim_modern.svg',
          secondaryAltAr: 'وثيقة داعمة لفهم أن الهيموغلوبين بروتين متعدد الوحدات.',
          secondaryCaptionAr: 'الهيموغلوبين مثال مناسب لربط البنية بالوظيفة ثم بالحالة المرضية.',
        },
        questions: [
          {
            id: 'sickle_observation',
            verbAr: 'حلل',
            promptAr: 'حلل ماذا تغير في شكل الكريات الحمراء بين الحالة العادية والحالة المرضية.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['شكل منجلي', 'كريات الدم'],
            successMessageAr: 'أحسنت، وصفت المظهر الظاهري النهائي.',
            errorHintAr: 'اذكر أن بعض كريات الدم تصبح ذات شكل منجلي في الحالة المرضية.',
          },
          {
            id: 'mutation_to_structure',
            verbAr: 'فسر',
            promptAr: 'فسر كيف يمكن لتغير حمض أميني واحد أن يغيّر بنية الهيموغلوبين.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['تغير حمض أميني واحد', 'بنية', 'الهيموغلوبين'],
            successMessageAr: 'جيد، ربطت بين الطفرة والبنية البروتينية.',
            errorHintAr: 'اربط بين تغير حمض أميني واحد وتغير بنية الهيموغلوبين.',
          },
          {
            id: 'structure_to_function_disease',
            verbAr: 'استنتج',
            promptAr: 'استنتج كيف يقود هذا التغير البنيوي إلى تغير الوظيفة ثم إلى المرض.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['وظيفة', 'مرض', 'هيموغلوبين'],
            successMessageAr: 'ممتاز، بنيت السلسلة السببية كاملة.',
            errorHintAr: 'اذكر أن تغير بنية الهيموغلوبين يغير وظيفته ويؤدي في النهاية إلى مرض.',
          },
        ],
        summaryAr: 'الوثيقة تلخص الفكرة المركزية للدرس: تغير بسيط في البنية الأولية قد يغيّر البنية الفراغية، ثم الوظيفة، ثم الحالة الخلوية والمرضية.',
      },
    ],
  },
  immunity_self_nonself: {
    id: 'immunity_self_nonself',
    title: 'الدرس 12 : الذات واللاذات (Immunité 1)',
    blocks: [
      {
        type: 'HOTSPOT_AND_METHODOLOGY',
        objective: 'فهم كيف تمثل جزيئات HLA / CMH بطاقة الهوية المناعية للخلية، وكيف يقود اختلافها إلى رفض الطعم غير المتوافق.',
        introText:
          'ابدأ من مقارنة HLA-I و HLA-II ثم من مثال الزمر الدموية وعامل Rh لتفهم أن الخلية تحمل محددات سطحية تُقرأ مناعياً. بعد ذلك حدد جزيئات HLA / CMH على الغشاء وفسر لماذا قد يرفض الجسم طعماً غير متوافق.',
        supportAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_59_blood_group_determination_modern.svg',
        supportAltAr: 'وثيقة حديثة تبين كيف تسمح المحددات السطحية بتحديد الزمرة الدموية.',
        supportCaptionAr: 'مثال مدرسي قريب: الزمرة الدموية تكشف أن الخلية تحمل علامات سطحية نوعية.',
        supportSecondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_69_rh_factor_genotype_phenotype_modern.svg',
        supportSecondaryAltAr: 'وثيقة حديثة تقارن بين Rh+ و Rh− من حيث مولد الضد D على السطح.',
        supportSecondaryCaptionAr: 'عامل Rh يضيف علامة سطحية أخرى تدخل في منطق التوافق الحيوي.',
        supportGallery: [
          {
            assetSrc: '/assets/images/schemas/domaine1_proteines/schema_55_membrane_proteins_em_modern_ar.svg',
            altAr: 'وثيقة حديثة شبيهة بالمجهر الإلكتروني تبين وجود بروتينات مدمجة داخل الغشاء البلازمي.',
            captionAr: 'رؤية مجهرية: العلامات السطحية ليست فكرة مجردة بل بروتينات مدمجة في الغشاء.',
          },
          {
            assetSrc: '/assets/images/schemas/domaine1_proteines/schema_56_fluid_mosaic_model_modern_ar.svg',
            altAr: 'وثيقة حديثة تلخص النموذج الفسيفسائي المائع للغشاء مع البروتينات السطحية.',
            captionAr: 'النموذج الغشائي يوضح أين تتموضع البروتينات والعلامات المناعية.',
          },
          {
            assetSrc: '/assets/images/schemas/domaine1_proteines/schema_57_membrane_fluidity_fusion_modern_ar.svg',
            altAr: 'وثيقة حديثة تبين أن الغشاء بنية مائعة ديناميكية تسمح بحركة البروتينات السطحية وتجمعها.',
            captionAr: 'سيولة الغشاء تساعد على فهم توزع الواسمات السطحية وتغير تجمعها.',
          },
        ],
        schemaSrc: '/assets/images/schemas/domaine1_proteines/schema_58_hla_I_II_structure_modern.svg',
        hotspot: {
          prompt: 'انقر على جزيئات HLA / CMH السطحية (بطاقة الهوية المناعية).',
          correctZone: { x: 50, y: 47, radius: 18 },
          successFeedback: 'صحيح! هذه الجزيئات السطحية تحمل هوية الخلية، واختلافها قد يثير رفض الطعم.',
        },
        methodology: {
          prompt: 'حلل كيف يميز الجهاز المناعي الذات عن اللاذات اعتماداً على جزيئات HLA / CMH ومفهوم المحددات السطحية.',
          steps: [
            {
              label: 'الملاحظة',
              placeholder: 'صف ما تحمله الخلايا على سطحها، وما الذي يختلف من فرد إلى آخر...',
              requiredKeywords: ['CMH', 'HLA', 'خلايا'],
            },
            {
              label: 'الآلية',
              placeholder: 'اشرح كيف تسمح هذه الجزيئات بالتعرف على الذات واللاذات...',
              requiredKeywords: ['تعرف مناعي', 'CMH', 'لاذات'],
            },
            {
              label: 'الاستنتاج',
              placeholder: 'استنتج لماذا يؤدي اختلاف هذه الجزيئات إلى رفض الطعم غير المتوافق...',
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
        objective: 'فهم كيف تنطلق الاستجابة الخلطية من لمفاوية B نوعية ثم تنتهي بإفراز أجسام مضادة نوعية وتشكيل معقدات مناعية.',
        introText:
          'ابدأ من مخطط يربط اللمفاوية B بالتكاثر النسيلي ثم بالخلية البلازمية. بعد ذلك استعن ببنية الجسم المضاد وبخطوط الترسب لتفهم لماذا تكون الأجسام المضادة نوعية تجاه مستضد معين.',
        supportAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_65_antibody_structure_hl_modern.svg',
        supportAltAr: 'وثيقة حديثة تبين السلاسل الثقيلة والخفيفة وموقعي الارتباط بالمستضد في الجسم المضاد.',
        supportCaptionAr: 'بنية الجسم المضاد تفسر نوعية الارتباط بالمستضد.',
        supportSecondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_67_immunodiffusion_precipitin_lines_modern.svg',
        supportSecondaryAltAr: 'وثيقة حديثة تبين خطوط الترسب في الانتشار المناعي المزدوج.',
        supportSecondaryCaptionAr: 'خطوط الترسب تُظهر أن الأجسام المضادة ترتبط نوعياً بمحددات معينة.',
        supportGallery: [
          {
            assetSrc: '/assets/images/schemas/domaine1_proteines/schema_60_complement_membrane_attack_modern.svg',
            altAr: 'وثيقة حديثة تبين تشكل معقد الهجوم الغشائي بعد تنشيط المتممة.',
            captionAr: 'نتيجة ممكنة لارتباط الأجسام المضادة: تنشيط المتممة وإحداث ثقوب غشائية.',
          },
        ],
        schemaSrc: '/assets/images/schemas/domaine1_proteines/schema_63_antigen_antibody_complex_modern.svg',
        hotspot: {
          prompt: 'انقر على اللمفاوية B (الخلية التي تتعرف أولاً على المستضد).',
          correctZone: { x: 19, y: 47, radius: 16 },
          successFeedback: 'صحيح! هنا تبدأ الاستجابة الخلطية قبل التكاثر النسيلي والتمايز إلى خلايا بلازمية.',
        },
        methodology: {
          prompt: 'حلل كيف يؤدي التعرف النوعي للمستضد إلى تكاثر اللمفاوية B وتمايزها ثم إفراز أجسام مضادة نوعية.',
          steps: [
            {
              label: 'الملاحظة',
              placeholder: 'صف ما يحدث عندما تتعرف اللمفاوية B النوعية على المستضد...',
              requiredKeywords: ['لمفاوية B', 'مستضد', 'تعرف'],
            },
            {
              label: 'الآلية',
              placeholder: 'اشرح كيف يحدث التكاثر النسيلي والتمايز إلى خلايا بلازمية...',
              requiredKeywords: ['تكاثر نسيلي', 'تمايز', 'خلية بلازمية'],
            },
            {
              label: 'الاستنتاج',
              placeholder: 'استنتج كيف تظهر الأجسام المضادة النوعية في المصل وما أثرها على المستضد...',
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
        objective: 'فهم كيف تتعرف اللمفاوية T القاتلة على الخلية الهدف نوعياً، ثم كيف تقصيها تماسياً.',
        introText:
          'ابدأ من وثيقة التعرف النوعي بين LT والخلية الهدف، ثم استعن بوثائق التكاثر النسيلي وآلية perforines / granzymes لتفهم أن الاستجابة الخلوية تقوم على التعرف أولاً ثم الإقصاء الموجه.',
        supportAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_71_clonal_cd8_activation_modern.svg',
        supportAltAr: 'وثيقة حديثة تبين التكاثر النسيلي وتميز اللمفاويات T بعد التنشيط.',
        supportCaptionAr: 'بعد التعرف النوعي تتضاعف الخلايا T الموافقة ثم تتمايز إلى خلايا فعالة.',
        supportSecondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_72_perforin_granzyme_lysis_modern.svg',
        supportSecondaryAltAr: 'وثيقة حديثة تبين إطلاق perforines و granzymes نحو الخلية الهدف.',
        supportSecondaryCaptionAr: 'آلية الإقصاء تكون تماسية وموجهة نحو الخلية الهدف بعد التعرف.',
        supportGallery: [
          {
            assetSrc: '/assets/images/schemas/domaine1_proteines/schema_74_immunological_synapse_specificity_modern.svg',
            altAr: 'وثيقة حديثة تقارن بين تماس نوعي ينجح في الإقصاء وتماس غير نوعي لا يفعل القتل.',
            captionAr: 'ليس كل تماس كافياً: النوعية شرط أساسي في الاستجابة الخلوية.',
          },
        ],
        schemaSrc: '/assets/images/schemas/domaine1_proteines/schema_70_tcr_cmh_target_modern.svg',
        hotspot: {
          prompt: 'انقر على اللمفاوية T القاتلة (الخلية الزرقاء التي تتعرف على الهدف).',
          correctZone: { x: 25, y: 51, radius: 16 },
          successFeedback: 'صحيح! هذه هي اللمفاوية T القاتلة التي تبدأ بالتعرف النوعي ثم تنفذ الإقصاء.',
        },
        methodology: {
          prompt: 'حلل كيف تقصي اللمفاويات T الخلايا المصابة اعتماداً على التعرف النوعي ثم آلية القتل التماسي.',
          steps: [
            {
              label: 'الملاحظة',
              placeholder: 'صف ما يحدث عندما تلامس اللمفاوية T الخلية الهدف وما الذي يميز هذه الحالة...',
              requiredKeywords: ['لمفاوية T', 'خلية هدف', 'تعرف'],
            },
            {
              label: 'الآلية',
              placeholder: 'اشرح كيف يرتبط التعرف النوعي بجزيئات CMH والمحدد المستضدي ثم بإطلاق آليات القتل...',
              requiredKeywords: ['محدد مستضدي', 'CMH', 'تعرف نوعي'],
            },
            {
              label: 'الاستنتاج',
              placeholder: 'استنتج كيف يتم إقصاء الخلية الهدف ولماذا تعد هذه الاستجابة خلوية نوعية...',
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
        objective: 'فهم لماذا تكون الاستجابة الثانوية أسرع وأقوى، وكيف يستغل التلقيح هذا المبدأ عبر تكوين خلايا الذاكرة.',
        introText:
          'ابدأ من منحنى يقارن بين الاستجابة الأولية والثانوية، ثم استعن بوثائق تكوين خلايا الذاكرة والجرعة التذكيرية لتفهم أن الذاكرة المناعية هي التي تختصر زمن الكمون وترفع شدة الاستجابة.',
        supportAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_76_memory_cell_fate_modern.svg',
        supportAltAr: 'وثيقة حديثة تبين تشكل خلايا ذاكرة بعد التعرض الأول للمستضد.',
        supportCaptionAr: 'في نهاية الاستجابة الأولى تبقى خلايا ذاكرة طويلة البقاء.',
        supportSecondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_77_vaccination_booster_timeline_modern.svg',
        supportSecondaryAltAr: 'وثيقة حديثة تبين أثر الجرعة التذكيرية على شدة الاستجابة المناعية.',
        supportSecondaryCaptionAr: 'التلقيح والجرعة التذكيرية يطبقان مبدأ الذاكرة المناعية عملياً.',
        supportGallery: [
          {
            assetSrc: '/assets/images/schemas/domaine1_proteines/schema_78_memory_cell_reactivation_modern.svg',
            altAr: 'وثيقة حديثة تبين إعادة تنشيط خلايا الذاكرة بسرعة عند التعرض الثاني.',
            captionAr: 'عند التعرض الثاني تُفعل خلايا الذاكرة بسرعة أكبر من الخلايا البكر.',
          },
          {
            assetSrc: '/assets/images/schemas/domaine1_proteines/schema_80_immunity_big_picture_modern.svg',
            altAr: 'وثيقة تركيبية حديثة تلخص مسار المناعة من التعرف إلى الاستجابة ثم الذاكرة.',
            captionAr: 'خريطة تركيبية نهائية: الذات واللاذات → خلطية / خلوية → ذاكرة.',
          },
        ],
        schemaSrc: '/assets/images/schemas/domaine1_proteines/schema_75_primary_secondary_response_curve_modern.svg',
        hotspot: {
          prompt: 'انقر على الاستجابة الثانوية (المنحنى الأحمر الأعلى والأسرع).',
          correctZone: { x: 69, y: 26, radius: 16 },
          successFeedback: 'صحيح! الاستجابة الثانوية ترتفع بسرعة أكبر وتبلغ ذروة أعلى بفضل خلايا الذاكرة.',
        },
        methodology: {
          prompt: 'حلل الفرق بين الاستجابة الأولية والثانوية من حيث زمن الكمون والشدة، ثم اربط ذلك بخلايا الذاكرة المناعية.',
          steps: [
            {
              label: 'الملاحظة',
              placeholder: 'صف ما تلاحظه في منحنى الاستجابة الأولية والثانوية من حيث السرعة والذروة...',
              requiredKeywords: ['استجابة أولية', 'زمن كمون', 'أجسام مضادة'],
            },
            {
              label: 'الآلية',
              placeholder: 'اشرح كيف تتكون خلايا الذاكرة وكيف يعاد تنشيطها عند التعرض الثاني...',
              requiredKeywords: ['خلايا ذاكرة', 'تكاثر نسيلي', 'تمايز'],
            },
            {
              label: 'الاستنتاج',
              placeholder: 'استنتج لماذا تكون الاستجابة الثانية أسرع وأقوى وما علاقة ذلك بالتلقيح...',
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
        objective: 'فهم كيف تكشف الأمواج P و S عن بنية باطن الأرض.',
        introText:
          'لاحظ مخطط انتشار الأمواج الزلزالية. حدد الموجة P ثم الموجة S ثم فسّر سلوكهما عند انقطاع غوتنبرغ.',
        schemaSrc: '/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg',
        hotspot: {
          prompt: 'انقر على الموجة P (موجة انضغاطية).',
          correctZone: { x: 50, y: 50, radius: 20 },
          successFeedback: 'صحيح! الموجات P انضغاطية وتنتشر في الأوساط الصلبة والسائلة.',
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
  'd1-u1-l2-transcription': {
    id: 'd1-u1-l2-transcription',
    title: 'الدرس 3 : استنساخ المعلومات الوراثية الموجودة على مستوى ADN',
    blocks: [
      {
        type: 'COMPARISON_TABLE',
        objective: 'المقارنة بين ADN و ARN حسب معايير واضحة قبل فهم آلية الاستنساخ.',
        promptAr: 'قارن بين ADN و ARN حسب المعايير الآتية.',
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_16_compare_adn_arn_modern.svg',
        altAr: 'مقارنة بصرية حديثة بين ADN و ARN من حيث السكر والقواعد وعدد السلاسل والوظيفة.',
        supportGallery: [
          {
            assetSrc: '/assets/images/schemas/domaine1_proteines/schema_16b_rna_nucleotide_assembly_modern_ar.svg',
            altAr: 'وثيقة دعم حديثة تبين تركيب النيكليوتيد الريبوزي من فوسفات وسكر ريبوز وقاعدة آزوتية.',
            captionAr: 'تفكيك بنية النيكليوتيد: فوسفات + ريبوز + قاعدة آزوتية.',
          },
          {
            assetSrc: '/assets/images/schemas/domaine1_proteines/schema_16c_arn_structure_modern_ar.svg',
            altAr: 'وثيقة دعم حديثة تبين أن ARN سلسلة واحدة تبنى في اتجاه 5 شرطة إلى 3 شرطة.',
            captionAr: 'شكل ARN نفسه: سلسلة واحدة تحمل القواعد A U G C.',
          },
          {
            assetSrc: '/assets/images/schemas/domaine1_proteines/schema_16d_rna_components_modern_ar.svg',
            altAr: 'وثيقة دعم حديثة تلخص مكونات ARN ووظيفته الأساسية في نقل المعلومة.',
            captionAr: 'لوحة كيميائية سريعة: السكر، القاعدة، عدد السلاسل، الوظيفة.',
          },
        ],
        criteria: [
          { id: 'sugar', labelAr: 'السكر', leftExpected: ['منقوص الأكسجين', 'ريبوز منقوص الأكسجين'], rightExpected: ['ريبوز'] },
          { id: 'bases', labelAr: 'القواعد الآزوتية', leftExpected: ['A', 'T', 'C', 'G', 'الثايمين'], rightExpected: ['A', 'U', 'C', 'G', 'اليوراسيل'] },
          { id: 'strands', labelAr: 'عدد السلاسل', leftExpected: ['ثنائي', 'سلسلتين'], rightExpected: ['أحادي', 'سلسلة واحدة'] },
          { id: 'role', labelAr: 'الوظيفة', leftExpected: ['يحفظ المعلومات الوراثية', 'تخزين المعلومة الوراثية'], rightExpected: ['ينقل المعلومة الوراثية', 'نسخة من المعلومة الوراثية'] },
        ],
        conclusionPromptAr: 'اكتب خلاصة قصيرة للمقارنة بين الجزيئين.',
        conclusionKeywords: ['ADN', 'ARN', 'المعلومة الوراثية'],
        summaryAr: 'ADN يخزن المعلومة الوراثية، أما ARN فيساهم في نقلها واستعمالها، مع اختلاف في السكر والقواعد والبنية.',
      },
      {
        type: 'GUIDED_DOC_QA',
        objective: 'تحليل وثيقة الاستنساخ ومنحنى المثبط لاستنتاج دور ARN بوليمراز.',
        doc: {
          assetSrc: '/assets/images/schemas/domaine1_proteines/schema_17_transcription_bubble_modern.svg',
          altAr: 'وثيقة تبين منطقة الاستنساخ وتفاصيل عمل ARN بوليمراز على ADN.',
          captionAr: 'وثيقة الاستنساخ وتحديد اتجاه تركيب ARNm.',
          secondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_18_amanitine_curve_modern.svg',
          secondaryAltAr: 'وثيقة تربط بين α-amanitine وانخفاض تشكل ARNm.',
          secondaryCaptionAr: 'وثيقة داعمة: تأثير α-amanitine على تشكل ARNm.',
        },
        questions: [
          {
            id: 'transcription_direction',
            verbAr: 'حدد',
            promptAr: 'حدد اتجاه حدوث الاستنساخ انطلاقاً من الوثيقة.',
            answerType: 'short_text',
            validationMode: 'keywords',
            // #43 — ['5','3'] acceptait la date « 2035 » et refusait la réponse
            // juste écrite en toutes lettres. On accepte les deux graphies et on
            // exige la marque du sens (de … vers …), qui est le fond de la question.
            requiredKeywords: ['5|خماسي', '3|ثلاثي', 'نحو|الى|إلى|من'],
            // #44 — Le sens EST la réponse : « من 3 نحو 5 » contient les mêmes
            // mots-clés que la réponse juste tout en énonçant l'inverse.
            orderedKeywords: ['5|خماسي', '3|ثلاثي'],
            successMessageAr: 'أحسنت، حددت اتجاه القراءة والتركيب.',
            errorHintAr: 'اذكر اتجاه قراءة السلسلة الناسخة واتجاه تركيب ARNm.',
          },
          {
            id: 'amanitine_curve',
            verbAr: 'حلل',
            promptAr: 'حلل منحنى تأثير α-amanitine على تشكل ARNm.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['انخفاض|تناقص|نقصان|قلة', 'ARNm', 'تركيز'],
            successMessageAr: 'جيد، وصفت العلاقة بين تركيز المثبط وتشكل ARNm.',
            errorHintAr: 'اذكر أن زيادة تركيز المثبط ترافقها قلة تشكل ARNm.',
          },
          {
            id: 'arn_pol_role',
            verbAr: 'استنتج',
            promptAr: 'استنتج دور ARN بوليمراز.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['ARN بوليمراز', 'ضروري', 'الاستنساخ'],
            successMessageAr: 'أحسنت، استنتجت الدور الإنزيمي الصحيح.',
            errorHintAr: 'اربط بين تثبيط α-amanitine وتعطل تشكل ARNm.',
          },
        ],
        summaryAr: 'انخفاض تشكل ARNm بوجود α-amanitine يدل على أن ARN بوليمراز إنزيم أساسي في عملية الاستنساخ.',
      },
      {
        type: 'SEQUENCE_ORDER',
        objective: 'ترتيب مراحل الاستنساخ ثم صياغتها في نص علمي مرتب.',
        promptAr: 'رتب مراحل الاستنساخ من البداية إلى النهاية.',
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_17_transcription_bubble_modern.svg',
        altAr: 'رسم يوضح تشكل ARNm انطلاقاً من ADN أثناء الاستنساخ.',
        secondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_21_multiple_transcription_modern_ar.svg',
        secondaryAltAr: 'وثيقة حديثة تبين عدة خيوط ARN في طور التشكل على نفس المورثة.',
        secondaryCaptionAr: 'صورة حدسية: يمكن أن تتشكل عدة نسخ ARN على نفس المورثة في آن واحد.',
        steps: [
          { id: 'binding', labelAr: 'تثبت ARN بوليمراز على منطقة البداية', expectedOrder: 1 },
          { id: 'opening', labelAr: 'انفتاح جزء محدود من ADN', expectedOrder: 2 },
          { id: 'templating', labelAr: 'استعمال إحدى السلسلتين قالباً', expectedOrder: 3 },
          { id: 'elongation', labelAr: 'إضافة النيكليوتيدات المكملة واستطالة ARNm', expectedOrder: 4 },
          { id: 'termination', labelAr: 'الوصول إلى منطقة النهاية وتحرر ARNm', expectedOrder: 5 },
        ],
        summaryPromptAr: 'اشرح مراحل الاستنساخ في 3 إلى 5 أسطر.',
        summaryKeywords: ['ARN بوليمراز', 'السلسلة القالب', 'تكامل', 'ARNm'],
        summaryAr: 'يبدأ الاستنساخ بتثبت الإنزيم، ثم انفتاح ADN، ثم تركيب ARNm المكمل للسلسلة القالبية إلى غاية النهاية.',
      },
      {
        type: 'SEQUENCE_ORDER',
        objective: 'فهم تحول ARNm الأولي إلى ARNm ناضج بعد انتهاء الاستنساخ.',
        promptAr: 'رتب الخطوات التي تفسر نضج ARNm بعد انتهاء الاستنساخ.',
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_20_splicing_exons_introns_modern.svg',
        altAr: 'رسم يوضح تحول ADN إلى ARNm أولي ثم ARNm ناضج.',
        secondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_19_splicing_micrograph_modern.svg',
        secondaryAltAr: 'صورة مجهرية مع تفسير بصري لظاهرة التضفير.',
        secondaryCaptionAr: 'وثيقة داعمة: صورة بالمجهر + رسم تفسيري للتضفير.',
        steps: [
          { id: 'primary', labelAr: 'يتشكل ARNm أولي بعد الاستنساخ', expectedOrder: 1 },
          { id: 'selection', labelAr: 'تُحدد الأجزاء المحتفظ بها والأجزاء التي ستُحذف', expectedOrder: 2 },
          { id: 'removal', labelAr: 'تُحذف بعض المقاطع غير المحتفظ بها', expectedOrder: 3 },
          { id: 'mature', labelAr: 'يتشكل ARNm ناضج أقصر وصالح للترجمة', expectedOrder: 4 },
        ],
        summaryPromptAr: 'فسر لماذا يكون ARNm الناضج أقصر من ARNm الأولي.',
        summaryKeywords: ['ARNm أولي', 'ARNm ناضج', 'أقصر', 'حذف'],
        summaryAr: 'ARNm الناضج أقصر لأن النسخة الأولية تخضع لعملية نضج تُحذف خلالها بعض المقاطع قبل أن تصبح صالحة للترجمة.',
      },
    ],
  },
  'd1-u1-l3-traduction': {
    id: 'd1-u1-l3-traduction',
    title: 'الدرس 4 : الترجمة',
    blocks: [
      {
        type: 'REASONING_COUNT',
        objective: 'استنتاج لماذا يجب أن تكون الشفرة الوراثية ثلاثية القواعد.',
        promptAr: 'إذا كانت اللغة النووية مكوّنة من 4 قواعد فقط بينما اللغة البروتينية تضم 20 حمضاً أمينياً، فكم قاعدة نحتاج في الرامزة الواحدة؟',
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_22_nirenberg_decode_modern.svg',
        altAr: 'تجربة توضح أن ARNm الاصطناعي متعدد U ينتج متعدد Phe، وباقي القواعد تعطي أحماضاً أخرى.',
        options: [
          { symbolCount: 1, combinations: 4, isCorrect: false },
          { symbolCount: 2, combinations: 16, isCorrect: false },
          { symbolCount: 3, combinations: 64, isCorrect: true },
        ],
        rationalePromptAr: 'علل اختيارك بالحساب: ماذا تعطي قاعدة واحدة؟ قاعدتان؟ ثلاث قواعد؟',
        rationaleKeywords: ['4', '16', '64'],
        summaryAr: 'الشفرة الوراثية ثلاثية لأن 4³ = 64 احتمالاً، وهو عدد كافٍ لتشفير 20 حمضاً أمينياً.',
      },
      {
        type: 'GUIDED_DOC_QA',
        objective: 'فهم العلاقة بين الكودون على ARNm ومضاد الكودون على ARNt داخل الريبوزوم.',
        doc: {
          assetSrc: '/assets/images/schemas/domaine1_proteines/schema_03_traduction.svg',
          altAr: 'مخطط يبين ARNm والريبوزوم و ARNt الحامل لمضاد الكودون والحمض الأميني.',
          captionAr: 'مخطط الترجمة: كودون ↔ مضاد الكودون ↔ حمض أميني.',
          secondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_23_genetic_code_table_modern.svg',
          secondaryAltAr: 'جدول الشفرة الوراثية لقراءة الرامزات وتحديد الحمض الأميني الموافق.',
          secondaryCaptionAr: 'جدول داعم لقراءة الرامزات وتحديد رموز البدء والتوقف.',
        },
        questions: [
          {
            id: 'codon_location',
            verbAr: 'حدد',
            promptAr: 'حدد أين يوجد الكودون وأين يوجد مضاد الكودون.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['الكودون', 'ARNm', 'مضاد الكودون', 'ARNt'],
            successMessageAr: 'أحسنت، ميزت بين موضع الكودون وموضع مضاد الكودون.',
            errorHintAr: 'اذكر أن الكودون على ARNm ومضاد الكودون على ARNt.',
          },
          {
            id: 'pairing_role',
            verbAr: 'فسر',
            promptAr: 'فسّر كيف يضمن هذا الاقتران اختيار الحمض الأميني الصحيح.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['تكامل', 'الحمض الأميني', 'ARNt'],
            successMessageAr: 'جيد، ربطت بين التكامل واختيار الحمض الأميني.',
            errorHintAr: 'اربط بين تكامل الكودون/مضاد الكودون وحمل ARNt لحمض أميني محدد.',
          },
          {
            id: 'start_stop',
            verbAr: 'استنتج',
            promptAr: 'استنتج دور AUG ودور رامزات التوقف.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['AUG', 'بداية', 'توقف'],
            successMessageAr: 'أحسنت، ميزت بين الانطلاق والتوقف في الترجمة.',
            errorHintAr: 'اذكر أن AUG رامزة بداية وأن UAA/UAG/UGA رامزات توقف.',
          },
        ],
        summaryAr: 'تتم ترجمة رسالة ARNm بفضل تكامل الكودون مع مضاد الكودون، حيث يوجه كل ARNt حمضاً أمينياً محدداً إلى الريبوزوم.',
      },
      {
        type: 'SEQUENCE_ORDER',
        objective: 'ترتيب خطوات الترجمة من بدء القراءة إلى تشكل السلسلة الببتيدية.',
        promptAr: 'رتب مراحل الترجمة على مستوى الريبوزوم من البداية إلى النهاية.',
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_31_translation_stages_modern_ar.svg',
        altAr: 'وثيقة حديثة تلخص مراحل الترجمة: انطلاق، استطالة، توقف.',
        secondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_32_filter_binding_experiment_modern_ar.svg',
        secondaryAltAr: 'وثيقة حديثة تبين تجربة تثبت نوعية ارتباط الرامزة مع ARNt الموافق.',
        secondaryCaptionAr: 'تجربة دعم: الزوج الصحيح كودون / مضاد كودون هو الذي يثبت نوعياً.',
        steps: [
          { id: 'start', labelAr: 'يرتبط ARNm بالريبوزوم عند AUG', expectedOrder: 1 },
          { id: 'arrival', labelAr: 'يدخل ARNt الحامل للحمض الأميني الموافق', expectedOrder: 2 },
          { id: 'pairing', labelAr: 'يتكامل مضاد الكودون مع الكودون', expectedOrder: 3 },
          { id: 'bond', labelAr: 'تتشكل رابطة ببتيدية بين الأحماض الأمينية', expectedOrder: 4 },
          { id: 'elongation', labelAr: 'تتكرر العملية فيطول السلسلة الببتيدية', expectedOrder: 5 },
          { id: 'stop', labelAr: 'تتوقف الترجمة عند رامزة توقف', expectedOrder: 6 },
        ],
        summaryPromptAr: 'اشرح في 3 إلى 5 أسطر كيف تنتقل الشفرة الوراثية إلى سلسلة ببتيدية.',
        summaryKeywords: ['الريبوزوم', 'ARNm', 'ARNt', 'رابطة ببتيدية'],
        summaryAr: 'تبدأ الترجمة عند AUG، ثم تُقرأ الكودونات تباعاً ويجلب كل ARNt حمضه الأميني الموافق، فتتشكل الروابط الببتيدية إلى غاية رامزة التوقف.',
      },
      {
        type: 'GUIDED_DOC_QA',
        objective: 'تحديد مقر الترجمة في الهيولى وفهم دور متعدد الريبوزوم في زيادة مردود التركيب.',
        doc: {
          assetSrc: '/assets/images/schemas/domaine1_proteines/schema_24_polysome_translation_modern.svg',
          altAr: 'رسم يوضح عدة ريبوزومات تترجم نفس ARNm داخل الهيولى.',
          captionAr: 'ترجمة نفس الرسالة من طرف عدة ريبوزومات.',
          secondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_33_secretory_tracking_cells_modern_ar.svg',
          secondaryAltAr: 'وثيقة حديثة تتبع البروتين داخل الخلايا من الشبكة الهيولية الخشنة إلى الغولجي ثم الحويصلات.',
          secondaryCaptionAr: 'رؤية خلوية موسعة: إنتاج كمية كبيرة من البروتين يتكامل مع التوجيه داخل الخلية.',
        },
        questions: [
          {
            id: 'translation_site',
            verbAr: 'حدد',
            promptAr: 'حدد مقر تركيب البروتين في الهيولى.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['الريبوزومات', 'الهيولى'],
            successMessageAr: 'أحسنت، حددت مقر الترجمة.',
            errorHintAr: 'اذكر أن الترجمة تتم على مستوى الريبوزومات في الهيولى.',
          },
          {
            id: 'polysome_role',
            verbAr: 'استنتج',
            promptAr: 'استنتج دور متعدد الريبوزوم.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['عدة ريبوزومات', 'نفس ARNm', 'زيادة'],
            successMessageAr: 'جيد، استنتجت كيف يرفع متعدد الريبوزوم مردود التركيب.',
            errorHintAr: 'اربط بين قراءة نفس ARNm من طرف عدة ريبوزومات وزيادة كمية البروتين المصنّع.',
          },
        ],
        summaryAr: 'وجود متعدد الريبوزوم يعني أن عدة ريبوزومات تترجم نفس ARNm في وقت واحد، مما يزيد كمية البروتين المصنّع.',
      },
      {
        type: 'GUIDED_DOC_QA',
        objective: 'تمييز مكونات الريبوزوم وبنية ARNt وربطهما بوظيفتهما في الترجمة.',
        doc: {
          assetSrc: '/assets/images/schemas/domaine1_proteines/schema_25_ribosome_arnt_structure_modern.svg',
          altAr: 'رسم يوضح الريبوزوم بموقعي A وP وبنية ARNt.',
          captionAr: 'الريبوزوم و ARNt: بنية مرتبطة مباشرة بالوظيفة.',
        },
        questions: [
          {
            id: 'ribosome_parts',
            verbAr: 'حدد',
            promptAr: 'حدد مكونات الريبوزوم الأساسية وموقعي A وP.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['تحت وحدة كبرى', 'تحت وحدة صغرى', 'A', 'P'],
            successMessageAr: 'أحسنت، ميزت بين البنية ومواقع الارتباط.',
            errorHintAr: 'اذكر تحت الوحدة الكبرى، تحت الوحدة الصغرى، وموقعي A وP.',
          },
          {
            id: 'arnt_structure_role',
            verbAr: 'استنتج',
            promptAr: 'استنتج كيف تسمح بنية ARNt بوظيفته في الترجمة.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['الحمض الأميني', 'الرامزة المضادة', 'ARNt'],
            successMessageAr: 'جيد، ربطت البنية بوظيفة النقل والتعرف.',
            errorHintAr: 'اذكر أن ARNt يحمل حمضاً أمينياً في طرف، ورامزة مضادة في الطرف الآخر.',
          },
        ],
        summaryAr: 'الريبوزوم يوفر مواقع A وP لترتيب الترجمة، بينما تسمح بنية ARNt بحمل الحمض الأميني والتعرف على الكودون الموافق.',
      },
      {
        type: 'SEQUENCE_ORDER',
        objective: 'ترتيب خطوات تنشيط الأحماض الأمينية قبل إدخالها في الترجمة.',
        promptAr: 'رتب مراحل تنشيط الحمض الأميني وربطه بـ ARNt.',
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_26_aa_activation_modern.svg',
        altAr: 'رسم يوضح تدخل الإنزيم النوعي وATP في شحن ARNt بحمضه الأميني.',
        steps: [
          { id: 'elements', labelAr: 'يجتمع حمض أميني و ARNt وإنزيم نوعي', expectedOrder: 1 },
          { id: 'energy', labelAr: 'تُستهلك طاقة ATP لتشكيل المعقد', expectedOrder: 2 },
          { id: 'binding', labelAr: 'يرتبط الحمض الأميني بـ ARNt الموافق', expectedOrder: 3 },
          { id: 'release', labelAr: 'يتحرر ARNt مشحون وجاهز للترجمة', expectedOrder: 4 },
        ],
        summaryPromptAr: 'اشرح لماذا تحتاج الترجمة إلى تنشيط الأحماض الأمينية قبل بدايتها.',
        summaryKeywords: ['ATP', 'إنزيم نوعي', 'ARNt', 'حمض أميني'],
        summaryAr: 'قبل الترجمة يجب شحن كل ARNt بحمضه الأميني المناسب بوساطة إنزيم نوعي وطاقة من ATP.',
      },
      {
        type: 'SEQUENCE_ORDER',
        objective: 'فهم مصير البروتين بعد تركيبه داخل الهيولى أو على الشبكة الهيولية الخشنة.',
        promptAr: 'رتب مسار البروتين بعد تركيبه عندما يكون موجهاً للإفراز.',
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_27_secretory_pathway_destination_modern.svg',
        altAr: 'رسم يوضح مرور البروتين عبر الشبكة الهيولية الخشنة ثم جهاز غولجي ثم الحويصلات.',
        secondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_24_secretory_pathway_pancreas_modern_ar.svg',
        secondaryAltAr: 'وثيقة حديثة شبيهة بخلايا بنكرياسية مفرزة تربط الشبكة الهيولية الخشنة وجهاز غولجي بالإفراز.',
        secondaryCaptionAr: 'مثال نسيجي: الخلايا المفرزة مثل خلايا البنكرياس تُظهر بوضوح مسار البروتين الإفرازي.',
        supportGallery: [
          {
            assetSrc: '/assets/images/schemas/domaine1_proteines/schema_34_secretory_tracking_graph_modern_ar.svg',
            altAr: 'وثيقة حديثة بيانية تبين انتقال الوسم البروتيني زمنياً من الشبكة الهيولية إلى الغولجي ثم الحويصلات.',
            captionAr: 'رؤية كمية: الإشارة ترتفع تباعاً في الشبكة ثم الغولجي ثم الحويصلات / الخارج.',
          },
        ],
        steps: [
          { id: 'rer', labelAr: 'يُركّب البروتين على الشبكة الهيولية الخشنة', expectedOrder: 1 },
          { id: 'golgi', labelAr: 'ينتقل إلى جهاز غولجي للتعديل والتغليف', expectedOrder: 2 },
          { id: 'vesicles', labelAr: 'يُعبأ داخل حويصلات', expectedOrder: 3 },
          { id: 'secretion', labelAr: 'يتجه إلى الغشاء أو يُفرز خارج الخلية', expectedOrder: 4 },
        ],
        summaryPromptAr: 'فسر بإيجاز كيف يصل البروتين إلى مكان عمله بعد تركيبه.',
        summaryKeywords: ['الشبكة الهيولية', 'جهاز غولجي', 'حويصلات', 'مكان عمله'],
        summaryAr: 'لا تنتهي وظيفة الخلية عند تركيب البروتين؛ إذ يُنقل ويُعدّل ثم يُوجّه إلى مكان عمله داخل الخلية أو خارجها.',
      },
    ],
  },
  'd1-u3-l1-enzyme': ActiveLesson_D1_U3_L1_Enzyme as ActiveLesson,
};
