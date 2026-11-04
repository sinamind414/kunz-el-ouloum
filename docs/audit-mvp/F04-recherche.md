# F04 — Recherche globale des cours

Audit : 2026-10-30, `67afd92`. Invité, Chromium bureau/mobile.
Contrat : chercher une notion arabe, comprendre les résultats et ouvrir la bonne
ressource en respectant ses droits d'accès.

## Traçabilité

- [Interface](../../src/components/SearchView.tsx).
- [Moteur local](../../src/smartTutorEngine.ts).
- [Construction de l'index](../../src/data/lessonIndexBuilder.ts).
- [Ouverture et contrôle d'accès](../../src/components/LessonsView.tsx:175).
- [Favoris et récents](../../src/utils/favorites.ts).
- Dépendances : F01–F03, F37, F40, F43 et F47.

## Scénarios exécutés

| Scénario | Résultat observé |
|---|---|
| Recherche vide | Favoris et recherches récentes proposés selon l'état local |
| Requête `zzzzzzzzz` | Message explicite d'absence de résultats |
| « تركيب البروتين » | Trois résultats avec bouton d'ouverture dans le sondage |
| Valider avec Entrée | Recherche conservée dans les récents |
| Ajouter une étoile puis quitter/revenir | Favori retrouvé |
| Bases déjà chargées, contexte mis hors ligne, « البروتين » | Deux résultats ouvrables proposés ; recherche locale à chaud fonctionnelle |
| Rétablir le réseau, ouvrir un résultat gratuit | Viewer HTML monté |
| Vue mobile | Champ et résultats utilisables dans le scénario automatisé ; deux résultats ouvrables |
| Ouvrir une variante active U6 en invité | Ouverture inattendue : L01-03 |
| Ouvrir un résultat HTML U6 | Paywall affiché, sans retour local : L01-04, voir F02 |

Preuves : scénarios `F04-*` et `mobile-search` dans le
[journal navigateur](preuves/lot01/browser-results.json),
[capture des résultats](preuves/lot01/11-search-results.png),
[capture mobile](preuves/lot01/18-mobile-search.png).
Tests `SearchView`, `lessonIndex.search` et `lessonIndex.search.r5` exécutés.

## L01-03 — Mauvais rattachement d'une variante active et droits incohérents

**Majeure, reproduite sans token ni modification du cache d'accès.**

1. En invité, ouvrir la recherche et saisir « التركيب الضوئي ».
2. Le premier résultat ouvrable correspond à `phase11_chapitres_21_22`,
   `lessonKind: active`, `unitId: 6`. Ajouter aux favoris permet d'en relever
   l'identité via le stockage écrit par l'action utilisateur.
3. Ouvrir : mission de la leçon affichée, aucun paywall.
4. Comparer : cours actifs → unité 6 → `d2-u6-l1-hill-ruben` → paywall normal.

Preuves : `F04-paid-result-identity` (`tokenPresent: false`),
`F04-paid-result-return`, `F01-paid-normal-gate`,
[capture de la variante ouverte](preuves/lot01/12-paid-search-result.png),
[capture du verrou normal](preuves/lot01/19-paid-normal-gate.png).

Chaîne causale observée :

- L'index peut référencer la variante comme active et lui attribue correctement U6.
- `getActiveLessonKeysForUnit()` exclut les clés considérées HTML par leur préfixe.
- `unitOfActiveLesson()` cherche seulement dans ces listes et retombe sur **1**
  s'il ne trouve pas la clé.
- Le garde de la branche active contrôle donc U1, gratuite, malgré l'U6 transmise
  par le résultat de recherche.

Sources : [classification](../../src/data/lessonModes.ts:52),
[repli sur U1](../../src/components/LessonsView.tsx:119),
[garde actif](../../src/components/LessonsView.tsx:189).
Ce constat porte sur cette variante, pas sur un contournement de tous les contenus.

## Verdict, limites et MVP

**Partielle.** Recherche et navigation gratuites utiles sur l'échantillon, mais
la destination et ses droits ne sont pas cohérents pour toutes les catégories.

Proposition : **conserver après harmonisation de l'identité des leçons et des
contrôles d'accès**. Confiance élevée sur les reproductions ; pertinence globale
du classement non évaluée. Usage réel non mesuré.

Non vérifiés : exhaustivité et pertinence sur toutes les disciplines, fautes
orthographiques variées, délai sur matériel modeste, panne de téléchargement
initial des bases, démarrage PWA hors ligne, autres profils et APK. Une recherche
à chaud hors ligne ne valide pas une ouverture de cours à froid hors ligne.
