// ============================================================
// server/auth.ts — middlewares JWT (usine à middlewares).
// Invariants sécurité (couverts par src/__tests__/serverAuth.test.ts) :
//   • studentAuth : exige un claim `studentId` dans le jeton.
//   • teacherAuth : exige le claim `role === "teacher"`.
// Un jeton élève ne doit JAMAIS passer les routes enseignant, et
// inversement — c'était le trou de confusion de rôles historique.
// ============================================================
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

function bearerToken(req: Request): string | null {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}

export function makeStudentAuth(secret: string) {
  return function studentAuth(req: Request, res: Response, next: NextFunction) {
    const token = bearerToken(req);
    if (!token) return res.status(401).json({ error: "missing_token" });
    try {
      const payload = jwt.verify(token, secret) as { studentId?: string; email: string };
      if (!payload.studentId) return res.status(401).json({ error: "invalid_token" });
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
