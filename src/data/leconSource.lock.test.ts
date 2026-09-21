// leconSource.lock.test.ts — verrous du CONSOMMATEUR de l'index
// (src/data/bookIndex.ts : appariement leçons↔chapitres + traçabilité uniteId).
// Les verrous de l'INDEX lui-même sont dans bookIndex.lock.test.ts.
// Fige : la recette norm, la couverture uniteId 1-11 ↔ chapitres de l'index,
// l'appariement leçons↔chapitres (42 mappés / 11 nulls DOCUMENTÉS, 3 ancres),
// la propagation du flag ambigu, et le décalage programme/livre de la leçon
// « الظواهر المرتبطة بالغوص » (séquence U9, chapitre C51 = U11).

import { describe, expect, it } from 'vitest';
import {
  CHAPITRES,
  chapitresDeUnite,
  chapitreGlobal,
  badgeSource,
  norm,
  sourceLivre,
  sourceAmbigue,
} from './bookIndex';
import { getUnitLessonSequence } from './unitLessonSequences';
import { getActiveLessonTitle, getPassiveLessonTitle } from './lessonModes';
import { ACTIVE_LESSONS } from './activeLessons';
import { CORRECTEUR_V1_UNITES } from '../correcteurV1';
import { CALIBRATION_BAC2025, uniteDeGroupe } from './dictionaries/calibrationBac2025';

const toutesCles = (): string[] => {
  const s = new Set<string>();
  for (let u = 1; u <= 11; u++) for (const k of getUnitLessonSequence(u)) s.add(k);
  return [...s].sort();
};

const cleToTitre = (k: string): string =>
  k.startsWith('lecon_') || k.startsWith('phase')
    ? getPassiveLessonTitle(k)
    : (ACTIVE_LESSONS as Record<string, { title?: string }>)[k]?.title ?? '';

describe('bookIndex — normalisation (recette partagée avec builder + verrous ingestion)', () => {
  it('vecteurs figés : hamza standalone, casse latine, ta marbouta, variants OCR', () => {
    expect(norm('تذكير بالمكتسبات')).toBe('تذكير بالمكتسبات');
    expect(norm('تأثير')).toBe(norm('تاثير')); // hamza sur alif ≡ alif nu
    expect(norm('طرق تأثير اللمفاويات LTc')).toContain('ltc'); // casse préservée → lower
    expect(norm('الترجمة')).toBe('الترجمه');
    expect(norm('الذات واللاذات')).toBe('الذات واللاذات');
    expect(norm('  ADN  ')).toBe('adn');
  });
});

describe('bookIndex — uniteId 1-11 ↔ chapitres de l index (traçabilité structurelle)', () => {
  it('les 11 unités du correcteur couvrent les 55 chapitres, chacun exactement une fois', () => {
    expect(CORRECTEUR_V1_UNITES.map((u) => u.uniteId)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    const toutes = CHAPITRES.map(() => 0);
    for (let u = 1; u <= 11; u++) {
      const cs = chapitresDeUnite(u);
      expect(cs.length, `uniteId ${u}`).toBeGreaterThan(0);
      for (const c of cs) toutes[c.chapter - 1]++;
    }
    expect(toutes.every((n) => n === 1)).toBe(true);
  });

  it('comptes par unité = grille contractuelle (U4=11, U8=1, U11=8, Σ=55)', () => {
    const comptes = Array.from({ length: 11 }, (_, i) => chapitresDeUnite(i + 1).length);
    expect(comptes).toEqual([5, 3, 4, 11, 7, 4, 6, 1, 3, 3, 8]);
    expect(comptes.reduce((a, b) => a + b, 0)).toBe(55);
  });

  it('spots de frontières : U4=C13-23 (مناعة), U8=C41 (bilan), U11=C48-55', () => {
    const de = (u: number) => chapitresDeUnite(u);
    expect(de(4).map((c) => c.chapter)).toEqual(Array.from({ length: 11 }, (_, i) => i + 13));
    expect(de(8).map((c) => c.chapter)).toEqual([41]);
    expect(de(11).map((c) => c.chapter)).toEqual([48, 49, 50, 51, 52, 53, 54, 55]);
    expect(norm(de(4)[0].titreAr)).toBe(norm('تذكير بالمكتسبات'));
    expect(de(8)[0].titreAr).toContain('التحولات الطاقوية');
  });

  it('calibration BAC 2025 : uniteId valides, (sujet,ex) → uniteId stable', () => {
    for (const g of CALIBRATION_BAC2025) expect(g.uniteId).toBeGreaterThanOrEqual(1);
    expect(g_unite(1, 1)).toBe(1);
    expect(g_unite(2, 3)).toBe(4);
    function g_unite(s: 1 | 2, e: 1 | 2 | 3): number | null {
      return uniteDeGroupe(s, e)?.uniteId ?? null;
    }
  });
});

describe('bookIndex — appariement leçons ↔ chapitres (mesure figée)', () => {
  const cles = toutesCles();

  it('53 clés dans la séquence officielle ; 42 mappées, 11 nulls documentés', () => {
    expect(cles).toHaveLength(53);
    const mappes = cles.filter((k) => sourceLivre(k, cleToTitre(k)) !== null);
    expect(mappes).toHaveLength(42);
    const nulls = cles.filter((k) => sourceLivre(k, cleToTitre(k)) === null);
    // LISTE FIGÉE — toute évolution doit être un choix relu, pas un effet de bord.
    expect(nulls).toEqual([
      'd2-u6-l1-hill-ruben', // leçons expérimentales : démarche, pas de chapitre TDM dédié
      'd2-u6-l2-jagendorf',
      'd2-u6-l3-calvin',
      'd2-u7-l1-mitchell-racker',
      'd3-u9-l2-benioff',
      'phase12_chapitres_23_24_2', // synthèse inter-chapitres sans en-tête dédié
      'phase15_chapitres_29_30_2', // culture générale — hors TDM (curriculumOfficial)
      'phase18_chapitres_35_36_2', // تيارات الحمل : 0 occurrence OCR
      'phase22_chapitres_43_44', // culture générale — hors TDM
      'phase22_chapitres_43_44_2', // culture générale — hors TDM
      'phase5_chapitres_9_10_2', // ABO/Rh : aucune preuve OCR dans U4
    ]);
  });

  it('exactement 3 ancres documentées, chapitres existants + raison non vide', () => {
    const ancres = ['phase1_chapitres_1_2_2', 'phase11_chapitres_21_22_2', 'phase12_chapitres_23_24'];
    for (const k of ancres) {
      const s = sourceLivre(k, cleToTitre(k));
      expect(s?.mode, k).toBe('ancre-documentee');
      expect(s?.chapitres.length, k).toBeGreaterThan(0);
      expect(s?.chapitres.every((c) => c.chapter >= 1 && c.chapter <= 55)).toBe(true);
    }
    expect(sourceLivre('phase1_chapitres_1_2_2', '')?.chapitres.map((c) => c.chapter)).toEqual([4, 5]);
    expect(sourceLivre('phase11_chapitres_21_22_2', '')?.chapitres.map((c) => c.chapter)).toEqual([33]);
    expect(sourceLivre('phase12_chapitres_23_24', '')?.chapitres.map((c) => c.chapter)).toEqual([34]);
  });

  it('répartition des modes auto figée (aucun glissement silencieux du matcher)', () => {
    const comptes: Record<string, number> = {};
    for (const k of cles) {
      const s = sourceLivre(k, cleToTitre(k));
      if (s) comptes[s.mode] = (comptes[s.mode] ?? 0) + 1;
    }
    expect(comptes).toEqual({
      'auto-exact': 25,
      'auto-compose': 1,
      'auto-contenance': 11,
      'auto-jetons': 2,
      'ancre-documentee': 3,
    });
  });

  it('le flag ambigu se propage à la leçon (phase7 → C19, en-tête OCR tronqué)', () => {
    const s = sourceLivre('phase7_chapitres_13_14', cleToTitre('phase7_chapitres_13_14'));
    expect(s?.chapitres.map((c) => c.chapter)).toEqual([19]);
    expect(sourceAmbigue(s!)).toBe(true);
    // et une source non ambiguë reste non marquée
    const s2 = sourceLivre('phase8_chapitres_15_16', cleToTitre('phase8_chapitres_15_16'));
    expect(sourceAmbigue(s2!)).toBe(false);
  });

  it('décalage programme/livre FIGÉ : « الظواهر المرتبطة بالغوص » (U9) = chapitre C51 (U11)', () => {
    const s = sourceLivre('phase17_chapitres_33_34', cleToTitre('phase17_chapitres_33_34'));
    expect(s?.mode).toBe('auto-exact');
    const c = s?.chapitres[0];
    expect(c?.chapter).toBe(51);
    expect(`${c?.domain}:${c?.unit}`).toBe('3:3'); // U11 globale
    // la leçon suivante du même fichier tombe sur C52 (U11 aussi)
    const s2 = sourceLivre('phase17_chapitres_33_34_2', cleToTitre('phase17_chapitres_33_34_2'));
    expect(s2?.chapitres[0]?.chapter).toBe(52);
  });

  it('badge : chapitre unique = « الفصل N · أسطر a–b » ; paire = intervalle de chapitres', () => {
    const s1 = sourceLivre('phase8_chapitres_15_16', cleToTitre('phase8_chapitres_15_16'))!;
    expect(badgeSource(s1)).toBe(`الفصل 27 · أسطر ${chapitreGlobal(27).ligneDebut}–${chapitreGlobal(27).ligneFin}`);
    const s2 = sourceLivre('phase1_chapitres_1_2', cleToTitre('phase1_chapitres_1_2'))!;
    expect(badgeSource(s2)).toMatch(/^الفصل 1–2 · أسطر \d+–\d+$/);
    // cohérence : la plage badge est bien celle de l'index (min début, max fin)
    const debut = Math.min(...s2.chapitres.map((c) => c.ligneDebut));
    const fin = Math.max(...s2.chapitres.map((c) => c.ligneFin));
    expect(badgeSource(s2)).toBe(`الفصل 1–2 · أسطر ${debut}–${fin}`);
  });

  it('les plages affichées viennent TOUJOURS de l index (aucune ligne fabriquée ici)', () => {
    for (const k of cles) {
      const s = sourceLivre(k, cleToTitre(k));
      if (!s) continue;
      for (const c of s.chapitres) {
        expect(c.ligneDebut, k).toBe(CHAPITRES[c.chapter - 1].ligneDebut);
        expect(c.ligneFin, k).toBe(CHAPITRES[c.chapter - 1].ligneFin);
      }
    }
  });
});
