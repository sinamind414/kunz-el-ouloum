import {
  DRILL_BANK, PHASE0_DEMOS, completePhase0, resetPhase0, gradeDrill,
  DRILL_LABELS,
} from '../data/drillBank';
import type { DrillAnswer, DrillConsigne, DrillGrade } from '../data/drillBank';
import {
  getDrillStatus, isExtensionUnlocked, recordDrillResult, getMasteryStatus,
} from '../data/v3Progress';

type DrillStatus = ReturnType<typeof getDrillStatus>;
type MasteryStatus = ReturnType<typeof getMasteryStatus>;

interface Phase0DrillSectionProps {
  phase0Done: boolean;
  setPhase0Done: (v: boolean) => void;
  p0Index: number;
  setP0Index: (v: number | ((i: number) => number)) => void;
  p0Pick: DrillAnswer;
  setP0Pick: (v: DrillAnswer | ((p: DrillAnswer) => DrillAnswer)) => void;
  p0Shown: boolean;
  setP0Shown: (v: boolean) => void;
  drillActive: boolean;
  setDrillActive: (v: boolean) => void;
  drillSec: number;
  setDrillSec: (v: number | ((s: number) => number)) => void;
  drillAnswers: Record<string, DrillAnswer>;
  setDrillAnswers: (
    v: Record<string, DrillAnswer> | ((a: Record<string, DrillAnswer>) => Record<string, DrillAnswer>),
  ) => void;
  drillGrade: DrillGrade | null;
  setDrillGrade: (g: DrillGrade | null) => void;
  drillStatus: DrillStatus;
  setDrillStatus: (s: DrillStatus) => void;
  masteryStatus: MasteryStatus;
  DRILL_TODAY: DrillConsigne[];
  setExtensionUnlocked: (v: boolean) => void;
}

export default function Phase0DrillSection({
  phase0Done, setPhase0Done, p0Index, setP0Index, p0Pick, setP0Pick, p0Shown, setP0Shown,
  drillActive, setDrillActive, drillSec, setDrillSec, drillAnswers, setDrillAnswers,
  drillGrade, setDrillGrade, drillStatus, setDrillStatus, masteryStatus, DRILL_TODAY,
  setExtensionUnlocked,
}: Phase0DrillSectionProps) {

  return (
<>
          {/* Phase 0 — افتح الباب : 6 éléments auto-pace avec feedback (audit §6) */}
          {/* Phase 0 — افتح الباب : 6 éléments auto-pace, cascade des 3 portes (MARQUE §12) */}
          {!phase0Done && (() => {
            const demo = PHASE0_DEMOS[p0Index];
            const item = DRILL_BANK.find(c => c.id === demo.bankId)!;
            const ok1 = p0Pick.g1 === item.existence;
            const ok2 = item.source === null ? true : p0Pick.g2 === item.source;
            const ok3 = item.movement === 'drawer' ? true : p0Pick.g3 === item.movement;
            const allOk = ok1 && ok2 && ok3;
            const answered = !!p0Pick.g1 && (item.source === null || !!p0Pick.g2) && (item.movement === 'drawer' || !!p0Pick.g3);
            const btnCls = (active: boolean, correct: boolean, tone: string) =>
              p0Shown ? `${correct ? 'bg-emerald-600 text-white border-emerald-600' : `bg-white dark:bg-[#1b221e] border-gray-300 opacity-60`}`
                      : (active ? `bg-${tone}-600 text-white border-${tone}-600` : 'bg-white dark:bg-[#1b221e] border-gray-300');
            return (
              <div className="bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-950/30 dark:to-amber-950/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-black text-sm">🚪 Phase 0 — افتح الباب <span className="text-xs font-bold text-gray-500">({p0Index + 1}/6)</span></div>
                  <button onClick={()=>{resetPhase0(); setP0Index(0); setP0Pick({}); setP0Shown(false);}} className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline">إعادة</button>
                </div>
                <div className="bg-white dark:bg-[#161c18] p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold">{item.consigne}</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <div className="text-[11px] font-bold text-gray-500 mb-1">🚪 البوابة 1 — قفل؟</div>
                    <div className="flex gap-1">
                      {([['lock','🔒 قفل'],['no_lock','🧠 لا قفل']] as const).map(([v,l])=>(
                        <button key={v} disabled={p0Shown} onClick={()=> setP0Pick(pk=>({...pk, g1: v}))} className={`px-2 py-1.5 rounded-lg text-xs font-bold border ${btnCls(p0Pick.g1===v, p0Shown && v===item.existence, 'emerald')}`}>{l}</button>
                      ))}
                    </div>
                  </div>
                  {p0Pick.g1 === 'lock' && (
                    <div>
                      <div className="text-[11px] font-bold text-gray-500 mb-1">📥 البوابة 2 — المصدر؟</div>
                      <div className="flex gap-1">
                        {([['document','📄 وثيقة'],['mixed','📄+🧠 مختلط']] as const).map(([v,l])=>(
                          <button key={v} disabled={p0Shown} onClick={()=> setP0Pick(pk=>({...pk, g2: v}))} className={`px-2 py-1.5 rounded-lg text-xs font-bold border ${btnCls(p0Pick.g2===v, p0Shown && v===item.source, 'sky')}`}>{l}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {p0Pick.g1 === 'lock' && p0Pick.g2 && (
                    <div>
                      <div className="text-[11px] font-bold text-gray-500 mb-1">⚙️ البوابة 3 — الحركة؟</div>
                      <div className="flex gap-1">
                        {([['photo','📷'],['film','🎬'],['smith','🔨']] as const).map(([v,l])=>(
                          <button key={v} disabled={p0Shown} onClick={()=> setP0Pick(pk=>({...pk, g3: v}))} className={`px-2 py-1.5 rounded-lg text-xs font-bold border ${btnCls(p0Pick.g3===v, p0Shown && v===item.movement, 'violet')}`}>{l}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {p0Shown ? (
                  <div className="space-y-1.5">
                    <div className={`text-xs font-bold ${allOk ? 'text-emerald-600' : 'text-amber-600'}`}>{allOk ? '✅ صحيح — القفل فُتح' : '✗ الإجابة الصحيحة مظللة أعلاه'}</div>
                    <div className="text-[11px] text-gray-600 dark:text-gray-400">{demo.whyAr}</div>
                    <button onClick={()=>{ if (p0Index + 1 >= PHASE0_DEMOS.length) { completePhase0(); setPhase0Done(true); } else { setP0Index(i=>i+1); setP0Pick({}); setP0Shown(false); } }} className="px-4 py-1.5 bg-[#006d37] text-white rounded-xl font-bold text-xs">{p0Index + 1 >= PHASE0_DEMOS.length ? '✅ إنهاء Phase 0 — المصفاة مفتوحة' : 'التالي'}</button>
                  </div>
                ) : (
                  <button disabled={!answered} onClick={()=> setP0Shown(true)} className={`px-4 py-1.5 rounded-xl font-bold text-xs ${answered ? 'bg-amber-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}>تأكيد</button>
                )}
              </div>
            );
          })()}

          {/* V3.1 مصفاة التعليمات — 60s 12 consignes (débloque verso) */}
          <div className="bg-gradient-to-r from-amber-50 to-sky-50 dark:from-amber-950/20 dark:to-sky-950/20 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <div className="font-black text-sm flex items-center gap-2">🧠 مصفاة التعليمات — 60 ث <span className="text-xs bg-white dark:bg-black/20 px-2 py-0.5 rounded-full border">3 أيام × 12/12 → شارة «حامل المفتاح» + المرحلة 2</span></div>
              <div className="text-xs text-gray-600 dark:text-gray-400">ورقة أم رأس؟ 🚪 قفل؟ 📥 من أين؟ ⚙️ أي حركة؟ {drillStatus.met ? '✅ ' + drillStatus.badgeAr : `أيام ناجحة: ${drillStatus.perfectDays} / ${drillStatus.goal}`} — الإخفاق لا يصفّر: يؤجل اليوم التالي فقط · الورقة الخلفية: {masteryStatus.met ? '✅ ' + masteryStatus.badgeAr : `إتقان ${masteryStatus.types.length} / ${masteryStatus.goal} أنواع`}</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">تتبدل التعليمات كل يوم (بنك 69) — القاعدة واحدة: احفظ القاعدة لا العناصر</div>
            </div>
            {!drillActive ? (
              <button disabled={!phase0Done} onClick={()=>{setDrillAnswers({}); setDrillGrade(null); setDrillSec(60); setDrillActive(true);}} className={`px-4 py-2 rounded-xl font-bold text-xs shadow ${phase0Done ? 'bg-[#006d37] text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'}`}>{phase0Done ? (drillStatus.met ? 'إعادة المصفاة' : 'ابدأ المصفاة') : '🔒 أكمل Phase 0 أولا'}</button>
            ) : (
              <div className="font-mono font-black text-lg bg-black/10 px-3 py-1 rounded-xl">{drillSec} ث</div>
            )}
          </div>
{drillActive && (
            <div className="bg-white dark:bg-[#161c18] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {DRILL_TODAY.map((c, i)=> (
                  <div key={c.id} className="p-2 rounded-xl border bg-gray-50 dark:bg-black/20 space-y-1">
                    <span className="text-xs font-bold leading-tight">{i + 1}. {c.consigne}</span>
                    <div className="flex flex-wrap items-center gap-1">
                      {([['lock','🔒 قفل'],['no_lock','🧠 لا قفل']] as const).map(([v,l])=> (
                        <button key={v} onClick={()=> setDrillAnswers(a=> ({...a, [c.id]: {...a[c.id], g1: v}}))} className={`px-2 py-1 rounded-lg text-[11px] font-bold border ${drillAnswers[c.id]?.g1===v ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-[#1b221e] border-gray-300'}`}>{l}</button>
                      ))}
                      {drillAnswers[c.id]?.g1 === 'lock' && (
                        <>
                          <span className="w-1 shrink-0" />
                          {([['document','📄 وثيقة'],['mixed','📄+🧠 مختلط']] as const).map(([v,l])=> (
                            <button key={v} onClick={()=> setDrillAnswers(a=> ({...a, [c.id]: {...a[c.id], g2: v}}))} className={`px-2 py-1 rounded-lg text-[11px] font-bold border ${drillAnswers[c.id]?.g2===v ? 'bg-sky-600 text-white border-sky-600' : 'bg-white dark:bg-[#1b221e] border-gray-300'}`}>{l}</button>
                          ))}
                        </>
                      )}
                      {drillAnswers[c.id]?.g1 === 'lock' && drillAnswers[c.id]?.g2 && (
                        <>
                          <span className="w-1 shrink-0" />
                          {([['photo','📷'],['film','🎬'],['smith','🔨']] as const).map(([v,l])=> (
                            <button key={v} onClick={()=> setDrillAnswers(a=> ({...a, [c.id]: {...a[c.id], g3: v}}))} className={`px-2 py-1 rounded-lg text-[11px] font-bold border ${drillAnswers[c.id]?.g3===v ? 'bg-violet-600 text-white border-violet-600' : 'bg-white dark:bg-[#1b221e] border-gray-300'}`}>{l}</button>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={()=>{
                const g = gradeDrill(DRILL_TODAY, drillAnswers);
                setDrillGrade(g);
                recordDrillResult(g.score);
                setDrillStatus(getDrillStatus());
                setExtensionUnlocked(isExtensionUnlocked());
                setDrillActive(false);

              }} className="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm">صحّح — {gradeDrill(DRILL_TODAY, drillAnswers).results.filter(r=>r.answered).length}/12</button>
            </div>
          )}
          {/* Phase 1 — résultats de la tentative du jour */}
          {drillGrade && !drillActive && (
            <div className="bg-white dark:bg-[#161c18] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
              <div className="font-black text-sm flex items-center justify-between">
                <span>نتيجة اليوم — {drillGrade.score}/12</span>
                <span className="text-xs text-gray-500">{drillStatus.met ? '✅ ' + drillStatus.badgeAr : `أيام ناجحة: ${drillStatus.perfectDays} / ${drillStatus.goal}`}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {drillGrade.results.map(r=> (
                  <div key={r.c.id} className={`p-1.5 rounded-lg text-[11px] border ${r.correct ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40' : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/40'}`}>
                    <span className="font-bold">{r.correct ? '✓' : '✗'} {r.c.consigne}</span>
                    {!r.correct && (() => {
                      const fail = [!r.ok1 ? 'البوابة 1' : null, !r.ok2 ? 'البوابة 2' : null, !r.ok3 ? 'البوابة 3' : null].filter(Boolean).join(' + ');
                      const ok = `${DRILL_LABELS.g1[r.c.existence]} · ${r.c.source ? DRILL_LABELS.g2[r.c.source] : '—'} · ${DRILL_LABELS.g3[r.c.movement]}`;
                      return <span className="block text-gray-500 dark:text-gray-400">الصحيح: {ok} — الخطأ: {fail}</span>;
                    })()}
                  </div>
                ))}
              </div>
            </div>
          )}
</>
  );
}
