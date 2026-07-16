import React, { useMemo, useState, lazy, Suspense } from 'react';
import { Zap, Layers, Target, BookOpen, Rocket, Lightbulb, ChevronRight, Trophy, Flame, FileText } from 'lucide-react';
import { Unit, UserProgress, Flashcard, TabId } from '../types';
import { DOMAINS_INFO, getUnitDomainId } from '../utils/domainMapper';

// Lazy-load heavy sub-views (FR8.3 — keep TrainingView chunk small)
const RevisionView = lazy(() => import('./RevisionView'));
const MethodologyView = lazy(() => import('./MethodologyView'));
const DocumentAnalysisView = lazy(() => import('./DocumentAnalysisView'));

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

type SubTab = 'quick' | 'cards' | 'bac' | 'methodo' | 'docs' | 'challenge';

export default function TrainingView({
  units,
  flashcards,
  progress,
  onLaunchQuiz,
  onRateCard,
  isFocusMode,
  setIsFocusMode,
}: TrainingViewProps) {
  // Accueil أتدرب : sub = null => grille des rubriques (icônes), sinon on est dans une rubrique.
  const [sub, setSub] = useState<SubTab | null>(null);
  // Navigation à 2 niveaux dans « أسئلة سريعة » : null = grille des 3 domaines, sinon on est dans un domaine.
  const [quickDomainId, setQuickDomainId] = useState<number | null>(null);
  // Navigation à 2 niveaux dans « بطاقات » : domaine sélectionné puis chapitre, puis vue de révision.
  const [cardsDomainId, setCardsDomainId] = useState<number | null>(null);
  const [cardsUnitId, setCardsUnitId] = useState<number | null>(null);

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

  // Unité cible du jour : la plus faible non terminée (comme l'écran principal).
  const dailyTargetUnit = useMemo(() => {
    const incomplete = units.filter((u) => !u.isLocked && u.progress < 100).sort((a, b) => a.progress - b.progress);
    return incomplete[0] || units[0];
  }, [units]);

  // Moyenne d'évolution globale (anneaux de progression des icônes).
  const overallAvg = useMemo(() => {
    const avgs = domainStats.map((d) => d.avg);
    return avgs.length ? Math.round(avgs.reduce((s, a) => s + a, 0) / avgs.length) : 0;
  }, [domainStats]);

  const cardProgress = useMemo(() => {
    const total = flashcards.length || 1;
    const done = progress.flashcardStats.good + progress.flashcardStats.easy;
    return Math.min(100, Math.round((done / total) * 100));
  }, [flashcards, progress]);

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

  // Rubriques d'entraînement présentées en icônes rondes (style écran principal).
  const RUBRICS: {
    id: SubTab;
    label: string;
    desc: string;
    icon: React.ReactNode;
    color: string;
    ring: number;
    onClick: () => void;
  }[] = [
    { id: 'quick', label: 'أسئلة سريعة', desc: 'QCM حسب المجال', icon: <Zap className="w-8 h-8" />, color: '#006d37', ring: overallAvg, onClick: () => setSub('quick') },
    { id: 'cards', label: 'بطاقات', desc: 'مراجعة سريعة بالبطاقات', icon: <Layers className="w-8 h-8" />, color: '#7c3aed', ring: cardProgress, onClick: () => setSub('cards') },
    { id: 'bac', label: 'تحدي BAC', desc: '3 بطولات على غرار الامتحان', icon: <Target className="w-8 h-8" />, color: '#e11d48', ring: 0, onClick: () => setSub('bac') },
    { id: 'methodo', label: 'كيف أجيب؟', desc: 'المنهجية وطريقة الإجابة', icon: <BookOpen className="w-8 h-8" />, color: '#0891b2', ring: 0, onClick: () => setSub('methodo') },
    { id: 'docs', label: 'تحليل وثائق', desc: '15 وثيقة نخبة + تقييم فوري', icon: <FileText className="w-8 h-8" />, color: '#059669', ring: 0, onClick: () => setSub('docs') },
    { id: 'challenge', label: 'تحدي 3 دقائق', desc: dailyTargetUnit ? `« ${dailyTargetUnit.title} »` : 'ابدأ الآن', icon: <Rocket className="w-8 h-8" />, color: '#ff9a4a', ring: dailyTargetUnit?.progress ?? 0, onClick: () => dailyTargetUnit && onLaunchQuiz(dailyTargetUnit.id) },
  ];

  const activeRubric = sub != null ? RUBRICS.find((r) => r.id === sub) : null;

  const goToMenu = () => {
    setSub(null);
    setQuickDomainId(null);
    setCardsDomainId(null);
    setCardsUnitId(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 pb-28" dir="rtl">
      {/* Header 1 ligne : XP | streak (style écran principal) */}
      <div className="flex items-center justify-between gap-2 rounded-2xl bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 px-4 py-3 shadow-sm mb-4">
        <div className="flex items-center gap-3 text-sm font-black">
          <span className="flex items-center gap-1 text-[#b45309] dark:text-[#ffd27a]">
            <Trophy className="w-4 h-4 fill-current" /> {progress.xp} XP
          </span>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <span className="flex items-center gap-1 text-[#ff9a4a]">
            <Flame className="w-4 h-4 fill-current" /> {progress.streak} يوم
          </span>
        </div>
        <div className="text-right">
          <span className="block text-xs font-black text-gray-900 dark:text-white">أتدرب</span>
          <span className="block text-[10px] text-[#006d37] dark:text-[#2ecc71]">QCM + بطاقات + منهجية</span>
        </div>
      </div>

      {/* Hero unique orange : 1 seule action principale (comme écran principal) */}
      <button
        onClick={() => dailyTargetUnit && onLaunchQuiz(dailyTargetUnit.id)}
        className="w-full text-right rounded-3xl p-5 bg-gradient-to-br from-[#ffb347] to-[#ff9a4a] text-white shadow-md mb-5 hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Rocket className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h2 className="font-black text-lg leading-tight">مهمة 3 دقائق <span className="text-[#fff3d6]">+15 XP</span></h2>
            <p className="text-white/90 text-sm mt-0.5 truncate">« {dailyTargetUnit?.title} »</p>
          </div>
          <span className="bg-white text-[#b45309] font-black text-sm px-4 py-2 rounded-xl shrink-0">
            ابدأ الآن!
          </span>
        </div>
      </button>

      {/* Grille 2x3 = icônes rondes avec anneau de progression (style écran principal) */}
      {sub === null && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {RUBRICS.map((r) => (
            <button
              key={r.id}
              onClick={r.onClick}
              className="flex flex-col items-center text-center gap-2 rounded-3xl bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer"
            >
              <div
                className="relative w-20 h-20 rounded-full p-[3px]"
                style={{ background: `conic-gradient(${r.color} ${r.ring}%, rgba(0,0,0,0.08) ${r.ring}% 100%)` }}
              >
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-white"
                  style={{ background: `linear-gradient(135deg, ${r.color}, ${r.color}cc)` }}
                >
                  {r.icon}
                </div>
              </div>
              <span className="font-black text-sm text-gray-900 dark:text-white">{r.label}</span>
              <span className="text-[11px] leading-4 text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[2rem]">{r.desc}</span>
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

      {sub === 'cards' && cardsDomainId === null && (
        <div className="space-y-3">
          <h2 className="font-black text-gray-800 dark:text-gray-100">اختر المجال</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {domainStats.map(({ domain, weak, avg }) => (
              <button
                key={domain.id}
                onClick={() => setCardsDomainId(domain.id)}
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
                <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mt-1">
                  <div className="h-full rounded-full transition-all" style={{ width: `${avg}%`, backgroundColor: domain.color }} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {sub === 'cards' && cardsDomainId != null && cardsUnitId === null && (() => {
        const activeCardsDomain = domainStats.find((d) => d.domain.id === cardsDomainId);
        if (!activeCardsDomain) return null;
        return (
          <div className="space-y-3">
            <button
              onClick={() => setCardsDomainId(null)}
              className="flex items-center gap-1 text-sm font-bold text-[#506072] dark:text-gray-300 hover:text-[#006d37] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" /> كل المجالات
            </button>
            <div className="flex items-center gap-2">
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: `${activeCardsDomain.domain.color}1a` }}
              >
                {activeCardsDomain.domain.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="font-black text-base truncate" style={{ color: activeCardsDomain.domain.color }}>
                  {activeCardsDomain.domain.title}
                </h2>
                <span className="text-[11px] text-gray-400">
                  {activeCardsDomain.all.length} وحدة · إتقان {activeCardsDomain.avg}%
                </span>
              </div>
            </div>

            {activeCardsDomain.all.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">لا توجد وحدات في هذا المجال بعد.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {activeCardsDomain.all.map((u) => {
                  const count = flashcards.filter((c) => c.unitId === u.id).length;
                  return (
                    <button
                      key={u.id}
                      onClick={() => setCardsUnitId(u.id)}
                      className="flex flex-col items-center text-center gap-2 rounded-3xl bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-800 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <span
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${activeCardsDomain.domain.color}, ${activeCardsDomain.domain.color}cc)` }}
                      >
                        <BookOpen className="w-6 h-6" />
                      </span>
                      <span className="font-black text-sm text-gray-900 dark:text-white leading-tight line-clamp-2">{u.title}</span>
                      <span className="text-[10px] text-gray-400">إتقان {u.progress}% · {count} بطاقة</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {sub === 'cards' && cardsDomainId != null && cardsUnitId != null && (
        <div className="space-y-3">
          <button
            onClick={() => setCardsUnitId(null)}
            className="flex items-center gap-1 text-sm font-bold text-[#506072] dark:text-gray-300 hover:text-[#006d37] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" /> كل الوحدات
          </button>
          <Suspense fallback={<SubFallback />}>
            <RevisionView
              units={units}
              flashcards={flashcards}
              xp={progress.xp}
              streak={progress.streak}
              onRateCard={onRateCard}
              initialUnitId={cardsUnitId}
              isFocusMode={isFocusMode}
              setIsFocusMode={setIsFocusMode}
            />
          </Suspense>
        </div>
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
        <div className="space-y-4">
          <div className="rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141916]">
              <button onClick={goToMenu} className="flex items-center gap-1 text-sm font-bold text-[#506072] hover:text-[#006d37] cursor-pointer">
                <ChevronRight className="w-5 h-5" /> رجوع
              </button>
              <span className="font-black text-gray-900 dark:text-white">المنهجية والمسعى العلمي</span>
            </div>
            <Suspense fallback={<SubFallback />}>
              <MethodologyView />
            </Suspense>
          </div>
        </div>
      )}

      {sub === 'docs' && (
        <Suspense fallback={<SubFallback />}>
          <DocumentAnalysisView onBack={goToMenu} onLaunchQuiz={onLaunchQuiz} />
        </Suspense>
      )}
    </div>
  );
}
