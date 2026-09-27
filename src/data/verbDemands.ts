// verbDemands.ts — ce que chaque VERBE DE CONSIGNE exige réellement
// (sprint 22).
//
// Pourquoi ce fichier
// -------------------
// Le dépouillement des 8 sessions a relevé **71 formulations de consignes
// différentes** pour 47 exercices. Un élève les lit comme 71 demandes ; le
// correcteur, lui, n'en attend qu'une dizaine. Et la plus grosse perte de
// points de l'épreuve vient d'une confusion entre deux d'entre elles :
// « حلّل » (décrire ce que montre le document, avec les chiffres) et « فسّر »
// (dire POURQUOI, avec les connaissances) — la première n'attend AUCUNE
// connaissance extérieure, la seconde en exige.
//
// Ce module classe les 71 formulations en familles, et pour chaque famille
// dit : ce qui est attendu, la structure de la réponse, le canevas de phrase,
// et le verbe voisin avec lequel on la confond. Les statistiques sont
// calculées sur le corpus réel, pas estimées.
//
// Il ne remplace pas `methodologyKnowledge.ts` (le tuteur méthodologique) : il
// le branche sur des exercices datés et comptés.

import { BAC_IDEAS, type BacExerciseIdea } from './bacSessionIndex';

export interface VerbFamily {
  id: string;
  /** Nom de la famille, formulation la plus fréquente en tête. */
  titleAr: string;
  /** Ce que le correcteur attend, en une phrase. */
  demandeAr: string;
  /** La structure de la réponse, étape par étape. */
  structureAr: string[];
  /** Canevas de phrase à réutiliser tel quel. */
  templateAr: string;
  /** Le voisin avec lequel on la confond, et la différence. */
  confusionAr: string;
  /**
   * Règles de reconnaissance, testées DANS L'ORDRE du tableau : la première
   * qui accroche gagne. L'ordre est donc porteur de sens (« بيّن في نص علمي »
   * est un texte scientifique avant d'être un « بيّن »).
   */
  motifs: RegExp[];
}

/**
 * Familles, dans l'ordre de priorité de classement.
 * Les formes les plus spécifiques viennent avant les plus générales.
 */
export const VERB_FAMILIES: VerbFamily[] = [
  {
    id: 'verb_texte_scientifique',
    titleAr: 'اكتب في نص علمي',
    demandeAr:
      'إنتاج مكتوب مهيكل بمقدمة و عرض و خاتمة، لا مجرد جواب: السلّم يمنح نقاطاً على الهيكلة نفسها.',
    structureAr: [
      'المقدمة: تنتهي بطرح المشكل العلمي بصيغة سؤال',
      'العرض: مؤشرات مرتّبة، كل مؤشر جملة كاملة موظِّفة معطى من الوثيقة',
      'الخاتمة: جواب صريح عن المشكل المطروح في المقدمة',
    ],
    templateAr: 'يطرح … مشكلاً علمياً: كيف …؟ — تبيّن الوثيقة … و هو ما يدل على … — و منه نستنتج أن …',
    confusionAr:
      'كتابة فقرة واحدة دون مقدمة و لا خاتمة: الجواب قد يكون صحيحاً علمياً و يخسر نقاط الهيكلة.',
    motifs: [/نص علمي/, /فقرة علمية/, /نصاً علمياً/],
  },
  {
    id: 'verb_schema_bilan',
    titleAr: 'لخّص في مخطط',
    demandeAr: 'تحويل ما توصّلت إليه إلى مخطط وظيفي: عناصر مسمّاة و أسهم موجّهة تحمل دلالة.',
    structureAr: [
      'ضع العناصر في ترتيب زمني أو سببي، لا عشوائياً',
      'كل سهم يحمل عبارة (يحفّز، يثبّط، يتحوّل إلى)',
      'أدرج ما توصّلت إليه في التمرين، لا الدرس كاملاً',
    ],
    templateAr: 'عنصر ← (فعل) ← عنصر ← (نتيجة) — مع عنوان للمخطط',
    confusionAr:
      'إعادة رسم مخطط الدرس المحفوظ بدل مخطط يدمج نتائج الوثائق المدروسة في التمرين.',
    motifs: [/مخطط/, /رسم تخطيطي/],
  },
  {
    id: 'verb_valider',
    titleAr: 'صادق / تحقّق / ناقش صحة الفرضية',
    demandeAr:
      'مواجهة الفرضية بالمعطيات: قبولها أو رفضها بدليل رقمي، مع الحذر في ما لا تدعمه الوثائق.',
    structureAr: [
      'ذكّر بالفرضية بصيغتها',
      'قدّم المعطى الذي يؤيدها أو يناقضها، بالأرقام',
      'اخلص: الفرضية صحيحة / غير صحيحة / غير مدعومة بالمعطيات',
    ],
    templateAr: 'تنصّ الفرضية على … و بما أن … (معطى رقمي) فإن الفرضية …',
    confusionAr:
      'نفي فرضية لا تدعمها المعطيات: غياب الدليل ليس دليل غياب — تُعامل كغير مدعومة، لا كخاطئة.',
    motifs: [/صادق/, /تحقّق/, /تأكّد/, /ناقش صحة/, /^ناقش$/],
  },
  {
    id: 'verb_hypothese',
    titleAr: 'اقترح فرضية',
    demandeAr: 'جواب مؤقت تفسيري عن المشكل، منطقي و قابل للاختبار — و ليس إعادة صياغة للنتيجة.',
    structureAr: [
      'انطلق من المشكل المطروح، لا من الوثيقة وحدها',
      'صغ سبباً محتملاً بصيغة احتمالية',
      'إذا طُلبت فرضيتان، اجعلهما متمايزتين فعلاً و قابلتين للفصل بتجربة',
    ],
    templateAr: 'قد يعود … إلى … مما يؤدي إلى …',
    confusionAr:
      'تقديم فرضيتين متطابقتين في المعنى: الوثيقة التالية لن تفصل بينهما، و تضيع نقاط المصادقة.',
    motifs: [/فرضي/],
  },
  {
    id: 'verb_solution',
    titleAr: 'اقترح حلاً / قدّم نصيحة',
    demandeAr: 'توظيف ما أثبتّه في التمرين لاقتراح إجراء عملي أو وقائي، مبرَّر علمياً.',
    structureAr: [
      'اذكر الإجراء بدقة (مادة، سلوك، تقنية)',
      'اربطه بالآلية التي أظهرتها الوثائق',
      'ابقَ في حدود ما أثبته التمرين، دون وصفات عامة',
    ],
    templateAr: 'يُنصح بـ … لأن … كما بيّنته الوثيقة …',
    confusionAr: 'نصائح عامة من نوع « تجنّب التدخين » دون ربطها بالآلية الجزيئية المدروسة.',
    motifs: [/نصيحة/, /نصائح/, /إرشادات/, /حلا/, /حلاً/, /طريقة أخرى/],
  },
  {
    id: 'verb_analyser',
    titleAr: 'حلّل',
    demandeAr:
      'وصف ما تُظهره الوثيقة بالأرقام و الوحدات و المجالات — دون أي معرفة خارجية، و دون تفسير.',
    structureAr: [
      'سمِّ نوع الوثيقة و ما يمثّله كل محور',
      'قسّم إلى مجالات و اذكر لكل مجال الاتجاه مع قيم البداية و النهاية',
      'اختم بعلاقة عامة: كلما … كلما …',
    ],
    templateAr: 'في المجال من … إلى … ينتقل … من … إلى … أي كلما زاد … كلما …',
    confusionAr:
      'الخلط مع « فسّر »: التحليل لا يذكر السبب. إقحام المكتسبات هنا لا يضيف نقاطاً و يستهلك الوقت.',
    motifs: [/حلّل/, /حلل/, /مثّل بيانياً/, /تحليلاً/],
  },
  {
    id: 'verb_expliquer',
    titleAr: 'فسّر / اشرح / وضّح / علّل',
    demandeAr: 'ربط النتيجة بسببها العلمي: هنا فقط تُوظَّف المكتسبات، و على مستويين إن أمكن.',
    structureAr: [
      'ذكّر بالنتيجة في جملة قصيرة',
      'اذكر الآلية: على المستوى الجزيئي ثم الخلوي',
      'اربط بأداة ربط صريحة (يعود ذلك إلى، لأن، نتيجة لـ)',
    ],
    templateAr: 'نلاحظ … و يعود ذلك جزيئياً إلى … و خلوياً إلى …',
    confusionAr:
      'إعادة وصف المنحنى بكلمات أخرى: الوصف تحليل، و التفسير يبدأ حيث تُذكر الآلية.',
    // « بيّن » est ici, et non dans la restitution : il demande de MONTRER que
    // quelque chose est vrai, donc un raisonnement, pas un mot.
    motifs: [/فسّر/, /فسر/, /اشرح/, /وضّح/, /علّل/, /بيّن/, /السبب/, /الآلية/, /الأهمية/, /الوظيفة/],
  },
  {
    id: 'verb_comparer',
    titleAr: 'قارن',
    demandeAr: 'مواجهة منظّمة بين حالتين على معايير مشتركة، مع أوجه الشبه و الاختلاف.',
    structureAr: [
      'حدّد المعايير قبل الكتابة (بنية، نشاط، زمن، نتيجة)',
      'عالج كل معيار للحالتين معاً، لا حالة ثم حالة',
      'اختم بالفرق الجوهري الذي يفسّر السلوكين',
    ],
    templateAr: 'من حيث … : في الحالة الأولى … بينما في الثانية … ; و يشتركان في …',
    confusionAr: 'سرد الحالة الأولى كاملة ثم الثانية كاملة: هذا وصف مزدوج و ليس مقارنة.',
    motifs: [/قارن/],
  },
  {
    id: 'verb_relation',
    titleAr: 'أبرز العلاقة',
    demandeAr: 'إظهار الرابط بين معطيَين من وثيقتين مختلفتين — و هو ما يمنح نقاط التركيب.',
    structureAr: [
      'اذكر معطى الوثيقة الأولى، ثم معطى الثانية',
      'صرّح بالرابط بينهما (كلما / بالموازاة / يقابل)',
      'استنتج العلاقة السببية إن كانت المعطيات تسمح',
    ],
    templateAr: 'تبيّن الوثيقة 1 … و تبيّن الوثيقة 2 … و بربطهما نستنتج أن …',
    confusionAr: 'تحليل كل وثيقة على حدة دون جملة الربط: نقطة التركيب تضيع كاملة.',
    motifs: [/العلاقة/, /أبرز الأثر/, /أبرز/],
  },
  {
    id: 'verb_conclure',
    titleAr: 'استنتج / استخرج / استخلص',
    demandeAr: 'جملة واحدة قصيرة تُخرِج المعنى من التحليل السابق، دون معطيات جديدة.',
    structureAr: [
      'ابدأ بأداة استنتاج صريحة',
      'قل الفكرة العامة لا التفاصيل',
      'تأكد أن الاستنتاج يجيب عن السؤال المطروح',
    ],
    templateAr: 'نستنتج أن …',
    confusionAr: 'إعادة التحليل بالتفصيل: الاستنتاج تعميم، و طوله المعتاد سطر إلى سطرين.',
    motifs: [/استنتج/, /استخرج/, /استخلص/, /أعطِ حلا/, /قدّم إجابة/],
  },
  {
    id: 'verb_justifier',
    titleAr: 'برّر',
    demandeAr: 'إعطاء السند العلمي لاختيار أو لظاهرة سبق ذكرها: لماذا هذا الاختيار بالذات؟',
    structureAr: [
      'اذكر ما تبرّره بوضوح',
      'استند إلى معطى من الوثيقة أو إلى قاعدة علمية دقيقة',
      'اربط بينهما بجملة سببية واحدة',
    ],
    templateAr: 'يُبرَّر … بكون … و هو ما تؤكده …',
    confusionAr:
      'الخلط مع « فسّر »: التبرير يدافع عن اختيار أو قرار، و التفسير يشرح آلية ظاهرة.',
    motifs: [/برّر/],
  },
  {
    id: 'verb_restituer',
    titleAr: 'سمّ / اذكر / تعرّف / حدّد / صف',
    demandeAr: 'استرجاع مباشر بالمصطلح الدقيق: لا تحليل، لا تفسير، و لا جمل طويلة.',
    structureAr: [
      'استعمل المصطلح العلمي المضبوط، بالعربية و عند الحاجة باللاتينية',
      'احترم الترتيب المطلوب (البيانات من 1 إلى n)',
      'لا تضف شرحاً لم يُطلب: لا نقطة عليه، و الوقت ثمين',
    ],
    templateAr: '1 — … / 2 — … (مصطلح واحد لكل بيان)',
    confusionAr: 'الإطناب في تمرين الاسترجاع على حساب تمرين 08 نقاط الذي يحتاج وقتاً.',
    motifs: [
      /سمّ/,
      /اذكر/,
      /تعرّف/,
      /حدّد/,
      /^صف$/,
      /مثّل الصيغة/,
      /املأ/,
      /اختر/,
      /أنجز/,
      /قدّم/,
    ],
  },
];

export const VERB_FAMILY_BY_ID: Record<string, VerbFamily> = Object.fromEntries(
  VERB_FAMILIES.map((f) => [f.id, f]),
);

/** Famille d'une formulation de consigne, ou `null` si aucune règle n'accroche. */
export function classifyVerb(verbe: string): VerbFamily | null {
  for (const famille of VERB_FAMILIES) {
    if (famille.motifs.some((m) => m.test(verbe))) return famille;
  }
  return null;
}

/** Toutes les formulations du corpus rattachées à une famille. */
export function formulationsOfFamily(familyId: string): string[] {
  const vues = new Set<string>();
  for (const idea of BAC_IDEAS) {
    for (const v of idea.verbsAr) {
      if (classifyVerb(v)?.id === familyId) vues.add(v);
    }
  }
  return [...vues].sort((a, b) => a.localeCompare(b));
}

/** Exercices réels où la famille est demandée, du plus récent au plus ancien. */
export function ideasForVerbFamily(familyId: string): BacExerciseIdea[] {
  return BAC_IDEAS.filter((i) => i.verbsAr.some((v) => classifyVerb(v)?.id === familyId)).sort(
    (a, b) => b.year - a.year || a.sujet - b.sujet || a.exercice - b.exercice,
  );
}

export interface VerbFamilyStat {
  familyId: string;
  titleAr: string;
  /** Nombre de consignes de cette famille dans le corpus. */
  occurrences: number;
  /** Nombre d'exercices concernés. */
  exercices: number;
  /** Nombre de sessions concernées. */
  sessions: number;
  /** Points cumulés des exercices concernés (ce que la famille « vaut »). */
  points: number;
}

/** Poids réel de chaque famille de consignes, mesuré sur le corpus. */
export function verbFamilyStats(): VerbFamilyStat[] {
  return VERB_FAMILIES.map((f) => {
    const ideas = ideasForVerbFamily(f.id);
    const occurrences = BAC_IDEAS.reduce(
      (s, i) => s + i.verbsAr.filter((v) => classifyVerb(v)?.id === f.id).length,
      0,
    );
    return {
      familyId: f.id,
      titleAr: f.titleAr,
      occurrences,
      exercices: ideas.length,
      sessions: new Set(ideas.map((i) => i.year)).size,
      points: ideas.reduce((s, i) => s + i.points, 0),
    };
  }).sort(
    (a, b) => b.occurrences - a.occurrences || b.points - a.points || a.familyId.localeCompare(b.familyId),
  );
}

/** Formulations du corpus qu'aucune règle ne reconnaît (doit rester vide). */
export function unclassifiedVerbs(): string[] {
  const vues = new Set<string>();
  for (const idea of BAC_IDEAS) {
    for (const v of idea.verbsAr) if (!classifyVerb(v)) vues.add(v);
  }
  return [...vues].sort((a, b) => a.localeCompare(b));
}

export const VERB_FAMILY_COUNT = VERB_FAMILIES.length;
