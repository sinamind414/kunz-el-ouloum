# Audit fonctionnel et préparation du MVP

Date de cadrage : 2026-10-30. Référence de lecture initiale : `67afd92`.

## Objectif décidé

Demande du propriétaire : documenter nos découvertes, puis auditer chaque
fonctionnalité une par une pour aboutir à un MVP propre et fonctionnel plutôt
qu'à une accumulation de fonctionnalités incomplètes.

Ce dossier est le point de suivi de cette démarche. Aucun périmètre MVP définitif,
retrait de fonctionnalité ou chantier de correction n'est décidé par sa création.
Travail réalisé seul ; aucun sous-agent sans demande explicite du propriétaire.

- [Inventaire et constats](INVENTAIRE.md) : fonctions repérées et sources à examiner.
- [Fiche d'audit](FICHE_AUDIT.md) : modèle à copier pour chaque fonction.
- [Lot 01 — F01 à F05](LOT01.md) : résultats navigateur, tests et défauts reproduits.
- [Lot 02 — F06 à F10](LOT02.md) : reprise, synthèses, cartes, animations et QCM.
- [Lot 03 — F11 à F15](LOT03.md) : QCM livre, textes à trous, schémas, situations et atelier.
- [Lot 04 — F16 à F20](LOT04.md) : méthode, cartes, Tadwin, correction et bilans de rédaction.
- [Journal central](JOURNAL.md) : vingt fonctions examinées, défauts ouverts et trente restantes.
- [Catalogue documentaire existant](../README.md).

## Ce que nous savons, et ce que nous ne savons pas

**Observé dans le dépôt :** application de révision SVT du BAC algérien 3AS,
en arabe RTL ; React/TypeScript/Vite ; Android via Capacitor avec interface
embarquée ; progression locale ; serveur Express facultatif pour les comptes,
le suivi et la facturation ; SQLite par défaut ou PostgreSQL.

Le code distingue élève et enseignant. Invité, gratuit, essai et abonnement
sont des statuts d'accès. Aucun espace parent ni administration produit distincte
n'a été identifié dans la lecture initiale.

Le dépôt prévoit Vercel et des alternatives Docker/PM2/nginx. L'URL active,
le déploiement réel et la publication Google Play ne sont pas établis.
Le lancement local a obtenu HTTP 200 : cela prouve une réponse du serveur,
pas le bon fonctionnement de l'interface ou des parcours.

**Documentation :** architecture, spécifications, sources pédagogiques et audits
existent, mais aucun manuel utilisateur complet couvrant tout l'inventaire n'a
été identifié. Les commentaires et tests apportent des informations supplémentaires.
Les audits historiques ne décrivent pas nécessairement l'état actuel.

**Non vérifié :** fonctionnement de bout en bout de chaque fonction, qualité sur
appareil Android réel, couverture documentaire exhaustive, CI actuelle, usages
réels et efficacité pédagogique. Aucune suite de tests n'a été exécutée pendant
la découverte. Aucune fonction n'est déclarée cassée ou validée sur cette base.

Sources de départ : [architecture](../agents/ARCHITECTURE.md),
[présentation](../../README.md), [serveur](../SERVEUR.md),
[constats historiques](../agents/CONSTATS_OUVERTS.md).

## Hypothèse de valeur à vérifier

Boucle centrale proposée : **comprendre une leçon → produire une réponse →
recevoir un retour utile → revoir ses difficultés → constater sa progression**.

Cette proposition organise l'audit ; elle ne constitue pas un périmètre accepté.
Le nombre de fonctions conservées importe moins que la fiabilité du parcours.

## Exécution par lots de cinq

Demande du propriétaire du 30/10/2026 : avancer par lots de cinq fonctionnalités.
L'ordre d'exécution retenu pour le suivi est celui des IDs de l'inventaire :
lot 01 F01–F05, lot 02 F06–F10, puis F11–F15, F16–F20, F21–F25,
F26–F30, F31–F35, F36–F40, F41–F45 et F46–F50.
Chaque lot produit cinq fiches, une synthèse, des preuves et une mise à jour du registre.
Un lot terminé signifie que ses investigations et ses limites sont documentées,
pas que ses cinq fonctions sont toutes validées ou corrigées.

La lecture initiale ne comportait pas de tests exécutés. Le lot 01 ajoute
les vérifications décrites dans [sa synthèse](LOT01.md), sans validation globale du produit.

## Axes de contrôle transversaux proposés

Ces axes regroupent les dépendances ; ils ne remplacent pas les lots de cinq ci-dessus.

| Lot | Fonctions de l'inventaire | Question de sortie |
|---|---|---|
| 0 — Référence | F42–F45, F47–F48, accès F40–F41 | Peut-on ouvrir le produit sur les cibles retenues, identifier ses portes et retrouver son travail ? |
| 1 — Apprendre | F01–F03, F05–F06 | Une leçon représentative se termine-t-elle avec un résultat compréhensible et durable ? |
| 2 — Répondre | F10–F11, F15–F20 | L'élève peut-il répondre, comprendre le retour et progresser sans fausse promesse de correction ? |
| 3 — Consolider | F21–F24, F29–F30, F32 | Les révisions et remédiations correspondent-elles aux résultats réels ? |
| 4 — Préparer le BAC | F12–F14, F25–F28 | L'entraînement prépare-t-il réellement aux tâches et contraintes du BAC ? |
| 5 — Accompagner | F04, F07–F09, F31, F33–F37 | Chaque outil ajoute-t-il une valeur distincte à la boucle centrale ? |
| 6 — Services | F38–F39, F46, F49–F50 | Les comptes, la synchronisation et le suivi sont-ils nécessaires et fiables pour le MVP choisi ? |
| 7 — Arbitrage | Tous les IDs, bilan des dépendances | Quel parcours minimal cohérent peut-on effectivement livrer et maintenir ? |

Les regroupements servent au suivi ; chaque fonction reçoit son propre verdict.
Si une dépendance bloque un audit, examiner cette dépendance avant de conclure.
Pour chaque lot, distinguer au moins invité, élève connecté et enseignant si
applicable, ainsi que gratuit/essai/abonné pour les fonctions soumises à accès.

## Méthode pour chaque fonction

1. Copier la fiche sous `Fxx-nom.md` et préciser cible, besoin et résultat attendu.
2. Tracer la porte d'entrée réelle dans l'interface, le moteur, les données,
   la persistance et les dépendances ; vérifier qu'un composant est bien accessible.
3. Lire les documents et tests existants ; séparer contrat actuel et historique.
4. Exécuter un scénario réel de bout en bout et les cas de rupture pertinents :
   retour, abandon, reprise, rechargement, hors ligne, accès refusé, erreur réseau.
5. Vérifier exactitude pédagogique, arabe RTL, lisibilité mobile, feedback,
   sauvegarde et absence de données fictives selon la fonction.
6. Exécuter les vérifications ciblées nécessaires. Consigner commande, résultat,
   environnement et preuves. Un test présent mais non exécuté n'est pas une preuve.
7. Donner un verdict et une recommandation MVP, puis mettre à jour l'inventaire.

Un audit peut conclure sans correction immédiate. Les modifications autorisées
ultérieurement suivent les règles du dépôt, dont les fichiers protégés et les
générateurs. Avant livraison de code : contrôles ciblés, lint TypeScript, suites
requises et build ; vérifier la CI séparément. Un échec préexistant se documente,
il ne devient pas un résultat vert.

## Deux décisions à ne pas confondre

**État fonctionnel :** à auditer / validée sur périmètre décrit / partielle /
bloquée / non vérifiable. « Partielle » exige un manque concret et reproduit.

**Recommandation produit :** conserver / simplifier / fusionner / différer /
retirer du MVP. Préciser bénéfice, effort, dépendances et preuves ; une fonction
techniquement réussie peut être différée. « Retirer du MVP » ne veut pas dire
effacer ses sources ou ses données.

Pour chaque recommandation, noter : valeur pour le BAC, fréquence attendue
(hypothèse tant qu'aucune mesure ne la confirme), redondance, coût de maintenance
et risques. Aucune moyenne chiffrée ne doit masquer un défaut bloquant.

## Conditions proposées de sortie du MVP

- Public et supports retenus explicités ; périmètre conservé listé par ID.
- Chaque fonction conservée possède un audit et un scénario accepté reproductible.
- Boucle centrale testée de bout en bout sur les supports retenus.
- Aucun blocage connu dans le parcours conservé ; erreurs et limites annoncées.
- Progression persistante ; sauvegarde/restauration vérifiée pour le périmètre promis.
- Navigation sans porte morte ni fonctionnalité différée encore présentée comme disponible.
- Contenus et retours pédagogiques sourcés ; limites de correction explicites.
- Droits d'accès cohérents, si le modèle commercial reste dans le MVP.
- Guide élève à jour ; guide enseignant si ce profil est retenu.
- Vérifications techniques requises exécutées et résultats consignés ; écarts
  bloquants résolus, périmètres non testés signalés.

## Garde-fous et inconnues prioritaires

- Ne pas ajuster le correcteur aux notes des professeurs. Les 40 copies locales
  ont servi au calibrage et ne sont pas un jeu de validation indépendant.
- Une similarité sémantique seule ne justifie pas des points ; respecter les
  items manuels et les barèmes officiels.
- Le contenu client n'est pas un coffre-fort commercial ; ne pas promettre une
  protection que le code ne fournit pas.
- Synchroniser des productions n'équivaut pas à restaurer tout l'état local.
- La dictée dépend du navigateur et peut nécessiter Internet.
- Le dashboard observé porte sur les élèves de l'instance ; vérifier le besoin
  de séparation des classes avant de promettre un fonctionnement multi-enseignants.
- Les unités gratuites observées sont 1–5 ; certains commentaires disent encore
  « unité 1 ». L'essai serveur dépend de la date de création et du lancement,
  pas nécessairement du premier affichage du paywall.
- Les droits des contenus, la disponibilité des sources de génération et les
  constats CI historiques doivent être revalidés avant une livraison publique.

## Journal

| Date | Action | Résultat |
|---|---|---|
| 2026-10-30 | Consolidation de la lecture du dépôt et de la conversation | Inventaire initial, cadre d'audit et fiche créés ; aucun audit fonctionnel terminé ; aucun périmètre MVP arrêté. |
| 2026-10-30 | Lot 01, F01–F05 | Cinq fiches et preuves navigateur bureau/mobile ; 268 tests ciblés et typecheck verts ; cinq défauts documentés, dont trois majeurs. Aucun correctif produit ni périmètre MVP arrêté. |
| 2026-10-30 | Lot 02, F06–F10 | Cinq fiches, 25 captures, 262 tests ciblés et typecheck verts ; cinq nouveaux défauts, dont un majeur pédagogique ; journal central créé. Prochain lot F11–F15. |
| 2026-10-30 | Lot 03, F11–F15 | Cinq fiches, 31 captures, 246 tests ciblés et typecheck verts ; six nouveaux défauts ; accès payant simulé explicitement distingué du parcours invité. Prochain lot F16–F20. |
| 2026-10-30 | Lot 04, F16–F20 | Cinq fiches, 35 images, 487 tests ciblés et typecheck verts ; huit nouveaux défauts ; notes, contrôle de forme et réserve humaine distingués. Prochain lot F21–F25. |
