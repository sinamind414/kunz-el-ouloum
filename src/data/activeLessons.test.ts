// activeLessons.test.ts
// Correction A — fin de leçon + orientation réelle (Speckit FINAL §3).
import { describe, it, expect } from 'vitest';
import { ACTIVE_LESSONS, getLessonProgression, LESSON_PROGRESSION } from '../data/activeLessons';

describe('LessonProgression (§3)', () => {
  it('lecon_transcription → d1-u1-l3-traduction', () => {
    const p = getLessonProgression('lecon_transcription');
    expect(p).toBeDefined();
    expect(p!.nextLessonId).toBe('d1-u1-l3-traduction');
    expect(p!.recommendedReflexId).toBe('explain');
    expect(p!.completionMessageAr).toContain('الاستنساخ');
  });

  it('d1-u3-l1-enzyme dernière sans suivante → pas de nextLessonId', () => {
    const p = getLessonProgression('d1-u3-l1-enzyme');
    expect(p!.nextLessonId).toBeUndefined();
    expect(p!.recommendedReflexId).toBe('hypothesize');
  });

  it('d1-u1-l2-transcription → d1-u1-l3-traduction', () => {
    const p = getLessonProgression('d1-u1-l2-transcription');
    expect(p!.nextLessonId).toBe('d1-u1-l3-traduction');
  });

  it('toutes les progressions ont un message de complétion', () => {
    for (const p of Object.values(LESSON_PROGRESSION)) {
      expect(p.completionMessageAr.length).toBeGreaterThan(0);
    }
  });

  it('enchaîne les trois leçons d immunité avec leur réflexe', () => {
    expect(getLessonProgression('immunity_self_nonself')).toMatchObject({
      nextLessonId: 'immunity_humoral_response',
      recommendedReflexId: 'interpret',
    });
    expect(getLessonProgression('immunity_humoral_response')).toMatchObject({
      nextLessonId: 'immunity_cellular_response',
      recommendedReflexId: 'explain',
    });
    expect(getLessonProgression('immunity_cellular_response')).toMatchObject({
      recommendedReflexId: 'explain',
    });
  });

  it('utilise le schéma sismique réellement disponible', () => {
    const lesson = ACTIVE_LESSONS.seismic_waves;
    expect(lesson.blocks[0]).toMatchObject({
      schemaSrc: '/assets/images/schemas/domaine3_tectonique/schema_14_ondes.svg',
    });
  });

  it('intègre les nouveaux visuels du lesson soi/non-soi', () => {
    const lesson = ACTIVE_LESSONS.immunity_self_nonself;
    expect(lesson.blocks[0]).toMatchObject({
      schemaSrc: '/assets/images/schemas/domaine1_proteines/schema_58_hla_I_II_structure_modern.svg',
      supportAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_59_blood_group_determination_modern.svg',
      supportSecondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_69_rh_factor_genotype_phenotype_modern.svg',
    });
    expect((lesson.blocks[0] as any).supportGallery?.map((item: any) => item.assetSrc)).toEqual([
      '/assets/images/schemas/domaine1_proteines/schema_55_membrane_proteins_em_modern_ar.svg',
      '/assets/images/schemas/domaine1_proteines/schema_56_fluid_mosaic_model_modern_ar.svg',
      '/assets/images/schemas/domaine1_proteines/schema_57_membrane_fluidity_fusion_modern_ar.svg',
    ]);
  });

  it('intègre les nouveaux visuels du lesson réponse humorale', () => {
    const lesson = ACTIVE_LESSONS.immunity_humoral_response;
    expect(lesson.blocks[0]).toMatchObject({
      schemaSrc: '/assets/images/schemas/domaine1_proteines/schema_63_antigen_antibody_complex_modern.svg',
      supportAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_65_antibody_structure_hl_modern.svg',
      supportSecondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_67_immunodiffusion_precipitin_lines_modern.svg',
    });
    expect(lesson.blocks[0]).toHaveProperty('supportGallery');
    expect((lesson.blocks[0] as any).supportGallery?.[0]?.assetSrc).toBe(
      '/assets/images/schemas/domaine1_proteines/schema_60_complement_membrane_attack_modern.svg'
    );
  });

  it('intègre les nouveaux visuels du lesson réponse cellulaire', () => {
    const lesson = ACTIVE_LESSONS.immunity_cellular_response;
    expect(lesson.blocks[0]).toMatchObject({
      schemaSrc: '/assets/images/schemas/domaine1_proteines/schema_70_tcr_cmh_target_modern.svg',
      supportAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_71_clonal_cd8_activation_modern.svg',
      supportSecondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_72_perforin_granzyme_lysis_modern.svg',
    });
    expect((lesson.blocks[0] as any).supportGallery?.[0]?.assetSrc).toBe(
      '/assets/images/schemas/domaine1_proteines/schema_74_immunological_synapse_specificity_modern.svg'
    );
  });

  it('intègre les nouveaux visuels du lesson mémoire immunitaire', () => {
    const lesson = ACTIVE_LESSONS.immunity_memory_response;
    expect(lesson.blocks[0]).toMatchObject({
      schemaSrc: '/assets/images/schemas/domaine1_proteines/schema_75_primary_secondary_response_curve_modern.svg',
      supportAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_76_memory_cell_fate_modern.svg',
      supportSecondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_77_vaccination_booster_timeline_modern.svg',
    });
    expect((lesson.blocks[0] as any).supportGallery?.[0]?.assetSrc).toBe(
      '/assets/images/schemas/domaine1_proteines/schema_78_memory_cell_reactivation_modern.svg'
    );
    expect((lesson.blocks[0] as any).supportGallery?.[1]?.assetSrc).toBe(
      '/assets/images/schemas/domaine1_proteines/schema_80_immunity_big_picture_modern.svg'
    );
  });

  it('intègre les vagues 2 et 3 sur transcription, traduction et synapse', () => {
    expect((ACTIVE_LESSONS['d1-u1-l2-transcription'].blocks[2] as any)).toMatchObject({
      secondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_21_multiple_transcription_modern_ar.svg',
    });
    expect((ACTIVE_LESSONS['d1-u1-l3-traduction'].blocks[2] as any)).toMatchObject({
      assetSrc: '/assets/images/schemas/domaine1_proteines/schema_31_translation_stages_modern_ar.svg',
      secondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_32_filter_binding_experiment_modern_ar.svg',
    });
    expect((ACTIVE_LESSONS['d1-u1-l3-traduction'].blocks[3] as any)).toMatchObject({
      doc: {
        secondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_33_secretory_tracking_cells_modern_ar.svg',
      },
    });
    expect((ACTIVE_LESSONS['d1-u1-l3-traduction'].blocks[6] as any)).toMatchObject({
      secondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_24_secretory_pathway_pancreas_modern_ar.svg',
    });
    expect(((ACTIVE_LESSONS['d1-u1-l3-traduction'].blocks[6] as any).supportGallery?.[0] ?? {})).toMatchObject({
      assetSrc: '/assets/images/schemas/domaine1_proteines/schema_34_secretory_tracking_graph_modern_ar.svg',
    });
    expect((ACTIVE_LESSONS.synapse.blocks[0] as any)).toMatchObject({
      supportAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_30_ligand_gated_channel_modern_ar.svg',
    });
  });

  it('intègre les nouveaux blocs et visuels du lesson protein_structure_function', () => {
    const lesson = ACTIVE_LESSONS.protein_structure_function;
    expect(lesson.blocks).toHaveLength(6);
    expect(lesson.blocks[0]).toMatchObject({
      type: 'MISSION_CHOICE',
      imageSrc: '/assets/images/schemas/domaine1_proteines/schema_40_hemoglobin_structure_function_modern.svg',
    });
    expect(lesson.blocks[1]).toMatchObject({
      type: 'GUIDED_DOC_QA',
      doc: {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_41_alanine_representations_modern.svg',
        secondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_46_folding_pathway_modern.svg',
      },
    });
    expect(lesson.blocks[2]).toMatchObject({
      type: 'COMPARISON_TABLE',
      assetSrc: '/assets/images/schemas/domaine1_proteines/schema_42_secondary_alpha_beta_modern.svg',
    });
    expect(lesson.blocks[3]).toMatchObject({
      type: 'GUIDED_DOC_QA',
      doc: {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_43_secondary_stabilization_modern.svg',
        secondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_06_structure_proteines.svg',
      },
    });
    expect(lesson.blocks[4]).toMatchObject({
      type: 'SEQUENCE_ORDER',
      assetSrc: '/assets/images/schemas/domaine1_proteines/schema_45_four_levels_structure_modern.svg',
      secondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_44_quaternary_hemoglobin_tim_modern.svg',
    });
    expect(lesson.blocks[5]).toMatchObject({
      type: 'GUIDED_DOC_QA',
      doc: {
        assetSrc: '/assets/images/schemas/domaine1_proteines/schema_40_hemoglobin_structure_function_modern.svg',
        secondaryAssetSrc: '/assets/images/schemas/domaine1_proteines/schema_44_quaternary_hemoglobin_tim_modern.svg',
      },
    });
  });
});
