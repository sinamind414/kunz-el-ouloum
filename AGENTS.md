# AGENTS.md — Règles non négociables + index pour l'agent IA

> Ce fichier est lu automatiquement à chaque session. Il prime sur les habitudes
> génériques de l'agent. En cas de doute, **ne pas faire** et demander.
> Il reste volontairement court : les détails sont dans `docs/agents/` (index ci-dessous),
> à ouvrir **seulement** quand la tâche le demande.

## Index — quoi lire, quand

| Besoin | Fichier |
|---|---|
| Trouver un fichier, savoir ce qui est lourd ou archivé | `docs/agents/CARTE_DU_DEPOT.md` |
| Comprendre un module (Morchid, Meftah, Okacha, Hosila, Tadwin, freemium…) | `docs/agents/ARCHITECTURE.md` |
| Toucher un fichier de données, un générateur ou un verrou `*.lock.test.ts` | `docs/agents/DONNEES_GENEREES.md` |
| Lancer les tests, lire la CI, connaître les échecs déjà présents | `docs/agents/TESTS_ET_CI.md` |
| Livres, programme, synthèses officielles, droits d'auteur | `docs/agents/SOURCES.md` |
| Problèmes connus non résolus (à ne pas redécouvrir) | `docs/agents/CONSTATS_OUVERTS.md` |
| Specs, audits et bilans du projet | `docs/README.md` (catalogue) |

`archive/` est hors produit et exclu des recherches (`.ignore`) : ne pas y chercher
sauf demande explicite.

## Stack technique
- Node 24 (≥ 22.14) / Vite / React / TypeScript strict
- Tests : `vitest run` (principal) + `npx jest` (second runner) + `tsx tests/boussole.test.ts`
- Vérifs obligatoires avant tout commit : `npm run lint` (tsc --noEmit), puis la suite de tests, puis `npm run build`
- Serveur : `tsx server.ts` ; backend SQLite par défaut, PostgreSQL si `DATABASE_URL`

## Règles d'or — correction automatique SVT (périmètre protégé)
1. **P2/R6 — INTERDIT de fitter la note sur les notes prof.** Aucun modèle `a·cov+b`.
   Seuls les chiffres du barème officiel (5/7/8 pts) sont utilisables.
2. Le corpus des 40 `eleve_*.txt` (gitignoré, local uniquement) a **servi à calibrer**
   le moteur — ce n'est **pas** un jeu de validation indépendant. Tout écart publié est
   un **plancher**, jamais une performance définitive.
3. **Similarité sémantique seule = piste, jamais crédit** sans preuve validée.
4. Un item dont la reconnaissance demande une interprétation humaine reste **MANUEL**
   (`formes: []`). Ne pas forcer une signature keyword artificielle.
5. Aucun contenu inventé : chiffres, formules et énoncés intacts. Arabe **فصحى**
   uniquement — jamais de dialecte algérien.
6. Les fichiers **générés** (`okacha.ts`, `hosila.ts`, `lessonIndex.ts`, `cartesHosila.ts`,
   `guideManhajia.ts`, `okachaEnriched.ts`…) ne s'éditent jamais à la main : corriger le
   générateur (liste complète : `docs/agents/DONNEES_GENEREES.md`).

## Fichiers à NE JAMAIS modifier (travail concurrent non signé)
- `GUIDE_FUSION_SYNTHESE_METHODE_SVT_BAC_3AS.md` (reste à la racine : son chemin est lu par un générateur), `package.json`
- `public/lessons/*.html`, `public/miftah.html`, tous les SVG
- `src/App.tsx`, `src/data/lessonIndex.ts`, `src/data/activeLessons.ts`
- `src/components/HtmlLessonViewer.tsx`, `src/components/ScienceAnimations.tsx`
- `src/components/FigureZoomLayer.tsx`, `src/utils/figureZoomRuntime.ts`, `figureZoom*.test.ts`
- `scripts/tools/`, `tmp_*.txt`, `tmp_*.mjs`
- Les 40 `eleve_*.txt` et `RECAPITULATIF.txt` (données élèves — lecture seule)

## Tests
- `@testing-library/jest-dom` **n'est pas câblé** → utiliser `.toBeTruthy()`,
  `.toBeNull()`, `.toHaveLength()`. Appeler `cleanup()` explicitement.
- Une suite partiellement rouge **n'est pas acceptable** : tout doit rester vert
  (vitest + jest + tsc). Les tests `figureZoom*` sont l'exception connue (concurrents).
- Comparer à l'état de référence et aux échecs déjà présents listés dans
  `docs/agents/TESTS_ET_CI.md` ; une mesure locale ne remplace pas la CI GitHub.

## Windows — pièges connus
- **Pas d'arabe inline en console** (mojibake). Écrire l'arabe via outils de fichier, jamais `echo`.
- `Out-File -Encoding utf8` insère un **BOM** → utiliser
  `[System.IO.File]::WriteAllText($f, $txt, [System.Text.UTF8Encoding]::new($false))`.
- **Jamais de `&&`** entre commandes PowerShell.

## Git — discipline
- **`git add` explicite** à chaque fois. Jamais `git add -A` / `git add .`
  (contaminerait le travail concurrent non signé).
- **`git push` JAMAIS sans validation explicite** — action irréversible.
- **Réécriture d'historique** (`filter-repo`, `rebase` public) JAMAIS sans validation
  destructive explicite.
- Message de commit : ce qui a changé, **la preuve** (copie/écart/chiffre), et la mesure
  avant→après quand applicable.

## Workflow obligatoire
1. Comprendre la demande ; vérifier les fichiers existants (commencer par l'index ci-dessus)
2. Coder la solution
3. `npm run lint` (tsc)
4. Lancer les tests → si échec → **corriger → relancer** (boucle)
5. `npm run build`
6. Quand tout est vert → résumer les changements avec preuves et mesures
7. Une découverte durable (piège, fichier lourd, générateur, échec connu) → la consigner
   dans le fichier `docs/agents/` concerné, pas dans ce fichier
