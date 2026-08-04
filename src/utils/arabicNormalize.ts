export function normalizeArabic(input: string): string {
  if (!input) return '';

  return input
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670ـ]/g, '')
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^\u0600-\u06ffA-Za-z0-9+\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function calculateKeywordScore(normalizedInput: string, keywords: string[]): number {
  let score = 0;
  const normalizedKeywords = keywords.map((keyword) => normalizeArabic(keyword)).filter(Boolean);

  for (const keyword of normalizedKeywords) {
    if (normalizedInput.includes(keyword)) score += 1;
  }

  return score;
}

export function tokenizeArabic(input: string): string[] {
  const normalized = normalizeArabic(input);
  return Array.from(new Set(normalized.match(/[\u0600-\u06ffA-Za-z0-9+]{3,}/g) || []));
}
