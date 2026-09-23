// lessonIcons.ts — icônes de la navigation « icône après icône » des leçons.
//
// Décision propriétaire 2026-09-22, étendue le même jour aux 3 rubriques :
//   • الدرس النشيط (leçons actives TS)  : icônes d'unités → icônes de leçons ;
//   • الدرس السلبي (leçons passives HTML): icônes d'unités → icônes de chapitres ;
//   • بنك الحفظ (عكاشة)                  : icônes de domaines → icônes d'unités.
// Principe : une icône = une entrée ; on avance icône après icône, sur TOUTES
// les unités (actives : 4 unités / 6 leçons · passives : 11 unités / 47 chapitres
// · حفظ : 10 unités).
//
// Ce module ne contient que des CLÉS (chaînes) : aucune dépendance à lucide-react
// côté data — le composant `src/components/Icone.tsx` résout la clé (Record
// exhaustif : une clé licite sans composant casse la compilation).
// Verrou : lessonIcons.test.ts.

/** Clés licites = composants réellement résolus par src/components/Icone.tsx. */
export const ICONES_AUTORISEES = [
  'Dna',
  'Boxes',
  'Gauge',
  'ShieldCheck',
  'Brain',
  'Sun',
  'Flame',
  'BatteryCharging',
  'Earth',
  'Layers',
  'Mountain',
  'Activity',
  'Microscope',
  'FileText',
  'Compass',
  'Grid3x3',
  'Lightbulb',
  'Target',
] as const;

export type IconeCle = (typeof ICONES_AUTORISEES)[number];

/** Icône-repère d'une unité (1..11 — catalogue INITIAL_UNITS). */
export const UNIT_ICON_KEY: Record<number, IconeCle> = {
  1: 'Dna',              // تركيب البروتين
  2: 'Boxes',            // العلاقة بين بنية ووظيفة البروتين
  3: 'Gauge',            // النشاط الإنزيمي
  4: 'ShieldCheck',      // المناعة
  5: 'Brain',            // الاتصال العصبي
  6: 'Sun',              // التركيب الضوئي
  7: 'Flame',            // التنفس الخلوي والتخمر
  8: 'BatteryCharging',  // الحصيلة الطاقوية
  9: 'Earth',            // النشاط التكتوني للصفائح
  10: 'Layers',          // بنية الكرة الأرضية
  11: 'Mountain',        // البنيات الجيولوجية
};

/** Icône d'unité, avec repli neutre si l'unité est inconnue. */
export function uniteIcone(unitId: number): IconeCle {
  return UNIT_ICON_KEY[unitId] ?? 'FileText';
}

/**
 * Règles d'appariement chapitre → icône. L'ORDRE COMPTE (première règle qui
 * matche gagne) : « النشاط الإنزيمي وعلاقته ببنية الإنزيم » doit donner Gauge
 * (enzyme) et non Boxes (بنية) — d'où Gauge placé avant Boxes ; « الطاقة
 * الداخلية للكرة الأرضية » doit donner Layers et non Battery — d'où Earth et
 * Layers avant BatteryCharging.
 */
const REGLES: { icone: IconeCle; mots: string[] }[] = [
  { icone: 'Dna', mots: ['ADN', 'الشفرة', 'المورثة', 'وراثي', 'الوراثية', 'استنساخ', 'الاستنساخ', 'الأمينية', 'نكليوتيد', 'الصبغي', 'النووي'] },
  { icone: 'ShieldCheck', mots: ['الذات', 'اللاذات', 'HLA', 'CMH', 'الزمرة', 'الريزوسي', 'ABO', 'الأجسام', 'المضادة', 'المناعي', 'اللمفاوي', 'البلعمة', 'المعقد', 'LTc', 'LB', 'التعاون', 'التحفيز', 'الانتقاء'] },
  { icone: 'Brain', mots: ['العصبي', 'الكمون', 'الراحة', 'العمل', 'المشبكي', 'المشابك', 'كولين', 'ACh', 'الإدماج', 'PPSE', 'PPSI', 'المخدرات'] },
  { icone: 'Sun', mots: ['الضوئي', 'الضوئية', 'كالفن', 'الصانعة', 'الخضراء', 'الكيموضوئية'] },
  { icone: 'Flame', mots: ['التنفس', 'التخمر', 'كريبس', 'الغليكوز', 'البيروفيك', 'السكري', 'التأكسدية', 'الأكسدة', 'الهوائية'] },
  { icone: 'Earth', mots: ['الصفائح', 'التكتوني', 'الزلزالية', 'الزلزالي', 'الغوص', 'الحمل', 'التيارات', 'الحرارية', 'التصادم', 'الاصطدام', 'اللوح', 'المحيطي'] },
  { icone: 'Layers', mots: ['الداخلية', 'البينية', 'الكرة', 'الوشاح', 'القشرة', 'نموذج'] },
  { icone: 'Mountain', mots: ['الفوالق', 'الطي', 'الترسيب', 'الصخور', 'الموارد', 'المغماتية', 'المتحولة', 'الغرانيت', 'البرنس', 'الجيولوجية', 'التشكل', 'شواهد'] },
  { icone: 'BatteryCharging', mots: ['الطاقة', 'الطاقو', 'ATP', 'NADPH', 'الحصيلة', 'الإلكترونات', 'الفسفرة'] },
  { icone: 'Gauge', mots: ['الإنزيم', 'إنزيم', 'أنزيم', 'pH'] },
  { icone: 'Boxes', mots: ['البروتين', 'الترجمة', 'الريبوزوم', 'الفراغية', 'التخصص', 'تركيب'] },
];

/**
 * Icône d'un chapitre : règle sémantique sur le titre, repli sur l'icône de
 * l'unité (ainsi, aucune icône n'est jamais vide).
 */
export function chapitreIcone(titre: string, unitId: number): IconeCle {
  for (const regle of REGLES) {
    if (regle.mots.some((m) => titre.includes(m))) return regle.icone;
  }
  return uniteIcone(unitId);
}

// ---------------------------------------------------------------------------
// بنك الحفظ (عكاشة) — icônes des unités du livre et des sections de méthodologie.
// Cartes EXPLICITES (pas de règles sémantiques) : les identifiants sont figés par
// okacha.lock.test.ts / okachaEnriched.lock.test.ts, et le verrou de ce module
// exige une icône pour chaque identifiant réellement présent.
// ---------------------------------------------------------------------------

/** Icône de repli d'un domaine de بنك الحفظ (1 protéines / 2 énergie / 3 tectonique). */
export const OKACHA_DOMAINE_ICON_KEY: Record<number, IconeCle> = {
  1: 'Dna',
  2: 'BatteryCharging',
  3: 'Earth',
};

/** Icône-repère de chaque unité du livre عكاشة (ids « dXuY »). */
export const OKACHA_UNIT_ICON_KEY: Record<string, IconeCle> = {
  d1u1: 'Dna',           // تركيب البروتين
  d1u2: 'Boxes',         // العلاقة بين بنية ووظيفة البروتين
  d1u3: 'Gauge',         // النشاط الإنزيمي للبروتينات
  d1u4: 'ShieldCheck',   // دور البروتينات في الدفاع عن الذات
  d1u5: 'Brain',         // الاتصال العصبي
  d2u1: 'Sun',           // تحويل الطاقة الضوئية إلى طاقة كيميائية كامنة
  d2u2: 'BatteryCharging', // تحويل الطاقة الكيميائية الكامنة إلى طاقة قابلة للاستعمال
  d3u1: 'Layers',        // بنية الكرة الأرضية
  d3u2: 'Earth',         // الصفائح التكتونية
  d3u3: 'Mountain',      // الظواهر المرتبطة بالنشاط التكتوني
};

/** Icône d'une unité de بنك الحفظ ; repli = icône de son domaine. */
export function okachaUniteIcone(id: string, domaine: number): IconeCle {
  return OKACHA_UNIT_ICON_KEY[id] ?? OKACHA_DOMAINE_ICON_KEY[domaine] ?? 'FileText';
}

/** Icône de chaque section de méthodologie عكاشة (ordre du livre). */
export const METHODO_ICON_KEY: Record<string, IconeCle> = {
  intro: 'Compass',       // مقدمة المنهجية — قواعد العمل
  hikala: 'FileText',     // هيكلة الموضوع — التمهيد، الوثائق، التعليمة
  tamarin1: 'Grid3x3',    // التمرين الأول — أسئلة استرداد الموارد
  tahil: 'Microscope',    // التحليل — استغلال الوثيقة
  tafsir: 'Lightbulb',    // التفسير — من الملاحظة إلى العلّة
  mouqarana: 'Boxes',     // المقارنة — التشابه والاختلاف
  istinj: 'Target',       // الاستنتاج — خاص وعام
  istidlal: 'Activity',   // الاستدلال العلمي ومعاييره
};

/** Icône d'une section de méthodologie ; repli neutre si la section est nouvelle. */
export function methodoIcone(id: string): IconeCle {
  return METHODO_ICON_KEY[id] ?? 'FileText';
}

