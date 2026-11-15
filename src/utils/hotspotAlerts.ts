import type { CentinelaForecast, CentinelaModel } from '@/types/api/centinela';
import type { Observation } from '@/types/api/observations';
import type { CitizenReport } from '@/stores/citizenReportsStore';

/**
 * Avisos del Bomberito (decisión del usuario 2026-11-15): actividad satelital
 * reciente que es INUSUAL frente al historial del modelo CENTINELA, cruzada con
 * reportes ciudadanos del momento. Son avisos informativos, no alertas oficiales.
 *
 * - Ventana satelital: 24 h contadas desde la detección más reciente cargada
 *   (los satélites llegan con retraso; no se usa el reloj del dispositivo).
 * - Ventana ciudadana: reportes de las últimas 24 h del reloj del dispositivo.
 * - VIIRS y MODIS se cuentan por separado y se comparan cada uno con su producto.
 * - Solo celdas del modelo (caja aprox. de Antioquia); fuera de ella no hay historial.
 */

export const ALERT_WINDOW_HOURS = 24;
/** Frecuencia histórica por debajo de la cual la actividad se considera inusual. */
export const UNUSUAL_HISTORICAL_FREQUENCY = 0.2;
export const MIN_KNOWN_MONTHS = 12;

export type AlertKind = 'satellite-and-citizen' | 'unusual-satellite' | 'citizen-only';

export interface HotspotAlert {
  kind: AlertKind;
  cellId: string;
  /** [lon, lat] del centro de la celda. */
  center: [number, number];
  viirs: number;
  modis: number;
  highFrp: number;
  citizenReports: number;
  /** Frecuencia histórica del producto que disparó el aviso (null si no aplica). */
  historicalFrequency: number | null;
  unusualProducts: string[];
}

const HOUR = 3_600_000;
const SEVERITY: Record<AlertKind, number> = { 'satellite-and-citizen': 3, 'unusual-satellite': 2, 'citizen-only': 1 };
const productFor = (sensor: Observation['sensor']) => sensor === 'MODIS' ? 'MODIS' : 'VIIRS_NOAA20';
/** Los reportes guardan su instante en el id (`reporte-<ms>`). */
const reportTime = (report: CitizenReport) => Number(report.id.replace('reporte-', '')) || null;

function cellOf(cells: CentinelaForecast[], lat: number, lon: number) {
  return cells.find((cell) => lon >= cell.bounds[0] && lon < cell.bounds[2] && lat >= cell.bounds[1] && lat < cell.bounds[3]) ?? null;
}

export function computeHotspotAlerts(observations: Observation[], model: CentinelaModel | undefined, reports: CitizenReport[], now = Date.now()): HotspotAlert[] {
  if (!model) return [];
  const forecasts = model.forecasts;
  const geometry = [...new Map(forecasts.map((item) => [item.cell_id, item])).values()];
  const byCellProduct = new Map(forecasts.map((item) => [`${item.cell_id}|${item.product}`, item]));

  const latest = Math.max(...observations.map((item) => Date.parse(item.acquired_at)).filter(Number.isFinite), -Infinity);
  const recent = Number.isFinite(latest) ? observations.filter((item) => latest - Date.parse(item.acquired_at) <= ALERT_WINDOW_HOURS * HOUR) : [];
  const recentReports = reports.filter((report) => { const time = reportTime(report); return time !== null && now - time <= ALERT_WINDOW_HOURS * HOUR && now >= time; });

  const stats = new Map<string, { cell: CentinelaForecast; viirs: number; modis: number; highFrp: number; citizen: number }>();
  const touch = (cell: CentinelaForecast) => {
    const current = stats.get(cell.cell_id) ?? { cell, viirs: 0, modis: 0, highFrp: 0, citizen: 0 };
    stats.set(cell.cell_id, current);
    return current;
  };
  for (const item of recent) {
    const cell = cellOf(geometry, item.latitude, item.longitude);
    if (!cell) continue;
    const entry = touch(cell);
    if (item.sensor === 'MODIS') entry.modis += 1; else entry.viirs += 1;
    if (item.frp_mw !== null && item.frp_mw >= 30) entry.highFrp += 1;
  }
  for (const report of recentReports) {
    const cell = cellOf(geometry, report.latitude, report.longitude);
    if (cell) touch(cell).citizen += 1;
  }

  const alerts: HotspotAlert[] = [];
  for (const { cell, viirs, modis, highFrp, citizen } of stats.values()) {
    const unusual: { product: string; freq: number }[] = [];
    for (const [sensor, count] of [['VIIRS', viirs], ['MODIS', modis]] as const) {
      if (!count) continue;
      const forecast = byCellProduct.get(`${cell.cell_id}|${productFor(sensor)}`);
      if (forecast && forecast.historical_frequency !== null && forecast.known_months >= MIN_KNOWN_MONTHS && forecast.historical_frequency < UNUSUAL_HISTORICAL_FREQUENCY) unusual.push({ product: sensor, freq: forecast.historical_frequency });
    }
    const satellite = viirs + modis > 0;
    const kind: AlertKind | null = citizen > 0 && satellite ? 'satellite-and-citizen' : unusual.length ? 'unusual-satellite' : citizen > 0 ? 'citizen-only' : null;
    if (!kind) continue;
    alerts.push({
      kind,
      cellId: cell.cell_id,
      center: [(cell.bounds[0] + cell.bounds[2]) / 2, (cell.bounds[1] + cell.bounds[3]) / 2],
      viirs, modis, highFrp, citizenReports: citizen,
      historicalFrequency: unusual.length ? Math.min(...unusual.map((item) => item.freq)) : null,
      unusualProducts: unusual.map((item) => item.product),
    });
  }
  return alerts.sort((a, b) => SEVERITY[b.kind] - SEVERITY[a.kind] || (b.viirs + b.modis) - (a.viirs + a.modis));
}
