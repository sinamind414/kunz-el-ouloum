# Prompt de reprise — travail restant sur `Allintelligence2024/Rebrique-sujet-BAC`

## Contexte à donner à l'agent

Tu reprends le dépôt `Allintelligence2024/Rebrique-sujet-BAC` (application PWA « Miftah Kanz »,
sujets du BAC algérien SVT/Maths, interface arabe RTL, aucune note affichée à l'élève).

Un audit senior complet a été mené et **les lots 1 à 5 sont terminés, committés et poussés** sur
la branche `arena/01a0b332-rebrique-sujet-bac`, ouverte en **PR #28** (base `main`). Le rapport
est dans `docs/AUDIT_SENIOR_2026-09-18.md` — **lis-le en entier avant de toucher quoi que ce
soit**, il contient les défauts D1–D18 avec file:line, les mesures, et les décisions déjà
tranchées.

État vérifié au moment de la reprise (pointe de branche `d87d362`) :

```
npm test            → 331 tests, 330 pass, 0 fail, 1 skipped
lint / typecheck / format:check / build / release:verify
docs:check / calibration:check / inventory:check   → tous exit 0
build               → d0b5752a97b5, 128 fichiers
p1:check → exit 1 (3/6)   p2:check → exit 1 (6/7)   p3:check → exit 0 (6/6)
npm run calibration → 0 copie comparée, 0/149 pôles, non calibré
CI (job verify)     → pass
```

**Déjà traité depuis la première rédaction de ce document** (ne pas refaire) :
T4 (garde-fou P3.2 reciblé), T6.1 (`test-results/.last-run.json` sorti de l'index),
T6.2 (CSP `frame-ancestors` configurable), T6.5 (PR #28 ouverte), normalisation
cross-platform (`.gitattributes` + chemins du test service-worker), et la perte silencieuse
des notifications émises avant `init()`. Détails en fin de document.

⚠️ **Piège spécifique à cet environnement** : le `.git` du sandbox peut être re-cloné entre
deux tours. Le pointeur de branche revient alors au commit de base alors que l'arbre de
travail conserve les fichiers, et les commits non poussés deviennent inaccessibles
(`git cat-file -t <sha>` → fatal). Réparation : `git fetch origin <branche>` puis
`git reset --mixed <sha>` — **jamais `--hard`**. Vérifier ensuite que le travail d'un autre
agent n'est pas écrasé avant tout `git add -A`.

---

## Garde-fous absolus (ne pas violer)

1. **Ne jamais réintroduire une note numérique visible par l'élève.**
   `data/bac-mode-policy.js` porte `neverShowNumericScores`. Tout test existant qui asserte
   `doesNotMatch(/\\d+[.,]\\d+\\s*\\/\\s*\\d+/)` encode cette règle produit.
2. **Ne pas desserrer un seuil d'évaluation sans données de calibration.** La calibration est à
   0/149 pôles : tout réglage du moteur serait arbitraire. C'est explicitement la raison pour
   laquelle le seuil `connectorHits >= 2` n'a pas été retouché.
3. **Ne pas supprimer ni déplacer `subjects/`, `M/`, `SE/` sans décision écrite du propriétaire.**
   Voir tâche T1.
4. **Ne pas committer sur une autre branche que celle de la session**, ni forcer un push.
5. Après toute édition de `js/**` ou `sw.js` : `npm run pwa:version`.
   Après tout ajout de `test()` : `npm run docs:update`.
   Après toute édition manuelle : `npx prettier --write <fichiers>` (printWidth 110).
   `docs/*.md` n'est **pas** dans le périmètre de `format:check`.

---

## T1 — Décision juridique sur les PDF (bloquant publication) — **nécessite un humain**

**Constat mesuré.** Trois ensembles de PDF sont suivis par Git :

| emplacement | fichiers | poids | servi par `server.mjs` ? |
| --- | --- | --- | --- |
| `subjects/` | 58 | 42 Mo | oui (`PUBLIC_DIRECTORIES`, `server.mjs:31`) |
| `M/` (racine) | 15 | 30 Mo | **non** |
| `SE/` (racine) | 17 | 51 Mo | **non** |

`.git` pèse 104 Mo. `M/` et `SE/` sont les PDF bruts téléchargés depuis dzexams ; ils
n'apparaissent dans le code qu'en **provenance** (`subjects/manifest.json`, champ `"source"`,
58 entrées). Aucun module ne les lit, aucun ne les sert.

**Le problème.** Ce sont des énoncés officiels du BAC algérien. `LICENSE-CONTENT` et `NOTICE`
encadrent le contenu, mais **la permission de redistribution n'est établie nulle part**. Les
fichiers étant suivis par Git, ils sont dans l'historique, pas seulement dans l'arbre de travail.

**À faire.**
1. Obtenir une décision écrite : autorisation de redistribution explicite, **ou** retrait.
2. Si retrait : sortir `subjects/`, `M/`, `SE/` du dépôt (artefact de build, sous-module, ou
   stockage externe), **puis réécrire l'historique** — un simple `git rm` ne retire rien de
   l'historique. Prévoir `git filter-repo`, une rotation des clones, et la mise à jour de
   `server.mjs`, `sw.js`, `scripts/vendor-pdfjs.mjs` et `tests/pdf-content-integrity.test.mjs`.
3. Si autorisation : la documenter dans `NOTICE` avec la source et la date.

**Ne pas faire** : trancher seul. C'est une décision éditoriale et juridique.

---

## T2 — Calibration du moteur (P1.5, P2.7) — **nécessite de vraies copies d'élèves**

`npm run calibration` renvoie `0 copie comparée, 0/149 pôles, non calibré`. Tant que c'est le
cas, **aucun réglage du moteur d'évaluation n'est défendable**.

Ce qui bloque est hors code :

- **P1.5** — `0/2235 copies vérifiées minimales`.
- **P2.7** — `0/5 élèves distincts avec session réelle, consentie et valide`.

Le protocole existe déjà et est exigeant : `tests/hard-benchmark/COLLECTION_PROTOCOL.md`
(rôles séparés collecteur / correcteurs A et B / vérificateur / arbitre, `auditId` non
signifiant, `consentRef` opaque, anonymisation du scan, SHA-256 sur scan + transcription +
formulaires, `blindedToPeer` et `blindedToEngine`). L'import se fait par
`tests/hard-benchmark/import-copy.mjs`, le manifeste public est
`tests/hard-benchmark/audit-manifest.json` (schéma : `audit-manifest.schema.json`).

**À faire.** Collecter et faire double-annoter au moins 5 copies réelles conformes au protocole,
puis `npm run calibration:update`. Ensuite seulement : ré-évaluer les seuils signalés en T5.

---

## T3 — Compléter les inventaires officiels (P1.1, P1.2) — **gros travail de contenu**

Mesuré : **40 sujets, 0 inventaire complet, 408 tâches = 149 `official` + 259 `reconstructed`
(63 % reconstitué)**.

- **P1.1** — `0/40 inventaires complets`.
- **P1.2** — `0/40 sujets à 100 % de couverture explicite`.

Une tâche `reconstructed` est une étape méthodologique **reconstruite**, pas le texte officiel
de la consigne. L'UI le dit déjà honnêtement à l'élève (`taskProvenanceHTML`, badge ⚠️).

### Mesure préalable faite le 2026-09-18 : `npm run pdftext:status`

Avant d'encoder quoi que ce soit, il faut savoir si les PDF ont une couche texte
exploitable. C'est mesuré, pas supposé — `scripts/report-pdf-text-layers.mjs` :

| classe | sujets | sens |
| --- | --- | --- |
| `propre` | **6** | arabe logique, en-tête officiel verbatim, 0 transposition |
| `transposé` | 11 | ordre des ligatures inversé (`اختبار يف مادة` pour `في`) |
| `formes-visuelles` | 4 | Arabic Presentation Forms (U+FB50–FDFF / FE70–FEFF) |
| `scan` | 18 | aucune couche texte, image seule |
| `indéterminé` | 1 | aucun marqueur reconnu |

Les 6 sujets `propre` : `2020/SE1`, `2020/SE2`, `2021/SE1`, `2021/SE2`, `2021-m/M1`,
`2021-m/M2`.

**Piège à ne pas répéter.** Une couche texte `propre` n'autorise **pas** un encodage
automatique. Sur les sujets les mieux classés du corpus, deux défauts subsistent :

- les **chiffres sont corrompus** — le barème de `2021/SE1` s'extrait `05 / 40 / 00`
  alors que le barème réel est `5 + 7 + 8` ;
- des **coupures parasites** scindent les mots — 248 détectées sur `2021/SE1`,
  59,6 % des tokens font 3 lettres ou moins.

Recopier sans relecture humaine injecterait donc des consignes **et des barèmes faux**.
Le garde-fou n° 1 s'applique : aucune consigne ne passe en `official` sans relecture
humaine. La valeur de cet outil est de **cibler** la relecture humaine sur les 6 sujets
où elle est assistable, au lieu de la supposer également difficile partout.

`npm run pdftext:check` renvoie exit 1 tant que les 40 sujets ne sont pas `propre` —
c'est voulu, ce n'est pas un garde-fou à « réparer ».

**Branchement CI (2026-09-18).** Cette mesure est désormais publiée à chaque push par
`.github/workflows/quality.yml`, étape « Couche texte des PDF (6/40, attendu INCOMPLET) »,
en `continue-on-error` comme P1/P2. La même passe a rendu l'étape **P3 bloquante**
(`p3:check` renvoie 6/6) — la règle inscrite dans le commentaire D12 du workflow, et
vérifiée avant application : `scripts/report-p3-status.mjs` ne lit que le système de
fichiers du dépôt, ni réseau, ni `process.env`, ni artefact de build.

### Ce qui reste à faire

Relire les sujets officiels et encoder le découpage officiel dans
`data/official-tasks.js`, puis `npm run inventory:generate` et `npm run inventory:check`.
C'est du travail de lecture et d'encodage, pas de code. Le rapport d'audit note que
`official-coverage.js:206-233` admet `relaxedEligible` sans inventaire `complete` ni
`scoringReviewStatus === "verified"` — c'est ce qui explique 38 sujets éligibles malgré
0/40 inventaires complets. **À durcir une fois les inventaires réels en place.**

---

## T4 — ~~P3.2 : garde-fou périmé~~ — **FAIT, ne pas refaire**

`npm run p3:check` → `P3: TERMINÉ (6/6)`, exit 0.

Le garde-fou `explicitPdf` (`scripts/report-p3-status.mjs`) cherchait `pdfExternalUrl` et
`فتح المصدر الخارجي` dans `js/ui/screens/strategy.js`, alors que cette construction a été
extraite vers `js/ui/pdf-viewer.js`. Il est maintenant reciblé sur la **branche « source
externe »** de `pdf-viewer.js` (à partir de l'ancre `if (external) {`), pas sur le fichier
entier.

**Pourquoi la branche et non le fichier.** `pdf-viewer.js` contient bien une `<iframe>`
(ligne 26) et un attribut `download` (ligne 29) — mais dans la branche « fichier local », où
c'est légitime : iframe masquée servant de repli au rendu `<canvas>`, même origine, autorisée
par `frame-src 'self'`. Un garde-fou portant sur le fichier entier aurait donc été rouge à
tort. Les conditions négatives (`download`, `<iframe`) ne s'appliquent qu'au repli externe.

Si l'ancre `if (external) {` disparaît, `externalBranch` vaut `""` et toutes les conditions
positives échouent : le garde-fou tombe en échec plutôt que de passer à vide.

**Vérifié par 3 mutations** (chacune fait repasser `p3:check` à `INCOMPLET 5/6`, exit 1) :
suppression du libellé arabe, ajout de `download="sujet.pdf"` dans la branche externe,
renommage de l'ancre. Restauration contrôlée par `git diff` vide.

---

## T5 — Seuils d'évaluation signalés, non calibrés

À traiter **après T2**, jamais avant.

1. `js/domain/evaluation/methodology.js:289` et `:800` — `structure.connectorHits >= 2 &&
   structure.wordCount >= 12`. Ce seuil était **inopérant** avant le correctif D5 (tout texte de
   12 mots atteignait 2 correspondances par sous-chaîne accidentelle). Il discrimine réellement
   pour la première fois. Son calibre n'est validé par aucune copie réelle.
2. `js/ui/screens/simulation.js` — `qualitativeLabel()` ne mesure **que la longueur** du texte
   (`<80`, `<220`, sinon « ممتاز — A »). Il récompense la verbosité, pas la qualité. Il n'est
   plus affiché pendant l'épreuve (décision D10) mais reste visible en relecture.
3. `tests/bac-benchmark.test.mjs` — deux bornes « acceptable » ont été ajustées sur la mesure
   corrigée de D5, avec justification en commentaire. À revalider sur copies réelles.

---

## T6 — Dette restante

1. ~~**`test-results/.last-run.json` est suivi par Git alors que `.gitignore` contient
   `test-results/`.**~~ **FAIT** : `git rm --cached`, fichier conservé sur disque,
   `.gitignore:7` s'applique (vérifié par `git check-ignore -v`).
2. ~~**`server.mjs:23`** — la CSP contient `frame-ancestors 'self' https://*.e2b.app`.~~
   **FAIT** : `resolveFrameAncestors(process.env.CSP_FRAME_ANCESTORS)`, défaut `'self'`,
   aucun hôte tiers codé en dur. Validation au démarrage : seuls `'self'` et les origines
   `https://` explicites passent ; `*`, `https://*`, `http://…` sont refusés et **le serveur ne
   démarre pas** — pas de repli permissif silencieux. 4 tests, documenté dans
   `docs/DEPLOYMENT.md`.
   ⚠️ **Conséquence à connaître** : un déploiement qui doit être intégré dans un cadre doit
   désormais passer `CSP_FRAME_ANCESTORS` explicitement. C'est voulu, mais à prévoir dans tout
   script de démarrage existant.
3. ~~**Racine encombrée** — `01a07c55-65b0-7317-af13-bd3460834d72.patch`,
   `ANALYSE_LIGNE_PAR_LIGNE.md`, `CONTINUATION.md`, `_v1_backup/` (96 Ko, 2 fichiers suivis),
   `patches/` (3 `.patch` déjà appliqués sur main selon `patches/apply-patches.sh`).~~
   **FAIT** : les cinq éléments sont archivés sous `docs/history/` par `git mv` (rien n'est
   supprimé, `git log --follow` retrouve les chemins d'origine). Références techniques mises à
   jour : `eslint.config.js:4`, `tests/server.test.mjs:49,50,73,74`. Voir
   `docs/history/README.md` pour le rôle de chacun — en particulier l'avertissement sur les
   numéros de lignes périmés de `ANALYSE_LIGNE_PAR_LIGNE.md`.
4. **`js/domain/evaluation/**` + `js/engine.js` (2 634 lignes) ne sont branchés sur aucune UI.**
   Décision déjà prise et documentée dans l'en-tête de `js/engine.js` : actif d'audit et de
   calibration, pas de la dette morte. **À confirmer ou infirmer par le propriétaire** : soit on
   assume ce statut, soit on câble le moteur sur l'UI — mais alors la règle « aucune note »
   doit être revue, ce qui est une décision produit.
5. ~~**Aucune pull request n'est ouverte** pour `arena/01a0b332-rebrique-sujet-bac`.~~
   **FAIT** : PR #28 ouverte, base `main`, `MERGEABLE`, CI `verify` au vert. Titre et corps
   décrivent les 5 commits et 62 fichiers réels.
   ⚠️ `gh pr edit` échoue silencieusement sur ce dépôt (erreur GraphQL `projectCards`,
   Projects classic déprécié) : le titre et le corps ne sont pas modifiés alors que la commande
   semble passer. Utiliser `gh api -X PATCH repos/<owner>/<repo>/pulls/28 --input <json>`.
6. **Normalisation cross-platform** — `.gitattributes` (`* text=auto eol=lf` + binaires
   protégés) et `staticImportClosure()` corrigé sur `relative(root, file).split(sep).join("/")`
   dans `tests/service-worker.test.mjs`. Sans cela, `format:check` remonte des faux positifs
   CRLF sous Windows et les chemins à `\` ne correspondent jamais à `SHELL_ASSETS`.
7. **Notifications émises avant `init()`** — `toast()` ne sort plus silencieusement quand
   `#toast-zone` manque : `ensureToastZone()` est appelée par `toast()` et par `init()`.

---

## Protocole de vérification (à exécuter à chaque lot)

```bash
npm ci --no-audit --no-fund      # node_modules disparaît entre les sessions sandbox
npm test                          # attendu : 0 fail, 1 skipped (test réseau)
for s in lint typecheck format:check build release:verify docs:check \
         calibration:check inventory:check; do npm run $s; done
npm run pwa:version               # après toute édition de js/** ou sw.js
npm run docs:update               # après tout ajout de test()
```

**Règle de preuve.** Pour chaque correctif, démontrer que le test mord : restaurer le code
d'origine (`git checkout <fichier>`) ou appliquer une mutation ciblée, relancer, constater
l'échec, puis restaurer. Un test qui passe avant **et** après ne prouve rien — cette erreur a
déjà été commise sur ce dépôt (première version du test D14).

## Pièges connus

- `echo $?` après un pipe mesure la dernière commande du pipe, pas npm. Toujours
  `out=$(npm run x); code=$?`.
- `node_modules/` et `dist/` sont effacés entre les tours du sandbox → `npm ci`, ce n'est pas un
  bug du code.
- Toute édition de `js/**` rend `js/app-version.js` périmé et fait échouer `tests/build.test.mjs`.
  Correctif : `npm run pwa:version`. Ne pas contourner le garde-fou.
- `npm run inventory:check` émet `Cannot polyfill DOMMatrix / Path2D` (`canvas` absent).
  Sans impact. **Ne pas installer `canvas`.**
- Sous Node, `globalThis` n'est **pas** une `EventTarget` : `globalThis.addEventListener` vaut
  `undefined`. Le code résout sa cible sur `globalThis.window || globalThis` pour cette raison ;
  ne pas « simplifier » vers `globalThis` seul.
- Un `git checkout` d'un fichier dont un nouvel export est importé fait échouer le module entier
  à l'import : ça ne prouve pas le comportement. Isoler par un script de probe distinct, avec des
  chemins **absolus** dans les imports ESM.
- Les sondes dans `/tmp` échouent (`ERR_MODULE_NOT_FOUND`) sur les imports relatifs du dépôt.
