# F05 — Parcours guidé et bilans d'unité

Audit : 2026-10-30, `67afd92`. Invité, Chromium bureau/mobile.
Contrat : retrouver la prochaine tâche, ouvrir son contenu, suivre l'avancement
et le conserver. Distinguer les déclarations de l'élève des résultats mesurés.

## Traçabilité

- [Vue parcours](../../src/components/ParcoursView.tsx).
- [Construction du chemin](../../src/lib/parcours/parcoursPath.ts).
- [Persistance et statuts](../../src/lib/parcours/parcoursProgress.ts).
- [Prochaine activité](../../src/lib/parcours/nbaEngine.ts).
- Dépendances : F01–F03, F06, F11, F22, F24 et F40.

## Scénarios et preuves

| Scénario | Résultat |
|---|---|
| Accueil → « mon parcours » | Trois domaines et 85 tâches : 74 leçons + 11 bilans |
| Profil neuf | Une ligne disponible ; 84 lignes verrouillées sans bouton d'ouverture |
| Ouvrir la première tâche | La bonne leçon HTML s'ouvre et l'état commencé est enregistré |
| Cliquer le cercle de validation | Première tâche terminée, deuxième ouverte, rappel J+14 enregistré |
| Annuler cette validation | Première tâche redevient disponible, deuxième se reverrouille |
| Revalider et recharger le document | Validation et rappel conservés en stockage |
| Vue mobile 390×844 | Largeur document 390/390, pas de débordement horizontal global observé |
| Réinitialiser le parcours | Données effacées immédiatement, sans dialogue : L01-05 |

Preuves : `F05-*` et `mobile-parcours-overflow` dans le
[journal navigateur](preuves/lot01/browser-results.json),
[capture bureau](preuves/lot01/13-parcours.png),
[capture mobile](preuves/lot01/17-mobile-parcours.png).
Les tests `ParcoursView`, `parcoursPath` et `parcoursProgress` font partie du lot vert.

## Sémantique de progression à clarifier

Le cercle valide une leçon **sur déclaration**, sans exiger sa lecture complète
ni la réussite d'une réponse. Il s'agit d'un comportement explicite du code et
du libellé « marquer comme mémorisé », pas d'un bug technique déduit de l'audit.
Il ouvre la tâche suivante et programme une révision.

La vue appelle ensuite ces leçons « consolidées » ; il faut éviter d'interpréter
cette progression comme une maîtrise démontrée. Les bilans sans score sont
traités différemment dans `metaDe` (« lu / non testé »). Cette distinction est
importante pour le choix MVP et les indicateurs enseignants futurs.

La fin d'une leçon active observée en F03 ne crée pas automatiquement une
validation de parcours dans ce scénario ; l'audit ne suppose pas un lien automatique
que le code ne promet pas. Le workflow doit expliquer la validation déclarative.

## L01-05 — Réinitialisation sans protection

**Modérée, confiance élevée.** Après une validation persistée, ouvrir le parcours
et cliquer « réinitialiser le parcours ». Aucun dialogue natif ni étape intermédiaire
n'est observé ; `done` et `reviews` deviennent vides. Pas d'annulation proposée.
Test réalisé uniquement sur un contexte invité jetable.

Cause : [gestionnaire direct](../../src/components/ParcoursView.tsx:473)
appelant `resetParcours()` puis le rafraîchissement de la vue. La petite taille
et la proximité de ce contrôle avec le suivi augmentent le risque de perte
accidentelle : cette appréciation UX est une interprétation, pas une mesure d'usage.

## Verdict et MVP

**Partielle du point de vue de la protection des données et de la promesse de
progression ; mécanique déclarative validée sur les scénarios décrits.**

Proposition : **conserver et simplifier**, avec vocabulaire explicite sur les
déclarations, protection de la réinitialisation et cohérence avec les reprises.
Décision de périmètre : proposée, non arrêtée.

Non vérifiés : traversée des 85 tâches, fin réelle des onze bilans QCM, droits
payants sur tout le chemin, échéances à date avancée, migrations d'anciens profils,
restore de sauvegarde et APK. Les dépendances F06/F11/F22/F24 seront auditées
dans leurs lots, sans considérer les sondages de F05 comme leur validation complète.
