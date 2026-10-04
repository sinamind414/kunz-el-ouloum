// LessonsView.tsx
// Onglet الدروس restructuré en deux modes :
//   1) درس نشيط (Leçon Active)  : leçons TS interactives « mot par mot » (ACTIVE_LESSONS).
//   2) درس سلبي  (Leçon Passive) : les leçons HTML officielles (public/lessons),
//      organisées en 3 domaines du BAC → unités → chapitres (ordre canonique
//      OFFICIAL_PROGRAM_SEQUENCE). Chaque fichier de phase portant 2 leçons,
//      la séquence expose la clé de base puis la clé `_2` — une leçon affichée
//      à la fois (isolation par sliceLessonHtml).
import { lazy, Suspense, useEffect, useState } from 'react';
import { BookOpen, ChevronLeft, Zap, MonitorPlay, Network, FlaskConical, Leaf, Globe2, GraduationCap, BookMarked, Grid3x3, Search, Compass } from 'lucide-react';
import HtmlLessonViewer from './HtmlLessonViewer';
import ActiveLessonView from './ActiveLessonView';
import { INITIAL_UNITS } from '../unitCatalog';
import { getUnitLessonSequence } from '../data/unitLessonSequences';
import { HTML_LESSON_ORDER } from '../data/htmlLessonProgression';
import { sourceLivre, badgeSource, sourceAmbigue } from '../data/bookIndex';
import { loadParcours, currentItem, parcoursProgress } from '../lib/parcours/parcoursProgress';
import { LESSON_GOLD_SUMMARIES } from '../data/lessonGoldSummaries';
import Icone from './Icone';

// Sprint 32 : ces quatre vues (QCM du livre, sujets BAC, bibliothèque Okacha,
// recherche) embarquaient à elles seules plusieurs centaines de kilo-octets de
// données dans le chunk des leçons. Elles ne s'ouvrent que sur action de
// l'élève : leur code est donc récupéré à ce moment-là.
const QcmLivreView = lazy(() => import('./QcmLivreView'));
const BacExamView = lazy(() => import('./BacExamView'));
const OkachaView = lazy(() => import('./OkachaView'));
const SearchView = lazy(() => import('./SearchView'));

function VueEnChargement() {
  return (
    <div className="flex items-center justify-center py-16" dir="rtl" data-testid="lessons-chargement">
      <span className="text-sm font-bold text-[#506072] dark:text-gray-400">جارٍ التحميل…</span>
    </div>
  );
}
import { chapitreIcone, uniteIcone } from '../data/lessonIcons';
import {
  PASSIVE_DOMAINS,
  hasHtmlFile,
  getActiveLessonKeysForUnit,
  getActiveLessonTitle,
  getPassiveLessonTitle,
  getPassiveLessonPosition,
  getUnitTitle,
  type LessonMode,
} from '../data/lessonModes';

const DOMAIN_ICONS = [FlaskConical, Leaf, Globe2];


/** Props : le callback d'auto-évaluation des flashcards (handleRateCard, App.tsx)
 *  est transmis au الحصيلة المعرفية pour créditer XP + flashcardStats (SM-2). */
interface LessonsProps {
  onRateCard?: (cardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => void;
  /** Deep-link depuis المسار : ouvrir une leçon précise au montage. */
  initialLesson?: { key: string; kind: 'html' | 'active'; unitId: number };
  /** Deep-link depuis المسار : ouvrir le QCM d'une unité précise au montage. */
  initialQcm?: number;
  /** Appelé après consommation du deep-link (pour vider l'état du parent). */
  onDeepLinkConsumed?: () => void;
}


/**
 * Badge « source livre officiel » : chapitres + plage de lignes OCR
 * (data/bookContent.index.json). Absent si aucun appariement prouvé —
 * ⚠️ si un chapitre reconstruit (en-tête OCR détruit) est couvert.
 */
function SourceBadge({ cle, titre }: { cle: string; titre: string }) {
  const s = sourceLivre(cle, titre);
  if (!s) return null;
  return (
    <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-0.5">
      📖 {badgeSource(s)}
      {sourceAmbigue(s) ? ' ⚠️' : ''}
    </span>
  );
}

const nextActiveInUnit = (unitId: number, currentKey: string): string | undefined => {
  const keys = getActiveLessonKeysForUnit(unitId);
  const idx = keys.indexOf(currentKey);
  return idx >= 0 && idx < keys.length - 1 ? keys[idx + 1] : undefined;
};

const nextPassiveInUnit = (unitId: number, currentKey: string): string | undefined => {
  const keys = getUnitLessonSequence(unitId).filter(hasHtmlFile);
  const idx = keys.indexOf(currentKey);
  return idx >= 0 && idx < keys.length - 1 ? keys[idx + 1] : undefined;
};

const firstActiveLessonOfNextUnit = (unitId: number): { unitId: number; key: string } | undefined => {
  const next = INITIAL_UNITS.find((u) => u.id > unitId);
  if (!next) return undefined;
  const first = getActiveLessonKeysForUnit(next.id)[0];
  return first ? { unitId: next.id, key: first } : firstActiveLessonOfNextUnit(next.id);
};

const unitOfActiveLesson = (key: string): number =>
  INITIAL_UNITS.find((u) => getActiveLessonKeysForUnit(u.id).includes(key))?.id ?? 1;

export default function LessonsView({ onRateCard, initialLesson, initialQcm, onDeepLinkConsumed }: LessonsProps) {
  const [mode, setMode] = useState<LessonMode | 'qcm' | 'bac' | 'okacha' | 'search' | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<number>(1);
  const [selectedDomain, setSelectedDomain] = useState<number | null>(null);
  const [selectedActiveLesson, setSelectedActiveLesson] = useState<string | null>(null);
  const [selectedPassiveLesson, setSelectedPassiveLesson] = useState<string | null>(null);
  /** Unité passive ouverte (navigation par icônes : domaine → unité → chapitres). */
  const [selectedPassiveUnitId, setSelectedPassiveUnitId] = useState<number | null>(null);
  /** Unité active ouverte (navigation par icônes : unité → leçons). */
  const [selectedActiveUnitId, setSelectedActiveUnitId] = useState<number | null>(null);

  // Capture à UNE reprise des deep-links (مسار) : le parent vide son état juste
  // après (onDeepLinkConsumed), mais la vue conserve l'unité demandée pour tout
  // le séjour — sinon le filtre جسر disparaîtrait au re-render.
  const [qcmUniteInitiale] = useState<number | undefined>(initialQcm);

  // Deep-link (مسار) : ouverture à UNE reprise au montage, puis on vide l'état
  // du parent pour qu'un retour sur l'onglet ne rejoue pas le deep-link.
  useEffect(() => {
    if (initialLesson) {
      setSelectedUnit(initialLesson.unitId);
      if (initialLesson.kind === 'active') {
        setSelectedActiveUnitId(initialLesson.unitId);
        setSelectedActiveLesson(initialLesson.key);
      } else {
        setSelectedPassiveUnitId(initialLesson.unitId);
        setSelectedPassiveLesson(initialLesson.key);
      }
      setMode(null);
    } else if (initialQcm !== undefined) {
      setMode('qcm');
    }
    onDeepLinkConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /**
   * Domaine dont on consulte la الحصيلة المعرفية (déplacée depuis l'écran 1) :
   * chaque domaine des leçons passives ouvre SA propre حصيلة.
   * 'm' = الدليل العام للمنهجية, entré depuis l'écran des domaines.
   */
  const [okachaDomaine, setOkachaDomaine] = useState<1 | 2 | 3 | 'm'>(1);

  // R5 : ouverture d'une leçon depuis la recherche globale (deep-link).
  const openLessonFromSearch = (lessonKey: string, kind: 'html' | 'active', unitId: number) => {
    setSelectedUnit(unitId);
    if (kind === 'active') {
      setSelectedActiveUnitId(unitId);
      setSelectedActiveLesson(lessonKey);
    } else {
      setSelectedPassiveUnitId(unitId);
      setSelectedPassiveLesson(lessonKey);
    }
    setMode(null);
  };

  // ----- Rendu d'une leçon ouverte -----
  if (selectedActiveLesson) {
    const inUnitNext = nextActiveInUnit(selectedUnit, selectedActiveLesson);
    const crossUnitNext = firstActiveLessonOfNextUnit(selectedUnit);
    const nextKey = inUnitNext ?? crossUnitNext?.key;
    const nextUnit = inUnitNext ? selectedUnit : crossUnitNext?.unitId;
    return (
      <ActiveLessonView
        lessonKey={selectedActiveLesson}
        onBack={() => {
          const uid = unitOfActiveLesson(selectedActiveLesson);
          setSelectedActiveLesson(null);
          setSelectedUnit(uid);
          // Retour sur les icônes de la MÊME unité (pas la liste des unités).
          setSelectedActiveUnitId(uid);
        }}
        onNext={nextKey && nextUnit ? () => { setSelectedUnit(nextUnit); setSelectedActiveLesson(nextKey); } : undefined}
        nextTitleAr={nextKey ? getActiveLessonTitle(nextKey) : undefined}
      />
    );
  }

  if (selectedPassiveLesson) {
    const nextKey = nextPassiveInUnit(selectedUnit, selectedPassiveLesson);
    return (
      <HtmlLessonViewer
        lessonKey={selectedPassiveLesson}
        onBack={() => setSelectedPassiveLesson(null)}
        onNext={nextKey ? () => setSelectedPassiveLesson(nextKey) : undefined}
        nextTitleAr={nextKey ? getPassiveLessonTitle(nextKey, selectedUnit) : undefined}
      />
    );
  }

  // ----- Écran 0 : QCM du livre officiel (par chapitre) -----
  if (mode === 'qcm') {
    return (
      <Suspense fallback={<VueEnChargement />}>
        <QcmLivreView onBack={() => setMode(null)} uniteInitiale={qcmUniteInitiale} />
      </Suspense>
    );
  }

  // ----- Écran 0 quater : RECHERCHE GLOBALE (R5, moteur Morchid) -----
  if (mode === 'search') {
    return (
      <Suspense fallback={<VueEnChargement />}>
        <SearchView onBack={() => setMode(null)} onOpenLesson={openLessonFromSearch} />
      </Suspense>
    );
  }

  // ----- Écran 0 bis : tests bac (PROGRAMME NATIONAL, injection vérifiée) -----
  if (mode === 'bac') {
    return (
      <Suspense fallback={<VueEnChargement />}>
        <BacExamView onBack={() => setMode(null)} />
      </Suspense>
    );
  }

  // ----- Écran 0 ter : الحصيلة المعرفية (عكاشة, injection mécanique filtrée) -----
  // Entrée unique : la carte en fin d'écran d'un domaine (leçons passives) —
  // elle passe le domaine courant pour ouvrir la حصيلة DE CE domaine-là.
  if (mode === 'okacha') {
    return (
      <Suspense fallback={<VueEnChargement />}>
        <OkachaView
          onBack={() => setMode('passive')}
          onRate={onRateCard}
          onOpenQcm={() => setMode('qcm')}
          domaineInitial={okachaDomaine}
        />
      </Suspense>
    );
  }

  // ----- Écran 1 : les deux icônes (Leçon Active / Leçon Passive) -----
  if (mode === null) {
    return (
      <div dir="rtl" className="space-y-5">
        <div className="bg-gradient-to-l from-[#006d37] via-[#008744] to-[#10b981] text-white p-5 md:p-6 rounded-3xl shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full inline-block mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>دروس السنة الثالثة ثانوي — علوم الطبيعة والحياة</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">📚 قائمة الدروس</h1>
          <p className="text-white/90 text-sm mt-1 font-medium">
            اختر نوع الدرس : نشيط (تفاعلي خطوة بخطوة) أو سلبي (الدروس المقروءة)
          </p>
        </div>

        {/* R5 : recherche globale dans tous les cours (moteur Morchid) */}
        <button
          onClick={() => setMode('search')}
          className="group w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-l from-emerald-50 to-white dark:from-emerald-950/30 dark:to-[#161c18] hover:border-emerald-500 hover:shadow-lg transition-all text-right"
        >
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#006d37] text-white shadow-md group-hover:scale-105 transition-transform shrink-0">
            <Search className="w-6 h-6" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-base font-black text-gray-800 dark:text-gray-100">
              🔎 بحث في كل الدروس
            </span>
            <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
              ابحث عن موضوع أو كلمة في ٤٥٠ مقطعاً — وافتح الدرس مباشرةً (يعمل دون اتصال)
            </span>
          </span>
          <ChevronLeft className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Leçon Active */}
          <button
            onClick={() => { setMode('active'); setSelectedDomain(null); setSelectedActiveUnitId(null); }}
            className="group p-6 rounded-3xl border-2 border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/30 dark:to-[#161c18] hover:border-emerald-500 hover:shadow-lg transition-all text-center space-y-3"
          >
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#006d37] text-white shadow-md group-hover:scale-105 transition-transform">
              <Zap className="w-8 h-8" />
            </span>
            <span className="block text-lg font-black text-gray-800 dark:text-gray-100">الدرس النشيط</span>
            <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
              تعلّم تفاعلي « كلمة بكلمة » : مهمة، وثائق، محاكاة ومنهجية — مع تصحيح فوري لكل إنتاج
            </span>
          </button>

          {/* Leçon Passive */}
          <button
            onClick={() => { setMode('passive'); setSelectedDomain(null); setSelectedPassiveUnitId(null); }}
            className="group p-6 rounded-3xl border-2 border-teal-200 dark:border-teal-900/50 bg-gradient-to-b from-teal-50 to-white dark:from-teal-950/30 dark:to-[#161c18] hover:border-teal-500 hover:shadow-lg transition-all text-center space-y-3"
          >
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0e6b6b] text-white shadow-md group-hover:scale-105 transition-transform">
              <MonitorPlay className="w-8 h-8" />
            </span>
            {/* Libellé public : « leçon officielle » (décision 2026-10-03).
                Le sous-titre ci-dessous annonce déjà les « leçons officielles » ;
                seul le titre affirmait « leçon passive » (درس سلبي),
                compris « négatif » par l'utilisateur. */}
            <span className="block text-lg font-black text-gray-800 dark:text-gray-100">الدرس الرسمي</span>
            <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
              الدروس المقروءة الرسمية ({HTML_LESSON_ORDER.length} درساً) — ثلاثة مجالات، كل مجال بوحداته وفصوله
            </span>
          </button>
          {/* QCM du livre */}
          <button
            onClick={() => setMode('qcm')}
            className="group p-6 rounded-3xl border-2 border-amber-200 dark:border-amber-900/50 bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/30 dark:to-[#161c18] hover:border-amber-500 hover:shadow-lg transition-all text-center space-y-3"
          >
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#b45309] text-white shadow-md group-hover:scale-105 transition-transform">
              <BookOpen className="w-8 h-8" />
            </span>
            <span className="block text-lg font-black text-gray-800 dark:text-gray-100">اختبار الفصول</span>
            <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
              أسئلة حسب الفصول — مع مخططات وتفسيرات فورية
            </span>
          </button>
          {/* Tests bac */}
          <button
            onClick={() => setMode('bac')}
            className="group p-6 rounded-3xl border-2 border-violet-200 dark:border-violet-900/50 bg-gradient-to-b from-violet-50 to-white dark:from-violet-950/30 dark:to-[#161c18] hover:border-violet-500 hover:shadow-lg transition-all text-center space-y-3"
          >
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#6d28d9] text-white shadow-md group-hover:scale-105 transition-transform">
              <GraduationCap className="w-8 h-8" />
            </span>
            <span className="block text-lg font-black text-gray-800 dark:text-gray-100">اختبار بكالوريا</span>
            <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
              3 اختبارات كاملة (20 نقطة) — تصحيح ذاتي بسلّم التنقيط
            </span>
          </button>
          {/* الحصيلة معرفية عكاشة : DÉPLACÉE dans les leçons passives —
              chaque domaine a désormais sa propre entrée, en fin de son écran
              d'unités (cf. data-testid="okacha-entree-domaine"). */}
        </div>
      </div>
    );
  }

  // ----- Écran 2a : Leçon Active — ICÔNES DES UNITÉS actives -----
  // Même principe que les leçons passives : une icône = une unité, un clic ouvre
  // les icônes de ses leçons actives (U6 ×3, U7, U9, U11 — 4 unités / 6 leçons).
  if (mode === 'active') {
    const activeUnits = INITIAL_UNITS.filter((u) => getActiveLessonKeysForUnit(u.id).length > 0);

    if (selectedActiveUnitId === null) {
      return (
        <div dir="rtl" className="space-y-5">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => { setMode(null); setSelectedActiveUnitId(null); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              <span>→</span>
              <span>عودة</span>
            </button>
            <h2 className="text-xl font-black flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#006d37]" />
              الدرس النشيط — اختر الوحدة (أيقونة)
            </h2>
          </div>

          {activeUnits.length === 0 && (
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 text-center py-6">
              لا توجد دروس نشيطة بعد.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="unites-actives-icones">
            {activeUnits.map((u) => {
              const keys = getActiveLessonKeysForUnit(u.id);
              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedActiveUnitId(u.id)}
                  data-testid={`unite-active-${u.id}`}
                  className="group p-5 rounded-3xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c18] hover:border-emerald-500 hover:shadow-lg transition-all text-right flex items-start gap-4"
                >
                  <span className="shrink-0 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#006d37] to-[#10b981] text-white shadow-md group-hover:scale-105 transition-transform">
                    <Icone cle={uniteIcone(u.id)} className="w-7 h-7" />
                  </span>
                  <span className="flex-1 min-w-0 space-y-1">
                    <span className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center h-6 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#006d37] dark:text-emerald-300 text-[11px] font-black shrink-0">
                        وحدة {u.id}
                      </span>
                      <span className="text-sm font-black text-gray-800 dark:text-gray-100">{u.title}</span>
                    </span>
                    <span className="block text-[11px] font-bold text-gray-500 dark:text-gray-400">{u.description}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                      <Grid3x3 className="w-3 h-3" />
                      {keys.length} دروس
                    </span>
                  </span>
                  <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-all shrink-0 mt-4" />
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    const uniteActive = INITIAL_UNITS.find((u) => u.id === selectedActiveUnitId);
    const clesActives = getActiveLessonKeysForUnit(selectedActiveUnitId);
    return (
      <div dir="rtl" className="space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setSelectedActiveUnitId(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <span>→</span>
            <span>عودة إلى وحدات الدروس النشيطة</span>
          </button>
          <h2 className="text-xl font-black flex items-center gap-2">
            <Icone cle={uniteIcone(selectedActiveUnitId)} className="w-5 h-5 text-[#006d37]" />
            {uniteActive?.title}
          </h2>
        </div>

        {/* Bande d'unités actives : passer d'une unité à l'autre icône après icône. */}
        <div className="flex items-center gap-2 flex-wrap" data-testid="bande-unites-actives">
          {activeUnits.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelectedActiveUnitId(u.id)}
              title={getUnitTitle(u.id)}
              data-testid={`bande-unite-active-${u.id}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black transition-colors ${
                u.id === selectedActiveUnitId
                  ? 'bg-[#006d37] text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-emerald-100'
              }`}
            >
              <Icone cle={uniteIcone(u.id)} className="w-3.5 h-3.5" />
              وحدة {u.id}
            </button>
          ))}
        </div>

        <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{uniteActive?.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3" data-testid="lecons-actives-icones">
          {clesActives.map((key, i) => {
            const titre = getActiveLessonTitle(key);
            return (
              <button
                key={key}
                onClick={() => { setSelectedUnit(selectedActiveUnitId); setSelectedActiveLesson(key); }}
                data-testid={`lecon-active-${key}`}
                className="group p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c18] hover:border-emerald-500 hover:shadow-md transition-all text-right"
              >
                <span className="flex items-start gap-3">
                  <span className="relative shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-[#006d37] dark:text-emerald-300 group-hover:bg-[#006d37] group-hover:text-white transition-colors">
                    <Icone cle={chapitreIcone(titre, selectedActiveUnitId)} className="w-5 h-5" />
                    <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#006d37] text-white text-[9px] font-black">
                      {i + 1}
                    </span>
                  </span>
                  <span className="flex-1 text-sm font-bold text-gray-800 dark:text-gray-100 leading-snug">
                    {titre}
                    <SourceBadge cle={key} titre={titre} />
                  </span>
                  <ChevronLeft className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-all shrink-0 mt-1" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ----- Écran 2b : Leçon Passive — trois icônes de domaines -----
  if (mode === 'passive' && selectedDomain === null) {
    // Le principe « séquence ordonnée » survit à la suppression de la rubrique
    // « مسار تعلمك » du menu : compteur et leçon suggérée sont affichés ici,
    // le moteur reste inchangé dans src/lib/parcours/ (verrou, quota, J+14).
    const etatParcours = loadParcours();
    const leconSuggeree = currentItem(etatParcours);
    const avancement = parcoursProgress(etatParcours);
    const pourcentage = avancement.total > 0
      ? Math.round((avancement.done / avancement.total) * 100)
      : 0;
    const cleLecon = leconSuggeree?.lessonKey ?? null;
    const kindLecon = leconSuggeree?.lessonKind ?? 'html';
    const uniteLecon = leconSuggeree?.unitId ?? 0;
    // Résumé d'or de la leçon suggérée. Couverture complète (59/59 leçons du
    // parcours) : le bloc s'affiche pour chaque leçon suggérée. Donnée
    // validée par les lock tests de lessonGoldSummaries.
    const resumeOr = cleLecon ? LESSON_GOLD_SUMMARIES[cleLecon] : undefined;
    return (
      <div dir="rtl" className="space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <span>→</span>
            <span>عودة</span>
          </button>
          <h2 className="text-xl font-black flex items-center gap-2">
            <MonitorPlay className="w-5 h-5 text-[#0e6b6b]" />
            الدرس الرسمي — اختر المجال
          </h2>
        </div>

        {/* Bandeau « séquence ordonnée » — la rubrique « مسار تعلمك » a quitté le
            menu (2026-10-03) ; son principe vit ici : leçon suggérée + compteur. */}
        <div
          data-testid="bandeau-sequence"
          className="flex flex-wrap items-center gap-4 rounded-3xl border-2 border-teal-200 dark:border-teal-900/50 bg-gradient-to-l from-teal-50 to-white dark:from-teal-950/30 dark:to-[#161c18] p-5"
        >
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0e6b6b] text-white shadow-md">
            <span aria-hidden="true" className="text-xl">🧭</span>
          </span>
          <span className="min-w-0 flex-1 space-y-1.5">
            <span className="block text-[11px] font-black text-[#944a00] dark:text-amber-300">
              الدرس المقترح التالي
            </span>
            <span className="block truncate text-base font-black text-gray-800 dark:text-gray-100">
              {leconSuggeree?.title ?? 'أنجزت كل الدروس — واصل المراجعة'}
            </span>
            <span className="block h-2 w-full max-w-[14rem] rounded-full bg-gray-200 dark:bg-gray-700">
              <span
                className="block h-2 rounded-full bg-[#0e6b6b]"
                style={{ width: `${pourcentage}%` }}
              />
            </span>
          </span>
          <span className="shrink-0 text-sm font-black tabular-nums text-gray-700 dark:text-gray-200">
            {avancement.done} / {avancement.total}
          </span>
          {cleLecon && (
            <button
              type="button"
              data-testid="bandeau-sequence-ouvrir"
              onClick={() => openLessonFromSearch(cleLecon, kindLecon, uniteLecon)}
              className="shrink-0 rounded-xl bg-[#0e6b6b] px-4 py-2 text-sm font-black text-white shadow-md transition-all hover:bg-[#0b5757]"
            >
              افتح الدرس
            </button>
          )}
        </div>

        {/* Résumé d'or — la substantifique de la leçon avant même de l'ouvrir.
            Donnée réelle validée par les lock tests de lessonGoldSummaries.
            Couverture complète (59/59 leçons) : rien n'est synthétisé. */}
        {resumeOr && (
          <div
            data-testid="resume-or"
            className="space-y-4 rounded-3xl border-2 border-amber-200 dark:border-amber-900/50 bg-gradient-to-l from-amber-50 to-white dark:from-amber-950/30 dark:to-[#161c18] p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-black text-amber-700 dark:text-amber-300">
                <span aria-hidden="true">🧬</span>
                الملخص الذهبي للدرس
              </h3>
              <span className="rounded-full bg-amber-100 dark:bg-amber-900/40 px-3 py-1 text-[11px] font-black text-amber-700 dark:text-amber-300">
                {resumeOr.review?.reviewed ? 'مراجعة أستاذ' : 'شرح Kunz'}
              </span>
            </div>

            {/* Lecture active (système d'activation) : la question de révision est
                lue AVANT le contenu — elle oriente l'attention vers l'objectif.
                Elle se retrouve à la fin comme invite de rappel (sans regarder). */}
            <div className="space-y-1.5 rounded-2xl border-2 border-teal-300 bg-teal-50 p-3 dark:border-teal-800 dark:bg-teal-950/30">
              <span className="block text-[11px] font-black text-teal-700 dark:text-teal-300">
                🧠 سؤال المراجعة — هدفك قبل القراءة
              </span>
              <p className="text-sm font-bold leading-relaxed text-gray-800 dark:text-gray-100">
                {resumeOr.recallQuestionAr}
              </p>
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                اقرأ الملخص بإمعان ثم أجب عن هذا السؤال دون النظر إليه.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="block text-[11px] font-black text-[#944a00] dark:text-amber-300">
                المهمة
              </span>
              <p className="text-sm font-bold leading-relaxed text-gray-800 dark:text-gray-100">
                {resumeOr.missionAr}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="block text-[11px] font-black text-[#944a00] dark:text-amber-300">
                سلسلة الأسباب والنتائج
              </span>
              <ol className="list-decimal space-y-1 pr-5 text-sm leading-relaxed text-gray-700 dark:text-gray-200">
                {resumeOr.mechanismAr.map((etape, i) => (
                  <li key={i}>{etape}</li>
                ))}
              </ol>
            </div>

            <div className="space-y-1.5">
              <span className="block text-[11px] font-black text-[#944a00] dark:text-amber-300">
                مفردات مفتاحية
              </span>
              <div className="flex flex-wrap gap-1.5">
                {resumeOr.vocabulary.map((terme, i) => (
                  <span
                    key={i}
                    className="rounded-lg border border-amber-200 bg-white px-2.5 py-1 text-xs font-bold text-gray-700 dark:border-amber-900/40 dark:bg-gray-800 dark:text-gray-200"
                  >
                    {terme}
                  </span>
                ))}
              </div>
            </div>

            {resumeOr.bacSentenceFrameAr && (
              <div className="space-y-1.5">
                <span className="block text-[11px] font-black text-[#944a00] dark:text-amber-300">
                  هيكل الجواب — بكالوريا
                </span>
                <p className="rounded-xl bg-white/70 dark:bg-gray-800/70 p-3 text-sm leading-relaxed text-gray-700 dark:text-gray-200">
                  {resumeOr.bacSentenceFrameAr}
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <span className="block text-[11px] font-black text-red-600 dark:text-red-400">
                ⚠️ خطأ شائع
              </span>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">
                {resumeOr.commonErrorAr}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="block text-[11px] font-black text-[#944a00] dark:text-amber-300">
                سؤال المراجعة — أجب الآن دون النظر إلى الملخص
              </span>
              <p className="text-sm font-bold leading-relaxed text-gray-800 dark:text-gray-100">
                {resumeOr.recallQuestionAr}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PASSIVE_DOMAINS.map((d, i) => {
            const Icon = DOMAIN_ICONS[i] ?? Network;
            const chapters = d.unitIds.reduce(
              (acc, uid) => acc + getUnitLessonSequence(uid).filter(hasHtmlFile).length,
              0
            );
            return (
              <button
                key={d.id}
                onClick={() => { setSelectedDomain(d.id); setSelectedPassiveUnitId(null); }}
                data-testid={`domaine-${d.id}`}
                className="group p-6 rounded-3xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c18] hover:border-teal-500 hover:shadow-lg transition-all text-center space-y-3"
              >
                <span className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0e6b6b] text-white shadow-md group-hover:scale-105 transition-transform">
                  <Icon className="w-8 h-8" />
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white text-[#0e6b6b] text-[10px] font-black px-2 py-0.5 shadow ring-1 ring-[#0e6b6b]/20">
                    المجال {i + 1}
                  </span>
                </span>
                <span className="block text-lg font-black text-gray-800 dark:text-gray-100">
                  {d.emoji} {d.titleAr}
                </span>
                <span className="block text-xs font-bold text-gray-500 dark:text-gray-400">
                  {d.unitIds.length} وحدات · {chapters} فصلاً
                </span>
                {/* Aperçu : les icônes des unités du domaine (entrée « icône après icône »). */}
                <span className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
                  {d.unitIds.map((uid) => (
                    <span
                      key={uid}
                      title={getUnitTitle(uid)}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-[#0e6b6b] dark:text-teal-300 group-hover:bg-teal-100 transition-colors"
                    >
                      <Icone cle={uniteIcone(uid)} className="w-3.5 h-3.5" />
                    </span>
                  ))}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── الدليل العام للمنهجية : sorti de la الحصيلة, il vit désormais sur
            l'écran des domaines (il n'appartient à AUCUN domaine). ── */}
        <button
          onClick={() => { setOkachaDomaine('m'); setMode('okacha'); }}
          data-testid="guide-entree"
          className="group w-full flex items-center gap-4 p-5 rounded-3xl border-2 border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-l from-emerald-50 to-white dark:from-emerald-950/30 dark:to-[#161c18] hover:border-emerald-500 hover:shadow-lg transition-all text-right"
        >
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#006d37] text-white shadow-md group-hover:scale-105 transition-transform shrink-0">
            <Compass className="w-7 h-7" />
          </span>
          <span className="flex-1 min-w-0 space-y-1">
            <span className="block text-base font-black text-gray-800 dark:text-gray-100">
              🧭 الدليل العام للمنهجية
            </span>
            <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
              منهجية الامتحان وتحليل الوثائق والمراجعة — خارج المجالات الثلاثة، لأنها تشمل مادة علوم الطبيعة والحياة كلّها
            </span>
          </span>
          <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-all shrink-0" />
        </button>
      </div>
    );
  }

  // ----- Écran 3 : Leçon Passive — ICÔNES DES UNITÉS du domaine -----
  // Une icône = une unité (D1 : 5 icônes, D2 : 3, D3 : 3) ; un clic ouvre les
  // icônes des chapitres. Vaut pour TOUTES les unités des leçons passives.
  const domain = PASSIVE_DOMAINS.find((d) => d.id === selectedDomain);

  if (selectedPassiveUnitId === null) {
    return (
      <div dir="rtl" className="space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => { setSelectedDomain(null); setSelectedPassiveUnitId(null); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <span>→</span>
            <span>عودة إلى المجالات</span>
          </button>
          <h2 className="text-xl font-black">
            {domain?.emoji} {domain?.titleAr}
          </h2>
          <span className="text-[11px] font-black text-gray-400 dark:text-gray-500">
            اختر الوحدة (أيقونة) ثم نشاطها
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="unites-icones">
          {domain?.unitIds.map((uid) => {
            const unit = INITIAL_UNITS.find((u) => u.id === uid);
            const chapters = getUnitLessonSequence(uid).filter(hasHtmlFile);
            return (
              <button
                key={uid}
                onClick={() => setSelectedPassiveUnitId(uid)}
                data-testid={`unite-${uid}`}
                className="group p-5 rounded-3xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c18] hover:border-teal-500 hover:shadow-lg transition-all text-right flex items-start gap-4"
              >
                <span className="shrink-0 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0e6b6b] to-[#10b981] text-white shadow-md group-hover:scale-105 transition-transform">
                  <Icone cle={uniteIcone(uid)} className="w-7 h-7" />
                </span>
                <span className="flex-1 min-w-0 space-y-1">
                  <span className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center h-6 px-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-[#0e6b6b] dark:text-teal-300 text-[11px] font-black shrink-0">
                      وحدة {uid}
                    </span>
                    <span className="text-sm font-black text-gray-800 dark:text-gray-100">{unit?.title}</span>
                  </span>
                  <span className="block text-[11px] font-bold text-gray-500 dark:text-gray-400">{unit?.description}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                    <Grid3x3 className="w-3 h-3" />
                    {chapters.length} فصول
                  </span>
                </span>
                <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-teal-500 transition-all shrink-0 mt-4" />
              </button>
            );
          })}
        </div>

        {/* ── الحصيلة المعرفية DE CE domaine — déplacée de l'écran principal :
              chaque domaine des leçons passives a sa propre entrée, posée en
              fin de l'écran de ses unités. Elle ouvre la حصيلة sur ce domaine. */}
        <button
          onClick={() => { setOkachaDomaine((domain?.id ?? 1) as 1 | 2 | 3); setMode('okacha'); }}
          data-testid="okacha-entree-domaine"
          className="group w-full flex items-center gap-4 p-5 rounded-3xl border-2 border-blue-200 dark:border-blue-900/50 bg-gradient-to-l from-blue-50 to-white dark:from-blue-950/30 dark:to-[#161c18] hover:border-blue-500 hover:shadow-lg transition-all text-right"
        >
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1d4ed8] text-white shadow-md group-hover:scale-105 transition-transform shrink-0">
            <BookMarked className="w-7 h-7" />
          </span>
          <span className="flex-1 min-w-0 space-y-1">
            <span className="block text-base font-black text-gray-800 dark:text-gray-100">
              📚 الحصيلة المعرفية — {domain?.titleAr}
            </span>
            <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed">
              كل ما يجب حفظه في هذا المجال — ملخصات مرقّمة لكل وحدة
              + الدليل العام للمنهجية
            </span>
          </span>
          <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-all shrink-0" />
        </button>
      </div>
    );
  }

  // ----- Écran 4 : Leçon Passive — ICÔNES DES CHAPITRES (une icône = une leçon) -----
  const unitCourante = INITIAL_UNITS.find((u) => u.id === selectedPassiveUnitId);
  const chapitres = getUnitLessonSequence(selectedPassiveUnitId).filter(hasHtmlFile);
  return (
    <div dir="rtl" className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setSelectedPassiveUnitId(null)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
        >
          <span>→</span>
          <span>عودة إلى وحدات المجال</span>
        </button>
        <h2 className="text-xl font-black flex items-center gap-2">
          <Icone cle={uniteIcone(selectedPassiveUnitId)} className="w-5 h-5 text-[#0e6b6b]" />
          {unitCourante?.title}
        </h2>
      </div>

      {/* Bande d'unités : passer d'une unité à l'autre icône après icône. */}
      <div className="flex items-center gap-2 flex-wrap" data-testid="bande-unites">
        {domain?.unitIds.map((uid) => (
          <button
            key={uid}
            onClick={() => setSelectedPassiveUnitId(uid)}
            title={getUnitTitle(uid)}
            data-testid={`bande-unite-${uid}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black transition-colors ${
              uid === selectedPassiveUnitId
                ? 'bg-[#0e6b6b] text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-teal-100'
            }`}
          >
            <Icone cle={uniteIcone(uid)} className="w-3.5 h-3.5" />
            وحدة {uid}
          </button>
        ))}
      </div>

      <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{unitCourante?.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3" data-testid="chapitres-icones">
        {chapitres.length === 0 && (
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 col-span-full text-center py-6">
            لا يوجد نشاط في هذه الوحدة بعد.
          </p>
        )}
        {chapitres.map((key, i) => {
          const titre = getPassiveLessonTitle(key, selectedPassiveUnitId);
          return (
            <button
              key={key}
              onClick={() => { setSelectedUnit(selectedPassiveUnitId); setSelectedPassiveLesson(key); }}
              data-testid={`chapitre-${key}`}
              className="group p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c18] hover:border-teal-500 hover:shadow-md transition-all text-right"
            >
              <span className="flex items-start gap-3">
                <span className="relative shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-[#0e6b6b] dark:text-teal-300 group-hover:bg-[#0e6b6b] group-hover:text-white transition-colors">
                  <Icone cle={chapitreIcone(titre, selectedPassiveUnitId)} className="w-5 h-5" />
                  <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#0e6b6b] text-white text-[9px] font-black">
                    {getPassiveLessonPosition(key, selectedPassiveUnitId)}
                  </span>
                </span>
                <span className="flex-1 text-sm font-bold text-gray-800 dark:text-gray-100 leading-snug">
                  {titre}
                  <SourceBadge cle={key} titre={titre} />
                </span>
                <ChevronLeft className="w-4 h-4 text-gray-300 group-hover:text-teal-500 transition-all shrink-0 mt-1" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

