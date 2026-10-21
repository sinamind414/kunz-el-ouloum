// jest.ci.config.cjs — le config JEST DE LA CI (job « test:jest », M1).
//
// POURQUOI CE FICHIER EXISTE : passer --testPathIgnorePatterns en CLI
// REMPLACE la liste de jest.config.cjs au lieu de l'enrichir — la CI du
// 20/10/2026 (run 241) démasquait ainsi 8 suites vitest-only (vi.mock non
// hoisté par babel-jest : sessionEffectsService, examLog, serverDashboard,
// StudentAuthView, atelierFlux, QuizView.fillBlank, LessonsView×2) qui
// échouent au niveau module. Ici on ÉTEND la liste canonique : le carnet ne
// se duplique pas, une future exclusion de la base voyage en CI.
//
// Exclusions propres à la CI : les 2 suites figureZoom* (travail concurrent
// non signé, échecs machine de dev, vertes en isolement — documentées dans
// le carnet batterie depuis H4).

const base = require('../jest.config.cjs');

/** @type {import('jest').Config} */
module.exports = {
  ...base,
  // rootDir '.' = relatif au dossier du config (tests/) → remonter.
  rootDir: '..',
  testPathIgnorePatterns: [
    ...base.testPathIgnorePatterns,
    '/figureZoomRuntime\\.test\\.ts$',
    '/leconRuntimeZoomRendu\\.lock\\.test\\.ts$',
  ],
};
