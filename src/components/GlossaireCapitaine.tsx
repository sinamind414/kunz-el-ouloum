// src/components/GlossaireCapitaine.tsx — LA BULLE DU CAPITAINE RÉPOND.
//
// Chargé en lazy depuis App.tsx : il n'entre PAS dans le bundle d'entrée.
// Une seule voix (le capitaine), une seule source de contenu (glossaireCapitaine.ts).
//
// H1 la bulle répond · H2 l'élève tape le mot · H3 sonde AVANT le contenu.
// Les silences d'épreuve / quiz / focus / combat sont gardés par le conteneur
// du bouton dans App.tsx : ici on ne peut même pas être monté pendant une épreuve.

import { useState } from 'react';
import { CAPITAINE_IDENTITE_AR } from '../data/capitaineIdentite';
import { LIBELLE_BULLE_SILENCIEUX_AR } from '../lib/invitationCapitaine';
import {
  chercherMot,
  VERDICTS_ESSAI,
  verdictEssai,
  type ReponseGlossaire,
} from '../data/glossaireCapitaine';

interface Props {
  onFermer: () => void;
  /** L'élève veut poursuivre avec le tuteur : le pont reste explicite. */
  onOuvrirTuteur: () => void;
}

type Phase = 'saisie' | 'sonde' | 'reponse';

/** Les verdicts du moteur portent du gras markdown ; l'UI l'affiche en clair. */
const enClair = (texte: string) => texte.replace(/\*\*/g, '');

export default function GlossaireCapitaine({ onFermer, onOuvrirTuteur }: Props) {
  const [saisie, setSaisie] = useState('');
  const [essai, setEssai] = useState('');
  const [phase, setPhase] = useState<Phase>('saisie');
  const [reponse, setReponse] = useState<ReponseGlossaire | null>(null);
  const [verdict, setVerdict] = useState('');

  const demander = () => {
    const r = chercherMot(saisie);
    setReponse(r);
    setVerdict('');
    setEssai('');
    // Un mot inconnu, un hors-programme ou un simple renvoi de nom n'a rien
    // à faire essayer : on répond sans sonde (H3 ne s'applique qu'au contenu).
    setPhase(r.donneLieuASonde ? 'sonde' : 'reponse');
  };

  const envoyerEssai = () => {
    if (!reponse) return;
    setVerdict(verdictEssai(reponse, essai));
    setPhase('reponse');
  };

  const demanderSansEssai = () => {
    setVerdict(VERDICTS_ESSAI.direct);
    setPhase('reponse');
  };

  const recommencer = () => {
    setSaisie('');
    setEssai('');
    setReponse(null);
    setVerdict('');
    setPhase('saisie');
  };

  return (
    <div
      data-testid="glossaire-capitaine"
      dir="rtl"
      role="dialog"
      aria-label={LIBELLE_BULLE_SILENCIEUX_AR}
      className="mb-2 w-[min(20rem,calc(100vw-2rem))] rounded-2xl rounded-bl-sm border border-[#006d37]/25 bg-white p-3 shadow-xl dark:border-emerald-400/25 dark:bg-[#121614]"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-black text-[#006d37] dark:text-emerald-300">
          {CAPITAINE_IDENTITE_AR}
        </p>
        <button
          type="button"
          data-testid="glossaire-capitaine-fermer"
          onClick={onFermer}
          aria-label="إغلاق"
          className="rounded-lg border border-black/10 px-2 py-0.5 text-[10px] font-bold text-[#506072] dark:border-white/10 dark:text-gray-300 cursor-pointer"
        >
          إغلاق
        </button>
      </div>

      {phase === 'saisie' && (
        <>
          <label htmlFor="glossaire-mot" className="block text-[11px] font-bold text-[#1f2b24] dark:text-gray-100">
            اكتب كلمة أو فعلاً من التعليمة :
          </label>
          <input
            id="glossaire-mot"
            data-testid="glossaire-capitaine-saisie"
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') demander(); }}
            placeholder="مثال: الجين / استنتج"
            className="mt-1 w-full rounded-xl border border-[#006d37]/25 bg-white px-3 py-2 text-[12px] font-bold text-[#1f2b24] outline-none focus:ring-2 focus:ring-[#006d37]/30 dark:bg-[#1a201c] dark:text-gray-100"
          />
          <button
            type="button"
            data-testid="glossaire-capitaine-demander"
            onClick={demander}
            className="mt-2 w-full rounded-xl bg-[#006d37] px-3 py-1.5 text-[11px] font-black text-white cursor-pointer"
          >
            اسأل القبطان
          </button>
        </>
      )}

      {phase === 'sonde' && reponse && (
        <>
          <p className="text-[12px] font-bold leading-relaxed text-[#1f2b24] dark:text-gray-100">
            🧭 {reponse.sondeAr}
          </p>
          <input
            data-testid="glossaire-capitaine-essai"
            value={essai}
            onChange={(e) => setEssai(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') envoyerEssai(); }}
            placeholder="اكتب محاولتك…"
            aria-label="محاولتك"
            className="mt-2 w-full rounded-xl border border-[#006d37]/25 bg-white px-3 py-2 text-[12px] font-bold text-[#1f2b24] outline-none focus:ring-2 focus:ring-[#006d37]/30 dark:bg-[#1a201c] dark:text-gray-100"
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              data-testid="glossaire-capitaine-envoyer-essai"
              onClick={envoyerEssai}
              className="flex-1 rounded-xl bg-[#006d37] px-3 py-1.5 text-[11px] font-black text-white cursor-pointer"
            >
              أرسل محاولتي
            </button>
            <button
              type="button"
              data-testid="glossaire-capitaine-ashrah"
              onClick={demanderSansEssai}
              className="rounded-xl border border-black/10 px-2.5 py-1.5 text-[10px] font-bold text-[#506072] dark:border-white/10 dark:text-gray-300 cursor-pointer"
            >
              اشرح لي
            </button>
          </div>
          <p className="mt-1 text-[10px] leading-relaxed text-[#506072] dark:text-gray-300">
            محاولة واحدة تكفي لكلمة المعجم. « لا أعرف » يعطيك الشرح من الأساس.
          </p>
        </>
      )}

      {phase === 'reponse' && reponse && (
        <div data-testid="glossaire-capitaine-reponse" aria-live="polite">
          {verdict && (
            <p className="mb-1 text-[11px] font-bold text-[#006d37] dark:text-emerald-300">
              {enClair(verdict)}
            </p>
          )}
          {reponse.etiquetteAr && (
            <p className="mb-1 text-[10px] font-black text-[#ba1a1a] dark:text-[#ff8a80]">
              {reponse.etiquetteAr}
            </p>
          )}
          <p className="whitespace-pre-line text-[12px] font-bold leading-relaxed text-[#1f2b24] dark:text-gray-100">
            {reponse.contenuAr}
          </p>
          {reponse.renvoiAr && (
            <p className="mt-1 text-[10px] font-bold text-[#506072] dark:text-gray-300">
              📘 {reponse.renvoiAr}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              data-testid="glossaire-capitaine-autre-mot"
              onClick={recommencer}
              className="flex-1 rounded-xl bg-[#006d37] px-3 py-1.5 text-[11px] font-black text-white cursor-pointer"
            >
              كلمة أخرى
            </button>
            <button
              type="button"
              data-testid="glossaire-capitaine-vers-tuteur"
              onClick={onOuvrirTuteur}
              className="rounded-xl border border-black/10 px-2.5 py-1.5 text-[10px] font-bold text-[#506072] dark:border-white/10 dark:text-gray-300 cursor-pointer"
            >
              تابع مع المرشد
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
