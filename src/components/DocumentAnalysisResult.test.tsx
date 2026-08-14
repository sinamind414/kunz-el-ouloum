import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import DocumentAnalysisView from './DocumentAnalysisView';
import { DOCUMENT_ANALYSIS_EXERCISES } from '../data/documentAnalysisExercises';
import { isDocumentAssetAvailable } from '../data/documentAssets';
import { listCorrectionFeedback, MAX_FEEDBACK, recordCorrectionFeedback } from '../services/correctionFeedbackService';

// Constats #64 à #67 — la feuille de résultat de l'analyse documentaire.
// Cet écran n'avait AUCUN test : les quatre défauts ci-dessous y coexistaient.

vi.mock('../utils/telemetryService', () => ({ logEvent: vi.fn() }));

const READY = DOCUMENT_ANALYSIS_EXERCISES.filter((e) => isDocumentAssetAvailable(e.doc.assetKey));
const EX = READY[0];

// Réponse proche de la correction officielle, pour obtenir une feuille de résultat.
const GOOD_ANSWER =
  'كلما زاد تركيز الناقل كلما قصر زمن كمون اللوحة المحركة لأن تحرر الأستيل كولين يفتح قنوات مرتبطة بالربيطة.';

function openResult(exercise = EX, answer = GOOD_ANSWER) {
  render(<DocumentAnalysisView onBack={() => {}} initialExerciseId={exercise.id} />);
  const ta = document.querySelector('textarea');
  if (!ta) throw new Error('textarea absente : le document n’est pas exploitable');
  fireEvent.change(ta, { target: { value: answer } });
  fireEvent.click(screen.getByText('صحّح إجابتي'));
  // Ancrage positif : la feuille de résultat est bien montée avant toute
  // assertion d'absence (piège de test relevé sur MissionBanner).
  expect(screen.getByTestId('doc-form-score')).toBeTruthy();
}

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('#66 — le barème d’entraînement atteint l’élève', () => {
  it('affiche les critères pondérés après la tentative', () => {
    openResult();
    const grille = screen.getByTestId('doc-grille');
    for (const critere of EX.grilleEntrainement) {
      expect(grille.textContent).toContain(critere.critereAr);
      expect(grille.textContent).toContain(String(critere.points));
    }
  });

  it('affiche le total de la grille, égal à 20', () => {
    openResult();
    const total = EX.grilleEntrainement.reduce((s, c) => s + c.points, 0);
    expect(total).toBe(20);
    expect(screen.getByTestId('doc-grille').textContent).toContain(`المجموع ${total}`);
  });

  it('ne montre pas le barème AVANT la tentative — sinon il souffle la réponse', () => {
    render(<DocumentAnalysisView onBack={() => {}} initialExerciseId={EX.id} />);
    // Ancrage positif : l'écran d'exercice est bien monté.
    expect(document.querySelector('textarea')).toBeTruthy();
    expect(screen.queryByTestId('doc-grille')).toBeNull();
  });
});

describe('#65 — la note de forme ne se fait pas passer pour une note d’épreuve', () => {
  it('nomme ce que la note mesure', () => {
    openResult();
    // Le maximum du moteur vaut 20 par défaut, homonyme du barème BAC sur 20.
    expect(screen.getByTestId('doc-form-score').textContent).toContain('منهجية:');
  });
});

describe('#67 — l’avertissement anti-confusion est lisible par son destinataire', () => {
  it('est rédigé en arabe et nie explicitement le caractère officiel', () => {
    openResult();
    const label = screen.getByTestId('doc-training-label').textContent ?? '';
    expect(label).toContain('ليس سلّم التنقيط الرسمي');
    // Aucune lettre latine : le message était auparavant en français.
    expect(/[A-Za-zÀ-ÿ]/.test(label)).toBe(false);
  });
});

describe('#64 — le signalement ne promet plus une équipe qui n’existe pas', () => {
  it('écrit réellement le signalement sur l’appareil', () => {
    openResult();
    expect(listCorrectionFeedback()).toHaveLength(0);
    fireEvent.click(screen.getByTestId('doc-report-button'));
    const saved = listCorrectionFeedback();
    expect(saved).toHaveLength(1);
    expect(saved[0].exerciseId).toBe(EX.id);
    expect(saved[0].answer).toBe(GOOD_ANSWER);
    expect(Number.isNaN(Date.parse(saved[0].reportedAt))).toBe(false);
  });

  it('confirme le stockage local et ne parle plus ni d’équipe ni d’algorithme', () => {
    openResult();
    fireEvent.click(screen.getByTestId('doc-report-button'));
    const notice = screen.getByTestId('doc-report-notice').textContent ?? '';
    expect(notice).toContain('على هذا الجهاز فقط');
    expect(notice).toContain('لا يُرسل إلى أي جهة');
    expect(notice).not.toContain('فريقنا');
    expect(notice).not.toContain('الخوارزمية');
  });

  it('n’affiche aucune confirmation tant que l’élève n’a pas signalé', () => {
    openResult();
    expect(screen.queryByTestId('doc-report-notice')).toBeNull();
  });

  it('avoue l’échec au lieu de confirmer une écriture qui n’a pas eu lieu', () => {
    openResult();
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded');
    });
    fireEvent.click(screen.getByTestId('doc-report-button'));
    expect(screen.getByTestId('doc-report-notice').textContent).toContain('تعذّر حفظ');
    setItem.mockRestore();
  });
});

describe('#64 — service de signalement', () => {
  it('refuse un signalement sans réponse rédigée', () => {
    expect(recordCorrectionFeedback({ exerciseId: 'a', questionId: 'b', answer: '   ', score: 1, maxScore: 20 })).toBe(false);
    expect(listCorrectionFeedback()).toHaveLength(0);
  });

  it('borne la file et garde les signalements les plus récents', () => {
    for (let i = 0; i < MAX_FEEDBACK + 5; i++) {
      recordCorrectionFeedback({ exerciseId: 'e', questionId: `q${i}`, answer: `réponse ${i}`, score: 1, maxScore: 20 });
    }
    const all = listCorrectionFeedback();
    expect(all).toHaveLength(MAX_FEEDBACK);
    expect(all[all.length - 1].questionId).toBe(`q${MAX_FEEDBACK + 4}`);
    expect(all[0].questionId).toBe('q5');
  });

  it('survit à un contenu illisible en stockage', () => {
    localStorage.setItem('kunz_correction_feedback_v1', '{pas du json');
    expect(listCorrectionFeedback()).toEqual([]);
  });
});
