// src/utils/__tests__/figureZoomLessons.test.ts
// VÉRIFICATION FINALE SUR LES VRAIS DOCUMENTS SERVIS (25 leçons + miftah.html).
//
// `figureZoomRuntime.test.ts` verrouille le runtime sur un document SYNTHÉTIQUE ;
// ce fichier le fait tourner sur le HTML réellement livré aux élèves :
//   1. chaque figure (48 SVG ProFigure + 5 schémas image) doit être reconnue
//      zoomable : aucune règle d'exclusion (nav, lien, aria-hidden, taille) ne
//      doit l'écarter par accident, et aucune figure ne doit rester « muette » ;
//   2. la superposition doit être AUTO-SUFFISANTE : après clonage, chaque url(#…)
//      doit résoudre vers un id PRÉSENT DANS LE CLONE (dégradés, filtres,
//      marqueurs) et le document ne doit contenir aucun id dupliqué écran ouvert ;
//   3. le titre affiché ne doit jamais être vide : c'est le libellé propre de la
//      figure quand elle en a un (aria-label / alt), sinon un texte de repli court
//      pris dans la section qui l'héberge — jamais un titre de chapitre lointain.
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { FIGURE_ZOOM_JS } from '../figureZoomRuntime';

const ROOT = resolve(__dirname, '../../..');
const LESSONS = resolve(ROOT, 'public/lessons');
const LESSON_FILES = readdirSync(LESSONS)
  .filter((f) => f.endsWith('.html'))
  .sort();
const DOCS = [...LESSON_FILES.map((f) => `public/lessons/${f}`), 'public/miftah.html'];

/** Reproduit le filtre d'exclusion du runtime (contrôles, liens, décors). */
const BLOCKED =
  'button,a,label,select,input,textarea,header,nav,footer,.no-zoom,[data-no-zoom],[data-pfe-zoom-skip]';
const MIN_W = 150;
const MIN_H = 100;

/** Nombre de figures VOLONTAIREMENT non zoomables, et pourquoi. */
const NON_ZOOMABLE: Record<string, number> = {
  // miftah.html : son unique SVG est le widget de légende « مفتاح بخمس حركات »
  // (248×78 px) — trop petit pour être un schéma à lire → hors seuil 150×100.
  'public/miftah.html': 1,
};

/** Documents où AUCUNE figure ne doit s'ouvrir en zoom (widget décoratif). */
const NO_ZOOMABLE = new Set(Object.keys(NON_ZOOMABLE));

/** Contenu <body> du document, sans ses scripts (non exécutés hors navigateur). */
function bodyOf(html: string): string {
  const m = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html);
  return (m ? m[1] : html).replace(/<script\b[\s\S]*?<\/script>/gi, '');
}

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

/**
 * Reproduit la mise en page réelle (jsdom n'en calcule aucune) :
 *   - figures de leçon (viewBox sans width/height fixes + CSS width:100%) → 900×420 ;
 *   - SVG à taille fixe (widget, icône) → sa taille déclarée ;
 *   - images de synthèse (max-width:920px) → 920×640 ; le reste → 20×20.
 */
function patchRects(): () => void {
  const original = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function (this: Element) {
    const tag = this.tagName.toLowerCase();
    if (tag === 'img') {
      return fakeRect(920, 640);
    }
    if (tag === 'svg') {
      const w = parseFloat(this.getAttribute('width') || '');
      const h = parseFloat(this.getAttribute('height') || '');
      if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
        return fakeRect(w, h);
      }
      return fakeRect(900, 420);
    }
    return fakeRect(20, 20);
  };
  return () => {
    Element.prototype.getBoundingClientRect = original;
  };
}

function bootRuntime(): void {
  // jsdom n'exécute pas les <script> ajoutés après coup : on évalue le runtime
  // comme le ferait le navigateur (portée globale = window du DOM de test).
  new Function(FIGURE_ZOOM_JS)();
}

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

type ZoomApi = {
  figureAt: (el: Element | null) => Element | null;
};

function api(): ZoomApi {
  return (window as unknown as { __pfeZoom: ZoomApi }).__pfeZoom;
}

/** Le runtime considère-t-il cet élément comme une figure zoomable ? */
function eligible(el: Element): boolean {
  if (el.closest(BLOCKED)) {
    return false;
  }
  if (el.getAttribute('aria-hidden') === 'true') {
    return false;
  }
  const r = el.getBoundingClientRect();
  return r.width >= MIN_W && r.height >= MIN_H;
}

/** Normalisation identique à celle du runtime (espaces multiples → 1). */
function normalize(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/** Références internes (url(#…) et href="#…") d'un fragment SVG sérialisé. */
function internalRefs(serialized: string): string[] {
  return [
    ...[...serialized.matchAll(/url\(\s*['"]?#([^)'"#]+)/g)].map((m) => m[1]),
    ...[...serialized.matchAll(/xlink:href="#([^"]+)"/g)].map((m) => m[1]),
  ];
}

describe('zoom — documents réels servis aux élèves', () => {
  it('le corpus est bien celui attendu (48 SVG de leçon + 5 schémas image)', () => {
    expect(LESSON_FILES.length).toBe(25);
    let svg = 0;
    let img = 0;
    for (const rel of DOCS) {
      const html = readFileSync(resolve(ROOT, rel), 'utf8');
      svg += (html.match(/<svg\b/g) || []).length;
      img += (html.match(/<img\b/g) || []).length;
    }
    // 48 figures ProFigure réparties sur les 25 leçons…
    expect(svg - 1).toBe(48);
    // …+ le widget de légende de miftah.html ; 5 schémas de synthèse en image.
    expect(svg).toBe(49);
    expect(img).toBe(5);
  });

  for (const rel of DOCS) {
    it(`${rel} : toutes les figures sont zoomables, superposition autonome, titre exact`, () => {
      const html = readFileSync(resolve(ROOT, rel), 'utf8');
      document.body.innerHTML = bodyOf(html);
      const restore = patchRects();
      try {
        bootRuntime();

        const elements = [...document.querySelectorAll('svg,img')];
        const zoomable = elements.filter(eligible);
        const skipped = elements.filter((el) => !eligible(el));

        // 0. Document sans schéma à agrandir : on vérifie que le clic n'y ouvre RIEN
        //    (le widget de légende de miftah doit rester un simple décor de page).
        if (NO_ZOOMABLE.has(rel)) {
          expect(skipped.length, `${rel} : figure devenue zoomable`).toBe(elements.length);
          for (const el of elements) {
            el.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
          }
          expect(document.querySelector('.pfe-zoom-overlay'), `${rel} : zoom ouvert`).toBeNull();
          expect(api().figureAt(elements[0])).toBeNull();
          return;
        }

        // 1. Aucune figure éligible ne doit être ignorée par le runtime
        //    (c'est le test « le clic sur ce schéma ne fait rien » qu'on veut éviter).
        expect(zoomable.length, `${rel} : aucune figure zoomable`).toBeGreaterThan(0);
        for (const el of zoomable) {
          expect(api().figureAt(el), `${rel} : figure ignorée (${el.tagName})`).toBe(el);
        }

        // 2. Les seules exclusions sont celles documentées (sous le seuil de taille).
        expect(
          skipped.length,
          `${rel} : ${skipped.length} élément(s) non zoomable(s) inattendu(s)`,
        ).toBe(NON_ZOOMABLE[rel] ?? 0);

        // 3. Clic sur la 1re figure → superposition ouverte + figure clonée.
        const fig = zoomable[0];
        // Texte de la section qui héberge la figure : sert à prouver la PROVENANCE
        // du titre de repli (jamais un titre de chapitre lointain).
        const sectionText = normalize(fig.closest('section')?.textContent ?? '');
        fig.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
        const overlay = document.querySelector('.pfe-zoom-overlay') as HTMLElement;
        expect(overlay, `${rel} : superposition non ouverte`).not.toBeNull();
        expect(overlay.classList.contains('is-open')).toBe(true);
        expect(document.documentElement.classList.contains('pfe-zoom-lock')).toBe(true);

        const canvas = overlay.querySelector('.pfe-zoom-canvas') as HTMLElement;
        const clone = canvas.firstElementChild as Element;
        expect(clone, `${rel} : aucune figure clonée`).not.toBeNull();
        expect(clone.tagName.toLowerCase()).toBe(fig.tagName.toLowerCase());

        // 3a. Le clonage ne doit créer AUCUNE référence orpheline : chaque url(#…)
        //     du clone se résout soit dans le clone (ids préfixés), soit dans la
        //     page (defs partagés, ex. <marker> global d'une figure voisine).
        const cloneIds = new Set(
          [...clone.querySelectorAll('[id]')].map((n) => n.getAttribute('id') as string),
        );
        const pageIds = new Set(
          [...document.querySelectorAll('[id]')].map((n) => n.getAttribute('id') as string),
        );
        const cloneRefs = [...new Set(internalRefs(clone.outerHTML))];
        const cloneDangling = cloneRefs.filter((r) => !cloneIds.has(r) && !pageIds.has(r));
        const sourceDangling = [...new Set(internalRefs(fig.outerHTML))].filter(
          (r) => !pageIds.has(r),
        ).sort();
        expect(
          [...cloneDangling].sort(),
          `${rel} : référence(s) cassée(s) par le clonage (${cloneDangling.slice(0, 4).join(', ')})`,
        ).toEqual(sourceDangling);

        // 3b. Tout id porté par la figure est rebaptisé (pfezN-…) : c'est ce qui
        //     garantit zéro id dupliqué écran ouvert, donc zéro dégradé détourné.
        const figIds = [...fig.querySelectorAll('[id]')].map((n) => n.getAttribute('id') as string);
        if (figIds.length > 0) {
          expect(cloneIds.size, `${rel} : ids perdus au clonage`).toBe(
            figIds.length + (fig.getAttribute('id') ? 1 : 0),
          );
          for (const id of cloneIds) {
            expect(id.startsWith('pfez'), `${rel} : id non préfixé (${id})`).toBe(true);
          }
        }

        // 3b-bis. Aucun id dupliqué dans le document, superposition ouverte.
        const allIds = [...document.querySelectorAll('[id]')].map(
          (n) => n.getAttribute('id') as string,
        );
        expect(new Set(allIds).size, `${rel} : ids dupliqués écran ouvert`).toBe(allIds.length);

        // 3c. Titre affiché : jamais vide ; si la figure porte son propre libellé
        //     (aria-label / alt / <title>), c'est EXACTEMENT lui qui s'affiche ;
        //     sinon repli court et issu de la section qui l'héberge.
        const shown = normalize(
          (overlay.querySelector('.pfe-zoom-title') as HTMLElement).textContent || '',
        );
        expect(shown.length, `${rel} : titre affiché vide`).toBeGreaterThan(6);
        const own = normalize(
          fig.getAttribute('aria-label') ||
            fig.getAttribute('data-title') ||
            (fig.tagName.toLowerCase() === 'img' ? fig.getAttribute('alt') : '') ||
            (fig.querySelector('title,desc')?.textContent ?? '') ||
            '',
        );
        if (own) {
          expect(shown, `${rel} : titre affiché ≠ libellé de la figure`).toBe(own);
        } else {
          // Cas du corpus : les 48 figures n'ont pas encore d'aria-label propre →
          // le titre vient du texte VOISIN de la figure, pas d'un chapitre lointain.
          expect(shown.length, `${rel} : titre de repli trop long`).toBeLessThanOrEqual(120);
          expect(
            sectionText.includes(shown),
            `${rel} : titre de repli hors de la section de la figure`,
          ).toBe(true);
        }

        // 3d. Les 6 commandes sont présentes (dont « نافذة » non cliquée ici).
        expect(overlay.querySelectorAll('.pfe-zoom-btn').length).toBeGreaterThanOrEqual(6);
        expect((overlay.querySelector('.pfe-zoom-pct') as HTMLElement).textContent).toMatch(/%/);

        // 4. Esc : fermeture complète, clone retiré, défilement rendu.
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(overlay.classList.contains('is-open')).toBe(false);
        expect(canvas.childNodes.length).toBe(0);
        expect(document.documentElement.classList.contains('pfe-zoom-lock')).toBe(false);

        // 5. Démontage : plus aucun écouteur ni nœud du runtime dans la page.
        stopRuntime();
        expect((window as unknown as { __pfeZoom?: unknown }).__pfeZoom).toBeUndefined();
        expect(document.querySelector('.pfe-zoom-badge')).toBeNull();
        expect(document.querySelector('.pfe-zoom-overlay')).toBeNull();
        bootRuntime(); // …et le runtime doit pouvoir être rebranché aussitôt.
        expect(typeof api().figureAt).toBe('function');
      } finally {
        restore();
        stopRuntime();
      }
    });
  }
});
