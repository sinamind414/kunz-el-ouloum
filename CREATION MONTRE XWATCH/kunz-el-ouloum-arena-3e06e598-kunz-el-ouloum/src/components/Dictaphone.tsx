// Dictaphone.tsx — le micro qui écrit (demande utilisateur 2026-10-16 :
// « ajouter microphone pour dicter et écrire le texte quand l'élève clique »).
//
// Technologie : la Web Speech API NATIVE du navigateur (SpeechRecognition /
// webkitSpeechRecognition — Chrome, Edge, Android Chrome). Aucun service
// externe, aucune clé, aucun coût. La dictée nécessite un navigateur qui la
// supporte (sinon le bouton se désactive HONNÊTEMENT) et, selon le navigateur,
// une connexion Internet le temps de la dictée.
//
// CONTRAT avec les champs :
//   Seuls les textes FINAUX sont poussés via onTranscript (jamais les
//   fragments provisoires) — l'appelant colle le texte à la fin de son champ.
//   Un champ qui tremble à chaque syllabe est inutilisable pour réviser.
//
// Langue : ar-SA par défaut (فصحى — règle AGENTS n° 5 : jamais de dialecte ;
// c'est aussi la locale arabe la mieux couverte par les moteurs de dictée).
// Prop `lang` disponible si un jour une variante est justifiée.

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string }; length: number }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

/** Moteur natif du navigateur, ou null si la dictée n'est pas supportée. */
export function moteurDeDictee(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    | (new () => SpeechRecognitionLike)
    | null;
}

interface DictaphoneProps {
  /** Colle le texte FINAL dicté — l'appelant l'ajoute à la fin de son champ. */
  onTranscript: (texte: string) => void;
  /** Identifiant unique de la zone (testids `dictaphone-${zone}` / `-vivant`). */
  zone: string;
  /** Locale de reconnaissance — défaut ar-SA (فصحى). */
  lang?: string;
  /** Champ verrouillé (réponse déjà validée, examen soumis…) → micro muet. */
  disabled?: boolean;
}

export default function Dictaphone({ onTranscript, zone, lang = 'ar-SA', disabled }: DictaphoneProps) {
  const [ecoute, setEcoute] = useState(false);
  const [messageAr, setMessageAr] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  // La référence au callback vit TOUJOURS à jour : le moteur instancié au
  // clic appelle la closure du dernier rendu, jamais une vieille props.
  const cbRef = useRef(onTranscript);
  cbRef.current = onTranscript;

  const supporte = moteurDeDictee() != null;

  // Déplacement / démontage pendant l'écoute → on coupe, pas de micro resté
  // ouvert à l'insu de l'élève.
  useEffect(
    () => () => {
      recRef.current?.abort();
    },
    [],
  );

  const basculer = () => {
    if (ecoute) {
      recRef.current?.stop();
      // Retour visuel immédiat (le moteur confirmera via onend/onerror).
      setEcoute(false);
      return;
    }
    const Moteur = moteurDeDictee();
    if (!Moteur) return;
    const rec = new Moteur();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal && r[0].transcript.trim()) cbRef.current(r[0].transcript.trim());
      }
    };
    rec.onerror = (e) => {
      setMessageAr(
        e.error === 'not-allowed'
          ? 'الميكروفون مرفوض — اسمح به من إعدادات المتصفح ثم أعد المحاولة'
          : 'تعذّر الاستماع — تحقّق من الاتصال ثم أعد المحاولة',
      );
      setEcoute(false);
      recRef.current = null;
    };
    rec.onend = () => {
      setEcoute(false);
    };
    recRef.current = rec;
    setMessageAr(null);
    setEcoute(true);
    try {
      rec.start();
    } catch {
      // start() jetant déjà si démarré (double-clic rapide) : état cohérent.
      setEcoute(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        data-testid={`dictaphone-${zone}`}
        onClick={basculer}
        disabled={disabled || !supporte}
        aria-pressed={ecoute}
        title={
          !supporte
            ? 'الإملاء الصوتي غير مدعوم في هذا المتصفح — استخدم Chrome أو Edge'
            : ecoute
              ? 'إسماع… انقر للإيقاف'
              : 'انقر ثم امل — تُكتب كلماتك في الحقل مباشرة'
        }
        aria-label={
          !supporte
            ? 'الإملاء الصوتي غير مدعوم في هذا المتصفح'
            : ecoute
              ? 'إيقاف الإملاء الصوتي'
              : 'بدء الإملاء الصوتي'
        }
        className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
          ecoute
            ? 'border-[#ba1a1a]/40 bg-[#ba1a1a]/10 text-[#ba1a1a] animate-pulse'
            : 'border-[#e2dabf]/60 bg-[#fff9ed] text-[#006d37] hover:border-[#006d37]/40 dark:bg-[#1f2622] dark:border-emerald-900/40 dark:text-emerald-300'
        }`}
      >
        {supporte ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        {ecoute && <span className="absolute -top-1 -left-1 h-2.5 w-2.5 rounded-full bg-[#ba1a1a] animate-ping" />}
      </button>
      {ecoute && (
        <span data-testid={`dictaphone-${zone}-vivant`} className="text-[10px] font-bold text-[#006d37] dark:text-emerald-300">
          استمع…
        </span>
      )}
      {messageAr && <span className="text-[10px] font-bold text-[#ba1a1a]">{messageAr}</span>}
    </div>
  );
}
