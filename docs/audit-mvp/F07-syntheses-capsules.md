# F07 — Synthèses, mémorisation et capsules

Audit du 2026-10-30, `67afd92`. Invité, Chromium bureau et viewport mobile.
Contrat : lire une synthèse, masquer/révéler ses points, s'autoévaluer et retrouver
sa progression ; consulter une capsule courte avec réponse initialement masquée.

## Traçabilité

- [Vue Hosila/Okacha](../../src/components/OkachaView.tsx).
- [Source générée Hosila](../../src/data/hosila.ts),
  [numéros officiels](../../src/data/hosilaUnitNumbers.ts),
  [progression](../../src/data/okachaProgress.ts).
- [Capsules](../../src/components/MicroCapsulePanel.tsx),
  [corpus](../../src/data/microCapsules.ts), porte dans `RevisionView.tsx`.
- [Notation commune et XP](../../src/App.tsx:531).
- Dépendances : F11, F21, F34, F40 et F45. Aucun fichier généré édité.

## Scénarios et preuves

| Scénario | Résultat |
|---|---|
| Cours officiels → domaine 1 → synthèses | Cinq unités gratuites proposées |
| Ouvrir U1 et marquer mémorisée | État `lus: [d1u1]` conservé après sortie/réouverture |
| Activer le mode mémorisation | Douze points masqués sur l'unité sondée |
| Révéler puis noter « bonne » | Compteur du point incrémenté, +10 XP et statistique de notation conservés |
| Recherche sans correspondance | Message de résultats vide explicite |
| Recherche transversale vers le domaine 2 | Résultats trouvés puis paywall à l'ouverture |
| Revenir depuis ce paywall | Retour aux unités gratuites fonctionne |
| Révision intelligente → capsule | Réponse absente avant clic, visible après révélation |
| Changer de capsule | Question change et réponse redevient masquée |
| Révéler/changer après coupure réseau à chaud | Fonctionne dans la session déjà chargée |
| Lecture sur viewport tactile 390×844 | Rendu observé et capture conservée |

Preuves : `F07-*` dans le [journal principal](preuves/lot02/browser-results.json),
[synthèse notée](preuves/lot02/09-summary-rated.png),
[paywall avec retour](preuves/lot02/10-summary-paywall.png),
[capsule](preuves/lot02/11-capsule.png),
[vue mobile](preuves/lot02/20-mobile-summary.png).

Le corpus chargé annonce **11 synthèses officielles, 72 points, 470 blocs** et
**32 capsules réparties sur les 11 unités**. Les verrous de corpus et de numérotation
ainsi que les tests UI ont été exécutés ; ces nombres ne mesurent pas leur qualité
pédagogique exhaustive.

## Limite documentaire : notation et répétition espacée

La notation d'un point Hosila enregistre son compteur et crédite les statistiques/XP.
Dans le [contrôle complémentaire](preuves/lot02/supplement-results.json), la clé
de l'ordonnanceur `kunz_flashcard_srs_v1` reste absente avant et après notation.
Le callback commun `handleRateCard` ne planifie pas une carte ; `RevisionView`
appelle séparément `rateCard()` pour ses propres flashcards.

Il faut donc corriger l'interprétation initiale : **autoévaluer un point Hosila
ne prouve pas qu'un rappel SM-2 de ce point est programmé**. Les commentaires
qui présentent ce branchement comme « SM-2/XP » sont plus larges que le comportement
observé. Ce n'est pas présenté ici comme un bouton cassé, car la vue ne promet
pas de date de révision pour ce point.

## Verdict et MVP

**Validée sur les parcours représentatifs décrits, avec limites explicites.**
Confiance élevée sur les interactions et la persistance sondées. Proposition :
**conserver**, en simplifiant les noms internes et en documentant correctement la
différence entre lecture, autoévaluation et rappel planifié. Les capsules sont
une extension à arbitrer selon leur valeur, non une dépendance indispensable.

Non vérifiés : exactitude de chaque bloc, rendu de toutes les tables du guide,
impression, toutes les variantes de recherche arabe, paiement actif, APK,
démarrage à froid hors ligne et efficacité de mémorisation réelle.
