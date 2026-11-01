// ============================================================
// migrate.ts — migration de l'ancienne base JSON du serveur
//   Usage : npm run db:migrate -- data/students.json          → SQLite
//   Usage : DATABASE_URL=postgres://… npm run db:migrate -- data/students.json → PostgreSQL
// (idempotent : relancer ne duplique rien — upsert par clé)
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import { migrateFromJsonFiles } from './store';
import { PostgresStore, migrateJsonFilesToPostgres } from './store.pg';

const studentsJson = process.argv[2] || path.join(process.cwd(), 'data', 'students.json');
if (!fs.existsSync(studentsJson)) {
  console.error(`✗ Fichier introuvable : ${studentsJson}`);
  console.error('Usage : npm run db:migrate -- <students.json> [students.db]');
  console.error('        DATABASE_URL=postgres://… npm run db:migrate -- <students.json>');
  process.exit(1);
}
const teachersJson = path.join(path.dirname(studentsJson), 'teachers.json');

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL || process.env.KUNZ_DB_URL;
  try {
    if (url) {
      const pg = new PostgresStore(url);
      await pg.ensureReady();
      const migrated = await migrateJsonFilesToPostgres(pg, studentsJson, teachersJson);
      await pg.close();
      console.log(
        migrated
          ? `✅ Migration terminée : ${studentsJson} → PostgreSQL (${url.replace(/:[^:@]+@/, ':***@')})`
          : 'ℹ Base PostgreSQL déjà non vide — migration ignorée (idempotente).',
      );
    } else {
      const dbPath = process.argv[3] || path.join(process.cwd(), 'data', 'students.db');
      const res = migrateFromJsonFiles(studentsJson, teachersJson, dbPath);
      console.log(`✅ Migration terminée : ${studentsJson} → ${dbPath}`);
      console.log(`   ${res.students} élèves · ${res.entries} productions · ${res.activities} activités · ${res.teachers} enseignants`);
      console.log('   (le fichier JSON est conservé intact comme sauvegarde)');
    }
  } catch (e) {
    console.error('✗ Échec de la migration :', e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

main();
