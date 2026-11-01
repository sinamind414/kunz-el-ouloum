// tadwinCalibration.ts
// FICHES-MODÈLES de calibration du seuil C2 (docs/tadwin_decisions.md §8).
//
// Le seuil de couverture par-clé n'a pas été « supposé » : il est dérivé de la
// MESURE sur ces fiches (patron calibrationBac2025). Trois niveaux par unité :
//
//   · 'complete'  — réponse d'excellence, couvre TOUS les atomes de chaque clé.
//                   Sert de référence haute : elle doit rendre C2 = 1 à tout
//                   seuil ≤ 1 (rien à apprendre du seuil, c'est un témoin).
//   · 'concise'   — réponse d'excellence mais ÉCONOMIQUE : un bon élève cite
//                   l'essentiel, pas la liste complète des atomes. C'EST ELLE
//                   qui borne le seuil par le bas : si on exige plus de la
//                   moitié des atomes, une réponse excellente n'est plus
//                   créditéée → bug de seuil inatteignable (§7).
//   · 'fragile'   — réponse insuffisante / vague / hors-sujet. Elle borne le
//                   seuil par le haut : elle ne doit JAMAIS atteindre C2 = 1.
//
// CONTRAT D'ÉCRITURE (AGENTS.md R5) : prose فصحًى naturelle, aucun contenu
// inventé. Les atomes sont atteints par le vocabulaire naturel du cours, JAMAIS
// par énumération (une liste de mots-clés serait du bourrage, pas une réponse).
// Vérifié programmatiquement par tadwinCalibration.test.ts.
//
// RÉSULTAT DE LA MESURE (2026-09-30) : les fiches 'concise' exigent
//   · 1 atome sur 2 pour 7 clés (u3 k3, u4 k2/k3, u7 k1, u8 k3, u9 k1/k3, u11 k2)
//   · 2 atomes sur 3 pour 3 clés (u1 k1, u5 k1, u10 k2)
//   · 3 atomes sur 5 pour 1 clé (u11 k1)
// Tout seuil > 0,5 casse au moins une fiche 'concise' (test de gel ci-dessous).
// Le seuil est donc figé à 0,5 — maximum tolérable, mesuré, jamais supposé.

export type NiveauFiche = 'complete' | 'concise' | 'fragile';

export interface FicheCalibration {
  uniteId: number;
  niveau: NiveauFiche;
  /** Réponse-modèle en prose فصحًى (jamais une liste de mots-clés). */
  reponse: string;
}

export const TADWIN_FICHES: FicheCalibration[] = [
  // ── Unité 1 — تركيب البروتين ──────────────────────────────────────────────
  {
    uniteId: 1,
    niveau: 'complete',
    reponse:
      'تتمثل المرحلة الأولى من التعبير المورثي في استنساخ المعلومة الوراثية داخل النواة، ' +
      'حيث تتدخل إنزيمة ARN بوليميراز لتركيب جزيئة ARNm انطلاقاً من إحدى سلسلتي ADN. ' +
      'ثم تغادر هذه الجزيئة النواة متجهة نحو الهيولى، فترتبط بالريبوزوم لتبدأ عملية الترجمة: ' +
      'يقرأ الريبوزوم الرامزة تباعاً، وتحضر ARNt الحمض الأميني المقابل، ' +
      'فتتكون سلسلة بيبتيدية ثم بروتين وظيفي.',
  },
  {
    uniteId: 1,
    niveau: 'concise',
    reponse:
      'يتم استنساخ ADN بواسطة إنزيمة ARN بوليميراز، فينتج ARNm، ' +
      'ثم تتم عملية الترجمة على الريبوزوم بقراءة الرامزة.',
  },
  {
    uniteId: 1,
    niveau: 'fragile',
    reponse:
      'تلعب البروتينات أدواراً متعددة في الخلية، فهي تتدخل في بنية الجسم ' +
      'وفي تنظيم الوظائف الحيوية، مما يجعلها جزيئات أساسية للحياة.',
  },

  // ── Unité 2 — العلاقة بين بنية ووظيفة البروتين ───────────────────────────
  {
    uniteId: 2,
    niveau: 'complete',
    reponse:
      'تتحدد البنية الأولية للبروتين بتسلسل الأحماض الأمينية المرتبطة بواسطة روابط ببتيدية، ' +
      'في حين تنشأ البنية الفراغية عن التفافات السلسلة وطياتها في الفضاء. ' +
      'وتتجلى العلاقة بين بنية البروتين ووظيفته في أن أي تعديل في البنية ' +
      'يتبعه تغيير في وظيفة الجزيئة كلياً.',
  },
  {
    uniteId: 2,
    niveau: 'concise',
    reponse:
      'يحدد تسلسل الأحماض الأمينية البنية الأولية، وتحدد طيات السلسلة البنية الفراغية ' +
      'التي تتحكم في وظيفة البروتين.',
  },
  {
    uniteId: 2,
    niveau: 'fragile',
    reponse: 'البروتين جزيئة لها بنية ووظيفة في الجسم.',
  },

  // ── Unité 3 — النشاط الإنزيمي للبروتينات ─────────────────────────────────
  {
    uniteId: 3,
    niveau: 'complete',
    reponse:
      'يتمركز النشاط الإنزيمي للبروتينات في الموقع الفعّال للإنزيم، وهو منطقة محددة من البنية الثالثية ' +
      'تتلائم مع شكل الركيزة. ويتأثر هذا النشاط بدرجة الحرارة ودرجة الحموضة، ' +
      'حيث يمكن أن يتعرض الإنزيم لتخريب غير عكسي يؤدي إلى فقدان البنية الثالثية ' +
      'وتوقّف نشاطه نهائياً.',
  },
  {
    uniteId: 3,
    niveau: 'concise',
    reponse:
      'يقع نشاط الإنزيم في الموقع الفعّال الذي تتحدد شكله البنية الثالثية، ' +
      'وكل تخريب غير عكسي لهذه البنية يلغي نشاطه.',
  },
  {
    uniteId: 3,
    niveau: 'fragile',
    reponse: 'الإنزيمات بروتينات تسهّل التفاعلات الكيميائية الحيوية في الجسم.',
  },

  // ── Unité 4 — دور البروتينات في الدفاع عن الذات ─────────────────────────
  {
    uniteId: 4,
    niveau: 'complete',
    reponse:
      'تقوم الخلية اللمفاوية LT4 بالتنسيق بين مختلف الخلايا المناعتية، ' +
      'فتفرز الأنترلوكينات، وفي مقدمتها IL2، التي تحفز تكاثر الخلايا اللمفاوية. ' +
      'وتؤمن الخلايا الذاكرة استجابة سريعة عند دخول نفس المستضد ثانية، ' +
      'بينما يعتمد فيروس VIH على إنزيم الاستنساخ العكسي لتحويل ARN الفيروسي إلى ADN.',
  },
  {
    uniteId: 4,
    niveau: 'concise',
    reponse: 'يقوم LT4 بدور التنسيق المناعتي، ويفرز IL2، وتبقى الخلايا الذاكرة.',
  },
  {
    uniteId: 4,
    niveau: 'fragile',
    reponse: 'تدافع المناعة عن الجسم ضد الجراثيم بواسطة الأجسام المضادة.',
  },

  // ── Unité 5 — دور البروتينات في الاتصال العصبي ──────────────────────────
  {
    uniteId: 5,
    niveau: 'complete',
    reponse:
      'عند وصول السيال العصبي إلى النهاية المحورية، يدخل أيون الكالسيوم Ca²⁺ ' +
      'فيؤدي إلى اندماج الحويصلات المشبكية مع الغشاء قبل المشبكي وتحرير المبلّغ العصبي ' +
      'في الشق المشبكي. ثم يرتبط هذا الأخير بمستقبل على غشاء الخلية بعد المشبكي ' +
      'فتتولد سيالة بعد مشبكية PPSE. وتنتهي عملية النقل المشبكي بتدخل إنزيم أستيل كولين إستراز.',
  },
  {
    uniteId: 5,
    niveau: 'concise',
    reponse:
      'يحرّر دخول Ca²⁺ المبلّغ العصبي نحو مستقبل فيظهر PPSE، ' +
      'ثم يتدخل أستيل كولين إستراز.',
  },
  {
    uniteId: 5,
    niveau: 'fragile',
    reponse: 'تنقل الأعصاب الإشارات الكهربائية في الجسم بسرعة فائقة.',
  },

  // ── Unité 6 — التركيب الضوئي ──────────────────────────────────────────────
  {
    uniteId: 6,
    niveau: 'complete',
    reponse:
      'تنقسم عملية التركيب الضوئي إلى مرحلتين: تحدث المرحلة الكيموضوئية في الثايلاكويدات ' +
      'حيث يتم التحليل الضوئي للماء، وتتحول الطاقة الضوئية إلى طاقة كيميائية ' +
      'على شكل NADPH,H⁺ و ATP. ثم تستخدم هذه الجزيئات في المرحلة الكيميائية الحيوية ' +
      'حيث تثبّت حلقة كالفن غاز CO₂ وتختزله إلى سكر.',
  },
  {
    uniteId: 6,
    niveau: 'concise',
    reponse:
      'تتم في المرحلة الكيموضوئية عملية التحليل الضوئي للماء، ' +
      'وتنتج NADPH و ATP، وتثبت حلقة كالفن CO₂.',
  },
  {
    uniteId: 6,
    niveau: 'fragile',
    reponse: 'تصنع النباتات غذاءها مستغلة ضوء الشمس والماء والهواء.',
  },

  // ── Unité 7 — تحويل الطاقة الكيميائية إلى ATP ─────────────────────────────
  {
    uniteId: 7,
    niveau: 'complete',
    reponse:
      'ينتج عن التنفّس الخلوي أكسدة المادة العضوية وانطلاق الطاقة، إذ يبلغ مردود التنفّس ' +
      '38 ATP لكل جزيئة غلوكوز، في حين لا يتجاوز مردود التخمّر 2 ATP. ' +
      'وتتمثل الفسفرة التأكسدية في تركيب ATP بواسطة تدفق الإلكترونات عبر سلسلة النواقل، ' +
      'حيث يُعتبر O₂ مستقبِل أخير للإلكترونات في التنفّس.',
  },
  {
    uniteId: 7,
    niveau: 'concise',
    reponse:
      'يوفر التنفّس 38 ATP للخلية، وتتم الفسفرة التأكسدية في الميتوكوندريات ' +
      'حيث يبقى O₂ مستقبِل أخير للإلكترونات.',
  },
  {
    uniteId: 7,
    niveau: 'fragile',
    reponse: 'تستمد الخلايا الطاقة الضرورية لنشاطها من الأغذية.',
  },

  // ── Unité 8 — التحوّلات الطاقوية فوق الخلوية ──────────────────────────────
  {
    uniteId: 8,
    niveau: 'complete',
    reponse:
      'خلال النهار، تجمع النبتة بين التركيب الضوئي والتنفّس، فتطلق O₂ عبر التركيب الضوئي ' +
      'وتستهلكه عبر التنفّس، بينما ينطلق CO₂ من التنفّس. ' +
      'أما في الليل، فيتوقف التركيب الضوئي ويستمر التنفّس فقط.',
  },
  {
    uniteId: 8,
    niveau: 'concise',
    reponse:
      'في النهار يجمع النبات بين التركيب الضوئي والتنفّس، ' +
      'أما ليلاً فيقتصر على التنفّس فقط، وينطلق CO₂.',
  },
  {
    uniteId: 8,
    niveau: 'fragile',
    reponse: 'تنمو النباتات وتتطور باستمرار طوال اليوم.',
  },

  // ── Unité 9 — النشاط التكتوني للصفائح ─────────────────────────────────────
  {
    uniteId: 9,
    niveau: 'complete',
    reponse:
      'تكشف دراسة الصخور عن أدلة حركة الصفائح التكتونية: فالمغنطة المتناظرة ' +
      '(Paleomagnétisme) للصخور البازلتية على جانبي الظهر المحيطي، ' +
      'وتزايد أعمار القاع بالابتعاد عن هذا الظهر، وتطابق القارات كأمريكا وأفريقيا، ' +
      'والقياسات الحالية بـ GPS.',
  },
  {
    uniteId: 9,
    niveau: 'concise',
    reponse:
      'تدل المغنطة المتناظرة وتزايد أعمار القاع بالابتعاد على تبعاد الصفائح، ' +
      'كما يؤكد تطابق القارات حركتها.',
  },
  {
    uniteId: 9,
    niveau: 'fragile',
    reponse: 'تتكون القشرة الأرضية من صفائح تتحرك ببطء شديد.',
  },

  // ── Unité 10 — بنية الكرة الأرضية ──────────────────────────────────────────
  {
    uniteId: 10,
    niveau: 'complete',
    reponse:
      'تستعمل دراسة باطن الأرض الموجات الزلزالية، حيث تنتشر الموجات S في الوشاح، ' +
      'ثم يحدث توقّف S عند الحد الفاصل بين الوشاح واللب، وهو ما يعرف بانقطاع غوتنبرغ. ' +
      'ويفسر هذا التوقف بوجود لب خارجي سائل، إذ لا يمكن للموجات S أن تنفذ في وسط سائل.',
  },
  {
    uniteId: 10,
    niveau: 'concise',
    reponse:
      'تتوقف الموجات S في الوشاح، ويدل توقّف S عند انقطاع غوتنبرغ على أن لب خارجي سائل.',
  },
  {
    uniteId: 10,
    niveau: 'fragile',
    reponse: 'تتكون الكرة الأرضية من عدة طبقات متتابعة.',
  },

  // ── Unité 11 — النشاط التكتوني والبنيات المرتبطة ──────────────────────────
  {
    uniteId: 11,
    niveau: 'complete',
    reponse:
      'ينتج عن غوص الصفيحة المحيطية تحوّلات في صخور القشرة، فيتشكل الشست الأزرق ' +
      'الغني بمعدن غلوكوفان دليلاً على تحوّل HP (ضغط مرتفع) و BT (حرارة منخفضة)، ' +
      'كما تتكون الإكلوجيت في ظروف الضغط المرتفع. ويعتبر الأوفيوليت شاهد محيط قديم أُغلق، ' +
      'في حين ينتج عن التصادم القاري تكون سلاسل جبلية.',
  },
  {
    uniteId: 11,
    niveau: 'concise',
    reponse:
      'يدل الشست الأزرق على تحوّل HP و BT، ويعتبر الأوفيوليت شاهد محيط قديم أُغلق، ' +
      'وينتج عن التصادم القاري سلاسل جبلية.',
  },
  {
    uniteId: 11,
    niveau: 'fragile',
    reponse: 'تتشكل الجبال بفعل الحركات التكتونية عبر ملايين السنين.',
  },
];

/** Fiches d'une unité (les 3 niveaux), dans l'ordre complete → concise → fragile. */
export function fichesDeUnite(uniteId: number): FicheCalibration[] {
  return TADWIN_FICHES.filter((f) => f.uniteId === uniteId);
}
