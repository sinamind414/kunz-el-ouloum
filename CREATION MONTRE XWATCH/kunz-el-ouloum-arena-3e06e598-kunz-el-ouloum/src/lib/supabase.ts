// src/lib/supabase.ts
// Client Supabase (Auth + Télémétrie) chargé à la demande.
// Si les variables ne sont pas renseignées, le client reste null et l'app
// fonctionne en mode dégradé sans télécharger le SDK au démarrage.

import type { SupabaseClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

export const hasSupabaseCreds = Boolean(url && anonKey);

let warnedMissingCreds = false;
let supabasePromise: Promise<SupabaseClient | null> | null = null;

function warnMissingCreds() {
  if (warnedMissingCreds) return;
  warnedMissingCreds = true;
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquants — Auth et Télémétrie Supabase désactivés. Renseigne-les dans .env.'
  );
}

export async function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (!hasSupabaseCreds) {
    warnMissingCreds();
    return null;
  }

  if (!supabasePromise) {
    supabasePromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    );
  }

  return supabasePromise;
}
