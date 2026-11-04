# Protocole de validation d’accessibilité

## Audit automatisé inclus

- Noms accessibles de tous les champs générés.
- Régions `aria-live` des écrans et diagnostics.
- Contraste WCAG AA des couples textuels essentiels (minimum 4,5:1).
- Contrôles personnalisés remplacés par des boutons natifs.
- Tests de non-régression clavier sur la structure interactive.

Ces contrôles ne remplacent pas un essai humain avec technologie d’assistance.

## Parcours clavier manuel

Pour chaque thème (`dark`, `light`, `contrast`) et chaque écran :

1. Recharger, puis utiliser uniquement `Tab`, `Maj+Tab`, `Entrée`, `Espace` et `Échap`.
2. Vérifier que le focus est toujours visible et suit un ordre logique.
3. Ouvrir et fermer chaque dialogue et tiroir ; vérifier le confinement du focus et son retour au déclencheur.
4. Parcourir le hub, le guide, la stratégie, l’épreuve (choix d’exercice, champs de réponse), la remise de copie puis la relecture.
5. Saisir, dicter, contrôler une réponse, changer d’exercice, ouvrir le rapport et réinitialiser.
6. Vérifier qu’aucune action ne dépend du survol ou d’un clic de souris.

Consigner navigateur, système, date, étape, résultat et anomalie. Une anomalie bloquante interdit de déclarer le parcours validé.

## Lecteur d’écran manuel

Matrice minimale :

- NVDA + Firefox sous Windows ;
- VoiceOver + Safari sous macOS ou iOS ;
- TalkBack + Chrome sous Android.

Pour chaque combinaison disponible :

1. Vérifier l’annonce du nom de chaque nouvel écran.
2. Naviguer par titres, régions, formulaires et boutons.
3. Vérifier que chaque champ annonce sa consigne, son type et son état.
4. Déclencher un diagnostic, une notification ordinaire et une alerte urgente ; vérifier qu’ils sont annoncés une seule fois.
5. Contrôler les dialogues, tiroirs, onglets de l’Atlas, cartes révélables et retours de focus.
6. Vérifier que les changements de pôle et les résultats de diagnostic sont compréhensibles hors contexte visuel.

## Critère de sortie

La validation humaine n’est acquise qu’après un parcours complet sans blocage clavier et un essai réussi sur au moins un lecteur d’écran de bureau et un lecteur mobile. Tant que cette matrice n’est pas exécutée par une personne équipée, le statut reste **implémenté, contrôle humain en attente**.
