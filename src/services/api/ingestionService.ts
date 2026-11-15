import { requestJson } from './httpClient';
import type { Observation, ObservationCollection, ObservationSourceMode } from '@/types/api/observations';
import type { IngestionResponse } from '@/types/api/ingestion';

interface IngestionQuery {
  sourceMode: ObservationSourceMode;
  from: string;
  to: string;
  region: 'antioquia' | 'antioquia_ideam' | 'colombia';
  signal?: AbortSignal;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isObservation(value: unknown): value is Observation {
  if (!isRecord(value)) return false;
  return typeof value.observation_id === 'string' && value.observation_id.length > 0
    && (value.sensor === 'MODIS' || value.sensor === 'VIIRS')
    && typeof value.latitude === 'number' && Number.isFinite(value.latitude) && value.latitude >= -90 && value.latitude <= 90
    && typeof value.longitude === 'number' && Number.isFinite(value.longitude) && value.longitude >= -180 && value.longitude <= 180
    && typeof value.acquired_at === 'string' && Number.isFinite(Date.parse(value.acquired_at))
    && (value.frp_mw === null || (typeof value.frp_mw === 'number' && Number.isFinite(value.frp_mw)))
    && (typeof value.confidence_raw === 'string' || typeof value.confidence_raw === 'number')
    && typeof value.source === 'string'
    && (value.department === undefined || value.department === null || typeof value.department === 'string')
    && (value.municipality === undefined || value.municipality === null || typeof value.municipality === 'string')
    && (value.daynight === undefined || value.daynight === null || typeof value.daynight === 'string');
}

function parseResponse(value: unknown): IngestionResponse {
  if (!isRecord(value) || value.ok !== true || !Array.isArray(value.observations) || !value.observations.every(isObservation)) {
    throw new Error('La respuesta de ingesta no coincide con el contrato API v0.2.');
  }
  if (value.metadata !== undefined && !isRecord(value.metadata)) {
    throw new Error('Los metadatos de procedencia no tienen el formato esperado.');
  }
  return value as unknown as IngestionResponse;
}

export async function fetchIngestedObservations(query: IngestionQuery): Promise<ObservationCollection> {
  const params = new URLSearchParams();
  params.set('region', query.region);
  let path: string;
  if (query.sourceMode === 'firms') {
    path = `/firms/observations?${params}`;
  } else if (query.sourceMode === 'historical') {
    path = `/fusion/historical-all?${params}`;
  } else {
    params.set('from', query.from);
    params.set('to', query.to);
    path = `/${query.sourceMode}/observations?${params}`;
  }

  const { body } = await requestJson(path, { signal: query.signal, apiPrefix: '/api', timeoutMs: 30_000 });
  const response = parseResponse(body);
  const count = response.observations.length;
  const totalMatching = response.metadata?.deduplicatedCount ?? response.count ?? count;
  const provenance = response.metadata?.source ?? response.source ?? (query.sourceMode === 'firms' ? 'NASA FIRMS NRT' : query.sourceMode.toUpperCase());

  return {
    data: response.observations,
    count,
    total_matching: totalMatching,
    data_provenance: provenance,
    warning: response.warning ?? null,
    degradedMode: response.degradedMode ?? false,
    sourceMode: query.sourceMode,
    ...(query.sourceMode === 'historical' ? {
      sampling: {
        from: response.metadata?.from,
        to: response.metadata?.to,
        rawCount: response.metadata?.rawCount,
        deduplicatedCount: response.metadata?.deduplicatedCount,
        filesLoaded: response.metadata?.filesLoaded,
        attribution: response.metadata?.attribution,
      },
    } : {}),
  };
}
