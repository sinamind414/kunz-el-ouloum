# Fusion master 3e970d2 → arena/01a0f7a7-kunz-el-ouloum — 2026-10-01

## Contexte

`origin/master` a été remplacé en cours de session par une lignée **sans ancêtre
commun** avec la branche de travail : `3e970d2` « feat(morchid): R1→R10 — du
moteur anti-triche au coach SVT BAC » (≈ 10 000 lignes : Tadwin, ProFigures,
TrainingHub, R1→R10). Les deux lignées, partant d'arbres quasi identiques,
avaient **implémenté en parallèle les mêmes recommandations d'audit** sous deux
numérotations différentes (R1→R10 côté master, KEO-xxx côté SpecKit).

La fusion (`git merge origin/master --allow-unrelated-histories`) a été résolue
selon la règle suivante : **pour chaque comportement dupliqué, l'implémentation
la plus complète et verrouillée par des tests gagne ; tout apport unique de
l'autre lignée est intégré.**

## Table de réconciliation

| Comportement | Eux (master, R1→R10) | Nous (SpecKit, KEO) | Arbitrage |
|---|---|---|---|
| Escalier d'indices + 2 tentatives | R1 : correction au 3ᵉ «لا أعرف» | KEO-101 : 3 indices (le 3ᵉ masque `keyPoints[0]`) PUIS correction plafonnée 3/10 | **KEO-101 gardé** (verrouillé par 4 tests garde-fou). Idée R1 retenue : la 1ʳᵉ tentative **nomme le point-clé manquant** sans livrer score ni correction |
| Chrono 90 s | R3 : refus avant 90 s sans tentative | KEO-102 : idem, refus + temps restant | **KEO-102 gardé** (contrats équivalents, tests existants) |
| Probe socratique | R2 : gate moteur + `probe?: string` — **aucune carte n'en portait** (feature inert) + `lastProbeCard` en session | KEO-103 : `probe { question, expect }` sur **11 cartes**, verdict ✅/📌, contournement «اشرح لي» journalisé, quick actions exemptées | **KEO-103 gardé** (surerset vivant). `lastProbeCard` écarté, remplacé par `pendingProbeCardId`/`probeBypassed` |
| Bilan de fin de défi | R4 : `buildBossBilan` générique, porte = domaine entier | KEO-104 : CAUSE chiffrée (`missedKeyPoints` accumulés) + ACTION 10 min + PORTE par `lessonKey` réel (`findLessonForKeyPoint`, 548 chunks), «لن أخترع لك رابطاً» sinon | **KEO-104 gardé** (porte exacte vs domaine vague) |
| Détresse jamais rejetée | R5 : `AFFECT_LEXICON`/`AFFECT_CORE` + `supportResult` | KEO-201 : idem, lexique darija de DÉTECTION uniquement, sortie فصحى (AGENTS.md) | **KEO-201 gardé** (conforme AGENTS.md, tests darija/فصحى) |
| Contrat du verbe de consigne | — | KEO-106 : `VERB_CONTRACTS`, affiché avant l'écriture, conformité vérifiée | **KEO-106** (unique) |
| Triade ألاحظ→أستنتج→أخلص | — | KEO-105 : dialogue libre en 3 blocs | **KEO-105** (unique) |
| Priorisation des erreurs | **R6** : `rankMistakes` = fréquence × poids BAC × oubli | — | **R6 intégré** (remplace `mistakes[0]`) |
| Guide d'étude proposé | **R7** : ≥ 3 erreurs sur un sujet → protocole proposé dans la mission | — | **R7 intégré** |
| Date BAC vide | **R8** : `BAC_EXAM_DATE = '2027-06-08'` PROVISOIRE + `BAC_EXAM_DATE_IS_PROVISIONAL` + compte à rebours dans la mission | KEO-002 : garde-fou d'affichage, date attendue de l'owner | **R8 intégré** — KEO-002 résolu en attendant l'arrêté officiel (un seul endroit à modifier : `src/utils/dashboardActions.ts`) |
| Célébration du gain | **R10** : la mission nomme le point-clé maîtrisé/à reprendre | — | **R10 intégré** |
| Négation (B2) | Primitives extraites vers `lib/validation/negationAr.ts` (partagées avec le scorer C2 de Tadwin) | Inline dans le moteur + feedback d'inversion KEO-107 | **Extraction adoptée** : `tokenAffirmed` délègue à `tokenAffirme` ; `gradeKeyPointsDetail` (KEO-107) inchangé |
| Tadwin, ProFigures, TrainingHub, couvCle | Nouveaux fichiers + onglet App.tsx | — | **Intégrés tels quels** |

## Tests adaptés (intention conservée, contrat KEO)

- `src/utils/__tests__/synonymAndStuffing.test.ts` : les 3 tests R1 de master
  sont conservés, adaptés au contrat KEO-101 (1ʳᵉ tentative → enregistrée SANS
  indice ni score ; «لا أعرف» → indice ; sortie d'escalier au 4ᵉ «لا أعرف» avec
  score plafonné ≤ 3/10). Helper `boss(overrides)` repris de master.
- `src/components/__tests__/AITutorView.test.tsx` : version KEO conservée
  (réponses causales conformes au contrat du verbe KEO-106).

## Preuves

- `tsc --noEmit` ✓
- vitest : **168 fichiers / 2115 tests** (4 skipped) ✓ — dont les suites
  Tadwin/TrainingHub/couvCle/dashboardActions de master, intactes.
- jest : **162 suites / 2078 tests** ✓
- build ✓ · `verify_b2` (0/10 · 10/10 · 5/10) ✓ · `verify_morchid_fixes` ✓ ·
  `verify_morchid_audit` ✓

## Suite : SpecKit 002 (master `81984de`, même jour)

`origin/master` a avancé vers `81984de` « SpecKit 002 — S-01 probes, S-03
triade C3, S-04 typage R/A, S-05 recall, S-06 lessonKey, S-10 protocole »
(enfant normal de `3e970d2`). Fusionné dans la foulée — 3-way avec base
`3e970d2`, 2 conflits (moteur, sessionManager), même règle d'arbitrage :

| Item 002 | Arbitrage |
|---|---|
| S-01 probes sur les cartes | **KEO-103 gardé** : leurs 11 `probe: string` retirées au profit de mes 11 `probe { question, expect }` (verdict ✅/📌). Leur test d'assertion de build **adapté et conservé** (`speckitS01Probes.test.ts`) : chaque fiche porte une probe courte (≤ 120 car.) qui ne fuit pas le shortAnswer — 4 probes raccourcies pour satisfaire le seuil |
| S-03 triade C3 | **KEO-105 gardé** (déclencheur plus fin : exclusions كيف/منهج/قالب, libération par intention menu ; verrouillé par 4 tests). `speckitS03S04.test.ts` **retiré** : il encode leur modèle d'état (`session.triad { step, verb, closedFamily }`, exports `detectTriadVerb`) incompatible — couverture équivalente assurée par `morchidSocratique.test.ts`. **Suit à documenter** : la nuance « famille fermée » (حلّل/استخرج → causal interdit aussi à l'étape 2 de la triade) mérite d'être intégrée à KEO-105 |
| S-04 typage R/A | **Intégré** : `classifyError` + `errorTypeLine` greffés — le bilan final type l'erreur (استرجاع/تحليل) en première ligne, avant CAUSE/ACTION/PORTE |
| S-05 rappel actif | **Intégré** : `buildRecallQuestion` — toute explication livrée (4 chemins, y compris après probe) se termine par une tâche صح/خطأ sur le premier mot-clé |
| S-06 lessonKey | **KEO-104 gardé** : leur résolution prenait le PREMIER chunk du domaine (`LESSON_INDEX.find(unitId === domain.id)`) ; la mienne matche les tokens du point manqué contre titres/alias/mots-clés des 548 chunks, avec «لن أخترع لك رابطاً» sinon |
| S-10 protocole imposé | **Intégré (variante fonctionnelle)** : score < 50 % → le quickAction en tête est «كيف أدرس العلوم؟» — porte RÉELLEMENT gérée par le moteur (source `guide`), contrairement à leur chip sans handler |
| Tests adaptés à leur moteur | `lessonIndex.search.r5.test.ts` et `tutorAudit.harness.test.ts` : **versions KEO conservées** (leurs deltas attendaient leur comportement probe-first sur l'API stateless, que KEO-103 contourne explicitement) |

## Reste à décider (owner)

1. **Date officielle BAC 2027** : remplacer la valeur provisoire `2027-06-08`
   dans `src/utils/dashboardActions.ts` dès parution de l'arrêté.
2. Les textes d'accueil des autres vues (voix unifiée KEO-205, entamée).
