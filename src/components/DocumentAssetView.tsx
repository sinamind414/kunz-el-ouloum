// DocumentAssetView — renderer unique des documents structurés (P0-2).
// Dessine 'curve' (SVG), 'table', 'schema'/'micrograph' (img) et 'mixed'
// (récursif). Source de vérité : DocumentAsset dans documentAssets.ts.
// La vue d'analyse masque le bloc si l'asset est indisponible (integrity test).

import React from 'react';
import type { DocumentAsset } from '../data/documentAssets';

const CURVE_W = 560;
const CURVE_H = 320;
const PAD_L = 56;
const PAD_R = 24;
const PAD_T = 28;
const PAD_B = 56;

function CurveSvg({ asset, uid }: { asset: Extract<DocumentAsset, { kind: 'curve' }>; uid: string }) {
  const plotW = CURVE_W - PAD_L - PAD_R;
  const plotH = CURVE_H - PAD_T - PAD_B;
  const pts = asset.points;
  if (!pts.length) return null;
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const sx = (x: number) => PAD_L + ((x - minX) / spanX) * plotW;
  const sy = (y: number) => PAD_T + plotH - ((y - minY) / spanY) * plotH;
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');
  const gridY = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox={`0 0 ${CURVE_W} ${CURVE_H}`}
      role="img"
      aria-label={asset.altAr}
      className="w-full h-auto bg-white dark:bg-[#101412] rounded-xl border border-[#e2dabf]/50 dark:border-[#2ecc71]/10"
    >
      <title>{asset.altAr}</title>
      {/* grille */}
      {gridY.map((t) => (
        <line
          key={`h${t}`}
          x1={PAD_L}
          y1={PAD_T + plotH * (1 - t)}
          x2={PAD_L + plotW}
          y2={PAD_T + plotH * (1 - t)}
          stroke="#e2dabf"
          strokeOpacity={0.55}
          strokeWidth={1}
        />
      ))}
      {/* axes */}
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + plotH} stroke="#506072" strokeWidth={2} />
      <line
        x1={PAD_L}
        y1={PAD_T + plotH}
        x2={PAD_L + plotW}
        y2={PAD_T + plotH}
        stroke="#506072"
        strokeWidth={2}
      />
      {/* courbe */}
      <path d={path} fill="none" stroke="#006d37" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={`${uid}-pt-${i}`} cx={sx(p.x)} cy={sy(p.y)} r={5} fill="#006d37" />
      ))}
      {/* légendes échelles (qualitatives) */}
      <text x={PAD_L} y={CURVE_H - 28} fontSize={12} fill="#506072" textAnchor="start">
        {asset.xScaleAr[0]}
      </text>
      <text x={PAD_L + plotW} y={CURVE_H - 28} fontSize={12} fill="#506072" textAnchor="end">
        {asset.xScaleAr[1]}
      </text>
      <text x={PAD_L - 8} y={PAD_T + 4} fontSize={12} fill="#506072" textAnchor="end">
        {asset.yScaleAr[1]}
      </text>
      <text x={PAD_L - 8} y={PAD_T + plotH} fontSize={12} fill="#506072" textAnchor="end">
        {asset.yScaleAr[0]}
      </text>
      <text x={PAD_L + plotW / 2} y={CURVE_H - 8} fontSize={13} fill="#1f1c0b" textAnchor="middle" fontWeight={700}>
        {asset.xAxisAr}
      </text>
      <text
        transform={`translate(14,${PAD_T + plotH / 2}) rotate(-90)`}
        fontSize={13}
        fill="#1f1c0b"
        textAnchor="middle"
        fontWeight={700}
      >
        {asset.yAxisAr}
      </text>
    </svg>
  );
}

function TableView({ asset }: { asset: Extract<DocumentAsset, { kind: 'table' }> }) {
  return (
    <figure className="overflow-x-auto rounded-xl border border-[#e2dabf]/50 dark:border-[#2ecc71]/10 bg-white dark:bg-[#101412]">
      <table className="w-full text-xs sm:text-sm border-collapse" dir="rtl">
        <thead>
          <tr className="bg-[#006d37]/10 dark:bg-[#2ecc71]/10">
            {asset.columns.map((c) => (
              <th key={c} className="p-2 text-right font-black text-[#006d37] dark:text-[#2ecc71] border-b border-[#e2dabf]">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {asset.rows.map((row, ri) => (
            <tr key={`r${ri}`} className={ri % 2 ? 'bg-[#f8fbfa] dark:bg-[#0c0f0d]' : ''}>
              {row.map((cell, ci) => (
                <td key={`c${ci}`} className="p-2 border-b border-[#e2dabf]/40 text-[#1f1c0b] dark:text-gray-100">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption className="p-2 text-[11px] text-gray-500 text-center">{asset.captionAr}</figcaption>
    </figure>
  );
}

function ImageDoc({
  asset,
  kind,
}: {
  asset: Extract<DocumentAsset, { kind: 'schema' | 'micrograph' }>;
  kind: 'schema' | 'micrograph';
}) {
  return (
    <figure className="rounded-xl overflow-hidden border border-[#e2dabf]/50 dark:border-[#2ecc71]/10 bg-white dark:bg-[#101412]">
      <img src={asset.src} alt={asset.altAr} loading="lazy" className="w-full max-h-80 object-contain" data-doc-kind={kind} />
      {asset.captionAr && <figcaption className="p-2 text-[11px] text-gray-500 text-center">{asset.captionAr}</figcaption>}
    </figure>
  );
}

function AssetBody({ asset, uid }: { asset: DocumentAsset; uid: string }) {
  switch (asset.kind) {
    case 'curve':
      return (
        <div className="space-y-2">
          <CurveSvg asset={asset} uid={uid} />
          <p className="text-[11px] text-gray-500 text-center">{asset.captionAr}</p>
        </div>
      );
    case 'table':
      return <TableView asset={asset} />;
    case 'schema':
      return <ImageDoc asset={asset} kind="schema" />;
    case 'micrograph':
      return <ImageDoc asset={asset} kind="micrograph" />;
    case 'mixed':
      return (
        <div className="space-y-3" data-doc-kind="mixed">
          <p className="text-xs font-bold text-[#1f1c0b] dark:text-gray-200">{asset.captionAr}</p>
          <div className="grid gap-3">
            {asset.assets.map((child, i) => (
              <div key={`${uid}-mix-${i}`} className="relative">
                <span className="absolute top-2 right-2 z-10 bg-[#006d37] text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                  {i + 1}
                </span>
                <AssetBody asset={child} uid={`${uid}-${i}`} />
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default function DocumentAssetView({ asset, label }: { asset: DocumentAsset; label?: string }) {
  const uid = React.useId();
  return (
    <div className="document-asset-view space-y-2" dir="rtl" data-doc-kind={asset.kind}>
      {label && <p className="text-xs font-black text-[#006d37] dark:text-[#2ecc71]">{label}</p>}
      <AssetBody asset={asset} uid={uid} />
    </div>
  );
}
