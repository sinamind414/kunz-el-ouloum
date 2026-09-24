import { Unit } from '../types';
import { INITIAL_UNITS as CATALOG_UNITS } from '../unitCatalog';

// F2 (bundle) : ce module reste LÉGER — aucune importation de quizCorpus.
// SVT_QUIZ_QUESTIONS / SVT_FLASHCARDS vivent dans ./quizBank (import dynamique).

export const DIAGRAM_QUIZ_URL = "/assets/images/schemas/domaine1_proteines/schema_02_transcription.svg";
export const DIAGRAM_FLASHCARD_URL = "/assets/images/schemas/domaine1_proteines/schema_17_transcription_bubble_modern.svg";
export const MASCOT_URL = "/assets/images/mascot-512.png";

/** Logo officiel de la plateforme كنز العلوم (page d'accueil / splash / favicon). */
export const LOGO_URL = "/logo_site.png";

/** Logo dédié au المرشد الذكي (en-tête + avatars de la conversation). */
export const MORCHID_LOGO_URL = "/logo_morchid.png";

export const INITIAL_UNITS: Unit[] = CATALOG_UNITS;
