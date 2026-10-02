# BILAN DE VÉRITÉ — Les audits stratégiques vs l'application réelle

**Date :** 2026-10-02 · **Code évalué :** branche `arena/01a0f7a7-kunz-el-ouloum` @ `a2d54e5` (post PR #35)
**Sources :** les deux ZIPs du repo — `strategic-svt-module-audit (1).zip` et `strategic-svt-module-audit.zip`

---

## Méthodologie

Chaque ZIP est un portail d'audit React. Leur contenu est **identique à un fichier près**, et cette différence est décisive :

| | Audit « (1) » | Audit « 2 » |
|---|---|---|
| Fichier unique | `morchidSpec.ts` — **SpecKit Morchid originel** (14 tickets `SPEC-MORCHID` + garde-fous `GS`) | `morchidIntelligence.ts` — **Speckit 002** (12 tickets, piliers Démarche/Maïeutique/Diagnostic/Recall/Vérité) |
| Lignée qu'il a nourrie | Ma branche SpecKit (tickets `KEO`) | La branche master (tickets `R1→R10` puis `S-01→S-10`) |

Le socle commun porte **l'audit stratégique des 49 modules** (`audit.ts` : barème C1→C6, verdicts *garder / optimiser / fusionner / supprimer*), plus `morchid.ts`, `reports.ts`, `speckit.ts`, `speckit2.ts`.

Chaque avis a été confronté au code actuel : existence des fichiers, routage dans `App.tsx` (onglets exposés à l'élève), comportements moteur testés (2126 tests verts).

---

## VERDICT 1 — L'audit des 49 MODULES : avis structurants NON exécutés

### Les 11 « GARDER » → suivis de fait ✓

Boussole, Correcteur, Archétypes, Sujets BAC, Mur d'analyse (tahlil), Cours, Leçon active, Fiches or, Banque de situations, Enzymologie, Fiches immunité — **tous présents et routés**. Les « fix » associés (fusion des deux vues BAC, leçon active ≤ 25 min, fiche or 1 page) restent **à faire**.

### Les 13 « OPTIMISER » → 1 pleinement appliqué, 2 partiellement, 10 non appliqués

| Module | Avis de l'audit | Statut réel |
|---|---|---|
| **aiTutor** (Morchid) | « Mode socratique strict : question avant tout contenu, jamais de rédaction » | ✅ **APPLIQUÉ** — c'est tout l'objet des tickets KEO-103/105/106 + greffes S (voir verdict 2) |
| **today** (mission du jour) | Dérive des erreurs réelles, pas de l'index zéro | 🟡 **PARTIEL** — R6 appliqué (fréquence × poids BAC × oubli) + R8/R10 ; mais pas encore adossé au QCM de positionnement ni aux tags du Correcteur |
| **search** | Indexer les notions, pas les titres | 🟡 **PARTIEL** — l'index matche déjà texte + mots-clés + alias (548 chunks), mais pas de re-ciblage « notion » explicite |
| qcm, flashcards, schemaDrill, mindMap, microRemediations, conceptRoutes, transferChallenges, revisionPlan, teacherDashboard | (réduction, verrouillage, découpage…) | ❌ **NON APPLIQUÉ** — fichiers inchangés ; `teacherDashboard` reste dans le menu élève (l'audit demandait de l'en sortir) |

### Les 8 « FUSIONNER » → 0 appliqué

meftah→boussole, writingReview→correcteur, electroSim→tahlil, bacIdeas→archetypes, mockExam→bacExams, curriculumLivables→teacherDashboard, bacIdeaTrainer→bacIdeas, hosila→today : **aucune fusion réalisée**. Les deux modules existent toujours en parallèle (ex. `BacIdeasView` et `BacArchetypes` sont tous deux routés ; `MockExamPanel` et `BacExamView` aussi).

### Les 17 « SUPPRIMER » → 0 suppression de code ; 2 dé-routages de fait

| Statut | Modules |
|---|---|
| ❌ **Toujours routés** (visibles de l'élève) | stats, badges/gamification, animations, trainingHub, focusTimer, bootcamp/combat, bacideas |
| ❌ Fichiers présents (non routés ou accès indirect) | unitIntro, gamification-fichiers, motivation, reminders, errata, loisKunz, microCapsules, qcmLivre, qcmBilan, methodologyCompiler, youtube (catalogues JSON toujours dans `/data`), combat-fichiers |
| 🟡 **Supprimés DE FAIT** (fichiers présents mais plus joignables) | **okacha**, **meftah** — aucun import dans `App.tsx` ni dans aucune vue : morts sans enterrement |

> L'audit estimait que ces 17 modules pesaient ~0 point BAC et captaient du temps élève. Ils sont toujours dans le binaire.

**Conclusion n° 1 :** l'audit stratégique des modules n'a **pas** été exécuté. Seule sa composante « aiTutor » a été traitée — massivement, mais par les audits Morchid (verdict 2), pas par le chantier modules. Les ajouts récents de master (**Tadwin**, **ProFigures**, **TrainingHub renforcé**) vont même dans le sens inverse de l'avis « supprimer/alléger ».

---

## VERDICT 2 — Les audits Morchid (les 2 fichiers différenciants) : avis APPLIQUÉS à ~100 %

### Audit « (1) » — morchidSpec (14 tickets SPEC-MORCHID, source de ma lignée KEO)

| Ticket | Avis | Statut dans l'app |
|---|---|---|
| 01 — Interdire la réponse prémâchée (probe) | Question avant tout contenu | ✅ KEO-103 : probe vivante sur 11 cartes, verdict ✅/📌, contournement «اشرح لي» journalisé |
| 02 — Escalier d'indices | «لا أعرف» ne livre plus la correction | ✅ KEO-101 : 3 indices (le 3ᵉ masque le point-clé) PUIS correction plafonnée 3/10 ; 2 tentatives → score plein |
| 03 — Triade imposée | J'observe → Je déduis → Je conclus | ✅ KEO-105 + famille fermée (S-03) : «لأنّ» refusé au bloc 1, exigé au bloc 2 en famille ouverte, interdit en famille fermée |
| 04 — Polarité (négation ≠ 10/10) | Nier ne paie pas | ✅ B2 (des deux lignées) + KEO-107 : l'inversion est NOMMÉE à l'élève |
| 05 — Typologie d'erreur | Restitution vs analyse | ✅ S-04 greffé : le bilan final TYPE l'erreur en première ligne |
| 06 — Contrat du verbe de consigne | Détecter et imposer | ✅ KEO-106 (unique) : contrat affiché AVANT l'écriture, conformité vérifiée sur la réponse |
| 07 — Active Recall | Aucun contenu sans ancrage | ✅ S-05 greffé : toute explication finit par une tâche صح/خطأ (4 chemins) |
| 08 — «اختبرني» évalue | Toujours un test, jamais un cours | ✅ KEO-108 : indisponibilité dite + alternative testable, jamais de substitution |
| 09 — Détresse jamais hors programme | Détection darija, réponse فصحى | ✅ KEO-201 : lexique فصحى+darija en détection seule, écoute/10 min/1 action |
| 10 — RAG avec provenance | Aucune assertion sans source | ✅ (pré-existant, verrouillé) : chaque réponse porte `sources[]` (11 sites internal_card + lesson/guide/methodology) |
| 11 — Matching mot entier | Jamais de sous-chaîne | ✅ KEO-112 : `includesAsWord` sur le RAG et les guides |
| 12 — Priorisation réelle | Fréquence × poids BAC × oubli | ✅ R6 greffé : `rankMistakes` remplace `mistakes[0]` |
| 13 — Feedback cause + action + porte | Jamais un adjectif seul | ✅ KEO-104 : CAUSE chiffrée + ACTION 10 min + PORTE par `lessonKey` réel (548 chunks) |
| 14 — Journaliser l'échec | Un élève à 0 n'est pas invisible | ✅ `missedKeyPoints` accumulés sur tout le défi + `mistakes[]` classées (R6) + bilan nommé même à 0/10 |

**14/14 avis appliqués.**

### Audit « 2 » — morchidIntelligence / Speckit 002 (12 tickets, source de la lignée master)

Tous couverts par la fusion : 01→KEO-103 · 02→KEO-101 (variante retenue) · 03→KEO-105+famille fermée · 04→S-04 ✓ · 05→S-05 ✓ · 06→KEO-104 · 07→KEO-201 · 08→KEO-108 · 09→R6 ✓ · 10→S-10 ✓ (variante fonctionnelle : la porte «كيف أدرس العلوم؟» est réellement gérée) · 11→R10+KEO-205 ✓ · 12→B2 ✓.

**12/12 avis appliqués.**

### La nuance « avis appliqué / implémentation rejetée »

Sur ces 26 avis, **l'avis a toujours été appliqué**, mais **4 implémentations concurrentes ont été rejetées** au profit de la version la plus verrouillée (table complète dans `docs/FUSION_MASTER_3e970d2_2026-10-01.md`) :

| Implémentation rejetée | Remplacée par |
|---|---|
| R1 : correction au 3ᵉ «لا أعرف» | KEO-101 : 3 indices PUIS correction (effort payé plus longtemps) |
| R2 : probes `string` (inertes — 0 carte équipée) | KEO-103 : 11 probes objets `{question, expect}` avec verdict |
| S-03 : triade à état `triad{step,verb}` | KEO-105 : `triadeStep` + exclusions méthode (l'idée « famille fermée » a été réintégrée) |
| S-06 : porte = premier chunk du domaine | KEO-104 : `lessonKey` par tokens du point manqué |

---

## SYNTHÈSE — la vérité en trois phrases

1. **L'intelligence du tuteur (Morchid) est conforme aux audits** : 26/26 avis appliqués, 26 verrous de tests, quatre implémentations doublons rejetées avec motif — c'est livré, testé (tsc ✓ · vitest 169 fichiers / 2126 tests ✓ · jest 2089 ✓ · build ✓) et poussé (PR #35, MERGEABLE).
2. **L'architecture de l'app ignore l'audit des modules** : 0/8 fusions, 0/17 suppressions de code, 1/13 optimisations pleinement appliquée — les 49 modules coexistent toujours, et master en a même AJOUTÉ (Tadwin, ProFigures). Seules exceptions de fait : okacha et meftah, dé-routés sans suppression.
3. **Le chantier restant est donc architectural, pas moteur** : exécuter les 8 fusions et 17 suppressions de l'audit `audit.ts` (allègement du binaire, menu élève réduit), et les 10 optimisations restantes (QCM de positionnement, flashcards 1 idée, teacherDashboard sorti du menu élève…).

| | Appliqué | Partiel | Rejeté/ignoré |
|---|---|---|---|
| Avis Morchid (26) | **26** | 0 | 0 |
| Avis modules (49) | 12 (les « garder ») | 3 | **34** |

---

## Décisions que ce bilan laisse à l'owner

1. **Exécuter ou classer l'audit des modules** : la feuille de route fusionner/supprimer reste valable (barème C1→C6 inchangé) mais représente un chantier dédié — je peux le découper en SpecKit tickets si vous le souhaitez.
2. **okacha / meftah** : fichiers morts confirmés — suppression de code à planifier (avec leurs tests de verrouillage).
3. **Tadwin / ProFigures** : ajouts récents non demandés par l'audit — à arbitrer dans la même refonte du menu élève.
