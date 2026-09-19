// Bac2025ExamView.tsx — LA BOUCLE ÉLÈVE DE BOUT EN BOUT (Pierre 2, R6).
//
// L'élève choisit un sujet officiel 2025, répond aux 3 exercices, soumet :
// la note = couverture des ATTENDUS OBLIGATOIRES × max, par exercice (5/7/8)
// puis total /20 — plafonnée par l'intégrité (salade/négations/perroquet).
// Aucun dénominateur caché : le registre est la seule source (attendusBac2025).

import { useMemo, useState } from 'react';
import { ClipboardList, FileText, RotateCcw, Send, ShieldCheck } from 'lucide-react';
import { listeGroupesBac2025, attendusDeGroupe } from '../data/dictionaries/attendusBac2025';
import { noterCopieCalibree } from '../data/dictionaries/calibrationBac2025';
import SectionObligatoire from './SectionObligatoire';

const GROUPES = listeGroupesBac2025();

export default function Bac2025ExamView({ onClose }: { onClose: () => void }) {
  const [sujet, setSujet] = useState<1 | 2>(1);
  const [reponses, setReponses] = useState<Record<1 | 2 | 3, string>>({ 1: '', 2: '', 3: '' });
  const [soumis, setSoumis] = useState(false);

  const copie = useMemo(
    () => (soumis ? noterCopieCalibree([reponses[1], reponses[2], reponses[3]], sujet) : null),
    [soumis, reponses, sujet]
  );

  const reset = (nouveauSujet?: 1 | 2) => {
    setSoumis(false);
    setReponses({ 1: '', 2: '', 3: '' });
    if (nouveauSujet) setSujet(nouveauSujet);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950" dir="rtl">
      <div className="max-w-3xl mx-auto p-4 md:p-6 pb-24 space-y-4">
        {/* En-tête */}
        <div className="bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl md:text-2xl font-black flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-emerald-400" />
                الإطار الرسمي — بكالوريا 2025
              </h1>
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                إغلاق
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              أجب عن التمارين الثلاثة، ثم سُلِّم لتشاهد التنقيط الإلزامي على مقتضيات الإجابة الرسمية
              (البناء المثبت + التصحيح النموذجي الرسمي). التقدير آلي على المقتضيات فقط — جودة الصياغة
              والبنود التقديرية تقديرها للمصحح.
            </p>
          </div>
        </div>

        {/* Choix du sujet */}
        <div className="grid grid-cols-2 gap-3">
          {([1, 2] as const).map((s) => (
            <button
              key={s}
              disabled={soumis}
              onClick={() => reset(s)}
              className={`p-3 rounded-2xl border-2 text-right font-black text-sm transition-all ${
                sujet === s
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 hover:border-gray-300'
              } ${soumis && sujet !== s ? 'opacity-40' : ''}`}
            >
              الموضوع {s === 1 ? 'الأول' : 'الثاني'}
              <span className="block text-[10px] font-bold text-gray-400 mt-1">
                خلايا مفترزة/جلوكوز · بيرنويدة/SOD · الشاي/نقل الدم — 20 نقطة
              </span>
            </button>
          ))}
        </div>

        {/* Les 3 exercices */}
        {([1, 2, 3] as const).map((ex) => {
          const g = attendusDeGroupe(sujet, ex);
          return (
            <div
              key={ex}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              <div className="px-4 py-3 bg-gray-50 dark:bg-black/20 border-b border-gray-100 dark:border-gray-800/60 flex items-start justify-between gap-2">
                <p className="text-xs font-black text-gray-700 dark:text-gray-300 leading-relaxed" dir="auto">
                  <FileText className="w-3.5 h-3.5 inline-block ml-1 text-emerald-600" />
                  {g.questionAr}
                </p>
                <span className="shrink-0 text-[10px] font-black text-gray-400">{g.maxPts} ن</span>
              </div>
              <div className="p-3">
                <textarea
                  aria-label={`التمرين ${ex}`}
                  disabled={soumis}
                  value={reponses[ex]}
                  onChange={(e) => setReponses((r) => ({ ...r, [ex]: e.target.value }))}
                  placeholder="اكتب إجابتك هنا…"
                  rows={ex === 1 ? 4 : 6}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black/20 text-xs leading-relaxed text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
                />
              </div>
            </div>
          );
        })}

        {/* Actions */}
        {!soumis ? (
          <button
            onClick={() => setSoumis(true)}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            <Send className="w-4 h-4" />
            تسليم التصحيح — التنقيط الإلزامي /20
          </button>
        ) : (
          <div className="space-y-4">
            {/* Total */}
            <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/20 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  النقطة الأولية الآلية — الموضوع {sujet === 1 ? 'الأول' : 'الثاني'}
                </p>
                <p className="text-[10px] font-bold text-gray-500 mt-0.5">
                  على مقتضيات الإجابة الرسمية فقط · سقوف النزاهة مطبقة · القرار النهائي للمصحح
                </p>
              </div>
              <span className="text-3xl font-black text-emerald-700 dark:text-emerald-300" aria-label="النقطة الإجمالية">
                {copie!.total}<span className="text-base text-gray-400">/20</span>
              </span>
            </div>

            {/* Détail par exercice — la même section que le panneau correcteur */}
            {copie!.exercices.map((n) => (
              <SectionObligatoire key={`${n.sujet}-${n.exercice}`} note={n} />
            ))}

            <button
              onClick={() => reset()}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              محاولة جديدة
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
