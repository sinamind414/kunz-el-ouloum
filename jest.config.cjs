// jest.config.js — rend `npx jest` utilisable sur la suite TypeScript.
//
// Le runner canonique du projet reste VITEST (`npm run test:vitest`,
// 91 fichiers / 1135 tests) + le runner maison tsx (`npm test`,
// tests/boussole.test.ts, 138 assertions). Cette config Jest est un second
// runner pratique, pas un remplacement.
//
// Vitest-only (couverts par vitest, exclus ci-dessous) :
//  - 4 fichiers utilisant vi.mock/doMock (hoisting babel-jest incompatible) ;
//  - tests/boussole.test.ts (runner tsx, hors roots:src).

/** @type {import('jest').Config} */
module.exports = {
  rootDir: '.',
  roots: ['<rootDir>/src', '<rootDir>/server'],
  // jsdom + globales Node (fetch/Response/Request) + localStorage inscriptible.
  // cf tests/jest-jsdom-node-env.cjs — parite avec l'environnement vitest.
  testEnvironment: '<rootDir>/tests/jest-jsdom-node-env.cjs',
  // Emule le suffixe ?raw de Vite : on retire le suffixe (l'extension .html
  // est alors convertie en chaine par tests/jest-raw-transformer.cjs).
  moduleNameMapper: {
    '^vitest$': '<rootDir>/tests/jest-vitest-shim.ts',
    '^@/(.*)$': '<rootDir>/$1',
    '^([^?]+)\\?raw$': '$1',
  },
  transform: {
    // transform par defaut de jest (a reaffirmer des qu'on ajoute une entree) :
    '^.+\\.[jt]sx?$': 'babel-jest',
    // Emule le suffixe ?raw de Vite sur les fichiers de lecons.
    '\\.html$': '<rootDir>/tests/jest-raw-transformer.cjs',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/\\.kilo/', // worktree git : copie du depot dans le dossier
    '/dist/',
    // vitest-only : vi.mock/doMock non hoistees par babel-plugin-jest-hoist.
    'LessonsViewActiveNav\\.test\\.tsx$',
    'LessonsViewPassiveNav\\.test\\.tsx$',
    'sessionEffectsService\\.test\\.ts$',
    'examLog\\.test\\.ts$',
    // vitest-only : top-level `await` (ESM) — non transformable en CJS par
    // babel. Test d'integration serveur (better-sqlite3) couvert par vitest.
    'serverDashboard\\.test\\.ts$',
  ],
};
