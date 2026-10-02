// src/components/BacView.tsx
// « البكالوريا » — photo 3 du design OPUS 5.5 : en-tête (eyebrow + titre +
// paragraphe), carte « أوراقك » (devoirs réellement terminés + pastille de
// note), grille « جسور الوحدات », et « ما يسقط فعلاً ».
//
// Port sur la charte de l'app : #006d37 / #00562b / #944a00 / #e2dabf,
// Noto Kufi, mode sombre conservé. Fidélité aux données :
//   - « ما يسقط فعلاً » n'affiche QUE les unités dont le poids a été mesuré
//     (U1..U7, src/data/unitOpenings.ts). U8..U11 restent absentes — jamais
//     de pourcentage inventé.
//   - la pastille de note affiche « s/t » seulement si les deux existent,
//     sinon un pourcentage, sinon « — ». Aucune note fabriquée.

import { Check, Lock } from 'lucide-react';
import {
  PARCOURS_DOMAINS,
  type LessonKind,
} from '../lib/parcours/parcoursPath';
import {
  itemStatus,
  loadParcours,
  type ParcoursRecord,
} from '../lib/parcours/parcoursProgress';
import { poidsBacUnite } from '../lib/parcours/parcoursMeta';

interface BacProps {
  /** Ouvre une leçon (clé + nature + unité) — câblé sur LessonsView. */
  onOpenLesson: (lessonKey: string, kind: LessonKind, unitId: number) => void;
  /** Ouvre les QCM du livre officiel d'une unité — ligne جسر. */
  onOpenQcm: (unitId: number) => void;
}

/** Pastille de note — « 8 / 10 » si le total est connu, sinon « 80% », sinon « — ». */
function noteDe(rec: ParcoursRecord): string {
  if (typeof rec.score !== 'number') return '—';
  if (typeof rec.total === 'number' && rec.total > 0) {
    return `${Math.round(rec.score * rec.total)} / ${rec.total}`;
  }
  return `${Math.round(rec.score * 100)}%`;
}

interface Copie {
  id: string;
  title: string;
  unitId: number;
  /** Absent pour un جسر → ouvre le QCM de l'unité. */
  lessonKey?: string;
  lessonKind?: LessonKind;
  rec: ParcoursRecord;
}

export default function BacView({ onOpenLesson, onOpenQcm }: BacProps) {
  const state = loadParcours();

  // Tous les items validés (leçons + جسور), dans l'ordre du chemin.
  const copies: Copie[] = PARCOURS_DOMAINS.flatMap((d) =>
    d.units.flatMap((u) =>
      u.items
        .filter((i) => state.done[i.id])
        .map((i) => ({
          id: i.id,
          title: i.title,
          unitId: i.unitId,
          lessonKey: i.lessonKey,
          lessonKind: i.lessonKind,
          rec: state.done[i.id],
        })),
    ),
  );

  const ouvrir = (c: Copie) => {
    // Un جسر n'a pas de clé de leçon → il ouvre le QCM de son unité.
    if (!c.lessonKey) {
      onOpenQcm(c.unitId);
      return;
    }
    onOpenLesson(c.lessonKey, c.lessonKind ?? 'html', c.unitId);
  };

  const units = PARCOURS_DOMAINS.flatMap((d) => d.units);
  const jalons = units
    .map((u) => ({ unit: u, jalon: u.items.find((i) => i.kind === 'jalon') }))
    .filter((x) => x.jalon);

  // Poids BAC réellement mesurés uniquement.
  const poidsMesures = units
    .map((u) => ({ unitId: u.unitId, poids: poidsBacUnite(u.unitId) }))
    .filter((x): x is { unitId: number; poids: number } => typeof x.poids === 'number');
  const poidsMax = poidsMesures.reduce((m, x) => Math.max(m, x.poids), 0);

  return (
    <div dir="rtl" className="mx-auto max-w-3xl space-y-5 p-4 pb-10">
      {/* ---------- En-tête ---------- */}
      <header data-testid="bac-header">
        <p className="text-[11px] font-bold tracking-[0.02em] text-[#944a00] dark:text-amber-300">
          البكالوريا
        </p>
        <h1 className="mt-1 text-[2.1rem] font-black leading-tight text-gray-900 dark:text-gray-50">
          يُفتح ما أنجزته، لا أكثر.
        </h1>
        <p className="mt-2 text-sm leading-7 text-gray-500 dark:text-gray-400">
          لا بنك مواضيع مفتوح على مصراعيه. هنا أوراقك المصحّحة، جسور وحداتك، وما
          يسقط فعلاً. التدريب تحت الضغط ينتظر المرحلة النهائية.
        </p>
      </header>

      {/* ---------- أوراقك ---------- */}
      <section
        data-testid="bac-papers"
        className="rounded-[24px] border border-[#e2dabf] bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#161c18]"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-base font-black text-gray-900 dark:text-gray-50">
            أوراقك
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ما أنجزته فعلاً في المسار
          </span>
        </div>

        {copies.length === 0 ? (
          <p className="mt-3 text-sm leading-7 text-gray-500 dark:text-gray-400">
            أوّل ورقة تظهر هنا بعد أوّل درس تُنجزه من «مساري».
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[#f0e8d4] dark:divide-gray-800/70">
            {copies.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => ouvrir(c)}
                  className="flex w-full items-center justify-between gap-3 py-3 text-right transition-colors hover:bg-[#fff9ed] dark:hover:bg-[#1d2620]"
                >
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold text-[#006d37] dark:text-emerald-300">
                      الوحدة {c.unitId}
                    </span>
                    <span className="block truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {c.title}
                    </span>
                  </span>
                  <span
                    dir="ltr"
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-black ${
                      c.rec.fragile
                        ? 'bg-[#f3dfae] text-[#944a00] dark:bg-amber-500/20 dark:text-amber-200'
                        : 'bg-[#e5f6ed] text-[#00562b] dark:bg-emerald-500/15 dark:text-emerald-200'
                    }`}
                  >
                    {noteDe(c.rec)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---------- جسور الوحدات ---------- */}
      <section
        data-testid="bac-bridges"
        className="rounded-[24px] border border-[#e2dabf] bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#161c18]"
      >
        <h2 className="text-base font-black text-gray-900 dark:text-gray-50">
          جسور الوحدات
        </h2>
        <p className="mt-1 text-xs leading-6 text-gray-500 dark:text-gray-400">
          كل جسر حصيلة من الذاكرة لوحدة كاملة: أقرب تمرين إلى روح الموضوع.
        </p>
        <ul className="mt-4 grid grid-cols-4 gap-2 md:grid-cols-6">
          {jalons.map(({ unit, jalon }) => {
            const statut = itemStatus(state, jalon!.id);
            const tuile = (
              <span
                className={`flex h-16 flex-col items-center justify-center rounded-2xl text-xs font-black ${
                  statut === 'done'
                    ? 'bg-[#006d37] text-white dark:bg-[#006d37] dark:text-white'
                    : statut === 'locked'
                    ? 'bg-[#faf7f0] text-gray-400 dark:bg-gray-900/40 dark:text-gray-600'
                    : 'border-2 border-[#944a00] bg-[#fdf1e0] text-[#944a00] dark:border-amber-400/60 dark:bg-amber-500/10 dark:text-amber-200'
                }`}
              >
                {statut === 'done' ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : statut === 'locked' ? (
                  <Lock className="h-3.5 w-3.5" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-current" />
                )}
                <span className="mt-1">الوحدة {unit.unitId}</span>
              </span>
            );
            return (
              <li key={unit.unitId} title={unit.title}>
                {statut === 'locked' ? (
                  tuile
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenQcm(unit.unitId)}
                    className="w-full transition-transform hover:-translate-y-px"
                  >
                    {tuile}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* ---------- ما يسقط فعلاً (poids mesurés U1..U7) ---------- */}
      {poidsMesures.length > 0 && (
        <section
          data-testid="bac-weights"
          className="rounded-[24px] border border-[#e2dabf] bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#161c18]"
        >
          <h2 className="text-base font-black text-gray-900 dark:text-gray-50">
            ما يسقط فعلاً
          </h2>
          <p className="mt-1 text-xs leading-6 text-gray-500 dark:text-gray-400">
            النِسَب المقيسة في تحليل دورات البكالوريا — الوحدات المقيسة فقط،
            البقية غير مقيَّسة فلا نعرض لها رقماً. لا تغيّر ترتيب مسارك اليوم؛
            تُستعمل في المراجعة النهائية.
          </p>
          <ul className="mt-4 space-y-2">
            {poidsMesures.map(({ unitId, poids }) => (
              <li
                key={unitId}
                className="grid grid-cols-[4.5rem_1fr_3.5rem] items-center gap-2 text-xs"
              >
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  الوحدة {unitId}
                </span>
                <span className="h-2.5 overflow-hidden rounded-full bg-[#f0e8d4] dark:bg-gray-800">
                  <span
                    className="block h-full rounded-full bg-[#006d37] dark:bg-[#2ecc71]"
                    style={{ width: `${poidsMax > 0 ? (poids / poidsMax) * 100 : 0}%` }}
                  />
                </span>
                <span dir="ltr" className="text-end font-bold text-gray-500 dark:text-gray-400">
                  {poids}%
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
