// ============================================================
// gen-licences-pg.ts — semis de CODES D'ACTIVATION dans le
// PostgreSQL de production (Vercel/Neon). Usage propriétaire :
//   npx vercel env pull .env.production.local   (déjà fait)
//   npx tsx scripts/gen-licences-pg.ts --n 20 --note "lot nov 2026"
// Même gabarit que gen-licences.ts (local SQLite) mais branché
// sur DATABASE_URL lue depuis .env.production.local ou l'env.
// Les codes ne sont jamais affichés : uniquement le CSV.
// ============================================================
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ALPHABET_CODES, genererCodeLicence } from "../src/server/facturation";
import { PostgresStore } from "../server/store.pg";

function parseArgs(argv: string[]): { n: number; note: string; out: string } {
  const raw = argv.slice(2);
  const option = (nom: string, defaut: string): string => {
    const i = raw.indexOf(nom);
    return i >= 0 && raw[i + 1] ? raw[i + 1] : defaut;
  };
  const n = Math.max(1, Math.min(500, Number(option("--n", "20")) || 20));
  return {
    n,
    note: option("--note", ""),
    out: option("--out", `licences-pg-${new Date().toISOString().slice(0, 10)}.csv`),
  };
}

/** Lit DATABASE_URL dans .env.production.local (vercel env pull). */
function lireDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const fichier = path.join(process.cwd(), ".env.production.local");
  if (!fs.existsSync(fichier)) {
    throw new Error("DATABASE_URL absente : lance d'abord `npx vercel env pull .env.production.local`");
  }
  const contenu = fs.readFileSync(fichier, "utf8");
  const ligne = contenu.split("\n").find((l) => l.startsWith("DATABASE_URL="));
  if (!ligne) throw new Error("DATABASE_URL introuvable dans .env.production.local");
  return ligne.slice("DATABASE_URL=".length).trim().replace(/^["']|["']$/g, "");
}

/** Tire un corps de 8 caractères via CSPRNG (même gabarit que le local). */
function tirerCorps(): string {
  const bytes = randomBytes(8);
  let corps = "";
  for (let i = 0; i < 8; i++) corps += ALPHABET_CODES[bytes[i] % ALPHABET_CODES.length];
  return corps;
}

async function main(): Promise<void> {
  const { n, note, out } = parseArgs(process.argv);
  const url = lireDatabaseUrl();
  const store = new PostgresStore(url);
  await store.ensureReady();
  try {
    const maintenant = new Date().toISOString();
    const corps = new Set<string>();
    while (corps.size < n) {
      corps.add(tirerCorps());
    }
    const codes = [...corps].map(genererCodeLicence);
    const creees = await store.creerLicences(codes, note, maintenant);

    // CSV : code ; date ; note — UTF-8 SANS BOM, séparateur ; (Excel FR).
    const en_tete = "code;cree_le;note";
    const lignes = codes.map((c) => `${c};${maintenant};"${note.replace(/"/g, "'")}"`);
    fs.writeFileSync(out, `${[en_tete, ...lignes].join("\r\n")}\n`, { encoding: "utf8" });

    console.log(`OK : ${creees} nouveau(x) code(s) sur ${n} demandes (Postgres production).`);
    console.log(`Fichier : ${path.resolve(out)}`);
    console.log("Les codes ne sont PAS affichés ici — lis le fichier.");
  } finally {
    store.close();
  }
}

main().catch((e) => {
  console.error("Echec generation :", e instanceof Error ? e.message : e);
  process.exit(1);
});
