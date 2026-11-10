// PanneauSrs.tsx — LA RÉPÉTITION ESPACÉE RENDUE VISIBLE (audit coach 2026-11-06,
// reco 3 — lot 🔴).

// LE MANQUE AVANT CE PANNEAU. Le SM-2 réel tournait depuis 2026-10
// (`flashcardsSrs.ts`), l'ordre du deck était espacé par `sortByDue`, mais tout
// ce que l'élève voyait était « 3 / 12 » : la position de la carte en main. AUCUN
// écran ne disait « combien de cartes attendent aujourd'hui » ni « quand cette
// carte va-t-elle revenir ». Le rappel de trois questions du Capitaine, lui, est
// COMPLÉMENTAIRE au SRS — pas le SRS. Ce panneau rend le mécanisme à la maison
// (`RevisionView`) lisible.

// CE QU'IL NE FAIT PAS — ET C'EST DÉLIBÉRÉ (cf. `utils/bilanSrs.ts`) :
//   · aucun « pourcentage de rétention » : SM-2 ne produit pas cette mesure,
//     l'inventer serait une statistique fictive (règle m1 du dépôt) ;
//   · aucune note, aucune écriture, aucun `rateCard` : le panneau est une
//     LECTURE pure de l'état persisté, remonté par `lireTousLesEtatsSrs()`
//     (UN parse du stockage, jamais un par carte) ;
//   · aucun décompte d'échéance en chiffres absolus (horloge) — la distance
//     « dans 3 jours » est relative au moment rendu, c'est l'unique quantité
//     honnête que SM-2 a réellement décidée.

// Affiché DANS l'écran révision (`RevisionView`), hors mode focus/lecture :
// c'est là que l'élève vient déjà évaluer ses cartes — le bilan ne dérange
// aucun autre geste, il fait suite à `MicroCapsulePanel` avant le choix
// d'unité.

import { useMemo } from 'react';
import { CalendarClock, CheckCircle2, CircleDashed, Clock3, Repeat } from 'lucide-react';
import type { Flashcard } from '../types';
import {
  formatIntervalLabel,
  lireTousLesEtatsSrs,
} from '../utils/flashcardsSrs';
import {
  bilanSrsDesCartes,
  cartesParProchaineEcheance,
} from '../utils/bilanSrs';

const JOUR_MS = 86_400_000;

/** Troncature d'affichage — n'invente rien, coupe net avec une suspension. */
const tronquer = (question: string, max: number): string =>
  question.length <= max ? question : `${question.slice(0, max).trim()}…`;

interface PanneauSrsProps {
  /** TOUT le deck fourni par l'app (toutes unités ouvertes). */
  cards: Flashcard[];
  /**
   * Unité sélectionnée dans la vue, si l'élève regarde une unité précise —
   * le bilan global reste affiché, celui-ci s'y ajoute sans le remplacer.
   */
  uniteId?: number;
  uniteTitre?: string;
  /**
   * Version du stockage SM-2 : chaque notation dans la vue l'incrémente,
   * ce qui rejoue le `useMemo` sans re-lire le stockage à chaque rendu.
   */
  srsVersion: number;
}

export default function PanneauSrs({ cards, uniteId, uniteTitre, srsVersion }: PanneauSrsProps) {
  /* `srsVersion` est une dépendance DÉLIBÉRÉMENT « inutile » pour la règle
     exhaustive-deps : chaque notation dans la vue l'incrémente, ce qui
     rejoue ces deux memo sans re-lire le stockage à chaque rendu. Sans elle,
     le panneau afficherait un bilan périmé jusqu'au rechargement. */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const etats = useMemo(() => lireTousLesEtatsSrs(), [srsVersion]);
  // L'horloge est lue UNE fois par version de stockage, pas à chaque rendu :
  // un re-render passager ne doit pas déplacer une « échéance d'un jour ».
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const maintenant = useMemo(() => Date.now(), [srsVersion]);

  const global = useMemo(
    () => bilanSrsDesCartes(cards, etats, maintenant),
    [cards, etats, maintenant],
  );

  // Déduplication O(n) par un Set d'identifiants — le deck complet (569 cartes)
  // est calculé à chaque montage de la vue ; un findIndex imbriqué serait
  // O(n²) (~324 000 comparaisons mesurées en principe, inacceptables sur un
  // téléphone bas de gamme). Les identifiants doublonnés sont un état qu'on ne
  // doit PAS payer deux fois : la déduplication protège le bilan du comptage
  // double, elle ne filtre rien d'autre.
  const cartesUniques = useMemo(() => {
    const vus = new Set<string>();
    return cards.filter((c) => {
      if (vus.has(c.id)) return false;
      vus.add(c.id);
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, srsVersion]);

  const uniteChoisie = useMemo(() => {
    if (uniteId === undefined) return null;
    const cartesUnite = cartesUniques.filter((c) => c.unitId === uniteId);
    return {
      titre: uniteTitre ?? '',
      bilan: bilanSrsDesCartes(cartesUnite, etats, maintenant),
    };
  }, [uniteId, uniteTitre, cartesUniques, etats, maintenant]);

  const prochaines = useMemo(
    () => cartesParProchaineEcheance(cartesUniques, etats, maintenant, 3),
    [cartesUniques, etats, maintenant],
  );

  const cellule = (
    valeur: number,
    testid: string,
    label: string,
    Icon: typeof Clock3,
    classesCouleur: string,
  ) => (
    <div
      data-testid={testid}
      className="flex flex-col items-center gap-1 rounded-2xl bg-[#fff9ed] dark:bg-[#1c241f] border border-[#e2dabf]/60 dark:border-[#2ecc71]/10 px-2 py-3 text-center"
    >
      <Icon className={`w-4 h-4 ${classesCouleur}`} />
      <span className={`text-lg font-black leading-none ${classesCouleur}`} data-testid={`${testid}-valeur`}>
        {valeur}
      </span>
      <span className="text-[10px] font-bold text-[#506072] dark:text-gray-300 leading-tight">{label}</span>
    </div>
  );

  const joursRestants = (dueAt: number): string =>
    formatIntervalLabel(Math.max(1, Math.ceil((dueAt - maintenant) / JOUR_MS)));

  return (
    <section
      data-testid="panneau-srs"
      className="bg-[#ffffff] dark:bg-[#141916] border border-[#e2dabf]/60 dark:border-[#2ecc71]/10 p-4 rounded-3xl shadow-sm space-y-3"
      dir="rtl"
    >
      <div className="flex items-center gap-2">
        <Repeat className="w-4 h-4 text-[#006d37] dark:text-[#2ecc71]" />
        <h3 className="text-sm font-black text-[#1f1c0b] dark:text-gray-100">دفتر التكرار المتباعد</h3>
      </div>
      <p className="text-[11px] font-semibold text-[#506072] dark:text-gray-300">
        حالات بطاقاتك التي تسجّلها الخوارزمية — أرقام مقيسة، لا تقديرات.
      </p>

      <div className="grid grid-cols-4 gap-2">
        {cellule(global.echeues, 'srs-echeues', 'مستحقة الآن', Clock3, 'text-[#944a00]')}
        {cellule(global.programmees, 'srs-programmees', 'مجدولة لاحقاً', CalendarClock, 'text-[#006d37] dark:text-[#2ecc71]')}
        {cellule(global.consolidees, 'srs-consolidees', 'خارج البوابة', CheckCircle2, 'text-[#506072] dark:text-gray-300')}
        {cellule(global.jamaisEvaluees, 'srs-jamais', 'لم تُقيَّم بعد', CircleDashed, 'text-[#944a00]')}
      </div>

      {uniteChoisie && (
        <p
          data-testid="srs-unite-bilan"
          className="text-[11px] font-bold text-[#504441] dark:text-gray-200 bg-[#fff9ed] dark:bg-[#1c241f] rounded-xl px-3 py-2 border border-[#e2dabf]/50 dark:border-[#2ecc71]/10"
        >
          {uniteChoisie.titre} :{' '}
          <span className="text-[#944a00]">{uniteChoisie.bilan.echeues}</span> مستحقة الآن ·{' '}
          <span className="text-[#006d37] dark:text-[#2ecc71]">{uniteChoisie.bilan.programmees}</span> مجدولة
        </p>
      )}

      {prochaines.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-[#506072] dark:text-gray-300">أقرب العودة المبرمجة:</p>
          <ul data-testid="srs-prochain-list" className="space-y-1">
            {prochaines.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 text-[11px] font-semibold text-[#504441] dark:text-gray-200 bg-[#fff9ed] dark:bg-[#1c241f] rounded-xl px-3 py-1.5 border border-[#e2dabf]/40 dark:border-[#2ecc71]/10"
              >
                <span className="font-extrabold text-[#006d37] dark:text-[#2ecc71] whitespace-nowrap">
                  {joursRestants(p.dueAt)}
                </span>
                <span className="truncate text-right">{tronquer(p.question, 48)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
