// HtmlLessonViewer.tsx
// Affiche une leçon HTML de public/lessons via LESSON_HTML_GETTERS (?raw) dans une iframe srcdoc.
// srcdoc = isolation CSS totale : les styles Tailwind de l'app ne fuient pas dans la leçon, et inversement.
import { useEffect, useState } from 'react';
import { LESSON_HTML_GETTERS } from '../data/lessonHtmlGetters';
import { sliceLessonHtml } from '../data/lessonChapterSplit';
import { injectFigureZoom } from '../utils/figureZoomRuntime';

interface Props {
  lessonKey: string;
  onBack: () => void;
  onNext?: () => void;
  nextTitleAr?: string;
}

/**
 * m11 (audit 2026-10-17) : hauteur FIXE 78vh = double défilement sur mobile et
 * contenu long encadré. FIX : un petit script mesurateur est INJECTÉ dans la
 * leçon (le composant possède déjà la chaîne html) et signale la hauteur réelle
 * via postMessage — compatible sandbox="allow-scripts" SANS allow-same-origin
 * (verrou sandbox.lock) : on NE lit JAMAIS le document interne de l'iframe
 * (interdit depuis une origine opaque), la leçon fait venir sa hauteur elle-même.
 */
const SCRIPT_MESURE_HAUTEUR = `<script>(function(){function r(){var h=Math.max(document.documentElement.scrollHeight,document.body?document.body.scrollHeight:0);if(h>0){parent.postMessage({type:'pfe-lecon-hauteur',h:h},'*');}}if(document.readyState!=='loading'){r();}else{document.addEventListener('DOMContentLoaded',r);}window.addEventListener('load',r);window.addEventListener('resize',r);if('ResizeObserver' in window){new ResizeObserver(r).observe(document.documentElement);}})();</script>`;

function injecteMesureHauteur(html: string): string {
  if (html.includes('</body>')) return html.replace('</body>', `${SCRIPT_MESURE_HAUTEUR}</body>`);
  return `${html}${SCRIPT_MESURE_HAUTEUR}`;
}

/**
 * M8 (audit 2026-10-18) : les modules ?raw des leçons sont épurés du bloc
 * runtime de zoom au build (plugin vite.config leconRuntimeDedupPlugin — les
 * fichiers sur disque restent complets pour les verrous). Ici on ré-injecte
 * le bloc canonique via injectFigureZoom() : idempotent, et capable de mettre
 * à niveau un bloc obsolète s'il était présent — même sémantique que
 * `npm run figures:zoom`, mais au rendu. S'il s'agit d'une tranche de
 * chapitre sans </body>, on ferme le document pour permettre l'injection.
 */
function compileLecon(html: string): string {
  const base = html.includes('</body>') ? html : `${html}</body>`;
  const injection = injectFigureZoom(base);
  return injecteMesureHauteur(injection.html);
}

export default function HtmlLessonViewer({ lessonKey, onBack, onNext, nextTitleAr }: Props) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  //null = hauteur pas encore signalée → repli 78vh (l'ancien comportement).
  const [hauteurPx, setHauteurPx] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    setHtml(null);
    setError(null);
    setHauteurPx(null);
    const getter = LESSON_HTML_GETTERS[lessonKey];
    if (!getter) {
      setError(`لا توجد عريضة HTML لهذا الدرس (${lessonKey})`);
      return;
    }
    getter()
      .then((m) => { if (alive) setHtml(compileLecon(sliceLessonHtml(m.default, lessonKey))); })
      .catch(() => { if (alive) setError('تعذّر تحميل الدرس.'); });
    return () => { alive = false; };
  }, [lessonKey]);

  useEffect(() => {
    function surMessage(e: MessageEvent) {
      const d = e.data as { type?: string; h?: unknown } | null;
      if (!d || d.type !== 'pfe-lecon-hauteur') return;
      if (typeof d.h !== 'number' || !Number.isFinite(d.h)) return;
      const h = Math.round(d.h);
      // garde-fou : une leçon ne pousse jamais une hauteur absurde
      if (h >= 200 && h <= 80000) setHauteurPx(h);
    }
    window.addEventListener('message', surMessage);
    return () => window.removeEventListener('message', surMessage);
  }, []);

  return (
    <div dir="rtl" className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
        >
          <span>→</span>
          <span>عودة إلى قائمة الدروس</span>
        </button>
        {onNext && (
          <button
            onClick={onNext}
            className="px-4 py-2 rounded-xl font-bold text-sm bg-[#006d37] hover:bg-[#00562b] text-white shadow-md transition-all"
          >
            الدرس الموالي ← {nextTitleAr}
          </button>
        )}
      </div>

      {error && (
        <div className="p-6 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200 font-bold text-sm text-center">
          {error}
        </div>
      )}

      {!error && html === null && (
        <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c18] text-center font-bold text-sm text-gray-500">
          … جارٍ تحميل الدرس
        </div>
      )}

      {html !== null && (
        <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm bg-white">
          {/* M10/M11 (2026-10-17) : sandbox SANS allow-same-origin — origine
              opaque, le JS inline des leçons ne peut plus toucher au
              localStorage/JWT de l'app. Mesuré : aucune leçon n'utilise le
              stockage ni le réseau ; allow-scripts seul suffit (verrou
              src/__tests__/sandbox.lock.test.ts). */}
          {/* m11 : hauteur = contenu réel (postMessage du mesureur injecté),
              repli 78vh avant la première mesure — plus de double défilement. */}
          <iframe
            title={`lesson-${lessonKey}`}
            srcDoc={injecteMesureHauteur(html)}
            sandbox="allow-scripts"
            className="w-full"
            style={{ height: hauteurPx ?? '78vh', border: 'none', display: 'block' }}
          />
        </div>
      )}
    </div>
  );
}
