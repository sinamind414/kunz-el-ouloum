// QcmLivreView.tsx — « اختبار الكتاب » : QCM PAR CHAPITRE DU LIVRE OFFICIEL
// (banque src/data/qcmLivre.ts + index des 55 chapitres). Couvre les 16
// chapitres sans quiz de leçons — complément direct des leçons passives.
// Chaque question affiche le schéma du livre (SVG) et l'explication après réponse.

import { useMemo, useState } from 'react';
import { BookOpen, ChevronLeft } from 'lucide-react';
import { QCM_CHAPITRES } from '../data/qcmLivre';
import QcmBilanView from './QcmBilanView';
import { CHAPITRES } from '../data/bookIndex';

interface Props {
  onBack: () => void;
}

const titreChapitre = (n: number) => CHAPITRES[n - 1]?.titreAr ?? `الفصل ${n}`;

export default function QcmLivreView({ onBack }: Props) {
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [bilan, setBilan] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const parUnite = useMemo(() => {
    const map = new Map<number, { chapter: number; titreAr: string; nb: number }[]>();
    for (const q of QCM_CHAPITRES) {
      const c = CHAPITRES[q.chapitre - 1];
      // uniteId global 1-11 : D1 = 1-5, D2 = 6-8, D3 = 9-11 (miroir de cleUnite)
      const uniteGlobale = c ? c.unit + (c.domain === 1 ? 0 : c.domain === 2 ? 5 : 8) : q.chapitre;
      if (!map.has(uniteGlobale)) map.set(uniteGlobale, []);
      map.get(uniteGlobale)!.push({ chapter: q.chapitre, titreAr: titreChapitre(q.chapitre), nb: 0 });
    }
    for (const liste of map.values()) {
      for (const entree of liste) entree.nb = QCM_CHAPITRES.filter((q) => q.chapitre === entree.chapter).length;
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, []);

  const questions = selectedChapter ? QCM_CHAPITRES.filter((q) => q.chapitre === selectedChapter) : [];
  const repondu = Object.keys(answers).length;
  const score = questions.filter((q, i) => answers[i] === q.correct).length;
  const termine = selectedChapter !== null && repondu === questions.length && questions.length > 0;

  if (bilan) {
    return <QcmBilanView onBack={() => setBilan(false)} />;
  }

  // ----- Écran 1 : unités → chapitres disponibles -----
  if (selectedChapter === null) {
    return (
      <div dir="rtl" className="space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200"
          >
            <span>→</span>
            <span>عودة</span>
          </button>
          <h2 className="text-xl font-black flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#006d37]" />
            اختبار الكتاب — حسب الفصول
          </h2>
          <button
            onClick={() => setBilan(true)}
            className="mr-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm bg-[#b45309] text-white hover:bg-[#92400e] transition-colors shadow"
          >
            🎯 اختبار تشخيصي شامل
          </button>
        </div>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
          {QCM_CHAPITRES.length} سؤالا يغطي {new Set(QCM_CHAPITRES.map((q) => q.chapitre)).size} فصلا من الكتاب الرسمي — كل سؤال مع مخططه وتفسيره
        </p>
        {parUnite.map(([unite, chapitres]) => (
          <section key={unite} className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c18] overflow-hidden">
            <header className="bg-gradient-to-l from-[#006d37]/10 to-[#10b981]/10 dark:from-emerald-950/40 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-black text-[#006d37] dark:text-emerald-300">الوحدة {unite}</h3>
            </header>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {chapitres.map((ch) => (
                <button
                  key={ch.chapter}
                  onClick={() => { setSelectedChapter(ch.chapter); setAnswers({}); }}
                  className="group p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c18] hover:border-emerald-400 hover:shadow-md transition-all text-right flex items-center gap-3"
                >
                  <span className="shrink-0 w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#006d37] dark:text-emerald-300 font-black flex items-center justify-center text-sm">
                    {ch.chapter}
                  </span>
                  <span className="flex-1 text-sm font-bold text-gray-800 dark:text-gray-100 leading-snug">{ch.titreAr}</span>
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">{ch.nb} أسئلة</span>
                  <ChevronLeft className="w-4 h-4 text-gray-300 group-hover:text-emerald-500" />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  // ----- Écran 2 : lecteur de quiz du chapitre -----
  return (
    <div dir="rtl" className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSelectedChapter(null)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200"
        >
          <span>→</span>
          <span>عودة إلى الفصول</span>
        </button>
        <h2 className="text-lg font-black">
          الفصل {selectedChapter} : {titreChapitre(selectedChapter)}
        </h2>
      </div>

      {termine && (
        <div className={`p-4 rounded-2xl font-black text-center text-sm ${score === questions.length ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'}`}>
          النتيجة : {score} / {questions.length} {score === questions.length ? '🎉 إجابات كاملة!' : '— راجع التفسيرات أدناه ثم أعد المحاولة'}
        </div>
      )}

      {questions.map((q, i) => {
        const choisi = answers[i];
        const aRepondu = choisi !== undefined;
        return (
          <div key={i} className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c18] p-4 space-y-3">
            <div className="flex items-start gap-2">
              <span className="shrink-0 w-7 h-7 rounded-lg bg-[#006d37] text-white font-black flex items-center justify-center text-xs">{i + 1}</span>
              <p className="text-sm font-black text-gray-900 dark:text-white leading-relaxed">{q.question}</p>
            </div>

            <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white">
              <img src={q.schema} alt={`مخطط الفصل ${q.chapitre}`} className="w-full max-h-72 object-contain" loading="lazy" />
            </div>

            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const estBonne = oi === q.correct;
                const estChoisie = choisi === oi;
                let cls = 'border-gray-200 dark:border-gray-800 hover:border-emerald-400';
                if (aRepondu && estBonne) cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';
                else if (aRepondu && estChoisie && !estBonne) cls = 'border-red-400 bg-red-50 dark:bg-red-950/40';
                else if (aRepondu) cls = 'border-gray-100 dark:border-gray-800 opacity-60';
                return (
                  <button
                    key={oi}
                    disabled={aRepondu}
                    onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                    className={`w-full text-right p-3 rounded-2xl border-2 transition-all text-sm font-bold text-gray-800 dark:text-gray-100 ${cls}`}
                  >
                    {aRepondu && estBonne ? '✅ ' : aRepondu && estChoisie ? '❌ ' : ''}{opt}
                  </button>
                );
              })}
            </div>

            {aRepondu && (
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-xs font-bold text-blue-800 dark:text-blue-200 leading-relaxed">
                💡 {q.explication}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
