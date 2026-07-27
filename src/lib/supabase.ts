import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Lazily-initialized Supabase client.
 *
 * Configure via Netlify env vars (Site settings → Environment variables):
 *   VITE_SUPABASE_URL      — https://<project>.supabase.co
 *   VITE_SUPABASE_ANON_KEY — the project's anon/public key
 *
 * When the env vars are absent (local dev, deploy previews without secrets),
 * getSupabase() returns null and callers fall back to localStorage.
 */
let client: SupabaseClient | null | undefined

export function getSupabase(): SupabaseClient | null {
  if (client === undefined) {
    const url = import.meta.env.VITE_SUPABASE_URL
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    client = url && anonKey ? createClient(url, anonKey) : null
  }
  return client
}

export function isSupabaseConfigured(): boolean {
  return getSupabase() !== null
}
