// dates.pg.ts — utilitaires de mapping des colonnes date/timestamp de pg.
// Extrait de store.pg.ts pour être testable sans importer `pg`
// (incompatible jsdom/jest : pg choisit son chemin crypto selon l'env).

/** 'YYYY-MM-DD' depuis une colonne DATE pg — pg livre un objet Date bâti
 *  sur minuit LOCAL : recomposer via les composantes locales (jamais
 *  String(date).slice(0,10) qui donne « Wed Jun 30 » → date illisible).
 *  Bug de production observé (Vercel/Neon 24/10/2026) : l'abonnement
 *  persisté redevenait « essai » à la lecture à cause de ce mapping. */
export function isoleDate(v: unknown): string | null {
  if (v == null) return null;
  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, '0');
    const d = String(v.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(v).slice(0, 10);
}

/** ISO string depuis un timestamptz pg (Date). */
export function iso(v: unknown): string {
  return v instanceof Date ? v.toISOString() : String(v ?? '');
}

/** Mappe un JSONB renvoyé par pg (objet) ou une chaîne (parité SQLite). */
export function fromJson<T>(v: unknown): T {
  return (typeof v === 'string' ? JSON.parse(v) : v) as T;
}
