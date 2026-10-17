// sandbox.lock.test.ts — M10/M11 (audit externe, « ligne par ligne » 2026-10-17).
//
// DÉFAUT : l'unique iframe de l'app (HtmlLessonViewer, leçons HTML via
// `srcDoc`) était rendue SANS `sandbox` : le JavaScript inline des leçons
// (~514 handlers on*) tournait avec les PLEINS PRIVILÈGES de l'origine de
// l'app — un contenu de leçon altéré (localStorage corrompu, injectionfuture)
// aurait pu lire `svt_auth` (JWT) et tout le stock de l'élève sur cette
// même origine.
//
// FIX : `sandbox="allow-scripts"` SANS `allow-same-origin` :
//   - les scripts des leçons continuent de tourner (figures interactives,
//     laboratoire virtuel — mesuré 2026-10-17 : AUCUNE leçon n'utilise
//     localStorage/sessionStorage/indexedDB/document.cookie/fetch/XHR) ;
//   - le document acquiert une ORIGINE OPAQUE : plus aucun accès au
//     localStorage/JWT de l'application depuis une leçon.
// Un `allow-same-origin` ajouté à côté d'`allow-scripts` retirerait CONSCAMMENT
// la protection (le document reprendrait son origine réelle) — d'où le verrou
// négatif ci-dessous.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SOURCE = readFileSync(
  resolve(__dirname, '../components/HtmlLessonViewer.tsx'),
  'utf8',
);

describe('M10/M11 — l iframe des leçons est confinée', () => {
  it('l iframe porte sandbox="allow-scripts"', () => {
    expect(SOURCE).toMatch(/<iframe[^>]*sandbox="allow-scripts"/);
  });

  it('sandbox SANS allow-same-origin (sinon le confinement est illusoire)', () => {
    const iframe = SOURCE.match(/<iframe[\s\S]*?\/>/)?.[0] ?? '';
    expect(iframe).not.toMatch(/allow-same-origin/);
    void iframe;
  });
});

describe('m11 — la hauteur de la leçon suit le contenu (postMessage, pas contentDocument)', () => {
  it('le mesureur de hauteur est injecté dans la leçon (srcDoc) et envoie pfe-lecon-hauteur', () => {
    expect(SOURCE).toMatch(/SCRIPT_MESURE_HAUTEUR/);
    expect(SOURCE).toMatch(/pfe-lecon-hauteur/);
    // compatible origine opaque : on n'accède JAMAIS à contentDocument
    expect(SOURCE).not.toMatch(/contentDocument/);
  });

  it('repli 78vh conservé avant la première mesure, hauteur bornée après', () => {
    expect(SOURCE).toMatch(/hauteurPx \?\? '78vh'/);
    expect(SOURCE).toMatch(/h >= 200 && h <= 80000/);
  });
});
