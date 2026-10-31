import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "../config.js";

let adminClient: SupabaseClient | null = null;

/**
 * Returns the Supabase Admin Client (using service_role key).
 * Bypasses RLS for backend daemon, cron execution, and system logging.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;

  const url = config.SUPABASE_URL;
  const key = config.SUPABASE_SERVICE_ROLE_KEY || config.SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn(
      "Supabase credentials are not fully configured in backend/.env. Database operations will be mocked or skipped."
    );
  }

  adminClient = createClient(
    url || "https://placeholder-project.supabase.co",
    key || "placeholder-key",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  return adminClient;
}

/**
 * Returns a Supabase client scoped to a user's JWT token (respecting RLS).
 */
export function getUserSupabaseClient(jwtToken: string): SupabaseClient {
  const url = config.SUPABASE_URL || "https://placeholder-project.supabase.co";
  const anonKey = config.SUPABASE_ANON_KEY || "placeholder-key";

  return createClient(url, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
