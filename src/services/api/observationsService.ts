import { requestJson } from './httpClient';
import type { Observation, ObservationCollection, Sensor } from '@/types/api/observations';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isObservation(value: unknown): value is Observation {
  if (!isRecord(value)) return false;
  return typeof value.observation_id === 'string' && value.observation_id.length > 0
    && (value.sensor === 'MODIS' || value.sensor === 'VIIRS')
    && typeof value.latitude === 'number' && Number.isFinite(value.latitude) && value.latitude >= -90 && value.latitude <= 90
    && typeof value.longitude === 'number' && Number.isFinite(value.longitude) && value.longitude >= -180 && value.longitude <= 180
    && typeof value.acquired_at === 'string'
    && (value.frp_mw === null || (typeof value.frp_mw === 'number' && Number.isFinite(value.frp_mw)))
    && (typeof value.confidence_raw === 'string' || typeof value.confidence_raw === 'number')
    && typeof value.source === 'string';
}

function parseCollection(value: unknown): ObservationCollection {
  if (!isRecord(value) || !Array.isArray(value.data) || !value.data.every(isObservation)
    || typeof value.count !== 'number' || typeof value.total_matching !== 'number'
    || typeof value.data_provenance !== 'string') {
    throw new Error('La respuesta de observaciones no coincide con el contrato esperado del Backend-API.');
  }
  return value as unknown as ObservationCollection;
}

export async function fetchObservations(options: { sensor?: Sensor; limit?: number; signal?: AbortSignal } = {}) {
  const params = new URLSearchParams({ limit: String(Math.min(1000, Math.max(1, options.limit ?? 1000))) });
  if (options.sensor) params.set('sensor', options.sensor);
  const { body } = await requestJson(`/observations?${params}`, { signal: options.signal });
  return parseCollection(body);
}
