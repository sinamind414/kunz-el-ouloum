// src/components/DocumentReviewDisplay.test.tsx
// #63 (second volet) + #68 — Les contextes de document dans le circuit éditorial.
//
// Deux défauts distincts, mesurés puis verrouillés ici :
//
//   #68 — L'identité d'un contexte était l'`exerciseId` SEUL, alors que 42
//   contextes ne portent que 24 `exerciseId` distincts : 13 exercices comptent
//   2 à 3 questions. Relire « déterminer le mécanisme du sarin » publiait donc
//   aussi « proposer une hypothèse » et « valider l'hypothèse » — deux contenus
//   que personne n'avait lus. Mesuré avant correctif : 1 publication ⇒ 3 items
//   marqués relus.
//
//   #63 (second volet) — Ces 42 contextes, majorité des items arbitrables,
//   n'avaient AUCUNE surface d'affichage : l'élève ne pouvait pas savoir si le
//   document qu'il travaille avait été relu, ni par qui.
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import DocumentAnalysisView from './DocumentAnalysisView';
import { DOCUMENT_ANALYSIS_EXERCISES } from '../data/documentAnalysisExercises';
import { isDocumentAssetAvailable } from '../data/documentAssets';
import { DOCUMENT_PRACTICE_CONTEXTS } from '../data/documentPracticeContexts';
import {
  getAllEditorialItems,
  setReviewOverride,
  documentContextReviewId,
} from '../services/editorialReviewService';
import { REVIEW_BADGE_APP, REVIEW_BADGE_TRUSTED } from '../services/reviewBadgeService';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

const docItems = () => getAllEditorialItems().filter((i) => i.type === 'document_context');

/** Premier exercice EXPLOITABLE dont la question 1 possede un contexte de
 *  pratique : un document non pret n'affiche pas l'ecran d'exercice, et toute
 *  assertion menee dessus passerait a vide. */
function firstExerciseWithContext() {
  for (const ex of DOCUMENT_ANALYSIS_EXERCISES) {
    if (!isDocumentAssetAvailable(ex.doc.assetKey)) continue;
    const ctx = DOCUMENT_PRACTICE_CONTEXTS.find(
      (c) => c.exerciseId === ex.id && c.questionId === ex.questions[0].id
    );
    if (ctx) return { ex, ctx };
  }
  throw new Error('aucun exercice exploitable avec contexte');
}

/** L'ecran d'exercice se monte via la vue racine, pilotee par `initialExerciseId`. */
function renderExercise(ex: { id: string }) {
  return render(<DocumentAnalysisView onBack={() => {}} initialExerciseId={ex.id} />);
}

const publish = (id: string, by = 'أ. بن يوسف', at = '2020-01-01') =>
  setReviewOverride('document_context', id, {
    reviewed: true, reviewedBy: by, reviewedAt: at, sourceProgram: 'BAC DZ',
  });

describe('#68 — une revue ne désigne qu’un seul contexte', () => {
  it('les 42 contextes portent 42 identifiants distincts', () => {
    const ids = docItems().map((i) => i.id);
    expect(ids).toHaveLength(42);
    expect(new Set(ids).size).toBe(42);
  });

  it('publier une question ne publie pas les questions voisines du même exercice', () => {
    // Ancrage positif : cet exercice a bien 3 questions, sinon le test passerait
    // à vide sur un exercice mono-question.
    const sisters = DOCUMENT_PRACTICE_CONTEXTS.filter((c) => c.exerciseId === 'sarin_gb_double');
    expect(sisters.length).toBe(3);

    publish(documentContextReviewId('sarin_gb_double', 'sarin_gb_double_q1'));

    const reviewed = docItems().filter((i) => i.reviewed);
    expect(reviewed).toHaveLength(1);
    expect(reviewed[0].id).toBe('sarin_gb_double::sarin_gb_double_q1');
  });

  it('le libellé du panneau distingue les questions d’un même exercice', () => {
    const labels = docItems()
      .filter((i) => i.id.startsWith('sarin_gb_double::'))
      .map((i) => i.label);
    expect(labels).toHaveLength(3);
    expect(new Set(labels).size).toBe(3);
  });
});

describe('#63 — la revue d’un document atteint l’élève', () => {
  it('sans revue, le document est annoncé comme non relu', () => {
    const { ex } = firstExerciseWithContext();
    renderExercise(ex);
    const badge = screen.getByTestId('doc-review-badge');
    expect(badge.textContent).toBe(REVIEW_BADGE_APP);
    expect(badge.getAttribute('data-tone')).toBe('app');
  });

  it('une revue locale plausible devient visible dans l’exercice', () => {
    const { ex, ctx } = firstExerciseWithContext();
    publish(documentContextReviewId(ctx.exerciseId, ctx.questionId));
    renderExercise(ex);
    const badge = screen.getByTestId('doc-review-badge');
    expect(badge.textContent).toContain('أ. بن يوسف');
    expect(badge.getAttribute('data-tone')).toBe('local');
  });

  it('une revue locale n’emprunte jamais le vocabulaire de l’autorité', () => {
    const { ex, ctx } = firstExerciseWithContext();
    publish(documentContextReviewId(ctx.exerciseId, ctx.questionId));
    renderExercise(ex);
    const badge = screen.getByTestId('doc-review-badge');
    expect(badge.textContent).not.toContain(REVIEW_BADGE_TRUSTED);
    expect(badge.textContent).toContain('غير موثقة');
  });

  it('un nom blanc ou une date de l’an 3000 ne publient rien', () => {
    const { ex, ctx } = firstExerciseWithContext();
    const id = documentContextReviewId(ctx.exerciseId, ctx.questionId);

    publish(id, '   ');
    const { unmount } = renderExercise(ex);
    expect(screen.getByTestId('doc-review-badge').textContent).toBe(REVIEW_BADGE_APP);
    unmount();

    publish(id, 'أ. بن يوسف', '3000-01-01');
    renderExercise(ex);
    expect(screen.getByTestId('doc-review-badge').textContent).toBe(REVIEW_BADGE_APP);
  });

  it('le badge ne contient aucune lettre latine (interface arabophone, cf. #67)', () => {
    const { ex } = firstExerciseWithContext();
    renderExercise(ex);
    expect(screen.getByTestId('doc-review-badge').textContent ?? '').not.toMatch(/[A-Za-z]/);
  });

  it('un statut source absent ne vaut pas caution : 31 contextes sur 42 en sont dépourvus', () => {
    const sans = DOCUMENT_PRACTICE_CONTEXTS.filter((c) => c.sourceStatus == null);
    expect(sans.length).toBe(31);
    const item = docItems().find((i) => i.id.startsWith(`${sans[0].exerciseId}::`))!;
    expect(item.reviewed).toBe(false);
  });
});
