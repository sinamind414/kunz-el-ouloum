# Carte du dépôt — où est quoi

> Lu depuis `AGENTS.md`. But : trouver le bon fichier sans tout ouvrir.
> État au 2026-10-26 (branche `réorganisation-med`).

## Racine (26 fichiers suivis — configuration uniquement)

| Fichier | Rôle |
|---|---|
| `AGENTS.md` | règles non négociables + index de cette documentation |
| `README.md` | présentation publique du produit |
| `GUIDE_FUSION_SYNTHESE_METHODE_SVT_BAC_3AS.md` | **protégé** ; source de `src/data/guideManhajia.ts` (lu par `scripts/build_guide_manhajia.ts` à cette place exacte) |
| `package.json` (**protégé**), `package-lock.json` | dépendances ; `package-lock.json` fait foi (CI = `npm ci`). `bun.lock` est un reliquat non utilisé par la CI |
| `tsconfig.json`, `tsconfig.v2.json` | tsc strict ; `v2` = noyau méthodologique (`npm run check:v2`) |
| `vite.config.ts`, `vite.build-test.config.ts` | build + config vitest ; config des contrôles post-build (`src/build/**`) |
| `jest.config.cjs`, `babel.config.cjs` | second runner (jest) |
| `eslint.config.mjs` | ESLint 9 flat — liste d'exclusions commentée |
| `server.ts` | serveur Express (comptes, facturation, dashboards) |
| `capacitor.config.ts` | APK Android (Capacitor 8.5.3) |
| `vercel.json`, `.vercelignore` | déploiement Vercel (`api/index.mjs` = handler serverless) |
| `Dockerfile`, `docker-compose.yml` | image Node + PostgreSQL |
| `index.html`, `metadata.json` | entrée Vite ; `metadata.json` est lu par `src/store/manifestTwa.test.ts` (ne pas déplacer) |
| `.ignore` | exclut `archive/` des recherches ripgrep / agents |

## Dossiers

| Dossier | Contenu | Poids pour un agent |
|---|---|---|
| `src/` | application React + moteurs (voir `ARCHITECTURE.md`) | fort — cibler |
| `src/data/` | 183 fichiers : corpus, moteurs de données, **fichiers générés**, verrous `*.lock.test.ts` | voir `DONNEES_GENEREES.md` |
| `src/quizCorpus/` | les ~550 QCM, segmentés par domaine (`qcm0-d1a.ts` … ) | lourd (220 Ko le plus gros) |
| `src/server/` | logique serveur testée (facturation, codes élève, assainissement) | — |
| `server/` | persistance : `store.ts` (SQLite), `store.pg.ts` (PostgreSQL), migrations, auth | — |
| `api/` | `index.mjs` — handler Vercel qui charge `dist/server.cjs` | — |
| `scripts/` | générateurs (`build_*`), audits, CLI (`evaluer-copies.ts`, `gen-licences*.ts`) ; `scripts/tools/` **protégé** | — |
| `tests/` | harnais boussole (`boussole.test.ts`) + shims jest | — |
| `public/` | leçons HTML (**protégées**), `miftah.html` (**protégé**), SVG (**protégés**), `bac-sujets/` (28 PDF officiels, ~90 Mo), `sw.js`, `manifest.json` | **ne pas lire en masse** |
| `data/` | JSON servis/analysés : `bookContent.json` (624 Ko), catalogues YouTube, sessions BAC, priorités | lourd |
| `uploads_externes/` | **textes sources bruts** (livres, programme, hosila, okacha, TDM) — voir `SOURCES.md` | très lourd (2 Mo pour `المكتبة_الكاملة_SVT.md`) |
| `docs/` | spécifications, audits, bilans — catalogue : `docs/README.md` | lire à la demande |
| `docs/rapports/` | rapports d'audit/bilan d'octobre 2026, auparavant à la racine | lire à la demande |
| `docs/sources/` | sources L5/L6 commitées + extraits pour la traçabilité du correcteur | — |
| `docs/agents/` | cette documentation pour agents | — |
| `android/` | projet Gradle Capacitor | — |
| `store/` | fiche Play Store, `assetlinks.json` (lu par `src/server/assetLinks.ts`) | — |
| `deploy/` | PM2 + exemple nginx | — |
| `marketing/` | visuels Instagram | — |
| `copies_validation_m3/` | dossier de collecte des 30 copies indépendantes (protocole M3) | — |
| `references/` | analyse de livres (référencée par le dictionnaire) | — |
| `archive/` | **hors produit**, exclu des recherches — voir ci-dessous | ignorer |

## `archive/` — ce qui a été rangé et pourquoi

Rien n'a été supprimé : tout est déplacé avec `git mv` (historique conservé).
Aucun de ces fichiers n'était référencé par le code, les tests, le build ou la CI
(vérifié par `git grep` avant déplacement).

| Sous-dossier | Contenu | Origine |
|---|---|---|
| `archive/medias/` | 5 JPG, 3 ZIP d'audits/propositions (`strategic-svt-module-audit*.zip` : 2 versions **différentes**, md5 distincts) | racine |
| `archive/prototypes-html/` | `al_miftah_final_v6/v7.html`, `al_miftah_v7_mindmap.html`, `animation_synapse_chemicale.html` | racine |
| `archive/spec-kit-boussole/` | `apply_patches.sh`, `verify.sh`, `patches/` (22 patches déjà appliqués), leur `README.md` (ex-`docs/README.md`) | racine + docs |
| `archive/debris/` | `ZONE.txt`, `audit_passive_dump.json`, `tmp-h1.cjs`, `lessonData.ts.bak` (ex-`src/`), `README_generation_40_copies.txt` (ex-`README.txt` racine) | racine + src |

## Fichiers lourds à ne pas ouvrir en entier

`src/data/lessonIndex.ts` (836 Ko, généré), `data/bookContent.json` (624 Ko),
`src/tutorKnowledge.ts` (472 Ko), `src/data/okachaEnriched.ts` (388 Ko, généré),
`src/data/dictionaries/dictionnaire_final.json` (360 Ko), `src/data/okacha.ts` (352 Ko, généré),
`src/data/activeLessons.ts` (240 Ko, protégé), `uploads_externes/*`. Utiliser `grep`/lecture ciblée.

## Données absentes du dépôt (gitignorées)

Les 40 `eleve_*.txt` + `RECAPITULATIF.txt` (corpus de calibration du correcteur),
`docs/copies-bac2025/`, `data/students.db*`, `*.pdf` hors `public/bac-sujets/`,
`public/apk/`. Les scripts et tests qui en dépendent se désactivent (`skipIf`) en leur absence.
