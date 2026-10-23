// storeFacturation.lock.test.ts — le contrat facturation du store SQLite
// RÉEL (better-sqlite3 :memory:) : schéma licences, migration de la colonne
// abonnement_expire_le sur une base ancienne, idempotence d'activation.
// Aucun mock : la vraie base parle.
import { describe, expect, it } from 'vitest';
import { SqliteStore } from './store';
import { activerAbonnement, appareilAutorise } from '../src/server/facturation';

describe('SqliteStore — contrat facturation', () => {
  it('crée des licences et les retrouve canoniques', () => {
    const store = new SqliteStore(':memory:');
    try {
      const creees = store.creerLicences(['KUNZ-AB2C-9XYZ', 'KUNZ-DE3F-7H2K'], 'lot test', '2026-10-24T00:00:00Z');
      expect(creees).toBe(2);
      // Idempotence : rejouer le même lot ne duplique rien.
      expect(store.creerLicences(['KUNZ-AB2C-9XYZ'], 'lot test', '2026-10-24T00:00:00Z')).toBe(0);

      const l = store.trouverLicence('KUNZ-AB2C-9XYZ');
      expect(l).toEqual({ code: 'KUNZ-AB2C-9XYZ', utilisePar: null, expireLe: null, appareils: [] });
      expect(store.trouverLicence('KUNZ-XXXX-YYYY')).toBeUndefined();
    } finally {
      store.close();
    }
  });

  it('une base ANCIENNE (sans colonne abonnement) est migrée automatiquement', () => {
    const store = new SqliteStore(':memory:');
    try {
      // La migration tourne au constructeur : la colonne existe et la lecture
      // n'explose pas pour un compte créé avant la facturation.
      const student = store.createStudent('stu_ancien', 'a@ecole.dz', 'hash', 'Ancien');
      expect(student.abonnementExpireLe).toBeFalsy(); // absent/undefined : jamais l'essai
      expect(store.abonnementDe('stu_ancien')).toBeNull();
    } finally {
      store.close();
    }
  });

  it('activation de bout en bout sur le store réel (code vierge puis réutilisé)', async () => {
    const store = new SqliteStore(':memory:');
    try {
      store.creerLicences(['KUNZ-AB2C-9XYZ'], 'integration', '2026-10-24T00:00:00Z');
      const eleve = store.createStudent('stu_1', 's1@ecole.dz', 'h', 'Un');
      const autre = store.createStudent('stu_2', 's2@ecole.dz', 'h', 'Deux');

      const r1 = await activerAbonnement(store, {
        eleveId: eleve.id,
        code: 'kunz-ab2c-9xyz',
        maintenant: new Date('2026-11-20T00:00:00.000Z'),
      });
      expect(r1.ok).toBe(true);
      if (r1.ok) expect(r1.expireLe).toBe('2027-06-30');
      expect(store.abonnementDe('stu_1')).toBe('2027-06-30');
      // Le student RELU porte l'échéance (mapStudent lit la nouvelle colonne).
      expect(store.findStudentById('stu_1')?.abonnementExpireLe).toBe('2027-06-30');

      // Un AUTRE élève ne peut pas consommer la même licence.
      const r2 = await activerAbonnement(store, { eleveId: autre.id, code: 'KUNZ-AB2C-9XYZ' });
      expect(r2).toEqual({ ok: false, statut: 409, erreur: 'code_deja_utilise' });
      expect(store.abonnementDe('stu_2')).toBeNull();
    } finally {
      store.close();
    }
  });

  it('liaison appareil sur le STORE RÉEL : UN seul appareil, le 2e refusé', async () => {
    const store = new SqliteStore(':memory:');
    try {
      store.creerLicences(['KUNZ-DE3F-7H2K'], 'appareils', '2026-10-24T00:00:00Z');
      const eleve = store.createStudent('stu_dev', 'd@ecole.dz', 'h', 'Dev');
      const r1 = await activerAbonnement(store, { eleveId: eleve.id, code: 'KUNZ-DE3F-7H2K', appareilId: 'empreinte-1' });
      expect(r1.ok).toBe(true);
      const r2 = await activerAbonnement(store, { eleveId: eleve.id, code: 'KUNZ-DE3F-7H2K', appareilId: 'empreinte-2' });
      expect(r2).toEqual({ ok: false, statut: 409, erreur: 'code_appareils_pleins' });
      // Le contrôle à l'ouverture : son appareil passe, un autre non.
      const licence = store.licenceDe('stu_dev');
      expect(licence?.appareils).toEqual(['empreinte-1']);
      expect(appareilAutorise(licence, 'empreinte-1')).toBe(true);
      expect(appareilAutorise(licence, 'empreinte-2')).toBe(false);
    } finally {
      store.close();
    }
  });

  it('marquerLicenceUtilisee refuse un code déjà pris par un autre (garde SQL)', () => {
    const store = new SqliteStore(':memory:');
    try {
      store.creerLicences(['KUNZ-DE3F-7H2K'], 'garde', '2026-10-24T00:00:00Z');
      expect(store.marquerLicenceUtilisee('KUNZ-DE3F-7H2K', 'stu_A', '2027-06-30')).toBe(true);
      expect(store.marquerLicenceUtilisee('KUNZ-DE3F-7H2K', 'stu_B', '2027-06-30')).toBe(false);
      // Son propriétaire peut le re-marquer (idempotence).
      expect(store.marquerLicenceUtilisee('KUNZ-DE3F-7H2K', 'stu_A', '2027-06-30')).toBe(true);
    } finally {
      store.close();
    }
  });
});
