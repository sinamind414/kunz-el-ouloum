# Revue des règles après copies réelles

Ne modifiez jamais une règle parce qu'une seule copie a obtenu un score inattendu.
Une copie peut être mal transcrite, un correcteur peut diverger, ou la réponse peut
être réellement ambiguë.

## Déclencheur de revue

Ouvrir une revue lorsqu'au moins une condition est vérifiée sur un même pôle :

- trois copies ou plus sont surévaluées ou sous-évaluées de manière semblable ;
- l'écart moteur/humain est supérieur ou égal à 0,5 point pour deux copies ;
- les deux correcteurs humains convergent mais le moteur diverge ;
- un faux positif scientifique est identifié.

## Procédure

1. Vérifier l'anonymisation, la transcription et l'identité du pôle.
2. Lire séparément les deux justifications humaines.
3. Ajouter une adjudication si les notes humaines divergent.
4. Écrire une hypothèse de règle : faux synonyme, mot interdit abusif,
   longueur, mauvaise contrainte documentaire ou erreur scientifique non détectée.
5. Ajouter un test de régression représentant la copie avant de modifier le moteur.
6. Modifier la règle minimale nécessaire dans `data/subjects.js` ou le domaine
   d'évaluation.
7. Exécuter `npm test` et `npm run calibration`.
8. Documenter la décision, la date, le pôle et le résultat dans la pull request.

## Interdictions

- Ne pas baisser une règle pour faire passer artificiellement une réponse modèle.
- Ne pas utiliser de copie synthétique comme preuve de fiabilité.
- Ne pas modifier la note humaine pour se rapprocher du moteur.
- Ne pas annoncer « validé par des professeurs » sans corpus, identité des
  annotations et métriques publiées.
