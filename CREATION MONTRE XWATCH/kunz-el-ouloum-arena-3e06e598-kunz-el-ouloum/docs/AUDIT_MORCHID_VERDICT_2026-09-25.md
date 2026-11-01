# Audit de l'audit Morchid — vérification des allégations B1–B8 + erreurs scientifiques

**Date :** 2026-09-25
**Objet :** Rapport d'audit déposé sur le tuteur « المرشد الذكي » (version auditée `18fcf9c5`)
**Base de vérification :** HEAD courant `583b77b` (3 commits plus récent que la version auditée : patch 6, R5, Fable-5)
**Méthode :** lecture du code + **vérification empirique par script** (`scripts/verify_morchid_audit.ts`, `scripts/verify_b2_negation.ts`, exécutés sous `npx tsx`) — aucun verdict reposant sur la seule lecture.

---

## Verdict synthétique

| # | Allégation | Verdict | Gravité |
|---|---|---|---|
| B1 | Mission quotidienne non résolvable + scoring inter-quiz (`prot_q2`) | **FAUX / OBSOLÈTE** | — |
| B2 | Note BAC /10 ignore la négation (10/10 pour une réponse niant tout) | **VRAI — confirmé** | Majeure |
| B3 | « الباك » → carte du noyau terrestre (sous-chaîne « لب ») | **VRAI — confirmé** | Mineure |
| B4 | Sélection du domaine 2 mais QCM du domaine 1 | **FAUX / OBSOLÈTE** | — |
| B5 | L'accueil efface erreurs/XP et permet de re-gagner | **PARTIELLEMENT VRAI** | Moyenne |
| B6 | Tentative 0-XP non journalisée + décompte faux de 1 | **PARTIELLEMENT VRAI** | Mineure |
| B7 | Erreurs obsolètes + « اختبرني » jamais exécuté | **VRAI — confirmé** | Moyenne |
| B8 | Dernier QCM encore cliquable après la fin | **FAUX / OBSOLÈTE** | — |
| S1 | Ondes S « traversent » le noyau (preuve de liquidité) | **VRAI — confirmé** | Majeure |
| S2 | Zone d'ombre des ondes P niée dans la situation BAC | **VRAI — confirmé** | Moyenne |
| S3 | « la vitesse augmente avec la densité » | **PARTIELLEMENT VRAI** | Mineure |
| S4 | AUG → « منيل » au lieu de « ميثيونين » | **VRAI — confirmé** | Majeure |
| S5 | Rôle de l'ARNt erroné | **NON CONFIRMÉ (faux)** | — |
| S6 | Oxymore « انفراج (تقارب متباعد) » | **VRAI — confirmé** | Mineure |
| S7 | « فيغوص الصهر » (la fonte s'enfonce au lieu de monter) | **VRAI — confirmé** | Mineure |
| S8 | « الوشام » au lieu de « الوشاح » | **VRAI — confirmé** | Mineure |

**Bilan : 8 allégations de bugs → 3 vraies, 2 partiellement vraies, 3 fausses/obsolètes.**
**8 allégations scientifiques → 6 vraies, 1 partielle, 1 non confirmée.**

**Note de fiabilité du rapport audité : 6,5/10.** Un tiers des bugs allégués avaient déjà été corrigés
(B1, B4, B8 correspondent aux correctifs B0–B10 et B5 de l'audit Morchid précédent, intégrés avant
`18fcf9c5` ou entre `18fcf9c5` et `583b77b`) et une allégation scientifique (S5) est infondée — les
données décrivent correctement l'ARNt. En revanche, les allégations scientifiques avérées (S1, S2, S4)
sont des erreurs factuelles réelles qui devaient être corrigées.

---

## Détail des verdicts — bugs

### B1 — Mission quotidienne non résolvable + scoring inter-quiz — FAUX / OBSOLÈTE

**Lecture du code :** `getDailyMission` (smartTutorEngine.ts:822-855) choisit `session.mistakes[0]`,
sinon la 1re carte du domaine actif, sinon `KNOWLEDGE_CARDS[0]`, puis `pickRandomQuizForTopic(card.domainId, card.id)`.

**Vérification empirique :**
- La mission sur une session vide produit bien un QCM (`لماذا نستعمل اليوراسيل المشع في تجربة تتبع ARNm؟`) — résolvable.
- 1 carte (`study_planning`, domaine 0) n'a aucun QCM avec `topicId === card.id`. **Mais cette carte est inatteignable** : aucun QCM n'a `topicId === 'study_planning'` (topicIds effectifs : `protein_synthesis, enzyme_activity, immune_response, nervous_communication, seismic_waves, earth_structure, lithosphere_asthenosphere, subduction`), donc elle ne peut jamais devenir une erreur ni une cible de mission.
- **Scoring inter-quiz :** `shuffledView()` est **déterministe** (seed FNV-1a sur `q.id`). Prompt affiché et correction utilisent *strictement le même* ordre — vérifié sur `prot_q2` (`prompt/correction identiques = true`). Le bug décrit (B5 de l'audit précédent, « la correction voyage dans le payload ») est déjà corrigé.

### B2 — La note BAC /10 ignore la négation — VRAI (majeure)

**Lecture :** `gradeKeyPoints` (smartTutorEngine.ts:588-606) calcule `coverage = hits / expected.size`
par recouvrement de tokens, **sans aucun traitement de la négation**.

**Vérification empirique (scenario `boss1_q1`, domaine 1) :**
- Réponse niant EXPLICITEMENT chaque point-clé : *« لا، ليس صحيحاً أن CMH/HLA يعرض المستضدات… »* → **note 10/10**
- Reprise exacte des points-clés (réponse correcte) → **note 10/10**
- Moitié niée, moitié reprise → **note 10/10**

Une réponse qui affirme le contraire de la correction obtient la note maximale : la barrière
« il suffit de recopier les mots-clés en les niant » est complètement perméable. Le seul garde-fou
existant est « لا أعرف » → 0.

### B3 — « الباك » renvoie la carte du noyau terrestre — VRAI (mineure)

**Vérification empirique :**
- `findBestKnowledgeCard('الباك', null)` → **`بنية الكرة الأرضية` (domaine 3)**
- `processStudentInput(sessionVide, 'الباك')` → *« 🧩 **بنية الكرة الأرضية** تتكون الأرض من قشرة… »*

**Cause :** la carte `earth_structure` a le mot-clé **`لب`** (smartBotData.ts:254) ; le matching se fait
par `norm.includes(nk)` (smartTutorEngine.ts:423 et 472). Or `«الباك»` normalisé contient la sous-chaîne
`لب` (positions 1-2) → 1 *keyword hit* → `contentScore = 8` ≥ seuil 8 → carte retenue avec confiance 70 %.
Tout mot contenant `لب` (`الباك`, `البكالوريا`, `اللباب`…) est détourné vers la tectonique.

### B4 — Sélection du domaine 2 mais QCM du domaine 1 — FAUX / OBSOLÈTE

**Vérification empirique :**
- `handleDomainClick(session, 2)` → `activeDomainId = 2` ✓
- `startDiagnostic` → premier QCM `ene_q1` (`أين تتم المرحلة الكيميوضوئية…`), domaine 2 ✓
- Aucun QCM avec `domainId !== 2` dans la banque du domaine 2.

`getQuestionsForDomain(domainId)` est indexée par domaine et cohérente (23/23/20 questions).
Déjà corrigé (REC #1 de l'audit précédent).

### B5 — L'accueil efface erreurs et XP — PARTIELLEMENT VRAI (moyenne)

**Vérification empirique :** deux chemins « retour à l'accueil », comportements **différents** :

| Chemin | erreurs (`mistakes`) | `completedBac` |
|---|---|---|
| Saisie texte *« القائمة الرئيسية »* (moteur, smartTutorEngine.ts:666-670) | **préservées** ✓ | **effacées** ✗ |
| Bouton de parcours *« القائمة الرئيسية »* (AITutorView.tsx:151-168, `resetSession()`) | **effacées** ✗ | **effacées** ✗ |

- La partie « l'accueil efface les erreurs » est **vraie pour le bouton**, fausse pour la saisie texte (le moteur préserve `mistakes`).
- Surtout, **l'anti-farm `completedBac` est systématiquement effacé** : après un défi BAC, un simple retour à l'accueil permet de **le re-jouer pour regagner l'XP** (le garde-fou ajouté en REC #4 devient contournable). C'est la partie réelle et actuelle de l'allégation.

### B6 — Tentative 0-XP non journalisée + décompte faux — PARTIELLEMENT VRAI (mineure)

- **Décompte : FAUX / obsolète.** `totalQuestions = questions.length` et le texte annonce le bon nombre. Vérifié : domaine 1 = 23, domaine 2 = 23, domaine 3 = 20 (total 66). L'annonce *« أجب عن N سؤالاً »* est exacte.
- **0-XP non journalisé : VRAI.** AITutorView.tsx:103 n'appelle `onXPGained` que si `xpGained > 0`. Un quiz terminé à 0 bonnes réponses (`xpGained = 0 × 10 = 0`) n'est **jamais** remonté au tableau de bord enseignant (file `/api/student/sync`), alors que `handleTutorXPGained` (App.tsx:394) l'accepterait (`total = 23 > 0`). L'activité existe mais reste invisible dans le suivi.

### B7 — Erreurs obsolètes + « اختبرني » jamais exécuté — VRAI (moyenne)

**Vérification empirique :**
- `processStudentInput(sessionDom3, 'اختبرني في الغوص')` → **AUCUN quiz** ; réponse = carte de cours *« 🧩 الغوص (Subduction)… »*
- `processStudentInput(sessionDom1, 'اختبرني في الاستنساخ')` → **AUCUN quiz** ; réponse = carte *« 🧩 تركيب البروتين… »*

Le bouton promet un **test** (« اختبرني » = « teste-moi ») mais déclenche un **cours**.
Aucun handler n'intercepte cette intention : elle tombe dans la recherche sémantique de cartes.

**Seconde partie (« erreurs obsolètes ») :** les `mistakes` ne sont **jamais retirées** — `recordQuizAnswer`
(sessionManager.ts:125-158) ne fait qu'empiler. Aucune boucle de remédiation : une lacune identifiée
reste affichée à vie dans *« راجع أخطائي السابقة »*, même après y avoir répondu correctement.

### B8 — Dernier QCM encore cliquable après la fin — FAUX / OBSOLÈTE

AITutorView.tsx:289-327 : `disabled = (msg.id !== lastQuizMsgId)` — seuls les boutons du **dernier**
message-quiz sont activés ; les anciens sont grisés (`cursor-not-allowed`, `opacity-60`) avec le
libellé *« تمت الإجابة »*. Déjà corrigé (allégation « anti-contamination audit B5 »).

---

## Détail des verdicts — erreurs scientifiques

| # | Localisation | Contenu actuel | Verdict |
|---|---|---|---|
| S1 | smartBotData.ts:253 | *« مرور موجات S عبر اللب يثبت أن اللب الخارجي سائل »* | **Faux.** Les ondes S **ne traversent pas** le noyau externe : elles sont absorbées à la discontinuité de Gutenberg (2900 km). La preuve de la liquidité est leur **disparition**, pas leur passage. Contradiction interne : la micro-réponse de la même carte (l.259) dit correctement *« اختفاء الموجات… »*, de même que la carte `seismic_waves` (l.273). |
| S2 | smartBotData.ts:1542 | Situation BAC : *« سجّلت محطات زلزالية وصول موجات P لجميع المناطق »* | **Faux.** Il existe une zone d'ombre pour P entre 103° et 143° (la carte elle-même la décrit correctement en l.287). La situation contredit sa propre base de cours. La correction (l.1544) reconduit l'erreur (*« فتصل للجميع »*). |
| S3 | smartBotData.ts:273, 283, 1544, 1549 | *« سرعة الموجات تزداد بازدياد كثافة الوسط »* | **Partiellement exact.** Physiquement v = √(μ/ρ) : à rigidité constante, une densité *plus élevée* abaisserait la vitesse. Ce qui augmente la vitesse, c'est la **croissance combinée de la rigidité (الصلابة/التماسك) et de la densité** avec la profondeur. À noter : `tect_q16` (l.1314/1320) dit *« كثافة وتماسك »* — correct. Il faut aligner les autres occurrences. |
| S4 | smartBotData.ts:77, 453, 459, 1391 | *« الكودون AUG … يرمز للمنيل »* | **Faux.** La méthionine se dit **« ميثيونين »** (Methionine). « منيل » n'est pas un mot arabe ; c'est une troncation. Présent dans 4 emplacements (cours, option de QCM `prot_q5`, explication, erreur courante). |
| S5 | smartBotData.ts:77, 436, 444, 1388, 1390 | Rôle de l'ARNt | **Non confirmé.** Toutes les occurrences sont correctes : *« ARNt يحمل الحمض الأميني الخاص به ويلتحم بالكودون على ARNm بواسطة الكودون المضاد »* (anticodon explicitement nommé). L'allégation ne tient pas. |
| S6 | smartBotData.ts:1222 | *« ماذا يحدث عند انفراج (تقارب متباعد) صفيحتين؟ »* | **Oxymore.** الانفراج = divergence ; التقارب = convergence. « تقارب متباعد » est auto-contradictoire. La bonne glose est « تباعد ». |
| S7 | smartBotData.ts:1335 | *« ينخفض الضغط فيغوص الصهر جزئياً … ويرتفع مكوناً قشرة جديدة »* | **Faux.** La fonte **monte** (densité moindre) ; elle ne s'enfonce pas. Le texte se contredit même (*« فيغوص »* puis *« ويرتفع »*). |
| S8 | smartBotData.ts:1275, 1344, 1350, 1426, 1430, 1438 | *« الوشام »* | **Faux (orthographe).** Le manteau = **الوشاح** (déjà correct en l.253, 301, 1572…). 6 occurrences fautives. Note : l.1344 contient en prime un doublon *« احتكاك واحتكاك الصفيحة الغائرة بالوشام »*. |

---

## Points forts du rapport audité

- Les erreurs scientifiques majeures (S1 ondes S, S4 méthionine, S2 zone d'ombre) sont **réelles, faciles à vérifier et importantes pédagogiquement** — un élève préparant le Bac doit recevoir des énoncés scientifiquement exacts.
- Identification correcte de la cause technique de B3 (matching par sous-chaîne sur mot-clé court).
- Bonne intuition sur B6 (journalisation des tentatives nulles).

## Faiblesses du rapport audité

- **3 bugs sur 8 sont déjà corrigés** dans la version auditée ou entre `18fcf9c5` et `583b77b` (B1, B4, B8) : le rapport ne mentionne pas les correctifs B0–B10 de l'audit précédent.
- **Une erreur scientifique sur huit est infondée** (S5, rôle de l'ARNt).
- Les numéros de ligne sont ceux de `18fcf9c5` — décalés en HEAD (ex. la « zone d'ombre P » pointée l.1510-1512 est en réalité la situation `boss3_q1` en l.1542).
- **B5 est sous-évalué** : le rapport parle d'erreurs/XP effacés, mais le vrai problème actuel est l'effacement de l'anti-farm `completedBac`, qui rouvre le farm d'XP.

## Recommandations (appliquées dans le commit correctif)

1. **B2** — détecter la négation atomique avant un point-clé dans `gradeKeyPoints` ; un point nié n'est pas couvert.
2. **B3** — matching des mots-clés/alias par **mot entier** (frontières de lettres arabes + tolérance de l'article « ال »).
3. **B5** — préserver `completedBac` (et `mistakes`, `lastMissionDate`) au retour à l'accueil ; unifier les deux chemins (bouton = moteur).
4. **B6** — journaliser toute activité terminée, y compris à 0 XP (`onXPGained` appelé dès qu'un reward existe).
5. **B7** — « اختبرني (في X) » lance un QCM du sujet ciblé ; les erreurs sont **retirées** quand l'élève y répond correctement (boucle de remédiation).
6. **S1/S2/S3/S4/S6/S7/S8** — corrections de contenu dans `smartBotData.ts` (S5 non touché : correct).
