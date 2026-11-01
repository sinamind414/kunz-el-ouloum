// useTailleTexte.ts — M5 (audit 8 axes 2026-10-14) : « 3 crans de taille de
// texte ». L'app est en rem Tailwind ; trois crans appliqués sur
// <html data-taille-texte> montent TOUTE la typo (text-sm → text-4xl).
// Choix persisté localement — un réglage d'élève ne disparaît pas au
// rechargement. Cycle simple : 1 → 2 → 3 → 1 (aucun panneau de réglages à
// maintenir, un seul bouton à côté du mode sombre).
import { useCallback, useEffect, useState } from 'react';

const CLE = 'bonz_taille_texte';
export const CRANS = [1, 2, 3] as const;

function lireCranInitial(): number {
  try {
    const brut = localStorage.getItem(CLE);
    const n = brut ? Number(brut) : 1;
    return (CRANS as readonly number[]).includes(n) ? n : 1;
  } catch {
    return 1;
  }
}

export function useTailleTexte(): { cran: number; agrandir: () => void } {
  const [cran, setCran] = useState<number>(lireCranInitial);

  useEffect(() => {
    document.documentElement.dataset.tailleTexte = String(cran);
  }, [cran]);

  const agrandir = useCallback(() => {
    setCran((c) => {
      const suivant = c >= 3 ? 1 : c + 1;
      try {
        localStorage.setItem(CLE, String(suivant));
      } catch {
        // Stockage indisponible (navigation privée stricte) : le cran tient
        // pour la session, la persistance n'est pas une condition.
      }
      return suivant;
    });
  }, []);

  return { cran, agrandir };
}
