// okachaEnriched.lock.test.ts — verrou v2 du بنك الحفظ structuré (généré par
// scripts/enrich_okacha.ts à partir de l'injection v1 verbatim okacha.ts).
// Fige : parité totale avec okacha.ts (10 unités, mêmes ids/domaines/libellés,
// même ordre), zéro fragment orphelin (< 20 car.), numérotation propre
// (« N- texte », sans tabulation), couverture INTÉGRALE du texte source unité
// (toute ligne d'origine reste présente — recollée ou corrigée via ENRICH_FIXES),
// périmètre commercial filtré.
// PURGE المنهجية (عكاشة) 2026-09-23 : plus de sections méthodo, plus de
// conseils-personnels infiltrés dans d2u2 (mélange conseils-methodo + OCR cassé)
// — verrous d'absence dédiés ci-dessous.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  OKACHA_UNITES_ENRICHIES,
  ENRICH_FIXES,
  ENRICH_STATS,
  normAr,
} from './okachaEnriched';
import { OKACHA_UNITES } from './okacha';

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
const toutTexte = OKACHA_UNITES_ENRICHIES.flatMap((u) => u.blocs.map((b) => b.texte))
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
  it('aucun bloc non-titre < 20 caractères (unités)', () => {
    for (const u of OKACHA_UNITES_ENRICHIES) {
      for (const b of u.blocs) {
        if (b.kind !== 'titre') {
          expect(b.texte.trim().length, `${u.id}/${b.kind}`).toBeGreaterThanOrEqual(20);
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
    // 61 avant purge OCR « 17 signatures » (2026-09-23) — 3 points numérotés
    // (36-/37- d1u1, 47- d2u2) supprimés avec les lignes corrompues → 58.
    expect(points).toBeGreaterThanOrEqual(58);
  });
});

describe('couverture intégrale unités : toute ligne dorigine reste présente', () => {
  it('chaque ligne (normalisée, marqueurs retirés) contenue dans lenrichi', () => {
    for (const u of OKACHA_UNITES) {
      for (const l of u.lignes) {
        if (!l.trim()) continue;
        expect(couverte(l), `${u.id} : ${l.slice(0, 45)}`).toBe(true);
      }
    }
  });
});

describe('PURGE المنهجية (عكاشة) 2026-09-23 — verrous dabsence', () => {
  const src = readFileSync(resolve(__dirname, 'okachaEnriched.ts'), 'utf-8');

  it('aucune section méthodo ni export SectionMethodo dans le généré', () => {
    expect(src.includes('OKACHA_METHODO_SECTIONS')).toBe(false);
    expect(src.includes('SectionMethodo')).toBe(false);
    expect(OKACHA_UNITES_ENRICHIES).toHaveLength(10);
  });

  it('aucun conseil-personnel / marqueur méthodo résiduel dans les blocs unités', () => {
    const tout = normAr(
      OKACHA_UNITES_ENRICHIES.flatMap((u) => u.blocs.map((b) => b.texte)).join(' ')
    );
    for (const marqueur of [
      'قسم النصائح',
      'قسم المنهجية',
      'لا أنصحك',
      'إذاكادن',
      'الفيتامينات',
      'استعمال اليوتيوب',
      'مواقع التواصل الاجتماعي',
      'حصص الدعم',
      'التحضير المسبق',
      'أواق بيضاء',
      'اا40من',
      'الأم اض النووية',
      'فعاياكاي',
      'موقمين نحفبزين',
      'ARNmJl',
      'الااا٧ يصيب',
      'معادلة التحلل السكري:٧٨',
      'Blot اا0',
    ]) {
      expect(tout.includes(normAr(marqueur)), `reste méthodo/OCR : « ${marqueur} »`).toBe(false);
    }
  });

  it('stats sans sectionsMethodo (champ supprimé par le générateur)', () => {
    expect('sectionsMethodo' in ENRICH_STATS).toBe(false);
  });
});

describe('périmètre commercial filtré + traçabilité', () => {
  it('unités : pas de scan ni de prix (le reste du périmètre est déjà filtré v1)', () => {
    const t = normAr(
      OKACHA_UNITES_ENRICHIES.flatMap((u) => u.blocs.map((b) => b.texte)).join(' ')
    );
    for (const interdit of ['camscanner', '300 دج']) {
      expect(t.includes(normAr(interdit)), `unités : « ${interdit} »`).toBe(false);
    }
  });

  it('stats cohérentes et corrections tracées', () => {
    expect(ENRICH_STATS.fragmentsRecolles).toBeGreaterThan(80);
    expect(ENRICH_STATS.rattrapagesContinuation).toBeGreaterThan(50);
    expect(ENRICH_STATS.correctionsAppliquees).toBeGreaterThan(0);
    expect(ENRICH_STATS.genere).toBe('2026-09-23');
    const total = ENRICH_FIXES.reduce((s, f) => s + f.count, 0);
    expect(total).toBeGreaterThanOrEqual(ENRICH_STATS.correctionsAppliquees);
    for (const f of ENRICH_FIXES) expect(f.count, f.from).toBeGreaterThanOrEqual(0);
  });
});
