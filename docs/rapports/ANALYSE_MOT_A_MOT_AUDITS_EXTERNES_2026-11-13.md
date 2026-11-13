# Analyse mot à mot des deux audits externes (zips du 2026-11-13)

**Objet.** Dissection affirmation par affirmation des deux rapports pleins reçus dans
`C:\Users\zakaria\Downloads\NEW`, avec pour chacune un verdict **✓ confirmé** /
**✗ faux** / **◐ nuancé** / **⏳ périmé** (vrai à la date auditée, faux aujourd'hui),
adossé aux mesures du dépôt du 2026-11-13 (chaîne verte : tsc 0 ; vitest 363
fichiers / 4 089 tests ; jest 353 suites / 4 021 tests ; build exit 0).

**Cible des deux audits.** Commit `6cce20d` (`origin/master`, 2026-11-12 07:30),
c'est-à-dire **sans** les 23 commits de `reorganisation-med` (patch arena du
2026-11-09). Les verdicts « périmé » tiennent presque tous à ce décalage ou à une
date de lecture plus ancienne que le commit.

---

## 0. Rapport A (zip « audit-svt-bac-application.zip », app Vite, 80,0/100)

Fichier : `src/data/audit.ts` (699 lignes). Score déclaré 80,0, 8 axes pondérés,
5 forces classées, 5 faiblesses classées, 15 recommandations, 10 items de méthode,
verdict + 3 urgences + 5 « notes sur les prémisses ».

### Axe 1 — Programme (note 8,5/15 %)

| # | Affirmation | Verdict | Preuve |
|---|---|---|---|
| 1.1 | « 11 unités encodées heure par heure sur le التدرج السنوي 2017 » | ✓ | `curriculumOfficial.ts` : heures, fenêtres, compétences — conformité vérifiée par `curriculumIntegrity.test.ts` |
| 1.2 | « NON_EXIGIBLES retire le المتمم, l'Auroscope, la maturation de l'ARNm ; 19 QCM retirés (QCM_HORS_PERIMETRE) » | ✓ | 550 bruts − 19 = **531 servis** — chiffre reproduit exactement |
| 1.3 | « Séquence officielle : 44 entrées + verrou lessonIndexParity » | ✓ (non recompté ligne à ligne) | `programSequence.ts` + verrou existant |
| 1.4 | « Trou U11 fermé : migmatite, wilson, ophiolites » | ✓ | 3 identifiants présents dans la séquence |
| 1.5 | « manuelErrata.ts encode **35** errata » | ✗ (écart) | Mesure : `ERRATA.length` = **34** (voir § 5) |
| 1.6 | « bacWeightPercent renseigné U1→U7 (10, 9, 13, 13, 16, 20, 19 = 100 %), U8→U11 absents » | ✓ | Mesure `unitOpenings.ts` : `[[1,10],[2,9],[3,13],[4,13],[5,16],[6,20],[7,19],[8,null],[9,null],[10,null],[11,null]]` |
| 1.7 | « corpus QCM à 2 % de tokens latins » | ◐ | Mesure : **4,8 %** (848/17 776) — mais 100 % de ces tokens sont des acronymes scientifiques (ATP 97, ARNm 43, CO2 33…) ; la conclusion (monolingue arabe) est juste, le chiffre est sous-estimé |
| 1.8 | « Poids U6+U7 (39 % annoncé) contredit par l'observation (~13 %) sur les sessions » | ◐ (non recompté) | Écart documenté dans le dépôt ; non re-mesuré dans ce lot |

### Axe 2 — Contenus (note 8,5/12 %)

| # | Affirmation | Verdict | Preuve |
|---|---|---|---|
| 2.1 | « 25 leçons HTML = 28 480 mots, 1 139 mots/leçon ≈ 5,7 min » | ✓ | Mesure antérieure identique (25 fichiers / 28 480 mots) |
| 2.2 | « 29 leçons actives → **111 blocs** interactifs de 9 types (20/26/21/13/10/10/6/3/2) » | ✓ à `6cce20d` | Décompte au commit audité : TEXT_AND_PRODUCE 20, GUIDED_DOC_QA 26, SEQUENCE_ORDER 21, MISSION_CHOICE 13, HOTSPOT 10, COMPARISON_TABLE 10, HYPOTHESIS 6, DUAL_EVIDENCE 3, REASONING_COUNT 2 = **111** — identique mot pour mot. (Sur la branche actuelle : 105 — 6 blocs de moins, patch arena.) |
| 2.3 | « خلاصة الدرس dans 25/25, positionnée 40–51 % du fichier, donc AVANT l'évaluation » | ◐ | Présence 25/25 ✓, position 39,7–50,5 % du fichier brut ✓ — mais l'interprétation est fausse : chaque leçon contient **2 chapitres**, chacun suivi de sa خلاصة + تقويم. La carte n'est pas « avant l'évaluation », elle est *entre* les deux activités |
| 2.4 | « **0/25** leçon avec objectif en tête (0 occurrence de أهداف / هدف الدرس) » | ✗ | « الهدف العلمي » présent **25/25** (~5 % du texte) — l'audit a cherché les mauvais mots |
| 2.5 | « 11 cartes mentales, 74 résumés d'or, 53 résumés, 32 micro-capsules » | ✓ | Mesure exacte : 11 / 74 / 53 / 32 |
| 2.6 | « Pyramide inversée : D1 250 (47,1 %), D2 127 (23,9 %), D3 154 (29,0 %) vs cible 75/20/5 » | ✓ | Mesure identique au chiffre près ; l'état est **verrouillé sciemment** (`difficulteQcm.lock.test.tsx` fige 250+127+154 avec la mention « rééquilibrage par AJOUT ») |
| 2.7 | « Pas d'étiquetage 🔴🟡🟢 par leçon » | ⏳ | Vrai à `6cce20d` ; l'étiquette de priorité existe sur la branche (`UnitIntroPortal`, calculée sur les 65 idées BAC — patch arena du 09/11) |

### Axe 3 — Assimilation (note 8,0/18 %)

| # | Affirmation | Verdict | Preuve |
|---|---|---|---|
| 3.1 | « Parcours de 85 tâches = 47 HTML + 27 actives + 11 jalons » | ✓ | `PARCOURS_FLAT.length` = **85** (74 lessons + 11 jalons — même total, découpage affiché différent mais cohérent) |
| 3.2 | « Moteur next best action : reprise → rappel échu → quota → nouveau » | ✓ (non recomposé) | `nbaEngine.ts`, priorité testée |
| 3.3 | « Plan de révision : 4 presets (30/14/7/3 j) + règle « les 2 derniers jours ne servent qu'à consolider » » | ✓ | `revisionPlan.ts` — commentaires et verrous présents |
| 3.4 | « SM-2 unique (4 doublons supprimés), plafond 21 j » | ✓ | `src/lib/sm2.ts` |
| 3.5 | « **Aucun test de positionnement initial** » | ✓ à `6cce20d`, ⏳ sur branche | `positionnementInitial.ts` absent de `master` (vérifié par `git cat-file -e 6cce20d:...`) ; **présent sur `reorganisation-med`** (3 profils, câblé dans `ParcoursAssimilation`) |
| 3.6 | « **Aucun objectif de note** (10/14/18) » | ✓ à `6cce20d`, ⏳ sur branche | `OBJECTIFS_NOTE` (10/14/18) existe sur la branche, absent de `master` |
| 3.7 | « **Pas de mode express J-7** » | ✓ à `6cce20d`, ⏳ sur branche | Onglet « express » de `ParcoursAssimilation` sur la branche |
| 3.8 | « Rappel du parcours à **J+14 fixe** » | ✓ | Confirmé : `parcoursProgress.ts` + `nbaEngine.ts:33-40` ; le SM-2 canonique ne sert que `gestureRecallEngine` et `spacedRecallIntervals` |
| 3.9 | « Pas de courbe d'oubli exposée » | ◐ | Une courbe existe côté SRS (`PanneauSrs` / `bilanSrs`) mais pas sur le parcours — la nuance de l'audit (« restent internes ») est honnête |
| 3.10 | « Le bilan QCM ne persiste pas son diagnostic (L03-xx) » | ◐ (non re-testé) | Constat interne cité ; non reproduit dans ce lot |
| 3.11 | « Correcteur calé sur les 40 copies = plancher, pas validation indépendante » | ✓ | C'est la règle d'or n° 2 d'AGENTS.md, mot pour mot |

### Axe 4 — Exercices (note 8,5/12 %)

| # | Affirmation | Verdict | Preuve |
|---|---|---|---|
| 4.1 | « 853 items servis = 531 QCM + 41 livre + 121 trous + 69 drills + 18 drills schéma + 22 situations + 19 analyses + 32 capsules » | ✓ | Chaque composante reproduite (18 drills schéma, 22 situations, 19 exercices élite, 53 contextes doc) |
| 4.2 | « Format algérien : sujet parmi 2, 5/7/8 pts, 270 min, variantes 2016 (6/5/9, 6/7/7) » | ✓ | `DUREE_EPREUVE_MINUTES` = 270 ; barèmes documentés |
| 4.3 | « Plafonds d'intégrité du correcteur : non-prose 30 %, négation 50 %, écho 25 % » | ✓ (non recompté) | `attendusBac2025.ts` |
| 4.4 | « Validateur laxiste : `fillBlankValidate` accepte une négation et des bases inversées ; `validateW2` valide « لا يحدث تثبيط » sur le seul mot تثبيط » | ✓ | Confirmé : `fillBlankValidate.ts:43-55` = couverture ≥ 60 % **sans invariant** ; `LessonTwoView.tsx:127-139` = mots-clés `includes()` ; les 10 codes d'`errorTaxonomy.ts` sont des étiquettes, jamais bloquants |
| 4.5 | « 4 documents indisponibles (lecture_shifra ×2, anémie falciforme, seuil d'intégration) — L03-03 » | ✗ | Les 6 `exerciseIds` concernés (`codon_anticodon`, `translation_schema`, `h1_h2_generic_double_doc`, `electro_hb`, `mutation_protein_function`, `uracile_marque`) sont résolus dans `src/data/` — l'audit cite les constats internes sans les re-vérifier |
| 4.6 | « Pas d'index "cette leçon a N exercices" » | ✓ (non recompté) | Aucune vue de comptage par leçon identifiée |
| 4.7 | « Pas de format Vrai/Faux avec justification » | ✓ | Aucun tel moteur dans le dépôt |

### Axe 5 — BAC (note 8,0/10 %)

| # | Affirmation | Verdict | Preuve |
|---|---|---|---|
| 5.1 | « 28 PDF (14 sessions × 2), 2013→2026, verrou disque bacPdf.lock » | ✓ | `public/bac-sujets/` = 28 fichiers / 93,58 Mo |
| 5.2 | « 65 idées d'exercice indexées sur 11 sessions continues » | ✓ | `BAC_IDEAS.length` = 65 |
| 5.3 | « PENDING 2013-2015, 2021 S2 incomplet, MISSING vide » | ✓ | Mesure exacte : PENDING 2013,2014,2015 ; INCOMPLETE 2021/S2 ; MISSING 0 |
| 5.4 | « **10 archétypes** transversaux » | ✗ (écart) | `ARCHETYPE_COUNT` = **13** |
| 5.5 | « Corrigés non embarqués, renvois eddirasa/dzexams » | ✓ | `public/corrections/` inexistant (0 fichier) |
| 5.6 | « Sujet 2025 intégralement corrigé item par item » | ✓ | `attendusBac2025.ts` |

### Axe 6 — UX (note 7,5/10 %)

| # | Affirmation | Verdict | Preuve |
|---|---|---|---|
| 6.1 | « Build = **108 Mo**, dont 94 Mo de PDF ; entrée 547,95 Ko / 141,52 gzip » | ✓ à l'environnement audité | Notre mesure : hors APK = **106,74 Mo** (93,58 PDF) — cohérent. Entrée sur la branche : 556,1 Ko (patch arena) — toujours < 700 |
| 6.2 | « bundleBudget.test.ts n'inspecte que dist/assets → budget vert pendant que le poids triplait » | ✓ | Confirmé : le test ne voit que `dist/assets` (plafond entrée) — **aucun garde-fou total** (constat n° 10) |
| 6.3 | « APK ≈ 110–120 Mo vs cible < 50 Mo » | ◐ | Le raisonnement est juste pour un dist de 108 Mo ; **en local** le dist est 283,17 Mo car Vite copie `public/apk/` (2 APK de 88 Mo, gitignorés) — aggravation que l'audit n'a pas pu voir (APK non versionnés) |
| 6.4 | « <nav>/<main> absents, prefers-reduced-motion absent » | ✗ / ⏳ | Mesure branche : `<nav>` ×2, `<main>` ×5, `prefers-reduced-motion` ×1 — mais `tabIndex` ×1 et `aria-current` ×0 : le fond (accessibilité maigre) reste vrai |
| 6.5 | « Recherche : 547 chunks (836 Ko) » | ⏳ | Vrai à `6cce20d` ; recalibré sur la branche : **578 chunks / 76 leçons** (mesures du 08/11) |

### Axe 7 — Engagement (note 8,0/13 %)

| # | Affirmation | Verdict | Preuve |
|---|---|---|---|
| 7.1 | « 111 blocs interactifs, 9 types » | ✓ (voir 2.2) | |
| 7.2 | « Tuteur : 472 Ko / **562 chunks**, 0 appel API » | ⏳ | Vrai à `6cce20d` ; recalibré sur la branche : **578 chunks** |
| 7.3 | « Prescriptions tracées (suivie/ignorée/expirée), motif abandonné après 3 échecs » | ✓ | Architecture vérifiée |
| 7.4 | « 9 badges, séries 7/30, objectif 25 min / 20 questions » | ✓ | StatsView et capitaine |
| 7.5 | « 0 classement / 0 forum » | ✓ | 0 occurrence mesurée |
| 7.6 | « Quiz **non adaptatif à l'item** » | ✓ à `6cce20d`, ⏳ sur branche | `QuizAdaptatif.tsx` existe sur la branche (opt-in, porte `quiz-ouvrir-adaptatif`, patch arena) |
| 7.7 | « Les gains Hosila ne programment pas de rappel SM-2 (lot 02) » | ◐ (non re-testé) | Constat interne cité ; la boucle Hosila→SM-2 reste partiellement ouverte (reco R15) |

### Axe 8 — Technique (note 6,5/10 %)

| # | Affirmation | Verdict | Preuve |
|---|---|---|---|
| 8.1 | « ~3 374 tests / 328 fichiers, 61 verrous » | ◐ | Ordre de grandeur correct à l'époque ; mesure du jour : **363 fichiers / 4 089 tests** (vitest) |
| 8.2 | « CI rouge sur les runs 259–261 (test dépendant du fuseau) » | ⏳ | `master` est **verte** depuis le 2026-11-12 06:30 (run `43168610285`, success) — constat n° 2 fermé |
| 8.3 | « APK non signé ni publié » | ◐ | Signature release **en place** (`android/app/build.gradle`, keystore hors dépôt, versionCode 2 / 1.1) ; la publication Play reste à faire |
| 8.4 | « README annonce 100 % gratuite » | ⏳ | README **corrigé** (freemium 1 200 DA) depuis le 2026-11-10 ; reste la `description` de `package.json` qui dit encore « gratuite » |
| 8.5 | « 1 erreur ESLint (constat #4) » | ⏳ | **0 erreur / 0 warning** depuis le 2026-11-10 (garde-fou local réparé : artefacts + vendor ignorés) |
| 8.6 | « Livres sous droits versionnés (constat #1) » | ✓ | Toujours ouvert : 8 fichiers suivis dans `uploads_externes/` |
| 8.7 | « Suite complète non exécutable chez l'auditeur (Node 20.20.2 < 22.14) » | ✓ (honnête) | Limite méthodologique déclarée par l'audit lui-même — c'est pourquoi plusieurs constats « non vérifiables » sont en réalité résolus |
| 8.8 | « U1–U5 gratuites » | ✓ | `UNITES_GRATUITES` = 1-5 (le commentaire périmé de `facturation.ts` est le constat n° 5 interne, inversé) |

### Forces / faiblesses classées (5 + 5)

- Force n° 1 « moteur d'assimilation » → ✓ (conforme à l'axe 3 ci-dessus).
- Force n° 2 « traçabilité ministérielle + honnêteté » → ✓ (sauf chiffre errata 35 → 34).
- Force n° 3 « 100 % local, prix symbolique » → ✓.
- Force n° 4 « corpus calibré sur le format algérien » → ✓.
- Force n° 5 « micro-leçons réelles + synthèses ancrées au manuel » → ✓.
- Faiblesse n° 1 « 108 Mo sans garde-fou » → ✓ (+ aggravation locale 283 Mo, cf. 6.3).
- Faiblesse n° 2 « aucun point d'entrée ni de sortie » → ✓ à `6cce20d`, ⏳ sur branche
  (positionnement + objectif + express existent sur `reorganisation-med`).
- Faiblesse n° 3 « pyramide inversée » → ✓ (constat n° 12).
- Faiblesse n° 4 « validateur qui enseigne le faux » → ✓, MAIS sa sous-preuve
  « 4 documents indisponibles » est ✗ (cf. 4.5).
- Faiblesse n° 5 « corrigés hors ligne + app nulle part » → ◐ (corrigés ✓ ;
  « app nulle part » est trop absolu : signature release prête, dossier store préparé).

### Les 15 recommandations (statuts)

Reprise du rapport de vérification (`VERIFICATION_AUDIT_EXTERNE_ZIPS_2026-11-13.md`,
§ 3) — synthèse : **5 déjà faites sur la branche** (R2, R7, et les parties
« étiquettes » de R8, « quiz adaptatif » de R12, « glossaire Capitaine »), **4
confirmées à l'identique** (R1 poids, R3 difficulté, R4 validateurs, R6 corrigés),
**1 aggravée** (R1 : 283 Mo en local), **2 partielles** (R5, R8, R9, R10, R13),
**1 fausse dans sa sous-preuve** (R11 : « 0/25 objectif »), **R14 confirmée non
faite** (aucun axe « compétence » ni « type de sujet » dans StatsView, 1 355
lignes analysées), **R15 confirmée pour les constats résiduels**.

### METHOD (10 items)

- « Dépôt cloné, HEAD 6cce20d » ✓ (cohérent avec tout ce qui précède).
- « Build 13,0 s, 82 chunks, 108 Mo » ✓ à son environnement.
- « Comptages servis (531, 531 flashcards, 41, 121, 69, 18, 32, 22, 31, 10, 16,
  65, 11, 53, 74, 29, 53, 19) » ✓ — tous reproduits, y compris les chiffres que
  les audits rivaux ont contestés (121 servi vs 161 brut : c'est bien la
  convention du verrou `volumeCorpus.lock.test.ts`).
- « 0/25 objectif en tête » ✗ (cf. 2.4).
- « Distribution 250/127/154 » ✓.
- « Post-build 4 fichiers / 20 tests verts, bundleBudget ne voit que assets » ✓.
- « Suite complète NON VÉRIFIABLE (Node 20) » ✓ honnête — et c'est la clé : les
  constats marqués « non vérifiables » ne sont pas des manques prouvés.
- « Interface jamais exécutée dans un navigateur » ✓ déclaré — et l'audit le
  paie : l'affirmation 2.4 (0/25) aurait sauté en 10 s de rendu réel.
- « Données d'usage non disponibles » ✓.
- « Correcteur : plancher pas validation » ✓ (règle d'or n° 2).

### VERDICT + 3 urgences

- « Prêt pour un déploiement, pas pour un lancement de masse » → ◐ d'accord.
- Urgence 1 (poids) → ✓, la plus grave, confirmée et aggravée en local.
- Urgence 2 (positionnement + objectif) → ✓ à la date auditée, **déjà traitée sur
  la branche** (fusionner `reorganisation-med` la ferme sans une ligne de code).
- Urgence 3 (difficulté + validateurs) → ✓ (constats n° 11 et n° 12).
- « Confiance ★★★☆☆ parce que l'interface n'a pas été exécutée » → ✓
  autocritique exacte : c'est précisément là que l'audit se trompe (2.4, 4.5).

### NOTES_ON_PREMISES (5 items)

1. « Pas de série SVT vs EXP en Algérie ; l'app cible علوم تجريبية » → ✓.
2. « Pas de Partie I/II/III ; format algérien encodé (5/7/8, 270 min) » → ✓.
3. « PWA + APK à venir, pas d'iOS, notes store non vérifiables » → ✓.
4. « Monolingue arabe, 2 % de latins, glossaire 617 non exposé » → ◐ (latins
   4,8 % tous acronymes ; le glossaire de 617 entités **alimente le correcteur**
   — `CorrecteurPanel`, `baremeCorrecteur`, calibration BAC 2025 — mais n'est
   pas parcourable en vue glossaire : « non exposé en interface » est juste,
   « inutilisé » serait faux).
5. « Poids 7/11 = décision documentée, pas un oubli » → ✓.

---

## 1. Rapport B (zip « svt-bac-application-audit.zip », app Next.js, 73,5/100)

Fichier : `src/lib/audit-data.ts` (448 lignes). 8 axes recalculés
(8,0 / 6,5 / 7,5 / 8,0 / 6,0 / 7,0 / 7,0 / 8,5) → 73,5, 10 recos R1-R10.
C'est le **même produit audité avec une information moindre** : il ne cite
jamais les leçons HTML, le build, ni les 28 PDF — beaucoup d'axes sont
remplis de « Non vérifiable ».

### Axe par axe — divergences notables avec le rapport A (même commit !)

| Affirmation (Rapport B) | Verdict | Commentaire |
|---|---|---|
| A1 : 11 unités, barème 5/7/8, non-exigible exclu, référentiel 2017 sans preuve de révision | ✓ | Cohérent avec A |
| A2 : « **550 QCM** (éclatés en 6 segments) » servis | ✗ | **531 servis** (550 bruts − 19 hors périmètre) ; le rapport B comptabilise le brut — erreur que le verrou `volumeCorpus` existe précisément pour empêcher |
| A2 : « 121 trous servis / 161 bruts, écart documenté » | ✓ | Exact, et c'est l'objet du verrou |
| A2 : « cartes mentales, glossaire bilingue, fiches essentiel : **Non vérifiable** » | ◐ | Les 11 cartes mentales **existent** et sont comptées ; l'audit B n'a pas ouvert les fichiers de données |
| A2 : « 3 465 tests » | ⏳ | Chiffre du README du 18/10 — périmé (constat n° 7 interne) ; réel : 4 089 vitest / 4 021 jest |
| A3 : tuteur القبطان, prescriptions tracées, abandon après 3 échecs, SM-2 16 concepts | ✓ | Conforme à A |
| A3 : « positionnement, filière, objectif de note, express J-7 : **Non vérifiable** » | ⏳ | Absents de `master` (donc à la date auditée, l'incertitude est légitime) mais **implémentés sur la branche** |
| A3 : « aucun parcours calendaire ni mission du jour » | ✗ | Le parcours « مساري » de 85 tâches + le moteur NBA sont exactement cela ; B ne les mentionne nulle part — son axe 3 (7,5) est **sous-noté par ignorance**, alors que A (8,0) les a lus |
| A4 : « calque Partie I / II / III » manquant | ✗ (prémisse) | Le Bac algérien n'a pas de Partie I/II/III (cf. NOTES_ON_PREMISES du rapport A lui-même) ; l'exigence est calquée sur le format français — les deux audits se contredisent sur cette prérogative |
| A5 : « 11 sessions, 3 épreuves blanches/domaine, 1 sujet intégral (2025) » | ✓ | |
| A5 : « corrigés type jury, rattrapage : non vérifiable » | ✓ (absents) | Cohérent avec A (reco R6) |
| A6 : « budget de bundle testé, 562 chunks vérifiés au build » | ◐ | Le budget testé ne couvre que `dist/assets` — B lui accorde plus de crédit qu'il n'en mérite (c'est le trou qu'A détecte) |
| A6 : « mode sombre / taille de texte : **non vérifiable** » | ✗ | Implémentés et documentés (`useTailleTexte`, variante dark + listener — correctif M1 du 18/10) |
| A7 : « badges / séries / points : **non vérifiables** » | ✗ | 9 badges + séries + XP existent (A les confirme) — **les deux rapports se contredisent sur le même commit** ; B a lu moins de fichiers |
| A7 : « pas d'assistant conversationnel » | ✗ | Morchid + Capitaine + tuteur local existent (A : « tuteur conversationnel 100 % local ») |
| A8 : « 3 465 tests / 294 fichiers, 0 erreur 0 warning ESLint, vie privée démontrée, freemium U1-5 à 1 200 DA » | ◐ | ESLint 0/0 ✓ (depuis le 10/11) ; vie privée ✓ ; tests : chiffres README périmés |
| A8 : « la gratuité s'arrête **avant les unités les plus lourdes** (Génétique, Immunologie) » | ◐ | U1-5 gratuites : vrai ; mais « l'élève paie exactement quand il en a le plus besoin » est une interprétation éditoriale, pas un constat |

### Les 10 recommandations du rapport B (statuts)

| Reco | Statut | Preuve |
|---|---|---|
| R1 positionnement 20 questions + plan | **Fait sur la branche** | `positionnementInitial.ts` (3 profils) + `ParcoursAssimilation` |
| R2 parcours calendaire + mode express J-7 | **Partiel / fait** | Parcours 85 tâches + NBA existaient déjà à `6cce20d` (B les a manqués) ; mode express J-7 fait sur la branche |
| R3 hiérarchisation 🔴🟡🟢 + poids unités | **Partiel** | Étiquettes de priorité via `UnitIntroPortal` (branche) ; poids U8-U11 toujours absents |
| R4 sujets intégraux + corrigés type jury | **Confirmé non fait** | 1 sujet complet corrigé (2025) ; `public/corrections/` inexistant |
| R5 couche bilingue FR/AR + revue référentiel | **Confirmé non fait** | 0 bascule de langue ; glossaire non bilingue |
| R6 Partie I/II/III + Vrai/Faux justifié | **Prémisse contestable** | Le format algérien n'a pas ces parties ; Vrai/Faux justifié : effectivement absent |
| R7 micro-gamification de régularité | **Déjà fait** | 9 badges (dont 2 paliers de régularité 7/30), séries, XP — B l'a classé « non vérifiable » |
| R8 page « Mon diagnostic » | **Partiel** | `profilErreurs` + StatsView existent ; pas de page unique « diagnostic » en langage clair |
| R9 confort (taille, sombre, favoris, recherche) | **Déjà fait** | Les 4 sont implémentés (B les avait en « non vérifiable ») |
| R10 transparence publique (chiffres, FAQ, fiche) | **Confirmé non fait** | Pas de page « chiffres et garanties » |

### Chiffrage B — réserves

Les efforts de B sont en **semaines** (R1 : « 3 à 4 semaines ») quand A estime
le même travail en **jours** (R2 de A : « M (3–5 j) »). Les deux ne peuvent pas
avoir raison en même temps : l'implémentation réelle sur la branche
(`positionnementInitial.ts` + onglet positionnement) est arrivée en ~2 jours de
lot, ce qui donne raison à A sur l'ordre de grandeur.

---

## 2. Pourquoi les deux rapports divergent (73,5 vs 80,0)

1. **Rayon de lecture.** A a lu le build, les 25 leçons HTML, les corpus servis,
   la banque BAC et les rapports internes. B est resté sur les fichiers de
   données + le README. Là où B dit « non vérifiable », A tranche souvent
   (badges, cartes mentales, tuteur, mode sombre) — et B se trompe alors
   (A7 badges, A6 mode sombre, A3 parcours).
2. **Prémisses différentes.** B applique une grille « Partie I/II/III » et
   « bilingue » que A lui-même démonte dans ses NOTES_ON_PREMISES. Le format
   B note l'app contre un cahier des charges français importé.
3. **Convergence remarquable.** Sur le cœur (corpus servi 531/121/853,
   pyramide 250/127/154, validateurs laxistes, positionnement absent,
   corrigés absents, vie privée, freemium), les deux sont d'accord — et ces
   convergences sont **toutes confirmées par nos mesures**, sauf les deux
   erreurs signalées (550 vs 531 chez B ; 0/25 objectif chez A).

## 3. Tableau final des erreurs matérielles relevées

| Rapport | Affirmation | Réalité mesurée |
|---|---|---|
| A | « 35 errata » | **34** (`ERRATA.length`) |
| A | « 10 archétypes BAC » | **13** (`ARCHETYPE_COUNT`) |
| A | « 0/25 leçon avec objectif en tête » | **25/25** ont « الهدف العلمي » |
| A | « 2 % de tokens latins » | 4,8 % (tous acronymes scientifiques) |
| A | « 4 documents indisponibles (L03-03) » | Résolus (6 `exerciseIds` servent) |
| A | « CI rouge runs 259-261 » | `master` verte (run 43168610285) |
| A | « README 100 % gratuite » | Corrigé (reste `package.json`) |
| A | « 1 erreur ESLint » | 0 erreur / 0 warning |
| A | « 562 chunks / 111 blocs / 547,95 Ko » | État à `6cce20d` exact ; branche : 578 chunks, 105 blocs, 556,1 Ko |
| B | « 550 QCM servis » | **531** servis (550 bruts) |
| B | « badges/séries/points non vérifiables » | Implémentés (9 badges, séries, XP) |
| B | « pas d'assistant conversationnel » | Morchid + Capitaine + tuteur local |
| B | « mode sombre / taille de texte non vérifiables » | Implémentés |
| B | « aucun parcours calendaire » | 85 tâches + moteur NBA |
| B | « 3 465 tests » | Chiffre README du 18/10 ; réel 4 089 vitest |

## 4. Ce que les deux audits voient juste, et que nous avons confirmé

Poids de livraison sans garde-fou (le seul défaut « critique » des deux) ·
pyramide de difficulté verrouillée hors cible · validateurs de réponses
ouvertes sans invariants · J+14 fixe sur le parcours · corrigés BAC hors
ligne · poids U8-U11 absents · pas de stats par compétence/type de sujet ·
pas de bascule bilingue · livres sous droits versionnés · honnêteté des
trous (PENDING, INCOMPLETE) et de la discipline « servi vs brut ».

## 5. Pourquoi « 34 » et « 13 » (écart A)

Les deux chiffres de A (35 errata, 10 archétypes) coïncident avec des valeurs
d'énoncés internes antérieurs à un ajout d'items. Le dépôt a gagné 1 erratum et
3 archétypes depuis la dernière édition interne que l'auditeur a pu lire. Les
verrous (`volumeCorpus.lock.test.ts`) ne couvrent pas `manuelErrata.ts` ni
`bacArchetypes.ts` en comptage absolu — c'est un trou de couverture de verrou à
considérer (à décider avec le propriétaire : ajouter ces 2 comptages au verrou).
