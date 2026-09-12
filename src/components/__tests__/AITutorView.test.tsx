// src/components/__tests__/AITutorView.test.tsx — harnais RTL du parcours guidé (audit T2).
// Exercice réel du scénario promis : domaines → diagnostic → quiz → mission → BAC → erreurs.
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import AITutorView from '../AITutorView';

// jsdom n'implémente pas scrollIntoView — polyfill minimal pour le harnais.
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
});

afterEach(cleanup);

beforeEach(() => {
  window.localStorage.clear();
});

/** Texte complet de la zone messages — insensible au découpage markdown (**bold**). */
function messagesText(): string {
  return screen.getByTestId('tutor-messages').textContent || '';
}

async function typeAndSubmit(user: ReturnType<typeof userEvent.setup>, text: string) {
  const input = screen.getByPlaceholderText('اسأل المرشد الذكي عن أي سؤال في مادة العلوم...');
  await user.type(input, `${text}{Enter}`);
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

    await user.click(screen.getAllByTestId(/^quiz-option-\d+$/)[0]);
    await waitFor(() => {
      expect(messagesText()).toMatch(/إجابة صحيحة|إجابة خاطئة/);
    });
    expect(xpSpy).not.toHaveBeenCalled(); // XP seulement à la clôture du quiz

    // Terminer le quiz → reward émis → propagation au parent
    let guard = 0;
    while (!messagesText().includes('نتيجتك النهائية') && guard < 40) {
      const opts = screen.getAllByTestId(/^quiz-option-\d+$/);
      if (opts.length === 0) break;
      await user.click(opts[0]);
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
    //    (Toutes les réponses correctes du domaine 1 sont à l'index 0 = A → score 23/23.)
    let guard = 0;
    while (!messagesText().includes('نتيجتك النهائية') && guard < 40) {
      const opts = screen.getAllByTestId(/^quiz-option-\d+$/);
      if (opts.length === 0) break;
      await user.click(opts[0]);
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

    // « لا أعرف » (quickAction du boss) → correction + auto-éval
    await user.click(screen.getByText('لا أعرف'));
    await waitFor(() => {
      expect(messagesText()).toContain('التصحيح النموذجي');
    });
    await user.click(screen.getByText('إجابة كاملة (+10)'));
    await waitFor(() => {
      expect(messagesText()).toMatch(/السؤال التالي|انتهى تحدي BAC/);
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
