// backup.test.ts — sauvegarde et restauration de la progression (sprint 46).

import { beforeEach, describe, expect, it, vi } from 'vitest';
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

  // H8 (audit « architecture » 19/10/2026) : les familles oubliées par
  // l'ancienne liste — capitaine, tirets, tuteur, taille du texte.
  it('couvre les clés du capitaine, du tuteur et des préférences (H8)', () => {
    for (const cle of [
      'boussole_profil_erreurs',
      'boussole_relais_v1',
      'boussole_prescriptions_v1',
      'boussole_activity_queue',
      'boussole_student',
      'kunz-rappel-adaptatif-v1',
      'kunz-gesture-recall-v1',
      'bonz_taille_texte',
      'smart_tutor_session',
      'kunz_v3:drill_days',
      'kunz_qcm_memoire_v1',
    ]) {
      expect(estCleApplicative(cle), cle).toBe(true);
    }
  });

  it('ne reconnaît plus la clé morte scheduledReminderTime', () => {
    expect(estCleApplicative('scheduledReminderTime')).toBe(false);
  });

  it('ignore les clés d’autres sites ou extensions', () => {
    expect(estCleApplicative('ga_session')).toBe(false);
    expect(estCleApplicative('debug')).toBe(false);
  });

  it('n’emporte que ce qui appartient à l’app', () => {
    localStorage.setItem('svt_progress', '{"xp":120}');
    localStorage.setItem('kunz.bacTrainer.bac2023_s2_e3.verb_analyser', 'نص');
    // H8 : la mémoire du capitaine voyage avec le reste.
    localStorage.setItem('boussole_profil_erreurs', '{"erreurs":3}');
    localStorage.setItem('boussole_token', 'secret');
    localStorage.setItem('autre_site', 'x');
    const backup = creerBackup();
    expect(Object.keys(backup.donnees).sort()).toEqual([
      'boussole_profil_erreurs',
      'kunz.bacTrainer.bac2023_s2_e3.verb_analyser',
      'svt_progress',
    ]);
    expect(backup.nbCles).toBe(3);
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
