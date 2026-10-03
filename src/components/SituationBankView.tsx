// SituationBankView.tsx — « تمارين بالوضعيات » (audit item 18, sprint 10).
//
// Porte d'entrée par SITUATION CONCRÈTE sur la banque documentaire existante :
// l'élève cherche « المضاد الحيوي » ou « مريض السكري », pas « tableau à double
// entrée ». Recherche instantanée + filtres unité/difficulté, puis fiche
// complète : la scène, la consigne, le document (observation), les indices,
// et la correction MASQUÉE tant que l'élève n'a pas cliqué.
//
// Aucune donnée n'est dupliquée ici : tout vient de situationIndex.ts et de
// documentPracticeContexts.ts.

import { useMemo, useState } from 'react';
import { ArrowRight, Eye, EyeOff, Hash, Layers, Lightbulb, Search, Target } from 'lucide-react';
import { bacEchoForSituation } from '../data/bacSessionIndex';
import DocumentFigure from './DocumentFigure';
import {
  SITUATION_COUNT,
  coveredUnitIds,
  analysisExercisesForSituation,
  practiceContextsForSituation,
  searchSituations,
  type SituationCard,
  type SituationDifficulty,
} from '../data/situationIndex';
// Index secondaire (BILAN §5) : regroupement par FORME de document (trou 3)
// et par nature quantitative (trou 1). Aucun contenu n'y est écrit.
import {
  exercicesQuantitatifs,
  pastillesForme,
  situationIdsParForme,
  situationIdsQuantitatives,
  type DocumentForme,
} from '../data/documentTypology';
import { INITIAL_UNITS } from '../data/index';

interface SituationBankViewProps {
  onBackToHome?: () => void;
}

const DIFFICULTE_LABEL: Record<SituationDifficulty, string> = {
  1: 'في المتناول',
  2: 'نمط البكالوريا',
  3: 'فخّ كلاسيكي',
};

const DIFFICULTE_CLASS: Record<SituationDifficulty, string> = {
  1: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  2: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  3: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
};

function titreUnite(unitId: number): string {
  const u = INITIAL_UNITS.find((unit) => unit.id === unitId);
  return u ? `الوحدة ${unitId}` : `الوحدة ${unitId}`;
}

function FicheSituation({ card, onClose }: { card: SituationCard; onClose: () => void }) {
  const [correctionVisible, setCorrectionVisible] = useState(false);
  const contextes = useMemo(() => practiceContextsForSituation(card.id), [card.id]);
  // Sprint 21 : les exercices « élite » n'étaient rendus nulle part.
  const exercicesElite = useMemo(() => analysisExercisesForSituation(card.id), [card.id]);

  return (
    <div
      data-testid="situation-fiche"
      className="bg-white dark:bg-[#141916] rounded-3xl p-5 border border-[#bbcbbb]/40 dark:border-[#2ecc71]/10 shadow-sm"
      dir="rtl"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="text-right">
          <h2 className="text-xl font-black text-[#1f1c0b] dark:text-gray-100">{card.titleAr}</h2>
          <p className="text-sm text-[#506072] dark:text-gray-400">{card.subtitleAr}</p>
        </div>
        <button
          data-testid="fermer-fiche"
          onClick={onClose}
          className="flex flex-row-reverse items-center gap-2 px-3 py-2 rounded-2xl bg-[#f3f4f5] dark:bg-[#1f2622] text-sm font-bold text-[#006d37] dark:text-[#2ecc71] cursor-pointer"
        >
          <span>كل الوضعيات</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {card.unitIds.map((u) => (
          <span
            key={u}
            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#e8f5ee] text-[#006d37] dark:bg-black/20 dark:text-[#2ecc71]"
          >
            {titreUnite(u)}
          </span>
        ))}
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${DIFFICULTE_CLASS[card.difficulty]}`}>
          {DIFFICULTE_LABEL[card.difficulty]}
        </span>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#f3f4f5] text-[#506072] dark:bg-black/20 dark:text-gray-400">
          {card.minutes} دقيقة
        </span>
        {bacEchoForSituation(card.id).years.length > 0 && (
          <span
            data-testid="fiche-echo-bac"
            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#fff7e0] text-[#8a6a00] dark:bg-black/20 dark:text-[#d9a400]"
          >
            سقطت في البكالوريا: {bacEchoForSituation(card.id).years.join(' · ')}
          </span>
        )}
      </div>

      <section className="mb-4">
        <h3 className="text-sm font-black text-[#006d37] dark:text-[#2ecc71] mb-1">الوضعية</h3>
        <p className="text-[15px] leading-8 text-[#1f1c0b] dark:text-gray-200">{card.situationAr}</p>
      </section>

      <section className="mb-4 bg-[#fff9ed] dark:bg-black/20 rounded-2xl p-4 border border-[#d9a400]/30">
        <h3 className="text-sm font-black text-[#8a6a00] dark:text-[#d9a400] mb-1">التعليمة</h3>
        <p data-testid="fiche-question" className="text-[15px] leading-8 font-bold text-[#1f1c0b] dark:text-gray-100">
          {card.questionAr}
        </p>
      </section>

      {contextes.length > 0 && (
        <section className="mb-4" data-testid="fiche-documents">
          <h3 className="text-sm font-black text-[#006d37] dark:text-[#2ecc71] mb-2">
            السندات ({contextes.length})
          </h3>
          <ul className="space-y-3">
            {contextes.map((c) => (
              <li
                key={`${c.exerciseId}-${c.questionId}`}
                className="rounded-2xl p-3 bg-[#f8fbfa] dark:bg-black/20 border border-[#bbcbbb]/30 dark:border-[#2ecc71]/10"
              >
                <p className="text-[13px] font-bold text-[#506072] dark:text-gray-300 mb-1">{c.altAr}</p>
                <p className="text-sm leading-7 text-[#1f1c0b] dark:text-gray-200">{c.observationAr}</p>
                {c.promptProduceAr && (
                  <p className="mt-2 text-sm font-bold text-[#006d37] dark:text-[#2ecc71]">{c.promptProduceAr}</p>
                )}
                {c.hintsAr && (
                  <p className="mt-2 flex items-start gap-1.5 text-[13px] text-[#8a6a00] dark:text-[#d9a400]">
                    <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      {c.hintsAr[0]} {c.hintsAr[1]}
                    </span>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {exercicesElite.length > 0 && (
        <section className="mb-4" data-testid="fiche-exercices-elite">
          <h3 className="text-sm font-black text-[#006d37] dark:text-[#2ecc71] mb-2">
            تمارين تحليل الوثائق ({exercicesElite.length})
          </h3>
          <ul className="space-y-3">
            {exercicesElite.map((e) => (
              <li
                key={e.id}
                data-testid={`exercice-elite-${e.id}`}
                className="rounded-2xl p-3 bg-white dark:bg-black/20 border border-[#006d37]/20"
              >
                <p className="text-[13px] font-bold text-[#506072] dark:text-gray-300 mb-2">
                  {e.doc.descriptionAr}
                </p>
                {/* Le document AVANT les questions : une consigne du type
                    « حلل شكل الهالتين » est inexploitable sans la figure. */}
                <DocumentFigure assetKey={e.doc.assetKey} />
                <ol className="list-decimal pr-4 space-y-2">
                  {e.questions.map((q) => (
                    <li key={q.id} className="text-sm leading-7 text-[#1f1c0b] dark:text-gray-200">
                      <span className="font-black text-[#006d37] dark:text-[#2ecc71]">{q.verb} — </span>
                      {q.promptAr}
                      <span className="block text-[12px] text-[#8a6a00] dark:text-[#d9a400]">
                        قالب الصياغة: {q.templateHint}
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="mt-2 text-[12px] text-[#506072] dark:text-gray-400">
                  شبكة التدريب: {e.grilleEntrainement.map((g) => `${g.critereAr} (${g.points})`).join(' · ')}
                </p>
                <p className="text-[11px] text-[#506072]/80 dark:text-gray-500">{e.label}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-4 rounded-2xl p-4 bg-[#f3f4f5] dark:bg-black/20">
        <h3 className="flex items-center gap-1.5 text-sm font-black text-[#1f1c0b] dark:text-gray-100 mb-1">
          <Target className="w-4 h-4" />
          <span>ما الذي يُقيَّم فعلاً</span>
        </h3>
        <p className="text-sm leading-7 text-[#1f1c0b] dark:text-gray-200">{card.notionAr}</p>
        <p data-testid="fiche-piege" className="mt-2 text-sm leading-7 text-rose-700 dark:text-rose-400">
          ⚠️ {card.piegeAr}
        </p>
      </section>

      <button
        data-testid="basculer-correction"
        onClick={() => setCorrectionVisible((v) => !v)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#006d37] hover:bg-[#00592d] text-white text-sm font-bold cursor-pointer transition-colors"
      >
        {correctionVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        <span>{correctionVisible ? 'إخفاء التصحيح' : 'أظهر عناصر التصحيح'}</span>
      </button>

      {correctionVisible && (
        <div
          data-testid="fiche-correction"
          className="mt-3 rounded-2xl p-4 bg-[#e8f5ee] dark:bg-emerald-500/10 border border-[#006d37]/20"
        >
          {exercicesElite.map((e) => (
            <p
              key={`corr-elite-${e.id}`}
              data-testid={`correction-elite-${e.id}`}
              className="mb-3 text-sm leading-7 text-[#1f1c0b] dark:text-gray-100"
            >
              {e.correctionAr}
            </p>
          ))}
          {contextes.map((c) => (
            <div key={`corr-${c.exerciseId}-${c.questionId}`} className="mb-3 last:mb-0">
              {c.correctionAr && (
                <p className="text-sm leading-7 text-[#1f1c0b] dark:text-gray-100">{c.correctionAr}</p>
              )}
              <p className="mt-1 text-[13px] text-[#506072] dark:text-gray-400">
                العناصر المنتظرة: {c.expectedEvidence.join(' · ')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SituationBankView({ onBackToHome }: SituationBankViewProps) {
  const [query, setQuery] = useState('');
  const [unitId, setUnitId] = useState<number | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<SituationDifficulty | undefined>(undefined);
  // Index BILAN §5 : forme de document (trou 3) et nature quantitative (trou 1).
  const [forme, setForme] = useState<DocumentForme | undefined>(undefined);
  const [chiffre, setChiffre] = useState(false);
  const [ouverte, setOuverte] = useState<SituationCard | null>(null);

  const resultats = useMemo(() => {
    const base = searchSituations(query, { unitId, difficulty });
    // Les deux axes sont des INTERSECTIONS avec la recherche : ils ajoutent une
    // porte d'entrée sans jamais créer de situation.
    const idsForme = forme ? situationIdsParForme(forme) : null;
    const idsChiffre = chiffre ? situationIdsQuantitatives() : null;
    return base.filter(
      (s) => (!idsForme || idsForme.has(s.id)) && (!idsChiffre || idsChiffre.has(s.id)),
    );
  }, [query, unitId, difficulty, forme, chiffre]);
  const unites = coveredUnitIds();
  const pastilles = pastillesForme();
  const nbChiffre = situationIdsQuantitatives().size;

  if (ouverte) {
    return (
      <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto" dir="rtl">
        <FicheSituation card={ouverte} onClose={() => setOuverte(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto" dir="rtl" data-testid="situation-bank">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="text-right">
          <h1 className="text-2xl md:text-3xl font-black text-[#1f1c0b] dark:text-gray-100">تمارين بالوضعيات</h1>
          <p className="text-sm text-[#506072] dark:text-gray-400">
            ابحث عن التمرين بالحالة الملموسة: المضاد الحيوي، مريض السكري، زرع الكلية… ({SITUATION_COUNT} وضعية)
          </p>
        </div>
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="flex flex-row-reverse items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f3f4f5] dark:bg-[#1f2622] border border-[#bbcbbb]/30 text-sm font-bold text-[#006d37] dark:text-[#2ecc71] cursor-pointer"
          >
            <span>العودة</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="relative mb-4">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#506072]" />
        <input
          data-testid="situation-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="اكتب اسم الحالة أو مفهوماً: السارين، التلقيح، pHi…"
          className="w-full pr-11 pl-4 py-3 rounded-2xl bg-white dark:bg-[#141916] border border-[#bbcbbb]/40 dark:border-[#2ecc71]/10 text-[15px] text-right text-[#1f1c0b] dark:text-gray-100 outline-none focus:border-[#006d37]"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <button
          data-testid="filtre-unite-tous"
          onClick={() => setUnitId(undefined)}
          className={`text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer ${
            unitId === undefined ? 'bg-[#006d37] text-white' : 'bg-[#f3f4f5] dark:bg-[#1f2622] text-[#506072] dark:text-gray-300'
          }`}
        >
          كل الوحدات
        </button>
        {unites.map((u) => (
          <button
            key={u}
            data-testid={`filtre-unite-${u}`}
            onClick={() => setUnitId(unitId === u ? undefined : u)}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer ${
              unitId === u ? 'bg-[#006d37] text-white' : 'bg-[#f3f4f5] dark:bg-[#1f2622] text-[#506072] dark:text-gray-300'
            }`}
          >
            {titreUnite(u)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {([1, 2, 3] as SituationDifficulty[]).map((d) => (
          <button
            key={d}
            data-testid={`filtre-difficulte-${d}`}
            onClick={() => setDifficulty(difficulty === d ? undefined : d)}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer ${
              difficulty === d ? 'bg-[#8a6a00] text-white' : `${DIFFICULTE_CLASS[d]}`
            }`}
          >
            {DIFFICULTE_LABEL[d]}
          </button>
        ))}
      </div>

      {/* INDEX BILAN §5 — TROU 3 : typologie des documents, et TROU 1 :
          exploitation chiffrée. Ce sont des FILTRES CROISÉS : ils n'ajoutent
          aucune situation, aucun exercice — ils ouvrent une porte d'entrée sur
          l'existant (l'élève qui veut « s'entraîner aux tableaux » n'en avait
          aucune). Les compteurs viennent de documentTypology.ts. */}
      <div className="flex items-center gap-1.5 mb-2 mt-5 text-[11px] font-black text-[#006d37] dark:text-[#2ecc71]">
        <Layers className="w-3.5 h-3.5" />
        <span data-testid="typologie-titre">حسب نوع الوثيقة</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        <button
          data-testid="filtre-forme-tous"
          onClick={() => setForme(undefined)}
          className={`text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer ${
            forme === undefined
              ? 'bg-[#006d37] text-white'
              : 'bg-[#f3f4f5] dark:bg-[#1f2622] text-[#506072] dark:text-gray-300'
          }`}
        >
          كل الأنواع
        </button>
        {pastilles.map((p) => (
          <button
            key={p.forme}
            data-testid={`filtre-forme-${p.forme}`}
            onClick={() => setForme(forme === p.forme ? undefined : p.forme)}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer ${
              forme === p.forme
                ? 'bg-[#006d37] text-white'
                : 'bg-[#f3f4f5] dark:bg-[#1f2622] text-[#506072] dark:text-gray-300'
            }`}
          >
            {p.labelAr} ({p.total})
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <button
          data-testid="filtre-chiffre"
          onClick={() => setChiffre((v) => !v)}
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer ${
            chiffre
              ? 'bg-[#8a6a00] text-white'
              : 'bg-[#f3f4f5] dark:bg-[#1f2622] text-[#506072] dark:text-gray-300'
          }`}
        >
          <Hash className="w-3.5 h-3.5" />
          <span data-testid="chiffre-libelle">معطيات عددية ({nbChiffre})</span>
        </button>
        {exercicesQuantitatifs().length > 0 && (
          <span className="flex items-center text-[11px] font-bold text-[#506072]/80 dark:text-gray-500">
            {exercicesQuantitatifs().length} تمارين تُقرأ بالأرقام
          </span>
        )}
      </div>

      <p data-testid="situation-count" className="text-sm font-bold text-[#506072] dark:text-gray-400 mb-3">
        {resultats.length} وضعية
      </p>

      {resultats.length === 0 ? (
        <p data-testid="situation-vide" className="text-sm text-[#506072] dark:text-gray-400">
          لا توجد وضعية بهذا البحث. جرّب كلمة أبسط مثل: الإنزيم، المناعة، الزلزال.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resultats.map((s) => (
            <button
              key={s.id}
              data-testid={`situation-${s.id}`}
              onClick={() => setOuverte(s)}
              className="text-right bg-white dark:bg-[#141916] rounded-3xl p-4 border border-[#bbcbbb]/30 dark:border-[#2ecc71]/10 shadow-sm hover:shadow-md hover:border-[#006d37]/40 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-base font-black text-[#1f1c0b] dark:text-gray-100">{s.titleAr}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${DIFFICULTE_CLASS[s.difficulty]}`}>
                  {DIFFICULTE_LABEL[s.difficulty]}
                </span>
              </div>
              <p className="text-[13px] text-[#506072] dark:text-gray-400 mb-2">{s.subtitleAr}</p>
              <div className="flex flex-wrap gap-1.5">
                {s.unitIds.map((u) => (
                  <span
                    key={u}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#e8f5ee] text-[#006d37] dark:bg-black/20 dark:text-[#2ecc71]"
                  >
                    {titreUnite(u)}
                  </span>
                ))}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#f3f4f5] text-[#506072] dark:bg-black/20 dark:text-gray-400">
                  {s.minutes} د
                </span>
                {bacEchoForSituation(s.id).years.length > 0 && (
                  <span
                    data-testid={`echo-bac-${s.id}`}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#fff7e0] text-[#8a6a00] dark:bg-black/20 dark:text-[#d9a400]"
                  >
                    بكالوريا {bacEchoForSituation(s.id).years.slice(0, 3).join('، ')}
                    {bacEchoForSituation(s.id).years.length > 3
                      ? ` +${bacEchoForSituation(s.id).years.length - 3}`
                      : ''}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
