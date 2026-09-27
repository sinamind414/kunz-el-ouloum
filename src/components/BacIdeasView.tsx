// BacIdeasView.tsx — « أفكار التمارين » par session du BAC (audit item 12, sprint 16).
//
// La question que l'élève pose en avril n'est pas « qu'est-ce qu'une enzyme ? »
// mais « qu'est-ce qui est tombé, et sous quelle forme ? ». Cet écran répond
// avec les sujets officiels réellement dépouillés (2019, 2021→2025) : pour
// chaque exercice, l'IDÉE, les supports fournis, la notion évaluée, les verbes
// de consigne — et les portes vers le contenu déjà présent dans l'app.
//
// Aucun énoncé n'est reproduit : ce n'est pas une annale de plus, c'est la
// carte de ce que l'examen demande.

import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, FileText, Search, TrendingUp } from 'lucide-react';
import {
  BAC_IDEAS,
  BAC_SESSION_SOURCES,
  MISSING_YEARS,
  YEARS_COVERED,
  ideasForYear,
  pointsOfSujet,
  searchIdeas,
  unitPressure,
  verbFrequency,
  type BacExerciseIdea,
} from '../data/bacSessionIndex';
import { INITIAL_UNITS } from '../unitCatalog';

interface BacIdeasViewProps {
  onBackToHome?: () => void;
}

const UNIT_TITLE: Record<number, string> = Object.fromEntries(
  INITIAL_UNITS.map((u) => [u.id, u.title]),
);

function Fiche({ idea }: { idea: BacExerciseIdea }) {
  return (
    <article
      data-testid={`idee-${idea.id}`}
      className="rounded-3xl p-4 bg-white dark:bg-[#141916] border border-[#bbcbbb]/30"
    >
      <div className="flex flex-row-reverse items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-black text-[#1f1c0b] dark:text-gray-100 text-right">
          {idea.titleAr}
        </h3>
        <span className="shrink-0 text-[11px] font-bold px-2 py-1 rounded-xl bg-[#fff7e0] text-[#8a6a00] dark:bg-black/20 dark:text-[#d9a400]">
          {idea.year} · موضوع {idea.sujet} · تمرين {idea.exercice} · {idea.points} ن
        </span>
      </div>

      <p className="text-[13px] leading-7 text-[#1f1c0b] dark:text-gray-200 text-right mb-3">
        {idea.ideaAr}
      </p>

      <div className="rounded-2xl p-3 bg-[#f7f8f7] dark:bg-black/20 mb-3">
        <p className="text-[11px] font-black text-[#506072] dark:text-gray-400 mb-1">السندات المقدَّمة</p>
        <ul className="list-disc pr-4 space-y-1 text-[12px] leading-6 text-[#506072] dark:text-gray-300 text-right">
          {idea.supportsAr.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>

      <p className="text-[12px] leading-6 text-[#006d37] dark:text-[#2ecc71] text-right mb-2">
        <span className="font-black">ما يُقيَّم فعلاً: </span>
        {idea.notionAr}
      </p>

      <div className="flex flex-row-reverse flex-wrap gap-1.5 mb-2">
        {idea.verbsAr.map((v) => (
          <span
            key={v}
            className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300"
          >
            {v}
          </span>
        ))}
      </div>

      <div className="flex flex-row-reverse flex-wrap gap-1.5 text-[11px] text-[#506072] dark:text-gray-400">
        {idea.unitIds.map((u) => (
          <span key={u} className="px-2 py-0.5 rounded-lg bg-[#e8f5ee] dark:bg-black/20">
            {UNIT_TITLE[u] ?? `وحدة ${u}`}
          </span>
        ))}
      </div>
    </article>
  );
}

export default function BacIdeasView({ onBackToHome }: BacIdeasViewProps) {
  const [annee, setAnnee] = useState<number | 'all'>(YEARS_COVERED[0]);
  const [requete, setRequete] = useState('');

  const liste = useMemo(() => {
    const q = requete.trim();
    if (q) return searchIdeas(q);
    if (annee === 'all') return [...BAC_IDEAS].sort((a, b) => b.year - a.year || a.sujet - b.sujet || a.exercice - b.exercice);
    return ideasForYear(annee);
  }, [annee, requete]);

  const pression = useMemo(() => unitPressure().slice(0, 5), []);
  const verbes = useMemo(() => verbFrequency().slice(0, 6), []);
  const sourceAnnee =
    annee === 'all' ? undefined : BAC_SESSION_SOURCES.find((s) => s.year === annee);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto" dir="rtl" data-testid="bac-ideas">
      <div className="flex flex-row-reverse items-center justify-between gap-4 mb-5">
        <div className="flex flex-row-reverse items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-gradient-to-l from-[#006d37] to-emerald-600 flex items-center justify-center shadow-md">
            <FileText className="w-6 h-6 text-white" />
          </span>
          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-black text-[#1f1c0b] dark:text-gray-100">
              أفكار التمارين حسب الدورة
            </h1>
            <p className="text-sm text-[#506072] dark:text-gray-400">
              ما الذي سقط في البكالوريا، و بأي سند، و بأي فعل إدائي — من المواضيع الرسمية
            </p>
          </div>
        </div>
        {onBackToHome && (
          <button
            data-testid="idees-retour"
            onClick={onBackToHome}
            className="flex flex-row-reverse items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f3f4f5] dark:bg-[#1f2622] border border-[#bbcbbb]/30 text-sm font-bold text-[#006d37] dark:text-[#2ecc71] cursor-pointer"
          >
            <span>العودة</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <section
        data-testid="idees-pression"
        className="rounded-3xl p-4 bg-[#fff9ed] dark:bg-black/20 border border-[#d9a400]/30 mb-4"
      >
        <p className="flex flex-row-reverse items-center gap-2 text-sm font-black text-[#1f1c0b] dark:text-gray-100 mb-2">
          <TrendingUp className="w-4 h-4" />
          ما الذي يتكرّر؟ (حسب النقاط، على {YEARS_COVERED.length} دورات مقروءة)
        </p>
        <div className="flex flex-row-reverse flex-wrap gap-2 mb-3">
          {pression.map((p) => (
            <span
              key={p.unitId}
              data-testid={`pression-${p.unitId}`}
              className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-white dark:bg-[#141916] text-[#1f1c0b] dark:text-gray-200"
            >
              {UNIT_TITLE[p.unitId] ?? `وحدة ${p.unitId}`} — {p.pointsPrincipaux} ن في {p.principal} تمرين
            </span>
          ))}
        </div>
        <div className="flex flex-row-reverse flex-wrap gap-1.5">
          {verbes.map((v) => (
            <span
              key={v.verbe}
              className="text-[11px] px-2 py-0.5 rounded-lg bg-white/70 dark:bg-white/5 text-[#506072] dark:text-gray-300"
            >
              {v.verbe} ×{v.count}
            </span>
          ))}
        </div>
        <p className="mt-3 text-[11px] leading-6 text-[#506072] dark:text-gray-400">
          {MISSING_YEARS.length === 0
            ? `كل الدورات من ${Math.min(...YEARS_COVERED)} إلى ${Math.max(...YEARS_COVERED)} مقروءة من المواضيع الرسمية، دون فجوة.`
            : `دورة ${MISSING_YEARS.join('، ')} غير مدرجة: لم يتوفّر نصّها الرسمي — لم نخترع لها شيئاً.`}
        </p>
      </section>

      <div className="flex flex-row-reverse flex-wrap items-center gap-2 mb-4">
        {YEARS_COVERED.map((y) => (
          <button
            key={y}
            data-testid={`annee-${y}`}
            onClick={() => {
              setAnnee(y);
              setRequete('');
            }}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer ${
              annee === y && !requete
                ? 'bg-[#006d37] text-white'
                : 'bg-[#f3f4f5] dark:bg-[#1f2622] text-[#506072] dark:text-gray-300'
            }`}
          >
            {y}
          </button>
        ))}
        <button
          data-testid="annee-all"
          onClick={() => {
            setAnnee('all');
            setRequete('');
          }}
          className={`text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer ${
            annee === 'all' && !requete
              ? 'bg-[#006d37] text-white'
              : 'bg-[#f3f4f5] dark:bg-[#1f2622] text-[#506072] dark:text-gray-300'
          }`}
        >
          كل الدورات
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-[#506072]" />
        <input
          data-testid="idees-recherche"
          value={requete}
          onChange={(e) => setRequete(e.target.value)}
          placeholder="ابحث: الجينتاميسين، البرفورين، الروبيسكو، 2023…"
          className="w-full rounded-2xl py-2.5 pr-10 pl-3 text-sm bg-white dark:bg-[#141916] border border-[#bbcbbb]/30 text-right text-[#1f1c0b] dark:text-gray-100"
        />
      </div>

      {!requete && annee !== 'all' && (
        <p data-testid="idees-bareme" className="mb-3 text-[12px] text-[#506072] dark:text-gray-400 text-right">
          الموضوع الأول: {pointsOfSujet(annee, 1)}/20 نقطة · الموضوع الثاني: {pointsOfSujet(annee, 2)}/20 نقطة
          {sourceAnnee && (
            <>
              {' '}
              ·{' '}
              <a href={sourceAnnee.url} target="_blank" rel="noreferrer" className="underline">
                الموضوع الرسمي
              </a>
            </>
          )}
        </p>
      )}

      <p data-testid="idees-total" className="mb-2 text-[12px] font-bold text-[#506072] dark:text-gray-400 text-right">
        {liste.length} فكرة
      </p>

      <div className="space-y-3">
        {liste.map((idea) => (
          <Fiche key={idea.id} idea={idea} />
        ))}
        {liste.length === 0 && (
          <p
            data-testid="idees-vide"
            className="rounded-3xl p-6 bg-white dark:bg-[#141916] border border-[#bbcbbb]/30 text-center text-sm text-[#506072] dark:text-gray-400"
          >
            <BookOpen className="w-5 h-5 mx-auto mb-2" />
            لا نتيجة. جرّب اسم مادة أو مرض أو سنة الدورة.
          </p>
        )}
      </div>
    </div>
  );
}
