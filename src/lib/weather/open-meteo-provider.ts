import type { WeatherForecast, WeatherProvider } from "@/lib/weather/types";

const WMO_CODES: Record<number, { summary: string; icon: string }> = {
  0: { summary: "Clear sky", icon: "☀️" },
  1: { summary: "Mainly clear", icon: "🌤️" },
  2: { summary: "Partly cloudy", icon: "⛅" },
  3: { summary: "Overcast", icon: "☁️" },
  45: { summary: "Foggy", icon: "🌫️" },
  48: { summary: "Foggy", icon: "🌫️" },
  51: { summary: "Light drizzle", icon: "🌦️" },
  53: { summary: "Drizzle", icon: "🌦️" },
  55: { summary: "Heavy drizzle", icon: "🌦️" },
  56: { summary: "Freezing drizzle", icon: "🌦️" },
  57: { summary: "Freezing drizzle", icon: "🌦️" },
  61: { summary: "Light rain", icon: "🌧️" },
  63: { summary: "Rain", icon: "🌧️" },
  65: { summary: "Heavy rain", icon: "🌧️" },
  66: { summary: "Freezing rain", icon: "🌧️" },
  67: { summary: "Freezing rain", icon: "🌧️" },
  71: { summary: "Light snow", icon: "❄️" },
  73: { summary: "Snow", icon: "❄️" },
  75: { summary: "Heavy snow", icon: "❄️" },
  77: { summary: "Snow grains", icon: "❄️" },
  80: { summary: "Rain showers", icon: "🌧️" },
  81: { summary: "Rain showers", icon: "🌧️" },
  82: { summary: "Violent rain showers", icon: "🌧️" },
  85: { summary: "Snow showers", icon: "❄️" },
  86: { summary: "Snow showers", icon: "❄️" },
  95: { summary: "Thunderstorm", icon: "⛈️" },
  96: { summary: "Thunderstorm with hail", icon: "⛈️" },
  99: { summary: "Thunderstorm with hail", icon: "⛈️" },
};

function describeWeatherCode(code: number): { summary: string; icon: string } {
  return WMO_CODES[code] ?? { summary: "Unknown", icon: "🌡️" };
}

class OpenMeteoWeatherProvider implements WeatherProvider {
  async getForecast(lat: number, lng: number, date: string): Promise<WeatherForecast | null> {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", lat.toString());
    url.searchParams.set("longitude", lng.toString());
    url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode");
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("start_date", date);
    url.searchParams.set("end_date", date);

    let res: Response;
    try {
      res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    } catch {
      return null;
    }
    if (!res.ok) return null;

    const data: {
      daily?: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_probability_max: number[];
        weathercode: number[];
      };
    } = await res.json();

    if (!data.daily || data.daily.time.length === 0) {
      return null; // date outside Open-Meteo's forecast range
    }

    const { summary, icon } = describeWeatherCode(data.daily.weathercode[0]);
    return {
      date,
      temperatureMaxC: Math.round(data.daily.temperature_2m_max[0]),
      temperatureMinC: Math.round(data.daily.temperature_2m_min[0]),
      precipitationProbabilityPercent: Math.round(data.daily.precipitation_probability_max[0]),
      summary,
      icon,
    };
  }
}

export function getWeatherProvider(): WeatherProvider {
  return new OpenMeteoWeatherProvider();
}
