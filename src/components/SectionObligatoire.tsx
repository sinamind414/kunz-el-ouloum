// SectionObligatoire.tsx — le rendu partagé de la NOTATION OBLIGATOIRE (Pierre 2).
//
// Utilisé par le CorrecteurPanel (analyse prof/élève) ET par la vue examen
// (boucle élève de bout en bout). Un seul rendu = un seul contrat honnête :
// pré-note automatique sur les attendus officiels, plafonds visibles, items
// manuels signalés, décision finale au correcteur.

import type { NoteCalibree } from '../data/dictionaries/calibrationBac2025';

/** 1.25 → « 1.25 » · 0.5 → « 0.5 » · 5 → « 5 » */
export function fmtPoints(n: number): string {
  const s = n.toFixed(2);
  if (s.endsWith('.00')) return String(n);
  if (s.endsWith('0')) return s.slice(0, -1);
  return s;
}

/** Étiquettes arabes des plafonds d'intégrité (transparence du plafonnement). */
const LABEL_PLAFOND: Record<string, string> = {
  non_prose: 'نص غير نثري (كلمات مفككة) — سقف',
  negation: 'نفي الحقيقة العلمية — سقف',
  echo_question: 'نسخ نص السؤال — سقف',
};

export default function SectionObligatoire({ note }: { note: NoteCalibree }) {
  const manuels = note.verdicts.filter((v) => !v.auto);
  return (
    <div className="rounded-lg border-2 border-[#006d37]/30 dark:border-emerald-800/60 overflow-hidden">
      <div className="flex items-center justify-between px-2 py-1.5 bg-emerald-50 dark:bg-emerald-950/30">
        <span className="text-[10px] font-black text-[#006d37] dark:text-emerald-300">
          التنقيط الإلزامي على مقتضيات الإجابة الرسمية
        </span>
        <span className="text-[13px] font-black text-[#006d37] dark:text-emerald-300">
          {fmtPoints(note.points)} / {fmtPoints(note.maxPts)} ن
        </span>
      </div>
      <div className="px-2 py-1.5 text-[9px] font-bold text-gray-500 dark:text-gray-400 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-0.5">
        <p>
          التغطية: {Math.round(note.couverture * 100)}% من النقاط الآلية (
          {fmtPoints(note.pointsAttendusCredites)}/{fmtPoints(note.pointsAttendusAuto)}) —
          {' '}المعادلة: التغطية × {fmtPoints(note.maxPts)}
        </p>
        {note.plafonds.length > 0 && (
          <p className="text-red-700 dark:text-red-300">
            سقوف النزاهة المطبقة:{' '}
            {note.plafonds
              .map((p) => `${LABEL_PLAFOND[p.type] ?? p.type} ${Math.round(p.plafondPct * 100)}%`)
              .join(' · ')}
          </p>
        )}
        {manuels.length > 0 && (
          <p className="text-amber-700 dark:text-amber-300">
            {manuels.length} بنداً/بنوداً تقديرية يدوية (تمهيد، خاتمة، اقتراح…) —
            {' '}خارج النقاط الآلية، تقديرها للمصحح.
          </p>
        )}
      </div>
      <ul className="divide-y divide-gray-100 dark:divide-gray-800/60">
        {note.verdicts.map((v) => (
          <li key={v.id} className="px-2 py-1.5 flex items-start gap-2">
            <span
              className={`shrink-0 mt-0.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center ${
                v.credite
                  ? 'bg-emerald-500 text-white'
                  : !v.auto
                    ? 'bg-amber-400 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}
            >
              {v.credite ? '✓' : !v.auto ? '؟' : ''}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-700 dark:text-gray-300 leading-snug" dir="auto">
                {v.texteAr}
              </p>
              {v.composantesTotal != null && v.composantesDetectees != null && (
                <p
                  className={`text-[9px] ${v.composantesDetectees < v.composantesTotal ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                >
                  عناصر مطلوبة: {v.composantesDetectees}/{v.composantesTotal}
                  {v.composantesDetectees < v.composantesTotal ? ' — عنصر ناقص' : ''}
                </p>
              )}
              {!v.auto && (
                <p className="text-[9px] text-amber-600 dark:text-amber-400">بند يدوي — تقديره للمصحح</p>
              )}
            </div>
            <span
              className={`shrink-0 text-[10px] font-black ${v.credite ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}
            >
              {fmtPoints(v.pointsCredites)}/{fmtPoints(v.points)}
            </span>
          </li>
        ))}
      </ul>
      <p className="px-2 py-1.5 text-[9px] text-gray-400 border-t border-gray-100 dark:border-gray-800/60">
        تقدير أولي آلي بالكامل على مقتضيات السند الرسمي (بناء إثبات + التصحيح الرسمي 2025) —
        لا يشمل البنود اليدوية ولا جودة الصياغة. القرار النهائي للمصحح.
      </p>
    </div>
  );
}
