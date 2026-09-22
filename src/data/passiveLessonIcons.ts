// passiveLessonIcons.ts — icônes de la navigation « icône après icône » des
// leçons passives (onglet الدروس → الدرس السلبي).
//
// Décision propriétaire 2026-09-22 : entrer dans un domaine doit montrer des
// ICÔNES d'unités, puis des ICÔNES de chapitres — une icône = une leçon, sur
// TOUTES les unités des leçons passives (D1 U1-U5, D2 U6-U8, D3 U9-U11).
//
// Ce module ne contient que des CLÉS (chaînes) : aucune dépendance à lucide-react
// côté data — la vue `LessonsView.tsx` résout la clé en composant (ICONES).
// Verrou : passiveLessonIcons.test.ts (les 11 unités couvertes, clés licites,
// déterminisme).

/** Clés licites = composants lucide réellement importés par LessonsView. */
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
