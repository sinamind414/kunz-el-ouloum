# Audit بنك الحفظ (OkachaView) — design + code + contenu

**Date :** 2026-09-22 · **Périmètre :** `src/components/OkachaView.tsx` (106 l.), `src/data/okacha.ts` (1 853 l.), entrée `LessonsView.tsx` l.189-201
**Verdict :** le module fonctionne (10 unités verrouillées, zéro crash), mais **la forme est un dump OCR brut** et **l'usage est un mur de texte** — d'où l'impression « design nul + contenu maigre ».

---

## 1. État mesuré (chiffres réels du dépôt)

| Métrique | Valeur |
|---|---|
| Unités | 10 (D1=5, D2=2, D3=3 — conforme au programme officiel, vérifié + lock test) |
| Volume unités | 1 287 lignes / **138 500 caractères** |
| Volume méthodo | 477 lignes / **34 600 caractères** (rendues d'un bloc) |
| Rendu | **`<pre>` brut**, `text-xs` (~12 px), zéro hiérarchie typographique |
| Composant total | 106 lignes — 2 `<pre>`, des accordéons gris, aucune fonctionnalité d'apprentissage |

### Qualité du contenu (échantillon U1 « تركيب البروتين »)
- **OCR non corrigé** : « الرونبنات » (بروتينات bousculées), « ا لكلونيد », « ٠ بيورينية », « : ،ملف اماهن لكب والجزئية للما»… » — ~15-20 % des lignes de l'échantillon sont lisiblement corrompues ;
- **Fragments orphelins** (lignes < 25 car., jamais recollées) : U1=20, U4=47, U5=32, U10=26 — ~186 sur le corpus ;
- **Numérotation cassée** : « 6- », « ١٧ », « 3 1 - » mélangés, listes à puces perdues au fil de l'OCR.

## 2. Les manques (design = zéro fonction d'apprentissage)

| # | Manque | Conséquence élève |
|---|---|---|
| A1 | Zéro structure sémantique : tout est un `<pre>` | Impossible de repérer titres/points-clés/mots-clés ; lecture linéaire épuisante |
| A2 | **Zéro recherche** (138 K caractères sans filtre) | L'élève ne retrouve pas « أوفيوليت » ou « السترسوم » |
| A3 | Zéro mode حفظ (masquer/révéler, auto-test) | « بنك الحفظ » sans mécanique de mémorisation — c'est un lecteur, pas un entraîneur |
| A4 | Zéro progression (lu/appris) ni lien avec XP | Aucun sentiment d'avancement, pas de rituel quotidien |
| A5 | Zéro lien croisé : unité ↔ leçon passive ↔ QCM chapitre ↔ flashcards | Le banc est une île ; عكاشة ≠ ordre officiel mais le remappage n'est pas montré |
| A6 | Méthodo = mur de 477 lignes sans sections ni ancres | Le contenu méthodologique (excellent) est illisible |
| A7 | Design hors langage de l'app : pas de dégradés/icônes/couleurs par domaine (comparé à LessonsView l.124-201) | Ressemble à une page debug |
| A8 | Pas d'impression, pas de taille de police, pas d'audio (RevisionView a déjà flip/speech — non réutilisé) | Fonctionnalités existantes dupliquées/absentes |

## 3. Points forts à préserver (contrats existants)

- Verrou `okacha.lock.test.ts` : 10 unités, volumes minimaux, périmètre commercial filtré (prix/téléphones/CamScanner), terminologie (الظهرة) — **à étendre, jamais à casser** ;
- Injection mécanique `scripts/build_okacha.py` — toute retouche passe par le script + verrou ;
- Mapping domaine réellement **correct** (vérifié ce jour : D1 inclut الاتصال العصبي, D3 inclut الظواهر التكتونية — le premier scan décalé était un artefact de parsing).

## 4. Bilan de modernisation proposé (2 phases)

### Phase A — UX « entraîneur » (code, ~1 session)
1. **Renderer structuré** : parser `lignes` → blocs (titre, point numéroté, puce, avis) ; puces natives, mots-clés surlignés, hiérarchie 14-16 px ;
2. **Recherche arabe normalisée** (réutiliser `norm()` du lock test) : filtre live unités + méthodo, surlignage des hits ;
3. **Mode حفظ** : masquer la fin des points numérotés → révéler au clic + auto-évaluation (encore/difficile/bien) branchée sur le SM-2 existant de RevisionView (XP déjà en place) ;
4. **Progression** : par unité (points vus / total) en localStorage, anneau de progression + lien « افتح في QCM » par chapitre (mapping عكاشة ↔ chapitres QcmLivre documenté dans le code) ;
5. **Design system de l'app** : dégradés + icônes par domaine (D1 bleu protéines, D2 ambre énergie, D3 violet tectonique), chips numérotées, mode lecture (taille de police), impression par unité (pattern printer StatsView).

### Phase B — contenu (script + verrou)
6. **2ᵉ passe OCR dans `build_okacha.py`** : recoller les 186 fragments < 25 car., restaurer la numérotation (6-, ١٧, 3 1 -), corriger les motifs connus (الرونبنات→البروتينات…), marquer les incertitudes `〔؟〕` ;
7. **Méthodo sectionnée** : découper les 477 lignes en 6-8 sections à ancres (grille أفعال, استدلال, نص علمي) avec le même renderer ;
8. **Verrou v2** : figer nb de blocs/sections, zéro fragment orphelin, numérotation complète — le lock test devient garde-fou de la modernisation.

**Estimation :** Phase A ≈ une session de code (tests + build inclus) ; Phase B ≈ une session script + verrou. Les deux sont indépendantes — A peut partir seule.

## 5. Limites avouées
- Audit statique + mesures regex ; pas de capture d'écran navigateur (serveur dev tourne sur :3000, validable à l'œil) ;
- Le « ~15-20 % corrompu » est une estimation d'échantillon (U1), pas un comptage exhaustif ; la Phase B chiffrera au verrou.

---

## 6. BILAN D'EXÉCUTION — Phases A + B livrées (2026-09-22)

Décision propriétaire : « Go les deux d'affilée ». Les 8 chantiers sont livrés.

### 6.1 Phase B — contenu (script + verrou v2)

| Chantier | Livrable | Mesure |
|---|---|---|
| 6. 2ᵉ passe OCR | `scripts/enrich_okacha.ts` → `src/data/okachaEnriched.ts` (GÉNÉRÉ) | **211 fragments recollés**, **323 rattrapages** de continuation, **9 corrections OCR** du dictionnaire, numérotation normalisée |
| 7. Méthodo sectionnée | `OKACHA_METHODO_SECTIONS` | **8 sections** : intro(10) hikala(7) tamarin1(128) tahil(57) tafsir(33) mouqarana(7) istinj(65) istidlal(21) |
| 8. Verrou v2 | `src/data/okachaEnriched.lock.test.ts` | **9/9 ✓** : zéro ligne non couverte (probe 0), zéro bloc orphelin < 20 car. (8 → 0), ≥ 150 recollages, ≥ 100 rattrapages, 8 sections, terminologie |
| Non-régression v1 | `src/data/okacha.lock.test.ts` | **9/9 ✓** (10 unités D1=5/D2=2/D3=3, périmètre commercial filtré) |

Contenu : blocs sémantiques typés `titre | point | puce | note | texte` — 1287 lignes sources rendues en blocs structurés (61 points numérotés, ~700 blocs).

### 6.2 Phase A — UX « entraîneur »

| # | Chantier | Livrable | Preuve |
|---|---|---|---|
| 1 | Renderer structuré | `OkachaView.tsx` réécrit (106 → 536 l.), **zéro `<pre>`** | test « AUCUN `<pre>` brut » ✓ |
| 2 | Recherche arabe normalisée | index au montage (unités + méthodo), `normAr` (réutilisée du verrou), surlignage des hits, plafond 80 | test « filtre tout le corpus » ✓ |
| 3 | Mode حفظ | masquer les points → « 👁 مخفي — اضغط للكشف » → barre 🔁/🟡/✅/⭐ avec XP affiché (+2/+5/+10/+15) | test « masquer → révéler → onRate('good') » ✓ |
| 4 | Progression + lien QCM | `src/data/okachaProgress.ts` (localStorage `kunz_okacha_progress_v1`), barre de progression globale, marqueur par unité, bouton « اختبار الكتاب » | tests « unité marquée persistée » + « onOpenQcm » ✓ |
| 5 | Design system | THEME par domaine (D1 bleu protéines / D2 ambre énergie / D3 violet tectonique / méthodo émeraude), icônes lucide miroir de LessonsView, chips numérotées, taille lecture (15/17 px), impression (`print:hidden` + `window.print()`) | visuel + build ✓ |

### 6.3 Câblage (contrats respectés)

- `App.tsx` : `<LessonsView onRateCard={handleRateCard} />` — l'élève gagne de vrais XP et alimente `flashcardStats` (SM-2) depuis le بنك الحفظ, **sans nouveau chemin d'écriture** ;
- `LessonsView.tsx` : `onRate={onRateCard}` + `onOpenQcm={() => setMode('qcm')}` — liens croisés banc ↔ QCM du livre ;
- XP miroir exact de `handleRateCard` : easy 15 / good 10 / hard 5 / again 2 (vérifié par test).

### 6.4 Validation

| Contrôle | Résultat |
|---|---|
| `npx vitest run` (suite complète) | **77 fichiers / 998 tests — 0 échec** |
| Dont nouveaux tests du banc | `OkachaView.test.tsx` 5 ✓ · `okachaProgress.test.ts` 7 ✓ · `okachaEnriched.lock.test.ts` 9 ✓ |
| `npm run build` | ✓ built in 14.89 s |
| Sonde de couverture | `TOTAL non couvertes : 0` (le probe est jetable, supprimé après usage) |

### 6.5 Écarts assumés vs proposition initiale

1. **Surlignage** : la recherche surligne la **requête brute** (pas la forme normalisée) — surligner une normalisation afficherait un texte absent du contenu ; le filtrage, lui, est bien normalisé.
2. **Progression** : granularité **par unité** (marqueur « تم الحفظ » + compteur d'évaluations) et non « points vus / total » — le compteur de points vus est déjà porté par les auto-évaluations, sans double état à tenir.
3. **Mapping عكاشة ↔ chapitres QCM** : pas de table codée en dur (elle deviendrait un 3ᵉ référentiel à maintenir) ; le lien est **de navigation** (« اختبار الكتاب ») — un mapping explicite reste possible en Phase C si le propriétaire le demande.
4. **`build_okacha.py`** : la 2ᵉ passe OCR vit dans `scripts/enrich_okacha.ts` (couche au-dessus du fichier v1 inchangé) au lieu de modifier le script Python — ainsi `okacha.ts` reste bit-à-bit le verbatim source et le verrou v1 reste un ancrage intouchable.
