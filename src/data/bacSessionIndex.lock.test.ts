// bacSessionIndex.lock.test.ts — verrou de la banque « أفكار التمارين » par session.
//
// Ce que ce fichier protège : l'exactitude FACTUELLE de la banque (barèmes
// officiels, structure du sujet, sessions couvertes), l'absence de référence
// morte vers le contenu de l'app, et le déterminisme des statistiques qui
// alimentent l'écran.

import { describe, expect, it } from 'vitest';
import {
  BAC_IDEAS,
  BAC_SESSION_SOURCES,
  IDEA_BY_ID,
  INCOMPLETE_SUJETS,
  MISSING_YEARS,
  YEARS_COVERED,
  danglingReferences,
  ideasForUnit,
  ideasForYear,
  pointsOfSujet,
  searchIdeas,
  unitPressure,
  verbFrequency,
} from './bacSessionIndex';
import { INITIAL_UNITS } from '../unitCatalog';

describe('banque أفكار التمارين — intégrité de la collecte', () => {
  it('couvre les six sessions réellement dépouillées, la plus récente en tête', () => {
    expect(YEARS_COVERED).toEqual([2025, 2024, 2023, 2022, 2021, 2019]);
  });

  it('déclare 2020 comme trou assumé plutôt que de l’inventer', () => {
    expect(MISSING_YEARS).toEqual([2020]);
    expect(BAC_IDEAS.some((i) => i.year === 2020)).toBe(false);
  });

  it('cite une source par session couverte', () => {
    const annees = BAC_SESSION_SOURCES.map((s) => s.year).sort((a, b) => b - a);
    expect(annees).toEqual(YEARS_COVERED);
    for (const s of BAC_SESSION_SOURCES) expect(s.url).toMatch(/^https:\/\//);
  });

  it('n’a aucun identifiant dupliqué et respecte le format bacAAAA_sN_eN', () => {
    const ids = BAC_IDEAS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const idea of BAC_IDEAS) {
      expect(idea.id).toBe(`bac${idea.year}_s${idea.sujet}_e${idea.exercice}`);
      expect(IDEA_BY_ID[idea.id]).toBe(idea);
    }
  });
});

describe('banque أفكار التمارين — conformité à la structure officielle', () => {
  it('respecte le barème officiel 5 / 7 / 8 selon le rang de l’exercice', () => {
    const attendu: Record<number, number> = { 1: 5, 2: 7, 3: 8 };
    for (const idea of BAC_IDEAS) {
      expect(idea.points).toBe(attendu[idea.exercice]);
    }
  });

  it('donne 20 points par sujet, sauf le sujet explicitement incomplet', () => {
    const incomplets = new Set(INCOMPLETE_SUJETS.map((s) => `${s.year}_${s.sujet}`));
    for (const year of YEARS_COVERED) {
      for (const sujet of [1, 2] as const) {
        const total = pointsOfSujet(year, sujet);
        if (incomplets.has(`${year}_${sujet}`)) {
          expect(total).toBeLessThan(20);
        } else {
          expect(total).toBe(20);
        }
      }
    }
  });

  it('ne propose jamais deux fois le même rang d’exercice dans un sujet', () => {
    for (const year of YEARS_COVERED) {
      for (const sujet of [1, 2] as const) {
        const rangs = BAC_IDEAS.filter((i) => i.year === year && i.sujet === sujet).map(
          (i) => i.exercice,
        );
        expect(new Set(rangs).size).toBe(rangs.length);
      }
    }
  });

  it('trie chaque session par sujet puis par exercice', () => {
    const ordre = ideasForYear(2024).map((i) => `${i.sujet}${i.exercice}`);
    expect(ordre).toEqual(['11', '12', '13', '21', '22', '23']);
  });
});

describe('banque أفكار التمارين — qualité pédagogique de chaque fiche', () => {
  it('renseigne une idée, une notion, au moins un support et un verbe', () => {
    for (const idea of BAC_IDEAS) {
      expect(idea.titleAr.length).toBeGreaterThan(5);
      expect(idea.ideaAr.length).toBeGreaterThan(25);
      expect(idea.notionAr.length).toBeGreaterThan(20);
      expect(idea.supportsAr.length).toBeGreaterThan(0);
      expect(idea.verbsAr.length).toBeGreaterThan(0);
    }
  });

  it('rattache chaque exercice à au moins une unité réelle du programme', () => {
    const connues = new Set(INITIAL_UNITS.map((u) => u.id));
    for (const idea of BAC_IDEAS) {
      expect(idea.unitIds.length).toBeGreaterThan(0);
      expect(new Set(idea.unitIds).size).toBe(idea.unitIds.length);
      for (const unitId of idea.unitIds) expect(connues.has(unitId)).toBe(true);
    }
  });

  it('ouvre toujours au moins une porte vers le contenu de l’app', () => {
    for (const idea of BAC_IDEAS) {
      const liens = idea.situationIds.length + idea.capsuleIds.length + idea.drillIds.length;
      expect(liens).toBeGreaterThan(0);
    }
  });

  it('ne référence aucun contenu inexistant (situation, capsule, schéma)', () => {
    expect(danglingReferences()).toEqual([]);
  });
});

describe('banque أفكار التمارين — ce que les sessions révèlent', () => {
  it('confirme que l’immunité et la synthèse des protéines dominent le barème', () => {
    const top3 = unitPressure().slice(0, 3).map((p) => p.unitId);
    expect(top3).toContain(4);
    expect(top3).toContain(1);
  });

  it('montre que la photosynthèse est tombée sur plusieurs sessions', () => {
    const u6 = unitPressure().find((p) => p.unitId === 6);
    expect(u6).toBeDefined();
    expect(u6!.years.length).toBeGreaterThanOrEqual(3);
  });

  it('classe « حلّل » parmi les verbes les plus fréquents', () => {
    const top5 = verbFrequency().slice(0, 5).map((v) => v.verbe);
    expect(top5).toContain('حلّل');
  });

  it('produit un classement strictement déterministe', () => {
    expect(unitPressure()).toEqual(unitPressure());
    expect(verbFrequency()).toEqual(verbFrequency());
  });
});

describe('banque أفكار التمارين — accès de l’élève', () => {
  it('retrouve un exercice par son thème, hamzas et diacritiques mis à part', () => {
    const resultats = searchIdeas('الجينتاميسين');
    expect(resultats.map((r) => r.id)).toContain('bac2022_s1_e3');
  });

  it('retrouve toutes les idées d’une année par sa saisie numérique', () => {
    expect(searchIdeas('2023').length).toBe(6);
  });

  it('rend les exercices d’une unité du plus récent au plus ancien', () => {
    const annees = ideasForUnit(4).map((i) => i.year);
    expect(annees).toEqual([...annees].sort((a, b) => b - a));
    expect(annees.length).toBeGreaterThanOrEqual(5);
  });

  it('renvoie une liste vide sur une recherche vide plutôt que tout le corpus', () => {
    expect(searchIdeas('   ')).toEqual([]);
  });
});
