# Tadwin (التدوين الشامل) — Décisions figées

**Date** : 2026-09-30
**Objet** : contrat de conception du module Tadwin, issu de l'audit de la spec
`Spec_Tadwin_Chamil_SVT.html` et du JSON `mafatih_morchid.json`.
**Méthode** : chaque option a été tranchée par mesure (sondages sur les données
réelles), jamais à l'estime. Ce document fige les décisions **et** les réfutations,
pour empêquer qu'une option rejetée soit rebranchée dans trois mois.

---

## 1. Granularité de la fiche — Lecture B retenue

La fiche Tadwin est un **micro-geste** : 2 à 3 clés ( blocs ) par fiche,
pas une synthèse de toute l'unité.

- Lecture A (fiche = synthèse d'unité) : **rejetée**. Contredit le geste-signature
  du module « قاوم الرغبة — مفتاحان يكفيان » (résiste : deux clés suffisent),
  qui vit au niveau **bloc**.
- La distinction qui a départagé : **une clé ≠ un atome**. Une clé est un bloc
  (histoire + mots-clés + relation) ; un atome est un terme scientifique à
  l'intérieur de la clé. Limiter les clés ne limite pas les atomes par clé.

## 2. C2 = couverture **par clé**, pas ratio sur l'union

> **L'atome est la *preuve* ; la clé est l'*unité notée*.**
>
> `C2 = clésCouvertes / clésChoisies` — une clé est couverte si la réponse
> contient assez de **ses propres** atomes (seuil calibré, §8).

Justification mesurée : un ratio fixe sur l'union d'atomes est structurellement
inéquitable dès que `|A|` dépend des clés choisies. Mesuré : 2 clés composites
→ `|A|=8` → tolère 3 manques ; 2 clés simples → `|A|=2` → tolère 0. Même effort
au niveau bloc, tolérance opposée. Noter au niveau bloc dissout cette variance.

**Équivalence résiduelle** : pour les clés mono-atome, couverture par-clé et
ratio sur l'union sont identiques. La par-clé ne fait donc que **monter** la
note sur les clés denses — jamais baisser.

## 3. Atomisation : `atoms[]` **auteur-déclaré** pour les 33 clés — pas de parser runtime

Mesures sur les `motsClesAttendus` (33 clés = 3/unité × 11 unités) :

| Instrument | Clés strictement mono-atome | Unités « all-clean » |
|---|---|---|
| Parser parenthèses seules | 28/33 | 7/11 |
| **Parser complet** ( `/` `←` `→` `:` `أو` + parenthèses ) | **17/33** | **2/11** |

**L'écart 28 → 17 selon l'instrument est lui-même la preuve** : la sortie d'un
parser dépend des règles de séparateurs, donc un parser runtime est fragile.
Conséquence : **chaque clé déclare son propre `atoms[]`** (33 déclarations
bornées, déterministes, vérifiables par l'auteur). Aucun parser dans le runtime.

À ne **pas** utiliser comme source C2 :
- `motsClesAttendus` brut — 16/33 (48 %) portent un séparateur structurel → non
  matchables par `motPresentDans` ;
- `mots[].termeAtomiques` — c'est une vraie expansion (49/80 sacrés ont >1
  atome), mais elle **ne couvre pas** les attendus (≥ 22/33 non reliés) ;
- `correcteur.motsCles` — atomique mais trop volumineux (§7).

## 4. Union dans `CORRECTEUR_V1_UNITES.motsCles` — INTERDIT

L'instruction `meta.usage.correcteur: "union"` du JSON est **retirée**.

Mesuré : pools actuels 26–45 formes/unité (moy 35) → après union **40–73**
(moy 55). En **mode défaut** (`SEUIL_KEYWORDS_DEFAUT = 0.25`), l'exigence passe
de ~9 à ~14 termes (**+55 %**) — soit réintroduire exactement le bug corrigé le
2026-09-16 (pool trop grand → seuil inatteignable).

Règle : le JSON peut **alimenter les attendus explicites** (mode `'attendus'`),
**jamais le dénominateur du mode défaut**.

## 5. Étape de sélection des clés (palier 3) — obligatoire

`C2 = clésCouvertes / clésChoisies` exige un **dénominateur déclaré**.
Aux paliers 1-2, le gabarit nomme les clés → connu. Au **palier 3** (gabarit
vide, restitution de mémoire), rien ne dit quelles clés l'élève a écrites ;
sans attribution, la note devient circulaire.

**Décision** : avant d'écrire, l'élève **choisit 2 à 3 clés parmi les 3
prescrites de l'unité**. Trois gains : (1) dénominateur déclaré, (2) le geste
« مفتاحان يكفيان » devient un choix explicite, (3) entraîne la *sélection*
des clés, compétence visée par le module. À intégrer à la spec.

## 6. Locks (tests, pas un document)

1. `clésChoisies ⊆` les 3 clés prescrites de l'unité.
2. `≥ 2 clés choisies` (plancher bloc = geste-signature).
3. Chaque clé choisie a `≥ 1` atome-preuve.
4. `atoms[]` auteur-déclaré pour les 33 clés ; `atoms(clé) ≠ ∅`.
5. **Pas de lock `ceil(0.6·|A|) ≤ nbClés+1`** — réfuté (§7).

## 7. Options rejetées — et pourquoi

| Option | Mesure qui tue | Verdict |
|---|---|---|
| `C2 = evaluerReponseKeywords(attendus := correcteur.motsCles)` | 307 formes, 18–38/unité → @0.6 **11–23 termes exigés** | **Rejeté** — reproduction du bug de seuil inatteignable ; contradictoire avec C3 (concision) |
| `attendus := sacrés atomiques de l'unité` | 155 formes, 11–19/unité → @0.6 **7–11 exigés** | **Rejeté** — sur-dimensionné pour un micro-geste ; note le pool de l'unité, pas les clés écrites |
| Ratio sur l'union d'atomes | tolérance 0 vs 3 manques pour un même effort 2-clés | **Rejeté** — inéquité structurelle (§2) |
| Lock `ceil(0.6·|A|) ≤ nbClés+1` | u1 : 8 atomes → 5 exigés > 4 ; u11 : 7 → 5 > 4 | **Rejeté** — se réfute lui-même ; suppose « 1 atome par clé » (faux : 16/33 multi-atomes) |
| Seuil 0.6 *supposé* jouable | aucune fiche-modèle mesurée | **Rejeté** — calibration d'abord (§8) |
| Rappel 48 h offline (palier 0) | exige service worker + permission | **Rejeté** — repli sur le J+1 existant (`store.ts` stages ancrés `reviewStartedAt`) |

Note : le lock `|A| ≥ 3` (proposé puis rétracté) était un **lock de données** qui
ne contraignait pas le `|A|` de runtime — 31/80 sacrés mono-atome permettent une
fiche 2-clés à `|A|=2`. La par-clé dissout le problème en ne notant plus l'union.

## 8. Calibration du seuil — FAITE (2026-09-30), figée par mesure

Procédure (patron `calibrationBac2025`) appliquée : 3 fiches-modèles par unité
(فصحى, main, prose naturelle — jamais des listes de mots-clés) dans
`src/data/tadwinCalibration.ts` :

- **`complete`** — excellence de référence, couvre les 65 atomes. Lock : C2 = 1
  au seuil 1.0, donc la prose atteint *réellement* chaque atome déclaré.
- **`concise`** — excellence **économique** (le bon élève cite l'essentiel).
  Borne le seuil **par le bas**.
- **`fragile`** — réponse insuffisante/vague. Borne le seuil **par le haut** :
  jamais C2 = 1.

**Seuil figé : `couvert ⟺ ≥ la moitié des atomes, minimum 1` (`SEUIL_C2 = 0.5`).**

Mesure (test de gel dans `tadwinCalibration.test.ts`) : les fiches `concise`
exigent 1/2 (7 clés), 2/3 (3 clés) et 3/5 (1 clé) des atomes. À **0.51**, au
moins une `concise` casse → 0.5 est le **maximum** tolérable. Le seuil 0.6
supposé jadis est définitivement réfuté. Limite assumée : calibration sur
fiches authored, **pas** sur copies réelles (AGENTS.md R2) — un écart publié
reste un plancher.

Pièges de matcher révélés par la mesure (à respecter dans toute fiche future) :
`وظيفة` ne matche pas `وظيفته` (suffixe = lettre après le needle) ; un atome
doit être **contigu** (`اللب الخارجي سائل` ne contient pas `لب خارجي سائل` :
le `ال` interne n'est pas consommable par le préfixe).

## 9. Périmètre

**V1** — C2 (par-clé, `atoms[]` auteur-déclaré) + C3 (`stuffingDetector`) +
C4 négation-seulement avec repli « à vérifier » (R4) + 5 paliers/fading en
localStorage + rappel espacé sur `store.ts` (harmonisé **J+14**) + étape de
sélection des clés. Note affichée : **« تقييم التدوين — ليست نقطة البكالوريا »**,
jamais remontée dans `supervision/evaluerCopies`.

**V1.5 (isolées)** — C1 anti-copie (n-grammes ≥ 5 tokens + exemption des spans
contenant un atome attendu ; calibré sur fiches-modèles), puis دفتر الأخطاء
persistant (les briques source existent : `learningErrors` dans `store.ts`,
clé `kunz_learning_errors_v1`, trimming sur `resolvedAt`).

## 10. Points d'attache dans le code

| Besoin | Cible | Statut |
|---|---|---|
| Boucle conversationnelle | `BotMode` + `smartTutorEngine.processStudentInput` | existe |
| Texte libre (hors C2) | `gradeKeyPoints` (`smartTutorEngine`) | existe |
| Anti-négation (C4) | `tokenAffirmed` / `clauseIsDenial` | existe |
| Anti-bourrage (C3) | `lib/validation/stuffingDetector.ts` | existe |
| Synonymes | `lib/validation/synonyms.ts` (`SYNONYM_GROUPS`) | existe |
| Rappel espacé | `data/store.ts` stages J+1/J+3/J+7/J+14 | existe |
| Minuteur doux | `components/FocusTimer.tsx` | câblé (`9c79d05`) |
| Texte source leçon (C1, V1.5) | `data/lessonIndex.ts` (`text`, `keywords`) | existe |
| **Scorer C2 par-clé** | `lib/validation/couvCle.ts` (`SEUIL_C2` figé) | **fait** |
| **`atoms[]` des 33 clés** | `src/data/tadwinCles.ts` | **fait** |
| **Fiches-modèles de calibration** | `src/data/tadwinCalibration.ts` (33) | **fait** |
| **Câblage runtime** (BotMode 'tadwin', paliers, J+14) | à faire | **V1** |
