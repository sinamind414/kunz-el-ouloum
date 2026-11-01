import type { LessonProgression } from './activeLessons';
import type { DocumentPracticeContext } from './documentPracticeContexts';

export function detectCycle(
  progressions: Record<string, LessonProgression>
): { hasCycle: boolean; path: string[] } {
  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(node: string, stack: string[]): string[] {
    if (inStack.has(node)) {
      const cycleStart = stack.indexOf(node);
      return stack.slice(cycleStart).concat(node);
    }
    if (visited.has(node)) return [];
    visited.add(node);
    inStack.add(node);
    stack.push(node);

    const prog = progressions[node];
    if (prog?.nextLessonId && progressions[prog.nextLessonId]) {
      const result = dfs(prog.nextLessonId, stack);
      if (result.length > 0) return result;
    }

    stack.pop();
    inStack.delete(node);
    return [];
  }

  for (const key of Object.keys(progressions)) {
    const result = dfs(key, []);
    if (result.length > 0) {
      return { hasCycle: true, path: result };
    }
  }
  return { hasCycle: false, path: [] };
}

export function findDuplicateExerciseIds(
  contexts: DocumentPracticeContext[]
): string[] {
  const seen = new Map<string, number>();
  for (const ctx of contexts) {
    seen.set(ctx.exerciseId, (seen.get(ctx.exerciseId) ?? 0) + 1);
  }
  return Array.from(seen.entries())
    .filter(([, count]) => count > 1)
    .map(([id]) => id);
}

export function findDuplicateQuestionIds(
  contexts: DocumentPracticeContext[]
): string[] {
  const seen = new Map<string, number>();
  for (const ctx of contexts) {
    seen.set(ctx.questionId, (seen.get(ctx.questionId) ?? 0) + 1);
  }
  return Array.from(seen.entries())
    .filter(([, count]) => count > 1)
    .map(([id]) => id);
}

export function buildExerciseIdSet(contexts: DocumentPracticeContext[]): Set<string> {
  return new Set(contexts.map((ctx) => ctx.exerciseId));
}

export function validateLessonIntegrity(
  lessonId: string,
  activeLessons: Record<string, unknown>,
  goldSummaries: Record<string, unknown>,
  progressions: Record<string, unknown>,
  conceptRoutes: Record<string, unknown>,
): string[] {
  const errors: string[] = [];

  if (!(lessonId in activeLessons)) {
    errors.push(`Leçon '${lessonId}' absente de ACTIVE_LESSONS`);
  }
  if (!(lessonId in goldSummaries)) {
    errors.push(`Leçon '${lessonId}' absente de LESSON_GOLD_SUMMARIES`);
  }
  if (!(lessonId in progressions)) {
    errors.push(`Leçon '${lessonId}' absente de LESSON_PROGRESSION`);
  }

  const hasRoute = Object.entries(conceptRoutes).some(
    ([, route]) => (route as { lessonId?: string }).lessonId === lessonId
  );

  if (!hasRoute) {
    errors.push(
      `Leçon '${lessonId}' n'apparaît dans aucune CONCEPT_ROUTES`
    );
  }

  return errors;
}
