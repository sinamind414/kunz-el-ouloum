// DocumentAnalysisView — surface « analyse de document » (elite, offline).
// P0-2 : branche DOCUMENT_ANALYSIS_EXERCISES + DOCUMENT_ASSETS sur l'UI.
// Contrats verrouillés par documentAnalysis.integrity / CounterProof :
//  · masque le bloc si l'asset est unavailable (13/19 atteignables) ;
//  · verdict affiché = validateAnswer(...).passed && answerHasDocumentContent(...) ;
//  · pas de moteur modifié — ValidationEngine + documentEvidenceService seuls.

import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, FileText, Lock, XCircle } from 'lucide-react';
import { DOCUMENT_ANALYSIS_EXERCISES, type DocAnalysisExercise } from '../data/documentAnalysisExercises';
import { getDocumentAsset, isDocumentAssetAvailable } from '../data/documentAssets';
import { getEffectiveQuestionContext, getDocumentPracticeContext } from '../data/documentPracticeContexts';
import { validateAnswer } from '../lib/validation/ValidationEngine';
import { answerHasDocumentContent } from '../services/documentEvidenceService';
import DocumentAssetView from './DocumentAssetView';

interface Props {
  onClose?: () => void;
}

type VerdictState = { qid: string; ok: boolean; show: boolean };

export default function DocumentAnalysisView({ onClose }: Props) {
  const readyExercises = useMemo(
    () => DOCUMENT_ANALYSIS_EXERCISES.filter((ex) => isDocumentAssetAvailable(ex.doc.assetKey)),
    [],
  );
  const hiddenCount = DOCUMENT_ANALYSIS_EXERCISES.length - readyExercises.length;

  const [activeId, setActiveId] = useState<string | null>(readyExercises[0]?.id ?? null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [verdicts, setVerdicts] = useState<VerdictState[]>([]);

  const active: DocAnalysisExercise | null =
    readyExercises.find((ex) => ex.id === activeId) ?? readyExercises[0] ?? null;
  const asset = active ? getDocumentAsset(active.doc.assetKey) : null;

  const handleValidate = (qid: string) => {
    if (!active) return;
    const q = active.questions.find((x) => x.id === qid);
    if (!q) return;
    // Base = q.ctx (formule CounterProof #41) ; promptAr alimente la détection de copie d'énoncé.
    const baseCtx = { ...q.ctx, promptAr: q.promptAr };
    const answer = answers[qid] ?? '';
    const engine = validateAnswer(answer, getEffectiveQuestionContext(active.id, q.id, baseCtx));
    // Verdict réellement affiché (contre-épreuve #41) — garde-fou de contenu.
    const practiceCtx = getDocumentPracticeContext(active.id, q.id);
    const ok = engine.passed && practiceCtx
      ? answerHasDocumentContent(answer, practiceCtx, active.correctionAr)
      : engine.passed;
    setVerdicts((prev) => [...prev.filter((v) => v.qid !== qid), { qid, ok, show: true }]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f8fbfa] dark:bg-[#0c0f0d] text-[#191c1d] dark:text-gray-100 overflow-y-auto" dir="rtl">
      <header className="sticky top-0 z-10 bg-white/95 dark:bg-[#141916] border-b border-[#e2dabf]/50 dark:border-[#2ecc71]/10 px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-[#006d37] dark:text-[#2ecc71]" />
          <div>
            <h1 className="font-black text-lg leading-tight">تحليل الوثائق — تدريب النخبة</h1>
            <p className="text-[11px] text-gray-500">
              {readyExercises.length} وثيقة متاحة · {hiddenCount} غير جاهزة بعد
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-[11px] text-amber-700 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300 px-2 py-1 rounded-md font-bold max-w-md">
            تدريب ذاتي — ليس هو الرسمي
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#006d37] hover:bg-[#00562b] text-white text-sm font-black cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4 md:p-6 grid md:grid-cols-[240px_1fr] gap-5 pb-24">
        {/* Liste unités */}
        <nav aria-label="قائمة الوثائق" className="space-y-1.5 h-fit md:sticky md:top-20">
          {readyExercises.map((ex) => (
            <button
              key={ex.id}
              onClick={() => {
                setActiveId(ex.id);
                setVerdicts([]);
              }}
              className={`w-full text-right px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                active?.id === ex.id
                  ? 'bg-[#006d37] text-white border-[#006d37]'
                  : 'bg-white dark:bg-[#141916] border-[#e2dabf]/60 dark:border-[#2ecc71]/10 hover:border-[#006d37]/40'
              }`}
            >
              <span className="block opacity-70 text-[10px]">الوحدة {ex.unitId} · {ex.domain}</span>
              {ex.id.replace(/_/g, ' ')}
            </button>
          ))}
          {/* Bloc masqué signalé honnêtement */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-gray-100 dark:bg-gray-900/60 text-[11px] text-gray-500 border border-gray-200 dark:border-gray-800">
            <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{hiddenCount} وثائق غير جاهزة (صور حقيقية مفقودة) — تُخفى حتى توفّر.</span>
          </div>
        </nav>

        {/* Exercice actif */}
        {active && asset ? (
          <section className="space-y-5" aria-label={active.id}>
            <div className="bg-white dark:bg-[#141916] rounded-2xl border border-[#e2dabf]/60 dark:border-[#2ecc71]/10 p-4 space-y-3">
              <h2 className="font-black text-base">
                <span className="text-[#006d37] dark:text-[#2ecc71]">وحدة {active.unitId}</span> — {active.doc.descriptionAr}
              </h2>
              <DocumentAssetView asset={asset} />
              <p className="text-[11px] text-gray-500 border-t border-[#e2dabf]/50 pt-2">
                {active.label}
              </p>
            </div>

            <div className="grid gap-3">
              {active.questions.map((q) => {
                const val = answers[q.id] ?? '';
                const v = verdicts.find((x) => x.qid === q.id);
                return (
                  <div key={q.id} className="bg-white dark:bg-[#141916] rounded-2xl border border-[#e2dabf]/60 dark:border-[#2ecc71]/10 p-4 space-y-2">
                    <p className="text-sm font-black">
                      <span className="text-[#006d37] dark:text-[#2ecc71]">{q.verb}</span> — {q.promptAr}
                    </p>
                    <textarea
                      value={val}
                      onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                      rows={3}
                      disabled={v?.show && v.ok}
                      aria-label={q.promptAr}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-[#161c18] focus:border-emerald-500 focus:outline-none resize-y"
                      placeholder={q.templateHint}
                    />
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        onClick={() => handleValidate(q.id)}
                        disabled={!val.trim()}
                        className="px-4 py-2 rounded-xl bg-[#006d37] hover:bg-[#00562b] text-white text-sm font-black disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                      >
                        صحّح إجابتي
                      </button>
                      {v?.show && (
                        <span
                          role="status"
                          className={`flex items-center gap-1.5 text-sm font-bold ${v.ok ? 'text-emerald-600' : 'text-red-600'}`}
                        >
                          {v.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          {v.ok ? 'مقبول — الإجابة تستند إلى الوثيقة' : 'مرفوض — أعد الصياغة انطلاقاً من الوثيقة'}
                        </span>
                      )}
                    </div>
                    {v?.show && !v.ok && (
                      <p className="text-[11px] text-gray-500 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-2">
                        تلميح: {q.templateHint}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <details className="bg-[#006d37]/5 dark:bg-[#2ecc71]/5 rounded-2xl border border-[#006d37]/20 p-4">
              <summary className="font-black text-sm cursor-pointer text-[#006d37] dark:text-[#2ecc71]">
                التصحيح الرسمي + شبكة التدريب (20 ن)
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-200">{active.correctionAr}</p>
              <ul className="mt-3 space-y-1.5">
                {active.grilleEntrainement.map((g) => (
                  <li key={g.critereAr} className="flex justify-between text-xs font-bold border-b border-[#e2dabf]/40 pb-1">
                    <span>{g.critereAr}</span>
                    <span className="text-[#006d37]">{g.points} ن</span>
                  </li>
                ))}
              </ul>
            </details>
          </section>
        ) : (
          <p className="text-center text-gray-500 py-16">هذه الوثيقة غير جاهزة بعد.</p>
        )}
      </div>
    </div>
  );
}
