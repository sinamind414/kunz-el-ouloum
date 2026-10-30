# F10 — QCM, feedback, score et journalisation

Audit du 2026-10-30, `67afd92`. Invité, Chromium bureau et viewport mobile.
Contrat : répondre, comprendre l'explication, obtenir un score correct et
enregistré, puis retravailler ses erreurs sans crédit de progression en double.

## Traçabilité

- [Quiz](../../src/components/QuizView.tsx).
- [Ouverture et crédits](../../src/App.tsx:663).
- [Corpus servi](../../src/quizCorpus/index.ts),
  [adaptation des textes à trous](../../src/data/fillBlanksLoader.ts).
- [Mémoire des questions](../../src/lib/memoireQuestions.ts).
- [Activités](../../src/utils/studentAccount.ts),
  [file locale](../../src/utils/activityLog.ts).
- Dépendances F11/F12, F22/F29, F34/F35, F40 et F46.

## Séance complète exécutée

Entrée : carte mentale de l'unité 2 → nœud → fermeture du zoom parasite par
Échap → quiz immédiat. Le quiz propose **57 questions**, soit **46 QCM et
11 questions à trous**. Les options sont lues dans leur ordre affiché ; les
réponses attendues proviennent des exports servis, sans injection de score.
Une erreur volontaire est faite au début, puis les attendus sont saisis via
les contrôles natifs. La progression complète emploie notamment le clavier.

| Vérification | Résultat |
|---|---|
| Question sans réponse | Bouton suivant désactivé |
| Réponse volontairement fausse, question 505 | Options verrouillées, bonne option signalée et explication affichée |
| Traversée des 57 questions | Fin de séance effectivement atteinte |
| Résultat | **56/57**, historique d'une séance, 57 questions comptabilisées |
| XP | **1 120**, cohérents avec 56 réponses à 20 points |
| Journal local | Un événement quiz U2, score 56/57, propriétaire `invite` |
| Déclaration de cause | Accusé visible et `notion_confusion` enregistré dans le profil local |
| Reprise des erreurs | Une seule question, correspondant à l'erreur initiale |
| Réussir cette reprise | XP toujours 1 120 ; historique toujours d'une séance |
| Mobile 390×844 | Question et options rendues, largeur document 390/390 |

Preuves : `F10-*` dans le [journal](preuves/lot02/browser-results.json),
[réponse fausse](preuves/lot02/17-quiz-wrong-feedback.png),
[bilan](preuves/lot02/18-quiz-completed.png),
[reprise terminée](preuves/lot02/19-quiz-retry-completed.png),
[mobile](preuves/lot02/23-mobile-quiz.png).

La mémoire `kunz_qcm_memoire_v1` est présente dans le relevé de fin de séance :
elle conserve les réponses et l'échéance de la question ratée. Cela ne valide
pas encore la restitution de tous les rappels à leurs dates réelles, audit F22.

## Limites de mesure et de couverture

Les réponses sont des **fixtures d'intégration**, pas des productions d'élèves.
Le résultat obtenu prouve le câblage et le calcul sur cette séance, pas la qualité
de chaque question, ni la validité scientifique indépendante du corpus.

Les **86 minutes** ajoutées au suivi de cette séance proviennent d'une estimation
documentée dans le code (1,5 minute/question, arrondie), pas du temps réellement
écoulé dans le navigateur. Ne pas les publier comme une mesure chronométrée.

Le quiz utilise un compte à rebours de quinze minutes. Dans un diagnostic du
**composant réel isolé dans Chromium**, avec horloge Playwright accélérée, le
compteur atteint `00:00`, quatre boutons de réponse restent actifs et aucun
callback de fin n'est émis. Ce test ne simule pas une attente réelle de quinze
minutes sur toute l'application. Le code n'utilise pas `onFin` : le chrono est
donc indicatif dans ce composant. Sa fonction produit reste à clarifier.

La file d'activité reste locale en invité ; aucune synchronisation serveur
de compte authentifié n'a été validée. La sortie/reprise d'une séance inachevée,
les corpus des autres unités, erreurs de chargement, droits payants, APK,
chevauchements d'identifiants entre unités et dates de rappels ne sont pas couverts
par cette seule séance.

## Verdict et MVP

**Validée sur cette séance complète et la reprise d'erreur décrite.** Confiance
élevée sur score, historique et absence de double crédit dans ce scénario.
Les tests de mélange, questions à trous et diagnostic passent dans les 262 tests.

Proposition : **conserver comme entraînement central**, en clarifiant ce qui
est estimé et le rôle du chrono ; adapter éventuellement la longueur des séances
après arbitrage MVP. Aucune réorganisation ni réduction du corpus décidée ici.
