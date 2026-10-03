// DocumentFigure.tsx — AFFICHAGE du document d'un exercice d'analyse.
//
// Pourquoi ce fichier existe
// --------------------------
// `documentAssets.ts` décrivait depuis longtemps les documents (tableaux du
// livre officiel avec pages citées, courbes avec points, schémas SVG) mais
// AUCUN composant ne les rendait : `getDocumentAsset` n'était appelé que par
// deux tests. Une consigne du type « حلل شكل الهالتين » était donc posée sans
// que l'élève voie la figure.
//
// ZÉRO CONTENU INVENTÉ (AGENTS.md §5) :
//   - colonnes, lignes, points, échelles, légendes et alt viennent des données ;
//   - les échelles des courbes restent QUALITATIVES (« منخفض »/« Vmax ») car le
//     programme n'en fixe aucune valeur chiffrée — inventer des graduations
//     serait une donnée non sourcée ;
//   - le message d'indisponibilité est celui déjà documenté dans
//     `documentAnalysis.integrity.test.ts` (« هذه الوثيقة غير جاهزة بعد. »).

import { getDocumentAsset, type DocumentAsset } from '../data/documentAssets';

export const DOC_NON_DISPONIBLE_AR = 'هذه الوثيقة غير جاهزة بعد.';

/** Zone de tracé (viewBox) de la courbe. Marges = place des libellés d'axes. */
const VB = { w: 420, h: 300, l: 78, r: 18, t: 44, b: 64 };
const PLOT_W = VB.w - VB.l - VB.r; // 324
const PLOT_H = VB.h - VB.t - VB.b; // 192

type AssetCourbe = Extract<DocumentAsset, { kind: 'curve' }>;
type AssetTableau = Extract<DocumentAsset, { kind: 'table' }>;
type AssetImage = Extract<DocumentAsset, { kind: 'schema' }> | Extract<DocumentAsset, { kind: 'micrograph' }>;

/** Normalise 0..100 (données) → coordonnées SVG. */
const px = (x: number): number => VB.l + (x / 100) * PLOT_W;
const py = (y: number): number => VB.t + PLOT_H - (y / 100) * PLOT_H;

function Courbe({ asset }: { asset: AssetCourbe }) {
  const trace = asset.points.map((p) => `${px(p.x).toFixed(1)},${py(p.y).toFixed(1)}`).join(' ');
  return (
    <figure className="m-0" data-testid="doc-courbe">
      <svg
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        role="img"
        aria-label={asset.altAr}
        className="block w-full h-auto text-[#006d37] dark:text-[#2ecc71]"
      >
        <title>{asset.altAr}</title>
        {/* Axes : pas de graduations chiffrées, libellés d'extrémités seulement. */}
        <g stroke="#94a3b8" strokeWidth="1.5" fill="none">
          <line x1={VB.l} y1={VB.t + PLOT_H} x2={VB.l + PLOT_W} y2={VB.t + PLOT_H} />
          <line x1={VB.l} y1={VB.t} x2={VB.l} y2={VB.t + PLOT_H} />
        </g>
        {/* Courbe + points */}
        <polyline points={trace} fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
        {asset.points.map((p, i) => (
          <circle key={i} cx={px(p.x)} cy={py(p.y)} r="4.5" fill="currentColor" />
        ))}
        {/* Échelles qualitatives d'extrémité */}
        <text x={VB.l} y={VB.t + PLOT_H + 22} textAnchor="start" fontSize="14" fill="#475569">{asset.xScaleAr[0]}</text>
        <text x={VB.l + PLOT_W} y={VB.t + PLOT_H + 22} textAnchor="end" fontSize="14" fill="#475569">{asset.xScaleAr[1]}</text>
        <text x={VB.l - 8} y={VB.t + 8} textAnchor="end" fontSize="14" fill="#475569">{asset.yScaleAr[1]}</text>
        <text x={VB.l - 8} y={VB.t + PLOT_H} textAnchor="end" fontSize="14" fill="#475569">{asset.yScaleAr[0]}</text>
        {/* Titres d'axes */}
        <text x={VB.l + PLOT_W / 2} y={VB.t - 14} textAnchor="middle" fontSize="15" fontWeight="700" fill="#334155">{asset.yAxisAr}</text>
        <text x={VB.l + PLOT_W / 2} y={VB.t + PLOT_H + 46} textAnchor="middle" fontSize="15" fontWeight="700" fill="#334155">{asset.xAxisAr}</text>
      </svg>
      {asset.captionAr && (
        <figcaption className="mt-1 px-2 text-center text-[11px] leading-5 text-[#506072] dark:text-gray-400">
          {asset.captionAr}
        </figcaption>
      )}
    </figure>
  );
}

function Tableau({ asset }: { asset: AssetTableau }) {
  return (
    <figure className="m-0 overflow-x-auto" data-testid="doc-tableau">
      <table className="w-full border-collapse text-right text-[12px]">
        <thead>
          <tr>
            {asset.columns.map((c, i) => (
              <th
                key={i}
                className="border border-[#e2dabf] dark:border-gray-700 bg-[#f3f4f5] dark:bg-black/30 px-2 py-1.5 font-black text-[#1f1c0b] dark:text-gray-100"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {asset.rows.map((ligne, i) => (
            <tr key={i}>
              {ligne.map((cell, j) => (
                <td
                  key={j}
                  className="border border-[#e2dabf] dark:border-gray-700 px-2 py-1.5 leading-6 text-[#1f1c0b] dark:text-gray-200"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {asset.captionAr && (
        <figcaption className="mt-1 text-center text-[11px] leading-5 text-[#506072] dark:text-gray-400">
          {asset.captionAr}
        </figcaption>
      )}
    </figure>
  );
}

function Image({ asset }: { asset: AssetImage }) {
  return (
    <figure className="m-0" data-testid="doc-image">
      <img src={asset.src} alt={asset.altAr} className="block w-full max-h-72 object-contain rounded-xl" />
      {(asset.captionAr ?? asset.altAr) && (
        <figcaption className="mt-1 text-center text-[11px] leading-5 text-[#506072] dark:text-gray-400">
          {asset.captionAr ?? asset.altAr}
        </figcaption>
      )}
    </figure>
  );
}

function Rendu({ asset }: { asset: DocumentAsset }) {
  if (asset.kind === 'table') return <Tableau asset={asset} />;
  if (asset.kind === 'curve') return <Courbe asset={asset} />;
  if (asset.kind === 'schema' || asset.kind === 'micrograph') return <Image asset={asset} />;
  // mixed : les deux documents de la paire, l'un sous l'autre.
  return (
    <div className="space-y-3" data-testid="doc-mixte">
      {asset.captionAr && (
        <p className="text-[12px] font-bold text-[#506072] dark:text-gray-300">{asset.captionAr}</p>
      )}
      {asset.assets.map((sous, i) => (
        <Rendu key={i} asset={sous} />
      ))}
    </div>
  );
}

interface DocumentFigureProps {
  assetKey: string;
}

/**
 * Affiche le document d'un exercice. Absent de `documentAssets.ts` (image
 * réelle manquante) → message explicite plutôt qu'un blanc trompeur.
 */
export default function DocumentFigure({ assetKey }: DocumentFigureProps) {
  const asset = getDocumentAsset(assetKey);
  if (!asset) {
    return (
      <p
        data-testid="doc-indisponible"
        className="mb-2 rounded-xl border border-dashed border-[#c9a227]/50 bg-amber-50/60 dark:bg-amber-500/10 px-3 py-2 text-[12px] leading-6 text-[#8a6a00] dark:text-amber-300"
      >
        {DOC_NON_DISPONIBLE_AR}
      </p>
    );
  }
  return (
    <div className="mb-3 rounded-2xl border border-[#006d37]/15 bg-[#f8fbf9] dark:bg-black/25 p-3" data-testid="doc-figure">
      <Rendu asset={asset} />
    </div>
  );
}
