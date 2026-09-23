// okachaEnriched.lock.test.ts — verrou v2 du بنك الحفظ structuré (généré par
// scripts/enrich_okacha.ts à partir de l'injection v1 verbatim okacha.ts).
// Fige : parité totale avec okacha.ts (10 unités, mêmes ids/domaines/libellés,
// même ordre), zéro fragment orphelin (< 20 car.), numérotation propre
// (« N- texte », sans tabulation), couverture INTÉGRALE du texte source (toute
// ligne d'origine reste présente — recollée ou corrigée via ENRICH_FIXES),
// sections méthodo dans l'ordre du livre, périmètre commercial filtré.
import { describe, expect, it } from 'vitest';
import {
  OKACHA_UNITES_ENRICHIES,
  OKACHA_METHODO_SECTIONS,
  ENRICH_FIXES,
  ENRICH_STATS,
  normAr,
} from './okachaEnriched';
import { OKACHA_UNITES, OKACHA_METHODO } from './okacha';

const flat = (s: string) => normAr(s).replace(/\s+/g, '');
/** Comparaison de couverture : on retire les marqueurs de tête (numéros, puces,
 *  tirets, astérisques, alef orphelin, apostrophes/gargouilles OCR « 3'?- »)
 *  qui sont du FORMATAGE — recollés ou normalisés par l'enrichissement.
 *  Symétrique : appliqué aux DEUX côtés. */
const bare = (s: string) => flat(s).replace(/^[0-9٠-٩اا\-–.٫:\s*•'ʼ?؟]+/, '');
const avecFixes = (ligne: string) => {
  let t = ligne;
  for (const f of ENRICH_FIXES) t = t.split(f.from).join(f.to);
  return t;
};
const toutTexte = [
  ...OKACHA_UNITES_ENRICHIES.flatMap((u) => u.blocs.map((b) => b.texte)),
  ...OKACHA_METHODO_SECTIONS.flatMap((s) => s.blocs.map((b) => b.texte)),
]
  .map(bare)
  .join('§');
const couverte = (ligne: string) =>
  toutTexte.includes(bare(avecFixes(ligne))) || toutTexte.includes(bare(ligne));

describe('parité avec linjection v1 (okacha.ts)', () => {
  it('10 unités, mêmes ids, domaines et libellés, même ordre', () => {
    expect(OKACHA_UNITES_ENRICHIES.map((u) => u.id)).toEqual(OKACHA_UNITES.map((u) => u.id));
    expect(OKACHA_UNITES_ENRICHIES.map((u) => u.domaine)).toEqual(OKACHA_UNITES.map((u) => u.domaine));
    expect(OKACHA_UNITES_ENRICHIES.map((u) => u.uniteAr)).toEqual(OKACHA_UNITES.map((u) => u.uniteAr));
    expect(OKACHA_UNITES_ENRICHIES.map((u) => u.sourceRange)).toEqual(OKACHA_UNITES.map((u) => u.sourceRange));
  });
});

describe('zéro fragment orphelin (audit A2 corrigé)', () => {
  it('aucun bloc non-titre < 20 caractères (unités + méthodo)', () => {
    for (const u of OKACHA_UNITES_ENRICHIES) {
      for (const b of u.blocs) {
        if (b.kind !== 'titre') {
          expect(b.texte.trim().length, `${u.id}/${b.kind}`).toBeGreaterThanOrEqual(20);
        }
      }
    }
    for (const s of OKACHA_METHODO_SECTIONS) {
      for (const b of s.blocs) {
        if (b.kind !== 'titre') {
          expect(b.texte.trim().length, `méthodo/${s.id}/${b.kind}`).toBeGreaterThanOrEqual(20);
        }
      }
    }
  });

  it('numérotation propre : points « N- texte », sans tabulation ni zéro-bullet', () => {
    let points = 0;
    for (const u of OKACHA_UNITES_ENRICHIES) {
      for (const b of u.blocs) {
        if (b.kind !== 'point') continue;
        points++;
        expect(b.texte, `${u.id} point`).toMatch(/^\S{1,3}-\s?\S/);
        expect(b.texte.includes('\t'), `${u.id} tab`).toBe(false);
      }
    }
    expect(points).toBe(ENRICH_STATS.pointsTotal);
    expect(points).toBeGreaterThanOrEqual(60);
  });
});

describe('couverture intégrale : toute ligne dorigine reste présente', () => {
  it('unités : chaque ligne (normalisée, marqueurs retirés) contenue dans lenrichi', () => {
    for (const u of OKACHA_UNITES) {
      for (const l of u.lignes) {
        if (!l.trim()) continue;
        expect(couverte(l), `${u.id} : ${l.slice(0, 45)}`).toBe(true);
      }
    }
  });

  it('méthodo : chaque ligne (normalisée, marqueurs retirés) contenue dans lenrichi', () => {
    for (const l of OKACHA_METHODO.lignes) {
      if (!l.trim()) continue;
      expect(couverte(l), `méthodo : ${l.slice(0, 45)}`).toBe(true);
    }
  });
});

describe('sections méthodo dans lordre du livre', () => {
  it('7 à 9 sections, intro en tête, chacune >= 3 blocs', () => {
    const ids = OKACHA_METHODO_SECTIONS.map((s) => s.id);
    expect(ids[0]).toBe('intro');
    expect(ids.length).toBeGreaterThanOrEqual(7);
    expect(ids.length).toBeLessThanOrEqual(9);
    for (const s of OKACHA_METHODO_SECTIONS) {
      expect(s.blocs.length, s.id).toBeGreaterThanOrEqual(3);
    }
    expect(ids).toEqual([...new Set(ids)]); // pas de doublon (le pointeur d'ordre)
  });
});

describe('périmètre commercial filtré + traçabilité', () => {
  it('méthodo : aucun terme commercial (miroir du verrou v1)', () => {
    const t = normAr(
      OKACHA_METHODO_SECTIONS.flatMap((s) => s.blocs.map((b) => b.texte)).join(' ')
    );
    for (const interdit of ['عكاش', 'المتفوق', 'camscanner', '300 دج']) {
      expect(t.includes(normAr(interdit)), `méthodo : « ${interdit} »`).toBe(false);
    }
  });

  it('unités : pas de scan ni de prix (le reste du périmètre est déjà filtré v1)', () => {
    const t = normAr(
      OKACHA_UNITES_ENRICHIES.flatMap((u) => u.blocs.map((b) => b.texte)).join(' ')
    );
    for (const interdit of ['camscanner', '300 دج']) {
      expect(t.includes(normAr(interdit)), `unités : « ${interdit} »`).toBe(false);
    }
  });

  it('stats cohérentes et corrections tracées', () => {
    expect(ENRICH_STATS.fragmentsRecolles).toBeGreaterThan(150);
    expect(ENRICH_STATS.rattrapagesContinuation).toBeGreaterThan(100);
    expect(ENRICH_STATS.correctionsAppliquees).toBeGreaterThan(0);
    expect(ENRICH_STATS.sectionsMethodo).toBe(OKACHA_METHODO_SECTIONS.length);
    expect(ENRICH_STATS.genere).toBe('2026-09-22');
    // Le total des occurrences source >= corrections réellement appliquées
    // (un mot coupé par un recollage peut échapper au dictionnaire — verbatim).
    const total = ENRICH_FIXES.reduce((s, f) => s + f.count, 0);
    expect(total).toBeGreaterThanOrEqual(ENRICH_STATS.correctionsAppliquees);
    for (const f of ENRICH_FIXES) expect(f.count, f.from).toBeGreaterThanOrEqual(0);
  });
});
