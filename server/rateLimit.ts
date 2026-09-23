// ============================================================
// rateLimit.ts — limiteurs en mémoire (fenêtre glissante)
// Par IP (anti-spam) et par compte (5 échecs/15 min, reset au
// succès) — mêmes règles que le serveur JSON d'origine.
// F8 : le Map est épongé (clés expirées) pour éviter la fuite
// mémoire sur clés d'IP/emails jamais remises à zéro.
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
  let lastPrune = 0;

  /** Éponge les clés entièrement expirées (au plus 1× par fenêtre). */
  function prune(now: number): void {
    if (now - lastPrune < windowMs) return;
    lastPrune = now;
    for (const [k, arr] of hits) {
      const live = arr.filter((t) => now - t < windowMs);
      if (live.length === 0) hits.delete(k);
      else hits.set(k, live);
    }
  }

  return {
    hit(key: string): boolean {
      const now = Date.now();
      prune(now);
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
      const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
      if (arr.length === 0) hits.delete(key);
      return arr.length;
    },
  };
}
