# F12 — Textes à trous dans les quiz

## Contrat et périmètre

Audit du 30/10/2026, référence `9bccc8b`, élève invité, Chromium local.
Le texte à trou appartient au quiz F10 : aucune application séparée n'est
nécessaire. Besoin : produire une notion au lieu de reconnaître une option,
recevoir un retour qui distingue une réponse exacte d'une contradiction.

## Traçabilité

| Élément | Source | Observation |
|---|---|---|
| Corpus | `src/data/fillBlanks.ts` | Généré ; 161 entrées brutes, **121 exportées**, 40 consignes vides filtrées |
| Chargement | `fillBlanksLoader.ts` | Import différé, cache, nouvelle tentative après échec ; repli QCM seul |
| Intégration | `App.tsx`, `versQuizQuestions` | Questions de l'unité ajoutées au corpus QCM ; identifiants 9 000 000 + rang |
| Interaction | `QuizView.tsx` | Champ RTL, bouton désactivé si vide, validation par Entrée, réponse verrouillée |
| Validation | `utils/fillBlankValidate.ts` | Normalisation, mots-porteurs dédupliqués, seuil de couverture de 60 % |
| Tests | `fillBlanksLoader.test.ts`, `fillBlanks.integrity.test.ts`, `fillBlankValidate.test.ts`, `QuizView.fillBlank.test.tsx` | Exécutés ; ne couvrent pas à eux seuls la validité sémantique |

`fillBlanks.ts` est une sortie générée : un éventuel changement de contenu doit
passer par son générateur selon `docs/agents/DONNEES_GENEREES.md`.

## Essais et preuves

Parcours réel : leçons → cartes mentales → U1 → quiz immédiat → portail
introductif → questions du quiz. Traversée des QCM précédents à partir des
attendus techniques ; trois textes à trous contrôlés.

| Cas | Résultat observé |
|---|---|
| Champ vide | Bouton de validation désactivé |
| Réponse sans rapport `WRONG` | Refusée, correction disponible, champ verrouillé après validation |
| Réponse officielle sur la complémentarité | Acceptée ; validation par Entrée |
| Négation de l'attendu sur le gène | Affichée « إجابة صحيحة » malgré la contradiction |
| Associations de bases inversées, appel au vrai validateur dans Chromium | `correct: true`, couverture **1**, comme pour l'attendu exact |
| Rechargement d'une séance inachevée | Pas de reprise de la séance ; ne pas confondre résultat final et brouillon |

Captures 08–10 et entrées `F12-*` des
[résultats navigateur](preuves/lot03/browser-results.json).
Le contre-exemple des bases est enregistré dans
[les compléments](preuves/lot03/supplement-results.json),
`F12-reversed-pairing-validator`. Ce second essai appelle le moteur réel dans
la page, sans prétendre être un second parcours complet dans le formulaire.

## Défaut reproduit — L03-02, majeur pédagogique

Le validateur compare un ensemble de mots, pas leurs relations ni la négation.
Pour `fb_1_3`, l'attendu est `A تقابل T وG تقابل C في ADN` ; la réponse
`A تقابل C وG تقابل T في ADN` contient les mêmes mots et reçoit 100 % de
couverture. Dans le formulaire réel, préfixer la définition attendue par
`ليس صحيحا أن` conserve aussi la validation « réponse correcte ».

Attendu : une contradiction explicite ne doit pas recevoir un crédit de
réussite. Impact : faux apprentissage et résultat de quiz surestimé.
Le seuil de 60 % et les tests actuels n'empêchent pas ce cas.

## Verdict et proposition MVP

**Partielle : saisie et retour fonctionnent, fiabilité pédagogique insuffisante.**
Conserver la production courte si la validation devient adaptée aux notions,
ou présenter le résultat comme un repérage de mots à vérifier sans crédit de
maîtrise. Ne pas généraliser une similarité lexicale en preuve de compréhension.

Valeur supposée : rappel actif ; redondance importante avec les QCM sources.
La fréquence d'usage et la justesse de toutes les réponses ne sont pas mesurées.
Pas d'APK, d'écriture arabe sur appareil réel, de dictée ni de PWA à froid testés.
Un chargement déjà effectué n'est pas une preuve de fonctionnement hors ligne
au premier démarrage. Recommandation proposée, aucun correctif appliqué.
