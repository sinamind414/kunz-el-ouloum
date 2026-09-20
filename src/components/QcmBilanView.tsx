// QcmBilanView.tsx — « اختبار تشخيصي شامل » : 15 QCM tirés de façon déterministe
// dans les 81 QCM vérifiés (leçons + banque livre — voir src/data/qcmBilan.ts).
// Diagnostic par domaine + renvoi de révision (chapitre du livre / leçon) après coup.

import { useMemo, useState } from 'react';
import { Target } from 'lucide-react';
import { tirageBilan, type QcmBilanItem } from '../data/qcmBilan';

interface Props {
  onBack: () => void;
}

type Phase = 'intro' | 'run' | 'done';

const NOM_DOMAINE: Record<number, string> = {
  1: 'المجال 1 — التخصص الوظيفي للبروتينات',
  2: 'المجال 2 — التحولات الطاقوية',
  3: 'المجال 3 — التكتونية العامة',
};

export default function QcmBilanView({ onBack }: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [seed, setSeed] = useState(0);
  const [idx, setIdx] = useState(0);
  const [choix, setChoix] = useState<number[]>([]); // option choisie par question (-1 = sautée)

  const tirage = useMemo(() => (seed ? tirageBilan(seed) : []), [seed]);

  const demarrer = () => {
    setSeed(Date.now() % 2147483647 || 1); // graine par session — reproductible si notée
    setIdx(0);
    setChoix([]);
    setPhase('run');
  };

  const score = choix.reduce((a, c, i) => a + (c === tirage[i]?.correct ? 1 : 0), 0);
  const parDomaine = useMemo(() => {
    const m = new Map<number, { ok: number; total: number }>();
    tirage.forEach((q, i) => {
      const d = m.get(q.domaine) ?? { ok: 0, total: 0 };
      d.total += 1;
      if (choix[i] === q.correct) d.ok += 1;
      m.set(q.domaine, d);
    });
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [tirage, choix]);

  // ----- intro -----
  if (phase === 'intro') {
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
            <Target className="w-5 h-5 text-[#b45309]" />
            اختبار تشخيصي شامل
          </h2>
        </div>
        <div className="p-6 rounded-3xl border-2 border-amber-200 dark:border-amber-900/50 bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/30 dark:to-[#161c18] space-y-4">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200 leading-relaxed">
            <b>15 سؤالا</b> من مجموع بنك الأسئلة الكامل (81 سؤالا) : <b>5 في كل مجال</b> من
            المجالات الثلاثة، مرتّبة كامنة عن الطلبة. جواب فوري مع تفسير، ثم تشخيص نقاط
            ضعفك مع إحالة مراجعة لكل خطأ (فصل الكتاب أو الدرس).
          </p>
          <button
            onClick={demarrer}
            className="w-full py-3 rounded-2xl bg-[#b45309] text-white font-black text-base hover:bg-[#92400e] transition-colors"
          >
            ▶ ابدأ التشخيص
          </button>
        </div>
      </div>
    );
  }

  // ----- résultat -----
  if (phase === 'done') {
    const fautes = tirage.filter((q, i) => choix[i] !== q.correct);
    return (
      <div dir="rtl" className="space-y-4">
        <div className={`p-5 rounded-3xl text-center font-black text-lg ${score >= 12 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' : score >= 8 ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'}`}>
          النتيجة : {score} / 15
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {parDomaine.map(([d, v]) => (
            <div key={d} className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c18]">
              <p className="text-xs font-black text-[#006d37] dark:text-emerald-300 mb-1">{NOM_DOMAINE[d]}</p>
              <p className="text-lg font-black text-gray-800 dark:text-gray-100">{v.ok} / {v.total}</p>
            </div>
          ))}
        </div>
        {fautes.length > 0 && (
          <section className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c18] p-4 space-y-3">
            <h3 className="text-sm font-black text-gray-800 dark:text-gray-100">خطة المراجعة — {fautes.length} خطأ :</h3>
            {fautes.map((q) => (
              <div key={q.id} className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 text-xs font-bold text-gray-800 dark:text-gray-100">
                <p className="leading-relaxed">{q.question}</p>
                <p className="mt-1 text-emerald-700 dark:text-emerald-400">
                  ✅ {q.options[q.correct]}
                </p>
                {q.explication && <p className="mt-1 text-blue-800 dark:text-blue-200">💡 {q.explication}</p>}
                <p className="mt-1 text-amber-700 dark:text-amber-400">
                  📌 راجع : {q.source === 'livre' ? q.sourceLabel : `الدرس (${q.sourceLabel})`}
                </p>
              </div>
            ))}
          </section>
        )}
        <div className="flex gap-3">
          <button onClick={demarrer} className="flex-1 py-3 rounded-2xl bg-[#b45309] text-white font-black hover:bg-[#92400e]">
            ↻ تشخيص جديد
          </button>
          <button onClick={onBack} className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-black hover:bg-gray-200">
            عودة إلى الفصول
          </button>
        </div>
      </div>
    );
  }

  // ----- déroulé -----
  const q: QcmBilanItem = tirage[idx];
  const choisi = choix[idx];
  const repondu = choisi !== undefined;
  const dernier = idx === tirage.length - 1;

  return (
    <div dir="rtl" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setPhase('intro')}
          className="px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200"
        >
          ✕ إنهاء
        </button>
        <span className="text-xs font-black text-gray-500 dark:text-gray-400">
          السؤال {idx + 1} / {tirage.length} — {NOM_DOMAINE[q.domaine]}
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
        <div className="h-full bg-[#b45309] transition-all" style={{ width: `${((idx + (repondu ? 1 : 0)) / tirage.length) * 100}%` }} />
      </div>

      <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c18] p-4 space-y-3">
        <div className="flex items-start gap-2">
          <span className="shrink-0 px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-black text-gray-500">
            {q.source === 'livre' ? q.sourceLabel : 'درس'}
          </span>
          <p className="text-sm font-black text-gray-900 dark:text-white leading-relaxed">{q.question}</p>
        </div>

        {q.schema && (
          <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white">
            <img src={q.schema} alt="مخطط" className="w-full max-h-72 object-contain" loading="lazy" />
          </div>
        )}

        <div className="space-y-2">
          {q.options.map((opt, oi) => {
            const estBonne = oi === q.correct;
            const estChoisie = choisi === oi;
            let cls = 'border-gray-200 dark:border-gray-800 hover:border-emerald-400';
            if (repondu && estBonne) cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';
            else if (repondu && estChoisie && !estBonne) cls = 'border-red-400 bg-red-50 dark:bg-red-950/40';
            else if (repondu) cls = 'border-gray-100 dark:border-gray-800 opacity-60';
            return (
              <button
                key={oi}
                disabled={repondu}
                onClick={() => setChoix((c) => { const n = [...c]; n[idx] = oi; return n; })}
                className={`w-full text-right p-3 rounded-2xl border-2 transition-all text-sm font-bold text-gray-800 dark:text-gray-100 ${cls}`}
              >
                {repondu && estBonne ? '✅ ' : repondu && estChoisie ? '❌ ' : ''}{opt}
              </button>
            );
          })}
        </div>

        {repondu && q.explication && (
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-xs font-bold text-blue-800 dark:text-blue-200 leading-relaxed">
            💡 {q.explication}
          </div>
        )}

        {repondu && (
          <button
            onClick={() => (dernier ? setPhase('done') : setIdx((i) => i + 1))}
            className="w-full py-3 rounded-2xl bg-[#006d37] text-white font-black hover:bg-[#00552b]"
          >
            {dernier ? '🏁 النتيجة والتشخيص' : 'التالي ←'}
          </button>
        )}
      </div>
    </div>
  );
}
