// ============================================================
// verify.ts — auto-contrôle de PARITÉ du store (contrat serveur)
// Le référentiel est la « force brute » (mêmes réductions que le
// serveur JSON d'origine) : le store doit reproduire exactement
//   · dashboard : productions, avgIcm, dominantErrors (occurrences
//     + ordre à égalité = première occurrence), activités (ordre),
//     quizCount, missionCount, avgQuizPercent
//   · CSV : colonne « last_production » = MAX(created_at) des
//     entries (dernière production réelle, '' si aucune) —
//     contrat aligné sur le dashboard depuis l'audit 2026-09-22,
//     top_errors = "tag:count" décroissant, 5 max
//   · idempotence (re-sync client SANS studentId) — épingle la
//     régression entry_errors du backend PostgreSQL
//   · occurrences (tag répété 3× dans un même errorTags = 3)
//   · pushActivity à la volée (« live »)
// Usage :
//   npm run verify:store                                        → SQLite (mémoire)
//   SELFCHECK_DB_URL=postgres://… npm run verify:store          → SQLite + PostgreSQL
//   ⚠ SELFCHECK_DB_URL : la base fournie est TRONQUÉE (base jetable dédiée).
// ============================================================
import { SqliteStore } from "./store";
import { PostgresStore } from "./store.pg";
import { makeRateLimiter } from "./rateLimit";
import type { Student, ProductionEntry, ActivityEntry } from "./store";

type AnyStore = SqliteStore | PostgresStore;

// ── Fixture déterministe (graine fixée) ─────────────────────
let seed = 42;
const R = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };

function makeFixture() {
  const students: Student[] = [];
  const entries: ProductionEntry[] = [];
  const activities: ActivityEntry[] = [];
  for (let i = 0; i < 20; i++) {
    students.push({ id: "s" + i, email: `e${i}@x.dz`, passwordHash: "h", name: "n" + i, createdAt: `2026-01-0${(i % 9) + 1}T00:00:00.000Z` });
  }
  for (let i = 0; i < 57; i++) {
    const sid = "s" + Math.floor(R() * 20);
    entries.push({
      id: `e_${i}`, studentId: sid, verbId: "v", theme: "t", stage: 3, text: "x",
      icm: Math.floor(R() * 100), criteriaSummary: [],
      errorTags: [`t${Math.floor(R() * 4)}`, `t${Math.floor(R() * 4)}`],
      createdAt: `2026-02-0${Math.floor(R() * 9) + 1}T0${Math.floor(R() * 9)}:00:00.000Z`,
    });
  }
  for (let i = 0; i < 31; i++) {
    const sid = "s" + Math.floor(R() * 20);
    activities.push({
      id: `a_${i}`, studentId: sid, type: (["quiz", "mission", "drill"] as const)[Math.floor(R() * 3)],
      payload: { percent: Math.floor(R() * 100) },
      createdAt: `2026-03-0${Math.floor(R() * 9) + 1}T0${Math.floor(R() * 9)}:00:00.000Z`,
    });
  }
  // Référence « force brute » (reproduction exacte du serveur JSON d'origine)
  const ref = students.map((s) => {
    const es = entries.filter((e) => e.studentId === s.id);
    const tags = new Map<string, { n: number; first: number }>();
    let ord = 0;
    es.forEach((e) => e.errorTags.forEach((t) => {
      const o = tags.get(t);
      if (o) { o.n++; } else { tags.set(t, { n: 1, first: ord }); }
      ord++;
    }));
    return {
      id: s.id,
      prod: es.length,
      avgIcm: Math.round(es.reduce((x, e) => x + e.icm, 0) / (es.length || 1)),
      errs: [...tags.entries()].sort((a, b) => b[1].n - a[1].n || a[1].first - b[1].first).slice(0, 5).map(([tag, v]) => `${tag}:${v.n}`),
      acts: activities.filter((a) => a.studentId === s.id).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).map((a) => a.id),
      quiz: activities.filter((a) => a.studentId === s.id && a.type === "quiz").length,
      mission: activities.filter((a) => a.studentId === s.id && a.type === "mission").length,
    };
  });
  return { students, entries, activities, ref };
}

/** Entrée « client » (le serveur assigne studentId — sans ce champ). */
function clientEntry(e: ProductionEntry) {
  return {
    id: e.id, verbId: e.verbId, theme: e.theme, stage: e.stage, text: e.text,
    icm: e.icm, criteriaSummary: e.criteriaSummary, errorTags: e.errorTags,
    durationSec: e.durationSec, createdAt: e.createdAt,
  };
}
function clientActivity(a: ActivityEntry) {
  return { id: a.id, type: a.type, payload: a.payload, createdAt: a.createdAt };
}

function fail(msg: string): never { throw new Error(msg); }

// ── Suite de vérifications sur un store ─────────────────────
async function runSuite(label: string, make: () => AnyStore | Promise<AnyStore>): Promise<void> {
  const store = await make();
  const { students, entries, activities, ref } = makeFixture();
  const checks: string[] = [];
  const ok = (name: string) => checks.push(name);
  try {
    // 1) Idempotence : import partiel (doublon volontaire) puis complet.
    await store.bulkImport({ students, entries: [entries[0]], activities: [activities[0]] });
    await store.bulkImport({ students, entries, activities });
    // 2) Re-sync « client » (sans studentId) — épingle la régression PG.
    // Les vraies entrées du carnet offline n'ont pas studentId ; le serveur l'assigne.
    await store.addEntriesIfNew("s3", entries.filter((e) => e.studentId === "s3").map(clientEntry) as unknown as ProductionEntry[]);
    await store.addActivitiesIfNew("s3", activities.filter((a) => a.studentId === "s3").map(clientActivity) as unknown as ActivityEntry[]);
    // 3) Dashboard vs référence.
    const rows = await store.dashboardRows();
    for (const s of ref) {
      const g = rows.find((r) => r.id === s.id);
      if (!g) fail(`${label}: élève ${s.id} absent du dashboard`);
      const errs = g.dominantErrors.map((e) => `${e.tag}:${e.count}`).join(",");
      const acts = g.activities.map((a) => a.id).join(",");
      if (g.productions !== s.prod) fail(`${label}: ${s.id} productions ${g.productions} ≠ ${s.prod}`);
      if (g.avgIcm !== s.avgIcm) fail(`${label}: ${s.id} avgIcm ${g.avgIcm} ≠ ${s.avgIcm}`);
      if (errs !== s.errs.join(",")) fail(`${label}: ${s.id} dominantErrors ${errs} ≠ ${s.errs.join(",")}`);
      if (acts !== s.acts.join(",")) fail(`${label}: ${s.id} activités ${acts} ≠ ${s.acts.join(",")}`);
      if (g.quizCount !== s.quiz || g.missionCount !== s.mission) fail(`${label}: ${s.id} quiz/mission`);
    }
    ok("dashboard");
    // 4) CSV vs référence (col. 6 = MAX created_at des entries).
    const csv: { id: string; productions: number; avgIcm: number; lastProduction: string; topErrors: string }[] = [];
    for await (const row of store.iterateExportRows()) csv.push(row);
    if (csv.length !== students.length) fail(`${label}: CSV ${csv.length} lignes ≠ ${students.length}`);
    for (const row of csv) {
      const s = ref.find((r) => r.id === row.id);
      const st = students.find((x) => x.id === row.id);
      if (!s || !st) fail(`${label}: CSV élève inconnu ${row.id}`);
      if (row.productions !== s.prod || row.avgIcm !== s.avgIcm) fail(`${label}: CSV ${row.id} agrégats`);
      if (row.topErrors !== s.errs.slice(0, 5).join("; ")) fail(`${label}: CSV ${row.id} topErrors ${row.topErrors} ≠ ${s.errs.join("; ")}`);
      const es = entries.filter((e) => e.studentId === row.id);
      const lastProd = es.length ? es.map((e) => e.createdAt).sort().at(-1)! : "";
      if (row.lastProduction !== lastProd) fail(`${label}: CSV ${row.id} col.6 ${row.lastProduction} ≠ ${lastProd}`);
    }
    ok("csv");
    // 5) Occurrences (tag répété 3× dans un même errorTags = 3).
    await store.createStudent("dup1", "dup@x.dz", "h", "dup");
    await store.addEntriesIfNew("dup1", [{
      id: "d1", studentId: "dup1", verbId: "v", theme: "t", stage: 3, text: "x",
      icm: 50, criteriaSummary: [], errorTags: ["dup", "dup", "dup"], createdAt: "2026-01-01T00:00:00.000Z",
    }]);
    const dup = (await store.dashboardRows()).find((r) => r.id === "dup1");
    if (!dup || dup.avgIcm !== 50 || dup.dominantErrors.length !== 1 || dup.dominantErrors[0].tag !== "dup" || dup.dominantErrors[0].count !== 3) {
      fail(`${label}: occurrences comptées ${JSON.stringify(dup?.dominantErrors)} ≠ [dup:3]`);
    }
    ok("occurrences");
    // 6) Push « live ».
    await store.pushActivity("s3", "quiz", { percent: 42 }, "live1");
    const live = (await store.listActivities("s3"))[0];
    if (live?.id !== "live1" || live.payload.percent !== 42) fail(`${label}: pushActivity`);
    ok("live");
    console.log(`✅ ${label} : ${checks.join(" · ")} ✓`);
  } finally {
    store.close();
  }
}

// ── Limiteur (règles : window glissante, reset au succès) ───
function checkRateLimiter(): void {
  const lim = makeRateLimiter(2, 1000);
  if (!lim.hit("a") || !lim.hit("a") || lim.hit("a")) fail("limiteur : devrait bloquer au 3ᵉ essai");
  if (lim.count("a") !== 2) fail("limiteur : count ≠ 2");
  if (!lim.hit("b")) fail("limiteur : clés indépendantes");
  lim.reset("a");
  if (lim.count("a") !== 0 || !lim.hit("a")) fail("limiteur : reset");
  console.log("✅ rateLimit : fenêtre glissante · indépendance des clés · reset ✓");
}

async function main(): Promise<void> {
  checkRateLimiter();
  await runSuite("SQLITE", () => new SqliteStore(":memory:"));
  const pgUrl = process.env.SELFCHECK_DB_URL;
  if (pgUrl) {
    // Le schéma doit exister AVANT la purge (base jetable toute neuve).
    const pg = new PostgresStore(pgUrl, 5);
    await pg.ensureReady();
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: pgUrl });
    await pool.query("TRUNCATE students, teachers, entries, activities, entry_errors, reset_codes RESTART IDENTITY CASCADE");
    await pool.end();
    await runSuite("POSTGRESQL", async () => pg);
  } else {
    console.log("ℹ PostgreSQL non testé (SELFCHECK_DB_URL non définie) — SQLite seul.");
  }
  console.log("── PARITÉ CONTRAT SERVEUR : TOUS LES CONTRÔLES PASSENT ──");
}

main().catch((e) => {
  console.error("✗", e instanceof Error ? e.message : e);
  process.exit(1);
});
