# Serveur de comptes & suivi — guide technique

> App « كنز العلوم » : à 100 % **hors-ligne** côté élève (aucune clé API requise).
> Le serveur n'existe que pour les **comptes** et le **suivi enseignant** (facultatif).

## Architecture (post-migration échelle)

```
server.ts        → Express : routes HTTP (contrat client inchangé)
server/store.ts  → SqliteStore   (better-sqlite3, WAL)   ← DÉFAUT, zéro service externe
server/store.pg.ts → PostgresStore (node-pg, pool)        ← si DATABASE_URL définie
server/rateLimit.ts  → limiteurs en mémoire (testables)
server/verify.ts     → auto-contrôle de parité du contrat (SQLite + PG)
server/migrate.ts    → CLI de migration JSON → SQLite / PostgreSQL
```

**Choix du backend au démarrage** : `DATABASE_URL` (ou `KUNZ_DB_URL`) définie
→ PostgreSQL ; sinon SQLite `data/students.db`. **Contrat HTTP identique**
dans les deux cas (parité testée par `npm run verify:store`).

## Contrat HTTP (inchangé depuis le serveur JSON d'origine)

Auth : **JWT 7 jours** · mots de passe **bcrypt (10 rounds)**, jamais en clair.
Routes : `POST /api/auth/register|login` · `GET /api/auth/me` ·
`POST /api/student/sync|activity|reset-password` · `GET /api/student/entries` ·
`POST /api/teacher/login|reset-password` · `GET /api/teacher/dashboard|entries|export/csv` ·
`GET /api/health`. Le dashboard renvoie **les activités complètes par élève**
(le client recalcule quizCount/missionCount/avgQuizPercent localement).
Export CSV : lignes `;`, **BOM UTF-8** (Excel ouvre l'arabe correctement),
col. `last_production` = date d'**inscription** (comportement d'origine), streaming.

## Garde-fous d'échelle inclus

- **Limiteurs** (fenêtre glissante) : par IP 60/15 min (anti-spam, école
  derrière un NAT partagé) + par compte 5/15 min, **remis à zéro après une
  connexion réussie** (une classe ne bloque jamais en bloc).
- **`TRUST_PROXY=1`** derrière nginx/Caddy : `req.ip` = IP réelle de l'élève.
- **Cache dashboard 30 s**, invalidé à chaque écriture (sync, activity, reset).
- **CSV en streaming** (itérateurs SQL — jamais tout chargé en RAM).
- **Idempotence** : tout re-sync est « insert si absent » par `(student_id, id)`.

## Variables d'environnement

| Variable | Rôle | Défaut |
|---|---|---|
| `PORT` | port HTTP | `3000` |
| `NODE_ENV` | `development` (Vite) / `production` (sert `dist/`) | `development` |
| `KUNZ_DB_FILE` | chemin SQLite | `data/students.db` |
| `DATABASE_URL` / `KUNZ_DB_URL` | **active PostgreSQL** | — |
| `JWT_SECRET` | ⚠️ **à changer en production** | secret local de dev |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | compte enseignant amorcé au 1ᵉʳ démarrage | — |
| `TRUST_PROXY` | `1` derrière un proxy | — |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | **optionnel** — Auth/Télémétrie Supabase | — (100 % hors-ligne) |

## Commandes

```bash
npm run dev              # serveur + Vite (mode développement)
npm run build && npm start           # production (sert dist/)
npm run db:migrate -- data/students.json            # JSON → SQLite
DATABASE_URL=postgres://… npm run db:migrate -- data/students.json   # JSON → PostgreSQL
npm run teacher <email> <password> [nom]            # compte enseignant (backend réel)
npm run verify:store                                # parité contrat (SQLite, mémoire)
SELFCHECK_DB_URL=postgres://… npm run verify:store  # + PostgreSQL (base jetable)
docker compose up -d --build                        # app + PostgreSQL 16 (échelle)
```

## Échelle — quel backend choisir ?

| Charge | Backend recommandé |
|---|---|
| ≤ ~50 000 élèves (un établissement) | **SQLite** (défaut) — dashboard ~2 s à 50k |
| Multi-établissements / gros volumes | **PostgreSQL** (`docker compose up -d --build`) |

Mesures 300 000 élèves (2,4 M productions, 900 k activités) : dashboard **18,4 s**
froid / **0,1 ms** avec cache (conformément au contrat qui renvoie les activités
complètes), CSV **11,7 s** / 300 001 lignes, sync **5,5 ms**. Prévoir ≥ 2 Go de
RAM au serveur pour cette échelle.

## Sécurité (obligatoire en production)

1. `JWT_SECRET` fort et unique ;
2. **HTTPS** (aucun mot de passe en clair sur le réseau) ;
3. `ADMIN_PASSWORD` fort, changé après le premier démarrage ;
4. `TRUST_PROXY=1` **uniquement** derrière un vrai proxy ;
5. Sinon, l'app reste **100 % hors-ligne** : aucune donnée élève ne quitte
   le poste (carnet en localStorage, sync volontaire).
