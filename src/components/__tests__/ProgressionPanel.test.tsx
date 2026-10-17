// ProgressionPanel.test.tsx — « هل أتقدّم فعلاً؟ » (sprint 62).

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clearDrillLog, recordDrill } from '../../data/drillLog';
import { SCHEMA_DRILLS } from '../../data/schemaDrills';
import ProgressionPanel from '../ProgressionPanel';
import { clearLearningLog, recordWriting } from '../../data/learningLog';

afterEach(cleanup);
beforeEach(() => clearLearningLog());

const ecrire = (date: string, satisfaits: number, ideaId = 'bac2023_s2_e3') =>
  recordWriting({ date, ideaId, familyId: 'verb_analyser', satisfaits, total: 4, mots: 55 });

describe('panneau de progression', () => {
  it('refuse de conclure quand l’élève vient de commencer', () => {
    ecrire('2026-04-01', 2);
    render(<ProgressionPanel />);
    expect(screen.getByTestId('progression-verdict').textContent).toContain('تخميناً');
  });

  it('annonce le progrès quand la forme s’améliore', () => {
    for (let i = 1; i <= 4; i += 1) ecrire(`2026-04-0${i}`, 1, `idee${i}`);
    for (let i = 5; i <= 8; i += 1) ecrire(`2026-04-0${i}`, 4, `idee${i}`);
    render(<ProgressionPanel />);
    expect(screen.getByTestId('progression-verdict').textContent).toContain('تقدّم');
  });

  it('ne déguise pas la stagnation en réussite', () => {
    for (let i = 1; i <= 8; i += 1) ecrire(`2026-04-0${i}`, 3, `idee${i}`);
    render(<ProgressionPanel />);
    expect(screen.getByTestId('progression-verdict').textContent).toContain('الاستقرار ليس تقدّماً');
  });

  it('pointe l’unité lourde jamais travaillée', () => {
    for (let i = 1; i <= 8; i += 1) ecrire(`2026-04-0${i}`, 3, 'bac2023_s2_e3'); // U6 seulement
    render(<ProgressionPanel />);
    const alerte = screen.getByTestId('progression-angle-mort');
    expect(alerte.textContent).toMatch(/٪/);
  });

  it('confronte le travail écrit au poids réel des unités', () => {
    ecrire('2026-04-01', 3);
    render(<ProgressionPanel />);
    expect(screen.getByTestId('progression-unite-4')).toBeTruthy();
    expect(screen.getByTestId('progression-unite-1')).toBeTruthy();
  });

  it('rappelle que seule la forme est mesurée', () => {
    ecrire('2026-04-01', 3);
    render(<ProgressionPanel />);
    expect(screen.getByTestId('progression-panel').textContent).toContain(
      'المضمون العلمي لا يُقيَّم آلياً',
    );
  });
});

describe('panneau de progression — restitution (sprint 66)', () => {
  beforeEach(() => clearDrillLog());

  it('affiche l’absence de trace de dessin sans la maquiller', () => {
    render(<ProgressionPanel />);
    expect(screen.getByTestId('progression-restitution').textContent).toContain('لم ترسم');
  });

  it('nomme les schémas encore fragiles au lieu d’un score global', () => {
    const id = SCHEMA_DRILLS[0].id;
    for (const [i, d] of ['2026-05-01', '2026-05-02', '2026-05-03'].entries()) {
      recordDrill({
        date: d,
        drillId: i === 0 ? id : `${id}_${i}`,
        unitId: 4,
        score: i === 0 ? 2 : 16,
        total: 16,
        oublisEssentiels: i === 0 ? 2 : 0,
      });
    }
    render(<ProgressionPanel />);
    const bloc = screen.getByTestId('progression-restitution');
    expect(bloc.textContent).toContain('2');
    expect(screen.getByTestId(`progression-schema-${id}`).textContent).toContain(
      SCHEMA_DRILLS[0].titleAr,
    );
  });
});
