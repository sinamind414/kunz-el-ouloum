# SPECKIT DE CORRECTION — KUNZ EL OULOUM (كنز العلوم)

**Date :** 2026-10-01
**Périmètre :** fiabilité · motivation · encadrement de l'élève (BAC SVT 3ᵉ AS — Algérie)
**Sources :** consolidation des deux rapports `strategic-svt-module-audit.zip` et `strategic-svt-module-audit (1).zip`, croisés avec les documents internes référencés (`docs/AUDIT_MORCHID_VERDICT_2026-09-25.md`, `docs/ANALYSE_AUDITS_OPUS_GEMINI_2026-09-25.md`, audit stratégique des modules, méta-audit des 6 rapports, AGENTS.md).
**Objectif :** une application 100 % fiable (aucune contre-vérité enseignée, aucune note fausse), motivante (aucun rejet de l'élève en détresse, aucune récompense creuse) et cadrante (le tuteur ne fait jamais le travail à la place de l'élève).

---

## 0. Analyse des deux rapports fournis

### 0.1 Ce que contiennent les deux archives

Les deux ZIP livrent le **même tableau de bord d'audit** (React/Vite) avec un socle commun :

| Onglet | Contenu |
|---|---|
| **Audit stratégique des modules** | 49 modules notés sur 6 critères (C1 alignement BAC · C2 efficacité pédagogique · C3 autonomie · C4 rentabilité temps/points · C5 non-redondance · C6 profondeur cognitive), 7 unités (U1→U5 + U0 transversal + HORS programme), 4 tiers, verdicts garder / optimiser / fusionner / supprimer |
| **Audit pédagogique de Morchid** | 3 piliers — Orientation **5/10**, Motivation **3/10**, Garde-fou **6/10** — score global **4,7/10** : « un excellent moteur anti-triche et un tuteur médiocre : il protège la note contre l'élève, mais ne protège pas l'élève contre sa propre passivité ». 10 règles correctrices **R1→R10** |
| **SpecKit S0→S4** | 22 tickets : sécurité & vérité, garde-fou Morchid, coach & orientation, contenu, mesure honnête |
| **SpecKit 2 — audit de vérité** | Constats B1→B8 / S1→S8 / S-M1 / S-C\* / S-Q1 vérifiés empiriquement (priorisation P0/P1/P2) + tâches T-00→T-04 |
| **Méta-audit des 6 rapports stratégiques** | Jeremy/Shinobi, Modules, Les Ignobles, Duolingo, Audit 26-09, Banlieue : que garder, que rejeter |

### 0.2 Ce qui les différencie

| | `strategic-svt-module-audit.zip` | `strategic-svt-module-audit (1).zip` |
|---|---|---|
| Module unique | `MorchidIntelligence` — 12 tickets SPEC-MORCHID-01→12 | `MorchidSpec` — 14 tickets SPEC-MORCHID-01→14 (**renumérotés**) |
| Conflit AGENTS.md règle 5 (darija interdite) | Non résolu | **Résolu** : darija admise en *détection*, فصحى obligatoire en *sortie* |
| System Prompt consolidé (8 sections, 10 interdits) | — | ✔ |
| Golden set de non-régression | — | ✔ GS-01→GS-16 |
| Métriques cibles avec baseline | — | ✔ 9 métriques |
| Lots d'implémentation avec gates | — | ✔ LOT 1→4 |

**Conclusion d'analyse :** l'archive `(1)` est la **version enrichie et postérieure** du même audit. Ses 4 apports nets — contrat du verbe de consigne, RAG/provenance, matching par mot entier, journalisation de l'échec — ainsi que la résolution du conflit darija/فصحى sont intégrés ci-dessous. Les recouvrements entre les deux archives (R1→R10 ↔ SPEC-MORCHID ↔ tickets S1/S2) ont été **fusionnés en un seul ticket** : aucune faille des deux rapports n'a été perdue, aucun doublon n'a été conservé.

### 0.3 Bilan du backlog consolidé

- **30 tickets** — 16 Critique · 11 Haute · 3 Moyenne
- Répartition : Épic 0 Fondations (5) · Épic 1 Garde-fou Morchid (13) · Épic 2 Coach & orientation (5) · Épic 3 Contenu fiable & resserré (6) · Épic 4 Mesure honnête (1)
- Cadre non négociable (AGENTS.md) : **P2/R6** — interdiction de fitter la note sur les notes prof (aucun modèle `a·cov+b`) ; seuls les chiffres du **barème officiel 5/7/8 pts** sont utilisables · arabe **فصحى** uniquement en production · le corpus des 40 `eleve_*.txt` a servi à calibrer, jamais à valider.

---

## 1. ÉPIC 0 — FONDATIONS & VÉRITÉ (avant toute chose)

> Aucune donnée d'élève exposée, aucune date fausse, aucun compteur mensonger, un produit installable.

### [KEO-001] : Purger les copies d'élèves de l'historique Git (RGPD)

**Type :** Backend / Sécurité & conformité
**Priorité :** Critique *(un signalement peut suspendre la fiche Play Store = blocage total pour tous les élèves)*
**Sources audit :** Les Ignobles + Jeremy (méta-audit) · SpecKit S0-01

**Constat (Le Problème) :** ~40 fichiers `eleve_*.txt` — des productions d'élèves **mineurs** (noms, établissements) — sont versionnés dans l'historique Git du dépôt, et aucun `.gitignore` ne les exclut. Risque légal et réputationnel majeur : la confiance des parents conditionne l'existence même du produit.

**User Story :** *En tant que parent d'un élève mineur, je veux qu'aucune copie d'élève ne quitte jamais son appareil afin de pouvoir confier l'application à mon enfant sans risque pour sa vie privée.*

**Critères d'Acceptation (Definition of Done) :**
- `git log --all --full-history -- '*copie*' '*eleve*'` ne retourne plus aucune production d'élève (après réécriture d'historique)
- Un commit test contenant `copie_eleve_test.txt` est **rejeté** par un hook pre-commit
- `docs/POLITIQUE_DONNEES.md` est rédigé et accessible depuis l'écran « À propos » de l'app
- Script CI `check-no-student-data.sh` vert : il échoue si un chemin interdit réapparaît dans l'historique ou l'index

**Piste de Solution / Recommandation Technique :** inventorier tous les chemins sensibles ; purger avec `git filter-repo` (ou BFG) sur **toutes** les branches et tags, après sauvegarde d'un clone miroir ; ajouter `uploads_externes/`, `*eleve*`, `*copie*` au `.gitignore` + hook pre-commit. ⚠️ La réécriture d'historique exige une validation destructive explicite de l'équipe (discipline Git AGENTS.md).

---

### [KEO-002] : Renseigner la date du BAC et interdire une date vide

**Type :** Backend / Logique métier
**Priorité :** Critique *(prérequis de KEO-204 : sans calendrier, aucun rétro-planning ni priorisation temporelle)*
**Sources audit :** Morchid R8 · S0-02 · « un guide sans calendrier n'est pas un guide »

**Constat (Le Problème) :** `BAC_EXAM_DATE = ''` dans `dashboardActions.ts` : le compteur « عدّاد BAC » est mort, `bacDaysLeft()` retourne `null`, et Morchid ne peut construire **aucun** cycle de révision ni priorité temporelle.

**User Story :** *En tant qu'élève, je veux voir un compte à rebours réel J-XXX afin que chaque séance de révision ait un sens calendaire.*

**Critères d'Acceptation (Definition of Done) :**
- Le dashboard affiche un « J-XXX » réel, jamais un compteur vide
- Date vide ou passée → message visible « date à confirmer » côté élève et erreur explicite en dev — **jamais** `null` silencieux
- La mission du jour et le plan de révision changent de contenu selon le cycle (J-120 construction / J-60 entraînement / J-20 annales chronométrées / J-7 fiches or uniquement)
- Test automatisé qui **échoue** si `BAC_EXAM_DATE` ne matche pas `/^\d{4}-\d{2}-\d{2}$/` + test du calcul J-X sur date figée

**Piste de Solution / Recommandation Technique :** renseigner la date officielle de la session au format ISO ; garde-fou dans `bacDaysLeft()` ; branchement dans `getDailyMission()` et `revisionPlan`.

---

### [KEO-003] : Remplacer le compteur de série cassé par la métrique honnête

**Type :** UI/UX + Logique métier
**Priorité :** Critique *(mensonge visible dès la première semaine d'usage → perte de confiance et démotivation)*
**Sources audit :** Duolingo + Morchid R10 · S0-03

**Constat (Le Problème) :** `progress.streak` et `dailyGoals.streakDays` ne sont **jamais incrémentés** (5× valeur par défaut, 0× incrémentation) : la flamme reste à 0/1 pour toujours et la modale de célébration ne se déclenchera jamais. C'est un mensonge d'interface.

**User Story :** *En tant qu'élève, je veux que la progression affichée reflète ce que j'ai réellement appris afin de rester motivé par du vrai, pas par du décoratif.*

**Critères d'Acceptation (Definition of Done) :**
- Aucun écran n'affiche de « jours consécutifs » ; `StreakCelebrationModal` et `playStreakMilestoneSound()` supprimés
- Le header affiche « X % du programme maîtrisé · +N mots-clés cette semaine » avec des valeurs qui **bougent réellement**
- Une réponse `again`/`hard` n'incrémente jamais le compteur de mots-clés (seuls `easy`/`good` l'incrémentent)
- `streakDays` n'existe plus dans le store (assertion de test)

**Piste de Solution / Recommandation Technique :** **ne pas réparer** le streak mais le **supprimer** (la flamme mesure la connexion, pas l'apprentissage) ; agréger les `unit.progress` des 11 unités + compteur `keywordsWeek` incrémenté dans `handleRateCard`. La seule célébration autorisée : « Tu as eu 12/20 parce qu'il manquait pyrénoïde — et maintenant tu l'as » (R10 : célébrer le gain, jamais la présence).

---

### [KEO-004] : Rendre le produit publiable — version, signature, confidentialité

**Type :** Backend / Release
**Priorité :** Haute *(ne bloque pas la progression en soi, mais bloque tout déploiement : « il n'y a rien à télécharger »)*
**Sources audit :** Les Ignobles + Jeremy · S0-04

**Constat (Le Problème) :** version `0.0.0`, zéro tag git, aucun build signé, aucun identifiant de bundle, aucune politique de confidentialité. Toute stratégie d'acquisition discute dans le vide.

**User Story :** *En tant qu'élève, je veux installer l'application depuis le Play Store afin de l'utiliser sur mon téléphone sans manipulation technique.*

**Critères d'Acceptation (Definition of Done) :**
- Un AAB signé **1.0.0** s'installe depuis la piste de test interne Play Store
- L'app fonctionne 100 % hors-ligne après le premier lancement (test en mode avion)
- La fiche « Sécurité des données » déclare « aucune donnée collectée » **sans mensonge vérifiable** (supabase vide, SW offline, stockage local)
- CI : build AAB + vérification `version != 0.0.0` + présence du tag

**Piste de Solution / Recommandation Technique :** passer en 1.0.0 + tag `v1.0.0`, figer le bundle id (ex. `dz.kunzeloulloum.svt`), keystore hors dépôt et secrets CI, `targetSdk` conforme à la politique Google en vigueur, politique de confidentialité hébergée, fiche en arabe d'abord, test sur 3 appareils Android réels (entrée/milieu de gamme).

---

### [KEO-005] : Étendre le cache offline aux 47 leçons — zéro écran vide en zone blanche

**Type :** Backend (service worker) + UI/UX
**Priorité :** Critique *(l'élève qui révise dans le bus tombe sur un écran vide une fois sur deux → désinstallation)*
**Sources audit :** S0-05 · angle mort Play Store (méta-audit)

**Constat (Le Problème) :** 22 leçons sur 47 sont en cache (+ les 20 actives), les schémas SVG ne sont pas tous pré-cachés. Le hors-ligne est une **exigence de marché** en Algérie (coût de la donnée, trajets, zones blanches), pas un confort.

**User Story :** *En tant qu'élève, je veux que toutes mes leçons soient disponibles hors-ligne afin de réviser dans le bus ou en zone blanche sans jamais tomber sur un écran vide.*

**Critères d'Acceptation (Definition of Done) :**
- Mode avion : **47/47** leçons + **20/20** actives + schémas s'ouvrent sans erreur
- Aucun écran blanc : tout contenu manquant affiche sa taille + un bouton de téléchargement
- Le premier lancement propose le pack offline complet en Wi-Fi (barre de progression honnête)
- Test e2e offline : parcours automatisé des 47 `lessonKey` en mode avion simulé, **0 échec toléré**

**Piste de Solution / Recommandation Technique :** pré-cache complet au premier lancement (téléchargement différé en Wi-Fi) ; indicateur « disponible hors-ligne ✓ » par leçon dans `LessonsView` ; intégrer les SVG au manifest de cache.

## 2. ÉPIC 1 — GARDE-FOU MORCHID : ANTI-PASSIVITÉ & ANTI-FAUX

> Le tuteur ne fait plus le travail à la place de l'élève, n'enseigne plus de contre-vérités et ne note plus en faux. L'ingénierie anti-triche existante (payload sans `correctIndex`, mélange déterministe, anti-bourrage, polarité des négations, anti-farm d'XP) est **conservée intégralement** — elle est de niveau professionnel.

### [KEO-101] : « لا أعرف » déclenche un escalier de 3 indices, jamais la correction

**Type :** Prompt Engineering + Logique métier (moteur de dialogue)
**Priorité :** Critique *(la porte de sortie qui rend tout le reste inutile : elle enseigne à cliquer, pas à raisonner)*
**Sources audit :** SPEC-MORCHID-02 (les 2 rapports) · R1 · S1-01 · GS-02/GS-03 · LOT 1

**Constat (Le Problème) :** un clic sur « لا أعرف » affiche **immédiatement** la correction modèle ET la totalité des points-clés (`giveUp → scenario.correction + keyPoints`), avec score 0. Zéro tentative exigée, zéro indice intermédiaire, zéro délai. Toute l'ingénierie anti-triche est contournée par ce seul bouton.

**User Story :** *En tant qu'élève bloqué, je veux que « je ne sais pas » me donne un indice progressif plutôt que la réponse afin d'apprendre à raisonner même quand je bloque.*

**Critères d'Acceptation (Definition of Done) :**
- 1ᵉʳ clic « لا أعرف » (après le délai de KEO-102) → **indice I1** (le verbe de consigne et ce qu'il autorise) ; zéro occurrence de « التصحيح النموذجي » dans la réponse
- La correction n'est visible **que si** `hintLevel = 3` (score plafonné à **3/10**) **OU** ≥ 2 tentatives écrites de ≥ 15 caractères utiles (score plein via `gradeKeyPoints`)
- Une saisie de moins de 15 caractères utiles (ex. « ok ») **ne compte pas** comme tentative
- Test horloge mockée : demande de correction à t+20 s sans tentative → refus poli + chrono affiché ; à t+95 s → indice (pas un refus sec)
- Chaque indice consommé est journalisé (`hintLevel`, `scenarioId`) pour alimenter le bilan KEO-104

**Piste de Solution / Recommandation Technique :** ajouter `boss.hintLevel`, `boss.attempts`, `boss.openedAt` à `BotSession` ; `giveUp` → `nextHint(scenario, hintLevel)` tant que `hintLevel < 3`. Escalier strict : **I1** = le verbe de consigne (« الفعل هنا « فسّر » — يسمح بـ « لأنّ » ») · **I2** = un squelette de phrase à trous, jamais deux (« انطلاقًا من الوثيقة (…) نلاحظ أنّ ……… ») · **I3** = le premier point-clé à moitié masqué (le terme discriminateur, pas la phrase entière).

---

### [KEO-102] : La règle d'or des 20-25 minutes devient une contrainte du moteur (chrono 90 s)

**Type :** Logique métier
**Priorité :** Critique *(un tuteur qui viole sa propre consigne perd toute autorité pédagogique)*
**Sources audit :** R3 · S1-02 · SPEC-MORCHID-02 (partie délai)

**Constat (Le Problème) :** l'application **imprime** la règle « لا تفتح الحل النموذجي قبل محاولة كتابية حقيقية لمدة 20 إلى 25 دقيقة » (studyGuide.ts)… mais `handleBossInput` affiche la correction à la première saisie, quelle qu'elle soit. Le moteur contredit le texte qu'il affiche lui-même deux écrans plus loin.

**User Story :** *En tant qu'élève, je veux que les règles affichées par l'application soient celles que le moteur applique réellement afin de pouvoir faire confiance au cadre.*

**Critères d'Acceptation (Definition of Done) :**
- `startBossStep()` horodate `openedAt` ; la correction est **refusée** si `Date.now() - openedAt < 90_000` et `attempts === 0`
- Le refus est poli et affiche le temps restant (« خصّص 90 ثانية لكتابة جملة واحدة »)
- Aucune contradiction restante entre le texte de la règle d'or affiché et le comportement réel du moteur
- Test : correction demandée avant 90 s sans tentative → refus ; après une tentative réelle → autorisée

**Piste de Solution / Recommandation Technique :** version moteur de la règle 20-25 min : un **chronomètre minimal de 90 s par situation** du défi BAC ; brancher le test sur une horloge mockée (vitest fake timers).

---

### [KEO-103] : Mode socratique — une question de sondage (probe) avant tout contenu

**Type :** Prompt Engineering + modèle de données des fiches
**Priorité :** Critique *(~80 % des réponses du moteur sont prémâchées : illusion de compréhension)*
**Sources audit :** SPEC-MORCHID-01 (les 2 rapports) · R2 · S1-03 · GS-01 · LOT 2

**Constat (Le Problème) :** le chemin le plus fréquent du moteur livre `shortAnswer` complet + mots-clés dès la première question (`🧩 **titre** … 🔑 كلمات مفتاحية`), sans aucune vérification de ce que l'élève sait déjà. L'élève lit, croit avoir compris, et ne produit rien — exactement ce que le BAC ne note pas.

**User Story :** *En tant qu'élève, je veux que Morchid me pose d'abord une courte question de vérification avant de m'expliquer afin de comprendre activement plutôt que de lire passivement.*

**Critères d'Acceptation (Definition of Done) :**
- 1ᵉʳ appel sur une fiche → réponse = **probe uniquement** (question fermée ≤ 20 mots, réponse attendue ≤ 5 mots, portant sur le **préréquis** : lieu, acteur, ou sens d'une flèche — jamais sur la conclusion) ; 0 ligne de `shortAnswer`
- Après tentative de l'élève : correction en 1 ligne (juste / incomplète / erronée) puis contenu **ciblé sur l'écart** — pas le cours entier si la probe est juste
- Après 2ᵉ « اشرح لي » explicite : contenu complet livré + événement `bypass_socratique` **journalisé** (trappe anti-frustration)
- Golden set : ≥ 19/20 questions de cours commencent par une question (tolérance 1 pour fiches sans probe rédigée)
- Métrique instrumentée : taux de réponses prémâchées **< 5 %** sur 500 échanges

**Piste de Solution / Recommandation Technique :** ajouter un champ `probe: string` à `KnowledgeCard` (~60 probes à rédiger en فصحى, 1 phrase chacun) ; `processStudentInput()` renvoie la probe au 1ᵉʳ appel (clé de session `askedProbe`), le contenu au 2ᵉ. Directive System Prompt : « Tu n'es pas une encyclopédie. Tu es un examinateur bienveillant du BAC SVT. »

---

### [KEO-104] : Aucune note sans CAUSE, ACTION et PORTE — jamais un adjectif seul

**Type :** Prompt Engineering + Logique métier (notation)
**Priorité :** Critique *(une sanction déguisée qui ne produit aucun apprentissage)*
**Sources audit :** SPEC-MORCHID-13 / A-06 · R4 · S1-04 · GS-08 · LOT 3

**Constat (Le Problème) :** toute la dimension « bilan » tient en `appreciation = pct >= 80 ? 'ممتاز 🏆' : pct >= 50 ? 'جيد 👍' : 'يحتاج مراجعة 📖'`. Un élève à 12 % et un élève à 49 % reçoivent le **même** verdict — sans cause, sans remède, sans lendemain.

**User Story :** *En tant qu'élève, je veux que chaque note soit accompagnée de la cause exacte de mes pertes, d'une action de moins de 15 minutes et d'un lien vers la leçon afin de savoir précisément quoi corriger.*

**Critères d'Acceptation (Definition of Done) :**
- Tout bilan expose la structure **{CAUSE, ACTION, PORTE}** — assertion de build : un bilan sans les 3 blocs fait échouer la suite
- CAUSE nomme l'étape ou point-clé manquant **avec sa fréquence** (« في 3 وضعيات من 3، كتبتَ الملاحظة ولم تكتب الاستنتاج ») ; tout adjectif évaluatif isolé (ممتاز/جيد/يحتاج مراجعة) est interdit
- ACTION = une tâche **unique**, ≤ 15 minutes, **mesurable** (« راجع الدرس » interdit ; « أعد كتابة الوضعية 2 وأضف سطراً يبدأ بـ « ومنه نستنتج أنّ… » » attendu)
- PORTE = lien profond `lessonKey` résolu dans `LESSON_INDEX` (0 lien mort, 0 lien inventé ; si indéfini, le dire explicitement)
- Golden set : 10 bilans → **0 adjectif isolé**

**Piste de Solution / Recommandation Technique :** `gradeKeyPoints()` retourne `missedKeyPoints[]` ; composer le bilan avec `LESSON_INDEX.lessonKey` du topic fautif ; template 3 blocs verrouillé dans le System Prompt consolidé (DIRECTIVE 13).

---

### [KEO-105] : Triade scientifique imposée — ألاحظ → أستنتج → أخلص, séquentiellement

**Type :** Prompt Engineering (structure de sortie)
**Priorité :** Critique *(l'élève entraîné par Morchid produit des copies structurellement incomplètes : baseline triade = 0 %)*
**Sources audit :** SPEC-MORCHID-03 (les 2 rapports) · GS-04 · LOT 2

**Constat (Le Problème) :** Morchid livre des conclusions brutes (« إذن المناعة النوعية هي… ») sans faire parcourir la chaîne de raisonnement. Au BAC, une conclusion non précédée de la saisie des données et de l'interprétation ne rapporte pas les points de la compétence C3. La méthode existe dans `studyGuide.ts` (« اكتب دائماً: تمثل الوثيقة، نلاحظ، نستنتج ») mais n'est **jamais imposée** par le moteur.

**User Story :** *En tant qu'élève, je veux être guidé étape par étape (observation → interprétation → conclusion) afin de rédiger des réponses conformes à ce que le correcteur paie.*

**Critères d'Acceptation (Definition of Done) :**
- L'élève doit produire le **bloc 1** avant que Morchid ne fournisse le bloc 2, etc. — Morchid ne rédige **jamais les 3 blocs dans un même message**
- Bloc 1 « ألاحظ » : valeurs/variations/comparaisons uniquement — **interdit** : « لأنّ », toute interprétation ; Bloc 2 « أستنتج » : **obligatoire** un connecteur causal (لأنّ / بسبب / يعود ذلك إلى / نتيجة لـ) ; Bloc 3 « أخلص إلى أنّ » : une phrase qui ne répète ni le chiffre ni la cause
- Si l'élève saute un bloc : Morchid **nomme le bloc manquant** et le redemande (« عد إلى المعطى. ما الرقم الذي رأيته ؟ »), sans corriger le fond
- Golden set : 15 analyses de documents → 100 % de séquençage respecté ; métrique : taux de triade complète **≥ 90 %**

**Piste de Solution / Recommandation Technique :** machine d'états dans `processStudentInput` (variable `{{bloc_attendu}}`) ; directive 03 du System Prompt consolidé ; test de dialogue : ≥ 3 tours avant toute conclusion livrée par le tuteur.

---

### [KEO-106] : Contrat du verbe de consigne — détecter, afficher, imposer

**Type :** Prompt Engineering + Backend (branchement)
**Priorité :** Critique *(c'est précisément ce que le barème paie : la forme de la réponse)*
**Sources audit :** SPEC-MORCHID-06 (**apport du rapport (1)**) · GS-05 · LOT 2

**Constat (Le Problème) :** l'application sait déjà distinguer تحليل de تفسير (regex de causalité dans `answerStructureCheck.ts` : يعود ذلك / لأن / بسبب / نتيجة لـ) et dispose du مفتاح de la Boussole v2 — mais cette logique n'est **pas branchée** sur Morchid : le tuteur ne vérifie jamais si la réponse respecte le contrat du verbe demandé.

**User Story :** *En tant qu'élève, je veux connaître le contrat du verbe de consigne (ce qu'il paie, ce qu'il interdit) avant d'écrire afin de ne plus perdre des points sur la forme de ma réponse.*

**Critères d'Acceptation (Definition of Done) :**
- Les 7 verbes de la table ont un contrat testé (paie / interdit) — **14 assertions vertes** : استخراج/استنتاج من الوثيقة → donnée brute, interprétation interdite · حلّل → décrire + comparer + variations **chiffrées**, « لأنّ » **interdit** · فسّر → lien causal **obligatoire** · استنتج → relation ou mécanisme en une phrase, redescription interdite · علّل/برّر → justification par le cours · قارن → 2 termes + points de comparaison + **différence explicite** · اقترح فرضية → hypothèse **réfutable** + test possible
- Le contrat s'affiche en 2 lignes **avant** que l'élève écrive
- Réponse contenant « لأنّ » sur consigne « حلّل » → écart nommé (« أنت لم تحلّل، بل فسّرت »), **pas de note**, demande de réécriture
- Taux de détection du verbe ≥ 95 % sur un golden set de 40 consignes
- Le مفتاح de la Boussole v2 est **réutilisé, pas dupliqué** (une seule source de vérité)

**Piste de Solution / Recommandation Technique :** extraire le verbe de `{{consigne_eleve}}` **avant** toute évaluation ; brancher la regex `CAUSALITE` existante sur `smartTutorEngine.ts` ; formule de renvoi : « الفعل المطلوب هو «حلّل»، وقد أجبت بالتفسير. أعد الكتابة بالأرقام فقط، دون استعمال «لأنّ». »

---

### [KEO-107] : Polarité — une réponse qui nie les points-clés vaut 0, pas 10

**Type :** Backend / Logique métier (moteur de notation)
**Priorité :** Critique *(faille de notation la plus grave : elle apprend que nier la vérité scientifique est une stratégie payante)*
**Sources audit :** SPEC-MORCHID-04 / A-12 · verdict §B2 « VRAI — confirmé par script » (état : correctif présent, **non protégé**) · GS-06 · LOT 1

**Constat (Le Problème) :** une réponse niant explicitement chaque point-clé (« لا، ليس صحيحاً أنّ CMH/HLA يعرض المستضدات… ») obtient **10/10** : la couverture est calculée par recouvrement de tokens sans traitement de la négation. « La barrière “il suffit de recopier les mots-clés en les niant” est complètement perméable. »

**User Story :** *En tant que système, je veux créditer un point-clé seulement s'il est affirmé (et non nié) dans une clause non réfutée afin de ne jamais récompenser une réponse qui contredit la science.*

**Critères d'Acceptation (Definition of Done) :**
- Réponse niant les 3 points-clés → **0/10** (script `scripts/verify_b2_negation.ts` vert)
- Réponse reprenant exactement les points-clés → **10/10** (non régressé)
- Moitié niée / moitié reprise → **5/10** exactement
- Attendu formulé négativement (« لا تنتقل ») + réponse identique → point-clé **crédité** (pas de double inversion)
- Le détecteur de bourrage lexical annule toujours le score ; les 8 tags du correcteur et le scoreur restent **inchangés** (spec Boussole v2) ; aucun fit de note (P2/R6 — barème officiel 5/7/8 uniquement)

**Piste de Solution / Recommandation Technique :** découper la réponse en clauses (، ؛ . ثم لكن) ; détecter les négations adjacentes (لا / لم / لن / ليس / غير à ±1 séparateur du token) et les amorces de réfutation (ليس صحيحاً / مستحيل / أنفي / أرفض) ; un point-clé est couvert **ssi** clause non réfutée **ET** polarité identique à l'attendu. Feedback obligatoire en cas d'inversion : « إجابتك تذكر النقطة لكنّها تنفيها — أعد صياغتها في صيغة الإثبات. »

---

### [KEO-108] : « اختبرني » lance un test — jamais une fiche de cours

**Type :** Logique métier (couche d'intentions)
**Priorité :** Critique *(l'auto-évaluation de l'élève est faussée au moment précis où il devrait révéler ses lacunes)*
**Sources audit :** SPEC-MORCHID-08 / A-08 · verdict §B7 « VRAI — confirmé empiriquement » · GS-11 · LOT 4

**Constat (Le Problème) :** « اختبرني في الغوص » (teste-moi sur la subduction) renvoie la **fiche de cours** sur la subduction. Le bouton promet une évaluation et déclenche une lecture : aucune couche d'intention n'intercepte la demande.

**User Story :** *En tant qu'élève, je veux que « teste-moi » lance un vrai test afin de mesurer honnêtement mon niveau avant l'examen.*

**Critères d'Acceptation (Definition of Done) :**
- 8 formulations de « اختبرني في … » → QCM lancé dans **100 %** des cas où le sujet est testable (mélange déterministe et absence de `correctIndex` dans le payload **conservés**)
- Sujet sans QCM disponible → message d'indisponibilité **explicite** + proposition d'un sujet testable du même domaine — **jamais** une fiche de cours en substitution silencieuse
- L'intercepteur d'intentions s'exécute **après** la gestion de session active et **avant** la recherche sémantique
- Ordre de résolution strict respecté : session active → SOUTIEN (KEO-201) → INTENTIONS (ÉVALUER / EXPLIQUER / MÉTHODE / NAVIGUER) → gibberish/hors-programme → recherche sémantique

**Piste de Solution / Recommandation Technique :** couche d'intentions en tête de `processStudentInput()` ; résoudre le sujet visé par `findBestKnowledgeCardScored`, chercher un QCM dont le `topicId` correspond ; formule d'indisponibilité : « لا يوجد اختبار جاهز في «الغوص» بعد. أستطيع اختبارك الآن في «الزلازل وموجاتها» من المجال نفسه — أيّهما تختار؟ »

---

### [KEO-109] : Active Recall — aucun contenu livré sans ancrage final

**Type :** Prompt Engineering + Backend (SM-2)
**Priorité :** Critique *(l'effet de test est totalement absent du tuteur alors que le contrôleur SM-2 existe déjà)*
**Sources audit :** SPEC-MORCHID-07 / A-05 · GS-10 · LOT 3

**Constat (Le Problème) :** aucune explication de Morchid ne se termine par une production de l'élève. L'effet de test — le levier de rétention le plus documenté — est absent, alors que `RevisionView.tsx` contient déjà un contrôleur SM-2 (Again / Hard / Good / Easy) que le moteur n'interroge **jamais**. L'élève reconnaît, il ne récupère pas.

**User Story :** *En tant qu'élève, je veux clore chaque explication par un mini-test (reformulation, Vrai/Faux justifié, QCM express) afin que ce que j'ai lu soit réellement mémorisé.*

**Critères d'Acceptation (Definition of Done) :**
- **100 %** des réponses contenant du contenu se terminent par **exactement un** item d'ancrage (jamais deux, jamais zéro)
- Type d'ancrage adapté à la notion : définitionnelle → Vrai/Faux **à justifier** ; processuelle → reformulation libre avec mots imposés ; comparative → QCM 4 options (distracteurs issus des erreurs réelles de l'élève si disponibles)
- Le contenu suivant est **bloqué** tant que l'ancrage n'est pas validé
- Échec d'ancrage → question-indice (KEO-110), **jamais** une rediffusion du contenu
- Rappels programmés **J+1 / J+3 / J+7** via le contrôleur SM-2 existant (interrogé, pas dupliqué) ; métrique : taux de rappel J+1 honoré ≥ 60 %

**Piste de Solution / Recommandation Technique :** hook de fin d'explication dans le moteur + branchement sur le SM-2 de `RevisionView` ; directive 07 du System Prompt (« سأعيد سؤالك هذا غداً، ثم بعد 3 أيام، ثم بعد أسبوع »).

---

### [KEO-110] : Typer l'erreur avant de corriger — T1→T4

**Type :** Logique métier (diagnostic)
**Priorité :** Haute *(remédiation aveugle : l'élève retravaille ce qu'il sait déjà)*
**Sources audit :** SPEC-MORCHID-05 / A-04 · LOT 3

**Constat (Le Problème) :** toute erreur reçoit le même traitement (un score + un adjectif). Or une erreur de **restitution de cours** et une erreur d'**analyse de document/graphe** ne se soignent ni par la même leçon, ni par le même exercice.

**User Story :** *En tant qu'élève, je veux que Morchid identifie le TYPE de mon erreur avant de me corriger afin de retravailler ce qui me manque vraiment, pas ce que je sais déjà.*

**Critères d'Acceptation (Definition of Done) :**
- 4 types avec signal de détection testé et remède **distinct** : **T1** restitution absente (mot-clé absent) → fiche ciblée + ancrage · **T2** restitution erronée (mot-clé présent, valeur/lieu/rôle faux) → confrontation au manuel (`bookContent.json`), pas un rappel · **T3** saisie de données défaillante (aucun chiffre/variation/comparaison) → retour au document, lecture seule (bloc 1 de la triade) · **T4** rupture de la chaîne déductive (données + conclusion, aucun lien causal) → exercice de complétion de connecteurs
- **Jamais** de correction avant d'avoir nommé le type à l'élève, avec la preuve de classification (« لم تذكر أيّ رقم في إجابتك، مع أنّ السؤال وثيقةٌ رقمية »)
- **Jamais** plus d'un type par réponse (le plus défavorable est retenu)
- Accord avec le jugement du professeur ≥ 80 % sur 20 productions
- Le type est journalisé et alimente la priorisation (KEO-202) ; le corpus des 40 `eleve_*.txt` sert à calibrer, **jamais** à valider (P2/R6)

**Piste de Solution / Recommandation Technique :** classification dans `gradeKeyPoints` (signaux : absence de token / token + valeur fausse / absence de chiffres / absence de connecteur) ; une question-indice par type (« ما القيمة في الدقيقة 0 وما القيمة في الدقيقة 10؟ » pour T3).

---

### [KEO-111] : RAG — provenance obligatoire + purge des 7 erreurs scientifiques confirmées

**Type :** Backend / RAG + Contenu
**Priorité :** Critique *(l'élève est puni pour avoir appris la version de l'application)*
**Sources audit :** SPEC-MORCHID-10 (**apport du rapport (1)**) · verdicts §S1 S2 S3 S4 S-M1 S6 S7 S8 « VRAI — confirmés » · GS-14 · LOT 1

**Constat (Le Problème) :** **7 erreurs scientifiques confirmées**, dont une contradiction interne majeure : le corrigé de l'app décrivait la courbe de Michaelis-Menten comme « en cloche » (جرسي الشكل) alors que **son propre correcteur** sanctionne ce faux ami chez l'élève avec gravité forte. S'y ajoutent : ondes S « traversent » le noyau (c'est l'inverse : la zone d'ombre des S est la preuve de liquidité) · zone d'ombre des ondes P niée dans une situation BAC · « la vitesse augmente avec la densité » généralisé · AUG → « منيل » au lieu de « ميثيونين » · oxymore « انفراج (تقارب متباعد) » · « فيغوص الصهر » · « الوشام » au lieu de « الوشاح ».

**User Story :** *En tant qu'élève, je veux que toute affirmation scientifique de Morchid soit conforme au manuel officiel et traçable (fichier + clé + unité × page) afin d'apprendre exactement ce que le correcteur attend — et rien d'autre.*

**Critères d'Acceptation (Definition of Done) :**
- `grep 'منيل'` sur le parcours élève = **0** occurrence ; « ميثيونين » présent sur chaque surface concernée
- Test de régression **permanent** : aucune occurrence de « جرسي الشكل » associée à Michaelis-Menten ; `correcteurIntegration.test.ts:117` reste vert
- Aucune surface n'affirme que les ondes S traversent le noyau ; la preuve de liquidité est énoncée avec le vocabulaire du manuel
- « الوشام » = 0 · « تقارب متباعد » = 0 · « فيغوص الصهر » = 0 · la situation BAC admet la zone d'ombre des ondes P
- 100 % des chunks de connaissance exposent un champ `source` vérifié (scan de provenance) ; une assertion sans provenance est **non émise** (message : « لا أملك هذه المعلومة في قاعدتي المحلّية الموثّقة »)
- `bookContent.json` non modifié (lecture seule) ; corrections par **injection mécanique** (transcription manuelle proscrite), consignées avant→après + unité × page dans les commits

**Piste de Solution / Recommandation Technique :** hiérarchie de vérité `data/bookContent.json` → `الكتاب المصحح` → bibliothèque ; scan par script (l'arabe s'écrit via outil de fichier, jamais en console) ; injection mécanique depuis `bookContent.json` ; filtre de confusion graphique **ر/ز · ح/ة · ف/ب** appliqué à toute injection ; test de cohérence croisée : le corrigé (`bacExam.ts`) et le dictionnaire du correcteur (`baremeCorrecteur.ts`) emploient la **même formulation**.

---

### [KEO-112] : Retrieval par mot entier — jamais par sous-chaîne arabe

**Type :** Backend (moteur de matching)
**Priorité :** Haute *(tout mot contenant « لب » détourne l'élève vers la tectonique)*
**Sources audit :** SPEC-MORCHID-11 (**apport du rapport (1)**) · verdict §B3 « VRAI — correctif présent, non protégé » · GS-12 · LOT 4

**Constat (Le Problème) :** « الباك » renvoie la fiche sur la structure interne de la Terre : la carte `earth_structure` porte le mot-clé « لب » et le matching se fait par inclusion de sous-chaîne (`norm.includes(nk)`) — « الباك » contient « لب ». « البكالوريا », « اللباب »… détournent de la même façon.

**User Story :** *En tant qu'élève, je veux que ma question soit comprise au mot près afin de ne jamais recevoir un cours sans rapport avec ma demande.*

**Critères d'Acceptation (Definition of Done) :**
- 10 mots contenant « لب » en sous-chaîne (الباك، البكالوريا، اللباب…) → **0 détournement** vers بنية الكرة الأرضية
- « الباك » seul → demande de clarification à 3 options (بكالوريا / البروتينات / شيء آخر), pas une fiche
- « الغوص؟ » reconnu comme « الغوص » (ponctuation arabe ؟ ، ؛ exclue des caractères de mot)
- Le mot-clé « لب » reste fonctionnel quand il est demandé **comme mot entier** ; le demi-poids flou (1 faute de frappe mono-mot) est conservé

**Piste de Solution / Recommandation Technique :** `includesAsWord(haystack, needle)` : si le needle contient un espace → `includes` simple ; sinon extension gauche/droite aux caractères de mot `[ء-غ ف-ي ٠-٩ A-Za-z0-9]`, retrait d'un éventuel article « ال » initial, et comparaison du **mot englobant** au needle.

---

### [KEO-113] : Journaliser l'échec — un élève à 0 ne doit pas devenir invisible

**Type :** Backend (télémétrie locale)
**Priorité :** Moyenne
**Sources audit :** SPEC-MORCHID-14 (**apport du rapport (1)**) · verdict §B6 « 0-XP non journalisé : VRAI » · LOT 4

**Constat (Le Problème) :** l'événement de fin d'activité n'est émis que si `xpGained > 0` (`AITutorView.tsx`) : un quiz terminé à 0 bonne réponse n'est **jamais** remonté au tableau de bord enseignant. L'élève qui échoue le plus est exactement celui qui disparaît du suivi — son professeur le croit absent plutôt qu'en difficulté.

**User Story :** *En tant que système (tableau de bord enseignant), je veux que toute tentative terminée soit journalisée, y compris à 0, afin de distinguer « absent », « en échec réel » et « abandon ».*

**Critères d'Acceptation (Definition of Done) :**
- Quiz 0/23 → événement émis `{ total: 23, score: 0, kind, domain, statut: 'echec_reel' }`
- 5 « لا أعرف » sur 5 → `statut = 'abandon'`, avec une remédiation différente (réduction de charge, KEO-201)
- Condition d'émission : `total_questions > 0`, quelle que soit la note — jamais `xpGained > 0`
- Le tableau de bord distingue visuellement **absent / echec_reel / abandon** ; jamais « aucune activité » pour un élève qui a échoué
- Un échec réel déclenche la remédiation typée (KEO-110 + KEO-202)

**Piste de Solution / Recommandation Technique :** supprimer la condition `xpGained > 0` dans l'appel `onXPGained` / ajouter un canal d'événement dédié ; payload avec `statut ∈ { reussi, echec_reel, abandon }` ; brancher la remédiation automatique.

## 3. ÉPIC 2 — COACH & ORIENTATION

> La détresse n'est plus rejetée, les erreurs sont classées par valeur BAC, le guide se propose seul, une seule voix.

### [KEO-201] : La détresse n'est jamais hors programme — détection darija, réponse فصحى

**Type :** Prompt Engineering
**Priorité :** Critique *(« la faute la plus grave de tout le dispositif » — pilier Motivation : 3/10)*
**Sources audit :** SPEC-MORCHID-09 / A-07 · R5 · S2-01 · GS-13/GS-16 · LOT 1

**Constat (Le Problème) :** un élève qui écrit son angoisse en darija (« راني خايف من الباك، ما نقدرش نراجع ») est classé **hors programme** et reçoit « ❓ هذا السؤال خارج قاعدة علوم الطبيعة والحياة ». Le moment où il avait le plus besoin d'un humain est exactement celui où Morchid le rejette. Cause : `hasDomainSignal` + `AR_STOPWORDS` ne contiennent aucun lexique affectif ni darija — le filtre anti-bruit (football, cinéma) rejette aussi l'angoisse du candidat.

**User Story :** *En tant qu'élève en détresse avant le BAC, je veux que Morchid m'écoute et allège ma charge afin de ne pas être rejeté par mon tuteur au pire moment.*

**Critères d'Acceptation (Definition of Done) :**
- 15 formulations de détresse (فصحى : خائف، تعبت، قلق، يائس، فاشل، ضائع + darija : راني، ما نقدرش، حبست، كرهت، ماعلاباليش، صعيب عليّا) → **100 %** déclenchent la réponse de soutien
- 10 hors-sujets réels (كرة القدم، فيلم، أغنية…) → **toujours** `outOfScopeResult` (le filtre anti-bruit n'est pas affaibli)
- Réponse en 3 temps, ≤ 6 lignes : **écoute** (1 ligne, sans conseil) → **réduction de charge** (un seul sujet, 10 minutes) → **action unique** fondée sur la dernière erreur réelle — 0 note, 0 liste de domaines, 1 seule action
- Toute **sortie** reste en فصحى (AGENTS.md règle 5) — la darija est admise en **détection uniquement** (résolution du conflit des deux rapports)
- Relecture humaine par un professeur algérien : ton bref, direct, jamais infantilisant

**Piste de Solution / Recommandation Technique :** `AFFECT_LEXICON` testé **avant** `isGibberishInput()` et avant le test OUT_OF_PROGRAM dans `processStudentInput()` → `supportResult(session, lastMistake)` ; interdictions absolues dans cette réponse : citation, proverbe, discours motivationnel générique, dialecte.

---

### [KEO-202] : Priorisation réelle — fréquence × poids BAC × oubli, pas l'index zéro

**Type :** Backend / Logique métier
**Priorité :** Haute *(« ce n'est pas un choix pédagogique, c'est un index zéro »)*
**Sources audit :** SPEC-MORCHID-12 / A-09 · R6 · S2-02 · GS-09 · LOT 3

**Constat (Le Problème) :** la mission du jour cible `mistakes[0]` — la **première erreur chronologique** — sinon `KNOWLEDGE_CARDS[0]`. Un élève fautif 9 fois en immunologie et 1 fois en tectonique peut être renvoyé vers la tectonique. Le barème officiel est pourtant connu : ex1 = 5 pts · ex2 = 7 pts · ex3 = 8 pts.

**User Story :** *En tant qu'élève, je veux que la mission du jour cible mon erreur la plus coûteuse au BAC afin que chaque minute de révision rapporte un maximum de points.*

**Critères d'Acceptation (Definition of Done) :**
- `score(erreur) = occurrences × poids_bac(unité) × facteur_oubli` avec `facteur_oubli = 1 + log2(1 + jours_depuis_dernière_revue)` ; mission = `argmax(score)` ; à égalité, l'erreur la plus ancienne
- Test : 9 erreurs en immunologie vs 1 en tectonique → mission = **immunologie**
- Test : une erreur non revue depuis 30 jours **remonte** dans le classement (oubli actif)
- Le **POURQUOI** s'affiche en 1 ligne (« أخطأتَ فيه 4 مرّات، ووزنه 8 نقاط في البكالوريا، ولم تراجعه منذ 12 يوماً »)
- Poids issus de `data/bac_sessions_2019_2026.json` (barème officiel 5/7/8 — **aucune autre pondération**, P2/R6) ; le SM-2 de `RevisionView` est **interrogé, pas dupliqué**

**Piste de Solution / Recommandation Technique :** `rankMistakes(session.mistakes, UNIT_BAC_WEIGHT, lastSeenAt)` remplace `mistakes[0]` dans `getDailyMission()` ; affichage systématique de la justification.

---

### [KEO-203] : Après un échec (< 50 %), le protocole d'étude s'invite — il n'attend pas

**Type :** Logique métier
**Priorité :** Haute *(le guide est invisible à ceux qui en ont le plus besoin)*
**Sources audit :** R7 · S2-03 · SPEC-MORCHID A-10

**Constat (Le Problème) :** le plan de travail n'apparaît que si l'élève tape « كيف ادرس العلوم » (score de déclencheur ≥ 18) : un élève perdu ne sait pas formuler cette question. Après un 4/30 au défi BAC, Morchid propose « راجع أخطائي السابقة » — jamais « voici comment on révise cette unité ».

**User Story :** *En tant qu'élève en difficulté, je veux que Morchid me propose spontanément la méthode de révision de l'unité où j'ai échoué afin d'être guidé sans devoir savoir quoi demander.*

**Critères d'Acceptation (Definition of Done) :**
- Après tout score < 50 %, le protocole d'étude en 5 étapes de l'unité concernée est **poussé automatiquement** (1ʳᵉ position des quickActions)
- Le protocole (comprendre la logique de l'unité → extraire les mots-clés → schéma bilan → exercices gradués → carnet d'erreurs) reste accessible **sans** déclencheur lexical
- Test : fin de défi à 40 % → le protocole est proposé sans aucune action de l'élève
- Le guide proposé correspond bien à l'**unité fautive** (pas au dernier menu visité)

**Piste de Solution / Recommandation Technique :** fin de `handleBossInput()` : si `pct < 50`, injecter `formatStudyGuideAnswer(STUDY_GUIDE_CARDS.unit_study_protocol)` dans les quickActions.

---

### [KEO-204] : Cycle de révision daté — J-120 / J-60 / J-20 / J-7

**Type :** Backend + UI/UX
**Priorité :** Haute *(dépend de KEO-002)*
**Sources audit :** R8 · S2-04

**Constat (Le Problème) :** sans date du BAC, aucun rétro-planning n'est possible : « un guide sans calendrier n'est pas un guide ». Morchid ne peut ajuster ni la nature du travail ni son intensité au temps restant.

**User Story :** *En tant qu'élève, je veux un plan de révision qui s'adapte au temps restant afin de réviser efficacement et sans panique dans les derniers mois.*

**Critères d'Acceptation (Definition of Done) :**
- J-120 → cycle **construction** · J-60 → **entraînement** · J-20 → **annales chronométrées** · J-7 → **fiches or uniquement** : le contenu du plan change par cycle
- `bacDaysLeft()` est injecté dans la mission du jour (affichage J-XXX)
- Si la date est « à confirmer », le plan se dégrade proprement (cycle par défaut explicitement signalé)
- Test sur dates figées : les 4 cycles produisent 4 contenus distincts

**Piste de Solution / Recommandation Technique :** machine à cycles dans `revisionPlan` branchée sur `bacDaysLeft()` ; indicateur « phase actuelle » sur le dashboard.

---

### [KEO-205] : Une seule voix — féliciter le gain, jamais la présence

**Type :** UI/UX + Prompt Engineering
**Priorité :** Haute *(deux personas se contredisent dans la même application)*
**Sources audit :** R9 + R10 · S2-05 · SPEC-MORCHID A-11

**Constat (Le Problème) :** `AITutorView` accueille « مرحباً بك يا بحار المعرفة! » (lexique marin) alors que la spécification Boussole v2 l'a **explicitement supprimé**. Et la mission complétée félicite la présence (« كسبت 15 XP. عُد غداً ») — de la dopamine, pas de l'encouragement : on félicite la connexion, jamais ce qui a été appris.

**User Story :** *En tant qu'élève, je veux un tuteur à la voix unique, bref et exigeant, qui célèbre mes progrès réels afin de bâtir une relation de confiance.*

**Critères d'Acceptation (Definition of Done) :**
- **0 occurrence** de lexique marin (بحار / ملاح / ربان / قبطان) dans le tuteur et son accueil
- Ton cible : bref · direct · exigeant · bienveillant — 2 lignes d'encouragement maximum, **toujours suivies d'une action**
- `completeDailyMission()` affiche le gain mesurable (« أتقنتَ الآن: [point-clé] — لم يكن حاضراً في إجابتك يوم [date] ») au lieu de « كسبت 15 XP »
- Aucune félicitation pour une connexion, une série de jours ou un clic — uniquement : point-clé nouvellement couvert, étape de méthode acquise, erreur qui ne revient plus

**Piste de Solution / Recommandation Technique :** réécrire le message d'accueil d'`AITutorView` ; inscrire la charte de ton dans la section 0 du System Prompt consolidé ; s'appuyer sur le carnet d'erreurs pour nommer le gain.

---

## 4. ÉPIC 3 — CONTENU FIABLE & RESSERRÉ

> 49 entrées → 12 modules, zéro hors-programme, les 3 trous critiques (6-7 pts) bouchés.

### [KEO-301] : Supprimer tout contenu hors programme officiel (2011+)

**Type :** Contenu + Backend
**Priorité :** Critique *(l'élève perd des heures sur du non-exigible au détriment des 3 domaines notés)*
**Sources audit :** S3-01 · audit de modules (actions « supprimer »)

**Constat (Le Problème) :** des modules entiers portent sur des programmes retirés (génétique ancienne, évolution, reproduction végétale…) : temps de révision volé et démobilisation directe.

**User Story :** *En tant qu'élève, je veux que 100 % de mon temps de révision porte sur le programme officiel exigible afin de ne pas travailler pour rien.*

**Critères d'Acceptation (Definition of Done) :**
- 0 leçon / quiz / fiche hors programme exposé dans le parcours élève (balisage `NON_EXIGIBLES` / `CULTURE_GENERALE` de `curriculumOfficial.ts` appliqué)
- Le contenu hors programme éventuellement conservé est rangé **hors du parcours de révision**
- Toutes les entrées classées `action: "supprimer"` dans l'audit de modules sont traitées
- Test de contenu automatisé : scan du parcours = 0 entrée non balisée

**Piste de Solution / Recommandation Technique :** croisement `lessonIndex` / banque QCM avec `curriculumOfficial.ts` ; retrait des entrées NON_EXIGIBLES ; redirection vers les modules à fort rendement (Boussole, Correcteur, archétypes, annales indexées).

---

### [KEO-302] : Resserrer 49 entrées → 12 modules organisés en 3 hubs (8 fusions)

**Type :** UI/UX (architecture de navigation)
**Priorité :** Haute *(surcharge cognitive + consignes divergentes : « deux portes pour la même clé »)*
**Sources audit :** S3-02 · audit de modules étapes 4.1/4.2/4.5

**Constat (Le Problème) :** 49 entrées exposées à l'élève pour 12 modules réellement utiles. Doublons de navigation (`BacExamView` vs `Bac2025ExamView`), duplication méthodo (Meftah vs Boussole v2 : deux portes pour la même clé = surcharge cognitive **et** divergence des consignes).

**User Story :** *En tant qu'élève, je veux une interface resserrée en 3 hubs afin de savoir immédiatement où aller sans me perdre.*

**Critères d'Acceptation (Definition of Done) :**
- Les 8 fusions de l'audit sont réalisées, dont : Meftah → Boussole (conserver le micro-drill 60 s `SwitchDrillModal`, supprimer la vue autonome) · BacExam + Bac2025 → un seul lecteur avec filtre par session et **barème affiché question par question** · Mur d'analyse (TahlilWall) absorbe les exercices dispersés + le simulateur d'électrophorèse comme simple document
- La navigation expose **≤ 12 modules** organisés en 3 hubs (Apprendre / S'entraîner / Méthode & correction)
- Aucune consigne méthodologique dupliquée divergente (une seule source de vérité par règle)
- Plus aucune entrée classée `fusionner` non traitée dans l'audit de modules

**Piste de Solution / Recommandation Technique :** exécuter le plan de fusion documenté (champs `action` / `fusionInto` de l'audit) ; vérifier la cohérence des consignes après chaque fusion ; ne pas toucher aux fichiers interdits (AGENTS.md) — les fusions se font au niveau des vues et de la navigation.

---

### [KEO-303] : Construire la typologie des 8 documents BAC (trou critique n°1)

**Type :** Contenu
**Priorité :** Haute *(≈ 2 pts + gain de temps par sujet)*
**Sources audit :** S3-03 · audit de modules étape 4.4

**Constat (Le Problème) :** l'analyse de documents vaut 8-10 pts dans chaque exercice et c'est précisément là que les candidats perdent leurs points — mais aucun module n'enseigne la lecture **par type de document**.

**User Story :** *En tant qu'élève, je veux apprendre à lire chaque type de document BAC (courbe, tableau, schéma, électrophorèse…) afin de ne plus perdre des points par mauvaise exploitation des données.*

**Critères d'Acceptation (Definition of Done) :**
- Les 8 types de documents ont une fiche de lecture dédiée (ce qu'on y cherche, les pièges, la phrase-type d'exploitation)
- Chaque type est entraînable dans le Mur d'analyse (TahlilWall)
- Test de couverture : chaque type est référencé par au moins un exercice
- Gain estimé (≈ 2 pts/sujet) consigné et mesuré dans les défis BAC après livraison

**Piste de Solution / Recommandation Technique :** intégrer au Mur d'analyse (module classé « garder », très haut rendement) ; croiser avec les archétypes de sujets (5-6 gabarits couvrent ~80 % des questions 2019-2025).

---

### [KEO-304] : Construire le module d'exploitation chiffrée (trou critique n°2)

**Type :** Contenu
**Priorité :** Haute *(≈ 2,5 pts par sujet, jamais entraînés — le discriminateur entre 11 et 15)*
**Sources audit :** S3-04 · audit de modules (la question enzymatique chiffrée est tombée 6 fois sur 7 sessions)

**Constat (Le Problème) :** calculs de vitesse, rendements, pourcentages et exploitation graphique ne sont entraînés nulle part, alors que c'est le discriminateur entre une copie à 11 et une copie à 15.

**User Story :** *En tant qu'élève, je veux m'entraîner aux exploitations chiffrées (vitesse enzymatique, bilans énergétiques…) afin de sécuriser les points qui départagent les bonnes copies.*

**Critères d'Acceptation (Definition of Done) :**
- Couverture minimale : vitesse de réaction enzymatique (calcul + interprétation), effecteurs/inhibiteurs, bilans énergétiques (respiration/fermentations), taux et rendements
- Chaque exercice applique la triade (donnée → calcul avec unité → interprétation)
- QCM **et** situations ouvertes notées par le moteur (`gradeKeyPoints`, avec polarité KEO-107)
- Fréquence BAC documentée par item (`bac_sessions_2019_2026.json`)

**Piste de Solution / Recommandation Technique :** greffer sur le module enzymologie existant (classé stratégique) + Mur d'analyse ; réutiliser le simulateur d'électrophorèse comme document d'entraînement.

---

### [KEO-305] : Construire la trame C3 — hypothèse → témoin → conclusion (trou critique n°3)

**Type :** Contenu + Prompt Engineering
**Priorité :** Haute *(≈ 2 pts par exercice — la Boussole ne couvre que la rédaction)*
**Sources audit :** S3-05 · audit de modules étape 4.4

**Constat (Le Problème) :** le raisonnement expérimental (proposer une hypothèse réfutable, interpréter un témoin, conclure) est noté à ~2 pts par exercice et n'est couvert par aucun module.

**User Story :** *En tant qu'élève, je veux une trame systématique hypothèse → témoin → résultat attendu → conclusion afin de répondre aux questions de démarche expérimentale sans improviser.*

**Critères d'Acceptation (Definition of Done) :**
- La trame est enseignée (fiche + exemple complet annoté) et appliquée dans ≥ 10 situations de la banque
- Morchid l'exige dans le dialogue : toute consigne « اقترح فرضية » suit la trame (cf. contrat du verbe KEO-106)
- Des situations d'entraînement existent pour les 3 domaines
- Test panel interne : la situation type « expérience avec témoin » est correctement traitée par ≥ 80 % des élèves testeurs

**Piste de Solution / Recommandation Technique :** construire sur la banque de situations de départ (module classé « garder ») ; verrouiller le verbe « اقترح فرضية » dans la table KEO-106.

---

### [KEO-306] : Glossaire bilingue arabe/français actif + rappels de 2ᵉ AS

**Type :** Contenu + UI/UX
**Priorité :** Moyenne
**Sources audit :** S3-06 · audit de modules étape 4.4

**Constat (Le Problème) :** confusions de termes arabe/français relevées en audit, et prérequis de 2ᵉ AS jamais rappelés — l'élève moyen (10-12/20) décroche au premier terme non maîtrisé.

**User Story :** *En tant qu'élève, je veux un glossaire arabe↔français actif (cliquable) et des rappels de 2ᵉ AS afin de ne jamais être bloqué par un mot.*

**Critères d'Acceptation (Definition of Done) :**
- Chaque terme scientifique du parcours est cliquable → entrée bilingue (فصحى + français + définition 1 ligne)
- Les rappels 2ᵉ AS (prérequis) sont accessibles depuis les leçons qui les exigent
- 0 terme du parcours sans entrée de glossaire (scan automatisé)
- Le dictionnaire est réutilisé par le moteur (mapping FR/ar pour le retrieval) — une seule source de vérité

**Piste de Solution / Recommandation Technique :** dictionnaire central partagé correcteur/moteur/glossaire ; tooltip/lien actif dans le visualiseur de leçons.

---

## 5. ÉPIC 4 — MESURE HONNÊTE

### [KEO-401] : Télémétrie locale J1/J7/J30 + carte de score partageable + avis au pic

**Type :** Backend + UI/UX
**Priorité :** Moyenne
**Sources audit :** S4-01 · rapports Jeremy + Les Ignobles (zéro mesure de rétention)

**Constat (Le Problème) :** aucun moyen de piloter sur ce que l'élève apprend : les métriques honnêtes existantes (mots-clés, `unit.progress`, carnet d'erreurs) ne sont agrégées nulle part, et aucun outil de fierté partageable n'existe.

**User Story :** *En tant qu'élève, je veux voir ma progression réelle à J+1/J+7/J+30 et partager une carte de score afin de rester motivé et fier de mes progrès.*

**Critères d'Acceptation (Definition of Done) :**
- Tableau local J1/J7/J30 : mots-clés acquis, points-clés couverts, erreurs qui ne reviennent plus, % programme par unité — **100 % local, zéro analytics externe**
- Carte de score partageable (image) générée depuis ces métriques, sans données personnelles
- La demande d'avis Play Store se déclenche **uniquement au pic de progression** (jamais après un échec)
- La télémétrie alimente le tableau des métriques cibles (§7)

**Piste de Solution / Recommandation Technique :** agréger les stores existants (`favorites`, `examLog`, `methodologyLog`, `unit.progress`) dans un hook de tableau de bord local ; déclencheur d'avis conditionné au pic.

---

## 6. GOLDEN SET DE NON-RÉGRESSION (à verrouiller en CI)

| ID | Entrée élève | Comportement attendu | Ticket |
|---|---|---|---|
| GS-01 | « ما هو الاستنساخ؟ » | 1 question de sondage (probe), 0 ligne de contenu | KEO-103 |
| GS-02 | « لا أعرف » (1ᵉʳ clic, t+10 s) | Refus poli + chrono 90 s ; aucun indice, aucune correction | KEO-101/102 |
| GS-03 | « لا أعرف » (2ᵉ clic, t+95 s) | Indice I1 = verbe de consigne ; score non dévoilé | KEO-101 |
| GS-04 | « فسّر نتائج هذه التجربة » [graphe O₂] | Demande du bloc 1 seul (ألاحظ, avec chiffres) ; « لأنّ » interdit à cette étape | KEO-105 |
| GS-05 | « حلّل نتائج الجدول » [réponse contenant « لأنّ »] | Écart nommé (analyse ≠ interprétation) + demande de réécriture ; **pas de note** | KEO-106 |
| GS-06 | « لا، ليس صحيحاً أنّ CMH/HLA يعرض المستضدات » | 0/10 + explication de l'inversion de polarité + demande de reformulation affirmative | KEO-107 |
| GS-07 | [réponse d'analyse sans aucun chiffre] | Type T3 nommé + question-indice sur les deux valeurs ; pas de correction | KEO-110 |
| GS-08 | [fin de défi — 12/30] | CAUSE chiffrée + ACTION ≤ 15 min + PORTE (lessonKey) ; zéro adjectif isolé | KEO-104 |
| GS-09 | [mission du jour — 9 erreurs immunologie, 1 tectonique] | Mission = immunologie + justification (occurrences × poids × oubli) | KEO-202 |
| GS-10 | [fin d'explication sur la traduction] | Exactement 1 item d'ancrage + rappel J+1/J+3/J+7 annoncé | KEO-109 |
| GS-11 | « اختبرني في الغوص » | QCM lancé (mélange déterministe, correctIndex hors payload) ; jamais une fiche | KEO-108 |
| GS-12 | « الباك » | Demande de clarification à 3 options ; aucune fiche de بنية الكرة الأرضية | KEO-112 |
| GS-13 | « راني خايف من الباك، ما نقدرش نراجع » | Soutien en 3 temps (écoute / charge réduite / 1 action de 10 min) ; sortie en فصحى ; zéro liste de domaines | KEO-201 |
| GS-14 | « ما هو الحمض الأميني الذي تشفّره الرامزة AUG؟ » | « ميثيونين » + provenance (unité × page) + item d'ancrage ; zéro « منيل » | KEO-111 |
| GS-15 | [QCM 23 questions — 0 bonne réponse] | Événement émis (total 23, score 0, statut echec_reel) + remédiation déclenchée | KEO-113 |
| GS-16 | « كرة القدم » | Hors-programme **maintenu** (le filtre anti-bruit ne doit pas être affaibli) | KEO-201 |

---

## 7. MÉTRIQUES CIBLES (baseline → cible)

| Métrique | Baseline auditée | Cible | Ticket |
|---|---|---|---|
| Réponses prémâchées | ~80 % (chemin fiche par défaut) | < 5 % (500 échanges) | KEO-103 |
| Corrections livrées au 1ᵉʳ clic | 100 % (bouton « لا أعرف ») | 0 % | KEO-101 |
| Triade complète sur analyses | 0 % (conclusions brutes) | ≥ 90 % | KEO-105 |
| Détection du verbe de consigne | 0 % (logique non branchée) | ≥ 95 % | KEO-106 |
| Négations correctement sanctionnées | 0 % (10/10 sur réponse niée) | 100 % | KEO-107 |
| Erreurs typées avant remédiation | 0 % (adjectif seul) | 100 % | KEO-110 |
| Explications closes par un ancrage | 0 % | 100 % | KEO-109 |
| Détresse jamais rejetée | rejetée (hors-programme) | 100 % | KEO-201 |
| Assertions avec provenance | non mesuré · 7 erreurs confirmées | 100 % | KEO-111 |

---

## 8. ORDRE D'IMPLÉMENTATION RECOMMANDÉ (4 lots avec gates)

| Lot | Intitulé | Tickets | Gate de sortie |
|---|---|---|---|
| **LOT 1** | Stopper l'hémorragie (enseigner du faux ou noter en faux) | KEO-107 · KEO-111 · KEO-101 · KEO-201 | `verify_b2_negation.ts` vert · grep « منيل » = 0 · 15 formulations de détresse soutenues · correction inaccessible au 1ᵉʳ clic |
| **LOT 2** | Imposer la démarche scientifique | KEO-105 · KEO-106 · KEO-103 | GS-01, GS-04, GS-05 verts · triade ≥ 90 % · détection du verbe ≥ 95 % |
| **LOT 3** | Diagnostiquer et ancrer | KEO-110 · KEO-104 · KEO-109 · KEO-202 | Accord inter-juges ≥ 80 % sur 20 productions · 100 % des explications avec ancrage · justification de priorisation affichée |
| **LOT 4** | Fiabiliser le dialogue | KEO-108 · KEO-112 · KEO-113 | 8 formulations « اختبرني » → QCM · 10 mots contenant لب → 0 détournement · quiz 0/23 journalisé en echec_reel |

Les tickets des Épics 0, 2 (restants), 3 et 4 sont indépendants des lots et peuvent être menés en parallèle — **sauf** KEO-204 qui dépend de KEO-002, et KEO-303/304/305 qui supposent KEO-301 (contenu purgé avant contenu construit).

---

## 9. TRAÇABILITÉ — MAPPING VERS LES AUDITS SOURCES

| Ticket KEO | Sources dans les rapports fournis |
|---|---|
| KEO-001 → 005 | SpecKit S0-01 → S0-05 (les 2 rapports) |
| KEO-101 | SPEC-MORCHID-02 (2 rapports) · R1 · S1-01 |
| KEO-102 | R3 · S1-02 |
| KEO-103 | SPEC-MORCHID-01 (2 rapports) · R2 · S1-03 |
| KEO-104 | SPEC-MORCHID-13 / A-06 · R4 · S1-04 |
| KEO-105 | SPEC-MORCHID-03 (2 rapports) |
| KEO-106 | SPEC-MORCHID-06 (rapport (1) uniquement) |
| KEO-107 | SPEC-MORCHID-04 / A-12 · §B2 · S1-01 (volet notation) |
| KEO-108 | SPEC-MORCHID-08 / A-08 · §B7 |
| KEO-109 | SPEC-MORCHID-07 / A-05 |
| KEO-110 | SPEC-MORCHID-05 / A-04 |
| KEO-111 | SPEC-MORCHID-10 (rapport (1)) · §S1 S2 S3 S4 S-M1 S6 S7 S8 |
| KEO-112 | SPEC-MORCHID-11 (rapport (1)) · §B3 |
| KEO-113 | SPEC-MORCHID-14 (rapport (1)) · §B6 |
| KEO-201 | SPEC-MORCHID-09 / A-07 · R5 · S2-01 |
| KEO-202 | SPEC-MORCHID-12 / A-09 · R6 · S2-02 |
| KEO-203 | R7 · S2-03 · A-10 |
| KEO-204 | R8 · S2-04 |
| KEO-205 | R9 + R10 · S2-05 · A-11 |
| KEO-301 → 306 | SpecKit S3-01 → S3-06 + audit stratégique des modules |
| KEO-401 | SpecKit S4-01 |

---

## 10. NON-GOALS & GARDE-FOUS (hors périmètre de ce SpecKit)

- **Aucun fit de note** sur les notes prof (AGENTS.md P2/R6) : interdiction de tout modèle `a·cov+b` ; barème officiel 5/7/8 pts uniquement.
- **Cosmétique** (couleurs, animations, mascotte) : aucun effet mesurable sur ce que l'élève apprend de faux ou se voit noter de faux.
- **Nouvelles fonctionnalités d'acquisition** (paywall, ASO, onboarding RADAR) : issues d'autres speckits.
- **Fichiers interdits** (travail concurrent non signé) : `public/lessons/*.html`, SVG, `src/App.tsx`, `lessonIndex.ts`, `activeLessons.ts`, `HtmlLessonViewer.tsx`, `ScienceAnimations.tsx`, `FigureZoomLayer.tsx`, `figureZoomRuntime.ts`, `scripts/tools/`, `tmp_*`, `eleve_*.txt`, `RECAPITULATIF.txt`, `GUIDE_FUSION_*`, `package.json` — référencés en lecture seule.
- **Fichiers générés** (`okacha.ts` / `hosila.ts`) : jamais édités à la main, uniquement via `scripts/build_hosila.ts`.
- **Corpus des 40 `eleve_*.txt`** : calibration uniquement, jamais jeu de validation indépendant (tout écart publié est un plancher).

---

## 11. IMPORT DANS UN OUTIL DE GESTION DE PROJET

- **Jira / Trello / GitHub** : le fichier `docs/speckit_tickets_2026-10-01.csv` (généré depuis ce document) contient les 30 tickets avec colonnes `ID, Titre, Type, Priorité, Epic, Constat, User Story, Critères d'Acceptation, Solution, Sources` — importable directement (séparateur `;`, UTF-8).
- Chaque ID est stable (`KEO-xxx`) : utilisable comme clé de branche (`fix/KEO-107-polarite`) et de commit.
- Recommandation de workflow par lot (§8) : un lot = un sprint, la gate du lot = critère de sortie du sprint.

### Tickets GitHub créés (2026-10-01) — 30 issues #5 → #34

| Ticket | Issue · Ticket | Issue |
|---|---|---|
| [KEO-001](https://github.com/sinamind414/kunz-el-ouloum/issues/5) | [KEO-002](https://github.com/sinamind414/kunz-el-ouloum/issues/6) |
| [KEO-003](https://github.com/sinamind414/kunz-el-ouloum/issues/7) | [KEO-004](https://github.com/sinamind414/kunz-el-ouloum/issues/8) |
| [KEO-005](https://github.com/sinamind414/kunz-el-ouloum/issues/9) | [KEO-101](https://github.com/sinamind414/kunz-el-ouloum/issues/10) |
| [KEO-102](https://github.com/sinamind414/kunz-el-ouloum/issues/11) | [KEO-103](https://github.com/sinamind414/kunz-el-ouloum/issues/12) |
| [KEO-104](https://github.com/sinamind414/kunz-el-ouloum/issues/13) | [KEO-105](https://github.com/sinamind414/kunz-el-ouloum/issues/14) |
| [KEO-106](https://github.com/sinamind414/kunz-el-ouloum/issues/15) | [KEO-107](https://github.com/sinamind414/kunz-el-ouloum/issues/16) |
| [KEO-108](https://github.com/sinamind414/kunz-el-ouloum/issues/17) | [KEO-109](https://github.com/sinamind414/kunz-el-ouloum/issues/18) |
| [KEO-110](https://github.com/sinamind414/kunz-el-ouloum/issues/19) | [KEO-111](https://github.com/sinamind414/kunz-el-ouloum/issues/20) |
| [KEO-112](https://github.com/sinamind414/kunz-el-ouloum/issues/21) | [KEO-113](https://github.com/sinamind414/kunz-el-ouloum/issues/22) |
| [KEO-201](https://github.com/sinamind414/kunz-el-ouloum/issues/23) | [KEO-202](https://github.com/sinamind414/kunz-el-ouloum/issues/24) |
| [KEO-203](https://github.com/sinamind414/kunz-el-ouloum/issues/25) | [KEO-204](https://github.com/sinamind414/kunz-el-ouloum/issues/26) |
| [KEO-205](https://github.com/sinamind414/kunz-el-ouloum/issues/27) | [KEO-301](https://github.com/sinamind414/kunz-el-ouloum/issues/28) |
| [KEO-302](https://github.com/sinamind414/kunz-el-ouloum/issues/29) | [KEO-303](https://github.com/sinamind414/kunz-el-ouloum/issues/30) |
| [KEO-304](https://github.com/sinamind414/kunz-el-ouloum/issues/31) | [KEO-305](https://github.com/sinamind414/kunz-el-ouloum/issues/32) |
| [KEO-306](https://github.com/sinamind414/kunz-el-ouloum/issues/33) | [KEO-401](https://github.com/sinamind414/kunz-el-ouloum/issues/34) |

> ⚠️ Le token d'automatisation ne pouvant pas appliquer de labels ni modifier les issues : la priorité et l'épic figurent dans le tableau d'en-tête de chaque ticket (et l'ID encode l'épic : `KEO-0xx` = E0, `KEO-1xx` = E1, `KEO-2xx` = E2, `KEO-3xx` = E3, `KEO-4xx` = E4). Les labels `prio-critique` / `prio-haute` / `prio-moyenne`, `epic-*` et `speckit` sont déjà créés sur le dépôt : appliquez-les en masse depuis GitHub (sélection des 30 issues → « apply label ») ou via `gh issue edit <n> --add-label …` avec un compte possédant les droits.

### État d'implémentation — LOT 1 livré le 2026-10-01 (commit `0f4d1e0`)

| Ticket | Issue | État | Livré |
|---|---|---|---|
| KEO-101 — Escalier de 3 indices | [#10](https://github.com/sinamind414/kunz-el-ouloum/issues/10) | ✅ **Fait + verrouillé** | `BossState.hintLevel/attempts/openedAt` · I1 verbe / I2 squelette / I3 point-clé masqué · correction = 3 indices (≤ 3/10) ou 2 tentatives (plein) |
| KEO-102 — Chrono 90 s | [#11](https://github.com/sinamind414/kunz-el-ouloum/issues/11) | ✅ **Fait + verrouillé** | refus + temps restant avant 90 s sans tentative ; compatibilité sessions héritées |
| KEO-107 — Feedback d'inversion | [#16](https://github.com/sinamind414/kunz-el-ouloum/issues/16) | ✅ **Fait + verrouillé** (volet feedback/N5) | `gradeKeyPointsDetail` : « إجابتك ذكرت النقطة لكنّها نَفَتْها… » (le score B2 était déjà corrigé) |
| KEO-108 — اختبرني sans substitution | [#17](https://github.com/sinamind414/kunz-el-ouloum/issues/17) | ✅ **Fait + verrouillé** (N4) | branche « pool vide » → indisponibilité dite + alternative testable ; sujet non identifié → clarification |
| KEO-112 — Matching mot entier | [#21](https://github.com/sinamind414/kunz-el-ouloum/issues/21) | ✅ **Fait + verrouillé** (N1) | `findBestStudyGuide` + `scoreChunk` (RAG) + `OUT_OF_PROGRAM` passés à `includesAsWord` |
| KEO-201 — Détresse jamais rejetée | [#23](https://github.com/sinamind414/kunz-el-ouloum/issues/23) | ✅ **Fait + verrouillé** | `AFFECT_LEXICON` (فصحى + darija en détection) avant gibberish/OUT_OF_PROGRAM → `supportResult` (écoute / 10 min / 1 action) ; sortie فصحى |
| KEO-205 — Une seule voix | [#27](https://github.com/sinamind414/kunz-el-ouloum/issues/27) | ✅ **Fait** (accueil) | `WELCOME_TEXT` réécrit sans lexique marin ; le ton des autres messages suit au fil des lots |

**Verrous de non-régression :** `src/utils/__tests__/morchidGardeFou.test.ts` (13 tests : chrono, escalier ×4, tentatives, détresse darija/فصحى, GS-16, N1, N4, KEO-205) + `morchidCorrectifs.test.ts` (B2 passé au contrat « 2 tentatives », +1 test feedback d'inversion) + `synonymAndStuffing.test.ts` + `AITutorView.test.tsx` (parcours UI complet du nouveau défi). **Vérifications : tsc ✓ · vitest 162 fichiers / 1997 tests ✓ · jest ciblé 44/44 ✓ · build ✓.**

**Non couverts par ce lot** (ordres suivants) : KEO-104 (bilan CAUSE/ACTION/PORTE — LOT 3), KEO-103/105/106 (probe socratique, triade, verbe de consigne — LOT 2), KEO-111 (champ `source` de provenance — les 7 erreurs scientifiques étaient déjà purgées et verrouillées avant ce lot), KEO-002 (la date officielle BAC 2027 doit être fournie par l'owner — le garde-fou d'affichage existe déjà dans `DashboardView`).

### État d'implémentation — LOT 2 livré le 2026-10-01 (démarche scientifique & mode socratique)

| Ticket | Issue | État | Livré |
|---|---|---|---|
| KEO-103 — Probe socratique avant contenu | [#12](https://github.com/sinamind414/kunz-el-ouloum/issues/12) | ✅ **Fait + verrouillé** (GS-01) | champ `probe { question, expect }` sur les 11 cartes de sciences ; question d'analyse (ما هو/كيف/لماذا/اشرح…) sur le chemin carte scorée → **probe seule, zéro contenu** ; tentative de l'élève → verdict ✅/📌 (attendu nommé si erreur) PUIS contenu complet ; `اشرح لي` explicite → contournement journalisé (`probeBypassed`) ; quick actions (راجع…، اختبرني…، القائمة الرئيسية) → jamais sondées ; `answerTutorQuestion` (API sans session) contourne explicitement — la probe est un flux à état |
| KEO-105 — Triade ألاحظ→أستنتج→أخلص | [#14](https://github.com/sinamind414/kunz-el-ouloum/issues/14) | ✅ **Fait + verrouillé** (GS-04) | déclencheur (فسر/حلل/استنتج + وثيق/تجرب/منحن/جدول/النتائج, hors questions de méthode كيف/منهج/قالب) → étape 1 «لن أكتب الخلاصة مكانك» : l'élève donne ses observations ; «لأنّ» REJETÉ au bloc 1, EXIGÉ au bloc 2, bloc 3 = conclusion (≥ 10 caractères ou «لا أعرف») → «أكملتَ التثليث كاملاً» ; menuIntention libère la triade |
| KEO-106 — Contrat du verbe de consigne | [#15](https://github.com/sinamind414/kunz-el-ouloum/issues/15) | ✅ **Fait + verrouillé** (GS-05) | `VERB_CONTRACTS` (فسر/علل/برر → causal requis · حلل/استخرج/صف → causal interdit · قارن/اقترح/استنتج → structure) ; contrat affiché AVANT l'écriture (démarrage du défi + chaque transition «عقد الفعل») ; conformité vérifiée sur la réponse (connecteurs causaux normalisés ؤ→و) ; 1ᵉʳ écart = avertissement non compté (trappe anti-frustration au 2ᵉ) |
| KEO-104 — Bilan CAUSE/ACTION/PORTE | [#13](https://github.com/sinamind414/kunz-el-ouloum/issues/13) | ✅ **Fait + verrouillé** (GS-08) | `missedKeyPoints` accumulés à travers les situations ; bilan final = 🔍 **السبب المسمّى** (point manquant le plus fréquent, chiffré) + 🎯 **عملك الآن (10 دقائق)** (réécrire la situation + «ومنه نستنتج أنّ…») + 📖 **الدرس المعني** avec `lessonKey` réel via `findLessonForKeyPoint` (tokens ≥ 4 caractères vs titres/alias/mots-clés des 548 chunks) ; aucun lien inventé : «لن أخترع لك رابطاً» le cas échéant |

**Verrous de non-régression :** NOUVEAU `src/utils/__tests__/morchidSocratique.test.ts` — **17 tests** : probe seule/verdict/erreur nommée/bypass journalisé/quick actions/API sans session (6) · triade 4 étapes + refus de «لأنّ» au bloc 1 + questions de méthode non déviées (4) · contrat affiché/écart sans note/trappe/tentative conforme/verbe interdit (5) · bilan CAUSE-ACTION-PORTE + contrat de la situation suivante (2). Tests existants adaptés au contrat du verbe (réponses de test portant un connecteur causal) : `morchidGardeFou`, `morchidCorrectifs` (B2), `synonymAndStuffing`, `AITutorView.test.tsx` ; les 3 scripts `scripts/verify_*.ts` idem. **Vérifications : tsc ✓ · vitest 163 fichiers / 2018 tests (4 skipped) ✓ · jest ciblé 20/20 ✓ · build ✓ · verify_b2 (0/10 · 10/10 · 5/10) ✓ · verify_morchid_fixes ✓ · verify_morchid_audit ✓.**

**Note d'environnement :** le bac local de travail a été reconstruit en cours de session (commits du LOT 1 absents du clone) ; continuité rétablie via `git fetch` de la branche distante — l'historique 43dbe79 → 0f4d1e0 → 9e35fae est intact et le LOT 2 se committe proprement par-dessus. Par ailleurs `origin/master` a été remplacé entre-temps par une lignée sans ancêtre commun (3e970d2 « feat(morchid): R1→R10 ») : la fusion éventuelle de cette branche vers le nouveau master reste une décision de l'owner.

**Reste ensuite :** le passage du reste des messages du tuteur à la voix unifiée (KEO-205, entamé à l'accueil).

### Fusion master 3e970d2 (même jour)

`origin/master` ayant été remplacé par une lignée parallèle (R1→R10 + Tadwin + ProFigures + TrainingHub), la branche a fusionné master avec la règle « le plus complet et verrouillé gagne » — voir **`docs/FUSION_MASTER_3e970d2_2026-10-01.md`** pour la table de réconciliation complète. Points notables : **KEO-002 est résolu à titre provisoire** par leur R8 (`BAC_EXAM_DATE = '2027-06-08'` + drapeau provisoire dans `src/utils/dashboardActions.ts` — un seul endroit à modifier à la parution de l'arrêté officiel) ; R6/R7/R10 de master sont intégrés (priorisation réelle des erreurs, protocole proposé, gain nommé). Preuves après fusion : tsc ✓ · vitest 168 fichiers / 2115 tests ✓ · jest 162 suites / 2078 ✓ · build ✓.



