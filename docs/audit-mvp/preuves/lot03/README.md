# Preuves du lot 03 — 30/10/2026

Référence `9bccc8b`, Chromium 156.0.8078.4 / Playwright Python, serveur local
`http://localhost:3000`. Profils jetables, aucune donnée élève réelle.
Synthèse et limites : [LOT03](../../LOT03.md).

## Reproduction

Depuis la racine du projet, serveur lancé avec `npm run dev` :

```powershell
python docs/audit-mvp/preuves/lot03/explore.py
python docs/audit-mvp/preuves/lot03/audit_browser.py
python docs/audit-mvp/preuves/lot03/supplement.py
npm run lint
```

L'exploration écrit `metadata.json` (contenus attendus tirés des exports réels)
et les captures 00–02. Le scénario principal écrit `browser-results.json`,
35 observations et les captures 03–22 ; le complément écrit
`supplement-results.json`, cinq observations et les captures 23–30.
Chaque capture PNG possède un relevé JSON (texte, boutons, stockage borné,
dimensions). Les scripts réutilisent les outils des lots 01/02.

**Accès simulé** : `premium()` place un token factice explicitement nommé comme
fixture et un cache d'essai dans le navigateur de test, puis intercepte ses
appels API. Cela permet d'auditer la vue protégée, pas la facturation ni la
sécurité de l'authentification. Aucun compte ni abonnement n'a été créé.
Le scénario `guest_bridge` n'appelle pas ce helper : les déclarations du
parcours sont faites par clics visibles, puis l'absence de token est relevée.

Les réponses correctes provenant du corpus servent à vérifier score, câblage
et transitions. Les contre-exemples sont des entrées de test identifiées ; ils
ne modifient aucun contenu pédagogique du produit.

## Tests exécutés

Premier groupe : **14 fichiers / 145 tests réussis**.

```powershell
npx vitest run src/data/qcmLivre.lock.test.ts src/data/qcmBilan.lock.test.ts src/components/__tests__/QcmLivreView.test.tsx src/components/__tests__/qcmLivreOnComplete.test.tsx src/data/fillBlanksLoader.test.ts src/data/__tests__/fillBlanks.integrity.test.ts src/utils/__tests__/fillBlankValidate.test.ts src/components/__tests__/QuizView.fillBlank.test.tsx src/data/schemaDrills.lock.test.ts src/components/__tests__/SchemaDrillView.test.tsx src/data/situationIndex.lock.test.ts src/components/__tests__/SituationBankView.test.tsx src/components/__tests__/atelierFlux.test.tsx src/utils/__tests__/methodologyScorer.v2.test.ts
```

Second groupe distinct : **7 fichiers / 101 tests réussis**.

```powershell
npx vitest run src/components/__tests__/DocumentFigure.test.tsx src/data/documentAnalysisCounterProof.test.ts src/data/documentAnalysis.integrity.test.ts src/data/documentTypology.test.ts src/components/__tests__/ExamensHubView.test.tsx src/components/__tests__/TrainingHubView.test.tsx src/components/__tests__/PortesUniques.test.tsx
```

Total de ce lot : **21 fichiers / 246 tests**, sans doublon entre ces groupes.
`npm run lint` réussi. Logs locaux ignorés (`tests.log`, `tests-supplement.log`,
`typecheck.log`). Les volumes des différents lots ne sont pas additionnables
comme tests uniques. Le test `atelierFlux` couvre le composant de méthode,
pas `LessonTwoView` : F15 repose sur le parcours navigateur réel.

## Précautions du harnais

Les premières exécutions ont rencontré des problèmes de synchronisation :
composants différés pas encore montés, portail d'introduction U1 à traverser,
transition native plein écran du zoom et bulle de guide couvrant une carte
mobile. Les scripts finaux attendent les vues, traversent le portail, laissent
aboutir le plein écran avant Échap et ferment la bulle par son bouton visible.
Des actions utilisent le clavier réel (focus/Entrée), pas un événement injecté.
Les sélecteurs du tableau de bases et du bouton final ont aussi été ajustés
aux éléments réels. Aucun code produit n'a été changé pour faire réussir l'audit.

Les deux relevés finaux ont `scenarioErrors: []` et `pageErrors: []`.
Les échecs temporaires du harnais ne sont pas comptés comme défauts produit.
Les captures retenues portent les numéros 00–30 ; les diagnostics temporaires
ne font pas partie de la livraison.

Pas de suite globale, Jest, build ou CI distante réexécutés ici ; pas de
certification des profils payants, du mode enseignant, de la pédagogie complète,
de l'APK ni de la disponibilité PWA au premier lancement hors ligne.
