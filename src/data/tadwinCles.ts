// tadwinCles.ts
// Clés prescrites du module Tadwin (التدوين الشامل) : 3 clés par unité × 11 unités = 33.
//
// PROVENANCE : généré depuis mafatih_morchid.json v1.1 (2026-09-30). Les atomes sont
// AUTEUR-DÉCLARÉS à la main (docs/tadwin_decisions.md §3 / AGENTS.md R4) — aucun parser
// runtime (la sortie d'un parser dépend des séparateurs : 28 vs 17 mono-atomes mesurés).
// Chaque atome est ancré dans le vocabulaire de l'auteur et sert de PREUVE ; la clé est
// l'UNITÉ NOTÉE (docs/tadwin_decisions.md §2).
//
// CONTRAT (docs/tadwin_decisions.md §6), vérifié par tadwinCles.lock.test.ts :
//   · 33 clés exactement, 3 par unité, unités 1..11 ;
//   · atoms(clé) ≠ ∅ ;
//   · ces clés alimentent le mode « attendus » de Tadwin (C2 par-clé, lib/validation/couvCle.ts),
//     JAMAIS le dénominateur du mode défaut de CORRECTEUR_V1_UNITES (§4 : union INTERDITE).
//
// Câblage UI (BotMode 'tadwin', paliers) : EN ATTENTE — module V1 non encore intégré.

export interface CleTadwin {
  /** Intitulé de la clé tel que prescrit (affiché à l'élève). */
  cle: string;
  /** Termes-preuves déclarés par l'auteur ; la clé est couverte si la réponse
   *  contient assez de SES PROPRES atomes (seuil calibré, voir couvCle.ts). */
  atoms: string[];
}

export interface UniteTadwin {
  uniteId: number;
  titre: string;
  /** Exactement 3 clés prescrites (lock §6.4 + spec Tadwin palier 3). */
  cles: CleTadwin[];
}

export const TADWIN_UNITES: UniteTadwin[] = [
  {
    uniteId: 1,
    titre: 'تركيب البروتين (La synthèse des protéines)',
    cles: [
      {
        cle: 'استنساخ (النواة/ARN بوليميراز)',
        atoms: [
          'استنساخ',
          'النواة',
          'ARN بوليميراز'
        ],
      },
      {
        cle: 'ARNm',
        atoms: [
          'ARNm'
        ],
      },
      {
        cle: 'ترجمة (الريبوزوم/ARNt/الرامزة)',
        atoms: [
          'ترجمة',
          'الريبوزوم',
          'ARNt',
          'الرامزة'
        ],
      },
    ],
  },
  {
    uniteId: 2,
    titre: 'العلاقة بين بنية ووظيفة البروتين',
    cles: [
      {
        cle: 'البنية الأولية',
        atoms: [
          'البنية الأولية'
        ],
      },
      {
        cle: 'البنية الفراغية',
        atoms: [
          'البنية الفراغية'
        ],
      },
      {
        cle: 'العلاقة بنية↔وظيفة',
        atoms: [
          'البنية',
          'وظيفة'
        ],
      },
    ],
  },
  {
    uniteId: 3,
    titre: 'النشاط الإنزيمي للبروتينات',
    cles: [
      {
        cle: 'الموقع الفعّال',
        atoms: [
          'الموقع الفعّال'
        ],
      },
      {
        cle: 'البنية الثالثية',
        atoms: [
          'البنية الثالثية'
        ],
      },
      {
        cle: 'تخريب غير عكسي',
        atoms: [
          'تخريب غير عكسي',
          'فقدان البنية الثالثية'
        ],
      },
    ],
  },
  {
    uniteId: 4,
    titre: 'دور البروتينات في الدفاع عن الذات (المناعة)',
    cles: [
      {
        cle: 'LT4 (التنسيق)',
        atoms: [
          'LT4',
          'التنسيق'
        ],
      },
      {
        cle: 'الأنترلوكينات IL2',
        atoms: [
          'الأنترلوكينات',
          'IL2'
        ],
      },
      {
        cle: 'الذاكرة/الاستنساخ العكسي',
        atoms: [
          'الذاكرة',
          'الاستنساخ العكسي'
        ],
      },
    ],
  },
  {
    uniteId: 5,
    titre: 'دور البروتينات في الاتصال العصبي',
    cles: [
      {
        cle: 'Ca²⁺ ← حويصلات ← مبلّغ عصبي',
        atoms: [
          'Ca²⁺',
          'الحويصلات',
          'المبلّغ العصبي'
        ],
      },
      {
        cle: 'مستقبل ← PPSE',
        atoms: [
          'مستقبل',
          'PPSE'
        ],
      },
      {
        cle: 'أستيل كولين إستراز',
        atoms: [
          'أستيل كولين إستراز'
        ],
      },
    ],
  },
  {
    uniteId: 6,
    titre: 'التركيب الضوئي (Photosynthèse)',
    cles: [
      {
        cle: 'المرحلة الكيموضوئية (تحليل الماء)',
        atoms: [
          'المرحلة الكيموضوئية',
          'التحليل الضوئي للماء'
        ],
      },
      {
        cle: 'NADPH,H⁺/ATP',
        atoms: [
          'NADPH',
          'H⁺',
          'ATP'
        ],
      },
      {
        cle: 'حلقة كالفن/CO₂',
        atoms: [
          'حلقة كالفن',
          'CO₂'
        ],
      },
    ],
  },
  {
    uniteId: 7,
    titre: 'تحويل الطاقة الكيميائية إلى ATP (التنفّس والتخمّر)',
    cles: [
      {
        cle: '38 ATP / 2 ATP',
        atoms: [
          '38 ATP',
          '2 ATP'
        ],
      },
      {
        cle: 'الفسفرة التأكسدية',
        atoms: [
          'الفسفرة التأكسدية'
        ],
      },
      {
        cle: 'O₂ مستقبِل أخير',
        atoms: [
          'O₂ مستقبِل أخير'
        ],
      },
    ],
  },
  {
    uniteId: 8,
    titre: 'التحوّلات الطاقوية فوق الخلوية',
    cles: [
      {
        cle: 'نهار: تركيب + تنفّس',
        atoms: [
          'نهار',
          'التركيب الضوئي',
          'التنفّس'
        ],
      },
      {
        cle: 'ليل: تنفّس فقط',
        atoms: [
          'ليل',
          'التنفّس'
        ],
      },
      {
        cle: 'O₂ ⇄ CO₂',
        atoms: [
          'O₂',
          'CO₂'
        ],
      },
    ],
  },
  {
    uniteId: 9,
    titre: 'النشاط التكتوني للصفائح',
    cles: [
      {
        cle: 'المغنطة المتناظرة',
        atoms: [
          'المغنطة المتناظرة',
          'Paleomagnétisme'
        ],
      },
      {
        cle: 'تزايد أعمار القاع بالابتعاد',
        atoms: [
          'تزايد أعمار القاع بالابتعاد'
        ],
      },
      {
        cle: 'تطابق القارات/GPS',
        atoms: [
          'تطابق القارات',
          'GPS'
        ],
      },
    ],
  },
  {
    uniteId: 10,
    titre: 'بنية الكرة الأرضية',
    cles: [
      {
        cle: 'الموجات S',
        atoms: [
          'الموجات S'
        ],
      },
      {
        cle: 'انقطاع غوتنبرغ',
        atoms: [
          'غوتنبرغ',
          'توقّف S',
          'لب خارجي سائل'
        ],
      },
      {
        cle: 'لب خارجي سائل',
        atoms: [
          'لب خارجي سائل'
        ],
      },
    ],
  },
  {
    uniteId: 11,
    titre: 'النشاط التكتوني والبنيات المرتبطة (الغوص والتصادم)',
    cles: [
      {
        cle: 'الشست الأزرق/الإكلوجيت (HP/BT)',
        atoms: [
          'الشست الأزرق',
          'الإكلوجيت',
          'تحوّل HP',
          'BT',
          'غلوكوفان'
        ],
      },
      {
        cle: 'الأوفيوليت',
        atoms: [
          'الأوفيوليت',
          'شاهد محيط قديم أُغلق'
        ],
      },
      {
        cle: 'التصادم القاري',
        atoms: [
          'التصادم القاري',
          'سلاسل جبلية'
        ],
      },
    ],
  },
];

/** Nombre de clés prescrites par unité (constante du contrat). */
export const TADWIN_CLES_PAR_UNITE = 3;

/** Clés prescrites d'une unité, ou undefined si l'unité n'existe pas. */
export function clesDeUnite(uniteId: number): CleTadwin[] | undefined {
  return TADWIN_UNITES.find((u) => u.uniteId === uniteId)?.cles;
}

/** Intitulés prescrits d'une unité (pour le choix de l'élève au palier 3). */
export function clesPrescrites(uniteId: number): string[] | undefined {
  return clesDeUnite(uniteId)?.map((c) => c.cle);
}
