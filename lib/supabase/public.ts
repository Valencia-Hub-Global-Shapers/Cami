import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Anonymous, cookie-free client for public pages. Reading cookies would opt
// the page out of static rendering, so the directory could not be cached.
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
