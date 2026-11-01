// WritingReportSheet.test.tsx — feuille « تقرير للأستاذ » (sprint 39).
//
// Ce document sort de l'app pour être lu par un tiers : il doit être exact
// (chiffres recalculés, pas stockés), honnête (aucune note), et complet
// (chaque réponse écrite y figure).

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WritingReportSheet from '../WritingReportSheet';
import { TRAINER_PREFIX } from '../../data/writingProgress';
import { writingReport } from '../../data/writingReview';

afterEach(cleanup);
beforeEach(() => localStorage.clear());

const ecrire = (ideaId: string, familyId: string, texte: string) =>
  localStorage.setItem(`${TRAINER_PREFIX}${ideaId}.${familyId}`, texte);

const ANALYSE = 'نلاحظ ارتفاع النشاط من 10% إلى 80% أي كلما زاد التركيز كلما زاد النشاط.';

describe('feuille de rapport', () => {
  it('reprend les chiffres calculés, sans les inventer', () => {
    ecrire('bac2023_s2_e3', 'verb_analyser', ANALYSE);
    ecrire('bac2018_s1_e2', 'verb_expliquer', 'يعود ذلك جزيئياً إلى كسر الجسور ثنائية الكبريت.');
    render(<WritingReportSheet onClose={() => {}} />);
    const r = writingReport();
    const texte = screen.getByTestId('rapport-chiffres').textContent ?? '';
    expect(texte).toContain(String(r.reponses));
    expect(texte).toContain(String(r.exercices));
    expect(texte).toContain(String(r.motsEcrits));
  });

  it('liste chaque réponse avec sa session et sa consigne', () => {
    ecrire('bac2023_s2_e3', 'verb_analyser', ANALYSE);
    render(<WritingReportSheet onClose={() => {}} />);
    const ligne = screen.getByTestId('rapport-ligne-bac2023_s2_e3-verb_analyser');
    expect(ligne.textContent).toContain('2023');
    expect(ligne.textContent).toContain('الشكل');
  });

  it('nomme les unités travaillées', () => {
    ecrire('bac2018_s1_e3', 'verb_analyser', ANALYSE);
    render(<WritingReportSheet onClose={() => {}} />);
    expect(screen.getByTestId('rapport-unites').textContent).toContain('الطاقة');
  });

  it('affiche ce qui manque le plus souvent', () => {
    ecrire('bac2024_s1_e3', 'verb_analyser', 'نلاحظ ارتفاعاً.');
    render(<WritingReportSheet onClose={() => {}} />);
    expect(screen.getByTestId('rapport-manques').textContent).toContain('من 1');
  });

  it('prévient qu’il ne porte aucune note', () => {
    ecrire('bac2023_s2_e3', 'verb_analyser', ANALYSE);
    render(<WritingReportSheet onClose={() => {}} />);
    expect(screen.getByTestId('writing-report').textContent).toContain('لا يحمل أي علامة');
  });

  it('déclenche l’impression et se referme', async () => {
    const user = userEvent.setup();
    const imprimer = vi.fn();
    const fermer = vi.fn();
    vi.stubGlobal('print', imprimer);
    ecrire('bac2023_s2_e3', 'verb_analyser', ANALYSE);
    render(<WritingReportSheet onClose={fermer} />);
    await user.click(screen.getByTestId('rapport-imprimer'));
    expect(imprimer).toHaveBeenCalled();
    await user.click(screen.getByTestId('rapport-fermer'));
    expect(fermer).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
