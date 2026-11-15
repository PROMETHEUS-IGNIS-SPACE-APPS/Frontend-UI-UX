import type { Observation } from '@/types/api/observations';

export type SubregionId = 'bajo_cauca' | 'uraba' | 'nordeste' | 'magdalena_medio' | 'valle_aburra' | 'norte_occidente';

export interface SubregionConfig {
  id: SubregionId;
  label: string;
  color: string;
  dotClass: string;
  center: [number, number];
  zoom: number;
}

/** Agrupación y colores de subregiones tomados de la carpeta Ejemplo. */
export const SUBREGIONS: SubregionConfig[] = [
  { id: 'bajo_cauca', label: 'Bajo Cauca', color: '#F97316', dotClass: 'bg-orange-500', center: [-75.15, 7.75], zoom: 8.7 },
  { id: 'uraba', label: 'Urabá', color: '#06B6D4', dotClass: 'bg-cyan-500', center: [-76.7, 8.05], zoom: 8.6 },
  { id: 'nordeste', label: 'Nordeste', color: '#EAB308', dotClass: 'bg-yellow-500', center: [-74.82, 7.02], zoom: 8.8 },
  { id: 'magdalena_medio', label: 'Magdalena Medio', color: '#3B82F6', dotClass: 'bg-blue-500', center: [-74.3, 6.62], zoom: 8.8 },
  { id: 'valle_aburra', label: 'Valle de Aburrá', color: '#F43F5E', dotClass: 'bg-rose-500', center: [-75.58, 6.24], zoom: 10.6 },
  { id: 'norte_occidente', label: 'Norte & Occidente', color: '#10B981', dotClass: 'bg-emerald-500', center: [-75.8, 6.95], zoom: 8.5 },
];

export const ANTIOQUIA_VIEWPORT = { center: [-75.55, 7.05] as [number, number], zoom: 7.1 };

export const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
export const MONTHS_FULL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

/**
 * Municipios de referencia que el Backend-API usa para etiquetar cada
 * observación (app/utils/geo.py). Rionegro y Sonsón (Oriente) quedan fuera de
 * las seis agrupaciones del ejemplo y se reportan como no clasificados.
 */
const MUNICIPALITY_SUBREGION: Record<string, SubregionId> = {
  caucasia: 'bajo_cauca', 'el bagre': 'bajo_cauca', 'tarazá': 'bajo_cauca', zaragoza: 'bajo_cauca',
  segovia: 'nordeste', remedios: 'nordeste', amalfi: 'nordeste',
  'puerto berrío': 'magdalena_medio', 'yondó': 'magdalena_medio',
  turbo: 'uraba', 'apartadó': 'uraba', 'necoclí': 'uraba', 'mutatá': 'uraba',
  yarumal: 'norte_occidente', 'santa rosa de osos': 'norte_occidente', ituango: 'norte_occidente', dabeiba: 'norte_occidente', frontino: 'norte_occidente',
  'medellín': 'valle_aburra', bello: 'valle_aburra',
};

/**
 * Coordenadas de los municipios de referencia del Backend-API (app/utils/geo.py).
 * El backend asigna a cada punto el MÁS CERCANO de esta lista corta, aunque
 * esté a cientos de kilómetros; aquí se usa para detectar esas asignaciones.
 */
const REFERENCE_COORDS: Record<string, [number, number]> = {
  caucasia: [7.985, -75.195], 'el bagre': [7.601, -74.808], 'tarazá': [7.585, -75.402], zaragoza: [7.491, -74.869],
  segovia: [7.079, -74.701], remedios: [7.027, -74.698], amalfi: [6.911, -75.078],
  'puerto berrío': [6.491, -74.404], 'yondó': [7.045, -74.354],
  turbo: [8.093, -76.728], 'apartadó': [7.883, -76.634], 'necoclí': [8.424, -76.784], 'mutatá': [7.245, -76.435],
  yarumal: [6.963, -75.417], 'santa rosa de osos': [6.647, -75.461], ituango: [7.172, -75.764],
  dabeiba: [7.001, -76.262], frontino: [6.779, -76.131], 'medellín': [6.244, -75.581], bello: [6.337, -75.558],
  rionegro: [6.155, -75.374], 'sonsón': [5.711, -75.311],
  'puerto gaitán': [4.313, -72.081], cumaribo: [4.445, -69.801], 'san vicente del caguán': [2.115, -74.771],
  yopal: [5.337, -72.395], 'san josé del guaviare': [2.572, -72.646], aracataca: [10.591, -74.189],
};

/** Distancia máxima (km) para aceptar el municipio de referencia como ubicación aproximada. */
export const MAX_REFERENCE_DISTANCE_KM = 50;

const municipalityKey = (name: string | null | undefined) => (name ?? '').replace(/^(Sector|Ref\.)\s+/i, '').trim().toLocaleLowerCase('es');

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const rad = Math.PI / 180;
  const a = Math.sin(((lat2 - lat1) * rad) / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lon2 - lon1) * rad) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}

/** Kilómetros entre el punto y su municipio de referencia; null si no se conoce. */
export function referenceDistanceKm(item: { municipality?: string | null; latitude?: number; longitude?: number }): number | null {
  const coords = REFERENCE_COORDS[municipalityKey(item.municipality)];
  if (!coords || item.latitude === undefined || item.longitude === undefined) return null;
  return haversineKm(item.latitude, item.longitude, coords[0], coords[1]);
}

/** El municipio del backend solo se acepta si el punto está a ≤ 50 km de su referencia. */
export function isNearReference(item: { municipality?: string | null; latitude?: number; longitude?: number }) {
  const distance = referenceDistanceKm(item);
  return distance === null || distance <= MAX_REFERENCE_DISTANCE_KM;
}

/** Nombre a mostrar: el municipio de referencia, o «Sin municipio cercano» si el backend lo asignó a más de 50 km. */
export function locationLabel(item: { municipality?: string | null; latitude?: number; longitude?: number }) {
  if (!item.municipality) return 'Sin municipio';
  return isNearReference(item) ? item.municipality : 'Sin municipio cercano';
}

export function resolveSubregion(observation: Pick<Observation, 'municipality' | 'department'> & { latitude?: number; longitude?: number }): SubregionId | null {
  if (observation.department && observation.department !== 'Antioquia') return null;
  if (!isNearReference(observation)) return null;
  return MUNICIPALITY_SUBREGION[municipalityKey(observation.municipality)] ?? null;
}

export interface SubregionMonthlyMatrix {
  counts: Record<SubregionId, number[]>;
  /** FRP promedio mensual; null cuando no hay valores de FRP informados. */
  avgFrp: Record<SubregionId, (number | null)[]>;
  totals: Record<SubregionId, number>;
  /** FRP promedio de toda la subregión; null si ninguna observación informa FRP. */
  overallAvgFrp: Record<SubregionId, number | null>;
  classifiedCount: number;
  unclassifiedAntioquiaCount: number;
}

function emptyRecord<T>(factory: () => T): Record<SubregionId, T> {
  return Object.fromEntries(SUBREGIONS.map((sub) => [sub.id, factory()])) as Record<SubregionId, T>;
}

/** Agrega observaciones por subregión y mes del año (Ene–Dic, sumando años). */
export function computeSubregionMatrix(observations: Observation[]): SubregionMonthlyMatrix {
  const counts = emptyRecord(() => Array<number>(12).fill(0));
  const frpSum = emptyRecord(() => Array<number>(12).fill(0));
  const frpCount = emptyRecord(() => Array<number>(12).fill(0));
  let classifiedCount = 0;
  let unclassifiedAntioquiaCount = 0;

  for (const observation of observations) {
    const id = resolveSubregion(observation);
    if (!id) {
      if (observation.department === 'Antioquia') unclassifiedAntioquiaCount += 1;
      continue;
    }
    const month = Number(observation.acquired_at.slice(5, 7)) - 1;
    if (!Number.isInteger(month) || month < 0 || month > 11) continue;
    classifiedCount += 1;
    counts[id][month] += 1;
    if (observation.frp_mw !== null && Number.isFinite(observation.frp_mw)) {
      frpSum[id][month] += observation.frp_mw;
      frpCount[id][month] += 1;
    }
  }

  const avgFrp = emptyRecord<(number | null)[]>(() => []);
  const totals = emptyRecord(() => 0);
  const overallAvgFrp = emptyRecord<number | null>(() => null);
  for (const sub of SUBREGIONS) {
    avgFrp[sub.id] = counts[sub.id].map((_, month) => frpCount[sub.id][month] ? Number((frpSum[sub.id][month] / frpCount[sub.id][month]).toFixed(1)) : null);
    totals[sub.id] = counts[sub.id].reduce((sum, value) => sum + value, 0);
    const frpN = frpCount[sub.id].reduce((sum, value) => sum + value, 0);
    overallAvgFrp[sub.id] = frpN ? frpSum[sub.id].reduce((sum, value) => sum + value, 0) / frpN : null;
  }

  return { counts, avgFrp, totals, overallAvgFrp, classifiedCount, unclassifiedAntioquiaCount };
}
