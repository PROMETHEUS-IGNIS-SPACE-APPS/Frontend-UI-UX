import { requestJson } from './httpClient';
import type { WeatherContext } from '@/types/api/weather';

function isWeatherContext(value: unknown): value is WeatherContext {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<WeatherContext>;
  return typeof item.latitude === 'number'
    && typeof item.longitude === 'number'
    && typeof item.locationName === 'string'
    && typeof item.available === 'boolean'
    && Boolean(item.current && typeof item.current === 'object');
}

export async function fetchWeatherContext(latitude: number, longitude: number, locationName: string, signal?: AbortSignal): Promise<WeatherContext> {
  const query = new URLSearchParams({ lat: String(latitude), lon: String(longitude), name: locationName });
  const response = await requestJson(`/weather?${query.toString()}`, { apiPrefix: '/api', signal });
  if (!isWeatherContext(response.body)) throw new Error('El Backend-API devolvió un contexto meteorológico inválido.');
  return response.body;
}
