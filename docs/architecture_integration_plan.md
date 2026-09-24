# Architecture Integration Plan - Kunz El Ouloum

## Objective
Keep the beta UI/design intact, but adopt the architecture from `kunz-el-ouloum-completed`:
- **100% offline smart tutor engine** (no Gemini API dependency)
- **Local knowledge bases** (tutorKnowledge, bookTutorQA, methodologyKnowledge, knowledgeCards, smartBotData)
- **Domain-based lazy loading** via `src/knowledge/` directory
- **Optimized Vite chunking config** for large data files
- **Minimal server.ts** (no AI endpoints)

## Files to Copy from Completed → Beta

### New Files (create)
| Source | Destination | Purpose |
|--------|-------------|---------|
| [src/smartTutorEngine.ts](file:///C:/Users/zakaria/Documents/projet%20application%20kunz%20el%20ouloum/kunz-el-ouloum-completed/src/smartTutorEngine.ts) | [src/smartTutorEngine.ts](file:///C:/Users/zakaria/Documents/projet%20application%20kunz%20el%20ouloum/kunz-el-ouloum-completed/src/smartTutorEngine.ts) | Main offline tutor facade |
| [src/bookTutorQA.ts](file:///C:/Users/zakaria/Documents/projet%20application%20kunz%20el%20ouloum/kunz-el-ouloum-completed/src/bookTutorQA.ts) | [src/bookTutorQA.ts](file:///C:/Users/zakaria/Documents/projet%20application%20kunz%20el%20ouloum/kunz-el-ouloum-completed/src/bookTutorQA.ts) | Book-extracted Q&A bank |
| [src/methodologyKnowledge.ts](file:///C:/Users/zakaria/Documents/projet%20application%20kunz%20el%20ouloum/kunz-el-ouloum-completed/src/methodologyKnowledge.ts) | [src/methodologyKnowledge.ts](file:///C:/Users/zakaria/Documents/projet%20application%20kunz%20el%20ouloum/kunz-el-ouloum-completed/src/methodologyKnowledge.ts) | BAC methodology Q&A |
| [src/knowledgeCards.ts](file:///C:/Users/zakaria/Documents/projet%20application%20kunz%20el%20ouloum/kunz-el-ouloum-completed/src/knowledgeCards.ts) | [src/knowledgeCards.ts](file:///C:/Users/zakaria/Documents/projet%20application%20kunz%20el%20ouloum/kunz-el-ouloum-completed/src/knowledgeCards.ts) | Knowledge routing cards |
| [src/tutorKnowledge.ts](file:///C:/Users/zakaria/Documents/projet%20application%20kunz%20el%20ouloum/kunz-el-ouloum-completed/src/tutorKnowledge.ts) | [src/tutorKnowledge.ts](file:///C:/Users/zakaria/Documents/projet%20application%20kunz%20el%20ouloum/kunz-el-ouloum-completed/src/tutorKnowledge.ts) | 500KB OPUS knowledge base |
| [src/utils/arabicNormalize.ts](file:///C:/Users/zakaria/Documents/projet%20application%20kunz%20el%20ouloum/kunz-el-ouloum-completed/src/utils/arabicNormalize.ts) | [src/utils/arabicNormalize.ts](file:///C:/Users/zakaria/Documents/projet%20application%20kunz%20el%20ouloum/kunz-el-ouloum-completed/src/utils/arabicNormalize.ts) | Arabic text normalization |
| [src/knowledge/loader.ts](file:///C:/Users/zakaria/Documents/projet%20application%20kunz%20el%20ouloum/kunz-el-ouloum-completed/src/knowledge/loader.ts) | [src/knowledge/loader.ts](file:///C:/Users/zakaria/Documents/projet%20application%20kunz%20el%20ouloum/kunz-el-ouloum-completed/src/knowledge/loader.ts) | Dynamic domain loader |
| [src/knowledge/domain1.ts](file:///C:/Users/zakaria/Documents/projet%20application%20kunz%20el%20ouloum/kunz-el-ouloum-completed/src/knowledge/domain1.ts) | [src/knowledge/domain1.ts](file:///C:/Users/zakaria/Documents/projet%20application%20kunz%20el%20ouloum/kunz-el-ouloum-completed/src/knowledge/domain1.ts) | Domain 1 filter |
| [src/knowledge/domain2.ts](file:///C:/Users/zakaria/Documents/projet%20application%20kunz%20el%20ouloum/kunz-el-ouloum-completed/src/knowledge/domain2.ts) | [src/knowledge/domain2.ts](file:///C:/Users/zakaria/Documents/projet%20application%20kunz%20el%20ouloum/kunz-el-ouloum-completed/src/knowledge/domain2.ts) | Domain 2 filter |
| [src/knowledge/domain3.ts](file:///C:/Users/zakaria/Documents/projet%20application%20kunz%20el%20ouloum/kunz-el-ouloum-completed/src/knowledge/domain3.ts) | [src/knowledge/domain3.ts](file:///C:/Users/zakaria/Documents/projet%20application%20kunz%20el%20ouloum/kunz-el-ouloum-completed/src/knowledge/domain3.ts) | Domain 3 filter |
| [src/data/smartBotData.ts](file:///C:/Users/zakaria/Documents/projet%20application%20kunz%20el%20ouloum/kunz-el-ouloum-completed/src/data/smartBotData.ts) | [src/data/smartBotData.ts](file:///C:/Users/zakaria/Documents/projet%20application%20kunz%20el%20ouloum/kunz-el-ouloum-completed/src/data/smartBotData.ts) | Offline chatbot data (domains, quiz, cards) |

### Files to Update
| File | Changes |
|------|---------|
| [server.ts](file:///C:/Users/zakaria/.gemini/antigravity/scratch/server.ts) | Remove Gemini API, keep security headers + health endpoint |
| [vite.config.ts](file:///C:/Users/zakaria/.gemini/antigravity/scratch/vite.config.ts) | Add build chunking for large data files |

### Files NOT to Touch (beta UI/design)
- [src/App.tsx](file:///c:/Users/zakaria/Documents/kunz%20el%20ouloum%20version%20beta/src/App.tsx) - Keep beta's navigation and UI
- All `src/components/*.tsx` - Keep beta's design
- [src/index.css](file:///c:/Users/zakaria/Documents/kunz%20el%20ouloum%20version%20beta/src/index.css) - Keep beta's styles
- [src/data.ts](file:///c:/Users/zakaria/Documents/kunz%20el%20ouloum%20version%20beta/src/data.ts) - Keep beta's quiz/unit data
- [package.json](file:///C:/Users/zakaria/.gemini/antigravity/scratch/package.json) - Only add missing deps if needed

## Architecture Diagram

```
src/
├── App.tsx (BETA - unchanged)
├── smartTutorEngine.ts (NEW - offline tutor facade)
├── bookTutorQA.ts (NEW - book Q&A)
├── methodologyKnowledge.ts (NEW - methodology Q&A)
├── knowledgeCards.ts (NEW - exact routing cards)
├── tutorKnowledge.ts (NEW - OPUS 3600-line knowledge)
├── knowledge/
│   ├── loader.ts (NEW - dynamic import)
│   ├── domain1.ts (NEW)
│   ├── domain2.ts (NEW)
│   └── domain3.ts (NEW)
├── data/
│   └── smartBotData.ts (NEW - offline bot data)
├── utils/
│   └── arabicNormalize.ts (NEW - Arabic tools)
├── components/ (BETA - unchanged)
└── data.ts (BETA - unchanged)
```
