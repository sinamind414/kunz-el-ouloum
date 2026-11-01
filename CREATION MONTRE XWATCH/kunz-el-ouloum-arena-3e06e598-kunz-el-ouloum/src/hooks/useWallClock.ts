// useWallClock.ts — des minuteurs qui lisent l'horloge (sprint 45).
//
// Audit à l'origine de ce fichier : après la correction du chronomètre
// d'épreuve (sprint 44), les quatre autres minuteurs de l'application
// souffraient du même défaut — QuizView, les deux minuteurs du compilateur de
// méthodologie, et l'atelier de combat. Tous faisaient `setInterval(… prev - 1
// …, 1000)`.
//
// Pourquoi c'est faux :
//   · les navigateurs mobiles **ralentissent fortement les minuteurs** d'un
//     onglet en arrière-plan (jusqu'à un tick par minute). Un compte à rebours
//     de 60 secondes pouvait durer plusieurs minutes réelles — sur un exercice
//     noté, l'élève gagnait du temps sans le savoir ;
//   · l'onglet redevenu actif, le compteur reprenait là où il s'était arrêté,
//     donc l'affichage mentait aussi après coup.
//
// Ici, le temps restant est **calculé** à partir d'un horodatage de fin. Le
// tick ne sert qu'à redessiner. Conséquence directe : revenir sur l'onglet
// après trois minutes affiche immédiatement la bonne valeur — ou la fin.

import { useEffect, useRef, useState } from 'react';

export interface OptionsCompteARebours {
  /** Durée totale, en secondes. */
  dureeSec: number;
  /** Le compte à rebours avance-t-il ? */
  actif: boolean;
  /** Appelé une seule fois, quand le temps atteint zéro. */
  onFin?: () => void;
  /** Période de rafraîchissement de l'affichage (ms). */
  rafraichissementMs?: number;
}

/**
 * Compte à rebours adossé à l'horloge.
 * Retourne les secondes restantes (jamais négatives).
 */
export function useCompteARebours({
  dureeSec,
  actif,
  onFin,
  rafraichissementMs = 500,
}: OptionsCompteARebours): number {
  const finRef = useRef<number | null>(null);
  const finTireeRef = useRef(false);
  const [restant, setRestant] = useState(Math.max(0, Math.round(dureeSec)));

  // Un changement de durée ou une (re)mise en marche repositionne l'échéance.
  useEffect(() => {
    if (!actif) {
      finRef.current = null;
      setRestant(Math.max(0, Math.round(dureeSec)));
      finTireeRef.current = false;
      return;
    }
    finRef.current = Date.now() + Math.max(0, dureeSec) * 1000;
    finTireeRef.current = false;
    setRestant(Math.max(0, Math.round(dureeSec)));
  }, [actif, dureeSec]);

  useEffect(() => {
    if (!actif) return undefined;

    const calculer = () => {
      const fin = finRef.current;
      if (fin == null) return;
      const secondes = Math.max(0, Math.ceil((fin - Date.now()) / 1000));
      setRestant(secondes);
      if (secondes === 0 && !finTireeRef.current) {
        finTireeRef.current = true;
        onFin?.();
      }
    };

    calculer();
    const id = setInterval(calculer, rafraichissementMs);
    // Revenir sur l'onglet doit resynchroniser immédiatement, sans attendre
    // le prochain tick.
    const surVisibilite = () => {
      if (!document.hidden) calculer();
    };
    document.addEventListener('visibilitychange', surVisibilite);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', surVisibilite);
    };
  }, [actif, rafraichissementMs, onFin]);

  return restant;
}

/**
 * Chronomètre croissant adossé à l'horloge (secondes écoulées depuis la mise
 * en marche), pour les modes « temps libre ».
 */
export function useChronometre(actif: boolean, rafraichissementMs = 500): number {
  const departRef = useRef<number | null>(null);
  const [ecoule, setEcoule] = useState(0);

  useEffect(() => {
    if (!actif) {
      departRef.current = null;
      return undefined;
    }
    departRef.current = Date.now();
    setEcoule(0);

    const calculer = () => {
      const depart = departRef.current;
      if (depart == null) return;
      setEcoule(Math.max(0, Math.floor((Date.now() - depart) / 1000)));
    };
    const id = setInterval(calculer, rafraichissementMs);
    const surVisibilite = () => {
      if (!document.hidden) calculer();
    };
    document.addEventListener('visibilitychange', surVisibilite);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', surVisibilite);
    };
  }, [actif, rafraichissementMs]);

  return ecoule;
}
