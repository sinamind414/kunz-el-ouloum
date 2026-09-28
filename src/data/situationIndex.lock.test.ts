// situationIndex.lock.test.ts — verrous de la banque indexée par situation
// (audit item 18, sprint 10).
//
// Ce que ces tests protègent :
//  1. AUCUNE RÉFÉRENCE MORTE. Une situation qui pointe vers un exerciseId
//     supprimé produirait une carte cliquable menant au vide.
//  2. La cohérence unité déclarée ↔ unité réelle des exercices référencés :
//     c'est ce qui rend le filtre par unité honnête.
//  3. La qualité éditoriale minimale de chaque fiche (scène, question, notion,
//     piège) — sans quoi l'index redevient une simple liste de titres.
//  4. Le contrat de la recherche (normalisation arabe, filtres cumulables).

import { describe, expect, it } from 'vitest';
import {
  SITUATION_INDEX,
  SITUATION_BY_ID,
  SITUATION_COUNT,
  coveredUnitIds,
  knownExerciseIds,
  normalizeArabic,
  practiceContextsForSituation,
  searchSituations,
  situationsForUnit,
} from './situationIndex';
import { DOCUMENT_PRACTICE_CONTEXTS } from './documentPracticeContexts';
import { DOCUMENT_ANALYSIS_EXERCISES } from './documentAnalysisExercises';
import { ACTIVE_LESSONS } from './activeLessons';
import { INITIAL_UNITS } from './index';

describe('banque par situation — intégrité des références', () => {
  it('chaque exerciseId cité existe dans une des deux banques', () => {
    const known = knownExerciseIds();
    for (const s of SITUATION_INDEX) {
      expect(s.exerciseIds.length, `${s.id} sans exercice`).toBeGreaterThanOrEqual(1);
      for (const ex of s.exerciseIds) {
        expect(known.has(ex), `${s.id} → exercice inconnu « ${ex} »`).toBe(true);
      }
    }
  });

  it('chaque lessonId cité est une leçon active réelle', () => {
    for (const s of SITUATION_INDEX) {
      if (!s.lessonId) continue;
      expect(Object.keys(ACTIVE_LESSONS), `${s.id}`).toContain(s.lessonId);
    }
  });

  it('l unité principale déclarée est bien celle d un exercice référencé', () => {
    const unitesExercice = new Map<string, number>();
    for (const c of DOCUMENT_PRACTICE_CONTEXTS) unitesExercice.set(c.exerciseId, c.unitId);
    for (const e of DOCUMENT_ANALYSIS_EXERCISES) unitesExercice.set(e.id, e.unitId);

    for (const s of SITUATION_INDEX) {
      const unites = s.exerciseIds.map((ex) => unitesExercice.get(ex)).filter(Boolean) as number[];
      expect(unites.length, `${s.id}`).toBeGreaterThan(0);
      // l'unité d'au moins un exercice doit figurer dans les unités déclarées
      expect(unites.some((u) => s.unitIds.includes(u)), `${s.id} : unités ${s.unitIds} vs ${unites}`).toBe(
        true,
      );
    }
  });

  it('toutes les unités déclarées existent au catalogue', () => {
    for (const s of SITUATION_INDEX) {
      for (const u of s.unitIds) {
        expect(INITIAL_UNITS.some((unit) => unit.id === u), `${s.id} → unité ${u}`).toBe(true);
      }
    }
  });

  it('aucun identifiant dupliqué et index d accès direct complet', () => {
    const ids = SITUATION_INDEX.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(Object.keys(SITUATION_BY_ID)).toHaveLength(SITUATION_COUNT);
    for (const id of ids) expect(SITUATION_BY_ID[id].id).toBe(id);
  });
});

describe('banque par situation — qualité éditoriale', () => {
  it('chaque fiche porte une scène concrète, une question, une notion et un piège', () => {
    for (const s of SITUATION_INDEX) {
      expect(s.titleAr.length, `${s.id} titre`).toBeGreaterThanOrEqual(4);
      expect(s.subtitleAr.length, `${s.id} sous-titre`).toBeGreaterThanOrEqual(10);
      expect(s.situationAr.length, `${s.id} scène trop courte`).toBeGreaterThanOrEqual(90);
      expect(s.notionAr.length, `${s.id} notion`).toBeGreaterThanOrEqual(30);
      expect(s.piegeAr.length, `${s.id} piège`).toBeGreaterThanOrEqual(40);
      expect(s.tags.length, `${s.id} mots-clés`).toBeGreaterThanOrEqual(3);
      expect(s.minutes, `${s.id} durée`).toBeGreaterThanOrEqual(10);
      expect(s.minutes, `${s.id} durée`).toBeLessThanOrEqual(45);
      expect([1, 2, 3]).toContain(s.difficulty);
    }
  });

  it('la question d entrée est une consigne, pas une affirmation', () => {
    const verbes = ['حلّل', 'حلل', 'فسّر', 'فسر', 'قارن', 'حدّد', 'حدد', 'بيّن', 'بين', 'استنتج', 'اقترح'];
    for (const s of SITUATION_INDEX) {
      expect(verbes.some((v) => s.questionAr.includes(v)), `${s.id} : « ${s.questionAr} »`).toBe(true);
    }
  });

  it('les titres sont des situations, pas des intitulés de leçon', () => {
    // garde-fou éditorial : pas de titre commençant par « الوحدة » ou « درس »
    for (const s of SITUATION_INDEX) {
      expect(s.titleAr.startsWith('الوحدة')).toBe(false);
      expect(s.titleAr.startsWith('درس')).toBe(false);
    }
  });
});

describe('banque par situation — couverture du programme', () => {
  it('au moins 20 situations publiées', () => {
    expect(SITUATION_COUNT).toBeGreaterThanOrEqual(20);
  });

  it('les 11 unités du programme sont couvertes', () => {
    expect(coveredUnitIds()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it('les unités les plus lourdes au BAC ont plusieurs situations', () => {
    // U4 (13 %) et U5 (16 %) sont les deux plus gros blocs du sujet.
    expect(situationsForUnit(4).length).toBeGreaterThanOrEqual(4);
    expect(situationsForUnit(5).length).toBeGreaterThanOrEqual(3);
  });

  it('les trois niveaux de difficulté sont représentés', () => {
    for (const d of [1, 2, 3] as const) {
      expect(SITUATION_INDEX.filter((s) => s.difficulty === d).length, `difficulté ${d}`).toBeGreaterThan(
        0,
      );
    }
  });
});

describe('banque par situation — moteur de recherche', () => {
  it('une requête vide renvoie toute la banque', () => {
    expect(searchSituations('')).toHaveLength(SITUATION_COUNT);
  });

  it('trouve la situation du diabétique par son nom courant', () => {
    const r = searchSituations('السكري');
    expect(r.map((s) => s.id)).toContain('diabete_januvia');
  });

  it('trouve une situation par un mot-clé latin (sarin, curare)', () => {
    expect(searchSituations('sarin').map((s) => s.id)).toContain('sarin_attaque');
    expect(searchSituations('curare').map((s) => s.id)).toContain('curare_chirurgie');
  });

  it('ignore les diacritiques et les variantes d écriture de l alef', () => {
    const sansHamza = searchSituations('الاستنساخ');
    const avecHamza = searchSituations('الإستنساخ');
    expect(sansHamza.length).toBeGreaterThan(0);
    expect(avecHamza.map((s) => s.id)).toEqual(sansHamza.map((s) => s.id));
  });

  it('normalise le ta marbuta et le ya final', () => {
    expect(normalizeArabic('الكليّة')).toBe(normalizeArabic('الكليه'));
    expect(normalizeArabic('مستوى')).toBe(normalizeArabic('مستوي'));
  });

  it('les filtres unité et difficulté se cumulent avec la requête', () => {
    const u4 = searchSituations('', { unitId: 4 });
    expect(u4.every((s) => s.unitIds.includes(4))).toBe(true);
    const durs = searchSituations('', { difficulty: 3 });
    expect(durs.every((s) => s.difficulty === 3)).toBe(true);
    const croise = searchSituations('', { unitId: 4, difficulty: 3 });
    expect(croise.every((s) => s.unitIds.includes(4) && s.difficulty === 3)).toBe(true);
    expect(croise.length).toBeLessThanOrEqual(Math.min(u4.length, durs.length));
  });

  it('une requête sans correspondance renvoie une liste vide, pas toute la banque', () => {
    expect(searchSituations('زرافة')).toHaveLength(0);
  });
});

describe('banque par situation — ouverture des documents', () => {
  it('chaque situation ouvre au moins un contexte documentaire jouable', () => {
    const sansContexte = SITUATION_INDEX.filter((s) => practiceContextsForSituation(s.id).length === 0);
    expect(sansContexte.map((s) => s.id)).toEqual([]);
  });

  it('les contextes rendus appartiennent bien à la situation demandée', () => {
    const ctx = practiceContextsForSituation('sida_vih');
    expect(ctx.length).toBeGreaterThan(0);
    expect(ctx.every((c) => c.exerciseId === 'vih_evolution_courbes')).toBe(true);
  });

  it('une situation inconnue ne jette pas, elle renvoie une liste vide', () => {
    expect(practiceContextsForSituation('inexistant')).toEqual([]);
  });
});
