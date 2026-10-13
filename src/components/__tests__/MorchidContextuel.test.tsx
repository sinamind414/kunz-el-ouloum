// MorchidContextuel.test.tsx — verrous du maillage contextuel du المرشد.
//
// Le المرشد n'est plus une rubrique : il est joint là où l'élève bloque. Le
// bouton flottant (App.tsx) couvre l'accès brut ; ce test vérifie les points
// d'entrée CONTEXTUELS, ceux qui emportent une question déjà formulée.
//
// Méthode : lecture de source (comme motivationWiring / offlineAssets) plutôt
// que rendu RTL — ces vues exigent des stores et des jeux de données lourds,
// et ce qu'on veut figer ici est un POINT D'ATTACHE, pas un comportement de
// rendu. Le comportement du pont, lui, est testé dans src/lib/__tests__/.

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function source(nom: string): string {
  return readFileSync(resolve(__dirname, `../${nom}`), 'utf8');
}

describe('المرشد — points d entrée contextuels', () => {
  it('leçon active : l élève bloqué dans une leçon appelle le المرشد', () => {
    const src = source('ActiveLessonView.tsx');
    expect(src).toContain("origine=\"lecon-active\"");
    // La question est ancrée sur le TITRE de la leçon (mots-clés du moteur).
    expect(src).toContain('اشرح ${lesson.title}');
  });

  it('leçon active : le COACH répond pour CETTE leçon (faible/fort)', () => {
    // 2026-10-12 — le titre est nommé, donc le moteur répond pour cette unité.
    const src = source('ActiveLessonView.tsx');
    expect(src).toContain('origine="lecon-niveau"');
    expect(src).toContain('ما مستواي في ${lesson.title}');
  });

  it('QCM : un indice AVANT de répondre, et une explicitation APRÈS', () => {
    const src = source('QuizView.tsx');
    expect(src).toContain('origine="quiz-indice"');
    expect(src).toContain('origine="quiz-erreur"');
    // Ancrage sur le titre de l unité : ce qui score le plus fort.
    expect(src).toContain('اشرح ${unitTitle}');
  });

  it('flashcards : avant de se noter « إعادة », on peut demander pourquoi', () => {
    const src = source('RevisionView.tsx');
    expect(src).toContain('origine="flashcard"');
    expect(src).toContain('اشرح ${currentCard?.question');
    // Le bouton est posé AVANT le contrôleur de notes SM-2 : c'est le moment
    // du doute, pas après coup.
    const posBouton = src.indexOf('origine="flashcard"');
    const posNotes = src.indexOf("handleRate('again')");
    expect(posBouton).toBeGreaterThan(0);
    expect(posNotes).toBeGreaterThan(posBouton);
  });

  it('situations : un indice AVANT d ouvrir la correction', () => {
    const src = source('SituationBankView.tsx');
    expect(src).toContain('origine="situation"');
    // Ancrage sur la notion évaluée (mots-clés réels), pas sur l énoncé.
    expect(src).toContain('اشرح ${card.notionAr}');
  });

  it('plan de schémas : deux moments (blocage puis oubli)', () => {
    const src = source('SchemaDrillView.tsx');
    expect(src).toContain('origine="schema-rappel"');
    expect(src).toContain('origine="schema-oublis"');
  });

  it('accueil : une porte visible vers le المرشد (question libre)', () => {
    const src = source('DashboardView.tsx');
    expect(src).toContain("onNavigateToTab?.('chat')");
  });

  it('le bouton flottant existe partout, sauf où il serait redondant', () => {
    const app = source('../App.tsx');
    expect(app).toContain('fab-morchid');
    // Masqué dans la vue elle-même et en mode focus (piloté par RevisionView).
    expect(app).toContain("!isFocusMode && currentTab !== 'chat'");
  });

  it('aucune vue n ouvre le المرشد autrement que par le pont', () => {
    // Une vue ne doit PAS monter AITutorView elle-même : ce serait une seconde
    // instance du tuteur, avec sa propre session — donc des doublons d'état.
    for (const vue of [
      'ActiveLessonView.tsx',
      'QuizView.tsx',
      'RevisionView.tsx',
      'SituationBankView.tsx',
      'SchemaDrillView.tsx',
      'DashboardView.tsx',
    ]) {
      expect(source(vue), `${vue} monte son propre AITutorView`).not.toContain('AITutorView');
    }
  });
});
