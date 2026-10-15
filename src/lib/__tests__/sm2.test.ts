// src/lib/__tests__/sm2.test.ts — verrouille l'algorithme canonique de répétition espacée.
//
// Le défaut réparé le 15/10/2026 : l'intervalle ne dépendait pas de la réponse.
// Ces tests existent pour que la question « qu'est-ce qui décide de l'échéance ? »
// ait une réponse unique et vérifiable, quelle que soit la partie de l'application.
import { describe, expect, it } from 'vitest';
import {
  JOUR_MS,
  SM2_EASE_DEFAUT,
  SM2_EASE_MIN,
  echelleNominaleSm2,
  estDue,
  etatSm2Initial,
  intervalleApres,
  joursAvantEcheance,
  prochainEtatSm2,
  qualiteDepuisAutoEvaluation,
  qualiteDepuisPreuves,
  type EtatSm2,
  type QualiteSm2,
} from '../sm2';

const T = 1_700_000_000_000; // instant fixe : aucun test ne doit dépendre de l'horloge

describe('échelle nominale — ce que produit une suite de réponses parfaites', () => {
  it('1 → 6 → ×EF, la vraie échelle de SM-2', () => {
    const e = echelleNominaleSm2(4, T);
    expect(e[0]).toBe(1);
    expect(e[1]).toBe(6);
    // Le facteur de facilité est mis à jour AVANT de servir d'intervalle :
    // une réponse parfaite le fait monter de 0,1, donc
    //   6 × 2,8 = 16,8 → 17   puis   17 × 2,9 = 49,3 → 49
    // C'est la convention de Wozniak (I(n) = I(n−1) × EF'), et c'est aussi
    // exactement ce que faisaient les flashcards avant ce module — vérifié par
    // `flashcardsSrs.test.ts` : « i3.intervalDays = round(6 × i3.ease) ».
    expect(e[2]).toBe(Math.round(6 * 2.8));
    expect(e[3]).toBe(Math.round(Math.round(6 * 2.8) * 2.9));
  });

  it('un élément neuf est toujours dû', () => {
    expect(estDue(null, T)).toBe(true);
    expect(joursAvantEcheance(null, T)).toBe(0);
  });
});

describe('prochainEtatSm2 — la transition, formule de Wozniak', () => {
  it('le facteur de facilité suit exactement la formule SM-2', () => {
    // EF' = EF + (0,1 − (5−q)(0,08 + (5−q)0,02))
    const cas: Array<[QualiteSm2, number]> = [
      [5, +0.1],
      [4, 0],
      [3, -0.14],
      [2, -0.32],
      [0, -0.8],
    ];
    for (const [q, delta] of cas) {
      const s = prochainEtatSm2(etatSm2Initial(T), q, T);
      expect(s.ease, `q=${q}`).toBeCloseTo(SM2_EASE_DEFAUT + delta, 10);
    }
  });

  it('le facteur ne descend jamais sous 1,3, même après trente échecs', () => {
    let s: EtatSm2 = etatSm2Initial(T);
    for (let i = 0; i < 30; i++) s = prochainEtatSm2(s, 0, T);
    expect(s.ease).toBe(SM2_EASE_MIN);
  });

  it('trois réussites : 1 jour, 6 jours, puis intervalle × facteur', () => {
    const a = prochainEtatSm2(null, 4, T);
    expect(a.intervalDays).toBe(1);
    expect(a.reps).toBe(1);
    const b = prochainEtatSm2(a, 4, T);
    expect(b.intervalDays).toBe(6);
    const c = prochainEtatSm2(b, 4, T);
    expect(c.intervalDays).toBe(Math.round(6 * c.ease));
  });

  it('l’échéance est bien calculée en millisecondes', () => {
    const s = prochainEtatSm2(null, 4, T);
    expect(s.dueAt).toBe(T + 1 * JOUR_MS);
    expect(estDue(s, T)).toBe(false);
    expect(estDue(s, T + JOUR_MS)).toBe(true);
  });
});

describe('l’échec — et ce qu’en retient l’algorithme', () => {
  it('échec « lendemain » : le cycle repart à 1 jour, l’échec est compté', () => {
    const echoue = prochainEtatSm2(prochainEtatSm2(null, 5, T), 2, T);
    expect(echoue.reps).toBe(0);
    expect(echoue.intervalDays).toBe(1);
    expect(echoue.lapses).toBe(1);
    expect(echoue.dueAt).toBe(T + JOUR_MS);
  });

  it('échec « intra-séance » : l’élément se reprÉSENTE tout de suite (cas des cartes)', () => {
    const echoue = prochainEtatSm2(prochainEtatSm2(null, 5, T), 2, T, {
      apresEchec: 'intra-seance',
    });
    expect(echoue.intervalDays).toBe(0);
    expect(echoue.dueAt).toBe(T);
  });

  it('un élément raté revient PLUS TÔT qu’un élément réussi — c’est tout l’algorithme', () => {
    const dur = prochainEtatSm2(null, 2, T);
    const facile = prochainEtatSm2(null, 4, T);
    // Le premier est reparti à 1 jour, mais son facteur de facilité est plus bas :
    // à réussite égale ensuite, il restera plus court.
    const durPuisOk = prochainEtatSm2(dur, 4, T);
    const facilePuisOk = prochainEtatSm2(facile, 4, T);
    expect(durPuisOk.ease).toBeLessThan(facilePuisOk.ease);
    expect(durPuisOk.intervalDays).toBeLessThanOrEqual(facilePuisOk.intervalDays);
  });

  it('la difficulté est RETENUE, pas effacée par la première réussite', () => {
    // Deux éléments, même nombre de répétitions, historiques différents.
    let difficile: EtatSm2 = etatSm2Initial(T);
    for (let i = 0; i < 3; i++) difficile = prochainEtatSm2(difficile, 2, T); // 3 échecs
    for (let i = 0; i < 3; i++) difficile = prochainEtatSm2(difficile, 4, T); // puis 3 réussites
    let facile: EtatSm2 = etatSm2Initial(T);
    for (let i = 0; i < 6; i++) facile = prochainEtatSm2(facile, 4, T); // 6 réussites
    expect(difficile.ease).toBeLessThan(facile.ease);
    expect(difficile.lapses).toBe(3);
  });
});

describe('ajustement « anki » — les boutons ne doivent pas mentir', () => {
  it('difficile < bien < facile sur le même historique', () => {
    const base = prochainEtatSm2(prochainEtatSm2(null, 4, T), 4, T);
    const opt = { ajustement: 'anki' as const };
    const dur = intervalleApres(base, 3, T, opt);
    const bien = intervalleApres(base, 4, T, opt);
    const facile = intervalleApres(base, 5, T, opt);
    expect(dur).toBeLessThan(bien);
    expect(facile).toBeGreaterThan(bien);
  });

  it('l’ajustement ÉLARGIT un écart que le facteur de facilité produisait déjà', () => {
    // Correction de ma propre erreur de rédaction (15/10/2026) : j'avais écrit
    // que sans ajustement « difficile » et « bien » donneraient le MÊME délai.
    // C'est faux, et heureusement : le facteur de facilité est mis à jour par
    // chaque réponse, donc q=3 (EF −0,14) produit déjà un intervalle plus court
    // que q=4 (EF inchangé). L'ajustement « anki » ne crée pas l'écart, il
    // l'amplifie — ce que ce test fixe désormais.
    const base = prochainEtatSm2(prochainEtatSm2(null, 4, T), 4, T);
    const sansAjustement = [3, 4, 5].map((q) => intervalleApres(base, q as QualiteSm2, T));
    const avecAjustement = [3, 4, 5].map((q) =>
      intervalleApres(base, q as QualiteSm2, T, { ajustement: 'anki' }),
    );
    // Croissants dans les deux cas…
    for (const serie of [sansAjustement, avecAjustement]) {
      expect(serie[0]).toBeLessThan(serie[1]);
      expect(serie[1]).toBeLessThan(serie[2]);
    }
    // …et l'écart est plus large avec l'ajustement.
    const etendue = (s: number[]) => s[2] - s[0];
    expect(etendue(avecAjustement)).toBeGreaterThan(etendue(sansAjustement));
  });
});

describe('qualiteDepuisPreuves — l’intervalle dépend du TEXTE de l’élève', () => {
  const preuves = {
    acceptedEvidence: ['التيلاكويد', 'الضوء', 'ATP', 'NADPH', 'الحشوة'],
    minEvidence: 3,
  };

  it('aucune preuve → 0', () => {
    expect(qualiteDepuisPreuves('لا أعرف', preuves)).toBe(0);
    expect(qualiteDepuisPreuves('', preuves)).toBe(0);
  });

  it('sous le seuil exigé → 2 (c’est un échec au sens de l’algorithme)', () => {
    expect(qualiteDepuisPreuves('في التيلاكويد', preuves)).toBe(2);
    expect(qualiteDepuisPreuves('الضوء و ATP', preuves)).toBe(2);
  });

  it('seuil atteint → 3 · essentiel couvert → 4 · réponse complète → 5', () => {
    expect(qualiteDepuisPreuves('الضوء ATP NADPH', preuves)).toBe(3); // 3/5 = 60 %
    expect(qualiteDepuisPreuves('التيلاكويد الضوء ATP NADPH', preuves)).toBe(4); // 4/5 = 80 %
    expect(
      qualiteDepuisPreuves('التيلاكويد الضوء ATP NADPH الحشوة', preuves),
    ).toBe(5);
  });

  it('ne se laisse pas berner par un terme caché dans un autre mot', () => {
    // « ATPase » ne vaut pas la preuve « ATP » : sinon une réponse fausse
    // allongerait l’échéance, ce qui est le pire des deux défauts possibles.
    const p = { acceptedEvidence: ['ATP'], minEvidence: 1 };
    expect(qualiteDepuisPreuves('ATPase', p)).toBe(0);
    expect(qualiteDepuisPreuves('جزيء ATP', p)).toBe(5);
  });

  it('l’article arabe collé au mot ne fait rater aucune preuve', () => {
    // Défaut réel, trouvé en écrivant le câblage du tuteur : les mots-clés des
    // fiches sont écrits SANS article (`نسخ`), l'élève écrit AVEC (`النسخ`).
    // Une comparaison littérale refusait donc de compter la preuve.
    expect(qualiteDepuisPreuves('النسخ والترجمة', { acceptedEvidence: ['نسخ', 'ترجمة'], minEvidence: 2 })).toBe(5);
    // …et dans l'autre sens, le corpus peut porter l'article.
    expect(qualiteDepuisPreuves('في تيلاكويد الصانعة', { acceptedEvidence: ['التيلاكويد'], minEvidence: 1 })).toBe(5);
  });

  it('le « و » de coordination est retiré, mais pas un « و » de racine', () => {
    const p = { acceptedEvidence: ['ترجمة'], minEvidence: 1 };
    expect(qualiteDepuisPreuves('النسخ والترجمة', p)).toBe(5);
    // « وحدة » (unité) ne doit pas devenir « حدة » : on ne retire le و que
    // lorsqu'il précède l'article.
    expect(qualiteDepuisPreuves('وحدة', { acceptedEvidence: ['حدة'], minEvidence: 1 })).toBe(0);
  });

  it('l’ordre des mots et la ponctuation ne changent rien', () => {
    expect(qualiteDepuisPreuves('الضوء، ثم التيلاكويد؟', { acceptedEvidence: ['التيلاكويد', 'الضوء'], minEvidence: 2 })).toBe(5);
  });

  it('LA DIFFÉRENCE EST L’ÉCHÉANCE — deux réponses, deux calendriers', () => {
    const maintenant = T;
    // Même élève, même concept, deux réponses inégales :
    const faible = prochainEtatSm2(null, qualiteDepuisPreuves('لا أعرف', preuves), maintenant);
    const solide = prochainEtatSm2(
      null,
      qualiteDepuisPreuves('التيلاكويد الضوء ATP NADPH الحشوة', preuves),
      maintenant,
    );
    expect(faible.intervalDays).toBe(1);
    expect(faible.lapses).toBe(1);
    expect(solide.intervalDays).toBe(1);
    // Au tour suivant, l'écart apparaît — et il ne se referme plus :
    const faible2 = prochainEtatSm2(faible, 4, maintenant);
    const solide2 = prochainEtatSm2(solide, 5, maintenant);
    expect(solide2.ease).toBeGreaterThan(faible2.ease);
  });
});

describe('qualiteDepuisAutoEvaluation — le verdict de l’élève est utilisé, pas jeté', () => {
  it('mappe les trois verdicts sur l’échelle SM-2', () => {
    expect(qualiteDepuisAutoEvaluation('vrai')).toBe(4);
    expect(qualiteDepuisAutoEvaluation('faux')).toBe(2);
    expect(qualiteDepuisAutoEvaluation('incertain')).toBe(1);
  });

  it('les trois verdicts produisent trois suites d’échéances distinctes', () => {
    const vrai = prochainEtatSm2(prochainEtatSm2(null, 4, T), 4, T);
    const faux = prochainEtatSm2(prochainEtatSm2(null, 4, T), 2, T);
    const incertain = prochainEtatSm2(prochainEtatSm2(null, 4, T), 1, T);
    expect(faux.ease).toBeGreaterThan(incertain.ease);
    expect(vrai.ease).toBeGreaterThan(faux.ease);
    expect(faux.lapses).toBe(1);
    expect(incertain.lapses).toBe(1);
  });
});
