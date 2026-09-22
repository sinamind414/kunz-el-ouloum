# Audit المرشد الذكي (الأستاذ كنز العلوم) — bilan des bugs

**Date :** 2026-09-22 · **Module :** `src/components/AITutorView.tsx` (458 l.) + `src/smartTutorEngine.ts` (768 l.) + `src/utils/sessionManager.ts`
**Bug signalé :** « tu vois la réponse mais la question n'est pas sur l'écran » — **confirmé, cause racine trouvée : l'énoncé n'est jamais rendu.**

---

## 1. Le bug grave signalé — B0 : l'énoncé n'apparaît JAMAIS

**Chaîne complète du défaut (prouvée dans le code) :**

1. Le moteur envoie bien l'énoncé : `toQuizPrompt()` retourne `{ id, question, options, correctIndex, explanation }` (`smartTutorEngine.ts` l.108-119) ;
2. L'UI ne rend que les options : dans `AITutorView.tsx`, le bloc quiz n'utilisait que `quiz.id` et `quiz.options` — **`quiz.question` n'était référencé nulle part** ;
3. Résultat : l'élève voit 4 boutons A/B/C/D **sans l'énoncé**, puis la correction (« ✅ إجابة صحيحة + explication ») qui parle d'une question **jamais affichée** ;
4. Aggravant : la bulle de réponse de l'élève n'affiche que la lettre (« A »), pas l'option choisie — même sa propre réponse est décontextualisée.

C'est donc littéralement « tu vois la réponse (options + correction) mais la question n'est pas sur l'écran ». Ce n'est pas un bug de scroll : **l'énoncé n'a jamais existé dans le DOM**.

**✅ CORRIGÉ (pilote)** : l'énoncé est rendu au-dessus des options — `❓ {quiz.question}` en gras — le message complet est maintenant : énoncé → options → (puis) correction.

## 2. Les autres bugs trouvés (audit complet du module)

| # | Gravité | Bug | Preuve code | État |
|---|---|---|---|---|
| B1 | Majeur | **Scroll bas de chat** : `scrollIntoView` colle au fond à chaque message → la correction longue pousse la question hors champ (2ᵉ couche du bug ressenti) | `useEffect → messagesEndRef.scrollIntoView` l.44-46 | ✅ **CORRIGÉ (B1)** : scroll positionné sur le **haut du dernier message** (`listRef` + `data-message` + conteneur `relative`) — la question reste à l'écran pendant que la correction se déroule |
| B2 | Majeur | **Vieux quiz cliquables** : les boutons des questions précédentes restaient actifs → cliquer une vieille option envoyait « A », noté sur la question **courante** du moteur (contamination croisée) | bloc quiz sans état « répondu » ; `gradeQuizAnswer` note sur `session.currentQuiz` (l.596) | ✅ **CORRIGÉ** : seul le dernier quiz est cliquable, les anciens sont désactivés + grisés avec mention « تمت الإجابة — السؤال الموالي أدناه » |
| B3 | Majeur | **Session persistée, messages non** : après refresh, `loadSession()` restaure un quiz en cours (`currentQuiz`) alors que le chat ne montre que l'accueil → tout input est noté comme réponse, l'élève ne comprend pas | `sessionManager.ts` l.54-68 vs `messages` en state local | ✅ **CORRIGÉ (B3)** : `clearPendingInteractions()` (quiz **et** boss) neutralisés au montage, stats/mistakes conservés + message « ألغيته… » à l'élève |
| B4 | Moyen | **Bulle de réponse muette** : l'élève clique l'option « نص الخيار… » mais sa bulle n'affiche que « B » | `handleQuizAnswer → handleSend('B')` ; `parseAnswer` n'accepte que la lettre nue (l.338-346) | ✅ **CORRIGÉ (B4)** : `dispatchToEngine(engineInput, displayText)` — lettre au moteur, « إجابتي : X — <texte> » dans la bulle |
| B5 | Moyen | **Réponse correcte dans le payload UI** : `QuizPrompt` transporte `correctIndex` + `explanation` jusqu'au composant (inspectable en console → module trichable) | `toQuizPrompt` l.108-119 | ✅ **CORRIGÉ (B5)** : `QuizPrompt = { id, question, options }` — plus aucun cast du payload ; test engine-level |
| B6 | Mineur | `<li>` rendu sans parent `<ul>` (invalidité DOM/a11y) | rendu markdown l.228-233 | ✅ **CORRIGÉ (B6)** : `renderMarkdownBlocks()` exportée — puces consécutives regroupées dans de vrais `<ul>` (zéro `<li>` orphelin), testée unitairement |
| B7 | Mineur | Double-clic rapide → 2 messages `user_${Date.now()}` identiques (collision de key React) | `id: user_${Date.now()}` | À traiter (id nanoid/compteur) |
| B8 | Mineur | Accueil incohérent : texte de bienvenue différent entre init et `handleClear` | WELCOME_TEXT vs handleClear | ✅ **CORRIGÉ (B8)** : factory unique `buildWelcomeMessage()` (init + « مسح المحادثة ») |
| B9 | Mineur | Étiquette « مساعد ذكاء اصطناعي » : c'est un moteur de règles local, pas de l'IA — honnêteté d'affichage | sous-titre header ; audit T3 (route /api/chat inexistante, déjà corrigée) | ✅ **CORRIGÉ (B9)** : sous-titre honnête « مرشد تفاعلي محلي موجه لمنهج البكالوريا — يعمل دون اتصال بالإنترنت » |
| B10 | Mineur | a11y : `alt="AI Avatar"` générique ×2, boutons quiz sans `aria-label` liés à l'énoncé | img l.180, l.366 | ✅ **CORRIGÉ (B10)** : alt « شعار المرشد الذكي », `aria-label` sur les boutons d'options (« الخيار A: … ») et sur le champ de saisie |

## 3. Corrections appliquées (pilote) et validation

**Modifié :** `src/components/AITutorView.tsx` — bloc quiz uniquement :
1. **B0** : énoncé rendu (`❓ question`) au-dessus des options ;
2. **B2** : `isActiveQuiz` = le message porte le dernier quiz du fil → sinon `disabled` + style grisé + libellé « تمت الإجابة ».

**Non touché :** moteur, session, tests (les testids `quiz-option-N` et flux sont préservés).

**Validation :** `AITutorView.test.tsx` **11/11 ✓** · suite complète **899 passed + 4 skipped** · `check:v2` ✓ · build ✓.

## 4. Paquet « expérience quiz saine » — LIVRÉ (B3+B4+B5, + B7 au passage)

1. ✅ **B3** : `clearPendingInteractions()` dans `sessionManager.ts` — quiz/boss fantômes neutralisés au montage (effet auto-réparant : il relit localStorage, compatible StrictMode), stats/mistakes préservés, message d'information « ألغيته… » à l'élève ;
2. ✅ **B4** : `dispatchToEngine(engineInput, displayText)` — la lettre part au moteur (contrat `parseAnswer` intact), la bulle affiche « إجابتي : X — <texte de l'option> » ;
3. ✅ **B5** : `QuizPrompt` réduit à `{ id, question, options }` — `correctIndex`/`explanation` ne quittent plus le moteur ; cast du payload supprimé (types alignés) ;
4. ✅ **B7** au passage : ids de messages séquencés (`nextId()`), fin des collisions de keys.

**Tests : 16/16** (11 existants + 5 nouveaux : B0 énoncé rendu, B2 anciennes options désactivées, B4 bulle parlante, B3 session fantôme neutralisée end-to-end, B5 payload propre).

### Finition phase par phase (B1, B6, B8, B9, B10) → **10/10 bugs traités**

| Phase | Bug | Correctif | Validation |
|---|---|---|---|
| 1 | B1 scroll au fond | `listRef` + `data-message` + conteneur `relative` : le HAUT du dernier message est positionné en tête de zone visible (question toujours à l'écran) | 16/16 ✓ |
| 2 | B6 `<li>` orphelins | `renderMarkdownBlocks()` exportée : regroupement par blocs `<ul>/<p>` | 16/16 ✓ |
| 3 | B8 double accueil | `buildWelcomeMessage()` unique (init + clear) | 16/16 ✓ |
| 4 | B9 fausse étiquette IA | « مرشد تفاعلي محلي … يعمل دون اتصال بالإنترنت » | 16/16 ✓ |
| 5 | B10 a11y | alt parlants + aria-label options et champ | 20/20 ✓ |

**Bilan final : 20/20 tests module** (11 originaux + 9 nouveaux : B1 espion scrollTo, B6 unitaire structure ul/li, B8 clear → accueil standard, B9+B10 étiquette/alt/labels). Suite complète : **908 passed + 4 skipped**. Aucun bug ouvert restant sur ce module.

## 6. « Les réponses sans question ENCORE » — audit mot-par-mot (post-captures user)

**Captures reçues (4) :** diagnostic/quiz avec options mais sans énoncé + graphie « تحعينة الداردا ».

### 6.1 Verdict : les captures montrent une version SANS les correctifs (preuve git)

| Test sur master (a9c8360, la version mergée/déployée) | Résultat |
|---|---|
| `quiz.question` rendu dans AITutorView (fix B0) | **0 occurrence** — le fix n'y est PAS |
| `clearPendingInteractions` (fix B3) | **0 occurrence** |
| Texte mission | « تعبئة الرادار » **propre** aussi sur master → la graphie « تحعينة الداردا » vient d'un build **plus vieux que master** (cache navigateur ou checkout ancien) |

Les 5 commits de correctifs Morchid/design/slicing (`a9afe27`→`3faeee7`) sont **locaux uniquement** (session GitHub fermée avant push). Rien n'a régressé : la version testée n'a simplement jamais reçu les corrections.

### 6.2 Trace mot-par-mot de la chaîne question (code courant, 4 sites producteurs)

| # | Site (smartTutorEngine.ts) | Flux | Énoncé inclus ? |
|---|---|---|---|
| 1 | l.423 diagnostic | `toQuizPrompt(first)` → UI `❓ {quiz.question}` l.300 | ✅ |
| 2 | l.444 réponse invalide | `toQuizPrompt(question)` (re-propose la même) | ✅ |
| 3 | l.461-463 question suivante | `toQuizPrompt(nextQ)` après correction | ✅ |
| 4 | l.761 carte de savoir | `toQuizPrompt(quiz)` si quiz de tirage | ✅ |

`toQuizPrompt` = mélange déterministe (seed=id) + `{ id, question, options }` (B5 : sans `correctIndex`/`explanation`). L'UI rend l'énoncé en gras **au-dessus** des options, désactive les anciens quiz (B2), affiche « إجابتي : X — … » (B4).

### 6.3 Audit lexical : 94 chaînes arabes du moteur, 0 suspect

Scan automatique (mot par mot) des 94 chaînes distinctes : **0 motif corrompu** (pas de « تحعينة », « الداردا », ni token non-arabe hors lexique scientifique légitime ATP/ADN/ARNm/HLA/TCR/LTc/…). Chaînes clés toutes présentes à l'identique : بدأ التشخيص، إجابة صحيحة/خاطئة، الإجابة الصحيحة هي، نتيجتك النهائية، مهمة اليوم، تعبئة الرادار، خطأ شائع، التصحيح.

### 6.4 Livrable : le patch à appliquer sur master (canal de contournement, session GitHub fermée)

**Fichier : `morchid-fixes-pour-master.patch`** (129 192 B, 20 fichiers, +921/−316) = `git diff a9c8360 HEAD` — design zone التثبيت (phase7 pilote) + المرشد B0→B10 + fix zone-synthese (11 leçons) + parcours 47 rendus.

**Vérifié** : `git apply --check` ✓ sur un worktree a9c8360 — s'applique proprement.

Commandes (sur ton master local) :
```
git checkout master
git apply --check morchid-fixes-pour-master.patch   # doit être silencieux
git apply morchid-fixes-pour-master.patch
npm ci && npx vitest run && npm run build
git add -A && git commit -m "Morchid B0-B10 + design zone التثبيت + fix slicing + parcours rendu"
git push origin master
```
(Push master = ta prérogative, jamais la mienne.)

## 5. Limites avouées

- Audit statique + tests automatisés : pas de test manuel navigateur dans cette session (session GitHub close, push indisponible — commit local uniquement) ;
- Le rendu « question + correction » mérite une validation visuelle sur mobile (hauteur 78vh de l'iframe des leçons ne concerne pas ce module, plein écran React).
