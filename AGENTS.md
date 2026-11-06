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

**Exception SIGNÉE (2026-11-04, validée par le propriétaire en session)** : la
tranche 2 de l'audit 8 axes a modifié `src/App.tsx` (+ navigation unifiée
`navigateToTab`, 31 appels) et `src/main.tsx` — câblage verrouillé par
`motivationWiring.test.ts` (6 tests, ancrés sur les handlers, pas sur la
chaîne nue) + `LessonsMindmapMove.test.tsx` + `cablageCapitaine.test.ts`,
CI master 5/5. La règle ci-dessus s'applique à tout travail NON signé :
toute nouvelle modification d'`App.tsx` exige une validation explicite du
propriétaire AVANT le code, et une mention signée ici.

**Exception SIGNÉE (2026-11-05, GO propriétaire en session)** : restauration des
entrées `methodology` (مفتاح المنهجية) et `reviser` (المراجعة) dans
`PRIMARY_NAV` d'`src/App.tsx`, supprimées par `db3c13d` (réduction à 4 onglets,
2026-11-02). Constat mesuré en live (headless CDP) : les deux vues restaient
montées mais **orphelines** — aucune porte visible ne les ouvrait. État restauré
= `d1b3f3b` (GO 2026-10-16). Verrous de tests mis à jour :
`src/components/__tests__/TrainingHubView.test.tsx` (6 onglets) et
`src/components/__tests__/MoiView.test.tsx` (6 entrées). Chaîne verte :
tsc 0, vitest 3818/3818, jest 3757/3757, build exit 0.

**Exception SIGNÉE (2026-11-05, GO propriétaire en session, option B)** :
modification de `src/App.tsx` pour que le bandeau « القبطان » réagisse à CHAQUE
entrée de rubrique (option B : rotation de conseils). `conseilFerme` remplacé
par `conseilOuvert` ; le conseil est sélectionné par rotation via
`indiceConseil(visites % nbConseils)` depuis `src/lib/conseilRubrique.ts`.
`src/data/conseilsRubrique.ts` : 2 conseils par rubrique (en فصحى uniquement,
sans phrase d'encouragement). `src/lib/conseilRubrique.ts` : compteurs de
visites par rubrique + `oublierVisitesRubriques()`. Tests mis à jour :
`src/lib/__tests__/conseilRubrique.test.ts`, `src/lib/__tests__/etatEleve.test.ts`
(nouvelle clé `boussole_conseils_visites_rubriques`),
`src/lib/invitationCapitaine.ts` + test (accès `conseils[0]`).
Chaîne verte : tsc 0, vitest 3822/3822, jest 3761/3761, build exit 0.

**Exception SIGNÉE (2026-11-05, GO propriétaire en session, spec navigation 6 → 4 rubriques)** :
modification de `src/App.tsx` pour passer de 6 à 4 portes dans PRIMARY_NAV :
« الدروس » / « التمارين والتدريب » / « المراجعة » deviennent 3 ONGLETS d'une
seule porte « التعلّم / Apprentissage » (porte virtuelle résolue vers lesson /
training / reviser). Les 24 identifiants d'écran restent intacts (verrou
PortesUniques conservé). Création des fichiers :
src/data/apprentissageNav.ts, src/data/apprentissageProgression.ts,
src/utils/navigationHash.ts, src/utils/deepLinkInterne.ts,
src/components/ApprentissageTabs.tsx (+ 4 verrous, + navigation4Rubiques.test.tsx).
Modification de src/components/BandeauConseilRubrique.tsx (déjà couverte par
l'exception option B ci-dessus). Mise en avant « المنهجية » par fond vert très
pâle (#f1faf4) + liseré, jamais le vert saturé de l'état actif.
Renommage « أنا » → « حسابي / Mon espace » (icône Sprout → User).
Chaîne verte : tsc 0, vitest 3897/3897, jest 3833/3833, build exit 0.

**Exception SIGNÉE (2026-11-06, GO propriétaire en session)** : fiabilisation de
`src/components/__tests__/navigation4Rubiques.test.tsx` (test « ?idee= ouvre
directement la banque BAC ») — modification : pré-import explicite du
composant `BacIdeasView` avant le rendu, pour que la résolution du `lazy()`
d'App soit déterministe et ne dépende plus du timeout par défaut (1 s) de
`findByTestId` ni de la charge des imports en jsdom. Constat à l'origine : le
test était rouge 2/2 en isolation chez HEAD à l'audit du matin (2026-11-06),
alors que le commit e730d9c déclarait vitest 3897/3897. Observé après
correction : 3/3 exécutions vertes en isolation.

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
