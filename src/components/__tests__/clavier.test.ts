// clavier.test.ts — tout ce qui se clique doit pouvoir se déclencher au
// clavier (sprint 49).
//
// Un `onClick` posé sur un `<div>` produit une cible **inaccessible au
// clavier** : pas de focus, pas d'activation par Entrée ou Espace, et rien
// d'annoncé par un lecteur d'écran. C'est le défaut d'accessibilité le plus
// répandu dans une interface faite de « cartes » cliquables — et l'application
// en était pleine : 18 occurrences au début de ce sprint.
//
// Ce test lit les sources plutôt que le DOM : un gestionnaire de clic n'est
// pas visible dans le rendu, et c'est justement l'écriture qu'il faut
// corriger.
//
// La dette restante est listée nommément : le compteur ne peut que descendre.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const RACINE = resolve(process.cwd(), 'src/components');
const BALISES_INERTES = ['div', 'span', 'li', 'p', 'section', 'article', 'td', 'tr'];

/**
 * Dette connue, à résorber. Chaque entrée est un écran ancien dont la
 * conversion demande une reprise de mise en page ; les ajouter ici est un
 * engagement, pas un blanc-seing.
 */
const DETTE_CONNUE: Record<string, number> = {
  // Sprint 50 : il ne reste que la fenêtre « سياسة الخصوصية » du splash.
  //  · le fond cliquable qui ferme la fenêtre : geste répandu, dont
  //    l'équivalent clavier (touche Échap) est branché — en faire un bouton le
  //    placerait dans l'ordre de tabulation AVANT le contenu de la fenêtre ;
  //  · le conteneur qui appelle `stopPropagation` : ce n'est pas une commande,
  //    seulement un garde contre la propagation du clic.
  'SplashView.tsx': 2,
};

function fichiersTsx(dossier: string): string[] {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) return fichiersTsx(chemin);
    if (!nom.endsWith('.tsx') || nom.includes('.test.')) return [];
    return [chemin];
  });
}

/** Compte les gestionnaires de clic posés sur une balise non interactive. */
export function clicsInertes(source: string): number {
  let total = 0;
  for (const m of source.matchAll(/onClick/g)) {
    const ouverture = source.lastIndexOf('<', m.index);
    if (ouverture === -1) continue;
    const balise = /^<\s*([A-Za-z][\w.]*)/.exec(source.slice(ouverture, ouverture + 40));
    if (balise && BALISES_INERTES.includes(balise[1])) total += 1;
  }
  return total;
}

describe('activation au clavier', () => {
  const fichiers = fichiersTsx(RACINE);

  it('n’introduit aucune nouvelle cible cliquable non interactive', () => {
    const fautifs: string[] = [];
    for (const chemin of fichiers) {
      const nom = chemin.slice(RACINE.length + 1).replace(/^.*\//, '');
      const n = clicsInertes(readFileSync(chemin, 'utf8'));
      const tolere = DETTE_CONNUE[nom] ?? 0;
      if (n > tolere) fautifs.push(`${nom} : ${n} (toléré ${tolere})`);
    }
    expect(fautifs, `cibles non accessibles au clavier : ${fautifs.join(' | ')}`).toEqual([]);
  });

  it('garde la dette sous contrôle et la voit diminuer', () => {
    const total = fichiers.reduce((n, c) => n + clicsInertes(readFileSync(c, 'utf8')), 0);
    const plafond = Object.values(DETTE_CONNUE).reduce((s, n) => s + n, 0);
    expect(total, `${total} cibles inertes pour un plafond de ${plafond}`).toBeLessThanOrEqual(
      plafond,
    );
  });

  it('a bien nettoyé les écrans d’accueil, de plan, de révision et de méthode', () => {
    for (const nom of [
      'DashboardView.tsx',
      'TodayCard.tsx',
      'RevisionPlanView.tsx',
      'BacIdeasView.tsx',
      'RevisionView.tsx',
      'StatsView.tsx',
      'MeftahView.tsx',
      'DailyGoalWidget.tsx',
      'MethodologyCompilerView.tsx',
    ]) {
      const chemin = fichiers.find((f) => f.endsWith(nom))!;
      expect(clicsInertes(readFileSync(chemin, 'utf8')), nom).toBe(0);
    }
  });

  it('détecte correctement un cas fabriqué', () => {
    expect(clicsInertes('<div onClick={x}>a</div>')).toBe(1);
    expect(clicsInertes('<button onClick={x}>a</button>')).toBe(0);
  });
});


describe('équivalents clavier explicites', () => {
  it('la fenêtre de confidentialité se ferme avec Échap', () => {
    const source = readFileSync(resolve(RACINE, 'SplashView.tsx'), 'utf8');
    expect(source).toContain("e.key === 'Escape'");
    expect(source).toContain('setShowPrivacy(false)');
  });
});
