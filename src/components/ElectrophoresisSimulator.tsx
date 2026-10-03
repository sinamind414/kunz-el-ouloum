// ElectrophoresisSimulator.tsx — item 6 de l'audit des 5 leçons prioritaires.
//
// Le seul livrable de type « simulation » du plan : pH → charge → sens de
// migration. Aucune chaîne concurrente ne propose d'interactif sur le pHi, alors
// que « سلوك الأحماض الأمينية » est la 2e notion la plus difficile (73 points).
//
// Parti pris : l'élève PRÉDIT avant de voir. Le bouton de migration reste
// verrouillé tant qu'aucune prédiction n'est faite, parce qu'une animation
// regardée passivement n'apprend pas la règle pH/pHi.
//
// Rendu 100 % SVG + état React : aucune dépendance, fonctionne hors-ligne.
// Règle physique appliquée (livre officiel, ch. 8) :
//   pH < pHi → charge globale positive → migration vers la CATHODE (المهبط)
//   pH > pHi → charge globale négative → migration vers l'ANODE (المصعد)
//   pH = pHi → charge nette nulle → aucune migration.

import { useMemo, useState } from 'react';
import type { FC } from 'react';

export interface MoleculeElectrophorese {
  id: string;
  nomAr: string;
  pHi: number;
  familleAr: string;
  couleur: string;
}

/** pHi du livre officiel : Ala = 6 ; les autres valeurs sont les valeurs usuelles du programme. */
export const MOLECULES_ELECTROPHORESE: readonly MoleculeElectrophorese[] = [
  { id: 'ala', nomAr: 'الألانين (Ala)', pHi: 6.0, familleAr: 'حمض أميني متعادل', couleur: '#0ea5e9' },
  { id: 'glu', nomAr: 'حمض الغلوتاميك (Glu)', pHi: 3.2, familleAr: 'حمض أميني حامضي', couleur: '#dc2626' },
  { id: 'lys', nomAr: 'الليزين (Lys)', pHi: 9.7, familleAr: 'حمض أميني قاعدي', couleur: '#7c3aed' },
  { id: 'his', nomAr: 'الهيستيدين (His)', pHi: 7.6, familleAr: 'حمض أميني قاعدي', couleur: '#059669' },
] as const;

export type SensMigration = 'cathode' | 'anode' | 'immobile';

/** Règle du cours : on compare le pH du milieu au pHi, jamais autre chose. */
export function sensMigration(pH: number, pHi: number): SensMigration {
  if (Math.abs(pH - pHi) < 0.25) return 'immobile';
  return pH < pHi ? 'cathode' : 'anode';
}

export function chargeGlobale(pH: number, pHi: number): '+' | '−' | '0' {
  const s = sensMigration(pH, pHi);
  return s === 'immobile' ? '0' : s === 'cathode' ? '+' : '−';
}

const LIBELLE_SENS: Record<SensMigration, string> = {
  cathode: 'نحو المهبط',
  anode: 'نحو المصعد',
  immobile: 'لا يهاجر',
};

// Géométrie du support de migration (repère SVG).
const X_ANODE = 90;
const X_CATHODE = 610;
const X_DEPOT = (X_ANODE + X_CATHODE) / 2;
const Y_BANDE = 120;

/** Déplacement proportionnel à l'écart |pH − pHi|, borné au bord de la bande. */
export function positionSpot(pH: number, pHi: number): number {
  const sens = sensMigration(pH, pHi);
  if (sens === 'immobile') return X_DEPOT;
  const ecart = Math.min(Math.abs(pH - pHi), 6);
  const course = (ecart / 6) * (X_CATHODE - X_DEPOT - 30);
  return sens === 'cathode' ? X_DEPOT + course : X_DEPOT - course;
}

export const ElectrophoresisSimulator: FC = () => {
  const [moleculeId, setMoleculeId] = useState<string>('ala');
  const [pH, setPH] = useState<number>(2);
  const [prediction, setPrediction] = useState<SensMigration | null>(null);
  const [migre, setMigre] = useState(false);
  const [score, setScore] = useState({ justes: 0, total: 0 });

  const molecule = useMemo(
    () => MOLECULES_ELECTROPHORESE.find((m) => m.id === moleculeId) ?? MOLECULES_ELECTROPHORESE[0],
    [moleculeId],
  );
  const attendu = sensMigration(pH, molecule.pHi);
  const charge = chargeGlobale(pH, molecule.pHi);
  const x = migre ? positionSpot(pH, molecule.pHi) : X_DEPOT;

  /** Toute modification des conditions annule la manche en cours. */
  const reinitialiser = () => {
    setPrediction(null);
    setMigre(false);
  };

  const lancer = () => {
    if (!prediction) return;
    setMigre(true);
    setScore((s) => ({
      justes: s.justes + (prediction === attendu ? 1 : 0),
      total: s.total + 1,
    }));
  };

  return (
    <section dir="rtl" data-testid="electrophorese-sim" className="text-right">
      <header className="mb-3">
        <h3 className="text-lg font-black text-[#006d37] dark:text-[#2ecc71]">
          محاكاة الهجرة الكهربائية : pH ← الشحنة ← الاتجاه
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-[#506072] dark:text-gray-400">
          اختر الحمض الأميني و pH الوسط، ثم <strong>توقّع الاتجاه قبل التشغيل</strong>. القاعدة
          الوحيدة : قارن pH الوسط بـ pHi.
        </p>
      </header>

      {/* Choix de la molécule */}
      <div className="mb-3 flex flex-wrap gap-2">
        {MOLECULES_ELECTROPHORESE.map((m) => (
          <button
            key={m.id}
            type="button"
            data-testid={`molecule-${m.id}`}
            aria-pressed={m.id === moleculeId}
            onClick={() => {
              setMoleculeId(m.id);
              reinitialiser();
            }}
            className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
              m.id === moleculeId
                ? 'bg-[#006d37] text-white'
                : 'bg-[#f3f4f5] text-[#1f1c0b] dark:bg-[#1f2622] dark:text-gray-200'
            }`}
          >
            {m.nomAr} — pHi = {m.pHi}
          </button>
        ))}
      </div>

      {/* Réglage du pH */}
      <div className="mb-4 flex items-center gap-3">
        <label htmlFor="ph-slider" className="text-sm font-bold text-[#1f1c0b] dark:text-gray-100">
          pH الوسط
        </label>
        <input
          id="ph-slider"
          data-testid="ph-slider"
          type="range"
          min={1}
          max={13}
          step={0.5}
          value={pH}
          onChange={(e) => {
            setPH(Number(e.target.value));
            reinitialiser();
          }}
          className="h-2 flex-1 cursor-pointer accent-[#006d37]"
        />
        <output data-testid="ph-valeur" className="w-12 text-sm font-black text-[#006d37] dark:text-[#2ecc71]">
          {pH.toFixed(1)}
        </output>
      </div>

      {/* Support de migration */}
      <svg viewBox="0 0 700 200" role="img" aria-label="شريط الهجرة الكهربائية" className="w-full">
        <title>شريط الهجرة الكهربائية بين المصعد والمهبط</title>
        <rect x={X_ANODE} y={Y_BANDE - 26} width={X_CATHODE - X_ANODE} height="52" rx="8" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
        {/* Électrodes : anode (+) à gauche, cathode (−) à droite */}
        <rect x={X_ANODE - 46} y={Y_BANDE - 40} width="40" height="80" rx="6" fill="#dc2626" />
        <text x={X_ANODE - 26} y={Y_BANDE + 4} textAnchor="middle" fontSize="18" fontWeight="700" fill="#fff">+</text>
        <text x={X_ANODE - 26} y={Y_BANDE + 58} textAnchor="middle" fontSize="13" fontWeight="700" fill="#dc2626">المصعد</text>
        <rect x={X_CATHODE + 6} y={Y_BANDE - 40} width="40" height="80" rx="6" fill="#1d4ed8" />
        <text x={X_CATHODE + 26} y={Y_BANDE + 4} textAnchor="middle" fontSize="20" fontWeight="700" fill="#fff">−</text>
        <text x={X_CATHODE + 26} y={Y_BANDE + 58} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1d4ed8">المهبط</text>
        {/* Ligne de dépôt */}
        <line x1={X_DEPOT} y1={Y_BANDE - 34} x2={X_DEPOT} y2={Y_BANDE + 34} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
        <text x={X_DEPOT} y={Y_BANDE - 42} textAnchor="middle" fontSize="12" fill="#64748b">مكان الوضع</text>
        {/* Tache */}
        <g style={{ transform: `translateX(${x - X_DEPOT}px)`, transition: 'transform 900ms ease-in-out' }}>
          <circle cx={X_DEPOT} cy={Y_BANDE} r="16" fill={molecule.couleur} opacity="0.85" data-testid="spot" />
          <text x={X_DEPOT} y={Y_BANDE + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff">
            {migre ? charge : '?'}
          </text>
        </g>
      </svg>

      {/* Prédiction */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-[#506072] dark:text-gray-400">توقّعك :</span>
        {(['cathode', 'anode', 'immobile'] as const).map((s) => (
          <button
            key={s}
            type="button"
            data-testid={`prediction-${s}`}
            aria-pressed={prediction === s}
            disabled={migre}
            onClick={() => setPrediction(s)}
            className={`rounded-xl px-3 py-2 text-xs font-bold transition-all disabled:opacity-50 ${
              prediction === s
                ? 'bg-[#d9a400] text-white'
                : 'bg-[#f3f4f5] text-[#1f1c0b] dark:bg-[#1f2622] dark:text-gray-200'
            }`}
          >
            {LIBELLE_SENS[s]}
          </button>
        ))}
        <button
          type="button"
          data-testid="lancer-migration"
          disabled={!prediction || migre}
          onClick={lancer}
          className="rounded-xl bg-[#006d37] px-4 py-2 text-xs font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
        >
          شغّل الهجرة
        </button>
      </div>

      {/* Verdict */}
      {migre && (
        <div
          data-testid="verdict"
          className={`mt-3 rounded-2xl border p-3 text-sm leading-relaxed ${
            prediction === attendu
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-200'
              : 'border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200'
          }`}
        >
          <strong>{prediction === attendu ? 'إجابة صحيحة : ' : 'راجع القاعدة : '}</strong>
          {attendu === 'immobile' ? (
            <span data-testid="explication">
              pH الوسط ({pH.toFixed(1)}) يساوي pHi ({molecule.pHi})، فالشحنة الإجمالية معدومة (الصيغة
              ثنائية القطب) ولا تحدث أي هجرة.
            </span>
          ) : (
            <span data-testid="explication">
              pH الوسط ({pH.toFixed(1)}) {pH < molecule.pHi ? 'أقل من' : 'أكبر من'} pHi ({molecule.pHi})،
              فالشحنة الإجمالية {charge === '+' ? 'موجبة' : 'سالبة'} والهجرة{' '}
              {attendu === 'cathode' ? 'نحو المهبط (القطب السالب)' : 'نحو المصعد (القطب الموجب)'}.
            </span>
          )}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs font-bold" data-testid="score">
              النتيجة : {score.justes} / {score.total}
            </span>
            <button
              type="button"
              data-testid="nouvelle-manche"
              onClick={reinitialiser}
              className="rounded-lg bg-white/70 px-3 py-1.5 text-xs font-bold text-[#006d37] dark:bg-black/20 dark:text-[#2ecc71]"
            >
              محاولة أخرى
            </button>
          </div>
        </div>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-[#506072] dark:text-gray-500">
        تذكير : المسافة المقطوعة تكبر كلما ابتعد pH الوسط عن pHi، لأن الشحنة الإجمالية تصبح أكبر.
        عند pH = pHi تنعدم الهجرة — وهي الطريقة التجريبية لتحديد pHi.
      </p>
    </section>
  );
};

export default ElectrophoresisSimulator;
