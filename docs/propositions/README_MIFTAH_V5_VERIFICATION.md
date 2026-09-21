# مفتاح v5.0 — vérification du 5ᵉ audit + patch appliqué (2026-09-20)

**Inputs.** Proposition v5.0 (HTML collé par le propriétaire, archivé bit-à-bit ici :
`miftah_v5.0_proposition.html`) + 5ᵉ audit (externe, sans accès repo). Cette note livre
ce que l'audit a demandé : (a) le fichier patché, (c) les faits réels de
`scripts/check-miftah.ts` (313 lignes, ~90 assertions) et `src/data/miftahSpec.ts`.

## 1. Vérification des 3 nouveautés de l'audit — TOUTES EXACTES

| Finding | Vérification mécanique | Verdict |
|---|---|---|
| N10 (« أربع أدوات » vs 5 sections) | verso : lettres أ,ب,ج,د,**ك** (هـ sauté — employé au recto) ; « أربع أدوات » ×1 ; « أ – د » brand ×1 ; teacher « (أ–د) » ×1 | ✓ réel ; **Option A appliquée** (★, réversible) |
| N11 (newline avalé dans `.app`) | 2 occurrences de `Ouloum\nv5.0` | ✓ diagnostic juste — **mais le patch #13 de l'audit est un NO-OP** (newline→newline ; c'est ce newline qui collapse). Fix réel appliqué : `<br>` ×2 |
| C4 (3ᵉ occurrence damma) | `المختبَر` sans damma : **3** exactement (table تجربة, bloc `.check`, « الفرضية المختبَرة ») ; `المُختبَر` : 0 | ✓ confirmé, les 3 corrigées |

## 2. Score définitif du v5.0 intégral contre le garde-fou fiche

**26/52 assertions passent, 26 échouent** (recorrent la méthode des 52 assertions fiche
de `check-miftah.ts`). Correction de mon estimation antérieure « 25/52 » (calculée sur
extrait) : le fichier intégral PASSE en plus la meta description + les 5 tokens print A4
(`@page{size:A4`, `page-break-before:always`, `10.4px`, `1.58`, `168px×58px`) — preuve
que le v5.0 dérive bien de la fiche mère. Il échoue en plus sur `mustNot(علوم الطبيعة
والحياة)` au verso — voir N12.

## 3. N12 (nouveau — trouvé ici, ni par les 5 audits ni par mes 2 passes)

`check-miftah.ts` §12ter fige : `mustNot(verso, 'علوم الطبيعة والحياة')` (décision v3.3 :
« nom de série ≠ matière, régression doc PRO »). Or le verso v5.0 contient ce littéral
dans le h3 « هيكل البكالوريا — ع ت / علوم الطبيعة والحياة ». **Le patch #9 de l'audit
conserve le littéral → l'échec persiste après patch.** Deux sorties à la migration :
- (i) h3 sans le nom de matière (ex. « هيكل البكالوريا — الشعبة العلمية والتقنية ») —
  respecte la décision figée ;
- (ii) garder le h3 et réviser l'assertion du garde-fou (le bannissement visait un usage
  *série*, pas la matière elle-même) — `MARQUE.md §13bis` doit le documenter.
Recommandation : (i), plus simple et conforme à l'historique. *(Non appliquée au fichier
patché : décision propriétaire.)*

## 4. Faits du garde-fou utiles à la décision (livrable c)

- **N9 reste facultatif** : le guard asserte le PRÉFIXE `<title>المفتاح · مفتاح
  المنهجية` — le title v5.0 le satisfait déjà.
- **Versions couplées** : `MIFTAH_VERSION='3.3'` (spec) + `MIFTAH_MANHAJIA_VERSION='4.3'`
  (extension) + « V4.1 »/« V4.3 » littéraux bannis → la migration v5.0 doit bump les
  deux constantes et leurs assertions.
- **§13 (2026-09-15)** : le nom officiel n'existe qu'une fois dans le code
  (`miftahSpec.MIFTAH_NAME_OFFICIAL_AR`) ; App.tsx (3 emplacements), DashboardView,
  MeftahView, MethodologyCompilerView l'importent — tout littéral dans les vues = échec.
- **Parité 4 artefacts** : fiche ↔ MiftahCard.tsx ↔ miftahSpec.ts ↔ compilateur, chaque
  contenu (dents, formule dorée, route, annexe, drill) est asserté des DEUX côtés.
- **Assertions M4** : barèmes 5/7/8=20, registre attendus (Σ=maxPts, débordement sourcé
  0.5 sur S2-Ex1), parité S1-Ex1 1.25/3.75 — indépendantes de la v5.0, intactes.

## 5. Patch appliqué (13 lignes) — journal

`miftah_v5.0_proposition_patchee.html` = proposition + 13 patches, chacun à occurrence
exacte (12×1 + 1×2), zéro résidu vérifié. Écarts à la table de l'audit :
- **#13 corrigé** (no-op → `<br>` ×2) ;
- **#12 = Option A** (`★`), recommandée par l'audit, réversible ;
- hygiène appliquée : `--teal2` et `.opt.c` vérifiés inutilisés puis supprimés.

## 6. Les 6 décisions restantes (propriétaire seul) — recommandations

1. **Formule dorée + route** (dent علاقة) → réintégrer (la mécanique la plus recopiable).
2. **شجرة نسب بحكم واحد** → conserver comme erreur 4 du verso.
3. **الحدّاد** (prototypes atypiques) → recréer le filet (3ᵉ forme spéciale, verso).
4. **Annexe PRO + « لا أبحث عن جواب فقط »** → à mon avis garder en distribution sur
   demande (le v5.0 la supprime) — à arbitrer.
5. **N10** → Option A (appliquée).
6. **N12** → h3 sans nom de matière (option i).

**Statut** : fond v5.0 adopté par les 2 audits (accord). GO migration = réécrire
spec/carte/compilateur/MeftahView + check-miftah (nouvelles décisions figées) +
`MIFTAH_VERSION 5.0` + `MARQUE.md §13bis`, avec les défauts ci-dessus tranchés.
