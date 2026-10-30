# F13 — Schémas à restituer de mémoire

## Contrat et périmètre

Audit du 30/10/2026, référence `9bccc8b`, Chromium local bureau et viewport mobile.
Invité : refus d'accès vérifié. Parcours ouvert : **essai simulé côté client**,
appels API interceptés ; aucun abonnement ni authentification serveur validés.

L'élève dessine sur papier, coche les éléments qu'il a réellement produits,
puis compare au modèle. Le logiciel **ne reconnaît pas le dessin**. Le score
est une auto-évaluation déclarative et les minutes sont une durée conseillée.

## Traçabilité

| Élément | Source | Observation |
|---|---|---|
| Entrée réelle | `src/data/revisionHub.ts`, bouton `revhub-schemas` | Rubrique Révision ; ce n'est plus une carte du hub entraînement |
| Vue | `SchemaDrillView.tsx` | Liste, filtre d'unité, dessin → grille → comparaison |
| Données | `src/data/schemaDrills.ts` | **18 exercices**, consignes, ordre, critères, points, pièges, image |
| Calcul | `scoreFromChecked`, `missingEssentials`, `verdictFor` | Points cochés et éléments essentiels manquants |
| Images | Assets SVG référencés par les données | Lecture seule ; image absente du DOM avant comparaison |
| Persistance | États React de la vue | Pas de score ni calendrier de rappel écrit par cette activité |
| Tests | `schemaDrills.lock.test.ts`, `SchemaDrillView.test.tsx` | Exécutés, y compris masquage de l'image |

La mention « officiel » dans l'interface ou les commentaires ne certifie pas que
chaque grille 1/2 points est un barème officiel BAC. Cette provenance n'a pas été
vérifiée exercice par exercice. Ne pas convertir ce score en note officielle.

## Scénarios et preuves

Relevés `F13-*` dans [les résultats](preuves/lot03/browser-results.json),
captures 11–14 et 27.

| Scénario | Résultat observé |
|---|---|
| Invité → Révision → schémas | Paywall ; sortie possible par navigation principale |
| Liste en essai simulé | 18 exercices ; filtre U5 → 2 ; second clic retire le filtre |
| Synapse, phase dessin | Consigne et ordre présents, aucune image de schéma rendue |
| Passage à la grille | Critères affichés, image toujours absente |
| Aucun élément coché | 0/12, verdict de reprise et essentiels oubliés |
| Tous les éléments cochés au clavier | 12/12, verdict de maîtrise déclarative ; image chargée |
| Recommencer | Coches effacées et image à nouveau cachée |
| Hors ligne, vue et image déjà chargées | Nouvelle auto-évaluation 0/12 possible |
| Quitter puis rouvrir | Retour à la phase dessin, sans conservation du résultat |
| Mobile tactile | Grille et boutons affichés sur 390×844 ; pas de test sur appareil Android |

Aucune écriture de résultat n'a été observée entre la grille et la comparaison.
C'est une limite du contrat actuel, pas une preuve de perte d'une sauvegarde
promise. La reprise doit être décidée si cette activité entre dans le parcours.
Le paywall sans retour local prolonge le constat partagé L01-04.

## Verdict et proposition MVP

**Parcours représentatif validé comme auto-évaluation papier**, pas comme
correction automatique ou maîtrise mesurée. Aucun défaut nouveau de calcul ou
de masquage reproduit sur la synapse.

Conserver une version simple si le dessin de mémoire fait partie de la boucle
MVP. Expliquer clairement le score déclaratif ; décider si conserver le dernier
essai apporte une valeur. Coût de maintenance : grille et image cohérentes,
provenance des critères et accessibilité. Fréquence réelle inconnue.

Limites : 18 contenus non expertisés intégralement, barèmes officiels non
certifiés, aucun dessin humain corrigé, pas de compte payant réel, de synchro,
de démarrage hors ligne à froid ni d'accessibilité exhaustive.
