import { useEffect, useMemo, useRef, useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { LESSON_LIBRARY } from '../lessonData';
import { INITIAL_UNITS } from '../data';

// Lazy dynamic importers for the lesson HTML (Vite `?raw`).
// Each getter is only fetched (and therefore bundled into its own chunk)
// the first time a student actually opens that lesson — so the initial
// app bundle stays tiny and stays 100% offline (no network at runtime).
const LESSON_HTML_GETTERS: Record<string, () => Promise<{ default: string }>> = {
  lecon_transcription: () => import('../../public/lessons/lecon_transcription.html?raw'),
  phase1_chapitres_1_2: () => import('../../public/lessons/phase1_chapitres_1_2.html?raw'),
  phase2_chapitres_3_4: () => import('../../public/lessons/phase2_chapitres_3_4.html?raw'),
  phase3_chapitres_5_6: () => import('../../public/lessons/phase3_chapitres_5_6.html?raw'),
  phase4_chapitres_7_8: () => import('../../public/lessons/phase4_chapitres_7_8.html?raw'),
  phase5_chapitres_9_10: () => import('../../public/lessons/phase5_chapitres_9_10.html?raw'),
  phase6_chapitres_11_12: () => import('../../public/lessons/phase6_chapitres_11_12.html?raw'),
  phase7_chapitres_13_14: () => import('../../public/lessons/phase7_chapitres_13_14.html?raw'),
  phase8_chapitres_15_16: () => import('../../public/lessons/phase8_chapitres_15_16.html?raw'),
  phase9_chapitres_17_18: () => import('../../public/lessons/phase9_chapitres_17_18.html?raw'),
  phase10_chapitres_19_20: () => import('../../public/lessons/phase10_chapitres_19_20.html?raw'),
  phase11_chapitres_21_22: () => import('../../public/lessons/phase11_chapitres_21_22.html?raw'),
  phase12_chapitres_23_24: () => import('../../public/lessons/phase12_chapitres_23_24.html?raw'),
  phase13_chapitres_25_26: () => import('../../public/lessons/phase13_chapitres_25_26.html?raw'),
  phase14_chapitres_27_28: () => import('../../public/lessons/phase14_chapitres_27_28.html?raw'),
  phase15_chapitres_29_30: () => import('../../public/lessons/phase15_chapitres_29_30.html?raw'),
  phase16_chapitres_31_32: () => import('../../public/lessons/phase16_chapitres_31_32.html?raw'),
  phase17_chapitres_33_34: () => import('../../public/lessons/phase17_chapitres_33_34.html?raw'),
  phase18_chapitres_35_36: () => import('../../public/lessons/phase18_chapitres_35_36.html?raw'),
  phase19_chapitres_37_38: () => import('../../public/lessons/phase19_chapitres_37_38.html?raw'),
  phase20_chapitres_39_40: () => import('../../public/lessons/phase20_chapitres_39_40.html?raw'),
  phase21_chapitres_41_42: () => import('../../public/lessons/phase21_chapitres_41_42.html?raw'),
  phase22_chapitres_43_44: () => import('../../public/lessons/phase22_chapitres_43_44.html?raw'),
};

interface HtmlLessonViewerProps {
  lessonKey: string;
  onClose: () => void;
}

// Map a (possibly split) lesson key to its bundled HTML source.
function htmlBaseKeyFor(lessonKey: string): string {
  if (LESSON_HTML_GETTERS[lessonKey]) return lessonKey;
  const base = Object.keys(LESSON_HTML_GETTERS).find((k) => lessonKey.startsWith(k + '_'));
  return base ?? lessonKey;
}

// Each bundled HTML file contains 2 chapters (e.g. phase1 = leçon 1 + leçon 2).
// A split lesson key (leçon 2) becomes `${baseKey}_2`. Resolve which chapter
// of the file should be displayed so only the selected lesson is shown.
function chapterIndexFor(lessonKey: string, baseKey: string): number {
  if (lessonKey === baseKey) return 0;
  if (lessonKey.startsWith(baseKey + '_')) {
    const n = parseInt(lessonKey.slice(baseKey.length + 1), 10);
    if (!Number.isNaN(n) && n >= 1) return n - 1;
  }
  return 0;
}

// Domain palette — must stay in sync with DOMAIN_INFO in LessonsView.
const DOMAIN_COLORS: Record<string, { color: string; light: string }> = {
  'التخصص الوظيفي للبروتينات': { color: '#006d37', light: '#eafaf1' },
  'التحولات الطاقوية': { color: '#b45309', light: '#fef3e2' },
  'التكتونية العامة': { color: '#1d4ed8', light: '#eaf1fe' },
};

// Resolve the domain colour for a (possibly split) lesson key so every
// chapter is themed with its domain colour (e.g. tectonique → bleu).
function domainColorFor(lessonKey: string): { color: string; light: string } {
  const base = htmlBaseKeyFor(lessonKey);
  const item =
    LESSON_LIBRARY.find((l) => l.key === base) ?? LESSON_LIBRARY.find((l) => l.key === lessonKey);
  const unit = INITIAL_UNITS.find((u) => u.id === item?.unitId);
  if (unit && DOMAIN_COLORS[unit.domain]) return DOMAIN_COLORS[unit.domain];
  return { color: '#1d4ed8', light: '#eaf1fe' };
}

// Each phase is rendered as its OWN full-screen document (no scroll / no snap).
// The domain colour is injected so the whole lesson adopts its domain theme
// (overriding the per-chapter colours hard-coded in the source HTML).
function buildInjectCss(color: string, light: string): string {
  return `
  .navbar { display: none !important; }
  .container { max-width: 920px; margin: 0 auto; padding: 1.4rem; }
  body {
    margin: 0;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    overflow-y: auto;
    font-family: 'Noto Kufi Arabic', 'Work Sans', 'Inter', sans-serif;
  }
  body > * { margin: auto 0; width: 100%; box-sizing: border-box; }
  .lesson-header {
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    margin: auto 0 !important;
    padding: 1.8rem !important;
    overflow-y: auto;
    background: ${color} !important;
  }
  section.card {
    border: none !important;
    box-shadow: none !important;
    background: var(--surface, #ffffff) !important;
    border-radius: 0 !important;
    margin: auto 0 !important;
    padding: 1.8rem !important;
    overflow-y: auto;
  }
  /* Domain-themed accents */
  :root { --accent: ${color} !important; --primary: ${color} !important; --cyan-dark: ${color} !important; --stone-dark: ${color} !important; }
  .step-num, .step-num-stone { background: ${light} !important; color: ${color} !important; }
  .section-title { color: ${color} !important; border-bottom-color: ${light} !important; }
  .text-part { border-right-color: ${color} !important; }
  .text-part h4 { color: ${color} !important; }
  .text-part.ch42-border { border-right-color: ${color} !important; }
  .text-part.ch42-border h4 { color: ${color} !important; }
  .problem-box { border-right-color: ${color} !important; }
  .method-tag { background: ${light} !important; color: ${color} !important; }
  .option-btn:hover { border-color: ${color} !important; background: ${light} !important; }
  .lesson-breadcrumb, .lesson-objectives { color: #ffffff !important; }
  @media (max-width: 640px) { .container { padding: 0.9rem; } .lesson-header, section.card { padding: 1.1rem !important; } }
`;
}

export default function HtmlLessonViewer({ lessonKey, onClose }: HtmlLessonViewerProps) {
  const baseKey = htmlBaseKeyFor(lessonKey);
  const domain = useMemo(() => domainColorFor(lessonKey), [lessonKey]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [phases, setPhases] = useState<string[]>([]);
  const [assets, setAssets] = useState<{ styleText: string; scriptText: string }>({ styleText: '', scriptText: '' });
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [error, setError] = useState(false);

  // Copy the app's @font-face rules (Noto Kufi Arabic / Work Sans) into the
  // iframe so the lesson renders with the same font as the rest of the app.
  // The parent's rules already point at resolved absolute URLs, so this stays offline.
  const injectAppFonts = () => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    let css = '';
    for (const sheet of Array.from(document.styleSheets)) {
      let rules: CSSRuleList | undefined;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      if (!rules) continue;
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSFontFaceRule) css += rule.cssText + '\n';
      }
    }
    if (!css) return;
    const style = doc.createElement('style');
    style.dataset.appFonts = 'true';
    style.textContent = css;
    doc.head.appendChild(style);
  };
  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | undefined;
    setPhases([]);
    setPhaseIndex(0);
    setError(false);

    const loader = LESSON_HTML_GETTERS[baseKey];
    if (!loader) {
      setError(true);
      return () => {
        cancelled = true;
      };
    }

    loader()
      .then((mod) => {
        if (cancelled) return;
        const html = mod.default;
        // Defer to keep the loading state visible and avoid blocking paint.
        timeoutId = window.setTimeout(() => {
          if (cancelled) return;
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const styleText = Array.from(doc.querySelectorAll('style'))
            .map((s) => s.textContent)
            .join('\n');
          const scriptText = Array.from(doc.querySelectorAll('script'))
            .map((s) => s.textContent)
            .join('\n');
          // Group the document into chapters. Each `.lesson-header` starts a new
          // chapter, but it is only a coloured cover page (title + lesson number +
          // objectives) — we intentionally drop it as a slide so every lesson is
          // shown as exactly its 4 content steps (the `section.card` blocks).
          const chapterEls = Array.from(
            doc.querySelectorAll('.lesson-header, section.card')
          ) as HTMLElement[];
          const chapters: HTMLElement[][] = [];
          let current: HTMLElement[] | null = null;
          for (const el of chapterEls) {
            if (el.classList.contains('lesson-header')) {
              current = [];
              chapters.push(current);
            } else if (current) {
              current.push(el);
            }
          }
          const chapterIndex = chapterIndexFor(lessonKey, baseKey);
          const selectedChapter = chapters[chapterIndex] ?? chapters[0] ?? [];
          const built = selectedChapter.map((el) => el.outerHTML);
          setPhases(built);
          setAssets({ styleText, scriptText });
        }, 0);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [baseKey, lessonKey]);

  const docFor = useMemo(() => {
    if (phases.length === 0) return '';
    const phaseHTML = phases[phaseIndex] ?? '';
    return `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><style>${assets.styleText}</style><style>${buildInjectCss(domain.color, domain.light)}</style></head><body>${phaseHTML}<script>${assets.scriptText}</script></body></html>`;
  }, [phases, phaseIndex, assets]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a] flex flex-col">
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-[#0f172a] border-b border-white/10 text-white">
        <span className="text-xs font-bold opacity-80">الدرس التفاعلي (HTML)</span>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Single phase, no scroll */}
      <div className="flex-1 min-h-0">
        {error ? (
          <div className="h-full flex items-center justify-center text-white/80 text-sm text-center px-6">
            تعذر تحميل ملف الدرس.
            <br />
            <button onClick={onClose} className="mt-3 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20">
              إغلاق
            </button>
          </div>
        ) : phases.length > 0 ? (
          <iframe
            key={phaseIndex}
            ref={iframeRef}
            onLoad={injectAppFonts}
            srcDoc={docFor}
            title="lesson-phase"
            className="w-full h-full border-0 bg-white dark:bg-[#0f172a]"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-white/60 text-sm">تحميل الدرس...</div>
        )}
      </div>

      {/* Phase navigation */}
      <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 bg-[#0f172a] border-t border-white/10 text-white">
        <button
          onClick={() => setPhaseIndex((i) => Math.max(0, i - 1))}
          disabled={phaseIndex === 0}
          className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 disabled:opacity-30 cursor-pointer transition-all"
        >
          <ChevronRight className="w-4 h-4" />
          السابقة
        </button>

        <span className="text-xs font-bold opacity-80">
          {phases.length > 0 ? `${phaseIndex + 1} / ${phases.length}` : '...'}
        </span>

        <button
          onClick={() => setPhaseIndex((i) => Math.min(phases.length - 1, i + 1))}
          disabled={phaseIndex >= phases.length - 1}
          className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold bg-[#2ecc71] hover:bg-[#27b765] disabled:opacity-30 cursor-pointer transition-all"
        >
          التالية
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
