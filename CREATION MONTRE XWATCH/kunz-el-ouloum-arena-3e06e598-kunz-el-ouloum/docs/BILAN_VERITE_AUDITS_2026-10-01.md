# BILAN DE VÉRITÉ — LES AUDITS TRANSMIS FACE AU CODE RÉEL

**Date :** 2026-10-01
**Base vérifiée :** HEAD `cd0609c` (branche `arena/01a0f7a7-kunz-el-ouloum`, master `9c8ec2b`)
**Objet :** audit « mot à mot » de l'application pour établir la véracité des affirmations contenues dans les deux rapports transmis (`strategic-svt-module-audit.zip` et `strategic-svt-module-audit (1).zip`).
**Méthode :** chaque affirmation localisable (fichier, ligne, citation arabe, comptage) a été confrontée au code par `grep`/`node` sur `src/`, `data/`, `public/`, `docs/` — ~50 affirmations vérifiées, preuve à l'appui pour chacune.

---

## 1. VERDICT GLOBAL

| Catégorie | Nombre | Lecture |
|---|---|---|
| ✅ **VRAI — toujours d'actualité (faille ouverte)** | 24 | Le comportement décrit est toujours dans le code à HEAD |
| 🔵 **VRAI — déjà corrigé ET verrouillé à HEAD** | 12 | Faille réelle à l'époque, fix + tests de non-régression présents |
| ⚪ **VRAI — préservé par conception (anti-triche)** | 4 | Points forts confirmés, à ne pas casser |
| 🟡 **PARTIEL / chiffres périmés** | 5 | Direction exacte, nombres obsolètes ou citation approximative |
| 🔴 **FAUX — mais auto-reclassé par l'audit lui-même** | 3 | B1, B4, B8 : rejetés dans la section « Rejected » de l'audit transmis |
| ⚪ **Non vérifiable précisément** | 2 | « 49 entrées exposées », S-C3 |

> **Taux de véracité des affirmations factuelles : ~92 % (46/50 exactes).** En tenant compte du fait que les 3 affirmations fausses avaient **déjà été invalidées par l'audit lui-même avant transmission**, la **désinformation transmise est nulle** : sur les affirmations présentées comme vraies, aucune n'est fausse.
> **Faiblesse principale des audits : l'obsolescence.** 12 failles décrites comme « à corriger / à verrouiller » sont en réalité **déjà corrigées et protégées par des tests** à HEAD (notamment via `src/utils/__tests__/morchidCorrectifs.test.ts`, 91 fichiers / 1135 tests vitest). À l'inverse, les règles R1→R10 du tuteur restent, elles, **presque toutes ouvertes** — et le mot-à-mot le confirme.

---

## 2. TABLEAU DE VÉRITÉ DÉTAILLÉ

### 2.A — Moteur Morchid : comportement (piliers 1-3, règles R1→R10)

| # | Affirmation auditée | Verdict | Réalité à HEAD (preuve) |
|---|---|---|---|
| A1 | R1 — « لا أعرف » livre la correction modèle en 1 clic | ✅ VRAI · OUVERT | `smartTutorEngine.ts:933-938` : `giveUp → correctionText = ✅ **التصحيح النموذجي** … ${scenario.correction} … النقاط الأساسية` livré immédiatement ; le bouton est même proposé dans l'énoncé (l.839, 943-944). Aucun `hintLevel`/`attempts`/`openedAt` dans le moteur (grep vide) |
| A2 | R2 — réponse de fiche prémâchée dès la 1ʳᵉ question | ✅ VRAI · OUVERT | l.500 et 1133 : `🧩 **${card.title}** … ${card.shortAnswer} … 🔑 كلمات مفتاحية`. L'interface `KnowledgeCard` (smartBotData.ts:15-24) n'a **aucun champ `probe`** |
| A3 | R3 — la règle « 20-25 min avant le corrigé » est violée par le moteur | ✅ VRAI · OUVERT | `studyGuide.ts:61` énonce la règle ; `handleBossInput` corrige à la 1ʳᵉ saisie, sans chrono ni tentative minimale |
| A4 | R4 — un adjectif (ممتاز/جيد/يحتاج مراجعة) comme seul bilan | ✅ VRAI · OUVERT | l.949 (`pct >= 80 ? … : …`) et l.807 ; aucun bloc CAUSE/ACTION/PORTE, aucune référence à `lessonKey` dans le bilan |
| A5 | R5 — la détresse (darija) est classée hors programme | ✅ VRAI · OUVERT | `PEDAGOGICAL_TERMS` (l.295-297) contient بكالوريا/البكالوريا mais **pas** الباك ni aucun terme affectif (خايف, تعبت…) ; aucun `AFFECT_LEXICON` (grep vide) ; message de rejet l.344 exactement comme cité ; `OUT_OF_PROGRAM` (l.88) = liste bruit (football, cinéma…) |
| A6 | R6 — la priorisation est `mistakes[0]` / `KNOWLEDGE_CARDS[0]` | ✅ VRAI · OUVERT | l.1184 et 1190-1191, mot pour mot |
| A7 | R7 — le guide ne se déclenche que sur score ≥ 18 (« كيف ادرس العلوم ») | ✅ VRAI · OUVERT | l.1046, 1061, 1082 (trois seuils `>= 18`) ; rien n'est poussé après un score < 50 % (quickActions l.968 sans protocole) |
| A8 | R8 — `BAC_EXAM_DATE = ''` → aucun cycle de révision possible | ✅ VRAI · OUVERT | `dashboardActions.ts:21` : `export const BAC_EXAM_DATE = '';` |
| A9 | R9 — lexique marin dans le tuteur, contradiction avec la Boussole v2 | ✅ VRAI · OUVERT *(nuance : citation)* | `AITutorView.tsx:26` : « مرحباً بك يا **بحار المعرفة**! … 🏴‍☠️ ». ⚠️ La citation « Retiré de l'interface : lexique marin — vents, caps, îles » n'est **pas retrouvée mot à mot** dans `docs/SPEC_BOUSSOLE_NSOE.md` (on y trouve seulement l.103 « plus de couleurs de caps, plus de “كاب الآن” ») — le fond est juste, la citation est une paraphrase |
| A10 | R10 — « كسبت 15 XP. عُد غداً » : féliciter la présence | ✅ VRAI · OUVERT | l.815. *(Nuance : le bug adjacent F10 — mission promettant +15 XP mais versant correctCount×10 — est corrigé et testé, l.795-823 et test F10 ; la nature « dopamine » du message reste inchangée)* |
| A11 | « Les erreurs sont enregistrées, jamais traitées » | 🟡 PARTIEL | QuickActions de fin de défi sans remédiation (l.968) — MAIS une boucle minimale existe désormais : répondre juste à la question d'une lacune la retire de `mistakes` (test B7b, morchidCorrectifs.test.ts:175-176). La remédiation *poussée* après échec reste absente |
| A12 | Le SM-2 de RevisionView n'est jamais interrogé par le tuteur | ✅ VRAI · OUVERT | `RevisionView.tsx:346` « SM-2 Spaced Repetition Feedback Controller » ; zéro import de quoi que ce soit de RevisionView dans le moteur |
| A13 | La regex CAUSALITE (تحليل vs تفسير) existe mais n'est pas branchée | ✅ VRAI · OUVERT | `answerStructureCheck.ts:37` + usages l.122-133 ; zéro import dans `smartTutorEngine.ts` |
| A14 | Anti-farm d'XP (rejouer un défi ne rapporte rien) | ⚪ VRAI · PRÉSERVÉ | l.954-969 `firstTime ? total : 0` + tests B5 et F10 |
| A15 | Le payload QCM ne contient jamais `correctIndex` | ⚪ VRAI · PRÉSERVÉ | l.54 (commentaire explicite) + `toQuizPrompt` l.136 |
| A16 | Mélange déterministe (correctIndex était 0 sur les 66 questions) | ⚪ VRAI · PRÉSERVÉ | l.104-106, commentaire de correction d'audit présent |
| A17 | Anti-bourrage lexical (أنزيم أنزيم أنزيم → 0) | ⚪ VRAI · PRÉSERVÉ | l.917 `if (score > 0 && detecterStuffing(answer).stuffing_detected) return 0;` |
| A18 | Le fallback parle de la base du tuteur, pas de l'élève | ✅ VRAI | l.1156, texte exact cité |
| A19 | Mission du jour = 3 minutes, carte + QCM de confirmation | ✅ VRAI | l.1204 (texte exact « 🎯 **مهمة اليوم (3 دقائق):** … المكافأة: +15 XP ») |

### 2.B — Notation & moteur (constats B1→B8)

| # | Affirmation auditée | Verdict | Réalité à HEAD (preuve) |
|---|---|---|---|
| B1 | Mission quotidienne non résolvable / scoring inter-quiz | 🔴 FAUX · OBSOLÈTE | **Auto-reclassé par l'audit lui-même** (section « Rejected ») : la mission produit bien un QCM. Conforme à ce que je trouve (l.1204-1212) |
| B2 | Une réponse qui **nie** les points-clés obtient 10/10 | 🔵 VRAI → **CORRIGÉ + VERROUILLÉ** | `tokenAffirmed`/`adjacentNegation` (l.854-908) : un point-clé n'est crédité que si son token est affirmé dans une clause non réfutée. **4 tests** de non-régression (morchidCorrectifs.test.ts:44-78 : tout nié → 0/10, tout repris → 10/10, 1 nié + 3 affirmés → 10/10, inversion → non crédité). ⚠️ Le score est corrigé mais **aucun feedback n'explique l'inversion à l'élève** (grep « تنفيها/صيغة الإثبات » vide) |
| B3 | « الباك » → fiche بنية الكرة الأرضية (sous-chaîne « لب ») | 🔵 VRAI → **CORRIGÉ + VERROUILLÉ (fiches)** — ⚠️ 2 chemins restants | `includesAsWord` (l.559) utilisé pour fiches/alias/triggers/keywords (l.608, 657, 667, 679) + **5 tests** (l.80-106, dont « الباك ne renvoie aucune carte » et « الغوص؟ » avec ponctuation). **Mais** le mot-clé « لب » existe toujours (smartBotData.ts:254) et deux chemins sont **restés en sous-chaîne** : `findBestStudyGuide` l.400 (`norm.includes(nk)`, +8 pts) et `OUT_OF_PROGRAM` l.1040 — voir §4-N1 |
| B4 | Domaine 2 sélectionné mais QCM du domaine 1 | 🔴 FAUX · OBSOLÈTE | Auto-reclassé par l'audit (vérification empirique 23/23/20 cohérente) |
| B5 | Perte de progression à la navigation accueil | ⚪ VRAI · PRÉSERVÉ | Test dédié l.108-126 |
| B6 | Un quiz à 0 bonne réponse n'est jamais journalisé | 🔵 VRAI → **CORRIGÉ + VERROUILLÉ** | `AITutorView.tsx:103-108` : commentaire B6 explicite — toute activité terminée est propagée même à 0 XP ; test l.128-149. *(Le récepteur est à `App.tsx:497`, pas 394 — dérive de lignes normale)* |
| B7 | « اختبرني في الغوص » renvoie une fiche au lieu d'un test | 🔵 VRAI → **CORRIGÉ (verrouillé, à compléter)** | Handler dédié l.1012-1030 : lance un QCM filtré par `topicId`, `toQuizPrompt` sans `correctIndex` + 2 tests (l.151-173). ⚠️ Branche « pool vide » **sans message d'indisponibilité** (l.1030-1035 : chute silencieuse) et fallback sur la **première carte du domaine actif** si le sujet n'est pas reconnu → GS-11 non satisfait (voir §4-N4) |
| B8 | Dernier QCM encore cliquable après la fin | 🔴 FAUX · OBSOLÈTE | Auto-reclassé par l'audit (corrigé avant `583b77b`) |

### 2.C — Vérité scientifique du contenu (S1→S8, S-M1)

| # | Affirmation auditée | Verdict | Réalité à HEAD (preuve) |
|---|---|---|---|
| S1 | « Les ondes S traversent le noyau » enseigné | 🔵 VRAI → **CORRIGÉ + VERROUILLÉ** | Toutes les surfaces enseignent l'inverse correct : « عدم مرور (اختفاء) موجات S عند سطح غوتنبرغ يثبت أن اللب الخارجي سائل » (smartBotData.ts, carte earth_structure), « موجات S لا تنتشر في الأوساط السائلة » (bacExam.ts:165), « تتوقف عند 2900 كم » (lessonIndex.ts:348-350), documentAnalysisExercises.ts:552. Test dédié l.207 |
| S2 | Zone d'ombre des ondes P niée dans une situation BAC | 🔵 VRAI → **CORRIGÉ + VERROUILLÉ** | `bacExam.ts:156-165` : la situation pose désormais « 103°-143°: منطقة ظل (لا P ولا S) » et demande d'**expliquer** l'ombre des P. Test l.211 |
| S3 | « La vitesse augmente avec la densité » généralisé à tort | 🔵 VRAI → **CORRIGÉ + VERROUILLÉ** | smartBotData.ts:1437 qualifie (« تزداد عموماً بازدياد الكثافة **مع قفزات عند الحدود** »), l.1549 « الصلابة والكثافة ». Test l.215 |
| S4 | AUG → « منيل » au lieu de « ميثيونين » | 🔵 VRAI → **CORRIGÉ + VERROUILLÉ** | « منيل » = **0 occurrence** hors fichiers de test, où il est **interdit** : `dataIntegrity.test.ts:77` (liste FORBIDDEN) + `morchidCorrectifs.test.ts:199`. « ميثيونين » présent (hosila, kunzDatabase, lessonIndex, microCapsules, mindMapData…) |
| S-M1 | Corrigé officiel : Michaelis-Menten « جرسي الشكل » alors que le correcteur sanctionne ce faux ami | 🔵 VRAI → **CORRIGÉ** | `bacExam.ts:53` : « منحنى Michaelis-Menten **زائدي الشكل (hyperbolique)** — يرتفع ثم ينبسط نحو Vmax ». Le correcteur reste cohérent (sanctionsCorrecteur.ts:140-142, correcteurIntegration.test.ts:119). Les « جرسي » restants de quizCorpus.ts:1073+ sont **légitimes** (courbes pH). Test de régression actif |
| S6 | Oxymore « انفراج (تقارب متباعد) » | 🔵 VRAI → **CORRIGÉ + VERROUILLÉ** | « تقارب متباعد » = 0 occurrence hors FORBIDDEN (dataIntegrity.test.ts:77). smartBotData.ts:1222 : « انفراج (تباعد) » — correct |
| S7 | « فيغوص الصهر » | 🔵 VRAI → **CORRIGÉ + VERROUILLÉ** | 0 occurrence hors interdiction explicite (morchidCorrectifs.test.ts:200) |
| S8 | « الوشام » au lieu de « الوشاح » | 🔵 VRAI → **CORRIGÉ + VERROUILLÉ** | 0 occurrence hors FORBIDDEN ; « الوشاح » partout (ScienceAnimations, activeLessons, lessonGoldSummaries…) |

### 2.D — Fondations produit (S0-01 → S0-05)

| # | Affirmation auditée | Verdict | Réalité à HEAD (preuve) |
|---|---|---|---|
| S0-01 | ~40 copies d'élèves versionnées dans Git (RGPD) | ✅ VRAI · OUVERT | **40 fichiers `eleve_*.txt`** à la racine du dépôt (comptage exact) + `uploads_externes/` non ignoré |
| S0-02 | `BAC_EXAM_DATE = ''` → compteur mort | ✅ VRAI · OUVERT | dashboardActions.ts:21 ; `bacDaysLeft()` retourne null |
| S0-03 | Streak jamais incrémenté, célébration morte, mensonge visible | ✅ VRAI · OUVERT | `streakDays: 1` en valeur par défaut à 4 endroits d'App.tsx (l.300, 351, 424, 567) + DailyGoalWidget.tsx:46 (défaut 3) ; **zéro incrémentation** (grep `streakDays +` vide) ; `StreakCelebrationModal.tsx` présent, `playStreakMilestoneSound` appelé (DailyGoalWidget.tsx:124) ; `pointsAwarded` easy 15 / good 10 / hard 5 / again 2 (App.tsx:407) — chiffres exacts de l'audit |
| S0-04 | Version 0.0.0, 0 tag, 0 build signé, aucune politique de confidentialité | ✅ VRAI · OUVERT | `package.json` « version": "0.0.0" ; `git tag` = 0 ; `src/lib/supabase.ts` inerte (43 lignes, creds env vides → `hasSupabaseCreds = false` — la déclaration « aucune donnée collectée » est donc fondée) |
| S0-05 | Cache offline : 22 leçons sur 47 | 🟡 PARTIEL · **CHIFFRES PÉRIMÉS** | Annoncé 22/47. Réel à HEAD : **23 leçons** référencées dans `public/sw.js`, **25 fichiers HTML** dans `public/lessons/`, **71 `lessonKey` distincts** dans `lessonIndex.ts`, **548 entrées** d'index. Le problème persiste — sous une forme différente et plus grave (voir §4-N2) |

### 2.E — Modules, contenu, couverture

| # | Affirmation auditée | Verdict | Réalité à HEAD (preuve) |
|---|---|---|---|
| E1 | Doublon de navigation BacExamView / Bac2025ExamView | ✅ VRAI · OUVERT | Les deux composants coexistent (`src/components/BacExamView.tsx` + `Bac2025ExamView.tsx` + son test) |
| E2 | Meftah et Boussole = deux portes pour la même clé | ✅ VRAI · OUVERT | `MeftahView.tsx`, `MiftahCard.tsx` + `BoussoleCard.tsx` coexistent |
| E3 | Modules cités par l'audit de modules | ✅ VRAI | Tous présents : `TahlilWall.tsx`, `SituationBankView.tsx`, `documentAnalysisExercises.ts`, `enzymeInhibitors.lock.test.ts`, `immunityCooperation/HivAids.lock.test.ts`, `bacArchetypes.ts` (+lock), `lessonGoldSummaries.ts` (+test) |
| E4 | Fusion Meftah : « conserver le micro-drill 60 s (SwitchDrillModal) » | 🟡 DÉNOMINATION INEXACTE | Aucun fichier `SwitchDrillModal` (find vide). Le drill réel est **`SchemaDrillView.tsx`** (+ test). Le ticket KEO-302 doit citer le bon composant |
| E5 | « 49 entrées exposées / 19 rubriques » | ⚪ NON VÉRIFIABLE PRÉCISÉMENT | 61 fichiers `.tsx` dans `src/components/` — même ordre de grandeur ; le compte exact « 49 » dépend du catalogue de navigation, non re-dénombré ici |
| E6 | S-C4 : 120 questions Flutter sautées à l'import | ✅ VRAI · OUVERT | `unitCatalog.ts:9-10` : « skipped 120 unsupported or placeholder Flutter questions » — citation exacte, toujours non récupérées |
| E7 | S-C2 : balisage NON_EXIGIBLES/CULTURE_GENERALE réel + chapitres « à reconstruire » | ✅ VRAI | `curriculumOfficial.ts:35-49` (المتمم, الأسيلوسكوب, نضج الـ ARNm…) + `unitLessonSequences.ts:56` « ch collision/ophiolites à reconstruire » |
| E8 | S-Q1 : pool déséquilibré mais tirage équilibré par construction | 🟡 PARTIEL (auto-classé) | `tirageBilan` confirmé : Fisher-Yates déterministe par domaine (qcmBilan.ts:140+), 5 QCM/domaine. Comptage fin du pool non rejoué |
| E9 | Barème officiel : ex1 = 5, ex2 = 7, ex3 = 8 pts · 04h30 · 2 sujets | ✅ VRAI | `data/bac_sessions_2019_2026.json` : « bareme »: « exercice 1 = 05 pts, exercice 2 = 07 pts, exercice 3 = 08 pts », « duree »: « 04 h 30 », sessions 2019→2026 |
| E10 | « 66 questions » / « 7 sessions indexées » | 🟡 DÉRIVE MINIME | **67 questions** réellement (`correctIndex:` compté 67× dans smartBotData.ts ; le commentaire moteur l.106 dit encore 66) ; **8 sessions** couvertes (2019-2026), pas 7 |

---

## 3. FIABILITÉ DES DEUX RAPPORTS L'UN PAR RAPPORT À L'AUTRE

Conformément à l'analyse du SpecKit (§0) : socle commun identique ; l'archive `(1)` ajoute SPEC-06/10/11/14, le System Prompt consolidé, le golden set, les métriques et les lots — et **résout correctement** le conflit AGENTS.md (darija en détection, فصحى en sortie). Le mot-à-mot confirme :

- **Aucune contradiction factuelle** entre les deux archives sur les affirmations communes (mêmes preuves, mêmes localisations).
- La section « Rejected » du rapport `(1)` (B1/B4/B8 auto-invalités) est **honnête et exacte** — c'est un marqueur de qualité rare : l'audit corrige ses propres brouillons.
- Le champ « état » du rapport `(1)` (« correctif présent, non protégé » pour B2/B3/B7) était exact **à sa date de rédaction** mais est désormais **périmé** : `morchidCorrectifs.test.ts` protège ces correctifs à HEAD (vitest, 91 fichiers / 1135 tests).

---

## 4. DÉCOUVERTES DU MOT-À-MOT — NON COUVERTES PAR LES AUDITS

| # | Découverte | Preuve | Gravité |
|---|---|---|---|
| **N1** | **Deux chemins de matching sont restés en sous-chaîne** alors que le correctif B3 (`includesAsWord`) ne couvre que les fiches : le scoring par mots-clés du guide d'étude (`findBestStudyGuide`, l.400 : `norm.includes(nk)`, +8 pts/mot) et le filtre hors-programme (l.1040 : `norm.includes(nk)` sur `OUT_OF_PROGRAM`). Toute collision de sous-chaîne arabe y reste possible (faux positifs hors-programme, détournements du guide) | `smartTutorEngine.ts:400, 1040` vs l.608/657/667/679 corrigés | Moyenne |
| **N2** | **L'écart offline est bien plus grave que déclaré** : 23 leçons en cache (`public/sw.js`) pour 71 `lessonKey` distincts indexés (548 entrées) et 25 fichiers HTML. En outre, 71 lessonKey référencés pour 25 fichiers HTML suggère des entrées d'index sans fichier correspondant — écart structurel à instruire avant toute promesse « 100 % hors-ligne » | comptages grep : sw.js=23, `public/lessons/*.html`=25, lessonKey distincts=71, entrées=548 | Haute |
| **N3** | **`scripts/verify_b2_negation.ts` est du code mort** : présent mais câblé nulle part (package.json, CI, tests). La protection réelle vient de `morchidCorrectifs.test.ts` (vitest). À câbler ou supprimer pour éviter un faux sentiment de garde-fou | grep « verify_b2 » dans package.json/.github/tests = 0 résultat | Basse |
| **N4** | **Branche « pool vide » de « اختبرني » silencieuse** : si le sujet visé n'a aucun QCM, aucun message d'indisponibilité n'est affiché (chute vers le traitement générique) ; et si le sujet n'est pas reconnu, le handler retombe sur la **première carte du domaine actif** — une substitution résiduelle. GS-11 du golden set n'est donc pas encore satisfait | `smartTutorEngine.ts:1015-1019` (fallback `?? KNOWLEDGE_CARDS.find(...)`), l.1030-1035 (pas de branche pool vide) | Moyenne |
| **N5** | **Aucun feedback d'inversion de polarité pour l'élève** : nier un point-clé vaut désormais 0 (B2 corrigé), mais l'élève reçoit un score sans explication — la moitié pédagogique du correctif manque | grep « تنفيها / صيغة الإثبات » = 0 ; `gradeKeyPoints` ne retourne qu'un nombre | Moyenne |
| **N6** | **Dérive de contenu** : 67 questions réelles vs 66 documentées (commentaire moteur l.106) ; 8 sessions BAC couvertes vs 7 annoncées | comptages | Mineure |

---

## 5. IMPACT SUR LE SPECKIT (tickets KEO) — REQUALIFICATIONS RECOMMANDÉES

Le SpecKit `docs/SPECKIT_CORRECTION_2026-10-01.md` et les issues #5→#34 restent **valides dans leur principe** ; le mot-à-mot en précise l'état réel :

| Ticket | État révélé par le bilan | Recommandation |
|---|---|---|
| KEO-107 (polarité) | Moteur **corrigé + verrouillé** (4 tests) ; reste le **feedback d'inversion** à l'élève | Priorité Critique → **Haute** ; recentrer le ticket sur le feedback (N5) |
| KEO-108 (اختبرني) | Handler **corrigé + verrouillé** (2 tests) ; restent la branche pool vide + la substitution première carte (N4) | Critique → **Haute** ; périmètre réduit à GS-11 |
| KEO-111 (RAG / 7 erreurs) | Les **7 erreurs scientifiques sont purgées et verrouillées** (FORBIDDEN + tests) ; reste la **provenance** (aucun champ `source` dans `KnowledgeCard`) et la cohérence croisée systématique | Critique → **Haute** ; re-scoper sur la provenance uniquement |
| KEO-112 (matching mot entier) | Corrigé pour les fiches ; **2 chemins restants** (l.400, l.1040 — découverte N1) | **Maintenir Haute** avec la localisation exacte |
| KEO-113 (journalisation échec) | **Corrigé + verrouillé** (B6) ; reste la distinction dashboard absent / echec_reel / abandon | Moyenne — maintenir, périmètre dashboard |
| KEO-005 (cache offline) | Chiffres périmés — l'écart réel est **23 cache / 71 lessonKey / 548 entrées** (N2) | **Maintenir Critique** et mettre à jour les volumes |
| KEO-101/102/103/104/105/106 | **Confirmés ouverts** mot à mot (A1-A4, A12, A13) | Inchangés — cœur du LOT 1/2 |
| KEO-201/202/203/204/205 | **Confirmés ouverts** (A5-A10) | Inchangés |
| KEO-302 (fusions) | Doublons confirmés (E1, E2) ; remplacer « SwitchDrillModal » par **`SchemaDrillView.tsx`** (E4) | Inchangé, corriger le nom du composant |

> Ces requalifications ne diminuent en rien l'urgence du LOT 1 : ce qui reste ouvert (KEO-101 escalier d'indices, KEO-201 détresse, KEO-102 chrono, feedback KEO-104) est précisément ce qui **démotive ou passive** l'élève — le cœur de votre objectif.

---

## 6. CONCLUSION

1. **Les audits transmis sont fiables à ~92 %** — et à **100 %** sur les affirmations qu'ils présentent comme vraies (les 3 fausses avaient déjà été rejetées par eux-mêmes). Aucune contre-vérité transmise.
2. **Leurs deux biais : l'obsolescence et la dérive quantitative.** 12 failles décrites sont déjà corrigées **et** verrouillées à HEAD (B2, B3, B6, B7, S1-S8, S-M1) ; les comptages (leçons, questions, sessions, noms de composants) ont dérivé.
3. **La moitié « motivation/encadrement » du tuteur (R1→R10) est, elle, toujours ouverte** — le mot-à-mot confirme chaque ligne : correction en 1 clic, fiche prémâchée, détresse rejetée, index zéro, date vide, adjectifs sans remède, lexique marin, XP de présence. C'est bien là qu'il faut coder.
4. **Le mot-à-mot apporte 6 découvertes inédites** (§4) dont deux dignes de tickets : les chemins de matching restés en sous-chaîne (N1) et l'ampleur réelle de l'écart offline (N2).

*Vérifications réalisées par grep/node sur HEAD `cd0609c` ; toutes les preuves citées (fichier:ligne) sont reproduites tel quel depuis le code.*
