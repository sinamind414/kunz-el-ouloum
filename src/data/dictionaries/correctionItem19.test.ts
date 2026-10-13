// correctionItem19.test.ts — verrous du correctif mesuré du 2026-10-12.
//
// PROBLÈME MESURÉ (scripts/evaluer-copies.ts + sonder-ex3.ts sur 40 copies) :
// l'item S1-Ex3 « النورادرينالين / NE » échouait sur 40/40 copies. Aucune copie
// n'écrit « النورادرينالين » ni « norepinephrine » : elles écrivent le sigle
// « NE » (38/40 copies, 161 occurrences). Sans cette forme, le correcteur ne
// pouvait PAS noter au-dessus de 6,36/8 quelle que soit la copie — un plafond
// artificiel qui écrasait les meilleurs élèves (biais −1,19 sur la tranche
// 15–20).
//
// DEUX correctifs, testés ici séparément :
//  1. la forme courte « ne » (avec le bug de casse de formePresente corrigé) ;
//  2. la COMPOSANTE « nmol » — parce que le sigle seul n'est pas la preuve :
//      eleve_03/04/05 mentionnent « NE » une fois dans une conclusion recopiée
//      sans mécanisme ni valeurs, et le prof ne leur accorde pas le point.
//
// CONTRÔLE POSITIF (même discipline que integriteCopie) : la copie qui donne la
// relation chiffrée du corrigé conserve SON point.

import { describe, expect, it } from 'vitest';
import { formePresente } from '../../lib/validation/formePresente';
import { normalizeAr } from '../../lib/validation/normalizeAr';
import { attendusDeGroupe } from '../../data/dictionaries/attendusBac2025';

const norm = (s: string) => normalizeAr(s).toLowerCase();

describe('formePresente — casse de la forme (bug mesuré)', () => {
  it('une forme à MAJUSCULES se trouve dans un texte normalisé', () => {
    // Avant le correctif : RE_LATIN_PUR échouait sur « NE » et le code tombait
    // dans norm.includes(forme) — jamais vrai, car `norm` est en minuscules.
    expect(formePresente(norm('ينخفض تركيز NE من 9 إلى 2nmol/L'), 'NE')).toBe(true);
  });

  it('une forme en minuscules continue de fonctionner', () => {
    expect(formePresente(norm('ينخفض تركيز ne'), 'ne')).toBe(true);
  });

  it('la frontière de mot protège toujours (pas de sous-chaîne)', () => {
    // « ne » ne doit pas être trouvé dans « mineure » ou « nems ».
    expect(formePresente(norm('une reponse mineure'), 'ne')).toBe(false);
    expect(formePresente(norm('nems'), 'ne')).toBe(false);
  });

  it('les chiffres gardent leur frontière alphanumérique', () => {
    expect(formePresente(norm('من 98 الى 100'), '98')).toBe(true);
    expect(formePresente(norm('1982'), '98')).toBe(false);
  });
});

describe('item S1-Ex3 « النورادرينالين / NE »', () => {
  const reg = attendusDeGroupe(1, 3);
  const item = reg.items.find((i) => i.formes.includes('ne'));

  it('existe et porte le sigle court dans ses formes', () => {
    expect(item, 'item « ne » introuvable dans S1-Ex3').toBeTruthy();
    expect(item!.formes).toContain('ne');
  });

  it('exige la relation CHIFFRÉE, pas la simple mention', () => {
    expect(item!.composantes).toBeTruthy();
    expect(item!.composantes!.length).toBe(2);
    // Groupe 1 : le sigle (OU avec les formes longues).
    expect(item!.composantes![0]).toContain('ne');
    // Groupe 2 : l'unité du corrigé (de ~8 à ~2 nmol/L).
    expect(item!.composantes![1]).toContain('nmol');
  });

  it('CONTRÔLE POSITIF : la relation chiffrée conserve son point', () => {
    // Formulation de eleve_35 (10 occurrences + « من 9 الي 2nmol l ») — le prof
    // met 6,5/8 et le moteur 7,00 : l'item doit rester crédité.
    const groupes = item!.composantes!;
    const reponse = norm(
      'كلما ارتفعت نسبة المعقدات A1R-Ado ينخفض تركيز NE من 9 إلى 2 nmol/L',
    );
    const tousSatisfaits = groupes.every((g) => g.some((f) => formePresente(reponse, f)));
    expect(tousSatisfaits).toBe(true);
  });

  it('CONTRÔLE NÉGATIF : la mention seule du sigle ne suffit PAS', () => {
    // eleve_03/04/05 : « يرتبط Ado بمستقبله فيقلل إفراز NE » sans valeurs — le
    // prof ne donne pas le point. Sans cette exigence, le correcteur sur-notait.
    const reponse = norm('ارتباط Ado بمستقبله A1R يقلل من إفراز NE.');
    const groupes = item!.composantes!;
    const tousSatisfaits = groupes.every((g) => g.some((f) => formePresente(reponse, f)));
    expect(tousSatisfaits).toBe(false);
  });
});
