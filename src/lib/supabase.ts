import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Only the PUBLIC (publishable / anon) key belongs in the frontend. It is safe to ship, because
// Row Level Security in the database is what protects the data.
// NEVER put the service-role key or any other secret in a VITE_ variable: Vite bundles those into public JS.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** True only when both public settings are present. The site still works without them. */
export const isAuthConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isAuthConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null
