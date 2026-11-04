# Patch — Lot 3 « les erreurs du rappel alimentent le دفتر الأخطاء »

**Date :** 2026-11-04 · **Branche :** `arena/5420e52e-kunz-el-ouloum` (`active`) · **HEAD :** `718d1fe` · **master :** `c701738`
**Livrables :** `patches/DEFTER_RAPPEL_2026-11-04.patch` (720 lignes, 32 390 octets) + cette note.
**PRÉREQUIS, dans cet ordre :** `ENTREE_CAPITAINE_2026-11-04.patch` (lot 1) **puis** `RAPPEL_3_QUESTIONS_2026-11-04.patch` (lot 2, version finale). Vérifié : le lot 3 seul est **refusé** par `git apply --check` sur un arbre vierge.
**Statut :** patch préparé et vérifié, **NON appliqué** au dépôt. Aucun fichier source suivi modifié, aucun commit, aucun push, aucun merge, aucun changement de branche.

---

## 1. ⚠️ Changement de contrat, explicite

Les lots 1 et 2 **n'écrivaient rien** (« zéro stockage », verrouillé par tests). **Le lot 3 écrit**, parce que c'est l'objet même de la demande : faire remonter les erreurs du rappel vers le دفتر.

| Ce qui change | Détail mesuré |
|---|---|
| Écriture | **Une seule**, sur la clé **existante** `boussole_profil_erreurs`, via `enregistrerErreurs()` |
| Déclencheur | **La déclaration explicite de l'élève** — jamais une déduction de l'application |
| Clé `boussole_erreurs_fermees` | Touchée **uniquement** si une erreur déjà fermée réapparaît (comportement **existant** de `enregistrerErreurs`, pas du lot) |
| **AUCUNE** nouvelle clé | Test : après déclaration, `Object.keys(localStorage) === ['boussole_profil_erreurs']` |
| **Jamais** écrit | `kunz_flashcard_srs_v1` (SRS), `kunz-rappel-adaptatif-v1`, aucun compteur d'activité, aucun `signalTravail` |

Le contrat produit **« Déclic → Focus → Révision, une fois/jour » n'est pas touché** : l'échauffement ne note pas l'élève, ne crédite aucune journée de travail et ne programme aucun SM-2. `App.tsx` et `package.json` **ne sont pas modifiés** (`AGENTS.md:29`).

---

## 2. Pourquoi l'élève DÉCLARE, et non l'application

Mesure du dépôt : `enregistrerErreurs()` **ignore tout code absent de `ERROR_TAXONOMY`**, et `QuizView.tsx:216` n'enregistre que la cause que l'élève **choisit** en fin de QCM (`CAUSES_QCM`, `causeParId`). `diagnosticQuiz.ts` le dit noir sur blanc :

> « aucune question du corpus ne porte d'étiquette de notion… **toute déduction serait une invention** ».

Déduire un code depuis l'option ratée aurait donc fabriqué un diagnostic. Le lot 3 réutilise **exactement** le dispositif existant :

- la **question** `QUESTION_CAUSE_AR` et les **4 causes** `CAUSES_QCM` (dont « سبب آخر » → `code: null` → **zéro écriture**) ;
- le **message** `REMERCIEMENT_CAUSE_AR`, et pour « autre » la chaîne **verbatim** de `QuizView.tsx:686` (`لم نسجّل شيئًا…`) — on ne dit pas « سُجّل » quand rien n'est écrit ;
- **une seule question, une seule fois par session**, seulement s'il y a eu au moins une vraie erreur (`doitDemanderCause` : `erreurs >= 1`).

---

## 3. Architecture — le Capitaine décide toujours

| Couche | Fichier | Rôle |
|---|---|---|
| **Décision pure** | `src/lib/invitationCapitaine.ts` (3ᵉ bloc) | `bilanDuRappel(questions, reponses)` → `{ erreurs, themes, aDeclarer }`. Une réponse **absente n'est pas une erreur inventée**. Thème = titre factuel de l'unité, sinon `الوحدة N` |
| Thème transmis | `src/components/TrainingHubView.tsx` | `themeAr` ajouté au catalogue depuis `PARCOURS_DOMAINS[].units[].title` — **donnée déjà existante**, aucune source neuve |
| Parole de l'élève | `src/components/RappelTroisQuestions.tsx` | Au bilan : question de cause + 4 boutons. **Aucun nom de guide, aucun visage** — une seule voix |
| **Pont d'écriture** | `src/lib/pontRappelErreurs.ts` (**nouveau**) | `enregistrerCauseDuRappel(causeId, theme)` → `causeParId` + `enregistrerErreurs`. **Adaptateur, pas un guide** : aucune décision pédagogique |

`QuestionRappel` gagne un champ optionnel `themeAr?: string` (rétro-compatible : le tirage du lot 2 ne change pas).

**Trois erreurs ≠ trois occurrences.** Une session = **UNE** écriture (`enregistrerErreurs([code])`). C'est un choix d'enseignant : gonfler le profil avec un QCM de 3 questions ferait croire à une mémoire d'erreurs qui n'existe pas.

---

## 4. Effet mesuré sur la parole du Capitaine

| Fait | Mesure |
|---|---|
| `contexteCapitaine()` | transmet `erreursAReprendre = etat.erreurs.total` (`etatEleve.ts:367`) |
| `invitationDuMoment()`, loi 3 | ne parle sur le motif « erreur » qu'à `j >= 3 && erreursAReprendre >= 2` |
| `resumeProfilAr()` | reste `null` tant que `occurrences < 2` |
| **Conséquence** | **UNE** déclaration = 1 occurrence ⇒ le Capitaine **ne change pas de discours** après un échauffement isolé. **Deux** sessions sur la même cause ⇒ le profil peut enfin parler. Les deux cas sont testés |

**Rafraîchissement DIFFÉRÉ (limite assumée).** `familleErreurs` est chargée par `import('../utils/profilErreurs')` dans `useInvitationCapitaine.ts`, sur `[signalTravail, version]`. Une déclaration ne modifie **ni** l'un **ni** l'autre : l'état `etat.erreurs` du Capitaine se relit au **prochain assemblage** (changement de rubrique, retour de visibilité, reprise / rechargement). Le دفتر, lui, est écrit **immédiatement**. Aucun nouvel évènement, aucun `App.tsx`, aucun abonnement bricolé. Si vous voulez une mise à jour instantanée de la consigne, c'est un **lot 4** distinct (hook + abonnement à l'état partagé).

---

## 5. Pont SM-2 délibérément ABSENT — mesure à l'appui

`planifierRappelsPourErreurs()` est le pont H1 branché sur `QuizView` et l'atelier. Exécuté le 2026-11-04 sur les **3 codes déclarables** :

```
notion_confusion     → AUCUNE micro-reprise
unsupported_claim    → AUCUNE micro-reprise
missing_reference    → AUCUNE micro-reprise
planifierRappelsPourErreurs([...]) → []
```

L'appeler ici chargerait un chunk de **164 Ko** pour un **no-op**. Il reste là où il est, prêt pour le jour où le corpus couvrira ces codes (même raisonnement que le commentaire H1 de `QuizView.tsx:218`). `cablageBoucleCoach.test.ts` reste vert.

---

## 6. Contenu du patch

| Fichier | Nature | Lignes |
|---|---|---|
| `src/lib/invitationCapitaine.ts` | `themeAr?` + 3ᵉ bloc pur (`bilanDuRappel`, `themeUniteAr`) | +? (diff) |
| `src/components/TrainingHubView.tsx` | titre d'unité transmis au catalogue | +? (diff) |
| `src/components/RappelTroisQuestions.tsx` | `reponses[]`, bilan, déclaration, accusé | +? (diff) |
| `src/lib/pontRappelErreurs.ts` | **nouveau** adaptateur d'écriture | +45 |
| `src/lib/__tests__/bilanDuRappel.test.ts` | **nouveau** — 10 tests de la règle pure | +92 |
| `src/components/__tests__/rappelVersDefter.test.tsx` | **nouveau** — 12 tests de la chaîne réelle | +259 |
| **Total** | **6 fichiers** | **+576 / −24** |

Aucun test existant n'est modifié. Aucun `readFileSync` / verrou de chaîne source dans les nouveaux tests : ils appellent les modules réels, cliquent et lisent `profilErreurs()`.

---

## 7. Vérifications mesurées (bancs `/tmp`, dépôt intact)

| Contrôle | Résultat |
|---|---|
| `git apply --check` **lot 1 → lot 2 → lot 3** sur `HEAD` **et** `master` | **OK ✅ sur les deux** |
| Lot 3 seul sur arbre vierge | **refusé ✅** → prérequis confirmés |
| `npx tsc --noEmit` | **0 erreur** |
| Vitest ciblé (19 fichiers : 7 nouveaux + 12 verrous, dont `chaineErreurQuiz.cablage`, `cablageBoucleCoach`, `poidsEntree.verrou`, `profilErreurs`, `PortesUniques`) sur `HEAD` | **19 fichiers / 238 tests / 238 verts** |
| Idem sur `master` | **19 fichiers / 238 tests / 238 verts** |
| Jest (7 fichiers nouveaux des 3 lots) | **7 suites / 79 tests / 79 verts** |
| **Preuve négative** (lots 1+2 seuls + les 2 tests du lot 3) | **2 fichiers en échec, 10 tests rouges** → le 2ᵉ fichier ne se collecte même pas (pont absent) |
| `npm run build` | **OK** (avertissement `import.meta`/CJS préexistant) |
| Budgets `vite.build-test.config.ts` | **4 fichiers / 20 tests / 20 verts** |
| Poids mesuré | entrée **523 → 524 Ko (+1)**, chunk hub **11 → 13 Ko (+2)**, **+0 Ko de corpus**, aucun `svt-*` référencé |
| Suite vitest **complète** (3 lots) | **3 762 tests : 3 748 verts, 8 ignorés, 6 rouges** (= 3 740 du lot 2 **+22** nouveaux) |
| Nature des 6 rouges | `server/store.pg.dates.test.ts` = **1** (fuseau, vert en `TZ=Africa/Algiers`) + `server/storeFacturation.lock.test.ts` = **5** (`better-sqlite3` natif absent du sandbox) — **identiques à l'arbre vierge** ; le lot 3 ne touche aucun fichier `server/` ⇒ **aucune régression** |
| Contrôle statique du patch | 0 `diff --git` sur `App.tsx`/`package.json`, 0 `setItem` direct, **0 appel** `rateCard` / **0 import** SRS (le mot n'apparaît que dans 2 commentaires), 0 import de `planificationRappels`, 0 nouvelle entrée `TRAINING_ENTRIES` |

---

## 8. Limites et « Non vérifiable »

- **Rafraîchissement différé** de l'état du Capitaine (§4) : le دفتر est immédiat, la consigne d'entrée ne se recalcule qu'au prochain assemblage. Mesuré, pas corrigé ici — lot 4 si vous le souhaitez.
- **Aucune mesure terrain** : taux de déclaration, pertinence des causes auto-déclarées, effet sur la réussite BAC, A/B, device réel → **Non vérifiable**. Le seuil « 2 occurrences avant de parler » est celui **déjà en vigueur** dans le produit, pas un seuil validé par expérimentation.
- **Le pont SM-2 reste ouvert** pour ces 3 codes (§5) — no-op mesuré aujourd'hui, à reconsidérer quand `microRemediations.ts` les couvrira.
- **M3** toujours en attente du lot de 30 copies (`copies_validation_m3/` = `README.md` seul) ; ce patch ne valide pas le correcteur.
- **Le patch n'est ni appliqué, ni committé, ni poussé.** Appliquer les trois lots **dans l'ordre**.

---

## 9. Application (si GO)

```bash
cd /home/user/kunz-el-ouloum
git apply --check patches/ENTREE_CAPITAINE_2026-11-04.patch
git apply        patches/ENTREE_CAPITAINE_2026-11-04.patch
git apply --check patches/RAPPEL_3_QUESTIONS_2026-11-04.patch
git apply        patches/RAPPEL_3_QUESTIONS_2026-11-04.patch
git apply --check patches/DEFTER_RAPPEL_2026-11-04.patch
git apply        patches/DEFTER_RAPPEL_2026-11-04.patch
npx tsc --noEmit
npx vitest run src/lib/__tests__/bilanDuRappel.test.ts \
  src/components/__tests__/rappelVersDefter.test.tsx \
  src/components/__tests__/rappelTroisQuestions.test.tsx \
  src/components/__tests__/consigneEntreeHub.test.tsx \
  src/lib/__tests__/consigneEntreeTraining.test.ts \
  src/components/__tests__/PortesUniques.test.tsx
```

Retour arrière : `git apply -R` du lot 3, **puis** du lot 2, **puis** du lot 1. Aucun fichier protégé n'est touché.

---

## 10. Empreintes

```
patches/DEFTER_RAPPEL_2026-11-04.patch        720 lignes / 32 390 octets
SHA-256  d6e9742b184ae8122325a271c088fde2d85463067feddebe92f8bc5537908ba1
patches/RAPPEL_3_QUESTIONS_2026-11-04.patch   986 lignes / 43 146 octets
SHA-256  78891336b64a3d7644679bfcffaca8ef96690ba2f2c463a47ec29b35a6a90c54
patches/ENTREE_CAPITAINE_2026-11-04.patch     567 lignes / 27 411 octets
SHA-256  c503825a522e70bb71f09748a508b5531033cf7a216144dbc382f6d1d3be9360
```

Rapport d'audit : `AUDIT_RUBRIQUE_TAMARIN_EXO_2026-11-04.md` · Notes : `patches/ENTREE_CAPITAINE_2026-11-04.md`, `patches/RAPPEL_3_QUESTIONS_2026-11-04.md`.
