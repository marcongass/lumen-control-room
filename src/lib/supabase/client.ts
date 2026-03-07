import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Database = Record<string, never>; // TODO: replace with generated types

let cachedClient: SupabaseClient<Database> | null = null;

export function getSupabaseClient() {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isServer = typeof window === "undefined";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = isServer ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined;
  const key = serviceKey || anonKey;

  if (!url || !key) {
    console.warn("Supabase env vars missing; falling back to mock data");
    return null;
  }

  cachedClient = createClient<Database>(url, key, {
    auth: { persistSession: false },
  });

  return cachedClient;
}
