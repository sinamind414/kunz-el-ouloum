# Continuation Brief — مفتاح الكنز (Rebrique-sujet-BAC)

Session branch: `arena/01a08ed2-rebrique-sujet-bac` (this document is continued on `arena/01a096cc-rebrique-sujet-bac`)
Last commit message: `fix: critical data-loss, timer, scoring and HTTP range bugs (batch 3)`
Test status at handoff: **256 pass / 0 fail / 1 skipped** (`npm test`).
PWA build id: `f54ac619b7a2` (stale as soon as any source file changes — regenerate with `npm run pwa:version`).
Production build: `dist/site` 136 files, standalone `dist/boussole-4d-standalone.html` 1.80 MB (reproducible sha256).

> **2026-09-12 — batch « analyse ligne par ligne »** (branch `arena/01a096cc-rebrique-sujet-bac`, rapport complet dans `ANALYSE_LIGNE_PAR_LIGNE.md`):
> fixed S1.1 (JSDoc `@param {string} lang` → `npm run typecheck` vert), S2.1 (`hits > 0` avant le palier parfait), S2.2 (condition tautologique de l'horloge en stratégie + suppression du doublon de libellés arabes au profit de `js/ui/coverage-messages.js`), S2.3 (le repli de simulation annonce désormais `missing`/`partial`/`blocked`), S3.9 (opérande mort dans `brouillon.js`), S3.6 (commentaire orphelin), `methodology.js` refactoré (28 blocs de retour → 1, −235 lignes, **0 différence sur 2448 couples échantillon/pôle**), démo « avant/après » recalée sur le schéma réel de `evaluateText`, frontière `setInternalHTML` restaurée partout, `build.mjs` n'affirme plus que les PDF ne sont pas distribués (et affiche leur poids dans le log), en-têtes périmés de `data/archive.js` corrigés, modules de rapport documentés comme volontairement non câblés.

## Bugs already fixed this session (committed)

Catastrophic/data-loss:

- **#73** bac-reading-mode `BAC-S?-E?` answers stripped on reload — added `freeAnswer` per-exercise field, rewrote `renderBacReadingMode` to use `data-exercise-free`, wired persist/restore. Schema v4→v5 migration rescues orphaned pre-fix keys.
- **#71** brouillon "إدراج الحالي" silently overwrites existing answer — now appends when non-empty.
- **#50** sound-engine master GainNode never disconnected on mode switch → audio leak. Now disconnects/nulls master gain.

Timing:

- **#60** global BAC timer drained during guide/breathing/strategy screens — startGlobal moved from `begin()` to strategy `confirmChoice()`; init restore only resumes timer in workspace; guide sets timer text to chosen year so Math-stream shows 2h30 not 4h30.
- **#63** drill timer used naive `setInterval(,1000)` → drift — switched to Date.now() delta pattern.
- **#64** `strategyMinutes` config not persisted across reload — added `strategyDuration` field.

Locale/speech:

- **#52** SpeechRecognition `lang="ar-DZ"` unsupported → now `ar-SA` with ar-EG→ar fallback loop.
- **#53** dictation replaced text / jumped caret → inserts at selectionStart/End with proper space glue.

Network/PDF:

- **#61** sw.js returned undefined for Range requests (Chromium PDF breakage) → now `respondWith(fetch(request))`.
- **#62** server.mjs always returned 200 full body, no Range support → added 206 Partial Content with `Accept-Ranges: bytes` and sliced createReadStream (verified: PDF 0-999 returns 206/1000 bytes).

Scoring heuristics:

- **#65** science wrong-concept penalty zeroed any answer with 2 errors (`1-0.5*n`) → softened to `max(0.1, 1-0.25*n)` (BAC-style deduction).
- **#66** `matchConcept` prefix match (≥4 chars and startsWith) over-matched e.g. بروت→بروتوكول/بروتون → ±1-3 char inflection window only.
- **#67** verb detection counted any word ≥4 chars starting with ي/ت/ن/س (destroyed نواة/تركيب/نسيج/سنة/تلميذ/سطح/سائل) → prefix + (verbal-suffix OR no-nominal-ending) rule.
- **#68** `stripArabicClitics` `/^[كبفول]/` amputated بروتين→روتين, بكتيريا→كتيريا, كبد→بد, فرضية→رضية, وراثة→راثة → replaced with protected-stem allowlist + context-aware single-letter strip.
- **#69** `hasTwoSides` "any و OR ≥8 words = both sides" always-true heuristic → explicit contrast-marker detection (بينما/في حين/على عكس/مقابل/أما/بعكس/يتشابه/يشبه).
- **#72** diagnostics online/offline/SW listeners leaked across init/re-init → cleanup on re-init via named handlers.

## NOT created (deliberate, per user constraint)

- **data/years/se/year-2021.js (training 4D)**: The 2021 SE PDF is encrypted (viewer 0 pages on dzexams). `scripts/extracted/SE/2021/*.txt` exists but is RTL-inverted, garbled (shows "المدة: 40 سا و04 د"), and has no usable text layer. Per standing rule "never mark OCR-extracted prompts as verified, never fabricate coverage" I did **not** author 2021 SE in 4D. It stays as a consult card pointing to dzexams. Promoting 2021 SE requires manual re-reading of the PDF page by page to build poles + model answers — content authoring, not a code patch.

## Files changed in this batch

`data/subjects.js`, `js/app-version.js`, `js/application/subject-session.js`, `js/domain/evaluation/{methodology,quality-checks,text-analysis}.js`, `js/services/{diagnostics,sound-engine,speech-recognition}.js`, `js/store.js`, `js/ui.js`, `js/ui/screens/{hub,simulation,strategy}.js`, `js/ui/training.js`, `js/ui/workspace/brouillon.js`, `server.mjs`, `sw.js`, `tests/p1-status.test.mjs`, `README.md` (auto-metrics), `package.json` + `package-lock.json` (runtime deps for OCR scripts), plus new scripts in `scripts/`.

## Remaining work for the next agent

### P0 — OCR pipeline (per the user's accepted phased workflow: audit → extract native → one pilot before generalize)

1. **Audit native-text extractability** across all 38 subject PDFs (SE 2013–2026 ×2, M 2021–2026 ×2 = 26 SE + 12 M = 38). The script `scripts/extract-native-pdfs.mjs` exists but needs to be run end-to-end:
   - `node scripts/extract-native-pdfs.mjs` → writes `.txt` under `scripts/extracted/{SE,M}/<year>/sujet-<n>.txt` for PDFs with a real text layer.
   - For each PDF, record: `{ hasText: bool, ocrRequired: bool, pages, extractionQuality }`.
   - Update `data/calibration-status.js` (or the calibration-status JSON) with the result, marking native-extract subjects.

2. **Run one pilot extraction with UNVERIFIED flag first.** Suggested pilot: SE 2025 (already 4D-coded — use native extract to double-check `bacPrompt` strings) OR SE 2022 if native-text quality is good. The pilot must:
   - Run `scripts/pilot-extract-prompts.mjs <year> <subject>`.
   - Output a machine-readable tasks JSON and diff against the existing `data/years/se/year-<y>.js` poles.
   - NEVER mark pilot prompts as `bacPromptSource: "official"` without human re-read. Use `bacPromptSource: "unverified-ocr"` and show them side-by-side.

3. **OCR-only fallback**: `scripts/ocr-scan-pdf.mjs` uses tesseract.js with Arabic traineddata (ara.traineddata needs to be fetched/confirmed). Run on SE 2021 first (the known-encrypted case) to see if the garbled text can be recovered; expect RTL issues — the existing 2021 extract is inverted because of PDF.js text-direction bugs. Fix the RTL inversion (`scripts/lib/`) before trusting output.

4. **After pilot verification**, generalize OCR/native extraction to other missing years (2013–2019 currently reconstructed; 2021 SE needs full authoring; 2022–2026 already 4D-encoded but prompts should be re-verified against native text).

### P1 — Bugs still on the list

- ~~**#51** Sound engine binaural on Safari~~ **corrigé le 2026-09-12** (`js/services/sound-engine.js`, `_playBinaural`) : le code utilisait déjà un `ChannelMerger`, auquel s'ajoute désormais un chemin explicite `StereoPannerNode` (pan ∓1) quand le moteur l'expose, le merger restant le repli. **Non vérifié dans un vrai navigateur** (jsdom n'a pas WebAudio) : à confirmer sur Safari.
- ~~**#54** Speech recognition `InvalidStateError`~~ **corrigé le 2026-09-12** (`js/services/speech-recognition.js`) : la boucle `ar-SA → ar-EG → ar` rappelait `start()` sur l'objet qui venait d'échouer. Chaque tentative construit désormais une instance neuve, une locale refusée de façon asynchrone (`language-not-supported`) retente la suivante, et un seul message est affiché par action. Couvert par `tests/speech-recognition.test.mjs` (5 tests, moteur fictif).
- **Diagnostics**: `reportDiagnostic` still has an edge case where it can double-count if same error fires synchronously during reporting (low severity).

### P2 — Scoring/rubric/hypotheses/technique deep audit (not yet done)

I patched the most damaging scoring heuristics (#65–#69) but did NOT fully audit:

- `js/domain/evaluation/text-analysis.js` — `matchConcept`, `aliasesFor`, `stripArabicClitics`, overlap ratios.
- `js/domain/evaluation/quality-checks.js` — `evaluateScience` (causal order), `evaluateDocument` (grids/curves/tables).
- `js/domain/evaluation/methodology.js` — pole N/S/E/W grids (now one single return — see batch below).
- `js/domain/evaluation/pipeline-evaluator.js` — domain-specific pipelines (graph / table / genetics) live here, **not** in per-domain files: the paths `js/domain/evaluation/{rubric,hypotheses,technique}.js` and `{graph,table,genetics}-*.js` cited in earlier handoffs **do not exist** (verified 2026-09-12).
- `js/domain/subjects/official-coverage.js` — TASK_ID_PATTERN strictness should probably also accept a future "unverified-ocr" suffix instead of silently dropping freeform keys (current v5 migration covers historical orphans, but future inventories may need a softer key path).

### P3 — XSS surface audit (partially done 2026-09-12)

- `setInternalHTML` (`js/ui/dom.js`) is the **only** HTML-writing boundary. It does **not** sanitize: it is a marker for "application-owned template, never user input", enforced by `scripts/report-p1-status.mjs` P1.6 / `tests/security-baseline.test.mjs` (CSP forbids inline styles, no `innerHTML` outside `dom.js`).
- Remaining direct writes found by the audit and fixed in the batch below: `js/ui/training.js` (3), `js/ui/atlas.js` (1), `js/ui/screens/hub.js` (1 `insertAdjacentHTML`). Only `js/ui/reports/exports.js` still reads `.innerHTML` — a read, for print output.
- `js/ui/atlas.js` and `js/ui/keycard.js` are **not** in `js/ui/drawers/` (that directory does not exist); the adhkar drawer is `js/ui/dialogs.js`.
- Still to check: `js/ui/workspace/brouillon.js` `buildDrafts`/`brouillonPreflight` — draft content rendered into the preview is escaped through `elementFromInternalHTML` templates, worth a dedicated test.

### P4 — SE 2021 (content, not code)

When OCR is usable AND the Arabic text has been manually verified line-by-line against the PDF:

1. Create `data/years/se/year-2021.js` following the 2020/2022 templates: 2 sujets × 3 exercises, N/S/E/W poles per exercise.
2. Add `"2021": () => import("./years/se/year-2021.js")` to `YEAR_LOADERS` in `data/subjects.js`.
3. Add a `catalogEntry` for 2021 SE in `YEAR_CATALOG` (with `enabled: true`, `subjectCount: 2`, `exerciseCounts: [3, 3]`).
4. Update `js/ui/screens/hub.js` caption (`"الشعبة: ${stream.label} — مواضيع 2013–2026."` already covers 2013–2026; remove the SE consult-only path for 2021 when adding).
5. Remove the 2021 SE entry from `data/archive.js` consult list (or keep it as a "mirror" entry with `trainingAvailable: true`).
6. Add `wrongConcepts` lists per exercise (SOD/RUBISCO distractors) — must appear only on science poles, not document poles.
7. Run `npm run pwa:version && npm test` — the P1.1 evidence regex in `tests/p1-status.test.mjs` already uses a loose `/\/38 inventaires complets/` pattern, so adding one more inventory should auto-update.
8. Run `npm run update-calibration-status` (or `node scripts/update-calibration-status.mjs`) to refresh copiesCompared.

### P5 — Verifications to re-run after any scoring change

- `npm test` must stay green.
- `node build.mjs` must produce the same sha256 on two consecutive runs (deterministic build — `9387190ec97e…` at time of handoff).
- Spot-check server range support: `curl -r 0-999 http://localhost:8080/subjects/SE/2021/sujet-1.pdf -o /tmp/partial && wc -c /tmp/partial` → 1000 bytes.
- Spot-check SW range passthrough is NOT cached (Chromium devtools → Network → PDF in iframe should show 206 from network, not from ServiceWorker cache).

## Session-memory state (for the next agent)

- No running servers / background processes.
- `node_modules/` installed (including `pdf-parse`, `pdfjs-dist`, `tesseract.js`, `tesseract.js-core`, `@napi-rs/canvas`) — these are dev deps but `package.json` puts them under "dependencies" because the OCR scripts run at dev time; you may want to move back to devDependencies once scripts are mature.
- Build/dist directories present but gitignored.
- Working tree is clean after PR merge (next session should start with `git pull` to confirm the merged commit on main — note: Arena tracks branch `arena/01a08ed2-rebrique-sujet-bac`, work there only, not main).
