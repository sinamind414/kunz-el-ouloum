// focusVisible.test.ts — on doit VOIR où l'on est au clavier (sprint 51).
//
// Suite logique des sprints 49-50 : rendre une carte atteignable au clavier ne
// sert à rien si rien n'indique qu'elle est atteinte. L'application pose
// `focus:outline-none` à 52 endroits — pratique courante pour supprimer le
// contour bleu du navigateur — sans rien mettre à la place.
//
// La parade est globale (`:focus-visible` dans index.css, via `box-shadow`
// que `outline-none` ne neutralise pas). Ces tests vérifient que la règle
// existe, qu'elle ne se déclenche qu'au clavier, et que la dette locale ne
// grandit pas.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const RACINE = resolve(process.cwd(), 'src');
const CSS = readFileSync(resolve(RACINE, 'index.css'), 'utf8');

function fichiersTsx(dossier: string): string[] {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) return fichiersTsx(chemin);
    if (!nom.endsWith('.tsx') || nom.includes('.test.')) return [];
    return [chemin];
  });
}

const OCCURRENCES_MAX = 52; // état constaté au sprint 51 ; ne doit que baisser

describe('indicateur de focus clavier', () => {
  it('existe globalement', () => {
    expect(CSS).toMatch(/:focus-visible\s*{/);
  });

  it('s’appuie sur box-shadow, que `outline-none` ne neutralise pas', () => {
    const bloc = CSS.slice(CSS.indexOf(':focus-visible'));
    expect(bloc).toContain('box-shadow');
  });

  it('ne se déclenche qu’au clavier, jamais au clic souris', () => {
    // `:focus-visible` et non `:focus` : un clic souris ne doit pas dessiner
    // un anneau autour de la carte cliquée.
    const reglesFocusSeul = CSS.match(/(^|[^-\w]):focus\s*{/g) ?? [];
    expect(reglesFocusSeul, 'règle :focus globale trouvée (devrait être :focus-visible)').toEqual(
      [],
    );
  });

  it('reste lisible en thème sombre', () => {
    expect(CSS).toMatch(/prefers-color-scheme:\s*dark[\s\S]{0,200}:focus-visible/);
  });

  it('n’augmente pas le nombre d’endroits qui suppriment le contour', () => {
    const total = fichiersTsx(RACINE).reduce(
      (n, f) => n + (readFileSync(f, 'utf8').match(/focus:outline-none/g)?.length ?? 0),
      0,
    );
    expect(total, `${total} occurrences de focus:outline-none`).toBeLessThanOrEqual(
      OCCURRENCES_MAX,
    );
  });
});
