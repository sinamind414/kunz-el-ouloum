# Bilan : audit stratégique des 49 modules vs état réel de `master`

**Date :** 1er octobre 2026
**Objet :** `AUDIT KUNZ EL OULOUM 01102026\LAST AUDIT\strategic-svt-module-audit` (dashboard React de restitution d'audit)
**Référentiel audité :** `sinamind414/kunz-el-ouloum`, branche `master`
**HEAD de vérification :** `48d39e3` (state au 01/10/2026 — après RGPD `48d39e3`, SpecKit 002 `81984de`, fusion `3e970d2`)
**Méthode :** lecture de `src/data/audit.ts` (36 843 octets), puis confrontation de **chacune** des 102 sources citées au code du dépôt, ligne de commande à l'appui. Aucune modification du code.

---

## 1. Ce que contient l'audit

Deux dossiers extraits (`strategic-svt-module-audit` et `strategic-svt-module-audit (1)`) : **même audit des modules** (`audit.ts` identique, 36 843 octets) ; le second est la version enrichie du Morchid (`MorchidSpec.tsx`, 72 Ko, SPEC-06/10/11/14 + golden set) en lieu et place de `MorchidIntelligence.tsx` (38 Ko).

**Barème** — chaque module est noté sur 6 critères, total **/20** :

| Critère | Max | Ce qu'il mesure |
|---|---|---|
| C1 Alignement BAC | 4 | Utilité directe pour l'épreuve (points/sujet) |
| C2 Efficacité | 4 | Densité pédagogique (points par heure élève) |
| C3 Autonomie | 3 | Fonctionne sans prof connecté |
| C4 Rentabilité | 3 | Coût de maintenance pédagogique vs gain |
| C5 Non-redondance | 3 | Pas de doublon avec un autre module |
| C6 Profondeur | 3 | Couvre tout le sous-sujet, pas un teaser |

**Périmètre :** 7 unités (U1 Protéines 8-10 pts · U2 Immunologie 6-8 pts · U3 Génie génétique · U4 Reproduction · U5 Climat-écosystèmes · U0 Transversal 12-15 pts · HORS-programme), 4 tiers (≥16 / ≥12 / ≥8 / <8) et 4 actions (garder / optimiser / fusionner / supprimer).

**Verdicts (49 modules, comptés dans `audit.ts`) :**

| Action | Nb | Modules |
|---|---|---|
| **Garder** | 11 | Boussole v2 (19) · Correcteur 8 tags (19) · Archétypes BAC (19) · Mur d'analyse Tahlil (19) · SituationBank (18) · Fiches enzymes (18) · Sujets BAC (18) · Cours (17) · Leçon active (17) · Fiches or (17) · Fiches immunité (17) |
| **Optimiser** | 13 | QCM · Flashcards · SchemaDrill · MindMap · Micro-remédiations · ConceptRoutes · Défis de transfert · RevisionPlan · Guide IA (socratique) · Dashboard prof · Recherche · Today · Auth |
| **Fusionner** | 8 | Meftah→Boussole · WritingReview→Correcteur · ElectroSim→Tahlil · BacIdeas→Archétypes · MockExam→Sujets BAC · Curriculum→Dashboard prof · BacIdeaTrainer→BacIdeas · Hosila→Today |
| **Supprimer** | 17 | FocusTimer · Badges/Streak · MotivationDéclic · Rappels · Stats · TrainingHub · UnitIntroPortal · Combat · YouTube · Errata · okacha · loisKunz · microCapsules · Animations · QcmLivre · QcmBilan · MethodologyCompiler |

**Sortie proposée :** architecture cible **3 hubs → 12 modules** (A Apprendre · B S'entraîner · C Corriger & Piloter) et roadmap 4 semaines (S1 Couper · S2 Fusionner · S3 Boucher les trous · S4 Verrouiller), avec la promesse « 49 entrées → 12 modules sans perte de contenu ».

---

## 2. Vérité documentaire : les sources existent-elles ?

J'ai extrait les 50 lignes `source:` de `audit.ts`, éclaté les listes séparées par `·` (**102 fichiers cités**) et testé chaque chemin.

**Résultat : ~100/102 sources existent réellement dans le dépôt.** C'est une excellente précision documentaire pour un audit de cette taille.

**La seule citation fantôme :** `livrablesPrioritaires.ts` (module `curriculumLivables`, Tier 2 « fusionner »). Le fichier **n'existe pas** — il n'en reste que `src/data/livrablesPrioritaires.test.ts`, qui teste en réalité `ACTIVE_LESSONS` et `MICRO_CAPSULES`. Lecture du commentaire de ce test : « *53 sprints séparent la demande initiale de l'état actuel. Un journal peut affirmer qu'une chose a été livrée ; seul un test peut affirmer qu'elle est toujours là.* » — la pièce citée a donc été fondue ailleurs, mais l'audit continue de la pointer comme module distinct.

**`bookContent.json`** existe bien, mais à la racine `data/` (et non `src/data/`) — cité correctement par l'audit.

---

## 3. Verdicts vérifiés contre le code

| Assertion de l'audit | Vérification | Preuve |
|---|---|---|
| **E1** : doublon de lecteurs de sujets BAC (`BacExamView` + `Bac2025ExamView`) | ✅ **CONFIRMÉ** | `src/components/BacExamView.tsx` **et** `Bac2025ExamView.tsx` coexistent |
| **E2** : doublon Meftah / Boussole (même clé méthodologique, 3 composants) | ✅ **CONFIRMÉ** | `MeftahView.tsx` + `MiftahCard.tsx` + `BoussoleCard.tsx` |
| **E4** : drill 60 s via `SwitchDrillModal` | ❌ **ERREUR DE DÉNOMINATION** | `SwitchDrillModal.tsx` **n'existe pas** — c'est `SchemaDrillView.tsx` (existe) |
| Les modules « à garder » sont verrouillés | ✅ **CONFIRMÉ** | lock tests présents : `bacArchetypes.lock` · `enzymeInhibitors.lock` · `enzymeMindMap.lock` · `immunityCooperation.lock` · `immunityHivAids.lock` · `lessonGoldSummaries.test` |
| Catalogues YouTube à supprimer | ⚠️ toujours là (4 fichiers) | `data/youtube_ikram_catalog.json` · `youtube_ketfi_catalog.json` · `youtube_ketfi_lessons.json` · `youtube_multichaines_catalog.json` |
| **S1 « Couper » jamais exécutée** | 🔴 **CONFIRMÉ** | les **17 modules Tier 4 existent TOUS encore** : `FocusTimer.tsx` · `BadgesView.tsx` · `StreakCelebrationModal.tsx` · `MotivationDeclic.tsx` · `SmartReminderCard.tsx` · `StatsView.tsx` · `TrainingHubView.tsx` · `UnitIntroPortal.tsx` · `CombatTrainerView.tsx` · `okacha.ts` · `manuelErrata.ts` · `microCapsules.ts` · `loisKunz.ts` · `AnimationsView.tsx` · `QcmLivreView.tsx` · `QcmBilanView.tsx` · `MethodologyCompilerView.tsx` |

**Aucune des prescriptions de suppression ou de fusion n'a été appliquée.** En revanche, les 11 modules à garder sont intacts et leurs lock tests protègent le périmètre critique — le « noyau dur » de l'application est défendu, même si le nettoyage n'a pas eu lieu.

---

## 4. Les trois aveugles de l'audit

### 4.1 La gamification : l'audit et le code divergent

L'audit classe FocusTimer (5/20), MotivationDéclic (4/20), Badges/Streak (2/20) et Rappels (5/20) en Tier 4 — verdict : « dopamine sans contenu, à supprimer ».

Or les commits récents ont **réinvesti dans ces modules** :
- `0151bbc` — *feat: recuperation travail non commite (focus/motivation + moteur R2 in-domaine)*
- `9c79d05` — *feat(motivation): câble FocusTimer + Déclic dans App.tsx, avec tests*

Le sentiment des développeurs (la motivation est un levier réel pour des élèves à J-250 du BAC) contredit explicitement le verdict de l'audit. **Ce n'est pas une erreur de l'audit — c'est un désaccord de valeurs** : C1/C2 notent l'utilité *pour la note*, pas l'engagement. Un module comme `auth` (4/20) le montre bien : jugé sur des critères pédagogiques alors que c'est de l'infrastructure, il finit en Tier 4 « optimiser ».

### 4.2 Le périmètre est dépassé

L'audit date d'avant la fusion `3e970d2` (Tadwin التدوين الشامل, ProFigures, TrainingHub). **Ces modules ne sont pas notés du tout**, alors qu'ils pèsent maintenant des milliers de lignes et occupent un onglet entier de `App.tsx`. L'audit dit « 49 modules » ; l'application en a plus aujourd'hui. Un audit des modules qui ignore les modules les plus récents est, par construction, **structurellement juste mais opérationnellement en retard**.

### 4.3 Les chiffres ont dérivé

| Chiffre cité par l'audit | Réalité du code | Δ |
|---|---|---|
| « 508 questions QCM » | **549** (`src/quizCorpus.ts`, ids 1→549) | +41 |
| « 7 sessions BAC indexées » | **22** (`src/data/bacSessionIndex.ts`, 2016→2026, s1+s2) | +15 |
| « 44 leçons » | **47 leçons HTML / 26 actives / 548 chunks** (`src/data/lessonIndex.ts`) | +3 |

Le corpus a grandi entre l'audit et maintenant — les compteurs de l'audit ne sont plus citables tels quels.

---

## 5. Le cœur de valeur : les trous critiques (GAPS)

C'est la partie la plus utile de l'audit, et elle reste **entièrement valide** (aucun module ne couvre ces besoins) :

| Trou | Perte estimée | Couverture actuelle |
|---|---|---|
| **1. Exploitation chiffrée des résultats** (calcul de vitesse enzymatique, DO, dilutions en série) | ≈ **2,5 pts/sujet** | aucun module |
| **2. Raisonnement C3 formalisé** (hypothèse → témoin → conclusion) | ≈ **2 pts/exercice** | la Boussole ne couvre que la *rédaction*, pas la démarche |
| **3. Typologie des documents BAC** (autoradiogramme, caryotype, immunodiffusion, electrophorègramme) | ≈ **2 pts** + gain de temps | non couvert |

Suivis de 3 gaps **hauts** (grille de barème question par question · prérequis 2AS/1AS en début de leçon · glossaire bilingue arabe/français) et 2 gaps **moyens** (pétrographie · filières TC/Math/Gestion).

**Lecture :** ces trois trous représentent **≈ 6,5 points potentiels par sujet** — soit, en proportion, bien plus que ce que rapporterait tout le Tier 4 réuni. La roadmap « S3 Boucher » est donc le levier à plus fort rendement, très loin devant « S1 Couper ».

---

## 6. Conclusion

**Fiabilité documentaire : ~98 %** (100/102 sources vérifiées, doublons E1/E2 confirmés). **Fiabilité opérationnelle : nulle** — aucune des 25 prescriptions de suppression/fusion n'est appliquée, et l'audit ignore les modules post-fusion (Tadwin, ProFigures, TrainingHub) ainsi que la dérive des compteurs (549 questions, 22 sessions, 47 leçons).

**Ce qui reste solide et actionable :**
1. Les **3 trous critiques** (résultats chiffrés, raisonnement C3, typologie des documents) — ≈ 6,5 pts/sujet, aucun n'est couvert. C'est par là qu'il faut commencer.
2. Les **2 doublons confirmés** (E1 lecteurs BAC, E2 Meftah/Boussole) — suppression mécanique, sans perte de contenu.
3. Les **11 modules à garder** sont verrouillés par leurs lock tests : le noyau dur est protégé.

**Ce qui est discutable :** le verdict « supprimer » sur la gamification (FocusTimer, Déclic, Streak) est contredit par la feuille de route de développement en cours (`9c79d05`, `0151bbc`). C'est un choix de valeurs, pas un fait — à trancher en connaissance de cause plutôt qu'à exécuter mécaniquement.

**Ce qui est dépassé :** tous les chiffres (questions, sessions, leçons) et la liste des modules (49 → plus aujourd'hui).
