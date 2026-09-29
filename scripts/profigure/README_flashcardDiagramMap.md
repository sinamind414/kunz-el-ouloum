# Phase 5 — appariement ciblé carte → figure ProFigure

Les 552 flashcards se partageaient 44 figures ; 66 SVG de `public/assets/images/schemas`
n'étaient **jamais** montrés. Cette phase re-pointe les cartes les plus flagrantes vers la
figure **dédiée** à leur concept — sans rien inventer.

## Méthode (auditable)

1. **Concept** = la chaîne réelle entre `«»` du `questionText` du corpus (extraction, jamais fabrication).
2. Le couple n'est retenu que si l'**aria-label** de la figure et/ou ses libellés `<text>`
   **nomment** le concept, ou si le concept **est** le phénomène que la figure représente.
3. **Refus systématique** du déplacement quand la figure actuelle est déjà plus spécifique
   (contrôle des libellés SVG avant toute écriture — c'est ce qui a écarté `schema_82`).

Source unique : la table `MAP` de `scripts/profigure/applyFlashcardDiagramMap.ts`.

- `--export` fige `flashcardDiagramMap.json` (lu par le test de verrou) ;
- `--check` sort en erreur si le corpus ne correspond plus à la table ;
- `--apply` réécrit les `diagramUrl` du corpus. Les cartes dérivent du QCM
  (`id: fc_q_<idQ>`), donc **une seule source** est modifiée : carte et QCM restent cohérents par construction.

## Re-pointages (34 concepts → 37 cartes → 16 figures, dont 13 jamais utilisées avant)

| figure dédiée | concepts (cartes) | preuve |
| --- | --- | --- |
| `domaine1_regulations/schema_83_potentiel_action_modern_ar.svg` | كمون العمل، عتبة التنبيه، الكل أو لا شيء، زوال الاستقطاب، إعادة الاستقطاب، فرط الاستقطاب، فترة الجموح (181/184/185/186/187/188/189) | aria «كمون الفعل» ; libellés : راحة، إزالة الاستقطاب، إعادة الاستقطاب |
| `domaine1_proteines/schema_20_splicing_exons_introns_modern.svg` | نضج ARNm، الإكسون، الإنترون (30/31/32) | «ARNm أولي → إكسونات أولية + إنترونات → التضفير → ARNm ناضج» |
| `domaine1_proteines/schema_24_polysome_translation_modern.svg` | البولي ريبوزوم (29) | aria «متعدد الريبوزوم» (déjà cible de la carte 502) |
| `domaine1_proteines/schema_23_genetic_code_table_modern.svg` | الشفرة الوراثية، الشفرة المترادفة (4/7) | aria «جدول الشفرة الوراثية» ; «مترادف» cité ; plusieurs رامزات par acide aminé |
| `domaine1_proteines/schema_24_secretory_pathway_pancreas_modern_ar.svg` | جهاز غولجي، الشبكة الإندوبلازمية الخشنة (34/35) | «جهاز غولجي» + «الشبكة الهيولية الخشنة» nommés |
| `domaine1_proteines/schema_65_antibody_structure_hl_modern.svg` | الجسم المضاد، الباراتوب، الحاتمة (66/137, 67/123, 68/120) | «موقعا الارتباط بالمستضد»، Fab/Fc، سلاسل H/L، «محدد مستضدي» |
| `domaine1_proteines/schema_76_memory_cell_fate_modern.svg` | الذاكرة المناعية، الذاكرة T (140/152) | «خلايا ذاكرة طويلة البقاء»، «مخزون ذاكرة»، «سرعة الاستجابة الثانوية» |
| `domaine1_enzymes/schema_87_enzyme_inhibition_curves_ar.svg` | Km، Vmax، الإشباع الإنزيمي، المثبط التنافسي، المثبط غير التنافسي (104/105/106, 107/109) | aria «تأثير مثبطين … V = f([S])» ; Vmax et Km annotés, الشاهد/المنحنى A/المنحنى B |
| `domaine1_enzymes/schema_88_enzyme_six_curves_workshop_ar.svg` | منحنى pH (99) | les six courbes incluent V = f(pH) |
| `domaine2_energie/schema_86_photosynthese_intensite_lumiere_modern_ar.svg` | شدة الإضاءة (253) | aria = «معدل البناء الضوئي بدلالة شدة الإضاءة» |
| `domaine2_energie/schema_89_hill_ruben_experiment_modern_ar.svg` | التحلل الضوئي للماء، O2 المطروح (230/237) | aria «ما مصدر الأكسجين المنطلق؟» + «التحلل الضوئي للماء يوفر الإلكترونات ويحرر الأكسجين» |
| `domaine2_energie/schema_91_calvin_2d_chromatography_modern_ar.svg` | حلقة كالفن (240) | «حلقة كالفن : تثبيت الكربون ⟶ اختزال ⟶ تجديد المستقبل» |
| `domaine2_energie/schema_92_racker_bacteriorhodopsin_modern_ar.svg` | الكيميواسموز (297) | aria «إثبات النظرية الكيمياؤسموزية لميتشل» |
| `domaine3_tectonique/schema_93_benioff_plan_modern_ar.svg` | مستوى واداتي-بينيوف (455) | aria «مستوى بنيوف (Wadati-Benioff) : توزع بؤر الزلازل دليل على الغوص» |

## Ce qui a été REFUSÉ (et pourquoi)

| carte(s) | figure écartée | motif |
| --- | --- | --- |
| cartes de la synapse (195-199, …) | `domaine1_regulations/schema_82_synapse_modern_ar.svg` | **régression** : la figure actuelle `schema_08_synapse` nomme déjà Ca²⁺، الحويصلات المشبكية، الشق المشبكي، مستقبل قنوي (AChR)، AChE، PPSE et les 5 étapes ; `schema_82` n'a que 6 libellés |
| Km / Vmax / inhibition / pH | rester sur `schema_07_enzyme.svg` | la figure ne montre que le site actif, E+S et le complexe ES : aucune courbe → les cartes kinétiques vont sur 87/88 |
| رامزة التوقف (28) | `schema_23_genetic_code_table_modern.svg` | le tableau nomme les رامزات إيقاف mais n'illustre pas le mécanisme (عامل تحرير) de la carte → reste sur `schema_03_traduction` |
| الانقلاب المصلي (532) | `schema_85_anticorps_primaire_secondaire_modern_ar.svg` | sujet réel de la carte = sérologie VIH → reste sur `schema_90_vih_cycle_lt4_ar` |
| السيانيد (112), التثبيط العكوسي (113) | `schema_87_…` | ni «السيانيد» ni la réversibilité ne sont figurés |
| إغلاق الثغور (258) | `schema_87_coupe_feuille_modern_ar.svg` | la coupe de feuille ne nomme aucun stomate |
| bloc membrane (الغشاء العصبي، النفاذية الانتقائية) | `schema_55_membrane_proteins_em`, `schema_56_fluid_mosaic_model`, `schema_57_membrane_fluidity_fusion` | aucune ne nomme « النفاذية الانتقائية » ni « الغشاء العصبي » : **aucun appariement inventé** (piste signalée, pas un crédit) |
| glycémie (`schema_81`, `schema_84`), prion, araignée, anagène | — | **aucune carte** de ces concepts n'existe dans le corpus (recherche de concepts réels) : ces figures restent libres, la phase 6 peut les traiter si des cartes sont écrites |

## Mesures avant → après

| mesure | avant | après |
| --- | --- | --- |
| cartes | 552 | 552 (aucune carte ajoutée/supprimée) |
| cibles distinctes | 44 | **57** |
| figures jamais utilisées | 66 / 110 | **53 / 110** |
| `schema_08_synapse` | 55× | 48× |
| `schema_09_photosynthese` | 47× | 43× |
| `schema_07_enzyme` | 45× | 39× |
| `schema_06_structure_proteines` | 40× | 31× |

## Verrous de test

`src/data/flashcards.lock.test.ts` → « diagrammes — Phase 5 » (5 tests) :
table versionnée (34 entrées, aucun concept dupliqué), **chaque** carte portant un concept
apparié pointe la figure dédiée (37 cartes), les 7 cartes du potentiel d'action ne reposent
plus sur la synapse, les 4 gros clusters sont plafonnés (≤ 48/43/39/31), et le compte
57 cibles / 53 figures libres est figé.

## Commandes

```bash
npx tsx scripts/profigure/applyFlashcardDiagramMap.ts           # dry-run + rapport tmp_p5_plan.txt
npx tsx scripts/profigure/applyFlashcardDiagramMap.ts --check    # exit 1 si l'état ne colle plus
npx tsx scripts/profigure/applyFlashcardDiagramMap.ts --apply    # écrit src/quizCorpus.ts
npx tsx scripts/profigure/applyFlashcardDiagramMap.ts --export   # régénère flashcardDiagramMap.json
```

| `domaine3_tectonique/schema_88_collision_continentale_modern_ar.svg` | التصادم القاري (465) | aria «الاصطدام القاري» |
| `domaine3_tectonique/schema_94_migmatite_crustal_thickening_modern_ar.svg` | تثخن القشرة (469) | «التضاعف القشري»، «زيادة سمك الليتوسفير (جذر جبلي)»، المغماتيت |
