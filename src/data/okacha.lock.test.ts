// okacha.lock.test.ts — verrous du « بنك الحفظ » (livre عكاشة, injection mécanique
// par scripts/build_okacha.py). Fige : 10 unités (D1=5, D2=2, D3=3 — mapping des
// domaines documenté : l'ordre عكاشة ≠ ordre officiel), l'absence TOTALE du
// périmètre commercial (téléphones, prix, bannières promo/scan — même aux lettres
// tronquées par l'OCR), la terminologie (الظهيرة absente — عكاشة écrit الظهرة),
// et l'intégrité minimale de chaque unité.

import { describe, expect, it } from 'vitest';
import { OKACHA_UNITES, OKACHA_METHODO } from './okacha';

const norm = (s: string) =>
  s
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[إأآٱا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');

describe('structure du بنك الحفظ عكاشة (10 unités, mapping documenté)', () => {
  it('10 unités : D1=5, D2=2, D3=3 (ordre عكاشة remappé vers l ordre officiel)', () => {
    expect(OKACHA_UNITES).toHaveLength(10);
    const par = { 1: 0, 2: 0, 3: 0 };
    for (const u of OKACHA_UNITES) par[u.domaine]++;
    expect(par[1]).toBe(5);
    expect(par[2]).toBe(2);
    expect(par[3]).toBe(3);
  });

  it('ids uniques, libellés non vides, plage source tracée, texte présent partout', () => {
    expect(new Set(OKACHA_UNITES.map((u) => u.id)).size).toBe(10);
    for (const u of OKACHA_UNITES) {
      expect(u.uniteAr.length, u.id).toBeGreaterThan(5);
      expect(u.sourceRange, u.id).toMatch(/^l\.\d+-\d+$/);
      expect(u.lignes.length, `${u.id} : ${u.lignes.length} lignes`).toBeGreaterThanOrEqual(25);
      expect(u.lignes.join(' ').length, u.id).toBeGreaterThan(500);
    }
  });
});

describe('section méthodologie (l.115-660 — croisée avec مفتاح, doc : docs/CROISEMENT_OKACHA_MEFTAH)', () => {
  it('présente, substantielle, sans périmètre commercial', () => {
    expect(OKACHA_METHODO.lignes.length).toBeGreaterThanOrEqual(300);
    expect(OKACHA_METHODO.sourceRange).toBe('l.115-660');
    const t = norm(OKACHA_METHODO.lignes.join(' '));
    for (const interdit of ['عكاش', 'المتفوق', 'camscanner', '300 دج']) {
      expect(t.includes(norm(interdit)), `métho : trouvé « ${interdit} »`).toBe(false);
    }
  });

  it('les marqueurs méthodologiques clés sont présents (grille 3 consignes + أفعال + استدلال)', () => {
    const t = norm(OKACHA_METHODO.lignes.join(' '));
    for (const cle of [
      'استرداد الموارد', 'توظيف الموارد', 'البناء والتركيب', // = grille 5/7/8 (corrobore v5.0)
      'التحليل', 'التفسير', 'الاستنتاج', 'الفرضية',
      'أثبت', 'ناقش', 'علل', 'صف', // أفعال أدائية (famille أحكم/أصف)
      'الاستدلال العلمي', 'المسعى العلمي',
    ]) {
      expect(t.includes(norm(cle)), `métho : « ${cle} » absent`).toBe(true);
    }
  });
});

describe('périmètre commercial — zéro trace (bannières même tronquées par l OCR)', () => {
  it('aucun téléphone, prix, watermark scan ou bannière promo dans la banque', () => {
    const tout = norm(OKACHA_UNITES.map((u) => u.lignes.join('\n')).join('\n'));
    for (const interdit of [
      '0672388202', '0560420993', '300 دج', 'camscanner', 'scanne',
      'عكاش', 'عكإغ', 'المتفوق', 'للمتفوق', 'متتقوق',
    ]) {
      expect(tout.includes(norm(interdit)), `trouvé : ${interdit}`).toBe(false);
    }
  });

  it('les libellés d unités sont canoniques et propres (pas de labels OCR corrompus)', () => {
    const colle = /[\u0600-\u06FF][A-Za-z]+|[A-Za-z]+[\u0600-\u06FF]/u;
    for (const u of OKACHA_UNITES) {
      expect(colle.test(u.uniteAr), u.uniteAr).toBe(false);
    }
  });
});

describe('terminologie et hygiène', () => {
  it('الظهيرة absente (la source écrit الظهرة — conforme au livre officiel)', () => {
    for (const u of OKACHA_UNITES) {
      expect(norm(u.lignes.join(' ')).includes('ظهيره'), u.id).toBe(false);
    }
  });

  it('les lignes ne sont pas vides et pas des numéros de page isolés', () => {
    for (const u of OKACHA_UNITES) {
      for (const l of u.lignes) {
        expect(l.trim().length, u.id).toBeGreaterThan(0);
        expect(l.trim(), `${u.id} : « ${l.slice(0, 20)} »`).not.toMatch(/^\d{1,4}$/);
      }
    }
  });

  it('D3 contient bien la géologie (subduction/الصفائح) et D2 l énergie (الغلوكوز/ATP)', () => {
    const d3 = norm(OKACHA_UNITES.filter((u) => u.domaine === 3).map((u) => u.lignes.join(' ')).join(' '));
    const d2 = norm(OKACHA_UNITES.filter((u) => u.domaine === 2).map((u) => u.lignes.join(' ')).join(' '));
    expect(d3.includes(norm('الصفائح')) || d3.includes(norm('الغوص')), 'D3 géologie').toBe(true);
    expect(d2.includes(norm('الغلوكوز')) && d2.includes('ATP'), 'D2 énergie').toBe(true);
  });
});
