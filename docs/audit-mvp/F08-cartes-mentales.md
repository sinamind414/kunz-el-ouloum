# F08 — Cartes mentales et détails des notions

Audit du 2026-10-30, `67afd92`. Invité, Chromium bureau et viewport mobile.
Contrat : explorer les relations d'une unité, consulter une notion et rejoindre
son entraînement sans perdre les contrôles de la carte.

## Traçabilité

- [Vue principale](../../src/components/MindMap/MindMapView.tsx).
- [Canvas D3](../../src/components/MindMap/D3MindMapCanvas.tsx).
- [Détails et quiz](../../src/components/MindMap/MindMapNodeDetails.tsx:181).
- [Données](../../src/data/mindMapData.ts).
- Dépendances F10, F40, F47 et zoom global. `figureZoomRuntime.ts` et les autres
  fichiers de zoom sont protégés : lecture seulement, aucun correctif tenté.

## Vérifications

| Scénario | Résultat |
|---|---|
| Cours → cartes mentales | Carte U1 et onze choix d'unité présents |
| Carte U1 | Quinze nœuds et seize relations rendus |
| Cliquer un nœud | Détails sélectionnés, mais superposition de zoom ouverte : L02-02 |
| Fermer le zoom par Échap | Détails et bouton de quiz à nouveau accessibles |
| Changer en arbre hiérarchique | Quinze nœuds toujours rendus |
| Saisir une recherche sans correspondance | Opacité des nœuds modifiée ; aucune liste de résultats, la recherche agit comme un surlignage |
| Choisir l'unité officielle 4, sélectionner puis lancer le quiz | Bon quiz d'immunité U4, 77 questions proposées dans ce sondage |
| Choisir U6 en invité | Paywall ; aucun retour local vers les unités gratuites |
| Viewport mobile 390×844 | Rendu capturé, pas une validation du maniement tactile complet |

Preuves : `F08-*` dans le [journal](preuves/lot02/browser-results.json),
[zoom parasite](preuves/lot02/12-map-click-overlay.png),
[détails après fermeture](preuves/lot02/13-node-details-without-overlay.png),
[paywall](preuves/lot02/14-map-paywall.png),
[mobile](preuves/lot02/21-mobile-map.png).

Les clés internes 3 et 4 ne coïncident pas avec les numéros officiels affichés,
mais les nœuds transmettent les bons `unitId` ; le quiz d'immunité est bien U4.
Cette différence interne n'est donc pas qualifiée de mauvaise orientation.

## Défauts et limites établis

**L02-02 — Conflit avec le zoom global, gravité modérée.** Cliquer un nœud ouvre
la superposition statique de figure, qui intercepte les clics destinés aux
contrôles de l'application. Échap permet de retrouver la carte et les détails.
Le D3 écoute le clic sur ses `g.node-item` ; le runtime global reconnaît aussi le
SVG comme figure zoomable. Le canvas ne porte pas de marque d'exclusion du zoom.
Confiance élevée sur la reproduction, cause étayée par ces deux chemins de code.

**L02-03 — Nœuds non accessibles au clavier, gravité modérée.** Les quinze nœuds
U1 sont des éléments SVG `g` cliquables sans `tabindex`, rôle interactif ni handler
de touche. Le relevé constate zéro nœud focalisable. Les boutons autour du canvas
ne remplacent pas la possibilité de sélectionner un concept au clavier. Ce constat
ciblé ne constitue pas un audit complet avec lecteur d'écran.

**Dépendance L01-04 :** le même défaut de retour local observé sur le paywall HTML
se retrouve sur le paywall de carte mentale. Le reste de la navigation demeure
accessible ; ce n'est pas un enfermement total dans l'application.

## Verdict et MVP

**Partielle.** Le graphe, les détails et le lien au quiz existent, mais la sélection
est perturbée et n'offre pas d'équivalent clavier identifié. Proposition :
**simplifier ou différer** tant que les interactions ne sont pas fiables ; conserver
les données pour éviter une perte de contenu. Aucune suppression décidée.

Non vérifiés : chaque nœud et relation scientifique, drag et zoom multitouch
sur appareil réel, contraste exhaustif, toutes les unités et états payants,
mode plein écran sur Android et démarrage PWA hors ligne.
