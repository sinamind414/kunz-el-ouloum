# Protocole de preuve — Trainer المفتاح (V1)

> **Objet :** savoir si le mur حلّل produit l'effet annoncé (le geste transféré à la copie),
> pas seulement si les élèves savent jouer à un jeu de tri.
> **Référence :** audits 1-2 du 2026-09-12 (R7/C1) + rapport d'optimisation §3.8.
> **Statut :** protocole à exécuter AVANT tout élargissement (séries B/C, VerbTrainer, fading).

---

## 1. Ce qu'on veut prouver (et réfuter)

**Hypothèse H1 :** l'entraînement par classification + production contrainte réduit le marqueur
causal déplacé dans les blocs تحليل des copies réelles.

**Hypothèse nulle H0 :** l'appli ne fait pas mieux que la lecture de la carte seule.

**Décision actée :** si H1 n'est pas confirmée (indicateur principal, §4), le chantier
série B/C + couches 2-3 est RÉORIENTÉ vers la production pure — pas continué par inertie.

---

## 2. Population et groupes

| Groupe | n | Intervention |
|---|---|---|
| **A — Trainer** | 10-15 | 8 séances × 15 min sur 2 semaines (mur + production contrainte, onglet جدار حلّل) |
| **B — Contrôle négatif** | 10-15 | Lecture seule de la carte المفتاح v5.0 (onglet مفتاح المنهجية + BAC 2025), même durée totale |

- Élèves 3AS sciences expérimentales, randomisation par tirage au sort (classe entière, alternance).
- **Aucune PII collectée** : pseudonyme local (export code 8 caractères), copies papier identifiées par numéro d'ordre.

---

## 3. Mesures

### 3.1 Pré-test / post-test (papier, correction humaine)

| Moment | Format | Durée |
|---|---|---|
| **T0** (avant randomisation) | Leçon JAMAIS VUE (ex: géothermie si les séances portent sur Ado/Mtb). 1 consigne « حلّل » + 1 consigne « اقترح فرضية » sur un document inédit. | 10 min |
| **T1** (après 2 semaines) | Même format, sujet différent, même grille. | 10 min |
| **T2** (J+14 après T1) | 5 items du mur non vus (rétention). | 5 min |

### 3.2 Grille de correction — 4 critères, 0-1-2 points chacun (max 8)

| # | Critère | 0 | 1 | 2 |
|---|---|---|---|
| 1 | Pas de marqueur causal déplacé en تحليل | ≥ 2 marqueurs déplacés (لأن، يدل، راجع إلى، يفسَّر…) | 1 marqueur déplacé | 0 marqueur déplacé |
| 2 | Valeurs + unités présentes dans l'analyse | Aucune valeur | Valeurs sans unités | Valeurs + unités |
| 3 | Relation explicitée avant toute cause (كلما / بينما) | Absente | Partielle | Complète, AVANT le تفسير |
| 4 | الفرضية courte, جازمة, testable | Longue / vague / avec ربما | Courte mais non testable | Courte + testable + sans ربما |

Double correction d'un échantillon (2 correcteurs, inter-corrélation rapportée ; cible ≥ 0,7).

---

## 4. Indicateurs et seuils de décision

| Indicateur | Source | Cible |
|---|---|---|
| **Principal : % de copies avec ≥ 1 marqueur causal déplacé en تحليل** (T1, groupe A vs T0) | copies | **−50 % au moins** (audits : −50 à −60) |
| Principal bis : même % groupe A vs groupe B à T1 | copies | écart significatif en faveur de A — sinon l'appli ne sert à rien (contrôle négatif) |
| Gate tahlilA franchi en ≤ 2 tentatives | app (localStorage export) | ≥ 70 % du groupe A |
| Durée médiane de séance | app | 12-18 min |
| Rétention T2 sur items non vus | app | ≥ 7/8 équivalent (≥ 10/12) |
| Abandon inter-séances | app | < 25 % |

## 4bis. Qualité des items (après pilote)

Retirer du pool tout item avec : `p > 0,95` (inutile), `p < 0,35` (ambigu) ou `rpb < 0,2`
(non discriminant). Les stats vivent dans `Item.stats` (modèle v2 du rapport d'optimisation §3.6).

---

## 5. Déroulé opérationnel

1. **S0** : recrutement classe(s), consentement enseignant, randomisation.
2. **T0** : pré-test papier (les deux groupes).
3. **2 semaines** : groupe A sur le mur (8 × 15 min, maison ou classe) ; groupe B lit la carte.
4. **T1** : post-test papier (les deux groupes) + export JSON du groupe A (code élève).
5. **T2 (+14 j)** : 5 items non vus (groupe A).
6. **Analyse** : % T0→T1 par groupe, test de comparaison (Fisher exact, n petit), grille inter-correcteurs.

## 6. Livrables du pilote

- [ ] Tableau T0/T1/T2 (2 groupes × 4 critères + score /8)
- [ ] Stats d'items p / rpb → corrections du pool
- [ ] Décision GO/NO-GO séries B-C + couches 2-3 (écrite, datée)
- [ ] Recalibrage éventuel `WALL_GATE_CONFIG` (seuils justifiés par les données, plus « à vue »)

---

## 7. Garde-fous

- Le gate interne (mur franchi) n'est JAMAIS utilisé comme preuve d'effet — seulement comme mesure d'exposition.
- Si le groupe B (carte seule) égale le groupe A : l'appli est réorientée, la carte reste.
- Aucun item du pool n'entre en séance sans véracité biologique validée (champ `reviewedBy` — enseignant SVT).
