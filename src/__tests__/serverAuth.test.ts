// ============================================================
// serverAuth.test.ts — garde-fou anti-confusion de rôles JWT.
// Régression historique : authMiddleware/teacherAuth ne vérifiaient
// pas les claims → un jeton ÉLÈVE passait les routes ENSEIGNANT
// (dashboard, entries, export CSV, reset-password de n'importe quel
// élève). Ces tests verrouillent l'invariant dans les 2 sens.
// ============================================================
import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import path from 'node:path';
import fs from 'node:fs';
import type { Request, Response, NextFunction } from 'express';
import { makeStudentAuth, makeTeacherAuth } from '../../server/auth';

// jsdom: import.meta.url est en scheme http → on résout via cwd().
const serverSrc = () => fs.readFileSync(path.resolve(process.cwd(), 'server.ts'), 'utf-8');

const SECRET = 'test-secret-serverauth-ONLY';
const studentAuth = makeStudentAuth(SECRET);
const teacherAuth = makeTeacherAuth(SECRET);

// Jetons réalistes, signés comme server.ts le fait.
const studentToken = jwt.sign({ studentId: 'stu_1', email: 'eleve@ecole.dz' }, SECRET, { expiresIn: '7d' });
const teacherToken = jwt.sign({ email: 'prof@ecole.dz', role: 'teacher' }, SECRET, { expiresIn: '7d' });
const expiredStudentToken = jwt.sign({ studentId: 'stu_1', email: 'eleve@ecole.dz' }, SECRET, { expiresIn: '-1s' });
const expiredTeacherToken = jwt.sign({ email: 'prof@ecole.dz', role: 'teacher' }, SECRET, { expiresIn: '-1s' });
// Jeton signé avec un AUTRE secret (forgery trivial).
const forgedToken = jwt.sign({ studentId: 'stu_1', email: 'eleve@ecole.dz' }, 'mauvais-secret');

type Middleware = (req: Request, res: Response, next: NextFunction) => void;

/** Exécute le middleware avec un header Authorization donné. */
function run(mw: Middleware, authorization: string | null) {
  return new Promise<{ status: number; body: any; req: any }>((resolve) => {
    const req = {
      headers: authorization ? { authorization } : {},
    } as unknown as Request;
    const res = {
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(body: any) {
        resolve({ status: this.statusCode ?? 0, body, req });
      },
    } as unknown as Response;
    const next = () => resolve({ status: 200, body: null, req });
    mw(req, res, next as NextFunction);
  });
}

describe('makeStudentAuth — routes élève', () => {
  it('accepte un jeton élève valide et pose req.studentId', async () => {
    const out = await run(studentAuth, `Bearer ${studentToken}`);
    expect(out.status).toBe(200);
    expect((out.req as any).studentId).toBe('stu_1');
  });

  it('REJETTE un jeton enseignant (pas de claim studentId)', async () => {
    const out = await run(studentAuth, `Bearer ${teacherToken}`);
    expect(out.status).toBe(401);
    expect(out.body.error).toBe('invalid_token');
    expect((out.req as any).studentId).toBeUndefined();
  });

  it('rejette un jeton expiré', async () => {
    const out = await run(studentAuth, `Bearer ${expiredStudentToken}`);
    expect(out.status).toBe(401);
    expect(out.body.error).toBe('invalid_token');
  });

  it('rejette un jeton signé avec un autre secret', async () => {
    const out = await run(studentAuth, `Bearer ${forgedToken}`);
    expect(out.status).toBe(401);
    expect(out.body.error).toBe('invalid_token');
  });

  it('rejette une requête sans header Authorization', async () => {
    const out = await run(studentAuth, null);
    expect(out.status).toBe(401);
    expect(out.body.error).toBe('missing_token');
  });
});

describe('makeTeacherAuth — routes enseignant (l’invariant critique)', () => {
  it('accepte un jeton enseignant valide et pose req.teacherEmail', async () => {
    const out = await run(teacherAuth, `Bearer ${teacherToken}`);
    expect(out.status).toBe(200);
    expect((out.req as any).teacherEmail).toBe('prof@ecole.dz');
  });

  it("REJETTE un jeton élève sur une route enseignant — c'était l'escalade de privilèges historique", async () => {
    const out = await run(teacherAuth, `Bearer ${studentToken}`);
    expect(out.status).toBe(401);
    expect(out.body.error).toBe('invalid_token');
    expect((out.req as any).teacherEmail).toBeUndefined();
  });

  it('rejette un jeton enseignant expiré', async () => {
    const out = await run(teacherAuth, `Bearer ${expiredTeacherToken}`);
    expect(out.status).toBe(401);
    expect(out.body.error).toBe('invalid_token');
  });

  it('rejette un jeton sans header Authorization', async () => {
    const out = await run(teacherAuth, null);
    expect(out.status).toBe(401);
    expect(out.body.error).toBe('missing_token');
  });

  it('rejette un jeton signé avec un autre secret', async () => {
    const out = await run(teacherAuth, `Bearer ${forgedToken}`);
    expect(out.status).toBe(401);
    expect(out.body.error).toBe('invalid_token');
  });

  it('rejette un jeton role=student (mauvais rôle explicite)', async () => {
    const badRole = jwt.sign({ email: 'x@y.dz', role: 'student' }, SECRET);
    const out = await run(teacherAuth, `Bearer ${badRole}`);
    expect(out.status).toBe(401);
    expect(out.body.error).toBe('invalid_token');
  });
});

describe('server.ts — montage des middlewares sur les bonnes routes', () => {
  it('expose les usines à middlewares (le module doit rester importable)', () => {
    expect(typeof makeStudentAuth).toBe('function');
    expect(typeof makeTeacherAuth).toBe('function');
  });

  it('toutes les routes /api/teacher/* sauf login sont behind teacherAuth dans server.ts', () => {
    const src = serverSrc();
    const routeLines = src.split('\n').filter((l) => /app\.(get|post)\("\/api\/teacher\//.test(l));
    expect(routeLines.length).toBeGreaterThanOrEqual(4);
    for (const line of routeLines) {
      if (line.includes('teacher/login')) {
        // Route publique : ne doit être protégée par AUCUN middleware d'auth.
        expect(line).not.toContain('teacherAuth');
        expect(line).not.toContain('studentAuth');
      } else {
        expect(line).toContain('teacherAuth');
        expect(line).not.toContain('studentAuth');
      }
    }
  });

  it('toutes les routes /api/student/* et /api/auth/me sont behind studentAuth dans server.ts', () => {
    const src = serverSrc();
    const routeLines = src
      .split('\n')
      .filter((l) => /app\.(get|post)\("\/api\/(student\/|auth\/me)/.test(l));
    expect(routeLines.length).toBeGreaterThanOrEqual(4);
    for (const line of routeLines) {
      // /api/student/reset-password est publique PAR DESIGN : l'élève
      // utilise son code de reset sans session (le code EST l'auth).
      if (line.includes('student/reset-password')) {
        expect(line).not.toContain('teacherAuth');
        continue;
      }
      expect(line).toContain('studentAuth');
      expect(line).not.toContain('teacherAuth');
    }
  });
});
