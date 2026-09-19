// passiveTitleOverrides.ts
// Titres d'affichage des leçons passives split (`_2`) alignés sur le TDM officiel
// du manuel (book_tdm_clean.md, 55 chapitres) et sur le contenu HTML réel (H1).
// Audit : docs/AUDIT_LECONS_PASSIVES_VS_LIVRE.md
// Remplace les questions-problèmes ("كيف...", "لماذا...") utilisées auparavant
// comme titres de cartes.

export const PASSIVE_TITLE_OVERRIDES: Record<string, string> = {
  // U1 — تركيب البروتين (TDM §1-5). lecon_transcription n'a pas de `_2`.
  'phase1_chapitres_1_2_2': 'الدرس 2 : الشفرة الوراثية وتنشيط الأحماض الأمينية',
  // U2 — بنية ووظيفة (TDM §2)
  'phase2_chapitres_3_4_2': 'الدرس 2 : مستويات البنية الفراغية للبروتينات',
  // U3 — إنزيمي (TDM §1)
  'phase3_chapitres_5_6_2': 'الدرس 1 : مفهوم الإنزيم وأهميته (الخصوصية المزدوجة)',
  // U3 — تأثير الحرارة (TDM §4)
  'phase4_chapitres_7_8_2': 'الدرس 4 : تأثير تغيرات درجة الحرارة على نشاط الإنزيم',
  // U4 — immunité (TDM §2)
  'phase5_chapitres_9_10_2': 'الدرس 2 : نظام الزمر الدموية ABO والعامل الريزوسي Rh',
  // U4 — المعقد المناعي (TDM §4)
  'phase6_chapitres_11_12_2': 'الدرس 4 : المعقد المناعي والتخلص منه (البلعمة)',
  // U4 — تحفيز الخلايا LB و LT (TDM §9)
  'phase7_chapitres_13_14_2': 'الدرس 9 : تحفيز الخلايا LB و LT (التعاون الخلوي)',
  // U5 — neuro (TDM §5)
  'phase8_chapitres_15_16_2': 'الدرس 5 : كمون العمل',
  // U5 — الإدماج العصبي (TDM §6)
  'phase9_chapitres_17_18_2': 'الدرس 6 : آلية الإدماج العصبي (PPSE / PPSI)',
  // D2-U1 — مقر التركيب الضوئي (TDM §2 ; phase10_2 déplacée en U6)
  'phase10_chapitres_19_20_2': 'الدرس 2 : مقر عملية التركيب الضوئي وما فوق بنية الصانعة الخضراء',
  // D2-U1 — السلسلة التركيبية الضوئية (TDM §3)
  'phase11_chapitres_21_22_2': 'الدرس 3 : آلية انتقال الإلكترونات والفسفرة الضوئية (ATP و NADPH)',
  // D2-U1 — التكامل والحصيلة (TDM §4 + حصيلة)
  'phase12_chapitres_23_24_2': 'الدرس 4 : التكامل بين المرحلتين وحصيلة التركيب الضوئي',
  // D2-U2 — حلقة كريبس (TDM §4)
  'phase13_chapitres_25_26_2': 'الدرس 4 : مراحل تفكك حمض البيروفيك (تفاعلات حلقة كريبس)',
  // D2-U2 — التخمر (TDM §6)
  'phase14_chapitres_27_28_2': 'الدرس 6 : آليات تحويل الطاقة في وسط لا هوائي (التخمر)',
  // D2-U3 — hors manuel (إثراء ثقافي)
  'phase15_chapitres_29_30_2': 'الدرس 6 : دورة الطاقة والمادة في المحيط الحيوي (إثراء ثقافي)',
  // D3-U1 — حركات الصفائح (TDM §2)
  'phase16_chapitres_31_32_2': 'الدرس 2 : حركات الصفائح التكتونية (اتساع قاع المحيط والمغناطيسية القديمة)',
  // D3-U3 — المغمايتية المرتبطة بالغوص (TDM §4/§5) ; phase17_2 déplacée en U11
  'phase17_chapitres_33_34_2': 'الدرس 5 : اختفاء اللوح المحيطي والمغمايتية المرتبطة بالغوص',
  // D3-U1 — تيارات الحمل (TDM §3)
  'phase18_chapitres_35_36_2': 'الدرس 6 : تيارات الحمل الحراري (محرك الصفائح)',
  // D3-U2 — التركيب الكيميائي (TDM §2)
  'phase19_chapitres_37_38_2': 'الدرس 2 : التركيب الكيميائي لصخور القشرة الأرضية والمعطف (البرنس)',
  // D3-U3 — شواهد التقلص (TDM §7) ; phase20_2 déplacée en U11
  'phase20_chapitres_39_40_2': 'الدرس 7 : شواهد التقلص (الطيات والفوالق)',
  // D3-U3 — التصادم القاري (TDM §6)
  'phase21_chapitres_41_42_2': 'الدرس 6 : التضاريس الناجمة عن التصادم',
  // D3-U3 — hors manuel (إثراء ثقافي)
  'phase22_chapitres_43_44_2': 'الدرس 6 : الموارد الجيولوجية والطاقوية في الجزائر (إثراء ثقافي)',
};
