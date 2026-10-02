// MoiView.test.tsx — page « أنا » (photo 1 du design OPUS 5.5).
//
// Convention repo : pas de @testing-library/jest-dom → .toBeTruthy() /
// .toBeNull() / .toHaveLength(). cleanup() explicite. localStorage nettoyé
// entre les tests (l'état du parcours persiste sinon).
//
// Ce qui est vérifié :
//   - en-tête : eyebrow « أنا », nom de session ou mention « مسار تجريبي »
//     (aucun code de suivi fabriqué) ;
//   - شجرتك : 3 domaines, 11 unités, une feuille PAR LEÇON (59) + 11 points
//     de جسار, et la légende 4 entrées ;
//   - feuille verte après مسارات fait, feuille or après échec, pâle sinon ;
//   - أرقامك بالكلếmات reflète le store (0 / 59 au départ).

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import MoiView from '../MoiView';
import { PARCOURS_DOMAINS, PARCOURS_FLAT } from '../../lib/parcours/parcoursPath';
import { markDone } from '../../lib/parcours/parcoursProgress';

const STORAGE_KEY = 'kunz_parcours_v1';

const NB_LECONS = PARCOURS_FLAT.filter((i) => i.kind === 'lesson').length;
const NB_JALONS = PARCOURS_FLAT.filter((i) => i.kind === 'jalon').length;

function rendre(nomEleve: string | null = null, courriel: string | null = null) {
  return render(<MoiView nomEleve={nomEleve} courriel={courriel} />);
}

/** Feuilles lucide : <svg aria-label="titre du leçon"> — arbre SEUL (la
 *  légende porte aussi des feuilles et fausserait le décompte). */
function feuilles(container: HTMLElement): Element[] {
  const bloc = container.querySelector('[data-testid="moi-tree-units"]');
  if (!bloc) return [];
  return Array.from(bloc.querySelectorAll('svg[aria-label]'));
}

describe('MoiView — en-tête identité', () => {
  it('affiche le nom de session et le courriel sans code de suivi inventé', () => {
    const { container } = rendre('أمينة', 'ammina@example.dz');
    expect(screen.getByTestId('moi-header')).toBeTruthy();
    expect(screen.getByText('أنا')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'أمينة' })).toBeTruthy();
    expect(screen.getByText(/ammina@example\.dz/)).toBeTruthy();
    // Aucun « رمز المتابعة » fabriqué : le zip s'appuie sur un id learner
    // que l'app ne possède pas.
    expect(screen.queryByText(/رمز المتابعة/)).toBeNull();
    expect(container).toBeTruthy();
  });

  it('hors session, annonce un parcours local (pas de nom, pas de faux identifiant)', () => {
    rendre();
    expect(screen.getByRole('heading', { name: 'صفحتي' })).toBeTruthy();
    expect(screen.getByText('مسار تجريبي · محفوظ على هذا الجهاز')).toBeTruthy();
  });
});

describe('MoiView — شجرتك (arbre)', () => {
  it('rend les 3 domaines, les 11 unités et une feuille par leçon', () => {
    const { container } = rendre();
    expect(screen.getByTestId('moi-tree')).toBeTruthy();

    PARCOURS_DOMAINS.forEach((d) => {
      expect(screen.getAllByText(d.title).length).toBeGreaterThan(0);
    });
    // 11 lignes d'unité (une <li> par unité) — bloqu dans le bloc unités,
    // la légende possède aussi des <li>.
    const lignes = screen.getByTestId('moi-tree-units').querySelectorAll('li');
    expect(lignes).toHaveLength(PARCOURS_DOMAINS.reduce((n, d) => n + d.units.length, 0));

    // Une feuille PAR LEÇON (les جسار sont des points, pas des feuilles).
    expect(feuilles(container)).toHaveLength(NB_LECONS);
    expect(NB_LECONS + NB_JALONS).toBe(70);
  });

  it('colore la feuille selon l état : pâle → verte (fait) → or (fragile)', () => {
    const { container } = rendre();
    const premiere = PARCOURS_FLAT.find((i) => i.kind === 'lesson');
    expect(premiere).toBeTruthy();

    // 1. Non faite → simple contour pâle, jamais de remplissage.
    let feuille = feuilles(container).find(
      (svg) => svg.getAttribute('aria-label') === premiere!.title,
    );
    // `className` d'un <svg> est un SVGAnimatedString (objet) → on lit
    // l'attribut class, qui est une chaîne.
    expect(feuille).toBeTruthy();
    expect(feuille!.getAttribute('class')).toContain('text-[#e2dabf]');
    expect(feuille!.getAttribute('class')).not.toContain('fill-[');

    // 2. Faite → remplissage forêt.
    markDone(premiere!.id, 1);
    cleanup();
    const deuxieme = rendre();
    feuille = feuilles(deuxieme.container).find(
      (svg) => svg.getAttribute('aria-label') === premiere!.title,
    );
    expect(feuille!.getAttribute('class')).toContain('fill-[#006d37]');

    // 3. Fragile (note < seuil) → remplissage or.
    markDone(premiere!.id, 0.2);
    cleanup();
    const troisieme = rendre();
    const encore = feuilles(troisieme.container).find(
      (svg) => svg.getAttribute('aria-label') === premiere!.title,
    );
    expect(encore!.getAttribute('class')).toContain('fill-[#f3dfae]');
  });

  it('dessine le point du جسار : vide par défaut, plein une fois ouvert', () => {
    const { container } = rendre();
    const point = container.querySelector('[aria-label="الجسر"]');
    expect(point).toBeTruthy();
    expect(point!.className).toContain('border border-[#e2dabf]');

    markDone(PARCOURS_FLAT.find((i) => i.kind === 'jalon')!.id, 1);
    cleanup();
    const suivant = rendre();
    const pointOuvert = suivant.container.querySelector('[aria-label="الجسر"]');
    expect(pointOuvert!.className).toContain('bg-[#00562b]');
  });

  it('expose une légende de 4 entrées (lire l arbre sans deviner)', () => {
    rendre();
    expect(screen.getByText('مُنجز')).toBeTruthy();
    expect(screen.getByText('هشّ — يعود في المراجعة')).toBeTruthy();
    expect(screen.getByText('لم يُنجز بعد')).toBeTruthy();
    expect(screen.getByText('جسر مفتوح')).toBeTruthy();
  });
});

describe('MoiView — أرقامك بالكلمات', () => {
  it('reflète le store : 0 leçon faite au démarrage, puis 1', () => {
    rendre();
    expect(screen.getByTestId('moi-nums')).toBeTruthy();
    expect(screen.getByText('دروس مُنجزة')).toBeTruthy();
    expect(screen.getByText(`0 / ${NB_LECONS}`)).toBeTruthy();

    cleanup();
    markDone(PARCOURS_FLAT[0].id, 1);
    const { container } = rendre();
    expect(container.textContent).toContain(`1 / ${NB_LECONS}`);
  });
});

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  localStorage.removeItem(STORAGE_KEY);
});
