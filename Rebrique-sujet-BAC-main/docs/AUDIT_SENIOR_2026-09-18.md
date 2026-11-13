# Audit senior — revue intégrale du dépôt

**Date** : 2026-09-18 · **Commit** : `d6347d3` · **Branche** : `arena/01a0b332-rebrique-sujet-bac`
**Périmètre** : 308 fichiers, ~38 157 lignes de JS/MJS (hors `assets/vendor`), 21 734 lignes de données, 103,53 Mio de pack Git.

> Chaque affirmation ci-dessous est issue d'une commande exécutée sur ce dépôt le 2026-09-18.
> Les numéros de ligne renvoient à l'état du commit `d6347d3`.
>
> **Note du 2026-09-18 (postérieure à la rédaction)** : les chemins `patches/…`,
> `_v1_backup/…`, `ANALYSE_LIGNE_PAR_LIGNE.md`, `CONTINUATION.md` et
> `01a07c55-65b0-7317-af13-bd3460834d72.patch` cités ci-dessous ont été archivés sous
> `docs/history/` (déplacement suivi par Git, rien n'est supprimé). Préfixer par
> `docs/history/` pour les résoudre. Les constats eux-mêmes ne sont pas modifiés.

---

## 1. Verdict

C'est un projet **au-dessus de la moyenne** sur presque tous les axes d'ingénierie : découpage
domaine/application/UI propre, durcissement systématique des entrées non fiables, télémétrie
sans donnée personnelle, build déterministe, 273 tests qui passent, CI complète.

Mais il porte un défaut structurel : **les garde-fous sont écrits, documentés, testés — et
plusieurs ne sont pas branchés**. Le symptôme se répète : une fonction de nettoyage existe et
n'est jamais appelée, une liste blanche existe et a dérivé de sa source de vérité, un test
vérifie qu'une fonction *existe* au lieu de vérifier qu'elle *agit*.

Six défauts confirmés par exécution sont à corriger avant toute mise en production.

### Ce que j'ai exécuté (et le résultat réel)

| Commande | Résultat |
| --- | --- |
| `npm ci` | 156 paquets, exit 0 |
| `npm test` | **273 tests, 272 pass, 0 fail, 1 skipped** (le skip est `les pdfUrl sont accessibles (test réseau)`), exit 0 |
| `npm run lint` | exit 0 |
| `npm run typecheck` | exit 0 |
| `npm run format:check` | `All matched files use Prettier code style!`, exit 0 |
| `npm run build` | exit 0 — `dist/site` 127 fichiers / 43,9 Mo, standalone 1 901 Ko |
| `npm run release:verify` | exit 0 |
| `npm run calibration:check` / `inventory:check` / `docs:check` | exit 0 |
| `npm run p1:check` | **exit 1** — `P1: INCOMPLET (3/6 critères fermés)` |
| `npm run p2:check` | **exit 1** — `P2: INCOMPLET (6/7)` |
| `npm run p3:check` | **exit 1** — `P3: INCOMPLET (5/6)` |
| `npm run coverage:official` | 40 sujets audités, 38 éligibles, 0 inventaire invalide |
| `npm run calibration` | `Copies comparées : 0 — Couverture : 0/149 pôles — STATUT : non calibré` |

---

## 2. Défauts confirmés par exécution

### D1 — `server.mjs` : les Range suffixes renvoient le début du fichier *(bloquant)*

`server.mjs:121-131` ne traite que `bytes=A-B` et `bytes=A-`. Pour un suffixe
`bytes=-N` (les N **derniers** octets, RFC 9110 §14.2), `s` vaut `null`, donc `start` reste `0`
et `end` devient `N`.

Mesure réelle sur `subjects/SE/2025/sujet-1.pdf` (1 099 674 octets) :

```
$ curl -H "Range: bytes=-500" …
HTTP/1.1 206 Partial Content
Content-Length: 501
Content-Range: bytes 0-500/1099674      ← attendu : bytes 1099174-1099673/1099674
```

**Pourquoi c'est grave ici** : le trailer et la table xref d'un PDF sont en **fin** de fichier.
Un lecteur qui utilise un range suffixe pour les lire reçoit l'en-tête à la place et échoue à
ouvrir le document. `sw.js:208-215` laisse explicitement passer les requêtes `range` au réseau
précisément pour que le PDF fonctionne — le serveur casse alors ce qu'il protège.

**Correctif** : traiter `s == null && e != null` → `start = max(0, size - e); end = size - 1`.

---

### D2 — `store.js` : `KNOWN_YEAR_IDS` a dérivé du catalogue *(bloquant)*

`js/store.js:17-46` maintient à la main 28 identifiants d'année. `YEAR_CATALOG`
(`data/subjects.js:142-266`) n'en contient que **20**, et `YEAR_LOADERS` (`:271-292`) aussi.

```
YEAR_CATALOG ids  : 20
KNOWN_YEAR_IDS    : 28
Fantômes : 2013-m,2014-m,2015-m,2016-m,2017-m,2018-m,2019-m,2020-m

enterSession('2013-m') : ACCEPTE  -> yearId = 2013-m | statut = active
loadYear('2013-m')     : RangeError: سنة غير معروفة: 2013-m
```

Le commentaire `store.js:12-16` décrit exactement ce risque (« *Une année hors de cette plage
n'a aucun payload chargeable : loadYear jetterait RangeError* »). Le correctif du bug #B2 est
donc **incomplet** : la liste blanche est un duplicata manuel qui a dérivé.

**Correctif** : supprimer `KNOWN_YEAR_IDS` et dériver de `YEAR_CATALOG`
(`new Set(YEAR_CATALOG.map(e => e.id))`). Une seule source de vérité.

---

### D3 — `store.js` : `enterSession` n'applique pas la règle qu'elle annonce *(bloquant)*

`js/store.js:454` valide seulement `YEAR_ID_PATTERN.test(yearId)`, jamais `isCatalogYear` :

```
enterSession('9999') : ACCEPTE -> 9999
```

Le commentaire `store.js:439-445` affirme avoir imposé des entiers bornés dans `exercise()`
« *pour symétrie avec enterSession* » — alors que c'est `enterSession` qui n'a jamais reçu le
contrôle. La session passe à `active` et est persistée avec une année que `exercise()`,
`validateState()` et `loadYear()` rejettent toutes les trois.

**Correctif** : remplacer le test de pattern par `isCatalogYear(yearId)` dans `enterSession`.

---

### D4 — `store.js` : `scratch.free` n'est pas borné, contrairement à tous ses voisins *(bloquant)*

`js/store.js:118-125` borne `text[pole]`, `scratch[pole]` et `freeAnswer` à 60 000 caractères
(bug #B15). La ligne 125 oublie `scratch.free` :

```js
safe.scratch.free = asString(raw.scratch?.free);   // aucun .slice()
```

Mesure sur un `localStorage` corrompu de 5 Mo :

```
text.N        : 60000
scratch.N     : 60000
scratch.free  : 5000000   ← attendu 60000
freeAnswer    : 60000
scratch.total : 5240000 chars persistés
```

Combiné à D5 (`store.save()` à chaque frappe), un seul champ peut rendre l'application
inutilisable au rechargement — précisément le scénario que #B15 voulait empêcher.

**Correctif** : `.slice(0, 60000)` sur `scratch.free`.

---

### D4bis — `store.js` : deux dimensions de la sanitisation restaient non bornées *(bloquant, découvert hors audit)*

Trouvé en corrigeant D4, absent de la revue initiale : borner la **longueur** des valeurs
ne suffit pas si leur **nombre** ne l'est pas, et `sanitizeProgress` n'appliquait pas la
plage que `store.exercise()` impose par ailleurs.

1. `officialTaskAnswers` — mêmes valeurs non bornées que `scratch.free`. C'est pourtant
   là que `persistAnswers()` écrit la réponse de l'élève en mode épreuve.
2. `fields[key]` — la clé était limitée à 100 caractères, la **valeur** ne l'était pas.
   Champ historique que l'application n'écrit plus (grep : `store.js` seul), donc dormant,
   mais `sanitizeExercise` est une frontière de confiance : un `localStorage` corrompu
   traverse.
3. Le **nombre de clés** de `fields` et d'`officialTaskAnswers` n'était borné nulle part :
   un `localStorage` corrompu pouvait aligner des centaines de milliers d'entrées à
   60 000 caractères chacune.
4. `sanitizeProgress` acceptait `sujetId`/`exerciseId` via `/^[1-9]\d*$/`, **sans plafond**,
   alors que `store.exercise()` impose 1..9. Un `localStorage` corrompu pouvait donc créer
   un nombre illimité de sujets et d'exercices fantômes — chacun portant ses propres
   champs texte — que le store lui-même refuse ensuite de relire.

**Correctif** : `MAX_PERSISTED_KEYS` (200) sur les deux tables libres, valeurs tronquées à
`MAX_PERSISTED_TEXT`, et `isBoundedId(value, max)` aligné sur `MAX_SUBJECT_ID`/
`MAX_EXERCISE_ID` (9) dans `sanitizeProgress`.

---

### D5 — `text-analysis.js` : un pur « keyword dump » obtient la note maximale *(bloquant pour la calibration)*

`CONNECTORS` (`js/domain/evaluation/text-analysis.js:16-68`) contient des clitiques de 2 lettres
(`ان`, `في`, `من`, `عن`, `الي`…). `analyzeSentenceStructure:357` les cherche par
`normText.includes(c)` — **sous-chaîne**, pas mot. Or `انزيم` (enzyme) contient `ان`.

```
A (sans 'ان')      wordCount=5 connectorHits=0 hasConnectors=false isKeywordDump=true
B (avec 'انزيم')   wordCount=5 connectorHits=1 hasConnectors=true  isKeywordDump=false

Fraction de note (dump A) = 0.000   isKeywordDump = true
Fraction de note (dump B) = 1.000   isKeywordDump = false
```

Un élève qui aligne `بروتين انزيم ريبوزوم حمض نووي` — cinq mots-clés, aucune phrase — obtient
**1,0** (donc le barème plein via `scoreBac`) au lieu de 0, pour la seule présence d'un des mots
les plus fréquents du vocabulaire SVT.

Comme les clauses 2 et 3 de `isKeywordDump` (`:377-380`) exigent `connectorHits === 0`, la
détection anti-dump se réduit en pratique à `wordCount < 5`.

**Portée réelle** : le moteur n'est plus branché sur l'épreuve (`js/ui.js:17-24` le documente,
`neverShowNumericScores: true`), donc l'élève ne voit pas cette note. Mais
`tests/hard-benchmark/calibration-report.mjs:25` l'utilise pour comparer le moteur aux copies
humaines : la mesure qui doit décider de la promotion du score est elle-même faussée.

**Correctif** : matcher les connecteurs sur des **tokens** (`new Set(tokenizeArabic(text))`)
et non par sous-chaîne, ou exiger `length >= 3` comme le fait déjà `matchConcept:326`.

---

### D6 — `data/archive.js` : la session exceptionnelle 2017 Maths pointe vers les PDF de la session principale *(bloquant pour la fidélité des sources)*

Les deux entrées 2017/m portent des `localPdfUrls` identiques :

- `:251` — `session: "exceptional"`, notes « الدورة الاستثنائية 2017 … bac2017_2-sciences-m … 11 pages » → `/subjects/M/2017/sujet-{1,2}.pdf`
- `:266` — `session: "main"` → **les mêmes** `/subjects/M/2017/sujet-{1,2}.pdf`

Or les vrais fichiers de la session exceptionnelle existent et sont différents :

```
subjects/M/2017/sujet-1.pdf              877849 o   2541dbf0dc4a…
subjects/M/2017/exceptional/sujet-1.pdf  613049 o   2d067cc0fcd8…
```

Contrôle d'intégrité complet (58 PDF sur disque, 56 référencés) :

```
Références vers des fichiers absents : 0
Fichiers présents jamais référencés  : 2
  /subjects/M/2017/exceptional/sujet-1.pdf   599 KB
  /subjects/M/2017/exceptional/sujet-2.pdf   543 KB
```

L'archive — dont tout l'intérêt est la traçabilité des sujets officiels — affiche donc le
mauvais document pour une session, et embarque 1,1 Mo de PDF orphelins dans `dist/site`.

**Correctif** : pointer l'entrée `exceptional` sur `/subjects/M/2017/exceptional/sujet-N.pdf`.

**Découverte en écrivant le test d'intégrité (D6bis)** — le test « deux sessions différentes
ne partagent jamais les mêmes PDF » a sorti un second cas que la revue avait manqué :
l'entrée `ARCHIVE.gaps` 2016/m `session: "exceptional"` portait les `localPdfUrls` de la
session **principale**, alors que son propre champ `reason` documente une session *absente
de la source*. Impact réel nul aujourd'hui (`ARCHIVE.gaps` n'est rendu nulle part dans
`js/` — grep : uniquement `tests/archive.test.mjs` et `scripts/VERIFY_PDFS.md`), mais c'est
un piège armé pour le jour où les trous seront affichés. Les `localPdfUrls` ont été retirés
de cette entrée : un trou documente une absence, il n'annonce pas des PDF.

---

## 3. Défauts confirmés par lecture du code

### D7 — `pdf-renderer.js` : le correctif de fuite mémoire n'est jamais branché

`disposePdfViewer` et `disposeAllPdfViewers` (`:298`, `:310`) sont exportés avec le commentaire
« *Bug #B18 … fuite mémoire cumulative à chaque consultation* ». Recherche sur tout le dépôt :

```
js/ui/pdf-renderer.js:298  export function disposePdfViewer(host)
js/ui/pdf-renderer.js:310  export function disposeAllPdfViewers(scope)
tests/bug-fixes-2026-09-17.test.mjs:360-363   assert.equal(typeof mod.disposePdfViewer, "function")
```

**Aucun appel applicatif.** Le seul test vérifie `typeof === "function"` : il prouve l'export,
pas l'effet. Pendant ce temps `strategy.js:139-146` (`setPdfPreview`) réécrit le conteneur et
remonte un viewer à chaque clic sur « الموضوع 01 / 02 », et `bindToolbar:230` accroche
`globalThis.addEventListener("resize", state.onResize)`. Ce listener est une racine forte vers
la closure → `state` → `state.pdf` (document pdf.js) : la `WeakMap` ne libère rien.

À faire : appeler `disposeAllPdfViewers()` avant chaque `setInternalHTML` qui remplace un écran
ou un aperçu PDF.

### D8 — `pdf-renderer.js` : `state.resizeTimer` est du code mort

`bindToolbar:220` déclare `let resizeTimer = null` **local** à la fonction. `disposePdfViewer:301`
teste `state?.resizeTimer`, qui n'est jamais assigné → `clearTimeout` ne s'exécute jamais.
Un resize survenant < 500 ms après un dispose relance `renderAll` sur un `pdf` détruit.

### D9 — `sw.js` : les PDF `exceptional` échappent au cache borné

Le commentaire `sw.js:73-76` explique que les PDF doivent aller dans le cache runtime borné à 20
entrées, sinon « *42 Mo de sujets pouvaient s'y accumuler sans jamais être libérés* ». Or
`isRuntimeAsset:81` :

```
/\/subjects\/(?:SE|M|TM)\/(?:\d{4}|\d{4}-[a-z]{1,3})\/sujet-\d+\.pdf$/
```

ne couvre pas le segment `exceptional/` :

```
borne      /subjects/SE/2025/sujet-1.pdf
NON BORNE  /subjects/M/2017/exceptional/sujet-1.pdf
```

Ces fichiers tombent dans `fetchShellOrAsset:181`, qui met **tout** GET local 200 dans
`SHELL_CACHE`, sans aucune borne. Les autres scripts du dépôt gèrent pourtant ce segment
(`scripts/audit-pdfs.mjs:63` et `scripts/extract-native-pdfs.mjs:30` ont `(?:\/exceptional)?`) —
le SW est le seul à l'ignorer.

### D10 — `simulation.js` : « examen silencieux » et bouton d'évaluation A/B/C coexistent

`simulationExamHTML:81` affiche pendant l'épreuve :
> « اختبار صامت: لا تلميح، لا إجابة نموذجية، لا تشخيص ولا نقطة أثناء الاختبار »
> *(examen silencieux : pas d'indice, pas de corrigé, pas de diagnostic ni de note pendant l'épreuve)*

Et la ligne 98, seulement quand `!completed`, ajoute un bouton **تقييم نوعي** dont le handler
(`qualitativeLabel:191-197`) renvoie un diagnostic noté :

```js
if (length < 80)  return "يحتاج إلى تطوير — C — …";
if (length < 220) return "جيد — B — …";
return "ممتاز — A — إجابة مفصلة ومنظمة.";
```

C'est bien un diagnostic et bien une appréciation, et il ne dépend **que de la longueur** :
220 caractères de hors-sujet valident « ممتاز — A ». Soit on retire le bouton de l'épreuve
active (il reste légitime en relecture), soit on assume le diagnostic et on réécrit l'annonce.

### D11 — `store.save()` à chaque frappe, sans debounce

`persistAnswers` (`simulation.js:169-189`) se termine par `store.save()`, branché sur
`input` en trois endroits (`:267`, `:346`, `:426`). `save()` (`store.js:377-383`) fait un
`JSON.stringify` de **tout** l'état — toutes années, tous sujets, tous exercices. Sur mobile,
chaque keystroke resérialise potentiellement plusieurs Mo.

`js/ui.js:78` définit un `debounce(fn, wait = 350)`… qui n'est **appelé nulle part**
(une seule occurrence dans `js/`, la définition).

### D12 — la CI n'exécute pas les portes d'acceptation du projet

`.github/workflows/quality.yml` lance `lint`, `typecheck`, `format:check`, `test`, `build`,
`release:verify`, `docs:check`, `test:e2e`. Il ne lance **ni** `p1:check`, **ni** `p2:check`,
**ni** `p3:check` — qui sortent tous les trois en **exit 1** :

```
p1:check  exit=1   P1: INCOMPLET (3/6)   0/40 inventaires complets ; 0/2235 copies vérifiées
p2:check  exit=1   P2: INCOMPLET (6/7)   0/5 élèves distincts
p3:check  exit=1   P3: INCOMPLET (5/6)   0 payload annuel/PDF précaché
```

La CI est donc verte pendant que le projet déclare lui-même ses critères non remplis. C'est un
choix défendable (ces lots attendent du travail humain), mais il doit être explicite : soit un
job `gates` en `continue-on-error`, soit une ligne dans le README.

---

## 4. Dette et incohérences

### D13 — `pdfAvailable` : champ mort, contradictoire, verrouillé par les tests

Aucune occurrence dans `js/`. Il n'existe que dans les tests et le générateur :

```
tests/archive-years.test.mjs:44   assert.equal(sujet.pdfAvailable, false);
tests/lazy-loading.test.mjs:33    assert.equal(year.sujets[0].pdfAvailable, false);
tests/data-integrity.test.mjs:55  « pdfAvailable et pdfExternalUrl sont cohérents »
scripts/generate-archive-years.mjs:1361   pdfAvailable: false,
```

Les **40 sujets** ont `pdf: null, pdfAvailable: false` alors que `pdfLocalUrl` pointe vers un
fichier qui existe. La vraie source de vérité est `pdfLocalUrl` (`js/ui/pdf-viewer.js:20`).
Le test `data-integrity.test.mjs:55` ne contrôle que le sens `true`, donc il ne voit rien ;
les deux autres **assertent** la valeur trompeuse. La suite de tests protège l'incohérence.

### D14 — un `blocker` sans libellé arabe

```
émis    : …, exercise-not-inventoried, …
libellé : (absent)
```

`official-coverage.js:195` émet `exercise-not-inventoried` ; `ui/coverage-messages.js:1-11`
ne le connaît pas → l'élève voit le texte générique « دليل الأهلية غير مكتمل » au lieu du motif
réel. (Contrôle corrigé : `inventory-missing` est bien émis via le littéral `:74`, et
`coverage-unknown` sert de repli — ces deux-là sont corrects.)

### D15 — duplication et code mort

- `escapeHTML` recopié à l'identique **trois fois** : `js/ui.js:71`, `js/ui/pdf-viewer.js:13`,
  `js/ui/screens/simulation.js:7`.
- `debounce` (`js/ui.js:78`) jamais appelé — voir D11. **Résolu au lot 3** : la copie morte a
  été supprimée de `js/ui.js` et remplacée par `js/application/debounce.js`, effectivement
  utilisé par `simulation.js` (avec `flush`/`cancel`/`pending`).
- `strategy.js:204-210` : `assertSimulationEligible(coverage)` est appelé **dans la branche
  `if (coverage.simulationEligible)`**, or cette fonction ne lève que si
  `!report.simulationEligible` (`official-coverage.js:259-263`). Le `catch` est inatteignable.
- `text-analysis.js:341-392` : le cas vide (`:343-351`) renvoie un objet **sans** `poleType`,
  le cas nominal (`:382-391`) avec. Forme de retour incohérente.
- `text-analysis.js:1-8` : en-tête « ENGINE … + minuteurs fiables » alors que les minuteurs ont
  été déplacés dans `js/application/timers.js`.

### D16 — documentation dérivée des données

| Affirmation | Réalité mesurée |
| --- | --- |
| `README.md:165` « **19 années** dans `APP_CONFIG.years` » | `APP_CONFIG.years.length = 20` (14 SE + 6 m) |
| `README.md:167` « **2021 SE est volontairement absente** des cartes d'épreuve » | `2021` est dans `YEAR_CATALOG` (`enabled: true`, `answerMode: "free"`) et `examOpenable = true` sur S1 et S2 (`freeAnswerEligible: true`) |
| `README.md:236` 2025 « aucun PDF local ; liens externes uniquement » | `subjects/SE/2025/sujet-1.pdf` existe (1 099 674 o) et `pdfLocalUrl` y pointe |
| `patches/apply-patches.sh` « all **19** archive entries have `contentVerified: true` » | **16** entrées, dont **10** en `contentVerified: true` (6 non : 2021/se, 2022–2026/m) |

En revanche l'en-tête de `data/archive.js:23-24` est **exact** (12 `access_confirmed`,
4 `consulted`, 10 `contentVerified`, 12 viewers bloqués — vérifié entrée par entrée).

La cause : `scripts/update-doc-metrics.mjs` ne régénère que le bloc `<!-- AUTO-METRICS -->`.
La prose autour n'est validée par rien, et c'est là que la dérive s'installe.

### D17 — poids du dépôt et tension juridique

Chiffres **mesurés** le 2026-09-18 (`find … -name '*.pdf' -printf '%s'`, `du -sm .git`),
en remplacement des estimations initiales :

```
M         15 PDF   29,92 Mio   ← PDF bruts dzexams, servis par AUCUN chemin local
SE        17 PDF   50,08 Mio   ← idem
subjects  58 PDF   41,10 Mio   ← les seuls servis/shippés
pack Git : 105 Mio
```

`M/` et `SE/` ne sont ni dans `PUBLIC_DIRECTORIES` (`server.mjs:52`), ni dans `dist`,
ni ignorés par `.gitignore` : **80 Mio de matière première suivie par Git**.

**Rectificatif du 2026-09-19.** Une première correction de ce bloc (commit `4de925a`)
affirmait « 0 référence par chemin local » et « 21 URL externes ». Ces deux chiffres
étaient **faux** : la recherche avait été faite avec un filtre d'extensions qui excluait
`subjects/manifest.json`. Mesure refaite sur tout le dépôt, hors `.git`, `node_modules`
et `dist`, en cherchant le nom de fichier de chacun des 32 bruts :

- **30** apparaissent en **chemin local** dans `subjects/manifest.json`, champ `"source"`
  (par exemple `"source": "M/dzexams-bac-sciences-2770867.pdf"`). C'est de la
  **provenance** : aucun module de `js/` ni script ne lit `manifest.json` à l'exécution —
  vérifié par recherche de `manifest.json` dans `js/`, `scripts/`, `tests/`, `server.mjs`.
- **12** apparaissent **à l'intérieur d'une URL externe** `https://www.dzexams.com/…`
  dans `data/archive.js` (17 occurrences de cette forme au total) : l'application lie
  ces sujets à distance, la copie locale n'est pas utilisée.
- **1** n'a aucune référence : `SE/dzexams-bac-sciences-2116452.pdf`.

La conclusion pratique ne change pas — les bruts ne sont ni servis ni lus à l'exécution —
mais le raisonnement qui y menait était faux, et `manifest.json` doit être mis à jour si
`M/` et `SE/` sont retirés, sinon la provenance pointerait dans le vide.

S'y ajoute un **test négatif** : `tests/server.test.mjs:82` exige
`/BAC2025_SVT_Sujet1.pdf` → **404**. Le dépôt teste donc activement que ces fichiers ne
sont pas servis — tout en les stockant.

Point à trancher avec le porteur du projet : `LICENSE-CONTENT` et `NOTICE` excluent
explicitement les sujets d'examen et les scans de la licence et écrivent qu'ils
« *must not be redistributed without documented permission* », alors que **121,10 Mio** de
ces scans (90 PDF, mesuré) sont suivis par Git. `docs/CONTENT_RIGHTS.md` est cité comme
référence — il faut soit une permission documentée, soit sortir ces binaires du dépôt
(Git LFS ou stockage externe).

#### D17bis — `docs/CONTENT_RIGHTS.md` affirme un retrait qui n'a jamais eu lieu

`docs/CONTENT_RIGHTS.md:13` écrit :

> Les 32 PDF tiers auparavant suivis par Git ont été retirés de cette branche faute de
> preuve de redistribution.

C'est **faux**, et mesurable en une commande :

```console
$ git ls-tree -r --name-only HEAD | grep '\.pdf$' | grep -cE '^(M|SE)/'
32
```

Les 32 fichiers sont présents dans `HEAD` (`b10b175`) **et** dans `origin/main` ; les
90 PDF sont strictement identiques entre les deux (`diff` vide sur la liste triée). Le
retrait décrit n'a donc été effectué sur aucune branche.

Deux conséquences. D'abord, un document de conformité décrit une remédiation jamais
réalisée : quiconque s'y fierait avant publication croirait le contenu tiers absent
alors qu'il est servi. Ensuite, le périmètre réel est plus large que les « 32 PDF » :
`subjects/manifest.json` rattache les **58 PDF servis** à ces bruts par son champ
`"source"`, donc le sujet juridique porte sur 90 fichiers, dont 58 accessibles au public.

Ni la décision de retirer ni la réécriture d'historique ne relèvent d'un audit. En
revanche, **corriger l'affirmation fausse ne dépend de personne** : c'est un fait mesuré.

### D18 — divers

- ~~`test-results/.last-run.json` est suivi alors que `test-results/` figure au `.gitignore`~~
  **Corrigé** : retiré de l'index (`git rm --cached`), le fichier reste sur disque et la règle
  `.gitignore:7` s'applique désormais.
- ~~`server.mjs:23` : `frame-ancestors 'self' https://*.e2b.app` — le domaine de la sandbox de
  développement est codé en dur dans l'en-tête de sécurité de production.~~ **Corrigé** : la
  valeur vient de `CSP_FRAME_ANCESTORS`, défaut `'self'`, validation au démarrage sans repli
  permissif (`resolveFrameAncestors`, 4 tests). Documenté dans `docs/DEPLOYMENT.md`.
- `tests/hard-benchmark/cases.json` = `{"cases": []}` et `audit-manifest.json` = `{"records": []}`.
  `hard-benchmark.test.mjs:56` s'appelle littéralement « *cases.json peut rester vide — aucune
  copie n'est inventée* » : le test valide le vide. Honnête, mais cela signifie que
  **toute la chaîne de calibration tourne à vide** (`0/149 pôles`).
- 408 tâches dans les inventaires, dont **149 officielles et 259 reconstruites (63 %)**.
  L'affichage est honnête (badge ⚠️, `allowReconstructedPrompts: true`), mais la majorité de ce
  que l'élève lit comme « tâches » en mode épreuve n'est pas le texte officiel.
- `store.js:296` durcit `150 * 60` pour la filière maths alors que `EXAM_MINUTES_BY_STREAM.m`
  vaut déjà 150 (`data/subjects.js:124-127`) — constante dupliquée, et `examMinutesForYear`
  autorise une surcharge par année qui ferait diverger les deux.
- ~~Racine encombrée : `01a07c55-….patch` (360 Ko), `ANALYSE_LIGNE_PAR_LIGNE.md` (80 Ko),
  `CONTINUATION.md`, `_v1_backup/`, `patches/` (tout est déjà appliqué selon
  `patches/INDEX.md`).~~ **Traité le 2026-09-18** : les cinq éléments sont archivés sous
  `docs/history/` (déplacement suivi par Git, rien n'est supprimé). Voir
  `docs/history/README.md` pour le rôle de chacun et l'avertissement sur les numéros de lignes
  périmés de `ANALYSE_LIGNE_PAR_LIGNE.md`.

---

## 5. Ce qui est réellement bon

À conserver tel quel, c'est au niveau de l'état de l'art pour un projet de cette taille :

- **`js/store.js`** — `validateState` en liste blanche stricte (`:272-322`), `migrateState`
  qui refuse de deviner (`:172-259`), sauvegarde de l'état corrompu avant rejet
  (`backupMalformed:324-330`), v2 mis de côté plutôt que mal migré (`:360-365`),
  réconciliation des minuteurs au chargement (`_reconcileTimers:396-413`).
- **`js/services/diagnostics.js`** — scopes en liste blanche (`:11-31`), noms d'erreur en liste
  blanche (`:32-43`), bornes `MAX_ERROR_BUCKETS`/`MAX_COUNTER`, aucun payload conservé,
  paramètre de contexte explicitement nommé `_discardedContext`. C'est le meilleur module du dépôt.
- **`server.mjs`** — surface publique en liste blanche (`:30-42`), rejet des segments `.`/`..`/
  dotfiles, double contrôle `normalize` + `realpathSync` contre l'évasion par symlink
  (`:92-98`), CSP stricte sans `unsafe-inline`, MIME explicites, `no-cache` sur les points
  d'entrée stables.
- **`build.mjs`** — `verifiedBuildMetadata` refuse de builder si `app-version.js` est périmé
  (`:28-38`), et `buildStandalone` **échoue** s'il reste une référence externe dans le HTML
  (`:68-79`). Digest de release déterministe.
- **`data/subjects.js`** — `validateLoadedYear` (`:297-314`) refuse un payload dont l'identité,
  le nombre de sujets ou le nombre d'exercices diverge du catalogue ; `loadYear` mutualise les
  promesses concurrentes (`:322-342`) et nettoie `pendingYears` en erreur.
- **`js/domain/subjects/official-coverage.js`** — ~40 validations structurelles par inventaire,
  `null` assumé plutôt qu'un 0 ou un 100 % trompeur, séparation nette
  `strictEligible` / `relaxedEligible` avec le prix de chaque assouplissement écrit dans
  `data/bac-mode-policy.js`.
- **`data/subjects.js:14-35` `normalizeArabic`** — la décision de **ne pas** supprimer le hamza
  isolé pour ne pas confondre `ماء` (eau) et `ما` (particule) est le genre de détail qui
  distingue un traitement de l'arabe sérieux d'un `toLowerCase()`. Idem pour
  `PROTECTED_STEMS` (`:43-90`) qui empêche `بروتين → روتين`.
- **`js/ui/screens/simulation.js`** — les replis sont annoncés à l'élève, jamais silencieux
  (`FALLBACK_NOTICE:221-228`), et rien n'est inventé quand le PDF n'est pas extractible
  (`renderFreeAnswerExam:275-285`).

---

## 6. Plan d'action proposé

**Lot 1 — bloquants fonctionnels — ✅ TRAITÉ le 2026-09-18**

Corrigé dans `js/store.js`, `server.mjs`, avec régressions verrouillées par
`tests/bug-fixes-2026-09-18.test.mjs` (12 tests) et `tests/server.test.mjs` (+8 tests) :

1. **D1** — `resolveByteRange()` extrait en fonction pure et exportée ; le suffixe
   `bytes=-N` renvoie désormais les N derniers octets, les plages impossibles répondent
   **416** avec `Content-Range: bytes */size`. Mesure réelle sur
   `subjects/SE/2025/sujet-1.pdf` : `bytes=-500` → `bytes 1099174-1099673/1099674`
   (avant : `bytes 0-500`, 501 octets).
2. **D4** — `scratch.free` borné. **Découverte en cours de route, absente de l'audit** :
   `officialTaskAnswers` souffrait du même défaut non borné — c'est pourtant là que
   `persistAnswers()` écrit la réponse de l'élève en mode épreuve. Les deux sont plafonnés
   via la constante nommée `MAX_PERSISTED_TEXT` (60 000), qui remplace les quatre `60000`
   littéraux. Poids `localStorage` mesuré après injection de 2 × 5 Mo : **120 834 octets**.
3. **D2/D3** — `KNOWN_YEAR_IDS` dérivé de `YEAR_CATALOG` (20 = 20, plus aucune dérive
   possible) ; `enterSession` passe sur `isCatalogYear`. `enterSession("9999")` et
   `enterSession("2013-m")` sont désormais rejetés. Au passage, le `150 * 60` dupliqué de
   `validateState` utilise `EXAM_MINUTES_BY_STREAM.m`.

`js/app-version.js` et le bloc `AUTO-METRICS` du README ont été régénérés
(`npm run pwa:version`, `npm run docs:update`) : 273 → 293 tests après le lot 1, 320 après les
lots 2 et 3, puis **324 tests, 323 pass, 0 fail, 1 skipped** après les lots 4 et 5 (le skip est
le test réseau `pdfUrl accessibles`) ; `lint`, `typecheck`, `format:check`, `build`,
`release:verify`, `docs:check`, `calibration:check`, `inventory:check` tous exit 0.

**Lot 2 — intégrité du contenu — ✅ TRAITÉ le 2026-09-18**

Corrigé dans `data/archive.js` et `sw.js`, verrouillé par `tests/pdf-content-integrity.test.mjs`
(4 tests neufs, dont **3 échouent contre le code d'origine** en nommant exactement les défauts) :

4. **D6** — l'entrée 2017/m `exceptional` pointe sur `/subjects/M/2017/exceptional/sujet-N.pdf`.
   Contrôle HTTP réel (serveur local) : `613049` et `556196` octets servis, empreintes
   `2d067cc0dc4a…` et différentes de la session principale (`2541dbf0dc4a…`, `877849` o) ;
   `Range: bytes=-500` → **206** `bytes 612549-613048/613049`.
5. **D6bis** (découvert par le test) — `localPdfUrls` retirés du trou `ARCHIVE.gaps` 2016/m.
6. **D9** — `(?:\/exceptional)?` ajouté au regex `isRuntimeAsset`. C'était **indissociable** de
   D6 : rendre les PDF exceptionnels accessibles les aurait fait retomber dans le cache shell
   non borné, exactement le risque que le commentaire de `sw.js:73-76` décrit.
7. **Test d'intégrité bidirectionnel** — toute référence de `data/` existe sur disque, tout PDF
   du disque est référencé, deux sessions distinctes ne partagent jamais les mêmes fichiers,
   et **tout** PDF du disque est reconnu par `isRuntimeAsset` (donc rien ne fuit dans le cache
   shell). Les 58 PDF sont maintenant couverts, 0 orphelin.

**Lot 3 — brancher ce qui est déjà écrit — ✅ TRAITÉ le 2026-09-18**

Verrouillé par `tests/pdf-dispose.test.mjs` (7 tests), `tests/pdf-lifecycle.test.mjs` (3 tests
d'intégration sur l'application réelle, **les 3 échouent contre le branchement d'origine**),
`tests/debounce.test.mjs` (4 tests) et `tests/answer-persistence.test.mjs` (4 tests, **3
échouent contre le code d'origine**).

8. **D7** — `disposeAllPdfViewers()` branché aux cinq endroits où un sous-arbre porteur de
   visionneuses est détruit : les trois remontages de `simulation.js`, l'aperçu de
   `strategy.js`, et `goHome()`. Pour les tiroirs, `createDialogManager` reçoit un crochet
   `onClose(element)` appelé **avant** `element.remove()` — le gestionnaire de dialogs reste
   ainsi indépendant du rendu PDF. Mesure : changer d'aperçu de sujet détruit le document
   pdf.js précédent (avant : abandonné), fermer le tiroir du sujet retire son listener
   `resize`, retourner au hub ramène le compte de listeners à **0**.
9. **D8** — le minuteur de redimensionnement vit sur `state.resizeTimer` et non plus dans une
   fermeture locale ; `disposePdfViewer` l'annule réellement et marque `state.disposed`, donc
   un minuteur en attente ne re-rend plus un document détruit. Le bloc `catch` de
   `mountPdfViewer` appelle `disposePdfViewer` au lieu de dupliquer le nettoyage.
10. **D11** — `js/application/debounce.js` (helper partagé, avec `flush`/`cancel`/`pending`)
    remplace le `debounce` mort de `js/ui.js`. La frappe met l'état à jour immédiatement puis
    regroupe l'écriture (350 ms) ; `flushAnswers()` écrit de façon synchrone à chaque point de
    sortie — remise de copie, fin de temps, changement d'exercice — plus `pagehide` et
    `visibilitychange`. Le filet est branché sur `window` et non `globalThis` : sous Node
    `globalThis` n'est pas une `EventTarget`, le filet y était donc silencieusement absent et
    impossible à tester. Mesure : après frappe, l'état contient la réponse alors que
    `localStorage` ne la contient pas encore ; après remise, il la contient **sans attente**.
11. **D10 — tranché** : « تقييم نوعي » est **retiré de l'épreuve active** et **conservé en
    relecture**. L'annonce « اختبار صامت : … لا تشخيص ولا نقطة أثناء الاختبار » redevient vraie,
    et la fonctionnalité est déplacée plutôt que supprimée — en relecture le diagnostic est
    explicitement permis (`bindQualitativeChecks()` est maintenant appelé dans les deux
    branches). `renderBacReadingMode` (« وضع القراءة ») n'est pas une épreuve : inchangé.
    `tests/all-buttons.test.mjs` mis à jour : il asserte désormais l'**absence** du bouton
    pendant l'épreuve et sa **présence** en relecture, sans note numérique dans les deux cas.
    *Reste ouvert, hors périmètre* : le barème A/B/C de `qualitativeLabel` ne mesure que la
    longueur du texte — il récompense la verbosité, pas la qualité.

**Découvertes imprévues en cours de lots 2–3 — ✅ CORRIGÉES le 2026-09-18**

Deux défauts trouvés en écrivant les tests des lots précédents, ni l'un ni l'autre dans la
revue initiale :

A. **Sous Node, `globalThis` n'est pas une `EventTarget`** — mesuré :
   `globalThis.addEventListener` vaut `undefined`, donc `globalThis.addEventListener?.(…)` est
   un non-appel silencieux. Conséquence double : le filet `pagehide`/`visibilitychange` de D11
   et l'accroche `resize` de `pdf-renderer.js` étaient **impossibles à tester**, donc jamais
   vérifiés — et un filet de sauvegarde qu'on ne peut pas tester est un filet dont on ne sait
   pas s'il existe. Les deux sont désormais résolus sur `globalThis.window || globalThis`
   (identique en production, où `globalThis.window === globalThis`), et les tests enregistrent
   les accroches en enveloppant les méthodes de la fenêtre jsdom sans casser la délégation.
B. **L'aperçu de sujet de l'écran de stratégie survivait au passage à l'épreuve.** Un écran
   masqué garde son DOM : le visionneur restait accroché à `resize` avec son document pdf.js
   ouvert pendant toute l'épreuve. Corrigé dans `onNavigate` de `js/ui.js`, qui libère les
   visionneuses de tous les écrans **sauf** la cible. Sans risque parce que l'invariant a été
   vérifié sur les 14 appels à `showScreen(…)` : chacun est précédé d'un rendu de l'écran
   affiché (`renderHub` / `renderGuide` / `renderStrategy` / `renderWorkspace` et les trois
   rendus de `simulation.js`), donc l'écran cible est toujours remonté.

**Lot 4 — moteur et calibration — ✅ TRAITÉ le 2026-09-18**

12. **D5** — `countConnectorHits()` remplace `CONNECTORS.filter((c) => normText.includes(c))`.
    Les formes sont pré-normalisées, les connecteurs d'un seul mot ne matchent que sur **token
    entier**, les locutions (« عن طريق ») sur tokens bornés par des espaces. Mesure sur les trois
    entrées de l'audit :

    | entrée | avant | après |
    | --- | --- | --- |
    | empilement de mots-clés SVT (13 mots) | 3 connecteurs | **0** |
    | réponse rédigée (13 mots) | 4 connecteurs | **5** |
    | `ان` détecté dans « فقدان » / « انزيم » | oui | **non** |

    Verrouillé par 3 tests dans `tests/bug-fixes-2026-09-18.test.mjs` (le test central échoue
    contre le code d'origine). **Calibration rejouée : inchangée — `0 copie comparée, 0/149
    pôles, non calibré`.** Il n'existe aucune copie réelle doublement annotée dans
    `tests/hard-benchmark/`, donc D5 ne peut pas être validé empiriquement : c'est une
    correction de défaut avéré, pas une amélioration mesurée.

    **Conséquence assumée** : deux copies « acceptable » du mini banc BAC baissent, parce que
    leurs bornes étaient calées sur le détecteur bogué. Chacune ne contient qu'**un** vrai
    connecteur (« يرتبط » ; « إلى »), l'ancien comptage ajoutant « في » ⊂ « فيتوقف » et
    « ان » ⊂ « فقدان ». L'ordre excellent > acceptable > fausse réponse est **préservé**
    (1.000 / 0.675 / 0.000 et 1.000 / 1.000 / 0.000). Au passage, le seuil
    `connectorHits >= 2` (`methodology.js:289,800`) se révèle avoir été **inopérant** : sous le
    bug, tout texte de 12 mots atteignait 2 correspondances accidentelles. Il discrimine
    réellement pour la première fois, et son calibre n'est validé par aucune copie réelle — il
    est signalé dans le test, **pas desserré** (le desserrer sans données de calibration
    remplacerait un défaut mesuré par un réglage arbitraire).
13. **Statut du moteur tranché** : `js/engine.js` + `js/domain/evaluation/**` (2 634 lignes)
    restent un **actif d'audit et de calibration**, pas de la dette à archiver. Vérifié : aucun
    module d'interface ni `js/main.js` ne les importe ; seuls les tests et le banc les exercent.
    Le statut est maintenant écrit dans l'en-tête de `js/engine.js` — c'est précisément parce
    qu'il ne l'était pas que D5 a pu rester invisible : du code de scoring jamais exécuté en
    production ne remonte par aucun canal.

**Lot 5 — hygiène — ✅ TRAITÉ le 2026-09-18**

14. **D13** — `pdfAvailable` **supprimé** des 40 sujets et du générateur
    (`scripts/generate-archive-years.mjs`, non branché sur npm et qui n'émettait de toute façon
    pas `pdfLocalUrl` : les données sont maintenues à la main). Le garde-fou de
    `tests/data-integrity.test.mjs` est réécrit sur les invariants réels — `pdf: null`
    (chargement paresseux), source externe ou note, et **interdiction de résurrection** du champ.
    Les deux tests qui l'assertaient à `false` assertent maintenant `pdf: null` + `pdfLocalUrl`.
15. **D14** — libellé arabe ajouté pour `exercise-not-inventoried`, plus un test
    d'**exhaustivité** qui extrait tous les blockers émis (`blockers.push("…")` **et** les
    tableaux littéraux) et vérifie que chacun a un libellé distinct du message générique.
    *Note de méthode* : la première version de ce test comparait au mauvais libellé de repli et
    passait à vide — la mutation de contrôle l'a révélé, elle est corrigée.
16. **D15** — `escapeHTML` factorisé dans `js/ui/dom.js` (une seule implémentation, trois
    imports) ; `debounce` mort supprimé de `js/ui.js` au lot 3 ; `try/catch` inatteignable de
    `strategy.js` remplacé par le garde booléen équivalent (même table de vérité, vérifiée cas
    par cas) et import `assertSimulationEligible` retiré. `tests/security-baseline.test.mjs`
    renforcé : il interdit désormais toute redéfinition locale d'`escapeHTML`.
17. **D16** — README corrigé sur les points contredits par les données, **mesurés avant
    écriture** : `APP_CONFIG.years` = **20** (2013–2026 SE + 2021–2026 M), 2021 SE
    `enabled: true` en `answerMode: "free"`, **40/40** sujets avec `pdfLocalUrl` (12 cellules du
    tableau de provenance disaient « aucun »), `ARCHIVE.gaps` = exactement 2 entrées
    (`2016 m exceptional`, `all tm main`). `patches/apply-patches.sh` : « 19 entrées, toutes
    vérifiées » → **16 entrées, dont 10** `contentVerified: true`.
    *À noter* : une première rédaction affirmait « pas de 2023 SE » — c'était faux, 2023 SE
    existe ; corrigé avant commit.
18. **D12** — `p1/p2/p3:check` + `calibration` ajoutés à `.github/workflows/quality.yml` en
    `continue-on-error` avec `if: always()`. Ils échouent aujourd'hui (**P1 3/6, P2 6/7,
    P3 5/6**) : les rendre bloquants mettrait la CI au rouge permanent et ferait ignorer tous
    les autres signaux. Publiés sans bloquer, avec instruction de retirer
    `continue-on-error` dès fermeture des critères.
19. **D17 — documenté, pas résolu.** 58 PDF, **42 Mo** dans `subjects/`, suivis par Git (`.git`
    pèse 104 Mo, donc présents dans l'historique et pas seulement dans l'arbre). La permission
    de redistribution de ces énoncés officiels **n'est pas établie**. Le README porte maintenant
    un encadré d'avertissement explicite avec les deux issues possibles (sortir `subjects/` du
    dépôt, ou documenter une autorisation). **Je n'ai pas supprimé ni déplacé ces fichiers** :
    c'est une décision éditoriale et juridique qui appartient au propriétaire du dépôt, pas une
    correction automatique.
