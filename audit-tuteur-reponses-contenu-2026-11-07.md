# Audit qualité des réponses et du contenu — tuteur « Coach Capitaine » (المرشد الذكي)

**Date :** 2026-11-07 · **État audité :** `reorganisation-med` 8c1eac3 (build du jour,
`dist/` régénéré le 2026-11-07) · **Mode : audit, lecture seule — aucune
modification du code ni des données.**

**Périmètre :** le tuteur conversationnel (`AITutorView` + moteur
`src/smartTutorEngine.ts` + banques de contenu servis), sa focale étant
**qualité de réponse** (routage, fidélité, honnêteté, pédagogie, format) et
**qualité de contenu** (justesse scientifique, provenance, cohérence
inter-banques, vocabulaire). L'audit 2026-11-06 (`audit-coach-capitaine-2026-11-06.md`)
portait sur le **guide d'accompagnement** (invitation/prescription/relais) :
aucun recouvrement — celui-ci est le premier audit du tuteur lui-même.

---

## 0. Méthode, corpus et limites

**Méthode.** Trois instruments, tous sans modification du dépôt :

1. **Lecture du code** : cascade `processStudentInput` (smartTutorEngine.ts:2202),
   barèmes `SEUIL_SANS_DOMAINE = 28 / SEUIL_AVEC_DOMAINE = 12` (l.978-979),
   `meilleurExtrait` (l.1010-1032), `couperExtrait` + `SNIPPET_MAX = 400`
   (l.1075-1088), templates de réponse (l.1151, l.2669, l.2690, l.2754),
   aveu d'ignorance (l.2804-2833), API `answerTutorQuestion` (l.2836-2847).
2. **Batterie métrique exécutée** (fichier temporaire vitest, supprimé après
   mesure ; dump brut conservé : `tmp_audit_reponses_resultats.json`) :
   - **Batterie A — couverture** : les **214 titres uniques** du corpus leçons
     (JSON émis par le build, 578 chunks) × 2 phrasings (`اشرح لي X`,
     `ما معنى X؟`) = **428 questions** ; contrôle de fidélité = la source
     servie correspond-elle au titre demandé ?
   - **Batterie B — 15 pièges** : dialecte, fautes de frappe, pseudo-science,
     hors-programme (chimie/physique/autre matière), 3 sons hors-sujet
     officiels.
   - **Batterie C — ancrage des figures/vocabulaire** : présence de `38`,
     `ATP`, `ميلي فولت`, `الحمقلية`, `أمفوتيرية`, `التوافق المستحث`,
     `المفتاح والقفل` dans le corpus leçons vs les banques manuelles.
3. **Revue de contenu des banques curées** : `bookTutorQA.ts` (23 entrées,
    book_13 absent), `methodologyKnowledge.ts` (22 entrées, meth_16 absent),
    `smartBotData.ts` (12 fiches + quiz), `knowledgeCards.ts` (15 fiches
    legacy), `studyGuide.ts` (10 cartes).

**État d'exécution vérifié.** L'injection des bases est nécessaire au harnais
(les JSON leçons/opuscules ne sont chargés en production que par `fetch` depuis
`dist/`, `lessonIndexRuntime.ts:46-59` ; les tests de sondes officiels tournent
**bases dynamiques vides** — nuance importante pour interpréter le « 13/16 »
de `tutorAudit.harness.test.ts`).

**Non exécuté / non vérifiable :**
- **Évaluation selon le protocole de référence : non exécutée — protocole
  absent.** Le répertoire `references/` du skill n'existe pas dans ce dépôt ;
  seules les vérifications ad hoc listées ci-dessus ont été exécutées.
- `references/projets-et-preuves.md` (référence « pour étudier un tuteur ») :
  **absent** — signalé, son contenu n'a pas pu être comparé.
- Expérience élève réelle (latence perçue, lisibilité RTL sur Redmi/Samsung A,
  usage effectif des boutons de reformulation) : non mesurée.
- Validation pédagogique par enseignant : non exécutée (un test automatisé ne
  remplace pas ce verdict — la mesure servie reste purement lexicale).
- La fiche `study_planning` affiche « يثبّت الذاكرة 3 أضعاف القراءة المتكررة » :
  **promesse chiffrée non vérifiée à ce stade / non étayée par les sources
  consultées** (aucune source primaire datée dans le dépôt). Idem pour le
  profil d'Ebbinghaus invoqué.

---

## 1. Synthèse (ce qui est solide, ce qui n'est pas)

Le tuteur est un **extracteur citable**, pas un générateur : 100 % local
(aucun `fetch` réseau, aucune clé API — seul fetch = lecture de JSON propres
émis par le build, verrouillés par `tutorLeconsJson.lock.test.ts`), il ne
compose jamais de phrase : il **sert un fragment** d'un contenu validé (leçon
HTML, opuscule, fiche) ou **décrit honnêtement son échec** (« لم أجد », conf 20).
C'est architecturalement la formule la plus sûre contre l'hallucination — et la
mesure le confirme : **sur 443 interrogations, 0 réponse inventée ; sauf
exceptions de routage (§2.A), le contenu servi est le cours.**

Le problème n'est pas le contenu mais **le choix du fragment** : sur les 428
questions de la batterie de couverture, **53 % (226) sont servies avec autre
chose que la leçon demandée**, dont la grande masse est bénine (l'élève demandant
le « الدرس 3 » reçoit la fiche générale du même domaine), mais une partie
réelle est **hors domaine** (une question d'immunologie servis avec la
leçon mitochondrie ; une question d'enzymologie servis avec la carte
« الغوص » et sa question de rappel géologique — preuve §2.A).

## 2. Constats (constat + preuve + interprétation + limite + action)

### 🔴 A. Routes croisées hors domaine (le vrai défaut de contenu-servi)

**Constat.** Des questions du domaine X sont servies avec un fragment du
domaine Y, et une fiche hors programme (chimie) est servie avec un extrait de
respiration. Exemples mesurés (dump `tmp_audit_reponses_resultats.json`) :

| Question | Servi | Type | Conf |
|---|---|---|---|
| `اشرح لي ⭐ المنطقة المتغيرة (المتخصصة في المستضد)` (immunologie) | leçon « كيف يحرر الميتوكندرون الطاقة… » (métabolisme) | lesson | 55 |
| `اشرح لي نموذج التوافق المحرض (التداخل والتكامل البنيوي…)` (enzymologie) | fiche « الغوص (Subduction) » + question de rappel géologique | internal_card | **70** |
| `اشرح لي الدرس 5 : مصدر الأجسام المضادة` (immunologie) | fiche « التركيب الضوئي » | internal_card | 75 |
| `ما هو الجدول الدوري للعناصر؟` (chimie, hors programme) | leçon « المسار التجريبي للتنفس… » | lesson | 55 |

**Preuves.** `smartTutorEngine.ts` : `meilleurExtrait` (l.1010-1032) applique
la discipline de domaine **uniquement quand le domaine de la question est
établi** (`domaineProbable`) ; sans signal (`hasDomainSignal`, appelé l.2791),
le barème bas `SEUIL_SANS_DOMAINE = 28` s'applique — une correspondance
28-39 suffit, affichée conf 55 (bande basse de `confianceDepuisScore`,
l.1035-1040). Les routes croisées à conf 70-75 proviennent du matching des
**mots-clés de fiches** (`scoreChunk` l.868-898 : alias +60, mot-clé +6,
bonus domaine) : « التكامل/التوافق », « مصدر », « سلاسل » sont multi-domaines.
Le test de fidélité `tutorFideliteDomaine.test.ts` retient l'invariant
« jamais un extrait d'un autre chapitre » **mais sans couvrir ces formulations**.

**Interprétation.** Le savoir-faire R6 (du 14/10/2026) qui a supprimé le
« moins mauvais extrait » a mal arrêté la génération des mauvais segments, mais
pas le segment 28-39 sans domaine ni les alias poly-sémiques des fiches. La
conf affichée (55) est honnête sur le fond lexical, mais l'élève reçoit quand
même du contenu du VENT mauvais chapitre — et dans le cas de la fiche
subduction, une **question de rappel hors sujet** (`🧠 صح أم خطأ: غوص…`)
aggrave l'effet pédagogique en recadrant l'élève à un sujet non demandé.

**Limite.** 226 « infidélités » mesurées comprennent les cas bénins
(fiche du même domaine plus générale que le titre demandé) : la
sévérité exacte (nombre croisé réel) n'est pas consolidée ; l'inventaire
qualitatif ci-dessus en montre au moins 4 francs.

**Action priorisée (tranche proposable, non exécutée).** Refuser plutôt que
tromper : quand le domaine de la question est établi mais que le meilleur extrait
est d'un autre domaine **et** que le score < 40 (bande à conf 55),
décliner vers l'aveu d'ignorance nommant le domaine (le mécanisme existe
déjà, l.2804-2833). Verrou proposé : réusage de `tutorFideliteDomaine.test.ts`
avec ces 4 formulations comme banc. Périmètre : `meilleurExtrait` + banc de
tests — pas de données ni d'UI.

### 🔴 B. Provenance des banques curées : chaîne fragile

**Constat.** Les sources citées par les banques manuelles ne tiennent pas
toutes la route de la traçabilité :

- `bookTutorQA.ts` : `sourceBook: 'PROGRAMME NATIONAL SVT CLAUDE OPUS.MD'`
  (7 entrées à ce libellé) — le fichier réel en dépôt est
  `uploads_externes/PROGRAMME NATIONAL SVT CLAUDE OPUS - Copie.MD` (620 Ko) :
  nom affichant explicitement le modèle IA qui a produit le résumé. **Aucune
  validation par source officielle datée (ONEC/ministère) n'est attestée dans
  le dépôt.** Contenu marqué « académie → programme national SVT » sans
  référence d'ouvrage officielle vérifiable à ce stade.
- `methodologyKnowledge.ts` : `sourceBook: 'LIVRE MANHADJIYA.md'` pour les
  22 entrées — **ce fichier n'existe pas** dans la partie produit
  (aucun `*MANHADJIYA*` trouvé). Provenance invérifiable dans l'état audité.
- `book_1`..`book_12` citent `'كتاب العلوم - اكرام بوزار'` → correspond à
  `uploads_externes/504601676-كتاب-العلوم-للطالبة-اكرام-بوزار.txt` (existe).
- `'FINALBAC_VOLUME_1.txt' / ’_2.txt'` existent aussi dans `uploads_externes/`.
- Le fichier constaté « الكتاب_المصحح_v1.0.md » (283 Ko) se déclare
  « مصحّح ... وفق الكتاب الرسمي (PDF المدرسي) » — auto-déclaration, non
  contresignée par une source primaire datée.

**Interprétation.** Rien dans les banques n'invente de chiffre officiel
(l'app évite la date du Bac, les poids, les échelles — règle 1 du dépôt) ;
le risque est le **libellé de source** qui surestame la garantie : afficher
« PROGRAMME NATIONAL SVT » pour un document d'origine IA est un libellé
trompeur pour un enseignant qui aurait à valider le contenu. Les réponses de
la banque livre (23) sont, sur lecture humaine, scientifiquement saines
(transcription 3′→5′/5′→3′, يوم كالفن, بنيوف, EL-2, braila...) — c'est la
**chaîne de provenance**, pas la matière, qui est en faute.

**Limite.** La revue humaine scientifique détaillée des 23+22+12+15 entrées
n'a pas été opérée intégralement — les extraits cités §3.C ont des
précisions à vérifier avec un enseignant.

**Action priorisée.** Renommer les libellés de `sourceBook` pour des valeurs
factuals (factuel : « résumé IA vérifié vs. livre scanné — en attente de
validation humaine »), et consigner dans `docs/agents/SOURCES.md` le statut
de chaque fichier `uploads_externes/`. Avant publication élargie : passe de
validation par enseignant de la banque livre (23 entrées) — c'est la seule
barrière qu'un extracteur local ne peut pas se substituer.

### 🟡 C. Effondrement de granularité sur les 12 fiches (servi « assez »)

**Constat.** Sur batterie A : **226/428 (52,8 %)** questions dont la fidélité
échoue, dont **111 servies avec conf ≥ 85** — quasi tous écho vers les
12 fiches `smartBotData` : demander « الدرس 3 : استنساخ المعلومات الوراثية »
(à 578 chunks leçons disponibles, y compris ciblés) et recevoir la fiche
générique « تركيب البروتين » (conf 85-92), « 1. ما هو الإنزيم المسؤول حصريا
عن عملية استنساخ الـ ARNm ؟ » → fiche « النشاط الإنزيمي » (conf 92) complémentaire.

**Preuves.** `scoreChunk` : titre contenu dans la question = +80 → le
**titre court** d'une fiche gagne contre un extrait leçon même quand
l'extrait est plus précis ; les fiches portent des alias très
larges (p. ex. `'بروتين'`, `'مصدر'`, `'كثافة'`). Le override `type 'lesson'`
n'a pas de pondération supérieure aux fiches.

**Interprétation.** Il n'y a pas un « faux » servi mais une régression de
précision : l'élève questionnant fin reçoit l'entrée générique. Constat
particulièrement sensible dans le couplage avec la fiche étant suivie d'une
**question de rappel** qui évalue l'élève sur la fiche, pas sur sa question.

**Action priorisée.** Injection de la leçon demandée quand un titre de chunk
matché exactement (+80) existe : privilégier la leçon (protection
« deep-link R5 `lessonKey` » déjà connue), réserver la fiche aux questions
génériques ou inconnues des leçons. Mesure cible : taux de fidélité (ci-dessus)
publié comme métrique de l'audit, retrancable sur la même batterie.

### 🟡 D. Troncatures : 31 % des réponses coupées à 400 caractères

**Constat.** Dans les 443 interrogations : **134 réponses tronquées**
(dont 132/428 sur batterie A, 30,8 %), marquées « … ». Les extraits tronqués
échantillonnés restent **coupés à une fin de phrase/virgule** (génération
`couperExtrait` l.1077-1088, fin > max×0.5 remontée sinon coupe dure) —
pas de coupure mi-mot, la correction F10 du 2026-09-26 fait son travail.

**Interprétation.** C'est la moins mauvaise des troncatures possibles, mais
pour des questions de figures (« بيريدوتيت مماه عند 800°C », « العتبة 70 mV »,
la casse du glycolyse), l'information sollicitée peut tomber **après** la coupe. Le deep-link
« رابط الدرس الكامل » existe dans le moteur (`lessonKey/lessonKind`,
l.345-347) mais pas de bouton « الرسم الكامل » dans la bulle d'extrait
(vérifié `AITutorView.test.tsx` : `tutor-sources` l.445-460).

**Action priorisée.** Dans la bulle d'extrait tronqué, terminer par un bouton
« عرض الدرس الكامل » (deep-link déjà implémenté), et privilégier des extraits
de la coupe selon la distance du titre dans le fragment courant.

### 🟡 E. Incohérences internes entre banques (mineures mais réelles)

1. **Modèle d'enzymologie divergent** : fiche `enzyme_activity`
   (« نموذج المفتاح والقفل ») vs bookTutorQA `_كتاب_14` (« التوافق المستحث »).
   Ancrage existant différent : le corpus leçons contient `المفتاح والقفل`
   (1×) et **jamais** `التوافق المستحث` — le corpus local ne soutient que le
   premier. Deux réponses possibles pour la même question selon le chemin
   lexical suivi. Unifier d'abord avec le libellé du corpus, ajouter le
   2ᵉ modèle en mention si besoin.
2. **Chiffres d'ATP variables** dans la **même** fiche :
   `cellular_respiration` micro-answers « حوالي 34 ATP » (فسفرة), « 36-38 »
   (comparaison), « نحو 38 » (banque livre verbatim via triggers 2026-08-29).
   Le corpus leçons utilise bel et bien « 38 » (18 occurrences de `38`,
   227 de `ATP`) — mais trois barèmes coexistent dans une même fiche pour
   la même physiologie.
3. **Doublon de rédaction** fiche `enzyme_activity` shortAnswer:
   « … إلى تفكيك بنيته (تفكيك) وفقدان وظيفته » — parenthèse redondante qui
   lit comme un accident de collation.
4. **Terme orphelin** : banque livre book_4/la sonde fondent la notion sur
   « الخاصية الحمقلية » — ce terme **n'existe pas dans le corpus leçons**
   (0 occurrence) ; le corpus porte « أمفوتيرية » (1×) et « الشحنة » (16×).
   Le tuteur enseigne donc un mot-clé que le cours de l'app n'utilise pas.
5. **Valeur non ancrée** : book_19 « كمون راحة سالب داخل الليف (حوالي 70-
   ميلي فولت) » — aucune occurrence de `فولت`/`ميلي فولت` dans le corpus
   leçons (0/0). Valeur standard de la littérature mais **non étayée par les
   sources locales** à ce stade.
6. Cosmétique : gaps d'id `book_13`, `meth_16` (22 entrées numérotées 1-24) ;
   libellé `sourceBook: 'كتاب العلوم - اكرام بوزار'` orthographié au feuillet.

**Action priorisée.** Tranche de « normalisation inter-banques » : 1) fiche
enzyme (doublon + modèle), 2) alignement `الحمقلية` → terminologie du corpus
(`الخاصية الأمفوتيرية` + les deux fonctions حمضية/قاعدية), 3) un chiffre ATP
unique par fiche (préférence « 38 » = corpus). Verrou : réusage des tests
existants (`tutorQuizIntegrity` en = assert textuel des banques curées).

### 🟢 F. Points forts vérifiés (à ne pas casser)

1. **Localité absolue** : aucun appel réseau, aucune clé API ; le seul
   fetch sert des JSON **générés** par le build depuis les fichiers sources
   (`tutorLeconsJson.lock.test.ts`, 578 leçons / 428 opuscules).
2. **Aucun contenu inventé** : l'extracteur ne paraphrase pas la leçon ; les
   micro-réponses ajoutées v4b sont marquées « VERBATIM du corpus » avec
   références (commentaire `smartBotData.ts:112-115, 197-200, 325-328`).
3. **Aveu d'ignorance assumé et nommé** (« لم أجد في دروسي نصًّا… » +
   domaine + suggestions, l.2804-2833) ; hors-programme détecté avec le bon
   message (`من هو ميسي؟`, `كيف أطبخ الكسكس؟` : conf 0, message conforme).
4. **Pédagogie socratique réelle** : sonde avant contenu (`probe` 11
   fiches), événement trappeur « اشرح لي » journalisé (`probeBypassed`),
   question de rappel notée. C'est la pièce la plus différentiente du tuteur.
5. **Confiance dérivée du score** (55→92) plutôt qu'une valeur d'affiche,
   barème à deux barèmes justifié par la population mesurée (commentaire
   R6 14/10/2026, l.956-977).
6. **Méthodologie à 22 entrées** complète, فصحى, avec `triggers` mesurés au
   moteur (historique des audits externes v4 documenté en commentaires).
7. **Intégrité du quiz** : payload sans `correctIndex` (blind-check),
   mélange seedé — `tutorQuizIntegrity.test.ts`.

## 3. Mesures consolidées

| Mesure | Valeur | Instrument |
|---|---|---|
| Batterie A : couverture (servie / posées) | 428/428 (100 %) — aucune igno ni HS sur les titres du corpus | dump résultats |
| Batterie A : fidélité pure (source servie = titre demandé) | **202/428 (47,2 %)** | idem |
| Batterie A : infidélités dont conf ≥ 85 (collapse fiches) | 226 ; dont 111 | idem |
| Batterie B : conformité attendue | 11/15 — dont **1 faux-accept réel** (`الجدول الدوري`) et 3 écarts d'attente discutables | idem |
| Troncatures (réponses avec « … ») | 134/443 (30,2 %) — coupures respectant les fins de clauses | idem |
| Confiance servie (moyenne / distribution) | 82,5 ; 55:8 · 65:29 · 70:39 · 75:47 · 85:201 · 92:106 · 95:6 | idem |
| Longueur moyenne d'une réponse servie | 477 caractères | idem |
| Ancrage corpus : `38` ATP | 18 occurrences dans les leçons (banque alignée) ; `ATP` 227 | grep dist JSON |
| Ancrage corpus : `الحمقلية` / `فولت` | **0 / 0** — termes de banques sans ancrage local | grep dist JSON |
| Ancrage corpus : `المفتاح والقفل` vs `التوافق المستحث` | 1 / 0 — le corpus local ne soutien que le premier | grep dist JSON |

**Limite de la méthode :** la batterie A interroge avec les titres du corpus
— ce sont des formulations « connues par construction » ; un élève réel peut
poser des questions plus éloignées (batterie B seule le couvre partiellement,
15 items). Le taux de fidélité 47 % est donc une **borne optimiste** (cas le
plus favorable), pas une mesure d'expérience élève (instrument à définir avant
publication de tout chiffre « qualité »).

## 4. Recommandations priorisées (aucune exécutée)

| # | Sévérité | Recommandation | Périmètre | Effort est. |
|---|---|---|---|---|
| 1 | 🔴 | Sous le barème 28-39 sans domaine de question fiable, décliner vers l'aveu d'ignorance nommant le domaine (le mécanisme existe, l.2804-2833) ; banc = les 4 formulations §2.A | `meilleurExtrait` + banc | < 1 j |
| 2 | 🔴 | Requalifier les libellés `sourceBook` (destats factuels + « en attente de validation humaine ») et consigner `uploads_externes/` dans `docs/agents/SOURCES.md` | banques + doc | < 1 j |
| 3 | 🟠 | Privilégier le chunk leçon exact (+80 titre) sur la fiche générique quand ils co-supér ; métrique cible = taux de fidélité §3 | `scoreChunk`/ordre de rang | 1 j |
| 4 | 🟡 | Normalisation inter-banques : doublon `(تفكيك)`, modèle enzyme (aligner sur le corpus puis mentionner le 2ᵉ), `الحمقلية` → `الخاصية الأمفوتيرية` + fonctions, un chiffre ATP par fiche, valorisation du 2ᵉ modèle en note | 2 banques curées | 0,5-1 j |
| 5 | 🟡 | Bouton « عرض الدرس الكامل » (deep-link R5 `lessonKey` déjà prêt) dans la bulle d'extrait tronqué | `AITutorView` | < 1 j |
| 6 | 🟢 | Passe enseignant de validation de la banque livre (23 entrées) avant élargissement ; marquer fiche `study_planning` « 3 أضعاف » comme affirme non vérifiée | banques | 0,5 j + revue |
| 7 | 🟢 | Gaps `book_13`/`meth_16` : ou renuméroter ou consommer les ids (cosmétique, opportunité de nommage des prochains ajouts) | banques | —

Numérotation indépendante de l'audit 2026-11-06 (qui portait sur le guide) —
aucune reco n'invente de contenu officiel, aucune ne modifie les règles
protégées du correcteur, aucune ne touche un fichier protégé sans GO
(`AITutorView` n'y figure pas).

## 5. Verdict

**Contenu :** la matière servie est honnête, locale, citable, et — sur
l'ensemble lu — scientifique solide pour la 3AS. Les résidus de contenu se
jouent sur: un libellé de source qui surestame la garantie (banque livre à
une origine IA avouée par le nom d'un modèle), deux termes non ancrés au
corpus (`الحمقلية`, la valeur 70 mV), et des différences intra-fiche sur les
chiffres d'ATP.

**Réponse :** le moteur sait dire « je ne trouve pas » et reste 100 % local —
c'est la base éthique propre ; sa qualité de routage est en dessous de sa
qualité de contenu (53 % de service non-identitaire, quelques routes croisées
hors domaine, une fausse acceptation limpide hors-programme à l'étude).
Priorité : **resserrer le refus** (reco 1) et **lever la précision** (reco 3),
plus qu'ajouter des contenus.

**Note de confiance de l'audit :** méthode pourvue en mesures exécutées et
citées ; les cinétiques des réponses (fidélité/troncature/confiance) sont
reproductibles avec le dump joint (`tmp_audit_reponses_resultats.json`,
443 interrogations) et les mêmes sources de build. Les jugements scientifiques
humains (banque livre) restent à valider par un enseignant : c'est la seule
partie non automatisable.

---

## 6. État après correction (2026-11-07, GO propriétaire — toutes les tranches)

### Ce qui a été corrigé

| # | Reco | État | Preuve |
|---|------|------|--------|
| 1 | Refus bande 28-39 sans domaine | ✅ `meilleurExtrait` refuse sous 40 pts sans preuve forte (titre littéral/alias ou ≥ 2 mots-clés) ; sinon aveu d'ignorance nommant le domaine | banc T4 (mesure pré-code : 214/214 titres préservés, 0 refus collatéral ; `الجدول الدوري` refusé) ; tests verrou `tutorFideliteDomaine` verts |
| 2 | Provenance `sourceBook` | ✅ Libellés requalifiés (résumé IA « en attente de validation humaine », origine non tracée) + inventaire `uploads_externes/` dans `docs/agents/SOURCES.md` | fichiers édités sans régression (tsc 0, vitest/jest verts) |
| 3 | Privilégier leçon exacte sur fiche faible | ✅ `buildAnswer` évalue l'extrait avant la fiche ; la leçon préempte uniquement si `score_leçon > score_fiche` | simulation T4 : 1 seule déviation résiduelle (fiche 266 > leçon 170, règle respectée) |
| 4 | Normalisation inter-banques | ✅ enzyme : doublon `(تفكيك)` retiré, modèle `التوافق المحرض` nommé (corpus), note du 2ᵉ modèle ; ATP unifié vers `نحو 38` (corpus), `36-38` éliminé | verrou `tutorBanquesContenu.lock.test.ts` 7/7 |
| 4 | `الحمقلية` (constat inversé) | ✅ Non orphelin : ancré dans `okacha.ts` l.197-201, `hosila.ts` l.83, opuscule officiel ` chunk_376` — banc gelé en l'état | `book_4` inchangé |
| 4 | 70 mV (book_18) | ✅ Gelé tel quel (zéro ancrage local `فولت = 0`) | verrou gelé, décision GO |
| 7 | Gaps `book_13`/`meth_16` | ✅ Renumérotation ascendante : banques 1-23 sans trou, sans consommateur externe | vérification programmatique des ids |
| 5 | Bouton « عرض الدرس complet » | ✅ `AITutorView` affiche le bouton sur toute source `lesson` (deep-link `onOuvrirLeconDuCoach` existant, App.tsx inchangé) | `SourceRef` étendu (`lessonKey`/`lessonKind`/`unitId`), `types.ts` mis à jour |

### Ce qui reste ouvert (non corrigé, non exécutable par l'agent)

- **Reco 6 — passe enseignant de la banque livre** (23 entrées `bookTutorQA`) : validation humaine requise avant élargissement ; fiche `study_planning` (« يثبّت الذاكرة 3 أضعاف ») marquée « affirmé non vérifié ».
- **Troncatures** (reco non listée au §4, constat §2.D) : 31 % des réponses coupées à 400 car., coupures propres (fin de clause, F10 respecté) — le bouton « عرض الدرس complet » atténue, pas de suppression de la coupure.

### Fichiers touchés (aucun fichier protégé du dépôt)

`src/data/smartBotData.ts` · `src/utils/__tests__/tutorBanquesContenu.lock.test.ts` (nouveau) · `src/smartTutorEngine.ts` · `src/types.ts` · `src/components/AITutorView.tsx` · `src/bookTutorQA.ts` · `src/methodologyKnowledge.ts` · `src/knowledgeCards.ts` · `docs/agents/SOURCES.md`.

### Chaîne verte finale (après T1-T5)

| Étape | Résultat |
|---|---|
| `npm run lint` (tsc) | 0 erreur |
| `npx vitest run` | 344 fichiers / 3 951 tests — 100 % vert |
| `npx jest` | 335 suites / 3 887 tests — 100 % vert |
| `npm run build` | exit 0 (warnings préexistants uniquement) |

*Aucun commit n'a été effectué : le dépôt reste sur `8c1eac3` (branche `reorganisation-med`). Le rapport et les changements sont en attente de présentation au owner pour commit.*

---

*Ce rapport a été produit en lecture seule du dépôt. Aucune donnée élève
n'a été lue ni stockée (batteries sans session persistée, dump local).*
*Rapport non committé par défaut : à commiter sur présentation au owner.*
