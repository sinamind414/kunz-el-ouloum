# 🔎 Inventaire corrigé & proposition de convergence — 2026-11-05

**Périmètre :** comparaison `reorganisation-med` (`e730d9c`) ↔ `arena/bcf8863b-kunz-el-ouloum` (`a873d74`), même remote `sinamind414/kunz-el-ouloum`.

**Méthode (constat) :** lectures seules via `git ls-remote`, `gh api .../git/trees/<sha>?recursive=1` (arbres complets, non tronqués) et `gh api .../contents/<f>?ref=<branche>`. **Aucun fetch dans ce sandbox, aucun merge, aucun cherry-pick, aucun push, aucun changement de branche, aucun fichier de branche modifié.** Les fichiers de l'autre branche ont été lus par l'API et déposés dans `/tmp` uniquement.

---

## 1. Corrections à l'inventaire transmis

| # | Affirmation transmise | Verdict | Preuve |
|---|---|---|---|
| 1 | « `reorganisation-med` restaure `methodology` / `reviser` (6 portes) ; `arena/bcf8863b` est basée sur `f4bc4f4` **qui ne les a pas** — elles seraient orphelines » | ❌ **Inexacte** | `git show f4bc4f4:src/App.tsx` lignes 864-865 contiennent explicitement `{ tab: 'methodology', … }` et `{ tab: 'reviser', … }`. Et les **deux pointes** ont exactement 4 portes `home / apprentissage / methodology / moi` (labels identiques). `src/data/apprentissageNav.ts` est **byte-identique** sur les deux branches (blob `70dde68a`). |
| 2 | « Écriture des paramètres `?lecon=` : branche distante uniquement » | ✅ **Exacte** | `grep -cE "ecrireParametresPourTab\|queryPourLecon…"` sur les 3 fichiers de `reorganisation-med` = **0**. Le commit `e730d9c` ne lit que les paramètres. |
| 3 | « `RevisionView.tsx` / `MethodologyCompilerView.tsx` / `public/sw.js` supprimés dans l'autre branche ? » | ❌ **Inexacte** | Les 3 fichiers existent sur **les deux** branches (blobs différents, mais présents). |
| 4 | « 41 fichiers source pertinents mentionnés dans votre rapport » | ⚠️ **Conflation — je corrige aussi ma propre formulation** | `41` = nombre de fichiers du `compare` GitHub **depuis le merge-base** `d467ba97` (3 commits de ma branche : `e260825`, `f4bc4f4`, `a873d74`). Ce n'est **pas** la liste des fichiers divergents entre les deux pointes. |
| 5 | « ~135 fichiers modifiés » | ✅ **Exact** | `contenus différents = 135` entre les deux arbres (dont **105** dans `src/`). |
| 6 | « suppressions massives dans `archive/` + CPython » | ✅ Exact mais ordre de grandeur à préciser | 3 462 fichiers présents seulement sur `reorganisation-med` : `Python/` **2 331**, `Rebrique-sujet-BAC-main/` **489**, `docs/` **413**, `android/` 53, `archive/` **45**, `src/` 43, `LIVRE_SULAYMAN/` 34, `public/` 28. |
| 7 | « 3897 vitest / 3833 jest vs 3628 / 3574 ⇒ branche la plus testée est meilleure » | ⚠️ **Fait + interprétation à séparer** | Les nombres sont ceux des messages de commit. Mais les arbres n'ont pas la même taille : **4 814 blobs** sur `reorganisation-med` contre **1 083** sur la mienne. Plus de tests = base plus complète, **pas** une preuve de supériorité fonctionnelle. |
| 8 | « `AGENTS.md` : exceptions signées » | ✅ Exact sur leur branche | Blob `4a62a3d2` chez eux vs `ffdb0fee` chez moi. Sur ma branche, `AGENTS.md` n'a **pas** été modifié. |

### Chiffres consolidés (arbres des deux pointes)

| Mesure | Valeur |
|---|---|
| Blobs : ma branche / leur branche | **1 083 / 4 814** |
| Présents seulement chez eux / seulement chez moi | **3 462 / 53** |
| Contenus différents (105 dans `src/`) | **135** |
| **Total fichiers divergents entre les pointes** | **3 650** (cohérent avec les « 3597 entrées » du diff brut) |
| `compare` depuis merge-base `d467ba97` | `status: diverged`, `ahead_by: 3`, `behind_by: 97`, **41 fichiers** |
| `src/` communs : identiques / différents | **499 / 105** |

👉 **Constat majeur :** le cœur de la navigation est **déjà commun**. `apprentissageNav.ts`, `apprentissageProgression.ts` et `ApprentissageTabs.tsx` sont **byte-identiques** sur les deux branches. Sur 604 fichiers `src/` communs, 499 sont identiques.

---

## 2. La seule divergence fonctionnelle réelle

`diff -u` des deux fichiers d'utilitaires, **version `reorganisation-med` → version `arena/bcf8863b`** : uniquement des ajouts, **aucune suppression**.

| Fichier | Delta |
|---|---|
| `src/utils/navigationHash.ts` | **+16 lignes** : `export function ecrireParametresPourTab(tab, query)` |
| `src/utils/deepLinkInterne.ts` | **+14 lignes** : `queryPourLecon` / `queryPourQcm` / `queryPourExamen` / `queryPourIdee` |
| `src/utils/deepLinkInterne.lock.test.ts` | **+4 tests** (13 → 17) : aller-retour, écriture du hash, conservation par `remplacerRoutePourTab`, consommation par `pousserRoutePourTab`, onglet sans route |
| `src/data/apprentissageNav.lock.test.ts` | **+1 test** (19 → 20) : les 4 raccourcis internes écrivent leur cible |
| `src/App.tsx` | **4 points d'appel** (une ligne chacun) dans `ouvrirLeçonDepuisParcours`, `ouvrirQcmDepuisParcours`, `ouvrirExamen`, `onOpenRedaction` + import des 5 symboles |
| `SPEC_NAVIGATION_4_RUBRIQUES_2026-11-05.md` | §4 « Aller-retour complet », §6 chiffres, §7 reste à faire |

**Total à porter : ~30 lignes de code + 5 tests + 4 one-liners.** Aucun fichier BAC, aucun fichier `archive/`, aucun fichier Python, aucun `.github/`, aucun `package.json` n'est nécessaire.

### ⚠️ Risque d'adaptation (à ne pas sous-estimer)

`reorganisation-med` possède **deux mécanismes d'écriture d'URL** dans `src/App.tsx` :

- `TAB_ROUTE` + `navigateToTab()` (hashes historiques `#lesson`, `#training`, `#bacideas`…) — utilisé par les 4 handlers à modifier ;
- `pousserRoutePourTab()` / `remplacerRoutePourTab()` (hashes canoniques `#/apprentissage/cours`…) — utilisé ailleurs (lignes 1004 / 356).

Sur ma branche, les handlers appellent `setCurrentTab(...)` directement. **Le port n'est donc pas un copier-coller aveugle** : il faut appeler `ecrireParametresPourTab` **après** `navigateToTab(...)`, sinon le `pushState` de `navigateToTab` écrase la query. L'ordre et la coexistence des deux formats de hash doivent être **vérifiés par un test local** sur `reorganisation-med`. Je ne peux pas le garantir depuis ici.

---

## 3. Proposition de convergence (aucune exécution)

### Option A — base `reorganisation-med` (recommandée, sous réserve de l'arbitrage)

1. **Ne pas merger ni cherry-picker `a873d74`** : 3 650 fichiers divergents, 97 commits d'écart, 37 fichiers dans le commit dont la plupart ont des blobs différents → conflits massifs pour 30 lignes utiles.
2. **Porter manuellement le delta §2** : les 2 blocs de fonctions, les 4 appels, les 5 tests, la mise à jour de la spec.
3. **Adapter à `navigateToTab`** (voir risque ci-dessus) et ajouter un test qui simule un handler puis relit `window.location.hash`.
4. **Ne rien importer** de `Python/`, `Rebrique-sujet-BAC-main/`, `archive/`, `docs/`, ni aucun binaire : ce sont des différences d'historique, pas du produit.
5. **Revalider sur la base retenue** : `lint` → `npm test` → `test:jest` → `test:build`. Les compteurs de leur base (3897 / 3833) doivent rester **≥** après ajout des 5 tests ; le poids de l'entrée doit rester < 700 Ko.

### Option B — base `arena/bcf8863b-kunz-el-ouloum`

Techniquement possible mais **déconseillé** : elle est un snapshot élagué (1 083 blobs). Récupérer la base complète imposerait d'importer 3 462 fichiers, dont 2 331 fichiers CPython, puis de réconcilier 105 fichiers `src/` différents. Rapport bénéfice/risque défavorable.

### Option C — statu quo

Conserver les deux branches, documenter `reorganisation-med` comme référence produit et `arena/bcf8863b…` comme branche de session Arena (archivée). Zéro risque, mais deux implémentations de « 6 → 4 » coexistent.

### Ce que je ne ferai pas sans consigne explicite

Modifier une branche, merger, rebaser, cherry-picker, pousser, ouvrir une PR, ou appliquer quoi que ce soit sur `reorganisation-med`. **Mon environnement de session est lié à `arena/bcf8863b-kunz-el-ouloum`** ; je ne peux pas basculer dessus.

---

## 4. Réponses aux 3 questions d'arbitrage

1. **Branche de référence unique ?** Je reste neutre : les faits penchent pour `reorganisation-med` (arbre 4,4× plus complet, 97 commits de plus, déjà votre branche de travail active). Mais la décision vous appartient ; je n'ai pas d'élément pour juger la qualité de son historique.
2. **Plan de merge fichier par fichier avec conflits anticipés ?** Ce document **est** ce plan, avec une précision : un « merge » n'est pas l'outil adapté — la convergence utile tient en ~30 lignes à porter manuellement. Je peux produire, à la demande, un patch `diff -u` applicable sur les 2 fichiers d'utilitaires (ils ne diffèrent que par des ajouts), mais **pas** sur `src/App.tsx` dont les corps de handlers sont trop différents.
3. **Implémenter l'écriture `?lecon=` sur `reorganisation-med` ?** C'est le seul manque fonctionnel identifié. Je ne peux pas le faire depuis ce sandbox ; je peux fournir le patch + la recette de test, et c'est à appliquer dans votre clone.

---

## 5. « Non vérifiable » depuis ce sandbox

- Le contenu de `C:\Users\zakaria\Documents\application kunz el ouloum finale`, votre `git remote -v`, l'état de vos refs locales et le moment de votre dernier `fetch`.
- L'affirmation « déjà validée en live par CDP » et le caractère « vert » de `e730d9c` : je lis le message de commit, je n'ai pas exécuté leurs suites.
- Le comportement réel du port de `ecrireParametresPourTab` face à `TAB_ROUTE` / `navigateToTab` sur leur base : nécessite un test local.
- Qui a poussé `e730d9c` et `040ed1c`, et l'existence éventuelle d'une troisième session de travail.

*Aucune source web externe n'a été consultée pour cette analyse ; uniquement l'API GitHub du dépôt et le clone local du sandbox.*
