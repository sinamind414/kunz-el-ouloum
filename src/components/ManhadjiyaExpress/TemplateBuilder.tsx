import { useMemo, useState, useEffect } from 'react';
import { parseTemplate } from '../../data/manhadjiyaModules';

interface TemplateBuilderProps {
  /** Template avec des [espaces] à compléter. */
  template: string;
  /** Remonte le texte composé au parent à chaque changement. */
  onChange: (composedText: string) => void;
}

/**
 * Constructeur "fill-in-the-blanks" : rend le template avec des champs éditables
 * à la place des [crochets], et compose le texte final en direct (aperçu auto).
 */
export default function TemplateBuilder({ template, onChange }: TemplateBuilderProps) {
  const segments = useMemo(() => parseTemplate(template), [template]);
  const blankIndexes = useMemo(
    () => segments.map((s, i) => (s.type === 'blank' ? i : -1)).filter((i) => i >= 0),
    [segments]
  );

  const [values, setValues] = useState<Record<number, string>>({});

  // Réinitialise les champs quand le template change (changement de module).
  useEffect(() => {
    setValues({});
  }, [template]);

  const compose = (vals: Record<number, string>) =>
    segments
      .map((s, i) => (s.type === 'text' ? s.value : (vals[i]?.trim() ? vals[i] : '')))
      .join('')
      .replace(/\s+/g, ' ')
      .trim();

  const handleInput = (index: number, v: string) => {
    const next = { ...values, [index]: v };
    setValues(next);
    onChange(compose(next));
  };

  return (
    <div className="space-y-3">
      {/* Zone éditable en ligne */}
      <div
        dir="rtl"
        className="rounded-2xl border-2 border-dashed border-[#006d37]/30 dark:border-[#2ecc71]/30 bg-[#f8fbf9] dark:bg-[#0f1512] p-4 leading-[2.6] text-sm text-gray-800 dark:text-gray-100"
      >
        {segments.map((seg, i) =>
          seg.type === 'text' ? (
            <span key={i}>{seg.value}</span>
          ) : (
            <input
              key={i}
              type="text"
              value={values[i] || ''}
              onChange={(e) => handleInput(i, e.target.value)}
              placeholder={seg.value}
              className="inline-block mx-1 my-0.5 px-2 py-1 min-w-[90px] max-w-full rounded-lg border border-[#006d37]/40 bg-white dark:bg-[#141916] text-[#006d37] dark:text-[#2ecc71] font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#006d37]/40"
              style={{ width: `${Math.max(90, (values[i]?.length || seg.value.length) * 9)}px` }}
            />
          )
        )}
      </div>

      {/* Aperçu automatique */}
      <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-3">
        <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 mb-1">معاينة إجابتك</p>
        <p dir="rtl" className="text-sm text-gray-700 dark:text-gray-200 leading-7 min-h-[1.5rem]">
          {compose(values) || '…'}
        </p>
      </div>

      <p className="text-[10px] text-gray-400 text-center">
        عدد الحقول: {blankIndexes.length}
      </p>
    </div>
  );
}
