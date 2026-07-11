// src/lib/supabase.ts
// Client Supabase (Auth + Télémétrie). Les identifiants viennent de .env (Vite).
// Si les variables ne sont pas renseignées, le client est null et l'app reste
// utilisable en mode dégradé (Auth/Télémétrie désactivés, cache offline préservé).

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

const hasCreds = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = hasCreds
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // capture le token après retour OAuth
      },
    })
  : null;

if (!hasCreds) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquants — Auth et Télémétrie Supabase désactivés. Renseigne-les dans .env.'
  );
}
