export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

export interface VenueSearchParams {
  lat: number;
  lng: number;
  radiusMeters: number;
  activityId: string;
  openNow: boolean;
}

export interface Venue {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  distanceMeters: number;
  openingHoursRaw: string | null;
  isOpenNow: boolean | null;
  mapsUrl: string;
}

export interface VenueSearchProvider {
  geocode(query: string): Promise<GeocodeResult | null>;
  search(params: VenueSearchParams): Promise<Venue[]>;
}

/** Thrown when the underlying free service is unreachable/times out/errors —
 * distinct from a legitimate "no results" response, so callers can show an
 * accurate message instead of implying the search term itself was wrong. */
export class VenueProviderUnavailableError extends Error {}
