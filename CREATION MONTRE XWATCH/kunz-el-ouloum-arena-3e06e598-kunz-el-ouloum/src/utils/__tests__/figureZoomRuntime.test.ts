// src/utils/__tests__/figureZoomRuntime.test.ts
// Verrou du runtime de zoom des figures (SVG & graphes).
//
// Deux risques sont couverts ici :
//   1. le bloc injecté dans les leçons doit rester compatible avec les
//      invariants du viewer (src/data/lessonRenderParcours.test.ts) : aucune
//      séquence `id="`, `<div` ou fin de script dans le JS, ids uniques, doc clos ;
//   2. l'injection doit être IDEMPOTENTE et sur tous les HTML servis (25 leçons
//      + miftah.html) : aucune figure ne doit rester sans zoom.
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  FIGURE_ZOOM_BLOCK,
  FIGURE_ZOOM_JS,
  FIGURE_ZOOM_MARKER_END,
  FIGURE_ZOOM_MARKER_START,
  FIGURE_ZOOM_SCRIPT_ID,
  FIGURE_ZOOM_STYLE_ID,
  hasFigureZoom,
  injectFigureZoom,
} from '../figureZoomRuntime';

const ROOT = resolve(__dirname, '../../..');
const LESSONS = resolve(ROOT, 'public/lessons');
const lessonFiles = readdirSync(LESSONS).filter((f) => f.endsWith('.html'));

describe('runtime de zoom des figures', () => {
  it('le JS injecté est un script valide et ne casse aucun invariant du viewer', () => {
    expect(() => new Function(FIGURE_ZOOM_JS)).not.toThrow();
    // Aucun de ces motifs ne doit apparaître dans le JS injecté :
    expect(FIGURE_ZOOM_JS).not.toContain('</scr' + 'ipt');
    expect(FIGURE_ZOOM_JS).not.toContain('id="');
    expect(FIGURE_ZOOM_JS).not.toContain('<div');
    expect(FIGURE_ZOOM_JS).not.toContain('${');
    // Comportements clés attendus (garde-fous anti-régression silencieuse).
    expect(FIGURE_ZOOM_JS).toContain('requestFullscreen');
    expect(FIGURE_ZOOM_JS).toContain('pointerdown');
    expect(FIGURE_ZOOM_JS).toContain('deltaY');
    expect(FIGURE_ZOOM_JS).toContain('Escape');
    expect(FIGURE_ZOOM_JS).toContain('__pfeZoom');
    expect(FIGURE_ZOOM_JS).toContain('destroy');
  });

  it('le bloc expose le style et le script attendus, et est auto-suffisant', () => {
    expect(FIGURE_ZOOM_BLOCK).toContain(`id="${FIGURE_ZOOM_STYLE_ID}"`);
    expect(FIGURE_ZOOM_BLOCK).toContain(`id="${FIGURE_ZOOM_SCRIPT_ID}"`);
    expect(FIGURE_ZOOM_BLOCK.startsWith(FIGURE_ZOOM_MARKER_START)).toBe(true);
    expect(FIGURE_ZOOM_BLOCK.endsWith(FIGURE_ZOOM_MARKER_END)).toBe(true);
    // Le style du badge/de la superposition est bien présent.
    expect(FIGURE_ZOOM_BLOCK).toContain('.pfe-zoom-badge');
    expect(FIGURE_ZOOM_BLOCK).toContain('.pfe-zoom-overlay');
  });

  it('injection idempotente : 1re injection = ajout, 2e = aucun changement', () => {
    const doc = '<!DOCTYPE html><html><body><p>x</p></body></html>';
    expect(hasFigureZoom(doc)).toBe(false);
    const once = injectFigureZoom(doc);
    expect(once.changed).toBe(true);
    expect(hasFigureZoom(once.html)).toBe(true);
    expect(once.html.trimEnd().endsWith('</html>')).toBe(true);
    // Le bloc est bien AVANT </body> (donc exécuté après le rendu du contenu).
    expect(once.html.indexOf(FIGURE_ZOOM_MARKER_START)).toBeLessThan(once.html.indexOf('</body>'));

    const twice = injectFigureZoom(once.html);
    expect(twice.changed).toBe(false);
    expect(twice.html).toBe(once.html);

    // Mise à niveau : un ancien bloc partiel est remplacé, pas dupliqué.
    const stale = once.html.replace(/<script id="pfe-zoom-runtime">[\s\S]*?<\/script>/, '<script id="pfe-zoom-runtime">ancien</script>');
    const upgraded = injectFigureZoom(stale);
    expect(upgraded.changed).toBe(true);
    expect(upgraded.html).toContain('__pfeZoom');
    expect((upgraded.html.match(/PFE-ZOOM v1 — démarrage/g) || []).length).toBe(1);
  });

  it('injectFigureZoom échoue explicitement sans </body>', () => {
    expect(() => injectFigureZoom('<html><body>x')).toThrow(/body/);
  });

  it('les 25 leçons portent le zoom, sans casser divs/ids/fermeture', () => {
    expect(lessonFiles.length).toBe(25);
    for (const name of lessonFiles) {
      const html = readFileSync(resolve(LESSONS, name), 'utf8');
      expect(hasFigureZoom(html), `${name} : zoom absent — lancer npm run figures:zoom`).toBe(true);

      const open = (html.match(/<div\b/g) || []).length;
      const close = (html.match(/<\/div>/g) || []).length;
      expect(open, `${name} : divs déséquilibrés`).toBe(close);
      expect(html.trimEnd().endsWith('</html>'), `${name} : document non clos`).toBe(true);

      const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
      const dup = [...new Set(ids.filter((v, i) => ids.indexOf(v) !== i))];
      expect(dup, `${name} : ids dupliqués (${dup.slice(0, 4).join(', ')})`).toEqual([]);
    }
  });

  it('le HTML servi est à jour vis-à-vis de la source du runtime', () => {
    for (const name of lessonFiles) {
      const html = readFileSync(resolve(LESSONS, name), 'utf8');
      // Copie exacte du bloc courant : détecte toute dérive entre le runtime
      // source et ce qui est réellement servi aux élèves.
      expect(html.includes(FIGURE_ZOOM_BLOCK), `${name} : bloc de zoom obsolète`).toBe(true);
    }
  });

  it('miftah.html (document hors React) porte aussi le zoom', () => {
    const html = readFileSync(resolve(ROOT, 'public/miftah.html'), 'utf8');
    expect(hasFigureZoom(html)).toBe(true);
  });
});


// ─────────────────────────────────────────────────────────────────────────────
// Test COMPORTEMENTAL (jsdom) : le runtime doit réellement fonctionner.
// jsdom ne calcule aucune mise en page → on force les rectangles mesurés, ce qui
// reproduit exactement ce que voit le runtime dans un vrai navigateur.
// ─────────────────────────────────────────────────────────────────────────────
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

/** Charge le runtime dans la page de test et rend la main (aucun nettoyage ici). */
function bootRuntime(): void {
  // jsdom (vitest) n'exécute pas les <script> ajoutés après coup : on évalue le
  // runtime comme le ferait le navigateur (portée globale = window du DOM de test).
  new Function(FIGURE_ZOOM_JS)();
}

/** Démonte le runtime (détache ses écouteurs) puis vide le DOM de test. */
function stopRuntime(): void {
  const w = window as unknown as { __pfeZoom?: { destroy?: () => void } };
  if (w.__pfeZoom && typeof w.__pfeZoom.destroy === 'function') {
    w.__pfeZoom.destroy();
  }
  const g = window as unknown as Record<string, unknown>;
  delete g.__pfeZoom;
  delete g.__pfeZoomRuntime;
  document.body.innerHTML = '';
}

describe('runtime de zoom — comportement dans le navigateur (jsdom)', () => {
  it('ouvre la superposition au clic, zoome, puis se ferme avec Esc', () => {
    document.body.innerHTML =
      '<div class="doc-visual"><h3>الشكل 1 — التركيب الضوئي</h3>' +
      '<svg class="pfe-figure" viewBox="0 0 900 420"><defs><linearGradient id="g1"></linearGradient></defs>' +
      '<rect id="r1" fill="url(#g1)" width="900" height="420"></rect></svg></div>';
    document.head.innerHTML = '';

    // Toutes les figures mesurent 900×420 (comme dans une vraie leçon).
    const original = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () {
      return fakeRect(900, 420);
    };

    try {
      bootRuntime();

      const svg = document.querySelector('svg') as unknown as HTMLElement;
      expect(typeof (window as unknown as { __pfeZoom?: unknown }).__pfeZoom).toBe('object');

      // 1. Survol : la pastille « تكبير » apparaît, positionnée sur la figure.
      svg.dispatchEvent(new Event('pointerover', { bubbles: true }));
      const badge = document.querySelector('.pfe-zoom-badge') as HTMLElement;
      expect(badge).not.toBeNull();
      expect(badge.classList.contains('is-visible')).toBe(true);
      expect(badge.style.left).toMatch(/px$/);

      // 2. Clic sur la figure : superposition ouverte + clone préfixé (ids uniques).
      svg.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
      const overlay = document.querySelector('.pfe-zoom-overlay') as HTMLElement;
      expect(overlay).not.toBeNull();
      expect(overlay.classList.contains('is-open')).toBe(true);
      expect(document.documentElement.classList.contains('pfe-zoom-lock')).toBe(true);

      const canvas = overlay.querySelector('.pfe-zoom-canvas') as HTMLElement;
      expect(canvas.querySelectorAll('svg').length).toBe(1);
      // Le clone ne réutilise pas les ids d'origine (aucune collision de déf).
      const clonedIds = [...canvas.querySelectorAll('[id]')].map((n) => n.getAttribute('id'));
      expect(clonedIds).toContain('pfez1-g1');
      expect(clonedIds).not.toContain('g1');
      // ...et la référence url(#…) suit le nouveau préfixe (dégradés corrects).
      expect(canvas.innerHTML).toContain('url(#pfez1-g1)');
      // Le titre est repris du contexte (titre de section le plus proche).
      expect((overlay.querySelector('.pfe-zoom-title') as HTMLElement).textContent).toContain('الشكل 1');

      // 3. Zoom : le pourcentage affiché évolue avec les boutons + / −.
      const before = (overlay.querySelector('.pfe-zoom-pct') as HTMLElement).textContent;
      const plus = Array.from(overlay.querySelectorAll('.pfe-zoom-btn')).find((b) => b.textContent === '+');
      (plus as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
      const after = (overlay.querySelector('.pfe-zoom-pct') as HTMLElement).textContent;
      expect(after).not.toBe(before);
      expect(canvas.style.transform).toContain('scale(');

      // 4. Esc : fermeture + déverrouillage du défilement + clone retiré.
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(overlay.classList.contains('is-open')).toBe(false);
      expect(document.documentElement.classList.contains('pfe-zoom-lock')).toBe(false);
      expect(canvas.childNodes.length).toBe(0);
    } finally {
      Element.prototype.getBoundingClientRect = original;
      stopRuntime();
    }
  });

  it('ignore les icônes, les liens et les SVG décoratifs', () => {
    document.body.innerHTML =
      '<button><svg viewBox="0 0 24 24"><path d="M0 0h24v24H0z"></path></svg></button>' +
      '<a href="#x"><svg viewBox="0 0 400 300"></svg></a>' +
      '<svg aria-hidden="true" viewBox="0 0 400 300"></svg>';
    document.head.innerHTML = '';

    const original = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () {
      return fakeRect(400, 300);
    };
    try {
      bootRuntime();
      for (const svg of Array.from(document.querySelectorAll('svg'))) {
        (svg as unknown as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
      }
      expect(document.querySelector('.pfe-zoom-overlay')).toBeNull();
    } finally {
      Element.prototype.getBoundingClientRect = original;
      stopRuntime();
    }
  });
});
