// src/components/QuizAdaptatif.tsx — R9 (2026-11-07), chargé en LAZY depuis
// QuizView. Mode OPT-IN : le quiz d'unité existant reste inchangé par défaut.
//
// ⚠️ Aucune question n'est écrite ici : le pool vient de `loadCorpus()`
// (import dynamique du corpus servi, 531 QCM) et le choix est fait par le
// moteur PUR `lib/quizAdaptatif.ts`. Les explications affichées sont celles
// du corpus, verbatim. Aucune notification, aucune seconde voix, aucune mise
// en comparaison entre élèves fabriquée.

import { useEffect, useMemo, useState } from 'react';
import { LIBELLES_DIFFICULTE, type PalierDifficulte } from '../quizCorpus';
import { loadCorpus } from '../data/corpusLoader';
import { graineSession, melangerQuestion } from '../utils/melangeOptions';
import type { QuizQuestion } from '../types';
import {
  NB_QUESTIONS_SEANCE,
  REGLE_ADAPTATIVE_AR,
  choisirQuestion,
  palierInitial,
  prochainPalier,
  type PalierAdaptatif,
} from '../lib/quizAdaptatif';

interface Props {
  onBack: () => void;
  /** Questions du quiz d'unité : sert UNIQUEMENT à fixer le palier de départ. */
  questionsInitiales: QuizQuestion[];
}

interface EnCours {
  question: QuizQuestion;
  palier: PalierAdaptatif;
}

export default function QuizAdaptatif({ onBack, questionsInitiales }: Props) {
  const [pool, setPool] = useState<QuizQuestion[]>([]);
  const [indisponible, setIndisponible] = useState(false);
  const [palier, setPalier] = useState<PalierAdaptatif>(() => palierInitial(questionsInitiales));
  const [historique, setHistorique] = useState<boolean[]>([]);
  const [utilises, setUtilises] = useState<Set<number>>(() => new Set());
  const [enCours, setEnCours] = useState<EnCours | null>(null);
  const [choisi, setChoisi] = useState<number | null>(null);
  const [valide, setValide] = useState(false);
  const [score, setScore] = useState(0);
  const [repondues, setRepondues] = useState(0);
  const [termine, setTermine] = useState(false);
  // Anti-triche : MÊME graine de session que QuizView, MÊME permutation.
  // Une clé « la bonne réponse est la 2ᵉ » extraite du bundle reste inutilisable.
  const graine = useMemo(() => graineSession(), []);

  // Corpus déjà chargé par App.tsx à l'ouverture d'un quiz : ici, import
  // dynamique avec cache (aucun nouvel octet dans le bundle d'entrée).
  useEffect(() => {
    let vivant = true;
    loadCorpus()
      .then((c) => {
        if (vivant) setPool(c.questions);
      })
      .catch(() => {
        if (vivant) setIndisponible(true);
      });
    return () => {
      vivant = false;
    };
  }, []);

  // Sélection de la PROCHAINE question : pure, déterministe, sans doublon.
  useEffect(() => {
    if (indisponible || termine || enCours || pool.length === 0) return;
    const choix = choisirQuestion(pool, palier, utilises);
    if (!choix) {
      setTermine(true); // corpus épuisé : on s'arrête, on n'invente rien.
      return;
    }
    // On mélange les propositions (pas l'énoncé ni l'explication, verbatim).
    // `melangerQuestion` corrige `correctAnswerIndex` et porte `optionOrigins` :
    // la correction reste JUSTE, et aucune aide indexée par position n'est
    // affichée ici (seule `explanation`, indépendante de l'ordre, l'est).
    setEnCours({
      question: melangerQuestion(choix.question, 'correctAnswerIndex', graine, choix.question.id),
      palier: choix.palier,
    });
  }, [pool, indisponible, termine, enCours, palier, utilises, graine]);

  const suivant = () => {
    if (!enCours || choisi === null) return;
    const correct = choisi === enCours.question.correctAnswerIndex;
    const suite = [...historique, correct];
    const prochain = prochainPalier(enCours.palier, suite);
    const nouveauxUtilises = new Set(utilises).add(enCours.question.id);
    const rep = repondues + 1;

    setHistorique(suite);
    setPalier(prochain);
    setUtilises(nouveauxUtilises);
    setScore((s) => s + (correct ? 1 : 0));
    setRepondues(rep);
    setChoisi(null);
    setValide(false);
    setEnCours(null);
    if (rep >= NB_QUESTIONS_SEANCE) setTermine(true);
  };

  return (
    <div
      data-testid="quiz-adaptatif"
      dir="rtl"
      className="mx-auto w-full max-w-2xl space-y-4 p-3 sm:p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-black text-[#006d37] dark:text-emerald-300">
          تدريب متكيّف · 3 مستويات
        </h2>
        <button
          type="button"
          data-testid="quiz-adaptatif-retour"
          onClick={onBack}
          className="cursor-pointer rounded-lg border border-black/10 px-3 py-1 text-[11px] font-bold text-[#506072] dark:border-white/10 dark:text-gray-300"
        >
          رجوع إلى الاختبار
        </button>
      </div>

      <p className="rounded-xl bg-[#fff4d6] p-2 text-[10px] font-bold leading-relaxed text-[#7a5400] dark:bg-[#3a2c0a] dark:text-[#ffd875]">
        ⚠️ {REGLE_ADAPTATIVE_AR}
      </p>

      {indisponible ? (
        <p
          data-testid="quiz-adaptatif-indisponible"
          className="rounded-xl bg-[#fff4d6] p-3 text-[11px] font-bold text-[#7a5400] dark:bg-[#3a2c0a] dark:text-[#ffd875]"
        >
          بنك الأسئلة غير متاح حالياً — « Non vérifiable ». لا يُعرض أي سؤال بديل.
        </p>
      ) : termine ? (
        <section
          data-testid="quiz-adaptatif-bilan"
          className="rounded-2xl border-2 border-[#006d37]/40 bg-[#e5f6ed] p-4 dark:border-emerald-400/30 dark:bg-[#0f2a1c]"
        >
          <h3 className="text-[13px] font-black text-[#006d37] dark:text-emerald-300">
            نتيجة السلسلة
          </h3>
          <p className="mt-2 text-[12px] font-bold text-[#1f2b24] dark:text-gray-100">
            {score} / {repondues} · المستوى الأخير : {LIBELLES_DIFFICULTE[palier as PalierDifficulte]}
          </p>
          <p className="mt-1 text-[10px] text-[#506072] dark:text-gray-300">
            [CONSTAT] الأسئلة من بنك الأسئلة كما هي. [INTERPRÉTATION] لا يُحفظ أي ترتيب بين
            المتعلمين ولا تُرسل أي إشعارات.
          </p>
        </section>
      ) : !enCours ? (
        <p data-testid="quiz-adaptatif-chargement" className="text-[11px] font-bold text-[#506072]">
          جارٍ تحضير السؤال…
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-[#506072] dark:text-gray-300">
            <span data-testid="quiz-adaptatif-progression">
              السؤال {repondues + 1} / {NB_QUESTIONS_SEANCE}
            </span>
            <span data-testid="quiz-adaptatif-palier">
              الصعوبة : {LIBELLES_DIFFICULTE[enCours.palier as PalierDifficulte]}
            </span>
          </div>

          <section
            data-testid="quiz-adaptatif-question"
            className="rounded-2xl border border-[#006d37]/20 p-4 dark:border-emerald-400/20"
          >
            <p className="text-[13px] font-black leading-relaxed text-[#1f2b24] dark:text-gray-100">
              {enCours.question.questionText}
            </p>
            <div className="mt-3 space-y-1.5">
              {enCours.question.options.map((option, i) => (
                <button
                  key={`${enCours.question.id}-${i}`}
                  type="button"
                  data-testid={`quiz-adaptatif-option-${i}`}
                  onClick={() => !valide && setChoisi(i)}
                  className={`w-full cursor-pointer rounded-xl border px-3 py-2 text-right text-[11px] font-bold leading-relaxed ${
                    choisi === i
                      ? 'border-[#006d37] bg-[#e5f6ed] text-[#006d37]'
                      : 'border-black/10 text-[#1f2b24] dark:border-white/10 dark:text-gray-100'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {valide && (
              <div data-testid="quiz-adaptatif-verdict" className="mt-3 space-y-1">
                <p className="text-[12px] font-black text-[#006d37] dark:text-emerald-300">
                  {choisi === enCours.question.correctAnswerIndex ? '✅ إجابة صحيحة' : '❌ إجابة غير صحيحة'}
                </p>
                {enCours.question.explanation && (
                  <p className="text-[11px] leading-relaxed text-[#506072] dark:text-gray-300">
                    {enCours.question.explanation}
                  </p>
                )}
              </div>
            )}
          </section>

          <div className="flex gap-2">
            {!valide ? (
              <button
                type="button"
                data-testid="quiz-adaptatif-valider"
                disabled={choisi === null}
                onClick={() => setValide(true)}
                className="flex-1 cursor-pointer rounded-xl bg-[#006d37] px-3 py-2 text-[12px] font-black text-white disabled:opacity-40"
              >
                تحقّق من الإجابة
              </button>
            ) : (
              <button
                type="button"
                data-testid="quiz-adaptatif-suivant"
                onClick={suivant}
                className="flex-1 cursor-pointer rounded-xl bg-[#006d37] px-3 py-2 text-[12px] font-black text-white"
              >
                السؤال التالي
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
