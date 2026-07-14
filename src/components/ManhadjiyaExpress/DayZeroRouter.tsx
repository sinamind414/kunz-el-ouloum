import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ArrowLeft, Compass } from 'lucide-react';
import {
  MANHADJIYA_MODULES,
  MANHADJIYA_DONE_KEY,
  type Lang,
} from '../../data/manhadjiyaModules';
import { useAuth } from '../../context/AuthContext';
import { Bi } from './BilingualSwitcher';
import DiagnosticInitial from './DiagnosticInitial';
import ModuleScreen from './ModuleScreen';
import CertificateModal from './CertificateModal';

interface DayZeroRouterProps {
  /** Appelé quand la formation est terminée (débloque l'app). */
  onComplete: () => void;
}

type Phase = 'welcome' | 'diagnostic' | 'modules' | 'certificate';

const LOIS = [
  { emoji: '🔎', ar: 'التعرف على الوثيقة' },
  { emoji: '📝', ar: 'الوصف' },
  { emoji: '🔬', ar: 'التحليل' },
  { emoji: '🧩', ar: 'التفسير' },
  { emoji: '🎯', ar: 'الفرضية' },
  { emoji: '⚖️', ar: 'المصادقة والتركيب + المخطط' },
];

/**
 * Routeur "Jour 0" — Formation Manhadjiya Express (49 min ≈ 45 min).
 * Verrouille l'app tant que kunz_manhadjiya_done n'est pas true.
 * 1 carte plein écran à la fois (pas de surcharge cognitive).
 */
export default function DayZeroRouter({ onComplete }: DayZeroRouterProps) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('welcome');
  const [lang] = useState<Lang>('ar');
  const [moduleIndex, setModuleIndex] = useState(0);
  const [totalXp, setTotalXp] = useState(0);

  const handleModuleValidated = (xp: number) => {
    setTotalXp((x) => x + xp);
    if (moduleIndex + 1 < MANHADJIYA_MODULES.length) {
      setModuleIndex((i) => i + 1);
    } else {
      setPhase('certificate');
    }
  };

  const finish = () => {
    try { localStorage.setItem(MANHADJIYA_DONE_KEY, 'true'); } catch { /* offline-first */ }
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-gradient-to-b from-[#003d1e] via-[#00562b] to-[#00140a] overflow-y-auto">
      {/* Barre supérieure : marque */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-black/10 backdrop-blur-sm">
        <span className="flex items-center gap-1.5 text-white font-black text-sm">
          <Compass className="w-5 h-5 text-[#fed65b]" /> منهجية إكسبريس
        </span>
      </div>

      <div className="px-4 py-6 md:py-10 min-h-[calc(100%-56px)] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* ── Écran 0 : Bienvenue ── */}
          {phase === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-lg text-center text-white"
            >
              <div className="w-20 h-20 mx-auto rounded-3xl bg-white/10 border border-white/15 flex items-center justify-center mb-5">
                <ShieldCheck className="w-10 h-10 text-[#fed65b]" />
              </div>
              <h1 className="text-3xl font-black leading-tight">
                <Bi ar="6 قوانين ذهبية Kunz El Ouloum" fr="Les 6 lois d'or de Kunz El Ouloum" lang={lang} />
              </h1>
              <p className="text-white/85 leading-8 mt-4 text-sm">
                <Bi
                  ar="بدونها، حتى لو حفظت الدرس، ستحصل على 0. 45 دقيقة وتصبح جاهزا. الطالب الذي لا يعرف المنهجية يعتبر 0 في البكالوريا، وهذا التكوين يجعله غير 0 في 45 دقيقة."
                  fr="Sans elles, même en ayant appris la leçon tu es à 0. 45 min et tu deviens opérationnel. Un élève sans méthode est à 0 au BAC ; cette formation le sort du 0 en 45 min."
                  lang={lang}
                />
              </p>

              {/* Aperçu des 6 lois */}
              <div className="grid grid-cols-2 gap-2 mt-6 text-right">
                {LOIS.map((l, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/10 rounded-2xl p-3">
                    <span className="text-xl">{l.emoji}</span>
                    <span className="text-xs font-bold" dir="rtl">{l.ar}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setPhase('diagnostic')}
                className="mt-7 w-full rounded-2xl bg-[#fed65b] text-[#00311a] font-black py-4 text-sm hover:brightness-105 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Bi ar="ابدأ الآن" fr="Commencer" lang={lang} />
                <ArrowLeft className="w-4 h-4" />
              </button>
              <p className="text-white/50 text-[11px] mt-3">
                <Bi ar="خطوة إلزامية لمرة واحدة" fr="Étape obligatoire, une seule fois" lang={lang} />
              </p>
            </motion.div>
          )}

          {/* ── Écran 2 : Diagnostic ── */}
          {phase === 'diagnostic' && (
            <motion.div
              key="diagnostic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <DiagnosticInitial lang={lang} onDone={() => setPhase('modules')} />
            </motion.div>
          )}

          {/* ── Formation : 7 modules séquentiels ── */}
          {phase === 'modules' && (
            <motion.div
              key={`module-${moduleIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <ModuleScreen
                module={MANHADJIYA_MODULES[moduleIndex]}
                index={moduleIndex}
                total={MANHADJIYA_MODULES.length}
                lang={lang}
                onValidated={handleModuleValidated}
              />
            </motion.div>
          )}

          {/* ── Certificat ── */}
          {phase === 'certificate' && (
            <motion.div
              key="certificate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <CertificateModal lang={lang} totalXp={totalXp} studentName={user?.name} onEnter={finish} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
