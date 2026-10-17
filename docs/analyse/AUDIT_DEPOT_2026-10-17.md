# Audit du dépôt `sinamind414/kunz-el-ouloum`

**Date** : 17 octobre 2026 · **Objet** : état technique du dépôt, pas du contenu pédagogique.
**Méthode** : inspection de l'arbre Git, de la configuration, des dépendances, de la CI
et de l'état des branches. Chaque constat est accompagné de la commande ou du fichier
qui l'établit.

> **Remarque préalable** : l'URL fournie est celle du dépôt sur lequel la mission se
> déroule déjà. Ce n'est donc pas un dépôt tiers — l'audit porte sur l'état actuel,
> y compris sur ce que mes propres sprints y ont laissé.

---

## 1. Carte d'identité

| | |
|---|---|
| Visibilité | **public** |
| Licence | AGPL-3.0 |
| Branche par défaut | `master` |
| Créé le | 5 juillet 2026 |
| Taille côté GitHub | 35,5 Mo (`size-pack` local : 36,6 Mio) |
| Fichiers suivis | **717** |
| Lignes TypeScript / TSX (src) | **83 351** |
| Fichiers de test | 151 fichiers, **1 912 tests** verts |

---

## 2. Les cinq constats qui méritent une décision

### 🔴 1. Tout le travail récent est hors de `master`

```
origin/master → origin/arena/01a0df17… : 219 commits d'avance
origin/arena/01a0df17… → origin/master :   1 commit d'avance
```

`master` pointe sur `aa1ea80`. **219 commits** — les 71 sprints de cette mission, le
corpus BAC, les six leçons injectées, la chaîne de mesure de l'apprentissage — vivent
sur une branche de travail. Un visiteur du dépôt, un collaborateur ou un déploiement
basé sur la branche par défaut ne voit **rien** de tout cela.

C'est le point le plus important de cet audit : ce n'est pas un défaut de code, c'est
un risque de perte de valeur.

**Action** : ouvrir une pull request de `arena/01a0df17-kunz-el-ouloum` vers `master`
et la fusionner. Je peux le faire sur demande.

### 🟠 2. Cinq pull requests ouvertes, dont une de septembre

| PR | Titre | Depuis |
|---|---|---|
| 39 | Audit Miftah : parcours progressif et provenance prudente | 17 oct. |
| 38 | diag(M7) : poids du premier affichage | 14 oct. |
| 36 | Correctifs prioritaires de Morchid | 5 oct. |
| 35 | docs : bilan vérité + feuille de route | 1ᵉʳ oct. |
| 4 | restaure+struct(okacha) : المنهجية | **23 sept.** |

Neuf branches distantes au total. Des PR qui dorment un mois deviennent impossibles à
fusionner : elles divergent plus vite qu'on ne les relit. **Décider pour chacune :
fusionner ou fermer.** Une PR fermée n'est pas une perte — la branche reste.

### 🟠 3. Deux vulnérabilités dans les dépendances de production

```
CRITIQUE  proxy-addr   — usurpation d'IP via sous-réseau IPv6 mappé IPv4 (GHSA-jqcg-44mw-7w3h)
HAUTE     source-map-js — déni de service sur la boucle d'événements (GHSA-68fv-2mgg-jv7q)
```

Les deux sont **corrigeables automatiquement** (`npm audit fix`). `proxy-addr` est une
dépendance d'Express : elle sert à déterminer l'IP réelle du client derrière un proxy —
c'est-à-dire exactement ce sur quoi repose la limitation de débit
(`server/rateLimit.ts`). La criticité n'est pas théorique pour ce projet.

### 🟡 4. Deux lanceurs de tests pour le même périmètre

`jest.config.cjs` (+ `babel.config.cjs`) et Vitest ciblent **les 148 mêmes fichiers**.
Trois configurations à maintenir (`jest.config.cjs`, `babel.config.cjs`,
`vite.build-test.config.ts`), deux écosystèmes de mocks, et un risque réel : un test
qui passe sous un lanceur et échoue sous l'autre. La CI n'appelle que Vitest —
**Jest n'est donc exécuté par personne**, mais reste dans l'arbre.

**Action** : supprimer Jest et Babel, ou assumer un rôle distinct pour chacun. En
l'état, c'est de la configuration morte.

### 🟡 5. La CI ne garde que la moitié de ce que le projet protège

`.github/workflows/ci.yml` lance trois jobs : `check:v2`, `npm test` (harnais natif),
`test:vitest`. **Manquent** :

- `npm run lint` (`tsc --noEmit`) — la vérification de types complète ;
- `npm run test:build` — les budgets de taille (entrée ≤ 700 Ko, chunk ≤ 800 Ko) et le
  manifeste hors ligne.

Autrement dit : un commit peut faire grossir le bundle de 3 Mo ou casser le mode hors
ligne **sans que la CI s'en aperçoive**. Ces garde-fous existent et sont verts ;
ils ne sont simplement pas branchés.

Second point : la CI ne se déclenche que sur `master` — donc, vu le constat n° 1, sur
presque rien.

---

## 3. Qualité du code

| Indicateur | Valeur | Lecture |
|---|---|---|
| `tsc --noEmit` | **propre** | aucune erreur de type |
| Tests | **1 912 verts, 0 échec** | 151 fichiers |
| `TODO` / `FIXME` / `@ts-ignore` | **6** | remarquablement bas pour 83 000 lignes |
| `any` explicites | **106** | à surveiller, concentrés dans les vues anciennes |
| Secrets en dur | **aucun** | vérifié par motif sur `src`, `server`, `scripts` |
| `dist/` suivi par Git | **non** | correct |

### Fichiers trop gros

| Fichier | Lignes |
|---|---|
| `src/components/MethodologyCompilerView.tsx` | **2 364** |
| `src/components/StatsView.tsx` | 1 305 |
| `src/App.tsx` | 954 |
| `src/components/ActiveLessonView.tsx` | 916 |

`MethodologyCompilerView` à 2 364 lignes est le candidat naturel au découpage : à cette
taille, un composant n'est plus relu, il est contourné. Ce n'est pas urgent — rien n'y
est cassé — mais c'est là que la prochaine régression se logera.

### Code mort

Recherche d'orphelins sur les 95 composants : **aucun**. Les cinq faux positifs
initiaux (`BacExamView`, `MindMapView`, `OkachaView`, `QcmLivreView`, `SearchView`)
sont tous atteints par `lazy(() => import(...))`. C'est un bon résultat pour un projet
de cette taille.

---

## 4. Dépendances

17 dépendances de production, 26 de développement.

**Trois outils de build sont déclarés en production** : `vite`, `@vitejs/plugin-react`,
`@tailwindcss/vite`. `vite` figure même **dans les deux listes à la fois**. Sans
conséquence fonctionnelle, mais une installation serveur (`npm ci --omit=dev`) traîne
inutilement la chaîne de build.

**Deux bases de données coexistent** : `better-sqlite3` et `pg`, plus
`@supabase/supabase-js`. Trois chemins de persistance pour un produit — c'est beaucoup.
À documenter clairement (lequel fait foi, lesquels sont des reliquats) ou à réduire.

Rappel contextuel : `better-sqlite3` est un module natif, ce qui rend l'installation
fragile sur un hôte sans chaîne de compilation. Le mode dégradé
(`server/store.degraded.ts`) couvre déjà ce cas.

---

## 5. Hygiène du dépôt

**Fait aujourd'hui** : 142 fichiers de travail supprimés de la racine (sorties d'audit,
scripts jetables, dumps). Racine passée de **189 à 47 entrées**.

**Reste à arbitrer** — des sources, pas des déchets, d'où mon abstention :

| Fichier | Taille |
|---|---|
| `المكتبة_الكاملة_SVT.md` | 2,0 Mo |
| `PROGRAMME NATIONAL SVT CLAUDE OPUS - Copie.MD` | 608 Ko |
| `FINALBAC_VOLUME_1.txt` / `_2.txt` | — |
| `الملخص_الشامل_لآليات_تركيب_البروتين.jpg` | 724 Ko |
| 3 autres images, `al_miftah_final_v6.html` | — |

Ces fichiers n'ont pas leur place à la racine d'un dépôt applicatif. La bonne
destination est `docs/sources/` (qui existe déjà) ou un stockage externe.

**Images lourdes versionnées** : `schema_16_subduction.png` (1,1 Mo),
`schema_17_collision.png` (964 Ko), `schema_18_wilson.png` (596 Ko),
`schema_09_photosynthese.png` (672 Ko). Converties en WebP, elles perdraient 60 à 80 %
sans perte visible — soit environ **2 Mo de moins** dans le dépôt *et* dans ce que
télécharge un élève sur son forfait mobile.

**README** : celui du modèle Google AI Studio (« Run and deploy your AI Studio app »,
20 lignes, bandeau générique). Pour un dépôt **public** portant une application
aboutie, c'est la première chose que voit un visiteur — et elle ne décrit pas le
projet.

---

## 6. Ce qui est bien fait, et qu'il faut préserver

Un audit qui ne liste que des défauts est un audit malhonnête. Quatre points sortent
nettement de l'ordinaire :

1. **La densité de verrous.** 34 fichiers `*.lock.test.ts` protègent le contenu
   pédagogique — pas seulement le code. Un corpus qui se dégrade silencieusement est
   le mode de panne le plus courant de ce type de produit ; il est ici couvert.
2. **Les tests de budget.** Un plafond de poids vérifié automatiquement est rare dans
   un projet de cette taille, et c'est ce qui a permis de tenir 599 Ko à l'entrée après
   71 sprints d'ajouts.
3. **Les audits d'accessibilité automatisés** (noms accessibles, clavier,
   `:focus-visible`), qui scannent les sources et couvrent donc les fichiers futurs.
4. **La traçabilité documentaire.** 12 documents dans `docs/analyse/`, dont un journal
   de sprints qui explique les décisions *et les refus*. C'est ce qui rend le projet
   reprenable par quelqu'un d'autre.

---

## 7. Plan d'action proposé, par ordre de rendement

| # | Action | Effort | Gain |
|---|---|---|---|
| 1 | **Fusionner la branche de travail dans `master`** | 10 min | rend visibles 219 commits |
| 2 | `npm audit fix` (2 vulnérabilités, dont une critique) | 10 min | sécurité du rate-limit |
| 3 | Ajouter `lint` et `test:build` à la CI | 20 min | branche les garde-fous existants |
| 4 | Trancher les 5 PR ouvertes | 1 h | supprime la dette de branches |
| 5 | Supprimer Jest + Babel (configuration morte) | 30 min | un seul lanceur de tests |
| 6 | Déplacer `vite` et les plugins en `devDependencies` | 5 min | installation serveur plus propre |
| 7 | Réécrire le README (dépôt public) | 45 min | première impression |
| 8 | Déplacer les sources de la racine vers `docs/sources/` | 20 min | lisibilité |
| 9 | Convertir les 4 PNG lourds en WebP | 30 min | ≈ 2 Mo, et du forfait élève économisé |
| 10 | Découper `MethodologyCompilerView` (2 364 lignes) | 1 j | maintenabilité |

Les points **1 à 3** sont les seuls que je qualifierais d'urgents. Le reste est de
l'hygiène, à faire quand le calendrier le permet.

---

## 8. Verdict

Le dépôt est **sain sur le fond** : types propres, 1 912 tests verts, aucun secret en
dur, aucun code mort, et un niveau de protection du contenu inhabituellement élevé.

Ses faiblesses ne sont pas dans le code mais **autour** : une branche par défaut qui
ignore l'essentiel du travail, des PR qui dorment, deux CVE corrigeables en une
commande, et une CI qui n'exécute pas les garde-fous que le projet s'est pourtant
donnés.

Ce sont, heureusement, les défauts les moins coûteux à réparer.
