# PROMPT — Décisions du propriétaire et travaux restants

**Date de rédaction :** 19 septembre 2026
**Branche :** `arena/01a0b332-rebrique-sujet-bac`
**Commit de référence mesuré :** `b10b175`
**Destination :** ce fichier est à lire par le propriétaire du projet, puis à remettre
telle quelle à un agent pour exécution.

---

## Décisions enregistrées le 19 septembre 2026

| #   | Décision                                   | Choix retenu                                   | État                                                        |
| --- | ------------------------------------------ | ---------------------------------------------- | ----------------------------------------------------------- |
| 1   | Statut juridique des PDF                   | **B puis A**                                   | Étape **B faite** — 32 bruts retirés de l'index. **A reste à faire** pour les 58 PDF servis |
| 2   | Copies réelles d'élèves                    | **Renoncement à la calibration**               | Enregistré. P1.5 et P2.7 restent bloqués volontairement      |
| 3   | Statut du moteur d'évaluation              | **Option A** — actif d'audit                   | Vérifié exact, en-tête corrigé (2 342 lignes mesurées)       |
| 4   | Maths 2013–2020 (+ 2017 استثنائية)         | **Armature « copie libre »**                   | **Rapportée entièrement** : 2016–2020 structurées en 4D le 2026-09-19 (commit `ac206be`, demande du propriétaire), 2013–2015 + 2017 استثنائية le 2026-09-20 (décision 6, OCR Tesseract) |
| 5   | Troisième onglet du hub                    | **باكالوريات أجنبية** (`foreign`)              | Fait le 2026-09-19 : espace vide assumé, 0 lien inventé      |
| 6   | OCR Tesseract des sujets sans couche texte fiable (Maths 2013–2015 + 2017 استثنائية, puis **SE 2021**) | **Extraction immédiate + encodage 4D `provisional`** | Fait le 2026-09-20 : 8 sujets Maths (64 consignes) + 2 sujets SE 2021 (16 consignes) — **plus aucune armature « copie libre »** |

### Décision 4 — pourquoi « copie libre » et pas 4D

Le propriétaire a demandé que les millésimes Maths 2013–2020 ouvrent une épreuve comme les
autres. Mesure du 2026-09-19 (`npm run pdftext:status`, 58 sujets) :

| classe             | sujets | dont Maths 2013–2020 |
| ------------------ | ------ | -------------------- |
| `propre`           | 8      | 2 (2020)             |
| `transposé`        | 20     | 9                    |
| `formes-visuelles` | 4      | 0                    |
| `scan`             | 24     | 6 (2013–2015)        |
| `indéterminé`      | 2      | 1 (2016/M2)          |

Aucun de ces fichiers ne permet de recopier des consignes **et** un barème sans inventer :
2013–2015 n'ont pas de couche texte, 2016–2020 ont des chiffres corrompus (le barème de
`2021/SE1` s'extrait `05 / 40 / 00` pour un barème réel `5 + 7 + 8`). L'armature ouvre donc
l'épreuve — sujet officiel servi par l'application, chronomètre, copie rédigée,
`✓ تسليم الورقة` — en n'annonçant que ce qui est mesuré : « البارم غير مُقاس » à la place
d'un nombre de points, et une seule copie pour le sujet entier quand le découpage n'a pas pu
être lu dans le fichier. **L'encodage des consignes reste le TRAVAIL C**, déclenché par le
propriétaire sur transcription relue.

### Décision 5 — le troisième onglet n'est plus une filière

`tm` (« تقني رياضي ») documentait une absence : la filière n'a pas d'épreuve SVT au BAC
algérien. Le propriétaire l'a reconverti en espace **باكالوريات أجنبية** (clé `foreign`),
réservé à des baccalauréats non algériens. Il est **volontairement vide** : dzexams n'indexe
que le BAC algérien, aucune source étrangère n'a été vérifiée, donc **aucun lien n'est
affiché** — pas même l'index dzexams des SVT algériennes, qui serait trompeur ici. Les
anciennes valeurs `tm` écrites dans `localStorage` sont converties en `foreign` au
démarrage.

### Décision 6 — OCR Tesseract des sujets Maths 2013–2015 + 2017 استثنائية (2026-09-20)

Le propriétaire a demandé, le 2026-09-20, d'installer **Tesseract OCR (arabe)** et d'extraire
les questions des sujets restés en armature, puis d'intégrer les pôles — une décision directe
de passer outre la règle « aucun encodage sans transcription relue » qui fondait la décision 4
pour **une partie** de son périmètre : **Maths 2013–2015 (scans sans couche texte) et la
session exceptionnelle 2017 (couche transposée)**, soit 8 sujets. Les Maths 2016–2020 avaient
déjà été structurées en 4D le 2026-09-19 (commit `ac206be`, même demande du propriétaire) ;
la décision 4 ne décrit plus aucune épreuve réelle.

**Prolongement (2026-09-20, même journée)** : après la correction verbatim des consignes
Maths, le propriétaire a dit de continuer — le même traitement s'applique à la dernière
armature restante, **SE 2021 (2 sujets, couche texte « propre » mais aux chiffres corrompus :
barème lu « 05 / 40 / 00 » pour un barème réel 5+7+8, confirmé à l'OCR)**. Fait le jour même :
`data/years/se/year-2021.js` réécrit en 4D (2 sujets × 3 exercices × 4 pôles), 16 consignes
officielles verbatim (une par question affichée), preuves dans `scripts/extracted/SE/2021/`,
sa carte d'archive retirée (toutes les sessions SE sont des années 4D). **Il n'existe plus
aucune armature « copie libre » dans l'application.**

### Décision 7 — épreuve sans questions affichées, barème visible, PDF lisibles (2026-09-20)

Trois demandes du propriétaire, enregistrées le 2026-09-20 :

1. **Fixer les PDF illisibles dans la visionneuse embarquée.** Mesure : sans CMap ni polices
   standard, 42 des 58 sujets perdaient des glyphes (polices CID arabes, Helvetica/Times non
   intégrées). Correctif : `pdfjs-dist` est vendé avec `cmaps/` et `standard_fonts/`
   (`npm run vendor:pdfjs`, `assets/vendor/pdfjs/`), et `js/ui/pdf-renderer.js` passe
   `cMapUrl`/`cMapPacked`/`standardFontDataUrl` à `getDocument()`. Les sujets se lisent dans
   l'application, même origine, sans réseau externe.
2. **Le barème apparaît dans TOUS les BAC**, dépendant de l'année et de la filière : chaque
   exercice porte son badge « N نقطة » et le sujet son total /20 (vérifié sur les 58 sujets :
   tous totalisent 20 — SE 5+7+8 toutes années ; Maths 10+10, 6+14, 7+13 ou 8+12 selon le
   millésime). Le total ne s'affiche que si le barème de chaque exercice est mesuré.
3. **Supprimer les questions de l'écran d'épreuve** : la copie affiche uniquement les
   exercices du sujet choisi (titre, barème, champ de rédaction) et le sujet officiel en PDF.
   Les questions officielles restent encodées dans les inventaires (`data/official-tasks.js`)
   pour l'audit et la calibration — jamais rendues à l'écran. Garde-fous conservés : aucun
   corrigé, aucune note numérique, aucun indice pendant l'épreuve (`اختبار صامت`), verrouillage
   à la remise, relecture qualitative après remise.

Ce qui a été fait :

1. **Pipeline reproductible** — `scripts/lib/ocr.mjs` (nœud OCR : tesseract.js + données
   `@tesseract.js-data/ara`, PSM adapté par page) et `scripts/ocr-extract-sujets.mjs`
   (extraction page à page des 8 sujets vers `scripts/extracted/M/<millésime>/sujet-N.ocr.{txt,json}`).
   Les preuves brutes sont conservées dans le dépôt et citées dans le `bacPromptNotes` de
   chaque consigne officielle.
2. **Encodage 4D** — `data/years/m/year-{2013,2014,2015,2017-exceptional}.js` :
   2 sujets × 2 exercices × 4 pôles (N/S/E/W), `modelAnswer` complet, `placeholder`,
   `minLength`, `rule{keywords, minHits}` — le motif exact des millésimes 2016–2020 déjà
   encodés. Barèmes lus à l'OCR : **10+10** par sujet pour 2013–2015, **7+13 / 8+12** pour la
   2017 استثنائية. **Complément du propriétaire (2026-09-20, correction)** : chaque
   `bacPrompt` doit être **la question du sujet, une seule par tâche, texte verbatim nettoyé
   de l'OCR** — exactement le motif des sujets SE. Une première version regroupait plusieurs
   sous-questions par consigne avec des résumés des documents : c'était une faute (l'énoncé
   recomposé se lisait comme une réponse) ; les 48 consignes officielles ont été réécrites
   en questions verbatim, une par tâche, barème par sujet maintenu à 20 pts.
3. **Marquage d'honnêteté** — toutes les consignes de ces 4 millésimes portent
   `scoringReviewStatus: "provisional"` et `bacPromptSource: "official"` (lisible dans le PDF),
   l'inventaire les déclare `status: "partial"` (consignes officielles, barème OCR non relu).
   La carte du hub affiche « جرد المهام جزئي » ; le seuil de réussite reste celui du moteur,
   non calibré (décision 2 inchangée).
4. **Intégration** — catalogue `data/subjects.js` réécrit (15 cartes Maths, toutes 4D pour
   2013–2015/2017-em/2021–2026), inventaires régénérés
   (`npm run inventory:generate` : 56 sujets inventoriés, 552 tâches, 261 consignes
   officielles ; **58/576/277** après le prolongement SE 2021 du même jour) et statut de
   calibration rafraîchi (`npm run calibration:update`).

La règle reste valable pour tout ce qui n'est pas couvert ici :
**aucune consigne ne passe en 4D sans source lisible** (ou sans décision explicite du
propriétaire). La différence est que le 2026-09-20, le propriétaire a jugé l'OCR Tesseract
suffisant pour ces 8 sujets Maths puis pour SE 2021 (prolongement) et en assume la
responsabilité, d'où le marquage `provisional` plutôt qu'un statut « relu ».

Conséquence du point 2, à ne pas perdre de vue : **le score ne doit jamais être présenté
comme une correction de professeur**, et les seuils du TRAVAIL 5 restent intouchables tant
qu'aucune copie réelle n'existe. Un changement d'avis implique de rouvrir la décision 2
avant de toucher au moindre seuil.

---

## Mode d'emploi

1. **Vous (propriétaire)** lisez les sections « DÉCISION 1 à 3 ». Ce sont les trois seuls
   points où un agent ne doit pas trancher à votre place. Cochez une option dans chaque
   encadré « Décision ».
2. **Vous** lisez la section 0. C'est un fait nouveau qui ne demande pas de décision, mais
   que vous devez connaître avant toute publication.
3. **Vous remettez ce fichier à l'agent.** Il exécute les sections dans l'ordre indiqué
   (§ Ordre d'exécution), sans rien inventer.
4. Les sections « TRAVAIL 4 » et « TRAVAIL 5 » sont exécutables par l'agent **après** que
   vous avez fourni la matière (copies annotées, transcriptions relues).

Toutes les valeurs chiffrées ci-dessous ont été **mesurées**, pas estimées. Chaque mesure
est accompagnée de la commande qui la reproduit, pour que l'agent vérifie avant d'agir.

---

## Résumé en une table

| #   | Point                                          | Bloque                  | Dépend de vous ?                     | L'agent peut avancer seul ?                          |
| --- | ---------------------------------------------- | ----------------------- | ------------------------------------ | ---------------------------------------------------- |
| 0   | `CONTENT_RIGHTS.md` affirme un retrait faux    | crédibilité juridique   | **non** (c'est un fait)              | **oui** — corriger ou retirer                        |
| 1   | Statut juridique des 90 PDF                    | publication             | **oui** — décision A/B/C             | non, sauf si option B choisie                        |
| 2   | Copies réelles d'élèves                        | P1.5, P2.7, calibration | **oui** — collecte humaine           | oui, pour préparer le harnais                        |
| 3   | Statut du moteur d'évaluation (2 342 lignes)   | périmètre produit       | **oui** — décision A/B               | non                                                  |
| 4   | Inventaires officiels (40 sujets)              | P1.1, P1.2              | **oui** — relecture humaine          | oui, dès qu'une transcription relue est fournie      |
| 5   | Seuils d'évaluation                            | qualité des notes       | non, mais **après** le point 2       | non avant la calibration                             |

---

## 0. Fait nouveau — `docs/CONTENT_RIGHTS.md` affirme un retrait qui n'a jamais eu lieu

### Constat mesuré

`docs/CONTENT_RIGHTS.md:13` écrit :

> Les 32 PDF tiers auparavant suivis par Git ont été retirés de cette branche faute de
> preuve de redistribution.

Reproduire la mesure :

```bash
git ls-tree -r --name-only HEAD | grep '\.pdf$' | grep -cE '^(M|SE)/'
```

Résultat : **32**. Les fichiers sont bien présents.

Ils sont présents dans `HEAD` (`b10b175`) **et** dans `origin/main` — les 90 PDF sont
strictement identiques entre les deux, vérifié par :

```bash
diff <(git ls-tree -r --name-only HEAD | grep '\.pdf$' | sort) \
     <(git ls-tree -r --name-only origin/main | grep '\.pdf$' | sort)
```

Résultat : aucune différence. Le retrait décrit n'a donc été effectué **sur aucune branche**.

### Pourquoi c'est grave

Ce n'est pas une coquille : c'est un document de conformité qui décrit une remédiation
jamais réalisée. Quiconque s'y fierait avant une publication croirait le contenu tiers
absent du dépôt alors qu'il y est — et que **58 de ces 90 fichiers sont servis au public**
(`subjects/` figure dans `PUBLIC_DIRECTORIES`, `server.mjs:52`).

Le périmètre réel est d'ailleurs plus large que les « 32 PDF » cités : `subjects/manifest.json`
rattache les 58 PDF servis à ces bruts par son champ `"source"`.

### Ce que l'agent doit faire — sans attendre de décision

Corriger une affirmation fausse est un fait mesuré, pas un choix. Deux issues possibles,
à choisir selon la décision prise au point 1 :

- **Si les fichiers sont retirés** (option B ou C) : l'affirmation devient vraie. Remplacer
  le passé composé par la date réelle du retrait et citer le commit.
- **Si les fichiers sont conservés** (option A ou D) : réécrire le paragraphe pour dire la
  vérité — les 32 bruts sont présents, non servis, en attente d'autorisation documentée.

L'agent ne doit **pas** laisser le paragraphe en l'état.

---

## DÉCISION 1 — Statut juridique des 90 PDF

### Constat mesuré

```bash
for d in M SE subjects; do
  echo "$d : $(find $d -name '*.pdf' | wc -l) PDF, $(find $d -name '*.pdf' -printf '%s\n' \
    | awk '{t+=$1} END {printf "%.2f", t/1048576}') Mio"
done
du -sm .git
```

| emplacement  | PDF  | poids      | servi au public ?                            |
| ------------ | ---- | ---------- | -------------------------------------------- |
| `subjects/`  | 58   | 41,10 Mio  | **oui** — `PUBLIC_DIRECTORIES`, `server.mjs:52` |
| `M/` (racine)| 15   | 29,92 Mio  | non                                          |
| `SE/`(racine)| 17   | 50,08 Mio  | non                                          |
| **total**    | **90** | **121,10 Mio** |                                          |

`.git` : **105 Mio**.

Ce que dit le dépôt sur ses propres règles :

- `LICENSE-CONTENT` — « This notice does not license examination papers, answer keys,
  scans, logos, external links or other third-party material. Those materials are excluded
  and **must not be redistributed without documented permission**. »
- `NOTICE` — « Third-party examination subjects, scans, logos and linked resources are not
  licensed by Apache-2.0. See `docs/CONTENT_RIGHTS.md` before redistribution. »
- `docs/CONTENT_RIGHTS.md` — « Une URL publique ne prouve pas un droit de redistribution. »

**Le dépôt enfreint donc sa propre règle écrite**, faute d'autorisation documentée.

### Ce que dit la mesure sur l'usage réel des 32 bruts

Recherche du nom de fichier de chacun des 32 bruts dans tout le dépôt, hors `.git`,
`node_modules` et `dist` :

- **30** apparaissent en **chemin local** dans `subjects/manifest.json`, champ `"source"`
  (ex. `"source": "M/dzexams-bac-sciences-2770867.pdf"`). C'est de la **provenance** :
  aucun module de `js/`, aucun script ne lit `manifest.json` à l'exécution.
- **12** apparaissent **à l'intérieur d'URL externes** `https://www.dzexams.com/…` dans
  `data/archive.js` — l'application lie ces sujets à distance.
- **1** n'a aucune référence : `SE/dzexams-bac-sciences-2116452.pdf`.

**Conséquence pratique, et c'est la bonne nouvelle :** un seul fichier référence les bruts
en chemin local — `subjects/manifest.json`. Tous les autres (`data/official-tasks.js`,
`scripts/VERIFY_PDFS.md`, `scripts/generate-archive-years.mjs`, `README.md`,
`data/archive.js`) les citent par **URL externe**. Le retrait de `M/` et `SE/` est donc
quasiment sans effet de bord.

### Ce que l'agent ne doit pas décider

Choisir entre demander une autorisation et retirer les fichiers est une décision
éditoriale et juridique. Elle n'appartient pas à un agent.

### Options

**Option A — Obtenir une autorisation écrite du titulaire.**
À documenter dans `NOTICE` et `docs/CONTENT_RIGHTS.md` (source, date, étendue, limite de
durée). C'est la seule option qui permet de continuer à **servir** les 58 sujets.

**Option B — Retirer les 32 bruts (`M/`, `SE/`) immédiatement, puis traiter les 58 servis.**
Réduction de risque immédiate : 80 Mio, zéro impact fonctionnel, un seul fichier à mettre
à jour. Ne règle pas le fond (les 58 servis restent des contenus tiers) mais supprime la
partie la plus visible de l'exposition — des fichiers stockés sans être utilisés.

**Option C — Retirer les 90 PDF du dépôt.**
Conformité complète. Suppose que les 58 sujets servis soient hébergés ailleurs ; l'application
doit alors pointer vers des URL externes (ce qu'elle fait déjà dans `data/archive.js`).
Impact produit fort à arbitrer.

**Option D — Statu quo.**
Non recommandé : contredit `LICENSE-CONTENT`, et `docs/CONTENT_RIGHTS.md` devient faux
même après correction du paragraphe.

### Recommandation

**B, puis A.** B est réversible, rapide et sans risque fonctionnel ; elle fait disparaître
80 Mio de contenus tiers inutilisés. A reste nécessaire pour les 58 PDF servis, sauf à
basculer sur C.

### Décision du propriétaire — ENREGISTRÉE le 19 septembre 2026

```
[ ] Option A — autorisation écrite (documenter dans NOTICE + CONTENT_RIGHTS)
[ ] Option B — retirer M/ et SE/ (recommandé, immédiat)
[ ] Option C — retirer les 90 PDF du dépôt
[ ] Option D — statu quo (déconseillé)
[X] B puis A  (recommandation)   <-- RETENU
```

Complément :

```
[ ] Purger aussi l'historique Git (git filter-repo) — DESTRUCTIF, réécrit les SHA,
    impose une rotation de tous les clones. À n'activer qu'en connaissance de cause.
[X] Non, simple retrait de l'arbre (les fichiers restent dans l'historique)
```

**Étape B exécutée le 2026-09-19.** Mesuré après coup : `git ls-files 'M/*.pdf' 'SE/*.pdf'`
→ 0, 32 fichiers conservés sur disque, `subjects/manifest.json` sans aucune source locale
(44 URL externes reprises du dépôt, 14 champs retirés faute d'URL documentée).
**L'étape A reste entière :** les 58 PDF servis sous `subjects/` sont toujours des contenus
tiers sans autorisation documentée.

### Plan d'exécution de l'agent — si option B retenue

1. **Mesurer avant de toucher.** Rejouer les commandes du « Constat mesuré » et conserver
   la sortie dans le message de commit.
2. **Retirer de l'index sans supprimer du disque :**

   ```bash
   git rm -r --cached M/ SE/
   ```

3. **Mettre à jour `subjects/manifest.json`.** Les 30 entrées dont `"source"` commence par
   `M/` ou `SE/` doivent pointer vers l'URL externe dzexams correspondante — ces URL
   existent déjà dans `data/archive.js` et `scripts/VERIFY_PDFS.md`, il faut les y prendre
   et ne pas en inventer. Si aucune URL ne correspond, supprimer le champ `"source"` plutôt
   que de laisser un chemin mort.
4. **Ajouter `M/` et `SE/` à `.gitignore`** pour éviter toute réintégration accidentelle.
5. **Vérifier qu'aucun test ne casse.** En particulier `tests/server.test.mjs:82` exige
   `/BAC2025_SVT_Sujet1.pdf` → **404** ; ce test doit rester vert, et il le reste puisque
   le fichier n'était déjà pas servi.
6. **Corriger `docs/CONTENT_RIGHTS.md:13`** (voir section 0) avec la date et le commit réels.

### Vérification

```bash
git ls-files 'M/*.pdf' 'SE/*.pdf' | wc -l      # attendu : 0
grep -c '"source": "M/\|\"source\": "SE/' subjects/manifest.json   # attendu : 0
npm test                                        # attendu : 0 fail, 1 skipped
npm run p3:check                                # attendu : 6/6, exit 0
npm run build                                   # attendu : exit 0
```

### Pièges

- **`git rm --cached` ne purge pas l'historique.** Les 80 Mio restent dans les objets Git
  et continueront d'être clonés. Seul `git filter-repo` les supprime réellement — opération
  destructive qui réécrit tous les SHA et impose une rotation des clones. Ne jamais lancer
  sans accord explicite.
- **Ne pas inventer d'URL dzexams.** Les réutiliser depuis `data/archive.js`.
- **Ne pas supprimer `subjects/`.** Ces 58 PDF sont servis ; les retirer casse l'application.

---

## DÉCISION 2 — Copies réelles d'élèves (débloque P1.5, P2.7 et la calibration)

### Constat mesuré

```bash
npm run calibration
```

Sortie :

```
Copies comparées : 0
Couverture : 0/277 pôles
STATUT : non calibré — aucune copie réelle doublement annotée.
         Ne pas présenter le score comme une correction professeur.
```

- **P1.5** — `0/4155 copies vérifiées minimales` (277 pôles × 15) ; promotion numérique interdite.
- **P2.7** — `0/5 élèves distincts avec session réelle, consentie et valide`.

Fichiers concernés : `tests/hard-benchmark/cases.json` vaut `{"cases": []}` et
`tests/hard-benchmark/audit-manifest.json` vaut `{"version": 1, "records": []}`.

### Ce que l'agent ne doit pas faire

**Inventer des copies.** `tests/hard-benchmark.test.mjs:56` s'intitule littéralement
« *cases.json peut rester vide — aucune copie n'est inventée* » : le test valide le vide.
Fabriquer des copies synthétiques ferait passer le métrique au vert en produisant une
calibration fausse — c'est-à-dire pire que pas de calibration, parce que présentable.

La collecte exige aussi des autorisations et des consentements : c'est hors de portée d'un agent.

### Ce qui dépend de vous

Réunir **au moins 5 copies réelles**, anonymisées, corrigées deux fois en aveugle par deux
correcteurs distincts, conformément au protocole déjà écrit :
`tests/hard-benchmark/COLLECTION_PROTOCOL.md`.

Le protocole impose des rôles séparés — collecteur, correcteurs A et B, vérificateur
(qui ne peut être ni collecteur ni correcteur), arbitre si besoin —, un `auditId` non
signifiant, un `consentRef` opaque, l'anonymisation du scan, un SHA-256 sur scan +
transcription + formulaires, et les attestations `blindedToPeer` / `blindedToEngine`.

Les pièces justificatives (autorisations, consentements) **restent hors Git**.

### Ce que l'agent peut faire dès maintenant, sans vous

1. Relire `tests/hard-benchmark/COLLECTION_PROTOCOL.md` et signaler toute étape ambiguë.
2. Vérifier que la chaîne d'import fonctionne **de bout en bout** sur un jeu factice
   explicitement marqué comme tel, puis le retirer :

   ```bash
   node tests/hard-benchmark/import-copy.mjs <fichier.json> --dry-run
   node tests/hard-benchmark/import-copy.mjs <fichier.json> --yes
   npm run calibration:update
   ```

   `--dry-run` n'écrit rien. L'import doit **échouer** si l'audit ne correspond pas — c'est
   une garantie, pas un bug.
3. Documenter la procédure pas à pas pour les correcteurs humains.

### Ce que l'agent fera quand vous aurez fourni les copies

1. Importer chaque copie : `node tests/hard-benchmark/import-copy.mjs <fichier.json>`.
2. Recalculer le statut : `npm run calibration:update`
   (écrit `data/calibration-status.js`, **fichier généré — ne jamais éditer à la main**).
3. Vérifier : `npm run calibration:check` et `npm run calibration`.

### Vérification

```bash
npm run calibration          # attendu : « Copies comparées : >= 5 », statut calibré
npm run calibration:check    # attendu : exit 0
npm run p1:check             # P1.5 doit passer de « bloqué » à « terminé »
npm run p2:check             # P2.7 doit passer de « bloqué » à « terminé »
```

### Décision du propriétaire — ENREGISTRÉE le 19 septembre 2026

```
[ ] Je m'engage à fournir >= 5 copies conformes au protocole (échéance : __________)
[ ] Je demande à l'agent de préparer d'abord le harnais et la documentation
[X] Je renonce à la calibration — alors le score ne doit jamais être présenté   <-- RETENU
    comme une correction professeur, et P1.5 / P2.7 restent bloqués
```

**Conséquences actées et vérifiées dans le dépôt :**

- `tests/hard-benchmark/cases.json` = `{"cases": []}`,
  `tests/hard-benchmark/audit-manifest.json` = `{"version": 1, "records": []}` — volontairement
  vides ; `tests/hard-benchmark.test.mjs:56` verrouille ce vide pour qu'aucune copie ne soit
  inventée.
- `npm run calibration` → « Copies comparées : 0 », « STATUT : non calibré ».
- P1.5 (`0/2235 copies`) et P2.7 (`0/5 élèves`) restent bloqués. Ces deux portes passent en
  `exit 1`, ce qui est **attendu** et publié en CI sans bloquer.
- Le harnais reste fonctionnel : `--dry-run` n'écrit rien, et l'import refuse une copie dont
  l'audit ne correspond pas. La collecte peut donc être reprise à tout moment.

**Rouvrir cette décision** implique de fournir les copies **avant** de toucher au moindre
seuil (TRAVAIL 5).

---

## DÉCISION 3 — Statut du moteur d'évaluation (2 342 lignes)

### Constat mesuré

```bash
find js/domain/evaluation -name '*.js' -type f -exec cat {} + | wc -l   # 2303
wc -l js/engine.js                                                       # 39
```

Soit **2 342 lignes** réparties en 5 fichiers + une façade de 39 lignes.

L'en-tête de `js/engine.js` documente le statut actuel :

> STATUT — actif d'audit et de calibration, PAS code de production. Ce graphe
> (engine.js + domain/evaluation/\*\*) n'est importé par aucun module d'interface ni par
> `js/main.js` : il est hors du graphe de démarrage, absent du précachage du service worker
> (`sw.js:23` le documente) et absent du monofichier.

Et donne la raison : `BAC_MODE_POLICY` **n'affiche aucune note à l'élève**, donc aucune
note n'est calculée dans l'application livrée.

### Ce que l'agent ne doit pas décider

Supposer que c'est de la dette morte et le supprimer, ou au contraire le brancher sur
l'interface. Les deux sont des choix produit.

### Options

**Option A — Assumer le statut d'actif d'audit et de calibration.**
Rien à brancher. Maintenir la couverture de tests (`tests/engine*`) et garder l'en-tête à
jour. C'est le statut actuel, cohérent avec la règle « aucune note ».

**Option B — Câbler le moteur sur l'interface.**
Alors la règle « aucune note affichée à l'élève » doit être revue explicitement — c'est une
décision produit, pas un chantier technique. Cela suppose aussi que la calibration
(décision 2) soit faite : brancher un moteur non calibré afficherait des notes sans fondement.

### Recommandation

**A maintenant, B seulement après la calibration.** L'ordre importe : B avant la calibration
reviendrait à afficher des notes qu'aucune copie réelle ne permet de défendre.

### Décision du propriétaire — ENREGISTRÉE le 19 septembre 2026

```
[X] Option A — on assume le statut d'actif d'audit (recommandé)                <-- RETENU
[ ] Option B — on câble le moteur sur l'UI (implique de revoir la règle « aucune note »
                et d'avoir terminé la calibration)
```

**Vérification effectuée** (option A = ne rien brancher, mais garantir que le statut déclaré
est exact) :

- `js/engine.js` — en-tête conforme ; le moteur n'est importé ni par `js/main.js` ni par
  aucun module d'interface (`js/ui.js` le mentionne en commentaire seulement).
- `sw.js:23` — le commentaire est exact, et `SHELL_ASSETS` (37 entrées) ne contient pas
  `js/engine.js`. La seule entrée contenant « engine » est `js/services/sound-engine.js`,
  qui est un module différent (audio), bien dans le graphe de démarrage.
- Correction apportée : l'en-tête annonçait « ~2 600 lignes » ; la mesure donne
  **2 342 lignes** (2 303 dans `js/domain/evaluation/**`, 39 dans `js/engine.js`).

---

## TRAVAIL 4 — Compléter les inventaires officiels (P1.1, P1.2)

### Constat mesuré

```bash
npm run p1:check     # P1.1 bloqué : 0/58 inventaires complets ; 576 tâches connues
                     # P1.2 bloqué : 0/58 sujets à 100 % de couverture explicite
npm run pdftext:status
```

Sur les 58 sujets (29 sessions × 2) :

| classe             | sujets | sens                                             |
| ------------------ | ------ | ------------------------------------------------ |
| `propre`           | 8      | arabe logique, en-tête officiel verbatim         |
| `transposé`        | 20     | ordre des ligatures inversé                      |
| `formes-visuelles` | 4      | Arabic Presentation Forms                        |
| `scan`             | 24     | aucune couche texte                              |
| `indéterminé`      | 2      | aucun marqueur reconnu                           |

Les 8 sujets `propre` : `2020/SE1`, `2020/SE2`, `2021/SE1`, `2021/SE2`, `2021-m/M1`,
`2021-m/M2`, `2020-m/M1`, `2020-m/M2`.

### Ce qui dépend de vous — et pourquoi

Une couche texte `propre` **n'autorise pas** un encodage automatique. Même sur les mieux
classés, la mesure montre des **chiffres corrompus** (le barème de `2021/SE1` s'extrait
`05 / 40 / 00` au lieu de `5 + 7 + 8`) et des **coupures parasites** (248 sur `2021/SE1`,
59,6 % des tokens font 3 lettres ou moins). Recopier sans relecture injecterait des
consignes **et des barèmes faux**.

La règle à ne pas transgresser, énoncée dans `PROMPT_REPRISE.md` :
**aucune consigne ne passe en `official` sans relecture humaine.**

### Comment procéder

**Vous** relisez un sujet sur le PDF (les 6 sujets `propre` sont les plus assistables, et
`README.md:244` montre que la méthode a déjà été employée pour 2024 : « 8 pôles `official`
recopiés mot à mot sur photos des pages 2, 6, 7, 10 »).

**L'agent** encode ensuite :

1. Écrire le découpage officiel dans `data/official-tasks.js`.
2. `npm run inventory:generate`
3. `npm run inventory:check`

### Ce que l'agent doit durcir après coup

`js/domain/subjects/official-coverage.js` définit `relaxedEligible`, repris par
`simulationEligible = strictEligible || relaxedEligible`. Ce mode relaxé n'exige ni
inventaire `complete` ni `scoringReviewStatus === "verified"` — c'est ce qui explique
**58 sujets éligibles malgré 0/58 inventaires complets**. À durcir une fois les inventaires
réels en place. (58 sujets = 29 sessions × 2 ; depuis la structuration OCR de SE 2021 le
2026-09-20, tous les sujets — y compris l'ancienne armature — portent un inventaire
`partial` : aucun n'est « complete » pour autant.)

### Ce que le dépôt atteste déjà comme relu

`data/official-tasks.js` porte `source.humanVerified`, écrit `false` par défaut par
`scripts/generate-official-inventories.mjs`. Une seule entrée est vérifiée à ce jour :
`2025/S1`, « relu visuellement sur le scan local par un humain (2026-08-23) ».

### Décision du propriétaire

```
[ ] Je fournis les transcriptions relues, sujet par sujet
[ ] Je demande à l'agent de traiter d'abord les 6 sujets « propre »
[ ] Je reporte — P1.1 et P1.2 restent bloqués
```

---

## TRAVAIL 5 — Seuils d'évaluation signalés, non calibrés

**À traiter après la décision 2. Jamais avant.**

### Constat mesuré

1. `js/domain/evaluation/methodology.js:289` et `:800` —
   `structure.connectorHits >= 2 && structure.wordCount >= 12`.
   Ce seuil était **inopérant** avant le correctif D5 (tout texte de 12 mots atteignait
   2 correspondances par sous-chaîne accidentelle). Il discrimine réellement pour la
   première fois — et **son calibre n'est validé par aucune copie réelle**.
2. `js/ui/screens/simulation.js` — `qualitativeLabel()` ne mesure **que la longueur** du
   texte (`<80`, `<220`, sinon « ممتاز — A »). Il récompense la verbosité, pas la qualité.
   Il n'est plus affiché pendant l'épreuve, mais reste visible en relecture.
3. `tests/bac-benchmark.test.mjs` — deux bornes « acceptable » ont été ajustées sur la
   mesure corrigée de D5, avec justification en commentaire. À revalider sur copies réelles.

### Piège principal

**Ne pas assouplir `connectorHits >= 2` pour faire passer un test.** Les seuils ont été
recalés après la correction D5 ; les modifier sans calibration détruirait la seule
discrimination que ce seuil vient d'acquérir.

---

## Ordre d'exécution pour l'agent

1. **Section 0** — corriger `docs/CONTENT_RIGHTS.md:13`. Aucune dépendance. Faire d'abord :
   c'est le seul point qui engage la crédibilité juridique du dépôt.
2. **Décision 1** — exécuter l'option cochée. Si B : `git rm -r --cached M/ SE/`, mettre à
   jour `subjects/manifest.json`, `.gitignore`, puis corriger la date dans
   `CONTENT_RIGHTS.md`.
3. **Décision 2** — préparer le harnais, documenter la procédure, attendre les copies.
4. **Décision 3** — si A, vérifier que les en-têtes de `js/engine.js` et `sw.js:23` sont
   exacts.
5. **TRAVAIL 4** — encoder au fur et à mesure des transcriptions fournies, puis durcir
   `official-coverage.js:221`.
6. **TRAVAIL 5** — seulement après l'étape 3 terminée.

## Vérification finale, à chaque lot

```bash
npm ci --no-audit --no-fund      # node_modules disparaît entre les sessions sandbox
npm test                          # attendu : 374 tests, 373 pass, 0 fail, 1 skipped (après fusion main : tests sound-engine de #26 adoptés)
for s in lint typecheck format:check build release:verify docs:check \
         calibration:check inventory:check p3:check; do npm run $s; done
npm run pwa:version               # après toute édition de js/** ou sw.js
```

Pièges transversaux, déjà rencontrés sur ce dépôt :

- `js/app-version.js` est périmé dès qu'on édite `js/**`, `sw.js` ou les `data/` servis →
  relancer `npm run pwa:version` **une seule fois, après toutes les éditions**.
- Tout ajout de `test()` casse `docs:check` → relancer `npm run docs:update` en dernier.
- `data/official-tasks.js` et `data/calibration-status.js` sont **générés** — ne jamais les
  éditer à la main ; passer par `inventory:generate` et `calibration:update`.
- `gh pr edit` échoue silencieusement sur ce dépôt (GraphQL `projectCards`). Utiliser
  `gh api -X PATCH repos/Allintelligence2024/Rebrique-sujet-BAC/pulls/28 --input <json>`.
- Ne jamais présenter un SHA local comme preuve de push. Seule preuve :
  `git ls-remote origin 'refs/heads/arena/01a0b332-rebrique-sujet-bac'`.
