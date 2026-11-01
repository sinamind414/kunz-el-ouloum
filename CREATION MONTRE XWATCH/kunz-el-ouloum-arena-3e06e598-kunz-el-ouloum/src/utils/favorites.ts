// favorites.ts — R5 : favoris (leçons) + recherches récentes.
// Stockage local (localStorage), synchro serveur au prochain login via
// /api/student/sync (le store accepte déjà les paires clé/valeur de l'élève).

const FAVORITES_KEY = 'boussole_favorites';
const RECENTS_KEY = 'boussole_recent_searches';
const MAX_RECENTS = 6;

/** Un favori pointe vers une leçon (active ou passive) de l'index. */
export interface FavoriteEntry {
  lessonKey: string;
  lessonKind: 'html' | 'active';
  title: string;
  unitId: number;
  addedAt: number;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota plein ou mode privé : on échoue silencieusement (non bloquant).
  }
}

// ── Favoris ────────────────────────────────────────────────────────────────

export function getFavorites(): FavoriteEntry[] {
  return readJson<FavoriteEntry[]>(FAVORITES_KEY, []);
}

export function isFavorite(lessonKey: string): boolean {
  return getFavorites().some((f) => f.lessonKey === lessonKey);
}

export function addFavorite(entry: Omit<FavoriteEntry, 'addedAt'>): void {
  const list = getFavorites();
  if (list.some((f) => f.lessonKey === entry.lessonKey)) return;
  list.unshift({ ...entry, addedAt: Date.now() });
  writeJson(FAVORITES_KEY, list);
}

export function removeFavorite(lessonKey: string): void {
  const list = getFavorites().filter((f) => f.lessonKey !== lessonKey);
  writeJson(FAVORITES_KEY, list);
}

export function toggleFavorite(entry: Omit<FavoriteEntry, 'addedAt'>): boolean {
  if (isFavorite(entry.lessonKey)) {
    removeFavorite(entry.lessonKey);
    return false;
  }
  addFavorite(entry);
  return true;
}

// ── Recherches récentes (G5) ────────────────────────────────────────────────

export function getRecentSearches(): string[] {
  return readJson<string[]>(RECENTS_KEY, []);
}

export function pushRecentSearch(query: string): void {
  const trimmed = query.trim();
  if (trimmed.length < 2) return;
  const list = getRecentSearches().filter((q) => q !== trimmed);
  list.unshift(trimmed);
  writeJson(RECENTS_KEY, list.slice(0, MAX_RECENTS));
}

export function clearRecentSearches(): void {
  writeJson(RECENTS_KEY, []);
}
