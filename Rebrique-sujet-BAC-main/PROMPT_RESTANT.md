# PROMPT — travail restant après l'option B

**Date :** 19 septembre 2026
**Branche :** `arena/01a0b332-rebrique-sujet-bac`
**Commit de référence :** `1305400` (vérifié : `local == distant == 1305400`)
**CI :** vert, 17/17 étapes
**Destination :** à remettre à un agent pour exécution.

---

## Point de situation mesuré

Ne rien refaire de ce qui suit : c'est **terminé et vérifié sur le distant**.

| Porte       | État           | Détail                                                    |
| ----------- | -------------- | --------------------------------------------------------- |
| **P3**      | **6/6** ✅     | bloquant en CI depuis `7a1f2d3`                           |
| **P1**      | 3/6            | P1.1, P1.2, P1.5 bloqués — voir ci-dessous                |
| **P2**      | 6/7            | P2.7 bloqué                                               |
| Calibration | 0 copie        | renoncement acté par le propriétaire                      |

Également terminé : les 32 PDF bruts retirés de l'index (`M/`, `SE/`, 80,00 Mio),
`subjects/manifest.json` sans aucune source locale, `.gitignore` mis à jour,
`docs/CONTENT_RIGHTS.md` en version 1.1, décisions 1 à 3 enregistrées dans
`PROMPT_DECISIONS_PROPRIETAIRE.md`, et tout l'audit D1–D18.

### Les trois portes restantes et leur cause

- **P1.1** — `0/58 inventaires complets`, 576 tâches connues → dépend de la **relecture humaine**.
- **P1.2** — `0/58 sujets à 100 % de couverture explicite` → idem.
- **P1.5 / P2.7** — `0/2235 copies`, `0/5 élèves` → dépend de la **décision 2**
  (renoncement acté, donc volontairement bloqués).

---

## Ce que l'agent ne doit PAS tenter

Trois choses n'appartiennent pas à un agent. Les contourner produirait un résultat faux ou
une régression :

1. **Obtenir l'autorisation de redistribution.** C'est une démarche juridique du propriétaire.
2. **Relire un sujet d'examen à la place d'un humain.** Voir « Piège n° 1 » plus bas.
3. **Purger l'historique Git** (`git filter-repo`) sans accord écrit explicite : l'opération
   réécrit tous les SHA et impose une rotation des clones.

---

## TRAVAIL A — Dossier de demande d'autorisation (étape A) — exécutable immédiatement

C'est le seul travail à forte valeur **réalisable sans attendre**, et c'est ce qui débloque
la tâche du propriétaire.

### Constat mesuré

`subjects/` contient **58 PDF servis au public** (41,10 Mio), tous tiers :

```bash
node -e '
const m = require("./subjects/manifest.json");
console.log("entrées :", m.length);
console.log("avec URL externe :", m.filter(e => /^https:\/\//.test(e.source || "")).length);
console.log("sans URL        :", m.filter(e => !e.source).length);
'
```

| Dimension  | Mesure                                                              |
| ---------- | ------------------------------------------------------------------- |
| Entrées    | 58                                                                  |
| Filières   | `M` : 30 · `SE` : 28                                                |
| Années     | 2013 → 2026 (14 millésimes)                                         |
| Sessions   | `main` : 56 · `exceptional` : 2                                     |
| Pages      | 221 au total                                                        |
| Provenance | 44 avec URL dzexams documentée · **14 sans URL documentée**         |

### Ce qu'il faut produire

Un **dossier de demande**, prêt à envoyer au titulaire, sous `docs/rights/request-dossier.md` :

1. **Tableau complet des 58 fichiers** : chemin dans le dépôt, année, filière, session,
   nombre de pages, et URL source dzexams **lorsqu'elle est connue**.
2. **Liste des 14 fichiers sans URL documentée**, signalés explicitement comme tels. Ne pas
   chercher à compléter ces URL : une URL devinée est pire qu'une URL absente dans un
   document juridique.
3. **Objet de la demande** : redistribution des sujets au sein de l'application, à
   distinguer du simple lien externe.
4. **Un paragraphe de contexte** rappelant que `LICENSE-CONTENT` exclut ces contenus et
   exige une permission documentée — c'est le fondement de la démarche.

Le tableau doit être **généré** depuis `subjects/manifest.json`, pas recopié à la main, pour
rester exact si le manifeste change.

### Vérification

```bash
# le tableau couvre bien les 58 entrées, sans doublon ni omission
node -e '
const fs = require("fs");
const d = fs.readFileSync("docs/rights/request-dossier.md", "utf8");
const m = require("./subjects/manifest.json");
const missing = m.filter(e => !d.includes(e.file));
console.log("fichiers du manifeste absents du dossier :", missing.length, "(attendu 0)");
'
npm run format:check && npm run docs:check && npm test
```

### Piège

Le dossier est un document **juridique**. Aucune extrapolation : si une donnée n'est pas
mesurée, elle est marquée « non documenté », jamais estimée.

---

## TRAVAIL B — Analyse d'impact de l'alternative — exécutable immédiatement

Le propriétaire doit choisir entre **obtenir l'autorisation** et **cesser de servir** les
58 PDF au profit de liens externes. Il ne peut pas trancher sans en connaître le coût.

Produire `docs/rights/external-links-impact.md` :

1. **Ce qui casserait.** Recenser précisément ce qui consomme les fichiers locaux de
   `subjects/` : `js/ui/pdf-viewer.js` (la branche « fichier local » — `<iframe>` masquée en
   repli du rendu `<canvas>`, et l'attribut `download`), le précache ou l'absence de précache
   (`sw.js`), `scripts/verify-release.mjs`, et les tests qui vérifient la présence des PDF.
   S'appuyer sur des mesures, pas sur une intuition.
2. **Ce qui existe déjà.** `data/archive.js` lie déjà une partie des années vers
   `https://www.dzexams.com/…` : mesurer combien des 58 sujets disposent d'une URL externe
   exploitable (44 selon le manifeste — à confirmer fichier par fichier).
3. **Les 14 sans URL.** Conséquence : ces sujets deviendraient inaccessibles, ou exigeraient
   une source alternative à documenter.
4. **Verdict chiffré** : nombre de sujets basculables sans perte, nombre de sujets perdus.

### Vérification

Chaque affirmation doit être accompagnée de la commande qui la produit. Aucune estimation.

---

## TRAVAIL C — Encodage des inventaires officiels — déclenché par le propriétaire

**Ne rien encoder tant qu'aucune transcription relue n'a été fournie.**

### État mesuré

```bash
npm run pdftext:status
```

| classe             | sujets | sens                                     |
| ------------------ | ------ | ---------------------------------------- |
| `propre`           | 8      | arabe logique, en-tête officiel verbatim |
| `transposé`        | 20     | ordre des ligatures inversé              |
| `formes-visuelles` | 4      | Arabic Presentation Forms                |
| `scan`             | 24     | aucune couche texte                      |
| `indéterminé`      | 2      | aucun marqueur reconnu                   |

Les 8 sujets `propre` : `2020/SE1`, `2020/SE2`, `2021/SE1`, `2021/SE2`, `2021-m/M1`,
`2021-m/M2`, `2020-m/M1`, `2020-m/M2`.

**Déjà tranché (décision 4, puis commit `ac206be`, puis décision 6)** : la décision 4
(2026-09-19) avait fait des 18 sujets Maths 2013–2020 (+ la session exceptionnelle 2017)
des armatures « copie libre ». Ce statut a été rapporté en deux temps : **Maths 2016–2020**
structurées en 4D le 2026-09-19 (commit `ac206be`, demande du propriétaire), puis les
**8 sujets Maths 2013–2015 + 2017 استثنائية** encodés en 4D le 2026-09-20 (décision 6,
`PROMPT_DECISIONS_PROPRIETAIRE.md`) depuis une extraction Tesseract OCR
(`scripts/lib/ocr.mjs`, preuves dans `scripts/extracted/M/**`, notation `provisional`).
Puis **SE 2021 (2 sujets)** — la dernière armature « copie libre » — a été structurée en 4D
le **2026-09-20** (prolongement de la décision 6 demandé par le propriétaire, même pipeline
OCR ; preuves dans `scripts/extracted/SE/2021/`, barème 5+7+8 lu sur le sujet, notation
`provisional`). **Il n'existe plus aucune armature « copie libre »** : le TRAVAIL C concerne
donc les **58 sujets** encodés en 4D dont les inventaires doivent être complétés, puis
certifiés par relecture.

### Pourquoi l'agent ne peut pas encoder de lui-même

Même sur les mieux classés, la mesure montre des **chiffres corrompus** — le barème de
`2021/SE1` s'extrait `05 / 40 / 00` au lieu de `5 + 7 + 8` — et des **coupures parasites**
(248 sur `2021/SE1`, 59,6 % des tokens font 3 lettres ou moins). Recopier sans relecture
injecterait des consignes **et des barèmes faux**. La règle reste : **aucune consigne ne
passe en `official` sans source lisible** — l'exception est tranchée par le propriétaire,
pas par l'agent (la décision 6 du 2026-09-20 est ce cas exact, assumé et marqué
`provisional`).

### Ce que l'agent NE doit PAS faire ici

Ne pas « terminer » une armature en y recopiant des consignes ou un barème lu dans un PDF de
ce corpus sans décision du propriétaire : les chiffres y sont corrompus. C'est exactement ce
qui a été tranché deux fois par le propriétaire (décision 6 pour les Maths 2013–2015 + 2017
استثنائية, puis son prolongement pour SE 2021, toutes le 2026-09-20) : encodage OCR assumé,
marqué `provisional`. Il ne reste plus aucune armature à trancher.

### Procédure, une fois une transcription fournie

1. Encoder le découpage officiel dans `data/official-tasks.js`.
2. `npm run inventory:generate`
3. `npm run inventory:check`

### Durcissement à faire ENSUITE

`js/domain/subjects/official-coverage.js` définit `relaxedEligible`, repris par
`simulationEligible = strictEligible || relaxedEligible`. Ce mode relaxé n'exige ni inventaire
`complete` ni `scoringReviewStatus === "verified"` — d'où **58 sujets éligibles malgré 0/58
inventaires complets** (48/488/213 jusqu'au 2026-09-19 ; 56/552/261 après la structuration
Maths 2013–2015 + 2017 استثنائية ; 58/576/277 après celle de SE 2021). À durcir quand les
inventaires réels existent, pas avant.

Référence utile : `data/official-tasks.js` porte `source.humanVerified`, à `false` par défaut.
Une seule entrée est vérifiée à ce jour : `2025/S1`.

### Piège n° 1 — le plus coûteux du dépôt

Une couche texte `propre` n'autorise **pas** un encodage automatique. C'est l'erreur qui
corromprait silencieusement consignes et barèmes. En cas de doute, ne pas encoder.

---

## TRAVAIL D — Documentation du protocole de collecte — optionnel

La décision 2 étant un **renoncement à la calibration**, ce travail n'est utile que si cette
décision est rouverte. À ne lancer que sur demande explicite.

Contenu attendu : une procédure pas à pas destinée aux correcteurs humains, fondée sur
`tests/hard-benchmark/COLLECTION_PROTOCOL.md` (rôles séparés, `auditId` non signifiant,
`consentRef` opaque, anonymisation, SHA-256, `blindedToPeer` / `blindedToEngine`), et sur
`import-copy.mjs` (`--dry-run` n'écrit rien ; l'import échoue si l'audit ne correspond pas).

---

## Ordre d'exécution

1. **A** (dossier de demande) — aucune dépendance, débloque le propriétaire.
2. **B** (analyse d'impact) — aucune dépendance, éclaire son choix.
3. **C** — attendre les transcriptions. Ne jamais anticiper.
4. **D** — uniquement si la décision 2 est rouverte.

## Vérification finale, à chaque lot

```bash
npm ci --no-audit --no-fund
npm test                         # attendu : 366 tests, 365 pass, 0 fail, 1 skipped
for s in lint typecheck format:check build release:verify docs:check \
         calibration:check inventory:check p3:check; do npm run $s; done
npm run pwa:version              # après toute édition de js/** ou des data/ servis
npm run docs:update              # en dernier, après tout ajout de test()
```

`p1:check` et `p2:check` renvoient `exit 1` : c'est **attendu et documenté** (P1.1/P1.2 en
attente de relecture, P1.5/P2.7 bloqués par la décision 2). Ils sont publiés en CI sans
bloquer. Ne jamais les « réparer » en assouplissant un critère.

## Pièges transversaux

- **`js/app-version.js` périmé** dès qu'on édite `js/**`, `sw.js` ou les `data/` servis.
  Symptôme : 3 tests rouges « js/app-version.js is stale ». Correctif : `npm run pwa:version`
  **une seule fois, après toutes les éditions**. Déjà rencontré et corrigé au commit `97e60c4`.
- **`data/official-tasks.js` et `data/calibration-status.js` sont générés** — ne jamais les
  éditer à la main.
- **`gh pr edit` échoue silencieusement** sur ce dépôt (GraphQL `projectCards`). Utiliser
  `gh api -X PATCH repos/Allintelligence2024/Rebrique-sujet-BAC/pulls/28 --input <json>`.
- **Preuve de push** : seule fait foi
  `git ls-remote origin 'refs/heads/arena/01a0b332-rebrique-sujet-bac'`. Un SHA local ne
  prouve rien. Exiger cette preuve de tout agent intervenant sur ce dépôt.
- **Les 80 Mio restent dans l'historique.** `git rm --cached` ne purge rien. Tant que
  `git filter-repo` n'est pas décidé, les contenus tiers restent clonables.
