// FigureZoomLayer.tsx
// Monte le RUNTIME DE ZOOM (src/utils/figureZoomRuntime.ts) dans le document de
// l'application : badge « تكبير » au survol de toute figure (SVG ou image) +
// superposition plein écran (zoom +/−, %, glisser, molette, pincement, Esc).
//
// Même code que celui injecté dans les leçons HTML : une seule implémentation,
// donc un comportement strictement identique dans l'app et dans les leçons.
//
// Les icônes (petits SVG ≤ 150×100), les SVG décoratifs (aria-hidden), les liens
// et les boutons sont exclus par le runtime — aucune interaction existante
// (animations, graphes, cartes) n'est interceptée : tout passe par délégation.
import { useEffect } from 'react';
import {
  FIGURE_ZOOM_SCRIPT_ID,
  FIGURE_ZOOM_STYLE_ID,
  FIGURE_ZOOM_CSS,
  FIGURE_ZOOM_JS,
} from '../utils/figureZoomRuntime';

export default function FigureZoomLayer() {
  useEffect(() => {
    if (!document.getElementById(FIGURE_ZOOM_STYLE_ID)) {
      const style = document.createElement('style');
      style.id = FIGURE_ZOOM_STYLE_ID;
      style.textContent = FIGURE_ZOOM_CSS;
      document.head.appendChild(style);
    }
    if (!document.getElementById(FIGURE_ZOOM_SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = FIGURE_ZOOM_SCRIPT_ID;
      script.textContent = FIGURE_ZOOM_JS;
      document.body.appendChild(script);
    }

    // Démontage exact : le runtime se ferme, retire sa pastille/sa superposition
    // et détache TOUS ses écouteurs globaux ; les nœuds sont retirés pour qu'un
    // remontage (StrictMode, changement de mode de rendu) rebranche proprement.
    return () => {
      const w = window as Window & {
        __pfeZoom?: { destroy?: () => void };
      };
      if (w.__pfeZoom && typeof w.__pfeZoom.destroy === 'function') {
        w.__pfeZoom.destroy();
      }
      document.getElementById(FIGURE_ZOOM_SCRIPT_ID)?.remove();
      document.getElementById(FIGURE_ZOOM_STYLE_ID)?.remove();
    };
  }, []);

  return null;
}
