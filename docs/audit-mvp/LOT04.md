# Lot 04 — F16 à F20

Audit du 30/10/2026, référence `9bccc8b`, modifications documentaires du lot 03
encore locales. Aucun code produit, barème, signature ni fichier protégé modifié.

| Fonction | Verdict borné | Proposition MVP |
|---|---|---|
| [F16 — Meftah](F16-meftah.md) | Consultation et modèles masqués fonctionnels ; renvoi au verbe peu ciblé | Conserver comme entrée de méthode |
| [F17 — Boussole/cartes](F17-boussole.md) | Lecture disponible, impression intégrée tronquée | Unifier les références et fiabiliser l'export |
| [F18 — Tadwin](F18-tadwin.md) | Première fiche et rappel fonctionnels, réécriture et nouvelles fiches bloquées | Simplifier et fermer la boucle d'écriture avant extension |
| [F19 — Correction ouverte](F19-correction-ouverte.md) | Forme, diagnostics et réserve humaine distincts ; approbation locale ambiguë | Conserver comme aide, attester la provenance humaine |
| [F20 — Bilans rédaction](F20-bilans-redaction.md) | Brouillons sauvegardés, bilan disponible ; reprise et impression partielles | Conserver le carnet, réparer la reprise contextuelle |

## Vérifications réalisées

- Chromium **156.0.8078.4**, Playwright Python, invité jetable, bureau 1280×900 ;
  sondage tactile 390×844 pour Meftah et Tadwin.
- **44 observations et 35 images** dans les relevés finaux ; aucune exception
  JavaScript de page ni erreur de scénario restante.
- **487 tests ciblés réussis**, répartis sur **30 fichiers distincts** ; typecheck réussi.
- Parcours Meftah : modèle BAC caché puis révélé ; renvoi au verbe examiné.
- Impression A4 via Chromium et inspection visuelle/texte des PDF avec PyMuPDF.
- Tadwin : C2=100 %, fiche J+1 sauvegardée ; rappel révélé et auto-évalué sous
  horloge simulée ; contre-exemple C2=0 % quand même envoyé en consolidation.
- Méthode : production sans rapport ICM=50, refusée en file ; modèle technique
  ICM=100, enregistré et transmis à la file locale.
- Correcteur : réponse vide → zéro point automatique sur les six groupes
  2025 ; réserve manuelle maintenue ; examen du panneau officiel S1-Ex3.
- Bilans : sauvegarde à la frappe, revue, reprise, conservation après recharge
  et contre-épreuve de reprise d'une famille de consigne non standard.

Les réponses modèles vérifient le câblage. Ce ne sont pas des copies inédites
ni une évaluation de précision. Les corpus de calibrage ne servent pas de
validation indépendante. Les 30 fichiers ne s'ajoutent pas aux autres lots
comme des tests uniques.

## Défauts reproduits

| Référence | Gravité | Constat |
|---|---|---|
| L04-01 | Mineure | Le lien contextuel Meftah ouvre l'index général sans cibler le verbe demandé |
| L04-02 | Majeure pour l'impression | Carte intégrée : une seule page partielle, variant avec le défilement |
| L04-03 | Majeure | Après sa première fiche, Tadwin ne propose plus de nouvelle production ni de changement d'unité |
| L04-04 | Majeure pédagogique | Une réponse Tadwin à 0 % est sauvegardée et envoyée au rappel sans réécriture proposée |
| L04-05 | Modérée | Brouillon et choix de clés Tadwin perdus au rechargement avant soumission |
| L04-06 | Majeure de workflow | L'invité peut approuver lui-même le fond d'une production dans la file locale |
| L04-07 | Majeure pour l'export | Rapport enseignant imprimé vide depuis la position normale, contenu obtenu en remontant |
| L04-08 | Modérée | La reprise BAC d'une autre famille de consigne ouvre la famille par défaut et un champ vide |

Pour L04-08, le texte est toujours sauvegardé sous sa bonne clé : ce n'est pas
une suppression. Pour L04-06, aucune élévation de privilège sur API enseignant
n'est prouvée ; le défaut porte sur la provenance du statut affiché.

## Clarifications

La Boussole est désormais une fiche legacy dans l'écran de carte ; `MiftahCard`
et le HTML autonome sont distincts. L'HTML a produit quatre pages A4, pas un
recto/verso confirmé. Le commentaire « Tadwin non câblé dans App » est périmé.
L'ICM, le contrôle de forme, C2 et la note officielle sont des mesures différentes.
Une réserve humaine reste hors points automatiques et empêche une note finale
automatique définitive lorsqu'elle est présente.

## Limites et suite

Accès d'essai simulé uniquement pour la banque BAC et ses bilans ; aucun compte
ou abonnement réel validé. L'approbation locale en invité est testée séparément.
Pas de classe authentifiée, de synchronisation, d'APK, d'impression papier,
d'accessibilité exhaustive, de PWA à froid, de notation de copies indépendantes
ou de preuve d'efficacité pédagogique. Suites globales, Jest, build et CI
distante non relancés pour ce lot documentaire.

[Preuves et commandes](preuves/lot04/README.md), [journal](JOURNAL.md).
**20 fonctions examinées sur 50 ; 30 restantes.** Prochain lot : **F21–F25**,
flashcards SM-2, rappels, plan final, prochaine activité et banque d'idées BAC.
