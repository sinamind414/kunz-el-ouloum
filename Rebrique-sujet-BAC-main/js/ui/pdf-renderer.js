/* ============================================================
   Visionneuse PDF embarquée — rendu pdf.js sur <canvas>
   ------------------------------------------------------------
   Pourquoi ne pas s'en remettre au lecteur du navigateur :
     • Chromium n'affiche pas un PDF dans un cadre quand la CSP
       impose object-src 'none' (cas de ce projet) ;
     • Safari iOS et Chrome Android n'affichent rien du tout dans
       une iframe PDF ;
     • le rendu natif n'est pas personnalisable et casse le mode
       hors ligne.
   On rend donc les pages sur <canvas> avec pdf.js, servi par la
   même origine (assets/vendor/pdfjs, voir scripts/vendor-pdfjs.mjs).
   En cas d'échec — bibliothèque absente, mémoire, navigateur trop
   ancien — on ne laisse jamais un cadre vide : l'iframe de repli
   est révélée et les liens d'ouverture/téléchargement restent là.
   ============================================================ */

const VENDOR_DIR = "assets/vendor/pdfjs/";
const SCRIPT_ID = "pdfjs-vendor-script";
/* Paliers de zoom : la taille affichée passe par un attribut + une classe CSS
   (jamais par element.style, que la CSP stricte et P1.6 interdisent). */
const ZOOM_STEPS = [0.8, 1, 1.25, 1.5, 1.75, 2];
const DEFAULT_ZOOM_INDEX = 1;

const states = new WeakMap();
let libraryPromise = null;

/* Cible des écouteurs globaux. Sous Node (donc en test) `globalThis` n'est pas
   une EventTarget : sans cette résolution, l'accroche « resize » est
   silencieusement ignorée — la fuite devient invisible et son nettoyage
   impossible à vérifier. Dans un navigateur `globalThis.window === globalThis`,
   le comportement est strictement identique. */
function eventTarget() {
  return globalThis.window || globalThis;
}

/* Erreurs qui ne justifient pas de second essai : le fichier est absent ou
   injoignable, le worker n'y est pour rien et relancer le téléchargement ne
   ferait que doubler l'attente de l'élève. */
const FETCH_FAILURE =
  /Unexpected server response|NetworkError|Failed to fetch|Missing PDF|InvalidPDFException|PasswordException/i;
/**
 * Ouvre le PDF. pdf.js v3 exige un worker : s'il ne démarre pas (navigateur
 * ancien, worker-src restreint, application ouverte en file://), on rejoue
 * l'ouverture en demandant à pdf.js d'analyser le fichier sur le fil
 * principal. Plus lent, mais le sujet reste lisible dans l'application au
 * lieu de retomber sur l'iframe, que Chromium n'affiche pas sous notre CSP.
 * @param {any} pdfjs
 * @param {string} src
 */
async function openDocument(pdfjs, src) {
  pdfjs.GlobalWorkerOptions.workerSrc = vendorUrl("pdf.worker.min.js");
  /* CMaps + polices standard : sans ces données servies depuis la même
     origine, pdf.js abandonne les glyphes qu'il ne sait pas décoder —
     polices CID des PDF arabes retraités, Helvetica/Times non intégrées.
     Mesuré le 2026-09-20 : 42 PDF sur 58 perdaient du texte à l'affichage
     (« getPathGenerator - ignoring character », jusqu'à 14 % d'encre
     manquante par page). On ne négocie pas : le sujet doit être lisible. */
  const params = {
    url: src,
    isEvalSupported: false,
    cMapUrl: vendorUrl("cmaps/"),
    cMapPacked: true,
    standardFontDataUrl: vendorUrl("standard_fonts/")
  };
  try {
    return await pdfjs.getDocument(params).promise;
  } catch (workerError) {
    if (FETCH_FAILURE.test(String(workerError?.message || ""))) throw workerError;
    return await pdfjs.getDocument({ ...params, disableWorker: true }).promise;
  }
}

function vendorUrl(file) {
  // document.baseURI : l'application peut être servie depuis une racine
  // différente (dépôt, dist, sous-dossier) sans casser le chemin.
  return new URL(VENDOR_DIR + file, document.baseURI).href;
}

function loadLibrary() {
  if (globalThis.pdfjsLib) return Promise.resolve(globalThis.pdfjsLib);
  if (libraryPromise) return libraryPromise;
  libraryPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = vendorUrl("pdf.min.js");
    script.async = true;
    script.onload = () =>
      globalThis.pdfjsLib
        ? resolve(globalThis.pdfjsLib)
        : reject(new Error("pdf.js chargé mais pdfjsLib absent"));
    script.onerror = () => reject(new Error("pdf.js inaccessible"));
    document.head.appendChild(script);
  }).catch((error) => {
    libraryPromise = null; // permet une nouvelle tentative plus tard
    throw error;
  });
  return libraryPromise;
}

function statusNode(host) {
  let node = host.querySelector("[data-pdf-status]");
  if (!node) {
    node = document.createElement("p");
    node.className = "small text-muted pdf-viewer-status";
    node.setAttribute("data-pdf-status", "");
    node.setAttribute("role", "status");
    host.prepend(node);
  }
  return node;
}

function setStatus(host, message) {
  statusNode(host).textContent = message;
}

/* Cause probable d'un échec de rendu, en une phrase arabe courte. Quand le
   sujet ne s'affiche pas dans l'application, l'élève (ou le rapport de bug)
   doit savoir s'il s'agit du fichier, du réseau ou du lecteur embarqué —
   une note générique ne permet aucun diagnostic. */
function describeViewerFailure(error) {
  const detail = String(error?.message || error || "");
  if (/\(404\)|Missing PDF|ressources? (?:manquante|introuvable)/i.test(detail)) {
    return "ملف الموضوع غير موجود";
  }
  if (/Unexpected server response|NetworkError|Failed to fetch|Load failed|network/i.test(detail)) {
    return "تعذّر تحميل الملف (مشكلة شبكة)";
  }
  if (/pdf\.js|pdfjsLib|worker|Worker/i.test(detail)) {
    return "تعذّر تشغيل قارئ PDF المدمج";
  }
  if (/Password|protégé|محمي/i.test(detail)) {
    return "الملف محمي بكلمة مرور أو تالف";
  }
  return "خطأ غير متوقع أثناء العرض";
}

/** Révèle l'iframe de repli et explique pourquoi le rendu direct a échoué. */
function fallbackToFrame(host, message) {
  const parent = host.parentElement;
  const frame = parent?.querySelector("iframe.pdf-frame");
  host.hidden = true;
  if (frame) frame.hidden = false;
  if (!parent) return;
  // Bug #B23 : à chaque échec de chargement pdf.js, fallbackToFrame créait un
  // nouveau <p class="pdf-viewer-fallback"> sans vérifier si une note existait
  // déjà. Après disposeViewerState + retry, deux notes empilaient
  // (« premier échec » + « deuxième échec ») et l'ARIA region annonçait deux
  // statuts contradictoires. On cherche d'abord la note existante par
  // sélecteur de classe simple (compatible DOM natif ET les mini-DOM de test)
  // et on met à jour son texte ; sinon on en crée une seule.
  let note = parent.querySelector(".pdf-viewer-fallback");
  if (!note) {
    note = document.createElement("p");
    note.className = "feedback mid small pdf-viewer-fallback";
    note.setAttribute("role", "status");
    parent.appendChild(note);
  }
  note.textContent = message;
}

function toolbar() {
  return `<div class="pdf-viewer-toolbar" role="group" aria-label="أدوات عرض الموضوع">
    <button type="button" class="btn btn-ghost btn-sm" data-pdf-prev aria-label="الصفحة السابقة">◀ السابق</button>
    <span class="pill"><span class="mono" data-pdf-page>1</span> / <span class="mono" data-pdf-pages>1</span></span>
    <button type="button" class="btn btn-ghost btn-sm" data-pdf-next aria-label="الصفحة التالية">التالي ▶</button>
    <button type="button" class="btn btn-ghost btn-sm" data-pdf-zoom-out aria-label="تصغير">➖</button>
    <span class="pill"><span class="mono" data-pdf-zoom>100%</span></span>
    <button type="button" class="btn btn-ghost btn-sm" data-pdf-zoom-in aria-label="تكبير">➕</button>
  </div>`;
}

async function renderPage(pdf, state, index) {
  const page = await pdf.getPage(index);
  const canvas = state.canvases[index - 1];
  if (!canvas || !canvas.isConnected) return;
  const dpr = Math.min(2, globalThis.devicePixelRatio || 1);
  const unscaled = page.getViewport({ scale: 1 });
  const fit = Math.max(0.35, (state.width - 24) / unscaled.width);
  // Le canvas est redimensionné par la CSS (largeur en % du conteneur selon le
  // palier de zoom) ; on ne rend ici que la résolution du tampon.
  const viewport = page.getViewport({ scale: fit * state.zoom * dpr });
  const context = canvas.getContext("2d");
  if (!context) return;
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  canvas.dataset.pdfPage = String(index);
  await page.render({ canvasContext: context, viewport }).promise;
  page.cleanup();
}

async function renderAll(pdf, state) {
  // La page demandée d'abord : l'élève attend son énoncé, pas la fin du fichier.
  const order = [
    state.current,
    ...Array.from({ length: pdf.numPages }, (_, i) => i + 1).filter((n) => n !== state.current)
  ];
  for (const index of order) {
    if (state.token !== state.host.dataset.pdfToken) return; // hôte remplacé
    try {
      await renderPage(pdf, state, index);
    } catch (error) {
      setStatus(state.host, `تعذّر عرض الصفحة ${index}.`);
    }
  }
  state.host.dataset.pdfState = "ready";
  setStatus(state.host, `${pdf.numPages} صفحة — الموضوع معروض داخل التطبيق.`);
}

function buildCanvases(state, count) {
  const host = state.host;
  host.querySelectorAll("canvas").forEach((canvas) => canvas.remove());
  state.canvases = Array.from({ length: count }, (_, index) => {
    const canvas = document.createElement("canvas");
    canvas.className = "pdf-page-canvas";
    canvas.setAttribute("data-pdf-canvas-page", String(index + 1));
    canvas.setAttribute("aria-label", `صفحة ${index + 1}`);
    return canvas;
  });
  host.append(...state.canvases);
}

function setZoom(state, index) {
  const clamped = Math.min(ZOOM_STEPS.length - 1, Math.max(0, index));
  if (clamped === state.zoomIndex) return;
  state.zoomIndex = clamped;
  state.zoom = ZOOM_STEPS[clamped];
  updateIndicator(state);
  renderAll(state.pdf, state);
}

function goToPage(state, page) {
  const clamped = Math.min(state.pages, Math.max(1, page));
  state.current = clamped;
  const canvas = state.canvases[clamped - 1];
  // scrollIntoView n'existe pas partout : on ne casse jamais la navigation.
  canvas?.scrollIntoView?.({ block: "start" });
  updateIndicator(state);
}

function updateIndicator(state) {
  const page = state.host.querySelector("[data-pdf-page]");
  const pages = state.host.querySelector("[data-pdf-pages]");
  const zoom = state.host.querySelector("[data-pdf-zoom]");
  if (page) page.textContent = String(state.current);
  if (pages) pages.textContent = String(state.pages);
  if (zoom) zoom.textContent = `${Math.round(state.zoom * 100)}%`;
  state.host.dataset.pdfZoom = String(Math.round(state.zoom * 100));
}

function bindToolbar(state) {
  const host = state.host;
  host.querySelector("[data-pdf-prev]")?.addEventListener("click", () => goToPage(state, state.current - 1));
  host.querySelector("[data-pdf-next]")?.addEventListener("click", () => goToPage(state, state.current + 1));
  host.querySelector("[data-pdf-zoom-in]")?.addEventListener("click", () => {
    setZoom(state, state.zoomIndex + 1);
  });
  host.querySelector("[data-pdf-zoom-out]")?.addEventListener("click", () => {
    setZoom(state, state.zoomIndex - 1);
  });
  // Rotation du téléphone / redimensionnement : on re-rend à la bonne largeur
  // plutôt que d'étirer un canvas devenu flou.
  // Le minuteur vit sur `state` (pas dans la fermeture) : disposePdfViewer doit
  // pouvoir l'annuler, sinon il se déclenche après le nettoyage et re-rend un
  // document pdf.js déjà détruit.
  state.resizeTimer = null;
  state.onResize = () => {
    globalThis.clearTimeout(state.resizeTimer);
    state.resizeTimer = globalThis.setTimeout(() => {
      state.resizeTimer = null;
      if (state.disposed || !state.pdf) return;
      const width = state.host.clientWidth || state.width;
      if (Math.abs(width - state.width) < 40) return;
      state.width = width;
      renderAll(state.pdf, state);
    }, 500);
  };
  eventTarget().addEventListener?.("resize", state.onResize);
  host.addEventListener("scroll", () => {
    const top = host.scrollTop + 8;
    let current = 1;
    for (const canvas of state.canvases) {
      if (canvas.offsetTop <= top) current = Number(canvas.dataset.pdfCanvasPage) || current;
    }
    if (current !== state.current) {
      state.current = current;
      updateIndicator(state);
    }
  });
}

/**
 * Rend un PDF dans un conteneur `[data-pdf-canvas]`.
 * @param {HTMLElement} host
 * @param {{ src: string, page?: number }} options
 */
export async function mountPdfViewer(host, options = {}) {
  const src = options.src || host.dataset.pdfSrc;
  const requested = Number(options.page || host.dataset.pdfPage || 1);
  if (!src || host.dataset.pdfMounted === "1") return;
  host.dataset.pdfMounted = "1";
  host.dataset.pdfToken = String(Date.now());
  host.dataset.pdfState = "loading";
  host.insertAdjacentHTML("afterbegin", toolbar());
  setStatus(host, "جارٍ تحميل الموضوع…");

  const state = {
    host,
    zoom: ZOOM_STEPS[DEFAULT_ZOOM_INDEX],
    zoomIndex: DEFAULT_ZOOM_INDEX,
    current: Number.isFinite(requested) && requested > 0 ? Math.floor(requested) : 1,
    pages: 1,
    canvases: [],
    token: host.dataset.pdfToken,
    width: host.clientWidth || 720
  };
  states.set(host, state);

  try {
    const pdfjs = await loadLibrary();
    const pdf = await openDocument(pdfjs, src);
    state.pdf = pdf;
    state.pages = pdf.numPages;
    buildCanvases(state, pdf.numPages);
    bindToolbar(state);
    updateIndicator(state);
    await renderAll(pdf, state);
    if (state.current > 1) goToPage(state, state.current);
  } catch (error) {
    host.dataset.pdfState = "failed";
    disposePdfViewer(host);
    fallbackToFrame(
      host,
      `تعذّر عرض الموضوع داخل التطبيق (السبب: ${describeViewerFailure(error)}). ` +
        "استخدم «فتح في نافذة مستقلة» أو «تنزيل PDF» أدناه لقراءته."
    );
    if (globalThis.console) console.warn("pdf.js indisponible:", error);
  }
}

/** Bug #B18 : export de disposePdfViewer pour nettoyer un visionneur avant
 *  un remontage (écrans détruits/réaffichés, navigation SPA). Avant le fix,
 *  les listeners resize restaient accrochés et le pdf.js instance n'était
 *  jamais destroy() → fuite mémoire cumulative à chaque consultation. */
export function disposePdfViewer(host) {
  const state = states.get(host);
  if (!state) return;
  state.disposed = true;
  if (state.onResize) eventTarget().removeEventListener?.("resize", state.onResize);
  state.onResize = null;
  globalThis.clearTimeout(state.resizeTimer);
  state.resizeTimer = null;
  state.pdf?.destroy?.();
  state.pdf = null;
  states.delete(host);
  // Note : on NE supprime PAS la note de fallback pour qu'elle reste
  // affichée tant que le DOM parent n'est pas démonté.
}

/** Dispose tous les visionneurs encore référencés par leurs hôtes. Utile
 *  lors d'un changement d'écran (view-hub → view-workspace). */
export function disposeAllPdfViewers(scope = document) {
  const hosts = [...scope.querySelectorAll("[data-pdf-canvas]")];
  for (const host of hosts) disposePdfViewer(host);
}

/** Monte tous les visionneurs d'un sous-arbre du DOM (écran, tiroir…). */
export function mountPdfViewers(scope = document) {
  const hosts = [...scope.querySelectorAll("[data-pdf-canvas]")].filter(
    (host) => host.dataset.pdfMounted !== "1"
  );
  for (const host of hosts) mountPdfViewer(host);
  return hosts.length;
}
