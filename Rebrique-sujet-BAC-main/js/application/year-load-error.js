/* ============================================================
   Échec de chargement d'une année — classification honnête
   ------------------------------------------------------------
   `loadYear()` peut échouer pour trois raisons que l'élève ne
   distingue pas, mais que l'application DOIT distinguer :

     1. `network` : le module n'a pas pu être téléchargé (hors
        ligne, serveur injoignable, service worker sans copie en
        cache). Ce n'est pas une donnée fausse : c'est une donnée
        ABSENTE. Le message doit le dire, y compris quand
        `navigator.onLine` ment (portail captif, serveur éteint :
        `onLine === true` alors qu'aucun octet ne passe).

     2. `stale` : la copie de l'application sur l'appareil ne
        correspond plus aux données servies (catalogue d'années et
        charge utile de deux versions différentes — typiquement
        après une mise à jour du service worker dans un onglet déjà
        ouvert). Recharger répare : l'état de l'élève est persisté.

     3. `unknown` : tout le reste. On ne prétend pas savoir.

   Un seul message pour les trois cas faisait croire à l'élève que
   l'année était cassée, alors qu'il suffisait parfois de
   recharger ou de retrouver du réseau.
   ============================================================ */

export const YEAR_LOAD_ERROR_KINDS = Object.freeze(["network", "stale", "unknown"]);

/** Formulations réseau vues sur Chromium, Firefox et Safari pour un `import()`
 *  qui échoue, y compris derrière un service worker qui répond `Response.error()`. */
const NETWORK_PATTERN =
  /failed to fetch|dynamically imported module|error loading dynamically imported|networkerror|load failed|importing a module script failed/i;

/** Messages lancés par validateLoadedYear()/loadYear() (data/subjects.js) :
 *  la charge utile ne correspond pas au catalogue chargé dans la page. */
const STALE_PATTERN = /غير متطابقة|غير صالح|سنة غير معروف|identit/i;

/**
 * @param {unknown} error
 * @returns {"network" | "stale" | "unknown"}
 */
export function classifyYearLoadError(error) {
  if (!error) return "unknown";
  const name = String(error?.name || "").toLowerCase();
  const message = String(error?.message || (typeof error === "string" ? error : ""));
  if (
    error instanceof TypeError ||
    name === "typeerror" ||
    name === "networkerror" ||
    NETWORK_PATTERN.test(message)
  ) {
    return "network";
  }
  if (error instanceof RangeError || name === "rangeerror" || STALE_PATTERN.test(message)) {
    return "stale";
  }
  return "unknown";
}

export const YEAR_LOAD_MESSAGES = Object.freeze({
  network: "هذه السنة غير محفوظة على الجهاز. اتصل بالإنترنت ثم أعد فتحها مرة واحدة.",
  staleReloading: "نسخة التطبيق على جهازك قديمة — جارٍ تحديث الصفحة…",
  staleManual: "نسخة التطبيق على جهازك قديمة. حدّث الصفحة ثم أعد المحاولة.",
  unknown: "تعذّر تحميل بيانات هذه السنة. أعد المحاولة."
});
