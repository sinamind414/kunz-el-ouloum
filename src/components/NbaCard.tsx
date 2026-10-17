// src/components/NbaCard.tsx — « tâche du jour » (Next Best Action).
//
// Extrait tel quel de ParcoursView.tsx (incrément 1) pour être partagé entre
// مساري et الرئيسية : l'élève voit la tâche du jour SANS ouvrir le chemin.
// Aucune logique modifiée — c'est un déplacement de rendu.
//
// `nbaEngine.nextBestAction` est la seule source de décision :
//   REPRISE > RAPPEL(J+14) > QUOTA > NOUVEAU > REPOS.
// Le composant ne décide de rien : il affiche et ouvre.
//
// testid : `${testId}` et `${testId}-start` (défaut `parcours-nba`, ce qui
// conserve les testids stables de ParcoursView.test.tsx).

import { Sparkles } from 'lucide-react';
import {
  PARCOURS_DOMAINS,
  type LessonKind,
} from '../lib/parcours/parcoursPath';
import {
  allowance,
  loadParcours,
  todaysCompletions,
} from '../lib/parcours/parcoursProgress';
import { nbaEyebrow, nextBestAction } from '../lib/parcours/nbaEngine';

export interface NbaCardProps {
  /** Ouvre une leçon (clé + nature + unité) — câblé sur LessonsView. */
  onOpenLesson: (lessonKey: string, kind: LessonKind, unitId: number) => void;
  /** Ouvre les QCM du livre officiel d'une unité — ligne جسار. */
  onOpenQcm: (unitId: number) => void;
  /** Préfixe des testids. défaut « parcours-nba » ; l'accueil passe « home-nba ». */
  testId?: string;
  /** Audit Capitaine §4.2 : clôture EXPLICITE d'une revue J+14 (leçons —
   *  pas de mesure locale : l'élève déclare sa revue, l'échéance repart à
   *  J+14 ; prévu absent si l'appelant ne peut pas rafraîchir sa vue). */
  onRevueFaite?: (itemId: string) => void;
}

export default function NbaCard({
  onOpenLesson,
  onOpenQcm,
  testId = 'parcours-nba',
  onRevueFaite,
}: NbaCardProps) {
  const state = loadParcours();
  const action = nextBestAction(state);

  if (action.type === 'rest') {
    return (
      <section
        data-testid={testId}
        className="rounded-[24px] border border-[#e2dabf] dark:border-gray-800 bg-gradient-to-l from-[#006d37] to-[#0a8f47] p-5 text-white shadow-sm"
      >
        <p className="text-[11px] font-bold text-emerald-100/90">{nbaEyebrow(action)}</p>
        <h2 className="mt-1.5 text-lg font-black leading-relaxed">
          {action.reason === 'quota'
            ? 'أنجزت مهمة اليوم. عُد غداً للمتابعة — التكرار أهم من الكمية.'
            : 'أتممت كل المسار. هذا إنجاز حقيقي.'}
        </h2>
        <p className="mt-2 text-xs leading-6 text-emerald-50/90">
          {todaysCompletions(state)} / {allowance(state)} مهمة اليوم
        </p>
      </section>
    );
  }

  const { item } = action;
  const unit = PARCOURS_DOMAINS.flatMap((d) => d.units).find((u) => u.unitId === item.unitId);
  const ouvrir = () => {
    if (item.kind === 'jalon') {
      onOpenQcm(item.unitId);
    } else if (item.lessonKey) {
      onOpenLesson(item.lessonKey, item.lessonKind ?? 'html', item.unitId);
    }
  };

  return (
    <section
      data-testid={testId}
      className="rounded-[24px] border border-[#e2dabf] dark:border-gray-800 bg-gradient-to-l from-[#006d37] to-[#0a8f47] p-5 text-white shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold text-emerald-100/90">{nbaEyebrow(action)}</p>
        <Sparkles className="h-4 w-4 text-amber-200" />
      </div>
      <p className="mt-1 text-[11px] font-semibold text-emerald-100/80">
        {unit ? unit.title : ''}
      </p>
      <h2 className="mt-1 text-lg font-black leading-relaxed">{item.title}</h2>
      <button
        type="button"
        onClick={ouvrir}
        data-testid={`${testId}-start`}
        className="mt-4 w-full rounded-full bg-white px-5 py-2.5 text-sm font-black text-[#006d37] shadow-sm transition-transform active:scale-[0.98]"
      >
        {action.type === 'resume' ? 'استئناف' : action.type === 'review' ? 'راجِع الآن' : 'ابدأ الآن'}
      </button>
      {action.type === 'review' && onRevueFaite && (
        <button
          type="button"
          onClick={() => onRevueFaite(item.id)}
          data-testid={`${testId}-revu`}
          className="mt-2 w-full rounded-full border border-emerald-100/60 px-5 py-2 text-xs font-black text-emerald-50 transition-transform active:scale-[0.98]"
        >
          ✍️ راجعتُه فعلاً — أخّر الموعد ١٤ يوماً
        </button>
      )}
      <p className="mt-3 text-[11px] leading-6 text-emerald-50/80">
        {todaysCompletions(state)} / {allowance(state)} مهمة اليوم
      </p>
    </section>
  );
}
