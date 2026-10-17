# État des livrables — les cinq leçons prioritaires

> Document de clôture d'étape (sprint 54). La demande initiale — « auditer
> l'application pour faire sortir les manques selon *Les 5 leçons à travailler
> en premier* » — prescrivait pour chaque leçon des livrables précis. Cinquante
> sprints plus tard, voici où en est chacun.
>
> Chaque ligne « ✅ » est **vérifiée par un test** :
> `src/data/livrablesPrioritaires.test.ts` échoue si la pièce disparaît du
> code. Ce document ne peut donc pas devenir faux en silence.

## 1. pHi et comportement des acides aminés — U2

| Livrable demandé | État | Où |
|---|---|---|
| Micro-fiches | ✅ 3 capsules U2 | `microCapsules.ts` (`cap_u2_formule_aa`, `cap_u2_anode_cathode`, `cap_u2_quatre_niveaux`) |
| Simulateur pH → charge → migration | ✅ parcours en 4 étapes | leçon active : `lire_ph` → `phi_deduire_charge` → `phi_analyse_migration` → `sens_migration` |
| Ancrage BAC | ✅ **exercice officiel 2018** | `bac2018_s1_e2` : pHi par acide aminé, forme ionique à trois pH, mutation → athérosclérose |

**Remarque de fond (sprint 37)** : cette leçon était classée n° 1 par la
difficulté ressentie, mais ne mène que **5,6 %** des points. Elle reste
prioritaire en tant que **compétence transversale** — 13 exercices du corpus
la mobilisent en second rôle.

## 2. Coopération immunitaire — U4

| Livrable demandé | État | Où |
|---|---|---|
| Schéma-bilan interactif | ✅ | `drill_cmh`, `drill_anticorps`, `drill_vih_cycle` (U4 = 4 schémas) |
| 3 exercices BAC | ✅ **largement dépassé** | 12 exercices U4 dans le corpus 2017-2026 |
| Parcours guidé | ✅ | `coop_analyse_milieux` → `coop_role_il2` → `coop_synthese_bac` |

U4 est confirmée **première unité de l'épreuve** : 82 points menés sur dix
sessions, présente sur 10 sessions sur 10.

## 3. Inhibiteurs enzymatiques — U3

| Livrable demandé | État | Où |
|---|---|---|
| Atelier 6 courbes | ✅ les six | `atelier_courbe1_substrat` … `atelier_courbe6_produit_temps` |
| Comparatif compétitif / non compétitif | ✅ | étape `inhib_identifier_type` + capsule `cap_u3_inhibition_type` |
| Renfort (sprint 53) | ✅ | 2 capsules : « tout ce qui touche l'enzyme n'est pas un inhibiteur » (SIRT1, 2026) et « exploiter une modélisation du site actif » |

U3 est la **clé cachée** : elle ne mène que 8 exercices mais en éclaire 15.

## 4. CMH, ABO-Rh et prérequis de 2AS — U4

| Livrable demandé | État | Où |
|---|---|---|
| Module prérequis 2AS (15 min) | ✅ | étapes `alleles` / `haplotype` + carte d'ouverture U4 |
| Distinction CMH / ABO | ✅ | capsule `cap_u4_cmh_vs_abo` + situation `greffe_rein` |
| Ancrage BAC | ✅ | ABO en 2018 et 2025 (transfusion, enzyme NAGA), CMH en 2019 et 2020 |

## 5. Phase photochimique — U6

| Livrable demandé | État | Où |
|---|---|---|
| Synthèse d'unité | ✅ | carte d'ouverture U6 + carte mentale U6 |
| 5 micro-fiches | ✅ **5** capsules U6 (sprint 55) | `cap_u6_calvin`, `cap_u6_oxygene_eau`, `cap_u6_jagendorf`, `cap_u6_pourquoi_obscurite_arrete`, `cap_u6_lire_les_indicateurs` |
| Schémas | ✅ 2 | `drill_chaine_photochimique` + `drill_bilan_photosynthese` (sprint 53) |

**Complété au sprint 55.** Les deux dernières micro-fiches traitent les deux
erreurs que les sujets sanctionnent : croire que l'obscurité « abîme » la
Rubisco (alors qu'ajouter ATP et un transporteur réduit relance la fixation
dans le noir), et confondre les indicateurs des deux phases (O₂, DCPIP et
fluorescence pour la phase photochimique ; CO₂, matière organique et Rubisco
pour la phase chimique).

Ordre de traitement assumé : les capsules des sprints 52-53 sont allées à U1,
U5 et U3 **avant** U6, parce que la pression mesurée les place devant
(19 %, 18,7 % et 14,7 % contre 12,9 % pour U6, qui ne tombe que sur 6 sessions
sur 10).

## Ce que l'audit a ajouté, au-delà de la commande

- **corpus BAC** : 59 exercices officiels, 10 sessions consécutives
  (2017-2026), avec sujet **et** corrigé liés ;
- **12 montages récurrents** et **12 familles de consignes**, avec pièges ;
- **atelier d'écriture** avec contrôle de forme, relecture, profil d'erreurs
  et rapport imprimable pour le professeur ;
- **sujets blancs composés** avec chronomètre et budget de temps par exercice ;
- **plan de révision** pondéré par la pression mesurée, expliqué à l'élève ;
- performance (**bundle d'entrée −77 %**), **hors ligne** réparé,
  **accessibilité** (clavier, focus, RTL) mise sous test.

## Ce qui reste ouvert

1. la session **2016** et antérieures, si l'on veut allonger le corpus ;
2. les deux cas clavier du splash, justifiés et documentés (fond de fenêtre
   modale, garde `stopPropagation`) ;
3. l'audit d'accessibilité **complet** (contraste, lecteur d'écran réel),
   dont ce qui est en place n'est qu'un plancher mécanique.
