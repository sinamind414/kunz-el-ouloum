import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Target } from 'lucide-react';
import { Unit } from '../types';
import { DOMAINS_INFO, getDomainProgress, getDomainUnitsCount } from '../utils/domainMapper';
import { loadSession } from '../utils/sessionManager';
import { KNOWLEDGE_CARDS } from '../data/smartBotData';

interface DomainReadinessRadarProps {
  units: Unit[];
}

export default function DomainReadinessRadar({ units }: DomainReadinessRadarProps) {
  const session = loadSession();

  const mistakesByDomain = new Map<number, number>();
  for (const mistakeId of session.mistakes) {
    const card = KNOWLEDGE_CARDS.find((c) => c.id === mistakeId);
    if (card) {
      mistakesByDomain.set(card.domainId, (mistakesByDomain.get(card.domainId) || 0) + 1);
    }
  }

  const data = DOMAINS_INFO.map((domain) => {
    const baseProgress = getDomainProgress(domain.id, units);
    const activeMistakes = mistakesByDomain.get(domain.id) || 0;
    const unitCount = getDomainUnitsCount(domain.id);
    const penalty = Math.min(40, activeMistakes * 8);
    const readiness = Math.max(0, Math.min(100, baseProgress - penalty));
    return {
      domain: domain.title,
      readiness,
      baseProgress,
      activeMistakes,
      unitCount,
      fill: domain.color,
    };
  });

  const hasAnyActivity = data.some((d) => d.baseProgress > 0 || d.activeMistakes > 0);

  return (
    <section className="bg-[#ffffff] border border-[#e2dabf]/60 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-[#006d37]" />
        <h3 className="font-extrabold text-base text-[#1f1c0b]">رادار الجاهزية حسب المجال (البكالوريا)</h3>
      </div>

      {hasAnyActivity ? (
        <>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} outerRadius="72%">
                <PolarGrid stroke="#e2dabf" strokeOpacity={0.6} />
                <PolarAngleAxis
                  dataKey="domain"
                  tick={{ fill: '#506072', fontSize: 11, fontFamily: 'Noto Kufi Arabic' }}
                />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  tick={{ fill: '#506072', fontSize: 9 }}
                  stroke="#e2dabf"
                  tickCount={5}
                />
                <Radar
                  name="الجاهزية %"
                  dataKey="readiness"
                  stroke="#006d37"
                  fill="#006d37"
                  fillOpacity={0.35}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.map((d, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#e2dabf]/40 p-3 flex items-center justify-between gap-2"
                style={{ backgroundColor: `${d.fill}0f` }}
              >
                <div className="min-w-0">
                  <span className="text-[11px] font-extrabold text-[#1f1c0b] block truncate">{d.domain}</span>
                  <span className="text-[10px] text-[#506072] font-semibold">
                    {d.activeMistakes > 0 ? `${d.activeMistakes} خطأ نشط` : 'لا أخطاء'}
                  </span>
                </div>
                <span className="text-lg font-black" style={{ color: d.fill }}>
                  {d.readiness}%
                </span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-[#506072] leading-relaxed">
            تُحتسب الجاهزية من تقدم الوحدات داخل كل مجال، ويتم خصم نقاط عند وجود أخطاء نشطة سجّلها المرشد الذكي.
          </p>
        </>
      ) : (
        <div className="h-64 flex items-center justify-center text-center bg-[#fff9ed]/50 rounded-2xl border border-dashed border-[#e2dabf]">
          <p className="text-sm text-[#506072] font-semibold max-w-sm leading-7">
            لا توجد بيانات جاهزية بعد. ابدأ بحل اختبارات الوحدات أو استخدم المرشد الذكي لتظهر خريطة تقدمك لكل مجال.
          </p>
        </div>
      )}
    </section>
  );
}
