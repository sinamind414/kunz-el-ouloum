# Constats ouverts (relevés le 2026-10-26, non corrigés)

> Lu depuis `AGENTS.md`. Problèmes **réels** découverts pendant la réorganisation,
> hors de son périmètre. Classés par gravité. Supprimer une ligne quand elle est réglée,
> avec la preuve dans le commit.

| # | Gravité | Constat | Preuve | Qui décide |
|---|---|---|---|---|
| 1 | haute | Deux livres sous droits (L1 `الكتاب_المصحح_v1.0.md`, L2 `504601676-…txt`) sont versionnés dans un dépôt **public**, contre la règle de `docs/sources/README.md` | `git ls-files uploads_externes/` ; dépôt `private: false` | propriétaire (retrait = réécriture d'historique) |
| 2 | haute | CI `master` rouge (vitest, jest, `npm test`) sur les runs 259-261, alors que les commits annoncent des suites vertes | `server/store.pg.dates.test.ts` dépend du fuseau (passe en `TZ=Africa/Algiers`, échoue en UTC) — voir `TESTS_ET_CI.md` | correction du test |
| 3 | moyenne | `README.md` annonce « 100 % gratuite » alors que le freemium (essai 30 j, abonnement 1200 DA, codes) est en production | `src/server/facturation.ts`, `src/utils/acces.ts` | propriétaire (texte public) |
| 4 | moyenne | ESLint : 1 erreur (`no-empty-object-type`) alors que la règle du dépôt est « 0 erreur » | `src/utils/acces.ts:192` | correction simple |
| 5 | basse | En-tête de `src/server/facturation.ts` : « Unité 1 gratuite » ; code client : unités 1-5 (`UNITES_GRATUITES`) | décision du 25/10/2026 | mise à jour du commentaire |
| 6 | basse | Générateurs non exécutables depuis le dépôt : `book_to_json.py` (chemins Windows), `build_okacha.py` (source absente), `build_bac_exam.py` (sortie `bacExam.ts` absente) | `DONNEES_GENEREES.md` | — |
| 7 | basse | Chiffres de tests du `README.md` (18/10) périmés : 314 fichiers / 3 675 tests vitest aujourd'hui | `TESTS_ET_CI.md` | mise à jour du README |
| 8 | basse | Deux lockfiles (`package-lock.json` qui fait foi, `bun.lock` reliquat) | CI = `npm ci` | propriétaire |
| 9 | info | `docs/` mélange spécifications vivantes et audits datés ; non déplacés car une trentaine de fichiers du code citent leur chemin (dont `src/App.tsx`, protégé) | `git grep "docs/"` | — |
