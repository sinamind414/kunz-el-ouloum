# Audit QCM bilan — effectifs, alignement programme et résumés (2026-09-20)

**Objet.** Le pool du mode « اختبار تشخيصي شامل » (91 items = 50 quiz de leçons +
41 QCM de la banque livre) : nombre par domaine, alignement avec le programme
(livre officiel, par unité) et avec les résumés (بنك الحفظ عكاشة, par unité).
Méthode : ancrage lexical mécanique (normalisation AR partagée, jetons ≥ 5 car.)

## 0. Découverte structurante — les slugs de leçons mentent

Le nommage `phaseN_chapitres_A_B` ne reflète PAS le contenu. Mesuré (titles/breadcrumbs) :

| Slug | Titre réel | Rattachement réel |
|---|---|---|
| `phase5_chapitres_9_10` | الذات واللاذات (CMH/HLA والزمر الدموية) | **U4 دفاع** (pas ch9-10 enzymes) |
| `phase9_chapitres_17_18` | آلية النقل المشبكي (ACh) | **U5 عصبي** (pas ch17-18 immunité) |
| `phase19_chapitres_37_38` | الموجات الزلزالية | **D3-U2 بنية الكرة** (pas ch37-38 respiration) |
| `phase11_…`→`phase15_…` | photosynthèse/énergie | **D2** (les slugs disaient ch21-30 = D1) |
| `phase16_…`→`phase22_…` | tectonique | **D3** (slugs disaient D2/D3 mélangés) |

**La breadcrumb (« المجال … • الوحدة … ») est la source de vérité.** Correction appliquée
à `qcmBilan.ts` : `META_LECONS` extrait mécaniquement (domaine + unité globale 1-11)
de la breadcrumb des 25 leçons (25/25 parsées, exceptions = throw). L'override
phase21 (patch antérieur) est supprimé — inutile. **Impact : les domaines du bilan
étaient faussés pour ~13 items ; le diagnostic par domaine de l'app est désormais juste.**

## 1. Effectifs (après correction, figés par `qcmBilan.lock.test.ts`)

**Par domaine : D1 = 46 (51 %) · D2 = 16 (18 %) · D3 = 29 (32 %).**

| Unité | Chapitres | Items (banque+leçons) | Résumé okacha | Verdict |
|---|---|---|---|---|
| u1 تركيب البروتين | ch1-5 | **10** (2+8) | ✓ | OK |
| u2 بنية-وظيفة | ch6-8 | **3** (0+3) | ✓ | 🔴 trou |
| u3 إنزيمات | ch9-12 | **3** (0+3) | ✓ | 🔴 trou |
| u4 دفاع الذات | ch13-23 | **18** (12+6) | ✓ | riche |
| u5 اتصال عصبي | ch24-30 | **12** (6+6) | ✓ | OK |
| u6 تركيب ضوئي | ch31-34 | **6** (2+4) | ✓ | 🟡 mince (C32-34 : photosynthèse = 2 QCM banque seulement) |
| u7 respiration | ch35-40 | **8** (4+4) | ✓ | OK |
| u8 تحويلات (synthèse) | ch41 | **2** (0+2) | ✗ (absent d'عكاشة) | 🔴 trou + pas de résumé |
| u9 plaques | ch42-44 | **7** (1+6) | ✓ | OK |
| u10 globe | ch45-47 | **7** (3+4) | ✓ | OK |
| u11 phénomènes | ch48-55 | **15** (11+4) | ✓ | riche |

## 2. Alignement avec le programme (livre officiel)

- **Banque livre : 41/41 (100 %)** — chaque QCM touche lexicalement le texte de son
  unité (C18 inclus : son unité u4 porte le texte LTc/CMH des chapitres voisins).
- **Quiz de leçons : 50/50 (100 %)** une fois rattachés à leur VRAIE unité (breadcrumb).
  Le « 76 % » mesuré avant correction était un artefact : on comparait les QCM nerveux
  au texte de l'immunité, la géologie à la respiration, etc.
- **Verdict : alignement programme TOTAL.** Aucun QCM hors programme détecté dans le
  pool (les 2 « culture générale » historiques Q30/Q31 de l'audit antérieur sont hors
  pool — phase22 n'a pas de quiz... vérifié : 0 item de phase22 dans les 50).

## 3. Alignement avec les résumés des leçons (بنك الحفظ عكاشة)

- **48/50 (96 %)** : chaque QCM de leçon partage du lexique avec le récapitulatif
  numéroté de son unité.
- Les 2 exceptions (`phase15:1-2`, u8) sont **structurelles** : l'unité u8 n'a PAS de
  résumé dans عكاشة (le livre fusionne D2 en 2 unités) — rien à comparer, pas un
  défaut des QCM. À noter : ces 2 QCM sont ancrés au livre à 100 % (§2).

## 4. Verdict et recommandations

**Qualité : BONNE et maintenant mesurée** — alignement programme 100 %, résumés 96 %,
zéro hors-programme. Les faiblesses sont d'**effectif**, pas de fond :

1. **D2 = 16 items (18 %)** contre ~27 % du programme (3 unités/11) et ~1/3 du sujet
   bac → **épaissir en priorité** : photosynthèse C32-34 (2 QCM banque seulement),
   et u8 (1 chapitre, 2 items, sans résumé — candidat : rédiger un résumé propriétaire
   ou reprendre PROGRAMME NATIONAL §D2-U3 après vérification).
2. **u2 (3) et u3 (3)** : banque = 0, tout repose sur 3 quiz de leçons chacun → +2-3
   QCM banque chacun (SVGs existants : schémas 17/24 transcription-polysome… pour u1-u2).
3. Diagnostic app : le tirage bilan (5/domaine) échantillonne D2 sur 16 items — la
   variabilité est limitée ; après épaississement D2→25+, le diagnostic gagnera en
   finesse.

**Corrections déjà poussées avec cet audit** : `META_LECONS` (breadcrumb) dans
`qcmBilan.ts` + verrou re-figé (46/16/29) — le bilan de l'app diagnostique désormais
sur les vrais domaines.
