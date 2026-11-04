# Lot 03 — F11 à F15

Audit du 30/10/2026, référence `9bccc8b`. Aucun code produit ni fichier protégé
modifié, aucun correctif ou retrait de fonctionnalité décidé.

| Fonction | Verdict borné | Proposition MVP |
|---|---|---|
| [F11 — QCM livre/bilans](F11-qcm-livre-bilans.md) | Partielle : chapitre et bilan terminés, droits différents selon l'entrée | Conserver les chapitres, unifier accès et rôle du bilan |
| [F12 — Textes à trous](F12-textes-a-trous.md) | Partielle : saisie fonctionnelle, contradictions acceptées | Fiabiliser la validation avant crédit de réussite |
| [F13 — Schémas](F13-schemas-memoire.md) | Parcours représentatif validé comme auto-évaluation papier | Conserver une version simple, annoncer la nature déclarative du score |
| [F14 — Situations](F14-situations-documents.md) | Partielle : consultation fonctionnelle, quatre documents indisponibles | Conserver les exercices aux supports complets |
| [F15 — Atelier](F15-atelier-interactif.md) | Partielle : leçon achevée, validation permissive et reprise absente | Fusionner ou différer cette mécanique de leçon isolée |

## Vérifications réalisées

- Chromium **156.0.8078.4**, Playwright Python, serveur local de développement.
- **40 observations** dans les deux relevés finaux, **31 captures** bureau/mobile.
- **21 fichiers Vitest, 246 tests réussis**, puis typecheck réussi.
- Zéro exception JavaScript de page et zéro erreur de scénario dans les deux
  relevés finaux. Les premières difficultés du harnais ont été reprises ; voir
  [les commandes et précautions](preuves/lot03/README.md).
- Chapitre livre 1 : 1/2 avec une erreur volontaire, score enregistré localement.
- Bilan : **14/15** avec une erreur volontaire ; résultat non persisté.
- Schéma synapse : **0/12**, puis **12/12** ; image cachée avant comparaison.
- Inspection documentaire des **22 situations** ; recherche et corrigé du diabète.
- Atelier : cinq étapes jusqu'à **100 %**, puis retour à **0 %** à la réouverture.

Les scénarios ouverts en essai utilisent une **simulation d'accès client** dans
des contextes jetables. Les appels API y sont interceptés ; aucun vrai token,
compte, paiement, essai serveur ou abonnement n'est validé. Le scénario du jalon
invité est séparé et **n'utilise pas** cette simulation.

## Nouveaux défauts

| Référence | Gravité | Constat |
|---|---|---|
| L03-01 | Majeure | Hub examens fermé à l'invité, mais entrée par jalon ouverte et bilan des trois domaines accessible sans token |
| L03-02 | Majeure pédagogique | Textes à trous : négation et associations de bases inversées acceptées par le validateur lexical |
| L03-03 | Majeure sur les exercices concernés | Quatre supports indisponibles dans trois fiches de situations |
| L03-04 | Majeure pédagogique | Atelier : « il n'y a pas d'inhibition » validé grâce au seul mot « inhibition » |
| L03-05 | Modérée | Atelier : réponses et progression entièrement perdues au retour à l'accueil |
| L03-06 | Mineure | Atelier mobile : le badge fixe recouvre les libellés de navigation |

Le paywall sans retour local étend L01-04 aux entrées testées, sans nouveau
doublon. L'absence de sauvegarde des auto-évaluations de schéma et du bilan est
documentée comme limite de contrat, pas comme une promesse déjà implémentée.

## Clarifications durables

F15 pointe vers **`LessonTwoView.tsx`**, et non vers l'atelier méthodologique
`MethodologyCompilerView.tsx`. Les tests `atelierFlux` couvrent ce dernier,
qui sera examiné avec les fonctions de méthode F16/F17.

Volumes actuels : **41 QCM livre / 24 chapitres**, pool bilan **91**, textes à
trous exportés **121**, schémas de mémoire **18**, situations **22**.
Ces comptages ne certifient pas la conformité scientifique exhaustive.

## Limites et suite

Pas d'APK réel, de PWA à froid hors ligne, de facturation authentifiée, de test
vocal, de synchronisation ou de validation scientifique exhaustive. Le hors
ligne testé concerne des interactions déjà chargées. Tests globaux, Jest, build
et CI distante non relancés pour ce lot documentaire ; l'état de référence du
commit précédent reste consigné dans le journal, avec ses échecs Vitest.

**15 fonctions examinées ; 35 restantes.** Prochain lot : **F16–F20**, méthode,
Boussole, Tadwin, correction ouverte et bilans de rédaction.
