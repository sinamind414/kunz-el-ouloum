// ============================================================
// store.ts — persistance serveur SQLite (better-sqlite3, WAL)
// Remplace les fichiers JSON (students.json + teachers.json) par
// une vraie base relationnelle, SANS changer le contrat HTTP :
//   · mêmes types (Student, ProductionEntry, ActivityEntry, ResetCode)
//   · mêmes réponses (sérialisation identique aux routes actuelles)
//   · UNE transaction par lot de synchronisation (syncBatch)
//   · upsert « si absent » par (student_id, id) — idempotent, comme
//     l'ancien `find(...) && push(...)` du serveur JSON
//   · agrégats enseignant en SQL (un SELECT, plus de O(n×m))
//   · migration automatique de l'ancien students.json / teachers.json
// Auth inchangée : bcrypt (hash) + JWT restent dans server.ts.
// ============================================================
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { calculeActivite } from './activite';

// ── Types du contrat HTTP (miroir de server.ts) ──────────────
export interface Student {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
}

export interface ProductionEntry {
  id: string;
  studentId: string;
  verbId: string;
  theme: string;
  stage: number;
  text: string;
  icm: number;
  criteriaSummary: { label: string; passed: boolean }[];
  errorTags: string[];
  durationSec?: number;
  createdAt: string;
}

export interface ActivityEntry {
  id: string;
  studentId: string;
  type: 'quiz' | 'mission' | 'drill' | 'production';
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface ResetCode {
  code: string;
  studentId: string;
  expiresAt: string;
  used: boolean;
}

/** F6 — sous-clé de progression (LWW par student_id + key). */
export interface ProgressState {
  key: string;
  updatedAt: number;
  value: unknown;
}

export interface Teacher {
  email: string;
  passwordHash: string;
  name: string;
}

export interface DashboardStudentRow {
  id: string;
  name: string;
  email: string;
  productions: number;
  avgIcm: number;
  dominantErrors: { tag: string; count: number }[];
  lastProduction: string | null;
  activities: ActivityEntry[];
  quizCount: number;
  missionCount: number;
  avgQuizPercent: number | null;
  /** Dernière activité TOUT CONFLIT confondu (production ou événement). */
  lastActivity: string | null;
  actif7j: boolean;
  actif30j: boolean;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS students (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  created_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_students_email_lower ON students(LOWER(email));
CREATE TABLE IF NOT EXISTS teachers (
  email         TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_teachers_email_lower ON teachers(LOWER(email));
CREATE TABLE IF NOT EXISTS entries (
  student_id TEXT NOT NULL,
  id         TEXT NOT NULL,
  entry_json TEXT NOT NULL,
  icm        REAL,
  created_at TEXT,
  stage      INTEGER,
  errors_json TEXT,
  PRIMARY KEY (student_id, id)
);
CREATE INDEX IF NOT EXISTS idx_ent_aggregate ON entries(student_id, icm, created_at);
CREATE TABLE IF NOT EXISTS activities (
  student_id   TEXT NOT NULL,
  id           TEXT NOT NULL,
  type         TEXT NOT NULL,
  percent      REAL,
  payload_json TEXT NOT NULL,
  created_at   TEXT NOT NULL,
  PRIMARY KEY (student_id, id)
);
CREATE INDEX IF NOT EXISTS idx_act_aggregate ON activities(student_id, type, percent);
CREATE TABLE IF NOT EXISTS entry_errors (
  student_id TEXT NOT NULL,
  entry_id   TEXT NOT NULL,
  tag        TEXT NOT NULL,
  cnt        INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (student_id, entry_id, tag)
);
CREATE TABLE IF NOT EXISTS reset_codes (
  code       TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used       INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS progress_state (
  student_id TEXT NOT NULL,
  pkey       TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  value_json TEXT NOT NULL,
  PRIMARY KEY (student_id, pkey)
);
`;

/**
 * Comptage FIDÈLE des occurrences de tag dans errorTags : l'ancien serveur
 * JSON faisait `entries.flatMap(e => e.errorTags).reduce(...)` — un tag répété
 * deux fois dans le même errorTags comptait DEUX. La table normalisée garde
 * l'occurrence via un compteur (cnt), incrémenté sur conflit intra-entrée.
 */
const INS_ERR = `INSERT INTO entry_errors (student_id, entry_id, tag, cnt) VALUES (?,?,?,1)
  ON CONFLICT(student_id, entry_id, tag) DO UPDATE SET cnt = cnt + 1`;

/** Valeurs dérivées d'une activité (colonne percent = agrégats sans json_extract). */
function activityCols(ev: ActivityEntry) {
  const payload = (ev.payload || {}) as Record<string, unknown>;
  const pct = typeof payload.percent === 'number' && Number.isFinite(payload.percent) ? payload.percent : null;
  return {
    type: String(ev.type || ''),
    percent: pct,
    payload_json: JSON.stringify(payload),
    created_at: typeof ev.createdAt === 'string' && ev.createdAt ? ev.createdAt : new Date().toISOString(),
  };
}

function entryCols(entry: ProductionEntry) {
  return {
    icm: typeof entry.icm === 'number' && !Number.isNaN(entry.icm) ? entry.icm : null,
    created_at: typeof entry.createdAt === 'string' ? entry.createdAt : '',
    stage: typeof entry.stage === 'number' ? entry.stage : null,
    errors_json: JSON.stringify(entry.errorTags || []),
  };
}

/** Objet activité du contrat (payload reconstruit depuis JSON). */
function mapActivity(r: { id: string; student_id: string; type: string; payload_json: string; created_at: string }): ActivityEntry {
  return { id: r.id, studentId: r.student_id, type: r.type as ActivityEntry['type'], payload: JSON.parse(r.payload_json), createdAt: r.created_at };
}

export class SqliteStore {
  readonly filePath: string;
  private db: Database.Database;

  constructor(filePath: string) {
    this.filePath = filePath;
    if (filePath !== ':memory:') {
      const dir = path.dirname(filePath);
      if (dir && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }
    this.db = new Database(filePath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('busy_timeout = 5000');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('cache_size = -262144');
    this.db.exec(SCHEMA);
    // Migration légère : anciennes bases sans la colonne percent.
    const actCols = this.db.prepare('PRAGMA table_info(activities)').all() as { name: string }[];
    if (!actCols.some(c => c.name === 'percent')) this.db.exec('ALTER TABLE activities ADD COLUMN percent REAL');
  }

  close(): void {
    this.db.close();
  }

  // ── Étudiants ────────────────────────────────────────────
  /** Recherche email insensible à la casse/espaces (comptes hérités mixtes). */
  findStudentByEmail(email: string): Student | undefined {
    const r = this.db.prepare('SELECT * FROM students WHERE LOWER(email) = ?')
      .get((email || '').trim().toLowerCase()) as Record<string, unknown> | undefined;
    return r ? this.mapStudent(r) : undefined;
  }

  findStudentById(id: string): Student | undefined {
    const r = this.db.prepare('SELECT * FROM students WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    return r ? this.mapStudent(r) : undefined;
  }

  createStudent(id: string, email: string, passwordHash: string, name: string): Student {
    const student: Student = { id, email, passwordHash, name, createdAt: new Date().toISOString() };
    this.db.prepare('INSERT INTO students (id, email, password_hash, name, created_at) VALUES (?,?,?,?,?)')
      .run(student.id, student.email, student.passwordHash, student.name, student.createdAt);
    return student;
  }

  updateStudentPassword(id: string, passwordHash: string): void {
    this.db.prepare('UPDATE students SET password_hash = ? WHERE id = ?').run(passwordHash, id);
  }

  private mapStudent(r: Record<string, unknown>): Student {
    return { id: String(r.id), email: String(r.email), passwordHash: String(r.password_hash), name: String(r.name), createdAt: String(r.created_at) };
  }

  countStudents(): number {
    return Number((this.db.prepare('SELECT COUNT(*) AS c FROM students').get() as { c: number }).c);
  }

  // ── Enseignants ──────────────────────────────────────────
  /** Recherche email insensible à la casse/espaces (comptes hérités mixtes). */
  findTeacherByEmail(email: string): Teacher | undefined {
    const r = this.db.prepare('SELECT * FROM teachers WHERE LOWER(email) = ?')
      .get((email || '').trim().toLowerCase()) as Record<string, unknown> | undefined;
    return r ? { email: String(r.email), passwordHash: String(r.password_hash), name: String(r.name) } : undefined;
  }

  createTeacher(email: string, passwordHash: string, name: string): void {
    this.db.prepare('INSERT INTO teachers (email, password_hash, name) VALUES (?,?,?)').run(email, passwordHash, name);
  }

  countTeachers(): number {
    return Number((this.db.prepare('SELECT COUNT(*) AS c FROM teachers').get() as { c: number }).c);
  }

  // ── Productions (entries) ────────────────────────────────
  /** Contrat JSON : n'ajoute que si (studentId, id) absent — idempotent. */
  addEntriesIfNew(studentId: string, entries: ProductionEntry[]): number {
    if (entries.length === 0) return 0;
    const ins = this.db.prepare(`INSERT OR IGNORE INTO entries (student_id, id, entry_json, icm, created_at, stage, errors_json)
      VALUES (?,?,?,?,?,?,?)`);
    const insErr = this.db.prepare(INS_ERR);
    const run = this.db.transaction(() => {
      let n = 0;
      for (const e of entries.slice(0, 100)) {
        if (!e || typeof e !== 'object' || !e.id) continue;
        const c = entryCols(e);
        const res = ins.run(studentId, String(e.id), JSON.stringify(e), c.icm, c.created_at, c.stage, c.errors_json);
        if (res.changes > 0) {
          for (const tag of e.errorTags || []) insErr.run(studentId, String(e.id), String(tag));
          n++;
        }
      }
      return n;
    });
    return run();
  }

  /** Contrat : liste des productions d'un élève, créées récemment d'abord. */
  listEntries(studentId: string): ProductionEntry[] {
    const rows = this.db.prepare('SELECT entry_json FROM entries WHERE student_id = ? ORDER BY created_at DESC').all(studentId) as { entry_json: string }[];
    return rows.map(r => JSON.parse(r.entry_json) as ProductionEntry);
  }

  countEntries(studentId: string): number {
    return Number((this.db.prepare('SELECT COUNT(*) AS c FROM entries WHERE student_id = ?').get(studentId) as { c: number }).c);
  }

  // ── Activités ────────────────────────────────────────────
  /** Contrat sync : n'ajoute que si (studentId, id) absent. */
  addActivitiesIfNew(studentId: string, events: ActivityEntry[]): number {
    if (events.length === 0) return 0;
    const ins = this.db.prepare(`INSERT OR IGNORE INTO activities (student_id, id, type, percent, payload_json, created_at)
      VALUES (?,?,?,?,?,?)`);
    const run = this.db.transaction(() => {
      let n = 0;
      for (const ev of events.slice(0, 100)) {
        if (!ev || typeof ev !== 'object' || !ev.id) continue;
        const c = activityCols(ev);
        const res = ins.run(studentId, String(ev.id), c.type, c.percent, c.payload_json, c.created_at);
        n += res.changes;
      }
      return n;
    });
    return run();
  }

  /** Contrat /api/student/activity : pousse une nouvelle activité (id généré). */
  pushActivity(studentId: string, type: string, payload: Record<string, unknown>, id: string): void {
    const c = activityCols({ id, studentId, type: type as ActivityEntry['type'], payload, createdAt: new Date().toISOString() });
    this.db.prepare('INSERT INTO activities (student_id, id, type, percent, payload_json, created_at) VALUES (?,?,?,?,?,?)')
      .run(studentId, id, c.type, c.percent, c.payload_json, c.created_at);
  }

  listActivities(studentId: string): ActivityEntry[] {
    const rows = this.db.prepare('SELECT id, student_id, type, payload_json, created_at FROM activities WHERE student_id = ? ORDER BY created_at DESC').all(studentId) as {
      id: string; student_id: string; type: string; payload_json: string; created_at: string;
    }[];
    return rows.map(mapActivity);
  }

  countActivities(studentId: string): number {
    return Number((this.db.prepare('SELECT COUNT(*) AS c FROM activities WHERE student_id = ?').get(studentId) as { c: number }).c);
  }

  // ── Progression F6 (progress_v1) ──────────────────────────
  /** Merge LWW : n'écrit que si updatedAt strictement plus grand. */
  mergeProgressState(studentId: string, states: ProgressState[]): number {
    if (!states || states.length === 0) return 0;
    const ins = this.db.prepare(
      `INSERT INTO progress_state (student_id, pkey, updated_at, value_json)
       VALUES (?,?,?,?)
       ON CONFLICT(student_id, pkey) DO UPDATE SET
         updated_at = excluded.updated_at,
         value_json = excluded.value_json
       WHERE excluded.updated_at > progress_state.updated_at`,
    );
    const run = this.db.transaction(() => {
      let n = 0;
      for (const s of states.slice(0, 8)) {
        if (!s || typeof s.key !== 'string' || !s.key) continue;
        if (typeof s.updatedAt !== 'number' || !Number.isFinite(s.updatedAt)) continue;
        let json: string;
        try {
          json = JSON.stringify(s.value ?? null);
        } catch {
          continue;
        }
        if (json.length > 250_000) continue; // garde-fou par sous-clé
        const res = ins.run(studentId, s.key, Math.trunc(s.updatedAt), json);
        n += res.changes;
      }
      return n;
    });
    return run();
  }

  getProgressState(studentId: string): ProgressState[] {
    const rows = this.db
      .prepare('SELECT pkey, updated_at, value_json FROM progress_state WHERE student_id = ? ORDER BY pkey')
      .all(studentId) as { pkey: string; updated_at: number; value_json: string }[];
    const out: ProgressState[] = [];
    for (const r of rows) {
      try {
        out.push({ key: r.pkey, updatedAt: Number(r.updated_at), value: JSON.parse(r.value_json) });
      } catch {
        // ligne corrompue : ignorée (ne casse pas le pull)
      }
    }
    return out;
  }

  // ── Codes de réinitialisation ────────────────────────────
  createResetCode(studentId: string, code: string, expiresAt: string): void {
    const run = this.db.transaction(() => {
      this.db.prepare('DELETE FROM reset_codes WHERE student_id = ?').run(studentId);
      this.db.prepare('INSERT INTO reset_codes (code, student_id, expires_at, used) VALUES (?,?,?,0)').run(code, studentId, expiresAt);
    });
    run();
  }

  findUsableResetCode(code: string): ResetCode | undefined {
    const r = this.db.prepare('SELECT * FROM reset_codes WHERE code = ? AND used = 0').get(code) as Record<string, unknown> | undefined;
    return r ? { code: String(r.code), studentId: String(r.student_id), expiresAt: String(r.expires_at), used: false } : undefined;
  }

  markResetUsed(code: string): void {
    this.db.prepare('UPDATE reset_codes SET used = 1 WHERE code = ?').run(code);
  }

  // ── Import de masse (migration, probes 300k) ─────────────
  /** Importe un jeu complet en UNE transaction (INSERT OR IGNORE → idempotent). */
  bulkImport(data: {
    students: Student[];
    entries: ProductionEntry[];
    activities: ActivityEntry[];
    teachers?: Teacher[];
    resetCodes?: ResetCode[];
  }): { students: number; entries: number; activities: number; teachers: number; resets: number } {
    const insS = this.db.prepare('INSERT OR IGNORE INTO students (id, email, password_hash, name, created_at) VALUES (?,?,?,?,?)');
    const insE = this.db.prepare(`INSERT OR IGNORE INTO entries (student_id, id, entry_json, icm, created_at, stage, errors_json)
      VALUES (?,?,?,?,?,?,?)`);
    const insErr = this.db.prepare(INS_ERR);
    const insA = this.db.prepare('INSERT OR IGNORE INTO activities (student_id, id, type, percent, payload_json, created_at) VALUES (?,?,?,?,?,?)');
    const insT = this.db.prepare('INSERT OR IGNORE INTO teachers (email, password_hash, name) VALUES (?,?,?)');
    const insR = this.db.prepare('INSERT OR IGNORE INTO reset_codes (code, student_id, expires_at, used) VALUES (?,?,?,0)');
    const run = this.db.transaction(() => {
      for (const s of data.students) insS.run(s.id, s.email, s.passwordHash, s.name, s.createdAt);
      for (const e of data.entries) {
        const c = entryCols(e);
        const res = insE.run(e.studentId, String(e.id), JSON.stringify(e), c.icm, c.created_at, c.stage, c.errors_json);
        if (res.changes > 0) for (const tag of e.errorTags || []) insErr.run(e.studentId, String(e.id), String(tag));
      }
      for (const a of data.activities) {
        const c = activityCols(a);
        insA.run(a.studentId, String(a.id), c.type, c.percent, c.payload_json, c.created_at);
      }
      for (const t of data.teachers || []) insT.run(t.email, t.passwordHash, t.name);
      for (const r of data.resetCodes || []) insR.run(r.code, r.studentId, r.expiresAt);
    });
    run();
    return {
      students: data.students.length,
      entries: data.entries.length,
      activities: data.activities.length,
      teachers: (data.teachers || []).length,
      resets: (data.resetCodes || []).length,
    };
  }

  // ── Tableau de bord enseignant (agrégats SQL — plus de O(n×m)) ──
  /**
   * Contrat strict du dashboard : id, name, email, productions, avgIcm,
   * dominantErrors (top 5), lastProduction, activities, quizCount,
   * missionCount, avgQuizPercent — identique au serveur JSON.
   */
  dashboardRows(maintenant: number = Date.now()): DashboardStudentRow[] {
    // UNE passe par table (GROUP BY) — plus de 7 sous-requêtes corrélées × n élèves.
    const stats = this.db.prepare(`
      SELECT s.id, s.name, s.email,
        COALESCE(e.productions, 0) AS productions,
        COALESCE(e.avg_icm, 0) AS avg_icm,
        e.last_production,
        COALESCE(a.quiz_count, 0) AS quiz_count,
        COALESCE(a.mission_count, 0) AS mission_count,
        a.avg_quiz_percent
      FROM students s
      LEFT JOIN (
        SELECT student_id, COUNT(*) AS productions, AVG(icm) AS avg_icm, MAX(created_at) AS last_production
        FROM entries GROUP BY student_id
      ) e ON e.student_id = s.id
      LEFT JOIN (
        SELECT student_id,
          SUM(CASE WHEN type = 'quiz' THEN 1 ELSE 0 END) AS quiz_count,
          SUM(CASE WHEN type = 'mission' THEN 1 ELSE 0 END) AS mission_count,
          AVG(CASE WHEN type = 'quiz' THEN CAST(json_extract(payload_json, '$.percent') AS REAL) END) AS avg_quiz_percent
        FROM activities GROUP BY student_id
      ) a ON a.student_id = s.id`).all() as {
      id: string; name: string; email: string; productions: number; avg_icm: number;
      last_production: string | null; quiz_count: number; mission_count: number; avg_quiz_percent: number | null;
    }[];

    // Erreurs dominantes (top 5) par élève — table normalisée, index-only.
    // SUM(cnt) = comptage d'occurrences fidèle à l'ancien flatMap/reduce.
    // MIN(rowid) = première occurrence (ordre d'insertion) → à égalité de
    // compte, l'ordre est IDENTIQUE à l'ancien Object.entries + sort stable.
    const errRows = this.db.prepare(`
      SELECT student_id AS sid, tag, SUM(cnt) AS c, MIN(rowid) AS first
      FROM entry_errors GROUP BY student_id, tag`).all() as { sid: string; tag: string; c: number; first: number }[];
    const errorsByStudent = new Map<string, { tag: string; count: number; first: number }[]>();
    for (const r of errRows) {
      const arr = errorsByStudent.get(r.sid) || [];
      arr.push({ tag: r.tag, count: Number(r.c), first: Number(r.first) });
      errorsByStudent.set(r.sid, arr);
    }

    // Activités complètes par élève (contrat). Le tri global par created_at
    // coûtait un B-tree de 900k lignes à chaque appel : on trie par student_id
    // (chemin PK, pas de sort SQL) puis par created_at en JS (≤ qq items/élève).
    const actRows = this.db.prepare(
      'SELECT id, student_id, type, payload_json, created_at FROM activities ORDER BY student_id',
    ).all() as { id: string; student_id: string; type: string; payload_json: string; created_at: string }[];
    const actsByStudent = new Map<string, ActivityEntry[]>();
    for (const r of actRows) {
      const arr = actsByStudent.get(r.student_id) || [];
      arr.push(mapActivity(r));
      actsByStudent.set(r.student_id, arr);
    }
    for (const arr of actsByStudent.values()) arr.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));

    return stats.map(s => {
      const acts = actsByStudent.get(s.id) || [];
      // acts triées created_at DESC → la plus récente est en tête.
      const act = calculeActivite([s.last_production || null, acts[0]?.createdAt ?? null], maintenant);
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        productions: Number(s.productions),
        avgIcm: Math.round(Number(s.avg_icm)),
        dominantErrors: (errorsByStudent.get(s.id) || [])
          .sort((a, b) => b.count - a.count || a.first - b.first)
          .slice(0, 5)
          .map(({ tag, count }) => ({ tag, count })),
        lastProduction: s.last_production || null,
        activities: acts,
        quizCount: Number(s.quiz_count),
        missionCount: Number(s.mission_count),
        avgQuizPercent: s.avg_quiz_percent != null ? Math.round(Number(s.avg_quiz_percent)) : null,
        lastActivity: act.lastActivity,
        actif7j: act.actif7j,
        actif30j: act.actif30j,
      };
    });
  }

  /** Itérateur du CSV global — streaming, jamais tout chargé en RAM.
   * Deux itérateurs triés par student_id fusionnés par positions :
   * zéro sous-requête par élève. CONTRAT : la colonne « last_production »
   * contient la date de RÉELLE dernière production (MAX created_at des
   * entries) — cohérente avec le dashboard (l'ancien comportement =
   * date d'inscription contredisait l'interface, audit 2026-09-22). */
  *iterateExportRows(studentId?: string, maintenant: number = Date.now()): IterableIterator<{ id: string; name: string; email: string; productions: number; avgIcm: number; lastProduction: string; topErrors: string; lastActivity: string | null; actif7j: boolean; actif30j: boolean }> {
    const stmt = this.db.prepare(`
      SELECT s.id, s.name, s.email, s.created_at,
        COALESCE(e.productions, 0) AS productions,
        COALESCE(e.avg_icm, 0) AS avg_icm,
        e.last_entry
      FROM students s
      LEFT JOIN (
        SELECT student_id, COUNT(*) AS productions, AVG(icm) AS avg_icm, MAX(created_at) AS last_entry
        FROM entries GROUP BY student_id
      ) e ON e.student_id = s.id
      ${studentId ? 'WHERE s.id = ?' : ''}
      ORDER BY s.id`);
    const errStmt = this.db.prepare(`
      SELECT student_id AS sid, tag, SUM(cnt) AS c
      FROM entry_errors GROUP BY student_id, tag ORDER BY student_id, c DESC, MIN(rowid)`);
    const statsIt = (studentId ? stmt.iterate(studentId) : stmt.iterate()) as IterableIterator<{
      id: string; name: string; email: string; created_at: string; productions: number; avg_icm: number; last_entry: string | null;
    }>;
    // Agrégat « dernier événement » par élève : #élèves lignes → Map en RAM OK.
    const lastAct = new Map(
      (this.db.prepare('SELECT student_id AS sid, MAX(created_at) AS last FROM activities GROUP BY student_id').all() as { sid: string; last: string }[])
        .map((r) => [r.sid, r.last]),
    );
    const errIt = errStmt.iterate() as IterableIterator<{ sid: string; tag: string; c: number }>;
    let curErr = errIt.next();
    for (const r of statsIt) {
      const errs: { tag: string; count: number }[] = [];
      while (!curErr.done && curErr.value.sid === r.id) {
        errs.push({ tag: curErr.value.tag, count: Number(curErr.value.c) });
        curErr = errIt.next();
      }
      const act = calculeActivite([r.last_entry || null, lastAct.get(r.id) || null], maintenant);
      yield {
        id: r.id,
        name: r.name,
        email: r.email,
        productions: Number(r.productions),
        avgIcm: Math.round(Number(r.avg_icm)),
        lastProduction: r.last_entry || "",
        topErrors: errs.slice(0, 5).map(e => `${e.tag}:${e.count}`).join('; '),
        lastActivity: act.lastActivity,
        actif7j: act.actif7j,
        actif30j: act.actif30j,
      };
    }
  }
}

// ── Migration depuis l'ancien JSON (students.json / teachers.json) ──
/** Migre les fichiers JSON v1 du serveur vers SQLite (idempotent). */
export function migrateFromJsonFiles(studentsJson: string, teachersJson: string, dbPath: string): { students: number; entries: number; activities: number; teachers: number } {
  const store = new SqliteStore(dbPath);
  const hasData = store.countStudents() > 0 || store.countTeachers() > 0;
  let students = 0; let entries = 0; let activities = 0; let teachers = 0;
  if (!hasData) {
    if (fs.existsSync(studentsJson)) {
      const db = JSON.parse(fs.readFileSync(studentsJson, 'utf-8')) as {
        students?: Student[]; entries?: ProductionEntry[]; activities?: ActivityEntry[]; resetCodes?: ResetCode[];
      };
      for (const s of db.students || []) {
        store.createStudent(s.id, s.email, s.passwordHash, s.name);
        students++;
      }
      for (const e of db.entries || []) {
        store.addEntriesIfNew(e.studentId, [e]);
        entries++;
      }
      for (const a of db.activities || []) {
        store.addActivitiesIfNew(a.studentId, [a]);
        activities++;
      }
      for (const c of db.resetCodes || []) {
        store.createResetCode(c.studentId, c.code, c.expiresAt);
      }
    }
    if (fs.existsSync(teachersJson)) {
      const ts = JSON.parse(fs.readFileSync(teachersJson, 'utf-8')) as Teacher[];
      for (const t of ts || []) {
        if (t?.email) { store.createTeacher(t.email, t.passwordHash, t.name || ''); teachers++; }
      }
    }
  }
  store.close();
  return { students, entries, activities, teachers };
}

/** Ouvre le store : SQLite avec migration auto des fichiers JSON hérités. */
export function openStore(configured?: string): SqliteStore {
  const dbFile = configured && !configured.endsWith('.json') ? configured : path.join(process.cwd(), 'data', 'students.db');
  const studentsJson = configured && configured.endsWith('.json') ? configured : path.join(process.cwd(), 'data', 'students.json');
  const teachersJson = path.join(path.dirname(studentsJson), 'teachers.json');
  const store = new SqliteStore(dbFile);
  if ((fs.existsSync(studentsJson) || fs.existsSync(teachersJson)) && store.countStudents() === 0 && store.countTeachers() === 0) {
    const res = migrateFromJsonFiles(studentsJson, teachersJson, dbFile);
    if (res.students || res.entries || res.activities || res.teachers) {
      console.log(`[store] JSON migré vers SQLite : ${res.students} élèves · ${res.entries} productions · ${res.activities} activités · ${res.teachers} enseignants`);
    }
  }
  return store;
}
