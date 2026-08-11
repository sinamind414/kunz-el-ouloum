# V3 — La Boussole : architecture du parcours dirigé

> Version validée le 2026-08-11. Règle fondatrice :
> **« Une mission visible, une prochaine action, aucun cul-de-sac. »**

La V3 transforme Kunz El Ouloum d'une bibliothèque de contenu en **système de
progression pédagogique dirigée** (approche Netflix / Duolingo). L'élève
n'est plus livré à lui-même face au catalogue : l'application décide pour lui
de la prochaine étape, comme un professeur.

## 1. Les trois couches

| Couche | Fichier | Rôle |
|---|---|---|
| **Focus Engine** | `src/services/focusEngine.ts` | Choisit l'unité active et LA prochaine action unique. |
| **Mastery Engine** | `src/services/masteryEngine.ts` | Mesure la maîtrise réelle : examens, échecs, remédiation. |
| **Gating Engine** | `src/services/gatingEngine.ts` | Contrôle les déverrouillages (portes entre unités). |

Tous trois sont **purs et offline-first** (aucun appel réseau), couverts par
des tests unitaires (`*.test.ts` à côté de chaque moteur).

### Focus Engine

- `getActiveUnit(units, mastery)` → première unité **déverrouillée** et non
  validée (ordre officiel par `id`).
- `getNextAction(units, mastery)` → le « chemin de fer » :
  1. échec récent sur l'unité active → `remediation` (drill des questions ratées) ;
  2. `progress === 0` → `lesson` (première leçon de la séquence officielle,
     `src/data/unitLessonSequences.ts`) ;
  3. `progress < 60` → `quiz` (QCM d'entraînement) ;
  4. `progress ≥ 60` → `exam` (examen de validation) ;
  5. toutes les unités débloquées validées → `all_done`.

### Mastery Engine (« Le Gardien »)

- Examen de validation : **10 QCM de l'unité uniquement**, seuil **80 %**.
- Réussite → unité validée, porte suivante déverrouillée, célébration.
- Échec → **jamais** « Échec, recommence » seul :
  - `diagnoseWeakTopics()` nomme les notions faibles via un lexique par unité
    (`UNIT_TOPIC_LEXICON`) ;
  - boucle de remédiation : rappel ciblé (leçon) → drill des questions
    ratées (`pickDrillQuestions`) → nouvelle tentative avec **des questions
    différentes** (`pickExamQuestions` écarte les ids de la dernière tentative).
- Une correction incertaine ne doit jamais emprisonner l'élève : le diagnostic
  est indicatif, le drill n'écrit jamais de nouvel échec bloquant.

### Gating Engine

- Unités futures verrouillées ; les unités **déjà déverrouillées restent
  toujours accessibles** (verrouillage progressif, pas punitif).
- Clic sur une unité verrouillée → le **Coach surgit** (message du Gating
  Engine), jamais de mur silencieux.
- **Test diagnostique** : un élève avancé peut ouvrir une unité verrouillée
  en réussissant 80 % à un examen diagnostique (sans refaire les leçons).
- **Mode professeur** (`kunz_v3_teacher_unlock`, interrupteur dans تقدمي) :
  force l'accès à toutes les unités (usage en classe).

## 2. UI impactée

- **مساري** (`MyPathView.tsx`) = point d'entrée quotidien : carte Boussole
  « هدفك الحالي » (unité, progression, étape suivante, notions faibles) +
  bouton unique **« أكمل من حيث توقفت »** qui téléporte vers la prochaine
  action, + bouton examen quand l'unité est prête. Le catalogue survit dans
  الدروس mais devient secondaire.
- **الدروس** (`LessonsView.tsx`) : cartes d'unités grisées + cadenas,
  badge « ✅ متقنة » pour les unités validées.
- **أتدرب** (`TrainingView.tsx`) : carte « امتحان الوحدة » (Le Gardien) pour
  l'unité active ; QCM libres, boss BAC et cartes de révision respectent le
  gating.
- **QuizView** : bandeau examen (validation / diagnostique / drill) et
  remontée des **questions ratées** vers le Mastery Engine.
- **Coach proactif** (`CoachEventModal.tsx` + `src/services/coachEvents.ts`) :
  événements plein écran — unité verrouillée, célébration d'unité validée
  (cadenas brisé), plan de remédiation après échec, drill terminé, retour
  après ≥ 3 jours d'absence.

## 3. Données (localStorage)

| Clé | Contenu |
|---|---|
| `kunz_v3_mastery_v1` | `MasteryState` : unités validées, tentatives (≤ 20), dernier échec. |
| `kunz_v3_teacher_unlock` | `"true"` si le mode professeur est actif. |

⚠️ **Pas de bump de `DATA_VERSION`** : le progrès V2 (`svt_units`,
`svt_progress`) des testeurs n'est jamais effacé. Les unités déjà
déverrouillées en V2 restent ouvertes en V3.

Télémétrie optionnelle (Supabase, non bloquante) : `V3_EXAM_STARTED`,
`V3_EXAM_PASSED`, `V3_EXAM_FAILED`, `V3_DIAGNOSTIC_PASSED`,
`V3_LOCKED_UNIT_CLICKED`, `V3_RESUME_CLICKED`.

## 4. Tests

- `focusEngine.test.ts` — sélection d'unité active, chemin de fer, remédiation.
- `gatingEngine.test.ts` — accessibilité, message du Coach, immutabilité,
  persistance du mode professeur.
- `masteryEngine.test.ts` — seuil 80 %, cycle échec/remédiation/réussite,
  variation des questions, drill, diagnostic tolérant, robustesse JSON.
- `MyPathView.focusCompass.test.tsx` — carte Boussole, bouton reprise,
  bouton examen, remédiation affichée, écran « tout terminé ».
- `CoachEventModal.test.tsx` — rendu des événements et routage des actions.
- `LessonsView.visualCards.test.tsx` — réaligné sur l'UI réelle : catalogue
  guidé + gating (unités verrouillées → Coach).

Suite complète : `npm run test:unit` (380 tests), lint : `npm run lint`,
build : `npm run build`.

## 5. Flux nominal (élève)

```
Ouverture app
   └─ Focus Engine : unité active = Unité 1 (تركيب البروتين)
        ├─ progress 0   → البوصلة propose la 1re leçon
        ├─ progress 40  → البوصلة propose le QCM d'entraînement
        ├─ progress 65  → البوصلة propose l'examen (Gardien)
        │     ├─ ≥ 80 % → 🎉 Unité validée, Unité 2 déverrouillée
        │     └─ < 80 % → diagnostic + leçon + drill + nouvelle tentative
        └─ Unité 2 cliquée trop tôt → Coach : « عذراً ! … 80% … »
                                     (+ test diagnostique proposé)
```
