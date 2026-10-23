import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes } from "node:crypto";
import { openStore, SqliteStore } from "./server/store";
import { DegradedStore, openStoreOrDegrade } from "./server/store.degraded";
import { resoudreSecret } from "./server/secret";
import { avertissementProxy } from "./server/proxyConfiance";
import { PostgresStore, migrateJsonFilesToPostgres } from "./server/store.pg";
import { resumeActivite, calculeActivite } from "./server/activite";
import { mesurerPilotage } from "./src/server/mesurePilotage";
// Marque de traçabilité : MÊME fonction que celle apposée dans les documents
// exportés (images, PDF imprimés). C'est ce qui permet au professeur de
// remonter d'un document qui circule jusqu'à l'élève — colonne `marque` du CSV.
import { marqueDepuisIdentite } from "./src/utils/marque";
// Assainissement des entrées élève (A2, 14/10/2026). Avant : le serveur stockait
// `icm`, `stage` et `createdAt` EXACTEMENT tels que l'appareil les envoyait —
// une note de 9999 sur une échelle de 0 à 100 entrait dans la moyenne du
// professeur, et une date de 2030 rendait un élève « actif » pour toujours.
import { assainirEntrees, assainirActivites, fusionnerRefus } from "./src/server/assainirEntrees";
import {
  PRIX_SAISON_DA,
  UNITE_GRATUITE,
  activerAbonnement,
  analyserAcces,
  appareilAutorise,
  type StoreFacturation,
} from "./src/server/facturation";
import { makeRateLimiter } from "./server/rateLimit";
// H2 (2026-10-14) — pages publiques exigées par une publication en magasin :
// politique de confidentialité lisible sans JavaScript, et Digital Asset Links
// pour l'application Android (TWA).
import { rendrePolitiqueHtml } from "./src/server/politiqueHtml";
import { verifierAssetLinks } from "./src/server/assetLinks";
// H2 bis (2026-10-14) — INSCRIPTION SANS ADRESSE E-MAIL : l'élève reçoit un code
// de connexion court + un code secret à 6 chiffres. Voir src/server/codeEleve.ts
// pour le raisonnement complet et les limites de sécurité assumées.
import { codeDepuisIdentifiant, resoudreIdentifiant } from "./src/server/codeEleve";
import {
  connecterParIdentifiant,
  donneesPubliques,
  inscrireSansEmail,
  validerNouveauSecret,
} from "./src/server/inscriptionSansEmail";
import { readFileSync } from "node:fs";
import { makeStudentAuth, makeTeacherAuth } from "./server/auth";
import type { ProductionEntry, ActivityEntry, DashboardStudentRow } from "./server/store";

dotenv.config();
// Sécurité : en production, pas de secret ⇒ refus de démarrer (un secret par
// défaut rendrait tous les jetons forgeables). En développement, un secret
// éphémère est tiré au hasard — voir server/secret.ts (sprint 59).
let JWT_SECRET: string;
try {
  const resolution = resoudreSecret(process.env);
  JWT_SECRET = resolution.secret;
  if (resolution.avertissement) console.warn(resolution.avertissement);
} catch (e) {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
}

/**
 * Clé de quota de connexion : identifiant interne (`<code>@eleve.local`) pour
 * un code de connexion, e-mail en minuscules sinon. Deux formes de saisie
 * d'un même code doivent compter sur le même quota — sinon on peut deviner
 * un code secret à 6 chiffres en variant les tirets et la casse.
 */
const cleQuotaConnexion = (raw: unknown): string => resoudreIdentifiant(raw) || "?";

/** Email canonique : trim + minuscules — évite test@x ≠ Test@x (2 comptes). */
const normalizeEmail = (raw: unknown): string =>
  typeof raw === "string" ? raw.trim().toLowerCase() : "";

/** Politique de mot de passe (miroir du minLength={6} des formulaires). */
const MIN_PASSWORD_LEN = 6;
const isWeakPassword = (password: unknown): boolean =>
  typeof password !== "string" || password.length < MIN_PASSWORD_LEN;

/** Cellule CSV sûre : neutralise l'injection de formules Excel (=, +, -, @). */
const csvCell = (v: unknown): string => {
  const s = String(v ?? "");
  return /^[=+\-@]/.test(s) ? `'${s}` : s;
};

// ── Garde-fou async : Express 4 ne rattrape PAS les promesses rejetées ──
// Une erreur non catchée dans une route async devenait unhandledRejection →
// arrêt du process (crash confirmé : export CSV avec CRLF dans studentId).
// asyncHandler la redirige vers le handler d'erreurs final (500 JSON).
type AsyncRoute = (req: Request, res: Response) => Promise<unknown>;
const asyncHandler =
  (fn: AsyncRoute) =>
  (req: Request, res: Response, next: express.NextFunction): void => {
    Promise.resolve(fn(req, res)).catch(next);
  };

// ── Limiteurs (fenêtre glissante, en mémoire — voir server/rateLimit.ts) ──
// Par IP : anti-spam (généreux — une école partage souvent 1 IP publique).
const IP_LIMIT = 60;
// Par COMPTE : 5 échecs / 15 min, remis à zéro après une connexion réussie
// (une école derrière un NAT n'est jamais bloquée en bloc).
const ACCOUNT_LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;
const ipLimiter = makeRateLimiter(IP_LIMIT, WINDOW_MS);
const loginAccountLimiter = makeRateLimiter(ACCOUNT_LIMIT, WINDOW_MS);
// Reset mot de passe : 10 essais / 15 min / IP — la force brute d'un code
// à 8 symboles (32^8 ≈ 1,1e12) devient hors d'atteinte.
const resetCodeLimiter = makeRateLimiter(10, WINDOW_MS);
// Activation de licence : 10 essais / 15 min / compte — un élève qui se
// trompe cinq fois de code a le temps de le relire ; les tentatives en
// rafale (« essayer tous les codes ») sont coupées tôt.
const activationLimiter = makeRateLimiter(10, WINDOW_MS);

// ── Code de réinitialisation : CSPRNG (Math.random était prévisible) ──
const RESET_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 symboles, sans O/0/I/1
function generateResetCode(): string {
  const bytes = randomBytes(8); // 256 % 32 = 0 → aucune biais de modulo
  let code = "";
  for (let i = 0; i < 8; i++) code += RESET_ALPHABET[bytes[i] % RESET_ALPHABET.length];
  return code;
}

// ── Cache du tableau de bord (30 s, invalidé à chaque écriture) ──
const DASH_TTL_MS = 30_000;
let dashCache: { at: number; data: DashboardStudentRow[] } | null = null;
async function dashboardRows(store: Store): Promise<DashboardStudentRow[]> {
  const now = Date.now();
  if (dashCache && now - dashCache.at < DASH_TTL_MS) return dashCache.data;
  dashCache = { at: now, data: await store.dashboardRows() };
  return dashCache.data;
}
function invalidateDashboard(): void { dashCache = null; }

// ── Backend de persistance : PostgreSQL si DATABASE_URL, sinon SQLite ──
// `DegradedStore` (sprint 58) fait partie du type : le serveur doit pouvoir
// démarrer sans persistance plutôt que de refuser de servir l'application.
export type Store = SqliteStore | PostgresStore | DegradedStore;

/** Vrai quand la persistance est indisponible (comptes désactivés). */
export function storeEstDegrade(store: Store): store is DegradedStore {
  return (store as DegradedStore).degraded === true;
}

/** Ouvre le backend ; migre les JSON hérités (v1) si le backend est vide. */
async function selectStore(): Promise<Store> {
  const url = process.env.DATABASE_URL || process.env.KUNZ_DB_URL;
  const studentsJson = path.join(process.cwd(), "data", "students.json");
  const teachersJson = path.join(process.cwd(), "data", "teachers.json");
  if (url) {
    console.log(`[store] backend PostgreSQL : ${url.replace(/:[^:@]+@/, ":***@")}`);
    const pg = new PostgresStore(url);
    await pg.ensureReady();
    // Migration JSON → PG (idempotente, uniquement si base vide).
    if (await migrateJsonFilesToPostgres(pg, studentsJson, teachersJson)) {
      console.log("[store] JSON migré vers PostgreSQL (élèves/productions/activités/enseignants)");
    }
    return pg;
  }
  console.log("[store] backend SQLite (aucune DATABASE_URL)");
  // Sprint 58 : un binaire natif manquant ne doit plus empêcher l'application
  // de démarrer — voir server/store.degraded.ts.
  return openStoreOrDegrade(() => openStore(process.env.KUNZ_DB_FILE));
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Derrière nginx/Caddy : TRUST_PROXY=1 → req.ip = IP réelle de l'élève.
  if (process.env.TRUST_PROXY === "1") {
    app.set("trust proxy", 1);
    // Journalisé une fois au démarrage : sans proxy réel devant, X-Forwarded-For
    // est forgeable et les limiteurs d'IP sont contournables (audit externe
    // 15/10/2026). Le compose officiel lie le port sur 127.0.0.1 pour rendre
    // cette forge impossible par construction.
    const alerteProxy = avertissementProxy();
    if (alerteProxy) console.log(alerteProxy);
  }

  const store = await selectStore();

  // Limite explicite : la file de synchro offline peut envoyer jusqu'à 100
  // productions longues (> 100 kB = 413 de l'ancien défaut Express → deadlock
  // du flush). 2 marge : lot max << 2 Mo, et le client coupe sur 413 (file d'A.).
  app.use(express.json({ limit: "2mb" }));

  // ── En-têtes de sécurité ────────────────────────────────────────
  // CSP modérée : 'unsafe-inline' est OBLIGATOIRE (les 25 leçons HTML
  // statiques utilisent ~514 handlers on* + <script> inline). Ce que la
  // CSP bloque ici : TOUT domaine externe non listé (exfiltration de
  // données, scripts/feuilles externes injectés).
  // B8 (2026-10-17) : Google Fonts RETIRÉ de la CSP — les polices (Noto
  // Kufi Arabic, Work Sans, licence OFL) sont auto-hébergées dans
  // public/fonts/ et servies depuis 'self' (src/index.css : @font-face
  // locaux, zéro requête sortante). La promesse « aucune requête ne quitte
  // le téléphone » redevient conforme à la configuration réelle.
  //
  // CADRAGE (aperçu, 14/10/2026) — par défaut l'application REFUSE d'être
  // affichée dans un cadre (X-Frame-Options: DENY + frame-ancestors 'none') :
  // c'est la protection anti-clickjacking, et elle ne bouge pas en production.
  // Mais l'environnement d'APERÇU sert justement l'application DANS UNE IFRAME :
  // un refus de cadrage y produit un écran blanc, sans aucun message d'erreur
  // visible côté élève. Le mode est donc EXPLICITE et jamais implicite — il faut
  // poser FRAME_ANCESTORS pour ouvrir le cadre, et on n'ouvre QUE pour les
  // ancêtres nommés (jamais « * ») :
  //   FRAME_ANCESTORS='https://<sous-domaines>.e2b.app' npm start
  // (Le sous-domaine est écrit ici sans joker À DESSEIN : deux barres obliques
  //  suivies d'une étoile dans un commentaire font croire aux nettoyeurs de
  //  commentaires du dépôt — les tests de câblage en ont un — qu'un commentaire
  //  de bloc s'ouvre : ils avalent alors le code qui suit. Le joker reste dans la
  //  COMMANDE, jamais dans le code ni dans les commentaires.)
  const ancetresCadre = (process.env.FRAME_ANCESTORS || "").trim();
  // Journalisé UNE fois au démarrage, pas à chaque requête : un log par requête
  // noie la sortie du serveur et ne dit rien de plus.
  if (ancetresCadre) {
    console.log(`[cadrage] iframe autorisée pour : ${ancetresCadre}`);
  } else {
    console.log("[cadrage] refus du cadrage — mode par défaut (production).");
  }

  app.use((req: Request, res: Response, next: express.NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (!ancetresCadre) {
      res.setHeader("X-Frame-Options", "DENY");
    }
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "font-src 'self' data:",
        "img-src 'self' data: blob:",
        "connect-src 'self'",
        "frame-src 'self'",
        ancetresCadre ? `frame-ancestors ${ancetresCadre}` : "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
      ].join("; "),
    );
    if (ancetresCadre) {
      // Aucun X-Frame-Options n'est émis dans ce mode : l'en-tête ne sait pas
      // exprimer une liste d'origines (« ALLOW-FROM » est abandonné partout), et
      // le laisser à DENY annulerait l'autorisation dans les navigateurs qui
      // l'honorent encore. `frame-ancestors` seul dit exactement la même chose,
      // en mieux.
    }
    // HSTS : UNIQUEMENT si la requête arrive chiffrée (HTTPS direct, ou
    // X-Forwarded-Proto: https via trust proxy). Ne JAMAIS l'émettre sur
    // HTTP simple — le navigateur pinnerait HTTPS pour max-age et refuserait
    // tout futur accès HTTP sur le LAN de l'école (app offline-first).
    if (req.secure) {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
  });

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV || "development", offlineMode: true });


  });

  /**
   * Inscription SANS adresse e-mail : nom + code secret à 6 chiffres.
   * Le serveur attribue un CODE DE CONNEXION court (affiché une fois à l'élève,
   * jamais transmis par e-mail — il n'y en a pas). Réponse 201 :
   * `{ token, code: "XXXX-XXXX", student: { id, name } }`.
   *
   * Pourquoi ce chemin existe : exiger une adresse e-mail bloquait la majorité
   * des élèves (cf. src/server/codeEleve.ts). Le mode invité reste possible —
   * ce chemin ajoute la synchronisation et la visibilité pour le professeur,
   * sans rien imposer.
   */
  /** Dépendances réelles (bcrypt + JWT) injectées dans le module testable. */
  const outilsAuth = {
    hacher: (mdp: string) => bcrypt.hash(mdp, 10),
    verifier: (mdp: string, hash: string) => bcrypt.compare(mdp, hash),
    signer: (eleve: { studentId: string; email: string }) =>
      jwt.sign(eleve, JWT_SECRET, { expiresIn: "7d" }),
  };

  app.post("/api/auth/register-code", async (req: Request, res: Response) => {
    try {
      if (!ipLimiter.hit(req.ip || "unknown")) return res.status(429).json({ error: "too_many_attempts" });
      const r = await inscrireSansEmail(store, req.body ?? {}, outilsAuth);
      if (!r.ok) return res.status(r.statut).json({ error: r.erreur });
      invalidateDashboard();
      res.status(r.statut).json({ token: r.token, code: r.eleve.code, student: r.eleve });
    } catch (e) {
      // Course entre deux inscriptions simultanées : la contrainte UNIQUE a
      // parlé en dernier — c'est un conflit, pas une panne serveur.
      const statut = (e as { statusCode?: number }).statusCode;
      if (statut === 409) return res.status(409).json({ error: "code_taken" });
      console.error("[auth] register-code:", e);
      if (storeEstDegrade(store)) return res.status(503).json({ error: "storage_unavailable" });
      res.status(500).json({ error: "server_error" });
    }
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      if (!ipLimiter.hit(req.ip || "unknown")) return res.status(429).json({ error: "too_many_attempts" });
      const { password, name } = req.body;
      const email = normalizeEmail(req.body.email);
      if (!email || !password || !name) {
        return res.status(400).json({ error: "missing_fields" });
      }
      if (isWeakPassword(password)) {
        return res.status(400).json({ error: "weak_password" });
      }
      if (await store.findStudentByEmail(email)) {
        return res.status(409).json({ error: "email_exists" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const student = await store.createStudent(
        `stu_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        email,
        passwordHash,
        name,
      );
      invalidateDashboard();
      const token = jwt.sign({ studentId: student.id, email: student.email }, JWT_SECRET, { expiresIn: "7d" });
      res.status(201).json({ token, student: { id: student.id, email: student.email, name: student.name } });
    } catch (e) {
      // Course inscrits/doublon : UNIQUE(email) → 409 (pas un 500).
      const err = e as { code?: string; message?: string };
      const dup =
        err?.code === "SQLITE_CONSTRAINT_UNIQUE" ||
        err?.code === "23505" ||
        /unique/i.test(err?.message || "");
      res.status(dup ? 409 : 500).json({ error: dup ? "email_exists" : "server_error" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      // Deux populations, une seule porte : l'élève saisit son CODE DE
      // CONNEXION (comptes sans e-mail) ou son adresse e-mail (comptes
      // existants). `resoudreIdentifiant` normalise l'un et l'autre.
      const cle = cleQuotaConnexion(req.body?.identifiant ?? req.body?.email);
      if (!ipLimiter.hit(req.ip || "unknown") || !loginAccountLimiter.hit(cle)) {
        return res.status(429).json({ error: "too_many_attempts" });
      }
      const r = await connecterParIdentifiant(store, req.body ?? {}, outilsAuth);
      if (!r.ok) return res.status(r.statut).json({ error: r.erreur });
      loginAccountLimiter.reset(cle); // succès → compteur remis à zéro
      res.json({ token: r.token, student: r.eleve });
    } catch (e) {
      console.error("[auth] login:", e);
      if (storeEstDegrade(store)) return res.status(503).json({ error: "storage_unavailable" });
      res.status(500).json({ error: "server_error" });
    }
  });

  const studentAuth = makeStudentAuth(JWT_SECRET);

  app.get("/api/auth/me", studentAuth, asyncHandler(async (req: Request, res: Response) => {
    const student = await store.findStudentById((req as any).studentId);
    if (!student) return res.status(404).json({ error: "not_found" });
    // Compte créé sans adresse e-mail : `email` vaut `null` (jamais
    // `<code>@eleve.local`) et le code affichable prend sa place. Compte
    // classique : e-mail normal, pas de code.
    res.json({ student: donneesPubliques(student) });
  }));

  app.post("/api/student/sync", studentAuth, async (req: Request, res: Response) => {
    try {
      const studentId = (req as any).studentId;
      const body = req.body || {};
      const entries: ProductionEntry[] = body.entries || [];
      const events: ActivityEntry[] = body.events || [];
      if ((!Array.isArray(entries) || entries.length === 0) && (!Array.isArray(events) || events.length === 0)) {
        return res.status(400).json({ error: "invalid_payload" });
      }
      // ── LE SERVEUR DÉFINIT LE BARÈME ET L'HORLOGE (A2) ─────────────────────
      // Ce qui est hors barème est REFUSÉ (note hors 0-100, étape hors 1-4,
      // texte démesuré) ; une date future est ramenée à l'heure du serveur ;
      // un lot trop gros est tronqué ET compté. Rien n'est écarté en silence :
      // le client reçoit le détail des refus, et le journal serveur les garde.
      const rapportEntrees = assainirEntrees(entries);
      const rapportActivites = assainirActivites(events);
      const refuses = fusionnerRefus(rapportEntrees.refus, rapportActivites.refus);
      if (Object.keys(refuses).length > 0) {
        console.warn(`[sync] refus pour ${studentId} :`, JSON.stringify(refuses));
      }

      // ⚡ UNE transaction SQL pour tout le lot (upsert « si absent » — idempotent).
      const addedEntries = await store.addEntriesIfNew(studentId, rapportEntrees.acceptees);
      const addedEvents = await store.addActivitiesIfNew(studentId, rapportActivites.acceptees);
      const synced = addedEntries + addedEvents;
      if (synced > 0) invalidateDashboard();
      res.json({
        ok: true,
        synced,
        // Un élève dont tout le lot est refusé doit le VOIR : un succès muet lui
        // ferait croire que son travail est enregistré côté professeur.
        refuses,
        total: await store.countEntries(studentId),
        totalEvents: await store.countActivities(studentId),
      });
    } catch {
      res.status(500).json({ error: "server_error" });
    }
  });

  app.get("/api/student/entries", studentAuth, asyncHandler(async (req: Request, res: Response) => {
    res.json({ entries: await store.listEntries((req as any).studentId) });
  }));

  // ── Facturation (modèle propriétaire 24/10/2026, voir src/server/facturation.ts) ──
  /** Date de mise en service du paywall : aucun essai ne démarre avant elle. */
  const LANCEMENT_PAYWALL = (process.env.KUNZ_PAYWALL_LANCEMENT || "2026-10-23").trim();
  /** Le store dégradé ne sait pas facturer : réponse explicite, jamais un crash. */
  function storeFacturation(store_ : typeof store): StoreFacturation | null {
    if (storeEstDegrade(store_)) return null;
    return store_ as unknown as StoreFacturation;
  }

  app.get("/api/billing/entitlement", studentAuth, asyncHandler(async (req: Request, res: Response) => {
    const studentId = (req as any).studentId;
    const student = await store.findStudentById(studentId);
    if (!student) return res.status(404).json({ error: "not_found" });
    const etat = analyserAcces({
      createdAt: student.createdAt,
      lancement: LANCEMENT_PAYWALL,
      abonnementExpireLe: student.abonnementExpireLe ?? null,
      maintenant: new Date(),
    });
    // Liaison appareil (24/10/2026) : un abonnement actif ne vaut que sur les
    // appareils auxquels la licence est attachée (2 max). Un abonnement sans
    // licence liée (achat antérieur) n'est pas puni.
    if (etat.statut === "abonnement") {
      const appareilId = req.header("x-appareil-id") || null;
      const acc = storeFacturation(store);
      if (acc && appareilId) {
        const licence = await acc.licenceDe(studentId);
        if (licence && !appareilAutorise(licence, appareilId)) {
          return res.json({
            statut: "gratuit",
            expireLe: null,
            joursRestants: 0,
            raison: "appareil_non_licencie",
            uniteGratuite: UNITE_GRATUITE,
            prixSaisonDA: PRIX_SAISON_DA,
          });
        }
      }
    }
    res.json({
      ...etat,
      uniteGratuite: UNITE_GRATUITE,
      prixSaisonDA: PRIX_SAISON_DA,
    });
  }));

  app.post("/api/billing/activer", studentAuth, async (req: Request, res: Response) => {
    try {
      const studentId = (req as any).studentId;
      if (!ipLimiter.hit(req.ip || "unknown") || !activationLimiter.hit(studentId)) {
        return res.status(429).json({ error: "too_many_attempts" });
      }
      const acc = storeFacturation(store);
      if (!acc) return res.status(503).json({ error: "storage_unavailable" });
      const r = await activerAbonnement(acc, {
        eleveId: studentId,
        code: req.body?.code,
        appareilId: req.body?.appareilId,
        maintenant: new Date(),
      });
      if (!r.ok) return res.status(r.statut).json({ error: r.erreur });
      res.json({ ok: true, statut: r.statut, expireLe: r.expireLe });
    } catch (e) {
      console.error("[billing] activer:", e);
      if (storeEstDegrade(store)) return res.status(503).json({ error: "storage_unavailable" });
      res.status(500).json({ error: "server_error" });
    }
  });

  const teacherAuth = makeTeacherAuth(JWT_SECRET);

  app.post("/api/teacher/login", async (req: Request, res: Response) => {
    try {
      const { password } = req.body;
      const email = normalizeEmail(req.body.email);
      if (!ipLimiter.hit(req.ip || "unknown") || !loginAccountLimiter.hit(String(email || ""))) {
        return res.status(429).json({ error: "too_many_attempts" });
      }
      const teacher = await store.findTeacherByEmail(email);
      if (!teacher || !(await bcrypt.compare(password, teacher.passwordHash))) {
        return res.status(401).json({ error: "invalid_credentials" });
      }
      loginAccountLimiter.reset(String(email));
      const token = jwt.sign({ email: teacher.email, role: "teacher" }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ token, teacher: { email: teacher.email, name: teacher.name } });
    } catch {
      res.status(500).json({ error: "server_error" });
    }
  });

  app.get("/api/teacher/dashboard", teacherAuth, asyncHandler(async (req: Request, res: Response) => {
    // Agrégats SQL + cache 30 s (invalidé à chaque écriture).
    // resume = activité RÉELLE (7j/30j). NB : comptabilise les INSCRITS only —
    // un invité n'envoie rien (offline by design) et reste donc invisible ici.
    const students = await dashboardRows(store);
    // Compte créé SANS adresse e-mail (14/10/2026) : son `email` est
    // l'identifiant technique `<code>@eleve.local`. Le professeur doit voir le
    // code de connexion de l'élève — jamais cette adresse, qui ne veut rien
    // dire pour lui et n'est pas une adresse joignable.
    const visibles = students.map((s) => ({
      ...s,
      code: codeDepuisIdentifiant(s.email),
      email: codeDepuisIdentifiant(s.email) ? null : s.email,
    }));
    // Pilotage : ce que le serveur sait DÉJÀ (inscriptions, inscrits jamais
    // revenus, délai médian jusqu'à la première trace). Agrégats calculés sur
    // les lignes existantes — aucune donnée nouvelle n'est collectée.
    res.json({
      students: visibles,
      resume: resumeActivite(students),
      pilotage: mesurerPilotage(students),
    });
  }));

  app.get("/api/teacher/entries", teacherAuth, asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.query.studentId as string | undefined;
    if (!studentId) return res.status(400).json({ error: "missing_student_id" });
    res.json({ entries: await store.listEntries(studentId) });
  }));

  app.post("/api/teacher/reset-password", teacherAuth, async (req: Request, res: Response) => {
    try {
      const { studentId } = req.body;
      if (!studentId) return res.status(400).json({ error: "missing_student_id" });
      const student = await store.findStudentById(studentId);
      if (!student) return res.status(404).json({ error: "student_not_found" });
      const code = generateResetCode(); // CSPRNG — voir generateResetCode()
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      await store.createResetCode(studentId, code, expiresAt);
      res.json({ code, expiresAt });
    } catch {
      res.status(500).json({ error: "server_error" });
    }
  });

  app.post("/api/student/reset-password", async (req: Request, res: Response) => {
    try {
      // Anti force brute du code (le code EST l'auth — pas de session) :
      if (!resetCodeLimiter.hit(req.ip || "unknown")) {
        return res.status(429).json({ error: "too_many_attempts" });
      }
      const { code, password } = req.body;
      if (!code || !password) return res.status(400).json({ error: "missing_fields" });
      // Politique AVANT toute consommation du code (un mot de passe faible
      // ne doit pas brûler le jeton de reset).
      if (isWeakPassword(password)) return res.status(400).json({ error: "weak_password" });
      const resetCode = await store.findUsableResetCode(code);
      if (!resetCode) return res.status(400).json({ error: "invalid_or_used_code" });
      if (new Date(resetCode.expiresAt).getTime() < Date.now()) {
        await store.markResetUsed(code);
        return res.status(400).json({ error: "expired_code" });
      }
      const student = await store.findStudentById(resetCode.studentId);
      if (!student) return res.status(404).json({ error: "student_not_found" });
      // Un compte SANS adresse e-mail doit garder un secret à 6 chiffres :
      // sinon il devient impossible à saisir depuis l'écran « بالرمز » (pas
      // d'adresse de secours) — verrouillage définitif de l'élève.
      // Refus AVANT markResetUsed : le code du professeur n'est pas brûlé.
      const secret = validerNouveauSecret(student, password);
      if (!secret.ok) return res.status(secret.statut).json({ error: secret.erreur });
      const passwordHash = await bcrypt.hash(password, 10);
      await store.updateStudentPassword(student.id, passwordHash);
      await store.markResetUsed(code);
      invalidateDashboard();
      res.json({ ok: true });
    } catch {
      res.status(500).json({ error: "server_error" });
    }
  });

  app.post("/api/student/activity", studentAuth, async (req: Request, res: Response) => {
    try {
      const studentId = (req as any).studentId;
      const { type, payload } = req.body;
      if (!type || !payload) return res.status(400).json({ error: "missing_fields" });
      await store.pushActivity(
        studentId,
        type,
        payload,
        `act_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      );
      invalidateDashboard();
      res.json({ ok: true });
    } catch {
      res.status(500).json({ error: "server_error" });
    }
  });

  app.get("/api/teacher/export/csv", teacherAuth, asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.query.studentId as string | undefined;
    // Assainissement : un seul caractère CRLF dans studentId faisait planter
    // tout le process (ERR_INVALID_CHAR sur Content-Disposition — crash confirmé).
    const safeId = studentId ? String(studentId).replace(/[^\w.-]/g, "_").slice(0, 64) : "";
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="boussole-export-${safeId || "all"}.csv"`);
    res.write("\uFEFF"); // BOM → Excel ouvre l'arabe correctement
    // Colonne « code » et non « email » : une part croissante des élèves
    // n'a pas d'adresse — ce qui les identifie, c'est leur code de connexion.
    res.write(["student_id", "name", "code", "marque", "productions", "avg_icm", "last_production", "top_errors", "last_activity", "actif_7j", "actif_30j"].join(";") + "\n");
    if (studentId) {
      // Un seul élève : même forme de ligne (petit volume).
      const entries = await store.listEntries(studentId);
      // await OBLIGATOIRE : sur PostgreSQL listActivities est asynchrone —
      // sans lui, acts.map plantait (Promise.map) — bug découvert par l'audit.
      const acts = await store.listActivities(studentId);
      const act = calculeActivite([entries.map((e) => e.createdAt), acts.map((a) => a.createdAt)].flat());
      const avgIcm = entries.length ? Math.round(entries.reduce((s, e) => s + (Number(e.icm) || 0), 0) / entries.length) : 0;
      const dominantErrors = entries.flatMap((e) => e.errorTags).reduce<Record<string, number>>((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});
      const topErrors = Object.entries(dominantErrors).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tag, count]) => `${tag}:${count}`).join("; ");
      const student = await store.findStudentById(studentId);
      // Cellule CSV : pas de sauts de ligne dans une ligne non quotée (RFC 4180).
      const cellId = String(studentId).replace(/[\r\n]+/g, " ");
      // Vraie dernière production (listEntries est trié created_at DESC) —
      // l'ancienne valeur = date d'inscription contredisait le dashboard.
      const lastProduction = entries[0]?.createdAt || "";
      res.write([csvCell(cellId), csvCell(student?.name || ""), csvCell((codeDepuisIdentifiant(student?.email || "") ?? student?.email) || ""), csvCell(marqueDepuisIdentite(studentId) || ""), String(entries.length), String(avgIcm), csvCell(lastProduction), csvCell(topErrors), csvCell(act.lastActivity || ""), act.actif7j ? "1" : "0", act.actif30j ? "1" : "0"].join(";") + "\n");
    } else {
      // Streaming : itérateur SQL — 300 000 lignes sans jamais tout charger en RAM.
      for await (const row of store.iterateExportRows()) {
        res.write([csvCell(row.id), csvCell(row.name), csvCell(codeDepuisIdentifiant(row.email) ?? row.email), csvCell(marqueDepuisIdentite(row.id) || ""), String(row.productions), String(row.avgIcm), csvCell(row.lastProduction || ""), csvCell(row.topErrors), csvCell(row.lastActivity || ""), row.actif7j ? "1" : "0", row.actif30j ? "1" : "0"].join(";") + "\n");
      }
    }
    res.end();
  }));

  async function ensureTeacher() {
    const email = normalizeEmail(process.env.ADMIN_EMAIL);
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) return;
    if (await store.findTeacherByEmail(email)) return;
    const hash = bcrypt.hashSync(password, 10);
    await store.createTeacher(email, hash, email.split("@")[0]);
  }

  // ── Politique de confidentialité : page HTML AUTONOME (aucun JavaScript) ──
  // Google Play exige une URL publique. Rendue depuis `src/data/politiqueConfidentialite.ts`
  // (source unique, déjà verrouillée par test) : pas de deuxième texte à maintenir.
  // Sans JavaScript et dans les deux langues, parce qu'un relecteur non arabophone
  // doit pouvoir la vérifier — c'est un motif classique de rejet sinon.
  app.get("/privacy", (req: Request, res: Response) => {
    const hote = req.get("host") ?? "";
    const protocole = req.protocol === "https" ? "https" : "http";
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(rendrePolitiqueHtml({ urlPublique: hote ? `${protocole}://${hote}/privacy` : "" }));
  });

  // ── Digital Asset Links : ce qui efface la barre d'adresse de la TWA ──
  // Règle : un gabarit non renseigné n'est PAS servi (404 + journal). Servir un
  // placeholder ferait échouer la vérification Android sans que personne ne
  // comprenne pourquoi — mieux vaut une erreur explicite qu'un fichier inutile.
  app.get("/.well-known/assetlinks.json", (_req: Request, res: Response) => {
    let contenu: string | null = null;
    try {
      contenu = readFileSync(path.join(process.cwd(), "store", "assetlinks.json"), "utf-8");
    } catch {
      contenu = null;
    }
    const verdict = verifierAssetLinks(contenu);
    if (verdict.statut !== "valide") {
      console.warn(`[assetlinks] non servi (${verdict.statut}) : ${verdict.message}`);
      return res.status(404).json({ error: "assetlinks_unavailable", raison: verdict.statut });
    }
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.send(JSON.stringify(verdict.json));
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    /**
     * GARDE-FOU DE PUBLICATION (trouvé le 14/10/2026, vérifié par requête HTTP).
     *
     * `express.static(distPath)` servait TOUT `dist/`, y compris le bundle
     * serveur ET sa source map : `GET /server.cjs.map` répondait 200 avec
     * 202 Ko de JSON contenant le TypeScript d'origine (auth, limiteurs,
     * génération des codes, commentaires de sécurité inclus). N'importe qui
     * pouvait donc lire le code du serveur en une commande.
     *
     * Les fichiers serveur n'ont aucune raison d'être téléchargeables : le
     * client n'en a besoin d'aucun. On les refuse explicitement, AVANT le
     * statique, avec un journal clair plutôt qu'un silence.
     */
    const INTERDITS = /(^|\/)(server\.(c?js|mjs|ts)|.*\.map|package(-lock)?\.json|tsconfig.*\.json|\.env.*|\.git.*)$/i;
    app.use((req: Request, res: Response, next: express.NextFunction) => {
      const chemin = decodeURIComponent(req.path).replace(/\\/g, "/");
      if (chemin.includes("..") || INTERDITS.test(chemin)) {
        console.warn(`[static] bloqué (fichier serveur/internes) : ${chemin}`);
        return res.status(404).json({ error: "not_found" });
      }
      next();
    });
    app.use(express.static(distPath, { index: false, dotfiles: "deny" }));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // ── Handler d'erreurs final (4 params) : 500 JSON, jamais de stack, jamais de crash ──
  app.use((err: unknown, _req: Request, res: Response, _next: express.NextFunction) => {
    console.error("[server] erreur non rattrapée:", err);
    if (!res.headersSent) res.status(500).json({ error: "server_error" });
  });

  // Filet de sécurité : une rejection hors des routes (edge non couverte par
  // asyncHandler) est LOGGUÉE au lieu d'arrêter le process (défaut Node ≥ 15).
  process.on("unhandledRejection", (reason) => {
    console.error("[server] unhandledRejection:", reason);
  });

  await ensureTeacher();

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`[Kunz El Ouloum Server] Running on http://localhost:${PORT} (Offline Mode)`);
  });
}

startServer();
