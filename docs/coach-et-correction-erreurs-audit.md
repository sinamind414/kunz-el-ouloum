# Audit — Coach et correction des erreurs (fichier consolidé)

> Ce fichier regroupe, pour l’auditeur, la cartographie, les extraits et les responsabilités de tous les composants liés au Coach et à la correction des erreurs des élèves.

---

## 1. Cartographie des fichiers

| Fichier | Rôle |
|---|---|
| `src/components/CoachView.tsx` | Composant principal du Coach — points faibles, révisions dues, concepts maîtrisés. |
| `src/App.tsx` | Bouton FAB + ouverture du Coach + lazy-loading. |
| `src/data/kunzDatabase.ts` | Configuration du Coach, messages, `errorHint`/`successFeedback` dans les leçons. |
| `src/lib/validation/ValidationEngine.ts` | Validation offline principale — retourne `errors[]`, `score`, `passed`. |
| `src/utils/validationEngine.ts` | Validation simplifiée — keywords, synonymes, interdits, nombres, unités. |
| `src/hooks/useSmartValidation.ts` | Hook React qui appelle `ValidationEngine.validateAnswer()`. |
| `src/data/store.ts` | Store offline — `LearningError`, `MasteryEvidence`, `mastery`, migrations. |
| `src/services/documentEvidenceService.ts` | Crée `LearningError` ou `MasteryEvidence` après analyse de document. |
| `src/services/masteryEvidenceService.ts` | Crée `LearningError` ou `MasteryEvidence` après transfert/méthodologie. |
| `src/services/spacedRecallService.ts` | Planifie les révisions espacées liées aux erreurs. |
| `src/data/conceptRoutes.ts` | Routage d’un `conceptId` d’erreur vers la meilleure révision. |
| `src/services/methodologyRemediationFeedbackService.ts` |État de feedback méthodologique (`practiced`/`blocked`). |
| `src/data/activeLessons.ts` | `errorHint`, `acceptedAnswers` dans les blocs `microTest`. |
| `src/data/documentAnalysisExercises.ts` | `correctionAr` après tentative d’exercice. |
| `src/data/smartBotData.ts` | `COMMON_MISTAKES` (`{ mistake, correction }`). |
| `src/data/lessonTransferChallenges.ts` | `correctionAr` pour les défis de transfert. |
| `src/data/fillBlanks.ts` | `errorHint` pour les exercices à trous. |
| `src/components/DocumentAnalysisView.tsx` | Affiche erreurs + `correctionAr`, appelle `recordDocumentTrace()`. |
| `src/components/InteractiveLessonView.tsx` | Affiche `errorHint`, `correctionAr`, appelle `recordLessonTransferEvidence()`. |
| `src/lib/lesson/sessionEffectsService.ts` | Gère `feedbackViewed`, `validatedBlocks`, verrouillage de sortie. |

---

## 2. Flux global

```
Réponse élève
  → useSmartValidation → ValidationEngine
    → DocumentAnalysisView / InteractiveLessonView
      → documentEvidenceService / masteryEvidenceService
        → store.learningErrors (création / mise à jour)
        → store.mastery + store.evidences (succès)
        → spacedRecallService (révision future)
          ↓
      CoachView lit store.learningErrors + store.recalls
        → conceptRoutes → renvoie élève vers la bonne révision
```

---

## 3. Extrait — store.ts (types + fonctions clés)

```ts
export interface LearningError {
  id: string;
  kind: LearningErrorKind;
  conceptId?: string;
  unitId?: number;
  reflexId?: CoreReflexId;
  ruleIds: string[];
  labelAr: string;
  count: number;
  createdAt: number;
  lastSeenAt: number;
  reviewStartedAt: number;
  reviewStage: number;
  nextReviewAt: number;
  resolvedAt?: number;
}

export interface MasteryEvidence {
  id: string;
  conceptId: string;
  dimension: 'knowledge' | 'document' | 'methodology';
  reflexId?: CoreReflexId;
  source: 'quiz' | 'document_analysis' | 'lesson_transfer' | 'word_by_word';
  score: number;
  createdAt: number;
  relatedErrorIds?: string[];
}

export function loadStore(): KunzStore { /* lecture + migration + Zod validation */ }
export function recordEvidence(evidence: MasteryEvidence): KunzStore { /* met à jour mastery + erreurs liées */ }
export function applyEvidenceToError(error: LearningError, evidence: MasteryEvidence, options: { passed: boolean; now?: number }): LearningError { /* avance/résout l’erreur */ }
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14] as const;
```

---

## 4. Extrait — ValidationEngine.ts

```ts
export function validateAnswer(rawAnswer: string, ctx: ValidationContext): ValidationResult {
  // Vérifications ordonnées :
  // EMPTY, TOO_SHORT, MISSING_VALUE_UNIT, KULLAMA,
  // règles qualitatives, PPM/PPSE, ACh voltage,
  // hypothèse, H2, fibrillation, niveaux, blocs de synthèse
  return { errors: ValidationError[], score: number, passed: boolean, suggestions: string[] };
}
```

---

## 5. Extrait — documentEvidenceService.ts (création d’erreur / preuve)

```ts
export function recordDocumentTrace(...): MasteryEvidence | null {
  // Si échec → upsertLearningError({ kind: 'document', ruleIds, ... })
  // Si succès → recordEvidence({ dimension: 'document', score, ... })
}
```

---

## 6. Extrait — masteryEvidenceService.ts

```ts
export function recordLessonTransferEvidence(...): MasteryEvidence | null {
  // Si score < 70 → upsertMethodologyError({ reflexId, ... })
  // Si score >= 70 → recordEvidence({ dimension: 'methodology', reflexId, ... })
}
```

---

## 7. Extrait — spacedRecallService.ts

```ts
export function scheduleSpacedRecall(conceptId: string, sourceEvidenceId: string, relatedErrorId?: string): RecallItem {
  return {
    id: string;
    conceptId: string;
    stage: 0;
    nextReviewAt: computeNextReviewAt(Date.now(), 0, Date.now());
    sourceEvidenceId: string;
    relatedErrorId?: string;
  };
}
```

---

## 8. Extrait — conceptRoutes.ts (routage de remediation)

```ts
export function routeErrorToTarget(conceptId: string): ConceptRoute | undefined {
  // Résout vers : survivalCard > lesson > documentExercise > quiz
  // Utilisé par CoachView pour envoyer l’élève vers la bonne révision
}
```

---

## 9. Extrait — CoachView.tsx (lecture du store)

```ts
const store = loadStore();
const weakPoints = store.learningErrors
  .filter(e => !e.resolvedAt)
  .sort((a, b) => b.count - a.count);

const dueToday = store.recalls.filter(r => r.nextReviewAt <= Date.now());

const methodologyScore = computeMethodologyScore(store.mastery, store.evidences);
```

---

## 10. Extrait — smartBotData.ts (catalogue d’erreurs courantes)

```ts
export const COMMON_MISTAKES: Array<{ id: string; mistake: string; correction: string }> = [
  { id: 'm1', mistake: '...', correction: '...' },
  // ...
];

export function getMistakeById(id: string): { mistake: string; correction: string } | undefined {
  return COMMON_MISTAKES.find(m => m.id === id);
}
```

---

## 11. Extrait — activeLessons.ts (errorHint dans les leçons)

```ts
export interface TextAndProduceBlock {
  microTest?: {
    acceptedAnswers: string[];
    errorHint: string; // affiché si réponse incorrecte
  };
}

export interface HotspotAndMethodologyBlock {
  hotspot?: {
    successFeedback: string;
    errorHintAr?: string;
  };
}
```

---

## 12. Extrait — sessionEffectsService.ts (verrouillage feedback)

```ts
export interface SessionSnapshot {
  feedbackViewed: boolean;
  validatedBlocks: string[];
  validationResult?: ValidationResult;
}

// Empêche de quitter tant que feedbackViewed !== true
```

---

## 13. Points d’attention pour l’audit

| Axe | Risque / Question |
|---|---|
| Validation arabe | Le moteur couvre surtout FR/Latin ; dialecte algérien et bidi non gérés. |
| Confiance Coach | Un seuil de confiance < 0,45 ne doit pas retourner de réponse inventée. |
| Normalisation | Aucune normalisation arabe (harakat,hamza,etc.) avant matching dans le moteur actuel. |
| Persistance | `learningErrors` stocké en localStorage sans limite de taille ni purge automatique. |
| Tests | Pas de jeu de test documenté pour le pipeline erreur → correction → Coach. |
| Gouvernance | `COMMON_MISTAKES` alimenté par l’usage ; pas de validation humaine systématique. |

---

## 14. Commentaires d’audit recommandés

1. Ajouter une étape de normalisation arabe systématique avant toute validation.
2. Exposer le taux de faux positifs du Coach et le lier à `store.evidences`.
3. Tracer le taux d’erreurs résolues après révision espacée.
4. Ajouter un bouton « Signaler une erreur » dans chaque correction affichée.
5. Limiter et purger `learningErrors` anciennes (> 90 jours) pour éviter la dérive du store.
6. Compléter `COMMON_MISTAKES` par un backlog priorisé par fréquence réelle.
