// src/components/MicroLeconsPanel.tsx — R5 (2026-11-07), chargé en LAZY
// depuis LessonsView : hors bundle d'entrée.
//
// Aucune phrase n'est écrite ici : tout vient de microLecons.ts, lui-même
// dérivé VERBATIM de l'index des leçons et des RESUMES_LECONS ancrés.
//
// ⚠️ L'index des chunks arrive par FETCH (dist/tutor/lesson-index.json,
// précaché par le SW) via lessonIndexRuntime — jamais par import statique :
// sinon ~800 Ko de données repartiraient dans un chunk JS et le verrou
// tutorLeconsJson.lock.test.ts casserait.

import { useEffect, useMemo, useState } from 'react';
import { CAPITAINE_IDENTITE_AR } from '../data/capitaineIdentite';
import {
  chargerLessonIndex,
  lessonIndexChargee,
  lessonIndexSiChargee,
} from '../data/lessonIndexRuntime';
import {
  AVERTISSEMENT_MICRO_AR,
  construireLeconsDecoupees,
  statsMicroLecons,
} from '../data/microLecons';

interface Props {
  onBack: () => void;
  lessonKeyInitial?: string;
}

const LIBELLE_SOURCE_AR: Record<string, string> = {
  'resume-ancre': 'خلاصة الدرس المثبتة في الكتاب (مُراجَعة)',
  'extrait-cours': 'مقتبس حرفياً من خلاصة الدرس — تجزئة آلية',
  absente: 'لا خلاصة كافية في المصدر — « Non vérifiable »',
};

export default function MicroLeconsPanel({ onBack, lessonKeyInitial }: Props) {
  const [pret, setPret] = useState(lessonIndexChargee());
  const [cle, setCle] = useState<string | null>(null);
  const [ouvert, setOuvert] = useState<number | null>(null);

  // En test, l'index est injecté par src/test-setup/prechargerBasesTuteur.ts ;
  // en production, il est récupéré par fetch au premier montage du panneau.
  useEffect(() => {
    if (lessonIndexChargee()) return;
    let vivant = true;
    chargerLessonIndex().then(() => {
      if (vivant) setPret(lessonIndexChargee());
    });
    return () => {
      vivant = false;
    };
  }, []);

  const lecons = useMemo(() => {
    const chunks = lessonIndexSiChargee();
    return chunks ? construireLeconsDecoupees(chunks) : [];
    // `pret` = ticker d'invalidation : l'index arrive par fetch, pas par import.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pret]);
  const stats = useMemo(() => statsMicroLecons(lecons), [lecons]);

  const initial = lecons.find((l) => l.lessonKey === lessonKeyInitial) ?? lecons[0];
  const lecon = lecons.find((l) => l.cle === cle) ?? initial;

  return (
    <div
      data-testid="micro-lecons-panel"
      dir="rtl"
      className="mx-auto w-full max-w-3xl space-y-3 p-3 sm:p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-black text-[#006d37] dark:text-emerald-300">
          {CAPITAINE_IDENTITE_AR}
        </p>
        <button
          type="button"
          data-testid="micro-retour"
          onClick={onBack}
          className="cursor-pointer rounded-lg border border-black/10 px-2 py-1 text-[11px] font-bold text-[#506072] dark:border-white/10 dark:text-gray-300"
        >
          رجوع
        </button>
      </div>

      <h2 className="text-base font-black text-[#1f2b24] dark:text-gray-100">
        الدروس المصغّرة · خلاصة في 3 جمل
      </h2>

      {!lecon ? (
        // Dégradation HONNÊTE : aucune donnée fabriquée si le JSON manque.
        <p
          data-testid="micro-indisponible"
          className="rounded-xl bg-[#fff4d6] p-3 text-[11px] font-bold text-[#7a5400] dark:bg-[#3a2c0a] dark:text-[#ffd875]"
        >
          ⚠️ فهرس الدروس غير متاح حالياً — « Non vérifiable ». لا تُعرض أي خلاصة بديلة.
        </p>
      ) : (
        <>
          <p className="text-[11px] font-bold text-[#506072] dark:text-gray-300">
            {stats.lecons} درساً · {stats.chunks} مقطعاً · {stats.microLecons} درساً مصغّراً
          </p>

          <label className="block text-[11px] font-bold text-[#506072] dark:text-gray-300">
            اختر الدرس
            <select
              data-testid="micro-choix-lecon"
              value={lecon.cle}
              onChange={(e) => {
                setCle(e.target.value);
                setOuvert(null);
              }}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white p-2 text-[12px] font-bold text-[#1f2b24] dark:border-white/10 dark:bg-[#121614] dark:text-gray-100"
            >
              {lecons.map((l) => (
                <option key={l.cle} value={l.cle}>
                  {l.lessonTitle} · {l.kind === 'html' ? 'الدرس الرسمي' : 'الدرس النشيط'} · الوحدة{' '}
                  {l.unitId}
                </option>
              ))}
            </select>
          </label>

          <p className="rounded-xl bg-[#fff4d6] p-2 text-[10px] font-bold leading-relaxed text-[#7a5400] dark:bg-[#3a2c0a] dark:text-[#ffd875]">
            ⚠️ {AVERTISSEMENT_MICRO_AR}
          </p>

          <div className="rounded-2xl border border-[#006d37]/20 p-3 dark:border-emerald-400/20">
            <p className="text-[12px] font-black text-[#1f2b24] dark:text-gray-100">
              {lecon.lessonTitle}
            </p>
            <p className="mt-1 text-[10px] font-bold text-[#506072] dark:text-gray-300">
              {lecon.nbChunks} مقطعاً · {lecon.microLecons.length} درساً مصغّراً ·{' '}
              {lecon.dureeDeclareeMinutes === null
                ? 'المدة غير مصرّح بها في الدرس (« Non vérifiable »)'
                : `المدة المصرّح بها في الدرس : ${lecon.dureeDeclareeMinutes} دقيقة`}
            </p>
          </div>

          <ul className="space-y-2" data-testid="micro-liste">
            {lecon.microLecons.map((micro) => (
              <li
                key={micro.id}
                className="rounded-2xl border border-[#006d37]/20 p-3 dark:border-emerald-400/20"
              >
                <button
                  type="button"
                  data-testid={`micro-carte-${micro.index}`}
                  onClick={() => setOuvert(ouvert === micro.index ? null : micro.index)}
                  className="flex w-full cursor-pointer items-center justify-between gap-2 text-right"
                >
                  <span className="text-[12px] font-black text-[#1f2b24] dark:text-gray-100">
                    الدرس المصغّر {micro.index} / {micro.total} · {micro.chunkIds.length} مقطع
                  </span>
                  <span className="shrink-0 text-[11px] font-black text-[#006d37] dark:text-emerald-300">
                    {micro.minutes === null
                      ? '⏱️ المدة غير مصرّح بها'
                      : `⏱️ ${micro.minutes} دقيقة (تقدير)`}
                  </span>
                </button>
                <ul className="mt-1 space-y-0.5">
                  {micro.titres.map((t, i) => (
                    <li
                      key={micro.chunkIds[i]}
                      className="text-[11px] text-[#506072] dark:text-gray-300"
                    >
                      📘 {t}
                    </li>
                  ))}
                </ul>
                {ouvert === micro.index && (
                  <div data-testid={`micro-texte-${micro.index}`} className="mt-2 space-y-2">
                    {micro.textes.map((t, i) => (
                      <p
                        key={micro.chunkIds[i]}
                        className="whitespace-pre-wrap rounded-xl bg-black/[0.03] p-2 text-[11px] leading-relaxed text-[#1f2b24] dark:bg-white/[0.04] dark:text-gray-100"
                      >
                        {t}
                      </p>
                    ))}
                    <p className="text-[10px] text-[#506072] dark:text-gray-300">
                      [CONSTAT] نص الدرس كما هو، دون تعديل.
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* La synthèse est TOUJOURS en fin de leçon, comme demandé par R5. */}
          <section
            data-testid="micro-synthese"
            className="rounded-2xl border-2 border-[#006d37]/40 bg-[#e5f6ed] p-3 dark:border-emerald-400/30 dark:bg-[#0f2a1c]"
          >
            <h3 className="text-[12px] font-black text-[#006d37] dark:text-emerald-300">
              خلاصة في 3 جمل
            </h3>
            <ol className="mt-2 space-y-1.5">
              {lecon.synthese.phrases.map((p, i) => (
                <li
                  key={`${lecon.cle}-s${i}`}
                  className="text-[11px] font-bold leading-relaxed text-[#1f2b24] dark:text-gray-100"
                >
                  {i + 1}. {p}
                </li>
              ))}
            </ol>
            <p className="mt-2 text-[10px] font-bold text-[#506072] dark:text-gray-300">
              {LIBELLE_SOURCE_AR[lecon.synthese.source]} · [INTERPRÉTATION] الترتيب آلي، وليس
              ترتيباً رسمياً.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
