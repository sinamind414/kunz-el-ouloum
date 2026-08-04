# Unit 1 — Modern Visual Assets Manifest

> Nom historique conservé : ce document suit maintenant aussi les phases d’intégration en immunologie.
>
> Pour l’état exact du dépôt (`asset → leçon → bloc/document → comptage`), voir `docs/modern-visual-inventory.md`.

Ce manifeste associe chaque visuel moderne à sa leçon ou à son bloc cible dans Kunz.
Il sert de source de vérité pour remplacer les visuels temporaires par les images finales du professeur.

## Naming convention

Use:

`public/assets/images/schemas/domaine1_proteines/schema_<nn>_<theme>_modern.<ext>`

Recommended extensions:
- `.jpg` for flattened photo/composite visuals
- `.png` for dense text graphics
- `.svg` for redraws / current placeholder-compatible versions

## Cibles actives actuellement câblées dans l’app

| Fichier asset | Leçon | Rôle du bloc | Statut actuel |
|---|---|---|---|
| `schema_09_intro_prion.svg` | `d1-u1-l1-expression-genique` | mission ouverture domaine | câblé, remplaçable plus tard par l’image prof |
| `schema_10_intro_spider.svg` | `d1-u1-l1-expression-genique` | mission ouverture unité | câblé, remplaçable plus tard par l’image prof |
| `schema_11_gene_proteins.svg` | `d1-u1-l1-expression-genique` | document gène ↔ protéines | câblé |
| `schema_12_protein_site_photo.svg` | `d1-u1-l1-expression-genique` | preuve document réel | câblé |
| `schema_13_protein_site_interpret.svg` | `d1-u1-l1-expression-genique` | schéma interprétatif | câblé |
| `schema_14_arn_groups.svg` | `d1-u1-l1-expression-genique` | expérience groupes ARN | câblé |
| `schema_15_uracile_tracking.svg` | `d1-u1-l1-expression-genique` | validation noyau → cytoplasme | câblé |
| `schema_09b_spongiform_histology_modern_ar.svg` | `d1-u1-l1-expression-genique` | support mission prion / histologie spongiforme | câblé |
| `schema_10b_cell_animal_reference_modern_ar.svg` | `d1-u1-l1-expression-genique` | support mission cellule animale / noyau → cytoplasme | câblé |
| `schema_17_transcription_bubble_modern.svg` | `d1-u1-l2-transcription` | document transcription détaillée | câblé |
| `schema_18_amanitine_curve_modern.svg` | `d1-u1-l2-transcription` | preuve par inhibition α-amanitine | câblé |
| `schema_20_splicing_exons_introns_modern.svg` | `d1-u1-l2-transcription` | schéma maturation ARNm | câblé |
| `schema_19_splicing_micrograph_modern.svg` | `d1-u1-l2-transcription` | micrographie + interprétation de l’épissage | câblé |
| `schema_16b_rna_nucleotide_assembly_modern_ar.svg` | `d1-u1-l2-transcription` | support comparaison ADN/ARN : nucléotide ARN | câblé |
| `schema_16c_arn_structure_modern_ar.svg` | `d1-u1-l2-transcription` | support comparaison ADN/ARN : structure ARN | câblé |
| `schema_16d_rna_components_modern_ar.svg` | `d1-u1-l2-transcription` | support comparaison ADN/ARN : panneau composants / fonction | câblé |
| `schema_21_multiple_transcription_modern_ar.svg` | `d1-u1-l2-transcription` | support séquence : intuition transcriptions multiples | câblé |
| `schema_22_nirenberg_decode_modern.svg` | `d1-u1-l3-traduction` | décodage expérimental du code | câblé |
| `schema_23_genetic_code_table_modern.svg` | `d1-u1-l3-traduction` | table du code génétique | câblé |
| `schema_03_traduction.svg` | `d1-u1-l3-traduction` | codon / anticodon / ARNt | câblé |
| `schema_24_secretory_pathway_pancreas_modern_ar.svg` | `d1-u1-l3-traduction` | support destination protéique : exemple pancréas sécréteur | câblé |
| `schema_31_translation_stages_modern_ar.svg` | `d1-u1-l3-traduction` | support mécanisme global de traduction | câblé |
| `schema_32_filter_binding_experiment_modern_ar.svg` | `d1-u1-l3-traduction` + `codon_anticodon` | support expérimental : spécificité codon / ARNt | câblé |
| `schema_33_secretory_tracking_cells_modern_ar.svg` | `d1-u1-l3-traduction` | support suivi cellulaire du trafic protéique | câblé |
| `schema_34_secretory_tracking_graph_modern_ar.svg` | `d1-u1-l3-traduction` | support visuel quantitatif du trafic protéique | câblé |
| `schema_35_unit1_big_picture_modern_ar.svg` | `primary_secondary_response` | support synthèse fin unité 1 | câblé |
| `schema_30_ligand_gated_channel_modern_ar.svg` | `synapse` + `synapse_integration` | support canal ligand-dépendant post-synaptique | câblé |

## État final après les vagues 2–4

Les remplacements à forte valeur ont été finalisés pour les visuels textuels les plus visibles de l’unité 1, de la synapse, de l’immunité membranaire et des supports Anagène.

### Visuels arabisés ajoutés durant les vagues 2–4

- `schema_09b_spongiform_histology_modern_ar.svg`
- `schema_10b_cell_animal_reference_modern_ar.svg`
- `schema_16b_rna_nucleotide_assembly_modern_ar.svg`
- `schema_16c_arn_structure_modern_ar.svg`
- `schema_16d_rna_components_modern_ar.svg`
- `schema_21_multiple_transcription_modern_ar.svg`
- `schema_24_secretory_pathway_pancreas_modern_ar.svg`
- `schema_28_anagene_mutation_compare_modern_ar.svg`
- `schema_29_anagene_multiple_alignment_modern_ar.svg`
- `schema_30_ligand_gated_channel_modern_ar.svg`
- `schema_31_translation_stages_modern_ar.svg`
- `schema_32_filter_binding_experiment_modern_ar.svg`
- `schema_33_secretory_tracking_cells_modern_ar.svg`
- `schema_34_secretory_tracking_graph_modern_ar.svg`
- `schema_35_unit1_big_picture_modern_ar.svg`
- `schema_55_membrane_proteins_em_modern_ar.svg`
- `schema_56_fluid_mosaic_model_modern_ar.svg`
- `schema_57_membrane_fluidity_fusion_modern_ar.svg`

### Lecture finale

- Les écrans auparavant les plus “placeholder” ont été remplacés par des versions plus lisibles en arabe.
- Les anciens fichiers JPG / variantes anglaises sont conservés dans le dossier comme historiques, mais ne sont plus ceux câblés dans les leçons actives et documents vivants.
- Pour la vérité de câblage exacte (`asset → leçon → bloc/document → comptage`), se référer à `docs/modern-visual-inventory.md`.

## État de la file suivie

> Après la phase 4, aucune priorité éditoriale critique restante n’est suivie dans cette file.

- aucune
