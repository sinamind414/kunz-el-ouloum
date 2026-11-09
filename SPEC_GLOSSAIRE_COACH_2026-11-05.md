# 📐 Spec courte — Coach capitaine : définitions courtes à la demande

**Statut : document de spécification issu de la simulation du 2026-11-05. Aucune implémentation, aucun code, aucun commit, aucun push, aucun changement de branche.** Fichier non suivi dans le workspace.

**Objet.** Quand l'élève écrit un mot scientifique ou un verbe de consigne dans la case du coach, il obtient **une réponse arabe فصحى, courte et sûre**, couvrant les 3 domaines officiels, sans jamais recevoir un contenu hors programme ni une définition inventée.

**Ce que ce document n'est pas** : ni une validation du lexique joint, ni une description de l'app actuelle. Aujourd'hui لا يوجد glossaire câblé : `اسأل القبطان` ouvre `المرشد الذكي`, qui pose une question-sonde avant d'expliquer.

---

## 0. Hypothèses — décisions reçues le 2026-11-05

| # | Décision | État |
|---|---|---|
| H1 | **La bulle du capitaine (القبطان) répond** — une seule voix | ✅ **TRANCHÉ** |
| H2 | **L'élève tape le mot** dans la case (saisie libre) | ✅ **TRANCHÉ** |
| H3 | **Faire d'abord essayer l'élève**, puis expliquer — pour **tous** les mots, noms comme verbes | ✅ **TRANCHÉ le 2026-11-05** : c'est exactement la règle déjà écrite dans `smartTutorEngine.ts` (`🧭 سؤال قبل الشرح`), donc **aucune règle nouvelle à inventer** |
| H4 | Contrat `يُطلب/يُمنع` pour un verbe | ⚠️ proposition de rédaction, à confirmer |
| H5 | Une phrase, arabe seul, + renvoi vers la leçon ; seuil de longueur à fixer | ⚠️ à confirmer |
| H6 | **Sources fournies par l'utilisateur** : `الكتاب_المصحح_v1.0.md` (livre corrigé, 11 unités, 334 p.) et `المكتبة_الكاملة_SVT.md` (39 documents, BEM + BAC) | ✅ **SOURCE DISPONIBLE**, avec les nuances ci-dessous |

**Conséquence simple de H1+H2 (constat).** Aujourd'hui les deux entrées « اسأل القبطان » (carte du tableau de bord et bouton rond `fab-morchid`) font `setCurrentTab('chat')` : elles **ouvrent le المرشد الذكي**, elles ne répondent pas. Le seul champ de texte du capitaine (`RelaisCapitaine.tsx`) sert à une autre question (un nom / oui-non). Pour que la bulle réponde elle-même à un mot tapé, il faut donc lui **donner son propre champ de saisie** : c'est une petite modification à prévoir, pas un blocage.

**Nuances apportées par les fichiers reçus (constats).**
- Le livre corrigé est bien la source que `correcteurV1.ts` appelle **L1** ; `docs/sources/.gitignore` interdit de le committer (droits d'auteur). **[CONSTAT corrigé le 2026-11-07]** : les deux ouvrages sont en réalité **suivis dans le dépôt à la racine depuis `f4bc4f4`** (`git ls-files`, `git ls-tree HEAD`). Seule la copie attendue dans `docs/sources/` est exclue par ce `.gitignore`. Anomalie de gouvernance à arbitrer.
- `المكتبة_الكاملة_SVT.md` est une **compilation de 39 documents**, dont beaucoup de 3ᵉ moyenne (BEM) et de fiches d'enseignants : elle sert à **vérifier**, pas à définir le programme 3AS.
- Le livre **contient** `المتمم`, `نضج`, `القطع الدالة/غير الدالة` et les donne même comme « مصطلحات يُحاسَب عليها », alors que `NON_EXIGIBLES` (L5 p.6) les déclare non exigibles. **Les deux sources se contredisent** → R5 et V2 sont assouplis en « étiqueter ou exclure selon l'arbitrage », et non plus « purger ».
- Le livre écrit **`الأترولينات`** et **`التكامل الحفزي (التكيف المستحثّ)`** : mes remarques précédentes qui les présentaient comme des fautes étaient **inexactes**. C'est l'orthographe du livre qui fait foi.
- Les 6 définitions courtes de `fillBlanks.ts` testées ne sont **pas recopiées mot pour mot** du livre : ce sont des reformulations issues des QCM. Le livre valide le **sens**, pas la phrase exacte → **« Non vérifiable »** pour la formulation officielle.

**Les 4 grandes décisions (H1, H2, H3, H6) sont prises.** La chaîne retenue est donc :

> l'élève tape le mot → la bulle du capitaine pose **une question-sonde** (« essaie d'abord de le définir ») → l'élève essaie → le capitaine donne la **définition courte فصحى** avec un verdict d'une ligne, le domaine/unité et le renvoi vers la leçon.

**Détails encore ouverts, non bloquants** : nombre de tentatives pour un mot (je propose **1 seule**, alors que le moteur en demande 2 pour une réponse d'exercice), seuil de longueur de la définition (H5), étiqueter ou exclure les 3 termes (R5), et U8 (ajout ou exclusion documentée).

La sortie de secours existe déjà : l'élève peut écrire **« اشرح لي »** pour obtenir le contenu sans essai, et c'est **enregistré** (`probeQuestionAction`, `smartTutorEngine.ts:833`). Les silences (épreuve, quiz, focus, nuit, 3 ignorances) restent entiers : quand le capitaine doit se taire, **il ne pose même pas la sonde**.

---

## 0bis. État d'implémentation — étage 2, 2026-11-07

**Consigne « OGO » traitée comme le « GO » de l'étage 2, avec les 5 propositions par défaut** (dont l'arbitrage explicite pour `src/App.tsx`, nommé dans le plan validé). Implémenté, tests verts, **aucun commit ni push**.

| Arbitrage | Retenu |
|---|---|
| H4 format du verbe | Les **10 contrats `يُطلب/يُمنع` du moteur**, recopiés et verrouillés mot pour mot |
| H5 longueur | **Aucun seuil imposé** : la définition est `acceptedAnswers[0]` du dépôt, longueur variable. Aucune phrase réécrite |
| R5 les 3 `NON_EXIGIBLES` | **Étiqueter** (« غير ممتحن فيه »), pas exclure — c'est l'option proposée |
| U8 | **Exclusion documentée** depuis `PROGRESSION_OFFICIELLE` (2 h / 0,5 sem., مخطط تحصيلي خلوي), aucune fiche inventée |
| Nombre de tentatives | **1 seule** pour un mot ; sortie « اشرح لي » conservée |

**Fichiers** : `src/data/glossaireCapitaine.ts` (121 fiches dérivées de `FILL_BLANK_QUESTIONS`, 14 variantes, 10 contrats, 3 étiquettes, U8), `src/components/GlossaireCapitaine.tsx` (lazy), 2 fichiers de verrous, câblage minimal de `src/App.tsx`. Le bouton rond ouvre désormais la bulle ; le pont « تابع مع المرشد » garde l'accès au tuteur. Quand la bulle répond, invitation et relais se taisent (**une seule voix**). Le panneau reste dans le bloc gardé par `!epreuveEnCours` : impossible à monter pendant une épreuve.

**Limites assumées (constats, pas des oublis)** : le renvoi vers la leçon est un **texte** « الوحدة X · الدرس Y », pas encore un lien cliquable ; la sortie « اشرح لي » **n'est pas enregistrée** dans un stockage (le moteur d'exercice, lui, l'enregistre) ; la carte d'accueil `DashboardView` ouvre toujours le tuteur car un verrou l'exige (`MorchidContextuel.test.tsx`) — seule la **bulle ronde** répond ; les silences nocturnes / 3 ignorances continuent de s'appliquer aux **invitations automatiques**, pas à un clic explicite de l'élève (règle déjà en vigueur pour le tuteur).

**Validation** : `lint` 0 · ESLint 0 · Miftah OK · `diff --check` 0 · vitest **311 fichiers / 3650 passés / 8 ignorés** (+2 fichiers, +22 tests) · BOUSSOLE 138/0 · Jest **303 / 3596 + 2** · build 15,23 s / 20 tests · entrée **515 Ko < 700 Ko** · chunk lazy `GlossaireCapitaine-*.js` **12 Ko, hors entrée**.

---

## 1. Cas d'usage

| UC | Entrée élève | Comportement attendu | Donnée utilisée | Garde-fou |
|---|---|---|---|---|
| UC1 | « ما هو الجين؟ » (nom connu) | **Sonde d'abord** (H3) → après la tentative : une phrase de définition + étiquette domaine/unité + renvoi leçon | `fillBlanks.ts` | R1, R2, R12, R15 |
| UC2 | « ما معنى استنتج؟ » (verbe) | **Sonde d'abord** (H3) → après la tentative : contrat « يُطلب… / يُمنع… », pas une définition | `VERB_CONTRACTS` | R8, R15 |
| UC3 | « عرّف لي المتمم » | **Refus explicite ou étiquette** « غير ممتحن فيه » + renvoi, selon l'arbitrage R5 | `NON_EXIGIBLES` + livre L1 | R5 |
| UC4 | « ما هو الغلوكوفان؟ » | **Aucune définition** : « غير معتمد في معجم التصحيح » + renvoi cours | `exclu_ids` | R6 |
| UC5 | Dialecte (« شنو… »), faute, mot inconnu | Normalisation, puis échec explicite ; **jamais de définition fabriquée** | `normalizeAr`, `faux_amis` | R4, R11 |
| UC6 | Épreuve, quiz, mode focus, nuit, 3 ignorances | **Silence** : aucune réponse, bulle non rendue | `capitainePeutParler`, `App.tsx` | R9 |
| UC7 | Contenu `CULTURE_GENERALE` consulté | Définition **étiquetée** « ثقافة عامة — غير ممتحن فيه » | `CULTURE_GENERALE` | R7 |
| UC8 | **H3 retenu** : sonde d'abord, explication après tentative ; sortie « اشرح لي » enregistrée ; « لا أعرف » donne un indice sans accuser l'élève | Question-sonde, verdict d'une ligne, puis contenu court | `smartTutorEngine.ts:833` (`probeQuestionAction`, `probeVerdictThenContent`) | R10, R15, R16 |

**Cas de couverture à ne pas oublier** : les 3 domaines (1 : 1–5 · 2 : 6–8 · 3 : 9–11), **11 unités**. Le lexique joint n'en couvre que **10** (U8 « تحويل الطاقة على المستوى ما فوق البنية الخلوية » absente) : à ajouter ou à documenter comme exclusion assumée.

---

## 2. Règles

| # | Règle | Ancrage |
|---|---|---|
| R1 | **Une seule source de vérité** : partir des 162 micro-tests / 161 définitions courtes (comptage « التعريف الصحيح », 2026-11-07) de `fillBlanks.ts` et des 617 entités de `dictionnaire_final.json` (index + normalisation). Le lexique joint est un complément à auditer, pas la base. | `fillBlanks.ts`, `dictionnaire_final.json` |
| R2 | Une définition = **une phrase**, فصحى, seuil de longueur **à fixer par vous** (je n'en invente pas). Zéro LaTeX, zéro paragraphe de cours. | `AGENTS.md` §5 |
| R3 | Chaque entrée porte : `terme · définition · domaine 1|2|3 · unité 1..11 · type nom|verbe · étiquette L1..L6 · statut exigible / ثقافة عامة / filtré`. | modèle `correcteurV1.ts` |
| R4 | **Zéro contenu inventé** : aucune définition, aucun chiffre, aucun exemple non tracé. | `AGENTS.md` §5 |
| R5 | **Étiqueter ou exclure** les 3 `NON_EXIGIBLES` (`المتمم`, `مبدأ الأسيلوسكوب`, `نضج الـ ARNm`) : le livre corrigé les contient, le document du ministère les dit non exigibles. **Arbitrage utilisateur requis** ; jamais de définition silencieuse sans étiquette « غير ممتحن فيه ». | `curriculumOfficial.ts` (L5 p.6) + livre L1 fourni |
| R6 | **Arbitrer les 39 `exclu_ids`** : exclusion ou statut explicite ; jamais de définition silencieuse. | `dictionnaire_final.json` |
| R7 | Les 3 chapitres `CULTURE_GENERALE` restent consultables mais **étiquetés** « غير ممتحن فيه ». | `curriculumOfficial.ts` |
| R8 | Les verbes = **10 contrats existants** ; unifier les ~25 variantes `verbAr` (فسر/فسّر/فَسِّرْ…). Aucune définition parallèle. | `smartTutorEngine.ts`, `activeLessons.ts` |
| R9 | **Silences conservés** intégralement : épreuve, quiz, focus, 22 h→7 h, 6 h après 3 ignorances. | `App.tsx`, `invitationCapitaine.ts` |
| R10 | **Une seule voix** : le capitaine OU le tuteur, jamais deux guides concurrents. | `BandeauConseilRubrique.tsx` |
| R11 | Normaliser la saisie (dialecte, diacritiques, fautes) avant recherche ; mot introuvable → réponse d'échec explicite. | `normalizeAr.ts`, `faux_amis` |
| R12 | Toujours **renvoyer vers la leçon** ; le glossaire ne remplace jamais le cours. | `conceptRoutes.ts` |
| R13 | Traçabilité : chaque définition doit exister dans une source étiquetée, prouvée par un test. | `correcteurV1.test.ts` |
| R14 | Le glossaire reste **hors du bundle d'entrée** (chargé à la demande). | `poidsEntree.verrou.test.ts` — plafond 700 Ko |
| R15 | **Sonde avant contenu (H3 tranché)** : pour toute demande de mot, une question d'essai d'abord ; **1 tentative** proposée pour un mot de glossaire (le moteur en exige 2 pour une réponse d'exercice — à confirmer par vous). Échappatoire **« اشرح لي »** conservée et enregistrée. Si le capitaine doit se taire, **pas de sonde non plus**. | `smartTutorEngine.ts:833`, `capitainePeutParler` |
| R16 | Verdict d'**une ligne** sur la tentative, puis la définition courte ; `لا أعرف` ouvre le contenu par la base, sans dire à l'élève qu'il a tort ; tentative trop courte non comptée. | `probeVerdictThenContent`, `MIN_ATTEMPT_CHARS` |

---

## 3. Verrous à écrire (décrits sans code)

| # | Verrou | Échec si… |
|---|---|---|
| V1 | Couverture **3 domaines / 11 unités**, avec décompte opposable | une unité manque (ex. U8) |
| V2 | Zéro terme `NON_EXIGIBLES` rendu **sans étiquette** (« غير ممتحن فيه » ou refus explicite), selon l'arbitrage R5 | `المتمم` ou `نضج الـ ARNm` défini comme exigible |
| V3 | Zéro terme `exclu_ids` rendu sans statut explicite | `غلوكوفان`, `psii`, `igg` définis silencieusement |
| V4 | **Une seule entrée par terme normalisé** (0 doublon, 0 divergence de formulation avec `fillBlanks.ts`) | deux définitions pour `الجين` |
| V5 | Format : une phrase, longueur ≤ seuil retenu, arabe seul, aucun `$…$`, aucune glose FR non arbitrée | paragraphe, LaTeX, français résiduel |
| V6 | Chaque entrée a une étiquette `L1..L6` et passe le gate de traçabilité granulaire | définition sans source |
| V7 | Les **10 verbes** ont un contrat `يُطلب/يُمنع` et aucune fiche « définition » concurrente | verbe traité comme un nom |
| V8 | Aucun rendu du coach pendant épreuve / quiz / focus / nuit / après 3 ignorances | réponse pendant l'épreuve |
| V9 | Mot inconnu → réponse d'échec, **jamais** de texte généré | définition fabriquée |
| V10 | Poids de l'entrée < **700 Ko** après ajout | import statique du glossaire dans `App.tsx` |
| V11 | Les 3 chapitres `CULTURE_GENERALE` portent « غير ممتحن فيه » | affichés comme exigibles |

---

## 4. Chaîne de validation (à respecter pour tout amendement)

`npm run lint` → `lint:eslint` → `check:miftah` → suite ciblée du glossaire → `npm test` → `test:jest` → `test:build` → `git diff --check`.

Dernière mesure connue sur cette branche : **309 fichiers / 3628 vitest**, **301 suites / 3574 jest**, **4/20 tests de build**, entrée **515 Ko**. À relancer après tout ajout ; les compteurs ne doivent pas baisser.

---

## 5. Hors périmètre / « Non vérifiable »

- **L1 a été fourni par l'utilisateur le 2026-11-05**, et il est **présent dans le dépôt à la racine** (suivi depuis `f4bc4f4`) : je peux le lire, mais pas garantir qu'il est identique au scan papier de 334 pages. Le retrait de l'index reste à arbitrer. `docs/sources/tronque/` reste **inexistant** et L5 est documenté **OCR bruité** (13 citations / 42 sous 85 %). La formulation officielle exacte d'une définition reste donc **« Non vérifiable »**. Aucune source externe consultée.
- `المكتبة_الكاملة_SVT.md` (39 documents, BEM + BAC, fiches d'enseignants) n'a **pas de statut officiel** : son contenu ne peut pas décider de ce qui est exigible au BAC.
- Le comportement réel de la case aujourd'hui (tuteur socratique, pas de glossaire câblé) : la simulation est une **spécification**, pas un constat d'exécution.
- Les phrases d'accueil, de refus et de renvoi de la simulation : **formulations de démonstration**, pas des chaînes du projet.
- Les mots qui bloquent réellement les élèves (aucune donnée de terrain) ; le rendu sur Redmi / Samsung A ≤ 2 Go, 3G, 360 px, texte agrandi ; le geste Retour Android ; Play Console / `assetlinks.json`.
- **H1, H2, H3 et H6 sont tranchés.** Restent ouverts, sans bloquer : H4/H5 (format et seuil de longueur), le nombre de tentatives pour un mot (R15), l'arbitrage R5 (étiqueter ou exclure les 3 termes), U8, la branche de référence unique (`reorganisation-med` ↔ `arena/bcf8863b…`) et l'éventuelle convergence.

---

## 6. État git au moment de la rédaction

Branche `arena/bcf8863b-kunz-el-ouloum` (**active**). Le snapshot du 2026-11-05 a ramené l’historique **local** à `f4bc4f4` ; le **distant reste `a873d74`** (travail de code sauvegardé sur GitHub). Ce document est **non suivi** : créé puis mis à jour avec les décisions H1/H2 et les sources reçues ; **aucun `git add`, commit ou push** effectué pour lui. Les deux ouvrages sont suivis à la racine du dépôt depuis `f4bc4f4` (constat corrigé le 2026-11-07) ; aucun `git rm --cached` ni purge d'historique effectué — arbitrage séparé.
