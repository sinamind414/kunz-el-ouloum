// backup.test.ts — sauvegarde et restauration de la progression (sprint 46).

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LEARNING_LOG_KEY, readLearningLog, recordWriting } from './learningLog';
import { DRILL_LOG_KEY, readDrillLog, recordDrill } from './drillLog';
import {
  BACKUP_SCHEMA,
  creerBackup,
  estCleApplicative,
  nomFichierBackup,
  restaurerBackup,
  serialiserBackup,
} from './backup';

beforeEach(() => localStorage.clear());

describe('périmètre de la sauvegarde', () => {
  it('reconnaît les clés de l’application', () => {
    for (const cle of ['kunz.revisionPlan.14x90', 'kunz_lois_absolues_v2', 'svt_progress', 'theme']) {
      expect(estCleApplicative(cle), cle).toBe(true);
    }
  });

  it('exclut les jetons d’authentification', () => {
    expect(estCleApplicative('boussole_token')).toBe(false);
    expect(estCleApplicative('boussole_teacher_token')).toBe(false);
  });

  it('ignore les clés d’autres sites ou extensions', () => {
    expect(estCleApplicative('ga_session')).toBe(false);
    expect(estCleApplicative('debug')).toBe(false);
  });

  it('n’emporte que ce qui appartient à l’app', () => {
    localStorage.setItem('svt_progress', '{"xp":120}');
    localStorage.setItem('kunz.bacTrainer.bac2023_s2_e3.verb_analyser', 'نص');
    localStorage.setItem('boussole_token', 'secret');
    localStorage.setItem('autre_site', 'x');
    const backup = creerBackup();
    expect(Object.keys(backup.donnees).sort()).toEqual([
      'kunz.bacTrainer.bac2023_s2_e3.verb_analyser',
      'svt_progress',
    ]);
    expect(backup.nbCles).toBe(2);
    expect(backup.schema).toBe(BACKUP_SCHEMA);
  });

  it('propose un nom de fichier daté', () => {
    expect(nomFichierBackup(new Date('2026-04-12T10:00:00Z'))).toBe('kunz-sauvegarde-2026-04-12.json');
  });
});

describe('aller-retour complet', () => {
  it('restaure fidèlement une sauvegarde', () => {
    localStorage.setItem('svt_progress', '{"xp":120}');
    localStorage.setItem('kunz.examSession', '{"numero":3}');
    const json = serialiserBackup();

    localStorage.clear();
    const resultat = restaurerBackup(json);
    expect(resultat.ok).toBe(true);
    expect(resultat.restaurees).toBe(2);
    expect(localStorage.getItem('svt_progress')).toBe('{"xp":120}');
    expect(localStorage.getItem('kunz.examSession')).toBe('{"numero":3}');
  });

  it('refuse un fichier illisible', () => {
    const r = restaurerBackup('pas du json');
    expect(r.ok).toBe(false);
    expect(r.erreurAr).toContain('غير صالح');
  });

  it('refuse une sauvegarde d’une autre application ou d’un autre schéma', () => {
    const r = restaurerBackup(JSON.stringify({ schema: 'autre.v9', donnees: { svt_progress: '{}' } }));
    expect(r.ok).toBe(false);
    expect(localStorage.getItem('svt_progress')).toBeNull();
  });

  it('ignore et signale les clés étrangères plutôt que de les écrire', () => {
    const r = restaurerBackup(
      JSON.stringify({
        schema: BACKUP_SCHEMA,
        donnees: { svt_progress: '{"xp":1}', boussole_token: 'vole', autre: 'x', mauvais: 42 },
      }),
    );
    expect(r.ok).toBe(true);
    expect(r.restaurees).toBe(1);
    expect(r.ignorees.sort()).toEqual(['autre', 'boussole_token', 'mauvais']);
    expect(localStorage.getItem('boussole_token')).toBeNull();
  });

  it('signale un stockage plein sans prétendre avoir réussi', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded');
    });
    const r = restaurerBackup(JSON.stringify({ schema: BACKUP_SCHEMA, donnees: { svt_progress: '{}' } }));
    expect(r.ok).toBe(false);
    expect(r.erreurAr).toContain('ممتلئة');
    spy.mockRestore();
  });

  it('survit à un stockage inaccessible à l’export', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqué');
    });
    localStorage.setItem('svt_progress', '{}');
    expect(() => creerBackup()).not.toThrow();
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Sprint 68 — non-régression : chaque journal d'apprentissage ajouté depuis le
// sprint 62 doit entrer dans la sauvegarde. Un élève qui change de téléphone
// ne doit pas perdre la seule trace qui prouve qu'il progresse. Ce test
// échouera si un futur journal est créé hors du préfixe « kunz. ».
// ---------------------------------------------------------------------------

describe('les journaux d’apprentissage sont sauvegardés', () => {
  it('emporte la rédaction et les schémas refaits de mémoire', () => {
    recordWriting({ date: '2026-05-10', ideaId: 'bac2023_s2_e3', familyId: 'verb_analyser', satisfaits: 3, total: 4, mots: 70 });
    recordDrill({ date: '2026-05-10', drillId: 'drill_synapse', unitId: 5, score: 12, total: 16, oublisEssentiels: 0 });

    const sauvegarde = creerBackup();
    expect(Object.keys(sauvegarde.donnees)).toEqual(
      expect.arrayContaining([LEARNING_LOG_KEY, DRILL_LOG_KEY]),
    );

    localStorage.clear();
    const r = restaurerBackup(serialiserBackup(sauvegarde));
    expect(r.ok).toBe(true);
    expect(readLearningLog()).toHaveLength(1);
    expect(readDrillLog()).toHaveLength(1);
  });
});
