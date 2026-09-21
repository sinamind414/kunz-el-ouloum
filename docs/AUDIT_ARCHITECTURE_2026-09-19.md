# Audit d'architecture — Kunz El Ouloum (SVT BAC DZ)

**Date :** 2026-09-19 · **Commit audité :** `724e137` (branche `arena/01a0ba5e-kunz-el-ouloum`)
**Méthode :** exécution réelle, pas de lecture superficielle.

| Vérification | Résultat |
|---|---|
| `npm ci` | ❌ **Échec en environnement restreint** (better-sqlite3 → node-gyp, prébuilds non téléchargeables). Passe avec `--ignore-scripts` ; le Dockerfile l'anticipe, un contributeur sans Docker non. |
| `npm run lint` (tsc) | ❌ **120 erreurs** — toutes issues de fichiers jetables trackés (`fix_lesson_data.js` : 98, `scripts/_gen_append_clean.mjs` : 20, 2 autres). `src/` compile proprement. |
| `npm test` (harnais natif) | ✅ 138/138 |
| `npm run test:vitest` | ✅ 659/663 — **les 4 échecs viennent du smoke test de build qui exige `dist/` alors que la CI ne build jamais** (voir F7). Après `vite build` : 663/663. |
| `vite build` | ✅ en 8,7 s — mais **bundle principal 2 731 kB (653 kB gzip)**, voir F2. |
| Lecture serveur (`server.ts`, `server/*`) | Voir F6/F8. |

---

## Verdict

Le **noyau est meilleur que la moyenne des projets edtech vus ici** : couche serveur disciplinée (JWT exigé au boot, bcrypt, rate limiting IP + compte, séparation rôles testée, SQL paramétré, export CSV streamé), 800+ tests qui passent, découpage par leçon, documentation produit rare à ce niveau (`SPEC_BOUSSOLE_NSOE`, `PROTOCOLE_PREUVE`, audits antérieurs honnêtes).

Mais l'**architecture globale est minée par quatre contradictions non tranchées** :

1. Une app qui se dit **« 100 % hors-ligne »** avec un bundle d'entrée de **2,7 Mo**, des diagrammes pointant vers `lh3.googleusercontent.com`, et un service worker dont le versionnement est du code mort.
2. Un **dépôt-atelier d'IA non nettoyé** : 94 fichiers poubelle trackés (patches déjà appliqués, dumps d'audit, `.bak`, scratch scripts) qui **cassent le lint** — la CI est donc verte sur un pipeline rouge.
3. Un **sync à sens unique** déguisé en synchronisation : `localStorage` reste la seule source de vérité de la progression élève.
4. Une **promesse Gemini** dans `metadata.json` alors qu'aucun appel Gemini n'existe (un seul commentaire « In a real app, this would be an API call to Gemini »).

## Synthèse des constats

| # | Sévérité | Constat |
|---|---|---|
| F1 | 🔴 P1 | Hygiène de dépôt : 94 fichiers poubelle trackés, `npm run lint` cassé (120 erreurs), double lockfile, README AI Studio, `package.json` = « react-example » 0.0.0 |
| F2 | 🔴 P1 | Bundle d'entrée 2 731 kB / 653 kB gzip — zéro `lazy()` sur les vues, App.tsx monolithe (884 lignes, 16 `useState`, pas de routeur) |
| F3 | 🔴 P1 | Service worker : versionnement mort (`?v=Date.now()`), runtime cache non borné — sur le même origin que la progression `localStorage` |
| F4 | 🟠 P2 | Contenu des leçons distribué **deux fois** (statique `dist/lessons` + chunks `?raw`), deux chemins à maintenir en parité |
| F5 | 🟠 P2 | URLs `googleusercontent.com` en dur (`src/data/index.ts`) — hors-ligne cassé + liens AI Studio périssables |
| F6 | 🟠 P2 | Sync à sens unique : pas de protocole (pas de `updated_at`, pas de résolution de conflit, pas de suppression propagée) |
| F7 | 🟠 P2 | CI sans `npm run build`, sans lint (il échouerait), Node 22 en CI vs Node 20 dans le Dockerfile, déclencheurs master seulement |
| F8 | 🟡 P3 | Sécurité : zéro validation de schéma côté serveur (zod installé, inutilisé côté API), injection CSV possible via `errorTags`, `Math.random` pour codes de reset, JWT non révoqués après reset, limiteurs en mémoire (fuite `Map` + incompatibles multi-instances pourtant annoncées dans `docker-compose.yml`) |
| F9 | 🟡 P3 | God components : `MethodologyCompilerView.tsx` 150 917 o en un seul fichier, `StatsView.tsx` 70 Ko, `LessonTwoView.tsx` 54 Ko |
| F10 | 🟡 P3 | Histoire git écrasée en un commit unique + 22 fichiers `.patch` à la racine = le VCS réel de ce projet est `apply_patches.sh`, pas git |

---

## Détail des constats

### F1 — Dépôt-atelier, pipeline rouge sous CI verte (P1)

Trackés dans git : 22 `.patch` déjà appliqués, ~40 dumps (`audit_*.txt`, `ETAT_*.txt`, `ZONE.txt`, `tmp_diff3.txt` 250 Ko), `lessonData.ts.bak` (132 Ko), `src/data/__write_test.ts` (fichier de griffonnage), scripts jetables à la racine.

Conséquence directe : `tsconfig.json` n'a ni `include` ni `exclude` (avec `allowJs: true`) → tsc avale tout → **`npm run lint` échoue avec 120 erreurs, à 100 % sur des fichiers poubelle**. Le code de `src/` est propre. Mais :

- le lint n'est pas dans la CI (parce qu'il est rouge),
- la CI est donc **verte sur un pipeline cassé** — le signal de santé est faux.

Plus : deux lockfiles (`bun.lock` + `package-lock.json`), README encore au template AI Studio avec bannière Google, nom de paquet `react-example` 0.0.0. Un repo qui dit « je bricole » aux contributeurs et « je ne sais pas ce que je livre » aux déploiements.

**Correctif (½ journée) :** `git rm` les dumps/patches/.bak/scratch (archiver hors git si attachement sentimental), ajouter `include: ["src", "server", "tests", "scripts"]` au tsconfig, supprimer `bun.lock`, réécrire le README, remettre `lint` dans la CI.

### F2 — 653 kB gzip avant le premier pixel utile (P1)

Le public cible est l'élève algérien en 3G/4G dégradée. Mesuré sur le build :

```
dist/assets/index-jhvxyOLY.js   2 731.83 kB │ gzip: 653.61 kB
dist/assets/tutor-knowledge-base-*.js  547.38 kB │ gzip: 78.62 kB  (bien isolé)
```

Causes : **toutes les vues sont importées statiquement dans `App.tsx`** (0 `React.lazy` sur les vues ; seuls les 22 chunks de leçons sont dynamiques), et `src/data/index.ts` réexporte le corpus QCM entier (`quizCorpus.ts`, 575 Ko source) dès l'import initial. À ~750 kbps réels, 653 kB gzip ≈ **7–8 s avant interactivité** à chaque première visite, et à chaque invalidation de cache. Le smoke test `lazyRouteChunks` verrouille le découpage par leçon mais **personne ne verrouille la taille du bundle principal** — c'est précisément le chiffre qui compte.

**Correctif (2–4 j) :** `lazy()` sur chaque vue de `App.tsx` (12 tab → 12 chunks), sortire `quizCorpus`/`tutorKnowledge` des imports statiques, budget de perf dans la CI (échec si `index-*.js` gzip > 250 kB). Un test smoke sur la taille vaut tous les commentaires ARCH-xxx.

### F3 — Service worker : le mécanisme de versionnement est du code mort (P1)

`main.tsx` : `register(`/sw.js?v=${Date.now()}`)`. L'intention est de forcer la mise à jour. Réalité, par la spec des service workers : le navigateur compare les **octets** du script ; `sw.js` est servi statiquement avec des octets identiques (la version est lue *au runtime* depuis l'URL) → **comparaison identique → aucune réinstallation, jamais**. Conséquences :

- `VERSION` reste figé à celle de la première installation ;
- `precacheShell()` et `lazySchemaPrecache()` (les ~8 Mo de schémas) ne se réexécutent jamais — le précache dérive du build réel ;
- `cleanupOldCaches()` ne s'exécute jamais (il vit dans `activate`).

Ce qui sauve aujourd'hui les mises à jour : `networkFirstNavigation` + `staleWhileRevalidate` rattrapent tout au fil de l'eau. Autrement dit **tout le système de précache sélectif documenté (ARCH-005/006) est inerte en pratique**.

Second problème, plus sournois : `RUNTIME_CACHE` n'a **aucune borne** (pas de LRU, pas de quota). Chaque schéma, chaque asset y entre à vie. Le CacheStorage et le `localStorage` partagent le quota du même origin — en pression de stockage mobile, le navigateur peut **purger tout l'origin, y compris la progression de l'élève** (F6). Une app offline-first qui peut se faire effacer ses propres données utilisateur par son propre cache, c'est le bug le plus ironique du repo.

**Correctif (1 j) :** injecter un hash de build **dans les octets** de `sw.js` (define de Vite), borner `RUNTIME_CACHE` (~50–100 entrées LRU), persister la progression critique hors `localStorage` (IndexedDB ou serveur, cf. F6).

### F4 — Les leçons voyagent en double (P2)

Même contenu HTML, deux chaînes de distribution : `public/lessons/*.html` (servi en statique, 1,2 Mo dans `dist/lessons`) **et** `import('...?raw')` qui emballe les mêmes fichiers dans 29 chunks JS (~1 Mo dans `dist/assets`). Deux sources à garder en parité à chaque édition de leçon ; un étudiant peut servir l'un, l'autre, ou les deux mélangés selon le chemin de code. Le smoke test s'intitule « ne sert aucune leçon en HTML depuis dist/assets » alors que les leçons *sont* dans `dist/assets` — en JS — le test protège un détail syntaxique, pas l'invariant réel.

**Correctif (2 j, non urgent) :** choisir UN chemin (recommandé : garder le statique + fetch, supprimer les `?raw` — le SW le cache déjà), ou générer l'un à partir de l'autre au build.

### F5 — Diagrammes chez Google, cours chez personne (P2)

`src/data/index.ts` : `DIAGRAM_QUIZ_URL` et `DIAGRAM_FLASHCARD_URL` sont des URL `lh3.googleusercontent.com/aida-public/...` exportées d'AI Studio. Trois problèmes : (a) **contradiction frontale avec « 100 % hors-ligne »**, (b) ces URL d'export AI Studio sont notoirement périssables — un jour, l'image 404 et le QCM est amputé sans que rien ne le détecte, (c) dépendance à un tiers hors de ton contrôle pour du contenu d'examen.

**Correctif (½ j) :** télécharger les images dans `public/assets/`, référencer en local, ajouter un test d'intégrité (toute URL de contenu doit être same-origin).

### F6 — « Sync » est un mensonge d'interface (P2)

`POST /api/student/sync` = `addEntriesIfNew` (upsert « si absent », idempotent) — c'est de la **réplication additive**, pas de la synchro. Aucun `updated_at`, aucune résolution de conflit, aucune propagation de suppression, aucune synchronisation de l'état riche (XP, streaks, déblocages, progression de leçons — tout vit dans `localStorage` avec 34 clés `setItem` éparpillées dans 26 fichiers). Conséquences réelles pour un bac blanc :

- élève change d'appareil / de navigateur → **progression perdue**, seules ses « productions » survivent ;
- `localStorage` nettoyé (private mode, purge stockage, cf. F3) → idem ;
- deux appareils → deux vérités divergentes, aucun arbitrage.

Pour un produit dont la proposition est le suivi dans la durée (BOUSSOLE, matrices, espacement), c'est le trou d'architecture **métier** le plus cher du repo — plus que n'importe quel refactoring cosmetic.

**Correctif (dir. 1 semaine) :** agréger la progression dans UN store versionné (clé `progress_v1`, horodaté), pousser l'état complet dans le sync existant (last-write-wins par sous-clé suffit à ce stade), tester la restauration sur appareil neuf.

### F7 — CI qui ne vérifie ni le build ni le lint (P2)

Trois jobs (check:v2, harnais, vitest) — mais **pas de `npm run build`** : le smoke test de build échoue donc en CI (il échoue localement tant qu'on n'a pas buildé — c'est exactement ce qui s'est produit lors de cet audit). Le lint y est absent parce qu'il est rouge (F1). Node 22 en CI, Node 20 dans le Dockerfile : deux runtimes « validés » différents. Déclencheurs `master` uniquement : toute branche de travail pousse à l'aveugle.

**Correctif (2 h) :** job `build` (`npm run build` + smoke test), `lint` dès F1 réglé, aligner Node (22 partout, ou `.nvmrc`), `on: push` toutes branches + PR.

### F8 — Sécurité : bonne ossature, détails qui mordent (P3)

À créditer : `JWT_SECRET` exigé au boot (refus de démarrer sinon), bcrypt(10), séparation rôles avec tests d'isolement, rate limiting à fenêtre glissante avec reset au succès, SQL paramétré partout, codes de reset expirants.

À corriger :

1. **Aucune validation de schéma côté serveur.** `req.body.entries` est casté `ProductionEntry[]` et stocké tel quel (`JSON.stringify(e)`). `zod` est dans les dépendances, utilisé côté client seulement. Un élève peut stocker du JSON arbitraire et polluer son `errorTags`.
2. **Injection CSV** : l'export enseignant joint `topErrors` avec `;` — des `errorTags` contrôlés par l'élève contenant `;` ou `=` corrompent les colonnes / formules Excel du prof. Échapper les cellules.
3. **`Math.random()`** pour les codes de reset et les IDs — PRNG prévisible. `crypto.randomBytes()` est un import, pas un projet.
4. **JWT non révoqués** : après `reset-password`, les jetons de l'élève restent valides 7 j (pas de version de jeton). Sur un compte partagé de lycée, c'est le scénario réel.
5. **Limiteurs en mémoire** : la `Map` n'éjecte jamais les clés caduces des IPs non revisitées (fuite lente, DoS mémoire) ; et `docker-compose.yml` annonce explicitement « plusieurs `npm start` derrière nginx » — chaque instance aurait ses propres compteurs : **5× les tentatives autorisées**, et un cache dashboard incohérent. Multi-instance assumé = limiteurs en Redis ou en base, sinon assumer mono-instance par écrit.

### F9 — Composants-monstres (P3)

`MethodologyCompilerView.tsx` : 150 917 octets dans un seul fichier. `StatsView.tsx` 70 Ko, `LessonTwoView.tsx` 54 Ko. `App.tsx` : 884 lignes, 16 `useState`, navigation par état de tab (pas d'URL, pas de deep-link, F5 perd l'écran au refresh). Ce n'est pas ce qui casse aujourd'hui ; c'est ce qui rend chaque prochaine feature deux fois plus chère. Découper **quand tu touches**, pas pour l'esthétique — mais impose une règle maintenant : un fichier > 1 000 lignes ne peut pas être étendu sans être fendu.

### F10 — L'histoire du projet n'existe pas (P3)

Un commit unique (`724e137`) et 22 patches à la racine : le vrai VCS de ce projet est une pile de `.patch` appliqués par script. Tu perds le bisect, le blame, la revue, et la capacité de prouver quel lot a introduit quel bug. Les futures sessions IA doivent committer par lots atomiques sur git, pas empiler des `00NN-*.patch`.

---

## Plan d'action (ordre recommandé)

| Étape | Effort | Gain |
|---|---|---|
| 1. Purge des fichiers poubelle + `include` tsconfig + README/nom de paquet | ½ j | Pipeline honnête, lint vert |
| 2. CI : job build + smoke, lint, alignement Node | 2 h | Le rouge détecté avant le merge |
| 3. SW : version dans les octets, cache runtime borné | 1 j | Offline réellement fonctionnel, données protégées |
| 4. Budget bundle en CI + lazy() des vues + sortir quizCorpus de l'entrée | 2–4 j | −300 à −500 kB gzip au premier chargement |
| 5. Images locales (F5) + unicité du chemin des leçons (F4) | 1–2 j | Hors-ligne sans exception |
| 6. Protocole de progression syncable (F6) | ~1 sem | Le produit tient sa promesse de suivi |
| 7. Durcissement sécurité F8 (zod, CSV, crypto, révocation) | 2–3 j | Multi-instance sans pièges |

## Ce que ce audit ne tranche pas

- La **pertinence pédagogique** de BOUSSOLE : couverte par `docs/AUDIT_APPROCHE_APP.md`, non re-vérifiée ici.
- La **charge réelle** : aucun test de charge n'existe ; les choix SQLite/PG et cache 30 s sont plausibles mais non mesurés.
- Le taux de fuite réel du précache SW en production : à instrumenter (compteur `navigator.storage.estimate()` loggé).
