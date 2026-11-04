// PushOptIn.tsx — Opt-in explicite aux rappels de révision espacée (Web Push, M4).
//
// Principe : l'élève CHOISIT de recevoir des notifications push. Aucun envoi
// sans opt-in ; aucun abonnement persistant sans consentement. Les heures
// algériennes sont respectées (pas de notif entre 22h et 08h, UTC+1) et max
// 1 notification par jour par utilisateur (côté serveur, /api/push/send).
//
// Le composant est rendHER dans l'accueil (App.tsx) et dans la page de plan
// de révision, uniquement si :
//   · le navigateur supporte les notifications ET le Service Worker,
//   · l'utilisateur n'a pas encore donné de réponse (persisté en localStorage
//     sous 'kunz_push_choix' : 'oui' | 'non' | 'ignorant'),
//   · l'app n'est pas dans l'APK Capacitor (le SW y est neutralisé par main.tsx).

import { useEffect, useState } from 'react';
import { BellOff, Bell, AlertCircle, CheckCircle2, X, ChevronRight } from 'lucide-react';

export type PushChoix = 'oui' | 'non' | 'ignorant';

const CLE_LOCAL = 'kunz_push_choix';

function estApkCapacitor(): boolean {
  return typeof (window as { Capacitor?: unknown }).Capacitor !== 'undefined';
}

function peutSouscrire(): boolean {
  if (estApkCapacitor()) return false;
  if (!('serviceWorker' in navigator)) return false;
  if (!('PushManager' in window)) return false;
  if (!('Notification' in window)) return false;
  return true;
}

function lectureChoix(): PushChoix {
  if (typeof localStorage === 'undefined') return 'ignorant';
  const v = localStorage.getItem(CLE_LOCAL);
  return v === 'oui' || v === 'non' || v === 'ignorant' ? (v as PushChoix) : 'ignorant';
}

function ecrireChoix(c: PushChoix): void {
  try {
    localStorage.setItem(CLE_LOCAL, c);
  } catch {
    // stockage indisponible : on reste en mémoire
  }
}

interface PushOptInProps {
  /** Si vrai, le bouton d'opt-in est affiché en plein (page dédiée). Sinon, carte compacte. */
  mode?: 'compact' | 'plein';
}

export default function PushOptIn({ mode = 'compact' }: PushOptInProps) {
  const [choix, setChoix] = useState<PushChoix>(() => lectureChoix());
  const [demandeEnCours, setDemandeEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [abonne, setAbonne] = useState<boolean | null>(null);

  useEffect(() => {
    // Détecte si un abonnement push existe déjà côté SW (best-effort).
    if (!peutSouscrire()) {
      setAbonne(false);
      return;
    }
    navigator.serviceWorker
      .getRegistration('/sw.js')
      .then((reg) => {
        if (!reg) {
          setAbonne(false);
          return;
        }
        return reg.pushManager.getSubscription();
      })
      .then((sub) => {
        setAbonne(!!sub);
      })
      .catch(() => {
        setAbonne(false);
      });
  }, []);

  const estPlein = mode === 'plein';

  const activerPush = async () => {
    if (!peutSouscrire()) {
      setErreur('Votre navigateur ne supporte pas les notifications push.');
      return;
    }
    setDemandeEnCours(true);
    setErreur(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setErreur('La permission de notification a été refusée. Vous pouvez l\'autoriser dans les paramètres du navigateur.');
        setDemandeEnCours(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setErreur('Le service de notifications n\'est pas configuré.');
        setDemandeEnCours(false);
        return;
      }

      const applicationServerKey = urlBase64ToUint8Array(vapidKey);
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // Envoie l'abonnement au serveur.
      const me = await fetch('/api/auth/me', { credentials: 'include' });
      if (!me.ok) {
        setErreur('Vous devez être connecté pour activer les rappels.');
        await sub.unsubscribe();
        setDemandeEnCours(false);
        return;
      }

      const payload = {
        endpoint: sub.endpoint,
        p256dh: arrayBufferToBase64(sub.getKey('p256dh')!),
        auth: arrayBufferToBase64(sub.getKey('auth')!),
        userAgent: navigator.userAgent,
      };
      const resp = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        throw new Error(`Échec de l'enregistrement (${resp.status})`);
      }

      ecrireChoix('oui');
      setChoix('oui');
      setAbonne(true);
      setDemandeEnCours(false);
    } catch (e: any) {
      setErreur(e.message || 'Impossible d\'activer les notifications push.');
      setDemandeEnCours(false);
    }
  };

  const refuserPush = () => {
    ecrireChoix('non');
    setChoix('non');
    setErreur(null);
  };

  const desactiverPush = async () => {
    if (!peutSouscrire()) return;
    setDemandeEnCours(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      }
    } catch {
      /* best effort */
    }
    ecrireChoix('non');
    setChoix('non');
    setAbonne(false);
    setDemandeEnCours(false);
    setErreur(null);
  };

  if (choix === 'oui' && abonne) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border ${
          estPlein ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300' : 'border-[#006d37]/30 bg-[#006d37]/5 text-[#006d37]'
        }`}
        dir="rtl"
      >
        <Bell className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        <span>Les rappels de révision sont activés. Vous recevrez au maximum une notification par jour, entre 8h et 22h (heure d\'Alger).</span>
        <button
          onClick={desactiverPush}
          className="ml-2 underline decoration-1 hover:no-underline"
          title="Désactiver les rappels"
        >
          <X className="w-3 h-3" /> <span>Désactiver</span>
        </button>
      </div>
    );
  }

  if (choix === 'non') {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border ${
          estPlein ? 'border-gray-200 bg-gray-50 dark:bg-gray-950/20 text-gray-600 dark:text-gray-400' : 'border-[#006d37]/30 bg-[#006d37]/5 text-[#506072]'
        }`}
        dir="rtl"
      >
        <BellOff className="w-3 h-3 text-gray-400" />
        <span>Vous avez refusé les rappels de révision.</span>
        <button
          onClick={activerPush}
          className="ml-2 underline decoration-1 hover:no-underline text-[#006d37]"
          title="Activer les rappels"
        >
          <Bell className="w-3 h-3" /> <span>Activer plus tard</span>
        </button>
      </div>
    );
  }

  // choix === 'ignorant' : propose l'opt-in.
  return (
    <div
      className={`rounded-2xl border p-4 ${
        estPlein
          ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm'
          : 'bg-[#006d37]/5 border-[#006d37]/20 text-[#1f1c0b] dark:text-gray-200'
      }`}
      dir="rtl"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className={`w-6 h-6 ${
          estPlein ? 'text-amber-600' : 'text-[#006d37]'
        } flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className={`font-black text-lg sm:text-base ${
              estPlein ? 'text-gray-900 dark:text-white' : 'text-[#006d37]'
            }`}>
              Rappels de révision espacée
            </h3>
            <span className={`text-xs font-bold tracking-wider ${
              estPlein ? 'text-amber-500' : 'text-[#006d37]'
            }`}>
              M4 — optionnel
            </span>
          </div>
          <p className={`text-sm leading-relaxed ${
            estPlein ? 'text-gray-600 dark:text-gray-300' : 'text-[#506072] dark:text-gray-300'
          } mb-3`}>
            Recevez un rappel léger quand il est temps de réviser une leçon (algorithme de répétition espacée).
            <br />
            <strong>Vos choix :</strong> maximum une notification par jour, jamais entre 22h et 8h (heure d’Alger). Vous pouvez désactiver à tout moment.
          </p>
          {erreur && (
            <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-3">{erreur}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={activerPush}
              disabled={demandeEnCours}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 ${
                demandeEnCours
                  ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
                  : estPlein
                    ? 'bg-[#006d37] text-white hover:opacity-95'
                    : 'bg-[#006d37] text-white hover:opacity-95'
              }`}
            >
              {demandeEnCours ? (
                <span>Activation…</span>
              ) : (
                <>
                  <Bell className="w-3 h-3 fill-current" /> <span>Activer les rappels</span>
                </>
              )}
            </button>
            <button
              onClick={refuserPush}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 ${
                estPlein
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  : 'bg-transparent border border-[#006d37]/40 text-[#006d37] hover:bg-[#006d37]/20'
              }`}
            >
              <X className="w-3 h-3" /> <span>Pas maintenant</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Convertit une clé VAPID base64 URL en Uint8Array. */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
