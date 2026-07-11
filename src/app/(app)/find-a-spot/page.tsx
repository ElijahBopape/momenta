"use client";

import { useState } from "react";
import { MapPin, Clock, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mascot } from "@/components/brand/mascot";
import { ACTIVITIES } from "@/design/activities";
import { searchVenues } from "./actions";
import type { Venue } from "@/lib/venues/types";

const RADIUS_OPTIONS = [
  { label: "1 km", meters: 1000 },
  { label: "2 km", meters: 2000 },
  { label: "5 km", meters: 5000 },
  { label: "10 km", meters: 10000 },
  { label: "25 km", meters: 25000 },
];

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

const selectClassName =
  "h-9 w-full rounded-md border border-border bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export default function FindASpotPage() {
  const [city, setCity] = useState("");
  const [radiusMeters, setRadiusMeters] = useState(RADIUS_OPTIONS[2].meters);
  const [activityId, setActivityId] = useState(ACTIVITIES[0].id);
  const [openNow, setOpenNow] = useState(false);

  const [status, setStatus] = useState<"idle" | "searching" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [venues, setVenues] = useState<Venue[] | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!city.trim()) return;
    setStatus("searching");
    setError(null);
    const result = await searchVenues({ city, radiusMeters, activityId, openNow });
    if (result.ok) {
      setLocationName(result.locationName);
      setVenues(result.venues);
      setStatus("idle");
    } else {
      setError(result.error);
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Find a spot</h1>
        <p className="text-sm text-muted-foreground">
          Search real places on OpenStreetMap — free, no ratings or photos here, but every result links out
          to Google Maps for the full picture.
        </p>
      </div>

      <form onSubmit={handleSearch} className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="city">City or area</Label>
          <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Sandton" required />
          <p className="text-xs text-muted-foreground">Just the suburb or town name works best — skip the &ldquo;City, Province&rdquo; format.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="activity">Activity</Label>
          <select id="activity" className={selectClassName} value={activityId} onChange={(e) => setActivityId(e.target.value)}>
            {ACTIVITIES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.emoji} {a.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="radius">Distance</Label>
          <select id="radius" className={selectClassName} value={radiusMeters} onChange={(e) => setRadiusMeters(Number(e.target.value))}>
            {RADIUS_OPTIONS.map((r) => (
              <option key={r.meters} value={r.meters}>
                Within {r.label}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" checked={openNow} onChange={(e) => setOpenNow(e.target.checked)} className="size-4 rounded border-border" />
          Only show places open now
        </label>
        <Button type="submit" disabled={status === "searching" || !city.trim()} className="rounded-full sm:col-span-2">
          {status === "searching" ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Searching…
            </>
          ) : (
            "Search"
          )}
        </Button>
      </form>

      {status === "error" && error && <p className="text-sm text-destructive">{error}</p>}

      {venues && (
        <div className="space-y-3">
          {locationName && <p className="text-xs text-muted-foreground">Showing results near {locationName}</p>}

          {venues.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-10 text-center">
              <Mascot species="fox" mood="smirk" className="h-20 w-auto" />
              <p className="text-sm text-muted-foreground">No spots found — try a wider radius or a different activity.</p>
            </div>
          )}

          <ul className="space-y-3">
            {venues.map((v) => (
              <li key={v.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{v.name}</p>
                    {v.address && <p className="truncate text-sm text-muted-foreground">{v.address}</p>}
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5" /> {formatDistance(v.distanceMeters)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {v.isOpenNow === true ? "Open now" : v.isOpenNow === false ? "Closed now" : "Hours unknown"}
                      </span>
                    </div>
                  </div>
                  <a
                    href={v.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                  >
                    Map <ExternalLink className="size-3" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
