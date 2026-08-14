// V3 — Modal événementiel du Coach proactif.
// Surgit en plein écran lors des moments clés du parcours : unité
// verrouillée cliquée, examen réussi (célébration), examen échoué
// (remédiation ciblée), retour après absence.

import { Lock, PartyPopper, AlertTriangle, Compass, Sparkles } from 'lucide-react';
import { MASCOT_URL } from '../data';
import type { CoachEventData } from '../services/coachEvents';

interface CoachEventModalProps {
  event: CoachEventData;
  onAction: (actionId: string) => void;
}

const TONE_STYLES: Record<CoachEventData['tone'], { badgeBg: string; badgeText: string; ring: string }> = {
  warn: { badgeBg: 'bg-[#fff3d6]', badgeText: 'text-[#b45309]', ring: 'border-[#ffb347]/50' },
  success: { badgeBg: 'bg-[#d9f5e3]', badgeText: 'text-[#006d37]', ring: 'border-[#2ecc71]/50' },
  info: { badgeBg: 'bg-[#e0ecff]', badgeText: 'text-[#1d4ed8]', ring: 'border-[#60a5fa]/40' },
};

function ToneIcon({ event }: { event: CoachEventData }) {
  if (event.kind === 'locked_unit') return <Lock className="w-6 h-6" />;
  if (event.kind === 'exam_passed') return <PartyPopper className="w-6 h-6" />;
  if (event.kind === 'diagnostic_passed') return <Sparkles className="w-6 h-6" />;
  if (event.kind === 'exam_failed') return <AlertTriangle className="w-6 h-6" />;
  return <Compass className="w-6 h-6" />;
}

export default function CoachEventModal({ event, onAction }: CoachEventModalProps) {
  const tone = TONE_STYLES[event.tone];

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex justify-center items-end md:items-center px-0 md:px-4"
      dir="rtl"
      data-testid="coach-event-modal"
      data-event-kind={event.kind}
    >
      <div className={`w-full md:max-w-lg bg-white dark:bg-[#141916] rounded-t-[28px] md:rounded-3xl shadow-2xl border-t-4 ${tone.ring} p-6 md:p-8`}>
        <div className="flex items-start gap-4">
          <img
            src={MASCOT_URL}
            alt="مرشد Kunz"
            className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shadow-sm bg-[#fff9ed] shrink-0"
          />
          <div className="min-w-0">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black ${tone.badgeBg} ${tone.badgeText}`}>
              <ToneIcon event={event} />
              {event.kind === 'locked_unit' && 'البوصلة'}
              {event.kind === 'exam_passed' && 'وحدة متقنة!'}
              {event.kind === 'diagnostic_passed' && 'اختبار تشخيصي ناجح'}
              {event.kind === 'exam_failed' && 'خطة المعالجة'}
              {event.kind === 'drill_done' && 'تدريب تصحيحي'}
              {event.kind === 'return_after_absence' && 'مرحباً بعودتك'}
            </span>
            <h2 className="mt-2 text-lg md:text-xl font-black text-[#1f1c0b] dark:text-white leading-snug">{event.titleAr}</h2>
          </div>
        </div>

        <p className="mt-4 text-sm md:text-base leading-8 text-[#506072] dark:text-gray-300">{event.messageAr}</p>

        {typeof event.percent === 'number' && (
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-2.5 rounded-full bg-[#f3f4f5] dark:bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full ${event.percent >= 80 ? 'bg-[#2ecc71]' : event.percent >= 50 ? 'bg-[#ffb347]' : 'bg-[#ef4444]'}`}
                style={{ width: `${Math.min(100, event.percent)}%` }}
              />
            </div>
            <span className="text-sm font-black text-[#1f1c0b] dark:text-white">{event.percent}%</span>
          </div>
        )}

        {event.weakTopicsAr && event.weakTopicsAr.length > 0 && (
          <div className="mt-4 rounded-2xl bg-[#fff9ed] dark:bg-[#1a221d] border border-[#e2dabf]/60 dark:border-white/10 p-4">
            <p className="text-xs font-black text-[#944a00] dark:text-[#ffd27a] mb-2">🎯 راجع هذه النقاط قبل الإعادة:</p>
            <ul className="space-y-1.5">
              {event.weakTopicsAr.map((topic) => (
                <li key={topic} className="flex items-center gap-2 text-sm font-bold text-[#1f1c0b] dark:text-gray-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff9a4a] shrink-0" />
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2">
          {event.actions.map((action) => (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              className={
                action.variant === 'ghost'
                  ? 'w-full py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-[#506072] dark:text-gray-300 text-sm font-black hover:bg-[#f8f9fa] dark:hover:bg-[#1a221d] transition-colors cursor-pointer'
                  : 'w-full py-3.5 rounded-2xl bg-gradient-to-br from-[#ffb347] to-[#ff9a4a] text-white text-sm font-black shadow-md hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer'
              }
            >
              {action.labelAr}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
