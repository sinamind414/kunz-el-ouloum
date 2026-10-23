// ============================================================
// gen-licences.ts — générateur de CODES D'ACTIVATION (usage
// propriétaire UNIQUEMENT, exécution locale) :
//   npx tsx scripts/gen-licences.ts --n 20 --note "lot nov 2026"
//   npx tsx scripts/gen-licences.ts --n 50 --out mes-codes.csv
//
//1. Le code est écrit dans la table `licences` de la base locale.
//2. Le csv est écrit en UTF-8 SANS BOM (Excel-alisable).
//3. Les codes ne JAMAIS passés par la console en clair complet :
//   la console n'affiche que le compte et le chemin du fichier.
//   (Les codes = de l'argent : ils ne doivent pas finir dans un
//   journal de terminal partagé.)
// ============================================================
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ALPHABET_CODES, genererCodeLicence } from "../src/server/facturation";
import { SqliteStore } from "../server/store";

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
    out: option("--out", `licences-${new Date().toISOString().slice(0, 10)}.csv`),
  };
}

/** Tire un corps de 8 caractères via CSPRNG (Math.random était prévisible). */
function tirerCorps(): string {
  const bytes = randomBytes(8);
  let corps = "";
  for (let i = 0; i < 8; i++) corps += ALPHABET_CODES[bytes[i] % ALPHABET_CODES.length];
  return corps;
}

async function main(): Promise<void> {
  const { n, note, out } = parseArgs(process.argv);

  // La même base que le serveur local (voir server.ts selectStore).
  const cheminBase = process.env.KUNZ_DB_PATH || path.join(process.cwd(), "data", "students.db");
  const store = new SqliteStore(cheminBase);
  try {
    const maintenant = new Date().toISOString();
    const corps = new Set<string>();
    while (corps.size < n) {
      corps.add(tirerCorps());
    }
    const codes = [...corps].map(genererCodeLicence);
    const creees = store.creerLicences(codes, note, maintenant);

    // CSV : code ; date ; note — séparateur point-virgule (Excel FR).
    const en_tete = "code;cree_le;note";
    const lignes = codes.map((c) => `${c};${maintenant};"${note.replace(/"/g, "'")}"`);
    fs.writeFileSync(out, `${[en_tete, ...lignes].join("\r\n")}\n`, { encoding: "utf8" });

    console.log(`OK : ${creees} nouveau(x) code(s) sur ${n} demandes.`);
    console.log(`Fichier : ${path.resolve(out)}`);
    console.log("Les codes ne sont PAS affichés ici — lis le fichier, puis transmets-les un par un après paiement.");
  } finally {
    store.close();
  }
}

main().catch((e) => {
  console.error("Echec generation :", e instanceof Error ? e.message : e);
  process.exit(1);
});
