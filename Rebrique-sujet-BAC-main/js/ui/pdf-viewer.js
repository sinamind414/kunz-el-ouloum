/* ============================================================
   Visionneuse du sujet — un seul point de construction.
   ------------------------------------------------------------
   Le PDF local (subjects/**) est servi par la même origine : la CSP
   autorise frame-src 'self'. Mais le lecteur PDF du navigateur, lui,
   n'est pas fiable — bloqué par object-src 'none' sur Chromium,
   inexistant sur mobile. Le sujet est donc rendu sur <canvas> par
   pdf.js (js/ui/pdf-renderer.js) dans `[data-pdf-canvas]` ; l'iframe
   reste présente, masquée, uniquement comme repli si ce rendu
   échoue. Le lien dzexams et le téléchargement complètent l'ensemble.
   ============================================================ */

import { escapeHTML } from "./dom.js";

export function pdfViewerHTML(subject, { showCover = true, page = null } = {}) {
  const local = subject?.pdfLocalUrl;
  const external = subject?.pdfExternalUrl;
  const label = `موضوع البكالوريا ${subject?.id === 1 ? "الأول" : "الثاني"}`;
  // #page=N ouvre directement la page du fichier (N = page du PDF local, jamais
  // la page du document officiel quand les deux diffèrent).
  const anchor = Number.isInteger(page) && page > 0 ? `#page=${page}` : "#view=FitH";
  if (local) {
    return `<div class="pdf-reader stack">
      ${showCover ? `<div class="pdf-viewer-head"><strong>📄 ${escapeHTML(label)}</strong></div>` : ""}
      <div class="pdf-canvas-host" data-pdf-canvas data-pdf-src="${escapeHTML(local)}" data-pdf-page="${Number.isInteger(page) && page > 0 ? page : 1}" role="group" aria-label="${escapeHTML(label)}"></div>
      <iframe class="pdf-frame" title="${escapeHTML(label)}" src="${escapeHTML(local)}${anchor}" hidden></iframe>
      <div class="flex wrap pdf-viewer-actions">
        <a class="btn btn-indigo btn-sm" href="${escapeHTML(local)}${anchor}" target="_blank" rel="noopener noreferrer">📄 فتح في نافذة مستقلة</a>
        <a class="btn btn-ghost btn-sm" href="${escapeHTML(local)}" download>⬇️ تنزيل PDF</a>
        ${external ? `<a class="small" href="${escapeHTML(external)}" target="_blank" rel="noopener noreferrer" title="يُفتح في عارض خارجي قد يعرض النص العربي معكوسا — العرض الداخلي أعلاه هو المرجع الصحيح">المصدر الخارجي ⚠️</a>` : ""}
      </div>
    </div>`;
  }
  if (external) {
    return `<div class="pdf-reader stack">
      <div class="pdf-reader-cover" role="status">
        <span class="pdf-reader-icon" aria-hidden="true">📄</span>
        <strong>لا يوجد ملف محلي لهذا الموضوع</strong>
        <p class="small text-muted">يُفتح الموضوع على المصدر الخارجي في نافذة مستقلة.</p>
      </div>
      <a class="btn btn-indigo btn-block pdf-open" href="${escapeHTML(external)}" target="_blank" rel="noopener noreferrer" title="يُفتح في عارض خارجي قد يعرض النص العربي معكوسا">📄 فتح المصدر الخارجي ⚠️</a>
    </div>`;
  }
  return `<div class="center stack preview-empty"><p class="small text-muted">لا يوجد ملف موضوع متاح لهذه الدورة في التطبيق.</p></div>`;
}

export { disposeAllPdfViewers, disposePdfViewer, mountPdfViewer, mountPdfViewers } from "./pdf-renderer.js";
