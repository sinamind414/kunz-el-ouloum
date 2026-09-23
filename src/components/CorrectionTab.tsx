import { getCorrectionQueue, correctionStats, markCorrection, setRealScore } from '../utils/correctionQueue';
import { calibrationStats, calibrationMessageAr, gapOf } from '../utils/calibration';
import CorrecteurPanel from './CorrecteurPanel';

interface CorrectionTabProps {
  realScoreDrafts: Record<string, string>;
  setRealScoreDrafts: (fn: (d: Record<string, string>) => Record<string, string>) => void;
  setCorrectionVersion: (fn: (v: number) => number) => void;
}


export default function CorrectionTab({ realScoreDrafts, setRealScoreDrafts, setCorrectionVersion }: CorrectionTabProps) {

        const queue = getCorrectionQueue();
        const stats = correctionStats();

  return (
<>

          <section className="space-y-4">
            <div className="bg-white dark:bg-[#161c18] p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">المصححة — قائمة التصحيح</h2>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                القاعدة: الآلة تحقّق من الشكل (3 بوابات) — الأستاذ يضمن المضمون. كل إنتاج «صحيح الشكل» يصل هنا.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">بانتظار: {stats.pending}</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300">مضمونها سليم: {stats.approved}</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300">تحتاج تصحيحا: {stats.corrections}</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-800/70 text-slate-800 dark:text-slate-300">📝 امتحانات: {stats.examCount}</span>
              </div>
              {(() => {
                const cs = calibrationStats(queue);
                if (cs.n === 0) return null;
                const msg = calibrationMessageAr(cs);
                return (
                  <div className="mt-3 p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold">
                      <span className="text-sky-900 dark:text-sky-300">🪞 المعايرة — توقع مقابل حقيقي (n={cs.n}):</span>
                      <span className="text-gray-700 dark:text-gray-300">متوسط العبر {cs.meanGap! >= 0 ? '+' : ''}{cs.meanGap!.toFixed(1)} · |المتوسط| {cs.meanAbsGap!.toFixed(1)}</span>
                      <span className="text-amber-700 dark:text-amber-300">مبالغة {cs.overconfident}</span>
                      <span className="text-emerald-700 dark:text-emerald-300">تواضع {cs.underconfident}</span>
                      <span className="text-sky-700 dark:text-sky-300">مضبوط {cs.calibrated}/{cs.n}</span>
                    </div>
                    {cs.spark.length >= 2 && (
                      <div className="flex items-end gap-0.5 h-6" title="|العبر| — آخر 5">
                        {cs.spark.map((v, i) => (
                          <div key={i} className="w-2.5 bg-sky-400/80 rounded-t" style={{ height: `${Math.max(8, Math.min(100, (v / 10) * 100))}%` }} />
                        ))}
                      </div>
                    )}
                    {msg && <p className="text-[11px] leading-relaxed text-sky-800 dark:text-sky-400 font-medium">{msg}</p>}
                  </div>
                );
              })()}
            </div>
            {queue.length === 0 ? (
              <div className="bg-white dark:bg-[#161c18] p-8 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-center text-sm text-gray-400">
                لا إنتاجات بعد — أرسل إنتاجاً من المحاكاة (الشكل الصحيح يصل تلقائياً إلى هنا).
              </div>
            ) : (
              <div className="space-y-3">
                {queue.map(item => (
                  <div key={item.id} className={`bg-white dark:bg-[#161c18] p-4 rounded-2xl border shadow-sm ${item.status === 'pending' ? 'border-amber-200 dark:border-amber-900/50' : item.status === 'approved' ? 'border-emerald-200 dark:border-emerald-900/50' : 'border-red-200 dark:border-red-900/50'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-black text-sm text-gray-900 dark:text-white">{item.verbAr} {item.theme ? <span className="text-xs font-bold text-gray-400">· {item.theme}</span> : null}</div>
                      <div className="flex items-center gap-2 text-[11px] font-bold">
                        <span className="text-gray-400">{new Date(item.dateISO).toLocaleDateString('fr-DZ')}</span>
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300">ICM {item.icm}%</span>
                        {item.mode === 'examen' && <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800/70 text-slate-800 dark:text-slate-300">📝 امتحان — 60د</span>}
                        <span className={`px-2 py-0.5 rounded-full ${item.status === 'pending' ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300' : item.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300'}`}>
                          {item.status === 'pending' ? 'بانتظار المصحح' : item.status === 'approved' ? 'المضمون سليم' : 'تحتاج تصحيحاً'}
                        </span>
                      </div>
                    </div>
                    {item.errorTags.length > 0 && (
                      <div className="mt-1 text-[11px] text-gray-400 font-bold">أخطاء الشكل المرصودة: {item.errorTags.join(' · ')}</div>
                    )}
                    {(item.selfScore != null || item.realScore != null || item.status === 'pending') && (
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {item.selfScore != null && (
                          <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 text-[11px] font-bold">التوقع: {item.selfScore}/20</span>
                        )}
                        {item.realScore != null && (
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 text-[11px] font-bold">الحقيقي: {item.realScore}/20</span>
                        )}
                        {(() => {
                          const g = gapOf(item);
                          if (g === null) return null;
                          const tone = Math.abs(g) <= 1 ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300' : Math.abs(g) <= 3 ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300' : 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300';
                          return <span className={`px-2 py-0.5 rounded-full ${tone} text-[11px] font-black`}>العبر {g > 0 ? '+' : ''}{g} — {g > 0 ? 'مبالغة' : g < 0 ? 'تواضع' : 'معايرة مثالية'}</span>;
                        })()}
                        {item.status === 'pending' && (
                          <span className="flex items-center gap-1.5 mr-auto">
                            <input
                              type="number" min={0} max={20} step={0.25}
                              placeholder="النقطة الفعلية /20"
                              value={realScoreDrafts[item.id] ?? ''}
                              onChange={(e) => setRealScoreDrafts(d => ({ ...d, [item.id]: e.target.value }))}
                              className="w-28 px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black/30 text-xs font-bold text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-sky-500"
                            />
                            <button
                              disabled={realScoreDrafts[item.id] === ''}
                              onClick={() => {
                                const v = Number(realScoreDrafts[item.id]);
                                setRealScore(item.id, v);
                                setRealScoreDrafts(d => ({ ...d, [item.id]: '' }));
                                setCorrectionVersion(x => x + 1);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${realScoreDrafts[item.id] !== '' ? 'bg-sky-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}
                            >حفظ النقطة الفعلية</button>
                          </span>
                        )}
                      </div>
                    )}
                    <p className="mt-2 text-xs leading-relaxed text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-black/20 p-3 rounded-xl whitespace-pre-line max-h-40 overflow-y-auto">{item.text}</p>
                    {/* المصحح الآلي — تحليل المفاهيم (dictionnaire final) + sanctions + barème */}
                    <CorrecteurPanel text={item.text} />
                    {item.status === 'pending' ? (
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <button onClick={()=>{ markCorrection(item.id, 'approved'); setCorrectionVersion(v=>v+1); }} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs">✅ المضمون سليم</button>
                        <button onClick={()=>{ markCorrection(item.id, 'corrections'); setCorrectionVersion(v=>v+1); }} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs">✏️ تحتاج تصحيحاً</button>
                      </div>
                    ) : item.noteAr ? (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">ملاحظة المصحح: {item.noteAr}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>
</>
  );
}
