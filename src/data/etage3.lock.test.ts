// Verrous de l'étage 3 (2026-11-07) : R1 positionnement, R2 priorités,
// R4 express J-7. Objet : prouver qu'aucun contenu, chiffre ou leçon n'a été
// inventé, et que les 11 unités officielles sont toutes couvertes.

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  evaluerPositionnement,
  OBJECTIFS_NOTE,
  QUESTIONS_POSITIONNEMENT,
  SEUILS_PROFIL,
} from './positionnementInitial';
import { CONTRATS_VERBES } from './glossaireCapitaine';
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

// ───────────────────────── R1 : positionnement ─────────────────────────
describe('R1 — 15 questions, zero contenu invente', () => {
  it('15 questions : 12 QCM (4/domaine) + 3 verbes', () => {
    expect(QUESTIONS_POSITIONNEMENT.length).toBe(15);
    const qcm = QUESTIONS_POSITIONNEMENT.filter((q) => q.type === 'qcm');
    const verbes = QUESTIONS_POSITIONNEMENT.filter((q) => q.type === 'verbe');
    expect(qcm.length).toBe(12);
    expect(verbes.length).toBe(3);
    for (const d of [1, 2, 3]) expect(qcm.filter((q) => q.domaine === d).length).toBe(4);
  });

  it('chaque enonce de QCM vient du corpus, chaque option de verbe du moteur', () => {
    const enonces = new Set(SVT_QUIZ_QUESTIONS.map((q) => q.questionText));
    const lignesContrat = new Set(
      CONTRATS_VERBES.flatMap((c) => c.contractAr.split('\n')),
    );
    for (const q of QUESTIONS_POSITIONNEMENT) {
      expect(q.optionsAr.length).toBeGreaterThanOrEqual(2);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.optionsAr.length);
      if (q.type === 'qcm') expect(enonces.has(q.enonceAr)).toBe(true);
      else for (const o of q.optionsAr) expect(lignesContrat.has(o)).toBe(true);
    }
  });

  it('les 3 profils et les objectifs 10/14/18', () => {
    expect(OBJECTIFS_NOTE).toEqual([10, 14, 18]);
    const toutJuste = QUESTIONS_POSITIONNEMENT.map((q) => q.correctIndex);
    const rien = QUESTIONS_POSITIONNEMENT.map(() => null);
    expect(evaluerPositionnement(toutJuste).profil).toBe('approfondissement');
    expect(evaluerPositionnement(rien).profil).toBe('bases');
    const moitie = QUESTIONS_POSITIONNEMENT.map((q, i) =>
      i < SEUILS_PROFIL.consolidation + 2
        ? q.correctIndex
        : (q.correctIndex + 1) % q.optionsAr.length,
    );
    expect(evaluerPositionnement(moitie).profil).toBe('consolidation');
    expect(evaluerPositionnement(toutJuste, 18).objectif).toBe(18);
  });

  it('le parcours pointe vers une des 4 rubriques existantes', () => {
    for (const reponses of [
      QUESTIONS_POSITIONNEMENT.map(() => null),
      QUESTIONS_POSITIONNEMENT.map((q) => q.correctIndex),
    ]) {
      const r = evaluerPositionnement(reponses);
      expect(['cours', 'entrainement', 'revision']).toContain(r.rubrique);
      expect(r.outilAr.length).toBeGreaterThan(3);
    }
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
