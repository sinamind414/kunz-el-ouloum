# Intégration — Brique MOTIVATION (Focus Pomodoro + Module Déclic)

Deux nouveaux composants comblent les seuls trous du moteur **SE MOTIVER** :

| Fichier | Rôle |
|---|---|
| `src/data/motivationCapsules.ts` | Banque de « déclics » de motivation (arabe), typée et extensible |
| `src/components/MotivationDeclic.tsx` | Module « Déclic » affiché **avant** une session |
| `src/components/FocusTimer.tsx` | Minuteur de concentration type **Pomodoro** |

Tout est **100 % hors-ligne**, **RTL arabe**, compatible **mode sombre**, sans dépendance nouvelle
(réutilise `motion/react`, `lucide-react`, et `src/utils/audio`).

---

## 1. Câblage minimal dans `App.tsx`

### a) Imports (avec le reste des vues différées)

```tsx
const FocusTimer = lazy(() => import('./components/FocusTimer'));
const MotivationDeclic = lazy(() => import('./components/MotivationDeclic'));
```

### b) Ajouter les onglets au type `currentTab`

```tsx
// ... | 'plan' | 'bacideas' | 'focus' | 'declic'
```

### c) Créditer le temps de focus dans l'objectif quotidien

`FocusTimer` renvoie les minutes de chaque session terminée. Branche-les sur
ta config d'objectif quotidien (`DailyGoalConfig.todayMinutes`) :

```tsx
function addStudyMinutes(min: number) {
  setDailyGoals((prev) => {
    const base = prev ?? getDefaultDailyGoals();
    const todayMinutes = (base.todayMinutes ?? 0) + min;
    const completedToday =
      base.type === 'minutes' ? todayMinutes >= (base.targetMinutes ?? 25) : base.completedToday;
    return { ...base, todayMinutes, completedToday };
  });
}
```

### d) Rendu des vues

```tsx
{currentTab === 'focus' && (
  <Suspense fallback={<VueEnChargement />}>
    <FocusTimer isDarkMode={isDarkMode} onFocusComplete={addStudyMinutes} />
  </Suspense>
)}

{currentTab === 'declic' && (
  <Suspense fallback={<VueEnChargement />}>
    <MotivationDeclic
      isDarkMode={isDarkMode}
      streakDays={dailyGoals?.streakDays ?? 0}
      onStart={() => setCurrentTab('review')}   // ou 'lesson', 'quiz'…
      onStartFocus={() => setCurrentTab('focus')}
    />
  </Suspense>
)}
```

---

## 2. Recommandation d'UX (le plus efficace)

Le **Déclic** prend tout son sens **avant** une session, pas comme onglet isolé.
Deux placements gagnants :

1. **Au démarrage** (après le splash / sur le tableau de bord) : affiche
   `MotivationDeclic` une fois par jour, puis `onStart` ouvre la révision.
2. **Bouton « ابدأ المذاكرة »** du tableau de bord → ouvre le Déclic, dont le
   bouton « جلسة تركيز » ouvre le `FocusTimer`.

Enchaînement idéal :  **Déclic (déclencher) → Focus Timer (tenir) → Révision/Quiz (agir)**.

---

## 3. Personnaliser

- **Ajouter des messages** : édite `MOTIVATION_CAPSULES` dans
  `src/data/motivationCapsules.ts` (respecte le contrat en tête de fichier).
- **Cibler le contexte** : passe `contexte="avant_examen"` à l'approche du BAC,
  `contexte="apres_echec"` après une mauvaise session, etc. Si `streakDays ≥ 3`,
  le module priorise automatiquement les messages « streak ».
- **Durées du Pomodoro** : modifie `PRESETS` dans `FocusTimer.tsx`
  (classique 25/5, profond 50/10, court 15/3).

---

## 4. Clés localStorage utilisées

| Clé | Contenu |
|---|---|
| `kunz_focus_v1` | `{ date, sessions, minutes }` — bilan de focus du jour (remis à zéro chaque jour) |
| `kunz_declic_last_id_v1` | id du dernier déclic montré (évite la répétition immédiate) |

Cohérent avec ta nomenclature `kunz_*_v1`.

---

## 5. Tests suggérés (Vitest + Testing Library)

- `FocusTimer` : le compte à rebours décrémente, `onFocusComplete` est appelé
  avec `preset.focusMin` à la fin d'une phase de focus, le bilan du jour
  s'incrémente, la remise à zéro se fait à changement de date.
- `MotivationDeclic` : « رسالة أخرى » change le message, `onStart` est appelé au
  clic sur « ابدأ الآن », un `streakDays ≥ 3` affiche le badge de série.

> Astuce : utilise `vi.useFakeTimers()` pour piloter le minuteur dans les tests.
