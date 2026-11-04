/* Regroupement d'appels rapprochés — utilisé pour la persistance pendant la
   frappe. `flush()` n'est pas un confort : c'est ce qui garantit qu'un
   regroupement ne coûte jamais une réponse à l'élève. Tout point de sortie
   (remise de copie, changement d'exercice, page masquée, déchargement) doit
   vider la file avant de rendre la main. */

/**
 * @template {(...args: any[]) => void} F
 * @param {F} fn
 * @param {number} wait délai en ms
 */
export function debounce(fn, wait = 350) {
  let timer = null;
  let lastArgs = null;

  function run() {
    timer = null;
    const args = lastArgs;
    lastArgs = null;
    if (args) fn(...args);
  }

  /** Exécute immédiatement si un appel est en attente. */
  function flush() {
    if (timer === null) return;
    clearTimeout(timer);
    run();
  }

  /** Abandonne un appel en attente sans l'exécuter. */
  function cancel() {
    if (timer === null) return;
    clearTimeout(timer);
    timer = null;
    lastArgs = null;
  }

  function debounced(...args) {
    lastArgs = args;
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(run, wait);
  }

  debounced.flush = flush;
  debounced.cancel = cancel;
  debounced.pending = () => timer !== null;
  return debounced;
}
