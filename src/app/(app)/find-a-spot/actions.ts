"use server";

import { z } from "zod";
import { getVenueSearchProvider } from "@/lib/venues/osm-provider";
import { ACTIVITIES } from "@/design/activities";
import { VenueProviderUnavailableError, type Venue } from "@/lib/venues/types";
import { checkRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

const activityIds = ACTIVITIES.map((a) => a.id) as [string, ...string[]];

const searchSchema = z.object({
  city: z.string().trim().min(1, "Enter a city or area.").max(100),
  radiusMeters: z.number().int().min(500).max(50000),
  activityId: z.enum(activityIds),
  openNow: z.boolean(),
});

export type SearchInput = z.infer<typeof searchSchema>;
export type SearchResult = { ok: true; locationName: string; venues: Venue[] } | { ok: false; error: string };

const UNAVAILABLE_MESSAGE = "The map search is temporarily unavailable — it's a free public service, so this happens occasionally. Try again in a moment.";

export async function searchVenues(input: SearchInput): Promise<SearchResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Log in to search." };
  }

  const allowed = await checkRateLimit(`find-a-spot:${user.id}`, 20, 10 * 60 * 1000);
  if (!allowed) {
    return { ok: false, error: "Too many searches — wait a few minutes and try again." };
  }

  const parsed = searchSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const provider = getVenueSearchProvider();

  try {
    const location = await provider.geocode(parsed.data.city);
    if (!location) {
      return { ok: false, error: `Couldn't find "${parsed.data.city}" — try a more specific place name.` };
    }

    const venues = await provider.search({
      lat: location.lat,
      lng: location.lng,
      radiusMeters: parsed.data.radiusMeters,
      activityId: parsed.data.activityId,
      openNow: parsed.data.openNow,
    });

    return { ok: true, locationName: location.displayName, venues };
  } catch (err) {
    if (err instanceof VenueProviderUnavailableError) {
      console.error("venue search provider unavailable", err);
      return { ok: false, error: UNAVAILABLE_MESSAGE };
    }
    throw err;
  }
}
