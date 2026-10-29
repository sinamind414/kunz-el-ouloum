# Données générées et verrous

> Lu depuis `AGENTS.md`. Règle : **on corrige le générateur, jamais la sortie**.
> Une édition à la main est écrasée à la prochaine génération et casse le verrou.

## Générateur → sortie → verrou

| Sortie | Générateur | Source lue | Verrou |
|---|---|---|---|
| `src/data/okacha.ts` | `scripts/build_okacha.py` (+ correctifs `gen_okacha_fixes2.ts`) | `uploads_externes/okacha.txt` (**absent du dépôt**) | `src/data/okacha.lock.test.ts` |
| `src/data/okachaEnriched.ts` | `scripts/enrich_okacha.ts` | `src/data/okacha.ts` | `src/data/okachaEnriched.lock.test.ts` |
| `src/data/hosila.ts` | `scripts/build_hosila.ts` | `uploads_externes/hosila_officielle_3as.txt` | `src/data/hosila.lock.test.ts` |
| `src/data/cartesHosila.ts` | `scripts/build_cartes_hosila.ts` | `src/data/hosila.ts` | `src/data/cartesHosila.lock.test.ts` |
| `src/data/lessonIndex.ts` (**protégé**) | `scripts/build_lesson_index.ts` (logique : `src/data/lessonIndexBuilder.ts`) | `public/lessons/*.html` + `activeLessons.ts` | `src/data/lessonIndex.lock.test.ts` |
| JSON tuteur runtime | `scripts/emit_lesson_index_json.ts` | `lessonIndexRuntime.ts`, `tutorKnowledgeRuntime.ts` | `src/build/tutorLeconsJson.lock.test.ts` (post-build) |
| `src/data/guideManhajia.ts` | `scripts/build_guide_manhajia.ts` | `GUIDE_FUSION_SYNTHESE_METHODE_SVT_BAC_3AS.md` (racine, **ne pas déplacer**) | `src/data/guideManhajia.lock.test.ts` |
| `data/bookContent.json` (+ `.index.json`) | `scripts/book_to_json.py` puis `scripts/build_chapter_index.ts` | manuel + `uploads_externes/book_tdm_clean.md` | `src/data/bookContent.lock.test.ts`, `bookIndex.lock.test.ts` |
| `src/data/bacExam.ts` (**absent du dépôt** : sortie retirée, script orphelin) | `scripts/build_bac_exam.py` | `uploads_externes/PROGRAMME NATIONAL SVT CLAUDE OPUS - Copie.MD` | — |
| `src/data/fillBlanks.ts`, `src/lessonData.ts`, `src/unitCatalog.ts` | « auto-generated » (générateurs historiques absents du dépôt) | — | traiter comme générés : modifier avec prudence et preuve |

Commande type : `npx tsx scripts/<générateur>.ts` (ou `python3 scripts/<x>.py`),
puis relancer le verrou correspondant.

## Pièges connus

- `scripts/book_to_json.py` contient des **chemins Windows absolus**
  (`c:\Users\zakaria\...`) : il ne tourne que sur la machine du propriétaire.
- `scripts/build_bac_exam.py` lit `uploads_externes/…` — le fichier n'y est présent
  que depuis la réorganisation du 2026-10-26 (il était à la racine auparavant).
- `scripts/build_okacha.py` attend `uploads_externes/okacha.txt`, non versionné :
  `okacha.ts` n'est pas régénérable depuis le dépôt seul.
- Le compte d'un corpus se fait **sur l'export servi**, jamais sur le fichier brut
  (cf. `src/data/volumeCorpus.lock.test.ts` et le tableau du `README.md`).

## Verrous (`*.lock.test.ts`)

66 tests `*.lock.test.ts(x)` (au 2026-10-26) figent des volumes, des contenus ou des invariants
(ex. `volumeCorpus.lock.test.ts`, `repoIntegrity.test.ts` qui liste les fichiers dont
l'absence serait silencieuse). Un verrou qui rougit après un changement intentionnel
se met à jour **avec la preuve dans le message de commit** ; sinon, c'est une régression.
