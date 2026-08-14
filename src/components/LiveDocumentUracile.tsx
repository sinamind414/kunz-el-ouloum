// src/components/LiveDocumentUracile.tsx
// V3 US-V3-02 — Document vivant uracile marqué (observation avant interprétation).
// Validation réelle : ValidationEngine + trace documentaire + persistance preuve/erreur.

import { useState, useId, useRef } from 'react';
import { Lightbulb, Eye, Pencil, HelpCircle } from 'lucide-react';
import {
  validateAnswer,
  type ValidationResult,
} from '../lib/validation/ValidationEngine';
import {
  validateDocumentTrace,
  type DocumentTraceResult,
} from '../services/documentEvidenceService';
import { getDocumentPracticeContextByExercise } from '../data/documentPracticeContexts';
import { runSessionEffects, type SessionEffect } from '../lib/lesson/sessionEffectsService';
import { ZoomImageButton } from './ZoomableImage';
import { toValidationContext } from '../lib/validation/practiceContextMapping';

interface LiveDocumentUracileProps {
  exerciseId?: string;
  onEvidence?: (outcome: { passed: boolean; evidenceId?: string; errorCreated: boolean }) => void;
  onOpenMicroRemediation?: (remediationId: string) => void;
  applySessionEffect?: (effect: SessionEffect) => void;
}

export default function LiveDocumentUracile({ exerciseId = 'uracile_marque', onEvidence, onOpenMicroRemediation, applySessionEffect }: LiveDocumentUracileProps) {
  const ctx = getDocumentPracticeContextByExercise(exerciseId);
  const [answer, setAnswer] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [trace, setTrace] = useState<DocumentTraceResult | null>(null);
  const [recordOutcome, setRecordOutcome] = useState<{ passed: boolean; evidenceId?: string; errorCreated: boolean } | null>(null);
  const passed = recordOutcome?.passed ?? false;
  const attemptId = useId();
  const attemptRevision = useRef(0);

  if (!ctx) return null;

  const galleryItems = [
    { assetSrc: ctx.assetSrc, altAr: ctx.altAr, captionAr: ctx.altAr },
    ...(ctx.gallery ?? []),
  ].filter((item) => item.assetSrc || item.altAr);

  const handleValidate = () => {
    if (answer.trim().length < 8) return;

    const result = validateAnswer(answer, toValidationContext(ctx));

    const effect: SessionEffect = {
      eventId: `document_${exerciseId}_${attemptId}_${++attemptRevision.current}`,
      type: 'SUBMIT_DOCUMENT_ATTEMPT',
      lessonId: ctx.lessonId ?? exerciseId,
      payload: {
        exerciseId,
        questionId: ctx.questionId,
        answer,
        validationResult: result,
      },
    };
    if (applySessionEffect) {
      applySessionEffect(effect);
    } else {
      void runSessionEffects([effect]);
    }

    const trace = validateDocumentTrace({
      context: ctx,
      answer,
      validationResult: result,
    });

    setValidationResult(result);
    setTrace(trace);
    setRecordOutcome({ passed: trace.valid, errorCreated: !trace.valid });
    setAttempted(true);

    onEvidence?.({
      passed: trace.valid,
      errorCreated: !trace.valid,
    });
  };

  return (
    <div data-testid="live-document" className="p-4 bg-[#fff9ed] dark:bg-[#1c241f] border border-[#e2dabf]/60 rounded-2xl shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <Eye className="w-5 h-5 text-[#006d37]" />
        <span className="text-xs font-black bg-[#006d37] text-white px-2.5 py-1 rounded-full">وثيقة حية</span>
        <span className="text-xs font-bold text-[#944a00] dark:text-amber-300">{ctx.documentTypeAr}</span>
      </div>

      <p className="text-sm leading-8 text-[#1f1c0b] dark:text-gray-100">{ctx.goalAr}</p>

      {galleryItems.length > 0 && (
        <div className={galleryItems.length === 1 ? 'space-y-2' : galleryItems.length === 2 ? 'grid md:grid-cols-2 gap-4' : 'grid md:grid-cols-2 xl:grid-cols-3 gap-4'}>
          {galleryItems.map((item, index) => (
            <div key={`${item.assetSrc ?? item.altAr}-${index}`} className="space-y-2">
              <div className="relative rounded-xl overflow-hidden border bg-[#f3f4f5] dark:bg-[#0c0f0d] min-h-40 flex items-center justify-center p-4">
                {item.assetSrc ? (
                  <>
                    <ZoomImageButton src={item.assetSrc} alt={item.altAr} referrerPolicy="no-referrer" className="absolute top-2 right-2" />
                    <img src={item.assetSrc} alt={item.altAr} className="max-h-72 w-full object-contain" draggable={false} loading="lazy" />
                  </>
                ) : (
                  <p className="text-xs text-center text-[#506072] dark:text-gray-400 leading-6">{item.altAr}</p>
                )}
              </div>
              <p className="text-[11px] font-bold text-[#506072] dark:text-gray-400">{item.captionAr ?? item.altAr}</p>
            </div>
          ))}
        </div>
      )}

      {/* Objectif + verbe (visibles) */}
      <div className="text-xs text-[#506072] dark:text-gray-400">
        🔬 {ctx.promptObserveAr}
      </div>

      {/* Observation demandée avant conclusion */}
      <div className="rounded-xl bg-white dark:bg-black/20 border border-amber-200/50 dark:border-amber-900/30 p-3 text-sm leading-7">
        <span className="font-black">لاحظ :</span> {ctx.observationAr}
      </div>

      {ctx.trapAr && (
        <p className="text-xs leading-6 text-amber-800 dark:text-amber-300">{ctx.trapAr}</p>
      )}

      <textarea
        value={answer}
        onChange={(e) => {
          setAnswer(e.target.value);
          setAttempted(false);
          setValidationResult(null);
          setTrace(null);
          setRecordOutcome(null);
          setHintIndex(0);
        }}
        rows={4}
        placeholder={ctx.promptProduceAr}
        className="w-full p-3 rounded-2xl border border-[#e2dabf]/60 bg-white dark:bg-[#0c0f0d] text-sm leading-8 text-right focus:outline-none focus:ring-2 focus:ring-[#006d37]/20"
        dir="rtl"
      />

      {/* Deux indices maximum, sur demande */}
      <div className="flex flex-wrap gap-2">
        {hintIndex < (ctx.hintsAr?.length ?? 0) && (
          <button
            onClick={() => setHintIndex((i) => i + 1)}
            className="text-[11px] bg-[#006d37]/10 border border-[#006d37]/20 text-[#006d37] dark:text-[#2ecc71] px-2 py-1 rounded-full flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" /> indice {hintIndex + 1}
          </button>
        )}
        {ctx.hintsAr?.slice(0, hintIndex).map((h, i) => (
          <span key={i} className="text-[11px] bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-900/40 px-2 py-1 rounded-full flex items-center gap-1">
            <Lightbulb className="w-3 h-3" /> {h}
          </span>
        ))}
      </div>

      {!attempted && (
        <button
          onClick={handleValidate}
          disabled={answer.trim().length < 8}
          className="w-full py-2.5 rounded-xl bg-[#006d37] hover:bg-[#00562b] disabled:opacity-40 text-white font-black text-sm shadow-sm cursor-pointer"
        >
          صحّح بالمصحح الحقيقي
        </button>
      )}

      {attempted && (
        <div className="space-y-3 animate-in fade-in">
          <div className={`p-3 rounded-xl text-[12px] leading-7 font-bold border ${passed ? 'bg-[#2ecc71]/10 text-[#006d37] border-[#2ecc71]/20' : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-200 dark:border-amber-900/40'}`}>
            {passed
              ? '✅ أحسنت، ربطت الملاحظة بآلية علمية. تم تسجيل دليل حقيقي.'
              : '⚠️ أضف الملاحظة ثم الآلية ثم الخلاصة العلمية. تم تسجيل نقطة تحتاج إلى مراجعة.'}

            {validationResult && (
              <span className="block mt-1 font-black">
                niveau de vérification Kunz : {Math.round((validationResult.score / validationResult.maxScore) * 100)} / 100
              </span>
            )}

            {trace && (
              <span className="block mt-0.5">
                {trace.foundEvidence.length}/{ctx.expectedEvidence.length} preuves,
                {trace.vocabularyFound.length} termes scientifiques
              </span>
            )}
          </div>

          {!passed && trace && (
            <ul className="text-[11px] leading-6 text-amber-800 dark:text-amber-200 list-disc list-inside">
              {!trace.structuredCriteria.observation && <li>أضف دليلاً من الوثيقة.</li>}
              {!trace.structuredCriteria.mechanism && <li>اربط الدليل بآلية علمية.</li>}
              {!trace.structuredCriteria.conclusion && <li>اكتب خلاصة تجيب عن السؤال.</li>}
            </ul>
          )}

          {/* Correction visible UNIQUEMENT après tentative. */}
          {ctx.correctionAr && (
            <div className="bg-white dark:bg-black/20 border border-amber-200/50 dark:border-amber-900/30 rounded-xl px-3 py-2 text-[12px] font-bold text-amber-800 dark:text-amber-300">
              <span className="font-black">التصحيح:</span> {ctx.correctionAr}
            </div>
          )}

          {!passed && (
            <button
              onClick={() => {
                if (exerciseId === 'photosynthese_cycle') {
                  onOpenMicroRemediation?.('mr_thylakoide_vs_stroma');
                } else if (exerciseId === 'synapse_integration') {
                  onOpenMicroRemediation?.('mr_ppse_ppsi_threshold');
                } else if (exerciseId === 'subduction_water_melting') {
                  onOpenMicroRemediation?.('mr_subduction_water');
                } else if (exerciseId === 'mutation_protein_function') {
                  onOpenMicroRemediation?.('mr_primary_structure_function');
                } else if (exerciseId === 'cmh_transplant_compatibility') {
                  onOpenMicroRemediation?.('mr_cmh_self_nonself');
                } else if (exerciseId === 'lb_antibody_response') {
                  onOpenMicroRemediation?.('mr_lb_plasmocyte_antibody');
                } else if (exerciseId === 'lt_target_cell_response') {
                  onOpenMicroRemediation?.('mr_lt_target_cell');
                } else if (exerciseId === 'primary_secondary_response') {
                  onOpenMicroRemediation?.('mr_memory_primary_secondary');
                } else if (exerciseId === 'seismic_p_s_core') {
                  onOpenMicroRemediation?.('mr_p_s_liquid_core');
                } else {
                  onOpenMicroRemediation?.('mr_arnm_vs_adn');
                }
              }}
              className="w-full py-2.5 rounded-xl bg-[#ffb347] hover:bg-[#ff9a4a] text-white font-black text-sm shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <Pencil className="w-4 h-4" /> ثبّت هذه الفكرة (ميكرو-تصحيح)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
