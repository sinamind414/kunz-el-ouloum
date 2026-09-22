# 🔍 Rapport d'audit qualité — Kunz El Ouloum (SVT BAC DZ)

**Date :** 2026-09-22 · **Branche :** `arena/01a0c955-kunz-el-ouloum` · **Commit :** `b8b86ab`

---

## 1. Méthodologie

| Contrôle | Résultat |
|---|---|
| `tsc --noEmit` (typage complet) | ✅ **0 erreur** |
| `tsc -p tsconfig.v2.json` (noyau méthodologique) | ✅ **0 erreur** |
| `npm run build` (vite + esbuild) | ✅ **OK** (13,3 s) — 1 avertissement chunk |
| `npx vitest run` | ✅ **973 tests verts** / 4 skippés / 74 fichiers |
| `npm test` (harnais natif boussole) | ✅ **138 tests verts** |
| Smoke-test runtime du serveur (19 scénarios API) | ❌ **6 bugs confirmés** |
| Revue de code (serveur, auth, synchro client) | ❌ **bugs critiques confirmés** |
| `npm audit` | ⚠️ **7 vulnérabilités** (3 high, 4 moderate) |
| Revue CI / hygiène dépôt | ⚠️ lacunes |

**Note globale : 6,5/10** — base saine et très testée, mais **la fonctionnalité « comptes élèves » est neutralisée par un bug critique**, et le serveur peut être mis à mort par une requête unique.

---

## 2. 🐞 BUG CRITIQUE — Le token est effacé immédiatement après chaque login

**Impact : toute la synchro serveur (dashboard enseignant, suivi des comptes) est morte en production.**

`src/utils/api.ts:39-41` :

```ts
export async function fetchMe() {
  return request('/api/auth/me');   // ← AUCUN header Authorization !
}
```

`src/components/StudentAccountBar.tsx:21-27` :

```ts
useEffect(() => {
  const token = getApiToken();
  if (!token) return;
  fetchMe()
    .then((data) => setStudent(data.student))
    .catch(() => setApiToken(null));   // ← 401 → SUPPRIME le jeton
}, []);
```

**Chaîne des faits (reproduite) :**

1. L'élève se connecte → `setApiToken(token)` stocke le JWT.
2. `studentEmail` est défini → `StudentAccountBar` se monte → appelle `fetchMe()`.
3. Le serveur répond `401 {"error":"missing_token"}` (preuve : `curl /api/auth/me` sans en-tête → 401 ; avec le token → 200).
4. Le `.catch(() => setApiToken(null))` **efface le jeton**.
5. `flushActivityQueue()` (src/utils/activityLog.ts:117) voit `token === null` → « mode invité : rien ne quitte l'appareil » → **rien n'est jamais envoyé au serveur**.

**Bug n° 1 bis — la session n'est pas restaurée au rechargement :** `studentName` / `studentEmail` (App.tsx:74-75) ne sont que dans `useState`, jamais persistés. Après F5, l'UI affiche « ضيف » / bouton de login alors qu'un JWT de 7 jours existe (ou aurait dû exister).

**Correction :**
```ts
export async function fetchMe() {
  return request('/api/auth/me', {
    headers: { Authorization: `Bearer ${getApiToken()}` },
  });
}
```
+ persister `{name, email}` dans localStorage et restaurer la session au démarrage (vérifier le token via `/api/auth/me` correctly envoyé).

---

## 3. 🐞 BUG MAJEUR — Une requête CSV met le serveur à mort

**Reproduction confirmée :**

```
GET /api/teacher/export/csv?studentId=%0d%0aX-Evil:1  (avec JWT enseignant)
→ TypeError [ERR_INVALID_CHAR]: Invalid character in header content ["Content-Disposition"]
→ process Node terminé → tous les élèves déconnectés
```

**Cause (server.ts:253-256) :** route `async` **sans try/catch** ; `res.setHeader('Content-Disposition', ...)` interpolle `studentId` brut. Express 4 **ne rattrape pas** les rejets de promesses async → `unhandledRejection` → crash (comportement par défaut de Node ≥ 15).

**Routes sans protection identique :**
- `GET /api/auth/me` (server.ts:134)
- `GET /api/student/entries` (160)
- `GET /api/teacher/dashboard` (184)
- `GET /api/teacher/entries` (192)
- `GET /api/teacher/export/csv` (253)

Une simple erreur SQLite (base verrouillée, JSON corrompu dans `entry_json`) sur n'importe laquelle de ces routes tue le process.

**Correction :** wrapper global Express pour les erreurs async (`asyncHandler`), + `encodeURIComponent`/sanitisation du `studentId` dans l'en-tête, + `app.use(errHandler)`.

---

## 4. 🐞 BUGS SÉCURITÉ (confirmés par tests runtime)

### 4.1 `/api/student/reset-password` sans rate-limit
**Test :** 12 essais → `400 400 400 …` jamais de `429`. Force brute illimitée sur un code à 8 caractères.
De plus le code est généré avec `Math.random()` (server.ts:207) — **pas un CSPRNG**. `crypto.randomBytes()` attendu.

### 4.2 Aucune politique de mot de passe
**Test :** `password: "1"` → `201 Created` ✅ accepté côté register. Côté UI reset, `minLength={6}` existe, mais l'API ne vérifie rien (contournable en curl).

### 4.3 Email non normalisé → doublons de comptes
**Test :**
```
register test@dz.dz  → 201 ✅
register TEST@dz.dz  → 201 ✅ (2ᵉ compte !)
login    TEST@dz.dz  → échec si inscrit en minuscules
```
Ni le client (`StudentAuthView`) ni le serveur ne font `email.trim().toLowerCase()`. L'élève qui re-tape son email avec une autre casse est **bloqué hors de son compte**, et un même élève peut créer N comptes.

### 4.4 Injection de formules Excel (CSV)
Les champs `name`, `email`, `top_errors` sont écrits bruts dans le CSV (`;`). Un nom `=WEBSERVICE("http://…")` s'exécute à l'ouverture Excel côté enseignant. Préfixer les cellules par `'` quand elles commencent par `= + - @`.

### 4.5 En-têtes de sécurité incomplets
Présents : `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection` (obsolète).
Absents : **CSP**, **Referrer-Policy**, **Permissions-Policy**, HSTS (à placer au proxy).

---

## 5. 🐞 BUGS DE FIABILITÉ (synchro offline-first)

### 5.1 Deadlock de file d'attente sur 413 (risque réel)
- `express.json()` → limite **100 kB** par défaut. **Test :** production de 200 kB → `413 Payload Too Large` confirmé.
- Côté client, `doFlush()` : `if (!ok) return;` → **garde la file en l'état**, renvoie toujours le même premier lot au prochain flush → **413 → 413 → … éternel**. Aucune réduction de lot sur 413.
- Scénario : élève hors-ligne qui accumule ~50–100 productions longues (analyses arabes) avant de créer son compte → son file ne se vide **jamais**, silencieusement.

**Correction :** `express.json({ limit: '2mb'})` + sur `res.status === 413`, diviser le lot par 2 côté client.

### 5.2 Perte silencieuse au-delà de 100 entrées
**Test :** POST de 150 entries → `{"ok":true,"synced":99,"total":100}` — les 50 dernières sont **jetées sans erreur** (serveur : `entries.slice(0, 100)`). Le client officiel limite à 100 (`BATCH_LIMIT`), donc pas de perte dans le flux nominal, mais le contrat `ok:true` est mensonger pour tout autre client et masque les bugs de batch.

### 5.3 Colonnes CSV incohérentes avec le dashboard
`last_production` dans le CSV contient en réalité **`students.created_at` (date d'inscription)** — choix documenté « fidélité au serveur JSON d'origine » (store.ts, `iterateExportRows`). Résultat : l'enseignant voit une vraie dernière production dans le dashboard et la date d'inscription dans le CSV. Les deux se contredisent.

### 5.4 Bouton « طلب رمز إعادة التعيин » inutilisable pour l'élève
`StudentAccountBar.handleResetRequest` appelle `requestTeacherPasswordReset` = route **`/api/teacher/reset-password` (exige `role: "teacher"`)**. Un élève obtient toujours 401 → message « تعذر الاتصال بالخادم » (faux : le serveur répond). UI trompeuse.

---

## 6. ⚠️ CI, DÉPENDANCES, CONFIG

| Sujet | Détail |
|---|---|
| **CI incomplète** | `.github/workflows/ci.yml` ne lance que `check:v2` (sous-ensemble), `npm test`, `vitest`. **`tsc --noEmit` complet (`npm run lint`) et `npm run build` ne sont PAS dans la CI** → une erreur de typage hors noyau ou un build cassé passe en green. |
| **npm audit** | 7 vulnérabilités : **3 high** (postcss sourceMappingURL/path traversal, nanoid, qs dans express) — `npm audit fix` dispo. |
| **Secrets docker-compose** | `JWT_SECRET: change-moi-64-caracteres-aleatoires`, `ADMIN_PASSWORD: change-moi-strong-123` commités — un déploiement « tel quel » rend les JWT forgeables. |
| **package.json** | `"name": "react-example"`, `"version": "0.0.0"` ; `vite` en double (dependencies + devDependencies). |

---

## 7. 🧹 Hygiène du dépôt & performance

- **171 fichiers non-code trackés à la racine** : 113 `.txt` (audits/états), 36 `.py`, 24 `.patch`, photos perso (`resume manaaa.jpg`, `1789989619234-….jpg`), PDF **16 Mo** (`LIVRE SVT BAC SCOLAIRE OFFICIEL.pdf`), MD 2 Mo. `.git` = 25 Mo.
- **Images dupliquées** : `public/images/` (8,2 Mo) ≈ `public/assets/images/` (11 Mo) — 18 différences seulement → ~8 Mo en double.
- **⚠️ PII** : `504601676-كتاب-العلوم-للطالبة-اكرام-بوزار.txt` (nom d'une élève dans le nom de fichier) + photos probablement personnelles → à retirer de l'historique Git (RGPD / mineurs).
- **Bundle principal : 3 305 kB (gzip 807 kB)** — warning Vite. Lourd pour des connexions mobiles algériennes ; le lazy-loading des phases existe mais le chunk `index` reste énorme (connaissances tuteurs/méthodo intégrées).
- **Code** : 39 × `as any`, 30 × `console.log/warn` hors tests, 0 TODO/FIXME, 0 `eval`, 0 `dangerouslySetInnerHTML` (bon signe).
- Service worker enregistré avec `?v=${Date.now()}` à chaque chargement → re-vérification à chaque visite (non bloquant).

---

## 8. ✅ Points forts

1. **Typage irréprochable** : 0 erreur TypeScript sur les 2 configurations.
2. **973 + 138 tests verts**, verrous d'intégrité (lock tests sur le contenu du livre, curriculum, Bac 2025).
3. **Auth serveur solide** : JWT avec rôles strictement séparés (`studentId` vs `role:"teacher"`) — testé ; bcrypt cost 10 ; refus de démarrage sans `JWT_SECRET` ; rate-limit IP (60/15 min) + par compte (5/15 min, reset au succès) — **vérifié 401×5 → 429**.
4. **SQL paramétré partout** (SQLite + PostgreSQL) — aucune injection trouvée.
5. **Architecture offline-first bien pensée** : file localStorage idempotente (retrait par ID), single-flight flush, migration v1→v2 de la file, BOM UTF-8 pour Excel/Arabe.
6. `.gitignore` exclut BDD, `.env`, copies deudiantes — sauf les fichiers PII mentionnés plus haut.

---

## 9. 📋 Plan de correction priorisé

| # | Sévérité | Bug | Effort |
|---|---|---|---|
| 1 | 🔴 **CRITIQUE** | `fetchMe()` sans Authorization → token effacé après login → synchro morte | **5 min** |
| 2 | 🔴 **CRITIQUE** | Session non persistée au rechargement (`studentEmail` en state seul) | 30 min |
| 3 | 🔴 **HAUT** | Crash serveur : routes async sans try/catch + CRLF dans `Content-Disposition` | 1 h |
| 4 | 🔴 **HAUT** | Rate-limit + `crypto.randomBytes` sur `/api/student/reset-password` | 30 min |
| 5 | 🔴 **HAUT** | Normalisation email (`trim().toLowerCase()`) client + serveur (+ migration des comptes existants) | 1 h |
| 6 | 🟠 **MOYEN** | Politique de mot de passe (min 6–8) sur register/reset | 20 min |
| 7 | 🟠 **MOYEN** | `express.json({limit})` + réduction de lot sur 413 côté client | 45 min |
| 8 | 🟠 **MOYEN** | CSV : échappement formules + vraie `last_production` (ou renommer la colonne) | 45 min |
| 9 | 🟠 **MOYEN** | CI : ajouter `npm run lint` + `npm run build` ; `npm audit fix` | 20 min |
| 10 | 🟡 **BAS** | Bouton reset élève : appeler la bonne route ou le retirer | 30 min |
| 11 | 🟡 **BAS** | Purger le dépôt (fichiers perso, doublons images, PDF hors Git) | 1 h |
| 12 | 🟡 **BAS** | CSP + Referrer-Policy ; secrets docker-compose hors du fichier | 30 min |

---

---

## 10. ✅ État des corrections (mise à jour du même jour)

### Vague 1 — bugs critiques/hauts (#1 à #5) · commit `8f2a0d5`
| # | Bug | État | Preuve |
|---|---|---|---|
| 1 | `fetchMe` sans Authorization → jeton effacé après login | ✅ **corrigé** | header Bearer envoyé ; 401 seule condition de coupure ; tests `StudentAccountBar.session` + `serverFixesAudit` |
| 2 | Session perdue à chaque F5 | ✅ **corrigé** | persistance `boussole_student` + restauration si jeton présent |
| 3 | Crash serveur (CRLF CSV / async non catché) | ✅ **corrigé** | `asyncHandler` + handler d'erreurs + `safeId` ; smoke : CRLF → serveur **vivant** |
| 4 | Reset sans rate-limit + `Math.random()` | ✅ **corrigé** | 10 essais/15 min/IP (429 après 10 prouvé) + `randomBytes` |
| 5 | Email non normalisé (doublons de casse) | ✅ **corrigé** | `TEST@dz.dz` → 409 ; login ` Test@DZ.DZ ` → 200 ; lookup `LOWER(email)` SQLite+PG |

### Vague 2 — bugs moyens (#6 à #9) · commit suivant
| # | Bug | État | Preuve |
|---|---|---|---|
| 6 | Aucune politique de mot de passe | ✅ **corrigé** | `password "1"` → `400 weak_password` (register **et** reset, avant consommation du code) + message UI arabe |
| 7 | Deadlock file 413 (limite 100 kB) | ✅ **corrigé** | `express.json({limit:"2mb"})` + `doFlush` découpe le lot sur 413 (tests wireSync : 40→20→vidée ; 413 sur 1 item = abandon propre) — payload 150 kB → **200** |
| 8 | CSV : formules Excel + `last_production` = inscription | ✅ **corrigé** | `csvCell` préfixe `'` (prouvé `'=HYPERLINK(`) ; colonne = réelle dernière production (`2025-12-01` au lieu du jour d'inscription) |
| 9 | CI sans lint complet ni build ; 7 vulns npm | ✅ **corrigé** | job `quality` (npm run lint + build) ; **`server.ts` ajouté au tsconfig** (n'était type-checké NULLE part) ; `npm audit fix` → **0 vulnérabilité** |

### Bug bonus découvert pendant le fix #8
- **CSV mono-élève cassé sur PostgreSQL** : `store.listActivities()` non `await`é → `Promise.map` → crash. Découvert grâce à l'ajout de `server.ts` au typecheck. Corrigé (`await`), verrouillé par test statique.

### Nouveaux garde-fous tests
- `src/__tests__/serverFixesAudit.test.ts` — 21 verrous statiques/dynamiques sur les 9 correctifs
- `src/components/__tests__/StudentAccountBar.session.test.tsx` — 4 tests de session (401 / réseau / affichage / logout)
- `src/utils/__tests__/wireSync.test.ts` — +2 tests anti-deadlock 413

### Bilan final
`tsc` 0 erreur (serveur inclus) · `check:v2` 0 · **1004 tests vitest verts** · **138 tests natifs** · build OK · **npm audit : 0 vulnérabilité** (7 → 0).

### Reste ouvert (#10 à #12 — mineurs, non traités)
- Bouton « demande de reset » côté élève appelle la route enseignante (UX)
- Hygiène dépôt : fichiers perso/PII, doublons `public/images` vs `public/assets`, PDF 16 Mo
- CSP + Referrer-Policy ; secrets docker-compose hors du fichier ; bundle 3,3 Mo


---

## 11. Verdict

L'application est **techniquement bien construite** (typage, tests, architecture offline, sécurité serveur de base). Les bugs n° 1 à 9 listés dans cet audit sont désormais **corrigés et verrouillés par tests** (voir §10) : la fonctionnalité comptes/suivi fonctionne, le serveur ne peut plus être mis à mort par une requête CSV, et la surface sécurité (rate-limit reset, mots de passe, emails, CSV, vulnérabilités npm) est renforcée.

**Reste les points mineurs #10 à #12 (UX reset, hygiène du dépôt, CSP/perf) avant un passage en production serein.**
