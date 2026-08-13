import { useMemo, useState } from 'react';
import { Target, CheckCircle2, Sparkles, BookOpen, ArrowLeft, AlertTriangle } from 'lucide-react';
import SpeechToTextInput from './SpeechToTextInput';
import { CoreReflexId, HYPOTHESIS_RBMA_MESSAGE } from '../data/reflexes';
import {
  getMethodologyQuestionPool,
  submitMethodologyAttempt,
  METHODOLOGY_TRAINER_VERBS,
  type MethodologyEvaluation,
  type MethodologyTrainerMissionMeta,
  type MethodologyVerbKey,
} from '../services/methodologyTrainerService';

interface Props {
  onClose?: () => void;
  initialVerb?: MethodologyVerbKey;
  // P1.1-B — une mission de réflexe ouvre l'entraînement sur le bon réflexe,
  // sans choix intermédiaire, et enregistre la preuve sur ce réflexe.
  missionReflexId?: CoreReflexId;
  missionMeta?: MethodologyTrainerMissionMeta;
  onMissionComplete?: (reflexId: CoreReflexId) => void;
}

export default function MethodologyTrainer({ onClose, initialVerb = 'analyse', missionReflexId, missionMeta, onMissionComplete }: Props) {
  const lockedReflex = missionReflexId != null;
  const resolvedVerb: MethodologyVerbKey = missionReflexId ?? initialVerb;
  const [verb, setVerb] = useState<MethodologyVerbKey>(resolvedVerb);
  const [qaIndex, setQaIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<MethodologyEvaluation | null>(null);
  const [missionDone, setMissionDone] = useState(false);

  const pool = useMemo(() => getMethodologyQuestionPool(verb), [verb]);
  const qa = pool[qaIndex % pool.length] ?? pool[0];
  const verbMeta = METHODOLOGY_TRAINER_VERBS[verb] ?? METHODOLOGY_TRAINER_VERBS.analyse;

  const handleValidate = (txt?: string) => {
    const nextAnswer = txt ?? answer;
    if (txt !== undefined) setAnswer(txt);

    const submission = submitMethodologyAttempt({
      text: nextAnswer,
      qa,
      reflexId: verb,
      missionReflexId,
      missionMeta,
    });

    setEvaluation(submission.evaluation);

    if (submission.missionCompleted && missionReflexId) {
      setMissionDone(true);
      onMissionComplete?.(missionReflexId);
    }
  };

  const next = () => {
    setEvaluation(null);
    setAnswer('');
    setQaIndex((index) => index + 1);
  };

  const resetForVerb = (nextVerb: MethodologyVerbKey) => {
    setVerb(nextVerb);
    setEvaluation(null);
    setAnswer('');
    setQaIndex(0);
    setMissionDone(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-[#141916] rounded-3xl border border-[#e2dabf]/60 dark:border-gray-800 shadow-sm p-5 md:p-7 space-y-5" dir="rtl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl text-white" style={{ background: verbMeta.color }}>
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-lg text-gray-900 dark:text-white">تدريب منهجي — {verbMeta.labelAr}</h3>
            <p className="text-[11px] text-[#506072] dark:text-gray-400">
              {lockedReflex
                ? `مهمة مرتبطة — روفلكس ${missionReflexId} (بلا اختيار يدوي)`
                : 'Kunz El Ouloum — gratuit • 100% offline • version Pro = تصحيح مفصّل + مواضيع BAC'}
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-xs font-bold text-[#506072] hover:text-[#006d37] px-3 py-1.5 rounded-lg bg-[#f3f4f5] dark:bg-white/5">إغلاق</button>
        )}
      </div>

      {/* Verb picker — verrouillé quand une mission de réflexe est active (P1.1-B). */}
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(METHODOLOGY_TRAINER_VERBS).map(([key, meta]) => {
          const nextVerb = key as MethodologyVerbKey;
          const isActive = verb === nextVerb;
          const disabled = lockedReflex;
          return (
            <button
              key={key}
              disabled={disabled}
              onClick={() => resetForVerb(nextVerb)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-black border transition-all ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${isActive ? 'text-white' : 'bg-white dark:bg-[#1a201c] text-[#506072] dark:text-gray-300 hover:brightness-95'}`}
              style={isActive ? { background: meta.color, borderColor: meta.color } : { borderColor: '#e2dabf88' }}
            >
              {meta.labelAr}
            </button>
          );
        })}
      </div>

      {/* Document / consigne */}
      <div className="bg-[#fff9ed] dark:bg-[#1c241f] border border-[#e2dabf]/60 dark:border-amber-900/30 rounded-2xl p-4 space-y-2">
        <div className="text-[11px] font-black text-[#944a00] dark:text-amber-300">📄 وضعية منهجية — {qa.category}</div>
        <p className="font-black text-[#1f1c0b] dark:text-white leading-7">{qa.question}</p>
        <p className="text-[12px] text-[#506072] dark:text-gray-400 leading-6">{qa.answer.slice(0, 180)}…</p>
        {qa.template && (
          <div className="text-[11px] bg-white dark:bg-black/20 border border-amber-200/50 dark:border-amber-900/30 rounded-xl px-3 py-2 font-bold text-amber-800 dark:text-amber-300">
            قالب: {qa.template}
          </div>
        )}
      </div>

      {/* Answer input */}
      <div className="space-y-3">
        <label className="text-xs font-black text-[#506072] dark:text-gray-300 flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-[#006d37]" />
          اكتب إجابتك المنهجية هنا (3–5 أسطر) — أو استعمل الميكروفون
        </label>
        <SpeechToTextInput
          placeholder="تمثل الوثيقة … حيث نلاحظ … ومنه نستنتج …"
          expectedKeywords={[...qa.keywords.slice(0, 4), ...(verbMeta.keywords.slice(0, 3) || [])]}
          onValidate={handleValidate}
          lang="ar-DZ"
        />
        <textarea
          value={answer}
          onChange={(event) => { setAnswer(event.target.value); setEvaluation(null); }}
          rows={4}
          className="w-full bg-[#f8f9fa] dark:bg-[#0f1411] border border-[#e2dabf]/60 dark:border-gray-800 rounded-2xl p-3 text-sm leading-8 font-medium text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#006d37]/20"
          placeholder="اكتب هنا: مقدمة قصيرة — عرض بالأدلة — خاتمة …"
          dir="rtl"
        />
        <div className="flex justify-between items-center text-[11px] text-[#506072] dark:text-gray-400">
          <span>{answer.trim().length} حرف — الهدف ≥ 120 حرف</span>
          <span>الكلمات المفتاحية المتوقعة: {qa.keywords.slice(0, 3).join(' • ')}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleValidate()}
            disabled={answer.trim().length < 15}
            className="px-5 py-2.5 bg-[#006d37] hover:bg-[#00562b] disabled:opacity-40 text-white rounded-xl font-black text-sm shadow-sm cursor-pointer"
          >
            صحّح محلياً
          </button>
          {evaluation && (
            <button onClick={next} className="px-4 py-2.5 bg-[#fff9ed] border border-[#e2dabf] text-[#944a00] rounded-xl font-bold text-sm cursor-pointer flex items-center gap-1">
              سؤال موالي <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Result */}
      {evaluation && (
        <div className="space-y-3 animate-in fade-in">
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`px-4 py-2 rounded-2xl font-black text-white text-sm ${evaluation.score >= 70 ? 'bg-[#006d37]' : evaluation.score >= 45 ? 'bg-amber-600' : 'bg-rose-600'}`}>
              {evaluation.score} / 100
            </div>
            <div className="text-xs font-bold text-[#506072] dark:text-gray-300">
              كلمات مفتاحية {evaluation.kwPct}% • روابط {evaluation.connPct}% • بنية {evaluation.structPct}%
            </div>
          </div>

          {evaluation.isKeywordStuffing && (
            <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 p-3 text-[12px] font-bold leading-7 text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-1" />
              <div>
                لا تكتفِ بسرد المصطلحات: المطلوب فقرة مُحرَّرة بجُمَل كاملة تربط بين المعطيات.
                في البكالوريا تُنقَّط الصياغة العلمية لا عدد الكلمات المفتاحية.
              </div>
            </div>
          )}

          {evaluation.forbiddenFound.length > 0 && (
            <div className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 p-3 text-[12px] font-bold leading-7 text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-1" />
              <div>
                <div>استعملت عبارة ممنوعة في هذا الروفلكس: {evaluation.forbiddenFound.join(' • ')}</div>
                {verb === 'hypothesize' && <div className="mt-1 whitespace-pre-line">{HYPOTHESIS_RBMA_MESSAGE}</div>}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-3 text-xs">
            <div className="bg-[#f8f9fa] dark:bg-black/20 border border-[#e2dabf]/40 dark:border-gray-800 rounded-xl p-3">
              <div className="font-black mb-1 text-[#006d37] flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> كلمات وُجدت</div>
              <div className="flex flex-wrap gap-1">
                {evaluation.kwFound.length ? evaluation.kwFound.map((keyword, index) => (
                  <span key={index} className="bg-[#2ecc71]/15 text-[#006d37] px-2 py-0.5 rounded-full font-bold">✓ {keyword}</span>
                )) : <span className="text-gray-400">— لا شيء بعد</span>}
              </div>
            </div>
            <div className="bg-[#fff9ed] dark:bg-amber-950/10 border border-[#e2dabf]/40 dark:border-amber-900/30 rounded-xl p-3">
              <div className="font-black mb-1 text-amber-700 dark:text-amber-300">أدوات ربط منهجية</div>
              <div className="flex flex-wrap gap-1">
                {evaluation.connFound.length ? evaluation.connFound.map((connector, index) => (
                  <span key={index} className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full font-bold">{connector}</span>
                )) : <span className="text-gray-400">أضف: لأن • يعود • ومنه • بينما</span>}
              </div>
            </div>
          </div>

          <div className={`p-3 rounded-xl text-[12px] leading-7 font-bold border ${evaluation.score >= 70 ? 'bg-[#2ecc71]/10 text-[#006d37] border-[#2ecc71]/20' : evaluation.score >=45 ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-200 dark:border-amber-900/40' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/40'}`}>
            {evaluation.forbiddenFound.length > 0
              ? 'أعد الصياغة مع فرضية محددة وقابلة للاختبار، دون استعمال لفظ احتمالي ممنوع.'
              : evaluation.score >= 70 ? 'ممتاز منهجياً! أضفت الكلمات المفتاحية + أدوات الربط + بنية واضحة.' :
                evaluation.score >= 45 ? 'جيد، لكن ناقص: أضف 1–2 كلمات مفتاحية من القائمة، وابدأ بصيغة أدق ثم اختم بخلاصة واضحة.' :
                'أعد المحاولة: اكتب 3 جمل — تعريف الوثيقة أو المشكل، ربط علمي واضح، ثم خلاصة أو حكم منهجي.'}
          </div>

          {/* Pro teaser */}
          <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-transparent border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-4 text-[12px] leading-6">
            <div className="font-black text-indigo-700 dark:text-indigo-300 flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4" /> Kunz Pro — تصحيح BAC كامل
            </div>
            <p className="text-[#504441] dark:text-gray-300 font-medium">
              هنا تدريب مجاني محلّي: كلمات مفتاحية + روابط. 
              في <strong>Kunz Pro</strong> تحصل على: 3 مواضيع BAC كاملة، مصحح مدمج بالتنقيط الوزاري، تتبع أخطائك أسبوع بأسبوع، وAPI key للمراجعة الذكية العميقة.
            </p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <a href="https://github.com/sinamind414/kunz-el-ouloum" target="_blank" rel="noreferrer" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs shadow-sm cursor-pointer">
                اكتشف Kunz Pro →
              </a>
              <button onClick={next} className="px-4 py-2 bg-white dark:bg-[#141916] border border-indigo-200 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold text-xs cursor-pointer">
                تمرين مجاني آخر
              </button>
            </div>
            <p className="text-[10px] text-[#7a6a5a] dark:text-gray-400 mt-2">Kunz El Ouloum يبقى مجانياً 100% لفهم الدروس ومنطق الآليات. Pro = immersion BAC.</p>
          </div>
        </div>
      )}

      {/* P1.1-B — bannière de fin de mission : preuve réelle enregistrée. */}
      {lockedReflex && missionDone && (
        <div className="rounded-2xl p-4 bg-[#2ecc71]/10 border border-[#2ecc71]/20 text-center space-y-2">
          <div className="font-black text-[#006d37] flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> تمّت المهمة — أُثبِت الروفلكس {missionReflexId} فعلياً
          </div>
          <p className="text-[11px] text-[#506072] dark:text-gray-400">العودة إلى مسارك بعد التأكيد.</p>
          <button
            onClick={onClose}
            className="mx-auto px-5 py-2.5 bg-[#006d37] hover:bg-[#00562b] text-white rounded-xl font-black text-sm shadow-sm cursor-pointer flex items-center gap-2"
          >
            رجوع إلى مساري <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
