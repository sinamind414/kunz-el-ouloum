// accessibilite.test.ts — M5 (audit 8 axes 2026-10-14) : les trois manques
// restants, verrouillés au niveau des SOURCES quand aucun harnais de montage
// n'existe (même discipline que PortesUniques : un test de source ne prouve
// pas le comportement, mais il interdit la régression silencieuse d'un
// attribut — et le comportement du quiz, lui, est prouvé côté QuizView.test).
//
//   1. LIEN D'ÉVITEMENT : rien ne sautait l'en-tête — un lecteur d'écran (ou
//      un clavier) devait retraverser toute la barre à chaque écran ;
//   2. ARIA-LIVE : les feedbacks du QCM changeaient sans être annoncés.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const APP = readFileSync(resolve(__dirname, '../App.tsx'), 'utf8');
const QUIZ = readFileSync(resolve(__dirname, '../components/QuizView.tsx'), 'utf8');
const CSS = readFileSync(resolve(__dirname, '../index.css'), 'utf8');

describe('M5 — accessibilité minimale sérieuse', () => {
  it('un lien d évitement précède le contenu : #zone-principale', () => {
    expect(APP).toContain('href="#zone-principale"');
    // L'ancre doit pointer la zone RÉELLE : le <main id="zone-principale">.
    expect(APP).toMatch(/<main[^>]*id="zone-principale"/);
  });

  it('le feedback pédagogique du QCM est annoncé (aria-live="polite")', () => {
    expect(QUIZ).toContain('aria-live="polite"');
  });

  it('les 3 crans de taille de texte existent côté CSS (html[data-taille-texte])', () => {
    expect(CSS).toMatch(/html\[data-taille-texte='1'\]/);
    expect(CSS).toMatch(/html\[data-taille-texte='2'\]/);
    expect(CSS).toMatch(/html\[data-taille-texte='3'\]/);
    // Les crans agrandissent réellement : cran 3 > cran 2 > base.
    const cran2 = Number(CSS.match(/data-taille-texte='2'\]\s*\{\s*font-size:\s*([\d.]+)%/)![1]);
    const cran3 = Number(CSS.match(/data-taille-texte='3'\]\s*\{\s*font-size:\s*([\d.]+)%/)![1]);
    expect(cran3).toBeGreaterThan(cran2);
    expect(cran2).toBeGreaterThan(100);
  });
});
