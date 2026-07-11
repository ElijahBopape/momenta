"use server";

import { getWeatherProvider } from "@/lib/weather/open-meteo-provider";
import type { WeatherForecast } from "@/lib/weather/types";

export async function getForecast(lat: number, lng: number, date: string): Promise<WeatherForecast | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }
  const provider = getWeatherProvider();
  return provider.getForecast(lat, lng, date);
}
