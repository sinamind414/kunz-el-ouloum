// HtmlLessonViewer.tsx
// Affiche une leçon HTML de public/lessons via LESSON_HTML_GETTERS (?raw) dans une iframe srcdoc.
// srcdoc = isolation CSS totale : les styles Tailwind de l'app ne fuient pas dans la leçon, et inversement.
import { useEffect, useState } from 'react';
import { LESSON_HTML_GETTERS } from '../data/lessonHtmlGetters';
import { sliceLessonHtml } from '../data/lessonChapterSplit';
import {
  FIGURE_ZOOM_MARKER_END,
  FIGURE_ZOOM_MARKER_START,
  injectFigureZoom,
} from '../utils/figureZoomRuntime';

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

/**
 * RENDU ÉLÈVE (24/10/2026, GO propriétaire) — deux défauts constatés sur
 * émulateur dans les leçons servies, corrigés AU RENDU SANS toucher les
 * fichiers sur disque (projet concurrent non signé) :
 *  1. des notes internes de génération fuient à l'écran :
 *     « الوحدة: D2-U6 — … نص بتنسيق قرائي… » — 11 <p> inline font-size:11px
 *     dans ~7 fichiers phase*.html + 1 <p class="hosila-meta"> dans
 *     phase7_chapitres_13_14.html. On retire ces éléments du HTML SERVI ;
 *     le CSS (.hosila-meta/.src-chip masquées) couvre toute variante future.
 *  2. h1 (2.1rem / weight 900) et .section-title (1.3rem) tiennent sur 3+
 *     lignes en mobile → CSS injecté APRÈS le <style> de la leçon (devant
 *     </head>, même spécificité : l'ordre du DOM gagne) : h1 ≈1.35rem,
 *     .section-title ≈1.05rem.
 */
const CHIPS_PROMPT_RE = [
  // variante classe (hosila) : <p class="hosila-meta">…</p>
  /<p class="hosila-meta"[^>]*>[\s\S]*?<\/p>\s*/g,
  // variante style inline : <p style="font-size:11px;…">الوحدة: …</p> (texte
  // simple, sans balise imbriquée — vérifié sur les 11 occurrences)
  /<p style="[^"]*font-size:11px[^"]*"[^>]*>\s*الوحدة:[^<]*<\/p>\s*/g,
] as const;

function retireChipsPrompt(html: string): string {
  return CHIPS_PROMPT_RE.reduce((acc, re) => acc.replace(re, ''), html);
}

const CSS_RENDU_ELEVE =
  '<style id="pfe-rendu-eleve">'
  + '.hosila-meta,.src-chip{display:none!important}'
  + 'h1{font-size:1.35rem;font-weight:800;line-height:1.45;margin-bottom:.75rem}'
  + '.section-title{font-size:1.05rem;line-height:1.4}'
  + '</style>';

function injecteStyleRendu(html: string): string {
  // Garde d'idempotence (diag9 24/10) : sans lui, un second passage (le
  // composant applique aussi le pipeline sur certaines tranches) duplique
  // le style ; seul le DERNIER doit gagner, et un seul suffit.
  if (html.includes('id="pfe-rendu-eleve"')) return html;
  if (html.includes('</head>')) return html.replace('</head>', `${CSS_RENDU_ELEVE}</head>`);
  return `${CSS_RENDU_ELEVE}${html}`;
}

/**
 * BLOC ZOOM SÉCURISÉ AU SERVICE (24/10/2026, GO propriétaire) — LE « code de
 * page » rapporté par les élèves : le bloc de zoom (canonique ou dérivé sur
 * disque, travail concurrent non signé) contient une chaîne JS d'export/
 * impression incluant un `</script>` LITTÉRAL NON ÉCHAPPÉ. Le tokenizer HTML
 * referme donc le script DÈS CETTE CHAÎNE et tout le reste du runtime
 * s'affiche en TEXTE à l'écran (reproduit sous jsdom). Le module source et
 * les fichiers leçons étant verrouillés (projet concurrent), la correction
 * vit ici, au service :
 *  1. retireBlocZoomDerive : retire TOUT bloc délimité par les commentaires
 *     marqueurs PFE-ZOOM (idempotent, tolère la dérive du libellé) ;
 *  2. injectFigureZoom (déjà établi dans ce fichier) ré-injecte le bloc
 *     canonique ;
 *  3. securiseDernierBlocZoom : échappe les `</script>` internes de ce bloc
 *     servi en `<\/script>` (identique en JS : la valeur de la chaîne ne
 *     change pas — seul le parseur HTML n'y voit plus une fermeture).
 */
const RE_MARQUEUR_ZOOM = /<!--[^<>]*PFE-ZOOM[^<>]*-->/g;

function retireBlocZoomDerive(html: string): string {
  const marques = [...html.matchAll(RE_MARQUEUR_ZOOM)];
  if (marques.length < 2) return html;
  const debut = marques[0]!.index;
  const deuxieme = marques[1]!;
  const fin = deuxieme.index + deuxieme[0].length;
  return html.slice(0, debut) + html.slice(fin);
}

function securiseDernierBlocZoom(html: string): string {
  const debut = html.indexOf(FIGURE_ZOOM_MARKER_START);
  if (debut < 0) return html;
  const iFinMarqueur = html.indexOf(FIGURE_ZOOM_MARKER_END, debut);
  const zoneFin = iFinMarqueur < 0 ? html.length : iFinMarqueur;
  const zone = html.slice(debut, zoneFin);
  // la fermeture LÉGITIME du script est la dernière de la zone : on échappe
  // toutes les autres (chaînes d'export/impression).
  const dernier = zone.lastIndexOf('</script>');
  if (dernier < 0) return html;
  const sec = zone.slice(0, dernier).replaceAll('</script>', '<\\/script>') + zone.slice(dernier);
  return html.slice(0, debut) + sec + html.slice(zoneFin);
}

function injecteMesureHauteur(html: string): string {
  // DERNIER '</body>' (24/10/2026) — JAMAIS le premier : le bloc de zoom des
  // figures contient une chaîne JS (doc d'impression) qui inclut
  // '</body></html>' littéraux ; insérer le mesureur à la PREMIÈRE occurrence
  // le plaçait À L'INTÉRIEUR du script de zoom — son '</script>' refermait ce
  // script en plein milieu et tout le reste du runtime s'affichait en TEXTE
  // dans la leçon (« code de page » rapporté par les élèves, reproduit sous
  // jsdom). Le vrai '</body>' du document est toujours le dernier.
  // Garde d'idempotence (diag9 24/10) : si le mesureur est déjà présent, ne
  // rien réinsérer (sinon le second passage du pipeline le duplique).
  if (html.includes("type:'pfe-lecon-hauteur'")) return html;
  const i = html.lastIndexOf('</body>');
  if (i >= 0) return html.slice(0, i) + SCRIPT_MESURE_HAUTEUR + html.slice(i);
  return html + SCRIPT_MESURE_HAUTEUR;
}

/**
 * M8 (audit 2026-10-18) : les modules ?raw des leçons sont épurés du bloc
 * runtime de zoom au build (plugin vite.config leconRuntimeDedupPlugin — les
 * fichiers sur disque restent complets pour les verrous). Ici on ré-injecte
 * le bloc canonique via injectFigureZoom() : idempotent, et capable de mettre
 * à niveau un bloc obsolète s'il était présent — même sémantique que
 * `npm run figures:zoom`, mais au rendu. S'il s'agit d'une tranche de
 * chapitre sans </body>, on ferme le document pour permettre l'injection.
 * Exporté (GO 24/10/2026) pour les tests du rendu élève — fonction pure,
 * sans I/O : couvrable par vitest ET jest sans mock.
 */
export function compileLecon(html: string): string {
  const purifie = retireChipsPrompt(html);
  const sansZoomDerive = retireBlocZoomDerive(purifie);
  const base = sansZoomDerive.includes('</body>') ? sansZoomDerive : `${sansZoomDerive}</body>`;
  const injection = injectFigureZoom(base);
  return injecteMesureHauteur(injecteStyleRendu(securiseDernierBlocZoom(injection.html)));
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
