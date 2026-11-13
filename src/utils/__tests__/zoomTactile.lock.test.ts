// src/utils/__tests__/zoomTactile.lock.test.ts
// VERRU DU ZOOM DES FIGURES EN ÉCRAN TACTILE (APK Android).
//
// POURQUOI CE VERROU EST HORS DU NOM `figureZoom*`
// Les suites `figureZoom*` sont EXCLUES de la CI (travail concurrent non
// signé, cf. .github/workflows/ci.yml). Ce verrou vit donc sous un autre
// nom pour être réellement exécuté par la CI.
//
// LE DÉFAUT OBSERVÉ (signalé par le propriétaire sur l'APK)
// Sur l'APK (tactile), la pastille « تكبير » n'était JAMAIS visible :
//   · elle n'apparaît qu'au `pointerover` — sur un écran tactile, le
//     `pointerover` est déclenché au TOUCHER puis le `pointerout` annule
//     l'affichage à la fin de l'appui → la pastille vit ~150 ms, le temps
//     d'un clignement ;
//   · en plus, ce `pointerout` effaçait la figure ciblée : un second appui
//     sur la pastille n'ouvrait alors plus rien ;
//   · enfin, les seuils (150×100 px) excluaient les graphes réduits par la
//     mise en page mobile (≈ 120×90).
//
// CE QUE CE VERROU FIGE
//  1. la détection du mode tactile (pointer: coarse) ;
//  2. la pastille qui SURVIT à l'appui (et la figure qui reste ciblée) ;
//  3. la disparition différée de la pastille ;
//  4. des seuils de taille abaissés en mode tactile.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FIGURE_ZOOM_JS } from '../figureZoomRuntime';

function fakeRect(width: number, height: number): DOMRect {
  return {
    width,
    height,
    top: 10,
    left: 10,
    right: 10 + width,
    bottom: 10 + height,
    x: 10,
    y: 10,
    toJSON: () => ({}),
  } as unknown as DOMRect;
}

/** Simule un écran tactile (le media query `pointer: coarse` répond vrai). */
function rendreTactile(): void {
  (window as unknown as { matchMedia: (q: string) => { matches: boolean } }).matchMedia = ((q: string) => ({
    matches: q.indexOf('coarse') > -1,
    media: q,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  })) as unknown as (q: string) => { matches: boolean };
}

function arreterRuntime(): void {
  const w = window as unknown as { __pfeZoom?: { destroy?: () => void } };
  if (w.__pfeZoom && typeof w.__pfeZoom.destroy === 'function') w.__pfeZoom.destroy();
  delete (window as unknown as Record<string, unknown>).__pfeZoom;
  delete (window as unknown as Record<string, unknown>).__pfeZoomRuntime;
  document.body.innerHTML = '';
}

describe('zoom des figures — écran tactile (APK)', () => {
  afterEach(() => {
    arreterRuntime();
    vi.useRealTimers();
  });

  it('la pastille apparaît à l’appui et SURVIT à la fin de l’appui', () => {
    vi.useFakeTimers();
    rendreTactile();

    const original = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () {
      return fakeRect(400, 300);
    };
    document.body.innerHTML = '<svg viewBox="0 0 400 300"></svg>';

    try {
      new Function(FIGURE_ZOOM_JS)();
      const svg = document.querySelector('svg') as unknown as HTMLElement;

      // 1. Appui : la pastille est visible.
      svg.dispatchEvent(new Event('pointerover', { bubbles: true }));
      const badge = document.querySelector('.pfe-zoom-badge') as HTMLElement;
      expect(badge, 'pastille absente').not.toBeNull();
      expect(badge.classList.contains('is-visible')).toBe(true);

      // 2. Fin de l'appui (pointerout) : la pastille NE DISPARAÎT PAS.
      svg.dispatchEvent(new Event('pointerout', { bubbles: true }));
      expect(
        badge.classList.contains('is-visible'),
        'la pastille doit rester visible après l’appui (écran tactile)',
      ).toBe(true);

      // 3. La figure reste ciblée : un second appui sur la pastille ouvre le zoom.
      expect(
        (window as unknown as { __pfeZoom?: { figureAt: (el: Element) => unknown } }).__pfeZoom?.figureAt(svg),
        'la figure doit rester ciblée après l’appui',
      ).not.toBeNull();

      // 4. La pastille finit par disparaître (nettoyage de l'écran).
      vi.advanceTimersByTime(4000);
      expect(badge.classList.contains('is-visible')).toBe(false);
    } finally {
      Element.prototype.getBoundingClientRect = original;
    }
  });

  it('en mode tactile, une figure réduite par la mise en page mobile reste zoomable', () => {
    vi.useFakeTimers();
    rendreTactile();

    const original = Element.prototype.getBoundingClientRect;
    // 120×90 : trop petit pour les seuils bureau (150×100), suffisant en tactile.
    Element.prototype.getBoundingClientRect = function () {
      return fakeRect(120, 90);
    };
    document.body.innerHTML = '<svg viewBox="0 0 120 90"></svg>';

    try {
      new Function(FIGURE_ZOOM_JS)();
      const svg = document.querySelector('svg') as unknown as HTMLElement;
      svg.dispatchEvent(new Event('pointerover', { bubbles: true }));
      const badge = document.querySelector('.pfe-zoom-badge') as HTMLElement;
      expect(badge, 'pastille absente sur une figure mobile').not.toBeNull();
      expect(badge.classList.contains('is-visible')).toBe(true);
    } finally {
      Element.prototype.getBoundingClientRect = original;
    }
  });

  it('le mode bureau garde le comportement de survol (pastille cachée en sortant)', () => {
    vi.useFakeTimers();
    // matchMedia absent (jsdom) ou « pointer: fine » : comportement d'origine.
    (window as unknown as { matchMedia?: unknown }).matchMedia = ((q: string) => ({
      matches: false,
      media: q,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    })) as unknown as (q: string) => { matches: boolean };

    const original = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () {
      return fakeRect(900, 420);
    };
    document.body.innerHTML = '<svg viewBox="0 0 900 420"></svg>';

    try {
      new Function(FIGURE_ZOOM_JS)();
      const svg = document.querySelector('svg') as unknown as HTMLElement;
      svg.dispatchEvent(new Event('pointerover', { bubbles: true }));
      const badge = document.querySelector('.pfe-zoom-badge') as HTMLElement;
      expect(badge.classList.contains('is-visible')).toBe(true);
      svg.dispatchEvent(new Event('pointerout', { bubbles: true }));
      expect(badge.classList.contains('is-visible'), 'au survol, la pastille doit se cacher').toBe(false);
    } finally {
      Element.prototype.getBoundingClientRect = original;
    }
  });
});
