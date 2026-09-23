// ============================================================
// server/schemas.ts — validation zod des corps de requêtes (F8).
// Contrat d'erreurs inchangé : les routes traduisent un échec
// zod vers les codes historiques (missing_fields, invalid_payload…).
// ============================================================
import { z } from "zod";

/** Email : forme minimale — la normalisation (trim+lower) reste dans server.ts. */
export const EmailIn = z.string().trim().min(3).max(254);
/** Mot de passe : longueur brute ici ; la politique ≥6 reste isWeakPassword (code weak_password). */
export const PasswordIn = z.string().min(1).max(128);
export const NameIn = z.string().trim().min(1).max(200);
export const IdIn = z.string().min(1).max(128);

export const RegisterBody = z.object({
  email: EmailIn,
  password: PasswordIn,
  name: NameIn,
});

export const LoginBody = z.object({
  email: EmailIn,
  password: PasswordIn,
});

const CriteriaItem = z.object({
  label: z.string().max(200),
  passed: z.boolean(),
});

export const ProductionEntryIn = z.object({
  id: IdIn,
  studentId: IdIn,
  verbId: z.string().max(128),
  theme: z.string().max(300),
  stage: z.number().int().min(0).max(50),
  text: z.string().max(50_000),
  icm: z.number().min(0).max(100),
  criteriaSummary: z.array(CriteriaItem).max(50),
  errorTags: z.array(z.string().min(1).max(64)).max(100),
  durationSec: z.number().min(0).max(86_400).optional(),
  createdAt: z.string().min(1).max(64),
});

export const ActivityEntryIn = z.object({
  id: IdIn,
  studentId: IdIn,
  type: z.enum(["quiz", "mission", "drill", "production"]),
  payload: z.record(z.string(), z.unknown()),
  createdAt: z.string().min(1).max(64),
});

/** POST /api/student/sync — lot offline (au moins une collection non vide). */
export const SyncBody = z
  .object({
    entries: z.array(ProductionEntryIn).max(200).default([]),
    events: z.array(ActivityEntryIn).max(500).default([]),
  })
  .refine((d) => d.entries.length > 0 || d.events.length > 0, {
    message: "invalid_payload",
  });

export const TeacherResetBody = z.object({ studentId: IdIn });

/** Code de reset : alphabet CSPRNG (8) — marge 16 pour évolution. */
export const StudentResetBody = z.object({
  code: z.string().min(8).max(16),
  password: PasswordIn,
});

export const ActivityBody = z.object({
  type: z.string().min(1).max(64),
  payload: z.record(z.string(), z.unknown()),
});

/** safeParse → data | null (l'appelant mappe null vers le code d'erreur historique). */
export function parseBody<T>(schema: z.ZodType<T>, body: unknown): T | null {
  const r = schema.safeParse(body ?? {});
  return r.success ? r.data : null;
}
