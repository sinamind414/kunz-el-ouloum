// store.degraded.test.ts — le serveur démarre sans persistance (sprint 58).

import { describe, expect, it, vi } from 'vitest';
import { DegradedStore, openStoreOrDegrade } from './store.degraded';

describe('ouverture du store', () => {
  it('renvoie le store normal quand l’ouverture réussit', () => {
    const vrai = { degraded: false };
    expect(openStoreOrDegrade(() => vrai)).toBe(vrai);
  });

  it('bascule en mode dégradé au lieu de laisser l’exception tuer le serveur', () => {
    const journal = vi.fn();
    const store = openStoreOrDegrade(() => {
      throw new Error('Could not locate the bindings file');
    }, journal);
    expect(store).toBeInstanceOf(DegradedStore);
    expect(journal).toHaveBeenCalledOnce();
    const message = journal.mock.calls[0][0] as string;
    expect(message).toContain('MODE DÉGRADÉ');
    expect(message).toContain('bindings');
    // Le message doit dire ce qui marche encore, pas seulement ce qui casse.
    expect(message).toContain('fonctionne normalement');
    expect(message).toContain('npm rebuild better-sqlite3');
  });
});

describe('store dégradé', () => {
  const store = new DegradedStore('binaire natif absent');

  it('répond aux lectures par du vide, sans jamais lever', () => {
    expect(store.countStudents()).toBe(0);
    expect(store.countTeachers()).toBe(0);
    expect(store.listEntries()).toEqual([]);
    expect(store.dashboardRows()).toEqual([]);
    expect(store.findStudentByEmail()).toBeUndefined();
  });

  it('refuse les écritures avec un 503 explicite, jamais en silence', () => {
    for (const ecrire of [
      () => store.createStudent(),
      () => store.createTeacher(),
      () => store.pushActivity(),
      () => store.addEntriesIfNew(),
      () => store.bulkImport(),
    ]) {
      let capturee: (Error & { statusCode?: number }) | null = null;
      try {
        ecrire();
      } catch (e) {
        capturee = e as Error & { statusCode?: number };
      }
      expect(capturee, 'une écriture doit échouer bruyamment').not.toBeNull();
      expect(capturee!.statusCode).toBe(503);
      expect(capturee!.message).toContain('mode dégradé');
    }
  });

  it('exporte un flux vide plutôt que d’interrompre un téléchargement', async () => {
    const lignes: unknown[] = [];
    for await (const ligne of store.iterateExportRows()) lignes.push(ligne);
    expect(lignes).toEqual([]);
  });

  it('se ferme sans effet de bord', () => {
    expect(() => store.close()).not.toThrow();
  });
});
