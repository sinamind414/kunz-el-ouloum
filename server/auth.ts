// ============================================================
// server/auth.ts — middlewares JWT (usine à middlewares).
// Invariants sécurité (couverts par src/__tests__/serverAuth.test.ts) :
//   • studentAuth : exige un claim `studentId` dans le jeton.
//   • teacherAuth : exige le claim `role === "teacher"`.
//   • F8 — révocation : le claim `pwd` = empreinte du hash mot de passe.
//     Après un reset, le hash change → les anciens jetons sont rejetés
//     (lookup optionnel fourni par server.ts via getStudent).
// Un jeton élève ne doit JAMAIS passer les routes enseignant, et
// inversement — c'était le trou de confusion de rôles historique.
// ============================================================
import jwt from "jsonwebtoken";
import { createHash } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

function bearerToken(req: Request): string | null {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}

/** Empreinte courte du hash bcrypt — claim de révocation (change à chaque reset). */
export function pwdTag(passwordHash: string): string {
  return createHash("sha256").update(passwordHash).digest("hex").slice(0, 16);
}

export type StudentAuthLookup = (
  studentId: string,
) => Promise<{ passwordHash: string } | undefined>;

export function makeStudentAuth(secret: string, getStudent?: StudentAuthLookup) {
  return async function studentAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const token = bearerToken(req);
      if (!token) return res.status(401).json({ error: "missing_token" });
      const payload = jwt.verify(token, secret) as {
        studentId?: string;
        email: string;
        pwd?: string;
      };
      if (!payload.studentId) return res.status(401).json({ error: "invalid_token" });
      if (getStudent) {
        // F8 : jeton sans claim pwd ou hash divergent (reset) → révoqué.
        const student = await getStudent(payload.studentId);
        if (!student || !payload.pwd || payload.pwd !== pwdTag(student.passwordHash)) {
          return res.status(401).json({ error: "invalid_token" });
        }
      }
      (req as any).studentId = payload.studentId;
      next();
    } catch {
      return res.status(401).json({ error: "invalid_token" });
    }
  };
}

export function makeTeacherAuth(secret: string) {
  return function teacherAuth(req: Request, res: Response, next: NextFunction) {
    const token = bearerToken(req);
    if (!token) return res.status(401).json({ error: "missing_token" });
    try {
      const payload = jwt.verify(token, secret) as { email: string; role?: string };
      if (payload.role !== "teacher") return res.status(401).json({ error: "invalid_token" });
      (req as any).teacherEmail = payload.email;
      next();
    } catch {
      return res.status(401).json({ error: "invalid_token" });
    }
  };
}
