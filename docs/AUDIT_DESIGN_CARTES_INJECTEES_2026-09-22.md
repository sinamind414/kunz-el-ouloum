# Audit design — cartes injectées (📝 خلاصة / 🏛 حصيلة / 🗺 مخطط)

**Date :** 2026-09-22 · **Périmètre :** 22 leçons passives · **Pilote refondu :** `phase7_chapitres_13_14.html`
**Motif :** « l'élève ne se retrouve pas » — audit factuel du HTML/CSS réel, puis refonte pilote validable.

---

## 1. Constat (AVANT) — chiffres issus du code réel

| # | Problème | Preuve mesurée |
|---|---|---|
| A1 | **Hiérarchie illisible en fin de leçon** : 3 cartes empilées au même gabarit `.card + bord coloré` — l'élève voit 3 boîtes jumelles, pas 3 fonctions différentes | `resume`, `hosila`, `schema-synthese` = tous `section.card` avec bord 2px, même padding 2rem |
| A2 | **100 % styles inline, zéro classe** : hex codés en dur, aucune réutilisation des tokens du design system (`var(--primary)`…) | 🗺 phase7 : 15 attributs `style=` pour 1 carte ; 📝 : 9 |
| A3 | **Méta-langage exposé à l'élève** : notices d'archivage en gris au milieu du cours, français mélangé à l'arabe | « (OCR rendu lisible) », « ancrage 12/12, verrou resumes.lock » **visibles par défaut** dans la carte 🗺 |
| A4 | **Typographie aplatie** : 10,5 → 14 px mélangés dans une même carte ; corps à 11,5–13 px (petit pour lecture prolongée) | 🗺 phase7 : 6 tailles différentes (10.5/11/11.5/12.5/13/14) |
| A5 | **🏛 = mur de texte** : un seul paragraphe gras, aucune mise en scène de « texte officiel » ; surlignage des mots-clés sur **1 carte sur 11** seulement | 10/11 hosila : 0 `span` couleur ; phase7 : 1 |
| A6 | **📝 = liste plate** : question et ligne « 🔑 المصطلح المفتاح » noyées dans le flot, sans conteneur | question = simple `<p>` gras ; clé = `<p>` ambre sans boîte |
| A7 | **Nav sans repère de zone** : 📝 🏛 🗺 même style que les 8 liens d'étapes — la zone de synthèse est invisible dans la navigation | `.sommaire a` unique ; aucun séparateur de groupe avant 📝 |
| A8 | **🗺 layouts internes hétérogènes** entre les 5 cartes (flex ×2 / ol / flex+ol) | phase2 flex=2, phase7 flex=1, phase10 ol=1, phase20 flex+ol, phase22 ol |

## 2. Refonte (APRÈS) — principes appliqués au pilote phase7

**Un langage visuel par fonction** (couleur + forme + fond différenciés), **une échelle typographique unique** (corps 15 px, interligne ≥ 2), **zéro méta-langage visible** :

| Carte | AVANT | APRÈS |
|---|---|---|
| 📝 خلاصة | carte verte plate, question noyée, clé sans boîte, 13-14 px | fond dégradé vert pâle, **question en pastille `#dcfce7`**, liste à marqueurs verts, interligne 2.05, **clé en boîte ambre pointillée**, corps 15 px |
| 🏛 حصيلة | bord ambre + paragraphe unique, méta en 11 px | fond **parchemin `#fffbeb`**, guillemet décoratif `❝` en filigrane, **chip unité** + citation 16 px avec mots-clés surlignés `.kw`, **footer source** « 📖 النص الرسمي… مطابقة نصية 100 % » (le message de fiabilité remplace la mention OCR) |
| 🗺 مخطط | image + notices gris visibles + legend flex ad hoc | **`figure/figcaption`** (« اقرأ الشرح الملوّن أسفله 👇 »), **grille de légende** 3 colonnes auto-adaptative, ligne-clé en bandeau `#eff6ff`, **notices d'archivage repliées dans `<details>` « للأستاذ »** — invisibles par défaut |
| Nav | 3 liens noyés | **séparateur + label de zone « 🎯 التثبيت »** (badge vert) avant les 3 liens |

**Garanties de contenu :** aucun texte supprimé — tout jeton du verrou conservé (les notices ne sont que repliées) ; verrou **21/21 ✓**, suite **899 passed + 4 skipped**, `check:v2` ✓, build ✓ après refonte.

## 3. Décisions de design (à valider avant généralisation)

1. **Code couleur fixe** : 📝 vert (réviser) · 🏛 ambre/or (texte officiel) · 🗺 bleu (visualiser) — identique sur les 22 leçons.
2. **L'élève ne voit plus** : mentions OCR, « ancrage », français technique → uniquement dans `<details>` ou commentaires HTML.
3. **Message de confiance positif** sur 🏛 : « مطابقة نصية 100 % مع الكتاب » au lieu de « OCR rendu lisible ».
4. **Classes CSS > inline** : le bloc CSS « Zone التثبيت » (dans le pilote) devient le pattern à injecter dans les 22 leçons — un seul endroit à modifier pour changer tout le rendu.
5. Font-size corps : 15 px (au lieu de 11,5-13) ; interligne ≥ 1,95.

## 4. Plan de généralisation (après validation du pilote)

Script unique `inject_design_system.py` : injecter le bloc CSS + re-ligner les 21 autres leçons sur les 3 gabarits (mêmes transformations mécaniques que phase7, textes préservés, verrou exécuté après chaque fichier). Estimation : ~30 min, 0 risque sur le contenu (verrou 21/21 + suite complète en garde-fou).

## 5. Limites avouées

- Audit statique (HTML/CSS) : pas de capture d'écran navigateur dans cette session — le rendu exact est à valider visuellement sur le pilote.
- Les 25 cartes 📝 sont **cohérentes entre elles** (même script d'origine) : le problème n'est pas leur variabilité mais leur platitude — d'où la refonte gabarit, pas le rattrapage fichier par fichier.
- Rollout + push impossibles ici (session GitHub close) : tout est prêt en local, commit `design-pilot` sur la branche arena.
