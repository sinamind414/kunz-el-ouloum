import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DocumentAssetRenderer from './DocumentAssetRenderer';
import DocumentAnalysisView, { ExerciseScreen } from './DocumentAnalysisView';
import { DOCUMENT_ASSETS } from '../data/documentAssets';
import { DOCUMENT_ANALYSIS_EXERCISES } from '../data/documentAnalysisExercises';
import { validateAnswer } from '../lib/validation/ValidationEngine';

afterEach(cleanup);

describe('DocumentAssetRenderer', () => {
  it('affiche réellement le tableau du curare', () => {
    render(<DocumentAssetRenderer assetKey="curare_table" />);

    expect(screen.getByRole('table')).toBeDefined();
    expect(screen.getByRole('columnheader', { name: 'تركيز الكورار' })).toBeDefined();
    expect(screen.getAllByText('انقباض عادي').length).toBeGreaterThan(0);
    expect(screen.getAllByText('الاستجابة العضلية').length).toBeGreaterThan(0);
    expect(screen.getAllByText('انقباض ضعيف جداً أو غائب').length).toBeGreaterThan(0);
  });

  it('affiche réellement la courbe de Michaelis', () => {
    render(<DocumentAssetRenderer assetKey="michaelis" />);

    expect(screen.getByRole('img', { name: /منحنى نوعي يصعد/ })).toBeDefined();
    expect(screen.getByText(/ميكاييلس-منتان/, { selector: 'figcaption' })).toBeDefined();
  });

  it('affiche le schéma synaptique avec son texte alternatif arabe', () => {
    render(<DocumentAssetRenderer assetKey="ach_jnm" />);

    const image = screen.getByRole('img', { name: /مخطط للمشبك العصبي العضلي/ });
    expect(image.getAttribute('src')).toBe('/assets/images/schemas/domaine1_proteines/schema_08_synapse.svg');
  });

  it('affiche l indisponibilité pour une clé inconnue', () => {
    render(<DocumentAssetRenderer assetKey="asset_inconnu" />);

    expect(screen.getByText('هذه الوثيقة غير جاهزة بعد.')).toBeDefined();
    expect(screen.getByText('لا يمكن تحليلها دون عرض الجدول أو المنحنى.')).toBeDefined();
  });

  it('bloque question, réponse et correction quand la clé est inconnue', () => {
    const base = DOCUMENT_ANALYSIS_EXERCISES[0];
    render(
      <ExerciseScreen
        exercise={{ ...base, doc: { ...base.doc, assetKey: 'asset_inconnu' } }}
        qIndex={0}
        setQIndex={vi.fn()}
        onBackToList={vi.fn()}
      />,
    );

    expect(screen.getByText('هذه الوثيقة غير جاهزة بعد.')).toBeDefined();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('button', { name: 'صحّح إجابتي' })).toBeNull();
  });

  it('bloque aussi un exercice explicitement indisponible dans la vue réelle', async () => {
    const user = userEvent.setup();
    render(<DocumentAnalysisView onBack={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /مقارنة بين كمون ما بعد التشابك/ }));

    expect(screen.getByText('هذه الوثيقة غير جاهزة بعد.')).toBeDefined();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('button', { name: 'صحّح إجابتي' })).toBeNull();
  });

  it('déclare chaque assetKey comme rendu ou explicitement indisponible', () => {
    for (const exercise of DOCUMENT_ANALYSIS_EXERCISES) {
      expect(Object.hasOwn(DOCUMENT_ASSETS, exercise.doc.assetKey), exercise.doc.assetKey).toBe(true);
      expect(['ready', 'unavailable']).toContain(DOCUMENT_ASSETS[exercise.doc.assetKey].status);
    }
  });

  it('contient toutes les clés des exercices dans DOCUMENT_ASSETS', () => {
    const exerciseKeys = new Set(DOCUMENT_ANALYSIS_EXERCISES.map((exercise) => exercise.doc.assetKey));

    expect([...exerciseKeys].every((assetKey) => assetKey in DOCUMENT_ASSETS)).toBe(true);
  });

  it.each(['nmj_ppm_courbe', 'curare_table', 'sarin_gb_double', 'michaelis_courbe', 'rifamycine_h1h2'])(
    'valide l analyse qualitative de %s sans valeur ni unité inventée',
    (exerciseId) => {
      const exercise = DOCUMENT_ANALYSIS_EXERCISES.find((item) => item.id === exerciseId)!;
      const analysis = exercise.questions.find((question) => question.ctx.actionVerb === 'analyse')!;
      const result = validateAnswer('كلما ارتفع المتغير كلما انخفضت الاستجابة حسب الشروط', analysis.ctx);

      expect(analysis.ctx.docType).toBe('qualitative');
      expect(analysis.ctx.qualitativeTrend).toBe(true);
      expect(result.errors.some((error) => error.code === 'MISSING_VALUE_UNIT')).toBe(false);
      expect(result.errors.some((error) => error.code === 'FORBIDDEN_KULLAMA')).toBe(false);
    },
  );
});
