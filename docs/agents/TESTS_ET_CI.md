# Tests, vérifications et CI

> Lu depuis `AGENTS.md`. Mesures du 2026-10-26 (conteneur Linux, Node 22.22, fuseau UTC).

## Commandes

| Étape | Commande | Durée indicative |
|---|---|---|
| Typecheck | `npm run lint` (= `tsc --noEmit`) | ~1 min |
| ESLint | `npm run lint:eslint` (0 erreur **et** 0 warning exigés) | ~1 min |
| Tests principaux | `npx vitest run` | ~2,5 min |
| Harnais boussole | `npx tsx tests/boussole.test.ts` | secondes |
| `npm test` | vitest **puis** boussole (s'arrête si vitest rougit) | — |
| Second runner | `npx jest` (local) / `npx jest --config tests/jest.ci.config.cjs` (CI) | ~3 min |
| Noyau méthodo | `npm run check:v2` | — |
| Build | `npm run build` (vite + esbuild `dist/server.cjs`) | — |
| Post-build | `npm run test:build` (rebuild + `src/build/**`) ; `node scripts/buildBudgets.mjs` | — |

Lancer un seul fichier : `npx vitest run chemin/du.test.ts`.

## État de référence (2026-10-26, avant et après la réorganisation)

| Suite | Résultat |
|---|---|
| tsc | vert |
| vitest | 314 fichiers / 3 675 tests : **1 échec** (voir ci-dessous), 2 ignorés |
| jest | 306 suites / 3 618 tests : **même échec**, 2 ignorés |
| boussole | 138/138 |
| eslint | **1 erreur** : `src/utils/acces.ts:192` (`@typescript-eslint/no-empty-object-type`) |

Les chiffres du `README.md` (294 fichiers / 3 465 tests, 18/10) sont périmés.

### Échec connu : dépendance au fuseau horaire

`server/store.pg.dates.test.ts` › « couvre le cas UTC+1 » échoue quand la machine est
en UTC et **passe** avec `TZ=Africa/Algiers` (vérifié). Le test suppose le fuseau du
développeur. Les runners GitHub Actions sont en UTC : sur `master`, les jobs vitest,
jest et `npm test` sont **rouges** sur les runs 259 à 261 (25/10/2026), alors que les
messages de commit annoncent « 3675/3675 » — mesure faite localement à l'heure d'Alger.
Cause confirmée dans les logs du job jest (run 261 : `store.pg.dates.test.ts:21`).
Leçon : une mesure locale ne remplace pas la CI ; vérifier le run GitHub.
Reproduire la CI en local : `TZ=UTC npx vitest run`. Corriger le test (le rendre
indépendant du fuseau) est un chantier à part, non fait dans la réorganisation.

## Conventions de test

- `@testing-library/jest-dom` **n'est pas câblé** : `.toBeTruthy()`, `.toBeNull()`,
  `.toHaveLength()` ; appeler `cleanup()` explicitement.
- vitest inclut `src/**/*.test.{ts,tsx}` et `server/**/*.test.ts`, exclut `src/build/**`
  (contrôles post-build, lancés par `test:build`).
- jest exclut 8 suites (vi.mock non hoisté, top-level await) : couvertes par vitest seul.
- Les tests `skipIf` (SQLite, fixtures locales, copies élèves) sont **ignorés** quand
  leurs prérequis manquent — ignoré ≠ vert.
- Les suites `figureZoom*` (travail concurrent) sont exclues de la CI ; ne pas y toucher.

## CI (`.github/workflows/ci.yml`, push/PR sur `master`, Node 22)

Jobs : `check:v2` · `npm test` · vitest (sans figureZoom*) · jest (config CI) ·
lint + build + `buildBudgets.mjs` + `test:build`.
