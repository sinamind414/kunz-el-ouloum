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

---

## Sprint 6 — livré (2026-09-27)

**Périmètre : item 3 bis — dossier VIH / السيدا (unité 4).**
C'était le plus gros écart offre/demande du corpus : **~700 K vues cumulées sur le
VIH chez trois chaînes concurrentes** (Profchaouch 414 K, Benotmane ج13-15 280 K,
Ketfi) contre **4 QCM réellement dédiés** dans l'app (151, 153, 159, 160).

### Ce qui a été produit

| Livrable | Détail |
|---|---|
| Leçon active `immunity_hiv_aids` | 5 blocs : `GUIDED_DOC_QA` (3 courbes, 3 phases) → `SEQUENCE_ORDER` (cycle viral en 6 étapes) → `COMPARISON_TABLE` (séropositif vs malade) → `GUIDED_DOC_QA` (diagnostic ELISA / Western blot / PCR) → `TEXT_AND_PRODUCE` |
| 2 figures SVG tracées | `schema_89_vih_evolution_curves_ar.svg` (charge virale, LT4 et anticorps sur les 3 phases, avec séroconversion et seuil 200/mm³) et `schema_90_vih_cycle_lt4_ar.svg` (cycle en 6 étapes dans le LT4) |
| Document d'entraînement | `vih_evolution_courbes` dans `documentPracticeContexts.ts` (4 indices attendus, piège explicite) |
| Micro-remédiations | `seropositif_vs_sida` et `charge_virale_vs_lt4` (3 min chacune) |
| Rappels espacés | 4 étapes (0→3) |
| QCM | **530 → 539**, dix questions unité 4 : gp120/CD4, rétrovirus, séroconversion, séropositif ≠ SIDA, seuil 200, rôle activateur de LT4, ELISA, fenêtre sérologique, échec vaccinal, multithérapie |
| Ancrage livre | **ancre documentée [22, 23]** — le ch. 23 « سبب فقدان المناعة المكتسبة » contient bien, malgré un OCR dégradé, gp120/CD4, gp41, الاستنساخ العكسي, ADN مدمج, le seuil des 200 LT4/mm³, ELISA, Western blot, PCR et la multithérapie |
| Verrous | `src/data/immunityHivAids.lock.test.ts` — **18 tests** |

### Le parti pris pédagogique

Le dossier n'est pas construit comme un cours de virologie mais autour de **trois
gestes d'examen** :

1. **Lire deux courbes qui bougent en sens inverse** (charge virale ↑ / LT4 ↓) et
   repérer les deux points datables : la séroconversion et le seuil **200/mm³**.
2. **Ne pas confondre موجب المصل et مريض بالسيدا.** Le tableau comparatif force ce
   constat en donnant volontairement **la même réponse dans les deux colonnes** sur
   la contagiosité : séropositif asymptomatique et malade transmettent tous deux.
3. **Comprendre que LT4 est une cellule activatrice, pas exécutrice.** C'est la
   seule explication recevable de l'effondrement *simultané* des immunités humorale
   et cellulaire, et c'est l'objet de la production finale.

Le bloc diagnostic ajoute le piège classique : un ELISA négatif une semaine après
la contamination ne prouve rien, puisque les anticorps ne sont pas encore formés.

### Compteurs après sprint 6

résumés **49** · leçons actives **11** · séquence **58** clés (44 mappées, 14 nulls,
**5 ancres documentées**) · flashcards **542 / 539** · index tuteur **500 chunks**
(355 html / 145 actives) · suite complète **1263 verts / 4 skipped** (les 4 échecs
`lazyRouteChunks.smoke` restent pré-existants).

### Reste au backlog

6 `electrophoresis-sim` · 9 synthèse U6+U7 · 10 micro-fiches phase photochimique ·
11 `photochemical-chain` · 12 banque « أفكار التمارين » · 14 révision globale ·
15 capsules 1-2 min · 16 (suite) cartes mentales U5-U11 · 17 « reproduire le schéma
de mémoire » · 18 exercices indexés par situation · 19 carte d'ouverture d'unité.

---

## Sprint 7 — livré (2026-09-27)

**Périmètre : items 9, 10 et 11 — la phase photochimique (unité 6).**
C'est la notion **n°1 du classement de difficulté (83 points)** et U6+U7 pèsent
**39 %** de l'épreuve. Le diagnostic précis : l'app couvrait bien les **preuves
expérimentales** (Hill/Ruben, Jagendorf, Calvin) mais **pas la chaîne elle-même**.
L'élève savait démontrer d'où vient l'O₂ sans pouvoir suivre un électron.

### Ce qui a été produit

| Livrable | Détail |
|---|---|
| Leçon active `photochemical_chain` | 5 blocs : `GUIDED_DOC_QA` (membrane du thylakoïde) → `SEQUENCE_ORDER` (chaîne en 8 étapes) → `TEXT_AND_PRODUCE` (bilan à trous, item 10) → `COMPARISON_TABLE` (**synthèse U6/U7**, item 9) → `TEXT_AND_PRODUCE` (production BAC sur Jagendorf) |
| 2 figures SVG tracées | `schema_93_photochemical_chain_z_scheme_ar.svg` (PSII, photolyse, chaîne + pompe, PSI, NADP⁺, ATP synthase, avec les deux sens de H⁺) et `schema_94_photophosphorylation_vs_oxydative_ar.svg` (thylakoïde vs crête mitochondriale en vis-à-vis) |
| Document d'entraînement | `photochemical_chain_membrane` |
| Micro-fiches (item 10) | `photolyse_origine_o2`, `gradient_h_direction`, `psii_avant_psi` |
| Rappels espacés | 4 étapes (0→3) |
| QCM | **540 → 549** : 8 sur U6 + **2 sur U7** (l'accepteur final et le principe commun) |
| Ancrage livre | **ancre documentée [33]** — le ch. 33 contient PSII/PSI, l'enzyme de photolyse, la chaîne de transporteurs, `NADP⁺ + 2e⁻ + 2H⁺ → NADPH + H⁺`, la pompe à protons et Mitchell |
| Verrous | `src/data/photochemicalChain.lock.test.ts` — **16 tests** |

### Le parti pris pédagogique

Trois confusions structurent la leçon, et chacune a sa micro-fiche :

1. **« L'O₂ vient du CO₂ »** — non : l'eau est décomposée *pour ses électrons*,
   l'oxygène est un déchet. C'est ce que prouve le marquage de Ruben.
2. **« PSI avant PSII »** — la numérotation est historique, pas chronologique.
   L'électron part de PSII et ne revient jamais à son point de départ.
3. **« La lumière fabrique l'ATP »** — non : la lumière fabrique *le gradient*.
   Les deux sens de H⁺ sont tracés séparément sur la figure (pompage stroma →
   lumen, retour lumen → stroma via l'ATP synthase). C'est exactement ce que
   Jagendorf démontre en produisant de l'ATP dans le noir, et c'est l'objet de la
   production finale.

La **synthèse U6/U7** (item 9) est intégrée comme quatrième bloc plutôt que comme
leçon séparée : le tableau met les deux organites en vis-à-vis et **ne coïncide que
sur une ligne — l'ATP synthase**. C'est cette ligne unique qui porte tout
l'argument chimiosmotique de Mitchell.

### Compteurs après sprint 7

résumés **50** · leçons actives **12** · séquence **59** clés (45 mappées, 14 nulls,
**6 ancres documentées**) · flashcards **552 / 549** · index tuteur **510 chunks**
(355 html / 155 actives) · suite complète **1280 verts / 4 skipped** (toujours les 4
échecs pré-existants `lazyRouteChunks.smoke`).

### État des 5 leçons prioritaires

| Leçon prioritaire | État |
|---|---|
| pHi / acides aminés (U2) | ✅ sprints 3-4 |
| Coopération immunitaire (U4) | ✅ sprint 2 |
| Inhibiteurs enzymatiques (U3) | ✅ sprints 4-5 |
| CMH / ABO-Rh + prérequis 2AS (U4) | ✅ sprint 1 (+ dossier VIH, sprint 6) |
| Phase photochimique (U6) | ✅ sprint 7 |

**Les cinq priorités de l'audit sont désormais traitées.** Ne reste que le backlog
complémentaire : 6 `electrophoresis-sim` (seul livrable « simulation » encore à
zéro) · 12 banque « أفكار التمارين » · 14 révision globale · 15 capsules 1-2 min ·
16 (suite) cartes mentales U5-U11 · 17 « reproduire le schéma de mémoire » ·
18 exercices indexés par situation · 19 carte d'ouverture d'unité.

---

## Sprint 8 — livré (2026-09-27)

**Périmètre : item 6 — le simulateur d'électrophorèse.**
C'était le **seul livrable de type « simulation » encore entièrement à zéro** dans
la matrice d'audit (ligne « Simulation : ❌ partout »), alors que
« سلوك الأحماض الأمينية » est la 2ᵉ notion la plus difficile (73 points) et
qu'**aucune chaîne concurrente ne propose d'interactif** sur le pHi.

### Ce qui a été produit

| Livrable | Détail |
|---|---|
| `src/components/ElectrophoresisSimulator.tsx` | Simulateur interactif pH → charge → sens de migration. 4 molécules (Ala pHi 6, Glu 3.2, Lys 9.7, His 7.6), curseur pH de 1 à 13 par pas de 0,5, bande de migration SVG avec anode et cathode, tache animée dont la course est proportionnelle à \|pH − pHi\| |
| Intégration | Carte mise en avant en tête de `AnimationsView` (onglet الأنميشن العلمي), signalée « محاكاة تفاعلية — الوحدة 2 » |
| Verrous | `src/components/__tests__/ElectrophoresisSimulator.test.tsx` — **11 tests** |

### Le parti pris : prédire avant de voir

Le bouton « شغّل الهجرة » reste **verrouillé tant que l'élève n'a pas prédit** le
sens de migration. Une animation regardée passivement n'enseigne pas la règle ; ici
l'élève s'engage, puis le verdict lui renvoie la comparaison explicite
(« pH du milieu (2,0) est inférieur au pHi (6) donc charge positive donc cathode »),
et un score cumulé s'affiche. Changer de molécule ou de pH annule la manche, pour
qu'on ne puisse pas ajuster sa prédiction après coup.

La **règle physique est isolée dans trois fonctions pures** (`sensMigration`,
`chargeGlobale`, `positionSpot`) testées indépendamment de l'interface : un
refactor visuel ne peut pas corrompre la physique. Les trois vecteurs du livre pour
l'alanine (pH 2 → cathode, pH 6 → immobile, pH 12 → anode) sont figés en test.

### Compteurs après sprint 8

suite complète **1291 verts / 4 skipped** (toujours les 4 échecs pré-existants
`lazyRouteChunks.smoke`, qui exigent un `dist/` construit). Les autres compteurs
sont inchangés depuis le sprint 7 : résumés 50 · leçons actives 12 · flashcards 552
· index tuteur 510 chunks.

### Reste au backlog

12 banque « أفكار التمارين » · 14 révision globale · 15 capsules 1-2 min ·
16 (suite) cartes mentales U5-U11 · 17 « reproduire le schéma de mémoire » ·
18 exercices indexés par situation · 19 carte d'ouverture d'unité.

---

## Sprint 9 — livré (2026-09-27)

**Périmètre : item 16 (suite) — cartes mentales du domaine 2.**
Justification chiffrée : chez **@MostafaBdd**, la carte mentale d'une unité fait
**×6 à ×7 les vues du cours** correspondant (U2 : 568 K contre 87 K ; U3 : 565 K
contre 73 K). L'app n'avait que 4 cartes pour 11 unités, et aucune sur le domaine 2.

### Ce qui a été produit

| Carte | Contenu |
|---|---|
| **U5 الاتصال العصبي** (12 nœuds, 17 liens) | Potentiel de repos → potentiel d'action → codage fréquentiel → synapse → messager chimique → codage chimique → intégration (PPSE/PPSI) → effecteur, plus myéline, réflexe et toxines |
| **U6 التركيب الضوئي** (12 nœuds, 16 liens) | Chloroplaste, pigments, phase photochimique (photolyse, chaîne, gradient) → phase biochimique (3-PGA, trioses), facteurs limitants, et un nœud-pont vers U7 |
| **U7 تحويل الطاقة إلى ATP** (12 nœuds, 16 liens) | ATP, mitochondrie, glycolyse → Krebs → transporteurs → chaîne respiratoire → phosphorylation oxydative → bilan, plus fermentation, application musculaire et pont vers U6 |
| **U2 étoffée** (8 → **13 nœuds**) | Ajout de : classification des acides aminés, électrophorèse, dénaturation, principe structure/fonction, exemples fonctionnels |

Verrous : `src/data/domain2MindMaps.lock.test.ts` — **15 tests** (intégrité du
graphe, documentation de chaque nœud, absence de collision d'identifiants,
présence des pièges d'examen, et **dette explicite** sur U8-U11).

### Un bug de données corrigé au passage

La carte immunitaire (clé 3) déclarait **`unitId: 3`** alors qu'elle porte sur
l'**unité 4** (المناعة). Or `MindMapNodeDetails` utilise `node.unitId` pour lancer
le QCM depuis le panneau de détail : **depuis n'importe quel nœud d'immunologie,
l'élève était envoyé vers le QCM des enzymes.** Les 16 occurrences ont été
corrigées (les identifiants `node-u3-*` sont conservés pour ne pas casser les
verrous existants). Le test de cohérence ajouté interdit désormais à deux cartes
de revendiquer la même unité.

### Compteurs après sprint 9

cartes mentales **7 / 11 unités** (manquent U8, U9, U10, U11) · nœuds documentés
**91** · suite complète **1308 verts / 4 skipped** (toujours les 4 échecs
pré-existants `lazyRouteChunks.smoke`).

### Reste au backlog

12 banque « أفكار التمارين » · 14 révision globale · 15 capsules 1-2 min ·
16 (fin) cartes mentales U8-U11 · 17 « reproduire le schéma de mémoire » ·
18 exercices indexés par situation · 19 carte d'ouverture d'unité.

---

## Sprint 10 — livré (2026-09-27)

**Périmètre : item 18 — banque d'exercices indexée par situation.**

### Le constat qui déclenche ce sprint

La playlist d'exercices la plus fréquentée du BAC SVT algérien (@MostafaBdd :
**121 vidéos / 350 075 vues**) ne nomme jamais ses exercices par notion. Elle les
nomme par **situation concrète** : « المضاد الحيوي » (134 K), « البروجيريا »
(102 K), « سرطان الثدي » (69 K), « المورثة و سلوك الأحماض الأمينية » (21 K).
L'élève cherche *l'exercice du diabétique*, pas *le tableau à double entrée*.

L'app possédait pourtant déjà la matière : **31 contextes documentaires**
(`documentPracticeContexts.ts`) et **19 exercices élite**
(`documentAnalysisExercises.ts`) — mais atteignables uniquement par unité et par
type de document. **Le contenu existait, la porte d'entrée manquait.**

### Ce qui a été produit

`src/data/situationIndex.ts` — **23 situations** qui ré-indexent l'existant
(aucun exercice inventé, aucune donnée dupliquée). Chaque fiche porte :
la scène réelle, la consigne BAC, **ce qui est réellement évalué**, **le piège**
que la situation tend, les unités mobilisées, la difficulté (1-3), la durée, les
mots-clés de recherche (arabe + latin), les `exerciseIds` et la leçon de secours.

Exemples : المضاد الحيوي (U1) · فقر الدم المنجلي (U2) · مريض السكري و دواء
الجانوفيا (U3) · زرع الكلية (U4) · التسمّم بغاز السارين (U5) · تجربة جاغندورف
(U6) · العدّاء و التشنّج العضلي (U7) · زلزال و باطن الأرض (U10).

**Couverture : les 11 unités du programme**, U4 avec 4 situations et U5 avec 3
(les deux plus gros blocs du sujet : 13 % et 16 %).

`src/components/SituationBankView.tsx` — nouvel onglet **« تمارين بالوضعيات »**
(nav secondaire) : recherche instantanée tolérante aux diacritiques et aux
variantes d'alef/ta-marbuta, filtres unité et difficulté cumulables, puis fiche
complète avec les sanads documentaires, les indices, et **la correction masquée
tant que l'élève ne la demande pas**.

### Verrous

- `src/data/situationIndex.lock.test.ts` — **22 tests** : aucune référence morte
  (chaque `exerciseId` existe dans l'une des deux banques, chaque `lessonId` est
  une leçon active), cohérence unité déclarée ↔ unité réelle de l'exercice,
  qualité éditoriale minimale de chaque fiche, couverture des 11 unités, contrat
  du moteur de recherche.
- `src/components/__tests__/SituationBankView.test.tsx` — **9 tests**, dont le
  verrou pédagogique central : *la correction reste masquée par défaut*.

### Compteurs après sprint 10

situations **23** · exercices ré-indexés **≈ 30** · unités couvertes **11/11** ·
suite complète **1339 verts / 4 skipped** (toujours les 4 échecs pré-existants
`lazyRouteChunks.smoke`).

### Reste au backlog

12 banque « أفكار التمارين » · 14 révision globale · 15 capsules 1-2 min ·
16 (fin) cartes mentales U8-U11 · 17 « reproduire le schéma de mémoire » ·
19 carte d'ouverture d'unité.

---

## Sprint 11 — livré (2026-09-27)

**Périmètre : item 15 — capsules « فكرة في دقيقة ».**

### Le trou constaté

L'app proposait deux tailles d'objet : la leçon active (20-40 min) et la
flashcard (5 s). **Entre les deux, rien.** Or c'est exactement la taille qui
performe le mieux chez les chaînes de référence :
- @Prof_benotmane entretient une playlist entière nommée **« فكرة في دقيقة »** ;
- chez @MostafaBdd, la capsule « كيف نكتب صيغة الحمض الأميني بطريقة صحيحة ؟ »
  fait **151 K vues — plus que son cours complet de l'unité 2 (87 K)** ;
- « كيف نفرق بين الخلطية و الخلوية ؟ » règle en **2:11** une confusion qui coûte
  des points chaque année.

### Ce qui a été produit

`src/data/microCapsules.ts` — **24 capsules**, **11/11 unités couvertes**,
au moins 2 capsules pour chacune des unités 1 à 7. Total de la collection :
**~26 minutes**. Chaque capsule respecte un contrat d'écriture strict, vérifié
par les tests :

1. **une seule idée** (2 à 4 phrases, 120-520 caractères) ;
2. le titre **est la question** que l'élève se pose (« المصعد أم المهبط؟ ») ;
3. un **geste mental en 2 à 4 étapes** impératives ;
4. **l'erreur précise que la capsule tue** — sans erreur visée, pas de capsule ;
5. un **auto-test immédiat** avec sa réponse.

Échantillon : كيف أكتب صيغة حمض أميني كتابة صحيحة؟ · المصعد أم المهبط؟ ·
تثبيط تنافسي أم غير تنافسي؟ · كيف أفرّق بين المناعة الخلطية و الخلوية؟ ·
لماذا LT4 هي مفتاح كل شيء؟ · PPSE أم PPSI أم PPM أم كمون عمل؟ ·
كيف أحفظ حلقة كالفن؟ · كيف يُصنع ATP في الظلام؟ · ماذا تُثبت منطقة الظلّ؟

`src/components/MicroCapsulePanel.tsx` — panneau branché **en tête de la vue
المراجعة**, donc là où l'élève vient déjà, et **aligné sur l'unité qu'il a
choisie** (aucun nouvel onglet à apprendre). Capsule du jour tirée de façon
stable sur la journée (même principe que le drill « مصفاة التعليمات »),
navigation précédente/suivante en boucle dans l'unité.

### Verrous

- `src/data/microCapsules.lock.test.ts` — **17 tests**, dont ceux qui protègent
  la **brièveté** : durée 45-120 s, idée ≤ 520 caractères, ≤ 4 étapes,
  collection totale ≤ 30 min. Une capsule qui grossit devient un mini-cours et
  perd sa raison d'être : le test casse avant.
- `src/components/__tests__/MicroCapsulePanel.test.tsx` — **9 tests**, dont le
  verrou pédagogique : la réponse reste masquée, et **changer de capsule la
  remasque** (impossible de survoler les réponses à la file).

### Compteurs après sprint 11

capsules **24** (~26 min) · unités couvertes **11/11** · suite complète
**1365 verts / 4 skipped** (toujours les 4 échecs pré-existants
`lazyRouteChunks.smoke`).

### Reste au backlog

12 banque « أفكار التمارين » · 14 révision globale · 16 (fin) cartes mentales
U8-U11 · 17 « reproduire le schéma de mémoire » · 19 carte d'ouverture d'unité.

---

## Sprint 12 — livré (2026-09-27)

**Périmètre : item 17 — « ارسم من الذاكرة » (reproduire le schéma de mémoire).**

### Le constat

@MostafaBdd consacre **58:58 (76 K vues)** à une seule chose : « جميع الرسومات
التخطيطية التي يجب حفظها ». Le sujet demande presque chaque année « ارسم مخططاً »
ou « أنجز رسماً تخطيطياً », et ces points se perdent **par oubli d'éléments**,
pas par incompréhension.

L'app savait **montrer** 134 schémas. Elle ne savait pas vérifier que l'élève
sait les **refaire**. Ce sprint inverse le sens de lecture.

### Ce qui a été produit

`src/data/schemaDrills.ts` — **17 schémas** couvrant les unités 1 à 11
(3 pour U4, 2 pour U1/U3/U5). Chacun expose la consigne telle qu'elle tombe,
l'**ordre de tracé** (on ne dessine pas au hasard), une **grille cotée**
(éléments à 2 pts = indispensables, à 1 pt = valorisants, total 8-16 points),
et les **pièges** qui coûtent les points — « غوص اللوح القاري تحت المحيطي »,
« ترتيب PSI قبل PSII », « رسم الحويصلات في الجانب بعد المشبكي ».

`src/components/SchemaDrillView.tsx` — nouvel onglet **« ارسم من الذاكرة »**,
en trois phases strictement ordonnées :

1. **الرسم** — consigne + ordre de tracé. **Aucune image dans le DOM.**
2. **التقييم** — l'élève coche ce qu'il a réellement tracé sur sa feuille.
3. **المقارنة** — score sur le barème, **liste nominative des éléments
   essentiels oubliés**, pièges, *puis seulement* l'image officielle.

### Verrous

- `src/data/schemaDrills.lock.test.ts` — **16 tests**. Le premier lit le
  **manifeste réel sur disque** et vérifie que chaque `assetSrc` existe :
  un asset fantôme afficherait une image cassée à l'instant précis où l'élève
  attend sa correction. Sont figés aussi le barème (5-9 éléments, ≥ 3
  indispensables, total 8-16) et le calcul des verdicts.
- `src/components/__tests__/SchemaDrillView.test.tsx` — **13 tests**, dont **le**
  verrou du module : `container.querySelectorAll('img')` doit valoir **0** en
  phase 1 et 2. Si l'image fuit avant l'auto-évaluation, l'exercice de mémoire
  n'en est plus un.

### Dette UI signalée

La navigation secondaire compte désormais **9 entrées** (workshop, mindmap,
methodology, badges, bootcamp, animations, situations, schemas, teacher).
C'est la limite haute. Tout nouvel espace devrait être **regroupé** dans un
hub « التمارين » plutôt qu'ajouté — à arbitrer avant l'item 19.

### Compteurs après sprint 12

schémas à reproduire **17** · unités couvertes **1-11** · suite complète
**1394 verts / 4 skipped** (toujours les 4 échecs pré-existants
`lazyRouteChunks.smoke`).

### Reste au backlog

12 banque « أفكار التمارين » · 14 révision globale · 16 (fin) cartes mentales
U8-U11 · 19 carte d'ouverture d'unité.

---

## Sprint 13 — livré (2026-09-27)

**Périmètre : dette UI du sprint 12 (regroupement de la navigation) + item 19
(carte d'ouverture d'unité).**

### 1. La navigation repasse de 9 entrées à 5

Après les sprints 10 et 12, le menu secondaire comptait **9 entrées** : au-delà
de sept, un menu cesse d'être lu. Les cinq espaces qui servent le même geste —
**s'entraîner** — passent derrière une porte unique.

`src/data/trainingHub.ts` + `src/components/TrainingHubView.tsx` — hub
**« التمارين والتدريب »** regroupant : تمارين بالوضعيات · ارسم من الذاكرة ·
تحدي البكالوريا · الورشة التفاعلية · الأنميشن العلمي. Chaque carte annonce le
**geste travaillé** (« أحلّل سنداً », « أرسم وأقيّم », « أختبر نفسي ») plutôt que
le nom de l'outil. Le retour depuis ces espaces ramène au hub, pas à l'accueil.

Menu secondaire désormais : **التمارين والتدريب · الخرائط الذهنية · المفتاح ·
الأوسمة · لوحة المتابعة** (5 entrées).

Un test lit `App.tsx` et **casse si une entrée regroupée réapparaît dans le
menu** — sans quoi le hub n'aurait rien allégé.

### 2. Item 19 — « ماذا سندرس في هذه الوحدة ؟ »

Format inspiré de la vidéo d'ouverture d'unité de @MostafaBdd (15:44 — 79 K
vues) : aucun cours, seulement de quoi entrer dans l'unité en sachant ce qu'on
cherche.

`src/data/unitOpenings.ts` — **11 cartes, une par unité**, chacune avec :
la **question centrale** à laquelle l'unité répond, la **promesse** formulée en
savoir-FAIRE (« ستكون قادراً على… »), l'**itinéraire** en 3-5 étapes, les
**prérequis 2AS**, les **pièges récurrents**, le **poids mesuré au BAC**, et une
**première action concrète** reliée à une capsule et à un schéma réels.

### 3. Un bug réel corrigé au passage

`UnitIntroPortal` affichait **le contenu de l'unité 1 (activités sur l'ARN)
quelle que soit l'unité ouverte** — un élève entrant par l'unité 7 lisait un
texte sur l'ARN — et chargeait des **photos Unsplash distantes**, donc rien du
tout hors connexion, alors que l'app est conçue pour le mode offline sur 3G.
Le portail est réécrit sur les données réelles de l'unité demandée. Deux tests
interdisent le retour de chacun des deux défauts (contenu identique entre deux
unités ; toute `img` en `http(s)://`).

### Verrous

- `src/data/unitOpenings.lock.test.ts` — **11 tests**, dont : toute capsule et
  tout schéma cités existent **et appartiennent à la même unité** ; les poids
  d'examen ne sont renseignés **que pour les unités mesurées (1-7)** — inventer
  un pourcentage pour U8-U11 serait présenter une fabrication comme une donnée.
- `src/components/__tests__/UnitIntroPortal.test.tsx` — **8 tests**.
- `src/components/__tests__/TrainingHubView.test.tsx` — **9 tests**.

### Compteurs après sprint 13

entrées du menu secondaire **9 → 5** · cartes d'ouverture **11/11 unités** ·
suite complète **1421 verts / 4 skipped** (toujours les 4 échecs pré-existants
`lazyRouteChunks.smoke`).

### Reste au backlog

12 banque « أفكار التمارين » · 14 révision globale · 16 (fin) cartes mentales
U8-U11.

---

## Sprint 14 — livré (2026-09-27)

**Périmètre : item 16 (FIN) — cartes mentales U8, U9, U10, U11.**

La dette inscrite noir sur blanc au sprint 9 (« restent à produire : U8-U11 »,
verrouillée par un test qui l'affirmait) est **soldée**. Les **11 unités du
programme ont désormais leur carte mentale** — le format qui, chez @MostafaBdd,
fait ×6 à ×7 les vues du cours correspondant.

| Carte | Contenu |
|---|---|
| **U8 ما فوق البنية الخلوية** (12 nœuds / 17 liens) | Chloroplaste (thylakoïde, stroma) vs mitochondrie (crêtes, matrice), ATP synthase rattachée **aux deux** organites, échanges gazeux, point de compensation, principe structure/fonction |
| **U9 النشاط التكتوني** (12 / 16) | Types de limites, chaîne causale complète غوص → تميّه → انصهار جزئي → صهارة → براكين, plan de Bénioff, collision, courants de convection |
| **U10 بنية الكرة الأرضية** (12 / 16) | Ondes P et S, zone d'ombre, Moho / Gutenberg / Lehmann, croûte, manteau, noyaux externe et interne |
| **U11 البنيات الجيولوجية** (12 / 17) | Dorsale (basalte en coussins, gabbro, expansion), subduction (andésite, métamorphisme), collision, ophiolite, cycle de Wilson, grille de classement |

Chaque nœud porte son résumé, son conseil BAC et ses mots-clés ; chaque carte
est vérifiée sans lien mort ni nœud orphelin.

### Ce que les tests protègent en plus de la structure

`src/data/domain3MindMaps.lock.test.ts` — **18 tests** qui figent les
**raisonnements**, pas seulement les étiquettes :
- U9 : la chaîne causale complète غوص → تميّه → انصهار → صهارة → براكين doit
  exister lien par lien, et le nœud « انصهار جزئي » doit nommer **le rôle de
  l'eau** (et non la chaleur) ;
- U10 : le lien `s-waves → outer-core` doit être de type **`inhibitory`** —
  c'est l'argument décisif de l'unité, pas une relation ordinaire ;
- U8 : l'ATP synthase doit être reliée **aux deux** organites (unité du
  mécanisme de Mitchell) ;
- U11 : l'andésite doit se définir **par opposition au basalte**.

Le test du sprint 9 qui affirmait la dette a été **retourné en test de
couverture** : il vérifie désormais que les 11 unités sont présentes.

### Compteurs après sprint 14

cartes mentales **11/11 unités** · nœuds documentés **139** · suite complète
**1439 verts / 4 skipped** (toujours les 4 échecs pré-existants
`lazyRouteChunks.smoke`).

### Reste au backlog

12 banque « أفكار التمارين » · 14 révision globale.

---

## Sprint 15 — item 14 : « خطة المراجعة النهائية », le plan de révision jusqu'au jour J

### Le manque

Après quatorze sprints, l'application contenait beaucoup de matière bien
rangée : 24 micro-capsules, 17 schémas à reproduire, 23 situations d'exercices,
11 cartes mentales, 11 cartes d'ouverture. Mais rien ne répondait à la seule
question que se pose un candidat en avril : **« il me reste N jours et H heures
par jour — je fais quoi, aujourd'hui ? »** L'élève devait arbitrer seul entre
sept unités de poids très inégaux, ce qui est précisément la compétence qui lui
manque.

### La réponse : un ordonnanceur, pas du contenu neuf

`src/data/revisionPlan.ts` n'ajoute **aucune leçon**. Il ordonne l'existant sur
le temps disponible, selon quatre règles explicites et vérifiables :

1. **poids d'examen mesuré** — `UNIT_OPENINGS.bacWeightPercent` (U1-U7, somme
   95-105 %), 5 % par défaut pour les unités géologiques U8-U11 ;
2. **bonus de difficulté** issu du classement des notions les plus cherchées sur
   YouTube — `{U6:9, U2:8, U4:7, U5:5, U3:4, U7:4, U1:2}` : la phase
   photochimique et le comportement des acides aminés remontent au-dessus de
   leur seul poids au barème ;
3. **alternance des gestes** — chaque journée enchaîne capsule → schéma →
   situation → carte mentale, jamais quatre tâches du même type à la suite ;
4. **atterrissage** — si le plan dure au moins 4 jours, les **2 derniers jours
   sont en consolidation** : plus aucune situation nouvelle, uniquement capsules,
   schémas et cartes (badge « تثبيت فقط »).

Les unités lourdes reçoivent **plus de minutes**, pas seulement une meilleure
place dans l'ordre : la file de tâches est construite par répétition
proportionnelle à la priorité, étalée par la méthode du plus grand reste, puis
découpée en journées selon le budget quotidien.

### L'écran

`src/components/RevisionPlanView.tsx`, première entrée de l'onglet التدريب
(icône calendrier) :

- deux curseurs — jours restants (1-60) et minutes par jour (20-240) ;
- quatre préréglages : **30 j × 60 min**, **14 j × 90 min**, **7 j × 120 min**,
  **3 j × 120 min** (dernière ligne droite) ;
- le plan jour par jour, chaque tâche avec son type, sa durée et son unité ;
- des **cases à cocher persistées** dans `localStorage`
  (`kunz.revisionPlan.${jours}x${minutes}`) et une barre de progression ;
- un résumé : nombre de tâches, minutes totales, unités couvertes.

### Ce que les tests protègent

`src/data/revisionPlan.lock.test.ts` — **17 tests** : déterminisme strict (deux
appels identiques produisent le même plan), respect du budget quotidien, aucune
journée vide, aucune tâche dupliquée dans une même journée, couverture **11/11
unités** sur un plan de 30 jours, présence obligatoire de **U6** même dans un
plan de 3 jours, et le test qui a coûté deux réécritures du moteur : **les
unités lourdes reçoivent strictement plus de minutes que les unités légères**.

`src/components/__tests__/RevisionPlanView.test.tsx` couvre l'écran : rendu des
préréglages, cochage persistant, remise à zéro de la progression au changement
de préréglage, badge de consolidation.

### Compteurs après sprint 15

capsules 24 · schémas 17 · situations 23 · cartes mentales 11/11 · cartes
d'ouverture 11/11 · suite complète **1466 verts / 4 skipped** (toujours les
4 échecs pré-existants `lazyRouteChunks.smoke`).

### Reste au backlog

**12** banque « أفكار التمارين » indexée par session BAC 2019→2025 — dernier
item ouvert.

---

## Sprint 16 — item 12 : « أفكار التمارين حسب الدورة », ce que l'examen demande vraiment

### Le manque

C'était le dernier item ouvert du backlog, et le plus embarrassant : un grep
des sessions du BAC dans `src/` renvoyait **zéro fichier**. L'application
savait entraîner par unité, par situation, par geste et par notion — mais
n'avait aucune trace de ce qui est **réellement tombé à l'examen**. Or c'est la
première chose qu'un candidat cherche en avril, et la demande est mesurée :
@ikramscience8424 fait **214 K vues avec quatre vidéos** intitulées « أفكار
التمارين » 2019→2025, pour une chaîne qui ne publie presque rien d'autre.

### La collecte : des sujets officiels, pas des souvenirs

Les sujets de l'ONEC republiés par eddirasa.com et dzexams.com ont été lus en
texte, session par session. **35 exercices** sont indexés :

| Session | Exercices dépouillés |
|---|---|
| 2019 | 6 (2 sujets complets) |
| 2021 | 5 — l'exercice 1 du sujet 2 est illisible dans la source |
| 2022 | 6 |
| 2023 | 6 |
| 2024 | 6 |
| 2025 | 6 |

**La session 2020 est absente, et déclarée comme telle** (`MISSING_YEARS`) :
son texte n'était pas récupérable au moment de la collecte. Un test casse si
une idée 2020 apparaît un jour sans source — le trou reste un trou tant qu'il
n'est pas comblé par du réel.

Chaque fiche porte : l'**idée** de l'exercice en une phrase, les **supports
fournis** au candidat (tableaux, Anagène, Patch-clamp, chromatographie…), la
**notion réellement évaluée** derrière l'habillage, les **verbes de consigne**
rencontrés, les unités mobilisées, et des liens vers les situations, capsules
et schémas déjà présents dans l'app. **Aucun énoncé n'est reproduit** : ce
n'est pas une annale de plus, c'est la carte de ce que l'examen demande.

### Ce que la collecte révèle (mesuré, pas supposé)

`unitPressure()` classe les unités par points obtenus **en tant qu'unité
principale** sur les six sessions :

| Unité | Points principaux | Exercices menés | Apparitions totales |
|---|---|---|---|
| **U1 تركيب البروتين** | 55 | 8 | 11 |
| **U4 المناعة** | 49 | 7 | 8 |
| **U5 الاتصال العصبي** | 47 | 7 | 7 |
| **U3 النشاط الإنزيمي** | 37 | 5 | 10 |
| U6 التركيب الضوئي | 22 | 3 | 3 |
| U2 بنية/وظيفة | 10 | 2 | 7 |

Deux enseignements qui contredisent l'intuition de l'élève :

1. **U3 apparaît dans 10 exercices sur 35 mais n'en mène que 5.** L'enzymologie
   est le plus souvent la *clé cachée* d'un exercice d'immunologie, de
   photosynthèse ou de génétique (ML901, Quercétine, 3-NOP, CA1P, NAGA, SOD).
   La négliger coûte des points ailleurs que dans « son » exercice.
2. **U2 est presque toujours seconde** : la relation structure/fonction est
   évaluée *à travers* une autre unité, pas pour elle-même.

Côté consignes, **« حلّل » domine largement (11 occurrences)**, suivi de
« اقترح فرضيتين » (5), « برّر » (5), « بيّن » (5). C'est exactement la
hiérarchie que suppose le correcteur de `correcteurV1.ts`.

### L'écran

`src/components/BacIdeasView.tsx`, deuxième entrée de l'onglet التدريب, juste
après le plan de révision : onglets par session (+ « كل الدورات »), recherche
plein texte tolérante aux hamzas (« البرفورين », « الجينتاميسين », « 2023 »),
bandeau « ما الذي يتكرّر؟ » avec le classement de pression et les verbes les
plus fréquents, barème des deux sujets et lien vers le sujet officiel.

### Ce que les tests protègent

`src/data/bacSessionIndex.lock.test.ts` — **20 tests**, dont :
- le **barème officiel** 5/7/8 selon le rang, et **20 points par sujet** sauf
  pour le sujet explicitement déclaré incomplet ;
- l'absence de session inventée (2020 interdite tant qu'elle n'a pas de source) ;
- une **source URL par session** couverte ;
- **aucune référence morte** vers une situation, une capsule ou un schéma, et
  au moins une porte vers le contenu de l'app par exercice ;
- le **déterminisme** des statistiques (`unitPressure`, `verbFrequency`).

`src/components/__tests__/BacIdeasView.test.tsx` couvre l'écran (9 tests).
Le verrou du hub a été relevé de 6 à 7 cartes, avec le commentaire qui va
avec : au-delà de 7, il faudra **regrouper** au lieu d'ajouter.

### Compteurs après sprint 16

idées BAC indexées **35** sur **6 sessions** · capsules 24 · schémas 17 ·
situations 23 · cartes mentales 11/11 · cartes d'ouverture 11/11 · suite
complète **1495 verts / 4 skipped** (toujours les 4 échecs pré-existants
`lazyRouteChunks.smoke`).

### Backlog

**Vide.** Les items 12, 14, 15, 16, 17, 18, 19 et « 5 bis » sont tous livrés.
Prochaine dette naturelle, si elle est souhaitée : la session 2020, et la
2026 dont l'annale est déjà en ligne chez DzExams.

---

## Sprint 17 — la série des sessions devient continue : 2019 → 2026

### Les deux dettes annoncées, soldées

Le sprint 16 laissait deux trous explicites. Les deux sont comblés :

- **Session 2020** (session de septembre, COVID) : le PDF officiel a fini par
  répondre après plusieurs tentatives. `MISSING_YEARS` est désormais **vide** —
  le tableau reste dans le code pour qu'un trou futur soit *déclaré* et non
  caché.
- **Session 2026**, déjà en ligne chez DzExams (avec son corrigé officiel) :
  ajoutée dans la foulée.

La banque passe de **35 à 47 idées** sur **8 sessions consécutives**, et un
nouveau test vérifie la **continuité de la série** : toute année entre la plus
ancienne et la plus récente doit être soit couverte, soit inscrite comme
manquante — aucun saut silencieux n'est possible.

### Ce que les deux sessions ajoutent au corpus

**2020** — structure interne de la Terre par les ondes sismiques (U10, la
première fois qu'une unité géologique mène un exercice de 5 points dans la
banque) · Cox-1/Cox-2, ibuprofène et célécoxib : pourquoi un anti-inflammatoire
fait mal à l'estomac, et comment l'inhibition sélective résout le problème
(U3) · immunothérapie du cancer du sein, Her2 et Trastuzumab (U4) · sélection
clonale et type de réponse (U4) · **la ricine, qui bloque l'ARNr 28S** — le
seul exercice du corpus qui distingue thymidine marquée et leucine marquée pour
localiser le niveau d'action (U1) · maturation des synapses inhibitrices du
nouveau-né, NKCC1/KCC2 et le sens d'entrée du Cl⁻ (U5).

**2026** — radical hydroxyle, albumine et œdème (U2) · **SIRT1 et le
resvératrol : le premier exercice du corpus où la molécule étudiée est un
activateur et non un inhibiteur** (U3) · l'atrazine, Q_B et la résistance du
maïs par la GST (U6) · membrane du thylakoïde et Oxyfluorfen (U6) · AVC, canal
ASIC1a et venin d'araignée PcTx1 — **avec une électrophorèse du peptide en
milieu acide, c'est-à-dire exactement le raisonnement du pHi** (U5+U2) ·
Alzheimer, Anti-Aβ contre ATV-Aβ : un anticorps efficace dans le sang et
impuissant dans le cerveau (U4).

### Le classement de pression, recalculé sur 8 sessions

| Unité | Points principaux | Exercices menés | Apparitions |
|---|---|---|---|
| **U4 المناعة** | 70 | 10 | 11 |
| **U1 تركيب البروتين** | 62 | 9 | 14 |
| **U5 الاتصال العصبي** | 62 | 9 | 9 |
| **U3 النشاط الإنزيمي** | 51 | 7 | 13 |
| U6 التركيب الضوئي | 35 | 5 | 5 |
| U2 بنية/وظيفة | 15 | 3 | 11 |

Avec deux sessions de plus, **U4 repasse en tête** et le constat du sprint 16
se durcit : **U1 apparaît dans 14 exercices sur 47 et U3 dans 13**, alors que
U3 n'en mène que 7. Les deux unités les plus *transversales* du programme sont
celles qu'on révise le moins, parce qu'elles ne portent pas le titre de
l'exercice.

Côté consignes : **« حلّل » 17 occurrences**, « اقترح فرضية » 8, « برّر » 8,
« بيّن » 6.

### Compteurs après sprint 17

idées BAC **47** sur **8 sessions (2019→2026, série continue)** · capsules 24 ·
schémas 17 · situations 23 · cartes mentales 11/11 · cartes d'ouverture 11/11 ·
suite complète **1496 verts / 4 skipped** (toujours les 4 échecs pré-existants
`lazyRouteChunks.smoke`).

Le catalogue de provenance est renommé `data/bac_sessions_2019_2026.json`.

---

## Sprint 18 — faire travailler la banque : écho BAC et poids réconciliés

Le sprint 17 a rendu la série complète. Une banque qu'on ne consulte que par
l'onglet « أفكار التمارين » reste pourtant sous-employée : l'information
« c'est tombé » doit apparaître **là où l'élève travaille déjà**.

### 1. Index inverse : de la ressource vers les sessions

`bacSessionIndex.ts` expose désormais `bacEchoForSituation`,
`bacEchoForCapsule` et `bacEchoForDrill`. Conséquence directe dans
« تمارين بالوضعيات » : chaque carte porte un badge **« بكالوريا 2024، 2023،
2022 +2 »**, et la fiche ouverte liste toutes les sessions concernées.

Ce n'est pas décoratif. **Plus de 60 % des 23 situations de l'app ont un écho
réel** dans les sujets officiels — la banque de situations, écrite avant la
collecte, se trouve validée par l'examen. Un test vérifie qu'aucun badge
n'apparaît sans écho : on ne décore pas une situation inventée d'un vernis
d'authenticité.

### 2. Le poids d'examen du plan de révision, réconcilié

Découverte la plus importante de ces trois sprints : **le poids annoncé par la
répartition du programme et la pression réellement constatée à l'examen ne
coïncident pas.**

| Unité | Annoncé (programme) | Constaté (8 sessions) | Écart |
|---|---|---|---|
| U1 تركيب البروتين | 10 % | **19,7 %** | ×2 |
| U4 المناعة | 13 % | **22,2 %** | +9 pts |
| U5 الاتصال العصبي | 16 % | 19,7 % | +4 pts |
| U3 النشاط الإنزيمي | 13 % | 16,2 % | +3 pts |
| U6 التركيب الضوئي | 20 % | **11,1 %** | −9 pts |
| U7 تحويل الطاقة | 19 % | **1,6 %** | ÷12 |
| U2 بنية/وظيفة | 9 % | 4,8 % | −4 pts |

U6 + U7 pèsent **39 % sur le papier et 12,7 % dans les faits** ; U1 + U4
pèsent 23 % sur le papier et **42 % dans les faits**. Un élève qui suit la
répartition officielle passe deux fois trop de temps sur la bioénergétique et
deux fois trop peu sur la synthèse des protéines.

**Décision prise** : le plan de révision ne choisit pas un camp. `unitWeight()`
est maintenant la **moyenne des deux mesures** (`declaredWeight` +
`observedWeight`) / 2, et les deux fonctions sont exportées pour rester
inspectables. Raison : la pression constatée porte sur 8 sessions — c'est
robuste mais pas une loi, et une unité peu tombée récemment peut revenir. La
moyenne corrige l'erreur sans parier sur sa reconduction.

Effet concret sur l'ordre de priorité (poids moyen + bonus de difficulté) :
**U4 → U6 → U5 → U3 → U1 → U2 → U7 → U9/U10/U11 → U8**. U4 passe en tête, U7
recule de la 2ᵉ à la 7ᵉ place — le temps qu'il rendait est désormais donné à
l'immunologie et à la synthèse des protéines.

Trois tests figent cette règle, dont deux qui documentent l'écart lui-même :
« corrige le poids annoncé là où l'examen dit le contraire ».

### Compteurs après sprint 18

idées BAC 47 / 8 sessions · index inverse sur situations, capsules et schémas ·
suite complète **1507 verts / 4 skipped** (toujours les 4 `lazyRouteChunks.smoke`
pré-existants).

---

## Sprint 19 — les 10 montages qui reviennent : réviser la forme, pas la molécule

### Le constat qui déclenche ce sprint

Un élève qui révise 47 exercices un par un révise 47 fois. Or l'ONEC ne
réinvente pas l'épreuve chaque année : il **rejoue un petit nombre de
montages**, en changeant la molécule, l'organisme et la maladie.

Le cas le plus net : « 3-NOP » (2022), « quercétine » (2023), « CA1P » (2024),
« célécoxib » (2020), « méthylthéobromine » (2025), « ML901 » (2023) et
« Edaravone » (2025) sont **sept habillages d'un seul montage** — une molécule
qui ressemble au substrat et occupe le site actif. Qui a compris le montage
traite les sept ; qui a appris les sept molécules n'en traite aucune de plus.

### Ce qui a été produit

`src/data/bacArchetypes.ts` — **10 montages**, chacun adossé à des exercices
réels dont les identifiants sont cités et vérifiés. Pour chacun : la
définition, les **signaux de reconnaissance** dans l'énoncé, la **méthode
ordonnée**, et le **piège** qui coûte des points année après année.

| Montage | Points cumulés | Exercices | Sessions |
|---|---|---|---|
| سمّ أو مادة تعطّل قناة أيونية | 54 | 8 | 7 |
| الجزيئة الشبيهة بالركيزة | 52 | 7 | 5 |
| من الطفرة إلى الظاهرة | 49 | 7 | 6 |
| على أي مستوى تتدخّل هذه المادة؟ | 47 | 7 | 6 |
| البنية الفراغية شرط الوظيفة | 38 | 6 | 4 |
| كيف يفلت العامل الممرض أو الورم من المناعة؟ | 37 | 5 | 4 |
| مبيد يقطع سلسلة التركيب الضوئي | 35 | 5 | 4 |
| الجسم المضاد كأداة علاجية | 31 | 4 | 4 |
| محدّدات الذات: من الغشاء إلى الزمرة الدموية | ~26 | 4 | 4 |
| قراءة وثيقة جيولوجية | 15 | 3 | 2 |

**46 exercices sur 47 sont classés.** Le seul isolat est l'exercice de
glycolyse / 2-désoxyglucose de 2025 : unique exercice de bioénergétique du
corpus, il ne constitue pas une récurrence — et il est laissé tel quel plutôt
que rangé de force dans un montage voisin. Un test plafonne les non-classés à
10 % du corpus.

Quelques pièges consignés, tous tirés d'exercices réels :
- l'inhibition compétitive **ne détruit pas** l'enzyme : augmenter le substrat
  annule son effet ;
- répondre « ça inhibe la synthèse protéique » **sans localiser l'étape** ne
  rapporte pas les points ;
- le sens d'entrée d'un ion dépend du **gradient**, pas du canal (piège 2020,
  Cl⁻ chez le nouveau-né) ;
- toute mutation n'est pas nuisible : celles de 2019 hors site actif laissaient
  l'activité quasi intacte, et celle de 2022 était **exploitée** en thérapie.

### Dans l'écran

« أفكار التمارين حسب الدورة » gagne un bandeau **« التركيبات التي تتكرّر »** :
un bouton par montage (avec ses points et son nombre de sessions), un panneau
qui déplie reconnaissance / méthode / piège, et un filtrage de la liste sur
les exercices concernés — toutes sessions confondues. Chaque fiche porte
l'étiquette du ou des montages dont elle relève.

### Tests

`bacArchetypes.lock.test.ts` — **11 verrous** : aucun exercice cité qui
n'existe, minimum 3 exercices et 2 sessions par montage (sinon ce n'est pas une
récurrence mais une anecdote), méthode et piège obligatoires, classement
déterministe, cohérence des points avec le barème officiel. Plus **5 tests de
vue**.

### Compteurs après sprint 19

idées BAC 47 / 8 sessions · **10 montages récurrents** · suite complète
**1523 verts / 4 skipped** (toujours les 4 `lazyRouteChunks.smoke`
pré-existants).

---

## Sprint 20 — les montages entrent dans la journée de travail (et un bug de fond corrigé)

### 1. Un cinquième geste dans le plan : « تركيب متكرّر في البكالوريا »

Les 10 montages du sprint 19 ne servaient que si l'élève ouvrait l'onglet des
annales. Ils sont désormais **programmés par le plan de révision** au même
titre qu'une capsule ou un schéma : une tâche de 10 minutes qui dit « révise
les signaux, la méthode et le piège, puis applique-les à l'exercice de 2023 ».

Chaque montage est rattaché à son **unité porteuse** (`archetypeHostUnit`) :
celle qui mène le plus de points parmi ses exercices — l'inhibiteur sosie à
U3, le canal détourné à U5, l'échappement immunitaire à U4. Il est donc
programmé au moment où cette unité est travaillée, pas au hasard.

Décision explicite : **les montages restent autorisés les deux derniers
jours**, contrairement aux situations longues. Réviser une méthode n'est pas
découvrir une notion — c'est même le meilleur usage de la veille.

Vérifié par test : un montage dès la première journée, **les dix vus sur un
plan de 30 jours**, présence dans les jours de consolidation, et une consigne
qui cite un exercice réel avec son année.

### 2. Le bug que ce sprint a mis au jour

En voulant vérifier que les dix montages passaient, seuls **six** apparaissaient.
La cause n'était pas dans les montages mais dans le moteur du plan, depuis le
sprint 15 : la file des tâches faisait `liste[tour % liste.length]`, alors que
la séquence pondérée fait revenir une unité lourde **plusieurs fois dans le
même tour**. Une unité qui revenait sept fois poussait donc **sept fois la même
capsule**, et les ressources en 2ᵉ ou 3ᵉ position d'une unité chargée — le 2ᵉ et
le 3ᵉ montage d'immunologie, le 2ᵉ atelier d'enzymologie — n'étaient jamais
atteintes avant la fin du plan.

Correctif : un **curseur par couple (unité, geste)**, qui avance à chaque
prise. Effet mesuré sur un plan de 30 jours × 90 min : **83 ressources
distinctes contre une poignée de titres répétés auparavant**, et les 10
montages couverts. Les élèves qui suivaient le plan jusqu'au bout voyaient
jusqu'ici une partie du matériel produit depuis le sprint 10 sans jamais
l'atteindre.

### Compteurs après sprint 20

5 gestes dans le plan (capsule · schéma · **montage** · situation · carte) ·
47 idées BAC · 10 montages · suite complète **1528 verts / 4 skipped**
(toujours les 4 `lazyRouteChunks.smoke` pré-existants).

---

## Sprint 21 — audit d'atteignabilité : du contenu écrit que personne ne voyait

Le sprint 20 a corrigé un biais de sélection dans le plan. La question qui
suivait était : **est-ce le seul ?** L'audit a porté sur toutes les banques de
contenu et sur les chemins réels qui y mènent depuis un composant.

### La trouvaille

**Les 19 exercices « élite » d'analyse documentaire n'étaient rendus par aucun
composant.** Un `grep` sur `src/components` ne donnait rien :
`documentAnalysisExercises.ts` n'était importé que par `situationIndex.ts`, et
seulement pour *valider des identifiants*. Ces exercices contiennent pourtant
ce qu'il y a de plus cher à produire : des questions avec verbe de consigne,
un **canevas de rédaction** (« كلما زاد … كلما قصر … »), une **grille
d'entraînement chiffrée** et une correction. Écrits, testés, jamais montrés.

Corrections apportées :
- nouveau sélecteur `analysisExercisesForSituation()` ;
- rendu dans la fiche de situation : énoncé du document, questions numérotées
  avec leur verbe et leur canevas, grille d'entraînement avec ses points, et
  la mention obligatoire « grille Kunz, pas le barème officiel » ;
- correction « élite » **masquée** tant que l'élève ne la demande pas, comme le
  reste de la fiche ;
- l'unique exercice orphelin (`h1_h2_generic_double_doc`, méthode H1/H2 en deux
  documents) est rattaché à la situation de lecture du code génétique.

### Le second trou, trouvé par le test lui-même

Le nouveau test « le plan d'un mois atteint toutes les capsules, tous les
schémas et tous les montages » a immédiatement échoué sur **une capsule de U8**.
Cause : la séquence pondérée fait revenir une unité lourde jusqu'à **dix fois
par tour**, ce qui repoussait la fin du tour si loin dans la file que les
ressources des unités légères n'étaient jamais consommées.

Correctif : **deux passages maximum par unité et par tour**. La pondération
reste réelle — une unité lourde reçoit deux fois plus de matériel et passe plus
tôt — mais aucune ressource ne se retrouve hors d'atteinte. Le plan de 30 jours
couvre désormais **l'intégralité** des capsules, des schémas et des dix
montages.

### Le filet posé pour l'avenir

`src/data/contentReachability.test.ts` — 7 tests qui lisent le code source des
composants et vérifient que chaque banque a un chemin vers l'écran, puis que
chaque élément est réellement atteint par ce chemin : 53 contextes
documentaires, 19 exercices élite (zéro orphelin), toutes les capsules, tous
les schémas, tous les montages, et une porte ouverte par idée BAC.

C'est le test qui aurait dû exister depuis le sprint 10 : une banque peut être
complète, verrouillée et fausse — si rien ne la rend.

### Compteurs après sprint 21

19 exercices élite rendus (contre 0) · plan de 30 jours à couverture totale ·
suite complète **1537 verts / 4 skipped** (toujours les 4
`lazyRouteChunks.smoke` pré-existants).

---

## Sprint 22 — 71 formulations, 12 demandes réelles : le décodeur de consignes

### Point de départ : l'audit QCM est propre

Première moitié du sprint, annoncée : vérifier que les **549 QCM** sont
atteignables. Résultat : **rien à corriger**. Les 11 unités en ont toutes
(de 39 pour U1 à 66 pour U4), aucun identifiant en double, et `QuizView`
reçoit la totalité des questions de l'unité sans troncature. Trois assertions
ont été ajoutées à `contentReachability.test.ts` pour que cela reste vrai.

### Le vrai gisement : les consignes

Le dépouillement des 8 sessions a relevé **71 formulations de consignes
différentes** pour 47 exercices. L'élève les lit comme 71 demandes ; le
correcteur n'en attend qu'une douzaine. `src/data/verbDemands.ts` les classe en
**12 familles**, chacune avec : ce qui est attendu, la structure de la réponse,
le **canevas de phrase**, et le **verbe voisin avec lequel on la confond**.

Le classement est **total** — un test échoue si une formulation du corpus
n'est reconnue par aucune règle.

| Famille | Occurrences | Exercices | Sessions | Points concernés |
|---|---|---|---|---|
| سمّ / اذكر / تعرّف / حدّد / صف | 25 | 21 | 8 | 122 |
| فسّر / اشرح / وضّح / علّل / بيّن | 20 | 16 | 8 | 116 |
| حلّل | 19 | 18 | 7 | **132** |
| اكتب في نص علمي | 19 | 19 | 7 | 110 |
| اقترح فرضية | 16 | 16 | 8 | 127 |
| صادق / تحقّق / ناقش صحة الفرضية | 13 | 13 | 8 | 103 |
| برّر · لخّص في مخطط · اقترح حلاً · استنتج · أبرز العلاقة · قارن | 4 à 9 | — | — | — |

Trois enseignements :

1. **« اكتب في نص علمي » tombe sur 19 exercices, soit 7 sessions sur 8.** Ce
   n'est pas un exercice particulier, c'est une exigence permanente — et les
   points de *hiérarchisation* (introduction / développement / conclusion) sont
   perdus même quand le contenu est juste.
2. **« اقترح فرضية » et « صادق » apparaissent sur les 8 sessions**, toujours en
   couple : la démarche scientifique complète est évaluée chaque année.
3. La famille « حلّل » ne domine pas en nombre mais **en points** (132) : c'est
   l'entrée des exercices lourds.

### La confusion consignée en premier

Pour chaque famille, le champ `confusionAr` nomme l'erreur voisine. La plus
coûteuse de l'épreuve est verrouillée par un test dédié :
**حلّل décrit ce que montre le document, avec les chiffres et sans aucune
connaissance extérieure ; فسّر dit pourquoi, et exige les acquis.** Mélanger
les deux fait perdre des points deux fois : la description manque dans l'un,
le mécanisme dans l'autre.

Autres pièges consignés : nier une hypothèse que les données ne soutiennent
pas (elle est *non étayée*, pas fausse) ; traiter deux hypothèses synonymes
(aucun document ne pourra les départager) ; redessiner le schéma du cours au
lieu du schéma-bilan de l'exercice ; développer dans un exercice de
restitution au détriment de l'exercice à 08 points.

### Dans l'écran

Les puces de verbes de « أفكار التمارين » deviennent **cliquables** : un clic
ouvre la fiche de la famille (demande, structure, canevas, confusion) et filtre
la liste sur les exercices où cette consigne est réellement tombée. Un montage
et une famille ne peuvent pas rester actifs en même temps — vérifié par test.

### Compteurs après sprint 22

12 familles de consignes · 10 montages · 47 idées BAC · 549 QCM audités ·
suite complète **1558 verts / 4 skipped** (toujours les 4
`lazyRouteChunks.smoke` pré-existants).

---

## Sprint 23 — la boucle se ferme : le contrôle de forme de la réponse écrite

### Ce qui manquait

Après le sprint 22, l'app savait **ce qui tombe** (47 exercices), **sous quelle
forme** (10 montages) et **ce que chaque consigne exige** (12 familles). Il
manquait le retour : l'élève écrit sa réponse, et personne ne lui dit que son
« تحليل » est en réalité un « تفسير », ou que son texte scientifique n'a ni
problématique ni conclusion.

`src/data/answerStructureCheck.ts` comble ce trou, avec une limite assumée et
écrite dans le fichier : **il ne note pas et ne juge pas le fond**. Le contenu
scientifique reste l'affaire du dictionnaire et de `correcteurV1.ts` ; ici on
ne vérifie que des marqueurs de FORME, chacun documenté par sa règle.

### Deux natures de contrôle, et c'est le point important

- **`attendu`** : la consigne l'exige (« la conclusion répond explicitement au
  problème »). Compté dans le score de forme.
- **`vigilance`** : une présence suspecte, pas une faute. **Non comptée.**
  Exemple canonique : une cause (« لأن », « يعود ذلك إلى ») dans un exercice
  d'analyse. L'élève reçoit un ⚠︎ et l'explication — « la cause a sa place dans
  le تفسير, pas dans le تحليل » — sans perdre de point sur un contrôle
  heuristique.

Cette distinction évite le piège classique de ce genre d'outil : transformer
une heuristique grossière en sanction chiffrée.

### Ce que chaque famille contrôle

| Consigne | Exigences vérifiées |
|---|---|
| حلّل | chiffres · unités · tendance « كلما… » · ⚠︎ pas de cause |
| فسّر / اشرح | connecteur causal · niveau (جزيئي/خلوي) · rappel du résultat |
| اكتب في نص علمي | problématique en tête · conclusion · appui documentaire · volume ≥ 40 mots |
| اقترح فرضية | modalité (« قد … ») · mécanisme proposé · testabilité |
| صادق / ناقش | rappel de l'hypothèse · preuve chiffrée · verdict explicite · ⚠︎ pas de rejet tranché sans donnée |
| لخّص في مخطط | flèches orientées · au moins trois étapes |
| قارن | marqueur de contraste · critères annoncés · plus d'un critère |
| استنتج | amorce « نستنتج » · brièveté (≤ 40 mots) |
| أبرز العلاقة | les deux documents cités · phrase de liaison |
| برّر · اقترح حلاً · سمّ | connecteur de justification · action + justification · concision |

Le contrôle « prudence » de la validation mérite d'être cité : rejeter
catégoriquement une hypothèse **sans donnée qui la contredise** déclenche une
alerte — *l'absence de preuve n'est pas une preuve d'absence*, il faut écrire
« غير مدعومة » et non « خاطئة ». C'est une faute de raisonnement que le barème
sanctionne et que peu d'outils détectent.

### Dans l'écran

`CorrecteurPanel` (onglet correction) reçoit un sélecteur **« التعليمة
المطلوبة »**. L'élève choisit la consigne — la deviner à partir de la réponse
aurait été une inférence de trop — et obtient la liste des exigences avec ✓, ✗
ou ⚠︎, chacune accompagnée de son conseil, plus la mention « فحص شكلي فقط ».

### Tests

`answerStructureCheck.test.ts` — **18 tests**, chaque famille éprouvée avec une
réponse **conforme** et une réponse **défaillante** : un contrôle qui passe
toujours ne sert à rien, un contrôle qui échoue toujours décourage. Plus 4 tests
de panneau.

### Compteurs après sprint 23

12 familles de consignes contrôlées · 10 montages · 47 idées BAC · suite
complète **1580 verts / 4 skipped** (toujours les 4 `lazyRouteChunks.smoke`
pré-existants).

---

## Sprint 24 — l'atelier : lire un exercice réel, écrire, être repris

### Le problème après le sprint 23

La chaîne était complète mais en pièces détachées, sur quatre écrans :
l'exercice réel et ses supports (annales), le montage qu'il rejoue et son piège
(bandeau des montages), ce que la consigne exige (fiche de famille), et le
contrôle de forme (panneau du correcteur, dans la vue méthodologie). Un élève
motivé pouvait les enchaîner à la main. Aucun ne le fera.

### Ce qui a été fait

`src/components/BacIdeaTrainer.tsx` met les quatre briques **sur une seule
page**. Un bouton « تدرّب على هذا التمرين » sur chaque fiche ouvre l'atelier :

1. les **supports réels** de l'exercice (ce que le candidat avait sous les yeux) ;
2. la **méthode du montage** correspondant, et son piège ;
3. les **consignes réellement demandées par cet exercice** — pas la liste des
   12 familles, seulement celles que le sujet a posées ;
4. le **canevas de phrase** de la consigne sélectionnée ;
5. une zone d'écriture avec **retour de forme en direct** (✓ / ✗ / ⚠︎) ;
6. la notion évaluée, **cachée jusqu'à la demande** — après avoir écrit, pas
   avant.

Le brouillon est conservé **par exercice et par consigne** : changer de
consigne ouvre une page blanche, revenir retrouve son texte, fermer l'app ne
perd rien.

### Ce qui est délibérément absent

**Aucune note.** Aucune des briques ne mesure le fond ; afficher un score
global — même « 4/6 » — laisserait croire à une évaluation. Le retour porte sur
la structure, et il le dit : « فحص شكلي فقط: المضمون العلمي لا يُقيَّم هنا ».

### Le cas qui illustre le mieux l'intérêt

Exercice DCMU (2023, sujet 2, exercice 3). L'atelier propose les consignes que
le sujet a réellement posées — hypothèses, discussion, conseil, schéma
fonctionnel — et rien d'autre. L'élève écrit « المبيد يوقف التركيب الضوئي » :
le contrôle « modalité » passe au rouge, avec le conseil « la fiche
d'hypothèse n'est pas une certitude : قد يعود … ». Il reformule
« قد يعود توقف طرح الأكسجين إلى ارتباط المبيد بناقل الإلكترونات … » et le
contrôle passe au vert. C'est un aller-retour de dix secondes, sur un sujet
tombé, avec le piège du montage affiché au-dessus.

### Tests

`BacIdeaTrainer.test.tsx` — 8 tests : les consignes proposées viennent bien de
l'exercice, le retour réagit au texte saisi (le cas hypothèse ci-dessus est
joué littéralement), le brouillon survit au démontage, la notion reste cachée.
Plus 2 tests d'ouverture et de fermeture côté annales.

### Compteurs après sprint 24

Chaîne complète sur un écran : 47 exercices réels · 10 montages · 12 familles
de consignes · contrôle de forme · brouillons persistants. Suite complète
**1590 verts / 4 skipped** (toujours les 4 `lazyRouteChunks.smoke`
pré-existants).

---

## Sprint 25 — la suite passe au vert, et le plan fait écrire

### 1. Les quatre « échecs » de `lazyRouteChunks.smoke` : ni bugs, ni fatalité

Ils traînaient depuis le premier sprint, systématiquement décrits comme
« pré-existants, ne pas toucher ». Diagnostic : **ce ne sont pas des bugs**.
Ces quatre contrôles portent sur le résultat d'un build (`dist/assets`), qui
n'existe pas dans une copie fraîche du dépôt — d'où quatre `ENOENT`
permanents. Vérification faite : après `vite build`, **les quatre passent**.

Le vrai défaut était donc ailleurs : quatre lignes rouges permanentes que plus
personne ne lisait, et qui masquaient les vraies régressions.

Règle adoptée, écrite dans le fichier :
- **pas de build** → contrôles ignorés, avec le message qui dit quoi lancer ;
- **build présent** → contrôles exécutés normalement ;
- **`REQUIRE_BUILD_SMOKE=1`** → l'absence de build devient une erreur (CI, où le
  build précède les tests et où son absence est un incident réel).

Nouveau script : `npm run test:build` (build + smoke). Vérifié dans les deux
modes.

**Résultat : la suite est intégralement verte pour la première fois —
123 fichiers, 1595 tests, 8 ignorés (4 contrôles de build + 4 skips
historiques), 0 échec.**

### 2. Un sixième geste dans le plan : écrire

L'atelier du sprint 24 était atteignable depuis les annales seulement. Le plan
le programme désormais : **« اكتب جواب تمرين 2023 : المبيد DCMU »**, 15 minutes,
avec la consigne que le sujet a réellement posée (« اقترح فرضية », « ناقش »…).
C'est le seul geste du plan où l'élève **produit** un texte plutôt que de
réviser un contenu — et il est exclu des deux derniers jours, comme les
situations longues.

Effet de bord utile : la fonction qui déduit les consignes d'un exercice a été
extraite du composant vers `src/data/bacWriting.ts`. Un module de données ne
doit pas importer un composant pour construire un plan.

Sur un plan de 30 jours, les rédactions couvrent **au moins cinq unités
différentes**, toutes adossées à des exercices réels — vérifié par test.

### Compteurs après sprint 25

6 gestes dans le plan (capsule · schéma · montage · **rédaction** · situation ·
carte) · 47 exercices réels · 10 montages · 12 familles de consignes ·
**suite complète 1595 verts / 8 skipped / 0 rouge**.

---

## Sprint 26 — du plan à l'atelier en un clic, et la trace de ce qu'on a écrit

### 1. La friction qui tuait la tâche de rédaction

Le sprint 25 a mis « اكتب جواب تمرين 2023 : المبيد DCMU » dans le plan du jour.
Mais la consigne se terminait par « ouvre l'exercice dans l'atelier des
idées » : à l'élève de changer d'onglet, de retrouver la session, puis
l'exercice. C'est exactement le genre de friction qui transforme une bonne
tâche en tâche sautée.

Chaque tâche de rédaction porte maintenant un bouton **« افتح الورشة على هذا
التمرين »** qui ouvre l'atelier directement sur le bon exercice. Le câblage
passe par `App` (`focusIdeaId`), et la vue du plan reste utilisable seule : sans
rappel fourni, aucun bouton n'apparaît — vérifié par test, pour que le composant
ne dépende pas de son hôte.

### 2. La production de l'élève devenait invisible

L'atelier sauvegardait les brouillons depuis le sprint 24, mais **rien ne les
montrait**. Or c'est la seule trace de PRODUCTION que l'élève laisse : une
capsule lue et un schéma refait ne prouvent pas la même chose qu'une réponse
rédigée.

`src/data/writingProgress.ts` lit ces clés — **et n'en écrit jamais aucune**,
propriété vérifiée par un test qui espionne `Storage.setItem`. Chaque fiche
d'exercice affiche « كتبت n جواباً », et l'en-tête de la liste totalise
« حرّرت X جواباً على Y تمريناً ».

Détails traités parce qu'ils cassent silencieusement ce genre de module :
brouillons vides ou blancs ignorés, clés étrangères (`kunz.revisionPlan.14x90`)
écartées, identifiants à préfixe commun non confondus, `localStorage`
indisponible géré sans exception.

### 3. Incident de synchronisation, et ce qu'il a révélé

Au cours du sprint, le fichier `lazyRouteChunks.smoke.test.ts` est revenu à sa
version d'avant le sprint 25 dans la copie de travail — les quatre lignes
rouges étaient de retour. Restauré depuis la branche distante (le commit
`6cc90e5` était intact). À retenir : **le dépôt distant fait foi**, et une
régression de suite qui « revient toute seule » doit d'abord faire suspecter un
état de travail, pas le code.

### Compteurs après sprint 26

Plan → atelier en un clic · trace d'écriture visible · suite complète
**1608 verts / 8 skipped / 0 rouge** (124 fichiers).

---

## Sprint 27 — « ما كتبته أنا » : relire sa propre production, et en tirer un profil d'erreurs

### Ce qui manquait encore

Depuis le sprint 24, l'élève peut rédiger ; depuis le 26, on lui dit combien de
réponses il a écrites. Mais **il ne pouvait pas les revoir ensemble**, ni
savoir ce qu'il rate *systématiquement*. Or ces brouillons sont la seule
production personnelle de l'app : capsules lues, schémas refaits et QCM
mesurent de la reconnaissance, pas de la rédaction.

### Deux niveaux de retour

**1. Réponse par réponse.** `reviewDrafts()` relit chaque brouillon, le
rattache à son exercice et à sa consigne, et affiche son état de forme
(`3 / 4`), ce qui manque, et les alertes déclenchées. **Les réponses les plus
incomplètes remontent en tête** — c'est là qu'il reste du travail — et chacune
se rouvre dans l'atelier en un clic.

**2. Le profil d'erreurs.** `weakestChecks()` agrège les échecs sur toutes les
réponses et donne ce qu'aucun corrigé ne dit : **« tu oublies la conclusion
dans 4 réponses sur 5 »**. Le compte se fait en *échecs sur occasions* : une
exigence qui ne s'est présentée qu'une fois affiche « 1 sur 1 » et l'élève
juge lui-même — plutôt qu'un pourcentage qui ferait passer un incident pour une
habitude. Les vigilances (la cause glissée dans un تحليل) y figurent aussi.

### Détails qui cassent ce genre de module, traités

- brouillon dont l'exercice n'existe plus : affiché, non rouvrable — pas de
  plantage, pas de bouton mort ;
- famille de consigne inconnue : ignorée silencieusement ;
- extrait tronqué à 90 caractères pour reconnaître son texte, **sans toucher au
  brouillon enregistré** ;
- lecture seule, vérifiée par un test qui espionne `Storage.setItem` ;
- le panneau est remonté (`key`) à chaque fermeture de l'atelier, sinon il
  afficherait l'état d'avant la dernière rédaction.

### Tests

`writingReview.test.ts` — 11 tests (classement, profil, cas dégradés) ;
`WritingReviewPanel.test.tsx` — 5 tests ; 3 tests d'intégration côté annales.

### Note d'exploitation

Pour la deuxième fois, `lazyRouteChunks.smoke.test.ts` est revenu dans la copie
de travail à sa version d'avant le sprint 25. Restauré depuis la branche
distante, qui reste la référence. Si le phénomène se répète, le correctif
durable est de sortir ce contrôle de la suite unitaire (`npm run test:build`
existe déjà pour cela).

### Compteurs après sprint 27

Production personnelle relisible avec profil d'erreurs · suite complète
**1626 verts / 8 skipped / 0 rouge** (126 fichiers).

---

## Sprint 28 — correctif durable du bruit rouge, et la feuille du jour à imprimer

### 1. Les contrôles de build sortent de la suite unitaire

Le sprint 25 avait rendu `lazyRouteChunks.smoke.test.ts` tolérant à l'absence
de build. Bonne intention, mauvais niveau : le fichier est revenu **deux fois**
à sa version d'origine dans la copie de travail, ramenant avec lui quatre
lignes rouges. Un correctif qui vit dans le fichier qu'il protège n'est pas un
correctif.

Correctif déplacé d'un cran :
- `vite.config.ts` **exclut `src/build/**`** de la suite unitaire — ces
  contrôles lisent `dist/assets`, ils n'ont rien à y faire ;
- `vite.build-test.config.ts` (nouveau) les exécute seuls ;
- `npm run test:build` = `vite build && REQUIRE_BUILD_SMOKE=1 vitest run
  --config vite.build-test.config.ts`.

Désormais, même si le fichier de test redevient strict, **la suite unitaire
reste verte** : elle ne le charge plus. Vérifié dans les deux modes — suite
unitaire 125 fichiers verts, contrôles post-build 4 verts après `vite build`.

### 2. « ورقة اليوم للطباعة »

Beaucoup d'élèves algériens travaillent sur papier — et un plan consultable
seulement à l'écran est un plan qu'on ne suit pas en salle de révision. Le
bouton **« ورقة اليوم للطباعة »** produit une feuille contenant :

- toutes les tâches du jour, avec leur **case à cocher**, leur durée et la
  consigne complète (pas seulement le titre) ;
- un bloc **« الفخاخ التي يجب تفاديها اليوم »** : les pièges des montages
  programmés ce jour-là, repris tels quels de `bacArchetypes.ts`.

L'impression est déclenchée après le rendu, et une règle `@media print` masque
tout le reste de l'application. La feuille se referme sans quitter le plan.

### Compteurs après sprint 28

Feuille du jour imprimable · contrôles de build isolés · suite unitaire
**1631 verts / 4 skipped / 0 rouge** (125 fichiers) · `npm run test:build`
4 verts.

---

## Sprint 29 — le plan remonte sur l'accueil

### Le défaut de placement

Quatorze sprints de travail — plan, montages, consignes, atelier, relecture —
vivaient **derrière deux clics** : التمارين والتدريب, puis la carte voulue. Or
un élève qui ouvre l'app tombe sur son tableau de bord. S'il n'y voit pas sa
journée, il ne la fera pas : la qualité d'un plan ne compense jamais son
absence à l'écran d'accueil.

### « برنامج اليوم »

Une carte en tête du tableau de bord affiche : les jours restants, le temps du
jour, la progression (« أنجزت 2 من 9 »), et **les trois premières tâches non
encore cochées**, puis « و 4 مهام أخرى اليوم ». Un clic ouvre le plan complet.
Quand tout est coché, la carte le dit et ne liste plus rien.

La carte ne duplique aucune logique : le moteur du plan étant déterministe,
elle reconstruit le même plan à partir du réglage de l'élève et lit les cases
déjà cochées.

### Le réglage devient une donnée partagée

Jusqu'ici, « 14 jours × 90 minutes » n'existait que dans l'état local de la vue
du plan : l'accueil aurait affiché le plan de quelqu'un d'autre.
`src/data/planSettings.ts` en fait une donnée partagée, avec ce qu'il faut de
prudence : bornes appliquées à la lecture **et** à l'écriture (1-60 jours,
20-240 minutes), repli sur le défaut si le contenu est corrompu ou partiel,
stockage refusé sans exception.

### Tests

`planSettings.test.ts` (5) et `TodayCard.test.tsx` (7) : réglage respecté,
valeurs aberrantes bornées, tâche cochée retirée de la carte, félicitations
seulement quand tout est fait, ouverture du plan au clic.

### Compteurs après sprint 29

Accueil → journée → plan → atelier, sans détour · suite unitaire
**1643 verts / 4 skipped / 0 rouge** (127 fichiers).

---

## Sprint 30 — 3,97 Mo → 1,46 Mo : le premier écran arrête d'attendre toute l'application

### Le problème, chiffré

Le build annonçait depuis le début un bundle d'entrée de **3 968 Ko
(964 Ko gzip)**, avec l'avertissement de Vite ignoré à chaque compilation.
Toutes les vues étaient importées statiquement dans `App.tsx` : avant
d'afficher le tableau de bord, le navigateur téléchargeait le compilateur de
méthodologie, le tableau de bord enseignant, les cartes mentales, les
statistiques, l'atelier de combat, les annales… Pour le public visé — des
élèves algériens souvent en 3G — c'est la différence entre une app qui s'ouvre
et une app qu'on désinstalle.

### Ce qui a été fait

Vingt-et-une vues passent en **import dynamique** (`React.lazy`), derrière une
frontière `Suspense` unique posée autour du canevas — un seul onglet est monté
à la fois, une frontière suffit. L'attente affiche « جارٍ التحميل… », sans saut
de page.

Restent chargées d'avance les vues du **chemin des premières secondes** :
splash et tableau de bord.

| Mesure | Avant | Après | Gain |
|---|---|---|---|
| `index-*.js` | 3 968 Ko | **1 456 Ko** | **−63 %** |
| idem, gzip | 964 Ko | **336 Ko** | **−65 %** |

Les vues lourdes deviennent des chunks à la demande : `LessonsView` 992 Ko,
`StatsView` 460 Ko, `SectionObligatoire` 320 Ko, `MethodologyCompilerView`
264 Ko. Un élève qui révise ses leçons ne télécharge plus le tableau de bord
enseignant.

### Le garde-fou

`src/build/bundleBudget.test.ts` (exécuté par `npm run test:build`) fixe un
**plafond de 1 900 Ko** pour le bundle d'entrée, vérifie que les trois vues les
plus lourdes sont bien sorties, et qu'aucun chunk ne dépasse l'entrée. Si un
`import` statique revient dans `App.tsx`, le test le dit **avec le chiffre**.
C'est la différence entre une optimisation ponctuelle et une propriété tenue.

### Vérifications

Suite unitaire : **127 fichiers, 1643 verts, 4 skipped, 0 échec** — aucune
régression malgré la conversion de 21 imports. Contrôles post-build : 7 verts
(4 chunks de leçons + 3 de budget).

### Compteurs après sprint 30

Bundle d'entrée **−65 % en gzip** · budget verrouillé par test · suite
unitaire 1643 verts.

---

## Sprint 31 — 908 Ko : une constante de six lettres tenait tout le corpus en otage

### Suite directe du sprint 30

Après le découpage des vues, l'entrée pesait encore 1 456 Ko. Une part
importante venait d'un seul fichier : `src/quizCorpus.ts` — **596 Ko de
source**, les 549 QCM avec leurs explications complètes. `App.tsx` l'importait
statiquement pour initialiser un état : **tout élève téléchargeait les 549
questions avant de voir son tableau de bord**, y compris celui qui venait lire
une leçon.

### Le corpus passe en chargement différé

`src/data/corpusLoader.ts` isole l'accès derrière un import dynamique, avec un
cache de module et une promesse partagée (deux composants qui le demandent en
même temps ne déclenchent pas deux téléchargements). Trois règles :

- les flashcards de référence ne sont chargées **que si** le stock local est
  absent ou corrompu — sinon, aucun téléchargement ;
- le quiz demande le corpus **avant** de s'ouvrir, et se peuple à son arrivée ;
- un **préchargement au repos** (`requestIdleCallback`, repli sur un délai)
  fait que l'élève qui ouvrira un quiz dans trente secondes n'attend pas.

### Le détail qui annulait tout

Premier build après ce travail : **aucun gain**. La cause valait d'être
trouvée : `SplashView` et `DashboardView` importaient `LOGO_URL` depuis
`data/index.ts`… qui importe `quizCorpus.ts`. **Une constante de six lettres
suffisait à ramener 596 Ko dans le bundle d'entrée** et à annuler tout le
chargement différé.

Les URLs de marque vivent désormais dans `src/data/brandAssets.ts`, module sans
aucune dépendance ; `data/index.ts` les ré-exporte pour ne rien casser ailleurs.

### Résultat cumulé

| Mesure | Sprint 29 | Sprint 30 | **Sprint 31** |
|---|---|---|---|
| entrée | 3 968 Ko | 1 456 Ko | **908 Ko** |
| gzip | 964 Ko | 336 Ko | **247 Ko** |

**−77 % en brut, −74 % en gzip** par rapport au point de départ.

### Le garde-fou, renforcé

Le test de budget lisait l'entrée par le motif `index-*.js`. Depuis ce sprint,
**deux** chunks portent ce nom (celui de l'app et celui de `src/data/index.ts`) :
le test aurait pu mesurer le mauvais fichier sans jamais rougir. Il lit
maintenant l'entrée dans `dist/index.html`, et vérifie en plus qu'une chaîne
propre au corpus **n'y figure pas** — si un import statique le ramène, le test
le dit.

### Vérifications

Suite unitaire **1643 verts / 4 skipped / 0 échec** (127 fichiers) + 6 tests du
chargeur ; contrôles post-build **8 verts**.

---

## Sprint 32 — le chunk des leçons perd la moitié de son poids

### Trois imports, 548 Ko

`LessonsView` pesait **996 Ko**, soit plus que le bundle d'entrée. Deux causes,
toutes deux des importations trop larges :

1. `import { INITIAL_UNITS } from '../data'` — le même piège qu'au sprint 31 :
   la liste des 11 unités (quelques lignes) entraînait **tout le corpus QCM**.
   Corrigé vers `../unitCatalog`. Même correction pour `MASCOT_URL`
   (`QuizView`) et `MORCHID_LOGO_URL` (`AITutorView`).
2. Quatre vues secondaires importées statiquement — bibliothèque Okacha,
   recherche globale, QCM du livre, sujets BAC — alors qu'elles ne s'ouvrent
   que sur action de l'élève. Passées en `React.lazy` avec une frontière
   `Suspense` locale.

| Chunk | Avant | Après |
|---|---|---|
| `LessonsView` | 996 Ko | **448 Ko** |
| `OkachaView` | (inclus) | 456 Ko, à la demande |

L'entrée reste à 908 Ko : ce sprint ne l'allège pas, il évite de faire payer
456 Ko de bibliothèque à l'élève qui veut juste lire une leçon.

### Le garde-fou resserré — et immédiatement utile

Plafond des chunks à la demande ramené de **1 100 à 800 Ko**. Premier essai :
**rouge** — l'entrée elle-même (907 Ko) était comptée parmi les chunks. Le
test distingue maintenant l'entrée (plafond propre, plus haut : elle porte
React, la navigation et le tableau de bord) des chunks à la demande. Un test
qui échoue pour une bonne raison le jour où on le resserre, c'est le signe
qu'il mesure vraiment quelque chose.

### Incident de synchronisation (3ᵉ occurrence)

`src/build/bundleBudget.test.ts` avait disparu de la copie de travail — le
contrôle de budget aurait silencieusement cessé d'exister, et `npm run
test:build` serait passé au vert avec 4 tests au lieu de 8. Restauré depuis la
branche distante. **C'est exactement le scénario contre lequel un test de
budget doit protéger : il faut donc vérifier son décompte, pas seulement sa
couleur.**

### Vérifications

Suite unitaire **1649 verts / 4 skipped / 0 échec** (128 fichiers) ; contrôles
post-build **8 verts** (4 chunks de leçons + 4 de budget).

---

## Sprint 33 — la régression hors ligne que le découpage avait créée

### Le défaut, invisible tant qu'on teste avec du réseau

L'application embarque un service worker soigné : shell précaché, leçons HTML,
schémas en arrière-plan selon la qualité du réseau. Il découvrait les
ressources du build **en lisant `index.html`**.

Or depuis les sprints 30-32, `index.html` ne référence plus qu'**un seul**
fichier : le bundle d'entrée. Tout le reste — leçons, annales, statistiques,
bibliothèque, atelier — est chargé dynamiquement. Conséquence : ces vues
n'étaient **plus précachées**. Un élève hors ligne qui ouvrait un onglet non
encore visité tombait sur un **écran blanc permanent** : l'import échoue, et
React laisse le `Suspense` en attente indéfiniment.

Le gain de performance des trois sprints précédents avait donc un prix caché,
payé exactement par le public le plus fragile : celui qui a une connexion
intermittente.

### Correction en trois points

1. **Manifeste d'assets.** Un plugin Vite émet `dist/assets-manifest.json` :
   la liste de tous les JS et CSS produits (88 fichiers). C'est la source de
   vérité que `index.html` ne peut plus fournir.
2. **Service worker.** Il lit ce manifeste et précache les chunks en
   arrière-plan, après activation. Sur réseau contraint (2G, `saveData`), il
   précache **les chunks de code quand même** et renonce seulement aux 8 Mo de
   schémas : mieux vaut une app complète sans images qu'une app trouée.
3. **Filet d'interface.** `ChunkErrorBoundary` transforme l'échec d'import en
   message actionnable — « تعذّر تحميل هذا القسم … الأقسام التي فتحتها من قبل
   تبقى متاحة دون اتصال » — avec un bouton « أعد المحاولة » qui remonte la vue
   sans recharger la page. Les erreurs qui **ne** viennent pas d'un chargement
   affichent leur vrai message : cette frontière n'est pas un cache-misère.

### Tests

- `ChunkErrorBoundary.test.tsx` (7) : reconnaissance des formulations d'échec
  des différents navigateurs, non-confusion avec une erreur applicative,
  réessai sans rechargement ;
- `src/build/offlineAssets.test.ts` (5, post-build) : le manifeste existe,
  **liste exactement** les fichiers émis, contient les vues absentes de
  `index.html`, et le service worker le consomme réellement.

### Incident de synchronisation (4ᵉ occurrence)

`bundleBudget.test.ts` avait de nouveau disparu de la copie de travail :
`npm run test:build` annonçait **9 tests au lieu de 13**, tout en étant vert.
D'où la règle que j'applique désormais à chaque sprint : **lire le décompte,
pas la couleur**. Fichier restauré depuis la branche distante.

### Compteurs après sprint 33

Suite unitaire **1656 verts / 4 skipped / 0 échec** (129 fichiers) ; contrôles
post-build **13 verts** (4 chunks + 4 budget + 5 hors ligne).

---

## Sprint 34 — la session 2018 entre dans la banque, et supprime le dernier isolat

### Pourquoi 2018 méritait le détour

La série couvrait 2019→2026. En remontant d'une année, on gagne six exercices,
mais surtout **celui-ci** : sujet 1, exercice 2 — le récepteur du LDL et
l'athérosclérose. Il fournit un tableau de **pHi par acide aminé** (Cys 5,
Asp 2,77, Lys 9,74) et demande la **forme ionique** du même acide aminé à trois
pH différents, avant de relier une mutation ponctuelle à une maladie.

C'est mot pour mot la **leçon n°1 de la liste de priorités** qui a ouvert cet
audit — « pHi / comportement des acides aminés », 73 au classement de
difficulté. Jusqu'ici l'app l'enseignait ; elle peut maintenant montrer
**l'exercice officiel qui la pose**.

Les cinq autres : intégration nerveuse (U5) · mitochondries des spermatozoïdes
et coenzyme Q10 (U7) · ABO et marqueurs du soi (U4) · lactase et intolérance au
lactose (U3) · **origine de l'O₂ par les isotopes ¹⁸O** (U6).

### Deux montages de plus, et plus aucun isolat

Deux exercices de 2018 ont fait apparaître des récurrences jusque-là invisibles :

- **« تتبّع الحصيلة الطاقوية »** (2018, 2022, 2025) : où l'ATP est produit, en
  quelle quantité, et ce qui s'arrête quand un maillon saute. Piège consigné :
  confondre l'ATP de la phosphorylation au niveau du substrat avec celui de
  l'oxydation des transporteurs — la question distingue toujours les deux.
- **« التتبّع بالنظائر المشعّة »** (2018, 2020, 2025) : ¹⁸O, thymidine/leucine
  marquées, ¹⁴CO₂. Piège consigné : attribuer le marquage au produit final sans
  vérifier son chemin — en 2018, l'O₂ porte la marque de **l'eau**, pas du
  HCO₃⁻.

Conséquence : **les 53 exercices sont désormais tous classés** (le solitaire de
bioénergétique de 2025 a trouvé sa famille).

### Le corpus après ce sprint

| | Sprint 33 | **Sprint 34** |
|---|---|---|
| sessions | 8 (2019→2026) | **9 (2018→2026, continues)** |
| exercices | 47 | **53** |
| montages | 10 | **12** |
| exercices non classés | 1 | **0** |

Classement de pression recalculé : U4 **75 pts**, U5 67, U1 62, U3 58, U6 43,
U2 22. U3 apparaît maintenant dans **14 exercices sur 53** sans en mener que 8 :
le constat des sprints précédents se renforce encore.

Le décodeur de consignes a gagné une entrée : **« استدل »** (2018) — conclure
*en s'appuyant sur une preuve*, rattaché à la famille « استنتج » avec l'exigence
supplémentaire d'adosser la conclusion à un résultat. Le classement reste total.

### Vérifications

Suite unitaire **1656 verts / 4 skipped / 0 échec** (129 fichiers) ; contrôles
post-build **13 verts** (décompte vérifié, pas seulement la couleur).

---

## Sprint 35 — deux sélecteurs écrits au sprint 18, jamais affichés

### Le constat

`bacEchoForSituation`, `bacEchoForCapsule` et `bacEchoForDrill` ont été écrits
ensemble au sprint 18. Seul le premier a reçu une interface. Les deux autres
étaient **exacts, testés, et invisibles** depuis dix-sept sprints — exactement
le défaut que l'audit d'atteignabilité du sprint 21 avait trouvé sur les
exercices « élite », reproduit à plus petite échelle par mes propres soins.

Le test d'atteignabilité ne l'avait pas vu parce qu'il vérifiait que chaque
**banque de contenu** avait un écran, pas que chaque **sélecteur exporté** avait
un consommateur.

### Ce qui est affiché maintenant

- **Micro-capsules** : « سقطت في البكالوريا: 2021 · 2018 » sous le titre. Une
  capsule sur deux a un écho réel — dont celle du pHi, désormais adossée à
  l'exercice officiel de 2018 trouvé au sprint précédent.
- **Schémas à reproduire** : « مطلوب في البكالوريا: 2026 · 2023 · 2018 » sous le
  titre de l'exercice. Refaire de mémoire la chaîne photochimique n'est plus
  une consigne abstraite : c'est un schéma **demandé trois fois en neuf ans**.

### Le garde-fou complété

`contentReachability.test.ts` vérifie désormais que **les trois** sélecteurs
d'écho ont un consommateur dans un composant, et qu'il existe réellement de
quoi afficher (plus de 10 capsules et plus de 8 schémas avec écho). La règle
générale à retenir : *une fonction exportée sans consommateur est un bug qui
attend d'être découvert par quelqu'un d'autre.*

### Vérifications

Suite unitaire **1661 verts / 4 skipped / 0 échec** (129 fichiers).

---

## Sprint 36 — dix sessions consécutives : 2017 → 2026

### Ce que 2017 apporte

Six exercices de plus, et deux qui comblent des angles morts du corpus :

- **sujet 1, exercice 2** — les cinq milieux gélatineux qui ne diffèrent que
  par **une** lymphocyte : la démonstration expérimentale de la coopération
  immunitaire, celle qui sépare pour de bon réponse humorale et réponse
  cellulaire. C'est la leçon n°2 de la liste de priorités, en version
  expérimentale ;
- **sujet 2, exercice 3** — le xeroderma pigmentosum : une **délétion** décale
  le cadre de lecture, produit un codon stop précoce, tronque l'enzyme de
  réparation XPA, et le soleil devient cancérigène. Le premier exercice du
  corpus où la mutation n'est pas une substitution.

Les quatre autres : mécanismes de la synthèse protéique avec calcul (U1) ·
chloroplaste, ATP/ADP et CO₂ marqué (U6) · cellule autotrophe contre
hétérotrophe (U8/U7) · canaux ioniques derrière le potentiel d'action (U5).

### Le corpus

| | Sprint 34 | **Sprint 36** |
|---|---|---|
| sessions | 9 (2018→2026) | **10 (2017→2026)** |
| exercices | 53 | **59** |
| exercices non classés | 0 | **0** |

Pression recalculée sur dix ans : **U4 82 pts**, U1 75, U5 74, U3 58, U6 51,
U2 22. U1 apparaît maintenant dans **17 exercices sur 59** — c'est l'unité la
plus omniprésente du programme, loin devant son poids annoncé de 10 %.

Classement des montages : « سمّ أو مادة تعطّل قناة أيونية » 66 pts sur
**9 sessions**, « من الطفرة إلى الظاهرة » 64 pts sur 8, « الجزيئة الشبيهة
بالركيزة » 59 pts sur 6.

### Trois consignes de plus dans le décodeur

2017 a introduit des formulations absentes des sessions récentes :
**« احسب »**, **« اكتب المعادلة »**, **« أعطِ التتابع »**, **« ترجم إلى
منحنيات »**, **« مثّل بالرسم »**. Les quatre premières rejoignent la
restitution ; la dernière rejoint le schéma-bilan, parce qu'elle demande de
**produire un tracé**, pas de le décrire. Le classement reste total : 0
formulation orpheline sur les 59 exercices.

Détail utile : « فسّر الظاهرة » a obligé à ajouter le motif « الظاهرة » à la
famille explicative — sans quoi la consigne aurait basculé dans la restitution
et donné à l'élève le mauvais canevas.

### Vérifications

Suite unitaire **1661 verts / 4 skipped / 0 échec** (129 fichiers). Correction
au passage d'un import dupliqué (`SCHEMA_DRILLS`) que `tsc` signalait dans le
test du sprint 35.

---

## Sprint 37 — retour à la question de départ, avec dix ans de preuves

### Pourquoi rouvrir le classement

La question qui a lancé tout ce travail était : **« quelles leçons dois-je
travailler en premier ? »**. La réponse des sprints 1-4 venait des chaînes
YouTube — vues, commentaires, durée des cours — c'est-à-dire de la **difficulté
ressentie**. C'était la seule source disponible à l'époque. Depuis, le corpus
compte **59 exercices officiels sur 10 sessions** : il est possible de répondre
avec l'épreuve elle-même.

Nouveau document : `docs/analyse/PRIORITES_REVISEES_10_SESSIONS.md`.

### Ce que le réexamen change

**Confirmé — U4 المناعة.** Première au ressenti, première à l'épreuve
(82 points, 10 sessions sur 10). Le travail des sprints 5-15 était bien placé.

**Le grand oubli — U1 تركيب البروتين.** Absente des cinq priorités initiales,
elle mène **19 % des points** et apparaît dans **17 exercices sur 59** :
l'unité la plus omniprésente du programme.

L'explication de l'angle mort mérite d'être notée, car elle vaut pour d'autres
matières : les classements initiaux mesuraient ce que les élèves **cherchent**.
Or U1 n'est pas *ressentie* comme difficile — enseignée tôt, jugée mécanique.
Personne ne cherche « شرح الترجمة » trois semaines avant l'examen. Elle tombe
pourtant chaque année, seule ou en support d'un exercice d'immunologie, de
pharmacologie ou de génétique. **Mesurer la difficulté ressentie, c'est mesurer
ce qui inquiète, pas ce qui rapporte.**

**Second oubli — U5** (18,7 %, 10 sessions sur 10), même mécanisme.

**À requalifier — U2 (pHi).** Première en difficulté ressentie, elle ne mène que
5,6 % des points **mais apparaît dans 13 exercices** : ce n'est pas une unité
vedette, c'est une **compétence transversale**. Le simulateur pH → charge →
migration garde sa valeur ; son cadrage change.

**Surévaluée par le programme — U7** : 19 % annoncés, **3,3 %** constatés.

**Irrégulière — U6** : 12,9 % des points mais **6 sessions sur 10**. Profil
« tout ou rien » : à sécuriser, pas à sur-investir.

### Les cinq priorités révisées

U4 · **U1** · **U5** · U3 · U6 — et **U2 en transverse**, pas en cinquième
place.

### Le garde-fou contre la pourriture documentaire

Un document chiffré vieillit mal : une session ajoutée, et les nombres publiés
deviennent faux sans que rien ne casse. `data/priorites_pedagogiques.json`
reçoit donc un bloc `prioritesMesurees_2017_2026`, et
`src/data/prioritesMesurees.sync.test.ts` **recalcule chaque nombre depuis le
corpus** : points menés, part, poids annoncé, apparitions, sessions, ordre du
tri, et jusqu'à l'assiette annoncée dans les métadonnées (« 59 exercices »,
« 2017 », « 2026 »). Le jour où une session s'ajoute, c'est le test qui
prévient.

### Limite assumée, écrite dans le document

Dix sessions suffisent pour une tendance, pas pour une loi. U9, U10 et U11
n'apparaissent que sur une ou deux sessions : leur 1,3 % ne signifie pas
qu'elles ne tomberont pas cette année, mais que le corpus ne permet pas de les
classer. Elles gardent leur poids plancher dans le plan.

### Vérifications

Suite unitaire **1665 verts / 4 skipped / 0 échec** (130 fichiers).

---

## Sprint 38 — le plan s'explique, parce qu'il contredit le programme

### Le problème de crédibilité

Depuis le sprint 18, le plan répartit le temps selon la **moyenne** du poids
annoncé par le programme et de la pression constatée sur les sujets. Une
conséquence visible : l'unité « تحويل الطاقة », annoncée à **19 %** dans la
répartition officielle, reçoit peu de temps parce qu'elle n'a pesé que **3,3 %**
sur dix sessions.

Un élève — ou un professeur — qui voit ça sans explication conclut que
l'application se trompe. Et il a raison de s'en méfier : un outil qui contredit
le document officiel doit dire **pourquoi**, avec ses chiffres.

### « لماذا هذا الترتيب؟ »

Un bouton dans le bandeau de résumé déplie, pour **chaque unité** :

- le **poids annoncé** par la répartition du programme ;
- le **poids observé** sur les 10 sessions officielles (2017-2026) ;
- le **bonus de difficulté** issu du dépouillement des chaînes ;
- la **priorité résultante**, et les **minutes réellement allouées** dans le
  plan courant de l'élève.

Les unités sont listées dans l'ordre de priorité effectif — vérifié par test
contre `prioritizedUnitIds()`, pour que l'affichage ne puisse pas raconter un
ordre différent de celui qui produit le plan.

Le bloc se termine par l'écart le plus parlant, écrit en toutes lettres :
19 % annoncés contre 3,3 % constatés pour la bioénergétique, 10 % annoncés
contre 19 % menés pour la synthèse des protéines — **et la mention que le plan
ne suit ni l'un ni l'autre seul.**

### Pourquoi ça compte plus qu'une fonctionnalité

Les sprints 30-33 ont rendu l'app rapide et utilisable hors ligne ; les sprints
16-37 lui ont donné des données solides. Ce sprint-ci ne fait ni l'un ni
l'autre : il rend le raisonnement **inspectable**. Un plan de révision est une
affirmation sur l'emploi du temps de quelqu'un à trois semaines de son
baccalauréat ; il doit pouvoir être contesté sur pièces.

### Vérifications

Suite unitaire **1669 verts / 4 skipped / 0 échec** (130 fichiers), dont 4 tests
neufs : repli par défaut, présence des deux poids pour les 11 unités, ordre
identique à celui du moteur, mention de l'écart.

---

## Sprint 39 — « تقرير للأستاذ » : sortir la production de l'application

### Le besoin, propre au contexte

En Algérie, le professeur demande des **preuves de travail** — un cahier, des
copies. Un élève qui révise avec une application n'a rien à montrer : des
écrans ne se posent pas sur un bureau. Toute la production accumulée depuis le
sprint 24 (réponses rédigées, profil d'erreurs) restait enfermée dans son
téléphone.

### Ce que la feuille contient

Une page A4, imprimable depuis « ما كتبته أنا » :

- **en-tête** : date, jours restants avant l'examen ;
- **chiffres** : réponses rédigées, exercices couverts, mots écrits, exigences
  de forme satisfaites ;
- **unités travaillées**, avec le nombre de réponses par unité ;
- **ce qui manque le plus souvent** (profil d'erreurs, en *échecs sur
  occasions*) ;
- **le détail de chaque réponse** : session officielle, consigne rédigée,
  longueur, état de forme.

### La ligne la plus importante de la feuille

> ملاحظة للأستاذ(ة): هذا التقرير لا يحمل أي علامة. « الشكل » يعني احترام بنية
> التعليمة… أما صحة المضمون العلمي فتبقى لتقديركم.

Un document qui sort de l'app et arrive entre les mains d'un correcteur doit
dire **ce qu'il ne mesure pas**. Le contrôle de forme vérifie qu'une analyse
contient des chiffres, qu'une explication contient un connecteur causal — il ne
dit rien de la justesse scientifique. Laisser croire l'inverse aurait été le
défaut le plus grave possible pour cet outil.

### Détails de mise en œuvre

Les chiffres sont **recalculés à l'affichage**, jamais stockés : une feuille
imprimée correspond toujours à l'état réel des brouillons. Les boutons
d'action portent la classe `sans-impression` — ils disparaissent du papier.

### Vérifications

`WritingReportSheet.test.tsx` — 6 tests : exactitude des chiffres face à
`writingReport()`, présence de chaque réponse, unités nommées, profil affiché,
**mention de l'absence de note**, impression et fermeture.

Suite unitaire **1675 verts / 4 skipped / 0 échec** (131 fichiers).

---

## Sprint 40 — un garde-fou supprimé sans que rien ne rougisse, et le socle tiers isolé

### 1. L'incident, et il est sérieux

`src/build/bundleBudget.test.ts` et `src/build/offlineAssets.test.ts` **ont
disparu du dépôt** entre les sprints 36 et 39. Pas d'un disque : du dépôt. La
copie de travail les perdait épisodiquement (phénomène constaté quatre fois
depuis le sprint 25), et mes `git add -A` ont fini par **committer leur
suppression**.

Pourquoi personne ne l'a vu :

- ces contrôles sont **exclus de la suite unitaire** par conception
  (ils lisent `dist/`), donc leur absence ne fait pas rougir `vitest run` ;
- `npm run test:build` continuait d'afficher **vert**… avec 4 tests au lieu
  de 13.

C'est le scénario exact contre lequel j'avais écrit, au sprint 33 : « lire le
décompte, pas la couleur ». Je l'ai écrit, puis je me suis fait prendre.

**Correctif immédiat** : les deux fichiers sont restaurés depuis le commit
`18d51db`, avec les évolutions des sprints 32 et 40 réappliquées.

**Correctif durable** : `src/data/repoIntegrity.test.ts`, qui vit *dans* la
suite unitaire et vérifie ce que la suite unitaire ne charge pas —
existence des trois fichiers de contrôle post-build, du service worker, du
manifeste, des configurations, des sources du corpus ; branchement réel de
`test:build` sur sa configuration ; et **décompte minimal de 13 contrôles
post-build**. Un garde-fou peut être supprimé sans qu'aucun garde-fou ne s'en
aperçoive : celui-ci ferme la boucle.

### 2. Le socle tiers sort du bundle applicatif

React, React-DOM, la bibliothèque d'animation et les icônes sont désormais
trois chunks séparés :

| Chunk | Taille | gzip |
|---|---|---|
| entrée applicative | 599 Ko | 142 Ko |
| `vendor-react` | 194 Ko | 61 Ko |
| `vendor-motion` | 129 Ko | 42 Ko |
| `vendor-icons` | 52 Ko | ~15 Ko |

**Le compromis, chiffré honnêtement** : au *premier* chargement, le total gzip
passe d'environ 247 Ko à 260 Ko (+13 Ko) — trois fichiers compressent moins
bien qu'un seul. En revanche, à chaque *mise à jour* de l'application, l'élève
ne re-télécharge que les **142 Ko** de l'entrée applicative au lieu de 247 Ko :
le socle, qui ne change pas, reste dans le cache du navigateur et du service
worker. Pour un public en 3G qui reçoit plusieurs mises à jour d'ici juin, le
solde est largement positif.

Plafond d'entrée resserré en conséquence : **1 100 → 700 Ko**, avec un test
supplémentaire vérifiant que le socle n'est pas *dupliqué* dans l'entrée.

### Vérifications

Suite unitaire **1679 verts / 4 skipped / 0 échec** (132 fichiers) ; contrôles
post-build **14 verts** — décompte lu, pas seulement la couleur.

---

## Sprint 41 — des sujets blancs composés à partir de ce qui est tombé

### L'idée

L'app avait trois BAC blancs écrits à la main. Le corpus contient **59
exercices réels** sur dix sessions : de quoi composer une infinité de sujets
d'entraînement **sans inventer une ligne d'énoncé**. `composeMockExam(n)`
sélectionne trois exercices existants et les présente dans l'ordre officiel.

### Les règles de composition, toutes testées

1. **barème officiel** : 5 / 7 / 8 points, total 20, durée 4 h 30 ;
2. **trois unités porteuses distinctes** — un sujet ne teste jamais trois fois
   la même unité ;
3. **trois sessions distinctes** — on ne rejoue pas un sujet entier ;
4. **tirage déterministe** : le sujet n° 12 est le même sur tous les appareils.
   Un professeur peut dire « faites le sujet 12 », et un élève retrouve le sien
   après avoir fermé l'app. Le numéro par défaut est celui **du jour** :
   toute la classe travaille le même sans se concerter ;
5. **pondéré par la pression mesurée**, mais sans exclusive : U4 et U1
   reviennent plus souvent que la géologie — et la géologie tombe quand même,
   parce qu'un sujet blanc qui ne la ferait jamais tomber **mentirait sur
   l'épreuve**. Un test vérifie les deux moitiés de cette phrase.

Repli explicite : si les contraintes ne laissent aucun candidat, on relâche
d'abord la session, puis l'unité — plutôt que de rendre un sujet à deux
exercices.

### Dans l'écran

Bouton « ركّب موضوعاً تجريبياً » dans les annales. Le sujet affiche, pour
chaque exercice : barème, unité, idée, **supports réels**, **consignes
réelles**, et un bouton qui ouvre l'atelier d'écriture sur cet exercice. La
feuille s'imprime (les boutons disparaissent), et porte la mention que les
énoncés sont **résumés pour l'entraînement** — l'original reste la session
citée.

### Vérifications

`mockExam.test.ts` — 12 tests (barème, variété sur 40 sujets, déterminisme,
numéros aberrants bornés, numéro du jour stable) ; `MockExamPanel.test.tsx` — 6 ;
2 tests d'intégration côté annales.

Suite unitaire **1699 verts / 4 skipped / 0 échec** (134 fichiers).

### Le garde-fou du sprint 40 a servi dès ce sprint

En début de session, `repoIntegrity.test.ts` a **échoué** : les deux fichiers
de contrôle post-build avaient de nouveau disparu de la copie de travail. Cette
fois, la perte a été signalée en quelques secondes au lieu de passer quatre
sprints inaperçue — et restaurée avant tout commit.

---

## Sprint 42 — le corrigé officiel, à un clic mais après avoir écrit

### Ce qui manquait à la chaîne

L'élève lit l'idée d'un exercice, écrit sa réponse, reçoit un contrôle de
forme… puis n'a **aucun moyen de vérifier le fond**. L'app ne publie pas de
corrigé — ce serait reproduire un contenu qui ne lui appartient pas, et donner
une réponse là où il faut un raisonnement. Mais elle peut envoyer à la source.

### Les dix corrigés officiels, vérifiés un par un

`BAC_SESSION_SOURCES` porte désormais, pour chaque session, **le sujet ET le
corrigé**. Aucune URL n'a été devinée par motif : quatre ont été ouvertes
directement pendant ce sprint (2022, 2023, 2024, 2025), les autres proviennent
du lien « تصحيح الموضوع » lu dans la page du sujet. Détail qui justifie cette
prudence : la session **2017 ne suit pas le motif des autres**
(`correction-bac-se-science-2017` et non `correction-bac-science-2017-se`) — un
lien construit par motif aurait été mort.

Pour 2026, sujet et corrigé sont le **même PDF** chez DzExams : le test
l'autorise explicitement pour cette seule année, et exige une URL distincte
partout ailleurs.

### Où le lien apparaît, et comment il est formulé

Dans l'atelier d'écriture, sous le titre de l'exercice :

> الموضوع الرسمي 2023 · الإجابة النموذجية — **راجعها بعد أن تكتب، لا قبل.**

La dernière proposition est le cœur du sprint. Un corrigé accessible avant la
rédaction détruit l'exercice ; le même corrigé, ouvert après, est la seule
façon de vérifier le fond. Les liens s'ouvrent dans un **nouvel onglet**
(vérifié par test) pour ne pas perdre le brouillon en cours.

La ligne de barème des annales gagne le même couple de liens.

### Vérifications

Suite unitaire **1703 verts / 4 skipped / 0 échec** (134 fichiers) ; contrôles
post-build **14 verts**. Les fichiers de contrôle post-build, à nouveau absents
de la copie de travail en début de sprint, ont été restaurés — `repoIntegrity`
les signale désormais immédiatement.

---

## Sprint 43 — 4 h 30 : le chronomètre qui dit où l'on devrait en être

### La cause de perte de points qui n'est pas une lacune

Le dépouillement des chaînes (sprints 1-8) et les conseils de professeurs
convergent sur un point qui n'a rien à voir avec les connaissances : **le
temps**. L'élève soigne l'exercice 1 — 05 points, de la restitution — et arrive
épuisé sur l'exercice 3, qui en vaut 08 et qui départage.

### Le budget, calculé et affiché

`src/data/examTimer.ts` répartit les 4 h 30 au prorata du barème, après **deux
réserves explicites** : 15 minutes de lecture du sujet avant d'écrire la
première ligne, 15 minutes de relecture finale. Sur un sujet 5/7/8, cela donne
environ **60 / 84 / 96 minutes**.

Deux décisions de calcul valent d'être notées :

- le **reliquat d'arrondi va au dernier exercice** — celui qui pèse le plus,
  donc celui qui doit absorber l'imprécision ;
- les créneaux **s'enchaînent sans trou ni chevauchement**, vérifié par test :
  un budget qui laisse des minutes orphelines n'est pas un budget.

### Ce que l'élève voit

Dans le sujet blanc : un chronomètre (démarrer / pause / remise à zéro), le
temps écoulé sur 04:30, la **phase** en cours — قراءة الموضوع, التحرير,
المراجعة النهائية, انتهى الوقت — et « يُفترض أن تكون في التمرين 2 ».

Chaque exercice affiche son créneau (« de 00:15 à 01:15 »), et **passe au rouge
avec le retard chiffré** dès que l'horloge l'a dépassé : « تأخّرت 10 دقائق عن
هذا التمرين ». C'est l'information que personne ne donne pendant une épreuve
blanche faite seul à la maison.

### Tests

`examTimer.test.ts` — 11 tests de logique pure (réserves respectées,
progression du budget avec les points, enchaînement des créneaux, barème vide,
durée réduite pour un devoir de 2 h, phases, retard, format `00:00`) ;
`MockExamPanel.test.tsx` — 4 tests d'horloge avec temps simulé (avance minute
par minute, changement de phase, retard affiché, pause et remise à zéro).

Suite unitaire **1718 verts / 4 skipped / 0 échec** (135 fichiers).

---

## Sprint 44 — le chronomètre comptait les ticks : deux bugs corrigés

### Le défaut, introduit au sprint précédent

Le chronomètre du sprint 43 incrémentait un compteur à chaque `setInterval`.
Deux conséquences, invisibles au développement et systématiques chez l'élève :

1. **les navigateurs mobiles ralentissent les onglets en arrière-plan** —
   souvent un tick par minute au mieux, parfois aucun. L'élève qui consulte
   autre chose vingt minutes retrouvait un chronomètre **en retard**, donc un
   budget faux et des alertes de retard silencieuses ;
2. **un rechargement remettait tout à zéro**, au milieu d'une épreuve de 4 h 30.

### Le correctif : on ne compte plus le temps, on le lit

`src/data/examSession.ts` mémorise un **horodatage de départ** et un cumul ; le
temps écoulé se déduit de l'horloge. Les ticks ne servent plus qu'à rafraîchir
l'affichage (toutes les 15 secondes). La session est persistée : sujet en cours,
cumul, instant de reprise.

Décisions prises au passage :

- **changer de sujet remet le chronomètre à zéro** — sinon le budget par
  exercice ment sur un sujet qu'on vient d'ouvrir ;
- **une horloge qui recule** (changement d'heure, correction NTP) ne produit
  jamais de durée négative ;
- double démarrage et double pause sont **idempotents** : un double-clic ne
  crée pas de temps.

### Les tests qui prouvent la correction

Deux d'entre eux valaient à eux seuls le sprint :

```
it('compte le temps passé en arrière-plan, sans aucun tick', …)
  → vi.setSystemTime(+25 min) puis un seul tick de 15 s ⇒ affiche 00:25

it('reprend le chronomètre après un rechargement, temps compris', …)
  → 40 minutes, unmount, remontage ⇒ affiche toujours 00:40
```

C'est exactement ce que l'ancienne implémentation ne pouvait pas faire, et ce
qu'aucun test du sprint 43 ne vérifiait : mes tests avançaient les minuteurs,
donc ils validaient un compteur qui, en vrai, ne tournait pas.

### Vérifications

`examSession.test.ts` — 12 tests (arrière-plan, pauses cumulées, idempotence,
horloge qui recule, persistance, contenu corrompu, stockage refusé, remise à
zéro, changement de sujet) ; `MockExamPanel.test.tsx` — 3 tests d'intégration
supplémentaires.

Suite unitaire **1733 verts / 4 skipped / 0 échec** (136 fichiers).

---

## Sprint 45 — audit des minuteurs : les quatre autres avaient le même défaut

### De la correction ponctuelle à l'audit

Le sprint 44 a corrigé le chronomètre d'épreuve, qui comptait les ticks au lieu
de lire l'horloge. La question suivante s'imposait : **combien d'autres ?**
Réponse : **quatre**, soit tous les autres minuteurs de l'application.

| Minuteur | Effet du défaut |
|---|---|
| Quiz (15 min) | onglet en arrière-plan ⇒ **temps supplémentaire offert** |
| Compilateur, étape 4 (3 min) | même chose, sur un exercice chronométré |
| Compilateur, drill 60 s **noté** | **le score dépendait de l'attention du navigateur** |
| Atelier de combat (sprint 45 min / mode coach) | temps faux dans les deux modes |

Le cas du drill de 60 secondes est le plus sérieux : il est **noté et
enregistré** (`recordDrillResult`). Un élève qui basculait d'onglet obtenait
une minute « longue » et un meilleur score, sans tricher volontairement.

### Le correctif, une fois pour toutes

`src/hooks/useWallClock.ts` expose deux hooks :

- `useCompteARebours({ dureeSec, actif, onFin })` — le restant est **calculé**
  depuis une échéance, jamais décrémenté ; `onFin` ne se déclenche qu'une fois ;
- `useChronometre(actif)` — l'écoulé est calculé depuis un horodatage de départ.

Les deux **resynchronisent immédiatement au retour sur l'onglet**
(`visibilitychange`), sans attendre le tick suivant : revenir après trois
minutes affiche la bonne valeur tout de suite, ou la fin.

Les quatre composants ont été convertis. Il ne reste **aucun `setInterval` qui
compte du temps** dans `src/components` — le seul restant sert à rafraîchir un
affichage.

### Tests

`useWallClock.test.tsx` — 8 tests, dont les deux qui décrivent le défaut
d'origine : « rattrape le temps passé en arrière-plan dès le premier tick »
(45 s d'horloge, un seul tick ⇒ 15 s restantes) et « ne prolonge pas un
exercice noté » (5 min d'horloge ⇒ 0, pas un compteur qui traîne).

Un test du sprint 41 a dû être corrigé au passage : il exigeait que deux sujets
blancs voisins diffèrent **par leur premier exercice**, alors que les
contraintes d'unité et de session peuvent légitimement le conserver. Le test
vérifie désormais que **le sujet** diffère — l'assertion d'origine était plus
stricte que la règle qu'elle prétendait protéger.

### Vérifications

Suite unitaire **1741 verts / 4 skipped / 0 échec** (137 fichiers).

---

## Sprint 46 — « نسخة احتياطية » : tout le travail tenait dans un seul navigateur

### Le risque, concret pour ce public

Progression, flashcards, plan de révision, **brouillons de l'atelier**, session
d'épreuve : tout vit dans le `localStorage` d'un navigateur. Autrement dit,
tout disparaît si l'élève :

- change de téléphone — fréquent, surtout sur un appareil partagé dans une
  fratrie ;
- vide le cache « pour libérer de la place » — réflexe courant sur un appareil
  saturé ;
- passe du navigateur à l'application installée, qui peut ne pas partager le
  même stockage.

Des semaines de rédaction peuvent partir en une manipulation. Aucune
fonctionnalité de l'app ne protégeait contre ça.

### Ce qui a été fait

`src/data/backup.ts` produit un **fichier JSON versionné** (`kunz.backup.v1`)
contenant tout ce qui appartient à l'application, et sait le relire.

Trois décisions de sécurité, toutes testées :

1. **les jetons d'authentification ne sont jamais exportés**
   (`boussole_token`, `boussole_teacher_token`) — une sauvegarde partagée par
   messagerie ne doit pas donner accès à un compte ;
2. **un schéma inconnu est refusé** plutôt qu'interprété : une sauvegarde
   produite par une version future pourrait contenir des formats que ce code
   lirait de travers ;
3. **les clés étrangères présentes dans un fichier sont ignorées ET comptées**,
   jamais écrites — un fichier bricolé ne peut pas injecter un jeton.

Le stockage plein pendant une restauration renvoie une erreur explicite
(« مساحة التخزين ممتلئة ») au lieu d'un succès partiel silencieux.

### Dans l'écran

Un panneau en bas de « تقدمي » : combien d'éléments seraient emportés, un
bouton **« احفظ نسخة »** (téléchargement daté `kunz-sauvegarde-2026-04-12.json`)
et un bouton **« استعد نسخة »**. Le texte ne parle jamais de `localStorage` :
il parle d'un fichier qu'on enregistre et qu'on rouvre.

### Vérifications

`backup.test.ts` — 11 tests (périmètre, exclusion des jetons, aller-retour
fidèle, fichier illisible, schéma étranger, clés ignorées, quota, stockage
inaccessible) ; `BackupPanel.test.tsx` — 5 tests d'interface, dont le refus
d'un fichier étranger **sans écraser la progression existante**.

Suite unitaire **1757 verts / 4 skipped / 0 échec** (139 fichiers).

---

## Sprint 47 — accessibilité : trois défauts que l'œil ne voit pas

### Portée assumée

Ce sprint ne prétend pas à un audit complet (contraste, parcours clavier
intégral, essais avec un lecteur d'écran réel). Il installe un **garde-fou
mécanique** sur trois défauts fréquents, invisibles à l'œil, et qui rendent une
interface inutilisable pour qui ne la voit pas :

1. un **bouton sans nom accessible** — le cas typique du bouton à icône seule,
   qu'un lecteur d'écran annonce simplement « bouton » ;
2. un **champ sans étiquette** ni `aria-label` ;
3. une **image sans `alt`**.

S'y ajoute une vérification propre à cette application : chaque écran doit
déclarer **`dir="rtl"`**, sans quoi la ponctuation arabe et les nombres
s'affichent dans le désordre.

Le test balaie les sept écrans produits depuis le sprint 15.

### Ce qu'il a trouvé, dès la première exécution

| Écran | Défaut |
|---|---|
| Sujet blanc | bouton **« remise à zéro du chronomètre »** : icône seule, aucun nom |
| Plan de révision | les **deux curseurs** (jours, minutes) : `<label>` présent mais **non associé** à l'`<input>` |
| Sauvegarde | le **champ de fichier** masqué, ouvert par un bouton : aucun nom |

Le cas des curseurs mérite d'être souligné : le libellé était bien affiché à
l'écran, et paraissait donc correct. Mais sans `htmlFor`/`id`, l'association
n'existe pas pour la technologie d'assistance — un élève malvoyant entendait
« curseur, 14 », sans savoir de quoi.

Les trois sont corrigés (`aria-label` explicites en arabe, `htmlFor`/`id` sur
les curseurs).

### Pourquoi ce test restera utile

Il ne fige pas un état : il s'exécute sur des écrans **rendus**, donc tout
nouveau bouton à icône ajouté demain dans l'un des sept écrans le fera échouer,
avec le `data-testid` du fautif dans le message. C'est le même principe que le
budget de bundle ou l'atteignabilité du contenu : **une règle vérifiée en
continu vaut mieux qu'une revue ponctuelle.**

### Vérifications

21 contrôles d'accessibilité verts ; suite unitaire **1778 verts / 4 skipped /
0 échec** (140 fichiers).

---

## Sprint 48 — l'audit d'accessibilité s'étend aux écrans d'évaluation

### Extension du garde-fou

Le sprint 47 couvrait sept écrans récents. Ce sprint en ajoute **quatre**,
choisis pour une raison précise : ce sont ceux où l'élève **produit** ou est
**évalué** — l'atelier d'écriture, le rapport destiné au professeur, la
micro-capsule et **le quiz**. Un défaut d'accessibilité y coûte plus cher
qu'ailleurs : il empêche de composer une réponse ou de répondre à une question
notée.

Onze écrans sont désormais vérifiés à chaque exécution de la suite.

### Ce que l'extension a trouvé

Une seule violation — mais sur le quiz, l'écran le plus utilisé de
l'application : **aucune déclaration `dir="rtl"`**.

Le cas est intéressant parce qu'il ne se voyait pas : `index.html` porte
`dir="rtl"` sur `<html>`, et l'héritage faisait le travail. Le défaut
n'apparaît que lorsque l'écran est rendu **hors de ce contexte** — aperçu,
feuille d'impression, intégration dans un conteneur LTR. Alors l'ordre des
nombres, de la ponctuation et des unités (« 15:00 », « 80 % », « pH = 2 »)
devient illisible.

Correctif : `dir="rtl"` explicite sur la racine du quiz, avec le commentaire
qui explique pourquoi la ceinture s'ajoute aux bretelles. Le test porte
désormais la même justification, pour qu'un futur relecteur ne « simplifie »
pas la règle en la supprimant.

### Portée honnête, rappelée

Ces 33 contrôles ne remplacent pas un essai avec lecteur d'écran, ni une
mesure de contraste, ni un parcours clavier complet — ils ferment
mécaniquement trois familles de défauts et le sens de lecture. C'est un
plancher, pas une conformité.

### Vérifications

33 contrôles d'accessibilité verts ; suite unitaire **1790 verts / 4 skipped /
0 échec** (140 fichiers).

---

## Sprint 49 — sept cartes de l'accueil étaient inaccessibles au clavier

### Le défaut le plus répandu des interfaces « à cartes »

Un `onClick` posé sur un `<div>` produit une cible **impossible à atteindre au
clavier** : pas de focus, pas d'activation par Entrée ou Espace, rien
d'annoncé par un lecteur d'écran. Visuellement, tout va bien — la carte
réagit à la souris et au doigt. Pour un élève qui navigue au clavier, la
fonction **n'existe pas**.

Recensement au début du sprint : **18 occurrences** dans `src/components`.

### Ce qui a été corrigé

Les écrans d'entrée en priorité, parce qu'ils commandent tout le reste :

| Écran | Cibles converties |
|---|---|
| Tableau de bord | **10** (méthodologie, cartes mentales, animations, série, défi 3 min, lacune, compte à rebours BAC, question surprise, badges, bandeau de série) |
| Carte « برنامج اليوم » | 1 — de mon propre code du sprint 29 |

Conversion en `<button type="button">` avec `w-full text-right`, ce qui
préserve la mise en page en grille.

> **Rectificatif (sprint 50)** : ce paragraphe annonçait « 11 des 18 cibles »
> et « sept cibles subsistent ». Le compte était **inversé** : 7 cibles
> converties, 11 restantes. Le décompte réel figure au sprint 50.

### La dette restante est nommée, pas cachée

Sept cibles subsistent dans six écrans anciens (`SplashView`, `StatsView`,
`RevisionView`, `MeftahView`, `DailyGoalWidget`, `MethodologyCompilerView`) :
leur conversion demande une reprise de mise en page qui dépasse ce sprint.

Elles sont inscrites **nommément** dans une table `DETTE_CONNUE`, avec un test
qui interdit de la dépasser : tout nouveau `<div onClick>` fait échouer la
suite, et le total ne peut que descendre. Inscrire une dette n'est pas
l'excuser — c'est l'empêcher de grandir.

### Le test lit les sources, et c'est voulu

Un gestionnaire de clic n'apparaît pas dans le DOM rendu : c'est l'**écriture**
qu'il faut corriger, donc c'est l'écriture qu'on inspecte. Le test vérifie
aussi son propre détecteur sur deux cas fabriqués (`<div onClick>` ⇒ 1,
`<button onClick>` ⇒ 0), pour ne pas devenir un test qui passe parce qu'il ne
voit plus rien.

### Vérifications

Suite unitaire **1794 verts / 4 skipped / 0 échec** (141 fichiers).

---

## Sprint 50 — la dette clavier tombe à zéro (et un rectificatif)

### D'abord, l'erreur du sprint précédent

Le compte-rendu du sprint 49 annonçait « 11 des 18 cibles converties, 7
restantes ». C'était **l'inverse** : 7 converties, 11 restantes. L'erreur
venait de moi, pas du test — lequel affichait bien la dette réelle. Le
paragraphe fautif porte désormais un rectificatif : un journal d'audit qui se
corrige vaut mieux qu'un journal flatteur.

### Les 11 restantes, traitées

| Écran | Cible | Traitement |
|---|---|---|
| `StatsView` | tuile de série, tuile XP | `<button>` |
| `RevisionView` | **la carte qui se retourne** | `<button>` — c'est le geste central de la révision, il était à la souris seulement |
| `DailyGoalWidget` | pastille d'objectif atteint | `<button disabled>` quand l'objectif n'est pas atteint : un élément inerte ne doit pas occuper l'ordre de tabulation |
| `MeftahView` | deux en-têtes d'accordéon | `<button>` |
| `MethodologyCompilerView` | en-tête de fiche de verbe, critère d'évaluation | `<button>` |
| `SplashView` | fond de la fenêtre de confidentialité | **conservé en `div`**, avec équivalent clavier : touche **Échap** |

Le dernier cas mérite son exception, écrite dans le code et dans le test :
transformer le fond d'une fenêtre modale en bouton le placerait dans l'ordre
de tabulation **avant** le contenu de cette fenêtre — l'accessibilité y
perdrait. L'équivalent clavier correct est `Escape`, désormais branché et
vérifié par test.

Le second « défaut » de `SplashView` n'en était pas un : un `onClick` qui ne
fait qu'appeler `stopPropagation` n'est pas une commande.

### État final

**Zéro** cible cliquable non accessible au clavier dans les écrans de travail.
La table `DETTE_CONNUE` ne contient plus que les deux cas justifiés du splash,
et le test interdit d'en ajouter.

Un incident de parcours : un script de conversion automatique a cassé
`MeftahView.tsx` (erreur de syntaxe) ; `tsc` l'a signalé immédiatement, le
fichier a été restauré depuis la branche distante et converti par ancre
explicite. C'est la raison d'avoir `npm run lint` (tsc) dans la boucle avant
chaque exécution de tests.

### Vérifications

Suite unitaire **1795 verts / 4 skipped / 0 échec** (141 fichiers).

---

## Sprint 51 — atteindre une cible au clavier ne sert à rien si on ne la voit pas

### Le corollaire oublié des sprints 49-50

Rendre les cartes focalisables était nécessaire ; ce n'était pas suffisant. Un
relevé du code montre **52 endroits** où l'application pose
`focus:outline-none` — la pratique courante pour supprimer le contour bleu du
navigateur, jugé « moche » — **sans rien mettre à la place**. Pour qui navigue
au clavier, le curseur devient alors invisible : on tabule à l'aveugle.

### Une parade globale plutôt que 52 retouches

Une règle unique dans `src/index.css`, avec deux choix techniques qui font tout
l'intérêt :

1. **`:focus-visible` et non `:focus`** — l'indicateur n'apparaît qu'à la
   navigation clavier, jamais après un clic souris. C'est ce qui permet de le
   rendre franc sans gêner l'usage tactile, largement majoritaire ici. Un test
   vérifie qu'aucune règle `:focus` globale ne subsiste ;
2. **`box-shadow` plutôt que `outline`** — `outline-none` de Tailwind
   neutralise `outline` mais laisse `box-shadow` intact. L'indicateur
   réapparaît donc **y compris sur les 52 éléments qui l'avaient supprimé**,
   sans toucher à leur code.

S'y ajoutent un halo blanc (ou sombre) sous l'anneau vert pour rester lisible
sur les deux thèmes, et un `z-index` pour que le focus ne soit pas rogné par un
conteneur.

### Le garde-fou

`focusVisible.test.ts` — 5 contrôles : la règle existe, elle utilise
`box-shadow`, elle ne se déclenche pas à la souris, elle est adaptée au thème
sombre, et **le nombre d'endroits qui suppriment le contour ne peut
qu'augmenter à la baisse** (plafond 52).

### Vérifications

Suite unitaire **1800 verts / 4 skipped / 0 échec** (142 fichiers) ; contrôles
post-build **14 verts**.

---

## Sprint 52 — la banque de capsules était désalignée des priorités mesurées

### Le constat, en une ligne de données

Le sprint 37 a établi le classement réel des unités sur dix sessions. La
répartition des 24 micro-capsules ne l'avait jamais suivi :

| Unité | Part des points | Capsules avant | Capsules après |
|---|---|---|---|
| **U1 تركيب البروتين** | 19,0 % | 3 | **5** |
| **U5 الاتصال العصبي** | 18,7 % | 2 | **4** |
| U2 بنية/وظيفة | 5,6 % | 3 | 3 |

Autrement dit : l'unité qui mène 19 % des points et apparaît dans 17 exercices
sur 59 était **moins outillée** que celle qui en mène 5,6 %. Ce n'était pas une
erreur de jugement — c'était l'héritage d'un classement fondé sur la difficulté
ressentie, corrigé au sprint 37 sans que le contenu suive.

### Les quatre capsules ajoutées

**U1** · « كيف أحدّد بالضبط أين يتدخّل دواء على تركيب البروتين؟ » — le montage
le plus fréquent du corpus (7 exercices), avec la règle de lecture des milieux
et des marqueurs radioactifs · « كيف أنتقل من عدد النيكليوتيدات إلى عدد
الأحماض الأمينية دون خطأ؟ » — le calcul tombé en 2017, et l'erreur de diviser
par 3 un ADN double brin.

**U5** · « كيف أفرّق بين قناة فولطية و قناة مرتبطة بربيطة؟ » — la confusion qui
coûte l'intégralité des points d'une question de mécanisme · « متى يولّد
العصبون المحرك كمون عمل؟ » — le seuil et la sommation, mis en cause dans les
sujets 2017, 2022 et 2024.

Chacune respecte le contrat d'écriture vérifié depuis le sprint 11 : une seule
idée, un titre qui est une question, l'**erreur nommée**, et une
auto-évaluation immédiate.

### Une règle relevée, en connaissance de cause

Le verrou exigeait que la collection se lise en **moins de 30 minutes**. Avec
28 capsules, le total passe à 31. Plutôt que de raboter les durées jusqu'à
faire rentrer le chiffre, j'ai relevé le plafond à **35 minutes** en écrivant
pourquoi — et en fixant la limite suivante : au-delà, il faudra **scinder par
domaine** plutôt que continuer à relever le plafond. Une règle qu'on déplace
sans le dire n'est plus une règle.

Un test nouveau empêche le désalignement de revenir : U1 et U5 doivent rester
au moins aussi outillées que U2, et U4 garder ses quatre capsules.

### Vérifications

Suite unitaire **1801 verts / 4 skipped / 0 échec** (142 fichiers).

---

## Sprint 53 — le même alignement, appliqué aux schémas et à l'enzymologie

### Le tableau complet, une fois posé

Après le sprint 52, j'ai croisé **les trois banques** avec la pression mesurée :

| Unité | Part des points | Capsules | Schémas | Situations |
|---|---|---|---|---|
| U4 | 20,8 % | 4 | 4 | 5 |
| U1 | 19,0 % | 5 | 2 | 3 |
| U5 | 18,7 % | 4 | 2 | 3 |
| **U3** | **14,7 %** | **2** | 2 | 3 |
| **U6** | **12,9 %** | 3 | **1** | 2 |
| U2 | 5,6 % | 3 | 1 | 2 |

Deux creux nets : **U3**, la « clé cachée » (15 exercices sur 59, mais deux
capsules), et **U6**, un seul schéma alors que les sujets 2017, 2018 et 2026
réclament explicitement un « رسم تخطيطي وظيفي » du bilan des deux phases.

### Ce qui a été produit

**Deux capsules U3**, toutes deux nées d'exercices réels :

- « كل جزيء يلمس الأنزيم هل هو مثبّط؟ » — la réponse est **non**, et le sujet
  2026 est bâti là-dessus : le resvératrol **augmente** l'activité de SIRT1, le
  NAD⁺ en est le cofacteur obligatoire. Un élève entraîné à ne voir que des
  inhibiteurs perd l'exercice entier ;
- « كيف أستثمر نمذجة الموقع الفعال بدل أن أصفها؟ » — nommer les radicaux **avec
  leurs numéros** (His215, Asp424…), la liaison, puis l'effet chiffré sur Vmax.

**Un schéma U6** : le bilan des deux phases, avec la grille qui compte ce que
le correcteur compte — les flèches. Pièges consignés : dessiner l'ATP dans les
deux sens, oublier le retour d'ADP + Pi (le schéma cesse alors d'être
fonctionnel), placer la fixation du CO₂ sur le thylakoïde.

### Un détail qui a failli passer

Mes deux capsules pointaient vers des `lessonId` inexistants
(`active_site_relation`, `enzyme_inhibitors` — ce sont des identifiants
d'**étapes**, pas de leçons). Le verrou du sprint 11 l'a vu immédiatement :
« tout lessonId cité est une leçon active réelle ». Corrigé vers
`d1-u3-l1-enzyme` et `d2-u6-l3-calvin`. Sans ce test, deux liens morts
seraient partis en production.

### Vérifications

Suite unitaire **1801 verts / 4 skipped / 0 échec** (142 fichiers) — dont la
contrainte d'atteignabilité : le nouveau schéma est bien programmé par le plan
de révision.

---

## Sprint 54 — bilan des livrables demandés, et un écart assumé

### Pourquoi faire ce point maintenant

Cinquante sprints séparent la demande initiale — « auditer l'application pour
faire sortir les manques selon *Les 5 leçons à travailler en premier* » — de
l'état actuel. Un journal d'audit dit ce qui a été fait ; il ne dit pas ce qui
**tient encore**. Nouveau document : `docs/analyse/ETAT_LIVRABLES_5_LECONS.md`,
qui reprend chaque livrable prescrit et son état.

### Le résultat

| Leçon | Livrables demandés | État |
|---|---|---|
| pHi / acides aminés (U2) | micro-fiches, simulateur pH → charge → migration | ✅ complet, **plus** l'exercice officiel 2018 |
| Coopération immunitaire (U4) | schéma-bilan, 3 exercices BAC | ✅ complet — **12** exercices U4 dans le corpus |
| Inhibiteurs enzymatiques (U3) | comparatif, atelier 6 courbes | ✅ complet, renforcé au sprint 53 |
| CMH / ABO + prérequis 2AS (U4) | module de 15 min | ✅ complet |
| Phase photochimique (U6) | synthèse d'unité, **5 micro-fiches** | ⚠️ **3 sur 5** |

**Un seul écart, et il est écrit** : trois micro-fiches U6 au lieu de cinq. Je
ne l'ai pas comblé à la va-vite, et la raison est chiffrée : U6 pèse 12,9 % des
points mais ne tombe que sur **6 sessions sur 10**, quand U1 (19 %) et U5
(18,7 %) tombent sur les dix. Les capsules des sprints 52-53 sont donc allées
à U1, U5 et U3 d'abord. L'écart reste ouvert et inscrit dans le document.

### Le document ne peut pas devenir faux en silence

`src/data/livrablesPrioritaires.test.ts` — 12 contrôles qui vérifient
l'existence réelle de chaque pièce citée : les quatre étapes du parcours pHi,
les trois de la coopération, **les six** courbes de l'atelier d'inhibition, les
capsules CMH/ABO, les deux schémas U6, une carte mentale par unité. Si un
refactoring supprime l'atelier des courbes, c'est le test qui le dit — pas un
lecteur du document six mois plus tard.

Détail technique : les identifiants d'étapes ne vivent pas au premier niveau
des leçons actives (ils sont dans `choices[]`, `steps[]`, ou plus bas). Plutôt
que de suivre chaque forme — et de casser au prochain type de bloc — le test
parcourt l'objet **en profondeur** et collecte toute propriété `id`.

### Vérifications

Suite unitaire **1813 verts / 4 skipped / 0 échec** (143 fichiers).

---

## Sprint 55 — le dernier livrable manquant, et une règle tenue

### Les deux micro-fiches U6

L'audit initial en prescrivait cinq ; il y en avait trois. Les deux dernières
traitent les erreurs que les sujets sanctionnent réellement :

- **« لماذا يتوقف تثبيت CO₂ في الظلام رغم وجود الأنزيم؟ »** — l'élève conclut
  que l'obscurité « abîme » la Rubisco. La manipulation classique le
  contredit : ajouter de l'ATP et un transporteur réduit **relance la fixation
  dans le noir**. S'y ajoute la cause découverte en 2024 (CA1P qui occupe le
  site actif) ;
- **« أي مؤشر يقيس أي مرحلة؟ »** — O₂, DCPIP et fluorescence mesurent la phase
  photochimique ; CO₂, matière organique et activité Rubisco mesurent la phase
  chimique. Et la fluorescence est de l'énergie **non convertie** : elle monte
  quand la chaîne est coupée.

**Les cinq livrables des cinq leçons prioritaires sont désormais tous
couverts** (`ETAT_LIVRABLES_5_LECONS.md` mis à jour, et le test exige
maintenant 5 capsules U6 — le nombre est la commande, pas une estimation).

### La règle du sprint 52, tenue plutôt que contournée

Au sprint 52 j'avais relevé le plafond de lecture de 30 à 35 minutes **en
écrivant la limite suivante** : « au-delà, il faudra scinder par domaine
plutôt que continuer à relever le plafond ». Avec 32 capsules, la collection
atteint 35,5 minutes.

La règle a donc changé de nature au lieu de changer de valeur : le verrou
porte désormais sur le **domaine**, qui est l'unité de révision réelle d'un
élève — on révise « les protéines », pas « toutes les capsules ». Plafond
25 minutes par domaine, et un garde-fou global à une heure.

Pourquoi 25 et non 20 : le domaine 1 porte **cinq unités et ~73 % des points**
de l'épreuve ; le plafonner comme un domaine de trois unités reviendrait à
appauvrir le bloc le plus déterminant. La justification est écrite dans le
test, à côté du chiffre.

### Vérifications

Suite unitaire **1814 verts / 4 skipped / 0 échec** (143 fichiers).

---

## Sprint 56 — la session 2016, et la découverte que le barème n'est pas éternel

### Onze sessions consécutives : 2016 → 2026

Six exercices de plus, et un corpus qui passe à **65 exercices**. La session
2016 apporte deux pièces que le corpus n'avait pas :

- **l'ATP synthase disséquée en cinq milieux** (sujet 2) : milieu acide/basique,
  retrait de la tête (س), FAL sur le site de fixation de l'ADP, DCCD sur le
  canal (ع). C'est la démonstration expérimentale complète du couplage
  chimiosmotique — jusqu'ici le corpus n'avait que des exercices de bilan ;
- **le benzodiazépine sur le réflexe myotatique** (sujet 2) : un médicament qui
  ne remplace pas le GABA mais **augmente sa fixation** sur le canal. Le même
  piège conceptuel que SIRT1 en 2026, dix ans plus tôt, côté nerveux.

S'y ajoutent Anagène sur quatre gènes (U1), IL2 et souris mutées CMH II (U4),
l'amylase avec Trp58/Asp197 et le Glucobay (U3), et la comparaison
thylakoïde / mitochondrie (U7).

### Le fait que le dépouillement a révélé

**Le barème 5 / 7 / 8 n'est pas éternel.** En 2016, le sujet 1 valait
**6 / 5 / 9** et le sujet 2 **6 / 7 / 7**. Le format actuel s'est stabilisé à
partir de 2017.

Mon verrou exigeait « 5/7/8 pour tout exercice ». Deux options : fausser un
barème officiel pour faire passer un test, ou corriger le test. La règle porte
désormais sur **les sessions ≥ 2017**, et les sessions antérieures sont
vérifiées sur ce qui, lui, n'a pas bougé : **un sujet vaut 20 points**. Le
barème du 3ᵉ exercice de 2016 (09 points) est déduit par complément — son
en-tête est illisible dans la source, et le code le dit.

### Le test de synchronisation a fait son travail

Ajouter 2016 a immédiatement fait échouer
`prioritesMesurees.sync.test.ts` : « points U4 : attendu 82, obtenu 87 ». Le
document de priorités a donc été mis à jour **parce qu'un test l'a exigé**, pas
parce que j'y ai pensé. C'était exactement sa raison d'être (sprint 37).

### Classement recalculé sur onze sessions

| Unité | Points menés | Part | Annoncé | Apparitions |
|---|---|---|---|---|
| U4 | 87 | 20,0 % | 13 % | 14 |
| U1 | 81 | 18,6 % | 10 % | **18** |
| U5 | 81 | 18,6 % | 16 % | 12 |
| U3 | 64 | 14,7 % | 13 % | 16 |
| U6 | 51 | 11,7 % | 20 % | 9 |
| **U7** | **29** | **6,7 %** | 19 % | 6 |
| U2 | 22 | 5,1 % | 9 % | 14 |

**U7 double** (3,3 % → 6,7 %) grâce aux deux exercices d'énergétique de 2016 —
et reste malgré tout à un tiers de son poids annoncé, sur 5 sessions sur 11.
Le tableau de tête, lui, ne bouge pas.

### Vérifications

Suite unitaire **1815 verts / 4 skipped / 0 échec** (143 fichiers).
