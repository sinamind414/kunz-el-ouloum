# Kunz el Ouloum — Extraits regroupés (App / types / data)

Fichier unique regroupant les trois extraits demandés :
`src/App.tsx` (state de progression + appel `<AITutorView>`), `src/types.ts`
(`UserProgress` + `ChatMessage`), et `src/data.ts` (liste des `export const` au début).

---

## 1. `src/App.tsx`

### Déclaration du state de progression

```tsx
// Core progression state (persisted to localStorage)
const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
const [flashcards, setFlashcards] = useState<Flashcard[]>(SVT_FLASHCARDS);
const [progress, setProgress] = useState<UserProgress>(() => createDefaultProgress());
```

### Appel du composant `<AITutorView>` (avec ses props)

```tsx
{currentTab === 'chat' && (
  <AITutorView
    onBackToDashboard={() => setCurrentTab('home')}
  />
)}
```

> Note : `AITutorView` est importé en haut du fichier via
> `import AITutorView from './components/AITutorView';` et `UserProgress` via
> `import { Unit, UserProgress, Flashcard } from './types';`.

---

## 2. `src/types.ts`

### Interface `UserProgress`

```ts
export interface UserProgress {
  xp: number;
  streak: number;
  completedUnits: number[];
  completedQuestionsCount: number;
  studyMinutes: number;
  flashcardStats: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
  quizScoreHistory: {
    date: string;
    score: number;
    total: number;
    unitTitle: string;
  }[];
}
```

### Interface `ChatMessage`

```ts
export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
```

---

## 3. `src/data.ts`

Liste des `export const` déclarés au début du fichier (sans le contenu des tableaux) :

```ts
// (en-tête)
import { QuizQuestion, Unit, Flashcard } from './types';

export const MASCOT_URL = "/assets/images/mascot.png";

export const INITIAL_UNITS: Unit[] = [ /* ... */ ];

export const SVT_QUIZ_QUESTIONS: QuizQuestion[] = [ /* ... */ ];

export const SVT_FLASHCARDS: Flashcard[] = SVT_QUIZ_QUESTIONS.map((question) => ({ /* ... */ }));
```
