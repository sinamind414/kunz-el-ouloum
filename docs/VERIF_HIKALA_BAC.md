# Vérification croisée — fiche « هيكلة موضوع البكالوريا » (source fournie le 2026-09-19)

**Source :** fiche « هيكلة موضوع البكالوريا – شعبة الرياضيات — أستاذ زكرياء » (dzexams), **contenu collé** (le PDF n'a pas transité ; les deux autres documents attendus — livre prof 3AS, التدرج السنوي eddirasa — ne sont **pas** arrivés).
**Statut de vérité :** fiche pédagogique de synthèse, **PAS une circulaire ministérielle** → valeur de corroboration, pas d'autorité.
**Production :** `src/data/hikalaBac.ts` (données encodées) + `src/data/hikalaBac.test.ts` (verrous) — **195/195 tests verts**.

## 1. Ce que la fiche CONFIRME (croisage repo)

| Affirmation de la fiche | Vérification dans le repo | Verdict |
|---|---|---|
| Format A : T1=5, T2=7, T3=8 (40/35/25 %) | `CALIBRATION_BAC2025` (maxPts 5/7/8), `MEFTA_BAC_EXERCISES` (5ن/7ن/8ن), `evaluer-copies.ts` | ✅ Concordance totale — verrouillé par test |
| T1 = استرجاع + تنظيم وهيكللة · T2 = استدلال علمي · T3 = مسعى علمي تجريبي + حصيلة تركيبية | `meftahManhajia.bac-structure` (« استرجاع وهيكلة / استدلال علمي / مسعى علمي : فرضيات ثم مناقشة ثم حصيلة ») | ✅ Meftah conforme — verrouillé |
| Sند : T1=1, T2≤2, T3≤2 · أشكال : ≥2/≥4/≥5 | Coherent avec les sujets bac2025 du dictionnaire (Ex3 = 3 شكل T.P) | ✅ encodé |
| « اقترح فرضية » = famille du T2, « صادق على صحة الفرضية » = T3 | bac2025-S1 réel : les DEUX dans le T3 (q1 : 2,5 pts ; q2 : 4,5 pts) | ⚠️ Les verbes migrent — la fiche donne la famille d'origine, pas une cage. Documenté dans `hikalaBac.ts` |

## 2. Ce que la fiche NE TRANCHE PAS — et ce qui l'a tranché depuis

**M2 est CLOSED (même journée).** La fiche ne donnait pas la ventilation ; l'**إجابة النموذجية الرسمية** (`correction-bac-sci-sciences-2025.pdf`, eddirasa) l'a donnée : Ex1 Q1 = 0,25×5 = **1,25 pt**, Q2 = **3,75 pt** (RIP 1,25, annonce 0). Le dictionnaire = transcription exacte ; Meftah corrigé (1,25/3,75) et l'Ex2 reparé (7,5 → 7 : 1,5/2,5/2,5/0,5). Verrous : `hikalaBac.test.ts` (sommes + parité dictionnaire). Détail complet : `AUDIT_CORRECTEUR_MEFTAH_2026-09-19.md` §M2.

## 3. Caveats à ne pas oublier

1. **شعبة الرياضيات** : la fiche est libellée pour la filière Math (avec un FORMAT B à 2 exercices : 6-8/12-14 pts). Le repo cible **علوم تجريبية**. Le format A coïncide avec la structure SE réelle (preuves : les 80 copies bac2025), mais la fiche ne fait pas autorité pour la filière cible.
2. **Source non officielle** (enseignant, agrégateur) : tout ce qu'elle « confirme » est une concordance, à consolider sur les textes ministériels.

## 4. NOUVEAU constat quantifié — la dette de couverture des أفعال (croisage fiche ↔ scoreur)

La fiche liste les أفعال إدائية officiels par exercice. Croisés avec les 12 cartes du scoreur (`VERB_CARDS`) :

- **~40 % des occurrences de verbes officiels ont une carte** (mesuré, verrouillé < 50 %).
- Par ratio, le **T1** est le moins couvert (35,7 %) — hypothèse initiale « T3 le pire » **fausse** (37,5 %), corrigée après mesure.
- Le fait qui compte : **T2+T3 (15 points sur 20) portent 17+ occurrences sans carte**, dont les majeurs : **ناقش، علّل، برّر، أثبت، استخرج، برهن، بين، صغ المشكل**.
- Conséquence produit : l'app **entraîne et note** 12 verbes ; l'examen en mobilise ~25. Les 8 points du مسعى (ناقش/برهن/صغ المشكل/حصيلة تركيبية) sont le plus gros angle mort — coherent avec l'audit C7 mais désormais **chiffré et verrouillé par test** (`hikalaBac.test.ts` échoue le jour où la dette est traitée — signal de mise à jour).

## 5. Prochaines sources attendues (pour clore)

| Document | Ce qu'il tranchera |
|---|---|
| **إجابة نموذجية bac2025** (PDF officiel) | M2 : 0,5/4,5 vs 1,25/3,75 — la seule autorité possible |
| **التدرج السنوي 2017** (eddirasa) | Traçabilité réelle des mots-clés [L5] du correcteur (échantillon 30 termes) |
| **Livre prof 3AS** | Niveau d'exigibilité (frontière exigible/enseigné que la banque d'unité confond) |
