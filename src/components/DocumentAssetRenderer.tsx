import { AlertTriangle } from 'lucide-react';
import { getDocumentAsset, type DocumentAsset } from '../data/documentAssets';

interface DocumentAssetRendererProps {
  assetKey: string;
}

export default function DocumentAssetRenderer({ assetKey }: DocumentAssetRendererProps) {
  const asset = getDocumentAsset(assetKey);

  if (!asset) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-amber-300/70 bg-amber-50 p-4 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100"
      >
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
          <div className="space-y-1 text-sm font-bold leading-7">
            <p>هذه الوثيقة غير جاهزة بعد.</p>
            <p>لا يمكن تحليلها دون عرض الجدول أو المنحنى.</p>
          </div>
        </div>
      </div>
    );
  }

  return <Asset asset={asset} />;
}

function Asset({ asset }: { asset: DocumentAsset }) {
  if (asset.kind === 'table') {
    return (
      <figure className="space-y-2">
        <div className="space-y-3 sm:hidden">
          {asset.rows.map((row, rowIndex) => (
            <dl key={rowIndex} className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-[#101512]">
              {row.map((cell, cellIndex) => (
                <div key={cellIndex} className="grid grid-cols-[minmax(7rem,0.9fr)_1.1fr] border-t border-gray-200 first:border-t-0 dark:border-gray-700">
                  <dt className="bg-emerald-50 px-3 py-2 text-[11px] font-black text-[#006d37] dark:bg-emerald-950/30 dark:text-emerald-300">
                    {asset.columns[cellIndex]}
                  </dt>
                  <dd className="px-3 py-2 text-[11px] font-bold leading-6 text-gray-800 dark:text-gray-100">{cell}</dd>
                </div>
              ))}
            </dl>
          ))}
        </div>
        <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 sm:block">
          <table className="w-full min-w-[620px] border-collapse text-right text-xs sm:text-sm">
            <caption className="sr-only">{asset.captionAr}</caption>
            <thead className="bg-[#006d37] text-white">
              <tr>
                {asset.columns.map((column) => (
                  <th key={column} scope="col" className="border-l border-white/20 px-3 py-3 font-black last:border-l-0">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {asset.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="odd:bg-white even:bg-emerald-50/60 dark:odd:bg-[#101512] dark:even:bg-emerald-950/20">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border-l border-t border-gray-200 px-3 py-3 font-medium text-gray-800 last:border-l-0 dark:border-gray-700 dark:text-gray-100">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <figcaption className="text-[11px] font-medium leading-6 text-gray-500 dark:text-gray-400">{asset.captionAr}</figcaption>
      </figure>
    );
  }

  if (asset.kind === 'curve') {
    const plot = asset.points.map(({ x, y }) => `${70 + x * 4.9},${255 - y * 2.05}`).join(' ');

    return (
      <figure className="space-y-2">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-[#101512]">
          <svg viewBox="0 0 640 320" className="h-auto w-full" role="img" aria-label={asset.altAr}>
            <title>{asset.altAr}</title>
            <desc>{asset.captionAr}</desc>
            <g stroke="currentColor" className="text-gray-300 dark:text-gray-700">
              <line x1="70" y1="50" x2="70" y2="255" strokeWidth="2" />
              <line x1="70" y1="255" x2="575" y2="255" strokeWidth="2" />
              <line x1="70" y1="152" x2="560" y2="152" strokeDasharray="5 6" />
            </g>
            <polyline points={plot} fill="none" stroke="#059669" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            {asset.points.map(({ x, y }, index) => (
              <circle key={index} cx={70 + x * 4.9} cy={255 - y * 2.05} r="4" fill="#006d37" />
            ))}
            <g fill="currentColor" className="text-gray-600 dark:text-gray-300" fontSize="13" fontWeight="700">
              <text x="320" y="305" textAnchor="middle">{asset.xAxisAr}</text>
              <text x="70" y="278" textAnchor="middle">{asset.xScaleAr[0]}</text>
              <text x="560" y="278" textAnchor="middle">{asset.xScaleAr[1]}</text>
              <text x="22" y="155" textAnchor="middle" transform="rotate(-90 22 155)">{asset.yAxisAr}</text>
              <text x="62" y="255" textAnchor="end">{asset.yScaleAr[0]}</text>
              <text x="62" y="55" textAnchor="end">{asset.yScaleAr[1]}</text>
            </g>
          </svg>
        </div>
        <figcaption className="text-[11px] font-medium leading-6 text-gray-500 dark:text-gray-400">{asset.captionAr}</figcaption>
      </figure>
    );
  }

  if (asset.kind === 'schema' || asset.kind === 'micrograph') {
    return (
      <figure className="space-y-2">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700">
          <img src={asset.src} alt={asset.altAr} className="h-auto max-h-[520px] w-full object-contain" />
        </div>
        {asset.captionAr && (
          <figcaption className="text-[11px] font-medium leading-6 text-gray-500 dark:text-gray-400">{asset.captionAr}</figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className="space-y-4">
      <figcaption className="text-sm font-black text-gray-800 dark:text-gray-100">{asset.captionAr}</figcaption>
      {asset.assets.map((child, index) => (
        <section key={index} aria-label={`الوثيقة ${index + 1}`} className="rounded-2xl border border-gray-100 p-3 dark:border-gray-800">
          <Asset asset={child} />
        </section>
      ))}
    </figure>
  );
}
