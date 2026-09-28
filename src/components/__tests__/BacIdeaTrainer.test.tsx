// BacIdeaTrainer.test.tsx — verrous de l'atelier d'écriture (sprint 24).
//
// L'atelier réunit quatre briques sur une page. Les tests vérifient qu'elles
// sont bien branchées ENSEMBLE : les consignes proposées viennent de l'exercice
// réel, le retour de forme réagit au texte saisi, le brouillon survit à la
// fermeture, et la notion évaluée reste cachée tant qu'on ne la demande pas.

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import BacIdeaTrainer, { famillesDemandees } from '../BacIdeaTrainer';
import { IDEA_BY_ID, sourcesForYear } from '../../data/bacSessionIndex';
import { VERB_FAMILY_BY_ID } from '../../data/verbDemands';

afterEach(cleanup);
beforeEach(() => localStorage.clear());

// 2023 S2 E3 — DCMU : consignes « اقترح فرضيتين », « ناقش », « قدّم نصيحة »,
// « وضّح في رسم تخطيطي وظيفي ».
const IDEE = IDEA_BY_ID.bac2023_s2_e3;

describe('atelier — ce qui est proposé vient de l’exercice réel', () => {
  it('n’offre que les familles de consignes réellement demandées', () => {
    render(<BacIdeaTrainer idea={IDEE} onClose={() => {}} />);
    const attendues = famillesDemandees(IDEE);
    expect(attendues.length).toBeGreaterThan(1);
    for (const id of attendues) expect(screen.getByTestId(`trainer-famille-${id}`)).toBeTruthy();
    expect(screen.queryByTestId('trainer-famille-verb_comparer')).toBeNull();
  });

  it('affiche les supports de l’exercice et la méthode du montage', () => {
    render(<BacIdeaTrainer idea={IDEE} onClose={() => {}} />);
    expect(screen.getByTestId('bac-trainer').textContent).toContain(IDEE.supportsAr[0]);
    expect(screen.getByTestId('trainer-montage')).toBeTruthy();
  });

  it('montre le canevas de rédaction de la consigne sélectionnée', () => {
    render(<BacIdeaTrainer idea={IDEE} onClose={() => {}} />);
    const premiere = famillesDemandees(IDEE)[0];
    expect(screen.getByTestId('trainer-canevas').textContent).toContain(
      VERB_FAMILY_BY_ID[premiere].templateAr,
    );
  });
});

describe('atelier — le retour de forme réagit à ce qui est écrit', () => {
  it('ne juge rien tant que rien n’est écrit', () => {
    render(<BacIdeaTrainer idea={IDEE} onClose={() => {}} />);
    expect(screen.queryByTestId('trainer-verdict')).toBeNull();
  });

  it('reprend une hypothèse affirmative et valide une hypothèse modalisée', async () => {
    const user = userEvent.setup();
    render(<BacIdeaTrainer idea={IDEE} onClose={() => {}} />);
    await user.click(screen.getByTestId('trainer-famille-verb_hypothese'));
    const zone = screen.getByTestId('trainer-reponse');
    await user.type(zone, 'المبيد يوقف التركيب الضوئي');
    expect(screen.getByTestId('trainer-check-modalite').textContent).toContain('✗');
    await user.clear(zone);
    await user.type(
      zone,
      'قد يعود توقف طرح الأكسجين إلى ارتباط المبيد بناقل الإلكترونات مما يؤدي إلى قطع السلسلة',
    );
    expect(screen.getByTestId('trainer-check-modalite').textContent).toContain('✓');
  });
});

describe('atelier — mémoire et divulgation', () => {
  it('conserve le brouillon par exercice et par consigne', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<BacIdeaTrainer idea={IDEE} onClose={() => {}} />);
    await user.type(screen.getByTestId('trainer-reponse'), 'مسودة أولى');
    unmount();
    render(<BacIdeaTrainer idea={IDEE} onClose={() => {}} />);
    expect((screen.getByTestId('trainer-reponse') as HTMLTextAreaElement).value).toBe('مسودة أولى');
  });

  it('change de brouillon quand on change de consigne', async () => {
    const user = userEvent.setup();
    render(<BacIdeaTrainer idea={IDEE} onClose={() => {}} />);
    await user.type(screen.getByTestId('trainer-reponse'), 'جواب الفرضية');
    const autre = famillesDemandees(IDEE)[1];
    await user.click(screen.getByTestId(`trainer-famille-${autre}`));
    expect((screen.getByTestId('trainer-reponse') as HTMLTextAreaElement).value).toBe('');
  });

  it('garde la notion évaluée cachée jusqu’à la demande', async () => {
    const user = userEvent.setup();
    render(<BacIdeaTrainer idea={IDEE} onClose={() => {}} />);
    expect(screen.queryByTestId('trainer-notion-texte')).toBeNull();
    await user.click(screen.getByTestId('trainer-notion'));
    expect(screen.getByTestId('trainer-notion-texte').textContent).toBe(IDEE.notionAr);
  });
});


describe('atelier — sources officielles (sprint 42)', () => {
  it('donne le sujet et le corrigé de la session, avec le bon conseil d’usage', () => {
    render(<BacIdeaTrainer idea={IDEE} onClose={() => {}} />);
    const bloc = screen.getByTestId('trainer-sources');
    const sources = sourcesForYear(IDEE.year)!;
    const liens = Array.from(bloc.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(liens).toContain(sources.url);
    expect(liens).toContain(sources.correctionUrl);
    expect(bloc.textContent).toContain('بعد أن تكتب');
  });

  it('ouvre les sources dans un nouvel onglet, sans perdre le brouillon', () => {
    render(<BacIdeaTrainer idea={IDEE} onClose={() => {}} />);
    for (const a of Array.from(screen.getByTestId('trainer-sources').querySelectorAll('a'))) {
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.getAttribute('rel')).toContain('noreferrer');
    }
  });
});
