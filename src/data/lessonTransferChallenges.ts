// src/data/lessonTransferChallenges.ts
// P1.3 / V3 §4.5 — Défi BAC de sortie de leçon.
// Unique sortie par leçon : le réflexe BAC du chapitre, validé par ValidationEngine.
// Correction masquée avant toute tentative (règle produit-avant-correction).

import type { CoreReflexId } from './reflexes';
import { normalizeArabic } from '../utils/arabicNormalize';

export interface LessonTransferChallenge {
  id: string;
  lessonId: string;
  conceptId: string;
  reflexId: CoreReflexId;
  titleAr: string;
  contextAr: string;
  questionAr: string;
  // Contexte transmis à ValidationEngine (vérifie une vraie réponse, pas un clic).
  validation: {
    docType: 'quantitative' | 'qualitative' | 'mixed';
    actionVerb:
      | 'identify' | 'describe' | 'analyse' | 'interpret' | 'explain'
      | 'compare' | 'hypothesize' | 'validate' | 'synthesize'
      | 'schematize' | 'justify' | 'critique';
    domain?: 'nerveux' | 'hormonal' | 'immuno' | 'genetique' | 'metabo' | 'tectonique' | 'enzyme' | 'autre';
    isNeuromuscular?: boolean;
    expectedTargets?: string[];
  };
  correctionAr: string;
  // Correction masquée avant tentative (règle produit-avant-correction).
}

export const LESSON_TRANSFER_CHALLENGES: Record<string, LessonTransferChallenge> = {
  'd1-u1-l2-transcription': {
    id: 'lt_transcription_uracile',
    lessonId: 'd1-u1-l2-transcription',
    conceptId: 'transcription',
    reflexId: 'interpret',
    titleAr: 'تحدي BAC — مسار اليوراسيل المشع',
    contextAr:
      'حُقنت خلية بنواة مشعة تُدمج اليوراسيل المشع في ARNm الجديد. بعد مدة قصيرة: وسّم في النواة. بعد مدة أطول: وسّم في الهيولى.',
    questionAr:
      'فسّر مسار ظهور الوسم: أي جزيء يظهر أولاً في النواة ثم في الهيولى، ولماذا يدل على نقل المعلومة؟',
    validation: {
      docType: 'qualitative',
      actionVerb: 'interpret',
      domain: 'genetique',
      isNeuromuscular: false,
      expectedTargets: ['النواة', 'الهيولى', 'ARNm', 'اليوراسيل', 'الاستنساخ'],
    },
    correctionAr:
      'يظهر الوسم أولاً في النواة حيث يُركّب ARNm (يحتوي اليوراسيل ولا يحتوي التايمين). ثم يظهر في الهيولى لأن ARNm يحمل نسخة المعلومة من النواة إلى الهيولى. هذا يدل على أن المعلومة تُنسخ في النواة ثم تُنقل.',
  },
  'd1-u1-l3-traduction': {
    id: 'lt_traduction_codon',
    lessonId: 'd1-u1-l3-traduction',
    conceptId: 'traduction',
    reflexId: 'explain',
    titleAr: 'تحدي BAC — الكودون إلى السلسلة الببتيدية',
    contextAr: 'يقرأ الريبوزوم رسالة ARNm ويربط كل كودون بحمضه الأميني عبر ARNt.',
    questionAr:
      'اشرح كيف ينتقل من الكودون إلى الحمض الأميني ثم إلى السلسلة الببتيدية (اربط الكودون بمضاد الكودون).',
    validation: {
      docType: 'qualitative',
      actionVerb: 'explain',
      domain: 'genetique',
      isNeuromuscular: false,
      expectedTargets: ['الكودون', 'مضاد الكودون', 'ARNt', 'الحمض الأميني', 'السلسلة الببتيدية'],
    },
    correctionAr:
      'يقرأ الريبوزوم الكودون على ARNm؛ يرتبط به مضاد الكودون على ARNt الحامل للحمض الأميني الموافق؛ تتشكل روابط ببتيدية بين الأحماض فيطول السلسلة الببتيدية.',
  },
  'd1-u3-l1-enzyme': {
    id: 'lt_enzyme_saturation',
    lessonId: 'd1-u3-l1-enzyme',
    conceptId: 'enzymes',
    reflexId: 'analyse',
    titleAr: 'تحدي BAC — تحليل منحنى النشاط الإنزيمي',
    contextAr: 'يمثّل المنحنى تطوّر سرعة تفاعل إنزيمي حسب تركيز الركيزة.',
    questionAr: 'حلّل المنحنى: كيف تتغيّر السرعة ولماذا تستقر عند التشبّع؟',
    validation: {
      docType: 'quantitative',
      actionVerb: 'analyse',
      domain: 'enzyme',
      isNeuromuscular: false,
      expectedTargets: ['الركيزة', 'الموقع النشط', 'التشبع', 'Vmax'],
    },
    correctionAr:
      'تزداد السرعة مع تركيز الركيزة لأن المواقع النشطة تتحرّك نحو التشبّع، ثم تستقر عند Vmax لأن جميع المواقع النشطة أصبحت مشغولة ولا يمكن للإنزيم استقبال ركيزة أكثر.',
  },
  'd2-u6-l1-hill-ruben': {
    id: 'lt_hill_ruben_o2_source',
    lessonId: 'd2-u6-l1-hill-ruben',
    conceptId: 'hill_ruben_water_splitting',
    reflexId: 'interpret',
    titleAr: 'تحدي BAC — مصدر الأكسجين المنطلق',
    contextAr:
      'حُضنت صانعات خضراء معزولة في وسط خالٍ من CO₂ مع أملاح الحديد Fe³⁺ والضوء: انطلق O₂ وأرجع الحديد. وفي تجربة أخرى موسوم O₂ الوسط بـ ¹⁸O في الماء فقط.',
    questionAr:
      'فسّر النتائج: من أي جزيء يأتي الأكسجين المنطلق، وما دور Fe³⁺؟',
    validation: {
      docType: 'qualitative',
      actionVerb: 'interpret',
      domain: 'metabo',
      isNeuromuscular: false,
      expectedTargets: ['الماء', 'التحلل الضوئي', 'الأكسجين', 'مستقبل اصطناعي', 'الإلكترونات'],
    },
    correctionAr:
      'يأتي الأكسجين المنطلق من تحلل الماء تحت تأثير الضوء وليس من CO₂: انطلق O₂ في وسط خالٍ من CO₂، والوسم ¹⁸O يظهر في O₂ فقط حين يكون في الماء. يوظف Fe³⁺ كمستقبل اصطناعي يقبل الإلكترونات المحررة من تحلل الماء فيرجع إلى Fe²⁺.',
  },
  'd2-u6-l2-jagendorf': {
    id: 'lt_jagendorf_gradient',
    lessonId: 'd2-u6-l2-jagendorf',
    conceptId: 'jagendorf_proton_gradient',
    reflexId: 'interpret',
    titleAr: 'تحدي BAC — تركيب ATP في الظلام',
    contextAr:
      'وُضعت كييسات ثيلاكويد معزولة في الظلام في وسط pH = 4 ثم نُقلت إلى وسط pH = 8 يحتوي ADP وPi، فظهر ATP في الظلام.',
    questionAr:
      'فسّر تكوّن ATP في الظلام، واستنتج الدور الحقيقي للضوء في الصانعة الخضراء.',
    validation: {
      docType: 'qualitative',
      actionVerb: 'interpret',
      domain: 'metabo',
      isNeuromuscular: false,
      expectedTargets: ['تدرج البروتونات', 'الكرية المذنبة', 'ATP', 'الظلام'],
    },
    correctionAr:
      'تكوّن ATP في الظلام لأن فرق pH خلَق تدرجا للبروتونات H⁺ بين التجويف والوسط، وعادت H⁺ عبر الكرية المذنبة فترجمت الطاقة الحررة في تركيب ATP. إذن دور الضوء ليس التركيب المباشر بل تكوين تدرج H⁺ داخل التيلاكويد أثناء المرحلة الكيميوضوئية.',
  },
  'd2-u6-l3-calvin': {
    id: 'lt_calvin_14c',
    lessonId: 'd2-u6-l3-calvin',
    conceptId: 'calvin_14c_tracing',
    reflexId: 'analyse',
    titleAr: 'تحدي BAC — أول مركب يتلقى الكربون',
    contextAr:
      'عرّض كالفن أشنة خضراء لـ ¹⁴CO₂ وأخذ عينات عند 5 و30 و60 ثانية، ثم حللها بكروماتوغرافيا ثنائية الأبعاد وتصوير إشعاعي ذاتي: عند 5 ثوان ظهرت نقطة واحدة (3-PGA)، ثم تعددت النقاط مع الزمن.',
    questionAr:
      'حلّل النتائج: ما أول مركب يتلقى كربون CO₂، وماذا يستنتج من تدرج ظهور الوسم؟',
    validation: {
      docType: 'qualitative',
      actionVerb: 'analyse',
      domain: 'metabo',
      isNeuromuscular: false,
      expectedTargets: ['3-PGA', 'حمض فوسفوغليسريك', 'الوسم', 'الحلقة'],
    },
    correctionAr:
      'أول مركب موسوم هو حمض فوسفوغليسريك 3-PGA لأنه وحده ظهر عند 5 ثوان. تدرج ظهور الوسم بعدها (تريوزات فوسفاتية ثم سكريات) يفيد أن تثبيت الكربون يتم في مسار حلقي: تثبيت CO₂ على RuBP ثم اختزال 3-PGA بوساطة ATP وNADPH ثم تجديد المستقبل.',
  },
  'd2-u7-l1-mitchell-racker': {
    id: 'lt_racker_chemiosmosis',
    lessonId: 'd2-u7-l1-mitchell-racker',
    conceptId: 'mitchell_racker_chemiosmosis',
    reflexId: 'interpret',
    titleAr: 'تحدي BAC — إعادة البناء الاصطناعي',
    contextAr:
      'أدخل راكر بروتين البكتيريورودوبسين (مضخة H⁺ تعمل بالضوء) والكرية المذنبة في حويصلة غشائية اصطناعية: عند الإضاءة تركب ATP خارج الحويصلة، وفي الظلام لا يتركب.',
    questionAr:
      'فسّر هذه النتائج، وبيّن البرهان الذي تقدمه لنظرية ميتشل الكيمياؤسموزية.',
    validation: {
      docType: 'qualitative',
      actionVerb: 'interpret',
      domain: 'metabo',
      isNeuromuscular: false,
      expectedTargets: ['تدرج البروتونات', 'الكرية المذنبة', 'ATP', 'الضوء'],
    },
    correctionAr:
      'الضوء يحرك مضخة البكتيريورودوبسين فيضخ H⁺ داخل الحويصلة فيتكون تدرج بروتوني، وعودة H⁺ عبر الكرية المذنبة تترجم طاقة التدرج في تركيب ATP، وفي الظلام لا تضخ ولا ATP. إذن تدرج H⁺ وحده مع الكرية المذنبة كاف لتركيب ATP: برهان على النظرية الكيمياؤسموزية لميتشل.',
  },
  'd3-u9-l2-benioff': {
    id: 'lt_benioff_plan',
    lessonId: 'd3-u9-l2-benioff',
    conceptId: 'benioff_plan_earthquakes',
    reflexId: 'interpret',
    titleAr: 'تحدي BAC — بؤر الزلازل والغوص',
    contextAr:
      'في منطقة الاندساس رُصدت بؤر زلزالية سطحية قرب الخندق ثم عميقة (300، 500، 700 كلم) كلما اتجهنا نحو القارة، واصطففت على مستوى مائل.',
    questionAr:
      'حلّل توزع البؤر الزلزالية واستنتج الشاهد الذي يقدمه على ظاهرة الغوص.',
    validation: {
      docType: 'qualitative',
      actionVerb: 'interpret',
      domain: 'tectonique',
      isNeuromuscular: false,
      expectedTargets: ['مستوى بنيوف', 'الغوص', 'الصفيحة المحيطية', 'البرنس'],
    },
    correctionAr:
      'تتعمق بؤر الزلازل تدريجيا من الخندق نحو القارة واصطففت على مستوى مائل يدعى مستوى بنيوف: ذلك يثبت أن صفيحة محيطية صلبة وباردة تنزلق وتنكسر داخل البرنس المطاطي، إذ لا تولد الاستينوسفير المطاطي زلازل. الاصطفاف المائل هو بصمة مسار الغوص حتى 700 كلم.',
  },
  'd3-u11-l1-migmatite': {
    id: 'lt_migmatite_thickening',
    lessonId: 'd3-u11-l1-migmatite',
    conceptId: 'migmatite_crustal_thickening',
    reflexId: 'interpret',
    titleAr: 'تحدي BAC — المغماتيت شاهد التقلص',
    contextAr:
      'في منطقة تصادم قاري لوحظت طيات وفوالق عكسية وصخور مغتربة، وصخر متحول يتناوب فيه الكوارتز والغرونا والميكا والبلاجيوكلاز مع صفوف أومفيبوليت، ناتج عن انصهار جزئي لغرانيت القشرة العميقة.',
    questionAr:
      'حدّد نوع البنيات المميزة لمنطقة التصادم، واستنتج لماذا يعد هذا الصخر دليلا على التضاعف القشري.',
    validation: {
      docType: 'qualitative',
      actionVerb: 'interpret',
      domain: 'tectonique',
      isNeuromuscular: false,
      expectedTargets: ['التضاعف القشري', 'الانصهار الجزئي', 'الغرانيت', 'المغماتيت', 'التقلص'],
    },
    correctionAr:
      'البنيات طيات وفوالق عكسية وصخور مغتربة ناشئة عن قوى الانضغاط. الصخر هو المغماتيت: تناوب معادن ناتج عن انصهار جزئي لغرانيت القشرة العميقة تحت الحرارة والضغط العاليين، ولا يحدث هذا إلا حيث ازداد سمك الليتوسفير — أي التضاعف القشري شاهد التقلص.',
  },
};

// #41 — Le Défi BAC notait sur le seul ValidationEngine, qui mesure la FORME
// méthodologique (« كلما … كلما », valeur+unité, connecteurs) et non le fond.
// Mesuré sur les données réelles : une réponse hors-sujet obtenait 80-95 % et
// validait les 3 défis, en enregistrant une preuve de TRANSFERT — le signal de
// maîtrise le plus fort de l'application.
// On exige donc un recouvrement minimal avec la correction officielle du défi.
const TRANSFER_STOPWORDS = new Set([
  'في', 'من', 'الى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'ثم', 'لان', 'التي',
  'الذي', 'هو', 'هي', 'عند', 'بين', 'كل', 'قد', 'ان', 'او', 'يتم', 'يدل',
  'حيث', 'لها', 'الا', 'كما', 'بعد', 'اما',
]);

// Deux notions du corrigé suffisent : le défi reste un exercice de production,
// pas une dictée. Calibré dans les deux sens sur les 3 corrigés officiels
// (qui obtiennent 6 à 12 recouvrements) contre 0 pour une réponse hors-sujet.
const MIN_TRANSFER_OVERLAP = 2;

function transferContentTokens(text: string): string[] {
  return Array.from(
    new Set(
      normalizeArabic(text)
        .split(' ')
        .map((t) => t.replace(/[^\u0600-\u06ffa-z0-9]/g, ''))
        .filter((t) => t.length >= 4 && !TRANSFER_STOPWORDS.has(t)),
    ),
  );
}

// Vrai si la réponse mobilise assez de notions du corrigé officiel du défi.
export function hasTransferContent(answer: string, challenge: LessonTransferChallenge): boolean {
  const attendus = transferContentTokens(challenge.correctionAr);
  if (attendus.length === 0) return true;
  const normAnswer = normalizeArabic(answer);
  const recouvrement = attendus.filter((t) => normAnswer.includes(t)).length;
  return recouvrement >= Math.min(MIN_TRANSFER_OVERLAP, attendus.length);
}

export function getLessonTransferChallenge(lessonId: string): LessonTransferChallenge | undefined {
  return LESSON_TRANSFER_CHALLENGES[lessonId];
}
