// src/components/BoussoleCard.tsx
// Fiche élève · 1 page A4 · arabe seul · à imprimer. V3.1 : double porte ورقة/رأس + صورة/فيلم,
// preservation estompé si non débloqué, STEP0 et عام/خاص en note. Sans logique lourde.
import {
  VERB_CARDS_V2, STEP_NAMES_AR, STEP_TEMPLATES, StepId, VerbCardV2, Step3Mode,
  MEMORY_TEMPLATES, STEP0_TEMPLATE_AR,
} from '../data/methodologyEngine';

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
const ar = (n: number) => String(n).split('').map(d => AR_DIGITS[+d]).join('');

const pathAr = (c: VerbCardV2) => c.path.map(String).join(' ← ');

const STEP_HINTS: Record<StepId, string[]> = {
  1: ['الفعل: ………', 'المطلوب: ………', '(في المسودة فقط)'],
  2: ['قيمة + وحدة إن وُجدت', 'كل وثيقة تُذكَر'],
  3: ['علاقة أو آلية', 'لا «ربما» ولا «لعل»'],
  4: ['تُعيد صياغة «المطلوب»', 'جملة، لا قائمة أرقام'],
};

const CHECKS: Record<StepId, string> = {
  4: 'هل هناك جملة ختامية تُجيب المطلوب ؟',
  3: 'إن كان مفتوحًا: هل كل تأكيد له «لأنّ» ؟ — إن كان مغلقًا: هل تسلّلت «لأنّ» ؟',
  2: 'هل ذكرتُ الوثيقة والوحدة ؟',
  1: 'هل احترمتُ الفعل ؟',
};

export default function BoussoleCard() {
  const memoryVerbs = VERB_CARDS_V2.filter(c => c.id === 'verb_define_v1' || c.id === 'verb_list_v1');
  const paperVerbs = VERB_CARDS_V2.filter(c => c.id !== 'verb_define_v1' && c.id !== 'verb_list_v1');
  const closed = paperVerbs.filter(c => c.switch === 'closed');
  const open   = paperVerbs.filter(c => c.switch === 'open');

  return (
    <article dir="rtl" lang="ar" className="boussole-card mx-auto max-w-[210mm] p-6 text-[13px] leading-relaxed print:p-4">
      <header className="text-center border-b-2 border-black pb-2 mb-3">
        <h1 className="text-xl font-black">بوصلة الإجابة — علوم الطبيعة والحياة</h1>
        <p className="mt-1">قبل كل إجابة: أربع خطوات، ومفتاحان. {STEP0_TEMPLATE_AR.split('—')[0].trim()} ثم الإبهام: 0 · 1 · 2 · 3 · 4</p>
      </header>

      {/* المفتاحان V3.1 — Gate1 ورقة/رأس + Gate2 صورة/فيلم (renommage de مغلق/مفتوح) */}
      <section className="border-2 border-black rounded-lg p-3 mb-3">
        <h2 className="font-black text-base mb-2">🔑 المفتاح 1 — ورقة أم رأس؟</h2>
        <p className="text-[11px] mb-2">هل سطّرتَ وثيقة/شكل/جدول/منحنى/رسم؟ لا → 🧠 رأس (حفظ) · نعم → 📄 ورقة → المفتاح 2</p>
        <div className="grid grid-cols-2 gap-3 text-[11px]">
          <div><span className="font-black">🧠 رأس:</span> {memoryVerbs.map(v=>v.verbAr).join(' · ')} — {MEMORY_TEMPLATES.define.ar.slice(0,22)}… / {MEMORY_TEMPLATES.list.ar.slice(0,18)}…</div>
          <div><span className="font-black">📄 ورقة:</span> {paperVerbs.length} أفعال — تمرّ إلى المفتاح 2</div>
        </div>
        <h2 className="font-black text-base mt-3 mb-2">🔑 المفتاح 2 — صورة أم فيلم؟</h2>
        <div className="grid grid-cols-2 gap-3">
          <VerbFamily title="📷 صورة — لا «لأنّ»" cards={closed} />
          <VerbFamily title="🎬 فيلم — «لأنّ» مطلوبة" cards={open} />
        </div>
        <p className="text-[11px] mt-2">«معلوماتك + الوثيقة» → 📄 ورقة بعمودين [من الوثيقة | من الدرس]</p>
      </section>

      {/* الخطوات الأربع */}
      <section className="grid grid-cols-4 gap-2 mb-3">
        {([1, 2, 3, 4] as StepId[]).map(step => (
          <div key={step} className="border border-black rounded-lg p-2 min-h-[34mm]">
            <div className="font-black text-base">{step} {STEP_NAMES_AR[step]}</div>
            {step === 3 && <div className="text-[11px] mt-0.5">«لأنّ» ← إن كان المفتاح مفتوحًا فقط</div>}
            <ul className="mt-1 space-y-0.5">
              {templatesFor(step).map(t => <li key={t} className="font-bold">«{t}»</li>)}
              {STEP_HINTS[step].map(h => <li key={h}>{h}</li>)}
            </ul>
          </div>
        ))}
      </section>

      {/* الفحص */}
      <section className="border border-black rounded-lg p-2 mb-3">
        <div className="font-black">✅ الفحص = الخطوات نفسها من الأخير إلى الأول:</div>
        <ul className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5">
          {([4, 3, 2, 1] as StepId[]).map(s => (
            <li key={s}><span className="font-bold">{s}</span> {CHECKS[s]}</li>
          ))}
        </ul>
      </section>

      {/* الزمن */}
      <section className="mb-3">
        <span className="font-black">⏳ الزمن (يتناسب مع النقاط): </span>
        الربع الأول: مسودة — اقرأ وحدّد المعطيات · النصف: اكتب 2 و 3 · الربع الأخير: 4 + الفحص — لا يُفاوَض عليه.
      </section>

      <footer className="text-center font-black text-sm border-t-2 border-black pt-2">
        « لا خاتمةَ قبل حُجّة، ولا حُجّةَ قبل مُعطى، ولا مُعطى قبلَ فَهْمِ السؤال »
      </footer>
    </article>
  );
}

/** Étape → moules. L'étape 3 fusionne les moules des modes réellement présents dans les cards. */
function templatesFor(step: StepId): string[] {
  if (step === 1) return [];
  if (step === 3) {
    const modes = new Set(VERB_CARDS_V2.map(c => c.step3Mode));
    return [...modes].flatMap(m => (STEP_TEMPLATES[3] as unknown as Record<Step3Mode, string[]>)[m].slice(0, 1));
  }
  return (STEP_TEMPLATES[step as 2 | 4] as unknown as string[]).slice(0, 1);
}

function VerbFamily({ title, cards }: { title: string; cards: VerbCardV2[] }) {
  return (
    <div>
      <div className="font-black mb-1">{title}</div>
      <table className="w-full text-[12px]">
        <tbody>
          {cards.map(c => (
            <tr key={c.id} className="border-b border-dotted border-gray-400">
              <td className="font-bold py-0.5">{c.verbAr}</td>
              <td className="py-0.5 text-left">{pathAr(c)}</td>
              <td className="py-0.5 text-[11px] opacity-80">
                {c.step3Mode === 'confront' && 'الخطوة 3 بـ«بينما»'}
                {c.step3Mode === 'hypothesis' && 'تُكتب 3 وحدها'}
                {c.step3Mode === 'none' && 'تُكتب 4 وحدها'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
