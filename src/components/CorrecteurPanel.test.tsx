// CorrecteurPanel.test.tsx — Rendu du panneau « المصحح الآلي » (jsdom).
// Vérifie le branchement UI : chips d'entités, sanction ATP (38 uniquement),
// verdicts du barème officiel présélectionné, état vide.

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import CorrecteurPanel from './CorrecteurPanel';

afterEach(cleanup);

describe('CorrecteurPanel', () => {
  it('affiche les entités trouvées + l unité inférée (réponse immunité → unite 4)', () => {
    render(<CorrecteurPanel text="يحدث الاستنساخ العكسي ثم الإدماج في ADN الخلية" defaultOpen />);
    expect(screen.getAllByText(/مفاهيم موجودة/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/الاستنساخ العكسي/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/دور البروتينات في الدفاع عن الذات/).length).toBeGreaterThan(0);
  });

  it('affiche la sanction conflit ATP (valeur officielle = 38 uniquement)', () => {
    render(<CorrecteurPanel text="الحصيلة الطاقوية هي 30-32 ATP" defaultOpen />);
    expect(screen.getAllByText(/حصيلة التنفس/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/38 ATP لكل غلوكوز/).length).toBeGreaterThan(0);
  });

  it('barème officiel présélectionné : verdicts, total et avertissement', () => {
    render(
      <CorrecteurPanel
        text="مرحلة التثبيت ثم الاستنساخ العكسي ثم الإدماج"
        defaultOpen
        defaultBaremeQuestionId="bac2024_S1/S1-Ex1/Q1"
      />,
    );
    expect(screen.getAllByText(/التنقيط على المقياس الرسمي/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/أداة مساعدة للتصحيح/).length).toBeGreaterThan(0);
    // 4 items crédités (0.25×4 = 1) sur un total de 1.5
    expect(screen.getAllByText(/1 \/ 1\.5 ن/).length).toBeGreaterThan(0);
  });

  it('texte vide → aucun rendu', () => {
    const { container } = render(<CorrecteurPanel text="   " defaultOpen />);
    expect(container.firstChild).toBeNull();
  });
});