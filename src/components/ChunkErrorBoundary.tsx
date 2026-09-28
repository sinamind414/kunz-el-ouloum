// ChunkErrorBoundary.tsx — filet pour les vues chargées à la demande
// (sprint 33).
//
// Depuis le découpage en imports dynamiques (sprints 30-32), ouvrir un onglet
// déclenche un téléchargement. Hors ligne — ou sur une 3G qui coupe — cet
// import échoue, et React laisse alors l'écran VIDE : l'élève voit une page
// blanche sans explication, et croit l'application cassée.
//
// Cette frontière d'erreur transforme l'échec en message actionnable, en
// arabe, avec un bouton pour réessayer. Elle ne masque rien d'autre : les
// erreurs qui ne viennent pas d'un chargement de module sont réaffichées avec
// leur message, pour ne pas devenir un cache-misère silencieux.

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Remonte l'erreur (journalisation, tests). */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  erreur: Error | null;
}

/** Reconnaît l'échec d'un `import()` — message dépendant du navigateur. */
export function estEchecDeChargement(error: Error): boolean {
  const texte = `${error.name} ${error.message}`.toLowerCase();
  return (
    texte.includes('dynamically imported module') ||
    texte.includes('failed to fetch') ||
    texte.includes('importing a module script failed') ||
    texte.includes('chunkloaderror') ||
    texte.includes('loading chunk')
  );
}

export default class ChunkErrorBoundary extends Component<Props, State> {
  state: State = { erreur: null };

  static getDerivedStateFromError(erreur: Error): State {
    return { erreur };
  }

  componentDidCatch(erreur: Error, info: ErrorInfo) {
    this.props.onError?.(erreur, info);
  }

  private reessayer = () => {
    this.setState({ erreur: null });
  };

  render() {
    const { erreur } = this.state;
    if (!erreur) return this.props.children;

    const horsLigne = estEchecDeChargement(erreur);
    return (
      <div
        dir="rtl"
        data-testid={horsLigne ? 'chunk-erreur-reseau' : 'chunk-erreur-autre'}
        className="mx-auto my-10 max-w-md rounded-3xl p-5 text-center bg-white dark:bg-[#141916] border border-[#bbcbbb]/40"
      >
        <p className="text-sm font-black text-[#1f1c0b] dark:text-gray-100 mb-1">
          {horsLigne ? 'تعذّر تحميل هذا القسم' : 'حدث خطأ غير متوقّع'}
        </p>
        <p className="text-[12px] leading-6 text-[#506072] dark:text-gray-400 mb-3">
          {horsLigne
            ? 'يبدو أنك غير متصل بالإنترنت، و هذا القسم لم يُحفَّظ بعد على جهازك. تحقّق من الاتصال ثم أعد المحاولة — الأقسام التي فتحتها من قبل تبقى متاحة دون اتصال.'
            : erreur.message}
        </p>
        <button
          data-testid="chunk-reessayer"
          onClick={this.reessayer}
          className="text-xs font-bold px-4 py-2 rounded-2xl bg-[#006d37] text-white cursor-pointer"
        >
          أعد المحاولة
        </button>
      </div>
    );
  }
}
