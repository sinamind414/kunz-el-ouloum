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
  // Parité avec vitest (vite.config.ts, test.setupFiles) : les bases dynamiques
  // du tuteur (index leçons + opuscules) n'arrivent pas par fetch en test.
  // Version jest du setup : top-level await interdit (CJS) → injection en
  // beforeAll asynchrone, avant chaque fichier de test.
  setupFilesAfterEnv: ['<rootDir>/src/test-setup/prechargerBasesTuteur.jest.ts'],
  // AITutorView est lourd (53 s solo) : en parallélisme maximal, les files
  // d'attente CPU font dépasser 25 s à un test et déborder des rendus
  // asynchrones sur le test suivant (mesuré 2 échecs intermittents le
  // 18/10/2026, non reproduits en solo). On borne le parallélisme — la suite
  // reste 3-4x plus rapide que séquentielle.
  maxWorkers: '50%',
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
    // Controles post-build : ils portent sur le RESULTAT d'un build
    // (dist/assets) et non sur le code source. Exclus de la suite unitaire
    // vitest pour la meme raison (vite.config.ts, test.exclude) — sinon ils
    // produisent des echecs permanents dans toute copie sans build.
    // Ils se lancent par `npm run test:build`, apres le build.
    '/src/build/',
    // vitest-only : vi.mock/doMock non hoistees par babel-plugin-jest-hoist.
    'LessonsViewActiveNav\\.test\\.tsx$',
    'LessonsViewPassiveNav\\.test\\.tsx$',
    'sessionEffectsService\\.test\\.ts$',
    'examLog\\.test\\.ts$',
    // S-C4 : mock de utils/audio (vi.mock) — couvert par vitest.
    'QuizView\\.fillBlank\\.test\\.tsx$',
    // vitest-only : top-level `await` (ESM) — non transformable en CJS par
    // babel. Test d'integration serveur (better-sqlite3) couvert par vitest.
    'serverDashboard\\.test\\.ts$',
    // vitest-only : vi.mock (non hoistee par babel-plugin-jest-hoist,
    // cf. LIMITES en tête) — StudentAuthView (api), atelierFlux (flux).
    'StudentAuthView\\.test\\.tsx$',
    'atelierFlux\\.test\\.tsx$',
  ],
};
