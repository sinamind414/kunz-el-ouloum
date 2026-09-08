// src/components/MiftahCard.tsx — Carte « المفتاح » (مفتاح المنهجية) v3.1 recto/verso,
// fidèle à l'HTML autonome /miftah.html. Noms, erreurs et footers viennent de miftahSpec
// (source unique) ; le garde-fou `npm run check:miftah` vérifie la parité (docs/MARQUE.md).
// Pro : styles isolés (préfixe miftah-) pour ne pas fuir, print natif, aucune logique
import React from 'react';
import {
  MIFTAH_VERSION, MIFTAH_NAME_AR, MIFTAH_NAME_OFFICIAL_AR,
  FOOTER_RECTO_AR, FOOTER_VERSO_AR, FOOTER_ANNEXE_AR,
  RECTO_ERRORS, VERSO_ERRORS, ANNEXE, TOOTH3_ROUTE_AR, GOLDEN_FORMULA_AR,
} from '../data/miftahSpec';

export default function MiftahCard() {
  return (
    <div dir="rtl" lang="ar" className="miftah-root">
      <style>{`
.miftah-root{ --gold:#c08a1f; --gold-l:#fdf6e3; --gold-d:#7a5610; --gold-mid:#ecd9a8; --teal:#0e6b6b; --teal-l:#eaf4f4; --teal-mid:#148080; --teal-d:#0a4f4f; --red:#b91c1c; --red-l:#fef2f2; --ink:#151a21; --mute:#475569; --line:#e2e8f0; --bg:#ffffff; --shadow:0 4px 24px rgba(14,107,107,.08),0 1px 4px rgba(0,0,0,.05),0 0 0 1px rgba(226,232,240,.9); --radius:16px; font-family:"Noto Naskh Arabic","Cairo",serif; color:var(--ink); line-height:1.85; font-size:15px; -webkit-font-smoothing:antialiased }
        .miftah-root .latin{font-family:"Inter","Cairo",sans-serif; direction:ltr; unicode-bidi:isolate; font-feature-settings:"tnum" 1}
        .miftah-page{background:var(--bg); max-width:970px; margin:20px auto; padding:32px 36px; border-radius:var(--radius); box-shadow:var(--shadow); border:1px solid rgba(226,232,240,.6)}
        .miftah-root h1{font-family:"Cairo","Noto Naskh Arabic",sans-serif; margin:0; font-size:31.5px; font-weight:800; color:var(--gold-d); line-height:1.25; letter-spacing:-.015em}
        .miftah-root h2{font-family:"Cairo","Noto Naskh Arabic",sans-serif; margin:0; font-size:21.5px; font-weight:800; color:var(--teal); border-bottom:2.5px solid var(--teal); padding-bottom:7px; margin:24px 0 14px}
        .miftah-root h3{font-family:"Cairo","Noto Naskh Arabic",sans-serif; margin:0; font-size:16.8px; font-weight:800; color:var(--ink); margin:20px 0 9px; display:flex; align-items:center; gap:9px; line-height:1.4}
        .miftah-root h3 .num{display:inline-flex; align-items:center; justify-content:center; width:27px;height:27px;border-radius:50%; background:linear-gradient(135deg,var(--gold) 0%,var(--gold-d) 100%); color:#fff; font-size:13px; font-weight:800; box-shadow:0 2px 6px rgba(192,138,31,.32)}
        .miftah-brand{display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; border-bottom:3px solid var(--gold); padding-bottom:14px}
        .miftah-brand .app{font-size:12.5px; color:var(--mute); line-height:1.6}
        .miftah-tag{color:var(--mute); font-size:13.8px; margin-top:3px}
        .miftah-official{color:var(--gold-d); font-family:"Cairo","Noto Naskh Arabic",sans-serif; font-size:13.5px; font-weight:800; margin-top:2px; letter-spacing:.01em}
        .miftah-teacher{background:#f8fafc; border:1px dashed #cbd5e1; border-radius:12px; padding:11px 14px; font-size:12.3px; color:var(--mute); margin:14px 0; line-height:1.6}
        .miftah-root table{width:100%; border-collapse:separate; border-spacing:0; margin:10px 0 16px; font-size:14px; border:1px solid var(--line); border-radius:10px; overflow:hidden}
        .miftah-root th,.miftah-root td{border-bottom:1px solid var(--line); border-left:1px solid var(--line); padding:9px 11px; vertical-align:top; text-align:right}
        .miftah-root th{background:#eef6f6; color:var(--teal); font-family:"Cairo",sans-serif; font-weight:800; font-size:13px}
        .miftah-root th:last-child,.miftah-root td:last-child{border-left:none}
        .miftah-root tr:last-child td{border-bottom:none}
        .miftah-root td.c{text-align:center; font-weight:800; color:var(--gold-d); font-family:"Cairo",sans-serif; white-space:nowrap; background:#fffdf4}
        .miftah-root td.corr{background:var(--red-l); font-size:13px; line-height:1.6}
        .miftah-root th.corr{background:#fee2e2; color:var(--red)}
        .miftah-box{border-radius:12px; padding:13px 16px; margin:11px 0; line-height:1.7}
        .miftah-gold{background:var(--gold-l); border:1px solid var(--gold-mid)}
        .miftah-teal{background:var(--teal-l); border:1px solid #c2e0e0}
        .miftah-red{background:var(--red-l); border:1px solid #fecaca}
        .miftah-corr-note{background:var(--red-l); border-right:4px solid var(--red); padding:9px 13px; border-radius:8px; font-size:13px; margin:9px 0; line-height:1.6}
        .miftah-gate{background:#fbfcfd; border:1px solid var(--line); border-radius:12px; padding:15px 18px; margin:11px 0}
        .miftah-gate .q{font-family:"Cairo",sans-serif; font-weight:800; font-size:16px; color:var(--gold-d); margin-bottom:4px}
        .miftah-gate .opt{margin:7px 22px 7px 0; padding:7px 11px; border-radius:8px; font-size:13.8px; line-height:1.5}
        .miftah-gate .opt.a{background:var(--gold-l); border:1px solid #f0d9a8} .miftah-gate .opt.b{background:var(--teal-l); border:1px solid #b9d9d9}
        .miftah-path{font-family:"Inter",sans-serif; direction:ltr; unicode-bidi:isolate; background:#fff; border:1px solid var(--line); border-radius:6px; padding:1px 7px; font-weight:600; color:var(--teal); white-space:nowrap; font-size:12.5px}
        .miftah-chain{display:flex; align-items:center; gap:7px; flex-wrap:wrap; justify-content:center; background:#fbfcfd; border:1px solid var(--line); border-radius:12px; padding:13px; margin:11px 0}
        .miftah-chain .node{background:#fff; border:2px solid var(--teal); border-radius:9px; padding:4px 11px; font-family:"Cairo",sans-serif; font-weight:800; color:var(--teal); font-size:13.5px; box-shadow:0 1px 3px rgba(14,107,107,.08)}
        .miftah-chain .node.z{border-color:var(--gold); color:var(--gold-d); background:#fffdf4} .miftah-chain .node.s{border-color:var(--red); color:var(--red); background:#fef2f2}
        .miftah-chain .ar{color:var(--mute); font-size:18px; font-weight:300}
        .miftah-sent{margin:7px 0; padding:9px 13px; background:#fff; border:1px solid var(--line); border-radius:9px; border-right:4px solid var(--gold); font-size:13.8px}
        .miftah-check{display:flex; flex-wrap:wrap; gap:8px}
        .miftah-check div{flex:1 1 200px; background:var(--gold-l); border:1px solid #f3e0b0; border-radius:10px; padding:9px 12px; font-size:13.3px; line-height:1.5}
        .miftah-check b{color:var(--gold-d); font-family:"Cairo",sans-serif; font-size:15px}
        .miftah-key-wrap{display:flex; align-items:center; gap:18px; flex-wrap:wrap; margin:12px 0}
        .miftah-key-wrap svg{flex:0 0 auto; filter:drop-shadow(0 2px 8px rgba(192,138,31,.18))}
        .miftah-teeth{display:flex; gap:8px; flex-wrap:wrap}
        .miftah-teeth span{background:linear-gradient(135deg,var(--gold) 0%,var(--gold-d) 100%); color:#fff; border-radius:9px; padding:6px 13px; font-family:"Cairo",sans-serif; font-weight:800; box-shadow:0 2px 6px rgba(192,138,31,.22)}
        .miftah-card-label{display:inline-block; background:var(--teal); color:#fff; border-radius:999px; padding:3px 14px; font-family:"Cairo",sans-serif; font-weight:800; font-size:12.5px; margin-bottom:7px}
        .miftah-card-label.plus{background:linear-gradient(135deg,var(--gold) 0%,var(--gold-d) 100%)}
        .miftah-root footer{color:var(--mute); font-size:11.5px; text-align:center; margin:22px 0 6px}
        /* Garde-fou A4 (parité /miftah.html) : le recto doit tenir sur UNE page */
        @media print{ .miftah-page{box-shadow:none; margin:0; border-radius:0; max-width:none; padding:8mm 10mm; border:none} .miftah-teacher{display:none} .miftah-break{page-break-before:always; break-before:page} .miftah-root{font-size:10.4px; line-height:1.58} .miftah-root h1{font-size:20px} .miftah-official{font-size:10.5px; margin-top:1px} .miftah-tag{font-size:12.5px; margin-top:2px} .miftah-brand{padding-bottom:10px} .miftah-root h2{font-size:14.8px; margin:10px 0 7px; padding-bottom:4px} .miftah-root h3{font-size:12.8px; margin:8px 0 5px} .miftah-root table{margin:5px 0 8px} .miftah-root th,.miftah-root td{padding:4px 6px} .miftah-box,.miftah-gate{padding:10px 13px; margin:7px 0} .miftah-corr-note{padding:6px 11px; margin:6px 0} .miftah-sent{padding:6px 11px; margin:5px 0} .miftah-check{gap:6px} .miftah-check div{padding:6px 10px} .miftah-key-wrap{margin:8px 0} .miftah-teeth span{padding:4px 10px} .miftah-root ul{margin:2px 0} .miftah-root li{margin:3px 0} .miftah-root footer{margin:8px 0 0} }
      `}</style>

      {/* RECTO */}
      <div className="miftah-page">
        <div className="miftah-brand">
          <div>
            <h1>🔑 {MIFTAH_NAME_AR}</h1>
            <div className="miftah-official">{MIFTAH_NAME_OFFICIAL_AR}</div>
            <div className="miftah-tag">منهجية الإجابة في علوم الحياة والأرض · بكالوريا</div>
            <div className="miftah-tag latin" style={{textAlign:'left', direction:'ltr'}}>4 dents · 2 portes · une réponse qui ouvre le point</div>
          </div>
          <div className="app latin" style={{textAlign:'right'}}>
            <b>كنز العلوم</b> · Kunz El Ouloum<br/>v{MIFTAH_VERSION} · fiche élève · recto = المفتاح · verso = المفتاح+ · annexe = المفتاح PRO
          </div>
        </div>
        <div className="miftah-teacher"><b>Note enseignant :</b> le noyau compte <b>11 éléments</b> (les <b>2 بوابات</b> et le <b>وضع الحفظ</b> y sont : ce sont les points les moins chers de l&apos;exercice 1). La ligne « عائلتي » est une reconnaissance, pas une décision — non comptée, comme l&apos;était l&apos;ancien switch. Gel 10→11 acté le 09-07 (MARQUE §12bis). Les cases « 📝 المصحح » décrivent la logique réelle du barème. Ne distribuer le verso (المفتاح+) qu&apos;après maîtrise du recto. Les erreurs 1-3 (base) sont sur le recto, 4-5 (formes avancées) sur le verso. Cette note n&apos;est pas imprimée.</div>
        <span className="miftah-card-label">البطاقة الأولى · للجميع، من اليوم الأول</span>
        <h2>🧬 المفتاح — 4 أسنان تفتح كل إجابة</h2>
        <div className="miftah-key-wrap">
          <svg width={230} height={80} viewBox="0 0 230 80" aria-label="مفتاح بأربعة أسنان">
            <circle cx={40} cy={40} r={28} fill="none" stroke="#c8962e" strokeWidth={8}/>
            <circle cx={40} cy={40} r={9} fill="#fff" stroke="#c8962e" strokeWidth={4}/>
            <rect x={66} y={33} width={150} height={14} rx={4} fill="#c8962e"/>
            <g fill="#c8962e"><rect x={90} y={47} width={14} height={22} rx={2}/><rect x={120} y={47} width={14} height={16} rx={2}/><rect x={150} y={47} width={14} height={24} rx={2}/><rect x={185} y={47} width={14} height={18} rx={2}/></g>
            <g fontFamily="Inter,Cairo,sans-serif" fontSize={11} fontWeight={700} fill="#fff" textAnchor="middle"><text x={97} y={63}>1</text><text x={127} y={59}>2</text><text x={157} y={64}>3</text><text x={192} y={61}>4</text></g>
          </svg>
          <div>
            <div className="miftah-teeth"><span>1 🔍 تَبَصَّر</span><span>2 🔑 أدخل</span><span>3 🔄 أدر</span><span>4 🔓 افتح</span></div>
            <div style={{color:'var(--mute)', marginTop:6}}>سنّ ناقصة = مفتاح لا يفتح. <span className="miftah-path">3</span> تُستعمل فقط إن سمح الفعل.</div>
          </div>
        </div>
        <h3><span className="num">أ</span> الأسنان الأربع — ماذا أفعل بالضبط</h3>
        <table>
          <thead><tr><th style={{width:36}}>#</th><th style={{width:90}}>السنّ</th><th>ماذا أفعل</th><th className="corr" style={{width:'38%'}}>📝 المصحح</th></tr></thead>
          <tbody>
            <tr><td className="c">1</td><td className="c">🔍 تَبَصَّر</td><td>أطوّق <b>الفعل</b> · أسطّر <b>الكلمات المفتاحية</b> · أرقّم إجابتي <b>برقم السؤال</b> (1-أ، 1-ب…) لا غير.</td><td className="corr">إجابة بلا رقم أو تحت رقم خاطئ = <b>0</b> ولو كانت صحيحة. الفعل الخاطئ (وصفتَ بدل أن تفسّر) = تفقد نقطة الفعل كاملة.</td></tr>
            <tr><td className="c">2</td><td className="c">🔑 أدخل</td><td>أستخرج من الوثيقة <b>أرقاما + وحدات + اتجاه التغيّر</b> («يرتفع من 2 إلى 8 <span className="latin">mg/L</span> بين 0 و 10 <span className="latin">min</span>»).</td><td className="corr">نقطة الاستخراج تُمنح <b>للرقم مع وحدته</b>. «يرتفع» وحدها = نصف نقطة. رقم بلا وحدة = خطأ محسوب.</td></tr>
            <tr><td className="c">3</td><td className="c">🔄 أدر<br/><small>إن سمح الفعل</small></td><td>أربط المعطى بالسبب/الآلية من الدرس: «لأنّ… / بسبب… / ممّا يدلّ على…».</td><td className="corr">هنا نقاط الفهم (غالبا الأثقل). ربط بلا معطى = «حفظ» → نصف النقطة. معطى بلا ربط والفعل يطلبه = نصف النقطة.</td></tr>
            <tr><td className="c">4</td><td className="c">🔓 افتح</td><td>جملة واحدة تجيب <b>حرفيا</b> على الكلمات التي سطّرتُها في السنّ 1.</td><td className="corr">خاتمة غائبة = نقطة الاستنتاج ضائعة. خاتمة لا تحوي كلمات السؤال = <b>لا تُقرأ</b> كإجابة.</td></tr>
          </tbody>
        </table>
        <h3><span className="num">ب</span> البوابتان + عائلتي — أقرّر قبل أن أكتب، لا أثناء</h3>
        <div className="miftah-gate"><div className="q">🚪 البوابة 1 — قفل أصلا؟</div><div>هل سطّرتُ في السنّ 1 كلمة: <b>وثيقة / شكل / جدول / منحنى / رسم</b>؟</div><div className="opt a"><b>لا → 🧠 لا قفل</b> : دُرج المعرفة — من تَبَصَّر إلى افتح مباشرة <span className="miftah-path">1 → 4</span></div><div className="opt b"><b>نعم → 🔒 قفل</b> : أمرّ إلى البوابة 2.</div></div>
        <div className="miftah-gate"><div className="q">📥 البوابة 2 — من أين مادة الإدخال؟</div><div>«ومعلوماتك / ومكتسباتك» مذكورة في السؤال؟</div><div className="opt a"><b>📄 وثيقة فقط</b> : عمود واحد في المسودة.</div><div className="opt b"><b>📄+🧠 مختلط</b> : عمودان — <b>[من الوثيقة | من معلوماتي]</b>.</div></div>
        <div className="miftah-sent">⚙️ <b>عائلتي قبل أن أكتب:</b> 📷 الصورة (حلّل · صِف · استخرج · قارن) — <span className="miftah-path">1 → 2 → 4</span> · 🎬 الفيلم (فسّر · اشرح · علّل · استنتج) — <span className="miftah-path">1 → 2 → 3 → 4</span> · 🔨 الحدّاد (اقترح · برّر · ناقض · قدّم حلا) — <b>تصنيع</b>: منتج منطقي جديد (فرضية / اقتراح / توصية)، لا جواب واحد في الوثيقة.</div>
        <div className="miftah-corr-note"><b>📝 المصحح:</b> في «صورة»، كل جملة تفسيرية = وقت ضائع لا يُنقَّط. في «فيلم»، وصف بلا سبب = نصف النقاط على أحسن تقدير. في «الحدّاد»، إعادة الملاحظة بدل التصنيع = صفر: المطلوب منتج مُبرَّر، لا وصف ولا تفسير جاهز.</div>
        <h3><span className="num">ج</span> وضع الحفظ — 🧠 رأس</h3>
        <table><thead><tr><th style={{width:120}}>الفعل</th><th>القالب</th><th className="corr" style={{width:'38%'}}>📝 المصحح</th></tr></thead><tbody><tr><td className="c">عرّف</td><td><b>[العنصر]</b> = الانتماء (ما هو؟) + الخاصية المميزة + الدور إن وُجد · كلمة علمية واحدة على الأقل.</td><td className="corr">الانتماء وحده = 0,25 · مع الخاصية = 0,5 · التعريف الكامل = النقطة.</td></tr><tr><td className="c">اذكر / عدّد / سمّ</td><td><b>قائمة مرقّمة</b>، عنصر في كل سطر، <b>بلا جُمَل</b>. العدد المطلوب في السؤال = فحصي الأخير («اذكر ثلاث…» = 3 أسطر لا أكثر).</td><td className="corr">كل عنصر صحيح = جزء النقطة. عنصر زائد خاطئ <b>قد يُخصم</b>. الفقرة بدل القائمة = يبحث المصحح عن العناصر… وقد لا يجدها.</td></tr></tbody></table>
        <div className="miftah-box miftah-gold"><b>مثال:</b> الإنزيم هو <b>بروتين حفّاز حيوي</b> (الانتماء)، <b>يسرّع تفاعلا نوعيا دون أن يُستهلك</b> (الخاصية)، <b>بفضل موقع فعّال</b> يمنحه تخصصا تجاه مادة التفاعل (الدور). — لا خاتمة هنا.</div>
        <h3><span className="num">د</span> الجمل الثلاث الجاهزة</h3>
        <div className="miftah-sent"><b>للاستخراج:</b> «نلاحظ من الوثيقة … أنّ [العنصر] [يرتفع / ينخفض / يبقى ثابتا] من … إلى … [الوحدة] عند / بين …»</div>
        <div className="miftah-sent"><b>للربط:</b> «ويُفسَّر ذلك بأنّ … [الآلية من الدرس] … ممّا يدلّ على …»</div>
        <div className="miftah-sent"><b>للخاتمة:</b> «ومنه نستنتج أنّ [كلمات السؤال المسطّرة] …»</div>
        <h3><span className="num">هـ</span> الفحص الرباعي المعكوس — 10 ثوانٍ قبل السؤال التالي</h3>
        <div className="miftah-check"><div><b>4</b> ← هل تحوي خاتمتي كلمات السؤال؟</div><div><b>3</b> ← هل كل «لأنّ» مسبوقة بمعطى؟</div><div><b>2</b> ← هل كل رقم معه وحدته؟</div><div><b>1</b> ← هل الفعل الذي طوّقتُه هو الذي نفّذتُه؟</div></div>
        <h3><span className="num">📝</span> ثلاثة أخطاء تكلّف أكثر من الجهل — خلاصة مصحح</h3>
        <div className="miftah-box miftah-red"><ol style={{margin:0, paddingRight:22}}>{RECTO_ERRORS.map(e => { const i = e.indexOf(' — '); return <li key={e}><b>{e.slice(0, i)}</b> — {e.slice(i + 3)}</li>; })}</ol></div>
        <footer>{FOOTER_RECTO_AR}</footer>
      </div>
      {/* VERSO */}
      <div className="miftah-page miftah-break">
        <div className="miftah-brand"><div><h1>🔑 المفتاح<span style={{color:'var(--gold)'}}>+</span></h1><div className="miftah-tag">نفس المفتاح — القفل والأسنان الإضافية — لمن أتقن الوجه الأول</div></div><div className="app latin" style={{textAlign:'right'}}><b>كنز العلوم</b> · Kunz El Ouloum<br/>v{MIFTAH_VERSION} · verso</div></div>
        <span className="miftah-card-label plus">البطاقة الثانية · عند الحاجة فقط</span>
        <h2>🧫🧱 المفتاح+ — القفل والأسنان الإضافية</h2>
        <h3><span className="num">و</span> القفل — اِفهم (مرة واحدة لكل تمرين)</h3>
        <div className="miftah-box miftah-teal">بعد قراءة <b>سياق التمرين</b> مباشرة، أكتب في أعلى المسودة: <b>«الهدف العام: ……»</b> (≤ 5 كلمات).<br/>مثال: «بغرض معرفة آلية عمل الأنسولين…» ← «<b>الهدف العام: آلية عمل الأنسولين</b>».</div>
        <div className="miftah-corr-note"><b>📝 المصحح:</b> التركيب النهائي (أثقل نقطة في التمرين 3) يُنقَّط على <b>إجابته لهذا السطر بالذات</b>، لا على كمّ ما كُتب.</div>
        <h3><span className="num">ز</span> البنية المتسلسلة + قالب التركيب</h3>
        <div className="miftah-chain"><div className="node z">القفل · اِفهم</div><span className="ar">←</span><div className="node">جزء I · 1 2 3 4</div><span className="ar">←</span><div className="node">جزء II · 1 2 3 4</div><span className="ar">←</span><div className="node">جزء III · 1 2 3 4</div><span className="ar">←</span><div className="node s">التركيب = يُجيب «اِفهم»</div></div>
        <div className="miftah-sent"><b>قالب التركيب (جملة واحدة مركّبة):</b> «من الجزء I نعلم أنّ … ، ومن الجزء II أنّ … ، ومن الجزء III أنّ … ؛ <b>ومنه</b> [الإجابة على سطر «الهدف العام»].»</div>
        <div className="miftah-sent"><b>مسار السن 3:</b> {TOOTH3_ROUTE_AR} — <b>الصيغة الذهبية:</b> {GOLDEN_FORMULA_AR}</div>
        <div className="miftah-corr-note"><b>📝 المصحح:</b> تركيب يعيد النتائج بلا «ومنه» = نصف النقطة. تركيب يُدخل معلومة من الدرس لم تظهر في الأجزاء = لا يُحتسب.</div>
        <h3><span className="num">ح</span> ثلاث صيغ خاصة</h3>
        <table><thead><tr><th style={{width:120}}>الصيغة</th><th>الأسنان</th><th className="corr" style={{width:'36%'}}>📝 المصحح</th></tr></thead><tbody><tr><td className="c">الحساب<br/><small>احسب…</small></td><td><b>2</b> = القانون بالحروف (<span className="latin">Chargaff : %A = %T</span>…) · <b>3</b> = التعويض خطوة خطوة · <b>4</b> = النتيجة <b>بوحدتها</b>.</td><td className="corr">القانون بالحروف = نقطة مستقلة <b>حتى لو أخطأتَ في الحساب</b>. نتيجة صحيحة بلا خطوات = نصف النقطة. بلا وحدة = خصم.</td></tr><tr><td className="c">شجرة النسب<br/><small>حدّد نمط الوراثة</small></td><td><b>2</b> = <b>حدثان حاسمان</b>: ① أبوان سليمان ← طفل مصاب (يحسم <b>السيادة</b>) ② بنت مصابة من أب سليم / ابن سليم من أم مصابة (يحسم <b>الموقع</b>) · <b>3</b> = لماذا كل حدث يستبعد الفرضية المقابلة · <b>4</b> = <b>الحكمان</b> (متنحٍّ/سائد + جسمي/مرتبط بـ <span className="latin">X</span>) <b>ثم</b> الأنماط الوراثية بالترميز.</td><td className="corr">نمط بلا الحكم الثاني = <b>نصف النقطة دائما</b>. إن لم يوجد حدث حاسم للموقع: «على الأرجح جسمي لأنّ …» + مبرر = النقطة كاملة. أنماط وراثية بلا حكم مبرَّر = لا تُنقَّط.</td></tr><tr><td className="c">الحدّاد<br/><small>اقترح / برّر / ناقض / قدّم حلا</small></td><td><b>2</b> = <b>البيانات</b>: كل المعطيات اللازمة (الوثيقة + معلوماتي)، لا نسخ شامل · <b>3</b> = <b>المعالجة</b>: مقارنة، علاقة، تفسير أو مناقشة · <b>4</b> = <b>المنتج</b>: حسب التعليمة — فرضية / تبرير / توصية / مخطط، جازمة وقابلة للتجربة.</td><td className="corr">إعادة الملاحظة بدل التصنيع = <b>صفر</b>. المطلوب منتج منطقي جديد مُبرَّر: لا وصف ولا تفسير جاهز. فرضية بلا آلية = نصف النقطة.</td></tr></tbody></table>
        <h3><span className="num">ط</span> فحص الخاتمة — عامّ أم خاصّ؟</h3>
        <div className="miftah-box miftah-gold"><b>السؤال الوحيد:</b> هل جملتي صحيحة لو غيّرنا اسم الجزيئة / الكائن؟<br/>نعم → <b>عام</b> («الإنزيم نوعي تجاه مادة التفاعل») · لا → <b>خاص</b> («الغليكوكيناز نوعي تجاه الغلوكوز»).<br/><b>القاعدة:</b> إن طُلب الهدف العام → العام أولا، الخاص بين قوسين. إن طُلبت الوثيقة بعينها → العكس.</div>
        <div className="miftah-corr-note"><b>📝 المصحح:</b> خاص مكان عام = «لم يعمّم» = نصف النقطة. عام مكان خاص = «لم يستعمل الوثيقة» = نصف النقطة.</div>
        <h3><span className="num">ي</span> جملة النجاة</h3>
        <ul><li>بدأتُ <b>أصف</b> والفعل يطلب <b>التفسير</b> → أُكمل فورا بـ <b>«وتفسير ذلك أنّ ……»</b> ثم الآلية. لا شطب.</li><li>بدأتُ <b>أفسّر</b> والفعل يطلب <b>الوصف فقط</b> → لا حيلة سوى الشطب. لهذا تُفحص البوابة <b>قبل</b> الكتابة.</li></ul>
        <div className="miftah-corr-note"><b>📝 المصحح:</b> الزيادة الصحيحة لا تُخصم في الغالب، لكنها تسرق الوقت من سؤال آخر مُنقَّط.</div>
        <h3><span className="num">ك</span> شحذ المفتاح — تدريب 60 ثانية</h3>
        <div className="miftah-box miftah-teal">تمرّ أمامي <b>12 تعليمة قصيرة كاملة</b> (لا أفعال معزولة)، لكل واحدة ثانيتان: <b>🚪 قفل؟</b> ثم <b>📥 من أين؟</b> ثم <b>⚙️ أي حركة؟</b>.<br/>أمثلة: «اذكر من الوثيقة 2 العناصر…» (قفل/وثيقة/📷) · «اذكر مراحل…» (لا قفل/🧠) · «فسّر بالاعتماد على معلوماتك والشكل 3…» (قفل/مختلط/🎬) · «اقترح فرضيتين بالاستعانة بالوثيقة 1 ومعلوماتك…» (قفل/مختلط/🔨).<br/><b>الهدف: 12/12 على ثلاثة أيام مختلفة</b> قبل أي تحرير كامل. في التطبيق: يُفتح بعد هذا الشرط <b>التدريب الموجَّه (المرحلة 2)</b> والشارة «حامل المفتاح»، وتُنشر بطاقة <b>المفتاح+</b> بعد تثبيت النواة على ثلاثة أنواع مختلفة من الأسئلة.</div>
        <h3><span className="num">📊</span> ما أحمله حسب مستواي</h3>
        <table className="lvl"><thead><tr><th>الملف</th><th>البطاقة</th><th style={{width:110}}>العناصر</th></tr></thead><tbody><tr><td>متعثّر</td><td>المفتاح كاملا (أ → هـ)</td><td className="c">11</td></tr><tr><td>متوسط</td><td>المفتاح + و، ز، ط</td><td className="c">≈ 14</td></tr><tr><td>يستهدف الامتياز</td><td>المفتاح+ + الملحق (ذ، ر، س) — لا شيء يُستدعى في آن واحد</td><td className="c">≈ 21</td></tr></tbody></table>
        <h3><span className="num">📝</span> الخطآن المتبقيان — خلاصة مصحح (1-3 على الوجه الأول)</h3>
        <div className="miftah-box miftah-red"><ol start={4} style={{margin:0, paddingRight:22}}>{VERSO_ERRORS.map(e => { const i = e.indexOf(' — '); return <li key={e}><b>{e.slice(0, i)}</b> — {e.slice(i + 3)}</li>; })}</ol></div>
        <footer>{FOOTER_VERSO_AR} · <span className="latin">4 dents · 2 portes · une réponse qui ouvre le point</span></footer>
      </div>
        {/* ANNEXE — PRO (docs/MARQUE.md §12ter) : page 3, amritat uniquement, sur demande */}
        <div className="miftah-page miftah-break">
          <div className="miftah-brand">
            <div>
              <h1>🔑 المفتاح<span style={{color:'var(--gold)'}}>PRO</span></h1>
              <div className="miftah-tag">قوة الدليل والتجريب — لمن يستهدف الامتياز، بعد إتقان الوجهين الأول والثاني</div>
            </div>
            <div className="app latin" style={{textAlign:'right'}}><b>كنز العلوم</b> · Kunz El Ouloum<br/>v{MIFTAH_VERSION} · annexe</div>
          </div>
          <span className="miftah-card-label plus">الملحق · يُوزَّع عند الطلب فقط — للامتياز</span>
          <h2>🔬 المفتاح PRO — {ANNEXE.forceTitleAr}</h2>
          <div className="miftah-box miftah-gold"><b>القاعدة الذهبية:</b> {ANNEXE.ruleAr}</div>
          <h3><span className="num">ذ</span> {ANNEXE.forceTitleAr}</h3>
          <table><thead><tr><th style={{width:'44%'}}>نوع الدليل</th><th>اللغة التي أستعملها</th></tr></thead><tbody>{ANNEXE.forceRows.map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}</tbody></table>
          <div className="miftah-box miftah-red"><b>🔴 قاعدة حمراء:</b> {ANNEXE.causalAr}</div>
          <div className="miftah-corr-note"><b>📝 المصحح:</b> {ANNEXE.forceCorrectorAr}</div>
          <h3><span className="num">ر</span> التجربة — 4 أسئلة قبل أي تحليل</h3>
          <div className="miftah-check">{ANNEXE.experimentQuestionsAr.map(([q, r]) => <div key={q}>{q} ← <b>{r}</b></div>)}</div>
          <div className="miftah-sent"><b>{ANNEXE.experimentFormulaAr}</b></div>
          <div className="miftah-corr-note"><b>📝 المصحح:</b> {ANNEXE.experimentCorrectorAr}</div>
          <h3><span className="num">س</span> {ANNEXE.hypothesisTitleAr}</h3>
          <div className="miftah-box miftah-gold"><b>القالب:</b> «{ANNEXE.hypothesisTemplateAr}»</div>
          <div className="miftah-check">{ANNEXE.hypothesisChecksAr.map(c => <div key={c}>{c}</div>)}</div>
          <div className="miftah-corr-note"><b>📝 المصحح:</b> {ANNEXE.hypothesisCorrectorAr}</div>
          <footer>{FOOTER_ANNEXE_AR} · <span className="latin">4 dents · 2 portes · une réponse qui ouvre le point</span></footer>
        </div>
    </div>
  );
}
