import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Sparkles, Play, RefreshCw, Zap, Clock } from 'lucide-react';
import {
  MOTIVATION_CAPSULES,
  capsulesParCategorie,
  type MotivationCapsule,
  type DeclicCategorie,
} from '../data/motivationCapsules';
import { playXPGainSound } from '../utils/audio';

// ─────────────────────────────────────────────────────────────────────────────
// Module « Déclic » — la brique MOTIVATION (SE MOTIVER).
// Affiché AVANT une session pour vaincre la procrastination et démarrer.
// 100 % hors-ligne, RTL arabe, compatible mode sombre.
// ─────────────────────────────────────────────────────────────────────────────

const LAST_ID_KEY = 'kunz_declic_last_id_v1';

interface MotivationDeclicProps {
  /** Série de jours en cours (pour cibler le message). Défaut 0. */
  streakDays?: number;
  /** Contexte facultatif : cible la catégorie du déclic. */
  contexte?: DeclicCategorie;
  /** Appelé quand l'élève clique « ابدأ الآن ». Branche-le sur ta session. */
  onStart?: () => void;
  /** Appelé si tu proposes le minuteur de focus (bouton secondaire). */
  onStartFocus?: () => void;
  isDarkMode?: boolean;
}

/** Tire un déclic au sort en évitant de répéter le dernier montré. */
function pickCapsule(pool: ReadonlyArray<MotivationCapsule>): MotivationCapsule {
  const lastId = (() => {
    try {
      return localStorage.getItem(LAST_ID_KEY);
    } catch {
      return null;
    }
  })();
  const candidats = pool.length > 1 ? pool.filter((c) => c.id !== lastId) : pool.slice();
  const choix = candidats[Math.floor(Math.random() * candidats.length)] ?? pool[0];
  try {
    localStorage.setItem(LAST_ID_KEY, choix.id);
  } catch {
    /* stockage indisponible → pas grave */
  }
  return choix;
}

export default function MotivationDeclic({
  streakDays = 0,
  contexte,
  onStart,
  onStartFocus,
  isDarkMode = false,
}: MotivationDeclicProps) {
  // Le pool dépend du contexte : streak élevé → messages « streak »,
  // sinon on suit le contexte fourni, à défaut « démarrage ».
  const pool = useMemo<ReadonlyArray<MotivationCapsule>>(() => {
    if (streakDays >= 3) {
      const s = capsulesParCategorie('streak');
      if (s.length) return s;
    }
    if (contexte) {
      const c = capsulesParCategorie(contexte);
      if (c.length) return c;
    }
    const dem = capsulesParCategorie('demarrage');
    return dem.length ? dem : MOTIVATION_CAPSULES;
  }, [streakDays, contexte]);

  const [capsule, setCapsule] = useState<MotivationCapsule>(() => pickCapsule(pool));

  const rafraichir = useCallback(() => {
    setCapsule(pickCapsule(pool));
  }, [pool]);

  const demarrer = useCallback(() => {
    try {
      playXPGainSound();
    } catch {
      /* son muet / indisponible */
    }
    onStart?.();
  }, [onStart]);

  return (
    <div dir="rtl" data-testid="motivation-declic" className="w-full max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={[
          'relative overflow-hidden rounded-3xl p-6 shadow-lg border',
          isDarkMode
            ? 'bg-gradient-to-br from-[#1e293b] to-[#0f172a] border-white/10 text-gray-100'
            : 'bg-gradient-to-br from-emerald-50 to-cyan-50 border-emerald-100 text-slate-800',
        ].join(' ')}
      >
        {/* halo décoratif */}
        <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />

        {/* En-tête */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500 text-white shadow">
              <Zap className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-extrabold leading-tight">لحظة تحفيز</h3>
              <p className={isDarkMode ? 'text-xs text-gray-400' : 'text-xs text-slate-500'}>
                خذ نفسًا… ثم ابدأ
              </p>
            </div>
          </div>

          {streakDays > 0 && (
            <span
              className={[
                'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold',
                isDarkMode ? 'bg-orange-500/15 text-orange-300' : 'bg-orange-100 text-orange-700',
              ].join(' ')}
            >
              <Flame className="h-3.5 w-3.5" />
              {streakDays} يوم
            </span>
          )}
        </div>

        {/* Message (change avec animation) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={capsule.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            className="min-h-[92px]"
          >
            <p className="text-lg font-bold leading-relaxed">{capsule.texteAr}</p>
            {capsule.astuceAr && (
              <p
                className={[
                  'mt-3 flex items-start gap-2 rounded-xl px-3 py-2 text-sm',
                  isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-white/70 text-slate-600',
                ].join(' ')}
              >
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{capsule.astuceAr}</span>
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={demarrer}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-extrabold text-white shadow transition hover:bg-emerald-700 active:scale-95"
          >
            <Play className="h-5 w-5" />
            ابدأ الآن
          </button>

          {onStartFocus && (
            <button
              type="button"
              onClick={onStartFocus}
              className={[
                'inline-flex items-center gap-2 rounded-2xl px-4 py-3 font-bold transition active:scale-95',
                isDarkMode
                  ? 'bg-white/10 text-gray-100 hover:bg-white/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200',
              ].join(' ')}
            >
              <Clock className="h-5 w-5" />
              جلسة تركيز
            </button>
          )}

          <button
            type="button"
            onClick={rafraichir}
            aria-label="رسالة أخرى"
            title="رسالة أخرى"
            className={[
              'ml-auto inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition active:scale-95',
              isDarkMode ? 'text-gray-300 hover:bg-white/10' : 'text-slate-500 hover:bg-white/60',
            ].join(' ')}
          >
            <RefreshCw className="h-4 w-4" />
            رسالة أخرى
          </button>
        </div>
      </motion.div>
    </div>
  );
}
