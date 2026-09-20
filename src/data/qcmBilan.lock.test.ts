// qcmBilan.lock.test.ts — verrous du mode « اختبار تشخيصي شامل ».
// Le bilan ne crée AUCUN contenu : il puise mécaniquement dans les deux banques
// déjà verrouillées (50 quiz leçons + 41 QCM livre = 91 ; single-path booléen exclu).
// Fige : taille et répartition du pool (D1=54, D2=14, D3=10 — phase21→D3 par lecture du contenu),
// l'hygiène de chaque item, et le DÉTERMINISME du tirage (5/domaine, sans doublon).

import { describe, expect, it } from 'vitest';
import { POOL, tirageBilan, type Domaine } from './qcmBilan';

describe('pool unifié du bilan (réutilisation mécanique, zéro contenu nouveau)', () => {
  it('91 items = 50 quiz leçons + 41 QCM livre (28 R4 + 11 R6 bis + 2 R7 bis)', () => {
    expect(POOL.filter((q) => q.source === 'lecon')).toHaveLength(50);
    expect(POOL.filter((q) => q.source === 'livre')).toHaveLength(41);
    expect(POOL).toHaveLength(91);
  });

  it('répartition par domaine figée : D1=56, D2=16, D3=19', () => {
    const par: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
    for (const q of POOL) par[q.domaine]++;
    expect(par[1]).toBe(56);
    expect(par[2]).toBe(16);
    expect(par[3]).toBe(19);
  });

  it('ids uniques, question non vide, options 3+, index de réponse valide', () => {
    expect(new Set(POOL.map((q) => q.id)).size).toBe(POOL.length);
    for (const q of POOL) {
      expect(q.question.length, q.id).toBeGreaterThan(10);
      expect(q.options.length, q.id).toBeGreaterThanOrEqual(3);
      expect(q.correct, q.id).toBeGreaterThanOrEqual(0);
      expect(q.correct, q.id).toBeLessThan(q.options.length);
    }
  });

  it('les 41 items livre : chapitre exact, schéma SVG, explication', () => {
    for (const q of POOL.filter((x) => x.source === 'livre')) {
      expect(q.chapitre, q.id).toBeDefined();
      expect(q.schema?.endsWith('.svg'), q.id).toBe(true);
      expect(q.explication?.length ?? 0, q.id).toBeGreaterThan(20);
    }
  });

  it('les 50 items leçon : pas de numérotation locale résiduelle en tête de question', () => {
    for (const q of POOL.filter((x) => x.source === 'lecon')) {
      expect(/^\d+\.\s/.test(q.question), `${q.id} : « ${q.question.slice(0, 20)} »`).toBe(false);
    }
  });
});

describe('tirage déterministe du bilan', () => {
  it('même graine ⇒ tirage identique (deep equal)', () => {
    const a = tirageBilan(1234);
    const b = tirageBilan(1234);
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
  });

  it('graines différentes ⇒ tirages différents (au moins 12 positions sur 15)', () => {
    const a = tirageBilan(1234).map((q) => q.id);
    const b = tirageBilan(5678).map((q) => q.id);
    const diff = a.filter((id, i) => id !== b[i]).length;
    expect(diff).toBeGreaterThanOrEqual(12);
  });

  it('15 items, 5 par domaine, aucun doublon dans un tirage', () => {
    for (const seed of [1, 42, 99999]) {
      const t = tirageBilan(seed);
      expect(t).toHaveLength(15);
      expect(new Set(t.map((q) => q.id)).size).toBe(15);
      const par: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
      for (const q of t) par[q.domaine as Domaine]++;
      expect(par[1]).toBe(5);
      expect(par[2]).toBe(5);
      expect(par[3]).toBe(5);
    }
  });

  it('entrelacement D1→D2→D3 (aucun domaine concentré en fin de tirage)', () => {
    const t = tirageBilan(7);
    const blocs = t.map((q) => q.domaine);
    // avec 5/5/5 et 15 questions, chaque tranche de 3 consécutives contient les 3 domaines
    for (let i = 0; i < 15; i += 3) {
      expect(new Set(blocs.slice(i, i + 3)).size).toBe(3);
    }
  });

  it('tout tirage ⊆ pool (aucune question fabriquée au moment du tirage)', () => {
    const ids = new Set(POOL.map((q) => q.id));
    for (const q of tirageBilan(2026)) expect(ids.has(q.id), q.id).toBe(true);
  });
});
