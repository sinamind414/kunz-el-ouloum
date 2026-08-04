# Audit final visuel

Date d'audit : 2026-07-30

## Méthode

Audit réalisé par inspection du code et de l'état réel du dépôt, puis vérification par commandes :
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:smartbot`
- `npm run build`

Ce document **ne prétend pas** décrire un comportement navigateur non observé directement. En revanche, il confirme les causes structurelles visibles dans le code.

## Conclusion principale

### Problème confirmé : la page **Leçons** n'affiche pas les visuels modernes comme porte d'entrée

C'est cohérent avec ton retour :
> "j'ai rentré sur l'application aucun photo ou illustration moderne sur la page lessons"

## Constats critiques

### 1) `LessonsView` ne rend aucune image de leçon

Dans `src/components/LessonsView.tsx`, aucune balise image ni preview n'est utilisée pour les cartes de domaines, unités ou leçons.

Indices concrets :
- le fichier ne référence ni `img`, ni `ZoomableImage`, ni `imageSrc`, ni `schemaSrc`
- l'affichage repose sur des icônes (`BookOpen`, `Layers`, `Dna`, `Zap`, `Globe2`) et du texte seulement

Conséquence produit :
- les **illustrations modernes existent dans les tunnels de leçon et les documents vivants**
- mais **elles ne sont pas visibles sur la page Lessons elle-même**

### 2) La page Lessons est alimentée par `LESSON_LIBRARY`, pas par `ACTIVE_LESSONS`

Preuves :
- `src/components/LessonsView.tsx:52`
  - les unités visibles sont filtrées avec `LESSON_LIBRARY`
- `src/components/LessonsView.tsx:82`
  - les leçons d'une unité sont récupérées via `LESSON_LIBRARY.filter(...)`

Conséquence :
- les leçons actives modernisées ne remontent pas naturellement dans la page Lessons
- elles existent dans l'application, mais leur source n'est pas la même que celle utilisée par la page Lessons

### 3) 12 leçons actives modernisées ne sont pas présentes dans `LESSON_LIBRARY`

Vérification repo :
- `ACTIVE_LESSONS`: **14** leçons
- leçons actives absentes de `LESSON_LIBRARY`: **12**

Liste :
- `d1-u1-l1-expression-genique`
- `d1-u1-l2-transcription`
- `d1-u1-l3-traduction`
- `d1-u3-l1-enzyme`
- `immunity_self_nonself`
- `immunity_humoral_response`
- `immunity_cellular_response`
- `immunity_memory_response`
- `protein_structure_function`
- `synapse`
- `subduction`
- `seismic_waves`

Implication :
- même si ces leçons sont riches visuellement, **la navigation Lessons ne les expose pas comme de vraies cartes modernes illustrées**

### 4) Les raccourcis visibles dans `LessonsView` sont limités à 3 leçons actives seulement

Preuves :
- `src/components/LessonsView.tsx:251`
  - `d1-u1-l2-transcription`
- `src/components/LessonsView.tsx:261`
  - `d1-u1-l3-traduction`
- `src/components/LessonsView.tsx:271`
  - `d1-u3-l1-enzyme`

Conséquence :
- la majorité des leçons modernisées avec images ne sont **ni en carte illustrée**, ni même en raccourci direct sur cette page

## Constats positifs

### 5) Les visuels modernes sont bien présents dans les tunnels de leçon et documents vivants

État réel actuel :
- assets modernisés réellement branchés dans les leçons/documents actifs : **67**
- anciens fichiers legacy modernisés en place : **12**

Source de vérité :
- `docs/modern-visual-inventory.md`

Donc le problème n'est **pas** l'absence d'intégration des images dans le produit en général.
Le problème est **leur non-surfacing sur la page Lessons**.

### 6) Les vérifications techniques sont vertes

Dernier état vérifié :
- `typecheck` ✅
- `test:unit` ✅
- `test:smartbot` ✅
- `build` ✅

## Diagnostic produit synthétique

### Ce qui est vrai
- les images modernes sont câblées dans les leçons actives
- les documents vivants utilisent bien les galeries et visuels modernes
- la base visuelle modernisée est réelle et large

### Ce qui manque encore
- une **couche de présentation visuelle dans la page Lessons**
- une **liaison explicite entre `ACTIVE_LESSONS` et `LessonsView`**
- des **covers / thumbnails** au niveau des cartes de leçon / unité / raccourci

## Priorité de correction recommandée

### P1 — Corriger la page Lessons
Ajouter une logique de preview visuelle dans `src/components/LessonsView.tsx` :
- dériver une image de couverture depuis `ACTIVE_LESSONS`
- fallback éventuel vers un document vivant lié
- afficher une thumbnail sur les cartes de leçon

### P2 — Exposer toutes les leçons actives modernisées
Au lieu de n'afficher que 3 raccourcis hardcodés :
- lister les leçons actives pertinentes par unité
- ou fusionner `LESSON_LIBRARY` et `ACTIVE_LESSONS` pour la vue Lessons

### P3 — Ajouter des badges explicites
Exemples :
- `تفاعلي جديد`
- `مدعوم بالوثائق`
- `صور حديثة`

## Verdict final

**Ton observation est correcte.**

Le dépôt contient désormais beaucoup de visuels modernes, mais **la page Lessons ne les affiche pas comme galerie d'entrée** parce que :
1. elle n'utilise pas les images des `ACTIVE_LESSONS`
2. elle repose principalement sur `LESSON_LIBRARY`
3. elle n'a pas encore de composant thumbnail / cover

## Étape suivante naturelle

La prochaine vraie correction utile n'est plus l'intégration d'assets, mais :

### `surface modern visuals on Lessons page`

C'est la correction qui rendra enfin visibles les images modernes **dès la page Lessons**, avant même d'entrer dans une leçon.
