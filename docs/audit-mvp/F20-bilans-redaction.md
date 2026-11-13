# F20 — Relecture et bilans des productions écrites

## Contrat et périmètre

Audit du 30/10/2026, référence `9bccc8b`, Chromium bureau. Besoin : retrouver
ses réponses, comprendre les manques récurrents, reprendre une rédaction et
imprimer une preuve de travail sans la confondre avec une note scientifique.

Deux carnets distincts sont concernés : les productions du simulateur de
méthode, et les brouillons des exercices BAC. Pour la banque BAC protégée,
l'accès d'essai est **simulé côté client**, avec API interceptée ; aucun vrai
compte, abonnement ou dashboard enseignant n'est validé.

## Traçabilité

| Élément | Source | Observation |
|---|---|---|
| Carnet méthodologique | `methodologyLog.ts`, `ProductionEvolutionPanel.tsx` | Historique local de soumissions, ICM, critères, erreurs et évolution |
| Entrée du bilan méthode | Onglet matrice de `MethodologyCompilerView` | Vue calculée sur les productions réellement archivées |
| Éditeur BAC | `BacIdeasView.tsx`, `BacIdeaTrainer.tsx` | Sauvegarde à chaque frappe par exercice **et famille de consigne** |
| Stockage BAC | `writingProgress.ts` | Clés `kunz.bacTrainer.{ideaId}.{familyId}` |
| Relecture | `writingReview.ts`, `WritingReviewPanel.tsx` | Extraits, contrôles de forme et bouton de reprise |
| Rapport | `WritingReportSheet.tsx` | Résumé imprimable, « pas une note », identité de marque |
| Tests | Trainer, relecture, rapport, progression, file et lettres | Inclus dans les 487 tests ciblés |

L'ICM, les exigences de forme remplies et le nombre de mots ne sont pas une
mesure indépendante de maîtrise scientifique. Les deux carnets ne sont pas
présentés comme une sauvegarde globale ni comme un historique synchronisé certifié.

## Scénarios et preuves

Captures 22–26, 33–34 ; relevés `F20-*` et sorties d'impression dans
[le principal](preuves/lot04/browser-results.json) et
[le complément](preuves/lot04/supplement-results.json).

| Cas | Résultat observé |
|---|---|
| Soumissions du simulateur | Carnet et diagnostic d'évolution alimentés par les essais réels du lot |
| Brouillon BAC, famille par défaut | Écrit à la frappe ; avertissement de contrôle de forme uniquement |
| Fermer puis ouvrir la revue | Nombre de réponses, extraits et manques visibles |
| Reprendre la famille par défaut | Texte restauré |
| Modifier puis recharger | Brouillon modifié encore présent dans le stockage |
| Rapport à l'écran | Résumé visible ; pas de note officielle présentée |
| Impression depuis la position normale du rapport | Une page sans texte extrait, image visuellement vide |
| Impression après retour en haut du défilement principal | Une page contenant du texte : résultat dépendant du défilement |
| Reprendre une autre famille que celle par défaut | Mauvaise famille ouverte, champ vide malgré le brouillon sauvegardé |

PDF produits par Chromium puis inspectés avec PyMuPDF ; pas d'impression
papier. Les PDF restent locaux et ignorés ; images et texte extrait sont livrés.

## Défauts reproduits

**L04-07 — majeur pour l'export demandé.** Créer un brouillon, ouvrir sa revue,
puis le rapport enseignant et imprimer depuis cette position : la sortie A4
est vide dans le scénario normal. Remonter le défilement principal permet
d'obtenir du texte. Attendu : imprimer le rapport complet indépendamment de
la position de lecture. Preuves 26 et 33. Ne pas dire que l'impression échoue
dans toutes les positions ; le contournement observé est explicitement conservé.

**L04-08 — modéré, reprise dans la mauvaise famille.** Sur le premier exercice,
choisir la seconde famille `verb_texte_scientifique`, écrire, fermer, ouvrir
la revue puis « أعد الكتابة ». `onOpen` transmet seulement l'exercice :
`BacIdeaTrainer` sélectionne de nouveau `verb_restituer` et affiche son champ
vide. La réponse reste dans sa clé de stockage ; elle n'est pas effacée, mais
le lien de reprise ne retrouve pas la bonne production. Capture 34.

## Verdict et proposition MVP

**Partielle : sauvegarde et synthèse utiles, reprise contextuelle et impression
à fiabiliser.** Conserver le carnet et la relecture comme cœur de la boucle
d'apprentissage. Transporter exercice et famille lors de la reprise ; stabiliser
l'export avant de le promettre à l'enseignant.

Valeur supposée forte pour revenir sur un travail réel ; usage non mesuré.
La revue de forme doit rester distincte de la correction scientifique F19.
Pas de profil enseignant réel, de partage externe, de synchronisation, d'APK,
de pilote d'imprimante ou d'accessibilité exhaustive testés. Aucun correctif.
