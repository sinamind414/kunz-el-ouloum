# Analyse des livres ajoutés sur GitHub — 2026-09-20

**Contexte.** Après 6 échecs du canal upload UI, le propriétaire a déposé les documents
par **upload web GitHub** (canal validé) : commits `ffa8676` + `5548459` sur `master`
(master non touché par l'agent — analyse en lecture via `git show`). Vérification faite :
`git fetch` puis `git diff --stat f8df459 origin/master` → 6 fichiers, 78 688 lignes.

> **Conclusion en une phrase : aucun fichier n'est une banque QCM prête à l'emploi**
> (0 marqueur « اختر », 0 option `[A-D]` dans les 6) — la banque 55/55 du livre
> officiel reste la source ; en revanche, 3 fichiers sont **exploitables** comme
> sources de cours/exercices et 1 découverte **corrige une décision terminologique**.

---

## 1. Inventaire et verdicts

| Fichier | Lignes | Nature | Verdict |
|---|---|---|---|
| `FINALBAC_VOLUME_1.txt` | 955 | Résumé de révision BAC (OCR), 3 domaines, TOC p.6/53/68 | 🟡 Cours condensé. Pas de QCM, pas d'exercices. OCR arabe à confusion intra-arabe |
| `FINALBAC_VOLUME_2.txt` | 1 097 | Idem, détail par unité (OCR) | 🟡 Idem — 2/8 « الوظيفي » corrompus (« الوطفي », « الفطيفي ») |
| `504601676-كتاب-العلوم…بوزار.txt` | 2 254 | Livre commercial « للمتفوقين » (مشروع عكاشة, coordonnées commerciales en tête) | 🟢 **72 تمرين** + méthode — vrai livre d'exercices |
| `الكتاب_المصحح_v1.0.md` | 2 586 | Cours MD propre, 11 unités (إشكالية + contenu + exercices), revendique vérification vs scan 334 p. | 🟢 Candidat **textes de cours** (après vérification vs livre officiel, pas en confiance aveugle) |
| `PROGRAMME NATIONAL SVT CLAUDE OPUS - Copie.MD` | 10 007 | Compendium MD structuré (469 titres) : أهداف/ملخص par unité + **اختبارات تجريبية نمط بكالوريا par domaine** (ex. ADN→ARNm→peptide) | 🟢 **Le plus structuré** — 3 tests bac complets + 80 تمرين. Provenance IA revendiquée (nom du fichier) |
| `المكتبة_الكاملة_SVT.md` | 61 787 | Compilation 39 documents : **17 niveau BEM (3 متوسط — hors périmètre 3AS)** + 22 BAC (méthodologie, fiches, magazines, 1 « généré par Gemini ») | 🟡 22 docs BAC utiles en veine ; 43 % du volume hors périmètre |

## 2. Qualité OCR (mesurée, pas estimée)

- Bruit latin collé à l'arabe : 1–2 % de lignes (faible).
- **Le vrai risque est intra-arabe** (confusions ر/ز, ح/ة, ف/ب) — invisible pour la
  métrique précédente. Test par lexique : « الوظيفي » correct 25/25 dans V1 mais
  6/8 dans V2 ; « البكالوريا » 2/3. → **Interdiction d'injecter ces OCR verbatim**
  dans l'app : toute réutilisation passe par ancrage/correction puis verrou lexical
  (règle standing : injection mécanique, transcription manuelle proscrite).

## 3. Découverte terminologique — corrige la cible « harmonisation الظهيرة »

Mesure sur le **livre officiel ingéré** (`data/bookContent.json`) :

- `الظهرات` : **25** occurrences — contextes **pluriels/génériques** : « كالظهرات
  والخنادق », « على مستوى الظهرات ».
- `الظهرة` : **24** occurrences — contextes **singuliers** : « محور الظهرة »,
  « على جانبي الظهرة », « الظهرة وسط-محيطية ».
- `الظهيرة` : **0** — cette forme n'existe nulle part dans le livre.

Les sources .md propres (pas d'OCR) confirment : `الظهرة` 40× (PROGRAMME NATIONAL),
19× (الكتاب المصحح), 83× (المكتبة), `الظهيرة` 0× partout.

**Conséquences :**
1. **Le singulier correct du livre est `الظهرة`** (dorsale) ; `الظهرات` = pluriel
   (les dorsales). Les deux sont légitimes selon le contexte — une harmonisation
   totale vers `الظهرats` (cible R2 pour la file des 10 textes de cours) était
   **partiellement erronée** : les contextes singuliers doivent devenir `الظهرة`.
2. Vérification croisée immédiate : les 6 QCM R2 de `lessonData.ts` — contextes
   majoritairement pluriels (`على مستوى الظهرات`, `عند الظهرات` = conformes) ;
   **2 cas singuliers** (`على جانبي محور الظهرات المحيطية` l.74, `الماغما في محور
   الظهرات` l.74) → cible `الظهرة`, à traiter dans la file nomenclature (mineur,
   contenu correct).
3. **Corrigé ce jour** : `qcmLivre.ts` contenait 2× `الظهيرة` (l.321, l.332, C49)
   → remplacées par `الظهرة` + **verrou** (`qcmLivre.lock.test.ts`) interdisant
   `ظهيرة/ظهيره` (norm : « ظهيره ») dans toute la banque.
4. Les 10 `الظهيرة` des textes de cours (`lessonData.ts` l.74-110, contexte
   singulier : « محور الظهيرة », « خسف الظهيرة ») → cible corrigée : `الظهرة`
   (pas `الظهرات`). File leçons inchangée mais cible rectifiée.

## 4. Plan d'exploitation proposé (à arbitrer par le propriétaire)

1. **Fait (commit R4 bis/c)** : banque 55/55 QCM du livre officiel + verrous 13 tests.
2. **« اختبار نمط بكالوريا »** (module tests bac 3 h) : source = PROGRAMME NATIONAL
   (3 tests complets par domaine) — à ancrer/vérifier mécaniquement vs livre avant
   toute intégration (provenance IA revendiquée = confiance conditionnelle).
3. **Exercices عكاشة** (72 تمرين) : veine d'entraînement supplémentaire — même
  exigence d'ancrage.
4. **Textes de cours** (الكتاب المصحح) : candidate pour la refonte des leçons
   (harmonisation الظهرة incluse) — vérification paragraphe par paragraphe vs livre.
5. **BEM (17 docs)** : hors périmètre 3AS — à ignorer sauf décision contraire.
6. FINALBAC V1/V2 : faible valeur ajoutée (résumés OCR) — pas prioritaire.

## 5. Méthode (reproductible)

```bash
git fetch origin --prune
git -c core.quotepath=false diff --stat f8df459 origin/master
git show "origin/master:<fichier>" > uploads_externes/<fichier>   # lecture seule
```
Métriques : marqueurs QCM (`اختر`, `[A-D]`), titres (`^#`), `تمرين`/`الوثيقة`,
bruit (latin collé, lexique de confusions OCR connues). Référentiel terminologique :
`data/bookContent.json` (25/24/0 = الظهرats/الظهرة/الظهيرة).
