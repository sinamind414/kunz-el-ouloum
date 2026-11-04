# F14 — Situations scientifiques et analyse documentaire

## Contrat et périmètre

Audit du 30/10/2026, référence `9bccc8b`, Chromium local bureau et mobile.
Invité refusé ; navigation ouverte en **essai client simulé**. Les appels API
sont interceptés dans ce contexte jetable : facturation et comptes non validés.

Besoin : trouver une situation concrète, disposer du support demandé, produire
une analyse sur papier, puis consulter un corrigé masqué initialement. Cette
vue n'offre pas de champ de production ni de notation automatique.

## Traçabilité

| Élément | Source | Observation |
|---|---|---|
| Entrée | `trainingHub.ts`, `TrainingHubView.tsx` | Entraînement → situations |
| Index | `situationIndex.ts` | **22 fiches**, réindexation de contextes et exercices existants |
| Documents et exercices | `documentPracticeContexts.ts`, `documentAnalysisExercises.ts` | Observations, consignes, indices, attendus et grilles d'entraînement |
| Filtres | `documentTypology.ts`, `SituationBankView.tsx` | Texte, unité, difficulté, forme et quantitatif |
| Rendu | `DocumentFigure.tsx`, `documentAssets.ts` | Courbes qualitatives, tableaux, images ou indisponibilité explicite |
| Persistance | États React de recherche/fiche/corrigé | Pas d'historique de production ni de score enregistré ici |
| Tests exécutés | Vue, index, typologie, intégrité documentaire et `DocumentFigure` | Inclus dans les 246 tests du lot |

Les courbes qualitatives ne sont pas des mesures expérimentales chiffrées.
Les grilles d'entraînement affichées ne doivent pas être présentées comme une
correction officielle indépendante sans vérification de leur provenance.

## Scénarios et preuves

Captures 15–18, 25, 28 et 30 ; observations `F14-*` dans
[le relevé principal](preuves/lot03/browser-results.json) et
[le complément](preuves/lot03/supplement-results.json).

| Cas | Résultat observé |
|---|---|
| Accès invité | Paywall ; pas de retour local, navigation principale disponible |
| Liste ouverte | 22 situations |
| Recherche sans résultat | Message explicite |
| Recherche « السكري » | Une fiche diabète |
| Filtre unité 4 | Cinq situations ; désactivation par second clic |
| Fiche diabète | Consigne, contexte, exercice et figure ; corrigé absent initialement |
| Afficher/masquer le corrigé | Attendues et explications apparaissent puis disparaissent |
| Quitter puis rouvrir la fiche | Corrigé à nouveau caché |
| Hors ligne après chargement | Bascule du corrigé encore fonctionnelle |
| Inspection des 22 fiches | Quatre rendus documentaires explicitement indisponibles dans trois fiches |

## Défaut reproduit — L03-03, majeur sur les exercices concernés

En essai simulé, ouvrir chacune des fiches suivantes et regarder ses exercices :

| Fiche | Documents indisponibles |
|---|---|
| `lecture_shifra` | 2 |
| `anemie_falciforme` | 1 |
| `seuil_integration` | 1, avec un autre rendu présent |

Attendu : fournir les supports auxquels renvoient les questions d'analyse.
Observé : message « هذه الوثيقة غير جاهزة بعد. » à leur place. Le signalement
est honnête mais ne rend pas l'exercice documentaire complet. Une description
textuelle ou un autre document présent n'établit pas que les questions portant
sur le support manquant sont réalisables. Capture 30 et inventaire des 22 fiches.

Les fiches sans exercice élite peuvent présenter seulement une observation
textuelle : leur absence de `<DocumentFigure>` n'est pas comptée comme document
manquant. Seuls les quatre messages d'indisponibilité sont comptabilisés.

## Verdict et proposition MVP

**Partielle : consultation, recherche et masquage fonctionnels ; certains
exercices manquent de supports.** Conserver une sélection avec documents
complets et vérifiés ; différer les exercices incomplets jusqu'à disponibilité
de sources autorisées. Ne pas inventer des figures ou des données pour les remplir.

Valeur BAC supposée forte pour l'analyse documentaire. L'usage réel n'est pas
mesuré. La banque et l'atelier méthodologique doivent éviter des promesses de
correction différentes pour un même exercice. Aucun correctif appliqué.
Pas d'expertise scientifique exhaustive des 22 situations, de production élève,
de notation humaine comparative, de compte réel ou de test APK/PWA à froid.
