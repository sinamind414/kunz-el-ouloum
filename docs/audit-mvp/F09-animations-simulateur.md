# F09 — Animations scientifiques et électrophorèse

Audit du 2026-10-30, `67afd92`. Invité, Chromium bureau et viewport mobile.
Contrat : visualiser un mécanisme ; pour le simulateur, prédire puis observer
la relation pH/pHi, charge et sens de migration avec un retour cohérent.

## Traçabilité

- [Galerie](../../src/components/AnimationsView.tsx).
- [Animations SVG et catalogue](../../src/components/ScienceAnimations.tsx:155),
  fichier protégé non modifié.
- [Simulateur](../../src/components/ElectrophoresisSimulator.tsx).
- [Règle de migration](../../src/components/ElectrophoresisSimulator.tsx:39).
- Porte : hub d'entraînement → animations. Dépendances F47/F48 et F43 pour
  la promesse globale hors ligne.

## Scénarios

| Scénario | Résultat |
|---|---|
| Ouvrir la galerie | Trois figures animées ; vingt éléments SVG d'animation relevés |
| Lancer sans prédiction | Indice visible, pas de manche comptabilisée |
| Alanine, pH 7, prédire cathode | Erreur expliquée : pH supérieur à pHi 6 |
| Relancer la même manche | Score non incrémenté une seconde fois |
| Alanine, pH 6, prédire immobile | Réponse validée avec égalité exacte |
| Glutamate, pH 3, pHi 3,2, prédire immobile | Égalité fausse affichée et réponse validée : L02-04 |
| Session chargée, réseau coupé, alanine pH 4 vers cathode | Simulation et explication restent fonctionnelles |
| Viewport 390×844 | Rendu et contrôle du slider observés ; largeur document 390/390 |

Preuves : `F09-*` du [journal](preuves/lot02/browser-results.json),
[égalité exacte](preuves/lot02/15-simulation-equality.png),
[égalité inexacte](preuves/lot02/16-simulation-approximation.png),
[vue mobile](preuves/lot02/22-mobile-animation.png).
Les tests `ElectrophoresisSimulator.test.tsx` font partie des 262 tests verts.

## L02-04 — Approximation présentée comme égalité exacte

**Majeure pour le retour pédagogique, confiance élevée.** Choisir glutamate,
pH 3 et « immobile », puis lancer. Le feedback affirme que **3,0 égale 3,2**,
annonce une charge nulle et valide la prédiction.

La cause est déterminée : `sensMigration()` traite `abs(pH - pHi) < 0.25` comme
immobile ; le slider avance par 0,5 alors que plusieurs pHi ne sont pas des
multiples de 0,5. Le feedback de cette branche utilise pourtant le mot « égal ».
Ce diagnostic établit une contradiction arithmétique et une approximation non
annoncée dans le produit ; il ne prétend pas mesurer une migration expérimentale.

Nouvelle vérification nécessaire avant conservation : cohérence entre les
valeurs sélectionnables, les seuils utilisés, les directions et le texte affiché,
pour chaque molécule, notamment de part et d'autre du pHi.

## L02-05 — Mauvaise unité sur une animation

**Mineure, éditoriale.** Le potentiel d'action est étiqueté « unité 2 » dans le
catalogue et l'interface, alors que le catalogue officiel du produit place la
communication nerveuse en **unité 5**. Source : métadonnées chargées dans
[metadata.json](preuves/lot02/metadata.json), comparaison à `curriculumOfficial.ts`.
Aucune donnée scientifique ni SVG n'a été modifié.

## Verdict et MVP

**Partielle.** Les interactions de prédiction et de score fonctionnent dans le
sondage, mais le feedback du simulateur doit être fiabilisé. Proposition :
**simplifier et conserver seulement les mécanismes vérifiés**, ou différer le
simulateur si cette revue n'est pas faite. Décision proposée.

Non vérifiés : précision de toutes les animations, performances sur téléphone,
réduction du mouvement et usage avec lecteur d'écran, APK, et accès à froid hors
ligne. Le fonctionnement à chaud ne suffit pas à valider l'installation PWA.
