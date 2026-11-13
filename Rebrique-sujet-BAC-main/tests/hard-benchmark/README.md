# Hard Benchmark — validation sur copies réelles à double correction

`cases.json` est volontairement vide : **ne jamais inventer une copie d'élève**.
Le moteur de notation n'est pas considéré comme fiable tant qu'il n'existe pas un
corpus de copies réelles, anonymisées, et évaluées indépendamment par deux
correcteurs humains distincts.

## État et historique du corpus

Le corpus vérifié contient **0 copie au 2026-08-26**.

Un lot de 72 entrées ajouté précédemment a été exclu. L'historique Git montre qu'il
a été ajouté en une seule modification, sans artefacts de provenance auditables :
aucun scan anonymisé, manifeste de collecte, consentement, journal d'import ou preuve
d'horodatage séparé des annotations. Les champs JSON indiquaient des centres, des
collecteurs et deux pseudonymes de correcteurs, mais une déclaration interne ne
permet pas de vérifier ces faits.

Les deux correcteurs déclarés avaient donné exactement la même note pour les 72
entrées, d'où un écart moyen de `0,00`. Cette valeur était un simple calcul sur le
JSON, pas une preuve d'accord intercorrecteurs. Faute de pouvoir vérifier que les
annotations avaient été faites séparément, aucune métrique issue de ce lot ne doit
être publiée comme calibration.

## Règle de validation

Chaque copie doit contenir **deux annotations indépendantes**. Une annotation
porte une note chiffrée pour le pôle et une justification. Si les deux notes
s'écartent matériellement, ajoutez une `adjudication` par un troisième
correcteur avant de l'utiliser pour calibrer le moteur.

```json
{
  "id": "2025-S1-E1-N-001",
  "year": "2025",
  "sujet": 1,
  "exercise": 1,
  "pole": "N",
  "category": "scientifically-wrong",
  "auditId": "AUD-2026-0001",
  "answer": "... transcription fidèle, fautes comprises ...",
  "source": "lot anonymisé X",
  "collector": "collecteur-01",
  "annotations": [
    {
      "annotator": "correcteur-01",
      "score": 0.5,
      "note": "notion ARN présente, problème mal formulé",
      "completedAt": "2026-08-25T09:00:00.000Z",
      "blindedToPeer": true,
      "blindedToEngine": true
    },
    {
      "annotator": "correcteur-02",
      "score": 0.5,
      "note": "réponse partielle, formulation insuffisante",
      "completedAt": "2026-08-25T11:00:00.000Z",
      "blindedToPeer": true,
      "blindedToEngine": true
    }
  ],
  "date": "2026-08-25"
}
```

Les seules catégories admises sont `strong`, `weak`, `scientifically-wrong` et
`off-topic`. Les identifiants des correcteurs et des collecteurs doivent être
pseudonymisés. Ne stockez jamais nom, prénom, établissement, numéro de candidat,
date de naissance, signature, scan non anonymisé ou toute autre donnée personnelle.
La procédure détaillée et le formulaire hors dépôt sont dans
[`COLLECTION_PROTOCOL.md`](COLLECTION_PROTOCOL.md).

## Collecte obligatoire

1. Obtenir l'autorisation de collecte et anonymiser la copie avant toute saisie.
2. Transcrire mot pour mot, y compris les erreurs utiles à l'évaluation.
3. Faire noter séparément la réponse par **deux correcteurs** sans leur montrer
   l'autre annotation ni le score du moteur.
4. En cas de désaccord important, faire arbitrer par un troisième correcteur et
   renseigner `adjudication`.
5. Conserver, hors du dépôt public, un dossier d'audit protégé reliant l'identifiant
   pseudonyme à l'autorisation, au scan anonymisé et aux deux formulaires de correction
   horodatés. Publier dans la pull request un manifeste sans données personnelles avec
   les empreintes SHA-256 de ces artefacts et l'identité du responsable de vérification.
6. Faire contrôler le manifeste par une personne qui n'est ni le collecteur ni l'un
   des deux correcteurs. Deux pseudonymes différents dans le JSON ne suffisent pas à
   prouver l'indépendance.
7. Importer uniquement le JSON anonymisé et exécuter les tests.

## Import

```bash
node tests/hard-benchmark/import-copy.mjs /tmp/copie.json --dry-run --audit-manifest=/tmp/audit-manifest.json
node tests/hard-benchmark/import-copy.mjs /tmp/copie.json
npm run test:hard
```

L'import refuse les copies avec une annotation unique ou avec deux annotations
portant le même identifiant de correcteur. Il vérifie aussi que le pôle existe
réellement dans `data/subjects.js`.

## Métriques et révision des règles

```bash
npm run calibration
```

Le rapport affiche la couverture par pôle et catégorie, l'erreur absolue moyenne
entre le moteur et la référence humaine, le biais de sur/sous-évaluation, les
faux positifs, les faux négatifs et l'écart moyen entre les deux correcteurs.
Pour l'analyse binaire uniquement, « positif » signifie une note normalisée d'au
moins 60 %. C'est une convention de calibration interne, **pas** un seuil officiel
de réussite au BAC. Avec zéro copie, le rapport affiche explicitement `non calibré` :
aucune métrique ne doit être inventée.

Le champ `scorePromotionAllowed` ne devient vrai que si chacun des pôles dont la consigne est officiellement vérifiée possède au moins 15 copies et couvre les quatre catégories. La liste est dérivée de `APP_CONFIG` (149 pôles actuellement, soit **2 235 copies au minimum**). Les pôles reconstruits restent qualitatifs et ne peuvent pas acquérir un score numérique par effet de bord.

La couverture ne suffit pas. `data/calibration-policy.js` fixe avant collecte les six portes quantitatives : MAE normalisée ≤ 15 %, biais normalisé absolu ≤ 5 %, faux positifs ≤ 10 %, faux négatifs ≤ 10 %, désaccord intercorrecteurs normalisé ≤ 15 %, plus les 15 copies et quatre catégories par pôle. Une métrique absente bloque la promotion. `npm run calibration:check` garantit que le statut public consommé par l'interface correspond au corpus audité.

Toute évolution de règle après copies réelles suit
[`RULE_REVIEW.md`](RULE_REVIEW.md) et doit commencer par un test de régression
sur la copie anonymisée concernée.

## Seuil avant toute promesse de « correcteur »

Ne présentez pas les scores comme une correction BAC avant d'avoir, au minimum :

- 15 copies réelles par pôle actif, couvrant réponses fortes, faibles, fausses
  et hors sujet ;
- deux annotations indépendantes par copie ;
- des mesures publiées d'écart score moteur / score humain, de sur- et
  sous-évaluation, et de désaccord entre correcteurs.

Avant ces mesures, le produit reste un **outil de feedback méthodologique**.
