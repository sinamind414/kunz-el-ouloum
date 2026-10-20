# Vérification terrain du rapport final 75/100 (2026-10-20)

Ce document consigne la contre-vérification ligne par ligne du
`AUDIT_8_AXES_2026-10-20_RAPPORT_FINAL.md`. Le rapport donne le bon cap
général (store, U11, sujets blancs), mais plusieurs constats factuels sont
faux sur notre master ; chaque tranche tirée de ce rapport est donc
contre-vérifiée avant travaux — règle désormais permanente.

## 1. H3 « QCM sans difficulté » — FAUX, déjà réalisé

- L'audit H3 demande : « Ajoute champ `difficulty: 1|2|3` … branche-les sur
  l'affichage ». **Ce travail existe depuis `27eae44`** (M3/T3b, 18/10/2026,
  ancêtre direct du `d467ba9` sur lequel l'audit a été rendu) :
  - champ `difficulte: PalierDifficulte (1|2|3)` dérivé des segments D1/D2/D3
    (`src/quizCorpus/index.ts:57-69`) — jamais requalifié item par item ;
  - badge « صعوبة: أساسي/متوسط/متقدم » dans `src/components/QuizView.tsx`
    (bloc M3, lignes ~330-354) ;
  - verrou `src/__tests__/difficulteQcm.lock.test.tsx` : **5/5 verts**
    (re-vérifié 20/10).
- Distribution réelle mesurée (sonde tsx, 20/10) : 531 QCM servies →
  **D1 250 (47,1%) / D2 127 (23,9%) / D3 154 (29,0%)**.
- La cible 75/20/5 documentée dans `index.ts` se réalise **par AJOUT de
  contenu D1/D2** (ressortit à un enseignant, H2), jamais par requalification.
  La cible 40/35/25 du rapport demande le même mécanisme.
- Le seul reste « brancher sur le moteur » (progression facile→difficile dans
  `ordonnerParDues` ou filtre à l'ouverture) reverserait une décision
  documentée (« sans dues, la liste est rendue telle quelle — aucun
  réordonnement cosmétique ») ; décision prise le 20/10 : **H3 fermé**,
  refonte moteur remise à un arbitrage pédagogique explicite.

## 2. « 3 fichiers SVG avec emojis » — FAUX, 9 fichiers

Compté par sonde Unicode (U+2600–U+27BF + paires surrogates) : **9 fichiers,
14 occurrences**. Corrigé intégralement dans `ffc2861` (SVG Niveau 1) :
14 → **0 emoji sur les 110 schémas** (sonde vide post-tranche).

## 3. « App.tsx 70 000 lignes » — FAUX, ×10

`App.tsx` fait ~7 000 lignes. Le chiffre de l'audit est erroné d'un facteur 10.

## 4. « `npm run build` non vérifiable » — FAUX, il est vert

Build vérifié le 20/10 : **✓ built in 37,32 s** (tranche SVG Niveau 1),
après vitest 3548/3550, jest 3491/3493, boussole 138/0.

## Autres corrections apportées par l'audit, confirmées justes

- U11 « trouée » : vrai — commentaire `src/data/programSequence.ts:95`
  (collision/تقلص/ophiolites à reconstruire) cité mot à mot. → H2.
- 110 SVG, 15 `kunzBg`, 569 flashcards, 121 textes à trous servis : justes.
- Pas d'APK, pas de CI/budgets, correcteur non validé sur corpus indépendant
  (les 40 `eleve_*.txt` sont un corpus de calibrage, pas de validation) :
  justes → H1, M1, M3.
