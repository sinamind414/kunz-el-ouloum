// raccourcisCoach.test.tsx — audit Capitaine 2026-10-17 (§1, P0.1) :
// « Les actions rapides du diagnostic ne font pas ce qu'elles annoncent ».
//
// Le message de diagnostic émet des raccourcis : `اشرح <unité>`,
// `حدّث تشخيصي`, `المهمة اليومية`. Avant correction, TOUS passaient par
// handleSend (texte libre) — 'حدّث تشخيصي' recevait une réponse générique,
// 'المهمة اليومية' était déclarée hors programme. Chaque test ci-dessous
// CLIQUE le vrai bouton (comme un élève) et exige l'action promise.

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import AITutorView from '../AITutorView';

beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
  Element.prototype.scrollTo = vi.fn();
});

afterEach(cleanup);

beforeEach(() => {
  window.localStorage.clear();
});

function messagesText(): string {
  return screen.getByTestId('tutor-messages').textContent || '';
}

/** Lance le diagnostic coach par le bouton du parcours (même entrée que l'élève). */
async function lancerDiagnostic(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByTestId('journey-coach-diagnostic'));
  await waitFor(() => expect(messagesText()).toContain('تشخيص مستواك'));
}

/** Le bouton raccourci dont le libellé EXACT est recherché. */
function boutonRaccourci(libelleExact: string | { startsWith: (s: string) => boolean }): HTMLButtonElement {
  const cibles = screen
    .getAllByTestId(/^quick-action-\d+$/)
    .filter((b) =>
      typeof libelleExact === 'string'
        ? (b.textContent || '').trim() === libelleExact
        : (libelleExact as { startsWith: (s: string) => boolean }).startsWith((b.textContent || '').trim()),
    );
  expect(cibles.length, `raccourci introuvable : ${String(libelleExact)}`).toBeGreaterThanOrEqual(1);
  return cibles[0] as unknown as HTMLButtonElement;
}

describe('les raccourcis du diagnostic exécutent ce qu ils promettent (audit §1)', () => {
  it('« حدّث تشخيصي » relance un diagnostic RÉEL (pas une réponse hors programme)', async () => {
    const user = userEvent.setup();
    render(<AITutorView />);
    await lancerDiagnostic(user);

    const avant = (messagesText().match(/✅|🎓/g) || []).length;
    await user.click(boutonRaccourci('حدّث تشخيصي'));
    await waitFor(() => expect(messagesText()).toContain('حدّث تشخيصي'));
    // Un NOUVEAU message de diagnostic arrive : le compte de messages de
    // diagnostic augmente strictement.
    await waitFor(() => {
      expect((messagesText().match(/🎓/g) || []).length).toBeGreaterThan(0);
      expect(messagesText().length).toBeGreaterThan(avant);
      expect((messagesText().match(/تشخيص مستواك/g) || []).length).toBeGreaterThanOrEqual(2);
    });
  });

  it('« المهمة اليومية » lance la mission (pas « hors du programme SVT »)', async () => {
    const user = userEvent.setup();
    render(<AITutorView />);
    await lancerDiagnostic(user);

    await user.click(boutonRaccourci('المهمة اليومية'));
    await waitFor(() => {
      const t = messagesText();
      // marqueur du moteur de mission (claqué au lancement réel)
      expect(t.includes('مهمة اليوم (3') || t.includes('أنجزت مهمة اليوم')).toBe(true);
 // l'ancien verdict hors-sujet ne doit JAMAIS revenir
      expect(t.includes('خارج قاعدة')).toBe(false);
    });
  });

  it('« اشرح <unité> » ouvre la leçon de l unité concernée (navigation réelle)', async () => {
    const user = userEvent.setup();
    const espion = vi.fn();
    render(<AITutorView onOuvrirLeconDuCoach={espion} />);
    await lancerDiagnostic(user);

    const btn = boutonRaccourci({ startsWith: (s: string) => s.startsWith('اشرح ') });
    await user.click(btn);
    await waitFor(() => expect(espion).toHaveBeenCalledTimes(1));
    const [key, kind, unitId] = espion.mock.calls[0];
    expect(String(key).length).toBeGreaterThan(3);
    expect(['html', 'active']).toContain(kind);
    expect(unitId).toBeGreaterThanOrEqual(1);
    expect(unitId).toBeLessThanOrEqual(11);
  });
});
