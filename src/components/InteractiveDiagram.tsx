import { useState } from 'react';
import { ZoomIn, Info, X } from 'lucide-react';

export interface Hotspot {
  id: string;
  x: number; // Percentage (0-100) from left
  y: number; // Percentage (0-100) from top
  labelAr: string;
  descAr?: string;
  color?: string; // e.g. 'bg-blue-500'
}

interface InteractiveDiagramProps {
  imageSrc: string;
  altAr: string;
  title?: string;
  hotspots: Hotspot[];
}

export default function InteractiveDiagram({ imageSrc, altAr, title, hotspots }: InteractiveDiagramProps) {
  const [activeSpot, setActiveSpot] = useState<Hotspot | null>(null);

  return (
    <div className="w-full bg-white dark:bg-[#141916] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden my-4 relative">
      {/* En-tête du schéma */}
      {title && (
        <div className="px-4 py-3 bg-[#f8f9fa] dark:bg-[#0c0f0d] border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <span className="font-black text-sm text-[#006d37] dark:text-[#2ecc71] flex items-center gap-2">
            <Info className="w-4 h-4" />
            {title}
          </span>
          <span className="text-[10px] text-gray-400 font-bold">اضغط على العلامات للتفاصيل</span>
        </div>
      )}

      {/* Conteneur Image + Hotspots */}
      <div className="relative w-full aspect-[16/10] sm:aspect-video bg-[#eef3ef] dark:bg-black">
        {/* On applique ton filtre CSS ici pour adoucir les images IA */}
        <img 
          src={imageSrc} 
          alt={altAr} 
          className="w-full h-full object-cover image-svt-filter"
          draggable={false}
        />

        {/* Bouton de zoom natif (réutilisé) */}
        <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-black/65 text-white px-3 py-1 text-[11px] font-bold shadow-md cursor-pointer hover:bg-black/80 transition-colors pointer-events-none">
          <ZoomIn className="w-3 h-3" /> تكبير
        </span>

        {/* Les Hotspots (Points interactifs) */}
        {hotspots.map((spot) => {
          const isActive = activeSpot?.id === spot.id;
          const dotColor = spot.color || 'bg-[#ff9a4a]';
          return (
            <button
              key={spot.id}
              onClick={(e) => {
                e.stopPropagation();
                setActiveSpot(isActive ? null : spot);
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all cursor-pointer z-20 ${isActive ? 'scale-110 z-30' : 'hover:scale-110'}`}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              aria-label={spot.labelAr}
            >
              {/* Animation ping derrière le point */}
              <span className={`absolute w-full h-full rounded-full ${dotColor} opacity-50 ${isActive ? '' : 'animate-ping'}`}></span>
              
              {/* Le point principal */}
              <span className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-black text-sm transition-colors ${isActive ? 'bg-[#006d37]' : dotColor}`}>
                {isActive ? <X className="w-4 h-4" /> : '+'}
              </span>

              {/* L'étiquette (Label) fixée au point (visible sur desktop, ou cachée si carte active) */}
              {!isActive && (
                <span className="absolute top-full mt-1.5 px-2 py-0.5 bg-black/80 text-white text-[9px] sm:text-[11px] font-bold rounded shadow-sm whitespace-nowrap opacity-0 md:opacity-100 transition-opacity">
                  {spot.labelAr}
                </span>
              )}
            </button>
          );
        })}

        {/* Pop-up de détail flottante (pour la lecture mobile) */}
        {activeSpot && (
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-80 bg-white/95 dark:bg-black/90 backdrop-blur-sm border border-[#e2dabf] dark:border-[#2ecc71]/30 rounded-2xl p-4 shadow-xl z-40 animate-in fade-in slide-in-from-bottom-2">
            <h4 className="font-black text-[#1f1c0b] dark:text-white text-base mb-1">{activeSpot.labelAr}</h4>
            {activeSpot.descAr && (
              <p className="text-sm text-[#506072] dark:text-gray-300 leading-relaxed">
                {activeSpot.descAr}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
