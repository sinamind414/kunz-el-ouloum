# FEUILLE DE ROUTE — Les 12 optimisations restantes de l'audit des modules

**Date :** 2026-10-02 · **Référentiel :** `audit.ts` des deux ZIPs stratégiques (13 verdicts « optimiser »)
**État :** 1/13 appliquée (aiTutor — mode socratique, PR #35) · 1 partielle (today) · 1 quasi (search) · **10 non entamées**
**Règle de lecture :** chaque fiche = prescription verbatim de l'audit → état réel vérifié dans le code → l'écart → le chantier → effort (S < 1 j · M 1-3 j · L > 3 j) · gain BAC estimé par l'audit · dépendances.

---

## Vue d'ensemble

| # | Module | Gain audit | Effort | État vérifié | Vague proposée |
|---|---|---|---|---|---|
| 1 | qcm → positionnement | 1,5 pt | M | ❌ corpus brut, aucun mode positionnement | **V1** (socle) |
| 2 | revisionPlan auto | 1,5 pt | M | ❌ aucune dérivation automatique | **V1** (dépend de qcm) |
| 3 | today (achèvement) | 0,5 pt | S | 🟡 R6/R8/R10 greffés ; manque l'adossement positionnement | **V1** (dépend de qcm) |
| 4 | microRemediations ↔ Correcteur | 2 pts | M | ❌ **orphelin** — aucun déclencheur UI | **V2** (dépend Correcteur) |
| 5 | conceptRoutes segment | 1,5 pt | S | ❌ **orphelin** — référencé par curriculumIntegrity seulement | **V2** (dépend Correcteur) |
| 6 | transferChallenges verrouillé | 1,5 pt | S | ❌ **orphelin** — aucun composant ne le référence | **V3** (dépend tahlil) |
| 7 | flashcards 1 idée + rappel | 2 pts | L | ❌ flip/audio/lecteur, ni découpage ni espacement | **V3** |
| 8 | schemaDrill 2 modes | 2 pts | L | ❌ aucun mode compléter/vierge | **V3** |
| 9 | mindMap à trous | 1,5 pt | M | ❌ cartes D3 complètes seulement | **V3** |
| 10 | teacherDashboard sorti du menu élève | 0 pt | S | ❌ onglet `teacher` toujours dans le menu élève | **V0** (décision) |
| 11 | search par notions | 0,5 pt | M | 🟡 indexe déjà texte + keywords + alias — pas de notion canonique | V2 |
| 12 | auth (maintenance) | 0 pt | — | ➖ aucun fix prescrit — infrastructure à maintenir | continu |

**Total gain mobilisable : ~16 pts d'audit** (chevauchements inclus — la somme réelle est moindre car qcm+revisionPlan+today forment une seule chaîne de valeur).

---

## VAGUE 0 — à décider avant tout (0 journée de code)

### 10 · teacherDashboard — *le sortir du menu élève*
- **Audit :** « Le sortir du menu élève et y regrouper programme officiel, livrables, stats globales et errata » (C1 2/4, gain 0 pt élève).
- **Vérifié :** l'onglet `teacher` figure toujours dans `App.tsx` (menu exposé à l'élève).
- **Écart :** pur désencombrement du menu + regroupement des 4 sources (dont `curriculumLivables`, déjà voué à fusionner là).
- **Chantier :** déplacer l'entrée derrière un profil/commutateur professeur ; absorber programme, livrables, stats globales, errata.
- **Risque :** faible — mais à coordonner avec la fusion `curriculumLivables→teacherDashboard` (1 des 8 « fusionner »).
- **Décision owner :** comment un prof se connecte-t-il ? (code d'accès, mode local, second build ?)

## VAGUE 1 — la chaîne diagnostic (socle de 3 modules)

### 1 · qcm — *du corpus au positionnement*
- **Audit :** « Le réduire à un QCM de positionnement de 15 questions par unité, avec renvoi automatique vers la leçon fautive ; supprimer les 120 questions placeholders déjà écartées à l'import. » (508 questions à l'époque → **549 vérifiées aujourd'hui**).
- **Vérifié :** aucun mode positionnement dans `QuizView` ; corpus brut ; placeholders non marqués.
- **Chantier :** (a) purger/marquer les placeholders ; (b) sélectionneur 15 questions/unité équilibré (par sous-thème) ; (c) à la fin : carte des leçons fautives avec `lessonKey` (le moteur KEO-104 fournit déjà `findLessonForKeyPoint` — réutilisable tel quel).
- **Pourquoi en premier :** c'est la **source de données** de revisionPlan et de l'achèvement de today.

### 2 · revisionPlan — *dérivé, jamais saisi*
- **Audit :** « Le faire dériver automatiquement du QCM de positionnement + des tags du Correcteur ; ne rien planifier d'inutile. »
- **Vérifié :** `RevisionPlanView` ne dérive de rien (aucune référence aux erreurs, tags ou positionnement).
- **Chantier :** entrées = résultat positionnement (V1-1) + `mistakes[]` classées (R6 déjà en place) + tags Correcteur ; sortie = plan en minutes/jour avec portes `lessonKey`. Complément naturel du bilan CAUSE/ACTION/PORTE (KEO-104).

### 3 · today — *achever la greffe*
- **Audit :** pas de fix textuel (verdict « optimiser », C1 1/4).
- **Vérifié :** 🟡 R6 (priorisation erreurs), R8 (compte à rebours BAC), R10 (gain nommé) déjà livrés par la fusion ; manque l'adossage au positionnement.
- **Chantier :** S — brancher la mission du jour sur le plan de révision (V1-2) plutôt que sur la seule `mistakes[rank]`.

## VAGUE 2 — la chaîne remédiation (autour du Correcteur)

### 4 · microRemediations — *un tag = une remédiation*
- **Audit :** « Déclencher la remédiation depuis le tag du Correcteur (un tag = une micro-remédiation) et supprimer tout accès direct. » (C2 4/4 — l'audit y croit.)
- **Vérifié :** ❌ **module orphelin** — `microRemediations.ts` n'est référencé que par des lock tests et `curriculumIntegrity` ; aucun composant ne le déclenche.
- **Chantier :** câblage Correcteur → remédiation (mapping tag→contenu), suppression de l'accès direct. Le module existe déjà : c'est du **routage**, pas de la création.
- **Dépendance :** les 8 tags du Correcteur (`correcteurV1.ts`) doivent être stables et nommés.

### 5 · conceptRoutes — *le segment, pas le parcours*
- **Audit :** « N'afficher que le segment du concept fautif, jamais le parcours entier. »
- **Vérifié :** ❌ quasi orphelin (référencé par `curriculumIntegrity` seulement).
- **Chantier :** S — lors d'une erreur taguée, n'ouvrira que le segment conceptuel concerné. Même logique de câblage que le 4.

### 11 · search — *des notions, pas des fichiers*
- **Audit :** « Indexé sur les notions et non sur les titres de fichiers. »
- **Vérifié :** 🟡 l'index matche déjà `text` + `keywords` + `aliases` (548 chunks, KEO-112 mot entier) — mieux que « titres », mais sans couche de **notions canoniques** (un concept ≠ un mot).
- **Chantier :** M — table notion canonique → leçons/chunks (ex. « الإنحلال التسامي » → 3 leçons), branchée sur la recherche. Peut s'appuyer sur `SYNONYM_GROUPS` existant.

## VAGUE 3 — la chaîne production élève (le plus long)

### 7 · flashcards — *1 idée + espacement*
- **Audit :** « Découper en questions à 1 idée (verbe de consigne en tête) et imposer un calcul de rappel actif avant affichage. »
- **Vérifié :** ❌ `RevisionView` = flip + notation manuelle + audio + mode lecteur ; ni découpage ni planificateur d'espacement.
- **Chantier :** L — refonte du corpus de cartes (verbe en tête) + SM-2/Ebbinghaus (le calcul existe déjà côté `study_planning` en contenu pédagogique — l'implémenter en code).

### 8 · schemaDrill — *compléter puis vierge*
- **Audit :** « Passer en mode "schéma à compléter puis schéma vierge" avec grille de légende (titre, orientation, flèches). » (1 schéma dans ~70 % des sujets.)
- **Vérifié :** ❌ aucun des deux modes.
- **Chantier :** L — deux états par schéma + grille d'auto-évaluation.

### 9 · mindMap — *la carte à trous*
- **Audit :** « Ne garder que la version "carte à trous" (20 % des nœuds masqués) et supprimer les cartes complètes. »
- **Vérifié :** ❌ vues D3 complètes (`MindMap/D3MindMapCanvas`).
- **Chantier :** M — masquage paramétrique des nœuds (20 %) avec saisie/restitution.

### 6 · transferChallenges — *verrouillé à 70 %*
- **Audit :** « Le verrouiller derrière un seuil de maîtrise (≥ 70 % au Mur d'analyse de l'unité). »
- **Vérifié :** ❌ **orphelin total** — aucun composant ne référence `lessonTransferChallenges` (données + contre-preuve seulement).
- **Chantier :** S une fois le seuil défini — exposer les défis dans le Mur d'analyse (tahlil) conditionnellement au score d'unité.
- **Dépendance :** métrique de maîtrise d'unité (tahlil) — à définir avec le garde-fou « jamais de lien inventé ».

### 12 · auth — *maintenance*
- **Audit :** « optimiser » sans fix (C1 0/4 — infrastructure). Rien à prescrire au-delà de la maintenance (compte, sauvegarde, zoom figures déjà livré avec ProFigures).

---

## Trois mises en garde

1. **Ne lancez pas V3 avant V1** : les flashcards/schemaDrill/mindMap produisent des *erreurs* qui doivent retomber dans la chaîne diagnostic (positionnement → plan → mission). Sans V1, V3 crée des données que rien n'exploite.
2. **Deux chaînes, un pivot** : le **Correcteur (8 tags)** est le pivot de la vague 2 — sa taxonomie doit être gelée avant de câbler microRemediations et conceptRoutes.
3. **Les orphelins d'abord rentables** : 3 des 10 modules non entamés (microRemediations, conceptRoutes, transferChallenges) sont des **câblages** — contenu déjà écrit et verrouillé, zéro création pédagogique. Ce sont les gains/heure de code les plus élevés de la liste.

## Lien avec la feuille de route de l'owner (S1→S4)

- **S1 Couper** (17 suppressions) : indépendant — peut se faire en parallèle, voir mon analyse des lock tests à retirer un par un.
- **S2 Fusionner** (8 fusions) : 2 fusions touchent cette liste (`curriculumLivables→teacherDashboard`, `hosila→today`) — à traiter DANS les chantiers 10 et 3.
- **S3 Boucher (les GAPS)** : reste prioritaire sur tout le reste (≈ 6,5 pts/sujet vs ~16 pts théoriques ici, pour un effort bien supérieur).
- **S4 Verrouiller** : chaque optimisation livrée = lock test (règle établie du SpecKit).

**Ordre recommandé : V0 (décision) → V1 (chaîne diagnostic, ~1 semaine) → V2 (chaîne remédiation, ~1 semaine) → S3 GAPS → V3 (production élève).**
