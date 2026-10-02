// BacView.test.tsx — page « البكالوريا » (photo 3 du design OPUS 5.5).
//
// Convention repo : pas de @testing-library/jest-dom → .toBeTruthy() /
// .toBeNull() / .toHaveLength(). cleanup() explicite. localStorage nettoyé
// entre les tests.
//
// Ce qui est vérifié :
//   - en-tête (eyebrow + titre + paragraphe) ;
//   - أوراقك vide au départ (état vide OPUS) puis 1 ligne par item validé ;
//   - pastille de note : « s/t » si total connu, « n% » sinon, « — » sinon
//     (AUCUNE note fabriquée) ;
//   - clic sur une ligne → leçon (onOpenLesson) ou QCM du جسار (onOpenQcm) ;
//   - جسور الوحدات : exactement 11 tuiles ;
//   - ما يسقط فعلاً : SEULEMENT les unités dont le poids a été mesuré
//     (U1..U7) — U8..U11 jamais affichées.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BacView from '../BacView';
import { PARCOURS_FLAT } from '../../lib/parcours/parcoursPath';
import { markDone } from '../../lib/parcours/parcoursProgress';

const STORAGE_KEY = 'kunz_parcours_v1';

const PREMIERE_LECON = PARCOURS_FLAT.find((i) => i.kind === 'lesson')!;
const PREMIER_JALON = PARCOURS_FLAT.find((i) => i.kind === 'jalon')!;

function rendre(onOpenLesson = vi.fn(), onOpenQcm = vi.fn()) {
  return { onOpenLesson, onOpenQcm, ...render(<BacView onOpenLesson={onOpenLesson} onOpenQcm={onOpenQcm} />) };
}

describe('BacView — en-tête', () => {
  it('affiche l eyebrow, le titre et le paragraphe', () => {
    rendre();
    expect(screen.getByTestId('bac-header')).toBeTruthy();
    expect(screen.getByText('البكالوريا')).toBeTruthy();
    expect(
      screen.getByRole('heading', { name: 'يُفتح ما أنجزته، لا أكثر.' }),
    ).toBeTruthy();
    expect(screen.getByText(/لا بنك مواضيع مفتوح على مصراعيه/)).toBeTruthy();
  });
});

describe('BacView — أوراقك', () => {
  it('état vide tant qu aucun item n est validé', () => {
    rendre();
    expect(screen.getByTestId('bac-papers')).toBeTruthy();
    expect(screen.getByText(/أوّل ورقة تظهر هنا/)).toBeTruthy();
    expect(screen.getByTestId('bac-papers').querySelectorAll('button')).toHaveLength(0);
  });

  it('une ligne par item validé, et le clic ouvre la leçon ou le QCM du جسار', () => {
    markDone(PREMIERE_LECON.id, 0.9, 10);
    markDone(PREMIER_JALON.id, 0.5, 6);
    const { onOpenLesson, onOpenQcm } = rendre();

    const lignes = screen.getByTestId('bac-papers').querySelectorAll('button');
    expect(lignes).toHaveLength(2);
    // Ligne 1 = leçon (deep-link LessonsView), ligne 2 = جسار (QCM de l'unité).
    fireEvent.click(lignes[0]);
    expect(onOpenLesson).toHaveBeenCalledTimes(1);
    expect(onOpenLesson.mock.calls[0][0]).toBe(PREMIERE_LECON.lessonKey);
    expect(onOpenLesson.mock.calls[0][2]).toBe(PREMIERE_LECON.unitId);

    fireEvent.click(lignes[1]);
    expect(onOpenQcm).toHaveBeenCalledTimes(1);
    expect(onOpenQcm.mock.calls[0][0]).toBe(PREMIER_JALON.unitId);
  });

  it('pastille de note : « s/t » si total connu, « n% » sinon, « — » sinon', () => {
    // 9/10 → pastille fraction ; 0.8 sans total → 80% ; sans note → « — ».
    markDone(PREMIERE_LECON.id, 0.9, 10);
    markDone(PARCOURS_FLAT[1].id, 0.8);
    markDone(PARCOURS_FLAT[2].id);
    rendre();

    const pastilles = Array.from(
      screen.getByTestId('bac-papers').querySelectorAll('span[dir="ltr"]'),
    ).map((s) => s.textContent?.trim());
    expect(pastilles).toContain('9 / 10');
    expect(pastilles).toContain('80%');
    expect(pastilles).toContain('—');
  });

  it('la ligne fragile prend la pastille or (note < seuil)', () => {
    markDone(PREMIERE_LECON.id, 0.4, 10);
    rendre();
    const pastille = screen
      .getByTestId('bac-papers')
      .querySelector('span[dir="ltr"].bg-\\[\\#f3dfae\\]');
    expect(pastille).toBeTruthy();
    expect(pastille!.textContent).toBe('4 / 10');
  });
});

describe('BacView — جسور الوحدات', () => {
  it('expose 11 tuiles (une par unité)', () => {
    rendre();
    expect(screen.getByTestId('bac-bridges')).toBeTruthy();
    expect(screen.getByTestId('bac-bridges').querySelectorAll('li')).toHaveLength(11);
  });

  it('une tuile ouverte devient cliquable et appelle onOpenQcm', () => {
    markDone(PREMIER_JALON.id, 1, 6);
    const { onOpenQcm } = rendre();
    const boutons = screen.getByTestId('bac-bridges').querySelectorAll('button');
    expect(boutons.length).toBeGreaterThan(0);
    fireEvent.click(boutons[0]);
    expect(onOpenQcm).toHaveBeenCalledTimes(1);
  });
});

describe('BacView — ما يسقط فعلاً (poids mesurés)', () => {
  it('n affiche QUE les unités dont le poids a été mesuré (U1..U7)', () => {
    rendre();
    const poids = screen.getByTestId('bac-weights');
    expect(poids).toBeTruthy();
    // 7 unités pesées (10, 9, 13, 13, 16, 20, 19 %) — U8..U11 non mesurées.
    // On compare les ÉTIQUETTES : un `toContain(textContent)` sur « الوحدة 1 »
    // + « 10% » produirait un faux « الوحدة 11 ».
    const etiquettes = Array.from(poids.querySelectorAll('li')).map(
      (li) => li.querySelector('span')?.textContent ?? '',
    );
    expect(etiquettes).toEqual([
      'الوحدة 1',
      'الوحدة 2',
      'الوحدة 3',
      'الوحدة 4',
      'الوحدة 5',
      'الوحدة 6',
      'الوحدة 7',
    ]);
  });
});

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  localStorage.removeItem(STORAGE_KEY);
});
