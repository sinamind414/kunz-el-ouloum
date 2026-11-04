# P2 — protocole de test élève sur mobile bas de gamme

P2.7 exige des observations humaines. Les tests automatisés ne remplacent pas cinq élèves et aucune session synthétique ne doit être enregistrée comme une observation réelle.

## Recrutement et consentement

- Recruter au moins cinq élèves qui préparent le BAC algérien.
- Expliquer que le test évalue l’interface, pas l’élève ni son niveau scientifique.
- Obtenir un consentement explicite avant la session. Pour un mineur, appliquer la procédure de consentement responsable définie par l’établissement et la réglementation applicable.
- Conserver les formulaires de consentement hors du dépôt, dans un espace à accès limité.
- Attribuer un identifiant aléatoire à chaque session et un code participant aléatoire stable pour distinguer les élèves sans les identifier. Ne conserver aucune table reliant ce code à une identité dans le dépôt.
- Ne jamais enregistrer nom, téléphone, courriel, établissement, adresse IP, voix ou copie personnelle dans Git.

## Appareil admissible

Utiliser le téléphone quotidien de l’élève s’il est considéré bas de gamme ou ancien : écran d’environ 360–430 px CSS, mémoire annoncée ≤ 4 Gio ou appareil âgé d’au moins quatre ans. Noter seulement une classe d’appareil non identifiante, par exemple `android-low-360`.

## Scénario identique pour chaque session

1. Depuis l’accueil, choisir la filière et l’année demandées.
2. Atteindre une consigne d’exercice sans aide de l’observateur.
3. Passer librement à un autre exercice.
4. Ouvrir la fiche d’aide d’une étape.
5. Ouvrir le sujet depuis la copie, répondre à au moins deux tâches, remettre la copie puis vérifier la relecture verrouillée.
6. Ouvrir puis fermer une fenêtre au clavier si un clavier externe ou une technologie d’assistance est utilisée.

L’observateur ne doit expliquer un terme qu’après que l’élève a signalé le blocage. Toute aide est comptée.

## Mesures obligatoires

Pour chaque session réelle, ajouter dans `data/usability-study.js` un objet agrégé contenant uniquement :

```js
{
  id: "p2-<code de session aléatoire>",
  participantCode: "student-<code participant aléatoire>",
  consentVerified: true,
  realParticipant: true,
  deviceClass: "android-low-360",
  lowEndDevice: true,
  completed: true,
  secondsToFirstQuestion: 75,
  observerInterventions: 0,
  misunderstoodTerms: ["terme affiché"],
  draftInsertedAndVerified: true,
  testedAt: "AAAA-MM-JJ"
}
```

Mesurer ensuite :

- taux d’abandon = sessions non terminées / sessions commencées ;
- médiane du temps d’accès à une première question ; utiliser `null` si une session abandonnée n’atteint jamais de question ;
- nombre d’interventions de l’observateur ;
- fréquence de chaque terme incompris ;
- réussite de la remise et de l’ouverture de la relecture.

## Règle de fermeture

`npm run p2:check` reste en échec tant que moins de cinq élèves distincts disposent d’une session réelle, consentie et admissible. Plusieurs sessions portant le même `participantCode` ne comptent que pour un élève. Après cinq élèves, publier les agrégats, corriger les incompréhensions récurrentes, refaire au moins une vérification ciblée, puis documenter la décision. Inventer des élèves, changer leur code pour les compter deux fois ou recopier une même session est interdit.
