// profilEleve.test.ts — VERROU DU PROFIL ÉLÈVE MINIMAL (R1, audit coach
// 2026-11-06 ; GO propriétaire : panneau dans حسابي, objectif LOCAL ET INERTE).
//
// Ce que ce fichier empêche de régresser :
//   · le stockage est LOCAL et SUPPORTE l'absence/corruption (profil vide,
//     jamais une hypothèse « moderne » inventée) ;
//   · la cible reste sur l'échelle /20 — hors échelle, refus silencieux ;
//   · EFFACEMENT réel (l'élève reste propriétaire de ses données).
import { afterEach, describe, expect, it } from 'vitest';
import {
  CLE_PROFIL_ELEVE,
  FILIERE_PROFIL_AR,
  OBJECTIF_NOTE_SUR,
  OBJECTIFS_NOTE_PROPOSES,
  PROFIL_ELEVE_VIDE,
  effacerProfilEleve,
  enregistrerObjectifNote,
  lireProfilEleve,
} from '../profilEleve';

afterEach(() => {
  localStorage.clear();
});

describe('lireProfilEleve — l\'absence et la corruption répondent « rien encore »', () => {
  it('stockage vide → profil vide (pas une cible présumée)', () => {
    expect(lireProfilEleve()).toEqual(PROFIL_ELEVE_VIDE);
  });

  it('JSON corrompu → profil vide (le téléphone reste maître de ses secrets)', () => {
    localStorage.setItem(CLE_PROFIL_ELEVE, '{{{pas du JSON');
    expect(lireProfilEleve()).toEqual(PROFIL_ELEVE_VIDE);
  });

  it('JSON de forme inconnue → profil vide (une forme étrangère ne fait pas un profil)', () => {
    localStorage.setItem(CLE_PROFIL_ELEVE, JSON.stringify({ autreChose: true }));
    expect(lireProfilEleve()).toEqual(PROFIL_ELEVE_VIDE);
  });
});

describe('enregistrerObjectifNote — l\'échelle /20 est une borne, pas une opinion', () => {
  it('une cible dans l\'échelle est retenue, et relue du stockage', () => {
    enregistrerObjectifNote(16);
    expect(lireProfilEleve().objectifNote).toBe(16);
    expect(lireProfilEleve().majMs).toBeGreaterThan(0);
  });

  it('les frontières 0 et 20 sont acceptées ; hors échelle, refus silencieux', () => {
    enregistrerObjectifNote(0);
    expect(lireProfilEleve().objectifNote).toBe(0);
    enregistrerObjectifNote(OBJECTIF_NOTE_SUR);
    expect(lireProfilEleve().objectifNote).toBe(OBJECTIF_NOTE_SUR);

    enregistrerObjectifNote(21); // hors échelle
    enregistrerObjectifNote(-1); // absurde
    enregistrerObjectifNote(Number.NaN); // pas un nombre
    enregistrerObjectifNote(Number.POSITIVE_INFINITY);
    expect(lireProfilEleve().objectifNote).toBe(OBJECTIF_NOTE_SUR); // inchangée
  });

  it('les cibles proposées restent toutes dans l\'échelle (aucune invention)', () => {
    for (const note of OBJECTIFS_NOTE_PROPOSES) {
      expect(note).toBeGreaterThanOrEqual(0);
      expect(note).toBeLessThanOrEqual(OBJECTIF_NOTE_SUR);
    }
  });

  it('l\'échelle est le barème RÉEL du BAC algérien (/20), figé au mot', () => {
    expect(OBJECTIF_NOTE_SUR).toBe(20);
  });
});

describe('effacerProfilEleve — l\'élève reste propriétaire', () => {
  it('effacement réel : rien n\'en reste', () => {
    enregistrerObjectifNote(14);
    expect(lireProfilEleve().objectifNote).toBe(14);
    effacerProfilEleve();
    expect(lireProfilEleve()).toEqual(PROFIL_ELEVE_VIDE);
    expect(localStorage.getItem(CLE_PROFIL_ELEVE)).toBeNull();
  });
});

describe('la filière est un CONSTAT affiché — l\'app ne sert qu\'elle', () => {
  it('le libellé nomme le corpus réel de l\'app (فصحى, sans dialecte)', () => {
    expect(FILIERE_PROFIL_AR).toContain('العلوم التجريبية');
    expect(FILIERE_PROFIL_AR).toContain('علوم الطبيعة والحياة');
  });
});
