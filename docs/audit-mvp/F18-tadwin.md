# F18 — Tadwin, production courte et rappel de ses clés

## Contrat et périmètre

Audit du 30/10/2026, référence `9bccc8b`, Chromium invité bureau et mobile.
Besoin : choisir 2–3 clés d'une unité, écrire une synthèse courte, recevoir un
retour puis revoir sa fiche. **Évaluation Tadwin ≠ note de BAC.**

`docs/tadwin_decisions.md` fixe une couverture **par clé**, pas par union de
mots. L'interface propose cinq paliers 0–4 ; les données couvrent 11 unités,
33 clés. Le commentaire du moteur « non câblé dans App » est périmé : la vue
est effectivement accessible depuis Entraînement → Tadwin.

## Traçabilité

| Élément | Source | Observation |
|---|---|---|
| Entrée et formulaires | `TadwinView.tsx`, `trainingHub.ts` | Paliers, choix, éditeur, verdict et rappel |
| Clés | `data/tadwinCles.ts` | Trois clés par unité, atomes déclarés ; lecture seule |
| Score et transitions | `lib/tadwin/tadwinEngine.ts` | C2 par clé, détection de bourrage, enregistrement et transitions |
| Reconnaissance | `lib/validation/couvCle.ts`, `negationAr.ts`, `stuffingDetector.ts` | Négation et répétitions prises en compte dans ce moteur |
| Sauvegarde | `kunz_tadwin_etat_v1`, `kunz_tadwin_fiches_v1` | Palier et fiches soumises persistants ; brouillons seulement en React |
| Calendrier | `data/store.ts`, `enregistrerRappel` | Calendrier nominal J+1/3/7/14, distinct du SM-2 adaptatif F21 |
| Tests | Vue, moteur, calibration des clés et `couvCle` | Exécutés dans les 487 tests ciblés |

## Parcours réel et preuves

Captures 02, 12–16, 27–28 et 32 ; relevés `F18-*` dans
[le scénario principal](preuves/lot04/browser-results.json) et
[le complément](preuves/lot04/supplement-results.json).

| Cas | Observé |
|---|---|
| Paliers 0–2 | Production vide refusée ; écriture puis transitions accessibles |
| Répétition excessive en pratique assistée | Avertissement de bourrage affiché |
| Sélection autonome | Au moins deux clés nécessaires |
| Réponse technique couvrant deux clés U1 | C2=100 %, conseil et étiquette « ليست نقطة البكالوريا » |
| Sauvegarde après soumission | Fiche enregistrée, premier rappel J+1 |
| Rechargement avant soumission | Palier 3 conservé, mais choix des clés et texte perdus |
| Consolidation | Pas de nouvelle production ni de sélecteur d'unité |
| Rappel à échéance simulée | Réponse masquée puis révélée ; auto-évaluation met à jour la prochaine date |
| Réponse hors sujet distincte | C2=0 %, quand même enregistrée et envoyée en consolidation |

L'échéance du rappel est testée par horloge Chromium avancée au-delà de la date
sauvegardée, sans réécrire cette date. Ce n'est pas une observation sur plusieurs
jours réels ni une notification système. Le rappel est auto-déclaré.

## Défauts reproduits

**L04-03 — majeur, boucle de production fermée.** Après la première fiche,
le palier 4 persiste. Aucun bouton ne permet de rédiger une seconde fiche, de
revenir au choix de clés ou de changer d'unité. Revenir/recharger n'ouvre pas
ce chemin. La consolidation est utilisable, mais le carnet ne peut pas être
alimenté normalement par l'interface testée.

**L04-04 — majeur pédagogique.** Écrire une réponse sans les clés attendues :
verdict 0 %. Elle est déjà sauvegardée, puis le seul bouton de suite ouvre la
consolidation. Pas de correction du texte ou de nouvelle tentative proposée.
Attendu : permettre la réécriture avant de programmer la mémorisation ;
observé : un texte non validé entre dans le carnet de rappel.

**L04-05 — modéré, brouillon perdu.** Au palier 3, sélectionner deux clés,
écrire, recharger et rouvrir Tadwin : retour au choix de clés, texte disparu.
Le palier persiste, pas le travail en cours. Distinct des pertes F03 et F15.

## Verdict et proposition MVP

**Partielle : couverture et première sauvegarde fonctionnent sur l'échantillon,
boucle d'écriture et réécriture incomplète.** Conserver seulement après ouverture
d'un cycle simple : choisir → écrire → revoir → corriger → rappeler.
Prioriser cette cohérence avant les paliers et badges supplémentaires.

Usage réel, validité indépendante des 33 clés et efficacité du rappel non
mesurés. Aucun ajustement aux notes professeur ; pas d'APK, de synchronisation,
de notification réelle ou d'accessibilité exhaustive validés. Aucun correctif.
