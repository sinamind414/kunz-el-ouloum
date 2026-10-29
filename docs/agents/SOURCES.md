# Sources textuelles (livres, programme, synthèses)

> Lu depuis `AGENTS.md`. Ces fichiers sont **gros** : les lire par `grep` ciblé,
> jamais en entier. Ne jamais modifier leur contenu (chiffres, formules, énoncés).

## `uploads_externes/` — textes bruts

Depuis le 2026-10-26, tous les textes sources bruts y sont regroupés (avant, la
plupart étaient à la racine).

| Fichier | Nature | Lu par |
|---|---|---|
| `الكتاب_المصحح_v1.0.md` | manuel scolaire officiel corrigé (L1 du correcteur) | `scripts/audit_lexique.ts`, `scripts/book_to_json.py` (chemin Windows) |
| `المكتبة_الكاملة_SVT.md` (2 Mo) | bibliothèque SVT compilée | `scripts/audit_lexique.ts` |
| `504601676-كتاب-العلوم-للطالبة-اكرام-بوزار.txt` | livre de révision (L2) | référence documentaire (`okacha`) |
| `PROGRAMME NATIONAL SVT CLAUDE OPUS - Copie.MD` | document **généré par IA**, pas un texte officiel | `scripts/build_bac_exam.py` |
| `FINALBAC_VOLUME_1.txt`, `FINALBAC_VOLUME_2.txt` | volumes de révision | cités comme `sourceBook` (`src/bookTutorQA.ts`, `src/knowledgeCards.ts`) |
| `book_tdm_clean.md` | table des matières du manuel (55 chapitres) | `scripts/build_chapter_index.ts`, `bookContent.lock.test.ts`, `bookIndex.lock.test.ts` |
| `hosila_officielle_3as.txt` | الحصيلة المعرفية officielle | `scripts/build_hosila.ts` |

## `docs/sources/` — sources du correcteur (L1…L6)

Le garde-fou de traçabilité (`src/correcteurV1.test.ts`) lit **`docs/sources/`**, et non
`uploads_externes/`. Seules L5 (`التدرج-السنوي-للتعلمات-2017.txt`) et L6
(`دليل-الأستاذ-2017.txt`) y sont versionnées ; L1-L4 doivent rester locales, avec un
extrait tronqué commité dans `docs/sources/tronque/` (`npm run sources:tronquer`).
Procédure : `docs/sources/README.md`.

## ⚠️ Droits d'auteur — à arbitrer par le propriétaire

`docs/sources/README.md` classe L1 et L2 « local uniquement — droits d'auteur ».
Pourtant `الكتاب_المصحح_v1.0.md` et `504601676-…txt` sont **versionnés** dans ce
dépôt, qui est **public** (vérifié le 2026-10-26). Les déplacer ne change rien à leur
exposition. Les retirer vraiment exige un `git rm` **et** une réécriture d'historique
(`filter-repo`) : décision destructive réservée au propriétaire (règle Git d'`AGENTS.md`).

## Sujets BAC officiels

`public/bac-sujets/` : 28 PDF (2013-2026, piste SE), embarqués sur autorisation du
propriétaire (2026-10-22, cf. `.gitignore`). Index verrouillé par
`src/__tests__/bacPdf.lock.test.ts`.
