// BacExamView.tsx — « اختبار نمط بكالوريا » : 3 tests complets (D1/D2/D3)
// générés mécaniquement depuis la source PROGRAMME NATIONAL (voir
// scripts/build_bac_exam.py + bacExam.lock.test.ts). Auto-évaluation guidée par
// le barème officiel : l'élève coche les questions réussies, le total /20 se
// calcule localement (aucune IA, aucune note automatique de rédaction).

import { useMemo, useState } from 'react';
import { FileText, GraduationCap } from 'lucide-react';
import { BAC_TESTS } from '../data/bacExam';

interface Props {
  onBack: () => void;
}

export default function BacExamView({ onBack }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [cochees, setCochees] = useState<Record<string, boolean>>({});
  const [reveles, setReveles] = useState<Record<string, boolean>>({});

  const test = useMemo(() => BAC_TESTS.find((t) => t.domaine === selected) ?? null, [selected]);
  const score = useMemo(() => {
    if (!test) return 0;
    let s = 0;
    for (const e of test.exercices)
      for (const q of e.questions) {
        const cle = `${test.id}/${e.titre}/${q.num}`;
        if (cochees[cle]) s += q.points;
      }
    return Math.round(s * 100) / 100;
  }, [test, cochees]);

  const nbCochees = Object.values(cochees).filter(Boolean).length;

  // ----- Écran 1 : choix du domaine -----
  if (!test) {
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
            <GraduationCap className="w-5 h-5 text-[#b45309]" />
            اختبارات نمط البكالوريا
          </h2>
        </div>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
          3 اختبارات كاملة (4 تمارين × 5 نقاط، 3 ساعات) مع عناصر الإجابة وسلّم التنقيط —
          صحّح نفسك بالاعتماد على سلّم التنقيط
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BAC_TESTS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setSelected(t.domaine);
                setCochees({});
                setReveles({});
              }}
              className="p-5 rounded-3xl border-2 border-amber-200 dark:border-amber-900/50 bg-white dark:bg-[#161c18] hover:border-amber-500 hover:shadow-lg transition-all text-right space-y-2"
            >
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-[#b45309] dark:text-amber-300">
                <FileText className="w-6 h-6" />
              </span>
              <span className="block text-base font-black text-gray-800 dark:text-gray-100">{t.titreAr}</span>
              <span className="block text-xs font-bold text-gray-500 dark:text-gray-400">
                4 تمارين · 61 سؤالاً موزعة على 20 نقطة · 3 ساعات
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ----- Écran 2 : le test -----
  return (
    <div dir="rtl" className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setSelected(null)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200"
        >
          <span>→</span>
          <span>عودة إلى الاختبارات</span>
        </button>
        <h2 className="text-lg font-black">{test.titreAr}</h2>
        <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-black">
          نتيجتك الحالية : {score} / 20 ({nbCochees} سؤالاً مُصحّحاً)
        </span>
      </div>

      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs font-bold text-amber-900 dark:text-amber-200 leading-relaxed">
        {test.notice}
      </div>

      <pre className="whitespace-pre-wrap text-xs font-bold text-gray-600 dark:text-gray-300 leading-relaxed bg-white dark:bg-[#161c18] border border-gray-200 dark:border-gray-800 rounded-2xl p-4" dir="rtl">{test.enTete}</pre>

      {test.exercices.map((e) => {
        const cleEx = `${test.id}/${e.titre}`;
        const revelé = !!reveles[cleEx];
        return (
          <section key={e.titre} className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c18] overflow-hidden">
            <header className="flex items-center justify-between px-4 py-3 bg-gradient-to-l from-amber-500/10 to-transparent dark:from-amber-950/40 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-black text-gray-800 dark:text-gray-100">{e.titre}</h3>
              <span className="text-xs font-black text-amber-700 dark:text-amber-300">({e.points} نقاط)</span>
            </header>
            <div className="p-4 space-y-4">
              <pre className="whitespace-pre-wrap text-sm font-bold text-gray-800 dark:text-gray-100 leading-relaxed" dir="rtl">{e.enonce}</pre>

              <div className="space-y-2">
                <p className="text-xs font-black text-gray-500 dark:text-gray-400">
                  🔎 التصحيح الذاتي — ضع علامة على كل سؤال أجبت عنه إجابة كاملة :
                </p>
                {e.questions.map((q) => {
                  const cle = `${cleEx}/${q.num}`;
                  const actif = !!cochees[cle];
                  return (
                    <label
                      key={q.num}
                      className={`flex items-start gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${actif ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' : 'border-gray-200 dark:border-gray-800 hover:border-emerald-300'}`}
                    >
                      <input
                        type="checkbox"
                        checked={actif}
                        onChange={() => setCochees((c) => ({ ...c, [cle]: !c[cle] }))}
                        className="mt-1 w-4 h-4 accent-emerald-600"
                      />
                      <span className="flex-1 text-xs font-bold text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 font-black ml-2">س{q.num}</span>
                        {q.text}
                      </span>
                      <span className="shrink-0 text-[10px] font-black text-emerald-700 dark:text-emerald-400">({q.points} ن)</span>
                    </label>
                  );
                })}
              </div>

              <div>
                <button
                  onClick={() => setReveles((r) => ({ ...r, [cleEx]: !r[cleEx] }))}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200"
                >
                  {revelé ? '▲ إخفاء عناصر الإجابة' : '▼ إظهار عناصر الإجابة وسلّم التنقيط'}
                </button>
                {revelé && (
                  <pre className="mt-3 whitespace-pre-wrap text-xs font-bold text-blue-900 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4 leading-relaxed" dir="rtl">{e.corrige}</pre>
                )}
              </div>
            </div>
          </section>
        );
      })}

      <div className={`p-4 rounded-2xl font-black text-center text-sm ${score >= 10 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'}`}>
        المجموع : {score} / 20 {score === 0 ? '— ابدأ بالتصحيح الذاتي بعد حل التمارين على الورق' : score >= 10 ? '— مستوى إيجابي، راجع الأخطاء' : '— أعد مراجعة الدروس ثم أعِد المحاولة'}
      </div>
    </div>
  );
}
