# Bilan d'architecture — Kunz el-Ouloum

*Audit conduit sur la branche `arena/019ff4f0-kunz-el-ouloum`, au commit `0ffaedc`. Toutes les mesures citées ont été exécutées, pas lues.*

---

## Verdict en une page

**Note d'architecture : 5,5/10.**

L'application repose sur une structure de couches **saine et respectée** — c'est son meilleur atout, et il est rare. Le sens des dépendances est correct dans **tous** les cas mesurés : aucun fichier de `data/`, `services/`, `lib/` ou `utils/` n'importe un composant React. Une refonte d'interface ne toucherait pas la logique métier.

Cette note n'est pas plus haute à cause d'**un seul défaut, mais il est éliminatoire** : la configuration de build casse le découpage du code et rend, selon toute vraisemblance, **l'application inutilisable en production**. Le reste — deux systèmes de persistance concurrents, un `App.tsx` en pivot, une couche `data/` qui pèse un quart du code — relève de la dette structurelle sérieuse mais réparable.

| Axe | Note | Motif en une ligne |
|---|---|---|
| Séparation des couches | **8,5** | 0 import remontant sur 124 fichiers — mesuré, pas supposé |
| Modularité des composants | **5,0** | 4 composants > 780 lignes, dont un à 2 060 |
| Gestion de l'état | **4,5** | Deux systèmes de persistance divergents, `App.tsx` à 17 `useState` |
| Chaîne de build | **2,0** | 🔴 **L'obfuscateur détruit le découpage : 3 chunks au lieu de 59** |
| Couverture de test | **7,0** | 609 tests, 59 fichiers — mais 0 test E2E, et le build n'est pas testé |
| Frontière offline | **8,0** | Supabase authentiquement optionnel, chargé à la demande |
| Propreté du dépôt | **4,0** | 26 scripts de rustine à la racine |

---

## 1. Ce qui est bien conçu

### 1.1 Les couches tiennent — et c'est vérifié

L'architecture nominale est classique et lisible : `components/` (36 fichiers, 13 994 l.) → `services/` (13, 2 469 l.) → `data/` (24, 9 988 l.), avec `lib/` (12, 1 326 l.) et `utils/` (16, 2 042 l.) en support. Total : **124 fichiers, 42 593 lignes** hors tests.

La règle qui compte est celle du **sens** des dépendances, et elle est respectée :

| Vérification | Résultat |
|---|---|
| `data/`, `services/`, `lib/`, `utils/` importent un composant | **0** |
| `services/` importe un composant | **0** |
| `services/` → `data/` (sens descendant, normal) | 31 |
| Composants accédant directement à `localStorage` | **3** sur 36 |

Trois accès directs depuis les composants (`EditorialReviewPanel`, `ProgressView`, `SplashView`) sur 92 accès au total : c'est une fuite, pas une rupture. La quasi-totalité de la persistance passe par des services.

**Pourquoi cela vaut d'être souligné.** Sur un projet de cette taille développé sous pression, l'accident habituel est le composant qui écrit en base et le module de données qui importe une icône. Rien de tel ici. C'est ce qui a rendu possibles les 69 constats de l'audit fonctionnel : les défauts étaient **localisables**.

### 1.2 La frontière offline est réelle

`src/lib/supabase.ts` n'importe le SDK qu'en `import type` et ne le charge qu'à l'appel, derrière un test de présence des variables d'environnement. Vérifié à l'exécution : sans identifiants, l'application monte et affiche son écran d'accueil arabe, le SDK n'étant jamais téléchargé. Un seul Context React (`AuthContext`) : pas d'empilement de providers.

Sur les 14 dépendances de production, aucune n'est un framework de données lourd. La promesse « 100 % hors ligne » du README est **tenue au niveau architectural**.

---

## 2. Le défaut éliminatoire : la chaîne de build

### 2.1 Ce que j'ai mesuré

`vite.config.ts` applique `vite-plugin-javascript-obfuscator` en production. Comparaison de deux builds **de production**, seul l'obfuscateur changeant :

| | Avec obfuscateur | Sans |
|---|---|---|
| Chunks JS produits | **3** | **59** |
| Poids brut total | 469 kB | 3 318 kB |
| `vendor-charts` (recharts) | **absent** | 392 kB |
| `vendor-supabase` | **absent** | 209 kB |
| `quizCorpus` (508 QCM) | **absent** | 438 kB |
| Chemins `/assets/images/` présents | **0** | 661 |

### 2.2 La cause, et pourquoi elle est grave

`App.tsx` déclare **12 routes en `React.lazy()`** — le découpage est correctement écrit côté source. Mais l'obfuscateur réécrit les chemins en **concaténations calculées à l'exécution** :

```js
import(A(257) + A(514) + A(675) + A(1001) + "View")
```

Vite ne peut plus voir ce que le code importe. Il ne génère donc **aucun chunk** pour ces routes — d'où 3 fichiers au lieu de 59. Mais le code, lui, réclame toujours ces fichiers au démarrage de chaque écran.

**Vérification décisive, faite sur le serveur de prévisualisation réel** :

```
/assets/components/QuizView.js  →  HTTP 200, Content-Type: text/html
```

Le fichier n'existe pas ; le repli SPA renvoie `index.html`. Un navigateur **refuse d'exécuter un module servi en `text/html`** (`Failed to load module script`). Chaque écran chargé en `lazy` — quiz, leçons, entraînement, progression, coach, méthodologie — échoue donc à l'ouverture. **C'est-à-dire toute l'application au-delà de l'écran d'accueil.**

### 2.3 Une erreur que j'ai commise, et ce qu'elle enseigne

J'ai d'abord conclu que le bundle obfusqué était **vide de son contenu** : zéro caractère arabe sur 455 087, zéro chemin d'image sur 661, et mes sondes d'exécution restaient muettes. La conclusion était fausse.

L'obfuscateur est configuré avec `disableConsoleOutput: true` : **il neutralisait mes propres instruments de mesure**. En écrivant les résultats dans un fichier au lieu de la console, le verdict s'est inversé — le bundle monte en 735 ms et rend le même écran que le build sain. Les chaînes n'avaient pas disparu, elles étaient découpées en fragments de 5 caractères (`splitStringsChunkLength: 5`), invisibles à toute recherche textuelle.

La règle vaut au-delà de ce cas : **un outil qui modifie l'observabilité invalide les mesures faites à travers elle.** J'ai failli livrer un diagnostic inverse de la réalité pour l'avoir oublié.

### 2.4 Deux défauts annexes, révélés au passage

**L'obfuscateur ne traite que 15 fichiers sur 124.** La journalisation du build montre 15 lignes `include matched`. La protection est donc partielle, alors que son coût est total.

**La configuration décrit un monde qui n'existe pas.** Le bloc `modulePreload.resolveDependencies` filtre des chunks nommés `training-`, `progress-`, `methodology-`, `mypath-`, `validation-`, `vendor-charts-`, `vendor-supabase-`. **Aucun de ces sept noms n'existe dans la sortie.** Ce code a été écrit pour un build qui fonctionnait, puis l'obfuscateur a supprimé les chunks sans que personne ne relise la configuration : la trace d'une optimisation devenue morte, et le signe que **le contenu du dossier `dist/` n'est pas vérifié**.

### 2.5 Correctif recommandé — P0

1. **Retirer l'obfuscateur.** Le bénéfice réel est faible : le code d'une application pédagogique hors ligne n'est pas un secret industriel, et le corpus est de toute façon lisible dans le bundle. Le coût est l'application entière.
2. Si une protection reste exigée, l'appliquer **après** le bundling (post-traitement chunk par chunk), jamais sur les sources avant que Vite n'ait résolu les imports dynamiques.
3. **Ajouter un test de fumée sur le build** : servir `dist/`, ouvrir une route `lazy`, vérifier que la réponse est `application/javascript`. Trois lignes auraient suffi à empêcher ceci.
4. Supprimer le filtre `modulePreload` obsolète.

---

## 3. La dette structurelle

### 3.1 Deux systèmes de persistance concurrents — 🔴 Critique

L'application stocke la progression **deux fois, sous deux conventions**, sans passerelle :

| | `svt_*` | `kunz_*` |
|---|---|---|
| Écrit par | `App.tsx` (accès brut) | `data/store.ts` |
| Clés | `svt_progress`, `svt_units`, `svt_flashcards`, `svt_data_version` | `kunz_user_progress_v3`, `kunz_mastery_v1`, `kunz_missions_v3`, … |
| Versionné | non | oui (`storageMeta`, `migratedFrom`) |
| Consommé par | l'interface, en props | les services |

**Sonde exécutée.** Un élève à 900 XP dans les deux systèmes ; on change `DATA_VERSION` (ce que fait toute livraison de corpus). `App.tsx:201` détecte l'écart et réinitialise `svt_progress`. Résultat mesuré :

```
SVT_XP_APRES    0
KUNZ_XP_APRES   900
MASTERY_SURVIT  {"concepts":["c1","c2"]}
```

L'élève voit **0 XP** — l'interface lit `svt_progress` — pendant que les services de maîtrise et de rappel espacé continuent de le traiter comme un élève avancé. Ni réinitialisation franche, ni conservation : un **état incohérent**, où les recommandations ne correspondent plus à ce qui est affiché. Et `store.ts` possède précisément la machinerie de migration qui aurait évité cela ; `App.tsx` ne s'en sert pas.

**Correctif (P0, effort M)** : faire de `store.ts` la source unique, `App.tsx` n'en étant qu'un lecteur ; écrire une migration `svt_*` → `kunz_*` exécutée une fois.

### 3.2 `App.tsx`, pivot de l'application — 🟠 Majeur

544 lignes, **17 `useState`**, et **35 props** transmises au seul `TrainingView`. Tout état partagé y remonte, faute de store applicatif : chaque écran nouveau élargit la signature, et toute modification d'état re-rend la racine. C'est le point de couplage maximal du projet.

**Correctif (P1, effort M)** : extraire un contexte `ProgressContext` adossé à `store.ts`, ce qui supprime mécaniquement la majorité de ces props.

### 3.3 Composants obèses — 🟠 Majeur

| Fichier | Lignes |
|---|---|
| `InteractiveLessonView.tsx` | **2 060** |
| `MethodologyView.tsx` | **1 533** |
| `LessonsView.tsx` | 892 |
| `UnitIntroPortal.tsx` | 797 |
| `StatsView.tsx` | 783 |

Un composant de 2 060 lignes mélange nécessairement rendu, état et règles métier. C'est cohérent avec ce que l'audit fonctionnel a trouvé : les défauts #56, #57 et #64-#67 étaient tous **enfouis dans de gros composants**, invisibles à la lecture.

### 3.4 La couche `data/` porte le contenu — 🟡 Modéré, assumé

`quizCorpus.ts` fait à lui seul **7 129 lignes**, `tutorKnowledge.ts` 3 440, `fillBlanks.ts` 1 799. Le contenu pédagogique est en TypeScript, donc typé et testable — c'est défendable pour une application hors ligne. Mais il est aussi **recompilé à chaque livraison** et pèse 438 kB dans le bundle. À terme, un format JSON chargé à la demande par unité découplerait contenu et code.

### 3.5 Propreté du dépôt — 🟡 Modéré

**26 scripts** `patch*.py`, `fix_*.py`, `*.patch` traînent à la racine. Aucun n'est référencé par `package.json`. Ce sont des rustines ponctuelles jamais nettoyées : elles brouillent la lecture du projet et n'ont aucune valeur reproductible.

---

## 4. Tests : solides sur le code, aveugles sur le produit livré

**609 tests, 59 fichiers, 8 825 lignes** — un ratio d'environ 1 ligne de test pour 5 lignes de code, honorable. Les 69 constats de l'audit fonctionnel sont verrouillés par des mutations.

Mais deux angles morts demeurent, et ce bilan en révèle un troisième, le plus grave :

1. **Aucun test E2E** (`test:e2e` est configuré, Chromium n'est pas installable ici).
2. **Deux chemins de rendu échappent à jsdom** : `recharts` ne produit aucun `<svg>`, le `canvas` d'export n'est pas rasterisé (constats #56, #57).
3. **Le build n'est testé par rien.** La suite s'exécute sur les *sources*. Elle était **verte à 609/609 pendant que l'artefact de production était cassé.** C'est la limite de fond de toute suite unitaire : elle valide ce que le développeur écrit, pas ce que l'utilisateur reçoit.

---

## 5. Feuille de route

| Priorité | Action | Effort |
|---|---|---|
| **P0** | Retirer l'obfuscateur ; vérifier 59 chunks ; test de fumée sur le `Content-Type` d'une route `lazy` | S |
| **P0** | Unifier la persistance sur `store.ts` + migration `svt_*` → `kunz_*` | M |
| **P1** | `ProgressContext` pour dégonfler `App.tsx` et les 35 props | M |
| **P1** | Découper `InteractiveLessonView` (2 060 l.) et `MethodologyView` (1 533 l.) | L |
| **P2** | Supprimer le filtre `modulePreload` obsolète ; nettoyer les 26 scripts racine | S |
| **P2** | Sortir le corpus en JSON chargé par unité | L |

---

## 6. Conclusion

L'architecture **interne** de cette application est meilleure que sa réputation ne le laisserait croire : les couches sont respectées, la frontière hors ligne est réelle, la logique métier est isolée de l'interface. Ce sont des fondations sur lesquelles on peut construire.

Ce qui la met en danger n'est pas sa structure mais sa **chaîne de production**. Une option de configuration ajoutée pour protéger le code a supprimé le découpage, et l'application livrée est probablement inutilisable au-delà de son écran d'accueil — sans qu'aucun des 609 tests ne puisse le signaler, puisqu'aucun ne regarde `dist/`.

C'est la même leçon que celle qui traverse tout l'audit fonctionnel, transposée à l'infrastructure : **le produit n'est pas ce que le code dit, c'est ce que l'utilisateur reçoit.** Et cela se mesure sur l'artefact livré, pas sur les sources.

*Fin du bilan d'architecture.*
