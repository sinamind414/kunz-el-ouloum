// AuthContext.tsx
// Module 1 — Auth "Offline-First" via Supabase Google OAuth.
// - Ouverture instantanée hors-ligne : le profil est lu depuis localStorage (`kunz_user`).
// - En ligne : la session Supabase est restaurée (getSession) et surveillée (onAuthStateChange).
// - Première connexion : redirection Google (signInWithOAuth).

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { logEvent } from '../utils/telemetryService';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  wilaya?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  signIn: () => Promise<void>;
  continueOffline: () => void;
  signInAsGuest: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'kunz_user';
const OFFLINE_ID_KEY = 'kunz_offline_id';

// Identifiant offline stable (évite la collision 'offline-guest' partagé par tous).
const genId = (): string =>
  (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    ? crypto.randomUUID()
    : 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);

const getOrCreateOfflineId = (): string => {
  try {
    const existing = localStorage.getItem(OFFLINE_ID_KEY);
    if (existing) return existing;
  } catch {}
  const id = 'offline_' + genId();
  try {
    localStorage.setItem(OFFLINE_ID_KEY, id);
  } catch {}
  return id;
};

const readCache = (): UserProfile | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as UserProfile) : null;
  } catch {
    return null;
  }
};

const writeCache = (p: UserProfile) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {}
};

const clearCache = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
};

// Mappe un user Supabase (Google) vers notre UserProfile.
const mapUser = (u: { id: string; email?: string; user_metadata?: any }): UserProfile => ({
  id: u.id,
  email: u.email || '',
  name: u.user_metadata?.full_name || u.user_metadata?.name || u.email || 'Élève Kunz',
  wilaya: u.user_metadata?.wilaya,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Synchronous : ouverture instantanée même hors-ligne (cache local).
  const [user, setUser] = useState<UserProfile | null>(() => readCache());

  useEffect(() => {
    if (!supabase) return; // mode dégradé : auth désactivé

    // Restaure la session Supabase si en ligne (source autorité).
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const p = mapUser(data.session.user);
        writeCache(p);
        setUser(p);
      }
    });

    // Surveille les changements (retour OAuth, sign-out, refresh).
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const p = mapUser(session.user);
        writeCache(p);
        setUser(p);
      } else {
        clearCache();
        setUser(null);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    if (!supabase) throw new Error('Supabase non configuré');
    // Redirige vers Google ; au retour, onAuthStateChange déclenche setUser.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const signOut = () => {
    if (supabase) supabase.auth.signOut().catch(() => {});
    clearCache();
    setUser(null);
  };

  // Mode offline : profil local sans Google, conforme à la promesse « 100% Offline ».
  // Identifiant persistant unique (évite la collision 'offline-guest').
  const continueOffline = () => {
    if (supabase) supabase.auth.signOut().catch(() => {});
    const guest: UserProfile = {
      id: getOrCreateOfflineId(),
      email: '',
      name: 'Élève Kunz',
    };
    writeCache(guest);
    setUser(guest);
  };

  // Mode invité offline : profil invité dédié, tenu de la promesse « 100% Offline »
  // même à la première ouverture sans réseau (cybercafé en mode avion).
  const signInAsGuest = () => {
    if (supabase) supabase.auth.signOut().catch(() => {});
    const guestProfile: UserProfile = {
      id: 'guest_' + genId(),
      email: 'guest@kunz.local',
      name: 'طالب زائر',
    };
    writeCache(guestProfile);
    setUser(guestProfile);
    logEvent('GUEST_LOGIN_OFFLINE', { isOnline: navigator.onLine });
  };

  return (
    <AuthContext.Provider value={{ user, signIn, continueOffline, signInAsGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
