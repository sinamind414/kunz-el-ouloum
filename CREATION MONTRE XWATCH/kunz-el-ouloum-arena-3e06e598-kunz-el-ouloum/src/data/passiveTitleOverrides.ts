// passiveTitleOverrides.ts
// Titres d'affichage des leçons passives split (`_2`) alignés sur le TDM officiel
// du manuel (book_tdm_clean.md, 55 chapitres) et sur le contenu HTML réel (H1).
// Audit : docs/AUDIT_LECONS_PASSIVES_VS_LIVRE.md
// Remplace les questions-problèmes ("كيف...", "لماذا...") utilisées auparavant
// comme titres de cartes.

export const PASSIVE_TITLE_OVERRIDES: Record<string, string> = {
  // U1 — TDM §4 : الترجمة (contenu = شفرة وراثية + تنشيط أحماض أمينية)
  'phase1_chapitres_1_2_2': 'الترجمة',
  // U2 — بنية ووظيفة (TDM §2)
  'phase2_chapitres_3_4_2': 'مستويات البنية الفراغية للبروتينات',
  // U3 — إنزيمي (TDM §1)
  'phase3_chapitres_5_6_2': 'مفهوم الإنزيم وأهميته',
  // U3 — تأثير الحرارة (TDM §4)
  'phase4_chapitres_7_8_2': 'دراسة تأثير تغيرات درجة الحرارة على نشاط الإنزيم',
  // U4 — immunité (hors TDM : enrichissement ZDF/Rh présent dans le manuel)
  'phase5_chapitres_9_10_2': 'نظام الزمر الدموية ABO والعامل الريزوسي Rh',
  // U4 — المعقد المناعي (TDM §4)
  'phase6_chapitres_11_12_2': 'المعقد المناعي',
  // U4 — تحفيز الخلايا LB و LT (TDM §9)
  'phase7_chapitres_13_14_2': 'تحفيز الخلايا LB و LT',
  // U5 — neuro (TDM §5)
  'phase8_chapitres_15_16_2': 'كمون العمل',
  // U5 — الإدماج العصبي (TDM §6)
  'phase9_chapitres_17_18_2': 'آلية الإدماج العصبي',
  // D2-U1 — مقر التركيب الضوئي (TDM §2 ; image TDM p.6)
  'phase10_chapitres_19_20_2': 'مقر عملية التركيب الضوئي - ما فوق البنية للصانعة الخضراء',
  // D2-U1 — phase lumineuse (TDM §3)
  'phase11_chapitres_21_22_2': 'تفاعلات المرحلة الكيموضوئية (السلسلة الضوئية)',
  // D2-U1 — synthèse inter-mécanismes (hors intitulé TDM exact)
  'phase12_chapitres_23_24_2': 'التكامل بين المرحلتين وحصيلة التركيب الضوئي',
  // D2-U2 — حلقة كريبس (TDM §4)
  'phase13_chapitres_25_26_2': 'مراحل تفكك حمض البيروفيك (تفاعلات حلقة كريبس)',
  // D2-U2 — التخمر (TDM §6)
  'phase14_chapitres_27_28_2': 'آليات تحويل الطاقة الكيميائية الكامنة في وسط لا هوائي',
  // D2-U3 — hors manuel (إثراء ثقافي)
  'phase15_chapitres_29_30_2': 'دورة الطاقة والمادة في المحيط الحيوي (إثراء ثقافي)',
  // D3-U1 — حركات الصفائح (TDM §2)
  'phase16_chapitres_31_32_2': 'حركات الصفائح التكتونية (اتساع قاع المحيط والمغناطيسية القديمة)',
  // D3-U3 — المغمايتية المرتبطة بالغوص (TDM §5)
  'phase17_chapitres_33_34_2': 'اختفاء اللوح المحيطي والظواهر المرتبطة بالغوص',
  // D3-U1 — hors TDM exact (approfondissement program)
  'phase18_chapitres_35_36_2': 'تيارات الحمل الحراري (محرك الصفائح)',
  // D3-U2 — التركيب الكيميائي (TDM §2)
  'phase19_chapitres_37_38_2': 'التركيب الكيميائي لصخور القشرة الأرضية والمعطف (البرنس)',
  // D3-U3 — شواهد التقلص (TDM §7)
  'phase20_chapitres_39_40_2': 'شواهد التقلص (الطيات والفوالق)',
  // D3-U3 — التصادم القاري (TDM §6)
  'phase21_chapitres_41_42_2': 'التضاريس الناجمة عن التصادم',
  // D3-U3 — hors manuel (إثراء ثقافي)
  'phase22_chapitres_43_44_2': 'الموارد الجيولوجية والطاقوية في الجزائر (إثراء ثقافي)',
};
