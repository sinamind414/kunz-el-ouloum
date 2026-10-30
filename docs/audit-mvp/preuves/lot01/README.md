# Preuves du lot 01

Date : 2026-10-30. Code examiné : `67afd92` ; modifications documentaires locales.
Environnement : Windows, Node 22.22.2, serveur Express/Vite de développement sur
`http://localhost:3000`, Chromium 156.0.8078.4 via Playwright Python déjà installé.
Pas d'ajout de dépendance au projet. Contextes navigateurs invités jetables,
sans connexion réelle ni données personnelles. Aucun fichier produit modifié.

## Lire les résultats

- [Résultats principaux](browser-results.json) : 34 observations, zéro exception
  JavaScript de page, aucun `harnessError` dans l'exécution finale.
- [Compléments](supplement-results.json) : reprise après reload ; identification
  et retour d'un résultat HTML payant.
- [Log principal](browser-run.log) et [log complémentaire](supplement-run.log).
- [Catalogue](catalogue.json) : exports lus dans le navigateur via les modules
  Vite, y compris les blocs utilisés comme fixtures techniques.
- Fichiers numérotés JSON : texte, boutons, test IDs, dimensions et état local
  de ce contexte de test. Les gros corpus de stockage sont omis de ces relevés.
- Fichiers PNG : captures du vrai rendu, examinées visuellement sur un échantillon
  incluant cours, transition 6/4, mobile et variante payante accessible.

Les observations enregistrent aussi des défauts ; leur nombre n'est pas un
compteur de tests réussis. Les deux requêtes HTML en échec du journal principal
proviennent du téléchargement volontairement interrompu par le harnais.
Les captures sont celles du viewport de l'application : son contenu possède un
défilement interne, « full_page » ne signifie donc pas capture intégrale du cours.

## Reproduire les contrôles navigateur

Prérequis : serveur local en marche (`npm run dev`), Playwright Python et son
Chromium disponibles. Les scripts ne les installent pas.

```powershell
python docs/audit-mvp/preuves/lot01/explorer.py
python -u docs/audit-mvp/preuves/lot01/audit_browser.py
python -u docs/audit-mvp/preuves/lot01/supplement.py
```

`explorer.py` prépare le catalogue et les premières captures ; le harnais
principal et le complément le lisent. Les scripts remplacent leurs propres
preuves lors d'une nouvelle exécution. Ne pas les employer sur une session
personnelle : ils créent volontairement leurs propres contextes vierges.
Les réponses de traversée sont des fixtures d'intégration tirées des attendus,
pas un échantillon de copies élèves et pas une mesure de validité pédagogique.

## Vérification technique exécutée

[Vitest](vitest.log) : code de sortie 0, **21 fichiers / 268 tests réussis**.
Commande exacte, depuis la racine :

```text
npx vitest run src/data/curriculumIntegrity.test.ts src/data/lessonListIntegration.test.ts src/data/lessonHtmlGetters.test.ts src/data/lessonChapterSplit.test.ts src/data/lessonRenderParcours.test.ts src/data/activeLessons.test.ts src/data/ActiveLessonEnzyme.test.ts src/data/htmlLessonProgression.test.ts src/data/lessonIndex.search.test.ts src/data/__tests__/lessonIndex.search.r5.test.ts src/components/__tests__/SearchView.test.tsx src/components/__tests__/ParcoursView.test.tsx src/components/__tests__/LessonsViewPassiveNav.test.tsx src/components/__tests__/LessonsViewActiveNav.test.tsx src/components/__tests__/LessonsViewDeeplink.test.tsx src/components/__tests__/HtmlLessonViewerRenduEleve.test.tsx src/lib/lesson/tunnelStateMachine.test.ts src/lib/lesson/sessionSnapshotService.test.ts src/lib/lesson/sessionEffectsService.test.ts src/lib/parcours/parcoursPath.test.ts src/lib/parcours/parcoursProgress.test.ts
```

[Typecheck](typecheck.log) : `npm run lint`, code de sortie 0 (`tsc --noEmit`).
Les scripts navigateur finaux sont également sortis avec le code 0 ; cela
signifie exécution du harnais, pas absence de défaut produit.

Non exécutés : suite entière, Jest, build, tests post-build et vérification de
la CI distante. Le lot modifie uniquement la documentation et ses preuves ;
il n'est ni un correctif produit ni une certification de livraison.

## Captures déterminantes

- [Leçon HTML](05-html.png), [quiz](06-html-quiz.png), [erreur réseau](20-html-load-error.png).
- [Avant retour actif](07-active-before-back.png), [réouverture](08-active-after-back.png).
- [Fin de leçon](09-active-completed.png), [suivante déjà terminée — 6/4](10-active-next.png).
- [Recherche](11-search-results.png), [variante U6 ouverte en invité](12-paid-search-result.png).
- [Paywall U6 normal](19-paid-normal-gate.png), [paywall HTML sans retour](22-html-search-paywall.png).
- [Mobile : cours](15-mobile-html.png), [actif](16-mobile-active.png),
  [parcours](17-mobile-parcours.png), [recherche](18-mobile-search.png).
