// BacTypeStats.tsx — « إحصاءاتي حسب نوع الموضوع » (correction axe 5).
//
// Avant : l'historique d'examens ne produisait qu'une courbe globale. L'élève
// ne voyait pas que ses points partaient, par exemple, sur les montages
// « الجزيئة الشبيهة بالركيزة » ou sur le 3ᵉ exercice (08 pts). Ce panneau
// lit UNIQUEMENT les tentatives réellement archivées par `examLog` : aucune
// donnée simulée, aucun zéro affiché à la place d'une donnée absente.

import { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { ARCHETYPE_BY_ID } from '../data/bacArchetypes';
import {
  getExamStatsByType,
  type ExamSource,
  type TypeStatBac,
} from '../utils/examLog';

const LIBELLE_SOURCE: Record<ExamSource, string> = {
  bac2025: 'الإطار الرسمي 2025 (موضوع كامل)',
  bareme: 'سؤال بمقياس رسمي',
  blanc: 'موضوع تجريبي مركّب',
  autre: 'محاولة أخرى',
};

function libelleArchetype(id: string): string {
  return ARCHETYPE_BY_ID[id]?.titleAr ?? id;
}

function Bloc({
  titre,
  testId,
  lignes,
}: {
  titre: string;
  testId: string;
  lignes: { cle: string; libelle: string; stat: TypeStatBac }[];
}) {
  if (lignes.length === 0) return null;
  return (
    <div data-testid={testId} className="rounded-2xl p-3 bg-[#f8fbfa] dark:bg-black/20 border border-[#bbcbbb]/30">
      <p className="text-[11px] font-black text-[#1f1c0b] dark:text-gray-100 text-right mb-2">{titre}</p>
      <ul className="space-y-2">
        {lignes.map(({ cle, libelle, stat }) => (
          <li key={cle} className="text-[11px] text-[#506072] dark:text-gray-300">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-bold text-[#1f1c0b] dark:text-gray-200 text-right">{libelle}</span>
              <span className="shrink-0 font-black text-[#006d37] dark:text-[#2ecc71]">
                {stat.average ?? '—'}/20 · {stat.attempts} محاولة
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#006d37] dark:bg-[#2ecc71]"
                style={{ width: `${Math.max(0, Math.min(100, ((stat.average ?? 0) / 20) * 100))}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function BacTypeStats() {
  // Lu au montage : le panneau est refermé/rouvert après chaque nouvel examen.
  const stats = useMemo(() => getExamStatsByType(), []);

  return (
    <section
      data-testid="bac-stats-types"
      dir="rtl"
      className="rounded-3xl p-4 bg-white dark:bg-[#141916] border border-[#006d37]/30 mb-4"
    >
      <h2 className="flex items-center gap-2 text-base font-black text-[#1f1c0b] dark:text-gray-100 mb-2">
        <BarChart3 className="w-4 h-4" />
        إحصاءاتي حسب نوع الموضوع
      </h2>
      {stats.attempts === 0 ? (
        <p data-testid="bac-stats-vide" className="text-[12px] leading-6 text-[#506072] dark:text-gray-400 text-right">
          لا توجد محاولات مسجّلة بعد. ستظهر هنا الأرقام بعد أول إرسال لموضوع 2025؛ لا نعرض أصفاراً
          تقديرية ولا توزيعاً رسمياً للامتحان.
        </p>
      ) : (
        <>
          <p className="text-[11px] leading-6 text-[#506072] dark:text-gray-400 text-right mb-3">
            {stats.attempts} محاولة مسجّلة محلياً. المتوسط والحد الأعلى محسوبان على /20، وليسا درجات بكالوريا رسمية.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Bloc
              titre="حسب تركيبة التمرين (المونتاج)"
              testId="bac-stats-archetypes"
              lignes={stats.parArchetype.map((s) => ({
                cle: s.key,
                libelle: libelleArchetype(s.key),
                stat: s,
              }))}
            />
            <Bloc
              titre="حسب الدورة"
              testId="bac-stats-annees"
              lignes={stats.parAnnee.map((s) => ({ cle: s.key, libelle: `بكالوريا ${s.key}`, stat: s }))}
            />
            <Bloc
              titre="حسب نوع الاختبار"
              testId="bac-stats-sources"
              lignes={stats.parSource.map((s) => ({
                cle: s.key,
                libelle: LIBELLE_SOURCE[s.key as ExamSource] ?? s.key,
                stat: s,
              }))}
            />
            <div
              data-testid="bac-stats-exercices"
              className="rounded-2xl p-3 bg-[#f8fbfa] dark:bg-black/20 border border-[#bbcbbb]/30"
            >
              <p className="text-[11px] font-black text-[#1f1c0b] dark:text-gray-100 text-right mb-2">
                حسب رتبة التمرين (5 / 7 / 8 نقاط)
              </p>
              {stats.parExercice.length === 0 ? (
                <p className="text-[11px] text-[#506072] dark:text-gray-400 text-right">
                  لا تفصيل بالتمرين لهذه المحاولات.
                </p>
              ) : (
                <ul className="space-y-1">
                  {stats.parExercice.map((e) => (
                    <li key={e.exercice} className="flex items-center justify-between gap-2 text-[11px] text-[#506072] dark:text-gray-300">
                      <span className="font-bold text-[#1f1c0b] dark:text-gray-200">التمرين {e.exercice}</span>
                      <span className="font-black text-[#006d37] dark:text-[#2ecc71]">
                        {e.pointsMoyens ?? '—'} / {e.maxPtsMoyen ?? '—'} ن ·{' '}
                        {e.taux === null ? '—' : `${Math.round(e.taux * 100)} %`} · {e.occurrences} مرة
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
