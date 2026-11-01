// ============================================================
// rateLimit.ts — limiteurs en mémoire (fenêtre glissante)
// Par IP (anti-spam) et par compte (5 échecs/15 min, reset au
// succès) — mêmes règles que le serveur JSON d'origine.
// ============================================================
export interface RateLimiter {
  /** Enregistre un essai ; false si la fenêtre est pleine. */
  hit(key: string): boolean;
  /** Remet le compteur à zéro (ex. après une connexion réussie). */
  reset(key: string): void;
  /** Nombre d'essais dans la fenêtre courante. */
  count(key: string): number;
}

export function makeRateLimiter(max: number, windowMs: number): RateLimiter {
  const hits = new Map<string, number[]>();
  return {
    hit(key: string): boolean {
      const now = Date.now();
      const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
      if (arr.length >= max) {
        hits.set(key, arr);
        return false;
      }
      arr.push(now);
      hits.set(key, arr);
      return true;
    },
    reset(key: string): void {
      hits.delete(key);
    },
    count(key: string): number {
      const now = Date.now();
      return (hits.get(key) || []).filter((t) => now - t < windowMs).length;
    },
  };
}
