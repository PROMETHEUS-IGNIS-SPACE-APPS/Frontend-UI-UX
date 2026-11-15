import { useQuery } from '@tanstack/react-query';
import { fetchCentinelaModel } from '@/services/models/centinelaModelService';
import type { CentinelaEstimate, CentinelaForecast } from '@/types/api/centinela';
import { nearestReferenceName } from '@/utils/subregions';

/** Etiqueta para valores que el modelo no publica (se conservan como no disponibles). */
export const CENTINELA_UNKNOWN = 'Datos insuficientes';

export const pctOrUnknown = (value: number | null | undefined) => value === null || value === undefined ? CENTINELA_UNKNOWN : `${(value * 100).toFixed(1)} %`;
export const intervalText = (estimate: CentinelaEstimate) => estimate.interval_95 ? `IC 95 %: ${pctOrUnknown(estimate.interval_95[0])} – ${pctOrUnknown(estimate.interval_95[1])}` : 'Sin intervalo';
export const productLabel = (product: string) => product === 'VIIRS_NOAA20' ? 'VIIRS NOAA-20' : product;
export const cellCenter = (forecast: CentinelaForecast): [number, number] => [(forecast.bounds[0] + forecast.bounds[2]) / 2, (forecast.bounds[1] + forecast.bounds[3]) / 2];

export function cellName(forecast: CentinelaForecast) {
  const [lon, lat] = cellCenter(forecast);
  const near = nearestReferenceName(lat, lon);
  return `${near ? `Cerca de ${near}` : 'Celda'} (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
}

/** Artefacto publicado del modelo CENTINELA (una sola descarga por sesión). */
export function useCentinelaModel(enabled = true) {
  return useQuery({ queryKey: ['centinela-model'], queryFn: ({ signal }) => fetchCentinelaModel(signal), staleTime: Infinity, enabled });
}
