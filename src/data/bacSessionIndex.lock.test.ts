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
  bacEchoForSituation,
  sourcesForYear,
  bacEchoForCapsule,
  bacEchoForDrill,
  observedUnitSharePercent,
} from './bacSessionIndex';
import { INITIAL_UNITS } from '../unitCatalog';
import { SITUATION_INDEX } from './situationIndex';

describe('banque أفكار التمارين — intégrité de la collecte', () => {
  it('couvre les onze sessions dépouillées, la plus récente en tête', () => {
    expect(YEARS_COVERED).toEqual([
      2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016,
    ]);
  });

  it('ne déclare plus aucun trou de session, 2020 ayant été récupérée', () => {
    expect(MISSING_YEARS).toEqual([]);
    expect(BAC_IDEAS.filter((i) => i.year === 2020).length).toBe(6);
    expect(BAC_IDEAS.filter((i) => i.year === 2026).length).toBe(6);
    expect(BAC_IDEAS.filter((i) => i.year === 2018).length).toBe(6);
    expect(BAC_IDEAS.filter((i) => i.year === 2017).length).toBe(6);
    expect(BAC_IDEAS.filter((i) => i.year === 2016).length).toBe(6);
  });

  it('couvre une série continue de sessions, sans saut silencieux', () => {
    const min = Math.min(...YEARS_COVERED);
    const max = Math.max(...YEARS_COVERED);
    for (let y = min; y <= max; y += 1) {
      const presente = YEARS_COVERED.includes(y);
      const declaree = MISSING_YEARS.includes(y);
      expect(presente || declaree, `session ${y} ni couverte ni déclarée manquante`).toBe(true);
    }
  });

  it('cite une source par session couverte', () => {
    const annees = BAC_SESSION_SOURCES.map((s) => s.year).sort((a, b) => b - a);
    expect(annees).toEqual(YEARS_COVERED);
    for (const s of BAC_SESSION_SOURCES) expect(s.url).toMatch(/^https:\/\//);
  });

  it('cite aussi le corrigé officiel de chaque session (sprint 42)', () => {
    for (const s of BAC_SESSION_SOURCES) {
      expect(s.correctionUrl, `corrigé ${s.year}`).toMatch(/^https:\/\//);
      // 2026 mise à part : chez DzExams, sujet et corrigé sont un seul PDF.
      if (s.year !== 2026) {
        expect(s.correctionUrl, `corrigé ${s.year}`).not.toBe(s.url);
        expect(s.correctionUrl).toContain('correction');
      }
    }
  });

  it('retrouve les deux sources d’une session, et rien pour une année absente', () => {
    const s2018 = sourcesForYear(2018);
    expect(s2018?.url).toContain('2018');
    expect(s2018?.correctionUrl).toContain('2018');
    expect(sourcesForYear(1999)).toBeNull();
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
  it('respecte le barème 5 / 7 / 8 — mais seulement depuis 2017', () => {
    // Fait établi au sprint 56 en dépouillant 2016 : le format actuel n'est
    // pas éternel. Cette session-là valait 6/5/9 (sujet 1) et 6/7/7
    // (sujet 2). Figer « 5/7/8 » pour tout le corpus aurait obligé à fausser
    // des barèmes officiels pour faire passer un test.
    const attendu: Record<number, number> = { 1: 5, 2: 7, 3: 8 };
    for (const idea of BAC_IDEAS.filter((i) => i.year >= 2017)) {
      expect(idea.points, `${idea.id}`).toBe(attendu[idea.exercice]);
    }
  });

  it('accepte les barèmes plus anciens, à condition qu’ils fassent 20', () => {
    for (const idea of BAC_IDEAS.filter((i) => i.year < 2017)) {
      expect([5, 6, 7, 8, 9], `${idea.id} : ${idea.points} points`).toContain(idea.points);
    }
    // La règle qui, elle, ne bouge pas : un sujet vaut 20 points.
    expect(pointsOfSujet(2016, 1)).toBe(20);
    expect(pointsOfSujet(2016, 2)).toBe(20);
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
    expect(searchIdeas('2026').length).toBe(6);
  });

  it('rend les exercices d’une unité du plus récent au plus ancien', () => {
    const annees = ideasForUnit(4).map((i) => i.year);
    expect(annees).toEqual([...annees].sort((a, b) => b - a));
    expect(annees.length).toBeGreaterThanOrEqual(8);
  });

  it('renvoie une liste vide sur une recherche vide plutôt que tout le corpus', () => {
    expect(searchIdeas('   ')).toEqual([]);
  });
});

describe('banque أفكار التمارين — index inverse (sprint 18)', () => {
  it('rattache une situation de l’app aux sessions où elle est réellement tombée', () => {
    const echo = bacEchoForSituation('antibiotique_rifamycine');
    expect(echo.years).toContain(2019);
    expect(echo.ideaIds).toContain('bac2019_s2_e3');
    expect(echo.years).toEqual([...echo.years].sort((a, b) => b - a));
  });

  it('ne renvoie aucun écho pour un identifiant inconnu, sans planter', () => {
    expect(bacEchoForSituation('situation_qui_n_existe_pas')).toEqual({ years: [], ideaIds: [] });
  });

  it('couvre la majorité des situations de l’app par au moins une session', () => {
    const avecEcho = SITUATION_INDEX.filter((s) => bacEchoForSituation(s.id).years.length > 0);
    expect(avecEcho.length / SITUATION_INDEX.length).toBeGreaterThan(0.6);
  });

  it('donne aussi l’écho d’une capsule et d’un schéma', () => {
    expect(bacEchoForCapsule('cap_u3_inhibition_type').years.length).toBeGreaterThanOrEqual(3);
    expect(bacEchoForDrill('drill_chaine_photochimique').years.length).toBeGreaterThanOrEqual(3);
  });

  it('exprime la pression mesurée en pourcentage des points, total ≈ 100', () => {
    const parts = observedUnitSharePercent();
    const total = Object.values(parts).reduce((s, v) => s + v, 0);
    expect(total).toBeGreaterThan(99);
    expect(total).toBeLessThan(101);
  });

  it('confirme l’écart entre le poids annoncé du programme et la réalité', () => {
    const parts = observedUnitSharePercent();
    // U1 est annoncée à 10 % par la répartition du programme.
    expect(parts[1]).toBeGreaterThan(10);
    // U6 + U7 sont annoncées à 39 % : l'examen ne le confirme pas.
    expect((parts[6] ?? 0) + (parts[7] ?? 0)).toBeLessThan(25);
  });
});
