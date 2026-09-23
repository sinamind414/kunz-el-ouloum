// HtmlLessonViewer.tsx
// Affiche une leçon HTML de content/lessons via LESSON_HTML_GETTERS (?raw) dans une iframe srcdoc.
// srcdoc = isolation CSS totale : les styles Tailwind de l'app ne fuient pas dans la leçon, et inversement.
import { useEffect, useState } from 'react';
import { LESSON_HTML_GETTERS } from '../data/lessonHtmlGetters';
import { sliceLessonHtml } from '../data/lessonChapterSplit';

interface Props {
  lessonKey: string;
  onBack: () => void;
  onNext?: () => void;
  nextTitleAr?: string;
}

export default function HtmlLessonViewer({ lessonKey, onBack, onNext, nextTitleAr }: Props) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setHtml(null);
    setError(null);
    const getter = LESSON_HTML_GETTERS[lessonKey];
    if (!getter) {
      setError(`لا توجد عريضة HTML لهذا الدرس (${lessonKey})`);
      return;
    }
    getter()
      .then((m) => { if (alive) setHtml(sliceLessonHtml(m.default, lessonKey)); })
      .catch(() => { if (alive) setError('تعذّر تحميل الدرس.'); });
    return () => { alive = false; };
  }, [lessonKey]);

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
          <iframe
            title={`lesson-${lessonKey}`}
            srcDoc={html}
            className="w-full"
            style={{ height: '78vh', border: 'none', display: 'block' }}
          />
        </div>
      )}
    </div>
  );
}
