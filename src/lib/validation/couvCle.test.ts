// couvCle.test.ts
// Tests du scorer C2 par-clé (docs/tadwin_decisions.md §2) + locks §6.1/§6.2 +
// interdiction d'union §4 + seuil candidat §8.
//
// Convention du repo : réponses modèles en prose فصحًى naturelle, JAMAIS une
// liste de mots-clés (anti sur-ajustement — voir correcteurV1.test.ts).

import { describe, expect, it } from 'vitest';
import { CORRECTEUR_V1_UNITES } from '../../correcteurV1';
import { normalizeAr, motPresentDans } from './normalizeAr';
import {
  evaluerCle,
  evaluerC2,
  seuilCouvertureCle,
  SEUIL_C2_CANDIDAT,
  ChoixClesInvalide,
  type ChoixCles,
} from './couvCle';
import { clesDeUnite, type CleTadwin } from '../../data/tadwinCles';

/** Clé synthétique pour tester la mécanique du seuil indépendamment des données. */
const cleSynth = (cle: string, ...atoms: string[]): CleTadwin => ({ cle, atoms });

// ──────────────────────────────────────────────────────────────────────────────
// 1. Locks sur le choix des clés (§6.1 : ⊆ prescrites ; §6.2 : ≥ 2)
// ──────────────────────────────────────────────────────────────────────────────

describe('couvCle — locks §6.1/§6.2 sur le choix des clés', () => {
  it('rejette une clé choisie hors des 3 prescrites de l\'unité (§6.1)', () => {
    const cles = clesDeUnite(1)!.map((c) => c.cle);
    const choix: ChoixCles = { uniteId: 1, clesChoisies: [cles[0], 'تركيب البروتين'] };
    expect(() => evaluerC2('réponse', choix)).toThrow(ChoixClesInvalide);
  });

  it('rejette moins de 2 clés choisies (§6.2 — plancher bloc = geste-signature)', () => {
    const [a] = clesDeUnite(1)!.map((c) => c.cle);
    expect(() => evaluerC2('réponse', { uniteId: 1, clesChoisies: [a] })).toThrow(ChoixClesInvalide);
  });

  it('rejette les doublons dans les clés choisies', () => {
    const [a, b] = clesDeUnite(1)!.map((c) => c.cle);
    expect(() =>
      evaluerC2('réponse', { uniteId: 1, clesChoisies: [a, a, b] }),
    ).toThrow(ChoixClesInvalide);
  });

  it('rejette une unité inconnue', () => {
    const [a, b] = clesDeUnite(1)!.map((c) => c.cle);
    expect(() => evaluerC2('réponse', { uniteId: 99, clesChoisies: [a, b] })).toThrow(
      ChoixClesInvalide,
    );
  });

  it('accepte 2 clés prescrites (le minimum bloc)', () => {
    const [a, b] = clesDeUnite(1)!.map((c) => c.cle);
    expect(() => evaluerC2('réponse', { uniteId: 1, clesChoisies: [a, b] })).not.toThrow();
  });

  it('accepte les 3 clés prescrites (le maximum)', () => {
    const cles = clesDeUnite(1)!.map((c) => c.cle);
    expect(() => evaluerC2('réponse', { uniteId: 1, clesChoisies: cles })).not.toThrow();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 2. Scoring par-clé sur données réelles (unité 1)
// ──────────────────────────────────────────────────────────────────────────────

const U1 = clesDeUnite(1)!.map((c) => c.cle);
const REPONSE_MODELE_U1 =
  'تتمثل المرحلة الأولى من التعبير المورثي في استنساخ المعلومة الوراثية داخل النواة، ' +
  'حيث تتدخل إنزيمة ARN بوليميراز لتركيب جزيئة ARNm انطلاقاً من إحدى سلسلتي ADN. ' +
  'ثم تغادر هذه الجزيئة النواة متجهة نحو الهيولى، فتبدأ عملية الترجمة على سطح الريبوزوم: ' +
  'يقرأ الريبوزوم تسلسل الرامزات، وتربط ARNt الناقلة الأحماض الأمينية المقابلة لكل رامزة.';

describe('couvCle — scoring par-clé', () => {
  it('une réponse modèle فصحى couvre les 3 clés de l\'unité 1 → C2 = 1', () => {
    const r = evaluerC2(REPONSE_MODELE_U1, { uniteId: 1, clesChoisies: U1 });
    expect(r.couvertes).toEqual(U1);
    expect(r.manquantes).toEqual([]);
    expect(r.c2).toBe(1);
    expect(r.detail).toHaveLength(3);
  });

  it('une réponse vide ne couvre aucune clé → C2 = 0', () => {
    const r = evaluerC2('', { uniteId: 1, clesChoisies: U1 });
    expect(r.couvertes).toEqual([]);
    expect(r.c2).toBe(0);
  });

  it('un charabia ne couvre aucune clé → C2 = 0', () => {
    const r = evaluerC2(
      'فلثمحقر بضغثتس زطنق شذفها خنقذ يرطنفل وذمغ',
      { uniteId: 1, clesChoisies: U1 },
    );
    expect(r.couvertes).toEqual([]);
    expect(r.c2).toBe(0);
  });

  it('une réponse partielle couvre 2 clés sur 3 → C2 = 2/3', () => {
    const r = evaluerC2(
      'يحدث استنساخ المعلومة الوراثية في النواة بواسطة إنزيمة ARN بوليميراز، فينتج ARNm.',
      { uniteId: 1, clesChoisies: U1 },
    );
    expect(r.couvertes).toEqual([U1[0], U1[1]]);
    expect(r.manquantes).toEqual([U1[2]]);
    expect(r.c2).toBeCloseTo(2 / 3, 6);
  });

  it('tolère les diacritiques et le tatweel (normalizeAr)', () => {
    // Même réponse modèle, vocalisée et avec allongements — doit rester couverte.
    const vocalisee = REPONSE_MODELE_U1.replace(
      'استنساخ',
      'اسْــتِنْساخ',
    ).replace('النواة', 'النَّوَاة');
    const r = evaluerC2(vocalisee, { uniteId: 1, clesChoisies: U1 });
    expect(r.couvertes).toEqual(U1);
  });

  it('évalue chaque clé sur SES PROPRES atomes — pas sur ceux des autres clés', () => {
    // Réponse qui couvre la clé 3 (الترجمة) mais pas la clé 1 (الاستنساخ).
    const r = evaluerC2(
      'تحدث عملية الترجمة على الريبوزوم حيث تقرأ الرامزات وتربط ARNt الأحماض الأمينية.',
      { uniteId: 1, clesChoisies: U1 },
    );
    expect(r.couvertes).toEqual([U1[2]]);
    expect(r.manquantes).toEqual([U1[0], U1[1]]);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 3. Union INTERDITE (§4) — le pool motsCles de l'unité ne crédite jamais une clé
// ──────────────────────────────────────────────────────────────────────────────

describe('couvCle — union interdite (§4)', () => {
  it('un bourrage du pool motsCles de l\'unité SANS atome → 0 clé couverte', () => {
    const u1 = CORRECTEUR_V1_UNITES.find((u) => u.uniteId === 1)!;
    const choix: ChoixCles = { uniteId: 1, clesChoisies: [U1[0], U1[1]] };
    const atomes = clesDeUnite(1)!
      .filter((c) => choix.clesChoisies.includes(c.cle))
      .flatMap((c) => c.atoms);
    // On ne garde que les termes du pool qui à eux seuls ne prouvent AUCUN atome.
    const bourrage = u1.motsCles.filter(
      (m) => !atomes.some((a) => motPresentDans(normalizeAr(m), normalizeAr(a))),
    );
    expect(bourrage.length, 'le pool contient assez de termes neutres').toBeGreaterThan(5);
    // Séparateur latin 'X' : aucun atome (arabe ou latin) ne peut traverser.
    const reponse = bourrage.join(' X ');
    const r = evaluerC2(reponse, choix);
    expect(r.couvertes).toEqual([]);
    expect(r.c2).toBe(0);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 4. Seuil candidat §8 — « ≥ la moitié des atomes, minimum 1 »
// ──────────────────────────────────────────────────────────────────────────────

describe('couvCle — seuil candidat §8 (PROVISOIRE, calibration en attente)', () => {
  it('seuilCouvertureCle = max(1, ceil(n × 0,5))', () => {
    expect(seuilCouvertureCle(1)).toBe(1);
    expect(seuilCouvertureCle(2)).toBe(1);
    expect(seuilCouvertureCle(3)).toBe(2);
    expect(seuilCouvertureCle(4)).toBe(2);
    expect(seuilCouvertureCle(5)).toBe(3);
    expect(seuilCouvertureCle(7)).toBe(4);
  });

  it('une clé mono-atome exige son unique atome', () => {
    expect(evaluerCle('ماء', cleSynth('k', 'ماء')).couvert).toBe(true);
    expect(evaluerCle('نواة', cleSynth('k', 'ماء')).couvert).toBe(false);
  });

  it('une clé à 2 atomes est couverte par UN seul atome (12/33 clés sont dans ce cas)', () => {
    expect(evaluerCle('ماء', cleSynth('k', 'ماء', 'نواة')).couvert).toBe(true);
    expect(evaluerCle('نواة', cleSynth('k', 'ماء', 'نواة')).couvert).toBe(true);
  });

  it('une clé à 3 atomes exige 2 atomes (1 seul ne suffit pas)', () => {
    expect(evaluerCle('ماء', cleSynth('k', 'ماء', 'نواة', 'ريبوزوم')).couvert).toBe(false);
    expect(evaluerCle('ماء نواة', cleSynth('k', 'ماء', 'نواة', 'ريبوزوم')).couvert).toBe(true);
  });

  it('une clé à 5 atomes en exige 3', () => {
    const k = cleSynth('k', 'ماء', 'نواة', 'ريبوزوم', 'رامزة', 'إنزيمة');
    expect(evaluerCle('ماء نواة', k).couvert).toBe(false);
    expect(evaluerCle('ماء نواة ريبوزوم', k).couvert).toBe(true);
  });

  it('le seuil est surchargeable — la calibration décidera de la valeur finale', () => {
    // À seuil 1,0, une clé à 2 atomes exige les deux : c'est ce que la
    // calibration sur fiches-modèles devra arbitrer (§8).
    expect(evaluerCle('ماء', cleSynth('k', 'ماء', 'نواة'), 1).couvert).toBe(false);
    expect(evaluerCle('ماء نواة', cleSynth('k', 'ماء', 'نواة'), 1).couvert).toBe(true);
  });

  it('candidat §8 : une clé relationnelle 2-atomes est couverte par UN seul pôle', () => {
    // FLAG CALIBRATION — u2 « العلاقة بنية↔وظيفة » (atomes: البنية, وظيفة).
    // La réponse ne cite qu'un pôle (البنية) ; le candidat la crédite (1/2 ≥ 1).
    // C'est précisément un cas que les fiches-modèles doivent trancher : créditer
    // un seul pôle d'une RELATION est douteux, mais le fixer maintenant serait
    // supposer le seuil (réfuté §7). La note reste marquée « à vérifier ».
    const r = evaluerC2(
      'تحدد البنية الفراغية شكل البروتين',
      { uniteId: 2, clesChoisies: ['البنية الأولية', 'العلاقة بنية↔وظيفة'] },
    );
    const relation = r.detail.find((d) => d.cle === 'العلاقة بنية↔وظيفة')!;
    expect(relation.atomsPresents).toEqual(['البنية']);
    expect(relation.atomsManquants).toEqual(['وظيفة']);
    expect(relation.couvert).toBe(true);
    expect(SEUIL_C2_CANDIDAT).toBe(0.5);
  });
});
