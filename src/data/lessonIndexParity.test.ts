// lessonIndexParity.test.ts — verrou croisé B5 (audit « ligne par ligne »,
// 2026-10-17). DÉFAUT : LESSON_LIBRARY affectait son unitId via l'heuristique
// du fil d'Ariane ; sur 5 leçons jumelles scindées (_2), elle se trompait :
//   phase2_chapitres_3_4_2  : U1 → U2 (niveaux de structure du protéique)
//   phase3_chapitres_5_6_2  : U2 → U3 (enzyme)
//   phase10_chapitres_19_20_2 : U5 → U6 (chloroplaste/photosynthèse)
//   phase17_chapitres_33_34_2 : U9 → U11 (magmatisme de subduction)
//   phase20_chapitres_39_40_2 : U10 → U11 (déformations)
// L'index du tuteur (lessonIndex.ts, GÉNÉRÉ) reprenait ces unitId faux — un
// élève cherchant « المستويات الفراغية » retombait sur l'unité عصبي.
// FIX : lessonData.ts consulte AFFICIALEMENT OFFICIAL_PROGRAM_SEQUENCE
// (programSequence.ts) avant l'heuristique ; lessonIndex.ts a été régénéré.
// Ce verrou croise les TROIS couches : séquence officielle → LESSON_LIBRARY →
// index généré. Toute divergence future ⇒ rouge.
import { describe, expect, it } from 'vitest';
import { OFFICIAL_PROGRAM_SEQUENCE } from './programSequence';
import { LESSON_LIBRARY } from '../lessonData';
import { LESSON_INDEX } from './lessonIndex';

const PROPRIETAIRE = new Map<string, number>();
for (const [uid, keys] of Object.entries(OFFICIAL_PROGRAM_SEQUENCE)) {
  for (const k of keys) if (!PROPRIETAIRE.has(k)) PROPRIETAIRE.set(k, Number(uid));
}

describe('B5 — LESSON_LIBRARY conforme à la séquence officielle', () => {
  it('les 5 unitId historiquement faux sont corrects (régression nommée)', () => {
    const attendus: Array<[string, number]> = [
      ['phase2_chapitres_3_4_2', 2],
      ['phase3_chapitres_5_6_2', 3],
      ['phase10_chapitres_19_20_2', 6],
      ['phase17_chapitres_33_34_2', 11],
      ['phase20_chapitres_39_40_2', 11],
    ];
    for (const [key, unitAttendue] of attendus) {
      const lib = LESSON_LIBRARY.find((l) => l.key === key);
      expect(lib, `clé absente de LESSON_LIBRARY : ${key}`).toBeTruthy();
      expect(lib!.unitId, `${key} : ${lib?.unitId} au lieu de U${unitAttendue}`).toBe(unitAttendue);
    }
  });

  it('ZÉRO divergence LESSON_LIBRARY ↔ séquence officielle (47 leçons)', () => {
    const divergences = LESSON_LIBRARY.filter((l) => {
      const officiel = PROPRIETAIRE.get(l.key);
      return officiel !== undefined && officiel !== l.unitId;
    }).map((l) => `${l.key} : library=U${l.unitId} officiel=U${PROPRIETAIRE.get(l.key)}`);
    expect(divergences).toEqual([]);
  });

  it('ZÉRO divergence index généré (lessonIndex.ts) ↔ séquence officielle', () => {
    const unitParChunk = new Map<string, number>();
    for (const chunk of LESSON_INDEX) {
      if (PROPRIETAIRE.has(chunk.lessonKey)) {
        unitParChunk.set(chunk.lessonKey, chunk.unitId);
      }
    }
    const divergences: string[] = [];
    for (const [key, unit] of unitParChunk) {
      const officiel = PROPRIETAIRE.get(key)!;
      if (unit !== officiel) divergences.push(`${key} : index=U${unit} officiel=U${officiel}`);
    }
    expect(divergences, 'lessonIndex.ts doit être régénéré (npx tsx scripts/build_lesson_index.ts)').toEqual([]);
    // garde-fou : le verrou doit vraiment couvrir des chunks (pas un test creux)
    expect(unitParChunk.size).toBeGreaterThanOrEqual(40);
  });
});
