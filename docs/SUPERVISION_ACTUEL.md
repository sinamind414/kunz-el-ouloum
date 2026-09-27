# Supervision correcteur — fiabilité mesurée (2026-09-27)

> **Moteur** : commit `bc52ad8` · **Corpus** : `.` · **n** = 40 copies · **référence prof** : 40 notes
>
> ⚠ **PROVENANCE (audit F5, garde-fou)** : ce corpus a servi à **calibrer** les
> registres d'attendus (items, formes, plafonds). Ce n'est **pas** un jeu de
> validation indépendant : les écarts publiés sont un **plancher** de l'erreur
> de généralisation. La validation F5 (300 copies authentiques, double
> correction à l'aveugle, ≥20 % arbitrées, calibration/test séparés) reste
> **à constituer**. Voir le protocole ci-dessous.

## Tableau des copies

| élève | groupe | correcteur | prof | écart | couverture | plafonds | sanctions fortes |
|---|---|---|---|---|---|---|---|
| 1 | S1 /20 | 2.04 | 2.5 | -0.46 | 0.156 | — | — |
| 2 | S1 /20 | 3.24 | 3.5 | -0.26 | 0.213 | — | — |
| 3 | S1 /20 | 7.42 | 4.5 | 2.92 | 0.407 | — | — |
| 4 | S1 /20 | 5.96 | 5 | 0.96 | 0.322 | — | — |
| 5 | S1 /20 | 6.64 | 5.5 | 1.14 | 0.398 | — | — |
| 6 | S1 /20 | 5.21 | 6 | -0.79 | 0.318 | — | — |
| 7 | S1 /20 | 5.74 | 6.5 | -0.76 | 0.37 | — | — |
| 8 | S1 /20 | 7.96 | 7.5 | 0.46 | 0.445 | — | — |
| 9 | S1 /20 | 7.67 | 8 | -0.33 | 0.441 | — | — |
| 10 | S1 /20 | 9.26 | 8.5 | 0.76 | 0.522 | — | — |
| 11 | S1 /20 | 10.54 | 9 | 1.54 | 0.559 | — | — |
| 12 | S1 /20 | 9.65 | 9.5 | 0.15 | 0.517 | — | — |
| 13 | S1 /20 | 11.22 | 9.5 | 1.72 | 0.617 | — | — |
| 14 | S1 /20 | 8.9 | 10 | -1.1 | 0.517 | — | — |
| 15 | S1 /20 | 10.61 | 10 | 0.61 | 0.6 | — | — |
| 16 | S1 /20 | 10.86 | 10.5 | 0.36 | 0.599 | — | — |
| 17 | S1 /20 | 11.22 | 11 | 0.22 | 0.639 | — | — |
| 18 | S1 /20 | 11.74 | 11 | 0.74 | 0.63 | — | — |
| 19 | S1 /20 | 13.61 | 11.5 | 2.11 | 0.731 | — | — |
| 20 | S1 /20 | 12.22 | 11.5 | 0.72 | 0.66 | — | — |
| 21 | S1 /20 | 12.49 | 12 | 0.49 | 0.656 | — | — |
| 22 | S1 /20 | 13.58 | 12.5 | 1.08 | 0.717 | — | — |
| 23 | S1 /20 | 12.86 | 12.5 | 0.36 | 0.681 | — | — |
| 24 | S1 /20 | 14.61 | 13 | 1.61 | 0.742 | — | — |
| 25 | S1 /20 | 13.36 | 13 | 0.36 | 0.683 | — | — |
| 26 | S1 /20 | 13.61 | 13 | 0.61 | 0.721 | — | — |
| 27 | S1 /20 | 14.61 | 13.5 | 1.11 | 0.742 | — | — |
| 28 | S1 /20 | 15.26 | 14 | 1.26 | 0.763 | — | — |
| 29 | S1 /20 | 14.76 | 14.5 | 0.26 | 0.775 | — | — |
| 30 | S1 /20 | 15.76 | 15 | 0.76 | 0.796 | — | — |
| 31 | S1 /20 | 15.26 | 15 | 0.26 | 0.763 | — | — |
| 32 | S1 /20 | 15.76 | 15.5 | 0.26 | 0.796 | — | — |
| 33 | S1 /20 | 15.76 | 16 | -0.24 | 0.796 | — | — |
| 34 | S1 /20 | 15.76 | 16.5 | -0.74 | 0.796 | — | — |
| 35 | S1 /20 | 17.26 | 17 | 0.26 | 0.868 | — | — |
| 36 | S1 /20 | 16.76 | 18 | -1.24 | 0.844 | — | — |
| 37 | S1 /20 | 16.76 | 18.5 | -1.74 | 0.844 | — | — |
| 38 | S1 /20 | 17.26 | 19 | -1.74 | 0.868 | — | — |
| 39 | S1 /20 | 17.26 | 19 | -1.74 | 0.868 | — | — |
| 40 | S1 /20 | 17.76 | 19.5 | -1.74 | 0.892 | — | — |

## Fiabilité globale /20

| métrique | mesure | cible F5 | statut |
|---|---|---|---|
| Pearson r | 0.972 | (association seulement) | — |
| **MAE** (\|écart\| moyen) | 0.9 | **≤ 1,0 pt** | ✅ |
| **Biais signé** (moteur − prof) | 0.26 | **\|biais\| ≤ 0,3 pt** | ✅ |
| **κ pondéré quadratique** | 0.967 | **≥ 0,80** | ✅ |
| Moyenne correcteur / prof | 11.96 / 11.7 | — | — |

> κ pondéré : Pearson seul mesure une **association** — un correcteur qui
> surenote tout de +3 a r = 1 et un accord nul. Le κ quadratique pénalise
> chaque désaccord proportionnellement à sa gravité.

## Par exercice

| exercice | r | MAE | **biais signé** | **κ** | **MAE / barème** | cible | statut |
|---|---|---|---|---|---|---|---|
| Ex1 | 0.899 | 0.64 | 0.43 | 0.698 | 13% | ≤ 8 % / κ ≥ 0,80 | ❌ |
| Ex2 | 0.967 | 0.84 | -0.84 | 0.82 | 12% | ≤ 8 % / κ ≥ 0,80 | ❌ |
| Ex3 | 0.904 | 0.96 | 0.66 | 0.849 | 12% | ≤ 8 % / κ ≥ 0,80 | ❌ |

## Par tranche de note (référence prof)

| tranche | n | biais signé | MAE |
|---|---|---|---|
| 0 ≤ note < 5 | 3 | 0.73 | 1.21 |
| 5 ≤ note < 10 | 10 | 0.49 | 0.86 |
| 10 ≤ note < 15 | 16 | 0.68 | 0.81 |
| 15 ≤ note ≤ 20 | 11 | -0.69 | 0.97 |

> **Lecture du biais par tranche** : un biais positif sur les notes faibles
> et négatif sur les notes hautes = **compression de la plage** — le moteur
> surenote les copies faibles et sous-note les copies fortes. Sur les copies
> fortes, l'écart vient principalement des **variantes de formulation non
> reconnues** (levier F3) ; le plafond modèle ci-dessous montre si une cause
> structurelle s'ajoute (levier F2).

## Plafond modèle (réponse modèle officielle)

> Maximum que le moteur peut accorder sur une **réponse modèle parfaite**.
> Un plafond inférieur au barème est une cause **structurelle** de sous-note :
> aucun élève, même parfait, ne peut le dépasser.

| sujet | exercice | modèle | barème | plafond | sans plafond structurel |
|---|---|---|---|---|---|
| 1 | Ex1 | 5 | 5 | 100 % | ✅ |
| 1 | Ex2 | 7 | 7 | 100 % | ✅ |
| 1 | Ex3 | 7.36 | 8 | 92 % | ❌ |

## Protocole de validation F5 (à constituer)

1. 300 copies authentiques anonymisées — 3 exercices × 2 sujets, tous
   niveaux de réussite, variantes de formulation.
2. Double correction à l'aveugle par deux enseignants ; référence = moyenne ;
   arbitrage de ≥ 20 % des copies et de tout désaccord > 2 pts.
3. Séparation calibration / test par élève ET par sujet : aucune copie ayant
   servi à ajuster les règles ne réapparaît dans le test final.
4. Publication de MAE, biais, κ, par exercice et par tranche à chaque version
   (ce script, `--out`).

Attributions ambiguës S1/S2 (< 1 pt) à trancher à la main : 0
