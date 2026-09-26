// src/data/hosilaUnitNumbers.ts — table de correspondance
//   unité de الحصيلة المعرفية (id « dXuY », src/data/hosila.ts)
//   ↔ numéro OFFICIEL de l'unité des leçons (src/unitCatalog.ts INITIAL_UNITS, 1..11).
//
// Pourquoi une table explicite et surtout PAS une formule :
//  · Domaine 3 inversé entre les deux corpus — la حصيلة numérote
//    بنية الكرة الأرضية « d3u1 » et الصفائح التكتونية « d3u2 » alors que le
//    livre (TDM : الصفائح p.237 avant بنية الكرة p.259) et les fil d'Ariane
//    des leçons (« الوحدة 1 : النشاط التكتوني للصفائح ») les classent dans
//    l'ordre inverse. La formule « 8 + N » (lessonData.ts,
//    inferGlobalUnitIdFromBreadcrumb) croiserait donc les unités 9 et 10.
//  · Domaine 2 incomplet : 2 unités côté حصيلة contre 3 côté leçons —
//    وحدة 8 (تحويل الطاقة على المستوى ما فوق البنية الخلوية) n'a aucune
//    حصيلة officielle. Elle n'est donc présente dans aucune des deux clés.
//
// Conséquence à l'affichage : les badges passent de « u1/u2/u3 » (numéro
// local remis à zéro à chaque domaine) à « وحدة N » — le MÊME numéro que
// l'écran des leçons passives, pour que les deux écrans se répondent.

/** Id حصilha → numéro d'unité officiel (1..11). */
export const HOSILA_VERS_UNITE: Readonly<Record<string, number>> = {
  // المجال 1 — التخصص الوظيفي للبروتينات (unités 1..5)
  d1u1: 1,
  d1u2: 2,
  d1u3: 3,
  d1u4: 4,
  d1u5: 5,
  // المجال 2 — التحولات الطاقوية (unités 6, 7 — la 8 n'a pas de حصيلة)
  d2u1: 6,
  d2u2: 7,
  // المجال 3 — التكتونية العامة : ordre du livre ≠ ordre des ids hosila.
  d3u2: 9, // الصفائح التكتونية
  d3u1: 10, // بنية الكرة الأرضية
  d3u3: 11, // الظواهر المرتبطة بالنشاط التكتوني
};

/**
 * Numéro d'unité officiel (1..11) d'une unité de الحصيلة.
 * @returns `null` si l'id est inconnu (aucune numérotation inventée).
 */
export function numeroUniteHosila(id: string): number | null {
  return HOSILA_VERS_UNITE[id] ?? null;
}

/**
 * Domaine officiel (1..3) d'un numéro d'unité 1..11 :
 * 1..5 = المجال 1 · 6..8 = المجال 2 · 9..11 = المجال 3.
 */
export function domaineDeNumero(unite: number): number {
  if (unite <= 5) return 1;
  if (unite <= 8) return 2;
  return 3;
}
