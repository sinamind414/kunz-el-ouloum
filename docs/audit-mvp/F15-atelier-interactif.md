# F15 — Atelier interactif de transcription

## Identification et clarification

Audit du 30/10/2026, référence `9bccc8b`, élève invité, Chromium local.
**L'entrée réelle F15 est `LessonTwoView.tsx`**, branche `workshop` de `App.tsx` :
une leçon guidée sur la transcription, unité 1. L'inventaire initial associait
aussi `MethodologyCompilerView.tsx` ; ce composant appartient à l'entrée Méthode
et sera examiné avec F16/F17. Le test nommé `atelierFlux.test.tsx` vérifie ce
second composant, pas la leçon interactive F15.

Besoin : compléter cinq mots/notions, interagir avec les figures et produire
des réponses courtes jusqu'à un texte scientifique récapitulatif. Ce n'est
pas un éditeur de productions libres pour tout le programme.

## Traçabilité

| Élément | Source | Observation |
|---|---|---|
| Entrée | `trainingHub.ts`, bouton `hub-workshop` | Disponible sans abonnement ni unité terminée |
| Vue | `LessonTwoView.tsx` | Cinq étapes, ouvertures progressives de 20 %, figures SVG intégrées |
| Correction | `validateW1` à `validateW5` dans la vue | Chaînes attendues, sous-chaînes et mots-clés ; aucune comparaison sémantique indépendante |
| Aide | Définitions, boîte méthodologique, modal de carte | La mention D3 désigne la bibliothèque graphique ; la carte est bien U1 |
| Dictée | `SpeechRecognition`/`webkitSpeechRecognition` | Dépend du navigateur ; service vocal non testé |
| Résultat | `progress`, états `w1…w5`, `lessonRating` | États React ; pas de pont vers la sauvegarde de progression globale |
| Tests | Aucun test dédié `LessonTwoView` repéré | Les tests méthodologiques voisins ne prouvent pas ce parcours |

Les figures et références de pages intégrées ont été lues et manipulées, sans
expertise exhaustive de leur fidélité au manuel. Tous les SVG restent protégés.

## Parcours et preuves

Relevés `F15-*` de [l'audit navigateur](preuves/lot03/browser-results.json),
captures 19–22 et 29. Essais par clics et clavier réels, aucun état React injecté.
Après les clics SVG, laisser finir l'entrée en plein écran puis fermer le zoom
par Échap avant de poursuivre ; les premiers essais automatisés trop rapides
ont été repris avec cette attente. Pas de contournement par événement JavaScript.

| Scénario | Résultat observé |
|---|---|
| Entrée invité | Atelier U1 ouvert à 0 % |
| Réponse sans rapport à la première étape | Pas de validation ; retour de correction |
| Réponse contenant les éléments attendus | Étape validée, suite ouverte |
| Choix de l'enzyme et réponse négative à l'étape 2 | Négation acceptée malgré le sens contraire ; champ verrouillé |
| Construction des bases et codon | Saisie par les sélecteurs de bases puis validation |
| Début/fin de gène et synthèse | Progression vers le résultat final |
| Résultat final | 100 % atteint et texte récapitulatif affiché |
| Quitter puis revenir | Retour à 0 %, première réponse vide |
| Mobile | Première étape visible sur 390×844 ; saisie vocale et parcours tactile complet non vérifiés |

## Défauts reproduits

**L03-04 — majeur pédagogique.** Étape 2 : sélectionner ARN polymérase dans le
texte et la figure, répondre `لا يحدث تثبيط` (« il n'y a pas d'inhibition »),
puis valider. Le mot `تثبيط` suffit à `validateW2` : la réponse est félicitée et
la suite s'ouvre. Attendu : une négation explicite du mécanisme ne reçoit pas
une validation de compréhension. Le même risque ne se confond pas avec L03-02 :
ce sont deux validateurs différents, à corriger et revérifier séparément.

**L03-05 — modéré, conservation du travail.** Après une progression dans l'atelier,
revenir à l'accueil puis rouvrir la carte : avancement et réponses disparaissent.
Les états sont uniquement locaux au composant. Une reprise ou une sauvegarde
n'est pas fournie ; cela doit être clarifié avant de demander un travail long.
Ce constat est distinct du snapshot des leçons actives F03/F06.

**L03-06 — mineur, lisibilité mobile.** Sur le viewport tactile 390×844, le
badge de bas de page de `LessonTwoView` (`fixed bottom-0`, `z-50`) recouvre les
libellés de la barre de navigation mobile. Les icônes restent visibles ; les
noms des destinations sont masqués. Capture 29. Attendu : les libellés de
navigation restent lisibles pendant la leçon.

## Verdict et proposition MVP

**Partielle : leçon guidée interactive, correction trop permissive et reprise
absente.** Fusionner ou différer cet atelier isolé plutôt que maintenir une
troisième mécanique de leçon et de progression. Le conserver suppose une
validation pédagogique robuste, une sauvegarde définie et une terminologie
qui le distingue de l'atelier méthodologique.

Valeur possible : guidage pas à pas ; redondance forte avec F03 et F12, coût de
maintenance élevé d'une leçon écrite comme composant spécifique. Usage réel
inconnu. Pas de décision de retrait ni de correction prise dans cet audit.
Limites : un seul thème, pas de test vocal, d'APK, d'accessibilité complète ou
d'alignement exhaustif au barème officiel ; aucun apprentissage humain mesuré.
