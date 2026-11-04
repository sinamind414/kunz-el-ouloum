# Handoff agent — état réel du dépôt

> **Règle de lecture : le dépôt et la sortie des commandes sont la source de vérité, pas ce
> document.** Ce fichier décrit l'état au **2026-09-06**. S'il contredit le code, le code gagne
> et ce fichier doit être corrigé dans la même PR.
>
> Ce document remplace l'ancien handoff (qui pointait sur le commit `892a18b` et sur un
> `workspace.js` de « ~765 lignes » alors qu'il en faisait 640 — il était périmé et orientait
> mal).

## 1. Où en est le dépôt

- `main` = `1184596` (merge de la PR #17 : méthodologie MIFTAH, examen simulé, interface
  épurée, rebranding مفتاح الكنز — 14 commits).
- **La CI `Quality` était ROUGE sur `main`** (run `34063089897`) : lint, typecheck, format,
  tests unitaires, build et installation de Chromium passaient ; `npm run test:e2e` échouait.
  La PR #17 a été mergée dans cet état.
- Cause racine : `tests/e2e/responsive.spec.mjs` cliquait `.more-tools summary` puis
  `#ws-report`, alors que `#ws-report` a été **volontairement supprimé** de la copie
  (verrouillé par `tests/all-buttons.test.mjs` : `assert.equal($("#ws-report"), null,
"التقرير retiré de la copie")`). Les tests unitaires avaient été mis à jour après l'épure,
  pas l'e2e.
- Corrigé dans cette branche : l'e2e pointe désormais sur la modale réellement atteignable
  pendant la copie (`#ws-panic` → تلميح), le `<details class="more-tools">` **vide** qui
  s'affichait encore dans la copie de l'élève est supprimé, et le précachage du service
  worker est complété (6 modules importés par l'app en étaient absents, ce qui casse un
  démarrage hors-ligne à froid).
- ⚠️ **La correction e2e n'est prouvée que par la CI** : le sandbox de développement ne peut
  pas télécharger Chromium (`npx playwright install` échoue). Ne jamais conclure que l'e2e
  passe sans l'URL et le SHA d'un run vert.

## 2. Règles non négociables (dérivées du dépôt, pas d'une session)

**Produit — ce que l'élève voit pendant la copie**

1. **Rien d'autre que l'essentiel** dans la copie : sortie (`#ws-home`), تلميح (`#ws-panic`),
   المسودة (`#ws-brouillon`), الموضوع PDF (`#ws-pdf`). Pas de rapport, pas d'export, pas de
   تصفير, pas de son, pas d'أذكار, pas d'أطلس pendant la copie — verrouillé par
   `tests/all-buttons.test.mjs` et `tests/ui.test.mjs`.
2. **Zéro chiffre dans la copie** : le retour est qualitatif (ممتاز · جيد · متوسط · ضعيف). Le
   score numérique reste interne et ne sort que par l'export.
3. **Pas de spoiler** : aucun résumé du contenu de l'exercice en tête de copie (`#ws-desc`
   n'existe pas). L'élève lit le sujet dans le PDF, comme en salle.
4. **Marque مفتاح الكنز** dans tout ce qui est visible (`index.html`, `manifest.webmanifest`).
5. **Provenance obligatoire** pour tout contenu ajouté : URL source, pages, date de relecture,
   et le marqueur `reconstructed` quand le wording n'est pas recopié à l'identique. C'est une
   règle permanente du projet (`docs/NEXT_SESSION_PROMPT.md`) — elle **ne** signifie **pas**
   « cacher la source à l'élève » : l'écran stratégie affiche volontairement « 📄 Ouvrir la
   source externe ». Ne pas confondre les deux.
6. **Ne jamais fabriquer** : copies d'élèves, témoignages, statistiques, résultats de tests,
   métriques de fiabilité. `tests/hard-benchmark/cases.json` reste `{"cases": []}` tant
   qu'aucune copie réelle doublement annotée n'existe ; `scorePromotionAllowed` reste faux.

**Technique — ce qui casse si on y touche**

7. **Ne pas renommer les clés `boussole4d.*`** (`boussole4d.v4` = état, `boussole4d.v3` = migration sûre, `boussole4d.v2` =
   migration, `boussole4d.stream` = filière). Une élève qui perd sa progression perd son
   travail. Toute évolution passe par un bump de version + un chemin de migration, comme
   `js/store.js` le fait déjà de v2 vers v3.
8. **Ne pas renommer les identifiants de pôles `N`/`S`/`E`/`W`** : ils sont persistés dans
   l'état (`scores: { N, S, E, W }`) et traversent données, moteur et exports.
9. **`npm ci`, jamais `npm install`** : le lockfile est le contrat. (`README.md` disait encore
   `npm install` — corrigé.)
10. **Toute entrée ajoutée au graphe d'import doit être ajoutée au précachage de `sw.js`.**
    `tests/service-worker.test.mjs` dérive désormais la liste du disque : si un module manque,
    le test échoue. Ne pas le contourner en éditant le test.
11. **Ne pas réintroduire un bouton dans la copie sans supprimer le test verrou
    correspondant** : si l'UI change, les tests unitaires _et_ l'e2e changent dans le même
    commit. C'est exactement l'oubli qui a rendu `main` rouge.

## 3. Dette connue, assumée, non prioritaire

- **Trois noms pour un produit** : Boussole 4D (clés de stockage, `dist/boussole-4d-standalone.html`,
  log de `server.mjs`, `CACHE` du SW), MIFTAH (méthodologie), مفتاح الكنز (marque visible).
  Renommer le stockage exige une migration (voir règle 7) : c'est faisable et non urgent.
- **Décision produit (2026-09-12) : le rapport et ses exports ont été supprimés.** Le
  propriétaire a demandé un seul mode — l'épreuve — et la disparition de `📊 تقرير التدريب`.
  `js/ui/workspace/report-controller.js`, `js/ui/reports/{report,exports}.js` et
  `js/ui/training-limit.js` ont donc été supprimés, avec `tests/workspace-modules.test.mjs`.
  Aucune note, aucun export CSV/JSON n'est distribué : la calibration humaine reste à faire.
- **L'ancien écran d'entraînement a été supprimé** (décision produit du 2026-09-13) : modules
  `js/ui/workspace/*`, `js/ui/{training,atlas,demo-diagnostic,keycard}.js`,
  `js/domain/method/gates.js`, `data/brouillon.js` et leurs tests. Le seul mode livré est
  l'épreuve, servie par `js/ui/screens/simulation.js`. La méthode des quatre étapes ne survit
  que dans l'écran **Sérénité** (guide) et dans les scripts d'évaluation
  (`js/method-scripts.js`) — elle n'est plus un parcours.
- **`tests/archive.test.mjs`** contient un test réseau désactivé. Le `skip` était
  `process.env.SKIP_NETWORK_TESTS === "true" || true` : le `|| true` rendait le commentaire
  « pour l'activer, passer SKIP_NETWORK_TESTS=false » faux. Corrigé en
  `!== "false"` (skippé par défaut, activable réellement).
- **`docs/history/_v1_backup/`** : ancienne version monolithique conservée dans le dépôt.
  Inerte. (Archivée sous `docs/history/` le 2026-09-18 — voir `docs/history/README.md`.)
- **GitHub Pages non activé** (`gh api repos/…/pages` → 404) : l'app n'est accessible à aucun
  élève. L'activer exige les droits d'admin du propriétaire (le token de l'App GitHub n'a pas
  `pages: write`, vérifié le 2026-09-06 → HTTP 403).
- **Aucun test utilisateur réel** : voir `docs/USER_TEST_5MIN.md`, section 7 vide.

## 4. Ce qui est prioritaire (ordre imposé par le propriétaire, 2026-09-06)

1. **Publier une URL** (GitHub Pages sur `main`, racine) — seule action qui met l'app devant
   un élève. Bloquée sur un clic du propriétaire dans Settings → Pages.
2. **Exécuter le protocole 3 élèves** et committer les grilles + verbatims dans
   `docs/USER_TEST_5MIN.md` §7.
3. **Garder la CI verte** : ne jamais merger un run rouge, et ne jamais présenter un run
   d'une autre branche ou d'un autre SHA comme preuve.
4. Ensuite seulement : dette de la section 3, sur décision du propriétaire.

## 5. Validation obligatoire avant de conclure quoi que ce soit

```bash
npm ci
npm run lint
npm run typecheck
npm run format:check
npm run docs:check
npm test            # attendu au 2026-09-06 : 202 tests, 201 pass, 1 skipped, 0 fail
npm run calibration
npm run build       # attendu : dist/boussole-4d-standalone.html ~1710 KB (dist/ est gitignoré)
npx playwright install --with-deps chromium && npm run test:e2e   # impossible en sandbox sans réseau Chromium
git diff --check
```

Signaler explicitement toute étape non exécutée au lieu de la présenter comme réussie. Fournir
l'URL et le SHA du run CI vert quand on affirme que la CI passe.
