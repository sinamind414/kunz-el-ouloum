// ============================================================
// capitaine.ts — LA VOIX DU GUIDE : une seule source, jamais reformulée.
//
// CE QUE CE MODULE EST. Le personnage qui accompagne l'élève (accueil, parcours,
// entraînements, méthodologie, révisions, Bac) parle depuis ICI. Une seule
// source, pour trois raisons :
//   1. la même phrase ne doit pas exister en trois variantes selon l'écran ;
//   2. le jour où le ton change, il change à UN endroit ;
//   3. les 46 occurrences de « المرشد » dispersées dans 20 fichiers sont
//      exactement ce qu'il ne faut pas reproduire avec un nouveau personnage.
//
// ─────────────────────────────────────────────────────────────────────────────
// DEUX REFUS ARGUMENTÉS, DOCUMENTÉS ICI POUR NE PAS AVOIR À LES REDIRE.
//
// 1) LE NOM « مفتاح » NE PEUT PAS ÊTRE CELUI DU PERSONNAGE.
//    `docs/MARQUE.md` §2 (source unique de la marque, décision owner) pose :
//        « La clé (المفتاح) = La méthode : 4 étapes, 2 portes »
//    et le récit officiel est *كنز العلوم يُفتح بمفتاح المنهجية*.
//    « المفتاح » est donc le nom de LA MÉTHODE ET DU PRODUIT (MIFTAH_NAME_AR,
//    المفتاح+, version 6.0, garde-fou `npm run check:miftah`). Un personnage
//    nommé « القبطان مفتاح » ferait que le guide EST la méthode.
//    De plus « حامل المفتاح » (porteur de clé) et « أمين الكنز » sont DÉJÀ des
//    badges du récit : ces noms sont pris eux aussi.
//    Le guide est celui qui TEND la clé, pas la clé elle-même.
//
// 2) LA CHAÎNE DE LA MÉTHODE N'EST PAS « فعل → دليل → جواب → فحص ».
//    La demande du 14/10/2026 écrivait ces quatre mots. Le document de marque
//    §14 (décision owner du 2026-09-22) verrouille l'inverse :
//        1 فعل 🔍 · 2 دليل 🔑 · 3 علاقة 🔄 · 4 جواب 🔓
//    avec « فحص » explicitement HORS des quatre gestes : « le 5ᵉ geste n'a pas
//    de dent » (option α = ceinture, dans `SELF_CHECKS`). L'option β — faire de
//    فحص une dent — était « réservée » et n'a pas été prise.
//    Supprimer « علاقة » (le lien causal) viderait la taxonomie d'erreurs de
//    son cœur : `unsupported_claim` (« affirmation sans lien causal ») et
//    `premature_interpretation` n'ont plus de sens sans elle.
//    Écrire la chaîne demandée aurait donc cassé la méthode verrouillée ET le
//    garde-fou CI. La chaîne publiée ici est LUE depuis le moteur
//    (`STEP_NAMES_AR`, `SELF_CHECKS`) : elle ne peut pas dériver.
//
// Si l'owner veut malgré tout l'un des deux changements, c'est une décision de
// marque : elle passe par MARQUE.md, pas par ce fichier. Les deux constantes
// concernées sont isolées en tête pour que le coût d'un changement soit visible.
// ─────────────────────────────────────────────────────────────────────────────

import { STEP_NAMES_AR } from './methodologyEngine';
import { SELF_CHECKS } from './boussoleData';

/**
 * NOM AFFICHÉ DU GUIDE — décision de marque, un seul endroit à changer.
 *
 * Retenu : « القبطان » (le capitaine) comme titre narratif — exploration, globe,
 * sciences, exactement l'intention de la demande — et « مُرشد » (le guide) comme
 * fonction, déjà employé partout dans l'application.
 * Écarté : « مفتاح » (voir refus n°1 ci-dessus).
 */

// L'identité (nom + fonction) vit dans un module LÉGER, ré-exporté ici pour que
// les consommateurs existants ne changent pas : `App.tsx` a besoin du nom pour
// son titre d'onglet et ne doit pas payer les 105 Ko du moteur méthodologique.
export { CAPITAINE_FONCTION_AR, CAPITAINE_IDENTITE_AR, CAPITAINE_NOM_AR } from './capitaineIdentite';

/** Les quatre intentions du personnage, telles que redemandées le 14/10/2026. */
export const CAPITAINE_ROLE_AR: readonly string[] = [
  'يستقطب المستكشف بهويّته',
  'يرشده في المسار',
  'يعيده إلى الوثيقة',
  'يشرح خطأه ثم يعيده إلى المحاولة',
];

/**
 * LA CHAÎNE DE LA MÉTHODE — lue depuis le moteur, jamais recopiée.
 *
 * `STEP_NAMES_AR` = فعل · دليل · علاقة · جواب. « فحص » n'est pas un cinquième
 * geste : c'est la ceinture (`SELF_CHECKS`), affichée à part pour que la
 * distinction reste visible dans l'interface et pas seulement dans le code.
 */
export const CHAINE_METHODE_AR: readonly string[] = [
  STEP_NAMES_AR[1],
  STEP_NAMES_AR[2],
  STEP_NAMES_AR[3],
  STEP_NAMES_AR[4],
];

/** La ceinture : quatre vérifications, montrées comme telles (et non comme un geste). */
export const CEINTURE_CHECKS_AR: readonly string[] = SELF_CHECKS;

/** Les quatre noms des gestes, pour vérification d'alignement par les tests. */
export const GESTES_ATTENDUS_AR: readonly string[] = ['فعل', 'دليل', 'علاقة', 'جواب'];

// ─────────────────────────────────────────────────────────────────────────────
// LES SITUATIONS DE PAROLE
// ─────────────────────────────────────────────────────────────────────────────

export type SituationCapitaine =
  | 'accueil'
  | 'avantExercice'
  | 'pendantResolution'
  | 'erreur'
  | 'revision'
  | 'examenEnCours'
  | 'examenTermine'
  | 'reprise';

interface MessageCapitaine {
  /** Phrase du guide, en arabe (langue de travail de l'élève). */
  ar: string;
  /** Ce que le guide ATTEND de l'élève maintenant — jamais un simple slogan. */
  attenduAr: string;
}

/**
 * Messages par situation.
 *
 * Règle de rédaction, tenue volontairement stricte : chaque message dit à
 * l'élève **ce qu'il doit faire maintenant**, jamais « bonne chance » ni
 * « bravo ». Un guide qui félicite sans nommer le geste n'apprend rien.
 */
export const MESSAGES_CAPITAINE: Record<SituationCapitaine, MessageCapitaine> = {
  accueil: {
    ar: 'مرحبًا أيها المستكشف! ابحث أولًا عن الدليل.',
    attenduAr: 'افتح الدرس، وابحث عن الوثيقة قبل أن تبحث عن الجواب.',
  },
  avantExercice: {
    ar: 'ما هو الفعل؟ أين الدليل؟',
    attenduAr: 'اسطّر الفعل في التعليمة، ثم حدّد الوثيقة التي ستستخرج منها.',
  },
  pendantResolution: {
    ar: 'لا تجب من ذاكرتك فقط. ارجع إلى الوثيقة.',
    attenduAr: 'اكتب القيمة مع وحدتها، وسمِّ الوثيقة في بداية جوابك.',
  },
  erreur: {
    ar: 'أخطأت، وهذا جيد. الآن عرفنا أين يجب أن نتدرّب.',
    attenduAr: 'اقرأ نوع الخطأ، ثم أعد كتابة الجملة الأولى فقط.',
  },
  revision: {
    ar: 'استرجع، تحقق، ثم أعد المحاولة.',
    attenduAr: 'أعد الإجابة دون النظر، ثم قارنها بالتصحيح.',
  },
  examenEnCours: {
    // Silence volontaire : la phrase est affichée dans l'épreuve elle-même pour
    // que la disparition du bouton ne passe pas pour une panne.
    ar: 'المرشد صامت أثناء الاختبار. هذا مقصود.',
    attenduAr: 'اكتب وحدك. التحليل يأتي بعد تسليم الورقة.',
  },
  examenTermine: {
    ar: 'انتهت الورقة. الآن نحلّل ما كُتب.',
    attenduAr: 'اقرأ ما هو متمكَّن منه، وما هو هشّ، وما يجب تكراره.',
  },
  reprise: {
    ar: 'نرجع إلى ما تعثّرنا فيه، لا إلى ما نعرفه.',
    attenduAr: 'ابدأ بالمهارة التي تكرّر خطؤها.',
  },
};

/** Ce qu'un profil de travail raconte — forme minimale attendue ici. */
export interface ProfilPourLeGuide {
  /** Code d'erreur dominant (clé de `ERROR_TAXONOMY`), ou null. */
  codeDominant: string | null;
  /** Nom arabe de ce type d'erreur, tel que publié par la taxonomie. */
  nomAr: string | null;
  /** Nombre de fois où il a été repris. */
  occurrences: number;
  /** Ce qu'il faut refaire — la contre-mesure publiée par la taxonomie. */
  contreMesureAr: string | null;
}

/**
 * Message personnalisé : le guide parle du travail RÉEL de l'élève.
 *
 * C'est la différence entre un personnage et un guide : sans profil, il dit la
 * même chose à tout le monde. Avec un profil, il nomme l'erreur récurrente et
 * la contre-mesure publiée par la taxonomie.
 *
 * Renvoie `null` quand il n'y a rien à dire — et c'est important : un guide qui
 * parle pour ne rien dire devient du bruit, et l'élève cesse de le lire.
 */
export function messagePersonnalise(profil: ProfilPourLeGuide | null): string | null {
  if (!profil || !profil.codeDominant || !profil.nomAr || profil.occurrences < 2) return null;
  const reprise = profil.contreMesureAr ? ` ${profil.contreMesureAr}` : '';
  return `ألاحظ أنّك تُكرّر: ${profil.nomAr} (${profil.occurrences} مرات).${reprise}`;
}

/**
 * Message d'une situation, avec personnalisation facultative.
 *
 * La personnalisation ne s'applique qu'à `erreur` et `reprise` : dans les
 * autres situations, le geste attendu prime sur le profil (au début d'un
 * exercice, on ne parle pas des erreurs du mois dernier).
 */
export function messageCapitaine(
  situation: SituationCapitaine,
  profil?: ProfilPourLeGuide | null,
): MessageCapitaine {
  const base = MESSAGES_CAPITAINE[situation];
  if (situation !== 'erreur' && situation !== 'reprise') return base;
  const personnalise = messagePersonnalise(profil ?? null);
  return personnalise ? { ar: personnalise, attenduAr: base.attenduAr } : base;
}

/** Ligne de méthode rappelée par le guide : « فعل → دليل → علاقة → جواب ». */
export function rappelChaineAr(): string {
  return CHAINE_METHODE_AR.join(' → ');
}
