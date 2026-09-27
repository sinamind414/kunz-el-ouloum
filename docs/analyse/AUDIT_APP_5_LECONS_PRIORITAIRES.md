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
| 1 | `src/data/activeLessons.ts` + `quizCorpus.ts` | `prerequis2AS_genetique` (+8 QCM de diagnostic) | contenu | S |
| 2 | `src/data/microRemediations.ts` | `role_interleukine`, `lt4_chef_orchestre`, `humoral_vs_cellulaire` | contenu | S |
| 3 | `src/data/activeLessons.ts` | `immunity_cooperation` (4 étapes) | contenu | M |
| 4 | `src/data/mindMapData.ts` | branche `unitId: 4` (coopération immunitaire) | contenu | M |
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
