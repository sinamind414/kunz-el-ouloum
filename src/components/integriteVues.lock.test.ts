// integriteVues.lock.test.ts — verrou anti-zombie (chantier M4, 2026-10-16).
//
// Défaut constaté : src/components/BacView.tsx (10 Ko) n'était importé par
// AUCUN fichier de production — uniquement par son propre test plus un verrou
// négatif dans MoiView.test. Une vue morte reste dans l'entretien (types,
// tests, relecture) et invite à des fusions imparfaites. Ce verrou interdit
// qu'un composant de src/components/ vive hors du graphe de production.
//
// Prédicat : chaque fichier .tsx de src/components/ (hors tests) doit être
// importé par au moins un AUTRE fichier de production (src/ ou server/, tests
// exclus). Les imports TS n'écrivent pas l'extension : le motif vérifié est
// le nom du module collé à une guillemet finale (`./BacView'`, 
// `components/Bac2025ExamView'`, `import('./BacExamView')`…).
//
// Les références venant de fichiers .test. ne comptent PAS comme une vie.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const RACINE = process.cwd();

function fichiersProduction(): string[] {
  const out: string[] = [];
  const parcourir = (d: string): void => {
    let entrees: string[];
    try {
      entrees = readdirSync(d);
    } catch {
      return;
    }
    for (const e of entrees) {
      const p = join(d, e);
      let st;
      try {
        st = statSync(p);
      } catch {
        continue;
      }
      if (st.isDirectory()) {
        if (e === 'node_modules' || e === '__tests__' || e === 'dist') continue;
        parcourir(p);
      } else if (/\.(ts|tsx)$/.test(e) && !e.includes('.test.')) {
        out.push(p);
      }
    }
  };
  parcourir(join(RACINE, 'src'));
  parcourir(join(RACINE, 'server'));
  return out;
}

const PRODUCTION = fichiersProduction().map((p) => ({
  chemin: p,
  base: p.split(/[\\/]/).pop()!.replace(/\.(ts|tsx)$/, ''),
  contenu: readFileSync(p, 'utf8'),
}));

describe('verrou anti-zombie : chaque composant vit dans le graphe de production', () => {
  // Exception EN ATTENTE DE DÉCISION éditoriale (2026-10-16) : ParcoursView
  // (18 Ko + test 10 Ko, chemin linéaire + NBA, testids `parcours-*`) est
  // complet mais jamais branché — NbaCard (la tâche du jour) vit lui sur le
  // tableau de bord (DashboardView). Supprimer = perte d'une feature
  // récupérable via git ; brancher = décision de navigation (App.tsx protégé).
  const EXCEPTIONS_EN_ATTENTE = ['ParcoursView'];

  it('aucun composant orphelin (non importé par un fichier de production)', () => {
    const dir = join(RACINE, 'src', 'components');
    const orphelins: string[] = [];
    for (const f of readdirSync(dir)) {
      if (!/\.tsx$/.test(f) || f.includes('.test.')) continue;
      const base = f.replace(/\.tsx$/, '');
      if (EXCEPTIONS_EN_ATTENTE.includes(base)) continue;
      const importeur = PRODUCTION.find(
        (m) => m.base !== base && m.contenu.includes(`${base}'`),
      );
      if (!importeur) orphelins.push(base);
    }
    expect(
      orphelins,
      `composants zombies (à supprimer ou brancher) : ${orphelins.join(', ')}`,
    ).toEqual([]);
  });
});
