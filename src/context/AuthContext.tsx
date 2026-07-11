// AuthContext.tsx
// Module 1 — Auth "Offline-First" via Supabase Google OAuth.
// - Ouverture instantanée hors-ligne : le profil est lu depuis localStorage (`kunz_user`).
// - En ligne : la session Supabase est restaurée (getSession) et surveillée (onAuthStateChange).
// - Première connexion : redirection Google (signInWithOAuth).

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  wilaya?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  signIn: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'kunz_user';

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

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
