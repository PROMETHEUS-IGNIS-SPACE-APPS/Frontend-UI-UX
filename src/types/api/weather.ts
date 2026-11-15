export interface WeatherContext {
  latitude: number;
  longitude: number;
  locationName: string;
  fetchedAt: string;
  timezone: string;
  current: {
    temperatureC: number | null;
    relativeHumidityPct: number | null;
    precipitationMm: number | null;
    windSpeedKmh: number | null;
    windDirectionDeg: number | null;
  };
  dailyRecent: Array<{
    date: string;
    precipitationSumMm: number | null;
    tempMaxC: number | null;
  }>;
  available: boolean;
  sourceName: string;
  note: string;
}
