// RappelTroisQuestions.tsx — « 3 دقائق استذكار » : l'échauffement, PAS la porte.
//
// Lot 2 (2026-11-04) : panneau de 3 questions, feedback immédiat, CTA vers UN
// geste BAC. Il ne décide de rien et ne parle pas : ni nom de guide, ni visage.
// Lot 3 : si l'élève a raté au moins une question, le panneau pose LA question
// du produit (« من أين جاء خطؤك ؟ », `CAUSES_QCM`) et transmet la cause
// DÉCLARÉE au دفتر الأخطاء. Rien n'est déduit, rien n'est noté, et cette
// déclaration reste OPTIONNELLE : le CTA et les 7 cartes restent visibles.
//
// RÈGLES TENUES :
//   · OPTIONNEL — jamais de porte obligatoire, « تخطّي » à tout moment.
//   · Le Capitaine DÉCIDE (`bilanDuRappel` dans `lib/invitationCapitaine.ts`) ;
//     l'élève DÉCLARE ; le pont (`lib/pontRappelErreurs.ts`) ÉCRIT une fois.
//   · ZÉRO SRS, zéro `rateCard`, zéro crédit de journée. Seule la clé
//     existante `boussole_profil_erreurs` est touchée, sur déclaration.
//   · ZÉRO NOUVELLE PORTE — le CTA appelle le MÊME `onOpen(tab)` que la carte.
//   · HONNÊTETÉ — corpus absent / catalogue vide / cause « autre » ⇒ on le dit,
//     on n'invente ni question ni erreur. Pas de chronomètre coercitif.

import { useState } from 'react';
import { Timer, Zap } from 'lucide-react';
import { bilanDuRappel, type QuestionRappel } from '../lib/invitationCapitaine';
import {
  CAUSES_QCM,
  QUESTION_CAUSE_AR,
  REMERCIEMENT_CAUSE_AR,
  causeParId,
} from '../data/diagnosticQuiz';
import { enregistrerCauseDuRappel } from '../lib/pontRappelErreurs';

/** Reprise VERBATIM de `QuizView.tsx:686` : « autre » ne doit pas dire « سُجّل ». */
const RIEN_ENREGISTRE_AR = 'لم نسجّل شيئًا. لم يُخترع سبب لم تعرفه.';

interface RappelTroisQuestionsProps {
  /** Les 3 questions tirées par le Capitaine (≤ 3). */
  questions: readonly QuestionRappel[];
  /** Charge le corpus à la demande — appelé UNE fois, au clic. */
  onDemarrer: () => void;
  /** `true` = corpus disponible (distingue « chargement » / « indisponible »). */
  corpusPret: boolean;
  /** CTA final vers UN geste BAC, ou `null` si le Capitaine n'a rien désigné. */
  onOuvrirGeste: (() => void) | null;
  libelleGesteAr?: string;
}

export default function RappelTroisQuestions({
  questions,
  onDemarrer,
  corpusPret,
  onOuvrirGeste,
  libelleGesteAr,
}: RappelTroisQuestionsProps) {
  const [demarre, setDemarre] = useState(false);
  const [ferme, setFerme] = useState(false);
  const [index, setIndex] = useState(0);
  // Une réponse par question, conservée jusqu'au bilan : c'est la matière du
  // `bilanDuRappel`. `choisi` en est dérivé — aucune double source de vérité.
  const [reponses, setReponses] = useState<readonly (number | null)[]>([]);
  const [reussites, setReussites] = useState(0);
  const [termine, setTermine] = useState(false);
  const [causeDeclaree, setCauseDeclaree] = useState<string | null>(null);

  if (ferme) return null;

  const ouvrir = (): void => {
    setDemarre(true);
    // Pas de `await` : le parent met son état à jour et ce composant se
    // re-rend avec les questions. Aucun import dynamique tant que l'élève n'a
    // pas choisi l'échauffement — donc zéro octet de plus pour les autres.
    onDemarrer();
  };

  if (!demarre) {
    return (
      <section
        data-testid="rappel-panel"
        dir="rtl"
        className="mb-4 rounded-2xl border border-[#d9a400]/40 bg-[#fffdf5] px-4 py-3 dark:border-[#d9a400]/20 dark:bg-[#171b14]"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fff7e0] dark:bg-black/20">
              <Zap className="h-4 w-4 text-[#d9a400]" />
            </span>
            <div className="text-right">
              <p className="text-[12.5px] font-black text-[#1f1c0b] dark:text-gray-100">
                قبل التمرين: 3 أسئلة استذكار
              </p>
              <p className="text-[11px] text-[#506072] dark:text-gray-400">
                اختياري — يمكنك الذهاب إلى التمرين مباشرة
              </p>
            </div>
          </div>
          <span
            data-testid="rappel-duree"
            className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-[#506072] dark:text-gray-400"
          >
            <Timer className="h-3.5 w-3.5" />
            3 دقائق
          </span>
        </div>
        <button
          type="button"
          data-testid="rappel-demarrer"
          onClick={ouvrir}
          className="mt-3 rounded-xl bg-[#006d37] px-3 py-1.5 text-[11px] font-black text-white cursor-pointer hover:bg-[#00592d]"
        >
          ابدأ الاستذكار
        </button>
      </section>
    );
  }

  if (questions.length === 0) {
    return (
      <section data-testid="rappel-panel" dir="rtl" className="mb-4 rounded-2xl border border-[#bbcbbb]/40 px-4 py-3">
        <p data-testid="rappel-indisponible" className="text-[12px] font-bold text-[#506072] dark:text-gray-400">
          {corpusPret ? 'الأسئلة غير متاحة الآن — انتقل إلى التمرين مباشرة.' : 'جارٍ تحضير الأسئلة…'}
        </p>
      </section>
    );
  }

  const bilan = bilanDuRappel(questions, reponses);
  const declarerCause = (id: string): void => {
    if (causeDeclaree !== null) return; // UNE seule écriture par session
    const theme = bilan.themes[0] ?? '';
    enregistrerCauseDuRappel(id, theme);
    setCauseDeclaree(id);
  };

  if (termine) {
    const causeChoisie = causeDeclaree !== null ? causeParId(causeDeclaree) : null;
    return (
      <section data-testid="rappel-panel" dir="rtl" className="mb-4 rounded-2xl border border-[#006d37]/25 bg-[#f8fbfa] px-4 py-3 dark:border-emerald-400/25 dark:bg-[#121614]">
        <p data-testid="rappel-bilan" className="text-[13px] font-black text-[#1f2b24] dark:text-gray-100">
          استذكار منتهٍ: {reussites} من {questions.length} — والآن تمرين واحد كامل، ثم التصحيح.
        </p>

        {/* LOT 3 — une seule question, une seule fois, seulement s'il y a eu
            une vraie erreur. Le CTA reste dessous, visible même sans réponse. */}
        {bilan.aDeclarer && causeDeclaree === null && (
          <div data-testid="rappel-cause-bloc" className="mt-2 rounded-xl border border-[#006d37]/20 bg-white p-3 dark:bg-black/20">
            <p data-testid="rappel-cause-question" className="text-[11.5px] font-black text-[#006d37] dark:text-emerald-300">
              {QUESTION_CAUSE_AR}
            </p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-[#506072] dark:text-gray-400">
              سؤال واحد فقط، ولن يتكرّر في هذه الجلسة. الجواب يُحفظ على هاتفك وحدك.
            </p>
            <div className="mt-2 space-y-1.5">
              {CAUSES_QCM.map((cause) => (
                <button
                  key={cause.id}
                  type="button"
                  data-testid={`rappel-cause-${cause.id}`}
                  onClick={() => declarerCause(cause.id)}
                  className="block w-full rounded-xl border border-[#e2dabf] bg-white px-3 py-2 text-right cursor-pointer hover:border-[#006d37] dark:border-gray-800 dark:bg-[#1a1f1c]"
                >
                  <span className="block text-[11.5px] font-black text-[#1f2b24] dark:text-gray-100">{cause.libelleAr}</span>
                  <span className="mt-0.5 block text-[10px] leading-relaxed text-[#506072] dark:text-gray-400">{cause.precisionAr}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {causeDeclaree !== null && (
          <p data-testid="rappel-cause-enregistree" className="mt-2 text-[11px] font-bold text-[#006d37] dark:text-emerald-300">
            {causeChoisie?.code ? REMERCIEMENT_CAUSE_AR : RIEN_ENREGISTRE_AR}
          </p>
        )}

        {onOuvrirGeste && (
          <button
            type="button"
            data-testid="rappel-cta-geste"
            onClick={onOuvrirGeste}
            className="mt-2 rounded-xl bg-[#006d37] px-3 py-1.5 text-[11px] font-black text-white cursor-pointer hover:bg-[#00592d]"
          >
            {libelleGesteAr ?? 'ابدأ التمرين'}
          </button>
        )}
      </section>
    );
  }

  const q = questions[Math.min(index, questions.length - 1)];
  const choisi = reponses[index] ?? null;
  const repondu = choisi !== null;
  const correct = repondu && choisi === q.correctIndex;

  const suivant = (): void => {
    if (index + 1 < questions.length) setIndex(index + 1);
    else setTermine(true);
  };

  return (
    <section data-testid="rappel-panel" dir="rtl" className="mb-4 rounded-2xl border border-[#d9a400]/40 bg-[#fffdf5] px-4 py-3 dark:border-[#d9a400]/20 dark:bg-[#171b14]">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-black text-[#8a6a00] dark:text-[#d9a400]">
          سؤال {index + 1} من {questions.length}
        </p>
        <button
          type="button"
          data-testid="rappel-fermer"
          onClick={() => setFerme(true)}
          className="text-[11px] font-bold text-[#506072] dark:text-gray-400 cursor-pointer"
        >
          تخطّي الاستذكار
        </button>
      </div>

      <p data-testid="rappel-question" className="mb-2 text-[13px] font-bold leading-7 text-[#1f1c0b] dark:text-gray-100">
        {q.questionAr}
      </p>

      <div className="mb-2 space-y-1.5">
        {q.optionsAr.map((option, i) => (
          <button
            key={`${q.id}-${i}`}
            type="button"
            data-testid={`rappel-option-${i}`}
            onClick={() => {
              if (repondu) return;
              setReponses((prev) => {
                const prochain = [...prev];
                prochain[index] = i;
                return prochain;
              });
              if (i === q.correctIndex) setReussites((r) => r + 1);
            }}
            aria-pressed={choisi === i}
            className={`block w-full rounded-xl border px-3 py-2 text-right text-[12px] leading-6 cursor-pointer transition-colors ${
              repondu && i === q.correctIndex
                ? 'border-[#006d37]/50 bg-[#e8f5ee] text-[#006d37] dark:bg-emerald-400/10 dark:text-emerald-300'
                : repondu && i === choisi
                  ? 'border-rose-400/50 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
                  : 'border-[#bbcbbb]/40 text-[#1f1c0b] dark:text-gray-100 hover:border-[#006d37]/40'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {repondu && (
        <div data-testid="rappel-feedback" className="rounded-xl bg-white px-3 py-2 dark:bg-black/20">
          <p className="text-[11.5px] font-black text-[#1f2b24] dark:text-gray-100">
            {correct ? '✓ إجابة صحيحة' : '✗ الإجابة الصحيحة: ' + q.optionsAr[q.correctIndex]}
          </p>
          {q.explicationAr.trim().length > 0 && (
            <p className="mt-1 text-[11.5px] leading-6 text-[#506072] dark:text-gray-400">
              {q.explicationAr}
            </p>
          )}
          <button
            type="button"
            data-testid="rappel-suivant"
            onClick={suivant}
            className="mt-2 rounded-xl bg-[#006d37] px-3 py-1.5 text-[11px] font-black text-white cursor-pointer hover:bg-[#00592d]"
          >
            {index + 1 < questions.length ? 'السؤال التالي' : 'انتهيت'}
          </button>
        </div>
      )}
    </section>
  );
}
