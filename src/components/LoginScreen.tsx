// LoginScreen.tsx
// Module 1 — UI du Gatekeeper. Bouton Google (mock), loader, blocage si offline
// sur première ouverture (promesse "100% Offline" préservée pour les comptes en cache).

import React, { useState } from 'react';
import { Mail, Loader2, WifiOff } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => Promise<void>;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  const handleLogin = async () => {
    if (isOffline) {
      setError('Connexion internet requise pour la première ouverture.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onLogin();
    } catch (e) {
      setError('Échec de la connexion. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c0f0d] text-white p-6" dir="rtl">
      <div className="w-full max-w-sm bg-[#141916] border border-[#2ecc71]/10 rounded-3xl p-8 shadow-lg space-y-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#006d37] flex items-center justify-center">
          <Mail className="w-8 h-8 text-[#fed65b]" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Kunz El Ouloum</h1>
          <p className="text-sm text-gray-400 mt-1">BAC SVT — Algérie · 100% Offline</p>
        </div>

        {isOffline && (
          <div className="flex items-center gap-2 justify-center text-rose-400 text-xs font-bold bg-rose-500/10 border border-rose-500/30 rounded-xl py-2 px-3">
            <WifiOff className="w-4 h-4" />
            Connexion internet requise pour la première ouverture.
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading || isOffline}
          className="w-full py-3.5 rounded-2xl bg-white text-[#0c0f0d] font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer transition-opacity hover:opacity-90"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Connexion...
            </>
          ) : (
            <>
              <Mail className="w-5 h-5" />
              Se connecter avec Google
            </>
          )}
        </button>

        {error && !isOffline && <p className="text-rose-400 text-xs font-bold">{error}</p>}

        <p className="text-[10px] text-gray-500 leading-5">
          Ton profil est sauvegardé localement. L'app s'ouvrira instantanément, même en mode avion.
        </p>
      </div>
    </div>
  );
}
