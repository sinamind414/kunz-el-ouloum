# Audit Fable-5 — Correctifs appliqués (2026-09-25)

Suite du verdict d'audit d'audit (score de fiabilité 6,5/10) livré le
2026-09-25. Les 5 points confirmés **réels** sont maintenant corrigés.
Commit : `157246e`.

## Correctifs

### 1. `car` non borné — `methodologyScorer.ts:42`

`CLOSED_FORBIDDEN_RE` contenait `car` sans frontières : « carbone »,
« caractéristique », « carreau » déclenchaient `premature_interpretation`
à tort sur les productions descriptives (switch `closed`).

→ `\bcar\b`. Vérifié : « carbone » ne déclenche plus, « car » autonome
déclenche toujours.

### 2. `FAUX_AMIS` / `CONFLITS` — verdict partiellement corrigé

**Mon verdict initial disait :** données définies mais jamais consommées
par la notation (code mort).

**La réalité, constatée en implémentant :** les 5 confusions du build
`faux_amis` + le conflit ATP **sont** consomées et affichées — mais par
`sanctionsCorrecteur.ts`, qui les **réimplante** de façon plus riche
(26 sanctions, co-occurrence de marqueurs, garde anti-négation, tests dans
`correcteurIntegration.test.ts:123-136`, affichage UI dans
`CorrecteurPanel.tsx:219`).

Ce qui est réellement mort, c'est le **pont typé** : les exports
`FAUX_AMIS`/`CONFLITS` de `dictionnaireCorrecteur.ts` n'avaient
**zéro import**. → exports supprimés (les interfaces `FauxAmi`/`ConflitRef`
restent pour le typage du JSON build ; les sections restent dans le JSON à
titre de spécification).

### 3. `includes()` sans frontières — `correcteurV1.ts:409`

`norm.includes(nMot)` matchait un mot-clé à l'intérieur d'un mot plus long
(« دنا » dans « مادنا », « ATP » dans « ATPase ») → couverture gonflée.

Nouvelle fonction `motPresentDans()` dans `normalizeAr.ts` :
- frontières sur les **lettres** via `\p{Script=Arabic}` — et **non** le
  bloc `\u0600-\u06FF` qui contient la ponctuation arabe (`،` U+060C,
  `؛`, `؟`) ; ma première version bornait sur tout le bloc et cassait
  tout mot-clé suivi d'une virgule arabe (capté par le test
  `correcteurV1.test.ts:378`, couverture ≥ 60 %) ;
- **clitiques arabes** acceptés devant le mot-clé (`ال/و/ف/ب/ل/ك`) :
  l'arabe est agglutinant, « بالتحلل السكري » doit bien matcher
  « التحلل السكري ». Les faux-amis restent exclus car `م` n'est pas un
  clitic (« مادنا » ne contient pas « دنا »).

### 4. Trois critères du scoreur

| Critère | Avant | Après |
|---|---|---|
| `def_c1` | appartenance = `هو\|هي` seulement ; propriété = 5 verbes → une définition canonique en « عبارة عن » ou « يُعرَّف » **échouait injustement** | appartenances élargies (عبارة عن، يُعرَّف، يُسمَّى) + 12 verbes de propriété. La forme canonique « هو » passe toujours. |
| `hyp_c1` | un mot biologique générique seul (`بروتين`، `هرمون`) validait l'ancrage | **2 marqueurs biologiques distincts** (un « système concret » = composants en interaction) ou ancrage expérimental explicite (الوثيقة/المعطى/التجربة). Réponse-expert de la carte + cas c7 (récepteur A1R + noradrénaline) vérifiés passants ; cas vague vérifié échouant. |
| `list_c2` | fourchette `2..5` codée en dur — ignorait le nombre exigé par la question ; 2 éléments passaient à une question « cite 3 exemples » | nouveau champ `expectedCount?: number` sur `VerbCriteriaItem` (la carte porte la exigence : 3 إنزيمات) ; `3` passe, `2` échoue, `5` dépasse la tolérance (3..4, +1 pour absorber un retour à la ligne). |

### 5. 24 fichiers `.patch` en racine — hygiène

Déplacés vers `patches/` (`git mv`, 24 renames, dont `patches/src/`).
Aucun script ni config ne les référence — seuls des rapports `docs/` les
citent textuellement.

## Vérification (baseline complète)

| Contrôle | Résultat |
|---|---|
| `tsc --noEmit --strict` | 0 erreur |
| `check:v2` | 0 |
| vitest | **1135/1135** (91 fichiers, +18 tests `fable5.correctifs.test.ts`) |
| `npm test` (boussole) | 138/138 |
| `check:miftah` | ✓ |
| `check:lecons` | 25/25 |
| Locks okacha | 33/33 |
| `build` | OK — taille inchangée (4 358 kB / 949 kB gzip) |
| `verify:store` | ✓ |
| Corruption U+FFFD | 0 sur les 6 fichiers touchés |
| Serveur dev `localhost:3000` | vivant (HTTP 200) |

## Note

`npx jest` (sans config) échoue sur `import type` via babel-jest — ce n'est
pas une baseline du projet (le test jest est `npm test` = boussole via tsx).
Il scanne aussi le worktree `.kilo/worktrees/emerald-whippoorwill` ; non
lié à ces correctifs.
