import { useState } from 'react';
import { motion } from 'motion/react';
import { Stethoscope, ChevronLeft } from 'lucide-react';
import {
  DIAGNOSTIC_QUESTIONS,
  DIAGNOSTIC_STORAGE_KEY,
  type Lang,
} from '../../data/manhadjiyaModules';
import { Bi } from './BilingualSwitcher';

interface DiagnosticInitialProps {
  lang: Lang;
  onDone: () => void;
}

/**
 * Diagnostic initial (5 min) : 5 questions -> profil weak_skills / strong_skills
 * stocké dans localStorage (kunz_diagnostic_profile). N'échoue jamais (offline-first).
 */
export default function DiagnosticInitial({ lang, onDone }: DiagnosticInitialProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const q = DIAGNOSTIC_QUESTIONS[index];
  const progress = Math.round(((index) / DIAGNOSTIC_QUESTIONS.length) * 100);

  const choose = (optionKey: string) => {
    const next = { ...answers, [q.id]: optionKey };
    setAnswers(next);

    if (index < DIAGNOSTIC_QUESTIONS.length - 1) {
      setTimeout(() => setIndex((i) => i + 1), 180);
    } else {
      finish(next);
    }
  };

  const finish = (finalAnswers: Record<string, string>) => {
    const weak: string[] = [];
    const strong: string[] = [];
    for (const question of DIAGNOSTIC_QUESTIONS) {
      const picked = finalAnswers[question.id];
      const opt = question.options.find((o) => o.key === picked);
      if (opt?.correct) strong.push(question.skill);
      else weak.push(question.skill);
    }
    try {
      localStorage.setItem(
        DIAGNOSTIC_STORAGE_KEY,
        JSON.stringify({ weak_skills: weak, strong_skills: strong, date: new Date().toISOString() })
      );
    } catch {
      /* offline-first : jamais bloquant */
    }
    onDone();
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex items-center gap-2 mb-4 text-white">
        <Stethoscope className="w-6 h-6 text-[#fed65b]" />
        <h2 className="text-xl font-black">
          <Bi ar="التشخيص الأولي" fr="Diagnostic initial" lang={lang} />
        </h2>
      </div>

      {/* Progress */}
      <div className="h-2 rounded-full bg-white/20 overflow-hidden mb-6">
        <div className="h-full bg-[#fed65b] rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>

      <motion.div
        key={q.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white dark:bg-[#141916] rounded-3xl p-5 shadow-lg"
      >
        <span className="text-[11px] font-black text-[#006d37] dark:text-[#2ecc71]">
          {index + 1} / {DIAGNOSTIC_QUESTIONS.length}
        </span>
        <h3 className="font-black text-gray-900 dark:text-white mt-1 mb-4 leading-7">
          <Bi ar={q.textAr} fr={q.textFr} lang={lang} />
        </h3>

        <div className="space-y-2">
          {q.options.map((o) => (
            <button
              key={o.key}
              onClick={() => choose(o.key)}
              className="w-full flex items-center gap-3 text-right rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f1512] p-3 hover:border-[#006d37] hover:bg-[#f8fbf9] dark:hover:bg-[#1a221d] transition-all cursor-pointer"
            >
              <span className="w-7 h-7 rounded-full bg-[#006d37]/10 text-[#006d37] dark:text-[#2ecc71] font-black flex items-center justify-center shrink-0">
                {o.key}
              </span>
              <span dir="rtl" className="flex-1 text-sm font-bold text-gray-800 dark:text-gray-100">
                {o.textAr}
              </span>
              <ChevronLeft className="w-4 h-4 text-gray-300" />
            </button>
          ))}
        </div>
      </motion.div>

      <p className="text-center text-white/70 text-xs mt-4">
        <Bi
          ar="لا توجد إجابة خاطئة — هذا لتحديد نقاط انطلاقك فقط."
          fr="Aucune mauvaise réponse — c’est juste pour situer ton départ."
          lang={lang}
        />
      </p>
    </div>
  );
}
