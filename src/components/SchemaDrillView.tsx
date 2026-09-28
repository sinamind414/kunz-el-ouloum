// SchemaDrillView.tsx — « ارسم من الذاكرة » (audit item 17, sprint 12).
//
// Le principe est une INVERSION : l'app savait montrer 134 schémas ; ici
// l'image est cachée tant que l'élève n'a pas dessiné et ne s'est pas
// auto-évalué. Trois phases, sans retour possible vers l'image :
//   1. الرسم    — consigne, ordre de tracé, chronomètre implicite. AUCUNE image.
//   2. التقييم  — grille d'éléments cotés, l'élève coche ce qu'il a vraiment tracé.
//   3. المقارنة — score, éléments essentiels oubliés, pièges, PUIS l'image.

import { useMemo, useState } from 'react';
import { bacEchoForDrill } from '../data/bacSessionIndex';
import { ArrowRight, Check, PenTool, RefreshCw, Timer } from 'lucide-react';
import {
  SCHEMA_DRILLS,
  drillUnitIds,
  drillsForUnit,
  missingEssentials,
  scoreFromChecked,
  totalPoints,
  verdictFor,
  type SchemaDrill,
} from '../data/schemaDrills';

interface SchemaDrillViewProps {
  onBackToHome?: () => void;
}

type Phase = 'dessin' | 'evaluation' | 'comparaison';

const VERDICT_TEXT = {
  maitrise: { label: 'مُتقَن — انتقل إلى رسم آخر', cls: 'text-emerald-700 dark:text-emerald-400' },
  a_consolider: { label: 'قريب — أعد الرسم مركّزاً على المنسيّ', cls: 'text-amber-700 dark:text-amber-400' },
  a_refaire: { label: 'يحتاج إعادة كاملة اليوم', cls: 'text-rose-700 dark:text-rose-400' },
} as const;

function Exercice({ drill, onQuitter }: { drill: SchemaDrill; onQuitter: () => void }) {
  const [phase, setPhase] = useState<Phase>('dessin');
  const [coches, setCoches] = useState<string[]>([]);

  const total = totalPoints(drill);
  const score = scoreFromChecked(drill, coches);
  const oublis = missingEssentials(drill, coches);
  const verdict = VERDICT_TEXT[verdictFor(drill, coches)];

  const basculer = (id: string) =>
    setCoches((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  return (
    <div data-testid="drill-exercice" dir="rtl" className="space-y-4">
      <div className="flex flex-row-reverse items-start justify-between gap-3">
        <div className="text-right">
          <h2 className="text-xl font-black text-[#1f1c0b] dark:text-gray-100">{drill.titleAr}</h2>
          <p className="text-[13px] text-[#506072] dark:text-gray-400">الوحدة {drill.unitId}</p>
          {bacEchoForDrill(drill.id).years.length > 0 && (
            <p
              data-testid="drill-echo-bac"
              className="text-[12px] font-bold text-[#8a6a00] dark:text-[#d9a400]"
            >
              مطلوب في البكالوريا: {bacEchoForDrill(drill.id).years.join(' · ')}
            </p>
          )}
        </div>
        <button
          data-testid="drill-quitter"
          onClick={onQuitter}
          className="flex flex-row-reverse items-center gap-2 px-3 py-2 rounded-2xl bg-[#f3f4f5] dark:bg-[#1f2622] text-sm font-bold text-[#006d37] dark:text-[#2ecc71] cursor-pointer"
        >
          <span>كل الرسومات</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {phase === 'dessin' && (
        <div data-testid="phase-dessin" className="space-y-4">
          <div className="rounded-3xl p-4 bg-[#fff9ed] dark:bg-black/20 border border-[#d9a400]/40">
            <p className="text-[11px] font-bold text-[#8a6a00] dark:text-[#d9a400] mb-1">التعليمة</p>
            <p data-testid="drill-consigne" className="text-[15px] leading-8 font-bold text-[#1f1c0b] dark:text-gray-100">
              {drill.consigneAr}
            </p>
            <p className="mt-2 flex flex-row-reverse items-center gap-1.5 text-[13px] text-[#506072] dark:text-gray-400">
              <Timer className="w-4 h-4" />
              خذ ورقة بيضاء — {drill.minutes} دقائق، دون النظر إلى أي سند.
            </p>
          </div>

          <div className="rounded-3xl p-4 bg-white dark:bg-[#141916] border border-[#bbcbbb]/30">
            <p className="text-sm font-black text-[#006d37] dark:text-[#2ecc71] mb-2">ترتيب الرسم</p>
            <ol data-testid="drill-ordre" className="space-y-1.5">
              {drill.orderAr.map((etape, i) => (
                <li key={etape} className="flex flex-row-reverse items-start gap-2 text-sm leading-7 text-[#1f1c0b] dark:text-gray-200">
                  <span className="shrink-0 w-5 h-5 mt-0.5 rounded-lg bg-[#e8f5ee] dark:bg-black/20 text-[11px] font-bold text-[#006d37] dark:text-[#2ecc71] flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span>{etape}</span>
                </li>
              ))}
            </ol>
          </div>

          <p className="text-[13px] text-[#506072] dark:text-gray-400">{drill.whyAr}</p>

          <button
            data-testid="drill-fini"
            onClick={() => setPhase('evaluation')}
            className="w-full px-4 py-3 rounded-2xl bg-[#006d37] hover:bg-[#00592d] text-white text-sm font-bold cursor-pointer transition-colors"
          >
            انتهيت من الرسم — قيّم نفسي
          </button>
        </div>
      )}

      {phase === 'evaluation' && (
        <div data-testid="phase-evaluation" className="space-y-4">
          <p className="text-sm text-[#506072] dark:text-gray-300">
            ضع علامة على كل عنصر موجود فعلاً في ورقتك. كن صادقاً: الهدف كشف المنسيّ لا جمع النقاط.
          </p>
          <ul className="space-y-2">
            {drill.elements.map((el) => {
              const actif = coches.includes(el.id);
              return (
                <li key={el.id}>
                  <button
                    data-testid={`element-${el.id}`}
                    onClick={() => basculer(el.id)}
                    aria-pressed={actif}
                    className={`w-full text-right flex flex-row-reverse items-center gap-2 px-3 py-2.5 rounded-2xl border transition-all cursor-pointer ${
                      actif
                        ? 'bg-[#e8f5ee] dark:bg-emerald-500/10 border-[#006d37]/40'
                        : 'bg-white dark:bg-[#141916] border-[#bbcbbb]/30'
                    }`}
                  >
                    <span
                      className={`shrink-0 w-5 h-5 rounded-lg flex items-center justify-center ${
                        actif ? 'bg-[#006d37] text-white' : 'bg-[#f3f4f5] dark:bg-black/20'
                      }`}
                    >
                      {actif && <Check className="w-3.5 h-3.5" />}
                    </span>
                    <span className="flex-1 text-sm text-[#1f1c0b] dark:text-gray-200">{el.labelAr}</span>
                    <span className="text-[11px] font-bold text-[#506072] dark:text-gray-400">
                      {el.points} ن
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            data-testid="drill-valider"
            onClick={() => setPhase('comparaison')}
            className="w-full px-4 py-3 rounded-2xl bg-[#006d37] hover:bg-[#00592d] text-white text-sm font-bold cursor-pointer transition-colors"
          >
            أظهر النتيجة والرسم الرسمي
          </button>
        </div>
      )}

      {phase === 'comparaison' && (
        <div data-testid="phase-comparaison" className="space-y-4">
          <div className="rounded-3xl p-4 bg-white dark:bg-[#141916] border border-[#bbcbbb]/30 text-center">
            <p data-testid="drill-score" className="text-2xl font-black text-[#1f1c0b] dark:text-gray-100">
              {score} / {total}
            </p>
            <p data-testid="drill-verdict" className={`text-sm font-bold mt-1 ${verdict.cls}`}>
              {verdict.label}
            </p>
          </div>

          {oublis.length > 0 && (
            <div data-testid="drill-oublis" className="rounded-3xl p-4 bg-rose-50/60 dark:bg-rose-500/10 border border-rose-200/60">
              <p className="text-sm font-black text-rose-700 dark:text-rose-400 mb-2">
                عناصر أساسية غابت عن ورقتك
              </p>
              <ul className="space-y-1">
                {oublis.map((e) => (
                  <li key={e.id} className="text-sm leading-7 text-rose-700 dark:text-rose-300">
                    • {e.labelAr}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-3xl p-4 bg-[#fff9ed] dark:bg-black/20 border border-[#d9a400]/30">
            <p className="text-sm font-black text-[#8a6a00] dark:text-[#d9a400] mb-2">الأخطاء التي تُفقد النقاط</p>
            <ul className="space-y-1">
              {drill.trapsAr.map((t) => (
                <li key={t} className="text-sm leading-7 text-[#1f1c0b] dark:text-gray-200">⚠️ {t}</li>
              ))}
            </ul>
          </div>

          <figure className="rounded-3xl p-3 bg-white dark:bg-[#141916] border border-[#bbcbbb]/30">
            <img
              data-testid="drill-asset"
              src={drill.assetSrc}
              alt={drill.altAr}
              className="w-full h-auto rounded-2xl"
              loading="lazy"
            />
            <figcaption className="mt-2 text-[12px] text-[#506072] dark:text-gray-400">{drill.altAr}</figcaption>
          </figure>

          <button
            data-testid="drill-recommencer"
            onClick={() => {
              setCoches([]);
              setPhase('dessin');
            }}
            className="w-full flex flex-row-reverse items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#f3f4f5] dark:bg-[#1f2622] text-sm font-bold text-[#006d37] dark:text-[#2ecc71] cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>أعد الرسم من الذاكرة</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function SchemaDrillView({ onBackToHome }: SchemaDrillViewProps) {
  const [unite, setUnite] = useState<number | undefined>(undefined);
  const [ouvert, setOuvert] = useState<SchemaDrill | null>(null);

  const liste = useMemo(() => (unite === undefined ? SCHEMA_DRILLS : drillsForUnit(unite)), [unite]);
  const unites = drillUnitIds();

  if (ouvert) {
    return (
      <div className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto" dir="rtl">
        <Exercice drill={ouvert} onQuitter={() => setOuvert(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto" dir="rtl" data-testid="drill-liste">
      <div className="flex flex-row-reverse items-center justify-between gap-4 mb-5">
        <div className="flex flex-row-reverse items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-gradient-to-l from-[#d9a400] to-amber-600 flex items-center justify-center shadow-md">
            <PenTool className="w-6 h-6 text-white" />
          </span>
          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-black text-[#1f1c0b] dark:text-gray-100">ارسم من الذاكرة</h1>
            <p className="text-sm text-[#506072] dark:text-gray-400">
              الرسومات التي يجب حفظها للبكالوريا — الورقة أولاً، الصورة بعد التقييم ({SCHEMA_DRILLS.length} رسماً)
            </p>
          </div>
        </div>
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="flex flex-row-reverse items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f3f4f5] dark:bg-[#1f2622] border border-[#bbcbbb]/30 text-sm font-bold text-[#006d37] dark:text-[#2ecc71] cursor-pointer"
          >
            <span>العودة</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-row-reverse flex-wrap gap-2 mb-5">
        <button
          data-testid="drill-unite-tous"
          onClick={() => setUnite(undefined)}
          className={`text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer ${
            unite === undefined ? 'bg-[#006d37] text-white' : 'bg-[#f3f4f5] dark:bg-[#1f2622] text-[#506072] dark:text-gray-300'
          }`}
        >
          كل الوحدات
        </button>
        {unites.map((u) => (
          <button
            key={u}
            data-testid={`drill-unite-${u}`}
            onClick={() => setUnite(unite === u ? undefined : u)}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer ${
              unite === u ? 'bg-[#006d37] text-white' : 'bg-[#f3f4f5] dark:bg-[#1f2622] text-[#506072] dark:text-gray-300'
            }`}
          >
            الوحدة {u}
          </button>
        ))}
      </div>

      <p data-testid="drill-count" className="text-sm font-bold text-[#506072] dark:text-gray-400 mb-3">
        {liste.length} رسماً
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {liste.map((d) => (
          <button
            key={d.id}
            data-testid={`drill-${d.id}`}
            onClick={() => setOuvert(d)}
            className="text-right bg-white dark:bg-[#141916] rounded-3xl p-4 border border-[#bbcbbb]/30 dark:border-[#2ecc71]/10 shadow-sm hover:shadow-md hover:border-[#d9a400]/50 transition-all cursor-pointer"
          >
            <h3 className="text-base font-black text-[#1f1c0b] dark:text-gray-100 mb-1">{d.titleAr}</h3>
            <p className="text-[13px] text-[#506072] dark:text-gray-400 mb-2">{d.consigneAr}</p>
            <div className="flex flex-row-reverse flex-wrap gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#e8f5ee] text-[#006d37] dark:bg-black/20 dark:text-[#2ecc71]">
                الوحدة {d.unitId}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#f3f4f5] text-[#506072] dark:bg-black/20 dark:text-gray-400">
                {d.minutes} د · {totalPoints(d)} ن
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
