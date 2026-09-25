// tests/jest-raw-transformer.cjs — emulate le suffixe `?raw` de Vite.
//
// Sous Vite, `import('x.html?raw')` retourne le CONTENU du fichier comme
// chaine (default export). Jest ne connait pas `?raw` : on supprime le
// suffixe dans jest.config.cjs (moduleNameMapper) puis on transforme les
// fichiers .html en modules exportant leur contenu.
//
// On definit __esModule + default pour que l'import dynamique fonctionne
// aussi bien via import * as mod (mod.default) qu'via import def.

module.exports = {
  process(sourceText) {
    return {
      code:
        'Object.defineProperty(module.exports, "__esModule", { value: true });\n' +
        'module.exports.default = ' + JSON.stringify(String(sourceText)) + ';\n',
    };
  },
};
