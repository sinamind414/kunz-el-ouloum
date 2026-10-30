# Preuves du lot 04 — 30 octobre 2026

Référence produit `9bccc8b`, aucun code produit modifié. Chromium 156.0.8078.4,
Playwright Python, PyMuPDF pour inspecter l'impression. Serveur local 3000.
Synthèse et limites : [LOT04](../../LOT04.md).

## Reproduire les scénarios

Depuis la racine, avec `npm run dev` actif :

```powershell
python docs/audit-mvp/preuves/lot04/explore.py
python docs/audit-mvp/preuves/lot04/audit_browser.py
python docs/audit-mvp/preuves/lot04/supplement.py
npm run lint
```

`metadata.json` contient les exports réels utilisés comme fixtures techniques :
trois niveaux Meftah, trois exercices BAC, onze unités Tadwin, douze cartes de
verbes, onze exercices de méthode, douze groupes de questions de barème
diagnostique et six groupes officiels 2025. Ne pas confondre les deux derniers.

`browser-results.json` et `supplement-results.json` sont les relevés finaux.
Ils contiennent **44 observations**, sans erreur de scénario ni exception
JavaScript de page dans le périmètre capturé.
Captures numérotées **00–34**, 35 images au total, y compris les images issues
des impressions A4. Les JSON associés aux captures d'impression contiennent
le texte extrait par page ; les autres contiennent texte de l'écran, contrôles,
stockage borné et dimensions.

Les PDF sont des fichiers de contrôle locaux ignorés par Git ; leurs images
et les relevés sont conservés. L'impression appelle le moteur Chromium avec
A4 et fonds actifs, sans injecter de CSS correctif. Un second essai du HTML
autonome utilise `prefer_css_page_size=True` et obtient aussi quatre pages.

## Profils et temps simulés

Les parcours méthode, correction locale et Tadwin sont réalisés en invité.
L'approbation locale est relevée **sans token**. Pour le seul accès à la banque
BAC de F20, `premium()` utilise un token explicitement factice et intercepte
les appels API du contexte de test ; aucun compte, paiement ou essai serveur
n'est créé ou validé.

Le rappel Tadwin est testé en avançant l'horloge Chromium au-delà de
`prochainRappelAt`, sans éditer la date du store. La persistance du palier 4
est contrôlée **avant** cette simulation temporelle. La bulle et le dialogue
quotidien sont fermés par leurs vrais boutons lorsqu'ils apparaissent.
Il n'y a pas d'observation sur plusieurs journées réelles.

Les premiers essais ont exigé des ajustements du harnais : sérialisation des
regex des fixtures, réouverture des écrans d'accueil après navigation, sélection
de la bonne porte parmi deux contrôles nommés « قفل », et séparation du contrôle
de rechargement et de l'horloge simulée. Aucun de ces ajustements ne modifie
le produit ou ses données pédagogiques. La dernière contre-épreuve F18 a été
rejouée isolément et remplace ses observations antérieures dans le relevé.

## Tests exécutés

Premier groupe : **19 fichiers / 310 tests réussis**.

```powershell
npx vitest run src/components/MeftahView.test.tsx src/components/__tests__/BoussoleCard.test.tsx src/components/__tests__/TadwinView.test.tsx src/lib/tadwin/tadwinEngine.test.ts src/data/tadwinCles.lock.test.ts src/data/tadwinCalibration.test.ts src/components/CorrecteurPanel.test.tsx src/correcteurV1.test.ts src/data/dictionaries/p2.attendusObligatoires.test.ts src/data/dictionaries/calibrationBac2025.test.ts src/data/dictionaries/attendusBac2025.test.ts src/components/__tests__/WritingReviewPanel.test.tsx src/components/__tests__/WritingReportSheet.test.tsx src/data/writingReview.test.ts src/data/writingProgress.test.ts src/utils/__tests__/correctionQueue.test.ts src/components/__tests__/atelierFlux.test.tsx src/utils/__tests__/methodologyScorer.v2.test.ts src/lib/validation/letterGrid.test.ts
```

Second groupe distinct : **11 fichiers / 177 tests réussis**.

```powershell
npx vitest run src/lib/validation/couvCle.test.ts src/lib/validation/ValidationEngine.test.ts src/lib/validation/ValidationEngine.errata.test.ts src/utils/__tests__/methodologyToLetter.test.ts src/utils/__tests__/phase2.test.ts src/data/dictionaries/dictionnaireCorrecteur.test.ts src/data/dictionaries/sanctionsCorrecteur.test.ts src/data/dictionaries/correcteurIntegration.test.ts src/data/dictionaries/integriteCopie.test.ts src/data/dictionaries/plafondNonProse.test.ts src/components/__tests__/BacIdeaTrainer.test.tsx
```

Total du lot : **30 fichiers distincts / 487 tests**, puis `npm run lint` réussi.
Logs locaux ignorés (`tests.log`, `tests-supplement.log`, `typecheck.log`). Pas
de nouvelle mesure de suite globale, de Jest, de build ou de CI distante.

## Portée des contre-épreuves

Aucun fichier `eleve_*.txt` utilisé pour annoncer une performance indépendante.
Les réponses modèles testent les transitions ; les productions sans rapport,
les mots répétés et les termes concaténés sont des entrées synthétiques.
Les six appels de notation directe ne sont pas six corrections humaines.
La présence d'un garde-fou ne certifie pas tous les raisonnements acceptés.
