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

### État de référence (2026-11-06, Windows local, branche `reorganisation-med` 1bfea79)

| Suite | Résultat |
|---|---|
| tsc | vert (0 erreur) |
| vitest intégral | **336 fichiers / 3 897 tests : 100 % vert** (exit 0, 361 s) |
| jest intégral | **327 suites / 3 833 tests : 100 % vert** (exit 0) |
| build | exit 0 (24 s) |

Mesure prise après la fiabilisation du verrou `?idee=` (voir piège `lazy()` ci-dessous).
Chiffres antérieurs (2026-11-04 : 3 722 vitest / 3 661 jest) reflétaient une autre
branche et un autre état du dépôt.

### État de référence (2026-11-07, Windows local, branche `reorganisation-med`, lot 🔴 audit coach — 5 tranches non commitées)

| Suite | Résultat |
|---|---|
| tsc | vert (0 erreur) |
| vitest intégral | **343 fichiers / 3 944 tests : 100 % vert** (exit 0, 272 s) |
| jest intégral | **334 suites / 3 880 tests : 100 % vert** (exit 0) |
| build | exit 0 (warnings zod/chunk préexistants) |

Chiffres antérieurs (2026-11-06 : 336/3 897 vitest, 327/3 833 jest) reflétaient
l'état d'avant le lot 🔴 (recos 1-5 de `audit-coach-capitaine-2026-11-06.md`).
Détail du lot : exception SIGNÉE 2026-11-06/07 dans `AGENTS.md`.

### Flake de contention connu : `flashcardsExhaustif` — constaté 2026-11-07

En suite intégrale, `flashcardsExhaustif` frôlait/crossait son plafond de 75 s
par test. Rejoué SEUL hors contention : 40,7 s — plus de moitié du budget est
de la contention de workers, pas une régression du code. Ne pas durcir le
plafond ni casser la couverture pour ça ; si le flake revient, d'abord rejouer
la suite SEULE (règle générale ci-dessus), puis envisager `--pool=vmThreads`
(la segmentation vitest elle-même suggère 1 295 s cumulées de création de
jsdom sur la run intégrale).

### Piège connu : verrou comportemental sur un composant `lazy()` — constaté 2026-11-06

`navigation4Rubiques.test.tsx` › test « ?idee= ouvre directement la banque BAC » :
`BacIdeasView` est chargé par `lazy()` dans `App.tsx`, donc son `data-testid`
n'apparaît qu'à la résolution du chunk. En jsdom chargé (imports lourds), cette
résolution dépassait le timeout par défaut de `findByTestId` (1 s) : **test rouge
2/2 en isolation chez HEAD** le 2026-11-06, alors que le commit e730d9c déclarait
vitest 3897/3897 — le compte était vrai dans l'environnement du commit, le verrou
n'était simplement pas reproductible sur une autre machine.

**Règle** : un verrou qui asserte sur le rendu d'un composant `lazy()` doit
pré-importer le module avant le `render(<App />)` —

```ts
await import('../../components/BacIdeasView');   // résout le lazy au tick
render(<App />);
```

ainsi le loader de `React.lazy` résout depuis le cache de modules de façon
déterministe, quel que soit le poids des imports. Fix poussé : commit `1bfea79`
(isolation 3/3 vert ; suites complètes 3 897 vitest + 3 833 jest vertes).
Lecture à retenir pour tout futur verrou de navigation : ne jamais baser la
preuve comportementale sur le timeout par défaut d'un `findBy*` quand la cible
est derrière un `lazy()`.

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

## Piège connu : le garde-fou ESLint local explosait après tout build APK — constaté 2026-11-10

`npm run lint:eslint` (règle du dépôt : **0 erreur ET 0 warning**) sortait
**11 575 erreurs + 730 warnings** après un `npx cap sync` / build Gradle, alors
que le code source n'en comptait que 20. Deux familles d'artefacts n'étaient
pas ignorées :

- `android/app/src/main/assets/public/**` → **copie verbatim de `dist/`**
  (l'ignore `public/**` ne couvre pas `android/…`) et
  `android/app/build/intermediates/**` (sorties Gradle) ;
- `Rebrique-sujet-BAC-main/**` → projet **vendorisé tiers** (489 fichiers
  suivis, pdfjs minifié) : ce n'est pas notre code.

Ces trois chemins sont désormais dans les `ignores` d'`eslint.config.mjs`.
Résultat : `npm run lint:eslint` → **0 erreur, 0 warning**.

À noter : **le job `lint` de la CI n'exécute que `tsc`** (`npm run lint`), pas
ESLint — la CI n'a jamais été menacée. C'est le garde-fou **local** qui était
cassé (et donc la règle « 0/0 » invérifiable en pratique).

## Piège connu : edge-to-edge Android 15+ (APK) — zone sûre — constaté 2026-11-10

`android/variables.gradle` → `targetSdkVersion = 36` : **Android 15 impose
l'edge-to-edge** aux applications targeting ≥ 35. La WebView Capacitor passe
SOUS la barre d'état et SOUS la barre de navigation système.

Le plugin natif `SystemBars` de Capacitor 8 (mode `css`, le défaut — voir
`node_modules/@capacitor/android/.../plugin/SystemBars.java`) calcule les
insets et les injecte comme **variables CSS sur `<html>`** :
`--safe-area-inset-top/right/bottom/left`. **Le web doit les consommer.**

Conséquences si on ne le fait pas (symptômes vus sur l'APK) :
- les icônes de l'en-tête passent sous la barre d'état ;
- la barre de navigation applicative est mangée par la barre système ;
- les surfaces `position: fixed` (bulle/bouton du Capitaine, modale de chat,
  barre du quiz, barre de la leçon, modales) sont tronquées en bas ;
- le bloc de commandes de la fenêtre de zoom (`+ / − / ملاءمة`) disparaît
  sous la barre d'état : le zoom « ne marche pas » alors qu'il s'ouvre.

Règle de code : **`position: fixed` ignore le padding de la coquille** — chaque
surface fixe doit absorber l'inset elle-même. Source unique des variables :
`src/index.css` (alias `--pfe-safe-*` = `max(var(--safe-area-inset-*),
env(safe-area-inset-*))` ; `env()` sert de repli web/PWA). Verrou :
`src/components/__tests__/safeAreaApk.lock.test.ts` (source-scan, visible en
CI).

**Reproduire sans téléphone** : Chromium + émulation CDP
(`Emulation.setDeviceMetricsOverride` 390×844 + `setTouchEmulationEnabled`),
puis injecter à la main les variables que Capacitor injecte :
```js
document.documentElement.style.setProperty('--safe-area-inset-top', '44px');
document.documentElement.style.setProperty('--safe-area-inset-bottom', '24px');
```
C'est exactement le layout web que voit l'APK (le WebView ne dessine rien
dans la zone système : c'est l'OS qui la recouvre).

## Piège connu : le runtime de zoom n'a pas de survol sur tactile — constaté 2026-11-10

La pastille « تكبير » n'apparaît qu'au `pointerover`. Sur l'APK (tactile),
le `pointerover` part au toucher et le `pointerout` annule l'affichage à la
fin de l'appui : la pastille vit ~150 ms (un clignement) et le `pointerout`
effaçait la figure ciblée (un second appui sur la pastille n'ouvrait plus
rien). Corrigé dans `src/utils/figureZoomRuntime.ts` : mode tactile
`(pointer: coarse)`, seuils 110×80 (au lieu de 150×100 — les graphes réduits
par la mise en page mobile étaient exclus), pastille conservée 2,6 s après
l'appui, `hideBadge(true)` à l'ouverture de la superposition. Verrou CI :
`src/utils/__tests__/zoomTactile.lock.test.ts` (nom hors motif `figureZoom*`
exclu de la CI).

**Rappel** : après toute modification de `src/utils/figureZoomRuntime.ts`, il
faut **régénérer** les 26 documents servis, sinon le verrou « le HTML servi
est à jour vis-à-vis de la source du runtime » passe rouge :
```
npx tsx scripts/tools/applyFigureZoom.ts
```
(les fichiers `public/lessons/*.html` et `public/miftah.html` sont **protégés** :
jamais de modification manuelle).

## Conventions de test


- `@testing-library/jest-dom` **n'est pas câblé** : `.toBeTruthy()`, `.toBeNull()`,
  `.toHaveLength()` ; appeler `cleanup()` explicitement.
- vitest inclut `src/**/*.test.{ts,tsx}` et `server/**/*.test.ts`, exclut `src/build/**`
  (contrôles post-build, lancés par `test:build`).
- jest exclut 8 suites (vi.mock non hoisté, top-level await) : couvertes par vitest seul.
- Les tests `skipIf` (SQLite, fixtures locales, copies élèves) sont **ignorés** quand
  leurs prérequis manquent — ignoré ≠ vert.
- Un verrou qui asserte sur le rendu d'un composant `lazy()` pré-importe le module
  avant `render()` (cf. piège `lazy()` ci-dessus, constat 2026-11-06).
- Verrous de rendu (`data-testid`) : poser le testid sur la **valeur** affichée,
  pas seulement le conteneur — convention `${testid}-valeur` pour la valeur
  numérique (ex. pastilles `StatsView` du lot 🔴 2026-11-07). Un testid qui
  survit à un changement de présentation importe peu ; un testid qui fige la
  valeur protège contre une régression de calcul muette.
- Tout test temporel ou SM-2 (SRS, séries, phases) stocke ses données **relativement
  à `Date.now()`** (jamais de dates absolues) : sinon le test se pésera dans le
  temps ou deviendra rouge selon le fuseau. Constat des verrous `bilanSrs` /
  `activiteQuotidienne` (lot 🔴 2026-11-07).
- Pour les composants lourds à rendre (canvas, `StatsView`, vue intégrale), un
  **verrou source-scan** (`readFileSync` du source + `toContain`) fige le câblage
  sans monter le composant — modèle `tc2Brancher` / `porteMethode`. Exemples
  : `statsJoursSerieux.lock.test.ts` (4 tests source-scan) et
  `statsErreursPassives.lock.test.ts` (fige aussi le seuil ≥ 2 mot pour mot).
  Toujours le combiner avec au moins un test de rendu jsdom : le scan seul ne
  prouve pas que le code compile et s'exécute.
- Les suites `figureZoom*` (travail concurrent) sont exclues de la CI ; ne pas y toucher.

## CI (`.github/workflows/ci.yml`, push/PR sur `master`, Node 22)

Jobs : `check:v2` · `npm test` · vitest (sans figureZoom*) · jest (config CI) ·
lint + build + `buildBudgets.mjs` + `test:build`.
