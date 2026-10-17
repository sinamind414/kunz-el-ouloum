// ordreActivites.lock.test.ts — M9 (audit externe v2, 2026-10-17).
//
// DÉFAUT CORRIGÉ : 5 leçons présentaient leurs activités avec une ANCIENNE
// numérotation interne (numérotation par unité d'origine), en contradiction
// avec leur couverture réelle (numéro d'activité = numéro de chapitre, porté
// par le <title> et les commentaires CHAPTER) :
//   phase10 (activités 19-20) : h1 « النشاط 5 » puis « النشاط 1 »
//   phase17 (activités 33-34) : h1 « النشاط 3 » puis « النشاط 1 »
//   phase20 (activités 39-40) : h1 « النشاط 3 » puis « النشاط 2 »
//   phase2  (activités 3-4)   : h1 « النشاط 4 » puis « النشاط 2 » (inversés)
//   phase3  (activités 5-6)   : h1 « النشاط 3 » puis « النشاط 1 »
// 18 remplacements (h1 + bandeaux « تقويم النشاط »), mesure jetable.
// Ce verrou interdit à vie la divergence h1 ↔ chapitres sur LES 25 leçons.
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const DIR = resolve(__dirname, '../../public/lessons');
const fiches = readdirSync(DIR).filter((f) => f.startsWith('phase') && f.endsWith('.html'));

function numerosChapitres(t: string): number[] {
  return [...t.matchAll(/CHAPTER\s+(\d+)\s*:/g)].map((m) => parseInt(m[1], 10));
}
function numerosH1(t: string): number[] {
  return [...t.matchAll(/<h1>\s*النشاط\s+(\d+)\s*:/g)].map((m) => parseInt(m[1], 10));
}

describe('M9 — la numérotation des activités suit les chapitres (25 leçons)', () => {
  it('chaque h1 « النشاط N : » porte le numéro de son chapitre (CHAPTER N)', () => {
    const divergences: string[] = [];
    for (const f of fiches) {
      const t = readFileSync(resolve(DIR, f), 'utf8');
      const chapitres = numerosChapitres(t);
      const activites = numerosH1(t);
      if (chapitres.length === 0) continue; // leçons sans marqueur CHAPTER
      if (chapitres.join(',') !== activites.join(',')) {
        divergences.push(`${f} : chapitres [${chapitres}] vs h1 [${activites}]`);
      }
    }
    expect(divergences, `leçons désalignées :\n${divergences.join('\n')}`).toEqual([]);
  });

  it('les 5 leçons corrigées pointent bien leurs numéros officiels', () => {
    const attendus: Array<[string, number[]]> = [
      ['phase10_chapitres_19_20.html', [19, 20]],
      ['phase17_chapitres_33_34.html', [33, 34]],
      ['phase20_chapitres_39_40.html', [39, 40]],
      ['phase2_chapitres_3_4.html', [3, 4]],
      ['phase3_chapitres_5_6.html', [5, 6]],
    ];
    for (const [f, numeros] of attendus) {
      const h1 = numerosH1(readFileSync(resolve(DIR, f), 'utf8'));
      expect(h1, f).toEqual(numeros);
    }
  });
});
