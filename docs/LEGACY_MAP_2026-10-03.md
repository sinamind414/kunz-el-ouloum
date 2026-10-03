# Legacy Map — feuille de route de simplification (audit 03102026 → redesigning guided)

Source : `redesigning-guided-learning-architecture` (Next.js, non adopté en stack).
**Retenu : l'architecture logique. Rejeté : la stack** (jeter 2 296 tests + offline-first = non).

Thèse : *35 surfaces héritées ramenées à 4 rôles. Une seule tâche par jour.*

Vérifié le 03/10/2026 contre `master` (HEAD `ccca9dd`) : **43/43 modules cités existent réellement**.

## Les 4 niveaux

| Niveau | Règle |
|---|---|
| **premier-plan** | Visible à l'ouverture |
| **dans-la-brique** | N'est plus une destination : devient une phase de la séance |
| **sous-menu** | À un geste des 4 onglets, quand c'est utile |
| **masque** | Réglage, jalon, ou supprimé |

## Tableau de migration (applicabile brique par brique, sans réécrire)

| Module actuel | Devient | Niveau |
|---|---|---|
| `الرئيسية` (NbaCard + DailyGoalWidget + TodayCard + SmartReminderCard + BoussoleCard) | **1 carte Next Best Action unique** | premier-plan |
| `المراجعة` (RevisionView) | Rappel espacé sur Aujourd'hui, **seulement quand il est dû** | premier-plan |
| `المرشد` (AITutorView) | Supprimé comme onglet · Morchid à 4 moments de la séance | dans-la-brique |
| `الدروس` (LessonsView) | Phase 1 « Découverte » · relecture dans Parcours | dans-la-brique |
| `المؤقّت` (FocusTimer) | Minuteur **dans** la séance (règle 20–25 min) | dans-la-brique |
| `مفتاح المنهجية` | Phase 3 « Méthode » : 4 dents فعل·دليل·علاقة·جواب | dans-la-brique |
| `التمارين والتدريب` (TrainingHub 8 portes) | **Supprimé** — 8 portes redistribuées ci-dessous | masque |
| `تمارين بالوضعيات` (SituationBank) | Phase 4 « Application Bac » | dans-la-brique |
| `ارسم من الذاكرة` (SchemaDrill) | Extension phase 2 pour briques à schéma obligatoire | dans-la-brique |
| `الورشة التفاعلية` | Phase 4 : production écrite AVANT le barème | dans-la-brique |
| `الأنميشن العلمي` (ScienceAnimations) | Support visuel de la phase 1 | dans-la-brique |
| `التدوين` (TadwinView) | Tiroir « دوّن » dans chaque séance + carnet dans Moi | sous-menu |
| `الخرائط الذهنية` (MindMap) | Synthèse de l'unité au jalon, puis relisible | sous-menu |
| `تقدّمي` (StatsView) | Moi → olivier des jalons, chiffres en phrases | sous-menu |
| `أفكار التمارين` (BacIdeas) | Bac → « Ce qui tombe vraiment » | sous-menu |
| `المصحّح` (Correcteur + WritingReview) | Phase 4 : barème + diagnostic T1–T4 | dans-la-brique |
| `أسئلة الكتاب` (QcmLivre + QcmBilan) | Verrous de phase et rappels espacés | dans-la-brique |
| `الكبسولات` (microRemediations) | Contenu des relances « أنا عالق » | dans-la-brique |
| `المحاكيات` (ElectrophoresisSimulator) | Support de phase 1 (unité 2) | dans-la-brique |
| `جدار التحليل` (TahlilWall) | Phase 3 « Méthode » | dans-la-brique |
| `افتتاح الوحدة` (UnitIntroPortal) | Sonde de la 1re brique de l'unité | dans-la-brique |
| `المتون` (okacha + hosila + HtmlLessonViewer) | Sources des phases 1 et 2 (contenu, pas navigation) | dans-la-brique |
| `خطة المراجعة` (RevisionPlan) | Bac → phase finale **ouverte à J-56 seulement** | masque |
| `تحدي البكالوريا` (CombatTrainer) | Bac → épreuve blanche chronométrée (J-56) | masque |
| `مواضيع` (Bac2025Exam + MockExam) | Bac → épreuve blanche (J-56) | masque |
| `الأوسمة` (Badges) | Moi → olivier : une feuille par brique | masque |
| `لوحة المتابعة` (TeacherDashboard) | Moi → suivi adulte (même vue que l'élève) | masque |
| `سلسلة الأيام` (Streak) | Rythme 5/7, **sans série à casser** | masque |
| `الدافع اليومي` (MotivationDeclic) | Ligne « pourquoi celle-ci ? » sur la carte du jour | masque |
| `التذكير` (StudyReminderModal) | 1 rappel qui ouvre directement la tâche | masque |
| `التقرير الأسبوعي` (WeeklyReportShare) | Moi → suivi adulte | masque |
| `البحث` (SearchView) | **Limité aux briques déjà tenues** | masque |
| `الحساب` (BackupPanel + StudentAuth) | Moi → compte | masque |
| `شاشة الانطلاق` (SplashView) | Première ouverture seulement | masque |

## Ce qui change pour Morchid — ⚠️ à arbitrer

Le rapport **supprime l'onglet chat**. Nous venons d'y implanter SpecKit 002 (11 probes, triade C3, typage R/A, rappel actif S-05, protocole <50 %). Ce n'est pas contradictoire : le rapport ne supprime pas le tuteur, il le **déplace**. La richesse que nous avons construite trouverait sa place dans les 4 moments — sans l'ouverture d'un chat permanent qui invite les sollicitations désordonnées.

**Décision à prendre** : garder l'onglet tel quel, ou le plier en overlay moments-dans-la-séance.

## Ce qui change pour les intervalles — ⚠️ à arbitrer

Le rapport propose J+7 → J+21. Nous venons d'unifier en **J+1 → J+3 → J+7 → J+14** (commit `d08d715`). Un troisième référentiel serait une régression : le nôtre reste canonique.

## Application possible, sans casser l'existant

L'approche suggérée par le rapport est de **remplacer 35 surfaces par 4 rôles**. Concrètement, dans le dépôt actuel, le premier geste réversible serait de masquer les entrées de niveau "masque" derrière un sous-menu unique, sans toucher aux composants eux-mêmes.

## État réel au 03/10/2026 (vérifié, HEAD `ccca9dd`)

Le rapport est **déjà partiellement appliqué** — vérification faite dans le code :

| Entrée du Legacy Map | État réel |
|---|---|
| `تقدّمي` (stats) | ✅ sorti de la barre principale → icône page أنا (`moiRaccourcis.ts`) |
| `الأوسمة` (badges) | ✅ sorti du menu المزيد → icône page أنا |
| `لوحة المتابعة` (teacher) | ✅ sorti du menu المزيد → icône page أنا |
| `خطة المراجعة` (plan) | ✅ plus d'entrée de menu ; s'ouvre depuis TodayCard |
| `أفكار التمارين` (bacideas) | ✅ plus d'entrée de menu ; s'ouvre depuis la page Bac |
| `القائمة` 8 → 7 onglets | ✅ PRIMARY_NAV = 6 entrées + SECONDARY_NAV = 4 |

**Preuve de non-régression** : `moiRaccourcis.ts` est la source unique des 3 étiquettes déplacées, et un test de MoiView casse si l'une d'elles réapparaît dans l'ancien menu. C'est exactement la discipline du Legacy Map, déjà mécanisée.

### Ce qui reste à faire (l'écart)

| Module | Niveau cible | Écart |
|---|---|---|
| `المرشد` (chat) | dans-la-brique | 🔴 encore onglet principal — **à arbitrer** |
| TrainingHub (8 portes) | masqué | 🔴 toujours 8 portes en niveau "sous-menu" |
| Splash + MotivationDeclic | masqué | 🟡 présents, acceptables (1re ouverture) |

Les 3 frictionrs critiques du rapport sont donc : **(1) l'onglet chat**, **(2) TrainingHub**, **(3) l'absence d'une carte NBA unique** (l'accueil reste multi-cartes).

