import React from 'react';
import { Compass, AlertTriangle, RefreshCw, CheckCircle2, Brain, Target, Sparkles, Gift, BookOpen, LogOut, ArrowLeft } from 'lucide-react';
import { Unit, UserProgress, TabId } from '../types';
import { CoachConfig } from '../data/kunzDatabase';
import { logEvent } from '../utils/telemetryService';
import { loadStore } from '../data/store';

interface CoachViewProps {
  progress?: UserProgress;
  units?: Unit[];
  onStartLesson: (lessonId: string) => void;
  onSignOut: () => void;
  onNavigateToTab?: (tab: TabId) => void;
  onClose?: () => void;
}

// Correction B — Coach 100% basé sur des données réelles (KunzStore).
// Aucune donnée simulée : score, faiblesses, révisions et maîtrises
// proviennent exclusivement du store offline (erreurs, preuves, maîtrise, quiz).

interface RealWeakPoint {
  conceptId: string;
  lessonId: string;
  conceptAr: string;
  errorCount: number;
  kind: 'methodology' | 'knowledge' | 'document';
}

interface CoachState {
  weakPoints: RealWeakPoint[];
  dueToday: { conceptId: string; conceptAr: string; reasonAr: string }[];
  mastered: string[];
  methodologyScore: number;
}

function buildConceptLabel(conceptId: string): string {
  // Libellé lisible à partir de l'id de concept (lexique DZ simplifié).
  const map: Record<string, string> = {
    enzmes: 'الإنزيمات',
    enzymes: 'الإنزيمات',
    adn_proteine: 'علاقة ADN-بروتين',
    photosynthese: 'البناء الضوئي',
    synapse: 'المشبك العصبي',
    subduction: 'الانغمار',
    lecon_transcription: 'الاستنساخ',
    lecon_traduction: 'الترجمة',
  };
  return map[conceptId] ?? conceptId;
}

function buildCoachState(): CoachState {
  let store;
  try {
    store = loadStore();
  } catch {
    store = null;
  }
  if (!store) {
    return { weakPoints: [], dueToday: [], mastered: [], methodologyScore: 0 };
  }

  const errors = store.learningErrors;
  const evidences = store.evidences ?? [];

  // Points faibles = erreurs ACTIVES (non résolues), regroupées par concept.
  const byConcept = new Map<string, RealWeakPoint>();
  for (const e of errors) {
    if (e.resolvedAt != null) continue;
    const cid = e.conceptId ?? e.id;
    const existing = byConcept.get(cid);
    if (existing) {
      existing.errorCount += 1;
    } else {
      byConcept.set(cid, {
        conceptId: cid,
        lessonId: e.conceptId ?? e.id,
        conceptAr: buildConceptLabel(cid),
        errorCount: 1,
        kind: e.kind,
      });
    }
  }
  const weakPoints = [...byConcept.values()].sort((a, b) => b.errorCount - a.errorCount).slice(0, 3);

  // Révision du jour = rappels espacés ÉCHUS (nextReviewAt <= now).
  const now = Date.now();
  const dueToday = errors
    .filter((e) => e.resolvedAt == null && e.nextReviewAt > 0 && now >= e.nextReviewAt)
    .map((e) => ({
      conceptId: e.conceptId ?? e.id,
      conceptAr: buildConceptLabel(e.conceptId ?? e.id),
      reasonAr: 'مراجعة مستحقة — تذكير متباعد',
    }));

  // Maîtrises réelles (cellule evidenceCount > 0 et niveau != unknown).
  const mastered: string[] = [];
  for (const [conceptId, record] of Object.entries(store.mastery)) {
    const cells: { level: string; evidenceCount: number }[] = [
      record.knowledge,
      record.document,
      ...Object.values(record.methodology ?? {}),
    ];
    const strong = cells.some((c) => (c?.level === 'mastered' || c?.level === 'developing') && (c?.evidenceCount ?? 0) > 0);
    if (strong) mastered.push(buildConceptLabel(conceptId));
  }

  // Score méthodologique RÉEL = moyenne des preuves méthodologiques (réelles).
  const methodEvidences = evidences.filter((e) => e.dimension === 'methodology');
  const methodologyScore =
    methodEvidences.length > 0
      ? Math.round(methodEvidences.reduce((s, e) => s + e.score, 0) / methodEvidences.length)
      : 0;

  return { weakPoints, dueToday, mastered: mastered.slice(0, 6), methodologyScore };
}

export default function CoachView({ onStartLesson, onSignOut, onNavigateToTab, onClose }: CoachViewProps) {
  const state = React.useMemo(() => buildCoachState(), []);
  const isEmpty = state.weakPoints.length === 0 && state.dueToday.length === 0 && state.mastered.length === 0;

  const proTeaserVisible = state.methodologyScore >= CoachConfig.proTeaser.triggerScore && state.methodologyScore > 0;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6 pb-24" dir="rtl">
      {/* Header Coach */}
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/20">
          <Compass className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-[#1f1c0b] dark:text-white">المرشد الموجه</h1>
          <p className="text-sm text-[#506072] dark:text-gray-400">تحليل أدائك وتوجيهك للمراجعة الصحيحة - 100% offline, بدون LLM</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="mr-auto w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[#506072] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* État vide obligatoire : aucune donnée inventée. */}
      {isEmpty && (
        <div className="bg-white dark:bg-[#141916] border border-[#e2dabf]/60 rounded-2xl p-5 text-center shadow-sm">
          <Brain className="w-8 h-8 mx-auto text-[#006d37] dark:text-[#2ecc71] mb-2" />
          <p className="text-sm font-bold text-[#1f1c0b] dark:text-white leading-7">
            أكمل أول اختبار أو تحليل وثيقة كي أحدد نقاط ضعفك الحقيقية.
          </p>
        </div>
      )}

      {/* Section1: Points Faibles (réels) */}
      {state.weakPoints.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-2xl p-5">
          <h2 className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black mb-4 text-sm">
            <AlertTriangle className="w-5 h-5" />
            نقاط ضعفك (تتطلب تدخلاً عاجلاً)
          </h2>
          <div className="space-y-3">
            {state.weakPoints.map((wp, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 shadow-sm">
                <div className="text-right">
                  <p className="font-black text-[#1f1c0b] dark:text-white text-sm">{CoachConfig.coachMessages.weakPointDetected.replace('{concept}', wp.conceptAr).replace('{count}', String(wp.errorCount))}</p>
                </div>
                <button
                  onClick={() => onStartLesson(wp.lessonId)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  راجع الآن
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section2: Révision du Jour (rappels échus réels) */}
      {state.dueToday.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5">
          <h2 className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-black mb-4 text-sm">
            <Brain className="w-5 h-5" />
            مراجعة اليوم (المنهجية الذكية)
          </h2>
          <div className="space-y-3">
            {state.dueToday.map((card, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30 shadow-sm">
                <div className="text-right">
                  <p className="font-black text-[#1f1c0b] dark:text-white text-sm">{card.conceptAr}</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-bold">{card.reasonAr}</p>
                </div>
                <button
                  onClick={() => onStartLesson(card.conceptId)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black rounded-xl transition-colors cursor-pointer shadow-md shrink-0"
                >
                  ابدأ المراجعة
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section3: Points Forts (maîtrises réelles) */}
      {state.mastered.length > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-5">
          <h2 className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black mb-4 text-sm">
            <CheckCircle2 className="w-5 h-5" />
            أنت جاهز في
          </h2>
          <div className="flex flex-wrap gap-2">
            {state.mastered.map((concept, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-white dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-black rounded-full border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
                ✓ {concept}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Teaser Pro — déclenché UNIQUEMENT par un score méthodologique réel. */}
      {proTeaserVisible && (
        <div className="relative overflow-hidden bg-gradient-to-br from-[#006d37] to-[#00562b] text-white rounded-2xl p-5 shadow-md border border-emerald-300/40">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-[#fed65b]" />
            <h2 className="font-black text-sm">{CoachConfig.proTeaser.title}</h2>
          </div>
          <p className="text-sm text-white/90 leading-7">{CoachConfig.proTeaser.message}</p>
          <button
            onClick={() => {
              logEvent('PRO_TEASER_CLICKED', { score: state.methodologyScore });
              onStartLesson('lecon_transcription');
            }}
            className="mt-4 w-full py-3 rounded-xl bg-[#fed65b] hover:bg-[#f5c93f] text-[#1f1c0b] font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow"
          >
            <Gift className="w-4 h-4" />
            {CoachConfig.proTeaser.ctaText}
          </button>
          <p className="mt-2 text-[10px] text-white/70 text-center">Score méthodologique réel : {state.methodologyScore}/100</p>
        </div>
      )}

      {/* Section4: Leçons officielles */}
      <div className="bg-[#f3f8f4] dark:bg-[#10231a] border border-[#2ecc71]/30 rounded-2xl p-5">
        <h2 className="flex items-center gap-2 text-[#006d37] dark:text-[#2ecc71] font-black mb-4 text-sm">
          <BookOpen className="w-5 h-5" />
          الدروس الرسمية
        </h2>
        <div className="grid gap-2">
          <button
            onClick={() => onStartLesson('d1-u1-l2-transcription')}
            className="w-full text-right px-4 py-3 rounded-xl bg-white dark:bg-[#141916] border border-[#e2dabf]/60 dark:border-[#2ecc71]/10 text-sm font-bold text-[#1f1c0b] dark:text-gray-100 hover:bg-[#2ecc71]/10 transition-colors cursor-pointer flex items-center justify-between"
          >
            <span>الاستنساخ وتدخل الإنزيم</span>
            <Target className="w-4 h-4 text-[#006d37] dark:text-[#2ecc71]" />
          </button>
          <button
            onClick={() => onStartLesson('d1-u1-l3-traduction')}
            className="w-full text-right px-4 py-3 rounded-xl bg-white dark:bg-[#141916] border border-[#e2dabf]/60 dark:border-[#2ecc71]/10 text-sm font-bold text-[#1f1c0b] dark:text-gray-100 hover:bg-[#2ecc71]/10 transition-colors cursor-pointer flex items-center justify-between"
          >
            <span>الترجمة والشفرة الوراثية</span>
            <Target className="w-4 h-4 text-[#006d37] dark:text-[#2ecc71]" />
          </button>
        </div>
      </div>

      {/* Bouton Test Diagnostique */}
      <div className="pt-2 space-y-3">
        <button
          onClick={() => onStartLesson('lecon_transcription')}
          className="w-full py-4 bg-[#006d37] hover:bg-[#00562b] border border-[#006d37] rounded-2xl font-black text-white flex items-center justify-center gap-3 transition-colors shadow-md cursor-pointer"
        >
          <Target className="w-5 h-5 text-[#fed65b]" />
          {CoachConfig.coachMessages.diagnosticTest}
        </button>
      </div>

      {/* Déconnexion */}
      <div className="pt-2">
        <button
          onClick={onSignOut}
          className="w-full py-3 rounded-2xl border border-[#e2dabf]/60 dark:border-white/10 text-[#506072] dark:text-gray-400 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-[#fff9ed] dark:hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>

      {onNavigateToTab && (
        <div className="pt-1">
          <button
            onClick={() => onNavigateToTab('lessons')}
            className="w-full py-3 rounded-2xl bg-white dark:bg-[#141916] border border-[#e2dabf]/60 text-[#506072] dark:text-gray-300 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-[#fff9ed] dark:hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة إلى الدروس
          </button>
        </div>
      )}
    </div>
  );
}
