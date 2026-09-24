// okachaEnriched.lock.test.ts — verrou v2 du بنك الحفظ structuré (généré par
// scripts/enrich_okacha.ts à partir de l'injection v1 verbatim okacha.ts).
// Fige : parité totale avec okacha.ts (10 unités, mêmes ids/domaines/libellés,
// même ordre), zéro fragment orphelin (< 20 car.), numérotation propre
// (« N- texte », sans tabulation), couverture INTÉGRALE du texte source (toute
// ligne d'origine reste présente — recollée ou corrigée via ENRICH_FIXES —
// SAUF déchets scan (score ≥ seuil), retirés en lot B à la génération),
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
import { assainirTexte, estDechetOCR } from './okachaQuality';

const flat = (s: string) => normAr(s).replace(/\s+/g, '');
/** Comparaison de couverture : on retire les marqueurs de tête (numéros, puces,
 *  tirets, astérisques, alef orphelin, apostrophes/gargouilles OCR « 3'?- »)
 *  qui sont du FORMATAGE — recollés ou normalisés par l'enrichissement.
 *  Symétrique : appliqué aux DEUX côtés. Les carrés ■ sont aussi retirés
 *  (assainirTexte lot A/B) des deux côtés pour la comparaison. */
const bare = (s: string) => flat(assainirTexte(s)).replace(/^[0-9٠-٩اا\-–.٫:\s*•'ʼ?؟]+/, '');
const avecFixes = (ligne: string) => {
  let t = ligne;
  for (const f of ENRICH_FIXES) t = t.split(f.from).join(f.to);
  // Filtre OCR documenté (enrich_okacha.ts) : 9070 → 90 % + queue de chiffres.
  t = t.split('9070').join('90 %');
  return t;
};
/** Résidus OCR volontairement filtrés des sections (retrait — pas une perte de sens). */
const RE_RESIDU_OCR =
  /مكاداللطالس المنهول|كاداللطالس المنهول|ماشة الطالس المنهوق|كاشة لإطالس المنهوق|كاشة لاطالب المنفوق|زعبف مهما|طتتلاعفيه قالبا|ييياييبيطات|ف مفات مرب|فعاياكاي|موقمين نحفبزين|اا40من|Blot اا0|ابونان|تديييدييتديييدييي|خثئكلكتلاتتكبيككادافاة|عوف تتعاعل مع القادة|يعكائ للطاف|لابهم حجم المرض|توترة إل باه|لنت كابنة رقور|اشلنكمات الفتاحية|باكاد اليان الاحن|إق \(رس بعوان|أعلب السومات|لابيي»ال64ال|نئ\^ عدت|المنهوف ا عاوم|إنماز رسم تهطيطي|و ددابة لبا|خرل ازنجامة|أولا عليك بقراءة التعليمة بحذر|^[\s\W]*لفار\.|تكيكك|القسم ؟|،٠٠/u;
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
    // 61 avant purge OCR « 17 signatures » (2026-09-23) — 3 points corrompus
    // → 58 ; lot B (2026-09-24) retire 1 point déchet scan → 57.
    expect(points).toBeGreaterThanOrEqual(57);
  });
});

describe('couverture intégrale : toute ligne dorigine reste présente', () => {
  it('unités : chaque ligne couverte SAUF déchets scan (lot B — retrait documenté)', () => {
    let dechets = 0;
    for (const u of OKACHA_UNITES) {
      for (const l of u.lignes) {
        if (!l.trim()) continue;
        if (estDechetOCR(l)) { dechets++; continue; }
        expect(couverte(l), `${u.id} : ${l.slice(0, 45)}`).toBe(true);
      }
    }
    // Le retrait de déchets a bien des cibles dans les unités (sinon B est aveugle).
    expect(dechets).toBeGreaterThanOrEqual(1);
  });

  it('méthodo : chaque ligne couverte SAUF résidus OCR + déchets (filtrés)', () => {
    let filtrees = 0;
    for (const l of OKACHA_METHODO.lignes) {
      if (!l.trim()) continue;
      if (RE_RESIDU_OCR.test(l) || estDechetOCR(l)) { filtrees++; continue; }
      expect(couverte(l), `méthodo : ${l.slice(0, 45)}`).toBe(true);
    }
    // Le filtre a bien des cibles documentées (sinon le masque est cassé).
    expect(filtrees).toBeGreaterThanOrEqual(5);
  });
});

describe('sections méthodo : 9 (8 livre + nasiha) + sous-sections tamarin1 stables', () => {
  it('ids dans l’ordre du livre, nasiha en 9ᵉ, sous tamarin1 valides', () => {
    const ids = OKACHA_METHODO_SECTIONS.map((s) => s.id);
    expect(ids).toEqual([
      'intro', 'hikala', 'tamarin1', 'tahil', 'tafsir',
      'mouqarana', 'istinj', 'istidlal', 'nasiha',
    ]);
    const t1 = OKACHA_METHODO_SECTIONS.find((s) => s.id === 'tamarin1')!;
    expect(t1.sous?.length).toBeGreaterThanOrEqual(5);
    const sousIds = (t1.sous ?? []).map((x) => x.id);
    expect(sousIds).toEqual([...new Set(sousIds)]); // ids stables uniques
    expect(sousIds[0]).toBe('t1-entree');
    for (const ss of t1.sous ?? []) {
      expect(ss.from, ss.id).toBeGreaterThanOrEqual(0);
      expect(ss.from, ss.id).toBeLessThan(t1.blocs.length);
      expect(ss.titreAr.length, ss.id).toBeGreaterThan(3);
    }
    // from strictement croissant
    const froms = (t1.sous ?? []).map((x) => x.from);
    for (let i = 1; i < froms.length; i++) expect(froms[i]).toBeGreaterThan(froms[i - 1]);
  });

  it('nasiha : section finale Issue de قسم النصائح (ex-d2u2), ≥ 20 blocs', () => {
    const nas = OKACHA_METHODO_SECTIONS.find((s) => s.id === 'nasiha');
    expect(nas).toBeTruthy();
    expect(nas!.blocs.length).toBeGreaterThanOrEqual(20);
    const t = normAr(nas!.blocs.map((b) => b.texte).join(' '));
    expect(t.includes(normAr('قسم النصائح'))).toBe(true);
    expect(t.includes(normAr('لا أنصح'))).toBe(true);
    // Plus de mélange : les conseils ne sont PLUS dans les unités
    const unites = normAr(OKACHA_UNITES_ENRICHIES.flatMap((u) => u.blocs.map((b) => b.texte)).join(' '));
    expect(unites.includes(normAr('قسم النصائح'))).toBe(false);
    expect(unites.includes(normAr('لا أنصحك بالتغيب'))).toBe(false);
  });
});

describe('anti-résidu OCR dans les sections (filtre enrich_okacha)', () => {
  it('zéro footer éditeur / signature illisible / 9070 dans les 9 sections', () => {
    const t = OKACHA_METHODO_SECTIONS.flatMap((s) => s.blocs.map((b) => b.texte)).join('\n');
    for (const interdit of [
      '9070', 'مكاداللطالس', 'ماشة الطالس', 'كاشة لإطالس', '٦٤٥٦٢٦١٨',
      'Blot اا0', 'اا40من', 'زعبف مهما', 'La هي المراجعة',
    ]) {
      expect(t.includes(interdit), `résidu OCR : « ${interdit} »`).toBe(false);
    }
    expect(ENRICH_STATS.ocrRetraits).toBeGreaterThanOrEqual(10);
    expect(ENRICH_STATS.ocrRetraits).toBeLessThan(80); // filtre ciblé, pas purgé en masse
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
    expect(ENRICH_STATS.genere).toBe('2026-09-24');
    expect(ENRICH_STATS.dechetsRetires).toBeGreaterThanOrEqual(8);
    // Le total des occurrences source >= corrections réellement appliquées
    // (un mot coupé par un recollage peut échapper au dictionnaire — verbatim).
    const total = ENRICH_FIXES.reduce((s, f) => s + f.count, 0);
    expect(total).toBeGreaterThanOrEqual(ENRICH_STATS.correctionsAppliquees);
    for (const f of ENRICH_FIXES) expect(f.count, f.from).toBeGreaterThanOrEqual(0);
  });
});
