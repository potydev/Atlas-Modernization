import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/** Returns true if Supabase env vars look like real (non-placeholder) values */
export function isSupabaseConfigured(): boolean {
  return (
    !!supabaseUrl &&
    !!supabaseAnonKey &&
    !supabaseUrl.startsWith('https://placeholder') &&
    supabaseAnonKey !== 'placeholder-key'
  );
}

let _supabase: SupabaseClient | null = null;

/** Lazily creates and returns the Supabase client. Only call when isSupabaseConfigured() is true. */
export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

/** Legacy named export for backward compatibility — lazily creates client */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!isSupabaseConfigured()) {
      // Return a no-op function that resolves safely for any method call
      return () => Promise.resolve({ data: null, error: new Error('Supabase not configured') });
    }
    const client = getSupabaseClient();
    const value = (client as Record<string | symbol, unknown>)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
