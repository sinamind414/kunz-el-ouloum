import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw, SkipForward, Coffee, Brain, Settings2, Check } from 'lucide-react';
import { playDailyGoalCelebrationSound, playXPGainSound } from '../utils/audio';

// ─────────────────────────────────────────────────────────────────────────────
// FocusTimer — minuteur de concentration type « Pomodoro » (المؤقّت / بومودورو).
// Brique MOTIVATION : alterne travail intense / pause pour tenir la durée.
// 100 % hors-ligne, RTL arabe, mode sombre. Aucune dépendance externe.
//
// Intégration :
//   <FocusTimer isDarkMode={isDarkMode} onFocusComplete={(min) => addStudyMinutes(min)} />
// `onFocusComplete` reçoit les minutes de focus terminées — branche-le sur ton
// objectif quotidien (DailyGoalConfig.todayMinutes) pour créditer le temps.
// ─────────────────────────────────────────────────────────────────────────────

type Phase = 'focus' | 'pause';

interface Preset {
  labelAr: string;
  focusMin: number;
  breakMin: number;
}

const PRESETS: ReadonlyArray<Preset> = [
  { labelAr: 'كلاسيكي', focusMin: 25, breakMin: 5 },
  { labelAr: 'عميق', focusMin: 50, breakMin: 10 },
  { labelAr: 'قصير', focusMin: 15, breakMin: 3 },
];

const STORE_KEY = 'kunz_focus_v1';

interface FocusStore {
  date: string; // YYYY-MM-DD
  sessions: number; // sessions de focus terminées aujourd'hui
  minutes: number; // minutes de focus cumulées aujourd'hui
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadStore(): FocusStore {
  const empty: FocusStore = { date: todayKey(), sessions: 0, minutes: 0 };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return empty;
    const j = JSON.parse(raw) as Partial<FocusStore>;
    if (j.date !== todayKey()) return empty; // nouveau jour → remise à zéro
    return {
      date: todayKey(),
      sessions: typeof j.sessions === 'number' ? j.sessions : 0,
      minutes: typeof j.minutes === 'number' ? j.minutes : 0,
    };
  } catch {
    return empty;
  }
}

function saveStore(s: FocusStore): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(s));
  } catch {
    /* stockage indisponible */
  }
}

function mmss(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface FocusTimerProps {
  /** Crédité en minutes à chaque phase de focus terminée. */
  onFocusComplete?: (minutes: number) => void;
  isDarkMode?: boolean;
}

export default function FocusTimer({ onFocusComplete, isDarkMode = false }: FocusTimerProps) {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [phase, setPhase] = useState<Phase>('focus');
  const [remaining, setRemaining] = useState<number>(PRESETS[0].focusMin * 60);
  const [running, setRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [store, setStore] = useState<FocusStore>(() => loadStore());

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseTotal = phase === 'focus' ? preset.focusMin * 60 : preset.breakMin * 60;

  // Demande (best-effort) la permission de notification une fois.
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const notify = useCallback((title: string, body: string) => {
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(title, { body });
      }
    } catch {
      /* notifications indisponibles */
    }
  }, []);

  // Fin d'une phase : bascule focus↔pause, crédite le temps, joue un son.
  const handlePhaseEnd = useCallback(() => {
    if (phase === 'focus') {
      const gained = preset.focusMin;
      const next: FocusStore = {
        date: todayKey(),
        sessions: store.sessions + 1,
        minutes: store.minutes + gained,
      };
      setStore(next);
      saveStore(next);
      onFocusComplete?.(gained);
      try {
        playDailyGoalCelebrationSound();
      } catch {
        /* muet */
      }
      notify('أحسنت! 🎯', `أنهيت جلسة تركيز (${gained} دقيقة). خذ استراحة.`);
      setPhase('pause');
      setRemaining(preset.breakMin * 60);
    } else {
      try {
        playXPGainSound();
      } catch {
        /* muet */
      }
      notify('انتهت الاستراحة ☕', 'جاهز لجلسة تركيز جديدة؟');
      setPhase('focus');
      setRemaining(preset.focusMin * 60);
    }
    setRunning(false); // l'élève relance sciemment la phase suivante
  }, [phase, preset, store, onFocusComplete, notify]);

  // Boucle du minuteur.
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          // décalage micro-tâche pour éviter setState pendant le tick
          setTimeout(handlePhaseEnd, 0);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, handlePhaseEnd]);

  const toggle = useCallback(() => setRunning((v) => !v), []);

  const reset = useCallback(() => {
    setRunning(false);
    setRemaining(phase === 'focus' ? preset.focusMin * 60 : preset.breakMin * 60);
  }, [phase, preset]);

  const skip = useCallback(() => {
    setRunning(false);
    if (phase === 'focus') {
      setPhase('pause');
      setRemaining(preset.breakMin * 60);
    } else {
      setPhase('focus');
      setRemaining(preset.focusMin * 60);
    }
  }, [phase, preset]);

  const applyPreset = useCallback((p: Preset) => {
    setPreset(p);
    setPhase('focus');
    setRunning(false);
    setRemaining(p.focusMin * 60);
    setShowSettings(false);
  }, []);

  // Anneau de progression SVG.
  const R = 84;
  const CIRC = 2 * Math.PI * R;
  const progress = phaseTotal > 0 ? 1 - remaining / phaseTotal : 0;
  const dashOffset = useMemo(() => CIRC * (1 - progress), [CIRC, progress]);

  const isFocus = phase === 'focus';
  const accent = isFocus ? '#059669' : '#0891b2'; // emerald / cyan

  return (
    <div dir="rtl" data-testid="focus-timer" className="w-full max-w-md mx-auto">
      <div
        className={[
          'rounded-3xl p-6 shadow-lg border',
          isDarkMode ? 'bg-[#1e293b] border-white/10 text-gray-100' : 'bg-white border-slate-200 text-slate-800',
        ].join(' ')}
      >
        {/* En-tête + phase */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="grid h-10 w-10 place-items-center rounded-2xl text-white shadow"
              style={{ backgroundColor: accent }}
            >
              {isFocus ? <Brain className="h-5 w-5" /> : <Coffee className="h-5 w-5" />}
            </span>
            <div>
              <h3 className="text-base font-extrabold leading-tight">
                {isFocus ? 'وقت التركيز' : 'وقت الاستراحة'}
              </h3>
              <p className={isDarkMode ? 'text-xs text-gray-400' : 'text-xs text-slate-500'}>
                {preset.labelAr} · {preset.focusMin}/{preset.breakMin} دقيقة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSettings((v) => !v)}
            aria-label="إعدادات المؤقّت"
            className={[
              'rounded-xl p-2 transition',
              isDarkMode ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-slate-100 text-slate-500',
            ].join(' ')}
          >
            <Settings2 className="h-5 w-5" />
          </button>
        </div>

        {/* Choix de preset */}
        {showSettings && (
          <div className="mb-4 grid grid-cols-3 gap-2">
            {PRESETS.map((p) => {
              const active = p.labelAr === preset.labelAr;
              return (
                <button
                  key={p.labelAr}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={[
                    'rounded-xl px-2 py-2 text-sm font-bold transition',
                    active
                      ? 'text-white'
                      : isDarkMode
                        ? 'bg-white/5 text-gray-200 hover:bg-white/10'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                  ].join(' ')}
                  style={active ? { backgroundColor: accent } : undefined}
                >
                  {p.labelAr}
                  <span className="block text-[11px] font-medium opacity-80">
                    {p.focusMin}/{p.breakMin}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Anneau + compte à rebours */}
        <div className="relative mx-auto grid place-items-center" style={{ width: 200, height: 200 }}>
          <svg width={200} height={200} className="-rotate-90">
            <circle
              cx={100}
              cy={100}
              r={R}
              fill="none"
              strokeWidth={12}
              stroke={isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}
            />
            <motion.circle
              cx={100}
              cy={100}
              r={R}
              fill="none"
              strokeWidth={12}
              strokeLinecap="round"
              stroke={accent}
              strokeDasharray={CIRC}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ ease: 'linear', duration: 0.4 }}
            />
          </svg>
          <div className="absolute text-center">
            <div className="text-4xl font-black tabular-nums tracking-tight">{mmss(remaining)}</div>
            <div className={isDarkMode ? 'text-xs text-gray-400' : 'text-xs text-slate-500'}>
              {isFocus ? 'ركّز الآن' : 'استرح قليلًا'}
            </div>
          </div>
        </div>

        {/* Contrôles */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            aria-label="إعادة"
            className={[
              'rounded-2xl p-3 transition active:scale-95',
              isDarkMode ? 'bg-white/10 text-gray-200 hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            ].join(' ')}
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center gap-2 rounded-2xl px-8 py-3 font-extrabold text-white shadow transition active:scale-95"
            style={{ backgroundColor: accent }}
          >
            {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            {running ? 'إيقاف مؤقّت' : 'ابدأ'}
          </button>

          <button
            type="button"
            onClick={skip}
            aria-label="تخطّي"
            className={[
              'rounded-2xl p-3 transition active:scale-95',
              isDarkMode ? 'bg-white/10 text-gray-200 hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            ].join(' ')}
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        {/* Bilan du jour */}
        <div
          className={[
            'mt-6 flex items-center justify-center gap-6 rounded-2xl py-3 text-sm',
            isDarkMode ? 'bg-white/5' : 'bg-slate-50',
          ].join(' ')}
        >
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-500" />
            <span className="font-bold">{store.sessions}</span>
            <span className={isDarkMode ? 'text-gray-400' : 'text-slate-500'}>جلسة اليوم</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4" style={{ color: accent }} />
            <span className="font-bold">{store.minutes}</span>
            <span className={isDarkMode ? 'text-gray-400' : 'text-slate-500'}>دقيقة تركيز</span>
          </div>
        </div>
      </div>
    </div>
  );
}
