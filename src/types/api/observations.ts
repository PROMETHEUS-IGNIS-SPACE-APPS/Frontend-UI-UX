export type Sensor = 'MODIS' | 'VIIRS';

export interface Observation {
  observation_id: string;
  sensor: Sensor;
  latitude: number;
  longitude: number;
  acquired_at: string;
  frp_mw: number | null;
  confidence_raw: string | number;
  source: string;
  department?: string | null;
  municipality?: string | null;
  daynight?: string | null;
  satellite?: string | null;
  source_origin?: 'IDEAM' | 'NASA_FIRMS' | string;
  reference_url?: string | null;
  is_synthetic?: boolean;
  concordance?: string | null;
  brightness_k?: number | null;
  /** Tamaño del píxel a lo largo del barrido y de la trayectoria (km), cuando la fuente lo informa. */
  scan_km?: number | null;
  track_km?: number | null;
}

export interface ObservationCollection {
  data: Observation[];
  count: number;
  total_matching: number;
  data_provenance: string;
  warning?: string | null;
  degradedMode?: boolean;
  sourceMode?: ObservationSourceMode;
  sampling?: ObservationSamplingInfo;
}

export type ObservationSourceMode = 'fusion' | 'ideam' | 'firms' | 'historical';

export interface ObservationSamplingInfo {
  from?: string;
  to?: string;
  rawCount?: number;
  deduplicatedCount?: number;
  filesLoaded?: string[];
  attribution?: string;
}
