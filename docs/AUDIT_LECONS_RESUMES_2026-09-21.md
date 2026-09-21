# Audit leçons passives & actives — résumés et objectifs (2026-09-21)

**Exigence.** Chaque leçon doit porter un **résumé** qui enseigne un **objectif clair et
simple**, pour assimiler la leçon. Périmètre mesuré : 50 surfaces = 25 leçons actives
(ACTIVE/TS, `lessonData.ts`) + 25 passives (HTML `public/lessons/`), mêmes slugs.
Méthode : détection structurelle (phases/blocs, marqueurs `خلاصة/ملخص/استنتاج` en
position de titre de section, contexte ±300 car. pour écarter les faux positifs —
ex. « خريطة » d'une question, « تذكر » d'un commentaire d'en-tête).

## 1. Objectifs (🎯 الهدف العلمي) : 50/50 présents — bon point

- **25/25 actives** (champ `objectives`) et **25/25 passives** (bloc `lesson-objectives`)
  affichent un objectif à verbe d'action (بيّن، فسّر، حدّد، وضّح) + durée d'auto-apprentissage.
- **Défaut d'architecture détecté** : `phase10_chapitres_19_20` = leçon **hybride** —
  1ʳᵉ moitié « تأثير المخدرات/المادة P » (D1-U5 عصبي), 2ᵉ moitié « التركيب الضوئي »
  (D2-U1). Ses 2 objectifs sont donc **légitimes** (pas un copié-collé), mais la
  breadcrumb annonce D1-U5 seulement : la 2ᵉ moitié est égarée dans l'UI (regroupement
  par breadcrumb) et **1 QCM du bilan était mal attribué** (« الصانعة الخضراء » → D1
  au lieu de D2). **Corrigé** : override par-item `L:phase10_chapitres_19_20:2 → D2`
  (effectifs bilan re-figés 45/17/29). La scission de la leçon en 2 reste à décider.
- Rappel (audit bilan 2026-09-20) : les slugs mentent ; la breadcrumb est la source
  de vérité (`META_LECONS`) — déjà corrigé.

## 2. Résumés : 6/50 (12 %) — le gros manque

| Surface | Résumé réel | Détail |
|---|---|---|
| Actives (25) | **0/25** 🔴 | la leçon finit sur un quiz (step 4 = quiz/scientific_text+quiz) — **aucune synthèse finale** |
| Passives (25) | **6/25** 🟡 | `lecon_transcription`, `lecon_representation`, `lecon_activite_structure`, `phase1`, `phase2`, `phase3` ont une خلاصة/ملخص de contenu réel (ex. « الخلاصة الشاملة للوحدة الثانية (تنقيط البكالوريا) », « ملخص المراحل الثلاث للترجمة ») |
| Passives sans résumé | 19/25 🔴 | s'arrêtent au « تقويم الدرس » (questions bac) sans synthèse |

**Qualité des 6 existants** : réels et ancrés (131-197 mots), mais **denses et
proches** — 2 à 4 phrases de plus de 22 mots, peu de points numérotés : ce ne sont
pas encore des résumés « simples ». Borderline : `phase15` (« الخلاصة الكبرى » =
titre d'exercice, pas une section de synthèse).

**بنك الحفظ (عكاشة)** : résumés par **unité** (10 unités) — ne satisfait pas
l'exigence **par leçon** (moy. 2,5 leçons/unité).

## 3. Critères proposés pour le résumé standard (à verrouiller)

1. **1 phrase-objectif** rappelée en tête (reprise de l'🎯 de la leçon) ;
2. **4 à 6 points numérotés**, 1 idée = 1 point, ≤ 20 mots/point ;
3. **Ancrage livre** : chaque point vérifiable lexicalement dans le chapitre du
   programme (`data/bookContent.json`) — zéro invention ;
4. terminer par le **terme-clé bac** (mot/locution officielle) ;
5. longueur totale 60-180 mots.

Verrou mécanique associé : chaque leçon a un bloc خلاصة · 4-6 points · 60-180 mots ·
≥ 1 jeton (≥ 5 car.) du livre par point.

## 4. Plan d'exécution (en attente GO)

- **É1 — 19-20 résumés manquants** : rédaction par slug, dérivée du livre officiel
  (une idée par point, ancrage vérifié), injectée aux **deux surfaces** (phase finale
  `خلاصة` des actives + section خلاصة avant تقويم des passives) ;
- **É2 — uniformiser les 6 existants** au standard (découper les phrases longues) ;
- **É3 — verrou** `lessons.resume.lock.test.ts` (critères §3, 50/50) ;
- **É4 — (décision)** scinder `phase10` en 2 leçons (D1-U5 + D2-U1) et re-groupement UI.

## 5. Bilan

| Critère | Actives | Passives | Global |
|---|---|---|---|
| Objectif clair affiché | 25/25 ✓ | 25/25 ✓ | **50/50 ✓** |
| Résumé présent | 0/25 🔴 | 6/25 🟡 | **6/50 (12 %) 🔴** |
| Résumé « simple » (points courts) | 0 | 0/6 | **0/50 🔴** |

**Verdict** : les objectifs existent partout (bonne base), mais l'exigence « résumé
simple par leçon » n'est satisfaite nulle part à 100 % — 44 leçons sans résumé, 6
avec un résumé à simplifier. Priorité : É1 (19-20 résumés partagés aux 2 surfaces),
puis É2/É3.

---

## 6. Correction de surface + exécution du GO (2026-09-21, après audit)

**Correction de surface (erreur de l'audit initial).** La section §2 mesurait les
« actives » sur `EXPERIMENTAL_LESSONS` (25 slugs) — or cette structure **n'est rendue
par aucun composant** : elle ne sert que de source des quiz du bilan (`qcmBilan.ts`).
La surface active RÉELLE = `ACTIVE_LESSONS` (`src/data/activeLessons.ts`,
`ActiveLessonView.tsx`) : **20 leçons** (keys dont `synapse`, `subduction`,
`immunity_*`, `d2-u6-l*`…), et **0/20 a un résumé** — la conclusion de l'audit
tient, les chiffres de surface sont corrigés. Univers réel : **45 surfaces**
(25 passives + 20 actives ; `lecon_transcription` et `phase11` existent des deux
côtés avec des contenus différents : la phase11 active = مقر ch31-32, la passive =
الكيموضوئية ch33-34 — deux résumés distincts sous un même slug).

**GO exécuté le même jour.**

| Avant | Après |
|---|---|
| Résumés : **6/45** surfaces (6 passives héritées, 0 active) | **45/45** (25/25 passives = 19 injectés + 6 hérités · 20/20 actives = carte 📝) |
| Résumé au standard simple : 0 | **39 textes** (38 clés + dédoublement phase11) — 185 points, tous ≤ 24 mots |
| Ancrage livre : non mesuré | **185/185 points ancrés** (≥ 1 jeton normalisé ≥ 5 car. dans les chapitres déclarés `CHAPITRES_ANCRAGE`) |

**Implémentation** :
- `src/data/resumesLecons.ts` — 39 entrées {objectif, 4-6 points, termeBac} +
  `CHAPITRES_ANCRAGE` (chapitres du livre par clé, contenu-basé : les slugs mentent)
  + `resumePourActif()` (résout le cas phase11 active≠passive) ;
- `ActiveLessonView.tsx` — carte « 📝 خلاصة الدرس » en bas des 20 actives, **hors
  machine d'états** du tunnel (zéro risque sur sessions/snapshots) ;
- 19 fichiers HTML passifs — section `<section id="resume">` (objectif + points +
  terme bac) insérée avant le تقويم + lien nav sticky (19/19, sans exception) ;
- `src/data/resumes.lock.test.ts` — 8 tests : couverture 20 actives + 19 passives,
  câblage viewer, standard (4-6 points ≤ 24 mots), **ancrage livre par point**,
  présence effective de la section/objectif/lien dans les 19 fichiers, cas phase11
  et phase10 (hybride couvrant المخدرات + الصانعة الخضراء).

**Restant (É2, non bloquant)** : restructurer les 6 résumés hérités au standard
simple (contenu réel mais dense : 2-4 phrases > 22 mots).

## 7. É2 exécuté — les 6 résumés hérités restructurés (2026-09-21)

Les 6 leçons (lecon_* + phase1/2/3) reçoivent la **même carte standard** (objectif +
4-6 points + terme bac) juste avant leur تقويم — ancrées livre, vérifiées par le
même verrou (désormais **44 entrées / 25 passives / 210 points ancrés**).

**Décisions d'É2** :
- le **contenu hérité dense est conservé** en profondeur (النص العلمي النموذجي =
  critères de تنقيط bac ; الخلاصة الشاملة = matière comparative) — la carte simple
  le précède, aucune perte, aucune chirurgie risquée dans les step existants ;
- **contenu réel, pas slugs** : phase2 enseigne la ترجمة (ch4-5), phase3 la
  structure-fonction (Anfinsen/HbA, ch6-8) — ancrages contenu-basés ;
- **mine détectée au passage** : l'OCR du livre est **quasi vide pour ch9 (23 car.),
  ch10 (39 car.), ch11 (46 car.)** — tout le fond enzymatique du livre est en ch12
  (17 687 car.). Les ancrages enzymatiques pointent donc ch12. Tâche future possible :
  ré-ingestion des chapitres enzymatiques du livre (canal upload GitHub validé).

**Couverture finale : 45/45 surfaces avec résumé au standard — uniformité totale.**
