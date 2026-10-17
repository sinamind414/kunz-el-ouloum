// backup.ts — emporter sa progression ailleurs (sprint 46).
//
// Tout ce que l'élève produit vit dans le `localStorage` du navigateur :
// unités, progression, flashcards, plan de révision, brouillons de l'atelier,
// session d'épreuve. Autant dire nulle part, dès qu'il :
//   · change de téléphone (fréquent : un appareil partagé dans la fratrie) ;
//   · vide le cache pour « libérer de la place » ;
//   · passe du navigateur à l'application installée (PWA), qui peut ne pas
//     partager le même stockage selon l'installation.
//
// Ce module produit une sauvegarde lisible (JSON versionné) et sait la
// restaurer. Il ne touche à aucune clé étrangère à l'application, et refuse
// une sauvegarde qu'il ne comprend pas plutôt que d'écraser un travail.

export const BACKUP_SCHEMA = 'kunz.backup.v1';

/** Préfixes et clés produits par l'application. */
const PREFIXES = ['kunz.', 'kunz_', 'svt_'];
const CLES_SIMPLES = ['lastStudyTime', 'scheduledReminderTime', 'theme'];

/** Jamais sauvegardés : jetons d'authentification (sécurité). */
const EXCLUS = ['boussole_token', 'boussole_teacher_token'];

export interface Backup {
  schema: string;
  exporteLe: string;
  /** Nombre de clés — permet à l'interface d'annoncer ce qu'elle exporte. */
  nbCles: number;
  donnees: Record<string, string>;
}

export function estCleApplicative(cle: string): boolean {
  if (EXCLUS.includes(cle)) return false;
  return PREFIXES.some((p) => cle.startsWith(p)) || CLES_SIMPLES.includes(cle);
}

function clesDuStockage(): string[] {
  try {
    return Object.keys(localStorage);
  } catch {
    return [];
  }
}

/** Construit la sauvegarde de tout ce qui appartient à l'application. */
export function creerBackup(maintenant = new Date()): Backup {
  const donnees: Record<string, string> = {};
  for (const cle of clesDuStockage().filter(estCleApplicative).sort()) {
    try {
      const valeur = localStorage.getItem(cle);
      if (valeur !== null) donnees[cle] = valeur;
    } catch {
      /* clé illisible : on l'ignore plutôt que d'échouer */
    }
  }
  return {
    schema: BACKUP_SCHEMA,
    exporteLe: maintenant.toISOString(),
    nbCles: Object.keys(donnees).length,
    donnees,
  };
}

/** Sérialise la sauvegarde pour un téléchargement. */
export function serialiserBackup(backup = creerBackup()): string {
  return JSON.stringify(backup, null, 2);
}

/** Nom de fichier proposé : lisible et trié par date. */
export function nomFichierBackup(maintenant = new Date()): string {
  return `kunz-sauvegarde-${maintenant.toISOString().slice(0, 10)}.json`;
}

export interface ResultatRestauration {
  ok: boolean;
  /** Clés réellement écrites. */
  restaurees: number;
  /** Clés ignorées parce qu'elles n'appartiennent pas à l'application. */
  ignorees: string[];
  /** Message d'erreur destiné à l'élève, en arabe. */
  erreurAr?: string;
}

/**
 * Restaure une sauvegarde.
 *
 * Refus explicites plutôt que dégâts silencieux :
 *   · JSON invalide ⇒ refus ;
 *   · schéma inconnu ⇒ refus (une sauvegarde d'une version future pourrait
 *     contenir des formats que ce code interpréterait de travers) ;
 *   · clés étrangères ⇒ ignorées et listées, jamais écrites.
 */
export function restaurerBackup(contenu: string): ResultatRestauration {
  let parsed: unknown;
  try {
    parsed = JSON.parse(contenu);
  } catch {
    return { ok: false, restaurees: 0, ignorees: [], erreurAr: 'الملف غير صالح: تعذّرت قراءته.' };
  }

  const backup = parsed as Partial<Backup>;
  if (!backup || backup.schema !== BACKUP_SCHEMA) {
    return {
      ok: false,
      restaurees: 0,
      ignorees: [],
      erreurAr: 'هذا الملف ليس نسخة احتياطية من هذا التطبيق.',
    };
  }
  if (!backup.donnees || typeof backup.donnees !== 'object') {
    return { ok: false, restaurees: 0, ignorees: [], erreurAr: 'النسخة الاحتياطية فارغة.' };
  }

  const ignorees: string[] = [];
  let restaurees = 0;
  for (const [cle, valeur] of Object.entries(backup.donnees)) {
    if (typeof valeur !== 'string') {
      ignorees.push(cle);
      continue;
    }
    if (!estCleApplicative(cle)) {
      ignorees.push(cle);
      continue;
    }
    try {
      localStorage.setItem(cle, valeur);
      restaurees += 1;
    } catch {
      return {
        ok: false,
        restaurees,
        ignorees,
        erreurAr: 'لم تكتمل الاستعادة: مساحة التخزين ممتلئة.',
      };
    }
  }
  return { ok: true, restaurees, ignorees };
}
