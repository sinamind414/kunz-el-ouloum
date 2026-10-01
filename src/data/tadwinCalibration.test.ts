// tadwinCalibration.test.ts
// Calibration du seuil C2 (docs/tadwin_decisions.md §8) sur les fiches-modèles.
//
// Ce test EST la mesure : il ne suppose pas le seuil, il le déduit des fiches.
//   1. 'complete'  → C2 = 1 au seuil 1.0 (tous les atomes présents — vérifie que
//                    la prose فصحًى atteint réellement chaque atome déclaré) ;
//   2. 'concise'   → C2 = 1 au seuil figé (borne basse du seuil) ;
//   3. 'fragile'   → C2 < 1 au seuil figé (borne haute) ;
//   4. gel         → au moins une 'concise' casse à tout seuil > 0,5, donc 0,5
//                    est le MAXIMUM tolérable — non une supposition.
//
// Note : la calibration sur fiches-modèles authored n'est pas une validation sur
// copies réelles (AGENTS.md R2). Elle fige le seuil par mesure, sans prétendre
// au-delà.

import { describe, expect, it } from 'vitest';
import { evaluerC2, SEUIL_C2, seuilCouvertureCle } from '../lib/validation/couvCle';
import { clesDeUnite, TADWIN_UNITES } from './tadwinCles';
import {
  TADWIN_FICHES,
  fichesDeUnite,
  type NiveauFiche,
} from './tadwinCalibration';

const NIVEAUX: NiveauFiche[] = ['complete', 'concise', 'fragile'];

/** Évalue une fiche sur les 3 clés prescrites de son unité. */
function evaluerFiche(f: { uniteId: number; reponse: string }, seuil?: number) {
  const cles = clesDeUnite(f.uniteId)!.map((c) => c.cle);
  return evaluerC2(f.reponse, { uniteId: f.uniteId, clesChoisies: cles }, seuil);
}

describe('tadwinCalibration — structure de la banque', () => {
  it('compte exactement 33 fiches : 11 unités × 3 niveaux', () => {
    expect(TADWIN_FICHES).toHaveLength(33);
    for (const u of TADWIN_UNITES) {
      const f = fichesDeUnite(u.uniteId);
      expect(f, `unité ${u.uniteId}`).toHaveLength(3);
      expect(f.map((x) => x.niveau).sort()).toEqual([...NIVEAUX].sort());
    }
  });
});

describe('tadwinCalibration — mesures par niveau', () => {
  it("'complete' → C2 = 1 au seuil 1.0 : la prose atteint TOUS les atomes", () => {
    // C'est ce test qui valide que l'arabe écrit matche vraiment les atomes
    // déclarés (frontières de mot, ة→ه, NFKC…) — pas une liste de mots-clés.
    for (const f of TADWIN_FICHES.filter((x) => x.niveau === 'complete')) {
      const r = evaluerFiche(f, 1.0);
      expect(r.c2, `unité ${f.uniteId} complète`).toBe(1);
      for (const d of r.detail) {
        expect(d.atomsManquants, `unité ${f.uniteId} clé « ${d.cle} »`).toEqual([]);
      }
    }
  });

  it("'concise' → C2 = 1 au seuil figé : une excellente réponse reste créditée", () => {
    for (const f of TADWIN_FICHES.filter((x) => x.niveau === 'concise')) {
      const r = evaluerFiche(f);
      expect(r.c2, `unité ${f.uniteId} concise`).toBe(1);
    }
  });

  it("'fragile' → C2 < 1 au seuil figé : une réponse insuffisante n'a jamais le maximum", () => {
    for (const f of TADWIN_FICHES.filter((x) => x.niveau === 'fragile')) {
      const r = evaluerFiche(f);
      expect(r.c2, `unité ${f.uniteId} fragile`).toBeLessThan(1);
    }
  });
});

describe('tadwinCalibration — gel du seuil (§8)', () => {
  it('le seuil figé vaut 0,5 (moitié des atomes, minimum 1)', () => {
    expect(SEUIL_C2).toBe(0.5);
  });

  it('0,5 est le MAXIMUM tolérable : une concise casse au-dessus', () => {
    // Mesure : pour au moins une fiche concise, un clé n'atteint son seuil qu'à
    // 1 atome sur 2 (ou 2/3, 3/5). Tout seuil supérieur réintroduit le bug de
    // seuil inatteignable (§7) — 12/33 clés ont exactement 2 atomes.
    const cassantes: string[] = [];
    for (const f of TADWIN_FICHES.filter((x) => x.niveau === 'concise')) {
      const r = evaluerFiche(f, 0.51);
      if (r.c2 < 1) cassantes.push(`u${f.uniteId}`);
    }
    expect(cassantes.length, `fiches cassantes à 0,51: ${cassantes.join(', ')}`).toBeGreaterThan(0);
  });

  it('le seuil 0,6 supposé jadis est bien réfuté par la mesure', () => {
    // Le candidat 0,6 historique casse les fiches concises des unités à clé
    // 2-atomes (u3, u4, u7, u8, u9, u11) — preuve que ce seuil était fantasmé.
    let cassees = 0;
    for (const f of TADWIN_FICHES.filter((x) => x.niveau === 'concise')) {
      if (evaluerFiche(f, 0.6).c2 < 1) cassees++;
    }
    expect(cassees).toBeGreaterThan(0);
  });

  it('la borne minimale max(1, …) reste respectée à tout seuil', () => {
    expect(seuilCouvertureCle(1, 0.5)).toBe(1);
    expect(seuilCouvertureCle(2, 0.5)).toBe(1);
    expect(seuilCouvertureCle(3, 0.5)).toBe(2);
    expect(seuilCouvertureCle(5, 0.5)).toBe(3);
  });
});
