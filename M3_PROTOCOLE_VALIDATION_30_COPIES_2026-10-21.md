# M3 — Protocole de validation correcteur sur 30 copies indépendantes

> Audit 8 axes (20/10/2026), ligne M3. Statut : **à exécuter par un humain** —
> ce document rend l'exécution mécanique. Rien dans ce protocole ne touche aux
> formules de note (règle P2/R6 : voir §5).

## 1. Ce qui existe déjà (ne pas reconstruire)

| Pièce | Rôle |
|---|---|
| `src/supervision/evaluerCopies.ts` | moteur de comparaison : Pearson, MAE, biais signé, κ pondéré quadratique, MAE/barème par exercice, tranches de note |
| `scripts/evaluer-copies.ts` | CLI : lit `eleve_*.txt` + `RECAPITULATIF.txt`, corrige avec `noterCopieCalibree`, compare au prof, écrit le rapport MD (commit + date incrustés) |
| Cibles F5 (déjà codées) | MAE ≤ 1,0 pt · \|biais\| ≤ 0,3 pt · κ ≥ 0,80 · MAE/barème ≤ 8 % par exercice |
| `MEFTA_BAC_EXERCICES` | plafond modèle (auto + réserve manuelle) imprimé dans le rapport |

## 2. Échantillon — 30 copies INDIFFÉRENTES du corpus de calibration

- **30 copies authentiques** d'élèves (bac blanc, devoir, 2025) : répartition
  ~15/15 entre le sujet 1 et le sujet 2 officiels 2025, couvrant les 3
  exercices et **tous les niveaux de réussite** (objectif : au moins 5 copies
  < 5/20, 15 entre 5 et 12, 10 > 12/20 — la distribution compte autant que n).
- **EXCLU** : toute copie du corpus de calibration (les 40 `eleve_*.txt`
  racine + `RECAPITULATIF.txt`). Elles ont servi à calibrer les registres —
  les réutiliser invaliderait la mesure (provenance F5).
- **EXCLU aussi** : les sujets blancs originaux de l'app. Le repère prof d'un
  sujet blanc EST notre registre — correction circulaire, zéro valeur probante.
- règles de provenance : copies rendues réellement, pas rédigées ad hoc ; si
  une copie ne connaît qu'un exercice, elle entre en mode groupe (S1-Ex2 etc.)
  — le moteur le gère déjà.

## 3. Collecte et anonymisation

1. Avec l'autorisation des enseignants ; supprimer tout nom, lycée, date
   identifiable AVANT la remise au lot.
2. Format par copie (identique au corpus existant) :

```
=== eleve_101 ===
<texte de l'exercice 1>
<texte de l'exercice 2>
<texte de l'exercice 3>
SCORE: 11.5/20    ← note du prof (dans le bloc ou RECAPITULATIF.txt)
```

3. Disposition : dossier `copies_validation_m3/` (un `eleve_XXX.txt` par
   copie + `RECAPITULATIF.txt` global optionnel mais RECOMMANDÉ — il alimente
   la comparaison prof). Numérotation à partir de 101 pour éviter toute
   collision avec le corpus racine.

## 4. Double correction à l'aveugle (le correcteur humain)

- **Deux enseignants**, séparément, sans voir la note machine.
- Référence = **moyenne des deux** ; arbitrage obligatoire pour tout
  désaccord **> 2 pts** (et au moins 20 % des copies) par un troisième avis.
- Le prof corrige depuis le corrigé officiel (Meftah / repères ONEC), pas
  depuis les registres de l'app.

## 5. Exécution (une fois le lot constitué)

```
npm i
npx tsx scripts/evaluer-copies.ts --dir copies_validation_m3 --out docs/M3_SUPERVISION.md
```

Le rapport incruste commit + date + l'avertissement de provenance. La
publication M3 = ce fichier.

## 6. Critères d'acceptation M3 (cibles F5, sans formule modifiée)

| métrique | cible |
|---|---|
| MAE (moyenne des \|écarts\|, sur /20) | ≤ 2,0 pt **intermédiaire** (30 copies) ; ≤ 1,0 à l'échelle 300 |
| \|biais signé\| moteur − prof | ≤ 0,5 pt intermédiaire (≤ 0,3 à 300) |
| κ pondéré quadratique | ≥ 0,70 intermédiaire (≥ 0,80 à 300) |
| MAE/barème par exercice | ≤ 12 % intermédiaire (≤ 8 % à 300) |

Les valeurs à 30 copies sont des **planchers d'arrêt** : si une cible
intermédiaire saute AND la couverture n'explique pas l'écart, STOP — on
n'ajuste RIEN automatiquement (§7).

## 7. Interdits absolus (P2, R6 — lis avant de lire les résultats)

1. Les résultats de M3 sont un **DIAGNOSTIC**. Ils ne recalibrent RIEN : pas
   de poids, pas de plafond affairé, pas de requalification d'items.
2. Si le moteur est « loin », les leviers légaux sont de CONTENU, par
   **ajout** (nouveaux registres H2, approche enseignant) — jamais un ajustage
   des formules ou une sur-acceptation de similarité sémantique (règle 3).
3. Un item où la reconnaissance exige une interprétation humaine reste MANUEL
   (`formes: []`) — même si cela creuse le MAE.
4. LA suite à 300 copies (F5) suit le même protocole à plus grande échelle.
