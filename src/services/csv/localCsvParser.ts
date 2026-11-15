import type { Observation, Sensor } from '@/types/api/observations';

export type LocalCsvFormat = 'IDEAM' | 'NASA_FIRMS';

export interface LocalCsvParseResult {
  format: LocalCsvFormat | null;
  observations: Observation[];
  /** Filas descartadas: coordenadas o fechas inválidas, o sensor no reconocido. */
  skipped: number;
  error?: string;
}

function splitLines(text: string) {
  return text.replace(/\r\n?/g, '\n').split('\n').filter((line) => line.trim().length > 0);
}

/** Número con coma o punto decimal (los archivos IDEAM usan coma). */
export function parseLocaleDecimal(raw: string | undefined): number | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  const value = Number(trimmed.replace(/\s+/g, '').replace(',', '.'));
  return Number.isFinite(value) ? value : null;
}

/** Hora local de Colombia (UTC-5, `AAAA-MM-DD HH:MM`) a ISO UTC, sin depender de la zona del equipo. */
export function colombiaLocalToUtcIso(raw: string): string | null {
  const match = raw.trim().match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return null;
  const [, y, mo, d, h, mi, s] = match;
  const ms = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h) + 5, Number(mi), Number(s ?? '0'));
  return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
}

const validCoordinates = (lat: number | null, lon: number | null): lat is number => lat !== null && lon !== null && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;

function ideamSensor(fuente: string): { sensor: Sensor; satellite: string } | null {
  const upper = fuente.toUpperCase();
  if (upper.includes('MODIS')) return { sensor: 'MODIS', satellite: upper.includes('AQUA') ? 'Aqua' : upper.includes('TERRA') ? 'Terra' : 'Terra/Aqua' };
  if (upper.includes('VIIRS')) {
    const satellite = /NOAA-?21|N21/.test(upper) ? 'NOAA-21' : /NOAA-?20|N20/.test(upper) ? 'NOAA-20' : 'Suomi-NPP';
    return { sensor: 'VIIRS', satellite };
  }
  return null;
}

/** Archivos diarios IDEAM `Puntos_de_calor_Colombia_AAAA-MM-DD.csv`: `;`, coma decimal, hora UTC-5. */
function parseIdeam(lines: string[], fileName: string): LocalCsvParseResult {
  const delimiter = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase());
  const find = (test: (h: string) => boolean) => headers.findIndex(test);
  const iDate = find((h) => h.includes('fecha'));
  const iLat = find((h) => h === 'lat' || h === 'latitude' || h === 'latitud');
  const iLon = find((h) => h === 'lon' || h === 'longitude' || h === 'longitud');
  const iSource = find((h) => h.includes('fuente'));
  const iFrp = find((h) => h.includes('radiación') || h.includes('radiacion') || h.includes('frp'));
  const iConf = find((h) => h.includes('confianza'));
  const iDayNight = find((h) => h.includes('captura') || h.includes('dia-noche') || h.includes('día-noche'));
  if (iDate < 0 || iLat < 0 || iLon < 0) return { format: 'IDEAM', observations: [], skipped: 0, error: 'Faltan columnas de fecha, latitud o longitud.' };

  const observations: Observation[] = [];
  let skipped = 0;
  for (const line of lines.slice(1)) {
    const cols = line.split(delimiter);
    const lat = parseLocaleDecimal(cols[iLat]);
    const lon = parseLocaleDecimal(cols[iLon]);
    const acquired = colombiaLocalToUtcIso(cols[iDate] ?? '');
    const sensorInfo = ideamSensor(iSource >= 0 ? cols[iSource] ?? '' : '');
    if (!validCoordinates(lat, lon) || lon === null || !acquired || !sensorInfo) { skipped += 1; continue; }
    const dn = (iDayNight >= 0 ? cols[iDayNight] ?? '' : '').trim().toUpperCase();
    observations.push({
      observation_id: `CSV_IDEAM_${sensorInfo.sensor}_${acquired}_${lat.toFixed(4)}_${lon.toFixed(4)}`,
      sensor: sensorInfo.sensor,
      satellite: sensorInfo.satellite,
      latitude: Number(lat.toFixed(5)),
      longitude: Number(lon.toFixed(5)),
      acquired_at: acquired,
      frp_mw: iFrp >= 0 ? parseLocaleDecimal(cols[iFrp]) : null,
      confidence_raw: (iConf >= 0 ? cols[iConf]?.trim() : '') || 'No informada',
      daynight: dn === 'D' || dn === 'N' ? dn : null,
      department: null,
      municipality: null,
      source: `CSV local · IDEAM (${fileName})`,
      source_origin: 'CSV_LOCAL',
      reference_url: 'https://puntosdecalor.ideam.gov.co/archivos-csv/',
      is_synthetic: false,
    });
  }
  return { format: 'IDEAM', observations, skipped };
}

const FIRMS_SATELLITES: Record<string, { sensor: Sensor; satellite: string }> = {
  T: { sensor: 'MODIS', satellite: 'Terra' }, TERRA: { sensor: 'MODIS', satellite: 'Terra' },
  A: { sensor: 'MODIS', satellite: 'Aqua' }, AQUA: { sensor: 'MODIS', satellite: 'Aqua' },
  N: { sensor: 'VIIRS', satellite: 'Suomi-NPP' }, NPP: { sensor: 'VIIRS', satellite: 'Suomi-NPP' },
  N20: { sensor: 'VIIRS', satellite: 'NOAA-20' }, '1': { sensor: 'VIIRS', satellite: 'NOAA-20' },
  N21: { sensor: 'VIIRS', satellite: 'NOAA-21' }, '2': { sensor: 'VIIRS', satellite: 'NOAA-21' },
};

/** CSV de NASA FIRMS (Area API o descargas regionales), horas en UTC. */
function parseFirms(lines: string[], fileName: string): LocalCsvParseResult {
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const idx = (name: string) => headers.indexOf(name);
  const iLat = idx('latitude'), iLon = idx('longitude'), iDate = idx('acq_date'), iTime = idx('acq_time');
  const iSat = idx('satellite'), iInst = idx('instrument'), iConf = idx('confidence'), iFrp = idx('frp'), iDn = idx('daynight');
  const hasViirsBands = headers.includes('bright_ti4');
  const observations: Observation[] = [];
  let skipped = 0;

  for (const line of lines.slice(1)) {
    const cols = line.split(',');
    const lat = parseLocaleDecimal(cols[iLat]);
    const lon = parseLocaleDecimal(cols[iLon]);
    const date = (cols[iDate] ?? '').trim();
    const time = (iTime >= 0 ? cols[iTime] ?? '' : '').trim().padStart(4, '0');
    const acquiredMs = Date.parse(`${date}T${time.slice(0, 2)}:${time.slice(2, 4)}:00Z`);
    const satRaw = (iSat >= 0 ? cols[iSat] ?? '' : '').trim().toUpperCase();
    const instrument = (iInst >= 0 ? cols[iInst] ?? '' : '').trim().toUpperCase();
    const known = FIRMS_SATELLITES[satRaw];
    const sensor: Sensor | null = instrument.includes('VIIRS') ? 'VIIRS' : instrument.includes('MODIS') ? 'MODIS' : known?.sensor ?? (hasViirsBands ? 'VIIRS' : null);
    if (!validCoordinates(lat, lon) || lon === null || !Number.isFinite(acquiredMs) || !sensor) { skipped += 1; continue; }
    const acquired = new Date(acquiredMs).toISOString();
    const dn = (iDn >= 0 ? cols[iDn] ?? '' : '').trim().toUpperCase();
    observations.push({
      observation_id: `CSV_FIRMS_${sensor}_${acquired}_${lat.toFixed(4)}_${lon.toFixed(4)}`,
      sensor,
      satellite: known?.satellite ?? (satRaw || null),
      latitude: Number(lat.toFixed(5)),
      longitude: Number(lon.toFixed(5)),
      acquired_at: acquired,
      frp_mw: iFrp >= 0 ? parseLocaleDecimal(cols[iFrp]) : null,
      confidence_raw: (iConf >= 0 ? cols[iConf]?.trim() : '') || 'No informada',
      daynight: dn === 'D' || dn === 'N' ? dn : null,
      department: null,
      municipality: null,
      source: `CSV local · NASA FIRMS (${fileName})`,
      source_origin: 'CSV_LOCAL',
      reference_url: 'https://firms.modaps.eosdis.nasa.gov/',
      is_synthetic: false,
    });
  }
  return { format: 'NASA_FIRMS', observations, skipped };
}

/** Detecta el formato por encabezados y convierte las filas al modelo Observation. */
export function parseLocalCsv(text: string, fileName: string): LocalCsvParseResult {
  const lines = splitLines(text.startsWith(String.fromCharCode(0xfeff)) ? text.slice(1) : text);
  if (lines.length < 2) return { format: null, observations: [], skipped: 0, error: 'El archivo no tiene filas de datos.' };
  const header = lines[0].toLowerCase();
  if (header.includes('acq_date') && header.includes('latitude')) return parseFirms(lines, fileName);
  if (header.includes('fecha')) return parseIdeam(lines, fileName);
  return { format: null, observations: [], skipped: 0, error: 'Formato no reconocido: se esperan encabezados de IDEAM (fecha; lat; lon; fuente) o de NASA FIRMS (latitude, longitude, acq_date).' };
}
