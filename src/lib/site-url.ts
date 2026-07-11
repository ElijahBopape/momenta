/**
 * Canonical origin for building auth redirect URLs. Explicit env var wins;
 * otherwise Vercel's system env vars give a stable production domain
 * (VERCEL_PROJECT_PRODUCTION_URL) even across preview deployments, which
 * matters because Supabase's auth redirect allow-list is keyed on exact URLs.
 */
export function getSiteURL(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
