// dictaphoneMethodologie.test.tsx — le micro est PARTOUT où l'élève écrit dans
// la rubrique « المنهجية » (complément utilisateur 2026-10-16 : « le
// microphone n'est pas installé au منهجية, soit pro »).
//
// Le premier lot (fb63ea0) ne couvrait que le rédacteur de l'atelier
// الخطوات الأربع. La rubrique s'ouvre maintenant SUR المفتاح (Phase 1) —
// donc l'élève qui clique « المنهجية » cherchait le micro sur :
//   1. la recherche du المفتاح (MeftahView) — dicter ce qu'on cherche,
//   2. الهدف العام 0 de l'atelier (MethodologyCompilerView),
//   3. ② التفسير du banc de correction (TahlilWall) — on dicte volontiers
//      une cause/آلية à l'oral.
// Les champs à valeurs ultra-courtes (cloze 1 mot, قيمة/وحدة, brouillon
// ≤ 5 mots) n'ont PAS de micro par choix : le clavier y est plus rapide,
// un micro de moins = une interface de plus lisible.

import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Dictaphone from '../Dictaphone';
import MeftahView from '../MeftahView';
import TahlilWall from '../TahlilWall';

// jsdom n'a pas Web Speech : les boutons se rendent (désactivés) mais l'état
// de support n'est pas ce que ces verrous prouvent — testid = la garantie.
class FausseReconnaissance {
  lang = '';
  continuous = false;
  interimResults = false;
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();
  onresult: ((e: unknown) => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  onend: (() => void) | null = null;
}
beforeEach(() => {
  (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition = FausseReconnaissance;
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
});

describe('le micro vit sur TOUTES les surfaces d écriture de « المنهجية »', () => {
  it('1. المفتاح : la recherche est dictable dès la vue niveau (l’accueil n’a AUCUN champ — 4 cartes)', () => {
    render(<MeftahView />);
    // L'accueil ne contient aucun champ (testids : 4 cartes de niveaux) —
    // on entre dans un niveau, la recherche apparaît AVEC son micro.
    fireEvent.click(screen.getByTestId('meftah-level-base'));
    expect(screen.getByTestId('dictaphone-meftah-recherche')).toBeTruthy();
    fireEvent.click(screen.getByTestId('dictaphone-meftah-recherche'));
    expect(screen.getByTestId('dictaphone-meftah-recherche-vivant')).toBeTruthy();
  });

  it('2. ② التفسير du banc de correction est dictable (fermé avec le champ en phase classify)', () => {
    // Le champ ② n'existe qu'en phase « produce » (atteinte après 12 items —
    // couverte par TahlilWall.test) : le verrou de PRÉSENCE est structurel,
    // le comportement de collage est prouvé par dictaphone.test.
    const { readFileSync } = require('node:fs');
    const src = readFileSync('src/components/TahlilWall.tsx', 'utf8');
    expect(src).toContain('zone="tahlil-cause"');
    // Le micro suit l'état du champ : désactivé quand le champ l'est.
    expect(src).toMatch(/zone="tahlil-cause"[\s\S]{0,220}disabled=\{!analysisValid/);
  });

  it('3. l atelier garde ses micros (rédaction + الهدف العام 0) — non-régression', () => {
    const { readFileSync } = require('node:fs');
    const src = readFileSync('src/components/MethodologyCompilerView.tsx', 'utf8');
    expect(src).toContain('zone="methode-redaction"');
    expect(src).toContain('zone="methode-objectif0"');
  });

  it('4. le composant universel reste le seul moteur (pas d implémentation locale)', () => {
    expect(Dictaphone).toBeTruthy();
    const { readFileSync } = require('node:fs');
    for (const f of ['MeftahView.tsx', 'TahlilWall.tsx']) {
      const src = readFileSync(`src/components/${f}`, 'utf8');
      expect(src, f).toContain("from './Dictaphone'");
      expect(src, f).not.toMatch(/SpeechRecognition\s*=|new\s+\(?webkit/);
    }
  });
});
