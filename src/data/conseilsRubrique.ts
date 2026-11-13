// conseilsRubrique.ts — CE QU'UN PROFESSEUR DIT EN ENTRANT DANS UNE SALLE.
//
// POURQUOI CE FICHIER EXISTE (14/10/2026, demande de l'utilisateur : « je veux
// que le tutor morchid parle quand tu rentres à une rubrique, donne des conseils
// comme un prof »).
//
// VERSION OPTION B (2026-11-05) : le guide parle à CHAQUE entrée de rubrique, et
// pas seulement à la première visite. Chaque rubrique dispose de 2 ou 3 conseils
// différents, servis en rotation — réentrer dans une rubrique donne un conseil
// nouveau, ce qui évite l'effet perroquet tout en maintenant la réaction.
//
// Chaque conseil est une CONSIGNE DE MÉTHODE, jamais une phrase d'encouragement.
// « Relis bien » ne sert à rien ; « prends un exercice et termine-le » change
// le geste. C'est la seule différence entre parler comme un prof et faire du bruit.
//
// Le ton est celui d'un professeur algérien qui s'adresse à un élève de 3AS :
// tutoiement, impératif, une seule idée par phrase, aucune flatterie.
// Arabe فصحى uniquement — jamais de dialecte algérien, jamais de mot étranger.
//
// Ce module est VOLONTAIREMENT LÉGER (des chaînes, rien d'autre) : il est
// importé par `App.tsx`, donc son poids compte au premier affichage.

/** Une consigne unique : idée + geste concret. */
export interface Conseil {
  /** Ce que le guide dit, en une phrase de professeur. */
  conseilAr: string;
  /** Le geste à faire tout de suite, court et vérifiable. */
  gesteAr: string;
}

/** Une rubrique avec ses conseils en rotation. */
export interface ConseilRubrique {
  /** Identifiant d'onglet réel d'`App.tsx` — jamais un nom de rubrique inventé. */
  rubrique: string;
  /** Les conseils en rotation (2 ou 3 minimum). */
  conseils: readonly Conseil[];
}

/**
 * Les conseils, par rubrique.
 *
 * Volontairement INCOMPLÈTE : toutes les rubriques ne méritent pas un discours.
 * `stats`, `badges`, `teacher`, `chat`, `moi`, `home`, `bootcamp`, `mindmap`,
 * `workshop`, `splash` n'ont pas de méthode à enseigner, et une rubrique absente
 * de cette table est simplement silencieuse — le silence reste la valeur par
 * défaut, comme pour la bulle du capitaine.
 */
export const CONSEILS_RUBRIQUES: readonly ConseilRubrique[] = [
  {
    rubrique: 'methodology',
    conseils: [
      {
        conseilAr:
          'مفتاح لا يُقرأ كالدرس — يُستعمل. خُذ إنتاجًا كتبتَه فعلًا وقارنه بمعايير الفعل، واكتب الخطأ الذي وقعت فيه.',
        gesteAr: 'افتح تمرينًا واحدًا وأكمل مرحلة واحدة فقط.',
      },
      {
        conseilAr:
          'قبل أن تفتح المفتاح، حدد أي معيار من المنهج ستطبقه، ثم قارن إنتاجك به مباشرة بعد الانتهاء.',
        gesteAr: 'اختر معيارًا واحدًا من بطاقة المنهجية وطبقه على إنتاج واحد.',
      },
    ],
  },
  {
    rubrique: 'training',
    conseils: [
      {
        conseilAr:
          'هنا نخسر النقاط بأمان. تمرين واحد أُنجز كاملًا أنفع من ثلاثة ناقصة، والتصحيح جزء من التمرين لا نهايته.',
        gesteAr: 'اختر تمرينًا واحدًا وحدّد أين ستتوقّف قبل أن تبدأ.',
      },
      {
        conseilAr:
          'كل تمرين غير مصحح هو وقت ضائع — لا تنتقل إلى التمرين التالي قبل قراءة التصحيح الكامل.',
        gesteAr: 'اقرأ التصحيح الكامل للتمرين قبل البدء في التالي.',
      },
    ],
  },
  {
    rubrique: 'examens',
    conseils: [
      {
        conseilAr:
          'المحاكاة تُقاس بالورقة والساعة، لا بالنقر. أغلق كل مساعدة قبل أن تضغط «ابدأ»، واكتب بخط يدك.',
        gesteAr: 'جهّز ورقة وقلمًا قبل البدء.',
      },
      {
        conseilAr:
          'امتحانًا واحدًا في ظروف حقيقية أنفع من عشرة اختبارات بدون ضغط زمني.',
        gesteAr: 'ضع الموقت على وقت الامتحان الحقيقي قبل البدء.',
      },
    ],
  },
  {
    rubrique: 'lesson',
    conseils: [
      {
        conseilAr:
          'اقرأ بسؤال في رأسك: «ماذا يريد مني المنهاج في هذه الوثيقة؟». القراءة بلا سؤال قراءة بلا أثر.',
        gesteAr: 'اكتب سؤالك على ورقة قبل أن تفتح الدرس.',
      },
      {
        conseilAr:
          'بعد قراءة الوثيقة، أغلقها واكتب ما تذكّره منها بكلماتك قبل العودة إلى النص.',
        gesteAr: 'اكتب ملخصًا من ذاكرتك بعد إغلاق الدرس.',
      },
    ],
  },
  {
    rubrique: 'review',
    conseils: [
      {
        conseilAr:
          'المراجعة المتباعدة تُستدعى ولا تُقرأ. أغلق الدفتر أولًا، ثم قل الجواب بصوتك، ثم تحقّق.',
        gesteAr: 'أجب من ذاكرتك قبل أن تكشف البطاقة.',
      },
      {
        conseilAr:
          'راجع ما نسيته، لا ما حفظته جيدًا — النسيان يدل على مكان الحاجة.',
        gesteAr: 'اختر بطاقة واحدة لم تتذكرها وراجعها فقط.',
      },
    ],
  },
  {
    rubrique: 'reviser',
    conseils: [
      {
        conseilAr:
          'المراجعة ليست إعادة قراءة. اختر ما لم تفهمه بعد، لا ما تحبّ مراجعته.',
        gesteAr: 'ابدأ بالمحور الذي أضعف درجاتك فيه.',
      },
      {
        conseilAr:
          'راجع المحور الضعيف مرة واحدة بعمق أفضل من مراجعة المحور القوي عشر مرات.',
        gesteAr: 'افتح الدرس في أضعف محورك واقرأ صفحة واحدة فقط.',
      },
    ],
  },
  {
    rubrique: 'tadwin',
    conseils: [
      {
        conseilAr:
          'التدوين للتلخيص بكلماتك أنت، لا لنسخ الدرس. إن استطعت النسخ فأنت لم تفهم بعد.',
        gesteAr: 'أغلق الدرس واكتب الفكرة من رأسك.',
      },
      {
        conseilAr:
          'اكتب ما فهمته من الدرس دون النظر إليه، ثم قارن ما كتبت بالنص الأصلي.',
        gesteAr: 'أغلق الدرس واكتب ثلاث أفكار تذكرها.',
      },
    ],
  },
  {
    rubrique: 'schemas',
    conseils: [
      {
        conseilAr:
          'ارسم قبل أن تنظر. الرسم من الذاكرة يكشف الثغرة التي يخفيها التعريف المحفوظ.',
        gesteAr: 'ارسم مرة واحدة بلا نظر، ثم قارن.',
      },
      {
        conseilAr:
          'الرسم المكتمل يُحفظ، لكن الرسم الناقص يعلّم أكثر — ركّز على ما يغيب من رسمك.',
        gesteAr: 'ارسم المخطط من الذاكرة، ثم أضف ما نقص بلون آخر.',
      },
    ],
  },
  {
    rubrique: 'focus',
    conseils: [
      {
        conseilAr: 'جلسة واحدة = هدف واحد. الهدف الغامض يتحوّل إلى تصفّح.',
        gesteAr: 'اكتب هدف الجلسة قبل تشغيل المؤقت.',
      },
      {
        conseilAr:
          'المؤقت يعمل فقط عندما تكتب هدفك قبل الضغط على البدء — بدون هدف، الوقت يضيع.',
        gesteAr: 'اكتب جملة واحدة تصف هدفك قبل تشغيل الموقت.',
      },
    ],
  },
  {
    rubrique: 'plan',
    conseils: [
      {
        conseilAr: 'الخطة تُبنى من الأيام المتبقية لا من الأمنيات. احسب أولًا، ثم وزّع.',
        gesteAr: 'اكتب عدد الأيام الباقية قبل أي شيء.',
      },
      {
        conseilAr: 'خطة اليوم الواحد أنفع من خطة الشهر كله إذا بدأت بها فورًا.',
        gesteAr: 'اكتب ثلاث مهام لهذا اليوم قبل أي تخطيط آخر.',
      },
    ],
  },
  {
    rubrique: 'situations',
    conseils: [
      {
        conseilAr:
          'الوضعية تُحلّل قبل أن تُحسب: استخرج المعطيات، ثم المطلوب، ثم ابدأ.',
        gesteAr: 'اشطب على كل معطاة لا تستعملها.',
      },
      {
        conseilAr:
          'قبل الحساب، اكتب ما يُعطى في الوضعية، ثم ما يُطلب منك العثور عليه.',
        gesteAr: 'اشطب على البيانات غير الضرورية قبل البدء.',
      },
    ],
  },
  {
    rubrique: 'bacideas',
    conseils: [
      {
        conseilAr:
          'أفكار التمارين للتعرف على أنماط السؤال لا لحفظ الحلول. سؤال الدورة يتكرر، والحل لا.',
        gesteAr: 'اكتب بنية السؤال قبل قراءة الحلّ.',
      },
      {
        conseilAr:
          'افترض أن سؤال الدورة القادم يشبه سؤالًا عامًا مضى، ثم حلله بنفسك قبل رؤية الحل.',
        gesteAr: 'اقرأ عنوان السؤال فقط واكتب كيف ستحله قبل الاطلاع على الحل.',
      },
    ],
  },
  {
    rubrique: 'stats',
    conseils: [
      {
        conseilAr: 'هذه أرقامك أنت. انظر إلى أضعف محور، لا إلى أجمل رقم.',
        gesteAr: 'حدّد المحور الأضعف ونم إلى الخطوة التالية.',
      },
      {
        conseilAr:
          'الأرقام لا تُحفظ للشكل، بل تُستخدم لتحريك الخطوة التالية — انظر فقط إلى المحور الأحمر.',
        gesteAr: 'افتح أضعف محور في إحصائياتك واقرأ ملاحظته مرة واحدة.',
      },
    ],
  },
  {
    rubrique: 'animations',
    conseils: [
      {
        conseilAr:
          'الأنميشن يشرح حركة لا يُحفظ مكانها. شاهده مرة بلا توقف، ثم أعد وصفه بكلماتك.',
        gesteAr: 'اصرخ الجواب بصوتك بعد المشاهدة.',
      },
      {
        conseilAr:
          'بعد المشاهدة، أغلق الشاشة وارسم ما حدث بالخطوات دون العودة إلى الفيديو.',
        gesteAr: 'ارسم خطوات الأنميشن من الذاكرة على ورقة فارغة.',
      },
    ],
  },
] as const;

/**
 * Le conseil d'une rubrique, ou `null` si elle n'en a pas.
 *
 * `null` est une réponse normale : la plupart des écrans n'ont pas de méthode à
 * enseigner, et parler pour ne rien dire est la faute la plus commune des
 * applications éducatives.
 */
export function conseilDeRubrique(
  rubrique: string | null | undefined
): ConseilRubrique | null {
  if (typeof rubrique !== 'string') return null;
  return CONSEILS_RUBRIQUES.find((c) => c.rubrique === rubrique) ?? null;
}

/** Tous les conseils à plat, pour les tests d'unicité. */
export function tousLesConseils(): readonly Conseil[] {
  return CONSEILS_RUBRIQUES.flatMap((cr) => [...cr.conseils]);
}
