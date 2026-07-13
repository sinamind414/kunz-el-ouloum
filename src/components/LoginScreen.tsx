// LoginScreen.tsx
// Module 1 — UI du Gatekeeper. Bouton Google (OAuth), loader, et mode invité
// offline (promesse "100% Offline" préservée, y compris à la première ouverture).

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { WifiOff, LogIn } from 'lucide-react';

export default function LoginScreen() {
  const { signIn, signInAsGuest } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const handleGoogleLogin = async () => {
    if (!isOnline) {
      setError('Connexion internet requise pour la première ouverture avec Google.');
      return;
    }
    setIsAuthenticating(true);
    try {
      await signIn();
    } catch (e) {
      setError('Échec de la connexion. Réessayez.');
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c0f0d] text-white p-6" dir="rtl">
      <div className="w-full max-w-sm bg-[#141916] border border-[#2ecc71]/10 rounded-3xl p-8 shadow-lg space-y-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#006d37] flex items-center justify-center">
          <span className="text-3xl font-black text-[#fed65b]">ك</span>
        </div>
        <div>
          <h1 className="text-2xl font-black">كنز العلوم</h1>
          <p className="text-sm text-gray-400 mt-1">BAC SVT — Algérie · 100% Offline</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 justify-center text-rose-400 text-xs font-bold bg-rose-500/10 border border-rose-500/30 rounded-xl py-2 px-3">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={isAuthenticating}
          className="w-full py-3.5 rounded-2xl bg-white text-[#0c0f0d] font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer transition-opacity hover:opacity-90"
        >
          {isAuthenticating ? (
            <span className="w-5 h-5 border-2 border-[#0c0f0d]/30 border-t-[#0c0f0d] rounded-full animate-spin" />
          ) : (
            <LogIn className="w-5 h-5" />
          )}
          التسجيل عبر Google
        </button>

        {/* Mode invité / hors-ligne — toujours disponible (promesse 100% Offline). */}
        <button
          onClick={signInAsGuest}
          className="w-full py-2.5 rounded-2xl bg-transparent text-gray-400 font-bold text-xs border border-gray-600 hover:border-[#2ecc71]/40 hover:text-[#2ecc71] transition-colors cursor-pointer"
        >
          {isOnline ? 'Continuer hors-ligne sans compte' : 'المتابعة كزائر (بدون إنترنت)'}
        </button>

        <p className="text-[10px] text-gray-500 leading-5">
          يمكنك متابعة المراجعة بدون إنترنت. سيتم حفظ تقدمك محلياً وربطه بحسابك عند عودة الاتصال.
        </p>
      </div>
    </div>
  );
}
