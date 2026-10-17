// cartesHosila.lock.test.ts — Vague 2, action 9 (audit externe 2026-10-17).
//
// Ces cartes sont l'opposé des fc_q_* : de vraies cartes de rappel actif
// extraites du TEXTE OFFICIEL DU LIVRE (hosila), sans options. Deux dangers à
// verrouiller à vie :
//   1. L'INVENTION : la moindre chaîne qui ne se retrouverait pas verbatim
//      dans hosila = contenu fabriqué, qui annule la crédibilité du verso
//      (« le livre dit... »). Le verrou reconstruct chaque recto depuis le
//      verso (`phrases[x].replace(terme, MASQUE) === recto sans préfixe`).
//   2. LA FUSION : des cartes ajoutées au dépôt sans atteindre les appareils
//      déjà installés (le blob localStorage sain n'était jamais mis à jour).
//      Verrou sur `synchroniseDeck` : nouvelles cartes ET contenu corrigé
//      doivent remonter ; rien ne doit être réécrit si tout est déjà à jour.
import { describe, expect, it } from 'vitest';
import { CARTES_HOSILA, CARTE_MASQUE, PREFIXE_ID_CARTE_HOSILA } from './cartesHosila';
import { HOSILA_IDS, HOSILA_OFFICIELLES } from './hosila';
import { INITIAL_UNITS } from '../unitCatalog';
import { synchroniseDeck } from '../utils/flashcardsSanitize';
import type { Flashcard } from '../types';

const normalise = (s: string): string => s.replace(/\s+/g, ' ').trim();

/** unitId → textes officiels (point/texte/puce) de l'unité hosila liée. */
function textesOfficielsParUnitId(): Map<number, string[]> {
  const map = new Map<number, string[]>();
  for (let i = 0; i < HOSILA_IDS.length; i++) {
    const titreH = normalise(HOSILA_OFFICIELLES[i].uniteAr);
    const cible = INITIAL_UNITS.find((u) => {
      const t = normalise(u.title);
      return t === titreH || t.includes(titreH) || titreH.includes(t);
    });
    if (!cible) continue;
    map.set(cible.id, HOSILA_OFFICIELLES[i]
      .blocs.filter((b) => b.kind === 'point' || b.kind === 'texte' || b.kind === 'puce')
      .map((b) => b.texte.trim()));
  }
  return map;
}

describe('cartes hosila — vraies cartes de rappel, anti-invention', () => {
  it('35 cartes (tranche U1-U3), ids uniques, unités 1-3 seulement', () => {
    expect(CARTES_HOSILA.length).toBe(35);
    expect(new Set(CARTES_HOSILA.map((c) => c.id)).size).toBe(CARTES_HOSILA.length);
    for (const c of CARTES_HOSILA) {
      expect(c.id.startsWith(PREFIXE_ID_CARTE_HOSILA), c.id).toBe(true);
      expect([1, 2, 3], c.id).toContain(c.unitId);
    }
  });

  it('toutes sans champ QCM (options / correctOptionIndex) — même loi B6 que les fc_q_*', () => {
    for (const c of CARTES_HOSILA) {
      expect('options' in c, c.id).toBe(false);
      expect('correctOptionIndex' in c, c.id).toBe(false);
    }
  });

  it('ANTI-INVENTION : chaque recto = phrase officielle avec UN terme masqué', () => {
    const parUnitId = textesOfficielsParUnitId();
    expect(parUnitId.size).toBeGreaterThanOrEqual(3);
    for (const c of CARTES_HOSILA) {
      const phrases = parUnitId.get(c.unitId) ?? [];
      const verso = c.answerBullets[0];
      // 1) la phrase du verso existe TELLE QUELLE dans le texte officiel
      expect(
        phrases.some((p) => p === verso),
        `${c.id} : verso introuvable verbatim dans hosila`,
      ).toBe(true);
      // 2) le recto est cette phrase dont UN fragment est remplacé par le masque
      const sansPrefixe = c.question.slice('أكمل الفراغ : '.length);
      expect(sansPrefixe.includes(CARTE_MASQUE), `${c.id} : recto sans masque`).toBe(true);
      const morceaux = sansPrefixe.split(CARTE_MASQUE);
      expect(morceaux.length).toBe(2);
      const reconstruit = phrases.some((p) => {
        for (let debut = 0; debut + 2 < p.length; debut++) {
          for (let fin = debut + 2; fin <= p.length && fin - debut <= 45; fin++) {
            if (p.slice(0, debut) + CARTE_MASQUE + p.slice(fin) === sansPrefixe) return true;
          }
        }
        return false;
      });
      expect(reconstruit, `${c.id} : recto non reconstructible depuis le verso`).toBe(true);
    }
  });
});

describe('synchroniseDeck — le dépôt fait autorité, aucune progression perdue', () => {
  const ref: Flashcard[] = [
    { id: 'fc_h_d1u1_01', unitId: 1, question: 'q1', answerBullets: ['a1'] },
    { id: 'fc_q_5', unitId: 1, question: 'q5', answerBullets: ['a5'] },
  ];

  it('blob à jour (mêmes ids, même contenu) → null (pas de réécriture)', () => {
    expect(synchroniseDeck(ref.map((c) => ({ ...c })), ref)).toBeNull();
  });

  it('cartes nouvelles au dépôt → deck de référence retourné (migration)', () => {
    const ancien = ref.slice(1); // un appareil d avant les cartes hosila
    const out = synchroniseDeck(ancien, ref);
    expect(out).not.toBeNull();
    expect(out!.length).toBe(2);
    expect(out!.some((c) => c.id === 'fc_h_d1u1_01')).toBe(true);
  });

  it('contenu corrigé sur un id existant → deck de référence retourné', () => {
    const ancien = [{ ...ref[0] }, { ...ref[1], question: 'question perimee avant correctif' }];
    const out = synchroniseDeck(ancien, ref);
    expect(out).not.toBeNull();
    expect(out![1].question).toBe('q5');
  });
});
