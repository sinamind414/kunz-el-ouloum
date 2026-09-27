// BacIdeaTrainer.tsx — écrire une réponse sur un exercice réel, et être repris
// sur la forme immédiatement (sprint 24).
//
// Les sprints 16 à 23 ont produit une chaîne complète mais en pièces :
//   · l'exercice réel et ses supports        → bacSessionIndex
//   · le montage qu'il rejoue et son piège   → bacArchetypes
//   · ce que la consigne exige               → verbDemands
//   · si la réponse a la bonne forme         → answerStructureCheck
// L'élève devait passer d'un écran à l'autre pour en faire quelque chose.
// Cet atelier les met bout à bout sur UNE page : je lis l'exercice, je choisis
// la consigne, j'écris, je suis repris pendant que j'écris.
//
// Ce qui est délibérément absent : une note. Aucune de ces briques ne mesure le
// fond ; afficher un score global serait un mensonge utile à personne. Le
// retour porte sur la structure, et le rappel de la notion évaluée est
// disponible à la demande — après avoir écrit, pas avant.

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, ListChecks, PenLine } from 'lucide-react';
import type { BacExerciseIdea } from '../data/bacSessionIndex';
import { archetypesForIdea } from '../data/bacArchetypes';
import { VERB_FAMILY_BY_ID, classifyVerb } from '../data/verbDemands';
import { structureVerdict } from '../data/answerStructureCheck';

interface Props {
  idea: BacExerciseIdea;
  onClose: () => void;
}

const cleStockage = (ideaId: string, familyId: string) => `kunz.bacTrainer.${ideaId}.${familyId}`;

/** Familles de consignes réellement demandées par cet exercice, sans doublon. */
export function famillesDemandees(idea: BacExerciseIdea): string[] {
  const vues: string[] = [];
  for (const v of idea.verbsAr) {
    const f = classifyVerb(v);
    if (f && !vues.includes(f.id)) vues.push(f.id);
  }
  return vues;
}

export default function BacIdeaTrainer({ idea, onClose }: Props) {
  const familles = useMemo(() => famillesDemandees(idea), [idea]);
  const [familleId, setFamilleId] = useState(familles[0] ?? '');
  const [texte, setTexte] = useState('');
  const [notionVisible, setNotionVisible] = useState(false);

  const cle = cleStockage(idea.id, familleId);

  useEffect(() => {
    try {
      setTexte(localStorage.getItem(cle) ?? '');
    } catch {
      setTexte('');
    }
    setNotionVisible(false);
  }, [cle]);

  const ecrire = (valeur: string) => {
    setTexte(valeur);
    try {
      localStorage.setItem(cle, valeur);
    } catch {
      /* stockage indisponible : la session reste utilisable */
    }
  };

  const famille = familleId ? VERB_FAMILY_BY_ID[familleId] : undefined;
  const verdict = familleId ? structureVerdict(familleId, texte) : null;
  const montages = archetypesForIdea(idea.id);

  return (
    <section
      data-testid="bac-trainer"
      dir="rtl"
      className="rounded-3xl p-4 bg-white dark:bg-[#141916] border-2 border-[#006d37]/40 mb-4"
    >
      <div className="flex flex-row-reverse items-start justify-between gap-3 mb-3">
        <div className="text-right">
          <h2 className="flex flex-row-reverse items-center gap-2 text-base font-black text-[#1f1c0b] dark:text-gray-100">
            <PenLine className="w-4 h-4" />
            تدرّب على: {idea.titleAr}
          </h2>
          <p className="text-[12px] text-[#506072] dark:text-gray-400">
            بكالوريا {idea.year} · موضوع {idea.sujet} · تمرين {idea.exercice} · {idea.points} نقاط
          </p>
        </div>
        <button
          data-testid="trainer-fermer"
          onClick={onClose}
          className="flex flex-row-reverse items-center gap-2 px-3 py-2 rounded-2xl bg-[#f3f4f5] dark:bg-[#1f2622] text-sm font-bold text-[#006d37] dark:text-[#2ecc71] cursor-pointer"
        >
          <span>إغلاق</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="rounded-2xl p-3 bg-[#f7f8f7] dark:bg-black/20 mb-3">
        <p className="text-[11px] font-black text-[#506072] dark:text-gray-400 mb-1">السندات المقدَّمة</p>
        <ul className="list-disc pr-4 space-y-1 text-[12px] leading-6 text-[#506072] dark:text-gray-300 text-right">
          {idea.supportsAr.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>

      {montages.length > 0 && (
        <div data-testid="trainer-montage" className="rounded-2xl p-3 bg-[#f7fbf8] dark:bg-black/20 mb-3">
          <p className="text-[11px] font-black text-[#006d37] dark:text-[#2ecc71] mb-1">
            التركيب المتكرّر: {montages[0].titleAr}
          </p>
          <ol className="list-decimal pr-4 space-y-1 text-[12px] leading-6 text-[#1f1c0b] dark:text-gray-200 text-right">
            {montages[0].methodAr.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ol>
          <p className="mt-2 flex flex-row-reverse items-start gap-2 text-[12px] leading-6 text-rose-700 dark:text-rose-400 text-right">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{montages[0].trapAr}</span>
          </p>
        </div>
      )}

      <div className="flex flex-row-reverse flex-wrap gap-2 mb-2">
        {familles.map((id) => (
          <button
            key={id}
            data-testid={`trainer-famille-${id}`}
            onClick={() => setFamilleId(id)}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-xl cursor-pointer ${
              familleId === id
                ? 'bg-[#006d37] text-white'
                : 'bg-[#f3f4f5] dark:bg-[#1f2622] text-[#506072] dark:text-gray-300'
            }`}
          >
            {VERB_FAMILY_BY_ID[id]?.titleAr ?? id}
          </button>
        ))}
      </div>

      {famille && (
        <p data-testid="trainer-canevas" className="text-[12px] leading-6 text-[#8a6a00] dark:text-[#d9a400] text-right mb-2">
          <span className="font-black">قالب الصياغة: </span>
          {famille.templateAr}
        </p>
      )}

      <textarea
        data-testid="trainer-reponse"
        value={texte}
        onChange={(e) => ecrire(e.target.value)}
        rows={7}
        placeholder="اكتب جوابك هنا — يُحفظ تلقائياً"
        className="w-full rounded-2xl p-3 text-sm leading-7 bg-[#f8fbfa] dark:bg-black/30 border border-[#bbcbbb]/40 text-right text-[#1f1c0b] dark:text-gray-100"
      />

      {verdict && texte.trim() !== '' && (
        <div data-testid="trainer-verdict" className="mt-3 rounded-2xl p-3 bg-[#f3f4f5] dark:bg-black/20">
          <p className="flex flex-row-reverse items-center gap-2 text-[12px] font-black text-[#1f1c0b] dark:text-gray-100 mb-1">
            <ListChecks className="w-4 h-4" />
            شكل الجواب: {verdict.satisfaits} / {verdict.total}
          </p>
          {verdict.checks.map((c) => (
            <p
              key={c.id}
              data-testid={`trainer-check-${c.id}`}
              className={`text-[12px] leading-6 text-right ${
                c.ok
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : c.nature === 'vigilance'
                    ? 'text-amber-800 dark:text-amber-300'
                    : 'text-rose-700 dark:text-rose-400'
              }`}
            >
              {c.ok ? '✓' : c.nature === 'vigilance' ? '⚠︎' : '✗'} {c.labelAr}
              {!c.ok && <span className="font-normal"> — {c.hintAr}</span>}
            </p>
          ))}
          <p className="mt-1 text-[11px] text-[#506072] dark:text-gray-500">
            فحص شكلي فقط: المضمون العلمي لا يُقيَّم هنا.
          </p>
        </div>
      )}

      <button
        data-testid="trainer-notion"
        onClick={() => setNotionVisible((v) => !v)}
        className="mt-3 text-xs font-bold px-4 py-2 rounded-2xl bg-[#006d37] text-white cursor-pointer"
      >
        {notionVisible ? 'إخفاء ما يُقيَّم' : 'أظهر ما يُقيَّم فعلاً'}
      </button>

      {notionVisible && (
        <p
          data-testid="trainer-notion-texte"
          className="mt-2 rounded-2xl p-3 bg-[#e8f5ee] dark:bg-emerald-500/10 text-[13px] leading-7 text-[#1f1c0b] dark:text-gray-100 text-right"
        >
          {idea.notionAr}
        </p>
      )}
    </section>
  );
}
