# 📊 BILAN COMPARATIF — Proposition « MIFTah OS » + Fiche v6 vs Contrat réel de l'application

**Date :** 2026-09-22 · **Branche analysée :** `arena/01a0c955-kunz-el-ouloum` (+ `origin/master` `d19d93b`)

---

## 0. Périmètre et sources

| Document | Origine | Nature |
|---|---|---|
| **Proposition « MIFTah OS »** | Texte pasté dans la demande (22 sections) | Vision produit : moteur de réflexe, parcours 7/15 jours, erreurs E01-E10, combo, boss adaptatif, IA 2 couches, 5 écrans |
| **Fiche `al_miftah_final_v6.html`** | `origin/master` @ `d19d93b` (« Add files via upload ») | Fiche élève **v6.0** : *« 5 gestes · 3 familles · 1 boussole »*, recto = النواة, verso = المفتاح+ |
| **Contrat réel** | Code de la branche (67 k lignes TS) + `docs/MARQUE.md` | Ce qui est **livré, testé et verrouillé** aujourd'hui |

> ⚠️ **Constat d'entrée :** la fiche v6 est un fichier **orphelin**. `scripts/check-miftah.ts` (le garde-fou `npm run check:miftah`) lit `public/miftah.html` — la fiche **v5.0**. `MIFTAH_VERSION = '5.0'` dans `src/data/miftahSpec.ts`. **Rien dans le code ne référence v6.**

---

## 1. Verdict en un coup d'œil

**Score global de conformité : environ 40 %** — la proposition est **partiellement réalisée sans le savoir** sur le moteur d'apprentissage, mais **entre en conflit frontale** sur la nomenclature, et **ignore l'essentiel de l'application livrée** (cours, leçons, QCM, tuteur, 12 onglets).

| Légende | ✅ Conforme | 🟡 Partiel | 🔴 Absent | ⚔️ **Conflit** |
|---|---|---|---|---|

### 1.1 Concepts fondamentaux

| # | Proposition | Contrat réel (code) | Statut |
|---|---|---|---|
| 1 | Chaîne **5 gestes** : فعل → دليل → علاقة → جواب → فحص | Fiche v6 = 5 gestes ✓, **mais le code tourne sur 4 dents** : `تَبَصَّر · أدخل · أدر · افتح` + `سنّ0 = القفل` (`miftahSpec.ASNAN`, décision owner actée `MARQUE §12.2`) | ⚔️ **Conflit** |
| 2 | **3 familles** = 3 mondes (أصف 🟡 / أقرأ 🟢 / أحكم 🟣) avec carte de progression | Mots présents dans le contenu (v6, `MiftahCard`, `meftahManhajia`) mais **aucune structure de familles dans le moteur** (ni dans `methodologyEngine`, ni `boussoleData`, ni le store) | 🟡 Partiel |
| 3 | **1 boussole** (tagline v6) | `BOUSSOLE_STEPS` = **4 étapes** nommées `تَبَصَّر · أدخل · أدر · افتح` (`boussoleData.ts`) — pas les 5 gestes | ⚔️ **Conflit de nom** |
| 4 | Modèle à **6 réflexes** (proposition implicite via code ?) | `CoreReflexId = analyse · interpret · compare · hypothesize · explain · validate` (`reflexes.ts`, source unique Spec V2) — **4e décomposition** coexistante | ⚔️ **4 décompositions parallèles** |
| 5 | « Le mode du bac n'a pas changé 2026-2027 → moteur stable, contenu versionné séparément» | Contenu **verrouillé par tests** : `bacExam.lock.test`, `curriculumIntegrity.test`, `bibliothequeOfficielle.lock.test`, `MIFTAH_VERSION` séparé du contenu | ✅ Conforme (par locks, pas par couche de version) |
| 6 | Fiche = outil, **pas barème officiel** | `grilleEntrainement` avec label *« n'est pas le barème officiel »* + v6 répète la même réserve | ✅ Conforme |

### 1.2 Moteur pédagogique

| # | Proposition | Contrat réel | Statut |
|---|---|---|---|
| 7 | Boucle « Défi → décision → action → preuve → correction → répétition → automatisation » | **4 stades** du simulateur (`methodologyEngine` : stage1 expert → stage2 cloze → stage3 guidé → stage4 minuté/seuil ICM) + drill + unlock | ✅ Conforme |
| 8 | Geste 1 : « Quel **produit** dois-je fabriquer ? » | `VERB_CARDS` : `goal` + `structureSteps` + `requiredConnectors` + `goodExample` par verbe (12 verbes V2) | ✅ Conforme |
| 9 | Mini-jeu **« Attrape la preuve »** (toucher les infos utiles) | **Absent.** Proches : critères du `ValidationEngine`, `fillBlanks`, `TahlilWall` (classe de phrases, pas de preuves) | 🔴 Absent |
| 10 | Mini-jeu **« Construis le pont »** (remettre كلما… dans l'ordre) | **Absent.** Proches : templates `كلما زاد…` dans `templateHint`, `MICRO_REMEDIATIONS`, `drillBank` | 🔴 Absent |
| 11 | **« SCAN المفتاح » 5 points** avant validation | `SELF_CHECKS` = **4 questions** (بنية différente) + `CorrecteurPanel` (critères par verbe) + StepBar | 🟡 Partiel (4/5, formulation différente) |
| 12 | **Parcours « Sprint 7 »** (1 jour = 1 compétence + 1 jeu + 1 défi, badges) | **Absent en tant que produit.** Proches : `BEGINNER_JOURNEY` (6 étapes/réflexes), `JOURNEY_BUTTONS` du tuteur (mission du jour, diagnostic, boss, revue), drill 3 jours, badges `حامل المفتاح` / `أمين الكنز` | 🔴 Absent (adhoc partiel) |
| 13 | **Parcours « 15 jours »** (maîtrise) | **Absent.** | 🔴 Absent |
| 14 | Clé à **5 dents** illuminées | `MiftahCard` = **4 dents** (la 5e n'existe pas ; سنّ0 = قفل) + badges d'unlock | ⚔️ **Conflit** (suit v5) |
| 15 | **Déverrouillage** serrure/clé par réponse correcte | `UNLOCK_RULE` : drill **12/12 sur 3 jours distincts** → Phase 2 + badge ; verso → 3 types maîtrisés (`v3Progress.ts`) — mécanique **différente** (drill, pas par-réponse) mais même philosophie | 🟡 Partiel |

### 1.3 Apprentissage par les erreurs (§10 de la proposition) — **la plus forte convergence**

| # | Proposition | Contrat réel | Statut |
|---|---|---|---|
| 16 | Codes **E01 → E10** | `ERROR_TAXONOMY` : **9 codes sémantiques** stables (`missing_unit`, `missing_reference`, `premature_interpretation`, `conditional_hypothesis`, `missing_conclusion`, `verb_confusion`, `comparison_without_criteria`, `unbalanced_comparison`, `unsupported_claim`) + `FIVE_COSTLY_ERRORS` + `ERROR_REMEDY_MAP` + `ERROR_ADDRESS_MAP` (→étape) | 🟡 Partiel — **voir mapping §2.4** |
| 17 | Erreur → **micro-leçon 30 s** → exercice facile → moyen → différent → **réactivation J+3** | `MICRO_REMEDIATIONS` (`triggerCodes` → explication 2-4 min → question active → `nextAction`) + `SPACED_RECALL_PROMPTS` **J+1 → J+3 → J+7 → J+14** (plus complet que la proposition !) | ✅ **Conforme (dépassé)** |
| 18 | Stocker type d'erreur, pas juste bon/faux | `LearningError` (kind, ruleIds, count, reviewStage, nextReviewAt, resolvedAt) + `LearningInsight` + plafonds 100/100 (`store.ts`) | ✅ Conforme |
| 19 | « Ton verrou faible aujourd'hui : observation → interprétation » | Missions à `source: 'error' \| 'weak_unit'` + `reasonAr` + `mastery_matrix` (مصفوفة الإتقان) + carte des erreurs par étape (`MethodologyGlobalStats`) | ✅ Conforme |
| 20 | **مختبر الأخطاء : « Répare ta réponse »** | **Absent comme UI.** Le flux revue existe (`reviewStage`, bouton *« فتح المراجعة وإعادة جديدة »* dans `TahlilWall`) mais pas la transformation ❌→✅ de la réponse d'origine | 🟡 Partiel |

### 1.4 Progression & gamification

| # | Proposition | Contrat réel | Statut |
|---|---|---|---|
| 21 | 4 états : 🔒 Découvert → 🟠 Apprentissage → 🟢 Stable → 🔵 Automatique (preuves × contextes × délai) | `MasteryLevel = 'unknown' \| 'needs_work' \| 'developing' \| 'mastered'` + `MasteryCell` (evidenceCount, lastEvidenceAt) + `MasteryEvidence` (sources variées) | ✅ **Conforme** (vocabulaire différent, mécanique identique) |
| 22 | **COMBO ×5** (chaîne complète réussie) | **Absent.** Existent : XP (`20 XP/question`), `streakDays` + `StreakCelebrationModal`, `DailyGoalWidget`, badges | 🔴 Absent (base oui) |
| 23 | **Pas de classement public** — « mon record » | ✅ Aucun leaderboard élèves. Dashboard enseignant privé (JWT). `TahlilWall` « classement » = classe des phrases tahlil/tafsir, pas des élèves. Stats = logs locaux | ✅ Conforme |
| 24 | Boss BAC **adaptatif** (70 % sur la faiblesse) | Boss existants : `startBossFight` (tuteur), `Bac2025ExamView`, `OkachaView`, stage4 minuté — **sélection non profilée**. `getDailyMission` choisit un domaine, mais pas « 70 % sur erreur dominante » | 🟡 Partiel |
| 25 | **5 écrans** (Accueil / Ma clé / Missions / Boss / Progression) | **12 onglets** : splash, home, review, stats, chat, methodology, bootcamp, badges, lesson, workshop, mindmap, teacher (+ vues Bac, Okacha, QCM…) | ⚔️ **Conflit d'IA** — la proposition ignore cours/leçons/cartes/enseignant |

### 1.5 Technique & contenu

| # | Proposition | Contrat réel | Statut |
|---|---|---|---|
| 26 | JSON d'exercice : `evidence_targets, common_errors, difficulty, hints, remediation, mastery_tags` | `DocAnalysisExercise` : `id, unitId, domain, doc{type,assetKey}, questions[{verb,promptAr,loiFocus,ctx,templateHint}], correctionAr, grilleEntrainement[{critereAr,points}]` — **champs différents** (barème-vs-tags), pas de `difficulty` ni `mastery_tags` | 🟡 Partiel (complémentaires) |
| 27 | IA **2 couches** : règles déterministes + IA (cohérence, explication personnalisée) | Couche 1 ✅ complète (`ValidationEngine`, `methodologyScorer`, `CorrecteurPanel`, 973+ tests). Couche 2 = **tuteur de retrieval 100 % local** (`smartTutorEngine`, base embarquée 547 kB, zéro API, zéro clé) — **pas de LLM** | 🟡 Partiel — **tension offline** (§2.8) |
| 28 | Positionnement : « salle d'entraînement qui transforme le raisonnement en réflexes » | `POSITIONING_AR = « المقرر موجود عندك. المفتاح يحوّله إلى نقاط. »` + narrative `docs/MARQUE.md` §2 | ✅ Conforme (même cible) |
| 29 | Niveaux Apprendre / Automatiser / Transférer | Équivalent fonctionnel : stage1 (expert) → stage2-3 (guided) → stage4 (timed, seuil 90) + `drill` + transfert `lesson_transfer` dans `MasteryEvidence.source` | ✅ Conforme |
| 30 | Sprint 60 s (v6 verso, « vitesse de décision ») | `DRILL` : 12 items × 2 s = 60 s (`miftahSpec`) — **déjà là** | ✅ Conforme |

---

## 2. Les 5 conflits fondamentaux (à trancher AVANT tout code)

### 2.1 ⚔️ QUATRE décompositions de la même chaîne coexistent

| Modèle | Où vit | Éléments |
|---|---|---|
| **v5 livré** (fiche + moteur) | `miftahSpec.ts`, `public/miftah.html`, `MiftahCard`, `BoussoleCard`, `gateIsolation.test` | سنّ0 القفل + **4 dents** `تَبَصَّر · أدخل · أدر · افتح` + **3 portes** (قفل/مصدر/حركة) |
| **v6 proposée** (fiche orpheline) | `al_miftah_final_v6.html` | **5 gestes** `فعل · دليل · علاقة · جواب · فحص` + compass 20-30 s + 3 familles |
| **Boussole** | `boussoleData.ts` (4 étapes + `switch`) | Mêmes 4 gestes renommés + interrupteur ouvert/fermé |
| **6 réflexes** (Spec V2) | `reflexes.ts`, store, missions, spaced recall | `analyse · interpret · compare · hypothesize · explain · validate` |

La proposition **choisit le modèle v6** et le présente comme « compatible avec ton document v6 » — mais **l'application a été actée (owner, 2026-09-06) et codée sur les 4 dents** (`MARQUE §12.2` : *« le nom change, le geste ne change pas »*). Adopter v6 = **migration de nomenclature** touchant : `miftahSpec`, `boussoleData`, `MiftahCard`, `MethodologyCompilerView`, `BoussoleCard`, `MeftahView`, `check:miftah`, `gateIsolation.test`, les tests `BoussoleCard`/`serverFixesAudit`… **et** les décisions MARQUE actées.

**Mapping possible (si adoption) :**

| v6 geste | v5 dent actée | Réflexe V2 |
|---|---|---|
| 1 فعل | 1 تَبَصَّر | — (trigger) |
| 2 دليل | 2 أدخل | analyse / compare |
| 3 علاقة | 3 أدر | explain / interpret |
| 4 جواب | 4 افتح | — (production) |
| 5 فحص | **aucune** (couvert par `SELF_CHECKS`) | validate |

### 2.2 ⚔️ Identifiants d'erreurs : E01-E10 vs codes sémantiques (et collision !)

| Prop. | Réel `ERROR_TAXONOMY` | Adéquation |
|---|---|---|
| E01 mauvais verbe | `verb_confusion` | ✅ |
| E02 mauvais produit | *(couvert par stage/produit attendu — pas de code dédié)* | 🟡 |
| E03 preuve absente | `missing_reference` (+ `missing_unit`) | ✅ |
| E04 preuve inutile | **aucun code** | 🔴 manque |
| E05 unité oubliée | `missing_unit` | ✅ |
| E06 relation absente | `unsupported_claim` (partiellement) | 🟡 |
| E07 description ≠ interprétation | `premature_interpretation` | ✅ |
| E08 causalité injustifiée | *(annoncé par v6 « فاصل علمي » + `ANNEXE.causalAr`, pas dans la taxonomie)* | 🔴 manque |
| E09 jugement sans preuve | **aucun** | 🔴 manque |
| E10 conclusion hors objectif | `missing_conclusion` | ✅ |

⚠️ **Collision d'identifiants :** le préfixe `E0387` existe déjà comme **ID d'entrée du dictionnaire scientifique** (`dictionnaire_final.json`). Des codes `E01…E10` en parallèle créeraient une ambiguïté réelle → **préférer les codes sémantiques actuels** (ils sont stables, auto-documentés, et adressés à une étape de la boussole via `ERROR_ADDRESS_MAP`).

### 2.3 🔴 Les sprints 7 / 15 jours n'existent pas
Aucune structure de calendrier jour-à-jour dans le code. Le plus proche : `BEGINNER_JOURNEY` (6 étapes), mission quotidienne du tuteur, drill 3 jours, `spacedRecall` J+1→J+14. **C'est le plus gros lot de travail nouveau** de la proposition (2 produits pédagogiques distincts à concevoir : déverrouillage vs automatisation).

### 2.4 ⚔️ « 5 écrans » vs 12 onglets + tout un catalogue
La proposition réduit l'app à la méthodologie. Le contrat réel inclut : **47 leçons/parcours, livre officiel, QCM livre/bilan, Bac 2025, Okacha, mindmap, atelier, tuteur IA local, supervision enseignant**. Réduire à 5 écrans = **supprimer l'offre cours** — incohérent avec le positionnement actuel (« le Mordinateur est là, la clé le transforme en points »).

### 2.5 ⚔️ Combo ×5 vs principe acté « l'échec ne remet pas à zéro »
`MethodologyCompilerView` : *« الإخفاق لا يصفّر: يؤجل اليوم التالي فقط »*. Un combo classique (échec = reset) **contredit** la décision pédagogique existante. Si combo : le basculer sur **exactitude + régularité** (comme le veut pourtant la proposition §11 elle-même) — auquel cas il rejoint la logique drill actée.

---

## 3. Ce que la proposition DEMANDE et que le réel a DÉJÀ (ne pas reconstruire)

| Besoin proposition | Implémentation existante (fichier) |
|---|---|
| Boucle erreur → micro-leçon → re-test → J+3 | `microRemediations.ts` + `spacedRecallPrompts.ts` (J+1/3/7/14) |
| États maîtrise 4 niveaux, preuves multiples | `store.ts` (`MasteryLevel`, `MasteryEvidence`) |
| Missions adaptatives sur erreur dominante | `store.ts` (`Mission`, sources) + `mastery_matrix` + `getDailyMission` |
| Règles déterministes de notation | `ValidationEngine`, `methodologyScorer`, `CorrecteurPanel` (couche 1 §16) |
| IA / tuteur explicatif hors-ligne | `smartTutorEngine` + `tutorKnowledge` (retrieval local, tests sondes 13/16) |
| Pas de classement public | rien à faire (déjà conforme) |
| XP / streak / objectif du jour / badges | `App.tsx`, `DailyGoalWidget`, `StreakCelebrationModal`, `BadgesView` |
| Déverrouillage progressif (clé/serrure) | `v3Progress.ts` (drill 12/12 × 3 j, verso 3 types) |
| Sprint 60 s | `DRILL` (12 × 2 s) |
| Calibrage « pas de barème officiel » | `grilleEntrainement.label` + v6 |
| Contenu versionné séparé du moteur | lock tests + `MIFTAH_VERSION` |
| Produit attendu par verbe | `VERB_CARDS` (12 verbes, structure + connecteurs + exemples) |
| 3 familles (sémantiquement) | catégories de verbes `descriptive/reasoned/…` + contenus أصف/أقرأ/أحكم (**à structurer**) |
| Niveaux Apprendre→Automatiser→Transférer | 4 stades + `drill` + `lesson_transfer` |

---

## 4. Ce qui MANQUE vraiment (roadmap si adoption)

**Lot A — Nomenclature (préalable obligatoire, cf. `MARQUE §7` : ne pas paralléliser)**
1. Décision owner : **v5 (4 dents) vs v6 (5 gestes) vs hybride** (voir §5).
2. Si v6 : mise à jour `miftahSpec` + fiche `public/miftah.html` + `check:miftah` + 6 vues + tests.
3. Ajouter les codes manquants à `ERROR_TAXONOMY` : preuve inutile (E04), causalité injustifiée (E08), jugement sans preuve (E09), produit erroné (E02) → **sans renommer les existants**.

**Lot B — Jeux manquants (nouveaux, auto-contenus)**
4. « Attrape la preuve » (sélection dans tableau/courbe → XP).
5. « Construis le pont » (remise en ordre كلما/بينما).
6. Tribunal des hypothèses (hypothèse A/B + expérience →判决).
7. **مختبر الأخطاء** : flux « répare ta réponse » branché sur `LearningError` existant.
8. Combo **sans pénalité d'échec** (exactitude + régularité), branché sur les 5 gestes v6 *si* v6 adopté.

**Lot C — Parcours calendrier**
9. « MIFTah Sprint 7 » : 7 jours × (1 compétence + 1 jeu + 1 défi + badge) — cadrer sur `BEGINNER_JOURNEY` + familles.
10. « MIFTah 15 » : 15 jours d'automatisation — cadrer sur `spacedRecall` + stades.
11. Boss adaptatif : sélection pondérée par `dominantErrors` / `MasteryLevel` (données déjà dispo via `mastery_matrix`).

**Lot D — Technique**
12. Enrichir `DocAnalysisExercise` : `difficulty`, `evidence_targets`, `common_errors`, `mastery_tags`, `remediation` (mapping vers `MICRO_REMEDIATIONS`).
13. Couche IA 2 : **rester hors-ligne** (règles + retrieval + templates) — un LLM cloud casserait la promesse *« 100 % hors-ligne, zéro clé API »* (README, `.env.example`).

---

## 5. Recommandation — 3 options de décision

| Option | Contenu | Coût | Risque |
|---|---|---|---|
| **A. Adoption pleine v6 + OS** | Nouvelle spec 5 gestes + sprints + jeux + combo… | **Très élevé** (nomenclature + 2 produits + 8 écrans) | Casser `MARQUE` actée, `check:miftah`, ~10 tests ; 2-3 semaines |
| **B. Hybride recommandée** ⭐ | **Moteur interne = 4 dents (inchangé)** ; **fiche UI = v6** présentée en couche 5 gestes avec mapping §2.1 ; erreurs : compléter la taxonomie (pas de E-codes) ; sprints 7/15 en backlog priorisé ; jeux B4-B8 lots autonomes | **Moyen** (fiche + compléments taxonomie) | Faible — le mapping respecte « le nom change, le geste ne change pas » |
| **C. Geler la proposition** | Reporter la proposition telle quelle dans `docs/propositions/` (comme `miftah_v5.0_proposition.html`) sans engagement | Nul | Aucun — mais la fiche v6 orpheline reste un danger (elle peut être prise à tort pour la spec) |

**Dans tous les cas (immédiat) :**
- **Rattacher ou retirer `al_miftah_final_v6.html`** : soit il devient la source de `public/miftah.html` + spec, soit il va dans `docs/propositions/` — dans l'état, c'est un fichier **non testé, non référencé, qui contredit la spec livrée**.
- **Éviter les codes `E01-E10`** (collision `E0387` + perte de l'adressage par étape).

---

## 6. Audit de la proposition elle-même (qualité du document)

**Forces :**
- §10 (boucle d'erreur) et §15 (états de maîtrise) sont **pédagogiquement supérieurs** à la moyenne des apps de révision — et l'app les a déjà en grande partie.
- La distinction **7 jours = déverrouillage / 15 jours = automatisation** est un produit marketing+pédagogique clair.
- Le refus du classement public et du « barème officiel » est cohérent avec l'éthique déjà actée.
- Le mapping erreurs→remédiation→réactivation est directement implémentable sur `LearningError`/`MICRO_REMEDIATIONS`.

**Faiblesses :**
1. **Ignore l'existant** : ne cite ni `miftahSpec` v5, ni les 3 portes, ni le drill, ni `ERROR_TAXONOMY`, ni les 47 leçons, ni le tuteur local, ni `MARQUE.md` — elle « réinvente » 40 % déjà livré et testé.
2. **Contredit des décisions owner actées** (4 dents §12.2) sans les mentionner.
3. **« IA » non résolue** avec l'architecture offline-first (pas de modèle, pas de coût, pas de dégradation).
4. Codes `E01-E10` en collision avec l'ID du dictionnaire (`E0387`).
5. Combo classique en tension avec « l'échec ne remet pas à zéro » (sa propre §11 prône exactitude > vitesse — à appliquer au code du combo).
6. « 5 écrans » suppose une app **méthodologie-seule**, ce que l'application n'est pas.
7. La source ministérielle (mode bac inchangé 2026-2027) est citée via un lien externe — **non vérifiable depuis l'audit** ; à re-vérifier avant de fonder dessus la stratégie « moteur stable / contenu versionné ».

---

## 7. Synthèse chiffrée

| Catégorie | Conforme ✅ | Partiel 🟡 | Absent 🔴 | Conflit ⚔️ |
|---|---|---|---|---|
| Concepts fondamentaux (6) | 2 | 1 | 0 | **3** |
| Moteur pédagogique (9) | 4 | 2 | 2 | 1 |
| Apprentissage erreurs (5) | **3** | 2 | 0 | 0 |
| Progression & gamification (5) | 2 | 1 | 1 | 1 |
| Technique & contenu (5) | 3 | 2 | 0 | 0* |
| **TOTAL (30 items)** | **14 (47 %)** | **8 (27 %)** | **3 (10 %)** | **5 (17 %)** |

\* +2 conflits transverses (fiche orpheline, 5 écrans) comptés ci-dessus.

**Verdict :** la proposition est **une bonne feuille de route produit** dont le socle est **déjà ~50 % construit et testé** dans l'application — mais elle est **rédigée contre une application imaginaire** (méthodologie seule, 5 gestes, zéro existant). Son adoption directe casserait la marque actée et dupliquerait le moteur. **Voie B (hybride)** : garder le moteur 4 dents verrouillé, publier v6 comme couche de présentation, compléter la taxonomie d'erreurs, puis livrer les sprints et jeux par lots autonomes.

---

*Audit fondé sur : proposition pastée (22 §) · `origin/master:al_miftah_final_v6.html` (v6.0, 24,8 Ko) · `src/data/miftahSpec.ts` (v5.0) · `boussoleData.ts` · `methodologyEngine.ts` · `reflexes.ts` · `store.ts` · `microRemediations.ts` · `spacedRecallPrompts.ts` · `v3Progress.ts` · `smartTutorEngine.ts` · `scripts/check-miftah.ts` · `docs/MARQUE.md` · inventaire des onglets `App.tsx`.*
