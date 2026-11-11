// TrainingHubView.tsx — porte unique « التمارين والتدريب » (dette UI, sprint 13).
//
// Remplace cinq entrées de menu par une seule. Chaque carte annonce le GESTE
// travaillé (« أحلّل سنداً », « أرسم وأقيّم »…) plutôt que le nom de l'outil :
// l'élève choisit ce qu'il veut exercer, pas une marque interne.
//
// REBASÉ SUR master 70b69ec (2026-11-04) — LOTS 2 ET 3.
// Le lot 1 de master est une VARIANTE : le bloc « consigne d'entrée » y était
// placé APRÈS la grille de 7 cartes. Ce rebasage le remet AVANT la grille et
// place le rappel AVANT la consigne, pour restaurer la séquence pédagogique
// « Rappel 3 min → UN geste BAC → auto-correction ». C'est un DÉPLACEMENT de
// bloc : aucune décision, aucun calcul, aucun test du lot 1 n'est modifié.
//
// Lot 2 : échauffement OPTIONNEL de 3 questions tirées par le Capitaine
// (`tirageRappelTrois`), corpus reçu via peekCorpus()/loadCorpus(), zéro import
// statique du corpus, zéro SRS ici, CTA = le MÊME onOpen(tab) que les cartes.
// Lot 3 : chaque question porte le TITRE FACTUEL de son unité
// (`PARCOURS_DOMAINS`) pour que la cause déclarée par l'élève soit
// enregistrée AVEC son thème dans le دفتر. Le hub ne décide toujours rien.

import { useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Dumbbell, FileText, Key, Lock, PenTool, PlayCircle, Search, Sparkles, Swords } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { TRAINING_ENTRIES, type TrainingTab } from '../data/trainingHub';
import { CAPITAINE_IDENTITE_AR } from '../data/capitaineIdentite';
import { consigneEntreeTraining, tirageRappelTrois, type QuestionRappel, type SignalRappel } from '../lib/invitationCapitaine';
import { etatEleveSiChargee } from '../lib/etatEleveRuntime';
import { loadParcours, unitesCompletes } from '../lib/parcours/parcoursProgress';
import { PARCOURS_DOMAINS } from '../lib/parcours/parcoursPath';
import { loadCorpus, peekCorpus, type Corpus } from '../data/corpusLoader';
import { sortByDue } from '../utils/flashcardsSrs';
import { jourLocal } from '../utils/dayKey';
import RappelTroisQuestions from './RappelTroisQuestions';
import SelecteurChapitre from './SelecteurChapitre';

interface TrainingHubViewProps {
  onOpen: (tab: TrainingTab) => void;
  onBackToHome?: () => void;
  /** Injectable pour les tests / rendu hors ligne : corpus déjà chargé. En
   *  production, `peekCorpus()` suffit — App.tsx l'a préchargé au repos. */
  corpusRappel?: Corpus | null;
}

const ICONS: Record<string, LucideIcon> = {
  search: Search,
  penTool: PenTool,
  sparkles: Sparkles,
  swords: Swords,
  playCircle: PlayCircle,
  calendar: CalendarDays,
  fileText: FileText,
  key: Key,
};

/** Une carte `fc_q_<id>` due renvoie l'id du QCM dont elle est dérivée. */
const ID_CARTE_DERIVEE = /^fc_q_(\d+)$/;

/** Titre FACTUEL de l'unité — déjà la source du parcours, aucune donnée neuve. */
const TITRES_UNITES: ReadonlyMap<number, string> = new Map(
  PARCOURS_DOMAINS.flatMap((d) => d.units.map((u) => [u.unitId, u.title] as const)),
);

export default function TrainingHubView({ onOpen, onBackToHome, corpusRappel }: TrainingHubViewProps) {
  // Phase 2 (GO 2026-10-16) : le cadenas lit la progression RÉELLE du
  // parcours — une unité complète = toutes ses leçons + son جسر.
  const unites = unitesCompletes(loadParcours());
  // Projection dérivée : l'état unique a été assemblé et déposé UNE fois par le
  // Capitaine (`useInvitationCapitaine` → `fournirEtatEleve`). Le hub ne relit
  // aucun stockage de plus, ne décide de rien, n'invente rien : `null` = silence.
  const etat = etatEleveSiChargee();
  const consigne = consigneEntreeTraining(etat, unites);
  const carteGeste = consigne
    ? TRAINING_ENTRIES.find((e) => e.tab === consigne.tab)
    : undefined;

  // Le corpus est CHARGÉ À LA DEMANDE, au clic sur l'échauffement : aucun
  // import dynamique pour l'élève qui va droit au geste BAC. `loadCorpus()`
  // possède déjà un cache de module partagé avec App.tsx (sprint 31).
  const [corpus, setCorpus] = useState<Corpus | null>(() =>
    corpusRappel !== undefined ? corpusRappel : peekCorpus(),
  );

  const demarrerRappel = (): void => {
    if (corpusRappel !== undefined || corpus !== null) return;
    void loadCorpus()
      .then(setCorpus)
      .catch(() => {
        /* hors ligne : le panneau le dit, la consigne reste disponible */
      });
  };

  // Tirage du Capitaine : catalogue reçu en entrée (jamais importé dans le
  // bundle d'entrée), cartes DUES en lecture seule, unité faible, rotation
  // stable du jour. `useMemo` évite de reparser l'état SM-2 à chaque rendu.
  const questionsRappel: QuestionRappel[] = useMemo(() => {
    const catalogue: QuestionRappel[] = (corpus?.questions ?? [])
      .filter((q) => !q.kind || q.kind === 'qcm')
      .map((q) => ({
        id: q.id,
        uniteId: q.unitId,
        questionAr: q.questionText,
        optionsAr: q.options,
        correctIndex: q.correctAnswerIndex,
        explicationAr: q.explanation ?? '',
        // Lot 3 : le thème suit la question jusqu'au دفتر, si l'élève déclare.
        themeAr: TITRES_UNITES.get(q.unitId),
      }));
    const idsDues = sortByDue([...(corpus?.flashcards ?? [])])
      .map((c) => ID_CARTE_DERIVEE.exec(c.id))
      .filter((m): m is RegExpExecArray => m !== null)
      .map((m) => Number(m[1]));
    const signal: SignalRappel = {
      idsDues,
      unitePrioritaire: etat?.competence.unitePrioritaire ?? etat?.competence.faibles[0] ?? null,
      jour: jourLocal(),
    };
    return tirageRappelTrois(catalogue, signal);
  }, [corpus, etat]);
  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto" dir="rtl" data-testid="training-hub">
      {/* RTL : le conteneur est en dir="rtl", donc `flex-row` place le PREMIER
          enfant à droite (début de lecture). Un `flex-row-reverse` ici produirait
          exactement une disposition LTR — c'était le bug du 2026-10-03 :
          titre + icône à gauche dans une app arabe. */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-gradient-to-l from-[#006d37] to-emerald-600 flex items-center justify-center shadow-md">
            <Dumbbell className="w-6 h-6 text-white" />
          </span>
          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-black text-[#1f1c0b] dark:text-gray-100">التمارين والتدريب</h1>
            <p className="text-sm text-[#506072] dark:text-gray-400">اختر الحركة التي تريد تمرينها اليوم</p>
          </div>
        </div>
        {onBackToHome && (
          <button
            data-testid="hub-retour"
            onClick={onBackToHome}
            className="flex flex-row-reverse items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f3f4f5] dark:bg-[#1f2622] border border-[#bbcbbb]/30 text-sm font-bold text-[#006d37] dark:text-[#2ecc71] cursor-pointer"
          >
            <span>العودة</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2026-11-11 (demande du propriétaire) : les 3 chapitres sont posés
          dans la ZONE DE CONTENU de la rubrique (comme dans le Cours et la
          Révision) — l'élève entre par le chapitre, puis choisit son
          exercice. */}
      <SelecteurChapitre titre="اختر الفصل" />

      {/* LOT 2 — Rappel 3 min, AVANT la consigne (Rappel → UN geste BAC).
          Optionnel : aucune porte obligatoire, la consigne et la grille restent
          visibles. Le CTA final réutilise le MÊME `onOpen(tab)` que la carte. */}
      <RappelTroisQuestions
        questions={questionsRappel}
        onDemarrer={demarrerRappel}
        corpusPret={corpus !== null}
        onOuvrirGeste={consigne ? () => onOpen(consigne.tab) : null}
        libelleGesteAr={carteGeste?.titleAr}
      />

      {/* UNE prescription, pas un second bandeau : aucun visage, aucune image
          — le personnage EN GRAND reste UNIQUE (règle « une seule voix » de
          BandeauConseilRubrique). Le nom du guide est signé, pas redessiné.
          Le texte est décidé par
          SON module ; il n'existe que si l'état est chargé et hors épreuve.
          Dès la 1ʳᵉ visite il NOMME le module : le bandeau d'accueil, lui, ne
          donne que le principe. */}
      {consigne && (
        <div
          data-testid="consigne-entree-capitaine"
          dir="rtl"
          className="mb-4 rounded-2xl border border-[#006d37]/25 bg-[#f8fbfa] px-4 py-3 dark:border-emerald-400/25 dark:bg-[#121614]"
        >
          <p className="text-[10px] font-black tracking-wide text-[#006d37]/80 dark:text-emerald-400/80">
            {CAPITAINE_IDENTITE_AR} — ابدأ من هنا
          </p>
          <p
            data-testid="consigne-entree-geste"
            className="mt-1 text-[13px] font-bold leading-relaxed text-[#1f2b24] dark:text-gray-100"
          >
            {consigne.gesteAr}
          </p>
          <p
            data-testid="consigne-entree-pourquoi"
            className="mt-1 text-[11.5px] leading-relaxed text-[#506072] dark:text-gray-400"
          >
            لماذا: {consigne.pourquoiAr} — {consigne.dureeMin} دقائق، تمرين واحد، والتصحيح جزء منه.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TRAINING_ENTRIES.map((e) => {
          const Icon = ICONS[e.icon] ?? Dumbbell;
          // Cadenas Phase 2 : la carte n'ouvre rien tant que la progression
          // réelle ne l'a pas méritée. Étiquette avec la CONDITION, jamais
          // silencieuse (un cadenas muet n'est qu'un bug déguisé).
          const requis = e.deverrouApresUnites;
          const verrouille = requis != null && unites < requis;
          return (
            <button
              key={e.tab}
              data-testid={`hub-${e.tab}`}
              onClick={verrouille ? undefined : () => onOpen(e.tab)}
              aria-disabled={verrouille || undefined}
              className={`text-right bg-white dark:bg-[#141916] rounded-3xl p-5 border shadow-sm transition-all ${
                verrouille
                  ? 'border-[#bbcbbb]/30 dark:border-[#2ecc71]/10 opacity-70 cursor-not-allowed'
                  : 'border-[#bbcbbb]/30 dark:border-[#2ecc71]/10 hover:shadow-md hover:border-[#006d37]/40 cursor-pointer'
              }`}
            >
              {/* dir="rtl" + flex-row → icône à DROITE du texte, comme dans le
                  menu latéral. `row-reverse` mettait l'icône à gauche. */}
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-10 h-10 rounded-2xl bg-[#e8f5ee] dark:bg-black/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#006d37] dark:text-[#2ecc71]" />
                </span>
                <div className="flex-1">
                  <h2 className="text-base font-black text-[#1f1c0b] dark:text-gray-100 mb-1">{e.titleAr}</h2>
                  <p className="text-[13px] leading-6 text-[#506072] dark:text-gray-400 mb-2">{e.descriptionAr}</p>
                  {verrouille ? (
                    <span
                      data-testid={`verrou-${e.tab}`}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#fff9ed] dark:bg-black/20 text-[#8a6a00] dark:text-[#d9a400]"
                    >
                      <Lock className="w-3 h-3" />
                      تُفْتَح بعد إتمام {requis} {requis === 1 ? 'وحدة' : requis === 2 ? 'وحدتين' : `وحدات (${requis})`} — وحدة = دروسها والجسر كاملة
                    </span>
                  ) : (
                    <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#fff9ed] dark:bg-black/20 text-[#8a6a00] dark:text-[#d9a400]">
                      {e.gestureAr}
                      {/* UN SEUL badge, sur la SEULE carte désignée par le Capitaine.
                          Ce n'est pas une voix de plus : c'est la projection de sa
                          décision. Jamais sur une carte verrouillée (la règle ne peut
                          désigner que situations / workshop / examens). */}
                      {consigne?.tab === e.tab && !verrouille && (
                        <span
                          data-testid="recommande-aujourdhui"
                          className="inline-block mx-2 text-[11px] font-black px-2.5 py-1 rounded-lg bg-[#e8f5ee] text-[#006d37] dark:bg-emerald-400/10 dark:text-emerald-300"
                        >
                          موصى به اليوم
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
}
