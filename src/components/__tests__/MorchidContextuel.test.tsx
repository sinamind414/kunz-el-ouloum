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

  it('QCM : l explication de la question EST le service en ligne (audit coach 18/10/2026, H2)', () => {
    // TC1 : les deux boutons « المرشد » du quiz sont RETIRÉS — mesurés comme
    // invisibles (App rend le quiz en priorité) et le panneau « تحليل الخطأ
    // الشائع » était du remplissage générique (531 questions n'avaient pas
    // d'indice spécifique). La promesse d'origine (« l'explication arrive »)
    // reste tenue PAR LE CONTENU RÉEL : currentQuestion.explanation est
    // affiché en ligne après la réponse, sans quitter le quiz.
    const src = source('QuizView.tsx');
    expect(src).toContain('الشرح والمبرر العلمي');
    expect(src).toContain('{currentQuestion.explanation}');
    // Anti-régression du défaut mesuré :
    expect(src).not.toContain('مساعد التلميحات');
    expect(src).not.toContain('getHintForIncorrectOption');
    expect(src).not.toContain('origine="quiz-indice"');
    expect(src).not.toContain('origine="quiz-erreur"');
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
    // Trois raisons de le masquer, chacune ajoutée pour un motif distinct :
    //   · `!isFocusMode` — mode focus (piloté par RevisionView) et vue du
    //     tuteur lui-même ;
    //   · `!epreuveEnCours` — ajouté le 14/10/2026 : pendant « موضوع تجريبي »,
    //     une épreuve chronométrée, l'élève pouvait interroger l'assistant. Une
    //     épreuve pendant laquelle on peut demander la réponse n'en est plus une ;
    //   · `currentTab !== 'chat'` — on n'ouvre pas le tuteur depuis le tuteur.
    expect(app).toContain("!isFocusMode && !epreuveEnCours && currentTab !== 'chat'");
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
