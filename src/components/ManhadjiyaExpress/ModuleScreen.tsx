import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, Lightbulb, Sparkles, ChevronLeft, ListChecks } from 'lucide-react';
import type { ManhadjiyaModule, Lang } from '../../data/manhadjiyaModules';
import { validateAnswer, type ValidationResult } from '../../utils/validationEngine';
import { Bi } from './BilingualSwitcher';
import TemplateBuilder from './TemplateBuilder';

interface ModuleScreenProps {
  module: ManhadjiyaModule;
  index: number;
  total: number;
  lang: Lang;
  onValidated: (xp: number) => void;
}

const HINT_AFTER_MS = 90_000;
const MAX_HINTS = 3;

/** Rend un micro-module (Loi Kunz + checklist + template + validation offline). */
export default function ModuleScreen({ module, index, total, lang, onValidated }: ModuleScreenProps) {
  const [text, setText] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintUnlocked, setHintUnlocked] = useState(false);
  const [passed, setPassed] = useState(false);
  const draftKey = `kunz_draft_${module.id}`;

  // Indice débloqué après 90s.
  useEffect(() => {
    const t = setTimeout(() => setHintUnlocked(true), HINT_AFTER_MS);
    return () => clearTimeout(t);
  }, [module.id]);

  // Auto-save brouillon toutes les 30s.
  const textRef = useRef(text);
  textRef.current = text;
  useEffect(() => {
    const iv = setInterval(() => {
      try {
        if (textRef.current) localStorage.setItem(draftKey, textRef.current);
      } catch { /* offline-first */ }
    }, 30_000);
    return () => clearInterval(iv);
  }, [draftKey]);

  // Réinitialise l'état à chaque nouveau module.
  useEffect(() => {
    setText('');
    setResult(null);
    setAttempts(0);
    setHintsUsed(0);
    setHintUnlocked(false);
    setPassed(false);
  }, [module.id]);

  const checklistHints = useMemo(() => module.checklist.map((c) => c.ar), [module.checklist]);

  const handleSubmit = () => {
    const r = validateAnswer(text, module.validation);
    setResult(r);
    setAttempts((a) => a + 1);
    if (r.valid) {
      setPassed(true);
      try { localStorage.removeItem(draftKey); } catch { /* noop */ }
    }
  };

  const useHint = () => {
    if (hintsUsed < MAX_HINTS) setHintsUsed((h) => h + 1);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* En-tête module */}
      <div className="flex items-center justify-between mb-2 text-white/90">
        <span className="text-xs font-black">
          {index + 1} / {total} · {module.durationMin} د
        </span>
        <span className="text-xs font-bold bg-white/15 px-2.5 py-1 rounded-full">+{module.xp} XP</span>
      </div>

      {/* Loi Kunz */}
      <div className="rounded-3xl bg-gradient-to-br from-[#006d37] to-[#00562b] text-white p-5 shadow-lg mb-4">
        <span className="text-[10px] font-black tracking-widest text-[#fed65b] uppercase">
          قانون كنز العلوم #{module.loi.num}
        </span>
        <h2 className="text-xl font-black mt-1">
          <Bi ar={module.titleAr} fr={module.titleFr} lang={lang} />
        </h2>
        <p className="text-sm text-white/90 mt-2 leading-7">
          <Bi ar={module.loi.titleAr} fr={module.loi.titleFr} lang={lang} />
        </p>
        <p className="text-xs text-white/75 mt-2 leading-6" dir="rtl">{module.loi.ruleAr}</p>
      </div>

      <div className="bg-white dark:bg-[#141916] rounded-3xl p-5 shadow-lg space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-7">
          <Bi ar={module.introAr} fr={module.introFr} lang={lang} />
        </p>

        {/* Checklist */}
        <div className="rounded-2xl bg-[#fff9ed] dark:bg-[#1a221d] border border-[#e2dabf]/60 dark:border-gray-800 p-3">
          <div className="flex items-center gap-1.5 mb-2 text-[#b45309] dark:text-[#fed65b] font-black text-xs">
            <ListChecks className="w-4 h-4" /> قائمة التحقق
          </div>
          <ul className="space-y-1.5">
            {module.checklist.map((c, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006d37]" />
                <Bi ar={c.ar} fr={c.fr} lang={lang} />
              </li>
            ))}
          </ul>
        </div>

        {module.exampleAr && (
          <p className="text-[11px] text-gray-400" dir="rtl">مثال: {module.exampleAr}</p>
        )}

        {/* Avertissement barème (test final) — grille d'entraînement non officielle */}
        {module.disclaimerAr && (
          <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-3 text-[11px] leading-6 text-rose-700 dark:text-rose-300">
            <p dir="rtl" className="font-black">⚠️ {module.disclaimerAr}</p>
            {module.disclaimerFr && (
              <p dir="ltr" className="mt-1 opacity-80">{module.disclaimerFr}</p>
            )}
            {module.scoreThreshold != null && (
              <p dir="rtl" className="mt-1 font-bold">عتبة النجاح الإرشادية: {module.scoreThreshold}/20</p>
            )}
          </div>
        )}

        {/* Template fill-in-the-blanks */}
        <TemplateBuilder template={module.templateAr} onChange={setText} />

        {/* Note du correcteur (précision scientifique) */}
        {module.noteAr && (
          <div className="rounded-2xl bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 p-3 text-[11px] leading-6 text-sky-800 dark:text-sky-200" dir="rtl">
            📌 ملاحظة المصحّح: {module.noteAr}
          </div>
        )}

        {/* Indice */}
        {hintsUsed > 0 && (
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-3 text-xs text-amber-800 dark:text-amber-200 leading-6" dir="rtl">
            💡 تلميح: تأكد من إدراج — {checklistHints.slice(0, hintsUsed + 1).join('، ')}.
          </div>
        )}

        {/* Feedback */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-3 text-sm font-bold flex items-start gap-2 ${
              result.valid
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
            }`}
            dir="rtl"
          >
            {result.valid ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
            <div className="space-y-1">
              {result.messagesAr.map((m, i) => (
                <p key={i}>{m}</p>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!passed ? (
            <>
              <button
                onClick={handleSubmit}
                disabled={text.trim().length === 0}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#006d37] text-white font-black py-3 text-sm hover:bg-[#00562b] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> تحقق من إجابتي
              </button>
              {hintUnlocked && hintsUsed < MAX_HINTS && (
                <button
                  onClick={useHint}
                  className="flex items-center gap-1 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-bold py-3 px-4 text-sm hover:bg-amber-200 transition-colors cursor-pointer"
                >
                  <Lightbulb className="w-4 h-4" /> تلميح ({MAX_HINTS - hintsUsed})
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => onValidated(module.xp)}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ffb347] to-[#ff9a4a] text-white font-black py-3 text-sm hover:brightness-105 transition-all cursor-pointer"
            >
              {index + 1 < total ? 'المتابعة للقانون التالي' : 'إنهاء التكوين والحصول على الشهادة'}
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {attempts > 0 && !passed && (
          <p className="text-center text-[11px] text-gray-400">
            المحاولات: {attempts} — يمكنك إعادة المحاولة بلا حدود.
          </p>
        )}
      </div>
    </div>
  );
}
