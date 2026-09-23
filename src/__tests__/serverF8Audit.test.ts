// ============================================================
// serverF8Audit.test.ts — verrous P6 (F8 sécurité) :
//   · zod : schémas + parseBody sur tous les POST critiques
//   · JWT : claim pwd (révocation après reset) + lookup studentAuth
//   · rate-limit : éponge le Map (pas de fuite de clés expirées)
// ============================================================
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { makeStudentAuth, pwdTag } from '../../server/auth';
import {
  ActivityBody,
  LoginBody,
  RegisterBody,
  StudentResetBody,
  SyncBody,
  TeacherResetBody,
  parseBody,
} from '../../server/schemas';
import { makeRateLimiter } from '../../server/rateLimit';

const root = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf-8');

describe('P6 — F8 : validation zod des corps POST', () => {
  it('server/schemas.ts existe et exporte les schémas critiques', () => {
    expect(typeof RegisterBody).toBeTruthy();
    expect(typeof LoginBody).toBeTruthy();
    expect(typeof SyncBody).toBeTruthy();
    expect(typeof TeacherResetBody).toBeTruthy();
    expect(typeof StudentResetBody).toBeTruthy();
    expect(typeof ActivityBody).toBeTruthy();
    expect(typeof parseBody).toBe('function');
  });

  it('register rejette un body manquant / email vide', () => {
    expect(parseBody(RegisterBody, {})).toBeNull();
    expect(parseBody(RegisterBody, { email: '', password: 'x', name: 'N' })).toBeNull();
  });

  it('sync rejette un lot vide et un JSON non objet', () => {
    expect(parseBody(SyncBody, {})).toBeNull();
    expect(parseBody(SyncBody, { entries: [], events: [] })).toBeNull();
    expect(parseBody(SyncBody, 'not-an-object')).toBeNull();
  });

  it('sync accepte une production typée valide', () => {
    const ok = parseBody(SyncBody, {
      entries: [
        {
          id: 'e1',
          studentId: 's1',
          verbId: 'v1',
          theme: 't',
          stage: 1,
          text: 'x',
          icm: 50,
          criteriaSummary: [{ label: 'L', passed: true }],
          errorTags: ['tag'],
          createdAt: '2026-09-23T00:00:00.000Z',
        },
      ],
    });
    expect(ok).not.toBeNull();
    expect(ok?.entries).toHaveLength(1);
  });

  it('sync rejette errorTags non-tableau (pollution JSON arbitraire)', () => {
    const bad = parseBody(SyncBody, {
      entries: [
        {
          id: 'e1',
          studentId: 's1',
          verbId: 'v1',
          theme: 't',
          stage: 1,
          text: 'x',
          icm: 50,
          criteriaSummary: [],
          errorTags: { evil: true },
          createdAt: '2026-09-23T00:00:00.000Z',
        },
      ],
    });
    expect(bad).toBeNull();
  });

  it('activity rejette type manquant / payload non-record', () => {
    expect(parseBody(ActivityBody, {})).toBeNull();
    expect(parseBody(ActivityBody, { type: 'quiz', payload: 'nope' })).toBeNull();
    expect(parseBody(ActivityBody, { type: 'quiz', payload: { percent: 80 } })).not.toBeNull();
  });

  it('server.ts appelle parseBody sur register, sync, reset et activity', () => {
    const src = read('server.ts');
    expect(src).toContain('parseBody(RegisterBody');
    expect(src).toContain('parseBody(LoginBody');
    expect(src).toContain('parseBody(SyncBody');
    expect(src).toContain('parseBody(TeacherResetBody');
    expect(src).toContain('parseBody(StudentResetBody');
    expect(src).toContain('parseBody(ActivityBody');
    expect(src).toContain('./server/schemas');
  });
});

describe('P6 — F8 : révocation JWT après reset (claim pwd)', () => {
  const SECRET = 'test-secret-f8-ONLY';
  const hashV1 = '$2a$10$abcdefghijklmnopqrstuv';
  const hashV2 = '$2a$10$ZZZZZZZZZZZZZZZZZZZZZZ';

  type MW = (req: Request, res: Response, next: NextFunction) => unknown;

  function run(mw: MW, authorization: string | null) {
    return new Promise<{ status: number; body: unknown; req: unknown }>((resolve) => {
      const req = { headers: authorization ? { authorization } : {} } as unknown as Request;
      const res = {
        statusCode: 0,
        status(code: number) {
          this.statusCode = code;
          return this;
        },
        json(body: unknown) {
          resolve({ status: this.statusCode || 0, body, req });
        },
      } as unknown as Response;
      const next = () => resolve({ status: 200, body: null, req });
      void mw(req, res, next as NextFunction);
    });
  }

  it('pwdTag est déterministe et change si le hash change', () => {
    expect(pwdTag(hashV1)).toBe(pwdTag(hashV1));
    expect(pwdTag(hashV1)).not.toBe(pwdTag(hashV2));
    expect(pwdTag(hashV1)).toHaveLength(16);
  });

  it('makeStudentAuth rejette un jeton dont le claim pwd ne matche plus (reset)', async () => {
    const auth = makeStudentAuth(SECRET, async () => ({ passwordHash: hashV2 }));
    const stale = jwt.sign(
      { studentId: 'stu_1', email: 'e@x.dz', pwd: pwdTag(hashV1) },
      SECRET,
      { expiresIn: '7d' },
    );
    const out = await run(auth, `Bearer ${stale}`);
    expect(out.status).toBe(401);
    expect((out.body as { error: string }).error).toBe('invalid_token');
  });

  it('makeStudentAuth accepte un jeton dont le pwd matche le hash courant', async () => {
    const auth = makeStudentAuth(SECRET, async () => ({ passwordHash: hashV1 }));
    const fresh = jwt.sign(
      { studentId: 'stu_1', email: 'e@x.dz', pwd: pwdTag(hashV1) },
      SECRET,
      { expiresIn: '7d' },
    );
    const out = await run(auth, `Bearer ${fresh}`);
    expect(out.status).toBe(200);
    expect((out.req as { studentId?: string }).studentId).toBe('stu_1');
  });

  it('makeStudentAuth rétrocompatible sans 2ᵉ argument (lock serverAuth)', async () => {
    const auth = makeStudentAuth(SECRET);
    const tok = jwt.sign({ studentId: 'stu_1', email: 'e@x.dz' }, SECRET, { expiresIn: '7d' });
    const out = await run(auth, `Bearer ${tok}`);
    expect(out.status).toBe(200);
    expect((out.req as { studentId?: string }).studentId).toBe('stu_1');
  });

  it('makeStudentAuth rejette un jeton SANS claim pwd quand le lookup est monté', async () => {
    const auth = makeStudentAuth(SECRET, async () => ({ passwordHash: hashV1 }));
    const legacy = jwt.sign({ studentId: 'stu_1', email: 'e@x.dz' }, SECRET, { expiresIn: '7d' });
    const out = await run(auth, `Bearer ${legacy}`);
    expect(out.status).toBe(401);
  });

  it('makeStudentAuth rejette un élève introuvable (compte supprimé)', async () => {
    const auth = makeStudentAuth(SECRET, async () => undefined);
    const tok = jwt.sign(
      { studentId: 'stu_gone', email: 'e@x.dz', pwd: pwdTag(hashV1) },
      SECRET,
      { expiresIn: '7d' },
    );
    const out = await run(auth, `Bearer ${tok}`);
    expect(out.status).toBe(401);
  });

  it('server.ts signe register/login avec pwdTag et monte le lookup studentAuth', () => {
    const src = read('server.ts');
    expect(src).toContain('pwd: pwdTag(student.passwordHash)');
    expect(src).toContain('makeStudentAuth(JWT_SECRET, async');
    expect(src).toContain('findStudentById');
  });

  it('le reset met à jour le hash via updateStudentPassword (révocation effective)', () => {
    const src = read('server.ts');
    expect(src).toContain('updateStudentPassword');
    const auth = read('server/auth.ts');
    expect(auth).toContain('export function pwdTag');
  });
});

describe('P6 — F8 : rate-limit Map sans fuite de clés', () => {
  it('makeRateLimiter éponge les clés expirées (prune)', () => {
    const src = read('server/rateLimit.ts');
    expect(src).toContain('function prune');
    expect(src).toContain('hits.delete');
    expect(src).toContain('lastPrune');
  });

  it('count sur clé expirée supprime l’entrée du Map', async () => {
    // Fenêtre 40 ms : assez courte pour le test, assez large pour ne pas
    // expirer entre hit() et count() immédiats.
    const rl = makeRateLimiter(5, 40);
    expect(rl.hit('k')).toBe(true);
    expect(rl.count('k')).toBe(1);
    await new Promise((r) => setTimeout(r, 50));
    expect(rl.count('k')).toBe(0);
    expect(rl.hit('k')).toBe(true);
    expect(rl.count('k')).toBe(1);
  });
});
