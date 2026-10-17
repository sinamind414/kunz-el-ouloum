// ProgressionPanel.tsx — « هل أتقدّم فعلاً؟ » (sprint 62).
//
// L'application affichait des XP, une série de jours et des tâches cochées :
// de l'ACTIVITÉ. Ce panneau répond à la seule question qui compte pour un
// élève à trois mois du BAC : est-ce que j'écris mieux qu'avant ?
//
// Il refuse de conclure sous six rédactions, et appelle « stable » ce qui est
// stable. Un tableau de bord qui félicite tout le monde ne sert personne.

import { Activity, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { bilanSchemas } from '../data/drillLog';
import { SCHEMA_DRILL_BY_ID as DRILL_BY_ID } from '../data/schemaDrills';
import {
  couvertureParUnite,
  progressionParFamille,
  verdictProgression,
} from '../data/learningProgress';

const FLECHE = {
  progres: <TrendingUp className="w-3.5 h-3.5" />,
  recul: <TrendingDown className="w-3.5 h-3.5" />,
  stable: <Activity className="w-3.5 h-3.5" />,
  insuffisant: null,
} as const;

const CLASSE = {
  progres: 'text-emerald-700 dark:text-emerald-400',
  recul: 'text-rose-700 dark:text-rose-400',
  stable: 'text-[#506072] dark:text-gray-400',
  insuffisant: 'text-[#506072]/70 dark:text-gray-500',
} as const;

export default function ProgressionPanel() {
  const verdict = verdictProgression();
  // Sprint 66 : la restitution (schémas refaits de mémoire) est un signal
  // distinct de la production écrite. On les affiche côte à côte sans jamais
  // les moyenner — une moyenne masquerait qu'on sait dessiner sans savoir
  // rédiger, ou l'inverse.
  const schemas = bilanSchemas();
  const familles = progressionParFamille();
  const couverture = couvertureParUnite().filter((c) => c.partExamen >= 5);

  return (
    <section
      data-testid="progression-panel"
      dir="rtl"
      className="rounded-3xl p-4 bg-white dark:bg-[#141916] border border-[#bbcbbb]/30"
    >
      <h3 className="text-sm font-black text-[#1f1c0b] dark:text-gray-100 mb-1">
        هل أتقدّم فعلاً؟
      </h3>
      <p data-testid="progression-verdict" className="text-[12px] leading-6 text-right text-[#1f1c0b] dark:text-gray-200 mb-1">
        {verdict.messageAr}
      </p>
      <p className="text-[11px] text-[#506072] dark:text-gray-400 text-right mb-3">
        {verdict.redactions} جواباً محرَّراً · {verdict.joursActifs} يوماً فعلياً
      </p>

      <div data-testid="progression-restitution" className="mb-3">
        <p className="text-[11px] font-black text-[#506072] dark:text-gray-400 mb-1">
          الاسترجاع — الرسم من الذاكرة
        </p>
        <p className="text-[12px] leading-6 text-right text-[#1f1c0b] dark:text-gray-200">
          {schemas.messageAr}
        </p>
        {schemas.fragiles.length > 0 && (
          <ul className="mt-1 space-y-0.5">
            {schemas.fragiles.slice(0, 3).map((f) => (
              <li
                key={f.drillId}
                data-testid={`progression-schema-${f.drillId}`}
                className="text-[11px] text-right text-[#506072] dark:text-gray-400"
              >
                {DRILL_BY_ID[f.drillId]?.titleAr ?? f.drillId} — {Math.round(f.dernierTaux * 100)}٪
                {f.derniersOublis > 0 ? ` · ${f.derniersOublis} عنصراً أساسياً غائباً` : ''}
              </li>
            ))}
          </ul>
        )}
      </div>

      {verdict.angleMort && (
        <p
          data-testid="progression-angle-mort"
          className="flex flex-row-reverse items-start gap-2 text-[12px] leading-6 text-amber-800 dark:text-amber-300 text-right mb-3"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            لم تكتب أي جواب في « {verdict.angleMort.titre} » رغم أنها تمثّل{' '}
            {verdict.angleMort.partExamen}٪ من نقاط الامتحان.
          </span>
        </p>
      )}

      {familles.length > 0 && (
        <div data-testid="progression-familles" className="mb-3">
          <p className="text-[11px] font-black text-[#506072] dark:text-gray-400 mb-1">
            حسب التعليمة
          </p>
          <ul className="space-y-0.5">
            {familles.map((f) => (
              <li
                key={f.familyId}
                data-testid={`progression-famille-${f.familyId}`}
                className={`flex flex-row-reverse items-center gap-1.5 text-[12px] leading-6 text-right ${CLASSE[f.tendance]}`}
              >
                {FLECHE[f.tendance]}
                <span>
                  <span className="font-bold">{f.titreAr}</span> — {f.redactions} جواباً ·{' '}
                  {f.tendance === 'insuffisant'
                    ? 'عدد غير كافٍ للحكم'
                    : `${f.deltaPourcent > 0 ? '+' : ''}${f.deltaPourcent} نقطة`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div data-testid="progression-couverture">
        <p className="text-[11px] font-black text-[#506072] dark:text-gray-400 mb-1">
          أين وقع عملك الكتابي مقارنة بوزن الوحدات
        </p>
        <ul className="space-y-0.5">
          {couverture.map((c) => (
            <li
              key={c.unitId}
              data-testid={`progression-unite-${c.unitId}`}
              className="text-[12px] leading-6 text-right text-[#1f1c0b] dark:text-gray-200"
            >
              {c.titre} — {c.partExamen}٪ من النقاط ·{' '}
              <span className={c.redactions === 0 ? 'text-rose-700 dark:text-rose-400 font-bold' : ''}>
                {c.redactions} جواباً
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-3 text-[10px] leading-5 text-[#506072] dark:text-gray-500 text-right">
        يُقاس هنا شكل الجواب فقط (أرقام، أدوات ربط، بنية). المضمون العلمي لا يُقيَّم آلياً.
      </p>
    </section>
  );
}
