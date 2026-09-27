// RevisionPlanView.tsx — « خطة المراجعة النهائية » (audit item 14, sprint 15).
//
// L'élève à trois semaines du BAC n'a pas besoin d'une brique de plus : il a
// besoin de savoir QUOI FAIRE AUJOURD'HUI. Cette vue ne contient aucun contenu
// pédagogique propre — elle ordonne les 24 capsules, 17 schémas, 23 situations
// et 11 cartes déjà produits, sur le temps qui reste.
//
// Les cases cochées sont conservées dans localStorage : fermer l'app ne doit
// pas effacer une journée de travail. La clé inclut le couple (jours, minutes)
// pour qu'un changement de plan ne recycle pas une progression qui ne
// correspond plus aux mêmes tâches.

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Check, Clock, ListChecks } from 'lucide-react';
import {
  PRESETS,
  TASK_LABEL_AR,
  buildRevisionPlan,
  minutesByUnit,
  type PlanTask,
} from '../data/revisionPlan';

interface RevisionPlanViewProps {
  onBackToHome?: () => void;
}

const KIND_CLASS: Record<PlanTask['kind'], string> = {
  capsule: 'bg-[#fff7e0] text-[#8a6a00] dark:bg-black/20 dark:text-[#d9a400]',
  schema: 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400',
  montage: 'bg-[#f3e8ff] text-[#6b21a8] dark:bg-purple-500/10 dark:text-purple-300',
  situation: 'bg-[#e8f5ee] text-[#006d37] dark:bg-black/20 dark:text-[#2ecc71]',
  carte: 'bg-blue-50 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300',
};

const cleStockage = (d: number, m: number) => `kunz.revisionPlan.${d}x${m}`;

function chargerFait(cle: string): Set<string> {
  try {
    const brut = localStorage.getItem(cle);
    return new Set<string>(brut ? (JSON.parse(brut) as string[]) : []);
  } catch {
    return new Set<string>();
  }
}

export default function RevisionPlanView({ onBackToHome }: RevisionPlanViewProps) {
  const [daysLeft, setDaysLeft] = useState(14);
  const [minutesPerDay, setMinutesPerDay] = useState(90);
  const [fait, setFait] = useState<Set<string>>(() => chargerFait(cleStockage(14, 90)));

  const plan = useMemo(() => buildRevisionPlan({ daysLeft, minutesPerDay }), [daysLeft, minutesPerDay]);
  const parUnite = useMemo(() => minutesByUnit(plan), [plan]);
  const cle = cleStockage(daysLeft, minutesPerDay);

  useEffect(() => {
    setFait(chargerFait(cle));
  }, [cle]);

  const basculer = (id: string) => {
    setFait((prec) => {
      const suivant = new Set(prec);
      if (suivant.has(id)) suivant.delete(id);
      else suivant.add(id);
      try {
        localStorage.setItem(cle, JSON.stringify([...suivant]));
      } catch {
        /* stockage indisponible : la session reste utilisable */
      }
      return suivant;
    });
  };

  const totalTaches = plan.totalTasks;
  const totalFait = plan.days.reduce(
    (s, j) => s + j.tasks.filter((t) => fait.has(`${j.day}:${t.kind}:${t.refId}`)).length,
    0,
  );
  const pourcent = totalTaches === 0 ? 0 : Math.round((totalFait / totalTaches) * 100);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto" dir="rtl" data-testid="revision-plan">
      <div className="flex flex-row-reverse items-center justify-between gap-4 mb-5">
        <div className="flex flex-row-reverse items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-gradient-to-l from-[#006d37] to-emerald-600 flex items-center justify-center shadow-md">
            <CalendarDays className="w-6 h-6 text-white" />
          </span>
          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-black text-[#1f1c0b] dark:text-gray-100">خطة المراجعة النهائية</h1>
            <p className="text-sm text-[#506072] dark:text-gray-400">
              لا محتوى جديداً — ترتيب لما بنيته: كبسولات، رسومات، وضعيات، خرائط
            </p>
          </div>
        </div>
        {onBackToHome && (
          <button
            data-testid="plan-retour"
            onClick={onBackToHome}
            className="flex flex-row-reverse items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f3f4f5] dark:bg-[#1f2622] border border-[#bbcbbb]/30 text-sm font-bold text-[#006d37] dark:text-[#2ecc71] cursor-pointer"
          >
            <span>العودة</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <section className="rounded-3xl p-4 bg-white dark:bg-[#141916] border border-[#bbcbbb]/30 mb-4">
        <p className="text-sm font-black text-[#1f1c0b] dark:text-gray-100 mb-2">كم بقي لك من الوقت؟</p>
        <div className="flex flex-row-reverse flex-wrap gap-2 mb-4">
          {PRESETS.map((p) => (
            <button
              key={p.labelAr}
              data-testid={`preset-${p.daysLeft}`}
              onClick={() => {
                setDaysLeft(p.daysLeft);
                setMinutesPerDay(p.minutesPerDay);
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer ${
                daysLeft === p.daysLeft && minutesPerDay === p.minutesPerDay
                  ? 'bg-[#006d37] text-white'
                  : 'bg-[#f3f4f5] dark:bg-[#1f2622] text-[#506072] dark:text-gray-300'
              }`}
            >
              {p.labelAr}
            </button>
          ))}
        </div>

        <label className="block text-xs font-bold text-[#506072] dark:text-gray-300 mb-1">
          الأيام المتبقية: <span data-testid="plan-jours">{daysLeft}</span>
        </label>
        <input
          data-testid="plan-jours-slider"
          type="range"
          min={1}
          max={60}
          value={daysLeft}
          onChange={(e) => setDaysLeft(Number(e.target.value))}
          className="w-full mb-3 accent-[#006d37]"
        />

        <label className="block text-xs font-bold text-[#506072] dark:text-gray-300 mb-1">
          دقائق يومياً: <span data-testid="plan-minutes">{minutesPerDay}</span>
        </label>
        <input
          data-testid="plan-minutes-slider"
          type="range"
          min={20}
          max={180}
          step={10}
          value={minutesPerDay}
          onChange={(e) => setMinutesPerDay(Number(e.target.value))}
          className="w-full accent-[#006d37]"
        />
      </section>

      <section
        data-testid="plan-resume"
        className="rounded-3xl p-4 bg-[#fff9ed] dark:bg-black/20 border border-[#d9a400]/30 mb-4"
      >
        <div className="flex flex-row-reverse flex-wrap items-center gap-x-5 gap-y-1 text-sm text-[#1f1c0b] dark:text-gray-200">
          <span className="flex flex-row-reverse items-center gap-1.5">
            <ListChecks className="w-4 h-4" />
            {plan.totalTasks} مهمة
          </span>
          <span className="flex flex-row-reverse items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {Math.round(plan.totalMinutes / 60)} ساعة إجمالاً
          </span>
          <span>الوحدات المغطاة: {plan.coveredUnitIds.length} / 11</span>
          <span data-testid="plan-progression">أنجزت {pourcent}٪</span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
          <div className="h-full bg-[#006d37] transition-all" style={{ width: `${pourcent}%` }} />
        </div>
        <p className="mt-3 text-[12px] leading-6 text-[#506072] dark:text-gray-400">
          الترتيب يتبع وزن الوحدة في الامتحان مصحّحاً بصعوبتها الملاحظة: أكثر الوقت للوحدة{' '}
          {Object.entries(parUnite).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'}.
        </p>
      </section>

      <div className="space-y-3">
        {plan.days.map((jour) => (
          <section
            key={jour.day}
            data-testid={`plan-jour-${jour.day}`}
            className="rounded-3xl p-4 bg-white dark:bg-[#141916] border border-[#bbcbbb]/30"
          >
            <div className="flex flex-row-reverse items-center justify-between mb-2">
              <h2 className="text-sm font-black text-[#1f1c0b] dark:text-gray-100">
                اليوم {jour.day}
                {jour.consolidationOnly && (
                  <span
                    data-testid={`plan-consolidation-${jour.day}`}
                    className="mr-2 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                  >
                    تثبيت فقط — لا شيء جديد
                  </span>
                )}
              </h2>
              <span className="text-[11px] font-bold text-[#506072] dark:text-gray-400">
                {jour.totalMinutes} دقيقة
              </span>
            </div>

            <ul className="space-y-2">
              {jour.tasks.map((t) => {
                const id = `${jour.day}:${t.kind}:${t.refId}`;
                const actif = fait.has(id);
                return (
                  <li key={id}>
                    <button
                      data-testid={`tache-${id}`}
                      onClick={() => basculer(id)}
                      aria-pressed={actif}
                      className={`w-full text-right flex flex-row-reverse items-start gap-2 px-3 py-2.5 rounded-2xl border transition-all cursor-pointer ${
                        actif
                          ? 'bg-[#e8f5ee] dark:bg-emerald-500/10 border-[#006d37]/40'
                          : 'bg-[#f8fbfa] dark:bg-black/20 border-[#bbcbbb]/30'
                      }`}
                    >
                      <span
                        className={`shrink-0 w-5 h-5 mt-0.5 rounded-lg flex items-center justify-center ${
                          actif ? 'bg-[#006d37] text-white' : 'bg-white dark:bg-[#1f2622]'
                        }`}
                      >
                        {actif && <Check className="w-3.5 h-3.5" />}
                      </span>
                      <span className="flex-1">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-lg mb-1 ${KIND_CLASS[t.kind]}`}>
                          {TASK_LABEL_AR[t.kind]} · الوحدة {t.unitId} · {t.minutes} د
                        </span>
                        <span className={`block text-sm font-bold text-[#1f1c0b] dark:text-gray-100 ${actif ? 'line-through opacity-60' : ''}`}>
                          {t.titleAr}
                        </span>
                        <span className="block text-[12px] text-[#506072] dark:text-gray-400">{t.actionAr}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
