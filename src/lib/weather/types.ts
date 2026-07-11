export interface WeatherForecast {
  date: string;
  temperatureMaxC: number;
  temperatureMinC: number;
  precipitationProbabilityPercent: number;
  summary: string;
  icon: string;
}

export interface WeatherProvider {
  getForecast(lat: number, lng: number, date: string): Promise<WeatherForecast | null>;
}
