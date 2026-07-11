"use client";

import { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { getForecast } from "@/lib/weather/actions";
import type { WeatherForecast } from "@/lib/weather/types";

type State = "prompt" | "loading" | "ready" | "error";

export function WeatherWidget({ date }: { date: string }) {
  const [state, setState] = useState<State>("prompt");
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);

  function handleClick() {
    if (!("geolocation" in navigator)) {
      setState("error");
      return;
    }
    setState("loading");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const result = await getForecast(position.coords.latitude, position.coords.longitude, date);
        if (result) {
          setForecast(result);
          setState("ready");
        } else {
          setState("error");
        }
      },
      () => setState("error"),
      { timeout: 8000 }
    );
  }

  if (state === "prompt") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        <MapPin className="size-3.5" /> Check the forecast
      </button>
    );
  }

  if (state === "loading") {
    return (
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" /> Checking the forecast…
      </p>
    );
  }

  if (state === "error" || !forecast) {
    return <p className="text-xs text-muted-foreground">Couldn&apos;t get a forecast for that date.</p>;
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm">
      <span className="text-2xl">{forecast.icon}</span>
      <div>
        <p className="font-medium">
          {forecast.summary} · {forecast.temperatureMinC}–{forecast.temperatureMaxC}°C
        </p>
        <p className="text-xs text-muted-foreground">{forecast.precipitationProbabilityPercent}% chance of rain</p>
      </div>
    </div>
  );
}
