// motivationCapsules.ts — Banque de « déclics » de motivation (Module Déclic)
// ---------------------------------------------------------------------------
// Pourquoi ce fichier existe
// --------------------------
// L'analyse comparative des chaînes YouTube (Oraco / Naglaa / Muhib) a montré
// que les vidéos les plus virales portent sur « comment étudier vite » et LA
// MOTIVATION (dopamine, déclic, routines). L'app maîtrisait déjà MÉMORISER et
// COMPRENDRE, ainsi que la gamification (streak, badges, objectif quotidien),
// mais il lui manquait le « carburant » : un déclic AVANT la session pour
// vaincre la procrastination et démarrer.
//
// Contrat d'écriture d'un déclic
//   1. Court : une à trois phrases, lisible en < 8 secondes.
//   2. Orienté ACTION : il pousse à commencer MAINTENANT, pas à culpabiliser.
//   3. Vrai : pas de promesse magique ; ton chaleureux et concret.
//   4. En arabe (langue de l'élève), registre proche et bienveillant.

export type DeclicCategorie =
  | 'demarrage'      // vaincre la procrastination, s'y mettre
  | 'perseverance'   // tenir dans la durée, jour après jour
  | 'avant_examen'   // approche du BAC, gestion du stress
  | 'apres_echec'    // rebondir après une mauvaise session
  | 'streak';        // renforcer une série en cours

export interface MotivationCapsule {
  /** Identifiant stable. */
  id: string;
  categorie: DeclicCategorie;
  /** Le message principal, 1 à 3 phrases. */
  texteAr: string;
  /** Micro-astuce actionnable (facultative), affichée en second. */
  astuceAr?: string;
}

/**
 * Banque de déclics. Élargissable librement : le composant tire au sort en
 * évitant de répéter le dernier message montré (voir MotivationDeclic.tsx).
 */
export const MOTIVATION_CAPSULES: ReadonlyArray<MotivationCapsule> = [
  // ── Démarrage / anti-procrastination ─────────────────────────────────────
  {
    id: 'dem_01',
    categorie: 'demarrage',
    texteAr: 'لا تنتظر أن تشعر بالرغبة. ابدأ، والرغبة تأتي بعد أول دقيقتين.',
    astuceAr: 'قاعدة الدقيقتين: افتح الدرس وذاكر دقيقتين فقط. غالبًا ستُكمل.',
  },
  {
    id: 'dem_02',
    categorie: 'demarrage',
    texteAr: 'الصفحة التي تؤجّلها اليوم هي نفسها التي ستخيفك ليلة الامتحان. اكسرها الآن.',
  },
  {
    id: 'dem_03',
    categorie: 'demarrage',
    texteAr: 'دماغك يكره البداية، لا المذاكرة. تجاوز أول 120 ثانية وسينطلق تلقائيًا.',
    astuceAr: 'أغلق الهاتف في غرفة أخرى قبل أن تبدأ.',
  },
  {
    id: 'dem_04',
    categorie: 'demarrage',
    texteAr: 'هدف اليوم ليس أن تُنهي كل شيء، بل أن تبدأ شيئًا واحدًا بإتقان.',
  },
  {
    id: 'dem_05',
    categorie: 'demarrage',
    texteAr: 'المذاكرة الآن أرخص من الندم في جوان. اجلس وابدأ جلسة قصيرة.',
  },

  // ── Persévérance / régularité ────────────────────────────────────────────
  {
    id: 'per_01',
    categorie: 'perseverance',
    texteAr: 'الانتظام يهزم الاجتهاد المتقطّع. ٢٥ دقيقة يوميًا خيرٌ من ٤ ساعات مرة في الأسبوع.',
  },
  {
    id: 'per_02',
    categorie: 'perseverance',
    texteAr: 'كل جلسة صغيرة هي لبنة. البكالوريا جدارٌ يُبنى يومًا بيوم، لا دفعة واحدة.',
  },
  {
    id: 'per_03',
    categorie: 'perseverance',
    texteAr: 'لن تتذكّر أنك كنت متعبًا اليوم؛ ستتذكّر أنك واصلت رغم التعب.',
  },
  {
    id: 'per_04',
    categorie: 'perseverance',
    texteAr: 'التفوّق ليس موهبة، بل عادة. كرّرها اليوم لتصبح تلقائية غدًا.',
    astuceAr: 'ذاكر في نفس المكان ونفس الوقت كل يوم لتثبيت العادة.',
  },

  // ── Avant l'examen ───────────────────────────────────────────────────────
  {
    id: 'exa_01',
    categorie: 'avant_examen',
    texteAr: 'التوتر دليل أنك تهتم. حوّله إلى وقود: راجع تمرينًا واحدًا الآن بتركيز.',
  },
  {
    id: 'exa_02',
    categorie: 'avant_examen',
    texteAr: 'في الامتحان لن تُسأل عمّا قرأته، بل عمّا تستطيع استرجاعه. درّب الاسترجاع اليوم.',
    astuceAr: 'أغلق الملخّص وحاول أن تكتب الفكرة من ذاكرتك أولًا.',
  },
  {
    id: 'exa_03',
    categorie: 'avant_examen',
    texteAr: 'كل يوم يفصلك عن البكالوريا هو فرصة، لا تهديد. استثمر هذا اليوم.',
  },

  // ── Après un échec / mauvaise session ────────────────────────────────────
  {
    id: 'ech_01',
    categorie: 'apres_echec',
    texteAr: 'الخطأ في التدريب أفضل هدية: يريك بالضبط ما يجب مراجعته قبل الامتحان.',
  },
  {
    id: 'ech_02',
    categorie: 'apres_echec',
    texteAr: 'جلسة أمس السيئة لا تُلغي مسيرتك. المهم أنك عدت اليوم. أكمل.',
  },
  {
    id: 'ech_03',
    categorie: 'apres_echec',
    texteAr: 'لا تقارن نفسك بغيرك، قارن نفسك بنفسك بالأمس. تقدّمٌ صغير اليوم يكفي.',
  },

  // ── Renforcement de série (streak) ───────────────────────────────────────
  {
    id: 'str_01',
    categorie: 'streak',
    texteAr: 'سلسلتك مشتعلة! لا تدع يومًا واحدًا يطفئ ما بنيته بجهد.',
  },
  {
    id: 'str_02',
    categorie: 'streak',
    texteAr: 'أنت في أفضل حالاتك. جلسة قصيرة اليوم تحافظ على الزخم.',
  },
];

/** Renvoie les déclics d'une catégorie (utile pour cibler le contexte). */
export function capsulesParCategorie(cat: DeclicCategorie): MotivationCapsule[] {
  return MOTIVATION_CAPSULES.filter((c) => c.categorie === cat);
}
