import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { openStore, SqliteStore } from "./server/store";
import { PostgresStore, migrateJsonFilesToPostgres } from "./server/store.pg";
import { makeRateLimiter } from "./server/rateLimit";
import { makeStudentAuth, makeTeacherAuth } from "./server/auth";
import type { ProductionEntry, ActivityEntry, DashboardStudentRow, Student, Teacher } from "./server/store";

dotenv.config();

const DB_FILE = process.env.KUNZ_DB_FILE || path.join(process.cwd(), "data", "students.db");
// Sécurité : pas de secret par défaut. Le serveur refuse de démarrer sans JWT_SECRET explicite.
if (!process.env.JWT_SECRET) {
  console.error("REFUS DE DÉMARRAGE : JWT_SECRET manquant. Définissez-le dans .env (ex. openssl rand -hex 32).");
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

// ── Limiteurs (fenêtre glissante, en mémoire — voir server/rateLimit.ts) ──
// Par IP : anti-spam (généreux — une école partage souvent 1 IP publique).
const IP_LIMIT = 60;
// Par COMPTE : 5 échecs / 15 min, remis à zéro après une connexion réussie
// (une école derrière un NAT n'est jamais bloquée en bloc).
const ACCOUNT_LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;
const ipLimiter = makeRateLimiter(IP_LIMIT, WINDOW_MS);
const loginAccountLimiter = makeRateLimiter(ACCOUNT_LIMIT, WINDOW_MS);

// ── Cache du tableau de bord (30 s, invalidé à chaque écriture) ──
const DASH_TTL_MS = 30_000;
let dashCache: { at: number; data: DashboardStudentRow[] } | null = null;
async function dashboardRows(store: Store): Promise<DashboardStudentRow[]> {
  const now = Date.now();
  if (dashCache && now - dashCache.at < DASH_TTL_MS) return dashCache.data;
  dashCache = { at: now, data: await store.dashboardRows() };
  return dashCache.data;
}
function invalidateDashboard(): void { dashCache = null; }

// ── Backend de persistance : PostgreSQL si DATABASE_URL, sinon SQLite ──
export type Store = SqliteStore | PostgresStore;

/** Ouvre le backend ; migre les JSON hérités (v1) si le backend est vide. */
async function selectStore(): Promise<Store> {
  const url = process.env.DATABASE_URL || process.env.KUNZ_DB_URL;
  const studentsJson = path.join(process.cwd(), "data", "students.json");
  const teachersJson = path.join(process.cwd(), "data", "teachers.json");
  if (url) {
    console.log(`[store] backend PostgreSQL : ${url.replace(/:[^:@]+@/, ":***@")}`);
    const pg = new PostgresStore(url);
    await pg.ensureReady();
    // Migration JSON → PG (idempotente, uniquement si base vide).
    if (await migrateJsonFilesToPostgres(pg, studentsJson, teachersJson)) {
      console.log("[store] JSON migré vers PostgreSQL (élèves/productions/activités/enseignants)");
    }
    return pg;
  }
  console.log("[store] backend SQLite (aucune DATABASE_URL)");
  return openStore(process.env.KUNZ_DB_FILE);
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Derrière nginx/Caddy : TRUST_PROXY=1 → req.ip = IP réelle de l'élève.
  if (process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);

  const store = await selectStore();

  app.use(express.json());

  app.use((_req: Request, res: Response, next: express.NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
  });

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV || "development", offlineMode: true });
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      if (!ipLimiter.hit(req.ip || "unknown")) return res.status(429).json({ error: "too_many_attempts" });
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: "missing_fields" });
      }
      if (await store.findStudentByEmail(email)) {
        return res.status(409).json({ error: "email_exists" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const student = await store.createStudent(
        `stu_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        email,
        passwordHash,
        name,
      );
      invalidateDashboard();
      const token = jwt.sign({ studentId: student.id, email: student.email }, JWT_SECRET, { expiresIn: "7d" });
      res.status(201).json({ token, student: { id: student.id, email: student.email, name: student.name } });
    } catch (e) {
      res.status(500).json({ error: "server_error" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!ipLimiter.hit(req.ip || "unknown") || !loginAccountLimiter.hit(String(email || ""))) {
        return res.status(429).json({ error: "too_many_attempts" });
      }
      const student = await store.findStudentByEmail(email);
      if (!student || !(await bcrypt.compare(password, student.passwordHash))) {
        return res.status(401).json({ error: "invalid_credentials" });
      }
      loginAccountLimiter.reset(String(email)); // succès → compteur remis à zéro
      const token = jwt.sign({ studentId: student.id, email: student.email }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ token, student: { id: student.id, email: student.email, name: student.name } });
    } catch {
      res.status(500).json({ error: "server_error" });
    }
  });

  const studentAuth = makeStudentAuth(JWT_SECRET);

  app.get("/api/auth/me", studentAuth, async (req: Request, res: Response) => {
    const student = await store.findStudentById((req as any).studentId);
    if (!student) return res.status(404).json({ error: "not_found" });
    res.json({ student: { id: student.id, email: student.email, name: student.name } });
  });

  app.post("/api/student/sync", studentAuth, async (req: Request, res: Response) => {
    try {
      const studentId = (req as any).studentId;
      const body = req.body || {};
      const entries: ProductionEntry[] = body.entries || [];
      const events: ActivityEntry[] = body.events || [];
      if ((!Array.isArray(entries) || entries.length === 0) && (!Array.isArray(events) || events.length === 0)) {
        return res.status(400).json({ error: "invalid_payload" });
      }
      // ⚡ UNE transaction SQL pour tout le lot (upsert « si absent » — idempotent).
      const addedEntries = await store.addEntriesIfNew(studentId, entries);
      const addedEvents = await store.addActivitiesIfNew(studentId, events);
      const synced = addedEntries + addedEvents;
      if (synced > 0) invalidateDashboard();
      res.json({ ok: true, synced, total: await store.countEntries(studentId), totalEvents: await store.countActivities(studentId) });
    } catch {
      res.status(500).json({ error: "server_error" });
    }
  });

  app.get("/api/student/entries", studentAuth, async (req: Request, res: Response) => {
    res.json({ entries: await store.listEntries((req as any).studentId) });
  });

  const teacherAuth = makeTeacherAuth(JWT_SECRET);

  app.post("/api/teacher/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!ipLimiter.hit(req.ip || "unknown") || !loginAccountLimiter.hit(String(email || ""))) {
        return res.status(429).json({ error: "too_many_attempts" });
      }
      const teacher = await store.findTeacherByEmail(email);
      if (!teacher || !(await bcrypt.compare(password, teacher.passwordHash))) {
        return res.status(401).json({ error: "invalid_credentials" });
      }
      loginAccountLimiter.reset(String(email));
      const token = jwt.sign({ email: teacher.email, role: "teacher" }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ token, teacher: { email: teacher.email, name: teacher.name } });
    } catch {
      res.status(500).json({ error: "server_error" });
    }
  });

  app.get("/api/teacher/dashboard", teacherAuth, async (req: Request, res: Response) => {
    // Agrégats SQL + cache 30 s (invalidé à chaque écriture).
    res.json({ students: await dashboardRows(store) });
  });

  app.get("/api/teacher/entries", teacherAuth, async (req: Request, res: Response) => {
    const studentId = req.query.studentId as string | undefined;
    if (!studentId) return res.status(400).json({ error: "missing_student_id" });
    res.json({ entries: await store.listEntries(studentId) });
  });

  app.post("/api/teacher/reset-password", teacherAuth, async (req: Request, res: Response) => {
    try {
      const { studentId } = req.body;
      if (!studentId) return res.status(400).json({ error: "missing_student_id" });
      const student = await store.findStudentById(studentId);
      if (!student) return res.status(404).json({ error: "student_not_found" });
      const code = Math.random().toString(36).slice(2, 10).toUpperCase();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      await store.createResetCode(studentId, code, expiresAt);
      res.json({ code, expiresAt });
    } catch {
      res.status(500).json({ error: "server_error" });
    }
  });

  app.post("/api/student/reset-password", async (req: Request, res: Response) => {
    try {
      const { code, password } = req.body;
      if (!code || !password) return res.status(400).json({ error: "missing_fields" });
      const resetCode = await store.findUsableResetCode(code);
      if (!resetCode) return res.status(400).json({ error: "invalid_or_used_code" });
      if (new Date(resetCode.expiresAt).getTime() < Date.now()) {
        await store.markResetUsed(code);
        return res.status(400).json({ error: "expired_code" });
      }
      const student = await store.findStudentById(resetCode.studentId);
      if (!student) return res.status(404).json({ error: "student_not_found" });
      const passwordHash = await bcrypt.hash(password, 10);
      await store.updateStudentPassword(student.id, passwordHash);
      await store.markResetUsed(code);
      invalidateDashboard();
      res.json({ ok: true });
    } catch {
      res.status(500).json({ error: "server_error" });
    }
  });

  app.post("/api/student/activity", studentAuth, async (req: Request, res: Response) => {
    try {
      const studentId = (req as any).studentId;
      const { type, payload } = req.body;
      if (!type || !payload) return res.status(400).json({ error: "missing_fields" });
      await store.pushActivity(
        studentId,
        type,
        payload,
        `act_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      );
      invalidateDashboard();
      res.json({ ok: true });
    } catch {
      res.status(500).json({ error: "server_error" });
    }
  });

  app.get("/api/teacher/export/csv", teacherAuth, async (req: Request, res: Response) => {
    const studentId = req.query.studentId as string | undefined;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="boussole-export-${studentId || "all"}.csv"`);
    res.write("\uFEFF"); // BOM → Excel ouvre l'arabe correctement
    res.write(["student_id", "name", "email", "productions", "avg_icm", "last_production", "top_errors"].join(";") + "\n");
    if (studentId) {
      // Un seul élève : même forme de ligne (petit volume).
      const entries = await store.listEntries(studentId);
      const avgIcm = entries.length ? Math.round(entries.reduce((s, e) => s + (Number(e.icm) || 0), 0) / entries.length) : 0;
      const dominantErrors = entries.flatMap((e) => e.errorTags).reduce<Record<string, number>>((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});
      const topErrors = Object.entries(dominantErrors).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tag, count]) => `${tag}:${count}`).join("; ");
      const student = await store.findStudentById(studentId);
      res.write([studentId, student?.name || "", student?.email || "", String(entries.length), String(avgIcm), student?.createdAt || "", topErrors].join(";") + "\n");
    } else {
      // Streaming : itérateur SQL — 300 000 lignes sans jamais tout charger en RAM.
      for await (const row of store.iterateExportRows()) {
        res.write([row.id, row.name, row.email, String(row.productions), String(row.avgIcm), row.lastProduction || "", row.topErrors].join(";") + "\n");
      }
    }
    res.end();
  });

  async function ensureTeacher() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) return;
    if (await store.findTeacherByEmail(email)) return;
    const hash = bcrypt.hashSync(password, 10);
    await store.createTeacher(email, hash, email.split("@")[0]);
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  await ensureTeacher();

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`[Kunz El Ouloum Server] Running on http://localhost:${PORT} (Offline Mode)`);
  });
}

startServer();
