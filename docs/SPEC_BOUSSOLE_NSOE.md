# 🧭 SPEC — BOUSSOLE v2 (بوصلة الإجابة · 4 خطوات + مفتاح واحد)

> **Source** : audit v1 (NSOE) → refonte v2, `boussole_svt_v2.html` (conception validée).
> **Update 2026-09-06 (MARQUE §12)** : les 4 étapes = les 4 dents du المفتاح — noms alignés : اِقْرَأْ→**🔍 تَبَصَّر** · اِجْمَعْ→**🔑 أدخل** · اِرْبِطْ→**🔄 أدر** · اِخْتِمْ→**🔓 افتح** (le geste, les questions, les templates et les couleurs sont inchangés).
> **Principe** : une méthode d'examen doit être plus petite que la panique — la v2 ne demande
> que **8 éléments** à mémoriser (contre ~40 en v1). **Aucune modification du moteur de score.**
> Cible : app « كنز العلوم » (Vite + React 19 + TS, UI 100 % arabe RTL, offline, localStorage).

---

## 1) La méthode en 30 secondes

**4 étapes dans un ordre irréversible** (on ne conclut pas avant de collecter) :

| # | Étape | Où | Question mécanique | Phrase-type (à écrire telle quelle) | Couleur |
|---|---|---|---|---|---|
| 1 | **🔍 تَبَصَّر** | المسودة فقط | ماذا يُطلَب منّي بالضبط؟ | — (entourer le verbe, souligner les mots-clés, « المطلوب: … » ≤ 5 mots) | `#1d4ed8` |
| 2 | **🔑 أدخل** | على الورقة | ماذا أملك؟ | « انطلاقًا من الوثيقة (…) نلاحظ أنّ … (قيمة + وحدة) » | `#059669` |
| 3 | **🔄 أدر** | على الورقة (si مفتاح ouvert) | هل الفعل يسمح بـ«لأنّ»؟ | « وهذا لأنّ … وبالتالي … » | `#d97706` |
| 4 | **🔓 افتح** | على الورقة | ما خلاصتي؟ | « ومنه نستنتج أنّ … (أُعيد صياغة المطلوب كحقيقة) » | `#7c3aed` |

**🔑 Le seul interrupteur** (avant d'écrire) : *هل الفعل يسمح بـ«لأنّ» ؟*
- **مغلق** (وصف — trajet ١←٢←٤) : حَلِّلْ · قَارِنْ · اسْتَنْتِجْ · لَخِّصْ فِي مُخَطَّطْ · أَنْجِزْ رَسْمًا تَخْطِيطِيًا
- **مفتوح** (تفسير — trajet ١←٢←٣←٤) : فَسِّرْ · اشْرَحْ · عَلِّلْ/بَرِّرْ · صَادِقْ · انْقُدْ · اقْتَرِحْ فَرَضِيَّةً · اكْتُبْ نَصًّا عِلْمِيًّا

**Contrôles = les 4 étapes relues à l'envers** (rien de neuf à mémoriser) :
٤ هل آخر جملة تُجيب «المطلوب»؟ · ٣ هل كل تأكيد له «لأنّ»؟ · ٢ هل ذكرت الوثيقة والقيمة والوحدة؟ · ١ هل احترمت الفعل؟

**Temps** : الربع الأول (تَبَصَّر + أدخل) · النصف (أدر أو الكتابة) · الربع الأخير (افتح + الفحص). L'allocution est proportionnelle aux points.

**Règle d'or (conservée mot pour mot)** : « لا خاتمةَ قبل حُجّة، ولا حُجّةَ قبل مُعطى، ولا مُعطى قبلَ فَهْمِ السؤال »

**Geste unique** : le pouce touche les 4 doigts (١·٢·٣·٤) sous la table — 5 secondes.

## 2) Erreurs → une adresse chacune (+ remède mécanique)

Le moteur de correction et ses **8 tags ne changent pas** ; seule change leur adresse :

| Adresse | Tag | Remède |
|---|---|---|
| ١ تَبَصَّر | `verb_confusion` | أُحيط بالفعل وأكتب «المطلوب: …» قبل أي سطر |
| 🔑 المفتاح | `premature_interpretation` | هل الفعل يسمح بـ«لأنّ»؟ ثم أغلق الخطوة 3 |
| ٢ أدخل | `missing_unit` | كل رقم بوحدته — أراجع أرقامي واحدًا واحدًا |
| ٢ أدخل | `missing_reference` | أستعمل القالب: «انطلاقًا من الوثيقة (…)» |
| ٢ أدخل | `comparison_without_criteria` | أكتب المعيار في المسودة قبل العمودين |
| ٣ أدر | `conditional_hypothesis` | صيغة إخبارية جازمة فقط — لا «ربما/لعل» |
| ٣ أدر | `unbalanced_comparison` | ما قلته عن الطرف الأول أقوله عن الثاني بـ«بينما» |
| ٤ افتح | `missing_conclusion` | «ومنه نستنتج أنّ …» — لا أسلّم ورقة بدونها |

### 4 formats spéciaux = habillages, pas de méthodes
| Verbe(s) | Ce qui change | Fiche de contrôle |
|---|---|---|
| قَارِنْ | étape 2 en 2 colonnes sur 1 critère ; étape 3 via بينما/في حين | même nombre de choses sur les 2 côtés |
| لَخِّصْ / رَسْم | étape 2 = structures ; étape 3 = flèches numérotées ; étape 4 = titre + légende | titre ✓ légende ✓ flèches ✓ |
| فرضية | seule l'étape 3 s'écrit, forme assertive | aucun ربما/لعل/يمكن أن |
| نص علمي | les étapes deviennent le plan : مقدمة = 1 (+ مشكل) · عرض = 2+3 · خاتمة = 4 | la خاتمة répond au مشكل de la مقدمة |

## 3) Deux axes SÉPARÉS (le correctif central de l'audit)

- **Axe vertical — les 4 étapes** : dans CHAQUE réponse, toujours les 4.
- **Axe horizontal — les 4 niveaux d'aide** (entre séances) ; seul le niveau d'aide change :
  - `1 مَعَ النَّمُوذَج` (Modelage) : l'élève voit une réponse complète, colorée par étapes, مفتاح explicité et justifié
  - `2 إكْمالُ الفَراغات` (Complétion) : il remplit les modèles (valeur, unité, وثيقة, «لأنّ», «ومنه نستنتج»)
  - `3 كِتابةٌ بِالبِطاقة` (Guidée) : il écrit toute la réponse, la fiche visible (fil d'étapes + مفتاح)
  - `4 بَكالوريا` : temps limité, sans fiche — puis les 4 contrôles apparaissent dans le dernier quart

## 4) Lots d'implémentation

### LOT A — `src/data/boussoleData.ts` (réécrit)
Exports : `BOUSSOLE_STEPS` (4 étapes : id 1-4, word, fr, whereAr, color `#1d4ed8/#059669/#d97706/#7c3aed`, colorSoft, questionAr, templateAr, actionsAr[], interditAr[], noteAr) · `getStep(id)` ·
`SWITCH_QUESTION_AR` · `SWITCH_OPEN_VERBS[]` / `SWITCH_CLOSED_VERBS[]` (ids exacts : `verb_explain_v1`, `verb_explain_multi_v1`, `verb_justify_v1`, `verb_validate_v1`, `verb_critique_v1`, `verb_hypothesis_v1`, `verb_composer_v1` ouverts ; `verb_analyse_v1`, `verb_compare_v1`, `verb_deduce_v1`, `verb_schema_v1`, `verb_schematic_v1` fermés) · `getSwitchForVerb(verbId)` · `switchPathAr(verbId)` ·
`ERROR_ADDRESS_MAP` (tag → `1|'switch'|2|3|4`) · `ERROR_REMEDY_MAP` · `errorAddressAr(addr)` · `groupErrorsByAddress(tags)` (ordre 1, switch, 2, 3, 4) ·
`SPECIAL_FORMATS[]` · `getSpecialFormatForVerb(verbId)` · `AID_LEVELS[]` (num, title, sub, desc) ·
`REGLE_D_OR_AR` (mot pour mot) · `TIME_RULE_AR` · `FINGERS_RITUAL_AR` · `SELF_CHECKS[]`.

### LOT B — `src/components/BoussolePanel.tsx` (réécrit)
Props : `{ activeLevel: number; verbId: string }`. Contenu : en-tête repliable (🧭 + badge « 4 خطوات · مفتاح واحد » + pastille rang `getNavigatorGrade()` + chevron) ;
**fil des 4 étapes** (4 segments cliquables ; segment 3 = **lampe du مفتاح** : « 🔑 مفتوح ✓ » vert si `getSwitchForVerb(verbId)==='open'`, « 🔑 مغلق ✗ » gris sinon) ;
détail de l'étape cliquée (ou des 4) : question, phrase-type (barrée grise si étape 3 fermée), actions, interdits 🚫, note ;
bloc **🔑 interrupteur pour ce verbe** (ouvert ⇒ «وهذا لأنّ…» requise ; fermé ⇒ «أي لأنّ = نقاط مفقودة») ;
bloc format spécial éventuel ; bloc **auto-contrôle** ; **règle d'or + règle de temps**.
⚠️ Peut utiliser `getNavigatorGrade()` (grades = couche motivation, autorisée).

### LOT C — `src/components/SwitchGateModal.tsx` (nouveau, remplace RitualCompassModal)
Props : `{ open: boolean; verbAr: string; onDecide: (choice: 'open'|'closed'|null) => void }`.
Compte à rebours **10 s** (reset à chaque ouverture ; à 0 → `onDecide(null)` une seule fois, garde `decidedRef`) ;
gros titre « هل هذا الفعل يسمح بـ«لأنّ»؟ » ; 2 boutons : **لا — مُغلق** (١←٢←٤, gris) / **نعم — مفتوح** (١←٢←٣←٤, vert) ;
règle d'or ; note « si tu te trompes ici, la correction te le dira avant de compter les fautes ».

### LOT D — `src/components/BoussoleIntroModal.tsx` (réécrit)
Onboarding unique : titre « كل إجابة في البكالوريا: 4 خطوات، ومفتاح واحد » ; 4 cartes étapes (numéro + mot + question + phrase-type) ;
bloc interrupteur avec les 2 familles de verbes ; règle d'or + règle de temps ; CTA « افتح بوصلة الإجابة » / « لاحقًا ».
**Sans CompassRose** (supprimée).

### LOT E — `src/components/MethodologyCompilerView.tsx`
- Imports : `BoussolePanel`, `SwitchGateModal`, `{ AID_LEVELS, getStep, getSwitchForVerb, groupErrorsByAddress, ERROR_REMEDY_MAP, SWITCH_QUESTION_AR, SwitchState }` (+ `KeyRound` de lucide).
- State : `showSwitchGate`, `switchChoice: SwitchState | null`.
- `useEffect [currentStage]` : si stage 3 ou 4 → `setSwitchChoice(null); setShowSwitchGate(true)`.
- Pills des stades → **`AID_LEVELS`** (titre arabe + sous-titre FR + desc ; actif = anneau émeraude « النشط » — **plus de couleurs de caps, plus de « كاب الآن »**).
- `<BoussolePanel activeLevel={currentStage} verbId={selectedVerbId} />`.
- Titres : « المستوى 1 — مَعَ النَّمُوذَج… », « المستوى 2 — إكْمالُ الفَراغات… », bannière bac « المستوى 4 — بَكالوريا (توقيت رسمي) ».
- **Rapport de correction → 5 lignes** (remplace le bloc « تقرير الملاحة NSOE ») : verdict du مفتاح (choix élève vs vérité du verbe : ✓/✗/؟ + chemin) puis grille `groupErrorsByAddress(detectedErrors.map(e=>e.tag))` : « 🔑 المفتاح · 1. تَبَصَّر · 2. أدخل · 3. أدر · 4. افتح » chacun ✓/✗ avec nom de l'erreur + **الدواء** (`ERROR_REMEDY_MAP`) ; pied : les 4 contrôles à l'envers.
- Fin de JSX : `<SwitchGateModal open={showSwitchGate} verbAr={currentVerb.verbAr} onDecide={(c)=>{ setSwitchChoice(c); setShowSwitchGate(false); }} />`.
- `handleResetExercise` : `setSwitchChoice(null)`.
- Onglets : « بوصلة الإجابة · المحاكي » ; « مصفوفة الإتقان ودفتر الأخطاء ».
- **Supprimer** : `<RitualCompassModal>`, imports `BOUSSOLE_CAPS/BOUSSOLE_STAGES_META/groupErrorsByCap`.

### LOT F — `src/components/MethodologyGlobalStats.tsx`
- Imports : `{ getStep, ERROR_ADDRESS_MAP, ERROR_REMEDY_MAP, errorAddressAr, ErrorAddress }` ; icônes `KeyRound` (retirer `Wind`, `CapId`, `BOUSSOLE_CAPS`, `VENT_CAP_MAP`).
- `errsByAddr` (Record<ErrorAddress, {tag,count}[]>), `totalErrs`, `maxErrCount`, **`weakest`** (l'adresse à plus d'erreurs) + `weakestCount`.
- Remplacer « خريطة الرياح NSOE » par **« خريطة الأخطاء — حسب خطوات البوصلة »** : grille 5 cases (١ تَبَصَّر · 🔑 المفتاح · ٢ أدخل · ٣ أدر · ٤ افتح), couleurs d'étapes, « سليم » / erreurs ×N avec barres + remède, badge **« أولوية العلاج »** sur la case la plus faible, bannière rémédiation (« تمرينك المقترح في الجلسة القادمة : تقوية … »), pied : 4 contrôles à l'envers.
- Bannière rang : badge « 4 خطوات · مفتاح واحد » (remplacer « NSOE ») ; état vide : « اكتب أول إجابة بالبوصلة… ».

### LOT G — divers
- **Supprimer** `src/components/CompassRose.tsx` et `src/components/RitualCompassModal.tsx` (plus aucune référence).
- `src/App.tsx` : commentaire de l'onboarding mis à jour (composant inchangé sinon).
- `src/utils/methodologyLog.ts` : `getNavigatorGrade()` conservé tel quel (motivation) ; libellés « NSOE » → « بالبوصلة ».
- Vérifier qu'aucune chaîne « خريطة الرياح / كاب / NSOE » ne subsiste dans `src/components` (hors commentaires historiques).

## 4bis) LOT v2.1 — compléments de l'audit (patch 0006)

### `src/components/SwitchDrillModal.tsx` (créé)
Micro-drill du مفتاح : `{ open, onClose }`. 60 s (DRILL_SECONDS), deck = 12 verbes mélangés
(`VERB_CARDS` + `getSwitchForVerb` ; si `focusVerbId` : 1 seul verbe, remédiation ciblée).
Chaque question : verbe en gros + 2 boutons « مُغلق » / « مفتوح » → feedback immédiat (✓/✗ +
chemin ١٢٤ / ١٢٣٤ + rappel « أي لأنّ = نقاط مفقودة ») → « التالي ». Fin (deck complet ou temps
écoulé) : score % + message (« جاهز للبوابة » ≥80 % / « أعد » sinon) + boutons أعد / إغلاق.

### `src/components/SwitchDuoDemo.tsx` (créé)
Démonstration audit §4, repliable par défaut. `GlycemiaChart` : SVG courbe glycémie
(0.9 → 1.6 → 0.9 g/L, 0/30/120 min, points bleu/orange/violet). Tableau 2 colonnes
« حَلِّلْ (١٢٤) » vs « فَسِّرْ (١٢٣٤) » : lignes 1, 2 (⚠ colonne 2 identique — « ↞ الجملة نفسها حرفيًا »)
et 4 ; ligne 3 = barrée chez حلّل / surlignée émeraude chez فسّر. Encart final :
« الفرق في العلامة لا يأتي من المعرفة — بل من مفتاح واحد ».

### `src/components/BoussoleCardPrint.tsx` (créé)
Fiche unique (§9) : `{ open, onClose }`. Largeur max-md, bordure 4 px `#006d37` ; en-tête ;
🔑 interrupteur (2 familles listées avec `SWITCH_CLOSED_VERBS/SWITCH_OPEN_VERBS` → `verbName` via VERB_CARDS) ;
grille 4 étapes (num/couleur/mot/whereAr) ; détail des 4 (question, phrase-type, interdits 🚫) ;
contrôles (`SELF_CHECKS`) + temps (`TIME_RULE_AR`) ; règle d'or. Boutons « طباعة » (`window.print()`)
et « إغلاق » dans `#boussole-print-no-print` (masqué à l'impression). CSS `@media print` : seule
`#boussole-print-card` est visible (visibility + position fixed inset 0).

### `src/components/QuarterTimerBar.tsx` (créé)
`{ timeLimit, timeLeft }` → fraction f = (timeLimit - timeLeft)/timeLimit. 3 segments RTL
(25 % phase « ١ تَبَصَّر + ٢ أدخل » bleu · 50 % « ٣ أدر / اكتب » orange · 25 % « ٤ افتح + الفحص » violet) ;
segment courant surligné + remplissage progressif ; label « أنت الآن في: … » + « الربع الأخير لا يُناقَش ».

### Intégration
- `BoussolePanel.tsx` : imports + boutons « درّب المفتاح (60 ث) » / « البطاقة + طباعة » + rendu des 2 modals.
- `MethodologyCompilerView.tsx` : `<SwitchDuoDemo />` inséré avant `<BoussolePanel>` ;
  `<QuarterTimerBar timeLimit={currentExercise.stage4.timeLimitSec} timeLeft={timerSeconds} />`
  inséré sous le chrono du bandeau niveau 4 (après le `div.font-mono` du compteur).

## 4ter) LOT K — correctifs d'assimilation (patch 0007) : le diagnostic devient honnête

### `src/utils/methodologyScorer.ts`
- Nouveau paramètre `switchContext?: { switchChoice?, switchTruth? }` (type `SwitchState` de boussoleData).
- **missing_reference GLOBALE** : `REFERENT_VERBS` (analyse/explain/explain_multi/compare/validate/
  deduce/justify/critique/hypothesis) → si le texte ne mentionne ni الوثيقة/منحنى/جدول/نلاحظ… → tag.
  (Avant : seuls 4 verbes couverts par leurs critères c1 ; علّل/انقُد/استنتج passaient sans contrôle.)
- **verb_confusion sur مفتاح faux** : si `switchChoice` ≠ `switchTruth` → tag `verb_confusion`
  (adresse étape 1) — la confusion حلّل/فسّر devient une erreur mesurée, plus un verdict sans suite.
- **premature_interpretation étendue** : tous les `SWITCH_CLOSED_VERBS` (استنتج/قارن/لخّص/ارسم +
  حلّل), aligné sur le مفتاح de la boussole ; `causalRegex` partagée.
- **ex_c3** : `causalConnectorRe` accepte le gabarit de la boussole « وهذا لأنّ / هذا لأن / لأن ».
- **exp_m_c3** (اشرح) : passe par la branche conclusion (au lieu du fallback longueur).

### `src/utils/methodologyLog.ts`
- `ProductionLogEntry` : `switchChoice?`, `switchTruth?` (décision du مفتاح archivée pour le
  diagnostic « tu te trompes de مفتاح N fois »), `durationSec` = temps réellement passé.

### `src/components/MethodologyCompilerView.tsx`
- Les 2 appels `evaluateStudentProduction` passent `switchContext` ; le carnet archive
  `switchChoice`/`switchTruth` ; `durationSec = timeLimit − timerSeconds` (stade 4).
- Rapport honnête : « لم يُرصد خطأ » remplace « سليم » ; étape 1 « غير مُقيَّم — أجب عن سؤال
  المفتاح » tant que `switchChoice === null` ; bannière ⚠ « نتيجة غير موثوقة » si مفتاح faux.

### `src/components/MethodologyGlobalStats.tsx`
- Carte d'erreurs : bouton réel « أدرّب المفتاح الآن (60 ث) » (état `showDrill` + `SwitchDrillModal`
  rendu en pied) — la remédiation promise par le diagnostic est cliquable ; note si l'adresse
  faible n'est pas 🔑 (« التصحيح يبدأ من المفتاح »).

### `src/components/SwitchDrillModal.tsx` / `SwitchDuoDemo.tsx`
- Drill : `round` incrémenté à chaque relance → re-mélange du deck (réflexe ≠ mémorisation).
- Démo duo : `useState(true)` — la démonstration clé de l'audit §4 est visible d'office.

## 4quater) LOT L — audit suite : bugs forts + 20 vraies règles (patch 0008)

### Bugs FORTS
- **Matrice d'icm réelle** (`MethodologyCompilerView`) : `matrixScores` n'est plus un état
  initialisé en dur (92/85/68/84…) mais un `useMemo` sur `getProductionLogs()` (dernier icm
  par verbe×thème) ; cellule « — » si non évalué + note « الأرقام كلها من إجاباتك الحقيقية ».
- **Compteurs d'erreurs réels** : `weeklyErrorCounters` semé depuis les productions des
  7 derniers jours (plus de 4/3/2/1 en dur) + état vide « لا أخطاء مسجلة هذا الأسبوع ».
- **مفتاح périmé au changement de verbe** : sélecteur, cartes de verbes et reprise de brouillon
  rouvrent la porte du مفتاح (stades 3/4) et purgent `switchChoice`/`scoreReport` — un rapport
  ne peut plus hériter de la décision du verbe précédent.
- **Timer au retour de brouillon** : `timerSeconds = ex.stage4.timeLimitSec` + `isTimerRunning(true)`
  (au lieu du montant périmé 180 sans démarrage).

### Bugs FAIBLES — les 20 critères sans vraie règle (`methodologyScorer.ts`)
Le fallback « longueur > 40 » jugeait : `comp_c2, cr_c1-4, ded_c2, exp_m_c1-2, hyp_c1,
ju_c1-4, sc_c1-4, sch_c1-2, val_c2`. Chacun a maintenant sa détection alignée sur son
`wording.compass`/`check` déclaré :
- comparaison : critère commun + similitudes/oppositions traitées ensemble (`compCriteriaRe`)
- نقد : objet (cr_c1) · positif+document (cr_c2) · négatif/limites (cr_c3) · jugement (cr_c4)
- استنتاج : `ded_c2` isole la partie après « الاستنتاج/نستنتج » → aucun chiffre répété
- اشرح multi-documents : doc 1 + résultat (exp_m_c1) · doc 2 + contexte (exp_m_c2)
- فرضية : départ expérimental + problème (hyp_c1)
- تعليل : annonce (ju_c1) · argument documenté (ju_c2) · مكتسبات «نعلم أن» (ju_c3) · lien
  causal final (ju_c4)
- رسم تخطيطي : formes (sc_c1) · trame/suffixes (sc_c2) · flèches numérotées (sc_c3) ·
  مفتاح+عنوان (sc_c4)
- مخطط : éléments dans formes (sch_c1) · sens des flèches (sch_c2)
- تصديق : confrontation preuve/hypothèse (val_c2)
- `missing_unit` étendu à tous les verbes à document + texte scientifique.

## 4quinquies) LOT M — duel Scoreur vs Boussole (patch 0009) : 12/12 gabarits

Le duel : une réponse-modèle construite sur les 3 gabarits de la fiche
(« انطلاقًا من الوثيقة… » / « وهذا لأنّ … » / « ومِنه نستنتج أنّ … ») est soumise
à chacun des 12 verbes ; exigence : ICM = 100 + zéro erreur. Résultat initial 7/12
→ 3 mines de faux positifs (agglutination arabe) dégagées dans `methodologyScorer.ts` :

- **`arPattern(alts)` + `textClean`** : frontières de mot arabes (préfixes
  و/ف/ثم/بل/لا/ب/ل/ك/ال/وال/فال/بال autorisés, jamais en plein milieu d'un mot ;
  tashkeel retiré). Appliqué à `causalReg`, `doubtReg`, `ex_c3` (وهذا لأنّ), `ju_c4`.
  → «الأنسولين» ne déclenche plus «لأنّ» (verbe fermé faussement taggé تفسير مبكر) ;
    «العلاقة» ne déclenche plus «لعل» (فرضية faussement taggée صيغة الشك).
- **`textNoDocRefs`** : les numéros de documents («الوثيقة 2», «المنحنى 1»…) sont
  retirés avant le test `numbersPresent` → plus de `missing_unit` sur une simple
  référence (فرضية/نقد/نص علمي).
- **Exclusion du رسم تخطيطي** : `missing_conclusion` ne s'applique pas à
  `verb_schematic_v1` (son étape 4 = عنوان + مفتاح via sc_c4, pas une phrase de bilan).
- Radical « الوثيق » maintenu dans les critères c1 (couvre «الوثيقتين»).

Régressions gardées vertes : « لأنّ » réel chez حلّل → premature · «ربما» réel chez
فرضية → conditional · chiffre sans unité → missing_unit · réponse sans سند →
missing_reference. Le duel complet peut être rejoué en copiant les 12 cas de test
(dans le commit e689c98, message).

## 5) Vérification

```bash
npm install --no-audit --no-fund
npm run lint          # = tsc --noEmit → 0 erreur
npm run build
bash ../spec_kit/verify.sh   # 25/25 attendu
```
**Manuel** : onboarding v2 → بوصلة الإجابة : fil d'étapes, lampe du مفتاح (change avec le verbe sélectionné : حلّل = مغلق ✗, فسّر = مفتوح ✓) → niveau 3 ou 4 : porte du مفتاح 10 s → écriture → rapport 5 lignes → تقدمي : خريطة الأخطاء + أولوية العلاج. Recharger : tout est conservé.

## 6) Dépannage
| Symptôme | Fix |
|---|---|
| `git am` échoue | Base différente → SPEC à l'agent, ou `git apply --3way` et fusion manuelle |
| TS : `KeyRound` inconnu | L'ajouter à l'import lucide-react du composant |
| Lampe du مفتاح toujours identique | Vérifier `getSwitchForVerb(selectedVerbId)` (ids des 12 verbes, §4 LOT A) |
| La porte ne s'affiche pas | `useEffect [currentStage]` + `currentStage===3||===4` ; `showSwitchGate` initialisé false |
| L'onboarding revient sans arrêt | Effacer `kunz_boussole_intro_v1` et re-tester ; condition `currentTab !== 'splash'` |
| Anciens fichiers v1 encore là | `CompassRose.tsx` / `RitualCompassModal.tsx` doivent être supprimés |
