// tadwinEngine.test.ts — Tests de l'orchestrateur runtime V1 de Tadwin.
//
// Convention du repo : pas de @testing-library/jest-dom ; .toBeTruthy() /
// .toBeNull() / .toHaveLength(). cleanup() explicite. Réponses modèles en
// prose فصحًى naturelle, jamais des listes de mots-clés.

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  PALIERS,
  PALIER_MAX,
  configPalier,
  lireEtat,
  ecrireEtat,
  lireFiches,
  ecrireFiches,
  etatParDefaut,
  evaluerProduction,
  retourDirect,
  enregistrerFiche,
  ficheDue,
  enregistrerRappel,
  fichesDuees,
  avancerPalier,
  palierValide,
  demarrerDefi,
  defiEnCours,
  defiTermine,
  joursRestantsDefi,
  ETIQUETTE_NOTATION,
  type EtatTadwin,
  type FicheTadwin,
  type EvenementPalier,
} from './tadwinEngine';
import type { ChoixCles } from '../validation/couvCle';

const CLE_PALIER = 'kunz_tadwin_etat_v1';
const CLE_FICHES = 'kunz_tadwin_fiches_v1';

const U1_CHOIX: ChoixCles = {
  uniteId: 1,
  clesChoisies: ['استنساخ (النواة/ARN بوليميراز)', 'ARNm'],
};

const REPONSE_MODELE_U1_PARTIELLE =
  'تتمثل المرحلة الأولى من التعبير المورثي في استنساخ المعلومة الوراثية داخل النواة، ' +
  'حيث تتدخل إنزيمة ARN بوليميراز لتركيب جزيئة ARNm انطلاقاً من إحدى سلسلتي ADN.';

const REPONSE_BOURRAGE = 'النواة النواة النواة النواة النواة النواة النواة النواة';

const T0 = 1_700_000_000_000; // 14 nov 2023 — ancre déterministe
const JOUR = 24 * 60 * 60 * 1000;

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ──────────────────────────────────────────────────────────────────────────────
// 1. Paliers — configuration et clamping
// ──────────────────────────────────────────────────────────────────────────────

describe('tadwinEngine — paliers (Spec §5)', () => {
  it('définit exactement 5 paliers numérotés 0..4', () => {
    expect(PALIERS).toHaveLength(5);
    expect(PALIERS.map((p) => p.palier)).toEqual([0, 1, 2, 3, 4]);
    expect(PALIER_MAX).toBe(4);
  });

  it('palier 0 (الصدمة) : pas de notation, pas de gabarit, rappel actif', () => {
    const c = configPalier(0);
    expect(c.notationActive).toBe(false);
    expect(c.gabaritPreRempli).toBe(false);
    expect(c.rappelActif).toBe(true);
  });

  it('palier 1 (موجّه) : gabarit pré-rempli + indices, pas de notation', () => {
    const c = configPalier(1);
    expect(c.gabaritPreRempli).toBe(true);
    expect(c.indicesAutorises).toBe(true);
    expect(c.notationActive).toBe(false);
  });

  it('palier 2 (مُساعَد) : gabarit vide + alerte bourrage en direct, pas de notation', () => {
    const c = configPalier(2);
    expect(c.gabaritPreRempli).toBe(false);
    expect(c.alerteBourrageDirect).toBe(true);
    expect(c.notationActive).toBe(false);
  });

  it('palier 3 (مستقل) : sélection des clés + chronomètre + notation', () => {
    const c = configPalier(3);
    expect(c.selectionCles).toBe(true);
    expect(c.chronometreDoux).toBe(true);
    expect(c.notationActive).toBe(true);
  });

  it('palier 4 (التثبيت) : rappel espacé sur carnet masqué', () => {
    const c = configPalier(4);
    expect(c.rappelActif).toBe(true);
    expect(c.carnetMasque).toBe(true);
    expect(c.notationActive).toBe(false);
  });

  it('clampe les paliers hors bornes (état corrompu)', () => {
    expect(configPalier(-5).palier).toBe(0);
    expect(configPalier(99).palier).toBe(4);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 2. Persistance de l'état (défensive comme store.ts)
// ──────────────────────────────────────────────────────────────────────────────

describe('tadwinEngine — persistance état + carnet', () => {
  it('état par défaut = unité 1, palier 0', () => {
    localStorage.removeItem(CLE_PALIER);
    expect(lireEtat()).toEqual(etatParDefaut());
  });

  it('ecrire/lire l\'état fait un aller-retour', () => {
    const etat: EtatTadwin = { uniteId: 5, palier: 3, defiDebutAt: T0 };
    ecrireEtat(etat);
    expect(lireEtat()).toEqual(etat);
  });

  it('état corrompu (JSON invalide) → défaut sûr', () => {
    localStorage.setItem(CLE_PALIER, '{not json');
    expect(lireEtat()).toEqual(etatParDefaut());
  });

  it('état partiellement valide → valeurs par défaut sur les champs manquants', () => {
    localStorage.setItem(CLE_PALIER, JSON.stringify({ uniteId: 7 }));
    const etat = lireEtat();
    expect(etat.uniteId).toBe(7);
    expect(etat.palier).toBe(0);
    expect(etat.defiDebutAt).toBeUndefined();
  });

  it('palier hors bornes dans le store → clampé', () => {
    localStorage.setItem(CLE_PALIER, JSON.stringify({ uniteId: 1, palier: 42 }));
    expect(lireEtat().palier).toBe(4);
  });

  it('carnet vide par défaut', () => {
    expect(lireFiches()).toEqual([]);
  });

  it('carnet corrompu (non-tableau) → vide', () => {
    localStorage.setItem(CLE_FICHES, JSON.stringify({ pas: 'une liste' }));
    expect(lireFiches()).toEqual([]);
  });

  it('carnet : filtre les entrées sans id valide', () => {
    localStorage.setItem(
      CLE_FICHES,
      JSON.stringify([{ id: 'ok', uniteId: 1 }, { pasId: true }, null]),
    );
    expect(lireFiches()).toHaveLength(1);
  });

  it('carnet : plafonne à MAX_FICHES en gardant les plus récentes', () => {
    const fiches: FicheTadwin[] = Array.from({ length: 250 }, (_, i) => ({
      id: `f${i}`,
      uniteId: 1,
      clesChoisies: [],
      reponse: '',
      c2: 0,
      stuffingDetecte: false,
      palier: 3,
      creeLe: T0 + i * 1000,
      rappelStage: 0,
      prochainRappelAt: T0 + JOUR,
      maitrise: 'en_cours' as const,
    }));
    ecrireFiches(fiches);
    const lues = lireFiches();
    expect(lues).toHaveLength(200);
    expect(lues[0].creeLe).toBe(T0 + 249 * 1000);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 3. Verdict palier 3 — C3 + C2 + C4, un seul conseil
// ──────────────────────────────────────────────────────────────────────────────

describe('tadwinEngine — evaluerProduction (palier 3)', () => {
  it('réponse modèle couvrant 2 clés → C2 = 1, verdict positif', () => {
    const r = evaluerProduction(REPONSE_MODELE_U1_PARTIELLE, U1_CHOIX);
    expect(r.c2).toBe(1);
    expect(r.detail).toHaveLength(2);
    expect(r.stuffing.stuffing_detected).toBe(false);
    expect(r.verdictAr).toContain('زبدة');
    expect(r.cleLaPlusFaible).toBeUndefined();
  });

  it('étiquette « ليست نقطة البكالوريا » — jamais remontée dans evaluerCopies', () => {
    const r = evaluerProduction(REPONSE_MODELE_U1_PARTIELLE, U1_CHOIX);
    expect(r.etiquetteAr).toBe(ETIQUETTE_NOTATION);
  });

  it('conseil unique et actionnable sur clé manquante', () => {
    const r = evaluerProduction('الترجمة تتم على الريبوزوم', U1_CHOIX);
    expect(r.c2).toBe(0);
    expect(r.conseilAr).toContain(U1_CHOIX.clesChoisies[0]);
    expect(r.cleLaPlusFaible).toBe(U1_CHOIX.clesChoisies[0]);
  });

  it('C3 : bourrage → C2 forcé à 0 + conseil ciblé sur le mot répété', () => {
    const r = evaluerProduction(REPONSE_BOURRAGE, U1_CHOIX);
    expect(r.stuffing.stuffing_detected).toBe(true);
    expect(r.c2).toBe(0);
    expect(r.verdictAr).toContain('تكرار');
    // Le détecteur retourne le mot normalisé (normalizeAr : ة→ه) — le conseil
    // s'appuie sur cette forme, pas sur l'orthographe d'origine.
    expect(r.conseilAr).toContain('النواه');
  });

  it('C4 : nier un atome ne le crédite pas (B2 — réfutation)', () => {
    const r = evaluerProduction(
      'ليس صحيحاً أن الاستنساخ يتم في النواة',
      U1_CHOIX,
    );
    expect(r.c2).toBe(0);
  });

  it('propage ChoixClesInvalide si le dénominateur n\'a pas de valeur (§6)', () => {
    expect(() =>
      evaluerProduction(REPONSE_MODELE_U1_PARTIELLE, {
        uniteId: 1,
        clesChoisies: [U1_CHOIX.clesChoisies[0]],
      }),
    ).toThrow();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 4. Retour en direct (paliers 1-2) — alerte bourrage seulement
// ──────────────────────────────────────────────────────────────────────────────

describe('tadwinEngine — retourDirect (paliers 1-2)', () => {
  it('pas d\'alerte sur une prose normale', () => {
    const r = retourDirect(REPONSE_MODELE_U1_PARTIELLE);
    expect(r.alerteAr).toBeNull();
    expect(r.stuffing.stuffing_detected).toBe(false);
  });

  it('alerte bourrage « ⚠︎ تكرار » sur du remplissage', () => {
    const r = retourDirect(REPONSE_BOURRAGE);
    expect(r.alerteAr).toBe('⚠︎ تكرار — ابحث عن الزبدة');
    expect(r.stuffing.stuffing_detected).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 5. Carnet + rappel espacé J+1/3/7/14 (palier 4)
// ──────────────────────────────────────────────────────────────────────────────

describe('tadwinEngine — carnet + rappel espacé', () => {
  it('enregistrerFiche range la fiche et programme J+1 (stage 0)', () => {
    const fiche = enregistrerFiche(REPONSE_MODELE_U1_PARTIELLE, U1_CHOIX, T0);
    expect(fiche.c2).toBe(1);
    expect(fiche.rappelStage).toBe(0);
    expect(fiche.prochainRappelAt).toBe(T0 + 1 * JOUR);
    expect(fiche.maitrise).toBe('en_cours');
    expect(lireFiches()).toHaveLength(1);
  });

  it('ficheDue : faux avant J+1, vrai à J+1', () => {
    const fiche = enregistrerFiche(REPONSE_MODELE_U1_PARTIELLE, U1_CHOIX, T0);
    expect(ficheDue(fiche, T0)).toBe(false);
    expect(ficheDue(fiche, T0 + JOUR)).toBe(true);
  });

  it('réussite à l\'échéance → stage suivant (J+1 → J+3, ancré sur la création)', () => {
    const fiche = enregistrerFiche(REPONSE_MODELE_U1_PARTIELLE, U1_CHOIX, T0);
    const apres = enregistrerRappel(fiche, true, T0 + JOUR);
    expect(apres.rappelStage).toBe(1);
    expect(apres.prochainRappelAt).toBe(T0 + 3 * JOUR);
    expect(apres.maitrise).toBe('en_cours');
  });

  it('réussite avant l\'échéance → pas de changement (pas de skip)', () => {
    const fiche = enregistrerFiche(REPONSE_MODELE_U1_PARTIELLE, U1_CHOIX, T0);
    const apres = enregistrerRappel(fiche, true, T0 + 1000);
    expect(apres).toEqual(fiche);
  });

  it('échec → cadence redémarrée à J+1 depuis la tentative', () => {
    const fiche = enregistrerFiche(REPONSE_MODELE_U1_PARTIELLE, U1_CHOIX, T0);
    const stage1 = enregistrerRappel(fiche, true, T0 + JOUR);
    const echec = enregistrerRappel(stage1, false, T0 + 3 * JOUR);
    expect(echec.rappelStage).toBe(0);
    expect(echec.prochainRappelAt).toBe(T0 + 3 * JOUR + 1 * JOUR);
    expect(echec.maitrise).toBe('en_cours');
  });

  it('parcours complet J+1→J+3→J+7→J+14 aboutit à la maîtrise', () => {
    let fiche = enregistrerFiche(REPONSE_MODELE_U1_PARTIELLE, U1_CHOIX, T0);
    fiche = enregistrerRappel(fiche, true, T0 + 1 * JOUR);
    expect(fiche.prochainRappelAt).toBe(T0 + 3 * JOUR);
    fiche = enregistrerRappel(fiche, true, T0 + 3 * JOUR);
    expect(fiche.prochainRappelAt).toBe(T0 + 7 * JOUR);
    fiche = enregistrerRappel(fiche, true, T0 + 7 * JOUR);
    expect(fiche.prochainRappelAt).toBe(T0 + 14 * JOUR);
    // Stage max atteint (= J+14 programmé) → maîtrise, comme applyEvidenceToError.
    expect(fiche.rappelStage).toBe(3);
    expect(fiche.maitrise).toBe('maitrise');
    fiche = enregistrerRappel(fiche, true, T0 + 14 * JOUR);
    expect(fiche.rappelStage).toBe(3);
    expect(fiche.maitrise).toBe('maitrise');
  });

  it('fichesDuees : filtre le carnet sur les échéances atteintes', () => {
    enregistrerFiche(REPONSE_MODELE_U1_PARTIELLE, U1_CHOIX, T0);
    enregistrerFiche(REPONSE_MODELE_U1_PARTIELLE, U1_CHOIX, T0 + 5 * JOUR);
    expect(fichesDuees(T0)).toHaveLength(0);
    expect(fichesDuees(T0 + 2 * JOUR)).toHaveLength(1);
    expect(fichesDuees(T0 + 10 * JOUR)).toHaveLength(2);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 6. Avancement des paliers — grille = tentative terminée, jamais un seuil
// ──────────────────────────────────────────────────────────────────────────────

describe('tadwinEngine — avancement des paliers', () => {
  it('palier 0 : une tentative de rappel (= la preuve de l\'oubli) fait avancer', () => {
    const etat = etatParDefaut();
    const ev: EvenementPalier = { type: 'rappel_tente' };
    expect(avancerPalier(etat, ev).palier).toBe(1);
  });

  it('palier 1 : écrire la clé mécanisme fait avancer', () => {
    const etat: EtatTadwin = { uniteId: 1, palier: 1 };
    expect(avancerPalier(etat, { type: 'cle1_ecrite' }).palier).toBe(2);
  });

  it('palier 2 : une fiche assistée terminée fait avancer', () => {
    const etat: EtatTadwin = { uniteId: 1, palier: 2 };
    expect(avancerPalier(etat, { type: 'fiche_assistee_terminee' }).palier).toBe(3);
  });

  it('palier 3 : une fiche autonome terminée fait avancer (pas de seuil de note)', () => {
    const etat: EtatTadwin = { uniteId: 1, palier: 3 };
    expect(avancerPalier(etat, { type: 'fiche_autonome_terminee' }).palier).toBe(4);
  });

  it('un événement qui ne correspond pas à la grille du palier ne fait pas avancer', () => {
    expect(avancerPalier({ uniteId: 1, palier: 0 }, { type: 'fiche_autonome_terminee' }).palier).toBe(0);
    expect(avancerPalier({ uniteId: 1, palier: 3 }, { type: 'cle1_ecrite' }).palier).toBe(3);
  });

  it('palier maximal : on boucle (la consolidation ne se termine jamais)', () => {
    const etat: EtatTadwin = { uniteId: 1, palier: PALIER_MAX };
    expect(avancerPalier(etat, { type: 'rappel_tente' })).toEqual(etat);
  });

  it('avancerPalier est immutable et ne persiste rien', () => {
    const etat = etatParDefaut();
    avancerPalier(etat, { type: 'rappel_tente' });
    expect(etat.palier).toBe(0);
    expect(lireEtat()).toEqual(etatParDefaut());
  });

  it('palierValide : la grille correspond au palier', () => {
    expect(palierValide(0, { type: 'rappel_tente' })).toBe(true);
    expect(palierValide(1, { type: 'rappel_tente' })).toBe(false);
    expect(palierValide(3, { type: 'fiche_autonome_terminee' })).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 7. Défi 3 jours (objet d'engagement)
// ──────────────────────────────────────────────────────────────────────────────

describe('tadwinEngine — défi 3 jours', () => {
  it('non démarré : ni en cours ni terminé', () => {
    const etat = etatParDefaut();
    expect(defiEnCours(etat, T0)).toBe(false);
    expect(defiTermine(etat, T0)).toBe(false);
  });

  it('démarré : en cours pendant 3 jours, terminé ensuite', () => {
    const etat = demarrerDefi(T0);
    expect(etat.defiDebutAt).toBe(T0);
    expect(defiEnCours(etat, T0)).toBe(true);
    expect(defiEnCours(etat, T0 + 2 * JOUR)).toBe(true);
    expect(defiEnCours(etat, T0 + 3 * JOUR)).toBe(false);
    expect(defiTermine(etat, T0 + 3 * JOUR)).toBe(true);
  });

  it('joursRestantsDefi : 3 au démarrage, 0 après échéance', () => {
    const etat = demarrerDefi(T0);
    expect(joursRestantsDefi(etat, T0)).toBe(3);
    expect(joursRestantsDefi(etat, T0 + 2 * JOUR)).toBe(1);
    expect(joursRestantsDefi(etat, T0 + 3 * JOUR)).toBe(0);
  });
});
