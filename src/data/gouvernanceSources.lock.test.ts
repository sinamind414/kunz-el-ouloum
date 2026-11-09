// Phase 2 / R8 (2026-11-07) — VERROU DE GOUVERNANCE DES SOURCES.
//
// R8 : « soit retirer les 2 livres de l'index git, soit documenter leur
// licence » + « aligner .gitignore racine et docs/sources/.gitignore ».
// La 1re branche est exécutée depuis l'étage 4. La 2e NE PEUT PAS l'être :
// aucun texte de licence n'existe dans le dépôt → « Non vérifiable ».
// Ce verrou gèle l'alignement et l'honnêteté du commentaire, pas une licence
// qui serait inventée.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const lire = (p: string) => readFileSync(resolve(process.cwd(), p), 'utf8');
const NOMS = ['الكتاب_المصحح_v1.0.md', 'المكتبة_الكاملة_SVT.md'];

describe('Phase 2 / R8 : les 2 ouvrages sont ignorés des DEUX côtés', () => {
  it('les DEUX noms figurent dans .gitignore ET docs/sources/.gitignore', () => {
    for (const fichier of ['.gitignore', 'docs/sources/.gitignore']) {
      const contenu = lire(fichier);
      for (const nom of NOMS) {
        expect(contenu, `${fichier} : ${nom} absent`).toContain(nom);
        expect(contenu, `${fichier} : ${nom} ré-inclus`).not.toContain(`!${nom}`);
      }
    }
  });

  it('le commentaire racine ne prétend plus qu’ils sont dans NOTRE historique', () => {
    const contenu = lire('.gitignore');
    expect(contenu).not.toContain("demeurent dans l'historique git");
    expect(contenu).not.toContain('demeurent dans l’historique git');
    expect(contenu).toContain('320 commits');
    expect(contenu).toContain('Non vérifiable');
  });
});

describe('Phase 2 / R8 : la décision est documentée sans licence inventée', () => {
  it('le README constate le retrait, les 2 noms et le 0/2', () => {
    const contenu = lire('docs/sources/README.md');
    expect(contenu).toContain('Gouvernance des 2 ouvrages tiers');
    for (const nom of NOMS) expect(contenu).toContain(nom);
    expect(contenu).toContain('0/2');
    expect(contenu).toContain('exécutée'); // « est **exécutée** » (gras Markdown)
  });

  it('la licence reste « Non vérifiable » : aucune autorisation fabriquée', () => {
    const contenu = lire('docs/sources/README.md');
    expect(contenu).toContain('Non vérifiable');
    expect(contenu).toContain('ne vaut pas autorisation de distribution');
    expect(contenu).toContain('8 autres branches');
  });
});
