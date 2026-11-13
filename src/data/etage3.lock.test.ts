// Verrous de l'étage 3 (2026-11-07) : R1 positionnement, R2 priorités,
// R4 express J-7. Objet : prouver qu'aucun contenu, chiffre ou leçon n'a été
// inventé, et que les 11 unités officielles sont toutes couvertes.

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  evaluerPositionnement,
  OBJECTIFS_NOTE,
  ORIENTATION,
  SEUILS_PROFIL,
} from './positionnementInitial';
import { POSITIONNEMENT_QUESTIONS, UNITE_PAR_ID } from './positionnementBanque';
import { noteSur20 } from '../utils/positionnement';
import { SVT_QUIZ_QUESTIONS } from '../quizCorpus';
import {
  LIBELLES_PRIORITE,
  PRIORITES_BAC,
  TOTAL_POINTS_MESURES,
  phrasePrioriteAr,
  prioritePourUnite,
} from './prioritesBac';
import { unitPressure } from './bacSessionIndex';
import { PROGRESSION_OFFICIELLE } from './curriculumOfficial';
import {
  AVERTISSEMENT_DATE_AR,
  PLAN_EXPRESS_J7,
  NB_JOURS_EXPRESS,
  estFenetreExpress,
} from './expressJ7';
import { BAC_EXAM_DATE, BAC_EXAM_DATE_IS_PROVISIONAL } from '../utils/dashboardActions';
import { PARCOURS_FLAT } from '../lib/parcours/parcoursPath';
import { LESSON_INDEX_STATS } from './lessonIndex';

const lire = (p: string) => readFileSync(resolve(__dirname, '../../', p), 'utf8');

// ───────────────────────── R2 : vraies priorités ─────────────────────────
describe('R2 — 11/11 unites etiquetees, chiffres mesures', () => {
  it('une ligne par unite officielle, aucune en trop', () => {
    expect(PROGRESSION_OFFICIELLE.length).toBe(11);
    expect(PRIORITES_BAC.length).toBe(11);
    expect(new Set(PRIORITES_BAC.map((p) => p.unitId)).size).toBe(11);
    for (let u = 1; u <= 11; u += 1) expect(prioritePourUnite(u)).not.toBeNull();
    expect(prioritePourUnite(99)).toBeNull();
  });

  it('les points et occurrences sont EXACTEMENT ceux de unitPressure()', () => {
    const mesure = unitPressure();
    for (const p of PRIORITES_BAC) {
      const m = mesure.find((x) => x.unitId === p.unitId)!;
      expect(p.pointsPrincipaux).toBe(m.pointsPrincipaux);
      expect(p.occurrences).toBe(m.count);
      expect(p.domaine).toBe(PROGRESSION_OFFICIELLE.find((u) => u.uniteId === p.unitId)!.domaine);
    }
    expect(TOTAL_POINTS_MESURES).toBe(mesure.reduce((s, m) => s + m.pointsPrincipaux, 0));
    const sommePourcents = PRIORITES_BAC.reduce((s, p) => s + p.partPourCent, 0);
    expect(Math.abs(sommePourcents - 100)).toBeLessThan(0.5);
  });

  it('3 🔴 / 4 🟡 / 4 🟢, y compris U8, U10, U11', () => {
    const parNiveau = (n: string) => PRIORITES_BAC.filter((p) => p.niveau === n).length;
    expect(parNiveau('indispensable')).toBe(3);
    expect(parNiveau('important')).toBe(4);
    expect(parNiveau('complementaire')).toBe(4);
    for (const u of [8, 10, 11]) {
      const p = prioritePourUnite(u)!;
      expect(['🔴', '🟡', '🟢']).toContain(p.emoji);
      expect(p.libelleAr).toBe(LIBELLES_PRIORITE[p.niveau]);
    }
  });

  it('aucune promesse « tombe chaque annee » ni chiffre invente', () => {
    for (const p of PRIORITES_BAC) {
      const phrase = phrasePrioriteAr(p);
      expect(phrase).toContain(String(p.pointsPrincipaux));
      expect(phrase).not.toContain('كل سنة');
      expect(phrase).not.toContain('100%');
    }
  });
});

// ───────────────────────── R1 : positionnement (CONVERGENCE 2026-11-13) ─────────────────────────
// GO propriétaire : le test du panneau est DÉSORMAIS la banque P0-3 du coach
// (18 items). Une seule mesure, un seul store (kunz_positionnement_v1).
describe('R1 — la banque du panneau est celle du coach (18 items), zero contenu invente', () => {
  it('18 questions, toutes issues du corpus, 11 unites couvertes', () => {
    expect(POSITIONNEMENT_QUESTIONS.length).toBe(18);
    const enonces = new Set(SVT_QUIZ_QUESTIONS.map((q) => q.questionText));
    for (const q of POSITIONNEMENT_QUESTIONS) {
      expect(enonces.has(q.question)).toBe(true);
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.options.length);
    }
    const unites = new Set(POSITIONNEMENT_QUESTIONS.map((q) => UNITE_PAR_ID[q.id]));
    expect(unites.size).toBe(11);
  });

  it('seuils recales 7/14 sur 18 items — proposition pedagogique affichee', () => {
    expect(SEUILS_PROFIL).toEqual({ consolidation: 7, approfondissement: 14 });
    expect(OBJECTIFS_NOTE).toEqual([10, 14, 18]);
    const toutJuste = POSITIONNEMENT_QUESTIONS.map((q) => q.correctIndex);
    const rien = POSITIONNEMENT_QUESTIONS.map(() => null as number | null);
    expect(evaluerPositionnement(toutJuste).profil).toBe('approfondissement');
    expect(evaluerPositionnement(rien).profil).toBe('bases');
    const consolidation = POSITIONNEMENT_QUESTIONS.map((q, i) =>
      i < SEUILS_PROFIL.consolidation + 2
        ? q.correctIndex
        : (q.correctIndex + 1) % q.options.length,
    );
    expect(evaluerPositionnement(consolidation).profil).toBe('consolidation');
    expect(evaluerPositionnement(toutJuste, 18).objectif).toBe(18);
  });

  it('la note estimee du panneau est la MEME mesure que celle du coach (noteSur20)', () => {
    const toutJuste = POSITIONNEMENT_QUESTIONS.map((q) => q.correctIndex);
    const r = evaluerPositionnement(toutJuste);
    expect(r.percent).toBe(100);
    expect(r.noteEstimee).toBe(noteSur20(100));
    expect(evaluerPositionnement(
      POSITIONNEMENT_QUESTIONS.map(() => null as number | null),
    ).noteEstimee).toBe(noteSur20(0));
  });

  it('les unites ratees sont identifiees et triees', () => {
    const ratees = evaluerPositionnement(
      POSITIONNEMENT_QUESTIONS.map(() => null as number | null),
    ).unitesRatees;
    expect(ratees).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(evaluerPositionnement(
      POSITIONNEMENT_QUESTIONS.map((q) => q.correctIndex),
    ).unitesRatees).toEqual([]);
  });

  it('le parcours pointe vers une des 4 rubriques existantes', () => {
    for (const reponses of [
      POSITIONNEMENT_QUESTIONS.map(() => null as number | null),
      POSITIONNEMENT_QUESTIONS.map((q) => q.correctIndex),
    ]) {
      const r = evaluerPositionnement(reponses);
      expect(['cours', 'entrainement', 'revision']).toContain(r.rubrique);
      expect(r.outilAr.length).toBeGreaterThan(3);
    }
    for (const profil of ['bases', 'consolidation', 'approfondissement'] as const) {
      expect(['cours', 'entrainement', 'revision']).toContain(ORIENTATION[profil].rubrique);
    }
  });

  it('le panneau et le coach partagent le MEME store (kunz_positionnement_v1)', () => {
    const panel = lire('src/components/ParcoursAssimilation.tsx');
    expect(panel).toContain('enregistrerResultat');
    expect(panel).toContain('enregistrerObjectifNote');
    expect(panel).toContain('chargerPositionnement');
    expect(panel).toContain('from \'../data/positionnementBanque\'');
    const utils = lire('src/utils/positionnement.ts');
    expect(utils).toContain("'kunz_positionnement_v1'");
    // L'état du coach est repris par le panneau, jamais écrasé à l'ouverture.
    expect(panel).toContain("chargerPositionnement().resultat ? 'resultat' : 'objectif'");
  });
});

// ───────────────────────── R4 : express J-7 ─────────────────────────
describe('R4 — 7 jours, lecons reelles, date provisoire affichee', () => {
  it('7 jours, 2 lecons + 1 quiz par jour', () => {
    expect(PLAN_EXPRESS_J7.length).toBe(NB_JOURS_EXPRESS);
    for (const j of PLAN_EXPRESS_J7) {
      expect(j.lecons.length).toBe(2);
      expect(j.quizUnitId).toBeGreaterThanOrEqual(1);
      expect(j.quizUnitId).toBeLessThanOrEqual(11);
    }
  });

  it('chaque lecon existe dans PARCOURS_FLAT (aucune cle invente)', () => {
    const parId = new Map(PARCOURS_FLAT.map((i) => [i.id, i]));
    for (const j of PLAN_EXPRESS_J7) {
      for (const l of j.lecons) {
        const reel = parId.get(l.id);
        expect(reel).toBeTruthy();
        expect(reel!.lessonKey).toBe(l.lessonKey);
        expect(reel!.title).toBe(l.title);
        expect(reel!.unitId).toBe(l.unitId);
      }
    }
  });

  it('la date provisoire est SIGNALÉE, pas presentee comme officielle', () => {
    expect(BAC_EXAM_DATE_IS_PROVISIONAL).toBe(true);
    expect(AVERTISSEMENT_DATE_AR).toContain('مؤقت');
    expect(AVERTISSEMENT_DATE_AR).toContain(BAC_EXAM_DATE);
    expect(estFenetreExpress(new Date('2027-06-01T12:00:00Z'))).toBe(true);
    expect(estFenetreExpress(new Date('2026-01-01T12:00:00Z'))).toBe(false);
  });
});

// ───────────────────────── R7 : recherche deja cablee ─────────────────────────
// Recalibré 2026-11-08 sur le corpus réel de cette branche : 29 leçons actives
// (+2) → 578 chunks (+16) contre 562 dans le workspace d'origine du verrou.
describe('R7 — la recherche plein texte couvre deja les 578 chunks', () => {
  it('LESSON_INDEX_STATS = 578 chunks ; SearchView consomme searchAllBases', () => {
    expect(LESSON_INDEX_STATS.chunksTotal).toBe(578);
    const search = lire('src/components/SearchView.tsx');
    expect(search).toContain('searchAllBases');
    const moteur = lire('src/smartTutorEngine.ts');
    expect(moteur).toContain('chunksLecons()');
    expect(moteur).toContain('lessonIndexSiChargee()');
    const lessonsView = lire('src/components/LessonsView.tsx');
    expect(lessonsView).toContain('SearchView');
  });
});
