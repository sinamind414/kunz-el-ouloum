# Pipeline OCR → Leçons SVT (Kunz El Ouloum)

Pipeline en 2 étapes pour transformer des **manuels SVT arabes scannés** en
leçons exploitables par l'application (`src/lessonData.ts`).

Inspiré de <https://github.com/Pythonation/Mistral-Arabic-OCR-test> (Mistral OCR).

## 1. Installation

```bash
cd scripts/ocr
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # puis colle ta MISTRAL_API_KEY
```

Clé API : <https://console.mistral.ai/api-keys>

## 2. Étape A — OCR des PDF scannés → Markdown

Dépose tes livres PDF dans `scripts/ocr/input/`, puis :

```bash
python ocr_pdf.py
```

Sortie dans `scripts/ocr/output/<nom_livre>/` :

- `page_01.md`, `page_02.md` … (Markdown par page)
- `_complet.md` (tout concaténé)

Reprise automatique sur erreur (`processed_files.csv`), logs (`ocr.log`),
retry exponentiel. Un PDF déjà `done` est ignoré au relancement.

## 3. Étape B — Markdown curé → leçons TypeScript

Le Markdown brut OCRisé doit être **curé** : ajoute les marqueurs de structure
(voir `input_markdown/exemple_lecon.md`). Convention :

```markdown
# الدرس 1 : titre
<!-- breadcrumb: المجال • الوحدة -->
<!-- objective: 🎯 ... -->
<!-- objective: ⏱️ ... -->

## المرحلة 1
<!-- block: problem -->
<!-- title: ⚠️ ... -->
texte...

<!-- block: quiz -->
<!-- question: 1. ... ? -->
<!-- option: أ) ... -->
<!-- option: ب) ... -->
<!-- option: ج) ... -->
<!-- correct: 0 -->
```

Lance :

```bash
python md_to_lessons.py
```

→ génère `src/ocrLessons.ts` (export `OCR_LESSONS: Record<string, ExperimentalLesson>`).
Pour intégrer dans l'app, importe `OCR_LESSONS` dans `src/lessonData.ts` /
`src/App.tsx` et fusionne avec `EXPERIMENTAL_LESSONS`.

## Structure attendue (côte app)

`ExperimentalLesson` = `{ titleAr, breadcrumb, objectives[], phases[] }`
où `phases` = `{ step, blocks[] }` et `block.type` ∈
`problem | document | simulation | scientific_text | bac_tip | quiz | text`.
