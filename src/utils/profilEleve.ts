// profilEleve.ts — LE PROFIL ÉLÈVE MINIMAL (audit coach 2026-11-06, reco 1,
// GO propriétaire en session : panneau dans Calculs/حسابي, aucun App.tsx).
//
// CE QUE L'AUDIT DEMANDAIT : « profil minimal : filière (SVT/EXP), date Bac
// officielle ou "je ne sais pas", objectif de note » — Axe 3.A « le diagnostic
// ne couvre pas le profil élève / objectif d'examen ». Trois décisions du
// propriétaire fixent ce que ce module EST et n'est PAS :
//
//   1. FILIÈRE = UN CONSTAT, PAS UN RÉGLAGE. L'application est déjà
//      mono-filière : « شعبة العلوم التجريبية — علوم الطبيعة والحياة » porte
//      tout le corpus (guideManhajia, tutorKnowledge, baremeCorrecteur).
//      Proposer un sélecteur de filière inventerait un multi-filière qui
//      n'existe pas. La filière est donc AFFICHÉE, jamais demandée.
//
//   2. DATE BAC = JAMAIS TRANCHÉE PAR L'ÉLÈVE. R5 (tranche précédente, règle
//      signée) : seule une décision du propriétaire, appuyée sur un arrêté
//      officiel daté, fait passer `BAC_EXAM_DATE_IS_PROVISIONAL` à false.
//      Le profil AFFICHE le décompte avec son étiquette ; il ne collecte
//      aucune date et ne « confirme » rien. « Je ne sais pas » n'est pas
//      un champ : c'est l'état réel que l'étiquette assume déjà.
//
//   3. OBJECTIF DE NOTE = AFFICHAGE LOCAL, RIEN DE PLUS. L'élève (3AS
//      Algérien) choisit sa cible sur l'échelle réelle /20 — le barème du BAC
//      est un fait, pas une invention. Le coach ne lit JAMAIS cette cible :
//      aucun couplage moteur (arbitrage du propriétaire). Tant que le
//      capitaine ne l'utilise pas, un test de verrou interdit de brancher
//      cet objectif dans la décision.
//
// OÙ VIT CETTE MÉMOIRE : dans le téléphone, nulle part ailleurs — même
// politique que `profilErreurs` (promotion publiée « en mode invité, rien ne
// quitte ton téléphone »). Un `localStorage`, aucune requête réseau.

const CLE = 'boussole_profil_eleve';

/**
 * La filière est un CONSTAT — l'app ne sert que cette filière, c'est son
 * corpus entier qui le dit. Constante affichée telle quelle (فصحى).
 */
export const FILIERE_PROFIL_AR = 'شعبة العلوم التجريبية — علوم الطبيعة والحياة';

/** L'échelle réelle du BAC algérien : sur 20. Affichée, jamais déduite. */
export const OBJECTIF_NOTE_SUR = 20;

/** Les cibles proposées — plateaux usuels de l'échelle /20. */
export const OBJECTIFS_NOTE_PROPOSES = [10, 12, 14, 16, 18, 20] as const;

/** Ce que le profil retient — minimal, local, lisible. */
export interface ProfilEleve {
  /** Cible choisie par l'élève sur /20, ou `null` = pas encore choisie. */
  objectifNote: number | null;
  /** Dernière écriture du profil (ms). 0 = jamais écrit. */
  majMs: number;
}

/** Le profil neutre : rien n'est encore dit — « pas encore », jamais « faux ». */
export const PROFIL_ELEVE_VIDE: ProfilEleve = { objectifNote: null, majMs: 0 };

/** Clé de stockage, exposée en lecture seule pour les verrous. */
export const CLE_PROFIL_ELEVE = CLE;

/** Lecture pure du stockage local — absente ou corrompue → profil vide. */
export function lireProfilEleve(): ProfilEleve {
  try {
    const brut = localStorage.getItem(CLE);
    if (!brut) return { ...PROFIL_ELEVE_VIDE };
    const parse = JSON.parse(brut) as Partial<ProfilEleve>;
    if (
      typeof parse !== 'object' ||
      parse === null ||
      (parse.objectifNote !== null && typeof parse.objectifNote !== 'number')
    ) {
      return { ...PROFIL_ELEVE_VIDE };
    }
    return {
      objectifNote: parse.objectifNote ?? null,
      majMs: typeof parse.majMs === 'number' ? parse.majMs : 0,
    };
  } catch {
    return { ...PROFIL_ELEVE_VIDE };
  }
}

/**
 * Enregistre la cible choisie — LOCAL uniquement (aucun réseau : politique §3).
 * Une cible hors de l'échelle /20 est refusée silencieusement : l'app ne
 * fabrique pas de cible qu'elle ne reconnaîtrait pas.
 */
export function enregistrerObjectifNote(note: number | null, maintenant: Date = new Date()): void {
  if (typeof note !== 'number' || !Number.isFinite(note) || note < 0 || note > OBJECTIF_NOTE_SUR) {
    return;
  }
  try {
    const profil: ProfilEleve = { objectifNote: note, majMs: maintenant.getTime() };
    localStorage.setItem(CLE, JSON.stringify(profil));
  } catch {
    /* ignore — le stockage peut être plein, le profil n'est jamais vital */
  }
}

/** Efface le profil (bouton « repartir de zéro »). */
export function effacerProfilEleve(): void {
  try {
    localStorage.removeItem(CLE);
  } catch {
    /* ignore */
  }
}
