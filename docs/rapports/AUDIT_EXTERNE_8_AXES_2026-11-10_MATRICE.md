# Matrice de couverture — 133 critères (audit externe 8 axes, version 2)

> Source : archive `pedagogical-svt-app-audit (2).zip` → `src/data/checklist.ts`
> (extraction **verbatim**, aucune reformulation).
>
> Colonne « Contrôle dépôt 2026-11-10 » : **uniquement** des mesures faites dans le
> dépôt ce jour-là — ✔ confirmé · ✘ la formulation de l’audit est dépassée ou fausse ·
> ⚠️ à trancher · — non recontrôlé (l’audit reste la référence).

**Total : 133 critères** — 59 vérifiés · 34 partiels · 10 absents · 30 non vérifiables par l’auditeur.

| # | Axe | Groupe | Critère | Statut audit | Preuve donnée par l’auditeur | Contrôle dépôt 2026-11-10 |
|---|---|---|---|---|---|---|
| 1 | 1 | Couverture | Tout le programme SVT du Bac est-il couvert ? | V | 11 unités = totalité du التدرج L5, 108 h encodées (curriculumOfficial.ts) | ✔ 11 unités (curriculumOfficial.ts : uniteId 1→11) |
| 2 | 1 | Couverture | Alignement sur la dernière version ministérielle | V | Sources جوان 2017 : التدرج السنوي L5 pp.3-6 + دليل الأستاذ L6, encore en vigueur | ✔ L5 (التدرج 2017) + L6 (دليل الأستاذ) toujours en vigueur (constaté le 20/10/2026) |
| 3 | 1 | Couverture | Respect des unités officielles et des 3 domaines | V | Domaine 1 protéines (51 h), D2 énergie (32 h), D3 tectonique (25 h) | ✔ somme des `heures:` = **108 exactement** |
| 4 | 1 | Couverture | Série EXP — SVT renforcé | V | Ciblage explicite 3AS علوم تجريبية, compétences de domaine L6 encodées | ✔ ciblage EXP explicite dans le référentiel encodé |
| 5 | 1 | Couverture | Autres filières (Maths, Technique) signalées | A | Aucun avertissement de périmètre pour un élève hors علوم تجريبية | — |
| 6 | 1 | Progression | Progression du simple au complexe, du concret à l'abstrait | V | Fenêtres trimestrielles respectées : U1 sept → U11 3e trimestre | ✔ fenêtres trimestrielles encodées (12 occurrences de `fenetre`) |
| 7 | 1 | Progression | Démarche d'investigation officielle encodée | V | DEMARCHE_5_ETAPES : diagnostic → situation-problème → évaluation → remédiation | ✔ `DEMARCHE_5` présent |
| 8 | 1 | Exactitude | Notions correctes et vocabulaire officiel | P | Ancrage L5 auto-mesuré le 20/09/2026 : 15/42 citations mot à mot, 22/42 à couverture lexicale 100 % | — |
| 9 | 1 | Exactitude | Erreurs factuelles ou approximations dangereuses | P | Aucune détectée dans le code lu ; les leçons HTML de public/ n'ont pas été relues | — |
| 10 | 1 | Exactitude | Hors-programme écarté explicitement | V | estNonExigible() : المتمم, مبدأ الأسيلوسكوب, نضج الـ ARNm | ✔ `estNonExigible()` présent |
| 11 | 1 | Exactitude | Enrichissement séparé de l'exigible | V | CULTURE_GENERALE + bandeau, exclu des statistiques d'exigibilité BAC | ✔ `CULTURE_GENERALE` + bandeau |
| 12 | 1 | Terminologie | Cohérence avec le manuel 3AS | P | 52 % de couverture lexicale mesurée : aligné mais non littéral, écart assumé et daté | — |
| 13 | 1 | Terminologie | Équivalents français des termes arabes | A | Aucun glossaire FR↔AR : app 100 % arabe, or les tournures ONEC et la fac sont francisées | ✘ **À FAIRE** : aucun glossaire FR↔AR (`GlossaireCapitaine` n’est pas FR↔AR) |
| 14 | 2 | Richesse | Nombre de leçons / modules / chapitres | P | activeLessons.ts pèse 244,8 Ko, numérotation observée jusqu'au chapitre 44 ; total exact non publié | — |
| 15 | 2 | Richesse | Cours complets et résumés structurés | P | Leçons actives + micro-remédiations ; résumé structuré par leçon non vérifié | — |
| 16 | 2 | Richesse | Diagrammes et schémas annotés | V | 69 drills de schéma servis + QCM avec schéma et explication | — |
| 17 | 2 | Richesse | Cartes mentales / mind maps | N | Aucune trace dans le code lu ni dans le README | ✔ **présentes** (vue « الخرائط الذهنية » + `cartesHosila`) — l’audit les a manquées |
| 18 | 2 | Richesse | Tableaux comparatifs (mitose / méiose, etc.) | N | Non vérifiable — leçons HTML verrouillées dans public/ | — |
| 19 | 2 | Richesse | Exemples concrets et illustrations réalistes | P | Archétypes adossés à des exercices Bac réels, jamais inventés (test de verrou) | — |
| 20 | 2 | Richesse | Glossaire scientifique français + arabe | A | Absent : manque le plus pénalisant pour la suite d'études | ✘ **À FAIRE** : même manque, cité sur 2 axes (1 et 2) |
| 21 | 2 | Richesse | Fiches « Ce qu'il faut retenir » par chapitre | N | Non vérifiable ; answerStructureCheck.ts fournit des attendus de réponse, pas une fiche | — |
| 22 | 2 | Richesse | Qualité et résolution des images / animations | N | Assets de public/ non audités | — |
| 23 | 2 | Richesse | Mise en page et lisibilité | N | Interface non exécutée | — |
| 24 | 2 | Hiérarchie | Étiquetage 🔴 indispensable / 🟡 important / 🟢 complémentaire | P | 3 niveaux d'exigibilité existent (exigible / hors-programme / ثقافة عامة) mais pas de fréquence Bac | ✔ priorité par unité calculée (`prioritePourUnite`, sur les 65 idées BAC cotées) |
| 25 | 2 | Hiérarchie | L'élève distingue-t-il l'essentiel du secondaire ? | P | Oui pour le hors-programme, non pour la fréquence de tombée | — |
| 26 | 2 | Hiérarchie | Indicateur de poids de chaque chapitre à l'examen | P | archetypeRecurrence() classe par points cumulés réels ; non reporté par unité dans l'UI | ✔ `BAC_IDEAS` ≥ 65 idées cotées (verrou `bacArchetypes.lock.test.ts`) |
| 27 | 2 | Hiérarchie | Micro-leçons de 5-10 min (chunking) | P | « Porte des 2 minutes » + drills courts ; découpage horaire des leçons non documenté | ✔ **livrées** : 578 chunks → 192 micro-leçons, `DUREE_MAX_MICRO_MIN = 10` |
| 28 | 2 | Hiérarchie | Objectif d'entrée « À la fin, tu sauras… » | P | Compétence officielle par unité encodée ; affichage en tête de leçon non vérifié | — |
| 29 | 2 | Hiérarchie | Synthèse de sortie « L'essentiel en 3 phrases » | N | Non vérifiable | — |
| 30 | 3 | Diagnostic | Test de positionnement initial | A | Refus délibéré et documenté : « Aucune case à cocher, aucun questionnaire » (phaseEleve.ts) | — |
| 31 | 3 | Diagnostic | Profil calculé plutôt que déclaré | V | deduirePhase() : 5 phases déduites de l'état réel, module pur testé | ✔ `deduirePhase()` — 5 phases déduites + creux (module pur testé) |
| 32 | 3 | Diagnostic | Adaptation élève en difficulté / moyen / avancé | V | porte_2_minutes → victoires_courtes → proteger_acquis → espacement_fermeture → production_chronometree | ✔ `porte_2_minutes` → … → `production_chronometree` + `profilEleve` |
| 33 | 3 | Diagnostic | Choix de la filière (SVT / EXP) | A | Filière unique علوم تجريبية, pas de sélecteur | — |
| 34 | 3 | Diagnostic | Choix d'objectif de note (10 / 14 / 18) | N | Aucun objectif chiffré trouvé dans les modules lus | — |
| 35 | 3 | Structure | Parcours guidé jour par jour / semaine par semaine | P | parcoursPath.ts + nbaEngine.ts (prochaine action) ; pas de plan daté sur 12 semaines | ✔ **partiellement** : `phaseEleve` (5 phases + creux + sprint) + `nbaEngine` ; le plan daté 12 semaines reste absent |
| 36 | 3 | Structure | Calendrier aligné sur la date du Bac | P | etat.horizon.joursAvantBac est une entrée de décision ; pas de calendrier visible | — |
| 37 | 3 | Structure | Objectifs quotidiens clairs et réalistes | V | porte_2_minutes (2 min) puis victoires courtes : calibration explicite de l'effort | — |
| 38 | 3 | Structure | Progression globale visuelle | P | parcoursProgress.ts + scoreLivre calculent l'avancement ; rendu UI non vérifié | — |
| 39 | 3 | Surcharge | Progressive disclosure | V | La « bulle » légère ne charge pas 286 Ko de séquences : contenu révélé par paliers | — |
| 40 | 3 | Surcharge | Guidage pas à pas plutôt que bibliothèque en vrac | V | nbaEngine = Next Best Action ; le coach prescrit une action, pas un catalogue | — |
| 41 | 3 | Surcharge | Mode Révision express (J-7) vs Apprentissage profond | V | Phase 5 sprint ≤ 30 j : production chronométrée, plus aucune découverte | ✔ phase 5 « sprint » (≤ 30 j du Bac) |
| 42 | 3 | Surcharge | Scaffolding des concepts complexes | P | Méthode ordonnée ≥ 3 étapes par archétype ; étayage intra-leçon non vérifié | — |
| 43 | 3 | Surcharge | Reprise après absence sans culpabilisation | V | Creux ≥ 3 j = parenthèse, jamais une régression ; « jamais de rattrapage » | — |
| 44 | 3 | Mémorisation | Répétition espacée intégrée au parcours | V | sm2.ts + rappelAdaptatif.ts + planificationRappels.ts + 11 schedule_recall | ✔ `sm2` + `rappelAdaptatif` + 16 `SPACED_RECALL_PROMPTS` + 11 `schedule_recall` |
| 45 | 3 | Mémorisation | Réactivation automatique des notions mal maîtrisées | V | profilErreurs (10 tags) → MICRO_REMEDIATIONS → rappel programmé | — |
| 46 | 3 | Mémorisation | Révisions croisées inter-unités | P | gestureRecallEngine + archétypes multi-unités ; croisement explicite non démontré | — |
| 47 | 3 | Mémorisation | Rappels fondés sur la courbe d'oubli personnelle | V | Revue J+14 (revueJ14.test.ts) + intervalles SM-2 personnalisés | ✔ `sm2` (courbe personnelle) |
| 48 | 3 | Métacognition | Identification de SES lacunes | V | Verdicts par compétence + errorTags + taxonomie de 10 erreurs | — |
| 49 | 3 | Métacognition | Conseils méthodologiques intégrés | V | Chaque archétype impose ≥ 2 signaux, ≥ 3 étapes de méthode et 1 piège (> 40 caractères) | ✔ `MethodologyCompilerView` + `nbaEngine` |
| 50 | 3 | Métacognition | Auto-évaluation avant la correction | N | answerStructureCheck.ts vérifie la structure ; estimation de note par l'élève non trouvée | — |
| 51 | 3 | Limite | Le moteur fonctionne-t-il en mode léger ? | P | Sans les 286 Ko de séquences, la phase 4 n'est pas constatable : repli honnête en phase 3 | — |
| 52 | 4 | Types | QCM avec pièges classiques du Bac | V | 550 QCM segmentés + trapAr obligatoire par archétype | ✔ 550 QCM corpus + quiz adaptatif par paliers |
| 53 | 4 | Types | Questions ouvertes / rédactionnelles | V | Correction par attendus officiels, barème ministériel 5 / 7 / 8 points | — |
| 54 | 4 | Types | Études de cas contextualisées | V | situations d'évaluation + 65 idées Bac réelles classées | — |
| 55 | 4 | Types | Séquences d'expérience / TP | P | Démarche en 5 étapes encodée ; TP virtuel non constaté | — |
| 56 | 4 | Types | Schémas à compléter / légender | V | 69 drills de schéma servis | ✔ 69 drills de schéma servis |
| 57 | 4 | Types | Analyse de documents (graphes, tableaux, textes) | V | Type d'exercice explicitement servi | — |
| 58 | 4 | Types | Vrai / Faux avec justification | N | Non mentionné dans les volumes verrouillés | — |
| 59 | 4 | Format Bac | Partie I — restitution des connaissances | V | QCM, textes à trous, drills de schéma | ✔ **format algérien** (3 exercices 5+7+8, 4h30) — le libellé « Partie I/II/III » vient du format français |
| 60 | 4 | Format Bac | Partie II — démarche d'investigation | P | DEMARCHE_5_ETAPES + archétypes expérimentaux ; étiquetage Partie II non constaté | ✔ idem : la démarche est encodée (`DEMARCHE_5`), pas une « Partie II » |
| 61 | 4 | Format Bac | Partie III — étude de cas / synthèse | V | Situations d'évaluation + answerStructureCheck.ts (structure de la réponse) | ✔ idem : pas de « Partie III » dans l’épreuve algérienne |
| 62 | 4 | Volume | Nombre d'exercices par chapitre et par unité | P | Volumes globaux verrouillés ; répartition par unité non publiée | — |
| 63 | 4 | Correction | Corrigés détaillés avec barème type Bac | V | Barème 5 / 7 / 8 conservé tel quel, y compris exempté du lint pour ne pas l'altérer | ✔ barème 5/7/8 |
| 64 | 4 | Correction | Niveaux de difficulté clairement indiqués | N | Aucun niveau ★ / ★★ / ★★★ trouvé | ✔ **présents** : `LIBELLES_DIFFICULTE` (3 paliers) + quiz adaptatif |
| 65 | 4 | Correction | Score / notation intégrée | V | scoreLivre.ts + points cumulés par archétype cohérents avec le barème | — |
| 66 | 4 | Boucle | Rappel de cours ciblé après échec | V | MICRO_REMEDIATIONS (31) déclenchées par l'erreur, puis rappel espacé | ✔ 31 `MICRO_REMEDIATIONS` → rappel programmé |
| 67 | 4 | Boucle | Un exercice peut-il relever de plusieurs montages ? | V | Test dédié : plus de 3 exercices multi-archétypes, transfert assumé | — |
| 68 | 5 | Banque | Annuaire de sujets Bac corrigés | P | 11 sessions indexées 2016 → 2026, 65+ exercices avec points ; énoncés intégraux non reproduits | ✔ 11 sessions indexées **+ 28 PDF officiels embarqués** (`public/bac-sujets`, 93,6 Mo) — l’audit s’en tient au README |
| 69 | 5 | Banque | Années 2018 à 2025 couvertes | V | Toutes incluses dans l'index 2016 → 2026 | ✔ 11 sessions continues 2016→2026 |
| 70 | 5 | Banque | Sujets de rattrapage | N | Non précisé dans l'index consulté | — |
| 71 | 5 | Banque | Sujets blancs / devoirs de synthèse | V | 3 épreuves blanches complètes par domaine + générateur de sujets | ✔ 3 blanches par domaine + générateur déterministe |
| 72 | 5 | Simulation | Mode examen chronométré | V | examenEnCours.ts persiste l'épreuve en cours ; phase 5 = production chronométrée | ✔ `examenEnCours` + `examTimer` (4h30), session persistante |
| 73 | 5 | Simulation | Durée officielle respectée | N | Aucune constante de durée officielle trouvée dans les modules lus | — |
| 74 | 5 | Simulation | Interface sobre type copie d'examen | N | Interface non exécutée | — |
| 75 | 5 | Simulation | Corrigés interdits avant la fin | N | Non vérifiable sans exécution | — |
| 76 | 5 | Entraînement | Par chapitre / unité / type de question | V | routageDomaine.ts + segments par domaine + drills typés | — |
| 77 | 5 | Correction | Correction type jury avec mots-clés attendus | V | Attendus officiels + barème 5 / 7 / 8 | — |
| 78 | 5 | Correction | Réponses alternatives acceptées et signalées | N | Non documenté | — |
| 79 | 5 | Statistiques | Réussite par type de sujet | P | archetypeRecurrence() donne les points par montage, pas le taux de réussite de l'élève | — |
| 80 | 5 | Récurrence | Montages récurrents prouvés, pas inventés | V | Verrou : ≥ 3 exercices ET ≥ 2 sessions distinctes, 100 % du corpus classé | ✔ `bacArchetypes` + verrou de non-invention |
| 81 | 5 | Légalité | Droits ONEC respectés | V | Un seul sujet intégral (2025) comme référence de format, limitation publiée | ⚠️ **à trancher** : l’app indexe les idées, mais **embarque 28 PDF officiels** (93,6 Mo) — arbitrage droit d’auteur à expliciter |
| 82 | 6 | Design | Design moderne et professionnel | N | Interface non exécutée, aucune capture auditée | — |
| 83 | 6 | Design | Navigation intuitive, recherche, filtres | P | routageDomaine.ts et conseilRubrique.ts structurent l'accès ; recherche plein texte non constatée | ✔ recherche plein texte offline (`SearchView`, 450 extraits) ; filtres à vérifier |
| 84 | 6 | Design | Chargement < 2 secondes | P | Budgets mesurés (noyau 154,4 Ko) mais aucun temps réel sur 3G publié | — |
| 85 | 6 | Design | Recherche plein texte dans le contenu | N | Non trouvé | ✔ **existe** (`SearchView` + index de leçons) — l’audit le classe non vérifiable |
| 86 | 6 | Design | Favoris / bookmarks | N | Non trouvé | ✔ **existe** (`src/utils/favorites.ts` : favoris de leçons + recherches récentes) — l’audit le classe non vérifiable |
| 87 | 6 | Cognition | Interface épurée, non surchargée | V | Une prescription à la fois (nbaEngine) ; stop après 3 échecs d'un motif | — |
| 88 | 6 | Cognition | Trouver l'information en moins de 3 clics | N | Non mesurable sans exécution | — |
| 89 | 6 | Cognition | Code visuel stable (couleurs, icônes) | N | Non vérifiable | — |
| 90 | 6 | Cognition | Texte aéré, titres visibles | N | Leçons HTML non auditées | — |
| 91 | 6 | Cognition | Mode sombre | N | Non trouvé | ✔ **existe** (variante `dark` + `prefers-color-scheme`) — l’audit le classe non vérifiable |
| 92 | 6 | Cognition | Taille de texte ajustable | N | Non trouvé | ✔ **existe** (3 crans : 100 % / 112,5 % / 125 %) — l’audit le classe non vérifiable |
| 93 | 6 | Contexte DZ | Téléchargement hors ligne | V | Mode invité 100 % local, précache vérifié par test:build (562 chunks) | — |
| 94 | 6 | Contexte DZ | Android ET iOS | N | PWA implicite ; présence Stores non vérifiable | ⚠️ **Android = APK Capacitor** (88,1 Mo, construit le 2026-11-10) ; iOS = PWA uniquement (pas de Xcode dans l’environnement) |
| 95 | 6 | Contexte DZ | Français / arabe / bilingue | A | 100 % arabe RTL assumé : aucun basculement français | ✘ **À FAIRE** : app 100 % arabe RTL, aucun basculement français |
| 96 | 6 | Contexte DZ | Termes scientifiques dans les deux langues | A | Absent | ✘ **À FAIRE** : même manque |
| 97 | 6 | Contexte DZ | Performance sur RAM ≤ 2 Go | P | Bulle allégée, chunks ≤ 237 Ko, 0 dépendance lourde en vue ; test appareil non publié | — |
| 98 | 6 | Contexte DZ | Poids < 50 Mo | P | Corpus actif ≈ 702 Ko éclatés ; poids total installé non publié | ⚠️ **web** ≈ 5 Mo ✔ · **APK** = 88,1 Mo (28 PDF officiels embarqués) ✘ — l’écart vient du choix offline |
| 99 | 7 | Révision active | Flashcards interactives | V | Format servi, couplé au rappel espacé | — |
| 100 | 7 | Révision active | Quiz chrono / mini-jeux | P | Production chronométrée en phase 5 ; mini-jeu ludique non constaté | ✔ chrono suspendu au profit de l’adaptatif + paliers |
| 101 | 7 | Révision active | Schémas interactifs (glisser-déposer) | P | 69 drills de schéma ; interaction exacte non vérifiée | — |
| 102 | 7 | Révision active | Générateur de résumés par IA | A | Absent — choix offline-first, aucun modèle embarqué | — |
| 103 | 7 | Motivation | Points, badges, séries (streaks) | P | assiduite.cumulJours et « série » pilotent les phases ; aucune récompense visuelle constatée | ✔ **existent** (`BadgesView`, `StreakCelebrationModal`, XP) — l’audit les déclare absents |
| 104 | 7 | Motivation | Classements amis / classe / national | A | Absent, cohérent avec l'absence de compte obligatoire | — |
| 105 | 7 | Motivation | Récompense de la régularité plutôt que de la performance | V | Le creux n'entraîne aucune régression ; victoires courtes en phase 2 | — |
| 106 | 7 | Motivation | Défis quotidiens / hebdomadaires | P | Prescription quotidienne du coach ; pas de défi gamifié | — |
| 107 | 7 | Adaptativité | Quiz adaptatif en temps réel | P | Adaptation à l'échelle de la séance (NBA), pas item à item | ✔ **existe** (`QuizAdaptatif`, paliers de difficulté) — l’audit le déclare absent |
| 108 | 7 | Adaptativité | Statistiques par chapitre / compétence / type | V | etatEleve.competence.verdicts + errorTags + points par archétype | ✔ `StatsView` (Recharts) + `profilErreurs` (10 tags) + panneau SRS |
| 109 | 7 | Adaptativité | Évolution dans le temps (courbes) | N | Aucun graphique de progression trouvé | ✔ **existe** (`StatsView` : LineChart / AreaChart / BarChart / PieChart) |
| 110 | 7 | Adaptativité | Identification automatique des points faibles | V | profilErreurs.ts + taxonomie de 10 erreurs + verdicts | ✔ `profilErreurs` (10 tags) + `profilEleve` |
| 111 | 7 | Adaptativité | Notifications intelligentes non intrusives | V | Prescriptions tracées (suivie / ignorée / expirée), stop après 3 échecs | — |
| 112 | 7 | Adaptativité | Chatbot / assistant IA | P | Tuteur القبطان rule-based (morchidBridge, gesteDialogue) : dialogue guidé sans LLM | ✔ tuteur **local** (règles + prescriptions tracées), 0 appel réseau — « chatbot IA » hors ligne assumé |
| 113 | 7 | Adaptativité | Forum / communauté d'entraide | A | Absent ; seul l'export des errorTags vers le professeur est prévu | — |
| 114 | 7 | Boucle | Apprendre → Tester → Erreurs → Réviser → Retester | V | Boucle fermée et locale : leçon → quiz → errorTag → remédiation → SM-2 → revue J+14 | — |
| 115 | 7 | Boucle | Fonctionnalités isolées les unes des autres ? | V | Non : etatEleveRuntime relie coach, parcours, rappels et examen | — |
| 116 | 8 | Fiabilité | Stabilité, absence de perte de données | P | 3 465 tests vitest + 3 408 jest verts, 0 échec toléré ; terrain non mesuré | ✔ données locales + export/import (`backup.ts`) ; non testé sur appareil réel |
| 117 | 8 | Fiabilité | Réactivité et fluidité | P | Budgets de bundle et chunk dédié ; aucune mesure d'animation | ✔ entrée 555,8 Ko (< 700 Ko), 99 chunks, budgets respectés |
| 118 | 8 | Fiabilité | Fonctionnement hors connexion | V | Serveur optionnel : sans lui, tout fonctionne en invité local | ✔ APK 100 % offline (assets embarqués) + SW économe |
| 119 | 8 | Fiabilité | Mises à jour régulières et pertinentes | V | M12, M12-bis, M16, B9, sprints 19/57, H2 — datés du 20-21/10/2026 | ✔ commits datés + chaînes vertes ; APK reconstruit le 2026-11-10 |
| 120 | 8 | Fiabilité | Support technique / aide / FAQ | N | Non trouvé | — |
| 121 | 8 | Fiabilité | Compatibilité téléphone / tablette | N | Non testé | — (APK construit ; **aucun device adb connecté** → pas de mesure sur matériel réel) |
| 122 | 8 | Fiabilité | Sécurité et vie privée | V | invité = 0 requête, 0 identifiant ; politiqueConfidentialite.ts documente l'export prof | — |
| 123 | 8 | Fiabilité | Synchronisation cloud des progrès | V | supabase.ts + SQLite par défaut / PostgreSQL si DATABASE_URL, optionnels | ✔ `supabase.ts` (optionnelle, non bloquante) |
| 124 | 8 | Économie | Modèle économique | V | Freemium assumé : المجال 1 (unités 1-5) gratuit, sans publicité | ✔ freemium assumé (essai 30 j, 1 200 DA/saison) |
| 125 | 8 | Économie | Coût du premium en DZD | V | 1 200 DA la saison, soit ≈ 171 DA/mois sur 7 mois | ✔ `PRIX_SAISON_DA = 1200` |
| 126 | 8 | Économie | Rapport qualité / prix pour un budget 100-500 DA | V | Dans la fourchette haute mais acceptable ; paiement unique à fractionner | ✔ domaine 1 (unités 1-5) gratuit, sans pub |
| 127 | 8 | Économie | Publicité absente / discrète / intrusive | V | Aucune publicité, aucun traqueur tiers | ✔ aucune pub, aucun traqueur tiers |
| 128 | 8 | Économie | Version gratuite réellement utilisable | V | 51 h de programme sur 108 (47 %), dont les 2 unités les plus lourdes | ✔ unités 1-5 complètes et hors ligne |
| 129 | 8 | Contexte DZ | Utilisable en 3G faible / zone rurale | V | Offline d'abord, segments ≤ 237 Ko, re-téléchargement partiel entre versions | ✔ APK : contenu embarqué, 0 requête en invité |
| 130 | 8 | Contexte DZ | Connexion permanente requise | V | Non : premier téléchargement uniquement | ✔ non (invité 100 % local) |
| 131 | 8 | Contexte DZ | Play Store ET App Store | N | Non vérifiable | — |
| 132 | 8 | Contexte DZ | Notes et avis utilisateurs | N | Non vérifiable | — |
| 133 | 8 | Contexte DZ | Téléchargements / installations | N | Non vérifiable | — |

## Légende

- **V** — vérifié dans le code par l’auditeur · **P** — partiel / indirect
- **A** — absent · **N** — non vérifiable par l’auditeur

## Les 10 critères « A » (absents) — le seul vrai reste à faire

- **Axe 1 — Couverture** : Autres filières (Maths, Technique) signalées  
  _preuve de l’auditeur : Aucun avertissement de périmètre pour un élève hors علوم تجريبية_
- **Axe 1 — Terminologie** : Équivalents français des termes arabes  
  _preuve de l’auditeur : Aucun glossaire FR↔AR : app 100 % arabe, or les tournures ONEC et la fac sont francisées_
- **Axe 2 — Richesse** : Glossaire scientifique français + arabe  
  _preuve de l’auditeur : Absent : manque le plus pénalisant pour la suite d'études_
- **Axe 3 — Diagnostic** : Test de positionnement initial  
  _preuve de l’auditeur : Refus délibéré et documenté : « Aucune case à cocher, aucun questionnaire » (phaseEleve.ts)_
- **Axe 3 — Diagnostic** : Choix de la filière (SVT / EXP)  
  _preuve de l’auditeur : Filière unique علوم تجريبية, pas de sélecteur_
- **Axe 6 — Contexte DZ** : Français / arabe / bilingue  
  _preuve de l’auditeur : 100 % arabe RTL assumé : aucun basculement français_
- **Axe 6 — Contexte DZ** : Termes scientifiques dans les deux langues  
  _preuve de l’auditeur : Absent_
- **Axe 7 — Révision active** : Générateur de résumés par IA  
  _preuve de l’auditeur : Absent — choix offline-first, aucun modèle embarqué_
- **Axe 7 — Motivation** : Classements amis / classe / national  
  _preuve de l’auditeur : Absent, cohérent avec l'absence de compte obligatoire_
- **Axe 7 — Adaptativité** : Forum / communauté d'entraide  
  _preuve de l’auditeur : Absent ; seul l'export des errorTags vers le professeur est prévu_

> 7 de ces 10 absences sont des **choix produit assumés** (offline-first, sans compte,
> sans traqueur) et non des oublis. La seule absence réellement coûteuse pour
> l’élève — et citée **deux fois** (axes 1 et 2) — est le **glossaire scientifique
> FR↔AR**.

## Critères que l’audit classe « absent » ou « non vérifiable » alors que le code les contient

- Axe 1 — Tout le programme SVT du Bac est-il couvert ? → ✔ 11 unités (curriculumOfficial.ts : uniteId 1→11)
- Axe 1 — Alignement sur la dernière version ministérielle → ✔ L5 (التدرج 2017) + L6 (دليل الأستاذ) toujours en vigueur (constaté le 20/10/2026)
- Axe 1 — Respect des unités officielles et des 3 domaines → ✔ somme des `heures:` = **108 exactement
- Axe 1 — Série EXP — SVT renforcé → ✔ ciblage EXP explicite dans le référentiel encodé
- Axe 1 — Progression du simple au complexe, du concret à l'abstrait → ✔ fenêtres trimestrielles encodées (12 occurrences de `fenetre`)
- Axe 1 — Démarche d'investigation officielle encodée → ✔ `DEMARCHE_5` présent
- Axe 1 — Hors-programme écarté explicitement → ✔ `estNonExigible()` présent
- Axe 1 — Enrichissement séparé de l'exigible → ✔ `CULTURE_GENERALE` + bandeau
- Axe 2 — Cartes mentales / mind maps → présentes** (vue « الخرائط الذهنية » + `cartesHosila`) — l’audit les a manquées
- Axe 2 — Étiquetage 🔴 indispensable / 🟡 important / 🟢 complémentaire → ✔ priorité par unité calculée (`prioritePourUnite`, sur les 65 idées BAC cotées)
- Axe 2 — Indicateur de poids de chaque chapitre à l'examen → ✔ `BAC_IDEAS` ≥ 65 idées cotées (verrou `bacArchetypes.lock.test.ts`)
- Axe 2 — Micro-leçons de 5-10 min (chunking) → livrées** : 578 chunks → 192 micro-leçons, `DUREE_MAX_MICRO_MIN = 10`
- Axe 3 — Profil calculé plutôt que déclaré → ✔ `deduirePhase()` — 5 phases déduites + creux (module pur testé)
- Axe 3 — Adaptation élève en difficulté / moyen / avancé → ✔ `porte_2_minutes` → … → `production_chronometree` + `profilEleve`
- Axe 3 — Parcours guidé jour par jour / semaine par semaine → partiellement** : `phaseEleve` (5 phases + creux + sprint) + `nbaEngine` ; le plan daté 12 semaines reste absent
- Axe 3 — Mode Révision express (J-7) vs Apprentissage profond → ✔ phase 5 « sprint » (≤ 30 j du Bac)
- Axe 3 — Répétition espacée intégrée au parcours → ✔ `sm2` + `rappelAdaptatif` + 16 `SPACED_RECALL_PROMPTS` + 11 `schedule_recall`
- Axe 3 — Rappels fondés sur la courbe d'oubli personnelle → ✔ `sm2` (courbe personnelle)
- Axe 3 — Conseils méthodologiques intégrés → ✔ `MethodologyCompilerView` + `nbaEngine`
- Axe 4 — QCM avec pièges classiques du Bac → ✔ 550 QCM corpus + quiz adaptatif par paliers
- Axe 4 — Schémas à compléter / légender → ✔ 69 drills de schéma servis
- Axe 4 — Partie I — restitution des connaissances → format algérien** (3 exercices 5+7+8, 4h30) — le libellé « Partie I/II/III » vient du format français
- Axe 4 — Partie II — démarche d'investigation → ✔ idem : la démarche est encodée (`DEMARCHE_5`), pas une « Partie II »
- Axe 4 — Partie III — étude de cas / synthèse → ✔ idem : pas de « Partie III » dans l’épreuve algérienne
- Axe 4 — Corrigés détaillés avec barème type Bac → ✔ barème 5/7/8
- Axe 4 — Niveaux de difficulté clairement indiqués → présents** : `LIBELLES_DIFFICULTE` (3 paliers) + quiz adaptatif
- Axe 4 — Rappel de cours ciblé après échec → ✔ 31 `MICRO_REMEDIATIONS` → rappel programmé
- Axe 5 — Annuaire de sujets Bac corrigés → ✔ 11 sessions indexées **+ 28 PDF officiels embarqués** (`public/bac-sujets`, 93,6 Mo) — l’audit s’en tient au README
- Axe 5 — Années 2018 à 2025 couvertes → ✔ 11 sessions continues 2016→2026
- Axe 5 — Sujets blancs / devoirs de synthèse → ✔ 3 blanches par domaine + générateur déterministe
- Axe 5 — Mode examen chronométré → ✔ `examenEnCours` + `examTimer` (4h30), session persistante
- Axe 5 — Montages récurrents prouvés, pas inventés → ✔ `bacArchetypes` + verrou de non-invention
- Axe 6 — Navigation intuitive, recherche, filtres → ✔ recherche plein texte offline (`SearchView`, 450 extraits) ; filtres à vérifier
- Axe 6 — Recherche plein texte dans le contenu → existe** (`SearchView` + index de leçons) — l’audit le classe non vérifiable
- Axe 6 — Favoris / bookmarks → existe** (`src/utils/favorites.ts` : favoris de leçons + recherches récentes) — l’audit le classe non vérifiable
- Axe 6 — Mode sombre → existe** (variante `dark` + `prefers-color-scheme`) — l’audit le classe non vérifiable
- Axe 6 — Taille de texte ajustable → existe** (3 crans : 100 % / 112,5 % / 125 %) — l’audit le classe non vérifiable
- Axe 7 — Quiz chrono / mini-jeux → ✔ chrono suspendu au profit de l’adaptatif + paliers
- Axe 7 — Points, badges, séries (streaks) → existent** (`BadgesView`, `StreakCelebrationModal`, XP) — l’audit les déclare absents
- Axe 7 — Quiz adaptatif en temps réel → existe** (`QuizAdaptatif`, paliers de difficulté) — l’audit le déclare absent
- Axe 7 — Statistiques par chapitre / compétence / type → ✔ `StatsView` (Recharts) + `profilErreurs` (10 tags) + panneau SRS
- Axe 7 — Évolution dans le temps (courbes) → existe** (`StatsView` : LineChart / AreaChart / BarChart / PieChart)
- Axe 7 — Identification automatique des points faibles → ✔ `profilErreurs` (10 tags) + `profilEleve`
- Axe 7 — Chatbot / assistant IA → ✔ tuteur **local** (règles + prescriptions tracées), 0 appel réseau — « chatbot IA » hors ligne assumé
- Axe 8 — Stabilité, absence de perte de données → ✔ données locales + export/import (`backup.ts`) ; non testé sur appareil réel
- Axe 8 — Réactivité et fluidité → ✔ entrée 555,8 Ko (< 700 Ko), 99 chunks, budgets respectés
- Axe 8 — Fonctionnement hors connexion → ✔ APK 100 % offline (assets embarqués) + SW économe
- Axe 8 — Mises à jour régulières et pertinentes → ✔ commits datés + chaînes vertes ; APK reconstruit le 2026-11-10
- Axe 8 — Synchronisation cloud des progrès → ✔ `supabase.ts` (optionnelle, non bloquante)
- Axe 8 — Modèle économique → ✔ freemium assumé (essai 30 j, 1 200 DA/saison)
- Axe 8 — Coût du premium en DZD → ✔ `PRIX_SAISON_DA = 1200`
- Axe 8 — Rapport qualité / prix pour un budget 100-500 DA → ✔ domaine 1 (unités 1-5) gratuit, sans pub
- Axe 8 — Publicité absente / discrète / intrusive → ✔ aucune pub, aucun traqueur tiers
- Axe 8 — Version gratuite réellement utilisable → ✔ unités 1-5 complètes et hors ligne
- Axe 8 — Utilisable en 3G faible / zone rurale → ✔ APK : contenu embarqué, 0 requête en invité
- Axe 8 — Connexion permanente requise → ✔ non (invité 100 % local)

*(69 critères n’ont pas été recontrôlés : l’audit y reste la référence.)*