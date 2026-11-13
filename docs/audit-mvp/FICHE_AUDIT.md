# Fxx — Nom de la fonctionnalité

> Modèle à copier sous `Fxx-nom.md`. Ne pas remplir les résultats par anticipation.
> Plan : [README](README.md). Registre : [inventaire](INVENTAIRE.md).

## Identification et contrat attendu

- Date, auteur, commit et état du répertoire : à renseigner.
- ID(s), profil, statut d'accès, support et version : à renseigner.
- Besoin réel de l'utilisateur : à renseigner.
- Entrée dans l'interface → action → résultat observable : à renseigner.
- Critères d'acceptation et limites annoncées : à renseigner.
- Documents : préciser actuel / historique / proposition et leurs éventuels écarts.

## Traçabilité

| Élément | Fichier / symbole / référence | Observation |
|---|---|---|
| Porte d'entrée et sortie | À renseigner | À vérifier dans l'interface |
| Vue et moteur | À renseigner | À renseigner |
| Contenus et sources pédagogiques | À renseigner | À renseigner |
| Générateur, si applicable | À renseigner | Ne pas éditer sa sortie |
| Persistance et réseau | À renseigner | Distinguer local, synchronisé et restaurable |
| Dépendances fonctionnelles et IDs | À renseigner | À renseigner |
| Tests existants | À renseigner | Présents / exécutés / résultats |

## Scénarios et preuves

Définir des entrées et résultats attendus concrets avant l'essai. Couvrir le
chemin nominal puis uniquement les cas pertinents. Expliquer les « non applicable ».

| Scénario | Profil / support / prérequis | Résultat attendu | Résultat observé | Preuve |
|---|---|---|---|---|
| Parcours nominal complet | À renseigner | À renseigner | Non exécuté | — |
| Retour, abandon et reprise | À renseigner | À renseigner | Non exécuté | — |
| Rechargement et persistance | À renseigner | À renseigner | Non exécuté | — |
| Hors ligne et retour réseau | À renseigner | À renseigner | Non exécuté | — |
| Accès absent, refusé ou expiré | À renseigner | À renseigner | Non exécuté | — |
| Entrée vide ou incorrecte, erreur de service | À renseigner | À renseigner | Non exécuté | — |
| Mobile RTL, clavier et feedback | À renseigner | À renseigner | Non exécuté | — |

Pour une preuve : commande et sortie, test identifié, capture ou reproduction
précise datée. Ne pas publier de données élèves, secrets ou copies personnelles.
Un succès HTTP ne valide pas un écran. Un test unitaire ne valide pas à lui seul
un parcours complet. Préciser web, PWA ou APK réel ; ne pas extrapoler entre eux.

## Résultats

- **Faits établis et preuves :** à renseigner.
- **Interprétations / hypothèses :** à renseigner séparément.
- **Non vérifié / limites :** à renseigner.
- **Défauts reproduits :** sévérité, étapes, attendu, observé et impact utilisateur.
- **Qualité pédagogique :** conformité, sources, pertinence du retour et limites.
- **Conservation des données et confidentialité :** à renseigner.
- **Redondances, complexité et maintenance :** à renseigner.

Sévérité : bloquant (parcours ou données compromis), majeur (résultat principal
incorrect ou contournement important), mineur (gêne sans empêcher le résultat).

## Verdict et recommandation MVP

- État fonctionnel : **à auditer** tant que les preuves ne permettent pas de trancher.
- Périmètre effectivement validé : à renseigner.
- Recommandation : conserver / simplifier / fusionner / différer / retirer du MVP.
- Justification par valeur, usage observé ou supposé, effort et dépendances.
- Corrections nécessaires pour conserver la fonction : à décrire, pas à exécuter
  implicitement dans le cadre d'un audit en lecture seule.
- Décision de périmètre : proposée / retenue, date et origine de la décision.
- Documentation à compléter et critères de nouvelle vérification : à renseigner.

Mettre à jour l'inventaire avec le verdict, un lien vers cette fiche et la
recommandation. Une recommandation non retenue reste une proposition.
