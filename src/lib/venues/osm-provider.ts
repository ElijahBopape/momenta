// The published type declarations claim a named export, but the actual
// ESM/CJS builds only expose a default export — import accordingly.
import OpeningHoursImport from "opening_hours";
const OpeningHours = OpeningHoursImport as unknown as new (value: string) => { getState(date?: Date): boolean };
import { getActivity } from "@/design/activities";
import { getCached, setCached } from "@/lib/venues/cache";
import { VenueProviderUnavailableError, type GeocodeResult, type Venue, type VenueSearchParams, type VenueSearchProvider } from "@/lib/venues/types";

const USER_AGENT = "Momenta/1.0 (https://momenta-web.vercel.app)";
const GEOCODE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days — addresses rarely move
const SEARCH_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function isOpenNow(raw: string | null): boolean | null {
  if (!raw) return null;
  try {
    return new OpeningHours(raw).getState();
  } catch {
    return null;
  }
}

function buildAddress(tags: Record<string, string>): string | null {
  const parts = [tags["addr:housenumber"] && tags["addr:street"] ? `${tags["addr:housenumber"]} ${tags["addr:street"]}` : tags["addr:street"], tags["addr:suburb"], tags["addr:city"]].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

function mapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`;
}

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

class OsmVenueSearchProvider implements VenueSearchProvider {
  async geocode(query: string): Promise<GeocodeResult | null> {
    const cacheKey = `geocode:${query.trim().toLowerCase()}`;
    const cached = await getCached<GeocodeResult>(cacheKey);
    if (cached) return cached;

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");

    let res: Response;
    try {
      res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(10000) });
    } catch (err) {
      throw new VenueProviderUnavailableError("Nominatim request failed", { cause: err });
    }
    if (!res.ok) throw new VenueProviderUnavailableError(`Nominatim returned ${res.status}`);

    const results: { lat: string; lon: string; display_name: string }[] = await res.json();
    if (results.length === 0) return null;

    const result: GeocodeResult = {
      lat: parseFloat(results[0].lat),
      lng: parseFloat(results[0].lon),
      displayName: results[0].display_name,
    };
    await setCached(cacheKey, result, GEOCODE_TTL_MS);
    return result;
  }

  async search(params: VenueSearchParams): Promise<Venue[]> {
    const activity = getActivity(params.activityId);
    if (!activity) return [];

    const roundedLat = params.lat.toFixed(3);
    const roundedLng = params.lng.toFixed(3);
    const cacheKey = `search:${roundedLat}:${roundedLng}:${params.radiusMeters}:${activity.id}`;

    let venues = await getCached<Venue[]>(cacheKey);
    if (!venues) {
      const { key, value } = activity.osmTag;
      const query = `[out:json][timeout:25];(node["${key}"="${value}"](around:${params.radiusMeters},${params.lat},${params.lng});way["${key}"="${value}"](around:${params.radiusMeters},${params.lat},${params.lng}););out center tags;`;

      let res: Response;
      try {
        res = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          headers: { "Content-Type": "text/plain", "User-Agent": USER_AGENT },
          body: query,
          signal: AbortSignal.timeout(20000),
        });
      } catch (err) {
        throw new VenueProviderUnavailableError("Overpass request failed", { cause: err });
      }
      if (!res.ok) throw new VenueProviderUnavailableError(`Overpass returned ${res.status}`);

      const data: { elements: OverpassElement[] } = await res.json();
      venues = data.elements
        .filter((el) => el.tags?.name)
        .map((el) => {
          const lat = el.lat ?? el.center?.lat ?? 0;
          const lng = el.lon ?? el.center?.lon ?? 0;
          const tags = el.tags ?? {};
          const openingHoursRaw = tags.opening_hours ?? null;
          return {
            id: `${el.type}/${el.id}`,
            name: tags.name!,
            address: buildAddress(tags),
            lat,
            lng,
            distanceMeters: Math.round(haversineMeters(params.lat, params.lng, lat, lng)),
            openingHoursRaw,
            isOpenNow: isOpenNow(openingHoursRaw),
            mapsUrl: mapsUrl(lat, lng),
          } satisfies Venue;
        });

      await setCached(cacheKey, venues, SEARCH_TTL_MS);
    }

    // isOpenNow depends on the moment of the request, not the cache's age —
    // always recompute from the cached opening_hours string rather than
    // trusting a boolean that may have been baked in hours ago.
    let results = venues
      .map((v) => ({ ...v, isOpenNow: isOpenNow(v.openingHoursRaw) }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
    if (params.openNow) {
      results = results.filter((v) => v.isOpenNow === true);
    }
    return results.slice(0, 30);
  }
}

export function getVenueSearchProvider(): VenueSearchProvider {
  return new OsmVenueSearchProvider();
}
