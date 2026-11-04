# 🔍 Analyse « ligne par ligne » du dépôt `Rebrique-sujet-BAC`

**Date** : 2026-09-12 · **Branche** : `arena/01a096cc-rebrique-sujet-bac` (HEAD `e8f8f7f`)
**Objet** : lecture intégrale du code, de la donnée, des scripts, des tests et de la documentation, avec vérifications exécutées (tests, build, lint, typecheck, format, statuts P1/P2/P3, release).

---

## 0. Résumé exécutif

Le dépôt est une **PWA d'entraînement méthodologique au BAC algérien SVT** (arabe, RTL), architecturée proprement (séparation `domain` / `application` / `ui` / `services`, chargement paresseux des données par année, build déterministe, service worker borné). La rigueur documentaire est inhabituelle : chaque affirmation de couverture est traçable, et le produit **refuse volontairement d'afficher une note** tant qu'une calibration humaine n'existe pas.

**État mécanique constaté (reproductible)**

| Vérification                | Résultat                                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| `npm test`                  | ✅ **257 tests · 256 passent · 0 échec · 1 skippé** (35 s)                                     |
| `npm run build`             | ✅ déterministe : `sha256 9387190ec97e…` identique sur 2 exécutions, build `f54ac619b7a2`      |
| `npm run release:verify`    | ✅ `dist/site` 136 fichiers, empreintes conformes                                              |
| `npm run lint`              | ✅ 0 erreur                                                                                    |
| `npm run typecheck`         | ❌ **1 erreur** : `js/services/speech-recognition.js:66`                                       |
| `npm run format:check`      | ❌ **13 fichiers** non conformes à Prettier                                                    |
| `npm run docs:check`        | ❌ métriques README périmées (corrigé pendant l'analyse, voir §7)                              |
| `npm run p1:status`         | ⚠️ **3/6** (P1.1, P1.2, P1.5 bloqués)                                                          |
| `npm run p2:status`         | ⚠️ **6/7** (P2.7 = 0/5 élèves réels)                                                           |
| `npm run p3:status`         | ✅ **6/6**                                                                                     |
| `npm run coverage:official` | ⚠️ **38 sujets · 0 éligible à la simulation · 1 seul inventaire (2025/S1, partiel, 2 tâches)** |

> **Le point le plus important : la CI (`.github/workflows/quality.yml`) enchaîne `lint → typecheck → format:check → test → build → e2e`. `typecheck` et `format:check` échouent sur ce HEAD : la CI est donc rouge avant même les tests**, alors que le code lui-même est sain et testé vert.

---

## 1. Méthode

1. Inventaire complet (312 fichiers, `git ls-files`, tailles, LOC).
2. Lecture intégrale, avec numéros de ligne, de : `index.html`, `js/**` (8 077 LOC), `data/**` (11 613 LOC dont 10 439 de payloads d'années), `build.mjs`, `server.mjs`, `sw.js`, `scripts/**` (2 659 LOC), `tests/**` (5 652 LOC), `docs/**`, `patches/**`, `.github/**`.
3. Exécution de toutes les commandes du `package.json` (tableau ci-dessus) + `npm ci` (184 paquets, Node 22.22.3).
4. Analyse **programmatique** des 19 payloads d'années (408 pôles) plutôt qu'une lecture naïve : cohérence des points, provenance des consignes, présence des règles, champs vides.
5. Sondages ciblés du moteur de notation (exécution réelle d'`evaluateText` sur la règle de démonstration) pour vérifier les heuristiques plutôt que les commentaires.

Aucune modification de code n'a été faite, **à l'exception d'une ligne de métrique README** régénérée par `npm run docs:update` (462 → 461 lignes) — voir §7.1. Les répertoires `dist/` et `node_modules/` sont gitignorés.

---

## 2. Chiffres du dépôt

```
312 fichiers suivis
  js/          8 077 LOC  (38 modules ES, zéro dépendance runtime, zéro CDN)
  data/       11 613 LOC  (dont 10 439 = 19 payloads année, 1 174 = catalogue + règles)
  tests/       5 652 LOC  (42 fichiers : 39 *.test.mjs + 3 spec Playwright)
  scripts/     2 659 LOC  (14 outils Node)
  assets/styles.css  1 764 lignes, 170 classes, 4 thèmes (dark/light/contrast + clé `dataset.theme`)
  subjects/       59 PDF suivis par git → 42 Mo (dont subjects/manifest.json)
  _v1_backup/  1 355 lignes (ancien monolithe conservé)
  docs/        14 fichiers Markdown
  patches/     7 fichiers (historique, tous déjà appliqués)
  Un patch racine : 01a07c55-65b0-7317-af13-bd3460834d72.patch (366 Ko, suivi par git)
```

**Contenu pédagogique réel (mesuré, pas déclaré)**

| Métrique                                 | Valeur                                                                                               |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Années chargées à la demande             | **19** (SE 2013–2020 + 2022–2026 = 13 ; Maths 2021–2026 = 6)                                         |
| Sujets                                   | 38 (2 par année)                                                                                     |
| Pôles N/S/E/W                            | **408** (SE : 24/année ; Maths : 16/année)                                                           |
| Pôles `bacPromptSource: "official"`      | **149** (86 SE + 63 M) — = `CALIBRATION_STATUS.activePoles` ✅                                       |
| Pôles `reconstructed`                    | 259                                                                                                  |
| Points par année                         | 40 (2 sujets × 20) ; **somme des points des pôles = somme des `exercise.max` pour les 19 années** ✅ |
| Pôles sans `rule.keywords`               | **0**                                                                                                |
| Pôles sans `modelAnswer` / sans `prompt` | **0** (0 anomalie détectée)                                                                          |
| Exercices type `pipeline`                | 1 (année 2025)                                                                                       |
| Copies réelles doublement annotées       | **0** (`tests/hard-benchmark/cases.json` = `{ "cases": [] }`)                                        |

---

## 3. Architecture et flux

### 3.1 Graphe d'exécution

```
index.html
  └─ js/app-version.js   (script global : APP_BUILD_ID + APP_ASSET_REVISIONS, généré)
  └─ js/main.js (module)
       ├─ services/diagnostics.js  (initializeOperationalObservability)
       ├─ enregistre ./sw.js (sauf en file://)
       └─ ui.js → init()
            ├─ store.load()  → migrations v1→v5 + validation + réconciliation minuteurs
            ├─ mountOperationalStatus() / ensureLiveRegions() / bindDiagnosticAnnouncements()
            ├─ restauration d'écran (hub | guide | strategy | workspace) selon l'état persisté
            └─ câblage des 4 écrans : hub → guide → strategy → workspace
```

Le **graphe d'imports statiques** s'arrête à `js/ui.js` ; les données d'années ne sont jamais importées statiquement (`data/subjects.js:209-229` : chargeurs littéraux `() => import("./years/...")`). C'est la garantie testée par `tests/lazy-loading.test.mjs` (`loadedYearIds()` est `[]` au démarrage).

### 3.2 Couches

| Couche              | Rôle                                                                                        | Fichiers    |
| ------------------- | ------------------------------------------------------------------------------------------- | ----------- |
| `js/domain/**`      | règles pures, sans DOM : évaluation de texte, pipeline, méthode, couverture officielle      | 7 modules   |
| `js/application/**` | minuteurs, démarrage de session                                                             | 2 modules   |
| `js/services/**`    | audio WebAudio, dictée Web Speech, diagnostics locaux                                       | 3 modules   |
| `js/ui/**`          | tout le DOM : infra, 4 écrans, workspace, entraînement                                      | 22 modules  |
| `data/**`           | catalogue, 19 payloads, inventaires officiels, politique de calibration, archive, brouillon | 30 fichiers |

Séparation respectée dans les faits : **aucun `document`/`window` dans `js/domain/**`** (vérifié), et le seul accès DOM centralisé passe par `js/ui/dom.js`.

---

## 4. Lecture ligne par ligne

### 4.1 `index.html` (33 lignes)

- `lang="ar" dir="rtl"`, `theme-color`, skip-link `href="#main-content"`, `<main id="main-content" tabindex="-1">`.
- **4 conteneurs d'écran** : `view-hub`, `view-guide`, `view-strategy`, `view-workspace` (lignes 21-24). Le README annonce un « parcours en 5 étapes » (ligne 15) : il s'agit de 5 _étapes de parcours_ pour 4 _vues_, la 3ᵉ (entraînement) vivant dans un `<details>` du hub (`js/ui/training.js:346`). Ambiguïté documentaire mineure.
- Icônes révisionnées `?v=d06847e34102` / `?v=48ad8ebbee47` : **cohérentes** avec `js/app-version.js` et `manifest.webmanifest` (générés par `scripts/generate-pwa-version.mjs:71-91`).
- Aucun CDN, aucun `style=` inline (contrainte CSP, testée par `tests/security-baseline.test.mjs:52-63`).

### 4.2 `js/main.js` (20 lignes)

Initialise l'observabilité **avant** tout (l.7), n'enregistre le service worker que si le protocole n'est pas `file:` (l.10 — nécessaire pour le standalone), et route toute erreur d'`init()` vers `reportDiagnostic("application.init", …)` (l.19). Rien à redire.

### 4.3 `js/ui.js` (461 lignes) — façade d'orchestration

- **L.39-45** : `POLE` = unique source de vérité des libellés/couleurs N/S/E/W ; `POLE_ORDER`.
- **L.65-70** : `escapeHTML` — frontière d'échappement unique, documentée (« toute valeur issue de localStorage ou de l'utilisateur doit passer par ici »). Utilisée correctement dans `brouillon.js:71-80`.
- **L.100-117** : toasts avec `role=alert|status`, `aria-atomic`.
- **L.121-126** : `trainingLimitHTML()` — bandeau d'honnêteté (« pas de note numérique avant calibration »).
- **L.128-137** : thème persisté `boussole4d.theme`, whitelist `dark|light|contrast`.
- **L.143-165** : boutons micro + modale de consentement **avant** la demande de permission navigateur (bonne pratique vie privée).
- **L.167-194** : table `ADKAR` (6 invocations) — contenu religieux, interpolé dans `adkarHTML()` ; valeurs **statiques**, donc pas de risque XSS.
- **L.249-259** : `startSession` composé par injection de dépendances (`application/subject-session.js`).
- **L.307-344** : `createWorkspaceController` reçoit **26 dépendances** en objet — verbeux mais testable ; c'est le prix assumé du style « factory + DI ».
- **L.346-459** : `init()`. Points notables :
  - **L.377-392** : `timers.onChange` — à l'expiration du temps global, si l'élève est sur le workspace, `workspaceController.handleSessionCompletion("time-expired")`, sinon retour au hub.
  - **L.404-458** : restauration après rechargement, avec **règle métier explicite** : l'horloge d'examen ne redémarre que si l'écran restauré est le workspace (L.428-436). Le guide et la stratégie ne débitent jamais le temps officiel (correctif #60 documenté dans `CONTINUATION.md`).
  - **L.437-452** : relecture de simulation (`completed` + `simulation` + `view-workspace`) restaurée séparément.

⚠️ **L.101-117 + L.394-402** : la zone de toasts est créée **après** le premier usage possible de `toast()` (L.389) — dans ce chemin précis (`timers.onChange` pendant `init`), `toast()` sort silencieusement car `#toast-zone` n'existe pas encore. **Bug latent de perte de notification** (bénin mais réel).

### 4.4 `js/store.js` (493 lignes) — état et persistance

Point fort du dépôt.

- **L.7-15** : clé `boussole4d.v4`, schéma courant **v5**, patterns `YEAR_ID_PATTERN`, `SESSION_MODES`, `SCREENS`, `SESSION_STATUSES`.
- **L.22-36** `emptyExercise()` : `scores`, `text`, `scratch`, `fields`, `officialTaskAnswers`, `freeAnswer`, `pipeline{stream1, stream2}` (4 slots chacun).
- **L.68-100** `sanitizeExercise` : **whitelist stricte**. Les clés `officialTaskAnswers` sont filtrées par `/^\d{4}(?:-[a-z]{1,3})?-S\d+-E\d+-Q\d+$/` (L.85) — c'est précisément ce qui a causé le bug #73 (clés `BAC-S?-E?` perdues).
- **L.121-196** `migrateState` : v1/v2/v3 → v5, v4 → v5 avec **récupération** des anciennes clés `BAC-S\d+-E\d+` vers `freeAnswer` concaténé (L.144-189) — migration défensive bien pensée, jamais destructive.
- **L.198-258** `validateState` : clamp de chaque champ (`asFiniteNumber`), `reviewMode` forcé à `true` si `sessionStatus === "completed"` (L.227), durée inférée pour la filière maths (`150 min`, L.232).
- **L.260-266** `backupMalformed` : sauvegarde de l'état corrompu sous `boussole4d.v4.corrupt-<ts>` avant de repartir d'un état sain.
- **L.334-351** `_reconcileTimers` : rattrapage du temps écoulé hors ligne (basé sur `Date.now`, pas sur un `setInterval`).
- **L.384-411** `enterSession` / **L.412-428** `activateSubjectMode` : en mode `simulation`, l'horloge est **remise à la durée complète** au moment du choix du sujet (L.421-425) — la stratégie (25 min) ne compte pas.
- **L.447-453** `setReviewMode` : **lève une exception** si on tente la relecture pendant une simulation active (garde métier dans le store, pas seulement dans l'UI).

Aucune faille trouvée. Le store est la partie la plus solide du projet.

### 4.5 `js/engine.js` (27 lignes) + `js/domain/evaluation/**`

`engine.js` n'est qu'une **façade de ré-export** (stable API) : `evaluateText`, `scoreBac`, `evaluatePipeline`, `timers`, `soundEngine`.

#### `text-evaluator.js` (236 lignes) — orchestration du score

- **L.42-69** : réponse vide → objet complet à zéros (jamais `undefined`).
- **L.71-108** : enchaînement `inferTaskSignals → deriveTaskProfile → analyzeSentenceStructure → matchConcept (keywords / forbidden) → evaluateMethodology → evaluateScience/Document/Artifact/Hypotheses/Closing/Technique/Rubric`.
- **L.115-133** : pondération `content / methodology / richness` selon le profil, puis modulation par la longueur (`0.55 + 0.45 * lengthRatio`).
- **L.135-156** : pénalités multiplicatives en cascade (document, artifact, hypothèses, technique, clôture, `هذا يدل` sans `مما يدل`, erreurs scientifiques plafonnées à 0,45).
- **L.176-195** `allowPerfect` : **⚠️ point faible**. La condition `hits >= req` (L.189) est vraie quand `req === 0`, c'est-à-dire **quand la règle n'a aucun mot-clé**. Une règle sans `keywords` peut donc obtenir `fraction = 1`. Vérifié expérimentalement sur `DEMO_RULE` : `fraction(avant) = 0`, `fraction(après) = 1` avec `hits = 0`. Les 408 pôles réels ont tous des mots-clés (mesuré), donc **l'impact est aujourd'hui nul en production**, mais la garde est fragile : un futur pôle sans `keywords` noterait 20/20 n'importe quoi. Correctif suggéré : `hits > 0 && hits >= req`.
- **L.227-236** : `scoreFromFraction` (arrondi 0,01) et `scoreBac` (arrondi au quart de point, comme le barème BAC).

#### `text-analysis.js` (771 lignes) — le cœur linguistique

- **L.70-147** : stop-words arabes ; **L.149-187** : `POLE_MARKERS` (mots-clés primaires/secondaires par pôle).
- **L.189-199** `stemArabicToken` : suffixeur/lemmatiseur maison avec seuils de longueur commentés (cas `ماء` vs `ما` explicitement protégé, L.195-197).
- **L.244-294** `CONCEPT_ALIASES` : 30 entrées de synonymes/pluriels brisés, **chacune annotée de l'année/sujet d'origine** (« 2023/S1/E1 (N,S,W) ») — traçabilité exemplaire.
- **L.303-338** `matchConcept` : correspondance exacte → inclusion → racine avec fenêtre d'inflexion **+1 à +3 caractères** (correctif #66 : « بروت » n'attrape plus « بروتوكول »).
- **L.341-394** `analyzeSentenceStructure` : heuristique verbe arabe = préfixe `أ/ي/ت/ن` + (suffixe verbal **ou** absence de finale nominale `ة/ى/ا`), mots ≥ 4 lettres (correctif #67).
- **L.396-544** `inferTaskSignals` : 36 signaux dérivés de la consigne (verbes d'ouverture, présence de document, variables, hypothèse, texte scientifique, graphe, traduction…).
- **L.556-761** `deriveTaskProfile` : **25 profils** (scientific-text, problem, variables, relation, naming, definition, description, classification, listing, distinction, comparison, critique, validation, discussion, commentary, extraction, analysis-explanation, technique-why, extra-info, graph-build, translation, importance, justification, hypothesis, analysis, explanation, synthesis), en cascade ordonnée.

#### `methodology.js` (1 117 lignes) — le plus gros module

- **L.24-257** : ~40 détecteurs booléens (`usesObservationVerb`, `hasDocumentIntro`, `usesCausal`, `usesMechanism`, `hasPros/hasCons`, `hasRelationPhrase`…).
- **L.264-272** : helper `check(ok, okMsg, failMsg)` qui accumule `strengths` / `missing`.
- **L.274-1077** : **23 branches `if (resolvedTaskProfile.id === …)`** terminées par **28 blocs `return` identiques** (L.295-303, 322-330, 349-357, …) :

  ```js
  return { score: total ? passed / total : 0, strengths, missing,
           summary: …, taskType: …, taskLabel: …, taskMode: … };
  ```

  **~280 lignes de duplication pure.** Un unique `return` en fin de fonction, précédé d'un `switch`/table de règles, diviserait la taille par trois et supprimerait la classe d'erreur « j'ai modifié une branche mais pas les 27 autres ».

- **L.919-941** : branche `!meta` (pôle inconnu) — **seule** à utiliser un score par défaut `0.35` au lieu de `0` (L.933). Incohérence discrète mais volontaire ? À documenter.
- **L.1079-1117** `getPoleWeights` : pondérations par profil + fallback par pôle.

#### `quality-checks.js` (308 lignes)

`evaluateScience` (L.10-64, pénalité douce `max(0.1, 1 - 0.25n)` — correctif #65), `evaluateDocument` (L.66-149, comparaisons/tendances/valeurs/axes/relations/cellules), `evaluateArtifact` (L.151-199, schéma/équation), `evaluateHypotheses` (L.201-228), `evaluateClosingCover` (L.230-238), `evaluateTechnique` (L.240-259), `evaluateAnalysisRubric` (L.261-292, 4 étapes à 0,25), `buildProfessorVerdict` (L.294-306, 4 paliers de formulation).

⚠️ **L.308** : commentaire orphelin `/* ---------- Évaluation d'un champ de texte (pôles N/S/E/W) ---------- */` en fin de fichier — vestige d'un découpage antérieur.
⚠️ **L.138** : regex `يرتفع المنحني|…المنحني ينخفض` : n'intercepte que la graphie **sans** hamza (`المنحني`) ; la variante `المنحنى` (très courante) passe à travers. À harmoniser avec `method-scripts.js:188` qui a le même biais.

#### `pipeline-evaluator.js` (52 lignes)

Score de placement des blocs : exact = 1, bon flux mauvais rang = 0,5, mauvais flux = 0 (L.29-39). Simple et correct.

### 4.6 `js/domain/method/gates.js` (299 lignes) — les deux décisions

- **L.16-73** : termes de document, marqueurs mémoire, verbes « image » (وصف) et « film » (تفسير).
- **L.84-113** `classifyInstruction` : sans document → `memory` (`1 → 4`) ; avec document → `film` (`1→2→3→4`) ou `image` (`1→2→4`), avec priorité `film` si les deux apparaissent (L.103, justifié L.80-81).
- **L.116-214** `DRILL_BANK` : **16 consignes réelles** annotées (source + gate2 + note pédagogique).
- **L.229-298** `createDrillEngine` : machine à états explicite `idle → gate1 → (gate2) → done`, round de 12 (`shuffle` injectable, `rand` injectable → testable sans aléa).

### 4.7 `js/method-scripts.js` (304 lignes)

25 canevas méthodologiques (`analysis`, `explanation`, `hypothesis`, `scientific-text`, …) + `scriptFor()` + `evaluateMethodCoach()` (L.172-303) : 12 familles de conseils contextuels avec `flags` (dont `maybe-word`, qui déclenche une pénalité ×0,75 dans `text-evaluator.js:166-168`). Contenu « conseil » uniquement, **sans effet sur le barème** comme annoncé (L.4-5).

### 4.8 `js/application/**`

- **timers.js (69 L.)** : deux minuteurs `setInterval(…, 1000)` mais **delta horodaté** (`Date.now() - lastTick`) → pas de dérive (correctif #63). `stopAll()` ne remet pas `globalLastTick` à `null` (contrairement à `stopStrategy`) : sans conséquence car `_tick` recalcule depuis `lastTick` à chaque reprise — mais `store._reconcileTimers` (L.336) s'appuie sur `sessionActive`, qui est remis à `false` par `_complete` : cohérent.
- **subject-session.js (53 L.)** : charge l'année (cache ou `import()`), entre en session, **n'affiche pas** la barre de temps (L.32) et ne démarre **pas** l'horloge globale (correctif #60).

### 4.9 `js/services/**`

- **diagnostics.js (196 L.)** : compteurs locaux, **aucune donnée transmise**. `ALLOWED_SCOPES` (20 entrées, L.11-31) et `ALLOWED_ERROR_NAMES` (11, L.32-43) : toute valeur hors whitelist est repliée sur `"application"` / `"other-error"`. Le 3ᵉ argument de `reportDiagnostic` est **accepté puis ignoré** (`_discardedContext`, L.87-92) — bon réflexe de confidentialité.
- **sound-engine.js (165 L.)** : pluie/vagues/battements binauraux en WebAudio, `master` gain déconnecté au changement de mode (correctif #50, L.44). ⚠️ `oscL/oscR` (L.150-164) alimentent un `ChannelMerger` — **le correctif #51 (Safari : séparation stéréo réelle via `StereoPannerNode`) reste à faire**.
- **speech-recognition.js (103 L.)** : `ar-SA` puis `ar-EG` puis `ar` (L.77, correctif #52), insertion au caret (L.42-53, correctif #53). ⚠️ **L.66-81** : `tryStart(lang)` est appelé en boucle **sans attendre `onend`** : la garde anti-`InvalidStateError` (bug #54 listé dans `CONTINUATION.md`) n'est toujours pas implémentée ; `this.stop()` (L.23) est appelé avant, ce qui rend la course possible. ⚠️ **L.66** : `(lang) =>` sans annotation → **c'est l'unique erreur `tsc` du projet**.

### 4.10 `js/ui/**`

**Infrastructure**

- `dom.js` (35 L.) : `node()` (création typée, `textContent` par défaut), `replaceContent`, `appendText` (**non utilisé**), `setInternalHTML` (frontière « templates applicatifs uniquement »), `elementFromInternalHTML`.
  ⚠️ `setInternalHTML` ne **sanitize pas** : ce n'est pas un bug en soi (contrat documenté : jamais de contenu utilisateur), mais `atlas.js:79` et `training.js:136/155/252` écrivent en `innerHTML` — toutes ces valeurs sont applicatives, sauf **la requête de recherche de l'atlas** qui n'est jamais réinjectée (bien).
- `dialogs.js` (153 L.) : modales/tiroirs avec `inert` + `aria-hidden` sur tout le reste du `body` (`isolateDialog`, L.17-29), piège de focus `Tab/Shift+Tab` (L.44-65), `Escape`, retour de focus (L.37), compteur d'IDs unique. **Modèle d'accessibilité solide.**
- `navigation.js` (24 L.) : `showScreen` masque tout, cible, notifie, `scrollTo`.
- `accessibility.js` (134 L.) : 2 régions live, annonce de changement d'écran (L.43-69), **association automatique label↔champ** pour tout `input/textarea/select` orphelin (L.78-118), messages d'erreur arabisés par famille de code (L.120-127).
- `operational-status.js` (36 L.) : badge build + connectivité, écoute `miftah:operational-status`.
- `coverage-messages.js` (16 L.) : 9 libellés de blocage de simulation.

⚠️ **Duplication** : `coverage-messages.js` et `strategy.js:157-171` définissent **deux fois** la même table de libellés (`simulationBlockersArabic` vs `simulationGuardArabic`) — 10 lignes dupliquées, risque de divergence.

**Écrans**

- `guide.js` (63 L.) : écran de calme (respiration + 4 étapes + invocations + durée officielle). Volontairement dépouillé.
- `hub.js` (328 L.) : filière persistée (`boussole4d.stream`, cycle `se → m → tm`), cartes « entraînement » (depuis `APP_CONFIG.years`) + cartes « consultation » (depuis `data/archive.js`), section repliée d'entraînement, démo et atlas injectés **à la fin** de la section (L.156-175).
  ⚠️ **L.159** : `insertAdjacentHTML` —唯一 endroit où du HTML est injecté en dehors de `setInternalHTML` ; contenu statique, donc acceptable, mais contourne la frontière documentée.
  ⚠️ **L.138-151** : le clic désactive le bouton et le remet en état **seulement si `startSession` renvoie falsy** — correct ; mais `button.textContent` est sauvegardé **après** le premier rendu : si deux clics rapides arrivent, `label` capture « جارٍ تحميل السنة… ». Le bouton étant `disabled`, le risque est théorique.
- `strategy.js` (252 L.) : aperçu PDF (lien externe dzexams, jamais de redistribution — L.33-59), estimation personnelle par exercice (L.124-155), recommandation comparative (L.198-224), **garde de simulation** (L.226-249).
  ⚠️ **L.244-246** : `if (mode === "training" || mode === "simulation") { timers.startGlobal(); }` — **condition tautologique** (les deux seules valeurs possibles, validées en amont L.231 et `store.activateSubjectMode` L.414). Les deux branches du commentaire (L.242-243) sont donc en réalité identiques : l'horloge démarre dans les deux cas, ce que le commentaire laisse croire différent.
  ⚠️ **L.130** : `initial = Math.round(exercise.max * 0.75 * 4) / 4` — pré-remplit l'estimation à 75 % du maximum. Biais d'ancrage discutable pour un outil censé aider à choisir, mais assumé.
- `simulation.js` (325 L.) : mode examen « silencieux » (aucun indice ni modèle pendant l'épreuve), restitution `data-task-answer` (L.128-148), évaluation **qualitative** par longueur (`qualitativeLabel`, L.150-156 — heuristique assumée, sans note), verrouillage après remise (`disabled`, L.59), relecture `taskReviewHTML` (L.17-37) qui affiche des « références d'entraînement » en précisant qu'elles ne sont pas un corrigé officiel.
  ⚠️ **L.216-224** : `if (!inventory || !report.simulationEligible) { renderBacReadingMode(subject); return; }` — la simulation dégénère silencieusement en « mode lecture BAC ». Comportement défendable (filet de sécurité), mais **le bouton étant déjà désactivé en amont** (`strategy.js:133`), ce chemin n'est atteignable que par restauration d'état ou manipulation : l'utilisateur qui croyait démarrer une simulation se retrouve dans un autre mode **sans message d'explication** (contrairement à `denyInvalidSimulation`, L.279-284, qui alerte bien).
  ⚠️ **L.195** : en mode lecture, un lien `download` du PDF local est proposé — alors que `strategy.js:34-36` affirme qu'« un lien de téléchargement direct n'est jamais présenté ». **Contre-dit entre deux écrans** (le contexte diffère : lecture vs aperçu, mais la règle mériterait d'être écrite une fois).

**Workspace (`screens/workspace.js`, 667 L.)**

- L.96-169 : rendu complet (en-tête, outils, barre de progression, aide méthodologique repliée, aside exercices + stepnav, contenu).
- L.183-196 : aiguillage `ui === "pipeline"` vs texte.
- L.202-234 : panneau par pôle, avec `<details>` d'aide (`توجيه هذه الخطوة`) fermé par défaut, `bacPrompt` prioritaire sur `prompt` (L.209), provenance (`provenanceHTML`), chip de décision, vérification rapide, champ `textarea` si `minLength >= 100` sinon `input` (L.221-223).
- L.258-285 `checkText` : construit la règle via `textEvaluationRule`, évalue, **n'enregistre le score que si `canScorePole`** (L.273-274) — c'est-à-dire jamais en l'état actuel de la calibration.
- L.440-483 `checkPipelinePole` : pour N/S/E, concatène les champs `PIPELINE_FIELDS` et évalue comme du texte ; pour W, évalue le placement des blocs.
- L.485-515 : navigation de pas + `levelWord` (ممتاز/جيد/متوسط/ضعيف).
- L.542-566 `applySessionLock` : désactive tous les contrôles une fois la session terminée + bandeau d'information.
- L.568-620 : modale de fin + `handleSessionCompletion` (délègue à la simulation si `sessionMode === "simulation"`).

⚠️ **L.284 vs L.287** : `goToSuccessStep(exNum)` est appelé avec un argument, mais `function goToSuccessStep()` n'en déclare aucun — l'argument est ignoré. Signature trompeuse.
⚠️ **L.517-520** : `updateLiveScore()` ne fait plus qu'appeler `exDef(...)` sans utiliser le résultat — **fonction devenue vide** (le score a été retiré de l'en-tête par design). Trois appels (L.167, L.278, L.482) pour rien.
⚠️ **L.629-645** : `confirmReset()` (réinitialisation totale) est définie **mais jamais câblée à un bouton** : `store.reset()` est donc inaccessible depuis l'UI. Le test `ui.test.mjs` n°246 le reconnaît explicitement (« تصفير n'est plus exposé dans la copie ; le reset reste couvert au niveau store »).

**Modules du workspace**

- `brouillon.js` (159 L.) : feuille de brouillon 4 pôles + zone libre, `brouillonPreflight` (3 contrôles méthodologiques, L.18-41), insertion **en ajout** si le champ est déjà rempli (L.150, correctif #71), échappement systématique (L.71-80), blocage si le pré-contrôle échoue (L.135-142).
  ⚠️ **L.53** : `detectVerb(pole.prompt) || detectVerb(pole.bacPrompt)` — `detectVerb` renvoie **toujours** un objet (`presentation.js:108` : fallback `verbRouting[0]`), la seconde moitié est morte.
  ⚠️ **L.54** : `activePole || verb.recommendedPole` — `activePole` est toujours une chaîne non vide : `verb.recommendedPole` n'est **jamais** utilisé. Le routage par verbe (`data/brouillon.js:277-343`) n'influence donc pas la recommandation affichée.
- `presentation.js` (133 L.) : provenance (officielle / décomposée / reconstruite, L.13-30), formatage du diagnostic (L.32-83), puce de décision, canevas méthodologique.
- `quick-check.js` (24 L.) : 4 items du « فحص رباعي معكوس », partagés avec la carte imprimable.
- `feedback.js` (16 L.) : `mayScorePole` (garde calibration) + `poleConfidence` (**utilisée seulement par `tests/archive-years.test.mjs`**).
- `pipeline-exercise.js` (13 L.) + `scratchpad.js` (11 L.) + `text-exercise.js` (17 L.) : micro-modules ; `restoreTextDrafts` (text-exercise.js:12) **n'est jamais appelé** (le workspace restaure lui-même L.244-254).
- `report-controller.js` (66 L.) + `reports/report.js` (33 L.) + `reports/exports.js` (44 L.) : **rapport d'entraînement, export CSV/JSON, impression — jamais instanciés dans l'application.** `createReportController` n'est importé que par `tests/workspace-modules.test.mjs`. Conséquence : `trainingLimitHTML()` (`ui.js:121`) n'a qu'un seul consommateur, un test. ~145 lignes et 3 modules morts (ou à recâbler — un bouton « 📊 تقرير » existait probablement avant le retrait des notes).

**Entraînement (`training.js`, 375 L.)**

- L.29-55 : carte « deux décisions » avec 4 exemples cliquables, verdict instantané.
- L.74-109 : carte « niveau avancé » (6 plis : ouvrez, structure, calcul, arbre généalogique, contrôle de clôture, phrase de secours).
- L.111-375 : contrôleur avec `html()` / `mount()` / `teardown()` ; drill : moteur injecté (`createDrillEngine`), minuteur ancré sur l'horloge (L.186-202, correctif #63), résumé, série persistée (`store.recordDrillRound`), déverrouillage à 3 séries parfaites (L.290-294), carte imprimable (`keycard.js`) avec `window.print()` et classe `keycard-printing` (L.327-340).
- ⚠️ **L.136, L.155, L.252** : écritures `innerHTML` directes — valeurs applicatives uniquement (OK), mais **contournent `setInternalHTML`**, ce qui affaiblit la règle « une seule frontière ».
- ⚠️ **L.366-367** : `bindOnce("#drill-start", startDrill)` est appelé dans `mount()` **et** dans `renderDrillIdle()` (L.176) : si le rendu d'attente est réaffiché après `mount`, le listener est **doublé** (deux démarrages de drill possibles). À vérifier en conditions réelles.

**`atlas.js` (96 L.)** : 4 techniques + verbes BAC + hypothèses + cartes mémoire, onglets `aria-pressed`, recherche filtrée.
**`keycard.js` (109 L.)** : carte imprimable A4 **générée depuis les mêmes sources** (`QUICK_CHECK_ITEMS`, `DRILL_ROUND_SIZE`, `DRILL_UNLOCK_STREAK`) — pas de duplication de contenu. ✅

### 4.11 `data/**`

- **`subjects.js` (303 L.)** : `normalizeArabic` (L.11-31), `stripArabicClitics` avec liste de radicaux protégés (L.37-75, correctif #68), `EXAM_MINUTES_BY_STREAM {se:270, m:150}` (L.77-80), `YEAR_CATALOG` 19 entrées (L.95-204), `YEAR_LOADERS` 19 chargeurs littéraux (L.209-229), `validateLoadedYear` (L.234-251 : id, stream, nombre de sujets, nombre d'exercices), `loadYear` avec promesse partagée (L.259-279).
  ⚠️ **L.38** : `"بكتيريا"` apparaît **deux fois** dans `PROTECTED_STEMS` (doublon inoffensif mais révélateur d'une liste non vérifiée).
  ⚠️ **Absence volontaire** : aucun chargeur pour `2021` SE (PDF chiffré) — cohérent avec `CONTINUATION.md` (« NOT created, deliberate ») et avec `data/archive.js` qui garde 2021 SE en consultation.
- **`official-tasks.js` (72 L.)** : **1 seul inventaire**, `2025/S1`, `status: "partial"`, 2 tâches, `scoringReviewStatus: "provisional"`, `documentReviewStatus: "reviewed"`, `verifiedAt: "2026-08-23"`. Mappings `trainingMappings` vers les pôles (Q1→S direct ; Q2→N/E/W decomposition). Le fichier documente lui-même que « the subject is not simulation-ready » (L.14-15).
- **`calibration-policy.js` (73 L.)** : 4 catégories obligatoires × pôle, 6 seuils (MAE ≤ 0,15 ; biais ≤ 0,05 ; FP/FN ≤ 0,10 ; inter-annotateurs ≤ 0,15 ; 15 copies/pôle). `assessCalibrationPromotion` **échoue fermé** (`reasons.length === 0`).
- **`calibration-status.js` (19 L.)** : généré — `copiesCompared: 0`, `activePoles: 149`, `calibrated: false`, 8 bloqueurs. `npm run calibration:check` → « Calibration status is current. » ✅
- **`usability-study.js` (6 L.)** : `{ requiredParticipants: 5, sessions: [] }` — vide, assumé.
- **`archive.js` (352 L.)** : 15 entrées de consultation (1 SE « 2021 », 14 Maths 2013–2026) + `gaps` documentés (pas de session exceptionnelle 2016 Maths ; pas de catégorie SVT pour تقني رياضي). Chaque entrée porte `page`, `contentVerified`, `attachments`, `viewer`, `notes` datées.
  ⚠️ **En-tête périmé (L.9-16)** : annonce « les 19 pages 2013–2020 ont été ouvertes » alors que le tableau ne contient **aucune** entrée SE 2013–2020, et cite des fichiers inexistants (`data/subjects-archive.js`, `data/year-2020-se.js`, `data/year-2026-se.js`). Le commentaire décrit l'état **avant** le découpage en `data/years/`.
- **`brouillon.js` (349 L.)** : feuille universelle 4 pôles (mission, invites, modèles de phrases, interdits, placeholder), 16 verbes BAC (famille, pôle attendu, piège), 7 packs de phrases, routage par verbes (4 routes avec `patterns`), zone libre.
- **`data/years/**` (10 439 L., 19 payloads)** : structure homogène — `id`, `stream`, `calendarYear`, `sujets[]` → `exercises[]` → `{ number, label, max, ui?, poles: {N,S,E,W} }`, chaque pôle portant `prompt`, `bacPrompt?`, `bacPromptSource` (`"official" | "reconstructed"`), `bacPromptPage?`, `points`, `minLength`, `placeholder`, `modelAnswer`, `rule{keywords, forbidden?, wrongConcepts?, document?, hypotheses?, schema?, equation?, technique?, causalOrder?, minHits?}`.
  **Contrôles automatisés passés sur les 408 pôles** : 0 pôle manquant, 0 `modelAnswer` manquant, 0 `prompt` manquant, 0 règle sans `keywords`, somme des points = `exercise.max` (19/19 années), points totaux = 40/année.

### 4.12 Infrastructure

**`scripts/lib/public-assets.mjs` (58 L.)** — définit la surface publique : `index.html`, `manifest.webmanifest`, `sw.js` + répertoires `assets/`, `js/`, `data/`, `legal/`, **`subjects/`**.
⚠️ **Contradiction frontale** : `build.mjs:5` affirme « PDFs are never bundled or redistributed ; students use external source links », alors que `subjects/` fait partie de la surface copiée → `dist/site` pèse **43 Mo dont 42 Mo de PDF (58 fichiers)**, et `server.mjs:31` sert `subjects/`. Le serveur de production sert donc bien des PDF tiers en local. **Ce n'est pas un bug fonctionnel** (les PDF sont dans le dépôt, la licence est documentée dans `docs/CONTENT_RIGHTS.md` / `LICENSE-CONTENT`), mais **le commentaire est faux** et le poids du livrable est à arbitrer.

**`generate-pwa-version.mjs` (59 L.)** : réécrit les `?v=` des icônes dans `index.html` **et** `manifest.webmanifest`, puis génère `js/app-version.js` (buildId = sha256 agrégé de tous les fichiers publics sauf le fichier généré lui-même, L.44-52). Boucle évitée proprement.

**`build.mjs` (118 L.)** :

1. vérifie que `APP_BUILD_ID` déclaré == buildId recalculé, sinon **échoue** (`Run npm run pwa:version`, L.26-32) ;
2. standalone `file://` : bundle IIFE esbuild + CSS/JS inlinés + **contrôle d'absence de toute référence externe** (L.63-74) ;
3. `dist/site` copié + `release.json` (schéma 1, `contentSha256` = digest des chemins+empreintes, liste triée).

**`verify-release.mjs` (67 L.)** : re-vérifie l'identité, l'unicité, le tri, l'exactitude des tailles/empreintes et la correspondance buildId ↔ `app-version.js`. ✅

**`server.mjs` (154 L.)** :

- `PUBLIC_FILES` / `PUBLIC_DIRECTORIES` (L.30-31) + `isPublicRoute` (L.34-42) rejetant `\`, `.`, `..`, segments vides ;
- double vérification `realpathSync` (L.80-98) : **symlink piégé impossible** ;
- `Range` **uniquement pour les PDF** (L.121-131), `Accept-Ranges: bytes`, `206` + `Content-Range` (correctif #62) ;
- CSP stricte (L.22-23) avec **`frame-ancestors 'self' https://*.e2b.app`** → compatible prévisualisation sandbox ; écoute `0.0.0.0:8080` ✅ ;
- `Permissions-Policy: microphone=(self)` (L.26) — cohérent avec la dictée.

**`sw.js` (226 L.)** :

- précache de **53 ressources shell** (liste L.21-75) — **vérifié** : elle couvre tout le graphe d'imports statiques de `main.js` ; les payloads d'années et les PDF en sont exclus ✅ ;
- runtime cache **limité à 12 entrées** (`RUNTIME_MAX_ENTRIES`, L.17), réservé au motif `/data/years/(se|m)/year-\d{4}.js` (L.87), uniquement réponses locales `200` de type `basic|default` (L.90-92), avec éviction LRU par `delete + put` (L.112-114) ;
- requêtes `Range` → `fetch(request)` direct (L.213-220, correctif #61) ;
- navigation hors ligne → `index.html` du cache + notification `offline-fallback` ;
- purge des anciens caches par buildId (L.171-184).

### 4.13 `scripts/**` (14 outils)

| Script                                                                                                                                        | Rôle                                                                                                                                                                                              | État                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `report-p1-status.mjs` (123 L.)                                                                                                               | 6 critères P1, à partir de la **réalité du code** (inventaires, gardes, lignes de `ui.js`/`workspace.js`, CSP, styles inline)                                                                     | 3/6                                                   |
| `report-p2-status.mjs` (258 L.)                                                                                                               | 7 critères P2, par **analyse de sources** (skip-link, `attemptSwitch`, absence de métaphores concurrentes, absence de copies françaises, `--dim`, e2e 200 %, cycle brouillon, étude utilisateurs) | 6/7                                                   |
| `report-p3-status.mjs` (128 L.)                                                                                                               | 6 critères P3 (payloads, shell, révisions SHA, runtime borné, observabilité, release déterministe)                                                                                                | 6/6                                                   |
| `update-doc-metrics.mjs` (81 L.)                                                                                                              | régénère le bloc `AUTO-METRICS` du README (tests déclarés, avec correction de la boucle `BENCHMARK_CASES`, L.28-34)                                                                               | périmé au départ                                      |
| `update-calibration-status.mjs` (40 L.)                                                                                                       | régénère `data/calibration-status.js` depuis `tests/hard-benchmark/calibration-report.mjs`                                                                                                        | ✅ à jour                                             |
| `audit-pdfs.mjs`, `extract-native-pdfs.mjs`, `extract-images.mjs`, `ocr-scan-pdf.mjs`, `pilot-extract-prompts.mjs`, `verify-archive-pdfs.mjs` | pipeline OCR / audit PDF (chantier P0 inachevé)                                                                                                                                                   | outils présents, pipeline non exécuté de bout en bout |
| `generate-archive-years.mjs` (1 417 L.)                                                                                                       | générateur one-shot des payloads 2013-2019                                                                                                                                                        | historique                                            |
| `report-official-coverage.mjs` (39 L.)                                                                                                        | tableau des 38 sujets                                                                                                                                                                             | 0 éligible                                            |

⚠️ **Nature des preuves P1/P2** : elles sont obtenues par **recherche de chaînes dans les sources** (`read(...).includes(...)`). Solides pour détecter une régression de suppression, **aveugles à la correction du comportement** : `P1.4` est « vrai » parce que `js/store.js` contient `"training", "simulation"` et que `simulation.js` contient deux identifiants de bandeau — pas parce qu'un test fonctionnel le démontre. À garder en tête avant de considérer ces statuts comme des preuves d'audit.

### 4.14 `tests/**` (5 652 LOC, 257 tests)

- **39 fichiers `*.test.mjs`** (Node test runner, jsdom) : `ui.test.mjs` (403 L., le plus gros, couvre le parcours complet), `engine.test.mjs`, `engine-2024.test.mjs`, `engine-synthetic.test.mjs`, `bac-benchmark.test.mjs` (boucle sur `BENCHMARK_CASES`), `hard-benchmark.test.mjs` (368 L., calibration), `data-integrity.test.mjs`, `data-selfcheck.test.mjs`, `archive.test.mjs`, `store.test.mjs`, `service-worker*.test.mjs`, `security-baseline.test.mjs`, `accessibility.test.mjs`, `contrast.test.mjs`, `p1/p2-status.test.mjs`, `official-coverage.test.mjs`, `brouillon.test.mjs`, `keycard.test.mjs`, `gates-drill.test.mjs`, `method-coach.test.mjs`, `all-buttons.test.mjs`, `lazy-loading.test.mjs`, `server.test.mjs`, `build.test.mjs`, `workspace-modules.test.mjs`, `simulation-mode.test.mjs`, `exam-isolation.test.mjs`, `observability.test.mjs`, `timeout-ui.test.mjs`, `dialogs-accessibility.test.mjs`, `analysis-grid.test.mjs`, `demo-diagnostic.test.mjs`, `archive-years.test.mjs`, `p2-language.test.mjs`.
- **3 specs Playwright** : responsive (3 viewports réels, zéro débordement horizontal), accessibilité clavier/focus, PWA hors ligne (shell + année mise en cache, message clair pour une année jamais ouverte).
- **Hard benchmark** : `cases.json` = `{ "cases": [] }`, `audit-manifest.json` = `{ "version": 1, "records": [] }` → **0 copie réelle**, comme annoncé partout. Les scripts de calibration produisent donc un rapport « à zéro » (`activePoles: 149`, `coveredPoles: 0`) qui alimente `CALIBRATION_STATUS`. La boucle d'honnêteté est fermée et cohérente.
- ⚠️ `tests/security-baseline.test.mjs` **et** `scripts/report-p1-status.mjs` font le même contrôle « pas de style inline » — duplication assumée(preuve + garde-fou).
- ⚠️ `ui.test.mjs:246` entérine qu'une fonctionnalité (reset) n'est plus accessible : un test qui **documente une régression d'UI** plutôt que de la corriger.

### 4.15 Documentation et habillage

- `README.md` (46 Ko) : positionnement honnête, mapping fiche MIFTAH ↔ modules ↔ tests (tableau), architecture, statuts, limites, hors-périmètre assumé (colonne « المصحح » de la fiche : aucun barème officiel → exclu).
- `docs/` : 14 documents (déploiement/rollback, confidentialité, mentions légales, droits de contenu, protocoles d'accessibilité et d'utilisabilité, exigences de preuve P1, plan de remédiation, checklist de relecture 2022/2024, passation Antigravity, test 5 minutes).
- `patches/` : 7 fichiers, **tous déjà appliqués** (`INDEX.md` l'indique) ; `patches/README.md` précise que `git apply` échouera proprement.
- `.github/` : workflow `quality.yml` (7 étapes) + 2 notes d'issue/PR expliquant l'élargissement à `main, arena/**` (résolu).
- `_v1_backup/` : ancien monolithe (1 355 lignes) conservé « au cas où ».

---

## 5. Ce qui est remarquablement bien fait

1. **Honnêteté calibration** : aucune note n'est affichée, la garde est dans le **domaine** (`ui/workspace/feedback.js:12-16`) _et_ dans le store, et le blocage est régénéré depuis un rapport vide — pas depuis une constante « true » cachée.
2. **Refus par défaut** de la simulation (`official-coverage.js:38-55, 197-204`) : inventaire manquant/partiel ⇒ `simulationEligible: false`, avec bloqueurs explicites et libellés arabes.
3. **Migrations de schéma non destructives** (`store.js:143-196`) : récupération des données d'élèves perdues par un bug antérieur.
4. **Base linguistique arabe** : normalisation, radicaux protégés, stemmeur à seuils, alias documentés par année d'origine, heuristique verbale justifiée — avec les correctifs #65–#69 commentés **à l'endroit de la règle**.
5. **Accessibilité** : skip-link, focus de route, association automatique label↔champ, dialogues `inert` + piège de focus + retour de focus, régions live, contraste et 200 % testés en e2e.
6. **Build déterministe et vérifiable** : buildId contenu-adressé, `release.json` avec empreintes, vérificateur indépendant, standalone sans aucune référence externe.
7. **Service worker sobre** : shell seul précaché, runtime borné à 12, PDF/Range hors cache, purge par build.
8. **Serveur durci** : allowlist, double `realpath`, CSP stricte, `Range` limité aux PDF, en-têtes de sécurité.

---

## 6. Anomalies classées

### 🔴 S1 — Cassent la CI ou la confiance

| #    | Fichier:ligne                          | Constat                                                                                                                                                                                                                                                                                                              | Correctif                                                                  |
| ---- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| S1.1 | `js/services/speech-recognition.js:66` | `tryStart = (lang) => {` → `TS7006` paramètre implicitement `any`. **`npm run typecheck` échoue** (étape 3 du workflow)                                                                                                                                                                                              | annoter `/** @param {string} lang */`                                      |
| S1.2 | 13 fichiers                            | **`npm run format:check` échoue** : `data/subjects.js`, `js/domain/evaluation/text-analysis.js`, `js/services/{diagnostics,sound-engine,speech-recognition}.js`, `js/store.js`, `js/ui.js`, `js/ui/workspace/brouillon.js`, `scripts/{audit-pdfs,extract-images,extract-native-pdfs,ocr-scan-pdf}.mjs`, `server.mjs` | `npx prettier --write …` (le dépôt a `.prettierrc.json`, la CI l'applique) |
| S1.3 | `README.md`                            | métriques `AUTO-METRICS` périmées → `npm run docs:check` rouge (hors CI, mais annoncé dans le README)                                                                                                                                                                                                                | ✅ **corrigé pendant cette analyse** (`461 lignes`)                        |

### 🟠 S2 — Comportement / robustesse

| #    | Fichier:ligne                                      | Constat                                                                                                                                                                                                                                   |
| ---- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S2.1 | `text-evaluator.js:189`                            | `hits >= req` valide un score parfait quand `req === 0` (règle sans mots-clés). Démontré : `fraction = 1` avec `hits = 0` sur `DEMO_RULE`. Aucun pôle réel n'est concerné aujourd'hui                                                     |
| S2.2 | `strategy.js:244-246`                              | condition `training                                                                                                                                                                                                                       |     | simulation` tautologique ; le commentaire laisse croire à deux comportements différents |
| S2.3 | `simulation.js:216-224`                            | bascule silencieuse vers le « mode lecture BAC » si l'inventaire est absent/partiel, **sans message** (alors que `denyInvalidSimulation` alerte bien)                                                                                     |
| S2.4 | `speech-recognition.js:66-81`                      | boucle de langue sans attente de `onend` → bug #54 (`InvalidStateError`) non corrigé                                                                                                                                                      |
| S2.5 | `sound-engine.js:150-164`                          | battements binauraux sans `StereoPannerNode` → bug #51 (Safari) non corrigé                                                                                                                                                               |
| S2.6 | `ui.js:389` vs `394-402`                           | ordre de création de `#toast-zone` **a posteriori de `timers.onChange`** — vérifié : **non atteignable en pratique** (aucun minuteur n'est démarré avant la création de la zone, L.432 > L.394). À traiter en dette défensive, pas en bug |
| S2.7 | `training.js:176` + `366`                          | double liaison possible de `#drill-start` (listener ajouté deux fois si `renderDrillIdle` est réexécuté après `mount`)                                                                                                                    |
| S2.8 | `quality-checks.js:138` et `method-scripts.js:188` | la regex « mouvement du courbe » ne couvre que `المنحني` (sans hamza) ; `المنحنى` échappe à la détection                                                                                                                                  |

### 🟡 S3 — Qualité / duplication

| #     | Fichier                                             | Constat                                                                                                            |
| ----- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| S3.1  | `methodology.js`                                    | **28 blocs `return` identiques** (~280 L.) → un seul `return` + table de règles                                    |
| S3.2  | `coverage-messages.js:1-11` ↔ `strategy.js:157-171` | table de libellés de bloqueurs **dupliquée**                                                                       |
| S3.3  | `strategy.js:34-36` ↔ `simulation.js:195`           | règle « pas de lien de téléchargement » affirmée puis contrevenue                                                  |
| S3.4  | `workspace.js:517-520`                              | `updateLiveScore()` devenue vide (3 appels)                                                                        |
| S3.5  | `workspace.js:287`                                  | `goToSuccessStep()` ignore l'argument passé en `284`                                                               |
| S3.6  | `quality-checks.js:308`                             | commentaire orphelin de fin de fichier                                                                             |
| S3.7  | `subjects.js:38`                                    | `"بكتيريا"` en double dans `PROTECTED_STEMS`                                                                       |
| S3.8  | `build.mjs:5` ↔ `scripts/lib/public-assets.mjs:6`   | « PDF jamais distribués » vs `subjects/` dans la surface publique → `dist/site` = 43 Mo                            |
| S3.9  | `brouillon.js:53-54`                                | deux expressions à opérande mort (`detectVerb(...) \|\| detectVerb(...)` ; `activePole \|\| verb.recommendedPole`) |
| S3.10 | `training.js:136,155,252` et `hub.js:159`           | `innerHTML` direct, en contournement de `setInternalHTML`                                                          |

### ⚪ S4 — Documentation périmée

| Fichier                 | Constat                                                                                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CONTINUATION.md:72-74` | cite `js/domain/evaluation/{rubric,hypotheses,technique}.js` et `{graph,table,genetics}-*.js` — **ces fichiers n'existent pas** (regroupés dans `quality-checks.js`) |
| `CONTINUATION.md:80`    | cite `js/ui/drawers/{adkar,atlas}.js` — le chemin réel est `js/ui/atlas.js`, les invocations sont dans `js/ui.js:167-194`                                            |
| `archive.js:9-16`       | annonce 19 pages SE 2013-2020 et des fichiers `data/subjects-archive.js`, `data/year-2020-se.js`, `data/year-2026-se.js` qui n'existent plus                         |
| `README.md:15`          | « parcours en 5 étapes » pour **4 vues** (`index.html:21-24`)                                                                                                        |
| `workspace.js:629-645`  | `confirmReset()` mort : aucune doc n'indique que la réinitialisation a été retirée de l'UI (seul un test le mentionne)                                               |
| `README`/`CONTINUATION` | le bug #54 (dictée) et #51 (Safari) sont listés « à faire » — toujours d'actualité (S2.4, S2.5)                                                                      |

### 🕳️ Code mort (jamais atteint depuis l'application)

| Symbole                                               | Fichier:ligne                                                         | Utilisé par                                       |
| ----------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------- |
| `createReportController`                              | `js/ui/workspace/report-controller.js:5`                              | `tests/workspace-modules.test.mjs` **uniquement** |
| `buildTrainingReport`                                 | `js/ui/reports/report.js:1`                                           | report-controller (mort)                          |
| `reportToCSV`, `downloadFile`, `printCurrentExercise` | `js/ui/reports/exports.js`                                            | report-controller (mort)                          |
| `trainingLimitHTML`                                   | `js/ui.js:121`                                                        | report-controller (mort)                          |
| `restoreTextDrafts`                                   | `js/ui/workspace/text-exercise.js:12`                                 | —                                                 |
| `appendText`                                          | `js/ui/dom.js:20`                                                     | —                                                 |
| `poleConfidence`                                      | `js/ui/workspace/feedback.js:3`                                       | `tests/archive-years.test.mjs`                    |
| `confirmReset`                                        | `js/ui/screens/workspace.js:629`                                      | — (donc `store.reset()` inaccessible)             |
| `updateLiveScore`                                     | `js/ui/screens/workspace.js:517`                                      | 3 appels sans effet                               |
| `METHOD_SCRIPTS` exporté 3 fois                       | `method-scripts.js:12`, `text-analysis.js:13`, `text-evaluator.js:23` | réexport en cascade                               |

---

## 7. Ce que j'ai modifié

**7.1 Pendant l'analyse (première passe)** — `README.md`, une seule ligne (bloc `AUTO-METRICS`) : `Taille de la façade UI (js/ui.js) : 462 lignes` → `461 lignes`, régénérée par `npm run docs:update` (l'outil est la source de vérité ; la valeur 462 était périmée d'au moins un commit).

**7.2 Pendant la remédiation (deuxième passe)** — voir le §10, qui tient la liste exhaustive et l'état de chaque anomalie.

---

## 8. Plan d'action priorisé

**P0 — rendre la CI verte (30 min)**

1. `npx prettier --write` sur les 13 fichiers listés en S1.2.
2. Annoter `lang` dans `speech-recognition.js:66` (S1.1).
3. Optionnel mais recommandé : ajouter `npm run docs:check` et `npm run release:verify` au workflow pour que les métriques et la release ne dérivent plus.

**P1 — corriger les deux heuristiques fragiles (1-2 h)** 4. `text-evaluator.js:189` : `hits > 0 && hits >= req` (S2.1). 5. `quality-checks.js:138` + `method-scripts.js:188` : ajouter `المنحنى` (S2.8). 6. `workspace.js:284/287` et `strategy.js:244-246` : supprimer les incohérences de signature/condition (S2.2, S3.5).

**P2 — clarifier le produit (2-4 h)** 7. Décider du sort du **rapport d'entraînement** : soit le recâbler (bouton « 📊 تقرير » dans le workspace, sans note tant que la calibration bloque — `trainingLimitHTML` est déjà prêt), soit supprimer les 3 modules + le test (ils donnent l'illusion d'une fonctionnalité livrée). 8. Même décision pour `confirmReset()` : bouton ou suppression. 9. Expliquer la bascule `simulation → mode lecture` (S2.3) par un message, comme le fait déjà `denyInvalidSimulation`.

**P3 — dette structurelle (1 journée)** 10. Refactorer `methodology.js` : table de règles + `return` unique (−280 L.). 11. Fusionner les deux tables de libellés de bloqueurs (S3.2). 12. Trancher la question PDF : soit exclure `subjects/` de `dist/site` (et corriger le commentaire de `build.mjs`), soit assumer la distribution locale et réécrire la phrase. À arbitrer avec `docs/CONTENT_RIGHTS.md` et `LICENSE-CONTENT` — **le dépôt contient 42 Mo de PDF tiers**, la question est autant juridique que technique.

**P4 — documentation** 13. Rafraîchir `CONTINUATION.md` (chemins inexistants) et l'en-tête de `data/archive.js`. 14. Documenter le retrait du reset et l'écart « 5 étapes / 4 vues ».

---

## 9. Annexe — reproduction

État **avant** remédiation :

```bash
npm ci
npm test                 # 257 tests, 256 passent, 1 skippé
npm run lint             # OK
npm run typecheck        # échoue : speech-recognition.js:66
npm run format:check     # échoue : 13 fichiers
npm run build            # build f54ac619b7a2, standalone sha256 9387190ec97e…
npm run release:verify   # 136 fichiers
npm run p1:status        # 3/6      npm run p2:status  # 6/7
npm run p3:status        # 6/6      npm run docs:check # OK après correction
npm run coverage:official# 38 sujets, 0 éligible
npm run calibration:check# à jour
node server.mjs          # http://0.0.0.0:8080
npm run test:e2e         # nécessite `npx playwright install --with-deps chromium`
```

Sondage moteur utilisé pour S2.1 :

```bash
node -e 'import("./js/domain/evaluation/text-evaluator.js").then(async (m) => {
  const d = await import("./js/ui/demo-diagnostic.js");
  console.log(m.evaluateText(d.DEMO_COPY.after, d.DEMO_RULE, "S").fraction); // 1 malgré hits=0
});'
```

---

## 10. Remédiation — correctifs appliqués

Deuxième passe, demandée après la lecture du rapport (« fix les anomalies »). Tout est vérifié par la chaîne CI complète, rejouée intégralement après les modifications.

### 10.1 Tableau de statut

| #     | Anomalie                                            | Statut                                 | Correctif                                                                                                                                                                                                                                       |
| ----- | --------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1.1  | `typecheck` casse sur `tryStart = (lang) =>`        | ✅ corrigé                             | `/** @param {string} lang */` (puis réécriture de la fonction, §10.2)                                                                                                                                                                           |
| S1.2  | `format:check` rouge (13 fichiers)                  | ✅ corrigé                             | `npx prettier --write` sur les 15 fichiers concernés ; `data/subjects.js` garde sa table compacte via `// prettier-ignore`                                                                                                                      |
| S1.3  | métriques README périmées                           | ✅ corrigé                             | `npm run docs:update` (désormais 37 fichiers / 262 tests)                                                                                                                                                                                       |
| S2.1  | `hits >= req` valide un sans mot-clé                | ✅ corrigé                             | `hits > 0 && hits >= req` dans `text-evaluator.js`                                                                                                                                                                                              |
| S2.2  | condition `training \|\| simulation` tautologique   | ✅ corrigé                             | `timers.startGlobal()` inconditionnel + commentaire expliquant que la simulation remet le temps restant à la durée complète                                                                                                                     |
| S2.3  | bascule silencieuse en mode lecture BAC             | ✅ corrigé                             | `renderBacReadingMode(subject, reason)` + bloc `FALLBACK_NOTICE` arabe (`missing` / `partial` / `blocked`)                                                                                                                                      |
| S2.4  | bug #54 `InvalidStateError` (dictée)                | ✅ corrigé                             | instance neuve par tentative de locale, repli asynchrone sur `language-not-supported`, une seule notification par action — + `tests/speech-recognition.test.mjs` (5 tests)                                                                      |
| S2.5  | bug #51 binaural Safari                             | ⚠️ durci                               | chemin `StereoPannerNode` (pan ∓1) en principal, `ChannelMerger` en repli. **Non vérifiable ici** (pas de WebAudio dans jsdom) — à confirmer sur Safari                                                                                         |
| S2.6  | ordre `#toast-zone` / `timers.onChange`             | ➖ sans changement                     | non atteignable (vérifié : aucun minuteur démarré avant la création de la zone). Dette défensive assumée                                                                                                                                        |
| S2.7  | double liaison de `#drill-start`                    | ✅ corrigé                             | `bindOnce()` mémorise les écouteurs par nœud (`WeakMap<Element, Set<fn>>`)                                                                                                                                                                      |
| S2.8  | regex « mouvement du courbe » sans `المنحنى`        | ❌ faux positif                        | `normalizeArabic()` normalise `ى → ي` avant le test : les deux graphies sont déjà couvertes (vérifié sur 4 variantes). Aucune modification                                                                                                      |
| S3.1  | 28 blocs `return` identiques                        | ✅ corrigé                             | `methodology.js` : 28 retours → 1 (branches en `else if`, deux variables de sortie) ; **1117 → 882 lignes**, **0 différence sur 2448 couples échantillon × pôle**                                                                               |
| S3.2  | table de bloqueurs dupliquée                        | ✅ corrigé                             | `strategy.js` utilise `simulationBlockersArabic()` de `coverage-messages.js`                                                                                                                                                                    |
| S3.3  | règle « pas de lien de téléchargement » contrevenue | ✅ documenté                           | commentaire sourcé : le seul lien `⬇️ تنزيل` vit dans `screens/simulation.js`                                                                                                                                                                   |
| S3.4  | `updateLiveScore()` vide                            | ✅ supprimé                            | fonction et ses 3 appels retirés                                                                                                                                                                                                                |
| S3.5  | `goToSuccessStep(exNum)` ignore son argument        | ✅ corrigé                             | appel sans argument                                                                                                                                                                                                                             |
| S3.6  | commentaire orphelin fin de fichier                 | ✅ supprimé                            | `quality-checks.js:308`                                                                                                                                                                                                                         |
| S3.7  | `"بكتيريا"` en double                               | ✅ corrigé                             | `data/subjects.js`                                                                                                                                                                                                                              |
| S3.8  | « PDF jamais distribués » vs 42 Mo livrés           | ✅ commentaire corrigé + poids affiché | le build annonce désormais `42.4 MB dont 41.1 MB de PDF sous subjects/` ; l'arbitrage d'exclusion reste ouvert (juridique)                                                                                                                      |
| S3.9  | opérandes morts dans `brouillon.js`                 | ✅ corrigé                             | `detectVerb()` résout toujours une route → second opérande supprimé ; `activePole ?? verb.recommendedPole`                                                                                                                                      |
| S3.10 | `innerHTML` direct                                  | ✅ corrigé                             | `training.js` (3), `atlas.js` (1, dépendance injectée), `hub.js` (1 `insertAdjacentHTML` → `elementFromInternalHTML`)                                                                                                                           |
| S4    | docs périmées                                       | ✅ corrigé                             | `CONTINUATION.md` (chemins inexistants, bugs #51/#54), `data/archive.js` (en-tête réécrit sur le contenu réel : 16 entrées), `README.md` (« cinq temps » = 4 écrans + 1 section), modules de rapport documentés comme volontairement non câblés |
| CI    | `docs:check` et `release:verify` jamais lancés      | ✅ ajouté                              | `.github/workflows/quality.yml`                                                                                                                                                                                                                 |

### 10.2 Code mort : recâblé (demande explicite après lecture du rapport)

Seconde demande : « revive le code mort ». Ces modules sont donc **rebranchés à l'application**, en respectant la contrainte produit (aucune note chiffrée avant calibration) :

| Symbole                       | Statut                       | Comment il vit maintenant                                                                                                                                                         |
| ----------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createReportController`      | ✅ câblé                     | bouton **📊 تقرير التدريب** (`#ws-report`) dans la barre d'outils de l'espace de travail ; contrôleur instancié dans `js/ui.js`                                                   |
| `buildTrainingReport`         | ✅ câblé                     | alimente le rapport affiché                                                                                                                                                       |
| `printCurrentExercise`        | ✅ câblé                     | bouton **🖨️ طباعة** du rapport                                                                                                                                                    |
| `reportToCSV`, `downloadFile` | ⚠️ câblé mais **verrouillé** | les boutons CSV/JSON ne sont rendus que si `CALIBRATION_STATUS.scorePromotionAllowed` est vrai — le CSV contient les notes par pôle, il ne peut pas être exposé avant calibration |
| `trainingLimitHTML`           | ✅ câblé                     | extrait vers `js/ui/training-limit.js`, affiché en tête du rapport                                                                                                                |
| `confirmReset()`              | ✅ câblé                     | bouton **↺ إعادة التعيين** (`#ws-reset`) + modale de confirmation explicite (« لا يمكن التراجع ») ; désactivé quand la session est verrouillée, absent de l'écran de simulation   |
| `poleConfidence()`            | ✅ câblé                     | indice « ثقة مرتفعة/متوسطة/منخفضة » ajouté à chaque note de provenance d'étape (`presentation.js`)                                                                                |
| `appendText()`                | ✅ câblé                     | restauré dans `js/ui/dom.js` ; sert à ajouter l'horodatage du rapport comme nœud texte (jamais interpolé dans le HTML)                                                            |
| `restoreTextDrafts()`         | ✅ rebranché                 | `renderExercise()` le réclame pour restaurer les brouillons                                                                                                                       |
| `updateLiveScore()`           | ❌ supprimé                  | fonction vide et sans effet : rien à recâbler                                                                                                                                     |

Effets de bord assumés et traités :

- **P1.6** (critère d'acceptation : façade `ui.js` ≤ 470 lignes, `workspace.js` ≤ 700) : l'ajout des branchements a fait dépasser `ui.js` (479). Plutôt que de relever le seuil, `trainingLimitHTML` a été extrait vers `js/ui/training-limit.js` et la construction du contrôleur compactée → **464 lignes**.
- **Précache du service worker** : les 4 modules du rapport, désormais dans le graphe d'imports statiques, ont été ajoutés à `SHELL_ASSETS` (`sw.js`) — sinon le test « tout le graphe statique est précaché » échoue.
- Les tests qui **verrouillaient l'absence** de `#ws-report` / `#ws-reset` (`tests/ui.test.mjs`, `tests/all-buttons.test.mjs`) ont été réécrits en tests de comportement : le rapport s'ouvre sans aucun chiffre, l'export CSV reste absent, la réinitialisation exige une confirmation.

### 10.3 Preuves de non-régression

| Contrôle                                                       | Avant                                | Après                                                                                                    |
| -------------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `npm test`                                                     | 257 tests, 256 pass / 1 skippé       | **262 tests, 261 pass / 1 skippé / 0 échec**                                                             |
| `npm run lint`                                                 | OK                                   | OK                                                                                                       |
| `npm run typecheck`                                            | échoue (TS7006)                      | **OK**                                                                                                   |
| `npm run format:check`                                         | échoue (15 fichiers)                 | **OK**                                                                                                   |
| `npm run build`                                                | OK                                   | OK — `dist/site` 136 fichiers, déterminisme vérifié par le test « deux builds consécutifs »              |
| `npm run release:verify`                                       | 136 fichiers                         | 136 fichiers                                                                                             |
| `npm run docs:check`                                           | périmé                               | **à jour**                                                                                               |
| Harnais moteur (2448 couples échantillon × pôle sur 19 années) | somme des fractions 124,8859         | **identique, 0 différence**                                                                              |
| Démo avant/après                                               | AVANT 0 (règle obsolète) / APRÈS 1,0 | **AVANT 0,180 / APRÈS 1,000** — l'exemple « avant » est enfin noté honnêtement au lieu d'être inscorable |

Le harnais : `evaluateText` rejoué sur les 6 échantillons arabes × 4 pôles de chaque exercice de chaque sujet des 19 années, avec comparaison clé par clé avant/après (`fraction`, `methodology`, verdict, `missingCount`).

### 10.4 Reste ouvert (arbitrages, pas des bugs)

1. **PDF tiers** : `dist/site` pèse 42,4 Mo dont 41,1 Mo de PDF. Exclure `subjects/` du livrable ou assumer la redistribution locale — question juridique (`docs/CONTENT_RIGHTS.md`, `LICENSE-CONTENT`), pas technique.
2. **S2.5 (#51)** : à confirmer sur un vrai Safari.
3. **`METHOD_SCRIPTS` réexporté trois fois** (`method-scripts.js` → `text-analysis.js` → `text-evaluator.js`) : façade assumée, à aplatir si la couche disparaît.
4. **`poleConfidence`** (`feedback.js`) : couvert par un test, non utilisé par l'UI.
5. **`tests/hard-benchmark/cases.json`** : toujours vide — la calibration reste à 0 copie doublement annotée, donc les notes restent masquées. Aucun correctif de code ne peut y suppléer.
