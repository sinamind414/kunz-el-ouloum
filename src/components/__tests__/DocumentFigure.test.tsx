// DocumentFigure.test.tsx — verrous du rendu des documents d'analyse.
//
// Contexte : `documentAssets.ts` décrivait les documents (tableaux du livre
// officiel, courbes, schémas) mais AUCUN composant ne les rendait — `getDocumentAsset`
// n'était appelé que par des tests. Une consigne « حلل شكل الهالتين » était donc
// posée sans figure.
//
// Verrous ici :
//   1. chaque famille de document s'affiche réellement (tableau / courbe / image) ;
//   2. le CÂBLAGE ouchterlony → schéma_67 est effectif (trou 3 du BILAN) ;
//   3. un document sans image donne un message explicite, JAMAIS un blanc ;
//   4. ce message ne contient aucune lettre latine (contrainte documentée) ;
//   5. la courbe n'affiche AUCUNE graduation chiffrée inventée — échelles
//      qualitatives uniquement (AGENTS.md §5).

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import DocumentFigure, { DOC_NON_DISPONIBLE_AR } from '../DocumentFigure';
import { getDocumentAsset } from '../../data/documentAssets';

afterEach(cleanup);

describe('DocumentFigure — tableau', () => {
  it('affiche colonnes, lignes et légende du tableau source', () => {
    render(<DocumentFigure assetKey="curare_table" />);
    expect(screen.getByTestId('doc-tableau')).toBeTruthy();
    const table = screen.getByRole('table');
    expect(table).toBeTruthy();
    expect(table.textContent).toContain('تركيز الكورار');
    expect(table.textContent).toContain('انقباض عادي');
    // La légende vit dans <figcaption>, donc à côté du <table> : on lit la figure.
    expect(screen.getByTestId('doc-tableau').textContent).toContain(
      'تمثيل نوعي لنتائج تأثير تركيز الكورار',
    );
  });
});

describe('DocumentFigure — courbe', () => {
  it('dessine la courbe avec son aria-label et ses axes qualitatifs', () => {
    render(<DocumentFigure assetKey="michaelis" />);
    expect(screen.getByTestId('doc-courbe')).toBeTruthy();
    const asset = getDocumentAsset('michaelis');
    expect(asset && asset.kind === 'curve').toBe(true);
    if (!asset || asset.kind !== 'curve') return;

    const svg = screen.getByRole('img');
    expect(svg.getAttribute('aria-label')).toBe(asset.altAr);
    // Extrémités d'échelle qualitatives, jamais de graduation chiffrée.
    expect(svg.textContent).toContain(asset.xScaleAr[0]);
    expect(svg.textContent).toContain(asset.yScaleAr[1]);
    expect(svg.textContent).toContain(asset.xAxisAr);
    expect(svg.textContent).toContain(asset.yAxisAr);
    // Tous les points du tracé sont présents.
    expect(svg.querySelectorAll('circle')).toHaveLength(asset.points.length);
    expect(svg.querySelector('polyline')?.getAttribute('points')?.split(' ')).toHaveLength(
      asset.points.length,
    );
  });

  it('ne fabrique aucune graduation numérique sur les axes', () => {
    render(<DocumentFigure assetKey="photosynth" />);
    const labels = Array.from(screen.getByRole('img').querySelectorAll('text')).map(
      (t) => t.textContent ?? '',
    );
    // Les seules valeurs admises viennent des données : échelles et titres d'axes.
    for (const l of labels) {
      expect(/^\d+$/.test(l), `graduation inventée: ${l}`).toBe(false);
    }
  });
});

describe('DocumentFigure — câblage ouchterlony (trou 3)', () => {
  it('pointe l exercice sur l image réelle déjà présente dans le dépôt', () => {
    render(<DocumentFigure assetKey="ouchterlony" />);
    expect(screen.getByTestId('doc-image')).toBeTruthy();
    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toBe(
      '/assets/images/schemas/domaine1_proteines/schema_67_immunodiffusion_precipitin_lines_modern.svg',
    );
    expect(img.getAttribute('alt')).toBe('وثيقة أقواس ترسيب بين حفر أضداد ومستضدات.');
  });

  it('pointe l exercice HLA sur l image de sa situation jumeau', () => {
    render(<DocumentFigure assetKey="membrane_hla" />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toContain('schema_58_hla_I_II_structure_modern.svg');
  });
});

describe('DocumentFigure — document sans image', () => {
  it('affiche un message explicite plutôt qu un vide trompeur', () => {
    // electro_hb : aucun document HbA/HbS dans le corpus (schema_66 porte sur
    // les γ-globulines) → on ne le câble pas plutôt que de montrer la mauvaise figure.
    render(<DocumentFigure assetKey="electro_hb" />);
    expect(screen.getByTestId('doc-indisponible')).toBeTruthy();
    expect(screen.getByTestId('doc-indisponible').textContent).toBe(DOC_NON_DISPONIBLE_AR);
    expect(screen.queryByTestId('doc-figure')).toBeNull();
  });

  it('le message d indisponibilité ne contient aucune lettre latine', () => {
    expect(/[A-Za-z]/.test(DOC_NON_DISPONIBLE_AR)).toBe(false);
    expect(DOC_NON_DISPONIBLE_AR.length).toBeGreaterThan(0);
  });

  it('un assetKey inconnu n écrase pas le rendu', () => {
    render(<DocumentFigure assetKey="cle_inexistante" />);
    expect(screen.getByTestId('doc-indisponible')).toBeTruthy();
  });
});

describe('DocumentFigure — document double (mixed)', () => {
  it('empile les deux documents de la paire', () => {
    render(<DocumentFigure assetKey="sarin_gb" />);
    expect(screen.getByTestId('doc-mixte')).toBeTruthy();
    // Le sarin = une courbe + un tableau.
    expect(screen.getByTestId('doc-courbe')).toBeTruthy();
    expect(screen.getByTestId('doc-tableau')).toBeTruthy();
  });
});
