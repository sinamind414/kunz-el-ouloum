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

## État de référence (2026-11-04, après H1+H3+H4+M1+①②③ audit 8 axes)

| Suite | Résultat |
|---|---|
| tsc | vert (0 erreur) |
| vitest | 320 fichiers / 3 722 tests : **100 % vert** (flake de contention durci, voir ci-dessous) |
| jest | 311 suites / 3 661 tests : **100 % vert** |
| CI (run 41805250743, master 7b7637e) | **5 jobs / 5 verts** |

Les chiffres du 2026-10-26 (3 675 tests, 1 échec fuseau, 1 erreur eslint acces.ts) sont périmés :
l'échec fuseau est corrigé (`0ce98a4`) et l'erreur eslint ne se reproduit plus.

### Échec connu : dépendance au fuseau horaire — **RÉSOLU le 2026-11-04**

`server/store.pg.dates.test.ts` › « couvre le cas UTC+1 » échouait quand la machine est
en UTC et **passait** avec `TZ=Africa/Algiers`. Les runners GitHub Actions sont en UTC :
sur `master`, les jobs vitest, jest et `npm test` étaient **rouges** (runs 259-261, puis
run 41466381160 du 02/11 : 3 jobs / 5 rouges), alors que les messages de commit
annonçaient des suites vertes mesurées localement à l'heure d'Alger.
**Fix (commit `0ce98a4`, PR #41)** : l'attendu est recalculé via
`Intl.DateTimeFormat("sv-SE")` — voie de vérification différente du code testé
(`getFullYear/getDate`) — 3/3 verts sous `TZ=UTC` et sous `TZ=Africa/Algiers`.
Preuve CI : run `41776027631` (PR #41) : **5 jobs / 5 verts** (04/11/2026).
Leçon inchangée : une mesure locale ne remplace pas la CI ; vérifier le run GitHub.
Reproduire la CI en local : `TZ=UTC npx vitest run`.

### Flake connu : contention sous la suite complète (constaté 2026-11-04)

`serieIntegration.test.tsx` peut perdre 3 tests sous `npx vitest run` complet
(durée 16,5 s vs 9,7 s isolé) : ses `findByText` plafonnent à 4 s et le
parallélisme interne de vitest fait dépasser le délai. Vérifié : **6/6 vert en
isolé, 3 705/3 705 vert au re-run complet** — c'est du bruit de charge, pas un
défaut. **Reproduit AUSSI sur CI** (runs master `41779532217` puis
`41782128315`, 04/11/2026 : 3 puis 2 tests perdus, 15-16 s — sur des arbres
identiques aux 5/5 des PR #41/#42) ; replay du job seul lancé via
`gh run rerun --failed` (vert à chaque fois). Durcissement en deux couches :
les 3 `findBy` de la suite passent de 4000 ms à 8000 ms, et les deux tests
les plus lourds (rendu `<App />` complet, l. 180 et 209) reçoivent un timeout
de test explicite de 15 000 ms — leur coupable réel était le défaut vitest de
5000 ms par test (`Test timed out in 5000ms`), pas les `findBy`. Une vraie
régression échouerait toujours (assertion ou blocage) : la patience accrue ne
masque rien.
Méthode inchangée : un échec isolé se rejoue SEUL avant tout diagnostic ; et
vitest + jest ne doivent jamais tourner en parallèle (contention CPU, cf.
BacIdeaTrainer/AITutorView innocentés le 03/11).

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
