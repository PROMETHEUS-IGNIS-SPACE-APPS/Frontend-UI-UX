import type { CentinelaModel } from '@/types/api/centinela';

/** Ruta del artefacto publicado (servido como recurso estático, no por el Backend-API). */
export const CENTINELA_MODEL_PATH = 'models/centinela-v1.json';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

function isModel(value: unknown): value is CentinelaModel {
  return isRecord(value)
    && value.schema_version === 'centinela-v1'
    && typeof value.model_id === 'string'
    && typeof value.trained_at === 'string'
    && Array.isArray(value.forecasts)
    && value.forecasts.every((item) => isRecord(item) && typeof item.cell_id === 'string' && Array.isArray(item.bounds) && item.bounds.length === 4 && isRecord(item.p01) && isRecord(item.p11) && isRecord(item.prediction))
    && isRecord(value.evaluation);
}

export async function fetchCentinelaModel(signal?: AbortSignal): Promise<CentinelaModel> {
  const response = await fetch(`${import.meta.env.BASE_URL}${CENTINELA_MODEL_PATH}`, { signal });
  if (!response.ok) throw new Error(`No se pudo cargar el modelo CENTINELA (HTTP ${response.status}).`);
  const body: unknown = await response.json();
  if (!isModel(body)) throw new Error('El artefacto del modelo CENTINELA no tiene el formato esperado.');
  return body;
}
