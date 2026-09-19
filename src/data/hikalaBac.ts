// hikalaBac.ts — هيكلة موضوع البكالوريا (structure officielle du sujet SVT).
//
// SOURCE : fiche « هيكلة موضوع البكالوريا – شعبة الرياضيات — أستاذ زكرياء »
// (dzexams) — fiche de synthèse PÉDAGOGIQUE, PAS une circulaire ministérielle.
// Statut de vérité : CORROBORATION de structure (concordante avec les 80
// attendus du dictionnaire et les 80 copies bac2025), à confirmer sur les
// textes officiels pour tout point ventilé.
//
// ⚠️ Caveats assumés (audit croisé 2026-09-19) :
//   · la fiche est libellée « شعبة الرياضيات » — le repo cible علوم تجريبية ;
//     le FORMAT A (5/7/8) coïncide avec la structure réelle SE (copies bac2025),
//     le FORMAT B (2 exercices, 6-8/12-14) est l'autre variante de la fiche ;
//   · la fiche donne le CADRE (points, durées, familles d'actions, nombre de
//     sند/أشكال) — JAMAIS la ventilation par question : elle ne tranche PAS la
//     contradiction Meftah 0,5/4,5 vs dictionnaire 1,25/3,75 (audit M2) ;
//   · « اقترح فرضية » figure dans les أفعال du T2 (استدلال) sur cette fiche,
//     « صادق على صحة الفرضية » dans ceux du T3 (مسعى) — le sujet réel bac2025-S1
//     a mis les DEUX dans le T3. Les verbes migrent entre exercices : cette
//     table est la famille D'ORIGINE officielle, pas une cage ;
//   · couverture scoreur mesurée (2026-09-19) : ~40 % des occurrences de
//     verbes officiels ont une carte ; T1 est le moins couvert en ratio
//     (35,7 %) mais la dette des exercices NOTÉS lourdement (T2+T3, 15 pts)
//     compte 17+ occurrences (ناقش، علّل، برّر، أثبت، استخرج، برهن…) —
//     verrouillée par test pour rester visible jusqu'à traitement.

export interface ExerciceHikala {
  id: 'T1' | 'T2' | 'T3';
  /** Points (format A — 3 exercices). */
  points: number;
  /** Part de la note (fiche : 40 % / 35 % / 25 %). */
  pourcentage: number;
  /** Ce que l'exercice mesure (colonne « قياس التعليمة » de la fiche). */
  mesureAr: string;
  /** Nombre max de sند (fiche : 1 / 2 / 2). */
  maxSind: number;
  /** Nombre minimal d'أشكال dans le سند (fiche : 2 / 4 / 5). */
  minAshkal: number;
  /**
   * الأفعال الإدائية officiels de la fiche, chacun avec sa couverture par une
   * carte du scoreur (verb_* de methodologyEngine) — null = NON ENTRAÎNÉ/NON
   * SCORÉ (dette, audit §C7 : voir test — le T3 est le moins couvert alors
   * qu'il pèse 8 points).
   */
  afal: { verbe: string; couvertPar: string | null }[];
}

export const HIKALA_FORMAT_A: { exercices: ExerciceHikala[] } = {
  exercices: [
    {
      id: 'T1',
      points: 5,
      pourcentage: 40,
      mesureAr: 'قياس الاسترجاع والتنظيم والهيكلة',
      maxSind: 1,
      minAshkal: 2,
      afal: [
        { verbe: 'سمّ', couvertPar: 'verb_list_v1' },
        { verbe: 'صنّف', couvertPar: null },
        { verbe: 'رتّب', couvertPar: null },
        { verbe: 'عرّف', couvertPar: 'verb_define_v1' },
        { verbe: 'عيّن', couvertPar: null },
        { verbe: 'عدّد', couvertPar: 'verb_list_v1' },
        { verbe: 'تعرّف', couvertPar: null },
        { verbe: 'استخرج', couvertPar: null },
        { verbe: 'أذكر', couvertPar: 'verb_list_v1' },
        { verbe: 'اربط', couvertPar: null },
        { verbe: 'أكمل', couvertPar: null },
        { verbe: 'اختر', couvertPar: null },
        { verbe: 'بيّن في نص علمي', couvertPar: null },
        { verbe: 'مثّل برسم تخطيطي', couvertPar: 'verb_schema_v1' },
      ],
    },
    {
      id: 'T2',
      points: 7,
      pourcentage: 35,
      mesureAr: 'قياس الموارد المعرفية والمنهجية في ممارسة الاستدلال العلمي',
      maxSind: 2,
      minAshkal: 4,
      afal: [
        { verbe: 'حلّل', couvertPar: 'verb_analyse_v1' },
        { verbe: 'حدّد', couvertPar: 'verb_pedigree_v1' }, // couverture partielle (généalogie seulement)
        { verbe: 'علّل', couvertPar: null },
        { verbe: 'استخرج', couvertPar: null },
        { verbe: 'فسّر', couvertPar: 'verb_explain_v1' },
        { verbe: 'بيّن', couvertPar: null },
        { verbe: 'وضّح', couvertPar: null },
        { verbe: 'اشرح', couvertPar: 'verb_explain_multi_v1' },
        { verbe: 'برّر', couvertPar: null },
        { verbe: 'أنجز', couvertPar: null },
        { verbe: 'أثبت', couvertPar: null },
        { verbe: 'قارن (تحليل مقارن)', couvertPar: 'verb_compare_v1' },
        { verbe: 'استدل علميا', couvertPar: 'verb_deduce_v1' }, // استنتج = famille استدل (D2)
        { verbe: 'اقترح فرضية أو فرضيات', couvertPar: 'verb_hypothesis_v1' },
        { verbe: 'صغ المشكل المطروح', couvertPar: null },
      ],
    },
    {
      id: 'T3',
      points: 8,
      pourcentage: 25,
      mesureAr:
        'قياس الموارد المعرفية والمنهجية في ممارسة الاستدلال العلمي ضمن مسعى علمي تجريبي + القدرة على التبليغ بإنجاز حصيلة تركيبية',
      maxSind: 2,
      minAshkal: 5,
      afal: [
        { verbe: 'استخرج', couvertPar: null },
        { verbe: 'لخّص', couvertPar: null }, // verb_schema_v1 = لخّص في مخطّط (schéma seulement)
        { verbe: 'ناقش', couvertPar: null },
        { verbe: 'برهن', couvertPar: null },
        { verbe: 'بيّن', couvertPar: null },
        { verbe: 'وضّح', couvertPar: null },
        { verbe: 'قارن (تحليل مقارن)', couvertPar: 'verb_compare_v1' },
        { verbe: 'علّل', couvertPar: null },
        { verbe: 'أثبت', couvertPar: null },
        { verbe: 'تحقّق', couvertPar: 'verb_validate_v1' }, // couverture partielle (صادق)
        { verbe: 'ميّز', couvertPar: null },
        { verbe: 'استدل علميا', couvertPar: 'verb_deduce_v1' },
        { verbe: 'صادق على صحة الفرضية', couvertPar: 'verb_validate_v1' },
        { verbe: 'مثّل برسم تخطيطي', couvertPar: 'verb_schema_v1' },
        { verbe: 'أنجز مخطط وظيفي', couvertPar: 'verb_schema_v1' },
        { verbe: 'بيّن في حصيلة تركيبية', couvertPar: null },
      ],
    },
  ],
};

/** Total /20 du format A (fiche : 5 + 7 + 8, soit 40/35/25 %). */
export function totalFormatA(): number {
  return HIKALA_FORMAT_A.exercices.reduce((s, e) => s + e.points, 0);
}

/** Verbes officiels sans carte de scoreur — la dette d'entraînement (audit C7). */
export function afalNonCouverts(): { exercice: ExerciceHikala['id']; verbe: string }[] {
  const out: { exercice: ExerciceHikala['id']; verbe: string }[] = [];
  for (const ex of HIKALA_FORMAT_A.exercices) {
    for (const a of ex.afal) if (!a.couvertPar) out.push({ exercice: ex.id, verbe: a.verbe });
  }
  return out;
}
