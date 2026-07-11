import { createAdminClient } from "@/lib/supabase/admin";

export async function getCached<T>(key: string): Promise<T | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("venue_cache")
    .select("payload, expires_at")
    .eq("cache_key", key)
    .maybeSingle();

  if (!data || new Date(data.expires_at) < new Date()) {
    return null;
  }
  return data.payload as T;
}

export async function setCached<T>(key: string, value: T, ttlMs: number): Promise<void> {
  const admin = createAdminClient();
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();
  await admin.from("venue_cache").upsert({ cache_key: key, payload: value, fetched_at: new Date().toISOString(), expires_at: expiresAt }, { onConflict: "cache_key" });
}
