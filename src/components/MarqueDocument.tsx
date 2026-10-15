// MarqueDocument.tsx — pied de page de traçabilité, VISIBLE À L'IMPRESSION SEULEMENT.
//
// Pourquoi seulement à l'impression : à l'écran, la marque n'apporte rien à
// l'élève et encombre une interface déjà dense. C'est le document qui sort de
// l'application (papier, PDF via « Imprimer ») qui circule entre les mains, et
// c'est donc là qu'elle doit apparaître.
//
// `print:block hidden` : Tailwind masque à l'écran, affiche en `@media print`.
// Le composant lit l'identité au moment du rendu — pas de prop à faire
// circuler dans six vues, donc pas d'oubli possible sur une vue et pas d'erreur
// silencieuse le jour où une nouvelle vue imprimable est ajoutée.

import { identiteCourante } from '../utils/activityLog';
import { ligneMarque } from '../utils/marque';

interface Props {
  /** Texte complémentaire optionnel (titre du document imprimé). */
  document?: string;
}

export default function MarqueDocument({ document }: Props) {
  const ligne = ligneMarque(identiteCourante());
  return (
    <div
      data-testid="marque-document"
      dir="rtl"
      className="hidden print:block mt-4 pt-2 border-t border-black/20 text-[9px] leading-relaxed text-black/60"
    >
      {document ? <span className="font-bold">{document} · </span> : null}
      <span>{ligne}</span>
    </div>
  );
}
