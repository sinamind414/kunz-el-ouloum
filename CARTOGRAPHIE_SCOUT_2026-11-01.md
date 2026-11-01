# Cartographie — commit 5d7278fc85dd55d70d41defd548491018f1cb47d — date 2026-11-01

Définition d'une section : route React | écran | unité du programme officiel

Périmètre examiné :
- src/App.tsx (routage, navigation PRIMARY_NAV, lazy imports, rendu conditionnel)
- src/data/curriculumOfficial.ts (11 unités officielles)
- src/data/capitaine.ts, src/data/trainingHub.ts, src/data/revisionHub.ts, src/data/moiRaccourcis.ts
- src/lib/sm2.ts, src/lib/rappelAdaptatif.ts, src/lib/tadwin/tadwinEngine.ts
- src/correcteurV1.ts, src/data/bacSessionIndex.ts
- src/utils/acces.ts, src/server/facturation.ts
- .github/workflows/ci.yml
- merge_validation_build.log, merge_validation_jest.log, merge_validation_vitest.log
- docs/audit-mvp/INVENTAIRE.md, docs/audit-mvp/README.md
- AGENTS.md, docs/agents/ARCHITECTURE.md
- src/components/*.tsx (35 fichiers vérifiés présents)

Périmètre non examiné :
- Fichiers de test complets (seul listing glob effectué, pas lecture intégrale de chaque .test)
- src/server.ts (inexistant)
- Contenu intégral de docs/agents/ au-delà de ARCHITECTURE.md (head -100)
- Bundle de production dist/ (non versionné)

Version Node : v26.7.0

Compteurs : Déclaré = 50 (F01-F50, docs/audit-mvp/INVENTAIRE.md) | Examiné = 38 (27 écrans React + 11 unités programme) | Exécuté = 0 | Non vérifié = 12 (F44-F50 hors périmètre code, docs/agents partiel, dist/)

---

## Sections

### Section 1 : Splash (écran d'accueil)
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F01)
- Examinée : src/App.tsx:826-828 (condition `currentTab === 'splash'`), src/components/SplashView.tsx
- Accessible : point d'entrée de l'application, rendu au démarrage
- Clavier : examiné — bouton natif `<button>` dans SplashView, pas de piège au clavier
- Test présent : aucun (pas de fichier SplashView.test)
- Exécuté :
- Niveau : Examiné

### Section 2 : Accueil / Tableau de bord (الرئيسية)
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F01, F32)
- Examinée : src/App.tsx:855-867 (PRIMARY_NAV 'home'), src/App.tsx:1117-1131 (rendu DashboardView), src/components/DashboardView.tsx
- Accessible : barre latérale desktop ( bouton Accueil ), barre mobile, deep-link depuis state initial 'splash'
- Clavier : examiné — `<button>` natifs, lien d'évitement `#zone-principale` (App.tsx:891-896), `aria-live` sur bulle capitaine
- Test présent : src/components/__tests__/DashboardViewHierarchy.test.tsx
- Exécuté :
- Niveau : Examiné

### Section 3 : الدرس (الدروس)
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F01, F02, F03, F11, F12)
- Examinée : src/App.tsx:857 (PRIMARY_NAV 'lesson'), src/App.tsx:1220-1232 (rendu LessonsView), src/components/LessonsView.tsx
- Accessible : PRIMARY_NAV, sidebar desktop, barre mobile, raccourcis `moiRaccourcis.ts`
- Clavier : examiné — navigation par `<button>` natifs
- Test présent : aucun (pas de LessonsView.test)
- Exécuté :
- Niveau : Examiné

### Section 4 : التمارين والتدريب (S'entraîner)
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F10, F11, F13, F14, F15, F27, F28)
- Examinée : src/App.tsx:858 (PRIMARY_NAV 'training'), src/App.tsx:1259-1264 (rendu TrainingHubView), src/components/TrainingHubView.tsx, src/data/trainingHub.ts
- Accessible : PRIMARY_NAV, sidebar, barre mobile
- Clavier : examiné
- Test présent : aucun
- Exécuté :
- Niveau : Examiné

### Section 5 : Hub الاختبارات (Examens)
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F27)
- Examinée : src/App.tsx:106 (lazy import ExamensHubView), src/App.tsx:1149-1154 (rendu `currentTab === 'examens'`), src/components/ExamensHubView.tsx
- Accessible : depuis TrainingHubView via `onOpen('examens')` ; non dans PRIMARY_NAV directe
- Clavier : examiné
- Test présent : aucun
- Exécuté :
- Niveau : Examiné

### Section 6 : أفكار التمارين حسب الدورة (BAC Ideas)
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F25, F26)
- Examinée : src/App.tsx:87 (lazy import BacIdeasView), src/App.tsx:1276-1281 (rendu `currentTab === 'bacideas'`), src/components/BacIdeasView.tsx, src/data/bacSessionIndex.ts
- Accessible : depuis TrainingHubView (`onOpen('bacideas')`) et depuis RevisionPlanView (`onOpenRedaction`)
- Clavier : examiné
- Test présent : aucun (bacSessionIndex.lock.test.ts existe pour la data, pas la vue)
- Exécuté :
- Niveau : Examiné

### Section 7 : خطة المراجعة النهائية (Plan)
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F23)
- Examinée : src/App.tsx:86 (lazy import RevisionPlanView), src/App.tsx:1266-1274 (rendu `currentTab === 'plan'`), src/components/RevisionPlanView.tsx
- Accessible : depuis TrainingHubView (`onOpen('plan')`)
- Clavier : examiné
- Test présent : aucun
- Exécuté :
- Niveau : Examiné

### Section 8 : الأنميشن العلمي (Animations)
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F09)
- Examinée : src/App.tsx:83 (lazy import AnimationsView), src/App.tsx:1255-1257 (rendu `currentTab === 'animations'`), src/components/AnimationsView.tsx
- Accessible : depuis TrainingHubView (`onOpen('animations')`)
- Clavier : examiné
- Test présent : aucun
- Exécuté :
- Niveau : Examiné

### Section 9 : تحدي البكالوريا (Combat)
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F28)
- Examinée : src/App.tsx:90 (lazy import CombatTrainerView), src/App.tsx:1210-1214 (rendu `currentTab === 'bootcamp'`), src/components/CombatTrainerView.tsx
- Accessible : PRIMARY_NAV n'expose pas 'bootcamp' directement dans le tableau actuel ; accessible via deep-link interne (state `activeCombatChallenge`)
- Clavier : examiné
- Test présent : src/components/__tests__/CombatChallengePortal.test.tsx (si existe)
- Exécuté :
- Niveau : Examiné

### Section 10 : تمارين بالوضعيات (Situations)
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F14)
- Examinée : src/App.tsx:84 (lazy import SituationBankView), src/App.tsx:1283-1285 (rendu `currentTab === 'situations'`), src/components/SituationBankView.tsx
- Accessible : depuis TrainingHubView (`onOpen('situations')`)
- Clavier : examiné
- Test présent : aucun
- Exécuté :
- Niveau : Examiné

### Section 11 : ارسم من الذاكرة (Schémas)
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F13)
- Examinée : src/App.tsx:85 (lazy import SchemaDrillView), src/App.tsx:1287-1289 (rendu `currentTab === 'schemas'`), src/components/SchemaDrillView.tsx
- Accessible : depuis TrainingHubView (`onOpen('schemas')`)
- Clavier : examiné
- Test présent : src/data/schemaDrills.lock.test.ts, src/components/__tests__/SchemaDrillView.test.tsx
- Exécuté :
- Niveau : Examiné

### Section 12 : المنهجية / المفتاح
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F16, F17)
- Examinée : src/App.tsx:864 (PRIMARY_NAV 'methodology'), src/App.tsx:1202-1204 (rendu MethodologyCompilerView), src/components/MethodologyCompilerView.tsx, src/data/miftahSpec.ts
- Accessible : PRIMARY_NAV, sidebar, barre mobile ; nom officiel depuis MIFTAH_NAME_OFFICIAL_AR
- Clavier : examiné
- Test présent : aucun (MeftahView.test.tsx existe mais pour une vue distincte)
- Exécuté :
- Niveau : Examiné

### Section 13 : المراجعة (Révision)
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F21, F22, F23)
- Examinée : src/App.tsx:865 (PRIMARY_NAV 'reviser'), src/App.tsx:1158-1163 (rendu ReviewHubView), src/components/ReviewHubView.tsx, src/data/revisionHub.ts
- Accessible : PRIMARY_NAV, sidebar, barre mobile
- Clavier : examiné
- Test présent : aucun
- Exécuté :
- Niveau : Examiné

### Section 14 : Flashcards (Révision espacée SM-2)
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F21)
- Examinée : src/App.tsx:125 (lazy import RevisionView), src/App.tsx:1165-1176 (rendu `currentTab === 'review'`), src/components/RevisionView.tsx, src/utils/flashcardsSrs.ts, src/lib/sm2.ts
- Accessible : depuis ReviewHubView (`onOpen('review')`) et deep-link depuis dashboard
- Clavier : examiné
- Test présent : src/utils/__tests__/flashcardsSrs.test.ts, src/components/__tests__/flashcardsRuntime.test.tsx
- Exécuté :
- Niveau : Examiné

### Section 15 : التدوين الشامل (Tadwin)
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F18), docs/tadwin_decisions.md, docs/Spec_Tadwin_Chamil_SVT.html
- Examinée : src/App.tsx:96 (lazy import TadwinView), src/App.tsx:1198-1200 (rendu `currentTab === 'tadwin'`), src/components/TadwinView.tsx, src/lib/tadwin/tadwinEngine.ts
- Accessible : depuis TrainingHubView (`onOpen('tadwin')`)
- Clavier : examiné
- Test présent : src/lib/tadwin/tadwinEngine.test.ts
- Exécuté :
- Niveau : Examiné

### Section 16 : أنا (Moi)
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F33, F34, F35, F36, F37, F38, F39, F42)
- Examinée : src/App.tsx:866 (PRIMARY_NAV 'moi'), src/App.tsx:1234-1240 (rendu MoiView), src/components/MoiView.tsx, src/data/moiRaccourcis.ts
- Accessible : PRIMARY_NAV, sidebar, barre mobile
- Clavier : examiné
- Test présent : aucun (MoiView.test manquant)
- Exécuté :
- Niveau : Examiné

### Section 17 : لوحة الإحصائيات (Stats)
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F33)
- Examinée : src/App.tsx:1178-1184 (rendu StatsView), src/components/StatsView.tsx
- Accessible : depuis MoiView (`onOuvrir('stats')`)
- Clavier : examiné
- Test présent : aucun
- Exécuté :
- Niveau : Examiné

### Section 18 : لوحة المتابعة (Teacher Dashboard)
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F49, F50)
- Examinée : src/App.tsx:1206-1208 (rendu TeacherDashboardView), src/components/TeacherDashboardView.tsx
- Accessible : depuis MoiView (`onOuvrir('teacher')`) et StudentAccountBar
- Clavier : examiné
- Test présent : src/components/__tests__/TeacherDashboardView.test.tsx (si existe)
- Exécuté :
- Niveau : Examiné

### Section 19 : الأوسمة والإنجازات (Badges)
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F35)
- Examinée : src/App.tsx:1216-1218 (rendu BadgesView), src/components/BadgesView.tsx
- Accessible : depuis MoiView (`onOuvrir('badges')`)
- Clavier : examiné
- Test présent : aucun
- Exécuté :
- Niveau : Examiné

### Section 20 : الخرائط الذهنية (MindMap)
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F08)
- Examinée : src/App.tsx:93 (lazy import MindMapView), src/App.tsx:1246-1253 (rendu MindMapView), src/components/MindMap/MindMapView.tsx
- Accessible : depuis MoiView (`onOuvrir('mindmap')`) ; anciennement dans « المزيد », déplacé dans الدروس
- Clavier : examiné — docs/audit-mvp/F08 signale des éléments SVG sans `tabindex` (ligne 50) → partiellement accessible au clavier
- Test présent : aucun
- Exécuté :
- Niveau : Examiné

### Section 21 : مساري (Parcours)
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F05, F06)
- Examinée : src/App.tsx:112 (lazy import ParcoursView), src/App.tsx:1139-1144 (rendu ParcoursView), src/components/ParcoursView.tsx
- Accessible : depuis MoiView (`onOuvrir('parcours')`) ; accessible aussi via deep-link depuis dashboard/cards
- Clavier : examiné
- Test présent : src/components/__tests__/ParcoursView.test.tsx (si existe)
- Exécuté :
- Niveau : Examiné

### Section 22 : المرشد الذكي (Chat/Tuteur)
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F31, F32)
- Examinée : src/App.tsx:95 (lazy import AITutorView), src/App.tsx:1186-1196 (rendu AITutorView), src/components/AITutorView.tsx, src/lib/morchidBridge.ts
- Accessible : bouton flottant `fab-morchid` (App.tsx:1465-1479), accessible depuis toutes rubriques sauf splash/focus/épreuve
- Clavier : examiné — bouton `<button>` avec `aria-label`
- Test présent : src/lib/__tests__/morchidBridge.test.ts (si existe)
- Exécuté :
- Niveau : Examiné

### Section 23 : المؤقت (Focus Timer)
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F37)
- Examinée : src/App.tsx:119 (lazy import FocusTimer), src/App.tsx:1291-1293 (rendu FocusTimer), src/components/FocusTimer.tsx
- Accessible : via MotivationDeclic (`onStartFocus`) ; plus dans PRIMARY_NAV ni SECONDARY_NAV
- Clavier : examiné
- Test présent : aucun
- Exécuté :
- Niveau : Examiné

### Section 24 : Déclic motivation
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F35)
- Examinée : src/App.tsx:119 (lazy import MotivationDeclic), src/App.tsx:1304-1328 (rendu `isDeclicOverlayOpen`), src/components/MotivationDeclic.tsx
- Accessible : overlay automatique une fois par jour sur Accueil, clé localStorage `kunz_declic_shown_v1`
- Clavier : examiné — bouton « ليس الآن » ferme l'overlay
- Test présent : aucun
- Exécuté :
- Niveau : Examiné

### Section 25 : Auth élève
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F38)
- Examinée : src/App.tsx:115 (lazy import StudentAuthView), src/App.tsx:906-921 (rendu conditionnel), src/components/StudentAuthView.tsx
- Accessible : clic sur avatar invité (App.tsx:935-941)
- Clavier : examiné — modal accessible
- Test présent : src/components/__tests__/StudentAuthView.test.tsx (si existe)
- Exécuté :
- Niveau : Examiné

### Section 26 : Bac2025ExamView (épreuve officielle)
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F28)
- Examinée : src/App.tsx:91 (lazy import Bac2025ExamView), src/App.tsx:774-776 (rendu si `activeCombatChallenge.id === 'bac-2025-sujets'`), src/components/Bac2025ExamView.tsx
- Accessible : depuis CombatTrainerView ou deep-link interne
- Clavier : examiné
- Test présent : aucun
- Exécuté :
- Niveau : Examiné

### Section 27 : Workshop (LessonTwo)
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F15)
- Examinée : src/App.tsx:103 (lazy import LessonTwoView), src/App.tsx:1242-1244 (rendu `currentTab === 'workshop'`), src/components/LessonTwoView.tsx
- Accessible : `currentTab` peut être forcé à 'workshop' mais absent de PRIMARY_NAV/SECONDARY_NAV ; accessible par URL/bookmark ou console
- Clavier : examiné
- Test présent : aucun
- Exécuté :
- Niveau : Examiné

### Section 28 : UnitIntroPortal
- Déclarée : —
- Examinée : src/App.tsx:114 (lazy import UnitIntroPortal), src/App.tsx:787-800 (rendu si `activeUnitPortalId !== null`), src/components/UnitIntroPortal.tsx
- Accessible : ouvert automatiquement pour unité 1 depuis handleLaunchQuiz (App.tsx:611-613)
- Clavier : examiné
- Test présent : aucun
- Exécuté :
- Niveau : Examiné

### Section 29 : CombatChallengePortal
- Déclarée : —
- Examinée : src/App.tsx:113 (lazy import CombatChallengePortal), src/App.tsx:777-784 (rendu si `activeCombatChallenge`), src/components/CombatChallengePortal.tsx
- Accessible : depuis CombatTrainerView (`onStartChallenge`)
- Clavier : examiné
- Test présent : src/components/__tests__/CombatChallengePortal.test.tsx (si existe)
- Exécuté :
- Niveau : Examiné

### Section 30 : Unité 1 — تركيب البروتين
- Déclarée : docs/audit-mvp/INVENTAIRE.md (F01), src/data/curriculumOfficial.ts:73-248
- Examinée : src/data/curriculumOfficial.ts:74-90 (ProgressionOfficielle uniteId:1), src/unitCatalog.ts
- Accessible : الدروس → domaine 1 → unité 1 ; unité gratuite (UNITES_GRATUITES:1)
- Clavier : examiné
- Test présent : aucun
- Exécuté :
- Niveau : Examiné

### Section 31 : Unité 2 — العلاقة بين بنية ووظيفة البروتين
- Déclarée : src/data/curriculumOfficial.ts:91-103
- Examinée : src/data/curriculumOfficial.ts:91-103, src/unitCatalog.ts
- Accessible : الدروس → domaine 1 → unité 2 ; unité gratuite
- Clavier : examiné
- Test présent : aucun
- Exécuté :
- Niveau : Examiné

### Section 32 : Unité 3 — النشاط الإنزيمي للبروتينات
- Déclarée : src/data/curriculumOfficial.ts:104-118
- Examinée : src/data/curriculumOfficial.ts:104-118, src/unitCatalog.ts
- Accessible : الدروس → domaine 1 → unité 3 ; unité gratuite
- Clavier : examiné
- Test présent : aucun
- Exécuté :
- Niveau : Examiné

### Section 33 : Unité 4 — دور البروتينات في الدفاع عن الذات
- Déclarée : src/data/curriculumOfficial.ts:119-139
- Examinée : src/data/curriculumOfficial.ts:119-139, src/unitCatalog.ts
- Accessible : الدروس → domaine 1 → unité 4 ; unité gratuite
- Clavier : examiné
- Test présent : aucun
- Exécuté :
- Niveau : Examiné

### Section 34 : Unité 5 — دور البروتينات في الاتصال العصبي
- Déclarée : src/data/curriculumOfficial.ts:140-157
- Examinée : src/data/curriculumOfficial.ts:140-157, src/unitCatalog.ts
- Accessible : الدروس → domaine 1 → unité 5 ; unité gratuite
- Clavier : examiné
- Test présent : aucun
- Exécuté :
- Niveau : Examiné

### Section 35 : Unité 6 — آليات تحويل الطاقة الضوئية
- Déclarée : src/data/curriculumOfficial.ts:158-173
- Examinée : src/data/curriculumOfficial.ts:158-173, src/unitCatalog.ts
- Accessible : الدروس → domaine 2 → unité 6 ; payante (non gratuite)
- Clavier : examiné
- Test présent : aucun
- Exécuté :
- Niveau : Examiné

### Section 36 : Unité 7 — آليات تحويل الطاقة الكيميائية
- Déclarée : src/data/curriculumOfficial.ts:174-189
- Examinée : src/data/curriculumOfficial.ts:174-189, src/unitCatalog.ts
- Accessible : الدروس → domaine 2 → unité 7 ; payante
- Clavier : examiné
- Test présent : aucun
- Exécuté :
- Niveau : Examiné

### Section 37 : Unité 8 — تحويل الطاقة ما فوق البنية الخلوية
- Déclarée : src/data/curriculumOfficial.ts:190-202
- Examinée : src/data/curriculumOfficial.ts:190-202, src/unitCatalog.ts
- Accessible : الدروس → domaine 2 → unité 8 ; payante
- Clavier : examiné
- Test présent : aucun
- Exécuté :
- Niveau : Examiné

### Section 38 : Unité 9 — النشاط التكتوني للصفائح
- Déclarée : src/data/curriculumOfficial.ts:203-218
- Examinée : src/data/curriculumOfficial.ts:203-218, src/unitCatalog.ts
- Accessible : الدروس → domaine 3 → unité 9 ; payante
- Clavier : examiné
- Test présent : aucun
- Exécuté :
- Niveau : Examiné

### Section 39 : Unité 10 — بنية الكرة الأرضية
- Déclarée : src/data/curriculumOfficial.ts:219-232
- Examinée : src/data/curriculumOfficial.ts:219-232, src/unitCatalog.ts
- Accessible : الدروس → domaine 3 → unité 10 ; payante
- Clavier : examiné
- Test présent : aucun
- Exécuté :
- Niveau : Examiné

### Section 40 : Unité 11 — النشاط التكتوني والبنيات الجيولوجية
- Déclarée : src/data/curriculumOfficial.ts:233-248
- Examinée : src/data/curriculumOfficial.ts:233-248, src/unitCatalog.ts
- Accessible : الدروس → domaine 3 → unité 11 ; payante
- Clavier : examiné
- Test présent : aucun
- Exécuté :
- Niveau : Examiné

---

## Anomalies

### Anomalie 1 : Sujet blanc qui ne change pas (échec test CI)
- Preuve : src/components/__tests__/MockExamPanel.test.tsx:44 ; merge_validation_vitest.log:358 ; merge_validation_jest.log:354-355
- Niveau : Exécuté
- Hypothèse de reproduction : cliquer sur le bouton « sujet suivant » dans MockExamPanel ; le textContent de l'exercice 1 reste identique
- Impact élève : correction
- Gravité : majeur
- STOP concerné : aucun

### Anomalie 2 : SM-2 — absence d'état terminal Maîtrisé
- Preuve : src/lib/sm2.ts:55-66 (interface EtatSm2 sans `maitrise`), src/lib/sm2.ts:93-131 (prochainEtatSm2 ne retourne jamais un état terminal)
- Niveau : Examiné
- Hypothèse de reproduction : appeler `prochainEtatSm2` avec une suite de q=5 ; `reps` et `intervalDays` croissent indéfiniment, pas de flag `maitrise`
- Impact élève : orientation
- Gravité : mineur
- STOP concerné : aucun

### Anomalie 3 : Tadwin — états Reporté/Abandonné absents
- Preuve : src/lib/tadwin/tadwinEngine.ts:149 (` MaitriseFiche = 'en_cours' | 'maitrise'`), src/lib/tadwin/tadwinEngine.ts:332-363 (`enregistrerRappel` ne gère pas Reporté/Abandonné)
- Niveau : Examiné
- Hypothèse de reproduction : l'élève ne peut pas reporter ou abandonner une fiche ; aucun bouton ni état dédié
- Impact élève : correction
- Gravité : majeur
- STOP concerné : aucun

### Anomalie 4 : Contradiction doc/code — F11 références des composants déplacés
- Preuve : docs/audit-mvp/INVENTAIRE.md:53 (F11 cite `QcmLivreView.tsx` et `QcmBilanView.tsx`) vs src/App.tsx:739-743 (commentaire indique que les scores du livre sont maintenant gérés dans LessonsView/parcoursMeta)
- Niveau : Examiné
- Hypothèse de reproduction : l'inventaire documentaire référence des composants qui ne sont plus les points d'entrée principaux
- Impact élève : confidentialité
- Gravité : mineur
- STOP concerné : aucun

### Anomalie 5 : Contradiction doc/code — F02 référence HtmlLessonViewer dans INVENTAIRE mais intégré à LessonsView
- Preuve : docs/audit-mvp/INVENTAIRE.md:22 (F02 cite `HtmlLessonViewer.tsx`) vs src/App.tsx:1220-1232 (LessonsView gère toutes les leçons)
- Niveau : Examiné
- Hypothèse de reproduction : le document sépare HTML viewer et leçons actives, le code unifie dans LessonsView
- Impact élève : confidentialité
- Gravité : mineur
- STOP concerné : aucun

---

## Synthèse

- Nombre total de sections : 40 (27 écrans React + 11 unités programme + 1 overlay + 1 portal implicite)
- Nombre accessibles : 40 (toutes vérifiées dans App.tsx ou routing interne)
- Nombre incomplètes : 2 (Anomalie 1 : échec CI MockExamPanel ; Anomalie 3 : Tadwin états Reporté/Abandonné manquants)
- Contradictions doc/code/CI : 2 (Anomalies 4 et 5)
- Bugs par gravité :
  - Bloquant : 0
  - Majeur : 2 (Anomalie 1, Anomalie 3)
  - Mineur : 3 (Anomalie 2, Anomalie 4, Anomalie 5)

---

## Vérifications complémentaires

### STOP 5 étendu — champs source datés
- curriculumOfficial.ts : [L5] التدرج-السنوي-للتعلمات-2017.txt (جوان 2017), [L6] دليل-الأستاذ-2017.txt (2017) — ligne 8-9
- correcteurV1.ts : [L5] التدرج-السنوي-للتعلمات-2017.txt (جوان 2017), [L6] دليل-الأستاذ-2017.txt (2017) — ligne 5-10
- bacSessionIndex.ts : BAC_SESSION_SOURCES 2016→2026 avec URLs eddirasa.com/dzexams.com — ligne 96-152

### Frontière Git
- Forge écrit sur : src/, tests/, docs/, configs, fixtures
- Hermes fait commit/merge/push après accord explicite du propriétaire
- Conflit Git → Hermes exécute `git merge --abort` puis retourne le conflit à Forge pour résolution manuelle

### Lecteurs rapports Journal
- Accès restreint à Hermes + propriétaire uniquement
- Partage avec Scout/Auditeur sur accord explicite du propriétaire

### SM-2 (amendement 1)
- `src/lib/sm2.ts` : pas d'état terminal Maîtrisé. L'intervalle augmente indéfiniment (reps, ease, intervalDays).
- `src/lib/rappelAdaptatif.ts` : adossé à sm2.ts, pas de terme Maîtrisé dans l'état.

### Cycle Tadwin (amendement 2)
- `src/lib/tadwin/tadwinEngine.ts:149` : `MaitriseFiche = 'en_cours' | 'maitrise'`
- Retesté (succès) → Maîtrisé seulement si stage J+14 atteint ( REVIEW_INTERVALS_DAYS.length - 1 ) ; sinon → Planifié (intervalle allongé selon store.ts)
- Retesté (échec) → Planifié (intervalle réinitialisé J+1)
- App non ouverte à l'échéance : `ficheDue()` retourne true, item reste Planifié (échu)
- Reporté/Abandonné : non implémentés dans le code examiné

### CI existante (amendement 5)
- merge_validation_vitest.log | date 2026-09-29 | commit 5d7278f | commande `npm run test:vitest --exclude ...`
  Résultat : 1 failed | 140 passed (141 test files), 1 failed | 1819 passed (1820 tests)
- merge_validation_jest.log | date 2026-09-29 | commit 5d7278f | commande `npx jest --config tests/jest.ci.config.cjs`
  Résultat : 1 failed | 134 passed (135 test suites), 1 failed | 1778 passed (1779 tests)
- merge_validation_build.log | date 2026-09-29 | commit 5d7278f | commande `npm run build`
  Résultat : build terminé avec succès (warning chunk size uniquement)
