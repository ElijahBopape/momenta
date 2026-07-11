import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Service-role client — bypasses RLS entirely. Server-only, never import
 * from a client component. Used exclusively for the narrow, hardcoded-shape
 * public invitation lookup/response writes in src/app/i/[token], which
 * intentionally has no anon RLS policy on `invitations` or
 * `invitation_responses` (see migrations 0002/0003).
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
