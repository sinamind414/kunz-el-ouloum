// curriculumOfficial.ts
// Curriculum officiel 3AS Sciences expérimentales — extrait mot à mot des 2 sources
// officielles du Ministère (جوان 2017) :
//   [L5] التدرج السنوي للتعلمات (docs/sources/التدرج-السنوي-للتعلمات-2017.txt)
//   [L6] دليل الأستاذ (docs/sources/دليل-الأستاذ-2017.txt)
//
// Règle d'or du curriculum (L5, p.6) : « يمتحن التلميذ على ما جاء في المنهاج
// (المعارف المشتركة) وليس على المحتوى المعرفي الموجود في الكتاب المدرسي ».
// NON_EXIGIBLES liste donc les contenus du manuel explicitement écartés.

export type Trimestre = 1 | 2 | 3;

export interface ProgressionOfficielle {
  uniteId: number;
  domaine: 1 | 2 | 3;
  titre: string;
  /** Volume horaire officiel en heures (L5, colonne تقدير الحجم الزمني). */
  heures: number;
  /** Nombre de semaines officiel (L5). */
  semaines: number;
  /** Fenêtre officielle (L5, colonne شهر) — libellé tel que dans le document. */
  fenetre: string;
  trimestre: Trimestre;
  /** Compétence de base visée (L5, colonne الكفاءة القاعدية). */
  competence: string;
  /** Ressources ciblées mot à mot (L5, colonne الموارد المستهدفة). */
  ressourcesCiblees: string[];
}

/** Contenus du MANUEL explicitement non exigibles au BAC (L5, p.6). */
export const NON_EXIGIBLES: ReadonlyArray<{
  terme: string;
  raison: string;
}> = [
  { terme: 'المتمم', raison: 'ورد في الكتاب المدرسي ولم يرد في المنهاج' },
  { terme: 'مبدأ الأسيلوسكوب', raison: 'ورد في الكتاب المدرسي ولم يرد في المنهاج' },
  { terme: 'نضج الـ ARNm', raison: 'ورد في الكتاب المدرسي ولم يرد في المنهاج' },
];

/**
 * Progression annuelle officielle — 11 unités (L5, pp.3-6 + tableaux par unité).
 * Fenêtres et volumes : 8h/2sem (U1, sept), 5h (U2, U3, oct), 18h/4sem (U4,
 * mi-oct → nov), 15h/3sem (U5, déc → mi-janv, encadrée par les devoirs du 1er
 * trimestre), 15h/3sem (U6, mi-janv → mi-févr), 15h/3sem (U7, mi-févr → mars),
 * 2h/0,5sem (U8, après les devoirs du 2e trimestre), 10h/2sem (U9, avr),
 * 2h/3sem* (U10), 13h (U11, 3e trimestre).
 * * L5 annonce 2h + « 3 أسابيع » pour U10 ; cohérence conservée telle quelle.
 */
export const PROGRESSION_OFFICIELLE: ReadonlyArray<ProgressionOfficielle> = [
  {
    uniteId: 1,
    domaine: 1,
    titre: 'تركيب البروتين',
    heures: 8,
    semaines: 2,
    fenetre: 'من الأسبوع الثاني لشهر سبتمبر إلى الأسبوع الرابع لشهر سبتمبر',
    trimestre: 1,
    competence: 'يحدد آليات تركيب البروتين',
    ressourcesCiblees: [
      'مقر تركيب البروتين',
      'انتقال المعلومة الوراثية من النواة إلى مقر تركيب البروتين',
      'استنساخ المعلومة الوراثية الموجودة في الـ ADN',
      'حل شفرة المعلومة الممثلة بتتالي نيكليوتيدات الـ ARNm',
      'مقر تركيب البروتين في الهيولى وشروط التركيب',
    ],
  },
  {
    uniteId: 2,
    domaine: 1,
    titre: 'العلاقة بين بنية ووظيفة البروتين',
    heures: 5,
    semaines: 1,
    fenetre: 'الأسبوع الأول من أكتوبر',
    trimestre: 1,
    competence: 'يجد العلاقة بين البنية والتخصص الوظيفي للبروتين',
    ressourcesCiblees: [
      'تدخل الأحماض الأمينية في تشكيل البروتين وفي تحديد بنيته الفراغية ثلاثية الأبعاد',
    ],
  },
  {
    uniteId: 3,
    domaine: 1,
    titre: 'النشاط الإنزيمي للبروتينات',
    heures: 5,
    semaines: 1,
    fenetre: 'الأسبوع الثاني من أكتوبر',
    trimestre: 1,
    competence: 'يظهر التخصص الوظيفي للبروتينات في التحفيز الأنزيمي',
    ressourcesCiblees: [
      'التخصص الوظيفي للأنزيمات وعلاقته بالبنية',
      'تشكل معقد أنزيم-مادة تفاعل وتخصصه بالنسبة للتفاعل ولمادة التفاعل',
      'شروط الوسط المثلى لعمل الأنزيم',
    ],
  },
  {
    uniteId: 4,
    domaine: 1,
    titre: 'دور البروتينات في الدفاع عن الذات',
    heures: 18,
    semaines: 4,
    fenetre: 'من الأسبوع الثالث لأكتوبر إلى نهاية شهر نوفمبر',
    trimestre: 1,
    competence: 'يظهر التخصص الوظيفي للبروتينات في الدفاع عن الذات',
    ressourcesCiblees: [
      'التمييز بين الذات واللاذات',
      'مظاهر التعرف على اللاذات',
      'التخلص من المعقد المناعي',
      'مصدر الأجسام المضادة',
      'طريقة تأثير الخلايا اللمفاوية التائية',
      'مصدر الخلايا اللمفوية التائية السامة',
      'آلية تحفيز الخلايا البائية والتائية',
      'اختيار نمط الاستجابة المناعية المناسبة',
      'سبب العجز الجهاز المناعي على التصدي لفيروس VIH',
    ],
  },
  {
    uniteId: 5,
    domaine: 1,
    titre: 'دور البروتينات في الاتصال العصبي',
    heures: 15,
    semaines: 3,
    fenetre: 'الأسبوع الثاني من ديسمبر إلى الأسبوع الثالث من جانفي',
    trimestre: 1,
    competence: 'يظهر التخصص الوظيفي للبروتينات في الاتصال العصبي',
    ressourcesCiblees: [
      'آلية النقل المشبكي بواسطة المبلغات العصبية',
      'ترجمة الرسالة العصبية قبل مشبكية في مستوى الشق المشبكي',
      'مصدر وثبات الكمون الغشائي أثناء الراحة على مستوى غشاء الليف العصبي',
      'مصدر كمون العمل على مستوى الليف العصبي',
      'آلية الإدماج العصبي',
      'تأثير المخدرات في مستوى المشابك',
    ],
  },
  {
    uniteId: 6,
    domaine: 2,
    titre: 'آليات تحويل الطاقة الضوئية إلى طاقة كيميائية كامنة',
    heures: 15,
    semaines: 3,
    fenetre: 'الأسبوع الرابع من جانفي إلى الأسبوع الثاني من فيفري',
    trimestre: 2,
    competence: 'يعرف آليات تحويل الطاقة الضوئية إلى طاقة كيميائية كامنة في الجزيئات العضوية',
    ressourcesCiblees: [
      'آلية المرحلة الكيموضوئية',
      'آلية انتقال الإلكترونات عبر السلسلة التركيبية الضوئية',
      'مصير البروتونات الناتجة عن التحلل الضوئي للماء والتي تنقل من الحشوة إلى تجويف التيلاكوئيد',
      'آلية إرجاع الـ CO2 على مستوى الحشوة وتركيب جزيئات عضوية',
    ],
  },
  {
    uniteId: 7,
    domaine: 2,
    titre: 'آليات تحويل الطاقة الكامنة في الجزيئات العضوية إلى ATP',
    heures: 15,
    semaines: 3,
    fenetre: 'الأسبوع الثالث من فيفري إلى الأسبوع الثاني من مارس',
    trimestre: 2,
    competence: 'يحدد آليات تحويل الطاقة الكامنة في الجزيئات العضوية إلى طاقة قابلة للاستعمال ATP',
    ressourcesCiblees: [
      'آليات تحويل الطاقة الكيميائية الكامنة في المواد العضوية إلى طاقة على شكل ATP',
      'آلية تحويل الطاقة الكامنة في الجزيئات العضوية للغلوكوز إلى الـ ATP في غياب الأكسجين',
      'التركيب الكيميائي لجزيئة الـ ATP',
      'مختلف النشاطات الحيوية المستهلكة للـ ATP',
    ],
  },
  {
    uniteId: 8,
    domaine: 2,
    titre: 'تحويل الطاقة على المستوى ما فوق البنية الخلوية',
    heures: 2,
    semaines: 0.5,
    fenetre: 'بعد اختبارات الفصل الثاني (عطلة الربيع)',
    trimestre: 2,
    competence: 'ينشئ مخططا تحصيليا للتحولات الطاقوية على المستوى الخلوي',
    ressourcesCiblees: [
      'مخطط تحصيلي للتحولات الطاقوية على المستوى الخلوي',
    ],
  },
  {
    uniteId: 9,
    domaine: 3,
    titre: 'النشاط التكتوني للصفائح',
    heures: 10,
    semaines: 2,
    fenetre: 'الأسبوع الأول من أفريل إلى الأسبوع الثاني من أفريل',
    trimestre: 3,
    competence: 'يقترح تفسيرا للنشاط التكتوني للصفائح',
    ressourcesCiblees: [
      'التضاريس المميزة لحدود الصفائح التكتونية',
      'مظاهر حركة التباعد وعواقبها على مستوى الكرة الأرضية',
      'عواقب التوسع المحيطي على مستوى الكرة الأرضية',
      'المحرك الدافع لزحزحة الصفائح التكتونية',
    ],
  },
  {
    uniteId: 10,
    domaine: 3,
    titre: 'بنية الكرة الأرضية',
    heures: 2,
    semaines: 3,
    fenetre: 'الفصل الثالث',
    trimestre: 3,
    competence: 'يصف نموذج بنية الكرة الأرضية اعتمادا على معطيات سيسمولوجية',
    ressourcesCiblees: [
      'نموذج لبنية الكرة الأرضية يتضمن الأغلفة والانقطاعات',
      'التركيب الكيميائي للمعطف (البرنس)',
    ],
  },
  {
    uniteId: 11,
    domaine: 3,
    titre: 'النشاط التكتوني والبنيات الجيولوجية المرتبطة به',
    heures: 13,
    semaines: 0,
    fenetre: 'الفصل الثالث',
    trimestre: 3,
    competence: 'يتعرف على البنيات الجيولوجية والظواهر المرتبطة بالنشاط التكتوني',
    ressourcesCiblees: [
      'التضاريس والظواهر المرتبطة بالبناء على مستوى الظهرات',
      'التضاريس والظواهر المرتبطة بالبناء على مستوى مناطق الغوص',
      'الحوادث التي تعقب الغوص علما أن قلة كثافة الليتوسفير القاري لا تسمح له بالغوص',
    ],
  },
];

/** Compétences de base par domaine (L6, §منهاج السنة الثالثة). */
export const COMPETENCES_OFFICIELLES: Readonly<Record<1 | 2 | 3, string>> = {
  1: 'يقدم بناء على أسس علمية إرشادات لمشكل اختلال وظيفي عضوي، بتجنيد المعارف المتعلقة بالاتصال على مستوى الجزيئات الحاملة للمعلومة',
  2: 'يقترح نموذجا تفسيريا لحركية الطاقة الخلوية على أساس المعارف المتعلقة بتحويل الطاقة على مستوى البنيات فوق الخلوية',
  3: 'يقترح نماذج تفسيرية للحركية الداخلية للأرض ولبنية القشرة الأرضية على أساس المعارف المتعلقة بالتكتونية العامة',
};

/** La démarche officielle en 5 étapes (L5, colonne السير المنهجي). */
export const DEMARCHE_5_ETAPES: ReadonlyArray<string> = [
  'تقويم تشخيصي للمكتسبات القبلية المتعلقة بالموارد المستهدفة',
  'اقتراح وضعية مشكل انطلاقية تطرح تساؤلات',
  'طرح وضعيات مشكل تعلمية جزئية تتعلق بالموارد المستهدفة',
  'تناول وضعيات تقييمية من نفس عائلة الوضعية الانطلاقية',
  'معالجة بيداغوجية محتملة',
];

export function getProgressionUnite(uniteId: number): ProgressionOfficielle | undefined {
  return PROGRESSION_OFFICIELLE.find((p) => p.uniteId === uniteId);
}

export function getTotalHeuresParTrimestre(): Record<Trimestre, number> {
  const acc: Record<Trimestre, number> = { 1: 0, 2: 0, 3: 0 };
  for (const p of PROGRESSION_OFFICIELLE) acc[p.trimestre] += p.heures;
  return acc;
}

/** Un terme du manuel est-il officiellement non exigible au BAC ? */
export function estNonExigible(terme: string): { flag: 'HORS_PROGRAMME'; raison: string } | null {
  const t = terme.trim();
  for (const n of NON_EXIGIBLES) {
    if (t === n.terme || t.includes(n.terme)) {
      return { flag: 'HORS_PROGRAMME', raison: n.raison };
    }
  }
  return null;
}
