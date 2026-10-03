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

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, AlertTriangle, BookOpen, FileText, Repeat, Search, TrendingUp } from 'lucide-react';
import {
  BAC_IDEAS,
  BAC_SESSION_SOURCES,
  IDEA_BY_ID,
  MISSING_YEARS,
  YEARS_COVERED,
  ideasForYear,
  pointsOfSujet,
  searchIdeas,
  unitPressure,
  type BacExerciseIdea,
} from '../data/bacSessionIndex';
import {
  ARCHETYPE_BY_ID,
  archetypeRecurrence,
  archetypesForIdea,
  ideasOfArchetype,
} from '../data/bacArchetypes';
import {
  VERB_FAMILY_BY_ID,
  ideasForVerbFamily,
  verbFamilyStats,
} from '../data/verbDemands';
import BacIdeaTrainer from './BacIdeaTrainer';
import WritingReviewPanel from './WritingReviewPanel';
import MockExamPanel from './MockExamPanel';
import { draftedFamilies, writingStats } from '../data/writingProgress';
import { INITIAL_UNITS } from '../unitCatalog';

interface BacIdeasViewProps {
  onBackToHome?: () => void;
  /** Ouvre directement l'atelier sur cet exercice (appel depuis le plan). */
  focusIdeaId?: string | null;
}

const UNIT_TITLE: Record<number, string> = Object.fromEntries(
  INITIAL_UNITS.map((u) => [u.id, u.title]),
);

function Fiche({ idea, onTrain }: { idea: BacExerciseIdea; onTrain: (idea: BacExerciseIdea) => void }) {
  const dejaRedige = draftedFamilies(idea.id);
  return (
    <article
      data-testid={`idee-${idea.id}`}
      className="rounded-3xl p-4 bg-white dark:bg-[#141916] border border-[#bbcbbb]/30"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
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

      <div className="flex flex-wrap gap-1.5 mb-2">
        {idea.verbsAr.map((v) => (
          <span
            key={v}
            className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300"
          >
            {v}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {archetypesForIdea(idea.id).map((a) => (
          <span
            key={a.id}
            data-testid={`fiche-montage-${idea.id}-${a.id}`}
            className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#fff7e0] text-[#8a6a00] dark:bg-black/20 dark:text-[#d9a400]"
          >
            {a.titleAr}
          </span>
        ))}
      </div>

      <button
        data-testid={`entrainer-${idea.id}`}
        onClick={() => onTrain(idea)}
        className="mb-2 text-[11px] font-bold px-3 py-1.5 rounded-xl bg-[#006d37] text-white cursor-pointer"
      >
        تدرّب على هذا التمرين
      </button>
      {dejaRedige.length > 0 && (
        <span
          data-testid={`redige-${idea.id}`}
          className="mr-2 text-[11px] font-bold px-2 py-1 rounded-xl bg-[#e8f5ee] text-[#006d37] dark:bg-black/20 dark:text-[#2ecc71]"
        >
          كتبت {dejaRedige.length} جواباً
        </span>
      )}

      <div className="flex flex-wrap gap-1.5 text-[11px] text-[#506072] dark:text-gray-400">
        {idea.unitIds.map((u) => (
          <span key={u} className="px-2 py-0.5 rounded-lg bg-[#e8f5ee] dark:bg-black/20">
            {UNIT_TITLE[u] ?? `وحدة ${u}`}
          </span>
        ))}
      </div>
    </article>
  );
}

export default function BacIdeasView({ onBackToHome, focusIdeaId = null }: BacIdeasViewProps) {
  const [annee, setAnnee] = useState<number | 'all'>(YEARS_COVERED[0]);
  const [requete, setRequete] = useState('');
  const [montage, setMontage] = useState<string | null>(null);
  const [famille, setFamille] = useState<string | null>(null);
  const [entrainement, setEntrainement] = useState<BacExerciseIdea | null>(
    focusIdeaId ? (IDEA_BY_ID[focusIdeaId] ?? null) : null,
  );
  const [redige, setRedige] = useState(() => writingStats());
  // Change à chaque fermeture d'atelier : force la relecture des brouillons.
  const [revision, setRevision] = useState(0);
  const [revueVisible, setRevueVisible] = useState(false);
  const [sujetVisible, setSujetVisible] = useState(false);

  useEffect(() => {
    if (focusIdeaId && IDEA_BY_ID[focusIdeaId]) setEntrainement(IDEA_BY_ID[focusIdeaId]);
  }, [focusIdeaId]);

  const liste = useMemo(() => {
    if (famille) return ideasForVerbFamily(famille);
    if (montage) return ideasOfArchetype(montage);
    const q = requete.trim();
    if (q) return searchIdeas(q);
    if (annee === 'all') return [...BAC_IDEAS].sort((a, b) => b.year - a.year || a.sujet - b.sujet || a.exercice - b.exercice);
    return ideasForYear(annee);
  }, [annee, requete, montage, famille]);

  const montages = useMemo(() => archetypeRecurrence(), []);
  const montageActif = montage ? ARCHETYPE_BY_ID[montage] : undefined;
  const familles = useMemo(() => verbFamilyStats(), []);
  const familleActive = famille ? VERB_FAMILY_BY_ID[famille] : undefined;

  const pression = useMemo(() => unitPressure().slice(0, 5), []);
  const sourceAnnee =
    annee === 'all' ? undefined : BAC_SESSION_SOURCES.find((s) => s.year === annee);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto" dir="rtl" data-testid="bac-ideas">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
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
        <p className="flex items-center gap-2 text-sm font-black text-[#1f1c0b] dark:text-gray-100 mb-2">
          <TrendingUp className="w-4 h-4" />
          ما الذي يتكرّر؟ (حسب النقاط، على {YEARS_COVERED.length} دورات مقروءة)
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
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
        <div className="flex flex-wrap gap-1.5">
          {familles.map((f) => (
            <button
              key={f.familyId}
              data-testid={`famille-${f.familyId}`}
              onClick={() => {
                setMontage(null);
                setFamille(famille === f.familyId ? null : f.familyId);
              }}
              className={`text-[11px] font-bold px-2 py-0.5 rounded-lg cursor-pointer ${
                famille === f.familyId
                  ? 'bg-[#006d37] text-white'
                  : 'bg-white/70 dark:bg-white/5 text-[#506072] dark:text-gray-300'
              }`}
            >
              {f.titleAr} ×{f.occurrences}
            </button>
          ))}
        </div>
        <p className="mt-3 text-[11px] leading-6 text-[#506072] dark:text-gray-400">
          {MISSING_YEARS.length === 0
            ? `كل الدورات من ${Math.min(...YEARS_COVERED)} إلى ${Math.max(...YEARS_COVERED)} مقروءة من المواضيع الرسمية، دون فجوة.`
            : `دورة ${MISSING_YEARS.join('، ')} غير مدرجة: لم يتوفّر نصّها الرسمي — لم نخترع لها شيئاً.`}
        </p>
      </section>

      {entrainement && (
        <BacIdeaTrainer
          idea={entrainement}
          onClose={() => {
            setRedige(writingStats());
            setRevision((n) => n + 1);
            setEntrainement(null);
          }}
        />
      )}

      <div className="flex mb-3">
        <button
          data-testid="basculer-sujet"
          onClick={() => setSujetVisible((v) => !v)}
          className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-[#1f1c0b] text-white cursor-pointer"
        >
          {sujetVisible ? 'إخفاء الموضوع التجريبي' : 'ركّب موضوعاً تجريبياً'}
        </button>
      </div>

      {sujetVisible && <MockExamPanel onTrain={setEntrainement} />}

      <section
        data-testid="montages"
        className="rounded-3xl p-4 bg-white dark:bg-[#141916] border border-[#bbcbbb]/30 mb-4"
      >
        <p className="flex items-center gap-2 text-sm font-black text-[#1f1c0b] dark:text-gray-100 mb-1">
          <Repeat className="w-4 h-4" />
          التركيبات التي تتكرّر — راجع الشكل لا الجزيئة
        </p>
        <p className="text-[12px] leading-6 text-[#506072] dark:text-gray-400 mb-3 text-right">
          الوزارة لا تخترع الامتحان كل سنة: تُعيد عدداً قليلاً من التركيبات بجزيئة و مرض مختلفين.
        </p>
        <div className="flex flex-wrap gap-2">
          {montages.map((m) => (
            <button
              key={m.archetypeId}
              data-testid={`montage-${m.archetypeId}`}
              onClick={() => {
                setFamille(null);
                setMontage(montage === m.archetypeId ? null : m.archetypeId);
              }}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-xl cursor-pointer ${
                montage === m.archetypeId
                  ? 'bg-[#006d37] text-white'
                  : 'bg-[#f3f4f5] dark:bg-[#1f2622] text-[#506072] dark:text-gray-300'
              }`}
            >
              {m.titleAr} · {m.points} ن / {m.sessions} دورات
            </button>
          ))}
        </div>
      </section>

      {montageActif && (
        <section
          data-testid="montage-detail"
          className="rounded-3xl p-4 bg-[#f7fbf8] dark:bg-black/20 border border-[#006d37]/30 mb-4"
        >
          <h2 className="text-base font-black text-[#006d37] dark:text-[#2ecc71] mb-1 text-right">
            {montageActif.titleAr}
          </h2>
          <p className="text-[13px] leading-7 text-[#1f1c0b] dark:text-gray-200 text-right mb-3">
            {montageActif.definitionAr}
          </p>

          <p className="text-[11px] font-black text-[#506072] dark:text-gray-400 mb-1">كيف أتعرّف عليه؟</p>
          <ul className="list-disc pr-4 mb-3 space-y-1 text-[12px] leading-6 text-[#506072] dark:text-gray-300 text-right">
            {montageActif.signalsAr.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>

          <p className="text-[11px] font-black text-[#506072] dark:text-gray-400 mb-1">ماذا أفعل، بالترتيب؟</p>
          <ol className="list-decimal pr-4 mb-3 space-y-1 text-[12px] leading-6 text-[#1f1c0b] dark:text-gray-200 text-right">
            {montageActif.methodAr.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>

          <p className="flex items-start gap-2 text-[12px] leading-6 text-rose-700 dark:text-rose-400 text-right">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <span className="font-black">الفخّ: </span>
              {montageActif.trapAr}
            </span>
          </p>
        </section>
      )}

      {familleActive && (
        <section
          data-testid="famille-detail"
          className="rounded-3xl p-4 bg-[#fff9ed] dark:bg-black/20 border border-[#d9a400]/40 mb-4"
        >
          <h2 className="text-base font-black text-[#8a6a00] dark:text-[#d9a400] mb-1 text-right">
            التعليمة: {familleActive.titleAr}
          </h2>
          <p className="text-[13px] leading-7 text-[#1f1c0b] dark:text-gray-200 text-right mb-3">
            {familleActive.demandeAr}
          </p>

          <p className="text-[11px] font-black text-[#506072] dark:text-gray-400 mb-1">بنية الجواب</p>
          <ol className="list-decimal pr-4 mb-3 space-y-1 text-[12px] leading-6 text-[#1f1c0b] dark:text-gray-200 text-right">
            {familleActive.structureAr.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>

          <p
            data-testid="famille-template"
            className="text-[13px] leading-7 text-[#006d37] dark:text-[#2ecc71] text-right mb-2"
          >
            <span className="font-black">قالب الصياغة: </span>
            {familleActive.templateAr}
          </p>

          <p className="flex items-start gap-2 text-[12px] leading-6 text-rose-700 dark:text-rose-400 text-right">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <span className="font-black">الخلط الشائع: </span>
              {familleActive.confusionAr}
            </span>
          </p>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {YEARS_COVERED.map((y) => (
          <button
            key={y}
            data-testid={`annee-${y}`}
            onClick={() => {
              setAnnee(y);
              setRequete('');
              setMontage(null);
              setFamille(null);
            }}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer ${
              annee === y && !requete && !montage && !famille
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
            setMontage(null);
            setFamille(null);
          }}
          className={`text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer ${
            annee === 'all' && !requete && !montage && !famille
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
          onChange={(e) => {
            setRequete(e.target.value);
            setMontage(null);
            setFamille(null);
          }}
          placeholder="ابحث: الجينتاميسين، البرفورين، الروبيسكو، 2023…"
          className="w-full rounded-2xl py-2.5 pr-10 pl-3 text-sm bg-white dark:bg-[#141916] border border-[#bbcbbb]/30 text-right text-[#1f1c0b] dark:text-gray-100"
        />
      </div>

      {!requete && !montage && !famille && annee !== 'all' && (
        <p data-testid="idees-bareme" className="mb-3 text-[12px] text-[#506072] dark:text-gray-400 text-right">
          الموضوع الأول: {pointsOfSujet(annee, 1)}/20 نقطة · الموضوع الثاني: {pointsOfSujet(annee, 2)}/20 نقطة
          {sourceAnnee && (
            <>
              {' '}
              ·{' '}
              <a href={sourceAnnee.url} target="_blank" rel="noreferrer" className="underline">
                الموضوع الرسمي
              </a>
              {' · '}
              <a
                data-testid="lien-correction"
                href={sourceAnnee.correctionUrl}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                الإجابة النموذجية
              </a>
            </>
          )}
        </p>
      )}

      {redige.exercices > 0 && (
        <div className="mb-2 flex items-center justify-between gap-2">
          <p data-testid="idees-redige" className="text-[12px] font-bold text-[#006d37] dark:text-[#2ecc71] text-right">
            حرّرت {redige.reponses} جواباً على {redige.exercices} تمريناً.
          </p>
          <button
            data-testid="basculer-revue"
            onClick={() => setRevueVisible((v) => !v)}
            className="text-[11px] font-bold px-3 py-1 rounded-xl bg-[#f3f4f5] dark:bg-[#1f2622] text-[#006d37] dark:text-[#2ecc71] cursor-pointer"
          >
            {revueVisible ? 'إخفاء ما كتبته' : 'راجع ما كتبته'}
          </button>
        </div>
      )}

      {revueVisible && (
        <WritingReviewPanel key={revision} onOpen={(idea) => setEntrainement(idea)} />
      )}

      <p data-testid="idees-total" className="mb-2 text-[12px] font-bold text-[#506072] dark:text-gray-400 text-right">
        {liste.length} فكرة
      </p>

      <div className="space-y-3">
        {liste.map((idea) => (
          <Fiche key={idea.id} idea={idea} onTrain={setEntrainement} />
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
