// P0-2 — verrous du renderer documentAssets (DocumentAssetView + surface live).
//  · chaque kind prêt a un rendu (table/curve/schema/mixed) ;
//  · la surface d'analyse n'affiche que les assets ready et masque les autres ;
//  · verdict d'affichage = moteur + garde-fou de preuve (contrat CounterProof).
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import DocumentAssetView from './DocumentAssetView';
import {
  DOCUMENT_ASSETS,
  getDocumentAsset,
  isDocumentAssetAvailable,
  type DocumentAsset,
} from '../data/documentAssets';
import { DOCUMENT_ANALYSIS_EXERCISES } from '../data/documentAnalysisExercises';
import DocumentAnalysisView from './DocumentAnalysisView';

function collectKinds(asset: DocumentAsset, into = new Set<string>()): Set<string> {
  into.add(asset.kind);
  if (asset.kind === 'mixed') asset.assets.forEach((a) => collectKinds(a, into));
  return into;
}

describe('DocumentAssetView — rendu de chaque kind ready', () => {
  const readyEntries = Object.entries(DOCUMENT_ASSETS).filter(([, e]) => e.status === 'ready');

  it('couvre au moins table, curve, schema et mixed dans le catalogue ready', () => {
    const kinds = new Set<string>();
    readyEntries.forEach(([, e]) => {
      if (e.status === 'ready') collectKinds(e.asset, kinds);
    });
    expect(kinds.has('table')).toBe(true);
    expect(kinds.has('curve')).toBe(true);
    expect(kinds.has('schema')).toBe(true);
    expect(kinds.has('mixed')).toBe(true);
  });

  it.each(readyEntries.filter(([, e]) => e.status === 'ready'))(
    'dessine l’asset %s sans crash',
    (key, entry) => {
      if (entry.status !== 'ready') return;
      const { container, unmount } = render(<DocumentAssetView asset={entry.asset} />);
      expect(container.querySelector('[data-doc-kind]')).toBeTruthy();
      if (entry.asset.kind === 'curve') {
        expect(container.querySelector('svg[role="img"]')).toBeTruthy();
      }
      if (entry.asset.kind === 'table') {
        expect(screen.getAllByRole('table').length).toBeGreaterThan(0);
      }
      if (entry.asset.kind === 'schema' || entry.asset.kind === 'micrograph') {
        expect(container.querySelector('img')).toBeTruthy();
      }
      if (entry.asset.kind === 'mixed') {
        expect(container.querySelector('[data-doc-kind="mixed"]')).toBeTruthy();
      }
      unmount();
      void key;
    },
  );

  it('getDocumentAsset renvoie null pour une clé unavailable', () => {
    const unavailable = Object.entries(DOCUMENT_ASSETS).find(([, e]) => e.status === 'unavailable');
    expect(unavailable).toBeTruthy();
    if (unavailable) {
      expect(getDocumentAsset(unavailable[0])).toBeNull();
      expect(isDocumentAssetAvailable(unavailable[0])).toBe(false);
    }
  });
});

describe('DocumentAnalysisView — surface live P0-2', () => {
  it('n’affiche que les exercices dont l’asset est ready (13) et masque les autres', () => {
    const readyIds = DOCUMENT_ANALYSIS_EXERCISES.filter((e) =>
      isDocumentAssetAvailable(e.doc.assetKey),
    ).map((e) => e.id);
    expect(readyIds).toHaveLength(13);

    render(<DocumentAnalysisView />);
    // nav listée : chaque ready id apparaît
    for (const id of readyIds) {
      expect(screen.getAllByText(id.replace(/_/g, ' ')).length).toBeGreaterThan(0);
    }
    const unavailableIds = DOCUMENT_ANALYSIS_EXERCISES.filter(
      (e) => !isDocumentAssetAvailable(e.doc.assetKey),
    ).map((e) => e.id);
    for (const id of unavailableIds) {
      expect(screen.queryByText(id.replace(/_/g, ' '))).toBeNull();
    }
    // message de masquage honnête
    expect(screen.getByText(/6 وثائق غير جاهزة/)).toBeTruthy();
  });

  it('affiche le document structuré de l’exercice sélectionné par défaut', () => {
    render(<DocumentAnalysisView />);
    expect(document.querySelector('.document-asset-view')).toBeTruthy();
    // étiquette anti-confusion française sourceée (label officielle)
    expect(screen.getAllByText(/n'est pas le barème officiel/).length).toBeGreaterThan(0);
  });

  it('bouton de correction désactivé tant que la réponse est vide', () => {
    render(<DocumentAnalysisView />);
    const buttons = screen.getAllByText('صحّح إجابتي');
    expect(buttons.length).toBeGreaterThan(0);
    for (const b of buttons) {
      expect((b as HTMLButtonElement).disabled).toBe(true);
    }
  });

  it('verdict refusé pour une réponse hors-sujet (garde-fou de contenu)', async () => {
    const { container } = render(<DocumentAnalysisView />);
    const ta = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(ta).toBeTruthy();
    // réponse creuse bien formée mais sans preuve documentaire
    ta.focus();
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value',
    )!.set!;
    setter.call(ta, 'الموضوع مهم جداً وندرس الوحدات بجد أكبر فائدة للفصل');
    ta.dispatchEvent(new Event('input', { bubbles: true }));

    const btn = screen.getAllByText('صحّح إجابتي').find(
      (b) => !(b as HTMLButtonElement).disabled,
    ) as HTMLButtonElement | undefined;
    expect(btn).toBeTruthy();
    btn!.click();
    expect(await screen.findByText(/مرفوض — أعد الصياغة/)).toBeTruthy();
  });
});
