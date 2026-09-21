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

export type TextAndProduceBlock =
  | {
      // Forme 1 : remplissage à trous (contenu avec [____] + micro-test intégré).
      type: 'TEXT_AND_PRODUCE';
      objective: string;
      content: string; // Contient des [____] pour les trous
      popups: Record<string, string>; // Définitions des termes cliquables
      microTest: MicroTest;
    }
  | {
      // Forme 2 : production de texte libre (aucun trou) — prompt + réponses acceptées.
      type: 'TEXT_AND_PRODUCE';
      objective: string;
      prompt: string;
      acceptedAnswers: string[];
      errorHint: string;
    };

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
    nextLessonId: 'd3-u9-l2-benioff',
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
  'd2-u6-l1-hill-ruben': {
    nextLessonId: 'd2-u6-l2-jagendorf',
    recommendedReflexId: 'hypothesize',
    completionMessageAr: 'أحسنت! أثبتت تجربتا هيل وروبن أن الأكسجين المنطلق مصدره الماء. الآن اكتشف دور الضوء الحقيقي في تركيب ATP.',
  },
  'd2-u6-l2-jagendorf': {
    nextLessonId: 'd2-u6-l3-calvin',
    recommendedReflexId: 'interpret',
    completionMessageAr: 'ممتاز! تجربة جاغندورف أثبتت أن تدرج البروتونات هو مصدر طاقة تركيب ATP. الآن تتبع مسار الكربون مع كالفن.',
  },
  'd2-u6-l3-calvin': {
    nextLessonId: 'd2-u7-l1-mitchell-racker',
    recommendedReflexId: 'explain',
    completionMessageAr: 'رائع! اكتشفت كيف يتحول ¹⁴CO₂ إلى سكريات في حلقة كالفن. الآن انتقل إلى التنفس وإثبات النظرية الكيمياؤسموزية.',
  },
  'd2-u7-l1-mitchell-racker': {
    recommendedReflexId: 'interpret',
    completionMessageAr: 'أحسنت! إعادة البناء الاصطناعي عند راكر أثبتت نظرية ميتشل: تدرج البروتونات يوحد التركيب الضوئي والتنفس الخلوي.',
  },
  'd3-u11-l1-migmatite': {
    recommendedReflexId: 'interpret',
    completionMessageAr: 'ممتاز! أثبت صخر المغماتيت التضاعف القشري الناتج عن التقلص. راجع شواهد المحيط القديم (الأفيوليت) في الدرس الموالي.',
  },
  'd3-u9-l2-benioff': {
    nextLessonId: 'seismic_waves',
    recommendedReflexId: 'interpret',
    completionMessageAr: 'ممتاز! اصطفاف بؤر الزلازل على مستوى بنيوف دليل قاطع على الغوص. الآن اكتشف كيف تكشف الموجات الزلزالية عن باطن الأرض.',
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
    title: 'الفصل 3 : استنساخ المعلومات الوراثية الموجودة على مستوى ADN',
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
    title: 'الفصل 31 : تذكير بالمكتسبات — الفصل 32 : مقر عملية التركيب الضوئي',
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
    title: 'الفصل 26 : آلية النقل المشبكي',
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
    title: 'الفصل 43 : تحديد الصفائح التكتونية — الفصل 44 : حركات الصفائح التكتونية',
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
    title: 'الفصل 8 : العلاقة بين بنية ووظيفة البروتين',
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
    title: 'الفصل 14 : الذات واللاذات',
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
    title: 'الفصل 16 : المعقد المناعي',
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
    title: 'الفصل 18 : العناصر الدفاعية في الحالة الثانية',
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
    title: 'الفصل 20 : مصدر اللمفاويات LTc',
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
    title: 'الفصل 39 : الموجات الزلزالية — الفصل 40 : التركيب الكيميائي للصخور',
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
    title: 'الفصل 3 : استنساخ المعلومات الوراثية الموجودة على مستوى ADN',
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
    title: 'الفصل 4 : الترجمة',
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

  // ===== Leçons expérimentales historiques (Pilier 1 — mot par mot) =====
  'd2-u6-l1-hill-ruben': {
    id: 'd2-u6-l1-hill-ruben',
    title: 'تجربة هيل وروبن : مصدر الأكسجين المنطلق في التركيب الضوئي',
    blocks: [
      {
        type: 'MISSION_CHOICE',
        objective: 'الدخول إلى التجربتين التاريخيتين من وضعية مشكلة: من أين يأتي الأكسجين المنطلق؟',
        heroTitle: 'هل يأتي الأكسجين المنطلق من CO₂ أم من الماء H₂O؟',
        heroText: 'حتى سنة 1937 اعتُقد أن الأكسجين المنطلق في التركيب الضوئي يأتي من تحلل ثاني أكسيد الكربون. جاءت تجربة هيل ثم تجربة روبن بالوسم المشع لتثبت العكس ببرهان تجريبي صارم.',
        imageSrc: '/assets/images/schemas/domaine2_energie/schema_89_hill_ruben_experiment_modern_ar.svg',
        choices: [
          {
            id: 'start_hill_question',
            labelAr: 'ابدأ من وضعية تجربة هيل',
            descriptionAr: 'أعِد ذكر شروط عمل الصانعة الخضراء ثم صِغ فرضياتك حول مصدر الأكسجين.',
            completeOnSelect: true,
          },
        ],
      },
      {
        type: 'HYPOTHESIS_EXPERIMENT',
        objective: 'صياغة فرضيات حول مصدر الأكسجين المنطلق والتحقق منها بتجربتي هيل وروبن.',
        problemAr: 'انطلاقا من معادلة التركيب الضوئي الكلية، ما مصدر الأكسجين المنطلق: جزيئة CO₂ أم جزيئة H₂O؟',
        experimentAssetSrc: '/assets/images/schemas/domaine2_energie/schema_89_hill_ruben_experiment_modern_ar.svg',
        experimentAltAr: 'وثيقة تجريبية: تجربة هيل بالصانعات المعزولة مع مستقبل اصطناعي، ثم وسم ¹⁸O عند روبن.',
        hypothesisPromptAr: 'اقترح فرضية أو فرضيتين توضحان مصدر الأكسجين المنطلق (من CO₂ أم من H₂O؟).',
        resultPromptAr: 'حلل النتائج: انطلاق O₂ من الصانعات المعزولة في وسط خالٍ من CO₂، ثم وسم O₂ المنطلق بـ ¹⁸O فقط حين يكون الوسم في الماء.',
        validationPromptAr: 'تحقق من الفرضيات: أي جزيء يأتي منه الأكسجين المنطلق؟ علّل اعتمادا على الوثيقتين.',
        namingPromptAr: 'سمِّ تحلل الماء تحت تأثير الضوء داخل النظام الضوئي.',
        expectedTargets: ['التحلل الضوئي للماء', 'الأكسجين', 'الماء', 'الإلكترونات'],
        resultKeywords: ['انطلاق O₂', 'بدون CO₂', 'H₂O', '¹⁸O'],
        validationKeywords: ['الماء', 'التحلل الضوئي', 'الأكسجين'],
        namingAccepted: ['التحلل الضوئي للماء', 'التحلل الضوئي'],
        summaryAr: 'تظهر تجربة هيل أن الصانعات المعزولة تنطلق O₂ في غياب CO₂، وتثبت تجربة روبن بوسم ¹⁸O أن مصدر الأكسجين المنطلق هو التحلل الضوئي لجزيئات الماء.',
      },
      {
        type: 'GUIDED_DOC_QA',
        objective: 'استثمار وثيقة التجربتين لاستخلاص دور الضوء واليخضور ومصدر الإلكترونات.',
        doc: {
          assetSrc: '/assets/images/schemas/domaine2_energie/schema_89_hill_ruben_experiment_modern_ar.svg',
          altAr: 'لوحتان تجريبيتان: تجربة هيل بالصانعات المعزولة، وتجربة روبن بمياه موسومة بـ ¹⁸O.',
          captionAr: 'الوسم يتبع الماء: الأكسجين المنطلق يأتي من H₂O لا من CO₂.',
        },
        questions: [
          {
            id: 'hill_artificial_acceptor',
            verbAr: 'حدد',
            promptAr: 'حدد دور أملاح الحديد Fe³⁺ في تجربة هيل.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['مستقبل اصطناعي', 'الإلكترونات'],
            successMessageAr: 'أحسنت: Fe³⁺ يقوم دور المستقبل الاصطناعي الذي يقبل الإلكترونات المحررة.',
            errorHintAr: 'اذكر أن Fe³⁺ يُرجَع إلى Fe²⁺ إذ يقبل الإلكترونات: هو مستقبل اصطناعي يحل محل NADP الطبيعي.',
          },
          {
            id: 'hill_no_co2',
            verbAr: 'فسّر',
            promptAr: 'فسّر لماذا يعد انطلاق O₂ في تجربة هيل دليلا على أن CO₂ ليس مصدره.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['بدون CO₂', 'الأكسجين'],
            successMessageAr: 'صحيح: انطلاق الأكسجين في غياب كلي للـ CO₂ يفيد أن CO₂ ليس مصدره.',
            errorHintAr: 'اذكر أن الوسط المعزول خالٍ تماما من CO₂ ومع ذلك ينطلق O₂.',
          },
          {
            id: 'ruben_deduction',
            verbAr: 'استنتج',
            promptAr: 'استنتج من وسم ¹⁸O عند روبن مصدر الأكسجين المنطلق.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['H₂O', 'التحلل الضوئي'],
            successMessageAr: 'ممتاز: الوسم يظهر في O₂ فقط عندما يكون في الماء، إذن المصدر هو التحلل الضوئي للماء.',
            errorHintAr: 'اذكر أن O₂ موسوم بـ ¹⁸O فقط في الوسط المحتوي على H₂¹⁸O.',
          },
        ],
        summaryAr: 'الضوء الممتص في النظام الضوئي يطرد إلكترونات اليخضور، وتعوّضها إلكترونات الماء: التحلل الضوئي للماء يوفر الإلكترونات ويحرر الأكسجين.',
      },
      {
        type: 'SEQUENCE_ORDER',
        objective: 'ترتيب أحداث المرحلة الكيميوضوئية منذ امتصاص الفوتون إلى إرجاع المستقبل النهائي.',
        promptAr: 'رتب أحداث المرحلة الكيميوضوئية منذ امتصاص الضوء إلى تشكل نواتجها.',
        assetSrc: '/assets/images/schemas/domaine2_energie/schema_89_hill_ruben_experiment_modern_ar.svg',
        altAr: 'وثيقة تجريبية تربط تحلل الماء بمرور الإلكترونات وإرجاع المستقبل.',
        steps: [
          { id: 'photon', labelAr: 'يمتص اليخضور فوتون الضوء فيتهيج ويطرد إلكترونا', expectedOrder: 1 },
          { id: 'water', labelAr: 'تحلل الماء يعوّض الإلكترون المطرود ويحرر O₂', expectedOrder: 2 },
          { id: 'chain', labelAr: 'تمر الإلكترونات في سلسلة النواقل داخل غشاء التيلاكويد', expectedOrder: 3 },
          { id: 'acceptor', labelAr: 'يُرجَع NADP إلى NADPH ويتركب ATP', expectedOrder: 4 },
        ],
        summaryPromptAr: 'اشرح بإيجاز علاقة تحلل الماء بمرور الإلكترونات في السلسلة.',
        summaryKeywords: ['الماء', 'الإلكترونات', 'التحلل الضوئي'],
        summaryAr: 'الفوتون يطرد إلكترونات اليخضور، وتعوّضها الإلكترونات الآتية من تحلل الماء الذي يحرر الأكسجين، ثم تمر الإلكترونات في السلسلة فتُرجَع NADP ويتركب ATP.',
      },
    ],
  },
  'd2-u6-l2-jagendorf': {
    id: 'd2-u6-l2-jagendorf',
    title: 'تجربة جاغندورف : تركيب ATP في الظلام وتدرج البروتونات',
    blocks: [
      {
        type: 'MISSION_CHOICE',
        objective: 'مساءلة الفكرة الشائعة القائلة إن الضوء يتركب ATP مباشرة داخل الصانعة.',
        heroTitle: 'هل يتركب ATP في الصانعة بفعل الضوء مباشرة؟',
        heroText: 'جرت العادة على القول إن الضوء يصنع ATP في التركيب الضوئي. جاءت تجربة جاغندورف سنة 1966 لتوضح الدور الحقيقي للضوء: لا يتركب ATP إلا بفضل فرق تدرج البروتونات H⁺.',
        imageSrc: '/assets/images/schemas/domaine2_energie/schema_90_jagendorf_acid_bath_modern_ar.svg',
        choices: [
          {
            id: 'start_jagendorf',
            labelAr: 'اكتشف بروتوكول جاغندورف',
            descriptionAr: 'انظر ماذا يحدث عندما نحاكي تدرج H⁺ صناعيا في الظلام.',
            completeOnSelect: true,
          },
        ],
      },
      {
        type: 'TEXT_AND_PRODUCE',
        objective: 'تحديد مسار البروتونات في المرحلة الكيميوضوئية قبل تفسير التجربة.',
        content: 'أثناء المرحلة الكيميوضوئية تُضخ شوارد H⁺ من الحشوة إلى تجويف [____] داخل غشاء [____]، فيتكون تدرج في التركيز، ثم تعود H⁺ نحو الحشوة عبر [____] التي تقوم بدور تركيب ATP.',
        popups: {
          'الكييس': 'تجويف الكييس: الفضاء الداخلي للثيلاكويد حيث يتجمع البروتون H⁺.',
          'التيلاكويد': 'كيس غشائي داخل الصانعة الخضراء تحدث فيه تفاعلات المرحلة الكيميوضوئية.',
          'الكرية المذنبة': 'معقد إنزيمي (ATP-synthase) يسمح بعودة H⁺ وتركيب ATP.',
        },
        microTest: {
          prompt: 'أكمل: تعود H⁺ عبر ______ المذنبة لتركيب ATP.',
          acceptedAnswers: ['الكرية المذنبة', 'الكرية'],
          errorHint: 'الجواب: الكرية المذنبة (ATP-synthase).',
        },
      },
      {
        type: 'HYPOTHESIS_EXPERIMENT',
        objective: 'التحقق من دور تدرج البروتونات في تركيب ATP عبر تجربة جاغندورف.',
        problemAr: 'ما الدور الحقيقي للضوء في تركيب ATP في الصانعة: تركيب مباشر أم تكوين تدرج H⁺؟',
        experimentAssetSrc: '/assets/images/schemas/domaine2_energie/schema_90_jagendorf_acid_bath_modern_ar.svg',
        experimentAltAr: 'بروتوكول جاغندورف: كييسات في الظلام عند pH = 4 ثم نقلها إلى pH = 8 مع ADP وPi في الظلام.',
        hypothesisPromptAr: 'اقترح فرضية: إذا كان تدرج H⁺ هو مصدر الطاقة لتركيب ATP، فماذا تتوقع في الظلام عند خلق فرق pH صناعي؟',
        resultPromptAr: 'حلل النتيجة: تكوّن ATP في الظلام بعد خلق فرق تدرج خارجي.',
        validationPromptAr: 'تحقق من الفرضية وعلل: لماذا لا يتركب ATP بدون فرق تدرج البروتونات؟',
        namingPromptAr: 'سمِّ النظرية التي تفسر تركيب ATP عبر تدرج البروتونات.',
        expectedTargets: ['تدرج البروتونات', 'ATP', 'الكرية المذنبة'],
        resultKeywords: ['ATP', 'الظلام', 'فرق pH', 'تدرج'],
        validationKeywords: ['تدرج البروتونات', 'الكرية المذنبة', 'ATP'],
        namingAccepted: ['النظرية الكيمياؤسموزية', 'نظرية ميتشل', 'الكيمياؤسموزية'],
        summaryAr: 'تكوّن ATP في الظلام عند فرق pH صناعي يثبت أن تدرج البروتونات هو مصدر الطاقة، وأن دور الضوء هو تكوين هذا التدرج داخل التيلاكويد.',
      },
      {
        type: 'SEQUENCE_ORDER',
        objective: 'ترتيب مراحل تجربة جاغندورف التي أثبتت تركيب ATP في الظلام.',
        promptAr: 'رتب مراحل تجربة جاغندورف منذ تحضير الكييسات إلى ظهور ATP.',
        assetSrc: '/assets/images/schemas/domaine2_energie/schema_90_jagendorf_acid_bath_modern_ar.svg',
        altAr: 'أربع مراحل لتجربة جاغندورف في الظلام: pH 4 ثم pH 8 مع ADP وPi ثم تركيب ATP.',
        steps: [
          { id: 'step1', labelAr: 'وضع الكييسات في الظلام في محلول pH = 4', expectedOrder: 1 },
          { id: 'step2', labelAr: 'نقل الكييسات إلى محلول pH = 8 يحتوي ADP و Pi', expectedOrder: 2 },
          { id: 'step3', labelAr: 'عودة H⁺ من التجويف إلى الوسط عبر الكرية المذنبة', expectedOrder: 3 },
          { id: 'step4', labelAr: 'تكوّن ATP في الظلام بلا ضوء', expectedOrder: 4 },
        ],
        summaryPromptAr: 'اشرح لماذا تدل تجربة جاغندورف على كفاية التدرج البروتوني.',
        summaryKeywords: ['الظلام', 'تدرج', 'ATP'],
        summaryAr: 'تحقق تركيب ATP في الظلام بمجرد خلق فرق تدرج H⁺ صناعي: التدرج هو مصدر الطاقة وليس الضوء مباشرة.',
      },
    ],
  },
  'd2-u6-l3-calvin': {
    id: 'd2-u6-l3-calvin',
    title: 'تجربة كالفن : تتبع ¹⁴CO₂ وكشف حلقة كالفن',
    blocks: [
      {
        type: 'MISSION_CHOICE',
        objective: 'الدخول إلى تجربة كالفن من سؤال مصير CO₂ الممتص.',
        heroTitle: 'ما مصير ثاني أكسيد الكربون الممتص في الصانعة الخضراء؟',
        heroText: 'نواتج المرحلة الكيميوضوئية (ATP و NADPH) تُوظف في المرحلة الكيميوحيوية لصنع مركبات عضوية. لكشف المسار استعمل كالفن الكربون الموسوم ¹⁴CO₂ مع كروماتوغرافيا ثنائية الأبعاد وتصوير إشعاعي ذاتي.',
        imageSrc: '/assets/images/schemas/domaine2_energie/schema_91_calvin_2d_chromatography_modern_ar.svg',
        choices: [
          {
            id: 'start_calvin',
            labelAr: 'تتبع الكربون في الزمن',
            descriptionAr: 'خذ عينات عند 5 و30 و60 ثانية وراقب المركبات الموسومة.',
            completeOnSelect: true,
          },
        ],
      },
      {
        type: 'GUIDED_DOC_QA',
        objective: 'استثمار نتائج الكروماتوغرافيا ثنائية الأبعاد لتحديد أول مركب مثبت للكربون.',
        doc: {
          assetSrc: '/assets/images/schemas/domaine2_energie/schema_91_calvin_2d_chromatography_modern_ar.svg',
          altAr: 'تركيب تجريبي (مصاصة) ولوحات كروماتوغرافية عند 5 و30 و60 ثانية.',
          captionAr: 'الوسم يظهر أولا في 3-PGA ثم يتوسع إلى تريوزات فوسفاتية ثم سكريات.',
        },
        questions: [
          {
            id: 'first_compound',
            verbAr: 'حدد',
            promptAr: 'حدد أول مركب عضوي موسوم بعد 5 ثوان من التثبيت.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['حمض فوسفوغليسريك', '3-PGA'],
            successMessageAr: 'أحسنت: أول مركب موسوم هو حمض فوسفوغليسريك (3-PGA).',
            errorHintAr: 'اذكر حمض فوسفوغليسريك (3-PGA) الذي يظهر وحده على اللوحة عند 5 ثوان.',
          },
          {
            id: 'methanol_role',
            verbAr: 'فسّر',
            promptAr: 'فسّر سبب استعمال الميثانول المغلي لإيقاف العينة.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['إيقاف', 'التفاعلات'],
            successMessageAr: 'صحيح: الميثانول المغلي يوقف التفاعلات فورا فيتثبت الوضع الحالي للمركبات.',
            errorHintAr: 'اذكر أن الميثانول المغلي يوقف التفاعلات لحظيا ليحفظ المركبات المتشكلة في اللحظة المأخوذة.',
          },
          {
            id: 'cycle_deduction',
            verbAr: 'استنتج',
            promptAr: 'استنتج من تدرج ظهور الوسم طبيعة مسار تثبيت الكربون.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['حلقة', 'تجديد', 'المستقبل'],
            successMessageAr: 'ممتاز: الظهور التدريجي يفيد مسارا حلقيا مع تجديد مستقبل CO₂.',
            errorHintAr: 'اذكر أن المسار حلقي: تثبيت ثم اختزال ثم تجديد المستقبل الذي يعاد توظيفه.',
          },
        ],
        summaryAr: 'كشف كالفن أول مركب مثبت (3-PGA) وتدرج الوسم في التريوزات ثم السكريات: تثبيت الكربون يدور في حلقة تجدد فيها المستقبل.',
      },
      {
        type: 'SEQUENCE_ORDER',
        objective: 'ترتيب خطوات حلقة كالفن كما كشفتها تجربة كالفن.',
        promptAr: 'رتب خطوات حلقة كالفن من تثبيت CO₂ إلى بناء السكريات.',
        assetSrc: '/assets/images/schemas/domaine2_energie/schema_91_calvin_2d_chromatography_modern_ar.svg',
        altAr: 'لوحات كروماتوغرافية ومسار حلقة كالفن.',
        steps: [
          { id: 'fix', labelAr: 'تثبيت CO₂ على مركب 5 كربون (RuBP) بوساطة إنزيم Rubisco', expectedOrder: 1 },
          { id: 'pga', labelAr: 'تشكل 3-PGA (حمض فوسفوغليسريك)', expectedOrder: 2 },
          { id: 'red', labelAr: 'اختزال 3-PGA إلى APG (تريوزات فوسفاتية) بوساطة ATP و NADPH', expectedOrder: 3 },
          { id: 'regen', labelAr: 'تجديد RuBP وبناء جزيئات عضوية (غلوكوز)', expectedOrder: 4 },
        ],
        summaryPromptAr: 'اشرح دور نواتج المرحلة الكيميوضوئية في الحلقة.',
        summaryKeywords: ['ATP', 'NADPH', 'الاختزال'],
        summaryAr: 'تزود المرحلة الكيميوضوئية الحلقة بـ ATP للطاقة و NADPH لقدرة الإرجاع: تثبيت ثم اختزال ثم تجديد المستقبل.',
      },
      {
        type: 'TEXT_AND_PRODUCE',
        objective: 'حفظ الحصيلة الطاقوية للحلقة الكالفنية.',
        content: 'لكل 3 جزيئات CO₂ مثبتة في حلقة كالفن، تستهلك الخلية [____] جزيئات ATP و [____] جزيئات NADPH لتكوين جزيء APG (تريوز فوسفاتي) واحد قابل لبناء الجزيئات العضوية.',
        popups: {
          'APG': 'غليسيرين ألدهيد 3 فوسفات: تريوز فوسفاتية ناتجة عن اختزال 3-PGA، تبنى منها السكريات وتجدد منها RuBP.',
        },
        microTest: {
          prompt: 'أكمل: 3 CO₂ تحتاج 9 ATP و ______ NADPH.',
          acceptedAnswers: ['6', 'ستة'],
          errorHint: 'الجواب: 6 جزيئات NADPH (مضاعفة 9 ATP / 6 NADPH لكل 3 CO₂).',
        },
      },
    ],
  },
  'd2-u7-l1-mitchell-racker': {
    id: 'd2-u7-l1-mitchell-racker',
    title: 'تجربة راكر : إثبات النظرية الكيمياؤسموزية لميتشل',
    blocks: [
      {
        type: 'MISSION_CHOICE',
        objective: 'الدخول إلى إعادة البناء الاصطناعي عند راكر من سؤال آلية التحويل.',
        heroTitle: 'ما الذي يحوِّل تدرج H⁺ إلى ATP داخل الكرية المذنبة؟',
        heroText: 'بعد اكتشاف تدرج البروتونات في الميتوكندرون والصانعة، ظلت آلية تحويله إلى ATP لغزا. أعاد راكر سنة 1974 بناء النظام اصطناعيا: مضخة بروتونات تعمل بالضوء (بكتيريورودوبسين) + كرية مذنبة = ATP. برهان قاطع على نظرية ميتشل.',
        imageSrc: '/assets/images/schemas/domaine2_energie/schema_92_racker_bacteriorhodopsin_modern_ar.svg',
        choices: [
          {
            id: 'start_racker',
            labelAr: 'ابنِ الحويصلة مع راكر',
            descriptionAr: 'ضَع بروتينين فقط في غشاء اصطناعي وراقب ما يحدث مع الضوء.',
            completeOnSelect: true,
          },
        ],
      },
      {
        type: 'GUIDED_DOC_QA',
        objective: 'استثمار وثيقة إعادة البناء الاصطناعي لاستخلاص البرهان على النظرية الكيمياؤسموزية.',
        doc: {
          assetSrc: '/assets/images/schemas/domaine2_energie/schema_92_racker_bacteriorhodopsin_modern_ar.svg',
          altAr: 'حويصلة غشائية تحمل بروتين بكتيريورودوبسين مضخة H⁺ وكرية مذنبة، مع شواهد الضوء والظلام.',
          captionAr: 'بروتينان فقط: مضخة H⁺ بالضوء + كرية مذنبة = تركيب ATP.',
        },
        questions: [
          {
            id: 'racker_pump_source',
            verbAr: 'حدد',
            promptAr: 'حدد مصدر تشكل تدرج H⁺ في تجربة راكر.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['البكتيريورودوبسين', 'الضوء'],
            successMessageAr: 'أحسنت: البكتيريورودوبسين مضخة H⁺ تحركها طاقة الضوء (مستخلصة من البكتيريا Halobacterium).',
            errorHintAr: 'اذكر البكتيريورودوبسين: بروتين مضخة H⁺ تعمل بفعل الضوء دون أي سلسلة تنفسية.',
          },
          {
            id: 'racker_light_role',
            verbAr: 'فسّر',
            promptAr: 'فسّر دور الضوء في هذه التجربة.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['ضخ', 'H⁺', 'تدرج'],
            successMessageAr: 'صحيح: الضوء لا يتركب ATP مباشرة بل يحرك مضخة البروتونات فيتكون التدرج.',
            errorHintAr: 'اذكر أن الضوء يضخ H⁺ داخل الحويصلة فيتكون تدرج البروتونات.',
          },
          {
            id: 'racker_deduction',
            verbAr: 'استنتج',
            promptAr: 'استنتج البرهان الذي تقدمه هذه التجربة لنظرية ميتشل.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['تدرج البروتونات', 'الكرية المذنبة', 'ATP'],
            successMessageAr: 'ممتاز: تدرج H⁺ وحده كاف لتركيب ATP عبر الكرية المذنبة: النظرية صحيحة.',
            errorHintAr: 'اذكر أن عودة H⁺ عبر الكرية المذنبة تتركب ATP في غياب كل شيء آخر.',
          },
        ],
        summaryAr: 'إعادة البناء الاصطناعي عند راكر برهنت أن تدرج البروتونات وحده، مع الكرية المذنبة، كاف لتركيب ATP: إذ صححت النظرية الكيمياؤسموزية لميتشل (نوبل 1978).',
      },
      {
        type: 'SEQUENCE_ORDER',
        objective: 'ترتيب خطوات تجربة راكر من تركيب الحويصلة إلى إنتاج ATP.',
        promptAr: 'رتب خطوات تجربة راكر.',
        assetSrc: '/assets/images/schemas/domaine2_energie/schema_92_racker_bacteriorhodopsin_modern_ar.svg',
        altAr: 'ترتيب خطوات إعادة البناء الاصطناعي.',
        steps: [
          { id: 's1', labelAr: 'عزل بروتين البكتيريورودوبسين من البكتيريا وإدخاله في حويصلة غشائية', expectedOrder: 1 },
          { id: 's2', labelAr: 'إضافة الكرية المذنبة (ATP-synthase) إلى الغشاء الاصطناعي', expectedOrder: 2 },
          { id: 's3', labelAr: 'إضاءة الحويصلات: ضخ H⁺ إلى الداخل وتكوين التدرج', expectedOrder: 3 },
          { id: 's4', labelAr: 'تركيب ATP خارج الحويصلة بفضل عودة H⁺ عبر الكرية المذنبة', expectedOrder: 4 },
        ],
        summaryPromptAr: 'اشرح لماذا تدل التجربة على صحة النظرية الكيمياؤسموزية.',
        summaryKeywords: ['تدرج', 'ATP', 'الكرية المذنبة'],
        summaryAr: 'بغياب كل مكونات السلسلة التنفسية، يكفي تدرج H⁺ مع الكرية المذنبة لتركيب ATP: دليل أن التدرج هو الوسيط الطاقوي الوحيد.',
      },
      {
        type: 'TEXT_AND_PRODUCE',
        objective: 'ربط التحويلات الطاقوية في التركيب الضوئي والتنفس الخلوي بمفهوم التدرج البروتوني.',
        content: 'التفسير الكيمياؤسموزي يوحد بين التركيب الضوئي والتنفس الخلوي: في الصانعة تُضخ H⁺ داخل تجويف [____]، وفي الميتوكوندريون تُضخ H⁺ في المسافة [____]، وفي الحالتين تعود H⁺ عبر [____] لتركيب ATP.',
        popups: {
          'التيلاكويد': 'الغشاء الداخلي للكييس في الصانعة الخضراء: مقر ضخ H⁺ في التركيب الضوئي.',
          'بين الغشاءين': 'الفضاء بين الغشاء الداخلي والخارجي في الميتوكوندريون: مقر تراكم H⁺ في التنفس الخلوي.',
          'الكرية المذنبة': 'ATP-synthase: الإنزيم الذي يحول طاقة التدرج البروتوني إلى طاقة كيميائية في ATP.',
        },
        microTest: {
          prompt: 'أكمل: يعود H⁺ عبر ______ لتركيب ATP في الصانعة والميتوكندريون معا.',
          acceptedAnswers: ['الكرية المذنبة', 'الكرية', 'ATP-synthase'],
          errorHint: 'الجواب: الكرية المذنبة (ATP-synthase) في كلتا الحالتين.',
        },
      },
    ],
  },
  'd3-u9-l2-benioff': {
    id: 'd3-u9-l2-benioff',
    title: 'مستوى بنيوف : توزع بؤر الزلازل دليل على الغوص',
    blocks: [
      {
        type: 'MISSION_CHOICE',
        objective: 'الدخول إلى تحليل بنيوف من سؤال الشاهد الجيوفيزيائي على الغوص.',
        heroTitle: 'كيف نثبت أن الصفيحة المحيطية تغوص فعلا داخل البرنس؟',
        heroText: 'لا يمكن ملاحظة الغوص مباشرة في عمق الأرض. لكن أعاد واداتي ثم بنيوف ترصيد بؤر الزلازل في مناطق الاندساس: اصطففت على مستوى مائل من الخندق حتى عمق 700 كلم. هذا الاصطفاف هو بصمة الغوص.',
        imageSrc: '/assets/images/schemas/domaine3_tectonique/schema_93_benioff_plan_modern_ar.svg',
        choices: [
          {
            id: 'start_benioff',
            labelAr: 'حلل توزع بؤر الزلازل',
            descriptionAr: 'لاحظ كيف تتعمق البؤر كلما ابتعدنا عن الخندق نحو القارة.',
            completeOnSelect: true,
          },
        ],
      },
      {
        type: 'GUIDED_DOC_QA',
        objective: 'استثمار وثيقة توزع البؤر الزلزالية لاستخلاص دليل الغوص.',
        doc: {
          assetSrc: '/assets/images/schemas/domaine3_tectonique/schema_93_benioff_plan_modern_ar.svg',
          altAr: 'مقطع في منطقة غوص يبين الخندق والصفيحة الغائصة واصطفاف البؤر الزلزالية على مستوى مائل.',
          captionAr: 'بؤر الزلازل ترسم مستوى مائلا من الخندق حتى 700 كلم: مستوى بنيوف.',
        },
        questions: [
          {
            id: 'foci_distribution',
            verbAr: 'حدد',
            promptAr: 'حدد كيف تتوزع بؤر الزلازل في منطقة الغوص.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['سطحية', 'الخندق', 'عميقة'],
            successMessageAr: 'أحسنت: البؤر سطحية عند الخندق وتتعمق تدريجيا نحو القارة.',
            errorHintAr: 'اذكر أن البؤر سطحية قرب الخندق ثم تتعمق كلما ابتعدنا نحو القارة.',
          },
          {
            id: 'deep_earthquakes',
            verbAr: 'فسّر',
            promptAr: 'فسّر وجود زلازل على عمق 300 و500 و700 كلم.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['صفيحة صلبة', 'برنس', 'تنكسر'],
            successMessageAr: 'صحيح: وجود بؤر عميقة يثبت أن مادة صلبة وباردة تغوص وتنكسر داخل البرنس المطاطي.',
            errorHintAr: 'اذكر أن الاستينوسفير المطاطي لا يولد زلازل، إذن البؤر العميقة تعود إلى صفيحة صلبة غائصة تنكسر.',
          },
          {
            id: 'benioff_deduction',
            verbAr: 'استنتج',
            promptAr: 'استنتج ما يدل عليه اصطفاف البؤر على مستوى مائل.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['مستوى بنيوف', 'الغوص', 'الصفيحة'],
            successMessageAr: 'ممتاز: مستوى بنيوف هو مسار الصفيحة المحيطية الغائصة داخل البرنس.',
            errorHintAr: 'اذكر أن اصطفاف البؤر على مستوى مائل يرسم مسار غوص الصفيحة المحيطية.',
          },
        ],
        summaryAr: 'اصطفاف بؤر الزلازل على مستوى مائل (مستوى بنيوف) من الخندق حتى 700 كلم هو الدليل الجيوفيزيائي القاطع على غوص الصفيحة المحيطية الصلبة الباردة داخل البرنس.',
      },
      {
        type: 'SEQUENCE_ORDER',
        objective: 'ترتيب الشواهد الجيوفيزيائية من السطح إلى العمق في منطقة الغوص.',
        promptAr: 'رتب الشواهد المرصودة في منطقة الغوص من الأقرب إلى الأبعد عن الخندق.',
        assetSrc: '/assets/images/schemas/domaine3_tectonique/schema_93_benioff_plan_modern_ar.svg',
        altAr: 'مقطع يبين الخندق ثم بؤر الزلازل العميقة ثم البركان الأنديزي.',
        steps: [
          { id: 'trench', labelAr: 'خندق محيطي عميق عند حدود التقاء الصفيحتين', expectedOrder: 1 },
          { id: 'shallow', labelAr: 'زلازل سطحية قرب الخندق (< 70 كلم)', expectedOrder: 2 },
          { id: 'deep', labelAr: 'زلازل عميقة جدا على مستوى مائل (حتى 700 كلم)', expectedOrder: 3 },
          { id: 'volcano', labelAr: 'بركان أنديزي على الصفيحة الطافية بعد أن يتحرر الماء', expectedOrder: 4 },
        ],
        summaryPromptAr: 'اشرح علاقة عمق الزلازل بمسافة الخندق.',
        summaryKeywords: ['العمق', 'الخندق', 'الغوص'],
        summaryAr: 'كلما ابتعدنا عن الخندق اتجهنا نحو القارة ازداد عمق البؤر الزلزالية: ذلك يرسم مسار الغوص المائل للصفيحة المحيطية.',
      },
      {
        type: 'TEXT_AND_PRODUCE',
        objective: 'ربط مستوى بنيوف بالانصهار المائي والنشاط البركاني على الصفيحة الطافية.',
        content: 'الصفيحة الغائصة تحمل معها ماء التحولات، وعند عمق معين يتحرر الماء فيُميّه بيريدوتيت [____] للصفيحة الطافية فيخفض درجة انصهاره، فينشأ انصهار جزئي وتصعد ماغما أنديزيتية فتتشكل [____] على الصفيحة الطافية.',
        popups: {
          'البرنس': 'الجزء الصخري الدافئ أسفل القشرة: مصدر الانصهار الجزئي المائي في مناطق الغوص.',
          'البراكين': 'قوس بركاني (كالأنديز أو اليابان) ينشأ فوق منطقة الغوص بفعل الماغما الأنديزيتية اللزجة.',
        },
        microTest: {
          prompt: 'أكمل: يخفض الماء درجة انصهار بيريدوتيت ______ فيحدث انصهار جزئي.',
          acceptedAnswers: ['البرنس', 'الستار', 'المعطف'],
          errorHint: 'الجواب: بيريدوتيت البرنس (المعطف) للصفيحة الطافية.',
        },
      },
    ],
  },
  'd3-u11-l1-migmatite': {
    id: 'd3-u11-l1-migmatite',
    title: 'الدرس 7 : شواهد التقلص — التضاعف القشري وصخر المغماتيت',
    blocks: [
      {
        type: 'MISSION_CHOICE',
        objective: 'الدخول إلى شواهد التقلص من سؤال دليل التضاعف القشري.',
        heroTitle: 'كيف نثبت أن القشرة تزداد سمكا عند التصادم القاري؟',
        heroText: 'يؤدي التصادم القاري إلى تقلص أفقي. لكن كيف نحصل على دليل صخري على أن الليتوسفير صار أسمك؟ الجواب موجود في صخر المغماتيت : صخر متحول لا يتشكل إلا في أعماق القشرة المتضاعفة.',
        imageSrc: '/assets/images/schemas/domaine3_tectonique/schema_94_migmatite_crustal_thickening_modern_ar.svg',
        choices: [
          {
            id: 'start_migmatite',
            labelAr: 'ابدأ من الصخر الشاهد',
            descriptionAr: 'اقرأ الوثيقة البتروغرافية واستخرج معادن المغماتيت.',
            completeOnSelect: true,
          },
        ],
      },
      {
        type: 'GUIDED_DOC_QA',
        objective: 'استثمار وثيقة المغماتيت والتضاعف القشري لاستخلاص شواهد التقلص.',
        doc: {
          assetSrc: '/assets/images/schemas/domaine3_tectonique/schema_94_migmatite_crustal_thickening_modern_ar.svg',
          altAr: 'لوحة تربط التصادم القاري بالتضاعف القشري، مع شريحة المغماتيت ومعادنه المميزة.',
          captionAr: 'المغماتيت : تناوب كوارتز-غرونا-ميكا-بلاجيوكلاز مع صفوف أومفيبوليت.',
        },
        questions: [
          {
            id: 'deformation_type',
            verbAr: 'حدّد',
            promptAr: 'حدّد نوع التركيب الجيولوجي الناشئ المميز لمنطقة التصادم.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['طية', 'فالق عكسي', 'تضاعف قشري'],
            successMessageAr: 'أحسنت: الطيات والفوالق العكسية والصخور المغتربة هي تراكيب مناطق التصادم.',
            errorHintAr: 'اذكر الطيات والفوالق العكسية والصخور المغتربة التي تنشأ بفعل قوى الانضغاط.',
          },
          {
            id: 'migmatite_minerals',
            verbAr: 'صف',
            promptAr: 'صف كيفية توضع المعادن المكونة لصخر المغماتيت.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['تناوب', 'غرونا', 'ميكا'],
            successMessageAr: 'جيد: معادن المغماتيت متوضعة في صفوف متناوبة (كوارتز-غرونا-ميكا-بلاجيوكلاز) مع صفوف أومفيبوليت.',
            errorHintAr: 'اذكر التناوب بين صفوف المعادن : الغرونا والميكا والكوارتز والبلاجيوكلاز.',
          },
          {
            id: 'crustal_thickening_evidence',
            verbAr: 'استنتج',
            promptAr: 'استنتج لماذا يعد المغماتيت شاهد ودليلا على التضاعف القشري.',
            answerType: 'short_text',
            validationMode: 'keywords',
            requiredKeywords: ['انصهار جزئي', 'الغرانيت', 'السمك'],
            successMessageAr: 'ممتاز: المغماتيت ناتج عن انصهار جزئي لغرانيت القشرة العميقة بفعل ارتفاع الحرارة والضغط ⟶ دليل زيادة سمك الليتوسفير.',
            errorHintAr: 'اربط المغماتيت بالانصهار الجزئي لغرانيت القشرة العميقة الذي لا يحدث إلا في سمك قشري متزايد.',
          },
        ],
        summaryAr: 'يدل صخر المغماتيت على التضاعف القشري وزيادة سمك الليتوسفير : فهو ينتج عن تحول الصخور العميقة وانصهار جزئي لغرانيت القشرة القارية بفعل ارتفاع الحرارة والضغط.',
      },
      {
        type: 'SEQUENCE_ORDER',
        objective: 'ترتيب مراحل تشكل صخر المغماتيت : التقلص ⇐ التضاعف القشري ⇐ التحول ⇐ الانصهار الجزئي.',
        promptAr: 'رتّب مراحل تشكل صخر المغماتيت من التصادم القاري حتى الصخر الشاهد.',
        assetSrc: '/assets/images/schemas/domaine3_tectonique/schema_94_migmatite_crustal_thickening_modern_ar.svg',
        altAr: 'لوحة التضاعف القشري والمغماتيت.',
        steps: [
          { id: 'collision', labelAr: 'التصادم القاري يسبب تقلصا أفقيا', expectedOrder: 1 },
          { id: 'thickening', labelAr: 'التضاعف القشري يزيد سمك الليتوسفير', expectedOrder: 2 },
          { id: 'metamorphism', labelAr: 'تحول الصخور العميقة بارتفاع الحرارة والضغط', expectedOrder: 3 },
          { id: 'melting', labelAr: 'انصهار جزئي لغرانيت القشرة ⇐ المغماتيت', expectedOrder: 4 },
        ],
        summaryPromptAr: 'لخّص في نص علمي مراحل تشكل صخر المغماتيت.',
        summaryKeywords: ['التقلص', 'التضاعف القشري', 'الانصهار الجزئي', 'المغماتيت'],
        summaryAr: 'التصادم القاري ⇐ تقلص أفقي ⇐ تضاعف قشري وزيادة سمك الليتوسفير ⇐ تحول الصخور العميقة ⇐ انصهار جزئي للغرانيت ⇐ صخر المغماتيت الشاهد على التقلص.',
      },
      {
        type: 'TEXT_AND_PRODUCE',
        objective: 'إنتاج النص العلمي المطلوب في الكتاب : مراحل تشكل المغماتيت.',
        prompt: 'لخّص في نص علمي مراحل تشكل صخر المغماتيت.',
        acceptedAnswers: ['التقلص', 'التضاعف القشري', 'الانصهار الجزئي', 'الغرانيت'],
        errorHint: 'الجواب : التصادم ⇐ التقلص ⇐ التضاعف القشري ⇐ الانصهار الجزئي للغرانيت ⇐ المغماتيت.',
      },
    ],
  },
  // ANCHOR_MIG_L2
};
