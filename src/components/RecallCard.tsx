// RecallCard.tsx — « ما يجب أن تعيده اليوم » sur l'accueil (sprint 65).
//
// Le programme du jour part du programme officiel ; cette carte part de ce que
// l'élève a déjà écrit. Elle propose de refaire, sans regarder, les réponses
// dont la date tombe sur un palier d'espacement (1, 3, 7, 16 jours).
//
// Choix d'affichage : la carte ne s'affiche PAS quand rien n'est dû et que
// l'élève n'a jamais rien écrit — une carte vide sur l'accueil est du bruit.
// Elle s'affiche en revanche avec son message d'explication dès qu'il a
// commencé à écrire : l'absence de rappel est alors une information.

import { RotateCcw } from 'lucide-react';
import { messageAucunRappel, rappelsDuJour } from '../data/spacedRecall';
import { readLearningLog } from '../data/learningLog';

interface Props {
  /** Ouvre l'atelier de rédaction sur cet exercice. */
  onOpenRedaction: (ideaId: string) => void;
}

export default function RecallCard({ onOpenRedaction }: Props) {
  const journal = readLearningLog();
  const rappels = rappelsDuJour(undefined, journal);

  if (rappels.length === 0 && journal.length === 0) return null;

  return (
    <section
      dir="rtl"
      data-testid="recall-card"
      className="w-full text-right rounded-3xl p-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300/50 dark:border-amber-800/40"
    >
      <div className="flex flex-row-reverse items-center gap-3 mb-2">
        <span className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
          <RotateCcw className="w-5 h-5" />
        </span>
        <div className="text-right">
          <p className="text-sm font-black text-[#1f1c0b] dark:text-gray-100">ما يجب أن تعيده اليوم</p>
          <p data-testid="recall-resume" className="text-[11px] text-[#7a5a16] dark:text-amber-300/80">
            مراجعة متباعدة لما كتبته أنت — بعد يوم، ثلاثة، سبعة ثم ستة عشر يوماً.
          </p>
        </div>
      </div>

      {rappels.length === 0 ? (
        <p data-testid="recall-vide" className="text-[12px] leading-6 text-[#506072] dark:text-gray-400">
          {messageAucunRappel(journal)}
        </p>
      ) : (
        <ul className="space-y-2">
          {rappels.map((r) => (
            <li key={r.ideaId}>
              <button
                type="button"
                data-testid={`recall-${r.ideaId}`}
                onClick={() => onOpenRedaction(r.ideaId)}
                className="w-full text-right rounded-2xl px-3 py-2 bg-white dark:bg-[#161c18] border border-amber-200/70 dark:border-amber-900/40 hover:border-amber-400 transition-all cursor-pointer"
              >
                <span className="block text-[13px] font-black text-[#1f1c0b] dark:text-gray-100">
                  {r.titleAr || r.ideaId}
                </span>
                <span className="block text-[11px] text-[#506072] dark:text-gray-400 mt-0.5">
                  {r.familleAr ? `${r.familleAr} · ` : ''}
                  {r.raisonAr}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
