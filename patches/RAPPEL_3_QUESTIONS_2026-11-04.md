# Patch — Lot 2 « 3 questions de rappel inline »

**Date :** 2026-11-04 · **Branche :** `arena/5420e52e-kunz-el-ouloum` (`active`) · **HEAD :** `718d1fe` · **master :** `c701738`
**Livrables :** `patches/RAPPEL_3_QUESTIONS_2026-11-04.patch` (986 lignes, 43 146 octets) + cette note.
**PRÉREQUIS :** `patches/ENTREE_CAPITAINE_2026-11-04.patch` (lot 1) **doit être appliqué avant** — vérifié : le lot 2 seul est **refusé** par `git apply --check` sur un arbre vierge.
**Statut :** patch préparé et vérifié, **NON appliqué** au dépôt. Aucun fichier source suivi modifié, aucun commit, aucun push, aucun merge, aucun changement de branche.

---

## 1. Ce que le lot livre

La séquence arbitrée par l'audit : **`Rappel 3 min → UN geste BAC → auto-correction → SRS à la maison`**. Le lot 1 avait livré la consigne d'entrée ; le lot 2 livre l'échauffement, **dans le hub**, sans nouvelle porte.

| Couche | Fichier | Rôle |
|---|---|---|
| État unique (déjà livré) | `useInvitationCapitaine.ts:268` → `etatEleveRuntime.ts` | Le Capitaine dépose **une fois** son état. |
| **Décision 1 (lot 1)** | `src/lib/invitationCapitaine.ts` | `consigneEntreeTraining()` → UN module BAC. |
| **Décision 2 (lot 2)** | `src/lib/invitationCapitaine.ts` (2ᵉ bloc ajouté) | `tirageRappelTrois()` → **3 questions** choisies par le Capitaine. |
| Affichage sans parole | `src/components/RappelTroisQuestions.tsx` (**nouveau**) | Panneau de 3 questions, feedback immédiat, CTA final. Aucun nom de guide, aucun visage. |
| Projection | `src/components/TrainingHubView.tsx` | Le hub ne décide de rien : il passe les 3 questions au panneau et le MÊME `onOpen(tab)` au CTA. |

`App.tsx` et `package.json` **ne sont pas modifiés** (`AGENTS.md:29`).

### Tirage pédagogique (règle pure, dans le module du coach)

1. **Cartes DUES d'abord** — `sortByDue()` en **lecture seule** de l'état SM-2 existant, mapping `fc_q_<id>` → QCM.
2. **Unité faible** du coach (`unitePrioritaire` / `faibles[0]`, préfixe numérique du titre, `null` si absent ⇒ aucun filtre deviné).
3. **Rotation stable du jour** (`jourLocal()`), jamais `Math.random()` : les 3 questions ne changent pas à chaque rendu React.

Résultat : **au plus 3** questions, toutes issues de `SVT_QUIZ_QUESTIONS` (531 QCM, `kind !== 'fillBlank'`), sans doublon, sans question inventée. Catalogue vide ou corpus hors ligne ⇒ `[]` et un message honnête. Les 569 flashcards / 41 chapitres / 15 bilans ne sont pas déplacés.

### Le piège évité : le poids du corpus

Ce module est importé **statiquement** par le hook du Capitaine, donc par le bundle d'entrée. Lui faire importer `src/data/index.ts` rejouerait le défaut du sprint 31 (« 549 QCM téléchargés avant le tableau de bord »). Le catalogue est donc **reçu en paramètre**, depuis `peekCorpus()` / `loadCorpus()` — **déjà** utilisés par `App.tsx:431` (préchargement au repos) et `:608`.

Mesuré au build : **+0 Ko de corpus**, **+0 requête**, le chunk `TrainingHubView` ne référence **aucun** `svt-corpus` / `svt-qcm-*`. Coût réel du lot, honnêtement : **entrée 522 → 523 Ko (+1 Ko)**, **chunk du hub 6 → 11 Ko (+5 Ko)**, 87 → 88 chunks. Plafond d'entrée = 700 Ko, plafond de chunk = 800 Ko : largement tenus.

---

## 2. Contenu du patch

| Fichier | Nature | Lignes |
|---|---|---|
| `src/lib/invitationCapitaine.ts` | 2ᵉ bloc pur ajouté après le lot 1 | +132 |
| `src/components/TrainingHubView.tsx` | imports, `useMemo`, corpus à la demande, rendu du panneau | +? (diff) |
| `src/components/RappelTroisQuestions.tsx` | **nouveau** composant | +211 |
| `src/lib/__tests__/tirageRappelTrois.test.ts` | **nouveau** — 13 tests de la règle | +130 |
| `src/components/__tests__/rappelTroisQuestions.test.tsx` | **nouveau** — 13 tests du panneau | +183 |
| `src/components/__tests__/rappelHubIntegration.test.tsx` | **nouveau** — 8 tests du VRAI hub | +173 |
| **Total** | **6 fichiers** | **+909 / −5** |

Aucun test existant n'est modifié. Aucun `readFileSync` / verrou de chaîne source : les tests appellent la règle, montent les composants, déposent un **vrai** état via `fournirEtatEleve`, cliquent sur les options et vérifient le CTA.

---

## 3. Arbitrages tranchés

- **Optionnel, jamais une porte obligatoire.** Le panneau commence par un bouton `ابدأ الاستذكار` + « اختياري ». L'élève qui ne clique pas voit **la consigne du Capitaine et les 7 cartes** exactement comme au lot 1 ; `تخطّي الاستذكار` ferme le panneau. Test : les 3 (rappel / consigne / badge) coexistent, et démarrer le rappel ne cache ni la consigne ni les cartes.
- **Une seule voix.** Le panneau n'affiche **ni `CAPITAINE_IDENTITE_AR`, ni `<img>`, ni nom de guide** — test dédié. Le personnage en grand reste unique (`BandeauConseilRubrique`). Le Capitaine **décide** (deux règles pures dans SON module) ; l'outil ne parle pas.
- **Aucune notation, aucun SRS ici.** Réponses en `useState` uniquement : zéro `rateCard`, zéro `enregistrerErreurs`, zéro `setItem`, zéro nouvelle clé. Le SRS reste « à la maison » dans `RevisionView`. Test : `localStorage.length` inchangé sur tout le parcours.
- **Aucune nouvelle porte.** `TRAINING_ENTRIES` inchangé (7), aucun onglet, aucune entrée de menu. Le CTA final appelle le **MÊME** `onOpen(consigne.tab)` que la carte recommandée ; sans consigne d'état, **aucun CTA inventé**. `PortesUniques` / `cadenasHubs` restent verts.
- **Feedback diagnostique immédiat.** Une question à la fois, bonne/mauvaise réponse, **la bonne réponse est nommée**, `explanation` du corpus affichée, bilan `x/3`, puis CTA. Une seule réponse comptée par question (2ᵉ clic ignoré). Pas de chronomètre coercitif : « 3 دقائق » est un format annoncé, pas un compte à rebours.
- **Corpus chargé au clic seulement.** `peekCorpus()` synchrone d'abord ; `loadCorpus()` (déjà pourvu d'un cache de module) uniquement si l'élève choisit l'échauffement. Aucun import dynamique pour celui qui va droit au geste BAC. Prop `corpusRappel` injectable pour les tests / rendu hors ligne.
- **Honnêteté des silences du lot 1 conservée** : état absent, compétence non chargée ou épreuve ⇒ pas de consigne, donc pas de CTA ; le rappel reste disponible mais ne recommande rien.

---

## 4. Vérifications mesurées (bancs `/tmp`, dépôt intact)

| Contrôle | Résultat |
|---|---|
| `git apply --check` **lot 1 puis lot 2** sur `HEAD` **et** `master` | **OK ✅ sur les deux** |
| Lot 2 **seul** sur arbre vierge | **refusé ✅** → prérequis lot 1 confirmé |
| `npx tsc --noEmit` | **0 erreur** |
| Vitest ciblé (13 fichiers : 5 nouveaux + 8 verrous) sur `HEAD` | **13 fichiers / 169 tests / 169 verts** |
| Idem sur `master` | **13 fichiers / 169 tests / 169 verts** |
| Jest (`--runTestsByPath`, 5 nouveaux fichiers) | **5 suites / 57 tests / 57 verts** |
| **Preuve négative** (lot 1 seul + les 3 tests du lot 2) | **20 rouges / 1 vert sur 21** → tests comportementaux, pas verrous de source |
| `npm run build` | **OK** (avertissement `import.meta`/CJS préexistant) |
| Budgets `vite.build-test.config.ts` | **4 fichiers / 20 tests / 20 verts** |
| Poids mesuré | entrée **522 → 523 Ko**, chunk hub **6 → 11 Ko**, **+0 Ko de corpus**, aucune référence `svt-*` dans le chunk du hub |
| Suite vitest **complète** (lot 1 + lot 2) | **3 740 tests : 3 726 verts, 8 ignorés, 6 rouges** (= 3 706 du lot 1 **+34** nouveaux tests) |
| Nature des 6 rouges | `server/store.pg.dates.test.ts` = **1** (fuseau, vert en `TZ=Africa/Algiers`) + `server/storeFacturation.lock.test.ts` = **5** (`better-sqlite3` natif absent du sandbox) — **identiques à l'arbre vierge sans patch** (prouvé au lot 1) ; le lot 2 ne touche **aucun** fichier `server/` ⇒ **aucune régression** |
| Contrôle statique du patch | 0 `diff --git` sur `App.tsx`/`package.json`, 0 `setItem`/`CLE_`, 0 nouvelle entrée `TRAINING_ENTRIES`, 0 import statique de `data/index`/`quizCorpus` |

---

## 5. Limites et « Non vérifiable »

- **Aucune mesure terrain** : temps réel jusqu'à la 1ʳᵉ action, taux de complétion du rappel, part atteignant `situations`/`workshop`, A/B « avec / sans rappel », device 3G réel → **Non vérifiable**. Les « 3 دقائق » sont un **format annoncé**, pas une durée mesurée.
- **Le rappel ne note pas l'élève** : c'est un choix. Aucun branchement vers `profilErreurs` ici (contrairement à l'hypothèse initiale de l'audit) ; le diagnostic reste **visuel** (bilan `x/3`) et le SRS se fait dans `RevisionView`. Si vous voulez que les 3 erreurs alimentent le دفتر, c'est un **lot 3** à arbitrer séparément.
- **Pas de chronomètre** : volontaire pour ne pas transformer l'échauffement en porte obligatoire.
- **M3** toujours en attente du lot de 30 copies (`copies_validation_m3/` = `README.md` seul) ; ce patch ne valide pas le correcteur.
- **Le patch n'est ni appliqué, ni committé, ni poussé.** Appliquer les deux lots **dans l'ordre**.

---

## 6. Application (si GO)

```bash
cd /home/user/kunz-el-ouloum
git apply --check patches/ENTREE_CAPITAINE_2026-11-04.patch
git apply        patches/ENTREE_CAPITAINE_2026-11-04.patch
git apply --check patches/RAPPEL_3_QUESTIONS_2026-11-04.patch
git apply        patches/RAPPEL_3_QUESTIONS_2026-11-04.patch
npx tsc --noEmit
npx vitest run src/lib/__tests__/tirageRappelTrois.test.ts \
  src/components/__tests__/rappelTroisQuestions.test.tsx \
  src/components/__tests__/rappelHubIntegration.test.tsx \
  src/components/__tests__/consigneEntreeHub.test.tsx \
  src/lib/__tests__/consigneEntreeTraining.test.ts \
  src/components/__tests__/TrainingHubView.test.tsx \
  src/components/__tests__/PortesUniques.test.tsx
```

Retour arrière : `git apply -R` du lot 2, **puis** du lot 1. Aucun fichier protégé n'est touché.

---

## 7. Empreintes

```
patches/RAPPEL_3_QUESTIONS_2026-11-04.patch   986 lignes / 43 146 octets
SHA-256  78891336b64a3d7644679bfcffaca8ef96690ba2f2c463a47ec29b35a6a90c54
patches/ENTREE_CAPITAINE_2026-11-04.patch    567 lignes / 27 411 octets
SHA-256  c503825a522e70bb71f09748a508b5531033cf7a216144dbc382f6d1d3be9360
```

Rapport d'audit : `AUDIT_RUBRIQUE_TAMARIN_EXO_2026-11-04.md` · Note du lot 1 : `patches/ENTREE_CAPITAINE_2026-11-04.md`.
