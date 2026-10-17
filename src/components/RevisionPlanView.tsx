// RevisionPlanView.tsx — « خطة المراجعة النهائية » (audit item 14, sprint 15).
//
// L'élève à trois semaines du BAC n'a pas besoin d'une brique de plus : il a
// besoin de savoir QUOI FAIRE AUJOURD'HUI. Cette vue ne contient aucun contenu
// pédagogique propre — elle ordonne les 24 capsules, 17 schémas, 23 situations
// et 11 cartes déjà produits, sur le temps qui reste.
//
// Les cases cochées sont conservées dans localStorage : fermer l'app ne doit
// pas effacer une journée de travail. La clé inclut le couple (jours, minutes)
// pour qu'un changement de plan ne recycle pas une progression qui ne
// correspond plus aux mêmes tâches.

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Check, Clock, ListChecks, Printer } from 'lucide-react';
import { ARCHETYPE_BY_ID } from '../data/bacArchetypes';
import { readPlanSettings, writePlanSettings } from '../data/planSettings';
import { INITIAL_UNITS } from '../unitCatalog';
import {
  DIFFICULTY_BONUS,
  declaredWeight,
  observedWeight,
  prioritizedUnitIds,
  unitPriority,
  PRESETS,
  TASK_LABEL_AR,
  buildRevisionPlan,
  minutesByUnit,
  type PlanTask,
} from '../data/revisionPlan';

interface RevisionPlanViewProps {
  onBackToHome?: () => void;
  /**
   * Ouvre l'atelier d'écriture sur l'exercice demandé (sprint 26). Sans ce
   * rappel, la tâche « اكتب جواب تمرين 2023 » obligeait l'élève à retrouver
   * l'exercice à la main dans un autre onglet — le genre de friction qui
   * transforme une bonne tâche en tâche sautée.
   */
  onOpenRedaction?: (ideaId: string) => void;
}

const KIND_CLASS: Record<PlanTask['kind'], string> = {
  capsule: 'bg-[#fff7e0] text-[#8a6a00] dark:bg-black/20 dark:text-[#d9a400]',
  schema: 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400',
  montage: 'bg-[#f3e8ff] text-[#6b21a8] dark:bg-purple-500/10 dark:text-purple-300',
  redaction: 'bg-[#e0f2fe] text-[#075985] dark:bg-sky-500/10 dark:text-sky-300',
  situation: 'bg-[#e8f5ee] text-[#006d37] dark:bg-black/20 dark:text-[#2ecc71]',
  carte: 'bg-blue-50 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300',
};

const cleStockage = (d: number, m: number) => `kunz.revisionPlan.${d}x${m}`;

function chargerFait(cle: string): Set<string> {
  try {
    const brut = localStorage.getItem(cle);
    return new Set<string>(brut ? (JSON.parse(brut) as string[]) : []);
  } catch {
    return new Set<string>();
  }
}

export default function RevisionPlanView({ onBackToHome, onOpenRedaction }: RevisionPlanViewProps) {
  // Le réglage est partagé avec la carte d'accueil : elle doit montrer LE plan
  // de l'élève, pas un plan par défaut.
  const reglage = readPlanSettings();
  const [daysLeft, setDaysLeft] = useState(reglage.daysLeft);
  const [minutesPerDay, setMinutesPerDay] = useState(reglage.minutesPerDay);
  const [fait, setFait] = useState<Set<string>>(() => chargerFait(cleStockage(14, 90)));
  // Beaucoup d'élèves travaillent sur papier : la feuille du jour est
  // imprimable, avec les cases à cocher et les pièges des montages programmés.
  const [feuille, setFeuille] = useState(false);
  // « Pourquoi cet ordre ? » — un plan qui ne s'explique pas est un plan qu'on
  // n'applique pas, surtout quand il contredit la répartition officielle du
  // programme (U7 annoncée à 19 %, constatée à 3,3 %).
  const [explication, setExplication] = useState(false);

  const plan = useMemo(() => buildRevisionPlan({ daysLeft, minutesPerDay }), [daysLeft, minutesPerDay]);
  const parUnite = useMemo(() => minutesByUnit(plan), [plan]);
  const cle = cleStockage(daysLeft, minutesPerDay);

  useEffect(() => {
    setFait(chargerFait(cle));
  }, [cle]);

  useEffect(() => {
    writePlanSettings({ daysLeft, minutesPerDay });
  }, [daysLeft, minutesPerDay]);

  const basculer = (id: string) => {
    setFait((prec) => {
      const suivant = new Set(prec);
      if (suivant.has(id)) suivant.delete(id);
      else suivant.add(id);
      try {
        localStorage.setItem(cle, JSON.stringify([...suivant]));
      } catch {
        /* stockage indisponible : la session reste utilisable */
      }
      return suivant;
    });
  };

  const totalTaches = plan.totalTasks;
  const totalFait = plan.days.reduce(
    (s, j) => s + j.tasks.filter((t) => fait.has(`${j.day}:${t.kind}:${t.refId}`)).length,
    0,
  );
  const pourcent = totalTaches === 0 ? 0 : Math.round((totalFait / totalTaches) * 100);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto" dir="rtl" data-testid="revision-plan">
      <div className="flex flex-row-reverse items-center justify-between gap-4 mb-5">
        <div className="flex flex-row-reverse items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-gradient-to-l from-[#006d37] to-emerald-600 flex items-center justify-center shadow-md">
            <CalendarDays className="w-6 h-6 text-white" />
          </span>
          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-black text-[#1f1c0b] dark:text-gray-100">خطة المراجعة النهائية</h1>
            <p className="text-sm text-[#506072] dark:text-gray-400">
              لا محتوى جديداً — ترتيب لما بنيته: كبسولات، رسومات، وضعيات، خرائط
            </p>
          </div>
        </div>
        {onBackToHome && (
          <button
            data-testid="plan-retour"
            onClick={onBackToHome}
            className="flex flex-row-reverse items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f3f4f5] dark:bg-[#1f2622] border border-[#bbcbbb]/30 text-sm font-bold text-[#006d37] dark:text-[#2ecc71] cursor-pointer"
          >
            <span>العودة</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <section className="rounded-3xl p-4 bg-white dark:bg-[#141916] border border-[#bbcbbb]/30 mb-4">
        <p className="text-sm font-black text-[#1f1c0b] dark:text-gray-100 mb-2">كم بقي لك من الوقت؟</p>
        <div className="flex flex-row-reverse flex-wrap gap-2 mb-4">
          {PRESETS.map((p) => (
            <button
              key={p.labelAr}
              data-testid={`preset-${p.daysLeft}`}
              onClick={() => {
                setDaysLeft(p.daysLeft);
                setMinutesPerDay(p.minutesPerDay);
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer ${
                daysLeft === p.daysLeft && minutesPerDay === p.minutesPerDay
                  ? 'bg-[#006d37] text-white'
                  : 'bg-[#f3f4f5] dark:bg-[#1f2622] text-[#506072] dark:text-gray-300'
              }`}
            >
              {p.labelAr}
            </button>
          ))}
        </div>

        <label
          htmlFor="plan-jours-slider"
          className="block text-xs font-bold text-[#506072] dark:text-gray-300 mb-1"
        >
          الأيام المتبقية: <span data-testid="plan-jours">{daysLeft}</span>
        </label>
        <input
          id="plan-jours-slider"
          aria-label="عدد الأيام المتبقية قبل الامتحان"
          data-testid="plan-jours-slider"
          type="range"
          min={1}
          max={60}
          value={daysLeft}
          onChange={(e) => setDaysLeft(Number(e.target.value))}
          className="w-full mb-3 accent-[#006d37]"
        />

        <label
          htmlFor="plan-minutes-slider"
          className="block text-xs font-bold text-[#506072] dark:text-gray-300 mb-1"
        >
          دقائق يومياً: <span data-testid="plan-minutes">{minutesPerDay}</span>
        </label>
        <input
          id="plan-minutes-slider"
          aria-label="عدد الدقائق المتاحة يومياً"
          data-testid="plan-minutes-slider"
          type="range"
          min={20}
          max={180}
          step={10}
          value={minutesPerDay}
          onChange={(e) => setMinutesPerDay(Number(e.target.value))}
          className="w-full accent-[#006d37]"
        />
      </section>

      <section
        data-testid="plan-resume"
        className="rounded-3xl p-4 bg-[#fff9ed] dark:bg-black/20 border border-[#d9a400]/30 mb-4"
      >
        <div className="flex flex-row-reverse flex-wrap items-center gap-x-5 gap-y-1 text-sm text-[#1f1c0b] dark:text-gray-200">
          <span className="flex flex-row-reverse items-center gap-1.5">
            <ListChecks className="w-4 h-4" />
            {plan.totalTasks} مهمة
          </span>
          <span className="flex flex-row-reverse items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {Math.round(plan.totalMinutes / 60)} ساعة إجمالاً
          </span>
          <span>الوحدات المغطاة: {plan.coveredUnitIds.length} / 11</span>
          <span data-testid="plan-progression">أنجزت {pourcent}٪</span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
          <div className="h-full bg-[#006d37] transition-all" style={{ width: `${pourcent}%` }} />
        </div>
        <p className="mt-3 text-[12px] leading-6 text-[#506072] dark:text-gray-400">
          الترتيب يتبع وزن الوحدة في الامتحان مصحّحاً بصعوبتها الملاحظة: أكثر الوقت للوحدة{' '}
          {Object.entries(parUnite).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'}.
        </p>
        <button
          data-testid="basculer-explication"
          onClick={() => setExplication((v) => !v)}
          className="mt-2 text-[11px] font-bold px-3 py-1 rounded-xl bg-white dark:bg-[#141916] text-[#006d37] dark:text-[#2ecc71] cursor-pointer"
        >
          {explication ? 'إخفاء التفاصيل' : 'لماذا هذا الترتيب؟'}
        </button>
      </section>

      {explication && (
        <section
          data-testid="plan-explication"
          className="rounded-3xl p-4 bg-white dark:bg-[#141916] border border-[#bbcbbb]/30 mb-4"
        >
          <p className="text-[12px] leading-6 text-[#506072] dark:text-gray-400 text-right mb-3">
            لكل وحدة وزنان لا يتطابقان: الوزن المُعلن في توزيع البرنامج، و الضغط المُلاحظ فعلاً على
            10 دورات رسمية (2017 إلى 2026). الخطة تأخذ المتوسط بينهما، ثم تضيف علاوة الصعوبة.
          </p>
          <div className="space-y-1">
            {prioritizedUnitIds().map((unitId) => {
              const titre = INITIAL_UNITS.find((u) => u.id === unitId)?.title ?? `وحدة ${unitId}`;
              const minutes = parUnite[unitId] ?? 0;
              return (
                <p
                  key={unitId}
                  data-testid={`explication-unite-${unitId}`}
                  className="text-[11px] leading-6 text-[#1f1c0b] dark:text-gray-200 text-right"
                >
                  <span className="font-black">{titre}</span> — معلن {declaredWeight(unitId)}٪ · ملاحظ{' '}
                  {observedWeight(unitId)}٪ · علاوة الصعوبة {DIFFICULTY_BONUS[unitId] ?? 0} · الأولوية{' '}
                  {Math.round(unitPriority(unitId) * 10) / 10}
                  {minutes > 0 && <span className="text-[#006d37] dark:text-[#2ecc71]"> · {minutes} دقيقة في خطتك</span>}
                </p>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] leading-6 text-[#506072] dark:text-gray-400 text-right">
            الفارق الأكبر: وحدة تحويل الطاقة مُعلنة بـ 19٪ و لم تتجاوز 3,3٪ في عشر دورات، بينما
            تركيب البروتين مُعلن بـ 10٪ و يقود 19٪ من النقاط. الخطة لا تتبع أحدهما وحده.
          </p>
        </section>
      )}

      <div className="flex flex-row-reverse gap-2 mb-3">
        <button
          data-testid="imprimer-jour"
          onClick={() => {
            setFeuille(true);
            // L'impression est demandée après le rendu de la feuille.
            setTimeout(() => {
              try {
                window.print();
              } catch {
                /* environnement sans impression : la feuille reste lisible */
              }
            }, 0);
          }}
          className="flex flex-row-reverse items-center gap-2 px-4 py-2 rounded-2xl bg-[#1f1c0b] text-white text-xs font-bold cursor-pointer"
        >
          <span>ورقة اليوم للطباعة</span>
          <Printer className="w-4 h-4" />
        </button>
        {feuille && (
          <button
            data-testid="fermer-feuille"
            onClick={() => setFeuille(false)}
            className="px-4 py-2 rounded-2xl bg-[#f3f4f5] dark:bg-[#1f2622] text-xs font-bold text-[#506072] dark:text-gray-300 cursor-pointer"
          >
            إغلاق الورقة
          </button>
        )}
      </div>

      {feuille && plan.days[0] && (
        <section
          data-testid="feuille-impression"
          className="feuille-impression rounded-3xl p-4 bg-white dark:bg-[#141916] border-2 border-[#1f1c0b]/30 mb-4"
        >
          <style>{`@media print {
            body * { visibility: hidden !important; }
            .feuille-impression, .feuille-impression * { visibility: visible !important; }
            .feuille-impression { position: absolute; inset: 0; border: 0; }
          }`}</style>
          <h2 className="text-base font-black text-[#1f1c0b] dark:text-gray-100 mb-1">
            ورقة اليوم — {plan.days[0].totalMinutes} دقيقة
          </h2>
          <p className="text-[11px] text-[#506072] dark:text-gray-400 mb-3">
            {daysLeft} يوماً قبل الامتحان · علّم كل مهمة بعد إنجازها
          </p>
          <ol className="space-y-2">
            {plan.days[0].tasks.map((t) => (
              <li
                key={`feuille-${t.kind}-${t.refId}`}
                data-testid={`feuille-tache-${t.kind}:${t.refId}`}
                className="flex flex-row-reverse items-start gap-2 text-right"
              >
                <span className="shrink-0 w-4 h-4 mt-0.5 border-2 border-[#1f1c0b]/50 rounded" />
                <span>
                  <span className="text-[13px] font-bold text-[#1f1c0b] dark:text-gray-100">
                    {t.titleAr}
                  </span>
                  <span className="block text-[11px] text-[#506072] dark:text-gray-400">
                    {TASK_LABEL_AR[t.kind]} · {t.minutes} د — {t.actionAr}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          {plan.days[0].tasks.some((t) => t.kind === 'montage') && (
            <div data-testid="feuille-pieges" className="mt-3 pt-3 border-t border-[#1f1c0b]/20">
              <p className="text-[11px] font-black text-[#1f1c0b] dark:text-gray-100 mb-1">
                الفخاخ التي يجب تفاديها اليوم
              </p>
              <ul className="list-disc pr-4 space-y-1">
                {plan.days[0].tasks
                  .filter((t) => t.kind === 'montage')
                  .map((t) => ARCHETYPE_BY_ID[t.refId])
                  .filter(Boolean)
                  .map((a) => (
                    <li key={a.id} className="text-[11px] leading-6 text-[#1f1c0b] dark:text-gray-200 text-right">
                      <span className="font-bold">{a.titleAr}: </span>
                      {a.trapAr}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <div className="space-y-3">
        {plan.days.map((jour) => (
          <section
            key={jour.day}
            data-testid={`plan-jour-${jour.day}`}
            className="rounded-3xl p-4 bg-white dark:bg-[#141916] border border-[#bbcbbb]/30"
          >
            <div className="flex flex-row-reverse items-center justify-between mb-2">
              <h2 className="text-sm font-black text-[#1f1c0b] dark:text-gray-100">
                اليوم {jour.day}
                {jour.consolidationOnly && (
                  <span
                    data-testid={`plan-consolidation-${jour.day}`}
                    className="mr-2 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                  >
                    تثبيت فقط — لا شيء جديد
                  </span>
                )}
              </h2>
              <span className="text-[11px] font-bold text-[#506072] dark:text-gray-400">
                {jour.totalMinutes} دقيقة
              </span>
            </div>

            <ul className="space-y-2">
              {jour.tasks.map((t) => {
                const id = `${jour.day}:${t.kind}:${t.refId}`;
                const actif = fait.has(id);
                return (
                  <li key={id}>
                    <button
                      data-testid={`tache-${id}`}
                      onClick={() => basculer(id)}
                      aria-pressed={actif}
                      className={`w-full text-right flex flex-row-reverse items-start gap-2 px-3 py-2.5 rounded-2xl border transition-all cursor-pointer ${
                        actif
                          ? 'bg-[#e8f5ee] dark:bg-emerald-500/10 border-[#006d37]/40'
                          : 'bg-[#f8fbfa] dark:bg-black/20 border-[#bbcbbb]/30'
                      }`}
                    >
                      <span
                        className={`shrink-0 w-5 h-5 mt-0.5 rounded-lg flex items-center justify-center ${
                          actif ? 'bg-[#006d37] text-white' : 'bg-white dark:bg-[#1f2622]'
                        }`}
                      >
                        {actif && <Check className="w-3.5 h-3.5" />}
                      </span>
                      <span className="flex-1">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-lg mb-1 ${KIND_CLASS[t.kind]}`}>
                          {TASK_LABEL_AR[t.kind]} · الوحدة {t.unitId} · {t.minutes} د
                        </span>
                        <span className={`block text-sm font-bold text-[#1f1c0b] dark:text-gray-100 ${actif ? 'line-through opacity-60' : ''}`}>
                          {t.titleAr}
                        </span>
                        <span className="block text-[12px] text-[#506072] dark:text-gray-400">{t.actionAr}</span>
                      </span>
                    </button>
                    {t.kind === 'redaction' && onOpenRedaction && (
                      <button
                        data-testid={`ouvrir-redaction-${t.refId}`}
                        onClick={() => onOpenRedaction(t.refId)}
                        className="mt-1 mr-8 text-[11px] font-bold px-3 py-1 rounded-xl bg-[#006d37] text-white cursor-pointer"
                      >
                        افتح الورشة على هذا التمرين
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
