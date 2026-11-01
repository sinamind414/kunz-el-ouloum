// BacExamView.tsx — « اختبارات نمط البكالوريا » : 3 sujets blancs au FORMAT
// OFFICIEL (B2, audit 2026-10-17).
//
// AVANT (défaut historique) : 3 « épreuves complètes » 4 exercices × 5 points,
// 180 minutes, extraites mécaniquement du document « PROGRAMME NATIONAL SVT
// CLAUDE OPUS - Copie.MD » (généré par IA). Ce format n'existe pas au BAC :
// l'épreuve officielle de sciences expérimentales est DEUX sujets au choix,
// TROIS exercices (5, 7, 8 points), 4 h 30. Un élève qui s'entraînait dessus
// apprenait une structure et une gestion du temps fausses.
//
// APRÈS : les sujets sont COMPOSÉS par src/data/mockExam.ts — sélection
// déterministe d'exercices RÉELLEMENT tombés (banque bacSessionIndex, énoncés
// officiels ONEC republiés par eddirasa/dzexams, sources citées par exercice),
// barème 5+7+8, durée 270 minutes, trois unités porteuses distinctes. La vue
// n'invente aucun énoncé : elle affiche l'IDÉE officielle, les supports, la
// notion évaluée — et l'élève travaille le document original dans l'atelier
// (situationIds/capsuleIds/drillIds de chaque exercice y renvoient).
//
// Le simulateur chronométré complet (budget par exercice, phases) reste
// MockExamPanel — ce qui a disparu ici est le mensonge de format, pas le
// simulateur.

import { useMemo, useState } from 'react';
import { FileText, GraduationCap, Clock } from 'lucide-react';
import { composeMockExam } from '../data/mockExam';
import type { BacExerciseIdea } from '../data/bacSessionIndex';

interface Props {
  onBack: () => void;
}

/** Trois numéros DÉTERMINISTES : le professeur peut dire « faites le sujet 2 ». */
const NUMEROS_SUJETS = [1, 2, 3];

const dureeAr = (min: number) => `${Math.floor(min / 60)} سا و ${min % 60} د`;

export default function BacExamView({ onBack }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [cochees, setCochees] = useState<Record<string, boolean>>({});

  const sujet = useMemo(
    () => (selected === null ? null : composeMockExam(selected)),
    [selected],
  );
  const score = useMemo(() => {
    if (!sujet) return 0;
    let s = 0;
    for (const e of sujet.exercices) if (cochees[e.id]) s += e.points;
    return s;
  }, [sujet, cochees]);

  // ----- Écran 1 : choix du sujet blanc -----
  if (!sujet) {
    return (
      <div dir="rtl" className="space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200"
          >
            <span>→</span>
            <span>عودة</span>
          </button>
          <h2 className="text-xl font-black flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#b45309]" />
            اختبارات نمط البكالوريا
          </h2>
        </div>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
          3 مواضيع بيضاء بالبنية الرسمية : ثلاثة تمارين (5 + 7 + 8 نقاط) · 4 سا و
          30 د · من تمارين سقطت فعلاً في البكالوريا (الدورات مذكورة، المصادر ONEC)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {NUMEROS_SUJETS.map((numero) => {
            const s = composeMockExam(numero);
            return (
              <button
                key={numero}
                data-testid={`bac-blanc-${numero}`}
                onClick={() => {
                  setSelected(numero);
                  setCochees({});
                }}
                className="p-5 rounded-3xl border-2 border-amber-200 dark:border-amber-900/50 bg-white dark:bg-[#161c18] hover:border-amber-500 hover:shadow-lg transition-all text-right space-y-2"
              >
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-[#b45309] dark:text-amber-300">
                  <FileText className="w-6 h-6" />
                </span>
                <span className="block text-base font-black text-gray-800 dark:text-gray-100">
                  موضوع {numero} — {s.sessions.join(' · ')}
                </span>
                <span className="block text-xs font-bold text-gray-500 dark:text-gray-400">
                  تمارين {s.exercices.map((e) => e.points).join(' + ')} نقاط · {dureeAr(s.dureeMinutes)} ·{' '}
                  الوحدات: {s.unitesPortees.join('، ')}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ----- Écran 2 : le sujet blanc (auto-évaluation par exercice) -----
  return (
    <div dir="rtl" className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setSelected(null)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200"
        >
          <span>→</span>
          <span>عودة إلى الاختبارات</span>
        </button>
        <h2 className="text-lg font-black">موضوع {sujet.numero}</h2>
        <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-black">
          نتيجتك الذاتية : {score} / {sujet.totalPoints}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs font-bold text-gray-600 dark:text-gray-300 flex-wrap">
        <Clock className="w-4 h-4 text-[#b45309]" />
        <span>المدة الرسمية : {dureeAr(sujet.dureeMinutes)}</span>
        <span className="px-2">·</span>
        <span>{sujet.totalPoints} نقطة</span>
        <span className="px-2">·</span>
        <span>دورات : {sujet.sessions.join(' · ')}</span>
      </div>

      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs font-bold text-amber-900 dark:text-amber-200 leading-relaxed">
        هذه مواضيع بيضاء مؤلفة من تمارين سقطت فعلاً (لا نصوص مولدة). اقرأ فكرة
        كل تمرين ومعطياته المذكورة، وحلّه على الورقة كأنك في الامتحان، ثم ضع
        علامة على ما أنجزته كاملاً. النصوص الأصلية الكاملة متوفرة لدى ONEC
        (eddirasa / dzexams) لكل دورة مذكورة.
      </div>

      {sujet.exercices.map((e: BacExerciseIdea) => {
        const actif = !!cochees[e.id];
        return (
          <section
            key={e.id}
            data-testid={`bac-blanc-1-ex-${e.id}`}
            className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c18] overflow-hidden"
          >
            <header className="flex items-center justify-between px-4 py-3 bg-gradient-to-l from-amber-500/10 to-transparent dark:from-amber-950/40 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-black text-gray-800 dark:text-gray-100">
                التمرين {e.exercice} — {e.titleAr}
              </h3>
              <span className="text-xs font-black text-amber-700 dark:text-amber-300">({e.points} نقاط)</span>
            </header>
            <div className="p-4 space-y-3">
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-relaxed">{e.ideaAr}</p>

              <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <p className="font-black text-gray-500 dark:text-gray-400">المعطيات المقدمة :</p>
                <ul className="list-disc pr-5 space-y-0.5">
                  {e.supportsAr.map((s, i) => (
                    <li key={i} className="leading-relaxed">{s}</li>
                  ))}
                </ul>
              </div>

              <div className="text-xs text-gray-600 dark:text-gray-300">
                <span className="font-black text-gray-500 dark:text-gray-400">المنهاة المستهدفة : </span>
                {e.notionAr}
                <span className="font-black text-gray-500 dark:text-gray-400"> · الدورة : </span>
                {e.year}
              </div>

              <label
                className={`flex items-start gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${actif ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' : 'border-gray-200 dark:border-gray-800 hover:border-emerald-300'}`}
              >
                <input
                  type="checkbox"
                  checked={actif}
                  onChange={() => setCochees((c) => ({ ...c, [e.id]: !c[e.id] }))}
                  className="mt-1 w-4 h-4 accent-emerald-600"
                />
                <span className="flex-1 text-xs font-bold text-gray-800 dark:text-gray-100 leading-relaxed">
                  أنجزت هذا التمرين كاملاً على الورقة ({e.points} ن)
                </span>
              </label>
            </div>
          </section>
        );
      })}

      <div
        className={`p-4 rounded-2xl font-black text-center text-sm ${score >= 10 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'}`}
      >
        المجموع الذاتي : {score} / {sujet.totalPoints} —{' '}
        {score === 0 ? 'ابدأ بالحل على الورق ثم صحّح نفسك' : score >= 10 ? 'مستوى إيجابي، راجع ما سقط منه' : 'أعد مراجعة الدروس ثم أعِد المحاولة'}
      </div>
    </div>
  );
}
