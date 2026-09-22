// src/components/__tests__/AITutorView.test.tsx — harnais RTL du parcours guidé (audit T2).
// Exercice réel du scénario promis : domaines → diagnostic → quiz → mission → BAC → erreurs.
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import AITutorView from '../AITutorView';
import { getQuestionById } from '../../data/smartBotData';

// jsdom n'implémente ni scrollIntoView ni scrollTo — polyfill + espion (test B1).
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
  Element.prototype.scrollTo = vi.fn();
});

afterEach(cleanup);

beforeEach(() => {
  window.localStorage.clear();
  (Element.prototype.scrollTo as ReturnType<typeof vi.fn>).mockClear?.();
});

/** Texte complet de la zone messages — insensible au découpage markdown (**bold**). */
function messagesText(): string {
  return screen.getByTestId('tutor-messages').textContent || '';
}

async function typeAndSubmit(user: ReturnType<typeof userEvent.setup>, text: string) {
  const input = screen.getByPlaceholderText('اسأل المرشد الذكي عن أي سؤال في مادة العلوم...');
  await user.type(input, `${text}{Enter}`);
}

/** Texte de la BONNE option de la question courante (session → id → données). */
function correctOptionText(): string {
  const raw = window.localStorage.getItem('smart_tutor_session');
  const qid = raw ? (JSON.parse(raw) as { currentQuiz?: { questionId?: string } }).currentQuiz?.questionId : undefined;
  const q = qid ? getQuestionById(qid) : undefined;
  if (!q) throw new Error(`question courante introuvable (id=${String(qid)})`);
  return q.options[q.correctIndex];
}

/** Clique l'option ACTIVE portant le TEXTE de la bonne réponse — insensible au mélange (rec #1)
 *  et aux anciens quiz désactivés (B2). Retourne le texte de l'option cliquée (assert B4). */
async function answerCorrect(user: ReturnType<typeof userEvent.setup>): Promise<string> {
  const correct = correctOptionText();
  const target = screen
    .getAllByTestId(/^quiz-option-\d+$/)
    .find((b) => !(b as HTMLButtonElement).disabled && (b.textContent || '').includes(correct));
  expect(target, `option correcte active introuvable: ${correct}`).toBeTruthy();
  await user.click(target!);
  return correct;
}

/** Énoncé de la question courante (session → id → données). */
function currentQuestion(): { id: string; question: string } {
  const raw = window.localStorage.getItem('smart_tutor_session');
  const qid = raw ? (JSON.parse(raw) as { currentQuiz?: { questionId?: string } }).currentQuiz?.questionId : undefined;
  const q = qid ? getQuestionById(qid) : undefined;
  if (!q) throw new Error(`question courante introuvable (id=${String(qid)})`);
  return q;
}

describe('AITutorView — rendu riche du moteur (T2)', () => {
  it('affiche les quickActions du welcome (3 domaines) et route le clic vers le domaine', async () => {
    const user = userEvent.setup();
    render(<AITutorView />);

    // Welcome : 3 chips = les 3 domaines
    const chips = screen.getAllByTestId(/^quick-action-\d+$/);
    expect(chips.length).toBe(3);

    // Clic sur le domaine 1 → le moteur passe en mode domaine (menu des cartes)
    await user.click(chips[0]);
    await waitFor(() => {
      expect(messagesText()).toMatch(/اخترت مجال|البروتينات والمناعة/);
    });
    // Les quickActions du domaine incluent le diagnostic et le BAC
    expect(messagesText()).toMatch(/اختبار تشخيصي/);
  });

  it('les 3 domaines routent tous vers leur menu (routeur exact AVANT les bases sémantiques)', async () => {
    const user = userEvent.setup();
    render(<AITutorView />);

    // Chaque titre de domaine saisi doit OUVRIR LE DOMAINE (اخترت مجال),
    // pas répondre via un guide sémantique (bug domaines 2/3 corrigé).
    // Retour au menu entre chaque domaine : le routeur ne s'applique qu' hors domaine actif.
    const domainTitles = ['البروتينات والمناعة', 'التحولات الطاقوية', 'التكتونية العامة'];
    for (const title of domainTitles) {
      const input = screen.getByPlaceholderText('اسأل المرشد الذكي عن أي سؤال في مادة العلوم...');
      await user.type(input, `${title}{Enter}`);
      await waitFor(() => {
        // NB : le markdown ** est consommé par renderBoldText → textContent sans astérisques.
        expect(messagesText()).toContain(`اخترت مجال: ${title}`);
      });
      await user.click(screen.getByTestId('journey-home'));
      await waitFor(() => {
        expect(messagesText()).toContain('رجعنا إلى القائمة الرئيسية');
      });
    }
  });

  it('propage les XP gagnés au parent via onXPGained (score final du quiz)', async () => {
    const xpSpy = vi.fn();
    const user = userEvent.setup();
    render(<AITutorView onXPGained={xpSpy} />);

    // Domaine 1 → diagnostic → 1 réponse → le moteur émet reward (10 XP par bonne réponse)
    await user.click(screen.getAllByTestId(/^quick-action-\d+$/)[0]);
    await waitFor(() => expect(messagesText()).toMatch(/اخترت مجال|البروتينات والمناعة/));
    await user.click(screen.getByTestId('journey-diagnostic'));
    await waitFor(() => expect(messagesText()).toContain('بدأ التشخيص'));

    await answerCorrect(user);
    await waitFor(() => {
      expect(messagesText()).toMatch(/إجابة صحيحة|إجابة خاطئة/);
    });
    expect(xpSpy).not.toHaveBeenCalled(); // XP seulement à la clôture du quiz

    // Terminer le quiz → reward émis → propagation au parent
    let guard = 0;
    while (!messagesText().includes('نتيجتك النهائية') && guard < 40) {
      const opts = screen.getAllByTestId(/^quiz-option-\d+$/);
      if (opts.length === 0) break;
      await answerCorrect(user);
      guard += 1;
      await waitFor(
        () => expect(messagesText()).toMatch(/إجابة صحيحة|إجابة خاطئة|نتيجتك النهائية/),
        { timeout: 3000 }
      );
    }
    await waitFor(() => {
      expect(xpSpy).toHaveBeenCalled();
      const [xp, questions] = xpSpy.mock.calls[xpSpy.mock.calls.length - 1];
      expect(xp).toBeGreaterThan(0);
      expect(questions).toBe(1);
    });
  }, 60000);

  it('affiche sources sur une réponse scientifique + confiance sur une réponse méthodo', async () => {
    const user = userEvent.setup();
    render(<AITutorView />);

    // Réponse scientifique → badge source
    await typeAndSubmit(user, 'ما هو الغوص؟');
    await waitFor(() => {
      expect(screen.getAllByTestId('tutor-sources').length).toBeGreaterThan(0);
    });
    expect(messagesText()).toContain('بطاقة معرفة');

    // Réponse méthodo → confiance affichée (80%)
    await typeAndSubmit(user, 'كيف أحلل وثيقة؟');
    await waitFor(() => {
      expect(screen.getByText(/الثقة/)).toBeTruthy();
    });
  });

  // 23 questions × (clic + waitFor) — test long, timeout étendu.
  it('parcours complet : domaine → diagnostic → réponse quiz → score final', { timeout: 60000 }, async () => {
    const user = userEvent.setup();
    render(<AITutorView />);

    // 1. Domaine 1 via quickAction du welcome (23 questions au total)
    await user.click(screen.getAllByTestId(/^quick-action-\d+$/)[0]);
    await waitFor(() => expect(messagesText()).toMatch(/اخترت مجال|البروتينات والمناعة/));

    // 2. Diagnostic via bouton parcours
    await user.click(screen.getByTestId('journey-diagnostic'));
    await waitFor(() => expect(messagesText()).toContain('بدأ التشخيص'));

    // 3. Quiz interactif rendu : 1 bloc actif, 4 boutons A-D
    expect(screen.getAllByTestId(/^tutor-quiz-/).length).toBe(1);
    expect(screen.getAllByTestId(/^quiz-option-\d+$/).length).toBe(4);

    // 4. Répondre jusqu'au score final — toujours au DERNIER bloc quiz rendu.
    //    (rec #1 : les options sont mélangées → on clique le TEXTE de la bonne
    //    réponse via answerCorrect, pas une position fixe.)
    let guard = 0;
    while (!messagesText().includes('نتيجتك النهائية') && guard < 40) {
      const opts = screen.getAllByTestId(/^quiz-option-\d+$/);
      if (opts.length === 0) break;
      await answerCorrect(user);
      guard += 1;
      await waitFor(
        () => expect(messagesText()).toMatch(/إجابة صحيحة|إجابة خاطئة|نتيجتك النهائية/),
        { timeout: 3000 }
      );
    }
    expect(messagesText()).toContain('نتيجتك النهائية');
    expect(messagesText()).toMatch(/التقدير/);
    expect(messagesText()).toContain('23/23');
    // Récompense XP affichée inline (23 réponses correctes × 10 XP)
    expect(screen.getAllByTestId('tutor-reward').length).toBeGreaterThan(0);
  });

  it('mission du jour via bouton parcours → carte du jour', async () => {
    const user = userEvent.setup();
    render(<AITutorView />);

    await user.click(screen.getByTestId('journey-daily-mission'));
    await waitFor(() => {
      expect(messagesText()).toContain('مهمة اليوم');
    });
    expect(messagesText()).toMatch(/\+15 XP/);
  });

  it('تحدي BAC : sans domaine → orientation ; avec domaine → boss fight jouable', async () => {
    const user = userEvent.setup();
    render(<AITutorView />);

    // Sans domaine : message d'orientation, pas de crash
    await user.click(screen.getByTestId('journey-boss-fight'));
    await waitFor(() => {
      expect(messagesText()).toMatch(/اختر مجالاً أولاً لبدء تحدي BAC/);
    });

    // Avec domaine 1 : le boss fight démarre
    await user.click(screen.getAllByTestId(/^quick-action-\d+$/)[0]);
    await waitFor(() => expect(messagesText()).toMatch(/اخترت مجال|البروتينات والمناعة/));
    await user.click(screen.getByTestId('journey-boss-fight'));
    await waitFor(() => {
      expect(messagesText()).toContain('تحدي BAC');
      expect(messagesText()).toContain('وضعية مشكلة');
    });

    // « لا أعرف » (quickAction du boss) → correction + 0 نقطة + question suivante
    // (rec #3 : l'auto-évaluation +10/+5/0 est remplacée par la notation moteur).
    await user.click(screen.getByText('لا أعرف'));
    await waitFor(() => {
      expect(messagesText()).toContain('التصحيح النموذجي');
      expect(messagesText()).toMatch(/نقاطك لهذه الوضعية/);
      expect(messagesText()).toMatch(/السؤال التالي|انتهى تحدي BAC/);
    });

    // 2e scénario : une réponse libre est notée automatiquement puis le défi se clôt.
    await typeAndSubmit(user, 'إجابة قصيرة غير كافية');
    await waitFor(() => {
      expect(messagesText()).toContain('انتهى تحدي BAC');
    });
  });

  it('revue d erreurs : sans erreurs → message propre, pas de crash', async () => {
    const user = userEvent.setup();
    render(<AITutorView />);

    await user.click(screen.getByTestId('journey-review-mistakes'));
    await waitFor(() => {
      expect(messagesText()).toContain('لا توجد أخطاء مسجلة');
    });
  });

  it('retour menu principal : session reset + domaines re-proposés', async () => {
    const user = userEvent.setup();
    render(<AITutorView />);

    await user.click(screen.getAllByTestId(/^quick-action-\d+$/)[0]);
    await waitFor(() => expect(messagesText()).toMatch(/اخترت مجال|البروتينات والمناعة/));
    await user.click(screen.getByTestId('journey-home'));
    await waitFor(() => {
      expect(messagesText()).toContain('رجعنا إلى القائمة الرئيسية');
    });
    // Les 3 domaines redeviennent cliquables dans les quickActions du dernier message
    const chips = screen.getAllByTestId(/^quick-action-\d+$/);
    expect(chips.length).toBeGreaterThanOrEqual(3);
    expect(messagesText()).toContain('التحولات الطاقوية');
  });

  it('hors-sujet détecté (كرة القدم) → badge rouge خارج المقرر + redirection', async () => {
    const user = userEvent.setup();
    render(<AITutorView />);

    await typeAndSubmit(user, 'كرة القدم');
    await waitFor(() => {
      expect(screen.getByText(/خارج المقرر/)).toBeTruthy();
      expect(messagesText()).toContain('خارج قاعدة علوم الطبيعة والحياة');
    });
  });

  it('question inconnue (ميسي) → refus honnête, aucune source bidon', async () => {
    const user = userEvent.setup();
    render(<AITutorView />);

    await typeAndSubmit(user, 'من هو ميسي؟');
    await waitFor(() => {
      expect(messagesText()).toContain('لم أجد إجابة دقيقة');
    });
  });
});

describe('AITutorView — paquet « expérience quiz saine » (B0/B2/B3/B4/B5, audit 2026-09-22)', () => {
  async function startDiagnostic(user: ReturnType<typeof userEvent.setup>) {
    render(<AITutorView />);
    await user.click(screen.getAllByTestId(/^quick-action-\d+$/)[0]);
    await waitFor(() => expect(messagesText()).toMatch(/اخترت مجال/));
    await user.click(screen.getByTestId('journey-diagnostic'));
    await waitFor(() => expect(messagesText()).toContain('بدأ التشخيص'));
  }

  it('B0 : l énoncé de la question est rendu au-dessus des options', async () => {
    const user = userEvent.setup();
    await startDiagnostic(user);
    expect(messagesText()).toContain(currentQuestion().question);
  });

  it('B2 : après réponse, les options de l ancien quiz sont désactivées (4 seules)', async () => {
    const user = userEvent.setup();
    await startDiagnostic(user);
    await answerCorrect(user);
    await waitFor(() => expect(messagesText()).toMatch(/إجابة صحيحة|إجابة خاطئة/));
    const disabled = screen
      .getAllByTestId(/^quiz-option-\d+$/)
      .filter((b) => (b as HTMLButtonElement).disabled);
    expect(disabled.length).toBe(4);
  });

  it('B4 : la bulle élève affiche « إجابتي : X — <texte de l option> »', async () => {
    const user = userEvent.setup();
    await startDiagnostic(user);
    const clicked = await answerCorrect(user);
    const bubble = await screen.findByText(/إجابتي : [A-D] — /);
    expect(bubble.textContent).toContain(clicked);
  });

  it('B3 : session fantôme (quiz persisté sans messages) neutralisée au montage', async () => {
    window.localStorage.setItem('smart_tutor_session', JSON.stringify({
      activeDomainId: 1,
      activeUnitId: null,
      activeTopicId: null,
      mode: 'diagnostic',
      currentQuiz: { questionId: 'q_ghost', questionIndex: 0, totalQuestions: 23, correctAnswers: 0 },
      boss: null,
      mistakes: [],
      completedBac: [],
      lastMissionDate: null,
      lastMissionTopic: null,
      lastCardId: null,
      lastInteraction: Date.now(),
    }));
    render(<AITutorView />);
    await waitFor(() => expect(messagesText()).toContain('ألغيته'));
    const raw = JSON.parse(window.localStorage.getItem('smart_tutor_session') || '{}') as {
      currentQuiz?: unknown; boss?: unknown; mode?: string;
    };
    expect(raw.currentQuiz ?? null).toBeNull();
    expect(raw.boss ?? null).toBeNull();
    expect(raw.mode).toBe('idle');
    // End-to-end : un input libre n'est PLUS noté comme réponse de quiz → réponse normale.
    const user = userEvent.setup();
    await typeAndSubmit(user, 'ما هو الغوص؟');
    await waitFor(() => expect(messagesText()).toContain('بطاقة معرفة'));
  });

  it('B5 : le payload quiz vers l UI ne contient ni correctIndex ni explanation', async () => {
    const { processStudentInput } = await import('../../smartTutorEngine');
    const { getDefaultSession } = await import('../../utils/sessionManager');
    const p1 = processStudentInput(getDefaultSession(), 'البروتينات والمناعة');
    const p2 = processStudentInput(p1.session, 'اختبار تشخيصي');
    expect(p2.action.quiz).toBeTruthy();
    expect(p2.action.quiz!.options.length).toBe(4);
    expect('correctIndex' in p2.action.quiz!).toBe(false);
    expect('explanation' in p2.action.quiz!).toBe(false);
  });
});

describe('AITutorView — finition B1/B6/B8/B9/B10 (audit 2026-09-22, phase par phase)', () => {
  it('B1 : le scroll positionne le HAUT du dernier message (la question reste visible)', async () => {
    const user = userEvent.setup();
    render(<AITutorView />);
    await user.click(screen.getAllByTestId(/^quick-action-\d+$/)[0]);
    await waitFor(() => expect(messagesText()).toMatch(/اخترت مجال/));
    const calls = (Element.prototype.scrollTo as ReturnType<typeof vi.fn>).mock.calls as Array<[{ top?: number }]>;
    expect(calls.length).toBeGreaterThan(0);
    expect(calls.some((c) => typeof c[0]?.top === 'number' && c[0]!.top! >= 0)).toBe(true);
  });

  it('B6 : renderMarkdownBlocks regroupe les puces consécutives dans de vrais <ul>', async () => {
    const { renderMarkdownBlocks } = await import('../AITutorView');
    const { container } = render(
      <div>{renderMarkdownBlocks('سطر تمهيدي\n- نقطة 1\n- نقطة 2\nخاتمة\n- نقطة 3')}</div>,
    );
    const uls = container.querySelectorAll('ul');
    expect(uls.length).toBe(2);
    expect(uls[0].querySelectorAll('li').length).toBe(2);
    expect(uls[1].querySelectorAll('li').length).toBe(1);
    expect(container.querySelectorAll('li').length).toBe(3); // zéro <li> orphelin
    expect(container.textContent).toContain('سطر تمهيدي');
    expect(container.textContent).toContain('خاتمة');
  });

  it('B8 : « مسح المحادثة » restaure l accueil standard (factory unique)', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(<AITutorView />);
    await typeAndSubmit(user, 'ما هو الغوص؟');
    await waitFor(() => expect(messagesText()).toContain('بطاقة معرفة'));
    await user.click(screen.getByTitle('مسح المحادثة'));
    await waitFor(() => {
      expect(messagesText()).toContain('اختر مجالاً أو أحد أزرار الرحلة أدناه للبدء');
    });
    expect(messagesText()).not.toContain('مرحباً بك مجدداً');
    confirmSpy.mockRestore();
  });

  it('B9+B10 : étiquette honnête (moteur local), alt parlants, champ et options labellisés', () => {
    render(<AITutorView />);
    expect(screen.getByText(/مرشد تفاعلي محلي موجه لمنهج البكالوريا/)).toBeTruthy();
    expect(screen.queryByText(/مساعد ذكاء اصطناعي/)).toBeNull();
    expect(screen.getAllByAltText('شعار المرشد الذكي').length).toBeGreaterThanOrEqual(1); // avatar du message IA (le 2e n'apparaît qu'au chargement)
    expect(screen.getByLabelText('حقل السؤال إلى المرشد الذكي')).toBeTruthy();
    const welcome = screen.getByTestId('tutor-messages');
    expect(welcome).toBeTruthy();
  });
});
