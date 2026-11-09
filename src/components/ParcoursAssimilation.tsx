// src/components/ParcoursAssimilation.tsx — étage 3 (R1 positionnement, R4 J-7,
// R7 accès rapide). Chargé en LAZY depuis App.tsx : hors bundle d'entrée.
//
// Aucun contenu scientifique ici : tout vient de positionnementInitial.ts,
// expressJ7.ts et prioritesBac.ts, eux-mêmes dérivés du dépôt.

import { useState } from 'react';
import { CAPITAINE_IDENTITE_AR } from '../data/capitaineIdentite';
import {
  evaluerPositionnement,
  LIBELLES_PROFIL,
  OBJECTIFS_NOTE,
  QUESTIONS_POSITIONNEMENT,
  type ObjectifNote,
  type ResultatPositionnement,
} from '../data/positionnementInitial';
import {
  AVERTISSEMENT_DATE_AR,
  PLAN_EXPRESS_J7,
  joursRestants,
} from '../data/expressJ7';
import { phrasePrioriteAr } from '../data/prioritesBac';

interface Props {
  onFermer: () => void;
  /** Renvoie vers une des 4 rubriques existantes, jamais vers un onglet inventé. */
  onOuvrirRubrique: (rubrique: 'cours' | 'entrainement' | 'revision') => void;
  /** R7 : pré-ouvre la recherche plein texte déjà portée par LessonsView. */
  onOuvrirRecherche: () => void;
}

type Onglet = 'positionnement' | 'express';
type Etape = 'objectif' | 'questions' | 'resultat';

export default function ParcoursAssimilation({ onFermer, onOuvrirRubrique, onOuvrirRecherche }: Props) {
  const [onglet, setOnglet] = useState<Onglet>('positionnement');
  const [etape, setEtape] = useState<Etape>('objectif');
  const [objectif, setObjectif] = useState<ObjectifNote>(14);
  const [indexQuestion, setIndexQuestion] = useState(0);
  const [reponses, setReponses] = useState<Array<number | null>>(
    () => QUESTIONS_POSITIONNEMENT.map(() => null),
  );
  const [resultat, setResultat] = useState<ResultatPositionnement | null>(null);

  const question = QUESTIONS_POSITIONNEMENT[indexQuestion];
  const choisi = reponses[indexQuestion];

  const suivant = () => {
    if (indexQuestion + 1 < QUESTIONS_POSITIONNEMENT.length) {
      setIndexQuestion(indexQuestion + 1);
    } else {
      setResultat(evaluerPositionnement(reponses, objectif));
      setEtape('resultat');
    }
  };

  const recommencer = () => {
    setResultat(null);
    setReponses(QUESTIONS_POSITIONNEMENT.map(() => null));
    setIndexQuestion(0);
    setEtape('objectif');
  };

  return (
    <div
      data-testid="parcours-assimilation"
      dir="rtl"
      role="dialog"
      aria-label="خطة المراجعة حسب المستوى"
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 p-3 sm:p-6"
    >
      <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl dark:bg-[#121614]">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-[11px] font-black text-[#006d37] dark:text-emerald-300">
            {CAPITAINE_IDENTITE_AR}
          </p>
          <button
            type="button"
            data-testid="parcours-fermer"
            onClick={onFermer}
            aria-label="إغلاق"
            className="rounded-lg border border-black/10 px-2 py-0.5 text-[10px] font-bold text-[#506072] dark:border-white/10 dark:text-gray-300 cursor-pointer"
          >
            إغلاق
          </button>
        </div>

        <div className="mb-4 flex gap-2" role="tablist" aria-label="أقسام الخطة">
          {(['positionnement', 'express'] as const).map((o) => (
            <button
              key={o}
              type="button"
              role="tab"
              aria-selected={onglet === o}
              data-testid={`parcours-onglet-${o}`}
              onClick={() => setOnglet(o)}
              className={`flex-1 rounded-xl px-3 py-2 text-[11px] font-black cursor-pointer ${
                onglet === o
                  ? 'bg-[#006d37] text-white'
                  : 'border border-black/10 text-[#506072] dark:border-white/10 dark:text-gray-300'
              }`}
            >
              {o === 'positionnement' ? 'حدّد مستواك' : 'خطة J-7'}
            </button>
          ))}
        </div>

        {onglet === 'positionnement' && (
          <div data-testid="parcours-positionnement">
            {etape === 'objectif' && (
              <>
                <p className="text-[13px] font-bold text-[#1f2b24] dark:text-gray-100">
                  ما الهدف الذي تسعى إليه؟ (اختيارك، لا درجة رسمية)
                </p>
                <div className="mt-2 flex gap-2">
                  {OBJECTIFS_NOTE.map((n) => (
                    <button
                      key={n}
                      type="button"
                      data-testid={`parcours-objectif-${n}`}
                      onClick={() => setObjectif(n)}
                      className={`flex-1 rounded-xl px-2 py-2 text-[12px] font-black cursor-pointer ${
                        objectif === n
                          ? 'bg-[#006d37] text-white'
                          : 'border border-black/10 text-[#506072] dark:border-white/10 dark:text-gray-300'
                      }`}
                    >
                      {n}/20
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-[#506072] dark:text-gray-300">
                  {QUESTIONS_POSITIONNEMENT.length} سؤالاً قصيراً من بنك الأسئلة وعقود التعاليم :
                  غير مُقيّم، ولا يُحفظ أي نتيجة.
                </p>
                <button
                  type="button"
                  data-testid="parcours-commencer"
                  onClick={() => setEtape('questions')}
                  className="mt-3 w-full rounded-xl bg-[#006d37] px-3 py-2 text-[12px] font-black text-white cursor-pointer"
                >
                  ابدأ
                </button>
              </>
            )}

            {etape === 'questions' && question && (
              <>
                <p className="text-[10px] font-bold text-[#506072] dark:text-gray-300">
                  السؤال {indexQuestion + 1} / {QUESTIONS_POSITIONNEMENT.length} · المجال {question.domaine}
                </p>
                <p className="mt-1 text-[13px] font-bold leading-relaxed text-[#1f2b24] dark:text-gray-100">
                  {question.enonceAr}
                </p>
                <div className="mt-2 space-y-1.5">
                  {question.optionsAr.map((opt, i) => (
                    <button
                      key={`${question.id}-${i}`}
                      type="button"
                      data-testid={`parcours-option-${i}`}
                      onClick={() =>
                        setReponses((r) => r.map((v, k) => (k === indexQuestion ? i : v)))
                      }
                      className={`w-full rounded-xl border px-3 py-2 text-right text-[11px] font-bold leading-relaxed cursor-pointer ${
                        choisi === i
                          ? 'border-[#006d37] bg-[#e5f6ed] text-[#006d37]'
                          : 'border-black/10 text-[#1f2b24] dark:border-white/10 dark:text-gray-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  data-testid="parcours-suivant"
                  onClick={suivant}
                  className="mt-3 w-full rounded-xl bg-[#006d37] px-3 py-2 text-[12px] font-black text-white cursor-pointer"
                >
                  {indexQuestion + 1 === QUESTIONS_POSITIONNEMENT.length ? 'اعرض النتيجة' : 'السؤال التالي'}
                </button>
              </>
            )}

            {etape === 'resultat' && resultat && (
              <div data-testid="parcours-resultat" aria-live="polite">
                <p className="text-[13px] font-black text-[#006d37] dark:text-emerald-300">
                  {resultat.score} / {resultat.total} · {LIBELLES_PROFIL[resultat.profil]}
                </p>
                <p className="mt-1 text-[12px] font-bold text-[#1f2b24] dark:text-gray-100">
                  {resultat.raisonAr}
                </p>
                <p className="mt-1 text-[11px] text-[#506072] dark:text-gray-300">
                  الأداة المقترحة : {resultat.outilAr} · هدفك : {resultat.objectif}/20
                </p>
                <p className="mt-1 text-[10px] text-[#506072] dark:text-gray-300">
                  [INTERPRÉTATION] حدود المستويات اقتراح تعليمي، ليست معياراً رسمياً.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    data-testid="parcours-ouvrir-rubrique"
                    onClick={() => onOuvrirRubrique(resultat.rubrique)}
                    className="flex-1 rounded-xl bg-[#006d37] px-3 py-2 text-[12px] font-black text-white cursor-pointer"
                  >
                    افتح المسار المقترح
                  </button>
                  <button
                    type="button"
                    onClick={recommencer}
                    className="rounded-xl border border-black/10 px-3 py-2 text-[11px] font-bold text-[#506072] dark:border-white/10 dark:text-gray-300 cursor-pointer"
                  >
                    إعادة
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {onglet === 'express' && (
          <div data-testid="parcours-express">
            <p className="rounded-xl bg-[#fff4d6] p-2 text-[11px] font-bold leading-relaxed text-[#7a5400] dark:bg-[#3a2c0a] dark:text-[#ffd875]">
              ⚠️ {AVERTISSEMENT_DATE_AR}
            </p>
            <p className="mt-2 text-[11px] font-bold text-[#506072] dark:text-gray-300">
              {joursRestants() === null ? 'الأجل غير محسوب' : `يُعرض أيضاً خارج نافذة J-7 (${joursRestants()} يوماً متبقياً)`} · {PLAN_EXPRESS_J7.length} أيام · {PLAN_EXPRESS_J7[0].minutesProposees} دقيقة مقترحة لكل يوم.
            </p>
            <ul className="mt-2 space-y-2">
              {PLAN_EXPRESS_J7.map((jour) => (
                <li
                  key={jour.jour}
                  className="rounded-2xl border border-[#006d37]/20 p-3 dark:border-emerald-400/20"
                >
                  <p className="text-[12px] font-black text-[#1f2b24] dark:text-gray-100">
                    {jour.libelleAr}
                  </p>
                  <p className="mt-1 text-[10px] text-[#506072] dark:text-gray-300">
                    {phrasePrioriteAr(jour.priorite)}
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {jour.lecons.map((l) => (
                      <li key={l.id} className="text-[11px] text-[#1f2b24] dark:text-gray-100">
                        📘 {l.title}
                      </li>
                    ))}
                    <li className="text-[11px] text-[#1f2b24] dark:text-gray-100">
                      ✅ اختبار الوحدة {jour.quizUnitId}
                    </li>
                  </ul>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[10px] leading-relaxed text-[#506072] dark:text-gray-300">
              الترتيب حسب الوزن المقاس في دورات البكالوريا، لا حسب قرار رسمي. بقية الوحدات تبقى في المسار العادي.
            </p>
            <button
              type="button"
              data-testid="parcours-acces-rapide"
              onClick={onOuvrirRecherche}
              className="mt-3 w-full rounded-xl bg-[#006d37] px-3 py-2 text-[12px] font-black text-white cursor-pointer"
            >
              الدروس والبحث النصي
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
