import React, { useMemo, useState, lazy, Suspense } from 'react';
import { Zap, Layers, Target, BookOpen, Rocket, Lightbulb, ChevronRight } from 'lucide-react';
import { Unit, UserProgress, Flashcard, TabId } from '../types';
import { DOMAINS_INFO, getUnitDomainId } from '../utils/domainMapper';

// Lazy-load heavy sub-views (FR8.3 — keep TrainingView chunk small)
const RevisionView = lazy(() => import('./RevisionView'));
const MethodologyView = lazy(() => import('./MethodologyView'));

function SubFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-8 h-8 border-4 border-[#2ecc71]/30 border-t-[#006d37] rounded-full animate-spin" />
      <p className="text-sm font-bold text-[#506072]">تحميل...</p>
    </div>
  );
}

interface TrainingViewProps {
  units: Unit[];
  flashcards: Flashcard[];
  progress: UserProgress;
  onLaunchQuiz: (unitId: number) => void;
  onLaunchRevision: (unitId: number) => void;
  onStartLesson: (lessonId: string) => void;
  onRateCard: (cardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => void;
  isFocusMode: boolean;
  setIsFocusMode: (v: boolean) => void;
  onNavigateToTab: (tab: TabId) => void;
}

type SubTab = 'quick' | 'cards' | 'bac' | 'methodo';

export default function TrainingView({
  units,
  flashcards,
  progress,
  onLaunchQuiz,
  onRateCard,
  isFocusMode,
  setIsFocusMode,
}: TrainingViewProps) {
  // Accueil أتدرب : sub = null => grille des 4 rubriques (icônes), sinon on est dans une rubrique.
  const [sub, setSub] = useState<SubTab | null>(null);
  // Navigation à 2 niveaux dans « أسئلة سريعة » : null = grille des 3 domaines, sinon on est dans un domaine.
  const [quickDomainId, setQuickDomainId] = useState<number | null>(null);

  // Stats par domaine (les 3 toujours présents pour la grille d'icônes).
  const domainStats = useMemo(() => {
    return DOMAINS_INFO.map((domain) => {
      const all = units.filter((u) => getUnitDomainId(u.id) === domain.id);
      const weak = all.filter((u) => u.progress < 100).sort((a, b) => a.progress - b.progress);
      const avg = all.length ? Math.round(all.reduce((s, u) => s + u.progress, 0) / all.length) : 0;
      return { domain, all, weak, avg };
    });
  }, [units]);

  const activeDomain = quickDomainId != null ? domainStats.find((d) => d.domain.id === quickDomainId) : null;

  // 3 "bosses" : une unité représentative par domaine
  const bosses = useMemo(() => {
    const seen = new Set<string>();
    const result: Unit[] = [];
    for (const u of units) {
      if (!seen.has(u.domain)) {
        seen.add(u.domain);
        result.push(u);
      }
      if (result.length === 3) break;
    }
    return result;
  }, [units]);

  // Rubriques d'entraînement présentées en icônes (choix avant d'entrer).
  const RUBRICS: { id: SubTab; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
    { id: 'quick', label: 'أسئلة سريعة', desc: 'QCM حسب المجال', icon: <Zap className="w-8 h-8" />, color: '#006d37' },
    { id: 'cards', label: 'بطاقات', desc: 'مراجعة سريعة بالبطاقات', icon: <Layers className="w-8 h-8" />, color: '#7c3aed' },
    { id: 'bac', label: 'تحدي BAC', desc: '3 بطولات على غرار الامتحان', icon: <Target className="w-8 h-8" />, color: '#e11d48' },
    { id: 'methodo', label: 'كيف أجيب؟', desc: 'المنهجية وطريقة الإجابة', icon: <BookOpen className="w-8 h-8" />, color: '#0891b2' },
  ];

  const activeRubric = sub != null ? RUBRICS.find((r) => r.id === sub) : null;

  const goToMenu = () => {
    setSub(null);
    setQuickDomainId(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 pb-28" dir="rtl">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">أتدرب</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">QCM + بطاقات + تحدي BAC + منهجية</p>

      {/* Écran d'accueil : grille d'icônes pour choisir la rubrique */}
      {sub === null && (
        <div className="grid grid-cols-2 gap-3">
          {RUBRICS.map((r) => (
            <button
              key={r.id}
              onClick={() => setSub(r.id)}
              className="flex flex-col items-center text-center gap-3 rounded-3xl bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span
                className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-md"
                style={{ background: `linear-gradient(135deg, ${r.color}, ${r.color}cc)` }}
              >
                {r.icon}
              </span>
              <span className="font-black text-base text-gray-900 dark:text-white">{r.label}</span>
              <span className="text-[11px] leading-4 text-gray-500 dark:text-gray-400">{r.desc}</span>
            </button>
          ))}
        </div>
      )}

      {/* En-tête d'une rubrique : bouton retour vers la grille d'icônes */}
      {activeRubric && (
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToMenu}
            className="flex items-center gap-1 text-sm font-bold text-[#506072] dark:text-gray-300 hover:text-[#006d37] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" /> رجوع
          </button>
          <span className="flex items-center gap-1.5 font-black text-sm" style={{ color: activeRubric.color }}>
            {activeRubric.label}
          </span>
        </div>
      )}

      {/* Tip méthodo contextuel (uniquement à l'intérieur d'une rubrique) */}
      {activeRubric && (
        <div className="mb-4 flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-2xl p-3 text-xs leading-6 text-amber-800 dark:text-amber-200 font-medium">
          <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" />
          نصيحة: ابدأ دائماً بفعل « حلل » الوثيقة قبل أي تفسير — هذا يضمن نقاط التحليل الكاملة في البكالوريا.
        </div>
      )}

      {sub === 'quick' && !activeDomain && (
        <div className="space-y-3">
          <h2 className="font-black text-gray-800 dark:text-gray-100">اختر المجال</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {domainStats.map(({ domain, weak, avg }) => (
              <button
                key={domain.id}
                onClick={() => setQuickDomainId(domain.id)}
                className="flex flex-col items-center text-center gap-2 rounded-3xl bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                  style={{ backgroundColor: `${domain.color}1a` }}
                >
                  {domain.emoji}
                </span>
                <h3 className="font-black text-sm" style={{ color: domain.color }}>{domain.title}</h3>
                <span className="text-[11px] text-gray-400">
                  {weak.length > 0 ? `${weak.length} وحدة للمراجعة` : 'مكتمل ✓'} · إتقان {avg}%
                </span>
                {/* Barre de progression du domaine */}
                <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mt-1">
                  <div className="h-full rounded-full transition-all" style={{ width: `${avg}%`, backgroundColor: domain.color }} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {sub === 'quick' && activeDomain && (
        <div className="space-y-3">
          {/* Fil d'Ariane + retour */}
          <button
            onClick={() => setQuickDomainId(null)}
            className="flex items-center gap-1 text-sm font-bold text-[#506072] dark:text-gray-300 hover:text-[#006d37] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" /> كل المجالات
          </button>
          <div className="flex items-center gap-2">
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ backgroundColor: `${activeDomain.domain.color}1a` }}
            >
              {activeDomain.domain.emoji}
            </span>
            <div className="flex-1 min-w-0">
              <h2 className="font-black text-base truncate" style={{ color: activeDomain.domain.color }}>
                {activeDomain.domain.title}
              </h2>
              <span className="text-[11px] text-gray-400">
                {activeDomain.weak.length} وحدة للمراجعة · إتقان {activeDomain.avg}%
              </span>
            </div>
          </div>

          {activeDomain.weak.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">أحسنت! كل وحدات هذا المجال مكتملة (≥ 100%).</p>
          ) : (
            activeDomain.weak.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <h3 className="font-black text-gray-900 dark:text-white truncate">{u.title}</h3>
                  <span className="text-[11px] text-gray-400">إتقان {u.progress}%</span>
                </div>
                <button
                  onClick={() => onLaunchQuiz(u.id)}
                  className="flex items-center gap-1 bg-[#006d37] text-white text-sm font-bold px-3 py-2 rounded-xl hover:bg-[#005a2e] transition-colors cursor-pointer shrink-0"
                >
                  <Zap className="w-4 h-4" /> ابدأ QCM
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {sub === 'cards' && (
        <Suspense fallback={<SubFallback />}>
          <RevisionView
            units={units}
            flashcards={flashcards}
            xp={progress.xp}
            streak={progress.streak}
            onRateCard={onRateCard}
            initialUnitId={1}
            isFocusMode={isFocusMode}
            setIsFocusMode={setIsFocusMode}
          />
        </Suspense>
      )}

      {sub === 'bac' && (
        <div className="space-y-3">
          <h2 className="font-black text-gray-800 dark:text-gray-100">تحدي BAC — 3 بطولات</h2>
          {bosses.map((b, i) => (
            <div
              key={b.id}
              className="flex items-center gap-3 bg-gradient-to-br from-[#1f2937] to-[#111827] text-white rounded-2xl p-4 shadow-sm"
            >
              <div className="w-11 h-11 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0">
                <Rocket className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-rose-300">BOSS {i + 1}</span>
                <h3 className="font-black">{b.title}</h3>
                <span className="text-[11px] text-gray-300">{b.domain}</span>
              </div>
              <button
                onClick={() => onLaunchQuiz(b.id)}
                className="bg-rose-500 text-white text-sm font-bold px-3 py-2 rounded-xl hover:bg-rose-600 transition-colors cursor-pointer"
              >
                تحدّى
              </button>
            </div>
          ))}
        </div>
      )}

      {sub === 'methodo' && (
        <div className="rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800">
          <Suspense fallback={<SubFallback />}>
            <MethodologyView />
          </Suspense>
        </div>
      )}
    </div>
  );
}
