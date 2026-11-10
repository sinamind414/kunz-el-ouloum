// src/data/notionsQcm.ts — GÉNÉRÉ, NE PAS ÉDITER À LA MAIN.
// Générateur : scripts/build_notions_qcm.ts (npx tsx scripts/build_notions_qcm.ts)
// Verrou : src/data/notionsQcm.lock.test.ts (compare chaque entrée à
// l'aria-label du SVG — la table ne peut pas diverger des schémas).
//
// NOTION d'un QCM = le TITRE ARABE de la figure qu'il interroge
// (550/550 QCM ont une figure). Rien n'est inventé : ce sont les
// libellés déjà relus et affichés à l'élève dans les leçons.
//
// Usage : le label est estampé sur chaque question au moment de la
// composition du corpus (src/quizCorpus/index.ts), comme `difficulte`.

/** Notion courte (avant le « - ») d'un schéma, par nom de fichier. */
export const NOTION_PAR_SCHEMA: Record<string, string> = {
  "schema_01_adn": "ADN",
  "schema_02_transcription": "الاستنساخ",
  "schema_03_traduction": "الترجمة",
  "schema_04_arnt": "ARNt",
  "schema_06_structure_proteines": "مستويات البنية الفراغية للبروتين",
  "schema_07_enzyme": "الإنزيمات",
  "schema_08_synapse": "بنية المشبك العصبي العضلي وآلية النقل الكيميائي",
  "schema_09_photosynthese": "التركيب الضوئي",
  "schema_10_respiration": "التنفس الخلوي",
  "schema_11_fermentation": "مقارنة",
  "schema_12_bilan_energetique": "الحصيلة الطاقوية العامة",
  "schema_13_terre": "بنية الكرة الأرضية",
  "schema_14_ondes": "الموجات الزلزالية (P ، S ، L)",
  "schema_15_dorsale": "الظهرة وسط المحيطية",
  "schema_16_subduction": "منطقة الغوص",
  "schema_17_collision": "التصادم القاري",
  "schema_17_transcription_bubble_modern": "فقاعة الاستنساخ",
  "schema_18_wilson": "دورة ويلسون",
  "schema_19_immunite_cmh": "CMH / HLA",
  "schema_20_immunite_humorale": "الاستجابة الخلطية",
  "schema_20_splicing_exons_introns_modern": "من ADN إلى ARNm أولي ثم ARNm ناضج",
  "schema_21_immunite_cellulaire": "الاستجابة الخلوية",
  "schema_22_immunite_vih": "VIH",
  "schema_23_genetic_code_table_modern": "جدول الشفرة الوراثية",
  "schema_24_polysome_translation_modern": "متعدد الريبوزوم",
  "schema_24_secretory_pathway_pancreas_modern_ar": "خلية بنكرياسية مفرزة",
  "schema_26_aa_activation_modern": "تنشيط الأحماض الأمينية قبل الترجمة",
  "schema_28_anagene_mutation_compare_modern_ar": "مقارنة طفرة موضعية",
  "schema_41_alanine_representations_modern": "H₂N—CH—COOH",
  "schema_43_secondary_stabilization_modern": "كيف تستقر البنية الفراغية للبروتين؟",
  "schema_44_quaternary_hemoglobin_tim_modern": "البنية الرباعية",
  "schema_45_four_levels_structure_modern": "المستويات الأربعة لبنية البروتين وكيفية بنائها",
  "schema_58_hla_I_II_structure_modern": "HLA / CMH",
  "schema_59_blood_group_determination_modern": "تحديد الزمرة الدموية يمر عبر محددات سطحية نوعية",
  "schema_59b_blood_group_analysis_modern": "تحليل نتائج التراص",
  "schema_63_antigen_antibody_complex_modern": "من اللمفاوية B إلى المعقد المناعي",
  "schema_65_antibody_structure_hl_modern": "البنية الجزيئية للجسم المضاد تفسر نوعية الارتباط",
  "schema_66_gamma_globulin_electrophoresis_modern": "ازدياد γ-غلوبولين يكشف إنتاج الأجسام المضادة في الاستجابة الخلطية",
  "schema_69_rh_factor_genotype_phenotype_modern": "عامل Rh مثال إضافي على اختلاف العلامات السطحية بين الأفراد",
  "schema_75_primary_secondary_response_curve_modern": "الاستجابة الثانوية أسرع وأقوى من الاستجابة الأولية",
  "schema_76_memory_cell_fate_modern": "بعد التعرض الأول لا تختفي كل الخلايا",
  "schema_83_potentiel_action_modern_ar": "كمون الفعل",
  "schema_86_photosynthese_intensite_lumiere_modern_ar": "معدل البناء الضوئي بدلالة شدة الإضاءة",
  "schema_87_enzyme_inhibition_curves_ar": "تأثير مثبطين على سرعة التفاعل الإنزيمي",
  "schema_88_collision_continentale_modern_ar": "الاصطدام القاري",
  "schema_88_enzyme_six_curves_workshop_ar": "ورشة المنحنيات الستة",
  "schema_89_hill_ruben_experiment_modern_ar": "تجربة هيل (1937) وتجربة روبن (1941)",
  "schema_89_vih_evolution_curves_ar": "تطور الإصابة بفيروس VIH",
  "schema_90_jagendorf_acid_bath_modern_ar": "تجربة جاغندورف (1966)",
  "schema_90_vih_cycle_lt4_ar": "دورة فيروس VIH داخل اللمفاوية المساعدة LT4",
  "schema_91_calvin_2d_chromatography_modern_ar": "تجربة كالفن",
  "schema_92_racker_bacteriorhodopsin_modern_ar": "تجربة راكر (1974)",
  "schema_93_benioff_plan_modern_ar": "مستوى بنيوف (Wadati-Benioff)",
  "schema_93_photochemical_chain_z_scheme_ar": "المرحلة الكيموضوئية",
  "schema_94_migmatite_crustal_thickening_modern_ar": "شواهد التقلص",
  "schema_94_photophosphorylation_vs_oxydative_ar": "نفس المبدأ الكيميواسموزي في عضيتين",
};

/** Toutes les notions distinctes du corpus (ordre stable). */
export const NOTIONS_QCM: string[] = [
  "ازدياد γ-غلوبولين يكشف إنتاج الأجسام المضادة في الاستجابة الخلطية",
  "الاستجابة الثانوية أسرع وأقوى من الاستجابة الأولية",
  "الاستجابة الخلطية",
  "الاستجابة الخلوية",
  "الاستنساخ",
  "الاصطدام القاري",
  "الإنزيمات",
  "البنية الجزيئية للجسم المضاد تفسر نوعية الارتباط",
  "البنية الرباعية",
  "الترجمة",
  "التركيب الضوئي",
  "التصادم القاري",
  "التنفس الخلوي",
  "الحصيلة الطاقوية العامة",
  "الظهرة وسط المحيطية",
  "المرحلة الكيموضوئية",
  "المستويات الأربعة لبنية البروتين وكيفية بنائها",
  "الموجات الزلزالية (P ، S ، L)",
  "بعد التعرض الأول لا تختفي كل الخلايا",
  "بنية الكرة الأرضية",
  "بنية المشبك العصبي العضلي وآلية النقل الكيميائي",
  "تأثير مثبطين على سرعة التفاعل الإنزيمي",
  "تجربة جاغندورف (1966)",
  "تجربة راكر (1974)",
  "تجربة كالفن",
  "تجربة هيل (1937) وتجربة روبن (1941)",
  "تحديد الزمرة الدموية يمر عبر محددات سطحية نوعية",
  "تحليل نتائج التراص",
  "تطور الإصابة بفيروس VIH",
  "تنشيط الأحماض الأمينية قبل الترجمة",
  "جدول الشفرة الوراثية",
  "خلية بنكرياسية مفرزة",
  "دورة فيروس VIH داخل اللمفاوية المساعدة LT4",
  "دورة ويلسون",
  "شواهد التقلص",
  "عامل Rh مثال إضافي على اختلاف العلامات السطحية بين الأفراد",
  "فقاعة الاستنساخ",
  "كمون الفعل",
  "كيف تستقر البنية الفراغية للبروتين؟",
  "متعدد الريبوزوم",
  "مستوى بنيوف (Wadati-Benioff)",
  "مستويات البنية الفراغية للبروتين",
  "معدل البناء الضوئي بدلالة شدة الإضاءة",
  "مقارنة",
  "مقارنة طفرة موضعية",
  "من اللمفاوية B إلى المعقد المناعي",
  "من ADN إلى ARNm أولي ثم ARNm ناضج",
  "منطقة الغوص",
  "نفس المبدأ الكيميواسموزي في عضيتين",
  "ورشة المنحنيات الستة",
  "ADN",
  "ARNt",
  "CMH / HLA",
  "H₂N—CH—COOH",
  "HLA / CMH",
  "VIH",
];

/**
 * Notion d'un QCM, déduite de sa figure. Renvoie '' si la figure est
 * inconnue (une QCM sans notion ne doit jamais casser le rendu).
 */
export function notionDeSchema(diagramUrl: string | undefined): string {
  if (!diagramUrl) return '';
  const cle = diagramUrl.split('/').pop()!.replace(/\.svg$/, '');
  return NOTION_PAR_SCHEMA[cle] ?? '';
}
