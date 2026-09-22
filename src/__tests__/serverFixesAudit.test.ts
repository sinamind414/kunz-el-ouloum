// ============================================================
// serverFixesAudit.test.ts — verrous des correctifs d'audit 2026-09-22 :
//   #1 fetchMe envoie Authorization (+ statut 401 distingué du réseau)
//   #3 routes async protégées + CSV sans CRLF (crash ERR_INVALID_CHAR)
//   #4 reset-password rate-limité + code CSPRNG
//   #5 email normalisé (trim+lower) client ET serveur
// ============================================================
import { describe, expect, it, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const serverSrc = () => fs.readFileSync(path.resolve(process.cwd(), 'server.ts'), 'utf-8');
const storeSrc = () => fs.readFileSync(path.resolve(process.cwd(), 'server', 'store.ts'), 'utf-8');
const storePgSrc = () => fs.readFileSync(path.resolve(process.cwd(), 'server', 'store.pg.ts'), 'utf-8');

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('fix #3 — routes async protégées (anti crash Express 4)', () => {
  it('server.ts définit asyncHandler et l’applique aux routes sans try/catch', () => {
    const src = serverSrc();
    expect(src).toContain('const asyncHandler');
    // Les 5 routes qui n'avaient AUCUN try/catch sont wrappées.
    for (const route of [
      'app.get("/api/auth/me", studentAuth, asyncHandler(',
      'app.get("/api/student/entries", studentAuth, asyncHandler(',
      'app.get("/api/teacher/dashboard", teacherAuth, asyncHandler(',
      'app.get("/api/teacher/entries", teacherAuth, asyncHandler(',
      'app.get("/api/teacher/export/csv", teacherAuth, asyncHandler(',
    ]) {
      expect(src).toContain(route);
    }
  });

  it('server.ts a un handler d’erreurs final + filet unhandledRejection', () => {
    const src = serverSrc();
    expect(src).toContain('app.use((err:');
    expect(src).toContain('process.on("unhandledRejection"');
  });

  it('l’en-tête CSV n’interpole plus studentId brut (CRLF = crash confirmé)', () => {
    const src = serverSrc();
    expect(src).toContain('const safeId = studentId');
    expect(src).toContain('boussole-export-${safeId || "all"}.csv');
    // L'ancienne interpolation directe ne doit plus exister.
    expect(src).not.toContain('boussole-export-${studentId || "all"}.csv');
  });
});

describe('fix #4 — reset-password : rate-limit + CSPRNG', () => {
  it('la route limite les essais par IP', () => {
    const src = serverSrc();
    expect(src).toContain('resetCodeLimiter.hit');
    expect(src).toContain('const resetCodeLimiter = makeRateLimiter(10, WINDOW_MS)');
  });

  it('le code vient de randomBytes (Math.random retiré de la génération)', () => {
    const src = serverSrc();
    expect(src).toContain('function generateResetCode');
    expect(src).toContain('randomBytes(8)');
    expect(src).toContain('const code = generateResetCode()');
    expect(src).not.toContain('Math.random().toString(36).slice(2, 10)');
  });
});

describe('fix #5 — email normalisé côté serveur + stores', () => {
  it('server.ts normalise l’email (register, logins, admin)', () => {
    const src = serverSrc();
    expect(src).toContain('const normalizeEmail');
    expect(src).toContain('const email = normalizeEmail(req.body.email)');
    expect(src).toContain('normalizeEmail(process.env.ADMIN_EMAIL)');
  });

  it('les deux stores cherchent par LOWER(email) (comptes hérités mixtes)', () => {
    expect(storeSrc()).toContain('LOWER(email) = ?');
    expect(storePgSrc()).toContain('LOWER(email) = $1');
  });
});

describe('fix #1 — fetchMe envoie Authorization et distingue 401/réseau', () => {
  it('inclut le header Bearer du jeton stocké', async () => {
    const { fetchMe } = await import('../utils/api');
    localStorage.setItem('boussole_token', 'jwt-de-test');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ student: { id: 's1', email: 'a@b.c', name: 'A' } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const out = await fetchMe();
    expect(out.student.id).toBe('s1');
    const [, init] = fetchMock.mock.calls[0];
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer jwt-de-test',
    });
  });

  it('une 401 lève une erreur status=401 (session à couper)', async () => {
    const { fetchMe } = await import('../utils/api');
    localStorage.setItem('boussole_token', 'jwt-perime');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ error: 'invalid_token' }) }),
    );
    await expect(fetchMe()).rejects.toMatchObject({ status: 401 });
  });

  it('une panne réseau N’A PAS de statut 401 (le jeton doit survivre)', async () => {
    const { fetchMe } = await import('../utils/api');
    localStorage.setItem('boussole_token', 'jwt-valide-offline');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(fetchMe()).rejects.not.toMatchObject({ status: 401 });
    expect(localStorage.getItem('boussole_token')).toBe('jwt-valide-offline');
  });
});

describe('fix #5 — client : register/login normalisent l’email', () => {
  it('registerStudent envoie email trim+minuscules', async () => {
    const { registerStudent } = await import('../utils/api');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ token: 't', student: { id: 's', email: 'a@b.c', name: 'N' } }),
    });
    vi.stubGlobal('fetch', fetchMock);
    await registerStudent('  Eleve@ECOLE.DZ ', 'pass1234', 'N');
    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body.email).toBe('eleve@ecole.dz');
  });

  it('loginStudent envoie email trim+minuscules', async () => {
    const { loginStudent } = await import('../utils/api');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ token: 't', student: { id: 's', email: 'a@b.c', name: 'N' } }),
    });
    vi.stubGlobal('fetch', fetchMock);
    await loginStudent(' Eleve@ECOLE.DZ ', 'pass1234');
    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body.email).toBe('eleve@ecole.dz');
  });
});
