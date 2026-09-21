# Analyse approfondie — « PROGRAMME NATIONAL SVT CLAUDE OPUS - Copie.MD »

**Date** : 2026-09-20 · **Source** : upload GitHub master (commit `5548459`) · Fichier local :
`uploads_externes/PROGRAMME NATIONAL SVT CLAUDE OPUS - Copie.MD` (10 007 lignes, 620 Ko).
Complète `docs/ANALYSE_UPLOADS_LIVRES_2026-09-20.md` (analyse de surface des 6 fichiers).

> **Verdict en une phrase** : le meilleur des 6 uploads — cours de synthèse structuré,
> corrigés présents, contenu scientifique majoritairement EXACT (vérifié point par point)
> — mais **trou pédagogique D2-U2 (6 chapitres du livre)**, **divergence ATP (32 vs 38 du
> référentiel)** avec **incohérence interne**, **zéro figure réelle**, et **données de
> documents simulées** (générées, pas mesurées). Utilisable après 3 correctifs.

---

## 1. Carte d'identité et provenance

- **Provenance IA confirmée par le document lui-même** : l.484 « 🗺️ وصف الرسوم التوضيحية
  (لتوليدها بأدوات الذكاء الاصطناعي) » — le texte contient des *descriptions destinées à
  générer des figures*, jamais les figures. (Le nom de fichier « CLAUDE OPUS » est la
  seule autre indication ; aucune mention interne d'outil.)
- Structure de synthèse (pas un cours par les documents) : أهداف → محتوى → ملخص →
  تمارين → إجابات نموذجية → اختبار تجريبي → سلّم تنقيط → نصائح.

## 2. Ossature : 9 unités au lieu de 11 — le trou D2-U2

| Domaine | Unités du compendium | Unités officielles | Chapitres livre |
|---|---|---|---|
| D1 proténines | 5/5 (U1 تركيب, U2 بنية-وظيفة, U3 إنزيمات, U4 دفاع, U5 اتصال عصبي) | 5/5 ✓ | C1-C17 |
| D2 énergie | **2/3** (U1 photosynthèse, U3 « تحويل الطاقة على المستوى الخلوي ») | 3/3 — **U2 absente** | C31-C41 |
| D3 tectonique | 3/3 (U1 نشاط الصفائح, U2 بنية الكرة, U3 ظواهر وبنيات) | 3/3 ✓ | C42-C55 |

**Le trou** : l'unité officielle D2-U2 = **C35-C40** (تذكير، مقر الأكسدة التنفسية =
mitochondrie، التحلل السكري، حلقة كريبس، الفسفرة التأكسدية، الوسط اللاهوائي/التخمر).
Le compendium **numérote U3 sans écrire U2** ; la matière existe en partie dans D2-U3
(sections « العلاقة بين التركيب الضوئي والتنفس الخلوي » l.6103 et « الحصيلة الطاقوية
المقارنة الشاملة » l.6229, avec tableau glycolyse/Krebs/FS تأكسدية l.5610-5633 et
مخطط شامل l.5634) — mais en forme **comparative/synthétique**, pas selon la démarche
expérimentale officielle (levures l.3772, mitochondrie l.3810, étapes C37-C40).

## 3. Inventaire pédagogique mesuré

| Unité | تمرين | Corrigés | Test bac | 
|---|---|---|---|
| D1-U1 تركيب البروتين | 5 | ✓ | — |
| D1-U2 بنية-وظيفة | 5 | ✓ | — |
| D1-U3 إنزيمات | 5 | ✓ | — |
| D1-U4 دفاع الذات | 5 | ✓ | — |
| D1-U5 اتصال عصبي | 13 | ✓ | ✓ (test D1) |
| D2-U1 تركيب ضوئي | 6 | ✓ | — |
| D2-U3 énergie cellulaire | 13 | ✓ | ✓ (test D2) |
| D3-U1 نشاط الصفائح | 5 | ✓ | — |
| D3-U2 بنية الكرة | 5 | ✓ | — |
| D3-U3 ظواهر تكتونية | 9 | ✓ | ✓ (test D3) |

Total ~71 exercices, tous avec corrigés (🔑 ×64) ; 3 tests de 4 exercices (20 pts),
chacun avec سلّم تنقيط تفصيلي + نصائح. 54 tableaux, 235 blocs ASCII.

## 4. Contrôle factuel (chaque point vérifié, pas « lu en diagonale »)

| Point contrôlé | Verdict | Preuve/Ancre |
|---|---|---|
| Test D1 ex.1 : transcription/peptide | ✅ **EXACT** | brin 3'TAC…ATG5' → ARNm 5'AUG-CCC-UUA-GCA-ACU-UAG-UAC3', peptide Met-Pro-Leu-Ala-Thr, stop UAG, GCA→GCG silencieuse — revérifié indépendamment ; leur corrigé identique |
| Potentiels nerveux (-70 mV, seuil -55) | ✅ correct | l.3291, 3373 |
| CMH-I toutes cellules nucléées / CMH-II CPA | ✅ correct | l.2342-2345 |
| Z-scheme (PSII→PQ→Cytb6f→PC→PSI→Fd→NADP⁺) | ✅ correct | l.4596 |
| Fermentation = 2 ATP | ✅ conforme au livre | l.5901 ≡ livre l.4173 |
| Taux plaques (2-10 سم/سنة, Pacifique 7-10) | ✅ plausibles | l.7446-7455 |
| Gradent géothermique ~30°C/km | ✅ correct | l.7531, 8526 |
| **Harvest ATP respiration** | ⚠️ **DIVERGENT + INCOHÉRENT** | enseigne ~32 « moderne » (l.5628-5633 : 10 NADH×2.5 + 2 FADH₂×1.5) alors que le **livre officiel = 38 ATP** (l.4155 « 38ATP », l.4173) ; ET ses propres exercices répondent **38** (l.5846, 5901-5905) et son tableau comparatif « 36-38 » (l.5954) |
| Format des tests | ⚠️ non conforme au bac réel | « 4 exercices indépendants × 5 pts » = format maison ; le bac SVT algérien = analyse de documents + وضعية إدماجية avec منهجية |
| « الوثيقة » (40 occurrences) | ⚠️ données simulées | expériences décrites en texte avec valeurs inventées (ex. l.3012 titrages VIH) — utilisables, mais à étiqueter « données simulées », jamais citées comme mesures réelles |

## 5. Limites structurelles

1. **Zéro figure réelle** : 235 « schémas » = ASCII art + descriptions pour génération IA
   (l.484). Pour l'app : non-bloquant — **nous possédons déjà 135 SVG** ciblés par chapitre.
2. **Cours de synthèse, pas démarche documentaire** : aucune وضعية انطلاق, aucun
   استغلال وثائق progressif — complément révision, ne remplace pas la démarche officielle.
3. Numérotation trompeuse (U3 sans U2), doublons de titres المجال avant chaque unité.

## 6. Conditions d'exploitation (avant tout intégration dans l'app)

1. **Corriger ATP → 38** (référentiel officiel, l.4155/4173 du livre) en note de bas
   de page pour la version « moderne » — sinon risque de contradiction en bac.
2. **Combler D2-U2** en s'ancrant sur C35-C40 du livre (démarche levures/mitochondrie/
   glycolyse/Krebs/FS تأكسدية/لاهوائي) — matière partielle déjà présente en U3.
3. **Étiqueter les documents simulés** (الوثائق = données générées) et réutiliser nos
   135 SVG à la place des descriptions ASCII.
4. Alors : source n°1 pour le module **« اختبار نمط بكالوريا »** (3 tests corrigés
   prêts après re-vérification mécanique de chaque exercice) + support de synthèse.

## 7. Méthode

Extraction : `git show origin/master:…` (lecture seule, master intouché). Contrôles :
ossature par regex `^#`/`^##`, inventaire 🔴 التمرين/🔑, vérification indépendante du
code génétique, croisement chiffré avec `data/bookContent.json` (l.4155, 4173, 3772,
3810) et lexique terminologique (الظهرة 40×, الظهيرة 0× — conforme au livre).
