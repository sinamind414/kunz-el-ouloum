import { Languages } from 'lucide-react';
import type { Lang } from '../../data/manhadjiyaModules';

interface BilingualSwitcherProps {
  lang: Lang;
  onChange: (lang: Lang) => void;
}

const OPTIONS: { id: Lang; label: string }[] = [
  { id: 'ar', label: 'ع' },
  { id: 'fr', label: 'FR' },
  { id: 'bilingual', label: 'ع/FR' },
];

/** Sélecteur de langue AR / FR / Bilingue (préférence persistée par le parent). */
export default function BilingualSwitcher({ lang, onChange }: BilingualSwitcherProps) {
  return (
    <div className="inline-flex items-center gap-1 bg-white/15 rounded-full p-1">
      <Languages className="w-4 h-4 text-white/80 mx-1" />
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`px-2.5 py-1 rounded-full text-xs font-black transition-colors cursor-pointer ${
            lang === o.id ? 'bg-white text-[#006d37]' : 'text-white/90 hover:bg-white/10'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Affiche un texte selon la langue courante (bilingue = AR au-dessus, FR dessous). */
export function Bi({ ar, fr, lang, className = '' }: { ar: string; fr?: string; lang: Lang; className?: string }) {
  if (lang === 'fr' && fr) return <span className={className} dir="ltr">{fr}</span>;
  if (lang === 'bilingual') {
    return (
      <span className={className}>
        <span dir="rtl" className="block">{ar}</span>
        {fr && <span dir="ltr" className="block text-[0.85em] opacity-70">{fr}</span>}
      </span>
    );
  }
  return <span className={className} dir="rtl">{ar}</span>;
}
