# AGENTS.md — Règles non-négociables pour l'agent IA

> Ce fichier est lu automatiquement à chaque session. Il prime sur les habitudes
> génériques de l'agent. En cas de doute, **ne pas faire** et demander.

## Stack technique
- Node 24 / Vite / React / TypeScript strict
- Tests : `vitest run` (principal) + `npx jest` (second runner) + `tsx tests/boussole.test.ts`
- Vérifs obligatoires avant tout commit : `npm run lint` (tsc --noEmit), puis la suite de tests, puis `npm run build`
- Serveur : `tsx server.ts` ; backend SQLite par défaut, PostgreSQL si `DATABASE_URL`

## Règles d'or — correction automatique SVT (périmètre protégé)
1. **P2/R6 — INTERDIT de fitter la note sur les notes prof.** Aucun modèle `a·cov+b`.
   Seuls les chiffres du barème officiel (5/7/8 pts) sont utilisables.
2. Le corpus des 40 `eleve_*.txt` a **servi à calibrer** le moteur — ce n'est **pas** un
   jeu de validation indépendant. Tout écart publié est un **plancher**, jamais une
   performance définitive.
3. **Similarité sémantique seule = piste, jamais crédit** sans preuve validée.
4. Un item dont la reconnaissance demande une interprétation humaine reste **MANUEL**
   (`formes: []`). Ne pas forcer une signature keyword artificielle.
5. Aucun contenu inventé : chiffres, formules et énoncés intacts. Arabe **فصحى**
   uniquement — jamais de dialecte algérien.
6. `okacha.ts` / `hosila.ts` sont **générés** (`scripts/build_hosila.ts`) — ne jamais
   les éditer à la main.

## Fichiers à NE JAMAIS modifier (travail concurrent non signé)
- `GUIDE_FUSION_SYNTHESE_METHODE_SVT_BAC_3AS.md`, `package.json`
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
1. Comprendre la demande ; vérifier les fichiers existants
2. Coder la solution
3. `npm run lint` (tsc)
4. Lancer les tests → si échec → **corriger → relancer** (boucle)
5. `npm run build`
6. Quand tout est vert → résumer les changements avec preuves et mesures
