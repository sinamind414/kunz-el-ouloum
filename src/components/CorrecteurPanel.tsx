// CorrecteurPanel.tsx — Panneau « المصحح الآلي » de la vue de correction.
//
// Branche l'analyse scientifique du DICTIONNAIRE FINAL dans la file de correction
// (onglet 'correction' de MethodologyCompilerView) :
//   1. Entités : trouvées / attendues manquantes / pistes ambiguës (a_valider,
//      JAMAIS notées — règle moteur du build) ;
//   2. Sanctions : faux amis (Michaelis « en cloche », Hb vs globule) + conflit
//      ATP (valeur officielle = 38 uniquement — décision correcteur 2026-09-14) ;
//   3. Barème officiel bac2023→2025 : crédit par signature d'entités ; items sans
//      signature = « vérification manuelle ».
// L'unité est inférée automatiquement (inferreUnite) et peut être forcée.
// AIDE au corrigé : le verdict final reste au correcteur humain.

import { useMemo, useState } from 'react';
import {
  entitesDansTexte,
  evaluerEntites,
  inferreUnite,
  titreUnite,
} from '../data/dictionaries/dictionnaireCorrecteur';
import { evaluerBareme, listBaremeQuestions } from '../data/dictionaries/baremeCorrecteur';
import { evaluerSanctions } from '../data/dictionaries/sanctionsCorrecteur';

interface Props {
  text: string;
  /** Panneau déplié au montage (tests, analyse à la demande). */
  defaultOpen?: boolean;
  /** Question de barème présélectionnée (tests, deep-link). */
  defaultBaremeQuestionId?: string | null;
}

const BAREMES = listBaremeQuestions();
const UNITES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

/** 1.25 → « 1.25 » · 0.5 → « 0.5 » · 5 → « 5 » */
function fmtPoints(n: number): string {
  const s = n.toFixed(2);
  if (s.endsWith('.00')) return String(n);
  if (s.endsWith('0')) return s.slice(0, -1);
  return s;
}

export default function CorrecteurPanel({
  text,
  defaultOpen = false,
  defaultBaremeQuestionId = null,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [uniteOverride, setUniteOverride] = useState<number | null>(null);
  const [baremeId, setBaremeId] = useState<string>(defaultBaremeQuestionId ?? '');

  const analyse = useMemo(() => {
    const inferee = inferreUnite(text);
    const uniteId = uniteOverride ?? inferee?.uniteId ?? null;
    const parUnite = uniteId != null ? evaluerEntites(text, uniteId) : null;
    const transversal = entitesDansTexte(text);
    return {
      uniteId,
      uniteTitre: uniteId != null ? titreUnite(uniteId) : '',
      inferee,
      trouvees: parUnite ? parUnite.trouvees : transversal.trouvees,
      manquantes: parUnite ? parUnite.manquantes : [],
      pistes: parUnite ? parUnite.pistesAmbigues : transversal.pistes,
      sanctions: evaluerSanctions(text),
      bareme: baremeId ? evaluerBareme(text, baremeId) : null,
    };
  }, [text, uniteOverride, baremeId]);

  if (!text.trim()) return null;

  return (
    <div
      className="mt-2 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 overflow-hidden"
      dir="rtl"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
      >
        <span className="text-[11px] font-black text-indigo-900 dark:text-indigo-300">
          🔬 المصحح الآلي — تحليل المفاهيم والسنن (تجريبي)
          {analyse.uniteTitre && (
            <span className="font-bold text-indigo-500 dark:text-indigo-400"> · {analyse.uniteTitre}</span>
          )}
        </span>
        <span className="shrink-0 text-[10px] font-bold text-indigo-400">{open ? '▲ إخفاء' : '▼ عرض'}</span>
      </button>
      {open && (
      <div className="px-3 pb-3 pt-3 space-y-3 border-t border-indigo-200/60 dark:border-indigo-900/40">
        {/* Sélecteurs : unité (auto/forcée) + barème officiel */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-gray-500 dark:text-gray-400">
          <label className="flex items-center gap-1">
            الوحدة:
            <select
              value={uniteOverride ?? ''}
              onChange={(e) => setUniteOverride(e.target.value ? Number(e.target.value) : null)}
              className="px-1.5 py-1 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-[10px] font-bold text-gray-700 dark:text-gray-300"
            >
              <option value="">
                {analyse.inferee ? `تلقائي (${analyse.inferee.score} مفهوماً)` : 'تلقائي'}
              </option>
              {UNITES.map((uid) => (
                <option key={uid} value={uid}>
                  {uid} — {titreUnite(uid)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1">
            المقياس الرسمي:
            <select
              value={baremeId}
              onChange={(e) => setBaremeId(e.target.value)}
              className="px-1.5 py-1 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-[10px] font-bold text-gray-700 dark:text-gray-300 max-w-52"
            >
              <option value="">بدون مقياس</option>
              {BAREMES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.labelAr}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* 1. Entités trouvées */}
        <div>
          <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 mb-1">
            مفاهيم موجودة ({analyse.trouvees.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {analyse.trouvees.map((t) => (
              <span
                key={t.id}
                title={`entité ${t.id} · fiabilité ${t.fiabilite}`}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300"
              >
                {t.terme}
                {t.canoniqueFr && <span dir="ltr" className="opacity-70"> · {t.canoniqueFr}</span>}
              </span>
            ))}
            {analyse.trouvees.length === 0 && (
              <span className="text-[10px] text-gray-400">لا مفاهيم مرجعية — راجع المفاهيم الأساسية للوحدة.</span>
            )}
          </div>
        </div>

        {/* 2. Entités manquantes (unité choisie) */}
        {analyse.manquantes.length > 0 && (
          <details>
            <summary className="text-[10px] font-black text-gray-600 dark:text-gray-300 cursor-pointer select-none">
              مفاهيم متوقعة غير موجودة ({analyse.manquantes.length}) — للوحدة المختارة
            </summary>
            <div className="flex flex-wrap gap-1 mt-1">
              {analyse.manquantes.map((m) => (
                <span
                  key={m.id}
                  title={`entité ${m.id}`}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                >
                  {m.canoniqueFr || m.terme}
                </span>
              ))}
            </div>
          </details>
        )}

        {/* 3. Pistes ambiguës (a_valider — jamais notées) */}
        {analyse.pistes.length > 0 && (
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
            <p className="text-[10px] font-black text-amber-800 dark:text-amber-300">
              ألفاظ غامضة ({analyse.pistes.length}) — غير محسوبة في التنقيط
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {analyse.pistes.map((p) => (
                <span
                  key={p.id}
                  title={`AMBIGUITE_LEXICALE · ${p.id}`}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                >
                  {p.terme}
                  {p.canoniqueFr && <span dir="ltr" className="opacity-70"> · {p.canoniqueFr}</span>}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 4. Sanctions pédagogiques */}
        {analyse.sanctions.map((s) => (
          <div
            key={s.id}
            className={`p-2 rounded-lg border ${
              s.gravite === 'forte'
                ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50'
            }`}
          >
            <p
              className={`text-[10px] font-black ${
                s.gravite === 'forte' ? 'text-red-800 dark:text-red-300' : 'text-amber-800 dark:text-amber-300'
              }`}
            >
              {s.type === 'CONFLIT_REF' ? '⚠️ تعارض مرجعي' : s.type === 'FAUX_AMI' ? '⛔ خلط شائع' : '👀 لفظ مزدوج — انتباه'}
              {' · '}
              {s.titreAr}
            </p>
            <p className="text-[10px] text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">{s.constatAr}</p>
            <p
              className={`text-[10px] font-bold mt-0.5 leading-relaxed ${
                s.gravite === 'forte' ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'
              }`}
            >
              {s.correctionAr}
            </p>
          </div>
        ))}

        {/* 5. Barème officiel */}
        {analyse.bareme && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-2 py-1.5 bg-gray-50 dark:bg-black/20">
              <span className="text-[10px] font-black text-gray-700 dark:text-gray-300">التنقيط على المقياس الرسمي</span>
              <span className="text-[11px] font-black text-[#006d37] dark:text-emerald-400">
                {fmtPoints(analyse.bareme.pointsObtenus)} / {fmtPoints(analyse.bareme.pointsTotal)} ن
              </span>
            </div>
            <ul className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {analyse.bareme.verdicts.map((v) => (
                <li key={v.item.id} className="px-2 py-1.5 flex items-start gap-2">
                  <span
                    className={`shrink-0 mt-0.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center ${
                      v.credite
                        ? 'bg-emerald-500 text-white'
                        : v.mode === 'manuelle'
                          ? 'bg-amber-400 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    {v.credite ? '✓' : v.mode === 'manuelle' ? '؟' : ''}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-gray-700 dark:text-gray-300 leading-snug" dir="auto">
                      {v.item.ar || v.item.fr}
                    </p>
                    {v.credite && v.via.length > 0 && (
                      <p className="text-[9px] text-emerald-600 dark:text-emerald-400">
                        عبر: {v.via.map((x) => x.terme).join('، ')}
                      </p>
                    )}
                    {v.mode === 'manuelle' && !v.credite && (
                      <p className="text-[9px] text-amber-600 dark:text-amber-400">بند يدوي — تقديره للمصحح</p>
                    )}
                  </div>
                  <span className="shrink-0 text-[10px] font-black text-gray-400">{fmtPoints(v.item.points)}</span>
                </li>
              ))}
            </ul>
            <p className="px-2 py-1.5 text-[9px] text-gray-400 border-t border-gray-100 dark:border-gray-800/60">
              أداة مساعدة للتصحيح — القرار النهائي للمصحح. البنود «؟» لا تُحتسب آلياً.
            </p>
          </div>
        )}
      </div>
      )}
    </div>
  );
}