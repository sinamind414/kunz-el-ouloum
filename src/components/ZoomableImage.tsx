import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ImgHTMLAttributes } from 'react';
import { ZoomIn, X, Plus, Minus, Maximize, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

interface LightboxProps {
  src: string;
  alt?: string;
  referrerPolicy?: string;
  onClose: () => void;
}

/** Visionneuse plein écran : molette pour zoomer, glisser (pointer) pour déplacer, flèches pour se déplacer, Échap/fond pour fermer. */
function Lightbox({ src, alt = '', referrerPolicy, onClose }: LightboxProps) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef({ active: false, x: 0, y: 0 });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose();
      const step = 60;
      if (e.key === 'ArrowLeft') setPos((p) => ({ ...p, x: p.x + step }));
      else if (e.key === 'ArrowRight') setPos((p) => ({ ...p, x: p.x - step }));
      else if (e.key === 'ArrowUp') setPos((p) => ({ ...p, y: p.y + step }));
      else if (e.key === 'ArrowDown') setPos((p) => ({ ...p, y: p.y - step }));
      else if (e.key === '+' || e.key === '=') setScale((s) => Math.min(6, s + 0.3));
      else if (e.key === '-' || e.key === '_') setScale((s) => Math.max(1, s - 0.3));
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const panBy = (dx: number, dy: number) => setPos((p) => ({ x: p.x + dx, y: p.y + dy }));

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.min(6, Math.max(1, s - e.deltaY * 0.0015)));
  };

  // Pointer capture : le glisser reste fluide même si le curseur quitte l'image.
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { active: true, x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current.x = e.clientX;
    drag.current.y = e.clientY;
    setPos((p) => ({ x: p.x + dx, y: p.y + dy }));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    drag.current.active = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const ctrlBtn =
    'w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer';

  return createPortal(
    <div
      className="fixed inset-0 z-[300] bg-black/85 flex items-center justify-center touch-none select-none"
      onClick={onClose}
      onWheel={onWheel}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
        aria-label="Fermer"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Flèches latérales (gauche / droite) */}
      <button
        onClick={(e) => { e.stopPropagation(); panBy(90, 0); }}
        className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 ${ctrlBtn}`}
        aria-label="Déplacer à gauche"
      >
        <ArrowRight className="w-5 h-5" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); panBy(-90, 0); }}
        className={`absolute right-3 top-1/2 -translate-y-1/2 z-10 ${ctrlBtn}`}
        aria-label="Déplacer à droite"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Barre de contrôle basse */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        <button onClick={(e) => { e.stopPropagation(); panBy(0, 90); }} className={ctrlBtn} aria-label="Bas">
          <ArrowUp className="w-5 h-5" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); panBy(0, -90); }} className={ctrlBtn} aria-label="Haut">
          <ArrowDown className="w-5 h-5" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); setScale((s) => Math.min(6, s + 0.3)); }} className={ctrlBtn} aria-label="Zoom +">
          <Plus className="w-5 h-5" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); setScale((s) => Math.max(1, s - 0.3)); }} className={ctrlBtn} aria-label="Zoom -">
          <Minus className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setScale(1); setPos({ x: 0, y: 0 }); }}
          className={ctrlBtn}
          aria-label="Réinitialiser"
        >
          <Maximize className="w-5 h-5" />
        </button>
      </div>

      <img
        src={src}
        alt={alt}
        referrerPolicy={referrerPolicy as any}
        draggable={false}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
          maxWidth: '92vw',
          maxHeight: '88vh',
          cursor: scale > 1 ? 'grab' : 'zoom-in',
        }}
        className="rounded-lg shadow-2xl"
      />
    </div>,
    document.body
  );
}

interface ZoomableImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
}

/** Image cliquable qui ouvre la visionneuse plein écran. */
export default function ZoomableImage({ src, alt = '', className, style, ...rest }: ZoomableImageProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ cursor: 'zoom-in', ...style }}
        onClick={() => { setOpen(true); }}
        {...rest}
      />
      {open && (
        <Lightbox src={src} alt={alt} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

interface ZoomButtonProps {
  src: string;
  alt?: string;
  referrerPolicy?: string;
  className?: string;
}

/** Petit bouton loupe qui ouvre la visionneuse (utile quand l'image a déjà un onClick fonctionnel). */
export function ZoomImageButton({ src, alt = '', referrerPolicy, className = '' }: ZoomButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`z-10 w-9 h-9 rounded-full bg-[#006d37] text-white shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer ${className}`}
        aria-label="Zoomer l'image"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      {open && (
        <Lightbox src={src} alt={alt} referrerPolicy={referrerPolicy} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
