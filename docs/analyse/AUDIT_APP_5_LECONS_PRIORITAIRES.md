# Audit de l'application — que manque-t-il pour les 5 leçons prioritaires ?

*Audit du code réel (254 fichiers scannés) au 26/09/2026, confronté au plan [`PLAN_LECONS_A_RENFORCER.md`](PLAN_LECONS_A_RENFORCER.md).*

## Matrice de couverture

Comptage réel des occurrences des notions clés dans chaque couche fonctionnelle de l'app.
✅ = couvert · ⚠️ = présent mais insuffisant · ❌ = absent

| Couche fonctionnelle | U2 pHi / acides aminés | U4 Coopération immunitaire | U3 Inhibiteurs enzymatiques | U4 CMH / ABO / Rh | U6 Phase photochimique |
|---|---|---|---|---|---|
| Leçon active/guidée (`activeLessons.ts`) | ❌ 0 | ✅ 13 | ⚠️ 2 | ✅ 27 | ✅ 7 |
| Résumé / synthèse (`resumesLecons.ts`, `lessonGoldSummaries.ts`) | ❌ 0 | ✅ 13 | ✅ 5 | ✅ 19 | ✅ 6 |
| QCM / drill (`quizCorpus`, `qcmLivre`, `drillBank`, `fillBlanks`) | ⚠️ 1 | ✅ 86 | ✅ 28 | ✅ 49 | ✅ 12 |
| Exercices BAC / documents (`bacExam`, `okacha`, `documentPracticeContexts`…) | ✅ 11 | ✅ 33 | ✅ 10 | ✅ 136 | ✅ 41 |
| **Micro-remédiation ciblée** (`microRemediations.ts`) | ❌ 0 | ❌ 0 | ⚠️ 1 réelle | ✅ 1 | ⚠️ 1 générique |
| **Carte mentale** (`mindMapData.ts`) | ✅ 6 | ❌ 0 | ❌ 0 | ❌ 0 | ❌ 0 |
| **Animation / simulation** (`ScienceAnimations.tsx`) | ❌ 0 | ❌ 0 | ❌ 0 | ❌ 0 | ❌ 0 |
| Tuteur IA / base de connaissances | ❌ 0 | ✅ 52 | ✅ 7 | ✅ 135 | ⚠️ 3 |

---

## Les 5 constats de l'audit

### 1. 🔴 La notion n°1 du plan (pHi) est un trou quasi total
`سلوك الأحماض الأمينية / pHi` : **0 leçon active, 0 résumé, 1 seul QCM, 0 remédiation, 0 simulation, 0 entrée dans le tuteur.**
Le mot-clé `المتساوية الكهربائية` (point isoélectrique) **n'apparaît nulle part dans le code applicatif**. Or c'est la vidéo la plus vue de toute la chaîne (1,5 M).
➡️ *Le contenu que les élèves cherchent le plus n'existe pas dans l'app.*

### 2. 🔴 Zéro simulation pour les 5 notions prioritaires
`ScienceAnimations.tsx` ne contient que **3 animations** : `action-potential`, `plate-divergence`, `protein-synthesis`.
Aucune des 5 leçons prioritaires n'a de support interactif, alors que **3 d'entre elles sont précisément des notions « à comprendre par manipulation »** (migration électrophorétique, courbes de cinétique enzymatique, enchaînement de la coopération cellulaire).
Le type de bloc `"simulation"` est déclaré dans `LessonBlock` mais **utilisé une seule fois** dans tout le projet.

### 3. 🔴 Le module « prérequis 2AS » n'existe pas
Recherche de `أليل / السيادة / المكتسبات القبلية / النمط الوراثي` :
- `activeLessons.ts` → **0**
- `microRemediations.ts` → **0**
- `resumesLecons.ts` → **0**
- `tutorKnowledge.ts` → **0**

Or le diagnostic du CMH/ABO/Rh était : *« ce n'est pas un blocage d'immunologie, c'est un trou de génétique de 2AS »*. L'app a beaucoup de contenu CMH (136 occurrences dans les exercices) mais **aucun filet de rattrapage en amont**.

### 4. 🟠 Les micro-remédiations ne couvrent pas les vrais points de blocage
19 micro-remédiations existent, mais leur répartition est déséquilibrée :
- `transcription` : 5 (dont 3 purement méthodologiques)
- `enzymes` : 4 — **mais une seule est disciplinaire** (« التشبّع: المواقع لا الإنزيم ») ; **rien sur l'inhibition compétitive/non compétitive**
- `photosynthese` : 1 seule, générique (« التايلاكويد يمتص الضوء — الحشوة تثبت CO₂ ») → **rien sur la phase photochimique elle-même**
- immunité : 4, dont *humorale*, *cellulaire*, *mémoire*, *soi/non-soi* — **mais aucune sur la coopération / l'interleukine**, c'est-à-dire précisément l'enchaînement qui bloque

### 5. 🟠 La carte mentale s'arrête à l'unité 3
`mindMapData.ts` : 34 nœuds répartis sur **unitId 1, 2 et 3 uniquement**.
**Unités 4 à 11 : aucune carte mentale.** Or la coopération immunitaire et la phase photochimique sont exactement les deux notions dont le problème est *l'enchaînement*, donc les premières candidates à une carte.

---

## Audit détaillé, leçon par leçon

### 1. سلوك الأحماض الأمينية / pHi — Unité 2
| | |
|---|---|
| ✅ Existe | Quelques exercices/documents (11 occurrences), 6 nœuds de carte mentale sur les acides aminés, la leçon `protein_structure_function` (étape `amino_acid_unit`) |
| ❌ Manque | Leçon active dédiée · résumé · QCM (1 seul) · **simulateur pH → charge → migration** · micro-remédiations · entrée tuteur |
| 🔧 À créer | `activeLessons.ts` → `amino_acid_behavior` (4 étapes) · `resumesLecons.ts` → même clé · `microRemediations.ts` → `ph_vs_phi`, `sens_migration`, `charge_globale` · `ScienceAnimations.tsx` → `electrophoresis-sim` · ~10 QCM dans `quizCorpus.ts` |

### 2. التعاون الخلوي — Unité 4
| | |
|---|---|
| ✅ Existe | Leçons `immunity_humoral_response` et `immunity_cellular_response`, 86 QCM, 33 exercices, tuteur bien fourni (52) |
| ❌ Manque | **Aucune leçon/objet qui relie les deux réponses** · aucune carte mentale unité 4 · aucune remédiation sur l'interleukine · aucun schéma-bilan interactif |
| 🔧 À créer | `activeLessons.ts` → `immunity_cooperation` (sélection → activation → amplification → effecteurs) · `mindMapData.ts` → branche unitId 4 · `microRemediations.ts` → `role_interleukine`, `lt4_chef_orchestre`, `humoral_vs_cellulaire` · 3 exercices BAC (2019 échappement tumoral, 2023 LTc, 2023 perforine) |

### 3. المثبطات الإنزيمية — Unité 3
| | |
|---|---|
| ✅ Existe | 28 QCM, 10 exercices, 5 résumés, 8 remédiations « enzymes » au sens large |
| ❌ Manque | Leçon active quasi inexistante (2 occurrences) · **aucune remédiation sur compétitif/non compétitif** · aucune carte mentale unité 3 sur l'inhibition · **aucun atelier de lecture de graphe Vmax/Km** |
| 🔧 À créer | `activeLessons.ts` → `enzyme_inhibition` · `microRemediations.ts` → `inhib_competitif_vs_non`, `lire_vmax_km` · atelier « 6 courbes » dans `documentAnalysisExercises.ts` · comparatif visuel |

### 4. CMH + الزمر الدموية ABO/Rh — Unité 4
| | |
|---|---|
| ✅ Existe | **La notion la mieux couverte de l'app** : 27 en leçon active, 136 en exercices, 135 dans le tuteur, 49 QCM, 1 remédiation |
| ❌ Manque | **Le prérequis génétique de 2AS (0 partout)** · carte mentale unité 4 |
| 🔧 À créer | Module `prerequis2AS_genetique` (15 min : allèle, codominance, haplotype) + **déclenchement automatique** sur échec aux items CMH/ABO/Rh · 8 QCM de diagnostic d'entrée |
| 💡 Note | C'est l'action au meilleur rapport effort/impact : le contenu aval existe déjà, il suffit de poser le filet en amont |

### 5. المرحلة الكيموضوئية — Unité 6
| | |
|---|---|
| ✅ Existe | 7 en leçon active, 6 résumés, 41 exercices, 12 QCM, routes de concepts (`photosynthese`, `photosynthese_cycle`) |
| ❌ Manque | **La synthèse d'unité** (celle qui n'existe nulle part ailleurs non plus) · micro-remédiations spécifiques (1 seule, générique) · carte mentale · animation de la chaîne photosynthétique · quasi rien dans le tuteur (3) |
| 🔧 À créer | `lessonGoldSummaries.ts` → synthèse U6 · 5 micro-fiches dans `activeLessons.ts` · `microRemediations.ts` → `psii_vs_psi`, `photolyse_source_electrons`, `gradient_protons_atp` · `ScienceAnimations.tsx` → `photochemical-chain` · enrichir `tutorKnowledge.ts` |

---

## Backlog implémentable (ordonné)

| # | Fichier | Clé / objet à ajouter | Type | Effort |
|---|---|---|---|---|
| ~~1~~ ✅ | `src/data/activeLessons.ts` + `quizCorpus.ts` | `prerequis2AS_genetique` (+8 QCM de diagnostic) | contenu | S |
| ~~2~~ ✅ | `src/data/microRemediations.ts` | `role_interleukine`, `lt4_chef_orchestre`, `humoral_vs_cellulaire` | contenu | S |
| ~~3~~ ✅ | `src/data/activeLessons.ts` | `immunity_cooperation` (4 étapes) | contenu | M |
| ~~4~~ ✅ | `src/data/mindMapData.ts` | branche coopération de la carte immunitaire (voir correction ci-dessous) | contenu | M |
| 5 | `src/data/activeLessons.ts` + `resumesLecons.ts` | `amino_acid_behavior` (4 micro-fiches) | contenu | M |
| 6 | `src/components/ScienceAnimations.tsx` | `electrophoresis-sim` (curseur pH → charge → migration) | **code** | L |
| 7 | `src/data/microRemediations.ts` | `inhib_competitif_vs_non`, `lire_vmax_km` | contenu | S |
| 8 | `src/data/documentAnalysisExercises.ts` | atelier « 6 courbes » cinétique enzymatique | contenu | M |
| 9 | `src/data/lessonGoldSummaries.ts` | synthèse d'unité U6 (inédite) | contenu | M |
| 10 | `src/data/activeLessons.ts` | 5 micro-fiches phase photochimique | contenu | L |
| 11 | `src/components/ScienceAnimations.tsx` | `photochemical-chain` | **code** | L |

**Lecture** : 9 éléments sur 11 sont du **contenu de données** (ajouts dans des fichiers `.ts` déjà structurés), seuls 2 demandent du développement de composant. L'architecture de l'app est prête — c'est le contenu qui manque, pas la plomberie.

---

## Limites de l'audit
- Audit **lexical** (comptage d'occurrences de mots-clés) : une notion peut être traitée avec un vocabulaire différent de celui recherché. Les ❌ ont été vérifiés manuellement, les ✅ ne garantissent pas la qualité pédagogique du contenu existant.
- Le volume de contenu (`lessonIndex.ts` 648 Ko, `okacha*.ts` 740 Ko) n'a pas été relu intégralement.
- Aucun test d'usage réel (pas de données de progression élèves dans ce dépôt).

---

## Journal d'implémentation

### Sprint 1 — livré (2026-09-27)

**Item 1 — module « تذكير بالمكتسبات القبلية » (génétique 2AS, unité 4, ≈ 15 min)**
- `src/data/activeLessons.ts` : leçon active `prerequis2AS_genetique`, 4 blocs —
  texte à trous (مورثة / أليل / نمط وراثي / نمط ظاهري / تساوي السيادة) avec 6 popups et micro-test,
  `COMPARISON_TABLE` ABO ↔ HLA (4 critères), `SEQUENCE_ORDER` du raisonnement de greffe (5 étapes),
  production libre « توأمان حقيقيان / أخوان ».
- `LESSON_PROGRESSION` : `prerequis2AS_genetique → immunity_self_nonself` (réflexe `compare`).
- `src/data/unitLessonSequences.ts` : placée **en tête de l'unité 4** → visible comme premier درس نشيط de la مناعة.
- Câblage complet : `conceptRoutes.ts` (`genetique_prerequis`, unitId 4, doc `cmh_transplant_compatibility`),
  `lessonGoldSummaries.ts`, `resumesLecons.ts` + `CHAPITRES_ANCRAGE` [14, 23] (ancrage livre vérifié),
  `lessonIndexBuilder.ts` (unité 4) et `lessonIndex.ts` régénéré (`npx tsx scripts/build_lesson_index.ts`).
- `src/quizCorpus.ts` : **8 QCM de diagnostic** ids 509-516, unitId 4 (allèle, codominance A//B,
  localisation HLA, ABO ≠ compatibilité de greffe, haplotype, vrais jumeaux, génotype/phénotype, groupe [O]).
  Ils alimentent aussi 8 flashcards dérivées.

**Item 2 — 3 micro-reprises de coopération immunitaire**
- `role_interleukine` (IL2 = messager d'activation, pas un anticorps), `lt4_chef_orchestre`
  (LT4 coordonne, LTc tue via perforine), `humoral_vs_cellulaire` (transfert par sérum vs par cellules).

**Verrous** : nouveau fichier `src/data/prerequis2AS.lock.test.ts` (14 tests). Compteurs figés mis à jour
de façon explicite : résumés 44 → 45, flashcards 511 → 519 / dérivées 508 → 516, leçons actives affichées 6 → 7,
séquence officielle 53 → 54 clés (12 nulls documentés). Suite complète : 1193 tests verts, `tsc --noEmit` propre
(seuls restent les 4 échecs pré-existants de `lazyRouteChunks.smoke.test.ts`, qui exigent un `npm run build`).

**Reste du backlog** : items 3 à 11 (coopération `immunity_cooperation`, branche mindMap U4,
comportement des acides aminés + simulateur d'électrophorèse, inhibiteurs, atelier 6 courbes, synthèse U6).

### Sprint 2 — livré (2026-09-27)

**Item 3 — leçon de synthèse `immunity_cooperation` (clôture de l'unité 4)**
- `SEQUENCE_ORDER` : schéma-bilan en **6 étapes** — تبلعم ⇐ عرض مع CMH-II ⇐ انتقاء وتنشيط LT4 ⇐ إفراز الإنترلوكين 2 ⇐ تكاثر نسيلي وتمايز LB/LT8 ⇐ منفِّذات + خلايا ذاكرة.
- `GUIDED_DOC_QA` : **3 exercices type BAC** sur l'expérience des 3 milieux de culture
  (LB + Ag seuls / + LT4 / + IL2) — analyse, rôle exact de l'interleukine, cas du SIDA.
- `COMPARISON_TABLE` humorale ↔ cellulaire sur 4 critères dont le critère décisif **« transfert par sérum vs par cellules »**.
- `TEXT_AND_PRODUCE` : rédaction du texte scientifique de synthèse (4-6 lignes).
- Câblage : progression `immunity_memory_response → immunity_cooperation` (fin de chaîne),
  dernière leçon affichée de l'unité 4, route conceptuelle `immunity_cooperation` (doc `lt_target_cell_response`),
  résumé d'or, résumé ancré au livre (ch. **21 et 22**), index tuteur régénéré.

**Item 4 — carte mentale : correction d'un constat de l'audit**
L'audit annonçait « aucune carte mentale au-delà de l'unité 3 ». C'était une lecture erronée :
`MIND_MAPS_DATABASE` utilise **sa propre numérotation à 3 cartes** (1 synthèse des protéines,
2 structure/fonction, 3 **immunité**) — l'immunité était donc déjà couverte, mais avec 8 nœuds seulement.
Corrigé en enrichissant cette carte : **+7 nœuds** (CPA, مشبك مناعي/تعرف مزدوج, الإنترلوكين 2,
الانتقاء والتكاثر النسيلي, الخلية البلازمية, LTc, خلايا الذاكرة) et **+11 liens**, soit **15 nœuds**
avec résumé + astuce BAC + mots-clés chacun. Le badge de l'écran carte mentale a été mis à jour.
Il reste vrai qu'aucune carte n'existe pour les unités 5 à 11 du programme.

**Verrous** : `src/data/immunityCooperation.lock.test.ts` (9 tests, dont « aucun lien mort » dans la carte).
Compteurs figés mis à jour : résumés 45 → 46, leçons actives affichées 7 → 8, séquence officielle 54 → 55 clés.
Suite complète : **1202 tests verts**, `tsc --noEmit` propre (4 échecs pré-existants de `lazyRouteChunks.smoke.test.ts`, qui exigent `npm run build`).

**Reste du backlog** : items 5 à 11 (comportement des acides aminés + simulateur d'électrophorèse,
inhibiteurs enzymatiques, atelier 6 courbes, synthèse U6 et micro-fiches de la phase photochimique).

---

## Mise à jour — sources YouTube complémentaires (2026-09-27)

L'audit reposait sur une seule chaîne. Trois chaînes indépendantes ont été relevées pour le vérifier :
**@Profchaouch**, **@Prof_benotmane**, **@ikramscience8424**. Détail, tableaux et méthode :
**[ANALYSE_CHAINES_YT_COMPLEMENTAIRES.md](./ANALYSE_CHAINES_YT_COMPLEMENTAIRES.md)** ·
données brutes `data/youtube_multichaines_catalog.json` et `data/youtube_ikram_catalog.json`.

### Ce qui est confirmé

- **U4 reste la priorité n° 1, sans ambiguïté.** Série « من الألف إلى الياء » de Chaouch (une vidéo par unité, format
  identique) : U4 = 8 h 26 et **1,30 M de vues en 8 mois, soit 162,5 K/mois**, devant U1 (109,1 K/mois). Playlist U4
  historique de la même chaîne : **4 060 849 vues**. Benotmane : **798 098 vues** sur 15 capsules. Ikram : 33,7 % de
  ses vues.
- **Priorité 2 (coopération) — validée par trois chaînes.** Chaouch consacre 4 parties à
  « تحفيز الخلايا اللمفاوية » (**616 K**) ; Benotmane en fait une capsule « مخطط شامل لأدوار الخلايا المناعية »
  (17:52, **124 K**), soit **plus que chacune des deux phases d'exécution prises séparément** (75 K et 70 K) et presque
  autant que les deux réunies. Le livrable attendu est bien **un schéma global des rôles** — ce qu'a produit le sprint 2.
- **Priorité 4 (CMH / ABO-Rh) — validée.** Benotmane isole **CMH (12:04, 153 K)** et **Rh (8:38, 119 K)** en capsules
  autonomes de ~10 min : même granularité que le module `prerequis2AS_genetique` du sprint 1.
- **Priorité 3 (pHi) — valeur relevée.** **Aucune des quatre chaînes** ne propose de vidéo dédiée au pHi, alors que
  c'est la 2ᵉ notion la plus difficile du corpus. L'application peut devenir la ressource de référence sur ce point :
  les items 5 et 6 du backlog gagnent en valeur, pas seulement en urgence.
- **Aucune chaîne ne propose d'interactif corrigé** (simulateur, atelier de courbes, remédiation déclenchée par
  l'erreur). Les items 6, 8 et 11 ne dupliquent donc rien de l'offre existante.

### Ce qui est corrigé

- **Le Domaine 2 n'est pas « délaissé par les élèves », il est publié tard.** L'analyse initiale concluait
  « U6 + U7 < 7 % des vues pour 39 % du BAC ». Corrigé de l'ancienneté des vidéos, **U7 (التنفس) remonte au 3ᵉ rang
  avec 106,8 K vues/mois**, devant U5, U2 et U3 ; U6 reste le point bas de la biologie (63,8 K/mois).
  ➜ la priorité 5 est maintenue **mais élargie à U7** : l'item 9 (synthèse d'unité) doit couvrir U6 **et** U7.
- **Demande ≠ difficulté, confirmé chiffres en main.** U2 (51,3 K/mois) et U3 (41,2 K/mois) ferment la marche des
  vues alors qu'elles concentrent les notions les plus difficiles. Les élèves n'y cherchent pas un cours complet mais
  une réponse ciblée ➜ pour ces deux unités, **micro-fiches et simulateurs, pas de « cours de A à Z »**.

### Nouveau manque prioritaire — item 3 bis

**فقدان المناعة المكتسبة (VIH / SIDA) n'a aucune leçon dans l'application.**

| | Chaouch | Benotmane | Ikram | Application |
|---|---|---|---|---|
| Traitement | 3 parties, **414 K vues** | 3 capsules, 1 h 12, **280 K vues** | 1 vidéo dédiée | — |
| Leçon active | — | — | — | **0** |
| Résumé / gold summary | — | — | — | **0 / 0** |
| Micro-remédiation | — | — | — | **0** |
| QCM | — | — | — | 19 (dispersés) |

Trois chaînes sur quatre en font un **chapitre complet** (≈ 700 K vues cumulées), c'est le chapitre 23 du livre, et
c'est aussi l'application naturelle de la coopération cellulaire livrée au sprint 2 (destruction des LT4 ⇒ effondrement
de toute la chaîne). ➜ **inséré au backlog en position 3 bis**, juste après les sprints déjà livrés.

### Backlog — ajouts et repositionnements

| # | Item | Taille | Origine |
|---|---|---|---|
| **3 bis** | Leçon `immunity_hiv_aids` : bnية du VIH, cellules cibles, 3 phases de l'infection, **lecture du graphe LT4 / charge virale**, 2 exercices BAC, micro-remédiation « pourquoi la chute des LT4 paralyse les deux réponses » | M | Chaouch 414 K, Benotmane 280 K |
| 5–11 | inchangés (`amino_acid_behavior`, `electrophoresis-sim`, inhibiteurs, atelier 6 courbes, synthèse U6, micro-fiches, `photochemical-chain`) | — | — |
| 9 | **élargi à U7** : la synthèse d'unité doit couvrir U6 *et* U7 | M | U7 = 106,8 K vues/mois |
| 12 | Banque « أفكار التمارين » indexée par session BAC 2019 → 2025 | M | Ikram (4 vidéos, 214 K) ; grep dans l'app = 0 |
| 13 | ~~Module VIH comme application de la coopération~~ → fusionné dans **3 bis** | — | — |
| 14 | Mode « révision globale » d'une unité en une session | M | mégavidéos Chaouch (U4 : 8 h 26, 1,3 M) et Benotmane (4 h 27, 459 K) |
| 15 | Capsules « فكرة في دقيقة » : micro-fiches calibrées **1–2 min** (les micro-remédiations actuelles visent 2–4 min) | S | Benotmane, playlist de 8 vidéos |

### Ce qui n'a pas bougé

Les cinq constats initiaux restent valables, y compris le trou total sur le pHi et l'absence de simulation.
La géologie (U9-U11) reste justifiée : Chaouch y maintient deux playlists de cours (11 + 16 vidéos) et une série
d'exercices. Aucune des trois chaînes n'a révélé de manque immunitaire autre que le VIH/SIDA (vérification par grep sur
السيدا, الطفرة, اللقاح, التلقيح, المكتسبات القبلية : tous déjà présents).

### Sprint 3 — livré (2026-09-27)

**Item 5 — leçon active `amino_acid_behavior` (ouverture de l'unité 2)**
Le constat n°1 de l'audit (« pHi = 0 occurrence dans toute l'application ») est levé. La leçon est ancrée
sur l'activité du **chapitre 8 du livre officiel** (« سلوك الأحماض الأمينية في الوسط » : électrophorèse de
l'alanine à pH 2, 6 et 12), et non sur un contenu inventé.

- `GUIDED_DOC_QA` — la démarche du livre en 3 questions : **حلل** les trois migrations ⇒ **فسر** la charge
  dans chaque milieu ⇒ **استنتج** la règle générale (`pH < pHi` ⟵ positif, `pH > pHi` ⟵ négatif).
- `SEQUENCE_ORDER` — **méthode BAC en 5 étapes** : lire le pH du tampon ⇒ relever le pHi ⇒ comparer ⇒
  déduire la charge ⇒ déduire l'électrode. Une seule comparaison à retenir au lieu de trois cas à mémoriser.
- `COMPARISON_TABLE` — `pH < pHi` ↔ `pH > pHi` sur 4 critères : charge nette, état des deux groupements
  (NH₃⁺ / COO⁻), **sens de migration** (المهبط / المصعد), exemple chiffré de l'alanine.
- `TEXT_AND_PRODUCE` — séparation d'un mélange Glu (pHi 3,2) / Ala (6) / Lys (9,7) à pH 6 : le cas de
  séparation effectivement posé au BAC.

**Câblage** : tête de séquence de l'unité 2, progression vers `protein_structure_function`, route conceptuelle
`amino_acid_behavior` vers un **nouveau document vivant** `amino_acid_electrophoresis` (statut
`manuel_officiel_verifie`), résumé ancré au ch. 8, résumé d'or, **4 rappels espacés** J+1 → J+14,
index tuteur régénéré (466 → **475 chunks**).

**Remédiation et évaluation** : 2 micro-remédiations — `mr_phi_charge_regle` (règle inversée) et
`mr_sens_migration_electrode` (confusion des pôles, et lecture d'une bande immobile) — et **8 QCM (517-524)**
sur l'unité 2 : règle pH/pHi, sens de migration, bande immobile, caractère amphotère, séparation d'un mélange,
forme dipolaire au pHi, données indispensables, cas d'un dipeptide.

**Verrou** : `src/data/aminoAcidBehavior.lock.test.ts` (14 tests, dont un qui vérifie explicitement que
« pHi » n'est plus absent de l'app). Compteurs figés mis à jour : résumés 46 → **47**, leçons actives affichées
8 → **9**, séquence officielle 55 → **56** clés (42 mappées, 14 nulls documentés), flashcards 519 → **527**.
Suite complète : **1217 tests verts**, `tsc --noEmit` propre (les 4 échecs de `lazyRouteChunks.smoke.test.ts`
restent pré-existants : ils exigent `npm run build`).

**Reste du backlog** : 3 bis (VIH/SIDA), 6 (simulateur d'électrophorèse interactif), 7-8 (inhibiteurs
enzymatiques + atelier 6 courbes), 9-11 (synthèse U6/U7, micro-fiches photochimique), 12-15 (banque par session,
mode révision globale, capsules 1 min).

---

## Mise à jour 2 — @MostafaBdd : la demande porte autant sur le format que sur la leçon (2026-09-27)

Cinquième chaîne auditée : **@MostafaBdd** (8 playlists, dont une banque de **121 exercices corrigés**).
Elle est construite non pas autour du cours mais autour de la **carte mentale** et de l'**exercice discuté** —
c'est-à-dire autour des supports que cette application peut réellement produire.
Détail : [ANALYSE_CHAINES_YT_COMPLEMENTAIRES.md § 6](./ANALYSE_CHAINES_YT_COMPLEMENTAIRES.md).

### Le résultat central

| Unité | Cours complet | Carte mentale | Rapport | Exercices corrigés |
|---|---|---|---|---|
| U2 | 3 h 05 — 87 K | 20:50 — **568 K** | **× 6,5** | **393 K** |
| U3 | 3 h 29 — 73 K | 31:32 — **565 K** | **× 7,7** | 218 K |
| U4 | 6 h 47 — 368 K | 47:35 — **710 K** | **× 1,9** | 525 K |

À contenu identique, la **synthèse visuelle de 20-30 min est consommée 6 à 8 fois plus que le cours**, et les
corrections d'exercices dépassent le cours dans les trois unités. U2 et U3 — les deux unités les moins demandées
quand on mesure par unité (§ 1) — produisent ici deux des trois vidéos les plus vues de la chaîne : **ce n'est pas
l'unité qui crée la demande, c'est le format.**

### Effet sur les 5 priorités

- **Priorité 3 (pHi / acides aminés) — la demande est désormais démontrée, et le sprint 3 est incomplet.**
  Le constat « aucune chaîne ne traite le pHi » est **corrigé** : la capsule
  « **كيف نكتب صيغة الحمض الأميني بطريقة صحيحة ؟** » (12:30) totalise **151 K vues**, plus que le cours entier de
  l'unité 2 (87 K). Mais elle traite le geste que `amino_acid_behavior` ne couvre pas encore : **écrire la forme
  ionisée du AA aux trois pH**, là où la leçon livrée s'arrête à en déduire la charge et le sens de migration.
  ➜ nouvel item **5 bis**.
- **Priorité 2 (coopération) et 4 (CMH/ABO-Rh)** : confirmées une cinquième fois (carte mentale U4 = 710 K,
  cours U4 = 368 K, corrections = 525 K). La capsule **« كيف نفرق بين الخلطية و الخلوية ؟ » dure 2 min 11 pour
  77 K vues** : le comparatif livré au sprint 2 doit exister aussi en version **ultra-courte autonome**.
- **Priorité 5 (photochimique)** : la chaîne propose « **كيف أحفظ حلقة كالفن ؟** » en 4 min — le format exact des
  micro-fiches de l'item 10, sur la notion exacte de l'item 11.
- **Priorité 1 (inhibiteurs, U3)** : aucune capsule dédiée ici non plus, mais la carte mentale U3 (565 K) et les
  « أفكار تمارين الإنزيمات » (148 K) montrent que l'entrée attendue sur cette unité est **synthétique et typologique**,
  pas un cours de plus.

### Nouveaux items de backlog

| # | Item | Taille | Preuve |
|---|---|---|---|
| **5 bis** | Bloc « écrire la forme ionisée du AA aux pH 2 / pHi / 12 » dans `amino_acid_behavior` (production guidée de la formule développée, pas seulement la charge) | S | capsule 12:30 — **151 K** |
| **16** | **Cartes mentales pour toutes les unités** : l'app n'en a que 3 (U1 : 15 nœuds, **U2 : 8 nœuds**, U4 : 15) pour 11 unités ; commencer par **U3 et U6**, et étoffer U2 | L | rapports × 6,5 à × 7,7 |
| **17** | Mode **« reproduire le schéma de mémoire »** : liste fermée des schémas exigibles par unité, avec autocorrection par zones | M | « جميع الرسومات التخطيطية التي يجب حفظها » 58:58 — 76 K |
| **18** | **Indexer les exercices par situation** (antibiotique, progéria, cancer du sein, drépanocytose…) en plus de l'unité et du concept | S | banque de 121 exercices nommés par situation — 350 K |
| **19** | Carte **« ماذا سندرس في هذه الوحدة ؟ »** en ouverture de chaque unité (contenu, ordre, ce qui tombe au BAC) | S | 15:44 — 79 K |
| 15 (révisé) | Micro-capsules calibrées **1-2 min** — cible confirmée par « كيف نفرق بين الخلطية والخلوية » (2:11) et « أهم خطوة بعد حل التمارين » (1:00) | S | 77 K / 15 K |

### Lecture d'ensemble après 5 chaînes

Les cinq priorités de contenu ne bougent pas. Ce qui change est l'**ordre des supports** à produire pour chacune :
**carte mentale → exercices corrigés indexés par situation → micro-capsule « comment faire » → cours**.
L'application a construit l'inverse (leçon active d'abord) ; les items 16 à 19 rééquilibrent sans rien jeter,
puisque les leçons livrées aux sprints 1-3 fournissent précisément la matière de ces synthèses.

### Sprint 4 — livré (2026-09-27)

Deux items issus de l'audit de @MostafaBdd.

**Item 5 bis — écrire la forme ionisée du AA (complément du sprint 3)**
La leçon `amino_acid_behavior` passe de 4 à **5 blocs**. Le nouveau bloc (remplissage à trous, 4 trous) fait
**écrire** ce que l'élève savait seulement déduire : NH₃⁺ / COOH en milieu acide, **le zwitterion NH₃⁺ + COO⁻ au pHi**,
NH₂ / COO⁻ en milieu basique — avec définitions cliquables des quatre formes et un micro-test dont l'indice corrige
l'erreur classique (« au pHi les charges disparaissent »). C'est précisément le geste de la capsule la plus vue de
l'unité 2 chez @MostafaBdd (12:30, 151 K vues). Index tuteur régénéré : 475 → **477 chunks**.

**Item 16 (1ʳᵉ tranche) — carte mentale de l'unité 3 (النشاط الإنزيمي)**
L'application n'avait **3 cartes mentales pour 11 unités** et aucune pour les enzymes, alors que la carte mentale
U3 de @MostafaBdd totalise **565 K vues contre 73 K pour son cours**. Nouvelle carte de **12 nœuds / 19 liens** :
nature protéique ⇒ site actif (fixation + catalyse) ⇒ double spécificité ⇒ complexe ES ⇒ courbe substrat/Vmax ⇒ Km,
plus les trois conditions (température, pH) et surtout le **couple inhibiteur compétitif / non compétitif** avec son
nœud de lecture de courbes : *Vmax inchangée + Km augmenté* ↔ *Vmax abaissée, effet non levé par l'excès de substrat*.
Chaque nœud porte résumé, astuce BAC et mots-clés. Onglet ajouté dans l'écran carte mentale (libellé de la carte
immunitaire corrigé au passage : « الوحدة 4 » et non « الوحدة 3 »).

Cette carte adresse directement la **priorité 1 du plan** (inhibiteurs enzymatiques), dont l'audit relevait
« ❌ 0 carte mentale, ⚠️ 2 leçons, ⚠️ 1 micro-remédiation ».

**Verrou** : `src/data/enzymeMindMap.lock.test.ts` (8 tests : 12 nœuds documentés, comparatif Vmax/Km présent,
3 courbes exigibles, aucun lien mort, aucun nœud orphelin, aucune collision d'identifiants avec la carte immunitaire),
et `aminoAcidBehavior.lock.test.ts` porté à **15 tests**. Suite complète : **1226 tests verts**, `tsc --noEmit` propre
(4 échecs pré-existants de `lazyRouteChunks.smoke.test.ts`).

**Reste du backlog** : 3 bis (VIH/SIDA), 6 (simulateur d'électrophorèse), 7-8 (leçon inhibiteurs + atelier 6 courbes,
désormais adossés à la carte U3), 9-11 (synthèse U6/U7, micro-fiches photochimique), 12-15, 16 (cartes U5-U11 et
étoffement de U2, qui n'a que 8 nœuds), 17-19.

---

## Sprint 5 — livré (2026-09-27)

**Périmètre : items 7 et 8 du backlog — priorité n°1 « المثبطات الإنزيمية » (unité 3).**
La matrice d'audit donnait pour cette notion : leçon ⚠️2, micro-remédiation ⚠️1,
carte mentale ❌ (livrée au sprint 4), simulation ❌.

### Ce qui a été produit

| Livrable | Détail |
|---|---|
| Leçon active `enzyme_inhibitors` | 5 blocs : `GUIDED_DOC_QA` (3 courbes : témoin / A / B) → `COMPARISON_TABLE` (5 critères) → `SEQUENCE_ORDER` (méthode de lecture en 5 étapes) → `GUIDED_DOC_QA` **atelier des 6 courbes** → `TEXT_AND_PRODUCE` (production BAC sur une situation pharmacologique) |
| 2 figures SVG tracées à la main | `schema_87_enzyme_inhibition_curves_ar.svg` (V = f([S]) témoin + compétitif + non compétitif, repères Vmax, Vmax/2, Km — courbes calculées par l'équation de Michaelis, pas dessinées à l'œil) et `schema_88_enzyme_six_curves_workshop_ar.svg` (grille de 6 mini-graphes). Déclarées dans `manifest.json` (130 assets) |
| Micro-remédiations (item 7) | `inhib_competitif_vs_non` (3 min) et `lire_vmax_km` (3 min) |
| Rappels espacés | 4 étapes (0→3) sur le concept `enzyme_inhibitors` |
| Résumé + résumé d'or | 6 points, terme BAC « المثبط التنافسي / اللاتنافسي (Vmax و Km) » |
| QCM | **525 → 529** (5 questions unité 3 : type de mثبط ×2, lecture de Km, نفاد الركيزة vs تشبع, effet du pH) |
| Ancrage livre | **ancre documentée [10, 12]** — seul le ch. 12 a un corps OCR exploitable (`الموقع الفعال` ×5, `نشاط الإنزيم` ×22, `سرعة` ×11) ; aucune en-tête OCR ne porte le mot مثبط, d'où l'ancre explicite plutôt qu'un appariement automatique |
| Verrous | `src/data/enzymeInhibitors.lock.test.ts` — **17 tests** |

### Le parti pris pédagogique

Le critère de décision est rendu **unique et répétable** : on lit **Vmax d'abord**,
**Km ensuite**, toujours **par rapport au témoin**. Ce couple apparaît dans chacun
des six supports (leçon, tableau, méthode, résumé, micro-remédiations, rappels).

L'atelier des 6 courbes traite le vrai point de perte : l'élève sait réciter la
définition mais confond les vignettes. Les six graphes séparent **trois causes
distinctes d'un palier** — saturation des sites (courbes 1, 4, 5), destruction de
la structure (2, 3) et **épuisement du substrat** (6, où l'abscisse est le temps).
La confusion « saturation / épuisement » est l'erreur la plus coûteuse au corrigé.

### Compteurs après sprint 5

résumés **48** · leçons actives **10** · séquence **57** clés (43 mappées, 14 nulls,
**4 ancres documentées**) · flashcards **532 / 529** · index tuteur **489 chunks**
(355 html / 134 actives) · suite complète **1244 verts / 4 skipped** (les 4 échecs
`lazyRouteChunks.smoke` restent pré-existants : ils exigent un `dist/` construit).

### Reste au backlog

3 bis `immunity_hiv_aids` · 6 `electrophoresis-sim` · 9 synthèse U6+U7 ·
10 micro-fiches phase photochimique · 11 `photochemical-chain` · 12 banque
« أفكار التمارين » · 14 révision globale · 15 capsules 1-2 min · 16 (suite)
cartes mentales U5-U11 · 17 « reproduire le schéma de mémoire » · 18 exercices
indexés par situation · 19 carte d'ouverture d'unité.
