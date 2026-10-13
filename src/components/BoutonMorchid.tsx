// src/components/BoutonMorchid.tsx
// Bouton réutilisable qui appelle le « المرشد الذكي » DEPUIS l'endroit où
// l'élève se trouve — cours, exercice, correction — avec une question déjà
// formulée.
//
// Il n'ouvre pas une nouvelle rubrique : il emporte la question vers
// l'assistant contextuel (src/lib/morchidBridge.ts). C'est la traduction UI de
// la restructuration du 2026-10-11 : le المرشد n'est plus un onglet, c'est une
// aide qu'on va chercher au moment du blocage.

import { Compass } from 'lucide-react';
import { demanderAuMorchid } from '../lib/morchidBridge';

interface BoutonMorchidProps {
  /** Question pré-remplie dans le champ du المرشد (jamais envoyée à sa place). */
  question: string;
  /** D'où vient l'appel — traçabilité et identifiant de test. */
  origine: string;
  /** Libellé affiché sur le bouton. */
  label?: string;
}

export default function BoutonMorchid({
  question,
  origine,
  label = 'اسأل المرشد',
}: BoutonMorchidProps) {
  return (
    <button
      type="button"
      data-testid={`morchid-ctx-${origine}`}
      onClick={() => demanderAuMorchid(question, origine)}
      className="inline-flex items-center gap-1.5 rounded-full border border-[#006d37]/30 bg-[#e8f5ee] px-3 py-1.5 text-[12px] font-bold text-[#006d37] transition-colors hover:bg-[#d7efe1] dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300 cursor-pointer"
    >
      <Compass className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}
