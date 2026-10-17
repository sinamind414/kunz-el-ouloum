// rappelHonnete.test.tsx — audit externe 2026-10-17 (§5 P1.6 / §2 axe 6) :
// « StudyReminderModal promet de programmer une notification » alors qu'aucun
// showNotification n'existe dans tout src/ (App.tsx se contente de stocker un
// horodatage + demander une permission jamais utilisée). Promesse inexacte =
// promesse retirée, pas API fantôme. Le rappel apparaît À LA RÉOUVERTURE de
// l'app — le texte doit le dire TEL QUEL.

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import StudyReminderModal from '../StudyReminderModal';

afterEach(cleanup);

describe('le rappel d étude ne promet pas une notification fantôme', () => {
  it('il ne parle plus de « جدولة إشعار » (aucune notification programmée n existe)', () => {
    render(<StudyReminderModal isOpen onClose={vi.fn()} onSchedule={vi.fn()} />);
    const texte = document.body.textContent ?? '';
    expect(texte.includes('سنقوم بجدولة إشعار')).toBe(false);
    expect(texte.includes('جدولة إشعار')).toBe(false);
  });

  it('il annonce le comportement RÉEL : le rappel revient à la réouverture de l app', () => {
    render(<StudyReminderModal isOpen onClose={vi.fn()} onSchedule={vi.fn()} />);
    const texte = document.body.textContent ?? '';
    expect(texte.includes('عند عودتك إلى التطبيق')).toBe(true);
  });
});
