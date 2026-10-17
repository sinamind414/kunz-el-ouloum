// store.degraded.ts — démarrer même quand SQLite est indisponible
// (sprint 58).
//
// Constat : `npm run dev` échoue avec une trace Node de quarante lignes si le
// binaire natif de `better-sqlite3` n'est pas compilé — ce qui arrive sur
// toute machine sans chaîne de compilation (et dans un environnement installé
// avec `--ignore-scripts`). Or le cœur de l'application — les leçons, le
// corpus BAC, l'atelier, le plan — est **100 % local au navigateur** et
// n'utilise pas le store. Refuser de démarrer pour une fonctionnalité annexe
// (comptes élèves et tableau de bord enseignant) revient à priver l'élève de
// tout pour protéger l'accessoire.
//
// Ce store de repli implémente le même contrat, sans rien persister :
// lectures vides, écritures refusées. Le serveur démarre, l'application
// fonctionne, et les routes de comptes répondent 503 avec un message clair au
// lieu de planter.

export class DegradedStore {
  /** Marqueur lu par le serveur pour signaler le mode dégradé. */
  readonly degraded = true;
  readonly filePath = '(aucun — mode dégradé)';
  readonly raison: string;

  constructor(raison: string) {
    this.raison = raison;
  }

  private refuse(): never {
    const err = new Error(
      'التخزين غير متوفّر على هذا الخادم (mode dégradé) : ' +
        'الحسابات و لوحة المتابعة معطّلة، أما التطبيق فيعمل كاملاً على الجهاز.',
    ) as Error & { statusCode?: number };
    err.statusCode = 503;
    throw err;
  }

  // ── Lectures : vides, jamais d'exception ──────────────────────────
  countStudents(): number {
    return 0;
  }

  countTeachers(): number {
    return 0;
  }

  countEntries(): number {
    return 0;
  }

  countActivities(): number {
    return 0;
  }

  findStudentByEmail(): undefined {
    return undefined;
  }

  findStudentById(): undefined {
    return undefined;
  }

  findTeacherByEmail(): undefined {
    return undefined;
  }

  findUsableResetCode(): undefined {
    return undefined;
  }

  listEntries(): [] {
    return [];
  }

  listActivities(): [] {
    return [];
  }

  dashboardRows(): [] {
    return [];
  }

  close(): void {
    /* rien à fermer */
  }

  /** Export CSV : flux vide plutôt qu'une erreur au milieu d'un téléchargement. */
  async *iterateExportRows(): AsyncGenerator<never> {
    /* aucun enregistrement à exporter en mode dégradé */
  }

  // ── Écritures : refus explicite, jamais silencieux ────────────────
  createStudent(): never {
    return this.refuse();
  }

  createTeacher(): never {
    return this.refuse();
  }

  updateStudentPassword(): never {
    return this.refuse();
  }

  createResetCode(): never {
    return this.refuse();
  }

  markResetUsed(): never {
    return this.refuse();
  }

  addEntriesIfNew(): never {
    return this.refuse();
  }

  addActivitiesIfNew(): never {
    return this.refuse();
  }

  pushActivity(): never {
    return this.refuse();
  }

  bulkImport(): never {
    return this.refuse();
  }
}

/**
 * Ouvre le store demandé ; en cas d'échec d'initialisation (binaire natif
 * absent, disque en lecture seule…), renvoie un store dégradé plutôt que de
 * laisser l'exception tuer le serveur.
 */
export function openStoreOrDegrade<T>(
  ouvrir: () => T,
  journal: (message: string) => void = console.warn,
): T | DegradedStore {
  try {
    return ouvrir();
  } catch (e) {
    const raison = e instanceof Error ? e.message : String(e);
    journal(
      '[store] DÉMARRAGE EN MODE DÉGRADÉ — ' +
        raison.split('\n')[0] +
        '\n[store] Les comptes élèves et le tableau de bord enseignant sont désactivés.' +
        "\n[store] L'application (leçons, BAC, atelier, plan) fonctionne normalement : elle est locale au navigateur." +
        '\n[store] Pour réactiver : installer les dépendances natives (npm rebuild better-sqlite3) ou définir DATABASE_URL.',
    );
    return new DegradedStore(raison);
  }
}
