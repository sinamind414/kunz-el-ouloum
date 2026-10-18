// eslint.config.mjs — M12 (audit externe v2, 2026-10-18).
//
// ESLint n'était PAS installé (mesuré : `npm ls eslint` vide) : le projet
// n'avait que tsc comme garde-fou statique. Cette config apporte le niveau
// « recommended » de base, avec le périmètre du dépôt :
//
//   • exclusions structurelles : dist/, public/ (leçons = données officielles
//     verrouillées), scripts/tools/ (protégé AGENTS.md), worktree .kilo/ ;
//   • fichiers GÉNÉRÉS exclus de la correction : src/data/hosila.ts,
//     okacha.ts, lessonIndex.ts, cartesHosila.ts, svTutorKnowledge/logs —
//     une correction manuelle y serait écrasée au prochain build (convention
//     « GÉNÉRÉ — ne pas éditer », cf. AGENTS.md convention okacha/hosila) ;
//   • règles : js.recommended + typescript-eslint recommended (non
//     type-checké : ratio coût/valeur sur ~3 000 fichiers tests compris).
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'public/**',
      'scripts/tools/**',
      '.kilo/**',
      'coverage/**',
      // travail concurrent NON SIGNÉ (jamais linté, jamais commité) :
      'CREATION MONTRE XWATCH/**',
      'Python/**',
      'xwatch/**',
      'kunz-el-ouloum-arena-3e06e598-kunz-el-ouloum/**',
      // bibliothèques vendor embarquées (jamais éditées à la main) :
      '**/d3/7.8.5/d3.min.js',
      '**/d3-flame-graph/**/*.js',
      '**/html/_static/*.js',
      // fichiers générés (corriger le GÉNÉRATEUR, pas la sortie) :
      'src/data/hosila.ts',
      'src/data/okacha.ts',
      'src/data/lessonIndex.ts',
      'src/data/cartesHosila.ts',
      'src/data/tutorKnowledge/**',
    ],
  },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...globals.es2023 },
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      // les directives eslint-disable exhaustives-deps existantes dans les
      // vues (AITutorView, LessonsView...) redeviennent valides :
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    rules: {
      // tsc --noEmit (script `lint`) est l'AUTORITÉ sur les types et les
      // variables non déclarées ; no-undef/no-redeclare dupliqueraient ses
      // diagnostics avec des faux positifs TS (declaration merging, enums).
      'no-undef': 'off',
      'no-redeclare': 'off',
      // politique typage : `any` est assumé dans la plomberie de données et
      // les adaptateurs (tsc strict fait foi sur le reste). Rule désactivée
      // et non un warning : les 306 occurrences sont des choix, pas des bugs.
      '@typescript-eslint/no-explicit-any': 'off',
      // idiome regex canonique du dépôt : while ((m = re.exec(t)) !== null)
      // dans les extracteurs de corpus — autorisé dans les boucles.
      'no-cond-assign': ['error', 'except-parens'],
      // classes de caractères ARABES des moteurs de correction/normatisation
      // (negationAr, stuffingDetector, okachaQuality...) : l'échappement y
      // documente l'intention (règle d'or : ne pas retoucher les regex du
      // correcteur pour un linter).
      'no-useless-escape': 'off',
      // catch {} volontaires (repli, nettoyage best-effort) — mesuré 22 ;
      'no-empty': ['error', { allowEmptyCatch: true }],
      // `const self = this` hérité des moteurs générés/inline Leçons :
      '@typescript-eslint/no-this-alias': ['error', { allowDestructuring: true }],
      // dette assumée, rattrapage dédié (M12-bis) : 326 variables mortes au
      // 18/10/2026 (dont 14 dans App.tsx protégé) — en warning le temps du
      // rattrapage, interdiction d'en AJOUTER revisitée à la tranche.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // exhaustive-deps en warning : 13 occurrences au 18/10/2026, dont des
      // directives locales déjà posées dans les vues (rattrapage M12-bis).
    },
  },
  {
    files: ['src/App.tsx'],
    rules: {
      // Fichier PROTÉGÉ (AGENTS.md - « à ne jamais modifier ») : nettoyage des
      // 7 variables mortes et du tableau de dépendances différé au jour où ce
      // fichier retombe en maintenance normale. Éteint ici plutôt que polluer
      // la base de warnings.
      '@typescript-eslint/no-unused-vars': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  {
    files: ['**/*.cjs', 'scripts/**'],
    rules: {
      // CommonJS contractuel (jest env, outils ponctuels) :
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/__tests__/**'],
    rules: {
      // require() délibéré dans les tests (échappement au mock de module /
      // charge retardée) — technique assumée.
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    // B9 exécuté (2026-10-18) : les 10 débris one-shot de la racine
    // (fix_lesson_data.js + famille tools-*.mjs, 0 référence, 21 Ko) sont
    // supprimés. Reste à la racine : eslint.config.mjs lui-même, linté par
    // la config principale. Pattern conservé par prudence pour tout futur
    // script one-shot : remonter un vrai utilitaire dans scripts/.
    ignores: ['*.js'],
  },
);
