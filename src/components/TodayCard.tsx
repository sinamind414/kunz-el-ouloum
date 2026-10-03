// TodayCard.tsx — « برنامج اليوم » sur l'accueil (sprint 29).
//
// Tout ce qui a été construit depuis le sprint 15 — plan, montages, rédaction —
// vivait derrière deux clics. Un élève qui ouvre l'app voit d'abord son
// tableau de bord ; s'il n'y trouve pas sa journée, il ne la fera pas.
//
// Cette carte ne duplique aucune logique : elle lit le réglage enregistré par
// la vue du plan, reconstruit le MÊME plan (le moteur est déterministe) et
// affiche les trois premières tâches non cochées du jour 1.

import { CalendarDays, Check } from 'lucide-react';
import { buildRevisionPlan, TASK_LABEL_AR } from '../data/revisionPlan';
import { readPlanSettings } from '../data/planSettings';

interface Props {
  onOpenPlan: () => void;
}

function cochees(daysLeft: number, minutesPerDay: number): Set<string> {
  try {
    const brut = localStorage.getItem(`kunz.revisionPlan.${daysLeft}x${minutesPerDay}`);
    return new Set<string>(brut ? (JSON.parse(brut) as string[]) : []);
  } catch {
    return new Set<string>();
  }
}

export default function TodayCard({ onOpenPlan }: Props) {
  const { daysLeft, minutesPerDay } = readPlanSettings();
  const plan = buildRevisionPlan({ daysLeft, minutesPerDay });
  const jour = plan.days[0];
  if (!jour) return null;

  const fait = cochees(daysLeft, minutesPerDay);
  const restantes = jour.tasks.filter((t) => !fait.has(`1:${t.kind}:${t.refId}`));
  const terminees = jour.tasks.length - restantes.length;

  return (
    // Sprint 49 : bouton, et non div cliquable — une carte pilotée par
    // `onClick` sur un `div` est invisible au clavier et aux technologies
    // d'assistance.
    <button
      type="button"
      data-testid="today-card"
      onClick={onOpenPlan}
      dir="rtl"
      className="w-full text-right rounded-3xl p-4 bg-gradient-to-l from-[#006d37]/10 to-[#10b981]/10 dark:from-emerald-950/40 dark:to-teal-950/40 border border-[#006d37]/30 cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all active:scale-[0.99]"
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-[#006d37] text-white flex items-center justify-center shadow-sm">
            <CalendarDays className="w-5 h-5" />
          </span>
          <div className="text-right">
            <p className="text-sm font-black text-[#1f1c0b] dark:text-gray-100">برنامج اليوم</p>
            <p data-testid="today-resume" className="text-[11px] text-[#506072] dark:text-gray-400">
              {daysLeft} يوماً قبل الامتحان · {jour.totalMinutes} دقيقة · أنجزت {terminees} من{' '}
              {jour.tasks.length}
            </p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-[#006d37] dark:text-[#2ecc71]">افتح الخطة</span>
      </div>

      {restantes.length === 0 ? (
        <p
          data-testid="today-termine"
          className="flex items-center gap-2 text-[12px] font-bold text-[#006d37] dark:text-[#2ecc71]"
        >
          <Check className="w-4 h-4" />
          أنهيت برنامج اليوم — أحسنت.
        </p>
      ) : (
        <ul className="space-y-1">
          {restantes.slice(0, 3).map((t) => (
            <li
              key={`${t.kind}:${t.refId}`}
              data-testid={`today-tache-${t.kind}:${t.refId}`}
              className="flex items-start gap-2 text-right"
            >
              <span className="shrink-0 w-3.5 h-3.5 mt-1 rounded border border-[#006d37]/50" />
              <span className="text-[12px] leading-6 text-[#1f1c0b] dark:text-gray-200">
                <span className="font-bold">{TASK_LABEL_AR[t.kind]}</span> · {t.minutes} د —{' '}
                {t.titleAr}
              </span>
            </li>
          ))}
          {restantes.length > 3 && (
            <li data-testid="today-reste" className="text-[11px] text-[#506072] dark:text-gray-400 text-right">
              و {restantes.length - 3} مهام أخرى اليوم.
            </li>
          )}
        </ul>
      )}
    </button>
  );
}
