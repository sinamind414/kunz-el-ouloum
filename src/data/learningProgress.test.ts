// learningProgress.test.ts — mesurer l'apprentissage, pas l'activité
// (sprint 62).

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LEARNING_LOG_KEY,
  LOG_MAX,
  aujourdHui,
  clearLearningLog,
  readLearningLog,
  recordWriting,
  type LearningEntry,
} from './learningLog';
import {
  SEUIL_FAMILLE,
  SEUIL_VERDICT,
  couvertureParUnite,
  progressionParFamille,
  verdictProgression,
} from './learningProgress';

beforeEach(() => clearLearningLog());

const entree = (
  date: string,
  satisfaits: number,
  total = 4,
  familyId = 'verb_analyser',
  ideaId = 'bac2023_s2_e3',
): LearningEntry => ({ date, ideaId, familyId, satisfaits, total, mots: 60 });

describe('journal de rédaction', () => {
  it('enregistre et relit', () => {
    recordWriting(entree('2026-04-01', 2));
    expect(readLearningLog()).toHaveLength(1);
  });

  it('ne compte qu’une fois par jour, exercice et consigne', () => {
    // Rouvrir dix fois le même brouillon ne crée pas dix preuves de progrès.
    for (let i = 0; i < 10; i += 1) recordWriting(entree('2026-04-01', i % 5));
    const journal = readLearningLog();
    expect(journal).toHaveLength(1);
    expect(journal[0].satisfaits).toBe(4); // la dernière version du jour gagne
  });

  it('refuse une entrée incohérente plutôt que de fausser la mesure', () => {
    recordWriting({ ...entree('2026-04-01', 9), total: 4 }); // satisfaits > total
    recordWriting({ ...entree('pas-une-date', 1) });
    recordWriting({ ...entree('2026-04-02', 1), total: 0 });
    expect(readLearningLog()).toEqual([]);
  });

  it('ignore un contenu corrompu au lieu de planter', () => {
    localStorage.setItem(LEARNING_LOG_KEY, '{ pas du json');
    expect(readLearningLog()).toEqual([]);
  });

  it('plafonne le journal en gardant les entrées récentes', () => {
    for (let i = 0; i < LOG_MAX + 25; i += 1) {
      recordWriting(entree(`2026-01-${String((i % 28) + 1).padStart(2, '0')}`, 2, 4, `f${i}`));
    }
    expect(readLearningLog().length).toBeLessThanOrEqual(LOG_MAX);
  });

  it('survit à un stockage refusé', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('plein');
    });
    expect(() => recordWriting(entree('2026-04-03', 2))).not.toThrow();
    spy.mockRestore();
  });

  it('donne la date du jour au bon format', () => {
    expect(aujourdHui(new Date('2026-05-09T21:00:00Z'))).toBe('2026-05-09');
  });
});

describe('progression par famille de consigne', () => {
  it('ne conclut pas sous le seuil de rédactions', () => {
    const journal = [entree('2026-04-01', 1), entree('2026-04-02', 4, 4, 'verb_analyser', 'bac2024_s1_e3')];
    const p = progressionParFamille(journal)[0];
    expect(journal.length).toBeLessThan(SEUIL_FAMILLE);
    expect(p.tendance).toBe('insuffisant');
    expect(p.deltaPourcent).toBe(0);
  });

  it('détecte un progrès réel entre la première et la seconde moitié', () => {
    const journal = [
      entree('2026-04-01', 1), entree('2026-04-02', 1),
      entree('2026-04-10', 4, 4, 'verb_analyser', 'bac2024_s1_e3'),
      entree('2026-04-11', 4, 4, 'verb_analyser', 'bac2022_s2_e3'),
    ];
    const p = progressionParFamille(journal)[0];
    expect(p.tendance).toBe('progres');
    expect(p.deltaPourcent).toBeGreaterThanOrEqual(50);
  });

  it('appelle « stable » une variation qui n’est que du bruit', () => {
    const journal = [
      entree('2026-04-01', 3), entree('2026-04-02', 3),
      entree('2026-04-03', 3, 4, 'verb_analyser', 'bac2024_s1_e3'),
      entree('2026-04-04', 3, 4, 'verb_analyser', 'bac2022_s2_e3'),
    ];
    expect(progressionParFamille(journal)[0].tendance).toBe('stable');
  });

  it('signale un recul sans l’habiller', () => {
    const journal = [
      entree('2026-04-01', 4), entree('2026-04-02', 4),
      entree('2026-04-03', 1, 4, 'verb_analyser', 'bac2024_s1_e3'),
      entree('2026-04-04', 1, 4, 'verb_analyser', 'bac2022_s2_e3'),
    ];
    expect(progressionParFamille(journal)[0].tendance).toBe('recul');
  });
});

describe('couverture par unité', () => {
  it('confronte le travail écrit au poids réel de chaque unité', () => {
    const journal = [entree('2026-04-01', 3, 4, 'verb_analyser', 'bac2023_s2_e3')]; // U6
    const couverture = couvertureParUnite(journal);
    expect(couverture[0].partExamen).toBeGreaterThanOrEqual(couverture[1].partExamen);
    expect(couverture.find((c) => c.unitId === 6)!.redactions).toBe(1);
    expect(couverture.find((c) => c.unitId === 4)!.redactions).toBe(0);
  });
});

describe('verdict global', () => {
  it('refuse de conclure sur trop peu de rédactions', () => {
    const v = verdictProgression([entree('2026-04-01', 2), entree('2026-04-02', 3)]);
    expect(v.concluant).toBe(false);
    expect(v.messageAr).toContain('تخميناً');
    expect(v.redactions).toBeLessThan(SEUIL_VERDICT);
  });

  it('annonce un progrès chiffré quand il est réel', () => {
    const journal = Array.from({ length: 8 }, (_, i) =>
      entree(`2026-04-0${i + 1}`, i < 4 ? 1 : 4, 4, 'verb_analyser', `idee${i}`),
    );
    const v = verdictProgression(journal);
    expect(v.concluant).toBe(true);
    expect(v.deltaGlobal).toBeGreaterThan(50);
    expect(v.messageAr).toContain('تقدّم');
  });

  it('dit « stable » sans le déguiser en progrès', () => {
    const journal = Array.from({ length: 8 }, (_, i) =>
      entree(`2026-04-0${i + 1}`, 3, 4, 'verb_analyser', `idee${i}`),
    );
    const v = verdictProgression(journal);
    expect(v.deltaGlobal).toBe(0);
    expect(v.messageAr).toContain('الاستقرار ليس تقدّماً');
  });

  it('désigne l’unité lourde jamais travaillée', () => {
    const journal = Array.from({ length: 8 }, (_, i) =>
      entree(`2026-04-0${i + 1}`, 3, 4, 'verb_analyser', 'bac2023_s2_e3'),
    );
    const v = verdictProgression(journal);
    expect(v.angleMort).not.toBeNull();
    expect(v.angleMort!.partExamen).toBeGreaterThanOrEqual(10);
    expect(v.angleMort!.redactions).toBe(0);
  });

  it('compte les jours actifs, pas les ouvertures', () => {
    const journal = [
      entree('2026-04-01', 2, 4, 'verb_analyser', 'a'),
      entree('2026-04-01', 2, 4, 'verb_expliquer', 'b'),
      entree('2026-04-02', 2, 4, 'verb_analyser', 'c'),
    ];
    expect(verdictProgression(journal).joursActifs).toBe(2);
  });
});
