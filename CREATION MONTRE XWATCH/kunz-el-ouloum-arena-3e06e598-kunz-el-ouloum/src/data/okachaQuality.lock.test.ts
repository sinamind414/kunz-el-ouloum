// okachaQuality.lock.test.ts — verrous qualité (lots A+D, 2026-09-24).
//
// Contexte audit : ~1–2 % de déchets scan dans le corpus livre (traits ____,
// carrés ■, filigranes « المتفوف », soupe de lettres).
//   • Lot A — filtre d'affichage OkachaView (okachaQuality.ts) ;
//   • Lot B — régénération enrichie : les déchets sont retirés À LA SOURCE
//     (enrich_okacha.ts → filtreDechetOCR) — le brut régénéré est propre ;
//   • Lot D — ces verrous figent le score, le zéro déchet affiché, et le
//     zéro déchet dans le brut post-B (baseline inversée).
//
// NE PAS éditer okacha.ts / okachaEnriched.ts pour faire passer ces tests —
// régénérer via scripts/enrich_okacha.ts.
import { describe, expect, it } from 'vitest';
import {
  OKACHA_UNITES_ENRICHIES,
  OKACHA_METHODO_SECTIONS,
  ENRICH_STATS,
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
// Portée : FIGE l'absence des formes, elle ne score pas. Surtout ne pas
// recopier les formes du Lot F dans okachaQuality.RE_FILIGRANE : ce-là sert au
// SCORAGE de filtrerLignesDechet, et y ajouter « كاشة » y ferait tomber des
// lignes MIXTES (filigrane + contenu) avant nettoyage → perte de contenu.
// Le retrait du Lot F se fait par clés FIXES (famille B), pas par score.
const RE_FILIGRANE =
  /المتفوف|المثفوك|منفون|منفوش|عكاس[ةأ]\s+للطالب|مشروع\s+عكاس|مدروع\s+عكاس|امنفوش|كاشة|المنهوق|المنفوق|المنفوف|المنفوث|المنهوك|المنهوف|المتفوك|المذفوف|النهوق|لطالس|الدلالب|روءكاءة|اشف الملالب|اشة الطالب|عكامة للطالب|الطمبعة|المطبمة|الطببعة|المطسعة|مدسدمصح|٦بلمض/;

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

  it('zéro faux positif : titres propres + erreurs de lettres (corrigées en lot C)', () => {
    const propres = [
      'قسم المنهجية',
      '- الهدف',
      'مجموعات:',
      'ملاحظة:',
      'رحلة الانطلاق:',
      '159-دور CMH:',
      'ا- البروتينات هي جزيئات عضوية حيوية ضخمة تتركب داخل خلايا العضوية',
      'عالمية: متماثلة عند جميع الكائنات الحية مع وجود بعض الاستثناءات.',
      // Formes corrigées par le lot C (doivent rester affichables) :
      'سلسلة ببتيدية',
      'أحماض أمينية',
      'صنف من القواعد',
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

  it('l affiché reste substantiel (les 10 unités + 9 sections méthodo)', () => {
    expect(OKACHA_UNITES_ENRICHIES).toHaveLength(10);
    expect(OKACHA_METHODO_SECTIONS).toHaveLength(9);
    expect(affiches.length).toBeGreaterThan(tousBlocs.length * 0.9);
    for (const u of OKACHA_UNITES_ENRICHIES) {
      const vis = blocsAffichables(u.blocs);
      expect(vis.length, u.id).toBeGreaterThanOrEqual(15);
      expect(vis.map((b) => b.texte).join(' ').length, u.id).toBeGreaterThan(400);
    }
    for (const s of OKACHA_METHODO_SECTIONS) {
      expect(blocsAffichables(s.blocs).length, s.id).toBeGreaterThanOrEqual(3);
    }
  });

  it('ZÉRO trait ____{4,} / carré ■ / filigrane المتفوف dans l affiché', () => {
    for (const b of affiches) {
      expect(RE_TRAIT.test(b.texte), `trait : ${b.texte.slice(0, 60)}`).toBe(false);
      expect(RE_CARRE.test(b.texte), `carré : ${b.texte.slice(0, 60)}`).toBe(false);
      expect(RE_FILIGRANE.test(b.texte), `filigrane : ${b.texte.slice(0, 60)}`).toBe(false);
      expect(estDechetOCR(b.texte), `score : ${b.texte.slice(0, 60)}`).toBe(false);
    }
  });
});

describe('corpus BRUT post-lot B — régénération propre', () => {
  it('ENRICH_STATS trace les retraits de déchets (B actif)', () => {
    expect(ENRICH_STATS.dechetsRetires).toBeGreaterThanOrEqual(8);
    expect(ENRICH_STATS.genere).toBe('2026-09-24');
  });

  it('ZÉRO déchet score ≥ seuil dans le brut régénéré (lot B)', () => {
    // Après régénération, le brut est aussi propre que l'affiché :
    // le filtre OkachaView n'est plus qu'une défense en profondeur.
    const bruts = tousBlocs.filter((b) => estDechetOCR(b.texte));
    expect(bruts.length, bruts.map((b) => b.texte.slice(0, 50)).join(' | ')).toBe(0);
    for (const b of tousBlocs) {
      expect(RE_TRAIT.test(b.texte), b.texte.slice(0, 60)).toBe(false);
      expect(RE_FILIGRANE.test(b.texte), b.texte.slice(0, 60)).toBe(false);
    }
  });

  it('les 17 signatures OCR purgées restent absentes (verrou historique inchangé)', () => {
    const tout = tousBlocs.map((b) => b.texte).join('\n');
    for (const sig of ['اا40من ارتباط', 'ARNmJl', 'موقمين نحفبزين', 'Blot اا0']) {
      expect(tout.includes(sig), sig).toBe(false);
    }
  });
});
