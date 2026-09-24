# 🔬 AUDIT QUALITÉ — Renommage §14 (dents → gestes) · preuve « moteur intact »

**Date :** 2026-09-22 · **Périmètre :** commit `59623cf` (+ `56fe1d4` ci local) · **Baseline :** `53337e1`
**Mode :** audit **strictement non-invasif** — aucune modification de code n'a été produite par cet audit.

---

## 🏁 VERDICT : ✅ QUALITÉ HAUTE — **APTE**

| Critère | Résultat |
|---|---|
| Moteur touché ? | **NON — preuve byte-level : 16/16 invariants identiques** |
| Couplage nom → logique | **0** (aucun `switch/case/===` sur un libellé) |
| Résidus d'anciens libellés | **0** dans le code (hors garde `mustNot` volontaires) |
| Garde-fou `check:miftah` | **+4 asserts nettes** (126 → 130) · M4 pédagogiques **7/7 conservées** |
| Suite de tests (instantané frais) | **tsc 0 · v2 0 · 152✓/0✗ · vitest 1004/1004 · 138/138 · build OK · smoke 4/4** |
| P0 / P1 bloquants | **0 / 0** · P2 : 2 (dette docs, réclamations UI préexistantes) · P3 : 4 |

---

## 1. 🔩 Preuve que le MOTEUR n'a pas bougé (comparaison octet à octet `53337e1` ↔ `HEAD`)

Blocs critiques extraits des deux révisions et comparés **après neutralisation des seuls champs de libellé** :

| Invariant (moteur) | Statut |
|---|---|
| `ERROR_TAXONOMY` (9 codes sémantiques + step) | ✅ IDENTIQUE |
| Types `StepId` / `MiftahStepId` | ✅ IDENTIQUE |
| `DRILL` (12/12 · 3 jours) | ✅ IDENTIQUE |
| `UNLOCK_RULE` | ✅ IDENTIQUE |
| `LEVELS` | ✅ IDENTIQUE |
| `FIVE_COSTLY_ERRORS` | ✅ IDENTIQUE |
| `MOVEMENTS` (3 issues 📷🎬🔨) | ✅ IDENTIQUE |
| `STEP0` (القفل + template/exemple/check) | ✅ IDENTIQUE |
| Graphe `SWITCH` (`SWITCH_OPEN/CLOSED_VERBS`, `switchPathAr`, `getSwitchForVerb`) | ✅ IDENTIQUE |
| `ERROR_ADDRESS_MAP` (dérivé de la taxonomie) | ✅ IDENTIQUE |
| Table `tagToStep` (erreur → étape) | ✅ IDENTIQUE |
| `SELF_CHECKS` (4 questions — siège de فحص α) | ✅ IDENTIQUE |
| `REGLE_D_OR_AR` · `FINGERS_RITUAL_AR` · `GOLDEN_FORMULA_AR` | ✅ IDENTIQUE ×3 |
| `BOUSSOLE_STEPS` **hors champ `ar`** (templates, interdits, errorTags, couleurs) | ✅ IDENTIQUE |
| `ASNAN` **hors `nameAr`** (`id`, `iconAr`, `actionAr`, `correctorAr`, `noteAr`) | ✅ IDENTIQUE |
| `KEY_MNEMONIC_AR` | ⚠️ **CHANGÉ — attendu** (c'est le libellé cible du §14) |

**Couplage nom → comportement :** recherche `switch(name)` / `case 'acte|ancien'` / `=== 'acte|ancien'` sur les 8 libellés → **0 occurrence**. Les seuls consommateurs des tableaux de noms sont **display-only** : interpolation JSX (`{STEP_NAMES_AR[step]}` ×6 dans BoussoleCard/Compiler) — **aucun parcours, scoring, mission ou test ne lit la chaîneArabe**.

**Classification ligne à ligne du diff (fichiers critiques) :**
- `methodologyEngine.ts` : **un seul hunk** — commentaires + 2 maps de libellés (lignes 251-254). Rien d'autre.
- `miftahSpec.ts` : 3 hunks — `MIFTAH_VERSION`, `NOMENCLATURE.s1-s4` + mnémonique, `ASNAN.nameAr`×4 + commentaire. `actionAr`/`correctorAr` **réécrits à l'identique** (vérifié).
- `boussoleData.ts` : **16 lignes `+`**, toutes des valeurs de libellé (`ar`, `TIME_RULE*`, `errorAddressAr` labels, CAPS `ar`).
- `MiftahCard.tsx` : 6 lignes remplacées (1 teeth-div + 4 cellules de nom + 1 phrase « دُرج ») — le **contenu pédagogique des cellules (`<td>` d'action/corrector) est identique**, seul le `<td>` de nom change.
- `CompilerView` : **1 ligne** (phrase دُرج). `drillBank` : **1 ligne**. `meftahManhajia` : commentaire de version périmé.

---

## 2. 🛡️ Qualité du garde-fou `check:miftah`

| | Avant | Après |
|---|---|---|
| Assertions totales (regex) | 126 | **130 (+4)** |
| Retirées | 33 | — dont **26 remplacées** à l'identique fonctionnelle (label retitré) |
| Ajoutées | — | **37** |
| Conservées | — | **93**, dont **M4 pédagogiques 7/7** (barèmes Meftah 5/7/8, registre 40 ن, parité dictionnaire) |

**Les 33 « retirées » se décomposent :**
1. **~26 re-étiquetées** (le libellé de l'assert a changé, la protection reste : arbre à verdict, الحدّاد, 11 cases, template hypothèse, footer 11 عنصرًا, versions…) ;
2. **~7 genuinely v5-content** : title v5.0, pagination « الصفحة 1/2 », barèmes recto `5/7/8 نقاط`, familles tashkeel `أَصِف/أُحَلِّل…`, anti-tautologie littérale, verso « أربع أدوات ★ شحذ », A4 `width/height` — **ces textes n'existent plus dans la fiche** (contenu remplacé par v6) ; les protections équivalentes existent :
   - barèmes → toujours verrouillés **côté spec** par M4 (7 asserts) ;
   - A4 → remplacées par `size:210mm 297mm` + `page-break-before:always` (**couverture équivalente**, mécanisme `@page` moderne) ;
   - anti-tautologie → **présent dans v6 sous forme `دون نسخ التعليمة`** (assertion manquante → P3).

**Nouvelles protections gagnées** (inexistantes avant) : chaîne des 5 gestes, boosula 20–30 s, 3 familles أصف/أقرأ/أحكم, « فحص 10 ثوانٍ » (siège α), 3 pièges, sections verso v6 (carte décision, 4 variables, فرضية→حكم, تركيب, règles rouges, sprint), **`mustNot` anti-régression sur l'ancien libellé ×2 (carte + compilateur)**, version 6.0 ×2 + en-tête fiche.

---

## 3. 📄 Qualité de la fiche v6 publiée (`public/miftah.html`)

| Contrôle | Résultat |
|---|---|
| Balance des tags (div/section/table/h*) | ✅ équilibrée |
| Marqueur `<!-- VERSO -->` | ✅ présent (avant la 2ᵉ `<section class="page break">`) |
| A4 : `@page{size:210mm 297mm}` + saut `.break` | ✅ ajouté, asserté ×2 |
| Mots interdits (`السنّ 0`, `مفتاح الكنز`, `MIFTAH`, `الحدّاد`, `V4.1`, `3×متتالية`…) | ✅ **0/11** |
| Version `v6.0` | ✅ ×2 (2 en-têtes) + cohérence auto `v{MIFTAH_VERSION}` |
| Tags équilibrés / taille | ✅ 20 656 octets, autonome |
| Fonts Google externes | ⚠️ **précédentes aussi** (v5 en avait 2) — **pas une régression**, dégradation offline = fallback système |
| Build embarque la fiche | ✅ `dist/miftah.html` = v6 |

---

## 4. 🧪 Suite complète — instantané frais (post-commit, arbre propre)

```
tsc ................. 0 erreur
check:v2 ............ exit 0
check:miftah ........ 152 ✓ / 0 ✗
vitest .............. 1004/1004 (76 fichiers) · smoke build 4/4
npm test ............ 138/138
build ............... exit 0 (dist embarque fiche v6)
git ................. working tree CLEAN · 59623cf poussé · 56fe1d4 local (ci)
```

---

## 5. 📋 Findings (aucun bloquant)

### P0 — aucun. P1 — aucun.

### P2 (à planifier, sans urgence)
| # | Finding | Détail |
|---|---|---|
| P2-1 | **Dette documentaire** : 4 docs historiques enseignent encore les anciens libellés | `docs/AUDIT_APPROCHE_APP.md`, `AUDIT_CORRECTEUR_MEFTAH_2026-09-19.md`, `CROISEMENT_OKACHA_MEFTAH_2026-09-20.md`, `SPEC_BOUSSOLE_NSOE.md` — **coup de tamponn « §14 : libellés = … » en tête de chaque doc** suffit (ne pas réécrire l'historique). `MARQUE.md` = historique volontaire, non-finding. |
| P2-2 | **Vocabulaire de compte entre artefacts** : carte `4 dents · 2 portes` vs fiche `5 gestes · 3 familles` | **Intentionnel (α §14)** : فحص compte parmi les gestes mais pas parmi les dents ; « 2 portes » sur la carte est un choix d'arbitrage acté (09-07, `mustNot 'البوابات الثلاث'`). **Risque UX** : élève peut demander « où est la 5ᵉ dent ? » — la fiche y répond (« الفحص عادة تدريبية »). À garder en tête pour le test utilisateurs D3. |

### P3 (mineurs, non exécutés — audit seul)
| # | Finding |
|---|---|
| P3-1 | Assertion `must(recto, 'أقرأ')` faible : le mot existe aussi dans « أُقرأ التعليمة » (mouvement 1) → ancrer sur « 🟢 أقرأ » si l'on veut durcir. |
| P3-2 | V6 porte la règle anti-tautologie sous `دون نسخ التعليمة` mais **aucune assertion ne la verrouille** (l'ancienne `لا يُعيد نص السؤال` a été retirée avec son aiguille v5) → 1 `must` à ajouter. |
| P3-3 | `errorAddressAr()` : **code mort préexistant** (jamais appelé, avant comme après) — le renommage a été fait par précaution ; supprimer ou brancher (UI stats erreur). |
| P3-4 | Réclamation UI préexistante : CompilerView affiche « مطابقة 100% للـ HTML » carte↔fiche — déjà approximatif avant le rename (carte = 3 faces/2 portes, fiche = 2 cartes/3 familles). |

---

## 6. État des corrections (post-audit, 2026-09-22 — même jour)

Exécuté immédiatement après le verdict, **toujours sans toucher le moteur** (0 ligne d'invariant listé §1) :

| Finding | État | Détail |
|---|---|---|
| **P2-1** docs historiques | ✅ **CORRIGÉ** | Tampon « Libellés §14 » posé en tête de `AUDIT_APPROCHE_APP.md`, `AUDIT_CORRECTEUR_MEFTAH_2026-09-19.md`, `CROISEMENT_OKACHA_MEFTAH_2026-09-20.md`, `SPEC_BOUSSOLE_NSOE.md` (MARQUE = historique volontaire, non tamponné). |
| **P3-1** assertion `أقرأ` faible | ✅ **CORRIGÉ** | Les 3 familles ancrées sur leur badge : `🟡/🟢/🟣 <span class="big">…</span>` — anti faux positif. |
| **P3-2** anti-tautologie non verrouillée | ✅ **CORRIGÉ** | `must(recto, 'دون نسخ التعليمة')` ajouté — hérite de la protection v5 « لا يُعيد نص السؤال ». |
| **P3-3** `errorAddressAr()` « mort » | 🔄 **RE-VISITÉ — CONSERVÉ** | Contrainte découverte **pendant l'exécution** : `SPEC_BOUSSOLE_NSOE.md` l'importe dans sa liste d'API (`{…, errorAddressAr, ErrorAddress}`) et il vit avec `ERROR_REMEDY_MAP` + `groupErrorsByAddress()` **présents et vivants**. L'audit initial avait classé « mort » sur la seule base `src/` sans croiser la spec — **annulation de la suppression** (restauré à l'identique). Recommandation corrigée : **brancher** sur l'UI stats des erreurs en roadmap, ne pas supprimer. |
| **P2-2** compte 4 dents vs 5 gestes | ⏸️ **OWNER** | Choix α déjà acté §14 ; à trancher au test utilisateurs D3. |
| **P3-4** réclamation « مطابقة 100% » | ⏸️ **OWNER** | Recopie UI de l'équipe — aucune modification sans arbitrage. |

**Bilan d'exécution** : 4 docs tamponnés · 4 assertions renforcées/ajoutées · 0 suppression finale · **0 ligne de moteur touchée** · `boussoleData.ts` = **diff nul** sur ce passage.
**Suite post-correctifs** : `check:miftah` **153 ✓/0✗** (net +1) · tsc 0 · v2 0 · vitest **1004/1004** · npm test **138/138**.

---

## 7. ✅ Ce que l'audit confirme (synthèse)

1. **« Sans toucher le moteur » est prouvé**, pas seulement affirmé : 16 invariants byte-identiques, 0 couplage nom→logique, diff entièrement classifiable en libellés/commentaires/version.
2. **Le garde-fou est plus fort qu'avant** (130 vs 126, +2 `mustNot` anti-régression sur l'ancien nom, A4 couvert, M4 intact).
3. **Un seul vocabulaire public** : spec = carte = boussole = compilateur = fiche = `فعل · دليل · علاقة · جواب` (+ فحص en ceinture), version `6.0` cohérente partout.
4. **Rien n'est cassé** : suite 100 % verte fraîche, arbre propre, historique git lisible (`59623cf` pushé, `56fe1d4` ci local en attente de permission `workflows`).
5. **Seules dettes** : 4 docs historiques (P2-1), 2 réclamations UI préexistantes (P2-2, P3-4), 3 micro-assertions opportunistes (P3-1/2/3) — **aucune ne justifie de toucher le moteur**.

---

*Method : `git show 59623cf` hunk-classification · comparaison de blocs extraits `53337e1`↔`HEAD` (regex, neutralisation des seuls champs de libellé) · grep de couplage sur 8 libellés · inventaire d'assertions par diff regex (126→130) · intégrité HTML (balance de tags, ressources, interdits) · suite complète fraîche.*
