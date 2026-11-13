# Preuves du lot 02

2026-10-30 ; code `67afd92`. Windows, Node 22.22.2, Chromium 156.0.8078.4.
Playwright Python et Chromium étaient déjà installés ; aucune dépendance ajoutée.
Serveur Vite/Express local sur `http://localhost:3000`, profils invités jetables.

- [Résultats finaux](browser-results.json) : 42 observations ; `scenarioErrors`
  et `pageErrors` vides. Les observations incluent des défauts, pas 42 tests verts.
- [Log du parcours final](browser-run.log).
- [Contrôles complémentaires](supplement-results.json), [log](supplement.log).
- [Métadonnées des cartes et animations](metadata.json).
- [Fixtures QCM](quiz-fixture.json) : données servies, pas copies d'élèves.
- JSON numérotés : texte, contrôles, stockage invité et dimensions ; PNG : rendu
  réel. L'application utilise parfois un défilement interne : les captures ne
  représentent pas nécessairement tout le contenu d'une rubrique.

## Reproduction navigateur

Prérequis : serveur local actif, Python Playwright et son Chromium disponibles.
Les scripts ne les installent pas. Ils créent leurs propres contextes ; ne pas
remplacer ceux-ci par un profil personnel.

```powershell
python -u docs/audit-mvp/preuves/lot02/explore.py
python -u docs/audit-mvp/preuves/lot02/audit_browser.py
python -u docs/audit-mvp/preuves/lot02/supplement.py
```

Les helpers réutilisent l'accueil du lot 01 et le corpus extrait par son
explorateur. `audit_browser.py F10` relance uniquement ce scénario en remplaçant
ses observations. L'exécution finale complète a réussi ; des logs d'itérations
du harnais peuvent aussi être présents, ils ne constituent pas des défauts produit.

La séance QCM complète utilise les contrôles réels, notamment le clavier, avec
une vérification du compteur et de l'écran de fin. Les fixtures normalisent
les espaces du texte affiché pour identifier l'option, sans injecter de score.
Le lancement sans prédiction du simulateur est testé par un clic forcé Playwright
car le contrôle porte `aria-disabled`, tout en ayant un handler expliquant le verrou.

Le diagnostic du chrono dans `supplement.py` **monte le vrai composant QuizView
isolément dans Chromium**, avec une horloge de test accélérée et deux questions
du corpus. Il ne faut pas le présenter comme une attente réelle de quinze minutes
dans un parcours complet. À zéro, le questionnaire reste présent, ses quatre
options sont actives et aucun callback de fin n'est émis.

## Vérification technique

[Vitest](vitest.log) : code 0, **23 fichiers / 262 tests réussis**.

```text
npx vitest run src/lib/lesson/tunnelStateMachine.test.ts src/lib/lesson/sessionSnapshotService.test.ts src/lib/lesson/sessionEffectsService.test.ts src/lib/parcours/parcoursProgress.test.ts src/lib/parcours/derniereUnite.test.ts src/components/__tests__/OkachaView.test.tsx src/components/__tests__/MicroCapsulePanel.test.tsx src/data/hosila.lock.test.ts src/data/hosilaUnitNumbers.test.ts src/data/okachaProgress.test.ts src/data/okachaQuality.lock.test.ts src/data/cartesHosila.lock.test.ts src/data/resumes.lock.test.ts src/data/microCapsules.lock.test.ts src/data/domain2MindMaps.lock.test.ts src/data/domain3MindMaps.lock.test.ts src/data/enzymeMindMap.lock.test.ts src/components/__tests__/LessonsMindmapMove.test.tsx src/components/__tests__/ElectrophoresisSimulator.test.tsx src/components/__tests__/QuizView.melange.test.tsx src/components/__tests__/QuizView.fillBlank.test.tsx src/components/__tests__/diagnosticQuiz.test.tsx src/__tests__/chaineErreurQuiz.cablage.test.ts
```

[Typecheck](typecheck.log) : `npm run lint`, code 0. Aucun correctif produit.
Suite globale, Jest, build et CI distante non exécutés dans ce lot.

## Captures clés

- [Brouillon avant](07-draft-before-reload.png) / [après reload](08-draft-after-reload.png).
- [Synthèse notée](09-summary-rated.png), [retour du paywall](10-summary-paywall.png).
- [Conflit de zoom](12-map-click-overlay.png), [détails](13-node-details-without-overlay.png).
- [Égalité inexacte du simulateur](16-simulation-approximation.png).
- [QCM : feedback](17-quiz-wrong-feedback.png), [fin](18-quiz-completed.png),
  [reprise](19-quiz-retry-completed.png).
- [Mobile : synthèse](20-mobile-summary.png), [carte](21-mobile-map.png),
  [animation](22-mobile-animation.png), [quiz](23-mobile-quiz.png).
- [Chrono à zéro — composant isolé](24-quiz-after-expiry.png).
