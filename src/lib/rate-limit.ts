import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Fixed-window rate limit backed by Postgres (no external service — see
 * migration 0007). Returns true and records the hit if under the limit,
 * false if the bucket is already at capacity. Also prunes hits older than
 * the window for the bucket being checked, so the table doesn't grow
 * unbounded without needing a separate cleanup job.
 */
export async function checkRateLimit(bucketKey: string, maxHits: number, windowMs: number): Promise<boolean> {
  const admin = createAdminClient();
  const windowStart = new Date(Date.now() - windowMs).toISOString();

  await admin.from("rate_limit_hits").delete().eq("bucket_key", bucketKey).lt("created_at", windowStart);

  const { count } = await admin
    .from("rate_limit_hits")
    .select("id", { count: "exact", head: true })
    .eq("bucket_key", bucketKey)
    .gte("created_at", windowStart);

  if ((count ?? 0) >= maxHits) {
    return false;
  }

  await admin.from("rate_limit_hits").insert({ bucket_key: bucketKey });
  return true;
}

/** Best-effort — trusts the platform-set forwarded-for header (Vercel sets
 * this reliably); falls back to a constant bucket if it's ever missing so
 * the check still degrades to a shared limit rather than throwing. */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return "unknown";
}
