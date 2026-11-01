// src/utils/methodologyChecker.ts
// Micro-tests des leçons actives (Speckit §9 — Priority 1 « Enzymes et
// catalyse ») — logique métier pure, sans dépendance DOM :
//  · checkProduction : une production est acceptée si, après normalisation
//    arabe unique (normalizeAr), elle EST la réponse acceptée ou la contient
//    intégralement (l'élève peut entourer la phrase attendue de contexte).
//    Une réponse vide est toujours rejetée.
//  · isInsideHotspot : géométrie des zones cliquables (cercles) — un point
//    sur le bord (<= radius) est considéré à l'intérieur.

import { normalizeAr } from '../lib/validation/normalizeAr';

export interface Hotspot {
  x: number;
  y: number;
  radius: number;
}

/** Une production est acceptée si elle couvre une réponse acceptée du micro-test. */
export function checkProduction(text: string, acceptedAnswers: string[]): boolean {
  const t = normalizeAr(text);
  if (!t) return false;
  return acceptedAnswers.some((a) => {
    const ans = normalizeAr(a);
    if (!ans) return false;
    return t === ans || t.includes(ans);
  });
}

/** Point dans un hotspot circulaire (bord compris). */
export function isInsideHotspot(x: number, y: number, hotspot: Hotspot): boolean {
  const dx = x - hotspot.x;
  const dy = y - hotspot.y;
  return dx * dx + dy * dy <= hotspot.radius * hotspot.radius;
}
