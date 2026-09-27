# Diagnostic Ex3 — d'où vient le MAE de 1,30 ?

**Date :** 2026-09-27
**Corpus :** 40 copies bac2025 Sujet 1, anonymisées (`ELEVE_01`…`ELEVE_40`)
**Cible :** Exercice 3 (8 pts) — Ado / A1R / Mtb / NE — sommeil et thé
**Référence :** `docs/SUPERVISION_ACTUEL.md` (MAE Ex3 = 0,96, biais +0,66 — après E)

Reproduction : `npx tsx scripts/diagnostiquer-ex3.ts` puis `npx tsx scripts/simuler-fix-ex3.ts`.

> **STATUT (2026-09-27) : E EST APPLIQUÉE** dans le moteur — champ
> `poidsPartie` sur `S1_EX3` (`attendusBac2025.ts`) + branche correspondante
> dans `noterExerciceCalibre` (`calibrationBac2025.ts`). La section 5 consigne
> la décision et ses limites. La correction E n'est **pas validée** sur copies
> indépendantes (§5 point 4) : elle est mesurée, pas acquise.

---

## 1. Symptômes

| | MAE | biais | copies surnotées |
|---|---|---|---|
| Ex3 | **1,30** | **+1,20** | 31 / 40 |
| Ex1 | 0,64 | — | — |
| Ex2 | 0,84 | — | — |

Ex3 est le seul exercice qui échoue la porte F5 (`MAE ≤ 1,0`). Aucun plafond
d'intégrité et aucune sanction forte ne se déclenchent (40/40 copies) — le
défaut n'est donc pas de l'anti-triche, il est dans la **conversion
couverture → note**.

## 2. Cause A — le registre sur-pondère la Partie 1 (cause principale)

Le barème officiel de l'exercice (RECAPITULATIF + corrigé p.2-4) ventilé en
trois parties :

| Partie | Officiel | Registre `S1_EX3` | Écart |
|---|---|---|---|
| Partie 1 (lecture figures a/b, 2 conclusions, hypothèses) | **1,5** | 3,5 | ×2,3 |
| Partie 2 (mécanisme : NE, Go/Gi, canaux, vésicules) | **4,5** | 3,5 | ×0,78 |
| Partie 3 (conseils + schéma) | **2,0** | 1,0 | ×0,5 |

La Partie 1 est la partie **facile** : il suffit de nommer « المجموعة 1 » et
« النشاط العصبي » pour décrocher 0,5 pt. Le moteur lui accorde 3,5 pts
maximum alors que l'officiel n'en donne que 1,5. C'est mécaniquement la source
du biais +1,20 : 40 copies sur 40 sont surnotées par construction.

**Correction E (0 paramètre ajusté)** : re-pondérer chaque partie sur le barème
officiel. Mesurée sur le moteur réel, **puis livrée** :

| Variante | MAE | biais | Statut |
|---|---|---|---|
| actuel (modèle plat `couverture × maxPts`) | 1,30 | +1,20 | ancien moteur |
| **E (barème officiel des parties)** | **0,96** | **+0,66** | **livré 2026-09-27** |
| régression linéaire fitée (0,82·c−0,15) | 0,66 | — | rejetée (P2/R6) |

La régression fitée donne un meilleur MAE mais **elle est rejetée** : c'est
exactement le modèle `a·cov+b` que la règle P2/R6 interdit (fit sur les notes
plutôt que sur les attendus officiels). La correction E n'utilise **que** les
chiffres du barème officiel — aucun paramètre libre — et passe la porte F5.

**Formule livrée** (`calibrationBac2025.ts`) : pour chaque partie `p`,
`note = Σₚ crédit(p) × officiel(p) / registre(p)`, clampée à `[0, maxPts]`, puis
soumise aux plafonds d'intégrité. Sans `poidsPartie` — ou si la map oublie un
item auto — le moteur retombe sur le modèle plat (sécurité, testée). Une copie
ne couvrant que la Partie 1 obtient 1,5/8 (et non 3,5/8).

## 3. Cause B — l'item `corr-2025-19` (NE) est inaccessible (0/40)

L'item vaut 0,5 pt et exige la forme `النورادرينالين` (ou
`norepinephrine`/`noradrenaline`). **Les 40 élèves écrivent « NE »** en lettres
latines (label du corrigé lui-même). Aucun n'écrit le nom complet arabe.

Résultat : 0/40 crédités, 20 pts accumulés non distribués. Avec E, les 5
meilleures copies plafonnent à **7,36/8** (1,5 + 3,0×(4,5/3,5) + 2,0) au lieu
de 8 — et la **copie modèle officielle elle-même** (`bac2025-ex3` dans
`MEFTA_BAC_EXERCISES`) plafonne à 7,36/8 pour la même raison : le corrigé
écrit « NE », jamais `النورادرينالين`. L'item rejette donc la réponse
officielle : bug de formes avéré, pas un défaut des élèves (les notes modèles
7,36 sont verrouillées dans `src/utils/__tests__/c7.hardening.test.ts` et
`src/components/Bac2025ExamView.test.tsx`).

**Mais attention :** ajouter bêtement la forme `ne` **aggrave** le défaut :

| Variante | MAE | biais |
|---|---|---|
| ajouter `ne` (forme simple) | 1,72 | +1,68 |
| `ne` + E | 1,38 | +1,28 |

Le label « NE » est trop bon marché : il crédite 0,5 pt pour deux lettres, et
comme les copies sont **déjà** surnotées sur la Partie 2, l'ajout empire. La
bonne correction n'est pas un label — c'est la **relation** : il faut
réécrire l'item en COMPOSANTES (terme NE **ET** verbe de baisse :
`نقص`/`يقلل`/`تناقص`). Testée en composantes, la note remonte encore trop :
le moteur sur-crédite la Partie 2 dans son ensemble. **Conclusion : l'item 19
doit attendre la réécriture F2 (rubrique par critères observables)**, il ne
peut pas être corrigé par ajout de forme.

## 4. Cause C — résiduel +0,66 : présence ≠ raisonnement

Même après la correction E, il reste un biais de +0,66. Les items les plus
crédités sont les moins exigeants :

| item | pts | crédités /40 | exigence |
|---|---|---|---|
| corr-2025-13 (المجموعة 1 + النشاط العصبي) | 0,5 | **39** | nommer |
| corr-2025-18 (فرضية + يرتبط mtb) | 1,0 | **39** | citer |
| corr-2025-20 (يقلل افراز) | 0,5 | 38 | citer |
| corr-2025-23 (صحة الفرضية 1) | 0,5 | 37 | citer |
| **corr-2025-19 (NE)** | 0,5 | **0** | forme inatteignable |
| corr-2025-21 (قنوات + حويصلات) | 1,0 | 22 | mécanisme |
| corr-2025-25 (نعاس + يقظة) | 0,5 | 21 | schéma |

Le prof crédite peu une réponse qui énumère des termes sans la chaîne causale.
Ce résiduel est le **défaut F2/C6** des audits : `cᵢ` reste une présence de
forme, pas un critère observable (donnée / mécanisme / relation / conclusion).
Aucune pondération ne le corrige — seule la réécriture en rubrique le peut.

## 5. Décision

**E est appliquée** depuis le 2026-09-27 (commit à venir) :

1. **E (appliquée)** : les parties de `S1_EX3` sont ventilées sur le barème
   officiel (P1 1,5 · P2 4,5 · P3 2) via le champ `poidsPartie`. Effet mesuré :
   MAE 1,30 → **0,96** (porte F5 franchie), biais +1,20 → **+0,66**, r Ex3
   0,882 → 0,904, r global 0,967 → 0,972. Zéro paramètre fité, traçable au
   corrigé. 1207/1207 tests verts, `tsc --noEmit` propre.
2. **Item 19 : ne PAS ajouter la forme `ne`** (mesuré : 1,72 en forme simple,
   1,38 en composantes — aggravation dans les deux cas).
3. **Réécrire l'item 19** en critères observables lors du chantier F2, avec
   re-lecture par 2 enseignants. En attendant, le plafond 7,36/8 est assumé et
   documenté (§3) : la copie modèle officielle le subit aussi, ce qui rend le
   bug évident plutôt que masqué.
4. **Valider E sur des copies indépendantes** (protocole F5 : 300 copies,
   double correction aveugle, 20 % arbitrées) avant de le considérer acquis.
   Sur ce corpus, E est mesuré — pas validé.

Tant que le résiduel +0,66 n'est pas résolu par F2, la note Ex3 reste une
**aide à la vérification**, pas un correcteur — ligne rouge des deux audits.
