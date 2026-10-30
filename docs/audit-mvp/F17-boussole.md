# F17 — Boussole et cartes de méthode

## Contrat et clarification

Audit du 30/10/2026, référence `9bccc8b`, Chromium local invité.
Besoin : disposer d'un aide-mémoire lisible et imprimable des gestes de rédaction.

La fiche Boussole initialement inventoriée n'est plus la carte principale :
Méthode → « بطاقة المفتاح — للطباعة » ouvre **`MiftahCard`** ;
**`BoussoleCard`** est dans un détail explicitement marqué « legacy ».
Le parent distingue aussi le HTML autonome `/miftah.html` de la version React.
`docs/SPEC_BOUSSOLE_NSOE.md` se déclare historique pour ses anciens libellés :
ne pas traiter toutes ses formulations comme le contrat actuel.

## Traçabilité

| Élément | Source | Observation |
|---|---|---|
| Porte et impression | `MethodologyCompilerView.tsx`, branche `boussole_card` | Carte principale, bouton A4, lien vers HTML, détail legacy |
| Carte actuelle intégrée | `MiftahCard.tsx`, `miftahSpec.ts` | Contenu React, règles d'impression locales |
| Boussole historique | `BoussoleCard.tsx`, `methodologyEngine.ts` | Étapes, familles de verbes et relecture inverse |
| Version autonome | `public/miftah.html` | Fichier protégé, lu et imprimé sans modification |
| Tests | `BoussoleCard.test.tsx`, `letterGrid.test.ts`, méthode | Exécutés ; pas une preuve de pagination réelle |

## Essais d'impression Chromium

Les PDF ont été générés par le moteur d'impression du navigateur en A4, puis
inspectés avec PyMuPDF. Pas de pilote d'imprimante ni de sortie papier réelle.
PDF locaux ignorés par Git ; images et texte extraits conservés comme preuves.

| Essai | Résultat |
|---|---|
| Carte intégrée | Présente à l'écran |
| Détail Boussole | Fiche legacy affichée après ouverture du détail |
| Impression de la carte depuis la position courante | 1 page, fragment de contenu et navigation de l'app présents |
| Même impression après retour en haut | Toujours 1 page, fragment différent ; carte incomplète |
| HTML autonome | 4 pages A4, y compris avec `prefer_css_page_size=True` |

Preuves : captures 08–11 et 29,
[relevé principal](preuves/lot04/browser-results.json),
[contre-épreuve](preuves/lot04/supplement-results.json).
La carte intégrée contient environ 9 621 caractères de texte visible ; les
sorties tronquées n'en extraient qu'environ 1 100 à 1 400. Ce comptage est un
indice supplémentaire ; les images montrent directement la coupure.

## L04-02 — majeur pour l'impression de la carte intégrée

Ouvrir la carte A4, parcourir le contenu, lancer l'impression : le PDF ne
restitue qu'un fragment de la zone défilante et conserve le cadre de navigation.
Remonter en haut change le fragment, sans exporter la carte complète.

Attendu : une fiche complète à imprimer. Observé : une seule page partielle.
Le conteneur applicatif à hauteur de fenêtre et défilement interne est une
cause probable ; aucune correction CSS n'a été appliquée dans cet audit.

Le HTML autonome constitue une autre voie de consultation, mais ses quatre
pages ne confirment pas l'annonce recto/verso. Sa pagination reste à fiabiliser ;
ce résultat ne signifie pas que son contenu est entièrement perdu.

## Verdict et proposition MVP

**Partielle : lecture disponible, impression intégrée incorrecte.** Fusionner
les références de méthode autour d'une fiche actuelle, en explicitant le statut
de la Boussole legacy. Conserver l'export seulement après contrôle de l'A4 et
du contenu complet, sans promettre deux pages sur la seule base du code.

Valeur plausible : aide-mémoire portable ; fréquence d'impression inconnue.
Pas de validation scientifique exhaustive, de papier réel ou d'APK. Les deux
cartes et le HTML sont des artefacts distincts, pas trois rendus certifiés égaux.
