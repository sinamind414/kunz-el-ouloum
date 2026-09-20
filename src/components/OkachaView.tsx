// OkachaView.tsx — « بنك الحفظ » : récapitulatifs numérotés par unité du livre
// عكاشة (injection mécanique — scripts/build_okacha.py + okacha.lock.test.ts).
// Texte source OCR filtré mécaniquement ; notice affichée à l'élève.

import { useMemo, useState } from 'react';
import { BookMarked } from 'lucide-react';
import { OKACHA_UNITES } from '../data/okacha';

interface Props {
  onBack: () => void;
}

const NOM_DOMAINE: Record<number, string> = {
  1: 'المجال 1 — التخصص الوظيفي للبروتينات',
  2: 'المجال 2 — التحولات الطاقوية',
  3: 'المجال 3 — التكتونية العامة',
};

export default function OkachaView({ onBack }: Props) {
  const [domaine, setDomaine] = useState<1 | 2 | 3>(1);
  const [ouverte, setOuverte] = useState<string | null>(OKACHA_UNITES[0]?.id ?? null);

  const unites = useMemo(() => OKACHA_UNITES.filter((u) => u.domaine === domaine), [domaine]);

  return (
    <div dir="rtl" className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200"
        >
          <span>→</span>
          <span>عودة</span>
        </button>
        <h2 className="text-xl font-black flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-[#1d4ed8]" />
          بنك الحفظ — كل ما يجب حفظه
        </h2>
      </div>

      <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs font-bold text-blue-900 dark:text-blue-200 leading-relaxed">
        ملخصات مرقّمة « ما يجب حفظه » لكل وحدة (المصدر : كتاب عكاشة، نص ممسوح ضوئياً
        منقّى آلياً) — اقرأ، ثم اختبر نفسك في « اختبار الكتاب ».
      </div>

      <div className="flex gap-2">
        {([1, 2, 3] as const).map((d) => (
          <button
            key={d}
            onClick={() => { setDomaine(d); setOuverte(OKACHA_UNITES.find((u) => u.domaine === d)?.id ?? null); }}
            className={`flex-1 px-3 py-2 rounded-xl text-xs font-black transition-colors ${domaine === d ? 'bg-[#1d4ed8] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200'}`}
          >
            {NOM_DOMAINE[d]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {unites.map((u) => {
          const ouverteU = ouverte === u.id;
          return (
            <section key={u.id} className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c18] overflow-hidden">
              <button
                onClick={() => setOuverte(ouverteU ? null : u.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-right bg-gradient-to-l from-blue-500/10 to-transparent dark:from-blue-950/40 hover:from-blue-500/20"
              >
                <span className="text-sm font-black text-gray-800 dark:text-gray-100">{u.uniteAr}</span>
                <span className="text-[10px] font-black text-blue-700 dark:text-blue-300">
                  {ouverteU ? '▲ إخفاء' : `▼ ${u.lignes.length} نقطة`}
                </span>
              </button>
              {ouverteU && (
                <div className="px-4 pb-4">
                  <pre
                    dir="rtl"
                    className="whitespace-pre-wrap text-xs font-bold text-gray-800 dark:text-gray-100 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3"
                  >
                    {u.lignes.join('\n')}
                  </pre>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
