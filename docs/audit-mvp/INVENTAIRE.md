# Inventaire fonctionnel initial

Référence : 2026-10-30, lecture initiale du dépôt `67afd92`.
Objectif et méthode : [plan global](README.md).

Les 50 lignes sont des **unités de suivi d'audit**, regroupant parfois plusieurs
actions. Ce nombre n'est pas une mesure du nombre de fonctionnalités du produit.
L'inventaire sera amendé si l'audit découvre des doublons, portes inaccessibles
ou fonctionnalités supplémentaires. Les sources sont des points de départ,
pas la preuve d'un parcours utilisateur validé.

**État initial de chaque ligne : à auditer ; résultats ajoutés lot par lot.** Aucun verdict « incomplet » ou
« fonctionnel » n'est déduit de la présence d'un fichier. Aucune priorité MVP
définitive n'est attribuée. Ajouter un lien vers la fiche quand l'audit commence.

| ID | Fonction / résultat à vérifier | Source de départ dans le dépôt | État |
|---|---|---|---|
| F01 | Catalogue et conformité des cours aux 11 unités officielles | `src/data/curriculumOfficial.ts`, `src/components/LessonsView.tsx` | [Structure validée ; pédagogie à approfondir](F01-catalogue.md) |
| F02 | Leçons HTML : lecture, navigation et accès aux figures | `src/components/HtmlLessonViewer.tsx`, `public/lessons/` | [Partielle : lecture sondée validée, retour paywall absent](F02-lecons-html.md) |
| F03 | Leçons actives : blocs, pratique de sortie et validation | `src/components/ActiveLessonView.tsx`, `src/lib/lesson/` | [Partielle : reprise et transition défectueuses](F03-lecons-actives.md) |
| F04 | Recherche de contenus | `src/components/SearchView.tsx` | [Partielle : accès incohérent sur une variante U6](F04-recherche.md) |
| F05 | Parcours officiel et bilan de fin d'unité | `src/components/ParcoursView.tsx`, `src/lib/parcours/parcoursPath.ts` | [Partielle : mécanique déclarative validée, reset sans protection](F05-parcours.md) |
| F06 | Progression, suspension et reprise des leçons | `src/lib/parcours/parcoursProgress.ts`, `src/lib/lesson/sessionSnapshotService.ts` | [Partielle : brouillon et reprise à fiabiliser](F06-reprise-progression.md) |
| F07 | Synthèses Hosila, mémorisation Okacha et capsules | `src/data/hosila.ts`, `src/components/OkachaView.tsx`, `src/components/MicroCapsulePanel.tsx` | [Parcours représentatifs validés, limites explicites](F07-syntheses-capsules.md) |
| F08 | Cartes mentales et détails des notions | `src/components/MindMap/MindMapView.tsx` | [Partielle : zoom et clavier](F08-cartes-mentales.md) |
| F09 | Animations et simulateur d'électrophorèse | `src/components/AnimationsView.tsx`, `src/components/ElectrophoresisSimulator.tsx` | [Partielle : égalité inexacte dans le feedback](F09-animations-simulateur.md) |
| F10 | QCM : réponse, explication, score et journalisation | `src/components/QuizView.tsx`, `src/quizCorpus/` | [Séance complète et reprise validées sur U2](F10-qcm.md) |
| F11 | QCM du livre et bilans d'unité | `src/components/QcmLivreView.tsx`, `src/components/QcmBilanView.tsx` | [Partielle : score fonctionnel, accès incohérent ; conserver et unifier](F11-qcm-livre-bilans.md) |
| F12 | Textes à trous | `src/data/fillBlanks.ts`, `src/components/QuizView.tsx` | [Partielle : contradictions acceptées ; fiabiliser la validation](F12-textes-a-trous.md) |
| F13 | Schémas : exercices et restitution de mémoire | `src/components/SchemaDrillView.tsx`, `src/data/schemaDrills.ts` | [Auto-évaluation papier validée sur l'échantillon ; conserver simplement](F13-schemas-memoire.md) |
| F14 | Situations scientifiques et analyse de documents | `src/components/SituationBankView.tsx`, `src/components/DocumentFigure.tsx` | [Partielle : supports manquants ; sélectionner les exercices complets](F14-situations-documents.md) |
| F15 | Atelier interactif de transcription | `src/App.tsx` (branche `workshop`), `src/components/LessonTwoView.tsx` | [Partielle : validation permissive et reprise absente ; fusionner ou différer](F15-atelier-interactif.md) |
| F16 | Méthodologie Meftah et consignes du BAC | `src/components/MeftahView.tsx`, `src/data/miftahSpec.ts` | [Consultation validée sur l'échantillon ; renvoi au verbe à cibler](F16-meftah.md) |
| F17 | Boussole legacy et cartes de méthode | `src/components/BoussoleCard.tsx`, `src/components/MiftahCard.tsx` | [Partielle : impression tronquée ; unifier les cartes](F17-boussole.md) |
| F18 | Tadwin : synthèse personnelle et couverture des clés | `src/components/TadwinView.tsx`, `src/lib/tadwin/tadwinEngine.ts` | [Partielle : première fiche puis boucle fermée ; fiabiliser écriture/réécriture](F18-tadwin.md) |
| F19 | Correction des réponses ouvertes et limites manuelles | `src/correcteurV1.ts`, `src/lib/validation/` | [Partielle : réserve humaine présente, approbation locale non attestée](F19-correction-ouverte.md) |
| F20 | Relecture, bilan et évolution des productions écrites | `src/components/WritingReviewPanel.tsx`, `src/components/WritingReportSheet.tsx`, `src/components/ProductionEvolutionPanel.tsx` | [Partielle : sauvegarde utile, reprise et export à fiabiliser](F20-bilans-redaction.md) |
| F21 | Flashcards et répétition espacée SM-2 | `src/components/RevisionView.tsx`, `src/utils/flashcardsSrs.ts` | À auditer |
| F22 | Rappels des concepts et révisions J+14 du parcours | `src/lib/rappelAdaptatif.ts`, `src/lib/rappelConcepts.ts`, `src/lib/parcours/nbaEngine.ts` | À auditer |
| F23 | Plan final selon temps disponible, suivi et impression | `src/components/RevisionPlanView.tsx`, `src/data/revisionPlan.ts` | À auditer |
| F24 | Recommandation de prochaine activité quotidienne | `src/components/NbaCard.tsx`, `src/components/TodayCard.tsx`, `src/lib/parcours/nbaEngine.ts` | À auditer |
| F25 | Banque d'idées BAC par session et unité | `src/components/BacIdeasView.tsx`, `src/components/BacIdeaTrainer.tsx`, `src/data/bacSessionIndex.ts` | À auditer |
| F26 | Consultation des PDF de sujets officiels | `public/bac-sujets/`, `src/components/BacIdeasView.tsx` | À auditer |
| F27 | Examens blancs, sujets générés et autoévaluation | `src/components/ExamensHubView.tsx`, `src/components/MockExamPanel.tsx`, `src/components/BacExamView.tsx` | À auditer |
| F28 | Référence BAC 2025 et défis sous contrainte de temps | `src/components/Bac2025ExamView.tsx`, `src/components/CombatTrainerView.tsx` | À auditer |
| F29 | Profil d'erreurs et diagnostic des difficultés | `src/utils/profilErreurs.ts`, `src/lib/coach/diagnostic.ts` | À auditer |
| F30 | Micro-remédiations et rappels associés | `src/components/CarteMicroRemediation.tsx`, `src/lib/planificationRappels.ts` | À auditer |
| F31 | Tuteur conversationnel Morchid et références des réponses | `src/components/AITutorView.tsx`, `src/smartTutorEngine.ts` | À auditer |
| F32 | Coach Capitaine : prescription, issue et adaptation | `src/lib/prescriptions.ts`, `src/lib/coach/`, `src/data/capitaine.ts` | À auditer |
| F33 | Tableau de progression, statistiques et arbre personnel | `src/components/StatsView.tsx`, `src/components/MoiView.tsx` | À auditer |
| F34 | Objectifs quotidiens et régularité | `src/components/DailyGoalWidget.tsx`, `src/utils/activiteQuotidienne.ts` | À auditer |
| F35 | XP, badges, séries, célébrations et motivation | `src/components/BadgesView.tsx`, `src/components/StreakCelebrationModal.tsx`, `src/components/MotivationDeclic.tsx` | À auditer |
| F36 | Rapport hebdomadaire et partage des progrès | `src/components/WeeklyReportShareModal.tsx`, `src/components/StatsView.tsx` | À auditer |
| F37 | Favoris, minuteur et dictée vocale | `src/utils/favorites.ts`, `src/components/FocusTimer.tsx`, `src/components/Dictaphone.tsx` | À auditer |
| F38 | Compte élève : code/PIN ou email, connexion et déconnexion | `src/components/StudentAuthView.tsx`, `src/components/StudentAccountBar.tsx`, `server.ts` | À auditer |
| F39 | Réinitialisation du secret et assistance enseignant | `src/components/StudentAccountBar.tsx`, `src/components/TeacherDashboardView.tsx`, `server.ts` | À auditer |
| F40 | Gratuité, essai, échéances et cohérence des portes d'accès | `src/utils/acces.ts`, `src/server/facturation.ts` | À auditer |
| F41 | Activation saison, code et liaison à l'appareil | `src/components/EcranPaiement.tsx`, `src/server/facturation.ts` | À auditer |
| F42 | Mode invité, attribution du travail et confidentialité | `src/utils/activityLog.ts`, `src/data/politiqueConfidentialite.ts` | À auditer |
| F43 | Usage web/PWA hors ligne et mises à jour du cache | `src/main.tsx`, `public/sw.js`, `public/manifest.json` | À auditer |
| F44 | Application Android, contenu embarqué et retour matériel | `capacitor.config.ts`, `android/`, `src/main.tsx` | À auditer |
| F45 | Sauvegarde et restauration du travail par fichier | `src/components/BackupPanel.tsx`, `src/data/backup.ts` | À auditer |
| F46 | Synchronisation, reprise réseau et import volontaire du travail invité | `src/utils/activityLog.ts`, `src/utils/studentAccount.ts`, `server.ts` | À auditer |
| F47 | Navigation : portes réelles, hubs, retours et absence d'impasses | `src/App.tsx`, `src/data/trainingHub.ts`, `src/data/revisionHub.ts` | À auditer |
| F48 | Arabe RTL, mobile, clavier, lisibilité et mode sombre | `src/App.tsx`, `src/components/`, `src/components/__tests__/accessibilite.test.tsx` | À auditer |
| F49 | Enseignant : connexion, élèves, activité et indicateurs | `src/components/TeacherDashboardView.tsx`, `server/auth.ts`, `server.ts` | À auditer |
| F50 | Enseignant : productions, erreurs et export CSV | `src/components/TeacherDashboardView.tsx`, `server.ts`, `docs/SERVEUR.md` | À auditer |

## Couverture documentaire initiale

| Domaine | Références repérées | Limite de la découverte |
|---|---|---|
| Produit et architecture | `README.md`, `docs/agents/ARCHITECTURE.md` | Présentation générale, pas manuel complet. |
| Méthodologie et correction | `docs/SPEC_BOUSSOLE_NSOE.md`, `docs/PROTOCOLE_PREUVE.md`, `docs/sources/README.md` | Revalider la correspondance entre contrat et interface. |
| Tadwin | `docs/tadwin_decisions.md`, `docs/Spec_Tadwin_Chamil_SVT.html` | Décisions et spécification, pas preuve de conformité actuelle. |
| Coach et tuteur | `docs/VISION_COACH_MORCHID_2026-10-15.md`, audits Morchid | Mélange de vision et d'historique. |
| Contenus et génération | `docs/agents/DONNEES_GENEREES.md`, `docs/agents/SOURCES.md`, audits de contenus | Certains générateurs ou prérequis sont signalés indisponibles historiquement. |
| Serveur et enseignant | `docs/SERVEUR.md` | Guide principalement technique. |
| Focus et motivation | `docs/INTEGRATION_FOCUS_MOTIVATION.md` | Documentation d'intégration. |
| Android et distribution | `store/README.md`, `docs/rapports/H1_APK_BILAN_2026-10-21.md` | Préparation et bilan, pas preuve de publication. |
| Autres outils et parcours | Commentaires, composants et tests associés | Aucun guide utilisateur dédié identifié dans le catalogue ; recherche à compléter par audit. |

## Arbitrages à différer jusqu'aux preuves

Le classement initial de valeur privilégie cours, méthode, entraînement avec
retour utile, révision espacée, puis parcours et préparation aux épreuves.
Le hors ligne et la conservation du travail sont des conditions transversales.
Le tuteur, le suivi enseignant, les outils annexes et la gamification doivent
démontrer leur apport et leur coût. Cela ne justifie pas leur suppression anticipée.

Chaque fiche ajoutera les liens de documents actuels, les dépendances entre IDs,
les scénarios testés et la recommandation de périmètre. Les outils regroupés
(par exemple F37) doivent être évalués séparément dans la fiche ou être scindés
en sous-IDs stables, sans perdre le lien avec cet inventaire.
