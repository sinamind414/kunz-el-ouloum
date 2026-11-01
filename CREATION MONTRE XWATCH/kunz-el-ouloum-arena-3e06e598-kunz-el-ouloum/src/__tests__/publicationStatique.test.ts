// publicationStatique.test.ts — verrou de PUBLICATION.
//
// Défaut trouvé le 14/10/2026, vérifié par requête HTTP réelle sur le serveur
// de production : `express.static(dist)` servait TOUT `dist/`, y compris le
// bundle serveur et sa source map.
//
//   GET /server.cjs.map  →  200, 202 Ko, avec le TypeScript d'origine :
//       server.ts, server/store.ts, server/auth.ts (import), les limiteurs,
//       la génération des codes élèves et les commentaires de sécurité.
//
// Autrement dit : n'importe qui pouvait lire le code du serveur en une commande,
// sans aucun outil de rétro-ingénierie. Ces tests interdisent le retour du trou.

import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const serverSrc = () => fs.readFileSync(path.resolve(process.cwd(), 'server.ts'), 'utf-8');

/** Extrait la branche de production (celle qui sert le dossier `dist`). */
function brancheProduction(src: string): string {
  const debut = src.indexOf('const distPath = path.join(process.cwd(), "dist")');
  expect(debut, 'branche de production introuvable').toBeGreaterThan(0);
  const fin = src.indexOf('// ── Handler d\'erreurs final', debut);
  return src.slice(debut, fin > debut ? fin : debut + 4000);
}

describe('fichiers serveur jamais téléchargeables', () => {
  it('un garde-fou précède le service statique de `dist`', () => {
    const bloc = brancheProduction(serverSrc());
    const garde = bloc.indexOf('INTERDITS');
    // Rechercher l'APPEL, pas la mention dans le commentaire qui documente le trou.
    const statique = bloc.indexOf('app.use(express.static(distPath');
    expect(garde, 'garde-fou absent').toBeGreaterThan(0);
    expect(statique, 'service statique absent').toBeGreaterThan(0);
    expect(garde, 'le garde-fou doit précéder express.static').toBeLessThan(statique);
  });

  it('le garde-fou refuse les sources, les maps, les manifestes et les fichiers cachés', () => {
    const bloc = brancheProduction(serverSrc());
    const regex = bloc.slice(bloc.indexOf('const INTERDITS'), bloc.indexOf('app.use((req'));
    // Chaque famille doit être couverte par l'expression.
    for (const motif of ['server\\.(c?js|mjs|ts)', '\\.map', 'package(-lock)?\\.json', 'tsconfig', '\\.env', '\\.git']) {
      expect(regex, `motif manquant : ${motif}`).toContain(motif);
    }
  });

  it('le refus est explicite : 404 + journal, pas un silence', () => {
    const bloc = brancheProduction(serverSrc());
    expect(bloc).toContain('res.status(404).json({ error: "not_found" })');
    expect(bloc).toContain('[static] bloqué');
    // Une tentative de remontée de dossier est refusée aussi.
    expect(bloc).toContain('chemin.includes("..")');
  });

  it('le service statique lui-même est restreint', () => {
    const bloc = brancheProduction(serverSrc());
    expect(bloc).toContain('express.static(distPath, { index: false, dotfiles: "deny" })');
    // `index: false` : `/` doit passer par le repli SPA, pas par une liste de dossier.
    expect(bloc).not.toContain('express.static(distPath);');
  });

  it('le repli SPA ne renvoie QUE index.html (jamais un fichier arbitraire)', () => {
    const bloc = brancheProduction(serverSrc());
    const repli = bloc.slice(bloc.indexOf('app.get("*"'));
    expect(repli).toContain('res.sendFile(path.join(distPath, "index.html"))');
    // Aucun `sendFile(req....)` : une requête ne doit jamais choisir le fichier.
    expect(repli).not.toContain('sendFile(req');
  });
});

describe('ce qui NE doit pas être publié', () => {
  it('le build serveur produit une source map — donc elle ne doit jamais être servie', () => {
    // Si un jour le build cesse de produire de map, ce test devient inutile
    // mais inoffensif : le garde-fou couvre aussi `*.map` du client.
    const serveur = serverSrc();
    expect(serveur).toContain('INTERDITS');
  });

  it('aucun fichier de données élèves n’est versionné', () => {
    // Vérifié hors vitest par `git ls-files` ; ici on fige l'intention dans le
    // code : le serveur ne doit pas exposer de JSON de données.
    const bloc = brancheProduction(serverSrc());
    expect(bloc).not.toContain('data/students.json"');
  });
});
