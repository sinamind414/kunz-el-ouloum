// CleVivante.tsx — « المفتاح الحيّ » : la clé à quatre dents interactive.
// Design audité (audit 8 axes, page MiftahStage) → adapté aux couleurs / RTL / APK de Kunz El Ouloum.
// Configuration de l'audit :
//   • clé SVG viewBox 240×84 : anneau + tige + 4 dents vers le bas (y=47), la dent active grandit ;
//   • dents = ASNAN (miftahSpec) : فعل · دليل · علاقة · جواب, icônes 🔍 🔑 🔄 🔓 ;
//   • verbe → dents : descriptif [1,2,4] · raisonné [1,2,3,4] · عَرِّف [1,4] (miftahLab VERBES_DEMO) ;
//   • panneau verbe : famille (📷 صورة / 🎬 فيلم / 🔨 حدّاد) + porte قفل + source + attendu.
// « La dent brille » (demande owner 2026-11-13, design MiftahStage) :
//   • clic sur le MOT (pilule) → la dent correspondante S'ILLUMINE : halo doré
//     flou qui pulse derrière elle + lueur collée (feDropShadow) + crème lumineux
//     (#f2dcae) pour la dent focale — comme dans la page d'audit ;
//   • les dents de la clé sont aussi cliquables directement (= clic sur le mot).
// Interaction bidirectionnelle :
//   • clic sur une dent → la dent grandit sur la clé + les verbes qui l'utilisent réagissent ;
//   • clic sur un verbe → les dents qu'il utilise s'allument sur la clé + son panneau s'affiche.
// Fichier non protégé — modifiable sans validation AGENTS.md.

import { useMemo, useState, useId } from 'react';
import { motion } from 'motion/react';
import { KeyRound, CircleCheck, X, Lock, Brain } from 'lucide-react';
import {
  DENTS,
  VERBES_CLE,
  type Dent,
  type VerbeCle,
} from '../data/cleVivante';
import { VERB_CARDS } from '../data/methodologyEngine';
// Version de la fiche — source unique miftahSpec (zéro littéral de version ici).
import { MIFTAH_VERSION } from '../data/miftahSpec';

const GOLD = '#c08a1f';
const GOLD_D = '#765108';
const GOLD_STROKE = '#3d2a05';

// ------------------------------------------------------------------
// Clé SVG à 4 dents — configuration de l'audit (MiftahStage), contraste crème.
// Les dents pendent sous la tige (y=47) ; une dent allumée grandit vers le bas.
// ------------------------------------------------------------------
interface CleSvgProps {
  /** Dents allumées (utilisées par le verbe sélectionné, ou la dent cliquée). */
  activeDents: number[];
  /** Dent cliquée → grandit le plus et son halo pulse. */
  focusDent?: number | null;
  /** Sélection directe : cliquer une dent de la clé = cliquer son mot. */
  onSelectDent?: (id: number) => void;
}

const DENT_CLAIRE = '#f2dcae'; // crème lumineux — dent focale (audit : signal-200)

export function CleSvg({ activeDents, focusDent, onSelectDent }: CleSvgProps) {
  // useId contient « : » → assaini pour un id exploitable dans url(#…).
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const haloId = `cle-halo-${uid}`;
  const lueurId = `cle-lueur-${uid}`;

  return (
    <div className="flex items-center justify-center" aria-label="Clé à quatre dents">
      <svg viewBox="0 0 240 84" className="h-[72px] w-full max-w-[268px]">
        <defs>
          {/* Halo flou derrière la dent allumée — c'est lui qui « brille ». */}
          <filter id={haloId} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2.6" />
          </filter>
          {/* Lueur dorée collée au contour de la dent. */}
          <filter id={lueurId} x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.2" floodColor={GOLD} floodOpacity="0.85" />
          </filter>
        </defs>

        {/* Anneau (tête de clé) */}
        <circle cx="26" cy="42" r="20" fill="none" stroke={GOLD} strokeWidth="6" />
        <circle cx="26" cy="42" r="7" fill={GOLD} opacity="0.55" />
        {/* Tige */}
        <rect x="46" y="37" width="164" height="10" rx="2" fill={GOLD} opacity="0.9" />

        {/* 4 dents — éteintes bronze, allumées dorées + halo pulsant */}
        {[0, 1, 2, 3].map((i) => {
          const id = i + 1;
          const allumee = activeDents.includes(id);
          const focale = focusDent === id;
          const h = focale ? 30 : allumee ? 24 : 18;
          return (
            <g
              key={id}
              data-dent={id}
              onClick={onSelectDent ? () => onSelectDent(id) : undefined}
              className={onSelectDent ? 'cursor-pointer' : undefined}
              role={onSelectDent ? 'button' : undefined}
              aria-label={onSelectDent ? `Sélectionner la dent ${id}` : undefined}
            >
              {allumee && (
                <motion.rect
                  data-testid={`halo-dent-${id}`}
                  data-halo={id}
                  x={70 + i * 34 - 3}
                  y={47 - 2}
                  width={22}
                  height={h + 4}
                  rx="4"
                  fill={GOLD}
                  filter={`url(#${haloId})`}
                  initial={false}
                  animate={{ opacity: focale ? [0.95, 0.4, 0.95] : 0.55 }}
                  transition={
                    focale
                      ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
                      : { duration: 0.2 }
                  }
                />
              )}
              <motion.rect
                data-testid={`dent-${id}`}
                data-brille={allumee ? 'true' : 'false'}
                x={70 + i * 34}
                y={47}
                width={16}
                height={h}
                rx="2"
                fill={focale ? DENT_CLAIRE : allumee ? GOLD : GOLD_D}
                opacity={allumee ? 1 : 0.85}
                stroke={allumee ? GOLD_STROKE : 'none'}
                strokeWidth="1.5"
                filter={allumee ? `url(#${lueurId})` : undefined}
                initial={false}
                animate={{ height: h }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              />
            </g>
          );
        })}
        <text x="196" y="33" fontSize="10" fill="#1a4636" fontFamily="IBM Plex Mono, monospace">
          V{MIFTAH_VERSION}
        </text>
      </svg>
    </div>
  );
}

// ------------------------------------------------------------------
// Pilule dent
// ------------------------------------------------------------------
interface DentPillProps {
  d: Dent;
  active: boolean;
  used: boolean;
  onClick: () => void;
}

function DentPill({ d, active, used, onClick }: DentPillProps) {
  const style = active
    ? 'border-[#c08a1f] bg-[#f2dcae]/25'
    : used
      ? 'border-[#0e6b6b] bg-[#0e6b6b]/10'
      : 'border-gray-300 bg-white/60 dark:border-gray-700 dark:bg-[#1a201c]/60 hover:border-[#c08a1f]/70';
  const tone = active
    ? 'text-[#006d37] dark:text-[#2ecc71]'
    : used
      ? 'text-[#0e6b6b] dark:text-[#5eead4]'
      : 'text-gray-400';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 transition-all active:scale-[0.98] touch-manipulation ${style}`}
      aria-pressed={active}
    >
      <span className={`text-lg leading-none ${tone}`}>{d.iconAr}</span>
      <span className={`text-[10px] font-black leading-none ${tone}`}>{d.nameAr}</span>
      <span className="text-[9px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
        {d.nameFr}
      </span>
    </button>
  );
}

// ------------------------------------------------------------------
// Pilule verbe
// ------------------------------------------------------------------
interface VerbePillProps {
  v: VerbeCle;
  active: boolean;
  /**
   * Position du verbe face à la dent cliquée :
   *   • 'utilise' → s'allume en teal (il a besoin de cette dent) ;
   *   • 'ecarte'  → estompé + barré + ✕ (il n'en a pas besoin — légende) ;
   *   • 'neutre'  → aucune dent cliquée, aucun marquage.
   */
  etatDent: 'utilise' | 'ecarte' | 'neutre';
  onHover: (id: string | null) => void;
  onClick: () => void;
}

function VerbePill({ v, active, etatDent, onHover, onClick }: VerbePillProps) {
  const activeStyle = active
    ? 'bg-[#f2dcae]/25 border-[#c08a1f] text-[#006d37] dark:text-[#2ecc71]'
    : etatDent === 'utilise'
      ? 'bg-[#0e6b6b]/10 border-[#0e6b6b] text-[#0e6b6b] dark:text-[#5eead4]'
      : 'bg-white/60 border-gray-300 dark:border-gray-700 dark:bg-[#1a201c]/60 text-gray-500 dark:text-gray-400';
  const ecarte = etatDent === 'ecarte';

  return (
    <motion.button
      type="button"
      initial={false}
      animate={{ opacity: etatDent === 'utilise' || active ? 1 : ecarte ? 0.4 : 0.75 }}
      data-ecarte={ecarte ? 'true' : undefined}
      onClick={onClick}
      onMouseEnter={() => onHover(v.id)}
      onMouseLeave={() => onHover(null)}
      className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2 text-right transition-all active:scale-[0.98] touch-manipulation ${activeStyle} ${ecarte ? 'line-through' : ''}`}
    >
      <span className="text-sm font-bold">{v.verbAr}</span>
      <span className="hidden text-[9px] shrink-0 md:inline-block">{v.verbFr}</span>
      {active && <CircleCheck className="w-3.5 h-3.5 shrink-0" />}
      {ecarte && <X className="w-3.5 h-3.5 shrink-0" />}
    </motion.button>
  );
}

// ------------------------------------------------------------------
// Carte d'information de dent (actionAr / correctorAr — ASNAN verbatim)
// ------------------------------------------------------------------
interface DentInfoProps {
  d: Dent;
}

function DentInfo({ d }: DentInfoProps) {
  return (
    <div className="rounded-xl border border-[#ebd6a0] bg-[#fff8e8] dark:bg-[#3a2c14]/30 dark:border-[#c08a1f]/30 p-4">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#765108] dark:text-[#ffd27a]">
          dent {d.id} · {d.nameFr}
        </span>
        <span className="ar text-lg font-black" style={{ color: GOLD_D }}>
          {d.iconAr} {d.nameAr}
        </span>
      </div>
      <p className="ar mb-3 text-base font-bold leading-7 text-gray-900 dark:text-gray-100" dir="rtl">
        {d.actionAr}
      </p>
      <p className="ar border-l-2 border-[#c08a1f]/40 pl-3 text-[12px] leading-6 text-gray-700 dark:text-gray-300" dir="rtl">
        {d.correctorAr}
      </p>
      {'noteAr' in d && d.noteAr && (
        <p className="ar mt-2 text-[12px] leading-6 text-[#006d37] dark:text-[#2ecc71]" dir="rtl">
          {d.noteAr}
        </p>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Panneau verbe sélectionné — configuration de l'audit :
// famille · porte قفل · source · attendu (goal du VERB_CARD).
// ------------------------------------------------------------------
interface VerbePanelProps {
  v: VerbeCle;
}

const SOURCE_AR: Record<VerbeCle['source'], string> = {
  document: '📄 وثيقة',
  mixte: '📄 + 🧠 مختلط',
  connaissances: '🧠 معرفة',
};

function VerbePanel({ v }: VerbePanelProps) {
  const carte = VERB_CARDS.find((c) => c.id === v.id);
  return (
    <div className="mt-3 rounded-xl border border-[#ebd6a0] bg-[#fff8e8] dark:bg-[#3a2c14]/30 dark:border-[#c08a1f]/30 p-3.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="ar text-base font-black text-gray-900 dark:text-white">{v.verbAr}</span>
        <span className="text-[9px] font-black uppercase tracking-wider text-[#765108] dark:text-[#ffd27a]">
          {v.id}
        </span>
      </div>
      <div className="ar mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-700 dark:text-gray-300" dir="rtl">
        <span>{v.familleAr}</span>
        <span className="inline-flex items-center gap-1">
          {v.qafal ? <Lock className="w-3 h-3" /> : <Brain className="w-3 h-3" />}
          {v.qafal ? 'قفل (وثيقة)' : 'لا قفل → دُرج المعرفة'}
        </span>
        <span>{SOURCE_AR[v.source]}</span>
      </div>
      {carte?.goal && (
        <p className="ar border-l-2 border-[#0e6b6b]/50 pl-3 text-[12px] leading-6 text-gray-700 dark:text-gray-300" dir="rtl">
          {carte.goal}
        </p>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Composant principal : la clé vivante sur deux colonnes
// ------------------------------------------------------------------
export function CleVivante() {
  const [activeDent, setActiveDent] = useState<number | null>(null); // dent cliquée
  const [verbeId, setVerbeId] = useState<string | null>(null);       // verbe sélectionné (clic, persistant)
  const [survolId, setSurvolId] = useState<string | null>(null);     // verbe survolé (aperçu)

  const verbeSelect = useMemo(
    () => (verbeId ? VERBES_CLE.find((x) => x.id === verbeId) ?? null : null),
    [verbeId]
  );
  // L'aperçu ne sert que si aucun verbe n'est sélectionné (sinon le survol écrase la sélection).
  const verbeSurvol = useMemo(
    () => (!verbeId && survolId ? VERBES_CLE.find((x) => x.id === survolId) ?? null : null),
    [verbeId, survolId]
  );
  const verbeActif = verbeSelect ?? verbeSurvol;

  // Dents allumées sur la clé :
  //   • verbe sélectionné/survolé → ses dents ; sinon dent cliquée → cette dent.
  const activeDents = useMemo(() => {
    if (verbeActif) return verbeActif.dents;
    return activeDent ? [activeDent] : [];
  }, [verbeActif, activeDent]);

  // Dent affichée dans la carte d'info : dent cliquée, sinon 1re dent du verbe actif.
  const dentInfo = useMemo(() => {
    if (activeDent) return DENTS.find((d) => d.id === activeDent) ?? DENTS[0];
    return DENTS.find((d) => d.id === activeDents[0]) ?? DENTS[0];
  }, [activeDent, activeDents]);

  // Le filament (dimming) est porté par etatDent de chaque verbe (utilisé / écarté).

  return (
    <section
      id="cle-vivante"
      className="relative overflow-hidden rounded-2xl border border-[#ebd6a0] bg-gradient-to-br from-[#fff8e8] to-white dark:from-[#3a2c14]/20 dark:to-[#141916] dark:border-[#c08a1f]/30"
    >
      <div className="relative p-4 md:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_D})` }}>
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">المفتاح الحيّ</h3>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#765108] dark:text-[#ffd27a]">
                فعل · دليل · علاقة · جواب
              </p>
            </div>
          </div>
          <div className="text-[9px] text-gray-500 dark:text-gray-400">
            {verbeSelect
              ? `الفعل ${verbeSelect.verbAr} · ${activeDents.length} أسنان`
              : activeDent
                ? `السِنّ ${dentInfo.nameAr} · ${VERBES_CLE.filter((v) => v.dents.includes(activeDent)).length} أفعال`
                : verbeSurvol
                  ? `معاينة: ${verbeSurvol.verbAr}`
                  : 'اضغط على سِنّ أو فعل'}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Colonne gauche : la clé + les 4 dents */}
          <div className="space-y-3.5">
            <CleSvg
              activeDents={activeDents}
              focusDent={activeDent}
              onSelectDent={(id) => { setActiveDent(id); setVerbeId(null); setSurvolId(null); }}
            />

            <div className="flex flex-wrap gap-1.5" role="group" aria-label="الأسنان الأربعة">
              {DENTS.map((d) => (
                <DentPill
                  key={d.id}
                  d={d}
                  active={activeDent === d.id}
                  used={activeDent === null && activeDents.includes(d.id)}
                  onClick={() => { setActiveDent(d.id); setVerbeId(null); setSurvolId(null); }}
                />
              ))}
            </div>

            <DentInfo d={dentInfo} />
          </div>

          {/* Colonne droite : les 12 verbes + panneau du verbe sélectionné */}
          <div>
            <div className="mb-2.5 flex items-center gap-1.5">
              <span className="ar text-sm font-black text-gray-900 dark:text-white">الأفعال</span>
              <span className="rounded-full bg-[#0e6b6b]/10 px-2 py-0.5 text-[9px] font-black text-[#0e6b6b] dark:text-[#5eead4]">
                {VERBES_CLE.length} فعل
              </span>
            </div>

            <div className="space-y-1.5" role="group" aria-label="قائمة الأفعال">
              {VERBES_CLE.map((v) => {
                // Face à la dent cliquée : utilise → teal ; sinon écarté (✕ + barré) ;
                // sans dent cliquée (ou aperçu au survol) → neutre.
                const etatDent: 'utilise' | 'ecarte' | 'neutre' =
                  activeDent !== null
                    ? v.dents.includes(activeDent)
                      ? 'utilise'
                      : 'ecarte'
                    : 'neutre';
                return (
                  <VerbePill
                    key={v.id}
                    v={v}
                    active={verbeSelect?.id === v.id}
                    etatDent={etatDent}
                    onHover={setSurvolId}
                    onClick={() => { setActiveDent(null); setVerbeId(v.id); }}
                  />
                );
              })}
            </div>

            {verbeSelect && <VerbePanel v={verbeSelect} />}

            <div className="mt-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-[#1a201c]/40 p-2.5 text-[9px] text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CircleCheck className="w-3 h-3 text-[#006d37] dark:text-[#2ecc71]" />
                <span>الأسنان المضيئة على المفتاح = التي يستخدمها الفعل</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <X className="w-3 h-3" />
                <span>المبسوطة = التي لا يحتاجها</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CleVivante;
