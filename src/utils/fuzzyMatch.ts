// fuzzyMatch.ts
// Fuzzy matching borné aux slots courts (≤ ~40 car) pour fillBlank.
// Levenshtein ≤ 2 + synonymes. Pas de matching 70% keywords pour phrases longues.

export function levenshtein(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix: number[][] = Array.from({ length: bn + 1 }, (_, i) => [i]);
  for (let j = 1; j <= an; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[bn][an];
}

export function isShortSlot(text: string, maxLength = 40): boolean {
  return text.trim().length <= maxLength;
}

export function fuzzyMatchSlot(input: string, expected: string, maxDistance = 2): boolean {
  const a = input.trim().toLowerCase();
  const b = expected.trim().toLowerCase();
  if (a === b) return true;
  if (!isShortSlot(a) || !isShortSlot(b)) return false;
  return levenshtein(a, b) <= maxDistance;
}
