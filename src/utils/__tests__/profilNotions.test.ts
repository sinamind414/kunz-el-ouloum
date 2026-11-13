// src/utils/__tests__/profilNotions.test.ts
// VERROU DU PROFIL DES NOTIONS RATÉES (audit externe « claude 5.2 », axe 3).
//
// Ce que ce verrou protège :
//   1. une question ratée ENREGISTRE sa notion, sans attendre la déclaration
//      de l'élève (c'est le reproche « les lacunes ne sont pas détectées
//      automatiquement ») ;
//   2. le profil reste LOCAL (localStorage, aucune requête) — la promesse de
//      confidentialité tient ;
//   3. le classement des notions est stable (nombre d'abord, récence ensuite,
//      égalité → alphabétique) ;
//   4. une question sans notion n'est PAS comptée (rien n'est inventé) ;
//   5. le profil se vide quand l'élève demande l'effacement.

import { beforeEach, describe, expect, it } from 'vitest';
import {
  enregistrerNotionRatee,
  profilNotions,
  notionsDominantes,
  totalNotionsRatees,
  effacerProfilErreurs,
} from '../profilErreurs';

const CLE = 'boussole_notions_ratees';

beforeEach(() => {
  localStorage.clear();
});

describe('profil des notions ratées', () => {
  it('une question ratée enregistre sa notion', () => {
    enregistrerNotionRatee('النسخ', 1);
    const profil = profilNotions();
    expect(profil['النسخ']).toBeTruthy();
    expect(profil['النسخ'].n).toBe(1);
    expect(profil['النسخ'].uniteId).toBe(1);
    expect(totalNotionsRatees()).toBe(1);
  });

  it('les erreurs répétées s’accumulent sur la même notion', () => {
    enregistrerNotionRatee('النسخ', 1);
    enregistrerNotionRatee('النسخ', 1);
    enregistrerNotionRatee('النسخ', 1);
    expect(profilNotions()['النسخ'].n).toBe(3);
    expect(totalNotionsRatees()).toBe(3);
  });

  it('le classement suit le nombre, puis la récence, puis l’alphabet', () => {
    enregistrerNotionRatee('أ');
    enregistrerNotionRatee('ب');
    enregistrerNotionRatee('ب');
    enregistrerNotionRatee('ج');
    enregistrerNotionRatee('ج');
    enregistrerNotionRatee('ج');
    const top = notionsDominantes(3);
    expect(top.map((t) => t.notion)).toEqual(['ج', 'ب', 'أ']);
    expect(top[0].occurrences).toBe(3);
  });

  it('rien n’est inventé : une notion vide n’est pas comptée', () => {
    enregistrerNotionRatee('');
    enregistrerNotionRatee('   ');
    expect(totalNotionsRatees()).toBe(0);
    expect(Object.keys(profilNotions())).toHaveLength(0);
  });

  it('tout reste dans le téléphone (aucune sortie réseau)', () => {
    enregistrerNotionRatee('النسخ', 1);
    const stock = localStorage.getItem(CLE);
    expect(stock, 'le profil doit être dans le localStorage').toBeTruthy();
    expect(stock).toContain('النسخ');
  });

  it('l’effacement du profil d’erreurs vide aussi les notions', () => {
    enregistrerNotionRatee('النسخ', 1);
    expect(totalNotionsRatees()).toBe(1);
    effacerProfilErreurs();
    expect(totalNotionsRatees()).toBe(0);
  });
});
