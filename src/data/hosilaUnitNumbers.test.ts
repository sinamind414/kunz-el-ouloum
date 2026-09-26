// src/data/hosilaUnitNumbers.test.ts — verrou de la jointure
//   الحصيلة المعرفية (dXuY) ↔ numéro OFFICIEL de l'unité des leçons (1..11).
//
// Sans cette table, les deux écrans affichent deux numéros différents pour la
// même unité (حصيلة « u2 » pour الصفائح التكتونية alors que les leçons disent
// « وحدة 9 »). Ce verrou garantit que la table couvre TOUTES les unités de la
// حصilha, sans doublon, et reste dans le domaine annoncé par l'id.
import { describe, expect, it } from 'vitest';
import { HOSILA_IDS } from './hosila';
import { HOSILA_VERS_UNITE, domaineDeNumero, numeroUniteHosila } from './hosilaUnitNumbers';

describe('hosilaUnitNumbers — jointure حصيلة ↔ numéros de leçons', () => {
  it('couvre exactement les 10 unités de الحصيلة (aucun id orphelin)', () => {
    expect(Object.keys(HOSILA_VERS_UNITE).sort()).toEqual([...HOSILA_IDS].sort());
    for (const id of HOSILA_IDS) {
      expect(numeroUniteHosila(id), `id sans numéro : ${id}`).not.toBeNull();
    }
    // Id inconnu → null (aucune numérotation inventée).
    expect(numeroUniteHosila('d9u9')).toBeNull();
    expect(numeroUniteHosila('')).toBeNull();
  });

  it('numéros distincts, tous dans l’intervalle officiel 1..11', () => {
    const nums = Object.values(HOSILA_VERS_UNITE);
    expect(new Set(nums).size).toBe(nums.length);
    for (const n of nums) {
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(11);
    }
    // Le domaine 2 n’a que 2 unités côté حصيلة : وحدة 8 (بلا حصيلة) est
    // volontairement ABSENTE — l’inverse prouverait une numérotation inventée.
    expect(nums).not.toContain(8);
    expect(nums).toHaveLength(10);
  });

  it('le domaine de l’id (d1/d2/d3) coïncide avec le domaine du numéro', () => {
    for (const [id, n] of Object.entries(HOSILA_VERS_UNITE)) {
      const domaineId = Number(id[1]);
      expect(domaineDeNumero(n), `${id} → وحدة ${n}`).toBe(domaineId);
    }
    // Bornes des domaines (INITIAL_UNITS : 1-5 / 6-8 / 9-11).
    expect(domaineDeNumero(1)).toBe(1);
    expect(domaineDeNumero(5)).toBe(1);
    expect(domaineDeNumero(6)).toBe(2);
    expect(domaineDeNumero(8)).toBe(2);
    expect(domaineDeNumero(9)).toBe(3);
    expect(domaineDeNumero(11)).toBe(3);
  });

  it('domaine 3 : ordre du livre, PAS ordre des ids (الصفائح avant بنية الكرة)', () => {
    // Le livre place الصفائح (TDM p.237) avant بنية الكرة الأرضية (p.259) :
    // les leçons les numérotent 9 puis 10, la حصilha les inverse dans ses ids.
    expect(numeroUniteHosila('d3u2')).toBe(9); // الصفائح التكتونية
    expect(numeroUniteHosila('d3u1')).toBe(10); // بنية الكرة الأرضية
    expect(numeroUniteHosila('d3u3')).toBe(11); // الظواهر المرتبطة بالنشاط التكتوني
    // Domaine 1 : les deux corpus concordent déjà.
    for (let n = 1; n <= 5; n++) expect(numeroUniteHosila(`d1u${n}`)).toBe(n);
    // Domaine 2 : 6 et 7 (la 8 n’a pas de حصيلة).
    expect(numeroUniteHosila('d2u1')).toBe(6);
    expect(numeroUniteHosila('d2u2')).toBe(7);
  });
});
