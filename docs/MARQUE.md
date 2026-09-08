# MARQUE — كنز العلوم × مفتاح المنهجية

> **Document de décision — source unique de la marque.**
> Si un fichier de code diverge de ce document, c'est le code qui doit être corrigé.
> Le garde-fou `npm run check:miftah` (CI) prouve la cohérence `fiche ↔ spec ↔ carte`.
> Date de la décision : 2026-09-06.

---

## 1. La décision (actée)

**L'arme est le SVT BAC, et c'est tout.**

- La phrase-récit ne promet aucune matière.
- La transversalité **démontrée** = entre les 23 chapitres du SVT : « la même clé ouvre
  chaque salle » est prouvable aujourd'hui (méthode appliquée aux 23 leçons existantes).
  Ce n'est plus une hypothèse inter-matières, c'est un fait de produit.
- Le multi-matières **sort du récit** et vit ici, tel quel :

  > **À terme** : la même clé ouvrira d'autres salles (physique, maths) — à la condition
  > que la méthode soit validée avec un autre corps professoral.

  Pas de date, pas de promesse, une condition.

## 2. Le récit — une phrase, partout, jamais reformulée

**كنز العلوم يُفتح بمفتاح المنهجية**

| Élément du récit | Traduction produit (scope SVT BAC) |
|---|---|
| Le coffre (الكنز) | Le programme SVT BAC entier : 23 leçons, QCM, cartes, exercices |
| Les salles du coffre (غرف الكنز) | Les chapitres du programme SVT — une salle par chapitre |
| La clé (المفتاح) | La méthode : 4 étapes, 2 portes — valable sur chaque question du bac SVT |
| Le porteur de clé (حامل المفتاح) | Badge — drill maîtrisé |
| Le gardien du trésor (أمين الكنز) | Badge excellence |

**Phrase de positionnement** (cible : l'élève qui connaît le cours mais perd les points —
pas l'élève qui cherche du contenu) :

**المقرر موجود عندك. المفتاح يحوّله إلى نقاط.**

Elle ne sur-promet rien et nomme exactement la douleur que le produit traite.

## 3. Le nom — verrouillé

| Rang | Nom | Où | Règle |
|---|---|---|---|
| Officiel | **مفتاح المنهجية** | documents légaux / CGU, argumentaire prof-parent | jamais abrégé |
| Usage | **المفتاح** | UI, bouche de l'élève, copie d'examen | jamais autre chose |

**Variantes interdites dans l'UI** : le latin « MIFTAH » / « MIFTAH+ » comme nom,
« مفتاح الكنز » comme nom (expression poétique tolérée en interne, jamais en position
de nom — plus affichée dans l'UI depuis 2026-09-06).

**Clause de sauvegarde** (3 lignes, à recopier en fin de CGU et dans tout argumentaire) :

> المنهجية = la promesse,
> jamais la version figée.
> Le contenu de la clé peut évoluer.

## 4. Règle unique de placement

> **المفتاح partout où l'élève agit. مفتاح المنهجية partout où la marque se présente.
> Jamais les deux au même endroit.**

Exception documentée : **l'en-tête de la fiche imprimable** — nom d'usage en grand
(🔑 المفتاح) + nom officiel en petit (sous-titre), car la fiche est le support sur
lequel la marque se présente *à travers* l'action.

## 5. Tableau de placement (statut code au 2026-09-06)

| Emplacement | Ce qu'on écrit | Code ? |
|---|---|---|
| Nom de domaine / App Store | كنز العلوم — مفتاح المنهجية | ☐ au lancement |
| Titre de l'app (sous l'icône) | المفتاح | ☐ au lancement |
| Icône de l'app | Symbole clé (pas de texte) — 4 dents comptables | ☐ |
| Page d'accueil (hero) | Phrase-récit complète | ☐ au lancement (§7) |
| Splash screen | Phrase-récit | ☐ au lancement (§7) |
| Bio App Store / réseaux | Phrase-récit | ☐ au lancement |
| Bouton principal du menu | المفتاح | ☐ au lancement |
| **En-tête fiche imprimable** | 🔑 المفتاح (sous-titre petit : مفتاح المنهجية) | ✅ fait 2026-09-06 |
| **Copie d'examen de l'élève** | **RIEN — jamais aucun nom** | ✅ (aucun nom présent) |
| Argumentaire prof/parent | «نطبّق منهجية الإجابة الرسمية ضمن مفتاح ميكانيكي بسيط» | ☐ au lancement |
| Bouton du drill quotidien | شحذ المفتاح | ✅ (tab + section ك) |
| Niveau avancé / extension | المفتاح+ | ✅ fait 2026-09-06 |
| Badge niveau 1 (drill réussi) | حامل المفتاح | ☐ au lancement |
| Badge niveau expert | أمين الكنز | ☐ au lancement |
| Footer fiche (recto + verso) | مفتاح المنهجية · كنز العلوم | ✅ fait 2026-09-06 |

## 6. Identité visuelle (mécanique, pas artistique)

- Couleur dominante = **or/doré** (présent dans la fiche — à trancher : l'or réservé au
  « + » ou assumé décoratif → décision §8 b).
- Icône clé = **4 dents visibles et comptables** (1 dent = 1 étape) — le SVG de la
  fiche le fait déjà.
- **Aucun emoji dans les titres imprimables** (tofu à l'impression) → SVG / vectoriel.
  ⚠️ La fiche v3.1 actuelle contient des emojis (🔑 🧬 🚪 📷 🎬 🧠 📄 📝 📊 🧫🧱) :
  à traiter avant impression série (décision §8 e).
- Deux portes différenciées par **motif**, pas seulement couleur (accessibilité + N&B).

## 7. Ordre de mise en œuvre (ne pas paralléliser)

1. ✅ Nom verrouillé (§3) — ce document, 2026-09-06
2. ✅ Phrase-récit validée (§2) — figée dans `miftahSpec.ts` (`NARRATIVE_AR`)
3. ✅ Fiche corrigée + renommée — HTML, carte React et spec synchronisés 2026-09-06
4. ⏳ Test 5 puis 10 élèves sur la version corrigée (rappel du nom + phrase-récit, 24 h)
5. ⏳ Identité visuelle appliquée à l'app (§6)
6. ⏳ Placement complet (§5) au lancement public

## 8. Ce que la décision ne ferme PAS (en attente de l'owner)

| # | Décision | Question exacte |
|---|---|---|
| a | **Deuil de Boussole** | Date de retrait du « legacy en repli » de l'UI (outil unique, nom unique). |
| b | **L'or** | Règle écrite : l'or est réservé au « + » (base en teal) — OU or décoratif assumé et « clé dorée » retiré du nom du tier. Les deux ensemble = incohérent. |
| c | **Le badge** | ✅ **Décidé (D1, 2026-09-06)** — حامل المفتاح = drill 12/12 sur 3 jours distincts · أمين الكنز = noyau stable sur 3 types de questions différents (= déblocage du verso). |
| d | **Test utilisateurs** | ✅ **Protocole prêt (D3, 2026-09-06)** — §11 D3 ; à exécuter par l'owner (étape 4 de l'ordre §7). |
| e | **Emojis imprimables** | Supprimer les emojis des titres imprimables (tofu A4) — avec la prochaine refonte de fiche. |
| f | **`استنتج` (scoreur)** | ✅ **Décidé (D2, 2026-09-06)** — le moteur suit la fiche (استنتج = 🎬 فيلم, 1→2→3→4). Implémentation code PENDING (spec §11 D2) — **prérequis de la Phase 1**. |

## 9. Sources de vérité dans le code

| Fichier | Rôle |
|---|---|
| `src/data/miftahSpec.ts` | Source unique : noms, phrase-récit, positionnement, footers, erreurs, nomenclature |
| `public/miftah.html` | La fiche imprimable A4 recto/verso (statique, zéro JS) |
| `src/components/MiftahCard.tsx` | La carte in-app — rend depuis les constantes de la spec (footers, erreurs) |
| `src/data/methodologyEngine.ts` | Ré-exporte la spec ; porte le moteur des 12 verbes (⚠️ point f) |
| `scripts/check-miftah.ts` + `ci.yml` | Garde-fou de cohérence marque (job CI) |
| `src/data/v3Progress.ts` | Le déverrouillage 12/12 × 3 du مفتاح+ (la promesse de la carte est vraie) |

## 10. Bugs corrigés avec le renommage (2026-09-06)

1. **Débordement A4** — bloc print resserré (corps 10.4 px, interlignage 1.58, marges et
   paddings réduits, SVG clé 168×58) : le recto, enrichi de 3 nouveaux blocs, doit tenir
   sur UNE page. ⚠️ À valider par une vraie impression avant diffusion.
2. **« السنّ 0 » → « القفل »** — une clé n'a pas de « 0ᵉ dent » : l'étape 0 (اِفهم) est
   le قفل que la clé ouvre. Nomenclature spec : `qafal`.
3. **Erreurs 1-2-3 remontées au recto** — les trois erreurs de base (numéro, unité,
   xatima) accompagnent tout le monde dès le jour 1 ; 4-5 (formes avancées) restent
   sur le verso. Numérotation continue (`<ol start="4">`).

## 11. Décisions actées — bilan de l'audit « apprendre le مفتاح dans l'app » (2026-09-06)

Bilan complet : `docs/AUDIT_APPROCHE_APP.md`. Trois décisions sont actées ci-dessous.
**D1 et D2 sont implémentées en code (2026-09-06)** ; D3 est prêt à exécuter par l'owner.

### D1 — Sémantique du 12/12 ×3 + cibles de déblocage (audit §3.1 + §3.2)

- **Sémantique** : 12/12 sur **3 jours distincts** (pas « consécutifs »). Un échec **allonge
  l'intervalle** (J+1) **sans remettre le compteur à zéro** — le streak-reset actuel est le plus
  punitif et va à l'encontre de la logique d'espacement du plan pédagogique.
- **Cibles** : le 12/12 × 3 jours débloque **la Phase 2 (écriture guidée) + la badge
  « حامل المفتاح »**. Le **verso (المفتاح+)** n'est publié qu'après **noyau stable sur 3 types de
  questions différents** (= la badge « أمين الكنز »).
- **Fait (texte)** : fiche ك (`public/miftah.html` + `MiftahCard.tsx`) + `miftahSpec.ts`
  (`DRILL.goal`, `UNLOCK_RULE`) — verrouillé par `check:miftah`.
- **✅ Implémenté (code, 2026-09-06)** : `src/data/v3Progress.ts` — jours distincts
  (`applyDrillResult`, échec → intervalle +1 j, pas de reset) ; verso débloqué à 3 types
  maîtrisés (`recordTypeMastery` = stage 4 au seuil `passIcmThreshold`) ; flag legacy
  grandfatheré ; badges. Tests : `src/utils/__tests__/v3ProgressD1.test.ts` (16 tests).

### D2 — `استنتج` : le moteur suit la fiche (prérequis Phase 1)

- **Décision** : استنتج = 🎬 **فيلم** (parcours 1→2→3→4, la dent 3 = lien causal est requise).
- **Justification** : le contenu de l'app l'exige — les 20+ prompts « استنتج لماذا / معنى / دور »
  d'`activeLessons.ts` demandent une réponse raisonnée, et le propre `goodExample` de la carte
  moteur (« عن طريق تخريب بنيته الفراغية ») contient déjà un mécanisme causal. Le moteur (carte
  `verb_deduce_v1` classée `descriptive`, parcours 1→4) est l'outlier : tel quel, il sanctionnerait
  (`premature_interpretation`) exactement ce que le bac récompense. **La fiche ne change pas ;
  le moteur change.**
- **✅ Implémenté (code, 2026-09-06), spec d'implémentation** :
  1. `src/data/methodologyEngine.ts` — carte `verb_deduce_v1` : `category` descriptive →
     reasoned ; `VERB_V2_META.verb_deduce_v1` : `step3Mode:'explain'`, `path:[1,2,3,4]`,
     `typicalErrorTag:'unsupported_claim'`, `stepMap` à 4 entrées (longueur = `structureSteps`,
     qui devient 4 — ajouter la step du lien) ; `goodExample` ré-annoté sur 4 étapes si la
     suite de tests l'exige (connecteur causal explicite).
  2. `src/lib/validation/verbMapping.ts` — entrée `استنتج` : `synthesize`/loiFocus 5/
     `['TEXT_STRUCTURE']` → `interpret`/loiFocus 3/`['CAUSAL','LEVELS']` (aligné sur فسر).
  3. **Vérification** : invariants v2 (mode DEV) + `tests/boussole.test.ts` (boucle 12 verbes)
     + `npm run test:vitest` (verbMapping / practiceContextMapping).
- **État** : fiche, moteur (`verb_deduce_v1` + `VERB_V2_META` + scoreur + `verbMapping` +
  gabarits Boussole) alignés sur le film 1→2→3→4 — la fiche reste la référence.

### D3 — Protocole du test utilisateurs (10 élèves) — prêt à exécuter

- **But** : (1) rappel du nom d'usage + phrase-récit ; (2) valider les 12 consignes du drill
  **avant** production du pool ≥ 50 ; (3) vérifier que le drill mesure la règle, pas la
  mémorisation des 12 items.
- **Échantillon** : 10 élèves de bac SVT (3 en difficulté / 4 moyens / 3 « excellence »),
  20 min avec un enseignant. Données **agrégées** uniquement (pas de classement individuel).
- **T0 (20 min)** : (a) fiche montrée 1 min · (b) l'enseignant lit 1× le bloc ك + les 2 portes ·
  (c) drill des 12 consignes (4 exemples de la fiche + 8 tirées de la banque) — noter score/temps
  · (d) prononcer 1× la phrase-récit + le nom d'usage.
- **T+24 h (5 min, sans la fiche)** : ① « ما اسم المنهجية؟ » (attendu : المفتاح) ·
  ② reformuler la phrase-récit · ③ les 4 dents dans l'ordre · ④ classifier 3 consignes
  nouvelles (ورقة/رأس + صورة/فيلم) · ⑤ question libre : « ما أول ما تفعله قبل كتابة الإجابة؟ »
- **Seuils de décision** :

| Mesure | Seuil | Sinon |
|---|---|---|
| Nom d'usage rappelé | ≥ 8/10 | renommer ou re-tester le nom |
| Phrase-récit (± 1 mot) | ≥ 7/10 | alléger la phrase |
| 4 dents à T+24 h | 10/10 | renforcer l'animation Phase 0 |
| Drill T0 (moyenne) | ≥ 9/12 | réécrire les consignes |
| Classification T+24 h | ≥ 2/3 chez ≥ 8/10 | le drill n'automatise pas encore |
| T+24 h ≥ T0 sur les mêmes items | — | **mémorisation d'items → produire le pool ≥ 50 avant la Phase 1** |

- **Lien avec D1** : le test utilise la sémantique « 3 jours distincts » — les consignes du
  drill tournent d'un jour à l'autre (pas les mêmes 12 deux jours de suite).

### Ordre de dépendances (avant tout code moteur)

| # | Action | Statut 2026-09-06 |
|---|---|---|
| 0 | D1 — textes fiche + spec + garde-fou + code `v3Progress` | ✅ fait (textes + code) |
| 1 | D2 — `استنتج` (code) | ✅ fait — **prérequis Phase 1 levé** |
| 2 | D3 — test 10 élèves | ⏳ exécution par l'owner — valide les consignes avant le pool ≥ 50 |
| 3 | Builds app (Phase 0 → 4, mode examen) | ✅ **base §12 appliquée (3 portes + dents)** — suite : `docs/AUDIT_APPROCHE_APP.md` §6 |

## 12. Update 2026-09-06 — trois portes + nouveaux noms des dents (décision owner, validée sur BAC 2025)

**Contexte :** sur les deux sujets BAC SVT 2025 (2 sujets complets + corrigés officiels), chaque
question reliée à un verbe montre **trois familles**, pas deux. La 3e famille (بناء/ابتكار :
*اقترح، برر، ناقض، قدّم حلا*) apparaît **6 fois** sur ces deux sujets uniquement — presque toujours
porteuse de la note la plus discriminante (pas de réponse unique attendue). Le modèle 2 portes
l'écrasait dans « فيلم ». Le cas mixte (*«ومعلوماتك / ومكتسباتك»*) est la **norme** des questions
ouvertes, pas l'exception — il a désormais sa propre porte.

### 12.1 Les 3 portes (cascade, progressive disclosure)

| # | Porte | Question | Issues |
|---|---|---|---|
| 1 | 🚪 **بوابة الوجود** | قفل أصلا؟ (وثيقة؟) | 🔒 قفل / 🧠 لا قفل (⇒ دُرج المعرفة, fin de cascade) |
| 2 | 📥 **بوابة المصدر** | من أين مادة الإدخال؟ | 📄 وثيقة فقط (1 colonne) / 📄+🧠 مختلط (2 colonnes `[من الوثيقة \| من معلوماتي]`) |
| 3 | ⚙️ **بوابة الحركة** | أي حركة يطلب هذا القفل؟ | 📷 الصورة (حلل، صِف، استخرج، قارن) / 🎬 الفيلم (اشرح، فسر، اربط، بيّن آلية) / **🔨 الحدّاد** (اقترح، برر، ناقض، قدّم حلا) |

**🔨 الحدّاد** = la motion manquante : le verbe n'a pas de clé prête — **il la fabrique**.
L'élève doit *manufacturer* une réponse logique (hypothèse / proposition / recommandation) à
partir de données dispersées — jamais « décrire » ni « expliquer » quand on lui demande d'« inventer ».

| La dent | 📷 الصورة | 🎬 الفيلم | 🔨 الحدّاد |
|---|---|---|---|
| 🔍 تَبَصَّر | الفعل: وصفي | الفعل: تفسيري | الفعل: إنشائي (لا جواب واحد) |
| 🔑 أدخل | من الوثيقة فقط | وثيقة + معلومات | **كل المعطيات المتاحة**، دون استثناء |
| 🔄 أدر | **مُتجاوَزة** | ربط عادي (سبب موجود) | **تصنيع**: دمج معطيات متفرقة في منطق جديد |
| 🔓 افتح | ملاحظة/استنتاج بسيط | استنتاج يفسّر «لماذا» | **المنتَج المُصنَّع**: فرضية/اقتراح/توصية، مبرَّر منطقيا |

### 12.2 Les 4 dents renommées — le nom change, le geste ne change pas

Chaque dent nomme désormais **le geste physique qu'on fait avec une clé** :

| # | 🔒 Ancien | 🔑 Nouveau | Le geste | Ce qu'on y fait (inchangé) |
|---|---|---|---|---|
| 1 | اِقْرَأْ | **🔍 تَبَصَّر** | Je reconnais la forme du verrou | Entourer le verbe, souligner les mots-clés |
| 2 | اِجْمَعْ | **🔑 أدخل** | J'insère la clé dans la serrure | Extraire données/chiffres/unités du document |
| 3 | اِرْبِطْ | **🔄 أدر** | Je tourne la clé | Lier la donnée à la mécanique du cours |
| 4 | اِخْتِمْ | **🔓 افتح** | La serrure s'ouvre | La phrase de conclusion |

**Phrase-mnémotechnique unique (figée, `KEY_MNEMONIC_AR`) :**
> **تَبَصَّر · أدخل · أدر · افتح — أربع حركات، لا أكثر، وينفتح القفل.**

**Note enseignant :** le contenu pédagogique de chaque dent reste identique — un élève déjà formé
à l'ancien vocabulaire s'adapte en une session grâce au tableau ci-dessus.

### 12.3 Conséquences actées dans le build (2026-09-06)

- **Moteur** : `detectExistenceGate` / `detectSourceKind` / `detectMovement` / `getGateCascade` ;
  chaque carte verbe porte son `movement` (`verb_hypothesis_v1` = **smith** — l'angle mort corrigé).
- **Verdict Phase 2** : 4 pastilles — الوجود / المصدر / الحركة / البنية (ICM ≥ 60 sans erreur typique).
- **Drill** : tri à **3 issues** sur la porte 3 + détection `ومعلوماتك/ومكتسباتك` sur la porte 2 ;
  banque 69 items (12 🔨 : 3 items réels BAC 2025 + variantes ; 🔨 ≈ 21% des قفل — cible 25-30%).
- **Vue** : cascade 🚪→📥→⚙️ en stage 3 (progressive disclosure, neutre, jamais d'avance) ;
  دُرج direct sur « لا قفل » ; Phase 0 = 6 démos sur les 3 issues.
- **Fiche + carte** : dents renommées, 3 portes, mnémonique — garde-fou `check:miftah` §12 (anciens noms bannis).
- **D3** : le protocole (10 élèves) s'applique **avec les nouveaux noms** — le test n'ayant pas encore
  d'exécution, aucune re-test de noms n'est due. « 4 dents à T+24 h » reste valable (4 dents, 4 nouveaux noms).

## 12bis. Addendum 2026-09-07 — carte imprimée « 2 portes + famille », noyau 10→11, dent 1 = تَبَصَّر

**Déclencheur :** critique post-livraison (09-07) — 2 constats vérifiés dans les fichiers + 1 argument de catégorie :

1. **Catégorie** : une porte répond « d'où vient la matière ? », une famille répond « que produis-je ? ». Faire de حدّad une 3e case de décision est une impureté de catégorie au niveau imprimable. Données BAC 2025 : **12/12** items حدّad ont un قفل — la fabrication monte toujours sur un document, elle n'ouvre jamais un autre trajet d'entrée.
2. **Collision (vérifiée dans le produit)** : la dent تعرّف ↔ le verbe عَرِّفْ (`verb_define_v1` + drill m01/m02 « عرّف الإنزيم / المناعة النوعية » + démo Phase 0 affichée sur le même écran) — à un point près, un piège structurel.
3. **Noyau** : le « 10 » gelé avait été maintenu en gonflant le périmètre (note enseignant : « 10 éléments (les 3 بوابات y sont) »). Le re-compte honnête donne **11**. Le chiffre est dégelé explicitement.

### Décisions (09-07)

| # | Décision | Raison |
|---|---|---|
| 1 | **Carte imprimée (recto) = 2 portes de décision + ligne « عائلتي »** (📷/🎬/🔨 = reconnaissance, pas décision — non comptée, convention de l'ancien switch) | Sous stress, l'élève décide 2 fois ; la famille se regarde |
| 2 | **L'app garde ses 3 portes** (drill, cascade stage 3, verdict 4 pastilles) | Instrument d'entraînement et de mesure : sans lui, la confusion اشرح/اقترح ne serait visible qu'à la cotation (tardive, diffuse) |
| 3 | **حدّad = 3e forme spéciale au verso** (à côté de الحساب / شجرة النسب : 2 = toutes les données, 3 = fabrication, 4 = produit justifié) | Cohérent v3 (habillage des 4 mêmes dents), coût mémoire nul pour le faible |
| 4 | **Noyau 10 → 11, dégelé et écrit** (+1 = porte du المصدر ; la ligne famille non comptée). Note enseignant + table des niveaux (11 / ≈14 / ≈18) | Le chiffre gelé était maintenu en gonflant le périmètre — on l'enterre explicitement |
| 5 | **Dent 1 : تعرّف → تَبَصَّر** (les 3 autres noms et la structure de la mnémonique restent) | Collision عَرِّفْ vérifiée. Critère du nom : zéro homonyme dans les 12 cartes verbes + zéro verbe d'examen standard + geste physique. Alternative écartée : أمسك (geste plus faible) |

### Arbitre — D3 (exécution owner, 10 élèves), 2 métriques ajoutées

- **(a) Récitation du modèle carte en 10 s** (le test de transmission) : si échec → la carte devient plus simple encore (famille masquée, 2 portes seules).
- **(b) Score sur les 3 questions حدّad réelles 2025 vs corrigé officiel** : si bas → le soubassement 2ب 🔨 (أدر+افتch ensemble, 7b) passe devant tout le reste.

### En attente
- Vérification collision finale de تَبَصَّر contre les 2 sujets 2025 complets (non présents dans le workspace — à livrer par l'owner).
- Réconciliation examen 60 min → 4h30 (7b) — après D3, pas avant.

## §12ter — Annexe PRO (addendum 2026-09-07)

**Décision (owner « GO ») :** la fiche gagne une **3e page** — « **المفتاح PRO** » (annexe), dans `public/miftah.html` + `MiftahCard.tsx`, **distribuée sur demande uniquement**, profil « يستهدف الامتياز » seulement. Version fiche **3.1 → 3.2**.

**Origine (tracée) :** 4 éléments récupérés de la **dérivée interne** « المفتاح PRO » (10 pages, générée par IA, auditée le 09-07 : zéro barème, nom de matière erroné « علوم الطبيعة والحياة » = la série, pas la matière, marque non contrôlée). Réécrits **sous la marque** et **reliés au barème** — chaque section porte sa case 📝 المصحح, ce que la dérivée n'avait pas.

### Contenu (lettres suite de la carte : ذ، ر، س)

| Section | Contenu | Barème (case 📝) |
|---|---|---|
| **ذ — قوة الكلام = قوة الدليل** | Table 5 niveaux de langue selon la force de la preuve + **règle rouge de causalité** (« X يسبب Y » interdit sans design expérimental) | Mبالغة الخاتمة (cause sans design) = point de compréhension perdu, même conclusion scientifiquement juste |
| **ر — التجربة : 4 أسئلة** | Variable manipulée / mesurée / témoin / constant + formule « تغيير واحد + قياس واحد + شاهد + شروط ثابتة » | Question d'expérience sans variable manipulée + témoin = ½ point |
| **س — الفرضية : تصنيع يُختبَر** | Template « نقترح أن … لأن … + اختبار + شاهد » + 4 contrôles (élimination de l'alternative) | Hypothèse sans mécanisme = ½ ; hypothèse non testable (sans témoin/affect) = 0 — fabrication ≠ vœu (écho حدّad verso) |

### Règles

- **Nom** : « **المفتاح PRO** » = nom d'usage + étiquette d'extension `PRO` (autorisée dans l'annexe uniquement — ≠ `MIFTAH` latin verrouillé, ≠ « مفتاح الكنز »).
- **Matière** : « علوم الحياة والأرض » — le nom de série est **banni** (garde-fou check:miftah, anti-régression sur l'erreur de la dérivée).
- **Noyau** : niveau amritat **≈18 → ≈21** (+ ذ، ر، س) dans la table des niveaux (fiche + spec `LEVELS`).
- **Parité** : contenu centralisé dans `miftahSpec.ts` (`ANNEXE`, `FOOTER_ANNEXE_AR`, `MIFTAH_ANNEXE_AR`) ; la carte React rend depuis les constantes, la fiche HTML porte les chaînes identiques ; bloc §12ter dans `check-miftah`.

### Réparations de parité incluses (constatées pendant l'implémentation)

1. **Footer recto** : « (10 عناصر) » → « (11 عنصرًا) » — contradiction interne corrigée (note enseignant et table disaient déjà 11).
2. **`LEVELS` spec obsolète** (10 / ≈13 / ≈17) → alignée sur la fiche (11 / ≈14 / ≈21).
3. **`SPECIAL_FORMS` spec sans الحدّاد** → entrée `hamad` ajoutée (source unique ; l'import dans la vue compilateur est mort — non rendu, pas de changement d'affichage app).

## §12quater — v3.3 : collision close + import V4.1 au niveau contenu (2026-09-07)

### A. Verdict de collision — DÉCISION CLOSE (sujets BAC 2025 réels, les 2 sujets)

Transcription au workspace : `uploads/bac2025-svt-sciences-experimentales.txt` (owner, 09-07).

| Test | Résultat |
|---|---|
| تَبَصَّر (toutes formes) dans les instructions des 2 sujets | **0 occurrence** → renommage validé |
| Ancient nom تعرّف | **Instruction réelle** (M2-E1-1 « تعرّف على المركبات A–D' ») → la collision qui a motivé le renommage du 09-07 existait bel et bien |
| أدخل / أدر / افتح comme instructions | 0 occurrence — les 4 noms de dents sont propres face à l'examen réel |

**Décision 5 du §12bis est close : تَبَصَّر reste la dent 1.** Veto owner sur le nom : non exercé à ce jour.

### B. Validation par l'examen 2025 (les chiffres qui comptent)

- **Cycle حدّad = 08/20 = 40 % de chaque sujet** (exercice 3 des deux sujets : اقترح فرضية → تأكد/ناقش → قدم/وضّح). Cible banque smith 25–30 % : validée, urgente.
- **« ومعلوماتك/ومعارفك » (source mixte) dans 8 des 15 instructions** → la décision 2 colonnes (بوابة 2 : مختلط) est validée par le réel.
- **Le barème note le LIEN (الربط) séparément** (0.5–1.0/question) → la dent 3 (أدر) est le cœur de l'examen → justifie la route + formule dorée importées en (C).
- **Barème = points par élément scientifique** (0.25/0.5/1.0) + tolérances explicites (« يقبل أي فرضية وجيهة », « كل طريقة تؤدي إلى نفس النتيجة ») + aucune règle « numéro = 0 » → voir (E) : le ton des cases 📝 passe en v3.4.

### C. Import V4.1 — au niveau CONTENU, pas en pages

| Actif V4.1 | Disposition v3.3 |
|---|---|
| 1. حدّad en 3 phases | **Intégré** : ligne ح = `2 = البيانات · 3 = المعالجة · 4 = المنتج حسب التعليمة` (fiche + carte + spec) |
| 2. Route dent 3 + الصيغة الذهبية | **Intégré** : section ز (verso), 1 ligne — le pont document ↔ leçon |
| 3. قوة العبارة = قوة الدليل | **Déjà dans l'annexe** (ذ) — l'analyse externe le redécouvrait sans le savoir |
| 4. المخطط + test « لأنّ » | **Reporté** (espace A4). Validé par l'examen (2 instructions « وضّح في مخطط ») — candidat v3.4 |

**« 2 pages » (fusion annexe → verso) : REJETÉ — calcul physique.** Verso ≈ pleine page par design (calibré 10.4 px) + annexe ≈ pleine page = 72–80 lignes vs ≈ 44 lignes/page A4 (marges 8 mm, corps 10.4 px, interlignage 1.58) → débordement en page 4. L'imprimable = le produit : on ne livre pas une page 4 à 3 lignes. **La structure 3 pages v3.2 est conservée** ; si l'owner exige 2 pages, il doit nommer l'élément verrouillé à couper (refusé de trancher seul).

### D. Audit de l'analyse externe (celle jointe au sujet 09-07)

L'analyse lit une version **pré-annexe** (elle nomme les dents « Observer/Extraire/Traiter/Conclure » — ni nos noms ni V4.1) :
- **~50 % redécouverte de l'annexe v3.2** (règle de causalité, force de la preuve, 4 questions d'expérience, hiérarchie 4 niveaux) — elle était déjà écrite, dans la page 3.
- **~25 % neuf et valable** → v3.4 : enrichissement dent 2 recto (conditions + variable étudiée/mesurée + témoin), « تتكرر في كل سؤال » explicite (keynote V4.1), la démarche en cycle (7b).
- **~15 % correction acceptée** : le ton « loi du barème » des cases 📝 — le vrai barème 2025 = par élément + tolérances → v3.4.
- **~10 % mauvaise lecture** : « étape RELier manquante » — c'est la dent 3 (أدر), elle existe.
- **Rejeté** : renommer les dents (le check collision vient de prouver les 4 noms propres face au réel) ; l'architecture 5 niveaux → 7b (la carte reste un outil de secours, pas une théorie générale).

### E. v3.4 — en attente de GO

1. Dent 2 recto enrichie : `+ الشروط + المتغيّر المدروس/المقاس + الشاهد إن وُجد` (boîte V4.1, validée par l'examen).
2. « تتكرر في كل سؤال » — ajoutée au mnémonique figé (trace de décision requise, décision 5 §12bis).
3. Ton 📝 : « lois » → « ce que le mصحح retranche réellement » (barème 2025 = éléments + tolérances ; la numérotation reste une règle de présentation, pas de notation).
4. Section المخطط (2 instructions d'examen réelles « وضّح في مخطط ») — place à trouver selon l'espace.

### F. Réparations

- Header recto HTML **v3.1 → v3.3** : bug hérité de 489715b (l'édition du header recto n'avait pas pris — le check `must(html, 'v3.2')` était satisfait par le header verso ; le garde-fou vérifie maintenant la version par header).
