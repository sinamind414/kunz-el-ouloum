# 🔑 مفتاح الكنز — منهجية الإجابة في بكالوريا الجزائر

**مادة علوم الطبيعة والحياة** — أداة تتحقق من تغطية الإجابة للعناصر العلمية والمنهجية المنتظرة وفق أربع خطوات:
N = اقرأ — تأطير المسألة، S = اجمع — استغلال السندات، E = اربط — الربط والتفسير، W = اختُم — التركيب والمصادقة. Les identifiants techniques restent N/S/E/W ; l'interface emploie une seule représentation visible : le parcours en quatre étapes. Elle ne prétend pas corriger une copie à la place d'un professeur.

> ⚠️ **Positionnement honnête : outil d'entraînement méthodologique non calibré.** Le moteur calcule des signaux heuristiques pour ses tests, mais l'interface masque toute note numérique tant que les seuils de calibration humaine ne sont pas franchis. Les consignes marquées `reconstructed` ne sont pas des énoncés officiels. Le benchmark vérifié contient actuellement **0 copie réelle doublement annotée** : aucune métrique de fiabilité ne peut donc être publiée.

> ✅ **Version intégrée à la racine.** L'ancien site monolithique est conservé dans
> [`docs/history/_v1_backup/`](docs/history/_v1_backup) au cas où.

---

## ✨ Ce que propose l'application

Parcours en cinq temps pensé pour la **gestion du stress** et la **méthode** — soit quatre écrans (`view-hub`, `view-guide`, `view-strategy`, `view-workspace` dans `index.html`) plus une section d'outils repliée :

1. **Hub** — une seule action par carte-sujet : **▶ ابدأ الإمتحان**. Chaque carte annonce la durée officielle selon la filière (4 h 30 en Sciences expérimentales, 2 h 30 en Maths) et rappelle que le jumeau numérique du sujet est partiel : certaines consignes sont reconstruites.
2. **Sérénité** _(parcours guidé uniquement)_ — volontairement dépouillé : respiration, rappel des quatre étapes (اقرأ ← اجمع ← اربط ← اختُم), plan de session. Cet écran prépare à l'épreuve, il n'est pas une simulation certifiée.
3. ~~**تدريب الخطوات الأربع**~~ _(retiré le 2026-09-13)_ — l'exercice rapide, l'أطلس التقنيات et le تشخيص تجريبي ont été supprimés avec le mode entraînement. Le hub ne garde que les cartes d'épreuve et la consultation des annales.
4. **Stratégie** _(optionnelle)_ — le sujet s'affiche **dans l'application** (visionneuse PDF intégrée, les fichiers suivis dans `subjects/**` étant servis par la même origine), avec estimation personnelle et choix du sujet. Chaque carte rappelle l'état réel de l'inventaire : `جرد المهام: N مهمة، منها M تعليمة رسمية موثّقة`. Le lien dzexams ne reste qu'en source de repli, et `⬇️ تنزيل PDF` permet de travailler hors ligne.
5. **Épreuve — le seul mode** — l'application propose uniquement l'épreuve : le sujet officiel rendu lisible **dans la copie** (visionneuse PDF intégrée), **la liste des exercices du sujet avec leur barème** (dépendant de l'année et de la filière, total /20), un champ de rédaction par exercice, le chronomètre officiel et **✓ تسليم الورقة** pour rendre la copie avant la fin. **Aucune question n'est affichée à l'écran** (décision du propriétaire, 2026-09-20) : l'élève lit chaque exercice dans le sujet officiel, exactement comme le jour de l'examen. Aucune aide, aucun modèle, aucun diagnostic pendant l'épreuve ; après remise, les réponses sont verrouillées et une relecture distincte devient disponible. Aucune note BAC n'est affichée : le moteur n'est pas calibré, et la page de réponses n'annonce plus ce fait par un bandeau.

> 📱 **Responsive** : l'interface est utilisable sur téléphone (grilles qui se replient, cibles tactiles ≥ 44 px, champs 16 px sans zoom iOS, modales scrollables). Verrouillé par `tests/e2e/responsive.spec.mjs` (3 viewports réels, zéro défilement horizontal) dans la CI.

> ⚡ **Chargement progressif et mode hors-ligne maîtrisé** : le démarrage ne charge que le catalogue des 19 années. Le sujet complet d'une année est importé au clic, puis peut être conservé dans un cache runtime local borné. Le shell ne précache ni les payloads d'années ni les PDF. Un badge discret affiche la version du build et l'état hors-ligne ; les diagnostics restent des compteurs techniques agrégés sur l'appareil.

L'interface propose des thèmes clair et sombre persistants. Dans l'espace de travail, toute l'aide
méthodologique (décisions سند/معارف et وصف/تفسير, canevas, الفحص الرباعي) est regroupée dans **un seul dépliant
fermé** « توجيه هذه الخطوة » : la consigne et la zone de réponse restent l'élément central.

---

## 🔑 Correspondance fiche MIFTAH ↔ application (cartographie complète)

La fiche élève **MIFTAH v3.1** (recto المفتاح / verso المفتاح+) a longtemps servi de référence.
Depuis le 2026-09-13, le produit ne propose plus qu'un mode — l'épreuve — et les outils de la
fiche (décisions سند/معارف · وصف/تفسير, exercice rapide 12/12, keycard imprimable, brouillon en
quatre étapes) ont été retirés avec lui. Ce qui reste de la méthode :

| Élément                            | Où il vit dans l'app aujourd'hui                                                                                                                               | Test                         |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| الخطوات 1-4 (اقرأ/اجمع/اربط/اختُم) | écran **Sérénité** (guide) : rappel des quatre étapes avant l'épreuve                                                                                          | `ui.test.mjs`                |
| وضع الحفظ (عرّف / اذكر)            | canevas `definition`/`listing` de `js/method-scripts.js`, utilisés par l'évaluation                                                                            | `method-coach.test.mjs`      |
| Provenance des consignes           | inventaires `data/official-tasks.js` (les consignes restent encodées avec leur preuve ; l'écran d'épreuve n'affiche plus aucune question depuis le 2026-09-20) | `official-coverage.test.mjs` |

**Hors périmètre, volontairement :** la colonne « 📝 المصحح » de la fiche (pourcentages, « نصف النقطة
دائما », « إجابة بلا رقم = 0 »…) : aucune source officielle (`عناصر الإجابة والعلامة المترتبة`) ne
les étaye — elles ne peuvent pas entrer dans l'app tant qu'un document officiel ne les confirme pas.
Le disclaimers du hard benchmark (0 copie réelle doublement annotée) reste la limite honnête du projet.

---

## 🗂️ Architecture (modulaire & data-driven)

```
.
├── index.html                        # squelette des 5 écrans (remplis par js/)
├── assets/
│   ├── styles.css                    # design 100% autonome (aucun CDN)
│   └── icon-192.png / icon-512.png   # icônes de marque (مفتاح الكنز)
├── data/
│   ├── subjects.js                   # catalogue léger + chargeurs dynamiques (aucun sujet complet au démarrage)
│   ├── years/
│   │   ├── se/year-2013.js … year-2026.js  # un payload à la demande par année Sciences
│   │   └── m/year-2021.js … year-2026.js   # un payload à la demande par année Maths
│   ├── calibration-policy.js         # seuils quantitatifs préalables à toute promotion de score
│   ├── calibration-status.js         # statut public généré depuis le corpus audité
│   ├── usability-study.js            # agrégats P2 pseudonymisés (aucune session inventée)
│   ├── official-tasks.js             # inventaires explicites des questions BAC, séparés des étapes N/S/E/W
│   └── archive.js                    # consultation (hors cartes d'épreuve affichées)
├── js/
│   ├── main.js                       # point d'entrée
│   ├── ui.js                         # façade d'orchestration (taille mesurée dans le bloc « Tests »)
│   ├── engine.js                     # façade du moteur heuristique + minuteurs
│   ├── store.js                      # état + persistance localStorage + timers reconciliés
│   ├── app-version.js                # version PWA (générée par scripts/generate-pwa-version.mjs)
│   ├── method-scripts.js             # scripts de méthode (conseils contextuels)
│   ├── application/                  # minuteurs + démarrage après chargement de l'année demandée
│   ├── domain/evaluation/            # règles d'analyse et d'évaluation (5 modules)
│   ├── domain/subjects/official-coverage.js # audit de couverture et garde de simulation fermée par défaut
│   ├── services/                     # son, dictée et observabilité locale agrégée sans données personnelles
│   └── ui/
│       ├── dom.js · dialogs.js · navigation.js · accessibility.js  # infrastructure UI partagée
│       ├── screens/            # hub, guide, stratégie, épreuve et relecture après remise
│       └── pdf-viewer.js       # visionneuse du sujet: PDF local en iframe + repli externe + téléchargement
├── tests/                            # tests automatisés (moteur, données, UI, sécurité) — `npm test`
│   ├── *.test.mjs                    # exécutés par `node --test` (compte dans le bloc « Tests »)
│   ├── e2e/                          # Playwright : mode hors-ligne PWA + responsive mobile (3 viewports) — `npm run test:e2e`
│   └── hard-benchmark/               # pipeline de copies réelles (corpus : 0 copie)
├── scripts/
│   ├── generate-pwa-version.mjs      # génère js/app-version.js (appelé par `npm run build`)
│   ├── generate-archive-years.mjs    # régénère les payloads reconstruits 2013–2019
│   ├── report-official-coverage.mjs  # inventaire connu, couverture globale et éligibilité simulation
│   ├── report-p1-status.mjs          # six critères P1, preuves et bloqueurs externes
│   ├── report-p2-status.mjs          # sept critères P2, dont cinq élèves distincts
│   ├── report-p3-status.mjs          # six critères P3 (PWA, cache, observabilité, release)
│   ├── verify-release.mjs            # contrôle le fichier, la taille et le SHA-256 de la release
│   ├── update-calibration-status.mjs # statut public dérivé du corpus audité
│   └── update-doc-metrics.mjs        # régénère / vérifie les métriques du README
├── docs/                             # protocoles, handoff et déploiement/rollback
├── server.mjs                        # serveur statique avec CSP — `npm start`
├── playwright.config.mjs             # config e2e (lance server.mjs sur 127.0.0.1:4173)
├── tsconfig.services.json            # typecheck des services — `npm run typecheck`
├── build.mjs                         # produit la release web déterministe et le monofichier
├── sw.js                             # shell précaché + runtime borné à 12 entrées
├── manifest.webmanifest              # PWA (installable)
├── dist/                             # généré par `npm run build` (ignoré par git)
│   ├── site/                         # artefact de production + release.json vérifiable
│   └── boussole-4d-standalone.html   # version monofichier (ouvre en file://)
└── package.json                      # npm start / npm test / npm run build
```

### Statut P1 mesuré — incomplet tant que les preuves manquent

Les questions BAC ne sont plus supposées équivalentes aux quatre étapes N/S/E/W. Un inventaire indépendant déclare désormais chaque tâche : sa provenance (`official` quand le texte vient de l'énoncé, `reconstructed` quand il s'agit d'une étape pédagogique), sa page quand elle est connue, ses références documentaires et son maximum — **provisoire** partout, puisqu'aucun barème n'a été relu par un humain.

```bash
npm run coverage:official # détail des 58 sujets (tous ouverts à l'épreuve)
npm run inventory:check    # data/official-tasks.js doit être régénéré, jamais édité à la main
npm run p1:status         # verdict des six critères P1
npm run p1:check          # échoue tant que P1 n'est pas réellement terminé
```

Les inventaires couvrent les **58 sujets** et **576 tâches** : **312** consignes officielles (avec page) et **264** étapes reconstruites (sans page — on n'invente pas un numéro de page). Les 58 sujets sont ouverts à l'épreuve, conformément à la décision produit consignée dans `data/bac-mode-policy.js` : le contenu doit être inventorié, mappé et borné (règle stricte), mais les certifications humaines — relecture des documents, barème vérifié — peuvent manquer, à condition que l'écran le dise. La règle stricte reste implémentée (`strictEligible`) et continuera de décider seule dès que les preuves humaines existeront. La couverture globale vaut `unknown` tant que l'inventaire d'un sujet est partiel : elle n'est jamais transformée en 0 % ou 100 %. Les exports chiffrés restent interdits tant que la calibration humaine n'est pas faite.

Le code du parcours est en place : une épreuve silencieuse fondée sur les tâches inventoriées, puis une relecture verrouillée après remise. La CSP n'autorise plus `unsafe-inline` et les sources publiques ne contiennent plus de style inline. Cela ne clôt pas P1 : les inventaires complets et le corpus humain sont des preuves externes absentes, pas des cases que le code peut cocher seul. Le volume et le format des apports nécessaires sont détaillés dans [`docs/P1_EVIDENCE_REQUIREMENTS.md`](docs/P1_EVIDENCE_REQUIREMENTS.md).

### Statut P2 mesuré — validation humaine encore requise

La première tranche P2 ferme six critères techniques : navigation clavier et focus de route, dialogues isolés, ordre libre des exercices, vocabulaire recentré sur les quatre étapes, interface élève en arabe, contraste et petites tailles, ainsi que le cycle complet de la copie (sujet lisible dans l'app, réponse enregistrée, remise confirmée, relecture verrouillée). Le septième critère reste externe : cinq élèves doivent tester le parcours sur leur téléphone bas de gamme.

```bash
npm run p2:status # verdict des sept critères P2
npm run p2:check  # échoue tant que cinq sessions réelles ne sont pas auditées
```

Le protocole et le format d’agrégats pseudonymisés, sans identifiant direct, sont définis dans [`docs/P2_USABILITY_PROTOCOL.md`](docs/P2_USABILITY_PROTOCOL.md). Une session synthétique ne peut pas fermer P2.7.

---

## ⚖️ Publication responsable

Le code original et la documentation sont sous Apache-2.0 (`LICENSE`). Les droits des sujets, corrigés et scans tiers ne sont pas transférés par cette licence : consultez [`docs/CONTENT_RIGHTS.md`](docs/CONTENT_RIGHTS.md) avant toute redistribution. La politique de confidentialité locale, l’effacement et l’usage du microphone sont décrits dans [`docs/PRIVACY.md`](docs/PRIVACY.md) ; les mentions légales et le signalement d’erreur dans [`docs/LEGAL_NOTICE.md`](docs/LEGAL_NOTICE.md).

La revue P4 reste bloquée pour une mise en production tant qu’une revue juridique du contenu externe n’est pas maintenue et qu’une revue scientifique indépendante n’est pas attestée. Voir [`docs/P4_PUBLICATION.md`](docs/P4_PUBLICATION.md).

## 🌐 Lancer l'application

```bash
npm start
# ouvrir http://localhost:8080
```

Le serveur applique une liste blanche d'assets publics. Ne pas remplacer cette commande par un serveur exposant toute la racine du dépôt.

> ⚠️ Ouvrir `index.html` via `file://` peut bloquer les modules ES6.
> Pour un fichier 100 % autonome, ouvrir directement
> `dist/boussole-4d-standalone.html` (aucune dépendance, aucun serveur).

---

## 📄 Contenu réel — épreuve

**29 sessions** dans `APP_CONFIG.years` : **2013–2026 علوم تجريبية** (14 années) **+ 2013–2026
رياضيات** (14 années) **+ la session exceptionnelle 2017 رياضيات**. Chaque millésime ouvre une
épreuve dans l'application — il n'existe plus de carte qui se contente d'afficher un lien.

Une seule nature d'épreuve — l'**épreuve 4D** : les consignes du sujet sont encodées
(`data/years/{se,m}/year-*.js`) pour l'inventaire et la calibration ; chaque session ouvre une
épreuve chronométrée où l'élève lit les questions **dans le sujet officiel** (PDF rendu dans la
copie), rédige un champ par exercice et rend sa copie avec `✓ تسليم الورقة`. Depuis le
2026-09-20 (décision du propriétaire), l'écran d'épreuve affiche les exercices du sujet et leur
barème officiel — **jamais les questions**. L'ancienne **armature « copie libre »**
(`answerMode: "free"` — aucune consigne encodée faute de couche texte lisible), qui n'a servi
qu'à **SE 2021**, a disparu le 2026-09-20 : son sujet a été structuré par OCR (voir plus bas).
Le mécanisme reste implémenté et gardé par des tests (sujet synthétique) si une future session
devait n'être qu'ouvrable en lecture-rédaction.

Toutes les sessions sont désormais en 4D, en trois vagues :

- **Maths 2016–2020** — structurées le 2026-09-19 (commit `ac206be`, demande du propriétaire) :
  questions officielles, réponses modèles et barème mesuré (20 pts par sujet : 8+12, 6+14 ou
  10+10 selon le millésime).
- **Maths 2013–2015 et la session exceptionnelle 2017** — structurées le **2026-09-20**
  (décision 6 du propriétaire, `PROMPT_DECISIONS_PROPRIETAIRE.md`) à partir d'une extraction
  **Tesseract OCR (arabe)** des sujets officiels — pipeline `scripts/lib/ocr.mjs` +
  `scripts/ocr-extract-sujets.mjs`, preuves brutes dans `scripts/extracted/M/**`. Les
  2013–2015 sont des **scans** sans couche texte ; la 2017 استثنائية est **transposée**.
  Leur notation est marquée `provisional` (`scoringReviewStatus`) : l'audition OCR des
  chiffres du barème (10+10 pour 2013–2015 ; 7+13 / 8+12 pour 2017) n'a pas la certitude
  d'une relecture humaine.
- **SE 2021** — structurée le **2026-09-20** (prolongement de la décision 6, même pipeline) :
  la dernière armature « copie libre » est devenue une épreuve 4D complète à partir d'une
  extraction **Tesseract OCR (arabe)** de ses deux sujets — preuves brutes dans
  `scripts/extracted/SE/2021/`. Barème lu sur le sujet : **5+7+8 = 20 pts** par sujet.
  16 consignes officielles (une par question affichée), 48 pôles par année, notation
  `provisional`.

Les sessions réellement absentes des sources ne sont pas inventées : elles sont documentées
dans `ARCHIVE.gaps`, qui compte exactement deux entrées — la session exceptionnelle 2016
رياضيات et l'espace باكالوريات أجنبية (`year: "all"`, aucune ligne n'existe dans la source).
Un trou n'emporte aucun `localPdfUrls` : il documente une absence, il n'annonce pas de sujet.
**2021 SE est une épreuve 4D** (`enabled: true`) : les consignes ont été extraites par OCR du
sujet officiel servi dans l'application (2026-09-20) — l'élève passe l'épreuve notée
(`provisional`) comme pour toute autre session. Sa carte d'archive a été retirée : toutes les
sessions SE sont des années d'entraînement 4D. L'archive 2013–2019 n'est pas un énoncé
ministériel.

### Contenu BAC 2025 (شعبة علوم تجريبية)

Le contenu a été reconstitué à partir du sujet officiel **et de son corrigé modèle**
(« الإجابة النموذجية ») :

| Sujet | Exercice | Thème                                                                         |
| ----- | -------- | ----------------------------------------------------------------------------- |
| **1** | ت1 (5ن)  | دور الـ **ARN** في **تركيب البروتين** + تأثير مادة تُفكّك الرابطة أدنين–ريبوز |
| **1** | ت2 (7ن)  | **الطحالب الخضراء**، بنية الصانعات، استغلال **CO₂** وأنزيم **RUBISCO**        |
| **1** | ت3 (8ن)  | **الأدينوزين، الكافيين والنشاط العصبي** (المخطط التحصيلي ذو المسارين)         |
| **2** | ت1 (5ن)  | **التحلل السكري** وتحويل طاقة الجلوكوز (ATP) + أثر دواء                       |
| **2** | ت2 (7ن)  | أنزيم **SOD** و**التصلب الجانبي الضموري (ALS)**                               |
| **2** | ت3 (8ن)  | **زمر الدم ABO** و**التسامح المناعي** (نقل بين الزمرتين A / O)                |

> ⚠️ Les PDF d’examen ne sont pas redistribués par le dépôt. Les `bacPrompt` marqués `official`
> ont été relus visuellement page par page (2026-08-23). Le reste reste `reconstructed`.

### Contenu BAC 2024 (شعبة علوم تجريبية)

Pages 2, 6, 7 et 10 relues sur photos du sujet officiel (2026-08-31) :
pôles concernés en `official`. Le reste (pages 1, 3–5, 8–9 et cadrages N/W)
reste `reconstructed` :

| Sujet | Exercice | Thème                                                                |
| ----- | -------- | -------------------------------------------------------------------- |
| **1** | ت1 (5ن)  | **فيروس VIH** والخلايا **LT4** + دواء **Zalcitabine**                |
| **1** | ت2 (7ن)  | **الصرع** وتوازن التنبيه/التثبيط (**Glutamate / GABA**, الجين Scn1a) |
| **1** | ت3 (8ن)  | بروتين **P53** والبنزوبيرين وسرطان الرئة                             |
| **2** | ت1 (5ن)  | **الترجمة** وتأثير **Tetracycline / Oxazolidinone**                  |
| **2** | ت2 (7ن)  | **RUBISCO** وتثبيت **CO₂** عند الفاصولياء (CA1P)                     |
| **2** | ت3 (8ن)  | **المناعة** ضد الدفتيريا والمكورات العنقودية (بروتين SPA)            |

### Contenu BAC 2023 (شعبة علوم تجريبية)

Consignes relues sur la couche texte du PDF dzexams (inversée, reconstituée mot à mot) :

| Sujet | Exercice | Thème                                                                     |
| ----- | -------- | ------------------------------------------------------------------------- |
| **1** | ت1 (5ن)  | **البروتينات الغشائية في المشبك** وذيفان **الكزاز** (Clostridium tetani)  |
| **1** | ت2 (7ن)  | دواء **ML901** وتثبيط **تركيب البروتين** لدى طفيلي **الملاريا**           |
| **1** | ت3 (8ن)  | **سرطان الثدي**، الأستراديول، أنزيم الأروماتاز ومادة **الكيرسيتين**       |
| **2** | ت1 (5ن)  | **البنية الفراغية للبروتين** (QCM) ودور **التتابع النوكليوتيدي** والطفرات |
| **2** | ت2 (7ن)  | الخلايا التائية السامة **LTc** وبروتين **البيرفورين**                     |
| **2** | ت3 (8ن)  | مبيد **DCMU** و**المرحلة الكيميائية الضوئية** (PSII)                      |

### Contenu BAC 2022 (شعبة علوم تجريبية)

Consignes relues sur la couche texte du PDF officiel ONEC (dzexams, inversée,
reconstituée mot à mot, 2026-08-27) ; corrigé officiel (الإجابة النموذجية) joint au
même PDF (pp. 11-21) et croisé avec une seconde source ([eddirasa](https://eddirasa.com/correction-bac-science-2022-se/))
— textes concordants :

| Sujet | Exercice | Thème                                                                       |
| ----- | -------- | --------------------------------------------------------------------------- |
| **1** | ت1 (5ن)  | **الغشاء الهیولي** : تحديد الذات والتعرف على اللادوات (CMH, ABO, BCR, TCR)  |
| **1** | ت2 (7ن)  | **مناطق التشابك** في النخاع الشوكي : **الغلوتامات** و**GABA** (الاسترخاء)   |
| **1** | ت3 (8ن)  | المضاد الحيوي **الجینتامسین** و**انحلال البشرة الفقاعية** (الترجمة)         |
| **2** | ت1 (5ن)  | **السّيانور** (منع ATP) و**كمون الراحة** للليف العصبي                       |
| **2** | ت2 (7ن)  | **α-amanitine** (ARN بوليميراز) ودواء **ATAC** ضد الأورام السرطانية         |
| **2** | ت3 (8ن)  | **غاز الميثان (CH₄)** في الأبقار والمكمل الغذائي **(3-NOP)** (أنزيم M/CoEM) |

Les points N/S/E/W sont une **allocation pédagogique interne**, pas le barème officiel question par question. Le premier inventaire P1 (`data/official-tasks.js`) sépare les deux tâches officielles de 2025/S1/E1 des quatre étapes méthodologiques et marque encore leur découpage de points comme provisoire. L'évaluation compare les réponses à des **mots-clés normalisés** (via `normalizeArabic`), des interdits contextuels et une longueur minimale ; elle ne produit pas de note BAC.

### Provenance des consignes

| Année          | État        | PDF local                          | Source externe                                                                                                                                                                                                                                                                                                                                                 | Consignes                                                                                                                                                                                                                        |
| -------------- | ----------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **2025**       | activée     | `subjects/SE/2025/sujet-{1,2}.pdf` | —                                                                                                                                                                                                                                                                                                                                                              | Pôles `official` relus sur le scan ; autres `reconstructed`                                                                                                                                                                      |
| **2024**       | activée     | `subjects/SE/2024/sujet-{1,2}.pdf` | [eddirasa sujet](https://eddirasa.com/bac-science-2024-se/) · [PDF eddirasa](https://eddirasa.com/wp-content/uploads/2024/06/bac-sc-sciences-2024.pdf) · [dzexams](https://www.dzexams.com/ar/annales/bkVXVzlvRTlpV1RMYUk5cGNyS3oxdz09) · [PDF dzexams](https://www.dzexams.com/uploads/sujets/officiels/bac/2024/dzexams-bac-sciences-naturelles-1751784.pdf) | Mixte : 8 pôles `official` recopiés mot à mot sur photos des pages 2, 6, 7, 10 (2026-08-31) ; le reste `reconstructed`. Viewer dzexams bloqué dans la sandbox. Session de remplacement non localisée.                            |
| **2023**       | **activée** | `subjects/SE/2023/sujet-{1,2}.pdf` | [eddirasa](https://eddirasa.com/bac-science-2023-se/) · [PDF](https://eddirasa.com/wp-content/uploads/2023/06/eddirasa.com-bac-sciences-se-2023.pdf)                                                                                                                                                                                                           | Consignes `official` relues sur l'image du PDF propre (2026-09-21). L'ancien livret dzexams imprimait de faux chiffres et a été remplacé. Pôles sans question autonome en `reconstructed`                                        |
| **2022**       | **activée** | `subjects/SE/2022/sujet-{1,2}.pdf` | [dzexams 2022](https://www.dzexams.com/ar/annales/eVlXSFRFOEJaN2ozSlE3NytzWkRHQT09) · [PDF ONEC](https://www.dzexams.com/uploads/sujets/officiels/bac/2022/dzexams-bac-sciences-2311208.pdf) · [corrigé eddirasa](https://eddirasa.com/correction-bac-science-2022-se/)                                                                                        | Consignes `official` relues sur la couche texte du PDF ONEC (inversée, reconstituée mot à mot, 2026-08-27) ; corrigé officiel croisé sur 2 sources concordantes ; pôles sans question autonome en `reconstructed`                |
| **2026 SE**    | **activée** | `subjects/SE/2026/sujet-{1,2}.pdf` | [énoncé eddirasa](https://eddirasa.com/uploads/2026/08/bac-science-2026-se.pdf) · [corrigé](https://eddirasa.com/uploads/2026/08/correction-bac-science-2026-se.pdf)                                                                                                                                                                                           | `official` / `reconstructed` depuis OCR du PDF officiel (2026-08-31)                                                                                                                                                             |
| **2020 SE**    | **activée** | `subjects/SE/2020/sujet-{1,2}.pdf` | [énoncé eddirasa](https://eddirasa.com/wp-content/uploads/2020/09/eddirasa.com-bac-se-science-2020.pdf) · [corrigé](https://eddirasa.com/wp-content/uploads/2020/09/eddirasa.com-correction-bac-sc-science-2020.pdf)                                                                                                                                           | **Phase 3 du plan 2026-09-23** : 17 consignes `official` recopiées mot à mot sur l'image des 9 pages (`docs/RELECTURE_SE_2020_CHECKLIST.md`, deux passes) ; 7 cadrages `reconstructed` assumés ; valeurs revues (600 et non 655) |
| **2021 Maths** | **activée** | `subjects/M/2021/sujet-{1,2}.pdf`  | [dzexams 2021 m](https://www.dzexams.com/ar/annales/T2tYS3FTcFRwWCtCbXV2QmFyRTcydz09)                                                                                                                                                                                                                                                                          | `official` / `reconstructed` depuis viewer 12 pages (couche inversée, 2026-08-31)                                                                                                                                                |
| **2022 Maths** | **activée** | `subjects/M/2022/sujet-{1,2}.pdf`  | [énoncé eddirasa](https://eddirasa.com/wp-content/uploads/2022/06/eddirasa.com-bac-math-science-2022.pdf) · [corrigé](https://eddirasa.com/wp-content/uploads/2022/06/eddirasa.com-correction-bac-math-science-2022.pdf)                                                                                                                                       | `official` / `reconstructed` depuis OCR (2026-08-31) ; format 8+12 / 8+12                                                                                                                                                        |
| **2023 Maths** | **activée** | `subjects/M/2023/sujet-{1,2}.pdf`  | [énoncé eddirasa](https://eddirasa.com/wp-content/uploads/2023/07/eddirasa.com-bac-sciences-math-2023.pdf) · [corrigé](https://eddirasa.com/wp-content/uploads/2023/07/eddirasa.com-correction-bac-sciences-math-2023.pdf)                                                                                                                                     | `official` / `reconstructed` depuis OCR (2026-08-31) ; format 8+12 / 7+13                                                                                                                                                        |
| **2024 Maths** | **activée** | `subjects/M/2024/sujet-{1,2}.pdf`  | [énoncé eddirasa](https://eddirasa.com/wp-content/uploads/2024/06/bac-math-sciences-2024.pdf) · [corrigé](https://eddirasa.com/wp-content/uploads/2024/05/correction-bac-math-sciences-2024.pdf)                                                                                                                                                               | `official` / `reconstructed` depuis OCR (2026-08-31) ; format 7+13 / 7+13                                                                                                                                                        |
| **2025 Maths** | **activée** | `subjects/M/2025/sujet-{1,2}.pdf`  | [énoncé eddirasa](https://eddirasa.com/wp-content/uploads/2025/06/bac-math-science-2025.pdf) · [corrigé](https://eddirasa.com/wp-content/uploads/2025/06/correction-bac-math-science-2025.pdf)                                                                                                                                                                 | `official` / `reconstructed` depuis OCR (2026-08-31) ; format 8+12 / 8+12                                                                                                                                                        |
| **2026 Maths** | **activée** | `subjects/M/2026/sujet-{1,2}.pdf`  | [énoncé eddirasa](https://eddirasa.com/uploads/2026/08/bac-math-sciences-2026.pdf) · [corrigé](https://eddirasa.com/uploads/2026/08/correction-bac-math-sciences-2026.pdf)                                                                                                                                                                                     | `official` / `reconstructed` depuis OCR (2026-08-31) ; format 6+14 / 8+12                                                                                                                                                        |

**PDF versés dans le dépôt : 58 fichiers, 42 Mo** — `subjects/SE/2013…2026` et
`subjects/M/2013…2026`, soit deux sujets par année et par filière, plus les deux sujets de la
session exceptionnelle 2017 رياضيات dans `subjects/M/2017/exceptional/`. Mesure :
`git ls-files subjects | grep -c '\.pdf$'` → 58.

> ⚠️ **Point juridique non résolu (D17).** Ces énonés sont des sujets officiels du BAC
> algérien, téléchargés depuis dzexams / eddirasa. `LICENSE-CONTENT` et `NOTICE` encadrent le
> contenu, mais la **permission de redistribution n'est pas établie** pour ces 42 Mo, et ils
> sont suivis par Git — donc présents dans l'historique, pas seulement dans l'arbre de travail
> (`.git` pèse 104 Mo). Deux issues : sortir `subjects/` du dépôt (livraison par artefact ou
> sous-module), ou documenter une autorisation explicite. À trancher avant toute publication.

Comportement applicatif, indépendant de la question juridique : les PDF ne sont **jamais
précachés**. L'écran stratégie annonce leur taille exacte et attend un téléchargement
volontaire ; seule une réponse locale HTTP 200 peut entrer dans le cache runtime **borné**
(20 entrées, éviction des plus anciennes) après la demande. Les requêtes `Range` traversent le
service worker sans être mises en cache, pour ne pas casser la reprise de lecture.

L'intégrité de cet ensemble est verrouillée par `tests/pdf-content-integrity.test.mjs` :
toute référence écrite dans `data/` existe sur disque, tout PDF du disque est référencé, deux
sessions distinctes ne partagent jamais les mêmes fichiers, et tout PDF est reconnu par
`isRuntimeAsset` (donc aucun ne retombe dans le cache shell non borné).

### Contenu BAC 2026 (شعبة علوم تجريبية)

Énoncé + corrigé officiels [eddirasa](https://eddirasa.com/uploads/2026/08/bac-science-2026-se.pdf)
· [corrigé](https://eddirasa.com/uploads/2026/08/correction-bac-science-2026-se.pdf)
(OCR, 2026-08-31). 2 sujets × 3 exercices (5+7+8). Fichier : `data/years/se/year-2026.js`.

| Sujet | Exercice | Thème                                              |
| ----- | -------- | -------------------------------------------------- |
| **1** | ت1 (5ن)  | **الألبومين**، الجذور الهيدروكسيل (OH•) و**Edema** |
| **1** | ت2 (7ن)  | **SIRT1 / P53A / NAD+** ومركب **RSV**              |
| **1** | ت3 (8ن)  | مبيد **Atrazine** ومقاومة الزنجبيل الأرقطي (GST)   |
| **2** | ت1 (5ن)  | غشاء **التيلاكوئيد** ومبيد **Oxyfluorfen**         |
| **2** | ت2 (7ن)  | **AVC** وقناة **ASIC1a** (PcTx1)                   |
| **2** | ت3 (8ن)  | **ألزهايمر**، Anti-Aβ و**ATV-Aβ** (TfR)            |

### Contenu BAC 2020 (شعبة علوم تجريبية)

Énoncé + corrigé officiels [eddirasa](https://eddirasa.com/wp-content/uploads/2020/09/eddirasa.com-bac-se-science-2020.pdf)
· [corrigé](https://eddirasa.com/wp-content/uploads/2020/09/eddirasa.com-correction-bac-sc-science-2020.pdf)
(OCR RTL, 2026-08-31). 2 sujets × 3 exercices (5+7+8). Fichier : `data/years/se/year-2020.js`.

| Sujet | Exercice | Thème                                                          |
| ----- | -------- | -------------------------------------------------------------- |
| **1** | ت1 (5ن)  | **البنية الداخلية للكرة الأرضية** (Moho / Gutenberg / Lehmann) |
| **1** | ت2 (7ن)  | أنزيما **Cox-1 / Cox-2** ودواء **الإيبوبروفين**                |
| **1** | ت3 (8ن)  | بروتين **Her2** والعلاج بـ **التراستوزوماب**                   |
| **2** | ت1 (5ن)  | انتقاء الببتيد المستضدي و**CMH**                               |
| **2** | ت2 (7ن)  | مادة **الريسين** وتثبيط تركيب البروتين (ARNr 28s)              |
| **2** | ت3 (8ن)  | المشبك المثبط ونضج **GABA** (NKCC1 → KCC2)                     |

### Contenu BAC 2021 (شعبة علوم تجريبية)

Structurée le **2026-09-20** par extraction **Tesseract OCR (arabe)** des deux sujets officiels
servis par l'application (`subjects/SE/2021/sujet-{1,2}.pdf`, couche texte aux chiffres
corrompus) — preuves brutes dans `scripts/extracted/SE/2021/`. 2 sujets × 3 exercices
(**5+7+8 = 20 pts** par sujet, barème lu sur le sujet). Fichier : `data/years/se/year-2021.js`.

| Sujet | Exercice | Thème                                                                      |
| ----- | -------- | -------------------------------------------------------------------------- |
| **1** | ت1 (5ن)  | **تركيب البروتين** والبنية الفراغية (الجزيئة س، الروابط 1–4)               |
| **1** | ت2 (7ن)  | أنزيم **الريبونكلياز البنكرياسي** : الموقع الفعال، pH الوسط، تخريب الروابط |
| **1** | ت3 (8ن)  | **VIH** والخلايا **LT4** : تعطيل الآليات المناعية والأمراض الانتهازية      |
| **2** | ت1 (5ن)  | مراحل **الاستجابة المناعية النوعية** ومؤهلات الخلايا المؤهلة               |
| **2** | ت2 (7ن)  | **وحدة الشفرة الوراثية** واستثناءاتها : ARNt معدلة وعلاج غياب الكازيين     |
| **2** | ت3 (8ن)  | **الإحساس بالألم** والقرن الخلفي : المورفين مقابل **سم العنكبوت**          |

> ⚠️ Notation `provisional` : les consignes officielles sont le fruit de l'OCR (audition sans
> relecture humaine) ; les pôles N/W restent des cadrages `reconstructed`.

### Contenu BAC 2022–2026 (شعبة رياضيات)

Énoncé + corrigé officiels eddirasa (OCR, 2026-08-31). Format Maths : 2 sujets × 2 exercices. id `YYYY-m`.

| Année    | Fichier                     | Barème      | Thèmes                                                                         |
| -------- | --------------------------- | ----------- | ------------------------------------------------------------------------------ |
| **2022** | `data/years/m/year-2022.js` | 8+12 / 8+12 | ريبوزوم (PM 844) ؛ RADT Cov19 ؛ جسم مضاد ؛ هيبسيدين **HAMP** (GCC→ACC Ala→Thr) |
| **2023** | `data/years/m/year-2023.js` | 8+12 / 7+13 | إيثانول Asp-Tyr ؛ **PRF1** G→A (UAG) ؛ CPA/LB/LT ؛ هالوفوجينون / ProRS         |
| **2024** | `data/years/m/year-2024.js` | 7+13 / 7+13 | كورديسبين ؛ DLBCL (β2m / HLA I) ؛ PID ؛ ألبورت **COL4A5** Gly→Glu              |
| **2025** | `data/years/m/year-2025.js` | 8+12 / 8+12 | مضادان Q/D والريبوزوم ؛ TAP / HLA I ؛ **HLA-DRB1** Arg74Trp ؛ UV-C Spike ACE2  |
| **2026** | `data/years/m/year-2026.js` | 6+14 / 8+12 | LTc / CMH I ؛ HCF LDLR/PCSK9 ؛ IL-2 NDNA11 ؛ غيتلمان **SLC12A3** Leu892Pro     |

### Contenu BAC 2016–2020 (شعبة رياضيات)

Structurées le 2026-09-19 (commit `ac206be`) à la demande du propriétaire, depuis les PDF
officiels versés au dépôt (`subjects/M/{2016..2020}/sujet-{1,2}.pdf`), exactement le motif
des millésimes 2021–2026. Format Maths : 2 sujets × 2 exercices, 20 pts par sujet. id `YYYY-m`.

| Année    | Fichier                     | Barème        | Thèmes                                                                                             |
| -------- | --------------------------- | ------------- | -------------------------------------------------------------------------------------------------- |
| **2016** | `data/years/m/year-2016.js` | 10+10 / 10+10 | الشفرة الوراثية والرابطة الببتيدية ؛ الرد الخلطي والبلعمة ؛ Anagène وHbA ؛ CMH والغشاء الهيولي     |
| **2017** | `data/years/m/year-2017.js` | 6+14 / 6+14   | تنوع محددات المستضد ؛ التعبير المورثي والترجمة ؛ الهجرة الكهربائية ؛ غرفة ماربروك والتعاون المناعي |
| **2018** | `data/years/m/year-2018.js` | 8+12 / 6+14   | الاستنساخ والهجرة الكهربائية ؛ VIH ؛ الكزاز واللقاح ؛ الريبونوكلياز والمورثة                       |
| **2019** | `data/years/m/year-2019.js` | 8+12 / 8+12   | ثبات البنية الفراغية ؛ ماربروك وإقصاء اللاذات ؛ البلعميات والغشاء ؛ Crick/Brenner/Nirenberg        |
| **2020** | `data/years/m/year-2020.js` | 8+12 / 8+12   | الروابط الكيميائية ؛ Ras/p53 والأشعة فوق البنفسجية ؛ الذات واللاذات ؛ فقر الدم المنجلي             |

### Contenu BAC 2021 (شعبة رياضيات)

Énoncé + corrigé dzexams (viewer 12 pages, couche inversée reconstituée,
2026-08-31). Format Maths : 2 sujets × 2 exercices (8+12). id `2021-m`.
Fichier : `data/years/m/year-2021.js`.

| Sujet | Exercice | Thème                                              |
| ----- | -------- | -------------------------------------------------- |
| **1** | ت1 (8ن)  | **CMH** والتوافق النسيجي في زرع الكلية             |
| **1** | ت2 (12ن) | **الماكروليد** ومقاومة البكتيريا (**Mex.R**)       |
| **2** | ت1 (8ن)  | عناصر **تركيب البروتين** (ARN بوليميراز / ريبوزوم) |
| **2** | ت2 (12ن) | **الهيموغلوبين** والبنيتان **R** و **T**           |

### Contenu BAC 2013–2015 + 2017 استثنائية (شعبة رياضيات)

Extraction **Tesseract OCR (arabe)** des PDF officiels versés au dépôt
(`subjects/M/{2013,2014,2015}/sujet-{1,2}.pdf` — scans — et
`subjects/M/2017/exceptional/sujet-{1,2}.pdf` — couche transposée), décision 6 du
propriétaire, 2026-09-20. Format Maths : 2 sujets × 2 exercices. id `YYYY-m`,
session exceptionnelle `2017-em`. Notation `provisional` (`scoringReviewStatus`),
preuves OCR dans `scripts/extracted/M/**`. Chaque consigne officielle est **la
question du sujet elle-même, une seule par tâche, texte verbatim nettoyé de l'OCR**
(motif des sujets SE, correction du propriétaire 2026-09-20) ; chaque sujet totalise
**20 points** (barème lu sur le sujet : 10+10, ou 7+13 / 8+12 pour la 2017 استثنائية).

| Année              | Fichier                                 | Barème        | Thèmes                                                                                          |
| ------------------ | --------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------- |
| **2013**           | `data/years/m/year-2013.js`             | 10+10 / 10+10 | لغات المعلومة والقاموس الوراثي ؛ LB/LT والغدة السعترية ؛ الرد الخلطي ؛ الرد الخلوي و VIH        |
| **2014**           | `data/years/m/year-2014.js`             | 10+10 / 10+10 | البنية الفراغية واليوريا ؛ CMH والزمر الدموية ؛ عناصر الترجمة ؛ غشاءي وإقصاء اللاذات LT4/LT8    |
| **2015**           | `data/years/m/year-2015.js`             | 10+10 / 10+10 | الرحلان والشفرة الوراثية ؛ الزمر الدموية ونقل الدم ؛ Glu63/Arg87 ؛ الالتهاب الكبدي B            |
| **2017 استثنائية** | `data/years/m/year-2017-exceptional.js` | 7+13 / 8+12   | الخلية السامة والتلامس المناعي ؛ من المورثة إلى الريبوزومات ؛ LT4 المحوري ؛ الأنترلوكين والبنية |

---

## 📚 Onglets du hub — ce que chaque filière ouvre

Le bouton **تغيير الشعبة** cycle **علوم تجريبية → رياضيات → باكالوريات أجنبية**.
Les sujets de l'onglet choisi remplacent la grille. Chaque carte ouvre une épreuve : aucune
n'est plus un simple renvoi vers un site tiers.

| Onglet                        | Épreuves ouvertes                           | Nature                                                                                                            |
| ----------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| شعبة علوم تجريبية (`se`)      | 2013–2026 (14 cartes)                       | **toutes en 4D** — 2013–2020/2022–2026 (2026-08-31), **2021 par OCR Tesseract** (2026-09-20)                      |
| شعبة رياضيات (`m`)            | 2013–2026 + 2017 exceptionnelle (15 cartes) | **toutes en 4D** : 2021–2026 et 2016–2020 (2026-09-19), 2013–2015 + 2017 استثنائية par OCR Tesseract (2026-09-20) |
| باكالوريات أجنبية (`foreign`) | —                                           | **espace vide, assumé** : aucune source étrangère vérifiée, **0 lien**                                            |

Les entrées de `data/archive.js` ne sont plus des cartes : elles servent de **source**
(page annales + lien PDF direct) aux sujets désormais ouverts en épreuve.

Statut honnête :

- **2013–2018 SE** : sujets reconstruits (`data/years/se/`). Toutes consignes `reconstructed`. **2018** : thèmes relus OCR dzexams. **2013–2017** : thèmes pédagogiques 3AS, **non certifiables** comme énoncés officiels. Confiance UI basse.
- **2019 SE — relu et encodé depuis l'image (2026-09-23, Phases 1 à 6 du plan `docs/PLAN_SE_2013_2020.md`)** : les neuf pages ont été lues deux fois (`docs/RELECTURE_SE_2019_CHECKLIST.md`) et les **six exercices réécrits** — مغماتية الظهرة، أنزيم غلوكوز أكسيداز GO، الاستجابة المناعية ضد السرطان، الأنديز، الـ DDT، Rifamycine — avec **17 consignes `official`** (7 cadrages restent `reconstructed`), barèmes imprimés 5/7/8 confirmés et verrou `tests/se-2019-recopy.test.mjs`. Les anciens thèmes (الاستنساخ، التنفس الخلوي، التكتونية) n'ont jamais été vus sur une page : ils ne doivent pas revenir.
- **2013–2026 SE** et **2013–2026 Maths (+ 2017 استثنائية)** : sujets chargés à la demande depuis `data/years/{se,m}/`, indexés par le catalogue `data/subjects.js`.
- **Consultation** : sujet officiel + تصحيح النموذجي via dzexams. Aucun
  barème, mot-clé ou réponse modèle : le moteur ne s'applique pas.
- **Maths 2022–2026** : viewer dzexams bloqué (`contentVerified: false`) ;
  Cartes encodées depuis les PDF officiels eddirasa (même papier ONEC).
- **SE 2021** : encodée en 4D le 2026-09-20 (prolongement de la décision 6 du propriétaire —
  `PROMPT_DECISIONS_PROPRIETAIRE.md`) à partir d'une extraction **Tesseract OCR (arabe)** des
  deux sujets officiels servis par l'application ; preuves brutes dans
  `scripts/extracted/SE/2021/`. Mesure du 2026-09-19 (`npm run pdftext:status`) : couche texte
  aux **chiffres corrompus** (barème lu « 05 / 40 / 00 » pour un barème réel 5+7+8, lui-même
  confirmé par OCR). 16 consignes officielles sur 24 tâches (les cadrages N/W restent
  `reconstructed`), notation `provisional` sans relecture humaine.
- **Maths 2013–2015 (+ 2017 استثنائية)** : encodées en 4D le 2026-09-20 (décision 6 du
  propriétaire — `PROMPT_DECISIONS_PROPRIETAIRE.md`) à partir d'une extraction **Tesseract
  OCR (arabe)** des PDF officiels ; preuves brutes (texte + JSON par page) dans
  `scripts/extracted/M/{2013,2014,2015,2017-exceptional}/`. Mesure du 2026-09-19
  (`npm run pdftext:status`) : 2013–2015 sont des **scans** sans couche texte ; la 2017
  استثنائية est **transposée**. La notation reste `provisional` (`scoringReviewStatus`) :
  les barèmes (10+10 ; 7+13 / 8+12) sont lus à l'OCR, sans relecture humaine.
- **Maths 2016–2020** : encodées en 4D le 2026-09-19 (commit `ac206be`, demande du
  propriétaire) — questions officielles, réponses modèles, mots-clés et barème 20 pts par
  sujet (2016 : 10+10 ; 2017 : 6+14 ; 2018 : 8+12 et 6+14 ; 2019 : 8+12 ; 2020 : 8+12),
  exactement le motif des millésimes 2021–2026.
- **باكالوريات أجنبية** (`foreign`) : ancien onglet « تقني رياضي ». La شعبة
  تقني رياضي n'a pas d'épreuve SVT au BAC et l'index dzexams n'a que `se` et
  `m` (revérifié 2026-08-31) ; l'onglet a été reconverti en espace pour des
  baccalauréats non algériens. Il est **volontairement vide** : aucune source
  étrangère vérifiée, **aucun lien inventé**. Les filières Lettres / Langues /
  Gestion n'ont pas non plus d'épreuve SVT — elles ne sont pas ajoutées.
- **2016 Maths exceptionnelle** : absente de l'index — `ARCHIVE.gaps`.
- **Aucun PDF d'archive versé** (droit d'auteur) — seule exception, assumée : les deux sujets
  officiels **SVT 2025** à la racine du dépôt. Ils sont servis sur demande et non précachés
  (voir la note « PDF versés dans le dépôt » plus haut).

---

## ⚡ PWA, cache et artefact de production

- `data/subjects.js` expose un catalogue léger ; `loadYear()` importe un seul module `data/years/**`, déduplique les requêtes concurrentes et ne mémorise que les payloads validés.
- `sw.js` précache uniquement le graphe statique nécessaire au shell. Le cache runtime accepte exclusivement les modules d'années répondant HTTP 200 et contourne les requêtes `Range`, et évince au-delà de 12 entrées. Les caches MIFTAH d'un ancien build sont nettoyés sans toucher ceux d'autres applications.
- **Lisibilité PDF (correctif du 2026-09-20)** : `pdfjs-dist` est vendé dans `assets/vendor/pdfjs/` avec ses **tables CMap** et **polices standard** (`npm run vendor:pdfjs`). Sans elles, les PDF arabes à polices CID et les polices non intégrées (Helvetica/Times) rendaient des glyphes manquants ou un texte illisible dans la visionneuse embarquée (42 des 58 sujets étaient touchés). `js/ui/pdf-renderer.js` passe désormais `cMapUrl`, `cMapPacked` et `standardFontDataUrl` à `getDocument()` ; ces ressources sont chargées à la demande, même origine, et suivent le build déterministe.
- `npm run build` calcule un identifiant de contenu, produit `dist/site/` et le monofichier, puis écrit `dist/site/release.json` avec la liste exacte des fichiers, octets et SHA-256. `npm run release:verify` refuse tout fichier ajouté, absent, altéré ou incohérent avec le build.
- L'observabilité reste locale : seulement des compteurs bornés par périmètre, noms d'erreurs autorisés, changements de connectivité et événements du service worker. Ni réponse élève, ni sujet, ni texte d'erreur, ni URL ne sont enregistrés.
- La procédure de déploiement atomique, les contrôles post-déploiement et le rollback sont documentés dans [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## 🧪 Tests

<!-- AUTO-METRICS:START -->

- Tests exécutés par `npm test` : **412** (comptage statique des `test()` déclarés dans `tests/*.test.mjs`, boucle `BENCHMARK_CASES` comprise)
- Copies vérifiées dans le hard benchmark : **0/4680 minimum** avant toute promotion numérique
- Inventaires de tâches officielles commencés : **58/58 sujets** (**576 tâches connues**)
- Sujets éligibles à la simulation : **58**
- Critères P1 fermés : **3/6** — statut global : **incomplet**
- Critères P2 fermés : **6/7** — élèves distincts testés : **0/5**
- Critères P3 fermés : **6/6** — statut global : **terminé**
- Taille de la façade UI (js/ui.js) : **441 lignes**

<!-- AUTO-METRICS:END -->

Ces valeurs sont régénérées par `npm run docs:update` et contrôlées par `npm run docs:check`. La CI exécute aussi les gardes de calibration/couverture, les statuts P1–P3, le build déterministe et la vérification exacte de `release.json` avant d'accepter l'artefact.

```bash
npm ci            # installe exactement le lockfile (jamais `npm install` : le lockfile est le contrat)
npm test          # moteur, banc BAC, intégrité, UI, hard-benchmark, service worker
npm run test:hard   # intégrité du pipeline de copies réelles
npm run calibration       # métriques moteur ↔ double correction humaine
npm run calibration:check # statut public synchronisé avec le corpus audité
npm run coverage:official # couverture connue et garde d'éligibilité simulation
npm run p1:status         # preuve détaillée des critères P1 fermés/bloqués
npm run p2:status         # preuves techniques et état des cinq élèves requis
npm run p3:check          # ferme les six gardes P3 ou échoue
npm run build             # génère dist/site/ + monofichier de façon déterministe
npm run release:verify    # vérifie contenu, octets, SHA-256 et identité du build
```

---

## 🧱 Pipeline de collecte de copies réelles (hard benchmark)

Le dossier `tests/hard-benchmark/` contient le pipeline pour ajouter des copies
d'élèves réelles au format `cases.json`.

### État du corpus vérifié

**0 copie vérifiée au 2026-08-26.** Un lot antérieur de 72 entrées a été retiré : il
ne contenait dans le dépôt ni scans anonymisés, ni manifeste de collecte, ni preuve
d'autorisation, ni trace permettant de vérifier que les deux annotations avaient été
produites indépendamment. Les libellés `correcteur-humain-A/B` et les noms de centres
étaient seulement des déclarations dans le JSON, pas des preuves auditables.

Le désaccord moyen affiché à `0,00` venait du fait que les deux notes de chacune des
72 entrées étaient identiques. Cela décrivait le fichier, mais ne démontrait ni
l'indépendance des corrections ni la fiabilité du moteur. Ces entrées ne sont donc
plus utilisées et `npm run calibration` doit annoncer le statut **non calibré**.

### Commande

```bash
node tests/hard-benchmark/import-copy.mjs
```

Le script accepte soit un fichier JSON en argument, soit un mode interactif.

### 5 étapes manuelles

1. **Scan** — scanner le sujet officiel et les copies d'élèves anonymisées.
2. **Anonymisation** — retirer nom/prénom/établissement/date de naissance.
3. **Transcription** — transcrire la réponse de l'élève mot pour mot.
4. **Double annotation indépendante** — deux correcteurs humains distincts attribuent chacun une note et une justification, sans voir l'avis de l'autre ; un troisième arbitre les écarts importants.
5. **Import** — lancer le script ci-dessus ; il refuse une annotation unique ou deux identifiants identiques, valide, génère l'ID, détecte les marqueurs LLM et écrit dans `cases.json`.

### Garde-fous

- Le test `data-integrity.test.mjs` échoue si une `source` contient des mots-clés
  synthétiques (`synthetic`, `généré`, `LLM`, `GPT`, `Claude`, `Gemini`, `chatbot`,
  `fabriqué`).
- `cases.json` est trié automatiquement par année/sujet/exercice/pôle.

---

## 💾 Fin de session et persistance

- **Fin manuelle ou expiration** : sauvegarde immédiate, passage de la session à `completed` et verrouillage de la saisie.
- **Progression sauvegardée** (`localStorage`) : réponses, année/sujet, écran, étape et chronomètres sont validés avant restauration.
- Les identifiants de sessions Maths (`YYYY-m`) sont conservés sans collision avec Sciences expérimentales.
- Le rapport chiffré et les exports CSV/JSON ont été **supprimés** du produit : l'épreuve est le seul mode, et aucune note n'est affichée tant que la calibration humaine n'est pas faite.

---

## 🔧 Ajouter une année / un sujet

Créer un payload `data/years/<filière>/year-<année>.js`, puis ajouter sa métadonnée et son import dynamique à la table `YEAR_CATALOG` de `data/subjects.js`. Pour les archives SE 2013–2019, `scripts/generate-archive-years.mjs` régénère directement ces payloads. Pour un exercice, déclarer notamment la règle d'évaluation :

```js
N: { points: 1, prompt: "…", minLength: 40,
     rule: { keywords: ["الادينوزين", "اليقظه"], minHits: 2, forbidden: ["بسبب"] } }
```

---

## 🧭 Version monofichier

`dist/boussole-4d-standalone.html` embarque le CSS et le bundle JS ; aucun PDF tiers n’est embarqué.
Il s'ouvre via `file://` sans enregistrer de service worker. Les PDF des autres années restent des liens externes optionnels, puisqu'ils ne sont pas redistribués dans le dépôt. Régénérer avec `npm run build`.
