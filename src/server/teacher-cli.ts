// ============================================================
// teacher-cli.ts — création d'un compte enseignant sur le VRAI
// backend (SQLite par défaut, PostgreSQL si DATABASE_URL).
// L'ancien script écrivait data/teachers.json, invisible pour
// le serveur relationnel — c'était le dernier écart post-SQLite.
//   Usage : npm run teacher <email> <password> [name]
//   Ex.   : npm run teacher maitre@ecole.dz Change-moi-123
// (idempotent : si l'email existe déjà, message + sortie 0)
// ============================================================
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { pathToFileURL } from "node:url";
import { openStore } from "../../server/store";
import { PostgresStore } from "../../server/store.pg";
import type { Student, Teacher } from "../../server/store";

dotenv.config();

export async function createTeacherCLI(): Promise<void> {
  const args = process.argv.slice(2);
  const email: string | undefined = args[0];
  const password: string | undefined = args[1];
  const name = args[2] || (email ? email.split("@")[0] : "");

  if (!email || !password) {
    console.error("Usage: npm run teacher <email> <password> [name]");
    process.exit(1);
  }

  const url = process.env.DATABASE_URL || process.env.KUNZ_DB_URL;
  const store = url ? new PostgresStore(url) : openStore(process.env.KUNZ_DB_FILE);
  try {
    if (url) await (store as PostgresStore).ensureReady();
    // openStore a déjà migré les anciens data/teachers.json → SQLite si base vide.
    const existing: Teacher | undefined = await store.findTeacherByEmail(email);
    if (existing) {
      console.log(`Teacher ${email} already exists.`);
      return;
    }
    const passwordHash = bcrypt.hashSync(password, 10);
    await store.createTeacher(email, passwordHash, name);
    console.log(`Teacher created: ${name} <${email}>`);
  } finally {
    store.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createTeacherCLI().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
