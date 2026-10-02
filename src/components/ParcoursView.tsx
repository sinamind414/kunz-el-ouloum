// src/components/ParcoursView.tsx
// مسار تعلمك — vue du chemin linéaire + tâche du jour (NBA).
//
// Design recopié du zip OPUS 5.5 (photos « مساري ») :
//   - bandeau de domaine : image texture + dégradé + titre FR (dir ltr) puis
//     titre AR, barre de progression ;
//   - carte d'unité : en-tête « الوحدة N · H سا في القسم · fenêtre » + titre AR
//     + sous-titre FR ;
//   - rangées = CARTES SÉPARÉES arrondies (rounded-2xl), libellé or
//     « الدرس N » / « الجسر », ligne d'état, et PIPS SUR LES LEÇONS
//     (le جسار n'en a pas — contrairement à l'incrément 1).
// Mappé sur la charte de l'app : #006d37 / #00562b / #944a00 / #e2dabf,
// police Noto Kufi Arabic, mode sombre conservé.
//
// Testids stables (couverts par ParcoursView.test.tsx) :
//   parcours-header, parcours-nba(-start), parcours-banner-N,
//   parcours-unit-N, parcours-row-KEY, parcours-jalon-N.
// Une rangée verrouillée ne contient JAMAIS de <button> (dette clavier stable).

import { useCallback, useState } from 'react';
import { Check, Lock, Route as RouteIcon, Sparkles } from 'lucide-react';
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
  type ParcoursRecord,
} from '../lib/parcours/parcoursProgress';
import { nbaEyebrow, nextBestAction } from '../lib/parcours/nbaEngine';
import {
  formatCourtAr,
  imageDomaine,
  metaUniteOfficielle,
  titreFrDomaine,
  titreFrUnite,
} from '../lib/parcours/parcoursMeta';

interface ParcoursProps {
  /** Ouvre une leçon (clé + nature + unité) — câblé sur LessonsView. */
  onOpenLesson: (lessonKey: string, kind: LessonKind, unitId: number) => void;
  /** Ouvre les QCM du livre officiel d'une unité — ligne جسار. */
  onOpenQcm: (unitId: number) => void;
}

// ---------- Tons des rangées (charte de l'app, mode sombre inclus) ----------
// `fragile` est un sous-état de `done` : leçon validée mais note < seuil.
type ToneKey = ParcoursItemStatus | 'fragile';

const TONE: Record<ToneKey, { card: string; circle: string; text: string }> = {
  done: {
    card: 'bg-[#edf7f1] border-[#006d37]/25 dark:bg-[#0f2b1e]/70 dark:border-[#2ecc71]/25',
    circle: 'bg-[#006d37] text-white dark:bg-[#006d37] dark:text-white',
    text: 'text-gray-900 dark:text-gray-50',
  },
  fragile: {
    card: 'bg-[#fdf6ea] border-[#944a00]/45 dark:bg-[#2b1f10]/70 dark:border-amber-400/35',
    circle: 'bg-[#944a00] text-white dark:bg-amber-500 dark:text-[#1c1914]',
    text: 'text-gray-900 dark:text-gray-50',
  },
  current: {
    card: 'bg-white border-[#006d37] ring-1 ring-[#006d37]/35 dark:bg-[#161c18] dark:border-[#2ecc71] dark:ring-[#2ecc71]/35',
    circle: 'bg-[#006d37] text-white dark:bg-[#006d37] dark:text-white',
    text: 'text-gray-900 dark:text-gray-50 font-bold',
  },
  available: {
    card: 'bg-white border-[#e2dabf] dark:bg-[#161c18] dark:border-gray-800',
    circle:
      'bg-[#fdf1e0] text-[#944a00] border border-[#944a00]/40 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/40',
    text: 'text-gray-800 dark:text-gray-200',
  },
  locked: {
    card: 'bg-[#faf8f2] border-[#eee5cf] dark:bg-gray-900/30 dark:border-gray-800/70',
    circle: 'bg-white text-gray-400 dark:bg-[#121714] dark:text-gray-600',
    text: 'text-gray-400 dark:text-gray-500',
  },
};

function StatusCircle({
  status,
  fragile,
}: {
  status: ParcoursItemStatus;
  fragile: boolean;
}) {
  const key: ToneKey = status === 'done' && fragile ? 'fragile' : status;
  const tone = TONE[key];
  if (status === 'done') {
    return (
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${tone.circle}`}
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
    );
  }
  if (status === 'locked') {
    return (
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white ring-1 ring-[#eee5cf] dark:bg-[#121714] dark:ring-gray-800">
        <Lock className="h-3.5 w-3.5 text-gray-400 dark:text-gray-600" />
      </span>
    );
  }
  if (status === 'current') {
    return (
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#006d37] text-white dark:bg-[#006d37]">
        <span className="h-2.5 w-2.5 rounded-full bg-white" />
      </span>
    );
  }
  return (
    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#fdf1e0] ring-1 ring-[#944a00]/40 dark:bg-amber-500/15 dark:ring-amber-400/40">
      <span className="h-2.5 w-2.5 rounded-full bg-[#944a00] dark:bg-amber-300" />
    </span>
  );
}

// ---------- Pips : 4 segments — EXCLUSIVEMENT sur les leçons (photos 2/4) ----------
function Pips({ status, fragile }: { status: ParcoursItemStatus; fragile: boolean }) {
  const quart =
    status === 'done'
      ? fragile
        ? 4
        : 4
      : status === 'current'
      ? 2
      : status === 'available'
      ? 1
      : 0;
  return (
    <span className="flex shrink-0 items-end gap-[3px]" aria-hidden>
      {[0, 1, 2, 3].map((k) => {
        const filled = k < quart;
        return (
          <span
            key={k}
            className={`w-[3px] rounded-full transition-colors ${
              filled
                ? status === 'done' && fragile
                  ? 'bg-[#944a00] dark:bg-amber-400'
                  : 'bg-[#006d37] dark:bg-[#2ecc71]'
                : status === 'current' || status === 'available'
                ? 'bg-[#e2dabf] dark:bg-gray-700'
                : 'bg-[#eee5cf] dark:bg-gray-800'
            }`}
            style={{ height: `${8 + k * 3}px` }}
          />
        );
      })}
    </span>
  );
}

// ---------- Ligne d'état (libellé + titre + méta) ----------
function metaDe(
  item: ParcoursItem,
  status: ParcoursItemStatus,
  record: ParcoursRecord | undefined,
  reviewDate: string | undefined,
): string {
  const type = item.kind === 'lesson' && item.lessonKind === 'active' ? ' · درس تفاعلي' : '';

  if (status === 'done') {
    if (record?.fragile) {
      return reviewDate ? `هشّة · تعود ${formatCourtAr(reviewDate)}` : 'هشّة · تحتاج مراجعة';
    }
    let m = 'مثبّتة';
    if (typeof record?.score === 'number') {
      m +=
        typeof record.total === 'number' && record.total > 0
          ? ` · ${Math.round(record.score * record.total)} / ${record.total}`
          : ` · ${Math.round(record.score * 100)}%`;
    }
    if (reviewDate) m += ` · مراجعة ${formatCourtAr(reviewDate)}`;
    return item.kind === 'lesson' ? m + type : m;
  }
  if (status === 'current') return item.kind === 'lesson' ? `بدأتها ولم تُتمّها${type}` : 'بدأتها ولم تُتمّها';
  if (status === 'available') return 'مهمّتك الحالية';
  return item.kind === 'jalon' ? 'بعد آخر درس' : `بعد الدرس السابق${type}`;
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

// ---------- Bandeau de domaine : image texture + dégradé + FR + AR ----------
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
  const image = imageDomaine(domainId);
  const titreFr = titreFrDomaine(domainId);
  return (
    <div
      data-testid={`parcours-banner-${domainId}`}
      className="relative overflow-hidden rounded-[24px] shadow-sm"
    >
      {image ? (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-l from-[#00562b]/95 via-[#006d37]/90 to-[#0a8f47]/75" />
      <div className="relative flex flex-col justify-end p-4 text-white">
        {titreFr ? (
          <p
            dir="ltr"
            className="text-end text-[10px] font-semibold tracking-wide text-[#f3dfae] dark:text-amber-200"
          >
            {titreFr}
          </p>
        ) : null}
        <h2 className="mt-0.5 text-base font-black leading-relaxed">{title}</h2>
        <div className="mt-3 flex items-center gap-3">
          <p className="shrink-0 text-[11px] font-bold text-white/90" dir="ltr">
            {done}/{total}
          </p>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/25">
            <div
              className="h-full rounded-full bg-[#f3dfae] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
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
  const meta = metaUniteOfficielle(unit.unitId);
  const fr = titreFrUnite(unit.unitId);

  return (
    <section
      data-testid={`parcours-unit-${unit.unitId}`}
      className="rounded-[24px] border border-[#e2dabf] bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#161c18] md:p-5"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-[#006d37] dark:text-emerald-300">
            الوحدة {unit.unitId}
            {meta ? ` · ${meta.heures} سا في القسم · ${meta.fenetre}` : ''}
          </p>
          <h3 className="mt-0.5 truncate text-[15px] font-black leading-7 text-gray-900 dark:text-gray-50">
            {unit.title}
          </h3>
          {fr ? (
            <p dir="ltr" className="mt-0.5 truncate text-end text-[11px] text-gray-500 dark:text-gray-400">
              {fr}
            </p>
          ) : null}
        </div>
        <p className="shrink-0 text-[11px] font-bold text-gray-400 dark:text-gray-500" dir="ltr">
          {done}/{total}
        </p>
      </header>

      <ol className="mt-3 space-y-2">
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
      </ol>
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
  const record = state.done[item.id];
  const fragile = Boolean(record?.fragile);
  const toneKey: ToneKey = status === 'done' && fragile ? 'fragile' : status;
  const tone = TONE[toneKey];
  const clickable = status === 'available' || status === 'current' || status === 'done';

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

  const libelle = item.kind === 'jalon' ? 'الجسر' : `الدرس ${index + 1}`;
  const ligneEtat = metaDe(item, status, record, state.reviews[item.id]);

  // Contenu partagé : la rangée cliquable est un vrai <button> (focus + Entrée
  // + Espace natifs) ; la rangée verrouillée reste un conteneur inerte
  // `aria-disabled` SANS <button> (dette clavier stable : 2 connues).
  const interieur = (
    <>
      <StatusCircle status={status} fragile={fragile} />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black leading-4 text-[#944a00] dark:text-amber-300">
          {libelle}
        </p>
        <p className={`mt-1 truncate text-sm leading-6 ${tone.text}`}>{item.title}</p>
        <p className="mt-0.5 truncate text-[10px] leading-4 text-gray-500 dark:text-gray-400">
          {ligneEtat}
        </p>
      </div>
      {item.kind === 'lesson' && <Pips status={status} fragile={fragile} />}
    </>
  );

  return (
    <li data-testid={testId} className="list-none">
      {clickable ? (
        <button
          type="button"
          onClick={ouvrir}
          className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-right transition-all hover:-translate-y-px ${tone.card}`}
        >
          {interieur}
        </button>
      ) : (
        <div
          aria-disabled="true"
          className={`flex w-full cursor-default items-center gap-3 rounded-2xl border px-3 py-2.5 ${tone.card}`}
        >
          {interieur}
        </div>
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

      <NbaCard onOpenLesson={onOpenLesson} onOpenQcm={onOpenQcm} />

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
                onOpenLesson={onOpenLesson}
                onOpenQcm={onOpenQcm}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
