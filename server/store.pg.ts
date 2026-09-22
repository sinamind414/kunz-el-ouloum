// ============================================================
// store.pg.ts — persistance serveur PostgreSQL (node-pg, pool)
// MÊME contrat que server/store.ts (SQLite) : mêmes types, mêmes
// réponses, mêmes sémantiques (occurences de tags, ordre à
// égalité = première occurrence, col. CSV « last_production » =
// réelle dernière production, idempotence par (student_id, id)).
// Sélection au démarrage : DATABASE_URL définit → PostgreSQL,
// sinon SQLite (zéro service externe). Parité testée.
//
// Différences d'implémentation (mêmes résultats) :
//   · écritures par lots : INSERT … unnest(…) ON CONFLICT DO NOTHING
//     RETURNING → seules les NOUVELLES lignes vont dans entry_errors
//   · entry_errors.ord bigserial = ordre de première occurrence
//     (équivaut rowid SQLite — tri à égalité identique)
//   · CSV en pages keyset (s.id > $1) avec agrégats LATERAL par élève
//     (jamais de re-agrégation globale par page)
// ============================================================
import { Pool, PoolClient } from 'pg';
import fs from 'node:fs';
import type { Student, ProductionEntry, ActivityEntry, ResetCode, Teacher, DashboardStudentRow } from './store';
import { calculeActivite } from './activite';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS students (
  id            text PRIMARY KEY,
  email         text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name          text NOT NULL,
  created_at    timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_students_email_lower ON students (LOWER(email));
CREATE TABLE IF NOT EXISTS teachers (
  email         text PRIMARY KEY,
  password_hash text NOT NULL,
  name          text NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_teachers_email_lower ON teachers (LOWER(email));
CREATE TABLE IF NOT EXISTS entries (
  student_id  text NOT NULL,
  id          text NOT NULL,
  entry_json  jsonb NOT NULL,
  icm         double precision,
  created_at  timestamptz,
  stage       integer,
  errors_json jsonb,
  PRIMARY KEY (student_id, id)
);
CREATE INDEX IF NOT EXISTS idx_ent_aggregate ON entries(student_id, icm, created_at);
CREATE TABLE IF NOT EXISTS activities (
  student_id   text NOT NULL,
  id           text NOT NULL,
  type         text NOT NULL,
  percent      double precision,
  payload_json jsonb NOT NULL,
  created_at   timestamptz NOT NULL,
  PRIMARY KEY (student_id, id)
);
CREATE INDEX IF NOT EXISTS idx_act_aggregate ON activities(student_id, type, percent);
CREATE TABLE IF NOT EXISTS entry_errors (
  student_id text NOT NULL,
  entry_id   text NOT NULL,
  tag        text NOT NULL,
  cnt        integer NOT NULL DEFAULT 1,
  ord        bigserial,
  PRIMARY KEY (student_id, entry_id, tag)
);
CREATE INDEX IF NOT EXISTS idx_err_agg ON entry_errors(student_id, tag);
CREATE TABLE IF NOT EXISTS reset_codes (
  code       text PRIMARY KEY,
  student_id text NOT NULL,
  expires_at timestamptz NOT NULL,
  used       boolean NOT NULL DEFAULT false
);
`;

/** Mappe un JSONB renvoyé par pg (objet) ou une chaîne (parité SQLite). */
function fromJson<T>(v: unknown): T {
  return (typeof v === 'string' ? JSON.parse(v) : v) as T;
}

/** ISO string depuis un timestamptz pg (Date). */
function iso(v: unknown): string {
  return v instanceof Date ? v.toISOString() : String(v ?? '');
}

/** Comptage d'occurrences par tag dans un errorTags (doublons comptés). */
function tagCounts(tags: string[]): { tag: string; k: number }[] {
  const m = new Map<string, number>();
  for (const t of tags || []) m.set(String(t), (m.get(String(t)) || 0) + 1);
  return [...m.entries()].map(([tag, k]) => ({ tag, k }));
}

/** index (studentId|entryId) → errorTags, depuis les entrées en mémoire. */
function tagMapOf(entries: ProductionEntry[]): Map<string, string[]> {
  const m = new Map<string, string[]>();
  for (const e of entries) if (e?.id) m.set(`${e.studentId}|${e.id}`, e.errorTags || []);
  return m;
}

export class PostgresStore {
  private pool: Pool;
  private ready: Promise<void>;

  constructor(databaseUrl: string, poolMax = 10) {
    this.pool = new Pool({ connectionString: databaseUrl, max: poolMax });
    this.ready = this.init();
  }

  private async init(): Promise<void> {
    await this.pool.query(SCHEMA);
  }

  async ensureReady(): Promise<void> {
    await this.ready;
  }

  close(): void {
    this.pool.end().catch(() => undefined);
  }

  // ── Étudiants ────────────────────────────────────────────
  /** Recherche email insensible à la casse/espaces (comptes hérités mixtes). */
  async findStudentByEmail(email: string): Promise<Student | undefined> {
    const r = await this.pool.query(
      'SELECT * FROM students WHERE LOWER(email) = $1', [(email || '').trim().toLowerCase()],
    );
    return r.rows[0] ? this.mapStudent(r.rows[0]) : undefined;
  }

  async findStudentById(id: string): Promise<Student | undefined> {
    const r = await this.pool.query('SELECT * FROM students WHERE id = $1', [id]);
    return r.rows[0] ? this.mapStudent(r.rows[0]) : undefined;
  }

  async createStudent(id: string, email: string, passwordHash: string, name: string): Promise<Student> {
    const r = await this.pool.query(
      'INSERT INTO students (id, email, password_hash, name, created_at) VALUES ($1,$2,$3,$4, now()) RETURNING *',
      [id, email, passwordHash, name],
    );
    return this.mapStudent(r.rows[0]);
  }

  async updateStudentPassword(id: string, passwordHash: string): Promise<void> {
    await this.pool.query('UPDATE students SET password_hash = $1 WHERE id = $2', [passwordHash, id]);
  }

  async countStudents(): Promise<number> {
    const r = await this.pool.query('SELECT COUNT(*)::int AS c FROM students');
    return Number(r.rows[0].c);
  }

  private mapStudent(r: Record<string, unknown>): Student {
    return { id: String(r.id), email: String(r.email), passwordHash: String(r.password_hash), name: String(r.name), createdAt: iso(r.created_at) };
  }

  // ── Enseignants ──────────────────────────────────────────
  /** Recherche email insensible à la casse/espaces (comptes hérités mixtes). */
  async findTeacherByEmail(email: string): Promise<Teacher | undefined> {
    const r = await this.pool.query('SELECT * FROM teachers WHERE LOWER(email) = $1', [(email || '').trim().toLowerCase()]);
    return r.rows[0] ? { email: String(r.rows[0].email), passwordHash: String(r.rows[0].password_hash), name: String(r.rows[0].name) } : undefined;
  }

  async createTeacher(email: string, passwordHash: string, name: string): Promise<void> {
    await this.pool.query('INSERT INTO teachers (email, password_hash, name) VALUES ($1,$2,$3)', [email, passwordHash, name]);
  }

  async countTeachers(): Promise<number> {
    const r = await this.pool.query('SELECT COUNT(*)::int AS c FROM teachers');
    return Number(r.rows[0].c);
  }

  // ── Productions (entries) ────────────────────────────────
  /** Idempotent : INSERT … ON CONFLICT DO NOTHING RETURNING → n = nouvelles. */
  async addEntriesIfNew(studentId: string, entries: ProductionEntry[]): Promise<number> {
    if (entries.length === 0) return 0;
    const list = entries.slice(0, 100).filter((e) => e && typeof e === 'object' && e.id);
    if (list.length === 0) return 0;
    const ids: string[] = [], jsons: unknown[] = [], icms: (number | null)[] = [],
      createds: (string | null)[] = [], stages: (number | null)[] = [], errors: unknown[] = [];
    for (const e of list) {
      ids.push(String(e.id));
      jsons.push(JSON.stringify(e));
      icms.push(typeof e.icm === 'number' && !Number.isNaN(e.icm) ? e.icm : null);
      createds.push(typeof e.createdAt === 'string' ? e.createdAt : null);
      stages.push(typeof e.stage === 'number' ? e.stage : null);
      errors.push(JSON.stringify(e.errorTags || []));
    }
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const ins = await client.query(
        `INSERT INTO entries (student_id, id, entry_json, icm, created_at, stage, errors_json)
         SELECT * FROM unnest($1::text[], $2::text[], $3::jsonb[], $4::float8[], $5::timestamptz[], $6::int[], $7::jsonb[])
         ON CONFLICT (student_id, id) DO NOTHING
         RETURNING student_id, id`,
        [Array(list.length).fill(studentId), ids, jsons, icms, createds, stages, errors],
      );
      // Les entries du sync n'ont PAS de studentId (le serveur l'assigne) :
      // la map doit être construite avec le studentId du paramètre.
      const tmap = new Map<string, string[]>();
      for (const e of list) if (e?.id) tmap.set(`${studentId}|${e.id}`, e.errorTags || []);
      await this.insertEntryErrors(client, ins.rows as { student_id: string; id: string }[], tmap);
      await client.query('COMMIT');
      return ins.rowCount ?? 0;
    } catch (e) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw e;
    } finally {
      client.release();
    }
  }

  /** entry_errors : uniquement pour les entrées RÉELLEMENT insérées (idempotence).
   * Tags fournis depuis l'entrée en mémoire (zéro relecture). */
  private async insertEntryErrors(
    client: PoolClient,
    rows: { student_id: string; id: string }[],
    tagsByEntry: Map<string, string[]>,
  ): Promise<void> {
    if (rows.length === 0) return;
    const sids: string[] = [], eids: string[] = [], tags: string[] = [], cnts: number[] = [];
    for (const r of rows) {
      const t = tagsByEntry.get(`${r.student_id}|${r.id}`) || [];
      for (const { tag, k } of tagCounts(t)) { sids.push(r.student_id); eids.push(r.id); tags.push(tag); cnts.push(k); }
    }
    if (sids.length === 0) return;
    await client.query(
      `INSERT INTO entry_errors (student_id, entry_id, tag, cnt)
       SELECT * FROM unnest($1::text[], $2::text[], $3::text[], $4::int[])
       ON CONFLICT (student_id, entry_id, tag) DO UPDATE SET cnt = entry_errors.cnt + EXCLUDED.cnt`,
      [sids, eids, tags, cnts],
    );
  }

  /** Contrat : liste des productions d'un élève, récentes d'abord. */
  async listEntries(studentId: string): Promise<ProductionEntry[]> {
    const r = await this.pool.query('SELECT entry_json FROM entries WHERE student_id = $1 ORDER BY created_at DESC', [studentId]);
    return r.rows.map((row) => fromJson<ProductionEntry>(row.entry_json));
  }

  async countEntries(studentId: string): Promise<number> {
    const r = await this.pool.query('SELECT COUNT(*)::int AS c FROM entries WHERE student_id = $1', [studentId]);
    return Number(r.rows[0].c);
  }

  // ── Activités ────────────────────────────────────────────
  async addActivitiesIfNew(studentId: string, events: ActivityEntry[]): Promise<number> {
    if (events.length === 0) return 0;
    const list = events.slice(0, 100).filter((ev) => ev && typeof ev === 'object' && ev.id);
    if (list.length === 0) return 0;
    const ids: string[] = [], types: string[] = [], percents: (number | null)[] = [],
      payloads: unknown[] = [], createds: string[] = [];
    for (const ev of list) {
      const payload = (ev.payload || {}) as Record<string, unknown>;
      ids.push(String(ev.id));
      types.push(String(ev.type || ''));
      percents.push(typeof payload.percent === 'number' && Number.isFinite(payload.percent) ? payload.percent : null);
      payloads.push(JSON.stringify(payload));
      createds.push(typeof ev.createdAt === 'string' && ev.createdAt ? ev.createdAt : new Date().toISOString());
    }
    const r = await this.pool.query(
      `INSERT INTO activities (student_id, id, type, percent, payload_json, created_at)
       SELECT * FROM unnest($1::text[], $2::text[], $3::text[], $4::float8[], $5::jsonb[], $6::timestamptz[])
       ON CONFLICT (student_id, id) DO NOTHING`,
      [Array(list.length).fill(studentId), ids, types, percents, payloads, createds],
    );
    return r.rowCount ?? 0;
  }

  async pushActivity(studentId: string, type: string, payload: Record<string, unknown>, id: string): Promise<void> {
    const pct = typeof payload?.percent === 'number' && Number.isFinite(payload.percent) ? payload.percent : null;
    await this.pool.query(
      'INSERT INTO activities (student_id, id, type, percent, payload_json, created_at) VALUES ($1,$2,$3,$4,$5, now())',
      [studentId, id, type, pct, JSON.stringify(payload || {})],
    );
  }

  async listActivities(studentId: string): Promise<ActivityEntry[]> {
    const r = await this.pool.query(
      'SELECT id, student_id, type, payload_json, created_at FROM activities WHERE student_id = $1 ORDER BY created_at DESC',
      [studentId],
    );
    return r.rows.map(mapActivityRow);
  }

  async countActivities(studentId: string): Promise<number> {
    const r = await this.pool.query('SELECT COUNT(*)::int AS c FROM activities WHERE student_id = $1', [studentId]);
    return Number(r.rows[0].c);
  }

  // ── Codes de réinitialisation ────────────────────────────
  async createResetCode(studentId: string, code: string, expiresAt: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM reset_codes WHERE student_id = $1', [studentId]);
      await client.query('INSERT INTO reset_codes (code, student_id, expires_at, used) VALUES ($1,$2,$3,false)', [code, studentId, expiresAt]);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw e;
    } finally {
      client.release();
    }
  }

  async findUsableResetCode(code: string): Promise<ResetCode | undefined> {
    const r = await this.pool.query('SELECT * FROM reset_codes WHERE code = $1 AND used = false', [code]);
    if (!r.rows[0]) return undefined;
    return { code: String(r.rows[0].code), studentId: String(r.rows[0].student_id), expiresAt: iso(r.rows[0].expires_at), used: false };
  }

  async markResetUsed(code: string): Promise<void> {
    await this.pool.query('UPDATE reset_codes SET used = true WHERE code = $1', [code]);
  }

  // ── Import de masse (migration, probes 300k) ─────────────
  async bulkImport(data: {
    students: Student[];
    entries: ProductionEntry[];
    activities: ActivityEntry[];
    teachers?: Teacher[];
    resetCodes?: ResetCode[];
  }): Promise<{ students: number; entries: number; activities: number; teachers: number; resets: number }> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      if (data.students.length) {
        await client.query(
          `INSERT INTO students (id, email, password_hash, name, created_at)
           SELECT * FROM unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::timestamptz[])
           ON CONFLICT (id) DO NOTHING`,
          [data.students.map(s => s.id), data.students.map(s => s.email), data.students.map(s => s.passwordHash), data.students.map(s => s.name), data.students.map(s => s.createdAt)],
        );
      }
      if (data.entries.length) {
        const ids: string[] = [], jsons: unknown[] = [], icms: (number | null)[] = [], createds: (string | null)[] = [], stages: (number | null)[] = [], errors: unknown[] = [];
        const sids: string[] = [];
        for (const e of data.entries) {
          const c = e as ProductionEntry;
          sids.push(String(c.studentId)); ids.push(String(c.id)); jsons.push(JSON.stringify(c));
          icms.push(typeof c.icm === 'number' && !Number.isNaN(c.icm) ? c.icm : null);
          createds.push(typeof c.createdAt === 'string' ? c.createdAt : null);
          stages.push(typeof c.stage === 'number' ? c.stage : null);
          errors.push(JSON.stringify(c.errorTags || []));
        }
        const ins = await client.query(
          `INSERT INTO entries (student_id, id, entry_json, icm, created_at, stage, errors_json)
           SELECT * FROM unnest($1::text[], $2::text[], $3::jsonb[], $4::float8[], $5::timestamptz[], $6::int[], $7::jsonb[])
           ON CONFLICT (student_id, id) DO NOTHING RETURNING student_id, id`,
          [sids, ids, jsons, icms, createds, stages, errors],
        );
        await this.insertEntryErrors(client, ins.rows as { student_id: string; id: string }[], tagMapOf(data.entries));
      }
      if (data.activities.length) {
        const sids: string[] = [], ids: string[] = [], types: string[] = [], percents: (number | null)[] = [], payloads: unknown[] = [], createds: string[] = [];
        for (const a of data.activities) {
          const payload = (a.payload || {}) as Record<string, unknown>;
          sids.push(String(a.studentId)); ids.push(String(a.id)); types.push(String(a.type || ''));
          percents.push(typeof payload.percent === 'number' && Number.isFinite(payload.percent) ? payload.percent : null);
          payloads.push(JSON.stringify(payload));
          createds.push(typeof a.createdAt === 'string' && a.createdAt ? a.createdAt : new Date().toISOString());
        }
        await client.query(
          `INSERT INTO activities (student_id, id, type, percent, payload_json, created_at)
           SELECT * FROM unnest($1::text[], $2::text[], $3::text[], $4::float8[], $5::jsonb[], $6::timestamptz[])
           ON CONFLICT (student_id, id) DO NOTHING`,
          [sids, ids, types, percents, payloads, createds],
        );
      }
      for (const t of data.teachers || []) {
        await client.query('INSERT INTO teachers (email, password_hash, name) VALUES ($1,$2,$3) ON CONFLICT (email) DO NOTHING', [t.email, t.passwordHash, t.name]);
      }
      for (const r of data.resetCodes || []) {
        await client.query('INSERT INTO reset_codes (code, student_id, expires_at, used) VALUES ($1,$2,$3,false) ON CONFLICT (code) DO NOTHING', [r.code, r.studentId, r.expiresAt]);
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw e;
    } finally {
      client.release();
    }
    return {
      students: data.students.length,
      entries: data.entries.length,
      activities: data.activities.length,
      teachers: (data.teachers || []).length,
      resets: (data.resetCodes || []).length,
    };
  }

  // ── Tableau de bord enseignant ──────────────────────────
  /** Même contrat que SqliteStore.dashboardRows() (mêmes agrégats). */
  async dashboardRows(maintenant: number = Date.now()): Promise<DashboardStudentRow[]> {
    const stats = await this.pool.query(`
      SELECT s.id, s.name, s.email,
        COALESCE(e.productions, 0)::int AS productions,
        COALESCE(e.avg_icm, 0) AS avg_icm,
        e.last_production,
        COALESCE(a.quiz_count, 0)::int AS quiz_count,
        COALESCE(a.mission_count, 0)::int AS mission_count,
        a.avg_quiz_percent
      FROM students s
      LEFT JOIN (
        SELECT student_id, COUNT(*)::int AS productions, AVG(icm) AS avg_icm, MAX(created_at) AS last_production
        FROM entries GROUP BY student_id
      ) e ON e.student_id = s.id
      LEFT JOIN (
        SELECT student_id,
          COUNT(*) FILTER (WHERE type = 'quiz')::int AS quiz_count,
          COUNT(*) FILTER (WHERE type = 'mission')::int AS mission_count,
          AVG(percent) FILTER (WHERE type = 'quiz') AS avg_quiz_percent
        FROM activities GROUP BY student_id
      ) a ON a.student_id = s.id`);
    const errRows = await this.pool.query(`
      SELECT student_id AS sid, tag, SUM(cnt)::bigint AS c, MIN(ord) AS first
      FROM entry_errors GROUP BY student_id, tag`);
    const actRows = await this.pool.query(
      'SELECT id, student_id, type, payload_json, created_at FROM activities ORDER BY student_id',
    );
    return assembleDashboard(stats.rows, errRows.rows, actRows.rows, maintenant);
  }

  /** Itérateur CSV — pages keyset (s.id ASC) + agrégats LATERAL par élève. */
  async *iterateExportRows(studentId?: string, maintenant: number = Date.now()): AsyncIterableIterator<{ id: string; name: string; email: string; productions: number; avgIcm: number; lastProduction: string; topErrors: string; lastActivity: string | null; actif7j: boolean; actif30j: boolean }> {
    const PAGE = 2000;
    let after: string | null = null;
    for (;;) {
      const params: unknown[] = [];
      let where = '';
      if (studentId) { params.push(studentId); where = 'WHERE s.id = $1'; }
      else if (after !== null) { params.push(after); where = 'WHERE s.id > $1'; }
      const sql = `SELECT s.id, s.name, s.email, s.created_at,
          COALESCE(e.productions, 0) AS productions, COALESCE(e.avg_icm, 0) AS avg_icm,
          e.last_entry, a2.last_act
        FROM students s
        LEFT JOIN LATERAL (
          SELECT COUNT(*)::int AS productions, AVG(icm) AS avg_icm, MAX(en.created_at) AS last_entry
          FROM entries en WHERE en.student_id = s.id
        ) e ON true
        LEFT JOIN LATERAL (
          SELECT MAX(ac.created_at) AS last_act
          FROM activities ac WHERE ac.student_id = s.id
        ) a2 ON true
        ${where}
        ORDER BY s.id
        ${studentId ? '' : `LIMIT ${PAGE}`}`;
      const r = await this.pool.query(sql, params);
      if (r.rows.length === 0) break;
      const ids = r.rows.map((x: { id: string }) => String(x.id));
      const errR = await this.pool.query(
        `SELECT student_id AS sid, tag, SUM(cnt)::bigint AS c
         FROM entry_errors WHERE student_id = ANY($1::text[])
         GROUP BY student_id, tag
         ORDER BY student_id, SUM(cnt) DESC, MIN(ord)`,
        [ids],
      );
      const bySid = new Map<string, string[]>();
      for (const er of errR.rows) {
        const sid = String(er.sid);
        const arr = bySid.get(sid) || [];
        arr.push(`${er.tag}:${Number(er.c)}`);
        bySid.set(sid, arr);
      }
      for (const row of r.rows) {
        const sid = String(row.id);
        const act = calculeActivite(
          [row.last_entry ? iso(row.last_entry) : null, row.last_act ? iso(row.last_act) : null],
          maintenant,
        );
        yield {
          id: sid,
          name: String(row.name),
          email: String(row.email),
          productions: Number(row.productions),
          avgIcm: Math.round(Number(row.avg_icm)),
          lastProduction: row.last_entry ? iso(row.last_entry) : '',
          topErrors: (bySid.get(sid) || []).slice(0, 5).join('; '),
          lastActivity: act.lastActivity,
          actif7j: act.actif7j,
          actif30j: act.actif30j,
        };
      }
      if (studentId || r.rows.length < PAGE) break;
      after = String(r.rows[r.rows.length - 1].id);
    }
  }
}

/** Ouvre le backend ; migre les JSON hérités (v1) si la base PG est vide. */
export async function migrateJsonFilesToPostgres(
  store: PostgresStore,
  studentsJson: string,
  teachersJson: string,
): Promise<boolean> {
  try {
    const hasData = (await store.countStudents()) > 0 || (await store.countTeachers()) > 0;
    if (hasData || !fs.existsSync(studentsJson)) return false;
    const raw = JSON.parse(fs.readFileSync(studentsJson, 'utf-8')) as {
      students?: Student[]; entries?: ProductionEntry[]; activities?: ActivityEntry[]; resetCodes?: ResetCode[];
    };
    let teachers: Teacher[] = [];
    if (fs.existsSync(teachersJson)) {
      try { teachers = JSON.parse(fs.readFileSync(teachersJson, 'utf-8')) as Teacher[]; } catch { teachers = []; }
    }
    await store.bulkImport({
      students: (raw.students || []).map((s) => ({ id: s.id, email: s.email, passwordHash: s.passwordHash, name: s.name, createdAt: s.createdAt || new Date().toISOString() })),
      entries: raw.entries || [],
      activities: raw.activities || [],
      teachers: teachers.filter((t) => t?.email),
      resetCodes: raw.resetCodes || [],
    });
    return true;
  } catch (e) {
    console.error('[store.pg] migration JSON → PostgreSQL ignorée :', e instanceof Error ? e.message : e);
    return false;
  }
}

/** Objet activité du contrat (payload reconstruit). */
function mapActivityRow(r: { id: string; student_id: string; type: string; payload_json: unknown; created_at: unknown }): ActivityEntry {
  return { id: String(r.id), studentId: String(r.student_id), type: String(r.type) as ActivityEntry['type'], payload: fromJson<Record<string, unknown>>(r.payload_json), createdAt: iso(r.created_at) };
}

/** Fusion finale — même logique que SqliteStore (fidélité à égalité). */
export function assembleDashboard(
  statsRows: Record<string, unknown>[],
  errRows: { sid: string; tag: string; c: unknown; first: unknown }[],
  actRows: Record<string, unknown>[],
  maintenant: number = Date.now(),
): DashboardStudentRow[] {
  const errorsByStudent = new Map<string, { tag: string; count: number; first: number }[]>();
  for (const r of errRows) {
    const sid = String(r.sid);
    const arr = errorsByStudent.get(sid) || [];
    arr.push({ tag: String(r.tag), count: Number(r.c), first: Number(r.first) });
    errorsByStudent.set(sid, arr);
  }
  const actsByStudent = new Map<string, ActivityEntry[]>();
  for (const r of actRows) {
    const sid = String(r.student_id);
    const arr = actsByStudent.get(sid) || [];
    arr.push(mapActivityRow(r as { id: string; student_id: string; type: string; payload_json: unknown; created_at: unknown }));
    actsByStudent.set(sid, arr);
  }
  for (const arr of actsByStudent.values()) arr.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  return statsRows.map((s) => {
    const acts = actsByStudent.get(String(s.id)) || [];
    const act = calculeActivite(
      [s.last_production ? iso(s.last_production) : null, acts[0]?.createdAt ?? null],
      maintenant,
    );
    return {
      id: String(s.id),
      name: String(s.name),
      email: String(s.email),
      productions: Number(s.productions),
      avgIcm: Math.round(Number(s.avg_icm)),
      dominantErrors: (errorsByStudent.get(String(s.id)) || [])
        .sort((a, b) => b.count - a.count || a.first - b.first)
        .slice(0, 5)
        .map(({ tag, count }) => ({ tag, count })),
      lastProduction: s.last_production ? iso(s.last_production) : null,
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
