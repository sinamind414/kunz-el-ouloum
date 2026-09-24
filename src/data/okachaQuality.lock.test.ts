// okachaQuality.lock.test.ts — verrous qualité d'AFFICHAGE (lot A+D, 2026-09-24).
//
// Contexte audit : ~1–2 % de déchets scan dans le corpus livre (traits ____,
// carrés ■, filigranes « المتفوف », soupe de lettres). Lot A = filtre dans
// OkachaView (okachaQuality.ts). Ce verrou fige :
//   1. le score et les signaux durs (trait / filigrane / carré) ;
//   2. le corpus AFFICHÉ (filtré + assaini) : ZÉRO déchet des 3 familles ;
//   3. le corpus BRUT reste une cible documentée pour le lot B (≥ baseline) ;
//   4. zéro faux positif sur titres/points propres et sur erreurs de lettres
//      lisibles (correction = lot C, pas le masquage).
//
// NE PAS éditer okacha.ts / okachaEnriched.ts pour faire passer ces tests —
// régénérer via scripts/enrich_okacha.ts si lot B est activé.
import { describe, expect, it } from 'vitest';
import {
  OKACHA_UNITES_ENRICHIES,
  OKACHA_METHODO_SECTIONS,
} from './okachaEnriched';
import {
  SEUIL_OCR,
  assainirTexte,
  blocsAffichables,
  estDechetOCR,
  scoreDechetOCR,
} from './okachaQuality';

/** Tous les textes du corpus livre (unités + méthodo enrichis). */
const tousBlocs = [
  ...OKACHA_UNITES_ENRICHIES.flatMap((u) => u.blocs),
  ...OKACHA_METHODO_SECTIONS.flatMap((s) => s.blocs),
];

const RE_TRAIT = /_{4,}/;
const RE_CARRE = /[■□]/;
const RE_FILIGRANE =
  /المتفوف|المثفوك|منفون|منفوش|عكاس[ةأ]\s+للطالب|مشروع\s+عكاس|مدروع\s+عكاس/;

describe('score OCR (lot A) — signaux durs calibrés', () => {
  it('seuil figé à 0.35 (audit 2026-09-23)', () => {
    expect(SEUIL_OCR).toBe(0.35);
  });

  it('les 3 familles de déchets scan sont au-dessus du seuil', () => {
    const echants = [
      'بربشفي^سأةم :',
      'ا٠ امنفوش ________________________________________________________________________المتفوفى في علوم الطبيعة والحياة',
      '٠٠٠" ٠٠ , ٠ ,,._■_ ٠٠,٠■ ٠٠‘ ٠٠٠ نج خ و الول..',
      '^لآيثي_______________________________________________________يييي^,لبط..س',
      'س- -------------------------------------------------------------------------------------------------',
      'مدروع عكاسة للطالب المنفوفى 284- ،كر دج سن مي وسد جهاز',
      'الطالب المتفوف المنفون',
    ];
    for (const e of echants) {
      expect(estDechetOCR(e), e.slice(0, 40)).toBe(true);
      expect(scoreDechetOCR(e), e.slice(0, 40)).toBeGreaterThanOrEqual(SEUIL_OCR);
    }
  });

  it('zéro faux positif : titres propres + erreurs de lettres lisibles (lot C)', () => {
    const propres = [
      'قسم المنهجية',
      '- الهدف',
      'مجموعات:',
      'ملاحظة:',
      'رحلة الانطلاق:',
      '159-دور CMH:',
      'ا- البروتينات هي جزيئات عضوية حيوية ضخمة تتركب داخل خلايا العضوية',
      'عالمية: متماثلة عند جميع الكائنات الحية مع وجود بعض الاستثناءات.',
      // Erreurs de lettres : lisibles → affichées (corrigées plus tard, lot C).
      'أحماض أمنية منشطة (حمض أميني)،',
      'سلسة ببتيدية',
      'وتبين أن البرونبن ضروري للحياة',
    ];
    for (const p of propres) {
      expect(estDechetOCR(p), p.slice(0, 40)).toBe(false);
    }
  });

  it('assainirTexte retire ■ sans réécrire le reste', () => {
    expect(assainirTexte('نتيجة صحيحة ■')).toBe('نتيجة صحيحة');
    expect(assainirTexte('  متن   مع  espaces  ')).toBe('متن مع espaces');
  });
});

describe('corpus AFFICHÉ (filtré + assaini) — banni des déchets', () => {
  const affiches = blocsAffichables(tousBlocs);

  it('le filtre a des cibles (sinon le verrou est aveugle) et ne purge pas en masse', () => {
    const masques = tousBlocs.length - affiches.length;
    // Audit : ~1–2 % de déchets — au moins 8 blocs masqués, jamais > 10 %.
    expect(masques).toBeGreaterThanOrEqual(8);
    expect(masques).toBeLessThan(Math.ceil(tousBlocs.length * 0.1));
    expect(affiches.length).toBeGreaterThan(tousBlocs.length * 0.9);
  });

  it('ZÉRO trait ____{4,} / carré ■ / filigrane المتفوف dans l affiché', () => {
    for (const b of affiches) {
      expect(RE_TRAIT.test(b.texte), `trait : ${b.texte.slice(0, 60)}`).toBe(false);
      expect(RE_CARRE.test(b.texte), `carré : ${b.texte.slice(0, 60)}`).toBe(false);
      expect(RE_FILIGRANE.test(b.texte), `filigrane : ${b.texte.slice(0, 60)}`).toBe(false);
      expect(estDechetOCR(b.texte), `score : ${b.texte.slice(0, 60)}`).toBe(false);
    }
  });

  it('l affiché reste substantiel (les 10 unités + 9 sections méthodo)', () => {
    expect(OKACHA_UNITES_ENRICHIES).toHaveLength(10);
    expect(OKACHA_METHODO_SECTIONS).toHaveLength(9);
    for (const u of OKACHA_UNITES_ENRICHIES) {
      const vis = blocsAffichables(u.blocs);
      expect(vis.length, u.id).toBeGreaterThanOrEqual(15);
      expect(vis.map((b) => b.texte).join(' ').length, u.id).toBeGreaterThan(400);
    }
    for (const s of OKACHA_METHODO_SECTIONS) {
      expect(blocsAffichables(s.blocs).length, s.id).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('corpus BRUT — baseline documentée pour le lot B', () => {
  it('les déchets restent dans le BRUT généré (le filtre est en affichage, pas dans le fichier)', () => {
    // Tant que le lot B (régénération scriptée) n est pas lancé, le brut
    // contient encore les déchets : si cette baseline tombe à 0, c est que le
    // corpus a été régénéré → mettre à jour ENRICH_STATS et recaler lot C.
    const bruts = tousBlocs.filter((b) => estDechetOCR(b.texte));
    expect(bruts.length).toBeGreaterThanOrEqual(8);
    expect(bruts.length).toBeLessThan(Math.ceil(tousBlocs.length * 0.1));
  });

  it('les 17 signatures OCR purgées restent absentes (verrou historique inchangé)', () => {
    const tout = tousBlocs.map((b) => b.texte).join('\n');
    for (const sig of ['اا40من ارتباط', 'ARNmJl', 'موقمين نحفبزين', 'Blot اا0']) {
      expect(tout.includes(sig), sig).toBe(false);
    }
  });
});
