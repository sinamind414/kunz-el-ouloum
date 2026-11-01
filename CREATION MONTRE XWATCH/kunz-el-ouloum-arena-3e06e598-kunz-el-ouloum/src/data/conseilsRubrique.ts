// conseilsRubrique.ts — CE QU'UN PROFESSEUR DIT EN ENTRANT DANS UNE SALLE.
//
// POURQUOI CE FICHIER EXISTE (14/10/2026, demande de l'utilisateur : « je veux
// que le tutor morchid parle quand tu rentres à une rubrique, donne des conseils
// comme un prof »).
//
// Ce fichier applique l'idée, mais PAS au pied de la lettre, et la raison est
// écrite ici pour que personne ne la « corrige » plus tard par erreur :
//
//   1. Le guide parle à la PREMIÈRE VISITE d'une rubrique — pas à chaque
//      entrée. Un professeur explique comment utiliser une salle la première
//      fois ; il ne refait pas le discours à chaque fois que tu franchis la
//      porte. Répéter à l'identique n'informe plus : ça décore.
//   2. Le même conseil peut être ROUVERT par l'élève (bouton sur le bandeau,
//      voir `BandeauConseilRubrique`). Il est donc disponible sans être imposé —
//      c'est ce qui distingue un rappel d'un harcèlement.
//   3. Chaque conseil est une CONSIGNE DE MÉTHODE, jamais une phrase
//      d'encouragement. « Relis bien » ne sert à rien ; « prends un exercice et
//      termine-le » change le geste. C'est la seule différence entre parler comme
//      un prof et faire du bruit.
//
// Le ton est celui d'un professeur algérien qui s'adresse à un élève de 3AS :
// tutoiement, impératif, une seule idée par phrase, aucune flatterie.
//
// Ce module est VOLONTAIREMENT LÉGER (des chaînes, rien d'autre) : il est
// importé par `App.tsx`, donc son poids compte au premier affichage.

/** Une consigne d'entrée de rubrique. */
export interface ConseilRubrique {
  /** Identifiant d'onglet réel d'`App.tsx` — jamais un nom de rubrique inventé. */
  rubrique: string;
  /** Ce que le guide dit, en une phrase de professeur. */
  conseilAr: string;
  /** Le geste à faire tout de suite, court et vérifiable. */
  gesteAr: string;
}

/**
 * Les conseils, par rubrique.
 *
 * Volontairement INCOMPLÈTE : toutes les rubriques ne méritent pas un discours.
 * `focus` (minuteur) ou `stats` (chiffres) n'ont pas de méthode à enseigner, et
 * une rubrique absente de cette table est simplement silencieuse — le silence
 * reste la valeur par défaut, comme pour la bulle du capitaine.
 */
export const CONSEILS_RUBRIQUES: readonly ConseilRubrique[] = [
  {
    rubrique: 'methodology',
    conseilAr: 'مفتاح لا يُقرأ كالدرس — يُستعمل. خُذ إنتاجًا كتبتَه فعلًا وقارنه بمعايير الفعل، واكتب الخطأ الذي وقعت فيه.',
    gesteAr: 'افتح تمرينًا واحدًا وأكمل مرحلة واحدة فقط.',
  },
  {
    rubrique: 'training',
    conseilAr: 'هنا نخسر النقاط بأمان. تمرين واحد أُنجز كاملًا أنفع من ثلاثة ناقصة، والتصحيح جزء من التمرين لا نهايته.',
    gesteAr: 'اختر تمرينًا واحدًا وحدّد أين ستتوقّف قبل أن تبدأ.',
  },
  {
    rubrique: 'examens',
    conseilAr: 'المحاكاة تُقاس بالورقة والساعة، لا بالنقر. أغلق كل مساعدة قبل أن تضغط «ابدأ»، واكتب بخط يدك.',
    gesteAr: 'جهّز ورقة وقلمًا قبل البدء.',
  },
  {
    rubrique: 'lesson',
    conseilAr: 'اقرأ بسؤال في رأسك: «ماذا يريد مني المنهاج في هذه الوثيقة؟». القراءة بلا سؤال قراءة بلا أثر.',
    gesteAr: 'اكتب سؤالك على ورقة قبل أن تفتح الدرس.',
  },
  {
    rubrique: 'review',
    conseilAr: 'المراجعة المتباعدة تُستدعى ولا تُقرأ. أغلق الدفتر أولًا، ثم قل الجواب بصوتك، ثم تحقّق.',
    gesteAr: 'أجب من ذاكرتك قبل أن تكشف البطاقة.',
  },
  {
    rubrique: 'reviser',
    conseilAr: 'المراجعة ليست إعادة قراءة. اختر ما لم تفهمه بعد، لا ما تحبّ مراجعته.',
    gesteAr: 'ابدأ بالمحور الذي أضعف درجاتك فيه.',
  },
  {
    rubrique: 'tadwin',
    conseilAr: 'التدوين للتلخيص بكلماتك أنت، لا لنسخ الدرس. إن استطعت النسخ فأنت لم تفهم بعد.',
    gesteAr: 'أغلق الدرس واكتب الفكرة من رأسك.',
  },
  {
    rubrique: 'schemas',
    conseilAr: 'ارسم قبل أن تنظر. الرسم من الذاكرة يكشف الثغرة التي يخفيها التعريف المحفوظ.',
    gesteAr: 'ارسم مرة واحدة بلا نظر، ثم قارن.',
  },
  {
    rubrique: 'focus',
    conseilAr: 'جلسة واحدة = هدف واحد. الهدف الغامض يتحوّل إلى تصفّح.',
    gesteAr: 'اكتب هدف الجلسة قبل تشغيل المؤقّت.',
  },
  {
    rubrique: 'plan',
    conseilAr: 'الخطة تُبنى من الأيام المتبقية لا من الأمنيات. احسب أولًا، ثم وزّع.',
    gesteAr: 'اكتب عدد الأيام الباقية قبل أي شيء.',
  },
  {
    rubrique: 'situations',
    conseilAr: 'الوضعية تُحلّل قبل أن تُحسب: استخرج المعطيات، ثم المطلوب، ثم ابدأ.',
    gesteAr: 'اشطب على كل معطاة لا تستعملها.',
  },
  {
    rubrique: 'bacideas',
    conseilAr: 'أفكار التمارين للتعرّف على أنماط السؤال لا لحفظ الحلول. سؤال الدورة يتكرّر، والحلّ لا.',
    gesteAr: 'اكتب بنية السؤال قبل قراءة الحلّ.',
  },
  {
    rubrique: 'stats',
    conseilAr: 'هذه أرقامك أنت. انظر إلى أضعف محور، لا إلى أجمل رقم.',
    gesteAr: 'حدّد المحور الأضعف ونم إلى الخطوة التالية.',
  },
  {
    rubrique: 'animations',
    conseilAr: 'الأنميشن يشرح حركة لا يُحفظ مكانها. شاهده مرة بلا توقّف، ثم أعد وصفه بكلماتك.',
    gesteAr: 'اصرخ الجواب بصوتك بعد المشاهدة.',
  },
] as const;

/**
 * Le conseil d'une rubrique, ou `null` si elle n'en a pas.
 *
 * `null` est une réponse normale : la plupart des écrans n'ont pas de méthode à
 * enseigner, et parler pour ne rien dire est la faute la plus commune des
 * applications éducatives.
 */
export function conseilDeRubrique(rubrique: string | null | undefined): ConseilRubrique | null {
  if (typeof rubrique !== 'string') return null;
  return CONSEILS_RUBRIQUES.find((c) => c.rubrique === rubrique) ?? null;
}
