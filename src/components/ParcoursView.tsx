// src/components/ParcoursView.tsx
// مسار تعلمك — vue du chemin linéaire + tâche du jour (NBA).
//
// Design porté de la proposition OPUS 5.5 (carte NBA en tête, bandeaux de
// domaine → cartes d'unité → rangées d'items avec pips de phase), mappé sur la
// charte de l'app : palette #006d37 / #fff9ed / #e2dabf, police Noto Kufi
// Arabic, support du mode sombre. Les icônes de rubriques viennent de lucide.

import { useCallback, useState } from 'react';
import { Check, Lock, NotebookPen, Route as RouteIcon, Sparkles } from 'lucide-react';
import {
  PARCOURS_DOMAINS,
  type LessonKind,
  type ParcoursItem,
} from '../lib/parcours/parcoursPath';
import {
  allowance,
  domainProgress,
  itemStatus,
  loadParcours,
  markStarted,
  parcoursProgress,
  resetParcours,
  todaysCompletions,
  unitProgress,
  type ParcoursItemStatus,
} from '../lib/parcours/parcoursProgress';
import { nbaEyebrow, nextBestAction } from '../lib/parcours/nbaEngine';

interface ParcoursProps {
  /** Ouvre une leçon (clé + nature + unité) — câblé sur LessonsView. */
  onOpenLesson: (lessonKey: string, kind: LessonKind, unitId: number) => void;
  /** Ouvre les QCM du livre officiel d'une unité — câblé sur l'onglet leçon (mode qcm). */
  onOpenQcm: (unitId: number) => void;
}

// ---------- Tons des statuts (charte de l'app, mode sombre inclus) ----------
const TONE: Record<
  ParcoursItemStatus,
  { row: string; circle: string; text: string; label: string }
> = {
  done: {
    row: 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-900/50',
    circle: 'bg-[#006d37] text-white',
    text: 'text-gray-800 dark:text-gray-200',
    label: 'تم',
  },
  current: {
    row: 'bg-white dark:bg-[#1a211c] border-[#006d37] ring-1 ring-[#006d37]/40',
    circle: 'border-2 border-[#006d37] text-[#006d37] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-gray-900 dark:text-gray-100 font-bold',
    label: 'حالياً',
  },
  available: {
    row: 'bg-white dark:bg-[#1a211c] border-[#e2dabf] dark:border-gray-800',
    circle: 'border-2 border-[#c9b98f] dark:border-gray-600 text-[#944a00] dark:text-amber-300 bg-[#fff9ed] dark:bg-[#241d10]',
    text: 'text-gray-800 dark:text-gray-200',
    label: '',
  },
  locked: {
    row: 'bg-gray-50/60 dark:bg-gray-900/20 border-gray-200/70 dark:border-gray-800/60',
    circle: 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600',
    text: 'text-gray-400 dark:text-gray-600',
    label: '',
  },
};

function StatusCircle({ status, index }: { status: ParcoursItemStatus; index: number }) {
  if (status === 'done') {
    return (
      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${TONE.done.circle}`}>
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
    );
  }
  if (status === 'locked') {
    return (
      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${TONE.locked.circle}`}>
        <Lock className="h-3.5 w-3.5" />
      </span>
    );
  }
  if (status === 'current') {
    return (
      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${TONE.current.circle}`}>
        <span className="h-2.5 w-2.5 rounded-full bg-[#006d37] dark:bg-emerald-300" />
      </span>
    );
  }
  return (
    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black ${TONE.available.circle}`}>
      {index}
    </span>
  );
}

// ---------- Pips de phase (4 segments, comme OPUS 5.5) ----------
function Pips({ done, current }: { done: boolean; current: boolean }) {
  return (
    <span className="flex shrink-0 items-end gap-[3px]" aria-hidden>
      {[0, 1, 2, 3].map((k) => {
        const filled = done || (current && k === 0);
        return (
          <span
            key={k}
            className={`w-[3px] rounded-full transition-colors ${
              filled
                ? 'bg-[#006d37] dark:bg-emerald-400'
                : current
                ? 'bg-[#944a00]/50 dark:bg-amber-400/40'
                : 'bg-gray-300 dark:bg-gray-700'
            }`}
            style={{ height: `${8 + k * 3}px` }}
          />
        );
      })}
    </span>
  );
}

// ---------- Carte NBA (tâche du jour) ----------
function NbaCard({ onOpenLesson, onOpenQcm }: ParcoursProps) {
  const state = loadParcours();
  const action = nextBestAction(state);

  if (action.type === 'rest') {
    return (
      <section
        data-testid="parcours-nba"
        className="rounded-[24px] border border-[#e2dabf] dark:border-gray-800 bg-gradient-to-l from-[#006d37] to-[#0a8f47] p-5 text-white shadow-sm"
      >
        <p className="text-[11px] font-bold text-emerald-100/90">{nbaEyebrow(action)}</p>
        <h2 className="mt-1.5 text-lg font-black leading-relaxed">
          {action.reason === 'quota'
            ? 'أنجزت مهمة اليوم. عُد غداً للمتابعة — التكرار أهم من الكمية.'
            : 'أتممت كل المسار. هذا إنجاز حقيقي.'}
        </h2>
        <p className="mt-2 text-xs leading-6 text-emerald-50/90">
          {todaysCompletions(state)} / {allowance(state)} مهمة اليوم
        </p>
      </section>
    );
  }

  const { item } = action;
  const unit = PARCOURS_DOMAINS.flatMap((d) => d.units).find((u) => u.unitId === item.unitId);
  const ouvrir = () => {
    if (item.kind === 'jalon') {
      onOpenQcm(item.unitId);
    } else if (item.lessonKey) {
      onOpenLesson(item.lessonKey, item.lessonKind ?? 'html', item.unitId);
    }
  };

  return (
    <section
      data-testid="parcours-nba"
      className="rounded-[24px] border border-[#e2dabf] dark:border-gray-800 bg-gradient-to-l from-[#006d37] to-[#0a8f47] p-5 text-white shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold text-emerald-100/90">{nbaEyebrow(action)}</p>
        <Sparkles className="h-4 w-4 text-amber-200" />
      </div>
      <p className="mt-1 text-[11px] font-semibold text-emerald-100/80">
        {unit ? unit.title : ''}
      </p>
      <h2 className="mt-1 text-lg font-black leading-relaxed">{item.title}</h2>
      <button
        type="button"
        onClick={ouvrir}
        data-testid="parcours-nba-start"
        className="mt-4 w-full rounded-full bg-white px-5 py-2.5 text-sm font-black text-[#006d37] shadow-sm transition-transform active:scale-[0.98]"
      >
        {action.type === 'resume' ? 'استئناف' : action.type === 'review' ? 'راجِع الآن' : 'ابدأ الآن'}
      </button>
      <p className="mt-3 text-[11px] leading-6 text-emerald-50/80">
        {todaysCompletions(state)} / {allowance(state)} مهمة اليوم
      </p>
    </section>
  );
}

// ---------- Bandeau de domaine ----------
function DomainBanner({
  domainId,
  title,
  done,
  total,
}: {
  domainId: number;
  title: string;
  done: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div
      data-testid={`parcours-banner-${domainId}`}
      className="relative overflow-hidden rounded-[24px] bg-gradient-to-l from-[#00562b] via-[#006d37] to-[#0a8f47] p-4 text-white shadow-sm"
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold text-emerald-100/80">المجال {domainId}</p>
          <h2 className="mt-0.5 text-base font-black leading-relaxed">{title}</h2>
        </div>
        <p className="shrink-0 text-xs font-bold text-emerald-50" dir="ltr">
          {done}/{total}
        </p>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-emerald-950/30">
        <div
          className="h-full rounded-full bg-amber-300 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ---------- Carte d'unité + rangées d'items ----------
function UnitCard({
  unit,
  state,
  onOpenLesson,
  onOpenQcm,
}: {
  unit: (typeof PARCOURS_DOMAINS)[number]['units'][number];
  state: ReturnType<typeof loadParcours>;
  onOpenLesson: ParcoursProps['onOpenLesson'];
  onOpenQcm: ParcoursProps['onOpenQcm'];
}) {
  const { done, total } = unitProgress(state, unit.unitId);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <section
      data-testid={`parcours-unit-${unit.unitId}`}
      className="overflow-hidden rounded-[24px] border border-[#e2dabf] bg-white dark:border-gray-800 dark:bg-[#161c18]"
    >
      <div className="border-b border-[#eee5cf] px-4 py-3 dark:border-gray-800">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-black text-[#006d37] dark:text-emerald-300">
            الوحدة {unit.unitId}
          </h3>
          <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500" dir="ltr">
            {done}/{total}
          </p>
        </div>
        <p className="mt-0.5 text-xs font-semibold leading-6 text-gray-700 dark:text-gray-300">
          {unit.title}
        </p>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full rounded-full bg-[#006d37] dark:bg-emerald-400 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <ul className="divide-y divide-[#f0e8d4] dark:divide-gray-800/70">
        {unit.items.map((item, index) => (
          <ItemRow
            key={item.id}
            item={item}
            index={index}
            state={state}
            onOpenLesson={onOpenLesson}
            onOpenQcm={onOpenQcm}
          />
        ))}
      </ul>
    </section>
  );
}

function ItemRow({
  item,
  index,
  state,
  onOpenLesson,
  onOpenQcm,
}: {
  item: ParcoursItem;
  index: number;
  state: ReturnType<typeof loadParcours>;
  onOpenLesson: ParcoursProps['onOpenLesson'];
  onOpenQcm: ParcoursProps['onOpenQcm'];
}) {
  const status = itemStatus(state, item.id);
  const tone = TONE[status];
  const clickable = status === 'available' || status === 'current' || status === 'done';
  const record = state.done[item.id];

  const ouvrir = () => {
    if (status !== 'done') markStarted(item.id);
    if (item.kind === 'jalon') {
      onOpenQcm(item.unitId);
    } else if (item.lessonKey) {
      onOpenLesson(item.lessonKey, item.lessonKind ?? 'html', item.unitId);
    }
  };

  const testId =
    item.kind === 'jalon'
      ? `parcours-jalon-${item.unitId}`
      : `parcours-row-${item.lessonKey ?? index}`;

  const accent =
    item.kind === 'jalon'
      ? 'border-l-[#944a00]'
      : status === 'current'
      ? 'border-l-[#006d37]'
      : 'border-l-transparent';

  // Contenu partagé : la rangée cliquable est un vrai <button> (focus + Entrée
  // + Espace natifs) ; la rangée verrouillée reste un simple conteneur inerte.
  const interieur = (
    <>
      {item.kind === 'jalon' ? (
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#944a00]/10 text-[#944a00] dark:bg-amber-400/15 dark:text-amber-300">
          <NotebookPen className="h-4 w-4" />
        </span>
      ) : (
        <StatusCircle status={status} index={index + 1} />
      )}
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm leading-6 ${tone.text}`}>{item.title}</p>
        <p className="mt-0.5 text-[10px] font-semibold text-gray-400 dark:text-gray-600">
          {item.kind === 'jalon'
            ? 'الجسر — اختبار الوحدة'
            : item.lessonKind === 'active'
            ? 'درس تفاعلي'
            : 'درس'}
          {record?.fragile ? ' · يحتاج مراجعة' : ''}
        </p>
      </div>
      {item.kind === 'jalon' && (
        <Pips done={status === 'done'} current={status === 'current'} />
      )}
      {status === 'locked' && (
        <Lock className="h-3.5 w-3.5 shrink-0 text-gray-300 dark:text-gray-700" />
      )}
    </>
  );

  return (
    <li
      data-testid={testId}
      className={`flex border-l-4 px-4 ${tone.row} ${accent}`}
    >
      {clickable ? (
        <button
          type="button"
          onClick={ouvrir}
          className="flex w-full items-center gap-3 py-3 transition-colors hover:bg-[#fff9ed] dark:hover:bg-[#1d2620]"
        >
          {interieur}
        </button>
      ) : (
        <div className="flex w-full cursor-default items-center gap-3 py-3">{interieur}</div>
      )}
    </li>
  );
}

// ---------- Vue complète ----------
export default function ParcoursView({ onOpenLesson, onOpenQcm }: ParcoursProps) {
  const [, setTick] = useState(0);
  // Recharge l'état après chaque action (markStarted/markDone écrivent le store).
  const state = loadParcours();
  const global = parcoursProgress(state);

  const relire = useCallback(() => setTick((n) => n + 1), []);

  // Surcouche : on marque "vu" au retour sur la vue (la validation réelle se
  // fait dans la leçon / le QCM via les moteurs existants — le chemin écoute).
  const marquerEtOuvrir = useCallback(
    (lessonKey: string, kind: LessonKind, unitId: number) => {
      onOpenLesson(lessonKey, kind, unitId);
    },
    [onOpenLesson],
  );

  return (
    <div dir="rtl" className="mx-auto max-w-3xl space-y-5 p-4 pb-10">
      <header data-testid="parcours-header">
        <p className="text-[11px] font-bold text-[#944a00] dark:text-amber-300">المسار</p>
        <div className="mt-1 flex items-center gap-2">
          <RouteIcon className="h-6 w-6 text-[#006d37] dark:text-emerald-300" />
          <h1 className="text-[1.7rem] font-black leading-tight text-gray-900 dark:text-gray-100">
            مسار تعلمك
          </h1>
        </div>
        <p className="mt-2 text-sm leading-7 text-gray-500 dark:text-gray-400">
          {global.done} من {global.total} مهمة مُنجزة — تقدم خطوة بخطوة، كل شيء مؤمّن حتى الوحدة 11.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2 text-[11px]">
          <li className="rounded-full bg-[#006d37]/10 px-2.5 py-1 font-semibold text-[#006d37] dark:bg-emerald-400/15 dark:text-emerald-300">
            مسار خطي مؤمّن
          </li>
          <li className="rounded-full bg-[#944a00]/10 px-2.5 py-1 font-semibold text-[#944a00] dark:bg-amber-400/15 dark:text-amber-300">
            مهمة واحدة كل يوم
          </li>
          <li className="rounded-full bg-gray-100 px-2.5 py-1 font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            مراجعة كل 14 يوماً
          </li>
        </ul>
        <button
          type="button"
          onClick={() => {
            resetParcours();
            relire();
          }}
          className="mt-3 text-[11px] font-semibold text-gray-400 underline-offset-2 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400"
        >
          إعادة تعيين المسار
        </button>
      </header>

      <NbaCard onOpenLesson={marquerEtOuvrir} onOpenQcm={onOpenQcm} />

      {PARCOURS_DOMAINS.map((domain) => {
        const dp = domainProgress(state, domain.domainId);
        return (
          <div key={domain.domainId} className="space-y-3">
            <DomainBanner
              domainId={domain.domainId}
              title={domain.title}
              done={dp.done}
              total={dp.total}
            />
            {domain.units.map((unit) => (
              <UnitCard
                key={unit.unitId}
                unit={unit}
                state={state}
                onOpenLesson={marquerEtOuvrir}
                onOpenQcm={onOpenQcm}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
