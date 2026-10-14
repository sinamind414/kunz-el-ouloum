// serie.test.ts — verrous de la série de jours (H3).
//
// Ce fichier existe parce que le défaut qu'il couvre est resté invisible trois
// semaines : `streakDays` et `streak` n'étaient JAMAIS écrits, donc les badges
// 7 jours / 30 jours ne pouvaient pas se débloquer, alors que quatre écrans les
// affichaient. Une règle testée vaut mieux qu'un affichage convaincant.

import { describe, expect, it } from 'vitest';
import { etatSerie, enregistrerJourActif, palierAtteint, serieAffichee, PALIERS_SERIE } from '../serie';

describe('enregistrerJourActif — la règle de la série', () => {
  it('première activité : la série démarre à 1', () => {
    const r = enregistrerJourActif(etatSerie(null, 0), '2026-10-14');
    expect(r.etat).toEqual({ jours: 1, dernierJour: '2026-10-14' });
    expect(r.nouveauJour).toBe(true);
    expect(r.serieRompue).toBe(false);
    expect(r.palier).toBeNull();
  });

  it('activité le lendemain : +1', () => {
    const r = enregistrerJourActif(etatSerie('2026-10-13', 1), '2026-10-14');
    expect(r.etat.jours).toBe(2);
    expect(r.nouveauJour).toBe(true);
    expect(r.serieRompue).toBe(false);
  });

  it('rejouer le même jour ne gonfle PAS la série (anti-farm)', () => {
    const r = enregistrerJourActif(etatSerie('2026-10-14', 4), '2026-10-14');
    expect(r.etat.jours).toBe(4);
    expect(r.nouveauJour).toBe(false);
    expect(r.palier).toBeNull();
  });

  it('un jour manqué remet la série à 1 et le signale', () => {
    const r = enregistrerJourActif(etatSerie('2026-10-11', 12), '2026-10-14');
    expect(r.etat.jours).toBe(1);
    expect(r.serieRompue).toBe(true);
  });

  it('une semaine complète mène au palier 7, une seule fois', () => {
    let etat = etatSerie(null, 0);
    const paliers: (number | null)[] = [];
    for (let j = 8; j <= 14; j++) {
      const r = enregistrerJourActif(etat, `2026-10-${String(j).padStart(2, '0')}`);
      etat = r.etat;
      paliers.push(r.palier);
    }
    expect(etat.jours).toBe(7);
    expect(paliers.filter((p) => p === 7)).toHaveLength(1);
    expect(paliers[paliers.length - 1]).toBe(7);
  });

  it('trente jours consécutifs atteignent le palier 30', () => {
    let etat = etatSerie(null, 0);
    let palier30 = 0;
    for (let j = 0; j < 30; j++) {
      const jour = new Date(2026, 8, 1 + j); // 1er sept. → 30 sept. 2026
      const cle = `${jour.getFullYear()}-${String(jour.getMonth() + 1).padStart(2, '0')}-${String(jour.getDate()).padStart(2, '0')}`;
      const r = enregistrerJourActif(etat, cle);
      etat = r.etat;
      if (r.palier === 30) palier30++;
    }
    expect(etat.jours).toBe(30);
    expect(palier30).toBe(1);
  });

  it('une horloge reculée ne fabrique pas une série (départ prudent à 1)', () => {
    const r = enregistrerJourActif(etatSerie('2026-10-20', 9), '2026-10-14');
    expect(r.etat.jours).toBe(1);
    expect(r.nouveauJour).toBe(true);
  });
});

describe('palierAtteint / PALIERS_SERIE', () => {
  it('les paliers sont exactement ceux des badges de l’app', () => {
    expect([...PALIERS_SERIE]).toEqual([7, 30]);
  });

  it('seuls 7 et 30 sont des paliers', () => {
    expect(palierAtteint(7)).toBe(7);
    expect(palierAtteint(30)).toBe(30);
    expect(palierAtteint(8)).toBeNull();
    expect(palierAtteint(0)).toBeNull();
  });
});

describe('serieAffichee — ne jamais afficher une série morte', () => {
  it('affiche la série si l’activité est d’aujourd’hui', () => {
    expect(serieAffichee(etatSerie('2026-10-14', 5), '2026-10-14')).toBe(5);
  });

  it('affiche encore la série si le dernier jour est hier (jour en cours)', () => {
    expect(serieAffichee(etatSerie('2026-10-13', 5), '2026-10-14')).toBe(5);
  });

  it('affiche 0 dès qu’un jour a été manqué', () => {
    expect(serieAffichee(etatSerie('2026-10-12', 5), '2026-10-14')).toBe(0);
  });

  it('affiche 0 sans aucune activité enregistrée', () => {
    expect(serieAffichee(etatSerie(null, 5), '2026-10-14')).toBe(0);
  });
});

describe('etatSerie — robustesse aux données stockées abîmées', () => {
  it('neutralise les valeurs négatives, non finies ou absentes', () => {
    expect(etatSerie(undefined, undefined)).toEqual({ jours: 0, dernierJour: null });
    expect(etatSerie('2026-10-14', -3).jours).toBe(0);
    expect(etatSerie('2026-10-14', Number.NaN).jours).toBe(0);
    expect(etatSerie('2026-10-14', 2.7).jours).toBe(2);
  });
});
