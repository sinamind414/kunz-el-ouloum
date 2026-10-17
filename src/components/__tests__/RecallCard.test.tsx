// RecallCard.test.tsx — sprint 65.
//
// La carte de rappel espacé a une règle de discrétion aussi importante que son
// contenu : elle ne doit pas occuper l'accueil d'un élève qui n'a encore rien
// écrit. Ces tests verrouillent cette règle, l'ouverture de l'atelier, et le
// fait qu'un rappel dise toujours pourquoi il remonte.

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RecallCard from '../RecallCard';
import { aujourdHui, clearLearningLog, recordWriting } from '../../data/learningLog';
import { clearDrillLog, recordDrill } from '../../data/drillLog';
import { SCHEMA_DRILLS } from '../../data/schemaDrills';

afterEach(cleanup);
beforeEach(() => {
  localStorage.clear();
  clearLearningLog();
  clearDrillLog();
});

/** Date ISO d'il y a `n` jours — les paliers sont relatifs à aujourd'hui. */
function ilYa(n: number): string {
  return new Date(Date.parse(`${aujourdHui()}T00:00:00Z`) - n * 86_400_000)
    .toISOString()
    .slice(0, 10);
}

describe('carte de rappel — discrétion', () => {
  it('reste invisible tant que l’élève n’a rien écrit', () => {
    render(<RecallCard onOpenRedaction={() => {}} />);
    expect(screen.queryByTestId('recall-card')).toBeNull();
  });

  it('s’affiche avec une explication quand rien n’est dû mais qu’il a écrit', () => {
    recordWriting({ date: ilYa(2), ideaId: 'bac2023_s2_e3', familyId: 'verb_analyser', satisfaits: 1, total: 4, mots: 50 });
    render(<RecallCard onOpenRedaction={() => {}} />);
    expect(screen.getByTestId('recall-card')).toBeTruthy();
    expect(screen.getByTestId('recall-vide').textContent).toContain('لا شيء');
  });
});

describe('carte de rappel — contenu', () => {
  it('propose la rédaction d’hier et dit pourquoi', () => {
    recordWriting({ date: ilYa(1), ideaId: 'bac2023_s2_e3', familyId: 'verb_analyser', satisfaits: 1, total: 4, mots: 50 });
    render(<RecallCard onOpenRedaction={() => {}} />);
    const item = screen.getByTestId('recall-bac2023_s2_e3');
    expect(item.textContent).toContain('دون النظر');
  });

  it('ouvre l’atelier sur l’exercice choisi', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    recordWriting({ date: ilYa(3), ideaId: 'bac2023_s2_e3', familyId: 'verb_analyser', satisfaits: 1, total: 4, mots: 50 });
    render(<RecallCard onOpenRedaction={onOpen} />);
    await user.click(screen.getByTestId('recall-bac2023_s2_e3'));
    expect(onOpen).toHaveBeenCalledWith('bac2023_s2_e3');
  });

  it('ne propose pas plus de trois rappels, même avec dix rédactions dues', () => {
    for (let i = 0; i < 10; i += 1) {
      recordWriting({ date: ilYa(1), ideaId: `idee${i}`, familyId: 'verb_analyser', satisfaits: 0, total: 4, mots: 30 });
    }
    render(<RecallCard onOpenRedaction={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });
});

describe('carte de rappel — schémas (sprint 67)', () => {
  it('propose un schéma fragile et ouvre l’atelier de dessin', async () => {
    const user = userEvent.setup();
    const onDrill = vi.fn();
    const id = SCHEMA_DRILLS[0].id;
    recordDrill({ date: ilYa(3), drillId: id, unitId: SCHEMA_DRILLS[0].unitId, score: 2, total: 16, oublisEssentiels: 2 });
    render(<RecallCard onOpenRedaction={() => {}} onOpenDrill={onDrill} />);
    await user.click(screen.getByTestId(`recall-schema-${id}`));
    expect(onDrill).toHaveBeenCalledWith(id);
  });

  it('n’affiche aucun schéma quand la vue ne sait pas les ouvrir', () => {
    const id = SCHEMA_DRILLS[0].id;
    recordDrill({ date: ilYa(3), drillId: id, unitId: SCHEMA_DRILLS[0].unitId, score: 2, total: 16, oublisEssentiels: 2 });
    render(<RecallCard onOpenRedaction={() => {}} />);
    expect(screen.queryByTestId('recall-schemas')).toBeNull();
  });

  it('reste visible pour un élève qui ne fait que dessiner', () => {
    const id = SCHEMA_DRILLS[0].id;
    recordDrill({ date: ilYa(2), drillId: id, unitId: SCHEMA_DRILLS[0].unitId, score: 2, total: 16, oublisEssentiels: 2 });
    render(<RecallCard onOpenRedaction={() => {}} onOpenDrill={() => {}} />);
    expect(screen.getByTestId('recall-card')).toBeTruthy();
    expect(screen.getByTestId('recall-vide')).toBeTruthy();
  });
});
