# Patch — « Consigne d'entrée » de la rubrique التمارين والتدريب

**Date :** 2026-11-04 · **Branche :** `arena/5420e52e-kunz-el-ouloum` (`active`) · **HEAD :** `718d1fe` · **master :** `c701738`
**Livrables :** `patches/ENTREE_CAPITAINE_2026-11-04.patch` (567 lignes, 27 411 octets) + cette note.
**Statut :** patch **préparé et vérifié**, **NON appliqué** au dépôt. Aucun fichier source suivi modifié, aucun commit, aucun push, aucun merge, aucun changement de branche.

---

## 1. Ce que ce patch corrige

Constat de l'audit (`AUDIT_RUBRIQUE_TAMARIN_EXO_2026-11-04.md`) : 7 cartes de poids visuel égal, sous-titre générique `اختر الحركة التي تريد تمرينها اليوم`, **zéro `ابدأ`** dans `TrainingHubView.tsx` + `trainingHub.ts`, un cadenas dès le 1ᵉʳ jour, et une consigne de 1ʳᵉ visite qui ne nomme **aucun module**. L'élève ne sait pas par quoi commencer.

**Décision propriétaire du 2026-11-04 (« c'est le Capitaine Kunz El Ouloum qui guide l'élève, c'est le coach ») :** la décision et la parole appartiennent au Capitaine. Il n'y a **ni helper-guide autonome, ni troisième voix, ni deuxième cerveau**. La fonction pure reste un **calcul interne au module du coach**, au même titre que `classerParUrgence`, `unitPriority` ou `nextBestAction`.

### Architecture en trois couches, un seul décideur

| Couche | Fichier | Rôle |
|---|---|---|
| État unique (déjà livré) | `src/hooks/useInvitationCapitaine.ts:268` → `src/lib/etatEleveRuntime.ts` | Le Capitaine assemble **une fois** et dépose `fournirEtatEleve(etat)`. Aucune relecture de stockage par le hub. |
| **Décision pure du Capitaine** | `src/lib/invitationCapitaine.ts` (ajout en fin de module) | `consigneEntreeTraining(etat, unitesCompletes)` → `ConsigneEntreeTraining \| null`. Aucun DOM, aucune écriture, aucune horloge. |
| Projection | `src/components/TrainingHubView.tsx` | Le hub **ne décide de rien** : il lit `etatEleveSiChargee()` et affiche UNE ligne + UN badge sur UNE carte. |

`App.tsx:1428-1429` (`accepter(); setCurrentTab(invitation.cible)`) reste inchangé : la bulle ouvre `training`, et le prop `onOpen(tab)` **déjà existant** mène au module désigné. **`App.tsx` n'est pas modifié** (`AGENTS.md:29`), ni `package.json`.

---

## 2. Contenu du patch

| Fichier | Nature | Lignes |
|---|---|---|
| `src/lib/invitationCapitaine.ts` | 1 import `type` + 1 bloc ajouté en fin de module | +132 |
| `src/components/TrainingHubView.tsx` | imports, calcul de la projection, 1 bloc de consigne, 1 badge conditionnel | +54 |
| `src/lib/__tests__/consigneEntreeTraining.test.ts` | **nouveau** — 14 tests comportementaux de la règle | +161 |
| `src/components/__tests__/consigneEntreeHub.test.tsx` | **nouveau** — 9 tests montant le VRAI hub | +161 |
| **Total** | **4 fichiers** | **+508 / −0** |

Aucun test existant n'est modifié. Aucun `readFileSync` / verrou de chaîne source dans les nouveaux tests : ils appellent la fonction, montent le composant, déposent un **vrai** état assemblé par `assemblerEtatEleve`, et cliquent.

### Table de décision pédagogique (dans le module du coach)

| État de l'élève | Module désigné | Geste |
|---|---|---|
| Date du BAC **officielle**, ≤ 30 jours, ≥ 2 unités complètes | `examens` | « اكتب محاكاة واحدة بورقة وقلم، ثم صحّحها. » |
| **0 unité** complète | `workshop` | « أنتج جوابًا واحدًا خطوة بخطوة، ثم صحّحه. » |
| Unité faible ou ≥ 2 erreurs au دفتر | `situations` | « حلّل سندًا واحدًا … ثم صحّح جوابك. » (unité nommée si connue) |
| Élève solide | `situations` | « حلّل سندًا واحدًا، ثم صحّح جوابك. » (cœur du BAC) |

Séquence conservée : **UN geste BAC → auto-correction → 10 minutes, un seul exercice**. Le QCM/flashcard reste un **échauffement diagnostique**, jamais une porte obligatoire ni une destination. Les 531 QCM / 569 flashcards existants ne sont pas déplacés.

### Les silences (verrou d'honnêteté)

`etat === null` · `competence.chargee === false` · `epreuveEnCours === true` → **`null`** : aucune recommandation inventée avec des données absentes. `unitesCompletes` négatif ou `NaN` est ramené à 0 sans exception. Une `dateProvisoire` n'annonce **aucun décompte**.

### Arbitrages tranchés dans ce patch

- **1ʳᵉ visite : la prescription PRIME.** `BandeauConseilRubrique` donne le *principe* (« un exercice complet vaut mieux que trois incomplets ») mais ne nomme aucune carte — c'est le défaut lui-même. Muter la consigne tant que le bandeau est ouvert aurait laissé « par quoi je commence ? » sans réponse au moment où l'élève en a le plus besoin. La consigne est donc affichée **dès la première ouverture**.
- **« Une seule voix » respectée sans cacher la consigne :** un seul décideur (`consigneEntreeTraining`), un seul personnage **en grand** (le bandeau, qui garde son `<img>`), et le bloc du hub n'affiche **aucune image** — le guide y **signe** son nom, il ne se redessine pas. Test dédié : `bloc.querySelector('img') === null`.
- **Zéro nouvelle porte** : `TRAINING_ENTRIES` inchangé (7 cartes), aucun nouvel onglet, `PortesUniques` et `cadenasHubs` restent verts. Le badge s'appelle `recommande-aujourdhui` (pas de préfixe `hub-`) pour ne pas se faire compter comme une 8ᵉ carte.
- **Jamais de carte cadenassée** : seuls `situations`, `workshop`, `examens` sont désignables, tous libres dès le 1ᵉʳ jour ; test qui parcourt 7 états et vérifie `deverrouApresUnites === undefined`.
- **`CibleInvitation` inchangé** : la bulle garde `cible: 'training'`, donc `invitationCapitaine.test.ts:125` et `cablageCapitaine.test.ts` ne bougent pas.
- **Zéro stockage** : aucune clé, aucun `setItem`, aucune couleur/consigne persistée — projection dérivée uniquement.

---

## 3. Vérifications mesurées (bancs d'essai `/tmp`, arbre du dépôt intact)

| Contrôle | Résultat |
|---|---|
| `git apply --check` sur **`HEAD`** et sur **`master`** | **OK ✅ sur les deux** ; appliqué sur les deux (4 fichiers) |
| Identité des fichiers cibles `HEAD` ↔ `master` | 7/8 identiques ; seul `etatEleveRuntime.ts` diffère (`surveillerEtatEleve` M1) — **non modifié**, `etatEleveSiChargee()` existe sur les deux |
| `npx tsc --noEmit` | **0 erreur** |
| Vitest ciblé (9 fichiers : 2 nouveaux + 7 verrous) sur `HEAD` | **9 fichiers / 129 tests / 129 verts** |
| Idem sur `master` | **9 fichiers / 129 tests / 129 verts** |
| Jest (`--runTestsByPath`, 2 nouveaux fichiers) | **2 suites / 23 tests / 23 verts** |
| **Preuve négative** (tests seuls, arbre vierge **sans** patch) | **19 rouges / 4 verts sur 23** → les tests sont bien comportementaux, pas des verrous de source |
| `npm run build` | **OK** (avertissement `import.meta`/CJS préexistant, sans rapport) |
| Budgets `vite.build-test.config.ts` | **4 fichiers / 20 tests / 20 verts** (bundle, offline, lazy chunks, leçons) |
| Suite vitest **complète** | **3 706 tests : 3 692 verts, 8 ignorés, 6 rouges** |
| Nature des 6 rouges | `server/storeFacturation.lock.test.ts` = **5** (`better-sqlite3` natif absent du sandbox) + `server/store.pg.dates.test.ts` = **1** (fuseau) |
| **Comparaison à l'arbre vierge** | Les **mêmes 6 échecs** (1 + 5) sur l'arbre **sans patch** → **aucune régression** ; `TZ=Africa/Algiers` ⇒ `store.pg.dates` **3/3 verts** |
| Contrôle statique du patch | 4 fichiers seulement ; 0 `setItem`/`CLE_` ; `CibleInvitation` non modifié ; 0 nouvelle entrée de hub |

---

## 4. Limites et « Non vérifiable »

- **Le « rappel 3 min » inline n'est PAS dans ce patch.** Ce lot livre la **consigne d'entrée** (décision + projection). Servir 3 QCM/cartes dues inline avant le geste BAC est un **lot suivant**, volontairement séparé pour ne pas créer une 8ᵉ porte ni mélanger consolidation (`المراجعة`) et entraînement. Ne pas affirmer que l'échauffement est déjà câblé.
- **Aucune mesure terrain** : temps jusqu'à la 1ʳᵉ action, complétion, part atteignant `situations`/`workshop`, A/B, device réel, conformité programme post-2017 → **Non vérifiable**. La mesure terrain reste à conduire après application.
- **Le lot M3 n'est pas concerné** : `copies_validation_m3/` ne contient toujours que `README.md` ; ce patch ne valide pas le correcteur.
- **Le patch n'est pas appliqué**, ni committé, ni poussé. Il est autonome : `git apply` sur `HEAD` ou `master`.

---

## 5. Application (si GO)

```bash
cd /home/user/kunz-el-ouloum
git apply --check patches/ENTREE_CAPITAINE_2026-11-04.patch
git apply patches/ENTREE_CAPITAINE_2026-11-04.patch
npx tsc --noEmit
npx vitest run src/lib/__tests__/consigneEntreeTraining.test.ts \
  src/components/__tests__/consigneEntreeHub.test.tsx \
  src/components/__tests__/TrainingHubView.test.tsx \
  src/components/__tests__/PortesUniques.test.tsx \
  src/components/__tests__/cadenasHubs.test.tsx
```

`git apply -R patches/ENTREE_CAPITAINE_2026-11-04.patch` pour revenir en arrière (le patch ne touche aucun fichier protégé).

---

## 6. Empreintes

```
patches/ENTREE_CAPITAINE_2026-11-04.patch  567 lignes / 27 411 octets
SHA-256  c503825a522e70bb71f09748a508b5531033cf7a216144dbc382f6d1d3be9360
```

Rapport d'audit associé : `AUDIT_RUBRIQUE_TAMARIN_EXO_2026-11-04.md` (arbitrage propriétaire intégré au §4, correction factuelle `fournirEtatEleve` déjà câblé sur la branche active).
